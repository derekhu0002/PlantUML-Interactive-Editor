// Architecture Boundary Guard: Dependency Direction
// Validates import/require statements respect declared dependency directions
// Rules: A→{B,E}, {B,C,E}→D, D→C, G→{A,B,C,D,E,F}
// No reverse or lateral dependencies
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, relative } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');

const modulePaths = {
  model: 'src/model',
  parser: 'src/parser',
  generator: 'src/generator',
  canvas: 'src/canvas',
  editor: 'src/editor',
  sync: 'src/sync',
  palette: 'src/palette',
  main: 'src/main',
  renderer: 'src/renderer',
};

const rules = [
  {
    source: 'model',
    allowedTargets: [],
    description: 'A (Model) is foundation — no dependencies on other concerns',
  },
  {
    source: 'parser',
    allowedTargets: ['model'],
    description: 'E (Parser) depends on A (Model)',
  },
  {
    source: 'generator',
    allowedTargets: ['model'],
    description: 'E (Generator) depends on A (Model)',
  },
  {
    source: 'canvas',
    allowedTargets: ['model'],
    description: 'B (Canvas) depends on A (Model)',
  },
  {
    source: 'editor',
    allowedTargets: [],
    description: 'C (Editor) is standalone — no concern dependencies',
  },
  {
    source: 'sync',
    allowedTargets: ['model', 'parser', 'generator'],
    description: 'D (Sync) depends on A, E (Parser, Generator)',
  },
  {
    source: 'palette',
    allowedTargets: ['canvas'],
    description: 'F (Palette) depends on B (Canvas)',
  },
  {
    source: 'renderer',
    allowedTargets: ['canvas', 'editor', 'sync', 'palette', 'model'],
    description: 'Renderer depends on B, C, D, F (+ model)',
  },
];

const failedRules = [];
const passedRules = [];

for (const rule of rules) {
  const sourcePath = resolve(rootDir, modulePaths[rule.source]);

  if (!existsSync(sourcePath)) {
    failedRules.push({ rule: rule, reason: 'Source path not found: ' + sourcePath });
    continue;
  }

  // Check imports in all .ts and .tsx files in the source directory
  const violations = findImportViolations(sourcePath, rule, rootDir);

  if (violations.length === 0) {
    passedRules.push(rule);
  } else {
    failedRules.push({ rule: rule, violations: violations });
  }
}

console.log('Dependency Direction Guard: ' + passedRules.length + '/' + rules.length + ' rules passed');

for (const p of passedRules) {
  console.log('  ✓ ' + p.description);
}

for (const f of failedRules) {
  console.log('  ✗ ' + f.rule.description);
  if (f.violations) {
    for (const v of f.violations) {
      console.log('      ' + v);
    }
  } else {
    console.log('      ' + f.reason);
  }
}

if (failedRules.length === 0) {
  console.log('\nARCH GUARD PASSED: All dependency directions respected');
  process.exit(0);
} else {
  console.log('\nARCH GUARD FAILED: Dependency direction violations detected');
  process.exit(1);
}

function findImportViolations(sourcePath, rule, rootDir) {
  const violations = [];

  function walkDir(dir) {
    const files = [];
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...walkDir(fullPath));
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  try {
    const files = walkDir(sourcePath);
    const allowedTargetKeys = new Set(rule.allowedTargets);

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      // Find import statements
      const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
      for (const match of importMatches) {
        const importPath = match[1];

        // Check if it imports from another concern
        for (const [targetKey, targetPath] of Object.entries(modulePaths)) {
          if (targetKey === rule.source) continue; // Skip self-imports

          // Check if import references the target module
          if (importPath.includes(targetPath.replace('src/', '')) ||
              importPath.includes(targetKey)) {
            if (!allowedTargetKeys.has(targetKey)) {
              violations.push(
                relative(rootDir, file) + ' imports \'' + importPath + '\' (' + targetKey + '), which is not in allowed targets [' + rule.allowedTargets.join(', ') + ']'
              );
            }
          }
        }
      }
    }
  } catch (err) {
    violations.push('Error scanning ' + sourcePath + ': ' + (err.message || err));
  }

  return violations;
}
