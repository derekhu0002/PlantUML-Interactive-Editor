// TC-CONST-PY-1: Constraint — Python backend only /render and /renderPNG
// Expected: failed — Python backend not yet stripped
// Validated by: tests/arch/test_python_backend_endpoints.mjs
console.error('TC-CONST-PY-1 FAILED: Python backend still has legacy endpoints');
process.exit(1);
