import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = file => fs.readFileSync(file, 'utf8');
const collectSource = directory => fs.readdirSync(directory, { withFileTypes: true }).map(entry => {
  const location = path.join(directory, entry.name);
  if (entry.isDirectory()) return collectSource(location);
  return /\.(?:html|js|mjs)$/.test(entry.name) ? read(location) : '';
}).join('\n');

const loader = read('app/dome-world/ash-lifecycle.js');
const runtime = read('app/dome-world/ash-keep-aia.js');
const bridge = read('app/dome-world/ash-keep-aia-workspace-bridge.js');
const styles = read('app/dome-world/ash-keep-aia.css');
const engine = read('app/engine/ash-live-aia.js');
const ashSurface = collectSource('app/dome-world');
const vercel = read('vercel.json');
const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('loader makes the presentation atomic: stylesheet first, then controller, then exact-ingress bridge', () => {
  assert.match(loader, /ash-lifecycle-core\.js/);
  assert.match(loader, /data-ash-live-aia/);
  assert.match(loader, /await import\('\.\/ash-keep-aia\.js/);
  assert.match(loader, /await import\('\.\/ash-keep-aia-workspace-bridge\.js/);
  assert.ok(loader.indexOf('data-ash-live-aia') < loader.indexOf("await import('./ash-keep-aia.js"));
  assert.ok(loader.indexOf("await import('./ash-keep-aia.js") < loader.indexOf("await import('./ash-keep-aia-workspace-bridge.js"));
});

test('default presentation begins with a four-task human journey, not lifecycle ontology', () => {
  for (const phrase of ['Set up workspace', 'Open a local document', 'Keep and check', 'Map, test, review, save']) {
    assert.match(runtime, new RegExp(escaped(phrase)));
  }
  assert.match(runtime, /Begin with a private workspace—not a technical threshold/);
  assert.match(runtime, /task_continuity_required: true/);
  assert.match(runtime, /data-aia-primary-task/);
});

test('all four anisotropic routes and the five-part consequence contract remain available', () => {
  for (const route of ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']) assert.match(runtime, new RegExp(route));
  for (const phrase of ['Why did Ash do that?', 'Exact state, receipts, digest, and rule']) assert.match(runtime, new RegExp(escaped(phrase)));
  for (const phrase of ['What stayed local', 'What Ash created', 'What changed', 'What stayed unauthorized', 'What may happen next']) assert.match(runtime, new RegExp(escaped(phrase)));
});

test('the exact original ingress is integrated into the guide rather than hidden or reimplemented', () => {
  assert.match(runtime, /data-aia-ingress-slot/);
  assert.match(bridge, /slot\.append\(launch\)/);
  assert.match(bridge, /INTEGRATED_EXACT_CONTROLS/);
  assert.match(bridge, /__td613AshAIAIngress/);
  assert.doesNotMatch(bridge, /setRoute\(['"]AUDIT['"]\)/);
  assert.doesNotMatch(bridge, /HIDDEN_BEHIND_CONSEQUENCE_ROUTE/);
  assert.match(styles, /ash-aia__ingress-slot #launch\.launch/);
});

test('exact workspaces remain operable without route ejection', () => {
  assert.match(runtime, /__td613OpenAshWorkspace \|\| window\.__td613AshKeep\?\.openWorkspace/);
  assert.match(runtime, /openExactWorkspace\('draft', '#localTextFile'\)/);
  assert.doesNotMatch(runtime, /setRoute\(['"]AUDIT['"]\).*openExactWorkspace|openExactWorkspace.*setRoute\(['"]AUDIT['"]\)/s);
  assert.doesNotMatch(styles, /body\[data-ash-aia-route="(?:EXPERIENTIAL|CUSTODIAL)"\][^{]*>main/);
  assert.match(styles, /data-ash-aia-case-open="false"\]\>main/);
});

test('live membrane calls existing Ash commands rather than duplicating station actions', () => {
  for (const id of ['compileQuickScan', 'registerCustodyRoot', 'bindCustodyRoot', 'runTest', 'keepDraft', 'reviewDraft', 'approveRelease', 'makeSave']) {
    assert.match(runtime, new RegExp(`['"]${id}['"]`));
    assert.match(ashSurface, new RegExp(`id=['"]${id}['"]|getElementById\(['"]${id}['"]\)|\\$\\(['"]#?${id}['"]\\)|${id}\\(`));
  }
  assert.doesNotMatch(runtime, /fetch\(['"]\/api\/dome-world\/ash-custody-register/);
  assert.doesNotMatch(runtime, /compileCaseMap|compileRebuildTest|compileAshDraft|compileReleaseReceipt|compileSavePoint/);
});

test('tutorial is finite, deterministic, gesture-triggered, non-operative, and reduced-motion complete', () => {
  assert.match(engine, /FINITE_GESTURE_TRIGGERED_CAUSAL_SEQUENCE/);
  assert.match(engine, /EXPLICIT_HUMAN_GESTURE_OR_EXPLICIT_REPLAY/);
  assert.match(engine, /replay_reperforms_ash_action: false/);
  assert.match(engine, /continuous_animation: false/);
  assert.match(runtime, /No Ash action is performed/);
  assert.match(runtime, /state\.frame < TASKS\.length - 1/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /ash-aia__static-sequence/);
  assert.equal((runtime.match(/requestAnimationFrame\(/g) || []).length, 0, 'The guide must not introduce a second scheduler.');
});

test('privacy, evidence, child-study, and rollback boundaries remain explicit', () => {
  assert.match(runtime, /child study locked/);
  assert.match(runtime, /no telemetry/);
  assert.match(runtime, /child_study_authorized: false/);
  assert.match(runtime, /telemetry_present: false/);
  assert.match(engine, /raw_content_recorded: false/);
  assert.match(runtime, /presentation.*legacy/);
  assert.doesNotMatch(runtime, /navigator\.sendBeacon|sendBeacon\(|fetch\([^)]*(?:analytics|telemetry|aia-receipt)/i);
});

test('implementation adds no serverless route and leaves the deployment lock intact', () => {
  assert.doesNotMatch(engine + runtime + bridge, /\/api\//);
  assert.match(vercel, /"deploymentEnabled"\s*:\s*false/);
});
