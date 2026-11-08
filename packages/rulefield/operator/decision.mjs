/**
 * Non-operative human-decision descriptor validation. NO IDENTITY AUTHENTICATION.
 * A self-typed form is a claim/attestation; it cannot authorize action unless
 * independently confirmed by a trusted contemporaneous human interaction.
 */
import {validateDisclosure} from './disclosure.mjs';
const decisions=new Set(['REQUEST_STAGED_SYNTHESIS','REQUEST_REVISION','DEFER','DECLINE','ASK_QUESTIONS']);
export function inspectHumanDecision(candidate,dossier){
 const issues=[];
 if(!validateDisclosure(dossier))issues.push('INVALID_DOSSIER_BINDING');
 if(!candidate||typeof candidate!=='object')issues.push('DECISION_MISSING');
 if(issues.length)return {status:'HELD',issues,action_executed:false,canonical_changed:false};
 const d=candidate;
 if(d.schema!=='td613.rulefield.operator-decision/v1')issues.push('DECISION_SCHEMA_UNKNOWN');
 if(!decisions.has(d.decision))issues.push('DECISION_NOT_SELECTED');
 if(d.packet_id!==dossier.packet_id||d.packet_sha256!==dossier.packet_sha256)issues.push('PACKET_BINDING_MISMATCH');
 if(d.disclosure_sha256!==dossier.disclosure_sha256)issues.push('DOSSIER_BINDING_MISMATCH');
 if(d.baseline_registry_sha256!==dossier.baseline_registry_sha256)issues.push('BASELINE_BINDING_MISMATCH');
 const chosen=d.selected_proposal_ids;
 if(!Array.isArray(chosen)||new Set(chosen).size!==chosen.length||chosen.some(id=>!dossier.proposal_ids.includes(id)))issues.push('SELECTED_PROPOSAL_IDS_INVALID');
 if(d.decision==='REQUEST_STAGED_SYNTHESIS'){
  if(!chosen?.length)issues.push('NO_PROPOSALS_SELECTED');
  if(typeof d.human_statement!=='string'||d.human_statement.trim().length<30)issues.push('HUMAN_INSTRUCTION_NOT_SPECIFIED');
  if(d.scope!=='STAGED_CANDIDATE_ONLY')issues.push('SCOPE_EXCEEDS_STAGING');
  if(d.accepts_unknown_future_patch!==false)issues.push('CANONICAL_PATCH_CANNOT_BE_PREAPPROVED');
 }
 return {schema:'td613.rulefield.operator-decision-check/v1',status:issues.length?'HELD':'READY_FOR_INDEPENDENT_HUMAN_CONFIRMATION',
  issues,decision:d.decision,selected_proposal_ids:chosen||[],
  witnessed_human_identity:false,contemporaneous_human_confirmation_required:true,
  action_executed:false,canonical_changed:false,merge_authority:false,protected_experiment_b:'HELD'};
}