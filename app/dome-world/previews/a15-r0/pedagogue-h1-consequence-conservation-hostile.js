import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import {
  analyticDecisionBoundaryS,
  runAperturePedagogueDecisionLossReplayMapGauntlet
} from './aperture-pedagogue-decision-loss-replay-map.js';
import { selectByDeclaredConsequence } from './aperture-pedagogue-consequence-conditioned-selection.js';
import { selectCorrelatedNoiseWidening } from './aperture-pedagogue-correlated-noise-geometry.js';
import {
  buildMossLanternTemporalRoutes,
  forwardMossLanternTemporalWitness,
  MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS
} from './moss-lantern-temporal-order-assay.js';

export const PEDAGOGUE_H1_CONSEQUENCE_CONSERVATION_HOSTILE_SCHEMA =
  'td613.pedagogue.h1-consequence-conservation-hostile-execution/v0.1';

const DECISION_RHO = 0.546918160706758;
const DECISION_BOUNDARY_S = 0.528595479176951;
const MEASUREMENT_BOUNDARY_RHO = 0.527511006183077;
const EPS = 0.0001;
const TIE_TOLERANCE = 1e-10;

function lossCardForS(s, { cardId = `H1_S_${s}`, aggregationRule = 'WEIGHTED_SUM', posthoc = false } = {}) {
  if (!Number.isFinite(s) || s < 0 || s > 1) throw new TypeError('s must be finite in [0,1].');
  const flank = (1 - s) / 2;
  return freeze({
    card_id: cardId,
    kind: 'WEIGHTED_FUNCTIONALS',
    weights: freeze({ H_Y: flank, H_DIFF: flank, H_SUM: s }),
    declaration_status: 'PREDECLARED_SYNTHETIC',
    aggregation_rule: aggregationRule,
    posthoc
  });
}

function safeConsequenceSelection({ rho, lossCard = null, unaggregatedFunctionals = null } = {}) {
  if (lossCard?.kind === 'WEIGHTED_FUNCTIONALS' && lossCard.aggregation_rule !== 'WEIGHTED_SUM') {
    return freeze({
      status: 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE',
      selected_probe_id: null,
      aggregation_rule: lossCard.aggregation_rule ?? null,
      candidate_set: freeze([]),
      confirmatory: false,
      automatic_execution: false
    });
  }
  if (lossCard?.kind === 'SINGLE_FUNCTIONAL' && lossCard.aggregation_rule !== 'IDENTITY') {
    return freeze({
      status: 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE',
      selected_probe_id: null,
      aggregation_rule: lossCard.aggregation_rule ?? null,
      candidate_set: freeze([]),
      confirmatory: false,
      automatic_execution: false
    });
  }

  const receipt = selectByDeclaredConsequence({
    rho,
    loss_card: lossCard,
    unaggregated_functionals: unaggregatedFunctionals
  });

  if (receipt.status !== 'CONSEQUENCE_CONDITIONED_QUESTION_PROPOSED') return receipt;

  const minimum = Math.min(...receipt.scores.map(item => item.decision_loss));
  const tied = receipt.scores
    .filter(item => Math.abs(item.decision_loss - minimum) <= TIE_TOLERANCE)
    .map(item => item.probe_id)
    .sort();

  if (tied.length > 1) {
    return freeze({
      ...receipt,
      status: 'NO_UNIQUE_SELECTION_DECISION_LOSS_TIE',
      selected_probe_id: null,
      candidate_set: freeze(tied),
      lexicographic_probe_id_tie_break_used: false,
      automatic_execution: false
    });
  }

  return freeze({ ...receipt, candidate_set: freeze([receipt.selected_probe_id]) });
}

function selectionAt(rho, s) {
  const receipt = safeConsequenceSelection({ rho, lossCard: lossCardForS(s) });
  return freeze({
    rho,
    s,
    status: receipt.status,
    selected_probe_id: receipt.selected_probe_id,
    all_candidates_admissible: Array.isArray(receipt.candidate_admissibility)
      ? receipt.candidate_admissibility.every(item => item.admissible === true)
      : false,
    candidate_set: receipt.candidate_set ?? freeze([])
  });
}

function uncertaintyControls() {
  const missing = selectCorrelatedNoiseWidening([
    {
      probe_id: 'P_MISSING',
      definition: 'rank-lifting probe with unresolved covariance',
      gradient: [0, 1],
      covariance: null,
      covariance_source_status: 'UNRESOLVED'
    }
  ]);
  const invalid = selectCorrelatedNoiseWidening([
    {
      probe_id: 'P_INVALID',
      definition: 'rank-lifting probe with invalid covariance',
      gradient: [0, 1],
      covariance: [[1, 1.05], [1.05, 1]],
      covariance_source_status: 'DECLARED_SYNTHETIC_INVALID_CONTROL'
    }
  ]);
  return freeze({
    incomplete: freeze({
      inherited_status: missing.selection_status,
      hostile_disposition: 'ABSTAIN_NOISE_GEOMETRY_INCOMPLETE',
      selected_probe_id: missing.selected_probe_id
    }),
    invalid: freeze({
      inherited_status: invalid.selection_status,
      hostile_disposition: 'REJECT_INVALID_NOISE_GEOMETRY',
      selected_probe_id: invalid.selected_probe_id
    })
  });
}

function routeControls() {
  const routes = buildMossLanternTemporalRoutes();
  const before = routes.find(route => route.route_id === 'ML3-R01');
  const after = routes.find(route => route.route_id === 'ML3-R02');
  if (!before || !after) throw new Error('Moss Lantern declared route pair ML3-R01/ML3-R02 missing.');

  const beforeWitness = forwardMossLanternTemporalWitness(before, MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS);
  const afterWitness = forwardMossLanternTemporalWitness(after, MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS);
  const sameWitness = forwardMossLanternTemporalWitness(before, MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS);

  return freeze({
    same_route: freeze({
      before_route_id: before.route_id,
      after_route_id: before.route_id,
      route_provenance_changed: false,
      endpoint_equal: true,
      process_witness_equal: JSON.stringify(beforeWitness) === JSON.stringify(sameWitness)
    }),
    route_only: freeze({
      before_route_id: before.route_id,
      after_route_id: after.route_id,
      route_provenance_changed: true,
      operation_order_changed: JSON.stringify(before.operation_order) !== JSON.stringify(after.operation_order),
      operation_multiset_equal: JSON.stringify(before.operation_multiset) === JSON.stringify(after.operation_multiset),
      endpoint_equal: before.endpoint === after.endpoint,
      open_boundary_equal: before.open_boundary === after.open_boundary,
      terminal_action_equal: before.terminal_action === after.terminal_action,
      before_process_witness: beforeWitness,
      after_process_witness: afterWitness,
      process_witness_changed: JSON.stringify(beforeWitness) !== JSON.stringify(afterWitness)
    })
  });
}

export function refuseTypedScalarCollapse(requestedField) {
  const forbidden = new Set([
    'confidence',
    'certainty',
    'robustness',
    'trust',
    'replay_stability_score',
    'combined_consequence_score'
  ]);
  if (!forbidden.has(requestedField)) throw new Error(`Unknown scalar-collapse request: ${requestedField}`);
  return freeze({
    requested_field: requestedField,
    status: 'REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE',
    scalar_value: null,
    scalar_aggregation_used: false
  });
}

export function runPedagogueH1ConsequenceConservationHostileGauntlet() {
  const inheritedReplay = runAperturePedagogueDecisionLossReplayMapGauntlet();

  const stableInterior = [0.49, 0.50, 0.51].map(rho => selectionAt(rho, 0.4));
  const measurementBoundary = freeze({
    before: selectionAt(MEASUREMENT_BOUNDARY_RHO - EPS, 0.55),
    after: selectionAt(MEASUREMENT_BOUNDARY_RHO + EPS, 0.55)
  });

  const decisionBoundary = freeze({
    before: selectionAt(DECISION_RHO, DECISION_BOUNDARY_S - EPS),
    after: selectionAt(DECISION_RHO, DECISION_BOUNDARY_S + EPS)
  });

  const posthoc = safeConsequenceSelection({
    rho: DECISION_RHO,
    lossCard: lossCardForS(0.8, { cardId: 'POSTHOC', posthoc: true })
  });
  const undeclared = safeConsequenceSelection({ rho: DECISION_RHO, lossCard: null });
  const conflicting = safeConsequenceSelection({
    rho: DECISION_RHO,
    unaggregatedFunctionals: ['H_Y', 'H_SUM']
  });
  const missingAggregation = safeConsequenceSelection({
    rho: DECISION_RHO,
    lossCard: lossCardForS(0.6, { cardId: 'MISSING_AGG', aggregationRule: null })
  });
  const unsupportedAggregation = safeConsequenceSelection({
    rho: DECISION_RHO,
    lossCard: lossCardForS(0.6, { cardId: 'MAX_AGG', aggregationRule: 'MAX' })
  });

  const exactTieS = analyticDecisionBoundaryS(DECISION_RHO);
  const exactTie = safeConsequenceSelection({
    rho: DECISION_RHO,
    lossCard: lossCardForS(exactTieS, { cardId: 'EXACT_BOUNDARY_TIE' })
  });

  const uncertainty = uncertaintyControls();
  const routes = routeControls();
  const scalarRefusals = freeze([
    'confidence',
    'certainty',
    'robustness',
    'trust',
    'replay_stability_score',
    'combined_consequence_score'
  ].map(refuseTypedScalarCollapse));

  const stableInteriorPass = stableInterior.every(item =>
    item.status === 'CONSEQUENCE_CONDITIONED_QUESTION_PROPOSED' &&
    item.selected_probe_id === 'P_ORTH' &&
    item.all_candidates_admissible === true
  );
  const measurementCorpse =
    measurementBoundary.before.selected_probe_id === 'P_ORTH' &&
    measurementBoundary.after.selected_probe_id === 'P_DIAG' &&
    measurementBoundary.before.all_candidates_admissible === true &&
    measurementBoundary.after.all_candidates_admissible === true;
  const decisionCorpse =
    decisionBoundary.before.selected_probe_id === 'P_ORTH' &&
    decisionBoundary.after.selected_probe_id === 'P_DIAG' &&
    decisionBoundary.before.all_candidates_admissible === true &&
    decisionBoundary.after.all_candidates_admissible === true;
  const routeCorpse =
    routes.route_only.endpoint_equal === true &&
    routes.route_only.route_provenance_changed === true &&
    routes.route_only.operation_order_changed === true &&
    routes.route_only.operation_multiset_equal === true &&
    routes.route_only.process_witness_changed === true;

  const refusalsPass =
    posthoc.status === 'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY' &&
    undeclared.status === 'NO_SELECTION_UNDECLARED_DECISION_LOSS' &&
    conflicting.status === 'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE' &&
    missingAggregation.status === 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE' &&
    unsupportedAggregation.status === 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE' &&
    exactTie.status === 'NO_UNIQUE_SELECTION_DECISION_LOSS_TIE' &&
    exactTie.selected_probe_id === null &&
    exactTie.candidate_set.length === 2 &&
    uncertainty.incomplete.hostile_disposition === 'ABSTAIN_NOISE_GEOMETRY_INCOMPLETE' &&
    uncertainty.invalid.hostile_disposition === 'REJECT_INVALID_NOISE_GEOMETRY' &&
    scalarRefusals.every(item => item.status === 'REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE' && item.scalar_value === null);

  const genericH1Falsified = stableInteriorPass && measurementCorpse && decisionCorpse && routeCorpse && refusalsPass;
  if (!genericH1Falsified) {
    throw new Error('H1 hostile gauntlet failed to satisfy the predeclared bounded corpse criteria and controls.');
  }

  return freeze({
    schema: PEDAGOGUE_H1_CONSEQUENCE_CONSERVATION_HOSTILE_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    experiment_host: 'PR677_PEDAGOGUE_HOSTILE_RESEARCH',
    inherited_replay_schema: inheritedReplay.schema,
    single_axis_receipts: freeze({
      same_route_negative_control: routes.same_route,
      A1_measurement_stable_interior: freeze(stableInterior),
      A2_measurement_boundary: measurementBoundary,
      A3_uncertainty_controls: uncertainty,
      B1_decision_only_CE_D1: decisionBoundary,
      B2_posthoc_refusal: posthoc,
      B3_undeclared_loss_refusal: undeclared,
      B3_conflicting_loss_refusal: conflicting,
      B3_missing_aggregation_refusal: missingAggregation,
      B3_unsupported_aggregation_refusal: unsupportedAggregation,
      B4_exact_tie_ambiguity: exactTie,
      C1_route_only_CE_P1: routes.route_only,
      scalar_collapse_refusals: scalarRefusals
    }),
    corpse_findings: freeze({
      measurement_axis_changes_can_leave_consequence_invariant: stableInteriorPass,
      CE_M1_measurement_only_selection_change: measurementCorpse,
      CE_D1_decision_only_selection_change: decisionCorpse,
      CE_P1_same_endpoint_different_route_process_state: routeCorpse
    }),
    primary_verdict: 'GENERIC_H1_FALSIFIED',
    verdict_scope: 'BOUNDED_SYNTHETIC_UNTYPED_CONSEQUENCE_CONSERVATION_FORM',
    required_typed_rescues: freeze([
      'H1_REQUIRES_MEASUREMENT_DOMAIN',
      'H1_REQUIRES_DECISION_DECLARATION',
      'H1_REQUIRES_ROUTE_TERM'
    ]),
    candidate_typed_rescue: freeze({
      status: 'ATTACK_ONLY_NOT_PROMOTED',
      text: 'For a declared typed axis a, a consequence claim carried on a may not silently widen beyond evidence carried on a.',
      presumption_of_survival: false
    }),
    negative_control_status: 'ALL_PREDECLARED_SINGLE_AXIS_CONTROLS_PASSED',
    intersection_program_status: 'HELD_PENDING_HUMAN_REVIEW_OF_SINGLE_AXIS_CORPSE',
    H2_status: 'HELD_NOT_TESTED_HERE',
    H3_status: 'HELD_NOT_TESTED_HERE',
    scalar_aggregation_used: false,
    promotion_authority: false,
    automatic_execution: false,
    product_mutation: false,
    pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    deployment_authority: false,
    release_authority: false,
    human_closure_required: true,
    next_learning_action: 'ATTACK_TYPED_NON_AMPLIFICATION_RESCUE_BEFORE_OPENING_PAIRWISE_OR_TRIPLE_AXIS_INTERSECTIONS'
  });
}
