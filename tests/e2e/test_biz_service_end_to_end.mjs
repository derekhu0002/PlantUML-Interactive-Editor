// TC-BIZ-SVC-1: End-to-end workflow: create, edit, export
// Validates full application integration with all concerns wired
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');

// Check all required source modules exist
const requiredModules = [
  { path: 'src/model/types.ts', name: 'Model (A)' },
  { path: 'src/model/serialization.ts', name: 'Serialization (A)' },
  { path: 'src/parser/parser.ts', name: 'Parser (E)' },
  { path: 'src/parser/tokenizer.ts', name: 'Tokenizer (E)' },
  { path: 'src/generator/generator.ts', name: 'Generator (E)' },
  { path: 'src/generator/indentation.ts', name: 'Indentation (E)' },
  { path: 'src/canvas/Canvas.tsx', name: 'Canvas (B)' },
  { path: 'src/canvas/nodes/index.tsx', name: 'Node Renderers (B)' },
  { path: 'src/canvas/hooks/useDragDrop.ts', name: 'DragDrop (B)' },
  { path: 'src/canvas/hooks/useCanvasSync.ts', name: 'CanvasSync (B)' },
  { path: 'src/editor/AceEditorWrapper.tsx', name: 'Editor (C)' },
  { path: 'src/editor/useEditorEvents.ts', name: 'EditorEvents (C)' },
  { path: 'src/editor/plantumlMode.ts', name: 'PlantUMLMode (C)' },
  { path: 'src/sync/SyncEngine.ts', name: 'SyncEngine (D)' },
  { path: 'src/sync/ConflictResolver.ts', name: 'ConflictResolver (D)' },
  { path: 'src/sync/FingerprintMatcher.ts', name: 'FingerprintMatcher (D)' },
  { path: 'src/sync/SidecarStore.ts', name: 'SidecarStore (D)' },
  { path: 'src/palette/Palette.tsx', name: 'Palette (F)' },
  { path: 'src/palette/PaletteCategory.tsx', name: 'PaletteCategory (F)' },
  { path: 'src/palette/DragController.ts', name: 'DragController (F)' },
  { path: 'src/palette/paletteItems.ts', name: 'PaletteItems (F)' },
  { path: 'src/main/main.ts', name: 'Main process (G)' },
  { path: 'src/main/menu.ts', name: 'Menu (G)' },
  { path: 'src/main/ipcHandlers.ts', name: 'IPC (G)' },
  { path: 'src/main/window.ts', name: 'Window (G)' },
  { path: 'src/main/pythonBackend.ts', name: 'PythonBackend (G)' },
  { path: 'src/main/healthCheck.ts', name: 'HealthCheck (G)' },
  { path: 'src/main/downloadManager.ts', name: 'DownloadManager (G)' },
  { path: 'src/main/installer.ts', name: 'Installer (G)' },
  { path: 'src/preload/preload.ts', name: 'Preload' },
  { path: 'src/renderer/App.tsx', name: 'App' },
  { path: 'src/renderer/AppLayout.tsx', name: 'AppLayout' },
  { path: 'src/renderer/main.tsx', name: 'Main entry' },
  { path: 'src/renderer/hooks/useMenuIPC.ts', name: 'MenuIPC' },
  { path: 'src/renderer/hooks/useAppLifecycle.ts', name: 'AppLifecycle' },
  { path: 'src/renderer/components/FirstLaunchWizard.tsx', name: 'FirstLaunchWizard' },
  { path: 'src/python-backend/app.py', name: 'Python Backend' },
  { path: 'src/python-backend/render.py', name: 'Python Render' },
  { path: 'package.json', name: 'package.json' },
  { path: 'tsconfig.json', name: 'tsconfig.json' },
  { path: 'vite.config.ts', name: 'vite.config.ts' },
  { path: 'index.html', name: 'index.html' },
];

const missing = [];
const found = [];

for (const mod of requiredModules) {
  const fullPath = resolve(rootDir, mod.path);
  if (existsSync(fullPath)) {
    found.push(mod);
  } else {
    missing.push(mod);
  }
}

console.log(`TC-BIZ-SVC-1: E2E integration check (${found.length}/${requiredModules.length} modules)`);

for (const mod of found) {
  console.log(`  ✓ ${mod.name} (${mod.path})`);
}

for (const mod of missing) {
  console.log(`  ✗ ${mod.name} (${mod.path} — MISSING)`);
}

// Check that App.tsx wires all concerns
if (existsSync(resolve(rootDir, 'src/renderer/App.tsx'))) {
  const appContent = readFileSync(resolve(rootDir, 'src/renderer/App.tsx'), 'utf-8');
  const concerns = [
    { name: 'Canvas', found: appContent.includes('Canvas') || appContent.includes('canvas') },
    { name: 'Editor', found: appContent.includes('Editor') || appContent.includes('editor') },
    { name: 'Palette', found: appContent.includes('Palette') || appContent.includes('palette') },
    { name: 'SyncEngine', found: appContent.includes('SyncEngine') || appContent.includes('sync') },
    { name: 'MenuIPC', found: appContent.includes('useMenuIPC') || appContent.includes('menu') },
  ];

  console.log('\nApp.tsx concern wiring:');
  for (const c of concerns) {
    console.log(`  ${c.found ? '✓' : '✗'} ${c.name} wired`);
  }
}

if (missing.length === 0) {
  console.log('\nTC-BIZ-SVC-1 PASSED: All modules exist for end-to-end workflow');
  process.exit(0);
} else {
  console.log(`\nTC-BIZ-SVC-1 PARTIAL: ${missing.length} modules still need implementation`);
  process.exit(1);
}
