/**
 * VIXEN RGI19 — Opera-wide arrival orchestration, PREVIEW PRESENTATION ONLY.
 * All eight research rooms prepare on the first landing, not on first click.
 * Source/data hydration is single-flight via the host-owned module promise.
 * Optical engines stay cold for hidden/offscreen frames; ONE living mesh canvas
 * persists through navigation. A bounded veil fails open, never hides failure.
 *
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER. No corpus or human authorization is changed.
 */
export const VIXEN_ARRIVAL_CONTRACT=Object.freeze({
 schema:'td613.vixen.rgi19-8-room-arrival/v1',
 scope:'VIXEN_OPERA_PRESENTATION_ONLY',rooms:8,
 source_mutation:false,authorization:false,autonomous_action:false,
 maximum_entry_hold_ms:3100,source_engine_shared:true,background_animation_while_hidden:false
});

const EXPECTED_ROOMS=Object.freeze({
 overview:'#view-overview #cover .hero-art img',
 observatory:'#view-observatory #vixenElectricFoundry .ef-proscenium',
 works:'#view-works #worksLexiconLayout',
 gates:'#view-gates #gatesStackContainer .gate-pair-card',
 protocols:'#view-protocols #protocolsLexiconLayout',
 holds:'#view-holds .holds-grid',
 collection:'#view-collection #vixenSynthesisSalon .vs-head',
 reference:'#view-reference #vixenReferenceChamber .vxe-heading'
});
const MODULES=Object.freeze([
 './manuscript-reader.mjs',
 './corpus-experiment-a.mjs',
 './semantic-semiotic-search.mjs',
 './research-chamber.mjs',
 './synthesis-salon.mjs',
 './observatory-electric-foundry.mjs',
 './vixen-opaline-couture-rgi14.mjs',
 './vixen-live-mesh-rgi13.mjs'
]);
function oneFrame(win){
 return new Promise(resolve=>win.requestAnimationFrame?win.requestAnimationFrame(resolve):win.setTimeout(resolve,16));
}
export function inspectOperaArrival(doc=globalThis.document,win=globalThis.window){
 const rooms=Object.fromEntries(Object.entries(EXPECTED_ROOMS).map(([id,selector])=>
  [id,Boolean(doc.querySelector(selector))]));
 const cover=doc.querySelector(EXPECTED_ROOMS.overview);
 const imageReady=!!cover && cover.complete && cover.naturalWidth>0;
 const meshReady=win?.VixenLivingMesh?.mounted===true;
 const foundry=win?.VIXEN_ELECTRIC_FOUNDRY;
 const gpuPrepared=Boolean(foundry?.status?.()?.backend&&foundry.status().backend!=='PENDING');
 const salonReady=rooms.collection;
 const allRooms=Object.values(rooms).every(Boolean);
 return Object.freeze({
  schema:VIXEN_ARRIVAL_CONTRACT.schema,rooms:Object.freeze(rooms),
  ready_count:Object.values(rooms).filter(Boolean).length,
  all_rooms_materialized:allRooms,
  cover_decoded:imageReady,mesh_ready:meshReady,
  observatory_gpu_prepared:gpuPrepared,salon_prepared:salonReady,
  critical_presentation_ready:allRooms&&imageReady&&meshReady&&salonReady,
  scientific_promotion_authority:false,corpus_mutation:false
 });
}

export function mountVixenOperaArrival({document:doc=globalThis.document,window:win=globalThis.window}={}){
 if(!doc?.body||!win)return Object.freeze({mounted:false,reason:'NO_BROWSER'});
 if(win.VIXEN_OPERA_ARRIVAL?.mounted)return win.VIXEN_OPERA_ARRIVAL;
 const veil=doc.getElementById('vixEntryVeil');
 let done=false,reason='INITIALIZING',resources=null,materialized=null;
 let coverPrepared=false,fontsPrepared=false;
 const start=win.performance?.now?.()||0;
 const report=()=>Object.freeze({
  ...inspectOperaArrival(doc,win),state:done?'REVEALED':'PREPARING',
  reason,elapsed_ms:Math.round((win.performance?.now?.()||start)-start),
  resource_load_status:resources?'SETTLED':'IN_FLIGHT',
  source_hydration_status:materialized||'PENDING',
  release_authority:false
 });
 const finish=(why)=>{
  if(done)return;
  done=true;reason=why;
  doc.body.dataset.vixenArrival='ready';
  if(veil){
   veil.dataset.state='revealed';
   veil.setAttribute('aria-hidden','true');
   win.setTimeout(()=>veil.remove(),440);
  }
  win.dispatchEvent(new win.CustomEvent('vixen:opera-arrived',{
   detail:{reason:why,rooms:report().rooms,source_mutation:false}
  }));
 };
 // This happens once while still on Overview. Existing static modules are
 // fetched/cached by the browser; imports are repeat-safe, no second mount.
 const preload=Promise.allSettled(MODULES.map(url=>import(url))).then(results=>{
  resources=results.map((x,i)=>Object.freeze({
   module:MODULES[i],status:x.status,reason:x.status==='rejected'?String(x.reason):null
  }));
  return resources;
 });
 const deep=Promise.resolve(win.VIXEN_BOOT_HYDRATION).then(x=>{
  materialized=x?.error?'HELD_NONCRITICAL_SOURCE':x?'SOURCE_ENGINE_READY':'NO_SOURCE_BOOT_SIGNAL';
  return materialized;
 }).catch(()=>{materialized='HELD_NONCRITICAL_SOURCE';});
 // Predecode the approved first-image asset; no duplicate image requests.
 const cover=doc.querySelector(EXPECTED_ROOMS.overview);
 const coverDecode=cover?.decode?.().then(
  ()=>{coverPrepared=true;},()=>{coverPrepared=Boolean(cover.complete&&cover.naturalWidth>0);}
 )||Promise.resolve().then(()=>{coverPrepared=true;});
 const fontWarm=doc.fonts?.ready?.then(
  ()=>{fontsPrepared=true;},()=>{fontsPrepared=true;}
 )||Promise.resolve().then(()=>{fontsPrepared=true;});
 // No arbitrary minimum multi-second delay. Show only when rooms, mesh, hero
 // and the first needed source-owned engines are ready; fail open at ceiling.
 const deadline=win.setTimeout(()=>finish('BOUNDED_FAIL_OPEN'),3100);
 const check=async()=>{
  if(done)return;
  const status=inspectOperaArrival(doc,win);
  if(status.critical_presentation_ready&&resources&&
     materialized!==null&&coverPrepared&&fontsPrepared){
   await oneFrame(win);
   if(!done){win.clearTimeout(deadline);finish('EIGHT_ROOMS_PREPARED');}
  }else win.setTimeout(check,65);
 };
 void Promise.allSettled([preload,deep,coverDecode,fontWarm]).then(()=>{if(!done)check();});
 // Ensure startup can reveal the page even when remote research hydration
 // has a long wait; the interval starts before those asynchronous fetches.
 win.setTimeout(check,40);
 const api=Object.freeze({
  mounted:true,contract:VIXEN_ARRIVAL_CONTRACT,status:report,
  rooms:()=>inspectOperaArrival(doc,win).rooms,
  reveal:()=>finish('EXPLICIT_PRESENTATION_REVEAL_ONLY')
 });
 try{Object.defineProperty(win,'VIXEN_OPERA_ARRIVAL',{value:api,configurable:true});}
 catch(_){win.VIXEN_OPERA_ARRIVAL=api;}
 return api;
}
if(typeof document!=='undefined'&&typeof window!=='undefined'){
 // Module scripts run after parsing. Do not wait for window.load: it can be
 // delayed by subresource requests unrelated to first-room readiness.
 mountVixenOperaArrival({document,window});
}
