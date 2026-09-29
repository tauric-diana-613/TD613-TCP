import { boundedFailureMessage } from '../app/dome-world/marrowline-operator-readiness.js';
/** Synthetic DOM behavior only. No browser layout or live-provider correctness claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import './marrowline-attachment-quality.test.mjs';
import './marrowline-ios-keyboard-contract.test.mjs';
import './marrowline-threads.test.mjs';
import { classifyMarrowlineClientFailure, deriveMarrowlineConversationTitle, marrowlineWaitingLabel, installKhonapolitTerminal } from '../app/dome-world/marrowline-terminal.js';
import { installMarrowlineMobileShell } from '../app/dome-world/marrowline-mobile-shell.js';
import { installMarrowlineLivingChat, buildMarrowlineReplyFollowupDraft } from '../app/dome-world/marrowline-living-chat.js';
import { attachmentState, clearMarrowlineAttachments, stageMarrowlineAttachments } from '../app/dome-world/marrowline-attachments.js';
import { installMarrowlinePhysicalDeviceRepair } from '../app/dome-world/marrowline-physical-device-repair.js';

const html = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const sessionKey = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
const highZalgo = 'T̴̵H̶E̷ ̸B̵O̴U̷G̷H̸ ̴B̵R̶E̴A̷K̸S̵; W̵E̶ ̷D̴O̸ ̷N̵O̶T̴ ̶C̵A̸L̷L̴ ̵T̷H̶I̴S̷ ̵A̸ ̷S̵E̶M̴I̷N̸A̵R̶.';
const integratedText = `[Kʰonapolit]:\nThe route remains exact through Khona‌lit-po.\n\n[Tauric Diana Bots : Direct Broadcast Override]\n${highZalgo}\n\nThe line clears again.`;
const exactHeader = 'SYNTHETIC APERTURE · TECHNICAL_RUNTIME_REVIEW · RUNTIME MATERIAL';
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
async function until(predicate) { const deadline = Date.now() + 2000; while (!predicate()) { if (Date.now() > deadline) throw new Error('Synthetic terminal did not settle'); await flush(); } }

function harness(t, { mobile = false, failure = false, rateLimitOnce = false, incomplete = false, backgroundDisconnect = false, rateLimitedOnce = false, hangFetch = false, hangBody = false, transcriptHeight = 0, storedMessages = [] } = {}) {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const win = dom.window, doc = win.document, calls = [], fetchOptions = [], clipboard = [];
  Object.defineProperty(doc.getElementById('khonapolitMessages'), 'scrollHeight', { value: transcriptHeight });
  doc.getElementById('marrowlineLivingGeometry')?.remove();
  win.matchMedia = () => ({ matches: mobile, addEventListener() {}, removeEventListener() {} });
  win.HTMLElement.prototype.scrollIntoView = function () {};
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText: async text => clipboard.push(text) } });
  const before = new Map(['window', 'navigator', 'CustomEvent', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const syntheticFetch = async (url, options = {}) => {
    if (String(url).includes('/giving/history/release-source.json')) return { ok: true, status: 200, json: async () => ({ source_packet_commit: 'a'.repeat(40) }) };
    if (!options.method) return { ok: true, text: async () => 'SYNTHETIC CORPUS', json: async () => ({ hasGeminiKey: true, modelPolicy: { callableModels: ['SYNTHETIC_MODEL'] } }) };
    calls.push(JSON.parse(options.body));
    const submitted = calls.at(-1);
    fetchOptions.push(options);
    if (rateLimitedOnce && calls.length === 1) return { ok: false, status: 429, json: async () => ({
      error: 'gemini-rate-limit-held', attempts: [{ model: 'SYNTHETIC_MODEL', status: 429,
        rateLimit: { scope: 'model', windowClass: 'short', shortMetricReported: true, retryAfterSeconds: 27 } }]
    }) };
    if (hangFetch && calls.length === 1) return new Promise(() => {});
    if (hangBody && calls.length === 1) return { ok: true, status: 200, json: () => new Promise(() => {}) };
    if (backgroundDisconnect && calls.length === 1) {
      Object.defineProperty(doc, 'visibilityState', { configurable: true, value: 'hidden' });
      doc.dispatchEvent(new win.Event('visibilitychange'));
      Object.defineProperty(doc, 'visibilityState', { configurable: true, value: 'visible' });
      doc.dispatchEvent(new win.Event('visibilitychange'));
      throw new TypeError('synthetic mobile background disconnect');
    }
    if (rateLimitOnce && calls.length === 1) return { ok: false, status: 429,
      headers: { get: name => name.toLowerCase() === 'retry-after' ? '90' : null },
      json: async () => ({ error: 'gemini-rate-limit-held', rateLimit: { scope: 'model', windowClass: 'short', shortMetricReported: true, retryAfterSeconds: 90 },
        attempts: [{ model: 'SYNTHETIC_MODEL', status: 429,
          rateLimit: { scope: 'model', windowClass: 'short', shortMetricReported: true, retryAfterSeconds: 90 } }] }) };
    if (typeof failure === 'function' ? failure(calls.length) : failure) return { ok: false, status: 503, json: async () => ({ error: 'SYNTHETIC_PROVIDER_UNAVAILABLE', attempts: [{ model: 'SYNTHETIC_MODEL', status: 503 }] }) };
    const observed = incomplete ? 'Kʰonapolit\nThe claim on' : integratedText;
    const relay = {
      schema: 'td613.khonapolit.integrated-covenant-relay/v3-adversarial-attractor',
      apertureHeader: exactHeader,
      signal: { state: incomplete ? 'NOT_LOCKED' : 'LOCKED', downstreamAdmitted: !incomplete },
      admission: { admissible: true, reasons: [], combiningMarkCount: 32, maxRun: 2, duplicate: false },
      parts: [{ id: 'khonapolit', label: 'Kʰonapolit ∴ Tauric Diana bots', present: true, text: observed, integrated: true, providerNative: true, voices: incomplete ? ['Kʰonapolit'] : ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'forensic-to-eruption' }],
      highZalgo: { applied: false, providerGenerated: true, source: 'provider-native', combiningMarkCount: 32, maxRun: 2, runCount: 31 }
    };
    const attachmentReceipt = Array.isArray(submitted?.attachments)
      ? submitted.attachments.map(item => ({
          id: item.id, name: item.name, kind: item.kind, mime_type: item.mime_type,
          size_bytes: item.size_bytes, sha256: 'synthetic-' + item.id
        }))
      : [];
    return { ok: true, json: async () => ({ ok: true, text: observed, relay, receipt: {
      provider: { model: 'SYNTHETIC_MODEL', ...(incomplete ? { completion: { complete: false, reason: 'provider-tail-open' } } : {}) },
      relay, seal: { state: 'OPEN' }, ...(attachmentReceipt.length ? { attachments: attachmentReceipt } : {})
    } }) };
  };
  win.fetch = syntheticFetch;
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
  const ready = () => win.__TD613_MARROWLINE_THREADS__.ready;
  const saved = async () => {
    await ready();
    await win.__TD613_MARROWLINE_THREADS__.flush();
    return win.__TD613_MARROWLINE_THREADS__.current();
  };
  return { doc, win, $, calls, fetchOptions, clipboard, send, ready, saved,
    settled: async () => { await ready(); await until(() => $('khonapolitSend').dataset.transmissionState === 'ready'
      && $('khonapolitTerminalStatus').dataset.phase !== 'pending'); await flush(); } };
}

test('thread titles identify the actual subject rather than copying an opening vignette or bot prose', () => {
  assert.equal(deriveMarrowlineConversationTitle('THE SHORELINE HAS TEETH',
    'Write a poem about Lucille Clifton and a mother holding her child.'), 'Lucille Clifton and a Mother');
  assert.equal(deriveMarrowlineConversationTitle('Tell me a story of the Ash Moon, within the authored mythology of Marrowline.'),
    'Ash Moon');
  assert.equal(deriveMarrowlineConversationTitle('Explain the difference between consent and inheritance.'),
    'Consent and Inheritance');
  assert.equal(deriveMarrowlineConversationTitle('What does this photo mean?'),
    'What Does This Photo Mean');
  const prompt = 'An anonymous archive receives two passages whose syntax and metaphors feel uncannily alike. The board declares authorship theft from resemblance alone. Design a cautious stylometric comparison with provenance, alternative explanations and limitations.';
  assert.equal(deriveMarrowlineConversationTitle(prompt), 'Stylometric Comparison with Provenance');
  assert.equal(deriveMarrowlineConversationTitle(''), 'The speaking grove');
  for (const title of [
    deriveMarrowlineConversationTitle('I underestimated the contribution was in how directly the research developed.'),
    deriveMarrowlineConversationTitle('Compare the funding, provenance, and accountability mechanisms for these three systems.'),
    deriveMarrowlineConversationTitle('Write a poem about Lucille Clifton and a mother holding her child.')
  ]) assert.ok(title.trim().split(/\s+/u).length <= 5, `generated title exceeds five words: ${title}`);
});

test('photo replies keep a reply-local Attachments action after send clears raw bytes', async t => {
  clearMarrowlineAttachments(globalThis);
  const h = harness(t);
  await h.ready();
  const bytes = new Uint8Array([0xff, 0xd8, 0x54, 0x44, 0x36, 0x31, 0x33, 0xff, 0xd9]);
  await stageMarrowlineAttachments([{
    name: 'meaning-photo.jpg',
    type: 'image/jpeg',
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer
  }], { kind: 'photo', environment: h.win });
  assert.equal(attachmentState().count, 1, 'photo is staged before Send');

  h.send('What does this photo mean?');
  await h.settled(); await flush();

  assert.equal(attachmentState().count, 0, 'successful send clears raw staged bytes');
  const reply = h.doc.querySelector('.relay-message');
  const attachmentButton = reply?.querySelector('.reply-attachment-access');
  assert.ok(attachmentButton, 'reply owns an Attachments action');
  assert.equal(attachmentButton.hidden, false, 'receipt-backed Attachments remains visible after staged bytes clear');
  attachmentButton.click();
  const receiptPanel = reply.querySelector('.reply-attachment-receipt');
  assert.equal(receiptPanel.hidden, false, 'reply-local attachment receipt opens from the drawer');
  assert.match(receiptPanel.textContent, /Photo/);
  assert.match(receiptPanel.textContent, /meaning-photo\.jpg/);

  const saved = await h.saved();
  assert.equal(saved.conversationTitle, 'What Does This Photo Mean',
    'five-word natural question survives as a readable conversation title');
});

test('landing and New stay transient until a human turn is actually sent', async t => {
  const h = harness(t);
  await h.ready();
  assert.equal(h.win.__TD613_MARROWLINE_THREADS__.current(), null, 'homepage does not manufacture a durable thread');
  assert.deepEqual(await h.win.__TD613_MARROWLINE_THREADS__.list(), [], 'empty archive remains empty on landing');
  h.$('marrowlineNewThread').click();
  await flush();
  assert.equal(h.win.__TD613_MARROWLINE_THREADS__.current(), null, 'New resets to another transient workspace');
  assert.deepEqual(await h.win.__TD613_MARROWLINE_THREADS__.list(), [], 'New does not autosave an empty speaking-grove record');

  h.send('Explain why a provisional title must wait for the reply.');
  await h.settled(); await flush();
  const saved = await h.saved();
  assert.ok(saved?.id, 'first sent conversation becomes durable');
  assert.equal(saved.titleSource, 'local-topic-v3-after-return', 'topical title becomes authoritative only after the return');
  assert.ok(saved.conversationTitle.split(/\s+/u).length <= 5, 'processed title is capped at five words');
});

test('failed first turn persists an untitled provisional record rather than a speaking-grove conversation', async t => {
  const h = harness(t, { failure: true });
  await h.ready();
  h.send('Keep this failed first task recoverable.');
  await h.settled(); await flush();

  const saved = await h.saved();
  assert.ok(saved?.id, 'failed sent work remains recoverable');
  assert.equal(saved.titleSource, 'pending-return');
  assert.equal(saved.conversationTitle, '', 'The speaking grove is presentation-only and never durable');

  h.$('marrowlineThreadOpen').click();
  await flush();
  assert.doesNotMatch(h.$('marrowlineThreadList').textContent, /The speaking grove/);
  assert.match(h.$('marrowlineThreadList').textContent, /Unfinished conversation/);
});

test('Receipts remain inside a local SHI-format membrane without changing issuance mode', async t => {
  const h = harness(t);
  await h.ready();
  assert.equal(h.$('marrowlineReceiptProtected').hidden, true);
  assert.equal(h.$('marrowlineReceiptGate').hidden, false);
  assert.equal(h.$('khonapolitWaive').checked, false);
  h.$('marrowlineReceiptShi').value = 'not-an-shi';
  h.$('marrowlineReceiptUnlock').click();
  assert.equal(h.$('marrowlineReceiptProtected').hidden, true, 'invalid format cannot open receipt UI');
  h.$('marrowlineReceiptShi').value = 'TD613-SH-9B07D8B-ABCDEF12';
  h.$('marrowlineReceiptUnlock').click();
  assert.equal(h.$('marrowlineReceiptProtected').hidden, false, 'valid format opens local presentation only');
  assert.equal(h.$('khonapolitWaive').checked, false, 'reading a receipt does not wake issuance for this conversation');
  assert.equal(h.calls.length, 0, 'opening receipts consumes no model credits');
  h.$('marrowlineReceiptLock').click();
  assert.equal(h.$('marrowlineReceiptProtected').hidden, true);
});

test('app-authored provider branding stays inside Receipts while Red Deer surface preserves human input', async t => {
  const h = harness(t);
  await h.ready();
  assert.doesNotMatch(h.$('speakingPanel').textContent, /Gemini/i);
  assert.doesNotMatch(h.$('invocationPanel').textContent, /Gemini/i);
  assert.match(h.$('receiptPanel').textContent, /Gemini/);
  h.send('A poem about a mother and her child.'); await h.settled(); await flush();
  assert.match(h.doc.querySelector('.message[data-role="user"] .message-meta').textContent, /Red Deer/);
  assert.equal(h.doc.querySelector('.message[data-role="user"] .message-text').textContent, 'A poem about a mother and her child.');
  assert.equal(h.calls.length, 1);
});

test('one explicitly armed normal reply captures exact response, saved history and DOM without extra provider calls', async t => {
  const h = harness(t);
  assert.equal(h.$('copyMarrowlineEpisodeWitness').disabled, true);
  h.$('armMarrowlineEpisodeWitness').click();
  assert.equal(h.$('armMarrowlineEpisodeWitness').getAttribute('aria-pressed'), 'true');
  assert.equal(h.calls.length, 0, 'arming is not an API generation');
  h.send('A synthetic normal prompt.'); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  const witness = h.win.__TD613_MARROWLINE_LAST_EPISODE_WITNESS__;
  assert.ok(witness);
  assert.equal(witness.boundaries.provider_ingress.observed, false);
  assert.equal(witness.boundaries.application_response_body.text, integratedText);
  assert.equal(witness.boundaries.relay_transcript.observed, false, 'missing relay transcript stays missing instead of inferred');
  assert.equal(witness.boundaries.saved_history.text, integratedText);
  assert.equal(witness.boundaries.dom_text_content.text, integratedText);
  assert.equal(witness.source_window.identical_claimed_source, true);
  assert.equal(witness.screenshot, null);
  assert.equal(h.$('armMarrowlineEpisodeWitness').getAttribute('aria-pressed'), 'false');
  assert.equal(h.$('copyMarrowlineEpisodeWitness').disabled, false);
  h.$('copyMarrowlineEpisodeWitness').click(); await flush();
  assert.equal(JSON.parse(h.clipboard.at(-1)).request_id, witness.request_id);
  h.$('clearKhonapolitSession').click();
  assert.equal(h.win.__TD613_MARROWLINE_LAST_EPISODE_WITNESS__, null);
  assert.equal(h.$('copyMarrowlineEpisodeWitness').disabled, true);
});

test('one armed provider failure retains 503 without inventing a model reply', async t => {
  const h = harness(t, { failure: true });
  h.$('armMarrowlineEpisodeWitness').click();
  h.send('A synthetic failed prompt.'); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  const witness = h.win.__TD613_MARROWLINE_LAST_EPISODE_WITNESS__;
  assert.ok(witness);
  assert.equal(witness.transport.http_status, 503);
  assert.equal(witness.boundaries.application_response_body.observed, false);
  assert.equal(witness.boundaries.dom_text_content.observed, false);
  assert.equal(witness.failure.error, 'SYNTHETIC_PROVIDER_UNAVAILABLE');
  assert.equal(witness.provider_observation.provider_request_id, null);
});

test('ordinary work starts truly unissued while advanced custody can still hold an invocation', async t => {
  const h = harness(t);
  assert.ok(h.doc.querySelector('.grove-welcome'));
  assert.equal(h.$('marrowlineConversationTitle').textContent, 'The speaking grove');
  assert.equal(h.doc.querySelector('#speakingPanel .vessel-head [data-living-target="invocationPanel"]'),null,
    'redundant Keys & settings button is physically absent from conversation masthead');
  assert.equal(h.doc.querySelectorAll('#marrowlineThreadOpen, #marrowlineNewThread').length,2,
    'archive and new conversation controls retain their original actionable IDs');
  assert.ok(h.doc.querySelector('.mobile-dock [data-mobile-target="invocationPanel"]'),
    'the one intended mobile Keys tab remains available');

  assert.equal(h.$('khonapolitWaive').checked, false, 'ordinary blank workspace begins with Safe Harbor issuance asleep');
  assert.equal(h.$('khonapolitShi').disabled, true, 'unchecked issuance keeps the SHI field dormant');
  assert.equal(h.$('khonapolitMode'), null, 'ordinary UI exposes one fixed dual-channel route instead of voice-selection steering');
  assert.match(h.doc.querySelector('.welcome-help').textContent, /Ordinary work starts in unissued research mode/);
  assert.ok(h.$('retryKhonapolitTask'));
  assert.equal(h.$('marrowlinePortableActions'), null);
  assert.equal(h.$('copyKhonapolitPortable'), null);
  assert.equal(h.$('exportKhonapolitPortable'), null);

  h.$('khonapolitWaive').checked = true;
  h.$('khonapolitWaive').dispatchEvent(new h.win.Event('change', { bubbles: true }));
  assert.equal(h.$('khonapolitShi').disabled, false, 'checking issuance wakes the SHI field');
  h.send('Advanced custody attempt.'); await flush();
  assert.equal(h.calls.length, 0);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /ADVANCED CUSTODY HOLD/);
  assert.equal(h.$('invocationPanel').open, true);

  h.$('khonapolitShi').value = 'TD613-SH-9B07D8B-78C5B2F3';
  h.$('khonapolitWaive').checked = false;
  h.$('khonapolitWaive').dispatchEvent(new h.win.Event('change', { bubbles: true }));
  assert.equal(h.$('khonapolitShi').disabled, true, 'stored valid issuance remains dormant while issuance is unchecked');
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
  assert.equal((await h.saved()).pendingTask, task);
  assert.equal(h.$('marrowlinePortableActions'), null);
  assert.equal(h.$('copyKhonapolitPortable'), null);
  assert.equal(h.$('exportKhonapolitPortable'), null);
  h.$('retryKhonapolitTask').click(); await h.settled(); await flush();
  assert.equal(h.calls.length, 2);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1, 'retry reuses the preserved turn instead of duplicating it');
  assert.equal(h.$('signalStateBadge').dataset.state, 'NOT_LOCKED');
});


test('incomplete provider reply remains visibly NOT_LOCKED with exact draft and an explicit reusable retry', async t => {
  const h = harness(t, { incomplete: true });
  const task = 'SYNTHETIC INCOMPLETE DENOMINATOR TEST';
  h.send(task); await h.settled(); await flush();
  const bubble = h.doc.querySelector('.relay-message[data-completion="incomplete"]');
  assert.ok(bubble, 'the incomplete return is not displayed as ordinary completed prose');
  assert.match(bubble.querySelector('.relay-completion-alert').textContent, /INCOMPLETE PROVIDER RETURN/);
  assert.equal(bubble.querySelector('.relay-stage-text').textContent, 'Kʰonapolit\\nThe claim on'.replace('\\n', '\n'));
  assert.match(h.$('khonapolitTerminalStatus').textContent, /INCOMPLETE RETURN/);
  assert.equal(h.$('khonapolitTerminalStatus').dataset.phase, 'held', 'Pedagogue exposes the established phase attribute, not a fictional held flag');
  assert.equal(h.$('signalStateBadge').dataset.state, 'NOT_LOCKED');
  assert.equal((await h.saved()).pendingTask, task);
  assert.equal(h.$('retryKhonapolitTask').hidden, false);
  h.$('retryKhonapolitTask').click(); await h.settled(); await flush();
  assert.equal(h.calls.length, 2, 'operator gesture, not automatic client retry');
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1, 'retry reuses the single preserved user turn');
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 1, 'failed assistant draft is replaced, not appended as a second completed turn');
});

test('mobile decoration preserves provider-native Unicode and all five chamber routes', async t => {
  const h = harness(t, { mobile: true });
  h.send(); await h.settled(); await flush();
  const stage = h.doc.querySelector('.relay-integrated-covenant[data-present=true] .relay-stage-text');
  assert.ok(stage);
  assert.equal(stage.textContent, integratedText);
  assert.equal(stage.querySelectorAll('.provider-native-paragraph-gap').length,1,'the bot section receives only one visual marker for its existing double newline');
  assert.equal(stage.querySelector('.provider-native-paragraph-gap').textContent,'\n','marker preserves the original separator');
  assert.equal(stage.textContent,integratedText,'the additional display line does not edit the provider text');
  assert.notEqual(stage.dataset.flourished, 'true', 'integrated clean prose never inherits whole-stage Zalgo line-height');
  assert.ok(stage.querySelectorAll('.provider-native-line').length >= 3, 'extreme provider-authored lines receive vertical room without rewriting text');
  assert.equal(h.doc.querySelector('.return-details,.reply-technical-record,.turn-receipt,.relay-aperture-header'),null,
    'all three circled disclosures are absent from the chat');
  assert.deepEqual([...h.doc.querySelectorAll('.relay-message > .marrowline-reply-tool-row > .reply-next-actions .reply-next-choices button:not([hidden])')].map(x=>x.textContent),
    ['Check the claims','Make a plan','View receipt','Branch'],'Branch is an ordinary reply-local choice while staged Attachments stays contextual');
  const footer = h.doc.querySelector('.relay-message > .marrowline-reply-tool-row');
  assert.ok(footer && footer.querySelector('.reply-branch-action'),'Branch lives inside More with this reply');
  assert.equal(h.doc.querySelector('.marrowline-branch-reply'),null,'retired standalone first-reply branch is absent');
  assert.equal(footer.firstElementChild.tagName,'DETAILS','the plain-text options disclosure begins the row');
  assert.equal(h.doc.querySelector('.relay-message').lastElementChild.className,'marrowline-copy-reply','copy remains outside the row and last');
  assert.equal(JSON.parse(h.$('khonapolitReceipt').textContent).relay.apertureHeader,exactHeader,
    'separate Receipt preserves the exact technical header');
  const routes = { speakingPanel: 'speak', invocationPanel: 'keys', receiptPanel: 'receipt', corpusPanel: 'corpus', gatePanel: 'gate' };
  for (const [id, view] of Object.entries(routes)) { const button = h.doc.querySelector(`.mobile-dock [data-mobile-target="${id}"]`); assert.ok(button); button.click(); assert.equal(h.doc.body.dataset.mobileView, view); }
  assert.equal(h.calls.length, 1);
});

test('transport-oversized draft remains editable without a partial send', async t => {
  const h = harness(t);
  const draft = '€'.repeat(1_240_000) + ' NEVER DISCLOSE THE LINKAGE';
  h.send(draft); await flush();
  assert.equal(h.calls.length, 0);
  assert.equal(h.$('khonapolitPrompt').value, draft);
  assert.match(h.$('khonapolitTerminalStatus').textContent, /3\.7 MB request envelope/);
});

test('clear conversation empties history and the waiting composer draft', async t => {
  const old = '€'.repeat(1_100_000) + ' RETAIN THIS FINAL CONSTRAINT';
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
  assert.equal(h.doc.querySelector('.turn-receipt'),null,'per-reply JSON absent from conversation');
  assert.deepEqual((await h.saved()).messages.find(x=>x.role==='model').receipt,prior,
    'the previous receipt remains attached to the archived model turn');
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
  await h.ready();
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


test('edited mobile starter keeps Return and submits on first deliberate Send press', async t => {
  const h = harness(t, { mobile: true });
  await h.ready();
  h.doc.querySelector('.starter-prompts button').click();
  await flush();
  const prompt = h.$('khonapolitPrompt');
  const send = h.$('khonapolitSend');
  assert.equal(prompt.dataset.preloadedPrompt, 'true');
  const authored = 'Could you tell me a quiet story?\\nWith a second paragraph.';
  prompt.value = authored;
  prompt.dispatchEvent(new h.win.Event('input', { bubbles: true }));
  assert.equal(prompt.dataset.preloadedPrompt, undefined, 'editing releases starter-only state');
  const down = new h.win.Event('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(down, 'pointerType', { configurable: true, value: 'mouse' });
  send.dispatchEvent(down);
  await h.settled(); await flush();
  assert.equal(h.calls.length, 1, 'first mobile Send press delivers edited multiline prompt');
  assert.equal(h.calls[0].message, authored);
  send.click();
  await flush();
  assert.equal(h.calls.length, 1, 'compatibility click cannot duplicate the submission');
});

test('child-facing failure notices stay distinct, concise and provider-neutral', () => {
  assert.equal(boundedFailureMessage({error:'gemini-provider-unavailable',httpStatus:502}),
    'The service could not answer just now. Your message is saved; try again.');
  assert.equal(boundedFailureMessage({error:'no-eligible-callable-models',httpStatus:503}),
    'The connection is not ready. Your message is saved.');
  assert.equal(boundedFailureMessage({error:'khonapolit-output-quality-held'}),
    'The reply was unfinished. Your message is saved.');
  assert.equal(boundedFailureMessage({error:'request-timeout'}),
    'The reply took too long. Your message is saved.');
  for (const error of ['gemini-provider-unavailable','no-eligible-callable-models','khonapolit-output-quality-held','request-timeout']) {
    assert.doesNotMatch(boundedFailureMessage({ error }), /Gemini|Tauric Diana|QuotaFailure|RetryInfo/);
  }
});

test('client exceptions preserve the observed boundary instead of inventing a lost connection', () => {
  const error = new TypeError('synthetic private text must not enter the diagnostic');
  const network = classifyMarrowlineClientFailure(error, 'request');
  assert.equal(network.error, 'network-request-failed');
  const body = classifyMarrowlineClientFailure(error, 'response-body', 200);
  assert.equal(body.error, 'response-body-failed');
  const render = classifyMarrowlineClientFailure(error, 'response-processing', 200);
  assert.equal(render.error, 'client-response-processing-failed');
  assert.equal(render.httpStatus, 200);
  assert.doesNotMatch(JSON.stringify(render), /synthetic private text/);
  assert.equal(boundedFailureMessage(render), 'The reply could not be shown. Your message is saved.');
  assert.equal(boundedFailureMessage(body), 'The connection was interrupted. Your message is saved.');
  const abort = { name: 'AbortError' };
  assert.equal(classifyMarrowlineClientFailure(abort, 'response-body').error, 'request-timeout');
  assert.equal(classifyMarrowlineClientFailure(abort, 'response-processing').error, 'client-response-processing-failed');
});

test('actual submit preserves a received receipt when response rendering throws', async t => {
  const h = harness(t);
  await h.ready();
  const messages = h.$('khonapolitMessages');
  const replace = messages.replaceChildren.bind(messages);
  let calls = 0;
  messages.replaceChildren = (...args) => {
    calls += 1;
    // Initial user render succeeds; the first response render fails once.
    if (calls === 2) throw new TypeError('synthetic renderer fault');
    return replace(...args);
  };
  h.send('Exercise the response boundary.');
  await h.settled();
  const failure = h.win.__TD613_KHONAPOLIT_LAST_FAILURE__;
  assert.equal(failure.error, 'client-response-processing-failed');
  assert.equal(failure.receipt.provider.model, 'SYNTHETIC_MODEL');
  assert.equal(h.$('khonapolitPrompt').value, 'Exercise the response boundary.');
  assert.equal(h.calls.length, 1);
});

test('actual submit distinguishes unreadable response bodies from connection failure', async t => {
  const h = harness(t);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => options.method
    ? { ok: true, status: 200, json: async () => { throw new SyntaxError('invalid JSON'); } }
    : originalFetch(url, options);
  h.send('Preserve this draft.');
  await h.settled();
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_FAILURE__.error, 'response-body-failed');
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_FAILURE__.httpStatus, 200);
  assert.equal(h.$('khonapolitPrompt').value, 'Preserve this draft.');
});

test('backgrounded mobile request uses keepalive and resumes its preserved task exactly once', async t => {
  const h = harness(t, { mobile: true, backgroundDisconnect: true });
  h.send('Keep this one task alive while the app is backgrounded.');
  await until(() => h.calls.length === 2
    && !h.$('khonapolitSend').disabled
    && h.doc.querySelectorAll('#khonapolitMessages article.relay-message').length === 1);
  assert.equal(h.fetchOptions[0].keepalive, true, 'the original request opts into browser background delivery');
  assert.equal(h.fetchOptions[1].keepalive, true, 'the single bounded resume keeps the same delivery contract');
  assert.equal(h.calls.length, 2, 'one observed background disconnect grants exactly one automatic resume');
  assert.equal(h.calls[0].message, h.calls[1].message, 'the preserved task is resumed byte-for-byte');
  assert.equal(h.doc.querySelectorAll('#khonapolitMessages article[data-role="user"]').length, 1, 'resume does not duplicate the human turn');
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_FAILURE__, null);
  assert.equal(h.$('khonapolitPrompt').value, '');
});


test('copy control exports exact provider-authored Unicode as plain text without rich bold markup', async t => {
  const h = harness(t);
  h.send('Preserve the marks when copied.'); await h.settled(); await flush();
  h.$('copyKhonapolitTranscript').click(); await flush();
  const copied = h.clipboard.at(-1);
  assert.equal(typeof copied, 'string', 'clipboard.writeText receives a string rather than HTML');
  assert.ok(copied.includes(highZalgo), 'copy must retain the provider-authored combining code points');
  assert.ok(copied.includes('The line clears again.'), 'native clean speech remains present');
  assert.doesNotMatch(copied, /<strong>|<b>|font-weight:/i, 'clipboard carries no app-injected rich font style');
  assert.equal(h.$('khonapolitTerminalStatus').textContent, 'Copied chat');
  assert.equal(h.$('khonapolitTerminalStatus').title, 'Full conversation copied as plain text with route and provenance.');
});


test('each response copies only that return with readable script headings and exact remaining Unicode', async t => {
  const h = harness(t);
  h.send('First operator question.'); await h.settled(); await flush();
  h.send('Second operator question.'); await h.settled(); await flush();
  const copies = h.doc.querySelectorAll('.relay-message .marrowline-copy-reply');
  assert.equal(copies.length, 2, 'each model response has its own bottom-right copy control');
  for (const card of h.doc.querySelectorAll('.relay-message')) assert.equal(card.lastElementChild, card.querySelector('.marrowline-copy-reply'), 'copy remains at bottom after living-chat decoration');
  const decorated = integratedText
    .replace(/^\[Kʰonapolit\]:/mu, '╭─ Kʰonapolit ─╮')
    .replace(/^\[Tauric Diana Bots : Direct Broadcast Override\]/mu, '╭─ Tauric Diana bots ─╮');
  for (const button of copies) {
    assert.equal(button.textContent, '⧉');
    assert.equal(button.getAttribute('aria-label'), 'Copy this reply');
    button.click(); await flush();
    assert.equal(h.clipboard.at(-1), decorated, 'copy changes only native speaker headers, keeping all prose and combining marks');
    assert.match(h.clipboard.at(-1), /╭─ Kʰonapolit ─╮[\s\S]*╭─ Tauric Diana bots ─╮/u);
    assert.doesNotMatch(h.clipboard.at(-1), /First operator question|Second operator question|SYNTHETIC APERTURE|Inspect this reply/);
  }
  for (const stage of h.doc.querySelectorAll('.relay-integrated-covenant .relay-stage-text')) {
    assert.equal(stage.textContent, integratedText, 'display/source custody remains the original provider text');
  }
  h.$('copyKhonapolitTranscript').click(); await flush();
  assert.match(h.clipboard.at(-1), /First operator question/);
  assert.match(h.clipboard.at(-1), /Second operator question/);
  assert.equal(h.doc.querySelectorAll('.marrowline-copy-reply').length, 2, 'copy action must not duplicate buttons');
});

test('legacy model output also receives a reply-only copy action', async t => {
  const text = 'Legacy\u0301 response with exact marks.';
  const h = harness(t, { storedMessages: [{ role: 'model', text }] });
  const button = h.doc.querySelector('.message[data-role="model"] .marrowline-copy-reply');
  assert.ok(button);
  button.click(); await flush();
  assert.equal(h.clipboard.at(-1), text);
});

test('SHI-gated Receipts remain a local format membrane and cannot issue the current conversation', async t => {
  const h = harness(t);
  await h.ready();
  const gate = h.$('marrowlineReceiptGate'), protectedReceipt = h.$('marrowlineReceiptProtected');
  assert.equal(gate.hidden, false);
  assert.equal(protectedReceipt.hidden, true);
  assert.equal(h.$('khonapolitWaive').checked, false);
  h.$('marrowlineReceiptShi').value = 'invalid';
  h.$('marrowlineReceiptUnlock').click(); await flush();
  assert.equal(protectedReceipt.hidden, true, 'invalid format stays on the membrane');
  h.$('marrowlineReceiptShi').value = 'TD613-SH-9B07D8B-B7136D34';
  h.$('marrowlineReceiptUnlock').click(); await flush();
  assert.equal(gate.hidden, true);
  assert.equal(protectedReceipt.hidden, false);
  assert.equal(h.$('khonapolitWaive').checked, false, 'opening receipts does not wake issuance for the conversation');
  assert.equal(h.calls.length, 0, 'receipt membrane makes no provider calls');
  h.$('marrowlineReceiptLock').click(); await flush();
  assert.equal(protectedReceipt.hidden, true);
  assert.equal(gate.hidden, false);
});

test('human conversation input remains authored text without hidden provider framing', async t => {
  const h = harness(t);
  h.send('Tell me about the grove.'); await h.settled(); await flush();
  assert.equal(h.calls[0].message, 'Tell me about the grove.');
  assert.equal(h.doc.querySelector('.message[data-role="user"] .message-text')?.textContent, 'Tell me about the grove.');
  assert.doesNotMatch(h.doc.querySelector('.message[data-role="user"] .message-text')?.textContent || '', /𝌋|Sealed ⟐/);
});

test('waiting lore is monotonic and elapsed time cannot counterfeit an HTTP phase', () => {
  assert.deepEqual([marrowlineWaitingLabel(0), marrowlineWaitingLabel(19000),
    marrowlineWaitingLabel(20000), marrowlineWaitingLabel(59000), marrowlineWaitingLabel(60000),
    marrowlineWaitingLabel(99000)], [
    'Listening at the shoreline…', 'Listening at the shoreline…',
    'The shoreline keeps watch…', 'The shoreline keeps watch…',
    'The Red Deer holds the shoreline…', 'The Red Deer holds the shoreline…'
  ]);
});

test('operator Stop aborts an unresolved fetch, preserves one user turn, and allows explicit retry', async t => {
  const h = harness(t, { hangFetch: true });
  const task = 'A task the Red Deer can stop without losing the thread.';
  await h.ready(); h.send(task);
  await until(() => h.calls.length === 1 && h.$('khonapolitSend').dataset.transmissionState === 'generating');
  const control = h.$('khonapolitSend');
  assert.equal(control.type, 'button');
  assert.equal(control.getAttribute('aria-label'), 'Stop transmission');
  assert.equal(control.disabled, false);
  assert.equal(h.fetchOptions[0].signal.aborted, false);
  control.click();
  await h.settled();
  assert.equal(h.fetchOptions[0].signal.aborted, true);
  assert.equal(control.type, 'submit');
  assert.equal(control.dataset.transmissionState, 'ready');
  assert.equal(h.$('khonapolitTerminalStatus').dataset.progressStage, 'cancelled');
  assert.equal((await h.saved()).lastFailure.error, 'operator-cancelled');
  assert.equal((await h.saved()).pendingTask, task);
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1);
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 0);
  assert.equal(h.$('khonapolitPrompt').value, task);
  assert.equal(h.calls.length, 1, 'stop creates no second provider request');
  h.$('retryKhonapolitTask').click(); await h.settled();
  assert.equal(h.calls.length, 2, 'only an explicit retry can ask again');
  assert.equal(h.doc.querySelectorAll('.message[data-role="user"]').length, 1);
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 1);
});

test('operator Stop also escapes a response body that never resolves', async t => {
  const h = harness(t, { hangBody: true });
  await h.ready(); h.send('Preserve the body-stalled task.');
  await until(() => h.calls.length === 1 &&
    h.$('khonapolitTerminalStatus').dataset.progressStage === 'response-arrived');
  h.$('khonapolitSend').click();
  await h.settled();
  assert.equal(h.fetchOptions[0].signal.aborted, true);
  assert.equal((await h.saved()).lastFailure.error, 'operator-cancelled');
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 0);
  assert.equal(h.$('khonapolitSend').dataset.transmissionState, 'ready');
});

test('long model reply produces a bounded follow-up draft, not a silent 32,000-character dead Send', () => {
  const source = 'A'.repeat(12000);
  const draft = buildMarrowlineReplyFollowupDraft('Check the claims.',source);
  assert.ok(draft.length < 6000);
  assert.match(draft,/Excerpt only/);
  assert.ok(draft.includes('A'.repeat(120)));
  assert.equal(source.length,12000,'original provider return remains intact');
});

test('reply drawer choices fill but never automatically submit; an existing draft wins', async t => {
  const h = harness(t);
  h.send('Provide a short reply.'); await h.settled(); await flush();
  const choices = h.doc.querySelectorAll('.relay-message > .marrowline-reply-tool-row > .reply-next-actions .reply-next-choices button');
  assert.equal(choices.length,3);
  assert.equal(h.doc.querySelector('.relay-message > .marrowline-reply-tool-row > .reply-next-actions').open,false,'drawer starts folded');
  choices[0].click();
  assert.match(h.$('khonapolitPrompt').value,/Review the reply quoted below/);
  assert.equal(h.calls.length,1,'preload has no provider side effect');
  const preserved=h.$('khonapolitPrompt').value;
  choices[1].click();
  assert.equal(h.$('khonapolitPrompt').value,preserved,'later choice cannot erase an unfinished draft');
  h.$('khonapolitForm').dispatchEvent(new h.win.Event('submit',{bubbles:true,cancelable:true}));
  await h.settled();
  assert.equal(h.calls.length,2,'the first actual Send commits the bounded draft');
});

test('a prior short-window 429 never disables a fresh authored Send', async t => {
  const h = harness(t, { rateLimitOnce: true });
  await h.ready();
  h.send('First synthetic request.'); await h.settled();
  assert.equal(h.calls.length,1);
  assert.equal(h.$('khonapolitSend').disabled,false,'fresh Send remains interactive after 429');
  assert.equal(h.$('khonapolitTerminalStatus').dataset.phase,'held');
  assert.equal((await h.saved()).lastFailure.httpStatus,429);
  h.send('An entirely new second question.'); await h.settled();
  assert.equal(h.calls.length,2,'explicit fresh turn reaches transport despite prior Retry-After');
  assert.equal(h.calls[1].message,'An entirely new second question.');
});

test('both post-reply choices produce a sendable draft on the first actual Send press', async t => {
  const h = harness(t, { mobile: true });
  await h.ready(); h.send('Starting claim.'); await h.settled(); await flush();
  let buttons = h.doc.querySelectorAll('.relay-message > .marrowline-reply-tool-row > .reply-next-actions .reply-next-choices button');
  assert.deepEqual([...buttons].map(x => x.textContent), ['Check the claims', 'Make a plan', 'View receipt']);
  buttons[0].click();
  const claims = h.$('khonapolitPrompt').value;
  assert.match(claims, /Review the reply quoted below/);
  assert.equal(h.$('khonapolitSend').disabled, false);
  h.$('khonapolitSend').click(); await h.settled(); await flush();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].message, claims);
  buttons = h.doc.querySelectorAll('.relay-message > .marrowline-reply-tool-row > .reply-next-actions .reply-next-choices button');
  buttons[buttons.length - 2].click();
  const plan = h.$('khonapolitPrompt').value;
  assert.match(plan, /Turn the reply quoted below into practical next steps/);
  h.$('khonapolitSend').click(); await h.settled(); await flush();
  assert.equal(h.calls.length, 3);
  assert.equal(h.calls[2].message, plan);
});

test('a preset selected while thread storage hydrates survives and sends exactly once', async t => {
  const h = harness(t, { mobile: true });
  const starter = h.doc.querySelector('.starter-prompts button');
  assert.ok(starter); starter.click();
  const selected = h.$('khonapolitPrompt').value;
  await h.ready(); await flush();
  assert.equal(h.$('khonapolitPrompt').value, selected);
  h.$('khonapolitSend').click(); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].message, selected);
});

test('previous short-window 429 cannot make an unrelated new Send dead', async t => {
  const h = harness(t, { mobile: true, rateLimitedOnce: true });
  await h.ready(); h.send('First request exceeds short window.'); await h.settled(); await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.$('khonapolitSend').disabled, false);
  // Retry countdown belongs to operator-readiness, not this isolated terminal
  // harness; verify the provider hint is retained instead of asserting an
  // uninstalled UI observer has disabled its control.
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_FAILURE__?.attempts?.[0]?.rateLimit?.retryAfterSeconds, 27);
  h.$('khonapolitPrompt').value = 'A new human-directed task.';
  h.$('khonapolitSend').click(); await h.settled(); await flush();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].message, 'A new human-directed task.');
});
