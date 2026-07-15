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
const thresholdMembrane = read('app/dome-world/ash-threshold-membrane.js');
const thresholdMembraneCss = read('app/dome-world/ash-threshold-membrane.css');
const keepEntry = read('app/dome-world/ash-keep-entry.js');
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

test('Dome-World keeps Ash internal until the operator clears the embedded threshold', () => {
  assert.equal(ASH_THRESHOLD_ROUTE, '/dome-world/ash-threshold.html');
  assert.equal(ASH_LIFECYCLE_SHELL_CONTRACT, 'td613.ash.lifecycle-shell/v0.1');
  assert.match(renderedDome, /<button class="tab" data-view="ash"[^>]*><small>04<\/small><span>Ash<\/span><\/button>/);
  assert.doesNotMatch(renderedDome, /class="tab"[^>]+href="\/dome-world\/ash-threshold\.html"[^>]*data-view="ash"/);
  assert.match(renderedDome, /data-ash-threshold-membrane/);
  assert.match(renderedDome, /data-ash-threshold-enter href="\/dome-world\/ash-threshold\.html"/);
  assert.match(renderedDome, /id="ashThresholdTitle">A<em>s<\/em>h<\/h1>/);
  assert.doesNotMatch(renderedDome, /<h2>Ash Readiness<\/h2>/);
  assert.equal(injectAshLifecycleEntry(renderedDome), renderedDome, 'Ash shell injection must be idempotent');
});

test('Dome shell preserves the independent Marrowline transform while installing Ash', () => {
  assert.match(renderedDome, /data-open-route="\/dome-world\/marrowline\.html"/);
  assert.match(renderedDome, /<span><b>11<\/b>stations<\/span>/);
});

test('the clearing rite lives in Dome-World and enters only after an explicit operator gesture', () => {
  for (const law of ['Arrival', 'Boundary', 'Custody']) assert.match(renderedDome, new RegExp(law));
  assert.match(thresholdMembrane, /compileReadinessReceipt/);
  assert.match(thresholdMembrane, /sessionStorage\.setItem\(READINESS_KEY/);
  assert.match(thresholdMembrane, /location\.assign\(enter\.href \|\| KEEP_ROUTE\)/);
  assert.doesNotMatch(thresholdMembrane, /location\.replace|setTimeout\(\(\) => location/);
  assert.doesNotMatch(thresholdMembrane, /localStorage\.setItem|type="file"/);
  assert.match(thresholdMembraneCss, /\.ash-threshold-laws/);
  assert.match(thresholdMembraneCss, /prefers-reduced-motion/);
});

test('the threshold route is now a direct Ash Keep delivery surface, not a second clearing rite', () => {
  assert.match(threshold, /data-ash-public-route="\/dome-world\/ash-threshold\.html"/);
  assert.match(threshold, /src="\/dome-world\/ash-keep-entry\.js"/);
  assert.doesNotMatch(threshold, /data-ash-law-step|compileReadinessReceipt|location\.replace|http-equiv="refresh"/);
  assert.match(keepEntry, /dataset\?\.ashPublicRoute/);
  assert.match(keepEntry, /window\.location\.replace\(canonicalKeepRoute\(\)\)/);
});

test('the canonical Keep annotates history before loading its native ordered composition', () => {
  assert.match(renderedKeep, /src="\/dome-world\/ash-keep\.js"/);
  assert.match(renderedKeep, /src="\/dome-world\/ash-convergence\.js"/);
  assert.match(renderedKeep, /sessionStorage\.getItem\('td613:ash-threshold:readiness:v0\.1'\)/);
  assert.match(renderedKeep, /history\.replaceState\(null,'',location\.pathname\+'\?arrival=cleared'\)/);
  const historyIndex = renderedKeep.indexOf("sessionStorage.getItem('td613:ash-threshold:readiness:v0.1')");
  const coreIndex = renderedKeep.indexOf('/dome-world/ash-keep.js');
  const convergenceIndex = renderedKeep.indexOf('/dome-world/ash-convergence.js');
  const lifecycleIndex = renderedKeep.indexOf('/dome-world/ash-lifecycle.js');
  assert.ok(historyIndex >= 0 && coreIndex > historyIndex && convergenceIndex > coreIndex && lifecycleIndex > convergenceIndex, 'History, core, convergence, and lifecycle must load in declared order');
});

test('one Dome shell function validates the canonical Keep composition without rewriting it', () => {
  assert.equal(ASH_KEEP_SHELL_VERSION, 'td613.ash-keep.shell/v0.2-canonical-composition');
  const coreIndex = renderedKeep.indexOf('/dome-world/ash-keep.js');
  const lifecycleIndex = renderedKeep.indexOf('/dome-world/ash-lifecycle.js');
  assert.ok(coreIndex >= 0, 'Canonical Ash Keep core script missing');
  assert.ok(lifecycleIndex > coreIndex, 'Lifecycle integration must load after the Keep core');
  assert.match(renderedKeep, /name="ash-lifecycle" content="v0\.1"/);
  assert.match(renderedKeep, /name="ash-constitutional-composition" content="v0\.1"/);
  assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'Keep shell validation must be byte-identical');
});

test('the canonical core owns Draft authority and release-bound continuity without reload injection', () => {
  assert.equal(ASH_KEEP_JS_SHELL_VERSION, 'td613.ash-keep.js-shell/v0.4-native-bindings');
  assert.match(renderedKeepJs, /caseMapDigest: state\.caseMap\.case_map_digest/);
  assert.match(renderedKeepJs, /releaseReceiptReference: state\.latestRelease\?\.receipt_id \|\| null/);
  assert.match(renderedKeepJs, /releaseReceiptDigest: state\.latestRelease\?\.receipt_digest \|\| null/);
  assert.match(renderedKeepJs, /latestSavePoint\.release_receipt_reference !== currentRelease\.receipt_id/);
  assert.match(renderedKeepJs, /announce\('review-kept'/);
  assert.doesNotMatch(renderedKeepJs, /location\.reload\(\)/);
  assert.equal(bindAshDraftsToCaseMap(renderedKeepJs), renderedKeepJs, 'Keep JS validation must be byte-identical');
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
  const thresholdIndex = rewrites.findIndex(rule => rule.source === '/dome-world/ash-threshold.html' && rule.destination === '/api/dome-world-shell?surface=ash-keep-html');
  const keepIndex = rewrites.findIndex(rule => rule.source === '/dome-world/ash-keep.html' && rule.destination === '/api/dome-world-shell?surface=ash-keep-html');
  const keepJsIndex = rewrites.findIndex(rule => rule.source === '/dome-world/ash-keep.js' && rule.destination === '/api/dome-world-shell?surface=ash-keep-js');
  const genericIndex = rewrites.findIndex(rule => rule.source === '/dome-world/(.*)');
  assert.ok(thresholdIndex >= 0 && thresholdIndex < genericIndex, 'Ash threshold entry route must precede the generic Dome route');
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
  assert.match(lifecycleUi, /const shouldDisable = !\(nativeReady && ui\.lifecycle\.gates\.local_release\)/);
  assert.match(lifecycleUi, /if \(button\.disabled !== shouldDisable\) button\.disabled = shouldDisable/);
  assert.doesNotMatch(lifecycleUi, /button\.disabled = !\(nativeReady && ui\.lifecycle\.gates\.local_release\)/);
  assert.match(lifecycleUi, /Custody root verified and case-bound/);
  assert.match(lifecycleEngine, /CURRENT_CUSTODY_BOUND_DRAFT_ABSENT/);
  assert.match(lifecycleEngine, /CONTINUITY_SEALED/);
  assert.match(lifecycleEngine, /latestSavePoint\.case_map_digest === caseMap\.case_map_digest/);
  assert.match(lifecycleEngine, /latestSavePoint\.release_receipt_reference === latestRelease\.receipt_id/);
  assert.match(lifecycleEngine, /latestSavePoint\.release_receipt_digest === latestRelease\.receipt_digest/);
});

test('ledger and roadmap preserve lifecycle closure while convergence awaits deployed observation', () => {
  assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
  assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*35 \/ 45\*\*/);
  assert.match(ledger, /production-demonstrated workstreams = 2 \/ 9/);
  assert.match(ledger, /component maturity on main = 193 \/ 375/);
  assert.match(ledger, /current-head aftercare ≠ feature-specific production demonstration/);
  assert.match(ledger, /# Constitutional Synthesis Matrix/);
  assert.match(ledger, /Score: `40 \/ 50`/);
  assert.match(roadmap, /lifecycle production closure \[CLOSED\]/);
  assert.match(roadmap, /constitutional convergence closure \[VALIDATION PASSED .* DEPLOYED OBSERVATION PENDING\]/);
  assert.match(roadmap, /Custodian Return \/ Lifecycle Reconstitution/);
  assert.match(roadmap, /Choir calibration receipt binding/);
  assert.ok(roadmap.indexOf('Custodian Return / Lifecycle Reconstitution') < roadmap.indexOf('Choir calibration receipt binding'), 'Custodian Return must precede Choir calibration after convergence.');
  assert.match(roadmap, /Safe Harbor → Ash custody-root adapter/);
  assert.match(roadmap, /transport-capable workstreams = 0/);
});
