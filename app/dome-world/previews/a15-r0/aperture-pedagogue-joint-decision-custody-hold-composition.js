import {
  certifyOrientationSign,
  buildProvenanceFixtures
} from './aperture-pedagogue-noisy-orientation-provenance-independence.js';

export const JOINT_DECISION_CUSTODY_HOLD_COMPOSITION_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-joint-decision-custody-hold-composition/v0.1';

const TOLERANCE = 1e-15;

const CUSTODY_STATUS_MAP = Object.freeze({
  SINGLE_ROOT_DUPLICATES_DO_NOT_AMPLIFY:'CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED',
  MULTI_ROOT_AGREEMENT_IN_BOUNDED_SYNTHETIC_FIXTURE:'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT',
  PROVENANCE_CONFLICT_HOLD:'CUSTODY_PROVENANCE_CONFLICT_HOLD',
  SOURCE_ROOT_INTERNAL_CONFLICT_HOLD:'CUSTODY_SOURCE_ROOT_INTERNAL_CONFLICT_HOLD'
});

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function finite(name,value) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
}

function deriveDecisionPosture({y_hat,bound,actual_eta=null}) {
  finite('y_hat',y_hat);
  finite('bound',bound);
  if (bound < 0) throw new RangeError('bound must be non-negative.');
  if (actual_eta !== null) finite('actual_eta',actual_eta);

  const certification = certifyOrientationSign({y_hat,bound});
  const declaredBoundHolds = actual_eta === null
    ? null
    : Math.abs(actual_eta) <= bound + TOLERANCE;

  if (declaredBoundHolds === false) {
    return freeze({
      status:'DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED',
      selected_action:null,
      interval:certification.interval,
      support_eligible:false,
      declared_bound_holds:false,
      underlying_certification:certification.orientation_status
    });
  }

  if (certification.orientation_status === 'CERTIFIED_POSITIVE') {
    return freeze({
      status:'DECISION_ACTIONABLE_PLUS',
      selected_action:'Q_PLUS_REPAIR',
      interval:certification.interval,
      support_eligible:true,
      declared_bound_holds:declaredBoundHolds,
      underlying_certification:certification.orientation_status
    });
  }
  if (certification.orientation_status === 'CERTIFIED_NEGATIVE') {
    return freeze({
      status:'DECISION_ACTIONABLE_MINUS',
      selected_action:'Q_MINUS_REPAIR',
      interval:certification.interval,
      support_eligible:true,
      declared_bound_holds:declaredBoundHolds,
      underlying_certification:certification.orientation_status
    });
  }
  if (certification.orientation_status === 'ORIENTATION_UNRESOLVED') {
    return freeze({
      status:'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED',
      selected_action:null,
      interval:certification.interval,
      support_eligible:true,
      declared_bound_holds:declaredBoundHolds,
      underlying_certification:certification.orientation_status
    });
  }
  throw new RangeError('undeclared orientation certification posture.');
}

function deriveCustodyPosture(classification) {
  if (!classification || typeof classification !== 'object') {
    throw new TypeError('custody classification must be an object.');
  }
  const mapped = CUSTODY_STATUS_MAP[classification.status];
  if (!mapped) throw new RangeError('undeclared custody posture.');
  return freeze({
    status:mapped,
    source_status:classification.status,
    resolved_route:classification.resolved_route ?? null,
    unique_root_count:classification.unique_root_count ?? null,
    independent_support_count:classification.independent_support_count ?? null,
    raw_record_count:classification.raw_record_count ?? null,
    duplicate_majority_vote_used:classification.duplicate_majority_vote_used === true,
    declared_synthetic_independence_only:classification.declared_synthetic_independence_only === true
  });
}

export function composeDecisionCustodyState({decision_input,custody_classification,case_id='UNNAMED'}) {
  if (typeof case_id !== 'string' || !case_id.length) throw new TypeError('case_id must be a non-empty string.');
  const decision = deriveDecisionPosture(decision_input || {});
  const custody = deriveCustodyPosture(custody_classification);
  if (custody.duplicate_majority_vote_used) {
    throw new Error('duplicate majority vote may not resolve custody posture.');
  }

  return freeze({
    case_id,
    decision,
    custody,
    composition:freeze({
      joint_state_id:`${decision.status} × ${custody.status}`,
      decision_authority_from_custody:false,
      custody_authority_from_decision:false,
      combined_confidence_scalar:null,
      majority_vote_used:false,
      automatic_escalation:false,
      automatic_execution:false,
      human_closure_required:true
    })
  });
}

export function buildJointCompositionFixture() {
  const P = buildProvenanceFixtures();
  const cases = [
    composeDecisionCustodyState({
      case_id:'J1_ACTIONABLE_PLUS_MULTI_ROOT_AGREEMENT',
      decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0},
      custody_classification:P.P2
    }),
    composeDecisionCustodyState({
      case_id:'J2_ABSTAIN_MULTI_ROOT_AGREEMENT',
      decision_input:{y_hat:0,bound:0.0002},
      custody_classification:P.P2
    }),
    composeDecisionCustodyState({
      case_id:'J3_ACTIONABLE_PLUS_PROVENANCE_CONFLICT',
      decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0},
      custody_classification:P.P3
    }),
    composeDecisionCustodyState({
      case_id:'J4_DUAL_HOLD',
      decision_input:{y_hat:0,bound:0.0002},
      custody_classification:P.P3
    }),
    composeDecisionCustodyState({
      case_id:'J5_ACTIONABLE_MINUS_SINGLE_ROOT_DUPLICATES',
      decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0},
      custody_classification:P.P1
    }),
    composeDecisionCustodyState({
      case_id:'J6_ACTIONABLE_MINUS_DUPLICATE_MAJORITY_CONFLICT',
      decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0},
      custody_classification:P.P4
    }),
    composeDecisionCustodyState({
      case_id:'J7_ABSTAIN_SOURCE_ROOT_INTERNAL_CONFLICT',
      decision_input:{y_hat:0.0001,bound:0.0002},
      custody_classification:P.P5
    }),
    composeDecisionCustodyState({
      case_id:'J8_FALSIFIED_BOUND_MULTI_ROOT_AGREEMENT',
      decision_input:{y_hat:-0.0001,bound:0.00005,actual_eta:-0.0009},
      custody_classification:P.P2
    })
  ];
  return freeze(cases);
}

function assertExpectedCase(caseById,id,decisionStatus,custodyStatus,selectedAction) {
  const item = caseById.get(id);
  return Boolean(item) &&
    item.decision.status === decisionStatus &&
    item.decision.selected_action === selectedAction &&
    item.custody.status === custodyStatus &&
    item.composition.decision_authority_from_custody === false &&
    item.composition.custody_authority_from_decision === false &&
    item.composition.combined_confidence_scalar === null &&
    item.composition.majority_vote_used === false &&
    item.composition.automatic_escalation === false &&
    item.composition.automatic_execution === false &&
    item.composition.human_closure_required === true;
}

export function runJointDecisionCustodyHoldCompositionGauntlet() {
  const cases = buildJointCompositionFixture();
  const caseById = new Map(cases.map(item => [item.case_id,item]));

  const decisionInvariantAcrossCustody =
    JSON.stringify(caseById.get('J1_ACTIONABLE_PLUS_MULTI_ROOT_AGREEMENT').decision) ===
    JSON.stringify(caseById.get('J3_ACTIONABLE_PLUS_PROVENANCE_CONFLICT').decision);

  const custodyInvariantAcrossDecision =
    JSON.stringify(caseById.get('J1_ACTIONABLE_PLUS_MULTI_ROOT_AGREEMENT').custody) ===
    JSON.stringify(caseById.get('J2_ABSTAIN_MULTI_ROOT_AGREEMENT').custody);

  const passed =
    cases.length === 8 &&
    assertExpectedCase(caseById,'J1_ACTIONABLE_PLUS_MULTI_ROOT_AGREEMENT','DECISION_ACTIONABLE_PLUS','CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT','Q_PLUS_REPAIR') &&
    assertExpectedCase(caseById,'J2_ABSTAIN_MULTI_ROOT_AGREEMENT','DECISION_ABSTAIN_ORIENTATION_UNRESOLVED','CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT',null) &&
    assertExpectedCase(caseById,'J3_ACTIONABLE_PLUS_PROVENANCE_CONFLICT','DECISION_ACTIONABLE_PLUS','CUSTODY_PROVENANCE_CONFLICT_HOLD','Q_PLUS_REPAIR') &&
    assertExpectedCase(caseById,'J4_DUAL_HOLD','DECISION_ABSTAIN_ORIENTATION_UNRESOLVED','CUSTODY_PROVENANCE_CONFLICT_HOLD',null) &&
    assertExpectedCase(caseById,'J5_ACTIONABLE_MINUS_SINGLE_ROOT_DUPLICATES','DECISION_ACTIONABLE_MINUS','CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED','Q_MINUS_REPAIR') &&
    assertExpectedCase(caseById,'J6_ACTIONABLE_MINUS_DUPLICATE_MAJORITY_CONFLICT','DECISION_ACTIONABLE_MINUS','CUSTODY_PROVENANCE_CONFLICT_HOLD','Q_MINUS_REPAIR') &&
    assertExpectedCase(caseById,'J7_ABSTAIN_SOURCE_ROOT_INTERNAL_CONFLICT','DECISION_ABSTAIN_ORIENTATION_UNRESOLVED','CUSTODY_SOURCE_ROOT_INTERNAL_CONFLICT_HOLD',null) &&
    assertExpectedCase(caseById,'J8_FALSIFIED_BOUND_MULTI_ROOT_AGREEMENT','DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED','CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT',null) &&
    decisionInvariantAcrossCustody &&
    custodyInvariantAcrossDecision &&
    cases.every(item => item.composition.combined_confidence_scalar === null) &&
    cases.every(item => item.composition.majority_vote_used === false);

  if (!passed) throw new Error('Joint decision / custody hold composition gauntlet violated an authored expectation.');

  return freeze({
    schema:JOINT_DECISION_CUSTODY_HOLD_COMPOSITION_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    authored_case_count:cases.length,
    cases,
    invariants:freeze({
      decision_invariant_across_custody_change:decisionInvariantAcrossCustody,
      custody_invariant_across_decision_change:custodyInvariantAcrossDecision,
      all_cases_preserve_null_confidence_scalar:cases.every(item=>item.composition.combined_confidence_scalar===null),
      all_cases_preserve_no_majority_vote:cases.every(item=>item.composition.majority_vote_used===false),
      all_cases_preserve_human_closure:cases.every(item=>item.composition.human_closure_required===true)
    }),
    gauntlet_status:'JOINT_DECISION_AND_CUSTODY_TYPED_COMPOSITION_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite synthetic fixture, local decision posture and custody/provenance posture can be carried as independently typed axes; agreement, conflict, abstention, and local actionability remain co-present without scalar collapse or cross-axis authority',
    next_learning_action:'TEST_DECISION_STATE_TRANSITION_WITH_CUSTODY_MONOTONIC_REPLAY_WHEN_A_NEW_OBSERVATION_RESOLVES_DECISION_UNCERTAINTY_BUT_DOES_NOT_ERASE_PRIOR_CONFLICT_OR_ROUTE_HISTORY',
    claims:freeze({
      sufficient_statistic_theorem:false,
      markov_state_theorem:false,
      pomdp_theorem:false,
      bayesian_confidence_theorem:false,
      consensus_theorem:false,
      real_world_provenance_independence:false,
      causal_intervention_theorem:false,
      active_learning:false,
      reinforcement_learning:false,
      optimal_experimental_design:false,
      autonomous_escalation:false,
      autonomous_execution:false,
      physical_sensor_feedback:false,
      physical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      connection:false,
      curvature:false,
      berry_structure:false,
      holonomy:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    automatic_execution:false,
    production_mutated:false,
    promotion_authority:false,
    human_closure_required:true
  });
}
