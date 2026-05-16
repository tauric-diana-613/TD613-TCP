import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';

function loadHtml(path) {
  return fs.readFileSync(path, 'utf8');
}

function installDom(html, url = 'http://localhost/adversarial-bench.html') {
  const dom = new JSDOM(html, { url, pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  return dom;
}

const html = loadHtml('app/adversarial-bench.html');
const dom = installDom(html);
const requiredIds = [
  'protectedBaselineInput',
  'maskReferenceInput',
  'messageDraftInput',
  'protectedOutputInput',
  'escapeVectorPanel',
  'controllerPanel',
  'personaMemoryPanel',
  'iterationPreviewPanel'
];
for (const id of requiredIds) assert(document.getElementById(id), `missing ${id}`);

const bench = await import(`../app/adversarial-bench.mjs?test=${Date.now()}`);
assert.equal(typeof bench.initAdversarialBench, 'function');
assert.equal(typeof bench.analyzeProtectedOutput, 'function');
assert.equal(typeof bench.generateMaskedOutput, 'function');
assert.equal(typeof bench.acceptOutputIntoPersonaMemory, 'function');
assert.equal(typeof bench.renderEscapeVector, 'function');
assert.equal(typeof bench.renderControllerDecision, 'function');
bench.initAdversarialBench(document);

const baseline = document.getElementById('protectedBaselineInput');
const mask = document.getElementById('maskReferenceInput');
const draft = document.getElementById('messageDraftInput');
const output = document.getElementById('protectedOutputInput');

baseline.value = 'I keep circling the issue with a reflective rhythm, layered clauses, and repeated return pressure that marks the protected baseline.';
mask.value = 'Need the packet. Keep it short. Knock twice. Move fast.';
draft.value = 'Please keep EXHIBIT-42 in the message while moving the cadence into a shorter field voice.';
output.value = 'Need the packet. EXHIBIT-42 stays visible. Keep it short and move fast.';

const beforeBaseline = baseline.value;
const beforeMask = mask.value;
const beforeDraft = draft.value;
bench.analyzeProtectedOutput();
assert.equal(baseline.value, beforeBaseline);
assert.equal(mask.value, beforeMask);
assert.equal(draft.value, beforeDraft);
assert.notEqual(output.value, baseline.value);

const vectorText = document.getElementById('escapeVectorPanel').textContent;
assert(vectorText.includes('Source Residual'));
assert(vectorText.includes('Mask Fit'));
assert(vectorText.includes('Δsafe'));
assert(vectorText.includes('Semantic Fidelity'));
assert(vectorText.includes('Ingestion Friction'));

const controllerText = document.getElementById('controllerPanel').textContent;
assert(/Continue steering|Hold for review|Rotate Persona|Restore semantics|Locally sealable/.test(controllerText));
assert(controllerText.includes('Next instruction'));

const initialAccepted = bench.benchState.personaMemory.memory.acceptedCount;
bench.analyzeProtectedOutput();
assert.equal(bench.benchState.personaMemory.memory.acceptedCount, initialAccepted);

if (!document.getElementById('acceptOutputBtn').disabled) {
  bench.acceptOutputIntoPersonaMemory();
  assert.equal(bench.benchState.personaMemory.memory.acceptedCount, initialAccepted + 1);
  assert(document.getElementById('iterationPreviewPanel').textContent.includes('Source'));
} else {
  assert.equal(bench.benchState.personaMemory.memory.acceptedCount, initialAccepted);
}

output.value = 'Need the packet. The protected marker is missing now.';
bench.analyzeProtectedOutput();
const state = bench.benchState.controllerDecision.state;
if (state === 'restore' || state === 'hold') {
  const accept = document.getElementById('acceptOutputBtn');
  const warning = document.getElementById('acceptWarning');
  assert(accept.disabled || !warning.hidden);
}

const deckDom = new JSDOM(loadHtml('app/deck.html'));
for (const id of ['voiceA', 'voiceB', 'compareBtn', 'swapCadencesBtn', 'savePersonaBtn', 'shellDuel']) {
  assert(deckDom.window.document.getElementById(id), `deck missing ${id}`);
}

const rendered = document.body.textContent.toLowerCase();
for (const forbidden of ['untraceable', 'platform-proof', 'guaranteed safe', 'same author', 'not same author']) {
  assert(!rendered.includes(forbidden), `forbidden positive claim leaked: ${forbidden}`);
}

console.log('adversarial-bench tests passed');
