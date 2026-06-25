// TC-G-1: Electron Desktop Shell provides native menus
// Validates menu module with File/Edit/Help structure
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const menuPath = resolve(rootDir, 'src/main/menu.ts');
const mainPath = resolve(rootDir, 'src/main/main.ts');
const ipcPath = resolve(rootDir, 'src/main/ipcHandlers.ts');
const preloadPath = resolve(rootDir, 'src/preload/preload.ts');

const checks = [
  { path: menuPath, name: 'Menu template' },
  { path: mainPath, name: 'Main process entry' },
  { path: ipcPath, name: 'IPC handlers' },
  { path: preloadPath, name: 'Preload script' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-G-1 FAILED: ${check.name} not found`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const menuContent = readFileSync(menuPath, 'utf-8');
  const ipcContent = readFileSync(ipcPath, 'utf-8');
  const preloadContent = readFileSync(preloadPath, 'utf-8');

  // Menu features
  const menuFeatures = [
    { name: 'File menu', found: menuContent.includes('File') || menuContent.includes('file') },
    { name: 'Edit menu', found: menuContent.includes('Edit') || menuContent.includes('edit') },
    { name: 'Help menu', found: menuContent.includes('Help') || menuContent.includes('help') },
    { name: 'Open menu item (Ctrl+O)', found: menuContent.includes('open') || menuContent.includes('Ctrl+O') || menuContent.includes('CmdOrCtrl+O') },
    { name: 'Export .puml (Ctrl+S)', found: menuContent.includes('export') || menuContent.includes('puml') },
    { name: 'Export .png', found: menuContent.includes('png') || menuContent.includes('PNG') },
    { name: 'Exit/Quit', found: menuContent.includes('quit') || menuContent.includes('Exit') },
    { name: 'Undo (Ctrl+Z)', found: menuContent.includes('Undo') || menuContent.includes('Ctrl+Z') },
    { name: 'Redo (Ctrl+Shift+Z)', found: menuContent.includes('Redo') || menuContent.includes('Shift+Z') },
    { name: 'About dialog', found: menuContent.includes('About') },
  ];

  // IPC features
  const ipcFeatures = [
    { name: 'File open dialog handler', found: ipcContent.includes('dialog:openPuml') || ipcContent.includes('openPuml') },
    { name: 'File save dialog handler', found: ipcContent.includes('dialog:savePuml') || ipcContent.includes('savePuml') },
    { name: 'PNG save dialog handler', found: ipcContent.includes('dialog:savePng') || ipcContent.includes('savePng') },
    { name: 'File read handler', found: ipcContent.includes('file:read') },
    { name: 'File write handler', found: ipcContent.includes('file:write') },
  ];

  // Preload features
  const preloadFeatures = [
    { name: 'Context bridge exposed', found: preloadContent.includes('contextBridge') || preloadContent.includes('exposeInMainWorld') },
    { name: 'electronAPI global', found: preloadContent.includes('electronAPI') },
    { name: 'Menu event listeners', found: preloadContent.includes('onMenu') },
  ];

  const allFeatures = [...menuFeatures, ...ipcFeatures, ...preloadFeatures];
  const passed = allFeatures.filter(f => f.found).length;
  const failed = allFeatures.filter(f => !f.found);

  console.log(`TC-G-1: Electron native menus and IPC (${passed}/${allFeatures.length})`);

  for (const f of allFeatures) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-G-1 PASSED: All native menu features implemented');
    process.exit(0);
  } else {
    console.log('TC-G-1 PARTIAL: Some menu features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-G-1 FAILED: Error validating native menus');
  console.error(`  ${error.message}`);
  process.exit(1);
}
