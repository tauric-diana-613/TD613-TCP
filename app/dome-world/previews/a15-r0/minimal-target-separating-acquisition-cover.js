import { TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_CERTIFICATE as PARENT } from './target-relevant-equivalence-refinement.js';

export const MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_SCHEMA='td613.dome-world.minimal-target-separating-acquisition-cover/v0.1';
export const MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_PARENT='74462660f3a3287d4d91e739c7cba664554d0a47';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const stablePair=(a,b)=>[a,b].sort().join('::');

export const ACQUISITION_COVER_FIXTURE=freeze({
  target_id:'THETA',
  unresolved_target_pairs:[
    ['THETA_A','THETA_B'],
    ['THETA_A','THETA_C'],
    ['THETA_B','THETA_C']
  ],
  candidates:[
    {
      id:'Z_A_SPLITTER',
      acquisition_class:'PARTIAL_TARGET_SPLITTER',
      cost:1,
      resolves:[['THETA_A','THETA_B'],['THETA_A','THETA_C']]
    },
    {
      id:'Z_B_SPLITTER',
      acquisition_class:'PARTIAL_TARGET_SPLITTER',
      cost:1,
      resolves:[['THETA_A','THETA_B'],['THETA_B','THETA_C']]
    },
    {
      id:'Z_C_SPLITTER',
      acquisition_class:'PARTIAL_TARGET_SPLITTER',
      cost:1,
      resolves:[['THETA_A','THETA_C'],['THETA_B','THETA_C']]
    },
    {
      id:'Z_ONE_SHOT_FULL',
      acquisition_class:'FULL_TARGET_SPLITTER',
      cost:3,
      resolves:[['THETA_A','THETA_B'],['THETA_A','THETA_C'],['THETA_B','THETA_C']]
    },
    {
      id:'Z_NOVEL_NO_TARGET_VALUE',
      acquisition_class:'NOVEL_NONIDENTIFYING',
      cost:0.25,
      resolves:[]
    }
  ]
});

function validateFixture(fixture){
  if(typeof fixture?.target_id!=='string'||fixture.target_id.length===0)throw new Error('DECLARED_TARGET_REQUIRED');
  if(!Array.isArray(fixture?.unresolved_target_pairs)||fixture.unresolved_target_pairs.length===0)throw new Error('UNRESOLVED_TARGET_PAIRS_REQUIRED');
  const universe=new Set();
  for(const pair of fixture.unresolved_target_pairs){
    if(!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1])throw new Error('VALID_TARGET_PAIR_REQUIRED');
    const key=stablePair(pair[0],pair[1]);
    if(universe.has(key))throw new Error('DUPLICATE_TARGET_PAIR_FORBIDDEN');
    universe.add(key);
  }
  if(!Array.isArray(fixture?.candidates)||fixture.candidates.length===0)throw new Error('CANDIDATE_ACQUISITIONS_REQUIRED');
  const ids=new Set();
  for(const c of fixture.candidates){
    if(typeof c?.id!=='string'||c.id.length===0||ids.has(c.id))throw new Error('DISTINCT_CANDIDATE_ID_REQUIRED');
    ids.add(c.id);
    if(!(Number.isFinite(c.cost)&&c.cost>=0))throw new Error('NONNEGATIVE_FINITE_COST_REQUIRED');
    if(!Array.isArray(c.resolves))throw new Error('RESOLVED_PAIR_LIST_REQUIRED');
    for(const pair of c.resolves){
      const key=stablePair(pair?.[0],pair?.[1]);
      if(!universe.has(key))throw new Error('CANDIDATE_MAY_ONLY_RESOLVE_DECLARED_TARGET_PAIR');
    }
  }
  return universe;
}

function subsets(items){
  const out=[];
  for(let mask=0;mask<(1<<items.length);mask++){
    const s=[];
    for(let i=0;i<items.length;i++)if(mask&(1<<i))s.push(items[i]);
    out.push(s);
  }
  return out;
}

export function evaluateAcquisitionSet(set,fixture=ACQUISITION_COVER_FIXTURE){
  const universe=validateFixture(fixture);
  const resolved=new Set();
  let cost=0;
  for(const c of set){
    cost+=c.cost;
    for(const pair of c.resolves)resolved.add(stablePair(pair[0],pair[1]));
  }
  const unresolved=[...universe].filter(x=>!resolved.has(x));
  return freeze({
    candidate_ids:set.map(x=>x.id).sort(),
    cardinality:set.length,
    total_cost:cost,
    resolved_pair_count:resolved.size,
    unresolved_pair_count:unresolved.length,
    complete_target_separation:unresolved.length===0
  });
}

function chooseBestComplete(plans,objective){
  const complete=plans.filter(p=>p.complete_target_separation);
  if(complete.length===0)return null;
  const scored=[...complete].sort((a,b)=>{
    if(objective==='MIN_CARDINALITY')return a.cardinality-b.cardinality||a.total_cost-b.total_cost||a.candidate_ids.join('|').localeCompare(b.candidate_ids.join('|'));
    if(objective==='MIN_COST')return a.total_cost-b.total_cost||a.cardinality-b.cardinality||a.candidate_ids.join('|').localeCompare(b.candidate_ids.join('|'));
    throw new Error('DECLARED_OPTIMIZATION_OBJECTIVE_REQUIRED');
  });
  return scored[0];
}

export function runMinimalTargetSeparatingAcquisitionCover(fixture=ACQUISITION_COVER_FIXTURE){
  validateFixture(fixture);
  const plans=subsets(fixture.candidates).map(s=>evaluateAcquisitionSet(s,fixture));
  const minCardinality=chooseBestComplete(plans,'MIN_CARDINALITY');
  const minCost=chooseBestComplete(plans,'MIN_COST');
  const oneShot=plans.find(p=>p.candidate_ids.length===1&&p.candidate_ids[0]==='Z_ONE_SHOT_FULL');
  const uselessOnly=plans.find(p=>p.candidate_ids.length===1&&p.candidate_ids[0]==='Z_NOVEL_NO_TARGET_VALUE');
  const parentReady=PARENT.status==='TARGET_RELEVANT_EQUIVALENCE_REFINEMENT_CRITERION_EARNED'&&PARENT.golden_egg_earned===false;
  const passed=parentReady&&minCardinality&&minCost&&oneShot&&uselessOnly&&
    minCardinality.cardinality===1&&minCardinality.total_cost===3&&
    minCost.cardinality===2&&minCost.total_cost===2&&
    minCardinality.candidate_ids[0]==='Z_ONE_SHOT_FULL'&&
    uselessOnly.complete_target_separation===false;
  return freeze({
    schema:MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_SCHEMA,
    exact_parent:MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_PARENT,
    status:passed?'MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_EARNED':'INADMISSIBLE',
    rest_symbol:passed?'𝄐':null,
    target_id:fixture.target_id,
    unresolved_target_pair_count:fixture.unresolved_target_pairs.length,
    complete_plan_exists:Boolean(minCost),
    minimum_cardinality_complete_plan:minCardinality,
    minimum_cost_complete_plan:minCost,
    one_shot_full_plan:oneShot,
    novel_nonidentifying_plan:uselessOnly,
    minimum_cardinality_differs_from_minimum_cost:passed&&minCardinality.candidate_ids.join('|')!==minCost.candidate_ids.join('|'),
    optimization_objective_must_be_declared:passed,
    complete_identification_plan_is_target_pair_cover:passed,
    pair_cover_is_finite_fixture_application_not_new_set_cover_theorem:true,
    adaptive_outcome_contingent_policy_earned:false,
    stochastic_acquisition_cost_model_earned:false,
    empirical_resource_cost_measured:false,
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
      complete_target_identification_requires_covering_every_surviving_target_pair:true,
      minimum_cardinality_not_minimum_resource_cost:true,
      optimality_requires_declared_objective:true,
      cheapest_acquisition_not_cheapest_complete_plan:true,
      one_shot_full_identification_not_necessarily_minimum_cost:true,
      partial_refinement_can_compose_to_complete_identification:true,
      novel_evidence_without_target_pair_coverage_has_zero_identifying_value:true,
      formal_cost_fixture_not_empirical_budget_measurement:true,
      target_separating_cover_not_golden_egg_measurement:true
    }),
    theorem:passed?'FOR_A_FINITE_DECLARED_TARGET_HYPOTHESIS_SET_A_COMPLETE_ACQUISITION_PLAN_MUST_COVER_EVERY_TARGET_PAIR_LEFT_UNRESOLVED_BY_THE_FROZEN_EVIDENCE_REGIME; UNDER_DECLARED_NONNEGATIVE_COSTS_THE_MINIMUM_COST_COMPLETE_PLAN_NEED_NOT_BE_THE_MINIMUM_CARDINALITY_PLAN_SO_EXPERIMENTAL_OPTIMALITY_IS_OBJECTIVE_RELATIVE':'NOT_EARNED',
    child_message:passed?'THE FEWEST TESTS AND THE CHEAPEST COMPLETE ANSWER CAN BE DIFFERENT PLANS.':'THE EXPERIMENT PLAN HAS NOT BEEN EARNED.'
  });
}

export const MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_CERTIFICATE=runMinimalTargetSeparatingAcquisitionCover();
