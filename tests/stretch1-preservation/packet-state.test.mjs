import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');

assert.match(ledger, /Ledger generation: `v1\.12 · Stretch 5 evidence closure \/ strategic deployment law`/);
assert.match(ledger, /component maturity after Stretch 5 closure = 270 \/ 375/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /validation-gated workstreams = 3 \/ 9/);
assert.match(ledger, /transport-capable workstreams = 0/);
assert.match(ledger, /current-head aftercare commit:[\s\S]*2c89b70e284562ebb6b842900ae1a1bd0b00f6e6/);
assert.match(ledger, /Stretch 5 · Aperture Composition Renovation Before Choir UI[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /Stretch 6 requires a fresh operator opening gesture/);

assert.match(roadmap, /Roadmap generation: `v1\.12/);
assert.match(roadmap, /Aperture composition = 18 \/ 25/);
assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 5 · Aperture composition renovation before Choir UI — CLOSED/);
assert.match(roadmap, /Higher-order interference — BLOCKED \/ NOT AUTHORIZED/);
assert.match(roadmap, /ordinary work-branch deployment = SUPPRESSED WHERE SUPPORTED/);

assert.match(closure, /status: CLOSED/);
assert.match(closure, /maturity: IMPLEMENTED_VALIDATION_GATED/);
assert.match(closure, /Stretch_6_authorized: false/);
assert.match(law, /branch work ≠ deployment requirement/);
assert.match(law, /Exceptions must be recorded/);

console.log('stretch1-preservation/packet-state.test.mjs passed');
