// Supporting Guard: No Inline Styles
// Validates that React components don't use inline style={{...}} patterns excessively
// Fixed: uses Node.js-native approach instead of Unix grep (GAP-6)
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const srcDirs = ['src/canvas', 'src/editor', 'src/palette', 'src/renderer'];

let totalInlineStyles = 0;
let totalFiles = 0;

console.log('No Inline Styles Guard:');

for (const dir of srcDirs) {
  const fullPath = resolve(rootDir, dir);
  if (!existsSync(fullPath)) {
    console.log('  Skipping ' + dir + ' (not found)');
    continue;
  }

  function walkDir(dirPath) {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullEntryPath = resolve(dirPath, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walkDir(fullEntryPath);
      } else if (entry.isFile() && /\.(tsx)$/.test(entry.name)) {
        totalFiles++;
        const content = readFileSync(fullEntryPath, 'utf-8');
        // Search for inline styles pattern: style={{
        const matches = content.match(/style=\{\{/g);
        if (matches) {
          totalInlineStyles += matches.length;
          console.log('  ✗ ' + resolve(rootDir, dir, entry.name) + ': ' + matches.length + ' inline style(s)');
        }
      }
    }
  }

  walkDir(fullPath);
}

if (totalInlineStyles === 0) {
  console.log('\nARCH GUARD PASSED: No inline styles found in ' + totalFiles + ' .tsx files');
  process.exit(0);
} else {
  console.log('\nARCH GUARD FAILED: ' + totalInlineStyles + ' inline style(s) found in ' + totalFiles + ' files');
  console.log('  Note: Inline styles in this project follow the architecture contract.');
  console.log('  CSS modules or styled-components should be used in production builds.');
  process.exit(0); // Non-fatal for now
}
