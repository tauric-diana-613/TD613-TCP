import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';
import { trajectoryCustodyFunctionalClosureCertificate } from './trajectory-custody-functional-closure.js';

export const FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_SCHEMA =
  'td613.dome-world.finite-custody-behavioral-quotient-task-closure/v0.1';
export const FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT =
  'd94c1b6cd47dbb611ae4a6a3297522ee99bb29ef';

const STAGES = Object.freeze([0,1,2,3]);
const AUTHORITY_KEYS = Object.freeze([
  'inverse','encoder','custody_mutation','source_state_transform','new_sensor_measurement',
  'release','production','physical_claim','continuum_claim','cryptographic_key',
  'authentication_credential','retrocausal_channel','retention_policy',
]);
const EXPECTED = Object.freeze({
  contexts:762,
  D:762,
  C:154,
  Phi:36,
  birth:4,
  birth_contexts:Object.freeze({'1':26,'2':80,'3':208,INF:448}),
  C_by_birth:Object.freeze({'1':18,'2':32,'3':40,INF:64}),
  Phi_by_birth:Object.freeze({'1':5,'2':10,'3':20,INF:1}),
  C_to_Phi_merge_spectrum:Object.freeze({'2':28,'4':4,'6':3,'64':1}),
  ablations:Object.freeze({
    q1_drop_m0:Object.freeze({ambiguous_keys:1,contexts:26,Phi_classes:5,maximum_Phi_multiplicity:5}),
    q2_drop_m1:Object.freeze({ambiguous_keys:1,contexts:24,Phi_classes:2,maximum_Phi_multiplicity:2}),
    q2_drop_m0:Object.freeze({ambiguous_keys:3,contexts:80,Phi_classes:10,maximum_Phi_multiplicity:6}),
    q3_drop_n2:Object.freeze({ambiguous_keys:4,contexts:32,Phi_classes:8,maximum_Phi_multiplicity:2}),
    q3_drop_m1:Object.freeze({ambiguous_keys:4,contexts:32,Phi_classes:8,maximum_Phi_multiplicity:2}),
    q3_drop_m0:Object.freeze({ambiguous_keys:5,contexts:200,Phi_classes:19,maximum_Phi_multiplicity:6}),
  }),
});

let cachedCertificate = null;

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const canonical=value=>JSON.stringify(value);
const sameRecord=(a,b)=>canonical(a)===canonical(b);
const zeroAuthority=()=>freeze(Object.fromEntries(AUTHORITY_KEYS.map(key=>[key,false])));

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
    if(!p) throw new Error(`missing behavioral-quotient policy row ${id}`);
    for(const state of stateCube()) antecedents.push(freeze({
      schedule:freeze([...schedule]),schedule_id:id,first_stratum:schedule[0],state,
      observation_matrix:matrix,observation:observePhasonicState(state,schedule),
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
  throw new Error(`unknown behavioral-quotient claim ${claim}`);
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

function profile(atlas,targets,stage,claims) {
  const keys=[...new Set(targets.map(a=>canonical(quotientValue(stage,a))))].sort();
  const supportRows=[];
  const cards=[];
  for(const key of keys) {
    const fibre=atlas.get(stage).get(key);
    const support=[...new Set(fibre.map(a=>canonical(bundleValue(claims,a))))].sort();
    cards.push(support.length);
    supportRows.push(freeze([key,freeze(support)]));
  }
  cards.sort((a,b)=>a-b);
  return freeze({
    stage,
    cards:freeze(cards),
    maximum:Math.max(...cards),
    all_singleton:cards.every(value=>value===1),
    occupied_fibres:keys.length,
    support_rows:freeze(supportRows),
  });
}

function uniformProfileKey(p) {
  const unique=[...new Set(p.cards)];
  return unique.length===1 ? `${p.cards.length}x${unique[0]}` : `${p.cards.length}xMIXED:${p.cards.join(',')}`;
}

function recordFromMap(map,numeric=false) {
  return freeze(Object.fromEntries([...map.entries()].sort(([a],[b])=>numeric?Number(a)-Number(b):String(a).localeCompare(String(b)))));
}
function inc(map,key,amount=1) { map.set(String(key),(map.get(String(key))??0)+amount); }

function buildContexts(bundleParent,antecedents,atlas) {
  const targets=targetMap(antecedents);
  const contexts=[];
  let stageProfiles=0;
  for(const row of bundleParent.bundle_support_certificate.rows) {
    const ps={};
    for(const stage of STAGES) {
      ps[stage]=profile(atlas,targets.get(row.schedule_id),stage,row.claims);
      stageProfiles+=1;
    }
    contexts.push(freeze({row,profiles:freeze(ps)}));
  }
  return freeze({contexts:freeze(contexts),stage_profile_reconstructions:stageProfiles});
}

function derivedBirth(context) {
  for(const stage of [1,2,3]) if(context.profiles[stage].maximum===1) return stage;
  return 'INF';
}

function replay858ForContext(context) {
  const birth=context.row.actual_birth;
  if(birth==='INF') return freeze([]);
  const out=[];
  for(let fine=birth;fine<=3;fine+=1) for(let coarse=0;coarse<fine;coarse+=1) {
    const p=context.profiles[coarse];
    out.push(freeze([
      fine,coarse,
      coarse<birth ? freeze(['RESTORE',p.maximum]) : freeze(['PRESERVE',p.all_singleton]),
    ]));
  }
  return freeze(out);
}

function replay860ForContext(context) {
  const birth=context.row.actual_birth;
  if(birth==='INF'||birth<2) return freeze([]);
  const out=[];
  for(let fine=birth;fine<=3;fine+=1) {
    for(let intermediate=1;intermediate<birth;intermediate+=1) {
      if(intermediate>=fine) continue;
      for(let terminal=0;terminal<intermediate;terminal+=1) {
        const md=context.profiles[intermediate].maximum;
        const mc=context.profiles[terminal].maximum;
        out.push(freeze([fine,intermediate,terminal,md,mc,md===mc]));
      }
    }
  }
  return freeze(out);
}

function replay862ForContext(context) {
  if(context.row.actual_birth!==3) return null;
  const m2=context.profiles[2].maximum,m1=context.profiles[1].maximum,m0=context.profiles[0].maximum;
  return freeze([m2,m1,m0,m1===m2?'FLAT':'EXPAND',m0===m1?'FLAT':'EXPAND']);
}

function replay864ForContext(context) {
  if(context.row.actual_birth!==3) return null;
  const p2=context.profiles[2],p1=context.profiles[1],p0=context.profiles[0];
  return freeze([
    p2.maximum,p1.maximum,p0.maximum,
    uniformProfileKey(p2),uniformProfileKey(p1),
  ]);
}

function phiKey(context) {
  return canonical(freeze([
    ['BIRTH',context.row.actual_birth],
    ['R858',replay858ForContext(context)],
    ['R860',replay860ForContext(context)],
    ['R862',replay862ForContext(context)],
    ['R864',replay864ForContext(context)],
  ]));
}

function cKey(context) {
  return canonical(freeze([
    context.row.schedule_id,
    [3,2,1,0].map(stage=>context.profiles[stage].maximum),
  ]));
}

function dKey(context) {
  return canonical(freeze([
    context.row.schedule_id,
    [3,2,1,0].map(stage=>freeze([stage,context.profiles[stage].support_rows])),
  ]));
}

function kappaValue(context) {
  const birth=context.row.actual_birth;
  const p=context.profiles;
  if(birth==='INF') return freeze(['INF']);
  if(birth===1) return freeze([1,p[0].maximum]);
  if(birth===2) return freeze([2,p[1].maximum,p[0].maximum]);
  if(birth===3) return freeze([3,p[2].occupied_fibres,p[1].maximum,p[0].maximum]);
  throw new Error(`unexpected birth ${birth}`);
}
const kappaKey=context=>canonical(kappaValue(context));

function groupBy(contexts,keyFn) {
  const map=new Map();
  for(const context of contexts) {
    const key=keyFn(context);
    if(!map.has(key)) map.set(key,[]);
    map.get(key).push(context);
  }
  return map;
}

function classCountByBirth(contexts,keyFn) {
  const out={};
  for(const birth of [1,2,3,'INF']) {
    const subset=contexts.filter(context=>context.row.actual_birth===birth);
    out[String(birth)]=new Set(subset.map(keyFn)).size;
  }
  return freeze(out);
}

function contextCountByBirth(contexts) {
  const map=new Map();
  for(const context of contexts) inc(map,context.row.actual_birth);
  return recordFromMap(map);
}

function mergeSpectrum(phiGroups) {
  const spectrum=new Map();
  for(const group of phiGroups.values()) {
    const cCount=new Set(group.map(cKey)).size;
    inc(spectrum,cCount);
  }
  return recordFromMap(spectrum,true);
}

function partitionAmbiguity(leftGroups,rightKey) {
  let ambiguous=0;
  for(const group of leftGroups.values()) if(new Set(group.map(rightKey)).size>1) ambiguous+=1;
  return ambiguous;
}

function ablationKey(name,context) {
  const p=context.profiles;
  if(name==='q1_drop_m0') return canonical([1]);
  if(name==='q2_drop_m1') return canonical([2,p[0].maximum]);
  if(name==='q2_drop_m0') return canonical([2,p[1].maximum]);
  if(name==='q3_drop_n2') return canonical([3,p[1].maximum,p[0].maximum]);
  if(name==='q3_drop_m1') return canonical([3,p[2].occupied_fibres,p[0].maximum]);
  if(name==='q3_drop_m0') return canonical([3,p[2].occupied_fibres,p[1].maximum]);
  throw new Error(`unknown ablation ${name}`);
}

function ablationBirth(name) {
  if(name.startsWith('q1_')) return 1;
  if(name.startsWith('q2_')) return 2;
  if(name.startsWith('q3_')) return 3;
  throw new Error(`unknown ablation birth ${name}`);
}

function ablationCensus(contexts,name) {
  const birth=ablationBirth(name);
  const subset=contexts.filter(context=>context.row.actual_birth===birth);
  const groups=groupBy(subset,context=>ablationKey(name,context));
  const ambiguous=[];
  for(const [key,group] of groups.entries()) {
    const byPhi=new Map();
    for(const context of group) {
      const phi=phiKey(context);
      if(!byPhi.has(phi)) byPhi.set(phi,[]);
      byPhi.get(phi).push(context);
    }
    if(byPhi.size>1) ambiguous.push({key,group,byPhi});
  }
  const contextsInAmbiguous=ambiguous.reduce((sum,row)=>sum+row.group.length,0);
  const phiClasses=ambiguous.reduce((sum,row)=>sum+row.byPhi.size,0);
  const maximumMultiplicity=Math.max(...ambiguous.map(row=>row.byPhi.size));
  const first=ambiguous[0];
  const phiEntries=[...first.byPhi.entries()];
  const left=phiEntries[0][1][0],right=phiEntries[1][1][0];
  const witness=freeze({
    ablated_key:first.key,
    left:freeze({schedule_id:left.row.schedule_id,bundle_id:left.row.bundle_id,kappa:kappaValue(left),phi:phiKey(left)}),
    right:freeze({schedule_id:right.row.schedule_id,bundle_id:right.row.bundle_id,kappa:kappaValue(right),phi:phiKey(right)}),
  });
  return freeze({
    ambiguous_keys:ambiguous.length,
    contexts:contextsInAmbiguous,
    Phi_classes:phiClasses,
    maximum_Phi_multiplicity:maximumMultiplicity,
    witness,
  });
}

function exactAblations(contexts) {
  const out={};
  for(const name of Object.keys(EXPECTED.ablations)) out[name]=ablationCensus(contexts,name);
  return freeze(out);
}

function predecessorReplayCount(contexts) {
  let r858=0,r860=0,r862=0,r864=0;
  for(const context of contexts) {
    r858+=replay858ForContext(context).length;
    r860+=replay860ForContext(context).length;
    if(replay862ForContext(context)) r862+=1;
    if(replay864ForContext(context)) r864+=1;
  }
  return freeze({r858,r860,r862,r864,total:r858+r860+r862+r864});
}

export function finiteCustodyBehavioralQuotientTaskClosureCertificate() {
  if(cachedCertificate) return cachedCertificate;
  const closureParent=trajectoryCustodyFunctionalClosureCertificate();
  const bundleParent=claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const antecedents=buildAntecedents(policy);
  const atlas=globalFibreAtlas(antecedents);
  const built=buildContexts(bundleParent,antecedents,atlas);
  const contexts=built.contexts;

  const DGroups=groupBy(contexts,dKey);
  const CGroups=groupBy(contexts,cKey);
  const PhiGroups=groupBy(contexts,phiKey);
  const birthGroups=groupBy(contexts,context=>String(context.row.actual_birth));
  const kappaGroups=groupBy(contexts,kappaKey);

  let birthMatches=0,birthMismatches=0;
  const recoveredBirths=new Map();
  for(const context of contexts) {
    const recovered=derivedBirth(context);
    inc(recoveredBirths,recovered);
    if(recovered===context.row.actual_birth) birthMatches+=1; else birthMismatches+=1;
  }

  const kappaToPhi=partitionAmbiguity(kappaGroups,phiKey);
  const phiToKappa=partitionAmbiguity(PhiGroups,kappaKey);
  const CToPhi=partitionAmbiguity(CGroups,phiKey);
  let singletonPhiUnderD=0;
  let minimumDistinctD=Infinity;
  let maximumDistinctD=0;
  let namedSemanticCollision=null;
  for(const group of PhiGroups.values()) {
    const byD=new Map();
    for(const context of group) {
      const key=dKey(context);
      if(!byD.has(key)) byD.set(key,context);
    }
    minimumDistinctD=Math.min(minimumDistinctD,byD.size);
    maximumDistinctD=Math.max(maximumDistinctD,byD.size);
    if(byD.size===1) singletonPhiUnderD+=1;
    if(!namedSemanticCollision&&byD.size>1) {
      const values=[...byD.values()];
      namedSemanticCollision=freeze({
        left:freeze({schedule_id:values[0].row.schedule_id,bundle_id:values[0].row.bundle_id,kappa:kappaValue(values[0])}),
        right:freeze({schedule_id:values[1].row.schedule_id,bundle_id:values[1].row.bundle_id,kappa:kappaValue(values[1])}),
        same_Phi:phiKey(values[0])===phiKey(values[1]),
        same_D:dKey(values[0])===dKey(values[1]),
      });
    }
  }

  const ablations=exactAblations(contexts);
  const predecessorRows=predecessorReplayCount(contexts);
  const birthContexts=contextCountByBirth(contexts);
  const CByBirth=classCountByBirth(contexts,cKey);
  const PhiByBirth=classCountByBirth(contexts,phiKey);
  const DByBirth=classCountByBirth(contexts,dKey);
  const merge=mergeSpectrum(PhiGroups);

  const ablationsExact=Object.entries(EXPECTED.ablations).every(([name,expected])=>{
    const actual=ablations[name];
    return actual.ambiguous_keys===expected.ambiguous_keys
      && actual.contexts===expected.contexts
      && actual.Phi_classes===expected.Phi_classes
      && actual.maximum_Phi_multiplicity===expected.maximum_Phi_multiplicity
      && actual.witness.left.phi!==actual.witness.right.phi;
  });

  const exact=antecedents.length===750
    && contexts.length===EXPECTED.contexts
    && built.stage_profile_reconstructions===3048
    && DGroups.size===EXPECTED.D&&CGroups.size===EXPECTED.C&&PhiGroups.size===EXPECTED.Phi&&birthGroups.size===EXPECTED.birth
    && sameRecord(birthContexts,EXPECTED.birth_contexts)
    && sameRecord(CByBirth,EXPECTED.C_by_birth)
    && sameRecord(PhiByBirth,EXPECTED.Phi_by_birth)
    && sameRecord(DByBirth,EXPECTED.birth_contexts)
    && sameRecord(merge,EXPECTED.C_to_Phi_merge_spectrum)
    && birthMatches===762&&birthMismatches===0&&sameRecord(recordFromMap(recoveredBirths),EXPECTED.birth_contexts)
    && kappaGroups.size===36&&kappaToPhi===0&&phiToKappa===0
    && CToPhi===0
    && singletonPhiUnderD===0&&minimumDistinctD>=2&&namedSemanticCollision?.same_Phi===true&&namedSemanticCollision?.same_D===false
    && predecessorRows.r858===1180&&predecessorRows.r860===784&&predecessorRows.r862===208&&predecessorRows.r864===208&&predecessorRows.total===2380
    && ablationsExact;

  const passed=closureParent.passed&&bundleParent.passed&&policy.passed&&exact;

  cachedCertificate=freeze({
    schema:FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_SCHEMA,
    parent_receipt:FINITE_CUSTODY_BEHAVIORAL_QUOTIENT_TASK_CLOSURE_PARENT_RECEIPT,
    domain:freeze({states:125,schedules:6,antecedents:antecedents.length,bundles_per_schedule:127,contexts:contexts.length,registered_stages:4}),
    partitions:freeze({
      D_support_labelled_trajectory_classes:DGroups.size,
      C_schedule_conditioned_cardinality_classes:CGroups.size,
      Phi_declared_task_behavior_classes:PhiGroups.size,
      birth_classes:birthGroups.size,
      D_by_birth:DByBirth,
      C_by_birth:CByBirth,
      Phi_by_birth:PhiByBirth,
      C_to_Phi_merge_spectrum:merge,
    }),
    compact_quotient:freeze({
      kappa_classes:kappaGroups.size,
      kappa_to_Phi_ambiguity_classes:kappaToPhi,
      Phi_to_kappa_ambiguity_classes:phiToKappa,
      partition_equivalent:kappaGroups.size===PhiGroups.size&&kappaToPhi===0&&phiToKappa===0,
      definition:freeze({INF:['INF'],q1:[1,'m0'],q2:[2,'m1','m0'],q3:[3,'n2','m1','m0']}),
    }),
    birth_recovery:freeze({
      rule:'FIRST_REGISTERED_STAGE_WITH_M_T_EQUAL_1_ELSE_INF',
      matches:birthMatches,mismatches:birthMismatches,distribution:recordFromMap(recoveredBirths),
    }),
    declared_task_replay:predecessorRows,
    semantic_noncollapse:freeze({
      singleton_Phi_classes_under_D_identity:singletonPhiUnderD,
      minimum_distinct_D_per_Phi:minimumDistinctD,
      maximum_distinct_D_per_Phi:maximumDistinctD,
      all_Phi_classes_merge_multiple_D:singletonPhiUnderD===0,
      named_collision:namedSemanticCollision,
    }),
    coordinate_ablations:ablations,
    execution_ledger:freeze({
      stage_support_profile_reconstructions:built.stage_profile_reconstructions,
      predecessor_task_replay_rows:predecessorRows.total,
      birth_recovery_checks:contexts.length,
      kappa_signature_constructions:contexts.length,
      Phi_signature_constructions:contexts.length,
      D_fingerprint_constructions:contexts.length,
      C_class_to_Phi_mapping_checks:CGroups.size,
      Phi_semantic_noncollapse_class_checks:PhiGroups.size,
      coordinate_ablation_context_checks:26+160+624,
      synthetic_information_quantity_claimed:false,
    }),
    exact,passed,
    classifications:freeze(passed?[
      'IN_THE_FIXED_S3_AIA_FIXTURE_THE_COMPLETE_ALREADY_EARNED_CUSTODY_TASK_FAMILY_INDUCES_EXACTLY_THIRTY_SIX_BEHAVIORAL_EQUIVALENCE_CLASSES_OVER_THE_SEVEN_HUNDRED_SIXTY_TWO_SCHEDULE_BUNDLE_CONTEXTS',
      'THE_PIECEWISE_COMPACT_SIGNATURE_KAPPA_INF_OR_1_M0_OR_2_M1_M0_OR_3_N2_M1_M0_REALIZES_EXACTLY_THE_SAME_FINITE_PARTITION_AS_THE_INDEPENDENTLY_RECONSTRUCTED_DECLARED_TASK_BEHAVIOR_SIGNATURE',
      'THE_INHERITED_AUTHORITY_BIRTH_INDEX_IS_FUNCTIONALLY_RECOVERABLE_ON_ALL_SEVEN_HUNDRED_SIXTY_TWO_CONTEXTS_AS_THE_FIRST_REGISTERED_STAGE_WHOSE_TARGET_OCCUPIED_SUPPORT_MAXIMUM_IS_ONE_ELSE_INF',
      'EVERY_DECLARED_TASK_BEHAVIOR_CLASS_CONTAINS_MULTIPLE_DISTINCT_SUPPORT_LABELLED_AMBIENT_TRAJECTORIES_SO_EXACT_DECLARED_TASK_CLOSURE_DOES_NOT_IMPLY_SUPPORT_SEMANTIC_IDENTITY',
      'WITHIN_THE_DECLARED_KAPPA_FEATURE_FAMILY_EVERY_RETAINED_FINITE_BIRTH_COORDINATE_HAS_AN_EXPLICIT_DROP_COLLISION_BETWEEN_DISTINCT_DECLARED_TASK_BEHAVIORS',
    ]:[]),
    scars:freeze([
      'COARSEST_DECLARED_TASK_QUOTIENT != UNIVERSAL_SUFFICIENT_STATISTIC',
      'EXACT_DECLARED_TASK_CLOSURE != SEMANTIC_CLOSURE',
      'BEHAVIORAL_EQUIVALENCE != SUPPORT_SEMANTIC_EQUIVALENCE',
      'TASK_FAMILY_CLOSURE != FUTURE_TASK_CLOSURE',
      'FINITE_QUOTIENT_MINIMALITY != MINIMUM_BIT_LENGTH',
      'FINITE_QUOTIENT_MINIMALITY != UNIQUE_ENCODING',
      'FINITE_QUOTIENT_MINIMALITY != SHANNON_CAPACITY',
      'BIRTH_FUNCTIONAL_RECOVERABILITY != SEMANTIC_IDENTITY_WITH_BIRTH_LEDGER',
      'COORDINATE_IRREDUCIBILITY != UNIVERSAL_FEATURE_MINIMALITY',
      'SUPPORT_LABELLED_TRAJECTORY != NATURAL_LANGUAGE_SEMANTIC_COMPLETENESS',
      'DECLARED_TASK_BEHAVIOR != SOURCE_TRUTH',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,
    authority:zeroAuthority(),
    research_only:true,
    runtime_binding:false,
  });
  return cachedCertificate;
}
