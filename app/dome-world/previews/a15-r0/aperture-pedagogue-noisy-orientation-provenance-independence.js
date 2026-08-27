import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';
import {
  Q_PLUS_REPAIR,
  Q_MINUS_REPAIR
} from './aperture-pedagogue-typed-policy-state-aliasing.js';
import {
  multiplyMatrixVector
} from './aperture-pedagogue-adaptive-sequence-order.js';

export const NOISY_ORIENTATION_PROVENANCE_INDEPENDENCE_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-noisy-orientation-provenance-independence/v0.1';

const ANCHOR = Object.freeze([1,0]);
const OUTER_MAGNITUDES = Object.freeze([0.0008,0.001,0.0012]);
const VALID_ETAS = Object.freeze([-0.0002,0,0.0002]);
const VALID_BOUND = 0.0002;
const NEAR_ZERO_VALUES = Object.freeze([-0.0002,-0.0001,0,0.0001,0.0002]);
const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  uncertainty_status:'VALID_DECLARED',
  threshold_authority:'A15_R0_SYNTHETIC_LOCAL'
});
const ALLOWED_DERIVATION_KINDS = Object.freeze([
  'PRIMARY',
  'COPY_OF_ROOT',
  'INDEPENDENT_SYNTHETIC_ROOT'
]);

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

function auditRow(row) {
  const geometry = operatorGeometry([ANCHOR,row]);
  const aperture = auditTypedEpistemicDeficit({
    latent_dimension:geometry.latent_dimension,
    current_rank:geometry.rank,
    sigma_min:geometry.sigma_min,
    condition_number:geometry.condition_number,
    ...LOCAL_THRESHOLDS
  });
  return freeze({geometry,aperture});
}

function repairMatrix(action) {
  if (action === 'Q_PLUS_REPAIR') return Q_PLUS_REPAIR;
  if (action === 'Q_MINUS_REPAIR') return Q_MINUS_REPAIR;
  return null;
}

function replayRepair(trueY,action) {
  finite('trueY',trueY);
  const matrix = repairMatrix(action);
  if (!matrix) return freeze({
    action,
    repair_applied:false,
    closure:false,
    terminal_row:null,
    terminal_audit:null,
    counterfactual_only:true,
    observation_executed:false
  });
  const terminalRow = multiplyMatrixVector(matrix,[1,trueY]);
  const terminalAudit = auditRow(terminalRow);
  return freeze({
    action,
    repair_applied:true,
    closure:terminalAudit.aperture.disposition === 'ASK_NOTHING',
    terminal_row:freeze(terminalRow),
    terminal_audit:terminalAudit,
    counterfactual_only:true,
    observation_executed:false
  });
}

export function certifyOrientationSign({y_hat,bound}) {
  finite('y_hat',y_hat);
  finite('bound',bound);
  if (bound < 0) throw new RangeError('bound must be non-negative.');
  const lower = y_hat - bound;
  const upper = y_hat + bound;
  if (lower > 0) return freeze({
    interval:freeze([lower,upper]),
    orientation_status:'CERTIFIED_POSITIVE',
    disposition:'SELECT_DECLARED_REPAIR',
    selected_action:'Q_PLUS_REPAIR'
  });
  if (upper < 0) return freeze({
    interval:freeze([lower,upper]),
    orientation_status:'CERTIFIED_NEGATIVE',
    disposition:'SELECT_DECLARED_REPAIR',
    selected_action:'Q_MINUS_REPAIR'
  });
  return freeze({
    interval:freeze([lower,upper]),
    orientation_status:'ORIENTATION_UNRESOLVED',
    disposition:'ABSTAIN_ORIENTATION_UNRESOLVED',
    selected_action:null
  });
}

function evaluateOrientationCase({trueY,yHat,bound,actualEta=null,caseId}) {
  const certification = certifyOrientationSign({y_hat:yHat,bound});
  const replay = certification.selected_action
    ? replayRepair(trueY,certification.selected_action)
    : null;
  const trueSign = trueY > 0 ? 'POSITIVE' : trueY < 0 ? 'NEGATIVE' : 'ZERO';
  const certifiedSign = certification.orientation_status === 'CERTIFIED_POSITIVE'
    ? 'POSITIVE'
    : certification.orientation_status === 'CERTIFIED_NEGATIVE'
      ? 'NEGATIVE'
      : 'UNRESOLVED';
  const boundTruthAvailable = actualEta !== null;
  const declaredBoundHolds = boundTruthAvailable ? Math.abs(actualEta) <= bound + 1e-15 : null;
  const boundStatus = boundTruthAvailable && !declaredBoundHolds
    ? 'DECLARED_NOISE_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH'
    : 'DECLARED_NOISE_BOUND_NOT_FALSIFIED_IN_SYNTHETIC_FIXTURE';
  return freeze({
    case_id:caseId,
    true_y:trueY,
    y_hat:yHat,
    declared_bound:bound,
    actual_eta:actualEta,
    true_sign:trueSign,
    certified_sign:certifiedSign,
    certification,
    selected_repair_replay:replay,
    declared_bound_holds:declaredBoundHolds,
    bound_status:boundStatus,
    eligible_for_valid_bound_support:declaredBoundHolds !== false,
    correct_sign_certification:certifiedSign === trueSign,
    closure:replay ? replay.closure : false
  });
}

export function buildValidNoiseOuterCases() {
  const cases=[];
  for (const magnitude of OUTER_MAGNITUDES) {
    for (const sign of [1,-1]) {
      const trueY=sign*magnitude;
      for (const eta of VALID_ETAS) {
        cases.push(evaluateOrientationCase({
          trueY,
          yHat:trueY+eta,
          bound:VALID_BOUND,
          actualEta:eta,
          caseId:`OUTER_${sign > 0 ? 'POS' : 'NEG'}_${magnitude.toFixed(4)}_ETA_${eta.toFixed(4)}`
        }));
      }
    }
  }
  return freeze(cases);
}

export function buildNearZeroAmbiguityControls() {
  return freeze(NEAR_ZERO_VALUES.map(trueY => {
    const certification = certifyOrientationSign({y_hat:trueY,bound:VALID_BOUND});
    const plus = replayRepair(trueY,'Q_PLUS_REPAIR');
    const minus = replayRepair(trueY,'Q_MINUS_REPAIR');
    return freeze({
      case_id:`NEAR_ZERO_${trueY.toFixed(4)}`,
      true_y:trueY,
      certification,
      plus_repair:plus,
      minus_repair:minus,
      both_repairs_admissible:plus.closure && minus.closure
    });
  }));
}

export function buildUnderdeclaredNoiseFalsifier() {
  const trueY=0.0008;
  const yHat=-0.0001;
  const actualEta=yHat-trueY;
  return evaluateOrientationCase({
    trueY,
    yHat,
    bound:0.00005,
    actualEta,
    caseId:'UNDERDECLARED_NOISE_FALSIFIER'
  });
}

function validateWitness(record) {
  if (!record || typeof record !== 'object') throw new TypeError('witness must be an object.');
  for (const field of ['witness_id','source_root_id','route_value','derivation_kind']) {
    if (typeof record[field] !== 'string' || !record[field].length) throw new TypeError(`${field} must be a non-empty string.`);
  }
  if (!ALLOWED_DERIVATION_KINDS.includes(record.derivation_kind)) {
    throw new RangeError('derivation_kind must be preregistered.');
  }
  return record;
}

export function classifyProvenanceIndependence(records) {
  if (!Array.isArray(records) || records.length === 0) throw new TypeError('records must be a non-empty array.');
  const normalized=records.map(record => freeze({...validateWitness(record)}));
  const byRoot=new Map();
  for (const record of normalized) {
    if (!byRoot.has(record.source_root_id)) byRoot.set(record.source_root_id,[]);
    byRoot.get(record.source_root_id).push(record);
  }

  const rootSummaries=[];
  let internalConflict=false;
  for (const [sourceRootId,rootRecords] of byRoot.entries()) {
    const routeValues=[...new Set(rootRecords.map(record => record.route_value))];
    if (routeValues.length > 1) internalConflict=true;
    rootSummaries.push(freeze({
      source_root_id:sourceRootId,
      record_count:rootRecords.length,
      route_values:freeze(routeValues),
      internally_consistent:routeValues.length === 1
    }));
  }

  const rawRouteCounts={};
  for (const record of normalized) rawRouteCounts[record.route_value]=(rawRouteCounts[record.route_value] || 0)+1;

  if (internalConflict) return freeze({
    raw_record_count:normalized.length,
    unique_root_count:byRoot.size,
    independent_support_count:null,
    status:'SOURCE_ROOT_INTERNAL_CONFLICT_HOLD',
    resolved_route:null,
    duplicate_majority_vote_used:false,
    declared_synthetic_independence_only:true,
    root_summaries:freeze(rootSummaries),
    raw_route_counts:freeze(rawRouteCounts)
  });

  const rootRouteValues=rootSummaries.map(root => root.route_values[0]);
  const distinctRoutes=[...new Set(rootRouteValues)];
  if (distinctRoutes.length > 1) return freeze({
    raw_record_count:normalized.length,
    unique_root_count:byRoot.size,
    independent_support_count:null,
    status:'PROVENANCE_CONFLICT_HOLD',
    resolved_route:null,
    duplicate_majority_vote_used:false,
    declared_synthetic_independence_only:true,
    root_summaries:freeze(rootSummaries),
    raw_route_counts:freeze(rawRouteCounts)
  });

  const resolvedRoute=distinctRoutes[0];
  if (byRoot.size === 1) return freeze({
    raw_record_count:normalized.length,
    unique_root_count:1,
    independent_support_count:1,
    status:'SINGLE_ROOT_DUPLICATES_DO_NOT_AMPLIFY',
    resolved_route:resolvedRoute,
    duplicate_majority_vote_used:false,
    declared_synthetic_independence_only:true,
    root_summaries:freeze(rootSummaries),
    raw_route_counts:freeze(rawRouteCounts)
  });

  return freeze({
    raw_record_count:normalized.length,
    unique_root_count:byRoot.size,
    independent_support_count:byRoot.size,
    status:'MULTI_ROOT_AGREEMENT_IN_BOUNDED_SYNTHETIC_FIXTURE',
    resolved_route:resolvedRoute,
    duplicate_majority_vote_used:false,
    declared_synthetic_independence_only:true,
    root_summaries:freeze(rootSummaries),
    raw_route_counts:freeze(rawRouteCounts)
  });
}

export function buildProvenanceFixtures() {
  const P1=classifyProvenanceIndependence([
    {witness_id:'W1',source_root_id:'R1',route_value:'Q_A',derivation_kind:'PRIMARY'},
    {witness_id:'W2',source_root_id:'R1',route_value:'Q_A',derivation_kind:'COPY_OF_ROOT'}
  ]);
  const P2=classifyProvenanceIndependence([
    {witness_id:'W1',source_root_id:'R1',route_value:'Q_A',derivation_kind:'PRIMARY'},
    {witness_id:'W3',source_root_id:'R2',route_value:'Q_A',derivation_kind:'INDEPENDENT_SYNTHETIC_ROOT'}
  ]);
  const P3=classifyProvenanceIndependence([
    {witness_id:'W1',source_root_id:'R1',route_value:'Q_A',derivation_kind:'PRIMARY'},
    {witness_id:'W4',source_root_id:'R2',route_value:'Q_B',derivation_kind:'INDEPENDENT_SYNTHETIC_ROOT'}
  ]);
  const P4=classifyProvenanceIndependence([
    {witness_id:'W_BAD_1',source_root_id:'RBAD',route_value:'Q_B',derivation_kind:'PRIMARY'},
    {witness_id:'W_BAD_2',source_root_id:'RBAD',route_value:'Q_B',derivation_kind:'COPY_OF_ROOT'},
    {witness_id:'W_GOOD',source_root_id:'RGOOD',route_value:'Q_A',derivation_kind:'INDEPENDENT_SYNTHETIC_ROOT'}
  ]);
  const P5=classifyProvenanceIndependence([
    {witness_id:'W5A',source_root_id:'R5',route_value:'Q_A',derivation_kind:'PRIMARY'},
    {witness_id:'W5B',source_root_id:'R5',route_value:'Q_B',derivation_kind:'COPY_OF_ROOT'}
  ]);
  return freeze({P1,P2,P3,P4,P5});
}

export function runNoisyOrientationProvenanceIndependenceGauntlet() {
  const validNoiseCases=buildValidNoiseOuterCases();
  const nearZeroCases=buildNearZeroAmbiguityControls();
  const underdeclared=buildUnderdeclaredNoiseFalsifier();
  const provenance=buildProvenanceFixtures();

  const orientationDecision=evaluateOrientationCase({
    trueY:0.001,
    yHat:0.001,
    bound:VALID_BOUND,
    actualEta:0,
    caseId:'NON_INTERFERENCE_ORIENTATION'
  });
  const nonInterference=freeze({
    orientation:orientationDecision,
    provenance:provenance.P3,
    orientation_decision_locally_actionable:orientationDecision.closure,
    provenance_custody_status:provenance.P3.status,
    combined_confidence_scalar:null,
    custody_rewritten_by_orientation:false,
    orientation_rewritten_by_custody:false
  });

  const passed=
    validNoiseCases.length === 18 &&
    validNoiseCases.every(item => item.declared_bound_holds === true) &&
    validNoiseCases.every(item => item.correct_sign_certification === true) &&
    validNoiseCases.every(item => item.closure === true) &&
    validNoiseCases.every(item => item.certification.disposition === 'SELECT_DECLARED_REPAIR') &&
    nearZeroCases.length === 5 &&
    nearZeroCases.every(item => item.certification.orientation_status === 'ORIENTATION_UNRESOLVED') &&
    nearZeroCases.every(item => item.certification.disposition === 'ABSTAIN_ORIENTATION_UNRESOLVED') &&
    nearZeroCases.every(item => item.both_repairs_admissible === true) &&
    underdeclared.declared_bound_holds === false &&
    underdeclared.bound_status === 'DECLARED_NOISE_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH' &&
    underdeclared.eligible_for_valid_bound_support === false &&
    underdeclared.certification.orientation_status === 'CERTIFIED_NEGATIVE' &&
    underdeclared.closure === false &&
    provenance.P1.raw_record_count === 2 &&
    provenance.P1.unique_root_count === 1 &&
    provenance.P1.independent_support_count === 1 &&
    provenance.P1.status === 'SINGLE_ROOT_DUPLICATES_DO_NOT_AMPLIFY' &&
    provenance.P1.resolved_route === 'Q_A' &&
    provenance.P2.unique_root_count === 2 &&
    provenance.P2.status === 'MULTI_ROOT_AGREEMENT_IN_BOUNDED_SYNTHETIC_FIXTURE' &&
    provenance.P2.resolved_route === 'Q_A' &&
    provenance.P3.status === 'PROVENANCE_CONFLICT_HOLD' &&
    provenance.P3.resolved_route === null &&
    provenance.P4.raw_route_counts.Q_B === 2 &&
    provenance.P4.raw_route_counts.Q_A === 1 &&
    provenance.P4.status === 'PROVENANCE_CONFLICT_HOLD' &&
    provenance.P4.resolved_route === null &&
    provenance.P4.duplicate_majority_vote_used === false &&
    provenance.P5.status === 'SOURCE_ROOT_INTERNAL_CONFLICT_HOLD' &&
    provenance.P5.resolved_route === null &&
    nonInterference.orientation_decision_locally_actionable === true &&
    nonInterference.provenance_custody_status === 'PROVENANCE_CONFLICT_HOLD' &&
    nonInterference.combined_confidence_scalar === null &&
    nonInterference.custody_rewritten_by_orientation === false &&
    nonInterference.orientation_rewritten_by_custody === false;

  if (!passed) throw new Error('Noisy orientation / provenance independence gauntlet violated an authored expectation.');

  return freeze({
    schema:NOISY_ORIENTATION_PROVENANCE_INDEPENDENCE_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    valid_noise_envelope:freeze({
      declared_bound:VALID_BOUND,
      eta_grid:VALID_ETAS,
      cases:validNoiseCases,
      case_count:validNoiseCases.length,
      certified_correct_count:validNoiseCases.filter(item=>item.correct_sign_certification).length,
      closure_count:validNoiseCases.filter(item=>item.closure).length,
      abstention_count:validNoiseCases.filter(item=>item.certification.orientation_status==='ORIENTATION_UNRESOLVED').length,
      wrong_sign_certification_count:validNoiseCases.filter(item=>item.certified_sign!=='UNRESOLVED' && !item.correct_sign_certification).length
    }),
    near_zero_ambiguity_controls:freeze({
      cases:nearZeroCases,
      abstention_count:nearZeroCases.filter(item=>item.certification.orientation_status==='ORIENTATION_UNRESOLVED').length,
      both_repairs_admissible_count:nearZeroCases.filter(item=>item.both_repairs_admissible).length
    }),
    underdeclared_noise_falsifier:underdeclared,
    provenance_fixtures:provenance,
    decision_custody_non_interference:nonInterference,
    gauntlet_status:'NOISY_DECISION_COORDINATE_AND_PROVENANCE_INDEPENDENCE_BOUNDARY_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite fixture, interval-certified signed orientation preserves the parent repair distinction across the declared valid-noise envelope and abstains when zero is inside the decision interval; separately, declared source-root grouping prevents duplicate amplification and holds rather than majority-votes through conflicting provenance; decision and custody remain distinct typed objects',
    anti_equivalences:freeze([
      'point estimate sign != certified sign',
      'noise bound declared != noise bound true',
      'orientation unresolved != forced choice',
      'orientation unresolved != decision catastrophe in an equivalence band',
      'wrong action under falsified bound != valid-bound rule failure',
      'record count != independent support count',
      'different source_root_id != proven real-world independence',
      'duplicate agreement != independent corroboration',
      'majority records != provenance resolution',
      'current geometry != authority to rewrite custody',
      'custody conflict != orientation uncertainty',
      'decision state != custody state',
      'confidence scalar != typed decision plus typed custody'
    ]),
    next_learning_action:'TEST_JOINT_DECISION_AND_CUSTODY_HOLD_COMPOSITION_WHEN_ORIENTATION_IS_UNRESOLVED_PROVENANCE_IS_CONFLICTING_OR_BOTH_WITHOUT_MAJORITY_VOTING_CONFIDENCE_SCALAR_COLLAPSE_AUTONOMOUS_ESCALATION_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION',
    claims:freeze({
      measurement_error_theorem:false,
      statistical_calibration_theorem:false,
      robust_control_theorem:false,
      sufficient_statistic_theorem:false,
      markov_or_pomdp_theorem:false,
      active_learning:false,
      reinforcement_learning:false,
      optimal_experimental_design:false,
      causal_intervention_theorem:false,
      real_world_provenance_independence:false,
      consensus_theorem:false,
      connection:false,
      curvature:false,
      berry_structure:false,
      holonomy:false,
      physical_sensor_feedback:false,
      physical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
      autonomous_execution:false,
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
