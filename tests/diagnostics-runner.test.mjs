import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const diagnosticsScript = path.join(repoRoot, 'scripts', 'run-diagnostics.mjs');
const latestJsonPath = path.join(repoRoot, 'reports', 'diagnostics', 'latest.json');
const latestMdPath = path.join(repoRoot, 'reports', 'diagnostics', 'latest.md');

function runDiagnostics(args = []) {
  return spawnSync(process.execPath, [diagnosticsScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

const latestJsonBefore = fs.readFileSync(latestJsonPath, 'utf8');
const latestMdBefore = fs.readFileSync(latestMdPath, 'utf8');

const recommendation = runDiagnostics(['recommend']);
assert.equal(recommendation.status, 0, `recommend exits cleanly: ${recommendation.stderr || recommendation.stdout}`);
assert.match(recommendation.stdout, /npm run diag:smoke/, 'recommend prints the smoke command');
assert.match(recommendation.stdout, /diag:focus/, 'recommend prints focused diagnostics commands');
assert.equal(fs.readFileSync(latestJsonPath, 'utf8'), latestJsonBefore, 'recommend does not overwrite latest.json');
assert.equal(fs.readFileSync(latestMdPath, 'utf8'), latestMdBefore, 'recommend does not overwrite latest.md');

const invalidFocus = runDiagnostics(['focus', '--area=all']);
assert.notEqual(invalidFocus.status, 0, 'invalid focus area fails');
assert.match(`${invalidFocus.stderr}\n${invalidFocus.stdout}`, /Unknown or missing focus area/i, 'invalid focus explains the bad area');
assert.equal(fs.readFileSync(latestJsonPath, 'utf8'), latestJsonBefore, 'runner contract does not overwrite latest.json');
assert.equal(fs.readFileSync(latestMdPath, 'utf8'), latestMdBefore, 'runner contract does not overwrite latest.md');

console.log('diagnostics-runner.test.mjs passed');
