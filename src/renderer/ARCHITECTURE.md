# Renderer Shell: React App Integration

## Responsibility
Root React application that wires all concerns together. Provides layout (palette | canvas | editor), IPC hooks for menu actions, sync lifecycle management.

## Implements
- Intent element: `biz-service-editing` (Business Service: Diagram Editing Service)
- Testcases: TC-BIZ-SVC-1

## Public Boundary
- `main.tsx` — React entry point
- `App.tsx` — root component with SyncEngine context
- `AppLayout.tsx` — three-panel layout
- `hooks/useMenuIPC.ts` — listen for menu actions from Electron main process
- `hooks/useAppLifecycle.ts` — new/open/save/export lifecycle
- `components/FirstLaunchWizard.tsx` — first-launch dependency download UI

## Layout
```
┌─────────┬──────────────────────────┬────────────┐
│ Palette │    Canvas (ReactFlow)    │   Editor   │
│ (240px) │     (flex-1)            │  (400px)   │
└─────────┴──────────────────────────┴────────────┘
```

## Allowed Dependencies
- `src/canvas/`
- `src/editor/`
- `src/sync/`
- `src/palette/`

## Owned Tests
- `tests/e2e/test_biz_service_end_to_end.mjs`
