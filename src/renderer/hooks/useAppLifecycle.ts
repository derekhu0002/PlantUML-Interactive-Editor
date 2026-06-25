// Renderer Integration — app lifecycle hook
// Implements biz-service-editing: Diagram Editing Service
// See src/renderer/ARCHITECTURE.md for contract

import { useCallback, useState } from 'react';
import type { DiagramModel } from '../../model/types';
import { SyncEngine } from '../../sync/SyncEngine';

export interface AppState {
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  model: DiagramModel;
  code: string;
  isDirty: boolean;
}

/**
 * Hook managing the application lifecycle:
 * - New diagram creation
 * - File open (import .puml)
 * - File save (export .puml)
 * - File export (export .png)
 */
export function useAppLifecycle(syncEngine: SyncEngine | null) {
  const [state, setState] = useState<AppState>({
    currentFilePath: null,
    hasUnsavedChanges: false,
    model: { nodes: [], edges: [] },
    code: '',
    isDirty: false,
  });

  /**
   * Create a new blank diagram.
   */
  const newDiagram = useCallback(() => {
    const emptyModel: DiagramModel = { nodes: [], edges: [] };
    const emptyCode = '@startuml\n@enduml\n';

    if (syncEngine) {
      syncEngine.reset();
      syncEngine.setModel(emptyModel);
    }

    setState({
      currentFilePath: null,
      hasUnsavedChanges: false,
      model: emptyModel,
      code: emptyCode,
      isDirty: false,
    });
  }, [syncEngine]);

  /**
   * Open a .puml file.
   * Uses the Electron file dialog if available, otherwise reads from the provided path.
   */
  const openFile = useCallback(async () => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.openPumlDialog();
    if (!result) return;

    const { content, filePath } = result;

    if (syncEngine) {
      syncEngine.reset();
      syncEngine.setPumlPath(filePath);
      syncEngine.setCode(content);
    }

    setState({
      currentFilePath: filePath,
      hasUnsavedChanges: false,
      model: syncEngine ? syncEngine.getModel() : { nodes: [], edges: [] },
      code: content,
      isDirty: false,
    });
  }, [syncEngine]);

  /**
   * Export current diagram as .puml file.
   */
  const exportPuml = useCallback(async () => {
    if (!window.electronAPI) return;

    const code = syncEngine ? syncEngine.getCode() : state.code;
    await window.electronAPI.savePumlDialog(code);

    setState((prev) => ({ ...prev, hasUnsavedChanges: false, isDirty: false }));
  }, [syncEngine, state.code]);

  /**
   * Export current diagram as .png via the Python backend.
   */
  const exportPng = useCallback(async () => {
    if (!window.electronAPI) return;

    const code = syncEngine ? syncEngine.getCode() : state.code;

    // Generate PNG via Python backend (or fallback)
    try {
      const response = await fetch('http://localhost:5001/renderPNG', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: code,
      });

      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        await window.electronAPI.savePngDialog(dataUrl);
      } else {
        // Fallback: try SVG render
        const svgResponse = await fetch('http://localhost:5001/render', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: code,
        });

        if (svgResponse.ok) {
          const svg = await svgResponse.text();
          await window.electronAPI.savePumlDialog(svg);
        }
      }
    } catch {
      console.warn('Python backend not available. Export .png requires the backend.');
    }
  }, [syncEngine, state.code]);

  /**
   * Undo last canvas action (delegated to canvas via event).
   */
  const undo = useCallback(() => {
    // Canvas undo is handled by ReactFlow's built-in undo/redo
    document.dispatchEvent(new CustomEvent('app:undo'));
  }, []);

  /**
   * Redo last canvas action.
   */
  const redo = useCallback(() => {
    document.dispatchEvent(new CustomEvent('app:redo'));
  }, []);

  return {
    state,
    newDiagram,
    openFile,
    exportPuml,
    exportPng,
    undo,
    redo,
    setState,
  };
}
