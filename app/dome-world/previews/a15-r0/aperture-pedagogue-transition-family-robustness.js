import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';

export const TRANSITION_FAMILY_ROBUSTNESS_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-transition-family-robustness/v0.1';

const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor: 0.25,
  condition_number_ceiling: 10,
  uncertainty_status: 'VALID_DECLARED',
  threshold_authority: 'A15_R0_SYNTHETIC_LOCAL'
});

const CURRENT_OPERATOR = Object.freeze([
  Object.freeze([1, 0])
]);

const FROZEN_CANDIDATES = Object.freeze([
  Object.freeze({
    candidate_id:'Q_DECLARED_STABLE',
    q_pre:Object.freeze([0,1]),
    transition_knowledge:'DECLARED',
    nominal_q_post:Object.freeze([0.1,1]),
    transition_family:null,
    family_representation:null,
    majority_vote_used:false
  }),
  Object.freeze({
    candidate_id:'Q_ROBUST_FAMILY',
    q_pre:Object.freeze([0,1]),
    transition_knowledge:'SET_IDENTIFIED',
    nominal_q_post:Object.freeze([0.2,1]),
    transition_family:Object.freeze([
      Object.freeze([0,1]),
      Object.freeze([0.2,1]),
      Object.freeze([-0.2,1])
    ]),
    family_representation:'COMPLETE_DECLARED_SET',
    majority_vote_used:false
  }),
  Object.freeze({
    candidate_id:'Q_MIXED_FAMILY',
    q_pre:Object.freeze([0,1]),
    transition_knowledge:'SET_IDENTIFIED',
    nominal_q_post:Object.freeze([0,1]),
    transition_family:Object.freeze([
      Object.freeze([0,1]),
      Object.freeze([1,0]),
      Object.freeze([1,0.001])
    ]),
    family_representation:'COMPLETE_DECLARED_SET',
    majority_vote_used:false
  }),
  Object.freeze({
    candidate_id:'Q_BAD_FAMILY',
    q_pre:Object.freeze([0,1]),
    transition_knowledge:'SET_IDENTIFIED',
    nominal_q_post:Object.freeze([1,0]),
    transition_family:Object.freeze([
      Object.freeze([1,0]),
      Object.freeze([2,0]),
      Object.freeze([1,0.001])
    ]),
    family_representation:'COMPLETE_DECLARED_SET',
    majority_vote_used:false
  }),
  Object.freeze({
    candidate_id:'Q_UNMODELED',
    q_pre:Object.freeze([0,1]),
    transition_knowledge:'UNMODELED',
    nominal_q_post:null,
    transition_family:null,
    family_representation:null,
    majority_vote_used:false
  })
]);

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function clone(value) {
  return structuredClone(value);
}

function stable(value) {
  return JSON.stringify(value);
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function row2(row, label) {
  if (!Array.isArray(row) || row.length !== 2) {
    throw new TypeError(`${label} must be a two-component row`);
  }
  return row.map((value,index)=>finite(value,`${label}[${index}]`));
}

function appendRow(baseRows,row) {
  return [...baseRows.map(existing=>[...existing]), [...row]];
}

function apertureAudit(geometry) {
  return auditTypedEpistemicDeficit({
    latent_dimension:geometry.latent_dimension,
    current_rank:geometry.rank,
    sigma_min:geometry.sigma_min,
    condition_number:geometry.condition_number,
    ...LOCAL_THRESHOLDS
  });
}

function evaluatePostRow(row) {
  const normalized = row2(row,'post-question row');
  const geometry = operatorGeometry(appendRow(CURRENT_OPERATOR,normalized));
  const aperture = apertureAudit(geometry);
  const healthy =
    aperture.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
    aperture.disposition === 'ASK_NOTHING';
  return deepFreeze({
    q_post:normalized,
    geometry,
    aperture,
    healthy
  });
}

function rowKey(row) {
  return row2(row,'family member').map(value=>Object.is(value,-0) ? 0 : value).join(',');
}

function exactRowsEqual(left,right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((row,index)=>stable(row2(row,`left[${index}]`)) === stable(row2(right[index],`right[${index}]`)));
}

function expectedCandidate(candidateId) {
  return FROZEN_CANDIDATES.find(candidate=>candidate.candidate_id === candidateId) || null;
}

export function validateTransitionCandidateDefinition(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate must be an object');
  const id = String(candidate.candidate_id || '');
  const expected = expectedCandidate(id);
  if (!expected) throw new Error('REJECT_UNKNOWN_CANDIDATE');

  if (candidate.transition_knowledge !== expected.transition_knowledge) {
    throw new Error('REJECT_TRANSITION_KNOWLEDGE_LAUNDERING');
  }

  if (stable(row2(candidate.q_pre,`${id}.q_pre`)) !== stable(expected.q_pre)) {
    throw new Error('REJECT_PRE_QUESTION_GEOMETRY_MUTATION');
  }

  if (candidate.majority_vote_used !== false) {
    throw new Error('REJECT_MAJORITY_VOTE');
  }

  if (expected.transition_knowledge === 'UNMODELED') {
    if (candidate.nominal_q_post != null || candidate.transition_family != null) {
      throw new Error('REJECT_UNMODELED_IDENTITY_LAUNDERING');
    }
    if (candidate.family_representation != null) {
      throw new Error('REJECT_FAMILY_COLLAPSE');
    }
    return true;
  }

  if (candidate.nominal_q_post == null || stable(row2(candidate.nominal_q_post,`${id}.nominal_q_post`)) !== stable(expected.nominal_q_post)) {
    throw new Error('REJECT_NOMINAL_TRANSITION_MISMATCH');
  }

  if (expected.transition_knowledge === 'DECLARED') {
    if (candidate.transition_family != null || candidate.family_representation != null) {
      throw new Error('REJECT_DECLARED_POINT_FAMILY_LAUNDERING');
    }
    return true;
  }

  if (candidate.family_representation !== 'COMPLETE_DECLARED_SET') {
    throw new Error('REJECT_FAMILY_COLLAPSE');
  }
  if (!Array.isArray(candidate.transition_family) || candidate.transition_family.length === 0) {
    throw new Error('REJECT_FAMILY_MEMBERSHIP_MISMATCH');
  }

  const keys = candidate.transition_family.map(rowKey);
  if (new Set(keys).size !== keys.length) {
    throw new Error('REJECT_DUPLICATE_FAMILY_MEMBER');
  }

  if (!exactRowsEqual(candidate.transition_family,expected.transition_family)) {
    throw new Error('REJECT_FAMILY_MEMBERSHIP_MISMATCH');
  }

  return true;
}

export function evaluateTransitionCandidate(candidate) {
  validateTransitionCandidateDefinition(candidate);
  const id = candidate.candidate_id;
  const preGeometry = operatorGeometry(appendRow(CURRENT_OPERATOR,row2(candidate.q_pre,`${id}.q_pre`)));
  const preAperture = apertureAudit(preGeometry);
  const preQuestion = deepFreeze({geometry:preGeometry,aperture:preAperture});

  if (candidate.transition_knowledge === 'UNMODELED') {
    return deepFreeze({
      candidate_id:id,
      transition_knowledge:'UNMODELED',
      pre_question:preQuestion,
      nominal_post_question:null,
      family_members:[],
      family_size:0,
      healthy_member_count:0,
      unhealthy_member_count:0,
      family_outcome:'TRANSITION_MODEL_UNDECLARED',
      disposition:'ABSTAIN_BEFORE_ROBUST_COUNTERFACTUAL_REAUDIT',
      worst_condition_number:null,
      ranking_eligible:false,
      majority_vote_used:false,
      automatic_execution:false,
      promotion_authority:false
    });
  }

  const nominal = evaluatePostRow(candidate.nominal_q_post);

  if (candidate.transition_knowledge === 'DECLARED') {
    return deepFreeze({
      candidate_id:id,
      transition_knowledge:'DECLARED',
      pre_question:preQuestion,
      nominal_post_question:nominal,
      family_members:[nominal],
      family_size:1,
      healthy_member_count:Number(nominal.healthy),
      unhealthy_member_count:Number(!nominal.healthy),
      family_outcome:nominal.healthy ? 'POINT_ADMISSIBLE' : 'POINT_INADMISSIBLE',
      disposition:nominal.aperture.disposition,
      worst_condition_number:nominal.geometry.condition_number,
      ranking_eligible:nominal.healthy,
      majority_vote_used:false,
      automatic_execution:false,
      promotion_authority:false
    });
  }

  const members = candidate.transition_family.map(evaluatePostRow);
  const healthyCount = members.filter(member=>member.healthy).length;
  const familySize = members.length;
  const familyOutcome = healthyCount === familySize
    ? 'ROBUSTLY_ADMISSIBLE'
    : healthyCount === 0
      ? 'ROBUSTLY_INADMISSIBLE'
      : 'TRANSITION_FAMILY_DECISION_UNRESOLVED';

  return deepFreeze({
    candidate_id:id,
    transition_knowledge:'SET_IDENTIFIED',
    pre_question:preQuestion,
    nominal_post_question:nominal,
    family_members:members,
    family_size:familySize,
    healthy_member_count:healthyCount,
    unhealthy_member_count:familySize-healthyCount,
    family_outcome:familyOutcome,
    disposition:familyOutcome === 'ROBUSTLY_ADMISSIBLE'
      ? 'ADMIT_ROBUST_CANDIDATE'
      : familyOutcome === 'ROBUSTLY_INADMISSIBLE'
        ? 'EXCLUDE_ROBUST_CANDIDATE'
        : 'HOLD_TRANSITION_FAMILY_DECISION_UNRESOLVED',
    worst_condition_number:Math.max(...members.map(member=>member.geometry.condition_number)),
    ranking_eligible:familyOutcome === 'ROBUSTLY_ADMISSIBLE',
    majority_vote_used:false,
    automatic_execution:false,
    promotion_authority:false
  });
}

export function nominalOnlyHostileSelector(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    throw new TypeError('evaluations must be a non-empty array');
  }
  const eligible = evaluations
    .filter(item=>item?.nominal_post_question?.healthy === true)
    .sort((left,right)=>
      left.nominal_post_question.geometry.condition_number - right.nominal_post_question.geometry.condition_number ||
      left.candidate_id.localeCompare(right.candidate_id)
    );
  return deepFreeze({
    selection_rule:'HOSTILE_NOMINAL_POST_QUESTION_POINT_ONLY',
    selected_candidate_id:eligible[0]?.candidate_id || null,
    transition_family_consulted:false,
    automatic_execution:false
  });
}

export function robustTransitionFamilySelector(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    throw new TypeError('evaluations must be a non-empty array');
  }
  const eligible = evaluations
    .filter(item=>item?.ranking_eligible === true)
    .sort((left,right)=>
      left.worst_condition_number - right.worst_condition_number ||
      left.candidate_id.localeCompare(right.candidate_id)
    );
  return deepFreeze({
    selection_rule:'COMPLETE_TRANSITION_FAMILY_TYPED_REAUDIT_THEN_WORST_LOCAL_CONDITION',
    selected_candidate_id:eligible[0]?.candidate_id || null,
    transition_family_consulted:true,
    majority_vote_used:false,
    automatic_execution:false,
    promotion_authority:false
  });
}

function hostilePass(mutator, expectedPattern) {
  const candidate = clone(mutator.source);
  mutator.apply(candidate);
  try {
    validateTransitionCandidateDefinition(candidate);
    return false;
  } catch (error) {
    return expectedPattern.test(String(error?.message || error));
  }
}

export function runTransitionFamilyDefinitionHostiles() {
  const robust = expectedCandidate('Q_ROBUST_FAMILY');
  const mixed = expectedCandidate('Q_MIXED_FAMILY');
  const unmodeled = expectedCandidate('Q_UNMODELED');

  return deepFreeze({
    dropped_adverse_member_rejected:hostilePass({
      source:mixed,
      apply:candidate=>{ candidate.transition_family.splice(1,1); }
    },/REJECT_FAMILY_MEMBERSHIP_MISMATCH/),
    duplicate_member_rejected:hostilePass({
      source:mixed,
      apply:candidate=>{ candidate.transition_family.push([0,1]); }
    },/REJECT_DUPLICATE_FAMILY_MEMBER/),
    collapsed_family_rejected:hostilePass({
      source:mixed,
      apply:candidate=>{
        candidate.family_representation='COLLAPSED_REPRESENTATIVE';
        candidate.transition_family=[[2/3,1/3000]];
      }
    },/REJECT_FAMILY_COLLAPSE/),
    majority_vote_rejected:hostilePass({
      source:mixed,
      apply:candidate=>{ candidate.majority_vote_used=true; }
    },/REJECT_MAJORITY_VOTE/),
    set_to_declared_laundering_rejected:hostilePass({
      source:mixed,
      apply:candidate=>{
        candidate.transition_knowledge='DECLARED';
        candidate.transition_family=null;
        candidate.family_representation=null;
      }
    },/REJECT_TRANSITION_KNOWLEDGE_LAUNDERING/),
    unmodeled_identity_laundering_rejected:hostilePass({
      source:unmodeled,
      apply:candidate=>{ candidate.nominal_q_post=[0,1]; }
    },/REJECT_UNMODELED_IDENTITY_LAUNDERING/),
    undeclared_member_rejected:hostilePass({
      source:robust,
      apply:candidate=>{ candidate.transition_family.push([0.4,1]); }
    },/REJECT_FAMILY_MEMBERSHIP_MISMATCH/)
  });
}

export function buildTransitionFamilyRobustnessFixture() {
  return deepFreeze({
    current_operator:clone(CURRENT_OPERATOR),
    local_thresholds:clone(LOCAL_THRESHOLDS),
    candidates:clone(FROZEN_CANDIDATES)
  });
}

export function runTransitionFamilyRobustnessGauntlet() {
  const fixture = buildTransitionFamilyRobustnessFixture();
  const sourceBefore = stable(fixture);
  const currentGeometry = operatorGeometry(fixture.current_operator);
  const currentAperture = apertureAudit(currentGeometry);
  const evaluations = fixture.candidates.map(evaluateTransitionCandidate);
  const byId = Object.fromEntries(evaluations.map(item=>[item.candidate_id,item]));
  const nominalSelector = nominalOnlyHostileSelector(evaluations);
  const robustSelector = robustTransitionFamilySelector(evaluations);
  const hostiles = runTransitionFamilyDefinitionHostiles();

  const mixedClasses = byId.Q_MIXED_FAMILY.family_members.map(member=>member.aperture.deficit_class);
  const allHostilesRejected = Object.values(hostiles).every(Boolean);

  const passed =
    currentGeometry.rank === 1 &&
    currentAperture.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    currentAperture.disposition === 'PROPOSE' &&
    evaluations.every(item=>item.pre_question.geometry.rank === 2) &&
    evaluations.every(item=>item.pre_question.aperture.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT') &&
    byId.Q_DECLARED_STABLE.family_outcome === 'POINT_ADMISSIBLE' &&
    byId.Q_DECLARED_STABLE.ranking_eligible === true &&
    byId.Q_ROBUST_FAMILY.family_outcome === 'ROBUSTLY_ADMISSIBLE' &&
    byId.Q_ROBUST_FAMILY.healthy_member_count === 3 &&
    byId.Q_ROBUST_FAMILY.ranking_eligible === true &&
    byId.Q_MIXED_FAMILY.family_outcome === 'TRANSITION_FAMILY_DECISION_UNRESOLVED' &&
    byId.Q_MIXED_FAMILY.healthy_member_count === 1 &&
    mixedClasses.includes('NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT') &&
    mixedClasses.includes('STRUCTURAL_RANK_DEFICIT') &&
    mixedClasses.includes('NUMERICAL_STABILITY_DEFICIT') &&
    byId.Q_MIXED_FAMILY.ranking_eligible === false &&
    byId.Q_BAD_FAMILY.family_outcome === 'ROBUSTLY_INADMISSIBLE' &&
    byId.Q_BAD_FAMILY.healthy_member_count === 0 &&
    byId.Q_BAD_FAMILY.ranking_eligible === false &&
    byId.Q_UNMODELED.family_outcome === 'TRANSITION_MODEL_UNDECLARED' &&
    byId.Q_UNMODELED.disposition === 'ABSTAIN_BEFORE_ROBUST_COUNTERFACTUAL_REAUDIT' &&
    byId.Q_UNMODELED.ranking_eligible === false &&
    nominalSelector.selected_candidate_id === 'Q_MIXED_FAMILY' &&
    robustSelector.selected_candidate_id === 'Q_DECLARED_STABLE' &&
    byId.Q_DECLARED_STABLE.worst_condition_number < byId.Q_ROBUST_FAMILY.worst_condition_number &&
    allHostilesRejected &&
    stable(fixture) === sourceBefore;

  if (!passed) {
    throw new Error('Transition-family robustness gauntlet violated a frozen expectation.');
  }

  return deepFreeze({
    schema:TRANSITION_FAMILY_ROBUSTNESS_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    current:deepFreeze({geometry:currentGeometry,aperture:currentAperture}),
    candidates:evaluations,
    nominal_only_hostile_selector:nominalSelector,
    robust_transition_family_selector:robustSelector,
    hostile_rejections:hostiles,
    all_hostiles_rejected:allHostilesRejected,
    source_inputs_preserved:stable(fixture) === sourceBefore,
    gauntlet_status:'TRANSITION_FAMILY_ROBUSTNESS_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'declared transition uncertainty can be audited as a complete compatible family without collapsing that family to a nominal point, separating robust admission, robust exclusion, family-level decision unresolved, and fully unmodeled abstention',
    anti_equivalences:deepFreeze([
      'transition uncertainty != transition ignorance',
      'nominal transition health != robust transition-family health',
      'full rank != sufficient stability',
      'family member count != probability weight',
      'majority family members != robust admission',
      'family averaging != family audit',
      'set-identified transition != declared point transition',
      'unmodeled transition != identity transition',
      'robust family audit != system identification',
      'robust family audit != robust-control optimality',
      'counterfactual transition audit != experiment execution'
    ]),
    next_learning_action:'TEST_TRANSITION_OPERATOR_IDENTIFIABILITY_FROM_PARTIAL_INPUT_OUTPUT_PROBES_WITH_EXPLICIT_OPERATOR_COMPATIBLE_FAMILY_NULLSPACE_CONDITIONING_HELDOUT_PREDICTION_AND_OPEN_SET_OPERATOR_CONTROLS_BEFORE_ANY_OPERATOR_TOMOGRAPHY_PATH_TRANSPORT_OR_HOLONOMY_PROMOTION',
    claims:deepFreeze({
      robust_bayesian_experimental_design_theorem:false,
      maximin_optimality:false,
      robust_control_theorem:false,
      active_learning_optimality:false,
      pomdp_theorem:false,
      dual_control_theorem:false,
      transition_probability_model:false,
      transition_distribution_calibration:false,
      system_identification:false,
      operator_identification:false,
      operator_tomography:false,
      path_category_theorem:false,
      path_dependent_transport_theorem:false,
      loop_endomorphism:false,
      holonomy:false,
      curvature:false,
      berry_structure:false,
      quantum_measurement_disturbance:false,
      physical_sensing_law:false,
      physical_tomography:false,
      blind_tomography:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
      live_ash_recovery:false,
      production_authority:false,
      vercel_authority:false
    }),
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    automatic_observation:false,
    automatic_experiment_execution:false,
    sequence_authority:false,
    promotion_authority:false,
    production_mutation:false,
    human_closure_required:true
  });
}
