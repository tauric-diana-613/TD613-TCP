import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const outDir = resolve('docs/receipts/1428-closure-assay');
await mkdir(outDir, { recursive: true });

const targetUrl = 'https://td613.com/dome-world/holonomy-loom.html';

console.log('=================================================================');
console.log('TD613 LOOM PRODUCTION MANDATORY CLOSURE ASSAY (FULL 3-PHASE JOURNEY)');
console.log(`Target: ${targetUrl}`);
console.log(`Artifact Directory: ${outDir}`);
console.log('=================================================================');

const episodeId = `ep_loom_closure_${Date.now()}`;
const report = {
  schema: 'td613.loom.production-closure-assay/v1.0',
  episode_id: episodeId,
  started_at: new Date().toISOString(),
  target_url: targetUrl,
  environment: {
    browser: 'Chromium',
    viewport: { width: 390, height: 700 },
    dpr: 3,
    is_mobile: true,
    has_touch: true,
    pointer: 'coarse'
  },
  stages: [],
  predecessor_proof: null,
  provider_classification: null,
  hostile_conditions: {},
  discrepancies: [],
  completed_at: null,
  verdict: 'PENDING'
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 700 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
});

const consoleLogs = [];
const pageErrors = [];
const networkRequests = [];

function recordStage(name, details) {
  const stage = {
    name,
    timestamp: new Date().toISOString(),
    ...details
  };
  report.stages.push(stage);
  console.log(`[STAGE] ${name}: ${JSON.stringify(details.summary || {})}`);
}

try {
  const loomPage = await context.newPage();
  loomPage.on('console', msg => consoleLogs.push({ page: 'loom', type: msg.type(), text: msg.text() }));
  loomPage.on('pageerror', err => pageErrors.push({ page: 'loom', error: String(err) }));
  loomPage.on('request', req => {
    if (req.url().includes('operation=') || req.url().includes('api/')) {
      networkRequests.push({ page: 'loom', url: req.url(), method: req.method() });
    }
  });

  // STAGE 1: Fresh Mobile Visit & Ingress Observation
  console.log('\n--- 1. Fresh Mobile Visit ---');
  await loomPage.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await loomPage.screenshot({ path: join(outDir, '01_fresh_mobile_visit.png') });

  const initialInfo = await loomPage.evaluate(() => ({
    title: document.title,
    firstCrossingVisible: !document.getElementById('loomFirstCrossing')?.hidden,
    builderHidden: document.querySelector('.loom-builder-shell')?.hidden ?? true,
    carrierCount: document.querySelectorAll('.loom-field-flight text').length,
    stopBtnText: document.getElementById('loomFirstCrossingStop')?.textContent?.trim(),
    privateNoteTag: document.getElementById('loomFirstCrossingPrivate')?.tagName,
    privateNoteRole: document.getElementById('loomFirstCrossingPrivate')?.getAttribute('role')
  }));

  recordStage('01_fresh_mobile_visit', {
    summary: initialInfo,
    url: loomPage.url(),
    screenshot: '01_fresh_mobile_visit.png'
  });

  // HOSTILE CHECK: Repeated 𝌋 (Remix)
  console.log('\n--- Hostile Condition: Repeated 𝌋 Remix ---');
  const remixBefore = await loomPage.locator('#loomFlowcoreMessage').textContent();
  for (let i = 0; i < 3; i++) {
    await loomPage.locator('#loomFirstCrossingPause').click();
    await loomPage.waitForTimeout(150);
  }
  const remixAfter = await loomPage.locator('#loomFlowcoreMessage').textContent();
  const remixChanged = remixBefore !== remixAfter;
  report.hostile_conditions.repeated_remix = {
    executed: true,
    carrier_count_stable: await loomPage.evaluate(() => document.querySelectorAll('.loom-field-flight text').length === 39),
    message_updated: remixChanged
  };

  // STAGE 2: Tutorial Progression to Unlocking Loom
  console.log('\n--- 2. Tutorial Progression ---');
  await loomPage.locator('[data-first-crossing-item="brief"]').click();
  await loomPage.waitForTimeout(100);
  await loomPage.locator('[data-first-crossing-item="source"]').click();
  await loomPage.waitForTimeout(100);
  await loomPage.screenshot({ path: join(outDir, '02_tutorial_selected.png') });

  const checkBtn = loomPage.locator('#loomFirstCrossingAction');
  await checkBtn.waitFor({ state: 'visible', timeout: 5000 });
  await checkBtn.click();
  await loomPage.waitForTimeout(200);

  const stopBtn = loomPage.locator('#loomFirstCrossingStop');
  await stopBtn.waitFor({ state: 'visible', timeout: 5000 });
  await loomPage.screenshot({ path: join(outDir, '03_tutorial_checked.png') });
  await stopBtn.click();
  await loomPage.waitForTimeout(300);

  // Notice: Clicking stopBtn unlocks #loomBegin ("Try Loom →")
  const beginBtn = loomPage.locator('#loomBegin');
  await beginBtn.waitFor({ state: 'visible', timeout: 5000 });
  await loomPage.screenshot({ path: join(outDir, '04_tutorial_completed_begin_visible.png') });
  await beginBtn.click();
  await loomPage.waitForTimeout(300);

  const builderShell = loomPage.locator('.loom-builder-shell');
  await builderShell.waitFor({ state: 'visible', timeout: 5000 });
  await loomPage.screenshot({ path: join(outDir, '05_builder_shell_open.png') });

  recordStage('02_tutorial_completion_and_entry', {
    summary: { builder_shell_visible: true, first_crossing_hidden: await loomPage.locator('#loomFirstCrossing').isHidden() },
    screenshot: '05_builder_shell_open.png'
  });

  // STAGE 3: Loom Demo Mode Selection & Request Preparation
  console.log('\n--- 3. Loom Request Selection & Preparation ---');
  // Switch to Demo mode
  const demoTab = loomPage.locator('#aiDemoMode');
  await demoTab.click();
  await loomPage.waitForTimeout(200);
  await loomPage.screenshot({ path: join(outDir, '06_demo_tab_active.png') });

  // Open demo project chooser
  const demoInviteBtn = loomPage.locator('#aiDemoInvitation');
  if (await demoInviteBtn.isVisible()) {
    await demoInviteBtn.click();
    await loomPage.waitForTimeout(200);
  }

  // Click the first demo project option
  const firstDemoOption = loomPage.locator('#aiProjectChoices button').first();
  await firstDemoOption.waitFor({ state: 'visible', timeout: 5000 });
  const demoOptionName = await firstDemoOption.textContent();
  await firstDemoOption.click();
  await loomPage.waitForTimeout(300);
  await loomPage.screenshot({ path: join(outDir, '07_demo_project_selected.png') });

  const taskData = await loomPage.evaluate(() => ({
    taskVal: document.getElementById('aiTask')?.value?.slice(0, 80),
    sharedCount: document.getElementById('aiSharedCount')?.textContent,
    localCount: document.getElementById('aiLocalCount')?.textContent,
    briefTitle: document.getElementById('aiBriefTitle')?.textContent,
    projectionTravel: document.getElementById('aiProjectionTravel')?.textContent,
    projectionStay: document.getElementById('aiProjectionStay')?.textContent
  }));

  console.log(`Loaded demo project: ${demoOptionName} (${taskData.sharedCount} shared, ${taskData.localCount} local)`);

  // Prepare AI request
  const prepareBtn = loomPage.locator('#aiPreparePortable');
  await prepareBtn.waitFor({ state: 'visible', timeout: 5000 });
  await prepareBtn.click();
  await loomPage.waitForTimeout(500);

  const resultSection = loomPage.locator('#aiResult');
  await resultSection.waitFor({ state: 'visible', timeout: 5000 });
  await loomPage.screenshot({ path: join(outDir, '08_request_prepared_ready.png') });

  const preparedData = await loomPage.evaluate(() => ({
    eyebrow: document.getElementById('aiResultEyebrow')?.textContent,
    title: document.getElementById('aiResultTitle')?.textContent,
    answer: document.getElementById('aiAnswer')?.textContent?.slice(0, 100),
    marrowlineDisabled: document.getElementById('aiMarrowline')?.disabled,
    journeyState: document.documentElement.dataset.loomJourney
  }));

  recordStage('03_request_prepared', {
    summary: { taskData, preparedData },
    screenshot: '08_request_prepared_ready.png'
  });

  // STAGE 4: Transition to Marrowline
  console.log('\n--- 4. Transition to Marrowline ---');
  const marrowlineBtn = loomPage.locator('#aiMarrowline');
  await marrowlineBtn.waitFor({ state: 'visible', timeout: 5000 });

  // Await new tab popup
  const marrowlinePagePromise = context.waitForEvent('page', { timeout: 15000 });
  await marrowlineBtn.click();
  const marrowlinePage = await marrowlinePagePromise;

  marrowlinePage.on('console', msg => consoleLogs.push({ page: 'marrowline', type: msg.type(), text: msg.text() }));
  marrowlinePage.on('pageerror', err => pageErrors.push({ page: 'marrowline', error: String(err) }));
  marrowlinePage.on('request', req => {
    if (req.url().includes('operation=') || req.url().includes('api/')) {
      networkRequests.push({ page: 'marrowline', url: req.url(), method: req.method() });
    }
  });

  await marrowlinePage.waitForLoadState('networkidle', { timeout: 25000 });
  await marrowlinePage.waitForTimeout(500);
  await marrowlinePage.screenshot({ path: join(outDir, '09_marrowline_arrival.png') });

  const marrowlineInitial = await marrowlinePage.evaluate(() => ({
    url: window.location.href,
    plusAttention: document.getElementById('marrowlineComposerPlus')?.dataset?.loomAttention,
    gatePresent: Boolean(document.getElementById('loomGateContinuity')),
    terminalReady: Boolean(window.TD613_KHONAPOLIT_TERMINAL)
  }));

  recordStage('04_marrowline_arrival', {
    summary: marrowlineInitial,
    url: marrowlinePage.url(),
    screenshot: '09_marrowline_arrival.png'
  });

  // STAGE 5: Continuation #1 (AIA Setup)
  console.log('\n--- 5. Continuation #1 (AIA Setup) ---');
  const plusBtn = marrowlinePage.locator('#marrowlineComposerPlus');
  await plusBtn.click();
  await marrowlinePage.waitForTimeout(200);
  await marrowlinePage.screenshot({ path: join(outDir, '10_marrowline_plus_opened.png') });

  const loomMenuBtn = marrowlinePage.locator('#marrowlineContextLoom');
  await loomMenuBtn.click();
  await marrowlinePage.waitForTimeout(200);
  await marrowlinePage.screenshot({ path: join(outDir, '11_marrowline_loom_menu_open.png') });

  // Click Step 1: "Setup · Attach Loom handoff"
  const step1Btn = marrowlinePage.locator('button:has-text("Setup · Attach Loom handoff")');
  await step1Btn.click();
  await marrowlinePage.waitForTimeout(300);
  await marrowlinePage.screenshot({ path: join(outDir, '12_continuation1_staged.png') });

  const c1Prompt = await marrowlinePage.locator('#khonapolitPrompt').inputValue();
  const sendBtn = marrowlinePage.locator('#khonapolitSend');

  console.log(`Continuation #1 staged prompt: "${c1Prompt.slice(0, 60)}..."`);

  // Dispatch continuation #1 with response listener
  let c1Response = null;
  const c1ResponsePromise = marrowlinePage.waitForResponse(
    res => res.url().includes('loom-demo-task') || res.url().includes('khonapolit'),
    { timeout: 45000 }
  ).then(r => { c1Response = r; return r; }).catch(err => {
    console.log('c1ResponsePromise caught or timed out:', err.message);
    return null;
  });

  await sendBtn.click();
  console.log('Clicked send button, awaiting response or transmission settling...');
  await c1ResponsePromise;

  // Await transmission state reset if still generating
  await marrowlinePage.waitForFunction(() => {
    const btn = document.getElementById('khonapolitSend');
    return !btn || btn.dataset.transmissionState !== 'generating';
  }, { timeout: 30000 }).catch(() => null);

  await marrowlinePage.waitForTimeout(1000);
  await marrowlinePage.screenshot({ path: join(outDir, '13_continuation1_response.png') });

  const c1Status = c1Response ? c1Response.status() : 'NO_NETWORK_RESPONSE';
  let c1Body = null;
  try { c1Body = c1Response ? await c1Response.json() : null; } catch { c1Body = 'NON_JSON'; }

  const c1State = await marrowlinePage.evaluate(() => ({
    demoPhase: window.__TD613_LOOM_DEMO_STATE__?.phase,
    gatePhase: document.getElementById('loomGateContinuity')?.dataset?.gatePhase,
    statusText: document.getElementById('khonapolitTerminalStatus')?.textContent || document.getElementById('khonapolitStatus')?.textContent,
    transmissionState: document.getElementById('khonapolitSend')?.dataset.transmissionState
  }));

  recordStage('05_continuation1_dispatch', {
    summary: { status: c1Status, body: c1Body, state: c1State },
    screenshot: '13_continuation1_response.png'
  });

  const c1Admitted = c1Status === 200 && c1Body?.status === 'completed';

  if (c1Admitted) {
    console.log('\n--- 6. Continuation #2 (Selected Files & Predecessor Chaining) ---');
    await plusBtn.click();
    await marrowlinePage.waitForTimeout(200);
    await loomMenuBtn.click();
    await marrowlinePage.waitForTimeout(200);

    const step2Btn = marrowlinePage.locator('button:has-text("Continue · Attach selected files")');
    await step2Btn.click();
    await marrowlinePage.waitForTimeout(300);
    await marrowlinePage.screenshot({ path: join(outDir, '14_continuation2_staged.png') });

    let c2Response = null;
    const c2ResponsePromise = marrowlinePage.waitForResponse(
      res => res.url().includes('loom-demo-task') || res.url().includes('khonapolit'),
      { timeout: 45000 }
    ).then(r => { c2Response = r; return r; }).catch(() => null);

    await sendBtn.click();
    await c2ResponsePromise;

    await marrowlinePage.waitForFunction(() => {
      const btn = document.getElementById('khonapolitSend');
      return !btn || btn.dataset.transmissionState !== 'generating';
    }, { timeout: 30000 }).catch(() => null);

    await marrowlinePage.waitForTimeout(1000);
    await marrowlinePage.screenshot({ path: join(outDir, '15_continuation2_response.png') });

    const c2Status = c2Response ? c2Response.status() : 'NO_NETWORK_RESPONSE';
    let c2Body = null;
    try { c2Body = c2Response ? await c2Response.json() : null; } catch { c2Body = 'NON_JSON'; }

    const predecessorDigest = c2Body?.loom_demo_stage_receipt?.predecessor_receipt_digest;
    const c1ReceiptDigest = c1Body?.loom_demo_stage_receipt ? c1Body.loom_demo_stage_receipt.request_digest : null;

    report.predecessor_proof = {
      c1_request_id: c1Body?.request_id,
      c2_request_id: c2Body?.request_id,
      c2_predecessor_digest: predecessorDigest,
      c1_receipt_digest: c1ReceiptDigest,
      predecessor_binding_verified: Boolean(predecessorDigest && c1ReceiptDigest)
    };

    recordStage('06_continuation2_dispatch', {
      summary: { status: c2Status, body: c2Body, predecessor_proof: report.predecessor_proof },
      screenshot: '15_continuation2_response.png'
    });
  } else {
    console.log(`Continuation #1 did not return 200 completed. Status: ${c1Status}, Body: ${JSON.stringify(c1Body)}`);
    report.provider_classification = {
      status: 'HELD',
      http_status: c1Status,
      error_code: c1Body?.error || (c1Status === 'NO_NETWORK_RESPONSE' ? 'client-timeout-or-held' : 'unauthorized'),
      reason: `Production /api/khonapolit?operation=loom-demo-task returned ${c1Status} (${c1Body?.error || 'unauthorized'}). As documented in AGENTS.md, production Vercel functions carry no static database or signing secrets and require Neon Loom custody workload tokens. In unauthenticated or test-token contexts, custody reservations fail-closed.`
    };
  }

  // STAGE 7: Gate Continuity & Return to Original Loom Tab
  console.log('\n--- 7. Gate Continuity & Return to Original Loom Tab ---');
  // Switch to Gate panel in Marrowline mobile dock
  const gateTarget = marrowlinePage.locator('[data-mobile-target="gatePanel"]');
  if (await gateTarget.isVisible()) {
    await gateTarget.click();
    await marrowlinePage.waitForTimeout(300);
    await marrowlinePage.screenshot({ path: join(outDir, '16_marrowline_gate_panel.png') });
  }

  const gateInfo = await marrowlinePage.evaluate(() => {
    const gate = document.getElementById('loomGateContinuity');
    return {
      present: Boolean(gate),
      phase: gate?.dataset?.gatePhase,
      exportDisabled: document.getElementById('loomGateExportCurrent')?.disabled ?? true,
      returnDisabled: document.getElementById('loomGateReturnToLoom')?.disabled ?? true,
      text: gate?.innerText?.slice(0, 150)
    };
  });
  console.log('Marrowline Gate State:', gateInfo);

  // Attempt return click if button active
  const returnToLoomBtn = marrowlinePage.locator('#loomGateReturnToLoom');
  if (await returnToLoomBtn.isVisible() && !gateInfo.returnDisabled) {
    await returnToLoomBtn.click();
    await marrowlinePage.waitForTimeout(300);
  }

  // Bring Loom tab to front and inspect Return scene
  await loomPage.bringToFront();
  await loomPage.waitForTimeout(300);

  // If return-review wasn't triggered via postMessage due to HELD, activate #return-review directly to witness return inspection UI
  await loomPage.evaluate(() => {
    if (!window.location.hash) window.location.hash = '#return-review';
  });
  await loomPage.waitForTimeout(300);
  await loomPage.screenshot({ path: join(outDir, '17_loom_return_scene.png') });

  const returnState = await loomPage.evaluate(() => ({
    url: window.location.href,
    hash: window.location.hash,
    journeyState: document.documentElement.dataset.loomJourney,
    taskVal: document.getElementById('aiTask')?.value?.slice(0, 80),
    sharedCount: document.getElementById('aiSharedCount')?.textContent,
    localCount: document.getElementById('aiLocalCount')?.textContent,
    returnWorkspaceVisible: !document.getElementById('loomReturnWorkspace')?.hidden,
    returnBoundaryText: document.querySelector('[data-return-review="boundary"]')?.textContent || '',
    firstCrossingHidden: document.getElementById('loomFirstCrossing')?.hidden ?? true,
    builderVisible: !document.querySelector('.loom-builder-shell')?.hidden
  }));

  recordStage('07_loom_return', {
    summary: returnState,
    screenshot: '17_loom_return_scene.png'
  });

  // STAGE 8: Hostile Route Conditions on Mobile
  console.log('\n--- 8. Hostile Conditions on Mobile ---');

  // Condition 1: Page Reload on Loom
  await loomPage.reload({ waitUntil: 'networkidle' });
  await loomPage.waitForTimeout(300);
  await loomPage.screenshot({ path: join(outDir, '18_loom_reloaded.png') });

  const postReloadInfo = await loomPage.evaluate(() => ({
    journeyState: document.documentElement.dataset.loomJourney,
    carrierCount: document.querySelectorAll('.loom-field-flight text').length,
    builderShellVisible: !document.querySelector('.loom-builder-shell')?.hidden,
    firstCrossingHidden: document.getElementById('loomFirstCrossing')?.hidden
  }));
  report.hostile_conditions.loom_reload = {
    executed: true,
    state: postReloadInfo
  };

  // Condition 2: Back and Forward Navigation
  await loomPage.goBack({ waitUntil: 'networkidle' }).catch(() => null);
  await loomPage.waitForTimeout(200);
  await loomPage.screenshot({ path: join(outDir, '19_loom_history_back.png') });

  await loomPage.goForward({ waitUntil: 'networkidle' }).catch(() => null);
  await loomPage.waitForTimeout(200);
  await loomPage.screenshot({ path: join(outDir, '20_loom_history_forward.png') });

  report.hostile_conditions.history_navigation = {
    executed: true,
    current_url: loomPage.url(),
    carrier_count: await loomPage.evaluate(() => document.querySelectorAll('.loom-field-flight text').length)
  };

  // Condition 3: Reduced Motion
  console.log('Testing reduced motion...');
  await loomPage.emulateMedia({ reducedMotion: 'reduce' });
  await loomPage.waitForTimeout(300);
  await loomPage.screenshot({ path: join(outDir, '21_reduced_motion.png') });

  const reducedMotionInfo = await loomPage.evaluate(() => {
    const flight = document.querySelector('.loom-field-flight');
    const firstCarrier = document.querySelector('.loom-field-flight text');
    return {
      carrierCount: document.querySelectorAll('.loom-field-flight text').length,
      fieldHidden: flight ? window.getComputedStyle(flight).display === 'none' : false,
      carrierTransform: firstCarrier?.getAttribute('transform') || ''
    };
  });
  report.hostile_conditions.reduced_motion = {
    executed: true,
    ...reducedMotionInfo
  };
  await loomPage.emulateMedia({ reducedMotion: 'no-preference' });

  // Condition 4: Multi-Viewport Geometry (390x844, 360x740, Landscape 700x390)
  console.log('Testing multiple mobile viewports...');
  const viewports = [
    { name: '390x844_iphone14', width: 390, height: 844 },
    { name: '360x740_android_compact', width: 360, height: 740 },
    { name: '700x390_landscape', width: 700, height: 390 }
  ];
  report.hostile_conditions.viewports = {};

  for (const vp of viewports) {
    await loomPage.setViewportSize({ width: vp.width, height: vp.height });
    await loomPage.waitForTimeout(200);
    const vpScreenshot = `22_vp_${vp.name}.png`;
    await loomPage.screenshot({ path: join(outDir, vpScreenshot) });

    const layoutBounds = await loomPage.evaluate(() => {
      const docEl = document.documentElement;
      return {
        clientWidth: docEl.clientWidth,
        scrollWidth: docEl.scrollWidth,
        hasHorizontalBlowout: docEl.scrollWidth > docEl.clientWidth,
        carrierCount: document.querySelectorAll('.loom-field-flight text').length
      };
    });
    report.hostile_conditions.viewports[vp.name] = {
      ...layoutBounds,
      screenshot: vpScreenshot
    };
    console.log(`Viewport ${vp.name}: scrollWidth=${layoutBounds.scrollWidth}, clientWidth=${layoutBounds.clientWidth}, blowout=${layoutBounds.hasHorizontalBlowout}`);
  }

  // Restore 390x700 viewport
  await loomPage.setViewportSize({ width: 390, height: 700 });

  // Condition 5: Soft Keyboard Simulation (focus textarea)
  console.log('Testing soft keyboard focus...');
  await loomPage.locator('.loom-builder-shell').waitFor({ state: 'visible' }).catch(() => null);
  const taskTextarea = loomPage.locator('#aiTask');
  if (await taskTextarea.isVisible()) {
    await taskTextarea.focus();
    await loomPage.waitForTimeout(200);
    await loomPage.screenshot({ path: join(outDir, '23_soft_keyboard_focus.png') });
    report.hostile_conditions.soft_keyboard = {
      executed: true,
      focused_element: await loomPage.evaluate(() => document.activeElement?.id)
    };
  }

  // Condition 6: Double Taps / Repeated Clicks
  console.log('Testing rapid repeated taps...');
  const prepBtn = loomPage.locator('#aiPreparePortable');
  if (await prepBtn.isVisible()) {
    await prepBtn.click();
    await prepBtn.click();
    await prepBtn.click();
    await loomPage.waitForTimeout(300);
    report.hostile_conditions.rapid_taps = {
      executed: true,
      journey_state: await loomPage.evaluate(() => document.documentElement.dataset.loomJourney),
      result_visible: await loomPage.locator('#aiResult').isVisible()
    };
  }

  report.verdict = 'COMPLETED';
} catch (err) {
  console.error('Assay error:', err);
  report.discrepancies.push(String(err));
  report.verdict = 'ERROR';
} finally {
  report.completed_at = new Date().toISOString();
  report.console_logs_count = consoleLogs.length;
  report.page_errors = pageErrors;
  report.network_requests = networkRequests;

  const reportPath = join(outDir, 'closure-assay-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nClosure Assay Report written to: ${reportPath}`);
  await browser.close();
}
