// Concern B: ReactFlow Canvas Engine — drag-and-drop hook
// Implements app-concern-b: ReactFlow Canvas Engine
// See src/canvas/ARCHITECTURE.md for contract

import { useCallback, useRef } from 'react';
import { useReactFlow, XYPosition, Node, Edge, Connection } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export interface DropItem {
  type: string;
  label?: string;
  width?: number;
  height?: number;
}

/**
 * Hook providing 3 levels of drag-and-drop:
 * - Level A: palette→canvas (onDrop handler, create node at drop coords)
 * - Level B: reposition (built-in ReactFlow onNodeDragStop)
 * - Level C: connector (onConnect, create edge between nodes)
 */
export function useDragDrop() {
  const reactFlowInstance = useReactFlow();
  const idCounter = useRef(0);

  const nextId = useCallback((prefix: string = 'n') => {
    return `${prefix}_${++idCounter.current}_${uuidv4().slice(0, 8)}`;
  }, []);

  /**
   * Level A: Handle drop from palette onto canvas.
   * Creates a new node of the correct type at the drop coordinates.
   */
  const onDrop = useCallback(
    (event: React.DragEvent, dropItem?: DropItem) => {
      event.preventDefault();

      let item: DropItem | null = dropItem || null;

      // Try to get from dataTransfer if not provided directly
      if (!item) {
        try {
          const data = event.dataTransfer.getData('application/palette-item');
          if (data) {
            item = JSON.parse(data);
          }
        } catch {
          // fallback to no item
        }
      }

      if (!item) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: nextId(item.type),
        type: item.type,
        position,
        data: {
          label: item.label || item.type.charAt(0).toUpperCase() + item.type.slice(1),
          condition: '',
          expression: '',
        },
        width: item.width || 140,
        height: item.height || 50,
      };

      reactFlowInstance.addNodes(newNode);
    },
    [reactFlowInstance, nextId]
  );

  /**
   * Level C: Handle connect (connector handle drag).
   * Creates a directed edge between two nodes.
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: nextId('e'),
        source: connection.source || '',
        target: connection.target || '',
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        type: 'default',
        animated: false,
      };
      reactFlowInstance.addEdges(newEdge);
    },
    [reactFlowInstance, nextId]
  );

  /**
   * Prevent default to allow drop.
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return {
    onDrop,
    onConnect,
    onDragOver,
    nextId,
  };
}
