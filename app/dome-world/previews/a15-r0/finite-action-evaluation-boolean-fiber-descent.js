import { finiteDiagnosticActionMonoidRankGapCertificate } from './finite-diagnostic-action-monoid-rank-gap.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from './finite-task-topology-rigidity-birkhoff-dual.js';

export const FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_SCHEMA='td613.dome-world.finite-action-evaluation-boolean-fiber-descent/v0.1';
export const FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_PARENT_RECEIPT='ec837736399e2b5e65c281c1fc88f18cc99709ad';

const POINTS=Object.freeze(['A','B','T','M','R']);
const INDEX=Object.freeze(Object.fromEntries(POINTS.map((point,index)=>[point,index])));
const EXPECTED=Object.freeze({
  EMPTY:[1,128],A:[5,84],B:[5,44],T:[5,36],M:[5,44],R:[5,84],
  AB:[19,32],AT:[10,36],AM:[10,21],AR:[10,48],BT:[19,16],BM:[24,14],BR:[10,21],TM:[19,16],TR:[10,36],MR:[19,32],
  ABT:[37,16],ABM:[42,8],ABR:[26,12],ATM:[26,9],ATR:[16,16],AMR:[26,12],BTM:[72,4],BTR:[26,9],BMR:[42,8],TMR:[37,16],
  ABTM:[98,4],ABTR:[46,4],ABMR:[64,3],ATMR:[46,4],BTMR:[98,4],ABTMR:[128,1],
});
const EXPECTED_DELETIONS=Object.freeze({
  A:{observed:'BTMR',classes:98,max_fiber:4,fiber_spectrum:{1:76,2:18,4:4},ambiguous_classes:22,ambiguous_actions:52,colliding_pairs:42},
  B:{observed:'ATMR',classes:46,max_fiber:4,fiber_spectrum:{1:6,2:19,4:21},ambiguous_classes:40,ambiguous_actions:122,colliding_pairs:145},
  T:{observed:'ABMR',classes:64,max_fiber:3,fiber_spectrum:{1:16,2:32,3:16},ambiguous_classes:48,ambiguous_actions:112,colliding_pairs:80},
  M:{observed:'ABTR',classes:46,max_fiber:4,fiber_spectrum:{1:6,2:19,4:21},ambiguous_classes:40,ambiguous_actions:122,colliding_pairs:145},
  R:{observed:'ABTM',classes:98,max_fiber:4,fiber_spectrum:{1:76,2:18,4:4},ambiguous_classes:22,ambiguous_actions:52,colliding_pairs:42},
});
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
const pointSetFromId=id=>new Set(POINTS.filter(point=>id!=='EMPTY'&&id.includes(point)));
const subsetFromMask=mask=>POINTS.filter((_,index)=>mask&(1<<index));
const subsetId=subset=>subset.join('')||'EMPTY';
const maskFromSubset=subset=>subset.reduce((mask,point)=>mask|(1<<INDEX[point]),0);

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

function partitionFor(rows,subset){
  const groups=new Map();
  for(let action=0;action<rows.length;action+=1){
    const signature=subset.map(point=>rows[action][INDEX[point]]).join('|');
    if(!groups.has(signature)) groups.set(signature,[]);
    groups.get(signature).push(action);
  }
  const blocks=[...groups.values()].map(block=>Object.freeze([...block])).sort((a,b)=>a[0]-b[0]);
  const labels=Array(rows.length).fill(-1);
  blocks.forEach((block,label)=>block.forEach(action=>{labels[action]=label;}));
  const spectrum={};
  for(const block of blocks) spectrum[block.length]=(spectrum[block.length]||0)+1;
  return freeze({
    subset:freeze([...subset]),subset_id:subsetId(subset),blocks:freeze(blocks),labels:freeze(labels),
    class_count:blocks.length,max_fiber:Math.max(...blocks.map(block=>block.length)),fiber_spectrum:freeze({...spectrum}),
  });
}

function partitionKey(partition){
  return partition.blocks.map(block=>block.join(',')).join('|');
}
function samePartition(left,right){ return partitionKey(left)===partitionKey(right); }
function refines(fine,coarse){
  for(const block of fine.blocks){
    const label=coarse.labels[block[0]];
    for(const action of block) if(coarse.labels[action]!==label) return false;
  }
  return true;
}
function meetPartitions(left,right){
  const groups=new Map();
  for(let action=0;action<left.labels.length;action+=1){
    const key=`${left.labels[action]}:${right.labels[action]}`;
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(action);
  }
  const blocks=[...groups.values()].sort((a,b)=>a[0]-b[0]);
  const labels=Array(left.labels.length).fill(-1);
  blocks.forEach((block,label)=>block.forEach(action=>{labels[action]=label;}));
  return {blocks,labels};
}
function joinPartitions(left,right){
  const n=left.labels.length;
  const parent=Array.from({length:n},(_,i)=>i);
  function find(x){ while(parent[x]!==x){ parent[x]=parent[parent[x]]; x=parent[x]; } return x; }
  function union(a,b){ a=find(a); b=find(b); if(a!==b) parent[b]=a; }
  for(const partition of [left,right]){
    for(const block of partition.blocks){
      for(let i=1;i<block.length;i+=1) union(block[0],block[i]);
    }
  }
  const groups=new Map();
  for(let action=0;action<n;action+=1){ const root=find(action); if(!groups.has(root)) groups.set(root,[]); groups.get(root).push(action); }
  const blocks=[...groups.values()].sort((a,b)=>a[0]-b[0]);
  const labels=Array(n).fill(-1);
  blocks.forEach((block,label)=>block.forEach(action=>{labels[action]=label;}));
  return {blocks,labels};
}
function plainPartitionKey(partition){ return partition.blocks.map(block=>block.join(',')).join('|'); }

function calibrationClosure(rows,partition){
  const closure=[];
  for(const point of POINTS){
    const coordinate=INDEX[point];
    let determined=true;
    for(const block of partition.blocks){
      const value=rows[block[0]][coordinate];
      if(block.some(action=>rows[action][coordinate]!==value)){ determined=false; break; }
    }
    if(determined) closure.push(point);
  }
  return closure;
}

function deletionAudit(partition){
  const ambiguous=partition.blocks.filter(block=>block.length>1);
  return freeze({
    observed:partition.subset_id,
    classes:partition.class_count,
    max_fiber:partition.max_fiber,
    fiber_spectrum:partition.fiber_spectrum,
    ambiguous_classes:ambiguous.length,
    ambiguous_actions:ambiguous.reduce((sum,block)=>sum+block.length,0),
    colliding_pairs:ambiguous.reduce((sum,block)=>sum+(block.length*(block.length-1))/2,0),
  });
}

export function finiteActionEvaluationBooleanFiberDescentCertificate(){
  if(cached) return cached;
  const rankParent=finiteDiagnosticActionMonoidRankGapCertificate();
  const topologyParent=finiteTaskTopologyRigidityBirkhoffCertificate();
  const principal=topologyParent.topology?.principal_closures||{};
  const leq=(x,y)=>pointSetFromId(principal[y]||'EMPTY').has(x);

  const functions=allFunctions();
  const continuous=[];
  let orderRelationChecks=0;
  for(const row of functions){
    const map=Object.fromEntries(POINTS.map((point,index)=>[point,row[index]]));
    let orderPreserving=true;
    for(const x of POINTS) for(const y of POINTS){
      orderRelationChecks+=1;
      if(leq(x,y)&&!leq(map[x],map[y])) orderPreserving=false;
    }
    if(orderPreserving) continuous.push(row);
  }

  const partitions={};
  let subsetActionSignatureEvaluations=0;
  for(let mask=0;mask<32;mask+=1){
    const subset=subsetFromMask(mask);
    subsetActionSignatureEvaluations+=continuous.length;
    partitions[subsetId(subset)]=partitionFor(continuous,subset);
  }
  const distinctPartitionCount=new Set(Object.values(partitions).map(partitionKey)).size;

  const closureRows={};
  let closureIdentityCount=0;
  let closureCoordinateTargets=0;
  for(const partition of Object.values(partitions)){
    closureCoordinateTargets+=POINTS.length;
    const closure=calibrationClosure(continuous,partition);
    closureRows[partition.subset_id]=freeze([...closure]);
    if(canonical(closure)===canonical(partition.subset)) closureIdentityCount+=1;
  }

  let strictHasseRefinements=0;
  let hasseEdges=0;
  for(let mask=0;mask<32;mask+=1){
    const source=partitions[subsetId(subsetFromMask(mask))];
    for(let bit=0;bit<POINTS.length;bit+=1){
      if(mask&(1<<bit)) continue;
      hasseEdges+=1;
      const target=partitions[subsetId(subsetFromMask(mask|(1<<bit)))];
      if(refines(target,source)&&!samePartition(target,source)) strictHasseRefinements+=1;
    }
  }

  let orderedSubsetPairs=0;
  let orderEmbeddingPasses=0;
  let meetIdentityPasses=0;
  let joinIdentityPasses=0;
  for(let leftMask=0;leftMask<32;leftMask+=1){
    const left=partitions[subsetId(subsetFromMask(leftMask))];
    for(let rightMask=0;rightMask<32;rightMask+=1){
      orderedSubsetPairs+=1;
      const right=partitions[subsetId(subsetFromMask(rightMask))];
      const expectedRefinement=(leftMask&rightMask)===rightMask;
      if(refines(left,right)===expectedRefinement) orderEmbeddingPasses+=1;
      const union=partitions[subsetId(subsetFromMask(leftMask|rightMask))];
      const intersection=partitions[subsetId(subsetFromMask(leftMask&rightMask))];
      if(plainPartitionKey(meetPartitions(left,right))===partitionKey(union)) meetIdentityPasses+=1;
      if(plainPartitionKey(joinPartitions(left,right))===partitionKey(intersection)) joinIdentityPasses+=1;
    }
  }

  const injectiveSubsets=Object.values(partitions).filter(row=>row.class_count===continuous.length);
  const properInjective=injectiveSubsets.filter(row=>row.subset.length<POINTS.length);
  const actionEvaluationRank=Math.min(...injectiveSubsets.map(row=>row.subset.length));

  const deletionAudits={};
  for(const omitted of POINTS){
    const observed=POINTS.filter(point=>point!==omitted);
    deletionAudits[omitted]=deletionAudit(partitions[subsetId(observed)]);
  }

  const subsetCensus=Object.fromEntries(Object.entries(partitions).map(([id,row])=>[id,freeze({size:row.subset.length,class_count:row.class_count,max_fiber:row.max_fiber,fiber_spectrum:row.fiber_spectrum})]));
  const subsetExpectationsMatch=Object.entries(EXPECTED).every(([id,[classes,maxFiber]])=>partitions[id]?.class_count===classes&&partitions[id]?.max_fiber===maxFiber);
  const deletionExpectationsMatch=POINTS.every(point=>canonical(deletionAudits[point])===canonical(EXPECTED_DELETIONS[point]));

  const parentExact=rankParent.passed===true&&topologyParent.passed===true&&
    rankParent.action_monoid?.size===128&&rankParent.complexity_signature?.r_sep===1&&rankParent.complexity_signature?.r_gen_atom===11&&
    topologyParent.domain?.task_points===5&&topologyParent.topology?.T0===true;

  const triRank=freeze([rankParent.complexity_signature?.r_sep,actionEvaluationRank,rankParent.complexity_signature?.r_gen_atom]);
  const exact=parentExact&&
    functions.length===3125&&orderRelationChecks===78125&&continuous.length===128&&
    Object.keys(partitions).length===32&&subsetActionSignatureEvaluations===4096&&distinctPartitionCount===32&&
    closureIdentityCount===32&&closureCoordinateTargets===160&&
    hasseEdges===80&&strictHasseRefinements===80&&
    orderedSubsetPairs===1024&&orderEmbeddingPasses===1024&&meetIdentityPasses===1024&&joinIdentityPasses===1024&&
    injectiveSubsets.length===1&&properInjective.length===0&&actionEvaluationRank===5&&
    subsetExpectationsMatch&&deletionExpectationsMatch&&canonical(triRank)===canonical([1,5,11]);

  cached=freeze({
    schema:FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_SCHEMA,
    parent_receipt:FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_PARENT_RECEIPT,
    parent_exact:parentExact,
    domain:freeze({task_points:freeze([...POINTS]),self_functions:functions.length,continuous_endomorphisms:continuous.length,calibration_subsets:Object.keys(partitions).length}),
    evaluation_fibers:freeze({subset_census:freeze(subsetCensus),distinct_partition_count:distinctPartitionCount,full_action_partition_classes:partitions.ABTMR.class_count}),
    calibration_closure:freeze({rows:freeze(closureRows),identity_closure_count:closureIdentityCount,total_subsets:32,all_coordinates_irreducible:closureIdentityCount===32}),
    boolean_lattice:freeze({
      hasse_edges:hasseEdges,strict_hasse_refinements:strictHasseRefinements,
      ordered_subset_pairs:orderedSubsetPairs,order_embedding_passes:orderEmbeddingPasses,
      meet_identity_passes:meetIdentityPasses,join_identity_passes:joinIdentityPasses,
      order_reversing_boolean_sublattice:orderEmbeddingPasses===1024&&meetIdentityPasses===1024&&joinIdentityPasses===1024&&distinctPartitionCount===32,
    }),
    action_tomography:freeze({
      action_evaluation_rank:actionEvaluationRank,
      injective_subset_count:injectiveSubsets.length,
      proper_injective_subset_count:properInjective.length,
      unique_injective_subset:injectiveSubsets[0]?.subset_id||null,
      tri_rank_signature:triRank,
      strict_tri_rank_ladder:triRank[0]<triRank[1]&&triRank[1]<triRank[2],
    }),
    four_coordinate_deletions:freeze(deletionAudits),
    execution_ledger:freeze({
      self_functions:functions.length,order_relation_checks:orderRelationChecks,continuous_endomorphisms:continuous.length,
      calibration_subsets:Object.keys(partitions).length,subset_action_signature_evaluations:subsetActionSignatureEvaluations,
      closure_computations:Object.keys(partitions).length,closure_coordinate_targets:closureCoordinateTargets,
      boolean_hasse_edges:hasseEdges,ordered_subset_pair_checks:orderedSubsetPairs,meet_identity_checks:orderedSubsetPairs,join_identity_checks:orderedSubsetPairs,
      proper_subset_injectivity_checks:31,four_coordinate_deletion_audits:POINTS.length,
    }),
    laws:freeze([
      'THE_128_ACTIONS_INDUCE_EXACTLY_32_DISTINCT_EVALUATION_PARTITIONS_ACROSS_THE_32_CALIBRATION_SUBSETS',
      'CALIBRATION_CLOSURE_IS_THE_IDENTITY_ON_ALL_32_SUBSETS_SO_NO_OMITTED_TASK_COORDINATE_IS_FUNCTIONALLY_DETERMINED_BY_THE_OTHERS',
      'ALL_80_BOOLEAN_HASSE_ADDITIONS_STRICTLY_REFINE_THE_ACTION_EVALUATION_PARTITION',
      'THE_32_EVALUATION_PARTITIONS_FORM_AN_ORDER_REVERSING_BOOLEAN_SUBLATTICE_OF_THE_EQUIVALENCE_RELATION_LATTICE_ON_THE_128_ACTIONS',
      'FOR_ALL_1024_ORDERED_SUBSET_PAIRS_UNION_OF_CALIBRATIONS_CORRESPONDS_TO_PARTITION_MEET_AND_INTERSECTION_OF_CALIBRATIONS_CORRESPONDS_TO_PARTITION_JOIN',
      'NO_PROPER_CALIBRATION_SUBSET_IDENTIFIES_ALL_128_ACTIONS_AND_THE_ACTION_EVALUATION_RANK_IS_FIVE',
      'STATE_SEPARATION_ACTION_EVALUATION_AND_ACTION_GENERATION_HAVE_STRICTLY_DISTINCT_RANKS_ONE_FIVE_AND_ELEVEN',
      'EVERY_SINGLE_COORDINATE_DELETION_PRESERVES_NONTRIVIAL_ACTION_FIBERS_BUT_THE_DELETION_DAMAGE_IS_ANISOTROPIC',
    ]),
    membranes:freeze([
      'ACTION_EVALUATION_PARTITION != TASK_TOPOLOGY','BOOLEAN_EVALUATION_SUBLATTICE != BOOLEAN_TASK_SPACE','CALIBRATION_COORDINATE != PHYSICAL_SENSOR',
      'ACTION_EVALUATION_RANK != SHANNON_BIT_LENGTH','ACTION_EVALUATION_RANK != ACTION_GENERATING_RANK','ACTION_EVALUATION_RANK != STATE_SEPARATION_RANK',
      'ACTION_IDENTIFICATION != SOURCE_IDENTIFICATION','CONTINUOUS_TASK_ENDOMORPHISM != MODEL_WEIGHT_UPDATE','FINITE_ACTION_MONOID != PHYSICAL_DYNAMICS',
      'COORDINATE_IRREDUCIBILITY != UNIVERSAL_FEATURE_MINIMALITY','STRICT_PARTITION_REFINEMENT != CAUSAL_INFORMATION_GAIN','FIBER_CARDINALITY != ENTROPY',
      'BOOLEAN_LATTICE_EMBEDDING != QUANTUM_LOGIC','CALIBRATION_APERTURE != RETENTION_POLICY','FULL_FIVE_POINT_CALIBRATION != UNIVERSAL_EXPERIMENTAL_SUFFICIENCY',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    exact,passed:exact,research_only:true,runtime_binding:false,
  });
  return cached;
}
