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
const stretch10 = read('docs/ASH_KEEP_STRETCH10_CLOSURE_RECEIPT.md');
const stretch11 = read('docs/ASH_KEEP_STRETCH11_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');
for (const token of [
  'status: CLOSED','maturity: IMPLEMENTED_VALIDATION_GATED','closure_observed_main_commit: e1fe108264045c4d75f0ef275b15654cf61b52a5',
  'runtime_run: 29514528199','constitution_run: 29514528261','deployment_earns_maturity: false','Stretch_6_authorized: false'
]) assert.ok(receipt.includes(token), `Receipt omitted ${token}`);
assert.match(ledger, /component maturity after Stretch 11 local closure = 358 \/ 375/);
assert.match(ledger, /E\. Aperture composition renovation \| \*\*18 \/ 25\*\*/);
assert.match(roadmap, /Stretch 5 — CLOSED/);
assert.match(roadmap, /Stretch 11 · Destination-Bound Handoff — CLOSED LOCALLY/);
for (const item of [stretch6,stretch7,stretch8,stretch9,stretch10,stretch11]) assert.match(item, /production demonstration = (?:NOT_CLAIMED|PENDING_EXACT_MAIN_DEPLOYED_OBSERVATION)/);
assert.match(law, /normal ceiling is one deliberate Vercel deployment per completed packet or release candidate/);
console.log('aperture-composition/closure.test.mjs passed');
