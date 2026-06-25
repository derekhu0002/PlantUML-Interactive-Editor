# Concern A: AST Data Model

## Responsibility
Define all TypeScript types for PlantUML Activity Diagram elements. Foundation for all other concerns.

## Implements
- Intent element: `app-concern-a` (AST Data Model)
- Testcases: TC-AST-1, TC-AST-2

## Public Boundary
- `types.ts` — all type definitions
- `serialization.ts` — toJSON/fromJSON for DiagramModel
- `index.ts` — barrel export

## Exported Types
- `DiagramNode` — union of all node types
- `ActivityNode` — `{ id, type: 'activity', label, position, width, height }`
- `IfNode` — `{ id, type: 'if', condition, thenBranch: ContainerNode, elseBranch: ContainerNode, position, width, height }`
- `WhileNode` — `{ id, type: 'while', condition, body: ContainerNode, position, width, height }`
- `ForkNode` — `{ id, type: 'fork', branches: ContainerNode[], position, width, height }`
- `SwitchNode` — `{ id, type: 'switch', expression, cases: {label, body: ContainerNode}[], position }`
- `ContainerNode` — `{ id, type: 'container', children: DiagramNode[], position, collapsed }`
- `EdgeData` — `{ id, source, target, label? }`
- `DiagramModel` — `{ nodes: DiagramNode[], edges: EdgeData[] }`

## Allowed Dependencies
- None (foundation layer)

## Owned Tests
- `tests/model/test_ast_types.mjs`
- `tests/model/test_ast_serialization.mjs`
