import { HUSH_INTERVENTION_STATES, SHA256 } from './hush-intervention-common.js';

function hold(holds, state, next, reason) {
  if (!holds.length) state.value = next;
  holds.push(reason);
}

export function deriveHushInterventionState(input = {}) {
  const state = { value: 'INTERVENTION_ELIGIBLE' };
  const holds = [];
  if (!input.ensembleVerified) hold(holds, state, 'TAMPER_HOLD', 'intervention-ensemble-digest-verification-failed');
  if (!input.authorityVerified || !input.authorityAuthorized || !input.authorityReferenceMatches) {
    hold(holds, state, 'STALE_AUTHORITY_HOLD', 'current-authority-context-mismatch');
  }
  if (!input.rebuildBound || !input.rebuildDigestMatches) {
    hold(holds, state, 'STALE_REBUILD_HOLD', 'current-rebuild-receipt-mismatch');
  }
  if (input.propositionDrift?.length) {
    hold(holds, state, 'PROPOSITION_DRIFT_HOLD', `proposition-obligations-held:${input.propositionDrift.join(',')}`);
  }
  if (input.literalDrift?.length) {
    hold(holds, state, 'PROTECTED_LITERAL_HOLD', `protected-literal-policies-held:${input.literalDrift.join(',')}`);
  }
  if (input.sourceDriftState !== 'SOURCE_HELD') {
    hold(holds, state, 'SOURCE_DRIFT_HOLD', 'source-drift-unresolved');
  }
  if (input.readerSetHeld) {
    hold(holds, state, 'READER_SET_HOLD', 'matched-reader-set-or-digest-parity-failed');
  }
  if (!input.enoughData) {
    hold(holds, state, 'NOT_ENOUGH_TEST_DATA', 'repeated-trial-control-held-out-or-history-requirement-unmet');
  }
  if (!['CLEAR', 'QUARANTINED'].includes(input.promptInjectionState)) {
    hold(holds, state, 'PROMPT_INJECTION_HOLD', 'prompt-injection-review-unresolved');
  }
  const providerParity = !input.providerDraftUsed || Boolean(
    input.providerLogParity
    && SHA256.test(String(input.providerReceiptDigest || ''))
    && input.providerCandidateDigest === input.candidateDigest
  );
  if (!providerParity) hold(holds, state, 'PROVIDER_PARITY_HOLD', 'provider-log-parity-failed');
  if (!HUSH_INTERVENTION_STATES.includes(state.value)) {
    throw new Error(`Unsupported Hush intervention state: ${state.value}`);
  }
  return Object.freeze({ state: state.value, holds, providerParity });
}
