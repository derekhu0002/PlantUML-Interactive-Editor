// Concern A: AST Data Model — JSON serialization/deserialization
// Implements app-concern-a: AST Data Model
// See src/model/ARCHITECTURE.md for contract

import {
  DiagramModel,
  DiagramNode,
  EdgeData,
  Position,
  ContainerNode,
  SwitchCase,
} from './types';

/**
 * Serialize a DiagramModel to a JSON-serializable plain object.
 */
export function serializeModel(model: DiagramModel): object {
  return {
    nodes: model.nodes.map(serializeNode),
    edges: model.edges.map(serializeEdge),
  };
}

/**
 * Deserialize a plain JSON object back into a DiagramModel.
 */
export function deserializeModel(data: any): DiagramModel {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid model data: expected an object');
  }
  return {
    nodes: Array.isArray(data.nodes) ? data.nodes.map(deserializeNode) : [],
    edges: Array.isArray(data.edges) ? data.edges.map(deserializeEdge) : [],
  };
}

/**
 * Convert a DiagramModel instance to a JSON string.
 */
export function toJSON(model: DiagramModel): string {
  return JSON.stringify(serializeModel(model), null, 2);
}

/**
 * Parse a JSON string back into a DiagramModel.
 */
export function fromJSON(json: string): DiagramModel {
  const data = JSON.parse(json);
  return deserializeModel(data);
}

/**
 * Deep-clone a DiagramModel.
 */
export function cloneModel(model: DiagramModel): DiagramModel {
  return deserializeModel(serializeModel(model));
}

function serializeNode(node: DiagramNode): object {
  const base: any = {
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    width: node.width,
    height: node.height,
  };

  if (node.label !== undefined) {
    base.label = node.label;
  }

  switch (node.type) {
    case 'activity':
      base.label = node.label;
      break;
    case 'if':
      base.condition = node.condition;
      base.thenBranch = serializeNode(node.thenBranch) as any;
      base.elseBranch = serializeNode(node.elseBranch) as any;
      break;
    case 'while':
      base.condition = node.condition;
      base.body = serializeNode(node.body) as any;
      break;
    case 'fork':
      base.branches = node.branches.map(b => serializeNode(b));
      break;
    case 'switch':
      base.expression = node.expression;
      base.cases = node.cases.map((c: SwitchCase) => ({
        label: c.label,
        body: serializeNode(c.body),
      }));
      break;
    case 'container':
      base.children = node.children.map(serializeNode);
      base.collapsed = node.collapsed;
      break;
    case 'comment':
      base.text = node.text;
      break;
    case 'unsupported':
      base.originalText = node.originalText;
      break;
    case 'note':
      base.text = node.text;
      break;
    case 'group':
      base.label = node.label;
      base.children = node.children.map(serializeNode);
      break;
    case 'title':
      base.text = node.text;
      break;
    case 'start':
    case 'stop':
      break;
  }

  return base;
}

function deserializeNode(data: any): DiagramNode {
  const base = {
    id: data.id,
    type: data.type,
    position: { x: data.position?.x ?? 0, y: data.position?.y ?? 0 } as Position,
    width: data.width ?? 120,
    height: data.height ?? 60,
    label: data.label,
  };

  switch (data.type) {
    case 'activity':
      return { ...base, type: 'activity', label: data.label ?? '' } as any;
    case 'start':
      return { ...base, type: 'start' } as any;
    case 'stop':
      return { ...base, type: 'stop' } as any;
    case 'if':
      return {
        ...base,
        type: 'if',
        condition: data.condition ?? '',
        thenBranch: deserializeNode(data.thenBranch ?? createDefaultContainer()),
        elseBranch: deserializeNode(data.elseBranch ?? createDefaultContainer()),
      } as any;
    case 'while':
      return {
        ...base,
        type: 'while',
        condition: data.condition ?? '',
        body: deserializeNode(data.body ?? createDefaultContainer()),
      } as any;
    case 'fork':
      return {
        ...base,
        type: 'fork',
        branches: Array.isArray(data.branches)
          ? data.branches.map(deserializeNode)
          : [],
      } as any;
    case 'switch':
      return {
        ...base,
        type: 'switch',
        expression: data.expression ?? '',
        cases: Array.isArray(data.cases)
          ? data.cases.map((c: any) => ({
              label: c.label ?? '',
              body: deserializeNode(c.body ?? createDefaultContainer()),
            }))
          : [],
      } as any;
    case 'container':
      return {
        ...base,
        type: 'container',
        children: Array.isArray(data.children)
          ? data.children.map(deserializeNode)
          : [],
        collapsed: data.collapsed ?? false,
      } as any;
    case 'comment':
      return { ...base, type: 'comment', text: data.text ?? '' } as any;
    case 'unsupported':
      return {
        ...base,
        type: 'unsupported',
        originalText: data.originalText ?? '',
      } as any;
    case 'note':
      return { ...base, type: 'note', text: data.text ?? '' } as any;
    case 'group':
      return {
        ...base,
        type: 'group',
        label: data.label ?? '',
        children: Array.isArray(data.children)
          ? data.children.map(deserializeNode)
          : [],
      } as any;
    case 'title':
      return { ...base, type: 'title', text: data.text ?? '' } as any;
    default:
      return { ...base, type: 'unsupported', originalText: '' } as any;
  }
}

function serializeEdge(edge: EdgeData): object {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type,
  };
}

function deserializeEdge(data: any): EdgeData {
  return {
    id: data.id,
    source: data.source,
    target: data.target,
    label: data.label,
    sourceHandle: data.sourceHandle,
    targetHandle: data.targetHandle,
    type: data.type,
  };
}

function createDefaultContainer(): ContainerNode {
  return {
    id: '',
    type: 'container',
    position: { x: 0, y: 0 },
    width: 200,
    height: 100,
    children: [],
    collapsed: false,
  };
}
