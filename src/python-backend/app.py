# Python Render Backend — minimal Flask app
# Implements tech-python-backend: Python Render Backend
# See src/python-backend/ARCHITECTURE.md for contract
#
# ONLY /render and /renderPNG endpoints.
# No manipulation endpoints (activity/, sequence/, shared/ blueprints removed).
# TypeScript AST handles all parsing, generation, and editing logic.

import os
import sys
from flask import Flask, request, Response, jsonify

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import render functions from the same directory
try:
    from render import render_svg, render_png
except ImportError:
    # Fallback for when running as installed package
    from python_backend.render import render_svg, render_png

app = Flask(__name__)

# Configuration
FLASK_PORT = int(os.environ.get("FLASK_PORT", 5001))
FLASK_DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for the subprocess manager."""
    return jsonify({"status": "healthy", "service": "plantuml-render-backend"})


@app.route("/render", methods=["POST"])
def render():
    """
    Render PlantUML text to SVG.
    
    Accepts PlantUML source text in the request body (plain text).
    Returns SVG XML as the response.
    
    Request: Content-Type: text/plain
    Body: PlantUML diagram source text
    
    Response: Content-Type: image/svg+xml
    Body: SVG XML
    """
    plantuml_text = request.get_data(as_text=True)
    if not plantuml_text or not plantuml_text.strip():
        return jsonify({"error": "No PlantUML text provided"}), 400

    try:
        svg = render_svg(plantuml_text)
        return Response(svg, mimetype="image/svg+xml")
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.route("/renderPNG", methods=["POST"])
def render_png_route():
    """
    Render PlantUML text to PNG.
    
    Accepts PlantUML source text in the request body (plain text).
    Returns PNG binary as the response.
    
    Request: Content-Type: text/plain
    Body: PlantUML diagram source text
    
    Response: Content-Type: image/png
    Body: PNG binary
    """
    plantuml_text = request.get_data(as_text=True)
    if not plantuml_text or not plantuml_text.strip():
        return jsonify({"error": "No PlantUML text provided"}), 400

    try:
        png = render_png(plantuml_text)
        return Response(png, mimetype="image/png")
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


if __name__ == "__main__":
    print(f"PlantUML Render Backend starting on port {FLASK_PORT}...")
    print(f"Endpoints: /health, /render (SVG), /renderPNG")
    app.run(host="127.0.0.1", port=FLASK_PORT, debug=FLASK_DEBUG)
