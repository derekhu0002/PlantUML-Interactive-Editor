// Concern E: PlantUML Generator — Indentation utility
// Implements app-concern-e: PlantUML Generator
// See src/generator/ARCHITECTURE.md for contract

/**
 * Depth-tracked indentation for PlantUML code generation.
 * Uses 2-space indentation per nesting level.
 */
export class Indentation {
  private depth: number = 0;
  private readonly indentSize: number = 2;

  constructor(indentSize: number = 2) {
    this.indentSize = indentSize;
  }

  /** Get the current indentation string. */
  get current(): string {
    return ' '.repeat(this.depth * this.indentSize);
  }

  /** Increase indentation level. */
  indent(): void {
    this.depth++;
  }

  /** Decrease indentation level. */
  outdent(): void {
    if (this.depth > 0) {
      this.depth--;
    }
  }

  /** Reset indentation to zero. */
  reset(): void {
    this.depth = 0;
  }

  /** Get current depth level. */
  get level(): number {
    return this.depth;
  }

  /** Run a function with increased indentation. */
  withIndent<T>(fn: () => T): T {
    this.indent();
    try {
      return fn();
    } finally {
      this.outdent();
    }
  }
}
