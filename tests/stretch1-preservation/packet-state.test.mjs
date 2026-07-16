import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const stretch6 = read('docs/ASH_KEEP_STRETCH6_CLOSURE_RECEIPT.md');
const stretch7 = read('docs/ASH_KEEP_STRETCH7_CLOSURE_RECEIPT.md');
const stretch8 = read('docs/ASH_KEEP_STRETCH8_CLOSURE_RECEIPT.md');
const stretch9 = read('docs/ASH_KEEP_STRETCH9_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');

assert.match(ledger, /Ledger generation: `v1\.17 · Stretch 9 Safe Harbor ingress closure/);
assert.match(ledger, /component maturity after Stretch 9 closure = 320 \/ 375/);
assert.match(ledger, /remaining component maturity = 55 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /validation-gated workstreams = 4 \/ 9/);
assert.match(ledger, /transport-capable workstreams = 0/);
assert.match(ledger, /current-head aftercare commit:[\s\S]*2c89b70e284562ebb6b842900ae1a1bd0b00f6e6/);
assert.match(ledger, /Stretch 7 · Ordered Route-Sequence Recovery[\s\S]*STRATEGIC_DEPLOYMENT_SEALED/);
assert.match(ledger, /Stretch 8 · Temporal And Delayed-Disclosure Assays[\s\S]*DEPLOYED_OBSERVATION_SEALED/);
assert.match(ledger, /Stretch 9 · Safe Harbor → Ash Custody-Root Adapter[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /later explicit operator handoff → Stretch 10 may open/);

assert.match(roadmap, /Roadmap generation: `v1\.17/);
assert.match(roadmap, /Aperture composition = 18 \/ 25/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 8 · Temporal and delayed-disclosure assays — CLOSED/);
assert.match(roadmap, /Stretch 9 · Safe Harbor → Ash custody-root adapter — CLOSED/);
assert.match(roadmap, /Independent provenance adapters — BLOCKED \/ NOT AUTHORIZED/);
assert.match(roadmap, /ordinary work-branch deployment = SUPPRESSED WHERE SUPPORTED/);

assert.match(closure, /status: CLOSED/);
assert.match(closure, /maturity: IMPLEMENTED_VALIDATION_GATED/);
assert.match(closure, /Stretch_6_authorized: false/);
assert.match(stretch6, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch7, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch8, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch9, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch9, /validated implementation commit = 05e1e3909cac255dea4f94c10b68be725578d522/);
assert.match(stretch9, /Stretch 10 authorization = false/);
assert.match(law, /branch work ≠ deployment requirement/);
assert.match(law, /Exceptions must be recorded/);

console.log('stretch1-preservation/packet-state.test.mjs passed');
