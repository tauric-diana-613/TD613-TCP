import assert from 'node:assert/strict';
import fs from 'node:fs';

const release = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(config.git?.deploymentEnabled, false, 'Vercel Git auto-deploy lock must be closed at rest');
assert.match(release, /Restore the Git deployment lock after fallback/);
assert.match(release, /if: always\(\) && steps\.mode\.outputs\.mode == 'git-fallback'/);
assert.match(release, /deploymentEnabled: false/);
assert.match(release, /git push origin HEAD:main/);
assert.match(release, /relock_commit = \$\{\{ steps\.relock\.outputs\.relock_sha/);
assert.equal(fs.existsSync('.github/workflows/vercel-relock-safety.yml'), false,
  'relock safety must live inside the single operator release workflow');

console.log('vercel-relock-safety.test.mjs passed');
