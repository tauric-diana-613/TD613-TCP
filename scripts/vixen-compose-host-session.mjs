/**
 * TD613 RGI19-21 · Host-side Podium Composer session.
 * Not an API or auto-enrolment. Trusted host MUST provide previously enrolled
 * WebAuthn credentials and an externally persistent custody ledger directory.
 * Local proposal PREVIEW only. No corpus/index/deployment writes.
 */
import {createPodiumComposeGate} from '../app/encyclopedia/vixen-estate/podium-compose-gate.mjs';
import {createWebAuthnHumanApprovalVerifier} from './vixen-compose-human-webauthn.mjs';
import {createComposeCustodyLedger} from './vixen-compose-custody-ledger.mjs';

const REV=/^[a-f0-9]{40}$/;
const held=why=>Object.freeze({status:'HELD',reason:why,release_authority:false,corpus_writes:0});
export function createHumanComposeHostSession({
 sourceRevision,ledgerDirectory,registeredCredentials,rpId,allowedOrigins,now=()=>Date.now()
}={}){
 if(!REV.test(sourceRevision||''))throw new Error('HELD_HOST_EXACT_SOURCE_REVISION_REQUIRED');
 const ledger=createComposeCustodyLedger({directory:ledgerDirectory});
 const verifyHumanApproval=createWebAuthnHumanApprovalVerifier({
  rpId,allowedOrigins,credentials:registeredCredentials,
  now,consumeAssertion:info=>ledger.consumeHumanAssertion(info)
 });
 const gate=createPodiumComposeGate({sourceRevision,verifyHumanApproval});
 let score=null;
 async function receipt(type,digest,details){
  const rec=await ledger.append(type,sourceRevision,digest,details);
  if(rec.status!=='RECORDED_INTERNAL')throw new Error('HELD_CUSTODY_RECEIPT_UNAVAILABLE');
  return rec;
 }
 async function stage(materials){
  const result=await gate.stage(materials);
  if(result.state!=='STAGED_FOR_REVIEW')return result;
  try{
   await receipt('SCORE_STAGED',result.score.score_digest,{
    source_set_revision:result.score.source_set_revision,
    computational_score_digest:result.score.computation_score_digest,
    proposed_consequences:result.score.changes,
    before_after_scoped:true,mutation:false
   });
   score=result.score.score_digest;return result;
  }catch(_){gate.invalidate('HELD_LEDGER_STAGE_NOT_DURABLE');score=null;return held('HELD_LEDGER_STAGE_NOT_DURABLE')}
 }
 async function requestCompose(){
  if(!score)return held('HELD_SCORE_REQUIRED');
  const result=await gate.requestCompose({score_digest:score});
  if(result.state!=='HOLD_HUMAN_AUTHORIZATION')return result;
  try{await receipt('COMPOSE_REQUESTED',score,{
   nonce:result.request.nonce,requested_effects:result.request.requested_effects,
   human_approval:'NOT_YET_GRANTED',local_preview_only:true
  });return result}
  catch(_){gate.invalidate('HELD_REQUEST_NOT_DURABLY_RECORDED');score=null;return held('HELD_REQUEST_NOT_DURABLY_RECORDED')}
 }
 async function acceptHumanApproval(proof){
  if(!score)return held('HELD_SCORE_REQUIRED');
  const response=await gate.acceptHumanApproval(proof);
  if(response.state!=='HUMAN_APPROVED_SCOPED')return response;
  try{await receipt('HUMAN_APPROVAL_VERIFIED',score,{
    principal:response.approval.human_principal,
    independent_receipt_id:response.approval.independent_receipt_id,
    nonce:response.approval.nonce,scope:response.approval.scope,
    release_authority:false
  });return response}
  catch(_){gate.invalidate('HELD_HUMAN_APPROVAL_RECEIPT_NOT_DURABLE');score=null;return held('HELD_HUMAN_APPROVAL_RECEIPT_NOT_DURABLE')}
 }
 async function compose(){
  if(!score)return held('HELD_SCORE_REQUIRED');
  const result=gate.compose({score_digest:score});
  if(result.state!=='COMPOSED_PREVIEW_ONLY')return result;
  try{await receipt('COMPOSE_PREVIEW_EMITTED',score,{
    human_receipt_id:result.approval.independent_receipt_id,
    output_ceiling:result.output_ceiling,
    corpus_writes:0,index_writes:0,deployments:0
  });return result}
  catch(_){gate.invalidate('HELD_COMPOSITION_RECEIPT_NOT_DURABLE');score=null;return held('HELD_COMPOSITION_RECEIPT_NOT_DURABLE')}
 }
 async function invalidate(reason){
  const digest=score;score=null;const r=gate.invalidate(reason);
  if(digest)try{await receipt('SCORE_INVALIDATED',digest,{reason})}
   catch(_){return held('HELD_INVALIDATION_NOT_DURABLE')}
  return r;
 }
 return Object.freeze({
  stage,requestCompose,acceptHumanApproval,compose,invalidate,
  inspect:gate.inspect,custodyInspect:ledger.inspect,ledger,
  productionRelease:false,canonicalCorpusWriter:null
 });
}
