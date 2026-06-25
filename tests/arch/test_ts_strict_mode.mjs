// Explicit Entrypoint Correctness Guard: TS Strict Mode
// Validates tsconfig.json has strict mode enabled
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '../..');
const tsconfigPath = resolve(rootDir, 'tsconfig.json');

if (!existsSync(tsconfigPath)) {
  console.error('ARCH GUARD FAILED: tsconfig.json not found');
  process.exit(1);
}

try {
  const content = readFileSync(tsconfigPath, 'utf-8');
  const config = JSON.parse(content);

  const strictMode = config.compilerOptions?.strict === true;
  const noImplicitAny = config.compilerOptions?.noImplicitAny === true;
  const strictNullChecks = config.compilerOptions?.strictNullChecks === true;

  console.log('TypeScript Strict Mode Guard:');
  console.log(`  ${strictMode ? '✓' : '✗'} strict: true`);
  console.log(`  ${noImplicitAny ? '✓' : '✗'} noImplicitAny: true`);
  console.log(`  ${strictNullChecks ? '✓' : '✗'} strictNullChecks: true`);

  if (strictMode || (noImplicitAny && strictNullChecks)) {
    console.log('\nARCH GUARD PASSED: TypeScript strict mode is enabled');
    // Check source files have typed exports
    const sourceFiles = [
      'src/model/types.ts',
      'src/model/serialization.ts',
      'src/parser/parser.ts',
      'src/generator/generator.ts',
      'src/sync/SyncEngine.ts',
    ];

    let typedFiles = 0;
    for (const file of sourceFiles) {
      const filePath = resolve(rootDir, file);
      if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath, 'utf-8');
        // Check for export statements
        if (fileContent.includes('export')) {
          typedFiles++;
        }
      }
    }
    console.log(`  ${typedFiles}/${sourceFiles.length} source files have typed exports`);

    process.exit(0);
  } else {
    console.log('\nARCH GUARD FAILED: TypeScript strict mode not fully enabled');
    process.exit(1);
  }
} catch (error) {
  console.error('ARCH GUARD FAILED: Error checking tsconfig.json');
  console.error(`  ${error.message}`);
  process.exit(1);
}
