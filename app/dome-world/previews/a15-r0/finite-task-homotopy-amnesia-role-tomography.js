import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from './finite-task-topology-rigidity-birkhoff-dual.js';

export const FINITE_TASK_HOMOTOPY_AMNESIA_ROLE_TOMOGRAPHY_SCHEMA=
  'td613.dome-world.finite-task-homotopy-amnesia-role-tomography/v0.1';
export const FINITE_TASK_HOMOTOPY_AMNESIA_ROLE_TOMOGRAPHY_PARENT_RECEIPT=
  '7c4cef95d4f704f05615d663e252d5a53775bdbe';

const POINTS=Object.freeze(['A','B','T','M','R']);
const AUTHORITY_KEYS=Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);
let cachedCertificate=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const zeroAuthority=()=>freeze(Object.fromEntries(AUTHORITY_KEYS.map(key=>[key,false])));
const subsetOf=(a,b)=>[...a].every(value=>b.has(value));
const setEqual=(a,b)=>a.size===b.size&&subsetOf(a,b);
const intersection=(a,b)=>new Set([...a].filter(value=>b.has(value)));
const pointSetFromId=id=>new Set(POINTS.filter(point=>id!=='EMPTY'&&id.includes(point)));
const pointSetId=set=>POINTS.filter(point=>set.has(point)).join('')||'EMPTY';
function canonicalize(value){
  if(Array.isArray(value)) return value.map(canonicalize);
  if(value&&typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalize(value[key])]));
  return value;
}
const canonical=value=>JSON.stringify(canonicalize(value));

function allFunctions(points){
  const out=[];
  const current=Array(points.length);
  function walk(index){
    if(index===points.length){ out.push(freeze([...current])); return; }
    for(const value of points){ current[index]=value; walk(index+1); }
  }
  walk(0); return freeze(out);
}

function partitionBy(points,keyFn){
  const groups=new Map();
  for(const point of points){
    const key=canonical(keyFn(point));
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(point);
  }
  return freeze([...groups.values()].map(group=>freeze([...group])).sort((a,b)=>a[0].localeCompare(b[0])));
}
function partitionKey(partition){
  return partition.map(group=>[...group].sort().join('')).sort().join('|');
}

function rankF2(matrix){
  if(matrix.length===0||matrix[0]?.length===0) return 0;
  const a=matrix.map(row=>row.map(value=>value&1));
  const rows=a.length,cols=a[0].length;
  let rank=0;
  for(let col=0;col<cols&&rank<rows;col+=1){
    let pivot=-1;
    for(let row=rank;row<rows;row+=1) if(a[row][col]){ pivot=row; break; }
    if(pivot<0) continue;
    [a[rank],a[pivot]]=[a[pivot],a[rank]];
    for(let row=0;row<rows;row+=1){
      if(row!==rank&&a[row][col]) for(let c=col;c<cols;c+=1) a[row][c]^=a[rank][c];
    }
    rank+=1;
  }
  return rank;
}

function strictChains(subset,leq,length){
  const points=POINTS.filter(point=>subset.has(point));
  const out=[];
  function walk(prefix){
    if(prefix.length===length){ out.push(freeze([...prefix])); return; }
    for(const point of points){
      if(prefix.includes(point)) continue;
      if(prefix.length&&(!leq(prefix[prefix.length-1],point)||prefix[prefix.length-1]===point)) continue;
      prefix.push(point); walk(prefix); prefix.pop();
    }
  }
  walk([]); return out;
}

function orderComplex(subset,leq){
  const simplices={};
  for(let length=1;length<=subset.size;length+=1){
    const rows=strictChains(subset,leq,length);
    if(rows.length) simplices[length-1]=rows;
  }
  const maxDim=Math.max(...Object.keys(simplices).map(Number));
  const boundaryRanks={};
  let boundaryEntries=0;
  for(let dim=1;dim<=maxDim;dim+=1){
    const high=simplices[dim]||[],low=simplices[dim-1]||[];
    const lowIndex=new Map(low.map((simplex,index)=>[canonical(simplex),index]));
    const matrix=Array.from({length:low.length},()=>Array(high.length).fill(0));
    for(let col=0;col<high.length;col+=1){
      const simplex=high[col];
      for(let removed=0;removed<simplex.length;removed+=1){
        const face=[...simplex.slice(0,removed),...simplex.slice(removed+1)];
        matrix[lowIndex.get(canonical(face))][col]^=1; boundaryEntries+=1;
      }
    }
    boundaryRanks[dim]=rankF2(matrix);
  }
  const fVector=[]; const betti=[];
  for(let dim=0;dim<=maxDim;dim+=1){
    const n=(simplices[dim]||[]).length;
    fVector.push(n);
    betti.push(n-(boundaryRanks[dim]||0)-(boundaryRanks[dim+1]||0));
  }
  while(fVector.length<3) fVector.push(0);
  while(betti.length<3) betti.push(0);
  const euler=fVector.reduce((sum,count,dim)=>sum+(dim%2===0?count:-count),0);
  return freeze({f_vector:freeze(fVector.slice(0,3)),betti_f2:freeze(betti.slice(0,3)),euler_characteristic:euler,boundary_ranks:freeze({...boundaryRanks}),boundary_face_entries:boundaryEntries});
}

function beatWitness(subset,point,leq){
  const upper=POINTS.filter(other=>subset.has(other)&&other!==point&&leq(point,other));
  const lower=POINTS.filter(other=>subset.has(other)&&other!==point&&leq(other,point));
  const upperMinimum=upper.find(candidate=>upper.every(other=>leq(candidate,other)))||null;
  const lowerMaximum=lower.find(candidate=>lower.every(other=>leq(other,candidate)))||null;
  return freeze({point,upper_minimum:upperMinimum,lower_maximum:lowerMaximum,is_beat:Boolean(upperMinimum||lowerMaximum)});
}

function beatCollapseCensus(leq){
  const sequences=[]; const reachable=new Map(); let witnessChecks=0;
  function visit(subset,path,witnesses){
    const id=pointSetId(subset); if(!reachable.has(id)) reachable.set(id,new Set(subset));
    if(subset.size===1){ sequences.push(freeze({deletions:freeze([...path]),terminal:[...subset][0],witnesses:freeze([...witnesses])})); return; }
    for(const point of POINTS){
      if(!subset.has(point)) continue;
      const witness=beatWitness(subset,point,leq); witnessChecks+=1;
      if(!witness.is_beat) continue;
      const next=new Set(subset); next.delete(point);
      visit(next,[...path,point],[...witnesses,witness]);
    }
  }
  visit(new Set(POINTS),[],[]);
  const bySize={}; for(const subset of reachable.values()) bySize[subset.size]=(bySize[subset.size]||0)+1;
  const terminal={}; for(const row of sequences) terminal[row.terminal]=(terminal[row.terminal]||0)+1;
  const initial=POINTS.map(point=>beatWitness(new Set(POINTS),point,leq)).filter(row=>row.is_beat);
  return freeze({initial_beats:freeze(initial),sequences:freeze(sequences),complete_sequences:sequences.length,reachable_subspaces:reachable.size,reachable_by_size:freeze({...bySize}),terminal_multiplicity:freeze({...terminal}),dynamic_beat_witness_checks:witnessChecks});
}

function bfsDistances(adjacency,start){
  const dist=Array(adjacency.length).fill(-1); dist[start]=0; const queue=[start];
  for(let q=0;q<queue.length;q+=1){
    const u=queue[q];
    for(const v of adjacency[u]) if(dist[v]<0){ dist[v]=dist[u]+1; queue.push(v); }
  }
  return dist;
}

export function finiteTaskHomotopyAmnesiaRoleTomographyCertificate(){
  if(cachedCertificate) return cachedCertificate;
  const parent=finiteTaskTopologyRigidityBirkhoffCertificate();
  const principal=parent.topology?.principal_closures||{};
  const minimalOpen=parent.topology?.minimal_open_neighborhoods||{};
  const openSets=(parent.topology?.open_states||[]).map(pointSetFromId);
  const openFamily=new Set(openSets.map(pointSetId));
  const leq=(x,y)=>pointSetFromId(principal[y]||'EMPTY').has(x);

  const closureSize=Object.fromEntries(POINTS.map(point=>[point,pointSetFromId(principal[point]).size]));
  const openSize=Object.fromEntries(POINTS.map(point=>[point,pointSetFromId(minimalOpen[point]).size]));
  const joint=Object.fromEntries(POINTS.map(point=>[point,freeze([closureSize[point],openSize[point]])]));
  const closurePartition=partitionBy(POINTS,point=>closureSize[point]);
  const openPartition=partitionBy(POINTS,point=>openSize[point]);
  const jointPartition=partitionBy(POINTS,point=>joint[point]);

  const functions=allFunctions(POINTS);
  const continuous=[]; let agreement=0,mismatches=0,orderCellChecks=0,openPreimageChecks=0;
  const mapOf=row=>Object.fromEntries(POINTS.map((point,index)=>[point,row[index]]));
  for(const row of functions){
    const map=mapOf(row);
    let orderPreserving=true;
    for(const x of POINTS) for(const y of POINTS){
      orderCellChecks+=1;
      if(leq(x,y)&&!leq(map[x],map[y])) orderPreserving=false;
    }
    let topologicallyContinuous=true;
    for(const open of openSets){
      openPreimageChecks+=1;
      const preimage=new Set(POINTS.filter(point=>open.has(map[point])));
      if(!openFamily.has(pointSetId(preimage))) topologicallyContinuous=false;
    }
    if(orderPreserving===topologicallyContinuous) agreement+=1; else mismatches+=1;
    if(topologicallyContinuous) continuous.push(freeze({row,map:freeze(map),image_size:new Set(row).size,idempotent:POINTS.every((point,index)=>map[map[point]]===row[index])}));
  }
  const imageSpectrum={}; const idempotentSpectrum={}; let idempotents=0;
  for(const item of continuous){
    imageSpectrum[item.image_size]=(imageSpectrum[item.image_size]||0)+1;
    if(item.idempotent){ idempotents+=1; idempotentSpectrum[item.image_size]=(idempotentSpectrum[item.image_size]||0)+1; }
  }
  const identityIndex=continuous.findIndex(item=>POINTS.every((point,index)=>item.row[index]===point));
  const bijective=continuous.filter(item=>new Set(item.row).size===POINTS.length);

  const adjacency=Array.from({length:continuous.length},()=>new Set()); let graphEdges=0,pointwiseChecks=0;
  const mapLeq=(left,right)=>POINTS.every(point=>{ pointwiseChecks+=1; return leq(left.map[point],right.map[point]); });
  for(let i=0;i<continuous.length;i+=1) for(let j=i+1;j<continuous.length;j+=1){
    if(mapLeq(continuous[i],continuous[j])||mapLeq(continuous[j],continuous[i])){ adjacency[i].add(j); adjacency[j].add(i); graphEdges+=1; }
  }
  const distanceSpectrum={}; let diameter=0,components=0; const seen=new Set();
  for(let i=0;i<continuous.length;i+=1){
    if(!seen.has(i)){
      components+=1; const d=bfsDistances(adjacency,i); d.forEach((value,index)=>{ if(value>=0) seen.add(index); });
    }
    const d=bfsDistances(adjacency,i);
    for(let j=i+1;j<d.length;j+=1){ distanceSpectrum[d[j]]=(distanceSpectrum[d[j]]||0)+1; diameter=Math.max(diameter,d[j]); }
  }
  const identityDistances=bfsDistances(adjacency,identityIndex); const identitySpectrum={};
  identityDistances.forEach(value=>{ identitySpectrum[value]=(identitySpectrum[value]||0)+1; });
  const identityToConstants={};
  for(const point of POINTS){
    const idx=continuous.findIndex(item=>item.row.every(value=>value===point)); identityToConstants[point]=identityDistances[idx];
  }

  const beats=beatCollapseCensus(leq);
  const fullComplex=orderComplex(new Set(POINTS),leq);
  const deletion={};
  for(const point of POINTS){ const subset=new Set(POINTS); subset.delete(point); deletion[point]=orderComplex(subset,leq); }
  const fPartition=partitionBy(POINTS,point=>deletion[point].f_vector);
  const bettiPartition=partitionBy(POINTS,point=>deletion[point].betti_f2);
  const beatMultiplicityPartition=partitionBy(POINTS,point=>beats.terminal_multiplicity[point]);
  const ladder=freeze([jointPartition.length,fPartition.length,bettiPartition.length,1]);

  const parentExact=parent.passed===true
    && FINITE_TASK_HOMOTOPY_AMNESIA_ROLE_TOMOGRAPHY_PARENT_RECEIPT==='7c4cef95d4f704f05615d663e252d5a53775bdbe'
    && parent.domain?.task_points===5&&parent.domain?.closed_states===12
    && parent.topology?.open_states?.length===12&&parent.topology?.T0===true
    && parent.rigidity?.preserving_automorphism_count===1&&parent.rigidity?.nonidentity_preserving_count===0;

  const exact=parentExact
    && canonical(joint)===canonical({A:[1,4],B:[1,2],T:[2,2],M:[2,1],R:[4,1]})
    && partitionKey(closurePartition)===partitionKey([['A','B'],['T','M'],['R']])
    && partitionKey(openPartition)===partitionKey([['R','M'],['B','T'],['A']])
    && jointPartition.length===5
    && functions.length===3125&&agreement===3125&&mismatches===0&&continuous.length===128
    && orderCellChecks===78125&&openPreimageChecks===37500
    && canonical(imageSpectrum)===canonical({'1':5,'2':50,'3':60,'4':12,'5':1})
    && idempotents===61&&canonical(idempotentSpectrum)===canonical({'1':5,'2':26,'3':21,'4':8,'5':1})
    && bijective.length===1&&identityIndex>=0
    && graphEdges===1528&&components===1&&diameter===3
    && canonical(distanceSpectrum)===canonical({'1':1528,'2':5435,'3':1165})
    && canonical(identitySpectrum)===canonical({'0':1,'1':6,'2':49,'3':72})
    && canonical(identityToConstants)===canonical({A:2,B:3,T:3,M:3,R:2})
    && beats.complete_sequences===36&&beats.reachable_subspaces===19
    && canonical(beats.reachable_by_size)===canonical({'1':5,'2':5,'3':5,'4':3,'5':1})
    && canonical(beats.terminal_multiplicity)===canonical({A:12,B:3,T:6,M:3,R:12})
    && partitionKey(beatMultiplicityPartition)===partitionKey([['A','R'],['T'],['B','M']])
    && canonical(fullComplex.f_vector)===canonical([5,5,1])&&fullComplex.euler_characteristic===1
    && canonical(fullComplex.betti_f2)===canonical([1,0,0])
    && canonical(Object.fromEntries(POINTS.map(point=>[point,deletion[point].f_vector])))===canonical({A:[4,2,0],B:[4,4,1],T:[4,3,0],M:[4,4,1],R:[4,2,0]})
    && canonical(Object.fromEntries(POINTS.map(point=>[point,deletion[point].betti_f2])))===canonical({A:[2,0,0],B:[1,0,0],T:[1,0,0],M:[1,0,0],R:[2,0,0]})
    && partitionKey(fPartition)===partitionKey([['A','R'],['B','M'],['T']])
    && partitionKey(bettiPartition)===partitionKey([['A','R'],['B','T','M']])
    && partitionKey(fPartition)===partitionKey(beatMultiplicityPartition)
    && canonical(ladder)===canonical([5,3,2,1]);
  const passed=exact;

  cachedCertificate=freeze({
    schema:FINITE_TASK_HOMOTOPY_AMNESIA_ROLE_TOMOGRAPHY_SCHEMA,
    parent_receipt:FINITE_TASK_HOMOTOPY_AMNESIA_ROLE_TOMOGRAPHY_PARENT_RECEIPT,
    domain:freeze({task_points:POINTS.length,open_sets:openSets.length,self_functions:functions.length}),
    local_role_tomography:freeze({closure_sizes:freeze({...closureSize}),minimal_open_sizes:freeze({...openSize}),joint_fingerprints:freeze({...joint}),closure_size_partition:closurePartition,minimal_open_size_partition:openPartition,joint_partition:jointPartition,joint_role_classes:jointPartition.length,joint_ambiguity:POINTS.length-jointPartition.length}),
    endomorphism_census:freeze({all_self_functions:functions.length,order_continuity_agreement:agreement,order_continuity_mismatches:mismatches,continuous_endomorphisms:continuous.length,noncontinuous_functions:functions.length-continuous.length,image_size_spectrum:freeze({...imageSpectrum}),idempotent_continuous_endomorphisms:idempotents,idempotent_image_size_spectrum:freeze({...idempotentSpectrum}),bijective_continuous_endomorphisms:bijective.length,identity_is_unique_bijective:bijective.length===1&&identityIndex>=0}),
    map_comparability_graph:freeze({vertices:continuous.length,edges:graphEdges,components,diameter,unordered_pair_distance_spectrum:freeze({...distanceSpectrum}),unordered_pairs:Object.values(distanceSpectrum).reduce((a,b)=>a+b,0),identity_distance_spectrum:freeze({...identitySpectrum}),identity_to_constants:freeze({...identityToConstants})}),
    beat_collapse:beats,
    order_complex:freeze({full:fullComplex,deletions:freeze({...deletion}),delete_f_partition:fPartition,delete_betti_partition:bettiPartition,beat_terminal_multiplicity_partition:beatMultiplicityPartition}),
    aperture_ladder:freeze({role_class_counts:ladder,full_joint_local:jointPartition,delete_f_vector:fPartition,delete_betti_f2:bettiPartition,global_homotopy_homology_role_classes:1}),
    execution_ledger:freeze({self_functions:functions.length,order_relation_cell_checks:orderCellChecks,open_preimage_checks:openPreimageChecks,continuous_endomorphisms:continuous.length,continuous_unordered_pairs:continuous.length*(continuous.length-1)/2,pointwise_relation_checks:pointwiseChecks,bfs_runs:continuous.length,beat_witness_checks:beats.dynamic_beat_witness_checks,beat_sequences:beats.complete_sequences,order_complex_full_boundary_entries:fullComplex.boundary_face_entries,order_complex_deletion_boundary_entries:POINTS.reduce((sum,point)=>sum+deletion[point].boundary_face_entries,0)}),
    exact,passed,
    classifications:freeze(passed?[
      'THE_EARNED_FIVE_ROLE_TASK_TOPOLOGY_HAS_TWO_SEPARATELY_LOSSY_LOCAL_SCALAR_APERTURES_WHOSE_JOINT_FINGERPRINT_RECOVERS_ALL_FIVE_STRUCTURAL_ROLES_EXACTLY_IN_THE_FIXED_FIXTURE',
      'ALL_3125_SELF_FUNCTIONS_HAVE_MATCHING_ORDER_PRESERVATION_AND_OPEN_PREIMAGE_CONTINUITY_CLASSIFICATIONS_WITH_EXACTLY_128_CONTINUOUS_ENDOMORPHISMS',
      'THE_128_CONTINUOUS_ENDOMORPHISMS_FORM_ONE_CONNECTED_POINTWISE_COMPARABILITY_GRAPH_OF_DIAMETER_THREE_EVEN_THOUGH_THE_FULL_TASK_TOPOLOGY_HAS_ONLY_THE_IDENTITY_AUTOMORPHISM',
      'THE_FIVE_POINT_TASK_SPACE_ADMITS_36_DYNAMIC_BEAT_POINT_COLLAPSE_SEQUENCES_REACHING_EVERY_TASK_ROLE_AS_A_SINGLETON_TERMINAL_SO_BEAT_COLLAPSE_ENDPOINT_IDENTITY_DOES_NOT_RECOVER_STRUCTURAL_ROLE_IDENTITY',
      'ROLE_DISTINGUISHABILITY_STRICTLY_COLLAPSES_FROM_FIVE_CLASSES_UNDER_THE_JOINT_LOCAL_STRUCTURAL_FINGERPRINT_TO_THREE_UNDER_DELETE_ONE_ORDER_COMPLEX_F_VECTOR_TO_TWO_UNDER_DELETE_ONE_F2_BETTI_PROFILE_TO_ONE_UNDER_THE_GLOBAL_HOMOTOPY_HOMOLOGY_APERTURE',
    ]:[]),
    scars:freeze([
      'TASK_TOPOLOGY_RIGIDITY != HOMOTOPY_RIGIDITY','AUTOMORPHISM_RIGIDITY != HOMOTOPY_IDENTITY_RIGIDITY','CONTINUOUS_ENDOMORPHISM != AUTOMORPHISM',
      'HOMOTOPY_EQUIVALENCE != TASK_ROLE_IDENTITY','CONTRACTIBLE != TOPOLOGICALLY_TRIVIAL','BEAT_POINT_REMOVAL != SEMANTIC_TASK_DELETION',
      'BEAT_COLLAPSE_TERMINAL_POINT != STRUCTURAL_ROLE_IDENTITY','ORDER_COMPLEX != PHYSICAL_GEOMETRY','SIMPLICIAL_HOMOLOGY != INFORMATION_CONTENT',
      'BETTI_EQUIVALENCE != TASK_ROLE_EQUIVALENCE','EULER_CHARACTERISTIC != SEMANTIC_COMPLETENESS','COARSE_TOPOLOGICAL_INVARIANT != FULL_TASK_TOPOLOGY',
      'LOCAL_SCALAR_APERTURE_ALIASING != ROLE_IDENTITY','JOINT_LOCAL_FINGERPRINT_RECOVERY != UNIVERSAL_TOMOGRAPHY','FINITE_CONTINUITY_CENSUS != UNIVERSAL_DYNAMICAL_SYSTEM',
      'POINTWISE_COMPARABILITY_GRAPH != PHYSICAL_EVOLUTION','HOMOTOPY_CLASS_COLLAPSE != SOURCE_STATE_COLLAPSE','ROLE_DISTINGUISHABILITY_LADDER != SHANNON_INFORMATION_LADDER',
      'FINITE_ROLE_TOMOGRAPHY != NATURAL_LANGUAGE_SEMANTIC_RECONSTRUCTION','WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,authority:zeroAuthority(),research_only:true,runtime_binding:false,
  });
  return cachedCertificate;
}

export function compileFiniteTaskHomotopyAmnesiaRoleTomographyProjection(receiver){
  const certificate=finiteTaskHomotopyAmnesiaRoleTomographyCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified finite task homotopy-amnesia role tomography');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.finite-task-homotopy-amnesia-role-tomography-child-legible/v0.1',
    truths:freeze([
      'FULL_TASK_STRUCTURE_DISTINGUISHES_ALL_FIVE_ROLES_WHILE_COARSER_TOPOLOGICAL_APERTURES_PROGRESSIVELY_COLLAPSE_ROLE_DISTINCTIONS',
      'TWO_LOSSY_LOCAL_STRUCTURAL_COUNTS_JOINTLY_RECOVER_ALL_FIVE_ROLES_IN_THIS_FIXED_TASK_SPACE',
      'TOPOLOGY_AUTOMORPHISM_RIGIDITY_AND_POINTWISE_COMPARABILITY_HOMOTOPY_COLLAPSE_ARE_SIMULTANEOUSLY_TRUE_IN_THIS_FIXED_FINITE_SPACE',
    ]),
    role_class_ladder:certificate.aperture_ladder.role_class_counts,
    continuous_endomorphisms:certificate.endomorphism_census.continuous_endomorphisms,
    semantic_task_names_inherited:true,natural_language_semantics_claim:false,physical_topology_claim:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.finite-task-homotopy-amnesia-role-tomography-loom-technical/v0.1',
    local_role_tomography:certificate.local_role_tomography,endomorphism_census:certificate.endomorphism_census,
    map_comparability_graph:certificate.map_comparability_graph,beat_collapse:freeze({complete_sequences:certificate.beat_collapse.complete_sequences,reachable_subspaces:certificate.beat_collapse.reachable_subspaces,terminal_multiplicity:certificate.beat_collapse.terminal_multiplicity}),
    order_complex:certificate.order_complex,aperture_ladder:certificate.aperture_ladder,
    semantic_task_names_inherited:true,natural_language_semantics_claim:false,physical_topology_claim:false,
  });
  else throw new Error(`unsupported finite task homotopy-amnesia role-tomography receiver ${receiver}`);
  return freeze({receiver,payload,custody_witness:certificate.custody_witness,authority:zeroAuthority(),research_only:true,runtime_binding:false});
}
