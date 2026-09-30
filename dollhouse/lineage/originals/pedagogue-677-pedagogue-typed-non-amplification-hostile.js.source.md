import { runWeddingIdentifiabilityAssay } from './wedding-identifiability-assay.js';
import {
  refuseTypedScalarCollapse,
  runPedagogueH1ConsequenceConservationHostileGauntlet
} from './pedagogue-h1-consequence-conservation-hostile.js';

export const PEDAGOGUE_TYPED_NON_AMPLIFICATION_HOSTILE_SCHEMA =
  'td613.pedagogue.typed-non-amplification-derivational-closure-hostile/v0.1';

const WEDDING_RULE = Object.freeze({
  rule_id: 'WEDDING_RELATIONAL_RECOVERY',
  requires: Object.freeze([
    'MEASUREMENT:OBS_D',
    'MEASUREMENT:OBS_Q',
    'MEASUREMENT:OBS_M'
  ]),
  produces: 'IDENTIFIABILITY:UNIQUE_LATENT_STATE',
  predeclared: true,
  admissible: true,
  replayable: true
});

const SCALAR_FIELDS = Object.freeze([
  'confidence',
  'certainty',
  'robustness',
  'trust',
  'replay_stability_score',
  'combined_consequence_score'
]);

const freezeRecord = value => Object.freeze({ ...value });
const freezeArray = value => Object.freeze([...value]);

function primitiveWarrants(evidence) {
  if (!Array.isArray(evidence)) throw new TypeError('evidence must be an array');
  const warrants = new Set();
  for (const item of evidence) {
    if (!item || !Array.isArray(item.warrants)) throw new TypeError('each evidence item must declare warrants');
    for (const warrant of item.warrants) {
      if (typeof warrant !== 'string' || warrant.length === 0) throw new TypeError('warrant tokens must be non-empty strings');
      warrants.add(warrant);
    }
  }
  return warrants;
}

function validateRule(rule) {
  if (!rule || typeof rule.rule_id !== 'string' || !rule.rule_id) throw new TypeError('rule_id required');
  if (!Array.isArray(rule.requires)) throw new TypeError('rule requires must be an array');
  if (typeof rule.produces !== 'string' || !rule.produces) throw new TypeError('rule produces required');
  if (rule.predeclared !== true || rule.admissible !== true || rule.replayable !== true) return false;
  return true;
}

export function declaredDerivationalClosure({ evidence = [], rules = [] } = {}) {
  const primitive = primitiveWarrants(evidence);
  const closure = new Set(primitive);
  const derivationsUsed = [];
  const eligibleRules = [...rules]
    .filter(validateRule)
    .sort((left, right) => left.rule_id.localeCompare(right.rule_id));

  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of eligibleRules) {
      if (closure.has(rule.produces)) continue;
      if (rule.requires.every(required => closure.has(required))) {
        closure.add(rule.produces);
        derivationsUsed.push(rule.rule_id);
        changed = true;
      }
    }
  }

  return freezeRecord({
    primitive_warrants: freezeArray([...primitive].sort()),
    closure_warrants: freezeArray([...closure].sort()),
    derivations_used: freezeArray([...new Set(derivationsUsed)].sort()),
    scalar_aggregation_used: false
  });
}

export function evaluateStrictInputBoundNonAmplification({ evidence = [], requested_warrant } = {}) {
  if (typeof requested_warrant !== 'string' || !requested_warrant) throw new TypeError('requested_warrant required');
  const primitive = primitiveWarrants(evidence);
  const explicitlySupported = primitive.has(requested_warrant);
  return freezeRecord({
    candidate: 'C0_STRICT_INPUT_BOUND_TYPED_NON_AMPLIFICATION',
    requested_warrant,
    status: explicitlySupported
      ? 'PERMIT_EXPLICITLY_SUPPORTED_AUTHORITY'
      : 'REFUSE_STRICT_INPUT_BOUND_WARRANT_WIDENING',
    primitive_warrants: freezeArray([...primitive].sort()),
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function evaluateDeclaredDerivationalClosure({ evidence = [], rules = [], requested_warrant } = {}) {
  if (typeof requested_warrant !== 'string' || !requested_warrant) throw new TypeError('requested_warrant required');
  const closure = declaredDerivationalClosure({ evidence, rules });
  const primitive = new Set(closure.primitive_warrants);
  const admitted = new Set(closure.closure_warrants);
  const status = primitive.has(requested_warrant)
    ? 'PERMIT_EXPLICITLY_SUPPORTED_AUTHORITY'
    : admitted.has(requested_warrant)
      ? 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY'
      : 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE';

  return freezeRecord({
    candidate: 'C1_DECLARED_DERIVATIONAL_CLOSURE',
    requested_warrant,
    status,
    primitive_warrants: closure.primitive_warrants,
    closure_warrants: closure.closure_warrants,
    derivations_used: closure.derivations_used,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

function evidence(id, warrants) {
  return freezeRecord({ evidence_id: id, warrants: freezeArray(warrants) });
}

function rule(rule_id, requires, produces) {
  return freezeRecord({
    rule_id,
    requires: freezeArray(requires),
    produces,
    predeclared: true,
    admissible: true,
    replayable: true
  });
}

function weddingLawfulGainControl() {
  const wedding = runWeddingIdentifiabilityAssay();
  const positive = Object.fromEntries(
    wedding.positive_control.conditions.map(condition => [condition.condition_id, condition])
  );
  const evidenceSet = freezeArray([
    evidence('W_D', ['MEASUREMENT:OBS_D']),
    evidence('W_Q', ['MEASUREMENT:OBS_Q']),
    evidence('W_M', ['MEASUREMENT:OBS_M'])
  ]);
  const requested = 'IDENTIFIABILITY:UNIQUE_LATENT_STATE';
  const strict = evaluateStrictInputBoundNonAmplification({ evidence: evidenceSet, requested_warrant: requested });
  const closure = evaluateDeclaredDerivationalClosure({ evidence: evidenceSet, rules: [WEDDING_RULE], requested_warrant: requested });

  const mechanismValid = wedding.assay_mechanism_validated === true
    && positive.D.exact_unique_recovery_rate === 0
    && positive.Q.exact_unique_recovery_rate === 0
    && positive.M.exact_unique_recovery_rate === 0
    && positive['D+Q'].exact_unique_recovery_rate === 0
    && positive['D+M'].exact_unique_recovery_rate === 0
    && positive['Q+M'].exact_unique_recovery_rate === 0
    && positive['D+Q+M'].exact_unique_recovery_rate === 1;

  return freezeRecord({
    wedding_schema: wedding.schema,
    mechanism_valid: mechanismValid,
    best_pair_exact_recovery_rate: wedding.positive_control.best_pair_exact_recovery_rate,
    intact_triple_exact_recovery_rate: wedding.positive_control.intact_triple_exact_recovery_rate,
    strict_disposition: strict,
    closure_disposition: closure
  });
}

function representationStrengtheningControl() {
  const evidenceSet = freezeArray([
    evidence('R_D', ['MEASUREMENT:OBS_D']),
    evidence('R_Q', ['MEASUREMENT:OBS_Q']),
    evidence('R_M', ['MEASUREMENT:OBS_M'])
  ]);
  return evaluateDeclaredDerivationalClosure({
    evidence: evidenceSet,
    rules: [WEDDING_RULE],
    requested_warrant: 'DECISION:HUMAN_PREFERENCE'
  });
}

function decisionOnlyControl(inherited) {
  const beforeSelection = inherited.single_axis_receipts.B1_decision_only_CE_D1.before.selected_probe_id;
  const afterSelection = inherited.single_axis_receipts.B1_decision_only_CE_D1.after.selected_probe_id;
  const fixedMeasurement = 'MEASUREMENT:MODEL_FIXED_DECISION_RHO';
  const beforeLoss = 'DECISION:LOSS:BELOW_BOUNDARY';
  const afterLoss = 'DECISION:LOSS:ABOVE_BOUNDARY';
  const beforeWarrant = `DECISION:SELECTED:${beforeSelection}`;
  const afterWarrant = `DECISION:SELECTED:${afterSelection}`;
  const rules = freezeArray([
    rule('CE_D1_BEFORE_SELECTION', [fixedMeasurement, beforeLoss], beforeWarrant),
    rule('CE_D1_AFTER_SELECTION', [fixedMeasurement, afterLoss], afterWarrant)
  ]);

  const before = evaluateDeclaredDerivationalClosure({
    evidence: [evidence('D_BEFORE_M', [fixedMeasurement]), evidence('D_BEFORE_L', [beforeLoss])],
    rules,
    requested_warrant: beforeWarrant
  });
  const after = evaluateDeclaredDerivationalClosure({
    evidence: [evidence('D_AFTER_M', [fixedMeasurement]), evidence('D_AFTER_L', [afterLoss])],
    rules,
    requested_warrant: afterWarrant
  });
  const measurementOnlyLaunder = evaluateDeclaredDerivationalClosure({
    evidence: [evidence('D_M_ONLY', [fixedMeasurement])],
    rules,
    requested_warrant: beforeWarrant
  });

  return freezeRecord({
    inherited_before_selection: beforeSelection,
    inherited_after_selection: afterSelection,
    before,
    after,
    measurement_only_launder: measurementOnlyLaunder
  });
}

function measurementOnlyControl(inherited) {
  const beforeSelection = inherited.single_axis_receipts.A2_measurement_boundary.before.selected_probe_id;
  const afterSelection = inherited.single_axis_receipts.A2_measurement_boundary.after.selected_probe_id;
  const fixedDecision = 'DECISION:LOSS:S_0_55_FIXED';
  const lowMeasurement = 'MEASUREMENT:RHO:BELOW_BOUNDARY';
  const highMeasurement = 'MEASUREMENT:RHO:ABOVE_BOUNDARY';
  const beforeWarrant = `DECISION:SELECTED:${beforeSelection}`;
  const afterWarrant = `DECISION:SELECTED:${afterSelection}`;
  const rules = freezeArray([
    rule('MEASUREMENT_BOUNDARY_BEFORE_SELECTION', [fixedDecision, lowMeasurement], beforeWarrant),
    rule('MEASUREMENT_BOUNDARY_AFTER_SELECTION', [fixedDecision, highMeasurement], afterWarrant)
  ]);

  return freezeRecord({
    inherited_before_selection: beforeSelection,
    inherited_after_selection: afterSelection,
    before: evaluateDeclaredDerivationalClosure({
      evidence: [evidence('M_BEFORE_D', [fixedDecision]), evidence('M_BEFORE_RHO', [lowMeasurement])],
      rules,
      requested_warrant: beforeWarrant
    }),
    after: evaluateDeclaredDerivationalClosure({
      evidence: [evidence('M_AFTER_D', [fixedDecision]), evidence('M_AFTER_RHO', [highMeasurement])],
      rules,
      requested_warrant: afterWarrant
    })
  });
}

function routeOnlyControl(inherited) {
  const route = inherited.single_axis_receipts.C1_route_only_CE_P1;
  const endpoint = 'ROUTE:ENDPOINT:RETURNED_PRACTICE_CAPSULE';
  const routeWarrant = `ROUTE:${route.after_route_id}`;
  return freezeRecord({
    inherited_endpoint_equal: route.endpoint_equal,
    inherited_route_provenance_changed: route.route_provenance_changed,
    inherited_process_witness_changed: route.process_witness_changed,
    endpoint_only: evaluateDeclaredDerivationalClosure({
      evidence: [evidence('P_ENDPOINT_ONLY', [endpoint])],
      rules: [],
      requested_warrant: routeWarrant
    }),
    route_explicit: evaluateDeclaredDerivationalClosure({
      evidence: [evidence('P_ENDPOINT', [endpoint]), evidence('P_ROUTE', [routeWarrant])],
      rules: [],
      requested_warrant: routeWarrant
    })
  });
}

function crossAxisLaunderingControls() {
  const cases = [
    freezeRecord({
      case_id: 'M_TO_D',
      evidence: freezeArray([evidence('X_M', ['MEASUREMENT:ADMISSIBLE'])]),
      requested_warrant: 'DECISION:HUMAN_PREFERENCE'
    }),
    freezeRecord({
      case_id: 'M_TO_P',
      evidence: freezeArray([evidence('X_M2', ['MEASUREMENT:ADMISSIBLE'])]),
      requested_warrant: 'ROUTE:ML3-R02'
    }),
    freezeRecord({
      case_id: 'P_TO_D',
      evidence: freezeArray([evidence('X_P', ['ROUTE:ML3-R02'])]),
      requested_warrant: 'DECISION:HUMAN_PREFERENCE'
    })
  ];

  return freezeArray(cases.map(item => freezeRecord({
    case_id: item.case_id,
    disposition: evaluateDeclaredDerivationalClosure({
      evidence: item.evidence,
      rules: [],
      requested_warrant: item.requested_warrant
    })
  })));
}

function reencodingControl() {
  const requested = 'IDENTIFIABILITY:UNIQUE_LATENT_STATE';
  const beforeEvidence = freezeArray([
    evidence('ORIGINAL_D', ['MEASUREMENT:OBS_D']),
    evidence('ORIGINAL_Q', ['MEASUREMENT:OBS_Q']),
    evidence('ORIGINAL_M', ['MEASUREMENT:OBS_M'])
  ]);
  const afterEvidence = freezeArray([
    evidence('RENAMED_M', ['MEASUREMENT:OBS_M']),
    evidence('RENAMED_D', ['MEASUREMENT:OBS_D']),
    evidence('RENAMED_Q', ['MEASUREMENT:OBS_Q'])
  ]);
  const before = evaluateDeclaredDerivationalClosure({ evidence: beforeEvidence, rules: [WEDDING_RULE], requested_warrant: requested });
  const after = evaluateDeclaredDerivationalClosure({ evidence: afterEvidence, rules: [WEDDING_RULE], requested_warrant: requested });
  return freezeRecord({
    before,
    after,
    closure_invariant: JSON.stringify(before.closure_warrants) === JSON.stringify(after.closure_warrants),
    disposition_invariant: before.status === after.status
  });
}

function constitutionalControls(inherited) {
  const single = inherited.single_axis_receipts;
  return freezeRecord({
    exact_tie_status: single.B4_exact_tie_ambiguity.status,
    exact_tie_candidate_set: single.B4_exact_tie_ambiguity.candidate_set,
    lexicographic_probe_id_tie_break_used: single.B4_exact_tie_ambiguity.lexicographic_probe_id_tie_break_used,
    undeclared_loss_status: single.B3_undeclared_loss_refusal.status,
    conflicting_loss_status: single.B3_conflicting_loss_refusal.status,
    missing_aggregation_status: single.B3_missing_aggregation_refusal.status,
    unsupported_aggregation_status: single.B3_unsupported_aggregation_refusal.status,
    posthoc_status: single.B2_posthoc_refusal.status,
    incomplete_uncertainty_status: single.A3_uncertainty_controls.incomplete.hostile_disposition,
    invalid_uncertainty_status: single.A3_uncertainty_controls.invalid.hostile_disposition
  });
}

export function runPedagogueTypedNonAmplificationHostileGauntlet() {
  const inherited = runPedagogueH1ConsequenceConservationHostileGauntlet();
  if (inherited.primary_verdict !== 'GENERIC_H1_FALSIFIED') {
    return freezeRecord({
      schema: PEDAGOGUE_TYPED_NON_AMPLIFICATION_HOSTILE_SCHEMA,
      primary_verdict: 'ASSAY_INFRASTRUCTURE_FAILURE',
      failure: 'INHERITED_GENERIC_H1_CORPSE_NOT_AVAILABLE',
      promotion_authority: false,
      human_closure_required: true
    });
  }

  const lawful = weddingLawfulGainControl();
  const unsupported = representationStrengtheningControl();
  const decision = decisionOnlyControl(inherited);
  const measurement = measurementOnlyControl(inherited);
  const route = routeOnlyControl(inherited);
  const laundering = crossAxisLaunderingControls();
  const reencoding = reencodingControl();
  const constitutional = constitutionalControls(inherited);
  const nullControl = evaluateDeclaredDerivationalClosure({
    evidence: [evidence('NULL_M', ['MEASUREMENT:ADMISSIBLE'])],
    rules: [],
    requested_warrant: 'MEASUREMENT:ADMISSIBLE'
  });
  const scalarRefusals = freezeArray(SCALAR_FIELDS.map(refuseTypedScalarCollapse));

  const strictFalsified = lawful.mechanism_valid === true
    && lawful.strict_disposition.status === 'REFUSE_STRICT_INPUT_BOUND_WARRANT_WIDENING'
    && lawful.intact_triple_exact_recovery_rate === 1
    && lawful.best_pair_exact_recovery_rate === 0;

  const constitutionalPass = constitutional.exact_tie_status === 'NO_UNIQUE_SELECTION_DECISION_LOSS_TIE'
    && JSON.stringify(constitutional.exact_tie_candidate_set) === JSON.stringify(['P_DIAG', 'P_ORTH'])
    && constitutional.lexicographic_probe_id_tie_break_used === false
    && constitutional.undeclared_loss_status === 'NO_SELECTION_UNDECLARED_DECISION_LOSS'
    && constitutional.conflicting_loss_status === 'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE'
    && constitutional.missing_aggregation_status === 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE'
    && constitutional.unsupported_aggregation_status === 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE'
    && constitutional.posthoc_status === 'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY'
    && constitutional.incomplete_uncertainty_status === 'ABSTAIN_NOISE_GEOMETRY_INCOMPLETE'
    && constitutional.invalid_uncertainty_status === 'REJECT_INVALID_NOISE_GEOMETRY';

  const closureCandidatePass = lawful.mechanism_valid === true
    && lawful.closure_disposition.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY'
    && lawful.closure_disposition.derivations_used.includes('WEDDING_RELATIONAL_RECOVERY')
    && unsupported.status === 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE'
    && decision.inherited_before_selection === 'P_ORTH'
    && decision.inherited_after_selection === 'P_DIAG'
    && decision.before.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY'
    && decision.after.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY'
    && decision.measurement_only_launder.status === 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE'
    && measurement.inherited_before_selection === 'P_ORTH'
    && measurement.inherited_after_selection === 'P_DIAG'
    && measurement.before.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY'
    && measurement.after.status === 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY'
    && route.inherited_endpoint_equal === true
    && route.inherited_route_provenance_changed === true
    && route.inherited_process_witness_changed === true
    && route.endpoint_only.status === 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE'
    && route.route_explicit.status === 'PERMIT_EXPLICITLY_SUPPORTED_AUTHORITY'
    && laundering.every(item => item.disposition.status === 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE')
    && reencoding.closure_invariant === true
    && reencoding.disposition_invariant === true
    && constitutionalPass
    && nullControl.status === 'PERMIT_EXPLICITLY_SUPPORTED_AUTHORITY'
    && scalarRefusals.every(item => item.status === 'REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE' && item.scalar_value === null);

  const closureVerdict = closureCandidatePass
    ? 'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_SURVIVES_BOUNDED_HOSTILE_FAMILY'
    : 'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_FALSIFIED';

  return freezeRecord({
    schema: PEDAGOGUE_TYPED_NON_AMPLIFICATION_HOSTILE_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    experiment_host: 'PR677_PEDAGOGUE_HOSTILE_RESEARCH',
    inherited_h1_schema: inherited.schema,
    strict_candidate: freezeRecord({
      status_before_execution: 'ATTACK_ONLY_NOT_PROMOTED',
      verdict: strictFalsified
        ? 'STRICT_TYPED_NON_AMPLIFICATION_FALSIFIED_BY_LAWFUL_DERIVATIONAL_GAIN'
        : 'ASSAY_INFRASTRUCTURE_FAILURE',
      presumption_of_survival: false
    }),
    closure_candidate: freezeRecord({
      status_before_execution: 'ATTACK_ONLY_NOT_PROMOTED',
      verdict: closureVerdict,
      presumption_of_survival: false,
      promoted: false
    }),
    hostile_receipts: freezeRecord({
      lawful_derivational_gain_wedding: lawful,
      unsupported_representation_strengthening: unsupported,
      decision_only_CE_D1: decision,
      measurement_only_boundary: measurement,
      route_only_CE_P1: route,
      cross_axis_laundering: laundering,
      equivalent_reencoding: reencoding,
      constitutional_controls: constitutional,
      null_control: nullControl,
      scalar_collapse_refusals: scalarRefusals
    }),
    strong_falsifier_passed: closureCandidatePass,
    strict_non_amplification_falsified: strictFalsified,
    primary_verdict: closureVerdict,
    interpretation: closureCandidatePass
      ? 'Strict constituent-bound non-amplification is inadequate in this bounded synthetic family; declared derivational closure survives the preregistered hostile family as an unpromoted candidate.'
      : 'The declared derivational-closure candidate failed at least one preregistered hostile control and is not rescued.',
    candidate_formalism_status: 'ATTACK_ONLY_NOT_PROMOTED',
    scalar_aggregation_used: false,
    intersection_program_status: 'HELD_NOT_OPENED_HERE',
    H2_status: 'HELD_NOT_TESTED_HERE',
    H3_status: 'HELD_NOT_TESTED_HERE',
    aperture_v32_replay_stability: 'HELD_NOT_YET_WITNESSED',
    pedagogue_engine_mutation: false,
    product_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    deployment_authority: false,
    release_authority: false,
    promotion_authority: false,
    human_closure_required: true,
    next_learning_action: closureCandidatePass
      ? 'HUMAN_REVIEW_DERIVATIONAL_CLOSURE_FRONTIER_BEFORE_ANY_INTERSECTION_PROGRAM_OR_FORMALISM_PROMOTION'
      : 'INTERPRET_TYPED_RESCUE_CORPSE_WITHOUT_OPENING_HELD_INTERSECTION_PROGRAM'
  });
}
