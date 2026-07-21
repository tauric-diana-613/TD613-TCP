import assert from 'node:assert/strict';
import fs from 'node:fs';

const safety = fs.readFileSync('.github/workflows/vercel-relock-safety.yml', 'utf8');
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(config.git?.deploymentEnabled, false, 'Vercel Git auto-deploy lock must be closed at rest');
assert.match(safety, /^\s{2}issue_comment:\s*$/m);
assert.match(safety, /github\.event\.issue\.number == 405/);
assert.match(safety, /github\.event\.comment\.user\.login == github\.repository_owner/);
assert.match(safety, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
assert.match(safety, /group: td613-vercel-production-release/);
assert.match(safety, /cancel-in-progress: false/);
assert.match(safety, /git fetch origin main/);
assert.match(safety, /git reset --hard origin\/main/);
assert.match(safety, /git merge-base --is-ancestor/);
assert.match(safety, /deploymentEnabled: false/);
assert.match(safety, /safety-relock Vercel/);
assert.match(safety, /deployment_count = 0/);
assert.match(safety, /git_auto_deploy = disabled/);
assert.doesNotMatch(safety, /vercel@latest deploy|deploymentEnabled = true/);

console.log('vercel-relock-safety.test.mjs passed');