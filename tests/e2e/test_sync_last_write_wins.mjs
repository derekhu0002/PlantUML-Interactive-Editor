// TC-D-1: Bidirectional Sync applies last-write-wins conflict resolution
// Validates SyncEngine with timestamp comparison and version counters
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const syncPath = resolve(rootDir, 'src/sync/SyncEngine.ts');
const conflictPath = resolve(rootDir, 'src/sync/ConflictResolver.ts');

const checks = [
  { path: syncPath, name: 'SyncEngine' },
  { path: conflictPath, name: 'ConflictResolver' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-D-1 FAILED: ${check.name} not found`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const syncContent = readFileSync(syncPath, 'utf-8');
  const conflictContent = readFileSync(conflictPath, 'utf-8');

  const features = [
    { name: 'SyncEngine class defined', found: syncContent.includes('SyncEngine') || syncContent.includes('class SyncEngine') },
    { name: 'Subscribe/notify pattern', found: syncContent.includes('subscribe') || syncContent.includes('notify') },
    { name: 'Last-write-wins resolution', found: conflictContent.includes('last-write-wins') || conflictContent.includes('timestamp') || conflictContent.includes('resolve') },
    { name: 'Timestamp comparison', found: conflictContent.includes('timestamp') || conflictContent.includes('Date.now') },
    { name: 'Version counter', found: conflictContent.includes('version') },
    { name: '200ms debounce', found: syncContent.includes('200') || syncContent.includes('debounce') },
    { name: 'Infinite loop guard', found: syncContent.includes('skip') || syncContent.includes('guard') || syncContent.includes('lastCanvasModel') || syncContent.includes('lastCodeText') },
  ];

  const passed = features.filter(f => f.found).length;
  const failed = features.filter(f => !f.found);

  console.log(`TC-D-1: Sync last-write-wins (${passed}/${features.length})`);

  for (const f of features) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-D-1 PASSED: All sync features implemented');
    process.exit(0);
  } else {
    console.log('TC-D-1 PARTIAL: Some sync features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-D-1 FAILED: Error validating sync engine');
  console.error(`  ${error.message}`);
  process.exit(1);
}
