import { RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CERTIFICATE as PARENT } from './receiver-swap-causal-admissibility.js';

export const CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_SCHEMA='td613.dome-world.conditional-exteriority-information-gain/v0.1';
export const CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_PARENT='fb3501cec8a96e7918ed5ac88c7096577eb88056';
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const unique=a=>[...new Set(a)];
const log2=x=>Math.log(x)/Math.log(2);

function normalize(values){
  const sum=values.reduce((a,b)=>a+b,0);
  return values.map(v=>v/sum);
}

export function mutualInformationBits(prior,conditional){
  const pO=normalize(prior);
  const xCount=conditional[0]?.length||0;
  const pX=Array.from({length:xCount},(_,x)=>pO.reduce((s,p,o)=>s+p*conditional[o][x],0));
  let mi=0;
  for(let o=0;o<pO.length;o++){
    for(let x=0;x<xCount;x++){
      const joint=pO[o]*conditional[o][x];
      if(joint>0&&pX[x]>0)mi+=joint*log2(conditional[o][x]/pX[x]);
    }
  }
  return mi;
}

export const EXTERIORITY_TWIN_WORLD_BASE=freeze({
  origin_variable:'OMEGA_MODEL',
  origin_states:['EXTERNAL','INTERNAL'],
  prior:[0.5,0.5],
  admitted_record_A:'A_IDENTICAL_IN_BOTH_WORLDS',
  admitted_record_origin_information_bits:0,
  omega_world_not_identical_to_omega_model:true
});

export const DERIVED_FROM_A_CHANNEL=freeze({
  channel_id:'X_A_DERIVED_FROM_ADMITTED_RECORD',
  derived_from_admitted_record_A:true,
  independently_governed:false,
  shares_upstream_source_with_A:true,
  causal_production_independent_of_A:false,
  synthetic_model:true,
  externally_measured:false,
  conditional_likelihoods:[[0.4,0.6],[0.4,0.6]]
});

export const SYNTHETIC_EXOGENOUS_CHANNEL_PROBE=freeze({
  channel_id:'X_SYNTHETIC_EXOGENOUS_PROBE',
  derived_from_admitted_record_A:false,
  independently_governed:true,
  shares_upstream_source_with_A:false,
  causal_production_independent_of_A:true,
  statistical_independence_from_origin_assumed:false,
  synthetic_model:true,
  externally_measured:false,
  conditional_likelihoods:[[0.8,0.2],[0.2,0.8]]
});

function validateChannel(channel,{requireIndependent}){
  const errors=[];
  if(channel?.synthetic_model!==true)errors.push('FORMAL_CHANNEL_FIXTURE_MUST_REMAIN_SYNTHETIC');
  if(channel?.externally_measured!==false)errors.push('EXTERNAL_MEASUREMENT_MUST_REMAIN_UNACQUIRED');
  if(!Array.isArray(channel?.conditional_likelihoods)||channel.conditional_likelihoods.length!==2)errors.push('TWO_ORIGIN_CONDITIONAL_LIKELIHOODS_REQUIRED');
  else for(const row of channel.conditional_likelihoods){
    if(!Array.isArray(row)||row.length!==2||Math.abs(row.reduce((a,b)=>a+b,0)-1)>1e-12)errors.push('NORMALIZED_BINARY_CHANNEL_LIKELIHOODS_REQUIRED');
  }
  if(requireIndependent){
    if(channel?.derived_from_admitted_record_A!==false)errors.push('CHANNEL_MUST_NOT_BE_DERIVED_FROM_A');
    if(channel?.independently_governed!==true)errors.push('INDEPENDENT_GOVERNANCE_REQUIRED');
    if(channel?.shares_upstream_source_with_A!==false)errors.push('SHARED_UPSTREAM_SOURCE_REJECTED');
    if(channel?.causal_production_independent_of_A!==true)errors.push('CAUSAL_PRODUCTION_INDEPENDENCE_REQUIRED');
  }
  return unique(errors);
}

export function evaluateConditionalExteriorityInformationGain({
  base=EXTERIORITY_TWIN_WORLD_BASE,
  derivedChannel=DERIVED_FROM_A_CHANNEL,
  exogenousProbe=SYNTHETIC_EXOGENOUS_CHANNEL_PROBE
}={}){
  const errors=[];
  if(base?.admitted_record_origin_information_bits!==0)errors.push('TWIN_WORLD_A_MUST_REMAIN_ORIGIN_ERASING');
  if(base?.omega_world_not_identical_to_omega_model!==true)errors.push('ONTOLOGY_MODEL_VARIABLE_SEPARATION_REQUIRED');
  errors.push(...validateChannel(derivedChannel,{requireIndependent:false}));
  errors.push(...validateChannel(exogenousProbe,{requireIndependent:true}));
  const derivedBits=mutualInformationBits(base.prior,derivedChannel.conditional_likelihoods);
  const probeBits=mutualInformationBits(base.prior,exogenousProbe.conditional_likelihoods);
  if(Math.abs(derivedBits)>1e-12)errors.push('A_DERIVED_CHANNEL_MUST_ADD_ZERO_ORIGIN_INFORMATION');
  if(!(probeBits>0))errors.push('SYNTHETIC_EXOGENOUS_PROBE_MUST_HAVE_POSITIVE_DISCRIMINATORY_INFORMATION');
  const parentReady=PARENT.status==='RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CRITERION_EARNED'&&
    PARENT.formal_contrast_ready_for_empirical_acquisition===true&&
    PARENT.receiver_effect_observed===false&&
    PARENT.golden_egg_earned===false;
  if(!parentReady)errors.push('RECEIVER_SWAP_PARENT_REQUIRED');
  const passed=errors.length===0;
  return freeze({
    schema:CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_SCHEMA,
    exact_parent:CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_PARENT,
    status:passed?'CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_CRITERION_EARNED':'INADMISSIBLE',
    errors,
    rest_symbol:passed?'𝄐':null,
    conditional_information_gain_criterion_earned:passed,
    admitted_record_origin_information_bits:base.admitted_record_origin_information_bits,
    derived_channel_conditional_information_bits:derivedBits,
    synthetic_exogenous_probe_conditional_information_bits:probeBits,
    synthetic_exogenous_probe_conditional_information_positive:passed&&probeBits>0,
    derived_channel_rejected_as_new_exteriority_information:passed&&Math.abs(derivedBits)<=1e-12,
    non_derivative_channel_topology_required:passed,
    source_independence_required:passed,
    causal_production_independence_required:passed,
    statistical_independence_assumed:false,
    likelihood_separation_required:passed,
    empirical_exogenous_channel_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    synthetic_probe_only:true,
    empirical_credit_from_synthetic_probe:0,
    exact_golden_egg_surfaces_added:[],
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    candidate_theorem:passed?'A_CHANNEL_X_CAN_CONTRIBUTE_NEW_ORIGIN_INFORMATION_BEYOND_ADMITTED_RECORD_A_ONLY_IF_IT_IS_NON_DERIVATIVE_OF_A_AND_ITS_ORIGIN_CONDITIONED_LIKELIHOODS_REMAIN_DISTINGUISHABLE_AFTER_CONDITIONING_ON_A_WHILE_ANY_CHANNEL_DETERMINISTICALLY_DERIVED_FROM_A_ALONE_HAS_ZERO_CONDITIONAL_EXTERIORITY_INFORMATION_GAIN':'NOT_EARNED',
    operational_target:passed?'FUTURE_EXTERNAL_CHANNEL_X_WITH_EMPIRICALLY_ESTIMATED_I_OMEGA_X_GIVEN_A_GREATER_THAN_ZERO_UNDER_SOURCE_BOUND_CAUSALLY_INDEPENDENT_WITNESS_PRODUCTION':'NOT_READY',
    laws:freeze({
      conditional_information_gain_criterion_not_empirical_exteriority_measurement:true,
      synthetic_likelihood_probe_not_external_witness:true,
      positive_model_cmi_not_real_world_origin_proof:true,
      derived_channel_not_independent_channel:true,
      multiple_endpoints_not_multiple_independent_sources:true,
      channel_independence_not_statistical_independence_assumption:true,
      origin_hypothesis_variable_not_externality_ontology:true,
      conditional_exteriority_information_gain_not_golden_egg_measurement:true
    }),
    child_message:passed?'A NEW WINDOW COUNTS ONLY WHEN IT BRINGS SOMETHING THE OLD RECORD COULD NOT HAVE TOLD US.':'THE NEW WINDOW HAS NOT YET BROUGHT NEW INFORMATION.'
  });
}

export const CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_CERTIFICATE=evaluateConditionalExteriorityInformationGain();
