export const ACTIVE_REOPENING_NONEXCLUSIVITY_SCHEMA='td613.dome-world.active-reopening-nonexclusivity/v0.1';
export const ACTIVE_REOPENING_NONEXCLUSIVITY_PARENT='fd3a18439267504ad80ca4084377d7350b47e9d7';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const sameMatrix=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export const ACTIVE_REOPENING_EXTERNAL_WITNESSES=freeze([
  {
    witness_id:'uai-2026-intervention-only-causal-discovery',
    evidence_class:'INDEPENDENT_2026_PUBLISHED_EMPIRICAL_AND_FORMAL_WORK',
    title:'Relaxing Faithfulness with Intervention-Only Causal Discovery',
    authors:['Bijan Mazaheri','Jiaqi Zhang','Caroline Uhler'],
    venue:'Proceedings of the 42nd Conference on Uncertainty in Artificial Intelligence',
    year:2026,
    pages:'4441-4456',
    publication_url:'https://proceedings.mlr.press/v337/mazaheri26b.html',
    code_repository:'honeybijan/Intervention-Only-Causal-Discovery',
    code_head:'624e21b2207d10eb6eb13d908bc4271e636cdf1e',
    observed_scope:'HARD_INTERVENTIONS_CAN_IDENTIFY_CAUSAL_LINKAGE_UNDER_INTERVENTION_IMMEDIACY_FAITHFULNESS_AND_INTERVENTION_SCOPE_DETERMINES_REMAINING_EQUIVALENCE_CLASSES'
  },
  {
    witness_id:'clear-2026-causal-discovery-in-action',
    evidence_class:'INDEPENDENT_2026_PUBLISHED_EMPIRICAL_AND_FORMAL_WORK',
    title:'Causal Discovery in Action: Learning Chain-Reaction Mechanisms from Interventions',
    authors:['Panayiotis Panayiotou','Özgür Şimşek'],
    venue:'Proceedings of the Fifth Conference on Causal Learning and Reasoning',
    year:2026,
    pages:'1545-1571',
    publication_url:'https://proceedings.mlr.press/v323/panayiotou26a.html',
    observed_scope:'BLOCKING_INTERVENTIONS_UNIQUELY_IDENTIFY_CHAIN_REACTION_CAUSAL_STRUCTURE_WHILE_OBSERVATIONAL_HEURISTICS_FAIL_IN_RELEVANT_REGIMES'
  },
  {
    witness_id:'uai-2026-interventional-vs-observational-samples',
    evidence_class:'INDEPENDENT_2026_PUBLISHED_FORMAL_WORK',
    title:'The relative value of interventional and observational samples in Bayesian Causal Linear Gaussian Models',
    authors:['Valentinian Mihai Lungu','Anish Dhir','Mark van der Wilk','Ioannis Kontoyiannis'],
    venue:'Proceedings of the 42nd Conference on Uncertainty in Artificial Intelligence',
    year:2026,
    pages:'4067-4099',
    publication_url:'https://proceedings.mlr.press/v337/lungu26a.html',
    observed_scope:'PURELY_OBSERVATIONAL_DATA_CAN_FAIL_TO_IDENTIFY_CAUSAL_DIRECTION_WITHIN_EQUIVALENCE_CLASSES_WHILE_INTERVENTIONAL_DATA_SUPPORTS_EXPERIMENTAL_DESIGN_FOR_CAUSAL_DISCOVERY'
  }
]);

export const ACTIVE_REOPENING_ANALYTIC_PAIR=freeze({
  model_1:{name:'X_TO_Y',x_variance:1,y_given_x_coefficient:1,y_noise_variance:1},
  model_2:{name:'Y_TO_X',y_variance:2,x_given_y_coefficient:0.5,x_noise_variance:0.5},
  observational_mean:[0,0],
  observational_covariance:[[1,1],[1,2]],
  intervention:{kind:'do',target:'X',value:1},
  interventional_y_mean:{X_TO_Y:1,Y_TO_X:0}
});

function observationalLaw(model){
  if(model.name==='X_TO_Y'){
    const vx=model.x_variance;
    const b=model.y_given_x_coefficient;
    const ve=model.y_noise_variance;
    return {mean:[0,0],cov:[[vx,b*vx],[b*vx,b*b*vx+ve]]};
  }
  if(model.name==='Y_TO_X'){
    const vy=model.y_variance;
    const b=model.x_given_y_coefficient;
    const ve=model.x_noise_variance;
    return {mean:[0,0],cov:[[b*b*vy+ve,b*vy],[b*vy,vy]]};
  }
  throw new Error('UNKNOWN_MODEL');
}

function interventionalYMean(model,intervention){
  if(intervention.kind!=='do'||intervention.target!=='X')throw new Error('DO_X_INTERVENTION_REQUIRED');
  if(model.name==='X_TO_Y')return model.y_given_x_coefficient*intervention.value;
  if(model.name==='Y_TO_X')return 0;
  throw new Error('UNKNOWN_MODEL');
}

export function runActiveReopeningCounterexample(pair=ACTIVE_REOPENING_ANALYTIC_PAIR){
  const a1=observationalLaw(pair.model_1);
  const a2=observationalLaw(pair.model_2);
  const observational_equivalence=JSON.stringify(a1)===JSON.stringify(a2)&&sameMatrix(a1.cov,pair.observational_covariance);
  const deterministic_verifier_equal=observational_equivalence;
  const randomized_verifier_output_distributions_equal=observational_equivalence;
  const y1=interventionalYMean(pair.model_1,pair.intervention);
  const y2=interventionalYMean(pair.model_2,pair.intervention);
  const intervention_separates_models=y1!==y2;
  return freeze({
    schema:ACTIVE_REOPENING_NONEXCLUSIVITY_SCHEMA,
    exact_parent:ACTIVE_REOPENING_NONEXCLUSIVITY_PARENT,
    status:observational_equivalence&&deterministic_verifier_equal&&randomized_verifier_output_distributions_equal&&intervention_separates_models?'ACTIVE_REOPENING_NONEXCLUSIVITY_EARNED':'INADMISSIBLE',
    rest_symbol:observational_equivalence&&intervention_separates_models?'𝄐':null,
    observational_law_model_1:a1,
    observational_law_model_2:a2,
    observational_equivalence,
    deterministic_verifier_equal,
    randomized_verifier_output_distributions_equal,
    intervention:pair.intervention,
    post_intervention_y_mean_model_1:y1,
    post_intervention_y_mean_model_2:y2,
    intervention_separates_models,
    passive_closed_record_stopping_rule_preserved:true,
    passive_closed_record_stopping_rule_scope:'ADMISSIBLE_TRANSFORMATIONS_OF_FIXED_OBSERVATIONAL_RECORD_A_ONLY',
    active_experiment_reopening_operator_admitted:intervention_separates_models,
    exogenous_witness_admission_unique_reopening_operator:false,
    new_interventional_distribution_not_transformation_of_fixed_A:true,
    external_2026_intervention_witnesses_admitted:ACTIVE_REOPENING_EXTERNAL_WITNESSES.length===3,
    external_empirical_exteriority_witness_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    external_origin_of_artifact_proven:false,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    numbered_stage_authority:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      closed_record_nonidentifiability_not_active_experiment_nonidentifiability:true,
      exogenous_witness_admission_not_unique_reopening_operator:true,
      intervention_generated_data_not_admissible_transformation_of_fixed_A:true,
      active_identification_not_empirical_exteriority:true,
      causal_direction_identification_not_artifact_origin_proof:true,
      external_causal_discovery_witness_not_same_episode_western_measurement:true,
      intervention_scope_limits_identifiability:true,
      randomized_verifier_does_not_create_information_absent_from_A:true,
      golden_egg_credit_forbidden:true
    }),
    theorem:'CLOSED_RECORD_NONIDENTIFIABILITY_GOVERNS_PASSIVE_TRANSFORMATIONS_OF_A_BUT_DOES_NOT_IMPLY_ACTIVE_EXPERIMENTAL_NONIDENTIFIABILITY; AN_ADMISSIBLE_INTERVENTION_CAN_CREATE_NEW_DATA_WHOSE_DISTRIBUTION_SEPARATES_MODELS_THAT_A_ALONE_CANNOT_DISTINGUISH',
    child_message:'THE OLD RECORD COULD NOT ANSWER. THE EXPERIMENT ASKED A NEW QUESTION.'
  });
}

export const ACTIVE_REOPENING_NONEXCLUSIVITY_CERTIFICATE=runActiveReopeningCounterexample();
