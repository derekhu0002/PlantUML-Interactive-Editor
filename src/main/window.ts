// Concern G: Electron Desktop Shell — window management
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application BrowserWindow.
 * Loads the Vite dev server URL in development or the built index.html in production.
 */
export function createMainWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1400, width),
    height: Math.min(900, height),
    minWidth: 1024,
    minHeight: 700,
    title: 'PlantUML Interactive Editor',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    icon: path.join(__dirname, '../../assets/icon.png'),
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/** Get the current main window instance. */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

/** Close the main window. */
export function closeMainWindow(): void {
  if (mainWindow) {
    mainWindow.close();
  }
}
