import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';

export const TRANSITION_OPERATOR_BOUNDED_NOISE_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-transition-operator-bounded-noise/v0.1';

const DELTA = 0.0001;
const EPSILON = 0.001;
const EXACT_FIRST_COLUMN = Object.freeze([2,1]);
const T_STAR = Object.freeze([
  Object.freeze([2,1]),
  Object.freeze([1,3])
]);
const X1 = Object.freeze([1,0]);
const Y1 = Object.freeze([2,1]);
const X_HOLD = Object.freeze([1,1]);

const CANDIDATES = Object.freeze([
  Object.freeze({
    candidate_id:'Q_REPEAT',
    x:Object.freeze([2,0]),
    probe_cost:1,
    observed_center:Object.freeze([4,2])
  }),
  Object.freeze({
    candidate_id:'Q_FRAGILE_SPANNING',
    x:Object.freeze([1,EPSILON]),
    probe_cost:1,
    observed_center:Object.freeze([2.001,1.003])
  }),
  Object.freeze({
    candidate_id:'Q_STABLE_BASIS',
    x:Object.freeze([0,1]),
    probe_cost:1,
    observed_center:Object.freeze([1,3])
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

function finite(value,label) {
  const number=Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function vector2(vector,label='vector') {
  if (!Array.isArray(vector) || vector.length !== 2) throw new TypeError(`${label} must have length 2`);
  return vector.map((value,index)=>finite(value,`${label}[${index}]`));
}

function interval(center,radius) {
  const c=finite(center,'interval center');
  const r=finite(radius,'interval radius');
  if (r < 0) throw new RangeError('interval radius must be non-negative');
  return deepFreeze([c-r,c+r]);
}

function intervalIntersects(left,right,tolerance=1e-12) {
  return Math.max(left[0],right[0]) <= Math.min(left[1],right[1])+tolerance;
}

function boxIntersects(left,right) {
  return intervalIntersects(left[0],right[0]) && intervalIntersects(left[1],right[1]);
}

function scaleInterval(pair,scalar) {
  const s=finite(scalar,'scalar');
  const values=[pair[0]*s,pair[1]*s];
  return deepFreeze([Math.min(...values),Math.max(...values)]);
}

function addIntervals(left,right) {
  return deepFreeze([left[0]+right[0],left[1]+right[1]]);
}

function pointInterval(value) {
  return deepFreeze([value,value]);
}

function probeGeometry(secondProbe) {
  const x=vector2(secondProbe,'second probe');
  const geometry=operatorGeometry([X1,x]);
  return deepFreeze({
    rank:geometry.rank,
    sigma_min:geometry.sigma_min,
    sigma_max:geometry.sigma_max,
    condition_number:geometry.condition_number
  });
}

function exactRemainingOperatorDimension(secondProbe) {
  return 2*(2-probeGeometry(secondProbe).rank);
}

function expectedCandidate(id) {
  return CANDIDATES.find(candidate=>candidate.candidate_id===id) || null;
}

function selectionCandidateFromFull(candidate) {
  return deepFreeze({
    candidate_id:candidate.candidate_id,
    x:clone(candidate.x),
    probe_cost:candidate.probe_cost
  });
}

export function validateNoiseProbeCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate must be an object');
  const expected=expectedCandidate(candidate.candidate_id);
  if (!expected || stable(candidate)!==stable(expected)) throw new Error('REJECT_NOISE_PROBE_CANDIDATE_MUTATION');
  return true;
}

export function validateNoiseSelectionCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('selection candidate must be an object');
  const expected=expectedCandidate(candidate.candidate_id);
  if (!expected) throw new Error('REJECT_NOISE_PROBE_CANDIDATE_SET_MUTATION');
  const expectedSurface=selectionCandidateFromFull(expected);
  if (stable(candidate)!==stable(expectedSurface)) throw new Error('REJECT_NOISE_SELECTION_CANDIDATE_MUTATION');
  if ('observed_center' in candidate) throw new Error('REJECT_ORACLE_OUTPUT_LEAKAGE_IN_NOISE_AWARE_PROBE_SELECTION');
  return true;
}

export function deriveCompatibleOperatorSet(candidate,delta=DELTA) {
  validateNoiseProbeCandidate(candidate);
  const d=finite(delta,'delta');
  if (d < 0) throw new RangeError('delta must be non-negative');
  const [alpha,beta]=vector2(candidate.x,`${candidate.candidate_id}.x`);
  const geometry=probeGeometry(candidate.x);
  const exactDimension=exactRemainingOperatorDimension(candidate.x);

  if (Math.abs(beta) <= Number.EPSILON) {
    return deepFreeze({
      candidate_id:candidate.candidate_id,
      representation:'UNBOUNDED_SECOND_COLUMN',
      first_column:clone(EXACT_FIRST_COLUMN),
      second_column_intervals:null,
      operator_entry_radius:Infinity,
      exact_remaining_operator_dimension:exactDimension,
      probe_geometry:geometry,
      operator_set_status:'OPERATOR_SECOND_COLUMN_UNBOUNDED'
    });
  }

  const observed=vector2(candidate.observed_center,`${candidate.candidate_id}.observed_center`);
  const centers=observed.map((value,index)=>(value-alpha*EXACT_FIRST_COLUMN[index])/beta);
  const radius=d/Math.abs(beta);
  const secondColumnIntervals=centers.map(center=>interval(center,radius));
  return deepFreeze({
    candidate_id:candidate.candidate_id,
    representation:'EXACT_INTERVAL_SECOND_COLUMN',
    first_column:clone(EXACT_FIRST_COLUMN),
    second_column_intervals:secondColumnIntervals,
    nominal_second_column:centers,
    operator_entry_radius:radius,
    exact_remaining_operator_dimension:exactDimension,
    probe_geometry:geometry,
    operator_set_status:'BOUNDED_INTERVAL_OPERATOR_SET'
  });
}

export function validateCompatibleOperatorSetRepresentation(set) {
  if (!set || typeof set !== 'object') throw new TypeError('compatible operator set must be an object');
  if (set.representation === 'POINT_ESTIMATE') {
    throw new Error('REJECT_POINT_ESTIMATE_LAUNDERING_OF_COMPATIBLE_OPERATOR_SET');
  }
  if (set.representation === 'FINITE_SAMPLES' || set.representation === 'MONTE_CARLO_SAMPLES') {
    throw new Error('REJECT_FINITE_SAMPLE_LAUNDERING_OF_EXACT_INTERVAL_OPERATOR_SET');
  }
  if (!['EXACT_INTERVAL_SECOND_COLUMN','UNBOUNDED_SECOND_COLUMN'].includes(set.representation)) {
    throw new Error('REJECT_UNKNOWN_COMPATIBLE_OPERATOR_SET_REPRESENTATION');
  }
  return true;
}

export function predictHeldoutBox(operatorSet,probe=X_HOLD) {
  validateCompatibleOperatorSetRepresentation(operatorSet);
  if (operatorSet.representation==='UNBOUNDED_SECOND_COLUMN') {
    return deepFreeze({status:'UNBOUNDED_PREDICTION_SET',intervals:null});
  }
  const [x0,x1]=vector2(probe,'heldout probe');
  const intervals=[0,1].map(index=>
    addIntervals(
      scaleInterval(pointInterval(operatorSet.first_column[index]),x0),
      scaleInterval(operatorSet.second_column_intervals[index],x1)
    )
  );
  return deepFreeze({status:'BOUNDED_PREDICTION_BOX',intervals});
}

export function observationBox(center,delta=DELTA) {
  const c=vector2(center,'observation center');
  const d=finite(delta,'delta');
  if (d<0) throw new RangeError('delta must be non-negative');
  return deepFreeze(c.map(value=>interval(value,d)));
}

export function classifyHeldoutAgainstOperatorSet(operatorSet,observedCenter,delta=DELTA) {
  const prediction=predictHeldoutBox(operatorSet,X_HOLD);
  const observed=observationBox(observedCenter,delta);
  if (prediction.status==='UNBOUNDED_PREDICTION_SET') {
    return deepFreeze({
      prediction,
      observation:observed,
      intersects:true,
      status:'HELDOUT_OBSERVATION_NOT_DISCRIMINATING_UNDER_UNBOUNDED_OPERATOR_UNCERTAINTY'
    });
  }
  const intersects=boxIntersects(prediction.intervals,observed);
  return deepFreeze({
    prediction,
    observation:observed,
    intersects,
    status:intersects
      ? 'HELDOUT_OBSERVATION_COMPATIBLE_WITH_OPERATOR_SET'
      : 'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_BOUNDED_HELDOUT_OBSERVATION'
  });
}

export function validateNoiseAwareSelectionInput(input) {
  if (!input || typeof input !== 'object') throw new TypeError('selection input must be an object');
  for (const forbidden of ['candidate_future_outputs','future_outputs','synthetic_oracle','T_star','heldout_observations','observed_centers']) {
    if (forbidden in input) throw new Error('REJECT_ORACLE_OUTPUT_LEAKAGE_IN_NOISE_AWARE_PROBE_SELECTION');
  }
  if (stable(vector2(input.current_probe,'current_probe'))!==stable(X1)) throw new Error('REJECT_CALIBRATION_PROBE_MUTATION');
  if (stable(vector2(input.current_observation,'current_observation'))!==stable(Y1)) throw new Error('REJECT_CALIBRATION_OBSERVATION_MUTATION');
  if (!Array.isArray(input.candidates) || input.candidates.length!==3) throw new Error('REJECT_NOISE_PROBE_CANDIDATE_SET_MUTATION');
  input.candidates.forEach(validateNoiseSelectionCandidate);
  if (Math.abs(Number(input.declared_delta)-DELTA)>1e-15) throw new Error('REJECT_DECLARED_NOISE_BOUND_MUTATION');
  return true;
}

function selectionSurface(fixture) {
  return deepFreeze({
    current_probe:clone(fixture.exact_calibration_probe),
    current_observation:clone(fixture.exact_calibration_observation),
    candidates:fixture.candidates.map(selectionCandidateFromFull),
    declared_delta:fixture.delta
  });
}

function geometryOnlySelectionCandidate(candidate) {
  validateNoiseSelectionCandidate(candidate);
  const geometry=probeGeometry(candidate.x);
  return deepFreeze({
    candidate_id:candidate.candidate_id,
    exact_remaining_operator_dimension:exactRemainingOperatorDimension(candidate.x),
    probe_geometry:geometry
  });
}

export function noiseBlindHostileSelector(input) {
  validateNoiseAwareSelectionInput(input);
  const evaluations=input.candidates.map(geometryOnlySelectionCandidate);
  const ordered=[...evaluations].sort((left,right)=>
    left.exact_remaining_operator_dimension-right.exact_remaining_operator_dimension ||
    left.candidate_id.localeCompare(right.candidate_id)
  );
  return deepFreeze({
    selection_rule:'HOSTILE_EXACT_OPERATOR_DIMENSION_ONLY_IGNORES_BOUNDED_NOISE',
    selected_candidate_id:ordered[0]?.candidate_id || null,
    evaluations,
    declared_noise_used:false,
    future_outputs_consulted:false,
    automatic_execution:false
  });
}

export function boundedNoiseAwareSelector(input) {
  validateNoiseAwareSelectionInput(input);
  const evaluations=input.candidates.map(candidate=>{
    validateNoiseSelectionCandidate(candidate);
    const [alpha,beta]=vector2(candidate.x,`${candidate.candidate_id}.x`);
    const geometry=probeGeometry(candidate.x);
    const exactDimension=exactRemainingOperatorDimension(candidate.x);
    const radius=Math.abs(beta)<=Number.EPSILON ? Infinity : input.declared_delta/Math.abs(beta);
    return deepFreeze({
      candidate_id:candidate.candidate_id,
      alpha,
      beta,
      exact_remaining_operator_dimension:exactDimension,
      predicted_operator_entry_radius:radius,
      probe_geometry:geometry
    });
  });
  const bounded=evaluations.filter(item=>Number.isFinite(item.predicted_operator_entry_radius) && item.exact_remaining_operator_dimension===0);
  const ordered=[...bounded].sort((left,right)=>
    left.predicted_operator_entry_radius-right.predicted_operator_entry_radius ||
    left.candidate_id.localeCompare(right.candidate_id)
  );
  return deepFreeze({
    selection_rule:'BOUNDED_ERROR_COMPATIBLE_SET_RADIUS',
    selected_candidate_id:ordered[0]?.candidate_id || null,
    evaluations,
    declared_noise_used:true,
    future_outputs_consulted:false,
    automatic_execution:false,
    promotion_authority:false
  });
}

export function classifyDeclaredNoiseBound({declared_delta,actual_error_magnitude,synthetic_truth_available=false}) {
  const declared=finite(declared_delta,'declared_delta');
  const actual=finite(actual_error_magnitude,'actual_error_magnitude');
  if (!synthetic_truth_available) {
    return deepFreeze({status:'ACTUAL_ERROR_NOT_OBSERVABLE_WITHOUT_SYNTHETIC_TRUTH'});
  }
  return deepFreeze({
    declared_delta:declared,
    actual_error_magnitude:actual,
    status:actual<=declared+1e-15
      ? 'DECLARED_OBSERVATION_ERROR_BOUND_NOT_FALSIFIED_BY_SYNTHETIC_TRUTH'
      : 'DECLARED_OBSERVATION_ERROR_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH'
  });
}

export function buildTransitionOperatorBoundedNoiseFixture() {
  return deepFreeze({
    synthetic_oracle:clone(T_STAR),
    exact_calibration_probe:clone(X1),
    exact_calibration_observation:clone(Y1),
    exact_first_column:clone(EXACT_FIRST_COLUMN),
    delta:DELTA,
    epsilon:EPSILON,
    candidates:clone(CANDIDATES),
    heldout_probe:clone(X_HOLD),
    in_family_heldout_center:deepFreeze([3,4]),
    misspecified_heldout_center:deepFreeze([3.001,4])
  });
}

export function runTransitionOperatorBoundedNoiseGauntlet() {
  const fixture=buildTransitionOperatorBoundedNoiseFixture();
  const before=stable(fixture);
  const surface=selectionSurface(fixture);
  const hostileSelector=noiseBlindHostileSelector(surface);
  const noiseAwareSelector=boundedNoiseAwareSelector(surface);
  const sets=Object.fromEntries(fixture.candidates.map(candidate=>[
    candidate.candidate_id,
    deriveCompatibleOperatorSet(candidate,fixture.delta)
  ]));
  Object.values(sets).forEach(validateCompatibleOperatorSetRepresentation);

  const fragileRadius=sets.Q_FRAGILE_SPANNING.operator_entry_radius;
  const stableRadius=sets.Q_STABLE_BASIS.operator_entry_radius;
  const radiusRatio=fragileRadius/stableRadius;
  const stableIn=classifyHeldoutAgainstOperatorSet(sets.Q_STABLE_BASIS,fixture.in_family_heldout_center,fixture.delta);
  const fragileIn=classifyHeldoutAgainstOperatorSet(sets.Q_FRAGILE_SPANNING,fixture.in_family_heldout_center,fixture.delta);
  const stableMiss=classifyHeldoutAgainstOperatorSet(sets.Q_STABLE_BASIS,fixture.misspecified_heldout_center,fixture.delta);
  const fragileMiss=classifyHeldoutAgainstOperatorSet(sets.Q_FRAGILE_SPANNING,fixture.misspecified_heldout_center,fixture.delta);

  let pointLaunderingRejected=false;
  try {
    validateCompatibleOperatorSetRepresentation({representation:'POINT_ESTIMATE',operator:T_STAR});
  } catch (error) {
    pointLaunderingRejected=/REJECT_POINT_ESTIMATE_LAUNDERING_OF_COMPATIBLE_OPERATOR_SET/.test(String(error?.message || error));
  }

  let finiteSampleLaunderingRejected=false;
  try {
    validateCompatibleOperatorSetRepresentation({representation:'FINITE_SAMPLES',operators:[T_STAR]});
  } catch (error) {
    finiteSampleLaunderingRejected=/REJECT_FINITE_SAMPLE_LAUNDERING_OF_EXACT_INTERVAL_OPERATOR_SET/.test(String(error?.message || error));
  }

  let selectorLeakRejected=false;
  try {
    validateNoiseAwareSelectionInput({...clone(surface),synthetic_oracle:clone(T_STAR)});
  } catch (error) {
    selectorLeakRejected=/REJECT_ORACLE_OUTPUT_LEAKAGE_IN_NOISE_AWARE_PROBE_SELECTION/.test(String(error?.message || error));
  }

  const underdeclared=classifyDeclaredNoiseBound({
    declared_delta:0.00001,
    actual_error_magnitude:0.0001,
    synthetic_truth_available:true
  });

  const stablePrediction=predictHeldoutBox(sets.Q_STABLE_BASIS,fixture.heldout_probe);
  const fragilePrediction=predictHeldoutBox(sets.Q_FRAGILE_SPANNING,fixture.heldout_probe);
  const expectedStable=[[2.9999,3.0001],[3.9999,4.0001]];
  const expectedFragile=[[2.9,3.1],[3.9,4.1]];
  const maxIntervalError=(actual,expected)=>Math.max(...actual.flatMap((pair,i)=>pair.map((value,j)=>Math.abs(value-expected[i][j]))));

  const passed=
    sets.Q_REPEAT.operator_set_status==='OPERATOR_SECOND_COLUMN_UNBOUNDED' &&
    sets.Q_REPEAT.exact_remaining_operator_dimension===2 &&
    sets.Q_FRAGILE_SPANNING.exact_remaining_operator_dimension===0 &&
    sets.Q_STABLE_BASIS.exact_remaining_operator_dimension===0 &&
    Math.abs(fragileRadius-0.1)<=1e-12 &&
    Math.abs(stableRadius-0.0001)<=1e-12 &&
    Math.abs(radiusRatio-1000)<=1e-9 &&
    hostileSelector.selected_candidate_id==='Q_FRAGILE_SPANNING' &&
    noiseAwareSelector.selected_candidate_id==='Q_STABLE_BASIS' &&
    maxIntervalError(stablePrediction.intervals,expectedStable)<=1e-12 &&
    maxIntervalError(fragilePrediction.intervals,expectedFragile)<=1e-12 &&
    stableIn.intersects===true &&
    fragileIn.intersects===true &&
    stableMiss.intersects===false &&
    stableMiss.status==='DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_BOUNDED_HELDOUT_OBSERVATION' &&
    fragileMiss.intersects===true &&
    fragileMiss.status==='HELDOUT_OBSERVATION_COMPATIBLE_WITH_OPERATOR_SET' &&
    pointLaunderingRejected &&
    finiteSampleLaunderingRejected &&
    selectorLeakRejected &&
    underdeclared.status==='DECLARED_OBSERVATION_ERROR_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH' &&
    stable(fixture)===before;

  if (!passed) throw new Error('Transition-operator bounded-noise gauntlet violated a frozen expectation.');

  return deepFreeze({
    schema:TRANSITION_OPERATOR_BOUNDED_NOISE_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    error_model:deepFreeze({
      type:'COMPONENTWISE_DETERMINISTIC_BOUND',
      delta:fixture.delta,
      probability_distribution:null,
      exact_calibration_anchor:true
    }),
    compatible_operator_sets:sets,
    noise_blind_hostile_selector:hostileSelector,
    bounded_noise_aware_selector:noiseAwareSelector,
    amplification:deepFreeze({
      fragile_operator_entry_radius:fragileRadius,
      stable_operator_entry_radius:stableRadius,
      radius_ratio:radiusRatio
    }),
    heldout:deepFreeze({
      stable_in_family:stableIn,
      fragile_in_family:fragileIn,
      stable_misspecified:stableMiss,
      fragile_misspecified:fragileMiss
    }),
    hostile_rejections:deepFreeze({
      point_estimate_laundering_rejected:pointLaunderingRejected,
      finite_sample_laundering_rejected:finiteSampleLaunderingRejected,
      selector_oracle_leakage_rejected:selectorLeakRejected,
      underdeclared_noise_bound_status:underdeclared.status
    }),
    source_inputs_preserved:stable(fixture)===before,
    gauntlet_status:'TRANSITION_OPERATOR_BOUNDED_NOISE_COMPATIBLE_SET_BOUNDARY_VALIDATED_IN_SYNTHETIC_LINEAR_FIXTURE',
    bounded_refinement_candidate:'under a common deterministic observation-error bound, exact identifying probes can induce sharply different compatible transition-operator sets; ill-conditioned probe geometry amplifies operator uncertainty and can weaken held-out model-defeat power relative to a stable probe',
    anti_equivalences:deepFreeze([
      'bounded error set != probability distribution',
      'bounded-noise result with exact anchor != general all-measurements-noisy theorem',
      'same observation-error bound != same operator-identification uncertainty',
      'nominal reconstruction != bounded-error compatible set',
      'exact operator uniqueness != small compatible operator set under noise',
      'model misspecification detectable under one probe geometry != detectable under every identifying probe geometry',
      'wrong conclusion under falsified error bound != valid-bound method failure',
      'bounded-noise operator compatible-set assay != operator tomography'
    ]),
    next_learning_action:'TEST_MULTI_PROBE_TRANSITION_OPERATOR_COMPATIBLE_SET_CONTRACTION_UNDER_BOUNDED_NOISE_WITH_ADAPTIVE_STOPPING_HELDOUT_COVERAGE_AND_OPEN_SET_MODEL_ORDER_CHALLENGES_BEFORE_ANY_OPERATOR_TOMOGRAPHY_OR_PATH_TRANSPORT_PROMOTION',
    claims:deepFreeze({
      general_robust_system_identification_theorem:false,
      statistical_consistency:false,
      probabilistic_calibration:false,
      bayesian_posterior_validity:false,
      all_measurements_noisy_robustness:false,
      optimal_experimental_design:false,
      active_learning_optimality:false,
      robust_control_theorem:false,
      operator_tomography:false,
      blind_tomography:false,
      physical_tomography:false,
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
