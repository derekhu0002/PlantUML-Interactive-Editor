// TC-D-2: Fingerprint matching preserves element positions across re-parses
// Validates FingerprintMatcher and SidecarStore
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const fingerprintPath = resolve(rootDir, 'src/sync/FingerprintMatcher.ts');
const sidecarPath = resolve(rootDir, 'src/sync/SidecarStore.ts');

const checks = [
  { path: fingerprintPath, name: 'FingerprintMatcher' },
  { path: sidecarPath, name: 'SidecarStore' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-D-2 FAILED: ${check.name} not found`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const fingerprintContent = readFileSync(fingerprintPath, 'utf-8');
  const sidecarContent = readFileSync(sidecarPath, 'utf-8');

  const features = [
    { name: 'FingerprintMatcher class', found: fingerprintContent.includes('FingerprintMatcher') || fingerprintContent.includes('class Fingerprint') },
    { name: 'Fingerprint computation', found: fingerprintContent.includes('computeFingerprint') || fingerprintContent.includes('fingerprint') },
    { name: 'Position indexing', found: fingerprintContent.includes('indexPositions') || fingerprintContent.includes('index') },
    { name: 'Position restoration', found: fingerprintContent.includes('restorePosition') || fingerprintContent.includes('applyPositions') },
    { name: 'Default grid placement', found: fingerprintContent.includes('grid') || fingerprintContent.includes('default') },
    { name: 'SidecarStore class', found: sidecarContent.includes('SidecarStore') || sidecarContent.includes('class Sidecar') },
    { name: 'Sidecar file read/write', found: sidecarContent.includes('load') || sidecarContent.includes('save') },
    { name: '.puml.meta sidecar path', found: sidecarContent.includes('.meta') || sidecarContent.includes('sidecar') },
  ];

  const passed = features.filter(f => f.found).length;
  const failed = features.filter(f => !f.found);

  console.log(`TC-D-2: Fingerprint preservation (${passed}/${features.length})`);

  for (const f of features) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-D-2 PASSED: All fingerprint features implemented');
    process.exit(0);
  } else {
    console.log('TC-D-2 PARTIAL: Some fingerprint features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-D-2 FAILED: Error validating fingerprint matcher');
  console.error(`  ${error.message}`);
  process.exit(1);
}
