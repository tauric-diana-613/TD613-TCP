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
const shell = read('api/dome-world-shell.js');
const recovery = read('app/safe-harbor/ash-keep-recovery.html');
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

const EPOCH = '20260723-a2-a5-release-v1';
const CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1';

test('loader preserves legacy rollback and gates the entire AIA3 graph behind preflight', () => {
  assert.match(loader, /__td613AshAia3Preflight/);
  assert.match(loader, /preflight\.then/);
  assert.match(loader, /ash-cache-eviction-aia3\.js/);
  assert.match(loader, /legacyPresentation/);
  assert.match(loader, /dataset\.ashAiaLegacy/);
  assert.match(loader, /td613\.ash\.aia3-composition\/v0\.5-human-profile-choice/);
  for (const marker of ['data-ash-aia3-style', 'data-ash-aia3-compact', 'data-ash-aia3-interaction']) assert.match(loader, new RegExp(marker));
  for (const asset of ['ash-cache-flush.js', 'ash-ingress-layout-hydration.js', 'ash-lifecycle-core.js', 'ash-cache-eviction-aia3.js', 'ash-keep-aia.css', 'ash-keep-aia3.css', 'ash-keep-aia3-compact.css', 'ash-keep-aia3-interaction.css', 'ash-keep-aia.js', 'ash-aia3-composition.js', 'ash-keep-aia-workspace-bridge.js']) {
    assert.match(loader, new RegExp(`${escaped(asset)}\\?v=${EPOCH}`), `Loader omitted current epoch for ${asset}.`);
  }
  const interactionStyleIndex = loader.indexOf('data-ash-aia3-interaction');
  const runtimeImportIndex = loader.search(/await import\([`'"]\.\/ash-keep-aia\.js\?v=/);
  assert.ok(interactionStyleIndex >= 0 && runtimeImportIndex >= 0 && interactionStyleIndex < runtimeImportIndex);
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
  assert.match(composition, /button\.disabled = false/);
});

test('an open case cannot advertise readiness before lifecycle and the four-route four-task graph exist', () => {
  assert.match(composition, /REQUIRED_ROUTE_COUNT = 4/);
  assert.match(composition, /REQUIRED_TASK_COUNT = 4/);
  assert.match(composition, /WAITING_LIFECYCLE_STATE/);
  assert.match(composition, /WAITING_COMPLETE_ROUTE_TASK_GRAPH/);
  assert.match(composition, /route_count: root\?\.querySelectorAll\('\[data-aia-route\]'\)\.length \|\| 0/);
  assert.match(composition, /task_count: root\?\.querySelectorAll\('\[data-aia-task\]'\)\.length \|\| 0/);
  assert.match(composition, /setExactWork\(open && ready\)/);
  assert.match(composition, /dataset\.ashAia3Ready = String\(ready\)/);
  assert.match(composition, /dataset\.ashAia3ReadinessHold/);
  assert.match(composition, /td613:ash:aia3-readiness-changed/);
  assert.doesNotMatch(composition, /const ingressReady=open\|\|ensureDefaultProfile/);
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

test('mass eviction precedes current modules while first paint and the visible URL stay canonical', () => {
  assert.match(cacheEviction, new RegExp(escaped(CACHE_EPOCH)));
  assert.match(cacheEviction, new RegExp(EPOCH));
  assert.match(cacheEviction, /clearCacheStorage/);
  assert.match(cacheEviction, /unregisterWorkers/);
  assert.match(cacheEviction, /surface=cache-evict/);
  assert.match(cacheEviction, /indexeddb_preserved:true/);
  assert.match(cacheEviction, /case_data_preserved:true/);
  assert.match(cacheEviction, /active_session_reset:false/);
  assert.match(cacheEviction, /local_case_pointer_preserved:pointerAfter === pointerBefore/);
  assert.match(cacheEviction, /session_epoch_preserved:sessionAfter === sessionBefore/);
  assert.doesNotMatch(cacheEviction, /removeItem\?\.\(POINTER_KEY\)|removeItem\?\.\(SESSION_KEY\)|deleteDatabase|indexedDB\.delete|localStorage\.clear|sessionStorage\.clear/);
  assert.match(shell, /ash-cache-preflight/);
  assert.match(shell, /Preparing Ash/);
  assert.match(shell, /__td613AshAia3Preflight/);
  assert.match(shell, /await globalThis\.__td613AshAia3Preflight/);
  assert.match(shell, /session_epoch_preserved_or_migrated/);
  assert.match(shell, /CDN-Cache-Control/);
  assert.match(shell, /Vercel-CDN-Cache-Control/);
  assert.match(shell, /Clear-Site-Data/);
  assert.match(shell, /active_session_reset_by_client:false/);
  assert.match(shell, /local_case_pointer_preserved/);
  assert.doesNotMatch(shell, /searchParams\.set\('ash_epoch'|searchParams\.set\('ash_recovered'/);
  assert.doesNotMatch(shell, /indexedDB\.deleteDatabase|localStorage\.clear\(|sessionStorage\.clear\(/);
  assert.match(recovery, /history\.replaceState\(null,'',canonical\)/);
  assert.match(recovery, /document\.write\(shell\)/);
  assert.doesNotMatch(recovery, /ash_epoch|ash_recovered/);
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
