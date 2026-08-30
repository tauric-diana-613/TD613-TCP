import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from './finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTopologicalProbeSeparationRedundancyCertificate } from './finite-topological-probe-separation-redundancy.js';

export const FINITE_TOPOLOGICAL_DISTINGUISHABILITY_METRIC_AMNESIA_SCHEMA=
  'td613.dome-world.finite-topological-distinguishability-metric-amnesia/v0.1';
export const FINITE_TOPOLOGICAL_DISTINGUISHABILITY_METRIC_AMNESIA_PARENT_RECEIPT=
  '4ba3542aea8784586562032c57096248dc961db9';

const ROLES=Object.freeze(['A','B','T','M','R']);
const FULL_ID='BRTAM';
const EXPECTED_PROBES=Object.freeze(['RTAM','BRTM','RTM','BRM','BRT','RM','RT','BR','M','R']);
const STAR_FAMILY=Object.freeze(['RTAM','BRTM','M','R']);
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
const setFromId=id=>new Set(id==='EMPTY'?[]:ROLES.filter(role=>id.includes(role)));
const familySetKey=family=>[...family].sort().join('|');
const roleSetKey=set=>ROLES.filter(role=>set.has(role)).join('');

function allSubsets(items){
  const out=[];
  function walk(index,current){
    if(index===items.length){ out.push(freeze([...current])); return; }
    walk(index+1,current);
    current.push(items[index]); walk(index+1,current); current.pop();
  }
  walk(0,[]); return freeze(out);
}
function combinations(items,k){
  const out=[];
  function walk(start,current){
    if(current.length===k){ out.push([...current]); return; }
    for(let i=start;i<items.length;i+=1){ current.push(items[i]); walk(i+1,current); current.pop(); }
  }
  if(k===0) return [[]];
  if(k>items.length) return [];
  walk(0,[]); return out;
}
function permutations(items){
  const out=[];
  function walk(prefix,remaining){
    if(!remaining.length){ out.push(freeze([...prefix])); return; }
    for(let i=0;i<remaining.length;i+=1){
      prefix.push(remaining[i]); walk(prefix,[...remaining.slice(0,i),...remaining.slice(i+1)]); prefix.pop();
    }
  }
  walk([],items); return freeze(out);
}
function membershipSignature(family,probeSets,role){
  return family.map(probe=>probeSets[probe].has(role)?1:0).join('');
}
function roleClassCount(family,probeSets){
  return new Set(ROLES.map(role=>membershipSignature(family,probeSets,role))).size;
}
function distanceMatrix(family,probeSets){
  const out={};
  for(const a of ROLES){
    out[a]={};
    for(const b of ROLES){
      out[a][b]=family.reduce((sum,probe)=>sum+(probeSets[probe].has(a)!==probeSets[probe].has(b)?1:0),0);
    }
  }
  return freeze(out);
}
function minimumOffDiagonal(distance){
  let value=Infinity;
  for(let i=0;i<ROLES.length;i+=1) for(let j=i+1;j<ROLES.length;j+=1) value=Math.min(value,distance[ROLES[i]][ROLES[j]]);
  return Number.isFinite(value)?value:0;
}
function diameter(distance){
  let value=0;
  for(let i=0;i<ROLES.length;i+=1) for(let j=i+1;j<ROLES.length;j+=1) value=Math.max(value,distance[ROLES[i]][ROLES[j]]);
  return value;
}
function pseudometricAudit(distance){
  let diagonal=0,symmetry=0,triangle=0,triangleFailures=0;
  for(const a of ROLES){
    diagonal+=1;
    if(distance[a][a]!==0) return freeze({passed:false,diagonal,symmetry,triangle,triangle_failures:triangleFailures+1});
  }
  for(const a of ROLES) for(const b of ROLES){
    symmetry+=1;
    if(distance[a][b]!==distance[b][a]||distance[a][b]<0) return freeze({passed:false,diagonal,symmetry,triangle,triangle_failures:triangleFailures+1});
  }
  for(const a of ROLES) for(const b of ROLES) for(const c of ROLES){
    triangle+=1;
    if(distance[a][c]>distance[a][b]+distance[b][c]) triangleFailures+=1;
  }
  return freeze({passed:triangleFailures===0,diagonal,symmetry,triangle,triangle_failures:triangleFailures});
}
function metricIsometries(distance,rolePermutations){
  const out=[];
  for(const permutation of rolePermutations){
    const map=Object.fromEntries(ROLES.map((role,index)=>[role,permutation[index]]));
    let preserving=true;
    for(const a of ROLES) for(const b of ROLES) if(distance[a][b]!==distance[map[a]][map[b]]) preserving=false;
    if(preserving) out.push(freeze({...map}));
  }
  return freeze(out);
}
function incidenceAutomorphisms(family,probeSets,rolePermutations){
  const selected=new Set(family.map(probe=>roleSetKey(probeSets[probe])));
  const out=[];
  for(const permutation of rolePermutations){
    const map=Object.fromEntries(ROLES.map((role,index)=>[role,permutation[index]]));
    const image=new Set();
    for(const probe of family){
      const mapped=new Set([...probeSets[probe]].map(role=>map[role]));
      image.add(roleSetKey(mapped));
    }
    const preserving=image.size===selected.size&&[...image].every(key=>selected.has(key));
    if(preserving) out.push(freeze({...map}));
  }
  return freeze(out);
}
function erasedFamily(family,erased){
  const gone=new Set(erased); return family.filter(probe=>!gone.has(probe));
}
function partitionFromProfiles(profiles){
  const groups=new Map();
  for(const role of ROLES){
    const key=profiles[role].join(',');
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(role);
  }
  return freeze([...groups.values()].map(group=>freeze([...group])));
}
function partitionKey(partition){ return partition.map(group=>[...group].sort().join('')).sort().join('|'); }
function mapKey(map){ return ROLES.map(role=>map[role]).join(''); }

export function finiteTopologicalDistinguishabilityMetricAmnesiaCertificate(){
  if(cachedCertificate) return cachedCertificate;
  const parent=finiteTopologicalProbeSeparationRedundancyCertificate();
  const topology=finiteTaskTopologyRigidityBirkhoffCertificate();
  const inheritedProbes=[...(topology.topology?.open_states||[])].filter(id=>id!=='EMPTY'&&id!==FULL_ID);
  const probeUniverseMatches=inheritedProbes.length===EXPECTED_PROBES.length&&familySetKey(inheritedProbes)===familySetKey(EXPECTED_PROBES);
  const probes=probeUniverseMatches?[...EXPECTED_PROBES]:[...inheritedProbes];
  const probeSets=Object.fromEntries(probes.map(probe=>[probe,setFromId(probe)]));
  const families=allSubsets(probes);
  const rolePermutations=permutations(ROLES);

  const roleClassSpectrum={};
  const metricIsometrySpectrum={};
  const jointSpectrum={};
  const rows=[];
  let pseudometricFamilies=0,metricFamilies=0,pseudometricTriangleFailures=0;
  let exactSignatureMetricMismatches=0,metricPermutationChecks=0,incidencePermutationChecks=0;
  let equalSymmetryFamilies=0,extraMetricSymmetryFamilies=0;
  const maxSymmetryFamilies=[];

  for(const family of families){
    const classes=roleClassCount(family,probeSets);
    roleClassSpectrum[classes]=(roleClassSpectrum[classes]||0)+1;
    const distance=distanceMatrix(family,probeSets);
    const pseudo=pseudometricAudit(distance);
    if(pseudo.passed) pseudometricFamilies+=1;
    pseudometricTriangleFailures+=pseudo.triangle_failures;
    const minDistance=minimumOffDiagonal(distance);
    const metric=minDistance>0;
    if(metric) metricFamilies+=1;
    if(metric!==(classes===ROLES.length)) exactSignatureMetricMismatches+=1;
    let isometries=freeze([]),incidence=freeze([]);
    if(metric){
      isometries=metricIsometries(distance,rolePermutations); metricPermutationChecks+=rolePermutations.length;
      incidence=incidenceAutomorphisms(family,probeSets,rolePermutations); incidencePermutationChecks+=rolePermutations.length;
      metricIsometrySpectrum[isometries.length]=(metricIsometrySpectrum[isometries.length]||0)+1;
      const joint=`${isometries.length},${incidence.length}`;
      jointSpectrum[joint]=(jointSpectrum[joint]||0)+1;
      if(isometries.length===incidence.length) equalSymmetryFamilies+=1; else if(isometries.length>incidence.length) extraMetricSymmetryFamilies+=1;
      if(isometries.length===24) maxSymmetryFamilies.push(freeze([...family]));
    }
    rows.push(freeze({family,width:family.length,role_classes:classes,distance,min_distance:minDistance,metric,isometry_count:isometries.length,incidence_automorphism_count:incidence.length}));
  }

  const fullFamily=freeze([...probes]);
  const fullDistance=distanceMatrix(fullFamily,probeSets);
  const fullMin=minimumOffDiagonal(fullDistance),fullDiameter=diameter(fullDistance);
  const pointProfiles={};
  for(const role of ROLES) pointProfiles[role]=freeze(ROLES.filter(other=>other!==role).map(other=>fullDistance[role][other]).sort((a,b)=>a-b));
  const profilePartition=partitionFromProfiles(pointProfiles);
  const triangleSlackSpectrum={}; const zeroSlack=[]; let orderedDistinctTriangles=0;
  for(const a of ROLES) for(const b of ROLES) for(const c of ROLES){
    if(new Set([a,b,c]).size<3) continue;
    orderedDistinctTriangles+=1;
    const slack=fullDistance[a][b]+fullDistance[b][c]-fullDistance[a][c];
    triangleSlackSpectrum[slack]=(triangleSlackSpectrum[slack]||0)+1;
    if(slack===0) zeroSlack.push(freeze([a,b,c]));
  }
  const fullIsometries=metricIsometries(fullDistance,rolePermutations);
  const fullIncidence=incidenceAutomorphisms(fullFamily,probeSets,rolePermutations);

  const starRow=rows.find(row=>familySetKey(row.family)===familySetKey(STAR_FAMILY));
  const starSignatures=Object.fromEntries(ROLES.map(role=>[role,membershipSignature(STAR_FAMILY,probeSets,role)]));
  const starDistance=distanceMatrix(STAR_FAMILY,probeSets);
  const starIsometries=metricIsometries(starDistance,rolePermutations);
  const starIncidence=incidenceAutomorphisms(STAR_FAMILY,probeSets,rolePermutations);

  const erasureCaseCounts={}; let erasureCases=0,erasureComparisons=0,erasureCriterionMismatches=0;
  for(let e=0;e<=4;e+=1){
    let cases=0;
    for(const row of rows){
      if(row.width<e) continue;
      const erasures=combinations(row.family,e); cases+=erasures.length; erasureCases+=erasures.length;
      let direct=true;
      for(const erased of erasures){
        const retained=erasedFamily(row.family,erased);
        const d=distanceMatrix(retained,probeSets);
        if(minimumOffDiagonal(d)===0) direct=false;
      }
      const criterion=row.min_distance>=e+1;
      erasureComparisons+=1;
      if(direct!==criterion) erasureCriterionMismatches+=1;
    }
    erasureCaseCounts[e]=cases;
  }

  const expectedDistance={
    A:{A:0,B:5,T:4,M:5,R:8},B:{A:5,B:0,T:5,M:6,R:5},T:{A:4,B:5,T:0,M:5,R:4},
    M:{A:5,B:6,T:5,M:0,R:5},R:{A:8,B:5,T:4,M:5,R:0},
  };
  const expectedProfiles={A:[4,5,5,8],B:[5,5,5,6],T:[4,4,5,5],M:[5,5,5,6],R:[4,5,5,8]};
  const expectedIsometrySpectrum={'1':372,'2':360,'4':40,'6':10,'8':8,'12':4,'24':1};
  const expectedJoint={
    '1,1':372,'2,1':192,'2,2':168,'4,1':9,'4,2':21,'4,4':10,'6,2':2,'6,6':8,
    '8,1':2,'8,2':5,'8,4':1,'12,6':4,'24,4':1,
  };
  const fullIsometryKeys=new Set(fullIsometries.map(mapKey));
  const expectedFullMaps=[
    {A:'A',B:'B',T:'T',M:'M',R:'R'},
    {A:'R',B:'B',T:'T',M:'M',R:'A'},
    {A:'A',B:'M',T:'T',M:'B',R:'R'},
    {A:'R',B:'M',T:'T',M:'B',R:'A'},
  ];
  const starLeaves=['A','B','M','R'];
  const starGeometry=starLeaves.every(leaf=>starDistance.T[leaf]===1)
    && starLeaves.every((left,i)=>starLeaves.every((right,j)=>i===j||starDistance[left][right]===2));

  const parentExact=parent.passed===true
    && topology.passed===true
    && FINITE_TOPOLOGICAL_DISTINGUISHABILITY_METRIC_AMNESIA_PARENT_RECEIPT==='4ba3542aea8784586562032c57096248dc961db9'
    && parent.domain?.roles===5&&parent.domain?.nontrivial_probes===10&&parent.domain?.probe_families===1024
    && parent.family_census?.exact_identifying_families===795
    && parent.erasure_redundancy?.criterion_mismatches===0
    && topology.rigidity?.preserving_automorphism_count===1;

  const exact=parentExact
    && probeUniverseMatches&&families.length===1024&&rolePermutations.length===120
    && pseudometricFamilies===1024&&pseudometricTriangleFailures===0
    && metricFamilies===795&&exactSignatureMetricMismatches===0
    && canonical(roleClassSpectrum)===canonical({'1':1,'2':10,'3':44,'4':174,'5':795})
    && canonical(fullDistance)===canonical(expectedDistance)&&fullMin===4&&fullDiameter===8
    && canonical(pointProfiles)===canonical(expectedProfiles)
    && partitionKey(profilePartition)===partitionKey([['A','R'],['B','M'],['T']])
    && orderedDistinctTriangles===60&&canonical(triangleSlackSpectrum)===canonical({'0':2,'2':4,'4':22,'6':20,'8':12})
    && canonical(zeroSlack)===canonical([['A','T','R'],['R','T','A']])
    && fullIsometries.length===4&&expectedFullMaps.every(map=>fullIsometryKeys.has(mapKey(map)))
    && fullIncidence.length===1&&mapKey(fullIncidence[0])===mapKey(expectedFullMaps[0])
    && canonical(metricIsometrySpectrum)===canonical(expectedIsometrySpectrum)
    && canonical(jointSpectrum)===canonical(expectedJoint)
    && equalSymmetryFamilies===558&&extraMetricSymmetryFamilies===237
    && maxSymmetryFamilies.length===1&&familySetKey(maxSymmetryFamilies[0])===familySetKey(STAR_FAMILY)
    && starRow?.metric===true&&starRow?.isometry_count===24&&starRow?.incidence_automorphism_count===4
    && canonical(starSignatures)===canonical({A:'1000',B:'0100',T:'1100',M:'1110',R:'1101'})
    && starGeometry&&starIsometries.length===24&&starIncidence.length===4
    && canonical(erasureCaseCounts)===canonical({'0':1024,'1':5120,'2':11520,'3':15360,'4':13440})
    && erasureCases===46464&&erasureComparisons===4876&&erasureCriterionMismatches===0
    && metricPermutationChecks===95400&&incidencePermutationChecks===95400;
  const passed=exact;

  cachedCertificate=freeze({
    schema:FINITE_TOPOLOGICAL_DISTINGUISHABILITY_METRIC_AMNESIA_SCHEMA,
    parent_receipt:FINITE_TOPOLOGICAL_DISTINGUISHABILITY_METRIC_AMNESIA_PARENT_RECEIPT,
    domain:freeze({roles:ROLES.length,nontrivial_probes:probes.length,probe_families:families.length,role_permutations:rolePermutations.length}),
    probes:freeze({inherited_nontrivial:freeze([...inheritedProbes]),presentation_order:freeze([...probes]),universe_matches_preregistered:probeUniverseMatches}),
    metric_family_census:freeze({
      pseudometric_families:pseudometricFamilies,exact_metric_families:metricFamilies,exact_signature_metric_mismatches:exactSignatureMetricMismatches,
      role_class_spectrum:freeze({...roleClassSpectrum}),metric_isometry_group_size_spectrum:freeze({...metricIsometrySpectrum}),
      metric_incidence_joint_spectrum:freeze({...jointSpectrum}),equal_symmetry_families:equalSymmetryFamilies,
      families_with_nonliftable_metric_symmetry:extraMetricSymmetryFamilies,maximum_metric_symmetry_families:freeze(maxSymmetryFamilies),
    }),
    full_metric:freeze({
      distance_matrix:fullDistance,minimum_positive_distance:fullMin,diameter:fullDiameter,point_distance_profiles:freeze({...pointProfiles}),
      distance_profile_partition:profilePartition,ordered_distinct_triangle_checks:orderedDistinctTriangles,triangle_slack_spectrum:freeze({...triangleSlackSpectrum}),
      zero_slack_ordered_triples:freeze(zeroSlack),metric_isometries:fullIsometries,metric_isometry_count:fullIsometries.length,
      labelled_incidence_automorphisms:fullIncidence,labelled_incidence_automorphism_count:fullIncidence.length,
      nonliftable_metric_isometries:fullIsometries.length-fullIncidence.length,
    }),
    maximum_metric_symmetry_control:freeze({
      family:STAR_FAMILY,signatures:freeze({...starSignatures}),distance_matrix:starDistance,metric_isometry_count:starIsometries.length,
      labelled_incidence_automorphism_count:starIncidence.length,nonliftable_metric_isometries:starIsometries.length-starIncidence.length,
      center:'T',leaves:freeze(starLeaves),center_to_leaf_distance:1,leaf_to_leaf_distance:2,
    }),
    erasure_metric_equivalence:freeze({
      exact_erasure_case_counts:freeze({...erasureCaseCounts}),total_erasure_cases:erasureCases,family_order_comparisons:erasureComparisons,
      criterion:'every exact-e deletion remains metric iff minimum selected separator distance >= e+1',criterion_mismatches:erasureCriterionMismatches,
    }),
    execution_ledger:freeze({
      probe_families:families.length,pseudometric_triangle_failures:pseudometricTriangleFailures,
      exact_family_metric_permutation_checks:metricPermutationChecks,exact_family_incidence_permutation_checks:incidencePermutationChecks,
      exact_erasure_cases:erasureCases,erasure_family_order_comparisons:erasureComparisons,
    }),
    exact,passed,
    classifications:freeze(passed?[
      'FOR_EVERY_SELECTED_PROBE_FAMILY_IN_THE_FIXED_TEN_PROBE_ATLAS_SEPARATOR_COUNT_DEFINES_A_FINITE_PSEUDOMETRIC_AND_IT_IS_A_METRIC_EXACTLY_FOR_THE_795_FAMILIES_THAT_IDENTIFY_ALL_FIVE_ROLES',
      'EXACT_E_ERASURE_ROBUST_ROLE_IDENTIFICATION_IS_EQUIVALENT_TO_MINIMUM_SELECTED_SEPARATOR_DISTANCE_AT_LEAST_E_PLUS_ONE_FOR_E_ZERO_THROUGH_FOUR_IN_THE_FIXED_FINITE_ATLAS',
      'THE_FULL_TEN_PROBE_DISTINGUISHABILITY_METRIC_HAS_FOUR_ROLE_ISOMETRIES_WHILE_THE_FULL_LABELLED_TASK_TOPOLOGY_HAS_ONLY_THE_IDENTITY_AUTOMORPHISM_SO_THREE_FULL_METRIC_ISOMETRIES_DO_NOT_LIFT_TO_TOPOLOGICAL_AUTOMORPHISMS',
      'ACROSS_THE_795_EXACT_OBSERVER_FAMILIES_237_HAVE_STRICTLY_MORE_METRIC_ISOMETRIES_THAN_LABELLED_INCIDENCE_AUTOMORPHISMS_AND_ONE_EXACT_FOUR_PROBE_FAMILY_HAS_24_METRIC_ISOMETRIES_BUT_ONLY_FOUR_INCIDENCE_AUTOMORPHISMS',
    ]:[]),
    scars:freeze([
      'SEPARATOR_COUNT_METRIC != PHYSICAL_GEOMETRY','FINITE_HAMMING_FORM != CHANNEL_CODING_THEOREM','PAIRWISE_DISTANCE_MATRIX != LABELLED_PROBE_INCIDENCE',
      'METRIC_ISOMETRY != TOPOLOGICAL_AUTOMORPHISM','METRIC_ISOMETRY != SEMANTIC_ROLE_IDENTITY','EXACT_DISTINGUISHABILITY != STRUCTURAL_IDENTITY_RECOVERY',
      'DISTANCE_PROFILE_ALIASING != ROLE_IDENTITY','NON_LIFTABLE_METRIC_SYMMETRY != HIDDEN_PHYSICAL_SYMMETRY','PSEUDOMETRIC_COLLAPSE != SOURCE_STATE_COLLAPSE',
      'MINIMUM_SEPARATOR_DISTANCE != SHANNON_CAPACITY','MINIMUM_SEPARATOR_DISTANCE != MINIMUM_BIT_LENGTH','FINITE_ERASURE_METRIC_EQUIVALENCE != ERROR_CORRECTION_CAPACITY',
      'LABELLED_INCIDENCE_AUTOMORPHISM != SCIENTIFIC_ANCESTRY','PROBE_UNIVERSE_IDENTITY != PROBE_ENUMERATION_ORDER','WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,authority:zeroAuthority(),research_only:true,runtime_binding:false,
  });
  return cachedCertificate;
}

export function compileFiniteTopologicalDistinguishabilityMetricAmnesiaProjection(receiver){
  const certificate=finiteTopologicalDistinguishabilityMetricAmnesiaCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified finite topological distinguishability metric amnesia');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.finite-topological-distinguishability-metric-amnesia-child-legible/v0.1',
    truths:freeze([
      'COUNTING_WHICH_SELECTED_PROBES_SEPARATE_TWO_ROLES_GIVES_A_FINITE_DISTANCE_LIKE_APERTURE',
      'EXACT_ROLE_DISTINGUISHABILITY_CAN_SURVIVE_EVEN_WHEN_PAIRWISE_DISTANCE_GEOMETRY_FORGETS_STRUCTURAL_ROLE_IDENTITY',
      'THE_FULL_TEN_PROBE_DISTANCE_GEOMETRY_HAS_MORE_ROLE_SYMMETRIES_THAN_THE_FULL_LABELLED_TASK_TOPOLOGY',
    ]),
    exact_metric_families:certificate.metric_family_census.exact_metric_families,
    full_metric_isometry_count:certificate.full_metric.metric_isometry_count,
    full_topology_incidence_automorphism_count:certificate.full_metric.labelled_incidence_automorphism_count,
    families_with_nonliftable_metric_symmetry:certificate.metric_family_census.families_with_nonliftable_metric_symmetry,
    physical_geometry_claim:false,channel_coding_claim:false,semantic_identity_claim:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.finite-topological-distinguishability-metric-amnesia-loom-technical/v0.1',
    domain:certificate.domain,probes:certificate.probes,metric_family_census:certificate.metric_family_census,
    full_metric:certificate.full_metric,maximum_metric_symmetry_control:certificate.maximum_metric_symmetry_control,
    erasure_metric_equivalence:certificate.erasure_metric_equivalence,
    physical_geometry_claim:false,channel_coding_claim:false,semantic_identity_claim:false,
  });
  else throw new Error(`unsupported finite topological distinguishability metric amnesia receiver ${receiver}`);
  return freeze({receiver,payload,custody_witness:certificate.custody_witness,authority:zeroAuthority(),research_only:true,runtime_binding:false});
}
