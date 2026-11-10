/**
 * EMSTD613 / Vixen · editorial-genre choreography
 *
 * User-supplied first design reference: disciplined reading/navigation
 * Second reference: atmospheric pause and layered couture
 * Third reference: invitational four-route foyer and carry-forward cart.
 *
 * No duplicated Work, Source, Experiment, Human Gate, or Manifest state.
 * This module never receives authorship, laboratory or deployment authority.
 * It interacts with the already-working native Vixen study tray and routes.
 */
export const EDITORIAL_CONTRACT=Object.freeze({
 schema:'emstd613.vixen.editorial-genre/v1',
 candidate_lineage:['REFERENCE_1_RESEARCH_RAIL','REFERENCE_2_SPATIAL_ATMOSPHERE',
  'REFERENCE_3_INVITATION_AND_CART'],
 source_estate:'EMSTD613',
 original_research_runtime:'PRESERVED',
 added_executors:0,
 experiment_b_flight:'HELD',
 automatic_theory_approval:false,
 art_adjudication:'HUMAN_RESERVED'
});
function initialize(){
 const foyer=document.querySelector('.vixen-editorial-foyer');
 const carry=document.getElementById('vixenCarryRail');
 const count=document.getElementById('vixenCarryCount');
 const native=document.getElementById('collectionCount');
 if(!foyer||!carry||!count||!native)return Object.freeze({
  mounted:false,reason:'REQUIRED_CANDIDATE_GENRE_SURFACE_MISSING'
 });
 const doors=Array.from(foyer.querySelectorAll('.vixen-doorways button[data-view]'));
 const targets=doors.map(x=>x.dataset.view);
 const expected=['works','observatory','collection','reference'];
 if(targets.join(',')!==expected.join(','))return Object.freeze({
  mounted:false,reason:'FOUR_SOURCE_ROUTE_CONTRACT_BREACH'
 });
 const valid=new Set(['works','observatory','collection','reference']);
 for(const target of targets){
  const section=document.getElementById('view-'+target);
  if(!valid.has(target)||!section)return Object.freeze({
   mounted:false,reason:'SOURCE_ROUTE_NOT_REGISTERED:'+target
  });
 }
 let frame=0,disposed=false;
 const latest=()=>window.VIXEN_STUDY_TRAY?.list?.();
 const refresh=()=>{
  if(disposed)return;
  const list=latest();
  const value=Array.isArray(list)?list.length:Number(native.textContent)||0;
  const n=Math.max(0,Math.min(999,Math.floor(value)));
  count.textContent=String(n);
  carry.dataset.items=String(n);
  carry.setAttribute('aria-label',n+' source-bound items carried in the current session');
  const selected=window.VIXEN_STUDY_TRAY?.list?.()||[];
  const hasPair=selected.filter(id=>String(id).startsWith('emwork_')).length>=2;
  carry.dataset.pairReady=String(hasPair);
  const verb=carry.querySelector('.vixen-carry-title');
  if(verb)verb.textContent=hasPair?'Compare your Works':'Research cart';
  // This display never assigns a scientific relationship between Works.
  // An actual proposal must be expressly constructed in the Salon.
 };
 const observer=new MutationObserver(refresh);
 observer.observe(native,{subtree:true,childList:true,characterData:true});
 const onTray=()=>refresh();
 window.addEventListener('vixen-study-tray-change',onTray);
 const onPointer=e=>{
  if(frame)return;
  const box=foyer.getBoundingClientRect();
  if(!box.width||!box.height)return;
  const u=Math.max(0,Math.min(1,(e.clientX-box.left)/box.width));
  const v=Math.max(0,Math.min(1,(e.clientY-box.top)/box.height));
  frame=requestAnimationFrame(()=>{
   foyer.style.setProperty('--vf-pointer-x',(u*100).toFixed(2)+'%');
   foyer.style.setProperty('--vf-pointer-y',(v*100).toFixed(2)+'%');
   frame=0;
  });
 };
 const onLeave=()=>{
  if(frame){cancelAnimationFrame(frame);frame=0}
  foyer.style.setProperty('--vf-pointer-x','72%');
  foyer.style.setProperty('--vf-pointer-y','0%');
 };
 foyer.addEventListener('pointermove',onPointer,{passive:true});
 foyer.addEventListener('pointerleave',onLeave,{passive:true});
 refresh();
 const api=Object.freeze({
  mounted:true,doors:targets.slice(),
  getState:()=>Object.freeze({
   source_estate:'EMSTD613',
   doorways:targets.slice(),
   carried_items:Number(count.textContent)||0,
   pair_ready:carry.dataset.pairReady==='true',
   evidence_class:'SESSION_LOCAL_NAVIGATION_ONLY',
   automatically_ratified:false
  }),
  dispose(){
   if(disposed)return;
   disposed=true;
   if(frame)cancelAnimationFrame(frame);
   observer.disconnect();
   window.removeEventListener('vixen-study-tray-change',onTray);
   foyer.removeEventListener('pointermove',onPointer);
   foyer.removeEventListener('pointerleave',onLeave);
  }
 });
 window.VIXEN_EDITORIAL_GENRE=api;
 return api;
}
if(typeof document!=='undefined'){
 const ready=()=>initialize();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
 else ready();
}
