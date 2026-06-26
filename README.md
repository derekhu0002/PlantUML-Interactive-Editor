# PlantUML Interactive Desktop Editor

**Drag-and-drop PlantUML diagram editing on Windows** — v0.1.0

PlantUML Interactive Desktop Editor is a native Windows desktop application that combines the power of PlantUML diagramming with an intuitive drag-and-drop canvas. Design activity diagrams by dragging elements from a palette, repositioning them freely on a ReactFlow canvas, and connecting them visually — while the code editor stays in perfect sync. Work in whichever mode is easier in the moment: visual canvas or raw PlantUML.

![Screenshot](images/screenshot.png)

---

## Features

### 🎯 Drag-and-Drop Editing

- **3 Levels of Drag-and-Drop**: Add elements from the palette to the canvas, reposition them anywhere on the free-form layout, and reconnect arrows by dragging between port handles.
- **7 PlantUML Node Types**: Start, Stop, Activity, If/Else, While, Fork, and Switch — all mapped to their PlantUML syntax equivalents.
- **Component Palette**: 11 draggable items organized across 3 categories — *Flow* (Start, Stop, Activity, Decision, End), *Structure* (If, While, Fork, Switch), and *Decoration* (Note, Partition).

### ✍️ Dual-Mode Editing

- **Visual Canvas Mode**: Build and modify diagrams through direct manipulation — click, drag, and connect elements on a free-form ReactFlow canvas.
- **Code Editor Mode**: Edit PlantUML source directly in Ace Editor with custom PlantUML syntax highlighting, indentation, and error feedback.
- **Bidirectional Sync**: Canvas ↔ Code synchronization with 200ms debounce and last-write-wins conflict resolution. Changes in either mode are reflected in the other automatically.

### 📦 Import & Export

- **Export to .puml**: One-click export of the logical diagram structure (no positional/CSS data).
- **Export to .png**: Rendered diagram image via the PlantUML engine.
- **Import .puml Files**: Open existing PlantUML files — the parser reconstructs a full AST and lays out elements on the canvas with an automatic grid layout.

### 🚀 Zero-Configuration Setup

- On first launch, the application automatically downloads the Java Runtime Environment and PlantUML JAR — no manual setup required.
- The Python Flask rendering backend is packaged as a standalone executable via PyInstaller.
- A clean NSIS installer bundles everything for Windows 10/11 64-bit.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Shell** | Electron 30 |
| **UI Framework** | React 18 + TypeScript (strict mode) |
| **Build Tool** | Vite 5 |
| **Canvas Engine** | ReactFlow 11 (custom node renderers, free-form positioning) |
| **Code Editor** | Ace Editor with custom PlantUML syntax mode |
| **Rendering Backend** | Python Flask (minimal — only `/render` and `/renderPNG` endpoints) |
| **Unit Tests** | Vitest |
| **E2E Tests** | Playwright for Electron |
| **Installer** | electron-builder + NSIS (Windows x64) |

---

## Architecture

The application follows a **concern-separated architecture** with 7 orthogonal concerns, each in its own module with strict dependency direction:

| Concern | ID | Module | Responsibility |
|---------|----|--------|---------------|
| **A — AST Data Model** | `app-concern-a` | `src/model/` | TypeScript types for all PlantUML element types |
| **B — ReactFlow Canvas** | `app-concern-b` | `src/canvas/` | Free-form canvas with custom node renderers |
| **C — Ace Code Editor** | `app-concern-c` | `src/editor/` | PlantUML syntax highlighting + debounced events |
| **D — Bidirectional Sync** | `app-concern-d` | `src/sync/` | Last-write-wins sync with fingerprint matching |
| **E — Parser & Generator** | `app-concern-e` | `src/parser/`, `src/generator/` | Stack-based PlantUML parsing and depth-tracked generation |
| **F — Component Palette** | `app-concern-f` | `src/palette/` | 3-category draggable element palette |
| **G — Electron Shell** | `app-concern-g` | `src/main/` | Window management, native menus, subprocess control |

**Dependency rules**: A (AST) is the foundation with zero dependencies. All concerns depend downward — no reverse dependencies are permitted. See [OVERALL_ARCHITECTURE.md](./OVERALL_ARCHITECTURE.md) for the full dependency map and guardrails.

---

## Project Status

- **Phase**: MVP (Minimum Viable Product)
- **Platform**: Windows 10/11 64-bit
- **License**: [MIT License](./LICENSE)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup & Development

```bash
# Install dependencies
npm install

# Run in development mode (Electron window with hot reload)
npm run dev:electron

# Or run just the web renderer (for UI development only)
npm run dev
```

### Build & Package

```bash
# Build and package the desktop application
npm run build:electron

# The NSIS installer will be in the release/ directory
```

### Testing

```bash
# Run unit tests (Vitest)
npm test

# Watch mode
npm run test:watch

# TypeScript type checking (strict mode)
npm run typecheck

# End-to-end tests (Playwright for Electron)
npm run test:e2e

# Architecture guard tests
node tests/arch/test_ts_strict_mode.mjs
node tests/arch/test_dependency_direction.mjs

# Linting
npm run lint
```

---

## Project Structure

```
├── src/
│   ├── main/                 # Electron main process (Concern G)
│   ├── preload/              # Electron preload scripts
│   ├── renderer/             # React app entry, layout, wiring
│   ├── model/                # AST data model (Concern A)
│   ├── canvas/               # ReactFlow canvas engine (Concern B)
│   ├── editor/               # Ace Code Editor wrapper (Concern C)
│   ├── sync/                 # Bidirectional sync engine (Concern D)
│   ├── parser/               # PlantUML text → AST (Concern E)
│   ├── generator/            # AST → PlantUML text (Concern E)
│   ├── palette/              # Component palette (Concern F)
│   └── python-backend/       # Python Flask render backend
├── tests/
│   ├── model/                # AST model unit tests
│   ├── parser/               # Parser unit tests
│   ├── generator/            # Generator round-trip tests
│   ├── business/             # Business-level test suites
│   ├── e2e/                  # End-to-end and integration tests
│   ├── arch/                 # Architecture guard tests
│   └── ...                   # Additional test suites
├── design/                   # Architecture intent and design artifacts
├── .opencode/                # AI-assisted development workflows
├── OVERALL_ARCHITECTURE.md   # System architecture contract
├── FEATURES.md               # Detailed feature documentation
├── CONTRIBUTING.md           # Contribution guidelines
├── electron-builder.yml      # Electron packaging configuration
├── vite.config.ts            # Vite build configuration
└── tsconfig.json             # TypeScript configuration (strict mode)
```

---

## Documentation

- **[Architecture Overview](./OVERALL_ARCHITECTURE.md)** — System architecture contracts, stable elements, dependency rules, and implementation guardrails.
- **[Feature List](./FEATURES.md)** — Detailed documentation of supported and unsupported PlantUML features.
- **[Design Documentation](./design/)** — Architecture intent graphs, handoff contracts, and design artifacts.
- **[Contributing](./CONTRIBUTING.md)** — Guidelines for reporting bugs, suggesting features, and submitting pull requests.
- **[Changelog](./CHANGELOG.md)** — Version history and release notes.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Ctrl + Enter` | Submit edited element text |
| `Delete` / `Backspace` | Remove selected element |
| Mouse wheel | Zoom in/out on canvas |
| Click + drag (background) | Pan canvas |

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
