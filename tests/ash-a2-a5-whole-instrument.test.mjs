import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const suite = Object.freeze([
  Object.freeze({ id:'A2_A6_WHOLE_INSTRUMENT', file:'tests/ash-a2-a5-whole-instrument-baseline.fixture.mjs' }),
  Object.freeze({ id:'A7_HOME', file:'tests/ash-a7-home-recompilation.test.mjs' }),
  Object.freeze({ id:'A8_CASE_MAP', file:'tests/ash-a8-case-map-recompilation.test.mjs' }),
  Object.freeze({ id:'FLOWCORE_LIVE_FIELD', file:'tests/ash-flowcore-live-field.test.mjs' })
]);
const artifactDir = path.resolve('artifacts/ash-a2-a8-static-report');
fs.mkdirSync(artifactDir, { recursive:true });

const results = [];
for (const entry of suite) {
  const run = spawnSync(process.execPath, [entry.file], {
    cwd:process.cwd(),
    encoding:'utf8',
    env:{ ...process.env, TD613_A2_A8_REPORT_ALL:'true' },
    maxBuffer:8 * 1024 * 1024
  });
  const stdout = run.stdout || '';
  const stderr = run.stderr || '';
  const status = Number.isInteger(run.status) ? run.status : 1;
  const signal = run.signal || null;
  fs.writeFileSync(path.join(artifactDir, `${entry.id}.stdout.log`), stdout);
  fs.writeFileSync(path.join(artifactDir, `${entry.id}.stderr.log`), stderr);
  process.stdout.write(`\n===== ${entry.id} · status ${status}${signal ? ` · signal ${signal}` : ''} =====\n`);
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  results.push(Object.freeze({ ...entry, status, signal, ok:status === 0 }));
}

const manifest = Object.freeze({
  schema:'td613.ash.a2-a8-static-report-all/v0.1',
  exact_head:process.env.GITHUB_SHA || null,
  fail_fast:false,
  every_contract_observed:true,
  results:Object.freeze(results),
  failures:Object.freeze(results.filter(result => !result.ok).map(result => result.id)),
  authority_changed:false,
  source_bytes_moved:false,
  deployment_authorized:false,
  human_closure_required:true
});
fs.writeFileSync(path.join(artifactDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
assert.deepEqual(manifest.failures, [], `A2–A8 static failures: ${manifest.failures.join(', ')}`);
console.log(JSON.stringify(manifest, null, 2));
