/**
 * TD613 Podium Compose gate / v1.
 * Bot-only machine route -> immutable Score -> HOLD -> independent human
 * approval -> bounded composition PREVIEW. Approval never comes from task JSON.
 * No corpus, index, PR, deployment, or release mutations are performed here.
 */
export const COMPOSE_GATE_SCHEMA='td613.vixen.podium.compose-gate/v1';
export const COMPOSE_STATES=Object.freeze({
 EMPTY:'EMPTY',STAGED:'STAGED_FOR_REVIEW',AWAITING:'HOLD_HUMAN_AUTHORIZATION',
 APPROVED:'HUMAN_APPROVED_SCOPED',COMPOSED:'COMPOSED_PREVIEW_ONLY'
});
export const CONSEQUENCES=Object.freeze([
 'CORPUS_ADD','CORPUS_EXCLUDE','CORPUS_REPLACE','CORPUS_RECLASSIFY',
 'INDEX_REBUILD','SYNTHESIS_PRESENTATION','VISUAL_FORM_CHANGE'
]);
const SHA=/^[0-9a-f]{64}$/;
const REV=/^[0-9a-f]{40}$/;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const bounded=(s,n=280)=>typeof s==='string'?s.trim().slice(0,n):'';
const clone=x=>JSON.parse(JSON.stringify(x));
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(plain(value))return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
async function digest(data){
 if(!globalThis.crypto?.subtle)throw Error('HELD_CRYPTOGRAPHIC_DIGEST_UNAVAILABLE');
 const bytes=new TextEncoder().encode(JSON.stringify(canonical(data)));
 const hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function verifyNativeComputationalScore(score,revision){
 if(!plain(score)||score.schema!=='td613.vixen.podium.composer-score/v1'||
    score.score_scope!=='USER_SUBMITTED_SYNTHESIS_NOT_DEVELOPER_EDIT'||
    score.source_revision_declared!==revision||!SHA.test(score.score_sha256||''))
  return 'COMPUTATIONAL_SCORE_IDENTITY_REQUIRED';
 const copy=clone(score);
 const original=copy.score_sha256;
 delete copy.score_sha256;
 delete copy.human_readable_score;
 if(!globalThis.crypto?.subtle)return 'CRYPTOGRAPHIC_VERIFIER_UNAVAILABLE';
 const bytes=new TextEncoder().encode(JSON.stringify(copy));
 const hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);
 const actual=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
 return actual===original?null:'COMPUTATIONAL_SCORE_DIGEST_INVALID';
}
function consequenceMatch(changes,score){
 const problems=[];
 const expected=score.source_census?.source_changes;
 if(!Array.isArray(expected))return ['COMPUTATIONAL_SOURCE_CENSUS_REQUIRED'];
 const kind={ADMIT:'CORPUS_ADD',EXCLUDE:'CORPUS_EXCLUDE',REPLACE:'CORPUS_REPLACE',RECLASSIFY:'CORPUS_RECLASSIFY'};
 const supplied=changes.filter(c=>typeof c?.type==='string'&&c.type.startsWith('CORPUS_'));
 const seen=new Set();
 for(const item of expected){
  const key=kind[item.action]+'|'+item.source_file_id;
  if(seen.has(key))problems.push('DUPLICATE_COMPUTED_SOURCE_ACTION');
  seen.add(key);
  if(!supplied.some(c=>c.type===kind[item.action]&&c.source_ids?.length===1&&
     c.source_ids[0]===item.source_file_id))
   problems.push('UNSTAGED_COMPUTED_CORPUS_CONSEQUENCE:'+key);
 }
 for(const item of supplied){
  const key=item.type+'|'+(item.source_ids?.length===1?item.source_ids[0]:'INVALID_MULTISOURCE');
  if(!seen.has(key))problems.push('UNSCORED_CORPUS_CONSEQUENCE:'+key);
 }
 const selected=score.visuals?.selected;
 if(selected?.kind==='OPEN_FORM_PROPOSAL'){
  if(!changes.some(c=>c.type==='VISUAL_FORM_CHANGE'&&c.visual?.form_id===selected.id))
   problems.push('UNSTAGED_COMPUTED_VISUAL_FORM:'+selected.id);
 }
 for(const item of changes.filter(c=>c.type==='VISUAL_FORM_CHANGE')){
  if(item.visual?.form_id!==selected?.id)
   problems.push('UNSCORED_VISUAL_FORM:'+String(item.visual?.form_id));
 }
 return problems;
}
function nonce(){
 if(!globalThis.crypto?.getRandomValues)throw Error('HELD_CRYPTOGRAPHIC_NONCE_UNAVAILABLE');
 const bytes=new Uint8Array(24);globalThis.crypto.getRandomValues(bytes);
 return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const fail=(state,details=[])=>Object.freeze({schema:COMPOSE_GATE_SCHEMA,status:'HELD',state,requirements:details,release_authority:false,scientific_promotion_authority:false});
function checkChange(change,i){
 const problems=[];
 if(!plain(change))return ['CHANGES_'+i+'_NOT_OBJECT'];
 if(!CONSEQUENCES.includes(change.type))problems.push('CHANGES_'+i+'_UNKNOWN_TYPE');
 if(!bounded(change.description,600))problems.push('CHANGES_'+i+'_DESCRIPTION_REQUIRED');
 if(!Array.isArray(change.source_ids)||!change.source_ids.length||change.source_ids.some(id=>!bounded(id,160)))problems.push('CHANGES_'+i+'_EXACT_SOURCE_IDS_REQUIRED');
 if(!plain(change.before)||!plain(change.after))problems.push('CHANGES_'+i+'_BEFORE_AFTER_REQUIRED');
 if(!plain(change.effects)||!plain(change.effects.corpus_census)||!plain(change.effects.search_index))
  problems.push('CHANGES_'+i+'_CENSUS_AND_SEARCH_IMPACT_REQUIRED');
 if(!plain(change.rollback)||!bounded(change.rollback.method,500)||!bounded(change.rollback.predecessor_ref,180))
  problems.push('CHANGES_'+i+'_REVERSIBILITY_OR_HOLD_REQUIRED');
 if(!Array.isArray(change.evidence)||!change.evidence.length||
    change.evidence.some(e=>!plain(e)||!bounded(e.source_id,160)||!bounded(e.locator,280)||!bounded(e.claim,500)))
  problems.push('CHANGES_'+i+'_SOURCE_LOCATED_EVIDENCE_REQUIRED');
 if(change.type==='VISUAL_FORM_CHANGE'&&(!plain(change.visual)||!bounded(change.visual.form_id,80)||
    !bounded(change.visual.data_contract,150)||!bounded(change.visual.previous_form_id,80)))
  problems.push('CHANGES_'+i+'_VISUAL_FORM_DIFF_REQUIRED');
 return problems;
}
export function createPodiumComposeGate({sourceRevision='UNVERIFIED',verifyHumanApproval=null}={}){
 // The verifier is an independent host capability. An AI task cannot supply it.
 const state={score:null,request:null,approval:null,composed:false,seq:0};
 const copyScore=()=>state.score?clone(state.score):null;
 async function stage(materials={}){
  if(!plain(materials)||!Array.isArray(materials.changes)||!materials.changes.length||materials.changes.length>24)
   return fail('HELD_COMPOSITION_CHANGES_REQUIRED',['1–24 exact proposed changes']);
  const missing=materials.changes.flatMap((c,i)=>checkChange(c,i));
  const computed=materials.computed_score;
  const computedError=await verifyNativeComputationalScore(computed,sourceRevision);
  if(computedError)missing.push(computedError);
  if(!SHA.test(materials.computation_score_digest||'')||
    materials.computation_score_digest!==computed?.score_sha256)
   missing.push('COMPUTATIONAL_SCORE_DIGEST_BINDING_REQUIRED');
  if(!computedError)missing.push(...consequenceMatch(materials.changes,computed));
  if(!bounded(materials.question,700))missing.push('QUESTION_REQUIRED');
  if(!bounded(materials.operator_boundary,350))missing.push('OPERATOR_BOUNDARY_REQUIRED');
  if(!bounded(materials.source_set_revision,90))missing.push('SOURCE_SET_REVISION_REQUIRED');
  if(!REV.test(sourceRevision))missing.push('EXACT_40_HEX_GIT_REVISION_REQUIRED');
  if(missing.length)return fail('HELD_SCORE_INCOMPLETE',missing);
  const record={
   schema:'td613.vixen.podium.composition-score/v1',version:1,
   source_revision:sourceRevision,source_set_revision:bounded(materials.source_set_revision,90),
   question:bounded(materials.question,700),operator_boundary:bounded(materials.operator_boundary,350),
   changes:clone(materials.changes),
   computation_score_digest:computed.score_sha256,
   computational_score:clone(computed),
   requested_scope:'LOCAL_RESEARCH_COMPOSITION_PREVIEW',
   corpus_admission_authority:false,scientific_promotion_authority:false,
   experiment_b_flight:'HELD',release_authority:false
  };
  const score_digest=await digest(record);
  state.score=Object.freeze({...record,score_digest});
  state.request=null;state.approval=null;state.composed=false;state.seq++;
  return Object.freeze({schema:COMPOSE_GATE_SCHEMA,status:'HELD',state:COMPOSE_STATES.STAGED,
   score:copyScore(),needs:'EXPLICIT_INDEPENDENT_HUMAN_AUTHORIZATION',release_authority:false});
 }
 function invalidate(reason='COMPUTATIONAL_SCORE_CHANGED'){
  const previous=state.score?.score_digest||null;
  state.score=null;state.request=null;state.approval=null;state.composed=false;state.seq++;
  return Object.freeze({schema:COMPOSE_GATE_SCHEMA,status:'HELD',
   state:'HELD_PREVIOUS_COMPOSITION_INVALIDATED',reason,previous_digest:previous,
   release_authority:false,scientific_promotion_authority:false});
 }
 function inspect(){
  return Object.freeze({schema:COMPOSE_GATE_SCHEMA,status:'HELD',
   state:state.composed?COMPOSE_STATES.COMPOSED:state.approval?COMPOSE_STATES.APPROVED:state.request?COMPOSE_STATES.AWAITING:state.score?COMPOSE_STATES.STAGED:COMPOSE_STATES.EMPTY,
   score:copyScore(),request:state.request?clone(state.request):null,
   approval:state.approval?clone(state.approval):null,
   scientific_promotion_authority:false,release_authority:false});
 }
 async function requestCompose({score_digest=null}={}){
  if(!state.score)return fail('HELD_SCORE_REQUIRED');
  if(score_digest!==state.score.score_digest)return fail('HELD_SCORE_DIGEST_MISMATCH');
  // Repeated requests preserve nonce while the proposal stays unchanged.
  if(!state.request)state.request=Object.freeze({
   schema:'td613.vixen.podium.human-request/v1',
   score_digest:state.score.score_digest,source_revision:sourceRevision,
   nonce:nonce(),created_at_ms:Date.now(),approval_scope:'LOCAL_RESEARCH_COMPOSITION_PREVIEW',
   requested_effects:state.score.changes.map(c=>({type:c.type,source_ids:c.source_ids})),
   complete_score:copyScore(),human_closure:'REQUESTED_NOT_GRANTED'
  });
  return Object.freeze({schema:COMPOSE_GATE_SCHEMA,status:'HELD',state:COMPOSE_STATES.AWAITING,
   request:clone(state.request),action:'STOP_AND_ASK_HUMAN_TO_REVIEW_EXACT_SCORE',
   machine_button:'Compose',human_authorization_required:true,release_authority:false});
 }
 async function acceptHumanApproval(opaqueHostProof){
  if(!state.request)return fail('HELD_HUMAN_REQUEST_REQUIRED');
  if(typeof verifyHumanApproval!=='function')return fail('HELD_NO_INDEPENDENT_HUMAN_VERIFIER');
  // Host MUST authenticate a separately present human; task booleans are ignored.
  let attestation;
  try{attestation=await verifyHumanApproval({
   challenge:clone(state.request),proof:opaqueHostProof,score:copyScore()
  });}catch(_){return fail('HELD_HUMAN_VERIFIER_REFUSED')}
  if(!plain(attestation)||attestation.authenticated_human!==true||
     attestation.score_digest!==state.score.score_digest||
     attestation.nonce!==state.request.nonce||
     attestation.source_revision!==sourceRevision||
     attestation.scope!=='LOCAL_RESEARCH_COMPOSITION_PREVIEW'||
     !bounded(attestation.human_principal,160)||
     !bounded(attestation.independent_receipt_id,180))
   return fail('HELD_INDEPENDENT_APPROVAL_INVALID');
  state.approval=Object.freeze({
   human_principal:bounded(attestation.human_principal,160),
   independent_receipt_id:bounded(attestation.independent_receipt_id,180),
   score_digest:attestation.score_digest,nonce:attestation.nonce,
   source_revision:sourceRevision,scope:attestation.scope,
   authorization_kind:'HOST_VERIFIED_SEPARATE_HUMAN'
  });
  return Object.freeze({schema:COMPOSE_GATE_SCHEMA,status:'HELD',
   state:COMPOSE_STATES.APPROVED,approval:clone(state.approval),
   release_authority:false,scientific_promotion_authority:false});
 }
 function compose({score_digest=null}={}){
  if(!state.score||!state.approval||state.composed)return fail('HELD_HUMAN_APPROVAL_REQUIRED_OR_CONSUMED');
  if(score_digest!==state.score.score_digest)return fail('HELD_SCORE_DIGEST_MISMATCH');
  if(state.approval.score_digest!==score_digest||state.approval.source_revision!==sourceRevision)
   return fail('HELD_AUTHORIZATION_STALE');
  state.composed=true;
  return Object.freeze({
   schema:COMPOSE_GATE_SCHEMA,status:'SUPPORTED',state:COMPOSE_STATES.COMPOSED,
   composition:copyScore(),approval:clone(state.approval),
   output_ceiling:'LOCAL_PROPOSAL_PREVIEW_ONLY_NOT_CORPUS_OR_WEB_RELEASE',
   approved_visual_candidates:state.score.changes.filter(c=>c.type==='VISUAL_FORM_CHANGE').map(c=>clone(c.visual)),
   corpus_writes:0,index_writes:0,deployments:0,release_authority:false
  });
 }
 return Object.freeze({stage,inspect,invalidate,requestCompose,acceptHumanApproval,compose});
}
