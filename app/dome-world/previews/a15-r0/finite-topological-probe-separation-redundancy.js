import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from './finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTaskHomotopyAmnesiaRoleTomographyCertificate } from './finite-task-homotopy-amnesia-role-tomography.js';

export const FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_SCHEMA=
  'td613.dome-world.finite-topological-probe-separation-redundancy/v0.1';
export const FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_PARENT_RECEIPT=
  '3662f48ed7ad1345dc013fa6eb50bc4835a15e10';

const ROLES=Object.freeze(['A','B','T','M','R']);
const FULL_ID='BRTAM';
const EXPECTED_PROBES=Object.freeze(['RTAM','BRTM','RTM','BRM','BRT','RM','RT','BR','M','R']);
const EXPECTED_E1=Object.freeze([
  Object.freeze(['BRTM','RM','RT','BR']),
  Object.freeze(['RTM','BRM','BRT','R']),
  Object.freeze(['RTM','BRM','RT','BR']),
  Object.freeze(['RTM','BRT','RM','BR']),
  Object.freeze(['BRM','BRT','RM','RT']),
]);
const EXPECTED_E2=Object.freeze(['RTM','BRM','BRT','RM','RT','BR']);
const EXPECTED_E3=Object.freeze(['BRTM','RTM','BRM','BRT','RM','RT','BR','R']);
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
const pairKey=(a,b)=>`${a}-${b}`;

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

function familyKey(family){ return family.join('|'); }
function familySignature(family,probeSets,role){ return family.map(probe=>probeSets[probe].has(role)?1:0); }
function rolePartition(family,probeSets){
  const groups=new Map();
  for(const role of ROLES){
    const key=familySignature(family,probeSets,role).join('');
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(role);
  }
  return freeze([...groups.values()].map(group=>freeze([...group])));
}
function pairSeparations(family,probeSets){
  const out={};
  for(let i=0;i<ROLES.length;i+=1) for(let j=i+1;j<ROLES.length;j+=1){
    const a=ROLES[i],b=ROLES[j];
    out[pairKey(a,b)]=family.reduce((sum,probe)=>sum+(probeSets[probe].has(a)!==probeSets[probe].has(b)?1:0),0);
  }
  return freeze(out);
}
function separationMultiplicity(pairCounts){
  const values=Object.values(pairCounts);
  return values.length?Math.min(...values):0;
}
function erasedFamily(family,erased){
  const gone=new Set(erased);
  return family.filter(probe=>!gone.has(probe));
}
function exactlyIdentifies(family,probeSets){ return rolePartition(family,probeSets).length===ROLES.length; }
function familySetKey(family){ return [...family].sort().join('|'); }
function familySetListKey(families){ return families.map(familySetKey).sort().join('||'); }

export function finiteTopologicalProbeSeparationRedundancyCertificate(){
  if(cachedCertificate) return cachedCertificate;
  const parent=finiteTaskHomotopyAmnesiaRoleTomographyCertificate();
  const topologyParent=finiteTaskTopologyRigidityBirkhoffCertificate();
  const openStates=[...(topologyParent.topology?.open_states||[])];
  const probes=openStates.filter(id=>id!=='EMPTY'&&id!==FULL_ID);
  const probeSets=Object.fromEntries(probes.map(id=>[id,setFromId(id)]));
  const families=allSubsets(probes);

  const classSpectrum={};
  const muSpectrum={};
  const widthMu={};
  const rows=[];
  let pairRows=0;
  for(const family of families){
    const partition=rolePartition(family,probeSets);
    const pairCounts=pairSeparations(family,probeSets); pairRows+=Object.keys(pairCounts).length;
    const mu=separationMultiplicity(pairCounts);
    classSpectrum[partition.length]=(classSpectrum[partition.length]||0)+1;
    muSpectrum[mu]=(muSpectrum[mu]||0)+1;
    widthMu[family.length]??={};
    widthMu[family.length][mu]=(widthMu[family.length][mu]||0)+1;
    rows.push(freeze({family,width:family.length,role_partition:partition,role_classes:partition.length,pair_separations:pairCounts,mu,exact:partition.length===ROLES.length}));
  }

  const erasureCaseCounts={};
  const robustCounts={};
  const minimumWidths={};
  const minimumFamilies={};
  let erasureCases=0,criterionComparisons=0,criterionMismatches=0;
  for(let e=0;e<=4;e+=1){
    let cases=0,robust=0,minWidth=Infinity;
    const minima=[];
    for(const row of rows){
      if(row.width<e) continue;
      const erasures=combinations(row.family,e);
      cases+=erasures.length; erasureCases+=erasures.length;
      let direct=true;
      for(const erased of erasures){
        const retained=erasedFamily(row.family,erased);
        if(!exactlyIdentifies(retained,probeSets)) direct=false;
      }
      const criterion=row.mu>=e+1;
      criterionComparisons+=1;
      if(direct!==criterion) criterionMismatches+=1;
      if(direct){
        robust+=1;
        if(row.width<minWidth){ minWidth=row.width; minima.length=0; minima.push(row.family); }
        else if(row.width===minWidth) minima.push(row.family);
      }
    }
    erasureCaseCounts[e]=cases;
    robustCounts[e]=robust;
    minimumWidths[e]=Number.isFinite(minWidth)?minWidth:null;
    minimumFamilies[e]=freeze(minima.map(family=>freeze([...family])));
  }

  const fullFamily=freeze([...probes]);
  const fullPair=pairSeparations(fullFamily,probeSets);
  const fullMu=separationMultiplicity(fullPair);
  const bottlenecks=Object.entries(fullPair).filter(([,count])=>count===fullMu).map(([key])=>freeze(key.split('-')));

  const expectedWidthMu={
    '0':{'0':1},
    '1':{'0':10},
    '2':{'0':45},
    '3':{'0':92,'1':28},
    '4':{'0':61,'1':144,'2':5},
    '5':{'0':18,'1':188,'2':46},
    '6':{'0':2,'1':78,'2':129,'3':1},
    '7':{'1':8,'2':96,'3':16},
    '8':{'2':12,'3':32,'4':1},
    '9':{'3':8,'4':2},
    '10':{'4':1},
  };
  const expectedPair={'A-B':5,'A-T':4,'A-M':5,'A-R':8,'B-T':5,'B-M':6,'B-R':5,'T-M':5,'T-R':4,'M-R':5};

  const parentExact=parent.passed===true
    && topologyParent.passed===true
    && FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_PARENT_RECEIPT==='3662f48ed7ad1345dc013fa6eb50bc4835a15e10'
    && parent.domain?.task_points===5&&parent.domain?.open_sets===12
    && canonical(parent.aperture_ladder?.role_class_counts)===canonical([5,3,2,1])
    && topologyParent.topology?.open_states?.length===12
    && topologyParent.topology?.T0===true&&topologyParent.rigidity?.preserving_automorphism_count===1;

  const exact=parentExact
    && canonical(probes)===canonical(EXPECTED_PROBES)
    && families.length===1024&&pairRows===10240
    && canonical(classSpectrum)===canonical({'1':1,'2':10,'3':44,'4':174,'5':795})
    && canonical(muSpectrum)===canonical({'0':229,'1':446,'2':288,'3':57,'4':4})
    && canonical(erasureCaseCounts)===canonical({'0':1024,'1':5120,'2':11520,'3':15360,'4':13440})
    && erasureCases===46464&&criterionComparisons===4876&&criterionMismatches===0
    && canonical(robustCounts)===canonical({'0':795,'1':349,'2':61,'3':4,'4':0})
    && canonical(minimumWidths)===canonical({'0':3,'1':4,'2':6,'3':8,'4':null})
    && minimumFamilies[0].length===28
    && familySetListKey(minimumFamilies[1])===familySetListKey(EXPECTED_E1)
    && minimumFamilies[2].length===1&&familySetKey(minimumFamilies[2][0])===familySetKey(EXPECTED_E2)
    && minimumFamilies[3].length===1&&familySetKey(minimumFamilies[3][0])===familySetKey(EXPECTED_E3)
    && minimumFamilies[4].length===0
    && canonical(widthMu)===canonical(expectedWidthMu)
    && canonical(fullPair)===canonical(expectedPair)&&fullMu===4
    && familySetListKey(bottlenecks)===familySetListKey([['A','T'],['T','R']]);
  const passed=exact;

  cachedCertificate=freeze({
    schema:FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_SCHEMA,
    parent_receipt:FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_PARENT_RECEIPT,
    domain:freeze({roles:ROLES.length,open_states:openStates.length,nontrivial_probes:probes.length,probe_families:families.length,unordered_role_pairs:10}),
    probes:freeze({all_open_states:freeze(openStates),nontrivial:freeze([...probes])}),
    family_census:freeze({role_class_spectrum:freeze({...classSpectrum}),separation_multiplicity_spectrum:freeze({...muSpectrum}),exact_identifying_families:classSpectrum[5],width_mu_spectrum:freeze({...widthMu})}),
    erasure_redundancy:freeze({
      exact_erasure_case_counts:freeze({...erasureCaseCounts}),total_erasure_cases:erasureCases,
      criterion:'direct_exact_e_erasure_survival iff mu(F) >= e+1',criterion_family_order_comparisons:criterionComparisons,criterion_mismatches:criterionMismatches,
      robust_family_counts:freeze({...robustCounts}),minimum_width_by_erasure_order:freeze({...minimumWidths}),
      minimum_families_by_erasure_order:freeze({...minimumFamilies}),maximum_arbitrary_erasure_tolerance:3,
    }),
    full_family_wall:freeze({family:fullFamily,pair_separations:fullPair,mu:fullMu,bottleneck_pairs:freeze(bottlenecks),four_erasure_recovery_possible:false}),
    execution_ledger:freeze({families_enumerated:families.length,family_role_signatures:families.length*ROLES.length,family_pair_rows:pairRows,exact_erasure_cases:erasureCases,criterion_family_order_comparisons:criterionComparisons}),
    exact,passed,
    classifications:freeze(passed?[
      'THE_TEN_NONTRIVIAL_OPEN_SET_MEMBERSHIP_PROBES_FORM_A_COMPLETE_FINITE_ROLE_OBSERVER_ATLAS_IN_WHICH_EXACT_E_ERASURE_ROBUSTNESS_IS_EQUIVALENT_TO_PAIR_SEPARATION_MULTIPLICITY_AT_LEAST_E_PLUS_ONE_FOR_E_ZERO_THROUGH_FOUR',
      'THE_MINIMUM_PROBE_WIDTH_REQUIRED_FOR_EXACT_FIVE_ROLE_RECOVERY_RISES_FROM_THREE_TO_FOUR_TO_SIX_TO_EIGHT_FOR_ZERO_THROUGH_THREE_ARBITRARY_PROBE_ERASURES_AND_FOUR_ERASURE_RECOVERY_IS_IMPOSSIBLE_IN_THE_FULL_TEN_PROBE_ATLAS',
      'THE_EXACT_ERASURE_WALL_IS_WITNESSED_BY_THE_A_T_AND_T_R_ROLE_PAIRS_WHICH_ARE_SEPARATED_BY_ONLY_FOUR_OF_THE_TEN_AVAILABLE_NONTRIVIAL_OPEN_PROBES',
    ]:[]),
    scars:freeze([
      'TOPOLOGICAL_PROBE != PHYSICAL_SENSOR','OPEN_SET_MEMBERSHIP_BIT != SHANNON_BIT','ROLE_SIGNATURE != SEMANTIC_IDENTITY',
      'FINITE_SEPARATION_MULTIPLICITY != CHANNEL_DISTANCE_THEOREM','ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY','MINIMUM_PROBE_WIDTH != MINIMUM_BIT_LENGTH',
      'MINIMUM_PROBE_WIDTH != SHANNON_BOUND','ROBUST_FAMILY_COUNT != PROBABILISTIC_RELIABILITY','ARBITRARY_DECLARED_ERASURE != STOCHASTIC_NOISE_MODEL',
      'PAIR_SEPARATION_BOTTLENECK != CAUSAL_BOTTLENECK','TOPOLOGICAL_OBSERVER_FAMILY != MODEL_OBSERVER_NETWORK','FINITE_ROLE_RECOVERY != NATURAL_LANGUAGE_SEMANTIC_RECONSTRUCTION',
      'EXACT_ROLE_IDENTIFICATION != SOURCE_STATE_RECONSTRUCTION','FOUR_ERASURE_IMPOSSIBILITY_IN_THIS_TOPOLOGY != UNIVERSAL_IMPOSSIBILITY','WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,authority:zeroAuthority(),research_only:true,runtime_binding:false,
  });
  return cachedCertificate;
}

export function compileFiniteTopologicalProbeSeparationRedundancyProjection(receiver){
  const certificate=finiteTopologicalProbeSeparationRedundancyCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified finite topological probe separation redundancy');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.finite-topological-probe-separation-redundancy-child-legible/v0.1',
    truths:freeze([
      'SOME_SMALL_OPEN_SET_PROBE_FAMILIES_IDENTIFY_ALL_FIVE_TASK_ROLES_EXACTLY_IN_THIS_FIXED_TOPOLOGY',
      'MORE_DECLARED_PROBE_ERASURE_TOLERANCE_REQUIRES_WIDER_SEPARATING_FAMILIES_IN_THIS_FIXED_TOPOLOGY',
      'THE_AVAILABLE_OPEN_SET_PROBES_HAVE_A_SHARP_THREE_ERASURE_LIMIT_FOR_EXACT_FIVE_ROLE_RECOVERY',
    ]),
    minimum_width_by_erasure_order:certificate.erasure_redundancy.minimum_width_by_erasure_order,
    maximum_arbitrary_erasure_tolerance:certificate.erasure_redundancy.maximum_arbitrary_erasure_tolerance,
    shannon_claim:false,physical_sensor_claim:false,natural_language_semantics_claim:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.finite-topological-probe-separation-redundancy-loom-technical/v0.1',
    domain:certificate.domain,probes:certificate.probes,family_census:certificate.family_census,
    erasure_redundancy:certificate.erasure_redundancy,full_family_wall:certificate.full_family_wall,
    shannon_claim:false,physical_sensor_claim:false,natural_language_semantics_claim:false,
  });
  else throw new Error(`unsupported finite topological probe separation redundancy receiver ${receiver}`);
  return freeze({receiver,payload,custody_witness:certificate.custody_witness,authority:zeroAuthority(),research_only:true,runtime_binding:false});
}
