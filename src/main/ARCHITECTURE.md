# Concern G: Electron Desktop Shell

## Responsibility
Electron main process: window management, native menus (File/Edit/Help), file dialogs for import/export, subprocess management for Python backend, JRE download on first launch, auto-updater.

## Implements
- Intent element: `app-concern-g` (Electron Desktop Shell)
- Testcases: TC-G-1, TC-G-2

## Public Boundary
- `main.ts` — Electron app entry, window creation
- `menu.ts` — native menu template (File, Edit, Help)
- `ipcHandlers.ts` — IPC handlers for file operations, subprocess, downloads
- `window.ts` — window management
- `pythonBackend.ts` — Python backend subprocess spawn/health/stop
- `healthCheck.ts` — health check polling
- `downloadManager.ts` — JRE and PlantUML JAR download
- `installer.ts` — first-launch setup flow

## Menu Structure
- File: Open (Ctrl+O), Export .puml (Ctrl+S), Export .png (Ctrl+Shift+S), Exit
- Edit: Undo (Ctrl+Z), Redo (Ctrl+Shift+Z)
- Help: About

## Allowed Dependencies
- None (Electron main process — does not import renderer modules)

## Owned Tests
- `tests/e2e/test_electron_native_menus.mjs`
- `tests/e2e/test_electron_python_subprocess.mjs`
