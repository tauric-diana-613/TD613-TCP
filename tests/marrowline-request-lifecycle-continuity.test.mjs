/**
 * Offline deterministic lifecycle, transport, non-duplication, and Safe Harbor
 * encryption/retention qualification for Marrowline Episode Continuity v1.
 *
 * Scope boundary: zero live paid provider calls (`0` upstream Gemini calls to Google).
 * Simulated JSDOM / stream / HTTP lifecycle witnesses establish protocol, state-machine,
 * cryptographic, and UI recovery behavior; they are NOT physical-device hardware witnesses.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

import apiKhonapolitHandler, {
  GEMINI_4_SINGLE_SEAT_INITIAL_TIMEOUT_MS,
  GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS,
  GEMINI_4_SINGLE_SEAT_UNARY_TIMEOUT_MS
} from '../api/khonapolit.js';
import {
  MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
} from '../app/dome-world/marrowline-historical-grove.js';
import {
  MARROWLINE_PROMOTED_DEFAULT_TRIAL_ID
} from '../app/dome-world/marrowline-grove-trial.js';
import {
  MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID
} from '../app/dome-world/marrowline-historical-grove.js';
import {
  MARROWLINE_CONTINUITY_NEON_ENV,
  MARROWLINE_CONTINUITY_REDIS_TOKEN_ENV,
  MARROWLINE_CONTINUITY_REDIS_URL_ENV,
  MARROWLINE_EPISODE_CLAIM_SCHEMA,
  MARROWLINE_EPISODE_CONTINUITY_VERSION,
  MARROWLINE_EPISODE_HARD_TTL_MS,
  MARROWLINE_EPISODE_LEASE_MS,
  MARROWLINE_EPISODE_STREAM_CONTENT_TYPE,
  MARROWLINE_EPISODE_STREAM_SCHEMA,
  buildEpisodeAad,
  createMarrowlineEpisodeStore,
  deriveEpisodeCapabilityFromRoot,
  episodeCancelHandler,
  episodeClaimHandler,
  episodeConsumeHandler,
  openEpisodeEnvelopeNode,
  registerVercelWaitUntil,
  runWithMarrowlineEpisodeContinuity,
  sealEpisodeEnvelope
} from '../server/marrowline-episode-continuity.js';
import {
  MARROWLINE_EPISODE_CANCEL_ENDPOINT,
  MARROWLINE_EPISODE_CLAIM_ENDPOINT,
  MARROWLINE_EPISODE_CONSUME_ENDPOINT,
  MarrowlineStreamInterruptedError,
  createMarrowlineEpisode,
  decryptMarrowlineEpisodeEnvelope,
  pollMarrowlineEpisodeClaim,
  readMarrowlineTransportResponse
} from '../app/dome-world/marrowline-episode-continuity-client.js';
import {
  classifyMarrowlineClientFailure,
  installKhonapolitTerminal
} from '../app/dome-world/marrowline-terminal.js';
import {
  installMarrowlineOperatorReadiness
} from '../app/dome-world/marrowline-operator-readiness.js';
import {
  clearGeminiModelState
} from '../server/gemini-model-policy.js';

const html = fs.readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');

const AUTHORED_TRANSMISSION = [
  'Kʰonapolit',
  'At the shoreline through Khona\u200Clit-po (\u{10D613} · 𝌋\u200C⟐), the lantern survives the tab switch without doubling its toll.',
  '',
  'Tauric Diana bots',
  'T̴̵H̶E̷ ̸S̵O̴C̷K̸E̵T̴ ̷S̵L̶E̷P̸T̵; ̴T̵H̶E̷ ̸G̵R̴O̷V̸E̵ ̴F̶I̷N̸I̵S̴H̶E̷D̸ ̵T̴H̶E̷ ̸V̵E̴R̷S̸E̵.'
].join('\n');

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

async function waitUntilCond(predicate, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) {
      throw new Error('Lifecycle test harness timed out waiting for terminal settlement');
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function makeStreamingMockRes({ breakAfterChunks = Infinity } = {}) {
  const chunks = [];
  const headers = {};
  const res = {
    statusCode: 200,
    writableEnded: false,
    destroyed: false,
    headers,
    chunks,
    setHeader(name, value) {
      headers[String(name).toLowerCase()] = String(value);
    },
    getHeader(name) {
      return headers[String(name).toLowerCase()];
    },
    write(chunk) {
      if (this.destroyed || this.writableEnded) {
        throw new Error('write-after-close');
      }
      chunks.push(String(chunk));
      if (chunks.length >= breakAfterChunks) {
        this.destroyed = true;
      }
      return !this.destroyed;
    },
    end(chunk = '') {
      if (this.destroyed || this.writableEnded) return;
      if (chunk) chunks.push(String(chunk));
      this.writableEnded = true;
    }
  };
  return res;
}

function makeJsonMockRes() {
  const headers = {};
  return {
    statusCode: 200,
    writableEnded: false,
    destroyed: false,
    headers,
    bodyText: '',
    json: null,
    setHeader(name, value) {
      headers[String(name).toLowerCase()] = String(value);
    },
    getHeader(name) {
      return headers[String(name).toLowerCase()];
    },
    end(chunk = '') {
      this.writableEnded = true;
      this.bodyText = String(chunk || '');
      this.json = this.bodyText ? JSON.parse(this.bodyText) : null;
    }
  };
}

function makeSseResponseFromText(text, { finishReason = 'STOP', modelVersion = 'gemini-3.1-pro-preview' } = {}) {
  const encoder = new TextEncoder();
  const midpoint = Math.floor(text.length / 2);
  const partA = text.slice(0, midpoint);
  const partB = text.slice(midpoint);
  const sseLines = [
    `data: ${JSON.stringify({
      candidates: [{ content: { role: 'model', parts: [{ text: partA }] } }],
      modelVersion
    })}\n\n`,
    `data: ${JSON.stringify({
      candidates: [{ content: { role: 'model', parts: [{ text: partB }] }, finishReason }],
      usageMetadata: { promptTokenCount: 180, candidatesTokenCount: 95, totalTokenCount: 410 },
      modelVersion
    })}\n\n`
  ];
  let idx = 0;
  const body = new ReadableStream({
    pull(controller) {
      if (idx < sseLines.length) {
        controller.enqueue(encoder.encode(sseLines[idx]));
        idx += 1;
      } else {
        controller.close();
      }
    }
  }, { highWaterMark: 0 });
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' }
  });
}

function createInMemoryEpisodeHarness({
  clock = () => Date.now(),
  heartbeatMs = 30,
  upstreamHandler = null
} = {}) {
  const store = createMarrowlineEpisodeStore({ clock });
  const controllers = new Map();
  const waitUntilPromises = [];
  let upstreamCalls = 0;

  const waitUntil = (promise) => {
    waitUntilPromises.push(promise);
  };

  const serverFetch = async (url, options = {}) => {
    const parsedUrl = new URL(String(url), 'https://td613.com');
    const operation = parsedUrl.searchParams.get('operation');
    const method = String(options.method || 'GET').toUpperCase();
    const rawHeaders = options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : { ...(options.headers || {}) };
    const reqHeaders = {
      host: 'td613.com',
      origin: 'https://td613.com',
      'sec-fetch-site': 'same-origin',
      ...rawHeaders
    };

    if (parsedUrl.pathname === '/giving/history/release-source.json') {
      return new Response(JSON.stringify({ source_packet_commit: 'b'.repeat(40) }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (parsedUrl.pathname === '/app/safe-harbor/corpus/binding_event_text.txt') {
      return new Response('SYNTHETIC BINDING RITUAL', { status: 200 });
    }
    if (parsedUrl.pathname === '/api/dome-world/khonapolit' && method === 'GET' && !operation) {
      return new Response(JSON.stringify({
        ok: true,
        hasGeminiKey: true,
        hasProviderKey: true,
        modelPolicy: { callableModels: ['models/gemini-3.1-pro-preview'] },
        aperture: { version: 'v3.2', taskIntent: { primary_route: 'OPEN_FIELD_SPECULATIVE_SYNTHESIS' } }
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    const req = {
      method,
      url: `${parsedUrl.pathname}${parsedUrl.search}`,
      query: Object.fromEntries(parsedUrl.searchParams.entries()),
      headers: reqHeaders,
      body: options.body || '',
      socket: { remoteAddress: '203.0.113.10' }
    };

    if (operation === 'episode-claim') {
      const res = makeJsonMockRes();
      await episodeClaimHandler(req, res, { store });
      return new Response(res.bodyText, { status: res.statusCode, headers: res.headers });
    }
    if (operation === 'episode-consume') {
      const res = makeJsonMockRes();
      await episodeConsumeHandler(req, res, { store });
      return new Response(res.bodyText, { status: res.statusCode, headers: res.headers });
    }
    if (operation === 'episode-cancel') {
      const res = makeJsonMockRes();
      await episodeCancelHandler(req, res, { store, controllers });
      return new Response(res.bodyText, { status: res.statusCode, headers: res.headers });
    }

    // Streaming POST /api/dome-world/khonapolit
    const encoder = new TextEncoder();
    let streamController = null;
    const readable = new ReadableStream({
      start(c) {
        streamController = c;
      }
    });
    const streamHeaders = {};
    const streamRes = {
      statusCode: 200,
      writableEnded: false,
      destroyed: false,
      setHeader(k, v) { streamHeaders[String(k).toLowerCase()] = String(v); },
      getHeader(k) { return streamHeaders[String(k).toLowerCase()]; },
      write(chunk) {
        if (this.destroyed || this.writableEnded) return false;
        streamController.enqueue(encoder.encode(String(chunk)));
        return true;
      },
      end(chunk = '') {
        if (this.destroyed || this.writableEnded) return;
        if (chunk) streamController.enqueue(encoder.encode(String(chunk)));
        this.writableEnded = true;
        try { streamController.close(); } catch {}
      }
    };

    const runPromise = runWithMarrowlineEpisodeContinuity(
      req,
      streamRes,
      async (epReq, epRes) => {
        upstreamCalls += 1;
        if (upstreamHandler) {
          return upstreamHandler(epReq, epRes, upstreamCalls);
        }
        epRes.statusCode = 200;
        epRes.setHeader('Content-Type', 'application/json; charset=utf-8');
        const relay = {
          schema: 'td613.khonapolit.integrated-covenant-relay/v3-adversarial-attractor',
          apertureHeader: 'TD613 APERTURE v3.2 · OPEN_FIELD_SPECULATIVE_SYNTHESIS · RUNTIME BACKGROUND',
          signal: { state: 'LOCKED', downstreamAdmitted: true },
          admission: { admissible: true, reasons: [], combiningMarkCount: 28, maxRun: 2, duplicate: false },
          parts: [{
            id: 'khonapolit',
            label: 'Kʰonapolit ∴ Tauric Diana bots',
            present: true,
            text: AUTHORED_TRANSMISSION,
            integrated: true,
            providerNative: true,
            voices: ['Kʰonapolit', 'Tauric Diana bots'],
            flourishMode: 'forensic-to-eruption'
          }],
          highZalgo: { applied: false, providerGenerated: true, source: 'provider-native', combiningMarkCount: 28, maxRun: 2, runCount: 16 }
        };
        epRes.end(JSON.stringify({
          ok: true,
          text: AUTHORED_TRANSMISSION,
          relay,
          receipt: {
            provider: {
              model: 'models/gemini-3.1-pro-preview',
              attempts: [{ model: 'models/gemini-3.1-pro-preview', status: 200, streamed: true }],
              completion: { complete: true, finishReason: 'STOP' }
            },
            emergence: {
              classification: 'COVENANT_CONJUNCTION',
              signals: { covenantKeyIntegrity: { status: 'intact' } }
            },
            storage: { serverConversationStorage: false, browserSessionStorage: 'operator-controlled' },
            relay,
            seal: { state: 'OPEN' }
          }
        }));
      },
      { store, waitUntil, heartbeatMs, clock, controllers }
    );
    waitUntilPromises.push(runPromise);

    // Let synchronous registration + initial accepted frame flush before returning Response
    await flush();
    return new Response(readable, {
      status: streamRes.statusCode,
      headers: {
        'content-type': streamHeaders['content-type'] || MARROWLINE_EPISODE_STREAM_CONTENT_TYPE,
        ...(streamHeaders['x-td613-episode-id'] ? { 'x-td613-episode-id': streamHeaders['x-td613-episode-id'] } : {})
      }
    });
  };

  return {
    store,
    controllers,
    waitUntilPromises,
    serverFetch,
    getUpstreamCalls: () => upstreamCalls,
    drainBackground: async () => {
      await Promise.allSettled(waitUntilPromises);
      await flush();
    }
  };
}

function mountJSDOMMarrowline(t, {
  url = `https://td613.com/dome-world/marrowline.html?groveTrial=${MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID}`,
  fetchImpl,
  sharedLocalStorage = null
} = {}) {
  const dom = new JSDOM(html, { url });
  const win = dom.window;
  const doc = win.document;
  doc.getElementById('marrowlineLivingGeometry')?.remove();
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  win.HTMLElement.prototype.scrollIntoView = function () {};
  Object.defineProperty(win, 'crypto', { configurable: true, value: crypto.webcrypto });
  Object.defineProperty(win.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async () => {} }
  });
  if (sharedLocalStorage) {
    Object.defineProperty(win, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k) => (sharedLocalStorage.has(k) ? sharedLocalStorage.get(k) : null),
        setItem: (k, v) => { sharedLocalStorage.set(k, String(v)); },
        removeItem: (k) => { sharedLocalStorage.delete(k); }
      }
    });
  }
  win.fetch = fetchImpl;

  const savedGlobals = new Map(
    ['window', 'document', 'navigator', 'CustomEvent', 'fetch'].map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)])
  );
  Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: win });
  Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: doc });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, writable: true, value: win.navigator });
  Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, writable: true, value: win.CustomEvent });
  Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: fetchImpl });

  t.after(async () => {
    await flush();
    win.__TD613_MARROWLINE_HOLD_NOTICE_OBSERVER__?.disconnect?.();
    win.__TD613_MARROWLINE_RESPONSE_KINESIS_OBSERVER__?.disconnect?.();
    win.__TD613_MARROWLINE_HUMAN_VOCABULARY_OBSERVER__?.disconnect?.();
    win.__TD613_MARROWLINE_READINESS_OBSERVER__?.disconnect?.();
    await flush();
    dom.window.close();
    for (const [k, desc] of savedGlobals.entries()) {
      if (desc) Object.defineProperty(globalThis, k, desc);
      else delete globalThis[k];
    }
  });

  installKhonapolitTerminal(doc, win);
  installMarrowlineOperatorReadiness(doc, win);

  return {
    dom,
    win,
    doc,
    $: (id) => doc.getElementById(id),
    ready: () => win.__TD613_MARROWLINE_THREADS__.ready,
    send: (text) => {
      doc.getElementById('khonapolitPrompt').value = text;
      doc.getElementById('khonapolitForm').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
    }
  };
}

test('Source & deployment invariants: preserves 11 API files, Carbon constitution, #1799 205s completion runway, and removes keepalive from streaming POST', () => {
  assert.equal(MARROWLINE_PROMOTED_DEFAULT_TRIAL_ID, MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID);
  assert.equal(GEMINI_4_SINGLE_SEAT_INITIAL_TIMEOUT_MS, 165_000);
  assert.equal(GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS, 40_000);
  assert.equal(GEMINI_4_SINGLE_SEAT_INITIAL_TIMEOUT_MS + GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS, 205_000);
  assert.equal(GEMINI_4_SINGLE_SEAT_UNARY_TIMEOUT_MS, 205_000);
  assert.equal(MARROWLINE_EPISODE_LEASE_MS, 240_000);
  assert.equal(MARROWLINE_EPISODE_HARD_TTL_MS, 900_000);

  const terminalSource = fs.readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
  assert.doesNotMatch(terminalSource, /keepalive:\s*backgroundKeepaliveEligible/);
  assert.match(terminalSource, /keepalive:\s*false/);
  assert.match(terminalSource, /createdEpisode\?\.requestHeaders/);

  const clientSource = fs.readFileSync(new URL('../app/dome-world/marrowline-episode-continuity-client.js', import.meta.url), 'utf8');
  assert.match(clientSource, /'X-TD613-Transport-Stream':\s*'heartbeat-v1'/);
  assert.match(clientSource, /MARROWLINE_EPISODE_CLAIM_ENDPOINT = '\/api\/dome-world\/khonapolit\?operation=episode-claim'/);
  assert.match(clientSource, /MARROWLINE_EPISODE_CONSUME_ENDPOINT = '\/api\/dome-world\/khonapolit\?operation=episode-consume'/);
  assert.match(clientSource, /MARROWLINE_EPISODE_CANCEL_ENDPOINT = '\/api\/dome-world\/khonapolit\?operation=episode-cancel'/);
});

test('Desktop & mobile framed NDJSON heartbeats keep active generation alive across tab switch, window blur, and freeze/resume with 1 provider call and immediate consume deletion', async (t) => {
  let now = 1_700_000_000_000;
  let heartbeatsObservedOnWire = 0;

  const backend = createInMemoryEpisodeHarness({
    clock: () => now,
    heartbeatMs: 25,
    upstreamHandler: async (_epReq, epRes) => {
      await new Promise((resolve) => setTimeout(resolve, 90));
      now += 90;
      const relay = {
        schema: 'td613.khonapolit.integrated-covenant-relay/v3-adversarial-attractor',
        apertureHeader: 'TD613 APERTURE v3.2 · OPEN_FIELD_SPECULATIVE_SYNTHESIS · RUNTIME BACKGROUND',
        signal: { state: 'LOCKED', downstreamAdmitted: true },
        admission: { admissible: true, reasons: [], combiningMarkCount: 28, maxRun: 2, duplicate: false },
        parts: [{
          id: 'khonapolit',
          label: 'Kʰonapolit ∴ Tauric Diana bots',
          present: true,
          text: AUTHORED_TRANSMISSION,
          integrated: true,
          providerNative: true,
          voices: ['Kʰonapolit', 'Tauric Diana bots'],
          flourishMode: 'forensic-to-eruption'
        }]
      };
      epRes.statusCode = 200;
      epRes.setHeader('Content-Type', 'application/json; charset=utf-8');
      epRes.end(JSON.stringify({
        ok: true,
        text: AUTHORED_TRANSMISSION,
        relay,
        receipt: {
          provider: {
            model: 'models/gemini-3.1-pro-preview',
            attempts: [{ model: 'models/gemini-3.1-pro-preview', status: 200, streamed: true }],
            completion: { complete: true, finishReason: 'STOP' }
          },
          emergence: {
            classification: 'COVENANT_CONJUNCTION',
            signals: { covenantKeyIntegrity: { status: 'intact' } }
          },
          storage: { serverConversationStorage: false, browserSessionStorage: 'operator-controlled' },
          relay,
          seal: { state: 'OPEN' }
        }
      }));
    }
  });

  const postCalls = [];
  const consumeCalls = [];
  const wrappedFetch = async (url, options = {}) => {
    const strUrl = String(url);
    if (strUrl.includes('operation=episode-consume')) consumeCalls.push(strUrl);
    else if (String(options?.method || 'GET').toUpperCase() === 'POST' && strUrl.includes('/api/dome-world/khonapolit')) {
      postCalls.push({ url: strUrl, options });
      const rawResponse = await backend.serverFetch(url, options);
      const [branchA, branchB] = rawResponse.body.tee();
      (async () => {
        const reader = branchB.getReader();
        const dec = new TextDecoder();
        let text = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          text += dec.decode(value, { stream: true });
        }
        heartbeatsObservedOnWire = text.split('\n').filter((line) => line.includes('"type":"heartbeat"')).length;
      })();
      return new Response(branchA, { status: rawResponse.status, headers: rawResponse.headers });
    }
    return backend.serverFetch(url, options);
  };

  const ui = mountJSDOMMarrowline(t, { fetchImpl: wrappedFetch });
  await ui.ready();

  ui.send('Hold the lantern steady while I switch windows and tabs.');

  // Simulate desktop window switch (`blur`), tab switch (`visibilitychange: hidden`), `freeze`, and return (`resume`, `focus`, `visible`)
  await new Promise((resolve) => setTimeout(resolve, 25));
  ui.win.dispatchEvent(new ui.win.Event('blur'));
  Object.defineProperty(ui.doc, 'visibilityState', { configurable: true, value: 'hidden' });
  ui.doc.dispatchEvent(new ui.win.Event('visibilitychange'));
  ui.doc.dispatchEvent(new ui.win.Event('freeze'));
  await new Promise((resolve) => setTimeout(resolve, 30));
  Object.defineProperty(ui.doc, 'visibilityState', { configurable: true, value: 'visible' });
  ui.doc.dispatchEvent(new ui.win.Event('resume'));
  ui.doc.dispatchEvent(new ui.win.Event('visibilitychange'));
  ui.win.dispatchEvent(new ui.win.Event('focus'));

  await waitUntilCond(() => ui.$('khonapolitSend').dataset.transmissionState === 'ready'
    && ui.$('khonapolitTerminalStatus').dataset.phase === 'received');
  await backend.drainBackground();
  await waitUntilCond(() => consumeCalls.length === 1);

  assert.equal(backend.getUpstreamCalls(), 1, 'exactly one upstream provider call executed');
  assert.equal(postCalls.length, 1, 'zero duplicate generation POSTs dispatched');
  assert.equal(postCalls[0].options.keepalive, false);
  assert.ok(heartbeatsObservedOnWire >= 1, 'server emitted live NDJSON heartbeat frames while provider ran');
  assert.equal(ui.doc.getElementById('marrowlineTerminalHold'), null, 'zero connection-error hold banner shown');

  const renderedText = ui.doc.querySelector('#khonapolitMessages article.relay-message .relay-stage-text')?.textContent || '';
  assert.equal(renderedText, AUTHORED_TRANSMISSION, 'exact Unicode, High Zalgo, ZWNJ, and PUA preserved byte-for-byte');

  const currentThread = ui.win.__TD613_MARROWLINE_THREADS__.current();
  assert.equal(currentThread.pendingEpisode, null, 'local pendingEpisode capability wiped after commit');
  assert.equal(backend.store.size(), 0, 'server ciphertext physically deleted immediately upon episode-consume');
});

test('Mid-generation socket drop on mobile lock screen / desktop window switch recovers completed response via waitUntil + encrypted GET episode-claim with 0 duplicate calls', async (t) => {
  let now = 1_700_000_100_000;
  let releaseServerCompletion;
  const serverGate = new Promise((resolve) => { releaseServerCompletion = resolve; });

  const backend = createInMemoryEpisodeHarness({
    clock: () => now,
    heartbeatMs: 25,
    upstreamHandler: async (_epReq, epRes) => {
      await serverGate;
      const relay = {
        schema: 'td613.khonapolit.integrated-covenant-relay/v3-adversarial-attractor',
        apertureHeader: 'TD613 APERTURE v3.2 · OPEN_FIELD_SPECULATIVE_SYNTHESIS · RUNTIME BACKGROUND',
        signal: { state: 'LOCKED', downstreamAdmitted: true },
        admission: { admissible: true, reasons: [], combiningMarkCount: 28, maxRun: 2, duplicate: false },
        parts: [{
          id: 'khonapolit',
          label: 'Kʰonapolit ∴ Tauric Diana bots',
          present: true,
          text: AUTHORED_TRANSMISSION,
          integrated: true,
          providerNative: true,
          voices: ['Kʰonapolit', 'Tauric Diana bots'],
          flourishMode: 'forensic-to-eruption'
        }]
      };
      epRes.statusCode = 200;
      epRes.setHeader('Content-Type', 'application/json; charset=utf-8');
      epRes.end(JSON.stringify({
        ok: true,
        text: AUTHORED_TRANSMISSION,
        relay,
        receipt: {
          provider: {
            model: 'models/gemini-3.1-pro-preview',
            attempts: [{ model: 'models/gemini-3.1-pro-preview', status: 200, streamed: true }],
            completion: { complete: true, finishReason: 'STOP' }
          },
          emergence: {
            classification: 'COVENANT_CONJUNCTION',
            signals: { covenantKeyIntegrity: { status: 'intact' } }
          },
          storage: { serverConversationStorage: false, browserSessionStorage: 'operator-controlled' },
          relay,
          seal: { state: 'OPEN' }
        }
      }));
    }
  });

  let generationPostCount = 0;
  const claimCalls = [];
  const consumeCalls = [];
  let dropPrimaryStream = null;

  const mobileFetch = async (url, options = {}) => {
    const strUrl = String(url);
    const method = String(options?.method || 'GET').toUpperCase();
    if (strUrl.includes('operation=episode-claim')) {
      claimCalls.push({ url: strUrl, method, headers: options.headers });
      return backend.serverFetch(url, options);
    }
    if (strUrl.includes('operation=episode-consume')) {
      consumeCalls.push({ url: strUrl, options });
      return backend.serverFetch(url, options);
    }
    if (method === 'POST' && strUrl.includes('/api/dome-world/khonapolit')) {
      generationPostCount += 1;
      const upstreamRes = await backend.serverFetch(url, options);
      const upstreamReader = upstreamRes.body.getReader();
      // Wrap response body so we can sever the client TCP stream mid-flight while server continues under waitUntil!
      const severable = new ReadableStream({
        async pull(controller) {
          const race = await Promise.race([
            upstreamReader.read(),
            new Promise((_, reject) => { dropPrimaryStream = () => reject(new TypeError('WebKit background socket severed')); })
          ]);
          if (race.done) controller.close();
          else controller.enqueue(race.value);
        }
      });
      return new Response(severable, { status: upstreamRes.status, headers: upstreamRes.headers });
    }
    return backend.serverFetch(url, options);
  };

  const ui = mountJSDOMMarrowline(t, { fetchImpl: mobileFetch });
  await ui.ready();

  ui.send('Lock the phone mid-generation and recover the exact Kʰonapolit reply.');
  await waitUntilCond(() => typeof dropPrimaryStream === 'function');

  // Simulate iOS lock screen: page hides + pagehide fires + TCP stream is severed!
  Object.defineProperty(ui.doc, 'visibilityState', { configurable: true, value: 'hidden' });
  ui.doc.dispatchEvent(new ui.win.Event('visibilitychange'));
  ui.win.dispatchEvent(new ui.win.Event('pagehide'));
  dropPrimaryStream();

  // Wait for first read-only GET claim while RUNNING, then confirm polling pauses while hidden!
  await waitUntilCond(() => claimCalls.length >= 1);
  const claimsWhileHidden = claimCalls.length;
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.equal(claimCalls.length, claimsWhileHidden, 'polling pauses while document is hidden to avoid background socket churn');

  // Server finishes inside waitUntil while phone is still locked; verify encrypted-only at rest!
  now += 45_000;
  releaseServerCompletion();
  await backend.drainBackground();

  assert.equal(backend.store.size(), 1, 'sealed ciphertext awaits returning browser');
  const episodeHeaderId = new URL(claimCalls[0].url, 'https://td613.com').searchParams.get('request_id');
  const rawStored = backend.store.inspectRawForTest(episodeHeaderId);
  assert.equal(rawStored.state, 'COMPLETED');
  const serializedStoreDump = JSON.stringify(rawStored);
  assert.equal(serializedStoreDump.includes('Lock the phone mid-generation'), false, 'zero plaintext prompt in server store');
  assert.equal(serializedStoreDump.includes('Tauric Diana bots'), false, 'zero plaintext response in server store');
  assert.equal(rawStored.envelope.algorithm, 'AES-256-GCM');

  // Operator unlocks phone -> visibilitychange + pageshow wakes pollMarrowlineEpisodeClaim immediately!
  Object.defineProperty(ui.doc, 'visibilityState', { configurable: true, value: 'visible' });
  ui.doc.dispatchEvent(new ui.win.Event('visibilitychange'));
  ui.win.dispatchEvent(new ui.win.Event('pageshow'));

  await waitUntilCond(() => ui.$('khonapolitSend').dataset.transmissionState === 'ready'
    && ui.$('khonapolitTerminalStatus').dataset.phase === 'received');
  await waitUntilCond(() => consumeCalls.length === 1);

  assert.equal(generationPostCount, 1, 'NEVER dispatches a second POST generation');
  assert.equal(backend.getUpstreamCalls(), 1, 'exactly 1 provider generation executed');
  assert.ok(claimCalls.every((c) => c.method === 'GET'), 'all reattachment probes are read-only GET requests');
  assert.equal(consumeCalls[0].options.keepalive, true, '<1 KB consume deletion beacon uses keepalive');
  assert.equal(backend.store.size(), 0, 'server ciphertext physically deleted immediately after IndexedDB commit');
  assert.equal(ui.doc.getElementById('marrowlineTerminalHold'), null, 'no disconnection error card displayed');

  const renderedText = ui.doc.querySelector('#khonapolitMessages article.relay-message .relay-stage-text')?.textContent || '';
  assert.equal(renderedText, AUTHORED_TRANSMISSION);
  const receipt = ui.win.__TD613_KHONAPOLIT_LAST_RECEIPT__;
  assert.equal(receipt.provider.model, 'models/gemini-3.1-pro-preview');
  assert.equal(receipt.storage.serverConversationStorage, false);
  assert.equal(receipt.storage.ephemeralEpisodeCiphertext.encryption, 'AES-256-GCM');
  assert.equal(receipt.episodeContinuity.schema, MARROWLINE_EPISODE_CONTINUITY_VERSION);
});

test('Page reload / tab eviction during active generation automatically reattaches via read-only GET episode-claim without duplicate POST', async (t) => {
  let now = 1_700_000_200_000;
  let releaseServerCompletion;
  const serverGate = new Promise((resolve) => { releaseServerCompletion = resolve; });

  const backend = createInMemoryEpisodeHarness({
    clock: () => now,
    heartbeatMs: 30,
    upstreamHandler: async (_epReq, epRes) => {
      await serverGate;
      const relay = {
        schema: 'td613.khonapolit.integrated-covenant-relay/v3-adversarial-attractor',
        apertureHeader: 'TD613 APERTURE v3.2 · OPEN_FIELD_SPECULATIVE_SYNTHESIS · RUNTIME BACKGROUND',
        signal: { state: 'LOCKED', downstreamAdmitted: true },
        admission: { admissible: true, reasons: [], combiningMarkCount: 28, maxRun: 2, duplicate: false },
        parts: [{
          id: 'khonapolit',
          label: 'Kʰonapolit ∴ Tauric Diana bots',
          present: true,
          text: AUTHORED_TRANSMISSION,
          integrated: true,
          providerNative: true,
          voices: ['Kʰonapolit', 'Tauric Diana bots'],
          flourishMode: 'forensic-to-eruption'
        }]
      };
      epRes.statusCode = 200;
      epRes.setHeader('Content-Type', 'application/json; charset=utf-8');
      epRes.end(JSON.stringify({
        ok: true,
        text: AUTHORED_TRANSMISSION,
        relay,
        receipt: {
          provider: {
            model: 'models/gemini-3.1-pro-preview',
            attempts: [{ model: 'models/gemini-3.1-pro-preview', status: 200, streamed: true }],
            completion: { complete: true, finishReason: 'STOP' }
          },
          emergence: {
            classification: 'COVENANT_CONJUNCTION',
            signals: { covenantKeyIntegrity: { status: 'intact' } }
          },
          storage: { serverConversationStorage: false, browserSessionStorage: 'operator-controlled' },
          relay,
          seal: { state: 'OPEN' }
        }
      }));
    }
  });

  const sharedStorage = new Map();
  let postGenerationCountTab1 = 0;
  let postGenerationCountTab2 = 0;
  const tab2Claims = [];
  const tab2Consumes = [];

  const fetchTab1 = async (url, options = {}) => {
    if (String(options?.method || 'GET').toUpperCase() === 'POST' && String(url).includes('/api/dome-world/khonapolit') && !String(url).includes('operation=')) {
      postGenerationCountTab1 += 1;
      await backend.serverFetch(url, options);
      // Hang client stream while tab 1 gets evicted/reloaded
      return new Promise(() => {});
    }
    return backend.serverFetch(url, options);
  };

  const ui1 = mountJSDOMMarrowline(t, { fetchImpl: fetchTab1, sharedLocalStorage: sharedStorage });
  await ui1.ready();
  ui1.send('Survive full browser tab eviction and reload without re-billing.');
  await waitUntilCond(() => postGenerationCountTab1 === 1);
  await ui1.win.__TD613_MARROWLINE_THREADS__.flush();

  // Verify pendingEpisode saved in local storage fallback with zero plaintext secret leak beyond local capability
  const storedRaw = JSON.parse(sharedStorage.get('TD613_MARROWLINE_LOCAL_THREADS_V1'));
  const savedThread = Object.values(storedRaw)[0];
  assert.ok(savedThread.pendingEpisode?.episodeId, 'pendingEpisode capability persisted before network completion');

  // Complete server generation while browser tab is reloaded
  now += 20_000;
  releaseServerCompletion();
  await backend.drainBackground();

  // Mount fresh reloaded tab sharing local thread storage
  const fetchTab2 = async (url, options = {}) => {
    const strUrl = String(url);
    const method = String(options?.method || 'GET').toUpperCase();
    if (strUrl.includes('operation=episode-claim')) tab2Claims.push(strUrl);
    else if (strUrl.includes('operation=episode-consume')) tab2Consumes.push(strUrl);
    else if (method === 'POST' && strUrl.includes('/api/dome-world/khonapolit')) postGenerationCountTab2 += 1;
    return backend.serverFetch(url, options);
  };

  const ui2 = mountJSDOMMarrowline(t, { fetchImpl: fetchTab2, sharedLocalStorage: sharedStorage });
  await ui2.ready();
  await waitUntilCond(() => ui2.$('khonapolitTerminalStatus').dataset.phase === 'received');
  await waitUntilCond(() => tab2Consumes.length === 1);

  assert.equal(postGenerationCountTab2, 0, 'reloaded tab dispatched ZERO POST generation requests');
  assert.equal(backend.getUpstreamCalls(), 1, 'only 1 upstream generation ever executed');
  assert.ok(tab2Claims.length >= 1, 'reloaded tab recovered via read-only GET episode-claim');
  assert.equal(backend.store.size(), 0, 'server ciphertext deleted after reload recovery');

  const reloadedText = ui2.doc.querySelector('#khonapolitMessages article.relay-message .relay-stage-text')?.textContent || '';
  assert.equal(reloadedText, AUTHORED_TRANSMISSION);
  assert.equal(ui2.win.__TD613_MARROWLINE_THREADS__.current().pendingEpisode, null, 'pendingEpisode cleared after recovery');
});

test('Non-duplication, five-state separation, live upstream cancel abort, idempotency conflicts, and honest cold-instance OUTCOME_UNKNOWN degradation', async (t) => {
  let now = 1_700_000_300_000;
  const store = createMarrowlineEpisodeStore({ clock: () => now, maxActivePerIp: 2 });
  const controllers = new Map();

  // 1. Idempotent duplicate POST attachment + auth mismatch (403) + body conflict (409) + concurrency cap (429)
  const body1 = JSON.stringify({ message: 'First turn', mode: 'ISSUED_CONJUNCTION', waiveIssuance: true, history: [] });
  const ep1 = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, body1, { now });

  let handlerExecutions = 0;
  let resolveRun1;
  const run1Gate = new Promise((r) => { resolveRun1 = r; });

  const req1 = {
    method: 'POST',
    url: '/api/dome-world/khonapolit',
    headers: {
      host: 'td613.com',
      origin: 'https://td613.com',
      'sec-fetch-site': 'same-origin',
      'x-forwarded-for': '198.51.100.7',
      ...ep1.requestHeaders
    },
    body: body1
  };
  const res1 = makeStreamingMockRes();
  const p1 = runWithMarrowlineEpisodeContinuity(req1, res1, async (_req, vRes) => {
    handlerExecutions += 1;
    await run1Gate;
    vRes.statusCode = 200;
    vRes.end(JSON.stringify({ ok: true, text: 'done' }));
  }, { store, controllers, clock: () => now, heartbeatMs: 1000 });
  await flush();

  // Duplicate POST with identical episodeId + auth + body -> attaches idempotently with 0 extra executions!
  const resDup = makeJsonMockRes();
  await runWithMarrowlineEpisodeContinuity(req1, resDup, async () => {
    handlerExecutions += 1;
  }, { store, controllers, clock: () => now });
  assert.equal(resDup.statusCode, 200);
  assert.equal(resDup.json.attached_idempotent, true);
  assert.equal(resDup.json.state, 'RUNNING');
  assert.equal(handlerExecutions, 1, 'duplicate POST must NEVER execute a second provider call');

  // Wrong auth token -> 403
  const otherEp = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, body1, { now });
  const resWrongAuth = makeJsonMockRes();
  await runWithMarrowlineEpisodeContinuity({
    ...req1,
    headers: { ...req1.headers, 'X-TD613-Episode-Auth': otherEp.claimAuthToken }
  }, resWrongAuth, async () => { handlerExecutions += 1; }, { store, controllers, clock: () => now });
  assert.equal(resWrongAuth.statusCode, 403);
  assert.equal(resWrongAuth.json.error, 'episode-auth-mismatch');

  // Reused episodeId with mutated body -> 409
  const resConflict = makeJsonMockRes();
  await runWithMarrowlineEpisodeContinuity({
    ...req1,
    body: JSON.stringify({ message: 'Mutated prompt!', mode: 'ISSUED_CONJUNCTION', waiveIssuance: true, history: [] })
  }, resConflict, async () => { handlerExecutions += 1; }, { store, controllers, clock: () => now });
  assert.equal(resConflict.statusCode, 409);
  assert.equal(resConflict.json.error, 'episode-identity-conflict');

  // Cross-site request -> 403; query-string secret -> 400
  const resCrossSite = makeJsonMockRes();
  await runWithMarrowlineEpisodeContinuity({
    ...req1,
    headers: { ...req1.headers, 'sec-fetch-site': 'cross-site' }
  }, resCrossSite, async () => { handlerExecutions += 1; }, { store, controllers, clock: () => now });
  assert.equal(resCrossSite.statusCode, 403);

  const resQuerySecret = makeJsonMockRes();
  await runWithMarrowlineEpisodeContinuity({
    ...req1,
    url: '/api/dome-world/khonapolit?token=leaked'
  }, resQuerySecret, async () => { handlerExecutions += 1; }, { store, controllers, clock: () => now });
  assert.equal(resQuerySecret.statusCode, 400);
  assert.equal(resQuerySecret.json.error, 'query-secret-forbidden');

  // Per-IP active concurrency cap (max 2 RUNNING per IP -> 3rd gets 429)
  const ep2 = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, body1, { now });
  let resolveRun2;
  const p2 = runWithMarrowlineEpisodeContinuity({
    ...req1,
    headers: { ...req1.headers, ...ep2.requestHeaders }
  }, makeStreamingMockRes(), async (_r, vRes) => {
    await new Promise((r) => { resolveRun2 = r; });
    vRes.end('{}');
  }, { store, controllers, clock: () => now, heartbeatMs: 1000 });
  await flush();

  const ep3 = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, body1, { now });
  const resCap = makeJsonMockRes();
  await runWithMarrowlineEpisodeContinuity({
    ...req1,
    headers: { ...req1.headers, ...ep3.requestHeaders }
  }, resCap, async () => { handlerExecutions += 1; }, { store, controllers, clock: () => now });
  assert.equal(resCap.statusCode, 429);
  assert.equal(resCap.json.error, 'episode-concurrency-limit');

  // 2. Explicit operator cancel aborts real upstream Gemini fetch inside api/khonapolit.js & blocks late CAS
  resolveRun1();
  resolveRun2();
  await Promise.all([p1, p2]);
  store.clearAllForTest();

  clearGeminiModelState();
  const prevApiKey = process.env.GEMINI_API_KEY;
  const origGlobalFetch = globalThis.fetch;
  let upstreamAbortedByCancel = false;
  let upstreamGeminiCalls = 0;

  try {
    process.env.GEMINI_API_KEY = 'synthetic-offline-key';
    globalThis.fetch = async (url, init = {}) => {
      const urlStr = String(url);
      if (urlStr.includes('generativelanguage.googleapis.com') && !urlStr.includes(':streamGenerateContent') && !urlStr.includes(':generateContent')) {
        return new Response(JSON.stringify({
          models: [{
            name: 'models/gemini-4-carbon',
            supportedGenerationMethods: ['generateContent', 'streamGenerateContent']
          }]
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (urlStr.includes('generativelanguage.googleapis.com')) {
        upstreamGeminiCalls += 1;
        return new Promise((_resolve, reject) => {
          if (init.signal?.aborted) {
            upstreamAbortedByCancel = true;
            reject(Object.assign(new Error('Aborted by operator cancel'), { name: 'AbortError' }));
            return;
          }
          init.signal?.addEventListener('abort', () => {
            upstreamAbortedByCancel = true;
            reject(Object.assign(new Error('Aborted by operator cancel'), { name: 'AbortError' }));
          }, { once: true });
        });
      }
      throw new Error(`Unexpected external fetch: ${url}`);
    };

    const cancelBody = JSON.stringify({
      message: 'Cancel me mid-stream.',
      mode: 'issued-conjunction',
      waiveIssuance: true,
      groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
      history: []
    });
    const epCancel = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, cancelBody, { now });
    const liveRes = makeStreamingMockRes();
    const liveRun = runWithMarrowlineEpisodeContinuity({
      method: 'POST',
      url: '/api/dome-world/khonapolit',
      headers: {
        host: 'td613.com',
        origin: 'https://td613.com',
        'sec-fetch-site': 'same-origin',
        ...epCancel.requestHeaders
      },
      body: cancelBody
    }, liveRes, (epReq, epRes) => apiKhonapolitHandler(epReq, epRes), { store, controllers, clock: () => now, heartbeatMs: 1000 });

    await waitUntilCond(() => upstreamGeminiCalls === 1);

    const cancelRes = makeJsonMockRes();
    await episodeCancelHandler({
      method: 'POST',
      url: '/api/dome-world/khonapolit?operation=episode-cancel',
      headers: {
        host: 'td613.com',
        origin: 'https://td613.com',
        'sec-fetch-site': 'same-origin',
        'x-td613-episode-id': epCancel.episodeRecord.episodeId,
        'x-td613-episode-auth': epCancel.claimAuthToken
      },
      body: JSON.stringify({ request_id: epCancel.episodeRecord.episodeId })
    }, cancelRes, { store, controllers });

    assert.equal(cancelRes.statusCode, 200);
    assert.equal(cancelRes.json.state, 'CANCELLED');
    assert.equal(cancelRes.json.upstream_abort_signaled, true);
    assert.equal(upstreamAbortedByCancel, true, 'operator episode-cancel aborted live upstream Gemini fetch immediately');
    await liveRun;

    // Late sealTerminal CAS after CANCELLED must reject!
    const lateCas = await store.sealTerminal({
      episodeId: epCancel.episodeRecord.episodeId,
      nextState: 'COMPLETED',
      envelope: { algorithm: 'AES-256-GCM', ciphertext_b64: 'AAAA', iv_b64: 'BBBB', tag_b64: 'CCCC', hard_expires_at: now + 900_000 }
    });
    assert.equal(lateCas.committed, false);
    assert.equal(lateCas.reason, 'state-already-CANCELLED');
  } finally {
    globalThis.fetch = origGlobalFetch;
    if (prevApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevApiKey;
  }

  // 3. Stale 240s lease reconciles RUNNING -> OUTCOME_UNKNOWN
  store.clearAllForTest();
  const epLease = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, body1, { now });
  await store.registerOrAttach({
    episodeId: epLease.episodeRecord.episodeId,
    authSha256: crypto.createHash('sha256').update(epLease.claimAuthToken).digest('hex'),
    requestBodySha256: epLease.episodeRecord.requestBodySha256,
    ipHash: 'ip1'
  });
  now += MARROWLINE_EPISODE_LEASE_MS + 1;
  const leaseClaimRes = makeJsonMockRes();
  await episodeClaimHandler({
    method: 'GET',
    url: `/api/dome-world/khonapolit?operation=episode-claim&request_id=${epLease.episodeRecord.episodeId}`,
    query: { operation: 'episode-claim', request_id: epLease.episodeRecord.episodeId },
    headers: { host: 'td613.com', origin: 'https://td613.com', 'x-td613-episode-auth': epLease.claimAuthToken }
  }, leaseClaimRes, { store });
  assert.equal(leaseClaimRes.statusCode, 200);
  assert.equal(leaseClaimRes.json.state, 'OUTCOME_UNKNOWN');
  assert.equal(leaseClaimRes.json.reason, 'episode-lease-expired');

  // 4. Deterministic FAILED state (e.g. HTTP 429) seals & recovers as KNOWN_FAILED without re-billing
  store.clearAllForTest();
  const epFailed = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, body1, { now });
  await runWithMarrowlineEpisodeContinuity({
    method: 'POST',
    url: '/api/dome-world/khonapolit',
    headers: { host: 'td613.com', origin: 'https://td613.com', ...epFailed.requestHeaders },
    body: body1
  }, makeStreamingMockRes({ breakAfterChunks: 1 }), async (_r, vRes) => {
    vRes.statusCode = 429;
    vRes.setHeader('Retry-After', '42');
    vRes.end(JSON.stringify({ ok: false, error: 'gemini-rate-limit-held', retryAfterSeconds: 42 }));
  }, { store, clock: () => now, heartbeatMs: 1000 });

  const recoveredFail = await pollMarrowlineEpisodeClaim({
    root: { crypto: crypto.webcrypto },
    fetchImpl: async (url, opts) => {
      const r = makeJsonMockRes();
      const u = new URL(url, 'https://td613.com');
      await episodeClaimHandler({
        method: 'GET',
        url,
        query: Object.fromEntries(u.searchParams.entries()),
        headers: { host: 'td613.com', origin: 'https://td613.com', ...(opts.headers || {}) }
      }, r, { store });
      return new Response(r.bodyText, { status: r.statusCode, headers: r.headers });
    },
    episodeRecord: epFailed.episodeRecord,
    now: () => now
  });
  assert.equal(recoveredFail.outcome, 'RECOVERED');
  assert.equal(recoveredFail.episodeState, 'FAILED');
  assert.equal(recoveredFail.httpStatus, 429);
  assert.equal(recoveredFail.payload.error, 'gemini-rate-limit-held');

  // 5. Cold serverless instance miss (404 UNOBSERVED) during desktop window switch degrades honestly to OUTCOME_UNKNOWN with 0 retries
  let coldPosts = 0;
  const uiCold = mountJSDOMMarrowline(t, {
    fetchImpl: async (url, options = {}) => {
      const strUrl = String(url);
      const method = String(options?.method || 'GET').toUpperCase();
      if (strUrl.includes('operation=episode-claim')) {
        return new Response(JSON.stringify({
          schema: MARROWLINE_EPISODE_CLAIM_SCHEMA,
          ok: false,
          state: 'UNOBSERVED',
          error: 'episode-not-found'
        }), { status: 404, headers: { 'content-type': 'application/json' } });
      }
      if (method === 'POST' && strUrl.includes('/api/dome-world/khonapolit')) {
        coldPosts += 1;
        uiCold.win.dispatchEvent(new uiCold.win.Event('blur'));
        throw new TypeError('socket reset across instance hop');
      }
      return new Response(JSON.stringify({ ok: true, hasGeminiKey: true, modelPolicy: { callableModels: ['models/gemini-3.1-pro-preview'] } }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
  });
  await uiCold.ready();
  uiCold.send('Test cold instance miss after window blur.');
  await waitUntilCond(() => uiCold.$('khonapolitSend').dataset.transmissionState === 'ready'
    && uiCold.$('khonapolitTerminalStatus').dataset.phase === 'held');
  assert.equal(coldPosts, 1, 'zero automatic duplicate POSTs on cold instance miss');
  assert.equal(uiCold.win.__TD613_KHONAPOLIT_LAST_FAILURE__.outcomeState, 'OUTCOME_UNKNOWN');
  assert.equal(uiCold.win.__TD613_KHONAPOLIT_LAST_FAILURE__.windowFocusShifted, true);
  assert.equal(uiCold.win.__TD613_KHONAPOLIT_LAST_FAILURE__.automaticRetrySuppressed, true);
});

test('Safe Harbor cryptography, 15-minute (900s) zero-lag expiry, attachment isolation, and Tier 2 / Tier 3 (Runtime Cache, Upstash Redis REST, Dedicated Neon Postgres) store adapters', async () => {
  let now = 1_700_000_500_000;
  const bodyJson = JSON.stringify({
    message: 'Confidential artistic draft',
    attachments: [{ id: 'att1', name: 'sketch.png', mime_type: 'image/png', data_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAUA' }]
  });
  const created = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, bodyJson, { now, hasAttachments: true });

  // Attachment privacy: raw attachment bytes NEVER stored in pendingEpisode record
  assert.equal(created.episodeRecord.hasAttachments, true);
  assert.equal(JSON.stringify(created.episodeRecord).includes('iVBORw0KGgo'), false);
  assert.equal(JSON.stringify(created.episodeRecord).includes('Confidential artistic draft'), false);

  // Node <-> WebCrypto AES-256-GCM + AAD interoperability & tamper rejection
  const nodeDerived = deriveEpisodeCapabilityFromRoot(created.episodeRecord.rootSecretB64, created.episodeRecord.episodeId);
  assert.equal(nodeDerived.claimAuthToken, created.claimAuthToken);
  assert.equal(nodeDerived.envelopeKey, created.envelopeKey);

  const sealed = sealEpisodeEnvelope({
    payloadObject: { httpStatus: 200, headers: {}, body: { ok: true, text: AUTHORED_TRANSMISSION } },
    envelopeKeyB64Url: created.envelopeKey,
    episodeId: created.episodeRecord.episodeId,
    requestBodySha256: created.episodeRecord.requestBodySha256,
    hardExpiresAt: created.episodeRecord.hardExpiresAt
  });
  const openedWebCrypto = await decryptMarrowlineEpisodeEnvelope({ crypto: crypto.webcrypto }, {
    envelope: sealed,
    envelopeKey: created.envelopeKey,
    episodeId: created.episodeRecord.episodeId,
    requestBodySha256: created.episodeRecord.requestBodySha256
  });
  assert.equal(openedWebCrypto.body.text, AUTHORED_TRANSMISSION);
  const openedNode = openEpisodeEnvelopeNode({
    envelope: sealed,
    envelopeKeyB64Url: created.envelopeKey,
    episodeId: created.episodeRecord.episodeId,
    requestBodySha256: created.episodeRecord.requestBodySha256
  });
  assert.equal(openedNode.body.text, AUTHORED_TRANSMISSION);

  // Tampered AAD (wrong episodeId, wrong body hash, or mutated hard_expires_at) MUST fail AES-GCM auth tag!
  await assert.rejects(() => decryptMarrowlineEpisodeEnvelope({ crypto: crypto.webcrypto }, {
    envelope: { ...sealed, hard_expires_at: sealed.hard_expires_at + 1000 },
    envelopeKey: created.envelopeKey,
    episodeId: created.episodeRecord.episodeId,
    requestBodySha256: created.episodeRecord.requestBodySha256
  }));
  await assert.rejects(() => decryptMarrowlineEpisodeEnvelope({ crypto: crypto.webcrypto }, {
    envelope: sealed,
    envelopeKey: created.envelopeKey,
    episodeId: 'ep_differentepisodeid00000000000000',
    requestBodySha256: created.episodeRecord.requestBodySha256
  }));

  // Exact 15-minute (900,000 ms) API cutoff with zero intervening writes + idempotent duplicate consume
  const memStore = createMarrowlineEpisodeStore({ clock: () => now });
  const authSha256 = crypto.createHash('sha256').update(created.claimAuthToken).digest('hex');
  await memStore.registerOrAttach({
    episodeId: created.episodeRecord.episodeId,
    authSha256,
    requestBodySha256: created.episodeRecord.requestBodySha256,
    ipHash: 'ip_privacy'
  });
  await memStore.sealTerminal({
    episodeId: created.episodeRecord.episodeId,
    nextState: 'COMPLETED',
    envelope: sealed
  });

  now += MARROWLINE_EPISODE_HARD_TTL_MS + 1; // t = 900.001s
  const expiredClaim = makeJsonMockRes();
  await episodeClaimHandler({
    method: 'GET',
    url: `${MARROWLINE_EPISODE_CLAIM_ENDPOINT}&request_id=${created.episodeRecord.episodeId}`,
    query: { operation: 'episode-claim', request_id: created.episodeRecord.episodeId },
    headers: { host: 'td613.com', origin: 'https://td613.com', 'x-td613-episode-auth': created.claimAuthToken }
  }, expiredClaim, { store: memStore });
  assert.equal(expiredClaim.statusCode, 410);
  assert.equal(expiredClaim.json.error, 'episode-expired');
  assert.equal(expiredClaim.json.envelope, undefined);

  // Duplicate consume returns idempotent 200 OK (`already_deleted: true`)
  const dupConsume = makeJsonMockRes();
  await episodeConsumeHandler({
    method: 'POST',
    url: MARROWLINE_EPISODE_CONSUME_ENDPOINT,
    headers: {
      host: 'td613.com',
      origin: 'https://td613.com',
      'x-td613-episode-id': created.episodeRecord.episodeId,
      'x-td613-episode-auth': created.claimAuthToken
    },
    body: JSON.stringify({ request_id: created.episodeRecord.episodeId })
  }, dupConsume, { store: memStore });
  assert.equal(dupConsume.statusCode, 200);
  assert.equal(dupConsume.json.already_deleted, true);

  // Tier 2: Vercel Runtime Cache cross-instance sharing within region
  const sharedRegionCacheMap = new Map();
  const mockRuntimeCache = {
    get: async (k) => sharedRegionCacheMap.get(k) || null,
    set: async (k, v) => { sharedRegionCacheMap.set(k, JSON.parse(JSON.stringify(v))); },
    delete: async (k) => { sharedRegionCacheMap.delete(k); }
  };
  const instanceA = createMarrowlineEpisodeStore({ clock: () => now, runtimeCache: mockRuntimeCache });
  const instanceB = createMarrowlineEpisodeStore({ clock: () => now, runtimeCache: mockRuntimeCache });
  assert.equal(instanceA.descriptor.backend, 'vercel-runtime-cache-plus-fluid-memory');
  assert.equal(instanceA.descriptor.cross_instance_durable, false);
  assert.equal(instanceA.descriptor.regional_lookup_best_effort, true);
  const epCache = await createMarrowlineEpisode({ crypto: crypto.webcrypto }, bodyJson, { now });
  const cacheAuthSha = crypto.createHash('sha256').update(epCache.claimAuthToken).digest('hex');
  await instanceA.registerOrAttach({
    episodeId: epCache.episodeRecord.episodeId,
    authSha256: cacheAuthSha,
    requestBodySha256: epCache.episodeRecord.requestBodySha256,
    ipHash: 'ip_cache'
  });
  await instanceA.sealTerminal({ episodeId: epCache.episodeRecord.episodeId, nextState: 'COMPLETED', envelope: sealed });
  const fromInstanceB = await instanceB.getClaim({ episodeId: epCache.episodeRecord.episodeId, authSha256: cacheAuthSha });
  assert.equal(fromInstanceB.status, 'OK');
  assert.equal(fromInstanceB.record.state, 'COMPLETED');
  await instanceB.consume({ episodeId: epCache.episodeRecord.episodeId, authSha256: cacheAuthSha });
  assert.equal((await instanceA.getClaim({ episodeId: epCache.episodeRecord.episodeId, authSha256: cacheAuthSha })).status, 'NOT_FOUND');

  // Tier 3A: Dedicated Neon Postgres store enforces .neon.tech boundary and rejects Giving/Loom DB reuse
  assert.throws(() => createMarrowlineEpisodeStore({
    environment: {
      [MARROWLINE_CONTINUITY_NEON_ENV]: 'postgresql://user:pass@ep-shared.us-east-2.aws.neon.tech/neondb',
      TD613_GIVING_NEON_DATABASE_URL: 'postgresql://other:pw@ep-shared.us-east-2.aws.neon.tech/neondb'
    }
  }), /MARROWLINE_CONTINUITY_DATABASE_MUST_BE_DEDICATED/);

  assert.throws(() => createMarrowlineEpisodeStore({
    environment: {
      [MARROWLINE_CONTINUITY_NEON_ENV]: 'postgresql://user:pass@example.com/db'
    }
  }), /MARROWLINE_CONTINUITY_HOST_OUTSIDE_NEON_BOUNDARY/);

  const neonQueries = [];
  const neonStore = createMarrowlineEpisodeStore({
    clock: () => now,
    environment: {
      [MARROWLINE_CONTINUITY_NEON_ENV]: 'postgresql://user:pass@ep-marrowline-dedicated.us-east-2.aws.neon.tech/marrowline_ephemeral'
    },
    fetchImpl: async (_endpoint, init) => {
      const parsed = JSON.parse(init.body);
      neonQueries.push(parsed.query);
      if (parsed.query.includes('SELECT count(*)')) {
        return new Response(JSON.stringify({ rows: [{ cnt: 0 }] }), { status: 200 });
      }
      if (parsed.query.includes('INSERT INTO')) {
        return new Response(JSON.stringify({
          rows: [{
            episode_id: parsed.params[0],
            auth_sha256: parsed.params[1],
            request_body_sha256: parsed.params[2],
            ip_hash: parsed.params[3],
            state: 'RUNNING',
            reason: null,
            created_at_ms: parsed.params[4],
            updated_at_ms: parsed.params[4],
            lease_expires_at_ms: parsed.params[5],
            hard_expires_at_ms: parsed.params[6],
            envelope_json: null
          }]
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ rows: [] }), { status: 200 });
    }
  });
  assert.equal(neonStore.descriptor.backend, 'neon-postgres-ephemeral');
  const neonCreated = await neonStore.registerOrAttach({
    episodeId: epCache.episodeRecord.episodeId,
    authSha256: cacheAuthSha,
    requestBodySha256: epCache.episodeRecord.requestBodySha256,
    ipHash: 'ip_neon'
  });
  assert.equal(neonCreated.status, 'CREATED');
  assert.ok(neonQueries.some((q) => q.includes('ON CONFLICT (episode_id) DO NOTHING')));

  // Tier 3B: Upstash Redis REST adapter enforces HTTPS + executes EVAL Lua PX / KEEPTTL / DEL
  assert.throws(() => createMarrowlineEpisodeStore({
    environment: {
      [MARROWLINE_CONTINUITY_REDIS_URL_ENV]: 'http://insecure.upstash.io',
      [MARROWLINE_CONTINUITY_REDIS_TOKEN_ENV]: 'tok'
    }
  }), /MARROWLINE_CONTINUITY_REDIS_HTTPS_REQUIRED/);

  const redisCommands = [];
  let redisSavedRecord = null;
  const redisStore = createMarrowlineEpisodeStore({
    clock: () => now,
    environment: {
      [MARROWLINE_CONTINUITY_REDIS_URL_ENV]: 'https://dedicated-marrowline.upstash.io',
      [MARROWLINE_CONTINUITY_REDIS_TOKEN_ENV]: 'secret-token'
    },
    fetchImpl: async (_url, init) => {
      const cmd = JSON.parse(init.body);
      redisCommands.push(cmd);
      if (cmd[0] === 'EVAL' && String(cmd[1]).includes("status = 'CREATED'")) {
        redisSavedRecord = JSON.parse(cmd[7]);
        return new Response(JSON.stringify({ result: JSON.stringify({ status: 'CREATED', record: redisSavedRecord }) }), { status: 200 });
      }
      if (cmd[0] === 'GET') {
        return new Response(JSON.stringify({ result: redisSavedRecord ? JSON.stringify(redisSavedRecord) : null }), { status: 200 });
      }
      if (cmd[0] === 'EVAL' && String(cmd[1]).includes('KEEPTTL')) {
        redisSavedRecord = { ...redisSavedRecord, state: cmd[6], envelope: JSON.parse(cmd[8]) };
        return new Response(JSON.stringify({ result: JSON.stringify({ committed: true, record: redisSavedRecord }) }), { status: 200 });
      }
      if (cmd[0] === 'DEL' || cmd[0] === 'ZREM') {
        if (cmd[0] === 'DEL') redisSavedRecord = null;
        return new Response(JSON.stringify({ result: 1 }), { status: 200 });
      }
      return new Response(JSON.stringify({ result: null }), { status: 200 });
    }
  });
  assert.equal(redisStore.descriptor.backend, 'upstash-redis-rest-ephemeral');
  const rReg = await redisStore.registerOrAttach({
    episodeId: epCache.episodeRecord.episodeId,
    authSha256: cacheAuthSha,
    requestBodySha256: epCache.episodeRecord.requestBodySha256,
    ipHash: 'ip_redis'
  });
  assert.equal(rReg.status, 'CREATED');
  const rSeal = await redisStore.sealTerminal({ episodeId: epCache.episodeRecord.episodeId, nextState: 'COMPLETED', envelope: sealed });
  assert.equal(rSeal.committed, true);
  const rDel = await redisStore.consume({ episodeId: epCache.episodeRecord.episodeId, authSha256: cacheAuthSha });
  assert.equal(rDel.status, 'DELETED');
  assert.ok(redisCommands.some((c) => c[0] === 'DEL'));

  // Verify @vercel/request-context Symbol waitUntil registration
  let capturedSymbolWaitUntil = null;
  const ctxSymbol = Symbol.for('@vercel/request-context');
  const prevCtx = globalThis[ctxSymbol];
  try {
    globalThis[ctxSymbol] = {
      get: () => ({
        waitUntil(p) { capturedSymbolWaitUntil = p; }
      })
    };
    const reg = registerVercelWaitUntil(Promise.resolve('done'));
    assert.equal(reg.registered, true);
    assert.equal(reg.mechanism, 'vercel-request-context-wait-until');
    assert.ok(capturedSymbolWaitUntil instanceof Promise);
  } finally {
    if (prevCtx === undefined) delete globalThis[ctxSymbol];
    else globalThis[ctxSymbol] = prevCtx;
  }
});


// All operations start before either registration has completed.
test('simultaneous episode registration and consumed replay never acquire a second local generation owner', async () => {
  const store = createMarrowlineEpisodeStore({ environment: {} });
  const args = { episodeId: 'ep_' + 'a'.repeat(32), authSha256: 'b'.repeat(64), requestBodySha256: 'c'.repeat(64), ipHash: 'test-ip' };
  try {
    const owners = await Promise.all(Array.from({length: 12}, () => store.registerOrAttach(args)));
    assert.equal(owners.filter(row => row.status === 'CREATED').length, 1);
    assert.equal(owners.filter(row => row.status === 'ATTACHED').length, 11);
    assert.equal((await store.consume(args)).status, 'RUNNING');
    const seal = await store.sealTerminal({ episodeId: args.episodeId, nextState: 'COMPLETED', envelope: { ciphertext: 'synthetic' } });
    assert.equal(seal.committed, true);
    assert.equal((await store.consume(args)).status, 'DELETED');
    assert.equal(store.size(), 0);
    assert.equal(store.inspectRawForTest(args.episodeId).envelope, null);
    assert.equal((await store.registerOrAttach(args)).status, 'ATTACHED');
    assert.equal((await store.getClaim(args)).status, 'NOT_FOUND');
    assert.equal((await store.consume(args)).status, 'ALREADY_DELETED');
    assert.equal((await store.sealTerminal({ episodeId: args.episodeId, nextState: 'COMPLETED', envelope: { ciphertext: 'late' } })).committed, false);
  } finally { store.clearAllForTest(); }
});
