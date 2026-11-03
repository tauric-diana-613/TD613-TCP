/**
 * PE08 preflight decision schema guard. Non-generative, source-free.
 * Verifies the 20 decision blanks cannot be mistaken for executed authority.
 */
export const REQUIRED_DECISIONS=Object.freeze(Array.from({length:20},(_,i)=>'D'+String(i+1).padStart(2,'0')));
const fail=s=>{throw Object.assign(new Error(s),{code:s})};
const need=(x,s)=>{if(!x)fail(s)};
export function inspectPreflightDecisionPacket(packet){
 need(packet?.schema==='td613.pe08.preflight-operator-decision-packet/v1'&&packet.docket==='PEFB-20261103-v1'&&
  packet.authorization_scope==='ENGINEERING_ONLY_SOURCE_FREE'&&packet.decision_state==='PREVIEW_UNRESOLVED' &&
  packet.protected_archive_admitted===false&&packet.provider_inference_commissioned===false&&
  packet.flight_activated===false&&packet.final_grant_issued===false,'PE08_PREMATURE_FLIGHT_AUTHORITY');
 need(Array.isArray(packet.decisions)&&packet.decisions.length===20,'PE08_DECISION_COUNT');
 const got=new Set();
 for(const row of packet.decisions){
  need(row&&REQUIRED_DECISIONS.includes(row.id)&&!got.has(row.id)&&row.status==='UNRESOLVED'&&
    row.operator_choice===null&&row.source_receipt===null&&row.independent_witness===null&&row.waiver===null&&
    typeof row.subject==='string'&&typeof row.needed_witness==='string',
    'PE08_FORGED_OR_DUPLICATED_DECISION');
  got.add(row.id);
 }
 need(REQUIRED_DECISIONS.every(x=>got.has(x)),'PE08_INCOMPLETE_DECISION_SET');
 need(Array.isArray(packet.historical_token_budgets)&&
   packet.historical_token_budgets[0]===60000&&packet.historical_token_budgets[1]===180000 &&
   packet.proposed_unadopted_budget_options.includes(720000),'PE08_BUDGET_HISTORY_MISSING');
 return Object.freeze({status:'FREEZE_PACKET_SCHEMA_CONFORMANT_SOURCE_FREE',
  unresolved:20,decisions:[...REQUIRED_DECISIONS],
  approved:0,external_witnesses:0,provider_identity_attested:false,
  independent_evaluator_provisioned:false,final_execution_authorized:false,
  next_action:'EXPLICIT_OPERATOR_D01_D20_DECISIONS_AND_NEW_WITNESSES_REQUIRED'});
}
