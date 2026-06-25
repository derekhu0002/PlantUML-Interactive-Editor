// Architecture Test Runner Integration
// Verifies all acceptance test entrypoints are discoverable and executable
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');

// Test directories to scan
const testDirs = [
  'tests/model',
  'tests/parser',
  'tests/generator',
  'tests/e2e',
  'tests/arch',
  'tests/tech',
  'tests/constraints',
  'tests/requirements',
  'tests/principles',
  'tests/assess',
  'tests/drivers',
  'tests/goals',
  'tests/outcome',
];

const testFiles = [];

for (const dir of testDirs) {
  const fullDirPath = resolve(rootDir, dir);
  if (!existsSync(fullDirPath)) {
    console.log('  ' + dir + ': directory not found');
    continue;
  }

  try {
    const entries = readdirSync(fullDirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /\.(mjs|js|ts)$/.test(entry.name)) {
        const fullPath = resolve(fullDirPath, entry.name);
        const content = readFileSync(fullPath, 'utf-8');
        const tcMatch = content.match(/TC-[\w-]+/);
        testFiles.push({
          path: fullPath,
          name: dir + '/' + entry.name,
          exists: true,
          hasContent: content.length > 50,
          acceptanceCriteria: tcMatch ? tcMatch[0] : '',
        });
      }
    }
  } catch (err) {
    console.log('  Error reading ' + dir + ': ' + err.message);
  }
}

console.log('Architecture Test Runner Integration:');
console.log('  Total test files found: ' + testFiles.length);

const e2eFiles = testFiles.filter(function(f) { return f.name.startsWith('tests/e2e'); });
const modelFiles = testFiles.filter(function(f) { return f.name.startsWith('tests/model'); });
const parserFiles = testFiles.filter(function(f) { return f.name.startsWith('tests/parser'); });
const generatorFiles = testFiles.filter(function(f) { return f.name.startsWith('tests/generator'); });
const archFiles = testFiles.filter(function(f) { return f.name.startsWith('tests/arch'); });

console.log('  E2E tests: ' + e2eFiles.length);
console.log('  Model tests: ' + modelFiles.length);
console.log('  Parser tests: ' + parserFiles.length);
console.log('  Generator tests: ' + generatorFiles.length);
console.log('  Arch guard tests: ' + archFiles.length);
console.log('  Other tests: ' + (testFiles.length - e2eFiles.length - modelFiles.length - parserFiles.length - generatorFiles.length - archFiles.length));

// Check for key test files
const requiredTests = [
  'tests/model/test_ast_types.mjs',
  'tests/model/test_ast_serialization.mjs',
  'tests/parser/test_parser_activity_diagram.mjs',
  'tests/generator/test_generator_roundtrip.mjs',
  'tests/e2e/test_canvas_node_types.mjs',
  'tests/e2e/test_canvas_dragdrop_levels.mjs',
  'tests/e2e/test_editor_syntax_highlighting.mjs',
  'tests/e2e/test_editor_debounce_events.mjs',
  'tests/e2e/test_sync_last_write_wins.mjs',
  'tests/e2e/test_sync_fingerprint_preservation.mjs',
  'tests/e2e/test_palette_categories.mjs',
  'tests/e2e/test_palette_drag_to_canvas.mjs',
  'tests/e2e/test_electron_native_menus.mjs',
  'tests/e2e/test_electron_python_subprocess.mjs',
  'tests/e2e/test_biz_service_end_to_end.mjs',
];

let missingCount = 0;
for (const test of requiredTests) {
  const fullPath = resolve(rootDir, test);
  if (!existsSync(fullPath)) {
    console.log('  ✗ MISSING: ' + test);
    missingCount++;
  }
}

if (missingCount > 0) {
  console.log('\nARCH GUARD FAILED: ' + missingCount + ' required test files missing');
  process.exit(1);
}

// Verify test files have actual content (not just stubs)
let stubCount = 0;
for (const tf of testFiles) {
  const content = readFileSync(tf.path, 'utf-8');
  if (content.includes('process.exit(1)') && content.length < 100) {
    stubCount++;
  }
}

console.log('\n  ' + (testFiles.length - stubCount) + '/' + testFiles.length + ' tests have real implementation');
if (stubCount > 0) {
  console.log('  ' + stubCount + ' tests are still stubs (expected to fail)');
}

console.log('\nARCH GUARD PASSED: All test entrypoints discoverable');
process.exit(0);
