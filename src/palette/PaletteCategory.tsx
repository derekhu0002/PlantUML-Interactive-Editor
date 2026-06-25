// Concern F: Component Palette — collapsible category
// Implements app-concern-f: Component Palette
// See src/palette/ARCHITECTURE.md for contract

import React, { useState, useCallback } from 'react';
import { PaletteCategoryDef, PaletteItemDef } from './paletteItems';

interface PaletteCategoryProps {
  category: PaletteCategoryDef;
  onDragStart: (item: PaletteItemDef) => (event: React.DragEvent) => void;
}

/**
 * Collapsible category section with draggable items.
 * Each item can be dragged onto the ReactFlow canvas.
 */
export default function PaletteCategory({ category, onDragStart }: PaletteCategoryProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Category header */}
      <div
        onClick={toggleCollapse}
        style={{
          padding: '8px 12px',
          background: '#f5f5f5',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
          userSelect: 'none',
          fontSize: 12,
          fontWeight: 600,
          color: '#424242',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        <span>{category.label}</span>
        <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </div>

      {/* Items */}
      {!collapsed && (
        <div style={{ padding: '4px 0' }}>
          {category.items.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={onDragStart(item)}
              style={{
                padding: '6px 12px',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: '#333',
                transition: 'background 0.15s',
                borderLeft: `3px solid ${item.color}`,
                margin: '2px 0',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{item.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 10, color: '#999' }}>{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
