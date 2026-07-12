import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/phase4-browser';
const labUrl = `${base}/dome-world/reciprocal-bridge.html`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function jsonFrom(page, selector) {
  const text = await page.locator(selector).textContent();
  try {
    return JSON.parse(text || '');
  } catch {
    throw new Error(`${selector} did not contain JSON: ${text}`);
  }
}

async function sendAndRead(page) {
  const before = await page.locator('#diagnosticOutput').textContent();
  await page.locator('#send').click();
  await page.waitForFunction(
    previous => document.querySelector('#diagnosticOutput')?.textContent !== previous,
    before
  );
  await page.waitForFunction(() => document.querySelector('#send')?.disabled === false);
  const diagnostic = await jsonFrom(page, '#diagnosticOutput');
  const context = await jsonFrom(page, '#contextOutput');
  const audit = await jsonFrom(page, '#auditOutput');
  const roundTrip = await jsonFrom(page, '#roundOutput');
  return { diagnostic, context, audit, roundTrip };
}

async function layoutReceipt(page) {
  return page.evaluate(() => {
    const grid = document.querySelector('.grid');
    const columns = getComputedStyle(grid).gridTemplateColumns
      .split(' ')
      .filter(Boolean).length;
    const interactive = [...document.querySelectorAll('button, input, select, textarea')]
      .filter(node => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    const clipped = interactive
      .map(node => ({
        id: node.id || node.tagName,
        rect: node.getBoundingClientRect()
      }))
      .filter(item => item.rect.left < -1 || item.rect.right > window.innerWidth + 1)
      .map(item => item.id);
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      document_width: document.documentElement.scrollWidth,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      grid_columns: columns,
      clipped_controls: clipped
    };
  });
}

async function settleViewport(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForFunction(
    expected => window.innerWidth === expected.width && window.innerHeight === expected.height,
    { width, height }
  );
  await page.waitForTimeout(250);
}

await fs.mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'en-US',
  reducedMotion: 'reduce'
});
const page = await context.newPage();
const consoleErrors = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', error => consoleErrors.push(error.message));

const report = {
  schema: 'td613.phase4.browser-demonstration/v0.1',
  status: 'RUNNING',
  base_url: base,
  lab_url: labUrl,
  browser: 'chromium-headless',
  desktop: null,
  mobile_portrait: null,
  mobile_landscape: null,
  rotation_return: null,
  functional: {},
  console_errors: consoleErrors,
  error: null
};

async function persistReport() {
  await fs.writeFile(
    path.join(artifactDir, 'phase4-browser-demonstration.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
}

try {
  await page.goto(labUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('h1').waitFor({ state: 'visible' });
  assert((await page.title()).includes('Reciprocal Receipt Circle'), 'Phase IV lab title was not observed');
  assert(await page.locator('section.card').count() === 4, 'Phase IV lab must expose four receipt stations');
  await page.evaluate(() => localStorage.clear());

  const desktopLayout = await layoutReceipt(page);
  assert(desktopLayout.horizontal_overflow === 0, 'Desktop lab has horizontal overflow');
  assert(desktopLayout.grid_columns === 2, 'Desktop lab must render two grid columns');
  assert(desktopLayout.clipped_controls.length === 0, 'Desktop lab clips interactive controls');

  const valid = await sendAndRead(page);
  assert(valid.context.schema === 'td613.flowcore.context-receipt/v0.1', 'Desktop return did not use context v0.1');
  assert(valid.context.status === 'OPEN', 'Desktop valid route did not return OPEN');
  assert(valid.context.context_posture === 'CONTEXT_READY', 'Desktop valid route did not return CONTEXT_READY');
  assert(valid.context.artifact_reference === null, 'Desktop valid route created an artifact relation');
  assert(valid.context.reciprocal_authority === false, 'Desktop valid route transferred reciprocal authority');
  assert(valid.audit.recommendation.startsWith('CONTEXT_RECEIPT_ADMISSIBLE'), 'Desktop returned-context audit was not admissible');
  assert(valid.audit.open_field_promotion === false, 'Desktop audit promoted Open Field context');
  assert(valid.roundTrip.status.startsWith('ROUND_TRIP_VERIFIED'), 'Desktop round trip was not verified');
  assert(valid.roundTrip.jurisdiction.operator_closure_required === true, 'Desktop round trip lost operator closure');

  const writesBeforeSave = await page.evaluate(() => Object.keys(localStorage)
    .filter(key => key.startsWith('td613.phase4.round-trip.')));
  assert(writesBeforeSave.length === 0, 'Round trip persisted before explicit Save');

  await page.locator('#replay').click();
  await page.waitForFunction(() => document.querySelector('#replayStatus')?.textContent.includes('ROUND_TRIP_VERIFIED'));
  const replayText = await page.locator('#replayStatus').textContent();
  assert(replayText.includes('network false'), 'Replay performed a network call');
  assert(replayText.includes('weather regenerated false'), 'Replay regenerated weather');

  await page.locator('#tamper').click();
  await page.waitForFunction(() => document.querySelector('#replayStatus')?.textContent.includes('ROUND_TRIP_HELD_TAMPER'));

  await page.locator('#referenceTest').click();
  await page.waitForFunction(() => document.querySelector('#auditStatus')?.textContent.includes('HOLD_FOR_REPAIR'));
  await page.locator('#authorityTest').click();
  await page.waitForFunction(() => document.querySelector('#auditStatus')?.textContent.includes('REJECT_AUTHORITY_BREACH'));

  await page.locator('#save').click();
  await page.waitForFunction(() => document.querySelector('#replayStatus')?.textContent.startsWith('SAVED'));
  const writesAfterSave = await page.evaluate(() => Object.keys(localStorage)
    .filter(key => key.startsWith('td613.phase4.round-trip.')));
  assert(writesAfterSave.length === 1, 'Explicit Save did not create exactly one local receipt');

  await page.locator('#route').selectOption('OPEN_FIELD_SPECULATIVE_SYNTHESIS');
  await page.locator('#runtime').selectOption('BACKGROUND');
  await page.locator('#default').click();
  const openField = await sendAndRead(page);
  assert(openField.audit.open_field_promotion === false, 'Open Field context was promoted');
  assert(openField.audit.runtime_materiality === 'BACKGROUND', 'Quiet runtime materiality drifted');
  assert(openField.audit.runtime_surfaced === false, 'BACKGROUND runtime surfaced automatically');
  assert(openField.audit.warnings.includes('context_available_not_promoted'), 'Open Field non-promotion warning was absent');

  await page.locator('#invalid').click();
  const invalid = await sendAndRead(page);
  const invalidDivergence = invalid.context.measurements.find(item => item.name === 'divergence');
  assert(invalid.context.status === 'ABSTAIN', 'Invalid divergence did not abstain');
  assert(invalid.context.weather === null, 'Invalid divergence generated weather');
  assert(invalidDivergence?.value === null, 'Invalid divergence was clamped instead of withheld');

  await page.locator('#abstain').click();
  const missing = await sendAndRead(page);
  assert(missing.context.status === 'ABSTAIN', 'Missing coherence did not abstain');
  assert(missing.context.context_posture === 'ABSTAIN_INSUFFICIENT_CONTEXT', 'Missing coherence posture drifted');
  assert(missing.context.weather === null, 'Missing coherence generated weather');

  await page.screenshot({
    path: path.join(artifactDir, 'phase4-desktop.png'),
    fullPage: true
  });
  report.desktop = desktopLayout;
  report.functional = {
    context_receipt: valid.context.receipt_id,
    audit: valid.audit.recommendation,
    round_trip: valid.roundTrip.receipt_id,
    replay: 'ROUND_TRIP_VERIFIED',
    tamper_replay: 'ROUND_TRIP_HELD_TAMPER',
    reference_mismatch: 'HOLD_FOR_REPAIR',
    authority_injection: 'REJECT_AUTHORITY_BREACH',
    explicit_local_save: true,
    open_field_promotion: openField.audit.open_field_promotion,
    background_runtime_surfaced: openField.audit.runtime_surfaced,
    invalid_range: invalid.context.context_posture,
    missing_context: missing.context.context_posture
  };

  await settleViewport(page, 390, 844);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('h1').waitFor({ state: 'visible' });
  const portrait = await layoutReceipt(page);
  assert(portrait.horizontal_overflow === 0, 'Mobile portrait has horizontal overflow');
  assert(portrait.grid_columns === 1, 'Mobile portrait must render one grid column');
  assert(portrait.clipped_controls.length === 0, 'Mobile portrait clips interactive controls');
  const mobileValid = await sendAndRead(page);
  assert(mobileValid.context.status === 'OPEN', 'Mobile portrait valid route did not return OPEN');
  await page.screenshot({
    path: path.join(artifactDir, 'phase4-mobile-portrait.png'),
    fullPage: true
  });
  report.mobile_portrait = portrait;

  await settleViewport(page, 844, 390);
  const landscape = await layoutReceipt(page);
  assert(landscape.horizontal_overflow === 0, 'Mobile landscape has horizontal overflow');
  assert(landscape.grid_columns === 2, 'Mobile landscape must restore two grid columns');
  assert(landscape.clipped_controls.length === 0, 'Mobile landscape clips interactive controls');
  await page.screenshot({
    path: path.join(artifactDir, 'phase4-mobile-landscape.png'),
    fullPage: true
  });
  report.mobile_landscape = landscape;

  await settleViewport(page, 390, 844);
  const rotationReturn = await layoutReceipt(page);
  assert(rotationReturn.horizontal_overflow === 0, 'Portrait rotation return has horizontal overflow');
  assert(rotationReturn.grid_columns === 1, 'Portrait rotation return did not restore one column');
  assert(rotationReturn.clipped_controls.length === 0, 'Portrait rotation return clips interactive controls');
  report.rotation_return = rotationReturn;

  assert(consoleErrors.length === 0, `Browser console errors observed: ${consoleErrors.join(' | ')}`);
  report.status = 'PASS';
  await persistReport();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.error = {
    message: error?.message || String(error),
    stack: error?.stack || null
  };
  try {
    await page.screenshot({
      path: path.join(artifactDir, 'phase4-browser-held.png'),
      fullPage: true
    });
  } catch {
    // Evidence writing must not conceal the original failure.
  }
  await persistReport();
  console.error(JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
