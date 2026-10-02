import {
  LOOM_INSTRUMENT_BENCHES, registerRouteObservation, registerCarrierObservation,
  registerReceiverObservation, validateReceiverSwapDesign, measureConditionalInformationGain,
  intakeIndependentObservation, prepareSameEpisodeAcquisition
} from '../../engine/loom-instrument-lab.js';
import {
  inspectLoomInstrumentReceiver, auditLoomInstrumentCompression,
  compileLoomInstrumentProfile, expandLoomInstrumentProfile, prepareLoomFireGate, inspectLoomFireGateWitness, runLoomLocalExecutionBenchmark
} from '../../engine/loom-instrument-governance.js';
import { inspectLoomDemoExport } from './demo-contract.js';
import { compilePortableAiaProjection } from '../portable-aia-three-route-invariance.js';
import { mountLoomInstrumentAdvisory } from './instrument-advisory.js';
import { captureBrowserRuntimeEpisode } from '../../engine/dollhouse-claim-lift-runtime.js';
import { deriveLoomServiceResolution } from '../../engine/loom-service-resolution.js';
import { compileLoomInstrumentStateView, mountLoomInstrumentStateView } from './instrument-state-view.js';

// These examples belong to this fictional proving surface, never shared core.
export const LOOM_LAB_PRACTICE_INPUTS = Object.freeze({
  route: { metric:'declared traversal steps', baseline:2, observations:[{route_id:'control',value:2},{route_id:'protected',value:3}] },
  carrier: { carriers:[{carrier_id:'envelope',layer:'PROCESS',observed:true},{carrier_id:'content',layer:'CONTENT',observed:false}] },
  receiver: { observations:['receiver-a','receiver-b'].map((receiver_apparatus_id,i)=>({receiver_apparatus_id,artifact_digest:'fictional-artifact',route_digest:'fictional-route',carrier_id:'content',metric:'declared score',value:i})) },
  'receiver-substitution': { left:{artifact_digest:'fictional-artifact',route_digest:'fictional-route',carrier_id:'content',provenance_state_digest:'fictional-state',source_custody_digest:'fictional-custody',observation_window_id:'fictional-window',receiver_apparatus_id:'receiver-a'}, right:{artifact_digest:'fictional-artifact',route_digest:'fictional-route',carrier_id:'content',provenance_state_digest:'fictional-state',source_custody_digest:'fictional-custody',observation_window_id:'fictional-window',receiver_apparatus_id:'receiver-b'} },
  'information-gain': {distribution:[{origin:'a',record:'same',witness:'a',probability:.5},{origin:'b',record:'same',witness:'b',probability:.5}],derived_from_admitted_record:false},
  witness: {source_id:'fictional-source',source_revision:'fictional-revision',episode_id:'fictional-episode',custody_reference:'fictional-custody',measurement_reference:'fictional-measurement',comparison_frame_id:'fictional-frame',derived_from_admitted_record:false,independently_governed:true,shares_upstream_source:false},
  acquisition: {episode_id:'fictional-episode',comparison_frame_id:'fictional-frame',common_departure_id:'fictional-departure',custody_plan_reference:'fictional-custody-plan',preregistration_reference:'fictional-preregistration',immutable_episode:true,continuous_custody:true,measurements_present:false,routes:[{route_id:'control',role:'CONTROL',return_observation_id:'return-control'},{route_id:'protected',role:'PROTECTED',return_observation_id:'return-protected'}],surfaces:{L:'observer leakage plan',R:'reconstruction plan',J:'joining plan',G:'geometry plan',C:'matched return plan'}},
  compression: {states:[{id:'current',conditioning:{stage:'ADMITTED',head:'CURRENT',surface:'same-view'},support:['REST','EXIT','EXPORT_CURRENT']},{id:'stale',conditioning:{stage:'ADMITTED',head:'STALE',surface:'same-view'},support:['REST','EXIT']}],retain:['surface']},
  'receiver-assurance': {},
  'export-history': {},
  'service-resolution': {source_revision:'fictional-revision',workspace:{events:[]}},
  'fire-preparation': {episode_id:'fictional-episode',source_revision:'working-tree',question:'Compare one independently observed return.',routes:[{id:'external-route',kind:'EXTERNAL_MEASUREMENT'}],measurements:[{id:'m1',route_id:'external-route',observable:'Independently recorded completion state'}]},
  'fire-witness': {plan:{},witness:{}},
  'local-execution': {sourceRevision:'working-tree'},
  'route-invariance': {ruleId:'COMMON_API_KEY_BLOCK',routeMode:'TD613_HOSTED',policyDigest:'sha256:'+'a'.repeat(64),sourceStateDigest:'sha256:'+'b'.repeat(64),receiptId:'fictional-receipt'}
});
const benches = [...LOOM_INSTRUMENT_BENCHES,
  {id:'route-invariance',label:'Governance across receiver routes',scope:'Compare canonical rule projections under distinct host presentations.'},
  {id:'local-execution',label:'Local execution & recovery',scope:'Execute the bounded fictional governor close, fresh-instance and recovery benchmark.'},
  {id:'compression',label:'Representation & action support',scope:'Find lawful distinctions lost by a finite projection.'},
  {id:'export-history',label:'Return & export history',scope:'Inspect a saved Loom result or native continuation chain after return or reload. Review grants no live custody.'},
  {id:'receiver-assurance',label:'Portable AIA assurance',scope:'Recompute representation and receiver binding separately.'},
  {id:'service-resolution',label:'Route resolution',scope:'Inspect one complete service need, recovery and avoidable rework.'},
  {id:'fire-preparation',label:'Fire Gate · prepare',scope:'Prepare a consequential measurement. Execution remains held.'},
  {id:'fire-witness',label:'Fire Gate · witness intake',scope:'Check declared witness consistency. Independent authentication stays separate.'}
];
const runners = {
  'export-history':inspectLoomDemoExport,'route-invariance':compilePortableAiaProjection,'local-execution':runLoomLocalExecutionBenchmark,
  route:registerRouteObservation,carrier:registerCarrierObservation,receiver:registerReceiverObservation,
  'receiver-substitution':validateReceiverSwapDesign,'information-gain':measureConditionalInformationGain,
  witness:intakeIndependentObservation,acquisition:prepareSameEpisodeAcquisition,
  compression:auditLoomInstrumentCompression,'receiver-assurance':inspectLoomInstrumentReceiver,
  'service-resolution':deriveLoomServiceResolution,'fire-preparation':prepareLoomFireGate,'fire-witness':inspectLoomFireGateWitness
};

export function mountLoomInstrumentLab(root,{environment=root?.ownerDocument?.defaultView,coordinator,observe=()=>({})}={}) {
  if(!root)return null;
  const doc=root.ownerDocument;
  const entrance=root.closest('details');
  root.innerHTML=`<header class="il-head"><p class="mark">OBSERVATION / PREPARATION</p><h2>Follow the state.<br>Question the evidence.</h2><p>Local instruments compare the inputs you choose. A result can prepare a crossing; admission and execution each keep their own gate.</p></header>
    <section id="ilState" class="il-state" aria-label="Operational state-transition visualization"></section>
    <p id="ilStateStatus" class="il-state-note">Recent client request events · shared Flow-Core clock · a local view of this tab</p>
    <div class="il-boundaries" aria-label="Distinct authority boundaries"><span><b>Instrument Lab</b>Observe & prepare</span><span><b>Loom Gate</b>Admit & revalidate</span><span><b>Fire Gate</b>Execute & acquire</span></div>
    <section class="il-bench" aria-labelledby="ilBenchHeading"><p class="mark">CHOOSE A MEASUREMENT</p><h3 id="ilBenchHeading">Measurement bench</h3><label for="ilBench">Instrument</label><select id="ilBench"></select><p id="ilScope"></p>
      <div class="il-actions"><button type="button" id="ilPractice">Load practice input</button><label class="il-upload">Import JSON<input id="ilUpload" type="file" accept=".json,application/json" aria-label="Import local assay JSON"></label></div>
      <label for="ilInput">Declared input · stays in this tab</label><textarea id="ilInput" spellcheck="false" maxlength="131072" rows="7" placeholder="Load a fictional example, or enter the finite input for this instrument."></textarea>
      <p id="ilInputClass" class="il-note">No input selected. Loading an example performs no assay.</p>
      <div class="il-actions"><button type="button" id="ilRun">Run local assay</button><button type="button" id="ilRest">𝄐 Rest</button><button type="button" id="ilResume" hidden>Resume current view</button><a id="ilReturn" href="#loomAiWorkspace">Return to work ↗</a></div>
      <button type="button" id="ilCapture">Capture this browser episode</button><p id="ilStatus" role="status" aria-live="polite">Choose an instrument. Nothing calculated or sent.</p>
      <section id="ilResult" hidden aria-label="Bounded assay result"><p id="ilResultStatus" class="mark"></p><h3 id="ilFinding"></h3><p id="ilLimit">Local analysis of declared inputs. Source authenticity, custody admission and empirical claims require separate evidence.</p>
        <div class="il-actions" role="group" aria-label="Receipt depth"><button id="ilQuick" type="button" aria-pressed="true">Quick</button><button id="ilDeep" type="button" aria-pressed="false">Deep</button><button id="ilSave" type="button">Save assay receipt</button></div>
        <p class="il-note">Quick and Deep preserve the same governing state. Deep opens the exact receipt.</p>
        <details id="ilExact"><summary>Inspect input scope & exact receipt</summary><pre id="ilReceipt"></pre></details>
      </section>
    </section>
    <details class="il-gate"><summary>Loom Gate · inspect current custody</summary><p>Admission belongs to the returned-work controls in the workspace. The Lab reads their current state and cannot advance it.</p><button id="ilCustody" type="button">Inspect this tab’s custody</button><p id="ilCustodyStatus" role="status"></p><pre id="ilCustodyReceipt" hidden></pre><a href="#aiReentryWorkspace">Open returned-work controls ↗</a></details>
    <details class="il-gate"><summary>Fire Gate · consequential execution</summary><p>Prepare the episode and review its witness with the Fire Gate instruments above. The current Lab holds external execution until an authenticated, reviewed execution contract binds the route, operator and source.</p><p class="mark">EXTERNAL ACQUISITION HELD</p><section id="ilAdvisory" aria-label="Optional model explanation"></section><p class="il-note">An SHI-shaped value, a prepared plan or a local GREEN calculation grants no execution authority.</p></details>`;
  const $=id=>root.querySelector(`#${id}`);
  for(const bench of benches){const option=doc.createElement('option');option.value=bench.id;option.textContent=bench.label;$('ilBench').append(option);}
  const view=mountLoomInstrumentStateView($('ilState'));
  const advisory=mountLoomInstrumentAdvisory($('ilAdvisory'),{environment});
  let latestSnapshot=null,lastPacket=null,liveView=null,generation=0,receipt=null,inputClass='DECLARED_INPUT',paused=false,disposed=false,profile='quick',calculation=0;
  const listeners=[];
  const listen=(node,event,fn)=>{node.addEventListener(event,fn);listeners.push(()=>node.removeEventListener(event,fn));};
  function clear(message){calculation++;receipt=null;$('ilResult').hidden=true;$('ilReceipt').textContent='';$('ilExact').open=false;$('ilStatus').textContent=message;root.dataset.assayState='NOT_RUN';}
  function choose(){clear('Instrument changed. Load or enter its input, then run the local assay.');$('ilInput').value='';inputClass='DECLARED_INPUT';$('ilInputClass').textContent='No input selected. Loading an example performs no assay.';$('ilScope').textContent=benches.find(x=>x.id===$('ilBench').value).scope;}
  function showReceipt(){if(!receipt)return;const projected=compileLoomInstrumentProfile(receipt,{profile});$('ilReceipt').textContent=JSON.stringify(expandLoomInstrumentProfile(projected),null,2);$('ilQuick').setAttribute('aria-pressed',String(profile==='quick'));$('ilDeep').setAttribute('aria-pressed',String(profile==='deep'));$('ilExact').open=profile==='deep';}
  function finding(value){
    if(value.assay==='CONDITIONAL_INFORMATION_GAIN')return typeof value.conditional_information_bits==='number'&&Number.isFinite(value.conditional_information_bits)?`${value.conditional_information_bits.toFixed(6)} bits in the declared finite model`:'Information gain remains held. Repair the finite distribution.';
    if(value.assay==='ROUTE_OBSERVATION')return 'Path differences remain attached to their declared measurements.';
    if(value.assay==='RECEIVER_SWAP_DESIGN')return value.status==='DESIGN_READY'?'A controlled receiver comparison is ready for review.':'The receiver comparison needs repair.';
    if($('ilBench').value==='compression')return 'Inspect which actions survive the projection.';
    if($('ilBench').value.startsWith('fire'))return 'Execution and independent witness qualification stay separately held.';
    if(value.status==='INADMISSIBLE')return 'Repair the declared input before using this result.';
    if(value.status==='HELD')return 'This input leaves an evidentiary requirement unresolved.';
    return 'The bounded result is ready to inspect.';
  }
  async function run(){
    const token=++calculation;receipt=null;$('ilResult').hidden=true;$('ilRun').disabled=true;
    try{
      const raw=$('ilInput').value;if(!raw.trim())throw new Error('Load or enter an input first.');
      if(raw.length>131072)throw new Error('The local input exceeds 128 KiB.');
      const input=JSON.parse(raw);
      if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('The input must be a JSON object.');
      const result=await runners[$('ilBench').value](input,environment);
      if(disposed||token!==calculation)return;
      receipt={schema:'td613.loom.instrument-assay-receipt/v0.1',instrument:$('ilBench').value,input_class:inputClass,observed_at:new Date().toISOString(),result,authority:{admission:false,execution:false,empirical_claim:false}};
      root.dataset.assayState=result.status||result.verdict||result.execution_state||'LAB_RESULT';$('ilResultStatus').textContent=`${result.status||result.verdict||result.execution_state||'LOCAL_RESULT'} · ${inputClass==='FICTIONAL_PRACTICE'?'fictional practice':'declared input'}`;$('ilFinding').textContent=finding(result);$('ilResult').hidden=false;showReceipt();$('ilStatus').textContent='Local calculation complete. Inspect its scope before drawing a conclusion.';
    }catch(error){if(token===calculation&&!disposed){root.dataset.assayState='INADMISSIBLE';$('ilStatus').textContent=`Input held · ${error.message}`;}}
    finally{if(!disposed)$('ilRun').disabled=false;}
  }
  function renderSnapshot(snapshot){
    latestSnapshot=snapshot;
    if(disposed||doc.hidden||entrance?.open===false)return;
    if(snapshot.packet!==lastPacket){
      lastPacket=snapshot.packet;liveView=null;const token=++generation;
      const observation=observe();
      Promise.resolve(compileLoomInstrumentStateView(snapshot.packet,{sourceRevision:observation.source_revision||'working-tree',eventHistory:observation.events||[],replay:observation.replay?.index!=null})).then(compiled=>{
        if(disposed||token!==generation)return;liveView=compiled;if(doc.hidden||entrance?.open===false)return;view.update(compiled,{...snapshot,rest:paused||snapshot.rest});$('ilStateStatus').textContent='Recent client request events · shared Flow-Core clock · a local view of this tab';
      }).catch(error=>{if(!disposed&&token===generation)$('ilStateStatus').textContent=`State projection held · ${error.message}`;});
    }else if(liveView)view.update(liveView,{...snapshot,rest:paused||snapshot.rest});
  }
  if(entrance)listen(entrance,'toggle',()=>{if(!entrance.open){generation++;lastPacket=null;liveView=null;return;}if(latestSnapshot)renderSnapshot(latestSnapshot);});
  const unregister=coordinator?.registerPass('instrument-lab-state',renderSnapshot);
  listen($('ilBench'),'change',choose);
  listen($('ilPractice'),'click',()=>{clear('Fictional input loaded. Run local assay to calculate it.');$('ilInput').value=JSON.stringify(LOOM_LAB_PRACTICE_INPUTS[$('ilBench').value],null,2);inputClass='FICTIONAL_PRACTICE';$('ilInputClass').textContent='Fictional practice input · no measurement or authority created by loading.';});
  listen($('ilInput'),'input',()=>{clear('Input changed. The earlier result no longer applies.');inputClass='DECLARED_INPUT';$('ilInputClass').textContent='Operator-edited declaration · source authenticity remains unverified.';});
  listen($('ilUpload'),'change',async()=>{
    const file=$('ilUpload').files?.[0];if(!file)return;clear('Reading local JSON. The earlier result no longer applies.');const token=calculation;
    try{if(file.size>131072)throw new Error('Use a JSON file under 128 KiB.');const text=await file.text();JSON.parse(text);if(disposed||token!==calculation)return;clear('JSON loaded locally. Review it, then run the assay.');$('ilInput').value=text;inputClass='DECLARED_INPUT';$('ilInputClass').textContent='Local JSON declaration · nothing uploaded to a server.';}catch(error){if(!disposed)$('ilStatus').textContent=`Import held · ${error.message}`;}finally{$('ilUpload').value='';}
  });
  listen($('ilRun'),'click',run);
  listen($('ilCapture'),'click',()=>{clear('Browser episode captured locally. This identifies runtime geometry, with physical hardware and source authentication unresolved.');const observation=observe();const result=captureBrowserRuntimeEpisode(environment,{source_revision:observation.source_revision||'UNPINNED_BROWSER_SOURCE'});receipt={schema:'td613.loom.instrument-assay-receipt/v0.1',instrument:'browser-episode',input_class:'LOCAL_BROWSER_RUNTIME_OBSERVATION',result,authority:{admission:false,execution:false,empirical_claim:false}};$('ilResultStatus').textContent='OBSERVED · local browser runtime';$('ilFinding').textContent='This viewport and runtime were observed in this tab.';$('ilResult').hidden=false;showReceipt();});
  listen($('ilRest'),'click',()=>{paused=true;$('ilState').dataset.still='true';$('ilResume').hidden=false;$('ilStatus').textContent='𝄐 Display at rest. Input and receipt are preserved; the real request can still progress. Resume the current view when ready.';if(latestSnapshot)renderSnapshot(latestSnapshot);});
  listen($('ilResume'),'click',()=>{paused=false;$('ilState').dataset.still='false';$('ilResume').hidden=true;$('ilStatus').textContent='Current view resumed. Nothing recalculated or sent.';if(latestSnapshot)renderSnapshot(latestSnapshot);});
  listen($('ilQuick'),'click',()=>{profile='quick';showReceipt();});listen($('ilDeep'),'click',()=>{profile='deep';showReceipt();});
  listen($('ilCustody'),'click',()=>{const observation=observe();const record=observation.reentry;const summary={session_present:Boolean(record?.session),state:record?.state||'NO_ACTIVE_CUSTODY',route_history:record?.route_history||[],admission_records:(record?.admission_records||[]).map(x=>({ref:x.ref,at:x.at,status:x.status})),challenge_status:observation.challenge?.status||null,lab_admission_authority:false};$('ilCustodyStatus').textContent=record?.session?'Local custody record exists. Its source-bound Check/Admit controls keep authority.':'No live custody lane is visible in this tab.';$('ilCustodyReceipt').hidden=false;$('ilCustodyReceipt').textContent=JSON.stringify(summary,null,2);});
  listen($('ilSave'),'click',()=>{if(!receipt)return;const url=environment.URL.createObjectURL(new environment.Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}));const a=doc.createElement('a');a.href=url;a.download='loom-instrument-assay.json';a.click();environment.URL.revokeObjectURL(url);});
  choose();
  return {inspect:()=>({receipt,input_class:inputClass,profile,paused}),dispose(){disposed=true;generation++;calculation++;unregister?.();listeners.forEach(remove=>remove());view.destroy?.();advisory?.dispose();root.replaceChildren();}};
}
