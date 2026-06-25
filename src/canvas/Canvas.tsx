// Concern B: ReactFlow Canvas Engine — main canvas component
// Implements app-concern-b: ReactFlow Canvas Engine
// See src/canvas/ARCHITECTURE.md for contract

import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from './nodes';
import { useDragDrop } from './hooks/useDragDrop';
import { useCanvasSync, CanvasChangeEvent } from './hooks/useCanvasSync';
import { DiagramModel } from '../model/types';

interface CanvasProps {
  /** Initial model to render. */
  initialModel?: DiagramModel | null;
  /** Callback fired on any canvas change (node move, add, connect). */
  onCanvasChange?: (event: CanvasChangeEvent) => void;
  /** External handler to add nodes (from palette drop). */
  onDropItem?: (item: { type: string; label?: string; width?: number; height?: number }) => void;
}

/**
 * ReactFlow-based free-form canvas with custom node renderers.
 * Supports drag-and-drop (3 levels), free positioning, connection handles.
 */
function CanvasInner({ initialModel, onCanvasChange, onDropItem }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { onDrop, onConnect, onDragOver, nextId } = useDragDrop();

  // Wire canvas sync
  const { onNodesChange: syncNodesChange, onEdgesChange: syncEdgesChange } = useCanvasSync(
    nodes,
    edges,
    setNodes,
    setEdges,
    onCanvasChange
  );

  // Initialize from model
  useEffect(() => {
    if (initialModel && initialModel.nodes.length > 0) {
      const rfNodes: Node[] = initialModel.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: { label: (n as any).label || n.type, ...n },
        width: n.width,
        height: n.height,
      }));
      const rfEdges: Edge[] = initialModel.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type || 'default',
      }));
      setNodes(rfNodes);
      setEdges(rfEdges);
    }
  }, [initialModel]);

  // Handle palette drop via prop
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      const itemData = event.dataTransfer.getData('application/palette-item');
      if (itemData) {
        try {
          const item = JSON.parse(itemData);
          onDrop(event, item);
        } catch {
          onDrop(event);
        }
      } else {
        onDrop(event);
      }
    },
    [onDrop]
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          syncNodesChange(changes);
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          syncEdgesChange(changes);
        }}
        onConnect={onConnect}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes as unknown as NodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        snapToGrid
        snapGrid={[10, 10]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background color="#f0f0f0" gap={20} />
        <Controls />
        <MiniMap
          nodeStrokeColor="#666"
          nodeColor="#e0e0e0"
          maskColor="rgba(0,0,0,0.1)"
          style={{ bottom: 10, right: 10 }}
        />
      </ReactFlow>
    </div>
  );
}

/**
 * Canvas wrapper with ReactFlowProvider.
 */
export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export { CanvasInner, nodeTypes };
