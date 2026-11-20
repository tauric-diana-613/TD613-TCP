#!/usr/bin/env node
// Provider-free local browser witness server for Commission
// TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION (Stage II Section VI).
//
// Strictly synthetic & zero-spend:
// - Intercepts globalThis.fetch in-process; refuses all external egress.
// - Executes the REAL api/khonapolit.js -> server/khonapolit-quality.js handler.
// - Serves the REAL app/ static tree (app/dome-world/marrowline.html & JS/CSS).
// - Records exact browser-submitted request bodies (including multi-turn history)
//   and raw server-returned text SHA-256 digests at GET /__witness/log.
// - NEVER represents synthetic fixture outputs as live Gemini or Oct 2 artistry.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const APP_ROOT = path.join(REPO_ROOT, 'app');
const PORT = Number(process.env.TD613_WITNESS_PORT || 6137);
const sha256 = (value) => crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');

// Deterministic scripted provider-free responses (strictly synthetic witnesses).
const SYNTHETIC_TURN_1_TEXT = [
  'Kʰonapolit',
  '𝌋‌ Under Khona\u200Clit-po (coordinate U+10D613 / \uDBF5\uDE13), a blue–orange storm on a Dome-World visualization is not self-authenticating breach telemetry. An animation renders state transitions; a diagnostic trace binds ordered observations; admissible evidence requires independent custody outside the display layer. Give the Chairman his strongest premise: correlated spikes across adjacent tiles warrant inspection. What fails is his leap from visible turbulence to proven intrusion — internal display coherence never proves exterior origin. ⟐',
  '',
  'Tauric Diana bots',
  'H\u0300\u0301\u0302\u0303\u0316\u0317\u0318E\u0304\u0307\u030B\u031C\u0323\u032DA\u0305\u0308\u030C\u031E\u0325\u0331R\u0306\u030A\u0319\u0326\u0330I\u0300\u0302\u0316\u0317N\u0301\u0303\u0318\u0323G\u0304\u0305\u0325 ADJOURNED — the Chairman tried to subpoena a CSS gradient!',
  '',
  'A\u0300 quiet breath at the shoreline.',
  '',
  'B\u0300\u0301\u0302\u0303\u0304\u0316\u0317\u0318\u0319L\u0305\u0306\u0307\u0308\u031C\u031D\u031EU\u030A\u030B\u030C\u0323\u0324\u0325E\u0300\u0301\u0316\u0317–O\u0302\u0303\u0304\u0318\u0319\u031CR\u0305\u0306\u031D\u031EA\u0307\u0308\u0323\u0324N\u030A\u030B\u0325G\u030C\u0326E\u0300\u0316 W\u0301\u0302\u0303\u0317\u0318E\u0304\u0305\u0319\u031CA\u0306\u0307\u031D\u031ET\u0308\u030A\u0323\u0324H\u030B\u030C\u0325E\u0300\u0301\u0316R\u0302\u0317 IS NOT A WARRANT; COUNT THE PIXELS AGAIN AND PAY THE GROVE ITS HEAT!'
].join('\n');

const SYNTHETIC_TURN_2_TEXT = [
  'Kʰonapolit',
  'Because the previous turn re-entered raw without synthetic speaker wrappers, the custody chain stays legible: the Chairman still confuses a displayed animation with an external witness, and the denominator remains broken.',
  '',
  'Tauric Diana bots',
  'S\u0300h\u0323o\u0301r\u0316e\u0304l\u0325i\u0302n\u0317e\u0308 — quiet marks still hold the seam.',
  'T\u0303h\u031ce\u0306 l\u031ee\u030ad\u0319g\u030be\u0324r\u030c remembers what the camera cropped.'
].join('\n');

const SYNTHETIC_INCOMPLETE_FRAGMENT = [
  'Kʰonapolit',
  'The partial stream began tracing the missing register before the provider stream closed without STOP'
].join('\n');

const witnessState = {
  schema: 'td613.marrowline.provider-free-browser-witness/v1',
  mode: 'SYNTHETIC_PROVIDER_FREE_LOCAL_WITNESS',
  paidProviderCalls: 0,
  expectedFixtures: {
    turn1Text: SYNTHETIC_TURN_1_TEXT,
    turn1Sha256: sha256(SYNTHETIC_TURN_1_TEXT),
    turn2Text: SYNTHETIC_TURN_2_TEXT,
    turn2Sha256: sha256(SYNTHETIC_TURN_2_TEXT),
    incompleteFragment: SYNTHETIC_INCOMPLETE_FRAGMENT,
    incompleteSha256: sha256(SYNTHETIC_INCOMPLETE_FRAGMENT)
  },
  requests: []
};

function makeSseResponse(events = []) {
  const encoder = new TextEncoder();
  const payload = events.map((ev) => `data: ${JSON.stringify(ev)}\n\n`).join('');
  return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    }
  }), {
    status: 200,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' }
  });
}

// Install fail-closed zero-egress fetch stub BEFORE loading api/khonapolit.js.
process.env.GEMINI_API_KEY = 'synthetic-provider-free-local-witness-zero-spend';
globalThis.fetch = async (url, init = {}) => {
  const href = String(url);
  if (href.includes('/v1beta/models?')) {
    return new Response(JSON.stringify({
      models: [
        { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-3.5-flash', supportedGenerationMethods: ['generateContent'] }
      ]
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (href.includes(':streamGenerateContent')) {
    const body = JSON.parse(String(init.body || '{}'));
    const contents = Array.isArray(body.contents) ? body.contents : [];
    const userTurns = contents
      .filter((c) => c.role === 'user')
      .map((c) => String(c.parts?.[0]?.text || ''));
    const lastUser = userTurns[userTurns.length - 1] || '';
    const isRepairTurn = /BOUNDED (?:SAME-PROVIDER|STRUCTURAL)|Complete ONLY the unfinished/i.test(lastUser);
    const taskUser = [...userTurns].reverse().find(
      (text) => !/BOUNDED (?:SAME-PROVIDER|STRUCTURAL)|Complete ONLY the unfinished/i.test(text)
    ) || lastUser;
    if (taskUser.includes('WITNESS-POLICY-HOLD')) {
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nPartial synthetic fragment before policy cut.' }] } }],
          modelVersion: 'gemini-3.8-flash',
          usageMetadata: { promptTokenCount: 4100, cachedContentTokenCount: 3200 }
        },
        {
          candidates: [{ content: { parts: [] }, finishReason: 'PROHIBITED_CONTENT', finishMessage: 'Synthetic local witness policy halt.' }],
          usageMetadata: { totalTokenCount: 4140 }
        }
      ]);
    }
    if (taskUser.includes('WITNESS-INCOMPLETE')) {
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [{ text: isRepairTurn ? '' : SYNTHETIC_INCOMPLETE_FRAGMENT }] } }],
          modelVersion: 'gemini-3.8-flash',
          usageMetadata: { promptTokenCount: 3900, candidatesTokenCount: isRepairTurn ? 0 : 28, totalTokenCount: isRepairTurn ? 3900 : 3928 }
        }
      ]);
    }
    if (taskUser.includes('WITNESS-TURN-2')) {
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [{ text: SYNTHETIC_TURN_2_TEXT }] }, finishReason: 'STOP' }],
          modelVersion: 'gemini-3.8-flash',
          usageMetadata: { promptTokenCount: 5900, cachedContentTokenCount: 4875, candidatesTokenCount: 92, totalTokenCount: 5992 }
        }
      ]);
    }
    return makeSseResponse([
      {
        candidates: [{ content: { parts: [{ text: SYNTHETIC_TURN_1_TEXT }] }, finishReason: 'STOP' }],
        modelVersion: 'gemini-3.8-flash',
        usageMetadata: { promptTokenCount: 5200, cachedContentTokenCount: 4875, candidatesTokenCount: 380, totalTokenCount: 5580 }
      }
    ]);
  }
  throw new Error(`EXTERNAL_EGRESS_FORBIDDEN_IN_PROVIDER_FREE_WITNESS: ${href}`);
};

const { default: khonapolitApiHandler } = await import('../../../../api/khonapolit.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
    if (url.pathname === '/__witness/log') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(witnessState, null, 2));
      return;
    }
    if (url.pathname === '/__witness/reset' && req.method === 'POST') {
      witnessState.requests = [];
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (url.pathname === '/api/dome-world/khonapolit' || url.pathname === '/api/khonapolit') {
      const rawBody = req.method === 'POST' ? await readRequestBody(req) : '';
      let parsedBody = {};
      try { parsedBody = rawBody ? JSON.parse(rawBody) : {}; } catch {}
      const capturedHeaders = {};
      const origSetHeader = res.setHeader.bind(res);
      const origEnd = res.end.bind(res);
      let responseText = '';
      res.setHeader = (name, value) => {
        capturedHeaders[String(name).toLowerCase()] = value;
        return origSetHeader(name, value);
      };
      res.end = (chunk = '', ...rest) => {
        if (chunk) responseText += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
        let parsedResp = null;
        try { parsedResp = JSON.parse(responseText); } catch {}
        if (req.method === 'POST') {
          const hist = Array.isArray(parsedBody.history) ? parsedBody.history : [];
          const modelHistEntries = hist.filter((h) => h?.role === 'model');
          witnessState.requests.push({
            at: new Date().toISOString(),
            method: req.method,
            path: url.pathname,
            message: parsedBody.message || '',
            groveTrial: parsedBody.groveTrial ?? null,
            historyCount: hist.length,
            history: hist.map((h) => ({
              role: h?.role || null,
              sha256: sha256(h?.text || ''),
              utf8Bytes: Buffer.byteLength(String(h?.text || ''), 'utf8'),
              hasSyntheticWrapper: /Kʰonapolit\s*∴\s*Tauric Diana bots/.test(String(h?.text || '')),
              preservesZwnjCovenantKey: String(h?.text || '').includes('Khona\u200Clit-po'),
              matchesTurn1ExactBytes: String(h?.text || '') === SYNTHETIC_TURN_1_TEXT
            })),
            modelHistoryCount: modelHistEntries.length,
            responseStatus: res.statusCode,
            responseCompletionStateHeader: capturedHeaders['x-td613-completion-state'] || null,
            responseError: parsedResp?.error || null,
            responseWarning: parsedResp?.warning || null,
            responseOk: parsedResp?.ok ?? null,
            responseTextSha256: parsedResp?.text ? sha256(parsedResp.text) : null,
            responseApertureRoute: parsedResp?.receipt?.aperture?.taskIntent?.primary_route || parsedResp?.aperture?.taskIntent?.primary_route || null,
            responseCachedTokens: parsedResp?.receipt?.provider?.output?.usage?.cachedContentTokenCount
              ?? parsedResp?.attempts?.[0]?.output?.usage?.cachedContentTokenCount
              ?? null
          });
          if (process.env.TD613_WITNESS_LOG_OUT) {
            fs.writeFileSync(process.env.TD613_WITNESS_LOG_OUT, JSON.stringify(witnessState, null, 2) + '\n', 'utf8');
          }
        }
        return origEnd(chunk, ...rest);
      };
      req.body = parsedBody;
      await khonapolitApiHandler(req, res);
      return;
    }

    // Serve static files from app/
    const relPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const candidate = path.resolve(APP_ROOT, relPath || 'dome-world/marrowline.html');
    if (!candidate.startsWith(APP_ROOT) || !fs.existsSync(candidate) || fs.statSync(candidate).isDirectory()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }
    const ext = path.extname(candidate).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(candidate).pipe(res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`PROVIDER_FREE_WITNESS_READY http://127.0.0.1:${PORT}/dome-world/marrowline.html`);
});
