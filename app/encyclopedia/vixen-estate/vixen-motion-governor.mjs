/** Vixen stage optical ownership and one global Still law.
 * Inventory identifies running owners, not research custody or release authority.
 */
export const MOTION_OWNERS=Object.freeze({
 overview:'LIVING_MESH',works:'LIVING_MESH',
 observatory:'ELECTRIC_FOUNDRY',
 collection:'FOLDED_CUIRASS_WITH_SAME_FRAME_LATTICE',
 gates:'LIVING_MESH',protocols:'LIVING_MESH',
 holds:'LIVING_MESH',reference:'LIVING_MESH'
});
export const MOTION_CONTRACT=Object.freeze({
 schema:'td613.vixen.motion-ownership/v1',global_control:'motionBtn',
 event:'vixen:motionchange',css_state:'body[data-vixen-motion]',
 active_primary_clock_count_per_view:1,empirical_credit:0,human_closure:'RESERVED'
});
export function globalMotionHeld(doc=globalThis.document){
 if(!doc)return true;
 return !!(doc.hidden||doc.body?.dataset?.vixenMotion==='still'
   ||doc.getElementById?.('motionBtn')?.getAttribute?.('aria-pressed')==='true'
   ||doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}
export function motionGraphStatus(doc=globalThis.document){
 const view=doc?.body?.dataset?.view||'overview';
 return Object.freeze({view,owner:MOTION_OWNERS[view]||null,held:globalMotionHeld(doc),
  contract:MOTION_CONTRACT.schema});
}
if(typeof window!=='undefined'&&typeof document!=='undefined'){
 Object.defineProperty(window,'VIXEN_MOTION_GRAPH',{
  value:Object.freeze({status:()=>motionGraphStatus(document),contract:MOTION_CONTRACT}),
  configurable:true,enumerable:false,writable:false
 });
}
