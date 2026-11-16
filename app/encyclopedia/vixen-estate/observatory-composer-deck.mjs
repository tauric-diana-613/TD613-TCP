/**
 * TD613 · live Observatory Composer deck.
 * This is an ephemeral, reversible preview layer, never a corpus/release writer.
 * It consumes only an independently host-verified, exact-Score Compose receipt
 * and uses the preexisting Foundry frame cadence (no private RAF).
 */
import {createReviewedVisualFormHost,extractApprovedVisual}
 from './observatory-compose-preview.mjs';

export const COMPOSER_DECK_SCHEMA='td613.vixen.observatory.composer-deck/v1';
const SHA=/^[a-f0-9]{64}$/;
const refusal=(reason)=>Object.freeze({
 schema:COMPOSER_DECK_SCHEMA,status:'HELD',reason,
 preview_only:true,canonical_mutation:false,release_authority:false
});
const sameIds=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&
 a.length===b.length&&a.slice().sort().every((x,i)=>x===b.slice().sort()[i]);

export function createObservatoryComposerDeck({
 canvas,verifyHumanReceipt=null,isScoreCurrent=null,reviewedRenderers=[]
}={}){
 if(!canvas||typeof canvas.getContext!=='function')
  throw new TypeError('HELD_PREVIEW_CANVAS_REQUIRED');
 const visualHost=createReviewedVisualFormHost({verifyHumanReceipt,reviewedRenderers});
 let active=null,painting=false,epoch=0,frameCount=0,lastPaint=null;
 canvas.hidden=true;
 const inspect=()=>Object.freeze({
  schema:COMPOSER_DECK_SCHEMA,status:active?'PREVIEW_READY':'HELD',
  current_form_id:active?.form_id||null,target_lab_id:active?.lab_id||null,
  score_digest:active?.score_digest||null,frame_count:frameCount,
  original_exhibit_preserved:true,canonical_mutation:false,
  host_clock_only:true,release_authority:false
 });
 function revert(reason='OPERATOR_REVERT'){
  epoch++;active=null;painting=false;frameCount=0;lastPaint=null;
  canvas.hidden=true;canvas.style.visibility='';
  const ctx=canvas.getContext('2d');
  if(ctx&&typeof ctx.clearRect==='function')ctx.clearRect(0,0,canvas.width,canvas.height);
  return refusal(reason);
 }
 async function current(score_digest,source_revision){
  if(typeof isScoreCurrent!=='function')return false;
  try{return (await isScoreCurrent({score_digest,source_revision}))===true}
  catch(_){return false}
 }
 function verifyBinding(composeReceipt,lab_id,current_form_id){
  const selected=extractApprovedVisual(composeReceipt);
  if(!selected||!SHA.test(selected.score_digest||''))return null;
  const changes=composeReceipt?.composition?.changes;
  const candidate=composeReceipt?.composition?.computational_score?.visuals?.selected;
  if(!Array.isArray(changes)||changes.filter(c=>c?.type==='VISUAL_FORM_CHANGE').length!==1)
   return null;
  const change=changes.find(c=>c.type==='VISUAL_FORM_CHANGE');
  if(change.visual?.form_id!==selected.form_id||
     change.visual?.replaces_lab_id!==lab_id||
     change.visual?.previous_form_id!==current_form_id)return null;
  if(candidate?.id!==selected.form_id||
     candidate?.linked_lab_id!==lab_id||
     candidate?.previous_form_id!==current_form_id||
     !sameIds(change.source_ids,candidate.source_refs)||
     !sameIds(change.source_ids.slice(0,2),selected.source_ids))return null;
  if(composeReceipt.approval?.score_digest!==selected.score_digest||
     composeReceipt.composition?.source_revision!==composeReceipt.approval?.source_revision)
   return null;
  return selected;
 }
 async function stage({composeReceipt,lab_id,current_form_id,frame={}}={}){
  // Explicit target: an old holonomy (or any other exhibit) never serves as
  // a silent fallback for a new mathematical geometry.
  const binding=verifyBinding(composeReceipt,lab_id,current_form_id);
  if(!binding)return refusal('HELD_EXACT_COMPOSER_SCORE_LAB_SOURCE_AND_ROLLBACK_BINDING');
  if(typeof verifyHumanReceipt!=='function')
   return refusal('HELD_INDEPENDENT_HUMAN_VERIFIER_NOT_CONNECTED');
  if(!await current(binding.score_digest,composeReceipt.composition.source_revision))
   return refusal('HELD_SCORE_STALE_OR_CURRENT_SCORE_HOST_UNAVAILABLE');
  const revision=++epoch;
  canvas.hidden=false;
  canvas.style.visibility='hidden'; // measure actual host dimensions before first paint
  let verdict;
  try{verdict=await visualHost.paintAuthorized(canvas,{composeReceipt,formOptions:frame});}
  catch(_){canvas.hidden=true;canvas.style.visibility='';return refusal('HELD_RENDERER_EXCEPTION')}
  if(revision!==epoch)return refusal('HELD_CONCURRENT_COMPOSER_REVISION');
  if(verdict.status!=='SUPPORTED_PREVIEW_ONLY'){
   canvas.hidden=true;canvas.style.visibility='';
   return refusal(verdict.status);
  }
  active={composeReceipt,lab_id,form_id:binding.form_id,
   score_digest:binding.score_digest,source_revision:composeReceipt.composition.source_revision};
  canvas.hidden=false;canvas.style.visibility='visible';frameCount=1;lastPaint=verdict;
  return Object.freeze({...inspect(),status:'SUPPORTED_PREVIEW_ONLY',
   renderer:verdict.review_receipt_id||'EXISTING_REVIEWED_PAINT_PATH',
   human_verification:'INDEPENDENT_HOST_CALLBACK',
   no_corpus_or_canonical_scene_write:true});
 }
 async function paint({lab_id,frame={}}={}){
  if(!active||active.lab_id!==lab_id){
   canvas.hidden=true;
   return refusal('HELD_NO_PREVIEW_FOR_SELECTED_LAB');
  }
  if(painting)return refusal('HELD_PREVIEW_FRAME_IN_FLIGHT');
  painting=true;
  const e=epoch,scope=active;
  try{
   if(!await current(scope.score_digest,scope.source_revision)){
    if(e===epoch)revert('HELD_CURRENT_SCORE_REVOKED');
    return refusal('HELD_CURRENT_SCORE_REVOKED');
   }
   const result=await visualHost.paintAuthorized(canvas,{
    composeReceipt:scope.composeReceipt,formOptions:frame
   });
   if(e!==epoch||active!==scope)return refusal('HELD_PREVIEW_REPLACED_DURING_FRAME');
   if(result.status!=='SUPPORTED_PREVIEW_ONLY'){
    revert('HELD_RENDERER_OR_HOST_APPROVAL_REVOKED');
    return refusal(result.status);
   }
   frameCount++;lastPaint=result;canvas.hidden=false;
   return Object.freeze({schema:COMPOSER_DECK_SCHEMA,status:'SUPPORTED_PREVIEW_ONLY',
    form_id:scope.form_id,target_lab_id:scope.lab_id,host_clock_only:true,
    frame_count:frameCount,source_mutation:false,release_authority:false});
  }catch(_){
   if(e===epoch)revert('HELD_RENDERER_EXCEPTION');
   return refusal('HELD_RENDERER_EXCEPTION');
  }finally{painting=false}
 }
 return Object.freeze({stage,paint,revert,inspect,available:visualHost.available});
}
