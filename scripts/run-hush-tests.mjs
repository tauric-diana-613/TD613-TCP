import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const suitePath = path.join('scripts', 'hush-test-suite.txt');
const hushTests = fs.readFileSync(suitePath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const expected = new Set(hushTests);
const actual = fs.readdirSync('tests')
  .filter((name) => /^hush.*\.test\.mjs$/.test(name))
  .sort((left, right) => left.localeCompare(right));
const missing = actual.filter((name) => !expected.has(name));
const stale = hushTests.filter((name) => !fs.existsSync(path.join('tests', name)));

if (missing.length || stale.length) {
  if (missing.length) {
    console.error(`Hush tests missing from ${suitePath}:\n${missing.join('\n')}`);
  }
  if (stale.length) {
    console.error(`Hush tests listed but not found:\n${stale.join('\n')}`);
  }
  process.exit(1);
}

if (process.argv.includes('--check')) {
  console.log(`run-hush-tests.mjs check passed (${hushTests.length} tests listed)`);
  process.exit(0);
}

for (const testFile of hushTests) {
  execFileSync(process.execPath, [path.join('tests', testFile)], { stdio: 'inherit' });
}
