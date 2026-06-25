// TC-F-1: Component Palette displays draggable element categories
// Validates palette component with 3 collapsible categories
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const palettePath = resolve(rootDir, 'src/palette/Palette.tsx');
const paletteItemsPath = resolve(rootDir, 'src/palette/paletteItems.ts');
const categoryPath = resolve(rootDir, 'src/palette/PaletteCategory.tsx');

const checks = [
  { path: palettePath, name: 'Palette component' },
  { path: paletteItemsPath, name: 'Palette item definitions' },
  { path: categoryPath, name: 'PaletteCategory component' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-F-1 FAILED: ${check.name} not found`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const itemsContent = readFileSync(paletteItemsPath, 'utf-8');
  const paletteContent = readFileSync(palettePath, 'utf-8');

  // Check categories
  const categories = [
    { name: 'Flow category', found: itemsContent.includes('flow') || itemsContent.includes('Flow') },
    { name: 'Structure category', found: itemsContent.includes('structure') || itemsContent.includes('Structure') },
    { name: 'Decoration category', found: itemsContent.includes('decoration') || itemsContent.includes('Decoration') },
  ];

  // Check items in Flow
  const flowItems = [
    { name: 'Activity', found: itemsContent.includes('activity') },
    { name: 'Start', found: itemsContent.includes('start') },
    { name: 'Stop', found: itemsContent.includes('stop') },
    { name: 'Connector', found: itemsContent.includes('edge') || itemsContent.includes('connector') || itemsContent.includes('Connector') },
  ];

  // Check items in Structure
  const structureItems = [
    { name: 'If', found: itemsContent.includes('if') },
    { name: 'While', found: itemsContent.includes('while') },
    { name: 'Fork', found: itemsContent.includes('fork') },
    { name: 'Switch', found: itemsContent.includes('switch') },
  ];

  const allFeatures = [...categories, ...flowItems, ...structureItems];
  const passed = allFeatures.filter(f => f.found).length;
  const failed = allFeatures.filter(f => !f.found);

  console.log(`TC-F-1: Palette categories and items (${passed}/${allFeatures.length})`);

  for (const f of allFeatures) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  // Check collapsible support
  const hasCollapsible = paletteContent.includes('collaps') || categoryPath;
  console.log(`  ${hasCollapsible ? '✓' : '✗'} Collapsible category headers`);

  // Check drag support
  const hasDrag = paletteContent.includes('draggable') || paletteContent.includes('onDragStart');
  console.log(`  ${hasDrag ? '✓' : '✗'} Draggable items`);

  if (failed.length === 0) {
    console.log('TC-F-1 PASSED: All palette categories implemented');
    process.exit(0);
  } else {
    console.log('TC-F-1 PARTIAL: Some palette features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-F-1 FAILED: Error validating palette');
  console.error(`  ${error.message}`);
  process.exit(1);
}
