import { GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_CERTIFICATE as P, GOLDEN_EGG_THRESHOLDS, goldenEggRepositoryCandidateInventory } from './golden-egg-coobservation-admissibility.js';

export const GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_SCHEMA='td613.dome-world.golden-egg-evidence-closure-nogo/v0.1';
export const GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_PARENT='4474b65c5ecd6dfc8c19cbaf0146bfdeea078a4d';
export const GOLDEN_EGG_CORE_SURFACES=Object.freeze(['observer','reconstruction','joining']);
export const GOLDEN_EGG_GEOMETRIC_SURFACES=Object.freeze([...GOLDEN_EGG_CORE_SURFACES,'geometry']);
export const GOLDEN_EGG_OPERATIONAL_SURFACES=Object.freeze([...GOLDEN_EGG_GEOMETRIC_SURFACES,'matched_return']);
const EMPIRICAL_CLASSES=new Set(['VALIDATION_GATED_DEPLOYED_BOUNDARY_OBSERVED','PUBLIC_EMPIRICAL_CASE']);
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const finite=v=>Number.isFinite(Number(v));
const measured=s=>s&&s.measured===true&&typeof s.name==='string'&&s.name.length>0;
const valueEqual=(a,b)=>Object.is(a,b)||JSON.stringify(a)===JSON.stringify(b);
const covers=(names,required)=>required.every(x=>names.has(x));
const requiredIntersection=(names,required)=>required.filter(x=>names.has(x));

function marginalSupport(packets,{empiricalOnly=false}={}){
  const out=new Set();
  for(const packet of packets||[]){
    if(!packet)continue;
    if(empiricalOnly&&!EMPIRICAL_CLASSES.has(packet.evidence_class))continue;
    for(const s of packet.surfaces||[])if(measured(s)&&GOLDEN_EGG_OPERATIONAL_SURFACES.includes(s.name))out.add(s.name);
  }
  return out;
}

function thresholdPass(surfaceMap){
  const o=surfaceMap.get('observer'),r=surfaceMap.get('reconstruction'),j=surfaceMap.get('joining');
  if(!o||!r||!j||![o.value,r.value,j.value].every(finite))return false;
  return Number(o.value)<=GOLDEN_EGG_THRESHOLDS.observer_leakage_bits&&Number(r.value)<=GOLDEN_EGG_THRESHOLDS.reconstruction_distance&&Number(j.value)<=GOLDEN_EGG_THRESHOLDS.joining_synergy_bits;
}

export function evaluateGoldenEggEvidenceClosure(packets){
  if(!Array.isArray(packets))throw new TypeError('Golden Egg evidence closure requires packet array');
  const groups=new Map();
  for(const packet of packets){
    if(!packet||!EMPIRICAL_CLASSES.has(packet.evidence_class))continue;
    if(typeof packet.episode_id!=='string'||packet.episode_id.length===0)continue;
    if(!groups.has(packet.episode_id))groups.set(packet.episode_id,[]);
    groups.get(packet.episode_id).push(packet);
  }
  const episodes=[];
  for(const [episode_id,episodePackets] of groups){
    const surfaceMap=new Map();
    const conflicts=new Set();
    for(const packet of episodePackets){
      for(const s of packet.surfaces||[]){
        if(!measured(s)||s.episode_id!==episode_id)continue;
        if(surfaceMap.has(s.name)&&!valueEqual(surfaceMap.get(s.name).value,s.value))conflicts.add(s.name);
        else if(!surfaceMap.has(s.name))surfaceMap.set(s.name,s);
      }
    }
    const names=new Set(surfaceMap.keys());
    const requiredConflicts=[...conflicts].filter(x=>GOLDEN_EGG_OPERATIONAL_SURFACES.includes(x));
    const coreCovered=covers(names,GOLDEN_EGG_CORE_SURFACES);
    const geometricCovered=covers(names,GOLDEN_EGG_GEOMETRIC_SURFACES);
    const operationalCovered=covers(names,GOLDEN_EGG_OPERATIONAL_SURFACES);
    const thresholds=requiredConflicts.length===0&&coreCovered&&thresholdPass(surfaceMap);
    const coreJoint=requiredConflicts.length===0&&coreCovered&&thresholds;
    const geometricJoint=coreJoint&&geometricCovered;
    const operationalJoint=geometricJoint&&operationalCovered;
    episodes.push(freeze({
      episode_id,
      source_ids:episodePackets.map(x=>x.source_id),
      exact_required_surfaces:requiredIntersection(names,GOLDEN_EGG_OPERATIONAL_SURFACES),
      required_conflicts:requiredConflicts,
      core_missing:GOLDEN_EGG_CORE_SURFACES.filter(x=>!names.has(x)),
      geometric_missing:GOLDEN_EGG_GEOMETRIC_SURFACES.filter(x=>!names.has(x)),
      operational_missing:GOLDEN_EGG_OPERATIONAL_SURFACES.filter(x=>!names.has(x)),
      thresholds_pass:thresholds,
      core_joint_realized:coreJoint,
      geometric_joint_realized:geometricJoint,
      operational_return_eligible:operationalJoint
    }));
  }
  const allMarginal=marginalSupport(packets);
  const empiricalMarginal=marginalSupport(packets,{empiricalOnly:true});
  return freeze({
    packet_count:packets.length,
    empirical_episode_count:episodes.length,
    all_class_operational_marginal_support:GOLDEN_EGG_OPERATIONAL_SURFACES.filter(x=>allMarginal.has(x)),
    all_class_operational_marginal_missing:GOLDEN_EGG_OPERATIONAL_SURFACES.filter(x=>!allMarginal.has(x)),
    empirical_operational_marginal_support:GOLDEN_EGG_OPERATIONAL_SURFACES.filter(x=>empiricalMarginal.has(x)),
    empirical_operational_marginal_missing:GOLDEN_EGG_OPERATIONAL_SURFACES.filter(x=>!empiricalMarginal.has(x)),
    episodes,
    counts:{
      core_joint_realized_episodes:episodes.filter(x=>x.core_joint_realized).length,
      geometric_joint_realized_episodes:episodes.filter(x=>x.geometric_joint_realized).length,
      operational_return_eligible_episodes:episodes.filter(x=>x.operational_return_eligible).length
    }
  });
}

function enumerateSubsets(items){
  const out=[];
  for(let mask=0;mask<(1<<items.length);mask++)out.push(items.filter((_,i)=>(mask&(1<<i))!==0));
  return out;
}

export function exhaustFrozenGoldenEggEvidenceSubsets(){
  const inventory=goldenEggRepositoryCandidateInventory();
  const subsets=enumerateSubsets(inventory);
  let core=0,geometric=0,operational=0;
  for(const subset of subsets){
    const c=evaluateGoldenEggEvidenceClosure(subset);
    if(c.counts.core_joint_realized_episodes>0)core++;
    if(c.counts.geometric_joint_realized_episodes>0)geometric++;
    if(c.counts.operational_return_eligible_episodes>0)operational++;
  }
  return freeze({subset_count:subsets.length,core_realizable_subset_count:core,geometric_realizable_subset_count:geometric,operational_realizable_subset_count:operational});
}

function minimumExistingEpisodeAugmentation(closure){
  const target=n=>{
    if(closure.episodes.length===0)return n.length;
    return Math.min(...closure.episodes.map(e=>n.length-e.exact_required_surfaces.filter(x=>n.includes(x)).length));
  };
  return freeze({core:target(GOLDEN_EGG_CORE_SURFACES),geometric:target(GOLDEN_EGG_GEOMETRIC_SURFACES),operational:target(GOLDEN_EGG_OPERATIONAL_SURFACES)});
}

const surface=(name,episode_id,value)=>({name,episode_id,value,measured:true});
const empirical=(source_id,episode_id,surfaces)=>({source_id,episode_id,evidence_class:'PUBLIC_EMPIRICAL_CASE',surfaces});
function hostileSameEpisodePositive(){const e='hostile-positive-e1';return [empirical('POS_A',e,[surface('observer',e,0.1),surface('reconstruction',e,0.1)]),empirical('POS_B',e,[surface('joining',e,0.05),surface('geometry',e,1),surface('matched_return',e,1)])];}
function hostileCrossEpisodeSplit(){const values={observer:0.1,reconstruction:0.1,joining:0.05,geometry:1,matched_return:1};return GOLDEN_EGG_OPERATIONAL_SURFACES.map((name,i)=>empirical(`SPLIT_${name}`,`split-e${i+1}`,[surface(name,`split-e${i+1}`,values[name])]));}
function hostileMixedClass(){const e='mixed-e1';return [{source_id:'MIXED_SYNTH',episode_id:e,evidence_class:'SIMULATED_FACTORIZED_PRODUCT_SPACE',surfaces:[surface('observer',e,0.1),surface('reconstruction',e,0.1),surface('joining',e,0.05)]},empirical('MIXED_EMP',e,[surface('geometry',e,1),surface('matched_return',e,1)])];}
function hostileProxy(){const e='proxy-e1';return [empirical('PROXY',e,[surface('observer',e,0.1),surface('reconstruction',e,0.1),surface('joining',e,0.05),surface('geometry',e,1),surface('matched_reader_validation',e,1)])];}
function hostileThreshold(){const e='threshold-e1';return [empirical('THRESHOLD',e,[surface('observer',e,0.9),surface('reconstruction',e,0.1),surface('joining',e,0.05),surface('geometry',e,1),surface('matched_return',e,1)])];}
function hostileConflict(){const e='conflict-e1';return [empirical('CONFLICT_A',e,[surface('observer',e,0.1),surface('reconstruction',e,0.1),surface('joining',e,0.05)]),empirical('CONFLICT_B',e,[surface('observer',e,0.2),surface('geometry',e,1),surface('matched_return',e,1)])];}

export function runGoldenEggEvidenceClosureNoGo(){
  const inventory=goldenEggRepositoryCandidateInventory();
  const closure=evaluateGoldenEggEvidenceClosure(inventory);
  const exhaustion=exhaustFrozenGoldenEggEvidenceSubsets();
  const lower=minimumExistingEpisodeAugmentation(closure);
  const positive=evaluateGoldenEggEvidenceClosure(hostileSameEpisodePositive());
  const split=evaluateGoldenEggEvidenceClosure(hostileCrossEpisodeSplit());
  const mixed=evaluateGoldenEggEvidenceClosure(hostileMixedClass());
  const proxy=evaluateGoldenEggEvidenceClosure(hostileProxy());
  const threshold=evaluateGoldenEggEvidenceClosure(hostileThreshold());
  const conflict=evaluateGoldenEggEvidenceClosure(hostileConflict());
  const hostiles=freeze({
    same_episode_split_positive_control:positive.counts.operational_return_eligible_episodes===1,
    cross_episode_frankenstein_rejected:split.all_class_operational_marginal_support.length===5&&split.counts.operational_return_eligible_episodes===0,
    mixed_synthetic_empirical_laundering_rejected:mixed.all_class_operational_marginal_support.length===5&&mixed.empirical_operational_marginal_support.length===2&&mixed.counts.operational_return_eligible_episodes===0,
    proxy_return_label_rejected:proxy.counts.operational_return_eligible_episodes===0&&proxy.episodes[0]?.operational_missing.includes('matched_return')===true,
    threshold_laundering_rejected:threshold.episodes[0]?.thresholds_pass===false&&threshold.counts.operational_return_eligible_episodes===0,
    contradictory_duplicate_required_surface_rejected:conflict.episodes[0]?.required_conflicts.includes('observer')===true&&conflict.counts.operational_return_eligible_episodes===0
  });
  const parentPass=P.passed===true&&P.golden_egg_earned===false&&P.counts.operational_return_eligible_episodes===0;
  const frozenCounts=inventory.length===4&&closure.empirical_episode_count===2&&closure.all_class_operational_marginal_support.length===4&&JSON.stringify(closure.all_class_operational_marginal_missing)===JSON.stringify(['matched_return'])&&closure.empirical_operational_marginal_support.length===0&&closure.empirical_operational_marginal_missing.length===5;
  const exhaustionPass=exhaustion.subset_count===16&&exhaustion.core_realizable_subset_count===0&&exhaustion.geometric_realizable_subset_count===0&&exhaustion.operational_realizable_subset_count===0;
  const lowerPass=lower.core===3&&lower.geometric===4&&lower.operational===5;
  const hostilePass=Object.values(hostiles).every(Boolean);
  const passed=parentPass&&frozenCounts&&exhaustionPass&&lowerPass&&hostilePass;
  return freeze({schema:GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_SCHEMA,exact_earned_parent:GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_PARENT,thresholds:GOLDEN_EGG_THRESHOLDS,closure,exhaustion,minimum_new_required_measurements_on_existing_empirical_episode:lower,hostiles,laws:{evidence_closure_nogo_not_universal_impossibility:true,cross_episode_union_not_admissible_composition:true,synthetic_surface_support_not_empirical_acquisition_credit:true,measurement_lower_bound_not_threshold_success:true,new_same_episode_acquisition_required_not_golden_egg_earned:true},candidate_theorem:passed?'THE_FROZEN_GOLDEN_EGG_EVIDENCE_REGISTRY_HAS_NO_ADMISSIBLE_EMPIRICAL_CLOSURE_ROUTE_TO_CORE_GEOMETRIC_OR_OPERATIONAL_JOINT_REALIZATION_ACROSS_ALL_16_SOURCE_SUBSETS_AND_EACH_EXISTING_EMPIRICAL_EPISODE_CARRIES_ZERO_OF_THE_FIVE_EXACT_OPERATIONAL_SURFACES_SO_AT_LEAST_FIVE_NEW_REQUIRED_MEASUREMENTS_MUST_BE_COOBSERVED_ON_ONE_EMPIRICAL_EPISODE_BEFORE_OPERATIONAL_THRESHOLD_ELIGIBILITY_CAN_EVEN_BE_TESTED':'NOT_EARNED',golden_egg_earned:false,merge_authority:false,production_authority:false,passed});
}

export const GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_CERTIFICATE=runGoldenEggEvidenceClosureNoGo();
