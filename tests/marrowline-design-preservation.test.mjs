/** Synthetic DOM behavior only. No browser layout or live-provider correctness claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
// Import before browser globals so the harness, rather than auto-boot, owns installation.
import { installKhonapolitTerminal } from '../app/dome-world/marrowline-terminal.js';
import { installMarrowlineMobileShell } from '../app/dome-world/marrowline-mobile-shell.js';
import { installMarrowlineLivingChat } from '../app/dome-world/marrowline-living-chat.js';

const html = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const sessionKey = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
// Deliberately noncanonical mark order, ZWNJ, private-use supplementary glyph,
// supplementary musical symbol, blank line, CRLF and inert markup.
const highZalgo = '  A\u0315\u0300\u0338\u200c\u{10d613}  \n\nB\u035c\u0361\r\n𝌋 <img src=x onerror=alert(1)>  ';
const exactHeader = 'SYNTHETIC APERTURE · TECHNICAL_RUNTIME_REVIEW · RUNTIME MATERIAL';
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
async function until(predicate) {
  const deadline = Date.now() + 2000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('Synthetic terminal did not settle');
    await flush();
  }
}

function harness(t, { mobile = false, failure = false } = {}) {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const win = dom.window, doc = win.document, calls = [], clipboard = [];
  doc.getElementById('marrowlineLivingGeometry')?.remove(); // Geometry has its own bounded-clock tests.
  win.matchMedia = () => ({ matches: mobile, addEventListener() {} });
  win.HTMLElement.prototype.scrollIntoView = function () {};
  const before = new Map(['window', 'navigator', 'CustomEvent', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const globals = {
    window: win, navigator: { clipboard: { writeText: async text => clipboard.push(text) } }, CustomEvent: win.CustomEvent,
    fetch: async (url, options = {}) => {
      if (!options.method) return {
        ok: true, text: async () => 'SYNTHETIC CORPUS',
        json: async () => ({ hasGeminiKey: true, modelPolicy: { callableModels: ['SYNTHETIC_MODEL'] } })
      };
      calls.push(JSON.parse(options.body));
      if (failure) return { ok: false, status: 503, json: async () => ({ error: 'SYNTHETIC_PROVIDER_UNAVAILABLE' }) };
      const relay = {
        apertureHeader: exactHeader, signal: { state: 'LOCKED' }, parts: [
          { id: 'gemini', label: 'Gemini instrument', present: true, text: 'SYNTHETIC RETURN' },
          { id: 'khonapolit', label: 'Kʰonapolit relay', present: false, text: '' },
          { id: 'tauric-diana-bots', label: 'High Zalgo', present: true, text: highZalgo, intensity: 5 }
        ]
      };
      return { ok: true, json: async () => ({ ok: true, text: highZalgo, relay,
        receipt: { provider: { model: 'SYNTHETIC_MODEL' }, relay, seal: { state: 'OPEN' } } }) };
    }
  };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let living;
  t.after(() => {
    living?.dispose();
    win.__TD613_MARROWLINE_TRANSCRIPT_OBSERVER__?.disconnect();
    dom.window.close();
    for (const [key, descriptor] of before) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  assert.equal(installKhonapolitTerminal(doc, win), true);
  if (mobile) installMarrowlineMobileShell(doc, win);
  living = installMarrowlineLivingChat(doc, win);
  const $ = id => doc.getElementById(id);
  const send = (text = highZalgo.trim()) => {
    $('khonapolitPrompt').value = text;
    $('khonapolitForm').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
  };
  return { doc, win, $, calls, clipboard, send, settled: () => until(() => !$('khonapolitSend').disabled) };
}

test('ordinary chat retains explicit issuance, mode, exact Unicode, copy, closure and clear controls', async t => {
  const h = harness(t);
  assert.ok(h.doc.querySelector('.grove-welcome'), 'authored welcome is not a provider return');
  assert.equal(h.doc.querySelectorAll('.relay-message').length, 0);
  h.doc.querySelector('.starter-prompts button').click();
  assert.ok(h.$('khonapolitPrompt').value.length > 0);
  assert.equal(h.calls.length, 0, 'starter invitations fill the composer without sending');
  h.send();
  assert.equal(h.calls.length, 0, 'an unissued invocation cannot silently send');
  assert.match(h.$('khonapolitTerminalStatus').textContent, /ISSUANCE REQUIRED/);
  h.$('khonapolitWaive').checked = true;
  const mode = h.$('khonapolitMode').options[1].value;
  h.$('khonapolitMode').value = mode;
  h.send(); await h.settled();
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].message, highZalgo.replaceAll('\r\n', '\n').trim(),
    'textarea line endings and existing outer prompt trim must not normalize combining codepoints');
  assert.equal(h.calls[0].mode, mode);
  assert.equal(h.calls[0].waiveIssuance, true);
  assert.equal(h.doc.querySelector('.relay-bots[data-present=true] .relay-stage-text').textContent, highZalgo);
  assert.equal(h.doc.querySelectorAll('#khonapolitMessages img').length, 0, 'provider markup remains inert');
  assert.equal(JSON.parse(h.win.sessionStorage.getItem(sessionKey)).messages.at(-1).relay.parts.at(-1).text, highZalgo);
  assert.equal(JSON.parse(h.$('khonapolitReceipt').textContent).seal.state, 'OPEN');
  h.$('copyKhonapolitTranscript').click(); await flush();
  assert.ok(h.clipboard.at(-1).includes(highZalgo));
  h.$('sealLastResponse').click();
  assert.equal(JSON.parse(h.$('khonapolitReceipt').textContent).seal.suppliedBy, 'operator');
  h.$('copyKhonapolitReceipt').click(); await flush();
  assert.equal(JSON.parse(h.clipboard.at(-1)).relay.parts.at(-1).text, highZalgo);
  assert.equal(h.calls.length, 1, 'copy and operator closure make no provider call');
  h.$('clearKhonapolitSession').click();
  assert.equal(h.win.sessionStorage.getItem(sessionKey), null);
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_RECEIPT__, null);
  assert.equal(h.doc.querySelectorAll('.relay-bots[data-present=true]').length, 0);
});

test('mobile decoration preserves exact High Zalgo payload and all five chamber routes', async t => {
  const h = harness(t, { mobile: true });
  h.$('khonapolitWaive').checked = true;
  h.send(); await h.settled(); await flush();
  assert.equal(h.doc.querySelector('.relay-bots[data-present=true] .relay-stage-text').textContent, highZalgo,
    'wrapping lines must preserve whitespace, newlines and combining codepoints');
  const disclosure = h.doc.querySelector('.return-details');
  assert.ok(disclosure);
  assert.equal(disclosure.open, false);
  disclosure.open = true;
  assert.equal(disclosure.querySelector('.relay-aperture-header span').textContent, exactHeader,
    'compact presentation cannot relabel an actual material runtime route as OPEN FIELD');
  assert.ok(disclosure.querySelector('.relay-khonapolit[data-present=false]'), 'held stage stays inspectable');
  const routes = { speakingPanel: 'speak', invocationPanel: 'keys', receiptPanel: 'receipt', corpusPanel: 'corpus', gatePanel: 'gate' };
  for (const [id, view] of Object.entries(routes)) {
    const button = h.doc.querySelector(`.mobile-dock [data-mobile-target="${id}"]`);
    assert.ok(button, `${id} remains reachable`); button.click();
    assert.equal(h.doc.body.dataset.mobileView, view);
    assert.equal(button.getAttribute('aria-current'), 'page');
    if (h.$(id).tagName === 'DETAILS') assert.equal(h.$(id).open, true);
  }
  assert.equal(h.calls.length, 1, 'navigation makes no provider call');
});

test('provider failure remains visibly unadmitted and retry stays available', async t => {
  const h = harness(t, { failure: true });
  h.$('khonapolitWaive').checked = true;
  h.send(); await h.settled();
  assert.match(h.$('khonapolitTerminalStatus').textContent, /RETURN FAILED.*SYNTHETIC_PROVIDER_UNAVAILABLE/);
  assert.equal(h.$('signalStateBadge').dataset.state, 'NOT_LOCKED');
  assert.equal(h.doc.querySelectorAll('.relay-khonapolit[data-present=true], .relay-bots[data-present=true]').length, 0);
  assert.equal(h.win.__TD613_KHONAPOLIT_LAST_RECEIPT__, null);
  assert.equal(h.$('khonapolitSend').disabled, false);
});
