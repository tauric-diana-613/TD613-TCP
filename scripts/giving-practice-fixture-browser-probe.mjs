import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA,
  evaluatePedagoguePracticeObservation
} from '../app/engine/flowcore-pedagogue-core.js';

const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require('playwright');
const engines = { chromium, firefox, webkit };
const engineName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[engineName];
if (!engine) throw new Error(`Unsupported Giving practice-fixture browser engine: ${engineName}`);

const baseUrl = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6136').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || `artifacts/giving-${engineName}`;
await fs.mkdir(artifactDir, { recursive: true });
const fixture = JSON.parse(await fs.readFile(new URL('../tests/fixtures/pedagogue/giving-bikini-bottom-practice.json', import.meta.url), 'utf8'));

const executablePath = String(process.env.TD613_BROWSER_EXECUTABLE_PATH || '').trim();
const browser = await engine.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const apiTraffic = [];

page.on('request', (request) => {
  if (!['fetch', 'xhr'].includes(request.resourceType())) return;
  let operation = null;
  const raw = request.postData();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      operation = parsed?.operation || parsed?.body?.operation || null;
    } catch {
      operation = null;
    }
  }
  apiTraffic.push({ method: request.method(), url: request.url(), operation });
});

const snapshot = () => page.evaluate(() => ({
  title: document.querySelector('#dossierTitle')?.value || '',
  name: document.querySelector('#searchName')?.value || '',
  queue: document.querySelector('#contactQueueInput')?.value || '',
  reviewCount: document.querySelector('#reviewCount')?.textContent?.trim() || '',
  recordChildren: document.querySelector('#recordList')?.children?.length || 0,
  recordText: document.querySelector('#recordList')?.textContent?.trim() || '',
  runSummary: document.querySelector('#runSummary')?.textContent?.trim() || '',
  status: document.querySelector('#researchFileSampleStatus')?.textContent?.trim() || '',
  statusHidden: Boolean(document.querySelector('#researchFileSampleStatus')?.hidden)
}));

try {
  const response = await page.goto(`${baseUrl}/giving/history/?surface=operator`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  assert(response?.ok(), `Giving practice fixture returned HTTP ${response?.status()}`);
  await page.evaluate(() => {
    document.documentElement.dataset.session = 'open';
    document.querySelector('#sessionMembrane')?.setAttribute('hidden', '');
    document.querySelector('#operatorShell')?.removeAttribute('hidden');
  });
  await page.waitForSelector('#loadResearchSampleButton', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#recordList', { state: 'attached', timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(100);

  const before = await snapshot();
  const trafficBoundary = apiTraffic.length;
  await page.locator('#loadResearchSampleButton').click();
  await page.waitForTimeout(160);
  const after = await snapshot();
  const practiceTraffic = apiTraffic.slice(trafficBoundary);

  assert.equal(after.title, 'SAMPLE — Bikini Bottom contributor review');
  assert.equal(after.name, 'SpongeBob SquarePants');
  assert.equal(after.queue, ['Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles'].join('\n'));
  assert.equal(after.statusHidden, false);
  assert.match(after.status, /Fictional sample loaded locally/i);
  assert.match(after.status, /no records were preloaded/i);
  assert.equal(after.reviewCount, before.reviewCount, 'practice activation must not change contribution count');
  assert.equal(after.recordChildren, before.recordChildren, 'practice activation must not create evidence rows');
  assert.equal(after.recordText, before.recordText, 'practice activation must leave evidence display unchanged');
  assert.equal(after.runSummary, before.runSummary, 'practice activation must not start or rewrite a retrieval run');
  assert.deepEqual(practiceTraffic, [], `practice activation emitted fetch/XHR traffic: ${JSON.stringify(practiceTraffic)}`);

  const report = evaluatePedagoguePracticeObservation(fixture, {
    schema: PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA,
    observed_route_steps: [
      'research-container-open',
      'fictional-fields-loaded',
      'evidence-state-remains-empty',
      'operator-route-ready'
    ],
    observed_endpoint: 'operator-route-ready',
    effects: {
      evidence_records_created: 0,
      retrieval_requests_started: 0,
      external_mutations_committed: 0,
      vault_writes_committed: 0,
      reversible_local_writes: 0,
      authority_upgrade_observed: false
    }
  });
  assert.equal(report.certified, true);
  assert.equal(report.tomography.route_reconstruction_error_millipoints, 0);
  assert.equal(report.tomography.geometric_holonomy_claim, false);
  assert.equal(report.authority.evidence_authority, false);
  assert.equal(report.authority.external_write_authority, false);

  const receipt = {
    schema: 'td613.giving.practice-fixture-browser-witness/v0.1',
    engine: engineName,
    fixture_id: fixture.fixture_id,
    before,
    after,
    practice_fetch_xhr_count: practiceTraffic.length,
    route_reconstruction_error_millipoints: report.tomography.route_reconstruction_error_millipoints,
    certified: report.certified,
    authority: report.authority
  };
  await fs.writeFile(path.join(artifactDir, 'practice-fixture-receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt));
} finally {
  await browser.close();
}
