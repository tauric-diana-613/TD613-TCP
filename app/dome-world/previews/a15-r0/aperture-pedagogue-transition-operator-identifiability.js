import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';

export const TRANSITION_OPERATOR_IDENTIFIABILITY_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-transition-operator-identifiability/v0.1';

const PROBE_CONDITION_NUMBER_CEILING = 10;
const EPSILON = 0.001;

const T_STAR = Object.freeze([
  Object.freeze([2,1]),
  Object.freeze([1,3])
]);

const T_ALT = Object.freeze([
  Object.freeze([2,-4]),
  Object.freeze([1,7])
]);

const X1 = Object.freeze([1,0]);
const Y1 = Object.freeze([2,1]);
const X_HOLD = Object.freeze([1,1]);

const NULLSPACE_BASIS = Object.freeze([
  Object.freeze([
    Object.freeze([0,1]),
    Object.freeze([0,0])
  ]),
  Object.freeze([
    Object.freeze([0,0]),
    Object.freeze([0,1])
  ])
]);

const PROBE_CANDIDATES = Object.freeze([
  Object.freeze({candidate_id:'Q_REPEAT',x:Object.freeze([2,0]),probe_cost:1}),
  Object.freeze({candidate_id:'Q_FRAGILE_SPANNING',x:Object.freeze([1,EPSILON]),probe_cost:1}),
  Object.freeze({candidate_id:'Q_STABLE_BASIS',x:Object.freeze([0,1]),probe_cost:1})
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

function finite(value,label) {
  const number=Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function vector2(vector,label='vector') {
  if (!Array.isArray(vector) || vector.length !== 2) throw new TypeError(`${label} must have length 2`);
  return vector.map((value,index)=>finite(value,`${label}[${index}]`));
}

function matrix2(matrix,label='matrix') {
  if (!Array.isArray(matrix) || matrix.length !== 2) throw new TypeError(`${label} must be 2 x 2`);
  return matrix.map((row,index)=>vector2(row,`${label}[${index}]`));
}

function matVec(matrix,vector) {
  const M=matrix2(matrix,'matrix');
  const x=vector2(vector,'vector');
  return M.map(row=>row[0]*x[0]+row[1]*x[1]);
}

function matMul(left,right) {
  const A=matrix2(left,'left');
  const B=matrix2(right,'right');
  return [
    [A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],
    [A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]
  ];
}

function inverse2(matrix) {
  const M=matrix2(matrix,'matrix');
  const det=M[0][0]*M[1][1]-M[0][1]*M[1][0];
  if (Math.abs(det) <= Number.EPSILON) throw new Error('SINGULAR_PROBE_MATRIX');
  return [
    [M[1][1]/det,-M[0][1]/det],
    [-M[1][0]/det,M[0][0]/det]
  ];
}

function maxAbsMatrixDifference(left,right) {
  const A=matrix2(left,'left');
  const B=matrix2(right,'right');
  return Math.max(...A.flatMap((row,i)=>row.map((value,j)=>Math.abs(value-B[i][j]))));
}

function maxAbsVectorDifference(left,right) {
  const a=vector2(left,'left');
  const b=vector2(right,'right');
  return Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
}

function columnsToMatrix(first,second) {
  const a=vector2(first,'first column');
  const b=vector2(second,'second column');
  return [[a[0],b[0]],[a[1],b[1]]];
}

function probeGeometry(probes) {
  if (!Array.isArray(probes) || probes.length < 1 || probes.length > 2) {
    throw new TypeError('probes must contain one or two two-dimensional inputs');
  }
  const normalized=probes.map((probe,index)=>vector2(probe,`probe[${index}]`));
  if (normalized.length === 1) {
    const [x]=normalized;
    const norm=Math.hypot(x[0],x[1]);
    return deepFreeze({
      rank:norm > Number.EPSILON ? 1 : 0,
      condition_number:null,
      stable_full_span:false
    });
  }
  const geometry=operatorGeometry(normalized);
  return deepFreeze({
    rank:geometry.rank,
    sigma_min:geometry.sigma_min,
    sigma_max:geometry.sigma_max,
    condition_number:geometry.condition_number,
    stable_full_span:geometry.rank === 2 && geometry.condition_number <= PROBE_CONDITION_NUMBER_CEILING
  });
}

function remainingOperatorDimension(probes) {
  const rank=probeGeometry(probes).rank;
  return 2*(2-rank);
}

function basisAction(matrix,probe) {
  return matVec(matrix,probe);
}

export function buildTransitionOperatorIdentifiabilityFixture() {
  return deepFreeze({
    model_class:'REAL_LINEAR_2X2',
    synthetic_oracle:clone(T_STAR),
    initial_probe:clone(X1),
    initial_observation:clone(Y1),
    affine_compatible_family:deepFreeze({
      representation:'AFFINE_NULLSPACE_CONTINUOUS',
      origin:deepFreeze([[2,0],[1,0]]),
      nullspace_basis:clone(NULLSPACE_BASIS),
      free_parameters:deepFreeze(['a:REAL','b:REAL']),
      compatible_dimension:2
    }),
    explicit_one_probe_alternative:clone(T_ALT),
    probe_candidates:clone(PROBE_CANDIDATES),
    probe_condition_number_ceiling:PROBE_CONDITION_NUMBER_CEILING,
    heldout_probe:clone(X_HOLD),
    in_family_heldout_observation:deepFreeze([3,4]),
    open_set_heldout_observation:deepFreeze([3,5])
  });
}

export function validateCompatibleFamilyRepresentation(family) {
  if (!family || typeof family !== 'object') throw new TypeError('family must be an object');
  if (family.representation !== 'AFFINE_NULLSPACE_CONTINUOUS') {
    throw new Error('REJECT_FINITE_SAMPLE_LAUNDERING_OF_CONTINUOUS_OPERATOR_FAMILY');
  }
  if (stable(family.free_parameters) !== stable(['a:REAL','b:REAL'])) {
    throw new Error('REJECT_COMPATIBLE_PARAMETER_DOMAIN_MUTATION');
  }
  if (family.compatible_dimension !== 2) throw new Error('REJECT_COMPATIBLE_DIMENSION_MUTATION');
  if (stable(matrix2(family.origin,'origin')) !== stable([[2,0],[1,0]])) {
    throw new Error('REJECT_COMPATIBLE_FAMILY_ORIGIN_MUTATION');
  }
  if (!Array.isArray(family.nullspace_basis) || family.nullspace_basis.length !== 2) {
    throw new Error('REJECT_OPERATOR_NULLSPACE_BASIS_MUTATION');
  }
  if (stable(family.nullspace_basis.map((matrix,index)=>matrix2(matrix,`basis[${index}]`))) !== stable(NULLSPACE_BASIS)) {
    throw new Error('REJECT_OPERATOR_NULLSPACE_BASIS_MUTATION');
  }
  return true;
}

export function validateProbeSelectionInput(input) {
  if (!input || typeof input !== 'object') throw new TypeError('selection input must be an object');
  const forbidden=['candidate_future_outputs','future_outputs','synthetic_oracle','T_star','t_star','oracle_outputs'];
  for (const key of forbidden) {
    if (key in input) throw new Error('REJECT_ORACLE_OUTPUT_LEAKAGE_IN_PROBE_SELECTION');
  }
  if (!Array.isArray(input.current_probes) || input.current_probes.length !== 1) {
    throw new Error('SELECTION_REQUIRES_EXACTLY_ONE_CURRENT_PROBE');
  }
  if (!Array.isArray(input.current_observations) || input.current_observations.length !== 1) {
    throw new Error('SELECTION_REQUIRES_EXACTLY_ONE_CURRENT_OBSERVATION');
  }
  if (!Array.isArray(input.operator_nullspace_basis) || input.operator_nullspace_basis.length !== 2) {
    throw new Error('SELECTION_REQUIRES_OPERATOR_NULLSPACE_BASIS');
  }
  if (!Array.isArray(input.candidates) || input.candidates.length !== 3) {
    throw new Error('SELECTION_REQUIRES_FROZEN_CANDIDATE_SET');
  }
  return true;
}

export function evaluateProbeCandidate(candidate,currentProbe=X1,nullspaceBasis=NULLSPACE_BASIS) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate must be an object');
  const expected=PROBE_CANDIDATES.find(item=>item.candidate_id === candidate.candidate_id);
  if (!expected || stable(candidate) !== stable(expected)) throw new Error('REJECT_PROBE_CANDIDATE_MUTATION');
  const x=vector2(candidate.x,`${candidate.candidate_id}.x`);
  const geometry=probeGeometry([currentProbe,x]);
  const remainingDimension=remainingOperatorDimension([currentProbe,x]);
  const actions=nullspaceBasis.map((basis,index)=>basisAction(basis,x).map(value=>Math.abs(value)<1e-15?0:value));
  const separates=actions.some(action=>Math.hypot(action[0],action[1])>0);
  const classification=remainingDimension > 0
    ? 'OPERATOR_COMPATIBLE_FAMILY_UNCHANGED'
    : geometry.condition_number > PROBE_CONDITION_NUMBER_CEILING
      ? 'OPERATOR_UNIQUE_BUT_PROBE_GEOMETRY_NUMERICALLY_FRAGILE'
      : 'OPERATOR_STABLY_IDENTIFIABLE_AFTER_PROBE';
  return deepFreeze({
    candidate_id:candidate.candidate_id,
    x,
    probe_cost:candidate.probe_cost,
    nullspace_actions:actions,
    separates_operator_nullspace:separates,
    probe_geometry:geometry,
    remaining_operator_dimension:remainingDimension,
    classification,
    stable_identification:classification === 'OPERATOR_STABLY_IDENTIFIABLE_AFTER_PROBE',
    future_output_consulted:false,
    automatic_execution:false
  });
}

function selectionSurface(fixture) {
  return deepFreeze({
    current_probes:[clone(fixture.initial_probe)],
    current_observations:[clone(fixture.initial_observation)],
    operator_nullspace_basis:clone(fixture.affine_compatible_family.nullspace_basis),
    candidates:clone(fixture.probe_candidates),
    probe_condition_number_ceiling:fixture.probe_condition_number_ceiling
  });
}

export function ambiguityOnlyHostileProbeSelector(input) {
  validateProbeSelectionInput(input);
  const evaluations=input.candidates.map(candidate=>evaluateProbeCandidate(candidate,input.current_probes[0],input.operator_nullspace_basis));
  const ordered=[...evaluations].sort((left,right)=>
    left.remaining_operator_dimension-right.remaining_operator_dimension ||
    left.candidate_id.localeCompare(right.candidate_id)
  );
  return deepFreeze({
    selection_rule:'HOSTILE_OPERATOR_DIMENSION_CONTRACTION_ONLY',
    selected_candidate_id:ordered[0]?.candidate_id || null,
    evaluations,
    candidate_future_outputs_consulted:false,
    automatic_execution:false
  });
}

export function stabilityAwareProbeSelector(input) {
  validateProbeSelectionInput(input);
  const evaluations=input.candidates.map(candidate=>evaluateProbeCandidate(candidate,input.current_probes[0],input.operator_nullspace_basis));
  const bestDimension=Math.min(...evaluations.map(item=>item.remaining_operator_dimension));
  const dimensionEligible=evaluations.filter(item=>item.remaining_operator_dimension===bestDimension);
  const stableEligible=dimensionEligible.filter(item=>
    item.probe_geometry.condition_number != null &&
    item.probe_geometry.condition_number <= input.probe_condition_number_ceiling
  );
  const pool=stableEligible.length ? stableEligible : dimensionEligible;
  const ordered=[...pool].sort((left,right)=>
    (left.probe_geometry.condition_number ?? Infinity)-(right.probe_geometry.condition_number ?? Infinity) ||
    left.candidate_id.localeCompare(right.candidate_id)
  );
  return deepFreeze({
    selection_rule:'OPERATOR_DIMENSION_CONTRACTION_THEN_PROBE_CONDITIONING',
    selected_candidate_id:ordered[0]?.candidate_id || null,
    evaluations,
    candidate_future_outputs_consulted:false,
    automatic_execution:false,
    promotion_authority:false
  });
}

export function reconstructLinearOperatorFromTwoProbes(x1,y1,x2,y2) {
  const X=columnsToMatrix(x1,x2);
  const Y=columnsToMatrix(y1,y2);
  const geometry=probeGeometry([x1,x2]);
  if (geometry.rank !== 2) throw new Error('OPERATOR_NOT_UNIQUE_UNDER_PROBE_SPAN');
  const T=matMul(Y,inverse2(X));
  const residual=Math.max(
    maxAbsVectorDifference(matVec(T,x1),y1),
    maxAbsVectorDifference(matVec(T,x2),y2)
  );
  return deepFreeze({
    reconstructed_operator:T,
    probe_matrix:X,
    observation_matrix:Y,
    probe_geometry:geometry,
    operator_unique:true,
    compatible_dimension:0,
    training_pair_residual:residual
  });
}

export function runTransitionOperatorIdentifiabilityGauntlet() {
  const fixture=buildTransitionOperatorIdentifiabilityFixture();
  const before=stable(fixture);
  validateCompatibleFamilyRepresentation(fixture.affine_compatible_family);

  const N1x1=basisAction(fixture.affine_compatible_family.nullspace_basis[0],fixture.initial_probe);
  const N2x1=basisAction(fixture.affine_compatible_family.nullspace_basis[1],fixture.initial_probe);
  const initialDimension=remainingOperatorDimension([fixture.initial_probe]);
  const tStarInitial=matVec(fixture.synthetic_oracle,fixture.initial_probe);
  const tAltInitial=matVec(fixture.explicit_one_probe_alternative,fixture.initial_probe);
  const tStarHeld=matVec(fixture.synthetic_oracle,fixture.heldout_probe);
  const tAltHeld=matVec(fixture.explicit_one_probe_alternative,fixture.heldout_probe);

  const surface=selectionSurface(fixture);
  const hostileSelector=ambiguityOnlyHostileProbeSelector(surface);
  const stableSelector=stabilityAwareProbeSelector(surface);
  const evaluations=Object.fromEntries(stableSelector.evaluations.map(item=>[item.candidate_id,item]));

  const selectedCandidate=fixture.probe_candidates.find(item=>item.candidate_id===stableSelector.selected_candidate_id);
  if (!selectedCandidate) throw new Error('STABLE_SELECTOR_FAILED_TO_SELECT_PROBE');
  const selectedOutput=matVec(fixture.synthetic_oracle,selectedCandidate.x);
  const reconstruction=reconstructLinearOperatorFromTwoProbes(
    fixture.initial_probe,
    fixture.initial_observation,
    selectedCandidate.x,
    selectedOutput
  );

  const heldoutPrediction=matVec(reconstruction.reconstructed_operator,fixture.heldout_probe);
  const inFamilyMatch=maxAbsVectorDifference(heldoutPrediction,fixture.in_family_heldout_observation) <= 1e-12;
  const openSetMatch=maxAbsVectorDifference(heldoutPrediction,fixture.open_set_heldout_observation) <= 1e-12;

  let oracleLeakRejected=false;
  try {
    validateProbeSelectionInput({...clone(surface),synthetic_oracle:clone(T_STAR)});
  } catch (error) {
    oracleLeakRejected=/REJECT_ORACLE_OUTPUT_LEAKAGE_IN_PROBE_SELECTION/.test(String(error?.message || error));
  }

  let finiteSampleLaunderingRejected=false;
  try {
    validateCompatibleFamilyRepresentation({
      representation:'FINITE_SAMPLES',
      members:[clone(T_STAR),clone(T_ALT)],
      free_parameters:['a:REAL','b:REAL'],
      compatible_dimension:2,
      origin:[[2,0],[1,0]],
      nullspace_basis:clone(NULLSPACE_BASIS)
    });
  } catch (error) {
    finiteSampleLaunderingRejected=/REJECT_FINITE_SAMPLE_LAUNDERING_OF_CONTINUOUS_OPERATOR_FAMILY/.test(String(error?.message || error));
  }

  const passed=
    initialDimension===2 &&
    maxAbsVectorDifference(N1x1,[0,0])===0 &&
    maxAbsVectorDifference(N2x1,[0,0])===0 &&
    maxAbsVectorDifference(tStarInitial,fixture.initial_observation)===0 &&
    maxAbsVectorDifference(tAltInitial,fixture.initial_observation)===0 &&
    maxAbsMatrixDifference(fixture.synthetic_oracle,fixture.explicit_one_probe_alternative)>0 &&
    maxAbsVectorDifference(tStarHeld,[3,4])===0 &&
    maxAbsVectorDifference(tAltHeld,[-2,8])===0 &&
    evaluations.Q_REPEAT.remaining_operator_dimension===2 &&
    evaluations.Q_REPEAT.classification==='OPERATOR_COMPATIBLE_FAMILY_UNCHANGED' &&
    evaluations.Q_FRAGILE_SPANNING.remaining_operator_dimension===0 &&
    evaluations.Q_FRAGILE_SPANNING.classification==='OPERATOR_UNIQUE_BUT_PROBE_GEOMETRY_NUMERICALLY_FRAGILE' &&
    evaluations.Q_FRAGILE_SPANNING.probe_geometry.condition_number>PROBE_CONDITION_NUMBER_CEILING &&
    evaluations.Q_STABLE_BASIS.remaining_operator_dimension===0 &&
    evaluations.Q_STABLE_BASIS.classification==='OPERATOR_STABLY_IDENTIFIABLE_AFTER_PROBE' &&
    Math.abs(evaluations.Q_STABLE_BASIS.probe_geometry.condition_number-1)<=1e-12 &&
    hostileSelector.selected_candidate_id==='Q_FRAGILE_SPANNING' &&
    stableSelector.selected_candidate_id==='Q_STABLE_BASIS' &&
    maxAbsMatrixDifference(reconstruction.reconstructed_operator,fixture.synthetic_oracle)<=1e-12 &&
    reconstruction.training_pair_residual<=1e-12 &&
    inFamilyMatch===true &&
    openSetMatch===false &&
    oracleLeakRejected===true &&
    finiteSampleLaunderingRejected===true &&
    stable(fixture)===before;

  if (!passed) throw new Error('Transition-operator identifiability gauntlet violated a frozen expectation.');

  return deepFreeze({
    schema:TRANSITION_OPERATOR_IDENTIFIABILITY_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    model_class:'REAL_LINEAR_2X2',
    initial_probe:fixture.initial_probe,
    initial_observation:fixture.initial_observation,
    initial_operator_compatible_dimension:initialDimension,
    compatible_family_representation:'AFFINE_NULLSPACE_CONTINUOUS',
    nullspace_basis_annihilates_initial_probe:true,
    explicit_alternative_matches_initial_observation:true,
    explicit_alternative_differs_on_heldout:true,
    probe_evaluations:stableSelector.evaluations,
    ambiguity_only_hostile_selector:hostileSelector,
    stability_aware_selector:stableSelector,
    selected_probe_output_generated_only_after_selection:true,
    reconstruction,
    heldout:deepFreeze({
      probe:fixture.heldout_probe,
      predicted:heldoutPrediction,
      in_family_observed:fixture.in_family_heldout_observation,
      in_family_status:'HELDOUT_LINEAR_TRANSITION_PREDICTION_MATCH',
      open_set_observed:fixture.open_set_heldout_observation,
      open_set_status:'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION'
    }),
    hostile_rejections:deepFreeze({
      oracle_output_leakage_rejected:oracleLeakRejected,
      finite_sample_laundering_rejected:finiteSampleLaunderingRejected
    }),
    source_inputs_preserved:stable(fixture)===before,
    gauntlet_status:'TRANSITION_OPERATOR_IDENTIFIABILITY_BOUNDARY_VALIDATED_IN_BOUNDED_NOISELESS_SYNTHETIC_LINEAR_FIXTURE',
    bounded_refinement_candidate:'partial transition input/output probes can leave an analytic affine operator-compatible family; exact family contraction can occur through ill-conditioned probe geometry, while a stability-aware probe can support exact bounded reconstruction, held-out in-family prediction, and explicit declared-model defeat',
    anti_equivalences:deepFreeze([
      'synthetic oracle available to fixture evaluator != operator known to Pedagogue',
      'operator-family contraction != stable probe geometry',
      'full probe rank != stable operator identifiability',
      'finite sampled alternatives != complete continuous compatible operator family',
      'heldout prediction match != universal operator recovery',
      'open-set heldout mismatch != parameter uncertainty inside the identified linear class',
      'bounded system-identification entrance exam != operator tomography',
      'candidate future output != admissible probe-selection input',
      'counterfactual synthetic observation != external experiment execution'
    ]),
    next_learning_action:'TEST_TRANSITION_OPERATOR_IDENTIFICATION_UNDER_BOUNDED_OBSERVATION_NOISE_WITH_COMPATIBLE_OPERATOR_SETS_CONDITION_AWARE_PROBE_DESIGN_HELDOUT_COVERAGE_AND_MODEL_MISSPECIFICATION_BEFORE_ANY_OPERATOR_TOMOGRAPHY_PATH_CATEGORY_OR_HOLONOMY_PROMOTION',
    claims:deepFreeze({
      general_system_identification_theorem:false,
      statistical_consistency:false,
      noise_robustness:false,
      bayesian_operator_inference:false,
      operator_tomography:false,
      blind_tomography:false,
      physical_tomography:false,
      active_learning_optimality:false,
      optimal_experimental_design:false,
      robust_control_theorem:false,
      pomdp_theorem:false,
      dual_control_theorem:false,
      path_category_theorem:false,
      path_dependent_transport:false,
      loop_endomorphism:false,
      holonomy:false,
      curvature:false,
      berry_structure:false,
      quantum_behavior:false,
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
