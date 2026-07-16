import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const convergenceReceipt = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');
const choirReceipt = read('docs/ASH_KEEP_CHOIR_CALIBRATION_RECEIPT.md');
const hush = read('docs/ASH_KEEP_HUSH_INTERVENTION.md');

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /D\. Custodian Return \/ Anisotropy \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /B\. Choir Test \/ Moiré program \| \*\*44 \/ 70\*\*/);
assert.match(ledger, /C\. Hush derivative and intervention program \| \*\*28 \/ 35\*\*/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /validation-gated workstreams = 2 \/ 9/);
assert.match(ledger, /component maturity after Stretch 4 implementation = 258 \/ 375/);
assert.match(ledger, /current-head aftercare ≠ feature-specific production demonstration/);
assert.match(ledger, /Score: `48 \/ 50`|constitutional synthesis = 48 \/ 50/);
assert.match(ledger, /Stretch 4 · Hush Vocabulary Externalization And Lifecycle-Bound Intervention Ensemble[\s\S]*OPEN \/ IMPLEMENTED_VALIDATION_GATED/);

assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — CLOSED/);
assert.match(roadmap, /Stretch 3 · Choir calibration receipt binding — CLOSED/);
assert.match(roadmap, /Hush vocabulary externalization and intervention ensemble — OPEN \/ VALIDATION-GATED/);
assert.match(roadmap, /Aperture composition renovation before Choir UI — BLOCKED/);
assert.match(roadmap, /Safe Harbor → Ash custody-root adapter/);
assert.match(roadmap, /transport-capable workstreams = 0/);
assert.match(convergenceReceipt, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(convergenceReceipt, /29458943541/);
assert.match(choirReceipt, /Choir_validation_run: 29476772041/);
assert.match(hush, /run: 29481625828/);
assert.match(hush, /candidate_status: UNKEPT_CANDIDATE/);
assert.match(hush, /Stretch_5_authorized: false/);

console.log('product-architecture/ledger.test.mjs passed');
