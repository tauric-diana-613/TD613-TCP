import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  ASH_KEEP_JS_SHELL_VERSION,
  ASH_KEEP_SHELL_VERSION,
  ASH_LIFECYCLE_SHELL_CONTRACT,
  ASH_THRESHOLD_ROUTE,
  bindAshDraftsToCaseMap,
  injectAshKeepLifecycle,
  injectAshLifecycleEntry,
  renderDomeWorldShell
} from '../api/dome-world-shell.js';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const domeSource = read('app/dome-world/index.html');
const renderedDome = renderDomeWorldShell(domeSource);
const threshold = read('app/dome-world/ash-threshold.html');
const keepSource = read('app/dome-world/ash-keep.html');
const renderedKeep = injectAshKeepLifecycle(keepSource);
const keepJsSource = read('app/dome-world/ash-keep.js');
const renderedKeepJs = bindAshDraftsToCaseMap(keepJsSource);
const lifecycleUi = read('app/dome-world/ash-lifecycle.js');
const lifecycleEngine = read('app/engine/ash-lifecycle.js');
const draftEngine = read('app/engine/ash-keep-drafts.js');
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

test('the threshold performs a bounded rite and enters the composed Keep surface directly', () => {
  assert.match(threshold, /Arrival/);
  assert.match(threshold, /Boundary/);
  assert.match(threshold, /Custody/);
  assert.match(threshold, /compileReadinessReceipt/);
  assert.match(threshold, /sessionStorage\.setItem\('td613:ash-threshold:readiness:v0\.1'/);
  assert.doesNotMatch(threshold, /localStorage\.setItem/);
  assert.doesNotMatch(threshold, /type="file"/);
  assert.match(threshold, /no raw (?:content|text), no artifact bytes, and no release authority/i);
  assert.match(threshold, /location\.replace\('\/api\/dome-world-shell\?surface=ash-keep-html'\)/);
  assert.doesNotMatch(threshold, /location\.replace\('\/dome-world\/ash-keep\.html/);
});

test('the composed Keep annotates history only after the shell and transformed core load', () => {
  assert.match(renderedKeep, /src="\/api\/dome-world-shell\?surface=ash-keep-js"/);
  assert.match(renderedKeep, /td613 arrival-route compatibility/);
  assert.match(renderedKeep, /sessionStorage\.getItem\('td613:ash-threshold:readiness:v0\.1'\)/);
  assert.match(renderedKeep, /history\.replaceState\(null,'','\/dome-world\/ash-keep\.html\?arrival=cleared'\)/);
  const coreIndex = renderedKeep.indexOf('/api/dome-world-shell?surface=ash-keep-js');
  const historyIndex = renderedKeep.indexOf('td613 arrival-route compatibility');
  const lifecycleIndex = renderedKeep.indexOf('/dome-world/ash-lifecycle.js');
  assert.ok(coreIndex >= 0 && historyIndex > coreIndex && lifecycleIndex > historyIndex, 'Composed core, history annotation, and lifecycle must load in declared order');
});

test('one Dome shell function composes the Keep lifecycle after the proven Keep core', () => {
  assert.equal(ASH_KEEP_SHELL_VERSION, 'td613.ash-keep.shell/v0.1');
  const coreIndex = renderedKeep.indexOf('/api/dome-world-shell?surface=ash-keep-js');
  const lifecycleIndex = renderedKeep.indexOf('/dome-world/ash-lifecycle.js');
  assert.ok(coreIndex >= 0, 'Composed Ash Keep core script missing');
  assert.ok(lifecycleIndex > coreIndex, 'Lifecycle integration must load after the Keep core');
  assert.match(renderedKeep, /name="ash-lifecycle" content="v0\.1"/);
  assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'Keep shell injection must be idempotent');
});

test('the Dome shell binds Draft authority and refreshes lifecycle after exact review', () => {
  assert.equal(ASH_KEEP_JS_SHELL_VERSION, 'td613.ash-keep.js-shell/v0.2-review-refresh');
  assert.match(renderedKeepJs, /caseMapDigest: state\.caseMap\.case_map_digest/);
  assert.match(renderedKeepJs, /td613 lifecycle review refresh/);
  assert.match(renderedKeepJs, /setTimeout\(\(\) => location\.reload\(\), 160\)/);
  assert.equal(bindAshDraftsToCaseMap(renderedKeepJs), renderedKeepJs, 'Keep JS binding must be idempotent');
  assert.match(draftEngine, /case_map_digest: optionalDigest\(input\.caseMapDigest/);
  assert.match(draftEngine, /Review is bound to a different Case Map/);
  assert.match(draftEngine, /case_map_digest: input\.draft\.case_map_digest/);
});

test('Vercel multiplexes lifecycle surfaces through one existing function before the generic Dome rewrite', () => {
  assert.deepEqual(vercel.functions['api/dome-world-shell.js'], {
    maxDuration: 10,
    includeFiles: 'app/dome-world/{index.html,ash-keep.html,ash-keep.js}'
  });
  assert.equal(vercel.functions['api/ash-keep-shell.js'], undefined);
  assert.equal(vercel.functions['api/ash-keep-js-shell.js'], undefined);
  const rewrites = vercel.rewrites;
  const keepIndex = rewrites.findIndex(rule => rule.source === '/dome-world/ash-keep.html' && rule.destination === '/api/dome-world-shell?surface=ash-keep-html');
  const keepJsIndex = rewrites.findIndex(rule => rule.source === '/dome-world/ash-keep.js' && rule.destination === '/api/dome-world-shell?surface=ash-keep-js');
  const genericIndex = rewrites.findIndex(rule => rule.source === '/dome-world/(.*)');
  assert.ok(keepIndex >= 0 && keepIndex < genericIndex, 'Ash Keep surface route must precede the generic Dome route');
  assert.ok(keepJsIndex >= 0 && keepJsIndex < genericIndex, 'Ash Keep JS surface route must precede the generic Dome route');
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

test('custody affects Reader, draft, release, Save Point, and Capsule eligibility through lifecycle gates', () => {
  assert.match(lifecycleUi, /workspaceGate\(ui\.lifecycle, tab\.dataset\.workspace\)/);
  assert.match(lifecycleUi, /button\.disabled = !\(nativeReady && ui\.lifecycle\.gates\.local_release\)/);
  assert.match(lifecycleUi, /Custody root verified and case-bound/);
  assert.match(lifecycleEngine, /CURRENT_CUSTODY_BOUND_DRAFT_ABSENT/);
  assert.match(lifecycleEngine, /CONTINUITY_SEALED/);
  assert.match(lifecycleEngine, /latestSavePoint\.case_map_digest === caseMap\.case_map_digest/);
});

test('ledger and roadmap hold lifecycle at validation-gated while selecting deployed closure', () => {
  assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*24 \/ 35\*\*/);
  assert.match(ledger, /production demonstration remains unearned/i);
  assert.match(roadmap, /Ash lifecycle production closure/);
  assert.match(roadmap, /SELECTED_NEXT/);
  assert.match(roadmap, /Safe Harbor → Ash custody-root adapter/);
});
