import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import {
  compileDefaultHolonomyLoomReleaseCandidateReview,
  renderHolonomyLoomReleaseCandidateReviewMarkdown
} from './holonomy-loom-release-candidate-product-review.mjs';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/holonomy-loom-release-candidate-review';
const route = '/dome-world/holonomy-loom.html';
const url = `${base}${route}`;
await fs.mkdir(artifactDir, { recursive: true });

const review = await compileDefaultHolonomyLoomReleaseCandidateReview({
  repositoryHead: process.env.GITHUB_SHA || 'LOCAL_UNBOUND'
});
const markdown = renderHolonomyLoomReleaseCandidateReviewMarkdown(review);
const markdownSha256 = createHash('sha256').update(markdown, 'utf8').digest('hex');

const report = {
  schema: 'td613.holonomy-loom.release-candidate-product-review-browser-witness/v0.1',
  status: 'OPEN',
  browser: browserName,
  route,
  review_status: review.status,
  review_evidence_class: review.evidence.review_evidence_class,
  reviewed_repository_head: review.reviewed_repository_head,
  reviewed_candidate: review.reviewed_candidate,
  markdown_sha256: markdownSha256,
  product_bytes_mutated_by_review: false,
  human_comprehension_observed: false,
  human_operator_production_observation: false,
  merge_authority: false,
  vercel_authority: false,
  production_release_authority: false,
  provider_release_authority: false,
  provider_call_performed: false,
  human_closure_required: true,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0,
  checks: [],
  failed_checks: [],
  page_errors: [],
  console_errors: [],
  requests: []
};
const check = (name, pass, detail = null) => report.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
const detailsOpen = locator => locator.evaluate(node => Boolean(node.open)).catch(() => false);

check('static release-candidate review packet passes before browser projection', review.status === 'PASS', review.failed_sections);
check('human-readable review packet contains all R0-R7 PASS sections', ['R0','R1','R2','R3','R4','R5','R6','R7'].every(id => markdown.includes(`### ${id} `) && markdown.includes(' — PASS')));
check('human-readable review packet preserves human-evidence disclaimer', /not evidence that a human understood the product/i.test(markdown) && /not a production observation/i.test(markdown));
check('human-readable review packet preserves release-authority disclaimer', /not release authorization/i.test(markdown));

const browser = await browserType.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, colorScheme: 'dark' });
  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push(message.text());
  });
  page.on('request', request => {
    const parsed = new URL(request.url());
    report.requests.push({
      method: request.method(),
      origin: parsed.origin,
      pathname: parsed.pathname,
      mutation: !['GET','HEAD','OPTIONS'].includes(request.method())
    });
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  check('hosted review route loaded', new URL(page.url()).pathname === route, page.url());
  check('Holonomy Loom title visibly renders', await page.getByRole('heading', { name: 'Holonomy Loom', exact: true }).isVisible());
  check('ordinary-language task instruction visibly renders', await page.getByText('Before you send it, check what this message carries.', { exact: true }).isVisible());
  check('child-legible operational route visibly renders', await page.getByText('SEE → CHECK → UNDERSTAND → REST', { exact: true }).isVisible());
  check('CHECK THIS MESSAGE is a visible operator control', await page.getByRole('button', { name: 'CHECK THIS MESSAGE', exact: true }).isVisible());
  check('result projection starts unrendered', !(await page.locator('#result').isVisible()));
  check('technical promise is not forced before consequence', !(await detailsOpen(page.locator('#promiseDisclosure'))));
  check('provider help is not forced before consequence', !(await detailsOpen(page.locator('#providerDisclosure'))));
  check('Show me why is not forced before consequence', !(await detailsOpen(page.locator('#whyDetails'))));

  await page.locator('#protectionRules summary').click();
  await page.locator('#protected').fill('do-not-send');
  await page.locator('#message').fill('ordinary context do-not-send');
  await page.locator('#check').click();
  await page.locator('#result.show').waitFor({ timeout: 10_000 });
  check('RED consequence visibly renders for a hard protected term', (await page.locator('#statusLight').innerText()).trim() === 'RED');
  check('RED summary stays bounded to current protection rules', (await page.locator('#summary').innerText()).trim() === 'Stop. This message contains something your protection rules say must not leave.');
  check('raw checked-copy door stays closed on RED', !(await page.locator('#copyChecked').isEnabled()));
  check('safer-copy door is available on RED', await page.locator('#makeSafer').isEnabled());
  check('KEEP CHANGE REMOVE meanings remain visible after consequence', await page.getByText('KEEP', { exact: true }).isVisible() && await page.getByText('CHANGE', { exact: true }).isVisible() && await page.getByText('REMOVE', { exact: true }).isVisible());
  check('Rest is available on RED without technical disclosure', await page.locator('#rest').isVisible());
  check('Return is available on RED without technical disclosure', await page.locator('#returnToCheck').isVisible());
  check('Exit is available on RED without technical disclosure', await page.locator('#exitLoom').isVisible());
  check('technical promise remains optional after RED consequence', !(await detailsOpen(page.locator('#promiseDisclosure'))));

  await page.locator('#makeSafer').click();
  check('safer-copy operation can open the checked-copy door after bounded rewrite', await page.locator('#copyChecked').isEnabled());

  await page.locator('#protected').fill('');
  await page.locator('#message').fill('ordinary bounded message');
  await page.locator('#check').click();
  check('GREEN consequence visibly renders', (await page.locator('#statusLight').innerText()).trim() === 'GREEN');
  check('GREEN summary remains exact and bounded', (await page.locator('#summary').innerText()).trim() === 'Nothing matched the protection rules you turned on.');
  check('technical promise remains optional after GREEN consequence', !(await detailsOpen(page.locator('#promiseDisclosure'))));
  check('provider help remains optional after GREEN consequence', !(await detailsOpen(page.locator('#providerDisclosure'))));
  check('Show me why remains optional after GREEN consequence', !(await detailsOpen(page.locator('#whyDetails'))));

  await page.locator('#promiseDisclosure summary').click();
  check('technical promise requires explicit operator disclosure', await detailsOpen(page.locator('#promiseDisclosure')));
  check('technical promise exposes downstream ceiling after explicit disclosure', (await page.locator('#promiseDisclosure').innerText()).includes('The Loom can control what it lets leave its own door. It cannot control every room the message enters afterward.'));
  check('technical promise exposes enabled-rule GREEN ceiling after explicit disclosure', (await page.locator('#promiseDisclosure').innerText()).includes('GREEN means only that no enabled Loom rule fired.'));
  check('opening technical promise does not rewrite GREEN consequence', (await page.locator('#summary').innerText()).trim() === 'Nothing matched the protection rules you turned on.');

  await page.locator('#rest').click();
  check('Rest explicitly refuses coercive continuation', (await page.locator('#restStatus').innerText()).trim() === 'Rest. Nothing else is required. Return or exit whenever you choose.');

  const external = report.requests.filter(item => item.origin !== new URL(base).origin);
  const mutations = report.requests.filter(item => item.mutation);
  check('review episode observes zero external request', external.length === 0, external);
  check('review episode observes zero mutation request', mutations.length === 0, mutations);
  check('review episode observes zero page errors', report.page_errors.length === 0, report.page_errors);
  const boundedConsole = report.console_errors.filter(text => !/favicon/i.test(text));
  check('review episode observes zero page-owned console errors', boundedConsole.length === 0, report.console_errors);
} catch (error) {
  report.page_errors.push(error.stack || error.message);
  check('release-candidate review browser witness completed', false, error.message);
} finally {
  await browser.close();
}

report.failed_checks = report.checks.filter(item => item.status === 'FAIL').map(item => item.name);
report.status = report.failed_checks.length === 0 ? 'PASS' : 'HELD';
const receiptPath = path.join(artifactDir, `holonomy-loom-release-candidate-product-review-${browserName}.json`);
const markdownPath = path.join(artifactDir, 'holonomy-loom-release-candidate-product-review.md');
await fs.writeFile(receiptPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await fs.writeFile(markdownPath, markdown, 'utf8');
console.log(`Holonomy Loom release-candidate product review browser witness (${browserName}): ${report.status}`);
console.log(JSON.stringify({ status: report.status, browser: browserName, failed: report.failed_checks, receipt: receiptPath, markdown: markdownPath, markdown_sha256: markdownSha256 }, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
