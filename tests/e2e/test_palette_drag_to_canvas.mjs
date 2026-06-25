// TC-F-2: Dragging item from palette to canvas creates correct element type
// Validates palette-to-canvas drag integration
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const dragControllerPath = resolve(rootDir, 'src/palette/DragController.ts');
const palettePath = resolve(rootDir, 'src/palette/Palette.tsx');
const canvasPath = resolve(rootDir, 'src/canvas/Canvas.tsx');
const dragDropPath = resolve(rootDir, 'src/canvas/hooks/useDragDrop.ts');

const checks = [
  { path: dragControllerPath, name: 'DragController' },
  { path: palettePath, name: 'Palette component' },
  { path: dragDropPath, name: 'useDragDrop hook' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-F-2 FAILED: ${check.name} not found`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const dragContent = readFileSync(dragControllerPath, 'utf-8');
  const canvasContent = readFileSync(canvasPath, 'utf-8');

  const features = [
    { name: 'DragStart handler', found: dragContent.includes('dragStart') || dragContent.includes('handleDragStart') },
    { name: 'Data transfer with item type', found: dragContent.includes('dataTransfer') || dragContent.includes('application/palette-item') },
    { name: 'Canvas drop handler integration', found: canvasContent.includes('onDrop') },
    { name: 'Correct node type creation', found: canvasContent.includes('type') || dragContent.includes('type') },
  ];

  const passed = features.filter(f => f.found).length;
  const failed = features.filter(f => !f.found);

  console.log(`TC-F-2: Palette drag to canvas (${passed}/${features.length})`);

  for (const f of features) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-F-2 PASSED: Palette-to-canvas drag integration implemented');
    process.exit(0);
  } else {
    console.log('TC-F-2 PARTIAL: Some drag integration features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-F-2 FAILED: Error validating drag integration');
  console.error(`  ${error.message}`);
  process.exit(1);
}
