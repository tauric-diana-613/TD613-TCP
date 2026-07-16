import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const convergenceReceipt = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');
const choirReceipt = read('docs/ASH_KEEP_CHOIR_CALIBRATION_RECEIPT.md');

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /D\. Custodian Return \/ Anisotropy \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /B\. Choir Test \/ Moiré program \| \*\*44 \/ 70\*\*/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /component maturity after Stretch 3 closure = 237 \/ 375/);
assert.match(ledger, /current-head aftercare ≠ feature-specific production demonstration/);
assert.match(ledger, /# Constitutional Synthesis Matrix/);
assert.match(ledger, /Score: `47 \/ 50`|constitutional synthesis = 47 \/ 50/);
assert.match(ledger, /Stretch 1 · Ash Constitutional Convergence Closure[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 2 · Custodian Return And Anisotropy[\s\S]*CLOSED \/ IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.match(ledger, /Stretch 3 · Choir Calibration Receipt Binding[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED/);

assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — CLOSED/);
assert.match(roadmap, /Stretch 3 · Choir calibration receipt binding — CLOSED/);
assert.match(roadmap, /Hush vocabulary externalization and intervention ensemble — BLOCKED/);
assert.ok(
  roadmap.indexOf('Stretch 2 · Custodian Return And Anisotropy — CLOSED')
    < roadmap.indexOf('Stretch 3 · Choir calibration receipt binding — CLOSED')
  && roadmap.indexOf('Stretch 3 · Choir calibration receipt binding — CLOSED')
    < roadmap.indexOf('Hush vocabulary externalization and intervention ensemble — BLOCKED'),
  'Closed Return and Choir must remain before blocked Hush.'
);
assert.match(roadmap, /Safe Harbor → Ash custody-root adapter/);
assert.match(roadmap, /transport-capable workstreams = 0/);
assert.match(convergenceReceipt, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(convergenceReceipt, /Observer promotion authorized: `false`/);
assert.match(convergenceReceipt, /29458943541/);
assert.match(choirReceipt, /main_commit: bd118da4862bdd0334111d3ba9ed8878daf2976c/);
assert.match(choirReceipt, /Choir_validation_run: 29476772041/);
assert.match(choirReceipt, /Choir_validation_artifact: 8366852051/);
assert.match(choirReceipt, /Stretch_4_authorized: false/);
