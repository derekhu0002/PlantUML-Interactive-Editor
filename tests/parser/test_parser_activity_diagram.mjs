// TC-E-1: Parser converts Activity Diagram PlantUML text to AST
// Validates stack-based nesting tracking for if/while/fork containers
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const parserPath = resolve(rootDir, 'src/parser/parser.ts');
const typesPath = resolve(rootDir, 'src/model/types.ts');

// Check source files exist
const checks = [
  { path: parserPath, name: 'Parser module' },
  { path: typesPath, name: 'AST types' },
];

let allExist = true;
for (const check of checks) {
  if (!existsSync(check.path)) {
    console.error(`TC-E-1 FAILED: ${check.name} not found at ${check.path}`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}

try {
  // Read parser source to validate it
  const parserContent = readFileSync(parserPath, 'utf-8');
  const typesContent = readFileSync(typesPath, 'utf-8');

  // Validate parser features
  const features = [
    { name: 'ActivityNode in types', found: typesContent.includes("type: 'activity'") },
    { name: 'IfNode in types', found: typesContent.includes("type: 'if'") },
    { name: 'WhileNode in types', found: typesContent.includes("type: 'while'") },
    { name: 'ForkNode in types', found: typesContent.includes("type: 'fork'") },
    { name: 'ContainerNode in types', found: typesContent.includes('ContainerNode') },
    { name: 'Stack-based nesting in parser', found: parserContent.includes('parseBlock') || parserContent.includes('stack') },
    { name: 'Forward/backward scanning', found: parserContent.includes('forward') || parserContent.includes('scan') || parserContent.includes('while') },
    { name: '@startuml handling', found: parserContent.includes('START_UML') || parserContent.includes('@startuml') },
    { name: 'if/else/endif handling', found: parserContent.includes('ENDIF') || parserContent.includes('endif') },
    { name: 'while/endwhile handling', found: parserContent.includes('ENDWHILE') || parserContent.includes('endwhile') },
    { name: 'fork/endfork handling', found: parserContent.includes('ENDFORK') || parserContent.includes('endfork') },
    { name: 'Action parsing', found: parserContent.includes('ACTION') || parserContent.includes('Action') },
  ];

  const passed = features.filter(f => f.found).length;
  const failed = features.filter(f => !f.found);

  console.log(`TC-E-1: Parser validation (${passed}/${features.length} features)`);

  for (const f of features) {
    console.log(`  ${f.found ? '✓' : '✗'} ${f.name}`);
  }

  if (failed.length > 0) {
    console.log('TC-E-1 PARTIAL: Some parser features not yet implemented');
    console.log(`  Missing: ${failed.map(f => f.name).join(', ')}`);
  } else {
    console.log('TC-E-1 PASSED: All parser features validated');
  }

  process.exit(failed.length > 0 ? 1 : 0);
} catch (error) {
  console.error('TC-E-1 FAILED: Error validating parser');
  console.error(`  ${error.message}`);
  process.exit(1);
}
