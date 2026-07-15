import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  ASH_LIFECYCLE_SHELL_CONTRACT,
  ASH_THRESHOLD_ROUTE,
  injectAshLifecycleEntry,
  renderDomeWorldShell
} from '../api/dome-world-shell.js';
import {
  ASH_KEEP_SHELL_VERSION,
  injectAshKeepLifecycle
} from '../api/ash-keep-shell.js';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const domeSource = read('app/dome-world/index.html');
const renderedDome = renderDomeWorldShell(domeSource);
const threshold = read('app/dome-world/ash-threshold.html');
const keepSource = read('app/dome-world/ash-keep.html');
const renderedKeep = injectAshKeepLifecycle(keepSource);
const lifecycleUi = read('app/dome-world/ash-lifecycle.js');
const lifecycleEngine = read('app/engine/ash-lifecycle.js');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const vercel = JSON.parse(read('vercel.json'));

test('Dome-World runtime shell routes Ash to the threshold without rewriting the source instrument', () => {
  assert.equal(ASH_THRESHOLD_ROUTE, '/dome-world/ash-threshold.html');
  assert.equal(ASH_LIFECYCLE_SHELL_CONTRACT, 'td613.ash.lifecycle-shell/v0.1');
  assert.match(renderedDome, /class="tab"[^>]+href="\/dome-world\/ash-threshold\.html"[^>]*data-view="ash"/);
  assert.match(renderedDome, /<h2>Ash Threshold<\/h2>/);
  assert.doesNotMatch(renderedDome, /<h2>Ash Readiness<\/h2>/);
  assert.match(renderedDome, /Ash \/ custody threshold/);
  assert.equal(injectAshLifecycleEntry(renderedDome), renderedDome, 'Ash shell injection must be idempotent');
});

test('Dome shell preserves the independent Marrowline transform while installing Ash', () => {
  assert.match(renderedDome, /data-open-route="\/dome-world\/marrowline\.html"/);
  assert.match(renderedDome, /<span><b>11<\/b>stations<\/span>/);
});

test('the threshold performs a bounded three-law rite and persists only a session readiness receipt', () => {
  assert.match(threshold, /Arrival/);
  assert.match(threshold, /Boundary/);
  assert.match(threshold, /Custody/);
  assert.match(threshold, /compileReadinessReceipt/);
  assert.match(threshold, /sessionStorage\.setItem\('td613:ash-threshold:readiness:v0\.1'/);
  assert.doesNotMatch(threshold, /localStorage\.setItem/);
  assert.doesNotMatch(threshold, /type="file"/);
  assert.match(threshold, /raw content, no artifact bytes, and no release authority/i);
});

test('Ash Keep runtime shell loads lifecycle orchestration after the proven Keep core', () => {
  assert.equal(ASH_KEEP_SHELL_VERSION, 'td613.ash-keep.shell/v0.1');
  const coreIndex = renderedKeep.indexOf('/dome-world/ash-keep.js');
  const lifecycleIndex = renderedKeep.indexOf('/dome-world/ash-lifecycle.js');
  assert.ok(coreIndex >= 0, 'Ash Keep core script missing');
  assert.ok(lifecycleIndex > coreIndex, 'Lifecycle integration must load after the Keep core');
  assert.match(renderedKeep, /name="ash-lifecycle" content="v0\.1"/);
  assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'Keep shell injection must be idempotent');
});

test('Vercel gives the lifecycle shells specific routes before the generic Dome rewrite', () => {
  assert.deepEqual(vercel.functions['api/ash-keep-shell.js'], { maxDuration: 10, includeFiles: 'app/dome-world/ash-keep.html' });
  const rewrites = vercel.rewrites;
  const keepIndex = rewrites.findIndex(rule => rule.source === '/dome-world/ash-keep.html' && rule.destination === '/api/ash-keep-shell');
  const genericIndex = rewrites.findIndex(rule => rule.source === '/dome-world/(.*)');
  assert.ok(keepIndex >= 0 && keepIndex < genericIndex, 'Ash Keep shell route must precede the generic Dome route');
});

test('custody integration changes the Case Map rather than merely displaying a receipt', () => {
  assert.match(lifecycleUi, /buildCustodyRoot/);
  assert.match(lifecycleUi, /compileCaseMap/);
  assert.match(lifecycleUi, /custodyReference: binding\.custody_reference/);
  assert.match(lifecycleUi, /nodes: binding\.nodes/);
  assert.match(lifecycleUi, /case_map_digest: next\.case_map_digest/);
  assert.match(lifecycleEngine, /CURRENT_REBUILD_TEST_ABSENT/);
  assert.match(lifecycleEngine, /latestTest\.case_map_digest === caseMap\.case_map_digest/);
});

test('custody affects Reader, release, Save Point, and Capsule eligibility through lifecycle gates and the committed Case Map', () => {
  assert.match(lifecycleUi, /workspaceGate\(ui\.lifecycle, tab\.dataset\.workspace\)/);
  assert.match(lifecycleUi, /button\.disabled = !\(nativeReady && ui\.lifecycle\.gates\.local_release\)/);
  assert.match(lifecycleUi, /Custody root verified and case-bound/);
  assert.match(lifecycleEngine, /CONTINUITY_SEALED/);
  assert.match(lifecycleEngine, /latestSavePoint\.case_map_digest === caseMap\.case_map_digest/);
});

test('ledger and roadmap treat lifecycle orchestration as a scored workstream and directional blocker', () => {
  assert.match(ledger, /H\. Ash product lifecycle orchestration/);
  assert.match(ledger, /READINESS_OBSERVED/);
  assert.match(roadmap, /Ash product lifecycle repair/);
  assert.match(roadmap, /production-demonstrate Ash lifecycle orchestration/i);
  assert.match(roadmap, /Safe Harbor → Ash adapter must target the custody-root ingress/i);
});
