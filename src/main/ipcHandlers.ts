// Concern G: Electron Desktop Shell — IPC handlers
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Register all IPC handlers for renderer-main process communication.
 * Handles file dialogs, file read/write, and application lifecycle.
 */
export function registerIpcHandlers(): void {
  // Open file dialog for .puml files
  ipcMain.handle('dialog:openPuml', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      title: 'Open PlantUML File',
      filters: [
        { name: 'PlantUML Files', extensions: ['puml', 'pu', 'plantuml', 'iuml', 'wsd'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { filePath, content, fileName: path.basename(filePath) };
  });

  // Save file dialog for .puml files
  ipcMain.handle('dialog:savePuml', async (_event, content: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return false;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export PlantUML File',
      defaultPath: 'diagram.puml',
      filters: [
        { name: 'PlantUML Files', extensions: ['puml'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return false;
    }

    fs.writeFileSync(result.filePath, content, 'utf-8');
    return true;
  });

  // Save PNG dialog
  ipcMain.handle('dialog:savePng', async (_event, dataUrl: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return false;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export PNG Image',
      defaultPath: 'diagram.png',
      filters: [
        { name: 'PNG Images', extensions: ['png'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return false;
    }

    // Handle both data URL and buffer
    if (dataUrl.startsWith('data:')) {
      const base64Data = dataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(result.filePath, buffer);
    } else {
      fs.writeFileSync(result.filePath, dataUrl, 'utf-8');
    }
    return true;
  });

  // Read file content
  ipcMain.handle('file:read', async (_event, filePath: string) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Write file content
  ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Get application version
  ipcMain.handle('app:getVersion', () => {
    const { app } = require('electron');
    return app.getVersion();
  });

  // Get user data path
  ipcMain.handle('app:getPath', (_event, name: string) => {
    const { app } = require('electron');
    return app.getPath(name);
  });
}
