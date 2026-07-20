import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const tests = [
  'tests/vercel-deploy-hygiene.test.mjs',
  'tests/vercel-operator-release-gate.test.mjs',
  'tests/product-architecture/shell.test.mjs',
  'tests/ash-keep-production-closure-contract.test.mjs',
  'tests/ash-lifecycle-production-contract.test.mjs',
  'tests/ash-profile-demos.test.mjs',
  'tests/ash-investigation-guidance.test.mjs',
  'tests/ash-keep-investigation-guidance-closure.test.mjs',
  'tests/ash-keep-live-aia-surface.test.mjs',
  'tests/flowcore-p0-p10-completion.test.mjs'
];
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-aia3-contract-diagnostics');
fs.mkdirSync(out, { recursive: true });
const report = [];
for (const file of tests) {
  const result = spawnSync(process.execPath, [file], { encoding: 'utf8', env: process.env });
  const item = { file, status: result.status, signal: result.signal, stdout: result.stdout, stderr: result.stderr };
  report.push(item);
  fs.writeFileSync(path.join(out, file.replaceAll('/', '__') + '.log'), `STATUS=${result.status}\nSTDOUT\n${result.stdout}\nSTDERR\n${result.stderr}\n`);
}
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(report.map(item => `${item.status === 0 ? 'PASS' : 'FAIL'} ${item.file}`).join('\n'));
if (report.some(item => item.status !== 0)) process.exitCode = 1;
