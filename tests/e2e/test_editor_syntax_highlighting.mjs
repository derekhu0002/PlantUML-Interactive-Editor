// TC-C-1: Ace Editor wrapper with PlantUML syntax highlighting
// Validates editor wrapper component exists with PlantUML mode
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const editorPath = resolve(rootDir, 'src/editor/AceEditorWrapper.tsx');
const modePath = resolve(rootDir, 'src/editor/plantumlMode.ts');

const checks = [
  { path: editorPath, name: 'Ace Editor wrapper component' },
  { path: modePath, name: 'PlantUML syntax mode' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-C-1 FAILED: ${check.name} not found`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const editorContent = readFileSync(editorPath, 'utf-8');
  const modeContent = readFileSync(modePath, 'utf-8');

  const features = [
    { name: 'React Ace component used', found: editorContent.includes('react-ace') || editorContent.includes('reactace') || editorContent.includes('AceEditor') },
    { name: 'Editor read/write mode', found: editorContent.includes('readOnly') },
    { name: 'Line numbers visible', found: editorContent.includes('showLineNumbers') || editorContent.includes('showGutter') },
    { name: 'PlantUML mode defined', found: modeContent.includes('plantuml') || modeContent.includes('PlantUML') },
    { name: 'OnChange handler', found: editorContent.includes('onChange') },
  ];

  const passed = features.filter(f => f.found).length;
  const failed = features.filter(f => !f.found);

  console.log(`TC-C-1: Editor syntax highlighting (${passed}/${features.length})`);

  for (const f of features) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-C-1 PASSED: Editor wrapper with PlantUML highlighting implemented');
    process.exit(0);
  } else {
    console.log('TC-C-1 PARTIAL: Some editor features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-C-1 FAILED: Error validating editor');
  console.error(`  ${error.message}`);
  process.exit(1);
}
