// Concern D: Bidirectional Sync Engine — conflict resolution
// Implements app-concern-d: Bidirectional Sync Engine
// See src/sync/ARCHITECTURE.md for contract

export interface SyncTimestamp {
  /** Unix timestamp (ms) of the last modification. */
  timestamp: number;
  /** Monotonically increasing version counter. */
  version: number;
  /** Source of the change: 'canvas' | 'editor'. */
  source: 'canvas' | 'editor';
}

export interface SyncState {
  canvas: SyncTimestamp;
  editor: SyncTimestamp;
}

export type ConflictWinner = 'canvas' | 'editor' | 'none';

/**
 * Last-write-wins conflict resolution with timestamp comparison.
 * The later modification (by timestamp) wins and regenerates the other representation.
 * If timestamps are equal, the version counter breaks the tie.
 */
export class ConflictResolver {
  private state: SyncState;

  constructor() {
    this.state = {
      canvas: { timestamp: 0, version: 0, source: 'canvas' },
      editor: { timestamp: 0, version: 0, source: 'editor' },
    };
  }

  /**
   * Record a canvas change and determine if it should propagate.
   */
  recordCanvasChange(): SyncTimestamp {
    const now = Date.now();
    this.state.canvas = {
      timestamp: now,
      version: this.state.canvas.version + 1,
      source: 'canvas',
    };
    return this.state.canvas;
  }

  /**
   * Record an editor change and determine if it should propagate.
   */
  recordEditorChange(): SyncTimestamp {
    const now = Date.now();
    this.state.editor = {
      timestamp: now,
      version: this.state.editor.version + 1,
      source: 'editor',
    };
    return this.state.editor;
  }

  /**
   * Determine which side wins the conflict.
   * Later timestamp wins. If equal, higher version wins.
   */
  resolve(): ConflictWinner {
    const { canvas, editor } = this.state;

    if (canvas.timestamp > editor.timestamp) {
      return 'canvas';
    } else if (editor.timestamp > canvas.timestamp) {
      return 'editor';
    } else {
      // Same timestamp — use version counter
      if (canvas.version > editor.version) {
        return 'canvas';
      } else if (editor.version > canvas.version) {
        return 'editor';
      }
      return 'none';
    }
  }

  /**
   * Check if a change from the given source should be applied,
   * considering the debounce guard.
   */
  shouldApply(source: 'canvas' | 'editor', debounceMs: number = 200): boolean {
    const now = Date.now();
    const lastChange = source === 'canvas' ? this.state.editor : this.state.canvas;

    // If the other source changed very recently, we're likely in a sync loop
    // Apply the change only if enough time has passed
    if (now - lastChange.timestamp < debounceMs) {
      return false;
    }

    // Record the change
    if (source === 'canvas') {
      this.recordCanvasChange();
    } else {
      this.recordEditorChange();
    }

    return true;
  }

  /**
   * Reset the conflict resolver state.
   */
  reset(): void {
    this.state = {
      canvas: { timestamp: 0, version: 0, source: 'canvas' },
      editor: { timestamp: 0, version: 0, source: 'editor' },
    };
  }

  /** Get current state (for debugging). */
  getState(): SyncState {
    return { ...this.state };
  }
}
