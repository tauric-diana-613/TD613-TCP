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

assert.match(bridge, /ash-close-ingress-animation-boundary\.js\?v=20260722-close-ingress-animation-v1/,
  'Canonical workspace bridge omitted the close/animation boundary.');

for (const token of [
  "const POINTER_KEY = 'td613.ash-keep.current-case'",
  'installPointerAuthoritativeCoreView',
  'pointer_authoritative_session:true',
  'current:() => activeCasePointer() ? current()',
  "case_id:null",
  "doc.documentElement.dataset.ashSessionOpen = 'false'",
  "launch?.classList.remove('hidden')",
  'setInert(main, true)',
  'setInert(rail, true)',
  "host.__td613AshIngressLayout?.closeSession?.()",
  "td613:ash:close-ingress-restored",
  "for (const delay of [80, 240, 800])",
  "type === 'case-closed'",
  "BOOT_WITHOUT_ACTIVE_POINTER"
]) assert.ok(boundary.includes(token), `Close/ingress boundary omitted ${token}`);

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
  "ashExplanationArtifactGate = 'NONE'",
  'FINITE_FOUR_STEP_MOTION',
  'STATIC_REDUCED_MOTION',
  'Compact screens use the four-step motion track',
  'Reduced motion is on, so Ash shows the four deterministic frames statically'
]) assert.ok(boundary.includes(token), `Animation affordance omitted ${token}`);

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

for (const source of [boundary, closeRepair, ingress, aia, rescue]) {
  assert.doesNotMatch(source, /prediction_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /automatic_action_authorized\s*:\s*true/);
  assert.doesNotMatch(source, /recipient_transport\s*:\s*true/);
}

console.log('ash-keep-close-ingress-animation-boundary.test.mjs passed');
