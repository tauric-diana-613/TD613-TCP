import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const stretch6 = read('docs/ASH_KEEP_STRETCH6_CLOSURE_RECEIPT.md');
const stretch7 = read('docs/ASH_KEEP_STRETCH7_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');

assert.match(ledger, /Ledger generation: `v1\.15 · Stretch 7 ordered route-sequence closure \/ Stretch 8 blocked \/ strategic deployment law \/ 11\+1 function covenant`/);
assert.match(ledger, /component maturity after Stretch 7 closure = 290 \/ 375/);
assert.match(ledger, /remaining component maturity = 85 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /validation-gated workstreams = 3 \/ 9/);
assert.match(ledger, /transport-capable workstreams = 0/);
assert.match(ledger, /current-head aftercare commit:[\s\S]*2c89b70e284562ebb6b842900ae1a1bd0b00f6e6/);
assert.match(ledger, /Stretch 5 · Aperture Composition Renovation Before Choir UI[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /Stretch 6 · Higher-Order Interference[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /Stretch 7 · Ordered Route-Sequence Recovery[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /Stretch 8 requires a fresh operator opening gesture/);

assert.match(roadmap, /Roadmap generation: `v1\.15/);
assert.match(roadmap, /Aperture composition = 18 \/ 25/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 5 · Aperture composition renovation before Choir UI — CLOSED/);
assert.match(roadmap, /Stretch 6 · Higher-order interference — CLOSED/);
assert.match(roadmap, /Stretch 7 · Ordered route-sequence recovery — CLOSED/);
assert.match(roadmap, /Temporal and delayed-disclosure assays — BLOCKED \/ NOT AUTHORIZED/);
assert.match(roadmap, /ordinary work-branch deployment = SUPPRESSED WHERE SUPPORTED/);

assert.match(closure, /status: CLOSED/);
assert.match(closure, /maturity: IMPLEMENTED_VALIDATION_GATED/);
assert.match(closure, /Stretch_6_authorized: false/);
assert.match(stretch6, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch7, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch7, /validated implementation commit = 4fb0f8ad52457c200061af79e5346b1fdb67e09c/);
assert.match(stretch7, /Stretch 8 authorization = false/);
assert.match(law, /branch work ≠ deployment requirement/);
assert.match(law, /Exceptions must be recorded/);

console.log('stretch1-preservation/packet-state.test.mjs passed');
