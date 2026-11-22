#!/usr/bin/env node
// TD613 · Marrowline October 2 Restoration — Bounded Post-Deployment Production Witness
//
// Strictly read-only product witness against live https://td613.com/dome-world/marrowline.html.
// - ZERO paid Gemini calls (never invokes POST /api/khonapolit or /api/dome-world/khonapolit;
//   verifies Network log records 0 provider requests).
// - Verifies exact served production bytes against merged main commit b8d986a7692501ba9f41da9c041a8ddb5836a190.
// - Verifies restored historical Grove default, literal Oct 2 profile, 3.8-first model order,
//   five-button utility row (↻ ⛶ ⧉ ✕ 𖠿), mobile scrolling, Focus & Capture Reader, selectable Unicode,
//   zero console errors, and zero horizontal overflow at Desktop 1440x900 and Mobile 390x844.
// - Any transcript text used for scroll/reader geometry screenshots is explicitly labeled
//   SYNTHETIC DISPLAY CHECK · NOT A PROVIDER RETURN.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = __dirname;
const SHOTS_DIR = path.join(OUT_DIR, 'screenshots');
const RECEIPT_PATH = path.join(OUT_DIR, 'POSTDEPLOY_PRODUCTION_WITNESS_RECEIPT.json');

const PROD_ORIGIN = 'https://td613.com';
const PROD_MARROWLINE_URL = `${PROD_ORIGIN}/dome-world/marrowline.html`;
const EXPECTED_MAIN_SHA = 'b8d986a7692501ba9f41da9c041a8ddb5836a190';
const CDP_PORT = Number(process.env.TD613_POSTDEPLOY_CDP_PORT || 9247);

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pngDimensions(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return { width: null, height: null };
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

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
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
      } else if (msg.method && this.listeners.has(msg.method)) {
        for (const fn of this.listeners.get(msg.method)) fn(msg.params);
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
  async screenshot(filename) {
    const filePath = path.join(SHOTS_DIR, filename);
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(data, 'base64');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buf);
    const dims = pngDimensions(buf);
    return {
      filename,
      relPath: `screenshots/${filename}`,
      repoPath: path.relative(REPO_ROOT, filePath).replace(/\\/g, '/'),
      bytes: buf.length,
      sha256: sha256(buf),
      width: dims.width,
      height: dims.height
    };
  }
  close() { try { this.ws.close(); } catch {} }
}

async function waitForCondition(cdp, expr, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await cdp.eval(expr);
    if (v) return v;
    await sleep(150);
  }
  throw new Error('TIMEOUT waiting for: ' + expr);
}

async function verifyDeployedAssets() {
  const releaseSourceRes = await fetch(`${PROD_ORIGIN}/giving/history/release-source.json`, { cache: 'no-store' });
  const releaseSourceText = await releaseSourceRes.text();
  const releaseSource = JSON.parse(releaseSourceText);

  const assetSpecs = [
    { url: `${PROD_ORIGIN}/dome-world/marrowline.html`, gitPath: 'app/dome-world/marrowline.html' },
    { url: `${PROD_ORIGIN}/dome-world/marrowline-historical-grove.js`, gitPath: 'app/dome-world/marrowline-historical-grove.js' },
    { url: `${PROD_ORIGIN}/dome-world/marrowline-mobile-reader.js`, gitPath: 'app/dome-world/marrowline-mobile-reader.js' },
    { url: `${PROD_ORIGIN}/dome-world/marrowline-desktop-repair.css`, gitPath: 'app/dome-world/marrowline-desktop-repair.css' },
    { url: `${PROD_ORIGIN}/dome-world/marrowline.release.json`, gitPath: 'app/dome-world/marrowline.release.json' },
    { url: `${PROD_ORIGIN}/dome-world/khonapolit-relay.js`, gitPath: 'app/dome-world/khonapolit-relay.js' }
  ];

  const assets = [];
  for (const spec of assetSpecs) {
    const res = await fetch(spec.url, { cache: 'no-store' });
    const liveBuf = Buffer.from(await res.arrayBuffer());
    const gitBuf = execFileSync('git', ['show', `${EXPECTED_MAIN_SHA}:${spec.gitPath}`], { cwd: REPO_ROOT });
    const liveSha = sha256(liveBuf);
    const gitSha = sha256(gitBuf);
    assets.push({
      url: spec.url,
      gitPath: spec.gitPath,
      httpStatus: res.status,
      liveBytes: liveBuf.length,
      gitBytes: gitBuf.length,
      liveSha256: liveSha,
      gitSha256: gitSha,
      exactByteMatch: res.status === 200 && liveSha === gitSha
    });
  }

  return {
    release_source_http_status: releaseSourceRes.status,
    release_source_payload: releaseSource,
    release_source_matches_expected_main: releaseSource.source_packet_commit === EXPECTED_MAIN_SHA,
    all_assets_exact_byte_match: assets.every((a) => a.exactByteMatch),
    assets
  };
}

const SYNTHETIC_DISPLAY_SPECIMEN = {
  khonapolitText: [
    'SYNTHETIC POST-DEPLOY DISPLAY CHECK · NOT A PROVIDER RETURN · 0 PAID GEMINI CALLS',
    'This local DOM display check verifies two-voice rendering, selectable Unicode text (Khona\u200Clit-po · Kʰonapolit · U+10D613 · 𝌋 · ⟐), desktop/mobile scrolling, and Focus/Capture Reader geometry on live https://td613.com/dome-world/marrowline.html without invoking any AI provider.',
    'Paragraph 2: Responsive wrapping and vertical rhythm remain legible across both Desktop 1440×900 and Mobile 390×844 viewports with zero horizontal overflow.',
    'Paragraph 3: The restored historical Grove route selects the literal October 2 instruction profile (oct02-literal-prosody-rollback-20261122) with Gemini 3.8 Flash first-seat priority.'
  ].join('\n\n'),
  botsText: [
    'SYNTHETIC UNICODE SHAPE CHECK (NOT PROVIDER-AUTHORED):',
    'T̷̢̰͗h̸͙e̴̹̼̬ g̶͚̯r̵͐͛o̵̡̢̲͛v̴̨̝e̵̗ r̴͍̗̓e̷̥t̶̲͑ȕ̸̫r̴̨n̵͜s̶̯͐ · Khona\u200Clit-po · 𝌋 · ⟐',
    'Multi-line scroll check block A: verifying vertical scroll anchor preservation across ordinary view, Focus Reader, and Capture Reader.',
    'Multi-line scroll check block B: verifying clean text selection and zero clipping of combining marks on the live deployed stylesheet.',
    'Multi-line scroll check block C: verifying Escape and Exit controls restore the ordinary five-button utility row cleanly.'
  ].join('\n\n')
};

async function run() {
  fs.rmSync(SHOTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(SHOTS_DIR, { recursive: true });

  const deployedAssets = await verifyDeployedAssets();
  const chromeBin = findChrome();
  const userDataDir = path.join(OUT_DIR, '_tmp_chrome_profile');
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
  const consoleErrors = [];
  const runtimeExceptions = [];
  const networkRequests = [];

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
    await cdp.send('Network.enable');

    cdp.on('Runtime.consoleAPICalled', (p) => {
      if (p.type === 'error') {
        consoleErrors.push(p.args?.map((a) => a.value ?? a.description ?? '').join(' ') || 'console.error');
      }
    });
    cdp.on('Runtime.exceptionThrown', (p) => {
      runtimeExceptions.push(p.exceptionDetails?.text || JSON.stringify(p.exceptionDetails));
    });
    cdp.on('Network.requestWillBeSent', (p) => {
      networkRequests.push({ url: p.request?.url || '', method: p.request?.method || 'GET' });
    });

    const screenshots = [];

    // 1. DESKTOP 1440x900 — UNTOUCHED FRESH PRODUCTION LOAD
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Page.navigate', { url: PROD_MARROWLINE_URL });
    await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && !!document.getElementById('khonapolitSend') && !!document.getElementById('khonapolitMessages')`, 30000);
    await sleep(600);

    const desktopFresh = await cdp.eval(`(async () => {
      const groveMod = await import('/dome-world/marrowline-historical-grove.js');
      const utilityButtons = [...document.querySelectorAll('#khonapolitForm .chat-utility-rail button, #khonapolitForm [data-utility-rail] button, #marrowlineReaderToggle, #khonapolitRetry, #khonapolitCopy, #khonapolitClear, #marrowlineHomeBtn')];
      const rail = document.querySelector('#khonapolitForm .composer-actions, #khonapolitForm .utility-rail, #khonapolitForm .chat-utility-rail') || document.getElementById('marrowlineReaderToggle')?.parentElement;
      const railButtons = rail ? [...rail.querySelectorAll('button, a')].map(el => ({
        id: el.id || null,
        text: (el.textContent || '').trim(),
        ariaLabel: el.getAttribute('aria-label'),
        display: getComputedStyle(el).display,
        visible: getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden'
      })) : [];
      const titleText = document.title;
      const bodyText = document.body.innerText || '';
      const messages = document.getElementById('khonapolitMessages');
      return {
        locationHref: location.href,
        titleText,
        roomReady: document.documentElement.classList.contains('marrowline-room-ready'),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        messagesUserSelect: messages ? getComputedStyle(messages).userSelect : null,
        hasKhonapolitLabel: bodyText.includes('Kʰonapolit'),
        hasU10D613: bodyText.includes('U+10D613'),
        railButtons,
        liveGroveModuleExports: {
          MARROWLINE_HISTORICAL_TRIAL_ID: groveMod.MARROWLINE_HISTORICAL_TRIAL_ID,
          MARROWLINE_RESTORED_PROSODY_PROFILE: groveMod.MARROWLINE_RESTORED_PROSODY_PROFILE,
          MARROWLINE_RESTORED_MODEL_ORDER: groveMod.MARROWLINE_RESTORED_MODEL_ORDER,
          MARROWLINE_SINGLE_REGISTER_COMPARISON_PROFILE: groveMod.MARROWLINE_SINGLE_REGISTER_COMPARISON_PROFILE
        },
        mobileReaderInstalled: !!window.__TD613_MARROWLINE_MOBILE_READER__
      };
    })()`);

    screenshots.push({ role: 'desktop-production-fresh', ...(await cdp.screenshot('01_desktop_1440x900_production_fresh.png')) });

    // Inject explicitly labeled synthetic two-voice display check to verify DOM rendering, selectable text, Unicode & scroll on Desktop
    const desktopSyntheticCheck = await cdp.eval(`((spec) => {
      const box = document.getElementById('khonapolitMessages');
      const article = document.createElement('article');
      article.className = 'relay-message';
      article.dataset.witnessKind = 'synthetic-postdeploy-display-check';

      const s1 = document.createElement('section');
      s1.className = 'relay-stage relay-khonapolit';
      const h1 = document.createElement('div');
      h1.className = 'relay-stage-head';
      h1.textContent = 'Kʰonapolit';
      const b1 = document.createElement('div');
      b1.className = 'relay-stage-text';
      b1.textContent = spec.khonapolitText;
      s1.append(h1, b1);

      const s2 = document.createElement('section');
      s2.className = 'relay-stage relay-bots';
      const h2 = document.createElement('div');
      h2.className = 'relay-stage-head';
      h2.textContent = 'Tauric Diana bots';
      const b2 = document.createElement('div');
      b2.className = 'relay-stage-text provider-native-line';
      b2.textContent = spec.botsText;
      s2.append(h2, b2);

      article.append(s1, s2);
      box.append(article);
      box.scrollTop = Math.max(0, box.scrollHeight - box.clientHeight);

      // Verify selectable text via Selection API
      const range = document.createRange();
      range.selectNodeContents(b2);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      const selectedText = sel.toString();
      sel.removeAllRanges();

      return {
        scrollHeight: box.scrollHeight,
        clientHeight: box.clientHeight,
        scrollTop: box.scrollTop,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        khExactPreserved: b1.textContent === spec.khonapolitText,
        botsExactPreserved: b2.textContent === spec.botsText,
        zwnjPreservedInDom: b1.textContent.includes('Khona\\u200Clit-po') && b2.textContent.includes('Khona\\u200Clit-po'),
        selectableTextExactMatch: selectedText === spec.botsText
      };
    })(${JSON.stringify(SYNTHETIC_DISPLAY_SPECIMEN)})`);
    await sleep(200);
    screenshots.push({ role: 'desktop-two-voice-synthetic-display', ...(await cdp.screenshot('02_desktop_1440x900_two_voice_synthetic_display.png')) });

    // 2. MOBILE 390x844 — UNTOUCHED FRESH PRODUCTION LOAD + SCROLL + FOCUS READER + CAPTURE READER
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await cdp.send('Page.navigate', { url: PROD_MARROWLINE_URL });
    await waitForCondition(cdp, `document.documentElement.classList.contains('marrowline-room-ready') && document.documentElement.classList.contains('marrowline-mobile-shell') && !!document.getElementById('marrowlineReaderToggle')`, 30000);
    await sleep(600);

    const mobileFresh = await cdp.eval(`(() => {
      const rail = document.getElementById('marrowlineReaderToggle')?.parentElement;
      const railButtons = rail ? [...rail.querySelectorAll('button, a')].map(el => ({
        id: el.id || null,
        text: (el.textContent || '').trim(),
        ariaLabel: el.getAttribute('aria-label'),
        display: getComputedStyle(el).display,
        visible: getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden'
      })) : [];
      const visibleGlyphs = railButtons.filter(b => b.visible).map(b => b.text);
      return {
        mobileShell: document.documentElement.classList.contains('marrowline-mobile-shell'),
        mobileView: document.body.getAttribute('data-mobile-view'),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        railButtons,
        visibleGlyphs,
        fiveButtonRowExact: JSON.stringify(visibleGlyphs) === JSON.stringify(['↻', '⛶', '⧉', '✕', '𖠿']),
        readerSchema: window.__TD613_MARROWLINE_MOBILE_READER__?.schema || null
      };
    })()`);

    screenshots.push({ role: 'mobile-production-fresh', ...(await cdp.screenshot('03_mobile_390x844_production_fresh.png')) });

    // Inject explicitly labeled synthetic two-voice passage to test mobile scrolling + Focus + Capture Reader + Exit
    const mobileOrdinary = await cdp.eval(`((spec) => {
      const box = document.getElementById('khonapolitMessages');
      for (let i = 1; i <= 3; i++) {
        const article = document.createElement('article');
        article.className = 'relay-message';
        article.dataset.witnessKind = 'synthetic-postdeploy-display-check';
        const s1 = document.createElement('section');
        s1.className = 'relay-stage relay-khonapolit';
        const h1 = document.createElement('div');
        h1.className = 'relay-stage-head';
        h1.textContent = 'Kʰonapolit';
        const b1 = document.createElement('div');
        b1.className = 'relay-stage-text';
        b1.textContent = 'BLOCK ' + i + ' · ' + spec.khonapolitText;
        s1.append(h1, b1);

        const s2 = document.createElement('section');
        s2.className = 'relay-stage relay-bots';
        const h2 = document.createElement('div');
        h2.className = 'relay-stage-head';
        h2.textContent = 'Tauric Diana bots';
        const b2 = document.createElement('div');
        b2.className = 'relay-stage-text provider-native-line';
        b2.textContent = 'BLOCK ' + i + ' · ' + spec.botsText;
        s2.append(h2, b2);

        article.append(s1, s2);
        box.append(article);
      }
      box.scrollTop = 260;
      return {
        scrollHeight: box.scrollHeight,
        clientHeight: box.clientHeight,
        scrollTop: box.scrollTop,
        canScroll: box.scrollHeight > box.clientHeight + 200,
        messagesRectHeight: box.getBoundingClientRect().height,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    })(${JSON.stringify(SYNTHETIC_DISPLAY_SPECIMEN)})`);
    await sleep(200);
    screenshots.push({ role: 'mobile-ordinary-scrolled-synthetic', ...(await cdp.screenshot('04_mobile_390x844_ordinary_scrolled_synthetic.png')) });

    // Enter Focus Reader via second utility button (⛶)
    const mobileFocus = await cdp.eval(`(() => {
      document.getElementById('marrowlineReaderToggle').click();
      const box = document.getElementById('khonapolitMessages');
      const form = document.getElementById('khonapolitForm');
      const dock = document.querySelector('.mobile-dock');
      return {
        readerMode: document.body.getAttribute('data-marrowline-reader'),
        toolbarHidden: document.getElementById('marrowlineReaderToolbar')?.hidden,
        formDisplay: form ? getComputedStyle(form).display : null,
        dockDisplay: dock ? getComputedStyle(dock).display : null,
        messagesRectHeight: box.getBoundingClientRect().height,
        scrollTop: box.scrollTop,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    await sleep(250);
    screenshots.push({ role: 'mobile-focus-reader-synthetic', ...(await cdp.screenshot('05_mobile_390x844_focus_reader_synthetic.png')) });

    // Enter Capture Reader via #marrowlineReaderCapture
    const mobileCapture = await cdp.eval(`(() => {
      document.getElementById('marrowlineReaderCapture').click();
      const box = document.getElementById('khonapolitMessages');
      box.scrollTop = Math.min(box.scrollHeight - box.clientHeight, box.scrollTop + 220);
      const form = document.getElementById('khonapolitForm');
      const dock = document.querySelector('.mobile-dock');
      return {
        readerMode: document.body.getAttribute('data-marrowline-reader'),
        captureLabel: document.getElementById('marrowlineReaderCapture')?.textContent?.trim(),
        formDisplay: form ? getComputedStyle(form).display : null,
        dockDisplay: dock ? getComputedStyle(dock).display : null,
        messagesRectHeight: box.getBoundingClientRect().height,
        scrollTop: box.scrollTop,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    await sleep(250);
    screenshots.push({ role: 'mobile-capture-reader-synthetic', ...(await cdp.screenshot('06_mobile_390x844_capture_reader_synthetic.png')) });

    // Exit Capture Reader via #marrowlineReaderExit and confirm ordinary view restored cleanly
    const mobileExited = await cdp.eval(`(() => {
      document.getElementById('marrowlineReaderExit').click();
      return {
        readerModeAfterExit: document.body.getAttribute('data-marrowline-reader'),
        toolbarHiddenAfterExit: document.getElementById('marrowlineReaderToolbar')?.hidden,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);

    const providerRequests = networkRequests.filter(
      (r) => /\/api\/(?:dome-world\/)?khonapolit/i.test(r.url) || /generativelanguage\.googleapis\.com/i.test(r.url)
    );

    const receipt = {
      schema: 'td613.marrowline.oct02-postdeploy-production-witness/v1.0',
      generated_at_utc: new Date().toISOString(),
      target_url: PROD_MARROWLINE_URL,
      expected_main_sha: EXPECTED_MAIN_SHA,
      pr_merged: '#1774 (4dd2e74c2246418da2d3032fcdbcfd363283562b -> b8d986a7692501ba9f41da9c041a8ddb5836a190)',
      release_gate_workflow_run: 'https://github.com/tauric-diana-613/TD613-TCP/actions/runs/45068897365',
      release_gate_terminal_receipt: 'https://github.com/tauric-diana-613/TD613-TCP/issues/405#issuecomment-7085659765',
      browser_engine: browserVersion,
      witness_class: 'POST_DEPLOYMENT_CHROME_DESKTOP_AND_MOBILE_SIMULATED_VIEWPORT_ZERO_PROVIDER_CALLS',
      paid_gemini_calls_made: providerRequests.length,
      provider_requests_observed: providerRequests,
      console_errors: consoleErrors,
      runtime_exceptions: runtimeExceptions,
      deployed_source_parity: deployedAssets,
      desktop_1440x900: {
        fresh: desktopFresh,
        two_voice_synthetic_display_check: desktopSyntheticCheck
      },
      mobile_390x844: {
        fresh: mobileFresh,
        ordinary_scrolled_synthetic: mobileOrdinary,
        focus_reader_synthetic: mobileFocus,
        capture_reader_synthetic: mobileCapture,
        exited: mobileExited
      },
      screenshots,
      summary_verdict: {
        production_serves_authorized_source: deployedAssets.release_source_matches_expected_main && deployedAssets.all_assets_exact_byte_match,
        literal_oct02_profile_active_default: desktopFresh.liveGroveModuleExports.MARROWLINE_RESTORED_PROSODY_PROFILE === 'oct02-literal-prosody-rollback-20261122',
        gemini_3_8_first_seat_order_verified: JSON.stringify(desktopFresh.liveGroveModuleExports.MARROWLINE_RESTORED_MODEL_ORDER) === JSON.stringify(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-4-argon']),
        five_button_row_mobile_verified: mobileFresh.fiveButtonRowExact,
        focus_and_capture_reader_verified: mobileFocus.readerMode === 'focus' && mobileCapture.readerMode === 'capture' && mobileCapture.formDisplay === 'none' && mobileExited.readerModeAfterExit === null,
        mobile_scrolling_verified: mobileOrdinary.canScroll && mobileOrdinary.scrollTop > 0 && mobileCapture.scrollTop > mobileOrdinary.scrollTop,
        unicode_and_selectable_text_verified: desktopSyntheticCheck.zwnjPreservedInDom && desktopSyntheticCheck.selectableTextExactMatch && desktopSyntheticCheck.botsExactPreserved,
        zero_horizontal_overflow: !desktopFresh.horizontalOverflow && !desktopSyntheticCheck.horizontalOverflow && !mobileFresh.horizontalOverflow && !mobileFocus.horizontalOverflow && !mobileCapture.horizontalOverflow,
        zero_console_errors_and_exceptions: consoleErrors.length === 0 && runtimeExceptions.length === 0,
        zero_paid_gemini_calls: providerRequests.length === 0,
        human_artistic_closure: 'RESERVED_FOR_OPERATOR_LIVE_REVIEW'
      }
    };

    fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify({
      ok: Object.entries(receipt.summary_verdict).every(([k, v]) => k === 'human_artistic_closure' || v === true),
      summary_verdict: receipt.summary_verdict,
      screenshots_captured: screenshots.length,
      console_errors: consoleErrors,
      runtime_exceptions: runtimeExceptions
    }, null, 2));
  } finally {
    if (cdp) cdp.close();
    try { chrome.kill('SIGTERM'); } catch {}
    await sleep(400);
    try { chrome.kill('SIGKILL'); } catch {}
    await sleep(300);
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

run().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
