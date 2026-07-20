import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const loader = read('app/dome-world/ash-lifecycle.js');
const runtime = read('app/dome-world/ash-keep-aia.js');
const bridge = read('app/dome-world/ash-keep-aia-workspace-bridge.js');
const styles = read('app/dome-world/ash-keep-aia.css');
const engine = read('app/engine/ash-live-aia.js');
const ashKeep = read('app/dome-world/ash-keep.js');
const lifecycle = read('app/dome-world/ash-lifecycle-core.js');
const vercel = read('vercel.json');

test('Ash lifecycle loader installs the live AIA membrane and exact-workspace bridge after lifecycle core', () => {
  assert.match(loader, /ash-lifecycle-core\.js/);
  assert.match(loader, /ash-keep-aia\.js/);
  assert.match(loader, /ash-keep-aia-workspace-bridge\.js/);
  assert.ok(loader.indexOf('ash-lifecycle-core.js') < loader.indexOf('ash-keep-aia.js'));
  assert.ok(loader.indexOf('ash-keep-aia.js') < loader.indexOf('ash-keep-aia-workspace-bridge.js'));
});

test('live surface exposes all four AIA routes and consequence-first disclosure depths', () => {
  for (const route of ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']) assert.match(runtime, new RegExp(route));
  for (const phrase of ['Now', 'Why did Ash do that?', 'Exact state, receipts, digest, and rule']) assert.match(runtime, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const phrase of ['What stayed local', 'What Ash created', 'What changed', 'What stayed unauthorized', 'What may happen next']) assert.match(runtime, new RegExp(phrase));
});

test('live membrane bridges to existing Ash commands rather than reimplementing station actions', () => {
  for (const id of ['compileQuickScan', 'registerCustodyRoot', 'bindCustodyRoot', 'runTest', 'keepDraft', 'reviewDraft', 'approveRelease', 'makeSave']) {
    assert.match(runtime, new RegExp(`['\"]${id}['\"]`));
    assert.match(ashKeep + lifecycle, new RegExp(`id=['\"]${id}['\"]|\\$\\('${id}'\\)|${id}\\(`));
  }
  assert.doesNotMatch(runtime, /fetch\(['\"]\/api\/dome-world\/ash-custody-register/);
  assert.doesNotMatch(runtime, /compileCaseMap|compileRebuildTest|compileAshDraft|compileReleaseReceipt|compileSavePoint/);
});

test('opening an exact workspace explicitly crosses into Audit without inferring a user route', () => {
  assert.match(bridge, /__td613OpenAshWorkspace/);
  assert.match(bridge, /setRoute\('AUDIT'\)/);
  assert.match(bridge, /AUDIT_ON_EXACT_OPEN/);
  assert.doesNotMatch(bridge, /navigator\.webdriver|userAgent|analytics|telemetry/);
});

test('animation remains finite, gesture-triggered, replay-only, and reduced-motion complete', () => {
  assert.match(engine, /FINITE_GESTURE_TRIGGERED_CAUSAL_SEQUENCE/);
  assert.match(engine, /EXPLICIT_HUMAN_GESTURE_OR_EXPLICIT_REPLAY/);
  assert.match(engine, /replay_reperforms_ash_action: false/);
  assert.match(engine, /continuous_animation: false/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /ash-aia__static-sequence/);
  assert.equal((runtime.match(/requestAnimationFrame\(/g) || []).length, 0, 'The membrane must not introduce a second scheduler.');
});

test('privacy, evidence, and child-study boundaries remain visible and non-telemetric', () => {
  assert.match(runtime, /adult human evidence absent/);
  assert.match(runtime, /child study locked/);
  assert.match(runtime, /no telemetry/);
  assert.match(engine, /child_study_authorized: false/);
  assert.match(engine, /telemetry_present: false/);
  assert.match(engine, /raw_content_recorded: false/);
  assert.doesNotMatch(runtime, /navigator\.sendBeacon|sendBeacon\(|fetch\([^)]*(?:analytics|telemetry|aia-receipt)/i);
});

test('legacy Audit and Implementation routes remain available as rollback and exact inspection surfaces', () => {
  assert.match(runtime, /presentation.*legacy/);
  assert.match(styles, /data-ash-aia-route="AUDIT"/);
  assert.match(styles, /data-ash-aia-route="IMPLEMENTATION"/);
  assert.match(runtime, /Open exact .* workspace/);
});

test('implementation adds no serverless route and leaves the deployment lock contract intact', () => {
  assert.doesNotMatch(engine + runtime + bridge, /\/api\//);
  assert.match(vercel, /"deploymentEnabled"\s*:\s*false/);
});
