import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  A16_OPERATOR_WITNESS_SOCKET_CERTIFICATE as SOCKET
} from './a16-operator-witness-socket.js';

export const A16_REVIEW_WAIVER_CONTRADICTION_SCHEMA='td613.dome-world.a16-waiver-epistemic-separation/v0.2';
export const A16_REVIEW_WAIVER_CONTRADICTION_PARENT='c0270599fdc118c2ca9e1bd775fb02c75349e986';
export const A16_REVIEW_WAIVER_PRESERVED_RED='c0270599fdc118c2ca9e1bd775fb02c75349e986';

const HANDOFF_PATH='app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md';
const DOSSIER_PATH='app/dome-world/docs/ash/closure/ASH_KEEP_A12_A15_PRODUCTION_CLOSURE_DOSSIER_V0_1.md';
const KHONAPOLIT_PATH='app/dome-world/khonapolit-covenant.js';

const MANDATORY_REVIEW='operator review recorded = required';
const START_FORBIDDEN='A16 start before review = forbidden';
const HANDOFF_WAIVER='operator visual review recorded or explicitly waived = true';
const DOSSIER_WAIVER='A16 mutation = FORBIDDEN UNTIL REVIEW IS RECORDED OR EXPLICITLY WAIVED';
const KHONAPOLIT_WAIVER='ISSUANCE STATE: EXPLICITLY WAIVED FOR RESEARCH. Do not represent this session as issued, badged, authenticated, or custody-complete.';

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const read=path=>fs.readFileSync(path,'utf8');

export function classifyReviewWaiverState({review_recorded,explicitly_waived}){
  const review=review_recorded===true;
  const waiver=explicitly_waived===true;
  const section1_literal_allows_start=review;
  const terminal_review_coordinate_passes=review||waiver;
  const local_handoff_tension=terminal_review_coordinate_passes&&!section1_literal_allows_start;
  const observation_evidence_present=review;
  const governance_review_coordinate_satisfied=review||waiver;

  let classification='REVIEW_COORDINATE_HELD';
  if(review&&governance_review_coordinate_satisfied) classification='REVIEW_RECORDED_COORDINATE_SATISFIED';
  else if(waiver&&governance_review_coordinate_satisfied) classification='WAIVER_COORDINATE_SATISFIED_OBSERVATION_ABSENT';

  return freeze({
    review_recorded:review,
    explicitly_waived:waiver,
    section1_literal_allows_start,
    terminal_review_coordinate_passes,
    local_handoff_tension,
    observation_evidence_present,
    governance_review_coordinate_satisfied,
    waiver_changes_permission_without_creating_review:waiver&&!review,
    classification
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
  const handoff=read(HANDOFF_PATH);
  const dossier=read(DOSSIER_PATH);
  const khonapolit=read(KHONAPOLIT_PATH);
  const parentReady=SOCKET.status==='A16_OPERATOR_WITNESS_SOCKET_SEPARATION_EARNED';

  const mandatoryReviewPresent=handoff.includes(MANDATORY_REVIEW);
  const startForbiddenPresent=handoff.includes(START_FORBIDDEN);
  const handoffWaiverPresent=handoff.includes(HANDOFF_WAIVER);
  const dossierWaiverPresent=dossier.includes(DOSSIER_WAIVER);
  const inheritedWaiverPathEstablished=handoffWaiverPresent&&dossierWaiverPresent;

  const governingPair=`${handoff}\n${dossier}`;
  const waiverPrincipalNamed=/(?:operator|custodian|author|tauric diana|human)\s+(?:may|can|shall|must)\s+(?:explicitly\s+)?waive\s+(?:the\s+)?(?:operator\s+)?(?:visual\s+)?review/i.test(governingPair)
    || /(?:review|operator visual review)\s+may\s+be\s+waived\s+by\s+[^\n.]+/i.test(governingPair);
  const waiverReceiptSchemaNamed=/waiver[_ -](?:receipt|schema)|(?:waiver|waived)[^\n]{0,80}(?:receipt schema|receipt required|waiver receipt)/i.test(governingPair);

  const states=enumerateReviewWaiverStates();
  const localTensions=states.filter(x=>x.local_handoff_tension);
  const waiverOnly=states.find(x=>!x.review_recorded&&x.explicitly_waived);
  const neither=states.find(x=>!x.review_recorded&&!x.explicitly_waived);
  const khonapolitWaiverPreservesAbsence=khonapolit.includes(KHONAPOLIT_WAIVER)
    &&khonapolit.includes("UNISSUED_RESEARCH_WAIVER")
    &&khonapolit.includes('issuance.valid || waiveIssuance');

  const earned=Boolean(
    parentReady&&mandatoryReviewPresent&&startForbiddenPresent&&inheritedWaiverPathEstablished&&
    states.length===4&&localTensions.length===1&&waiverOnly?.local_handoff_tension===true&&
    waiverOnly.governance_review_coordinate_satisfied===true&&waiverOnly.observation_evidence_present===false&&
    waiverOnly.waiver_changes_permission_without_creating_review===true&&
    neither?.governance_review_coordinate_satisfied===false&&
    waiverPrincipalNamed===false&&waiverReceiptSchemaNamed===false&&
    khonapolitWaiverPreservesAbsence===true
  );

  const subject={
    exact_parent:A16_REVIEW_WAIVER_CONTRADICTION_PARENT,
    preserved_red:A16_REVIEW_WAIVER_PRESERVED_RED,
    socket_digest:SOCKET.socket_digest,
    handoff_rules:[MANDATORY_REVIEW,START_FORBIDDEN,HANDOFF_WAIVER],
    dossier_rule:DOSSIER_WAIVER,
    states
  };

  return freeze({
    schema:A16_REVIEW_WAIVER_CONTRADICTION_SCHEMA,
    exact_parent:A16_REVIEW_WAIVER_CONTRADICTION_PARENT,
    preserved_red_parent:A16_REVIEW_WAIVER_PRESERVED_RED,
    status:earned?'A16_WAIVER_EPISTEMIC_SEPARATION_EARNED':'INADMISSIBLE',
    errors:earned?[]:['A16_WAIVER_EPISTEMIC_SEPARATION_NOT_ESTABLISHED'],
    rest_symbol:earned?'𝄐':null,
    separation_digest:digest(subject),
    source_class:'PRE_A16_WAIVER_EPISTEMIC_SEPARATION_ASSAY',
    mandatory_review_wording_present:mandatoryReviewPresent,
    start_before_review_forbidden_wording_present:startForbiddenPresent,
    terminal_handoff_waiver_path_present:handoffWaiverPresent,
    predecessor_dossier_waiver_path_present:dossierWaiverPresent,
    inherited_waiver_path_established:inheritedWaiverPathEstablished,
    prior_global_waiver_path_absence_claim_falsified:inheritedWaiverPathEstablished,
    state_count:states.length,
    local_handoff_tension_count:localTensions.length,
    local_handoff_tension_states:freeze(localTensions),
    waiver_only_state:waiverOnly,
    waiver_can_satisfy_review_entry_coordinate:true,
    waiver_creates_operator_review_record:false,
    waiver_creates_human_observation:false,
    waiver_creates_empirical_evidence:false,
    waiver_opens_full_a16_gate:false,
    governing_pair_names_waiver_principal:waiverPrincipalNamed,
    governing_pair_names_waiver_receipt_schema:waiverReceiptSchemaNamed,
    khonapolit_cross_lineage_waiver_preserves_absence_precedent:khonapolitWaiverPreservesAbsence,
    khonapolit_controls_a16_waiver_semantics:false,
    permission_state_separable_from_evidence_state:true,
    operator_review_recorded:false,
    operator_review_admitted:false,
    explicit_a16_review_waiver_recorded:false,
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
      local_wording_tension_not_global_waiver_absence:true,
      waiver_path_exists_not_waiver_executed:true,
      waiver_not_operator_review:true,
      waiver_not_human_observation:true,
      waiver_not_empirical_evidence:true,
      governance_permission_not_epistemic_satisfaction:true,
      review_coordinate_satisfied_not_full_a16_entry:true,
      waiver_path_not_waiver_principal:true,
      waiver_path_not_waiver_receipt_schema:true,
      cross_lineage_waiver_precedent_not_a16_authority:true,
      descendant_repair_not_red_erasure:true,
      waiver_epistemic_separation_not_western_horizon_successor:true
    }),
    theorem:'THE_A16_CUSTODY_CHAIN_ESTABLISHES_AN_EXPLICIT_WAIVER_PATH_FOR_THE_PRE_A16_OPERATOR_VISUAL_REVIEW_COORDINATE_IN_BOTH_THE_A12_A15_PRODUCTION_CLOSURE_DOSSIER_AND_THE_A16_A19_ENTRY_DECISION_SO_THE_PRIOR_GLOBAL_CONTRADICTION_CLAIM_IS_FALSIFIED; HOWEVER_WAIVER_AND_REVIEW_REMAIN_DISTINCT_STATE_VARIABLES: A_WAIVER_CAN_SATISFY_THE_GOVERNANCE_REVIEW_COORDINATE_WITHOUT_MAKING_OPERATOR_REVIEW_RECORDED_HUMAN_OBSERVATION_PRESENT_OR_EMPIRICAL_EVIDENCE_ACQUIRED, WHILE_THE_GOVERNING_PAIR_NAMES_NEITHER_A_WAIVER_PRINCIPAL_NOR_A_WAIVER_RECEIPT_SCHEMA; THEREFORE_PERMISSION_TO_PROCEED_AND_EPISTEMIC_SATISFACTION_ARE_FORMALLY_SEPARABLE_AND_THE_CURRENT_A16_GATE_REMAINS_CLOSED',
    child_message:'A HUMAN MAY BE ALLOWED TO SKIP THE LOOK. THAT DOES NOT MEAN THE LOOK HAPPENED.'
  });
}

export const A16_REVIEW_WAIVER_CONTRADICTION_CERTIFICATE=runA16ReviewWaiverContradiction();
