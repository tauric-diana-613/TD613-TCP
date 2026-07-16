import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const convergence = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');
const choir = read('docs/ASH_KEEP_CHOIR_CALIBRATION_RECEIPT.md');
const hush = read('docs/ASH_KEEP_HUSH_INTERVENTION_RECEIPT.md');

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /D\. Custodian Return \/ Anisotropy \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /B\. Choir Test \/ Moiré program \| \*\*44 \/ 70\*\*/);
assert.match(ledger, /C\. Hush derivative and intervention program \| \*\*28 \/ 35\*\*/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /validation-gated workstreams = 2 \/ 9/);
assert.match(ledger, /component maturity after Stretch 4 closure = 258 \/ 375/);
assert.match(ledger, /current-head aftercare ≠ feature-specific production demonstration/);
assert.match(ledger, /Score: `48 \/ 50`|constitutional synthesis = 48 \/ 50/);
assert.match(ledger, /Stretch 4 · Hush Vocabulary Externalization And Lifecycle-Bound Intervention Ensemble[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED/);

assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — CLOSED/);
assert.match(roadmap, /Stretch 3 · Choir calibration receipt binding — CLOSED/);
assert.match(roadmap, /Hush vocabulary externalization and intervention ensemble — CLOSED/);
assert.match(roadmap, /Aperture composition renovation before Choir UI — BLOCKED \/ NOT AUTHORIZED/);
assert.match(roadmap, /Safe Harbor → Ash custody-root adapter/);
assert.match(roadmap, /transport-capable workstreams = 0/);
assert.match(convergence, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(convergence, /29458943541/);
assert.match(choir, /Choir_validation_run: 29476772041/);
assert.match(hush, /main_commit: 995990fe3eeccb4c3d17e43cb65fa3095ae81ab8/);
assert.match(hush, /Hush_validation_run: 29483240258/);
assert.match(hush, /Hush_validation_artifact: 8369330944/);
assert.match(hush, /Stretch_5_authorized: false/);

console.log('product-architecture/ledger.test.mjs passed');
