import assert from 'node:assert/strict';
import fs from 'node:fs';

const receipt = fs.readFileSync(new URL('../../docs/ASH_KEEP_HUSH_INTERVENTION_RECEIPT.md', import.meta.url), 'utf8');
for (const token of [
  'STRETCH_4_VALIDATION_CLOSURE / EVIDENCE_BOUNDED',
  'CLOSED',
  'maturity: IMPLEMENTED_VALIDATION_GATED',
  'main_commit: 995990fe3eeccb4c3d17e43cb65fa3095ae81ab8',
  'Hush_validation_run: 29483240258',
  'Hush_validation_artifact: 8369330944',
  'sha256:3cb26d0672da3905cd7afa67ae9e8dae9f21034183ba78e82fd7b5a4ef855b0a',
  'Lifecycle_and_convergence_run: 29483256362',
  'Lifecycle_and_convergence_artifact: 8369369722',
  'candidate_status: UNKEPT_CANDIDATE',
  'provider_call_performed_by_receipt_compiler = false',
  'Stretch_5_authorized: false'
]) assert.ok(receipt.includes(token), `Stretch 4 receipt omitted ${token}`);
assert.match(receipt, /Stretch 4 earns closure at `28 \/ 35/);
assert.match(receipt, /Aggregate component maturity remains `258 \/ 375`/);
assert.match(receipt, /Constitutional synthesis remains `48 \/ 50`/);

console.log('hush-intervention/closure.test.mjs passed');
