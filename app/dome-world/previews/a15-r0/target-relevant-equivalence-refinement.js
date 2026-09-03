export const TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_SCHEMA='td613.dome-world.target-relevant-equivalence-refinement/v0.1';
export const TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_PARENT='ae1c795fbbd194b5eaba9ecbb699e9287ca8c706';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const pairCount=n=>n*(n-1)/2;
const stable=v=>JSON.stringify(v);

export const TARGET_REFINEMENT_FIXTURE=freeze({
  target_id:'THETA',
  hypotheses:['THETA_A','THETA_B','THETA_C','THETA_D'],
  frozen_regime:[{
    channel_id:'A_FROZEN',
    likelihoods:{
      THETA_A:[0.5,0.5],
      THETA_B:[0.5,0.5],
      THETA_C:[0.5,0.5],
      THETA_D:[0.9,0.1]
    }
  }],
  candidates:{
    NOVEL_BUT_USELESS:{
      channel_id:'Z_NOVEL_BUT_USELESS',
      new_evidentiary_object:true,
      informationally_reducible_to_frozen_A:false,
      likelihoods:{
        THETA_A:[0.5,0.5],THETA_B:[0.5,0.5],THETA_C:[0.5,0.5],THETA_D:[0.5,0.5]
      }
    },
    ALREADY_SEPARATED_ONLY:{
      channel_id:'Z_ALREADY_SEPARATED_ONLY',
      new_evidentiary_object:true,
      informationally_reducible_to_frozen_A:false,
      likelihoods:{
        THETA_A:[0.6,0.4],THETA_B:[0.6,0.4],THETA_C:[0.6,0.4],THETA_D:[0.01,0.99]
      }
    },
    PARTIAL_SPLITTER:{
      channel_id:'Z_PARTIAL_SPLITTER',
      new_evidentiary_object:true,
      informationally_reducible_to_frozen_A:false,
      likelihoods:{
        THETA_A:[0.8,0.2],THETA_B:[0.3,0.7],THETA_C:[0.3,0.7],THETA_D:[0.5,0.5]
      }
    },
    FULL_SPLITTER:{
      channel_id:'Z_FULL_SPLITTER',
      new_evidentiary_object:true,
      informationally_reducible_to_frozen_A:false,
      likelihoods:{
        THETA_A:[0.9,0.1],THETA_B:[0.7,0.3],THETA_C:[0.3,0.7],THETA_D:[0.1,0.9]
      }
    }
  }
});

function validateDistribution(p){
  return Array.isArray(p)&&p.length>0&&p.every(x=>Number.isFinite(x)&&x>=0)&&Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-12;
}
function validateChannel(channel,hypotheses){
  if(!channel||typeof channel.channel_id!=='string')throw new Error('CHANNEL_ID_REQUIRED');
  for(const h of hypotheses){
    if(!validateDistribution(channel?.likelihoods?.[h]))throw new Error(`VALID_LIKELIHOOD_REQUIRED:${h}`);
  }
}
export function targetPartition(hypotheses,regime){
  for(const c of regime)validateChannel(c,hypotheses);
  const groups=new Map();
  for(const h of hypotheses){
    const signature=regime.map(c=>stable(c.likelihoods[h])).join('||');
    if(!groups.has(signature))groups.set(signature,[]);
    groups.get(signature).push(h);
  }
  return freeze([...groups.values()].map(g=>[...g].sort()).sort((a,b)=>a[0].localeCompare(b[0])));
}
export function unresolvedTargetPairs(partition){
  return partition.reduce((sum,block)=>sum+pairCount(block.length),0);
}
function isRefinement(basePartition,nextPartition){
  const baseIndex=new Map();
  basePartition.forEach((block,i)=>block.forEach(h=>baseIndex.set(h,i)));
  return nextPartition.every(block=>block.every(h=>baseIndex.get(h)===baseIndex.get(block[0])));
}
export function evaluateTargetRelevantAcquisition({
  target_id=TARGET_REFINEMENT_FIXTURE.target_id,
  hypotheses=TARGET_REFINEMENT_FIXTURE.hypotheses,
  frozen_regime=TARGET_REFINEMENT_FIXTURE.frozen_regime,
  candidate
}={}){
  if(typeof target_id!=='string'||target_id.length===0)throw new Error('DECLARED_TARGET_REQUIRED');
  if(!Array.isArray(hypotheses)||hypotheses.length<2||new Set(hypotheses).size!==hypotheses.length)throw new Error('DISTINCT_TARGET_HYPOTHESES_REQUIRED');
  if(!Array.isArray(frozen_regime)||frozen_regime.length<1)throw new Error('FROZEN_EVIDENCE_REGIME_REQUIRED');
  validateChannel(candidate,hypotheses);
  const before=targetPartition(hypotheses,frozen_regime);
  const after=targetPartition(hypotheses,[...frozen_regime,candidate]);
  const beforePairs=unresolvedTargetPairs(before);
  const afterPairs=unresolvedTargetPairs(after);
  const refinement=isRefinement(before,after);
  const strictRefinement=refinement&&afterPairs<beforePairs;
  const completeIdentification=afterPairs===0;
  const partialIdentification=strictRefinement&&!completeIdentification;
  const targetRelevantPairsResolved=beforePairs-afterPairs;
  return freeze({
    schema:TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_SCHEMA,
    exact_parent:TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_PARENT,
    target_id,
    candidate_id:candidate.channel_id,
    status:strictRefinement?'TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_EARNED':'NO_TARGET_REFINEMENT',
    base_partition:before,
    augmented_partition:after,
    base_unresolved_target_pairs:beforePairs,
    augmented_unresolved_target_pairs:afterPairs,
    target_relevant_pairs_resolved:targetRelevantPairsResolved,
    partition_refinement:refinement,
    strict_target_relevant_refinement:strictRefinement,
    partial_identification:partialIdentification,
    complete_identification:completeIdentification,
    new_evidentiary_object:candidate.new_evidentiary_object===true,
    informationally_reducible_to_frozen_A:candidate.informationally_reducible_to_frozen_A===true,
    novelty_alone_has_identifying_credit:false,
    externality_alone_has_identifying_credit:false,
    intervention_status_alone_has_identifying_credit:false,
    target_relative_identifiability:true,
    empirical_exteriority_information_gain_measured:false,
    external_origin_of_artifact_proven:false,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      new_evidence_not_identifying_evidence:true,
      external_evidence_not_identifying_evidence:true,
      interventional_evidence_not_identifying_evidence:true,
      target_relevant_refinement_not_full_identification:true,
      identifying_progress_requires_surviving_ambiguity_reduction:true,
      identifiability_is_target_relative:true,
      evidence_class_boundary_is_target_relative:true,
      global_novelty_not_target_symmetry_breaking:true,
      target_refinement_not_golden_egg_measurement:true
    })
  });
}

export function adjudicateTargetRefinementFixture(fixture=TARGET_REFINEMENT_FIXTURE){
  const results=Object.fromEntries(Object.entries(fixture.candidates).map(([k,c])=>[k,evaluateTargetRelevantAcquisition({target_id:fixture.target_id,hypotheses:fixture.hypotheses,frozen_regime:fixture.frozen_regime,candidate:c})]));
  const passed=results.NOVEL_BUT_USELESS.status==='NO_TARGET_REFINEMENT'&&
    results.ALREADY_SEPARATED_ONLY.status==='NO_TARGET_REFINEMENT'&&
    results.PARTIAL_SPLITTER.status==='TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_EARNED'&&results.PARTIAL_SPLITTER.partial_identification===true&&
    results.FULL_SPLITTER.status==='TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_EARNED'&&results.FULL_SPLITTER.complete_identification===true;
  return freeze({
    schema:TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_SCHEMA,
    exact_parent:TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_PARENT,
    status:passed?'TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_CRITERION_EARNED':'INADMISSIBLE',
    rest_symbol:passed?'𝄐':null,
    results,
    theorem:passed?'AN_ACQUISITION_EARNS_IDENTIFYING_PROGRESS_FOR_DECLARED_TARGET_THETA_ONLY_IF_IT_STRICTLY_REFINES_THE_THETA_EQUIVALENCE_PARTITION_LEFT_BY_THE_FROZEN_EVIDENCE_REGIME; NOVELTY_EXTERNALITY_OR_EXPERIMENTAL_STATUS_ALONE_DO_NOT_CONFER_IDENTIFYING_CREDIT':'NOT_EARNED',
    child_message:passed?'A NEW CLUE COUNTS ONLY IF IT SPLITS THE SUSPECTS STILL TIED.':'THE NEW CLUE DID NOT BREAK THE OLD TIE.',
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false
  });
}

export const TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_CERTIFICATE=adjudicateTargetRefinementFixture();
