/**
 * 𝌋 VIXEN · RGI10 Fox House navigation choreography.
 * Presentation-only observer of the EXISTING native route state.
 *
 * 8 original data-view controls own no independent router, source, Work,
 * Performer, admission state or scientific authority.
 */
import {STAGE_ROLES,assertStageRoleSeparation} from './role-boundary.mjs';

export function mountFoxHouseDock({document:doc=globalThis.document}={}){
 const dock=doc?.getElementById?.('vixenRoomRail');
 if(!dock)return Object.freeze({mounted:false,reason:'NO_SOURCE_NAV'});
 const win=doc.defaultView;
 let queued=false,disposed=false;
 const reduced=()=>Boolean(win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
 const stageBadge=()=>{
  const activeStage=doc.body?.dataset?.activeResearchStage==='OPERAHOUSE'?'OPERAHOUSE':'VIXEN_OPERA';
  const isOperahouse=activeStage==='OPERAHOUSE';
  dock.dataset.stageState=isOperahouse?'OPERAHOUSE_ACTIVE':'VIXEN_OPERA';
  let badge=dock.querySelector('#vixenStageStatusBadge');
  if(!badge){
   badge=doc.createElement('span');
   badge.id='vixenStageStatusBadge';
   badge.className='vixen-stage-pill';
   dock.prepend(badge);
  }
  badge.dataset.stageRole=isOperahouse?STAGE_ROLES.OPERAHOUSE.role:STAGE_ROLES.OPERA.role;
  badge.textContent=isOperahouse?'OPERAHOUSE_ACTIVE · Host Custody':'OPERA · Source-Guided';
  badge.title=isOperahouse
   ?STAGE_ROLES.OPERAHOUSE.kind+' (OPERAHOUSE ≠ OPERA ≠ PERFORMER)'
   :STAGE_ROLES.OPERA.kind+' (OPERAHOUSE ≠ OPERA ≠ PERFORMER)';
 };
 const synchronize=()=>{
  if(disposed)return;
  stageBadge();
  if(!win||win.innerWidth>=960)return;
  const current=dock.querySelector('.vixen-room[aria-current="page"]');
  if(!current)return;
  const left=Math.max(0,current.offsetLeft-(dock.clientWidth-current.clientWidth)/2);
  dock.scrollTo?.({left,behavior:reduced()?'instant':'smooth'});
 };
 const schedule=()=>{
  if(queued||disposed)return;
  queued=true;
  (win.requestAnimationFrame||((cb)=>win.setTimeout(cb,0)))(()=>{queued=false;synchronize()});
 };
 const observer=new win.MutationObserver(records=>{
  if(records.some(r=>r.attributeName==='aria-current'||r.attributeName==='data-active-research-stage'))schedule();
 });
 observer.observe(dock,{subtree:true,attributes:true,attributeFilter:['aria-current']});
 if(doc.body)observer.observe(doc.body,{attributes:true,attributeFilter:['data-active-research-stage','data-view']});
 win.addEventListener('resize',schedule,{passive:true});
 win.addEventListener('hashchange',schedule,{passive:true});
 stageBadge();
 schedule();
 return Object.freeze({
  mounted:true,source_estate:'EMSTD613',
  classification:'PRESENTATION_ONLY_NATIVE_VIEW_OBSERVER',
  getState:()=>Object.freeze({
   active_view:dock.querySelector('.vixen-room[aria-current="page"]')?.dataset.view||null,
   active_stage:doc.body?.dataset?.activeResearchStage==='OPERAHOUSE'?'OPERAHOUSE_ACTIVE':'VIXEN_OPERA',
   stage_role:doc.body?.dataset?.activeResearchStage==='OPERAHOUSE'?STAGE_ROLES.OPERAHOUSE.role:STAGE_ROLES.OPERA.role,
   roles_separated:assertStageRoleSeparation(),
   placement:win.innerWidth>=960?'LEFT_RAIL':'BOTTOM_DOCK',
   mutates_source:false,authorship_transfer:false
  }),
  dispose:()=>{
   disposed=true;observer.disconnect();
   win.removeEventListener('resize',schedule);
   win.removeEventListener('hashchange',schedule)
  }
 });
}
if(typeof document!=='undefined'){
 const instance=mountFoxHouseDock();
 Object.defineProperty(window,'VIXEN_FOX_HOUSE',{value:instance,writable:false,configurable:false});
}
