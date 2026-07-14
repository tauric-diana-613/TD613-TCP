import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const dome = read('app/dome-world/index.html');
const threshold = read('app/dome-world/ash-threshold.html');
const keep = read('app/dome-world/ash-keep.html');
const lifecycleUi = read('app/dome-world/ash-lifecycle.js');
const lifecycleEngine = read('app/engine/ash-lifecycle.js');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');

test('Dome-World routes the Ash tab to the threshold instead of presenting Readiness as the product', () => {
  assert.match(dome, /class="tab"[^>]+href="\/dome-world\/ash-threshold\.html"[^>]*data-view="ash"/);
  assert.match(dome, /<h2>Ash Threshold<\/h2>/);
  assert.doesNotMatch(dome, /<h2>Ash Readiness<\/h2>/);
  assert.match(dome, /Ash \/ custody threshold/);
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

test('Ash Keep loads lifecycle orchestration after the proven Keep core', () => {
  const coreIndex = keep.indexOf('/dome-world/ash-keep.js');
  const lifecycleIndex = keep.indexOf('/dome-world/ash-lifecycle.js');
  assert.ok(coreIndex >= 0, 'Ash Keep core script missing');
  assert.ok(lifecycleIndex > coreIndex, 'Lifecycle integration must load after the Keep core');
  assert.match(keep, /ash-lifecycle="v0\.1"/);
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

test('custody affects Reader, release, Save Point, and Capsule eligibility through the lifecycle gates and committed Case Map', () => {
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
