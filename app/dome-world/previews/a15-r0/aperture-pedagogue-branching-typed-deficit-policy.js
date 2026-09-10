import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';

export const BRANCHING_TYPED_DEFICIT_POLICY_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-branching-typed-deficit-policy/v0.1';

const EPSILON = 0.001;
const TOLERANCE = 1e-10;
const ANCHOR = Object.freeze([1, 0]);
const INITIAL = Object.freeze([1, 0]);
const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  uncertainty_status:'VALID_DECLARED',
  threshold_authority:'A15_R0_SYNTHETIC_LOCAL'
});

export const Q_BRANCH_STRUCTURAL = Object.freeze([
  Object.freeze([2,0]),
  Object.freeze([0,1])
]);
export const Q_BRANCH_NUMERICAL = Object.freeze([
  Object.freeze([1,0]),
  Object.freeze([EPSILON,1])
]);
export const Q_RANK_REPAIR = Object.freeze([
  Object.freeze([0,1/EPSILON]),
  Object.freeze([0.5,-1/(2*EPSILON)])
]);
export const Q_STABILITY_REPAIR = Object.freeze([
  Object.freeze([0.5,-1/(2*EPSILON)]),
  Object.freeze([0,1/EPSILON])
]);

const POLICY = Object.freeze({
  STRUCTURAL_RANK_DEFICIT:'Q_RANK_REPAIR',
  NUMERICAL_STABILITY_DEFICIT:'Q_STABILITY_REPAIR',
  NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT:'ASK_NOTHING'
});

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function row2(row, label='row') {
  if (!Array.isArray(row) || row.length !== 2) throw new TypeError(`${label} must contain two values`);
  return row.map((value,index) => {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new TypeError(`${label}[${index}] must be finite`);
    return number;
  });
}

function matrix2(matrix, label='matrix') {
  if (!Array.isArray(matrix) || matrix.length !== 2) throw new TypeError(`${label} must be 2x2`);
  return matrix.map((row,index) => row2(row, `${label}[${index}]`));
}

export function multiplyMatrixVector(matrix, vector) {
  const m = matrix2(matrix);
  const v = row2(vector, 'vector');
  return freeze([
    m[0][0]*v[0] + m[0][1]*v[1],
    m[1][0]*v[0] + m[1][1]*v[1]
  ]);
}

function auditRow(row) {
  const geometry = operatorGeometry([ANCHOR,row2(row)]);
  const aperture = auditTypedEpistemicDeficit({
    latent_dimension:geometry.latent_dimension,
    current_rank:geometry.rank,
    sigma_min:geometry.sigma_min,
    condition_number:geometry.condition_number,
    ...LOCAL_THRESHOLDS
  });
  return freeze({ geometry, aperture });
}

function firstBranch(branchId) {
  if (branchId === 'STRUCTURAL') {
    const row = multiplyMatrixVector(Q_BRANCH_STRUCTURAL, INITIAL);
    return freeze({ branch_id:branchId, first_question:'Q_BRANCH_STRUCTURAL', row, audit:auditRow(row) });
  }
  if (branchId === 'NUMERICAL') {
    const row = multiplyMatrixVector(Q_BRANCH_NUMERICAL, INITIAL);
    return freeze({ branch_id:branchId, first_question:'Q_BRANCH_NUMERICAL', row, audit:auditRow(row) });
  }
  throw new Error(`Unknown branch ${branchId}`);
}

export function selectQuestionFamilyFromTypedDeficit(deficitClass) {
  const normalized = String(deficitClass || '');
  const action = POLICY[normalized] || 'ABSTAIN_POLICY_STATE_UNDECLARED';
  return freeze({
    deficit_class:normalized,
    action,
    branch_identity_consulted:false,
    terminal_outcomes_consulted:false,
    consequence_losses_consulted:false,
    automatic_execution:false,
    promotion_authority:false
  });
}

function repairMatrix(questionId) {
  if (questionId === 'Q_RANK_REPAIR') return Q_RANK_REPAIR;
  if (questionId === 'Q_STABILITY_REPAIR') return Q_STABILITY_REPAIR;
  return null;
}

function consequenceFor(aperture) {
  if (aperture.disposition === 'ASK_NOTHING') {
    return freeze({ recommended_action:'STOP', stop_loss:0, continue_loss:1 });
  }
  if (aperture.disposition === 'PROPOSE') {
    return freeze({ recommended_action:'CONTINUE_ONE_DECLARED_QUESTION', stop_loss:5, continue_loss:1 });
  }
  return freeze({ recommended_action:'ABSTAIN', stop_loss:null, continue_loss:null });
}

function applySecondQuestion(branch, questionId) {
  if (questionId === 'ASK_NOTHING') {
    return freeze({
      ...branch,
      second_question:null,
      second_applied:false,
      terminal_row:branch.row,
      terminal_audit:branch.audit,
      consequence:consequenceFor(branch.audit.aperture),
      question_count:1
    });
  }
  const matrix = repairMatrix(questionId);
  if (!matrix) {
    return freeze({
      ...branch,
      second_question:null,
      second_applied:false,
      terminal_row:branch.row,
      terminal_audit:branch.audit,
      consequence:freeze({ recommended_action:'ABSTAIN', stop_loss:null, continue_loss:null }),
      question_count:1,
      policy_status:'ABSTAIN_POLICY_STATE_UNDECLARED'
    });
  }
  const terminalRow = multiplyMatrixVector(matrix, branch.row);
  const terminalAudit = auditRow(terminalRow);
  return freeze({
    ...branch,
    second_question:questionId,
    second_applied:true,
    terminal_row:terminalRow,
    terminal_audit:terminalAudit,
    consequence:consequenceFor(terminalAudit.aperture),
    question_count:2,
    policy_status:'COUNTERFACTUAL_REPLAY_COMPLETE'
  });
}

export function replayTypedBranchingPolicy(branchId) {
  const branch = firstBranch(branchId);
  const selection = selectQuestionFamilyFromTypedDeficit(branch.audit.aperture.deficit_class);
  const replay = applySecondQuestion(branch, selection.action);
  return freeze({ ...replay, selection });
}

export function replayFixedSecondQuestion(branchId, questionId) {
  const branch = firstBranch(branchId);
  return freeze({
    ...applySecondQuestion(branch, questionId),
    selection:freeze({
      deficit_class:branch.audit.aperture.deficit_class,
      action:questionId,
      policy_mode:'FIXED_SECOND_QUESTION_CONTROL',
      branch_identity_consulted:false,
      terminal_outcomes_consulted:false,
      automatic_execution:false
    })
  });
}

export function runBranchingTypedDeficitPolicyGauntlet() {
  const structural = firstBranch('STRUCTURAL');
  const numerical = firstBranch('NUMERICAL');
  const adaptiveStructural = replayTypedBranchingPolicy('STRUCTURAL');
  const adaptiveNumerical = replayTypedBranchingPolicy('NUMERICAL');
  const fixedRank = freeze([
    replayFixedSecondQuestion('STRUCTURAL','Q_RANK_REPAIR'),
    replayFixedSecondQuestion('NUMERICAL','Q_RANK_REPAIR')
  ]);
  const fixedStability = freeze([
    replayFixedSecondQuestion('STRUCTURAL','Q_STABILITY_REPAIR'),
    replayFixedSecondQuestion('NUMERICAL','Q_STABILITY_REPAIR')
  ]);
  const adaptive = freeze([adaptiveStructural,adaptiveNumerical]);
  const closureCount = routes => routes.filter(route => route.terminal_audit.aperture.disposition === 'ASK_NOTHING').length;
  const unknown = selectQuestionFamilyFromTypedDeficit('UNDECLARED_DEFICIT');
  const healthy = selectQuestionFamilyFromTypedDeficit('NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');

  const passed =
    structural.audit.aperture.deficit_class === 'STRUCTURAL_RANK_DEFICIT' &&
    structural.audit.aperture.disposition === 'PROPOSE' &&
    numerical.audit.aperture.deficit_class === 'NUMERICAL_STABILITY_DEFICIT' &&
    numerical.audit.aperture.disposition === 'PROPOSE' &&
    adaptiveStructural.selection.action === 'Q_RANK_REPAIR' &&
    adaptiveNumerical.selection.action === 'Q_STABILITY_REPAIR' &&
    adaptiveStructural.terminal_audit.aperture.disposition === 'ASK_NOTHING' &&
    adaptiveNumerical.terminal_audit.aperture.disposition === 'ASK_NOTHING' &&
    closureCount(adaptive) === 2 &&
    closureCount(fixedRank) === 1 &&
    closureCount(fixedStability) === 1 &&
    fixedRank.every(route => route.question_count === 2) &&
    fixedStability.every(route => route.question_count === 2) &&
    adaptive.every(route => route.question_count === 2) &&
    unknown.action === 'ABSTAIN_POLICY_STATE_UNDECLARED' &&
    healthy.action === 'ASK_NOTHING' &&
    adaptive.every(route => route.selection.branch_identity_consulted === false) &&
    adaptive.every(route => route.selection.terminal_outcomes_consulted === false) &&
    adaptive.every(route => route.selection.consequence_losses_consulted === false);

  if (!passed) throw new Error('Branching typed-deficit policy gauntlet violated an authored expectation.');

  return freeze({
    schema:BRANCHING_TYPED_DEFICIT_POLICY_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    branches:freeze({ structural, numerical }),
    typed_policy:freeze({
      routes:adaptive,
      closure_count:closureCount(adaptive),
      branch_count:adaptive.length,
      classification:'TYPED_DEFICIT_BRANCHING_POLICY_SEPARATES_AUTHORED_TWO_BRANCH_REPAIR_TASK'
    }),
    fixed_controls:freeze({
      rank_repair:freeze({ routes:fixedRank, closure_count:closureCount(fixedRank) }),
      stability_repair:freeze({ routes:fixedStability, closure_count:closureCount(fixedStability) })
    }),
    controls:freeze({ unknown_state:unknown, healthy_state:healthy }),
    consequence_ledger_post_terminal_reaudit:true,
    matched_max_question_budget:2,
    scalar_utility_crown:false,
    gauntlet_status:'BRANCHING_TYPED_DEFICIT_POLICY_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'within this authored finite route tree, post-first-step typed deficit class can route between two preregistered repair-question families so both branches close under the same maximum question budget while either fixed repair closes only one branch',
    anti_equivalences:freeze([
      'typed branch table != active learning',
      'typed branch table != optimal experimental design',
      '2/2 authored branch closure != global policy superiority',
      'matched question count != matched information cost',
      'deficit class != sufficient policy state by assumption',
      'terminal consequence != selection criterion',
      'counterfactual policy replay != autonomous experiment execution',
      'branch-conditioned repair != holonomy'
    ]),
    next_learning_action:'TEST_TYPED_POLICY_STATE_ALIASING_WHERE_DISTINCT_POST_FIRST_STEP_OPERATORS_SHARE_THE_SAME_DEFICIT_CLASS_AND_MATCHED_CONDITIONING_BAND_TO_DETERMINE_WHETHER_DEFICIT_CLASS_ALONE_IS_AN_INSUFFICIENT_BRANCH_STATE_BEFORE_ANY_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION',
    claims:freeze({
      active_learning_policy:false,
      reinforcement_learning_policy:false,
      optimal_experimental_design:false,
      expected_utility_theorem:false,
      policy_state_sufficiency:false,
      connection:false,
      curvature:false,
      berry_structure:false,
      holonomy:false,
      physical_sensor_feedback:false,
      physical_tomography:false,
      quantum_measurement_disturbance:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
      autonomous_experiment_execution:false,
      production_authority:false,
      vercel_authority:false
    }),
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    production_mutated:false,
    promotion_authority:false,
    human_closure_required:true
  });
}
