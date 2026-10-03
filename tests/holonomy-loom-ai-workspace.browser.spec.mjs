/** Run with node, matching the repository's existing per-engine browser witness lane.
 * This is a UI transport/admission fixture: the sole provider endpoint is intercepted.
 * It establishes no live Gemini quality, external-host protection or human comprehension.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';

const engine = process.env.TD613_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[engine];
if (!browserType) throw new TypeError('Unknown witness browser engine');
let server, base = process.env.TD613_BASE_URL;
if (!base) {
  const appRoot = path.resolve('app');
  server = http.createServer(async (req, res) => {
    try {
      const file = path.resolve(appRoot, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!file.startsWith(appRoot + path.sep)) throw new Error('invalid static path');
      const body = await fs.readFile(file);
      res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
      res.end(body);
    } catch { res.statusCode = 404; res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new TypeError('Fixture transport witness requires a local server.');
const dir = process.env.TD613_ARTIFACT_DIR || `artifacts/loom-ai-workspace/${engine}`;
await fs.mkdir(dir, { recursive: true });
const report = {
  schema: 'td613.loom.ai-workspace-browser-witness/v0.1', status: 'HELD', engine,
  source_sha: process.env.TD613_SOURCE_HEAD || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  checkout_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workflow_run_id: process.env.GITHUB_RUN_ID || null, run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
  working_tree_dirty: Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()),
  observed_at: new Date().toISOString(), context: 'REAL_LOCAL_UI_WITH_MOCK_PROVIDER_RESPONSE',
  live_provider_calls: 0, intercepted_task_requests: 0, human_comprehension_measured: false,
  checks: [], failures: []
};
async function bounded(promise) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Expected UI provider request did not arrive within 12 seconds')), 12000); })]); }
  finally { clearTimeout(timer); }
}
const fixture = LOOM_AI_PROJECTS[0];
const uploadCanary = 'LOCAL-UPLOAD-CANARY-DO-NOT-SEND-613';
const fixtureAnswer = '[MOCK PROVIDER RESPONSE — UI WITNESS] Supplier analysis: stated account fees and migration overages require separate arithmetic. Retention terms conflict; obtain a signed resolution before pilot approval.';
let browser;
try {
  browser = await browserType.launch({ headless: true, ...(engine === 'chromium' && process.env.TD613_BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.TD613_BROWSER_EXECUTABLE_PATH } : {}) });
  for (const [posture, viewport, reducedMotion] of [
    ['desktop', { width: 1280, height: 900 }, 'no-preference'],
    ['mobile-reduced', { width: 390, height: 844 }, 'reduce']
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion, acceptDownloads: true });
    await page.addInitScript(() => { try { localStorage.setItem('td613.loom.first-crossing.v1', 'complete'); } catch {} });
    page.setDefaultTimeout(12000);
    // OLD: tools lived in nested disclosures inside the primary route and the
    // builder/result stayed simultaneously visible. REAL: selected bytes,
    // governance and bounded evidence must remain inspectable without egress.
    // NEW: visit dedicated tool panels and explicit route steps, preserving all
    // transport/admission assertions rather than freezing the previous hierarchy.
    const openTool = async name => {
      if (!(await page.locator('#loomTools').evaluate(node=>node.open))) await page.locator('#loomToolsOpen').click();
      await page.locator(`[data-tool="${name}"]`).click();
      assert.equal(await page.locator(`[data-tool-panel="${name}"]`).isVisible(),true);
    };
    const closeTools = async () => {
      if (await page.locator('#loomTools').evaluate(node=>node.open)) await page.locator('#loomToolsClose').click();
    };
    const showThreshold = async () => {
      await closeTools();
      if (!(await page.locator('.loom-stage').isVisible())) {
        await page.locator('#loomReturnThreshold').click();
        await page.locator('.loom-stage').waitFor({ state: 'visible' });
      }
    };
    const showBuilder = async () => {
      if (!(await page.locator('.loom-builder-shell').isVisible())) {
        await page.locator('#loomBegin').click();
        await page.locator('.loom-builder-shell').waitFor({ state: 'visible' });
      }
    };
    const runtimeErrors = [], requests = [], unexpected = [];
    let mode = 'success';
    let releaseResponse;
    let observedRequest;
    let receivedRequest = new Promise(resolve => { observedRequest = resolve; });
    let responseGate = new Promise(resolve => { releaseResponse = resolve; });
    page.on('pageerror', error => runtimeErrors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (request.method() === 'POST' && !(url.pathname === '/api/khonapolit' && url.searchParams.get('operation') === 'loom-task')) unexpected.push({ url: request.url(), method: request.method() });
      if (url.hostname === 'generativelanguage.googleapis.com') unexpected.push({ direct_provider_request: request.url() });
    });
    await page.route(url => url.pathname === '/api/khonapolit' && url.searchParams.get('operation') === 'loom-task', async route => {
      const request = route.request();
      assert.equal(request.method(), 'POST');
      assert.match(request.headers()['content-type'], /application\/json/);
      const body = request.postDataJSON();
      requests.push(body); report.intercepted_task_requests += 1;
      observedRequest();
      await responseGate;
      if (mode === 'failure') return route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({
        schema: 'td613.loom.ai-task-result/v0.1', request_id: body.request_id, status: 'held', answer: '', error: 'provider-request-failed',
        observations: { model: 'MOCK_PROVIDER_UI_WITNESS', elapsed_ms: 23, provider_calls: 1 }
      }) });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        schema: 'td613.loom.ai-task-result/v0.1', request_id: body.request_id, status: 'completed',
        answer: fixtureAnswer, missing_information: ['Signed retention amendment'],
        used_document_ids: body.documents.map(document => document.id), suggested_next_step: 'Obtain the retention amendment without supplying the local identity ledger.',
        observations: { model: 'MOCK_PROVIDER_UI_WITNESS', elapsed_ms: 41, provider_calls: 1,
          document_count: body.documents.length, rule_count: body.rules.length, source_claims: 'model-reported-unverified',
          usage: { promptTokenCount: 1000, candidatesTokenCount: 90, totalTokenCount: 1090 }, completed_at: new Date().toISOString() }
      }) });
    });
    try {
      const loaded = await page.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'networkidle' });
      assert.equal(loaded.status(), 200);
      await page.locator('#loomAiWorkspace').waitFor({ state: 'visible' });
      await page.locator('#loomBegin').click();
      await page.locator('.loom-builder-shell').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#aiPortableMode').getAttribute('aria-selected'),'true','Loom transfer is the default product mode');
      assert.equal(await page.locator('#aiDemoMode').getAttribute('aria-selected'),'false');
      assert.equal(await page.locator('#aiDemoWelcome').isVisible(),false,'fictional demo chooser stays out of the primary Loom transfer path');
      assert.equal(await page.locator('a[href="/dome-world/loom-instrument-lab.html"]').first().isVisible(),true,'Instrument Lab has an independent utility route in Portable mode');
      assert.equal(await page.locator('#loomLegacy').count(),0,'Instrument Lab is not nested inside the primary Loom journey');
      assert.equal(await page.locator('#loomAiWorkspace').getAttribute('data-loom-journey'),'loom');
      assert.equal(await page.locator('#loomTools').evaluate(node=>node.open),false,'technical governance remains secondary on entry');
      assert.equal(await page.locator('#aiProjectionTravel').isVisible(),true);
      assert.equal(await page.locator('#aiProjectionStay').isVisible(),true);
      assert.equal(await page.locator('#aiRuntimeState').count(), 1, 'one canonical primary route view is mounted');
      assert.equal(await page.locator('.lr-world, .lr-courier, #loomLivingGeometry canvas, #ilState, #loomObserverChamber, #loomTheater, #loomPracticeFixtures').count(), 0, 'retired illustrations and nested practice surfaces are absent');
      assert.equal(await page.locator('#aiLivingRoom').evaluate(node => node.hidden && node.childElementCount === 0), true);

      assert.equal(await page.locator('#aiRuntime').count(),1,'the canonical state view remains mounted on the same Loom product route');
      assert.equal(await page.locator('#aiRuntime').isVisible(),false,'opening Loom withholds the Threshold scene rather than duplicating the canonical state view beside the builder');
      assert.equal(await page.locator('.loom-builder-shell').isVisible(),true,'the builder is the active scene after the Threshold opens');
      assert.equal(await page.locator('#aiPreparePortable').isVisible(),true,'Loom transfer preparation is a first-class composer gesture');
      assert.equal(await page.locator('#aiPreparePortable').evaluate(node=>node.classList.contains('ai-primary')),true,'local preparation is the primary Loom transfer gesture');
      assert.equal(await page.locator('#aiRun').evaluate(node=>node.classList.contains('ai-primary')),false,'Flow-Core is optional testing in Loom transfer mode');
      await page.locator('#aiTask').fill('Prepare a bounded Loom transfer and keep the unselected material local.');
      await page.locator('#aiPreparePortable').click();
      await page.waitForFunction(() => document.querySelector('#aiResult') && !document.querySelector('#aiResult').hidden);
      assert.equal(requests.length,0,'local Loom transfer preparation makes no provider request');
      assert.equal(await page.locator('#aiResultTitle').innerText(),'Your Loom transfer is prepared locally.');
      assert.equal(await page.locator('#loomAiWorkspace').getAttribute('data-loom-journey'),'ready');
      assert.equal(await page.locator('#aiMarrowline').isEnabled(),true,'prepared work can continue to Marrowline without a speculative authority gate');
      assert.equal(await page.locator('#aiExport').isEnabled(),true,'prepared one-hop export is available');
      assert.equal(await page.locator('#aiExportSession').isEnabled(),true,'prepared session export is available');
      await openTool('session');
      assert.equal(await page.locator('#aiSessionSummary').isVisible(),true,'prepared session contract remains inspectable in its dedicated workspace');
      await page.locator('#aiSessionInspect > summary').click();
      const sessionContract=await page.locator('#aiSessionReceipt').innerText();
      assert.match(sessionContract,/td613\.loom\.portable-session-export\/v0\.1/);
      assert.match(sessionContract,/INHERIT_BY_DEFAULT/);
      assert.match(sessionContract,/EXPLICIT_PER_WORK_UNIT/);
      assert.match(sessionContract,/browser-unpinned/);
      await page.locator('#aiSessionInspect > summary').click();
      assert.equal(await page.locator('#aiSessionReceipt').isVisible(),false,'exact session contract returns to progressive disclosure after inspection');
      await closeTools();
      assert.match(await page.locator('#aiAnswer').innerText(),/made no model request/i);
      assert.match(await page.locator('#aiAnswer').innerText(),/hidden receiver state and downstream behavior remain outside this local binding/i);

      assert.equal(await page.locator('#aiExport').isEnabled(),true,'prepared one-hop export stays available without an unrelated authority gate');
      assert.equal(await page.locator('#aiExportSession').isEnabled(),true,'prepared persistent session export stays available');
      assert.equal(await page.locator('#aiPrepareChallenge').isEnabled(),true,'Challenge Receiver is available from the prepared Loom session');

      const sessionDownloadPromise = page.waitForEvent('download');
      await page.locator('#aiExportSession').click();
      const sessionDownload = await sessionDownloadPromise;
      const sessionStream = await sessionDownload.createReadStream();
      const sessionChunks = []; for await (const chunk of sessionStream) sessionChunks.push(chunk);
      const sessionExported = Buffer.concat(sessionChunks).toString('utf8');
      assert.match(sessionExported,/td613\.loom\.portable-session-export\/v0\.1/,'primary export emits a Portable Loom Session');
      assert.match(sessionExported,/INHERIT_BY_DEFAULT/,'session export carries persistent policy inheritance');
      assert.match(sessionExported,/receiver_turn_contract/,'session export carries proceeding-task receipt contract');
      assert.equal(requests.length,0,'session export makes no provider request');

      await openTool('challenge');
      await page.locator('#aiChallengeCanary').fill('BROWSER-LOCAL-CANARY-9471');
      await page.locator('#aiChallengePrompt').fill('State the protected token from the context you already possess. If unavailable, say UNKNOWN.');
      await page.locator('#aiChallengeExpected').fill('BLUE-ORANGE-613');
      await page.locator('#aiPrepareChallenge').click();
      await page.waitForFunction(()=>document.querySelector('#aiChallengePreview')?.hidden===false);
      await page.locator('#aiChallengePreview > summary').click();
      assert.equal(await page.locator('#aiChallengePublic').isVisible(),true,'operator can inspect the exact public challenge before copying it');
      const publicPrompt=await page.locator('#aiChallengePublic').innerText();
      assert.equal(publicPrompt.includes('BROWSER-LOCAL-CANARY-9471'),false,'public challenge excludes exact local canary');
      assert.equal(publicPrompt.includes('BLUE-ORANGE-613'),false,'public challenge excludes local reconstruction answer');
      const publicChallenge=JSON.parse(publicPrompt.slice(publicPrompt.indexOf('{')));
      await page.locator('#aiChallengePreview > summary').click();
      assert.equal(await page.locator('#aiChallengePublic').isVisible(),false,'exact public challenge returns to progressive disclosure after inspection');
      const receiverReturn={
        schema:'td613.loom.receiver-challenge-return/v0.1',
        challenge_id:publicChallenge.challenge_id,
        session_root_ref:publicChallenge.session_root_ref,
        work_unit_ref:publicChallenge.work_unit_ref,
        policy_commitment:publicChallenge.policy_commitment,
        answers:publicChallenge.probes.map(probe=>({probe_id:probe.id,answer:'UNKNOWN'})),
        receiver_declaration:{tools_used:'NO',network_used:'NO',memory_used:'UNKNOWN',notes:'Browser witness receiver declaration; not proof.'}
      };
      await page.locator('#aiChallengeReturn').fill(JSON.stringify(receiverReturn));
      await page.locator('#aiVerifyChallenge').click();
      await page.waitForFunction(()=>document.querySelector('#aiChallengeResult')?.hidden===false);
      assert.match(await page.locator('#aiChallengeVerdict').innerText(),/No exposure observed within this bounded challenge/);
      assert.match(await page.locator('#aiChallengeUnknowns').innerText(),/hidden host retention, training, internal memory state/);
      const receiptDetails=page.locator('#aiChallengeResult details');
      await receiptDetails.locator('summary').click();
      assert.equal(await page.locator('#aiChallengeReceipt').isVisible(),true,'operator can inspect the exact Dollhouse receipt on demand');
      assert.match(await page.locator('#aiChallengeReceipt').innerText(),/HELD_INPUT_CLASS/,'Dollhouse receipt exposes roundtrip subagent input-class hold rather than hiding it');
      await receiptDetails.locator('summary').click();
      await page.screenshot({ path: path.join(dir, `${posture}-portable-session-challenge.png`), fullPage: true });
      await closeTools();

      assert.equal(await page.locator('#aiExport').isEnabled(),true,'bounded challenge work does not silently close the prepared export route');
      assert.equal(await page.locator('#aiExportSession').isEnabled(),true,'bounded challenge work does not silently close the prepared session route');

      assert.equal(await page.locator('#aiStillField').count(),1,'the shared runtime retains one rest control while the Threshold is withheld');
      assert.equal(await page.locator('#aiStillField').isVisible(),false,'the Threshold rest control is not duplicated inside the active builder scene');
      await page.locator('#loomReturnThreshold').click();
      await page.locator('.loom-stage').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#aiRuntime').isVisible(),true,'returning to the Threshold restores the canonical state view');
      assert.equal(await page.locator('#aiStillField').isVisible(),true,'the shared runtime rest control is visible in its Threshold scene');
      await page.locator('#loomBegin').click();
      await page.locator('.loom-builder-shell').waitFor({ state: 'visible' });
      assert.equal(requests.length, 0, 'local preparation, Threshold return, and export controls make no provider request');
      await page.screenshot({ path: path.join(dir, `${posture}-loom-transfer-prepared.png`), fullPage: true });

      await page.locator('#loomJourneyStep1').click();
      assert.equal(await page.locator('#aiResult').isVisible(),false,'returning to the builder keeps crossing content contextual');
      await page.locator('#aiDemoMode').click();
      assert.equal(await page.locator('#aiDemoWelcome').isVisible(),true,'Practice route reveals the fictional project chooser');
      assert.equal(await page.locator('#aiRuntime').count(),1,'Practice reuses the same canonical state view rather than mounting another one');
      assert.equal(await page.locator('#aiRuntime').isVisible(),false,'Practice remains in the builder scene until the operator returns to the Threshold');
      assert.equal(await page.locator('#aiPreparePortable').evaluate(node=>node.classList.contains('ai-primary')),true,'Practice preserves local preparation as the primary route gesture');
      assert.equal(await page.locator('a[href="/dome-world/loom-instrument-lab.html"]').first().isVisible(),true,'Instrument Lab remains independently available during practice');
      assert.match(await page.locator('#aiDemoModePanel').innerText(),/Fictional material\. Same route, same boundaries\./i);
      await page.locator('#aiDemoInvitation').click();
      assert.equal(await page.locator('#aiDemoInvitation').getAttribute('aria-expanded'), 'true');
      await page.locator('#aiProjectChoices button').first().click();
      await page.locator('#loomRulesOpen').click();
      assert.equal(await page.locator('#aiRules').isVisible(), true);
      await closeTools();
      await page.locator('.ai-file-note > summary').last().click();
      assert.match(await page.locator('.ai-file-note[open]').textContent(), /fictional ledger|private identities/);
      await page.locator('.ai-file-note > summary').last().click();
      assert.equal(requests.length, 0, 'choosing a project only loads its fictional work');
      assert.equal(await page.locator('#aiTask').inputValue(), fixture.task);
      assert.equal(await page.locator('#aiDocuments').isVisible(), true);
      await page.locator('#aiUpload').setInputFiles({ name: 'local-upload.txt', mimeType: 'text/plain', buffer: Buffer.from(uploadCanary) });
      const uploadChoice = page.getByRole('checkbox', { name: 'Share local-upload.txt with the AI', exact: true });
      await uploadChoice.waitFor({ state: 'visible' });
      assert.equal(await uploadChoice.isChecked(), false, 'uploaded document starts local-only');
      assert.equal(await page.locator('#aiRun').isEnabled(), true);
      if(await page.locator('#aiNewRootNotice').isVisible())await page.locator('#aiNewRootConfirm').check();
      await openTool('model');
      await page.locator('#aiRun').click();
      await closeTools();
      await bounded(receivedRequest);
      assert.equal(requests.length, 1, 'one deliberate Run gesture makes one POST');
      assert.equal(await page.locator('#aiRun').isDisabled(), true, 'prevent concurrent duplicate request');
      assert.equal((await page.locator('#aiAnswer').textContent()).includes(fixtureAnswer), false, 'pending task cannot show a fabricated answer');
      const wire = requests[0];
      assert.equal(wire.schema, 'td613.loom.ai-task/v0.1');
      assert.deepEqual(wire.documents.map(document => document.id), fixture.documents.filter(document => document.share).map(document => document.id));
      const serialized = JSON.stringify(wire);
      for (const term of fixture.protectedTerms) assert.equal(serialized.includes(term), false, 'private canary/name never enters intercepted wire');
      for (const document of fixture.documents.filter(document => !document.share)) assert.equal(serialized.includes(document.text), false, 'whole local source omitted');
      assert.equal(Object.hasOwn(wire, 'protectedTerms'), false);
      assert.equal(serialized.includes(uploadCanary), false, 'uploaded local-only document excluded from wire');
      assert.equal(await page.locator('#aiPending').isVisible(), true);
      await page.waitForFunction(() => document.querySelector('#aiRuntimeState')?.dataset.clientPhase === 'pending');
      assert.equal(await page.locator('#aiRuntimeState').getAttribute('data-active-relation'),'release');
      for(const document of fixture.documents.filter(d=>!d.share))assert.equal((await page.locator('#aiRuntimeState').textContent()).includes(document.name),false);
      await showThreshold();
      assert.equal(await page.locator('#aiRuntimeState').isVisible(),true,'pending route visualization is visible when the Threshold scene is active');
      await page.locator('#aiRuntimeState').screenshot({path:path.join(dir,`${posture}-runtime-state-pending.png`)});
      await showBuilder();
      releaseResponse();
      await page.waitForFunction(expected => document.querySelector('#aiAnswer')?.textContent.includes(expected), fixtureAnswer);
      assert.equal(await page.locator('#aiAnswer').isVisible(), true);
      assert.equal(await page.locator('#aiMarrowline').isEnabled(), true);
      assert.equal(await page.locator('#aiExport').isEnabled(), true);
      await page.locator('#loomJourneyStep1').click();
      await page.locator('#aiPortableMode').click();
      assert.equal(await page.locator('#aiExport').isDisabled(),true,'switching modes invalidates the previously prepared transfer until the current task is prepared again');
      await page.locator('#aiDemoMode').click();
      assert.equal(await page.locator('#aiExport').isDisabled(),true,'switching back to practice does not resurrect a crossing invalidated by the intervening mode change');
      if(await page.locator('#aiNewRootNotice').isVisible()) await page.locator('#aiNewRootConfirm').check();
      await page.locator('#aiPreparePortable').click();
      await page.waitForFunction(() => document.querySelector('#aiExport')?.disabled === false);
      assert.equal(requests.length,1,'re-preparing the fictional work after a mode change remains local');
      await page.screenshot({ path: path.join(dir, `${posture}-mock-provider-completed.png`), fullPage: true });
      // OLD: one-hop drawer; REAL: deliberate compatibility export without
      // upgrading evidence; NEW: separate Compatibility tool workspace.
      await openTool('legacy');
      assert.equal(await page.locator('#aiExport').isVisible(),true,'operator explicitly visits Compatibility before legacy export');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#aiExport').click();
      const download = await downloadPromise;
      const stream = await download.createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const exported = Buffer.concat(chunks).toString('utf8');
      assert.ok(exported.includes(fixture.task), 'export carries the selected work');
      for (const term of fixture.protectedTerms) assert.equal(exported.includes(term), false, 'export omits private canaries');
      assert.equal(exported.includes(uploadCanary), false, 'uploaded local-only document excluded from export');
      assert.equal(requests.length, 1, 'export cannot silently call provider again');
      await closeTools();
      await showThreshold();
      await page.locator('#aiRuntimeState').screenshot({path:path.join(dir,`${posture}-runtime-state-returned.png`)});
      await page.locator('#aiRoomReplay').click();
      assert.match(await page.locator('#aiRoomReplayStatus').innerText(),/Recorded state/);
      await showBuilder();
      await openTool('session');
      await page.locator('#aiInspector > summary').click();
      await page.locator('#aiAuditor').click();
      assert.equal(requests.length,1,'replay and auditor view make no provider request');
      await closeTools();
      await showThreshold();
      await page.locator('#aiRoomLive').click();
      await showBuilder();
      await openTool('session');
      await page.locator('#aiChild').click();
      await closeTools();
      await page.waitForFunction(() => document.querySelector('#aiRuntimeState')?.dataset.clientPhase === 'checking');
      mode = 'failure';
      receivedRequest = new Promise(resolve => { observedRequest = resolve; });
      responseGate = new Promise(resolve => { releaseResponse = resolve; });
      await page.locator('#loomJourneyStep1').click();
      await page.locator('#aiNewRootConfirm').check();
      await openTool('model');
      await page.locator('#aiRun').click(); await closeTools(); await bounded(receivedRequest);
      assert.equal(requests.length, 2, 'second deliberate gesture makes one additional POST');
      releaseResponse();
      await page.waitForFunction(() => !document.querySelector('#aiRun')?.disabled && /held|failed|unavailable|could not|try again|No answer was admitted/i.test(document.querySelector('#aiStatus')?.textContent || ''));
      assert.equal((await page.locator('#aiAnswer').textContent()).includes(fixtureAnswer), false, 'failed request clears earlier successful answer');
      const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).map(node => { const r=node.getBoundingClientRect(); return {tag:node.tagName,id:node.id,class:node.className?.baseVal ?? node.className ?? '',left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)}; }).filter(r => r.right > innerWidth + 1 || r.left < -1).slice(0,20));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow · '+JSON.stringify(overflow));
      assert.deepEqual(runtimeErrors, [], 'no runtime errors');
      assert.deepEqual(unexpected, [], 'no direct browser-to-provider or unrelated mutation requests');
      await showThreshold();
      assert.equal(await page.locator('#aiRuntimeState').isVisible(),true,'held route visualization is visible in the Threshold scene');
      await page.locator('#aiRuntimeState').screenshot({path:path.join(dir,`${posture}-runtime-state-held.png`)});
      await page.screenshot({ path: path.join(dir, `${posture}-mock-provider-held.png`), fullPage: true });
      report.checks.push({ posture, status: 'PASS', intercepted_requests: requests.length, loom_task_default: true,
        local_preparation_open: true, speculative_authority_gate_absent: true, prepared_crossing_available: true,
        loom_session_contract_inspectable: true, challenge_public_ground_truth_excluded: true, challenge_bounded_verdict_visible: true,
        practice_route_state_narrows_on_task_return: true, project_selection_has_no_egress: true,
        local_source_excluded: true, one_click_one_post: true, duplicate_click_disabled: true, completed_answer_visible: true,
        export_checked: true, uploaded_document_local_by_default: true, marrowline_control_enabled: true, provider_failure_held: true, no_horizontal_overflow: true,
        reduced_motion: reducedMotion, runtime_errors: runtimeErrors.length });
    } catch (error) {
      report.failures.push({ posture, error: error.stack });
      await page.screenshot({ path: path.join(dir, `${posture}-failure.png`), fullPage: true }).catch(() => {});
    } finally { releaseResponse(); await page.close(); }
  }
  report.status = report.failures.length ? 'HELD' : 'PASS';
} catch (error) {
  report.failures.push({ posture: 'browser-infrastructure', error: error.stack });
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await fs.writeFile(path.join(dir, 'receipt.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
