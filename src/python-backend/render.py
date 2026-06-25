# Python Render Backend — Java subprocess invocation
# Implements tech-python-backend: Python Render Backend
# See src/python-backend/ARCHITECTURE.md for contract

import subprocess
import os
import tempfile
import shutil
from pathlib import Path
from typing import Optional


def _find_plantuml_jar() -> Optional[str]:
    """Find the PlantUML JAR file in expected locations."""
    search_paths = [
        # Bundled with the app
        Path(__file__).parent.parent / "plantuml.jar",
        # In the user data dir (downloaded on first launch)
        Path.home() / ".plantuml-editor" / "dependencies" / "plantuml.jar",
        # Current directory
        Path.cwd() / "plantuml.jar",
    ]

    for path in search_paths:
        if path.exists():
            return str(path.resolve())

    # Check PLANTUML_JAR environment variable
    env_jar = os.environ.get("PLANTUML_JAR")
    if env_jar and Path(env_jar).exists():
        return env_jar

    return None


def _find_java() -> Optional[str]:
    """Find a Java runtime executable."""
    # Check bundled JRE first
    bundled_jre = Path(__file__).parent.parent / "jre" / "bin" / "java.exe"
    if bundled_jre.exists():
        return str(bundled_jre.resolve())

    bundled_jre = Path(__file__).parent.parent / "jre" / "bin" / "java"
    if bundled_jre.exists():
        return str(bundled_jre.resolve())

    # Check JAVA_HOME
    java_home = os.environ.get("JAVA_HOME")
    if java_home:
        java_exe = Path(java_home) / "bin" / "java.exe"
        if java_exe.exists():
            return str(java_exe.resolve())

    # Fall back to PATH
    java_exe = shutil.which("java")
    if java_exe:
        return java_exe

    return None


def render_svg(plantuml_text: str) -> str:
    """
    Render PlantUML text to SVG using Java + PlantUML JAR.
    
    Args:
        plantuml_text: The PlantUML diagram source text.
        
    Returns:
        SVG string of the rendered diagram.
        
    Raises:
        RuntimeError: If PlantUML JAR or Java runtime is not found.
        subprocess.CalledProcessError: If the PlantUML rendering fails.
    """
    jar_path = _find_plantuml_jar()
    if not jar_path:
        raise RuntimeError(
            "PlantUML JAR not found. Please set PLANTUML_JAR environment variable "
            "or place plantuml.jar in the application directory."
        )

    java_exe = _find_java()
    if not java_exe:
        raise RuntimeError(
            "Java runtime not found. Please install Java 17+ or set JAVA_HOME."
        )

    # Write PlantUML text to a temporary file
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".puml", delete=False, encoding="utf-8"
    ) as f:
        f.write(plantuml_text)
        puml_path = f.name

    try:
        # Use pipes to pass the file directly
        result = subprocess.run(
            [java_exe, "-jar", jar_path, "-tsvg", "-charset", "utf-8", puml_path],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"PlantUML rendering failed (exit code {result.returncode}):\n"
                f"stdout: {result.stdout}\n"
                f"stderr: {result.stderr}"
            )

        # Read the generated SVG file
        svg_path = Path(puml_path).with_suffix(".svg")
        if not svg_path.exists():
            # PlantUML may generate .png even when -tsvg is specified
            # Check for .png as well
            png_path = Path(puml_path).with_suffix(".png")
            if png_path.exists():
                raise RuntimeError(
                    "PlantUML generated PNG instead of SVG. Use the /renderPNG endpoint instead."
                )

            # Try finding any generated file
            generated_files = list(Path(puml_path).parent.glob(f"{Path(puml_path).stem}.*"))
            if generated_files:
                # Read the first found generated file
                with open(generated_files[0], "r", encoding="utf-8") as svg_file:
                    svg_content = svg_file.read()
                generated_files[0].unlink()  # Cleanup
                return svg_content

            raise RuntimeError("PlantUML did not produce output file")

        with open(svg_path, "r", encoding="utf-8") as svg_file:
            svg_content = svg_file.read()

        # Cleanup generated files
        svg_path.unlink()

        return svg_content

    finally:
        # Cleanup temporary files
        Path(puml_path).unlink(missing_ok=True)


def render_png(plantuml_text: str) -> bytes:
    """
    Render PlantUML text to PNG binary using Java + PlantUML JAR.
    
    Args:
        plantuml_text: The PlantUML diagram source text.
        
    Returns:
        PNG image bytes.
        
    Raises:
        RuntimeError: If PlantUML JAR or Java runtime is not found.
        subprocess.CalledProcessError: If the PlantUML rendering fails.
    """
    jar_path = _find_plantuml_jar()
    if not jar_path:
        raise RuntimeError(
            "PlantUML JAR not found. Please set PLANTUML_JAR environment variable "
            "or place plantuml.jar in the application directory."
        )

    java_exe = _find_java()
    if not java_exe:
        raise RuntimeError(
            "Java runtime not found. Please install Java 17+ or set JAVA_HOME."
        )

    # Write PlantUML text to a temporary file
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".puml", delete=False, encoding="utf-8"
    ) as f:
        f.write(plantuml_text)
        puml_path = f.name

    try:
        # Use pipes to pass the file directly
        result = subprocess.run(
            [java_exe, "-jar", jar_path, "-tpng", "-charset", "utf-8", puml_path],
            capture_output=True,
            timeout=30,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"PlantUML PNG rendering failed (exit code {result.returncode}):\n"
                f"stdout: {result.stdout}\n"
                f"stderr: {result.stderr}"
            )

        # Read the generated PNG file
        png_path = Path(puml_path).with_suffix(".png")
        if not png_path.exists():
            # Try finding any generated file
            generated_files = list(Path(puml_path).parent.glob(f"{Path(puml_path).stem}.*"))
            if generated_files:
                with open(generated_files[0], "rb") as png_file:
                    png_content = png_file.read()
                generated_files[0].unlink()  # Cleanup
                return png_content

            raise RuntimeError("PlantUML did not produce output PNG file")

        with open(png_path, "rb") as png_file:
            png_content = png_file.read()

        # Cleanup generated files
        png_path.unlink()

        return png_content

    finally:
        # Cleanup temporary files
        Path(puml_path).unlink(missing_ok=True)
