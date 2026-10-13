import assert from 'node:assert/strict';
import { compileHushInterventionReceipt } from '../../app/engine/hush-intervention.js';
import { buildHushInterventionFixture } from '../fixtures/hush-intervention-fixture.mjs';

const fixture = await buildHushInterventionFixture();

const propositionHeld = await compileHushInterventionReceipt({
  ...fixture.receiptInput,
  propositionFindings: [
    { propositionId: 'p_index_changed', status: 'OMITTED' },
    { propositionId: 'p_revision_question', status: 'QUESTION_PRESERVED' }
  ]
});
assert.equal(propositionHeld.intervention_state, 'PROPOSITION_DRIFT_HOLD');

const literalHeld = await compileHushInterventionReceipt({
  ...fixture.receiptInput,
  literalFindings: [{ literalId: 'literal_internal_alias', status: 'PRESERVED_EXACTLY' }]
});
assert.equal(literalHeld.intervention_state, 'PROTECTED_LITERAL_HOLD');

const sourceHeld = await compileHushInterventionReceipt({
  ...fixture.receiptInput,
  sourceDriftState: 'SOURCE_CHANGED'
});
assert.equal(sourceHeld.intervention_state, 'SOURCE_DRIFT_HOLD');

const readerHeld = await compileHushInterventionReceipt({
  ...fixture.receiptInput,
  trials: fixture.trials.map((trial, index) => index ? { ...trial, matchedReaderSet: false } : trial)
});
assert.equal(readerHeld.intervention_state, 'READER_SET_HOLD');

const insufficient = await compileHushInterventionReceipt({
  ...fixture.receiptInput,
  trials: [fixture.trials[0]]
});
assert.equal(insufficient.intervention_state, 'NOT_ENOUGH_TEST_DATA');

const injectionHeld = await compileHushInterventionReceipt({
  ...fixture.receiptInput,
  promptInjectionState: 'UNRESOLVED'
});
assert.equal(injectionHeld.intervention_state, 'PROMPT_INJECTION_HOLD');

const providerHeld = await compileHushInterventionReceipt({
  ...fixture.receiptInput,
  providerDraftUsed: true,
  providerLogParity: false,
  providerReceiptDigest: `sha256:${'3'.repeat(64)}`,
  providerCandidateDigest: fixture.candidateDigest
});
assert.equal(providerHeld.intervention_state, 'PROVIDER_PARITY_HOLD');

console.log('hush-intervention/semantic-holds.test.mjs passed');
