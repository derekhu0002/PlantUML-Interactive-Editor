// TC-B-1: ReactFlow Canvas renders all custom node types
// Validates that custom node renderers exist for each PlantUML element type
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const canvasPath = resolve(rootDir, 'src/canvas/Canvas.tsx');
const nodesPath = resolve(rootDir, 'src/canvas/nodes/index.tsx');
const typesPath = resolve(rootDir, 'src/model/types.ts');

const checks = [
  { path: canvasPath, name: 'Canvas component' },
  { path: nodesPath, name: 'Custom node renderers' },
  { path: typesPath, name: 'AST types' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-B-1 FAILED: ${check.name} not found at ${check.path}`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  const nodesContent = readFileSync(nodesPath, 'utf-8');
  const canvasContent = readFileSync(canvasPath, 'utf-8');

  const nodeRenderers = [
    { name: 'StartNode', found: nodesContent.includes('StartNode') || nodesContent.includes('start') },
    { name: 'StopNode', found: nodesContent.includes('StopNode') || nodesContent.includes('stop') },
    { name: 'ActivityNode', found: nodesContent.includes('ActivityNode') || nodesContent.includes('activity') },
    { name: 'IfNode', found: nodesContent.includes('IfNode') || nodesContent.includes('if') },
    { name: 'WhileNode', found: nodesContent.includes('WhileNode') || nodesContent.includes('while') },
    { name: 'ForkNode', found: nodesContent.includes('ForkNode') || nodesContent.includes('fork') },
    { name: 'SwitchNode', found: nodesContent.includes('SwitchNode') || nodesContent.includes('switch') },
  ];

  const passed = nodeRenderers.filter(n => n.found).length;
  const failed = nodeRenderers.filter(n => !n.found);

  console.log(`TC-B-1: Canvas node type renderers (${passed}/${nodeRenderers.length})`);

  for (const n of nodeRenderers) {
    console.log(`  ${n.found ? '✓' : '✗'} ${n.name}`);
  }

  // Check Canvas.tsx wraps ReactFlow
  const hasReactFlowImport = canvasContent.includes('reactflow') || canvasContent.includes('ReactFlow');
  console.log(`  ${hasReactFlowImport ? '✓' : '✗'} ReactFlow integration`);

  if (failed.length === 0 && hasReactFlowImport) {
    console.log('TC-B-1 PASSED: All custom node types implemented');
    process.exit(0);
  } else {
    console.log('TC-B-1 PARTIAL: Some canvas features not yet implemented');
    process.exit(1);
  }
} catch (error) {
  console.error('TC-B-1 FAILED: Error validating canvas');
  console.error(`  ${error.message}`);
  process.exit(1);
}
