import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const stretch6 = read('docs/ASH_KEEP_STRETCH6_CLOSURE_RECEIPT.md');
const stretch7 = read('docs/ASH_KEEP_STRETCH7_CLOSURE_RECEIPT.md');
const stretch8 = read('docs/ASH_KEEP_STRETCH8_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');

assert.match(ledger, /Ledger generation: `v1\.16 · Stretch 8 temporal disclosure closure/);
assert.match(ledger, /component maturity after Stretch 8 closure = 296 \/ 375/);
assert.match(ledger, /remaining component maturity = 79 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /validation-gated workstreams = 3 \/ 9/);
assert.match(ledger, /transport-capable workstreams = 0/);
assert.match(ledger, /current-head aftercare commit:[\s\S]*2c89b70e284562ebb6b842900ae1a1bd0b00f6e6/);
assert.match(ledger, /Stretch 6 · Higher-Order Interference[\s\S]*CLOSED/);
assert.match(ledger, /Stretch 7 · Ordered Route-Sequence Recovery[\s\S]*STRATEGIC_DEPLOYMENT_SEALED/);
assert.match(ledger, /Stretch 8 · Temporal And Delayed-Disclosure Assays[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /successful Stretch 8 seal → Stretch 9 may open under the recorded operator directive/);

assert.match(roadmap, /Roadmap generation: `v1\.16/);
assert.match(roadmap, /Aperture composition = 18 \/ 25/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 7 · Ordered route-sequence recovery — CLOSED/);
assert.match(roadmap, /Stretch 8 · Temporal and delayed-disclosure assays — CLOSED/);
assert.match(roadmap, /Safe Harbor → Ash custody-root adapter — CONDITIONALLY AUTHORIZED AFTER SUCCESSFUL STRETCH 8 SEAL/);
assert.match(roadmap, /ordinary work-branch deployment = SUPPRESSED WHERE SUPPORTED/);

assert.match(closure, /status: CLOSED/);
assert.match(closure, /maturity: IMPLEMENTED_VALIDATION_GATED/);
assert.match(closure, /Stretch_6_authorized: false/);
assert.match(stretch6, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch7, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch8, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch8, /validated implementation commit = f40a1f9a3e93132c0456947f46b125e488472ec0/);
assert.match(stretch8, /Stretch 9 authorization = CONDITIONAL_ON_SUCCESSFUL_STRETCH_8_VERCEL_SEAL/);
assert.match(stretch8, /Stretch 10 authorization = false/);
assert.match(law, /branch work ≠ deployment requirement/);
assert.match(law, /Exceptions must be recorded/);

console.log('stretch1-preservation/packet-state.test.mjs passed');
