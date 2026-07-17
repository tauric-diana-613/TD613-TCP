import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const continuation = read('docs/ASH_KEEP_BUILDOUT_PLAN_SOVEREIGN_CONTINUATION_AFTER_STRETCH_9.md');
const composition = read('docs/APERTURE_COMPOSITION_RENOVATION.md');
const closure = read('docs/APERTURE_COMPOSITION_CLOSURE_RECEIPT.md');
const stretch6 = read('docs/ASH_KEEP_STRETCH6_CLOSURE_RECEIPT.md');
const stretch7 = read('docs/ASH_KEEP_STRETCH7_CLOSURE_RECEIPT.md');
const stretch8 = read('docs/ASH_KEEP_STRETCH8_CLOSURE_RECEIPT.md');
const stretch9 = read('docs/ASH_KEEP_STRETCH9_CLOSURE_RECEIPT.md');
const stretch10 = read('docs/ASH_KEEP_STRETCH10_CLOSURE_RECEIPT.md');
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
  'F. Safe Harbor custody-root adapter | **30 / 30**',
  'G. Destination-bound handoff | **25 / 45**',
  'component maturity after Stretch 10 closure = 338 / 375',
  'remaining component maturity = 37 / 375',
  'validation-gated workstreams = 5 / 9',
  'constitutional synthesis = 49 / 50',
  'CLOSED / IMPLEMENTED_VALIDATION_GATED / EVIDENCE_BOUNDED',
  'absolute Vercel ceiling = 12 deployed serverless functions',
  'normal operating maximum = 11 active serverless functions',
  'reserved capacity = 1 empty emergency / repair / migration slot',
  'count above 11 → stop and consolidate before merge or deployment'
]) assert.ok(ledger.includes(token), `Ledger omitted ${token}`);

for (const token of [
  'Roadmap generation: `v1.18',
  'Stretch 9 · Safe Harbor → Ash custody-root adapter — CLOSED',
  'Stretch 10 · Independent provenance adapters — CLOSED',
  'Destination-bound handoff last — BLOCKED PENDING STRETCH 10 SEAL',
  'normal ceiling = ONE DEPLOYMENT PER COMPLETED PACKET OR RELEASE CANDIDATE',
  'absolute platform ceiling = 12 deployed serverless functions',
  'normal operating maximum = 11 active serverless functions',
  'BLOCKED_PENDING_CONSOLIDATION',
  'Stretch 11 implementation requires a later explicit operator handoff gesture'
]) assert.ok(roadmap.includes(token), `Roadmap omitted ${token}`);

for (const token of [
  'Plan generation: `v2.4',
  'Current state: `STRETCH_10_CLOSED / EXACT_GREEN_MERGE_AND_STRATEGIC_SEAL_PENDING / STRETCH_11_NOT_AUTHORIZED`',
  'docs/ASH_KEEP_BUILDOUT_LEDGER.md',
  'ROADMAP.md',
  'docs/ASH_KEEP_BUILDOUT_PLAN_SOVEREIGN_CONTINUATION_AFTER_STRETCH_9.md',
  'component maturity after Stretch 10 closure = 338 / 375',
  'Ash Independent Provenance Validation = SUCCESS / run 29546756631',
  'active serverless functions = 11',
  'reserved function capacity = 1',
  'Stretch 11 implementation authority = false',
  'current stop point = AFTER STRETCH 10 SUCCESSFUL STRATEGIC SEAL'
]) assert.ok(continuation.includes(token), `Continuation plan omitted ${token}`);

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
assert.match(stretch9, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch10, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch10, /validated implementation commit = 33c8f881095aa3c601e35d4c45793f072695dfbb/);
assert.match(stretch10, /Ash Independent Provenance Validation = SUCCESS \/ run 29546756631/);
assert.match(stretch10, /component maturity after closure = 338 \/ 375/);
assert.match(stretch10, /active serverless functions = 11/);
assert.match(stretch10, /reserved function capacity = 1/);
assert.match(stretch10, /Stretch 11 authorization = false/);
assert.match(law, /Vercel deployment remains authorized/);
assert.match(law, /operator release gesture ≠ automatic Git event/);

console.log('product-architecture/ledger.test.mjs passed');
