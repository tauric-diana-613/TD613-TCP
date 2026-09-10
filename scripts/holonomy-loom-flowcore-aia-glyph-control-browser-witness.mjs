import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/holonomy-loom-flowcore-aia-glyph-control';
const route = '/dome-world/holonomy-loom.html';
const url = `${base}${route}`;
const baseOrigin = new URL(base).origin;
const canary = `TD613_GLYPH_CANARY_${browserName.toUpperCase()}_613`;
await fs.mkdir(artifactDir, { recursive: true });

const report = {
  schema: 'td613.holonomy-loom.flowcore-aia-glyph-control-browser-witness/v0.1',
  status: 'OPEN',
  browser: browserName,
  route,
  interaction_scope: 'EXPLICIT_LOCAL_RULE_LABORATORY',
  source_status: 'OBSERVED',
  authority_class: 'A1_OBSERVATIONAL',
  witness_instrumentation: {
    clipboard_stub: true,
    element_animate_counter: true,
    product_bytes_mutated: false
  },
  flowcore_aia: {
    explicit_route_selection: 'EXPERIENTIAL',
    route_inference_performed: false,
    generic_flowcore_taxonomy_mutated: false,
    canonical_glyph_sequence: ['à', '米', 'hõt', '出', 'cōl', '𝄐'],
    static_equivalent_required: true
  },
  preserved_red_lineage: [
    'Ready run 2828 Chromium + Firefox: witness attempted to fill hidden #protected before explicitly opening Protection rules; product bytes unchanged',
    'Ready run 2828 WebKit: independent A15 mobile-reduced political_campaign custodial route timeout occurred in Step 7 before glyph witness execution'
  ],
  request_summary: {
    total_request_count: 0,
    external_request_count: 0,
    mutation_request_count: 0,
    canary_egress_count: 0
  },
  provider_call_performed: false,
  human_comprehension_observed: false,
  human_operator_production_observation: false,
  merge_authority: false,
  vercel_authority: false,
  production_release_authority: false,
  provider_release_authority: false,
  human_closure_required: true,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0,
  checks: [],
  page_errors: [],
  console_errors: []
};

const check = (name, pass, detail = null) => report.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
const browser = await browserType.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, colorScheme: 'dark', reducedMotion: 'no-preference' });

  await page.addInitScript(() => {
    window.__td613GlyphWitness = { clipboardMode: 'resolve', clipboardWrites: 0 };
    const originalAnimate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const count = Number(this.dataset.td613WitnessAnimateCount || '0') + 1;
      this.dataset.td613WitnessAnimateCount = String(count);
      return originalAnimate.apply(this, args);
    };
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          window.__td613GlyphWitness.clipboardWrites += 1;
          if (window.__td613GlyphWitness.clipboardMode === 'reject') throw new DOMException('Witness clipboard rejection', 'NotAllowedError');
        }
      }
    });
  });

  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.console_errors.push(message.text()); });
  page.on('request', request => {
    report.request_summary.total_request_count += 1;
    const requestUrl = request.url();
    const method = request.method().toUpperCase();
    const body = request.postData() || '';
    if (new URL(requestUrl).origin !== baseOrigin) report.request_summary.external_request_count += 1;
    if (!['GET', 'HEAD'].includes(method)) report.request_summary.mutation_request_count += 1;
    if (requestUrl.includes(canary) || body.includes(canary)) report.request_summary.canary_egress_count += 1;
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  const laboratory = page.locator('#loomLegacy');
  check('local laboratory starts optional and closed', !(await laboratory.evaluate(node => Boolean(node.open))));
  await laboratory.locator(':scope > summary').click();
  check('local laboratory opened explicitly before glyph-control traversal', await laboratory.evaluate(node => Boolean(node.open)));
  const glyphPath = page.locator('#glyphPath');
  const showPath = page.locator('#showPath');
  const releaseNode = page.locator('[data-motion-key="release"]');
  const emergenceNode = page.locator('[data-motion-key="bounded_emergence"]');
  const restNode = page.locator('[data-motion-key="structural_rest"]');
  const gatherNode = page.locator('[data-motion-key="gathering"]');
  const recurrenceNode = page.locator('[data-motion-key="recurrence"]');

  check('hosted Loom route loaded', new URL(page.url()).pathname === route, page.url());
  check('glyph path is hidden before any consequence', await glyphPath.isHidden());
  check('SHOW THE PATH is not visible before result', await showPath.isHidden());
  check('visible child body contains no Flow-Core implementation jargon before result', !((await page.locator('body').innerText()).includes('td613.flowcore')));

  await page.locator('#message').fill(`ordinary bounded message ${canary}`);
  await page.locator('#check').click();
  await page.locator('#result.show').waitFor({ timeout: 10_000 });
  check('plain GREEN consequence renders before glyph path', (await page.locator('#summary').innerText()).trim() === 'Nothing matched the protection rules you turned on.');
  check('glyph path remains hidden after consequence until explicit operator request', await glyphPath.isHidden());
  check('SHOW THE PATH becomes visible only after consequence', await showPath.isVisible());

  await showPath.focus();
  check('SHOW THE PATH can receive keyboard focus', await showPath.evaluate(node => document.activeElement === node));
  await page.keyboard.press('Enter');
  await glyphPath.waitFor({ state: 'visible', timeout: 5_000 });

  check('explicit path action selects EXPERIENTIAL AIA route', await glyphPath.getAttribute('data-aia-route-selection') === 'EXPERIENTIAL');
  check('path declares route inference false', await glyphPath.getAttribute('data-route-inference') === 'false');
  check('root declares authority crossing false', await page.locator('[data-flowcore-pedagogue="holonomy-loom"]').getAttribute('data-authority-cross') === 'false');
  const glyphSequence = await page.locator('[data-motion-key] .glyph').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
  check('canonical glyph sequence is rendered exactly', JSON.stringify(glyphSequence) === JSON.stringify(report.flowcore_aia.canonical_glyph_sequence), glyphSequence);
  const childLabels = await page.locator('[data-motion-key] .glyph-label').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
  check('ordinary-language labels remain beside every glyph', JSON.stringify(childLabels) === JSON.stringify(['Gathered', 'Compared', 'Safer copy', 'Copy checked', 'Return', 'Rest']), childLabels);
  check('GREEN release control is available but not yet released', (await releaseNode.getAttribute('data-motion-state')) === 'AVAILABLE' && await releaseNode.isEnabled(), { state: await releaseNode.getAttribute('data-motion-state') });
  check('path selection itself triggers no decorative animation', await page.evaluate(() => document.getAnimations().length === 0));

  const gatherBefore = Number(await gatherNode.getAttribute('data-td613-witness-animate-count') || '0');
  await gatherNode.click();
  const gatherAfter = Number(await gatherNode.getAttribute('data-td613-witness-animate-count') || '0');
  check('à motion is operator-triggered and finite', gatherAfter === gatherBefore + 1, { before: gatherBefore, after: gatherAfter });

  const greenReleaseBefore = Number(await releaseNode.getAttribute('data-td613-witness-animate-count') || '0');
  await releaseNode.click();
  const greenReleaseAfter = Number(await releaseNode.getAttribute('data-td613-witness-animate-count') || '0');
  check('successful clipboard completion advances 出 to RELEASED', (await releaseNode.getAttribute('data-motion-state')) === 'RELEASED');
  check('successful clipboard completion is required before outward 出 motion', greenReleaseAfter === greenReleaseBefore + 1, { before: greenReleaseBefore, after: greenReleaseAfter });
  check('clipboard success was observed once for GREEN release', await page.evaluate(() => window.__td613GlyphWitness.clipboardWrites) === 1);

  const protectedToken = 'PRIVATE_GLYPH_CONTROL_613';
  await page.locator('#message').fill(`ordinary ${protectedToken}`);
  const protectionRules = page.locator('#protectionRules');
  if (!(await protectionRules.evaluate(node => Boolean(node.open)))) {
    await protectionRules.locator('summary').click();
  }
  check('RED fixture opens Protection rules explicitly before editing protected terms', await protectionRules.evaluate(node => Boolean(node.open)));
  await page.locator('#protected').fill(protectedToken);
  await page.locator('#check').click();
  check('new CHECK hides prior glyph path again', await glyphPath.isHidden());
  check('RED consequence remains ordinary-language and visible before path', (await page.locator('#statusLight').innerText()).trim() === 'RED');
  await showPath.click();
  check('RED path renders release as BLOCKED', (await releaseNode.getAttribute('data-motion-state')) === 'BLOCKED' && !(await releaseNode.isEnabled()), { state: await releaseNode.getAttribute('data-motion-state') });
  const blockedReleaseBefore = Number(await releaseNode.getAttribute('data-td613-witness-animate-count') || '0');
  await releaseNode.evaluate(node => node.click());
  const blockedReleaseAfter = Number(await releaseNode.getAttribute('data-td613-witness-animate-count') || '0');
  check('blocked 出 cannot produce outward motion', blockedReleaseAfter === blockedReleaseBefore, { before: blockedReleaseBefore, after: blockedReleaseAfter });

  await emergenceNode.click();
  check('hõt safer-copy action advances its bounded state to READY', (await emergenceNode.getAttribute('data-motion-state')) === 'READY');
  check('deterministic safer copy can make the release control available', await releaseNode.isEnabled() && (await releaseNode.getAttribute('data-motion-state')) === 'AVAILABLE');

  await page.evaluate(() => { window.__td613GlyphWitness.clipboardMode = 'reject'; });
  const rejectReleaseBefore = Number(await releaseNode.getAttribute('data-td613-witness-animate-count') || '0');
  await releaseNode.click();
  const rejectReleaseAfter = Number(await releaseNode.getAttribute('data-td613-witness-animate-count') || '0');
  check('clipboard rejection advances 出 to bounded COPY BLOCKED state', (await releaseNode.getAttribute('data-motion-state')) === 'COPY_BLOCKED');
  check('clipboard rejection produces no outward 出 animation', rejectReleaseAfter === rejectReleaseBefore, { before: rejectReleaseBefore, after: rejectReleaseAfter });
  check('browser-boundary refusal copy is visible in plain language', (await page.locator('#copyStatus').innerText()).includes('browser did not allow clipboard access'));

  await page.evaluate(() => { window.__td613GlyphWitness.clipboardMode = 'resolve'; });
  await releaseNode.click();
  check('release can recover after browser clipboard permission returns', (await releaseNode.getAttribute('data-motion-state')) === 'RELEASED');

  await recurrenceNode.click();
  await restNode.click();
  check('𝄐 leaves an inspectable SETTLED state', (await restNode.getAttribute('data-motion-state')) === 'SETTLED');
  check('Rest keeps Return and Exit visible', await page.locator('#returnToCheck').isVisible() && await page.locator('#exitLoom').isVisible());
  await page.waitForTimeout(800);
  check('no motion remains running after structural Rest settles', await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length === 0));
  const postRestGatherBefore = Number(await gatherNode.getAttribute('data-td613-witness-animate-count') || '0');
  await gatherNode.click();
  const postRestGatherAfter = Number(await gatherNode.getAttribute('data-td613-witness-animate-count') || '0');
  check('𝄐 blocks new path pulses after structural Rest', postRestGatherAfter === postRestGatherBefore, { before: postRestGatherBefore, after: postRestGatherAfter });

  await page.locator('[data-motion-key="protected_continuity"]').click();
  check('cōl Return keeps the checked result present', await page.locator('#result').isVisible());
  check('cōl Return returns focus to the message control', await page.locator('#message').evaluate(node => document.activeElement === node));
  check('cōl Return records the message anchor', new URL(page.url()).hash === '#messageTitle', page.url());

  await page.setViewportSize({ width: 390, height: 844 });
  check('mobile layout does not introduce horizontal page overflow', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  // Fragment navigation can reopen ancestor details in some engines; WebKit may keep it closed.
  // Restore the declared laboratory route with a normal disclosure gesture before filling its field.
  const reducedLaboratory = page.locator('#loomLegacy');
  const reopenedByFragment = await reducedLaboratory.evaluate(node => Boolean(node.open));
  if (!reopenedByFragment) await reducedLaboratory.locator(':scope > summary').click();
  check('reduced-motion laboratory is open before replay after reload',
    await reducedLaboratory.evaluate(node => Boolean(node.open)), { reopened_by_fragment: reopenedByFragment });
  await page.locator('#message').fill('ordinary reduced motion message');
  await page.locator('#check').click();
  await page.locator('#showPath').click();
  const reducedStates = await page.locator('[data-motion-key]').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [node.dataset.motionKey, node.dataset.motionState])));
  check('reduced-motion path declares reduced mode', await page.locator('#glyphPath').getAttribute('data-reduced-motion') === 'true');
  check('reduced-motion preserves release availability and static state labels', reducedStates.release === 'AVAILABLE' && reducedStates.gathering === 'COMPLETE' && reducedStates.recurrence === 'COMPLETE', reducedStates);
  const reducedGatherBefore = Number(await page.locator('[data-motion-key="gathering"]').getAttribute('data-td613-witness-animate-count') || '0');
  await page.locator('[data-motion-key="gathering"]').click();
  const reducedGatherAfter = Number(await page.locator('[data-motion-key="gathering"]').getAttribute('data-td613-witness-animate-count') || '0');
  check('reduced-motion invokes no animation API for semantic replay', reducedGatherAfter === reducedGatherBefore, { before: reducedGatherBefore, after: reducedGatherAfter });
  check('reduced-motion still exposes the static-equivalent explanation', (await page.locator('.motion-static-note').innerText()).includes('same control information'));

  check('zero page errors', report.page_errors.length === 0, report.page_errors);
  const boundedConsole = report.console_errors.filter(text => !/favicon/i.test(text));
  check('zero page-owned console errors', boundedConsole.length === 0, report.console_errors);
  check('zero external requests', report.request_summary.external_request_count === 0, report.request_summary);
  check('zero mutation requests', report.request_summary.mutation_request_count === 0, report.request_summary);
  check('zero canary egress', report.request_summary.canary_egress_count === 0, report.request_summary);
} catch (error) {
  report.page_errors.push(error.stack || error.message);
  check('glyph-control browser witness completed', false, error.message);
} finally {
  await browser.close();
}

report.failed_checks = report.checks.filter(item => item.status === 'FAIL').map(item => item.name);
report.status = report.failed_checks.length === 0 ? 'PASS' : 'HELD';
const artifactPath = path.join(artifactDir, `holonomy-loom-flowcore-aia-glyph-control-${browserName}.json`);
await fs.writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Holonomy Loom Flow-Core AIA glyph-control browser witness (${browserName}): ${report.status}`);
const failureDetails = report.checks.filter(item => item.status === 'FAIL').slice(0, 8).map(item => {
  const detail = typeof item.detail === 'string' ? item.detail : '';
  return { check: item.name,
    summary: detail.split('\n')[0].replaceAll(canary, '[CANARY]').replaceAll('PRIVATE_GLYPH_CONTROL_613', '[PROTECTED_FIXTURE]').slice(0, 320),
    locator_observation: ['element is not visible', 'element is not enabled', 'Target page, context or browser has been closed'].find(observation => detail.includes(observation)) || null };
});
console.log(JSON.stringify({ status: report.status, browser: browserName, failed: report.failed_checks, failure_details: failureDetails, artifact: artifactPath, request_summary: report.request_summary }, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
