import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const convergence = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');
const choir = read('docs/ASH_KEEP_CHOIR_CALIBRATION_RECEIPT.md');
const hush = read('docs/ASH_KEEP_HUSH_INTERVENTION_RECEIPT.md');
const composition = read('docs/APERTURE_COMPOSITION_RENOVATION.md');
const compositionReceipt = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const deploymentLaw = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /I\. Ash operator surface and local case stewardship \| \*\*43 \/ 45\*\*/);
assert.match(ledger, /D\. Custodian Return \/ Anisotropy \| \*\*35 \/ 35\*\*/);
assert.match(ledger, /B\. Choir Test \/ Moiré program \| \*\*44 \/ 70\*\*/);
assert.match(ledger, /C\. Hush derivative and intervention program \| \*\*28 \/ 35\*\*/);
assert.match(ledger, /E\. Aperture composition renovation \| \*\*18 \/ 25\*\*/);
assert.match(ledger, /production-demonstrated workstreams = 4 \/ 9/);
assert.match(ledger, /validation-gated workstreams = 3 \/ 9/);
assert.match(ledger, /component maturity after Stretch 5 closure = 270 \/ 375/);
assert.match(ledger, /Score: `49 \/ 50`|constitutional synthesis = 49 \/ 50/);
assert.match(ledger, /Stretch 5 · Aperture Composition Renovation Before Choir UI[\s\S]*CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(ledger, /normal ceiling: one deliberate Vercel deployment per completed packet or release candidate/);

assert.match(roadmap, /Stretch 1 · Ash Constitutional Convergence Closure — CLOSED/);
assert.match(roadmap, /Stretch 2 · Custodian Return And Anisotropy — CLOSED/);
assert.match(roadmap, /Stretch 3 · Choir calibration receipt binding — CLOSED/);
assert.match(roadmap, /Stretch 4 · Hush vocabulary externalization and intervention ensemble — CLOSED/);
assert.match(roadmap, /Stretch 5 · Aperture composition renovation before Choir UI — CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(roadmap, /Higher-order interference — BLOCKED \/ NOT AUTHORIZED/);
assert.match(roadmap, /explicit operator release gesture → Vercel deployment authorized/);
assert.match(roadmap, /transport-capable workstreams = 0/);

assert.match(convergence, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(convergence, /29458943541/);
assert.match(choir, /Choir_validation_run: 29476772041/);
assert.match(hush, /Hush_validation_run: 29483240258/);
assert.match(composition, /CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(composition, /canonical_body_decomposed: false/);
assert.match(compositionReceipt, /Aperture_composition_run: 29512911459/);
assert.match(compositionReceipt, /normal_deployment_ceiling_per_completed_packet: 1/);
assert.match(compositionReceipt, /Stretch_6_authorized: false/);
assert.match(deploymentLaw, /Vercel deployment remains authorized/);
assert.match(deploymentLaw, /operator release gesture ≠ automatic Git event/);

console.log('product-architecture/ledger.test.mjs passed');
