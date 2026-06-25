# Concern D: Bidirectional Sync Engine

## Responsibility
Manages canvas↔code synchronization with version numbers and timestamps. Implements last-write-wins conflict resolution. Maintains position-preserving fingerprint matching across re-parses.

## Implements
- Intent element: `app-concern-d` (Bidirectional Sync Engine)
- Testcases: TC-D-1, TC-D-2

## Public Boundary
- `SyncEngine.ts` — main sync class with subscribe/notify
- `FingerprintMatcher.ts` — compute fingerprint from node content; match across re-parses
- `ConflictResolver.ts` — last-write-wins by timestamp
- `SidecarStore.ts` — read/write .puml.meta sidecar files for position persistence
- `index.ts` — barrel export

## Design Decisions
- Version counter + timestamp for conflict resolution
- 200ms debounce on both directions
- Fingerprint = node type + label + nesting path
- Sidecar file (.puml.meta) stored alongside .puml for position data
- Guard against infinite loops: skip update if incoming content matches current state

## Allowed Dependencies
- `src/model/` (AST types)
- `src/parser/` (re-parse on code change)
- `src/generator/` (regenerate code on canvas change)

## Owned Tests
- `tests/e2e/test_sync_last_write_wins.mjs`
- `tests/e2e/test_sync_fingerprint_preservation.mjs`
