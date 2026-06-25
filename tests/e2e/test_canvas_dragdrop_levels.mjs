// TC-B-2: Canvas supports all 3 drag-and-drop levels
// Validates Level A (palette→canvas), Level B (reposition), Level C (connector)
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const useDragDropPath = resolve(rootDir, 'src/canvas/hooks/useDragDrop.ts');
const canvasPath = resolve(rootDir, 'src/canvas/Canvas.tsx');

if (!existsSync(useDragDropPath)) {
  console.error('TC-B-2 FAILED: useDragDrop hook not found');
  process.exit(1);
}

try {
  const dragDropContent = readFileSync(useDragDropPath, 'utf-8');
  const canvasContent = readFileSync(canvasPath, 'utf-8');

  const levels = [
    { name: 'Level A: Palette→Canvas (onDrop)', found: dragDropContent.includes('onDrop') },
    { name: 'Level B: Reposition (onNodeDragStop)', found: canvasContent.includes('onNodeDrag') || dragDropContent.includes('onNodeDrag') },
    { name: 'Level C: Connector (onConnect)', found: dragDropContent.includes('onConnect') },
    { name: 'DragOver handler', found: dragDropContent.includes('onDragOver') },
  ];

  const passed = levels.filter(l => l.found).length;
  const failed = levels.filter(l => !l.found);

  console.log(`TC-B-2: Drag-and-drop levels (${passed}/${levels.length})`);

  for (const l of levels) {
    console.log(`  ${l.found ? '✓' : '✗'} ${l.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-B-2 PASSED: All drag-and-drop levels implemented');
    process.exit(0);
  } else {
    console.log('TC-B-2 PARTIAL: Some drag-and-drop levels not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-B-2 FAILED: Error validating drag-and-drop');
  console.error(`  ${error.message}`);
  process.exit(1);
}
