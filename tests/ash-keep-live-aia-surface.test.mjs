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
const composition = read('app/dome-world/ash-aia3-composition.js');
const cacheEviction = read('app/dome-world/ash-cache-eviction-aia3.js');
const baseStyles = read('app/dome-world/ash-keep-aia.css');
const aia3Styles = [
  read('app/dome-world/ash-keep-aia3.css'),
  read('app/dome-world/ash-keep-aia3-compact.css'),
  read('app/dome-world/ash-keep-aia3-interaction.css')
].join('\n');
const engine = read('app/engine/ash-live-aia.js');
const ashSurface = collectSource('app/dome-world');
const vercel = read('vercel.json');
const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('loader preserves legacy rollback and atomically mounts AIA3 only for the AIA presentation', () => {
  assert.match(loader, /ash-cache-eviction-aia3\.js/);
  assert.match(loader, /legacyPresentation/);
  assert.match(loader, /data-ash-aia-legacy/);
  assert.match(loader, /td613\.ash\.aia3-composition\/v0\.3-atomic-ingress-readiness/);
  assert.match(loader, /data-ash-aia3-style/);
  assert.match(loader, /data-ash-aia3-compact/);
  assert.match(loader, /data-ash-aia3-interaction/);
  assert.match(loader, /await import\('\.\/ash-keep-aia\.js/);
  assert.match(loader, /await import\('\.\/ash-aia3-composition\.js/);
  assert.match(loader, /await import\('\.\/ash-keep-aia-workspace-bridge\.js/);
  assert.ok(loader.indexOf('data-ash-aia3-interaction') < loader.indexOf("await import('./ash-keep-aia.js"));
});

test('default presentation begins with a four-task human journey, not lifecycle ontology', () => {
  for (const phrase of ['Set up workspace', 'Open a local document', 'Keep and check', 'Map, test, review, save']) assert.match(runtime, new RegExp(escaped(phrase)));
  assert.match(runtime, /Begin with a private workspace—not a technical threshold/);
  assert.match(runtime, /task_continuity_required: true/);
  assert.match(runtime, /data-aia-primary-task/);
  assert.match(composition, /Four exact steps · one local case/);
});

test('all four anisotropic routes and the five-part consequence contract remain available', () => {
  const routeLaw = `${engine}\n${runtime}`;
  for (const route of ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']) assert.match(routeLaw, new RegExp(route));
  for (const phrase of ['Why did Ash do that?', 'Exact state, receipts, digest, and rule']) assert.match(runtime, new RegExp(escaped(phrase)));
  for (const phrase of ['What stayed local', 'What Ash created', 'What changed', 'What stayed unauthorized', 'What may happen next']) assert.match(runtime, new RegExp(escaped(phrase)));
});

test('the original ingress remains a fixed canonical membrane rather than an embedded AIA card', () => {
  assert.match(bridge, /CANONICAL_FIXED_MEMBRANE/);
  assert.match(bridge, /__td613AshAIAIngress/);
  assert.doesNotMatch(bridge, /slot\.append\(launch\)/);
  assert.doesNotMatch(bridge, /INTEGRATED_EXACT_CONTROLS/);
  assert.match(aia3Styles, /#launch\.launch:not\(\.hidden\)[\s\S]*position:fixed!important/);
  assert.match(aia3Styles, /body\[data-ash-aia-case-open="false"\] #ashAiaMembrane\{display:none!important\}/);
  assert.match(composition, /DEFAULT_PROFILE = 'investigation'/);
  assert.match(composition, /button\.disabled=false/);
  assert.match(composition, /dataset\.ashAia3Ready=String\(ingressReady\)/);
});

test('exact workspaces remain operable after case creation without route ejection', () => {
  assert.match(runtime, /__td613OpenAshWorkspace \|\| window\.__td613AshKeep\?\.openWorkspace/);
  assert.match(runtime, /openExactWorkspace\('draft', '#localTextFile'\)/);
  assert.doesNotMatch(runtime, /setRoute\(['"]AUDIT['"]\).*openExactWorkspace|openExactWorkspace.*setRoute\(['"]AUDIT['"]\)/s);
  assert.match(bridge, /RESTORED_FOR_OPEN_CASE/);
  assert.match(bridge, /closedBoundaryMatches/);
  assert.match(aia3Styles, /body>\.workspace-rail[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test('live membrane calls existing Ash commands rather than duplicating station actions', () => {
  for (const id of ['compileQuickScan', 'registerCustodyRoot', 'bindCustodyRoot', 'runTest', 'keepDraft', 'reviewDraft', 'approveRelease', 'makeSave']) {
    assert.match(runtime, new RegExp(`['"]${id}['"]`));
    assert.match(ashSurface, new RegExp(`id=['"]${id}['"]|getElementById\\(['"]${id}['"]\\)|\\$\\(['"]#?${id}['"]\\)|${id}\\(`));
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
  assert.match(baseStyles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(baseStyles, /ash-aia__static-sequence/);
  assert.equal((runtime.match(/requestAnimationFrame\(/g) || []).length, 0, 'The guide must not introduce a second scheduler.');
});

test('mass eviction is one-epoch, case-preserving, and excludes IndexedDB deletion', () => {
  assert.match(cacheEviction, /2026-07-20-aia3-production-recovery-v1/);
  assert.match(cacheEviction, /clearCacheStorage/);
  assert.match(cacheEviction, /unregisterWorkers/);
  assert.match(cacheEviction, /surface=cache-evict/);
  assert.match(cacheEviction, /indexeddb_preserved: true/);
  assert.match(cacheEviction, /case_data_preserved: true/);
  assert.match(cacheEviction, /active_session_reset: true/);
  assert.doesNotMatch(cacheEviction, /deleteDatabase|indexedDB\.delete/);
});

test('privacy, evidence, child-study, and rollback boundaries remain explicit', () => {
  assert.match(runtime, /child study locked/);
  assert.match(runtime, /no telemetry/);
  assert.match(runtime, /child_study_authorized: false/);
  assert.match(runtime, /telemetry_present: false/);
  assert.match(engine, /raw_content_recorded: false/);
  assert.match(loader, /presentation['"]\) === ['"]legacy/);
  assert.doesNotMatch(runtime, /navigator\.sendBeacon|sendBeacon\(|fetch\([^)]*(?:analytics|telemetry|aia-receipt)/i);
});

test('implementation adds no serverless route and leaves the deployment lock intact', () => {
  assert.doesNotMatch(engine + runtime + bridge + composition + cacheEviction, /\/api\/(?!dome-world-shell\?surface=cache-evict)/);
  assert.match(vercel, /"deploymentEnabled"\s*:\s*false/);
});
