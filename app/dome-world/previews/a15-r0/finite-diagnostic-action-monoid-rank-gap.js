import { finitePrimeDualFixedPointRestNormalizerCertificate } from './finite-prime-dual-fixed-point-rest-normalizer.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from './finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTaskHomotopyAmnesiaRoleTomographyCertificate } from './finite-task-homotopy-amnesia-role-tomography.js';

export const FINITE_DIAGNOSTIC_ACTION_MONOID_RANK_GAP_SCHEMA='td613.dome-world.finite-diagnostic-action-monoid-rank-gap/v0.1';
export const FINITE_DIAGNOSTIC_ACTION_MONOID_RANK_GAP_PARENT_RECEIPT='2f0567e34dca5fc766f0858a6440db18e828bf00';

const POINTS=Object.freeze(['A','B','T','M','R']);
const INDEX=Object.freeze(Object.fromEntries(POINTS.map((point,index)=>[point,index])));
const IDENTITY_ID='ABTMR';
const CALIBRATION_POINT='A';
const NAMED_SEPARATOR='ATATR';
const EXPECTED_INDISPENSABLE=Object.freeze([
  'AATMR','ABAMR','ABTAR','ABTTR','ABTRR','ABRMR','ATTMR','ARTMR','TATRT',
]);
const EXPECTED_FIRST_COMPLETION=Object.freeze(['AAATM','BTBBR']);
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function canonical(value){
  if(Array.isArray(value)) return JSON.stringify(value.map(item=>JSON.parse(canonical(item))));
  if(value&&typeof value==='object') return JSON.stringify(Object.fromEntries(Object.keys(value).sort().map(key=>[key,JSON.parse(canonical(value[key]))])));
  return JSON.stringify(value);
}
const rowId=row=>row.join('');
const pointSetFromId=id=>new Set(POINTS.filter(point=>id!=='EMPTY'&&id.includes(point)));

function allFunctions(){
  const rows=[];
  const row=Array(POINTS.length);
  function walk(index){
    if(index===POINTS.length){ rows.push(Object.freeze([...row])); return; }
    for(const point of POINTS){ row[index]=point; walk(index+1); }
  }
  walk(0);
  return Object.freeze(rows);
}

function compose(left,right){
  return Object.freeze(left.map(value=>right[INDEX[value]]));
}

function generatedClosure(generatorRows,rowById){
  const seen=new Set([IDENTITY_ID]);
  const queue=[IDENTITY_ID];
  for(const row of generatorRows){
    const id=rowId(row);
    if(!seen.has(id)){ seen.add(id); queue.push(id); }
  }
  for(let cursor=0;cursor<queue.length;cursor+=1){
    const current=rowById.get(queue[cursor]);
    for(const generator of generatorRows){
      const next=compose(current,generator);
      const id=rowId(next);
      if(!rowById.has(id)) throw new Error(`generated action escaped continuous endomorphism monoid: ${id}`);
      if(!seen.has(id)){ seen.add(id); queue.push(id); }
    }
  }
  return seen;
}

function shortestDistinguishingDepth(leftIndex,rightIndex,generators,observation){
  if(observation[POINTS[leftIndex]]!==observation[POINTS[rightIndex]]) return 0;
  const start=`${leftIndex}:${rightIndex}`;
  const seen=new Set([start]);
  let frontier=[[leftIndex,rightIndex]];
  let depth=0;
  while(frontier.length){
    depth+=1;
    const nextFrontier=[];
    for(const [left,right] of frontier){
      for(const generator of generators){
        const nextLeft=INDEX[generator[left]];
        const nextRight=INDEX[generator[right]];
        if(observation[POINTS[nextLeft]]!==observation[POINTS[nextRight]]) return depth;
        const key=`${nextLeft}:${nextRight}`;
        if(!seen.has(key)){ seen.add(key); nextFrontier.push([nextLeft,nextRight]); }
      }
    }
    frontier=nextFrontier;
  }
  return Infinity;
}

function separationProfile(generators,observation){
  const pairDepths={};
  let maxFiniteDepth=0;
  let allSeparated=true;
  for(let i=0;i<POINTS.length;i+=1){
    for(let j=i+1;j<POINTS.length;j+=1){
      const depth=shortestDistinguishingDepth(i,j,generators,observation);
      pairDepths[`${POINTS[i]}:${POINTS[j]}`]=Number.isFinite(depth)?depth:null;
      if(!Number.isFinite(depth)) allSeparated=false;
      else maxFiniteDepth=Math.max(maxFiniteDepth,depth);
    }
  }
  return freeze({all_separated:allSeparated,max_finite_depth:maxFiniteDepth,pair_depths:freeze(pairDepths)});
}

export function finiteDiagnosticActionMonoidRankGapCertificate(){
  if(cached) return cached;

  const restParent=finitePrimeDualFixedPointRestNormalizerCertificate();
  const topologyParent=finiteTaskTopologyRigidityBirkhoffCertificate();
  const homotopyParent=finiteTaskHomotopyAmnesiaRoleTomographyCertificate();

  const principal=topologyParent.topology?.principal_closures||{};
  const leq=(x,y)=>pointSetFromId(principal[y]||'EMPTY').has(x);
  const observation=Object.fromEntries(POINTS.map(point=>[point,pointSetFromId(principal[point]||'EMPTY').size]));
  const immediateClassCount=new Set(Object.values(observation)).size;

  const functions=allFunctions();
  const continuous=[];
  let orderRelationChecks=0;
  for(const row of functions){
    const map=Object.fromEntries(POINTS.map((point,index)=>[point,row[index]]));
    let orderPreserving=true;
    for(const x of POINTS){
      for(const y of POINTS){
        orderRelationChecks+=1;
        if(leq(x,y)&&!leq(map[x],map[y])) orderPreserving=false;
      }
    }
    if(orderPreserving) continuous.push(row);
  }
  const rowById=new Map(continuous.map(row=>[rowId(row),row]));
  const continuousIds=new Set(rowById.keys());

  let compositionClosureChecks=0;
  let compositionClosureFailures=0;
  for(const left of continuous){
    for(const right of continuous){
      compositionClosureChecks+=1;
      if(!continuousIds.has(rowId(compose(left,right)))) compositionClosureFailures+=1;
    }
  }
  const fullActionClosure=generatedClosure(continuous,rowById);

  const universalSeparation=separationProfile(continuous,observation);
  const singleSeparators=[];
  for(const row of continuous){
    if(separationProfile([row],observation).all_separated) singleSeparators.push(rowId(row));
  }
  const namedSeparator=rowById.get(NAMED_SEPARATOR);
  const namedSeparatorProfile=namedSeparator?separationProfile([namedSeparator],observation):null;
  const namedSeparatorClosure=namedSeparator?generatedClosure([namedSeparator],rowById):new Set();

  const indispensable=[];
  for(const candidate of continuous){
    const id=rowId(candidate);
    const without=continuous.filter(row=>rowId(row)!==id);
    const closure=generatedClosure(without,rowById);
    if(!closure.has(id)) indispensable.push(id);
  }
  const indispensableRows=indispensable.map(id=>rowById.get(id));
  const indispensableClosure=generatedClosure(indispensableRows,rowById);
  const missing=continuous.filter(row=>!indispensableClosure.has(rowId(row)));

  let bestTenGeneratorClosureSize=indispensableClosure.size;
  for(const row of missing){
    const size=generatedClosure([...indispensableRows,row],rowById).size;
    bestTenGeneratorClosureSize=Math.max(bestTenGeneratorClosureSize,size);
  }

  const fullCompletionPairs=[];
  for(let i=0;i<missing.length;i+=1){
    for(let j=i+1;j<missing.length;j+=1){
      const closure=generatedClosure([...indispensableRows,missing[i],missing[j]],rowById);
      if(closure.size===continuous.length) fullCompletionPairs.push(Object.freeze([rowId(missing[i]),rowId(missing[j])]));
    }
  }
  const firstCompletion=fullCompletionPairs[0]||[];
  const exemplarGeneratorRows=[...indispensableRows,...firstCompletion.map(id=>rowById.get(id))];
  const exemplarGeneratorClosure=generatedClosure(exemplarGeneratorRows,rowById);
  const exemplarGeneratorSeparation=separationProfile(exemplarGeneratorRows,observation);

  const evaluationFiberCounts=Object.fromEntries(POINTS.map(point=>[point,0]));
  const calibrationIndex=INDEX[CALIBRATION_POINT];
  for(const row of continuous) evaluationFiberCounts[row[calibrationIndex]]+=1;

  const identity=rowById.get(IDENTITY_ID);
  const strictWitness=rowById.get('AATMR');
  const dualQuotientStrictness=Boolean(identity&&strictWitness&&
    identity[calibrationIndex]===strictWitness[calibrationIndex]&&
    rowId(identity)!==rowId(strictWitness)&&
    identity[INDEX.B]!==strictWitness[INDEX.B]);

  const parentExact=restParent.passed===true&&
    homotopyParent.passed===true&&
    topologyParent.passed===true&&
    topologyParent.domain?.task_points===5&&
    topologyParent.topology?.T0===true&&
    homotopyParent.endomorphism_census?.continuous_endomorphisms===128;

  const exact=parentExact&&
    functions.length===3125&&
    orderRelationChecks===78125&&
    continuous.length===128&&
    compositionClosureChecks===16384&&
    compositionClosureFailures===0&&
    fullActionClosure.size===128&&
    canonical(observation)===canonical({A:1,B:1,T:2,M:2,R:4})&&
    immediateClassCount===3&&
    universalSeparation.all_separated===true&&
    universalSeparation.max_finite_depth===1&&
    singleSeparators.length===37&&
    namedSeparatorProfile?.all_separated===true&&
    namedSeparatorProfile?.max_finite_depth===1&&
    namedSeparatorClosure.size===3&&
    canonical(indispensable)===canonical(EXPECTED_INDISPENSABLE)&&
    indispensable.length===9&&
    indispensableClosure.size===56&&
    missing.length===72&&
    bestTenGeneratorClosureSize===101&&
    fullCompletionPairs.length===16&&
    canonical(firstCompletion)===canonical(EXPECTED_FIRST_COMPLETION)&&
    exemplarGeneratorRows.length===11&&
    exemplarGeneratorClosure.size===128&&
    exemplarGeneratorSeparation.all_separated===true&&
    canonical(evaluationFiberCounts)===canonical({A:84,B:18,T:20,M:2,R:4})&&
    dualQuotientStrictness===true;

  cached=freeze({
    schema:FINITE_DIAGNOSTIC_ACTION_MONOID_RANK_GAP_SCHEMA,
    parent_receipt:FINITE_DIAGNOSTIC_ACTION_MONOID_RANK_GAP_PARENT_RECEIPT,
    parent_exact:parentExact,
    domain:freeze({
      task_points:freeze([...POINTS]),
      calibration_point:CALIBRATION_POINT,
      self_function_count:functions.length,
      continuous_endomorphism_count:continuous.length,
      universal_atomic_alphabet_size:continuous.length,
      observation:freeze({...observation}),
      immediate_observation_class_count:immediateClassCount,
    }),
    action_monoid:freeze({
      size:fullActionClosure.size,
      composition_closure_checks:compositionClosureChecks,
      composition_closure_failures:compositionClosureFailures,
      syntactic_action_quotient_size:fullActionClosure.size,
      K_lower_bound:POINTS.length,
      K_power_K_upper_bound:POINTS.length**POINTS.length,
    }),
    state_quotient:freeze({
      residual_state_index:POINTS.length,
      universal_distinguishing_depth:universalSeparation.max_finite_depth,
      pair_depths:universalSeparation.pair_depths,
      evaluation_fiber_counts_at_A:freeze({...evaluationFiberCounts}),
    }),
    separation:freeze({
      single_operator_separator_count:singleSeparators.length,
      separation_rank:singleSeparators.length>0?1:Infinity,
      named_single_separator:NAMED_SEPARATOR,
      named_single_separator_profile:namedSeparatorProfile,
      named_single_separator_generated_closure_size:namedSeparatorClosure.size,
    }),
    generation:freeze({
      indispensable_generator_rows:freeze([...indispensable]),
      indispensable_generator_count:indispensable.length,
      indispensable_base_closure_size:indispensableClosure.size,
      missing_after_indispensable_base:missing.length,
      one_addition_candidate_count:missing.length,
      best_ten_generator_closure_size:bestTenGeneratorClosureSize,
      two_addition_candidate_count:(missing.length*(missing.length-1))/2,
      full_two_completion_pair_count:fullCompletionPairs.length,
      full_two_completion_pairs:freeze(fullCompletionPairs),
      first_full_completion_pair:freeze([...firstCompletion]),
      atomic_action_generating_rank:indispensable.length+2,
      exemplar_generator_rows:freeze(exemplarGeneratorRows.map(rowId)),
      exemplar_generator_closure_size:exemplarGeneratorClosure.size,
    }),
    dual_quotient:freeze({
      residual_state_quotient_size:POINTS.length,
      syntactic_action_quotient_size:fullActionClosure.size,
      syntactic_congruence_strictly_refines_calibrated_state_congruence:dualQuotientStrictness,
      witness:freeze({
        left:IDENTITY_ID,
        right:'AATMR',
        calibration_point:CALIBRATION_POINT,
        shared_calibration_endpoint:identity?.[calibrationIndex]||null,
        split_state:'B',
        left_split_endpoint:identity?.[INDEX.B]||null,
        right_split_endpoint:strictWitness?.[INDEX.B]||null,
      }),
    }),
    complexity_signature:freeze({
      K:POINTS.length,
      M:fullActionClosure.size,
      r_sep:singleSeparators.length>0?1:Infinity,
      r_gen_atom:indispensable.length+2,
      D_univ:universalSeparation.max_finite_depth,
      separation_generation_rank_gap:(indispensable.length+2)-1,
    }),
    laws:freeze([
      'THE_128_CONTINUOUS_ENDOMORPHISMS_FORM_A_FINITE_DIAGNOSTIC_TRANSFORMATION_MONOID_ON_THE_EARNED_FIVE_ROLE_TASK_TOPOLOGY',
      'THE_COARSE_CLOSURE_SIZE_OBSERVATION_HAS_THREE_IMMEDIATE_CLASSES_BUT_FIVE_UNIVERSAL_RESIDUAL_MOORE_STATES',
      'A_SINGLE_CONTINUOUS_DIAGNOSTIC_OPERATOR_SUFFICES_TO_SEPARATE_ALL_FIVE_RESIDUAL_STATES_WITH_MAXIMUM_DEPTH_ONE',
      'THIRTY_SEVEN_ATOMIC_ENDOMORPHISMS_ARE_SINGLE_OPERATOR_SEPARATING_APERTURES',
      'NINE_ACTIONS_ARE_INDISPENSABLE_TO_ANY_FULL_ACTION_GENERATING_ALPHABET',
      'THE_NINE_INDISPENSABLE_ACTIONS_GENERATE_ONLY_FIFTY_SIX_OF_ONE_HUNDRED_TWENTY_EIGHT_ACTIONS',
      'NO_TENTH_ACTION_COMPLETES_THE_ACTION_MONOID_AND_THE_BEST_TEN_ACTION_CLOSURE_HAS_SIZE_ONE_HUNDRED_ONE',
      'EXACTLY_SIXTEEN_TWO_ACTION_COMPLETIONS_OF_THE_INDISPENSABLE_BASE_GENERATE_THE_FULL_ONE_HUNDRED_TWENTY_EIGHT_ACTION_MONOID',
      'THE_ATOMIC_ACTION_GENERATING_RANK_IS_ELEVEN_WHILE_THE_BEHAVIORAL_SEPARATING_RANK_IS_ONE',
      'SEPARATING_APERTURE_RANK_IS_STRICTLY_SMALLER_THAN_ACTION_GENERATING_RANK_IN_THIS_FINITE_TASK_ENDOMORPHISM_MONOID',
      'THE_SYNTACTIC_ACTION_QUOTIENT_HAS_ONE_HUNDRED_TWENTY_EIGHT_ELEMENTS_WHILE_THE_CALIBRATED_RESIDUAL_STATE_QUOTIENT_HAS_FIVE',
      'CALIBRATED_RESIDUAL_STATE_EQUIVALENCE_CAN_COEXIST_WITH_DISTINCT_GLOBAL_ACTIONS',
    ]),
    membranes:freeze([
      'FINITE_ACTION_MONOID != PHYSICAL_DYNAMICS',
      'CONTINUOUS_TASK_ENDOMORPHISM != MODEL_WEIGHT_UPDATE',
      'TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY',
      'SEPARATING_APERTURE_RANK != ACTION_GENERATING_RANK',
      'BEHAVIORAL_SEPARATION != DYNAMICAL_GENERATION',
      'FINITE_ACTION_GENERATION != UNIVERSAL_PROMPT_GENERATION',
      'ACTION_MONOID_SIZE != ONTOLOGICAL_OPERATION_COUNT',
      'SYNTACTIC_ACTION_CONGRUENCE != SERIALIZATION_IDENTITY',
      'RESIDUAL_STATE_EQUIVALENCE != GLOBAL_ACTION_EQUIVALENCE',
      'CALIBRATED_ENDPOINT_EQUALITY != GLOBAL_TRANSFORMATION_EQUALITY',
      'K_LT_M != HIDDEN_DIMENSION_MEASUREMENT',
      'D_UNIV_EQ_1 != ONE_QUERY_UNIVERSAL_IDENTIFIABILITY',
      'FINITE_GENERATING_RANK != PHYSICAL_CONTROL_RANK',
      'CONTINUOUS_ENDOMORPHISM_MONOID != GAUGE_GROUP',
      'MONOID_ACTION != GROUP_ACTION',
      'NONINVERTIBLE_ENDOMORPHISM != ERASURE_PROCESS',
      'DECLARED_CALIBRATION_POINT != INHERITED_SOURCE',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    passed:exact,
  });
  return cached;
}
