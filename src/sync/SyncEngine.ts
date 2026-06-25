// Concern D: Bidirectional Sync Engine — main sync class
// Implements app-concern-d: Bidirectional Sync Engine
// See src/sync/ARCHITECTURE.md for contract

import { DiagramModel, DiagramNode, EdgeData } from '../model/types';
import { parse } from '../parser/parser';
import { generate } from '../generator/generator';
import { ConflictResolver } from './ConflictResolver';
import { FingerprintMatcher } from './FingerprintMatcher';
import { SidecarStore } from './SidecarStore';

export type SyncDirection = 'canvas-to-code' | 'code-to-canvas';
export type SyncCallback = (model: DiagramModel, source: SyncDirection) => void;

/**
 * Main SyncEngine class managing bidirectional canvas↔code synchronization.
 * Features:
 * - Subscribe/notify pattern for canvas and editor events
 * - Version counter + timestamp for last-write-wins conflict resolution
 * - 200ms debounce on both directions
 * - Guard against infinite sync loops (skip if incoming matches current)
 * - Fingerprint matching for position preservation across re-parses
 */
export class SyncEngine {
  private model: DiagramModel;
  private conflictResolver: ConflictResolver;
  private fingerprintMatcher: FingerprintMatcher;
  private sidecarStore: SidecarStore;
  private subscribers: Set<SyncCallback> = new Set();
  private lastCanvasModel: string = '';
  private lastCodeText: string = '';
  private currentPumlPath: string | null = null;
  private syncEnabled: boolean = true;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly debounceMs: number = 200;

  constructor() {
    this.model = { nodes: [], edges: [] };
    this.conflictResolver = new ConflictResolver();
    this.fingerprintMatcher = new FingerprintMatcher();
    this.sidecarStore = new SidecarStore();
    this.lastCanvasModel = JSON.stringify(this.model);
    this.lastCodeText = '';
  }

  /**
   * Subscribe to sync events.
   * Returns an unsubscribe function.
   */
  subscribe(callback: SyncCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers with the current model.
   */
  private notify(source: SyncDirection): void {
    for (const cb of this.subscribers) {
      cb(this.model, source);
    }
  }

  /**
   * Handle a canvas change event.
   * Triggered when nodes or edges change on the ReactFlow canvas.
   */
  handleCanvasChange(nodes: any[], edges: any[]): void {
    if (!this.syncEnabled) return;

    // Debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      // Apply conflict resolution
      if (!this.conflictResolver.shouldApply('canvas', this.debounceMs)) {
        return;
      }

      // Convert ReactFlow nodes/edges to DiagramModel
      const modelNodes: DiagramNode[] = nodes.map((n) => ({
        id: n.id,
        type: n.type || 'activity',
        position: n.position || { x: 0, y: 0 },
        width: n.width || 140,
        height: n.height || 50,
        ...n.data,
      }));

      const modelEdges: EdgeData[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }));

      this.model = { nodes: modelNodes, edges: modelEdges };

      // Guard against infinite loops: skip if model hasn't changed
      const modelStr = JSON.stringify(this.model);
      if (modelStr === this.lastCanvasModel) return;
      this.lastCanvasModel = modelStr;

      // Update code text
      this.lastCodeText = generate(this.model);

      // Notify subscribers (editor should update)
      this.notify('canvas-to-code');
    }, this.debounceMs);
  }

  /**
   * Handle an editor/code change event.
   * Triggered when the Ace Editor content changes.
   */
  handleEditorChange(content: string): void {
    if (!this.syncEnabled) return;

    // Debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      // Guard against infinite loops
      if (content === this.lastCodeText) return;
      this.lastCodeText = content;

      // Apply conflict resolution
      if (!this.conflictResolver.shouldApply('editor', this.debounceMs)) {
        return;
      }

      // Parse code to model
      const parsedModel = parse(content);

      // Before replacing, index old positions for fingerprint matching
      this.fingerprintMatcher.indexPositions(this.model.nodes);

      // Apply saved positions where fingerprints match
      parsedModel.nodes = this.fingerprintMatcher.applyPositions(parsedModel.nodes);

      this.model = parsedModel;

      // Update canvas representation
      const modelStr = JSON.stringify(this.model);
      if (modelStr === this.lastCanvasModel) return;
      this.lastCanvasModel = modelStr;

      // Notify subscribers (canvas should update)
      this.notify('code-to-canvas');
    }, this.debounceMs);
  }

  /**
   * Get the current diagram model.
   */
  getModel(): DiagramModel {
    return { ...this.model, nodes: [...this.model.nodes], edges: [...this.model.edges] };
  }

  /**
   * Set the current diagram model directly (e.g., after loading a file).
   */
  setModel(model: DiagramModel): void {
    this.model = model;
    this.lastCanvasModel = JSON.stringify(model);
    this.lastCodeText = generate(model);
    this.conflictResolver.reset();
  }

  /**
   * Get the current generated PlantUML code.
   */
  getCode(): string {
    return this.lastCodeText || generate(this.model);
  }

  /**
   * Set the current code directly (e.g., after loading a .puml file).
   */
  setCode(code: string): void {
    this.lastCodeText = code;
    const parsed = parse(code);
    this.fingerprintMatcher.indexPositions(this.model.nodes);
    parsed.nodes = this.fingerprintMatcher.applyPositions(parsed.nodes);
    this.model = parsed;
    this.lastCanvasModel = JSON.stringify(this.model);
    this.conflictResolver.reset();
  }

  /**
   * Set the current .puml file path for sidecar operations.
   */
  setPumlPath(pumlPath: string | null): void {
    this.currentPumlPath = pumlPath;

    // Load sidecar if it exists
    if (pumlPath) {
      const sidecar = this.sidecarStore.load(pumlPath);
      if (sidecar) {
        // Apply saved positions
        for (const node of this.model.nodes) {
          const saved = sidecar.positions[node.id];
          if (saved) {
            node.position = { ...saved };
          }
        }
        this.lastCanvasModel = JSON.stringify(this.model);
      }
    }
  }

  /**
   * Save positions to the sidecar file.
   */
  savePositions(): void {
    if (!this.currentPumlPath) return;

    const positions: Record<string, { x: number; y: number }> = {};
    for (const node of this.model.nodes) {
      positions[node.id] = { ...node.position };
    }

    this.sidecarStore.save(this.currentPumlPath, positions);
  }

  /**
   * Enable or disable sync temporarily (e.g., during bulk updates).
   */
  setSyncEnabled(enabled: boolean): void {
    this.syncEnabled = enabled;
  }

  /**
   * Reset the sync engine to initial state.
   */
  reset(): void {
    this.model = { nodes: [], edges: [] };
    this.lastCanvasModel = JSON.stringify(this.model);
    this.lastCodeText = '';
    this.conflictResolver.reset();
    this.fingerprintMatcher.clear();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
