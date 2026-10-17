import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { mountLoomAiWorkspace } from '../app/dome-world/holonomy-loom/ai-workspace-classic79.js';

// Mounted historical controller with controlled owner-clock frames. This is
// separate from the real browser witness and operator visual acceptance.
const until = async (predicate, label) => {
  for (let i=0;i<400;i++) {
    if (predicate()) return;
    await new Promise(resolve=>setTimeout(resolve,5));
  }
  throw Error(`Classic recovery did not settle: ${label}`);
};
function setup(t,{reduced=true,completed=false}={}) {
  const dom=new JSDOM('<header class="loom-topbar"><nav></nav></header><section id="fixture"></section>',{
    url:'https://td613.com/dome-world/holonomy-loom-classic79.html',pretendToBeVisual:true
  });
  const environment=dom.window,root=environment.document.querySelector('#fixture');
  const oldRaf=globalThis.requestAnimationFrame,oldCancel=globalThis.cancelAnimationFrame;
  const oldNow=Object.getOwnPropertyDescriptor(globalThis.performance,'now');
  let wall=0,frameId=0,disposed=false;
  const frames=new Map(),requests=[];
  Object.defineProperty(globalThis.performance,'now',{configurable:true,value:()=>wall});
  globalThis.requestAnimationFrame=callback=>{const id=++frameId;frames.set(id,callback);return id;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  Object.defineProperty(environment,'crypto',{configurable:true,value:webcrypto});
  environment.matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){}});
  environment.fetch=(...args)=>{requests.push(args);throw Error('Unexpected network during local tutorial');};
  if(completed)environment.localStorage.setItem('td613.loom.first-crossing.v1','complete');
  const ui=mountLoomAiWorkspace(root,environment),$=selector=>root.querySelector(selector);
  const dispose=()=>{if(!disposed){disposed=true;ui.dispose();}};
  t.after(()=>{
    dispose();environment.close();
    if(oldNow)Object.defineProperty(globalThis.performance,'now',oldNow);else delete globalThis.performance.now;
    if(oldRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=oldRaf;
    if(oldCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=oldCancel;
  });
  return {environment,root,ui,$,requests,frames,dispose,
    tick(ms){wall+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(wall));},
    pointer(selector,detail=1){const event=new environment.MouseEvent('click',{bubbles:true,cancelable:true,detail});$(selector).dispatchEvent(event);return event;},
    key(selector,key,repeat=false,type='keydown'){const event=new environment.KeyboardEvent(type,{bubbles:true,cancelable:true,key,repeat});$(selector).dispatchEvent(event);return event;}
  };
}
async function gathered(h){
  h.$('[data-first-crossing-item="brief"]').click();
  await until(()=>!h.$('[data-first-crossing-item="source"]').disabled,'context unlocked');
  h.$('[data-first-crossing-item="source"]').click();
  await until(()=>h.root.dataset.firstCrossingStep==='1'&&!h.$('#loomFirstCrossingAction').hidden,'gathered consequence');
}
async function checked(h){
  await gathered(h);h.$('#loomFirstCrossingAction').click();
  await until(()=>h.root.dataset.firstCrossingStep==='2'&&!h.$('#loomFirstCrossingStop').hidden,'checked artifact');
}

test('historical context unlock waits for the six-second owner score and keeps one pending frame',async t=>{
  const h=setup(t,{reduced:false});
  h.$('[data-first-crossing-item="brief"]').click();
  await until(()=>h.$('#aiRuntimeState').dataset.projectionState==='CURRENT','current gathering projection');
  h.tick(0);h.tick(3000);
  assert.equal(h.$('[data-first-crossing-item="source"]').disabled,true);
  assert.equal(h.ui.inspect().clock.durationMs,6000);
  h.tick(3001);
  await until(()=>!h.$('[data-first-crossing-item="source"]').disabled,'completed six-second score');
  assert.ok(h.frames.size<=1);
  assert.equal(h.requests.length,0);
});

test('pointer series and held keys admit one action while new gestures stay available',async t=>{
  const h=setup(t);await checked(h);
  h.pointer('#loomFirstCrossingStop',1);
  await until(()=>h.root.dataset.firstCrossingStep==='3'&&!h.$('#loomFirstCrossingStop').hidden,'send illustration');
  assert.equal(h.pointer('#loomFirstCrossingStop',2).defaultPrevented,true);
  assert.equal(h.pointer('#loomFirstCrossingStop',3).defaultPrevented,true);
  assert.equal(h.root.dataset.firstCrossingStep,'3');
  h.key('#loomFirstCrossingStop','Enter');h.$('#loomFirstCrossingStop').click();
  await until(()=>h.root.dataset.firstCrossingStep==='4'&&!h.$('#loomFirstCrossingStop').hidden,'privacy illustration');
  assert.equal(h.key('#loomFirstCrossingStop','Enter',true).defaultPrevented,true);
  h.key('#loomFirstCrossingStop','Enter',false,'keyup');
  assert.equal(h.key('#loomFirstCrossingStop','Enter').defaultPrevented,false);
  assert.equal(h.pointer('#loomFirstCrossingStop',1).defaultPrevented,false);
  await until(()=>h.root.dataset.firstCrossingStep==='5','new gesture accepted');
  assert.equal(h.ui.inspect().session,null);assert.equal(h.requests.length,0);
  h.dispose();assert.equal(h.pointer('#loomFirstCrossingStop',2).defaultPrevented,false);
});

test('complete artifact inspection preserves historical request and never advances the scene',async t=>{
  const h=setup(t);await checked(h);
  const record=h.$('#loomTutorialArtifactRecord'),artifact=JSON.parse(record.textContent);
  assert.match(artifact.task,/job in another city/);
  assert.deepEqual(artifact.documents.map(d=>d.id),['brief','source']);
  assert.ok(artifact.portable_governance.mechanisms.length>0);
  assert.equal(artifact.governance.input_digest,artifact.portable_governance.selected_input_digest);
  assert.equal(record.tabIndex,0);assert.equal(record.getAttribute('role'),'region');
  h.$('#loomTutorialArtifact').open=true;
  assert.equal(h.root.dataset.firstCrossingStep,'2');
  assert.equal(record.textContent.includes('My sister and I argued'),false);
  h.$('#loomFirstCrossingStop').click();
  await until(()=>h.root.dataset.firstCrossingStep==='3','next scene');
  assert.equal(h.$('#loomTutorialArtifact').open,false);
  assert.equal(h.ui.inspect().session,null);assert.equal(h.requests.length,0);
});

test('Skip during delayed binding prevents late artifact publication and preserves editable entry',async t=>{
  const h=setup(t);await gathered(h);
  let release;const gate=new Promise(resolve=>{release=resolve;});let digestStarted=false;
  Object.defineProperty(h.environment,'crypto',{configurable:true,value:{
    randomUUID:()=>webcrypto.randomUUID(),
    subtle:{digest:async(...args)=>{digestStarted=true;await gate;return webcrypto.subtle.digest(...args);}}
  }});
  h.$('#loomFirstCrossingAction').click();await until(()=>digestStarted,'binding started');
  h.$('#loomFirstCrossingLeave').click();release();
  await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(h.$('.loom-builder-shell').hidden,false);
  assert.equal(h.$('#loomFirstCrossing').hidden,true);
  assert.equal(h.$('#loomTutorialArtifactRecord').textContent,'');
  assert.equal(h.ui.inspect().session,null);assert.equal(h.requests.length,0);
});

test('returning direct entry preserves historical greeting, immediate Skip and explicit fresh replay',async t=>{
  const h=setup(t,{completed:true});
  assert.equal(h.root.dataset.firstCrossingStep,'0');
  h.$('#loomFirstCrossingLeave').click();
  assert.equal(h.$('.loom-builder-shell').hidden,false);
  h.$('#loomReturnThreshold').click();
  assert.equal(h.root.dataset.firstCrossingStep,'0');
  assert.equal(h.$('[data-first-crossing-item="source"]').disabled,true);
  assert.equal(h.$('#loomTutorialArtifactRecord').textContent,'');
  await checked(h);h.$('#loomFirstCrossingBack').click();
  assert.equal(h.root.dataset.firstCrossingStep,'0');
  assert.equal(h.$('#loomTutorialArtifactRecord').textContent,'');
  assert.equal(h.ui.inspect().session,null);
});

test('current finite observer preview stays in opt-in tools without changing historical tutorial',async t=>{
  const h=setup(t),observer=h.$('#loomObserverTools');
  assert.ok(observer.closest('[data-tool-panel="science"]'));
  assert.equal(observer.closest('[data-tool-panel="science"]').hidden,true);
  assert.equal(observer.dataset.selectedChannels,'first,second,third');
  observer.querySelector('input').checked=false;
  observer.querySelector('input').dispatchEvent(new h.environment.Event('change',{bubbles:true}));
  assert.equal(observer.dataset.selectedChannels,'second,third');
  assert.equal(h.root.dataset.firstCrossingStep,'0');
  assert.equal(h.requests.length,0);assert.equal(h.ui.inspect().session,null);
});
