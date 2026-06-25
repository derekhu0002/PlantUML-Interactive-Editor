// Renderer Integration — three-panel layout
// Implements biz-service-editing: Diagram Editing Service
// See src/renderer/ARCHITECTURE.md for contract

import React, { useState, useCallback } from 'react';

interface AppLayoutProps {
  palette: React.ReactNode;
  canvas: React.ReactNode;
  editor: React.ReactNode;
}

/**
 * Three-panel layout: Palette (left) | Canvas (center) | Editor (right).
 * The editor width is adjustable via a horizontal drag handle.
 */
export default function AppLayout({ palette, canvas, editor }: AppLayoutProps) {
  const [editorWidth, setEditorWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(800, window.innerWidth - e.clientX));
      setEditorWidth(newWidth);
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left: Palette */}
      <div style={{ flexShrink: 0, height: '100%' }}>
        {palette}
      </div>

      {/* Center: Canvas */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        {canvas}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: 4,
          cursor: 'col-resize',
          background: isResizing ? '#1976D2' : '#e0e0e0',
          transition: isResizing ? 'none' : 'background 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!isResizing) (e.currentTarget as HTMLElement).style.background = '#bdbdbd';
        }}
        onMouseLeave={(e) => {
          if (!isResizing) (e.currentTarget as HTMLElement).style.background = '#e0e0e0';
        }}
      />

      {/* Right: Editor */}
      <div style={{ width: editorWidth, height: '100%', flexShrink: 0 }}>
        {editor}
      </div>
    </div>
  );
}
