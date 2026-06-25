# Concern E: PlantUML Generator

## Responsibility
Generate valid PlantUML text from AST with depth-tracked indentation and round-trip fidelity.

## Implements
- Intent element: `app-concern-e` (PlantUML Parser and Generator) — generator half
- Testcases: TC-E-2

## Public Boundary
- `generator.ts` — main generate function: `generate(model: DiagramModel): string`
- `indentation.ts` — depth-tracked indentation utility
- `index.ts` — barrel export

## Design Decisions
- 2-space indentation per nesting level
- No positional/CSS data in generated output
- Output starts with @startuml, ends with @enduml
- Round-trip: parse(generate(ast)) === ast for all valid models

## Allowed Dependencies
- `src/model/` (AST types)

## Owned Tests
- `tests/generator/test_generator_roundtrip.mjs`
