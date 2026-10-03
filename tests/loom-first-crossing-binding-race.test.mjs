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

function setup(t) {
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
  environment.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
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
    root, environment, ui, requests, frames, useCrypto,
    $: selector => root.querySelector(selector),
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
  h.$('#loomFirstCrossingStop').click();
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
  assert.match(h.$('#loomFirstCrossingTitle').textContent, /Protect the handoff/);
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
  assert.equal(h.$('#loomFirstCrossingTitle').textContent, 'Preparation stays held.');
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
