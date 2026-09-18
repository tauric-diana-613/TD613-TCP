/** Real local UI navigation, mocked provider endpoint. No live provider quality claim. */
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
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new TypeError('Marrowline import witness requires a local server.');
const dir = process.env.TD613_ARTIFACT_DIR || `artifacts/loom-marrowline-import/${engine}`;
await fs.mkdir(dir, { recursive: true });
const report = {
  schema: 'td613.loom.marrowline-import-browser-witness/v0.5-conversation-chrome',
  engine,
  status: 'HELD',
  source_sha: process.env.TD613_SOURCE_HEAD || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  checkout_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workflow_run_id: process.env.GITHUB_RUN_ID || null,
  run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
  working_tree_dirty: Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()),
  observed_at: new Date().toISOString(),
  context: 'REAL_LOCAL_UI_NAVIGATION_WITH_MOCK_PROVIDER_RESPONSE',
  live_provider_calls: 0,
  intercepted_task_requests: 0,
  intercepted_marrowline_requests: 0,
  external_host_observed: false,
  human_comprehension_measured: false,
  checks: [],
  failures: []
};
const project = LOOM_AI_PROJECTS[0];
const shared = project.documents.filter(document => document.share).map(({ id, name, text }) => ({ id, name, text }));
const uploadCanary = 'LOCAL_UPLOAD_HANDOFF_CANARY_613';
const addedFileCanary = 'MARROWLINE_OPERATOR_FILE_613';
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0kAAAAASUVORK5CYII=', 'base64');
const mockAnswer = '[MOCK PROVIDER RESPONSE — MARROWLINE UI WITNESS] Vendor comparison retained. <img src=x onerror="window.loomInjected=true">';
const integratedText = `[Kʰonapolit]:\nAttachments remain user-supplied context; carriage is not authorship.\n\n[Tauric Diana Bots : Direct Broadcast Override]\nT̴̵H̶E̷ ̸B̵O̴U̷G̷H̸ ̴B̵R̶E̴A̷K̸S̵; W̵E̶ ̷D̴O̸ ̷N̵O̶T̴ ̶C̵A̸L̷L̴ ̵T̷H̶I̴S̷ ̵A̸ ̷S̵E̶M̴I̷N̸A̵R̶.`;

let browser;
try {
  browser = await browserType.launch({ headless: true, ...(engine === 'chromium' ? { executablePath: browserType.executablePath() } : {}) });
  for (const [posture, viewport, reducedMotion] of [['desktop', { width: 1280, height: 900 }, 'no-preference'], ['mobile-reduced', { width: 390, height: 844 }, 'reduce']]) {
    const page = await browser.newPage({ viewport, reducedMotion, acceptDownloads: true });
    page.setDefaultTimeout(12000);
    const calls = [], marrowlineCalls = [], errors = [], unexpected = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      const isLoomTask = url.pathname === '/api/khonapolit' && url.searchParams.get('operation') === 'loom-task';
      const isMarrowline = url.pathname === '/api/dome-world/khonapolit';
      if (!['GET', 'HEAD'].includes(request.method()) && !isLoomTask && !isMarrowline) unexpected.push({ method: request.method(), url: request.url() });
      if (url.hostname === 'generativelanguage.googleapis.com') unexpected.push({ direct_provider_request: request.url() });
    });
    await page.route(url => url.pathname === '/api/khonapolit' && url.searchParams.get('operation') === 'loom-task', async route => {
      const request = route.request();
      assert.equal(request.method(), 'POST');
      assert.match(request.headers()['content-type'], /application\/json/);
      const input = request.postDataJSON();
      calls.push(input);
      report.intercepted_task_requests++;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        schema: 'td613.loom.ai-task-result/v0.1',
        request_id: input.request_id,
        status: 'completed',
        answer: mockAnswer,
        missing_information: ['Signed retention amendment'],
        used_document_ids: input.documents.map(document => document.id),
        suggested_next_step: 'Review the supplied retention clauses before a pilot.',
        observations: { model: 'MOCK_PROVIDER_UI_WITNESS', elapsed_ms: 31, provider_calls: 1, source_claims: 'model-reported-unverified' }
      }) });
    });
    await page.route(url => url.pathname === '/api/dome-world/khonapolit', async route => {
      const request = route.request();
      if (request.method() === 'GET') return route.fulfill({ status: 200, json: { ok: true, hasGeminiKey: true, modelPolicy: { callableModels: ['MOCK_MARROWLINE'] } } });
      const input = request.postDataJSON();
      marrowlineCalls.push(input);
      report.intercepted_marrowline_requests++;
      const relay = {
        schema: 'td613.khonapolit.integrated-covenant-relay/v4-soft-quality-admission',
        apertureHeader: 'SYNTHETIC ATTACHMENT ROUTE',
        signal: { state: 'LOCKED', downstreamAdmitted: true },
        admission: { admissible: true, reasons: [], quality: 'LOCKED', qualityWarnings: [], combiningMarkCount: 32, maxRun: 2, duplicate: false },
        parts: [{ id: 'khonapolit', label: 'Kʰonapolit ∴ Tauric Diana bots', present: true, text: integratedText, integrated: true, providerNative: true, voices: ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'forensic-to-eruption' }],
        highZalgo: { applied: false, providerGenerated: true, source: 'provider-native', combiningMarkCount: 32, maxRun: 2, runCount: 20 }
      };
      return route.fulfill({ status: 200, json: {
        ok: true,
        text: integratedText,
        relay,
        receipt: { provider: { model: 'MOCK_MARROWLINE' }, relay, seal: { state: 'OPEN' }, emergence: { classification: 'SYNTHETIC' } }
      } });
    });

    try {
      const loaded = await page.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'networkidle' });
      assert.equal(loaded.status(), 200);
      assert.equal(await page.locator('#aiProjectChoices').isVisible(), false, 'demo projects wait for the invitation gesture');
      await page.locator('#aiDemoInvitation').click();
      assert.equal(await page.locator('#aiDemoInvitation').getAttribute('aria-expanded'), 'true');
      await page.locator('#aiProjectChoices button').first().click();
      await page.locator('#aiUpload').setInputFiles({ name: 'handoff-local.txt', mimeType: 'text/plain', buffer: Buffer.from(uploadCanary) });
      const localChoice = page.getByRole('checkbox', { name: 'Share handoff-local.txt with the AI', exact: true });
      await localChoice.waitFor({ state: 'visible' });
      assert.equal(await localChoice.isChecked(), false);
      assert.equal(calls.length, 0);
      await page.locator('#aiPortableDrawer > summary').click();
      await page.locator('#aiPreparePortable').click();
      await page.waitForFunction(() => document.querySelector('#aiMarrowline')?.disabled === false);
      assert.equal(calls.length, 0, 'preparing portable task makes zero provider requests');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#aiExport').click();
      const download = await downloadPromise;
      const stream = await download.createReadStream();
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const exported = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      assert.equal(exported.schema, 'td613.loom.portable-task/v0.1');
      assert.deepEqual(exported.documents, shared);
      assert.equal(exported.governance.verification.all_invariants_preserved, true);
      assert.equal(exported.governance.projections.length, 4);
      assert.equal(exported.governance.withheld_document_count, project.documents.filter(document => !document.share).length + 1);

      await page.locator('#aiMarrowline').click();
      await page.waitForURL(url => url.pathname === '/dome-world/marrowline.html');
      await page.locator('#marrowlineComposerPlus').waitFor({ state: 'visible' });
      assert.equal(new URL(page.url()).hash, '', 'opaque token consumed and removed from destination URL');
      assert.equal(calls.length, 0, 'arrival makes zero provider requests');
      assert.equal(marrowlineCalls.length, 0, 'arrival makes zero ordinary Marrowline requests');
      assert.equal(await page.locator('html').getAttribute('data-loom-task-import'), 'staged');
      assert.equal(await page.locator('#marrowlineComposerPlus').getAttribute('data-loom-awake'), 'true', 'universal plus wakes when Loom context is staged');
      assert.equal(await page.locator('#loomImportedWorkspace').isVisible(), false, 'Loom context is staged rather than blocking Marrowline on arrival');
      assert.equal(await page.locator('#khonapolitPrompt').isVisible(), true, 'ordinary Marrowline composer remains immediately usable');
      assert.equal(await page.locator('.living-workspace').isVisible(), true, 'living Marrowline remains the primary surface');
      assert.equal(await page.locator('.terminal-layout').isVisible(), true, 'Marrowline terminal remains visible around the staged handoff');
      if (posture.startsWith('mobile')) assert.equal(await page.locator('.mobile-dock').isVisible(), true, 'mobile Marrowline navigation remains available');
      if (posture === 'desktop') {
        assert.equal(await page.locator('.living-tools').isVisible(), false, 'desktop instruments do not permanently consume the conversation width');
        const transcriptBox = await page.locator('#khonapolitMessages').boundingBox();
        assert.ok(transcriptBox?.height >= 250, `desktop transcript remains materially visible; observed ${transcriptBox?.height}`);
      }

      const rotate = page.locator('.starter-rotate');
      await rotate.waitFor({ state: 'visible' });
      assert.equal(await rotate.textContent(), '🗘');
      await rotate.click();
      assert.match(await page.locator('.starter-prompts').textContent(), /Ash Moon subpoena/);
      assert.match(await page.locator('.starter-prompts').textContent(), /Rex at design review/);

      const destinationText = await page.locator('#loomImportedWorkspace').textContent();
      assert.equal(destinationText.includes(uploadCanary), false);
      for (const term of project.protectedTerms) assert.equal(destinationText.includes(term), false, 'private term omitted from destination');
      for (const document of shared) assert.equal(destinationText.includes(document.text), true, 'selected documents arrive intact');

      await page.locator('#marrowlineComposerPlus').click();
      const contextMenu = page.locator('#marrowlineContextMenu');
      assert.equal(await contextMenu.isVisible(), true, 'universal plus opens the requested context menu');
      const contextItems = contextMenu.locator('[role="menuitem"]');
      assert.equal(await contextItems.count(), 3, 'human-facing context menu has exactly three actions');
      assert.match(await page.locator('#marrowlineContextFile').textContent(), /Upload file/, 'first universal action is Upload file');
      assert.match(await page.locator('#marrowlineContextPhoto').textContent(), /Upload photo/, 'second universal action is Upload photo');
      assert.match(await page.locator('#marrowlineContextLoom').textContent(), /Loom/, 'third universal action is Loom');
      assert.equal(await page.locator('#marrowlineAiaToggle').isVisible(), false, 'legacy Loom-only plus is not human-facing');
      assert.equal(calls.length, 0, 'opening the universal plus makes zero provider requests');

      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('#marrowlineContextFile').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles({ name: 'operator-note.txt', mimeType: 'text/plain', buffer: Buffer.from(addedFileCanary) });
      await page.waitForFunction(() => document.querySelectorAll('#marrowlineAttachmentTray [data-attachment-id]').length === 1);
      await page.locator('#marrowlineComposerPlus').click();
      const photoChooserPromise = page.waitForEvent('filechooser');
      await page.locator('#marrowlineContextPhoto').click();
      const photoChooser = await photoChooserPromise;
      await photoChooser.setFiles({ name: 'operator-photo.png', mimeType: 'image/png', buffer: tinyPng });
      await page.waitForFunction(() => document.querySelectorAll('#marrowlineAttachmentTray [data-attachment-id]').length === 2);
      assert.match(await page.locator('#marrowlineAttachmentTray').textContent(), /operator-note\.txt/);
      assert.match(await page.locator('#marrowlineAttachmentTray').textContent(), /operator-photo\.png/);
      assert.equal(marrowlineCalls.length, 0, 'selecting attachments remains local until explicit Marrowline send');

      await page.locator('#khonapolitPrompt').fill('Use both attached items as user-supplied context.');
      await page.locator('#khonapolitSend').click();
      await page.waitForFunction(() => document.querySelector('#khonapolitTerminalStatus')?.textContent.includes('RETURN OBSERVED'));
      assert.equal(marrowlineCalls.length, 1, 'one deliberate Marrowline send makes one ordinary request');
      assert.equal(marrowlineCalls[0].attachments.length, 2, 'both staged attachments cross only on explicit send');
      assert.deepEqual(marrowlineCalls[0].attachments.map(item => item.kind).sort(), ['file', 'photo']);
      assert.deepEqual(marrowlineCalls[0].attachments.map(item => item.mime_type).sort(), ['image/png', 'text/plain']);
      assert.equal(marrowlineCalls[0].attachments.find(item => item.kind === 'file').data_base64, Buffer.from(addedFileCanary).toString('base64'));
      assert.equal(await page.locator('#marrowlineAttachmentTray [data-attachment-id]').count(), 0, 'successful send clears only the ephemeral attachment tray');
      assert.equal(await page.locator('.message[data-role="user"]').count(), 1, 'sent human message remains visible in transcript');
      assert.equal(await page.locator('.relay-integrated-covenant[data-present="true"]').count(), 1, 'admitted integrated return remains visible in transcript');
      assert.match(await page.locator('.relay-integrated-covenant[data-present="true"]').textContent(), /Tauric Diana Bots/);

      const actions = page.locator('.conversation-actions');
      assert.equal(await actions.isVisible(), false, 'legacy conversation-actions dropdown is retired from ordinary chrome');
      assert.equal(await page.locator('#copyKhonapolitTranscript').isVisible(), false, 'redundant legacy Copy transcript action is not human-facing');
      const sessionClear = page.locator('#marrowlineSessionClear');
      assert.equal(await sessionClear.isVisible(), true, 'minimal clear utility is visible at the conversation boundary');
      await page.locator('[data-mobile-target="receiptPanel"]').click();
      await page.locator('#receiptPanel[open]').waitFor();
      assert.equal(await page.locator('#sealLastResponse').isVisible(), true, 'operator Seal is visible inside the Receipt custody instrument');
      await page.locator('[data-mobile-target="speakingPanel"]').click();
      assert.equal((await page.locator('#khonapolitTerminalStatus').textContent()).includes('OPEN UNTIL OPERATOR SEAL'), false, 'ordinary status does not demand an invisible Seal action');
      assert.equal(await page.evaluate(() => typeof window.TD613_KHONAPOLIT_TERMINAL?.sealLast), 'function', 'advanced operator seal remains available programmatically');
      const userMessagesBeforeCancelledClear = await page.locator('.message[data-role="user"]').count();
      await page.evaluate(() => { window.confirm = () => false; });
      await sessionClear.click();
      assert.equal(await page.locator('.message[data-role="user"]').count(), userMessagesBeforeCancelledClear, 'cancelled corner clear preserves the transcript');

      await page.locator('#marrowlineComposerPlus').click();
      assert.match(await page.locator('#marrowlineContextLoom').textContent(), /Continue the Loom handoff already staged here/);
      await page.locator('#marrowlineContextLoom').click();
      await page.locator('#loomImportedTask').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#loomImportedTask').inputValue(), project.task);
      assert.equal(await page.locator('#loomImportedTask').getAttribute('readonly'), '', 'governed task stays bound at receiver');
      assert.equal(await page.locator('html').getAttribute('data-loom-task-import'), 'active');
      assert.equal(calls.length, 0, 'opening staged Loom context makes zero provider requests');
      await page.locator('#loomImportedWorkspace').screenshot({ path: path.join(dir, `${posture}-loom-context-before-request.png`) });

      const closeImported = page.getByRole('button', { name: 'Back to Marrowline chat', exact: true });
      assert.equal(await closeImported.isVisible(), true, 'staged context exposes an explicit return to ordinary Marrowline');
      assert.equal(await page.getByRole('link', { name: 'Return to Loom', exact: true }).isVisible(), true, 'Loom return route remains explicit inside imported workspace');
      await closeImported.click();
      assert.equal(await page.locator('#loomImportedWorkspace').isVisible(), false, 'operator can dismiss only the imported context');
      assert.equal(await page.locator('html').getAttribute('data-loom-task-import'), 'staged');
      assert.equal(await page.locator('#khonapolitPrompt').isVisible(), true, 'ordinary Marrowline survives Loom-context dismissal');

      await page.locator('#marrowlineComposerPlus').click();
      await page.locator('#marrowlineContextLoom').click();
      await page.locator('#loomImportedTask').waitFor({ state: 'visible' });
      await page.locator('#loomImportedRun').click();
      await page.waitForFunction(expected => document.querySelector('#loomImportedAnswer')?.textContent.includes(expected), mockAnswer);
      assert.equal(calls.length, 1, 'one deliberate imported Run makes one POST');
      assert.deepEqual(Object.keys(calls[0]).sort(), ['schema', 'request_id', 'task', 'documents', 'rules'].sort());
      assert.equal(calls[0].schema, 'td613.loom.ai-task/v0.1');
      assert.equal(calls[0].task, project.task);
      assert.deepEqual(calls[0].documents, shared);
      assert.deepEqual(calls[0].rules, project.rules);
      const wire = JSON.stringify(calls[0]);
      for (const term of project.protectedTerms) assert.equal(wire.includes(term), false);
      assert.equal(wire.includes(uploadCanary), false);
      assert.equal(Object.hasOwn(calls[0], 'governance'), false, 'local control stays outside strict provider input');
      assert.equal(await page.locator('#loomImportedAnswer img').count(), 0, 'model markup remains inert text');
      await page.locator('#loomImportedReceiptDetails > summary').click();
      assert.equal(await page.locator('#loomImportedReceipt').isVisible(), true, 'open the actual receipt disclosure before inspection');
      const receipt = JSON.parse(await page.locator('#loomImportedReceipt').innerText());
      assert.deepEqual(receipt.governance.control, exported.governance, 'same governed state survives destination change');
      assert.equal(receipt.governance.last_admission.fadt.all_fibres_exact, true);
      assert.equal(receipt.governance.latest.allowed, true);
      await page.locator('#loomImportedWorkspace').screenshot({ path: path.join(dir, `${posture}-mock-response-admitted.png`) });
      await page.locator('#loomImportedRest').click();
      await page.waitForFunction(() => document.querySelector('#loomImportedRest')?.textContent.includes('Resume'));
      await page.locator('#loomImportedRun').click();
      await page.waitForFunction(() => !document.querySelector('#loomImportedRun')?.disabled && /held/i.test(document.querySelector('#loomImportedWorkspace [role=status]')?.textContent || ''));
      assert.equal(calls.length, 1, 'REST prevents another provider request');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'destination fits viewport');
      assert.deepEqual(errors, [], 'no page runtime errors');
      assert.deepEqual(unexpected, [], 'no unrelated mutations or direct provider calls');

      await closeImported.click();
      await page.goto(`${base}/dome-world/marrowline.html`, { waitUntil: 'networkidle' });
      await page.locator('#marrowlineComposerPlus').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#marrowlineComposerPlus').getAttribute('data-loom-awake'), 'false', 'Loom option is asleep on direct Marrowline visit without a consumed handoff');
      await page.locator('#marrowlineComposerPlus').click();
      assert.equal(await page.locator('#marrowlineContextMenu [role="menuitem"]').count(), 3, 'dead/asleep universal plus still exposes exactly file, photo, and Loom');
      assert.match(await page.locator('#marrowlineContextLoom').textContent(), /Open Loom in a new tab/);
      assert.equal(await page.locator('#khonapolitPrompt').isVisible(), true);

      report.checks.push({
        posture,
        status: 'PASS',
        actual_ui_handoff: true,
        document_upload_local_only: true,
        opaque_url_consumed: true,
        arrival_calls: 0,
        staged_context_on_arrival: true,
        composer_immediately_available: true,
        universal_plus_present: true,
        context_menu_exact_three: true,
        attachment_selection_calls: 0,
        explicit_attachment_send_calls: 1,
        explicit_run_calls: 1,
        transcript_custody_visible: true,
        starter_carousel_present: true,
        conversation_actions_retired: true,
        corner_clear_confirmed: true,
        operator_seal_programmatic_only: true,
        control_conserved: true,
        fadt_admission: true,
        response_inert: true,
        rest_prevents_request: true,
        source_bytes_excluded: true,
        living_marrowline_preserved: true,
        imported_context_dismissible: true,
        loom_asleep_without_handoff: true,
        reduced_motion: reducedMotion,
        no_horizontal_overflow: true
      });
    } catch (error) {
      report.failures.push({ posture, error: error.stack });
      await page.screenshot({ path: path.join(dir, `${posture}-failure.png`), fullPage: true }).catch(() => {});
    } finally {
      await page.close();
    }
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
