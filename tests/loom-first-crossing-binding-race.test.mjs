import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { mountLoomAiWorkspace } from '../app/dome-world/holonomy-loom/ai-workspace.js';

// Exercise the mounted workspace and installed binding/renderer path. Only the
// owner clock and digest completion are controlled; this is a DOM/timing witness,
// not a browser, physical-device or perceptual acceptance claim.
async function until(predicate, label) {
  for (let attempt = 0; attempt < 400; attempt++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  throw new Error(`Practice race did not settle: ${label}`);
}

function setup(t,{intersection=false}={}) {
  const dom = new JSDOM('<section id="fixture"></section>', {
    url: 'https://td613.com/dome-world/holonomy-loom.html', pretendToBeVisual: true
  });
  const environment = dom.window, root = environment.document.querySelector('#fixture');
  const frames = new Map(), requests = [];
  let wall = 0, frameId = 0;
  const previousNow = Object.getOwnPropertyDescriptor(globalThis.performance, 'now');
  const previousRequest = globalThis.requestAnimationFrame;
  const previousCancel = globalThis.cancelAnimationFrame;
  Object.defineProperty(globalThis.performance, 'now', { configurable: true, value: () => wall });
  globalThis.requestAnimationFrame = callback => {
    const id = ++frameId; frames.set(id, callback); return id;
  };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const useCrypto = crypto => Object.defineProperty(environment, 'crypto', { configurable: true, value: crypto });
  useCrypto(webcrypto);
  const motionListeners=new Set();
  const motionPreference={matches:false,addEventListener:(_name,listener)=>motionListeners.add(listener),removeEventListener:(_name,listener)=>motionListeners.delete(listener)};
  environment.matchMedia = () => motionPreference;
  const observedFields=new Set();let observeVisibility;
  if(intersection)environment.IntersectionObserver=class {
    constructor(callback){observeVisibility=callback;}
    observe(field){observedFields.add(field);}
    disconnect(){observedFields.clear();}
  };
  environment.fetch = (...args) => { requests.push(args); throw new Error('Practice attempted a provider request'); };
  const ui = mountLoomAiWorkspace(root, environment);
  t.after(() => {
    ui.dispose(); environment.close();
    if (previousNow) Object.defineProperty(globalThis.performance, 'now', previousNow);
    else delete globalThis.performance.now;
    if (previousRequest === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = previousRequest;
    if (previousCancel === undefined) delete globalThis.cancelAnimationFrame;
    else globalThis.cancelAnimationFrame = previousCancel;
  });
  return {
    root, environment, ui, requests, frames, useCrypto,observedFields,
    $: selector => root.querySelector(selector),
    setFieldVisible(field,isIntersecting){observeVisibility?.([{target:field,isIntersecting}]);},
    setReducedMotion(matches) {
      motionPreference.matches=matches;
      for(const listener of motionListeners)listener({matches});
    },
    advance(ms) {
      wall += ms;
      const batch = [...frames.values()]; frames.clear();
      batch.forEach(callback => callback(wall));
    }
  };
}

async function gather(h) {
  h.$('[data-first-crossing-item="brief"]').click();
  h.$('[data-first-crossing-item="source"]').click();
  await until(() => h.ui.inspect().runtime.status === 'CURRENT', 'gathering projection');
  h.advance(3400);
  assert.equal(h.ui.inspect().clock.timeMs, 3400);
  assert.equal(h.root.dataset.firstCrossingCue, 'gathering-named');
  assert.equal(h.$('#loomFirstCrossingAction').hidden, false);
  assert.equal(h.frames.size, 1, 'the old gathering packet still has a finite frame to deliver');
}

async function expectRealReadiness(h) {
  await until(() => h.ui.inspect().runtime.status === 'CURRENT'
    && h.ui.inspect().runtime.view?.event.binding_verified === true, 'verified local binding projection');
  h.advance(3400);
  const event = h.ui.inspect().runtime.view.event;
  assert.equal(h.root.dataset.firstCrossingCue, 'potential-named');
  assert.equal(h.$('#loomFirstCrossingStop').hidden, false);
  assert.equal(event.binding_verified, true);
  assert.deepEqual(event.selected_document_ids, ['brief', 'source']);
  assert.equal(event.local, 1);
  assert.equal(event.outbound_submitted, false);
  assert.equal(event.response_received, false);
  assert.equal(h.ui.inspect().session, null);
  assert.equal(h.requests.length, 0);
}

async function finishFullTutorial(h) {
  for(const [step,cue] of [[3,'send'],[4,'privacy'],[5,'proof']]){
    h.$('#loomFirstCrossingStop').click();
    await until(()=>h.root.dataset.firstCrossingStep===String(step)&&h.ui.inspect().runtime.status==='CURRENT',`${cue} projection`);
    assert.equal(h.root.dataset.firstCrossingCue,`${cue}-motion`);
    h.$('#loomFirstCrossingStop').click();
    assert.equal(h.root.dataset.firstCrossingStep,String(step),'hidden/reentrant controls cannot skip the visible lesson');
    assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'),null);
    h.advance(3400);
    assert.equal(h.root.dataset.firstCrossingCue,`${cue}-named`);
    assert.equal(h.$('#loomFirstCrossingStop').hidden,false);
    assert.equal(h.ui.inspect().runtime.view.event.outbound_submitted,false);
    assert.equal(h.ui.inspect().runtime.view.event.response_received,false);
  }
  const proof=JSON.parse(h.$('#loomTutorialProofRecord').textContent);
  assert.match(proof.receipt.answer_digest,/^[a-f0-9]{64}$/);
  assert.equal(proof.receipt.custody_admitted,false);
  h.$('#loomFirstCrossingStop').click();
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','Rest projection');
  h.advance(4100);
  assert.equal(h.root.dataset.firstCrossingStep,'6');
  assert.equal(h.$('[data-instrument-active-glyph]').textContent,'𝄐');
  assert.equal(h.frames.size,0,'Rest settles the shared clock');
  h.setReducedMotion(true);h.setReducedMotion(false);
  assert.equal(h.frames.size,0,'changing preferences cannot resume completed Rest');
}

test('hidden readiness events cannot bind before the current gathering consequence publishes', async t => {
  const h = setup(t);
  let bindings = 0;
  h.useCrypto({
    randomUUID() { bindings++; return webcrypto.randomUUID(); },
    getRandomValues: value => webcrypto.getRandomValues(value),
    subtle: webcrypto.subtle
  });
  h.$('[data-first-crossing-item="brief"]').click();
  h.$('[data-first-crossing-item="source"]').click();
  assert.equal(h.ui.inspect().runtime.status, 'COMPILING');
  assert.equal(h.$('#loomFirstCrossingAction').hidden, true);
  h.$('#loomFirstCrossingAction').click();
  assert.equal(bindings, 0, 'no local binding before current projection publication');
  assert.equal(h.root.dataset.firstCrossingCue, 'gathering-motion');
  await until(() => h.ui.inspect().runtime.status === 'CURRENT', 'gathering projection');
  assert.equal(h.$('#loomFirstCrossingAction').hidden, true, 'projection alone precedes its finite visible consequence');
  h.$('#loomFirstCrossingAction').click();
  assert.equal(bindings, 0, 'no local binding before visible gathering consequence');
  h.advance(3400);
  assert.equal(h.root.dataset.firstCrossingCue, 'gathering-named');
  h.$('#loomFirstCrossingAction').click();
  await expectRealReadiness(h);
  assert.equal(bindings, 1, 'the subsequent legitimate gesture binds exactly once');
});

test('hidden Finish events cannot claim completion before verified readiness publishes its consequence', async t => {
  const h = setup(t);
  await gather(h);
  h.$('#loomFirstCrossingAction').click();
  await until(() => h.root.dataset.firstCrossingStep === '2', 'verified local binding');
  assert.equal(h.root.dataset.firstCrossingCue, 'potential-motion');
  assert.equal(h.$('#loomFirstCrossingStop').hidden, true);
  h.$('#loomFirstCrossingStop').click();
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), null);
  assert.equal(h.root.dataset.firstCrossingCue, 'potential-motion');
  await until(() => h.ui.inspect().runtime.status === 'CURRENT'
    && h.ui.inspect().runtime.view?.event.binding_verified === true, 'verified readiness projection');
  h.$('#loomFirstCrossingStop').click();
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), null,
    'current verified projection alone cannot erase the unpublished consequence');
  await expectRealReadiness(h);
  await finishFullTutorial(h);
  assert.equal(h.root.dataset.firstCrossingCue, 'complete');
  assert.equal(h.environment.localStorage.getItem('td613.loom.first-crossing.v1'), 'complete');
  assert.equal(h.ui.inspect().session, null);
  assert.equal(h.requests.length, 0);
});

test('an old gathering frame cannot reopen pending local binding or duplicate its gesture', async t => {
  const h = setup(t);
  await gather(h);
  let release, entered, requestCount = 0, first = true;
  const barrier = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { entered = resolve; });
  t.after(() => release());
  h.useCrypto({
    randomUUID() { requestCount++; return webcrypto.randomUUID(); },
    getRandomValues: value => webcrypto.getRandomValues(value),
    subtle: { async digest(...args) {
      if (first) { first = false; entered(); await barrier; }
      return webcrypto.subtle.digest(...args);
    } }
  });
  h.$('#loomFirstCrossingAction').click();
  await started;
  assert.equal(h.root.dataset.firstCrossingCue, 'binding');
  assert.equal(h.$('#loomFirstCrossingAction').hidden, true);
  h.advance(100);
  assert.equal(h.root.dataset.firstCrossingCue, 'binding', 'the old 87.5% gathering frame must preserve pending preparation');
  assert.equal(h.$('#loomFirstCrossingTitle').textContent, 'Check before sending.');
  assert.equal(h.$('#loomFirstCrossingAction').hidden, true);
  assert.equal(h.$('#loomFirstCrossingStop').hidden, true);
  // Hidden DOM controls can still receive programmatic/re-entrant events. The
  // actual action path must refuse duplication, rather than relying on hiding.
  h.$('#loomFirstCrossingAction').click();
  await Promise.resolve();
  assert.equal(requestCount, 1, 'one operator gesture starts one local binding');
  assert.equal(h.ui.inspect().runtime.view.event.binding_verified, false);
  release();
  await expectRealReadiness(h);
  assert.equal(requestCount, 1);
});

test('an old gathering frame retains the binding HOLD explanation until an explicit successful retry', async t => {
  const h = setup(t);
  await gather(h);
  h.useCrypto({
    randomUUID: () => webcrypto.randomUUID(),
    getRandomValues: value => webcrypto.getRandomValues(value),
    subtle: { async digest() { throw new Error('Controlled local digest failure'); } }
  });
  h.$('#loomFirstCrossingAction').click();
  await until(() => h.root.dataset.firstCrossingCue === 'binding-held', 'local binding failure');
  assert.match(h.$('#loomFirstCrossingPrompt').textContent, /Controlled local digest failure/);
  assert.equal(h.$('#loomFirstCrossingAction').hidden, false, 'HOLD retains its deliberate retry action');
  assert.equal(h.$('#loomFirstCrossingStop').hidden, true);
  h.advance(100); h.advance(250);
  assert.equal(h.root.dataset.firstCrossingCue, 'binding-held');
  assert.equal(h.$('#loomFirstCrossingTitle').textContent, 'This preview could not be checked.');
  assert.match(h.$('#loomFirstCrossingPrompt').textContent, /Controlled local digest failure/);
  assert.equal(h.ui.inspect().runtime.view.event.binding_verified, false);
  assert.equal(h.ui.inspect().session, null);
  assert.equal(h.requests.length, 0);
  h.useCrypto(webcrypto);
  h.$('#loomFirstCrossingAction').click();
  assert.equal(h.root.dataset.firstCrossingCue, 'binding');
  assert.equal(h.$('#loomFirstCrossingAction').hidden, true);
  await expectRealReadiness(h);
});

test('keyboard focus follows visible tutorial consequences and its final live action', async t => {
  const h=setup(t);
  h.$('[data-first-crossing-item="brief"]').focus();
  h.$('[data-first-crossing-item="brief"]').click();
  h.$('[data-first-crossing-item="source"]').focus();
  h.$('[data-first-crossing-item="source"]').click();
  assert.equal(h.environment.document.activeElement,h.$('#loomFirstCrossing'),'the disappearing selected card hands focus to visible tutorial content');
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','gathering projection');
  assert.equal(h.$('#loomFirstCrossingAction').hidden,true);
  h.advance(3400);
  assert.equal(h.environment.document.activeElement,h.$('#loomFirstCrossingAction'),'published gathering offers the next keyboard action');
  h.$('#loomFirstCrossingAction').click();
  assert.equal(h.environment.document.activeElement,h.$('#loomFirstCrossing'),'pending binding never retains focus on a hidden action');
  await expectRealReadiness(h);
  assert.equal(h.environment.document.activeElement,h.$('#loomFirstCrossingStop'));
  await finishFullTutorial(h);
  assert.equal(h.environment.document.activeElement,h.$('#loomBegin'),'completion offers the visible live Loom action');
  assert.equal(h.$('#loomBegin').hidden,false);
});

test('Flow-Core help closes with × or Escape and returns focus to its opener',async t=>{
  const h=setup(t),help=h.$('.loom-flowcore-help'),opener=help.querySelector('summary'),close=h.$('#loomFlowcoreHelpClose');
  assert.equal(close.getAttribute('aria-label'),'Close Flow-Core explanation');
  help.open=true;close.focus();close.click();
  assert.equal(help.open,false);assert.equal(h.environment.document.activeElement,opener);
  help.open=true;close.focus();close.dispatchEvent(new h.environment.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(help.open,false);assert.equal(h.environment.document.activeElement,opener);
  assert.equal(h.requests.length,0);
});

test('each tutorial choice illustrates its operator while actual sending stays unobserved',async t=>{
  const h=setup(t);
  h.$('[data-first-crossing-item="source"]').click();
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','reference choice');
  assert.equal(h.$('[data-instrument-active-glyph]').textContent,'hõt');
  assert.ok([...h.root.querySelectorAll('.loom-field-flight text')].some(node=>node.dataset.flightRelation==='protected_continuity'), 'cōl remains a separate animated relation');
  assert.ok([...h.root.querySelectorAll('.loom-field-flight text')].every(node=>node.dataset.flightEvidence==='presentation-only'));
  h.$('[data-first-crossing-item="source"]').click();
  h.$('[data-first-crossing-item="brief"]').click();
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','request choice');
  assert.equal(h.$('[data-instrument-active-glyph]').textContent,'à');
  assert.equal(h.ui.inspect().runtime.view.event.outbound_submitted,false);
  assert.equal(h.ui.inspect().session,null);
});

test('a finite tutorial consequence preserves focus deliberately moved to help', async t => {
  const h=setup(t);
  h.$('[data-first-crossing-item="brief"]').click();
  h.$('[data-first-crossing-item="source"]').click();
  const help=h.$('.loom-flowcore-help summary');
  help.focus();
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','gathering projection');
  h.advance(3400);
  assert.equal(h.$('#loomFirstCrossingAction').hidden,false);
  assert.equal(h.environment.document.activeElement,help,'new action availability must not steal a help-reader’s focus');
  h.advance(100);
  assert.equal(h.environment.document.activeElement,help,'later continuous frames must not repeatedly transfer focus');
});

test('busy preparation keeps the tutorial closed and returns focus to a visible result', async t => {
  const h=setup(t);
  h.$('#loomFirstCrossingLeave').click();
  h.$('#aiTask').value='Prepare this fictional audit task.';
  h.$('#aiTask').dispatchEvent(new h.environment.Event('input',{bubbles:true}));
  let release,entered,first=true;
  const barrier=new Promise(resolve=>{release=resolve;});
  const started=new Promise(resolve=>{entered=resolve;});
  t.after(()=>release());
  h.useCrypto({randomUUID:()=>webcrypto.randomUUID(),getRandomValues:value=>webcrypto.getRandomValues(value),subtle:{async digest(...args){if(first){first=false;entered();await barrier;}return webcrypto.subtle.digest(...args);}}});
  h.$('#aiPreparePortable').click();
  await started;
  assert.equal(h.root.getAttribute('aria-busy'),'true');
  assert.equal(h.$('#loomReturnThreshold').disabled,true);
  // Dispatching directly bypasses native disabled-button activation. The
  // handler must independently preserve the busy operation’s visible route.
  h.$('#loomReturnThreshold').dispatchEvent(new h.environment.Event('click',{bubbles:true}));
  assert.equal(h.root.dataset.firstCrossing,'idle');
  assert.equal(h.$('.loom-builder-shell').hidden,false);
  release();
  await until(()=>h.root.getAttribute('aria-busy')==='false'&&h.ui.inspect().session!==null,'prepared session');
  assert.equal(h.$('#loomReturnThreshold').disabled,false);
  assert.equal(h.$('.loom-builder-shell').hidden,false);
  assert.equal(h.$('.loom-stage').hidden,true);
  assert.equal(h.environment.document.activeElement,h.$('#aiResult'));
  assert.equal(h.$('#aiResult').hidden,false);
});

test('leaving reduced motion resumes an active tutorial without changing its input or authority', async t => {
  const h=setup(t);
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','initial projection');
  h.advance(100);
  h.setReducedMotion(true);
  assert.equal(h.ui.inspect().clock.pendingFrames,0);
  assert.equal(h.ui.inspect().clock.playing,false);
  const before=h.ui.inspect();
  h.setReducedMotion(false);
  assert.equal(h.ui.inspect().clock.playing,true);
  assert.equal(h.frames.size,1,'the same owner schedules one continuous tutorial frame');
  h.advance(100);
  assert.ok(h.ui.inspect().clock.motionTimeMs>before.clock.motionTimeMs);
  assert.deepEqual(h.ui.inspect().events,before.events);
  assert.equal(h.ui.inspect().session,null);
  assert.equal(h.requests.length,0);
  assert.equal(h.root.dataset.firstCrossingStep,'0');
});

test('leaving reduced motion preserves idle and explicitly still workspace posture', async t => {
  const h=setup(t);
  h.$('#loomFirstCrossingLeave').click();
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','idle workspace projection');
  h.setReducedMotion(true);h.setReducedMotion(false);
  assert.equal(h.ui.inspect().clock.playing,false);
  assert.equal(h.frames.size,0,'empty builder stays still');
  h.$('#aiTask').value='A fictional task with a still field.';
  h.$('#aiTask').dispatchEvent(new h.environment.Event('input',{bubbles:true}));
  h.$('#aiStillField').click();
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','still workspace projection');
  assert.equal(h.$('#aiStillField').getAttribute('aria-pressed'),'true');
  h.setReducedMotion(true);h.setReducedMotion(false);
  assert.equal(h.ui.inspect().clock.playing,false);
  assert.equal(h.frames.size,0,'explicit field rest stays still');
});

test('remixing an earned tutorial consequence preserves the next action and its semantic state', async t => {
  const h=setup(t);
  await gather(h);
  const before=h.ui.inspect().runtime.view.event;
  h.$('#loomFirstCrossingPause').focus();
  h.$('#loomFirstCrossingPause').click();
  assert.equal(h.root.dataset.firstCrossingCue,'gathering-named');
  assert.equal(h.$('#loomFirstCrossingAction').hidden,false,'remix cannot withdraw the earned Check action during projection compilation');
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','remixed gathering projection');
  assert.deepEqual(h.ui.inspect().runtime.view.event,before,'remix changes presentation, never the selected input or evidence event');
  assert.equal(h.$('#loomFirstCrossingAction').hidden,false);
  h.$('#loomFirstCrossingAction').click();
  await expectRealReadiness(h);
  const ready=h.ui.inspect().runtime.view.event;
  h.$('#loomFirstCrossingPause').click();
  assert.equal(h.root.dataset.firstCrossingCue,'potential-named');
  assert.equal(h.$('#loomFirstCrossingStop').hidden,false,'remix cannot withdraw the earned Finish action');
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','remixed readiness projection');
  assert.deepEqual(h.ui.inspect().runtime.view.event,ready);
  assert.equal(h.ui.inspect().session,null);
  assert.equal(h.requests.length,0);
});

test('the same runtime field moves into the workspace and back without a second renderer or hidden-stage clock hold', async t => {
  const h=setup(t,{intersection:true});
  const field=h.$('#aiRuntimeState'),tutorialHost=h.$('#aiRuntime'),workspaceHost=h.$('#loomWorkspaceField');
  assert.ok(workspaceHost,'the actual builder has its runtime field host');
  assert.equal(field.parentElement,tutorialHost);
  assert.deepEqual([...h.observedFields],[tutorialHost]);
  h.$('#loomFirstCrossingLeave').click();
  assert.equal(field.parentElement,workspaceHost);
  assert.equal(h.root.querySelectorAll('#aiRuntimeState').length,1);
  assert.deepEqual([...h.observedFields],[workspaceHost],'visibility follows the visible workspace field');
  h.setFieldVisible(tutorialHost,false);
  assert.equal(h.ui.inspect().clock.visible,true,'a stale hidden tutorial observation cannot stop the active field');
  h.$('#aiTask').value='Prepare a fictional task behind this workspace.';
  h.$('#aiTask').dispatchEvent(new h.environment.Event('input',{bubbles:true}));
  h.$('#aiTask').blur();
  await until(()=>h.ui.inspect().runtime.status==='CURRENT','workspace request projection');
  const before=h.ui.inspect().clock.motionTimeMs;
  h.advance(120);
  assert.ok(h.ui.inspect().clock.motionTimeMs>before,'the visible workspace retains the sole runtime clock');
  assert.equal(h.ui.inspect().clock.pendingFrames,1);
  h.$('#loomReturnThreshold').click();
  assert.equal(field.parentElement,tutorialHost);
  assert.equal(h.root.querySelectorAll('#aiRuntimeState').length,1);
  assert.deepEqual([...h.observedFields],[tutorialHost]);
  assert.equal(h.$('.loom-builder-shell').hidden,true);
  assert.equal(h.root.dataset.firstCrossing,'active');
  assert.equal(h.$('#aiTask').value,'Prepare a fictional task behind this workspace.');
  assert.equal(h.ui.inspect().session,null);
  assert.equal(h.requests.length,0);
});
