import { comparePedagogueRouteMemory } from './flowcore-pedagogue-route-memory.js';

export const AIA_CISTERN_LAW_SCHEMA = 'td613.aia.cistern-law/v0.3';
export const AIA_CISTERN_RECEIPT_SCHEMA = 'td613.aia.cistern-receipt/v0.3';

function cleanSteps(steps, label) {
  if (!Array.isArray(steps) || !steps.length) throw new TypeError(`${label} must contain at least one route step.`);
  return steps.map((step, index) => {
    const value = String(step || '').trim();
    if (!value || value.length > 120) throw new TypeError(`${label}[${index}] must be a bounded route step.`);
    return value;
  });
}

function cleanContexts(contexts = []) {
  if (!Array.isArray(contexts)) throw new TypeError('contexts must be an array.');
  return Object.freeze(contexts.map((context, index) => {
    if (!context || typeof context !== 'object' || Array.isArray(context)) throw new TypeError(`contexts[${index}] must be an object.`);
    const source = String(context.source || '').trim();
    const digest = String(context.digest || '').trim();
    const authorityEffect = String(context.authority_effect || 'NONE').trim().toUpperCase();
    if (!source || source.length > 120) throw new TypeError(`contexts[${index}].source must be bounded.`);
    if (digest && digest.length > 160) throw new TypeError(`contexts[${index}].digest must be bounded.`);
    if (authorityEffect !== 'NONE') throw new TypeError('Observed context may not grant Cistern release authority.');
    return Object.freeze({
      source,
      digest: digest || null,
      authority_effect: 'NONE',
      route_context_only: true
    });
  }));
}

export function compareCisternRouteMemory(expectedRoute, observedRoute) {
  const expected = cleanSteps(expectedRoute, 'expectedRoute');
  const observed = cleanSteps(observedRoute, 'observedRoute');
  const comparison = comparePedagogueRouteMemory(expected, observed, {
    expectedEndpoint: 'CISTERN_GOVERNED_CONSEQUENCE',
    observedEndpoint: 'CISTERN_GOVERNED_CONSEQUENCE'
  });
  return Object.freeze({
    same_endpoint_not_same_history: true,
    same_endpoint_history_diverged: comparison.same_endpoint_not_same_history,
    expected,
    observed,
    exact_route_match: comparison.exact_route_match,
    edit_distance_steps: comparison.edit_distance_steps,
    first_divergence_index: comparison.first_divergence_index,
    deltas: comparison.deltas,
    route_holonomy_posture: comparison.exact_route_match ? 'LAWFUL_ROUTE_MEMORY' : 'NON_EQUIVALENT_ROUTE_MEMORY',
    pedagogue_route_memory_schema: comparison.schema
  });
}

export function compileCisternLawReceipt({
  boundary,
  action,
  expectedRoute,
  observedRoute,
  witness = {},
  contexts = [],
  requestDigest = null,
  sessionDigest = null,
  spentIntentDigest = null,
  durableTombstone = false,
  egressDigest = null,
  outcome = 'RELEASED'
} = {}) {
  const boundaryName = String(boundary || '').trim();
  const actionName = String(action || '').trim();
  if (!boundaryName || !actionName) throw new TypeError('Cistern receipt requires boundary and action.');
  const route = compareCisternRouteMemory(expectedRoute, observedRoute);
  const contextWitnesses = cleanContexts(contexts);
  const witnessState = {
    human_required: witness.human_required !== false,
    human_observed: witness.human_observed === true,
    separately_confirmed: witness.separately_confirmed === true,
    bounded_intent: witness.bounded_intent === true
  };
  const admitted = route.exact_route_match && (!witnessState.human_required || witnessState.human_observed) && witnessState.bounded_intent;
  const replayPosture = durableTombstone && spentIntentDigest
    ? 'DURABLE_SPENT_INTENT_TOMBSTONE_RECORDED'
    : spentIntentDigest
      ? 'SIGNED_SESSION_ROTATION_ONLY_NO_DURABLE_TOMBSTONE_CLAIM'
      : 'NO_REPLAY_CLAIM';
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
    context_witnesses: contextWitnesses,
    request_digest: requestDigest,
    session_digest: sessionDigest,
    spent_intent_digest: spentIntentDigest,
    durable_tombstone: Boolean(durableTombstone && spentIntentDigest),
    egress_digest: egressDigest,
    replay_posture: replayPosture,
    authority: {
      endpoint_equivalence_forbidden: true,
      route_equivalence_required_for_release: true,
      context_cannot_grant_release: true,
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
  route_memory: 'PEDAGOGUE_CORE_ROUTE_MEMORY; SAME_ENDPOINT_DOES_NOT_IMPLY_SAME_ROUTE_OR_SAME_AUTHORITY',
  observed_context: 'MAY_INFORM_OR_ANNOTATE; NEVER_GRANTS_RELEASE_AUTHORITY',
  replay: 'DURABLE_SPENT_INTENT_REQUIRED_FOR_NON_IDEMPOTENT_WRITES; SIGNED_SESSION_ROTATION_IS_NOT_A_TOMBSTONE',
  automatic_redesign: false,
  automatic_release: false,
  human_closure: true
});