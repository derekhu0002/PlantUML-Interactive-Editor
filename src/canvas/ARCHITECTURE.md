# Concern B: ReactFlow Canvas Engine

## Responsibility
ReactFlow-based free-form canvas with custom node renderers for each PlantUML element type. Handles drag-and-drop (3 levels), free positioning, connection handles, container nesting visualization.

## Implements
- Intent element: `app-concern-b` (ReactFlow Canvas Engine)
- Testcases: TC-B-1, TC-B-2

## Public Boundary
- `Canvas.tsx` — main canvas component wrapping ReactFlow
- `nodes/` — custom node renderers (StartNode, StopNode, ActivityNode, IfNode, WhileNode, ForkNode, SwitchNode)
- `hooks/useDragDrop.ts` — drag-and-drop handlers (3 levels)
- `hooks/useCanvasSync.ts` — sync events to SyncEngine
- `index.ts` — barrel export

## Drag-and-Drop Levels
- Level A: Palette→Canvas (onDrop handler, create node at drop coords)
- Level B: Reposition (onNodeDragStop, update node position)
- Level C: Connector (onConnect, create edge between nodes)

## Allowed Dependencies
- `src/model/` (AST types)

## Owned Tests
- `tests/e2e/test_canvas_node_types.mjs`
- `tests/e2e/test_canvas_dragdrop_levels.mjs`
