// Concern F: Component Palette — drag controller
// Implements app-concern-f: Component Palette
// See src/palette/ARCHITECTURE.md for contract

import { useCallback } from 'react';
import { PaletteItemDef } from './paletteItems';

/**
 * Coordinates drag events between palette items and the canvas drop target.
 * Sets the drag data with item type, label, and dimensions so the canvas
 * onDrop handler can create the correct node type at the drop position.
 */
export function useDragController() {
  /**
   * Handle drag start for a palette item.
   * Serializes the item data into the dataTransfer for the canvas onDrop handler.
   */
  const handleDragStart = useCallback(
    (item: PaletteItemDef) => (event: React.DragEvent) => {
      // Set drag data
      const dragData = {
        type: item.type,
        label: item.label,
        width: item.defaultWidth,
        height: item.defaultHeight,
      };

      event.dataTransfer.setData('application/palette-item', JSON.stringify(dragData));
      event.dataTransfer.effectAllowed = 'copy';

      // Set drag image (simple approach: use a ghost element)
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position: absolute;
        top: -1000px;
        padding: 6px 12px;
        background: ${item.color};
        color: white;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        pointer-events: none;
      `;
      ghost.textContent = item.label;
      document.body.appendChild(ghost);
      event.dataTransfer.setDragImage(ghost, 30, 15);

      // Clean up ghost after drag starts
      setTimeout(() => {
        document.body.removeChild(ghost);
      }, 0);
    },
    []
  );

  return { handleDragStart };
}
