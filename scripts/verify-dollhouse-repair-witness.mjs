#!/usr/bin/env node

/**
 * @fileoverview Real Chromium Headless Verification for TD613 Dollhouse Repair Activation (Component 5).
 * Connects directly via Chrome DevTools Protocol (CDP) to exercise desktop (1440x900)
 * and mobile (390x844) viewports, verifying zero horizontal overflow (overflowPx === 0),
 * touch target accessibility (>= 44px), reduced-motion controls, and unpenalized rest/exit semantics.
 */

import { spawn, execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

function parseArgs() {
  const args = process.argv.slice(2);
  let outPath = process.env.TD613_WITNESS_OUTPUT_PATH || 'artifacts/dollhouse-browser-witness/witness_receipt.json';
  let expectedRevision = process.env.EXPECTED_HEAD_SHA || null;
  let requireClean = process.env.REQUIRE_CLEAN_CHECKOUT === 'true';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' || args[i] === '--output') {
      outPath = args[++i];
    } else if (args[i] === '--expected-revision' || args[i] === '--expected-sha') {
      expectedRevision = args[++i];
    } else if (args[i] === '--require-clean') {
      requireClean = true;
    }
  }

  return { outPath, expectedRevision, requireClean };
}

function findChromePath() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH && existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe` : null,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }

  for (const bin of ['google-chrome', 'chromium', 'chromium-browser']) {
    try {
      const resolved = execFileSync('which', [bin], { encoding: 'utf8' }).trim();
      if (resolved && existsSync(resolved)) return resolved;
    } catch {}
  }

  throw new Error('Chrome executable not found. Please set CHROME_BIN environment variable.');
}

function getGitRevision() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'WORKING_TREE_LOCAL';
  }
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

const PORT = 9226;

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.callbacks = new Map();
    this.events = new Map();
    this.ws = null;
  }

  async connect() {
    return new Promise((res, rej) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => res();
      this.ws.onerror = (err) => rej(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        } else if (data.method && this.events.has(data.method)) {
          this.events.get(data.method)(data.params);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    this.events.set(method, handler);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runWitnessSuite() {
  const { outPath: targetOutRel, expectedRevision, requireClean } = parseArgs();
  const chromePath = findChromePath();
  const gitRevision = getGitRevision();

  if (expectedRevision && gitRevision.toLowerCase() !== expectedRevision.trim().toLowerCase()) {
    throw new Error(`Git revision mismatch: expected ${expectedRevision}, got ${gitRevision}`);
  }

  console.log('======================================================================');
  console.log('  𝌋 TD613 REAL CHROMIUM BROWSER WITNESS (COMPONENT 5)');
  console.log('======================================================================');
  console.log(`Chrome Executable: ${chromePath}`);
  console.log(`Git Revision:      ${gitRevision}`);
  console.log(`Target Receipt:    ${targetOutRel}`);
  console.log(`CDP Port:          ${PORT}\n`);

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--hide-scrollbars'
  ]);

  let versionData = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      versionData = await res.json();
      break;
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!versionData) {
    chromeProc.kill();
    throw new Error('Failed to connect to headless Chrome via CDP');
  }

  console.log(`Browser Engine:    ${versionData.Browser}`);
  console.log(`User Agent:        ${versionData['User-Agent']}`);
  console.log(`CDP Protocol:      ${versionData['Protocol-Version']}\n`);

  let totalAssertions = 0;
  const failureList = [];
  function verifiedAssert(cond, msg) {
    try {
      assert.ok(cond, msg);
      totalAssertions++;
    } catch (err) {
      failureList.push({ assertion: msg, error: err.message });
      throw err;
    }
  }

  const verifierScriptPath = 'scripts/verify-dollhouse-repair-witness.mjs';
  const verifierScriptSha = sha256(readFileSync(resolve(process.cwd(), verifierScriptPath)));

  const cleanWorkingTreeStatus = (function() {
    try {
      const statusOut = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
      const relevantLines = statusOut
        ? statusOut.split('\n').filter(l => !l.includes('scratch/') && !l.includes('witness_receipt') && !l.includes('artifacts/'))
        : [];
      return {
        verified_clean_before_run: relevantLines.length === 0,
        uncommitted_entries: relevantLines
      };
    } catch (err) {
      return {
        verified_clean_before_run: false,
        error: err.message
      };
    }
  })();

  if (requireClean && !cleanWorkingTreeStatus.verified_clean_before_run) {
    chromeProc.kill();
    throw new Error(`Working tree is not clean before witness run: ${JSON.stringify(cleanWorkingTreeStatus.uncommitted_entries)}`);
  }

  const receipt = {
    schema: 'td613.dollhouse-design.browser-witness-receipt/v0.2',
    timestamp: new Date().toISOString(),
    repository: process.env.GITHUB_REPOSITORY || 'tauric-diana-613/TD613-TCP',
    workflow_run_id: process.env.GITHUB_RUN_ID || null,
    workflow_job: process.env.GITHUB_JOB || null,
    browser_engine: versionData.Browser,
    user_agent: versionData['User-Agent'],
    cdp_protocol: versionData['Protocol-Version'],
    witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS',
    source_revision: gitRevision,
    clean_working_tree_precheck: cleanWorkingTreeStatus,
    verifier_script: {
      path: verifierScriptPath,
      sha256: verifierScriptSha
    },
    predecessor_witness: {
      source_revision: 'cf4f365802dbdefe4781f37afcce9a0e342f7227',
      preserved_receipt_path: 'tests/fixtures/dollhouse/witness_receipt_predecessor_cf4f36580.json',
      total_assertions_checked: 32
    },
    total_assertions_checked: 0,
    disposition: 'PENDING',
    failures: failureList,
    artifacts: []
  };

  try {
    // =============================================================
    // WITNESS 1: Sedgwick Paratactic Surface
    // =============================================================
    console.log('--- WITNESS 1: Sedgwick Paratactic Surface (Visual Reading Beside-ness) ---');
    const sedgwickRelPath = 'tests/fixtures/dollhouse/sedgwick_paratactic_surface.html';
    const sedgwickPath = resolve(process.cwd(), sedgwickRelPath);
    const sedgwickBytes = readFileSync(sedgwickPath);
    const sedgwickDigest = sha256(sedgwickBytes);
    const sedgwickUrl = pathToFileURL(sedgwickPath).href;

    console.log(`  • Path:    ${sedgwickRelPath}`);
    console.log(`  • Bytes:   ${sedgwickBytes.length}`);
    console.log(`  • SHA-256: ${sedgwickDigest}`);

    const pageRes1 = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: 'PUT' });
    const target1 = await pageRes1.json();
    const client1 = new CdpClient(target1.webSocketDebuggerUrl);
    await client1.connect();

    await client1.send('Page.enable');
    await client1.send('DOM.enable');
    await client1.send('Runtime.enable');

    const sedgwickWitness = {
      path: sedgwickRelPath,
      byte_count: sedgwickBytes.length,
      sha256: sedgwickDigest,
      viewports: {}
    };

    // Desktop: 1440x900
    console.log('  [Desktop 1440x900 Evaluation]');
    await client1.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client1.send('Page.navigate', { url: sedgwickUrl });
    await new Promise(r => setTimeout(r, 600));

    const desktopMetrics1 = await client1.send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyWidth: document.body.getBoundingClientRect().width,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      })`,
      returnByValue: true
    });
    const dm1 = desktopMetrics1.result.value;
    verifiedAssert(dm1.overflowPx === 0, `Desktop horizontal overflow must be 0px, got ${dm1.overflowPx}px`);
    console.log(`    ✓ Desktop overflowPx === 0 (scrollWidth: ${dm1.scrollWidth}px, clientWidth: ${dm1.clientWidth}px)`);

    // Verify touch targets >= 44px
    const touchTargets1 = await client1.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('button.interactive-btn, .fragment-card')).map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, id: el.id, w: r.width, h: r.height, pass: r.width >= 44 && r.height >= 44 };
      })`,
      returnByValue: true
    });
    const tt1 = touchTargets1.result.value;
    verifiedAssert(tt1.every(t => t.pass), 'All interactive buttons and cards must meet minimum 44px touch target');
    console.log(`    ✓ Verified ${tt1.length} interactive targets meet >= 44px touch target`);

    // Exercise Reduced Motion toggle
    await client1.send('Runtime.evaluate', {
      expression: `document.getElementById('toggle-motion').click()`
    });
    const motionActive1 = await client1.send('Runtime.evaluate', {
      expression: `document.body.classList.contains('reduced-motion')`,
      returnByValue: true
    });
    verifiedAssert(motionActive1.result.value === true, 'Reduced motion class must be active after click');
    console.log('    ✓ Reduced motion control activates zero-duration transition state');

    // Exercise Rest / Pause Sequence
    await client1.send('Runtime.evaluate', {
      expression: `document.getElementById('pause-btn').click()`
    });
    const pauseStatus1 = await client1.send('Runtime.evaluate', {
      expression: `document.getElementById('rest-banner').textContent`,
      returnByValue: true
    });
    verifiedAssert(pauseStatus1.result.value.includes('Reading paused safely'), 'Rest sequence must display unpenalized pause');
    console.log('    ✓ Child-legible rest/pause sequence activates without state loss or penalty');

    // Exercise Exit Sequence
    await client1.send('Runtime.evaluate', {
      expression: `document.getElementById('exit-btn').click()`
    });
    const exitStatus1 = await client1.send('Runtime.evaluate', {
      expression: `document.getElementById('rest-banner').textContent`,
      returnByValue: true
    });
    verifiedAssert(exitStatus1.result.value.includes('Exited reading surface cleanly'), 'Exit sequence must acknowledge clean human closure');
    console.log('    ✓ Safe exit sequence functions without trapping or penalizing the operator');

    sedgwickWitness.viewports.desktop = {
      width: 1440,
      height: 900,
      overflowPx: dm1.overflowPx,
      touch_targets_verified: tt1.length,
      reduced_motion_verified: true,
      rest_sequence_verified: true,
      exit_sequence_verified: true
    };

    // Mobile: 390x844
    console.log('  [Mobile 390x844 Evaluation]');
    await client1.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 400));

    const mobileMetrics1 = await client1.send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyWidth: document.body.getBoundingClientRect().width,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      })`,
      returnByValue: true
    });
    const mm1 = mobileMetrics1.result.value;
    verifiedAssert(mm1.overflowPx === 0, `Mobile horizontal overflow must be 0px, got ${mm1.overflowPx}px`);
    console.log(`    ✓ Mobile overflowPx === 0 (scrollWidth: ${mm1.scrollWidth}px, clientWidth: ${mm1.clientWidth}px)`);

    sedgwickWitness.viewports.mobile = {
      width: 390,
      height: 844,
      overflowPx: mm1.overflowPx
    };

    client1.close();
    receipt.artifacts.push(sedgwickWitness);

    // =============================================================
    // WITNESS 2: Theoretical Counterpoint Treatise
    // =============================================================
    console.log('\n--- WITNESS 2: Theoretical Counterpoint Treatise (Polyphonic Contrapuntalism) ---');
    const theoRelPath = 'tests/fixtures/dollhouse/theoretical_counterpoint_treatise.html';
    const theoPath = resolve(process.cwd(), theoRelPath);
    const theoBytes = readFileSync(theoPath);
    const theoDigest = sha256(theoBytes);
    const theoUrl = pathToFileURL(theoPath).href;

    console.log(`  • Path:    ${theoRelPath}`);
    console.log(`  • Bytes:   ${theoBytes.length}`);
    console.log(`  • SHA-256: ${theoDigest}`);

    const pageRes2 = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: 'PUT' });
    const target2 = await pageRes2.json();
    const client2 = new CdpClient(target2.webSocketDebuggerUrl);
    await client2.connect();

    await client2.send('Page.enable');
    await client2.send('DOM.enable');
    await client2.send('Runtime.enable');

    const theoWitness = {
      path: theoRelPath,
      byte_count: theoBytes.length,
      sha256: theoDigest,
      viewports: {}
    };

    // Desktop: 1440x900
    console.log('  [Desktop 1440x900 Evaluation]');
    await client2.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client2.send('Page.navigate', { url: theoUrl });
    await new Promise(r => setTimeout(r, 600));

    const desktopMetrics2 = await client2.send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      })`,
      returnByValue: true
    });
    const dm2 = desktopMetrics2.result.value;
    verifiedAssert(dm2.overflowPx === 0, `Desktop horizontal overflow must be 0px, got ${dm2.overflowPx}px`);
    console.log(`    ✓ Desktop overflowPx === 0 (scrollWidth: ${dm2.scrollWidth}px, clientWidth: ${dm2.clientWidth}px)`);

    // Verify touch targets >= 44px
    const touchTargets2 = await client2.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('.action-btn, .strata-card')).map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, id: el.id, w: r.width, h: r.height, pass: r.width >= 44 && r.height >= 44 };
      })`,
      returnByValue: true
    });
    const tt2 = touchTargets2.result.value;
    verifiedAssert(tt2.every(t => t.pass), 'All action buttons and strata cards must meet minimum 44px touch target');
    console.log(`    ✓ Verified ${tt2.length} interactive targets meet >= 44px touch target`);

    // Exercise Rest / Resume sequence
    await client2.send('Runtime.evaluate', {
      expression: `document.getElementById('rest-toggle').click()`
    });
    const restText2 = await client2.send('Runtime.evaluate', {
      expression: `document.getElementById('notice-box').textContent`,
      returnByValue: true
    });
    verifiedAssert(restText2.result.value.includes('Reading paused safely'), 'Rest sequence must display unpenalized pause');
    console.log('    ✓ Theoretical rest sequence verified');

    // Exercise Exit sequence
    await client2.send('Runtime.evaluate', {
      expression: `document.getElementById('exit-toggle').click()`
    });
    const exitText2 = await client2.send('Runtime.evaluate', {
      expression: `document.getElementById('notice-box').textContent`,
      returnByValue: true
    });
    verifiedAssert(exitText2.result.value.includes('Exited discourse safely'), 'Exit sequence must confirm safe closure');
    console.log('    ✓ Theoretical exit sequence verified');

    theoWitness.viewports.desktop = {
      width: 1440,
      height: 900,
      overflowPx: dm2.overflowPx,
      touch_targets_verified: tt2.length,
      rest_sequence_verified: true,
      exit_sequence_verified: true
    };

    // Mobile: 390x844
    console.log('  [Mobile 390x844 Evaluation]');
    await client2.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 400));

    const mobileMetrics2 = await client2.send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      })`,
      returnByValue: true
    });
    const mm2 = mobileMetrics2.result.value;
    verifiedAssert(mm2.overflowPx === 0, `Mobile horizontal overflow must be 0px, got ${mm2.overflowPx}px`);
    console.log(`    ✓ Mobile overflowPx === 0 (scrollWidth: ${mm2.scrollWidth}px, clientWidth: ${mm2.clientWidth}px)`);

    theoWitness.viewports.mobile = {
      width: 390,
      height: 844,
      overflowPx: mm2.overflowPx
    };

    client2.close();
    receipt.artifacts.push(theoWitness);

    // =============================================================
    // WITNESS 3: Butlerian Performative Iteration Surface (Scope D)
    // =============================================================
    console.log('\n--- WITNESS 3: Butlerian Performative Iteration Surface (Fresh Commission Scope D) ---');
    const butlerRelPath = 'tests/fixtures/dollhouse/butler_performative_surface.html';
    const butlerPath = resolve(process.cwd(), butlerRelPath);
    const butlerBytes = readFileSync(butlerPath);
    const butlerDigest = sha256(butlerBytes);
    const butlerUrl = pathToFileURL(butlerPath).href;

    console.log(`  • Path:    ${butlerRelPath}`);
    console.log(`  • Bytes:   ${butlerBytes.length}`);
    console.log(`  • SHA-256: ${butlerDigest}`);

    const pageRes3 = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: 'PUT' });
    const target3 = await pageRes3.json();
    const client3 = new CdpClient(target3.webSocketDebuggerUrl);
    await client3.connect();

    await client3.send('Page.enable');
    await client3.send('DOM.enable');
    await client3.send('Runtime.enable');

    const butlerWitness = {
      path: butlerRelPath,
      byte_count: butlerBytes.length,
      sha256: butlerDigest,
      viewports: {}
    };

    // Desktop: 1440x900
    console.log('  [Desktop 1440x900 Evaluation]');
    await client3.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client3.send('Page.navigate', { url: butlerUrl });
    await new Promise(r => setTimeout(r, 600));

    const desktopMetrics3 = await client3.send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      })`,
      returnByValue: true
    });
    const dm3 = desktopMetrics3.result.value;
    verifiedAssert(dm3.overflowPx === 0, `Desktop horizontal overflow must be 0px, got ${dm3.overflowPx}px`);
    console.log(`    ✓ Desktop overflowPx === 0 (scrollWidth: ${dm3.scrollWidth}px, clientWidth: ${dm3.clientWidth}px)`);

    // Verify touch targets >= 44px
    const touchTargets3 = await client3.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('button.interactive-btn, .iteration-card')).map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, id: el.id, w: r.width, h: r.height, pass: r.width >= 44 && r.height >= 44 };
      })`,
      returnByValue: true
    });
    const tt3 = touchTargets3.result.value;
    verifiedAssert(tt3.every(t => t.pass), 'All interactive buttons and iteration cards must meet minimum 44px touch target');
    console.log(`    ✓ Verified ${tt3.length} interactive targets meet >= 44px touch target`);

    // Exercise Falsification Probe (epsilon = 0.0)
    await client3.send('Runtime.evaluate', {
      expression: `document.getElementById('reset-falsify').click()`
    });
    await new Promise(r => setTimeout(r, 400));
    const probeStatusText = await client3.send('Runtime.evaluate', {
      expression: `document.getElementById('probe-status').textContent`,
      returnByValue: true
    });
    verifiedAssert(probeStatusText.result.value.includes('FALSIFICATION PROBE ACTIVE'), 'Falsification probe must activate when epsilon = 0.0');

    // Remaining C: Verify COMPUTED styles under epsilon = 0.0 (mechanical baseline)
    const computedBaseline = await client3.send('Runtime.evaluate', {
      expression: `[0, 1, 2, 3, 4].map(n => {
        const el = document.getElementById('text-' + n);
        const cs = window.getComputedStyle(el);
        return {
          n,
          letterSpacing: cs.letterSpacing,
          letterSpacingPx: parseFloat(cs.letterSpacing) || 0,
          transform: cs.transform,
          fontWeight: cs.fontWeight
        };
      })`,
      returnByValue: true
    });
    const baselineItems = computedBaseline.result.value;
    verifiedAssert(
      baselineItems.every(item => Math.abs(item.letterSpacingPx) < 0.01),
      `Computed letterSpacing must collapse to 0px across all iterations when epsilon = 0.0, got: ${JSON.stringify(baselineItems)}`
    );
    verifiedAssert(
      baselineItems.every(item => item.transform === 'none' || item.transform.includes('matrix(1, 0, 0, 1, 0, 0)')),
      'Computed transform must collapse to identity/none across all iterations when epsilon = 0.0'
    );
    verifiedAssert(
      baselineItems.every(item => item.fontWeight === '400'),
      'Computed fontWeight must be 400 across all iterations when epsilon = 0.0'
    );
    console.log('    ✓ Butlerian falsification probe verified via real computed styles (letterSpacing === 0px, transform === none, fontWeight === 400)');

    // Exercise Dynamic Slippage (epsilon = 1.5)
    await client3.send('Runtime.evaluate', {
      expression: `(function() {
        const slider = document.getElementById('epsilon-slider');
        slider.value = 1.5;
        slider.dispatchEvent(new Event('input'));
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    // Remaining C: Verify COMPUTED styles under epsilon = 1.5
    const computedDrift = await client3.send('Runtime.evaluate', {
      expression: `[0, 1, 2, 3, 4].map(n => {
        const el = document.getElementById('text-' + n);
        const cs = window.getComputedStyle(el);
        return {
          n,
          letterSpacingPx: parseFloat(cs.letterSpacing) || 0,
          transform: cs.transform,
          fontWeight: parseInt(cs.fontWeight, 10) || 400
        };
      })`,
      returnByValue: true
    });
    const driftItems = computedDrift.result.value;
    // Iteration 0 (n=0): ln(1) = 0, remains baseline
    verifiedAssert(Math.abs(driftItems[0].letterSpacingPx) < 0.01, 'Iteration 0 must remain unperturbed baseline (0px)');
    // Iteration 4 (n=4): ln(5)*3.0*1.5 ~= 7.24px
    verifiedAssert(driftItems[4].letterSpacingPx > 5.0, `Iteration 4 computed letterSpacing must be > 5.0px under epsilon = 1.5, got ${driftItems[4].letterSpacingPx}px`);
    // Iterations 1..4 must exhibit strictly monotonic increase in computed letterSpacing
    for (let i = 1; i < driftItems.length; i++) {
      verifiedAssert(
        driftItems[i].letterSpacingPx > driftItems[i - 1].letterSpacingPx,
        `Computed letterSpacing must increase monotonically across iterations (item ${i}: ${driftItems[i].letterSpacingPx}px > item ${i-1}: ${driftItems[i-1].letterSpacingPx}px)`
      );
    }
    // Transform must exhibit non-identity matrix for n=4
    verifiedAssert(driftItems[4].transform !== 'none', 'Iteration 4 computed transform must not be none under epsilon = 1.5');
    // FontWeight must decrease due to slippage
    verifiedAssert(driftItems[4].fontWeight < 400, `Iteration 4 computed fontWeight must be < 400, got ${driftItems[4].fontWeight}`);
    console.log(`    ✓ Dynamic citational slippage verified via real computed styles (iter 4 letterSpacing: ${driftItems[4].letterSpacingPx.toFixed(2)}px, transform: ${driftItems[4].transform}, fontWeight: ${driftItems[4].fontWeight})`);

    // Exercise Reduced Motion
    await client3.send('Runtime.evaluate', {
      expression: `document.getElementById('toggle-motion').click()`
    });
    const motionActive3 = await client3.send('Runtime.evaluate', {
      expression: `document.body.classList.contains('reduced-motion')`,
      returnByValue: true
    });
    verifiedAssert(motionActive3.result.value === true, 'Reduced motion class must be active after click');
    console.log('    ✓ Reduced motion control verified');

    // Exercise Rest / Pause Sequence
    await client3.send('Runtime.evaluate', {
      expression: `document.getElementById('pause-btn').click()`
    });
    const restText3 = await client3.send('Runtime.evaluate', {
      expression: `document.getElementById('rest-banner').textContent`,
      returnByValue: true
    });
    verifiedAssert(restText3.result.value.includes('paused safely'), 'Rest sequence must display unpenalized pause');
    console.log('    ✓ Citational rest sequence verified');

    // Exercise Exit Sequence
    await client3.send('Runtime.evaluate', {
      expression: `document.getElementById('exit-btn').click()`
    });
    const exitText3 = await client3.send('Runtime.evaluate', {
      expression: `document.getElementById('rest-banner').textContent`,
      returnByValue: true
    });
    verifiedAssert(exitText3.result.value.includes('Exited citational altar cleanly'), 'Exit sequence must confirm safe closure');
    console.log('    ✓ Citational exit sequence verified');

    // Remaining D: Distinct assertions for Khonalit-po U+200C, display glyph U+1D30B, and declared mark U+10D613
    const covenantCheck = await client3.send('Runtime.evaluate', {
      expression: `({
        hasKhonalitPoU200C: document.body.textContent.includes('Khona\u200Clit-po'),
        hasDisplayGlyphU1D30B: document.body.textContent.includes('𝌋'),
        hasDeclaredMarkU10D613: document.body.textContent.includes('\uDBF5\uDE13')
      })`,
      returnByValue: true
    });
    verifiedAssert(covenantCheck.result.value.hasKhonalitPoU200C, 'Covenant string Khona‌lit-po with zero-width non-joiner U+200C must be preserved in DOM');
    verifiedAssert(covenantCheck.result.value.hasDisplayGlyphU1D30B, 'Display glyph 𝌋 (Unicode U+1D30B) must be preserved in DOM');
    verifiedAssert(covenantCheck.result.value.hasDeclaredMarkU10D613, 'Declared research scalar mark U+10D613 (surrogate pair \\uDBF5\\uDE13) must be preserved in DOM');
    console.log('    ✓ Khona‌lit-po covenant (U+200C), display glyph (U+1D30B), and research mark (U+10D613) independently verified in DOM');

    butlerWitness.planning_receipt_origin = 'tests/fixtures/dollhouse/butler_conductor_receipt.json (generated by runDollhouseDesignCycle)';
    butlerWitness.materialization_author = 'Human/agent author materialized tests/fixtures/dollhouse/butler_performative_surface.html to execute conductor contract';
    butlerWitness.witness_authority = 'PHYSICAL_CDP_BROWSER_WITNESS';
    butlerWitness.computed_style_observations = {
      falsification_baseline: baselineItems,
      dynamic_slippage: driftItems
    };

    butlerWitness.viewports.desktop = {
      width: 1440,
      height: 900,
      overflowPx: dm3.overflowPx,
      touch_targets_verified: tt3.length,
      falsification_probe_verified: true,
      dynamic_slippage_verified: true,
      reduced_motion_verified: true,
      rest_sequence_verified: true,
      exit_sequence_verified: true,
      covenant_verified: true
    };

    // Mobile: 390x844
    console.log('  [Mobile 390x844 Evaluation]');
    await client3.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 400));

    const mobileMetrics3 = await client3.send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      })`,
      returnByValue: true
    });
    const mm3 = mobileMetrics3.result.value;
    verifiedAssert(mm3.overflowPx === 0, `Mobile horizontal overflow must be 0px, got ${mm3.overflowPx}px`);
    console.log(`    ✓ Mobile overflowPx === 0 (scrollWidth: ${mm3.scrollWidth}px, clientWidth: ${mm3.clientWidth}px)`);

    butlerWitness.viewports.mobile = {
      width: 390,
      height: 844,
      overflowPx: mm3.overflowPx
    };

    client3.close();
    receipt.artifacts.push(butlerWitness);

    receipt.total_assertions_checked = totalAssertions;
    receipt.disposition = 'WITNESS_VERIFIED_PASS';

    const outPath = resolve(process.cwd(), targetOutRel);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(receipt, null, 2), 'utf8');

    console.log('\n======================================================================');
    console.log(`  ✓ REAL CHROMIUM BROWSER WITNESS COMPLETE: ${totalAssertions}/${totalAssertions} ASSERTIONS PASSED`);
    console.log(`  Receipt: ${outPath}`);
    console.log('======================================================================\n');
  } finally {
    chromeProc.kill();
  }
}

runWitnessSuite().catch(err => {
  console.error('\n❌ Browser witness failed:', err);
  process.exit(1);
});
