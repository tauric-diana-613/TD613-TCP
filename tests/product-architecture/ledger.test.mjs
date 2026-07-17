import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const plan = read('docs/ASH_KEEP_BUILDOUT_PLAN_STRETCH11_AND_FINAL_CLOSURE.md');
const legacy = read('docs/ASH_KEEP_BUILDOUT_PLAN_SOVEREIGN_CONTINUATION_AFTER_STRETCH_9.md');
const stretch10 = read('docs/ASH_KEEP_STRETCH10_CLOSURE_RECEIPT.md');
const stretch11 = read('docs/ASH_KEEP_STRETCH11_CLOSURE_RECEIPT.md');
const buildout = read('docs/ASH_KEEP_BUILDOUT_CLOSURE_RECEIPT.md');
const law = read('docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md');
for (const token of [
  'A. Ash Keep constitutional body | **54 / 55**','B. Choir Test / Moiré program | **70 / 70**',
  'C. Hush derivative and intervention program | **28 / 35**','D. Custodian Return / Anisotropy | **35 / 35**',
  'E. Aperture composition renovation | **18 / 25**','F. Safe Harbor custody-root adapter | **30 / 30**',
  'G. Destination-bound handoff | **45 / 45**','H. Ash product lifecycle orchestration | **35 / 35**',
  'I. Ash operator surface and local case stewardship | **43 / 45**',
  'component maturity after Stretch 11 local closure = 358 / 375','remaining component maturity = 17 / 375',
  'transport-capable workstreams = 1 / 9','active serverless functions = 11','reserved capacity = 1 empty emergency / repair / migration slot'
]) assert.ok(ledger.includes(token), `Ledger omitted ${token}`);
for (const token of [
  'Roadmap generation: `v2.0','Stretch 10 — CLOSED AND STRATEGICALLY SEALED',
  'Stretch 11 · Destination-Bound Handoff — CLOSED LOCALLY','Ash Keep Buildout Closure — NOT A STRETCH',
  'normal active maximum = 11','reserved capacity = 1','no Stretch 12'
]) assert.ok(roadmap.includes(token), `Roadmap omitted ${token}`);
for (const token of [
  'Plan generation: `v3.1','G1–G8 closure','browser `MessageChannel`','MessagePort',
  'active functions after Stretch 11 = 11','component maturity = 358 / 375','No Stretch 12 follows'
]) assert.ok(plan.includes(token), `Plan omitted ${token}`);
assert.match(legacy, /active sovereign handoff/);
assert.match(legacy, /ASH_KEEP_BUILDOUT_PLAN_STRETCH11_AND_FINAL_CLOSURE\.md/);
assert.match(stretch10, /State: `CLOSED \/ IMPLEMENTED_VALIDATION_GATED \/ EVIDENCE_BOUNDED`/);
assert.match(stretch11, /PENDING_EXACT_MAIN_EXTERNAL_SEAL/);
assert.match(buildout, /EFFECTIVE_AFTER_OFFICIAL_STRETCH_11_EXTERNAL_SEAL/);
assert.match(law, /Vercel deployment remains authorized/);
assert.match(law, /operator release gesture ≠ automatic Git event/);
console.log('product-architecture/ledger.test.mjs passed');
