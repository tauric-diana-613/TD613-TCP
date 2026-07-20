import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflow = fs.readFileSync('.github/workflows/flowcore-production-observation.yml', 'utf8');
const browserProbe = fs.readFileSync('scripts/flowcore-runtime-browser-probe.mjs', 'utf8');
const contentProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
const stationEngine = fs.readFileSync('app/engine/flowcore-station-propagation.js', 'utf8');
const workflowDirectory = fs.readdirSync('.github/workflows');

const sourcePacket = '13e2fa584f685d847424c4b82e66496b583573a5';

test('production observer is read-only, non-deploying, and exact-source bound', () => {
  assert.match(workflow, new RegExp(sourcePacket));
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /TD613_PRODUCTION_BASE_URL: https:\/\/td613\.com/);
  assert.match(workflow, /flowcore-release-content-probe\.mjs/);
  assert.match(workflow, /flowcore-runtime-browser-probe\.mjs/);
  assert.match(workflow, /browser: \[chromium, firefox, webkit\]/);
  assert.match(workflow, /TD613_PRODUCTION_OBSERVATION: 'true'/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.doesNotMatch(workflow, /vercel@latest|VERCEL_TOKEN|deploymentEnabled\s*=\s*true|git push origin|\/td613-vercel-release|contents: write/);
  assert.equal(workflowDirectory.some(name => /repair-once|one-use/i.test(name)), false);
});

test('production observer preserves empirical and promotion separation', () => {
  assert.match(browserProbe, /counts_as_human_evidence:\s*false/);
  assert.match(browserProbe, /authorizes_public_route_promotion:\s*false/);
  assert.match(browserProbe, /closes_program:\s*false/);
  assert.match(contentProbe, /counts_as_human_evidence:\s*false/);
  assert.match(contentProbe, /authorizes_public_route_promotion:\s*false/);
  assert.match(contentProbe, /closes_program:\s*false/);
});

test('exact-source observation discovers the recursive runtime dependency closure', () => {
  assert.match(contentProbe, /discoverRuntimeClosure/);
  assert.match(contentProbe, /referencesFor/);
  assert.match(contentProbe, /station-propagation-observatory\.js/);
  assert.match(contentProbe, /flowcore-station-propagation\.js/);
  assert.match(contentProbe, /cross-station-propagation\.json/);
  assert.match(contentProbe, /dependency_closure_verified:\s*true/);
  assert.match(contentProbe, /local\.length < 20/);
});

test('independent station packages compile concurrently without changing fixture order', () => {
  assert.match(stationEngine, /const packages = await Promise\.all\(fixtures\.map\(fixture => compileStationPropagationScene\(fixture, options\)\)\);/);
  assert.doesNotMatch(stationEngine, /for \(const fixture of fixtures\) packages\.push\(await compileStationPropagationScene/);
});
