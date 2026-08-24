import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const artifactDir = 'artifacts/a15-r0';
const syntaxDiagnosticPath = `${artifactDir}/typed-rewrite-syntax-check.json`;
const sourcePath = 'app/dome-world/previews/a15-r0/aperture-pedagogue-typed-target-preserving-rewrite-admissibility.js';
const sourceCapturePath = `${artifactDir}/typed-rewrite-source.js`;
const testPath = 'tests/ash-a15-r0-aperture-pedagogue-typed-target-preserving-rewrite-admissibility.test.mjs';

fs.mkdirSync(artifactDir, { recursive: true });
fs.copyFileSync(sourcePath, sourceCapturePath);

const rows = [testPath, sourcePath].map((path) => {
  const checked = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
  return {
    path,
    status: checked.status,
    signal: checked.signal,
    stdout: checked.stdout,
    stderr: checked.stderr,
    error: checked.error ? {
      name: checked.error.name,
      message: checked.error.message,
      stack: checked.error.stack,
    } : null,
  };
});

fs.writeFileSync(syntaxDiagnosticPath, JSON.stringify({
  schema: 'td613.ash.a15-r0.typed-rewrite-syntax-check/v0.2',
  rows,
}, null, 2));

throw new Error('INTENTIONAL_TYPED_REWRITE_SOURCE_CAPTURE_HOLD');
