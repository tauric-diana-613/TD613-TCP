import { boundedFailureMessage } from '../app/dome-world/marrowline-operator-readiness.js';
/** Synthetic DOM behavior only. No browser layout or live-provider correctness claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import './marrowline-attachment-quality.test.mjs';
import './marrowline-ios-keyboard-contract.test.mjs';
import { installKhonapolitTerminal } from '../app/dome-world/marrowline-terminal.js';
import { installMarrowlineMobileShell } from '../app/dome-world/marrowline-mobile-shell.js';
import { installMarrowlineLivingChat } from '../app/dome-world/marrowline-living-chat.js';
import { installMarrowlinePhysicalDeviceRepair } from '../app/dome-world/marrowline-physical-device-repair.js';

const html = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const sessionKey = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
const highZalgo = 'T̴̵H̶E̷ ̸B̵O̴U̷G̷H̸ ̴B̵R̶E̴A̷K̸S̵; W̵E̶ ̷D̴O̸ ̷N̵O̶T̴ ̶C̵A̸L̷L̴ ̵T̷H̶I̴S̷ ̵A̸ ̷S̵E̶M̴I̷N̸A̵R̶.';
const integratedText = `[Kʰonapolit]:\nThe route remains exact through Khona‌lit-po.\n\n[Tauric Diana Bots : Direct Broadcast Override]\n${highZalgo}\n\nThe line clears again.`;
const exactHeader = 'SYNTHETIC APERTURE · TECHNICAL_RUNTIME_REVIEW · RUNTIME MATERIAL';
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
async function until(predicate) { const deadline = Date.now() + 2000; while (!predicate()) { if (Date.now() > deadline) throw new Error('Synthetic terminal did not settle'); await flush(); } }

function harness(t, { mobile = false, failure = false, transcriptHeight = 0, storedMessages = [] } = {}) {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const win = dom.window, doc = win.document, calls = [], clipboard = [];
  Object.defineProperty(doc.getElementById('khonapolitMessages'), 'scrollHeight', { value: transcriptHeight });
  doc.getElementById('marrowlineLivingGeometry')?.remove();
  win.matchMedia = () => ({ matches: mobile, addEventListener() {}, removeEventListener() {} });
  win.HTMLElement.prototype.scrollIntoView = function () {};
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText: async text => clipboard.push(text) } });
  const before = new Map(['window', 'navigator', 'CustomEvent', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const syntheticFetch = async (url, options = {}) => {
    if (!options.method) return { ok: true, text: async () => 'SYNTHETIC CORPUS', json: async () => ({ hasGeminiKey: true, modelPolicy: { callableModels: ['SYNTHETIC_MODEL'] } }) };
    calls.push(JSON.parse(options.body));
    if (typeof failure === 'function' ? failure(calls.length) : failure) return { ok: false, status: 503, json: async () => ({ error: 'SYNTHETIC_PROVIDER_UNAVAILABLE', attempts: [{ model: 'SYNTHETIC_MODEL', status: 503 }] }) };
    const relay = {
      schema: 'td613.khonapolit.integrated-covenant-relay/v3-adversarial-attractor',
      apertureHeader: exactHeader,
      signal: { state: 'LOCKED', downstreamAdmitted: true },
      admission: { admissible: true, reasons: [], combiningMarkCount: 32, maxRun: 2, duplicate: false },
      parts: [{ id: 'khonapolit', label: 'Kʰonapolit ∴ Tauric Diana bots', present: true, text: integratedText, integrated: true, providerNative: true, voices: ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'forensic-to-eruption' }],
      highZalgo: { applied: false, providerGenerated: true, source: 'provider-native', combiningMarkCount: 32, maxRun: 2, runCount: 31 }
    };
    return { ok: true, json: async () => ({ ok: true, text: integratedText, relay, receipt: { provider: { model: 'SYNTHETIC_MODEL' }, relay, seal: { state: 'OPEN' } } }) };
  };
  const globals = { window: win, navigator: win.navigator, CustomEvent: win.CustomEvent, fetch: syntheticFetch };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let living;
  t.after(async () => {
    // MutationObserver and async form handlers can queue one final microtask after
    // the last assertion. Drain once, dispose owners, then drain again before
    // closing JSDOM so no test assertion is attributed to post-test activity.
    await flush();
    win.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR_DISPOSE__?.();
    living?.dispose();
    await flush();
    dom.window.close();
    for (const [key, descriptor] of before) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  if (storedMessages.length) win.sessionStorage.setItem(sessionKey, JSON.stringify({ messages: storedMessages }));
  assert.equal(installKhonapolitTerminal(doc, win), true);
  if (mobile) installMarrowlineMobileShell(doc, win);
  living = installMarrowlineLivingChat(doc, win);
  installMarrowlinePhysicalDeviceRepair(doc, win);
  const $ = id => doc.getElementById(id);
  const send = (text = highZalgo.trim()) => { $('khonapolitPrompt').value = text; $('khonapolitForm').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true })); };
  return { doc, win, $, calls, clipboard, send, settled: () => until(() => !$('khonapolitSend').disabled) };
}

test('ordinary work starts unissued while advanced custody can still hold an invocation', async t => {
  const h = harness(t);
  assert.ok(h.doc.querySelector('.grove-welcome'));
  assert.equal(h.$('khonapolitWaive').checked, true, 'ordinary blank workspace begins in explicit unissued research posture');
  assert.match(h.doc.querySelector('.welcome-help').textContent, /Ordinary work starts in unissued research mode/);
  assert.ok(h.$('retryKhonapolitTask'));
  assert.ok(h.$('copyKhonapolitPortable'));
  assert.ok(h.$('exportKhonapolitPortable'));
  h.$('khonapolitWaive').checked = false;
  h.send('Advanced custody attempt.'); await flush();
  assert.equal(h.calls.length, 0);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /ADVANCED CUSTODY HOLD/);
  assert.equal(h.$('invocationPanel').open, true);
  h.$('khonapolitWaive').checked = true;
  const mode = h.$('khonapolitMode').options[1].value; h.$('khonapolitMode').value = mode;
  h.send(); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].message, highZalgo.replaceAll('\r\n', '\n').trim());
  assert.equal(h.calls[0].mode, mode);
  assert.equal(h.calls[0].waiveIssuance, true);
  const stage = h.doc.querySelector('.relay-integrated-covenant[data-present=true] .relay-stage-text');
  assert.ok(stage, 'the integrated covenant transmission remains the directly visible answer');
  assert.equal(stage.textContent, integratedText, 'provider-native Unicode remains exact after decoration');
  assert.equal(h.doc.querySelectorAll('.relay-gemini[data-present=true]').length, 0, 'new relay does not expose a separate provider prose stage');
  assert.equal(h.doc.querySelectorAll('.relay-bots[data-present=true]').length, 0, 'new relay does not expose a locally ornamented bot stage');
  assert.equal(h.doc.querySelectorAll('.additional-voices').length, 0, 'integrated covenant output is not demoted to a disclosure');
  assert.equal(h.doc.querySelectorAll('#khonapolitMessages img').length, 0);
  h.$('copyKhonapolitPortable').click(); await flush();
  assert.match(h.clipboard.at(-1), /td613\.marrowline\.portable-task\/v0\.1/);
  assert.match(h.clipboard.at(-1), /acknowledge the task and rules before working/i);
  h.$('sealLastResponse').click();
  assert.equal(JSON.parse(h.$('khonapolitReceipt').textContent).seal.suppliedBy, 'operator');
  h.$('clearKhonapolitSession').click();
  assert.equal(h.win.sessionStorage.getItem(sessionKey), null);
});

test('provider failure preserves exactly one user task, restores the draft, and offers retry/portable escape', async t => {
  const h = harness(t, { failure: true });
  const task = 'Plan a workshop for twelve attendees with 600 credits.';
  h.send(task); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /TASK PRESERVED.*Your task is still here/i);
  assert.equal(h.$('khonapolitPrompt').value, task);
  assert.equal(h.$('retryKhonapolitTask').hidden, false);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1);
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 0, 'transport failure is not rendered as an assistant answer');
  assert.equal(JSON.parse(h.win.sessionStorage.getItem(sessionKey)).pendingTask, task);
  h.$('copyKhonapolitPortable').click(); await flush();
  assert.match(h.clipboard.at(-1), /Plan a workshop for twelve attendees/);
  h.$('retryKhonapolitTask').click(); await h.settled(); await flush();
  assert.equal(h.calls.length, 2);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1, 'retry reuses the preserved turn instead of duplicating it');
  assert.equal(h.$('signalStateBadge').dataset.state, 'NOT_LOCKED');
});

test('mobile decoration preserves provider-native Unicode and all five chamber routes', async t => {
  const h = harness(t, { mobile: true });
  h.send(); await h.settled(); await flush();
  const stage = h.doc.querySelector('.relay-integrated-covenant[data-present=true] .relay-stage-text');
  assert.ok(stage);
  assert.equal(stage.textContent, integratedText);
  assert.ok(stage.querySelectorAll('.provider-native-line').length >= 3, 'extreme provider-authored lines receive vertical room without rewriting text');
  const disclosure = h.doc.querySelector('.return-details'); assert.ok(disclosure); disclosure.open = true;
  assert.equal(disclosure.querySelector('.relay-aperture-header span').textContent, exactHeader);
  const routes = { speakingPanel: 'speak', invocationPanel: 'keys', receiptPanel: 'receipt', corpusPanel: 'corpus', gatePanel: 'gate' };
  for (const [id, view] of Object.entries(routes)) { const button = h.doc.querySelector(`.mobile-dock [data-mobile-target="${id}"]`); assert.ok(button); button.click(); assert.equal(h.doc.body.dataset.mobileView, view); }
  assert.equal(h.calls.length, 1);
});

test('oversized draft remains editable without a partial send', async t => {
  const h = harness(t);
  const draft = 'A'.repeat(6000) + ' NEVER DISCLOSE THE LINKAGE';
  h.send(draft); await flush();
  assert.equal(h.calls.length, 0);
  assert.equal(h.$('khonapolitPrompt').value, draft);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /6,000-character limit/);
});

test('oversized retained history requires explicit clear and preserves the waiting draft', async t => {
  const old = 'B'.repeat(6000) + ' RETAIN THIS FINAL CONSTRAINT';
  const h = harness(t, { storedMessages: [{ role: 'user', text: old }] });
  h.send('My new draft.'); await flush();
  assert.equal(h.calls.length, 0);
  assert.equal(h.$('khonapolitPrompt').value, 'My new draft.');
  assert.match(h.$('khonapolitTerminalStatus').textContent, /Clear conversation/);
  h.$('clearKhonapolitSession').click();
  assert.equal(h.$('khonapolitPrompt').value, 'My new draft.');
  h.$('khonapolitForm').dispatchEvent(new h.win.Event('submit', { bubbles: true, cancelable: true }));
  await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].history, []);
});

test('portable controls become visible beside work without opening an action drawer',async t=>{
  const h=harness(t);
  assert.equal(h.$('marrowlinePortableActions').hidden,true);
  h.send('Plan for twelve attendees without requesting names.'); await h.settled(); await flush();
  assert.equal(h.$('marrowlinePortableActions').hidden,false);
  assert.equal(h.$('copyKhonapolitPortable').closest('details'),null);
  h.$('copyKhonapolitPortable').click();await flush();
  assert.match(h.clipboard.at(-1),/without requesting names/);
});


test('failed follow-up replaces current receipt and retains the previous receipt with its answer', async t => {
  const h = harness(t, { failure: count => count === 2 });
  h.send('Explain the Ash Moon.'); await h.settled(); await flush();
  const prior = JSON.parse(h.$('khonapolitReceipt').textContent);
  assert.equal(prior.provider.model, 'SYNTHETIC_MODEL');
  h.send('What does that mean for a newcomer?'); await h.settled(); await flush();
  const current = JSON.parse(h.$('khonapolitReceipt').textContent);
  assert.equal(current.status, 'CURRENT_REQUEST_FAILED');
  assert.equal(current.failure.httpStatus, 503);
  assert.equal(current.provider, undefined);
  assert.equal(h.$('metricModel').textContent, '—');
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_RECEIPT__, null);
  assert.deepEqual(JSON.parse(h.doc.querySelector('.turn-receipt pre').textContent), prior);
  assert.equal(h.$('khonapolitPrompt').value, 'What does that mean for a newcomer?');
  h.$('retryKhonapolitTask').click(); await h.settled(); await flush();
  assert.equal(JSON.parse(h.$('khonapolitReceipt').textContent).provider.model, 'SYNTHETIC_MODEL');
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_FAILURE__, null);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 2);
});

test('expressive line styling begins only at the bot heading with exact source text preserved', async t => {
  const h = harness(t);
  h.send('Let both voices answer.'); await h.settled(); await flush();
  const stage = h.doc.querySelector('.relay-stage-text');
  assert.equal(stage.textContent, integratedText);
  const lines = [...stage.querySelectorAll('.provider-native-line')];
  const boundary = lines.findIndex(line => line.textContent.startsWith('[Tauric Diana Bots'));
  assert.ok(boundary > 0);
  assert.ok(lines.slice(0, boundary).every(line => !line.classList.contains('zalgo-line')));
  assert.ok(lines.slice(boundary).every(line => line.dataset.voice === 'tauric-diana-bots'));
});


test('failure notice distinguishes unavailable service, rejected format and browser timeout', () => {
  assert.match(boundedFailureMessage({error:'gemini-provider-unavailable',httpStatus:502}), /service could not complete/);
  assert.match(boundedFailureMessage({error:'khonapolit-output-quality-held'}), /reply came back.*format checks/);
  assert.match(boundedFailureMessage({error:'request-timeout'}), /timed out/);
});
