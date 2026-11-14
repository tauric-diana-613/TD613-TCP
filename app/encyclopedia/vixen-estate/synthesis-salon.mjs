/**
 * 𝌋 Vixen Synthesis Salon · RGI08 materialized human-facing Opera.
 * Source-only; Opera cannot receive reference-estate or Podium authority.
 * All generated scholarship is explicitly proposed and falsifiable.
 */
import {
 checkSalonCorpus,composeSalonPlan,refractSalonPlan,toyClockAssay,
 makePodiumTasks,CLOCKS,computeClockVernier
} from './synthesis-salon-engine.mjs';
import {CARRIERS} from './observatory-foundry-kernel.mjs';
import {mountSalonVeil,VEIL_CONTRACT} from './vixen-salon-light.mjs';
import {SALON_COMPOSITOR,mountFoldedCuirass,CUIRASS_CONTRACT} from './vixen-folded-cuirass.mjs';
import {measureCoutureBeats} from './vixen-beat-radiometry-rgi15.mjs';

const mk=(tag,cl,text)=>{
 const el=document.createElement(tag);
 if(cl)el.className=cl;
 if(text!==undefined)el.textContent=String(text);
 return el
};
const append=(p,...items)=>{for(const n of items){if(n)p.append(n)}return p};
const paragraph=(s,cl='vs-note')=>mk('p',cl,s);
const button=(s,handler,cl='vs-action')=>{
 const b=mk('button',cl,s);b.type='button';b.addEventListener('click',handler);return b;
};
const select=(label,rows,active,fn)=>{
 const holder=mk('label','vs-field');
 holder.append(mk('span','vs-field-label',label));
 const sel=mk('select','vs-select');
 sel.setAttribute('aria-label',label);
 for(const row of rows){
  const o=mk('option','',row.label);o.value=String(row.id);sel.append(o);
 }
 sel.value=active;
 sel.addEventListener('change',()=>fn(sel.value));
 holder.append(sel);return holder;
};
const pre=(value)=>mk('pre','vs-machine-readout',typeof value==='string'?value:JSON.stringify(value,null,2));
const details=(title,content,cl='vs-details')=>{
 const d=mk('details',cl);d.append(mk('summary','',title),content);return d;
};
function atlasCell(label,value){
 const c=mk('div','vs-ledger-cell');
 append(c,mk('span','vs-ledger-label',label),mk('strong','',value));return c;
}
function safeCopy(raw){
 // Copy only on a real user action. A refused clipboard falls back to
 // a visible, human-selectable text surface; no network or hidden upload.
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(raw).then(()=>true,()=>false);
 return Promise.resolve(false);
}
function makeSelectSource(work,selected,changed){
 return select('Choose recorded manifestation',
  work.linked_sources.map(s=>({id:s.source_file_id,label:s.original_filename})),
  selected,changed);
}
const trackName=tr=>tr.title.replace(/^Track [A-F] · /,'');
export function mountVixenSynthesisSalon({host=document.getElementById('vixenSynthesisSalon'),corpus}={}){
 if(!host)return Object.freeze({mounted:false,reason:'NO_SALON_HOST'});
 if(!corpus){
  try{corpus=JSON.parse(document.getElementById('vixen-corpus-bundle')?.textContent||'null')}
  catch(_){corpus=null}
 }
 try{checkSalonCorpus(corpus)}catch(err){
  host.replaceChildren(paragraph('HELD · Historical Vixen source census unavailable: '+err.message));
  return Object.freeze({mounted:false,reason:'SOURCE_CENSUS_FAILURE'})
 }
 const initial=corpus.works[1]||corpus.works[0];
 const other=corpus.works.find(w=>w.cluster!==initial.cluster)||corpus.works[2];
 const state={
  works:[initial.work_id,other.work_id],
  sources:[initial.linked_sources[0].source_file_id,other.linked_sources[0].source_file_id],
  track:corpus.giveback_tracks[0].id,
  protocol:corpus.instruments.find(x=>x.instrument_id===corpus.giveback_tracks[0].protocols[0])?.instrument_id||
    corpus.instruments[0].instrument_id,
  route:'A_B',lag:30,activeClock:'k',clockOffsets:{k:0,n:0,tau:0,wall:0,plant:0},
  question:'',observable:'',counterworld:'',podiumRecordId:'',
  result:null,refraction:null,
  trajectoryMemory:{A_B:null,B_A:null,refraction:null},
  lastRadiometry:null,resting:false,history:[],
  notice:'Choose two recorded Works, one method, and a research question. Your source bodies remain unavailable.'
 };
 let veilHandle=null;
 const opticalClock={time:0};
 const folded=SALON_COMPOSITOR==='FOLDED_CHROME';
 const persistentVeil=mk('canvas',folded?'vs-cuirass-canvas':'vs-luminous-canvas');
 persistentVeil.setAttribute('aria-hidden','true');
 persistentVeil.dataset.computation=folded?'D3_PHI_OPEN_FOLDS_SHARED_CLOTH':'D3_PHI_LOOM_39_COUTURE_111';
 const carrierCounts=Object.freeze({
  total:CARRIERS.length,
  near:CARRIERS.filter(c=>c.near).length,
  mid:CARRIERS.filter(c=>c.mid).length,
  far:CARRIERS.filter(c=>c.far).length
 });
 let hudCells=null;
 const updateApertureHud=(rad)=>{
  if(rad&&typeof rad==='object')state.lastRadiometry=rad;
  if(!hudCells)return;
  const r=state.lastRadiometry;
  const lamMin=Number.isFinite(r?.minWavelengthPx)?r.minWavelengthPx:Number.isFinite(r?.beatMinPx)?r.beatMinPx:null;
  const lamMax=Number.isFinite(r?.maxWavelengthPx)?r.maxWavelengthPx:Number.isFinite(r?.beatMaxPx)?r.beatMaxPx:null;
  const nyq=Number.isFinite(r?.nyquistAlpha)?r.nyquistAlpha:Number.isFinite(r?.maxNyquist)?r.maxNyquist:null;
  const seamLuma=Number.isFinite(r?.seamContrast)?r.seamContrast:Number.isFinite(r?.seamLuma)?r.seamLuma:Number.isFinite(r?.meanLuma)?r.meanLuma:null;
  const activeMeta=CLOCKS.find(c=>c.id===state.activeClock)||CLOCKS[0];
  if(lamMin!==null&&lamMax!==null){
   hudCells[0].textContent=`APERTURE RADIOMETRY · λ_beat ${lamMin.toFixed(1)}–${lamMax.toFixed(1)}px`;
  }
  hudCells[1].textContent=`CARRIERS · ${carrierCounts.total} (${carrierCounts.near} NEAR · ${carrierCounts.mid} MID · ${carrierCounts.far} FAR)`;
  hudCells[2].textContent=nyq!==null
   ?`NYQUIST α_N ${nyq.toFixed(2)} ≤ 0.45 · ${activeMeta.code}`
   :`NYQUIST α_N ≤ 0.45 · ${activeMeta.code} (${activeMeta.custodyName})`;
  hudCells[3].textContent=seamLuma!==null
   ?`OPTICAL FIELD · SEAM ${seamLuma.toFixed(2)} · ROUTE ${state.route==='A_B'?'I▷II':'II▷I'}`
   :`ROUTE PARITY · ${state.route==='A_B'?'I ▷ II (+)':'II ▷ I (−)'} · CREDIT = 0`;
  hudCells[4].textContent='OPERAHOUSE ≠ OPERA ≠ PERFORMER';
 };
 const veilCoordinates=()=>({
  works:[...state.works],route:state.route,lag:state.lag,
  activeClock:state.activeClock,resting:state.resting,opticalClock,
  onRadiometry:updateApertureHud
 });
 const getWork=index=>corpus.works.find(w=>w.work_id===state.works[index]);
 const getTrack=()=>corpus.giveback_tracks.find(x=>x.id===state.track);
 const getMethod=()=>corpus.instruments.find(x=>x.instrument_id===state.protocol);
 const addEvent=(action,extra={})=>{
  state.history.push(Object.freeze({seq:state.history.length+1,action,
   at:new Date().toISOString(),evidence_class:'SESSION_LOCAL_UNVERIFIED',
   ...extra}))
 };
 const changed=(preserveTrajectory=false)=>{
  state.result=null;state.refraction=null;
  if(!preserveTrajectory)state.trajectoryMemory={A_B:null,B_A:null,refraction:null};
  state.notice='Edited source/question configuration · prior proposal withdrawn.';
 };
 const chooseWork=(i,id)=>{
  if(state.works[1-i]===id){state.notice='Choose two different recorded Works.';render();return}
  const w=corpus.works.find(x=>x.work_id===id);
  if(!w)return;
  state.works[i]=id;state.sources[i]=w.linked_sources[0].source_file_id;
  changed();addEvent('SOURCE_SELECTED',{side:i,work_id:id});render();
 };
 const pickSource=(i,id)=>{
  if(!getWork(i)?.linked_sources.some(x=>x.source_file_id===id))return;
  state.sources[i]=id;changed();addEvent('MANIFESTATION_SELECTED',{side:i,source_file_id:id});render();
 };
 const setTrack=id=>{
  if(!corpus.giveback_tracks.some(t=>t.id===id))return;
  state.track=id;
  const linked=corpus.instruments.find(x=>x.instrument_id===getTrack().protocols[0]);
  if(linked)state.protocol=linked.instrument_id;
  changed();addEvent('GIVEBACK_TRACK_SELECTED',{track:id});render();
 };
 const setMethod=id=>{
  if(!corpus.instruments.some(x=>x.instrument_id===id))return;
  state.protocol=id;changed();addEvent('DOCUMENTARY_METHOD_SELECTED',{method:id});render();
 };
 const setRoute=id=>{
  if(!['A_B','B_A'].includes(id))return;
  if(state.result)state.trajectoryMemory[state.route]=state.result;
  const hadProposal=Boolean(state.result);
  state.route=id;
  if(hadProposal){
   state.result=composeSalonPlan(corpus,getInput());
   state.trajectoryMemory[id]=state.result;
   state.refraction=refractSalonPlan(corpus,getInput());
   state.trajectoryMemory.refraction=state.refraction;
   state.notice='Route flipped to '+(id==='A_B'?'I → II':'II → I')+' · bilateral trajectory memory preserved across non-equivalent routes.';
  }else{
   state.notice='Encounter order set to '+(id==='A_B'?'I → II':'II → I')+' · source coordinates and bilateral trajectory memory preserved.';
  }
  addEvent('SOURCE_ORDER_DECLARED',{route:id,trajectory_preserved:true});render();
 };
 const getInput=()=>({
  work_ids:[...state.works],source_ids:[...state.sources],
  track_id:state.track,protocol_id:state.protocol,
  route_order:state.route,lag_ticks:state.lag,
  active_clock_id:state.activeClock,clock_offsets:{...state.clockOffsets},
  question:state.question,observable_predicate:state.observable,counterworld:state.counterworld
 });
 const compose=()=>{
  try{
   state.result=composeSalonPlan(corpus,getInput());
   state.trajectoryMemory[state.route]=state.result;
   const alt=state.route==='A_B'?'B_A':'A_B';
   if(!state.trajectoryMemory[alt]){
    state.trajectoryMemory[alt]=composeSalonPlan(corpus,{...getInput(),route_order:alt});
   }
   state.refraction=null;state.notice='Question drafted. Verification, authorship and relation claims remain HELD.';
   addEvent('UNRATIFIED_QUESTION_COMPOSED',{work_ids:[...state.works],
    route:state.route,claim:'QUESTION_NOT_EVIDENCE'})
  }catch(e){state.notice='HELD · '+e.message;addEvent('COMPOSITION_REFUSED',{reason:e.message})}
  render();
 };
 const refract=()=>{
  if(!state.result)return;
  const alt=state.route==='A_B'?'B_A':'A_B';
  state.trajectoryMemory[state.route]=state.result;
  state.trajectoryMemory[alt]=composeSalonPlan(corpus,{...getInput(),route_order:alt});
  state.refraction=refractSalonPlan(corpus,getInput());
  state.trajectoryMemory.refraction=state.refraction;
  state.notice='The source identities remain stable. Reversing encounter order changes the recorded route.';
  addEvent('INTERNAL_REFRACTION_OBSERVED',{classification:'COUNTERFACTUAL_ONLY'});
  render();
 };
 const rest=()=>{
  if(state.resting)return;
  state.resting=true;addEvent('UNPENALIZED_REST');render()
 };
 const resume=()=>{
  if(!state.resting)return;
  state.resting=false;addEvent('OPERATOR_RESUMED_WITHOUT_QUESTION_LOSS');render()
 };
 const saveWorks=()=>{
  const tray=window.VIXEN_STUDY_TRAY;
  if(!tray?.add){state.notice='HELD · Session tray unavailable on this host.';render();return}
  const n=state.works.reduce((count,id)=>count+(tray.add(id)?1:0),0);
  state.notice=n+' Work(s) added to the existing session study tray; no sale or external submission.';
  addEvent('STUDY_TRAY_CHANGED',{count:n});render()
 };
 const exportPlan=()=>{
  if(!state.result)return;
  const datum={schema:'emstd613.vixen.salon-export/v1',
   classification:'UNRATIFIED_HUMAN_RESEARCH_PROPOSAL',
   proposal:state.result,operator_route:state.history.slice(),
   native_tools_invoked:false,operator_closure:'RESERVED'};
  const blob=new Blob([JSON.stringify(datum,null,2)+'\n'],{type:'application/json'});
  const a=document.createElement('a'),url=URL.createObjectURL(blob);
  a.href=url;a.download='VIXEN_SOURCE_BOUND_RESEARCH_PROPOSAL.json';
  document.body.append(a);a.click();a.remove();
  URL.revokeObjectURL(url);addEvent('LOCAL_PROPOSAL_EXPORTED',{authorization:'LOCAL_FILE_ONLY'});
  state.notice='Proposal exported locally. No external submission or scientific promotion.';
  render();
 };
 const copyPodium=async()=>{
  if(!state.result)return;
  const raw=JSON.stringify(makePodiumTasks(state.result,{recordId:state.podiumRecordId||null}),null,2);
  const copied=await safeCopy(raw);
  if(copied){state.notice='Podium task batch copied. A human-directed agent must still execute it.';render()}
  else{
   state.notice='Clipboard unavailable · select the machine task batch below.';
   render();
   host.querySelector('#vixenSalonPodiumTasks')?.setAttribute('open','');
  }
  addEvent('PODIUM_TASK_BATCH_PREPARED',{task_class:'READ_ONLY_INACTIVE_UNTIL_EXPLICIT_EXECUTION'});
 };
 const notice=()=>mk('div','vs-status',state.notice);
 function withdrawVisibleProposal(){
  if(!state.result)return;
  changed();host.querySelector('.vs-result')?.remove();
  const live=host.querySelector('.vs-status');
  if(live)live.textContent=state.notice;
 }
 function render(){
  host.replaceChildren();host.dataset.stageRole='VIXEN_OPERA';
  host.dataset.couture=folded?'folded-chrome':'legacy';
  const head=mk('header','vs-head');
  const eyebrow=mk('div','vs-eyebrow','06 · VIXEN SYNTHESIS SALON · COUTURE LABORATORY');
  const title=mk('h2','vs-title','The theorem');
  title.append(mk('em','vs-title-italics',' never'));
  title.append(document.createTextNode(' finished dressing.'));
  const description=paragraph(
   'Collect evidence like a fox; compose hypotheses like an opera. Every claim changes what the next question must ask. No source is sold, merged, or made to testify beyond its recorded boundary.','vs-intro');
  // Optical costume derived from Dome D3, phi, Loom carriers and [111] projection.
  // Literal costume emojis are absent: visual rhetoric now lives in silhouette.
  const veil=persistentVeil;
  veil.dataset.computation=folded?'D3_PHI_OPEN_FOLDS_SHARED_CLOTH':'D3_PHI_LOOM_39_COUTURE_111';
  const veilCaption=mk('div','vs-optical-label','VIXEN · 39 COMPUTED CARRIERS · OPTICAL COSTUME / MODEL ONLY');
  veilCaption.setAttribute('aria-hidden','true');
  const words=mk('div','vs-hero-copy');
  const nowWhyExact=mk('div','vs-now-why-exact');
  append(nowWhyExact,
   mk('span','vs-nwe-item',`NOW · Select two Works & encounter direction (${state.route==='A_B'?'I ▷ II':'II ▷ I'})`),
   mk('span','vs-nwe-item','WHY · Order alters question framing without merging custody'),
   mk('span','vs-nwe-item','EXACT · Unratified question only · Authorship UNRESOLVED · Credit 0')
  );
  append(words,eyebrow,title,description,nowWhyExact);
  if(folded){
   const stage=mk('div','vs-optical-stage');append(stage,veil,veilCaption);append(head,words,stage);
  }else append(head,veil,words,veilCaption);
  const index=mk('div','vs-rail');
  append(index,
   atlasCell('ORIGINAL WORKS','32 / 53 manifestations'),
   atlasCell('BILATERAL GATES','8 · Unadjudicated'),
   atlasCell('METHODS','21 · Documentary'),
   atlasCell('FIELD TRACKS','6 · Prospective')
  );
  const columns=mk('div','vs-mix');
  for(let i=0;i<2;i++){
   const w=getWork(i),side=mk('article','vs-source-card');
   side.dataset.estate='EMSTD613';
   append(side,
    paragraph((i===0?'I':'II')+' · VIXEN PERFORMER · RECORDED WORK','vs-source-tag'),
    select('Choose Work '+(i+1),corpus.works.map((x,j)=>({
     id:x.work_id,label:String(j+1).padStart(2,'0')+' · '+titleText(x)
    })),w.work_id,v=>chooseWork(i,v)),
    mk('h3','vs-work-title',titleText(w)),
    makeSelectSource(w,state.sources[i],v=>pickSource(i,v)),
    paragraph('Authorship: '+w.authorship+' · Identity: '+w.identity_status),
    paragraph('Source body: not supplied · SHA-256 is a declared catalogue digest, not a newly witnessed manuscript.','vs-custody')
   );
   const src=w.linked_sources.find(x=>x.source_file_id===state.sources[i]);
   side.append(paragraph('SOURCE '+src.source_file_id+' · '+src.sha256.slice(0,16)+'…','vs-hash'));
   if(w.human_gate_required){
    side.append(paragraph('HUMAN GATE '+w.gate_num+' · UNADJUDICATED_PAIR','vs-gate'));
   }
   columns.append(side);
  }
  const seam=button('',()=>setRoute(state.route==='A_B'?'B_A':'A_B'),'vs-seam');
  seam.setAttribute('aria-label','Flip encounter order without merging authorship ('+(state.route==='A_B'?'I → II to II → I':'II → I to I → II')+')');
  seam.title='Flip encounter order (I ▷ II / II ▷ I) · source loci stay distinct';
  append(seam,
   mk('span','vs-seam-neq','≠'),
   mk('span','vs-seam-op',state.route==='A_B'?'I ▷ II ⇄':'II ▷ I ⇄')
  );
  const offer=mk('div','vs-program');
  append(offer,
   paragraph('THE OPERA · SELECT THE QUESTION, NEVER THE ANSWER','vs-eyebrow'),
   select('Six prospective giveback tracks',corpus.giveback_tracks.map(t=>({id:t.id,label:trackName(t)})),state.track,setTrack),
   paragraph(getTrack().summary,'vs-track-scope'),
   select('Documentary protocol',corpus.instruments.map(x=>({id:x.instrument_id,label:x.instrument_id.replaceAll('_',' ')})),state.protocol,setMethod),
   paragraph(getMethod().scope,'vs-protocol-scope')
  );
  const routes=mk('div','vs-order');
  append(routes,paragraph('ENCOUNTER ORDER · DISTINCT ROUTES, IDENTICAL SOURCE IDENTIFIERS','vs-eyebrow'));
  for(const o of ['A_B','B_A']){
   const b=button(o==='A_B'?'I → II':'II → I',()=>setRoute(o),'vs-order-button');
   b.setAttribute('aria-pressed',String(state.route===o));routes.append(b);
  }
  const wA=getWork(0),wB=getWork(1);
  const vernier=computeClockVernier(state.lag,{
   route:state.route,activeClockId:state.activeClock,workA:wA,workB:wB,clockOffsets:state.clockOffsets
  });
  const holonomyCard=mk('div','vs-holonomy-card');
  const leadTitle=state.route==='A_B'?titleText(wA):titleText(wB);
  const tailTitle=state.route==='A_B'?titleText(wB):titleText(wA);
  const {svg:holonomySvg,centerText:holonomyCenterText}=makeHolonomySvg(wA,wB,vernier,state.route);
  append(holonomyCard,
   mk('span','vs-holonomy-badge','ATLAS ROUTE MEMORY · NON-EQUIVALENT TRAJECTORY'),
   holonomySvg,
   paragraph(`Active path (${state.route==='A_B'?'I → II':'II → I'}): [${leadTitle}] ➔ [${tailTitle}] · Terminal set invariant, holonomy history distinct.`,'vs-holonomy-detail')
  );
  const memStrip=mk('div','vs-trajectory-memory');
  const fwdSnap=state.trajectoryMemory.A_B,revSnap=state.trajectoryMemory.B_A;
  const fwdCard=mk('div','vs-traj-cell'+(state.route==='A_B'?' is-active':''));
  append(fwdCard,
   mk('span','vs-traj-head','FORWARD · I ▷ II ('+titleText(wA)+' anchor)'),
   mk('code','vs-traj-order',vernier.forward.arrival_order.join(' ≺ ')),
   paragraph(fwdSnap?fwdSnap.question:'No I → II proposal drafted yet · clocks previewing live.','vs-traj-note')
  );
  const revCard=mk('div','vs-traj-cell'+(state.route==='B_A'?' is-active':''));
  append(revCard,
   mk('span','vs-traj-head','REVERSE · II ▷ I ('+titleText(wB)+' anchor)'),
   mk('code','vs-traj-order',vernier.reverse.arrival_order.join(' ≺ ')),
   paragraph(revSnap?revSnap.question:'No II → I proposal drafted yet · hysteresis & inversions live.','vs-traj-note')
  );
  const seamInvariantNote=mk('div','vs-traj-invariant',
   `same_terminal_source_set = true · route_history_equal = false · inversions = ${vernier.arrival_inversions} · ΔL1 = ${vernier.tick_l1_delta}t`
  );
  append(memStrip,fwdCard,revCard,seamInvariantNote);
  offer.append(routes,holonomyCard,memStrip);
  const clocks=state.route==='B_A'?vernier.reverse:vernier.forward;
  const clockBox=mk('section','vs-clocks');
  clockBox.append(paragraph('FIVE CLOCKS · INTERACTIVE VERNIER & NON-COMMUTATIVE HYSTERESIS','vs-eyebrow'));
  const lagLabel=mk('label','vs-slider-label','Demonstration lag · '+state.lag+' dimensionless ticks');
  const slider=mk('input','vs-slider');slider.type='range';slider.min='0';slider.max='120';slider.step='1';slider.value=String(state.lag);
  slider.setAttribute('aria-label','Synthetic arrival lag in dimensionless ticks');
  const bars=mk('div','vs-clock-bars');
  const vernierReadout=mk('div','vs-vernier-readout');
  const rowRefs=new Map();
  const invalidateComposedIfAny=()=>{
   if(state.result){changed(true);
    host.querySelector('.vs-result')?.remove();
    const live=host.querySelector('.vs-status');
    if(live)live.textContent=state.notice;
   }
  };
  const updateClockDOMInPlace=()=>{
   const v=computeClockVernier(state.lag,{
    route:state.route,activeClockId:state.activeClock,workA:getWork(0),workB:getWork(1),clockOffsets:state.clockOffsets
   });
   const activeAssay=state.route==='B_A'?v.reverse:v.forward;
   lagLabel.textContent='Demonstration lag · '+state.lag+' dimensionless ticks';
   for(let i=0;i<activeAssay.clocks.length;i++){
    const c=activeAssay.clocks[i];
    const ref=rowRefs.get(c.id);
    if(!ref)continue;
    ref.row.classList.toggle('is-active',c.id===state.activeClock);
    ref.selectBtn.setAttribute('aria-pressed',String(c.id===state.activeClock));
    ref.bar.style.width=(Math.max(6,Math.min(100,c.tick/180*100))).toFixed(2)+'%';
    const deltaBits=[];
    if(c.hysteresis_shift)deltaBits.push((c.hysteresis_shift>0?'+':'')+c.hysteresis_shift+'h');
    if(c.vernier_offset)deltaBits.push((c.vernier_offset>0?'+':'')+c.vernier_offset+'v');
    ref.tickEl.textContent=String(c.tick)+'t'+(deltaBits.length?' ('+deltaBits.join(' ') +')':'');
   }
   vernierReadout.textContent=
    `ACTIVE ${v.active_clock.code} (${v.active_clock.custodyName}, ${v.active_clock.derivativeSymbol}) · `
    +`A▷B: ${v.forward.arrival_order.join('≺')} vs B▷A: ${v.reverse.arrival_order.join('≺')} · `
    +`inversions=${v.arrival_inversions} · L1=${v.tick_l1_delta}t · `
    +(v.cluster_aligned.length?`cluster affinity [${v.cluster_aligned.join(',')}]`:'cluster orthogonal')
    +' · physical_time_equivalence=false';
   holonomyCenterText.textContent=`Δ=${v.arrival_inversions} inv · ${v.tick_l1_delta}t`;
   seamInvariantNote.textContent=
    `same_terminal_source_set = true · route_history_equal = false · inversions = ${v.arrival_inversions} · ΔL1 = ${v.tick_l1_delta}t`;
   updateApertureHud(null);
  };
  bars.append(...makeBars(clocks,rowRefs,()=>{updateClockDOMInPlace();veilHandle?.renderOnce?.();invalidateComposedIfAny();},id=>{
   state.activeClock=id;updateClockDOMInPlace();veilHandle?.renderOnce?.();
  }));
  slider.addEventListener('input',()=>{
   state.lag=Number(slider.value);
   updateClockDOMInPlace();
   veilHandle?.renderOnce?.();
   invalidateComposedIfAny();
  });
  slider.addEventListener('change',()=>updateClockDOMInPlace());
  const beatSample=measureCoutureBeats({width:360,height:420,time:opticalClock.time,seed:2166136261});
  const minLambda=Math.min(...beatSample.pairs.map(p=>p.wavelengthPx)).toFixed(1);
  const maxLambda=Math.max(...beatSample.pairs.map(p=>p.wavelengthPx)).toFixed(1);
  const apertureHud=mk('div','vixen-aperture-hud');
  hudCells=[
   mk('span','vixen-hud-pill',`APERTURE RADIOMETRY · λ_beat ${minLambda}–${maxLambda}px`),
   mk('span','vixen-hud-pill',`CARRIERS · ${carrierCounts.total} (${carrierCounts.near} NEAR · ${carrierCounts.mid} MID · ${carrierCounts.far} FAR)`),
   mk('span','vixen-hud-pill',`NYQUIST α_N ≤ 0.45 · ${vernier.active_clock.code} (${vernier.active_clock.custodyName})`),
   mk('span','vixen-hud-pill',`ROUTE PARITY · ${state.route==='A_B'?'I ▷ II (+)':'II ▷ I (−)'} · CREDIT = 0`),
   mk('span','vixen-hud-pill','OPERAHOUSE ≠ OPERA ≠ PERFORMER')
  ];
  append(apertureHud,...hudCells);
  updateClockDOMInPlace();
  append(clockBox,lagLabel,slider,bars,vernierReadout,apertureHud,paragraph('Distinct derivative domains: k · n · τ · wall · 48 kHz plant. Drag any track (double-click to zero) or select a clock to inspect the folded cuirass under that clock plane. Equal bar positions cannot establish a physical time map.','vs-custody'));
  const inputPane=mk('section','vs-question');
  inputPane.append(paragraph('A QUESTION WORTH REFUSING TO ANSWER PREMATURELY','vs-eyebrow'));
  const q=mk('textarea','vs-textarea');q.placeholder='Optional: your own falsifiable question. Leave blank for a source-attributed construction.';
  q.rows=3;q.maxLength=900;q.value=state.question;q.setAttribute('aria-label','Compose an original research question');
  q.addEventListener('input',()=>{state.question=q.value;withdrawVisibleProposal()});
  const observable=mk('textarea','vs-textarea');observable.placeholder='Optional: an observable predicate or measured comparison';observable.rows=2;observable.maxLength=450;observable.value=state.observable;
  observable.setAttribute('aria-label','Define the future observable predicate');
  observable.addEventListener('input',()=>{state.observable=observable.value;withdrawVisibleProposal()});
  const counter=mk('textarea','vs-textarea');counter.placeholder='Optional: the world in which this hypothesis fails';counter.rows=2;counter.maxLength=450;counter.value=state.counterworld;
  counter.setAttribute('aria-label','Define a counterfactual world');
  counter.addEventListener('input',()=>{state.counterworld=counter.value;withdrawVisibleProposal()});
  append(inputPane,q,observable,counter);
  const actions=mk('div','vs-actions');
  if(state.resting){
   actions.append(button('Resume this unfinished inquiry',resume));
   append(inputPane,paragraph('REST · Temporal suspension honored without penalty. Your selected Works, encounter route, lag ticks, and draft question remain intact; the Opera has made zero decisions for you.','vs-rest'));
  }else{
   append(actions,
    button('Compose an unratified theory ↓',compose,'vs-action vs-primary'),
    button('Place both Works in the research cart',saveWorks),
    button('Rest without penalty',rest,'vs-action vs-quiet'));
  }
  inputPane.append(actions);
  // Source-first: the actual recorded Work appears before decorative census statistics.
  append(host,head,columns,seam,index,offer,clockBox,inputPane,notice());
  if(state.result&&!state.resting)host.append(renderResult());
  else host.append(paragraph('Nothing has been composed on your behalf. The original source estate remains open for inquiry.','vs-empty'));
  if(!veilHandle){
   veilHandle=folded?mountFoldedCuirass(veil,veilCoordinates):mountSalonVeil(veil,veilCoordinates);
  }else{
   veilHandle.renderOnce?.();
  }
  host.dataset.opticalContract=folded?CUIRASS_CONTRACT.schema:VEIL_CONTRACT.schema;
 }
 function titleText(w){return w.display_title||w.declared_title||w.work_id}
 function makeHolonomySvg(wA,wB,vernier,route){
  const NS='http://www.w3.org/2000/svg';
  const s=(tag,attrs={},text='')=>{
   const el=document.createElementNS(NS,tag);
   for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));
   if(text)el.textContent=text;
   return el;
  };
  const svg=s('svg',{class:'vs-holonomy-svg',viewBox:'0 0 320 120',role:'img',
   'aria-label':'Holonomy diamond comparing I to II versus II to I source paths'});
  const defs=s('defs');
  const mkArrow=(id,fill)=>{
   const m=s('marker',{id,viewBox:'0 0 8 8',refX:'7',refY:'4',markerWidth:'6',markerHeight:'6',orient:'auto'});
   m.append(s('path',{d:'M0,1 L7,4 L0,7 Z',fill}));
   return m;
  };
  defs.append(mkArrow('vsArrowRose','#FF91AF'),mkArrow('vsArrowGold','#FFF0A8'));
  svg.append(defs);
  const fwdActive=route==='A_B';
  svg.append(
   s('path',{d:'M34,60 Q160,12 286,60',fill:'none',stroke:fwdActive?'#FF91AF':'rgba(210,221,224,0.34)',
    'stroke-width':fwdActive?'2.6':'1.4','marker-end':'url(#vsArrowRose)'}),
   s('path',{d:'M286,60 Q160,108 34,60',fill:'none',stroke:!fwdActive?'#FFF0A8':'rgba(210,221,224,0.34)',
    'stroke-width':!fwdActive?'2.6':'1.4','stroke-dasharray':!fwdActive?'none':'4 3','marker-end':'url(#vsArrowGold)'}),
   s('circle',{cx:'34',cy:'60',r:'11',fill:'#10171D',stroke:'#FF91AF','stroke-width':'1.8'}),
   s('circle',{cx:'286',cy:'60',r:'11',fill:'#10171D',stroke:'#FFF0A8','stroke-width':'1.8'}),
   s('text',{x:'34',y:'64','text-anchor':'middle',fill:'#FFFDF8','font-size':'10','font-weight':'700'},'W₁'),
   s('text',{x:'286',y:'64','text-anchor':'middle',fill:'#FFFDF8','font-size':'10','font-weight':'700'},'W₂'),
   s('text',{x:'160',y:'20','text-anchor':'middle',fill:fwdActive?'#FF91AF':'#A4B6C2','font-size':'9.5'},'I ▷ II ('+titleText(wA).slice(0,12)+')'),
   s('text',{x:'160',y:'112','text-anchor':'middle',fill:!fwdActive?'#FFF0A8':'#A4B6C2','font-size':'9.5'},'II ▷ I ('+titleText(wB).slice(0,12)+')')
  );
  const centerText=s('text',{x:'160',y:'64','text-anchor':'middle',fill:'#FFF8F0','font-size':'10','font-weight':'600'},
   `Δ=${vernier.arrival_inversions} inv · ${vernier.tick_l1_delta}t`);
  svg.append(centerText);
  return {svg,centerText};
 }
 function makeBars(clocks,rowRefs,onScrub,onSelectClock){
  return clocks.clocks.map((c,idx)=>{
   const meta=CLOCKS[idx]||c;
   const row=mk('div','vs-clock-row vs-clock-card'+(c.id===state.activeClock?' is-active':''));
   row.dataset.clockId=c.id;
   const selectBtn=button(meta.code+' · '+c.label,()=>onSelectClock(c.id),'vs-clock-select');
   selectBtn.setAttribute('aria-pressed',String(c.id===state.activeClock));
   const trackWrap=mk('div','vs-clock-track-wrap');
   const track=mk('div','vs-clock-track');
   track.title='Drag horizontally to scrub '+c.label+' Vernier offset; double-click to reset';
   const bar=mk('div','vs-clock-bar');bar.style.width=(Math.max(6,Math.min(100,c.tick/180*100))).toFixed(2)+'%';
   track.append(bar);
   let scrubbing=false;
   const applyScrub=ev=>{
    const rect=track.getBoundingClientRect?.();
    if(!rect||rect.width<=0)return;
    const rel=Math.max(-1,Math.min(1,(ev.clientX-(rect.left+rect.width/2))/(rect.width/2)));
    state.clockOffsets[c.id]=Math.round(rel*24);
    onScrub();
   };
   track.addEventListener('pointerdown',ev=>{scrubbing=true;track.setPointerCapture?.(ev.pointerId);applyScrub(ev);});
   track.addEventListener('pointermove',ev=>{if(scrubbing)applyScrub(ev);});
   track.addEventListener('pointerup',()=>{scrubbing=false;});
   track.addEventListener('pointercancel',()=>{scrubbing=false;});
   track.addEventListener('dblclick',()=>{state.clockOffsets[c.id]=0;onScrub();});
   const nudge=(delta)=>{
    state.clockOffsets[c.id]=Math.max(-24,Math.min(24,(state.clockOffsets[c.id]||0)+delta));
    onScrub();
   };
   const minusBtn=button('−',()=>nudge(-2),'vs-clock-step');
   minusBtn.setAttribute('aria-label','Decrease '+c.label+' Vernier offset');
   const plusBtn=button('+',()=>nudge(2),'vs-clock-step');
   plusBtn.setAttribute('aria-label','Increase '+c.label+' Vernier offset');
   append(trackWrap,minusBtn,track,plusBtn);
   const tickEl=mk('strong','vs-clock-tick',String(c.tick)+'t');
   const metaLine=mk('div','vs-clock-meta',
    `${meta.derivativeSymbol} · ${meta.naturalPeriodLabel} · Clusters [${meta.preferredClusters.join('/')}] · ${c.geometry}`);
   append(row,selectBtn,trackWrap,tickEl,metaLine);
   rowRefs?.set(c.id,{row,selectBtn,track,bar,tickEl,metaLine});
   return row;
  });
 }
 function renderResult(){
  const p=state.result;
  const box=mk('section','vs-result');box.dataset.claimClass=p.status;
  append(box,paragraph('THEOREM CABINET · CONJECTURAL · NOT A SCIENTIFIC OBSERVATION','vs-eyebrow'),
   mk('h3','vs-result-title','A unified question, with its seams showing'),
   paragraph(p.question,'vs-theorem'),
   paragraph(p.suggested_theoretical_relation,'vs-equation'),
   mk('h4','','If the world refuses this hypothesis…'),
   paragraph(p.counterfactual),
   mk('h4','','What would have to be measured?'),
   paragraph(p.testable_predicate));
  const rubric=mk('div','vs-rubric');
  for(const measurement of p.comparative_measurements){
   const metric=mk('article','vs-metric');
   append(metric,
    mk('span','vs-metric-label',measurement.id+' · NOT MEASURED'),
    mk('strong','vs-metric-title',measurement.title),
    mk('code','vs-metric-formula',measurement.formula),
    paragraph(measurement.positive_interpretation,'vs-note'));
   rubric.append(metric);
  }
  append(box,mk('h4','','The future comparison must earn its numbers'),rubric);
  const list=mk('ul','vs-missing');
  for(const missing of p.missing_evidence)list.append(mk('li','',missing));
  append(box,mk('h4','','Unresolved evidence'),list);
  const arm=mk('div','vs-arms');
  for(const a of p.experiment_b.arms){
   const cell=mk('div','vs-arm');
   append(cell,mk('span','',a.id.replace('ARM_','ARM ')),
    mk('strong','',a.role.replaceAll('_',' ')),mk('small','','DESIGN ONLY · HELD'));
   arm.append(cell)
  }
  append(box,mk('h4','','Experiment B · Unexecuted competent-union comparison'),arm);
  const quad=mk('div','vs-confrontation-quadrant');
  const qHeader=mk('div','vs-quad-head','FADT QUOTIENT DESCENT · FOUR-ARM CONFRONTATION MATRIX');
  const qCells=mk('div','vs-quad-grid');
  const quadSpecs=[
   {id:'ARM_0_TRANSPORT',axis:'Fibre Base · Custody Invariant',summary:'Holds Work IDs, digests & gate states constant across route traversal.'},
   {id:'ARM_1_ARCHIVAL',axis:'Single-Source Baseline',summary:'Tests whether one declared Work alone recovers the candidate question.'},
   {id:'ARM_2A_MODULAR',axis:'Two-Stage Ordered Fibre',summary:'Measures route-ordered synthesis across A ▷ B vs B ▷ A without merging.'},
   {id:'ARM_2B_MATCHED_UNION',axis:'Competent-Union Control',summary:'Requires surplus above union U \\ ⋂ S_i before attributing emergence.'}
  ];
  for(const qItem of quadSpecs){
   const qCard=mk('article','vs-quad-card');
   append(qCard,
    mk('span','vs-quad-id',qItem.id),
    mk('strong','vs-quad-axis',qItem.axis),
    paragraph(qItem.summary,'vs-note')
   );
   qCells.append(qCard);
  }
  const qSeal=paragraph(
   `Quotient fiber over [${p.source_coordinates.map(x=>x.source_file_id).join(', ')}] · Intersection ≠ Union (U \\ ⋂ S_i = OPEN GAP) · Flight: ${p.experiment_b.status} · Credit: ${p.experiment_b.empirical_acquisition_credit}`,
   'vs-note vs-quad-seal'
  );
  append(quad,qHeader,qCells,qSeal);
  append(box,quad,
   paragraph('Protected Flight HELD. The Manifest successor remains unknown. No reference source, observed outcome or scientific effect has been invented.','vs-custody'));
  const controls=mk('div','vs-actions');
  append(controls,
   button('Refract the encounter order',refract),
   button('Export local proposal JSON ↓',exportPlan),
   button('Copy bounded Podium tasks',copyPodium)
  );
  box.append(controls);
  if(state.refraction)box.append(details('Internal refraction: identical sources, distinct route history',
   pre(state.refraction)));
  const recordField=mk('label','vs-field vs-podium-bridge');
  recordField.append(mk('span','vs-field-label','Optional Universal Reference Record ID (e.g. G-101) for Cross-Atelier Podium Task Preview'));
  const recordInput=mk('input','vs-input');
  recordInput.type='text';recordInput.placeholder='Leave empty for Opera-only tasks, or enter e.g. G-101';
  recordInput.value=state.podiumRecordId;
  const taskPre=pre(makePodiumTasks(p,{recordId:state.podiumRecordId||null}));
  recordInput.addEventListener('input',()=>{
   state.podiumRecordId=recordInput.value.trim().toUpperCase();
   taskPre.textContent=JSON.stringify(makePodiumTasks(p,{recordId:state.podiumRecordId||null}),null,2);
  });
  recordField.append(recordInput);
  const machine=mk('div','vs-machine');
  machine.append(details('Inspect the complete, typed question receipt',pre(p)));
  const podiumDetails=details('Inspect machine task batch (never auto-executed)',
   append(recordField,taskPre,mk('p','vs-custody','The Conductor must be explicitly invoked by its host.')));
  podiumDetails.id='vixenSalonPodiumTasks';
  machine.append(podiumDetails);
  box.append(machine);
  return box
 }
 addEvent('SALON_ENTERED',{operator_authority:'UNRATIFIED_QUESTIONS_ONLY'});render();
 window.addEventListener('vixen-study-tray-change',()=>{
  const status=host.querySelector('.vs-status');
  if(status&&!state.resting)status.textContent='The shared session study tray has changed; its source identities remain unchanged.';
 });
 return Object.freeze({
  mounted:true,render,
  getProposal:()=>state.result,
  history:()=>state.history.slice(),
  rest,resume,
  phase:()=>state.resting?'REST':state.result?'PROPOSED':'NOTICE',
  opticalStatus:()=>veilHandle?.getStatus?.()||null,
  dispose:()=>veilHandle?.dispose?.()
 });
}
if(typeof document!=='undefined')mountVixenSynthesisSalon();
