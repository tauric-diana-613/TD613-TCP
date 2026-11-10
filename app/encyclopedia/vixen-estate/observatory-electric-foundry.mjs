/**
 * VIXEN / ELECTRIC FOUNDRY · complete human-facing Observatory.
 *
 * The six flagship instruments are ART-DIRECTED FROM THE ORIGINAL EM CORPUS.
 * 22 canonical Vixen formula folios + six prospective giveback tracks remain
 * available to inspect as proposals, NOT twenty-eight equally polished labs.
 * Loom, Dome-Art, Aperture and Couture supply optical engines only.
 *
 * Single aperture-style host scheduler; no hidden animation or invented
 * human authorization. Experiment B flight and scientific release are HELD.
 */
import {buildVixenLaboratories,assessVixenLab,completeVixenSourceCensus}
 from './observatory-vixen-corpus.mjs';
import {createFoundryRenderer} from './observatory-foundry-renderer.mjs';
import {CARRIERS} from './observatory-foundry-kernel.mjs';

export const ELECTRIC_STAGE_SCHEMA='emstd613.vixen.electric-foundry-stage/v1';
const HEROES=Object.freeze(['LAB_TCC-01','LAB_TCC-04','LAB_TCC-05',
 'LAB_RC-03','LAB_RC-07','LAB_RC-10']);
const TITLES=Object.freeze({
 'LAB_TCC-01':['I · THE CONTROL CATHEDRAL','Non-collapsing constitutive planes'],
 'LAB_TCC-04':['II · THE VELVET VERNIER','Five irreducible time domains'],
 'LAB_TCC-05':['III · ALGEDONIC ARC FLASH','Raw danger versus smoothed response'],
 'LAB_RC-03':['IV · THE [111] MIRROR','Projection that refuses to invert'],
 'LAB_RC-07':['V · THE OBSERVABILITY LIFT','Singular values and rank deficit'],
 'LAB_RC-10':['VI · THE XOR ORACLE','Synergy invisible to isolated witnesses']
});
const node=(tag,className,text)=>{
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(text!==undefined)el.textContent=String(text);
 return el
};
const add=(p,...items)=>{for(const n of items)if(n)p.append(n);return p};
const bounded=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+n)?+n:a));
const number=n=>Number.isFinite(+n)?+n:0;
const pct=n=>Math.round(bounded(n)*100);
const stringify=x=>typeof x==='string'?x:JSON.stringify(x,null,2);
const titleOf=lab=>TITLES[lab.id]?.[0]||lab.name;
const claim=(text)=>node('p','ef-custody',text);
const BTN=(name,fn,cls='ef-button')=>{
 const button=node('button',cls,name);
 button.type='button';button.addEventListener('click',fn);
 return button;
};
function declaration(corpus){
 const m=JSON.parse(document.getElementById('vixen-corpus-bundle')?.textContent||'null');
 return corpus||m;
}
function diagnosticRows(probe){
 const list=node('div','ef-metrics');
 for(const metric of probe.metrics){
  const row=node('div','ef-metric');
  add(row,node('small','',metric.name.replaceAll('_',' ')),
   node('strong','',stringify(metric.value)),
   node('span','',metric.unit));
  list.append(row);
 }
 return list
}
function rangeControl(label,key,state,onInput){
 const wrap=node('label','ef-dial');
 const labelLine=node('span','ef-dial-label');
 add(labelLine,node('span','',label),node('output','',pct(state.model[key])+'%'));
 const slider=node('input');
 slider.type='range';slider.min='0';slider.max='100';slider.step='1';
 slider.value=String(pct(state.model[key]));
 slider.dataset.foundryDial=key;
 slider.setAttribute('aria-label',label);
 slider.addEventListener('input',()=>{
  state.model[key]=bounded(slider.value/100);
  labelLine.querySelector('output').textContent=slider.value+'%';
  onInput(key);
 });
 add(wrap,labelLine,slider);return wrap;
}
function label(text){return node('p','ef-kicker',text)}
function ellipsis(s,max=900){
 return String(s||'').length>max?String(s).slice(0,max)+'…':String(s||'')
}
function sourceBadge(lab){
 return node('div','ef-sourcebadge',
  lab.id+' · '+lab.folio_id+' · '+lab.status+' · ORIGINAL VIXEN CORPUS')
}
export async function mountVixenElectricFoundry({
 host=document.getElementById('vixenElectricFoundry'),corpus
}={}){
 if(!host)return Object.freeze({mounted:false,reason:'NO_HOST'});
 let source;
 try{source=declaration(corpus);buildVixenLaboratories(source)}
 catch(e){
  host.replaceChildren(claim('HELD · Original Vixen mathematical corpus unavailable: '+e.message));
  return Object.freeze({mounted:false,reason:'SOURCE_CENSUS_FAILURE'});
 }
 const all=buildVixenLaboratories(source),byId=new Map(all.map(l=>[l.id,l]));
 const state={
  labId:HEROES[0],model:{gain:.72,witness:.88,voltage:.83,twist:.45},
  pointer:{x:0,y:0},locked:false,playing:true,time:0,
  raf:0,frames:0,last:0,lastPaint:0,
  renderer:null,readout:null,canvas:null,bench:null,phase:'NOTICE',
  history:[],probe:null,held:null,visible:false,
  initialized:false,renderingBackend:'PENDING',
  selectedCatalogueGroup:'UNIFIED'
 };
 const log=(event,extra={})=>{
  state.history.push(Object.freeze({seq:state.history.length+1,event,clock:state.time,
   source_estate:'EMSTD613',evidence_class:'SESSION_LOCAL_SIMULATION_ONLY',...extra}));
  if(state.history.length>100)state.history.shift();
 };
 const lab=()=>byId.get(state.labId);
 const probe=()=>assessVixenLab(source,state.labId,state.model,state.pointer);
 const report=()=>Object.freeze({
  schema:ELECTRIC_STAGE_SCHEMA,active_lab:state.labId,
  stage:state.phase,backend:state.renderingBackend,
  frames:state.frames,source_folios:22,source_giveback_tracks:6,
  flagship_curated:HEROES.length,registry_count:all.length,
  historical_original_corpus:'EMSTD613',empirical_credit:0,
  experiment_b_flight:'HELD',
  research_estates_separated:true,source_declared_not_reauthenticated:true
 });
 function indicate(reason){
  state.probe=probe();
  state.phase=reason==='PIN'?'PINNED_PROBE':'EXPERIMENTAL_VIEW';
  const r=state.readout;if(!r)return;
  r.replaceChildren();
  const p=state.probe;
  add(r,label('LIVE COMPUTATIONAL INSPECTOR · MODEL OUTPUT'),
   node('h3','',lab().name),sourceBadge(lab()),
   diagnosticRows(p),
   claim('Synthetic parameters and original Vixen folio labels are distinct evidence classes. No original manuscript body or independent physical witness was acquired.'));
  const raw=node('details','ef-raw');
  add(raw,node('summary','','Inspect typed full probe receipt'),
   node('pre','',JSON.stringify(p,null,2)));
  r.append(raw);
 }
 function paint(){
  if(!state.renderer)return;
  try{
   state.renderer.paint({optic:lab().optic_program,model:state.model,pointer:state.pointer,
    time:state.time});
   state.frames++;
  }catch(e){state.held=String(e.message||e);log('RENDER_REFUSED',{reason:state.held});stop()}
 }
 function canRun(){
  const section=host.closest('.view');
  return !document.hidden&&!!section&&!section.hidden&&state.playing;
 }
 function frame(ms){
  state.raf=0;
  if(!canRun())return;
  const delta=state.last?bounded((ms-state.last)/1000,0,.064):.016;
  state.last=ms;state.time+=delta;
  // Transparent computational update: host owns cadence; no internal RAFs.
  paint();
  if(ms-state.lastPaint>500){state.lastPaint=ms;indicate('TICK')}
  start();
 }
 function start(){
  if(state.raf||!canRun())return;
  state.raf=requestAnimationFrame(frame);
 }
 function stop(){
  if(state.raf)cancelAnimationFrame(state.raf);
  state.raf=0;state.last=0;
 }
 function pulse(reason){
  paint();indicate(reason);start();
 }
 function switchLab(id){
  if(!byId.has(id))return false;
  state.labId=id;state.pointer={x:0,y:0};state.locked=false;
  log('VIXEN_FOLIO_SELECTED',{id,original_formula:lab().formula});
  renderHero();renderCatalogue();
  pulse('SELECT');
  return true;
 }
 function setParameter(key,n){
  if(!Object.prototype.hasOwnProperty.call(state.model,key))return false;
  state.model[key]=bounded(n);
  log('CONTROL_CHANGED',{name:key,value:state.model[key]});
  renderDials();pulse('DIAL');
  return true
 }
 function selectProbe(p,{pin=false}={}){
  state.pointer={x:bounded(p.x,-1,1),y:bounded(p.y,-1,1)};
  if(pin)state.locked=true;
  log(pin?'PROBE_PINNED':'PROBE_MOVED',{position:state.pointer});
  pulse(pin?'PIN':'MOVE');
 }
 function reset(){
  Object.assign(state.model,{gain:.72,witness:.88,voltage:.83,twist:.45});
  state.pointer={x:0,y:0};state.locked=false;state.time=0;
  log('LAB_RESET');renderHero();pulse('RESET');
 }
 function pause(){
  state.playing=false;stop();log('RUN_PAUSED');renderToolbar();return report()
 }
 function resume(){
  state.playing=true;log('RUN_RESUMED');renderToolbar();start();return report()
 }
 function step(){
  stop();state.playing=false;state.time+=1/60;
  log('SINGLE_STEP');paint();indicate('STEP');renderToolbar();
 }
 const display=()=>lab();
 const heroRail=node('div','ef-hero-rail');
 const pane=node('div','ef-pane');
 const toolbar=node('div','ef-toolbar');
 const controls=node('div','ef-controls');
 const evidence=node('div','ef-evidence');
 const gallery=node('div','ef-gallery');
 const score=node('div','ef-score');
 const stage=node('section','ef-stage');
 stage.setAttribute('aria-label','Computed chrome-light field and operator probe');
 const canvas=node('canvas','ef-canvas');
 canvas.id='vixenElectricField';
 canvas.setAttribute('aria-label','Interactive calculated Vixen mathematical optical field; move or click to probe a model coordinate');
 canvas.setAttribute('role','img');
 canvas.tabIndex=0;
 const overlay=node('div','ef-optic-chrome');
 add(overlay,node('div','ef-fiducial'),node('div','ef-crossline'),
  node('div','ef-aperture-ring'),node('div','ef-phase-lock'));
 const sceneBadge=node('div','ef-scene-badge');
 add(stage,canvas,overlay,sceneBadge);
 const readout=node('div','ef-readout');state.readout=readout;state.canvas=canvas;
 const eye=node('div','ef-eye');
 add(eye,stage,readout);
 const heading=node('header','ef-header');
 add(heading,label('01 / ELECTRIC FOUNDRY · VIXEN MATHEMATICAL OPERA'),
  node('h2','ef-heading','A cathedral of computed consequences.'),
  node('p','ef-dek','Six individually choreographed instruments from Em’s original mathematical folios. Every caustic, charge and projection is tied to a declared model; the light makes no claim to prove the world.'));
 const railHeading=label('FLAGSHIP MATHEMATICAL PERFORMANCES · ORIGINAL VIXEN FOLIOS');
 function renderRail(){
  heroRail.replaceChildren();
  for(const id of HEROES){
   const item=byId.get(id),name=TITLES[id][0];
   const b=BTN(name,()=>switchLab(id),'ef-hero-tab');
   b.dataset.labId=id;b.setAttribute('aria-pressed',String(state.labId===id));
   b.append(node('small','',item.folio_id));
   heroRail.append(b);
  }
 }
 function renderToolbar(){
  toolbar.replaceChildren();
  const current=display();
  const top=BTN(state.playing?'Ⅱ · HOLD FIELD':'▷ · PROPAGATE',
   ()=>state.playing?pause():resume(),'ef-toggle');
  top.setAttribute('aria-pressed',String(!state.playing));
  add(toolbar,top,
   BTN('→ SINGLE FRAME',step),
   BTN('↺ RESET LAB',reset),
   node('span','ef-stage-state',
    (state.playing?'FIELD LIVE':'FIELD HELD')+' · '+state.renderingBackend));
  sceneBadge.textContent=current.folio_id+' · '+current.research_family+
   ' · '+(state.playing?'ACTIVE SIMULATION':'PAUSED')+
   ' · NO EMPIRICAL CLAIM';
 }
 function renderDials(){
  controls.replaceChildren();
  add(controls,label('THE FOUR CONTROL SURFACES · NOT FOUR RESEARCH MODELS'),
   rangeControl('Constitutive gain','gain',state,()=>pulse('DIAL')),
   rangeControl('Witness freshness','witness',state,()=>pulse('DIAL')),
   rangeControl('Impulse voltage','voltage',state,()=>pulse('DIAL')),
   rangeControl('Refractive twist','twist',state,()=>pulse('DIAL')));
 }
 function renderScore(){
  score.replaceChildren();
  add(score,label('39 CARRIERS · LOOM-CLASSIFIED OPTICAL CHOREOGRAPHY'),
   node('p','ef-score-note','6 near / 13 mid / 20 far. Strata supply light delivery, never Em authorship.'));
  const grid=node('div','ef-carrier-grid');
  for(const c of CARRIERS){
   const bar=node('i','ef-carrier');
   bar.dataset.plane=c.plane;
   bar.style.setProperty('--carrier-depth',String(c.depth_gain));
   bar.style.setProperty('--carrier-index',String(c.index));
   bar.style.setProperty('--carrier-hue',c.color);
   bar.title='Carrier '+String(c.index+1)+' · '+c.plane;
   grid.append(bar);
  }
  score.append(grid);
 }
 function renderHero(){
  const current=display();
  renderRail();renderToolbar();renderDials();
  pane.replaceChildren();
  add(pane,sourceBadge(current),
   node('h3','ef-lab-title',titleOf(current)),
   node('p','ef-lab-subtitle',current.name),
   node('p','ef-lab-description',ellipsis(current.summary,500)));
  const equation=node('div','ef-equation');
  add(equation,label('SOURCE-RECORDED EQUATION · NEVER A SHADER-INVENTED THEOREM'),
   node('p','',ellipsis(current.formula,440)));
  pane.append(equation);
  const labrefs=node('div','ef-linked-sources');
  add(labrefs,label('DECLARED WORK AND PROTOCOL COORDINATES'),
   claim('Linked Works: '+(current.work_refs.length?current.work_refs.join(' · '):'No direct Work correspondence declared in this folio')),
   claim('Documentary methods: '+(current.instrument_refs.length?current.instrument_refs.join(' · '):'No direct method declared')),
   claim('Authority: '+current.ceiling));
  pane.append(labrefs);
 }
 function renderCatalogue(){
  gallery.replaceChildren();
  add(gallery,label('THE SOURCE REGISTRY · 22 FOLIOS + 6 GIVEBACK ROUTES'),
   claim('The six headliners are rendered as authored computational performances. Other source entries remain a catalogue of prospective reference projections, not twenty-eight completed spectacles.'));
  const picker=node('div','ef-gallery-tabs');
  for(const [id,text] of [['UNIFIED','TCC · 8'],['COUTURE','RC · 14'],['GIVEBACK','GIVEBACK · 6']]){
   const b=BTN(text,()=>{state.selectedCatalogueGroup=id;renderCatalogue()},'ef-gallery-tab');
   b.setAttribute('aria-pressed',String(state.selectedCatalogueGroup===id));
   picker.append(b)
  }
  gallery.append(picker);
  const list=node('div','ef-gallery-list');
  const subset=all.filter(l=>state.selectedCatalogueGroup==='GIVEBACK'?
   l.kind==='PROSPECTIVE_GIVEBACK_SIMULATION':
   l.kind==='CANONICAL_FORMULA_SIMULATION'&&(
    state.selectedCatalogueGroup==='UNIFIED'?l.folio_id.startsWith('TCC-'):l.folio_id.startsWith('RC-')));
  for(const item of subset){
   const b=BTN(item.folio_id+' · '+item.name,()=>switchLab(item.id),'ef-gallery-item');
   b.setAttribute('aria-pressed',String(item.id===state.labId));
   list.append(b);
  }
  gallery.append(list);
 }
 function renderEvidence(){
  evidence.replaceChildren();
  const c=completeVixenSourceCensus(source);
  const grid=node('div','ef-census');
  for(const [name,value] of [['ORIGINAL WORKS',c.source_work_count],
    ['FORMAL FOLIOS',c.source_formula_labs],['GIVEBACK ROUTES',c.source_track_labs],
    ['LIVE CARRIERS',c.optical_strata]]){
   const e=node('div','ef-census-cell');
   add(e,node('strong','',String(value)),node('small','',name));grid.append(e);
  }
  add(evidence,grid,claim('OPERAHOUSE ≠ OPERA ≠ PERFORMER. Dome-Art, Loom, Aperture and Couture are borrowed instrument engines. All rendered mathematical subjects, equations and linked Works originate from Vixen’s own source registry. Experiment B protected Flight HELD.'));
 }
 host.replaceChildren();
 host.dataset.stageRole='VIXEN_OPERA';
 // The live computed field is the centerpiece, not a reward after a wall
 // of metadata. Source folio and provenance remain visible in its inspector.
 add(host,heading,railHeading,heroRail,toolbar,eye,pane,controls,score,evidence,gallery);
 renderScore();renderEvidence();renderHero();renderCatalogue();
 stage.tabIndex=0;
 stage.setAttribute('aria-label','Calculated Vixen optical field; arrow keys move the computational probe; click to pin');
 const rectToProbe=(event)=>{
  const rect=state.canvas.getBoundingClientRect();
  return {
   x:((event.clientX-rect.left)/Math.max(1,rect.width))*2-1,
   y:1-((event.clientY-rect.top)/Math.max(1,rect.height))*2
  };
 };
 stage.addEventListener('pointermove',e=>{
  if(state.locked)return;
  const p=rectToProbe(e);state.pointer={x:bounded(p.x,-1,1),y:bounded(p.y,-1,1)};
 });
 stage.addEventListener('click',e=>selectProbe(rectToProbe(e),{pin:true}));
 stage.addEventListener('keydown',e=>{
  const ds={ArrowLeft:[-.075,0],ArrowRight:[.075,0],
   ArrowUp:[0,.075],ArrowDown:[0,-.075]};
  if(ds[e.key]){
   e.preventDefault();
   selectProbe({x:state.pointer.x+ds[e.key][0],y:state.pointer.y+ds[e.key][1]},{pin:true});
  }else if(e.key===' '){e.preventDefault();state.playing?pause():resume()}
  else if(e.key==='Escape'){state.locked=false;indicate('UNPIN')}
 });
 stage.addEventListener('contextmenu',e=>{e.preventDefault();state.locked=false;indicate('UNPIN')});
 stage.addEventListener('webglcontextlost',e=>{
  e.preventDefault();stop();state.held='GPU_CONTEXT_LOST';log('GPU_CONTEXT_LOST');
 });
 const status=()=>{
  const active=state.renderer?.status?.();
  return Object.freeze({...report(),renderer:active,history:state.history.slice(-30)});
 };
 // Recreate the canvas if WebGL init rendered the original incompatible with
 // CPU fallback. This is a contextual engine replacement, not model promotion.
 async function initialize(){
  if(state.initialized)return;
  state.initialized=true;
  try{
   state.renderer=await createFoundryRenderer(canvas);
  }catch(first){
   log('GPU_BACKEND_REFUSED',{reason:String(first)});
   const clone=canvas.cloneNode(false);
   clone.id='vixenElectricField';
   canvas.replaceWith(clone);
   state.canvas=clone;
   state.renderer=await createFoundryRenderer(clone,{preferGPU:false});
  }
  state.renderingBackend=state.renderer.status().backend;
  state.renderer.resize();
  renderToolbar();paint();indicate('BOOT');start();
  window.dispatchEvent(new CustomEvent('vixen-electric-foundry-ready',{detail:status()}));
 }
 // Runtime starts only while its Opera is the active stage. A source-verified
 // mathematical instrument may exist without a continuous hidden animation.
 const section=host.closest('.view');
 if(section){
  section.dataset.foundryMounted='true';
  window.VIXEN_LEGACY_OBSERVATORY_STOP?.();
 }
 const watch=new MutationObserver(()=>{
  if(!section?.hidden){
   if(!state.renderer)initialize();
   else {state.renderer.resize();paint();start();}
  }else stop();
 });
 if(section)watch.observe(section,{attributes:true,attributeFilter:['hidden']});
 const viewport=new ResizeObserver(()=>{
  if(state.renderer&&section&&!section.hidden){state.renderer.resize();paint()}
 });
 viewport.observe(stage);
 const visibility=()=>{if(!document.hidden)start();else stop()};
 document.addEventListener('visibilitychange',visibility);
 log('FOUNDRY_REGISTERED',{original_census:completeVixenSourceCensus(source)});
 if(section&&!section.hidden)await initialize();
 const api=Object.freeze({
  mounted:true,source_estate:'EMSTD613',installed_flagships:HEROES.slice(),
  registered_source_projections:all.length,
  status,selectLab:switchLab,setParameter,selectProbe,pause,resume,step,
  renderOnce:()=>{paint();indicate('OPERATOR_FRAME');return status()},
  getResearchProbe:()=>state.probe,
  dispose(){
   stop();watch.disconnect();viewport.disconnect();
   document.removeEventListener('visibilitychange',visibility);
   state.renderer?.dispose();
  }
 });
 window.VIXEN_ELECTRIC_FOUNDRY=api;
 return api;
}
if(typeof document!=='undefined'){
 const target=document.getElementById('vixenElectricFoundry');
 if(target)mountVixenElectricFoundry({host:target}).catch(e=>{
  target.replaceChildren(claim('HELD · FOUNDRY BOOT ERROR: '+String(e.message||e)));
 });
}
