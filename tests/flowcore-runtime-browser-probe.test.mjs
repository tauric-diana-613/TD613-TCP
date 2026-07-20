import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const browserProbe = fs.readFileSync('scripts/flowcore-runtime-browser-probe.mjs', 'utf8');
const contentProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/flowcore-runtime-evidence.yml', 'utf8');

const surfaces = [
  'information-dome-pedagogue.html',
  'route-burden-observatory.html',
  'ash-custody-pedagogue.html',
  'station-propagation-observatory.html',
  'physical-flowcore.html',
  'flowcore-validation-lab.html',
  'flowcore-promotion-dashboard.html'
];

test('runtime observer covers the complete Flow-Core surface and browser matrix', () => {
  for (const surface of surfaces) assert.match(browserProbe, new RegExp(surface.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const browser of ['chromium', 'firefox', 'webkit']) assert.match(browserProbe, new RegExp(`\\b${browser}\\b`));
  for (const profile of ['desktop', 'mobile-portrait', 'mobile-landscape', 'reduced-motion', 'zoom-200-equivalent', 'forced-colors']) assert.match(browserProbe, new RegExp(profile));
  assert.match(browserProbe, /keyboard did not reach an interactive control/);
  assert.match(browserProbe, /horizontal_overflow/);
  assert.match(browserProbe, /running_infinite_animations/);
  assert.match(browserProbe, /long_task_ceiling_ms/);
  assert.match(browserProbe, /counts_as_human_evidence:\s*false/);
  assert.match(browserProbe, /authorizes_public_route_promotion:\s*false/);
  assert.match(browserProbe, /closes_program:\s*false/);
  assert.doesNotMatch(browserProbe, /localStorage|indexedDB|sendBeacon|method:\s*['"]POST['"]/);
});

test('production content observer binds deployed bytes to the selected source packet', () => {
  assert.match(contentProbe, /TD613_SOURCE_PACKET_COMMIT/);
  assert.match(contentProbe, /\^\[0-9a-f\]\{40\}\$/);
  assert.match(contentProbe, /sha256/);
  assert.match(contentProbe, /exact_source_content_verified:\s*true/);
  assert.match(contentProbe, /application_tree_drift:\s*'none'/);
  assert.match(contentProbe, /counts_as_human_evidence:\s*false/);
  assert.match(contentProbe, /authorizes_public_route_promotion:\s*false/);
});

test('runtime evidence workflow is browser-observational and artifact preserving', () => {
  assert.match(workflow, /strategy:/);
  assert.match(workflow, /browser:\s*\[chromium, firefox, webkit\]/);
  assert.match(workflow, /playwright@1\.53\.2/);
  assert.match(workflow, /playwright install --with-deps \$\{\{ matrix\.browser \}\}/);
  assert.match(workflow, /flowcore-runtime-browser-probe\.mjs/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /TD613_FLOWCORE_ROUTE_PREFIX:\s*app\/dome-world/);
  assert.doesNotMatch(workflow, /VERCEL_TOKEN|deploymentEnabled|git push origin main/);
});
