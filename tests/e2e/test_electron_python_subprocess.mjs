// TC-G-2: Electron manages Python render backend subprocess lifecycle
// Validates Python backend subprocess manager exists
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const pythonBackendPath = resolve(rootDir, 'src/main/pythonBackend.ts');
const healthCheckPath = resolve(rootDir, 'src/main/healthCheck.ts');

const checks = [
  { path: pythonBackendPath, name: 'Python backend subprocess manager' },
  { path: healthCheckPath, name: 'Health check module' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-G-2 FAILED: ${check.name} not found`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const backendContent = readFileSync(pythonBackendPath, 'utf-8');
  const healthContent = readFileSync(healthCheckPath, 'utf-8');

  const features = [
    { name: 'Subprocess spawn implementation', found: backendContent.includes('spawn') || backendContent.includes('ChildProcess') },
    { name: 'Backend start function', found: backendContent.includes('startPythonBackend') || backendContent.includes('startBackend') },
    { name: 'Backend stop function', found: backendContent.includes('stopPythonBackend') || backendContent.includes('stopBackend') },
    { name: 'Graceful shutdown (SIGTERM)', found: backendContent.includes('SIGTERM') || backendContent.includes('taskkill') },
    { name: 'Health check polling', found: healthContent.includes('health') || backendContent.includes('health') },
    { name: 'Health check timeout', found: healthContent.includes('timeout') || healthContent.includes('retries') },
    { name: 'Stdout/stderr handling', found: backendContent.includes('stdout') || backendContent.includes('stderr') },
  ];

  // Check Python backend Flask app exists
  const pythonAppExists = existsSync(resolve(rootDir, 'src/python-backend/app.py'));
  console.log(`  ${pythonAppExists ? '✓' : '✗'} Python backend Flask app exists`);

  const passed = features.filter(f => f.found).length;
  const failed = features.filter(f => !f.found);

  console.log(`TC-G-2: Python backend subprocess management (${passed}/${features.length})`);

  for (const f of features) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length === 0) {
    console.log('TC-G-2 PASSED: All subprocess management features implemented');
    process.exit(0);
  } else {
    console.log('TC-G-2 PARTIAL: Some subprocess features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-G-2 FAILED: Error validating subprocess manager');
  console.error(`  ${error.message}`);
  process.exit(1);
}
