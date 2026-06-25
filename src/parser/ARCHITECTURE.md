# Concern E: PlantUML Parser

## Responsibility
Parse PlantUML Activity Diagram text into AST using stack-based nesting tracking with tolerance for unsupported elements.

## Implements
- Intent element: `app-concern-e` (PlantUML Parser and Generator) — parser half
- Testcases: TC-E-1

## Public Boundary
- `parser.ts` — main parse function: `parse(plantUmlText: string): DiagramModel`
- `tokenizer.ts` — tokenize PlantUML text into tokens
- `index.ts` — barrel export

## Design Decisions
- Stack-based nesting tracking for if/while/fork/endif/endwhile/endfork/split/endsplit
- Forward/backward scanning for block boundary detection
- Unsupported elements rendered as CommentNode (grey read-only blocks)
- Partial/invalid syntax does not crash — returns best-effort AST with unrecoverable sections as CommentNode

## Allowed Dependencies
- `src/model/` (AST types)

## Owned Tests
- `tests/parser/test_parser_activity_diagram.mjs`
