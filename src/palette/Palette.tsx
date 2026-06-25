// Concern F: Component Palette — main palette component
// Implements app-concern-f: Component Palette
// See src/palette/ARCHITECTURE.md for contract

import React from 'react';
import PaletteCategory from './PaletteCategory';
import { PALETTE_CATEGORIES } from './paletteItems';
import { useDragController } from './DragController';

interface PaletteProps {
  /** Optional CSS width of the palette panel. */
  width?: number;
}

/**
 * Left-panel draggable element palette with 3 collapsible categories:
 * - Flow: Activity, Start, Stop, Connector
 * - Structure: If, While, Fork, Switch
 * - Decoration: Note, Group, Title
 *
 * Each item has a drag preview and can be dropped onto the ReactFlow canvas.
 */
export default function Palette({ width = 240 }: PaletteProps) {
  const { handleDragStart } = useDragController();

  return (
    <div
      style={{
        width,
        height: '100%',
        background: '#fafafa',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          background: '#1976D2',
          color: 'white',
          fontWeight: 600,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>≡</span>
        <span>Elements</span>
      </div>

      {/* Categories */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {PALETTE_CATEGORIES.map((category) => (
          <PaletteCategory
            key={category.id}
            category={category}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: '8px 12px',
          fontSize: 10,
          color: '#999',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        Drag items to canvas
      </div>
    </div>
  );
}
