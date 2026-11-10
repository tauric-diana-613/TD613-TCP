/**
 * 𝌋 Vixen ↔ Operahouse exclusive stage law.
 * Research estates remain intact while exactly one operator-facing stage
 * is visible. The common header must identify the ACTIVE stage.
 *
 * This module carries presentation state ONLY: no reference transport,
 * source admission, authorization, source mutation or scientific promotion.
 */
export const VIXEN_STAGE_BOUNDARY_SCHEMA='td613.vixen.exclusive-stage-boundary/v1';
const snapshot=new WeakMap();
const headerOf=doc=>doc.querySelector?.('.site-header')||null;
const lookup=doc=>({
 vixen:doc.getElementById?.('vixenReferenceChamber'),
 operahouse:doc.getElementById?.('operahouseEncounter')
});
function stageReturnControl(doc){
 const head=headerOf(doc),left=head?.querySelector('.header-left');
 if(!left)return null;
 let back=head.querySelector('#operahouseStageReturn');
 if(!back){
   back=doc.createElement('button');
   back.type='button';back.id='operahouseStageReturn';
   back.className='operahouse-stage-return';
   back.textContent='OPERAHOUSE · Independent reading room · Return to Vixen';
   back.setAttribute('aria-label','Leave the Operahouse reading room and return to Vixen Cybernetics');
   left.append(back);
   back.addEventListener('click',()=>setVixenStage('VIXEN',{document:doc}));
 }
 return back;
}
export function setVixenStage(which,{document:doc=globalThis.document,focus=true}={}){
 if(which!=='VIXEN'&&which!=='OPERAHOUSE')throw new TypeError('INVALID_RESEARCH_STAGE');
 if(!doc?.body)return Object.freeze({changed:false,reason:'NO_DOCUMENT'});
 const {vixen,operahouse}=lookup(doc);
 if(!vixen||!operahouse)return Object.freeze({changed:false,reason:'STAGE_MISSING'});
 const entering=which==='OPERAHOUSE';
 // Inaccessible hidden stages must never be treated as current performances.
 vixen.hidden=entering;
 operahouse.hidden=!entering;
 if(!snapshot.has(doc))snapshot.set(doc,{title:doc.title||''});
 doc.body.dataset.activeResearchStage=which;
 const back=stageReturnControl(doc);
 if(back)back.hidden=!entering;
 doc.title=entering?'Operahouse · Independent Reading Room · TD613':snapshot.get(doc).title;
 const win=doc.defaultView;
 if(win&&typeof win.scrollTo==='function'){
   try{win.scrollTo({top:0,behavior:'instant'})}catch(_){}
 }
 if(focus){
   const target=entering?operahouse.querySelector('.oh-title'):vixen.querySelector('.vxe-heading h1');
   if(target&&typeof target.focus==='function'){
     target.setAttribute('tabindex','-1');
     try{target.focus({preventScroll:true})}catch(_){}
   }
 }
 return Object.freeze({
  changed:true,active:which,roles_separated:true,
  visible_stage:entering?'OPERAHOUSE':'VIXEN_OPERA',
  source_relation:'UNMODIFIED',human_closure:'RESERVED'
 });
}
