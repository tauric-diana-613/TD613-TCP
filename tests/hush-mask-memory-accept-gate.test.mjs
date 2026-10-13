import assert from 'assert';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><button id="acceptOutputBtn" disabled></button><p id="acceptWarning">Accept is paused because the controller is asking for restore or hold. Edit the output or analyze again before accepting into Mask Memory.</p><textarea id="protectedOutputInput">released output</textarea>', { url: 'http://localhost/adversarial-bench.html' });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });

global.document.body.dataset.pageKind = 'unit-test';
const bench = await import(`../app/adversarial-bench.js?memoryGate=${Date.now()}`);

bench.benchState.protectedOutputText = 'released output';
bench.benchState.hushSwapResult = {
  selectedOutput: 'released output',
  releasePolicy: { hardBlocked: false, mayPopulateOutput: true },
  payloadIntegrity: { passed: true },
  claimIntegrity: { passed: true }
};
bench.benchState.controllerDecision = { state: 'restore', action: 'restore-semantics' };
bench.benchState.recognitionField = { classifications: { route: 'continue' } };

const reopened = bench.syncMaskMemoryGate();
assert.equal(reopened, true);
assert.equal(document.getElementById('acceptOutputBtn').disabled, false);
assert.equal(bench.benchState.controllerDecision.state, 'continue');
assert.equal(document.getElementById('acceptWarning').textContent, '');

bench.benchState.controllerDecision = { state: 'restore', action: 'restore-semantics' };
bench.benchState.recognitionField = { classifications: { route: 'hold' } };
document.getElementById('acceptOutputBtn').disabled = true;
document.getElementById('acceptWarning').textContent = 'Accept is paused because the controller is asking for restore or hold. Edit the output or analyze again before accepting into Mask Memory.';
assert.equal(bench.syncMaskMemoryGate(), false);
assert.equal(document.getElementById('acceptOutputBtn').disabled, true);

console.log('hush-mask-memory-accept-gate tests passed');
