export const TRANSITION_OPERATOR_SEQUENTIAL_CONTRACTION_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-transition-operator-sequential-contraction/v0.1';

const TOL = 1e-9;
const DELTA = 0.1;
const CLAIM_WIDTH_CEILING = 0.25;
const C1 = Object.freeze([2,1]);
const THETA_STAR = Object.freeze([1,3]);

const INITIAL_VERTICES = Object.freeze([
  Object.freeze([0,2]),
  Object.freeze([2,2]),
  Object.freeze([2,4]),
  Object.freeze([0,4])
]);

const CLAIMS = Object.freeze({
  TARGET:Object.freeze({id:'TARGET',vector:Object.freeze([1,1])}),
  GUARD:Object.freeze({id:'GUARD',vector:Object.freeze([1,-1])})
});

const GOALS = Object.freeze({
  GOAL_TARGET_ONLY:Object.freeze({
    goal_id:'GOAL_TARGET_ONLY',
    required_claims:Object.freeze(['TARGET'])
  }),
  GOAL_TARGET_AND_GUARD:Object.freeze({
    goal_id:'GOAL_TARGET_AND_GUARD',
    required_claims:Object.freeze(['TARGET','GUARD'])
  })
});

const CLAIM_PRIORITY = Object.freeze(['TARGET','GUARD']);

const CANDIDATES = Object.freeze([
  Object.freeze({
    candidate_id:'P_TARGET',
    x:Object.freeze([0,1]),
    r:Object.freeze([1,1]),
    probe_cost:1,
    claim_alignment:'TARGET'
  }),
  Object.freeze({
    candidate_id:'P_GUARD',
    x:Object.freeze([0,1]),
    r:Object.freeze([1,-1]),
    probe_cost:1,
    claim_alignment:'GUARD'
  }),
  Object.freeze({
    candidate_id:'P_TARGET_DUPLICATE',
    x:Object.freeze([0,1]),
    r:Object.freeze([1,1]),
    probe_cost:1,
    claim_alignment:'TARGET'
  }),
  Object.freeze({
    candidate_id:'P_NO_THETA_INFORMATION',
    x:Object.freeze([1,0]),
    r:Object.freeze([1,0]),
    probe_cost:1,
    claim_alignment:'NONE'
  })
]);

const OBSERVATION_CENTERS = Object.freeze({
  P_TARGET:4,
  P_GUARD:-2,
  P_TARGET_DUPLICATE:4,
  P_NO_THETA_INFORMATION:2
});

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

function vector2(value,label='vector') {
  if (!Array.isArray(value) || value.length !== 2) throw new TypeError(`${label} must have length 2`);
  return value.map((entry,index)=>finite(entry,`${label}[${index}]`));
}

function dot(left,right) {
  const a=vector2(left,'left vector');
  const b=vector2(right,'right vector');
  return a[0]*b[0]+a[1]*b[1];
}

function approx(left,right,tolerance=TOL) {
  return Math.abs(left-right) <= tolerance;
}

function lexCompare(left,right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function removeConsecutiveDuplicateVertices(vertices) {
  const out=[];
  for (const vertex of vertices) {
    if (!out.length || !approx(vertex[0],out[out.length-1][0]) || !approx(vertex[1],out[out.length-1][1])) {
      out.push(vertex);
    }
  }
  if (out.length > 1 && approx(out[0][0],out[out.length-1][0]) && approx(out[0][1],out[out.length-1][1])) {
    out.pop();
  }
  return out;
}

function polygonObject(vertices,status='COMPATIBLE_SET_NONEMPTY') {
  const clean=removeConsecutiveDuplicateVertices(vertices.map((vertex,index)=>vector2(vertex,`vertex[${index}]`)));
  return deepFreeze({
    representation:'CONVEX_POLYGON',
    vertices:clean,
    status:clean.length >= 3 ? status : clean.length === 0 ? 'COMPATIBLE_SET_EMPTY' : 'COMPATIBLE_SET_DEGENERATE'
  });
}

export function buildInitialCompatiblePolygon() {
  return polygonObject(clone(INITIAL_VERTICES));
}

export function validateCompatiblePolygonRepresentation(polygon) {
  if (!polygon || typeof polygon !== 'object') throw new TypeError('compatible polygon must be an object');
  if (['POINT_ESTIMATE','FINITE_SAMPLES','MONTE_CARLO_SAMPLES','POSTERIOR_CREDIBLE_REGION'].includes(polygon.representation)) {
    throw new Error('REJECT_COMPATIBLE_SET_LAUNDERING');
  }
  if (polygon.representation !== 'CONVEX_POLYGON' || !Array.isArray(polygon.vertices)) {
    throw new Error('REJECT_COMPATIBLE_SET_LAUNDERING');
  }
  polygon.vertices.forEach((vertex,index)=>vector2(vertex,`polygon.vertices[${index}]`));
  return true;
}

export function polygonArea(polygon) {
  validateCompatiblePolygonRepresentation(polygon);
  const vertices=polygon.vertices;
  if (vertices.length < 3) return 0;
  let twiceArea=0;
  for (let index=0; index<vertices.length; index+=1) {
    const [x1,y1]=vertices[index];
    const [x2,y2]=vertices[(index+1)%vertices.length];
    twiceArea += x1*y2-x2*y1;
  }
  return Math.abs(twiceArea)/2;
}

export function functionalInterval(polygon,functional) {
  validateCompatiblePolygonRepresentation(polygon);
  const f=vector2(functional,'functional');
  if (!polygon.vertices.length) {
    return deepFreeze({min:null,max:null,width:null,status:'EMPTY_COMPATIBLE_SET'});
  }
  const values=polygon.vertices.map(vertex=>dot(f,vertex));
  const min=Math.min(...values);
  const max=Math.max(...values);
  return deepFreeze({min,max,width:max-min,status:'FUNCTIONAL_INTERVAL_DEFINED'});
}

function clipHalfPlane(polygon,a,b,c) {
  validateCompatiblePolygonRepresentation(polygon);
  if (!polygon.vertices.length) return polygonObject([],'COMPATIBLE_SET_EMPTY');
  const input=polygon.vertices;
  const output=[];
  const signed=vertex=>a*vertex[0]+b*vertex[1]-c;
  for (let index=0; index<input.length; index+=1) {
    const current=input[index];
    const next=input[(index+1)%input.length];
    const currentValue=signed(current);
    const nextValue=signed(next);
    const currentInside=currentValue <= TOL;
    const nextInside=nextValue <= TOL;
    if (currentInside) output.push(clone(current));
    if (currentInside !== nextInside) {
      const denominator=currentValue-nextValue;
      if (Math.abs(denominator) > Number.EPSILON) {
        const t=currentValue/denominator;
        output.push([
          current[0]+t*(next[0]-current[0]),
          current[1]+t*(next[1]-current[1])
        ]);
      }
    }
  }
  return polygonObject(output);
}

export function clipPolygonByFunctionalStrip(polygon,functional,low,high) {
  validateCompatiblePolygonRepresentation(polygon);
  const [a,b]=vector2(functional,'strip functional');
  const lo=finite(low,'strip low');
  const hi=finite(high,'strip high');
  if (lo > hi + TOL) throw new RangeError('strip low must not exceed high');
  let clipped=clipHalfPlane(polygon,a,b,hi);
  clipped=clipHalfPlane(clipped,-a,-b,-lo);
  return clipped;
}

function expectedCandidate(candidateId) {
  return CANDIDATES.find(candidate=>candidate.candidate_id===candidateId) || null;
}

export function validateSequentialProbeCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate must be an object');
  const expected=expectedCandidate(candidate.candidate_id);
  if (!expected || stable(candidate)!==stable(expected)) throw new Error('REJECT_SEQUENTIAL_PROBE_CANDIDATE_MUTATION');
  return true;
}

export function validateSequentialGoal(goal) {
  if (!goal || typeof goal !== 'object') throw new TypeError('goal must be an object');
  const expected=GOALS[goal.goal_id];
  if (!expected || stable(goal)!==stable(expected)) throw new Error('REJECT_SEQUENTIAL_GOAL_MUTATION');
  return true;
}

function stripForObservation(candidate,observedCenter,delta=DELTA) {
  validateSequentialProbeCandidate(candidate);
  const d=finite(delta,'delta');
  if (d < 0) throw new RangeError('delta must be non-negative');
  const [alpha,beta]=vector2(candidate.x,`${candidate.candidate_id}.x`);
  const r=vector2(candidate.r,`${candidate.candidate_id}.r`);
  const center=finite(observedCenter,'observed center');
  const exactFirstContribution=alpha*dot(r,C1);
  if (Math.abs(beta) <= Number.EPSILON) {
    const predicted=exactFirstContribution;
    const consistent=Math.abs(center-predicted) <= d+TOL;
    return deepFreeze({
      informative:false,
      functional:null,
      low:null,
      high:null,
      exact_first_column_prediction:predicted,
      observation_center:center,
      consistent,
      status:consistent ? 'NO_THETA_CONTRACTION' : 'EXACT_CALIBRATION_COLUMN_CONTRADICTION'
    });
  }
  const rawLow=(center-exactFirstContribution-d)/beta;
  const rawHigh=(center-exactFirstContribution+d)/beta;
  return deepFreeze({
    informative:true,
    functional:r,
    low:Math.min(rawLow,rawHigh),
    high:Math.max(rawLow,rawHigh),
    exact_first_column_prediction:exactFirstContribution,
    observation_center:center,
    consistent:true,
    status:'BOUNDED_FUNCTIONAL_STRIP'
  });
}

export function applySequentialObservation(polygon,candidate,observedCenter,delta=DELTA) {
  validateCompatiblePolygonRepresentation(polygon);
  const beforeArea=polygonArea(polygon);
  const strip=stripForObservation(candidate,observedCenter,delta);
  if (!strip.consistent) {
    return deepFreeze({
      polygon:polygonObject([],'COMPATIBLE_SET_EMPTY'),
      strip,
      area_before:beforeArea,
      area_after:0,
      area_contraction:beforeArea,
      status:'DECLARED_MODEL_AND_OBSERVATION_CONSTRAINTS_INCONSISTENT'
    });
  }
  if (!strip.informative) {
    return deepFreeze({
      polygon:clone(polygon),
      strip,
      area_before:beforeArea,
      area_after:beforeArea,
      area_contraction:0,
      status:'NO_THETA_CONTRACTION'
    });
  }
  const next=clipPolygonByFunctionalStrip(polygon,strip.functional,strip.low,strip.high);
  const afterArea=polygonArea(next);
  return deepFreeze({
    polygon:next,
    strip,
    area_before:beforeArea,
    area_after:afterArea,
    area_contraction:beforeArea-afterArea,
    status:next.vertices.length
      ? approx(beforeArea,afterArea)
        ? 'REDUNDANT_BOUNDED_STRIP_NO_NEW_COMPATIBLE_SET_INFORMATION'
        : 'COMPATIBLE_SET_CONTRACTED'
      : 'DECLARED_MODEL_AND_OBSERVATION_CONSTRAINTS_INCONSISTENT'
  });
}

export function claimDiagnostics(polygon) {
  const target=functionalInterval(polygon,CLAIMS.TARGET.vector);
  const guard=functionalInterval(polygon,CLAIMS.GUARD.vector);
  return deepFreeze({
    TARGET:{...target,sufficient:target.width!==null && target.width<=CLAIM_WIDTH_CEILING+TOL},
    GUARD:{...guard,sufficient:guard.width!==null && guard.width<=CLAIM_WIDTH_CEILING+TOL}
  });
}

function selectionCandidateView(candidate) {
  validateSequentialProbeCandidate(candidate);
  return deepFreeze({
    candidate_id:candidate.candidate_id,
    x:clone(candidate.x),
    r:clone(candidate.r),
    probe_cost:candidate.probe_cost,
    claim_alignment:candidate.claim_alignment
  });
}

export function buildSequentialSelectionInput({polygon,goal}) {
  validateCompatiblePolygonRepresentation(polygon);
  validateSequentialGoal(goal);
  return deepFreeze({
    current_polygon:clone(polygon),
    candidates:CANDIDATES.map(selectionCandidateView),
    declared_delta:DELTA,
    claim_width_ceiling:CLAIM_WIDTH_CEILING,
    goal:clone(goal),
    claim_priority:clone(CLAIM_PRIORITY)
  });
}

export function validateSequentialSelectionInput(input) {
  if (!input || typeof input !== 'object') throw new TypeError('selection input must be an object');
  for (const forbidden of [
    'theta_star','T_star','synthetic_oracle','candidate_future_outputs','future_outputs',
    'candidate_observed_centers','observed_centers','heldout_observations','open_set_outputs'
  ]) {
    if (forbidden in input) throw new Error('REJECT_ORACLE_LEAKAGE_IN_SEQUENTIAL_PROBE_SELECTION');
  }
  validateCompatiblePolygonRepresentation(input.current_polygon);
  if (!Array.isArray(input.candidates) || input.candidates.length!==CANDIDATES.length) {
    throw new Error('REJECT_SEQUENTIAL_PROBE_CANDIDATE_MUTATION');
  }
  input.candidates.forEach(candidate=>{
    const expected=expectedCandidate(candidate.candidate_id);
    if (!expected || stable(candidate)!==stable(selectionCandidateView(expected))) {
      throw new Error('REJECT_SEQUENTIAL_PROBE_CANDIDATE_MUTATION');
    }
  });
  if (!approx(Number(input.declared_delta),DELTA,1e-12)) throw new Error('REJECT_DECLARED_SEQUENTIAL_NOISE_BOUND_MUTATION');
  if (!approx(Number(input.claim_width_ceiling),CLAIM_WIDTH_CEILING,1e-12)) throw new Error('REJECT_SEQUENTIAL_GOAL_MUTATION');
  validateSequentialGoal(input.goal);
  if (stable(input.claim_priority)!==stable(CLAIM_PRIORITY)) throw new Error('REJECT_SEQUENTIAL_GOAL_MUTATION');
  return true;
}

function normalizedExcess(width) {
  return width/CLAIM_WIDTH_CEILING;
}

export function sequentialClaimConditionedSelector(input) {
  validateSequentialSelectionInput(input);
  const diagnostics=claimDiagnostics(input.current_polygon);
  const unresolved=input.goal.required_claims
    .map(claimId=>({
      claim_id:claimId,
      width:diagnostics[claimId].width,
      normalized_excess:normalizedExcess(diagnostics[claimId].width),
      priority:input.claim_priority.indexOf(claimId)
    }))
    .filter(item=>item.width>input.claim_width_ceiling+TOL)
    .sort((left,right)=>
      right.normalized_excess-left.normalized_excess || left.priority-right.priority
    );

  if (!unresolved.length) {
    return deepFreeze({
      status:'STOP',
      stopping_status:input.goal.goal_id==='GOAL_TARGET_ONLY'
        ? 'CLAIM_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET'
        : 'DECLARED_CLAIM_SET_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET',
      selected_candidate_id:null,
      diagnostics,
      future_outputs_consulted:false,
      automatic_execution:false,
      promotion_authority:false
    });
  }

  const targetClaim=unresolved[0].claim_id;
  const eligible=input.candidates
    .filter(candidate=>candidate.claim_alignment===targetClaim)
    .map(candidate=>{
      const beta=Math.abs(vector2(candidate.x,`${candidate.candidate_id}.x`)[1]);
      return {
        candidate_id:candidate.candidate_id,
        beta,
        guaranteed_strip_half_width:beta<=Number.EPSILON ? Infinity : input.declared_delta/beta
      };
    })
    .filter(candidate=>Number.isFinite(candidate.guaranteed_strip_half_width))
    .sort((left,right)=>
      left.guaranteed_strip_half_width-right.guaranteed_strip_half_width ||
      lexCompare(left.candidate_id,right.candidate_id)
    );

  return deepFreeze({
    status:'SELECT_PROBE',
    target_claim:targetClaim,
    selected_candidate_id:eligible[0]?.candidate_id || null,
    diagnostics,
    candidate_evaluations:eligible,
    future_outputs_consulted:false,
    automatic_execution:false,
    promotion_authority:false
  });
}

function observationCenter(candidateId) {
  if (!(candidateId in OBSERVATION_CENTERS)) throw new Error('UNKNOWN_SYNTHETIC_OBSERVATION_CENTER');
  return OBSERVATION_CENTERS[candidateId];
}

export function predictionIntervalForScalarReadout(polygon,{x,r}) {
  validateCompatiblePolygonRepresentation(polygon);
  const [alpha,beta]=vector2(x,'heldout x');
  const readout=vector2(r,'heldout r');
  if (!polygon.vertices.length) return deepFreeze({status:'EMPTY_COMPATIBLE_SET',min:null,max:null,width:null});
  const thetaInterval=functionalInterval(polygon,readout);
  const fixed=alpha*dot(readout,C1);
  const values=[fixed+beta*thetaInterval.min,fixed+beta*thetaInterval.max];
  const min=Math.min(...values);
  const max=Math.max(...values);
  return deepFreeze({status:'PREDICTION_INTERVAL_DEFINED',min,max,width:max-min});
}

export function observationInterval(center,delta=DELTA) {
  const c=finite(center,'observation center');
  const d=finite(delta,'delta');
  if (d<0) throw new RangeError('delta must be non-negative');
  return deepFreeze({min:c-d,max:c+d,width:2*d});
}

function intervalsIntersect(left,right) {
  return Math.max(left.min,right.min) <= Math.min(left.max,right.max)+TOL;
}

export function classifyHeldoutScalar({polygon,x,r,observed_center,delta=DELTA,covered_status='HELDOUT_OBSERVATION_COMPATIBLE_WITH_CURRENT_OPERATOR_SET'}) {
  const prediction=predictionIntervalForScalarReadout(polygon,{x,r});
  const observation=observationInterval(observed_center,delta);
  if (prediction.status==='EMPTY_COMPATIBLE_SET') {
    return deepFreeze({prediction,observation,intersects:false,status:'DECLARED_MODEL_AND_OBSERVATION_CONSTRAINTS_INCONSISTENT'});
  }
  const intersects=intervalsIntersect(prediction,observation);
  return deepFreeze({
    prediction,
    observation,
    intersects,
    status:intersects ? covered_status : 'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION',
    silent_refit:false,
    silent_noise_inflation:false,
    silent_support_expansion:false,
    silent_model_order_upgrade:false
  });
}

function runGoal(goal) {
  validateSequentialGoal(goal);
  let polygon=buildInitialCompatiblePolygon();
  const history=[];
  for (let step=0; step<8; step+=1) {
    const input=buildSequentialSelectionInput({polygon,goal});
    const selection=sequentialClaimConditionedSelector(input);
    if (selection.status==='STOP') {
      return deepFreeze({
        goal_id:goal.goal_id,
        history,
        final_polygon:polygon,
        final_diagnostics:claimDiagnostics(polygon),
        stop:selection
      });
    }
    const candidate=expectedCandidate(selection.selected_candidate_id);
    if (!candidate) throw new Error('SELECTOR_RETURNED_UNKNOWN_PROBE');
    const update=applySequentialObservation(polygon,candidate,observationCenter(candidate.candidate_id),DELTA);
    history.push(deepFreeze({selection,update}));
    polygon=update.polygon;
    if (!polygon.vertices.length) break;
  }
  throw new Error('SEQUENTIAL_STOPPING_NOT_REACHED_WITHIN_BOUND');
}

export function buildTransitionOperatorSequentialContractionFixture() {
  return deepFreeze({
    schema:TRANSITION_OPERATOR_SEQUENTIAL_CONTRACTION_SCHEMA,
    exact_first_column:clone(C1),
    theta_star:clone(THETA_STAR),
    declared_parameter_support:clone(INITIAL_VERTICES),
    delta:DELTA,
    claim_width_ceiling:CLAIM_WIDTH_CEILING,
    claims:clone(CLAIMS),
    goals:clone(GOALS),
    candidates:clone(CANDIDATES),
    synthetic_observation_centers:clone(OBSERVATION_CENTERS)
  });
}

export function runTransitionOperatorSequentialContractionGauntlet() {
  const fixture=buildTransitionOperatorSequentialContractionFixture();
  const before=stable(fixture);
  const p0=buildInitialCompatiblePolygon();
  const targetCandidate=expectedCandidate('P_TARGET');
  const guardCandidate=expectedCandidate('P_GUARD');
  const duplicateCandidate=expectedCandidate('P_TARGET_DUPLICATE');

  const targetUpdate=applySequentialObservation(p0,targetCandidate,observationCenter('P_TARGET'),DELTA);
  const p1=targetUpdate.polygon;
  const p1Diagnostics=claimDiagnostics(p1);
  const guardUpdate=applySequentialObservation(p1,guardCandidate,observationCenter('P_GUARD'),DELTA);
  const p2=guardUpdate.polygon;
  const p2Diagnostics=claimDiagnostics(p2);
  const duplicateUpdate=applySequentialObservation(p1,duplicateCandidate,observationCenter('P_TARGET_DUPLICATE'),DELTA);

  const targetOnly=runGoal(GOALS.GOAL_TARGET_ONLY);
  const targetAndGuard=runGoal(GOALS.GOAL_TARGET_AND_GUARD);

  const guardHeldoutAfterTarget=classifyHeldoutScalar({
    polygon:p1,
    x:[0,1],
    r:[1,-1],
    observed_center:-2,
    delta:DELTA,
    covered_status:'HELDOUT_GUARD_OBSERVATION_COVERED_BUT_NOT_NARROWLY_IDENTIFIED'
  });

  const inFamilyHeldout=classifyHeldoutScalar({
    polygon:p2,
    x:[0,1],
    r:[1,0],
    observed_center:1,
    delta:DELTA
  });

  const openSetHeldout=classifyHeldoutScalar({
    polygon:p2,
    x:[0,1],
    r:[1,0],
    observed_center:1.5,
    delta:DELTA
  });

  const emptySetUpdate=applySequentialObservation(p2,guardCandidate,10,DELTA);

  let pointLaunderingRejected=false;
  try {
    validateCompatiblePolygonRepresentation({representation:'POINT_ESTIMATE',theta:[1,3]});
  } catch (error) {
    pointLaunderingRejected=/REJECT_COMPATIBLE_SET_LAUNDERING/.test(String(error?.message || error));
  }

  let finiteSampleLaunderingRejected=false;
  try {
    validateCompatiblePolygonRepresentation({representation:'FINITE_SAMPLES',samples:[[1,3]]});
  } catch (error) {
    finiteSampleLaunderingRejected=/REJECT_COMPATIBLE_SET_LAUNDERING/.test(String(error?.message || error));
  }

  let selectorLeakRejected=false;
  try {
    const leaky={...clone(buildSequentialSelectionInput({polygon:p0,goal:GOALS.GOAL_TARGET_AND_GUARD})),theta_star:[1,3]};
    validateSequentialSelectionInput(leaky);
  } catch (error) {
    selectorLeakRejected=/REJECT_ORACLE_LEAKAGE_IN_SEQUENTIAL_PROBE_SELECTION/.test(String(error?.message || error));
  }

  const after=stable(fixture);

  return deepFreeze({
    schema:TRANSITION_OPERATOR_SEQUENTIAL_CONTRACTION_SCHEMA,
    initial:{
      area:polygonArea(p0),
      diagnostics:claimDiagnostics(p0)
    },
    after_target:{
      area:polygonArea(p1),
      diagnostics:p1Diagnostics,
      update_status:targetUpdate.status
    },
    after_target_and_guard:{
      area:polygonArea(p2),
      diagnostics:p2Diagnostics,
      theta1_interval:functionalInterval(p2,[1,0]),
      theta2_interval:functionalInterval(p2,[0,1]),
      nonpoint:polygonArea(p2)>TOL,
      update_status:guardUpdate.status
    },
    stopping:{
      target_only:targetOnly,
      target_and_guard:targetAndGuard
    },
    redundancy:{
      update_status:duplicateUpdate.status,
      area_before:duplicateUpdate.area_before,
      area_after:duplicateUpdate.area_after,
      area_contraction:duplicateUpdate.area_contraction,
      diagnostics_after:claimDiagnostics(duplicateUpdate.polygon)
    },
    heldout:{
      guard_after_target:guardHeldoutAfterTarget,
      in_family_after_both:inFamilyHeldout,
      open_set_after_both:openSetHeldout
    },
    empty_set_control:{
      status:emptySetUpdate.status,
      polygon_status:emptySetUpdate.polygon.status,
      area:polygonArea(emptySetUpdate.polygon)
    },
    hostiles:{
      point_laundering_rejected:pointLaunderingRejected,
      finite_sample_laundering_rejected:finiteSampleLaunderingRejected,
      selector_oracle_leak_rejected:selectorLeakRejected
    },
    fixture_immutable:before===after,
    canonical_bounded_claim:
      'SEQUENTIAL_DETERMINISTIC_BOUNDED_ERROR_PROBES_CAN_CONTRACT_A_COMPLETE_COMPATIBLE_TRANSITION_OPERATOR_SET_TO_CLAIM_SUFFICIENT_NONPOINT_REGIONS_WITH_CLAIM_CONDITIONED_STOPPING_WHILE_REDUNDANT_PROBES_ADD_NO_SET_INFORMATION_AND_HELDOUT_OBSERVATIONS_CAN_DEFEAT_THE_DECLARED_LINEAR_MODEL_FAMILY_IN_THE_AUTHORED_SYNTHETIC_FIXTURE',
    automatic_execution:false,
    installed_aperture_mutation:false,
    a16_reopened:false,
    live_ash_mutation:false,
    production_authority:false,
    vercel_authority:false,
    operator_tomography_earned:false,
    path_transport_earned:false,
    holonomy_earned:false
  });
}
