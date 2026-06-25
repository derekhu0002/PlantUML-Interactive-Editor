# PlantUML Desktop Editor — Overall Architecture

## Stage: Implementation Architecture Contract
*This file is the root implementation contract. It declares stable architecture elements, root-level rules, and mapping from intent elements to implementation modules.*

## Technology Stack
- **Desktop Shell**: Electron 30+
- **UI Framework**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite 5+
- **Canvas**: ReactFlow 11+
- **Code Editor**: Ace Editor (react-ace)
- **Renderer Backend**: Python Flask (PyInstaller-packaged) — ONLY /render and /renderPNG
- **Installer**: electron-builder + NSIS (Windows 10/11 64-bit)
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright for Electron

## Stable Architecture Elements

| Concern | ID | Module Path | Responsibility |
|---------|----|-------------|----------------|
| A: AST Data Model | app-concern-a | src/model/ | TypeScript types for PlantUML Activity Diagram elements |
| B: ReactFlow Canvas | app-concern-b | src/canvas/ | Free-form canvas with custom node renderers |
| C: Ace Editor Wrapper | app-concern-c | src/editor/ | Code editor with PlantUML highlighting |
| D: Sync Engine | app-concern-d | src/sync/ | Bidirectional canvas↔code sync |
| E: Parser | app-concern-e | src/parser/ | PlantUML text → AST |
| E: Generator | app-concern-e | src/generator/ | AST → PlantUML text |
| F: Component Palette | app-concern-f | src/palette/ | Draggable element palette |
| G: Electron Shell | app-concern-g | src/main/ | Electron main process, menus, IPC |
| Renderer Shell | — | src/renderer/ | React app entry, layout, wiring |
| Python Backend | tech-python-backend | src/python-backend/ | Minimal Flask with only /render and /renderPNG |

## Dependency Rules
1. Modules may only depend on modules listed below them in the dependency chain
2. **G (Electron Shell)** may serve all concerns but concerns must not import Electron main process
3. **A (AST)** is the foundation — no dependencies on other concerns
4. **B (Canvas)** depends on A (uses AST types for node/edge data)
5. **E (Parser, Generator)** depends on A
6. **C (Editor)** is standalone — no concern dependencies
7. **D (Sync Engine)** depends on B, C, E
8. **F (Palette)** depends on B (drops into canvas)
9. **Renderer** depends on B, C, D, F
10. No reverse dependencies (e.g., A must not import B)

## Dependency Direction Map
```
A ──→ B, E
B ──→ D
C ──→ D
E ──→ D
D ──→ C (updates code)
G ──→ A, B, C, D, E, F (serving via Electron APIs)
```

## Key Implementation Guardrails
- TypeScript strict mode required
- No inline styles in React components (CSS modules or styled-components)
- All exports must be typed
- Python backend must expose ONLY /render (SVG) and /renderPNG endpoints
- No positional/CSS data in .puml export
- Sync engine must debounce at 200ms and guard against infinite loops
- First-launch JRE + PlantUML JAR download with progress indication
