import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium').trim();
const engine = { chromium, firefox, webkit }[browserName];
const route = `${base}/aperture/tool.html`;
const sourceHead = String(process.env.TD613_SOURCE_PACKET_COMMIT || process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA || '').trim() || null;
const parentArtifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/aperture-v32-identity-${browserName}`);
const artifactDir = path.join(parentArtifactDir, 'aperture-v32-identity-singularity');
const expectedVersion = 'v3.2-alpha';
const expectedSchema = 'td613-aperture/v3.2-alpha';
const expectedTitle = 'TD613 Aperture v3.2-alpha';

function assert(value, message) {
  if (!value) throw new Error(message);
}

function identityFailures(sample) {
  const failures = [];
  const expectVersion = (field, value, { optional = false } = {}) => {
    if ((value === null || value === undefined || value === '') && optional) return;
    if (value !== expectedVersion) failures.push(`${field}=${JSON.stringify(value)}`);
  };
  const expectSchema = (field, value, { optional = false } = {}) => {
    if ((value === null || value === undefined || value === '') && optional) return;
    if (value !== expectedSchema) failures.push(`${field}=${JSON.stringify(value)}`);
  };

  if (sample.document_title !== expectedTitle) failures.push(`document_title=${JSON.stringify(sample.document_title)}`);
  if (sample.title_text !== expectedTitle) failures.push(`title_text=${JSON.stringify(sample.title_text)}`);
  expectVersion('html_data_aperture_version', sample.html_data_aperture_version, { optional: true });
  expectVersion('body_data_aperture_version', sample.body_data_aperture_version);
  expectVersion('meta_aperture_version', sample.meta_aperture_version);
  expectVersion('visible_firmware_readout', sample.visible_firmware_readout, { optional: true });
  expectSchema('visible_schema_readout', sample.visible_schema_readout, { optional: true });
  expectVersion('window_APERTURE_VERSION', sample.window_APERTURE_VERSION);
  expectSchema('window_APERTURE_SCHEMA_VERSION', sample.window_APERTURE_SCHEMA_VERSION);
  expectVersion('window_FIRMWARE_VERSION', sample.window_FIRMWARE_VERSION, { optional: true });
  expectSchema('window_FIRMWARE_SCHEMA_VERSION', sample.window_FIRMWARE_SCHEMA_VERSION, { optional: true });
  return failures;
}

async function sampleIdentity(page, label, elapsedMs) {
  const sample = await page.evaluate(({ label: sampleLabel, elapsedMs: elapsed }) => {
    const firmware = document.getElementById('mFirmwareVer')
      || document.getElementById('firmwareSpineVersion')
      || document.querySelector('[data-firmware-spine-version]');
    const schema = document.getElementById('schemaVersionReadout')
      || document.getElementById('mSchemaVer')
      || document.getElementById('schemaVersion');
    return {
      label: sampleLabel,
      elapsed_ms: elapsed,
      document_title: document.title,
      title_text: document.querySelector('title')?.textContent || null,
      html_data_aperture_version: document.documentElement?.getAttribute('data-aperture-version') || null,
      body_data_aperture_version: document.body?.getAttribute('data-aperture-version') || null,
      meta_aperture_version: document.querySelector('meta[name="aperture-version"]')?.getAttribute('content') || null,
      visible_firmware_readout: firmware?.textContent?.trim() || null,
      visible_schema_readout: schema?.textContent?.trim() || null,
      window_APERTURE_VERSION: window.APERTURE_VERSION || null,
      window_APERTURE_SCHEMA_VERSION: window.APERTURE_SCHEMA_VERSION || null,
      window_FIRMWARE_VERSION: window.FIRMWARE?.VERSION || null,
      window_FIRMWARE_SCHEMA_VERSION: window.FIRMWARE?.SCHEMA_VERSION || null
    };
  }, { label, elapsedMs });
  sample.failures = identityFailures(sample);
  sample.status = sample.failures.length === 0 ? 'PASS' : 'FAIL';
  return sample;
}

assert(engine, `Unsupported browser engine: ${browserName}`);
await fs.mkdir(artifactDir, { recursive: true });

const report = {
  schema: 'td613.aperture.v32-identity-singularity-browser-evidence/v0.1',
  status: 'RUNNING',
  browser: browserName,
  source_head: sourceHead,
  route,
  exact_current_identity: {
    version: expectedVersion,
    schema: expectedSchema,
    title: expectedTitle
  },
  samples: [],
  console_errors: [],
  page_errors: [],
  http_errors: [],
  external_requests: [],
  non_read_requests: [],
  authority: {
    counts_as_human_evidence: false,
    production_observation: false,
    release_authority: false,
    merge_authority: false,
    vercel_authority: false,
    provider_call_performed: false,
    human_closure_required: true,
    exogenous_witness_credit: 0,
    golden_egg_credit: 0
  }
};

let terminalError = null;
let browser = null;
try {
  browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push(message.text());
  });
  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('request', request => {
    const method = request.method();
    const url = request.url();
    if (!['GET', 'HEAD'].includes(method)) report.non_read_requests.push({ method, url });
    try {
      if (new URL(url).origin !== new URL(base).origin) report.external_requests.push({ method, url });
    } catch {}
  });
  page.on('response', response => {
    if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) {
      report.http_errors.push({ status: response.status(), url: response.url() });
    }
  });

  await page.goto(route, { waitUntil: 'domcontentloaded' });
  report.samples.push(await sampleIdentity(page, 'T0_DOM_READY', 0));
  await page.waitForTimeout(350);
  report.samples.push(await sampleIdentity(page, 'T1_350MS', 350));
  await page.waitForTimeout(650);
  report.samples.push(await sampleIdentity(page, 'T2_1000MS', 1000));
  await page.waitForTimeout(1200);
  report.samples.push(await sampleIdentity(page, 'T3_2200MS', 2200));

  assert(report.samples.every(sample => sample.status === 'PASS'), `v3.2 identity convergence failed: ${JSON.stringify(report.samples.filter(sample => sample.status === 'FAIL'))}`);
  assert(report.console_errors.length === 0, `Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.page_errors.length === 0, `Page errors: ${JSON.stringify(report.page_errors)}`);
  assert(report.http_errors.length === 0, `HTTP errors: ${JSON.stringify(report.http_errors)}`);
  assert(report.non_read_requests.length === 0, `Non-read requests: ${JSON.stringify(report.non_read_requests)}`);

  report.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  report.status = 'FAIL';
  report.error = String(error?.stack || error?.message || error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  const outPath = path.join(artifactDir, `${browserName}-identity-singularity.json`);
  await fs.writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    schema: report.schema,
    status: report.status,
    browser: browserName,
    source_head: sourceHead,
    route,
    samples: report.samples.map(sample => ({ label: sample.label, status: sample.status, failures: sample.failures })),
    receipt: outPath,
    authority: report.authority
  }, null, 2));
}

if (terminalError) throw terminalError;
