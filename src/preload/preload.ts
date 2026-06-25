// Electron preload script — context bridge
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose a safe API to the renderer process via contextBridge.
 * The renderer accesses these via window.electronAPI.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openPumlDialog: () => ipcRenderer.invoke('dialog:openPuml'),
  savePumlDialog: (content: string) => ipcRenderer.invoke('dialog:savePuml', content),
  savePngDialog: (dataUrl: string) => ipcRenderer.invoke('dialog:savePng', dataUrl),

  // File read/write
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:write', filePath, content),

  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),

  // Menu event listeners
  onMenuNew: (callback: () => void) => {
    ipcRenderer.on('menu:new', callback);
    return () => ipcRenderer.removeListener('menu:new', callback);
  },
  onMenuOpen: (callback: () => void) => {
    ipcRenderer.on('menu:open', callback);
    return () => ipcRenderer.removeListener('menu:open', callback);
  },
  onMenuExportPuml: (callback: () => void) => {
    ipcRenderer.on('menu:export-puml', callback);
    return () => ipcRenderer.removeListener('menu:export-puml', callback);
  },
  onMenuExportPng: (callback: () => void) => {
    ipcRenderer.on('menu:export-png', callback);
    return () => ipcRenderer.removeListener('menu:export-png', callback);
  },
  onMenuUndo: (callback: () => void) => {
    ipcRenderer.on('menu:undo', callback);
    return () => ipcRenderer.removeListener('menu:undo', callback);
  },
  onMenuRedo: (callback: () => void) => {
    ipcRenderer.on('menu:redo', callback);
    return () => ipcRenderer.removeListener('menu:redo', callback);
  },

  // Download progress
  onDownloadProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('download:progress', (_event, data) => callback(data));
    return () => ipcRenderer.removeListener('download:progress', callback);
  },
});

export {};
