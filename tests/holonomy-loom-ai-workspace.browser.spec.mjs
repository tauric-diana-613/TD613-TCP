/** Run with node, matching the repository's existing per-engine browser witness lane.
 * This is a UI transport/admission fixture: the sole provider endpoint is intercepted.
 * It establishes no live Gemini quality, external-host protection or human comprehension.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';

const engine = process.env.TD613_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[engine];
if (!browserType) throw new TypeError('Unknown witness browser engine');
const base = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
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
  browser = await browserType.launch({ headless: true, ...(engine === 'chromium' ? { executablePath: browserType.executablePath() } : {}) });
  for (const [posture, viewport, reducedMotion] of [
    ['desktop', { width: 1280, height: 900 }, 'no-preference'],
    ['mobile-reduced', { width: 390, height: 844 }, 'reduce']
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion, acceptDownloads: true });
    page.setDefaultTimeout(12000);
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
      assert.equal(await page.locator('#aiPortableMode').getAttribute('aria-selected'),'true','Portable AIA is the default product mode');
      assert.equal(await page.locator('#aiDemoMode').getAttribute('aria-selected'),'false');
      assert.equal(await page.locator('#aiDemoWelcome').isVisible(),false,'fictional demo chooser stays out of the primary Portable AIA path');
      assert.equal(await page.locator('#loomLegacy > summary').isVisible(),false,'laboratory estate stays under Loom Demo rather than competing with the builder');
      assert.match(await page.locator('#aiShiStatus').innerText(),/Issuance held/);
      assert.equal(await page.locator('#aiIssuanceGate a').getAttribute('href'),'/safe-harbor/index.html');
      assert.equal(await page.locator('.ai-projection-depth').getAttribute('open'),null,'technical governance detail stays optional on entry');
      assert.equal(await page.locator('#aiProjectionTravel').isVisible(),true);
      assert.equal(await page.locator('#aiProjectionStay').isVisible(),true);
      assert.equal(await page.locator('#loomLivingGeometry canvas').count(), 1, 'one Dome-Art canvas is mounted under the workspace clock; raster readiness remains a renderer concern');

      assert.equal(await page.locator('.ai-observer').isVisible(),false,'the live request theater does not dominate Portable AIA mode');
      assert.equal(await page.locator('#aiPreparePortable').isVisible(),true,'Portable AIA preparation is a first-class composer gesture');
      assert.equal(await page.locator('#aiPreparePortable').evaluate(node=>node.classList.contains('ai-primary')),true,'local preparation is the primary Portable AIA gesture');
      assert.equal(await page.locator('#aiRun').evaluate(node=>node.classList.contains('ai-primary')),false,'Flow-Core is optional testing in Portable AIA mode');
      await page.locator('#aiTask').fill('Prepare a bounded Portable AIA and keep the unselected material local.');
      await page.locator('#aiPreparePortable').click();
      await page.waitForFunction(() => document.querySelector('#aiResult') && !document.querySelector('#aiResult').hidden);
      assert.equal(requests.length,0,'local Portable AIA preparation makes no provider request');
      assert.equal(await page.locator('#aiResultTitle').innerText(),'Your Portable AIA is prepared locally.');
      assert.equal(await page.locator('#aiMarrowline').isDisabled(),true,'Marrowline issuance stays held without SHI in Portable AIA mode');
      assert.equal(await page.locator('#aiExport').isDisabled(),true,'one-hop export stays held without SHI in Portable AIA mode');
      assert.equal(await page.locator('#aiExportSession').isDisabled(),true,'persistent session export stays held without SHI');
      assert.equal(await page.locator('#aiSessionSummary').isVisible(),true,'local preparation creates a visible persistent session summary');
      await page.locator('#aiSessionInspect > summary').click();
      const sessionContract=await page.locator('#aiSessionReceipt').innerText();
      assert.match(sessionContract,/td613\.loom\.portable-session-export\/v0\.1/);
      assert.match(sessionContract,/INHERIT_BY_DEFAULT/);
      assert.match(sessionContract,/EXPLICIT_PER_WORK_UNIT/);
      assert.match(sessionContract,/browser-unpinned/);
      await page.locator('#aiSessionInspect > summary').click();
      assert.equal(await page.locator('#aiSessionReceipt').isVisible(),false,'exact session contract returns to progressive disclosure after inspection');
      assert.match(await page.locator('#aiAnswer').innerText(),/made no model request/i);
      assert.match(await page.locator('#aiAnswer').innerText(),/does not embed civil-identity verification/i);

      await page.locator('#aiShi').fill('TD613-SH-9B07D8B-A1B2C3D4');
      assert.match(await page.locator('#aiShiStatus').innerText(),/SHI FORMAT ACCEPTED/);
      assert.equal(await page.locator('#aiExport').isEnabled(),true,'valid-format SHI wakes a prepared one-hop issuance gesture');
      assert.equal(await page.locator('#aiExportSession').isEnabled(),true,'valid-format SHI wakes persistent session export');
      assert.equal(await page.locator('#aiPrepareChallenge').isEnabled(),true,'valid-format SHI wakes Challenge Receiver');

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

      await page.locator('#aiChallengeDrawer > summary').click();
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

      await page.locator('#aiShi').fill('');
      assert.equal(await page.locator('#aiExport').isDisabled(),true,'removing SHI restores the one-hop issuance hold');
      assert.equal(await page.locator('#aiExportSession').isDisabled(),true,'removing SHI restores the session issuance hold');

      assert.equal(await page.locator('#aiStillField').isVisible(),false,'observer-only motion controls stay out of Portable AIA mode');
      assert.equal(requests.length, 0, 'local preparation and SHI format checks make no provider request');
      await page.screenshot({ path: path.join(dir, `${posture}-portable-aia-held.png`), fullPage: true });

      await page.locator('#aiDemoMode').click();
      assert.equal(await page.locator('#aiDemoWelcome').isVisible(),true,'Loom Demo reveals the fictional practice chooser');
      assert.equal(await page.locator('.ai-observer').isVisible(),true,'live request theater returns inside Loom Demo');
      assert.equal(await page.locator('#aiRun').evaluate(node=>node.classList.contains('ai-primary')),true,'Run becomes the primary demo gesture');
      assert.equal(await page.locator('#loomLegacy > summary').isVisible(),true,'laboratory estate belongs to Loom Demo');
      assert.match(await page.locator('#aiDemoModePanel').innerText(),/fictional practice traversal/i);
      await page.locator('#aiDemoInvitation').click();
      assert.equal(await page.locator('#aiDemoInvitation').getAttribute('aria-expanded'), 'true');
      await page.locator('#aiProjectChoices button').first().click();
      await page.locator('#aiRulesDrawer > summary').click();
      assert.equal(await page.locator('#aiRules').isVisible(), true);
      await page.locator('#aiRulesDrawer > summary').click();
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
      await page.locator('#aiRun').click();
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
      assert.equal(await page.locator('#aiLivingRoom').getAttribute('data-phase'),'pending');
      assert.match(await page.locator('#aiLivingRoom').textContent(),/YOUR POCKET/);
      for(const document of fixture.documents.filter(d=>!d.share))assert.equal((await page.locator('#aiLivingRoom').textContent()).includes(document.name),false);
      await page.locator('#aiLivingRoom').screenshot({path:path.join(dir,`${posture}-living-room-pending.png`)});
      releaseResponse();
      await page.waitForFunction(expected => document.querySelector('#aiAnswer')?.textContent.includes(expected), fixtureAnswer);
      assert.equal(await page.locator('#aiAnswer').isVisible(), true);
      assert.equal(await page.locator('#aiMarrowline').isEnabled(), true);
      assert.equal(await page.locator('#aiExport').isEnabled(), true);
      await page.locator('#aiPortableMode').click();
      assert.equal(await page.locator('#aiExport').isDisabled(),true,'Demo practice waiver narrows immediately when returning to Portable AIA without SHI');
      await page.locator('#aiDemoMode').click();
      assert.equal(await page.locator('#aiExport').isEnabled(),true,'same admitted fictional result remains usable inside Demo practice');
      await page.screenshot({ path: path.join(dir, `${posture}-mock-provider-completed.png`), fullPage: true });
      // One-hop packet export remains available behind its demoted disclosure.
      await page.locator('.ai-onehop-drawer > summary').click();
      assert.equal(await page.locator('#aiExport').isVisible(),true,'operator explicitly opens one-hop packet tools before legacy export');
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
      await page.locator('#aiLivingRoom').screenshot({path:path.join(dir,`${posture}-living-room-returned.png`)});
      await page.locator('#aiRoomReplay').click();
      assert.match(await page.locator('#aiRoomReplayStatus').innerText(),/Recorded state/);
      await page.locator('#aiAuditor').click();
      assert.equal(requests.length,1,'replay and auditor view make no provider request');
      await page.locator('#aiRoomLive').click();
      await page.locator('#aiChild').click();
      assert.equal(await page.locator('#aiLivingRoom').getAttribute('data-phase'),'completed');
      mode = 'failure';
      receivedRequest = new Promise(resolve => { observedRequest = resolve; });
      responseGate = new Promise(resolve => { releaseResponse = resolve; });
      await page.locator('#aiRun').click(); await bounded(receivedRequest);
      assert.equal(requests.length, 2, 'second deliberate gesture makes one additional POST');
      releaseResponse();
      await page.waitForFunction(() => !document.querySelector('#aiRun')?.disabled && /held|failed|unavailable|could not|try again|No answer was admitted/i.test(document.querySelector('#aiStatus')?.textContent || ''));
      assert.equal((await page.locator('#aiAnswer').textContent()).includes(fixtureAnswer), false, 'failed request clears earlier successful answer');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow');
      assert.deepEqual(runtimeErrors, [], 'no runtime errors');
      assert.deepEqual(unexpected, [], 'no direct browser-to-provider or unrelated mutation requests');
      await page.locator('#aiLivingRoom').screenshot({path:path.join(dir,`${posture}-living-room-held.png`)});
      await page.screenshot({ path: path.join(dir, `${posture}-mock-provider-held.png`), fullPage: true });
      report.checks.push({ posture, status: 'PASS', intercepted_requests: requests.length, portable_aia_default: true,
        unissued_local_preparation_open: true, portable_issuance_held_without_shi: true, shi_format_wakes_prepared_issuance: true,
        portable_session_contract_inspectable: true, challenge_public_ground_truth_excluded: true, challenge_bounded_verdict_visible: true,
        demo_waiver_narrows_on_portable_return: true, project_selection_has_no_egress: true,
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
  await fs.writeFile(path.join(dir, 'receipt.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
