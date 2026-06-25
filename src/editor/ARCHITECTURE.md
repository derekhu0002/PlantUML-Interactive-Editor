# Concern C: Ace Code Editor Wrapper

## Responsibility
Wraps Ace Editor with PlantUML syntax highlighting, line markers for canvas-code correspondence, and debounced change events.

## Implements
- Intent element: `app-concern-c` (Ace Code Editor Wrapper)
- Testcases: TC-C-1, TC-C-2

## Public Boundary
- `AceEditorWrapper.tsx` — React component wrapping react-ace
- `useEditorEvents.ts` — hook with 200ms debounce
- `plantumlMode.ts` — PlantUML syntax highlighting mode definition
- `index.ts` — barrel export

## Design Decisions
- 200ms debounce on change events for sync
- Line markers set externally by SyncEngine for canvas-code correspondence
- Read/write mode for editing; read-only mode for import preview

## Allowed Dependencies
- None (standalone wrapper)

## Owned Tests
- `tests/e2e/test_editor_syntax_highlighting.mjs`
- `tests/e2e/test_editor_debounce_events.mjs`
