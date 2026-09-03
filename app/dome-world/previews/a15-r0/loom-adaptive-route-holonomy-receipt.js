import crypto from 'node:crypto';
import {
  PREREGISTERED_POLICY_DIGEST,
  executeAdaptiveRepairTrace,
  PREREGISTERED_ADAPTIVE_TARGET_REPAIR_CERTIFICATE as PARENT
} from './preregistered-adaptive-target-repair-policy.js';

export const LOOM_ADAPTIVE_ROUTE_HOLONOMY_SCHEMA='td613.dome-world.loom-adaptive-route-holonomy-receipt/v0.1';
export const LOOM_ADAPTIVE_ROUTE_HOLONOMY_PARENT='cd5098a340cfe73958685c66bcf71d659ed8af8d';
export const LIVE_LOOM_SOURCE_BLOB='695d22ec77339bc54512fe6a6a7c0203240ff135';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

export const LOOM_ROOM_COMPATIBILITY_CONTRACT=freeze({
  display:'Loom Room',
  operators:['米','𝄐','cadence/provenance'],
  receives:['transmission','cadence-sample','motif-return'],
  preserves:['holonomy','pattern-flow','anti-equivalence-edge'],
  emits:['motif','cloth-map','route-deformation'],
  blocks:['authorship-proof-claim','identity-proof-claim'],
  source_blob:LIVE_LOOM_SOURCE_BLOB
});

function routeMemoryFromTrace(trace){
  const receipt=executeAdaptiveRepairTrace(trace);
  const steps=receipt.realized_trace.map((step,index)=>({
    index:index+1,
    acquisition:step.acquisition,
    outcome:step.outcome
  }));
  const route_subject={
    target_id:receipt.target_id,
    policy_digest:receipt.policy_digest,
    steps,
    stop_rule_met:receipt.stop_rule_met,
    realized_complete_identification:receipt.realized_complete_identification,
    realized_unresolved_target_pairs:receipt.realized_unresolved_target_pairs,
    realized_total_cost:receipt.realized_total_cost
  };
  const terminal_subject={
    target_id:receipt.target_id,
    policy_digest:receipt.policy_digest,
    stop_rule_met:receipt.stop_rule_met,
    realized_complete_identification:receipt.realized_complete_identification,
    realized_unresolved_target_pairs:receipt.realized_unresolved_target_pairs,
    realized_total_cost:receipt.realized_total_cost
  };
  return freeze({
    route_memory_schema:'td613.dome-world.adaptive-route-memory/v0.1',
    route_memory_digest:digest(route_subject),
    terminal_projection_digest:digest(terminal_subject),
    ...route_subject,
    empirical_measurement_credit:0,
    truth_proof:false,
    authorship_proof:false,
    identity_proof:false
  });
}

export function runLoomAdaptiveRouteHolonomyReceipt(){
  if(PARENT.status!=='PREREGISTERED_ADAPTIVE_TARGET_REPAIR_POLICY_EARNED')return freeze({status:'INADMISSIBLE',errors:['ADAPTIVE_POLICY_PARENT_REQUIRED']});
  if(PARENT.policy_digest!==PREREGISTERED_POLICY_DIGEST)return freeze({status:'INADMISSIBLE',errors:['POLICY_DIGEST_MISMATCH']});

  const routeA=routeMemoryFromTrace([
    {acquisition:'Z_BRANCH',outcome:'A_SEPARATED'},
    {acquisition:'Z_BC',outcome:'SUCCESS'}
  ]);
  const routeC=routeMemoryFromTrace([
    {acquisition:'Z_BRANCH',outcome:'C_SEPARATED'},
    {acquisition:'Z_AB',outcome:'SUCCESS'}
  ]);

  const sameTerminalState=routeA.terminal_projection_digest===routeC.terminal_projection_digest;
  const distinctRouteHistory=routeA.route_memory_digest!==routeC.route_memory_digest;
  const samePolicy=routeA.policy_digest===routeC.policy_digest&&routeA.policy_digest===PREREGISTERED_POLICY_DIGEST;
  const bothStopped=routeA.stop_rule_met===true&&routeC.stop_rule_met===true;
  const passed=sameTerminalState&&distinctRouteHistory&&samePolicy&&bothStopped;

  return freeze({
    schema:LOOM_ADAPTIVE_ROUTE_HOLONOMY_SCHEMA,
    exact_parent:LOOM_ADAPTIVE_ROUTE_HOLONOMY_PARENT,
    status:passed?'LOOM_ADAPTIVE_ROUTE_HOLONOMY_COMPATIBILITY_EARNED':'INADMISSIBLE',
    errors:passed?[]:['ROUTE_HOLONOMY_COMPATIBILITY_FIXTURE_FAILED'],
    rest_symbol:passed?'𝄐':null,
    live_loom_source_blob:LIVE_LOOM_SOURCE_BLOB,
    loom_room_contract:LOOM_ROOM_COMPATIBILITY_CONTRACT,
    route_memories:{A_SEPARATED:routeA,C_SEPARATED:routeC},
    same_declared_target:routeA.target_id===routeC.target_id,
    same_preregistered_policy:samePolicy,
    same_terminal_state:sameTerminalState,
    distinct_realized_route_history:distinctRouteHistory,
    terminal_state_does_not_determine_route_history:passed,
    adaptive_route_memory_compatible_with_loom_preserves:true,
    adaptive_route_memory_compatible_with_loom_emits_route_deformation:true,
    loom_context_is_measurement:false,
    route_memory_is_truth_proof:false,
    route_memory_is_authorship_proof:false,
    route_memory_is_identity_proof:false,
    flowcore_route_burden_model_invoked:false,
    flowcore_canonical_route_graph_compiled:false,
    a16_live_route_burden_compilation_earned:false,
    a16_readmission_earned:false,
    a16_implementation_authority:false,
    a19_whole_program_closure_earned:false,
    a19_mutation_authority:false,
    live_loom_mutated:false,
    loom_rename_authority:false,
    flowcore_public_promotion_authority:false,
    empirical_target_outcome_acquired:false,
    empirical_supplemental_probe_repair_earned:false,
    external_empirical_exteriority_witness_acquired:false,
    empirical_exteriority_information_gain_measured:false,
    exact_golden_egg_surfaces_added:freeze([]),
    empirical_credit_to_golden_egg:0,
    golden_egg_earned:false,
    sequence_authority:false,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      same_terminal_state_not_same_route_history:true,
      adaptive_route_holonomy_memory_not_flowcore_route_burden:true,
      loom_route_memory_not_empirical_measurement:true,
      loom_compatibility_not_loom_mutation:true,
      loom_compatibility_not_a16_readmission:true,
      loom_compatibility_not_a19_closure:true,
      route_deformation_record_not_truth_proof:true,
      synthetic_adaptive_route_memory_not_empirical_repair:true
    }),
    theorem:passed?'TWO_PREREGISTERED_ADAPTIVE_JOURNEYS_MAY_TERMINATE_IN_THE_SAME_IDENTIFYING_STATE_WHILE_RETAINING_DISTINCT_REALIZED_ROUTE_HISTORIES; LOOM_MAY_PRESERVE_THAT_ROUTE_NON_EQUIVALENCE_AS_MEMORY_WITHOUT_CONVERTING_MEMORY_INTO_MEASUREMENT_FLOWCORE_BURDEN_A16_READMISSION_OR_A19_CLOSURE_AUTHORITY':'NOT_EARNED',
    child_message:passed?'THE ANSWER MAY MATCH WHILE THE JOURNEY REMAINS DIFFERENT. THE LOOM MAY REMEMBER WHICH PATH RETURNED.':'THE ADAPTIVE ROUTE MEMORY HAS NOT BEEN EARNED.'
  });
}

export const LOOM_ADAPTIVE_ROUTE_HOLONOMY_CERTIFICATE=runLoomAdaptiveRouteHolonomyReceipt();
