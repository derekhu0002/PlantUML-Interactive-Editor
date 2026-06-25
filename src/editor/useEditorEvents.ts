// Concern C: Ace Code Editor Wrapper — debounced event hook
// Implements app-concern-c: Ace Code Editor Wrapper
// See src/editor/ARCHITECTURE.md for contract

import { useCallback, useRef, useEffect } from 'react';

export interface EditorChangeEvent {
  content: string;
  timestamp: number;
}

export type OnEditorChange = (event: EditorChangeEvent) => void;

/**
 * Hook that provides debounced editor change events for bidirectional sync.
 * Fires at most once per 200ms window. Each event contains the full updated text content.
 */
export function useEditorEvents(
  content: string,
  onChange?: OnEditorChange,
  debounceMs: number = 200
) {
  const lastContent = useRef(content);
  const lastEmitTime = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track content changes
  useEffect(() => {
    if (content === lastContent.current) return;

    const now = Date.now();
    const timeSinceLastEmit = now - lastEmitTime.current;

    const emit = () => {
      lastContent.current = content;
      lastEmitTime.current = Date.now();
      onChange?.({ content, timestamp: lastEmitTime.current });
    };

    // If enough time has passed since last emit, emit immediately
    if (timeSinceLastEmit >= debounceMs) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      emit();
    } else {
      // Otherwise debounce
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(emit, debounceMs - timeSinceLastEmit);
    }
  }, [content, onChange, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  /**
   * Manually flush any pending changes.
   */
  const flush = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      const now = Date.now();
      lastEmitTime.current = now;
      lastContent.current = content;
      onChange?.({ content, timestamp: now });
    }
  }, [content, onChange]);

  return { flush };
}
