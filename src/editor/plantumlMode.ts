// Concern C: Ace Code Editor Wrapper — PlantUML syntax mode
// Implements app-concern-c: Ace Code Editor Wrapper
// See src/editor/ARCHITECTURE.md for contract

/**
 * Define and register PlantUML syntax highlighting mode for Ace Editor.
 *
 * This module uses ace's dynamic module system to register a custom mode
 * for PlantUML diagram syntax (keywords, comments, strings, arrows).
 *
 * Usage:
 *   import { registerPlantUmlMode } from './plantumlMode';
 *   registerPlantUmlMode(); // call once before using mode="plantuml"
 */

import ace from 'ace-builds';

let registered = false;

/**
 * Register the PlantUML mode with Ace Editor.
 *
 * Call this once before setting mode="plantuml" on an AceEditor component.
 * It is safe to call multiple times; only the first call takes effect.
 */
export function registerPlantUmlMode(): void {
  if (registered) return;
  registered = true;

  // Load ace dependencies via ace's built-in module system
  const oop: any = ace.require('ace/lib/oop');
  const TextMode: any = ace.require('ace/mode/text').Mode;
  const TextHighlightRules: any = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;

  // ── PlantUML Highlight Rules ──────────────────────────────────────
  function PlantUmlHighlightRules(this: any) {
    this.$rules = {
      start: [
        // @startuml / @enduml block delimiters
        {
          token: 'keyword',
          regex: '^@startuml|^@enduml',
        },
        // PlantUML control keywords
        {
          token: 'keyword',
          regex: '\\b(if|else|elseif|endif|then|while|endwhile|fork|endfork|split|endsplit|switch|case|endswitch|repeat|endrepeat|break|continue|return|stop|start|end|note|endnote|group|endgroup|partition|endpartition|title|endtitle)\\b',
        },
        // Control-flow particles
        {
          token: 'keyword.control',
          regex: '\\b(is|as|of|in)\\b',
        },
        // Double-quoted strings
        {
          token: 'string',
          regex: '"[^"]*"',
        },
        // Single-quoted strings
        {
          token: 'string',
          regex: "'[^']*'",
        },
        // Single-line comments (PlantUML uses ')
        {
          token: 'comment',
          regex: "'.*$",
        },
        // Doc comments (/')
        {
          token: 'comment.doc',
          regex: "/'.*?$/",
        },
        // Arrows and separators
        {
          token: 'constant',
          regex: '\\b(:|;|->|-->|=>|==>)\\b',
        },
        // Parenthesized expressions
        {
          token: 'variable',
          regex: '\\([^)]*\\)',
        },
        // Whitespace
        {
          token: 'text',
          regex: '\\s+',
        },
        // Identifiers (fallback)
        {
          token: 'identifier',
          regex: '\\w+',
        },
      ],
    };
  }

  // Inherit from TextHighlightRules for proper ace integration
  oop.inherits(PlantUmlHighlightRules, TextHighlightRules);

  // ── PlantUML Mode ──────────────────────────────────────────────────
  function PlantUmlMode(this: any) {
    this.HighlightRules = PlantUmlHighlightRules;
  }

  // Inherit from TextMode so the mode has all required ace infrastructure
  oop.inherits(PlantUmlMode, TextMode);

  // ── Register with Ace's module system ─────────────────────────────
  // Use dynamicModules so config.loadModule("ace/mode/plantuml") resolves
  // synchronously through the dynamic module path instead of trying to
  // load a separate script from the server.
  const config = ace.config as any;
  if (!config.dynamicModules) {
    config.dynamicModules = Object.create(null);
  }
  config.dynamicModules['ace/mode/plantuml'] = () =>
    Promise.resolve({ Mode: PlantUmlMode });

  // Also register via ace.define so ace.require('ace/mode/plantuml')
  // works for direct lookups. The define function is attached at runtime
  // by ace.js (not in the TypeScript types), so we cast via any.
  try {
    (ace as any).define(
      'ace/mode/plantuml',
      ['require', 'exports', 'module'],
      (_require: any, exports: any) => {
        exports.Mode = PlantUmlMode;
      },
    );
  } catch {
    // ace.define may not be available in all contexts (e.g. strict CSP);
    // the dynamicModules registration above is sufficient for setMode().
  }
}
