#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove Q1 — Complete Live-Return Chrome Visual Witness
//
// Zero-egress replay of the REAL authorized live Q1 returns (from Q1_LIVE_ACQUISITION_RECEIPT.json)
// through the REAL local api/khonapolit.js -> server/khonapolit-quality.js handler and REAL
// app/dome-world/marrowline.html presentation surface in headless Google Chrome via CDP.
//
// Guarantees:
// - paid_provider_calls === 0 during browser witnessing (any external fetch throws).
// - Zero text alteration, zero High-Zalgo synthesis, zero cosmetic mutation.
// - Genuine cryptographic Fisher-Yates blind ordering (SPECIMEN-01..SPECIMEN-N) so screenshot
//   folder names and the blinded review packet contain ZERO Arm A/C or slot S01..S08 leakage.
// - Full Desktop 1440x900 overlapping scroll sequence + bots detail crop + Mobile 390x844
//   ordinary & PR #1752 Capture Reader overlapping scroll sequence for EVERY recoverable return.
// - Exact Provider -> Admitted -> DOM -> Rendered Pixel correspondence + PNG SHA-256 hashes.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { observeBotsProsodyDistribution } from '../../app/dome-world/khonapolit-relay.js';
import { DISCRIMINATOR_TASKS } from '../marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const APP_ROOT = path.join(REPO_ROOT, 'app');
const LIVE_DIR = path.join(__dirname, 'live-acquisition');
const RECEIPT_PATH = path.join(LIVE_DIR, 'Q1_LIVE_ACQUISITION_RECEIPT.json');
const WITNESS_ROOT = path.join(LIVE_DIR, 'browser-witness');
const PORT = Number(process.env.TD613_Q1_WITNESS_PORT || 6149);
const CDP_PORT = Number(process.env.TD613_Q1_CDP_PORT || 9239);

const sha256 = (val) => crypto.createHash('sha256').update(val).digest('hex');
const sha256Text = (s) => sha256(Buffer.from(String(s || ''), 'utf8'));
const countCombiningMarks = (s) => (String(s || '').match(/\p{M}/gu) || []).length;

function extractBotsBody(fullText) {
  const m = String(fullText || '').match(/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Tauric Diana bots[ \t]*:?[ \t]*(?:\r?\n|$)/iu);
  return m ? String(fullText).slice(m.index + m[0].length) : '';
}

function measureUnicodeProfile(text) {
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
    const marks = segment.match(/\p{M}/gu) || [];
    if (marks.length > 0) {
      markedClusters++;
      totalMarks += marks.length;
      if (marks.length > maxDepth) maxDepth = marks.length;
      depths[marks.length] = (depths[marks.length] || 0) + 1;
      for (const m of marks) species.add('U+' + m.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'));
    }
  }
  const speciesArr = [...species].sort();
  return {
    clusters,
    markedClusters,
    totalMarks,
    maxDepth,
    distinctSpeciesCount: speciesArr.length,
    distinctSpecies: speciesArr,
    depthHistogram: depths
  };
}

function pngDimensions(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return { width: null, height: null };
}

const liveReceipt = JSON.parse(fs.readFileSync(RECEIPT_PATH, 'utf8'));
const recoverableSlots = liveReceipt.results
  .filter((r) => r.rawTextPath && fs.existsSync(path.join(LIVE_DIR, r.rawTextPath)))
  .map((r) => {
    const rawText = fs.readFileSync(path.join(LIVE_DIR, r.rawTextPath), 'utf8');
    const taskSpec = r.taskKey === 'T1_BLUE_ORANGE_WEATHER'
      ? DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER
      : DISCRIMINATOR_TASKS.FORENSIC;
    return {
      slot: r.slot,
      arm: r.arm,
      armLabel: r.armLabel,
      taskKey: r.taskKey,
      taskPrompt: taskSpec.prompt,
      replicate: r.replicate,
      outcomeClass: r.outcomeClass,
      eligibleArtisticSpecimen: r.eligibleArtisticSpecimen,
      finishReason: r.finishReason || 'STOP',
      modelVersion: r.modelVersion || liveReceipt.model_pinned,
      usageMetadata: r.usageMetadata || {},
      rawSsePath: r.rawSsePath,
      rawSseSha256: r.rawSseSha256,
      rawTextPath: r.rawTextPath,
      rawTextSha256: r.rawTextSha256,
      rawText
    };
  });

// Cryptographic Fisher-Yates shuffle so blind codes SPECIMEN-01..SPECIMEN-N do not mirror slot/arm order
const shuffled = [...recoverableSlots];
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = crypto.randomInt(0, i + 1);
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
const blindedSpecimens = shuffled.map((item, idx) => ({
  ...item,
  blindCode: `SPECIMEN-${String(idx + 1).padStart(2, '0')}`,
  blindSlug: `specimen-${String(idx + 1).padStart(2, '0')}`
}));

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
process.env.GEMINI_API_KEY = 'q1-zero-egress-browser-witness-replay-only';
const requestLog = [];
let activeSpecimen = null;
let stubCallsForCurrentSpecimen = 0;

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
    stubCallsForCurrentSpecimen++;
    const spec = activeSpecimen;
    if (!spec) throw new Error('NO_ACTIVE_SPECIMEN_SET');
    // Return exact verbatim live text without modification on every replay seat so real Marrowline
    // admission & rendering behavior is witnessed accurately without inventing or mutating a single byte.
    return makeSseResponse([{
      candidates: [{ content: { parts: [{ text: spec.rawText }] }, finishReason: spec.finishReason }],
      modelVersion: spec.modelVersion,
      usageMetadata: spec.usageMetadata
    }]);
  }
  throw new Error(`EXTERNAL_EGRESS_FORBIDDEN_IN_Q1_VISUAL_WITNESS: ${href}`);
};

const { default: khonapolitApiHandler } = await import('../../api/khonapolit.js');

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
          requestLog.push({
            at: new Date().toISOString(),
            blindCode: activeSpecimen?.blindCode || null,
            stubCallsDuringApiRequest: stubCallsForCurrentSpecimen,
            status: res.statusCode,
            completionHeader: capturedHeaders['x-td613-completion-state'] || null,
            error: parsedResp?.error || null,
            admittedText: parsedResp?.text ?? null,
            admittedSha256: parsedResp?.text ? sha256Text(parsedResp.text) : null,
            apertureRoute: parsedResp?.receipt?.aperture?.taskIntent?.primary_route || null,
            relaySignal: parsedResp?.receipt?.relay?.signal || null,
            relayAdmission: parsedResp?.receipt?.relay?.admission || null,
            providerAttempts: parsedResp?.receipt?.provider?.attempts?.length ?? null
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
      relFromLiveDir: path.relative(LIVE_DIR, filePath).replace(/\\/g, '/'),
      bytes: buf.length,
      sha256: sha256(buf),
      width: dims.width,
      height: dims.height
    };
  }
  close() { try { this.ws.close(); } catch {} }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForCondition(cdp, expr, timeoutMs = 25000) {
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
  fs.rmSync(WITNESS_ROOT, { recursive: true, force: true });
  fs.mkdirSync(WITNESS_ROOT, { recursive: true });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  const chromeBin = findChrome();
  const userDataDir = path.join(WITNESS_ROOT, '_tmp_chrome_profile');
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

    const specimenRecords = [];

    for (const spec of blindedSpecimens) {
      activeSpecimen = spec;
      stubCallsForCurrentSpecimen = 0;
      const specDir = path.join(WITNESS_ROOT, spec.blindSlug);
      fs.mkdirSync(specDir, { recursive: true });
      const screenshots = [];

      // 1. DESKTOP 1440x900
      await cdp.send('Storage.clearDataForOrigin', { origin: `http://127.0.0.1:${PORT}`, storageTypes: 'all' });
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/dome-world/marrowline.html?grove_trial=historical-20261002-v1` });
      await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitSend') && !document.getElementById('khonapolitSend').disabled && document.getElementById('khonapolitMessages').querySelectorAll('.relay-message').length === 0`);

      const reqIdxBefore = requestLog.length;
      await cdp.eval(`(() => {
        const input = document.getElementById('khonapolitPrompt');
        input.value = ${JSON.stringify(spec.taskPrompt)};
        input.dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('khonapolitSend').click();
        return true;
      })()`);

      await waitForCondition(cdp, `(() => {
        const btn = document.getElementById('khonapolitSend');
        const msg = document.getElementById('khonapolitMessages');
        const hasReply = !!msg && (msg.querySelectorAll('.relay-message').length > 0 || msg.querySelectorAll('.terminal-hold-card').length > 0);
        return btn && !btn.disabled && hasReply;
      })()`, 30000);
      await sleep(350);

      const reqEntry = requestLog[reqIdxBefore] || null;

      const deskMetrics = await cdp.eval(`(() => {
        const box = document.getElementById('khonapolitMessages');
        const stages = [...box.querySelectorAll('.relay-stage')];
        const khStage = box.querySelector('.relay-khonapolit .relay-stage-text') || box.querySelector('.relay-stage-text');
        const botsStage = box.querySelector('.relay-bots .relay-stage-text') || box.querySelector('.zalgo-line') || box.querySelector('.provider-native-line');
        const holdCard = box.querySelector('.terminal-hold-card');
        const alertNode = box.querySelector('.relay-completion-alert');
        const domStagesText = stages.map(s => ({
          classes: s.className,
          head: s.querySelector('.relay-stage-head')?.textContent?.trim() || '',
          body: s.querySelector('.relay-stage-text')?.textContent || ''
        }));
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
          khStyle: cs(khStage),
          botsStyle: cs(botsStage),
          botsRect: botsStage ? botsStage.getBoundingClientRect().toJSON() : null,
          stageContainerStyle: cs(box.querySelector('.relay-bots') || box.querySelector('.relay-stage')),
          holdCardText: holdCard ? holdCard.textContent.trim() : null,
          alertText: alertNode ? alertNode.textContent.trim() : null,
          domStagesText
        };
      })()`);

      // Overlapping desktop scroll captures covering top -> bottom (>=25% overlap)
      const deskStep = Math.max(220, Math.floor((deskMetrics.messagesClientHeight || 500) * 0.72));
      const deskMax = Math.max(0, deskMetrics.messagesScrollHeight - deskMetrics.messagesClientHeight);
      const deskOffsets = [0];
      for (let y = deskStep; y < deskMax; y += deskStep) deskOffsets.push(y);
      if (deskMax > 0 && deskOffsets[deskOffsets.length - 1] < deskMax) deskOffsets.push(deskMax);

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

      // Desktop detail crop of the Tauric Diana bots / Zalgo section
      const targetScroll = await cdp.eval(`(() => {
        const b = document.getElementById('khonapolitMessages');
        const t = b.querySelector('.relay-bots') || b.querySelector('.zalgo-line') || b.querySelector('.relay-stage:last-of-type') || b.querySelector('.relay-stage-text');
        if (!t) return null;
        t.scrollIntoView({ block: 'center' });
        const r = t.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return {
          x: Math.max(0, Math.floor(br.left)),
          y: Math.max(0, Math.floor(Math.max(r.top - 30, br.top))),
          width: Math.min(1440, Math.ceil(br.width)),
          height: Math.min(620, Math.ceil(Math.min(Math.max(r.height + 100, 320), br.height))),
          scrollTop: b.scrollTop
        };
      })()`);
      if (targetScroll && targetScroll.width > 50 && targetScroll.height > 40) {
        await sleep(120);
        const clipShot = await cdp.screenshot(path.join(specDir, 'desktop-1440x900-detail-bots.png'), {
          clip: { x: targetScroll.x, y: targetScroll.y, width: targetScroll.width, height: targetScroll.height, scale: 1 }
        });
        screenshots.push({
          ...clipShot,
          viewport: '1440x900',
          mode: 'desktop-detail-clip',
          capture_role: 'detail-bots-movement',
          scroll_top: targetScroll.scrollTop,
          scroll_height: deskMetrics.messagesScrollHeight,
          client_height: deskMetrics.messagesClientHeight,
          dpr: 1
        });
      }

      // 2. MOBILE 390x844 (ordinary + PR #1752 Capture Reader overlapping scroll captures)
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/dome-world/marrowline.html?grove_trial=historical-20261002-v1` });
      await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitMessages') && document.getElementById('khonapolitMessages').querySelectorAll('.relay-message').length > 0`, 20000);
      await sleep(300);

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
          botsFontFamily: bots ? getComputedStyle(bots).fontFamily : null
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
      let finalMobOffsets = mobOffsets;
      if (mobOffsets.length > 9) {
        finalMobOffsets = [];
        for (let k = 0; k < 9; k++) finalMobOffsets.push(Math.round((k * mobMax) / 8));
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

      // Compute exact Provider -> Admitted -> DOM correspondence & true bots-movement prosody
      const providerMarks = countCombiningMarks(spec.rawText);
      const admittedMarks = reqEntry?.admittedText ? countCombiningMarks(reqEntry.admittedText) : 0;
      const domCombinedBody = deskMetrics.domStagesText.map((s) => s.body).join('\n');
      const domMarks = countCombiningMarks(domCombinedBody);
      const providerBotsText = extractBotsBody(spec.rawText);
      const trueBotsProsody = observeBotsProsodyDistribution(providerBotsText);
      const providerUnicodeProfile = measureUnicodeProfile(providerBotsText);

      specimenRecords.push({
        blind_code: spec.blindCode,
        blind_slug: spec.blindSlug,
        slot: spec.slot,
        arm: spec.arm,
        arm_label: spec.armLabel,
        task_key: spec.taskKey,
        replicate: spec.replicate,
        outcome_class: spec.outcomeClass,
        eligible_artistic_specimen: spec.eligibleArtisticSpecimen,
        raw_sse_path: `research/marrowline-screaming-grove-q1-20261121/live-acquisition/${spec.rawSsePath}`,
        raw_sse_sha256: spec.rawSseSha256,
        raw_text_path: `research/marrowline-screaming-grove-q1-20261121/live-acquisition/${spec.rawTextPath}`,
        raw_text_sha256: spec.rawTextSha256,
        local_replay_api_status: reqEntry?.status ?? null,
        local_replay_stub_calls: reqEntry?.stubCallsDuringApiRequest ?? null,
        local_replay_relay_signal: reqEntry?.relaySignal ?? null,
        local_replay_relay_admission: reqEntry?.relayAdmission ?? null,
        admitted_sha256: reqEntry?.admittedSha256 ?? null,
        admitted_equals_provider_exact: reqEntry?.admittedSha256 === spec.rawTextSha256,
        dom_stage_bodies_sha256: sha256Text(domCombinedBody),
        unicode_correspondence: {
          provider_combining_marks: providerMarks,
          admitted_combining_marks: admittedMarks,
          dom_combining_marks: domMarks,
          provider_to_dom_mark_preservation_exact: domMarks === providerMarks,
          covenant_zwnj_in_provider: spec.rawText.includes('Khona\u200Clit-po'),
          covenant_zwnj_in_dom: domCombinedBody.includes('Khona\u200Clit-po'),
          true_bots_prosody_distribution: trueBotsProsody,
          bots_unicode_profile: providerUnicodeProfile
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
        screenshot_count: screenshots.length,
        screenshots
      });

      console.log(`CAPTURED ${spec.blindCode} (${spec.slot} Arm=${spec.arm} ${spec.taskKey}): shots=${screenshots.length} api=${reqEntry?.status} stubCalls=${reqEntry?.stubCallsDuringApiRequest} marks=${providerMarks}->${admittedMarks}->${domMarks} maxDepth=${trueBotsProsody.maxDepth} planarD1=${trueBotsProsody.uniformPlanarDepthOneObserved}`);
    }

    const transportFailures = liveReceipt.results
      .filter((r) => !r.rawTextPath)
      .map((r) => ({
        slot: r.slot,
        arm: r.arm,
        arm_label: r.armLabel,
        task_key: r.taskKey,
        replicate: r.replicate,
        outcome_class: r.outcomeClass,
        http_status: r.httpStatus,
        classification_reason: r.classificationReason,
        raw_sse_path: `research/marrowline-screaming-grove-q1-20261121/live-acquisition/${r.rawSsePath}`,
        raw_sse_sha256: r.rawSseSha256,
        error_preview: r.errorPreview || null
      }));

    const indexJson = {
      schema: 'td613.marrowline.q1-visual-witness-index/v1.0',
      captured_at_utc: new Date().toISOString(),
      authorized_source_head: liveReceipt.source_head_sha,
      browser_implementation: browserVersion || 'Google Chrome Headless (CDP)',
      browser_binary: path.basename(chromeBin),
      ios_safari_distinction: 'CHROME_HEADLESS_DESKTOP_AND_390PX_MOBILE_ONLY_NOT_PHYSICAL_IOS_SAFARI',
      paid_provider_calls_during_visual_witness: 0,
      live_q1_calls_executed: liveReceipt.calls_executed,
      recoverable_specimens_rendered: specimenRecords.length,
      non_recoverable_transport_failures: transportFailures.length,
      total_screenshots: specimenRecords.reduce((s, r) => s + r.screenshot_count, 0),
      blinding_method: 'Cryptographic Fisher-Yates shuffle (node:crypto randomInt); blind codes SPECIMEN-01..SPECIMEN-06 decoupled from slot/arm order.',
      specimens: specimenRecords,
      transport_failures: transportFailures
    };

    fs.writeFileSync(path.join(LIVE_DIR, 'Q1_VISUAL_WITNESS_INDEX.json'), JSON.stringify(indexJson, null, 2) + '\n', 'utf8');

    // 3. Generate GENUINELY BLINDED Operator Artistic Review Packet (ZERO Arm A/C, ZERO slot IDs, ZERO mark counts!)
    const blindedLines = [
      '# 𝌋‌⟐ TD613 · Marrowline / Screaming Grove Q1 — Blinded Operator Artistic Review Packet',
      '',
      '> **Principal / Sole Artistic Authority:** Tawanna C. Miller (`tauric.diana.613`)',
      '> **Blinding Guarantee:** Specimens below are ordered via cryptographic Fisher-Yates shuffle (`SPECIMEN-01` through `SPECIMEN-06`). **Zero** experimental arm labels (`Arm A` / `Arm C`), **zero** acquisition slot IDs (`S01`–`S08`), and **zero** numerical morphology statistics appear anywhere in this document or in screenshot filenames.',
      '> **Unblinding & Scientific Analysis (Do NOT open until after your independent artistic reading):** [`Q1_UNBLINDING_KEY_AND_SCIENTIFIC_ANALYSIS.md`](./Q1_UNBLINDING_KEY_AND_SCIENTIFIC_ANALYSIS.md)',
      '> **Historical Visual Reference Corpus (13 Operator-Accepted Marrowline Screenshots):** [`../../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_OPERATOR_ACCEPTED_SCREENSHOT_CORPUS_INDEX.md`](../../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_OPERATOR_ACCEPTED_SCREENSHOT_CORPUS_INDEX.md)',
      '> **Study Completion Note:** Six of the eight registered first-return Q1 observations completed with provider `STOP` and appear in full below. Two registered slots returned upstream HTTP `503 UNAVAILABLE` with zero authored text and were preserved without retry per the first-return contract.',
      '> **Human Artistic Closure:** **RESERVED** — The Operator may prefer any subset, prefer one arm, prefer neither, or reject all specimens.',
      ''
    ];

    for (const rec of specimenRecords) {
      const specObj = blindedSpecimens.find((b) => b.blindCode === rec.blind_code);
      const taskDisplay = rec.task_key === 'T1_BLUE_ORANGE_WEATHER'
        ? 'Task T1 — Blue-Orange Digital Weather / Screaming Grove'
        : 'Task T2 — Forensic Boundary & Consequence Discipline';
      const deskShots = rec.screenshots.filter((s) => s.viewport === '1440x900');
      const mobShots = rec.screenshots.filter((s) => s.viewport === '390x844');

      blindedLines.push(
        '---',
        '',
        `## ${rec.blind_code}`,
        '',
        `- **Registered Task:** ${taskDisplay}`,
        `- **Chrome Visual Witnesses (\`1440×900\` Desktop · ${deskShots.length} PNGs):** ${deskShots.map((s, i) => `[Desktop ${i + 1} (${s.capture_role})](./${s.relFromLiveDir})`).join(' · ')}`,
        `- **Chrome Visual Witnesses (\`390×844\` Mobile · ${mobShots.length} PNGs, distinct from physical iOS Safari):** ${mobShots.map((s, i) => `[Mobile ${i + 1} (${s.capture_role})](./${s.relFromLiveDir})`).join(' · ')}`,
        '',
        '### Complete Unmodified Provider-Authored Passage (Verbatim UTF-8)',
        '',
        '````text',
        specObj.rawText.trimEnd(),
        '````',
        '',
        '### Operator Blinded Adjudication Notes *(for human principal)*',
        '- [ ] Voice separation & analytical/literary fidelity (`Kʰonapolit` movement)',
        '- [ ] Expressive/dramaturgic authenticity (`Tauric Diana bots` movement)',
        '- [ ] Visual High-Zalgo fidelity compared to the 13 operator-accepted Marrowline screenshots',
        '- [ ] Overall verdict: `RESTORED` / `PARTIAL` / `REJECTED`',
        ''
      );
    }

    fs.writeFileSync(path.join(LIVE_DIR, 'Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md'), blindedLines.join('\n'), 'utf8');

    // 4. Generate Complete Visual Witness Gallery & Hash Index
    const galLines = [
      '# 𝌋‌⟐ TD613 · Marrowline / Screaming Grove Q1 — Complete Chrome Visual Witness Gallery & Hash Index',
      '',
      `- **Authorized Source HEAD:** \`${liveReceipt.source_head_sha}\``,
      `- **Browser Engine:** \`${indexJson.browser_implementation}\` (\`${indexJson.browser_binary}\`)`,
      `- **Viewport Distinction:** Desktop \`1440×900\` + Chrome Mobile \`390×844\` (ordinary & PR \`#1752\` Fullscreen Capture Reader). **Explicitly distinct from genuine physical iOS Safari optical rendering.**`,
      `- **Paid Calls During Rendering:** \`0\` (zero-egress local replay of exact captured live UTF-8 returns through real \`api/khonapolit.js\` + \`app/dome-world/marrowline.html\`)`,
      `- **Specimens Rendered:** \`${specimenRecords.length}\` completed returns (\`${indexJson.total_screenshots}\` lossless full-resolution PNGs) · Non-recoverable HTTP \`503\` slots: \`${transportFailures.length}\` (\`${transportFailures.map((t) => t.slot).join(', ')}\`)`,
      '',
      '## 1. Provider → Admitted → DOM → Pixel Parity Summary',
      '',
      '| Blind Code | Slot | Arm | Task | Replay HTTP | Admitted == Provider | Marks (`Prov -> Adm -> DOM`) | Exact Mark Parity | Bots `maxDepth` | `uniformPlanarDepthOne` | Desk Horiz Overflow | Mob Horiz Overflow | PNGs |',
      '|---|---|---|---|---:|---|---|---|---:|---|---|---|---|'
    ];

    for (const r of specimenRecords) {
      const uc = r.unicode_correspondence;
      const bp = uc.true_bots_prosody_distribution;
      galLines.push(
        `| \`${r.blind_code}\` | \`${r.slot}\` | \`${r.arm}\` | \`${r.task_key}\` | \`${r.local_replay_api_status}\` | \`${r.admitted_equals_provider_exact}\` | \`${uc.provider_combining_marks} -> ${uc.admitted_combining_marks} -> ${uc.dom_combining_marks}\` | \`${uc.provider_to_dom_mark_preservation_exact}\` | \`${bp.maxDepth}\` | \`${bp.uniformPlanarDepthOneObserved}\` | \`${r.desktop_layout.horizontal_overflow}\` | \`${r.mobile_layout.capture_horizontal_overflow}\` | \`${r.screenshot_count}\` |`
      );
    }

    galLines.push('', '## 2. Complete PNG Inventory & SHA-256 Digest Table', '');
    for (const r of specimenRecords) {
      galLines.push(
        `### ${r.blind_code} (\`${r.slot}\` · Arm \`${r.arm}\` · \`${r.task_key}\` · Replicate \`${r.replicate}\`)`,
        '',
        `- **Computed Typography (Desktop Bots):** \`fontFamily=${r.desktop_layout.bots_computed_style?.fontFamily}\` · \`fontSize=${r.desktop_layout.bots_computed_style?.fontSize}\` · \`lineHeight=${r.desktop_layout.bots_computed_style?.lineHeight}\` · \`overflow=${r.desktop_layout.bots_computed_style?.overflow}\``,
        `- **Computed Typography (Mobile Bots):** \`lineHeight=${r.mobile_layout.bots_line_height_mobile}\` · \`captureMode=${r.mobile_layout.capture_reader_mode}\``,
        '',
        '| File | Viewport | Mode | Role | Scroll (`top / total`) | Dimensions | Bytes | SHA-256 |',
        '|---|---|---|---|---|---:|---:|---|'
      );
      for (const s of r.screenshots) {
        galLines.push(`| [${path.basename(s.path)}](./${s.relFromLiveDir}) | \`${s.viewport}\` | \`${s.mode}\` | \`${s.capture_role}\` | \`${s.scroll_top} / ${s.scroll_height}\` | \`${s.width}x${s.height}\` | \`${s.bytes}\` | \`${s.sha256}\` |`);
      }
      galLines.push('');
    }

    fs.writeFileSync(path.join(LIVE_DIR, 'Q1_VISUAL_WITNESS_GALLERY_AND_INDEX.md'), galLines.join('\n'), 'utf8');

    console.log(`Q1_VISUAL_WITNESS_DONE: specimens=${specimenRecords.length} total_screenshots=${indexJson.total_screenshots}`);
  } finally {
    if (cdp) cdp.close();
    try { chrome.kill(); } catch {}
    server.close();
    await sleep(300);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('Q1_VISUAL_WITNESS_FAILED:', err);
  process.exit(1);
});
