import assert from 'node:assert/strict';
import { providerLedger } from '../scripts/run-hush-phase9-audit.mjs';

const ledger = providerLedger();

assert.equal(ledger.length, 2);
assert.ok(ledger.some((row) => row.provider_contract_adherence === 'pass'));
assert.ok(ledger.some((row) => row.provider_contract_adherence === 'repair required'));

for (const row of ledger) {
  assert.ok(row.provider_model);
  assert.ok(row.mask_label);
  assert.ok(Array.isArray(row.preserved_propositions));
  assert.ok(Array.isArray(row.dropped_propositions));
  assert.ok(Array.isArray(row.new_claims));
  assert.equal(row.claim_ceiling, 'provider-output-is-testimony-not-governance');
}

console.log('hush-phase9-provider-contract-parity: ok');
