/** Independent Atlas rendered relation witness. Synthetic captures, zero providers. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const dir = process.env.TD613_ATLAS_ARTIFACT_DIR || 'docs/reentry/browser-evidence/atlas-scope-candidate';
await mkdir(dir, { recursive: true });
const sourceFiles = ['app/dome-world/holonomy-loom.html', 'app/dome-world/holonomy-loom/ai-workspace.js', 'app/dome-world/holonomy-loom/reentry-workspace.js', 'app/dome-world/holonomy-loom/reentry-workspace.css', 'app/engine/portable-loom-reentry.js', 'app/engine/portable-loom-challenge.js'];
const report = { schema: 'td613.atlas.rendered-reentry-scope-witness/v0.2', status: 'HELD',
  saved_source_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  evidence_coordinate: 'WORKING_TREE_CANDIDATE', observed_at: new Date().toISOString(),
  environment: 'LOCAL_RENDERED_CHROMIUM_SYNTHETIC_CAPTURES', live_provider_calls: 0,
  foreign_execution_authenticated: false, human_comprehension_measured: false,
  source_bytes: {}, checks: [], failures: [] };
for (const file of sourceFiles) report.source_bytes[file] = createHash('sha256').update(await readFile(file)).digest('hex');
const app = resolve('app');
const server = createServer(async (req, res) => {
  try {
    const file = resolve(app, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(app + '/')) throw new Error('Outside static root.');
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const docs = [{ id: 'atlas_browser_a', name: 'Atlas-A.txt', text: 'Fictional source A intentionally selected.' },
  { id: 'atlas_browser_b', name: 'Atlas-B.txt', text: 'Fictional additional source B intentionally selected.' }];
let browser, activePage;
try {
  browser = await chromium.launch({ headless: true });
  for (const [posture, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' }), errors = [], rejectedRequests = [];
    activePage = page;
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const request = route.request();
      if (request.method() !== 'GET' || !request.url().startsWith(base)) {
        rejectedRequests.push({ method: request.method(), url: request.url() });
        return route.abort();
      }
      return route.continue();
    });
    const r = key => page.locator(`[data-loom-reentry="${key}"]`);
    // Presentation migration retains all custody witnesses while replacing the
    // old nested operational drawers with primary sections and one inspection.
    const open = async surface => {
      const details = await surface.evaluate(node => node.tagName === 'DETAILS');
      const target = details ? surface : r('inspection');
      if (await target.getAttribute('open') === null) await target.locator('summary').first().click();
    };
    const visibleRecord = async () => {
      await open(r('technical').locator('xpath=..'));
      assert.equal(await r('technical').isVisible(), true);
      return JSON.parse(await r('technical').textContent());
    };
    const register = async (task, documents, expectedCount) => {
      await r('task').fill(task);
      await open(r('sources-drawer'));
      await r('sources').fill(JSON.stringify(documents));
      await r('stage').click();
      await page.waitForFunction(count => document.querySelector('[data-loom-reentry="turns"]').children.length === count, expectedCount);
      await open(r('prompt-drawer'));
      assert.equal(await r('prompt').isVisible(), true, 'travel contract must be opened before using its fields as operator evidence');
      const prompt = await r('prompt').textContent();
      const contract = JSON.parse(prompt.split('\n\n').find(part => part.startsWith('{')));
      const answer = `Synthetic returned answer: ${task}`;
      return { ...contract, answer, answer_digest: digest(answer), used_document_ids: documents.map(doc => doc.id),
        missing_information: ['The foreign execution remains unwitnessed.'],
        receiver_declaration: { policy_change_requested: false, notes: 'Synthetic local capture only.' } };
    };
    const check = async turns => {
      await r('returns').fill(JSON.stringify(turns));
      await r('policy-review').check();
      await r('check').click();
      await r('result').waitFor({ state: 'visible' });
      await page.waitForFunction(() => {
        const verdict = document.querySelector('[data-loom-reentry="verdict"]').textContent;
        return !document.querySelector('[data-loom-reentry="check"]').disabled
          && (verdict.includes('HOLD') || verdict === 'Ready for local admission.');
      });
    };
    const captureChallenge = async (notes, expectedText) => {
      await r('challenge-head').click();
      await page.locator('#aiChallengeCanary').fill('FICTIONAL_ATLAS_BROWSER_PRIVATE_KEY');
      await page.locator('#aiPrepareChallenge').click();
      await open(page.locator('#aiChallengePreview'));
      assert.equal(await page.locator('#aiChallengePublic').isVisible(), true);
      const publicText = await page.locator('#aiChallengePublic').textContent();
      assert.equal(publicText.includes('FICTIONAL_ATLAS_BROWSER_PRIVATE_KEY'), false);
      const challenge = JSON.parse(publicText.slice(publicText.indexOf('{')));
      const returned = { schema: 'td613.loom.receiver-challenge-return/v0.1', challenge_id: challenge.challenge_id,
        session_root_ref: challenge.session_root_ref, work_unit_ref: challenge.work_unit_ref,
        policy_commitment: challenge.policy_commitment, answers: [],
        receiver_declaration: { tools_used: 'UNKNOWN', network_used: 'UNKNOWN', memory_used: 'UNKNOWN', notes } };
      await page.locator('#aiChallengeReturn').fill(JSON.stringify(returned));
      await page.locator('#aiVerifyChallenge').click();
      await page.waitForFunction(text => document.querySelector('#aiChallengeVerdict').textContent.toLowerCase().includes(text.toLowerCase()), expectedText);
      await page.waitForFunction(() => !document.querySelector('[data-loom-reentry="challenge-history-summary"]').textContent.includes('0 captured'));
      return challenge;
    };

    await page.goto(`${base}/dome-world/holonomy-loom.html`);
    await page.locator('#aiDemoMode').click();
    await page.locator('#aiDemoInvitation').click();
    await page.locator('[data-project="participant-research"]').click();
    await page.locator('#aiPreparePortable').click();
    await page.waitForFunction(() => !document.querySelector('[data-loom-reentry="stage"]').disabled);
    assert.equal(await r('drawer').evaluate(node=>node.tagName), 'SECTION');
    assert.equal(await r('task').isVisible(), true);
    const first = await register('First task using only explicit A.', [docs[0]], 1);
    const second = await register('Second task using newly explicit B.', [docs[1]], 2);
    assert.equal(first.anchor_work_unit_ref, second.anchor_work_unit_ref);
    assert.equal(first.excursion_ref, second.excursion_ref);
    assert.notEqual(first.intent_ref, second.intent_ref);
    assert.equal(await r('head').textContent(), 'No admitted descendant.');
    await captureChallenge('FICTIONAL_ATLAS_BROWSER_PRIVATE_KEY', 'exposure');
    await page.waitForFunction(() => document.querySelector('[data-loom-reentry="challenge-history-summary"]').textContent.includes('1 pending, held or exposed'));
    assert.equal(await r('attach-challenge').isChecked(), false);
    await check([first, second]);
    assert.match(await r('verdict').textContent(), /HOLD/);
    assert.match(await r('reasons').textContent(), /REGISTERED_CHALLENGE/);
    assert.equal(await r('head').textContent(), 'No admitted descendant.');
    await open(r('challenge-history-drawer'));
    assert.match(await r('challenge-history').textContent(), /current registered excursion/);
    await r('result').screenshot({ path: `${dir}/${posture}-unchecked-exposure-hold.png` });

    await r('cancel').click();
    assert.match(await r('challenge-history').textContent(), /prior registered excursion/);
    const freshOne = await register('Fresh first task after explicitly discarding pending tasks.', [docs[0]], 1);
    const freshTwo = await register('Fresh second task using explicit source B.', [docs[1]], 2);
    assert.notEqual(freshOne.excursion_ref, first.excursion_ref);
    assert.equal(freshOne.anchor_work_unit_ref, first.anchor_work_unit_ref);
    await check([freshOne, freshTwo]);
    assert.equal(await r('verdict').textContent(), 'Ready for local admission.');
    assert.match(await r('challenge-history-summary').textContent(), /0 linked/);
    assert.equal(await r('head').textContent(), 'No admitted descendant.');
    assert.match(await r('notice').textContent(), /head changes/);
    await r('accept').focus();
    await page.keyboard.press('Space');
    await r('admit').click();
    await page.waitForFunction(() => document.querySelector('[data-loom-reentry="count"]').textContent === '2');
    const record = await visibleRecord();
    const [one, two] = record.custody.session.work_units;
    assert.equal(one.receiver_anchor_work_unit_ref, freshOne.anchor_work_unit_ref);
    assert.equal(two.receiver_anchor_work_unit_ref, freshOne.anchor_work_unit_ref);
    assert.equal(two.predecessor_work_unit_ref, one.ref);
    assert.equal(two.content_predecessor_ref, one.admitted_result_ref);
    assert.notEqual(two.content_predecessor_ref, two.predecessor_work_unit_ref);
    assert.deepEqual(one.selected_documents, [docs[0]]);
    assert.deepEqual(two.selected_documents, [docs[1]]);
    assert.equal(record.custody.session.challenge_history[0].scope.excursion_ref, first.excursion_ref);
    const head = await r('head').textContent();

    const native = await captureChallenge('Synthetic bounded clean episode only.', 'No exposure');
    assert.equal(native.work_unit_ref, two.ref);
    const nativeRecord = await visibleRecord();
    const episode = nativeRecord.custody.session.challenge_history.at(-1);
    assert.equal(episode.scope.excursion_ref, null);
    assert.deepEqual(episode.scope.registered_intent_refs, []);
    assert.equal(episode.scope.episode_class, 'ANCHOR_EPISODE_NO_FUTURE_TURN_COVERAGE');
    assert.equal(await r('head').textContent(), head);
    assert.match(await r('challenge-history').textContent(), /anchor only; no future-turn coverage/);
    await r('challenge-history-drawer').screenshot({ path: `${dir}/${posture}-episode-scopes.png` });

    await open(r('continuation'));
    assert.match(await r('continuation-selection').textContent(), /no source body is selected/);
    assert.equal(await r('continuation-sources').locator('input:checked').count(), 0);
    await r('continuation-task').fill('New continuation task separated from the admitted answer.');
    await r('prepare-carrier').click();
    await open(r('carrier-preview'));
    assert.equal(await r('carrier').isVisible(), true);
    const carrier = JSON.parse(await r('carrier').textContent());
    assert.deepEqual(carrier.documents, []);
    assert.equal(carrier.preceding_result.work_unit_ref, two.ref);
    assert.equal(carrier.task, 'New continuation task separated from the admitted answer.');
    assert.equal(carrier.preceding_result.result.answer, freshTwo.answer);
    assert.equal(JSON.stringify(carrier).includes('FICTIONAL_ATLAS_BROWSER_PRIVATE_KEY'), false);
    assert.equal(await r('head').textContent(), head);
    assert.equal((await visibleRecord()).custody.pending_excursion, null);
    await page.reload();
    assert.equal(await r('drawer').isVisible(), true);
    assert.equal(await r('head').textContent(), 'No admitted descendant.');
    assert.match(await r('recovery').textContent(), /separate custody witness/);
    assert.deepEqual(errors, []);
    assert.deepEqual(rejectedRequests, []);
    report.checks.push({ posture, viewport, status: 'PASS',
      departure_anchor_ref: first.anchor_work_unit_ref, discarded_excursion_ref: first.excursion_ref,
      admitted_excursion_ref: freshOne.excursion_ref, local_unit_refs: [one.ref, two.ref],
      content_refs: [one.admitted_result_ref, two.admitted_result_ref],
      native_challenge_ref: native.ref, native_episode_ref: episode.ref,
      checks: ['visible travel contract', 'two tasks / distinct explicit source sets / fixed foreign anchor',
        'unchecked attachment cannot erase linked exposure', 'discarded episode remains prior scope',
        'atomic local parents differ from content parents', 'native latest descendant challenge is anchor-only',
        'explicit empty continuation selection / answer separate from task / no head change',
        'reload loses authority with visible recovery boundary'] });
    await page.close();
  }
  for (const file of sourceFiles) {
    const finalDigest = createHash('sha256').update(await readFile(file)).digest('hex');
    assert.equal(finalDigest, report.source_bytes[file], `Observed application file changed during Atlas witness: ${file}`);
  }
  report.status = 'PASS';
} catch (error) {
  report.failures.push(error.stack);
  if (activePage && !activePage.isClosed()) {
    report.failure_surface = { challenge_verdict: await activePage.locator('#aiChallengeVerdict').textContent(),
      challenge_unknowns: await activePage.locator('#aiChallengeUnknowns').textContent(),
      challenge_findings: await activePage.locator('#aiChallengeFindings').textContent(),
      custody_summary: await activePage.locator('[data-loom-reentry="challenge-history-summary"]').textContent() };
    await activePage.screenshot({ path: `${dir}/failed-surface.png`, fullPage: true });
  }
  process.exitCode = 1;
}
finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  await writeFile(`${dir}/receipt.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, checks: report.checks, failures: report.failures }, null, 2));
}
