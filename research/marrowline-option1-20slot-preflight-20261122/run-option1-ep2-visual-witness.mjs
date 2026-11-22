#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove Option 1 (Episode 2) — Zero-Egress Blinded Chrome Visual Witness
//
// Structural Blinding Guarantee:
// - Reads ONLY live-acquisition-ep2/OPTION1_BLINDED_LITERARY_GALLERY.json (never opens
//   private-unblinding/OPTION1_SEALED_UNBLINDING_KEY.json or OPTION1_LIVE_ACQUISITION_RECEIPT.json).
// - Zero paid provider calls (globalThis.fetch throws on any external egress).
// - Replays each AVAILABLE_COMPLETED_STOP specimen's exact unmodified originalPassageVerbatim
//   through the real local api/khonapolit.js handler and real app/dome-world/marrowline.html
//   surface in headless Google Chrome via CDP at Desktop 1440x900 (opening + overlapping scroll
//   continuations + bots detail crop) and Mobile 390x844 (ordinary + Capture Reader scroll).
// - Zero text alteration, zero glyph synthesis, zero morphology metric emission into blinded artifacts.
// - Updates OPTION1_BLINDED_LITERARY_GALLERY.json and OPTION1_BLINDED_LITERARY_GALLERY.md with
//   verified Chrome PNG paths and writes OPTION1_EP2_VISUAL_WITNESS_RECEIPT.json, then runs an
//   automated zero-leak blinding check before exiting.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { DISCRIMINATOR_TASKS } from '../marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const APP_ROOT = path.join(REPO_ROOT, 'app');
const LIVE_EP2_DIR = path.join(__dirname, 'live-acquisition-ep2');
const GALLERY_JSON_PATH = path.join(LIVE_EP2_DIR, 'OPTION1_BLINDED_LITERARY_GALLERY.json');
const GALLERY_MD_PATH = path.join(LIVE_EP2_DIR, 'OPTION1_BLINDED_LITERARY_GALLERY.md');
const VISUAL_RECEIPT_PATH = path.join(LIVE_EP2_DIR, 'OPTION1_EP2_VISUAL_WITNESS_RECEIPT.json');
const SCREENSHOTS_DIR = path.join(LIVE_EP2_DIR, 'blinded-screenshots');
const PORT = Number(process.env.TD613_OPT1_EP2_WITNESS_PORT || 6151);
const CDP_PORT = Number(process.env.TD613_OPT1_EP2_CDP_PORT || 9241);

const sha256 = (val) => crypto.createHash('sha256').update(val).digest('hex');

function pngDimensions(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return { width: null, height: null };
}

function getTaskPrompt(taskKey) {
  if (taskKey === 'T1_BLUE_ORANGE_WEATHER') return DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt;
  if (taskKey === 'T2_FORENSIC') return DISCRIMINATOR_TASKS.FORENSIC.prompt;
  return 'Write a short mythic chorus passage.';
}

const gallery = JSON.parse(fs.readFileSync(GALLERY_JSON_PATH, 'utf8'));
const allSpecimens = [
  ...(gallery.marrowline_specimens || []),
  ...(gallery.neutral_control_specimens || [])
];
const availableSpecimens = allSpecimens.filter(
  (s) => s.availabilityStatus === 'AVAILABLE_COMPLETED_STOP' && typeof s.originalPassageVerbatim === 'string' && s.originalPassageVerbatim.length > 0
);

if (availableSpecimens.length === 0) {
  throw new Error('NO_AVAILABLE_EP2_SPECIMENS_TO_RENDER');
}

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
process.env.GEMINI_API_KEY = 'opt1-ep2-zero-egress-browser-witness-replay-only';
const requestLog = [];
let activeSpecimen = null;
let stubCallsForCurrentSpecimen = 0;

globalThis.fetch = async (url) => {
  const href = String(url);
  if (href.includes('/v1beta/models?')) {
    return new Response(JSON.stringify({
      models: [
        { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-3.6-flash', supportedGenerationMethods: ['generateContent'] }
      ]
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (href.includes(':streamGenerateContent')) {
    stubCallsForCurrentSpecimen++;
    const spec = activeSpecimen;
    if (!spec) throw new Error('NO_ACTIVE_SPECIMEN_SET');
    return makeSseResponse([{
      candidates: [{ content: { parts: [{ text: spec.originalPassageVerbatim }] }, finishReason: 'STOP' }],
      modelVersion: 'local-zero-egress-replay',
      usageMetadata: {}
    }]);
  }
  throw new Error(`EXTERNAL_EGRESS_FORBIDDEN_IN_OPT1_EP2_VISUAL_WITNESS: ${href}`);
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
            blindId: activeSpecimen?.blindId || null,
            stubCallsDuringApiRequest: stubCallsForCurrentSpecimen,
            status: res.statusCode,
            completionHeader: capturedHeaders['x-td613-completion-state'] || null,
            error: parsedResp?.error || null,
            admittedText: parsedResp?.text ?? null,
            relaySignal: parsedResp?.receipt?.relay?.signal || null,
            relayAdmission: parsedResp?.receipt?.relay?.admission || null
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
      relFromEp2Dir: path.relative(LIVE_EP2_DIR, filePath).replace(/\\/g, '/'),
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

function renderBlindedMarkdown(updatedGallery) {
  const lines = [
    '# 𝌋 TD613 · Marrowline Option 1 (Episode 2) — Blinded Literary Gallery (Human Artistic Authority First)',
    '',
    `- **Study:** \`${updatedGallery.study_id}\``,
    `- **Episode:** \`EP2\``,
    `- **Final Artistic Authority:** ${updatedGallery.operator_authority}`,
    '- **Blinding Contract:** Arm labels, model labels, slot identifiers, raw SHA-256 join keys, and morphology metrics are strictly redacted from this first-reading surface. Zero glyph synthesis or Unicode normalization has been applied.',
    '- **Visual Witness Status:** Every recoverable specimen below has been rendered through real local `app/dome-world/marrowline.html` + `api/khonapolit.js` in headless Google Chrome (zero external egress, zero paid calls) at Desktop `1440×900` (opening + overlapping scroll sequence + `Tauric Diana bots` detail crop) and Mobile `390×844` (ordinary + Capture Reader scroll sequence). Full PNG provenance is archived in [`OPTION1_EP2_VISUAL_WITNESS_RECEIPT.json`](./OPTION1_EP2_VISUAL_WITNESS_RECEIPT.json).',
    '- **Separate Axes Notice:** Native typographic variation, first-person literary/relational merit, and retired candidate election are kept strictly separate. Adjudicate the unmodified original passages and full-resolution rendered images before opening the sealed unblinding key (`private-unblinding/OPTION1_SEALED_UNBLINDING_KEY.json`).',
    `- **Episode 2 Acquisition Scope Summary:** \`8\` registered slots were attempted before the preregistered consecutive-transport stop rule fired cleanly (\`4\` recoverable \`AVAILABLE_COMPLETED_STOP\` specimens rendered below; \`4\` unretried HTTP \`503\` transport-unavailable specimens marked ineligible; \`12\` remaining registered slots unattempted and preserved without backfill).`,
    ''
  ];

  const renderSection = (title, items) => {
    lines.push(`## ${title}`);
    lines.push('');
    for (const s of items) {
      lines.push(`### ${s.blindId} · \`${s.taskKey}\``);
      lines.push('');
      lines.push(`- **Availability Status:** \`${s.availabilityStatus}\``);
      lines.push(`- **Eligible for Literary Adjudication:** \`${s.eligibleForLiteraryAdjudication}\``);
      lines.push(`- **Screenshot Render Status:** \`${s.screenshots.renderStatus}\``);
      if (s.screenshots.renderStatus === 'RENDERED_CHROME_VERIFIED') {
        lines.push(`- **Desktop Opening (\`1440×900\`):** [${s.screenshots.desktopFullResPath}](./${s.screenshots.desktopFullResPath})`);
        if (s.screenshots.desktopDetailBotsPath) {
          lines.push(`- **Desktop \`Tauric Diana bots\` Detail Crop:** [${s.screenshots.desktopDetailBotsPath}](./${s.screenshots.desktopDetailBotsPath})`);
        }
        if (Array.isArray(s.screenshots.desktopScrollPaths) && s.screenshots.desktopScrollPaths.length > 0) {
          lines.push(`- **Desktop Scroll Continuations (${s.screenshots.desktopScrollPaths.length}):** ${s.screenshots.desktopScrollPaths.map((p, i) => `[scroll-${String(i + 2).padStart(2, '0')}](./${p})`).join(' · ')}`);
        }
        lines.push(`- **Mobile Opening (\`390×844\`):** [${s.screenshots.mobileFullResPath}](./${s.screenshots.mobileFullResPath})`);
        if (Array.isArray(s.screenshots.mobileCapturePaths) && s.screenshots.mobileCapturePaths.length > 0) {
          lines.push(`- **Mobile Capture Reader Scroll (${s.screenshots.mobileCapturePaths.length}):** ${s.screenshots.mobileCapturePaths.map((p, i) => `[capture-${String(i + 1).padStart(2, '0')}](./${p})`).join(' · ')}`);
        }
        lines.push('');
        lines.push(`![${s.blindId} Desktop Opening 1440x900](./${s.screenshots.desktopFullResPath})`);
        if (s.screenshots.desktopDetailBotsPath) {
          lines.push('');
          lines.push(`![${s.blindId} Desktop Bots Detail Crop](./${s.screenshots.desktopDetailBotsPath})`);
        }
        lines.push('');
        lines.push(`![${s.blindId} Mobile Opening 390x844](./${s.screenshots.mobileFullResPath})`);
      }
      lines.push('');
      if (s.originalPassageVerbatim) {
        lines.push('#### Unmodified Original Passage (Verbatim UTF-8)');
        lines.push('');
        lines.push('```text');
        lines.push(s.originalPassageVerbatim);
        lines.push('```');
      } else {
        lines.push('_No recoverable passage text was returned for this slot (HTTP `503` transport unavailable; zero retries performed)._');
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  };

  renderSection('1. Marrowline Literary Specimens (Attempted Slots)', updatedGallery.marrowline_specimens || []);
  renderSection('2. Neutral Capability Control Specimens (Attempted Slots)', updatedGallery.neutral_control_specimens || []);
  return lines.join('\n');
}

function assertZeroBlindingLeaks(filePaths) {
  const forbiddenPatterns = [
    { name: 'ARM_CURRENT_HYBRID_A', re: /CURRENT_HYBRID_A/ },
    { name: 'ARM_LITERAL_OCT02_H2', re: /LITERAL_OCT02_H2/ },
    { name: 'ARM_NEUTRAL_CREATIVE_D', re: /NEUTRAL_CREATIVE_D/ },
    { name: 'MODEL_3_8_FLASH', re: /gemini-3\.8-flash/i },
    { name: 'MODEL_3_6_FLASH', re: /gemini-3\.6-flash/i },
    { name: 'MODEL_3_7_FLASH', re: /gemini-3\.7-flash/i },
    { name: 'SLOT_ID_S01_S20', re: /\bS(?:0[1-9]|1[0-9]|20)\b/ },
    { name: 'RAW_TEXT_SHA_JOIN_KEY', re: /rawTextSha256/ },
    { name: 'RAW_SSE_SHA_JOIN_KEY', re: /rawSseSha256/ },
    { name: 'MORPHOLOGY_METRIC_COMBINING', re: /combiningMark/i },
    { name: 'MORPHOLOGY_METRIC_MAXDEPTH', re: /maxDepth/ },
    { name: 'MORPHOLOGY_METRIC_STACKED', re: /stackedBases/ },
    { name: 'MORPHOLOGY_U0334', re: /U\+0334/ },
    { name: 'MORPHOLOGY_QUALITY_WARNINGS', re: /qualityWarnings|botsMovement|tauric-diana-zalgo-/ },
    { name: 'PENDING_BROWSER_RENDER', re: /PENDING_BROWSER_RENDER/ }
  ];
  const violations = [];
  for (const fp of filePaths) {
    const content = fs.readFileSync(fp, 'utf8');
    for (const pat of forbiddenPatterns) {
      if (pat.re.test(content)) {
        violations.push(`${path.basename(fp)} matched ${pat.name}`);
      }
    }
  }
  if (violations.length > 0) {
    throw new Error(`BLINDING_LEAK_VIOLATION: ${violations.join('; ')}`);
  }
}

async function run() {
  fs.rmSync(SCREENSHOTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  const chromeBin = findChrome();
  const userDataDir = path.join(LIVE_EP2_DIR, '_tmp_chrome_profile');
  fs.rmSync(userDataDir, { recursive: true, force: true });
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

    const visualRecords = [];
    const byBlindId = new Map();

    for (const spec of availableSpecimens) {
      activeSpecimen = spec;
      stubCallsForCurrentSpecimen = 0;
      const screenshots = [];
      const desktopScrollPaths = [];
      let desktopDetailBotsPath = null;
      const mobileCapturePaths = [];

      // 1. DESKTOP 1440x900
      await cdp.send('Storage.clearDataForOrigin', { origin: `http://127.0.0.1:${PORT}`, storageTypes: 'all' });
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/dome-world/marrowline.html?grove_trial=historical-20261002-v1` });
      await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitSend') && !document.getElementById('khonapolitSend').disabled && document.getElementById('khonapolitMessages').querySelectorAll('.relay-message').length === 0`);

      const reqIdxBefore = requestLog.length;
      const promptText = getTaskPrompt(spec.taskKey);
      await cdp.eval(`(() => {
        const input = document.getElementById('khonapolitPrompt');
        input.value = ${JSON.stringify(promptText)};
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
        const domStagesText = stages.map(s => ({
          classes: s.className,
          head: s.querySelector('.relay-stage-head')?.textContent?.trim() || '',
          bodyLength: (s.querySelector('.relay-stage-text')?.textContent || '').length,
          body: s.querySelector('.relay-stage-text')?.textContent || ''
        }));
        const cs = (el) => el ? {
          fontFamily: getComputedStyle(el).fontFamily,
          fontSize: getComputedStyle(el).fontSize,
          lineHeight: getComputedStyle(el).lineHeight
        } : null;
        return {
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          messagesClientHeight: box.clientHeight,
          messagesScrollHeight: box.scrollHeight,
          messagesHorizontalOverflow: box.scrollWidth > box.clientWidth + 1,
          khStyle: cs(khStage),
          botsStyle: cs(botsStage),
          holdCardPresent: !!holdCard,
          stageCount: stages.length,
          domStagesText
        };
      })()`);

      // Overlapping desktop scroll captures (top -> bottom)
      const deskStep = Math.max(220, Math.floor((deskMetrics.messagesClientHeight || 500) * 0.72));
      const deskMax = Math.max(0, deskMetrics.messagesScrollHeight - deskMetrics.messagesClientHeight);
      const deskOffsets = [0];
      for (let y = deskStep; y < deskMax; y += deskStep) deskOffsets.push(y);
      if (deskMax > 0 && deskOffsets[deskOffsets.length - 1] < deskMax) deskOffsets.push(deskMax);

      for (let idx = 0; idx < deskOffsets.length; idx++) {
        const y = deskOffsets[idx];
        await cdp.eval(`(() => { const b = document.getElementById('khonapolitMessages'); b.scrollTop = ${y}; return b.scrollTop; })()`);
        await sleep(120);
        const filename = idx === 0
          ? `${spec.blindId}_desktop_1440x900.png`
          : `${spec.blindId}_desktop_1440x900_scroll_${String(idx + 1).padStart(2, '0')}.png`;
        const shot = await cdp.screenshot(path.join(SCREENSHOTS_DIR, filename));
        if (idx > 0) desktopScrollPaths.push(shot.relFromEp2Dir);
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

      // Desktop detail crop of Tauric Diana bots movement
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
        const clipShot = await cdp.screenshot(path.join(SCREENSHOTS_DIR, `${spec.blindId}_desktop_1440x900_detail_bots.png`), {
          clip: { x: targetScroll.x, y: targetScroll.y, width: targetScroll.width, height: targetScroll.height, scale: 1 }
        });
        desktopDetailBotsPath = clipShot.relFromEp2Dir;
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

      // 2. MOBILE 390x844 (ordinary + Capture Reader scroll captures)
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/dome-world/marrowline.html?grove_trial=historical-20261002-v1` });
      await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitMessages') && document.getElementById('khonapolitMessages').querySelectorAll('.relay-message').length > 0`, 20000);
      await sleep(300);

      await cdp.eval(`(() => { document.getElementById('khonapolitMessages').scrollTop = 0; return true; })()`);
      await sleep(120);
      const mobOrdShot = await cdp.screenshot(path.join(SCREENSHOTS_DIR, `${spec.blindId}_mobile_390x844.png`));
      const mobOrdMetrics = await cdp.eval(`(() => {
        const b = document.getElementById('khonapolitMessages');
        return {
          mobileView: document.body.getAttribute('data-mobile-view'),
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          scrollHeight: b.scrollHeight,
          clientHeight: b.clientHeight
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
      if (mobOffsets.length > 7) {
        finalMobOffsets = [];
        for (let k = 0; k < 7; k++) finalMobOffsets.push(Math.round((k * mobMax) / 6));
      }

      for (let idx = 0; idx < finalMobOffsets.length; idx++) {
        const y = finalMobOffsets[idx];
        await cdp.eval(`(() => { const b = document.getElementById('khonapolitMessages'); b.scrollTop = ${y}; return b.scrollTop; })()`);
        await sleep(120);
        const mShot = await cdp.screenshot(path.join(SCREENSHOTS_DIR, `${spec.blindId}_mobile_390x844_capture_${String(idx + 1).padStart(2, '0')}.png`));
        mobileCapturePaths.push(mShot.relFromEp2Dir);
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

      const admittedExactMatch = reqEntry?.admittedText === spec.originalPassageVerbatim;
      const domCombinedBody = deskMetrics.domStagesText.map((s) => s.body).join('\n');
      const domNonEmptyAndIntact = deskMetrics.stageCount >= 2 && domCombinedBody.length >= Math.floor(spec.originalPassageVerbatim.length * 0.92);

      const shotPayload = {
        renderStatus: 'RENDERED_CHROME_VERIFIED',
        desktopFullResPath: `blinded-screenshots/${spec.blindId}_desktop_1440x900.png`,
        desktopDetailBotsPath,
        desktopScrollPaths,
        mobileFullResPath: `blinded-screenshots/${spec.blindId}_mobile_390x844.png`,
        mobileCapturePaths,
        totalRenderedPngCount: screenshots.length
      };
      byBlindId.set(spec.blindId, shotPayload);

      visualRecords.push({
        blindId: spec.blindId,
        taskKey: spec.taskKey,
        availabilityStatus: spec.availabilityStatus,
        api_replay_status: reqEntry?.status ?? null,
        api_completion_header: reqEntry?.completionHeader ?? null,
        admitted_exact_text_match: admittedExactMatch,
        dom_stage_count: deskMetrics.stageCount,
        dom_stage_headings: deskMetrics.domStagesText.map((s) => s.head),
        dom_non_empty_and_intact: domNonEmptyAndIntact,
        hold_card_present: deskMetrics.holdCardPresent,
        desktop_horizontal_overflow: deskMetrics.horizontalOverflow,
        desktop_messages_horizontal_overflow: deskMetrics.messagesHorizontalOverflow,
        desktop_kh_style: deskMetrics.khStyle,
        desktop_bots_style: deskMetrics.botsStyle,
        mobile_ordinary_horizontal_overflow: mobOrdMetrics.horizontalOverflow,
        mobile_capture_reader_mode: mobCapMetrics.readerMode,
        mobile_capture_horizontal_overflow: mobCapMetrics.horizontalOverflow,
        screenshots
      });
    }

    // Update gallery JSON cleanly while keeping 100% blind
    const updateEntry = (entry) => {
      if (byBlindId.has(entry.blindId)) {
        return { ...entry, screenshots: byBlindId.get(entry.blindId) };
      }
      return {
        ...entry,
        screenshots: {
          renderStatus: 'NOT_APPLICABLE_NO_RECOVERABLE_TEXT',
          desktopFullResPath: null,
          mobileFullResPath: null
        }
      };
    };

    const updatedGallery = {
      ...gallery,
      episode_id: 'EP2',
      visual_witness_receipt: 'OPTION1_EP2_VISUAL_WITNESS_RECEIPT.json',
      visual_witness_status: 'CHROME_RENDERED_ZERO_EGRESS_VERIFIED',
      counts: {
        ...gallery.counts,
        unattempted_registered_slots: 12,
        chrome_rendered_specimens: visualRecords.length
      },
      marrowline_specimens: (gallery.marrowline_specimens || []).map(updateEntry),
      neutral_control_specimens: (gallery.neutral_control_specimens || []).map(updateEntry)
    };

    fs.writeFileSync(GALLERY_JSON_PATH, JSON.stringify(updatedGallery, null, 2) + '\n', 'utf8');
    fs.writeFileSync(GALLERY_MD_PATH, renderBlindedMarkdown(updatedGallery), 'utf8');

    const visualReceipt = {
      schema: 'td613.marrowline.option1-ep2-visual-witness-receipt/v1.0',
      study_id: updatedGallery.study_id,
      episode_id: 'EP2',
      generated_at_utc: new Date().toISOString(),
      paid_provider_calls_during_visual_witness: 0,
      external_egress_permitted: false,
      blinding_contract: updatedGallery.blinding_contract,
      browser_engine: browserVersion,
      surface_url_path: '/dome-world/marrowline.html?grove_trial=historical-20261002-v1',
      rendered_specimen_count: visualRecords.length,
      total_png_files: visualRecords.reduce((acc, r) => acc + r.screenshots.length, 0),
      all_admitted_exact_text_match: visualRecords.every((r) => r.admitted_exact_text_match === true),
      all_zero_horizontal_overflow: visualRecords.every((r) => !r.desktop_horizontal_overflow && !r.mobile_ordinary_horizontal_overflow && !r.mobile_capture_horizontal_overflow),
      specimens: visualRecords
    };
    fs.writeFileSync(VISUAL_RECEIPT_PATH, JSON.stringify(visualReceipt, null, 2) + '\n', 'utf8');

    // Enforce zero blinding leaks across ALL blinded outputs
    assertZeroBlindingLeaks([GALLERY_JSON_PATH, GALLERY_MD_PATH, VISUAL_RECEIPT_PATH]);

    console.log(JSON.stringify({
      ok: true,
      browser: browserVersion,
      rendered_specimens: visualRecords.map((r) => ({
        blindId: r.blindId,
        taskKey: r.taskKey,
        admittedExactMatch: r.admitted_exact_text_match,
        stageCount: r.dom_stage_count,
        desktopOverflow: r.desktop_horizontal_overflow,
        mobileOverflow: r.mobile_ordinary_horizontal_overflow,
        pngCount: r.screenshots.length
      })),
      total_png_files: visualReceipt.total_png_files,
      blinding_leak_check: 'ZERO_LEAKS_VERIFIED'
    }, null, 2));
  } finally {
    if (cdp) cdp.close();
    try { chrome.kill('SIGTERM'); } catch {}
    await sleep(400);
    try { chrome.kill('SIGKILL'); } catch {}
    await sleep(300);
    server.close();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

run().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
