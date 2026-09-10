/** Hostile synthetic custody checks. These do not establish live provider behavior. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { projectLivingRoomState } from '../app/dome-world/holonomy-loom/living-room-state.js';
import { mountLoomAiWorkspace } from '../app/dome-world/holonomy-loom/ai-workspace.js';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';

const packet = (overrides={}) => ({phase:'pending',shared:2,local:1,selected_document_ids:['brief','costs'],binding_verified:true,
  scene:{id:'synthetic-custody',rules_count:2,documents:[{id:'brief',name:'Selected brief.txt',share:true},{id:'costs',name:'Costs.csv',share:true},{id:'PRIVATE_ID_613',name:'PRIVATE_NAME_613',text:'PRIVATE_BODY_613',share:false}]},...overrides});

test('room projection omits private manifest, arbitrary model content, and payload metadata',()=>{
  const p=packet({phase:'completed',used_document_ids:['brief'],missing_information:['MODEL_MISSING_BODY_613'],
    task:'TASK_BODY_613',protectedTerms:['LOCAL_CANARY_613'],answer:'ANSWER_BODY_613',
    observations:{raw:'MODEL_RAW_613'},local_receipt:{withheld_document_ids:['PRIVATE_ID_613']}});
  const serialized=JSON.stringify(projectLivingRoomState(p));
  for(const forbidden of ['PRIVATE_ID_613','PRIVATE_NAME_613','PRIVATE_BODY_613','MODEL_MISSING_BODY_613','TASK_BODY_613','LOCAL_CANARY_613','ANSWER_BODY_613','MODEL_RAW_613']) assert.equal(serialized.includes(forbidden),false,forbidden);
  assert.match(serialized,/Selected brief\.txt/);
  assert.equal(projectLivingRoomState(p).missingCount,1);
});

test('held-before-send and held-after-send conserve different histories while closing current release',()=>{
  const before=projectLivingRoomState(packet({phase:'held'}));
  const after=projectLivingRoomState(packet({phase:'held',outbound_submitted:true}));
  for(const state of [before,after]){assert.equal(state.gate.blocked,true);assert.equal(state.control.releaseState,'HELD');assert.equal(state.motion.enabled,false);assert.equal(state.responseObserved,false);}
  assert.equal(before.outgoingSubmitted,false);assert.equal(after.outgoingSubmitted,true);
  assert.equal(before.glyphs.some(g=>g.glyph==='出'),false);
  // Historical dispatch remains visible; it never becomes recall or a new release.
  assert.match(after.copy.plain.why,/already submitted/);
  assert.match(after.glyphs.find(g=>g.glyph==='出').cause,/submitted/);
});

test('a rejected response retains arrival without admitting the returned work',()=>{
  const state=projectLivingRoomState(packet({phase:'held',outbound_submitted:true,response_received:true}));
  assert.equal(state.responseObserved,true);assert.equal(state.provider.state,'RESPONSE_OBSERVED');
  assert.equal(state.control.releaseState,'HELD');assert.equal(state.gate.blocked,true);
  assert.equal(state.control.providerActivity,'UNKNOWN');assert.equal(state.receipt.measurementOfHiddenState,false);
});

test('unreported missingness stays distinct from explicit zero and overflow stays counted',()=>{
  const absent=projectLivingRoomState(packet({phase:'completed'}));
  const empty=projectLivingRoomState(packet({phase:'completed',missing_information:[],used_document_ids:[]}));
  const many=projectLivingRoomState(packet({phase:'completed',missing_information:Array.from({length:32},(_,i)=>`Missing ${i}`)}));
  assert.equal(absent.missingCount,null);assert.equal(absent.reportedSourceCount,null);
  assert.equal(empty.missingCount,0);assert.equal(empty.reportedSourceCount,0);
  assert.equal(many.missingCount,32);assert.equal(many.additionalMissingCount,24);
});

test('receiver copy and motion posture cannot alter the same governed control facts',()=>{
  const p=packet({phase:'received',used_document_ids:['brief'],missing_information:['Unknown term']});
  const animated=projectLivingRoomState(p,{progress:.2,motionTimeMs:1234});
  const plainStatic=projectLivingRoomState(p,{progress:1,motionTimeMs:9999,reducedMotion:true});
  const rested=projectLivingRoomState(p,{progress:.8,motionTimeMs:6000,rest:true});
  assert.deepEqual(animated.control,plainStatic.control);assert.deepEqual(animated.control,rested.control);
  assert.notEqual(animated.copy.plain.now,animated.copy.auditor.now);
  assert.equal(plainStatic.motion.enabled,false);assert.equal(rested.motion.enabled,false);
  assert.ok(Object.isFrozen(animated.control));assert.ok(Object.isFrozen(animated.documents));
  assert.throws(()=>{animated.control.releaseState='ADMITTED_FOR_HUMAN_REVIEW';},TypeError);
});

test('unknown source, duplicate source, malformed counts and sparse missingness are rejected',()=>{
  for(const change of [{used_document_ids:['PRIVATE_ID_613']},{used_document_ids:['brief','brief']},{shared:9},{local:-1},{missing_information:new Array(3)}]) assert.throws(()=>projectLivingRoomState(packet({phase:'completed',...change})),TypeError);
});

const until=async predicate=>{const end=Date.now()+3000;while(!predicate()){if(Date.now()>end)throw new Error('Synthetic workspace did not settle');await new Promise(r=>setTimeout(r,5));}};
function harness(t,responder){
  const dom=new JSDOM('<section id="fixture"></section>',{url:'https://td613.com/dome-world/holonomy-loom.html'});
  const window=dom.window,root=window.document.querySelector('#fixture'),calls=[],frames=new Map();let sequence=0;
  const oldRaf=globalThis.requestAnimationFrame,oldCancel=globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame=fn=>{const id=++sequence;frames.set(id,fn);return id;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
  Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.fetch=(url,options)=>{const request=JSON.parse(options.body);calls.push({url,options,request});return Promise.resolve(responder(request,options));};
  const ui=mountLoomAiWorkspace(root,window),$=selector=>root.querySelector(selector);
  t.after(()=>{ui.dispose();window.close();if(oldRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=oldRaf;if(oldCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=oldCancel;});
  $('#aiDemoInvitation').click();$(`[data-project="${LOOM_AI_PROJECTS[0].id}"]`).click();
  return {$,calls,ui,root,window,settle:()=>until(()=>root.getAttribute('aria-busy')!=='true')};
}
const admitted=request=>({schema:'td613.loom.ai-task-result/v0.1',status:'completed',request_id:request.request_id,answer:'Synthetic fixture answer.',missing_information:['Synthetic unresolved condition.'],used_document_ids:request.documents.map(d=>d.id),suggested_next_step:'Inspect the condition.',observations:{provider_calls:1,elapsed_ms:75,source_claims:'model-reported-unverified'}});
const response=(body,status=200)=>({ok:status===200,status,text:async()=>JSON.stringify(body)});

test('actual workspace replay, scrub and receiver switching never repeat HTTP or selected transport',async t=>{
  const h=harness(t,request=>response(admitted(request)));h.$('#aiRun').click();await h.settle();
  assert.equal(h.calls.length,1);const before=JSON.stringify(h.ui.inspect().events);
  const completion=h.ui.inspect().events.find(e=>e.phase==='completed');assert.equal(completion.aia.fadt_admission,true);
  h.$('#aiRoomReplay').click();assert.equal(h.ui.inspect().replay.index,0);
  for(let i=0;i<h.ui.inspect().replay.count;i++){h.$('#aiRoomScrub').value=String(i);h.$('#aiRoomScrub').dispatchEvent(new h.window.Event('input',{bubbles:true}));h.$('#aiAuditor').click();h.$('#aiChild').click();}
  h.$('#aiStillField').click();h.$('#aiRoomLive').click();
  assert.equal(h.calls.length,1);assert.equal(JSON.stringify(h.ui.inspect().events),before);
  for(const doc of LOOM_AI_PROJECTS[0].documents.filter(d=>!d.share)){assert.equal(h.calls[0].options.body.includes(doc.text),false);assert.equal(h.$('#aiLivingRoom').textContent.includes(doc.name),false);}
});

test('stopping an in-flight workspace request preserves submission and never fabricates a return',async t=>{
  const h=harness(t,(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Stopped','AbortError')),{once:true})));
  h.$('#aiRun').click();await until(()=>h.calls.length===1);h.$('#aiStop').click();await h.settle();
  const held=h.ui.inspect().events.findLast(e=>e.phase==='held');
  assert.equal(held.outbound_submitted,true);assert.equal(held.response_received,false);assert.equal(h.$('#aiResult').hidden,true);
  h.$('#aiRoomReplay').click();h.$('#aiRoomLive').click();assert.equal(h.calls.length,1);
});

test('a returned but rejected body is recorded as arrival and kept outside the rendered answer',async t=>{
  const h=harness(t,request=>response({...admitted(request),answer:LOOM_AI_PROJECTS[0].protectedTerms[0]}));
  h.$('#aiRun').click();await h.settle();const held=h.ui.inspect().events.findLast(e=>e.phase==='held');
  assert.equal(held.outbound_submitted,true);assert.equal(held.response_received,true);
  assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiAnswer').textContent,'');assert.equal(h.$('#aiExport').disabled,true);
  assert.equal(h.$('#aiLivingRoom').textContent.includes(LOOM_AI_PROJECTS[0].protectedTerms[0]),false);
});
