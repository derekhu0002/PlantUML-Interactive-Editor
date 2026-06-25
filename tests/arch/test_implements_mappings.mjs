// Key Implementation Traceability Guard: Implements Mappings
// Validates each architecture concern maps to at least one source module
// with documented responsibility
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');

const concerns = [
  { id: 'app-concern-a', name: 'A: AST Data Model', modulePath: 'src/model', archFile: 'src/model/ARCHITECTURE.md' },
  { id: 'app-concern-b', name: 'B: ReactFlow Canvas', modulePath: 'src/canvas', archFile: 'src/canvas/ARCHITECTURE.md' },
  { id: 'app-concern-c', name: 'C: Ace Editor Wrapper', modulePath: 'src/editor', archFile: 'src/editor/ARCHITECTURE.md' },
  { id: 'app-concern-d', name: 'D: Bidirectional Sync', modulePath: 'src/sync', archFile: 'src/sync/ARCHITECTURE.md' },
  { id: 'app-concern-e', name: 'E: Parser & Generator', modulePath: 'src/parser,src/generator', archFile: 'src/parser/ARCHITECTURE.md,src/generator/ARCHITECTURE.md' },
  { id: 'app-concern-f', name: 'F: Component Palette', modulePath: 'src/palette', archFile: 'src/palette/ARCHITECTURE.md' },
  { id: 'app-concern-g', name: 'G: Electron Shell', modulePath: 'src/main', archFile: 'src/main/ARCHITECTURE.md' },
];

const missingConcerns = [];

for (const concern of concerns) {
  const modulePaths = concern.modulePath.split(',');
  const archFiles = concern.archFile.split(',');

  // Check ARCHITECTURE.md exists
  const archExists = archFiles.every(function(f) { return existsSync(resolve(rootDir, f.trim())); });

  // Check module directory exists
  const moduleExists = modulePaths.every(function(m) { return existsSync(resolve(rootDir, m.trim())); });

  if (!archExists) {
    missingConcerns.push({ concern: concern, reason: 'ARCHITECTURE.md missing' });
    continue;
  }

  if (!moduleExists) {
    missingConcerns.push({ concern: concern, reason: 'Module directory missing' });
    continue;
  }

  // Check at least one .ts file has a header comment referencing the concern
  let hasReference = false;
  for (const modPath of modulePaths) {
    const fullPath = resolve(rootDir, modPath.trim());
    try {
      const files = readdirSync(fullPath, { withFileTypes: true });
      for (const file of files) {
        if (file.isFile() && /\.(ts|tsx)$/.test(file.name)) {
          const fileContent = readFileSync(resolve(fullPath, file.name), 'utf-8');
          if (fileContent.includes(concern.id) || fileContent.includes(concern.name.split(':')[0].trim())) {
            hasReference = true;
            break;
          }
        }
      }
    } catch (err) {
      // Directory not readable
    }
    if (hasReference) break;
  }

  if (!hasReference) {
    missingConcerns.push({ concern: concern, reason: 'No .ts file with concern reference header comment' });
  }
}

console.log('Implementation Traceability Guard:');

for (const concern of concerns) {
  const isMissing = missingConcerns.find(function(m) { return m.concern.id === concern.id; });
  if (isMissing) {
    console.log('  ✗ ' + concern.name + ' — ' + isMissing.reason);
  } else {
    console.log('  ✓ ' + concern.name);
  }
}

if (missingConcerns.length === 0) {
  console.log('\nARCH GUARD PASSED: All concerns have ARCHITECTURE.md and source module with documented responsibility');
  process.exit(0);
} else {
  console.log('\nARCH GUARD FAILED: ' + missingConcerns.length + ' concerns missing mappings');
  process.exit(1);
}
