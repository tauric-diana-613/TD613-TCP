import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const receipt = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const stretch6 = read('docs/ASH_KEEP_STRETCH6_CLOSURE_RECEIPT.md');
const stretch7 = read('docs/ASH_KEEP_STRETCH7_CLOSURE_RECEIPT.md');
const stretch8 = read('docs/ASH_KEEP_STRETCH8_CLOSURE_RECEIPT.md');
const stretch9 = read('docs/ASH_KEEP_STRETCH9_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');

for (const token of [
  'status: CLOSED',
  'maturity: IMPLEMENTED_VALIDATION_GATED',
  'closure_observed_main_commit: e1fe108264045c4d75f0ef275b15654cf61b52a5',
  'runtime_run: 29514528199',
  'runtime_artifact: 8382058122',
  'constitution_run: 29514528261',
  'constitution_artifact: 8382057487',
  'Vercel_evidence_use: EXACT_MAIN_AFTERCARE_ONLY',
  'Vercel_operator_release_gesture: NOT_RECORDED_PRE_LAW_AUTOMATIC_DEPLOYMENT',
  'Vercel_strategic_release_claim: false',
  'normal_ceiling: ONE_PER_COMPLETED_PACKET_OR_RELEASE_CANDIDATE',
  'deployment_earns_maturity: false',
  'Stretch_6_authorized: false'
]) assert.ok(receipt.includes(token), `Receipt omitted ${token}`);

assert.match(ledger, /component maturity after Stretch 9 closure = 320 \/ 375/);
assert.match(ledger, /Vercel automatic aftercare status: SUCCESS \(not a strategic release witness\)/);
assert.doesNotMatch(ledger, /Vercel release witness: SUCCESS/);
assert.match(roadmap, /Stretch 5 — CLOSED/);
assert.match(roadmap, /Stretch 6 · Higher-order interference — CLOSED/);
assert.match(roadmap, /Stretch 7 · Ordered route-sequence recovery — CLOSED/);
assert.match(roadmap, /Stretch 8 · Temporal and delayed-disclosure assays — CLOSED/);
assert.match(roadmap, /Stretch 9 · Safe Harbor → Ash custody-root adapter — CLOSED/);
assert.match(stretch6, /production demonstration = NOT_CLAIMED/);
assert.match(stretch7, /production demonstration = NOT_CLAIMED/);
assert.match(stretch8, /production demonstration = NOT_CLAIMED/);
assert.match(stretch9, /production demonstration = NOT_CLAIMED/);
assert.match(stretch9, /One strategic Vercel deployment is authorized/);
assert.match(law, /normal ceiling is one deliberate Vercel deployment per completed packet or release candidate/);

console.log('aperture-composition/closure.test.mjs passed');
