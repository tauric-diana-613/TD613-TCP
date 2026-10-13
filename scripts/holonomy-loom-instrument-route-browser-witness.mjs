/** Real local browser traversal with intercepted provider/custody responses.
 * Run: node scripts/holonomy-loom-instrument-route-browser-witness.mjs
 * The default starts its own app-root static server in this process. There is no
 * live provider, real Neon signer, physical-device or human-comprehension claim.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';
import { chromium, firefox, webkit } from 'playwright';
import { bindLoomDemoRequest, loomDemoDigest, loomDemoReceiptDigest, loomDemoResult,
  inspectLoomDemoExport, LOOM_DEMO_STAGE_RECEIPT_SCHEMA } from '../app/dome-world/holonomy-loom/demo-contract.js';

const environment = { crypto: webcrypto }, appRoot = path.resolve('app');
const engine = process.env.TD613_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[engine];
if (!browserType) throw new TypeError('Unknown witness browser engine');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/loom-instrument-route-browser');
await fs.mkdir(artifactDir, { recursive: true });
let server, browser;
let base = process.env.TD613_BASE_URL;
if (!base) {
  server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost'), relative = decodeURIComponent(url.pathname).replace(/^\/app\//, '/');
      const file = path.resolve(appRoot, `.${relative}`);
      if (!file.startsWith(`${appRoot}${path.sep}`) || req.method !== 'GET') { res.writeHead(403); return res.end(); }
      const body = await fs.readFile(file), extension = path.extname(file);
      res.writeHead(200, { 'content-type': ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' })[extension] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'this witness only targets a local server');
const report = { schema: 'td613.loom.instrument-route-browser-witness/v0.1', status: 'HELD',
  engine,
  source_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  working_tree_dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
  observed_at: new Date().toISOString(), scope: 'REAL_LOCAL_BROWSER_MOCK_PROVIDER_AND_CUSTODY',
  live_provider_calls: 0, live_custody_calls: 0, physical_device_observed: false,
  source_revision_authenticated: false, human_comprehension_measured: false, custody_restored: false,
  viewports: [], failures: [] };
const task = 'Compare the three approved workstreams and preserve missing evidence.';
const rules = ['Use only selected sources.', 'Keep unresolved alternatives visible.'];
const selectedText = 'Selected fictional record: three approved workstreams.';
const privateText = 'LOCAL_PROTECTED_CANARY_613';
const output = (id, answer, ids) => ({ schema: 'td613.loom.ai-task-result/v0.1', request_id: id, status: 'completed',
  answer, missing_information: ['Independent effect remains unobserved.'], used_document_ids: ids, suggested_next_step: 'Inspect the receipt and selected record.' });
const nativeReply = text => ({ ok: true, text,
  relay: { transcript: text, khonapolit: { present: true, text } }, receipt: { provider: { model: 'MOCK_NATIVE_RECEIVER', completion: { complete: true } } } });
async function downloadJson(page, locator, filename) {
  const pending = page.waitForEvent('download'); pending.catch(() => {}); await locator.click(); const downloaded = await pending;
  const destination = path.join(artifactDir, filename); await downloaded.saveAs(destination);
  return JSON.parse(await fs.readFile(destination, 'utf8'));
}
async function useKeyboard(locator) { await locator.focus(); await locator.press('Enter'); }

try {
  browser = await browserType.launch({ headless: true });
  for (const [name, viewport] of [['desktop', { width: 1280, height: 900 }], ['portrait-390', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', acceptDownloads: true });
    const errors = [], unexpected = [], requests = [], heads = new Map();
    let loomCalls = 0, ordinaryCalls = 0;
    context.on('page', candidate => { candidate.setDefaultTimeout(15000); candidate.on('pageerror', error => errors.push(error.message)); });
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.origin !== new URL(base).origin) return route.abort();
      if (!url.pathname.startsWith('/api/')) return route.continue();
      if (req.method() === 'GET') return route.fulfill({ json: { ok: true, hasGeminiKey: true, hasProviderKey: true, modelPolicy: { callableModels: ['MOCK_NATIVE_RECEIVER'] } } });
      const body = req.postDataJSON();
      if (url.searchParams.get('operation') === 'loom-task') {
        loomCalls++;
        assert.equal(JSON.stringify(body).includes(privateText), false);
        return route.fulfill({ json: output(body.request_id, 'Original Loom answer: three approved workstreams.', body.documents.map(doc => doc.id)) });
      }
      if (url.searchParams.get('operation') === 'loom-demo-task') {
        const activation = body.activation, prior = heads.get(activation.activation_digest);
        assert.equal(body.phase === 'ACTIVATE' ? prior === undefined : await loomDemoReceiptDigest(body.predecessor, environment) === await loomDemoReceiptDigest(prior, environment), true, 'mock custody excludes stale predecessors before receiver completion');
        assert.equal(JSON.stringify(body).includes(privateText), false);
        const binding = await bindLoomDemoRequest(body, environment);
        requests.push(body);
        const continuation = requests.filter(item => item.phase === 'CONTINUE').length;
        const answer = body.phase === 'ACTIVATE' ? 'Task and rules acknowledged; selected files pending.' : `Continuation ${continuation}: three approved workstreams, missing evidence retained.`;
        const result = output(body.request_id, answer, body.documents.map(doc => doc.id));
        const receipt = { schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA, activation_digest: activation.activation_digest,
          phase: body.phase, request_id: body.request_id, request_digest: await loomDemoDigest(body, environment),
          current_input_digest: binding.governance.input_digest, prior_result_digest: binding.receipt.prior_result_digest,
          result_digest: await loomDemoDigest(loomDemoResult(result, binding.selected.documents), environment),
          predecessor_receipt_digest: prior ? await loomDemoReceiptDigest(prior, environment) : null,
          expires_at: activation.expires_at, admission_state: 'ADMITTED', stage_policy: body.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND',
          authority_transferred: false, auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'A'.repeat(43) } };
        heads.set(activation.activation_digest, receipt); binding.governor.close();
        return route.fulfill({ json: { ...result, native_reply: nativeReply(answer), loom_demo_binding: binding.receipt, loom_demo_stage_receipt: receipt } });
      }
      if (url.pathname === '/api/dome-world/khonapolit') { ordinaryCalls++; return route.fulfill({ json: nativeReply('Ordinary reply: this conversation has no Loom custody.') }); }
      unexpected.push({ method: req.method(), path: url.pathname, operation: url.searchParams.get('operation') });
      return route.fulfill({ status: 503, json: { ok: false, error: 'UNEXPECTED_MOCK_ROUTE' } });
    });
    const loom = await context.newPage();
    const checks = [];
    const check = (label, condition) => { assert.equal(Boolean(condition), true, label); checks.push(label); };
    // OLD: rules/profile/one-hop tools were disclosures embedded in the route.
    // REAL: deliberate configuration preserves selected bytes, policy and
    // exclusion; compatibility export earns no extra custody authority.
    // NEW: visit dedicated tool panels and close them before primary crossing.
    const openTool = async name => {
      if (!(await loom.locator('#loomTools').evaluate(node => node.open))) await useKeyboard(loom.locator('#loomToolsOpen'));
      await useKeyboard(loom.locator(`[data-tool="${name}"]`));
      check(`${name} tool workspace is accessible`, await loom.locator(`[data-tool-panel="${name}"]`).isVisible());
    };
    const closeTools = async () => {
      if (await loom.locator('#loomTools').evaluate(node => node.open)) await useKeyboard(loom.locator('#loomToolsClose'));
    };
    try {
      await loom.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'networkidle' });
      // Every direct visit opens the tutorial, including returning visits.
      // Use its visible Skip tutorial gesture rather than a completion flag or
      // the hidden final-step button to enter the working surface.
      await loom.locator('#loomFirstCrossing').waitFor({ state: 'visible' });
      check('tutorial arrival makes zero provider or custody requests', loomCalls === 0 && requests.length === 0 && ordinaryCalls === 0);
      check('tutorial offers a visible keyboard exit', await loom.locator('#loomFirstCrossingLeave').isVisible());
      await useKeyboard(loom.locator('#loomFirstCrossingLeave'));
      await loom.locator('.loom-builder-shell').waitFor({ state: 'visible' });
      await loom.locator('#aiDemoMode').click(); await loom.locator('#aiNew').click();
      await loom.locator('#aiTask').fill(task); await openTool('rules');
      await loom.locator('#aiRules').fill(rules.join('\n')); await loom.locator('#aiPrivate').fill(privateText);
      await openTool('model');
      await loom.locator('#aiRuntimeProfile').selectOption('quick');
      check('Quick profile preserves the task and portable rules', await loom.locator('#aiTask').inputValue() === task && await loom.locator('#aiRules').inputValue() === rules.join('\n'));
      await loom.locator('#aiRuntimeProfile').selectOption('deep');
      check('Deep profile preserves the same selected task and rules', await loom.locator('#aiTask').inputValue() === task && await loom.locator('#aiRules').inputValue() === rules.join('\n'));
      await closeTools();
      await useKeyboard(loom.locator('#loomReturnThreshold'));
      await loom.locator('#loomFirstCrossing').waitFor({ state: 'visible' });
      await useKeyboard(loom.locator('#loomFirstCrossingLeave'));
      await loom.locator('.loom-builder-shell').waitFor({ state: 'visible' });
      check('tutorial re-entry preserves the working task and rules without sending', await loom.locator('#aiTask').inputValue() === task
        && await loom.locator('#aiRules').inputValue() === rules.join('\n') && loomCalls === 0 && requests.length === 0);
      await loom.locator('#aiUpload').setInputFiles([
        { name: 'selected.txt', mimeType: 'text/plain', buffer: Buffer.from(selectedText) },
        { name: 'local-only.txt', mimeType: 'text/plain', buffer: Buffer.from(privateText) }
      ]);
      await loom.getByRole('checkbox', { name: 'Share selected.txt with the AI', exact: true }).check();
      check('local-only file remains unselected', !(await loom.getByRole('checkbox', { name: 'Share local-only.txt with the AI', exact: true }).isChecked()));
      await openTool('model'); await useKeyboard(loom.locator('#aiRun')); await closeTools();
      await loom.waitForFunction(() => document.querySelector('#aiExport')?.disabled === false);
      await openTool('legacy');
      const origin = await downloadJson(loom, loom.locator('#aiExport'), `${name}-origin.json`);
      check('origin task/rules/selected source/original result survive export', origin.task === task && JSON.stringify(origin.rules) === JSON.stringify(rules)
        && origin.documents.length === 1 && origin.documents[0].text === selectedText && origin.continuation.prior_result.answer.startsWith('Original Loom answer'));
      check('origin excludes local bodies and labels source missingness', !JSON.stringify(origin).includes(privateText) && origin.loom_demo_provenance.missingness.includes('SOURCE_REVISION_UNOBSERVED'));
      check('origin exported representation is inspectable review material', (await inspectLoomDemoExport(origin, environment)).status === 'REVIEW_ONLY_CONSISTENCY');
      await closeTools();
      const [marrowline] = await Promise.all([context.waitForEvent('page'), loom.locator('#aiMarrowline').click()]);
      await marrowline.waitForURL(url => url.pathname === '/dome-world/marrowline.html');
      await marrowline.waitForFunction(() => Boolean(window.__TD613_LOOM_DEMO_CONTROLLER__));
      check('arrival makes zero native receiver requests', requests.length === 0);
      await useKeyboard(marrowline.locator('#marrowlineComposerPlus'));
      await useKeyboard(marrowline.locator('#marrowlineContextLoom'));
      // OLD: numeric demo steps; REAL: handoff before selected-file submission;
      // NEW: native Setup/Continue labels with the same no-send staging contract.
      await useKeyboard(marrowline.getByRole('button', { name: 'Setup · Attach Loom handoff', exact: true }));
      // Enter starts asynchronous file staging. Observe its actual completion
      // before inspecting focus; never synthesize focus or staging state.
      await marrowline.waitForFunction(() => {
        const state = window.__TD613_LOOM_DEMO_CONTROLLER__?.snapshot();
        return state?.phase === 'AIA_STAGED' && !state.busy;
      });
      check('keyboard staging moves focus to native prompt without sending', requests.length === 0 && await marrowline.locator('#khonapolitPrompt').evaluate(node => node === document.activeElement));
      await useKeyboard(marrowline.locator('#khonapolitSend'));
      await marrowline.waitForFunction(() => window.__TD613_LOOM_DEMO_CONTROLLER__.snapshot().phase === 'AIA_SENT' && !window.__TD613_LOOM_DEMO_CONTROLLER__.snapshot().busy);
      await useKeyboard(marrowline.locator('#marrowlineComposerPlus')); await useKeyboard(marrowline.locator('#marrowlineContextLoom'));
      await useKeyboard(marrowline.getByRole('button', { name: 'Continue · Attach selected files', exact: true }));
      await marrowline.waitForFunction(() => {
        const state = window.__TD613_LOOM_DEMO_CONTROLLER__?.snapshot();
        return state?.phase === 'FILES_STAGED' && !state.busy;
      });
      await useKeyboard(marrowline.locator('#khonapolitSend'));
      await marrowline.waitForFunction(() => window.__TD613_LOOM_DEMO_CONTROLLER__.snapshot().phase === 'DONE' && !window.__TD613_LOOM_DEMO_CONTROLLER__.snapshot().busy);
      if (viewport.width < 861) await useKeyboard(marrowline.locator('.mobile-dock [data-mobile-target="gatePanel"]'));
      const first = await downloadJson(marrowline, marrowline.locator('#loomGateExportCurrent'), `${name}-continuation-1.json`);
      check('first continuation export carries original answer and current C1', first.loom_demo_provenance.original_result.answer === origin.continuation.prior_result.answer && first.continuation.prior_result.answer.startsWith('Continuation 1'));
      if (viewport.width < 861) await useKeyboard(marrowline.locator('.mobile-dock [data-mobile-target="speakingPanel"]'));
      await marrowline.locator('#khonapolitPrompt').fill('Continue from the immediately preceding answer; retain the original task and rules.');
      await useKeyboard(marrowline.locator('#khonapolitSend'));
      await marrowline.waitForFunction(() => window.__TD613_LOOM_DEMO_CONTROLLER__.snapshot().phase === 'DONE' && !window.__TD613_LOOM_DEMO_CONTROLLER__.snapshot().busy && window.__TD613_LOOM_DEMO_CONTROLLER__.getObservedProvenance().stages.length === 3);
      if (viewport.width < 861) await useKeyboard(marrowline.locator('.mobile-dock [data-mobile-target="gatePanel"]'));
      const second = await downloadJson(marrowline, marrowline.locator('#loomGateExportCurrent'), `${name}-continuation-2.json`);
      check('continuation two consumes C1 instead of original Loom answer', requests[2].prior_result.request_id === first.continuation.prior_result.request_id && requests[2].prior_result.answer === first.continuation.prior_result.answer);
      check('latest export preserves original/latest/path/documents/rules/local exclusions', second.loom_demo_provenance.original_result.answer === origin.continuation.prior_result.answer
        && second.continuation.prior_result.answer.startsWith('Continuation 2') && second.loom_demo_provenance.stages.length === 3
        && second.loom_demo_provenance.stages[2].content_predecessor_request_id === first.continuation.prior_result.request_id
        && second.loom_demo_provenance.exclusions.withheld_document_count === 1 && !JSON.stringify(second).includes(privateText)
        && second.documents[0].text === selectedText && JSON.stringify(second.rules) === JSON.stringify(rules));
      const currentCard = marrowline.locator(`article[data-loom-reading-request-id="${requests[2].request_id}"]`);
      if (viewport.width < 861) await useKeyboard(marrowline.locator('.mobile-dock [data-mobile-target="speakingPanel"]'));
      await useKeyboard(currentCard.locator('.reply-next-actions summary'));
      check('More with this reply opens by keyboard on exact governed card', await currentCard.locator('.reply-next-actions').evaluate(node => node.open));
      await marrowline.screenshot({ path: path.join(artifactDir, `${name}-native-current.png`), fullPage: true });
      if (viewport.width < 861) await useKeyboard(marrowline.locator('.mobile-dock [data-mobile-target="gatePanel"]'));
      await useKeyboard(marrowline.locator('#loomGateReturnToLoom'));
      await loom.waitForFunction(() => document.querySelector('[data-return-review="status"]')?.textContent.includes('Returned session checked for review.'));
      check('return opens the original Loom tab at its visible review surface', await loom.locator('#loomReturnWorkspace').isVisible()
        && await loom.locator('[data-return-review="result"]').isVisible());
      check('returned current work is C2 with origin input match and review-only authority', (await loom.locator('[data-return-review="history"]').textContent()).includes(second.continuation.prior_result.answer)
        && (await loom.locator('[data-return-review="boundary"]').textContent()).includes('The origin task, selected files and rules match this tab.')
        && (await loom.locator('[data-return-review="boundary"]').textContent()).includes('This review record grants no admission authority.')
        && (await loom.locator('[data-return-review="boundary"]').textContent()).includes('Receipt signatures remain unverified.'));
      const reviewed = await downloadJson(loom, loom.locator('[data-return-review="save"]'), `${name}-returned-review.json`);
      check('returned review retains exact latest and predecessor history without private material', reviewed.continuation.prior_result.request_id === second.continuation.prior_result.request_id
        && JSON.stringify(reviewed.loom_demo_provenance.stages) === JSON.stringify(second.loom_demo_provenance.stages)
        && !JSON.stringify(reviewed).includes(privateText));
      const reviewedInspection = await inspectLoomDemoExport(reviewed, environment);
      check('return grants review consistency rather than live custody or restoration', reviewedInspection.status === 'REVIEW_ONLY_CONSISTENCY'
        && reviewedInspection.live_custody_capability === false && reviewedInspection.restore_authority === false);
      await loom.screenshot({ path: path.join(artifactDir, `${name}-origin-returned-current.png`), fullPage: true });
      await loom.reload({ waitUntil: 'networkidle' });
      check('reload does not restore admitted work or make issuance current', await loom.locator('#aiExport').isDisabled());
      await loom.waitForFunction(() => document.querySelector('[data-return-review="status"]')?.textContent.includes('Returned session checked for review.'));
      check('reload preserves the visible C2 review while origin custody remains unavailable', await loom.locator('[data-return-review="result"]').isVisible()
        && (await loom.locator('[data-return-review="history"]').textContent()).includes(second.continuation.prior_result.answer)
        && (await loom.locator('[data-return-review="boundary"]').textContent()).includes('The original local record is unavailable for comparison.')
        && (await loom.locator('[data-return-review="boundary"]').textContent()).includes('This review record grants no admission authority.')
        && await loom.locator('#aiMarrowline').isDisabled());
      await loom.screenshot({ path: path.join(artifactDir, `${name}-reloaded-review.png`), fullPage: true });
      await loom.goto(`${base}/dome-world/loom-instrument-lab.html`, { waitUntil: 'networkidle' });
      await loom.locator('#loomInstrumentLab').waitFor({ state: 'visible' });
      check('returned-work inspection moves to the separate Instrument Lab route', await loom.locator('#loomLegacy').count() === 0 && await loom.locator('#aiRuntimeState').count() === 0);
      await loom.locator('#ilBench').selectOption('export-history');
      await loom.locator('#ilUpload').setInputFiles({ name: 'returned-current.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(second)) });
      await loom.waitForFunction(() => document.querySelector('#ilInput')?.value.includes('loom_demo_provenance'));
      await useKeyboard(loom.locator('#ilRun'));
      await loom.waitForFunction(() => document.querySelector('#ilResultStatus')?.textContent.includes('REVIEW_ONLY_CONSISTENCY'));
      await useKeyboard(loom.locator('#ilDeep'));
      const inspected = JSON.parse(await loom.locator('#ilReceipt').textContent());
      check('returned file remains inspectable after reload with zero restore authority', inspected.result.latest_request_id === second.continuation.prior_result.request_id
        && inspected.result.original_request_id === origin.continuation.prior_result.request_id && inspected.result.restore_authority === false && inspected.result.live_custody_capability === false);
      const stale = JSON.parse(JSON.stringify(second)); stale.loom_demo_provenance.stages[2].content_predecessor_request_id = origin.continuation.prior_result.request_id;
      await loom.locator('#ilInput').fill(JSON.stringify(stale)); await useKeyboard(loom.locator('#ilRun'));
      await loom.waitForFunction(() => document.querySelector('#ilResultStatus')?.textContent.startsWith('HELD'));
      check('stale returned path is visibly held', (await loom.locator('#ilResultStatus').textContent()).startsWith('HELD'));
      await loom.screenshot({ path: path.join(artifactDir, `${name}-returned-review.png`), fullPage: true });
      const ordinary = await context.newPage(); await ordinary.goto(`${base}/dome-world/marrowline.html`, { waitUntil: 'networkidle' });
      check('ordinary direct entry has no Loom controller or governance panel', await ordinary.evaluate(() => !window.__TD613_LOOM_DEMO_CONTROLLER__ && !document.querySelector('#loomGateContinuity')));
      await ordinary.locator('#khonapolitPrompt').fill('A plain conversation.'); await useKeyboard(ordinary.locator('#khonapolitSend'));
      await ordinary.waitForFunction(() => [...document.querySelectorAll('#khonapolitMessages article.relay-message')].at(-1)?.textContent.includes('Ordinary reply:'));
      check('ordinary native reply gets no Loom reading marker or controls', await ordinary.locator('#khonapolitMessages article.relay-message').last().getAttribute('data-loom-reading-request-id') === null
        && await ordinary.locator('#khonapolitMessages article.relay-message').last().locator('.marrowline-reading-tools').count() === 0);
      check('all route operations used intercepted native APIs only', loomCalls === 1 && requests.length === 3 && ordinaryCalls === 1 && unexpected.length === 0);
      check('browser script errors absent', errors.length === 0);
      report.viewports.push({ name, viewport, status: 'PASS', checks, intercepted_origin_requests: loomCalls,
        intercepted_native_requests: requests.length, intercepted_ordinary_requests: ordinaryCalls,
        source_revision_state: second.loom_demo_provenance.source_revision.state, review_state: 'REVIEW_ONLY_CONSISTENCY',
        stale_return_state: 'HELD', controller_reloaded: false, page_errors: errors });
    } catch (error) {
      report.failures.push({ name, error: error.stack });
      await loom.screenshot({ path: path.join(artifactDir, `${name}-failure.png`), fullPage: true }).catch(() => {});
      report.viewports.push({ name, viewport, status: 'HELD', checks, page_errors: errors, unexpected });
    } finally { await context.close(); }
  }
  report.status = report.failures.length ? 'HELD' : 'PASS_LOCAL_BROWSER_SCOPE';
} catch (error) { report.failures.push({ error: error.stack }); }
finally {
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
  await fs.writeFile(path.join(artifactDir, 'witness.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, viewports: report.viewports.map(item => ({ name: item.name, status: item.status, checks: item.checks.length })), failures: report.failures, artifact_dir: artifactDir }, null, 2));
  if (report.status !== 'PASS_LOCAL_BROWSER_SCOPE') process.exitCode = 1;
}
