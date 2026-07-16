import {
  literalPolicySatisfied,
  propositionObligationSatisfied
} from './hush-intervention-common.js';

export function normalizePropositionFindings(values = []) {
  return values.map(item => ({
    proposition_id: String(item?.propositionId || ''),
    status: String(item?.status || '').toUpperCase(),
    observation: String(item?.observation || '')
  }));
}

export function normalizeLiteralFindings(values = []) {
  return values.map(item => ({
    literal_id: String(item?.literalId || ''),
    status: String(item?.status || '').toUpperCase(),
    observation: String(item?.observation || '')
  }));
}

export function evaluateHushFindings(ensemble, propositionFindings, literalFindings) {
  const propositions = ensemble?.propositions || [];
  const literals = ensemble?.protected_literals || [];
  const propositionDrift = propositions.filter(item => {
    const finding = propositionFindings.find(entry => entry.proposition_id === item.proposition_id);
    return !finding || !propositionObligationSatisfied(item.obligation, finding.status);
  }).map(item => item.proposition_id);
  const literalDrift = literals.filter(item => {
    const finding = literalFindings.find(entry => entry.literal_id === item.literal_id);
    return !finding || !literalPolicySatisfied(item.policy, finding.status);
  }).map(item => item.literal_id);
  return Object.freeze({ propositionDrift, literalDrift });
}
