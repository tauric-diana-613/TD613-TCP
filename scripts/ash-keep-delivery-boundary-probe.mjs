import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/$/, '');
const url = `${base}/dome-world/ash-keep.html`;
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-keep-delivery-boundary';

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

async function bounded(label, operation, timeoutMs, fallback) {
  let timer;
  try {
    return await Promise.race([
      operation(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} exceeded ${timeoutMs}ms`)), timeoutMs);
      })
    ]);
  } catch (error) {
    return typeof fallback === 'function' ? fallback(error) : fallback;
  } finally {
    clearTimeout(timer);
  }
}

function classify({ status, contentType, title, bodyText, h1Count, htmlLength, navigationError, diagnosticTimeouts }) {
  const combined = `${title}\n${bodyText}`;
  if (navigationError) return 'NAVIGATION_ERROR';
  if (Number.isFinite(status) && status >= 400) return 'HTTP_ERROR';
  if (!/text\/html/i.test(contentType || '')) return 'NON_HTML';
  if (/vercel security checkpoint|security challenge|captcha|verify you are human/i.test(combined)) return 'EDGE_INTERSTITIAL';
  if (diagnosticTimeouts.length) return 'BROWSER_DOCUMENT_STALLED';
  if (!htmlLength || !bodyText.trim()) return 'EMPTY_DOCUMENT';
  if (h1Count > 0 && /TD613 Ash Keep/i.test(title)) return 'DOCUMENT_READY';
  if (h1Count === 0) return 'H1_ABSENT';
  return 'UNEXPECTED_DOCUMENT';
}

await fs.mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'en-US',
  reducedMotion: 'reduce'
});
const page = await context.newPage();
page.setDefaultTimeout(5_000);
page.setDefaultNavigationTimeout(60_000);
const consoleErrors = [];
const failedRequests = [];
const diagnosticTimeouts = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', error => consoleErrors.push(error.message));
page.on('requestfailed', request => failedRequests.push({
  url: request.url(),
  method: request.method(),
  resource_type: request.resourceType(),
  failure: request.failure()?.errorText || 'unknown'
}));

let response = null;
let navigationError = null;
try {
  response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => null);
} catch (error) {
  navigationError = { message: error?.message || String(error), stack: error?.stack || null };
}

const timedFallback = (label, value) => error => {
  diagnosticTimeouts.push({ label, message: error?.message || String(error) });
  return value;
};
const headers = response
  ? await bounded('response headers', () => response.allHeaders(), 5_000, timedFallback('response headers', {}))
  : {};
const html = await bounded('page content', () => page.content(), 5_000, timedFallback('page content', ''));
const bodyText = await bounded('body text', () => page.locator('body').innerText(), 5_000, timedFallback('body text', ''));
const title = await bounded('document title', () => page.title(), 5_000, timedFallback('document title', ''));
const h1Count = await bounded('h1 count', () => page.locator('h1').count(), 5_000, timedFallback('h1 count', 0));
const screenshotPath = path.join(artifactDir, 'ash-keep-delivery-boundary.png');
const screenshotCaptured = await bounded(
  'full-page screenshot',
  async () => {
    await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 10_000 });
    return true;
  },
  12_000,
  timedFallback('full-page screenshot', false)
);
await fs.writeFile(path.join(artifactDir, 'ash-keep-delivered-document.html'), html || '<!-- empty document -->\n');

const observation = {
  schema: 'td613.ash-keep.delivery-boundary-observation/v0.2',
  status: 'OBSERVED',
  classification: classify({
    status: response?.status?.() ?? null,
    contentType: headers['content-type'] || null,
    title,
    bodyText,
    h1Count,
    htmlLength: Buffer.byteLength(html),
    navigationError,
    diagnosticTimeouts
  }),
  requested_url: url,
  final_url: page.url(),
  response_status: response?.status?.() ?? null,
  response_status_text: response?.statusText?.() ?? null,
  response_ok: response?.ok?.() ?? null,
  content_type: headers['content-type'] || null,
  response_headers: headers,
  document_title: title,
  h1_count: h1Count,
  html_byte_length: Buffer.byteLength(html),
  body_text_prefix: bodyText.slice(0, 800),
  console_errors: consoleErrors,
  failed_requests: failedRequests,
  navigation_error: navigationError,
  diagnostic_timeouts: diagnosticTimeouts,
  source_status: base.includes('localhost') || base.includes('127.0.0.1') ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
  boundary_rules: {
    user_agent_overridden: false,
    cookies_injected: false,
    challenge_bypass_attempted: false,
    storage_written_by_probe: false,
    product_actions_performed: false
  },
  evidence: {
    document_sha256: sha256(html),
    screenshot_path: screenshotCaptured ? 'ash-keep-delivery-boundary.png' : null,
    screenshot_captured: screenshotCaptured
  },
  promotion_authorized: false,
  observed_at: new Date().toISOString()
};

const body = `${JSON.stringify(observation, null, 2)}\n`;
await fs.writeFile(path.join(artifactDir, 'ash-keep-delivery-boundary.json'), body);
console.log(body);
await bounded('browser close', () => browser.close(), 10_000, timedFallback('browser close', null));
