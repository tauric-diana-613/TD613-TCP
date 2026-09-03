import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  A16_OPERATOR_WITNESS_SOCKET_CERTIFICATE as PARENT
} from './a16-operator-witness-socket.js';

export const A16_REVIEW_WAIVER_CONTRADICTION_SCHEMA='td613.dome-world.a16-review-waiver-contradiction/v0.1';
export const A16_REVIEW_WAIVER_CONTRADICTION_PARENT='00b61c0deae226b698c7ff2f1a2485f348bd102e';

const HANDOFF_PATH='app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md';
const MANDATORY_REVIEW='operator review recorded = required';
const START_FORBIDDEN='A16 start before review = forbidden';
const TERMINAL_WAIVER='operator visual review recorded or explicitly waived = true';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

function readContract(){
  return fs.readFileSync(HANDOFF_PATH,'utf8');
}

export function classifyReviewWaiverState({review_recorded,explicitly_waived}){
  const review=review_recorded===true;
  const waiver=explicitly_waived===true;
  const section1_allows_start=review;
  const section13_review_coordinate_passes=review||waiver;
  const contradictory=section13_review_coordinate_passes&&!section1_allows_start;
  return freeze({
    review_recorded:review,
    explicitly_waived:waiver,
    section1_allows_start,
    section13_review_coordinate_passes,
    contradictory,
    classification:contradictory?'CONTRADICTORY_HELD':(section1_allows_start&&section13_review_coordinate_passes?'REVIEW_RULES_CONCORDANT_ALLOW':'REVIEW_RULES_CONCORDANT_HOLD')
  });
}

export function enumerateReviewWaiverStates(){
  return freeze([
    classifyReviewWaiverState({review_recorded:false,explicitly_waived:false}),
    classifyReviewWaiverState({review_recorded:false,explicitly_waived:true}),
    classifyReviewWaiverState({review_recorded:true,explicitly_waived:false}),
    classifyReviewWaiverState({review_recorded:true,explicitly_waived:true})
  ]);
}

export function runA16ReviewWaiverContradiction(){
  const text=readContract();
  const parentReady=PARENT.status==='A16_OPERATOR_WITNESS_SOCKET_SEPARATION_EARNED';
  const mandatoryReviewPresent=text.includes(MANDATORY_REVIEW);
  const startForbiddenPresent=text.includes(START_FORBIDDEN);
  const terminalWaiverPresent=text.includes(TERMINAL_WAIVER);
  const explicitWaiverOverridesMandatoryReview=text.includes('explicit waiver overrides mandatory operator review')||text.includes('explicit waiver may substitute for mandatory operator review');
  const mandatoryReviewOverridesWaiver=text.includes('mandatory operator review overrides explicit waiver')||text.includes('explicit waiver cannot substitute for mandatory operator review');
  const states=enumerateReviewWaiverStates();
  const contradictions=states.filter(x=>x.contradictory);
  const waiverOnly=states.find(x=>x.review_recorded===false&&x.explicitly_waived===true);
  const earned=Boolean(
    parentReady&&mandatoryReviewPresent&&startForbiddenPresent&&terminalWaiverPresent&&
    contradictions.length===1&&waiverOnly?.contradictory===true&&
    waiverOnly.section1_allows_start===false&&waiverOnly.section13_review_coordinate_passes===true&&
    explicitWaiverOverridesMandatoryReview===false&&mandatoryReviewOverridesWaiver===false
  );

  const subject={
    exact_parent:A16_REVIEW_WAIVER_CONTRADICTION_PARENT,
    parent_socket_digest:PARENT.socket_digest,
    mandatory_review_rule:MANDATORY_REVIEW,
    start_forbidden_rule:START_FORBIDDEN,
    terminal_waiver_rule:TERMINAL_WAIVER,
    states
  };

  return freeze({
    schema:A16_REVIEW_WAIVER_CONTRADICTION_SCHEMA,
    exact_parent:A16_REVIEW_WAIVER_CONTRADICTION_PARENT,
    status:earned?'A16_REVIEW_WAIVER_CONTRADICTION_EARNED':'INADMISSIBLE',
    errors:earned?[]:['A16_REVIEW_WAIVER_CONTRADICTION_NOT_ESTABLISHED'],
    rest_symbol:earned?'𝄐':null,
    contradiction_digest:digest(subject),
    source_class:'PRE_A16_GOVERNANCE_CONTRACT_CONTRADICTION_ASSAY',
    mandatory_review_rule_present:mandatoryReviewPresent,
    start_before_review_forbidden_rule_present:startForbiddenPresent,
    terminal_review_or_waiver_rule_present:terminalWaiverPresent,
    state_count:states.length,
    contradiction_count:contradictions.length,
    contradictory_states:freeze(contradictions),
    waiver_only_state:waiverOnly,
    explicit_precedence_or_override_rule_detected:explicitWaiverOverridesMandatoryReview||mandatoryReviewOverridesWaiver,
    waiver_branch_self_executing:false,
    contradiction_requires_governance_adjudication_or_textual_repair:earned,
    stricter_rule_silently_promoted_to_canonical_precedence:false,
    operator_review_recorded:false,
    operator_review_admitted:false,
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
      mandatory_review_not_waiver_substitute:true,
      terminal_entry_coordinate_not_earlier_mandatory_rule:true,
      waiver_only_state_is_contradictory:true,
      contradiction_detection_not_governance_repair:true,
      stricter_interpretation_not_canonical_precedence:true,
      witness_socket_not_waiver_authority:true,
      contract_contradiction_not_a16_admission:true,
      structural_governance_conflict_not_western_horizon_successor:true
    }),
    theorem:'THE_CANONICAL_A16_A19_HANDOFF_CONTAINS_A_FINITE_REVIEW_WAIVER_CONTRADICTION: SECTION_1_REQUIRES_RECORDED_OPERATOR_REVIEW_AND_FORBIDS_A16_START_BEFORE_REVIEW_WHILE_SECTION_13_TREATS_REVIEW_OR_EXPLICIT_WAIVER_AS_SUFFICIENT_FOR_THE_REVIEW_COORDINATE_OF_ENTRY; ENUMERATION_OF_THE_FOUR_REVIEW_WAIVER_STATES_YIELDS_EXACTLY_ONE_CONTRADICTORY_STATE_REVIEW_ABSENT_WAIVER_PRESENT_SO_A_WAIVER_CANNOT_CURRENTLY_BE_TREATED_AS_A_SELF_EXECUTING_A16_ADMISSION_PATH_WITHOUT_EXPLICIT_GOVERNANCE_ADJUDICATION_OR_TEXTUAL_REPAIR',
    child_message:'THE FRONT OF THE RULEBOOK SAYS A HUMAN MUST LOOK. THE BACK SAYS A WAIVER CAN COUNT. IF NOBODY LOOKS BUT A WAIVER EXISTS, THE BOOK ARGUES WITH ITSELF.'
  });
}

export const A16_REVIEW_WAIVER_CONTRADICTION_CERTIFICATE=runA16ReviewWaiverContradiction();
