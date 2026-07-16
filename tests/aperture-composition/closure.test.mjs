import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const receipt = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');

for (const token of [
  'status: CLOSED',
  'maturity: IMPLEMENTED_VALIDATION_GATED',
  'closure_observed_main_commit: e1fe108264045c4d75f0ef275b15654cf61b52a5',
  'runtime_run: 29514528199',
  'runtime_artifact: 8382058122',
  'constitution_run: 29514528261',
  'constitution_artifact: 8382057487',
  'normal_ceiling: ONE_PER_COMPLETED_PACKET_OR_RELEASE_CANDIDATE',
  'deployment_earns_maturity: false',
  'Stretch_6_authorized: false'
]) assert.ok(receipt.includes(token), `Receipt omitted ${token}`);

assert.match(ledger, /component maturity after Stretch 5 closure = 270 \/ 375/);
assert.match(roadmap, /Stretch 5 — CLOSED/);
assert.match(law, /normal ceiling is one deliberate Vercel deployment per completed packet or release candidate/);

console.log('aperture-composition/closure.test.mjs passed');
