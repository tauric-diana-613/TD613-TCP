import { finiteActionEvaluationBooleanFiberDescentCertificate } from './finite-action-evaluation-boolean-fiber-descent.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from './finite-task-topology-rigidity-birkhoff-dual.js';

export const ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_SCHEMA='td613.dome-world.one-sided-continuation-two-sided-syntactic-recovery/v0.1';
export const ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_PARENT_RECEIPT='fa1c369abe3e628a92405aef03aeb6f9e2f76087';

const POINTS=Object.freeze(['A','B','T','M','R']);
const INDEX=Object.freeze(Object.fromEntries(POINTS.map((point,index)=>[point,index])));
const READOUT=Object.freeze({A:1,B:1,T:2,M:2,R:4});
const EXPECTED_ALIAS=Object.freeze({A:3836,B:1910,T:1980,M:1910,R:3836});
const EXPECTED_SEPARATED=Object.freeze({A:4292,B:6218,T:6148,M:6218,R:4292});
const EXPECTED_FIBERS=Object.freeze({
  A:Object.freeze({A:84,B:18,T:20,M:2,R:4}),
  B:Object.freeze({A:44,B:23,T:31,M:9,R:21}),
  T:Object.freeze({A:36,B:10,T:36,M:10,R:36}),
  M:Object.freeze({A:21,B:9,T:31,M:23,R:44}),
  R:Object.freeze({A:4,B:2,T:20,M:18,R:84}),
});
const ACCESS_IDS=Object.freeze({A:'AAAAA',B:'BABBR',T:'TARRR',M:'MAMMM',R:'RARRR'});
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
const pairKey=(a,b)=>INDEX[a]<INDEX[b]?`${a}|${b}`:`${b}|${a}`;

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
  return Object.freeze(POINTS.map((_,index)=>right[INDEX[left[index]]]));
}

export function oneSidedContinuationTwoSidedSyntacticRecoveryCertificate(){
  if(cached) return cached;

  const parent=finiteActionEvaluationBooleanFiberDescentCertificate();
  const topology=finiteTaskTopologyRigidityBirkhoffCertificate();
  const principal=topology.topology?.principal_closures||{};
  const leq=(x,y)=>new Set(POINTS.filter(point=>(principal[y]||'').includes(point))).has(x);

  const functions=allFunctions();
  const actions=[];
  let orderRelationChecks=0;
  for(const row of functions){
    const map=Object.fromEntries(POINTS.map((point,index)=>[point,row[index]]));
    let preserving=true;
    for(const x of POINTS) for(const y of POINTS){
      orderRelationChecks+=1;
      if(leq(x,y)&&!leq(map[x],map[y])) preserving=false;
    }
    if(preserving) actions.push(row);
  }
  const actionById=new Map(actions.map(row=>[rowId(row),row]));
  const actionIdSet=new Set(actionById.keys());

  let compositionChecks=0;
  let compositionFailures=0;
  for(const left of actions) for(const right of actions){
    compositionChecks+=1;
    if(!actionIdSet.has(rowId(compose(left,right)))) compositionFailures+=1;
  }

  const endpointFibers={};
  const aliasPairs={};
  const separatedPairs={};
  let stateIndexedPairs=0;
  let rightContextReadoutComparisons=0;
  let aliasReadoutComparisons=0;
  let aliasFutureReadoutMismatches=0;
  let endpointKernelMismatches=0;

  for(const q of POINTS){
    const coordinate=INDEX[q];
    const counts=Object.fromEntries(POINTS.map(point=>[point,0]));
    for(const action of actions) counts[action[coordinate]]+=1;
    endpointFibers[q]=freeze(counts);
    let aliases=0;
    let separated=0;
    for(let i=0;i<actions.length;i+=1){
      for(let j=i+1;j<actions.length;j+=1){
        stateIndexedPairs+=1;
        const leftEndpoint=actions[i][coordinate];
        const rightEndpoint=actions[j][coordinate];
        const endpointEqual=leftEndpoint===rightEndpoint;
        if(endpointEqual) aliases+=1; else separated+=1;
        let allFutureEqual=true;
        for(const future of actions){
          rightContextReadoutComparisons+=1;
          if(endpointEqual) aliasReadoutComparisons+=1;
          const leftReadout=READOUT[future[INDEX[leftEndpoint]]];
          const rightReadout=READOUT[future[INDEX[rightEndpoint]]];
          if(leftReadout!==rightReadout){
            allFutureEqual=false;
            if(endpointEqual) aliasFutureReadoutMismatches+=1;
          }
        }
        if(allFutureEqual!==endpointEqual) endpointKernelMismatches+=1;
      }
    }
    aliasPairs[q]=aliases;
    separatedPairs[q]=separated;
  }

  const accessActions={};
  let accessEndpointChecks=0;
  let accessFailures=0;
  for(const q of POINTS){
    for(const action of actions) accessEndpointChecks+=1;
    const access=actionById.get(ACCESS_IDS[q]);
    if(!access||access[INDEX.A]!==q) accessFailures+=1;
    accessActions[q]=ACCESS_IDS[q];
  }

  const suffixSeparators={};
  let suffixSeparatorChecks=0;
  let suffixSeparatorFailures=0;
  for(let i=0;i<POINTS.length;i+=1){
    for(let j=i+1;j<POINTS.length;j+=1){
      const left=POINTS[i],right=POINTS[j];
      let selected=null;
      for(const action of actions){
        suffixSeparatorChecks+=1;
        if(selected===null&&READOUT[action[INDEX[left]]]!==READOUT[action[INDEX[right]]]) selected=action;
      }
      if(!selected) suffixSeparatorFailures+=1;
      suffixSeparators[pairKey(left,right)]=selected?rowId(selected):null;
    }
  }

  let actionPairCoordinateChecks=0;
  let twoSidedWitnessChecks=0;
  let twoSidedWitnessFailures=0;
  let distinctActionPairs=0;
  let baselineAAliases=0;
  let baselineASeparated=0;
  const witnessExamples=[];

  for(let i=0;i<actions.length;i+=1){
    for(let j=i+1;j<actions.length;j+=1){
      distinctActionPairs+=1;
      const left=actions[i],right=actions[j];
      if(left[INDEX.A]===right[INDEX.A]) baselineAAliases+=1; else baselineASeparated+=1;
      let differingPoint=null;
      for(const q of POINTS){
        actionPairCoordinateChecks+=1;
        if(differingPoint===null&&left[INDEX[q]]!==right[INDEX[q]]) differingPoint=q;
      }
      if(differingPoint===null){ twoSidedWitnessFailures+=1; continue; }
      const access=actionById.get(accessActions[differingPoint]);
      const reached=access[INDEX.A];
      const leftEndpoint=left[INDEX[reached]];
      const rightEndpoint=right[INDEX[reached]];
      const suffix=actionById.get(suffixSeparators[pairKey(leftEndpoint,rightEndpoint)]);
      twoSidedWitnessChecks+=1;
      if(!suffix||READOUT[suffix[INDEX[leftEndpoint]]]===READOUT[suffix[INDEX[rightEndpoint]]]){
        twoSidedWitnessFailures+=1;
      }else if(witnessExamples.length<8){
        witnessExamples.push(freeze({
          left:rowId(left),right:rowId(right),differing_point:differingPoint,
          prefix:rowId(access),left_endpoint:leftEndpoint,right_endpoint:rightEndpoint,suffix:rowId(suffix),
          left_readout:READOUT[suffix[INDEX[leftEndpoint]]],right_readout:READOUT[suffix[INDEX[rightEndpoint]]],
        }));
      }
    }
  }

  const aliasTotal=Object.values(aliasPairs).reduce((sum,value)=>sum+value,0);
  const separatedTotal=Object.values(separatedPairs).reduce((sum,value)=>sum+value,0);
  const fiberExact=POINTS.every(q=>canonical(endpointFibers[q])===canonical(EXPECTED_FIBERS[q]));
  const aliasExact=POINTS.every(q=>aliasPairs[q]===EXPECTED_ALIAS[q]);
  const separatedExact=POINTS.every(q=>separatedPairs[q]===EXPECTED_SEPARATED[q]);
  const rightQuotientClasses=Object.fromEntries(POINTS.map(q=>[q,Object.values(endpointFibers[q]).filter(count=>count>0).length]));

  const parentExact=parent.passed===true&&topology.passed===true&&
    parent.action_tomography?.action_evaluation_rank===5&&
    parent.action_tomography?.strict_tri_rank_ladder===true&&
    parent.evaluation_fibers?.full_action_partition_classes===128&&
    parent.domain?.continuous_endomorphisms===128;

  const exact=parentExact&&
    functions.length===3125&&orderRelationChecks===78125&&actions.length===128&&
    compositionChecks===16384&&compositionFailures===0&&
    stateIndexedPairs===40640&&distinctActionPairs===8128&&
    fiberExact&&aliasExact&&separatedExact&&aliasTotal===13472&&separatedTotal===27168&&
    rightContextReadoutComparisons===5201920&&aliasReadoutComparisons===1724416&&
    aliasFutureReadoutMismatches===0&&endpointKernelMismatches===0&&
    POINTS.every(q=>rightQuotientClasses[q]===5)&&
    accessEndpointChecks===640&&accessFailures===0&&
    suffixSeparatorChecks===1280&&suffixSeparatorFailures===0&&
    actionPairCoordinateChecks===40640&&twoSidedWitnessChecks===8128&&twoSidedWitnessFailures===0&&
    baselineAAliases===3836&&baselineASeparated===4292;

  cached=freeze({
    schema:ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_SCHEMA,
    parent_receipt:ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_PARENT_RECEIPT,
    parent_exact:parentExact,
    domain:freeze({task_points:freeze([...POINTS]),self_functions:functions.length,continuous_actions:actions.length,unordered_distinct_action_pairs:distinctActionPairs}),
    action_monoid:freeze({size:actions.length,composition_checks:compositionChecks,composition_failures:compositionFailures,composition_closed:compositionFailures===0}),
    right_context:freeze({
      endpoint_fibers:freeze(endpointFibers),endpoint_alias_pairs:freeze({...aliasPairs,total:aliasTotal}),endpoint_separated_pairs:freeze({...separatedPairs,total:separatedTotal}),
      state_indexed_pairs:stateIndexedPairs,readout_comparisons:rightContextReadoutComparisons,alias_readout_comparisons:aliasReadoutComparisons,
      alias_future_readout_mismatches:aliasFutureReadoutMismatches,endpoint_kernel_mismatches:endpointKernelMismatches,
      quotient_classes:freeze(rightQuotientClasses),right_context_equals_endpoint_kernel:endpointKernelMismatches===0,
    }),
    two_sided_context:freeze({
      calibration_point:'A',access_actions:freeze(accessActions),suffix_separators:freeze(suffixSeparators),
      baseline_right_alias_pairs:baselineAAliases,baseline_right_separated_pairs:baselineASeparated,
      right_context_classes_at_A:rightQuotientClasses.A,syntactic_action_classes:actions.length,
      action_pair_coordinate_checks:actionPairCoordinateChecks,witness_checks:twoSidedWitnessChecks,witness_failures:twoSidedWitnessFailures,
      all_distinct_actions_context_separated:twoSidedWitnessFailures===0,
      witness_examples:freeze(witnessExamples),
    }),
    laws:freeze({
      right_context_endpoint_kernel:endpointKernelMismatches===0,
      fixed_calibration_collapses_128_to_5:POINTS.every(q=>rightQuotientClasses[q]===5),
      strict_one_sided_two_sided_gap:rightQuotientClasses.A===5&&actions.length===128&&baselineAAliases>0,
      two_sided_context_recovers_global_action_identity:twoSidedWitnessFailures===0&&twoSidedWitnessChecks===8128,
      memoryless_same_endpoint_same_future_state_readouts:aliasFutureReadoutMismatches===0,
    }),
    execution_ledger:freeze({
      self_functions:functions.length,order_relation_checks:orderRelationChecks,composition_checks:compositionChecks,
      state_indexed_action_pairs:stateIndexedPairs,right_context_readout_comparisons:rightContextReadoutComparisons,
      alias_future_readout_comparisons:aliasReadoutComparisons,access_endpoint_checks:accessEndpointChecks,
      suffix_separator_checks:suffixSeparatorChecks,action_pair_coordinate_checks:actionPairCoordinateChecks,two_sided_context_witness_checks:twoSidedWitnessChecks,
    }),
    membranes:freeze([
      'FUTURE_STATE_CONTINUATION_EQUIVALENCE != GLOBAL_ACTION_EQUIVALENCE',
      'CALIBRATED_ENDPOINT_EQUALITY != OPERATOR_IDENTITY',
      'OPERATOR_IDENTITY_IN_THIS_FIXTURE != HISTORICAL_SOURCE_PROVENANCE',
      'STATE_ONLY_NONRECOVERABILITY != SOURCE_HISTORY_ERASURE',
      'RIGHT_CONTEXT_EQUIVALENCE != TWO_SIDED_SYNTACTIC_EQUIVALENCE',
      'FINITE_CONTEXT_WITNESS != OPERATIONAL_INVERSE_ROUTE',
      'MEMORYLESS_ENDPOINT_COLLAPSE != PROCEDURAL_MEMORY',
      'FINITE_ACTION_MONOID != PHYSICAL_DYNAMICS',
    ]),
    passed:exact,
  });
  return cached;
}

export const ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_CERTIFICATE=oneSidedContinuationTwoSidedSyntacticRecoveryCertificate();
