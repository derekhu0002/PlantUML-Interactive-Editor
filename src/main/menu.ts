// Concern G: Electron Desktop Shell — native menu template
// Implements app-concern-g: Electron Desktop Shell
// See src/main/ARCHITECTURE.md for contract

import { Menu, MenuItem, MenuItemConstructorOptions, app, BrowserWindow } from 'electron';
import { getMainWindow } from './window';

/**
 * Build and set the application native menu.
 * File: Open (Ctrl+O), Export .puml (Ctrl+S), Export .png (Ctrl+Shift+S), Exit
 * Edit: Undo (Ctrl+Z), Redo (Ctrl+Shift+Z)
 * Help: About
 */
export function createAppMenu(): Menu {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const win = getMainWindow();
            win?.webContents.send('menu:new');
          },
        },
        {
          label: 'Open .puml...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const win = getMainWindow();
            win?.webContents.send('menu:open');
          },
        },
        { type: 'separator' },
        {
          label: 'Export .puml',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            const win = getMainWindow();
            win?.webContents.send('menu:export-puml');
          },
        },
        {
          label: 'Export .png',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            const win = getMainWindow();
            win?.webContents.send('menu:export-png');
          },
        },
        { type: 'separator' },
        isMac
          ? { role: 'close', label: 'Exit' }
          : { role: 'quit', label: 'Exit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            const win = getMainWindow();
            win?.webContents.send('menu:undo');
          },
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => {
            const win = getMainWindow();
            win?.webContents.send('menu:redo');
          },
        },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
        { role: 'selectAll', label: 'Select All' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Fullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About PlantUML Interactive Editor',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox({
              type: 'info',
              title: 'About PlantUML Interactive Editor',
              message: 'PlantUML Interactive Editor',
              detail: `Version ${app.getVersion()}\n\nA drag-and-drop desktop editor for PlantUML Activity Diagrams.\n\nBuilt with Electron, React, TypeScript, and Vite.`,
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
}
