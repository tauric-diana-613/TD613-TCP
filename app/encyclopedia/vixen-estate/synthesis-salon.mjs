/**
 * 𝌋 Vixen Synthesis Salon · RGI08 materialized human-facing Opera.
 * Source-only; Opera cannot receive reference-estate or Podium authority.
 * All generated scholarship is explicitly proposed and falsifiable.
 */
import {
 checkSalonCorpus,composeSalonPlan,refractSalonPlan,toyClockAssay,
 makePodiumTasks,CLOCKS
} from './synthesis-salon-engine.mjs';
import {mountSalonVeil,VEIL_CONTRACT} from './vixen-salon-light.mjs';
import {SALON_COMPOSITOR,mountFoldedCuirass,CUIRASS_CONTRACT} from './vixen-folded-cuirass.mjs';

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
  route:'A_B',lag:30,question:'',observable:'',counterworld:'',
  result:null,refraction:null,resting:false,history:[],
  notice:'Choose two recorded Works, one method, and a research question. Your source bodies remain unavailable.'
 };
 let veilHandle=null;
 const opticalClock={time:0};
 const folded=SALON_COMPOSITOR==='FOLDED_CHROME';
 const veilCoordinates=()=>({works:[...state.works],route:state.route,lag:state.lag,resting:state.resting,opticalClock});
 const getWork=index=>corpus.works.find(w=>w.work_id===state.works[index]);
 const getTrack=()=>corpus.giveback_tracks.find(x=>x.id===state.track);
 const getMethod=()=>corpus.instruments.find(x=>x.instrument_id===state.protocol);
 const addEvent=(action,extra={})=>{
  state.history.push(Object.freeze({seq:state.history.length+1,action,
   at:new Date().toISOString(),evidence_class:'SESSION_LOCAL_UNVERIFIED',
   ...extra}))
 };
 const changed=()=>{
  state.result=null;state.refraction=null;state.notice='Edited source/question configuration · prior proposal withdrawn.';
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
  state.route=id;changed();addEvent('SOURCE_ORDER_DECLARED',{route:id});render();
 };
 const getInput=()=>({
  work_ids:[...state.works],source_ids:[...state.sources],
  track_id:state.track,protocol_id:state.protocol,
  route_order:state.route,lag_ticks:state.lag,question:state.question,
  observable_predicate:state.observable,counterworld:state.counterworld
 });
 const compose=()=>{
  try{
   state.result=composeSalonPlan(corpus,getInput());
   state.refraction=null;state.notice='Question drafted. Verification, authorship and relation claims remain HELD.';
   addEvent('UNRATIFIED_QUESTION_COMPOSED',{work_ids:[...state.works],
    route:state.route,claim:'QUESTION_NOT_EVIDENCE'})
  }catch(e){state.notice='HELD · '+e.message;addEvent('COMPOSITION_REFUSED',{reason:e.message})}
  render();
 };
 const refract=()=>{
  if(!state.result)return;
  state.refraction=refractSalonPlan(corpus,getInput());
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
  const raw=JSON.stringify(makePodiumTasks(state.result),null,2);
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
  veilHandle?.dispose?.();veilHandle=null;
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
  const veil=mk('canvas',folded?'vs-cuirass-canvas':'vs-luminous-canvas');
  veil.setAttribute('aria-hidden','true');
  veil.dataset.computation=folded?'D3_PHI_OPEN_FOLDS_SHARED_CLOTH':'D3_PHI_LOOM_39_COUTURE_111';
  const veilCaption=mk('div','vs-optical-label','VIXEN · 39 COMPUTED CARRIERS · OPTICAL COSTUME / MODEL ONLY');
  veilCaption.setAttribute('aria-hidden','true');
  const words=mk('div','vs-hero-copy');
  append(words,eyebrow,title,description);
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
  const seam=mk('div','vs-seam','≠');
  seam.setAttribute('aria-label','Distinct source loci, distinct unresolved authorship');
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
  offer.append(routes);
  const clocks=toyClockAssay({lag:state.lag,routeOrder:state.route});
  const clockBox=mk('section','vs-clocks');
  clockBox.append(paragraph('FIVE CLOCKS · A SYNTHETIC SCORED DEMONSTRATION','vs-eyebrow'));
  const lagLabel=mk('label','vs-slider-label','Demonstration lag · '+state.lag+' dimensionless ticks');
  const slider=mk('input','vs-slider');slider.type='range';slider.min='0';slider.max='120';slider.step='1';slider.value=String(state.lag);
  slider.setAttribute('aria-label','Synthetic arrival lag in dimensionless ticks');
  slider.addEventListener('input',()=>{
   state.lag=Number(slider.value);
   const updated=toyClockAssay({lag:state.lag,routeOrder:state.route});
   lagLabel.textContent='Demonstration lag · '+state.lag+' dimensionless ticks';
   bars.replaceChildren(...makeBars(updated));
   veilHandle?.renderOnce?.();
   if(state.result){changed();
    host.querySelector('.vs-result')?.remove();
    const live=host.querySelector('.vs-status');
    if(live)live.textContent=state.notice;
   }
  });
  slider.addEventListener('change',()=>render());
  const bars=mk('div','vs-clock-bars');
  bars.append(...makeBars(clocks));
  append(clockBox,lagLabel,slider,bars,paragraph('Distinct derivative domains: k · n · τ · wall · 48 kHz plant. Equal bar positions cannot establish a physical time map. Changing lag genuinely changes these illustrative positions.','vs-custody'));
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
   append(inputPane,paragraph('REST · Your source and question selections are preserved; the Opera has made no decision for you.','vs-rest'));
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
  veilHandle=folded?mountFoldedCuirass(veil,veilCoordinates):mountSalonVeil(veil,veilCoordinates);
  host.dataset.opticalContract=folded?CUIRASS_CONTRACT.schema:VEIL_CONTRACT.schema;
 }
 function titleText(w){return w.display_title||w.declared_title||w.work_id}
 function makeBars(clocks){
  return clocks.clocks.map(c=>{
   const track=mk('div','vs-clock-row');
   const bar=mk('div','vs-clock-bar');bar.style.width=(Math.max(6,c.tick/165*100)).toFixed(2)+'%';
   append(track,mk('span','',c.label),append(mk('div','vs-clock-track'),bar),
    mk('strong','',String(c.tick)+'t'));
   return track;
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
  append(box,mk('h4','','Experiment B · Unexecuted competent-union comparison'),arm,
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
  const machine=mk('div','vs-machine');
  machine.append(details('Inspect the complete, typed question receipt',pre(p)));
  machine.append(details('Inspect machine task batch (never auto-executed)',
   append(pre(makePodiumTasks(p)),mk('p','vs-custody','The Conductor must be explicitly invoked by its host.'))));
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
