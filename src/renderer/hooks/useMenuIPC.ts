// Renderer Integration — menu IPC hook
// Implements biz-service-editing: Diagram Editing Service
// See src/renderer/ARCHITECTURE.md for contract

import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      openPumlDialog: () => Promise<{ filePath: string; content: string; fileName: string } | null>;
      savePumlDialog: (content: string) => Promise<boolean>;
      savePngDialog: (dataUrl: string) => Promise<boolean>;
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      getVersion: () => Promise<string>;
      getPath: (name: string) => Promise<string>;
      onMenuNew: (callback: () => void) => () => void;
      onMenuOpen: (callback: () => void) => () => void;
      onMenuExportPuml: (callback: () => void) => () => void;
      onMenuExportPng: (callback: () => void) => () => void;
      onMenuUndo: (callback: () => void) => () => void;
      onMenuRedo: (callback: () => void) => () => void;
      onDownloadProgress: (callback: (data: any) => void) => () => void;
    };
  }
}

export interface MenuActions {
  onNew?: () => void;
  onOpen?: () => void;
  onExportPuml?: () => void;
  onExportPng?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

/**
 * Hook that listens for menu actions from the Electron main process via IPC.
 * Maps menu events to application actions.
 */
export function useMenuIPC(actions: MenuActions): void {
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubs: (() => void)[] = [];

    if (actions.onNew) {
      unsubs.push(window.electronAPI.onMenuNew(actions.onNew));
    }
    if (actions.onOpen) {
      unsubs.push(window.electronAPI.onMenuOpen(actions.onOpen));
    }
    if (actions.onExportPuml) {
      unsubs.push(window.electronAPI.onMenuExportPuml(actions.onExportPuml));
    }
    if (actions.onExportPng) {
      unsubs.push(window.electronAPI.onMenuExportPng(actions.onExportPng));
    }
    if (actions.onUndo) {
      unsubs.push(window.electronAPI.onMenuUndo(actions.onUndo));
    }
    if (actions.onRedo) {
      unsubs.push(window.electronAPI.onMenuRedo(actions.onRedo));
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [actions.onNew, actions.onOpen, actions.onExportPuml, actions.onExportPng, actions.onUndo, actions.onRedo]);
}
