import assert from 'node:assert/strict';
import fs from 'node:fs';

const safety = fs.readFileSync('.github/workflows/vercel-relock-safety.yml', 'utf8').replace(/\r\n/g, '\n');
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(config.git?.deploymentEnabled, false, 'Vercel Git auto-deploy lock must be closed at rest');
assert.match(safety, /^\s{2}issue_comment:\s*$/m);
assert.match(safety, /github\.event\.issue\.number == 405/);
assert.match(safety, /github\.event\.comment\.user\.login == github\.repository_owner/);
assert.match(safety, /github\.event\.comment\.user\.login == 'chatgpt-codex-connector\[bot\]'/);
assert.match(safety, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-relock '\)/);
assert.doesNotMatch(safety, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/,
  'relock safety must never race the ordinary production-release gesture');
assert.match(safety, /\[\[ "\$COMMAND" == '\/td613-vercel-relock' \]\]/);
assert.match(safety, /group: td613-vercel-production-release/);
assert.doesNotMatch(safety, /^concurrency:\s*$/m,
  'relock safety must not reserve release concurrency at workflow-dispatch time');
assert.match(safety, /relock-safety:[\s\S]*?concurrency:\n\s+group: td613-vercel-production-release/,
  'only the authorized relock job may enter the shared release concurrency group');
assert.match(safety, /cancel-in-progress: false/);
assert.match(safety, /git fetch origin main/);
assert.match(safety, /git reset --hard origin\/main/);
assert.match(safety, /git merge-base --is-ancestor/);
assert.match(safety, /deploymentEnabled: false/);
assert.match(safety, /safety-relock Vercel/);
assert.match(safety, /deployment_count = 0/);
assert.match(safety, /git_auto_deploy = disabled/);
assert.doesNotMatch(safety, /vercel@latest deploy|deploymentEnabled = true/);
assert.doesNotMatch(safety, /confirm-production-practice|td613-vercel-confirm|td613-production-reobserve|td613-marrowline-dollhouse-trial/,
  'Recovery/research listener must not resurrect retired confirmation or provider-observation gates.');


// Issue #1744 is an ACTUAL GitHub issue_comment gate, not a memory-only note.
// Original PR #1730 comment triggers remain valid for both bounded jobs.
for (const [job, mode] of [
  ['vixen-preview-prepare:', 'PREPARE'],
  ['vixen-preview-deploy:', 'DEPLOY'],
]) {
  const part = safety.split('  ' + job)[1]?.split(/(?=\n  [a-z][a-z0-9-]+:\n)/)[0] || '';
  assert.ok(part, 'Missing Vixen preview job: ' + job);
  assert.match(part, /github\.event\.issue\.number == 1730 && github\.event\.issue\.pull_request != null/,
    'Existing PR #1730 listener was lost in ' + job);
  assert.match(part, /github\.event\.issue\.number == 1744 && github\.event\.issue\.pull_request == null/,
    'Issue #1744 must have an executable non-PR listener in ' + job);
  assert.match(part, /github\.ref == 'refs\/heads\/main'/);
  assert.ok(part.includes("startsWith(github.event.comment.body, '/td613-vixen-preview " + mode + " ')"),
    'Gesture is not bound to correct PREPARE/DEPLOY action in ' + job);
  assert.doesNotMatch(part, /github\.event\.issue\.number == 405|\/td613-vercel-release/,
    'Vixen preview must remain separate from production issue #405');
}
const prepare = safety.split('  vixen-preview-prepare:')[1].split('  vixen-preview-deploy:')[0];
const deploy = safety.split('  vixen-preview-deploy:')[1];
assert.match(prepare, /github\.event\.comment\.user\.login == 'chatgpt-codex-connector\[bot\]'/,
  'Connector relay can PREPARE without deployment authority');
assert.match(deploy, /github\.event\.comment\.user\.login == github\.repository_owner/,
  'DEPLOY must remain owner-only');
assert.doesNotMatch(deploy, /chatgpt-codex-connector\[bot\]/,
  'Connector bot must not inherit owner-only DEPLOY authority');
assert.match(deploy, /environment: vixen-preview/);
assert.match(deploy, /vixen-preview-prepared-\$APPROVED_SHA/);
assert.match(deploy, /vercel inspect "\$PREVIEW_URL" --wait/);
assert.match(deploy, /vercel alias set "\$PREVIEW_URL" "\$VERCEL_PREVIEW_ALIAS"/);
assert.match(deploy, /git\?\.deploymentEnabled !== false/);
assert.doesNotMatch(deploy, /git\.deploymentEnabled\s*=\s*true|git\.deploymentEnabled:\s*true/,
  'Preview DEPLOY must never unlock Git auto-deploy');

console.log('vercel-relock-safety.test.mjs passed');