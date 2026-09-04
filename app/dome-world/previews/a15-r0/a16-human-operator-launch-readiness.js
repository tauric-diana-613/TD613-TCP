import {
  A16_OPERATOR_WITNESS_SOCKET_CERTIFICATE as SOCKET,
  A16_OPERATOR_WITNESS_SOCKET_TEMPLATE,
  REQUIRED_OPERATOR_REVIEW_FIELDS,
  inspectA16OperatorWitnessRecord
} from './a16-operator-witness-socket.js';
import { analyzeA16ResidualGateFrontier } from './a16-residual-gate-persistence.js';

export const A16_HUMAN_OPERATOR_LAUNCH_SCHEMA='td613.dome-world.a16-human-operator-launch-readiness/v0.1';
export const A16_HUMAN_OPERATOR_LAUNCH_PARENT='951807bc76ee2ba5f72fa7bd643fa8e53521ccf8';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};

export const A16_OPERATOR_REVIEW_PROMPTS=freeze({
  production_url_and_observation_date:'Record the actual production URL observed and the observation date/time.',
  desktop_and_mobile_device_browser_posture:'Record desktop and mobile device/browser postures actually observed.',
  profile_and_journey_entered:'Record the profile and principal journey actually entered.',
  principal_workspace_material_distinction:'Record whether Home, Map, Work, Choir, and Capsule feel materially distinct rather than cosmetically relabeled.',
  flowcore_field_and_play_visibility:'Record whether the Flow-Core field and explicit Play control remain visible, finite, and legible.',
  child_legible_relation_before_technical_terminology:'Record whether the child-legible relation appears before technical terminology.',
  hold_missingness_and_recovery_legibility:'Record whether holds explain missingness and available recovery without hiding the reason for the hold.',
  profile_and_aia_route_meaningful_difference:'Record whether profile and AIA-route changes produce meaningful changes rather than cosmetic differences.',
  visual_control_or_authority_defects:'Record all observed flicker, stale copy, dead controls, cheap-looking components, density, navigation, or authority confusion; use [] only after explicitly observing zero defects.',
  rest_return_and_exit_without_penalty:'Record whether Rest, Return, and exit remain available without penalty or coercive continuation.'
});

export const A16_OPERATOR_REVIEW_RECORD_TEMPLATE=freeze(structuredClone(A16_OPERATOR_WITNESS_SOCKET_TEMPLATE));

export function runA16HumanOperatorLaunchReadiness(){
  const frontier=analyzeA16ResidualGateFrontier();
  const emptyInspection=inspectA16OperatorWitnessRecord(A16_OPERATOR_REVIEW_RECORD_TEMPLATE);
  const promptKeys=Object.keys(A16_OPERATOR_REVIEW_PROMPTS);
  const requiredKeys=[...REQUIRED_OPERATOR_REVIEW_FIELDS];
  const promptCoverage=requiredKeys.length===promptKeys.length&&requiredKeys.every(key=>promptKeys.includes(key));
  const residualExact=frontier.residual_gate_count===4&&JSON.stringify(frontier.residual_gate_ids)===JSON.stringify(['G3','G4','G5','G6']);
  const noClosedTransformLeft=frontier.immediately_machine_reducible_residual_gate_count===0;
  const socketReady=SOCKET.status==='A16_OPERATOR_WITNESS_SOCKET_SEPARATION_EARNED'&&SOCKET.machine_can_preregister_witness_shape===true;
  const emptyChairPreserved=emptyInspection.status==='AWAITING_HUMAN_OPERATOR_OBSERVATION'&&emptyInspection.record_shape_complete===false;
  const launchReady=Boolean(socketReady&&promptCoverage&&residualExact&&noClosedTransformLeft&&emptyChairPreserved);

  return freeze({
    schema:A16_HUMAN_OPERATOR_LAUNCH_SCHEMA,
    status:launchReady?'A16_HUMAN_OPERATOR_REVIEW_LAUNCH_READY':'HELD',
    exact_parent:A16_HUMAN_OPERATOR_LAUNCH_PARENT,
    source_class:'PRE_A16_HUMAN_OPERATOR_REVIEW_LAUNCH_PREREGISTRATION',
    parent_exact_head_green_witness:freeze({
      pr:1025,
      run:'2556 / 33818189211',
      conclusion:'SUCCESS',
      exact_head:'951807bc76ee2ba5f72fa7bd643fa8e53521ccf8',
      exact_tree:'018610e90be185ac7bf5e89e7fb10da987b99590',
      firefox_artifact_id:9917621496,
      firefox_artifact_digest:'sha256:148d736160001127dc24fe4877df3869b583fab397cc4e0529bf934e8bfc50c6',
      firefox_live_field_schema:'td613.ash.flowcore-live-field-browser/v0.17-live-field-name-settlement-diagnostics',
      firefox_live_field_status:'PASS'
    }),
    residual_frontier:freeze({
      entry_gate_count:frontier.entry_gate_count,
      satisfied_gate_count:frontier.satisfied_gate_count,
      residual_gate_count:frontier.residual_gate_count,
      residual_gate_ids:frontier.residual_gate_ids,
      immediately_machine_reducible_residual_gate_count:frontier.immediately_machine_reducible_residual_gate_count,
      exogenous_operator_governance_event_lower_bound:frontier.exogenous_operator_governance_event_lower_bound,
      exact_minimum_distinct_operator_event_count:frontier.exact_minimum_distinct_operator_event_count
    }),
    witness_socket_status:SOCKET.status,
    empty_review_record_status:emptyInspection.status,
    required_operator_review_field_count:requiredKeys.length,
    required_operator_review_fields:freeze(requiredKeys),
    prompt_coverage_complete:promptCoverage,
    next_admissible_evidence_class:'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD',
    human_operator_review_request_ready:launchReady,
    human_observation_required:true,
    operator_review_recorded:false,
    operator_review_admitted:false,
    explicit_review_waiver_recorded:false,
    visual_errata_disposition_recorded:false,
    a16_0_scope_accepted:false,
    a16_candidate_registered:false,
    a16_gate_open:false,
    a16_readmission_earned:false,
    a16_implementation_authority:false,
    a16_product_mutation_authority:false,
    western_horizon_successor_stage_claimed:false,
    golden_egg_earned:false,
    empirical_credit_to_golden_egg:0,
    merge_authority:false,
    production_authority:false,
    deployment_authority:false,
    publication_authority:false,
    laws:freeze({
      launch_packet_not_operator_observation:true,
      empty_template_not_completed_review:true,
      diagnostic_green_not_human_acceptance:true,
      review_may_surface_visual_errata_without_prejudging_errata:true,
      g4_cannot_close_before_g3:true,
      g6_cannot_close_before_g3_g4_g5:true,
      four_residual_coordinates_not_four_distinct_human_events:true,
      human_review_not_learner_study:true,
      human_review_not_universal_usability_claim:true,
      human_review_not_golden_egg_measurement:true,
      a16_launch_readiness_not_western_horizon_successor:true
    }),
    theorem:'THE_CURRENT_PRE_A16_MACHINE_FRONTIER_IS_READY_TO_REQUEST_THE_MANDATORY_HUMAN_OPERATOR_PRODUCTION_OBSERVATION_WITHOUT_PRETENDING_THAT_OBSERVATION_HAS_ALREADY_OCCURRED: THE_TEN_FIELD_WITNESS_SOCKET_IS_PREREGISTERED_AND_EMPTY, THE_DESCENDANT_EXACT_HEAD_HAS_CLOSED_STATIC_THREE_ENGINE_AND_CONVERGENCE_HOSTILITY, THE_CANONICAL_RESIDUAL_VECTOR_REMAINS_G3_G4_G5_G6_WITH_ZERO_IMMEDIATELY_MACHINE_REDUCIBLE_COORDINATES, AND_THE_NEXT_ADMISSIBLE_NEW_EVIDENCE_CLASS_IS_A_REAL_HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD; LAUNCH_READINESS_GRANTS_NO_A16_REAUTHORING_IMPLEMENTATION_MUTATION_MERGE_DEPLOYMENT_OR_GOLDEN_EGG_AUTHORITY',
    child_message:'THE MACHINE HAS FINISHED SETTING THE CLIPBOARD ON THE EMPTY CHAIR. THE NEXT NEW THING MUST COME FROM A HUMAN LOOKING AT THE LIVE INSTRUMENT.'
  });
}

export const A16_HUMAN_OPERATOR_LAUNCH_CERTIFICATE=runA16HumanOperatorLaunchReadiness();
