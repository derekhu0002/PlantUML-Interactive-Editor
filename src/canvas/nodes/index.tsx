// Concern B: ReactFlow Canvas Engine — custom node renderers
// Implements app-concern-b: ReactFlow Canvas Engine
// See src/canvas/ARCHITECTURE.md for contract

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  start: { bg: '#4CAF50', border: '#388E3C', text: '#fff' },
  stop: { bg: '#f44336', border: '#d32f2f', text: '#fff' },
  activity: { bg: '#E3F2FD', border: '#1E88E5', text: '#1565C0' },
  if: { bg: '#FFF3E0', border: '#FB8C00', text: '#E65100' },
  while: { bg: '#F3E5F5', border: '#8E24AA', text: '#4A148C' },
  fork: { bg: '#E0F2F1', border: '#00897B', text: '#004D40' },
  switch: { bg: '#FCE4EC', border: '#D81B60', text: '#880E4F' },
  container: { bg: '#ECEFF1', border: '#607D8B', text: '#37474F' },
  default: { bg: '#FAFAFA', border: '#BDBDBD', text: '#212121' },
};

function getColors(type: string) {
  return nodeColors[type] || nodeColors.default;
}

/** Base node wrapper with consistent styling. */
function NodeWrapper({
  children,
  type,
  selected,
  style,
  showHandles = true,
}: {
  children: React.ReactNode;
  type: string;
  selected?: boolean;
  style?: React.CSSProperties;
  showHandles?: boolean;
}) {
  const colors = getColors(type);
  return (
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${selected ? '#FF5722' : colors.border}`,
        borderRadius: type === 'start' || type === 'stop' ? '50%' : '8px',
        padding: '8px 12px',
        minWidth: 100,
        minHeight: 40,
        fontSize: 12,
        color: colors.text,
        fontFamily: 'monospace',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 8px rgba(255,87,34,0.4)' : '0 1px 3px rgba(0,0,0,0.12)',
        ...style,
      }}
    >
      {showHandles && (
        <>
          <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
          <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        </>
      )}
      {children}
    </div>
  );
}

/** StartNode: green circle */
export function StartNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="start" selected={selected} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 18 }}>▶</div>
    </NodeWrapper>
  );
}

/** StopNode: red circle */
export function StopNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="stop" selected={selected} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 18 }}>●</div>
    </NodeWrapper>
  );
}

/** ActivityNode: rounded rectangle with label */
export function ActivityNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="activity" selected={selected}>
      <div style={{ fontWeight: 500 }}>{data.label || 'Activity'}</div>
    </NodeWrapper>
  );
}

/** IfNode: diamond shape condition */
export function IfNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="if" selected={selected} showHandles={false}>
      <div style={{ fontWeight: 500, textAlign: 'center' }}>
        <div>◇</div>
        <div>{data.condition || 'Condition'}</div>
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} id="then" />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} id="else" />
    </NodeWrapper>
  );
}

/** WhileNode: loop with condition */
export function WhileNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="while" selected={selected}>
      <div style={{ fontWeight: 500 }}>
        <span style={{ marginRight: 4 }}>↻</span>
        {data.condition || 'Loop'}
      </div>
    </NodeWrapper>
  );
}

/** ForkNode: parallel branches */
export function ForkNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="fork" selected={selected}>
      <div style={{ fontWeight: 500, textAlign: 'center' }}>
        <div>━ ━</div>
        <div style={{ fontSize: 10 }}>{data.label || 'Fork'}</div>
      </div>
    </NodeWrapper>
  );
}

/** SwitchNode: case branching */
export function SwitchNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="switch" selected={selected}>
      <div style={{ fontWeight: 500 }}>
        <span style={{ marginRight: 4 }}>⊞</span>
        {data.expression || 'Switch'}
      </div>
    </NodeWrapper>
  );
}

/** ContainerNode: visual grouping */
export function ContainerNode({ data, selected }: NodeProps) {
  return (
    <NodeWrapper type="container" selected={selected} showHandles={false}>
      <div style={{ fontWeight: 500, fontSize: 11, opacity: 0.7 }}>
        {data.label || 'Container'}
      </div>
    </NodeWrapper>
  );
}

/** Map of node types to their renderer components. */
export const nodeTypes = {
  start: StartNode,
  stop: StopNode,
  activity: ActivityNode,
  if: IfNode,
  while: WhileNode,
  fork: ForkNode,
  switch: SwitchNode,
  container: ContainerNode,
  comment: ActivityNode, // Fallback to activity-like
  unsupported: ActivityNode,
  note: ContainerNode,
  group: ContainerNode,
  title: ActivityNode,
} as const;
