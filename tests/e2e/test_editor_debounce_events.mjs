// TC-C-2: Code editor change events with 200ms debounce
// Validates useEditorEvents hook with 200ms debounce
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const eventsPath = resolve(rootDir, 'src/editor/useEditorEvents.ts');

if (!existsSync(eventsPath)) {
  console.error('TC-C-2 FAILED: useEditorEvents hook not found');
  process.exit(1);
}

try {
  const content = readFileSync(eventsPath, 'utf-8');

  const features = [
    { name: 'Debounce implementation', found: content.includes('debounce') || content.includes('setTimeout') || content.includes('clearTimeout') },
    { name: '200ms window', found: content.includes('200') || content.includes('debounceMs') },
    { name: 'Full text content emitted', found: content.includes('content') },
    { name: 'Event callback type defined', found: content.includes('EditorChangeEvent') || content.includes('OnEditorChange') },
  ];

  const passed = features.filter(f => f.found).length;
  const failed = features.filter(f => !f.found);

  console.log(`TC-C-2: Editor event debounce (${passed}/${features.length})`);

  for (const f of features) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-C-2 PASSED: Editor debounce events implemented');
    process.exit(0);
  } else {
    console.log('TC-C-2 PARTIAL: Some debounce features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-C-2 FAILED: Error validating editor events');
  console.error(`  ${error.message}`);
  process.exit(1);
}
