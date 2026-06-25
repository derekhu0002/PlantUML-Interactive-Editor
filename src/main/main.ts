// Concern G: Electron Desktop Shell — main process entry
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import { app } from 'electron';
import { createMainWindow } from './window';
import { createAppMenu } from './menu';
import { registerIpcHandlers } from './ipcHandlers';

let pythonBackendProcess: any = null;

app.whenReady().then(() => {
  // Register IPC handlers before creating window
  registerIpcHandlers();

  // Create native menu
  createAppMenu();

  // Create main window
  createMainWindow();

  app.on('activate', () => {
    // On macOS re-create window when dock icon is clicked
    if (require('electron').BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Quit app when all windows are closed (except on macOS)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Cleanup: stop Python backend if running
  if (pythonBackendProcess) {
    try {
      pythonBackendProcess.kill();
    } catch (e) {
      // Process may already be dead
    }
  }
});
