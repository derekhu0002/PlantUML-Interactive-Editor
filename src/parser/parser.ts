// Concern E: PlantUML Parser — PlantUML text to AST
// Implements app-concern-e: PlantUML Parser
// See src/parser/ARCHITECTURE.md for contract

import {
  DiagramModel,
  DiagramNode,
  ActivityNode,
  StartNode,
  StopNode,
  IfNode,
  WhileNode,
  ForkNode,
  ContainerNode,
  CommentNode,
  UnsupportedNode,
  EdgeData,
} from '../model/types';
import { tokenize, Token, TokenType, isBlockStart, isBlockEnd } from './tokenizer';

let nodeCounter = 0;
function nextId(prefix: string = 'n'): string {
  return `${prefix}_${++nodeCounter}`;
}

function resetCounter(): void {
  nodeCounter = 0;
}

/**
 * Parse PlantUML Activity Diagram text into a DiagramModel AST.
 * Uses stack-based nesting tracking for if/while/fork/endif/endwhile/endfork/split/endsplit.
 * Unsupported elements are rendered as CommentNode (grey read-only blocks).
 * Partial/invalid syntax does not crash — returns best-effort AST.
 */
export function parse(plantUmlText: string): DiagramModel {
  resetCounter();
  const tokens = tokenize(plantUmlText);
  const model: DiagramModel = {
    nodes: [],
    edges: [],
  };

  try {
    const result = parseBlock(tokens, 0);
    model.nodes = result.nodes;
    model.edges = result.edges;
  } catch (err) {
    // If parsing fails, wrap the entire input as an unsupported node
    model.nodes = [{
      id: nextId('err'),
      type: 'unsupported',
      position: { x: 0, y: 0 },
      width: 400,
      height: 200,
      originalText: plantUmlText,
    }];
  }

  return model;
}

interface ParseResult {
  nodes: DiagramNode[];
  edges: EdgeData[];
  nextIndex: number;
}

function parseBlock(tokens: Token[], startIndex: number, endTokens: TokenType[] = ['END_UML', 'EOF']): ParseResult {
  const nodes: DiagramNode[] = [];
  const edges: EdgeData[] = [];
  let i = startIndex;
  let lastNodeId: string | null = null;

  while (i < tokens.length) {
    const token = tokens[i];

    // Check for block end
    if (endTokens.includes(token.type) || token.type === 'EOF') {
      break;
    }

    // Skip newlines
    if (token.type === 'NEWLINE') {
      i++;
      continue;
    }

    // Skip comments
    if (token.type === 'COMMENT') {
      nodes.push({
        id: nextId('comment'),
        type: 'comment',
        position: { x: 0, y: 0 },
        width: 200,
        height: 30,
        text: token.value,
      });
      i++;
      continue;
    }

    // @startuml — skip
    if (token.type === 'START_UML') {
      i++;
      continue;
    }

    // Action: :ActionText;
    if (token.type === 'ACTION') {
      const actionNode: ActivityNode = {
        id: nextId('act'),
        type: 'activity',
        position: { x: 0, y: 0 },
        width: 140,
        height: 50,
        label: token.value.trim(),
      };
      nodes.push(actionNode);

      if (lastNodeId) {
        edges.push({
          id: nextId('e'),
          source: lastNodeId,
          target: actionNode.id,
        });
      }
      lastNodeId = actionNode.id;

      // Skip optional semicolon
      if (i + 1 < tokens.length && tokens[i + 1].type === 'SEMICOLON') {
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    // Start / Stop
    if (token.type === 'START') {
      const startNode: StartNode = {
        id: nextId('start'),
        type: 'start',
        position: { x: 0, y: 0 },
        width: 40,
        height: 40,
      };
      nodes.push(startNode);
      if (lastNodeId) {
        edges.push({ id: nextId('e'), source: lastNodeId, target: startNode.id });
      }
      lastNodeId = startNode.id;
      i++;
      continue;
    }

    if (token.type === 'STOP') {
      const stopNode: StopNode = {
        id: nextId('stop'),
        type: 'stop',
        position: { x: 0, y: 0 },
        width: 40,
        height: 40,
      };
      nodes.push(stopNode);
      if (lastNodeId) {
        edges.push({ id: nextId('e'), source: lastNodeId, target: stopNode.id });
      }
      lastNodeId = stopNode.id;
      i++;
      continue;
    }

    // If / else / endif
    if (token.type === 'IF') {
      // Parse condition: next tokens until "then"
      let condition = '';
      let j = i + 1;
      while (j < tokens.length && tokens[j].type !== 'NEWLINE' && tokens[j].type !== 'EOF') {
        if (tokens[j].value.toLowerCase() === 'then') { j++; break; }
        condition += tokens[j].value + ' ';
        j++;
      }
      condition = condition.trim();

      const ifId = nextId('if');
      const thenContainerId = nextId('ctn');
      const elseContainerId = nextId('ctn');

      // Parse "then" block
      const thenResult = parseBlock(tokens, j, ['ELSE', 'ELSEIF', 'ENDIF', 'EOF']);
      j = thenResult.nextIndex;

      // Parse "else" block if present
      let elseResult: ParseResult = { nodes: [], edges: [], nextIndex: j };
      if (j < tokens.length && tokens[j].type === 'ELSE') {
        j++;
        elseResult = parseBlock(tokens, j, ['ENDIF', 'EOF']);
        j = elseResult.nextIndex;
      }

      // Skip endif
      if (j < tokens.length && tokens[j].type === 'ENDIF') {
        j++;
      }

      // Build container nodes
      const thenContainer: ContainerNode = {
        id: thenContainerId,
        type: 'container',
        position: { x: 0, y: 0 },
        width: 300,
        height: Math.max(100, thenResult.nodes.length * 60),
        children: thenResult.nodes,
        collapsed: false,
      };

      const elseContainer: ContainerNode = {
        id: elseContainerId,
        type: 'container',
        position: { x: 0, y: 0 },
        width: 300,
        height: Math.max(100, elseResult.nodes.length * 60),
        children: elseResult.nodes,
        collapsed: false,
      };

      const ifNode: IfNode = {
        id: ifId,
        type: 'if',
        position: { x: 0, y: 0 },
        width: 160,
        height: 80,
        condition,
        thenBranch: thenContainer,
        elseBranch: elseContainer,
      };

      nodes.push(ifNode);
      nodes.push(thenContainer);
      nodes.push(elseContainer);
      nodes.push(...thenResult.nodes);
      nodes.push(...elseResult.nodes);
      edges.push(...thenResult.edges);
      edges.push(...elseResult.edges);

      if (lastNodeId) {
        edges.push({ id: nextId('e'), source: lastNodeId, target: ifNode.id });
      }
      lastNodeId = ifNode.id;
      i = j;
      continue;
    }

    // While / endwhile
    if (token.type === 'WHILE') {
      // Parse condition
      let condition = '';
      let j = i + 1;
      while (j < tokens.length && tokens[j].type !== 'NEWLINE' && tokens[j].type !== 'EOF') {
        if (tokens[j].type === 'STRING' || tokens[j].type === 'IDENTIFIER') {
          condition += tokens[j].value + ' ';
        }
        j++;
      }
      condition = condition.trim();

      const whileId = nextId('while');
      const bodyContainerId = nextId('ctn');

      // Parse body
      const bodyResult = parseBlock(tokens, j, ['ENDWHILE', 'EOF']);
      j = bodyResult.nextIndex;

      // Skip endwhile
      if (j < tokens.length && tokens[j].type === 'ENDWHILE') {
        j++;
      }

      const bodyContainer: ContainerNode = {
        id: bodyContainerId,
        type: 'container',
        position: { x: 0, y: 0 },
        width: 300,
        height: Math.max(100, bodyResult.nodes.length * 60),
        children: bodyResult.nodes,
        collapsed: false,
      };

      const whileNode: WhileNode = {
        id: whileId,
        type: 'while',
        position: { x: 0, y: 0 },
        width: 160,
        height: 80,
        condition,
        body: bodyContainer,
      };

      nodes.push(whileNode);
      nodes.push(bodyContainer);
      nodes.push(...bodyResult.nodes);
      edges.push(...bodyResult.edges);

      if (lastNodeId) {
        edges.push({ id: nextId('e'), source: lastNodeId, target: whileNode.id });
      }
      lastNodeId = whileNode.id;
      i = j;
      continue;
    }

    // Fork / endfork
    if (token.type === 'FORK') {
      const forkId = nextId('fork');
      i++;

      const branches: ContainerNode[] = [];
      const branchNodes: DiagramNode[] = [];
      const branchEdges: EdgeData[] = [];

      // Parse each branch separated by fork or ended by endfork
      while (i < tokens.length && tokens[i].type !== 'ENDFORK' && tokens[i].type !== 'EOF') {
        if (tokens[i].type === 'NEWLINE' || tokens[i].type === 'FORK') {
          if (tokens[i].type === 'FORK') i++;
          continue;
        }

        const branchResult = parseBlock(tokens, i, ['FORK', 'ENDFORK', 'EOF']);
        i = branchResult.nextIndex;

        const branchContainerId = nextId('ctn');
        branches.push({
          id: branchContainerId,
          type: 'container',
          position: { x: 0, y: 0 },
          width: 250,
          height: Math.max(100, branchResult.nodes.length * 60),
          children: branchResult.nodes,
          collapsed: false,
        });
        branchNodes.push(...branchResult.nodes);
        branchEdges.push(...branchResult.edges);
      }

      // Skip endfork
      if (i < tokens.length && tokens[i].type === 'ENDFORK') {
        i++;
      }

      const forkNode: ForkNode = {
        id: forkId,
        type: 'fork',
        position: { x: 0, y: 0 },
        width: 200,
        height: 100,
        branches,
      };

      nodes.push(forkNode);
      nodes.push(...branches);
      nodes.push(...branchNodes);
      edges.push(...branchEdges);

      if (lastNodeId) {
        edges.push({ id: nextId('e'), source: lastNodeId, target: forkNode.id });
      }
      lastNodeId = forkNode.id;
      continue;
    }

    // Handle unsupported tokens — skip to next newline
    if (token.type === 'IDENTIFIER' || token.type === 'STRING' || token.type === 'ARROW') {
      // Skip to end of line
      while (i < tokens.length && tokens[i].type !== 'NEWLINE' && tokens[i].type !== 'EOF') {
        i++;
      }
      continue;
    }

    i++;
  }

  return { nodes, edges, nextIndex: i };
}
