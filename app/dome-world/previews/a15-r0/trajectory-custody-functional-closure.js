import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';
import { postRecompressionBundleRestorationSidecarCertificate } from './post-recompression-bundle-restoration-sidecar.js';
import { restorationHolonomyPathDependentCustodyCertificate } from './restoration-holonomy-path-dependent-custody-certificate.js';
import { anticipatoryCustodyEnvelopeCanonicalCertificate } from './anticipatory-custody-envelope-uniform-surface-certificate.js';
import { twoSurfaceHorizonAliasingCertificate } from './two-surface-horizon-aliasing.js';
import { finiteDistinguishabilityTrajectoryCalculusCertificate } from './finite-distinguishability-trajectory-calculus.js';

export const TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_SCHEMA =
  'td613.dome-world.trajectory-custody-functional-closure/v0.1';
export const TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_PARENT_RECEIPT =
  'a5a073bdf18cd1b7155422b4bd562de9c80aa3f5';

const STAGES = Object.freeze([0,1,2,3]);
const EXPECTED_858 = Object.freeze({
  '2':82,'3':36,'5':298,'6':48,'10':90,'15':36,'25':88,'30':64,
  '50':88,'75':16,'125':18,'150':32,'250':18,'375':36,'750':72,
});
const EXPECTED_862 = Object.freeze({
  '5':4,'10':4,'15':8,'25':4,'30':16,'50':4,'75':8,'125':18,
  '150':16,'250':18,'375':36,'750':72,
});
const EXPECTED_SCALAR = Object.freeze({
  '5->5': Object.freeze({ count:24, m0:Object.freeze({'5':4,'10':4,'15':8,'25':2,'50':2,'75':4}) }),
  '5->10': Object.freeze({ count:24, m0:Object.freeze({'30':16,'150':8}) }),
  '5->25': Object.freeze({ count:80, m0:Object.freeze({'25':2,'50':2,'75':4,'125':18,'250':18,'375':36}) }),
  '5->50': Object.freeze({ count:80, m0:Object.freeze({'150':8,'750':72}) }),
});
const EXPECTED_MARGINAL = Object.freeze({
  '25x5|5x5': Object.freeze({ count:16, m0:Object.freeze({'5':2,'10':2,'15':4,'25':2,'50':2,'75':4}) }),
  '25x5|5x10': Object.freeze({ count:16, m0:Object.freeze({'30':8,'150':8}) }),
  '25x5|5x25': Object.freeze({ count:80, m0:Object.freeze({'25':2,'50':2,'75':4,'125':18,'250':18,'375':36}) }),
  '25x5|5x50': Object.freeze({ count:80, m0:Object.freeze({'150':8,'750':72}) }),
  '9x5|9x5': Object.freeze({ count:8, m0:Object.freeze({'5':2,'10':2,'15':4}) }),
  '9x5|9x10': Object.freeze({ count:8, m0:Object.freeze({'30':8}) }),
});
const AUTHORITY_KEYS = Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);

let cachedCertificate = null;

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const canonical = value => JSON.stringify(value);
const zeroAuthority = () => freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key,false])));
const normalizeRecord = record => Object.fromEntries(Object.entries(record).sort(([a],[b]) => a.localeCompare(b)));
const sameRecord = (left,right) => canonical(normalizeRecord(left)) === canonical(normalizeRecord(right));

function scheduleId(schedule) {
  const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
  return schedule.map(stratum=>letters[stratum]).join('-');
}

function stateCube() {
  const out=[];
  for(let x1=-2;x1<=2;x1+=1) for(let x2=-2;x2<=2;x2+=1) for(let x3=-2;x3<=2;x3+=1) out.push(freeze([x1,x2,x3]));
  return freeze(out);
}

function buildAntecedents(policy) {
  const policyBySchedule=new Map(policy.policy_geometry.map(row=>[row.schedule_id,row]));
  const antecedents=[];
  for(const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id=scheduleId(schedule);
    const matrix=phasonicObservationMatrix(schedule);
    const p=policyBySchedule.get(id);
    if(!p) throw new Error(`missing closure policy row ${id}`);
    for(const state of stateCube()) antecedents.push(freeze({
      schedule:freeze([...schedule]), schedule_id:id, first_stratum:schedule[0], state,
      observation_matrix:matrix, observation:observePhasonicState(state,schedule),
      replay_required:p.replay_required,
    }));
  }
  return freeze(antecedents);
}

function quotientValue(stage,a) {
  if(stage===0) return freeze(['NULL_REGISTERED_TRACE']);
  return freeze([
    freeze(a.observation_matrix.slice(0,stage).map(row=>freeze([...row]))),
    freeze(a.observation.slice(0,stage)),
  ]);
}

function claimValue(claim,a) {
  if(claim==='FIRST_STRATUM') return a.first_stratum;
  if(claim==='SCHEDULE') return a.schedule_id;
  if(claim==='X1') return a.state[0];
  if(claim==='X2') return a.state[1];
  if(claim==='X3') return a.state[2];
  if(claim==='FULL_STATE') return a.state;
  if(claim==='REPLAY_REQUIRED_FOR_EXACT_STATE') return a.replay_required;
  throw new Error(`unknown closure claim ${claim}`);
}
const bundleValue=(claims,a)=>claims.map(claim=>[claim,claimValue(claim,a)]);

function globalFibreAtlas(antecedents) {
  const atlas=new Map();
  for(const stage of STAGES) {
    const fibres=new Map();
    for(const a of antecedents) {
      const key=canonical(quotientValue(stage,a));
      if(!fibres.has(key)) fibres.set(key,[]);
      fibres.get(key).push(a);
    }
    atlas.set(stage,fibres);
  }
  return atlas;
}

function targetMap(antecedents) {
  return new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
    const id=scheduleId(schedule);
    return [id,antecedents.filter(a=>a.schedule_id===id)];
  }));
}
const occupiedKeys=(targets,stage)=>[...new Set(targets.map(a=>canonical(quotientValue(stage,a))))];

function profile(atlas,targets,stage,claims) {
  const cards=[];
  for(const key of occupiedKeys(targets,stage)) {
    const fibre=atlas.get(stage).get(key);
    const support=new Set(fibre.map(a=>canonical(bundleValue(claims,a))));
    cards.push(support.size);
  }
  cards.sort((a,b)=>a-b);
  return freeze({
    stage,
    cards:freeze(cards),
    maximum:Math.max(...cards),
    all_singleton:cards.every(value=>value===1),
  });
}

function uniformProfileKey(p) {
  const unique=[...new Set(p.cards)];
  return unique.length===1 ? `${p.cards.length}x${unique[0]}` : `${p.cards.length}xMIXED:${p.cards.join(',')}`;
}

function inc(map,key,amount=1) { map.set(String(key),(map.get(String(key))??0)+amount); }
function recordFromMap(map,numeric=false) {
  const entries=[...map.entries()].sort(([a],[b])=>numeric?Number(a)-Number(b):a.localeCompare(b));
  return freeze(Object.fromEntries(entries));
}
function incNested(map,key,m0) {
  if(!map.has(key)) map.set(key,{count:0,m0:new Map()});
  const row=map.get(key); row.count+=1; inc(row.m0,m0);
}
function nestedRecord(map) {
  return freeze(Object.fromEntries([...map.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([key,row])=>[
    key,freeze({count:row.count,m0:recordFromMap(row.m0,true)}),
  ])));
}

function buildProfiles(bundleParent,antecedents,atlas) {
  const targets=targetMap(antecedents);
  const profiles=new Map();
  let stageMaximumRecoveries=0;
  for(const row of bundleParent.bundle_support_certificate.rows) {
    const scheduleTargets=targets.get(row.schedule_id);
    for(const stage of STAGES) {
      const p=profile(atlas,scheduleTargets,stage,row.claims);
      profiles.set(`${row.schedule_id}|${row.bundle_id}|${stage}`,p);
      stageMaximumRecoveries+=1;
    }
  }
  return freeze({
    targets,
    profiles,
    stage_maximum_recoveries:stageMaximumRecoveries,
  });
}
const getProfile=(built,row,stage)=>built.profiles.get(`${row.schedule_id}|${row.bundle_id}|${stage}`);

function replay858(bundleParent,built) {
  const distribution=new Map();
  let total=0,unsafe=0,safe=0,safeFailures=0;
  for(const row of bundleParent.bundle_support_certificate.rows) {
    if(row.actual_birth==='INF') continue;
    const birth=row.actual_birth;
    for(let fine=birth;fine<=3;fine+=1) {
      for(let coarse=0;coarse<fine;coarse+=1) {
        total+=1;
        const p=getProfile(built,row,coarse);
        if(coarse<birth) { unsafe+=1; inc(distribution,p.maximum); }
        else { safe+=1; if(!p.all_singleton) safeFailures+=1; }
      }
    }
  }
  return freeze({
    total,unsafe,safe,safe_failures:safeFailures,
    unsafe_distribution:recordFromMap(distribution,true),
    maximum:Math.max(...[...distribution.keys()].map(Number)),
  });
}

function replay860(bundleParent,built) {
  const paths=[];
  let plateau=0,rupture=0,decrease=0,maxExpansion=-1;
  for(const row of bundleParent.bundle_support_certificate.rows) {
    if(row.actual_birth==='INF'||row.actual_birth<2) continue;
    const birth=row.actual_birth;
    for(let fine=birth;fine<=3;fine+=1) {
      for(let intermediate=1;intermediate<birth;intermediate+=1) {
        if(intermediate>=fine) continue;
        for(let terminal=0;terminal<intermediate;terminal+=1) {
          const md=getProfile(built,row,intermediate).maximum;
          const mc=getProfile(built,row,terminal).maximum;
          if(md===mc) plateau+=1; else if(md<mc) rupture+=1; else decrease+=1;
          maxExpansion=Math.max(maxExpansion,mc-md);
          paths.push(freeze({schedule_id:row.schedule_id,bundle_id:row.bundle_id,birth,fine,intermediate,terminal,md,mc,transportable:md===mc}));
        }
      }
    }
  }
  const groups=new Map();
  for(const path of paths) {
    const key=`${path.schedule_id}|${path.bundle_id}|${path.birth}|${path.fine}|${path.terminal}`;
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(path);
  }
  const two=[...groups.values()].filter(group=>group.length===2);
  const mixed=two.filter(group=>group.some(p=>p.transportable)&&group.some(p=>!p.transportable));
  const named=mixed.map(group=>freeze({
    schedule_id:group[0].schedule_id,bundle_id:group[0].bundle_id,
    paths:freeze([...group].sort((a,b)=>a.intermediate-b.intermediate).map(p=>freeze({intermediate:p.intermediate,md:p.md,mc:p.mc,transportable:p.transportable}))),
  }));
  return freeze({
    paths:paths.length,plateau,rupture,decrease,
    endpoint_two_path_groups:two.length,mixed_transport_endpoint_groups:mixed.length,
    same_endpoint_witnesses:freeze(named),maximum_expansion:maxExpansion,
  });
}

function signature(m2,m1,m0) {
  const first=m1===m2?'FLAT':'EXPAND';
  const second=m0===m1?'FLAT':'EXPAND';
  return `${first}->${second}`;
}

function replay862(bundleParent,built) {
  const robust=new Map();
  const signatures=new Map();
  let contexts=0,allM2Five=true,plateau=0,expand=0,fiveTo750=0;
  for(const row of bundleParent.bundle_support_certificate.rows) {
    if(row.actual_birth!==3) continue;
    contexts+=1;
    const m2=getProfile(built,row,2).maximum;
    const m1=getProfile(built,row,1).maximum;
    const m0=getProfile(built,row,0).maximum;
    allM2Five=allM2Five&&m2===5;
    inc(robust,m0); inc(signatures,signature(m2,m1,m0));
    if(m0===m2) plateau+=1; else if(m0>m2) expand+=1;
    if(m2===5&&m0===750) fiveTo750+=1;
  }
  return freeze({
    contexts,all_m2:allM2Five?5:null,robust_distribution:recordFromMap(robust,true),
    local_to_robust_plateau:plateau,anticipatory_expansion:expand,five_to_750:fiveTo750,
    signatures:recordFromMap(signatures),
  });
}

function replay864(bundleParent,built) {
  const scalar=new Map(),marginal=new Map();
  const rows=[];
  for(const row of bundleParent.bundle_support_certificate.rows) {
    if(row.actual_birth!==3) continue;
    const q2=getProfile(built,row,2),q1=getProfile(built,row,1),q0=getProfile(built,row,0);
    const scalarKey=`${q2.maximum}->${q1.maximum}`;
    const marginalKey=`${uniformProfileKey(q2)}|${uniformProfileKey(q1)}`;
    incNested(scalar,scalarKey,q0.maximum); incNested(marginal,marginalKey,q0.maximum);
    rows.push(freeze({schedule_id:row.schedule_id,bundle_id:row.bundle_id,bundle_size:row.bundle_size,m0:q0.maximum,q2_profile:uniformProfileKey(q2),q1_profile:uniformProfileKey(q1)}));
  }
  const scalarRecord=nestedRecord(scalar),marginalRecord=nestedRecord(marginal);
  const scalarAmbiguous=Object.values(scalarRecord).filter(row=>Object.keys(row.m0).length>1);
  const marginalAmbiguous=Object.values(marginalRecord).filter(row=>Object.keys(row.m0).length>1);
  const marginalIdentifying=Object.values(marginalRecord).filter(row=>Object.keys(row.m0).length===1);
  const left=rows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='FIRST_STRATUM+FULL_STATE');
  const right=rows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='X2+X3');
  return freeze({
    contexts:rows.length,
    scalar_classes:scalarRecord,
    scalar_class_count:Object.keys(scalarRecord).length,
    scalar_ambiguous_class_count:scalarAmbiguous.length,
    marginal_classes:marginalRecord,
    marginal_class_count:Object.keys(marginalRecord).length,
    marginal_ambiguous_class_count:marginalAmbiguous.length,
    marginal_identifying_class_count:marginalIdentifying.length,
    ambiguous_contexts:marginalAmbiguous.reduce((sum,row)=>sum+row.count,0),
    identifying_contexts:marginalIdentifying.reduce((sum,row)=>sum+row.count,0),
    named_alias:freeze({left,right,ratio:left?.m0/right?.m0}),
  });
}

function compareParents(r858,r860,r862,r864,parents) {
  const [p858,p860,p862,p864]=parents;
  return freeze({
    replay_858_matches:
      p858.passed && r858.total===p858.restoration_census.transition_count
      && r858.unsafe===p858.restoration_census.unsafe_transition_count
      && r858.safe===p858.restoration_census.safe_control_transition_count
      && sameRecord(r858.unsafe_distribution,p858.restoration_census.m_distribution)
      && r858.maximum===p858.restoration_census.maximum_m
      && r858.safe_failures===0,
    replay_860_matches:
      p860.passed && r860.paths===p860.path_transport_census.total_paths
      && r860.plateau===p860.path_transport_census.transport_plateau_paths
      && r860.rupture===p860.path_transport_census.transport_rupture_paths
      && r860.decrease===p860.path_transport_census.strict_decrease_paths
      && r860.endpoint_two_path_groups===p860.path_transport_census.endpoint_two_path_groups
      && r860.mixed_transport_endpoint_groups===p860.path_transport_census.mixed_transport_endpoint_groups
      && r860.maximum_expansion===p860.path_transport_census.maximum_support_cardinality_expansion,
    replay_862_matches:
      p862.passed && r862.contexts===p862.anticipatory_envelope_census.contexts
      && r862.all_m2===p862.anticipatory_envelope_census.local_q2_minimum_uniform_cardinality
      && sameRecord(r862.robust_distribution,p862.anticipatory_envelope_census.future_robust_spectrum)
      && r862.local_to_robust_plateau===p862.anticipatory_envelope_census.local_to_robust_plateau
      && r862.anticipatory_expansion===p862.anticipatory_envelope_census.local_to_robust_expand
      && r862.five_to_750===72,
    replay_864_matches:
      p864.passed && r864.contexts===p864.census.contexts
      && canonical(r864.scalar_classes)===canonical(p864.census.scalar_two_surface_classes)
      && r864.scalar_class_count===p864.census.scalar_class_count
      && r864.scalar_ambiguous_class_count===p864.census.scalar_ambiguous_class_count
      && canonical(r864.marginal_classes)===canonical(p864.census.marginal_profile_classes)
      && r864.marginal_class_count===p864.census.marginal_profile_class_count
      && r864.marginal_ambiguous_class_count===p864.census.marginal_ambiguous_class_count
      && r864.marginal_identifying_class_count===p864.census.marginal_identifying_class_count
      && r864.ambiguous_contexts===p864.census.marginal_ambiguous_contexts
      && r864.identifying_contexts===p864.census.marginal_identifying_contexts
      && r864.named_alias.ratio===p864.census.named_alias_B.ratio,
  });
}

export function trajectoryCustodyFunctionalClosureCertificate() {
  if(cachedCertificate) return cachedCertificate;
  const trajectoryParent=finiteDistinguishabilityTrajectoryCalculusCertificate();
  const bundleParent=claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const p858=postRecompressionBundleRestorationSidecarCertificate();
  const p860=restorationHolonomyPathDependentCustodyCertificate();
  const p862=anticipatoryCustodyEnvelopeCanonicalCertificate();
  const p864=twoSurfaceHorizonAliasingCertificate();
  const antecedents=buildAntecedents(policy);
  const atlas=globalFibreAtlas(antecedents);
  const built=buildProfiles(bundleParent,antecedents,atlas);
  const r858=replay858(bundleParent,built);
  const r860=replay860(bundleParent,built);
  const r862=replay862(bundleParent,built);
  const r864=replay864(bundleParent,built);
  const parentMatches=compareParents(r858,r860,r862,r864,[p858,p860,p862,p864]);

  const named860Exact=r860.same_endpoint_witnesses.length===2
    && r860.same_endpoint_witnesses.every(w=>['P-H-I','P-I-H'].includes(w.schedule_id)&&w.bundle_id==='X2+X3'
      && w.paths[0].intermediate===1&&w.paths[0].md===25&&w.paths[0].mc===25&&w.paths[0].transportable
      && w.paths[1].intermediate===2&&w.paths[1].md===5&&w.paths[1].mc===25&&!w.paths[1].transportable);
  const named864Exact=r864.named_alias.left?.bundle_size===2
    && r864.named_alias.right?.bundle_size===2
    && r864.named_alias.left?.q2_profile===r864.named_alias.right?.q2_profile
    && r864.named_alias.left?.q1_profile===r864.named_alias.right?.q1_profile
    && r864.named_alias.left?.m0===375&&r864.named_alias.right?.m0===25&&r864.named_alias.ratio===15;

  const exact=antecedents.length===750
    && bundleParent.bundle_support_certificate.rows.length===762
    && built.stage_maximum_recoveries===3048
    && r858.total===1180&&r858.unsafe===1022&&r858.safe===158&&sameRecord(r858.unsafe_distribution,EXPECTED_858)&&r858.maximum===750&&r858.safe_failures===0
    && r860.paths===784&&r860.plateau===42&&r860.rupture===742&&r860.decrease===0&&r860.endpoint_two_path_groups===208&&r860.mixed_transport_endpoint_groups===2&&r860.maximum_expansion===745&&named860Exact
    && r862.contexts===208&&r862.all_m2===5&&sameRecord(r862.robust_distribution,EXPECTED_862)&&r862.local_to_robust_plateau===4&&r862.anticipatory_expansion===204&&r862.five_to_750===72
    && r862.signatures['FLAT->FLAT']===4&&r862.signatures['FLAT->EXPAND']===20&&r862.signatures['EXPAND->FLAT']===2&&r862.signatures['EXPAND->EXPAND']===182
    && r864.contexts===208&&canonical(r864.scalar_classes)===canonical(EXPECTED_SCALAR)&&canonical(r864.marginal_classes)===canonical(EXPECTED_MARGINAL)
    && r864.scalar_class_count===4&&r864.scalar_ambiguous_class_count===4&&r864.marginal_class_count===6&&r864.marginal_ambiguous_class_count===5&&r864.marginal_identifying_class_count===1
    && r864.ambiguous_contexts===200&&r864.identifying_contexts===8&&named864Exact
    && Object.values(parentMatches).every(Boolean);

  const rowComparisons=1180+784+208+208;
  const passed=trajectoryParent.passed&&trajectoryParent.parent_receipt==='b3902a14312d06eb91762ac0369fdb1daf5ff543'
    && bundleParent.passed&&policy.passed&&p858.passed&&p860.passed&&p862.passed&&p864.passed&&exact&&rowComparisons===2380;

  cachedCertificate=freeze({
    schema:TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_SCHEMA,
    parent_receipt:TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_PARENT_RECEIPT,
    hierarchy:freeze({
      support_labelled_trajectory:'D_Q',
      per_fibre_cardinality_profiles:'P_t(Q)',
      stage_maximum_vector:'m(Q)=(m3,m2,m1,m0)',
      authority_birth_source:'INHERITED_SEPARATE_BIRTH_INDEX',
      maximum_vector_reversible_to_trajectory:false,
      cardinality_profiles_reversible_to_support_identity:false,
    }),
    replay_858:r858,replay_860:r860,replay_862:r862,replay_864:r864,
    parent_matches:parentMatches,
    execution_ledger:freeze({
      stage_maximum_recoveries:built.stage_maximum_recoveries,
      replay_858_rows:1180,replay_860_rows:784,replay_862_rows:208,replay_864_rows:208,
      cross_theorem_row_comparisons:rowComparisons,
      synthetic_information_quantity_claimed:false,
    }),
    exact,passed,
    classifications:freeze(passed?[
      'IN_THE_FIXED_S3_REGISTERED_STAGE_DOMAIN_THE_SUPPORT_LABELLED_AMBIENT_DISTINGUISHABILITY_TRAJECTORY_TOGETHER_WITH_THE_INHERITED_AUTHORITY_BIRTH_INDEX_EXACTLY_REPLAYS_THE_EARNED_POST_RECOMPRESSION_RESTORATION_PATH_TRANSPORT_ANTICIPATORY_HORIZON_AND_TWO_SURFACE_ALIASING_CENSUSES',
      'THE_STAGE_MAXIMUM_VECTOR_CONDITIONAL_ON_THE_INHERITED_BIRTH_INDEX_IS_SUFFICIENT_FOR_THE_DECLARED_SCALAR_CARDINALITY_CUSTODY_FUNCTIONALS_OF_858_860_AND_862_IN_THE_FIXED_DOMAIN',
      'THE_864_TWO_SURFACE_MARGINAL_ALIASING_CENSUS_REQUIRES_PER_FIBRE_CARDINALITY_PROFILES_BEYOND_STAGE_MAXIMA_WHILE_866_SUPPORT_UNION_SEMANTICS_REQUIRE_SUPPORT_IDENTITY_ON_THE_AMBIENT_MERGE_TRAJECTORY',
      'THE_FIXED_WESTERN_CUSTODY_FRONTIER_FOR_858_860_862_864_FACTORS_THROUGH_EXPLICIT_LOSSY_PROJECTIONS_OF_THE_866_TRAJECTORY_WITHOUT_COLLAPSING_THE_TRAJECTORY_TO_ANY_ONE_OF_THOSE_PROJECTIONS',
    ]:[]),
    scars:freeze([
      'SUPPORT_TRAJECTORY != AUTHORITY_BIRTH_LEDGER',
      'MAXIMUM_VECTOR != SUPPORT_LABELLED_TRAJECTORY',
      'PER_FIBRE_CARDINALITY_PROFILE != SUPPORT_IDENTITY',
      'TRAJECTORY_FACTOR_THROUGH_MAXIMA_FOR_DECLARED_SCALAR_CUSTODY != TRAJECTORY_REDUCIBLE_TO_MAXIMA_FOR_SEMANTIC_UNION',
      'DECLARED_CUSTODY_FUNCTIONAL_CLOSURE != CLOSURE_OF_ALL_FUTURE_QUESTIONS',
      'CROSS_THEOREM_REPLAY != UNIVERSAL_SUFFICIENT_STATISTIC',
      'SEMANTIC_CARRIER_SUFFICIENCY != UNIVERSAL_ENCODING_MINIMALITY',
      'REPLAY_OF_EARNED_CENSUS != NEW_SOURCE_INFORMATION',
      'FINITE_CLOSURE != ASYMPTOTIC_INFORMATION_THEOREM',
      'ROW_COMPARISON_COUNT != INFORMATION_QUANTITY',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
  });
  return cachedCertificate;
}

export function compileTrajectoryCustodyFunctionalClosureProjection(receiver) {
  const certificate=trajectoryCustodyFunctionalClosureCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified trajectory custody-functional closure');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH) payload=freeze({
    payload_schema:'td613.dome-world.trajectory-custody-functional-closure-child-legible/v0.1',
    truths:freeze([
      'THE_FULL_MERGE_TRAJECTORY_CAN_BE_COMPRESSED_TO_SMALLER_SUMMARIES_FOR_SOME_CUSTODY_QUESTIONS_BUT_NOT_FOR_ALL_OF_THE_SEMANTIC_TESTS_WE_ALREADY_EARNED',
      'THE_AUTHORITY_BIRTH_LEDGER_STAYS_SEPARATE_FROM_THE_SUPPORT_TRAJECTORY',
      'REPLAYING_ALL_PRIOR_CUSTODY_CENSUSES_SHOWS_THE_TRAJECTORY_IS_A_COMMON_FINITE_CARRIER_WITHOUT_MAKING_IT_A_UNIVERSAL_ANSWER_OBJECT',
    ]),
    stage_maximum_recoveries:certificate.execution_ledger.stage_maximum_recoveries,
    cross_theorem_row_comparisons:certificate.execution_ledger.cross_theorem_row_comparisons,
    full_support_tables_exposed:false,full_birth_table_exposed:false,full_replay_rows_exposed:false,
  });
  else if(receiver===AIA_RECEIVERS.LOOM) payload=freeze({
    payload_schema:'td613.dome-world.trajectory-custody-functional-closure-loom-technical/v0.1',
    stage_maximum_recoveries:certificate.execution_ledger.stage_maximum_recoveries,
    replay_rows:freeze({r858:1180,r860:784,r862:208,r864:208,total:2380}),
    parent_matches:certificate.parent_matches,
    full_support_tables_exposed:false,full_birth_table_exposed:false,full_replay_rows_exposed:false,
  });
  else throw new Error(`undeclared closure receiver ${receiver}`);
  return freeze({
    schema:TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_SCHEMA,receiver,
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,payload,authority:zeroAuthority(),research_only:true,runtime_binding:false,
    claim_ceiling:freeze({
      universal_sufficient_statistic:false,universal_encoding_minimality:false,shannon_capacity:false,entropy:false,mutual_information:false,
      physical_holonomy:false,operational_path_groupoid:false,source_state_mutation:false,retrocausality:false,
      merge:false,deploy:false,publish:false,release:false,vercel:false,
    }),
  });
}

export function rejectTrajectoryCustodyFunctionalClosureOverreach(candidate) {
  const forbidden=['universal_sufficient_statistic','universal_encoding_minimality','shannon_capacity','entropy','mutual_information','physical_holonomy','operational_path_groupoid','source_state_mutation','retrocausality'];
  const violation=forbidden.some(key=>candidate?.[key]===true)
    || Object.values(candidate?.authority??{}).some(Boolean)
    || Object.values(candidate?.claim_ceiling??{}).some(Boolean)
    || candidate?.payload?.full_support_tables_exposed===true
    || candidate?.payload?.full_birth_table_exposed===true
    || candidate?.payload?.full_replay_rows_exposed===true;
  return freeze({accepted:!violation,reason:violation?'TRAJECTORY_CUSTODY_FUNCTIONAL_CLOSURE_OVERREACH':'WITHIN_FIXED_CLOSURE_MEMBRANE'});
}
