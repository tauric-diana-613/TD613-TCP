import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  finiteCustodyTaskDependencyPosetCertificate,
} from './finite-custody-task-dependency-poset.js';

export const FINITE_TASK_TOPOLOGY_RIGIDITY_BIRKHOFF_SCHEMA =
  'td613.dome-world.finite-task-topology-rigidity-birkhoff/v0.1';
export const FINITE_TASK_TOPOLOGY_RIGIDITY_BIRKHOFF_PARENT_RECEIPT =
  'd76ab8a3166916ebed1d189eee01343233ee3cfd';

const TASKS=Object.freeze(['B','R','T','A','M']);
const EXPECTED_CLOSED=Object.freeze(['EMPTY','B','A','BA','TA','AM','BTA','BAM','TAM','BRTA','BTAM','BRTAM']);
const EXPECTED_JOIN_IRREDUCIBLES=Object.freeze(['B','A','TA','AM','BRTA']);
const EXPECTED_MEET_IRREDUCIBLES=Object.freeze(['B','BAM','TAM','BRTA','BTAM']);
const EXPECTED_SPECIALIZATION_COVERS=Object.freeze([
  Object.freeze(['B','R']),Object.freeze(['A','T']),Object.freeze(['A','M']),Object.freeze(['T','R']),
]);
const EXPECTED_JOIN_IRREDUCIBLE_COVERS=Object.freeze([
  Object.freeze(['B','BRTA']),Object.freeze(['A','TA']),Object.freeze(['A','AM']),Object.freeze(['TA','BRTA']),
]);
const EXPECTED_PRINCIPAL=Object.freeze({B:'B',A:'A',T:'TA',M:'AM',R:'BRTA'});
const EXPECTED_MIN_OPEN=Object.freeze({B:'BR',A:'RTAM',T:'RT',M:'M',R:'R'});
const EXPECTED_FINGERPRINTS=Object.freeze({B:[1,2],A:[1,4],T:[2,2],M:[2,1],R:[4,1]});
const EXPECTED_RANK_DISTRIBUTION=Object.freeze({'0':1,'1':2,'2':3,'3':3,'4':2,'5':1});
const AUTHORITY_KEYS=Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);
let cachedCertificate=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
const zeroAuthority=()=>freeze(Object.fromEntries(AUTHORITY_KEYS.map(key=>[key,false])));
const subsetOf=(a,b)=>[...a].every(value=>b.has(value));
const setEqual=(a,b)=>a.size===b.size&&subsetOf(a,b);
const intersection=(a,b)=>new Set([...a].filter(value=>b.has(value)));
const complement=a=>new Set(TASKS.filter(task=>!a.has(task)));
function orderedSet(values){ return new Set(TASKS.filter(task=>values.has(task))); }
function setId(values){ const text=TASKS.filter(task=>values.has(task)).join(''); return text||'EMPTY'; }
function idSet(id){ return new Set(id==='EMPTY'?[]:TASKS.filter(task=>id.includes(task))); }
function pairKey(pair){ return `${pair[0]}<${pair[1]}`; }
function samePairSet(left,right){
  const a=new Set(left.map(pairKey)),b=new Set(right.map(pairKey)); return setEqual(a,b);
}
function allSubsets(items){
  const out=[];
  function walk(index,current){
    if(index===items.length){ out.push(new Set(current)); return; }
    walk(index+1,current); current.push(items[index]); walk(index+1,current); current.pop();
  }
  walk(0,[]); return out;
}
function permutations(items){
  const out=[];
  function walk(prefix,remaining){
    if(remaining.length===0){ out.push([...prefix]); return; }
    for(let i=0;i<remaining.length;i+=1){
      prefix.push(remaining[i]); walk(prefix,[...remaining.slice(0,i),...remaining.slice(i+1)]); prefix.pop();
    }
  }
  walk([],items); return out;
}
function coversOf(sets){
  const out=[];
  for(const lower of sets) for(const upper of sets){
    if(!subsetOf(lower,upper)||setEqual(lower,upper)) continue;
    const between=sets.some(mid=>!setEqual(mid,lower)&&!setEqual(mid,upper)&&subsetOf(lower,mid)&&subsetOf(mid,upper));
    if(!between) out.push([setId(lower),setId(upper)]);
  }
  return out;
}
function pointOrderCovers(points,relation){
  const out=[];
  for(const lower of points) for(const upper of points){
    if(lower===upper||!relation(lower,upper)) continue;
    const between=points.some(mid=>mid!==lower&&mid!==upper&&relation(lower,mid)&&relation(mid,upper));
    if(!between) out.push([lower,upper]);
  }
  return out;
}
function familyKey(family){ return [...family].sort().join('|'); }
function mapSet(set,mapping){ return new Set([...set].map(value=>mapping[value])); }

export function finiteTaskTopologyRigidityBirkhoffCertificate(){
  if(cachedCertificate) return cachedCertificate;
  const parent=finiteCustodyTaskDependencyPosetCertificate();
  const table=parent.subset_table||{};
  const tableIds=Object.keys(table);
  const closedIds=[...new Set(tableIds.map(id=>table[id].closure))];
  const closedSets=closedIds.map(idSet);
  const closedFamily=new Set(closedIds);
  const full=new Set(TASKS);

  const openSets=closedSets.map(set=>orderedSet(complement(set)));
  const openIds=[...new Set(openSets.map(setId))];
  const openFamily=new Set(openIds);
  const clopenIds=closedIds.filter(id=>openFamily.has(id));

  const closureOf=set=>idSet(table[setId(orderedSet(set))]?.closure||'__MISSING__');
  const principal={};
  const minimalOpen={};
  const fingerprints={};
  for(const task of TASKS){
    principal[task]=setId(closureOf(new Set([task])));
    const containing=openSets.filter(open=>open.has(task));
    let minimum=new Set(TASKS);
    for(const open of containing) minimum=intersection(minimum,open);
    minimum=orderedSet(minimum);
    minimalOpen[task]=setId(minimum);
    fingerprints[task]=freeze([idSet(principal[task]).size,minimum.size]);
  }

  let topologyClosedIntersectionChecks=0,topologyClosedIntersectionFailures=0;
  let topologyClosedUnionChecks=0,topologyClosedUnionFailures=0;
  let topologyOpenUnionChecks=0,topologyOpenUnionFailures=0;
  let topologyOpenIntersectionChecks=0,topologyOpenIntersectionFailures=0;
  for(const X of closedSets) for(const Y of closedSets){
    topologyClosedIntersectionChecks+=1;
    if(!closedFamily.has(setId(orderedSet(intersection(X,Y))))) topologyClosedIntersectionFailures+=1;
    topologyClosedUnionChecks+=1;
    if(!closedFamily.has(setId(orderedSet(new Set([...X,...Y]))))) topologyClosedUnionFailures+=1;
  }
  for(const X of openSets) for(const Y of openSets){
    topologyOpenUnionChecks+=1;
    if(!openFamily.has(setId(orderedSet(new Set([...X,...Y]))))) topologyOpenUnionFailures+=1;
    topologyOpenIntersectionChecks+=1;
    if(!openFamily.has(setId(orderedSet(intersection(X,Y))))) topologyOpenIntersectionFailures+=1;
  }

  let t0Pairs=0,t0Failures=0,t1Failures=0;
  for(let i=0;i<TASKS.length;i+=1){
    if(idSet(principal[TASKS[i]]).size!==1) t1Failures+=1;
    for(let j=i+1;j<TASKS.length;j+=1){
      t0Pairs+=1;
      if(principal[TASKS[i]]===principal[TASKS[j]]) t0Failures+=1;
    }
  }
  const t0=t0Failures===0;
  const t1=t1Failures===0;
  const connected=clopenIds.length===2&&clopenIds.includes('EMPTY')&&clopenIds.includes('BRTAM');
  const finiteAlexandrov=topologyOpenIntersectionFailures===0;

  const latticeCovers=coversOf(closedSets);
  const lowerCoverCounts=Object.fromEntries(closedIds.map(id=>[id,0]));
  const upperCoverCounts=Object.fromEntries(closedIds.map(id=>[id,0]));
  for(const [lower,upper] of latticeCovers){ upperCoverCounts[lower]+=1; lowerCoverCounts[upper]+=1; }
  const joinIrreducibles=closedIds.filter(id=>id!=='EMPTY'&&lowerCoverCounts[id]===1);
  const meetIrreducibles=closedIds.filter(id=>id!=='BRTAM'&&upperCoverCounts[id]===1);
  const joinSets=joinIrreducibles.map(idSet);
  const joinCovers=coversOf(joinSets);

  const downsetCandidates=allSubsets(joinIrreducibles);
  const downsets=[];
  for(const candidate of downsetCandidates){
    let valid=true;
    for(const upper of candidate){
      const upperSet=idSet(upper);
      for(const lower of joinIrreducibles){
        if(subsetOf(idSet(lower),upperSet)&&!candidate.has(lower)){ valid=false; break; }
      }
      if(!valid) break;
    }
    if(valid) downsets.push(candidate);
  }
  const downsetKeys=new Set(downsets.map(familyKey));
  const birkhoffImages=[];
  const birkhoffKeys=new Set();
  const rankDistribution={};
  for(const state of closedSets){
    const image=new Set(joinIrreducibles.filter(id=>subsetOf(idSet(id),state)));
    const key=familyKey(image);
    birkhoffImages.push(freeze({state:setId(state),downset:freeze([...image]),rank:image.size}));
    birkhoffKeys.add(key);
    rankDistribution[image.size]=(rankDistribution[image.size]||0)+1;
  }
  const birkhoffExact=birkhoffKeys.size===closedSets.length&&birkhoffKeys.size===downsetKeys.size
    && [...birkhoffKeys].every(key=>downsetKeys.has(key));

  const specialization=(x,y)=>idSet(principal[y]).has(x);
  const specializationCovers=pointOrderCovers(TASKS,specialization);
  const maximalPoints=TASKS.filter(point=>!TASKS.some(other=>other!==point&&specialization(point,other)));
  const minimalPoints=TASKS.filter(point=>!TASKS.some(other=>other!==point&&specialization(other,point)));

  const pointPermutations=permutations(TASKS);
  const preserving=[];
  let permutationRelationComparisons=0;
  let permutationClosureFamilyComparisons=0;
  for(const perm of pointPermutations){
    const mapping=Object.fromEntries(TASKS.map((task,index)=>[task,perm[index]]));
    let relationPreserved=true;
    for(const x of TASKS) for(const y of TASKS){
      permutationRelationComparisons+=1;
      if(specialization(x,y)!==specialization(mapping[x],mapping[y])) relationPreserved=false;
    }
    let familyPreserved=true;
    for(const state of closedSets){
      permutationClosureFamilyComparisons+=1;
      if(!closedFamily.has(setId(orderedSet(mapSet(state,mapping))))) familyPreserved=false;
    }
    if(relationPreserved&&familyPreserved) preserving.push(freeze({...mapping}));
  }
  const nonidentityPreserving=preserving.filter(mapping=>TASKS.some(task=>mapping[task]!==task));
  const fingerprintKeys=TASKS.map(task=>fingerprints[task].join(','));
  const fingerprintDuplicates=fingerprintKeys.length-new Set(fingerprintKeys).size;

  const parentGenerator=parent.generator?.minimal_full_generators||[];
  const maximaId=setId(new Set(maximalPoints));
  const generatorMatchesMaxima=parentGenerator.length===1&&parentGenerator[0]===maximaId;

  const expectedPrincipal=Object.entries(EXPECTED_PRINCIPAL).every(([task,id])=>principal[task]===id);
  const expectedMinOpen=Object.entries(EXPECTED_MIN_OPEN).every(([task,id])=>minimalOpen[task]===id);
  const expectedFingerprints=Object.entries(EXPECTED_FINGERPRINTS).every(([task,pair])=>fingerprints[task][0]===pair[0]&&fingerprints[task][1]===pair[1]);
  const expectedRankDistribution=Object.entries(EXPECTED_RANK_DISTRIBUTION).every(([rank,count])=>rankDistribution[rank]===count)
    && Object.keys(rankDistribution).length===Object.keys(EXPECTED_RANK_DISTRIBUTION).length;

  const parentExact=parent.passed===true
    && FINITE_TASK_TOPOLOGY_RIGIDITY_BIRKHOFF_PARENT_RECEIPT==='d76ab8a3166916ebed1d189eee01343233ee3cfd'
    && parent.domain?.tasks===5&&parent.domain?.task_subsets===32
    && parent.closed_set_lattice?.closed_state_count===12
    && parent.finite_task_closure?.kuratowski_finite_closure===true
    && parent.generator?.minimal_full_generators?.length===1
    && parent.generator.minimal_full_generators[0]==='RM';

  const exact=parentExact
    && tableIds.length===32
    && closedIds.length===12&&new Set(EXPECTED_CLOSED).size===12&&EXPECTED_CLOSED.every(id=>closedFamily.has(id))
    && openIds.length===12&&clopenIds.length===2&&clopenIds.includes('EMPTY')&&clopenIds.includes('BRTAM')
    && topologyClosedIntersectionChecks===144&&topologyClosedIntersectionFailures===0
    && topologyClosedUnionChecks===144&&topologyClosedUnionFailures===0
    && topologyOpenUnionChecks===144&&topologyOpenUnionFailures===0
    && topologyOpenIntersectionChecks===144&&topologyOpenIntersectionFailures===0
    && t0Pairs===10&&t0&&t1===false&&connected&&finiteAlexandrov
    && expectedPrincipal&&expectedMinOpen&&expectedFingerprints&&fingerprintDuplicates===0
    && latticeCovers.length===18
    && joinIrreducibles.length===5&&EXPECTED_JOIN_IRREDUCIBLES.every(id=>joinIrreducibles.includes(id))
    && meetIrreducibles.length===5&&EXPECTED_MEET_IRREDUCIBLES.every(id=>meetIrreducibles.includes(id))
    && samePairSet(joinCovers,EXPECTED_JOIN_IRREDUCIBLE_COVERS)
    && downsetCandidates.length===32&&downsets.length===12&&birkhoffImages.length===12&&birkhoffKeys.size===12&&birkhoffExact
    && expectedRankDistribution
    && samePairSet(specializationCovers,EXPECTED_SPECIALIZATION_COVERS)
    && setEqual(new Set(maximalPoints),new Set(['R','M']))
    && setEqual(new Set(minimalPoints),new Set(['A','B']))
    && pointPermutations.length===120&&permutationRelationComparisons===3000&&permutationClosureFamilyComparisons===1440
    && preserving.length===1&&nonidentityPreserving.length===0&&TASKS.every(task=>preserving[0]?.[task]===task)
    && generatorMatchesMaxima;
  const passed=exact;

  cachedCertificate=freeze({
    schema:FINITE_TASK_TOPOLOGY_RIGIDITY_BIRKHOFF_SCHEMA,
    parent_receipt:FINITE_TASK_TOPOLOGY_RIGIDITY_BIRKHOFF_PARENT_RECEIPT,
    domain:freeze({task_points:TASKS.length,parent_task_subsets:tableIds.length,closed_states:closedIds.length}),
    topology:freeze({
      closed_states:freeze([...closedIds]),open_states:freeze([...openIds]),clopen_states:freeze([...clopenIds]),
      T0:t0,T1:t1,connected,finite_alexandrov:finiteAlexandrov,
      principal_closures:freeze({...principal}),minimal_open_neighborhoods:freeze({...minimalOpen}),
      intrinsic_point_fingerprints:freeze({...fingerprints}),fingerprint_duplicate_count:fingerprintDuplicates,
      closed_intersection_checks:topologyClosedIntersectionChecks,closed_intersection_failures:topologyClosedIntersectionFailures,
      closed_union_checks:topologyClosedUnionChecks,closed_union_failures:topologyClosedUnionFailures,
      open_union_checks:topologyOpenUnionChecks,open_union_failures:topologyOpenUnionFailures,
      open_intersection_checks:topologyOpenIntersectionChecks,open_intersection_failures:topologyOpenIntersectionFailures,
      point_separation_pairs:t0Pairs,
    }),
    lattice_dual:freeze({
      element_count:closedIds.length,hasse_covers:freeze(latticeCovers.map(pair=>freeze([...pair]))),hasse_cover_count:latticeCovers.length,
      join_irreducibles:freeze([...joinIrreducibles]),meet_irreducibles:freeze([...meetIrreducibles]),
      join_irreducible_covers:freeze(joinCovers.map(pair=>freeze([...pair]))),
      candidate_join_irreducible_subsets:downsetCandidates.length,downset_count:downsets.length,
      birkhoff_images:freeze(birkhoffImages),birkhoff_image_count:birkhoffKeys.size,birkhoff_exact:birkhoffExact,
      rank_distribution:freeze({...rankDistribution}),
    }),
    specialization_order:freeze({
      convention:'x<=y iff x in cl({y})',covers:freeze(specializationCovers.map(pair=>freeze([...pair]))),
      maximal_points:freeze([...maximalPoints]),minimal_points:freeze([...minimalPoints]),
      unique_parent_minimal_full_generator:freeze([...parentGenerator]),generator_equals_maximal_points:generatorMatchesMaxima,
    }),
    rigidity:freeze({
      permutations_tested:pointPermutations.length,relation_cell_comparisons:permutationRelationComparisons,
      closure_family_image_checks:permutationClosureFamilyComparisons,
      preserving_automorphisms:freeze(preserving),preserving_automorphism_count:preserving.length,
      nonidentity_preserving_automorphisms:freeze(nonidentityPreserving),nonidentity_preserving_count:nonidentityPreserving.length,
      rigid:preserving.length===1&&nonidentityPreserving.length===0,
    }),
    execution_ledger:freeze({
      parent_subset_rows:tableIds.length,lattice_order_relation_cells:closedSets.length*closedSets.length,
      topology_closed_pair_checks:topologyClosedIntersectionChecks+topologyClosedUnionChecks,
      topology_open_pair_checks:topologyOpenUnionChecks+topologyOpenIntersectionChecks,
      join_irreducible_order_cells:joinIrreducibles.length*joinIrreducibles.length,
      candidate_downsets:downsetCandidates.length,birkhoff_state_images:birkhoffImages.length,
      task_permutations:pointPermutations.length,permutation_relation_cells:permutationRelationComparisons,
      permutation_closure_family_images:permutationClosureFamilyComparisons,
    }),
    exact,passed,
    classifications:freeze(passed?[
      'THE_EARNED_FIVE_TASK_FUNCTIONAL_CLOSURE_DEFINES_A_TWELVE_CLOSED_STATE_FINITE_T0_ALEXANDROV_TOPOLOGY_WITH_EXACTLY_TWO_CLOPEN_SETS_AND_IS_CONNECTED_BUT_NOT_T1',
      'THE_TWELVE_STATE_DISTRIBUTIVE_CLOSED_SET_LATTICE_HAS_EXACTLY_FIVE_JOIN_IRREDUCIBLES_AND_IS_EXACTLY_RECONSTRUCTED_AS_THE_DOWNSET_LATTICE_OF_THEIR_FIVE_POINT_ORDER',
      'ALL_ONE_HUNDRED_TWENTY_TASK_POINT_PERMUTATIONS_WERE_EXHAUSTIVELY_TESTED_AND_ONLY_THE_IDENTITY_PRESERVES_BOTH_THE_SPECIALIZATION_ORDER_AND_COMPLETE_CLOSED_SET_FAMILY',
      'THE_FIVE_TASK_POINTS_HAVE_PAIRWISE_DISTINCT_INTRINSIC_PRINCIPAL_CLOSURE_AND_MINIMAL_OPEN_NEIGHBORHOOD_CARDINALITY_FINGERPRINTS_IN_THIS_FIXED_TASK_TOPOLOGY',
      'THE_UNIQUE_INCLUSION_MINIMAL_FULL_TASK_GENERATOR_R_M_EQUALS_THE_TWO_MAXIMAL_POINTS_OF_THE_FIXED_SPECIALIZATION_ORDER',
    ]:[]),
    scars:freeze([
      'FINITE_TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY','FINITE_TASK_TOPOLOGY != PHYSICAL_SPACE',
      'SPECIALIZATION_ORDER != SCIENTIFIC_ANCESTRY','SPECIALIZATION_ORDER != CAUSAL_ORDER','MAXIMAL_SPECIALIZATION_POINT != CAUSAL_ROOT',
      'TOPOLOGICAL_RIGIDITY != SEMANTIC_NAME_RECOVERY_FROM_NOTHING','TOPOLOGICAL_RIGIDITY != UNIQUE_ENCODING',
      'BIRKHOFF_REPRESENTATION != CATEGORY_OR_FUNCTOR_THEOREM','JOIN_IRREDUCIBLE != INDEPENDENT_SCIENTIFIC_PRIMITIVE',
      'CONNECTED_TOPOLOGY != DYNAMICAL_COUPLING','T0_TASK_SPACE != SOURCE_STATE_IDENTIFIABILITY',
      'FINITE_ALEXANDROV != CONTINUUM_TOPOLOGY','AUTOMORPHISM_TRIVIALITY != UNIVERSAL_TASK_IDENTIFIABILITY',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,authority:zeroAuthority(),research_only:true,runtime_binding:false,
  });
  return cachedCertificate;
}

export function compileFiniteTaskTopologyRigidityBirkhoffProjection(receiver){
  const certificate=finiteTaskTopologyRigidityBirkhoffCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified finite task topology rigidity certificate');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.finite-task-topology-rigidity-child-legible/v0.1',
    truths:freeze([
      'THE_FIVE_EARNED_CUSTODY_TASK_ROLES_FORM_A_FINITE_T0_TASK_TOPOLOGY_IN_THIS_FIXED_FIXTURE',
      'THE_FULL_TWELVE_STATE_CLOSURE_OBJECT_HAS_NO_NONTRIVIAL_TASK_ROLE_RELABELING_SYMMETRY',
      'THE_TWO_TASK_ROLES_NEEDED_TO_GENERATE_THE_FULL_DECLARED_BEHAVIOR_ARE_EXACTLY_THE_TWO_MAXIMAL_POINTS_OF_THIS_TASK_ORDER',
    ]),
    task_points:certificate.domain.task_points,closed_states:certificate.domain.closed_states,
    preserving_automorphisms:certificate.rigidity.preserving_automorphism_count,
    semantic_task_names_inherited:true,model_state_topology_claim:false,physical_topology_claim:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.finite-task-topology-rigidity-loom-technical/v0.1',
    topology:certificate.topology,lattice_dual:certificate.lattice_dual,specialization_order:certificate.specialization_order,
    rigidity:certificate.rigidity,semantic_task_names_inherited:true,model_state_topology_claim:false,physical_topology_claim:false,
  });
  else throw new Error(`unsupported finite task topology rigidity receiver ${receiver}`);
  return freeze({receiver,payload,custody_witness:certificate.custody_witness,authority:zeroAuthority(),research_only:true,runtime_binding:false});
}
