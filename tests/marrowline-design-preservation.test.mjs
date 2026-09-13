/** Synthetic DOM behavior only. No browser layout or live-provider correctness claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { installKhonapolitTerminal } from '../app/dome-world/marrowline-terminal.js';
import { installMarrowlineMobileShell } from '../app/dome-world/marrowline-mobile-shell.js';
import { installMarrowlineLivingChat } from '../app/dome-world/marrowline-living-chat.js';

const html = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const sessionKey = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
const highZalgo = '  A\u0315\u0300\u0338\u200c\u{10d613}  \n\nB\u035c\u0361\r\n𝌋 <img src=x onerror=alert(1)>  ';
const exactHeader = 'SYNTHETIC APERTURE · TECHNICAL_RUNTIME_REVIEW · RUNTIME MATERIAL';
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
async function until(predicate) { const deadline = Date.now() + 2000; while (!predicate()) { if (Date.now() > deadline) throw new Error('Synthetic terminal did not settle'); await flush(); } }

function harness(t, { mobile = false, failure = false, transcriptHeight = 0, storedMessages = [] } = {}) {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const win = dom.window, doc = win.document, calls = [], clipboard = [];
  Object.defineProperty(doc.getElementById('khonapolitMessages'), 'scrollHeight', { value: transcriptHeight });
  doc.getElementById('marrowlineLivingGeometry')?.remove();
  win.matchMedia = () => ({ matches: mobile, addEventListener() {} });
  win.HTMLElement.prototype.scrollIntoView = function () {};
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText: async text => clipboard.push(text) } });
  const before = new Map(['window', 'navigator', 'CustomEvent', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const syntheticFetch = async (url, options = {}) => {
    if (!options.method) return { ok: true, text: async () => 'SYNTHETIC CORPUS', json: async () => ({ hasGeminiKey: true, modelPolicy: { callableModels: ['SYNTHETIC_MODEL'] } }) };
    calls.push(JSON.parse(options.body));
    if (failure) return { ok: false, status: 503, json: async () => ({ error: 'SYNTHETIC_PROVIDER_UNAVAILABLE', attempts: [{ model: 'SYNTHETIC_MODEL', status: 503 }] }) };
    const relay = { apertureHeader: exactHeader, signal: { state: 'LOCKED' }, parts: [
      { id: 'gemini', label: 'Gemini instrument', present: true, text: 'SYNTHETIC RETURN' },
      { id: 'khonapolit', label: 'Kʰonapolit relay', present: false, text: '' },
      { id: 'tauric-diana-bots', label: 'High Zalgo', present: true, text: highZalgo, intensity: 5 }
    ] };
    return { ok: true, json: async () => ({ ok: true, text: highZalgo, relay, receipt: { provider: { model: 'SYNTHETIC_MODEL' }, relay, seal: { state: 'OPEN' } } }) };
  };
  const globals = { window: win, navigator: win.navigator, CustomEvent: win.CustomEvent, fetch: syntheticFetch };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let living;
  t.after(() => { living?.dispose(); dom.window.close(); for (const [key, descriptor] of before) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
  if (storedMessages.length) win.sessionStorage.setItem(sessionKey, JSON.stringify({ messages: storedMessages }));
  assert.equal(installKhonapolitTerminal(doc, win), true);
  if (mobile) installMarrowlineMobileShell(doc, win);
  living = installMarrowlineLivingChat(doc, win);
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
  h.send(); await h.settled();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].message, highZalgo.replaceAll('\r\n', '\n').trim());
  assert.equal(h.calls[0].mode, mode);
  assert.equal(h.calls[0].waiveIssuance, true);
  assert.equal(h.doc.querySelector('.relay-bots[data-present=true] .relay-stage-text').textContent, highZalgo);
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
  h.send(task); await h.settled();
  assert.equal(h.calls.length, 1);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /TASK PRESERVED.*Your task is still here/i);
  assert.equal(h.$('khonapolitPrompt').value, task);
  assert.equal(h.$('retryKhonapolitTask').hidden, false);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1);
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 0, 'transport failure is not rendered as an assistant answer');
  assert.equal(JSON.parse(h.win.sessionStorage.getItem(sessionKey)).pendingTask, task);
  h.$('copyKhonapolitPortable').click(); await flush();
  assert.match(h.clipboard.at(-1), /Plan a workshop for twelve attendees/);
  h.$('retryKhonapolitTask').click(); await h.settled();
  assert.equal(h.calls.length, 2);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1, 'retry reuses the preserved turn instead of duplicating it');
  assert.equal(h.$('signalStateBadge').dataset.state, 'NOT_LOCKED');
});

test('mobile decoration preserves Unicode and all five chamber routes', async t => {
  const h = harness(t, { mobile: true });
  h.send(); await h.settled(); await flush();
  assert.equal(h.doc.querySelector('.relay-bots[data-present=true] .relay-stage-text').textContent, highZalgo);
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
  await h.settled();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].history, []);
});