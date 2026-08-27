import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';

export const ENDOGENOUS_OBSERVATION_REAUDIT_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-endogenous-observation-reaudit/v0.1';

const EPSILON = 1e-12;
const RANK_DEFICIENT_CONDITION_SENTINEL = 1e12;
const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor: 0.25,
  condition_number_ceiling: 10,
  uncertainty_status: 'VALID_DECLARED',
  threshold_authority: 'A15_R0_SYNTHETIC_LOCAL'
});

const CURRENT_OPERATOR = Object.freeze([Object.freeze([1, 0])]);
const CONTROL_OPERATOR = Object.freeze([Object.freeze([1, 0]), Object.freeze([0, 1])]);
const CANDIDATES = Object.freeze([
  Object.freeze({ candidate_id:'Q_COLLAPSE', q_pre:Object.freeze([0,1]), q_post:Object.freeze([1,0]), transition_status:'DECLARED_SYNTHETIC' }),
  Object.freeze({ candidate_id:'Q_FRAGILE', q_pre:Object.freeze([0,1]), q_post:Object.freeze([1,0.001]), transition_status:'DECLARED_SYNTHETIC' }),
  Object.freeze({ candidate_id:'Q_STABLE', q_pre:Object.freeze([1,1]), q_post:Object.freeze([0,1]), transition_status:'DECLARED_SYNTHETIC' }),
  Object.freeze({ candidate_id:'Q_UNKNOWN', q_pre:Object.freeze([0,1]), q_post:null, transition_status:'UNDECLARED' })
]);

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function row2(row, label) {
  if (!Array.isArray(row) || row.length !== 2) throw new TypeError(`${label} must be a two-component row`);
  return row.map((value, index) => finite(value, `${label}[${index}]`));
}

export function operatorGeometry(rows = []) {
  if (!Array.isArray(rows) || rows.length < 1) throw new TypeError('rows must contain at least one observation row');
  const normalized = rows.map((row, index) => row2(row, `rows[${index}]`));
  let g00 = 0;
  let g01 = 0;
  let g11 = 0;
  for (const [a,b] of normalized) {
    g00 += a*a;
    g01 += a*b;
    g11 += b*b;
  }
  const trace = g00 + g11;
  const determinant = Math.max(0, g00*g11 - g01*g01);
  const discriminant = Math.sqrt(Math.max(0, trace*trace - 4*determinant));
  const lambdaMax = Math.max(0, (trace + discriminant)/2);
  const lambdaMin = Math.max(0, (trace - discriminant)/2);
  const sigmaMax = Math.sqrt(lambdaMax);
  const sigmaMinRaw = Math.sqrt(lambdaMin);
  const rank = Number(sigmaMax > EPSILON) + Number(sigmaMinRaw > EPSILON);
  const sigmaMin = rank < 2 ? 0 : sigmaMinRaw;
  const conditionNumber = rank < 2 ? RANK_DEFICIENT_CONDITION_SENTINEL : sigmaMax/sigmaMin;
  return deepFreeze({
    rows:normalized,
    latent_dimension:2,
    rank,
    nullity:2-rank,
    sigma_min:sigmaMin,
    sigma_max:sigmaMax,
    condition_number:conditionNumber,
    gram:deepFreeze([deepFreeze([g00,g01]),deepFreeze([g01,g11])])
  });
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

function appendRow(baseRows, row) {
  return [...baseRows.map(existing => [...existing]), [...row]];
}

export function evaluateEndogenousCandidate(candidate, baseRows = CURRENT_OPERATOR) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate must be an object');
  const id = String(candidate.candidate_id || 'UNNAMED');
  const qPre = row2(candidate.q_pre, `${id}.q_pre`);
  const preGeometry = operatorGeometry(appendRow(baseRows,qPre));
  const preAudit = apertureAudit(preGeometry);

  if (candidate.transition_status !== 'DECLARED_SYNTHETIC' || candidate.q_post == null) {
    return deepFreeze({
      candidate_id:id,
      transition_status:String(candidate.transition_status || 'UNDECLARED'),
      pre_question:deepFreeze({geometry:preGeometry,aperture:preAudit}),
      post_question:null,
      status:'POST_QUESTION_OPERATOR_MODEL_INCOMPLETE',
      disposition:'ABSTAIN_BEFORE_COUNTERFACTUAL_REAUDIT',
      healthy_after_declared_transition:false,
      ranking_eligible:false,
      automatic_execution:false,
      promotion_authority:false
    });
  }

  const qPost = row2(candidate.q_post, `${id}.q_post`);
  const postGeometry = operatorGeometry(appendRow(baseRows,qPost));
  const postAudit = apertureAudit(postGeometry);
  const healthy = postAudit.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' && postAudit.disposition === 'ASK_NOTHING';
  return deepFreeze({
    candidate_id:id,
    transition_status:'DECLARED_SYNTHETIC',
    pre_question:deepFreeze({geometry:preGeometry,aperture:preAudit}),
    post_question:deepFreeze({geometry:postGeometry,aperture:postAudit}),
    status:healthy ? 'POST_QUESTION_HEALTHY' : 'POST_QUESTION_REAUDIT_REQUIRES_MORE_WORK',
    disposition:postAudit.disposition,
    healthy_after_declared_transition:healthy,
    ranking_eligible:healthy,
    automatic_execution:false,
    promotion_authority:false
  });
}

export function evaluateCandidateFamily(candidates = CANDIDATES) {
  if (!Array.isArray(candidates) || candidates.length === 0) throw new TypeError('candidates must be a non-empty array');
  return deepFreeze(candidates.map(candidate => evaluateEndogenousCandidate(candidate)));
}

export function naivePreQuestionSelector(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) throw new TypeError('evaluations must be a non-empty array');
  const eligible = evaluations
    .filter(item => item?.pre_question?.aperture?.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT')
    .sort((left,right) => left.pre_question.geometry.condition_number - right.pre_question.geometry.condition_number || left.candidate_id.localeCompare(right.candidate_id));
  return deepFreeze({
    selection_rule:'NAIVE_PRE_QUESTION_CONDITION_ONLY',
    selected_candidate_id:eligible[0]?.candidate_id || null,
    post_question_reaudit_consulted:false,
    automatic_execution:false
  });
}

export function postQuestionReauditSelector(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) throw new TypeError('evaluations must be a non-empty array');
  const eligible = evaluations
    .filter(item => item?.ranking_eligible === true)
    .sort((left,right) => left.post_question.geometry.condition_number - right.post_question.geometry.condition_number || left.candidate_id.localeCompare(right.candidate_id));
  return deepFreeze({
    selection_rule:'POST_QUESTION_TYPED_REAUDIT_THEN_LOCAL_STABILITY',
    selected_candidate_id:eligible[0]?.candidate_id || null,
    post_question_reaudit_consulted:true,
    automatic_execution:false,
    promotion_authority:false
  });
}

function noDeficitControl() {
  const geometry = operatorGeometry(CONTROL_OPERATOR);
  const aperture = apertureAudit(geometry);
  return deepFreeze({
    geometry,
    aperture,
    candidate_library_present:true,
    candidate_ranking_allowed:aperture.disposition === 'PROPOSE',
    selected_candidate_id:null
  });
}

export function runEndogenousObservationReauditGauntlet() {
  const currentGeometry = operatorGeometry(CURRENT_OPERATOR);
  const currentAperture = apertureAudit(currentGeometry);
  const evaluations = evaluateCandidateFamily(CANDIDATES);
  const byId = Object.fromEntries(evaluations.map(item => [item.candidate_id,item]));
  const naive = naivePreQuestionSelector(evaluations);
  const reaudit = postQuestionReauditSelector(evaluations);
  const control = noDeficitControl();
  const collapse = byId.Q_COLLAPSE;
  const fragile = byId.Q_FRAGILE;
  const stable = byId.Q_STABLE;
  const unknown = byId.Q_UNKNOWN;

  const passed =
    currentGeometry.rank === 1 &&
    currentAperture.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    currentAperture.disposition === 'PROPOSE' &&
    collapse.pre_question.geometry.rank === 2 &&
    fragile.pre_question.geometry.rank === 2 &&
    stable.pre_question.geometry.rank === 2 &&
    collapse.post_question.geometry.rank === 1 &&
    collapse.post_question.aperture.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    fragile.post_question.geometry.rank === 2 &&
    fragile.post_question.geometry.sigma_min > 0 &&
    fragile.post_question.geometry.sigma_min < 0.001 &&
    fragile.post_question.geometry.condition_number > 1000 &&
    fragile.post_question.aperture.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    stable.post_question.aperture.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
    stable.post_question.aperture.disposition === 'ASK_NOTHING' &&
    unknown.status === 'POST_QUESTION_OPERATOR_MODEL_INCOMPLETE' &&
    unknown.disposition === 'ABSTAIN_BEFORE_COUNTERFACTUAL_REAUDIT' &&
    unknown.ranking_eligible === false &&
    naive.selected_candidate_id === 'Q_COLLAPSE' &&
    reaudit.selected_candidate_id === 'Q_STABLE' &&
    control.aperture.deficit_class === 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT' &&
    control.aperture.disposition === 'ASK_NOTHING' &&
    control.candidate_ranking_allowed === false;

  if (!passed) throw new Error('Endogenous observation re-audit gauntlet violated an authored expectation.');

  return deepFreeze({
    schema:ENDOGENOUS_OBSERVATION_REAUDIT_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    current:deepFreeze({geometry:currentGeometry,aperture:currentAperture}),
    candidates:evaluations,
    naive_pre_question_selector:naive,
    post_question_reaudit_selector:reaudit,
    no_deficit_control:control,
    gauntlet_status:'ENDOGENOUS_OBSERVATION_REAUDIT_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'candidate-question admissibility may depend on the declared post-question observation/operator state, so pre-question admissibility does not substitute for counterfactual post-question re-audit when intervention dependence is part of the authored model',
    anti_equivalences:deepFreeze([
      'pre-question admissibility != post-question admissibility',
      'operator motion != information gain',
      'full rank != sufficient stability',
      'rank deficit != numerical fragility',
      'missing transition law != identity transition',
      'candidate available != question needed',
      'counterfactual re-audit != experiment execution',
      'synthetic intervention dependence != quantum measurement disturbance'
    ]),
    next_learning_action:'TEST_MULTI_STEP_ADAPTIVE_QUESTION_SEQUENCE_WHERE_QUESTION_ORDER_CHANGES_THE_FUTURE_OBSERVATION_OPERATOR_BEFORE_ANY_PATH_DEPENDENT_DESIGN_OR_HOLONOMY_PROMOTION',
    claims:deepFreeze({
      performative_prediction_theorem:false,
      causal_intervention_law:false,
      optimal_experimental_design:false,
      active_learning_optimality:false,
      physical_sensor_feedback:false,
      physical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      quantum_measurement_disturbance:false,
      berry_structure:false,
      physical_holonomy:false,
      continuum_holonomy:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
      autonomous_experiment_execution:false,
      production_authority:false,
      vercel_authority:false
    }),
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    automatic_observation:false,
    automatic_experiment_execution:false,
    promotion_authority:false,
    production_mutation:false,
    human_closure_required:true
  });
}
