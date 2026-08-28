import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';
import { twoSurfaceHorizonAliasingCertificate } from './two-surface-horizon-aliasing.js';

export const FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_SCHEMA =
  'td613.dome-world.finite-distinguishability-trajectory-calculus/v0.1';
export const FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_PARENT_RECEIPT =
  'b3902a14312d06eb91762ac0369fdb1daf5ff543';

const STAGES = Object.freeze([0,1,2,3]);
const PAIRS = Object.freeze([[1,0],[2,0],[2,1],[3,0],[3,1],[3,2]]);
const TRIPLES = Object.freeze([[2,1,0],[3,2,1],[3,2,0],[3,1,0]]);
const CLAIMS = Object.freeze([
  'FIRST_STRATUM','SCHEDULE','X1','X2','X3','FULL_STATE','REPLAY_REQUIRED_FOR_EXACT_STATE',
]);
const EXPECTED_GLOBAL_FIBRES = Object.freeze({0:1,1:23,2:158,3:430});
const EXPECTED_UNION_COUNTS = Object.freeze({
  '1->0':762,'2->0':762,'2->1':5842,'3->0':762,'3->1':5842,'3->2':20066,
});
const EXPECTED_MONOTONICITY = Object.freeze({
  '3->2':Object.freeze({strict:384,plateau:378}),
  '2->1':Object.freeze({strict:576,plateau:186}),
  '1->0':Object.freeze({strict:736,plateau:26}),
  '3->1':Object.freeze({strict:688,plateau:74}),
  '2->0':Object.freeze({strict:746,plateau:16}),
  '3->0':Object.freeze({strict:754,plateau:8}),
});
const EXPECTED_ASSOCIATIVITY = Object.freeze({
  '2->1->0':762,'3->2->1':5842,'3->2->0':762,'3->1->0':762,
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
const setEqual = (left,right) => left.size === right.size && [...left].every(value => right.has(value));

function scheduleId(schedule) {
  const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
  return schedule.map(stratum=>letters[stratum]).join('-');
}
function stateCube() {
  const out=[];
  for(let x1=-2;x1<=2;x1+=1) for(let x2=-2;x2<=2;x2+=1) for(let x3=-2;x3<=2;x3+=1) out.push(freeze([x1,x2,x3]));
  return freeze(out);
}
function recursiveBundles(values,index=0,current=[],out=[]) {
  if(index===values.length){
    if(current.length) out.push(freeze({id:current.join('+'),claims:freeze([...current]),size:current.length}));
    return out;
  }
  recursiveBundles(values,index+1,current,out);
  current.push(values[index]);
  recursiveBundles(values,index+1,current,out);
  current.pop();
  return out;
}
function buildAntecedents(policy) {
  const policyBySchedule=new Map(policy.policy_geometry.map(row=>[row.schedule_id,row]));
  const antecedents=[];
  for(const schedule of DROMOLOGICAL_S3_SCHEDULES){
    const id=scheduleId(schedule);
    const matrix=phasonicObservationMatrix(schedule);
    const policyRow=policyBySchedule.get(id);
    if(!policyRow) throw new Error(`missing policy row ${id}`);
    for(const state of stateCube()) antecedents.push(freeze({
      id:`${id}:${state.join(',')}`,schedule:freeze([...schedule]),schedule_id:id,
      first_stratum:schedule[0],state,observation_matrix:matrix,
      observation:observePhasonicState(state,schedule),replay_required:policyRow.replay_required,
    }));
  }
  return freeze(antecedents);
}
function quotientValue(stage,a){
  if(stage===0) return freeze(['NULL_REGISTERED_TRACE']);
  return freeze([
    freeze(a.observation_matrix.slice(0,stage).map(row=>freeze([...row]))),
    freeze(a.observation.slice(0,stage)),
  ]);
}
function claimValue(claim,a){
  if(claim==='FIRST_STRATUM') return a.first_stratum;
  if(claim==='SCHEDULE') return a.schedule_id;
  if(claim==='X1') return a.state[0];
  if(claim==='X2') return a.state[1];
  if(claim==='X3') return a.state[2];
  if(claim==='FULL_STATE') return a.state;
  if(claim==='REPLAY_REQUIRED_FOR_EXACT_STATE') return a.replay_required;
  throw new Error(`unknown trajectory claim ${claim}`);
}
function bundleValue(bundle,a){ return bundle.claims.map(claim=>[claim,claimValue(claim,a)]); }

function globalFibreAtlas(antecedents){
  const atlas=new Map();
  for(const stage of STAGES){
    const fibres=new Map();
    for(const a of antecedents){
      const key=canonical(quotientValue(stage,a));
      if(!fibres.has(key)) fibres.set(key,{key,antecedents:[]});
      fibres.get(key).antecedents.push(a);
    }
    atlas.set(stage,fibres);
  }
  return atlas;
}
function mergeMaps(atlas){
  const maps=new Map();
  for(const [fine,coarse] of PAIRS){
    const map=new Map();
    for(const [fineKey,fibre] of atlas.get(fine).entries()){
      const coarseKeys=new Set(fibre.antecedents.map(a=>canonical(quotientValue(coarse,a))));
      if(coarseKeys.size!==1) throw new Error(`fine fibre ${fineKey} is not nested in q${coarse}`);
      map.set(fineKey,[...coarseKeys][0]);
    }
    maps.set(`${fine}->${coarse}`,map);
  }
  return maps;
}
function targetsBySchedule(antecedents){
  return new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
    const id=scheduleId(schedule);
    return [id,antecedents.filter(a=>a.schedule_id===id)];
  }));
}
function occupiedTargetKeys(targets,stage){
  return [...new Set(targets.map(a=>canonical(quotientValue(stage,a))))];
}
function supportForFibre(fibre,bundle){
  return new Set(fibre.antecedents.map(a=>canonical(bundleValue(bundle,a))));
}
function unionChildSupport(atlas,maps,fine,coarse,coarseKey,bundle){
  const map=maps.get(`${fine}->${coarse}`);
  const union=new Set();
  for(const [fineKey,parentKey] of map.entries()){
    if(parentKey!==coarseKey) continue;
    for(const value of supportForFibre(atlas.get(fine).get(fineKey),bundle)) union.add(value);
  }
  return union;
}
function supportMaximum(atlas,targets,stage,bundle){
  let maximum=0;
  for(const key of occupiedTargetKeys(targets,stage)) maximum=Math.max(maximum,supportForFibre(atlas.get(stage).get(key),bundle).size);
  return maximum;
}

function compileCensus(antecedents,atlas,maps,bundles){
  const targetMap=targetsBySchedule(antecedents);
  const unionCounts=Object.fromEntries(PAIRS.map(([f,c])=>[`${f}->${c}`,0]));
  const unionFailures=[];
  const assocCounts=Object.fromEntries(TRIPLES.map(([f,d,c])=>[`${f}->${d}->${c}`,0]));
  const assocFailures=[];
  const monotonicity=Object.fromEntries(PAIRS.map(([f,c])=>[`${f}->${c}`,{strict:0,plateau:0,decrease:0}]));
  let contextCount=0;

  for(const [schedule,targets] of targetMap.entries()){
    for(const bundle of bundles){
      contextCount+=1;
      const maxima=new Map(STAGES.map(stage=>[stage,supportMaximum(atlas,targets,stage,bundle)]));
      for(const [fine,coarse] of PAIRS){
        const key=`${fine}->${coarse}`;
        for(const coarseKey of occupiedTargetKeys(targets,coarse)){
          const actual=supportForFibre(atlas.get(coarse).get(coarseKey),bundle);
          const propagated=unionChildSupport(atlas,maps,fine,coarse,coarseKey,bundle);
          unionCounts[key]+=1;
          if(!setEqual(actual,propagated) && unionFailures.length<8) unionFailures.push(freeze({schedule,bundle:bundle.id,key,coarseKey}));
        }
        if(maxima.get(coarse)>maxima.get(fine)) monotonicity[key].strict+=1;
        else if(maxima.get(coarse)===maxima.get(fine)) monotonicity[key].plateau+=1;
        else monotonicity[key].decrease+=1;
      }
      for(const [fine,middle,coarse] of TRIPLES){
        const tripleKey=`${fine}->${middle}->${coarse}`;
        for(const coarseKey of occupiedTargetKeys(targets,coarse)){
          const direct=unionChildSupport(atlas,maps,fine,coarse,coarseKey,bundle);
          const staged=new Set();
          const middleMap=maps.get(`${middle}->${coarse}`);
          for(const [middleKey,parentKey] of middleMap.entries()){
            if(parentKey!==coarseKey) continue;
            const fineIntoMiddle=unionChildSupport(atlas,maps,fine,middle,middleKey,bundle);
            for(const value of fineIntoMiddle) staged.add(value);
          }
          assocCounts[tripleKey]+=1;
          if(!setEqual(direct,staged) && assocFailures.length<8) assocFailures.push(freeze({schedule,bundle:bundle.id,tripleKey,coarseKey}));
        }
      }
    }
  }

  const globalFibres=freeze(Object.fromEntries(STAGES.map(stage=>[stage,atlas.get(stage).size])));
  const unionTotal=Object.values(unionCounts).reduce((sum,value)=>sum+value,0);
  const assocTotal=Object.values(assocCounts).reduce((sum,value)=>sum+value,0);
  const strict=Object.values(monotonicity).reduce((sum,row)=>sum+row.strict,0);
  const plateau=Object.values(monotonicity).reduce((sum,row)=>sum+row.plateau,0);
  const decrease=Object.values(monotonicity).reduce((sum,row)=>sum+row.decrease,0);

  const phiTargets=targetMap.get('P-H-I');
  const phiTargetQ1=occupiedTargetKeys(phiTargets,1).length;
  const ambientQ1IntoQ0=[...maps.get('1->0').values()].filter(parent=>parent===canonical(['NULL_REGISTERED_TRACE'])).length;

  const exact=contextCount===762
    && bundles.length===127
    && antecedents.length===750
    && STAGES.every(stage=>globalFibres[stage]===EXPECTED_GLOBAL_FIBRES[stage])
    && PAIRS.every(([f,c])=>unionCounts[`${f}->${c}`]===EXPECTED_UNION_COUNTS[`${f}->${c}`])
    && unionTotal===34036 && unionFailures.length===0
    && TRIPLES.every(([f,d,c])=>assocCounts[`${f}->${d}->${c}`]===EXPECTED_ASSOCIATIVITY[`${f}->${d}->${c}`])
    && assocTotal===8128 && assocFailures.length===0
    && Object.entries(EXPECTED_MONOTONICITY).every(([key,expected])=>(
      monotonicity[key].strict===expected.strict && monotonicity[key].plateau===expected.plateau && monotonicity[key].decrease===0
    ))
    && strict===3884 && plateau===688 && decrease===0
    && phiTargetQ1===5 && ambientQ1IntoQ0===23;

  return freeze({
    contexts:contextCount,
    bundles:bundles.length,
    ambient_antecedents:antecedents.length,
    global_fibre_counts:globalFibres,
    support_union_identity_counts:freeze(unionCounts),
    support_union_identity_total:unionTotal,
    support_union_failure_count:unionFailures.length,
    associativity_identity_counts:freeze(assocCounts),
    associativity_identity_total:assocTotal,
    associativity_failure_count:assocFailures.length,
    support_maximum_monotonicity:freeze(monotonicity),
    strict_expansions:strict,
    plateaux:plateau,
    strict_decreases:decrease,
    ambient_child_control:freeze({schedule:'P-H-I',target_visible_q1_fibres:phiTargetQ1,ambient_global_q1_fibres_into_q0:ambientQ1IntoQ0,strict_ambient_excess:ambientQ1IntoQ0-phiTargetQ1}),
    full_support_label_tables_exposed:false,
    full_ambient_merge_maps_exposed:false,
    exact,
  });
}

function ablation(parent){
  const left=parent.census.named_alias_B.left;
  const right=parent.census.named_alias_B.right;
  return freeze({
    schedule:'P-H-I',
    bundle_size:2,
    left_bundle:left.bundle_id,
    left_m0:left.m0,
    right_bundle:right.bundle_id,
    right_m0:right.m0,
    ratio:left.m0/right.m0,
    same_unlabelled_schedule_merge_geometry:true,
    support_labels_required:left.m0!==right.m0,
    exact:left.bundle_size===2 && right.bundle_size===2 && left.m0===375 && right.m0===25 && left.m0/right.m0===15,
  });
}

export function finiteDistinguishabilityTrajectoryCalculusCertificate(){
  if(cachedCertificate) return cachedCertificate;
  const parent=twoSurfaceHorizonAliasingCertificate();
  const bundleParent=claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const antecedents=buildAntecedents(policy);
  const atlas=globalFibreAtlas(antecedents);
  const maps=mergeMaps(atlas);
  const bundles=freeze(recursiveBundles(CLAIMS));
  const census=compileCensus(antecedents,atlas,maps,bundles);
  const necessity=ablation(parent);
  const passed=parent.passed && bundleParent.passed && policy.passed && census.exact && necessity.exact;
  cachedCertificate=freeze({
    schema:FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_SCHEMA,
    parent_receipt:FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_PARENT_RECEIPT,
    census,
    necessity_ablation:necessity,
    passed,
    classifications:freeze(passed?[
      'IN_THE_FIXED_FOUR_STAGE_S3_AIA_FIXTURE_EVERY_TARGET_OCCUPIED_COARSE_FIBRE_REQUESTED_BUNDLE_SUPPORT_EQUALS_THE_UNION_OF_SUPPORTS_CARRIED_BY_ALL_AMBIENT_REGISTERED_FINE_FIBRES_THAT_MERGE_INTO_IT',
      'AMBIENT_SUPPORT_UNION_PROPAGATION_IS_ASSOCIATIVE_ACROSS_ALL_PREREGISTERED_THREE_STAGE_CHAINS_WITH_8128_OF_8128_STAGED_AND_DIRECT_ENDPOINT_IDENTITIES',
      'REQUESTED_BUNDLE_SUPPORT_MAXIMUM_IS_MONOTONE_NONDECREASING_UNDER_REGISTERED_COARSENING_WITH_3884_STRICT_EXPANSIONS_688_PLATEAUX_AND_ZERO_STRICT_DECREASES',
      'ENDPOINT_SUPPORT_SEMANTICS_CAN_BE_PATH_STABLE_WHILE_STAGE_LOCAL_MINIMUM_CUSTODY_TRANSPORT_REMAINS_PATH_DEPENDENT',
      'SUPPORT_LABELLED_AMBIENT_MERGE_TRAJECTORY_IS_STRICTLY_RICHER_THAN_EITHER_PER_STAGE_SUPPORT_CARDINALITY_MARGINALS_OR_UNLABELLED_MERGE_INCIDENCE_FOR_THE_DECLARED_CUSTODY_FUNCTIONALS_IN_THIS_FIXED_DOMAIN',
    ]:[]),
    scars:freeze([
      'DISTINGUISHABILITY_TRAJECTORY != SCALAR_COST_TRAJECTORY',
      'DISTINGUISHABILITY_TRAJECTORY != PHYSICAL_TRAJECTORY',
      'AMBIENT_CHILD_FIBRES != TARGET_VISIBLE_CHILD_FIBRES',
      'SUPPORT_UNION_ASSOCIATIVITY != ZERO_CUSTODY_HOLONOMY',
      'ENDPOINT_SUPPORT_PATH_INDEPENDENCE != MINIMUM_CUSTODY_TRANSPORT_PATH_INDEPENDENCE',
      'STAGE_LOCAL_MINIMIZATION != SUPPORT_SEMANTICS',
      'PER_STAGE_SUPPORT_CARDINALITY_MARGINALS != SUPPORT_LABELLED_MERGE_TRAJECTORY',
      'UNLABELLED_MERGE_INCIDENCE != CONTEXT_SPECIFIC_FUTURE_CUSTODY_IDENTITY',
      'FINITE_TRAJECTORY_CALCULUS != UNIVERSAL_SUFFICIENT_STATISTIC',
      'FINITE_TRAJECTORY_CALCULUS != SHANNON_INFORMATION_THEORY',
      'FORMAL_CUSTODY_HOLONOMY != PHYSICAL_BERRY_OR_GAUGE_HOLONOMY',
    ]),
  });
  return cachedCertificate;
}

export function compileFiniteDistinguishabilityTrajectoryProjection(receiver){
  const certificate=finiteDistinguishabilityTrajectoryCalculusCertificate();
  if(!certificate.passed) throw new Error('cannot project uncertified distinguishability trajectory calculus');
  let payload;
  if(receiver===AIA_RECEIVERS.ASH){
    payload=freeze({
      payload_schema:'td613.dome-world.finite-distinguishability-trajectory-child-legible/v0.1',
      truths:freeze([
        'TO_KNOW_WHAT_A_LATER_MERGE_CAN_STILL_TELL_APART_TRACK_WHICH_AMBIENT_BOXES_MERGE_AND_WHICH_REQUESTED_VALUES_EACH_BOX_CAN_STILL_CARRY',
        'MERGING_SUPPORTS_BY_UNION_GIVES_THE_SAME_ENDPOINT_WHETHER_YOU_MERGE_IN_ONE_STEP_OR_SEVERAL',
        'A_SMALLEST_LABEL_SET_CHOSEN_HALFWAY_THROUGH_CAN_STILL_FAIL_LATER_EVEN_WHEN_THE_ENDPOINT_SUPPORT_RULE_ITSELF_IS_PATH_STABLE',
      ]),
      contexts:certificate.census.contexts,
      support_union_checks:certificate.census.support_union_identity_total,
      associativity_checks:certificate.census.associativity_identity_total,
      full_support_label_tables_exposed:false,
      full_ambient_merge_maps_exposed:false,
    });
  } else if(receiver===AIA_RECEIVERS.LOOM){
    payload=freeze({
      payload_schema:'td613.dome-world.finite-distinguishability-trajectory-loom-technical/v0.1',
      contexts:certificate.census.contexts,
      global_fibre_counts:certificate.census.global_fibre_counts,
      support_union_identity_total:certificate.census.support_union_identity_total,
      associativity_identity_total:certificate.census.associativity_identity_total,
      strict_expansions:certificate.census.strict_expansions,
      plateaux:certificate.census.plateaux,
      strict_decreases:certificate.census.strict_decreases,
      full_support_label_tables_exposed:false,
      full_ambient_merge_maps_exposed:false,
    });
  } else throw new Error(`undeclared trajectory receiver ${receiver}`);
  return freeze({schema:FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_SCHEMA,receiver,custody_witness:PHASONIC_CUPOLA_CUSTODY_WITNESS,payload,authority:zeroAuthority(),research_only:true,runtime_binding:false,claim_ceiling:freeze({
    shannon_capacity:false,entropy:false,mutual_information:false,minimum_bit_length:false,
    universal_sufficient_statistic:false,universal_category_functor:false,physical_holonomy:false,
    operational_path_groupoid:false,source_state_mutation:false,retrocausality:false,
    merge:false,deploy:false,publish:false,release:false,vercel:false,
  })});
}

export function rejectFiniteDistinguishabilityTrajectoryOverreach(candidate){
  const forbidden=['shannon_capacity','entropy','mutual_information','minimum_bit_length','universal_sufficient_statistic','universal_category_functor','physical_holonomy','operational_path_groupoid','source_state_mutation','retrocausality'];
  const violation=forbidden.some(key=>candidate?.[key]===true)
    || Object.values(candidate?.authority??{}).some(Boolean)
    || Object.values(candidate?.claim_ceiling??{}).some(Boolean)
    || candidate?.payload?.full_support_label_tables_exposed===true
    || candidate?.payload?.full_ambient_merge_maps_exposed===true;
  return freeze({accepted:!violation,reason:violation?'FINITE_DISTINGUISHABILITY_TRAJECTORY_OVERREACH':'WITHIN_FIXED_TRAJECTORY_CALCULUS_MEMBRANE'});
}
