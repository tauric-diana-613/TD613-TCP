export const AIA_CISTERN_LAW_SCHEMA = 'td613.aia.cistern-law/v0.1';
export const AIA_CISTERN_RECEIPT_SCHEMA = 'td613.aia.cistern-receipt/v0.1';

function cleanSteps(steps, label) {
  if (!Array.isArray(steps) || !steps.length) throw new TypeError(`${label} must contain at least one route step.`);
  return steps.map((step, index) => {
    const value = String(step || '').trim();
    if (!value || value.length > 120) throw new TypeError(`${label}[${index}] must be a bounded route step.`);
    return value;
  });
}

export function compareCisternRouteMemory(expectedRoute, observedRoute) {
  const expected = cleanSteps(expectedRoute, 'expectedRoute');
  const observed = cleanSteps(observedRoute, 'observedRoute');
  const max = Math.max(expected.length, observed.length);
  const deltas = [];
  for (let index = 0; index < max; index += 1) {
    if (expected[index] !== observed[index]) {
      deltas.push({ index, expected: expected[index] || null, observed: observed[index] || null });
    }
  }
  return Object.freeze({
    same_endpoint_not_same_history: true,
    expected,
    observed,
    exact_route_match: deltas.length === 0,
    deltas,
    route_holonomy_posture: deltas.length === 0 ? 'LAWFUL_ROUTE_MEMORY' : 'NON_EQUIVALENT_ROUTE_MEMORY'
  });
}

export function compileCisternLawReceipt({
  boundary,
  action,
  expectedRoute,
  observedRoute,
  witness = {},
  requestDigest = null,
  sessionDigest = null,
  spentIntentDigest = null,
  egressDigest = null,
  outcome = 'RELEASED'
} = {}) {
  const boundaryName = String(boundary || '').trim();
  const actionName = String(action || '').trim();
  if (!boundaryName || !actionName) throw new TypeError('Cistern receipt requires boundary and action.');
  const route = compareCisternRouteMemory(expectedRoute, observedRoute);
  const witnessState = {
    human_required: witness.human_required !== false,
    human_observed: witness.human_observed === true,
    separately_confirmed: witness.separately_confirmed === true,
    bounded_intent: witness.bounded_intent === true
  };
  const admitted = route.exact_route_match && (!witnessState.human_required || witnessState.human_observed) && witnessState.bounded_intent;
  return Object.freeze({
    schema: AIA_CISTERN_RECEIPT_SCHEMA,
    law: AIA_CISTERN_LAW_SCHEMA,
    boundary: boundaryName,
    action: actionName,
    outcome: admitted && outcome === 'RELEASED' ? 'RELEASED' : 'WITHHELD',
    internal_legibility: 'NOW_WHY_EXACT',
    external_observability: 'MINIMUM_DISCLOSURE_REFUSAL',
    fabricated_decoys: false,
    route,
    witness: witnessState,
    request_digest: requestDigest,
    session_digest: sessionDigest,
    spent_intent_digest: spentIntentDigest,
    egress_digest: egressDigest,
    replay_posture: spentIntentDigest
      ? 'PRIOR_INTENT_RETIRED_BY_SIGNED_SESSION_ROTATION_NO_DURABLE_TOMBSTONE_CLAIM'
      : 'NO_REPLAY_CLAIM',
    authority: {
      endpoint_equivalence_forbidden: true,
      route_equivalence_required_for_release: true,
      automatic_release_forbidden: true,
      human_closure_required: witnessState.human_required
    }
  });
}

export function assertCisternRelease(receipt) {
  if (!receipt || receipt.schema !== AIA_CISTERN_RECEIPT_SCHEMA || receipt.outcome !== 'RELEASED') {
    const error = new Error('Cistern Law withheld the consequential route.');
    error.code = 'CISTERN_ROUTE_WITHHELD';
    error.receipt = receipt || null;
    throw error;
  }
  return receipt;
}

export const AIA_CISTERN_LAW = Object.freeze({
  schema: AIA_CISTERN_LAW_SCHEMA,
  status: 'EXPERIMENTAL',
  structure: 'AIA_DERIVED_DLP_OPSEC_INFOSEC_BOUNDARY',
  law: 'Consequential information crosses a governed boundary only through an inspectable, qualified, witnessed, bounded, receipted route; endpoint sameness never substitutes for route authority.',
  internal_legibility: 'CHILD_LEGIBLE_NOW_WHY_EXACT',
  unauthorized_posture: 'LOW_INFORMATION_NON_AUTHORITATIVE_REFUSAL',
  fabricated_decoys: false,
  route_memory: 'SAME_ENDPOINT_DOES_NOT_IMPLY_SAME_ROUTE_OR_SAME_AUTHORITY',
  replay: 'SIGNED_SESSION_INTENT_ROTATION_WHERE_IMPLEMENTED_DURABLE_TOMBSTONE_NOT_CLAIMED',
  automatic_redesign: false,
  automatic_release: false,
  human_closure: true
});
