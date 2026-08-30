import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from './finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTopologicalDistinguishabilityMetricAmnesiaCertificate } from './finite-topological-distinguishability-metric-amnesia.js';

export const FINITE_METRIC_CUT_SKELETON_TOPOLOGICAL_ORIENTATION_SCHEMA=
  'td613.dome-world.finite-metric-cut-skeleton-topological-orientation/v0.1';
export const FINITE_METRIC_CUT_SKELETON_TOPOLOGICAL_ORIENTATION_PARENT_RECEIPT=
  '29a8879571341d0ee68b14f3e52bef76005b438e';

const ROLES=Object.freeze(['A','B','T','M','R']);
const FULL='ABTMR';
const EXPECTED_CUT_SUPPORT=Object.freeze(['A','AB','AT','AM','ABT','ABM','ATM','ABTM','ABTR','ATMR']);
const EXPECTED_TOPOLOGY_BITS=Object.freeze(['0000000001','0000000010','1111111101','1111111110']);
const INHERITED_BITS='1111111110';
const EXPECTED_COVERS=Object.freeze({
  '0000000001':Object.freeze(['M<A','R<B','R<T','T<A']),
  '0000000010':Object.freeze(['B<A','R<M','R<T','T<A']),
  '1111111101':Object.freeze(['A<B','A<T','M<R','T<R']),
  '1111111110':Object.freeze(['A<M','A<T','B<R','T<R']),
});
const EXPECTED_INTEGER_SOLUTIONS=Object.freeze([
  Object.freeze({A:0,AB:2,AT:1,AM:2,AR:0,ABT:1,ABM:0,ABR:0,ATM:1,ATR:1,AMR:0,ABTM:1,ABTR:0,ABMR:0,ATMR:0}),
  Object.freeze({A:0,AB:2,AT:2,AM:2,AR:0,ABT:0,ABM:0,ABR:0,ATM:0,ATR:0,AMR:0,ABTM:2,ABTR:1,ABMR:0,ATMR:1}),
  Object.freeze({A:1,AB:1,AT:0,AM:1,AR:0,ABT:2,ABM:1,ABR:0,ATM:2,ATR:1,AMR:0,ABTM:0,ABTR:0,ABMR:0,ATMR:0}),
  Object.freeze({A:1,AB:1,AT:1,AM:1,AR:0,ABT:1,ABM:1,ABR:0,ATM:1,ATR:0,AMR:0,ABTM:1,ABTR:1,ABMR:0,ATMR:1}),
  Object.freeze({A:2,AB:0,AT:0,AM:0,AR:0,ABT:2,ABM:2,ABR:0,ATM:2,ATR:0,AMR:0,ABTM:0,ABTR:1,ABMR:0,ATMR:1}),
]);
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
function canonicalize(value){
  if(Array.isArray(value)) return value.map(canonicalize);
  if(value&&typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalize(value[key])]));
  return value;
}
const canonical=value=>JSON.stringify(canonicalize(value));
const setEqual=(a,b)=>a.size===b.size&&[...a].every(value=>b.has(value));
const setKey=set=>ROLES.filter(role=>set.has(role)).join('')||'EMPTY';
const pairKey=(a,b)=>`${a}|${b}`;
function setFromId(id){ return new Set(id==='EMPTY'?[]:ROLES.filter(role=>id.includes(role))); }
function complement(set){ return new Set(ROLES.filter(role=>!set.has(role))); }
function union(a,b){ return new Set([...a,...b]); }
function intersection(a,b){ return new Set([...a].filter(value=>b.has(value))); }
function familyKey(sets){ return [...sets].map(setKey).sort().join('|'); }
function permutations(items){
  const out=[];
  function walk(prefix,remaining){
    if(!remaining.length){ out.push([...prefix]); return; }
    for(let i=0;i<remaining.length;i+=1){ prefix.push(remaining[i]); walk(prefix,[...remaining.slice(0,i),...remaining.slice(i+1)]); prefix.pop(); }
  }
  walk([],items); return out;
}
function combinations(items,k){
  const out=[];
  function walk(start,current){
    if(current.length===k){ out.push([...current]); return; }
    for(let i=start;i<items.length;i+=1){ current.push(items[i]); walk(i+1,current); current.pop(); }
  }
  walk(0,[]); return out;
}
function canonicalCuts(){
  const cuts=[];
  for(let size=1;size<ROLES.length;size+=1){
    for(const combo of combinations(ROLES,size)){
      if(!combo.includes('A')) continue;
      cuts.push(freeze({id:combo.join(''),side:freeze([...combo])}));
    }
  }
  return freeze(cuts);
}
function cutSeparates(cut,a,b){
  const side=new Set(cut.side); return side.has(a)!==side.has(b)?1:0;
}
function distancePairs(distance){
  const pairs=[];
  for(let i=0;i<ROLES.length;i+=1) for(let j=i+1;j<ROLES.length;j+=1) pairs.push(freeze({a:ROLES[i],b:ROLES[j],value:distance[ROLES[i]][ROLES[j]]}));
  return freeze(pairs);
}
function addCutVector(base,cut,multiplier=1){
  const next={};
  for(const a of ROLES){ next[a]={}; for(const b of ROLES) next[a][b]=(base[a]?.[b]||0)+multiplier*cutSeparates(cut,a,b); }
  return next;
}
function zeroDistance(){ return Object.fromEntries(ROLES.map(a=>[a,Object.fromEntries(ROLES.map(b=>[b,0]))])); }
function sameDistance(left,right){
  return ROLES.every(a=>ROLES.every(b=>left[a][b]===right[a][b]));
}
function integerCutDecompositions(cuts,target){
  const targetPairs=distancePairs(target);
  const columns=cuts.map(cut=>targetPairs.map(({a,b})=>cutSeparates(cut,a,b)));
  const solutions=[];
  function walk(index,residual,coeffs){
    if(index===cuts.length){
      if(residual.every(value=>value===0)) solutions.push(freeze(Object.fromEntries(cuts.map((cut,i)=>[cut.id,coeffs[i]||0]))));
      return;
    }
    const column=columns[index];
    let maximum=Infinity;
    for(let i=0;i<column.length;i+=1) if(column[i]===1) maximum=Math.min(maximum,residual[i]);
    if(!Number.isFinite(maximum)) maximum=0;
    for(let coefficient=0;coefficient<=maximum;coefficient+=1){
      const next=residual.map((value,i)=>value-coefficient*column[i]);
      if(next.some(value=>value<0)) continue;
      walk(index+1,next,[...coeffs,coefficient]);
    }
  }
  walk(0,targetPairs.map(row=>row.value),[]);
  return freeze(solutions);
}
function binaryCutSupports(cuts,target){
  const matches=[]; const total=2**cuts.length;
  for(let mask=0;mask<total;mask+=1){
    let distance=zeroDistance(); const support=[];
    for(let i=0;i<cuts.length;i+=1) if(mask&(1<<i)){ distance=addCutVector(distance,cuts[i],1); support.push(cuts[i].id); }
    if(sameDistance(distance,target)) matches.push(freeze([...support]));
  }
  return freeze({enumerated:total,matches:freeze(matches)});
}
function orientationOpenFamily(cuts,bits){
  const opens=[new Set(),new Set(ROLES)];
  for(let i=0;i<cuts.length;i+=1){
    const canonicalSide=new Set(cuts[i].side);
    opens.push(bits[i]==='0'?canonicalSide:complement(canonicalSide));
  }
  return opens;
}
function topologyAudit(opens){
  const keys=new Set(opens.map(setKey));
  let pairChecks=0,closureFailures=0;
  for(const left of opens) for(const right of opens){
    pairChecks+=2;
    if(!keys.has(setKey(union(left,right)))) closureFailures+=1;
    if(!keys.has(setKey(intersection(left,right)))) closureFailures+=1;
  }
  const unique=keys.size===opens.length;
  const topological=unique&&closureFailures===0&&keys.has('EMPTY')&&keys.has(FULL);
  return freeze({topological,unique_open_count:keys.size,pair_operation_checks:pairChecks,closure_failures:closureFailures,open_keys:freeze([...keys].sort())});
}
function specializationRelation(opens){
  const relation={};
  for(const x of ROLES){
    relation[x]={};
    for(const y of ROLES){
      relation[x][y]=opens.every(open=>!open.has(x)||open.has(y));
    }
  }
  return relation;
}
function transitiveReduction(relation){
  const covers=[];
  for(const x of ROLES) for(const y of ROLES){
    if(x===y||!relation[x][y]) continue;
    const between=ROLES.some(z=>z!==x&&z!==y&&relation[x][z]&&relation[z][y]);
    if(!between) covers.push(`${x}<${y}`);
  }
  return freeze(covers.sort());
}
function topologyAutomorphisms(opens,rolePermutations){
  const source=new Set(opens.map(setKey)); const survivors=[];
  for(const permutation of rolePermutations){
    const map=Object.fromEntries(ROLES.map((role,index)=>[role,permutation[index]]));
    const image=new Set(opens.map(open=>setKey(new Set([...open].map(role=>map[role])))));
    if(image.size===source.size&&[...image].every(key=>source.has(key))) survivors.push(freeze({...map}));
  }
  return freeze(survivors);
}
function topologyProperties(opens,rolePermutations){
  const relation=specializationRelation(opens);
  const covers=transitiveReduction(relation);
  const principalOpen={};
  for(const x of ROLES){
    const containing=opens.filter(open=>open.has(x));
    let minimum=new Set(ROLES);
    for(const open of containing) minimum=intersection(minimum,open);
    principalOpen[x]=setKey(minimum);
  }
  const T0=new Set(Object.values(principalOpen)).size===ROLES.length;
  const T1=Object.values(principalOpen).every(id=>setFromId(id).size===1);
  const openKeys=new Set(opens.map(setKey));
  const clopen=[...openKeys].filter(id=>openKeys.has(setKey(complement(setFromId(id)))));
  const connected=clopen.length===2&&clopen.includes('EMPTY')&&clopen.includes(FULL);
  const automorphisms=topologyAutomorphisms(opens,rolePermutations);
  return freeze({T0,T1,connected,clopen_count:clopen.length,finite_alexandrov:true,principal_open:freeze({...principalOpen}),covers,automorphisms,automorphism_count:automorphisms.length});
}
function metricIsometries(distance,rolePermutations){
  const out=[];
  for(const permutation of rolePermutations){
    const map=Object.fromEntries(ROLES.map((role,index)=>[role,permutation[index]]));
    if(ROLES.every(a=>ROLES.every(b=>distance[a][b]===distance[map[a]][map[b]]))) out.push(freeze({...map}));
  }
  return freeze(out);
}
function mapName(map){
  if(ROLES.every(role=>map[role]===role)) return 'id';
  const swaps=[]; const seen=new Set();
  for(const role of ROLES){
    if(seen.has(role)||map[role]===role) continue;
    const other=map[role];
    if(map[other]===role){ swaps.push(`(${role} ${other})`); seen.add(role); seen.add(other); }
  }
  return swaps.join('');
}
function mappedFamily(opens,map){
  return new Set(opens.map(open=>setKey(new Set([...open].map(role=>map[role])))));
}
function sameFamilyKeySet(a,b){ return a.size===b.size&&[...a].every(key=>b.has(key)); }

export function finiteMetricCutSkeletonTopologicalOrientationCertificate(){
  if(cachedCertificate) return cachedCertificate;
  const parent=finiteTopologicalDistinguishabilityMetricAmnesiaCertificate();
  const topologyParent=finiteTaskTopologyRigidityBirkhoffCertificate();
  const target=parent.full_metric?.distance_matrix;
  const cuts=canonicalCuts();
  const rolePermutations=permutations(ROLES);

  const integerSolutions=integerCutDecompositions(cuts,target);
  const binary=binaryCutSupports(cuts,target);
  const uniqueSupport=binary.matches.length===1?binary.matches[0]:[];
  const recoveredCuts=uniqueSupport.map(id=>cuts.find(cut=>cut.id===id));

  const compatible=[]; let orientationChecks=0;
  const orientationCount=2**recoveredCuts.length;
  for(let mask=0;mask<orientationCount;mask+=1){
    const bits=mask.toString(2).padStart(recoveredCuts.length,'0');
    const opens=orientationOpenFamily(recoveredCuts,bits);
    const audit=topologyAudit(opens); orientationChecks+=audit.pair_operation_checks;
    if(audit.topological){
      const properties=topologyProperties(opens,rolePermutations);
      compatible.push(freeze({bits,opens:freeze(opens.map(open=>freeze([...ROLES.filter(role=>open.has(role))]))),audit,properties}));
    }
  }
  const compatibleBits=compatible.map(row=>row.bits).sort();
  const inherited=compatible.find(row=>row.bits===INHERITED_BITS);

  const isometries=metricIsometries(target,rolePermutations);
  const isometryNames=isometries.map(mapName);
  const compatibleKeyToBits=new Map(compatible.map(row=>[familyKey(row.opens.map(open=>new Set(open))),row.bits]));
  const actionRows=[];
  for(const topology of compatible){
    const openSets=topology.opens.map(open=>new Set(open));
    for(const map of isometries){
      const image=mappedFamily(openSets,map);
      const targetBits=compatibleKeyToBits.get([...image].sort().join('|'))||null;
      actionRows.push(freeze({source:topology.bits,isometry:mapName(map),target:targetBits}));
    }
  }
  const inheritedAction=actionRows.filter(row=>row.source===INHERITED_BITS);
  const inheritedOrbit=new Set(inheritedAction.map(row=>row.target).filter(Boolean));
  const inheritedStabilizer=inheritedAction.filter(row=>row.target===INHERITED_BITS);
  const actionClosed=actionRows.every(row=>row.target!==null);
  const actionFree=compatible.every(topology=>actionRows.filter(row=>row.source===topology.bits&&row.target===topology.bits).length===1);
  const actionTransitive=compatible.every(source=>new Set(actionRows.filter(row=>row.source===source.bits).map(row=>row.target)).size===compatible.length);

  const expectedSolutionSet=new Set(EXPECTED_INTEGER_SOLUTIONS.map(canonical));
  const actualSolutionSet=new Set(integerSolutions.map(canonical));
  const integerSolutionsMatch=actualSolutionSet.size===expectedSolutionSet.size&&[...actualSolutionSet].every(key=>expectedSolutionSet.has(key));
  const coversMatch=compatible.every(row=>canonical(row.properties.covers)===canonical(EXPECTED_COVERS[row.bits]));
  const topologyPropertiesMatch=compatible.every(row=>row.audit.unique_open_count===12&&row.properties.T0===true&&row.properties.T1===false&&row.properties.connected===true&&row.properties.clopen_count===2&&row.properties.finite_alexandrov===true&&row.properties.automorphism_count===1);
  const inheritedOpenKeys=new Set((topologyParent.topology?.open_states||[]));
  const inheritedMatchesParent=inherited&&sameFamilyKeySet(new Set(inherited.audit.open_keys),inheritedOpenKeys);
  const expectedIsometryNames=new Set(['id','(B M)','(A R)','(A R)(B M)']);
  const isometryNamesMatch=isometryNames.length===4&&isometryNames.every(name=>expectedIsometryNames.has(name));
  const expectedInheritedTargets={id:'1111111110','(B M)':'1111111101','(A R)':'0000000010','(A R)(B M)':'0000000001'};
  const inheritedActionMatch=inheritedAction.length===4&&inheritedAction.every(row=>expectedInheritedTargets[row.isometry]===row.target);

  const parentExact=parent.passed===true&&topologyParent.passed===true
    && FINITE_METRIC_CUT_SKELETON_TOPOLOGICAL_ORIENTATION_PARENT_RECEIPT==='29a8879571341d0ee68b14f3e52bef76005b438e'
    && parent.domain?.roles===5&&parent.domain?.nontrivial_probes===10
    && parent.full_metric?.metric_isometry_count===4&&parent.full_metric?.labelled_incidence_automorphism_count===1;

  const exact=parentExact
    && cuts.length===15&&rolePermutations.length===120
    && integerSolutions.length===5&&integerSolutionsMatch
    && binary.enumerated===32768&&binary.matches.length===1
    && uniqueSupport.length===10&&canonical(uniqueSupport)===canonical(EXPECTED_CUT_SUPPORT)
    && orientationCount===1024&&orientationChecks===294912
    && compatible.length===4&&canonical(compatibleBits)===canonical([...EXPECTED_TOPOLOGY_BITS])
    && topologyPropertiesMatch&&coversMatch&&inheritedMatchesParent
    && isometries.length===4&&isometryNamesMatch
    && actionRows.length===16&&actionClosed&&inheritedActionMatch
    && inheritedOrbit.size===4&&inheritedStabilizer.length===1&&actionFree&&actionTransitive;
  const passed=exact;

  cachedCertificate=freeze({
    schema:FINITE_METRIC_CUT_SKELETON_TOPOLOGICAL_ORIENTATION_SCHEMA,
    parent_receipt:FINITE_METRIC_CUT_SKELETON_TOPOLOGICAL_ORIENTATION_PARENT_RECEIPT,
    domain:freeze({roles:ROLES.length,pairs:10,nontrivial_unoriented_cuts:cuts.length,role_permutations:rolePermutations.length}),
    raw_integer_inversion:freeze({
      decomposition_count:integerSolutions.length,decompositions:integerSolutions,
      unique:false,expected_solution_set_match:integerSolutionsMatch,
    }),
    distinct_unit_inversion:freeze({
      families_enumerated:binary.enumerated,exact_decomposition_count:binary.matches.length,
      unique_support:freeze([...uniqueSupport]),support_size:uniqueSupport.length,
      inherited_ten_distinct_unit_probe_prior:true,
    }),
    orientation_fibre:freeze({
      orientations_enumerated:orientationCount,pairwise_union_intersection_checks:orientationChecks,
      compatible_topology_count:compatible.length,compatible_orientation_bits:freeze([...compatibleBits]),
      inherited_orientation_bits:INHERITED_BITS,inherited_matches_parent_topology:!!inheritedMatchesParent,
      topologies:freeze(compatible),
    }),
    metric_isometry_action:freeze({
      metric_isometry_count:isometries.length,metric_isometries:isometries,isometry_names:freeze([...isometryNames]),
      action_checks:actionRows.length,action_rows:freeze(actionRows),action_closed:actionClosed,
      inherited_orbit_size:inheritedOrbit.size,inherited_stabilizer_size:inheritedStabilizer.length,
      free:actionFree,transitive:actionTransitive,
    }),
    execution_ledger:freeze({
      integer_cut_variables:cuts.length,binary_cut_families:binary.enumerated,orientation_assignments:orientationCount,
      topology_closure_operation_checks:orientationChecks,topology_automorphism_permutation_checks:compatible.length*rolePermutations.length,
      metric_isometry_permutation_checks:rolePermutations.length,isometry_topology_action_checks:actionRows.length,
    }),
    exact,passed,
    classifications:freeze(passed?[
      'THE_RAW_FULL_SEPARATOR_METRIC_HAS_FIVE_NONNEGATIVE_INTEGER_DECOMPOSITIONS_OVER_THE_FIFTEEN_NONTRIVIAL_UNORIENTED_CUT_SEMIMETRICS_SO_METRIC_ONLY_INTEGER_CUT_RECOVERY_IS_NOT_UNIQUE',
      'AFTER_IMPORTING_THE_EARNED_TEN_DISTINCT_UNIT_PROBE_CONSTRAINT_THE_FULL_METRIC_HAS_EXACTLY_ONE_COMPATIBLE_TEN_CUT_UNORIENTED_SEPARATOR_SKELETON',
      'THE_UNIQUE_TEN_CUT_SKELETON_HAS_EXACTLY_FOUR_ORIENTATIONS_THAT_CLOSE_TO_TWELVE_OPEN_STATE_CONNECTED_T0_NON_T1_FINITE_ALEXANDROV_TOPOLOGIES',
      'THE_FOUR_ELEMENT_FULL_METRIC_ISOMETRY_GROUP_ACTS_FREELY_AND_TRANSITIVELY_ON_THE_FOUR_COMPATIBLE_TOPOLOGICAL_ORIENTATIONS_SO_THE_PAIRWISE_METRIC_DOES_NOT_SELECT_THE_INHERITED_TOPOLOGICAL_ORIENTATION',
    ]:[]),
    scars:freeze([
      'RAW_METRIC_DECOMPOSITION != UNIQUE_CUT_SKELETON','INTEGER_CUT_DECOMPOSITION != REAL_CUT_CONE_UNIQUENESS',
      'TEN_DISTINCT_UNIT_PROBE_PRIOR != METRIC_ONLY_INFORMATION','UNORIENTED_CUT != OPEN_SET','CUT_SKELETON_RECOVERY != TOPOLOGY_RECOVERY',
      'TOPOLOGICAL_ORIENTATION != PHYSICAL_ORIENTATION','SPECIALIZATION_ORDER != CAUSAL_ORDER','METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS',
      'FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY','ORIENTATION_FIBRE != HIDDEN_STATE_SPACE',
      'FOUR_COMPATIBLE_TOPOLOGIES != UNIVERSAL_TOPOLOGY_NONIDENTIFIABILITY','FINITE_ALEXANDROV_TOPOLOGY != CONTINUUM_TOPOLOGY',
      'SEPARATOR_COUNT_METRIC != PHYSICAL_GEOMETRY','WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,authority:zeroAuthority(),research_only:true,runtime_binding:false,
  });
  return cachedCertificate;
}

export function compileFiniteMetricCutSkeletonTopologicalOrientationProjection(receiver){
  const certificate=finiteMetricCutSkeletonTopologicalOrientationCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified finite metric cut-skeleton topology-orientation result');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.finite-metric-cut-skeleton-topological-orientation-child-legible/v0.1',
    truths:freeze([
      'THE_PAIRWISE_SEPARATOR_METRIC_ALONE_DOES_NOT_CHOOSE_ONE_INTEGER_CUT_DECOMPOSITION',
      'WITH_THE_INHERITED_TEN_DISTINCT_UNIT_PROBE_CONSTRAINT_THE_UNORIENTED_SEPARATOR_SKELETON_IS_UNIQUE',
      'THAT_UNORIENTED_SKELETON_STILL_SUPPORTS_FOUR_COMPATIBLE_TOPOLOGICAL_ORIENTATIONS_AND_THE_METRIC_ISOMETRIES_PERMUTE_THEM_FREELY_AND_TRANSITIVELY',
    ]),
    raw_integer_decompositions:certificate.raw_integer_inversion.decomposition_count,
    distinct_unit_skeletons:certificate.distinct_unit_inversion.exact_decomposition_count,
    compatible_topologies:certificate.orientation_fibre.compatible_topology_count,
    metric_isometries:certificate.metric_isometry_action.metric_isometry_count,
    physical_orientation_claim:false,gauge_theory_claim:false,metric_only_uniqueness_claim:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.finite-metric-cut-skeleton-topological-orientation-loom-technical/v0.1',
    domain:certificate.domain,raw_integer_inversion:certificate.raw_integer_inversion,
    distinct_unit_inversion:certificate.distinct_unit_inversion,orientation_fibre:certificate.orientation_fibre,
    metric_isometry_action:certificate.metric_isometry_action,
    physical_orientation_claim:false,gauge_theory_claim:false,metric_only_uniqueness_claim:false,
  });
  else throw new Error(`unsupported finite metric cut-skeleton topology-orientation receiver ${receiver}`);
  return freeze({receiver,payload,custody_witness:certificate.custody_witness,authority:zeroAuthority(),research_only:true,runtime_binding:false});
}
