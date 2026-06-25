// Concern B: ReactFlow Canvas Engine — sync events hook
// Implements app-concern-b: ReactFlow Canvas Engine
// See src/canvas/ARCHITECTURE.md for contract

import { useCallback } from 'react';
import {
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
} from 'reactflow';

export interface CanvasChangeEvent {
  type: 'nodesChange' | 'edgesChange';
  nodes: Node[];
  edges: Edge[];
}

export type OnCanvasChange = (event: CanvasChangeEvent) => void;

/**
 * Hook that wires ReactFlow canvas changes to a SyncEngine callback.
 * Collects nodes and edges after each change and invokes the callback.
 */
export function useCanvasSync(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  onChange?: OnCanvasChange
) {
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      onChange?.({ type: 'nodesChange', nodes: updatedNodes, edges });
    },
    [nodes, edges, setNodes, onChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      onChange?.({ type: 'edgesChange', nodes, edges: updatedEdges });
    },
    [nodes, edges, setEdges, onChange]
  );

  return {
    onNodesChange,
    onEdgesChange,
  };
}
