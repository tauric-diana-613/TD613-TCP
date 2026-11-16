/**
 * RGI23 · Composer Redpen / formal decision-review exchange.
 * Industry ALIGNED (not certification): W3C Web Annotation body/target/
 * assessing, W3C PROV-inspired provenance, RFC 6902-style test precondition.
 * This is not an RFC6902 executable patch or an independently authenticated
 * human signature. Review is separate from the host-side WebAuthn Compose key.
 */
export const REDPEN_SCHEMA='td613.vixen.podium.redpen-review/v1';
export const REDPEN_RETURN_SCHEMA='td613.vixen.podium.redpen-return/v1';
export const REDPEN_ACTIONS=Object.freeze([
 'APPROVE','DENY','AMEND','HOLD','REQUEST_ALTERNATIVE','REQUEST_EVIDENCE'
]);
const HEX=/^[a-f0-9]{64}$/,REV=/^[a-f0-9]{40}$/;
const is=o=>o&&typeof o==='object'&&!Array.isArray(o);
const limited=(s,n=2000)=>typeof s==='string'?s.trim().slice(0,n):'';
const held=(reason,extra={})=>Object.freeze({
 schema:REDPEN_RETURN_SCHEMA,status:'HELD',reason,release_authority:false,...extra
});
const copy=o=>JSON.parse(JSON.stringify(o));
function assertScore(score){
 if(!is(score)||score.schema!=='td613.vixen.podium.composer-score/v1'||
  !HEX.test(score.score_sha256||'')||!REV.test(score.source_revision_declared||'')||
  !Array.isArray(score.proposed_changes)||score.proposed_changes.length>60||
  !score.proposed_changes.length||
  new Set(score.proposed_changes.map(c=>c.id)).size!==score.proposed_changes.length)
  throw new TypeError('HELD_EXACT_IMMUTABLE_NATIVE_SCORE_REQUIRED');
}
const isVisual=score=>score.visuals?.selected?.kind==='OPEN_FORM_PROPOSAL'||
 score.proposed_changes.some(c=>c.area==='VISUAL_ARTIFACT_CHANGE');
export function buildRedpenPacket(score){
 assertScore(score);
 const chosen=score.visuals?.selected||null;
 const alternatives=Array.isArray(score.visuals?.alternatives)?score.visuals.alternatives:[];
 return Object.freeze({
  schema:REDPEN_SCHEMA,score_sha256:score.score_sha256,
  source_revision:score.source_revision_declared,
  status:'STOP_FOR_HUMAN_REVIEW',decision_owner:'INDEPENDENT_HUMAN_COMPOSER',
  scientific_closure:false,approved:false,release_authority:false,
  standards_alignment:{
   annotations:'W3C_WEB_ANNOTATION_MODEL_ASSESSING_TARGET_BODY_INSPIRED',
   provenance:'W3C_PROV_O_RELATIONS_INSPIRED',
   change_preconditions:'RFC6902_TEST_SEMANTICS_INSPIRED_NON_EXECUTABLE',
   official_third_party_certification:false
  },
  prov:{entity:'sha256:'+score.score_sha256,wasDerivedFrom:'git:'+score.source_revision_declared,
   attribution:'PODIUM_MACHINE_SCORE_NOT_OPERATOR_SIGN_OFF'},
  preconditions:[{op:'test',path:'/score_sha256',value:score.score_sha256},
   {op:'test',path:'/source_revision_declared',value:score.source_revision_declared}],
  source_census:copy(score.source_census),question:score.synthesis?.operator_question||null,
  scoring:{selected:copy(score.synthesis?.selected||null),
   alternatives:copy(score.synthesis?.alternatives||[]),weights:copy(score.synthesis?.weights||null),
   visual_selected:copy(chosen),visual_alternatives:copy(alternatives),
   visual_ranked:copy(score.visuals?.open_form_protocol?.proposed||[]),
   warnings:['HEURISTIC_FIT_IS_NOT_EMPIRICAL_CONFIRMATION',
    'CANDIDATE_RENDERER_REQUIRES_INDEPENDENT_REVIEW']},
  decisions:score.proposed_changes.map((c,i)=>({
    decision_id:c.id,index:i+1,area:c.area,status:c.state,
    proposed_title:c.title,reason:c.justification,
    evidence_refs:copy(c.evidence_refs||[]),original_state:copy(c.before||null),
    proposed_state:copy(c.after||null),action:'UNDECIDED',comment:'',
    reselect_candidate_id:null
  })),
  visual_review_required:isVisual(score),
  visual_review_attachment:isVisual(score)?'REQUIRED_NATIVE_EXACT_RENDERER_DIFF':'OMITTED_NO_VISUAL_SUBSTITUTION',
  submission_paths:['REDPEN_JSON_RETURN','IN_CHAT_DECISION_RETURN'],
  compose_challenge:'NOT_GRANTED',
  editable_file_format:'application/json',human_closure:'RESERVED'
 });
}
export function makeBlankRedpenReturn(packet,{transport='REDPEN_JSON_RETURN'}={}){
 if(packet?.schema!==REDPEN_SCHEMA)throw new TypeError('HELD_PACKET_REQUIRED');
 if(!['REDPEN_JSON_RETURN','IN_CHAT_DECISION_RETURN'].includes(transport))
  throw new TypeError('HELD_UNKNOWN_REVIEW_TRANSPORT');
 return {
  schema:REDPEN_RETURN_SCHEMA,score_sha256:packet.score_sha256,
  source_revision:packet.source_revision,transport,overall_comment:'',
  dispositions:packet.decisions.map(d=>({
   decision_id:d.decision_id,action:'UNDECIDED',comment:'',reselect_candidate_id:null
  })),
  understood:'REVIEW_IS_NOT_COMPOSE_AUTHORIZATION',
  authenticated_human:false
 };
}
export function adjudicateRedpenReturn(packet,submission){
 if(packet?.schema!==REDPEN_SCHEMA||!HEX.test(packet.score_sha256||'')||
  submission?.schema!==REDPEN_RETURN_SCHEMA)
  return held('HELD_PACKET_OR_REVIEW_SCHEMA_MISMATCH');
 if(submission.score_sha256!==packet.score_sha256||
    submission.source_revision!==packet.source_revision)
  return held('HELD_STALE_SCORE_OR_SOURCE_REVISION');
 if(!['REDPEN_JSON_RETURN','IN_CHAT_DECISION_RETURN'].includes(submission.transport)||
  submission.authenticated_human!==false)
  return held('HELD_REVIEW_TRANSPORT_CANNOT_AUTHENTICATE_OPERATOR');
 if(!Array.isArray(submission.dispositions)||
  submission.dispositions.length!==packet.decisions.length||
  submission.understood!=='REVIEW_IS_NOT_COMPOSE_AUTHORIZATION')
  return held('HELD_INCOMPLETE_REVIEW');
 const permitted=new Map(packet.decisions.map(x=>[x.decision_id,x]));
 const seen=new Set(),resolved=[];
 for(const d of submission.dispositions){
  if(!is(d)||!permitted.has(d.decision_id)||seen.has(d.decision_id)||
   !REDPEN_ACTIONS.includes(d.action))
   return held('HELD_INVALID_DUPLICATE_OR_UNDECIDED_DISPOSITION');
  seen.add(d.decision_id);
  const comment=limited(d.comment,3000);
  if(d.action!=='APPROVE'&&!comment)
   return held('HELD_NONAPPROVAL_COMMENT_REQUIRED',{decision_id:d.decision_id});
  if(d.action==='REQUEST_ALTERNATIVE'&&
   (!limited(d.reselect_candidate_id,120)||
    !packet.scoring.visual_alternatives.some(x=>x.id===d.reselect_candidate_id)))
   return held('HELD_ALTERNATIVE_NOT_IN_SCORE',{decision_id:d.decision_id});
  resolved.push({decision_id:d.decision_id,action:d.action,comment,
   reselect_candidate_id:d.action==='REQUEST_ALTERNATIVE'?d.reselect_candidate_id:null});
 }
 const allApproved=resolved.every(x=>x.action==='APPROVE');
 const annotations=resolved.map(x=>({
  type:'Annotation',motivation:'assessing',
  target:{source:'urn:sha256:'+packet.score_sha256,
   selector:{type:'JsonPointerSelector',value:'/decisions/'+(permitted.get(x.decision_id).index-1)}},
  body:{type:'TextualBody',value:x.comment||x.action},
  disposition:x.action
 }));
 return Object.freeze({
  schema:REDPEN_RETURN_SCHEMA,status:allApproved?'REVIEW_READY_FOR_INDEPENDENT_AUTHENTICATION':'HELD_REVISE_OR_REJECT',
  score_sha256:packet.score_sha256,source_revision:packet.source_revision,
  transport:submission.transport,dispositions:resolved,annotations,
  overall_comment:limited(submission.overall_comment,4000),
  next_action:allApproved?'REQUEST_HOST_SIDE_WEBAUTHN_CHALLENGE':
   'REGENERATE_OR_HOLD_COMPUTATIONAL_SCORE',
  human_authentication_completed:false,compose_authority:false,
  release_authority:false,canonical_writes:0
 });
}
export function buildInChatRedpenControls(packet){
 if(packet?.schema!==REDPEN_SCHEMA)throw new TypeError('HELD_PACKET_REQUIRED');
 return Object.freeze({
  schema:'td613.vixen.podium.chat-review-contract/v1',
  score_sha256:packet.score_sha256,source_revision:packet.source_revision,
  controls:packet.decisions.map(x=>({id:x.decision_id,label:x.proposed_title,
   options:[...REDPEN_ACTIONS],comment_required_for_nonapproval:true})),
  permitted_action:'REVIEW_RETURN_ONLY',
  host_action:'NO_AUTOMATIC_USER_AUTHORIZATION',
  result_schema:REDPEN_RETURN_SCHEMA
 });
}
