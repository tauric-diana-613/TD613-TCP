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
import {paintComputationalScore} from './observatory-computational-score.mjs';
import {CARRIERS} from './observatory-foundry-kernel.mjs';
import {globalMotionHeld} from './vixen-motion-governor.mjs';
import {createObservatoryComposerDeck} from './observatory-composer-deck.mjs';
import {measureObservatoryOpticalInstrument} from './observatory-optical-instrument-contract.mjs';

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
 host=document.getElementById('vixenElectricFoundry'),corpus,composerHost=null
}={}){
 // The browser's default auto-mount supplies NO human approval capability.
 // Only an independent trusted application host may supply these callbacks.
 // User task JSON and window globals are never treated as human authority.
 if(!host)return Object.freeze({mounted:false,reason:'NO_HOST'});
 let source;
 try{source=declaration(corpus);buildVixenLaboratories(source)}
 catch(e){
  host.replaceChildren(claim('HELD · Original Vixen mathematical corpus unavailable: '+e.message));
  return Object.freeze({mounted:false,reason:'SOURCE_CENSUS_FAILURE'});
 }
 const all=buildVixenLaboratories(source),byId=new Map(all.map(l=>[l.id,l]));
 const permittedSourceIds=new Set(source.works.flatMap(w=>[
  w.work_id,...w.linked_sources.map(x=>x.source_file_id)]));
 const state={
  labId:HEROES[0],model:{gain:.72,witness:.88,voltage:.83,twist:.45},
  pointer:{x:0,y:0},locked:false,playing:true,time:0,simPhase:0,
  raf:0,frames:0,last:0,lastPaint:0,
  renderer:null,readout:null,canvas:null,bench:null,phase:'NOTICE',
  history:[],probe:null,held:null,visible:false,
  initialized:false,renderingBackend:'PENDING',
  selectedCatalogueGroup:'UNIFIED',
  selectedCarrierPlane:'ALL',selectedCarrierIndex:0,
  inspectorOpen:false,composerBusy:false,composerLastHostTime:-Infinity
 };
 const log=(event,extra={})=>{
  const prev=state.history[state.history.length-1];
  state.history.push(Object.freeze({seq:state.history.length+1,predecessor_seq:prev?prev.seq:null,
   event,clock:state.time,sim_phase:state.simPhase,
   source_estate:'EMSTD613',evidence_class:'SESSION_LOCAL_SIMULATION_ONLY',...extra}));
  if(state.history.length>100)state.history.shift();
 };
 const lab=()=>byId.get(state.labId);
 const probe=()=>assessVixenLab(source,state.labId,state.model,state.pointer);
 const report=()=>Object.freeze({
  schema:ELECTRIC_STAGE_SCHEMA,active_lab:state.labId,
  stage:state.phase,backend:state.renderingBackend,
  frames:state.frames,computational_score:state.scoreState?.schema||'PENDING',
  source_folios:22,source_giveback_tracks:6,
  flagship_curated:HEROES.length,registry_count:all.length,global_still:globalMotionHeld(document),
  historical_original_corpus:'EMSTD613',empirical_credit:0,
  experiment_b_flight:'HELD',
  composer_preview:state.composerDeck?.inspect()||{status:'HELD_UNMOUNTED'},
  research_estates_separated:true,source_declared_not_reauthenticated:true
 });
 function toggleInspector(nextOpen){
  const target=typeof nextOpen==='boolean'?nextOpen:!state.inspectorOpen;
  state.inspectorOpen=target;
  readout.hidden=!target;
  eye.dataset.inspectorOpen=String(target);
  if(target){
   indicate('INSPECTOR_OPEN');
   if(typeof requestAnimationFrame==='function'){
    requestAnimationFrame(()=>{
     const rect=readout.getBoundingClientRect();
     if(rect.height>0&&(rect.bottom>window.innerHeight-20||rect.top<72)){
      readout.scrollIntoView({block:'nearest',behavior:globalMotionHeld(document)?'auto':'smooth'});
     }
    });
   }
  }
  log('INSPECTOR_EXPLICIT_DISCLOSURE',{visible:target});
  renderToolbar();
 }
 function indicate(reason){
  state.probe=probe();
  state.phase=reason==='PIN'?'PINNED_PROBE':'EXPERIMENTAL_VIEW';
  if(typeof updateFoundryHud==='function')updateFoundryHud();
  const r=state.readout;if(!r)return;
  const detailsWasOpen=Boolean(r.querySelector('details.ef-raw[open]'));
  const bar=node('div','ef-readout-bar');
  const closeBtn=BTN('Close Proof ×',()=>toggleInspector(false),'ef-readout-close');
  closeBtn.setAttribute('aria-label','Close the computational proof panel');
  add(bar,label('LIVE COMPUTATIONAL INSPECTOR · MODEL OUTPUT'),closeBtn);
  const p=state.probe;
  const raw=node('details','ef-raw');
  if(detailsWasOpen)raw.open=true;
  add(raw,node('summary','','Inspect typed full probe receipt'),
   node('pre','',JSON.stringify(p,null,2)));
  r.replaceChildren(bar,
   node('h3','',lab().name),sourceBadge(lab()),
   diagnosticRows(p),
   claim('Synthetic foundry parameters and companion Experiment-A corpus bodies remain distinct evidence classes (zero empirical physical-witness replication credit; model output stays bounded and non-authoritative).'),
   raw);
 }
 function paintRoomMesh(force=false){
  if(document.body.dataset.vixenOpticalMeshObservatory==='off')return;
  const opticalField=state.composerDeck?.visualField?.()||null;
  window.VixenLivingMesh?.renderHostFrame?.({time:state.time,view:'observatory',
   sourceIds:opticalField?.source_ids||[],opticalField,
   held:!state.playing||globalMotionHeld(document),force});
 }
 function paint(force=false){
  if(!state.renderer)return;
  try{
   state.renderer.paint({optic:lab().optic_program,model:state.model,pointer:state.pointer,
    time:state.simPhase});
   state.scoreState=paintComputationalScore(state.notation,{
    labId:state.labId,model:state.model,pointer:state.pointer,time:state.simPhase
   });
   // Optional full-viewport lighting borrows the Foundry clock.
   paintRoomMesh(force);
   // The approved visual is a separate overlay, fed by THIS host clock.
   // No dynamic module selection, unreviewed code or independent RAF here.
   if(state.composerDeck?.inspect().current_form_id&&!state.composerBusy&&
      (force||state.time-state.composerLastHostTime>=1/24)){
    state.composerBusy=true;state.composerLastHostTime=state.time;
    // One Foundry-owned RAF; bounded async preview paints, no child clock.
    void state.composerDeck.paint({lab_id:state.labId,frame:{
     time:state.simPhase,model:{...state.model},pointer:{...state.pointer}
    }}).then(verdict=>{
     if(verdict.status!=='SUPPORTED_PREVIEW_ONLY')updateComposerReview();
    }).catch(()=>{
     state.composerDeck.revert('HELD_COMPOSER_PAINT_REJECTION');
     updateComposerReview();
    }).finally(()=>{state.composerBusy=false;});
   }
   state.frames++;
  }catch(e){state.held=String(e.message||e);log('RENDER_REFUSED',{reason:state.held});stop()}
 }
 function canRun(){
  const section=host.closest('.view');
  return !globalMotionHeld(document)&&!!section&&!section.hidden&&state.playing;
 }
 function frame(ms){
  state.raf=0;
  if(!canRun())return;
  const delta=state.last?bounded((ms-state.last)/1000,0,.064):.016;
  state.last=ms;state.time+=delta;state.simPhase+=delta;
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
  paint(true);indicate(reason);start();
 }
 function switchLab(id){
  if(!byId.has(id))return false;
  if(id!==state.labId){state.composerDeck?.revert('LAB_CHANGED_EXPLICIT_REVIEW_REQUIRED');
   updateComposerReview();}
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
  const prevPhase=state.simPhase;
  Object.assign(state.model,{gain:.72,witness:.88,voltage:.83,twist:.45});
  state.pointer={x:0,y:0};state.locked=false;state.simPhase=0;
  // Monotonic custody counter state.time is preserved; only synthetic simulation phase resets.
  log('LAB_RESET',{reset_from_phase:prevPhase,reset_to_phase:0,monotonic_clock:state.time});
  renderHero();pulse('RESET');
 }
 function pause(){
  state.playing=false;stop();log('RUN_PAUSED');renderToolbar();return report()
 }
 function resume(){
  state.playing=true;log('RUN_RESUMED');renderToolbar();start();return report()
 }
 function step(){
  stop();state.playing=false;state.time+=1/60;state.simPhase+=1/60;
  log('SINGLE_STEP');paint(true);indicate('STEP');renderToolbar();
 }
 const display=()=>lab();
 const heroRail=node('div','ef-hero-rail');
 const pane=node('div','ef-pane');
 const toolbar=node('div','ef-toolbar');
 const controls=node('div','ef-controls');
 const dialCabinet=node('details','ef-dial-cabinet');
 const dialInvitation=node('summary','ef-dial-invitation','IV · THE INSTRUMENTS · OPEN FOUR MEASURABLE CONTROLS');
 dialInvitation.setAttribute('aria-label','Open four controls for the synthetic Vixen mathematical model');
 add(dialCabinet,dialInvitation,controls);
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
 const notation=node('canvas','ef-notation');
 notation.setAttribute('aria-hidden','true');
 state.notation=notation;
 const composerCanvas=node('canvas','ef-composer-preview');
 composerCanvas.id='vixenComposerPreviewCanvas';
 composerCanvas.setAttribute('aria-label','Unratified, separately authorized Composer preview; original Observatory exhibit remains preserved');
 composerCanvas.setAttribute('role','img');
 composerCanvas.hidden=true;
 state.composerDeck=createObservatoryComposerDeck({
  canvas:composerCanvas,
  verifyHumanReceipt:typeof composerHost?.verifyHumanReceipt==='function'?composerHost.verifyHumanReceipt:null,
  isScoreCurrent:typeof composerHost?.isScoreCurrent==='function'?composerHost.isScoreCurrent:null,
  reviewedRenderers:Array.isArray(composerHost?.reviewedRenderers)?composerHost.reviewedRenderers:[]
 });
 const composerReview=node('div','ef-composer-review');
 composerReview.setAttribute('role','status');composerReview.setAttribute('aria-live','polite');
 const composerMessage=node('span','ef-composer-review-message',
  'COMPOSER HELD · No independently authorized exhibit substitution');
 const composerRevert=BTN('Restore original exhibit',()=>{
  state.composerDeck.revert('OPERATOR_RESTORE_ORIGINAL');
  updateComposerReview();paintRoomMesh(true);
 },'ef-composer-restore');
 composerRevert.setAttribute('aria-label','Restore original Observatory exhibit');
 composerRevert.hidden=true;add(composerReview,composerMessage,composerRevert);
 function updateComposerReview(){
  const active=state.composerDeck.visualField();
  composerReview.dataset.previewState=active?'PREVIEW_REVIEW':'HELD';
  composerMessage.textContent=active
   ?'REVIEW PREVIEW · '+active.form_id+' · Original exhibit preserved · No canonical change'
   :'COMPOSER HELD · No independently authorized exhibit substitution';
  composerRevert.hidden=!active;
 }
 const overlay=node('div','ef-optic-chrome');
 add(overlay,node('div','ef-fiducial'),node('div','ef-crossline'),
  node('div','ef-aperture-ring'),node('div','ef-phase-lock'));
 const sceneBadge=node('div','ef-scene-badge');
 add(stage,canvas,notation,composerCanvas,overlay,sceneBadge);
 const readout=node('div','ef-readout');state.readout=readout;state.canvas=canvas;
 readout.id='vixenFoundryInspectorReadout';
 readout.hidden=true;
 readout.setAttribute('tabindex','-1');
 const eye=node('div','ef-eye');
 eye.dataset.inspectorOpen='false';
 const iris=node('div','ef-iris-frame');
 iris.setAttribute('aria-label','Vixen computational performance; original folio and synthetic data remain separate');
 add(iris,stage,readout);
 add(eye,iris);
 const heading=node('header','ef-header');
 const headingNwe=node('div','ef-now-why-exact');
 add(headingNwe,
  node('span','ef-nwe-cell','NOW · Choose one ARIA or folio & steer model probe / dials'),
  node('span','ef-nwe-cell','WHY · Observe conditioning, nullspace & clock non-equivalence in browser'),
  node('span','ef-nwe-cell','EXACT · Model-only output · Empirical credit = 0 · Flight HELD')
 );
 add(heading,label('01 / ELECTRIC FOUNDRY · VIXEN MATHEMATICAL OPERA'),
  node('h2','ef-heading','A cathedral of computed consequences.'),
  node('p','ef-dek','Six individually choreographed instruments from Em’s original mathematical folios. Every caustic, charge and projection is tied to a declared model; the light makes no claim to prove the world.'),
  headingNwe);
 const holdBanner=node('div','ef-hold-notice');
 const apertureHud=node('div','vixen-aperture-hud');
 const hudPills=[
  node('span','vixen-hud-pill','APERTURE · SV/RANK LIVE'),
  node('span','vixen-hud-pill','39 CARRIERS (6 NEAR · 13 MID · 20 FAR)'),
  node('span','vixen-hud-pill','MONOTONIC CUSTODY · SIM PHASE RESETTABLE'),
  node('span','vixen-hud-pill','PROBE (0.00, 0.00)'),
  node('span','vixen-hud-pill','OPERAHOUSE ≠ OPERA ≠ PERFORMER')
 ];
 add(apertureHud,...hudPills);
 function updateFoundryHud(){
  const cur=display(),running=state.playing&&!globalMotionHeld(document);
  const p=state.probe;
  const svMetric=p?.metrics?.find?.(m=>m.name==='singular_values')?.value;
  hudPills[0].textContent=svMetric
   ?`APERTURE · rank=${svMetric.rank} · κ=${svMetric.condition_number??'N/A'}`
   :`APERTURE · ${cur.folio_id} (${cur.optic_program})`;
  hudPills[1].textContent=`CARRIERS · 39 (${CARRIERS.filter(c=>c.near).length}/${CARRIERS.filter(c=>c.mid).length}/${CARRIERS.filter(c=>c.far).length})`;
  hudPills[2].textContent=`CLOCK ${state.time.toFixed(2)}s · PHASE ${state.simPhase.toFixed(2)}s · ${state.renderingBackend}`;
  hudPills[3].textContent=`PROBE (${state.pointer.x.toFixed(2)}, ${state.pointer.y.toFixed(2)})${state.locked?' PINNED':''}`;
  hudPills[4].textContent='OPERAHOUSE ≠ OPERA ≠ PERFORMER';
  if(state.held||!running){
   holdBanner.hidden=false;
   holdBanner.textContent=state.held
    ?`HOLD NOTICE · NOW: Renderer halted (${state.held}) · WHY: Fail-closed boundary · EXACT: Empirical credit = 0, use Reset or WebGL fallback.`
    :`HOLD NOTICE · NOW: Field paused/still (${globalMotionHeld(document)?'Global Still active':'Operator paused'}) · WHY: Unpenalized temporal suspension · EXACT: Use Single Frame or Propagate to step.`;
  }else{
   holdBanner.hidden=true;
  }
 }
 const railHeading=label('SIX ARIAS · SOURCE-RECORDED MATHEMATICS');
 const proscenium=node('section','ef-proscenium');
 proscenium.setAttribute('aria-label','Six mathematical arias and live computed Vixen stage');
 const ariaScore=node('nav','ef-aria-score');
 ariaScore.setAttribute('aria-label','Choose one of six original Vixen mathematical performances');
 add(ariaScore,railHeading,heroRail);
 const instrumentStage=node('div','ef-instrument-stage');
 add(instrumentStage,toolbar,eye,composerReview,apertureHud,holdBanner);
 add(proscenium,ariaScore,instrumentStage);
 function renderRail(){
  heroRail.replaceChildren();
  for(const id of HEROES){
   const item=byId.get(id),name=TITLES[id][0];
   const b=BTN(name,()=>switchLab(id),'ef-hero-tab');
   b.dataset.labId=id;b.dataset.ariaNumber=String(HEROES.indexOf(id)+1).padStart(2,'0');
   b.setAttribute('aria-pressed',String(state.labId===id));
   b.append(node('small','',item.folio_id));
   heroRail.append(b);
  }
 }
 function renderToolbar(){
  toolbar.replaceChildren();
  const roomMesh=BTN('ROOM MESH',()=>{
   const enabled=document.body.dataset.vixenOpticalMeshObservatory==='off';
   document.body.dataset.vixenOpticalMeshObservatory=enabled?'on':'off';
   roomMesh.setAttribute('aria-pressed',String(enabled));paintRoomMesh(true);
  },'ef-button ef-mesh-toggle');
  roomMesh.setAttribute('aria-pressed',String(document.body.dataset.vixenOpticalMeshObservatory!=='off'));
  roomMesh.title='Show the ambient cloth around this instrument';
  const inspect=BTN(state.inspectorOpen?'CLOSE THE PROOF ×':'OPEN THE PROOF ⊕',()=>{
    toggleInspector();
  },'ef-inspector-switch');
  inspect.setAttribute('aria-controls',readout.id);
  inspect.setAttribute('aria-expanded',String(state.inspectorOpen));
  inspect.setAttribute('aria-pressed',String(state.inspectorOpen));
  const top=BTN(state.playing?'Ⅱ · HOLD FIELD':'▷ · PROPAGATE',
   ()=>state.playing?pause():resume(),'ef-toggle');
  top.setAttribute('aria-pressed',String(!state.playing));
  add(toolbar,top,
   BTN('→ SINGLE FRAME',step),
   BTN('↺ RESET LAB',reset),
   inspect,roomMesh,
   node('span','ef-stage-state'));
  updateMotionReadout();
 }
 function updateMotionReadout(){
  const current=display(),running=state.playing&&!globalMotionHeld(document);
  const readout=toolbar.querySelector('.ef-stage-state');
  if(readout)readout.textContent=(running?'FIELD LIVE':'FIELD HELD')+' · '+state.renderingBackend;
  sceneBadge.textContent=current.folio_id+' · '+current.research_family+
   ' · '+(running?'ACTIVE SIMULATION':'PAUSED')+
   ' · NO EMPIRICAL CLAIM';
  updateFoundryHud();
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
  const controlsRow=node('div','ef-carrier-controls');
  for(const [pId,pLabel] of [['ALL','ALL 39'],['flight-near','NEAR · 6'],['flight-mid','MID · 13'],['flight-far','FAR · 20']]){
   const btn=BTN(pLabel,()=>{state.selectedCarrierPlane=pId;renderScore();},'ef-carrier-filter');
   btn.setAttribute('aria-pressed',String(state.selectedCarrierPlane===pId));
   controlsRow.append(btn);
  }
  const rc04Target=byId.has('LAB_RC-04')?'LAB_RC-04':(all.find(l=>l.optic_program==='LOOM_39')?.id||null);
  if(rc04Target){
   const jump=BTN('Stage 39-Skin Loom ('+rc04Target.replace('LAB_','')+') ↑',()=>{
    switchLab(rc04Target);
    stage.scrollIntoView?.({behavior:'smooth',block:'nearest'});
   },'ef-carrier-filter ef-carrier-jump');
   controlsRow.append(jump);
  }
  const carrierDetail=node('div','ef-carrier-detail','Select or hover any of the 39 Loom-classified optical carriers to inspect its depth gain and phase plane.');
  const grid=node('div','ef-carrier-grid');
  for(const c of CARRIERS){
   const bar=node('i','ef-carrier');
   bar.dataset.plane=c.plane;
   bar.tabIndex=0;
   bar.style.setProperty('--carrier-depth',String(c.depth_gain));
   bar.style.setProperty('--carrier-index',String(c.index));
   bar.style.setProperty('--carrier-hue',c.color);
   const matched=state.selectedCarrierPlane==='ALL'||state.selectedCarrierPlane===c.plane;
   bar.classList.toggle('is-dimmed',!matched);
   bar.classList.toggle('is-selected',c.index===state.selectedCarrierIndex);
   bar.title='Carrier '+String(c.index+1)+' · '+c.plane+' · depth '+c.depth_gain.toFixed(3);
   const showCarrier=()=>{
    state.selectedCarrierIndex=c.index;
    for(const el of grid.children)el.classList.toggle('is-selected',el===bar);
    carrierDetail.textContent=`CARRIER ${String(c.index+1).padStart(2,'0')}/39 · PLANE: ${c.plane} · DEPTH GAIN: ${c.depth_gain.toFixed(3)} · CSS α: ${c.css_opacity} · CHROMA: ${c.color} · AUTHORITY: VISUAL_ONLY`;
   };
   bar.addEventListener('pointerenter',showCarrier);
   bar.addEventListener('focus',showCarrier);
   bar.addEventListener('click',showCarrier);
   grid.append(bar);
  }
  score.append(controlsRow,grid,carrierDetail);
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
  // Candidate 3's "INVESTIGATE SOURCE" restored as actual native routes
  // into the original Vixen Work/Method registry. No synthetic relationship
  // is inferred from a folio's absence of direct linked Works.
  const sourceDoors=node('nav','ef-investigation-doors');
  sourceDoors.setAttribute('aria-label','Follow Vixen source coordinates');
  const workIds=current.work_refs.slice(0,2);
  for(const workId of workIds){
   const work=source.works.find(w=>w.work_id===workId);
   if(!work)continue;
   const a=node('a','ef-investigate-door','FOLLOW THE SOURCE ↗');
   a.href='#works/'+encodeURIComponent(workId);
   a.title=work.display_title||work.declared_title||workId;
   a.dataset.sourceWork=workId;
   sourceDoors.append(a);
  }
  const methods=current.instrument_refs.filter(id=>source.instruments.some(m=>m.instrument_id===id));
  if(methods.length){
   const a=node('a','ef-investigate-door','EXAMINE THE METHOD ↗');
   a.href='#protocols/'+encodeURIComponent(methods[0]);
   a.dataset.sourceMethod=methods[0];
   sourceDoors.append(a);
  }
  const archive=node('a','ef-investigate-door ef-investigate-secondary','OPEN VIXEN FOLIOS ↗');
  archive.href='#reference';
  sourceDoors.append(archive);
  pane.append(sourceDoors);
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
 add(host,heading,proscenium,pane,dialCabinet,score,evidence,gallery);
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
 const syncGlobalMotion=()=>{if(globalMotionHeld(document))stop();else start();updateMotionReadout();paintRoomMesh(true)};
 const syncFieldLayout=()=>{if(section&&!section.hidden)paintRoomMesh(true)};
 window.addEventListener('vixen:fieldlayout',syncFieldLayout);
 window.addEventListener('vixen:motionchange',syncGlobalMotion);
 log('FOUNDRY_REGISTERED',{original_census:completeVixenSourceCensus(source)});
 if(section&&!section.hidden)await initialize();
 // The machine Podium supplies an exact checked Score receipt. Nothing in
 // this host auto-accepts approval; default browser mount is always HOLD.
 const stageComposerPreview=async({composeReceipt,labId=state.labId}={})=>{
  const target=byId.get(labId);
  if(!target||labId!==state.labId)
   return Object.freeze({status:'HELD_TARGET_LAB_MUST_BE_CURRENT',release_authority:false});
  const changes=composeReceipt?.composition?.changes;
  const visuals=Array.isArray(changes)?changes.filter(x=>x?.type==='VISUAL_FORM_CHANGE'):[];
  const sourceIds=visuals.length===1?visuals[0].source_ids:null;
  if(!Array.isArray(sourceIds)||!sourceIds.length||sourceIds.length>2||
   sourceIds.some(id=>!permittedSourceIds.has(id)))
   return Object.freeze({status:'HELD_UNREGISTERED_CROSS_OPERA_SOURCE',release_authority:false});
  const result=await state.composerDeck.stage({
   composeReceipt,lab_id:target.id,current_form_id:target.optic_program,
   frame:{time:state.simPhase,model:{...state.model},pointer:{...state.pointer}}
  });
  updateComposerReview();
  log('COMPOSER_PREVIEW_REQUEST',{target_lab:labId,status:result.status,
   source_mutation:false,release_authority:false});
  if(result.status!=='SUPPORTED_PREVIEW_ONLY')return result;
  paintRoomMesh(true);
  // Optical audit ≠ displayed-pixel fidelity proof or empirical acquisition.
  const optical_assay=measureObservatoryOpticalInstrument({
   width:360,height:300,dpr:1,time:state.simPhase,sourceIds});
  return Object.freeze({...result,optical_assay,live_site_canonical_mutation:false});
 };
 const api=Object.freeze({
  mounted:true,source_estate:'EMSTD613',installed_flagships:HEROES.slice(),
  registered_source_projections:all.length,
  status,selectLab:switchLab,setParameter,selectProbe,pause,resume,step,
  stageComposerPreview,composerPreviewStatus:()=>state.composerDeck.inspect(),
  approvedVisualField:()=>state.composerDeck.visualField(),
  revertComposerPreview:()=>{
   const result=state.composerDeck.revert('EXPLICIT_OPERATOR_REVERT');
   updateComposerReview();paintRoomMesh(true);return result;
  },
  renderOnce:()=>{paint(true);indicate('OPERATOR_FRAME');return status()},
  getResearchProbe:()=>state.probe,
  dispose(){
   stop();watch.disconnect();viewport.disconnect();
   document.removeEventListener('visibilitychange',visibility);
   window.removeEventListener('vixen:motionchange',syncGlobalMotion);
   window.removeEventListener('vixen:fieldlayout',syncFieldLayout);
   state.composerDeck?.revert('FOUNDRY_DISPOSED');
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
