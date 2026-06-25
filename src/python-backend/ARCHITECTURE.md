# Python Render Backend

## Responsibility
Minimal Flask application providing ONLY /render (SVG) and /renderPNG (PNG) endpoints for PlantUML diagram rendering. Invokes Java + plantuml.jar as subprocess.

## Implements
- Intent element: `tech-python-backend` (Python Render Backend)
- Testcases: TC-TECH-PY-1, TC-CONST-PY-1

## Public Boundary
- `app.py` — Flask app with only /render and /renderPNG routes
- `render.py` — Java subprocess invocation logic

## Constraint
- NO manipulation endpoints (activity/, sequence/, shared/ blueprints removed)
- Only /render (returns SVG) and /renderPNG (returns PNG binary)
- PyInstaller-packaged for distribution

## Allowed Dependencies
- Flask
- pyquery (for SVG manipulation if needed)
- No blueprints from legacy src/plantuml_gui/

## Owned Tests
- Existing tests may be updated; new minimal test suite TBD
