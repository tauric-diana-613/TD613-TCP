import { boundedFailureMessage } from '../app/dome-world/marrowline-operator-readiness.js';
/** Synthetic DOM behavior only. No browser layout or live-provider correctness claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import './marrowline-attachment-quality.test.mjs';
import './marrowline-ios-keyboard-contract.test.mjs';
import { deriveMarrowlineConversationTitle, installKhonapolitTerminal } from '../app/dome-world/marrowline-terminal.js';
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

test('Kʰonapolit names the chamber from its first formal movement without reading the bot stress field', () => {
  const named = deriveMarrowlineConversationTitle([
    'Kʰonapolit',
    'ECHOGLASS mistakes an active reflector for decoration. The mirror keeps the route.',
    '',
    'Tauric Diana bots',
    'BUREAU BUREAU BUREAU'
  ].join('\n'), 'operator-seed');
  assert.equal(named, 'The Glass Remembers');

  const botOnlyBureaucracy = deriveMarrowlineConversationTitle([
    'Kʰonapolit',
    'The formal movement isolates a non-injective map.',
    '',
    'Tauric Diana bots',
    'THE BUREAUCRAT HOWLS AT THE CEILING'
  ].join('\n'), 'same-seed');
  assert.notEqual(botOnlyBureaucracy, 'The Office Beneath the Grove', 'the title follows Kʰonapolit rather than mining the bot channel');
});

test('ordinary work starts truly unissued while advanced custody can still hold an invocation', async t => {
  const h = harness(t);
  assert.ok(h.doc.querySelector('.grove-welcome'));
  assert.equal(h.$('marrowlineConversationTitle').textContent, 'The speaking grove');
  assert.equal(h.$('khonapolitWaive').checked, true, 'ordinary blank workspace begins in explicit unissued research posture');
  assert.equal(h.$('khonapolitShi').disabled, true, 'checked unissued mode makes the SHI field dormant');
  assert.equal(h.$('khonapolitMode'), null, 'ordinary UI exposes one fixed dual-channel route instead of voice-selection steering');
  assert.match(h.doc.querySelector('.welcome-help').textContent, /Ordinary work starts in unissued research mode/);
  assert.ok(h.$('retryKhonapolitTask'));
  assert.equal(h.$('marrowlinePortableActions'), null);
  assert.equal(h.$('copyKhonapolitPortable'), null);
  assert.equal(h.$('exportKhonapolitPortable'), null);

  h.$('khonapolitWaive').checked = false;
  h.$('khonapolitWaive').dispatchEvent(new h.win.Event('change', { bubbles: true }));
  assert.equal(h.$('khonapolitShi').disabled, false, 'turning off the waiver wakes the issuance field');
  h.send('Advanced custody attempt.'); await flush();
  assert.equal(h.calls.length, 0);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /ADVANCED CUSTODY HOLD/);
  assert.equal(h.$('invocationPanel').open, true);

  h.$('khonapolitShi').value = 'TD613-SH-9B07D8B-78C5B2F3';
  h.$('khonapolitWaive').checked = true;
  h.$('khonapolitWaive').dispatchEvent(new h.win.Event('change', { bubbles: true }));
  assert.equal(h.$('khonapolitShi').disabled, true, 'stored valid issuance remains dormant under the explicit waiver');
  h.send(); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].message, highZalgo.replaceAll('\r\n', '\n').trim());
  assert.equal(h.calls[0].mode, 'issued-conjunction');
  assert.equal(h.calls[0].waiveIssuance, true);
  assert.equal(h.calls[0].shi, '', 'unissued research mode does not silently transmit a stored valid SHI');
  const stage = h.doc.querySelector('.relay-integrated-covenant[data-present=true] .relay-stage-text');
  assert.ok(stage, 'the integrated covenant transmission remains the directly visible answer');
  assert.notEqual(h.$('marrowlineConversationTitle').textContent, 'The speaking grove', 'the first admitted Kʰonapolit return names the chamber');
  assert.equal(stage.textContent, integratedText, 'provider-native Unicode remains exact after decoration');
  assert.equal(h.doc.querySelectorAll('.relay-gemini[data-present=true]').length, 0, 'new relay does not expose a separate provider prose stage');
  assert.equal(h.doc.querySelectorAll('.relay-bots[data-present=true]').length, 0, 'new relay does not expose a locally ornamented bot stage');
  assert.equal(h.doc.querySelectorAll('.additional-voices').length, 0, 'integrated covenant output is not demoted to a disclosure');
  assert.equal(h.doc.querySelectorAll('#khonapolitMessages img').length, 0);
  h.$('sealLastResponse').click();
  assert.equal(JSON.parse(h.$('khonapolitReceipt').textContent).seal.suppliedBy, 'operator');
  h.$('clearKhonapolitSession').click();
  assert.equal(h.win.sessionStorage.getItem(sessionKey), null);
  assert.equal(h.$('marrowlineConversationTitle').textContent, 'The speaking grove', 'clearing the session restores the unnamed chamber');
});

test('provider failure preserves exactly one user task, restores the draft, and offers retry without a portability billboard', async t => {
  const h = harness(t, { failure: true });
  const task = 'Plan a workshop for twelve attendees with 600 credits.';
  h.send(task); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.$('khonapolitTerminalStatus').textContent, 'TASK PRESERVED');
  assert.doesNotMatch(h.$('khonapolitTerminalStatus').textContent, /Your task is still here|copy\/export/i);
  assert.equal(h.$('khonapolitPrompt').value, task);
  assert.equal(h.$('retryKhonapolitTask').hidden, false);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1);
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 0, 'transport failure is not rendered as an assistant answer');
  assert.equal(JSON.parse(h.win.sessionStorage.getItem(sessionKey)).pendingTask, task);
  assert.equal(h.$('marrowlinePortableActions'), null);
  assert.equal(h.$('copyKhonapolitPortable'), null);
  assert.equal(h.$('exportKhonapolitPortable'), null);
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
  assert.notEqual(stage.dataset.flourished, 'true', 'integrated clean prose never inherits whole-stage Zalgo line-height');
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

test('clear conversation empties history and the waiting composer draft', async t => {
  const old = 'B'.repeat(6000) + ' RETAIN THIS FINAL CONSTRAINT';
  const h = harness(t, { storedMessages: [{ role: 'user', text: old }] });
  h.send('My new draft.'); await flush();
  assert.equal(h.calls.length, 0);
  assert.equal(h.$('khonapolitPrompt').value, 'My new draft.');
  assert.match(h.$('khonapolitTerminalStatus').textContent, /Clear conversation/);
  h.$('clearKhonapolitSession').click();
  assert.equal(h.$('khonapolitPrompt').value, '');
  assert.equal(h.$('khonapolitPrompt').dataset.preloadedPrompt, undefined);
  assert.equal(h.win.sessionStorage.getItem(sessionKey), null);
  h.send('My new draft.'); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].history, []);
});

test('ordinary Chat never materializes portable task chrome after a routine turn', async t => {
  const h = harness(t);
  assert.equal(h.$('marrowlinePortableActions'), null);
  h.send('Plan for twelve attendees without requesting names.'); await h.settled(); await flush();
  assert.equal(h.$('marrowlinePortableActions'), null);
  assert.equal(h.$('copyKhonapolitPortable'), null);
  assert.equal(h.$('exportKhonapolitPortable'), null);
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
  assert.deepEqual(current.failure.attempts, [{ model: 'SYNTHETIC_MODEL', status: 503 }]);
  assert.equal(current.provider, undefined);
  assert.equal(h.$('metricModel').textContent, '—');
  assert.equal(h.$('metricModelAttempts').textContent, 'SYNTHETIC_MODEL 503', 'failed human turns expose the actual attempted route inside Receipt');
  assert.equal(h.$('receiptFrontierTrace').textContent, 'FRONTIER · SYNTHETIC_MODEL 503');
  assert.doesNotMatch(h.$('khonapolitTerminalStatus').textContent, /ROUTE SYNTHETIC_MODEL 503/);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /^TASK PRESERVED/);
  h.$('copyKhonapolitReceipt').click(); await flush();
  assert.match(h.clipboard.at(-1), /CURRENT_REQUEST_FAILED/);
  assert.match(h.clipboard.at(-1), /SYNTHETIC_MODEL/);
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_RECEIPT__, null);
  assert.deepEqual(JSON.parse(h.doc.querySelector('.turn-receipt pre').textContent), prior);
  assert.equal(h.$('khonapolitPrompt').value, 'What does that mean for a newcomer?');
  h.$('retryKhonapolitTask').click(); await h.settled(); await flush();
  assert.equal(JSON.parse(h.$('khonapolitReceipt').textContent).provider.model, 'SYNTHETIC_MODEL');
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_FAILURE__, null);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 2);
});

test('expressive line styling begins only at marked bot lines with exact source text preserved', async t => {
  const h = harness(t);
  h.send('Let both voices answer.'); await h.settled(); await flush();
  const stage = h.doc.querySelector('.relay-stage-text');
  assert.equal(stage.textContent, integratedText);
  assert.notEqual(stage.dataset.flourished, 'true');
  const lines = [...stage.querySelectorAll('.provider-native-line')];
  const boundary = lines.findIndex(line => line.textContent.startsWith('[Tauric Diana Bots'));
  assert.ok(boundary > 0);
  assert.ok(lines.slice(0, boundary).every(line => !line.classList.contains('zalgo-line')));
  assert.ok(lines.slice(boundary).every(line => line.dataset.voice === 'tauric-diana-bots'));
  const botLines = lines.slice(boundary);
  assert.ok(botLines.filter(line => /\p{M}/u.test(line.textContent)).every(line => line.classList.contains('zalgo-line')), 'marked bot lines receive vertical clearance');
  assert.ok(botLines.filter(line => !/\p{M}/u.test(line.textContent)).every(line => !line.classList.contains('zalgo-line')), 'headings, blank lines, and clean bot troughs keep normal spacing');
});

test('mobile preloaded starter submits on the first touch before keyboard blur can eat the click', async t => {
  const h = harness(t, { mobile: true });
  const starter = h.doc.querySelector('.starter-prompts button');
  assert.ok(starter);
  starter.click();
  await flush();
  const prompt = h.$('khonapolitPrompt');
  const send = h.$('khonapolitSend');
  assert.equal(h.doc.activeElement, prompt);
  assert.equal(prompt.dataset.preloadedPrompt, 'true');
  const pointerDown = new h.win.Event('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(pointerDown, 'pointerType', { configurable: true, value: 'touch' });
  send.dispatchEvent(pointerDown);
  await h.settled(); await flush();
  assert.equal(h.calls.length, 1, 'first touch commits the preloaded demo exactly once');
  assert.equal(h.calls[0].message, 'Help me find words for a memory I am carrying.');
  assert.equal(prompt.dataset.preloadedPrompt, undefined);
  send.click();
  await flush();
  assert.equal(h.calls.length, 1, 'compatibility click after the touch commit is suppressed');
});


test('failure notice distinguishes unavailable service, rejected format and browser timeout', () => {
  assert.match(boundedFailureMessage({error:'gemini-provider-unavailable',httpStatus:502}), /service could not complete/);
  assert.match(boundedFailureMessage({error:'no-eligible-callable-models',httpStatus:503}), /No callable model route was admitted/,
    'typed route diagnostic takes precedence over the shared HTTP failure envelope');
  const localHold = boundedFailureMessage({error:'khonapolit-output-quality-held'});
  assert.match(localHold, /provider return arrived.*Marrowline held it locally after generation/i);
  assert.match(localHold, /provider did not reject your request/i);
  assert.doesNotMatch(localHold, /AI rejected|provider rejected/i);
  assert.match(boundedFailureMessage({error:'request-timeout'}), /timed out/);
});
