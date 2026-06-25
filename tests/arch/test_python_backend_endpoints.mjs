// Architecture Boundary Guard: Python Backend Endpoint Constraint
// Validates that only /render and /renderPNG endpoints exist in Python backend
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const backendPath = resolve(rootDir, 'src/python-backend/app.py');

if (!existsSync(backendPath)) {
  console.error('ARCH GUARD FAILED: Python backend app.py not found');
  process.exit(1);
}

try {
  const content = readFileSync(backendPath, 'utf-8');

  // Check for /render endpoint
  const hasRender = content.includes('/render') || content.includes('render');
  const hasRenderPNG = content.includes('/renderPNG') || content.includes('render_png');

  // Check that the ONLY endpoints are /render and /renderPNG
  // Look for Flask route decorators
  const routeMatches = content.match(/@app\.route\(['"][^'"]+['"]\)/g) || [];
  const routeEndpoints = routeMatches.map(function(r) {
    const match = r.match(/['"]([^'"]+)['"]/);
    return match ? match[1] : r;
  });

  // Filter out /health
  const manipulationEndpoints = routeEndpoints.filter(
    function(e) { return e !== '/render' && e !== '/renderPNG' && e !== '/health'; }
  );

  const issues = [];

  if (!hasRender) {
    issues.push('Missing /render (SVG) endpoint');
  }
  if (!hasRenderPNG) {
    issues.push('Missing /renderPNG endpoint');
  }
  if (manipulationEndpoints.length > 0) {
    issues.push('Unexpected endpoints found: ' + manipulationEndpoints.join(', '));
  }

  // Check for blueprint imports from legacy
  const hasLegacyBlueprints = content.includes('activity_bp') ||
    content.includes('sequence_bp') ||
    content.includes('shared_bp');

  if (hasLegacyBlueprints) {
    issues.push('Legacy blueprints (activity_bp, sequence_bp, shared_bp) still imported');
  }

  console.log('Python Backend Endpoint Constraint Guard:');

  for (const endpoint of routeEndpoints) {
    console.log('  ' + (endpoint === '/render' || endpoint === '/renderPNG' || endpoint === '/health' ? '✓' : '✗') + ' ' + endpoint);
  }

  if (issues.length === 0) {
    console.log('\nARCH GUARD PASSED: Only /render, /renderPNG, and /health endpoints exist');
    process.exit(0);
  } else {
    console.log('\nARCH GUARD FAILED:');
    for (const issue of issues) {
      console.log('  - ' + issue);
    }
    process.exit(1);
  }
} catch (error) {
  console.error('ARCH GUARD FAILED: Error checking Python backend');
  console.error('  ' + error.message);
  process.exit(1);
}
