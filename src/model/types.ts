// Concern A: AST Data Model — TypeScript type definitions
// Implements app-concern-a: AST Data Model
// See src/model/ARCHITECTURE.md for contract

export type NodeType =
  | 'activity'
  | 'start'
  | 'stop'
  | 'if'
  | 'while'
  | 'fork'
  | 'switch'
  | 'container'
  | 'edge'
  | 'note'
  | 'group'
  | 'title'
  | 'comment'
  | 'unsupported';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseNode {
  id: string;
  type: NodeType;
  position: Position;
  width: number;
  height: number;
  label?: string;
}

export interface ActivityNode extends BaseNode {
  type: 'activity';
  label: string;
}

export interface StartNode extends BaseNode {
  type: 'start';
}

export interface StopNode extends BaseNode {
  type: 'stop';
}

export interface IfNode extends BaseNode {
  type: 'if';
  condition: string;
  thenBranch: ContainerNode;
  elseBranch: ContainerNode;
}

export interface WhileNode extends BaseNode {
  type: 'while';
  condition: string;
  body: ContainerNode;
}

export interface ForkNode extends BaseNode {
  type: 'fork';
  branches: ContainerNode[];
}

export interface SwitchNode extends BaseNode {
  type: 'switch';
  expression: string;
  cases: SwitchCase[];
}

export interface SwitchCase {
  label: string;
  body: ContainerNode;
}

export interface ContainerNode extends BaseNode {
  type: 'container';
  children: DiagramNode[];
  collapsed: boolean;
}

export interface CommentNode extends BaseNode {
  type: 'comment';
  text: string;
}

export interface UnsupportedNode extends BaseNode {
  type: 'unsupported';
  originalText: string;
}

export interface NoteNode extends BaseNode {
  type: 'note';
  text: string;
}

export interface GroupNode extends BaseNode {
  type: 'group';
  label: string;
  children: DiagramNode[];
}

export interface TitleNode extends BaseNode {
  type: 'title';
  text: string;
}

export type DiagramNode =
  | ActivityNode
  | StartNode
  | StopNode
  | IfNode
  | WhileNode
  | ForkNode
  | SwitchNode
  | ContainerNode
  | CommentNode
  | UnsupportedNode
  | NoteNode
  | GroupNode
  | TitleNode;

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

export interface DiagramModel {
  nodes: DiagramNode[];
  edges: EdgeData[];
}

// Type guard helpers
export function isActivityNode(node: DiagramNode): node is ActivityNode {
  return node.type === 'activity';
}

export function isStartNode(node: DiagramNode): node is StartNode {
  return node.type === 'start';
}

export function isStopNode(node: DiagramNode): node is StopNode {
  return node.type === 'stop';
}

export function isIfNode(node: DiagramNode): node is IfNode {
  return node.type === 'if';
}

export function isWhileNode(node: DiagramNode): node is WhileNode {
  return node.type === 'while';
}

export function isForkNode(node: DiagramNode): node is ForkNode {
  return node.type === 'fork';
}

export function isSwitchNode(node: DiagramNode): node is SwitchNode {
  return node.type === 'switch';
}

export function isContainerNode(node: DiagramNode): node is ContainerNode {
  return node.type === 'container';
}

export function isCommentNode(node: DiagramNode): node is CommentNode {
  return node.type === 'comment';
}

export function isUnsupportedNode(node: DiagramNode): node is UnsupportedNode {
  return node.type === 'unsupported';
}

export function isNoteNode(node: DiagramNode): node is NoteNode {
  return node.type === 'note';
}

export function isGroupNode(node: DiagramNode): node is GroupNode {
  return node.type === 'group';
}

export function isTitleNode(node: DiagramNode): node is TitleNode {
  return node.type === 'title';
}
