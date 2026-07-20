import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflow = fs.readFileSync('.github/workflows/flowcore-production-observation.yml', 'utf8');

const sourcePacket = '13e2fa584f685d847424c4b82e66496b583573a5';

test('production observer is non-deploying and exact-source bound', () => {
  assert.match(workflow, new RegExp(sourcePacket));
  assert.match(workflow, /TD613_PRODUCTION_BASE_URL: https:\/\/td613\.com/);
  assert.match(workflow, /flowcore-release-content-probe\.mjs/);
  assert.match(workflow, /flowcore-runtime-browser-probe\.mjs/);
  assert.match(workflow, /browser: \[chromium, firefox, webkit\]/);
  assert.match(workflow, /TD613_PRODUCTION_OBSERVATION: 'true'/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.doesNotMatch(workflow, /vercel@latest|VERCEL_TOKEN|deploymentEnabled\s*=\s*true|git push origin|\/td613-vercel-release/);
});

test('production observer preserves empirical and promotion separation', () => {
  const browserProbe = fs.readFileSync('scripts/flowcore-runtime-browser-probe.mjs', 'utf8');
  const contentProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
  assert.match(browserProbe, /counts_as_human_evidence:\s*false/);
  assert.match(browserProbe, /authorizes_public_route_promotion:\s*false/);
  assert.match(browserProbe, /closes_program:\s*false/);
  assert.match(contentProbe, /counts_as_human_evidence:\s*false/);
  assert.match(contentProbe, /authorizes_public_route_promotion:\s*false/);
  assert.match(contentProbe, /closes_program:\s*false/);
});
