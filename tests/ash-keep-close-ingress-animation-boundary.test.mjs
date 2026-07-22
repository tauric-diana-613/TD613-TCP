import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const boundary = read('app/dome-world/ash-close-ingress-animation-boundary.js');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const closeRepair = read('app/dome-world/ash-case-close-repair.js');
const ingress = read('app/dome-world/ash-ingress-layout-hydration.js');
const aia = read('app/dome-world/ash-keep-aia.js');
const rescue = read('app/dome-world/ash-ui-ux-rescue.js');
const compact = read('app/dome-world/ash-keep-aia3-compact.css');
const browserProbe = read('scripts/ash-close-ingress-animation-browser-probe.mjs');
const returnProbe = read('scripts/ash-custodian-return-production-probe.mjs');

assert.match(bridge, /ash-close-ingress-animation-boundary\.js\?v=20260722-close-ingress-animation-v1/,
  'Canonical workspace bridge omitted the close/animation boundary.');

for (const token of [
  "const POINTER_KEY = 'td613.ash-keep.current-case'",
  "const SESSION_EPOCH_KEY = 'td613.ash.session.epoch'",
  'installPointerAuthoritativeCoreView',
  'pointer_authoritative_session:true',
  'current:() => activeCasePointer() ? current()',
  "case_id:null",
  'function openPresentationMatches()',
  'function releaseOpenPresentation(',
  'function settleOpenPresentation(',
  "setData(doc.documentElement, 'ashSessionOpen', 'true')",
  "setData(doc.body, 'ashAiaCaseOpen', 'true')",
  "launch?.classList.add('hidden')",
  'setInert(main, false)',
  'setInert(rail, false)',
  "host.__td613AshIngressLayout?.openSession?.()",
  "td613:ash:open-workspace-restored",
  "'case-opened', 'profile-demo-hydrated'",
  "POINTER_PRESENT_MUTATION_REPAIR",
  "BOOT_WITH_ACTIVE_POINTER",
  'function recoveryPresentationRequested()',
  'function recoveryPresentationMatches()',
  'function releaseRecoveryPresentation(',
  "byId('workspace-save')",
  "byId('ashReturnPanel')",
  "setData(doc.documentElement, 'ashRecoverySession', 'ISOLATED_CAPSULE_RETURN')",
  "setData(doc.body, 'ashAiaCaseOpen', 'false')",
  'setInert(main, false)',
  'setInert(rail, true)',
  "td613:ash:isolated-return-restored",
  'live_case_mutation_authorized:false',
  'RECOVERY_REQUEST_MUTATION_REPAIR',
  'RECOVERY_REQUEST_PRECEDES_CLOSED_INGRESS',
  "setData(doc.documentElement, 'ashSessionOpen', 'false')",
  "launch?.classList.remove('hidden')",
  'setInert(main, true)',
  'setInert(rail, true)',
  "host.__td613AshIngressLayout?.closeSession?.()",
  'function reconcileIngressDemoControls()',
  "button.setAttribute('aria-busy', 'false')",
  "profile.dispatchEvent(new Event('change', { bubbles:true }))",
  "host.__td613AshResearchControlState?.reconcile?.()",
  'Research project demo available.',
  'function closedPresentationMatches()',
  "if (closedPresentationMatches() && !localValue(SESSION_EPOCH_KEY)) return true",
  "POINTER_ABSENT_MUTATION_REPAIR",
  "td613:ash:close-ingress-restored",
  "for (const delay of [80, 240, 800])",
  "type === 'case-closed'",
  "BOOT_WITHOUT_ACTIVE_POINTER",
  'let repairQueued = false',
  'function repairFromCurrentState()',
  "setData(doc.documentElement, 'ashSessionObserverScope', 'EXACT_SURFACES')",
  "byId('workspace-save')"
]) assert.ok(boundary.includes(token), `Close/ingress boundary omitted ${token}`);

assert.doesNotMatch(boundary, /observer\.observe\(doc\.body, \{[^}]*childList:true[^}]*subtree:true/,
  'Session observer returned to whole-subtree mutation surveillance.');
assert.match(boundary, /observer\.observe\(doc\.body, \{ attributes:true, attributeFilter:\['data-ash-aia-case-open'\] \}\)/,
  'Session observer omitted the exact body posture seam.');
assert.match(boundary, /for \(const surface of surfaces\)[\s\S]*attributeFilter:\['class','hidden','inert','aria-hidden','style'\]/,
  'Session observer omitted exact launch, main, rail, and Save surface attributes.');

assert.doesNotMatch(boundary, /deleteDatabase|objectStore\([^)]*\)\.delete|clear\(\)/,
  'Close/ingress repair must not delete IndexedDB case material.');
assert.match(closeRepair, /saveBeforeClose\(caseId\)/,
  'Close Case no longer saves before ending the active session.');
assert.match(closeRepair, /localStorage\.removeItem\(POINTER_KEY\)/,
  'Close Case no longer clears the active-session pointer.');
assert.match(closeRepair, /td613:ash:case-closed/,
  'Close Case no longer publishes the session-boundary event.');
assert.match(ingress, /host\.addEventListener\('td613:ash:case-closed', \(\) => setSessionOpen\(false/,
  'Canonical ingress no longer recognizes Close Case.');

for (const token of [
  "play.dataset.ashArtifactRequired = 'false'",
  'No artifact upload is required',
  'no artifact upload required',
  "setData(doc.documentElement, 'ashExplanationArtifactGate', 'NONE')",
  'FINITE_FOUR_STEP_MOTION',
  'STATIC_REDUCED_MOTION',
  'Compact screens use the four-step motion track',
  'Reduced motion is on, so Ash shows the four deterministic frames statically'
]) assert.ok(boundary.includes(token), `Animation affordance omitted ${token}`);

assert.match(boundary, /#launch \.launch-panel>\*\{position:relative!important;inset:auto!important;transform:none!important\}/,
  'Closed ingress does not normalize direct-child copy flow.');
assert.match(boundary, /#capsuleRecoveryLaunchDescription\{position:static!important;grid-column:1\/-1!important;grid-row:auto!important/,
  'Capsule recovery description can still collide with primary ingress copy.');

assert.ok(aia.includes("$('[data-aia-play]').onclick = playExplanation;"),
  'Explanation animation lost its explicit play gesture.');
assert.match(aia, /function playExplanation\(\)[\s\S]*state\.frame = 0[\s\S]*state\.frame < TASKS\.length - 1/,
  'Four-step explanation animation no longer advances deterministically.');
assert.doesNotMatch(aia, /function playExplanation\(\)[\s\S]{0,900}(localTextFile|files\?\.length|documentOpen\(\))/,
  'Explanation playback became artifact-gated.');
assert.match(rescue, /function startVisibleExplanation\(\)[\s\S]*for \(const step of \[0, 1, 2, 3\]\)/,
  'Visible explanation rescue no longer exposes all four reduced-motion frames.');
assert.match(compact, /@media\(max-width:760px\)/,
  'Compact AIA presentation contract disappeared.');
assert.match(compact, /\.ash-aia__stage\{height:86px!important;min-height:86px!important\}/,
  'Compact screens no longer receive the bounded explanation stage.');

for (const token of [
  'copy_overlap_pairs',
  "profile_value === 'research'",
  'demo control remained stale after close',
  'ingress status contradicts selected Research profile',
  'ingress copy overlaps',
  'file_count === 0'
]) assert.ok(browserProbe.includes(token), `Browser witness omitted ${token}`);

for (const token of [
  "open('save')",
  "page.click('#runCustodianReturn')",
  'live case untouched',
  'indexedCaseCount'
]) assert.ok(returnProbe.includes(token), `Custodian Return witness omitted ${token}`);

for (const source of [boundary, closeRepair, ingress, aia, rescue, browserProbe, returnProbe]) {
  assert.doesNotMatch(source, /prediction_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /automatic_action_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /recipient_transport\s*:\s*true/);
}

console.log('ash-keep-close-ingress-animation-boundary.test.mjs passed');
