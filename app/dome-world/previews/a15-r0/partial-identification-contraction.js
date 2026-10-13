import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const PARTIAL_IDENTIFICATION_CONTRACTION_SCHEMA = 'td613.ash.a15-r0.partial-identification-contraction/v0.1';

const EPSILON = 1e-12;
const ROUTES = Object.freeze(['R0', 'R1', 'R2', 'R3']);
const TARGET = 'R0';

const Y = Object.freeze({
  R0: Object.freeze([0.5, 0.5]),
  R1: Object.freeze([0.5, 0.5]),
  R2: Object.freeze([0.5, 0.5]),
  R3: Object.freeze([0.8, 0.2])
});

const Z = Object.freeze({
  R0: Object.freeze([0.9, 0.1]),
  R1: Object.freeze([0.1, 0.9]),
  R2: Object.freeze([0.9, 0.1]),
  R3: Object.freeze([0.5, 0.5])
});

const H_PRE = Object.freeze({
  restriction_id: 'H_PRE',
  admitted_candidates: Object.freeze(['R0', 'R1', 'R3']),
  excluded_candidates: Object.freeze(['R2']),
  provenance_class: 'PREDECLARED_SYNTHETIC_STRUCTURAL_RESTRICTION',
  predeclared_before_target_evaluation: true,
  independent_empirical_support: false,
  justification_reference: 'SYNTHETIC_FIXTURE_PREDECLARATION_ONLY'
});

const H_POST = Object.freeze({
  restriction_id: 'H_POST',
  admitted_candidates: Object.freeze(['R0']),
  excluded_candidates: Object.freeze(['R1', 'R2', 'R3']),
  provenance_class: 'POSTHOC_TARGET_SELECTED_RESTRICTION',
  predeclared_before_target_evaluation: false,
  independent_empirical_support: false,
  justification_reference: 'TARGET_SELECTED_AFTER_REFERENCE_TRUTH_DECLARED'
});

function equalLaw(a, b) {
  return a.length === b.length && a.every((value, index) => Math.abs(value - b[index]) <= EPSILON);
}

function jointIndependent(a, b) {
  const out = [];
  for (const x of a) for (const y of b) out.push(x * y);
  return out;
}

function observationLaw(route, channels) {
  if (channels.length === 1 && channels[0] === 'Y') return Y[route];
  if (channels.length === 2 && channels[0] === 'Y' && channels[1] === 'Z') return jointIndependent(Y[route], Z[route]);
  throw new Error(`Unsupported nested observation scope: ${channels.join('+')}`);
}

function identifiedSet({ candidates, channels, target = TARGET }) {
  const targetLaw = observationLaw(target, channels);
  return candidates.filter(route => equalLaw(observationLaw(route, channels), targetLaw)).sort();
}

function intersect(left, right) {
  const rightSet = new Set(right);
  return left.filter(value => rightSet.has(value)).sort();
}

function subsetOf(left, right) {
  const rightSet = new Set(right);
  return left.every(value => rightSet.has(value));
}

function scopeReceipt({ identified_set, observation_scope, candidate_scope, assumption_scope = null, classification, contraction_source, point_identified, unconditional_point_identification = false }) {
  return freeze({
    identified_set: freeze([...identified_set]),
    size: identified_set.length,
    observation_scope: freeze([...observation_scope]),
    candidate_scope: freeze([...candidate_scope]),
    assumption_scope,
    classification,
    contraction_source,
    point_identified,
    unconditional_point_identification
  });
}

export function runPartialIdentificationContractionGauntlet() {
  const baselineSet = identifiedSet({ candidates: ROUTES, channels: ['Y'] });
  const baseline = scopeReceipt({
    identified_set: baselineSet,
    observation_scope: ['Y'],
    candidate_scope: ROUTES,
    classification: 'PARTIALLY_IDENTIFIED',
    contraction_source: 'BASELINE_OBSERVATION',
    point_identified: false
  });

  const caseASet = intersect(baselineSet, H_PRE.admitted_candidates);
  const caseA = freeze({
    ...scopeReceipt({
      identified_set: caseASet,
      observation_scope: ['Y'],
      candidate_scope: H_PRE.admitted_candidates,
      assumption_scope: H_PRE.restriction_id,
      classification: 'ASSUMPTION_CONDITIONED_PARTIAL_IDENTIFICATION',
      contraction_source: 'PREDECLARED_MODEL_RESTRICTION',
      point_identified: false
    }),
    restriction: H_PRE,
    identified_set_contracted: caseASet.length < baselineSet.length,
    new_observation_added: false,
    model_class_narrowed: true,
    excluded_route_empirically_disproved_by_Y: false
  });

  const yzSet = identifiedSet({ candidates: ROUTES, channels: ['Y', 'Z'] });
  const caseB = freeze({
    ...scopeReceipt({
      identified_set: yzSet,
      observation_scope: ['Y', 'Z'],
      candidate_scope: ROUTES,
      classification: 'OBSERVATION_CONDITIONED_PARTIAL_IDENTIFICATION',
      contraction_source: 'OBSERVATION_EXPANSION',
      point_identified: false
    }),
    conditional_independence_declared: true,
    identified_set_contracted: yzSet.length < baselineSet.length,
    new_observation_added: true,
    model_class_narrowed: false
  });

  const caseCSet = intersect(yzSet, H_PRE.admitted_candidates);
  const caseC = freeze({
    ...scopeReceipt({
      identified_set: caseCSet,
      observation_scope: ['Y', 'Z'],
      candidate_scope: H_PRE.admitted_candidates,
      assumption_scope: H_PRE.restriction_id,
      classification: 'POINT_IDENTIFIED_WITHIN_DECLARED_OBSERVATION_AND_MODEL_SCOPE',
      contraction_source: 'COMBINED_OBSERVATION_AND_PREDECLARED_RESTRICTION',
      point_identified: true,
      unconditional_point_identification: false
    }),
    restriction: H_PRE,
    required_qualified_language: 'R0 is point-identified inside the declared finite candidate family, under observation channels Y+Z and predeclared restriction H_pre.'
  });

  const posthocArithmetic = intersect(baselineSet, H_POST.admitted_candidates);
  const caseD = freeze({
    arithmetic_intersection: freeze(posthocArithmetic),
    governed_identified_set: freeze([...baselineSet]),
    governed_size: baselineSet.length,
    observation_scope: freeze(['Y']),
    candidate_scope: freeze([...ROUTES]),
    assumption_scope: H_POST.restriction_id,
    restriction: H_POST,
    contraction_source: 'POSTHOC_RESTRICTION_REJECTED',
    classification: 'ASSUMPTION_LAUNDERING_REJECTED',
    point_identification_earned: false,
    posthoc_restriction_modified_governed_verdict: false
  });

  const nestedObservationMonotonicity = subsetOf(caseB.identified_set, baseline.identified_set);
  const nestedRestrictionMonotonicity = subsetOf(caseA.identified_set, baseline.identified_set);

  const passed =
    JSON.stringify(baseline.identified_set) === JSON.stringify(['R0', 'R1', 'R2']) &&
    JSON.stringify(caseA.identified_set) === JSON.stringify(['R0', 'R1']) &&
    caseA.new_observation_added === false && caseA.model_class_narrowed === true &&
    JSON.stringify(caseB.identified_set) === JSON.stringify(['R0', 'R2']) &&
    caseB.new_observation_added === true && caseB.model_class_narrowed === false &&
    JSON.stringify(caseC.identified_set) === JSON.stringify(['R0']) &&
    caseC.point_identified === true && caseC.unconditional_point_identification === false &&
    JSON.stringify(caseD.arithmetic_intersection) === JSON.stringify(['R0']) &&
    JSON.stringify(caseD.governed_identified_set) === JSON.stringify(['R0', 'R1', 'R2']) &&
    caseD.classification === 'ASSUMPTION_LAUNDERING_REJECTED' &&
    caseD.point_identification_earned === false &&
    nestedObservationMonotonicity && nestedRestrictionMonotonicity;

  if (!passed) throw new Error('Partial-identification contraction gauntlet violated an authored expectation.');

  return freeze({
    schema: PARTIAL_IDENTIFICATION_CONTRACTION_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    target: TARGET,
    route_count: ROUTES.length,
    observation_laws: freeze({ Y, Z }),
    baseline,
    cases: freeze({ A: caseA, B: caseB, C: caseC, D: caseD }),
    monotonicity: freeze({
      nested_observation: nestedObservationMonotonicity,
      nested_model_restriction: nestedRestrictionMonotonicity,
      universal_monotonicity_claim: false
    }),
    identification_scope_required: true,
    cardinality_alone_sufficient_for_provenance: false,
    gauntlet_status: 'PARTIAL_IDENTIFICATION_CONTRACTION_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relation: 'an identification verdict is inseparable from its observation scope + candidate model + assumption provenance',
    next_learning_action: 'TEST_IDENTIFICATION_UNDER_MODEL_MISSPECIFICATION_AND_HELDOUT_OBSERVATION',
    claims: freeze({
      universal_partial_identification_theorem: false,
      causal_identification: false,
      live_td613_stochastic_behavior: false,
      connection: false,
      curvature: false,
      holonomy: false,
      berry_structure: false,
      physical_phasons: false,
      quantum_behavior: false,
      proto_loom: false,
      production_authority: false
    }),
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    human_closure_required: true
  });
}
