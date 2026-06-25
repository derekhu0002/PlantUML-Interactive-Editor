// Concern E: PlantUML Generator — AST to PlantUML text
// Implements app-concern-e: PlantUML Generator
// See src/generator/ARCHITECTURE.md for contract

import {
  DiagramModel,
  DiagramNode,
  IfNode,
  WhileNode,
  ForkNode,
  SwitchNode,
  ContainerNode,
  CommentNode,
  UnsupportedNode,
  NoteNode,
  GroupNode,
  TitleNode,
  isIfNode,
  isWhileNode,
  isForkNode,
  isSwitchNode,
  isContainerNode,
  isCommentNode,
  isUnsupportedNode,
  isNoteNode,
  isGroupNode,
  isTitleNode,
} from '../model/types';
import { Indentation } from './indentation';

/**
 * Generate valid PlantUML text from a DiagramModel AST.
 * Uses depth-tracked indentation (2 spaces per nesting level).
 * No positional/CSS data in generated output.
 * Output starts with @startuml and ends with @enduml.
 */
export function generate(model: DiagramModel): string {
  const indent = new Indentation();
  const lines: string[] = [];

  lines.push('@startuml');

  for (const node of model.nodes) {
    generateNode(node, lines, indent);
  }

  // Generate edge statements
  for (const edge of model.edges) {
    lines.push(`${indent.current}${edge.source} -> ${edge.target}${edge.label ? ` : ${edge.label}` : ''}`);
  }

  lines.push('@enduml');
  return lines.join('\n') + '\n';
}

function generateNode(node: DiagramNode, lines: string[], indent: Indentation): void {
  switch (node.type) {
    case 'activity':
      lines.push(`${indent.current}:${(node as any).label};`);
      break;

    case 'start':
      lines.push(`${indent.current}start`);
      break;

    case 'stop':
      lines.push(`${indent.current}stop`);
      break;

    case 'if':
      generateIf(node as IfNode, lines, indent);
      break;

    case 'while':
      generateWhile(node as WhileNode, lines, indent);
      break;

    case 'fork':
      generateFork(node as ForkNode, lines, indent);
      break;

    case 'switch':
      generateSwitch(node as SwitchNode, lines, indent);
      break;

    case 'container':
      generateContainer(node as ContainerNode, lines, indent);
      break;

    case 'comment':
      lines.push(`${indent.current}'${(node as CommentNode).text}`);
      break;

    case 'unsupported':
      lines.push(`${indent.current}' UNSUPPORTED: ${(node as UnsupportedNode).originalText}`);
      break;

    case 'note':
      generateNote(node as NoteNode, lines, indent);
      break;

    case 'group':
      generateGroup(node as GroupNode, lines, indent);
      break;

    case 'title':
      lines.push(`${indent.current}title ${(node as TitleNode).text}`);
      break;
  }
}

function generateIf(node: IfNode, lines: string[], indent: Indentation): void {
  lines.push(`${indent.current}if (${node.condition}) then`);
  indent.withIndent(() => {
    for (const child of node.thenBranch.children) {
      generateNode(child, lines, indent);
    }
  });

  if (node.elseBranch.children.length > 0) {
    lines.push(`${indent.current}else`);
    indent.withIndent(() => {
      for (const child of node.elseBranch.children) {
        generateNode(child, lines, indent);
      }
    });
  }

  lines.push(`${indent.current}endif`);
}

function generateWhile(node: WhileNode, lines: string[], indent: Indentation): void {
  lines.push(`${indent.current}while (${node.condition})`);
  indent.withIndent(() => {
    for (const child of node.body.children) {
      generateNode(child, lines, indent);
    }
  });
  lines.push(`${indent.current}endwhile`);
}

function generateFork(node: ForkNode, lines: string[], indent: Indentation): void {
  for (let i = 0; i < node.branches.length; i++) {
    if (i === 0) {
      lines.push(`${indent.current}fork`);
    } else {
      lines.push(`${indent.current}fork again`);
    }
    indent.withIndent(() => {
      for (const child of node.branches[i].children) {
        generateNode(child, lines, indent);
      }
    });
  }
  lines.push(`${indent.current}endfork`);
}

function generateSwitch(node: SwitchNode, lines: string[], indent: Indentation): void {
  lines.push(`${indent.current}switch (${node.expression})`);
  for (const c of node.cases) {
    lines.push(`${indent.current}case (${c.label})`);
    indent.withIndent(() => {
      for (const child of c.body.children) {
        generateNode(child, lines, indent);
      }
    });
  }
  lines.push(`${indent.current}endswitch`);
}

function generateContainer(container: ContainerNode, lines: string[], indent: Indentation): void {
  // Containers are transparent in generation — render children inline
  for (const child of container.children) {
    generateNode(child, lines, indent);
  }
}

function generateNote(node: NoteNode, lines: string[], indent: Indentation): void {
  lines.push(`${indent.current}note`);
  indent.withIndent(() => {
    lines.push(`${indent.current}${node.text}`);
  });
  lines.push(`${indent.current}endnote`);
}

function generateGroup(node: GroupNode, lines: string[], indent: Indentation): void {
  lines.push(`${indent.current}group ${node.label || ''}`);
  indent.withIndent(() => {
    for (const child of node.children) {
      generateNode(child, lines, indent);
    }
  });
  lines.push(`${indent.current}endgroup`);
}
