import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const browserProbe = fs.readFileSync('scripts/flowcore-runtime-browser-probe.mjs', 'utf8');
const contentProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
const consolidated = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const release = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');

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

test('runtime observer waits for asynchronous Replay before measuring readiness', () => {
  assert.match(browserProbe, /await replay\.first\(\)\.click\(\);\s*await waitForReady\(page, surface\);/s);
  assert.match(browserProbe, /await exercise\(page, surface\);\s*await waitForReady\(page, surface\);/s);
  assert.doesNotMatch(browserProbe, /await replay\.first\(\)\.click\(\);\s*await page\.waitForTimeout\(30\);/s);
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

test('one explicit exact-head dispatch retains front-line per-engine browser evidence and one convergence owner', () => {
  assert.match(consolidated, /workflow_dispatch:/);
  assert.match(consolidated, /types:\s*\[opened, synchronize, reopened, ready_for_review\]/);
  assert.match(consolidated, /full-browser/);
  assert.match(consolidated, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
  assert.match(consolidated, /github\.event_name == 'pull_request' && github\.event\.action == 'ready_for_review'/);
  assert.match(consolidated, /ash_browser_shard:[\s\S]*?needs: scope/);
  assert.match(consolidated, /browser: \[chromium, firefox, webkit\]/);
  assert.match(consolidated, /max-parallel: 3/);
  assert.match(consolidated, /playwright install --with-deps "\$\{\{ matrix\.browser \}\}"/);
  assert.match(consolidated, /flowcore-runtime-browser-probe\.mjs/);
  assert.match(consolidated, /TD613_BROWSERS="\$browser"/);
  assert.match(consolidated, /TD613_FLOWCORE_ROUTE_PREFIX='app\/dome-world'/);
  assert.match(consolidated, /td613-browser-shard-\$\{\{ matrix\.browser \}\}/);
  assert.match(consolidated, /Collect surviving browser evidence shards/);
  assert.match(consolidated, /Full-product exact-head Chromium Firefox WebKit witness/);
  assert.match(consolidated, /needs: \[contracts, scope, ash_browser_shard\]/);
  assert.doesNotMatch(consolidated, /ash_browser_shard:[\s\S]*?needs:\s*\[[^\]]*contracts/);
  assert.equal(fs.existsSync('.github/workflows/flowcore-runtime-evidence.yml'), false,
    'Flow-Core runtime evidence must not regain an independent workflow.');
});

test('production release uses bounded confirmation rather than replaying the matrix', () => {
  assert.match(release, /^\s{2}issue_comment:\s*$/m);
  assert.match(release, /flowcore-release-content-probe\.mjs/);
  assert.match(release, /playwright install --with-deps chromium/);
  assert.match(release, /ash-a13-demo-registry-browser-probe\.mjs/);
  assert.match(release, /ash-lifecycle-production-probe\.mjs/);
  assert.doesNotMatch(release, /flowcore-runtime-browser-probe\.mjs/);
  assert.doesNotMatch(release, /playwright install --with-deps chromium firefox webkit/);
  assert.doesNotMatch(release, /TD613_BROWSERS: chromium,firefox,webkit/);
});
