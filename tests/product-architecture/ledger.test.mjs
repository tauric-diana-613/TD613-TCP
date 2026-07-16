import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const composition = read('docs/APERTURE_COMPOSITION_RENOVATION.md');
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const stretch6 = read('docs/ASH_KEEP_STRETCH6_CLOSURE_RECEIPT.md');
const stretch7 = read('docs/ASH_KEEP_STRETCH7_CLOSURE_RECEIPT.md');
const stretch8 = read('docs/ASH_KEEP_STRETCH8_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');
const convergence = read('docs/ASH_CONSTITUTIONAL_CONVERGENCE_RECEIPT.md');
const choir = read('docs/ASH_KEEP_CHOIR_CALIBRATION_RECEIPT.md');
const hush = read('docs/ASH_KEEP_HUSH_INTERVENTION_RECEIPT.md');

for (const token of [
  'A. Ash Keep constitutional body | **54 / 55**',
  'B. Choir Test / Moiré program | **70 / 70**',
  'C. Hush derivative and intervention program | **28 / 35**',
  'D. Custodian Return / Anisotropy | **35 / 35**',
  'E. Aperture composition renovation | **18 / 25**',
  'component maturity after Stretch 8 closure = 296 / 375',
  'remaining component maturity = 79 / 375',
  'constitutional synthesis = 49 / 50',
  'CLOSED / IMPLEMENTED_VALIDATION_GATED / EVIDENCE_BOUNDED',
  'ALLOWED / STRATEGIC / COST-GOVERNED / EVIDENCE-BOUNDED',
  'Ordinary non-production branches should not trigger Vercel',
  'absolute Vercel ceiling = 12 deployed serverless functions',
  'normal operating maximum = 11 active serverless functions',
  'reserved capacity = 1 empty emergency / repair / migration slot',
  'count above 11 → stop and consolidate before merge or deployment'
]) assert.ok(ledger.includes(token), `Ledger omitted ${token}`);

for (const token of [
  'Roadmap generation: `v1.16',
  'Stretch 6 · Higher-order interference — CLOSED',
  'Stretch 7 · Ordered route-sequence recovery — CLOSED',
  'Stretch 8 · Temporal and delayed-disclosure assays — CLOSED',
  'Safe Harbor → Ash custody-root adapter — CONDITIONALLY AUTHORIZED AFTER SUCCESSFUL STRETCH 8 SEAL',
  'normal ceiling = ONE DEPLOYMENT PER COMPLETED PACKET OR RELEASE CANDIDATE',
  'absolute platform ceiling = 12 deployed serverless functions',
  'normal operating maximum = 11 active serverless functions',
  'BLOCKED_PENDING_CONSOLIDATION',
  'Stretch 9 must stop after closure and successful Vercel seal'
]) assert.ok(roadmap.includes(token), `Roadmap omitted ${token}`);

assert.match(convergence, /Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`/);
assert.match(choir, /Choir_validation_run: 29476772041/);
assert.match(hush, /Hush_validation_run: 29483240258/);
assert.match(composition, /CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED/);
assert.match(composition, /Stretch_6_authorized: false/);
assert.match(closure, /closure_observed_main_commit: e1fe108264045c4d75f0ef275b15654cf61b52a5/);
assert.match(closure, /deployment_earns_maturity: false/);
assert.match(stretch6, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch7, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch8, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch8, /Choir validation run = 29535788474/);
assert.match(stretch8, /Choir validation artifact = 8390440982/);
assert.match(stretch8, /component maturity after closure = 296 \/ 375/);
assert.match(stretch8, /active serverless functions = 11/);
assert.match(stretch8, /reserved function capacity = 1/);
assert.match(stretch8, /Stretch 9 authorization = CONDITIONAL_ON_SUCCESSFUL_STRETCH_8_VERCEL_SEAL/);
assert.match(stretch8, /Stretch 10 authorization = false/);
assert.match(law, /Vercel deployment remains authorized/);
assert.match(law, /operator release gesture ≠ automatic Git event/);

console.log('product-architecture/ledger.test.mjs passed');
