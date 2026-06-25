# Concern F: Component Palette

## Responsibility
Left-panel draggable element palette. Three categories: Flow (Activity, Start, Stop, Connector), Structure (If, While, Fork, Switch), Decoration (Note, Group, Title). Drag preview and snap-zone indicators.

## Implements
- Intent element: `app-concern-f` (Component Palette)
- Testcases: TC-F-1, TC-F-2

## Public Boundary
- `Palette.tsx` — main palette component with 3 collapsible categories
- `PaletteCategory.tsx` — collapsible category with draggable items
- `DragController.ts` — coordinate drag events between palette and canvas
- `paletteItems.ts` — item definitions
- `index.ts` — barrel export

## Palette Items
- Flow: Activity, Start, Stop, Connector
- Structure: If, While, Fork, Switch
- Decoration: Note, Group, Title

## Allowed Dependencies
- `src/canvas/` (drop target for drag-and-drop)

## Owned Tests
- `tests/e2e/test_palette_categories.mjs`
- `tests/e2e/test_palette_drag_to_canvas.mjs`
