import { GOLDEN_EGG_EXTERIORITY_CONVERGENCE_CERTIFICATE as P } from './golden-egg-exteriority-convergence.js';

export const WESTERN_HORIZON_EMPIRICAL_SHORE_REST_SCHEMA='td613.dome-world.western-horizon-empirical-shore-rest/v0.1';
export const WESTERN_HORIZON_EMPIRICAL_SHORE_REST_PARENT='6c78f43adbbe28143d6114824cc9396dff48dcab';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};

export function runWesternHorizonEmpiricalShoreRest(){
  const parentPass=P.passed===true
    && P.golden_egg_earned===false
    && P.next_earned_frontier==='INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION';
  const passed=parentPass;
  return freeze({
    schema:WESTERN_HORIZON_EMPIRICAL_SHORE_REST_SCHEMA,
    exact_parent:WESTERN_HORIZON_EMPIRICAL_SHORE_REST_PARENT,
    parent_convergence_passed:P.passed===true,
    parent_next_earned_frontier:P.next_earned_frontier,
    status:passed?'OFFICIAL_RESEARCH_REST':'REST_NOT_EARNED',
    rest_symbol:passed?'𝄐':null,
    rest_official:passed,
    rest_is_completion:false,
    rest_is_abandonment:false,
    sequence_authority:false,
    next_stage:null,
    stage_unlocks:[],
    closed_system_successor_authority:false,
    additional_internal_bookkeeping_authority:false,
    materially_new_evidentiary_substrate_required:true,
    reopen_condition:'INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION',
    exogenous_witness_acquired:false,
    actual_empirical_matched_return_acquired:false,
    empirical_credit_from_rest:0,
    golden_egg_earned:false,
    live_loom_mutated:false,
    loom_rename_authority:false,
    a16_authority:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    vercel_authority:false,
    passed
  });
}

export const WESTERN_HORIZON_EMPIRICAL_SHORE_REST_CERTIFICATE=runWesternHorizonEmpiricalShoreRest();
