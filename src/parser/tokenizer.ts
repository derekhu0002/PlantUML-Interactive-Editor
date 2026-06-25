// Concern E: PlantUML Parser — Tokenizer
// Implements app-concern-e: PlantUML Parser
// See src/parser/ARCHITECTURE.md for contract

export type TokenType =
  | 'START_UML'
  | 'END_UML'
  | 'ACTION'
  | 'IF'
  | 'ELSE'
  | 'ELSEIF'
  | 'ENDIF'
  | 'WHILE'
  | 'ENDWHILE'
  | 'FORK'
  | 'ENDFORK'
  | 'SPLIT'
  | 'ENDSPLIT'
  | 'SWITCH'
  | 'CASE'
  | 'ENDSWITCH'
  | 'NOTE'
  | 'ENDNOTE'
  | 'GROUP'
  | 'ENDGROUP'
  | 'TITLE'
  | 'PARTITION'
  | 'ENDPARTITION'
  | 'REPEAT'
  | 'ENDREPEAT'
  | 'START'
  | 'STOP'
  | 'COLON'
  | 'SEMICOLON'
  | 'ARROW'
  | 'IDENTIFIER'
  | 'STRING'
  | 'COMMENT'
  | 'UNSUPPORTED'
  | 'NEWLINE'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORD_MAP: Record<string, TokenType> = {
  '@startuml': 'START_UML',
  '@enduml': 'END_UML',
  'if': 'IF',
  'else': 'ELSE',
  'elseif': 'ELSEIF',
  'endif': 'ENDIF',
  'while': 'WHILE',
  'endwhile': 'ENDWHILE',
  'fork': 'FORK',
  'endfork': 'ENDFORK',
  'split': 'SPLIT',
  'endsplit': 'ENDSPLIT',
  'switch': 'SWITCH',
  'case': 'CASE',
  'endswitch': 'ENDSWITCH',
  'note': 'NOTE',
  'endnote': 'ENDNOTE',
  'group': 'GROUP',
  'endgroup': 'ENDGROUP',
  'title': 'TITLE',
  'partition': 'PARTITION',
  'endpartition': 'ENDPARTITION',
  'repeat': 'REPEAT',
  'endrepeat': 'ENDREPEAT',
  'start': 'START',
  'stop': 'STOP',
};

/**
 * Tokenize PlantUML text into a stream of tokens.
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let column = 1;
  const len = input.length;

  function error(msg: string): never {
    throw new Error(`Tokenizer error at line ${line}, column ${column}: ${msg}`);
  }

  function peek(): string {
    return pos < len ? input[pos] : '\0';
  }

  function advance(): string {
    const ch = input[pos++];
    if (ch === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  }

  function skipWhitespace(): void {
    while (pos < len && (input[pos] === ' ' || input[pos] === '\t' || input[pos] === '\r')) {
      advance();
    }
  }

  function addToken(type: TokenType, value: string): void {
    tokens.push({ type, value, line, column: column - value.length });
  }

  function matchKeyword(word: string): TokenType | null {
    const lower = word.toLowerCase();
    return KEYWORD_MAP[lower] ?? null;
  }

  function readLine(): string {
    const start = pos;
    while (pos < len && input[pos] !== '\n') {
      advance();
    }
    return input.slice(start, pos);
  }

  function readString(): string {
    const quote = advance(); // skip opening quote
    const start = pos;
    while (pos < len && input[pos] !== quote) {
      advance();
    }
    const str = input.slice(start, pos);
    if (pos < len) advance(); // skip closing quote
    return str;
  }

  function readIdentifier(): string {
    const start = pos;
    while (pos < len && /[a-zA-Z0-9_]/.test(input[pos])) {
      advance();
    }
    return input.slice(start, pos);
  }

  while (pos < len) {
    skipWhitespace();
    if (pos >= len) break;

    const ch = input[pos];

    // Newline
    if (ch === '\n') {
      addToken('NEWLINE', '\n');
      advance();
      continue;
    }

    // Single-line comment: ' or /'
    if (ch === "'" || (ch === '/' && pos + 1 < len && input[pos + 1] === "'")) {
      if (ch === "'") {
        advance(); // skip '
      } else {
        advance(); advance(); // skip /'
      }
      const commentText = readLine();
      addToken('COMMENT', commentText);
      continue;
    }

    // Multi-line comment: /' ... '/
    if (ch === '/' && pos + 1 < len && input[pos + 1] === "'") {
      advance(); advance();
      const start = pos;
      while (pos + 1 < len && !(input[pos] === "'" && input[pos + 1] === '/')) {
        advance();
      }
      const commentText = input.slice(start, pos);
      if (pos + 1 < len) { advance(); advance(); } // skip '/
      addToken('COMMENT', commentText);
      continue;
    }

    // String literal
    if (ch === '"' || ch === "'") {
      const str = readString();
      addToken('STRING', str);
      continue;
    }

    // Colon action prefix
    if (ch === ':') {
      advance();
      // Action text ends at semicolon or newline
      const start = pos;
      while (pos < len && input[pos] !== ';' && input[pos] !== '\n') {
        advance();
      }
      const actionText = input.slice(start, pos).trim();
      addToken('ACTION', actionText);
      // Don't consume the semicolon or newline - let the next iteration handle it
      continue;
    }

    // Semicolon (action terminator)
    if (ch === ';') {
      addToken('SEMICOLON', ';');
      advance();
      continue;
    }

    // Arrow: ->
    if (ch === '-' && pos + 1 < len && input[pos + 1] === '>') {
      advance(); advance();
      addToken('ARROW', '->');
      continue;
    }

    // Arrow: --> (long arrow)
    if (ch === '-' && pos + 2 < len && input[pos + 1] === '-' && input[pos + 2] === '>') {
      advance(); advance(); advance();
      addToken('ARROW', '-->');
      continue;
    }

    // Arrow: => 
    if (ch === '=' && pos + 1 < len && input[pos + 1] === '>') {
      advance(); advance();
      addToken('ARROW', '=>');
      continue;
    }

    // Arrow: ==> (long arrow)
    if (ch === '=' && pos + 2 < len && input[pos + 1] === '=' && input[pos + 2] === '>') {
      advance(); advance(); advance();
      addToken('ARROW', '==>');
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z@_]/.test(ch)) {
      const word = readIdentifier();
      const kw = matchKeyword(word);
      if (kw) {
        addToken(kw, word);
      } else {
        // Could be part of an action or expression
        // Read until colon, semicolon, or newline
        const start = pos - word.length;
        while (pos < len && input[pos] !== ';' && input[pos] !== '\n' && input[pos] !== ':') {
          if (input[pos] === '-' && pos + 1 < len && input[pos + 1] === '>') break;
          advance();
        }
        const fullText = input.slice(start, pos).trim();
        if (fullText) {
          addToken('IDENTIFIER', fullText);
        }
      }
      continue;
    }

    // Parentheses for conditions
    if (ch === '(') {
      // Read parenthesized expression
      const expr = readParenthesized();
      addToken('STRING', expr);
      continue;
    }

    // Brackets
    if (ch === '[' || ch === ']') {
      addToken('IDENTIFIER', advance());
      continue;
    }

    // Skip other single chars
    advance();
  }

  addToken('EOF', '');
  return tokens;
}

function readParenthesized(): string {
  return ''; // simplified - will be enhanced
}

export function isBlockStart(type: TokenType): boolean {
  return type === 'IF' || type === 'WHILE' || type === 'FORK' || type === 'SPLIT' ||
         type === 'SWITCH' || type === 'REPEAT' || type === 'PARTITION';
}

export function isBlockEnd(type: TokenType): boolean {
  return type === 'ENDIF' || type === 'ENDWHILE' || type === 'ENDFORK' ||
         type === 'ENDSPLIT' || type === 'ENDSWITCH' || type === 'ENDREPEAT' ||
         type === 'ENDPARTITION';
}
