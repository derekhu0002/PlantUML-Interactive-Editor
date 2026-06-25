// Concern D: Bidirectional Sync Engine — fingerprint matching
// Implements app-concern-d: Bidirectional Sync Engine
// See src/sync/ARCHITECTURE.md for contract

import { DiagramNode } from '../model/types';

export interface Fingerprint {
  /** The unique fingerprint string for a node. */
  key: string;
  /** The node type. */
  type: string;
  /** The node label (if any). */
  label?: string;
  /** Nesting path (parent container IDs). */
  nestingPath: string[];
}

/**
 * Computes and matches fingerprints for elements across re-parses.
 * Fingerprint = node type + label + nesting path.
 * This preserves element positions when re-importing .puml files.
 */
export class FingerprintMatcher {
  private fingerprintMap: Map<string, { x: number; y: number }> = new Map();

  /**
   * Compute a fingerprint for a diagram node.
   * The fingerprint is based on node type, label, and nesting path.
   */
  computeFingerprint(node: DiagramNode, nestingPath: string[] = []): Fingerprint {
    const label = 'label' in node ? (node as any).label : undefined;
    const key = this.buildKey(node.type, label, nestingPath);

    return {
      key,
      type: node.type,
      label,
      nestingPath,
    };
  }

  /**
   * Build a unique string key from node type, label, and nesting path.
   */
  private buildKey(type: string, label: string | undefined, nestingPath: string[]): string {
    const parts = [...nestingPath, type, label || ''];
    return parts.join(':');
  }

  /**
   * Index positions from a list of existing nodes.
   * Call this before re-parsing to save current positions.
   */
  indexPositions(nodes: DiagramNode[]): void {
    this.fingerprintMap.clear();
    this.indexNodesRecursive(nodes, []);
  }

  /**
   * Recursively index node positions including children of containers.
   */
  private indexNodesRecursive(nodes: DiagramNode[], parentPath: string[]): void {
    for (const node of nodes) {
      const fingerprint = this.computeFingerprint(node, parentPath);
      this.fingerprintMap.set(fingerprint.key, {
        x: node.position.x,
        y: node.position.y,
      });

      // Recursively index children
      if ('children' in node && Array.isArray((node as any).children)) {
        this.indexNodesRecursive(
          (node as any).children,
          [...parentPath, node.id]
        );
      }
      if ('thenBranch' in node && (node as any).thenBranch?.children) {
        this.indexNodesRecursive(
          (node as any).thenBranch.children,
          [...parentPath, node.id, 'then']
        );
      }
      if ('elseBranch' in node && (node as any).elseBranch?.children) {
        this.indexNodesRecursive(
          (node as any).elseBranch.children,
          [...parentPath, node.id, 'else']
        );
      }
      if ('body' in node && (node as any).body?.children) {
        this.indexNodesRecursive(
          (node as any).body.children,
          [...parentPath, node.id, 'body']
        );
      }
      if ('branches' in node && Array.isArray((node as any).branches)) {
        (node as any).branches.forEach((branch: any, idx: number) => {
          if (branch?.children) {
            this.indexNodesRecursive(
              branch.children,
              [...parentPath, node.id, `branch_${idx}`]
            );
          }
        });
      }
      if ('cases' in node && Array.isArray((node as any).cases)) {
        (node as any).cases.forEach((c: any, idx: number) => {
          if (c?.body?.children) {
            this.indexNodesRecursive(
              c.body.children,
              [...parentPath, node.id, `case_${idx}`]
            );
          }
        });
      }
    }
  }

  /**
   * Try to restore the position for a node from previously indexed fingerprints.
   * Returns the position if found, or the default position if not found.
   */
  restorePosition(
    node: DiagramNode,
    nestingPath: string[] = [],
    defaultPosition: { x: number; y: number } = { x: 0, y: 0 }
  ): { x: number; y: number } {
    const fingerprint = this.computeFingerprint(node, nestingPath);
    const saved = this.fingerprintMap.get(fingerprint.key);
    return saved || defaultPosition;
  }

  /**
   * Apply saved positions to a list of new nodes.
   * New/changed elements without matching fingerprints get default grid placement.
   */
  applyPositions(
    newNodes: DiagramNode[],
    gridStartX: number = 50,
    gridStartY: number = 50,
    gridSpacingX: number = 200,
    gridSpacingY: number = 100
  ): DiagramNode[] {
    let gridIndex = 0;

    return newNodes.map((node) => {
      const saved = this.restorePosition(node, []);
      if (saved.x !== 0 || saved.y !== 0) {
        return { ...node, position: { ...saved } };
      }

      // Default grid placement for unmatched nodes
      const col = gridIndex % 4;
      const row = Math.floor(gridIndex / 4);
      gridIndex++;
      return {
        ...node,
        position: {
          x: gridStartX + col * gridSpacingX,
          y: gridStartY + row * gridSpacingY,
        },
      };
    });
  }

  /** Clear all stored positions. */
  clear(): void {
    this.fingerprintMap.clear();
  }
}
