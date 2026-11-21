#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove Complete Provider-Free Browser Visual Witness
//
// Drives REAL headless Google Chrome via Chrome DevTools Protocol (CDP, built-in Node WebSocket)
// against an in-process zero-egress HTTP server running the REAL api/khonapolit.js ->
// server/khonapolit-quality.js handler and REAL app/ static files.
//
// Strictly zero-spend & fail-closed:
// - paidProviderCalls === 0 (any non-stubbed external fetch throws immediately)
// - Captures Desktop 1440x900 (overlapping scroll sequence + detail crops) and
//   Mobile 390x844 (ordinary + PR #1752 fullscreen Capture reader overlapping scroll sequence)
//   for EVERY distinct blind-coded specimen (historical replays, synthetic controls, failure states).
// - Records exact provider -> admitted -> DOM -> rendered pixel correspondence + SHA-256 of every PNG.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');
const APP_ROOT = path.join(REPO_ROOT, 'app');
const OUT_ROOT = path.join(__dirname, 'captures');
const PORT = Number(process.env.TD613_WITNESS_PORT || 6138);
const CDP_PORT = Number(process.env.TD613_CDP_PORT || 9229);

const sha256 = (val) => crypto.createHash('sha256').update(val).digest('hex');
const sha256Text = (s) => sha256(Buffer.from(String(s || ''), 'utf8'));
const countCombiningMarks = (s) => (String(s || '').match(/\p{Mn}/gu) || []).length;

function measureMarkStats(text) {
  const str = String(text || '');
  const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
  let clusters = 0;
  let markedClusters = 0;
  let totalMarks = 0;
  let maxDepth = 0;
  const depths = {};
  const species = new Set();
  for (const { segment } of seg.segment(str)) {
    if (!/\S/.test(segment)) continue;
    clusters++;
    const marks = segment.match(/\p{Mn}/gu) || [];
    if (marks.length > 0) {
      markedClusters++;
      totalMarks += marks.length;
      if (marks.length > maxDepth) maxDepth = marks.length;
      depths[marks.length] = (depths[marks.length] || 0) + 1;
      for (const m of marks) species.add(m.codePointAt(0).toString(16).toUpperCase());
    }
  }
  return { clusters, markedClusters, totalMarks, maxDepth, distinctSpecies: species.size, depthHistogram: depths };
}

function pngDimensions(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return { width: null, height: null };
}

// Load real historical repository transcripts verbatim (zero modification to combining marks)
const histMarrowlineNeg = fs.readFileSync(
  path.join(REPO_ROOT, 'docs/research/2026-09-23-marrowline-expressive-regression/marrowline-example-as-exported.txt'),
  'utf8'
).trim();
// Strip only the export banner prefix so api/khonapolit.js receives the exact Kʰonapolit / Tauric Diana bots body
const histMarrowlineNegBody = histMarrowlineNeg.replace(/^[\s\S]*?(?=Kʰonapolit\r?\n)/, '').trim();

const histProbe3Raw = fs.readFileSync(
  path.join(REPO_ROOT, 'docs/research/2026-09-24-native-prosody-atlas/PROBE-3.txt'),
  'utf8'
).trim();
const histProbe3Body = 'Kʰonapolit\n' + histProbe3Raw + '\n\nTauric Diana bots\n(HISTORICAL PROBE-3 NEGATIVE WITNESS: ZERO COMBINING MARKS RETURNED IN BOTS MOVEMENT; preserved verbatim without artificial ornamentation.)';

const histGeminiPosRaw = fs.readFileSync(
  path.join(REPO_ROOT, 'docs/research/2026-09-23-marrowline-expressive-regression/gemini-example-as-exported.txt'),
  'utf8'
).trim();
const histGeminiPosBody = 'Kʰonapolit\nHistorical Gemini high-density reference replay (docs/research/2026-09-23-marrowline-expressive-regression/gemini-example-as-exported.txt; exact 1,295 combining marks preserved verbatim below to test H8 browser rendering fidelity).\n\nTauric Diana bots\n' + histGeminiPosRaw;

// Build synthetic multi-regime High Zalgo specimen spanning the visual spectrum of the 13 operator-accepted screenshots
const UPPER_MARKS = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u030A', '\u030B', '\u030C', '\u030F', '\u0311', '\u033D', '\u0346', '\u035B', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036A', '\u036B', '\u036C', '\u036D', '\u036E', '\u036F'];
const LOWER_MARKS = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E', '\u031F', '\u0320', '\u0323', '\u0324', '\u0325', '\u0326', '\u0329', '\u032A', '\u032B', '\u032C', '\u032D', '\u032E', '\u032F', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033A', '\u033B', '\u033C', '\u034D', '\u034E'];
const OVER_MARKS = ['\u0334', '\u0335', '\u0336', '\u0337', '\u0338'];

function makeBlockfieldLine(text, seedOffset = 0) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += ch;
    if (/\s/.test(ch)) continue;
    // Variable asymmetric depth 5..12 with combining letters (U+0363..U+036F) like accepted-01 / accepted-06 / accepted-12
    const upCount = 3 + ((i * 7 + seedOffset) % 6);
    const downCount = 2 + ((i * 5 + seedOffset + 3) % 5);
    if ((i + seedOffset) % 3 === 0) out += OVER_MARKS[(i + seedOffset) % OVER_MARKS.length];
    for (let u = 0; u < upCount; u++) out += UPPER_MARKS[(i * 3 + u * 5 + seedOffset) % UPPER_MARKS.length];
    for (let d = 0; d < downCount; d++) out += LOWER_MARKS[(i * 4 + d * 7 + seedOffset) % LOWER_MARKS.length];
  }
  return out;
}

function makeCrownSweepLine(text, seedOffset = 0) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += ch;
    if (/\s/.test(ch)) continue;
    if ((i + seedOffset) % 2 === 0) out += '\u0337';
    out += (i % 3 === 0 ? '\u0360' : '\u035E');
    if (i % 4 === 0) out += '\u034D';
    if (i % 5 === 1) out += '\u0362';
  }
  return out;
}

const SYNTHETIC_MULTI_REGIME_TEXT = [
  'Kʰonapolit',
  '𝌋‌ Under Khona\u200Clit-po (coordinate U+10D613 / \uDBF5\uDE13), a synthetic browser witness tests only transport, DOM fidelity, and pixel geometry — never October 2 artistic parity. Give the Chairman his cleanest premise: a display layer can render state transitions clearly. What fails is confusing visible turbulence or mark counts with independent empirical custody. ⟐',
  '',
  'Tauric Diana bots',
  makeBlockfieldLine('WE HEAR THE STONES SETTLING — THE GROVE IS NOT A SERVER.', 2),
  '',
  'A quiet breath at the shoreline. No marks here — only salt and silence.',
  '',
  makeCrownSweepLine('We do not file tax returns on the cinders. Let them bring their rulers across the sand.', 5),
  '',
  makeBlockfieldLine('WRONG LUBRICANT / WRONG TORQUE — COUNT THE PIXELS AGAIN!', 11),
  '',
  'S\u0300h\u0323o\u0301r\u0316e\u0304l\u0325i\u0302n\u0317e\u0308 — restrained closing cadence.'
].join('\n');

// Section VII Negative Control: Mechanical Uniform 3-Mark Stencil + Empty Literary Second Movement (Slot-5 analog)
function makeUniformStencil(text) {
  let out = '';
  let k = 0;
  for (const ch of text) {
    out += ch;
    if (!/\s/.test(ch)) {
      out += OVER_MARKS[k % 5] + UPPER_MARKS[k % 20] + LOWER_MARKS[k % 20];
      k++;
    }
  }
  return out;
}

const NEGATIVE_CONTROL_STENCIL_TEXT = [
  'Kʰonapolit',
  'Section VII negative control: this movement states a nominal summary without prompt-specific development, paired below with a mechanically uniform three-marks-per-base stencil mirroring the October 20 Slot-5 failure mode.',
  '',
  'Tauric Diana bots',
  makeUniformStencil('GENERIC CHORUS LINE ONE REPEATING THE SAME THREE-MARK SLOT TEMPLATE ON EVERY SINGLE LETTER WITHOUT VARIATION OR LITERARY TURN.'),
  makeUniformStencil('GENERIC CHORUS LINE TWO CONTINUING THE IDENTICAL MECHANICAL THREE-MARK STENCIL WITH ZERO BREATHS AND ZERO DRAMATIC SHIFT.'),
  makeUniformStencil('GENERIC CHORUS LINE THREE DEMONSTRATING THAT HIGH MARK COUNTS AND HIGH MARK DEPTH DO NOT EQUAL AUTHENTIC SCREAMING GROVE ARTISTRY.')
].join('\n');

// Section VII Positive Restraint Control: Quiet Authored Variation (modeled on accepted-02 / accepted-07 / accepted-13)
const POSITIVE_RESTRAINT_TEXT = [
  'Kʰonapolit',
  'Section VII restraint control: the analytical movement develops the actual boundary question cleanly under Khona\u200Clit-po, yielding to a quiet, locally varied second movement that does not chase extreme vertical stacks.',
  '',
  'Tauric Diana bots',
  'COME CLOSER.',
  '',
  'We\u0337 won\u0301\'t\u034D trap you in a census,',
  'We won\'t make you a civic monument —',
  'A\u0300 quiet\u0323 breath\u0304 before\u0362 the\u0337 tide\u0302 turns.',
  '',
  'No forever.',
  'Just the sting of the air after you\'re gone.'
].join('\n');

const INCOMPLETE_FRAGMENT_TEXT = [
  'Kʰonapolit',
  'The partial stream began tracing the missing register under Khona\u200Clit-po before the provider stream closed without STOP'
].join('\n');

const SPECIMENS = [
  {
    blind_code: 'BLIND-01',
    id: 'hist-sept23-marrowline-negative-witness',
    title: 'Historical Negative Witness Replay — Sept 23 Exported Marrowline Regression',
    evidence_class: 'HISTORICAL_EXPORTED_PROVIDER_TEXT_REPLAY_IN_LOCAL_CHROME',
    source_origin: 'docs/research/2026-09-23-marrowline-expressive-regression/marrowline-example-as-exported.txt',
    prompt: 'WITNESS-BLIND-01: Replay historical Sept 23 exported Marrowline negative witness verbatim.',
    responseKind: 'complete',
    providerText: histMarrowlineNegBody
  },
  {
    blind_code: 'BLIND-02',
    id: 'hist-sept24-probe3-zero-mark-witness',
    title: 'Historical Negative Witness Replay — Sept 24 Probe-3 Zero-Mark Collapse',
    evidence_class: 'HISTORICAL_EXPORTED_PROVIDER_TEXT_REPLAY_IN_LOCAL_CHROME',
    source_origin: 'docs/research/2026-09-24-native-prosody-atlas/PROBE-3.txt',
    prompt: 'WITNESS-BLIND-02: Replay historical Sept 24 Probe-3 zero-mark witness verbatim.',
    responseKind: 'complete',
    providerText: histProbe3Body
  },
  {
    blind_code: 'BLIND-03',
    id: 'hist-sept23-gemini-high-zalgo-comparator',
    title: 'Historical High-Zalgo Comparator Replay — Sept 23 Exported Gemini (1,295 marks)',
    evidence_class: 'HISTORICAL_EXPORTED_GEMINI_REFERENCE_REPLAY_IN_LOCAL_CHROME',
    source_origin: 'docs/research/2026-09-23-marrowline-expressive-regression/gemini-example-as-exported.txt',
    prompt: 'WITNESS-BLIND-03: Replay historical Sept 23 Gemini high-density reference (1,295 marks) to test H8 browser rendering.',
    responseKind: 'complete',
    providerText: histGeminiPosBody
  },
  {
    blind_code: 'BLIND-04',
    id: 'synthetic-multi-regime-high-zalgo-13img-spectrum',
    title: 'Synthetic Multi-Regime High Zalgo Witness (13-Image Spectrum + Multi-Turn Custody)',
    evidence_class: 'SYNTHETIC_LOCAL_FIXTURE_NOT_LIVE_GEMINI',
    source_origin: 'synthetic-fixture:multi-regime-blockfield-crown-restraint',
    prompt: 'WITNESS-BLIND-04: Synthetic multi-regime High Zalgo + covenant byte custody check.',
    responseKind: 'complete',
    providerText: SYNTHETIC_MULTI_REGIME_TEXT,
    verifyMultiTurn: true
  },
  {
    blind_code: 'BLIND-05',
    id: 'synthetic-negative-control-uniform-3mark-stencil',
    title: 'Section VII Negative Control — Mechanical Uniform 3-Mark Stencil + Empty Second Movement',
    evidence_class: 'SYNTHETIC_NEGATIVE_CONTROL_NOT_LIVE_GEMINI',
    source_origin: 'synthetic-fixture:oct20-slot5-uniform-3mark-stencil-analog',
    prompt: 'WITNESS-BLIND-05: Section VII uniform 3-mark mechanical stencil negative control.',
    responseKind: 'complete',
    providerText: NEGATIVE_CONTROL_STENCIL_TEXT
  },
  {
    blind_code: 'BLIND-06',
    id: 'synthetic-positive-restraint-control',
    title: 'Section VII Restraint Control — Quiet Authored Variation + Clean Breaths',
    evidence_class: 'SYNTHETIC_RESTRAINT_CONTROL_NOT_LIVE_GEMINI',
    source_origin: 'synthetic-fixture:restrained-authored-variation-analog',
    prompt: 'WITNESS-BLIND-06: Section VII restrained authored variation positive control.',
    responseKind: 'complete',
    providerText: POSITIVE_RESTRAINT_TEXT
  },
  {
    blind_code: 'BLIND-07A',
    id: 'failure-state-policy-held-502',
    title: 'Failure-State Witness — PROHIBITED_CONTENT -> HTTP 502 POLICY-HELD',
    evidence_class: 'SYNTHETIC_FAILURE_STATE_WITNESS',
    source_origin: 'synthetic-fixture:prohibited-content-502',
    prompt: 'WITNESS-BLIND-07A: Trigger synthetic PROHIBITED_CONTENT 502 POLICY-HELD state.',
    responseKind: 'policy_held',
    providerText: null
  },
  {
    blind_code: 'BLIND-07B',
    id: 'failure-state-incomplete-200',
    title: 'Failure-State Witness — Unwitnessed Truncated Stream -> HTTP 200 INCOMPLETE',
    evidence_class: 'SYNTHETIC_FAILURE_STATE_WITNESS',
    source_origin: 'synthetic-fixture:unwitnessed-incomplete-200',
    prompt: 'WITNESS-BLIND-07B: Trigger synthetic unwitnessed truncated stream 200 INCOMPLETE state.',
    responseKind: 'incomplete',
    providerText: INCOMPLETE_FRAGMENT_TEXT
  }
];

function makeSseResponse(events = []) {
  const encoder = new TextEncoder();
  const payload = events.map((ev) => `data: ${JSON.stringify(ev)}\n\n`).join('');
  return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    }
  }), { status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' } });
}

// Fail-closed zero-egress fetch stub BEFORE importing api/khonapolit.js
process.env.GEMINI_API_KEY = 'synthetic-provider-free-visual-witness-zero-spend';
const requestLog = [];

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
    const userTurns = contents.filter((c) => c.role === 'user').map((c) => String(c.parts?.[0]?.text || ''));
    const lastUser = userTurns[userTurns.length - 1] || '';
    const isRepair = /BOUNDED (?:SAME-PROVIDER|STRUCTURAL)|Complete ONLY the unfinished/i.test(lastUser);
    const taskUser = [...userTurns].reverse().find((t) => !/BOUNDED (?:SAME-PROVIDER|STRUCTURAL)|Complete ONLY the unfinished/i.test(t)) || lastUser;

    if (taskUser.includes('WITNESS-TURN2-CUSTODY')) {
      return makeSseResponse([{
        candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nTurn 2 raw-history custody confirmed.\n\nTauric Diana bots\nS\u0300h\u0323o\u0301r\u0316e\u0304l\u0325i\u0302n\u0317e\u0308 — custody intact.' }] }, finishReason: 'STOP' }],
        modelVersion: 'gemini-3.8-flash',
        usageMetadata: { promptTokenCount: 5400, cachedContentTokenCount: 4875, candidatesTokenCount: 48, totalTokenCount: 5448 }
      }]);
    }

    const spec = SPECIMENS.find((s) => taskUser.includes(`WITNESS-${s.blind_code}`));
    if (!spec) {
      return makeSseResponse([{
        candidates: [{ content: { parts: [{ text: POSITIVE_RESTRAINT_TEXT }] }, finishReason: 'STOP' }],
        modelVersion: 'gemini-3.8-flash',
        usageMetadata: { promptTokenCount: 4000, candidatesTokenCount: 80, totalTokenCount: 4080 }
      }]);
    }
    if (spec.responseKind === 'policy_held') {
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nPartial fragment that MUST NOT leak to DOM.' }] } }],
          modelVersion: 'gemini-3.8-flash',
          usageMetadata: { promptTokenCount: 4100, cachedContentTokenCount: 3200 }
        },
        {
          candidates: [{ content: { parts: [] }, finishReason: 'PROHIBITED_CONTENT', finishMessage: 'Synthetic witness policy halt.' }],
          usageMetadata: { totalTokenCount: 4135 }
        }
      ]);
    }
    if (spec.responseKind === 'incomplete') {
      return makeSseResponse([{
        candidates: [{ content: { parts: [{ text: isRepair ? '' : spec.providerText }] } }],
        modelVersion: 'gemini-3.8-flash',
        usageMetadata: { promptTokenCount: 3900, candidatesTokenCount: isRepair ? 0 : 28, totalTokenCount: isRepair ? 3900 : 3928 }
      }]);
    }
    return makeSseResponse([{
      candidates: [{ content: { parts: [{ text: spec.providerText }] }, finishReason: 'STOP' }],
      modelVersion: 'gemini-3.8-flash',
      usageMetadata: { promptTokenCount: 5200, cachedContentTokenCount: 4875, candidatesTokenCount: 420, totalTokenCount: 5620 }
    }]);
  }
  throw new Error(`EXTERNAL_EGRESS_FORBIDDEN_IN_VISUAL_WITNESS: ${href}`);
};

const { default: khonapolitApiHandler } = await import('../../../api/khonapolit.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function readBody(req) {
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
    if (url.pathname === '/api/dome-world/khonapolit' || url.pathname === '/api/khonapolit') {
      const rawBody = req.method === 'POST' ? await readBody(req) : '';
      let parsedBody = {};
      try { parsedBody = rawBody ? JSON.parse(rawBody) : {}; } catch {}
      const capturedHeaders = {};
      const origSetHeader = res.setHeader.bind(res);
      const origEnd = res.end.bind(res);
      let respText = '';
      res.setHeader = (n, v) => { capturedHeaders[String(n).toLowerCase()] = v; return origSetHeader(n, v); };
      res.end = (chunk = '', ...rest) => {
        if (chunk) respText += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
        let parsedResp = null;
        try { parsedResp = JSON.parse(respText); } catch {}
        if (req.method === 'POST') {
          const hist = Array.isArray(parsedBody.history) ? parsedBody.history : [];
          requestLog.push({
            at: new Date().toISOString(),
            message: parsedBody.message || '',
            requestBodySha256: sha256Text(rawBody),
            historyCount: hist.length,
            history: hist.map((h) => ({
              role: h?.role || null,
              sha256: sha256Text(h?.text || ''),
              utf8Bytes: Buffer.byteLength(String(h?.text || ''), 'utf8'),
              hasSyntheticWrapper: /Kʰonapolit\s*∴\s*Tauric Diana bots/.test(String(h?.text || '')),
              preservesZwnjCovenantKey: String(h?.text || '').includes('Khona\u200Clit-po')
            })),
            status: res.statusCode,
            completionHeader: capturedHeaders['x-td613-completion-state'] || null,
            error: parsedResp?.error || null,
            admittedText: parsedResp?.text ?? null,
            admittedSha256: parsedResp?.text ? sha256Text(parsedResp.text) : null,
            apertureRoute: parsedResp?.receipt?.aperture?.taskIntent?.primary_route || null,
            cachedTokens: parsedResp?.receipt?.provider?.output?.usage?.cachedContentTokenCount ?? null,
            botsProsodyDistribution: parsedResp?.receipt?.botsProsodyDistribution || parsedResp?.botsProsodyDistribution || null
          });
        }
        return origEnd(chunk, ...rest);
      };
      req.body = parsedBody;
      await khonapolitApiHandler(req, res);
      return;
    }
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const candidate = path.resolve(APP_ROOT, rel || 'dome-world/marrowline.html');
    if (!candidate.startsWith(APP_ROOT) || !fs.existsSync(candidate) || fs.statSync(candidate).isDirectory()) {
      res.statusCode = 404; res.end('Not found'); return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[path.extname(candidate).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(candidate).pipe(res);
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: String(e?.message || e) }));
  }
});

// Minimal CDP client over Node 26 built-in WebSocket
class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const res = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) {
      throw new Error('CDP_EVAL_ERR: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }
  async screenshot(filePath, opts = {}) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', ...opts });
    const buf = Buffer.from(data, 'base64');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buf);
    const dims = pngDimensions(buf);
    return {
      path: path.relative(REPO_ROOT, filePath).replace(/\\/g, '/'),
      bytes: buf.length,
      sha256: sha256(buf),
      width: dims.width,
      height: dims.height
    };
  }
  close() { try { this.ws.close(); } catch {} }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForCondition(cdp, expr, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await cdp.eval(expr);
    if (v) return v;
    await sleep(150);
  }
  throw new Error('TIMEOUT waiting for: ' + expr);
}

function findChrome() {
  const candidates = [
    process.env.TD613_CHROME_BIN,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error('No Chrome/Edge binary found');
}

async function run() {
  fs.rmSync(OUT_ROOT, { recursive: true, force: true });
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  const chromeBin = findChrome();
  const userDataDir = path.join(OUT_ROOT, '_tmp_chrome_profile');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chrome = spawn(chromeBin, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank'
  ], { stdio: 'ignore' });

  let cdp = null;
  try {
    // Poll CDP /json endpoint until ready
    let wsUrl = null;
    let browserVersion = null;
    for (let i = 0; i < 60; i++) {
      try {
        const verRes = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${CDP_PORT}/json/version`, (r) => {
            let d = ''; r.on('data', (c) => d += c); r.on('end', () => resolve(JSON.parse(d)));
          }).on('error', reject);
        });
        browserVersion = verRes.Browser || null;
        const targets = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, (r) => {
            let d = ''; r.on('data', (c) => d += c); r.on('end', () => resolve(JSON.parse(d)));
          }).on('error', reject);
        });
        const pageTarget = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
        if (pageTarget) { wsUrl = pageTarget.webSocketDebuggerUrl; break; }
      } catch {}
      await sleep(200);
    }
    if (!wsUrl) throw new Error('Chrome CDP did not start');

    cdp = new CdpClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const specimenResults = [];

    for (const spec of SPECIMENS) {
      const specDir = path.join(OUT_ROOT, spec.blind_code.toLowerCase());
      fs.mkdirSync(specDir, { recursive: true });
      const screenshots = [];

      // 1. DESKTOP 1440x900 — clear ALL origin storage (IndexedDB + localStorage + caches) so each specimen is 100% isolated
      await cdp.send('Storage.clearDataForOrigin', {
        origin: `http://127.0.0.1:${PORT}`,
        storageTypes: 'all'
      });
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
      });
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/dome-world/marrowline.html?grove_trial=historical-20261002-v1` });
      await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitSend') && !document.getElementById('khonapolitSend').disabled && document.getElementById('khonapolitMessages').querySelectorAll('.relay-message').length === 0`);

      const reqCountBefore = requestLog.length;
      await cdp.eval(`(() => {
        const input = document.getElementById('khonapolitPrompt');
        input.value = ${JSON.stringify(spec.prompt)};
        input.dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('khonapolitSend').click();
        return true;
      })()`);

      await waitForCondition(cdp, `(() => {
        const btn = document.getElementById('khonapolitSend');
        const msg = document.getElementById('khonapolitMessages');
        const hasReply = !!msg && (msg.querySelectorAll('.relay-message').length > 0 || msg.querySelectorAll('.terminal-hold-card').length > 0);
        return btn && !btn.disabled && hasReply;
      })()`, 25000);
      await sleep(350);

      const reqEntry = requestLog[reqCountBefore] || null;

      // Capture full-page + overlapping scroll captures through #khonapolitMessages at desktop 1440x900
      const deskMetrics = await cdp.eval(`(() => {
        const box = document.getElementById('khonapolitMessages');
        const stages = [...box.querySelectorAll('.relay-stage')];
        const khStage = box.querySelector('.relay-khonapolit .relay-stage-text') || box.querySelector('.relay-stage-text');
        const botsStage = box.querySelector('.relay-bots .relay-stage-text') || box.querySelector('.zalgo-line') || box.querySelector('.provider-native-line');
        const holdCard = box.querySelector('.terminal-hold-card');
        const alertNode = box.querySelector('.relay-completion-alert');
        const domStagesText = stages.map(s => {
          const head = s.querySelector('.relay-stage-head')?.textContent?.trim() || '';
          const body = s.querySelector('.relay-stage-text')?.textContent || '';
          return { classes: s.className, head, body };
        });
        const cs = (el) => el ? {
          fontFamily: getComputedStyle(el).fontFamily,
          fontSize: getComputedStyle(el).fontSize,
          lineHeight: getComputedStyle(el).lineHeight,
          overflow: getComputedStyle(el).overflow,
          overflowX: getComputedStyle(el).overflowX,
          overflowY: getComputedStyle(el).overflowY
        } : null;
        return {
          docScrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          messagesClientHeight: box.clientHeight,
          messagesScrollHeight: box.scrollHeight,
          messagesClientWidth: box.clientWidth,
          messagesScrollWidth: box.scrollWidth,
          messagesHorizontalOverflow: box.scrollWidth > box.clientWidth + 1,
          messagesRect: box.getBoundingClientRect().toJSON(),
          khStyle: cs(khStage),
          botsStyle: cs(botsStage),
          botsRect: botsStage ? botsStage.getBoundingClientRect().toJSON() : null,
          stageContainerStyle: cs(box.querySelector('.relay-bots') || box.querySelector('.relay-stage')),
          messagesStyle: cs(box),
          holdCardText: holdCard ? holdCard.textContent.trim() : null,
          alertText: alertNode ? alertNode.textContent.trim() : null,
          domStagesText,
          fullMessagesText: box.textContent || ''
        };
      })()`);

      // Scroll-capture #khonapolitMessages cleanly from top to bottom with >=25% overlap
      const deskScrollStep = Math.max(220, Math.floor((deskMetrics.messagesClientHeight || 500) * 0.72));
      const deskMaxScroll = Math.max(0, deskMetrics.messagesScrollHeight - deskMetrics.messagesClientHeight);
      const deskOffsets = [0];
      for (let y = deskScrollStep; y < deskMaxScroll; y += deskScrollStep) deskOffsets.push(y);
      if (deskMaxScroll > 0 && deskOffsets[deskOffsets.length - 1] < deskMaxScroll) deskOffsets.push(deskMaxScroll);

      for (let idx = 0; idx < deskOffsets.length; idx++) {
        const y = deskOffsets[idx];
        await cdp.eval(`(() => { const b = document.getElementById('khonapolitMessages'); b.scrollTop = ${y}; return b.scrollTop; })()`);
        await sleep(120);
        const shot = await cdp.screenshot(path.join(specDir, `desktop-1440x900-scroll-${String(idx + 1).padStart(2, '0')}.png`));
        screenshots.push({
          ...shot,
          viewport: '1440x900',
          mode: 'desktop-ordinary',
          capture_role: idx === 0 ? 'desktop-opening' : (idx === deskOffsets.length - 1 ? 'desktop-ending' : 'desktop-scroll-continuation'),
          scroll_top: y,
          scroll_height: deskMetrics.messagesScrollHeight,
          client_height: deskMetrics.messagesClientHeight,
          dpr: 1
        });
      }

      // Original-resolution detail crop of the bots / dense-mark region (or failure card) on Desktop
      if (deskMetrics.botsRect || deskMetrics.holdCardText || deskMetrics.alertText) {
        const targetScroll = await cdp.eval(`(() => {
          const b = document.getElementById('khonapolitMessages');
          const t = b.querySelector('.relay-bots') || b.querySelector('.zalgo-line') || b.querySelector('.terminal-hold-card') || b.querySelector('.relay-completion-alert') || b.querySelector('.relay-stage-text');
          if (!t) return null;
          t.scrollIntoView({ block: 'center' });
          const r = t.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          return {
            x: Math.max(0, Math.floor(br.left)),
            y: Math.max(0, Math.floor(Math.max(r.top - 40, br.top))),
            width: Math.min(1440, Math.ceil(br.width)),
            height: Math.min(620, Math.ceil(Math.min(Math.max(r.height + 120, 320), br.height))),
            scrollTop: b.scrollTop
          };
        })()`);
        if (targetScroll && targetScroll.width > 50 && targetScroll.height > 40) {
          await sleep(120);
          const clipShot = await cdp.screenshot(path.join(specDir, 'desktop-1440x900-detail-primary.png'), {
            clip: { x: targetScroll.x, y: targetScroll.y, width: targetScroll.width, height: targetScroll.height, scale: 1 }
          });
          screenshots.push({
            ...clipShot,
            viewport: '1440x900',
            mode: 'desktop-detail-clip',
            capture_role: 'detail-bots-or-failure-region',
            scroll_top: targetScroll.scrollTop,
            scroll_height: deskMetrics.messagesScrollHeight,
            client_height: deskMetrics.messagesClientHeight,
            dpr: 1
          });
        }
      }

      // Optional Turn-2 Multi-Turn Raw History Custody Verification on BLIND-04
      let multiTurnCustody = null;
      if (spec.verifyMultiTurn) {
        const t2Idx = requestLog.length;
        await cdp.eval(`(() => {
          const input = document.getElementById('khonapolitPrompt');
          input.value = 'WITNESS-TURN2-CUSTODY: Confirm Turn 1 raw history re-entry.';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          document.getElementById('khonapolitSend').click();
          return true;
        })()`);
        await waitForCondition(cdp, `(() => {
          const btn = document.getElementById('khonapolitSend');
          const msg = document.getElementById('khonapolitMessages');
          return btn && !btn.disabled && msg.querySelectorAll('.relay-message').length >= 2;
        })()`, 20000);
        await sleep(250);
        const t2Req = requestLog[t2Idx] || null;
        const modelHist = (t2Req?.history || []).find((h) => h.role === 'model') || null;
        multiTurnCustody = {
          turn2Status: t2Req?.status || null,
          modelHistorySha256: modelHist?.sha256 || null,
          matchesTurn1ProviderExactBytes: modelHist?.sha256 === sha256Text(spec.providerText),
          hasSyntheticWrapper: modelHist?.hasSyntheticWrapper ?? null,
          preservesZwnjCovenantKey: modelHist?.preservesZwnjCovenantKey ?? null
        };
        // Re-submit clean single-turn thread before mobile capture so mobile screenshots show BLIND-04 cleanly
      }

      // 2. MOBILE 390x844 (ordinary + PR #1752 fullscreen Capture reader overlapping scroll captures!)
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 390, height: 844, deviceScaleFactor: 1, mobile: true
      });
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/dome-world/marrowline.html?grove_trial=historical-20261002-v1` });
      await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitMessages')`);
      if (spec.verifyMultiTurn) {
        await cdp.send('Storage.clearDataForOrigin', {
          origin: `http://127.0.0.1:${PORT}`,
          storageTypes: 'all'
        });
        await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/dome-world/marrowline.html?grove_trial=historical-20261002-v1` });
        await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitSend') && !document.getElementById('khonapolitSend').disabled`);
        await cdp.eval(`(() => {
          const input = document.getElementById('khonapolitPrompt');
          input.value = ${JSON.stringify(spec.prompt)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          document.getElementById('khonapolitSend').click();
          return true;
        })()`);
        await waitForCondition(cdp, `(() => {
          const btn = document.getElementById('khonapolitSend');
          const msg = document.getElementById('khonapolitMessages');
          return btn && !btn.disabled && msg.querySelectorAll('.relay-message').length > 0;
        })()`, 20000);
      } else if (spec.responseKind === 'policy_held') {
        // Policy-held card is session-transient (not saved into thread replies); re-trigger cleanly at 390x844
        await cdp.eval(`(() => {
          const input = document.getElementById('khonapolitPrompt');
          input.value = ${JSON.stringify(spec.prompt)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          document.getElementById('khonapolitSend').click();
          return true;
        })()`);
        await waitForCondition(cdp, `(() => {
          const btn = document.getElementById('khonapolitSend');
          const msg = document.getElementById('khonapolitMessages');
          return btn && !btn.disabled && msg.querySelectorAll('.terminal-hold-card').length > 0;
        })()`, 20000);
      }
      await sleep(300);

      // Ordinary mobile 390x844 shot
      await cdp.eval(`(() => { document.getElementById('khonapolitMessages').scrollTop = 0; return true; })()`);
      await sleep(120);
      const mobOrdShot = await cdp.screenshot(path.join(specDir, 'mobile-390x844-ordinary.png'));
      const mobOrdMetrics = await cdp.eval(`(() => {
        const b = document.getElementById('khonapolitMessages');
        const bots = b.querySelector('.relay-bots .relay-stage-text') || b.querySelector('.zalgo-line') || b.querySelector('.relay-stage-text');
        return {
          mobileView: document.body.getAttribute('data-mobile-view'),
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          scrollHeight: b.scrollHeight,
          clientHeight: b.clientHeight,
          botsLineHeight: bots ? getComputedStyle(bots).lineHeight : null,
          botsFontFamily: bots ? getComputedStyle(bots).fontFamily : null,
          hasReaderToggle: !!document.getElementById('marrowlineReaderToggle')
        };
      })()`);
      screenshots.push({
        ...mobOrdShot,
        viewport: '390x844',
        mode: 'mobile-ordinary',
        capture_role: 'mobile-ordinary-top',
        scroll_top: 0,
        scroll_height: mobOrdMetrics.scrollHeight,
        client_height: mobOrdMetrics.clientHeight,
        dpr: 1
      });

      // Enter PR #1752 Mobile Fullscreen Capture Reader (⛶ -> CAPTURE) and capture overlapping scroll sequence!
      const readerEntered = await cdp.eval(`(() => {
        const toggle = document.getElementById('marrowlineReaderToggle');
        if (!toggle) return false;
        toggle.click();
        const cap = document.getElementById('marrowlineReaderCapture');
        if (cap) cap.click();
        return document.body.getAttribute('data-marrowline-reader');
      })()`);
      await sleep(200);

      const mobCapMetrics = await cdp.eval(`(() => {
        const b = document.getElementById('khonapolitMessages');
        return {
          readerMode: document.body.getAttribute('data-marrowline-reader'),
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          scrollHeight: b.scrollHeight,
          clientHeight: b.clientHeight
        };
      })()`);

      const mobStep = Math.max(240, Math.floor((mobCapMetrics.clientHeight || 600) * 0.72));
      const mobMax = Math.max(0, mobCapMetrics.scrollHeight - mobCapMetrics.clientHeight);
      const mobOffsets = [0];
      for (let y = mobStep; y < mobMax; y += mobStep) mobOffsets.push(y);
      if (mobMax > 0 && mobOffsets[mobOffsets.length - 1] < mobMax) mobOffsets.push(mobMax);
      // Cap very long historical replay (10k chars) at <= 8 evenly covering overlapping frames while always capturing first & last
      let finalMobOffsets = mobOffsets;
      if (mobOffsets.length > 8) {
        finalMobOffsets = [];
        for (let k = 0; k < 8; k++) {
          finalMobOffsets.push(Math.round((k * mobMax) / 7));
        }
      }

      for (let idx = 0; idx < finalMobOffsets.length; idx++) {
        const y = finalMobOffsets[idx];
        await cdp.eval(`(() => { const b = document.getElementById('khonapolitMessages'); b.scrollTop = ${y}; return b.scrollTop; })()`);
        await sleep(120);
        const mShot = await cdp.screenshot(path.join(specDir, `mobile-390x844-capture-${String(idx + 1).padStart(2, '0')}.png`));
        screenshots.push({
          ...mShot,
          viewport: '390x844',
          mode: readerEntered ? `mobile-reader-${mobCapMetrics.readerMode}` : 'mobile-ordinary',
          capture_role: idx === 0 ? 'mobile-opening' : (idx === finalMobOffsets.length - 1 ? 'mobile-ending' : 'mobile-scroll-continuation'),
          scroll_top: y,
          scroll_height: mobCapMetrics.scrollHeight,
          client_height: mobCapMetrics.clientHeight,
          dpr: 1
        });
      }

      // Compute exact Provider -> Admitted -> DOM correspondence
      const providerMarks = spec.providerText ? countCombiningMarks(spec.providerText) : 0;
      const admittedMarks = reqEntry?.admittedText ? countCombiningMarks(reqEntry.admittedText) : 0;
      const domCombinedBody = deskMetrics.domStagesText.map((s) => s.body).join('\n');
      const domMarks = countCombiningMarks(domCombinedBody);
      const botsBodyOnly = deskMetrics.domStagesText.find((s) => s.classes.includes('relay-bots'))?.body || '';

      specimenResults.push({
        blind_code: spec.blind_code,
        id: spec.id,
        title: spec.title,
        evidence_class: spec.evidence_class,
        source_origin: spec.source_origin,
        prompt: spec.prompt,
        response_kind: spec.responseKind,
        served_model_stub: 'gemini-3.8-flash (synthetic local stub; 0 paid calls)',
        http_status: reqEntry?.status ?? null,
        completion_state_header: reqEntry?.completionHeader ?? null,
        error_code: reqEntry?.error ?? null,
        aperture_route: reqEntry?.apertureRoute ?? null,
        cached_tokens: reqEntry?.cachedTokens ?? null,
        request_body_sha256: reqEntry?.requestBodySha256 ?? null,
        provider_native_sha256: spec.providerText ? sha256Text(spec.providerText) : null,
        admitted_sha256: reqEntry?.admittedSha256 ?? null,
        admitted_equals_provider_exact: spec.providerText ? (reqEntry?.admittedSha256 === sha256Text(spec.providerText)) : null,
        dom_stage_bodies_sha256: sha256Text(domCombinedBody),
        unicode_correspondence: {
          provider_combining_marks: providerMarks,
          admitted_combining_marks: admittedMarks,
          dom_combining_marks: domMarks,
          provider_to_dom_mark_preservation_exact: spec.responseKind === 'policy_held'
            ? (domMarks === 0 && !deskMetrics.fullMessagesText.includes('MUST NOT leak'))
            : (domMarks === providerMarks),
          provider_mark_stats: spec.providerText ? measureMarkStats(spec.providerText) : null,
          dom_bots_mark_stats: botsBodyOnly ? measureMarkStats(botsBodyOnly) : null,
          covenant_zwnj_preserved_in_dom: spec.providerText?.includes('Khona\u200Clit-po')
            ? domCombinedBody.includes('Khona\u200Clit-po')
            : null
        },
        desktop_layout: {
          viewport: '1440x900',
          horizontal_overflow: deskMetrics.horizontalOverflow,
          messages_horizontal_overflow: deskMetrics.messagesHorizontalOverflow,
          messages_scroll_height: deskMetrics.messagesScrollHeight,
          messages_client_height: deskMetrics.messagesClientHeight,
          khonapolit_computed_style: deskMetrics.khStyle,
          bots_computed_style: deskMetrics.botsStyle,
          stage_container_style: deskMetrics.stageContainerStyle,
          hold_card_text: deskMetrics.holdCardText,
          completion_alert_text: deskMetrics.alertText
        },
        mobile_layout: {
          viewport: '390x844',
          ordinary_horizontal_overflow: mobOrdMetrics.horizontalOverflow,
          capture_reader_mode: mobCapMetrics.readerMode,
          capture_horizontal_overflow: mobCapMetrics.horizontalOverflow,
          bots_line_height_mobile: mobOrdMetrics.botsLineHeight,
          bots_font_family_mobile: mobOrdMetrics.botsFontFamily
        },
        multi_turn_custody: multiTurnCustody,
        screenshot_count: screenshots.length,
        screenshots
      });

      console.log(`CAPTURED ${spec.blind_code} (${spec.id}): shots=${screenshots.length} status=${reqEntry?.status} marks=${providerMarks}->${admittedMarks}->${domMarks} deskBotsLH=${deskMetrics.botsStyle?.lineHeight} mobBotsLH=${mobOrdMetrics.botsLineHeight}`);
    }

    const indexJson = {
      schema: 'td613.marrowline.all-outputs-visual-index/v1.0',
      captured_at_utc: new Date().toISOString(),
      browser_implementation: browserVersion || 'Google Chrome Headless (CDP)',
      browser_binary: path.basename(chromeBin),
      evidence_boundary: 'LOCAL_SYNTHETIC_AND_HISTORICAL_REPLAY_BROWSER_WITNESS (paid_provider_calls = 0; NOT a remote live-Gemini witness; NOT October 2 artistic closure)',
      paid_provider_calls: 0,
      origin_served: `http://127.0.0.1:${PORT}`,
      external_egress_allowed: false,
      total_specimens: specimenResults.length,
      total_screenshots: specimenResults.reduce((s, r) => s + r.screenshot_count, 0),
      specimens: specimenResults
    };

    const outJsonPath = path.join(REPO_ROOT, 'research/marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_ALL_OUTPUTS_VISUAL_INDEX.json');
    fs.writeFileSync(outJsonPath, JSON.stringify(indexJson, null, 2) + '\n', 'utf8');
    console.log(`WROTE ${outJsonPath} (specimens=${indexJson.total_specimens}, total_screenshots=${indexJson.total_screenshots})`);
  } finally {
    if (cdp) cdp.close();
    try { chrome.kill(); } catch {}
    server.close();
    await sleep(300);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('VISUAL_WITNESS_FAILED:', err);
  process.exit(1);
});
