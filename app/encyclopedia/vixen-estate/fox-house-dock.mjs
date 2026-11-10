/**
 * 𝌋 VIXEN · RGI10 Fox House navigation choreography.
 * Presentation-only observer of the EXISTING native route state.
 *
 * 8 original data-view controls own no independent router, source, Work,
 * Performer, admission state or scientific authority.
 */
export function mountFoxHouseDock({document:doc=globalThis.document}={}){
 const dock=doc?.getElementById?.('vixenRoomRail');
 if(!dock)return Object.freeze({mounted:false,reason:'NO_SOURCE_NAV'});
 const win=doc.defaultView;
 let queued=false,disposed=false;
 const reduced=()=>Boolean(win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
 const synchronize=()=>{
  if(disposed||!win||win.innerWidth>=960)return;
  const current=dock.querySelector('.vixen-room[aria-current="page"]');
  if(!current)return;
  const left=Math.max(0,current.offsetLeft-(dock.clientWidth-current.clientWidth)/2);
  dock.scrollTo({left,behavior:reduced()?'instant':'smooth'});
 };
 const schedule=()=>{
  if(queued||disposed)return;
  queued=true;
  (win.requestAnimationFrame||((cb)=>win.setTimeout(cb,0)))(()=>{queued=false;synchronize()});
 };
 const observer=new win.MutationObserver(records=>{
  if(records.some(r=>r.attributeName==='aria-current'))schedule();
 });
 observer.observe(dock,{subtree:true,attributes:true,attributeFilter:['aria-current']});
 win.addEventListener('resize',schedule,{passive:true});
 win.addEventListener('hashchange',schedule,{passive:true});
 schedule();
 return Object.freeze({
  mounted:true,source_estate:'EMSTD613',
  classification:'PRESENTATION_ONLY_NATIVE_VIEW_OBSERVER',
  getState:()=>Object.freeze({
   active_view:dock.querySelector('.vixen-room[aria-current="page"]')?.dataset.view||null,
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
