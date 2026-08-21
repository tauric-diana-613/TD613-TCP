import { compilePedagogueResearchAssayWitness } from '../../../engine/flowcore-pedagogue-core.js';

export const GIVING_PRACTICE_INDEPENDENT_ORDER_SCHEMA = 'td613.pedagogue.giving-practice-independent-order/v0.1';
export const GIVING_PRACTICE_ORDER_OPERATIONS = Object.freeze([
  'PREPARE_CONTRIBUTOR',
  'SUBMIT_SEARCH_GESTURE'
]);
export const GIVING_PRACTICE_ORDER_CONTEXT_FAMILY = 'GIVING_PRACTICE';

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

function sourceChecks(contributorHandoffSource, directorySource) {
  return freeze({
    contributor_handoff_prepare_exists: /function prepareContributorSearch\(/.test(contributorHandoffSource),
    prepare_renders_unsearched: /renderPreparedRoute\(\{ contributor, from, through, originLabel, searched: false \}\)/.test(contributorHandoffSource),
    prepared_handoff_declares_no_retrieval: /retrieval_started: false/.test(contributorHandoffSource),
    submit_requires_visible_prepared_ribbon: /#searchForm[\s\S]*?addEventListener\('submit'[\s\S]*?if \(!ribbon \|\| ribbon\.hidden\) return;[\s\S]*?searched: true/.test(contributorHandoffSource),
    directory_uses_prepare_handoff: /prepareContributorSearch\(name,/.test(directorySource),
    directory_discovery_declares_no_retrieval: /retrieval_started: false/.test(directorySource)
  });
}

export function verifyGivingPracticeOrderSourceContract({ contributorHandoffSource, directorySource } = {}) {
  if (typeof contributorHandoffSource !== 'string' || typeof directorySource !== 'string') {
    throw new Error('Giving independent-order source verification requires both declared source files as strings.');
  }
  const checks = sourceChecks(contributorHandoffSource, directorySource);
  return freeze({
    checks,
    verified: Object.values(checks).every(Boolean),
    production_behavior_mutated: false,
    browser_runtime_executed: false,
    real_retrieval_executed: false
  });
}

function initialState() {
  return {
    prepared: false,
    search_started_on_prepared_route: false,
    coarse_endpoint: 'NONE'
  };
}

function applyPositive(state, operation) {
  if (operation === 'PREPARE_CONTRIBUTOR') {
    return {
      prepared: true,
      search_started_on_prepared_route: false,
      coarse_endpoint: 'INDIVIDUAL_CONTRIBUTOR_PREPARED'
    };
  }
  if (operation === 'SUBMIT_SEARCH_GESTURE') {
    return state.prepared
      ? { ...state, search_started_on_prepared_route: true }
      : { ...state };
  }
  throw new Error(`Unsupported Giving practice order operation: ${operation}`);
}

function applyNull(state, operation) {
  if (operation === 'PREPARE_CONTRIBUTOR') {
    return {
      ...state,
      prepared: true,
      coarse_endpoint: 'INDIVIDUAL_CONTRIBUTOR_PREPARED'
    };
  }
  if (operation === 'SUBMIT_SEARCH_GESTURE') {
    return { ...state, search_started_on_prepared_route: true };
  }
  throw new Error(`Unsupported Giving practice null operation: ${operation}`);
}

function runRoute(order, reducer) {
  return freeze(order.reduce((state, operation) => reducer(state, operation), initialState()));
}

function witnessKey(state) {
  return `${Number(state.prepared)}:${Number(state.search_started_on_prepared_route)}:${state.coarse_endpoint}`;
}

export function runGivingPracticeIndependentOrderAssay(sourceVerification) {
  if (!sourceVerification || sourceVerification.verified !== true) {
    throw new Error('Giving independent-order assay requires a verified existing source contract.');
  }
  const routes = freeze([
    freeze(['PREPARE_CONTRIBUTOR', 'SUBMIT_SEARCH_GESTURE']),
    freeze(['SUBMIT_SEARCH_GESTURE', 'PREPARE_CONTRIBUTOR'])
  ]);
  const positiveStates = freeze(routes.map(route => runRoute(route, applyPositive)));
  const nullStates = freeze(routes.map(route => runRoute(route, applyNull)));
  const positiveUnique = new Set(positiveStates.map(witnessKey)).size;
  const nullUnique = new Set(nullStates.map(witnessKey)).size;
  const sameOperationMultiset = routes.every(route => (
    JSON.stringify([...route].sort()) === JSON.stringify([...routes[0]].sort())
  ));
  const sameCoarseEndpoint = positiveStates.every(state => (
    state.coarse_endpoint === 'INDIVIDUAL_CONTRIBUTOR_PREPARED'
  ));
  const mechanismValidated = (
    positiveUnique === 2
    && nullUnique === 1
    && sameOperationMultiset
    && sameCoarseEndpoint
    && sourceVerification.verified === true
    && sourceVerification.real_retrieval_executed === false
    && sourceVerification.production_behavior_mutated === false
  );

  return freeze({
    schema: GIVING_PRACTICE_INDEPENDENT_ORDER_SCHEMA,
    source_status: 'SOURCE_CONTRACT_DERIVED_SIMULATION',
    authority_class: 'A2_DERIVATIONAL',
    context_family: GIVING_PRACTICE_ORDER_CONTEXT_FAMILY,
    source_contract_verified: sourceVerification.verified,
    source_contract_checks: sourceVerification.checks,
    latent_route_count: routes.length,
    operation_multiset: freeze([...GIVING_PRACTICE_ORDER_OPERATIONS].sort()),
    positive_terminal_states: positiveStates,
    positive_unique_terminal_witness_count: positiveUnique,
    null_terminal_states: nullStates,
    null_unique_terminal_witness_count: nullUnique,
    same_operation_multiset: sameOperationMultiset,
    same_coarse_endpoint: sameCoarseEndpoint,
    coarse_endpoint: 'INDIVIDUAL_CONTRIBUTOR_PREPARED',
    observation_field: 'search_started_on_prepared_route',
    real_retrieval_executed: false,
    giving_runtime_executed: false,
    giving_runtime_mutated: false,
    production_mutated: false,
    browser_evidence_claim: false,
    promotion_authority: false,
    external_transmission: false,
    human_closure_required: true,
    findings: freeze({
      positive_order_distinguishable: positiveUnique === 2,
      matched_null_erases_order: nullUnique === 1,
      source_contract_verified: sourceVerification.verified,
      assay_mechanism_validated: mechanismValidated
    }),
    hypothesis_status: freeze({
      H_GIVING_PRACTICE_ORDER_CONTEXT: mechanismValidated
        ? 'SUPPORTED_IN_BOUNDED_SOURCE_CONTRACT_DERIVED_FIXTURE'
        : 'FALSIFIED_IN_BOUNDED_SOURCE_CONTRACT_DERIVED_FIXTURE'
    }),
    research_transfer_relation: 'ORDER_IS_PART_OF_PROCESS_STATE',
    claim_ceiling: 'BOUNDED_GIVING_PRACTICE_SOURCE_CONTRACT_DERIVED_ORDER_ASSAY_ONLY; establishes neither universal order sensitivity nor live browser/retrieval behavior beyond the verified source contract. No connection, curvature, holonomy, quantum, physical, product-mutation, or production authority follows.'
  });
}

export function compileGivingPracticeOrderPedagogueWitness(assay) {
  if (!assay || assay.schema !== GIVING_PRACTICE_INDEPENDENT_ORDER_SCHEMA) {
    throw new Error('Giving Pedagogue order witness requires the governed independent-order assay.');
  }
  if (assay.promotion_authority !== false || assay.production_mutated !== false || assay.giving_runtime_mutated !== false) {
    throw new Error('Giving Pedagogue order witness requires closed promotion, production, and Giving-runtime authority.');
  }
  const supported = assay.findings?.assay_mechanism_validated === true;
  return compilePedagogueResearchAssayWitness({
    witness_id: 'giving-practice.prepared-handoff-order/v0.1',
    mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
    context_family: GIVING_PRACTICE_ORDER_CONTEXT_FAMILY,
    assay_reference: 'Giving fictional practice prepared-contributor handoff order assay',
    assay_schema: assay.schema,
    assay_source_status: assay.source_status,
    outcome: supported ? 'SUPPORTED_BOUNDED' : 'COUNTEREXAMPLED_BOUNDED',
    declared_controls: [
      'existing Giving source contract verified before simulation',
      'same PREPARE/SUBMIT operation multiset',
      'same coarse Individual Contributor prepared endpoint',
      'matched state-precondition-erasing null',
      'no Giving browser runtime executed',
      'no retrieval executed or production behavior mutated'
    ],
    observations: [
      `positive unique terminal witness count = ${assay.positive_unique_terminal_witness_count}`,
      `null unique terminal witness count = ${assay.null_unique_terminal_witness_count}`,
      `same coarse endpoint = ${assay.same_coarse_endpoint}`,
      `source contract verified = ${assay.source_contract_verified}`
    ],
    falsifier_outcome: supported
      ? 'The source-derived positive routes remained distinguishable while the matched order-erasing null collapsed them, with identical operation multiset and coarse endpoint.'
      : 'The source contract drifted or the positive/null distinction failed, so no independent Giving context witness is admitted.',
    alternative_explanations_remaining: [
      'The result depends on the current prepared-handoff source contract and may disappear if that contract is redesigned.',
      'The coarse endpoint intentionally ignores retrieval outcome and therefore does not establish equivalence of all downstream Giving state.',
      'A two-operation state machine is a minimal context and does not establish temporal identifiability for larger Giving workflows.'
    ],
    claim_ceiling: assay.claim_ceiling
  });
}
