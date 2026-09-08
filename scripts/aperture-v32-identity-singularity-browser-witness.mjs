import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium, firefox, webkit } from 'playwright';
import {
  APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE,
  remainingWaitMs,
  sampleTiming,
} from './lib/aperture-v32-identity-witness-clock.mjs';

const PRODUCT_PATH = 'app/aperture/tool.html';
const WITNESS_PATH = 'scripts/aperture-v32-identity-singularity-browser-witness.mjs';
const CLOCK_PATH = 'scripts/lib/aperture-v32-identity-witness-clock.mjs';
const WRAPPER_PATH = 'scripts/ash-a15-transition-trace-browser-probe.mjs';
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium').trim();
const engine = { chromium, firefox, webkit }[browserName];
const route = `${base}/aperture/tool.html`;
const parentArtifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/aperture-v32-identity-${browserName}`);
const artifactDir = path.join(parentArtifactDir, 'aperture-v32-identity-singularity');
const expectedVersion = 'v3.2-alpha';
const expectedSchema = 'td613-aperture/v3.2-alpha';
const expectedTitle = 'TD613 Aperture v3.2-alpha';

function assert(value, message) {
  if (!value) throw new Error(message);
}

function gitBlobSha1(value) {
  const body = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function gitCommitAvailable(head) {
  try {
    execFileSync('git', ['cat-file', '-e', `${head}^{commit}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function exactBlobAt(head, filePath) {
  return execFileSync('git', ['rev-parse', `${head}:${filePath}`], { encoding: 'utf8' }).trim();
}

function workspaceBlob(filePath) {
  return execFileSync('git', ['hash-object', filePath], { encoding: 'utf8' }).trim();
}

function resolveCustody() {
  const eventName = String(process.env.GITHUB_EVENT_NAME || '');
  const executionSha = String(process.env.GITHUB_SHA || '').trim() || null;
  if (eventName !== 'pull_request') {
    const repositoryHead = String(process.env.TD613_SOURCE_PACKET_COMMIT || process.env.GITHUB_HEAD_SHA || executionSha || '').trim() || null;
    return {
      repositoryHead,
      headSource: process.env.TD613_SOURCE_PACKET_COMMIT
        ? 'TD613_SOURCE_PACKET_COMMIT'
        : process.env.GITHUB_HEAD_SHA
          ? 'GITHUB_HEAD_SHA'
          : executionSha
            ? 'GITHUB_SHA'
            : 'LOCAL_UNBOUND',
      executionSha,
      exactHeadFetchPerformed: false,
      exactProductBytes: null,
      exactProductBlob: null,
      workspaceProductBlob: workspaceBlob(PRODUCT_PATH),
    };
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  assert(eventPath, 'Exact-head Aperture browser witness requires GITHUB_EVENT_PATH on pull_request runs.');
  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const repositoryHead = String(event?.pull_request?.head?.sha || '').toLowerCase();
  assert(/^[a-f0-9]{40}$/.test(repositoryHead), 'Exact-head Aperture browser witness requires pull_request.head.sha.');

  let exactHeadFetchPerformed = false;
  if (!gitCommitAvailable(repositoryHead)) {
    execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', repositoryHead], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    exactHeadFetchPerformed = true;
  }
  assert(gitCommitAvailable(repositoryHead), `Exact PR head ${repositoryHead} must be available after bounded fetch.`);

  for (const filePath of [WITNESS_PATH, CLOCK_PATH, WRAPPER_PATH]) {
    const exact = exactBlobAt(repositoryHead, filePath);
    const workspace = workspaceBlob(filePath);
    assert(workspace === exact, `Executed ${filePath} bytes must equal exact PR-head bytes.`);
  }

  const exactProductBlob = exactBlobAt(repositoryHead, PRODUCT_PATH);
  const workspaceProductBlob = workspaceBlob(PRODUCT_PATH);
  const exactProductBytes = execFileSync('git', ['show', `${repositoryHead}:${PRODUCT_PATH}`], {
    encoding: null,
    maxBuffer: 16 * 1024 * 1024,
  });
  assert(gitBlobSha1(exactProductBytes) === exactProductBlob, 'Exact-head Aperture product bytes must hash to their Git blob.');
  assert(workspaceProductBlob === exactProductBlob, 'Workspace Aperture product bytes must equal exact PR-head product bytes before browser observation.');

  return {
    repositoryHead,
    headSource: 'GITHUB_EVENT.pull_request.head.sha',
    executionSha,
    exactHeadFetchPerformed,
    exactProductBytes,
    exactProductBlob,
    workspaceProductBlob,
  };
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

async function sampleIdentity(page, label, targetElapsedMs, actualElapsedMs) {
  const timing = sampleTiming(targetElapsedMs, actualElapsedMs);
  const sample = await page.evaluate(({ label: sampleLabel, timing: observedTiming }) => {
    const firmware = document.getElementById('mFirmwareVer')
      || document.getElementById('firmwareSpineVersion')
      || document.querySelector('[data-firmware-spine-version]');
    const schema = document.getElementById('schemaVersionReadout')
      || document.getElementById('mSchemaVer')
      || document.getElementById('schemaVersion');
    return {
      label: sampleLabel,
      elapsed_ms: observedTiming.actual_elapsed_ms,
      target_elapsed_ms: observedTiming.target_elapsed_ms,
      actual_elapsed_ms: observedTiming.actual_elapsed_ms,
      drift_ms: observedTiming.drift_ms,
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
  }, { label, timing });
  sample.failures = identityFailures(sample);
  sample.status = sample.failures.length === 0 ? 'PASS' : 'FAIL';
  return sample;
}

assert(engine, `Unsupported browser engine: ${browserName}`);
const custody = resolveCustody();
await fs.mkdir(artifactDir, { recursive: true });

const routeResponse = await fetch(route);
const servedBytes = Buffer.from(await routeResponse.arrayBuffer());
const servedGitBlob = gitBlobSha1(servedBytes);
const servedSha256 = sha256(servedBytes);
assert(routeResponse.status === 200, `Aperture route custody fetch returned HTTP ${routeResponse.status}.`);
if (custody.exactProductBytes) {
  assert(servedGitBlob === custody.exactProductBlob, 'Browser-served Aperture bytes must equal the exact PR-head Git blob.');
  assert(servedSha256 === sha256(custody.exactProductBytes), 'Browser-served Aperture SHA-256 must equal exact PR-head bytes.');
}

const outPath = path.join(artifactDir, `${browserName}-identity-singularity.json`);
const lifecyclePath = path.join(artifactDir, `${browserName}-lifecycle-events.jsonl`);
const report = {
  schema: 'td613.aperture.v32-identity-singularity-browser-evidence/v0.4-absolute-deadline-lifecycle',
  status: 'RUNNING',
  browser: browserName,
  source_head: custody.repositoryHead,
  source_head_source: custody.headSource,
  execution_repository_sha: custody.executionSha,
  exact_head_fetch_performed: custody.exactHeadFetchPerformed,
  route,
  reviewed_candidate: {
    path: PRODUCT_PATH,
    git_blob_sha1: custody.exactProductBlob || custody.workspaceProductBlob,
    sha256: custody.exactProductBytes ? sha256(custody.exactProductBytes) : null,
  },
  served_candidate: {
    status: routeResponse.status,
    git_blob_sha1: servedGitBlob,
    sha256: servedSha256,
  },
  exact_current_identity: {
    version: expectedVersion,
    schema: expectedSchema,
    title: expectedTitle
  },
  scheduling: {
    strategy: 'ABSOLUTE_POST_DOMCONTENTLOADED_DEADLINES',
    targets_ms: APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE.map(({ targetElapsedMs }) => targetElapsedMs),
    measurement_overhead_compounds_deadlines: false,
  },
  samples: [],
  console_errors: [],
  page_errors: [],
  http_errors: [],
  external_requests: [],
  non_read_requests: [],
  lifecycle: {
    observation_epoch_ms: null,
    page_closed: false,
    page_crashed: false,
    context_closed: false,
    browser_disconnected: false,
    events: [],
    checkpoints: [],
    sidecar: lifecyclePath,
  },
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

let observationMonotonicEpoch = null;

function persistReportSync() {
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function elapsedFromObservationEpoch() {
  return observationMonotonicEpoch === null
    ? null
    : performance.now() - observationMonotonicEpoch;
}

function roundedElapsed() {
  const elapsed = elapsedFromObservationEpoch();
  return elapsed === null ? null : Number(elapsed.toFixed(3));
}

function recordLifecycle(type, details = {}) {
  const event = {
    type,
    observed_at: new Date().toISOString(),
    elapsed_ms: roundedElapsed(),
    ...details,
  };
  report.lifecycle.events.push(event);
  appendFileSync(lifecyclePath, `${JSON.stringify(event)}\n`, 'utf8');
  persistReportSync();
}

function recordCheckpoint(label, page, browser, contextClosed, targetElapsedMs = null) {
  const actualElapsedMs = roundedElapsed();
  const checkpoint = {
    label,
    observed_at: new Date().toISOString(),
    elapsed_ms: actualElapsedMs,
    target_elapsed_ms: targetElapsedMs,
    drift_ms: targetElapsedMs === null || actualElapsedMs === null ? null : Number((actualElapsedMs - targetElapsedMs).toFixed(3)),
    page_closed: page.isClosed(),
    context_closed: contextClosed,
    browser_connected: browser.isConnected(),
  };
  report.lifecycle.checkpoints.push(checkpoint);
  persistReportSync();
  return checkpoint;
}

async function waitUntilAbsoluteDeadline(page, targetElapsedMs) {
  let observedElapsedMs = elapsedFromObservationEpoch();
  assert(observedElapsedMs !== null, 'Absolute identity deadline requires a DOMContentLoaded observation epoch.');
  let remainingMs = remainingWaitMs(targetElapsedMs, observedElapsedMs);
  if (remainingMs > 0) {
    await page.waitForTimeout(Math.ceil(remainingMs));
    observedElapsedMs = elapsedFromObservationEpoch();
    remainingMs = remainingWaitMs(targetElapsedMs, observedElapsedMs);
    if (remainingMs > 0) await page.waitForTimeout(Math.ceil(remainingMs));
  }
  return elapsedFromObservationEpoch();
}

let terminalError = null;
let browser = null;
try {
  browser = await engine.launch({ headless: true });
  browser.on('disconnected', () => {
    report.lifecycle.browser_disconnected = true;
    recordLifecycle('BROWSER_DISCONNECTED');
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  let contextClosed = false;
  context.on('close', () => {
    contextClosed = true;
    report.lifecycle.context_closed = true;
    recordLifecycle('CONTEXT_CLOSED');
  });

  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  page.on('close', () => {
    report.lifecycle.page_closed = true;
    recordLifecycle('PAGE_CLOSED', { url: page.url() });
  });
  page.on('crash', () => {
    report.lifecycle.page_crashed = true;
    recordLifecycle('PAGE_CRASHED', { url: page.url() });
  });
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) recordLifecycle('MAIN_FRAME_NAVIGATED', { url: frame.url() });
  });
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

  recordLifecycle('BROWSER_PAGE_CREATED', { url: page.url() });
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  report.lifecycle.observation_epoch_ms = Date.now();
  observationMonotonicEpoch = performance.now();
  recordLifecycle('DOM_CONTENT_LOADED', { url: page.url() });

  for (const { label, targetElapsedMs } of APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE) {
    const actualBeforeSample = await waitUntilAbsoluteDeadline(page, targetElapsedMs);
    recordCheckpoint(`BEFORE_${label}`, page, browser, contextClosed, targetElapsedMs);
    assert(!page.isClosed(), `Aperture page closed before ${label}.`);
    assert(!contextClosed, `Aperture context closed before ${label}.`);
    assert(browser.isConnected(), `Aperture browser disconnected before ${label}.`);
    assert(actualBeforeSample >= targetElapsedMs, `${label} began before its preregistered absolute deadline.`);
    report.samples.push(await sampleIdentity(page, label, targetElapsedMs, Number(actualBeforeSample.toFixed(3))));
    recordCheckpoint(`AFTER_${label}`, page, browser, contextClosed, targetElapsedMs);
  }

  assert(report.samples.length === APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE.length, 'All four preregistered identity samples are mandatory.');
  assert(report.samples.every(sample => sample.actual_elapsed_ms >= sample.target_elapsed_ms), 'Identity samples must occur at or after their absolute post-DOMContentLoaded deadlines.');
  assert(report.samples.every(sample => sample.status === 'PASS'), `v3.2 identity convergence failed: ${JSON.stringify(report.samples.filter(sample => sample.status === 'FAIL'))}`);
  assert(!page.isClosed(), 'Aperture page closed before bounded identity observation completed.');
  assert(!contextClosed, 'Aperture context closed before bounded identity observation completed.');
  assert(browser.isConnected(), 'Aperture browser disconnected before bounded identity observation completed.');
  assert(report.console_errors.length === 0, `Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.page_errors.length === 0, `Page errors: ${JSON.stringify(report.page_errors)}`);
  assert(report.http_errors.length === 0, `HTTP errors: ${JSON.stringify(report.http_errors)}`);
  assert(report.non_read_requests.length === 0, `Non-read requests: ${JSON.stringify(report.non_read_requests)}`);

  report.status = 'PASS';
  persistReportSync();
  recordLifecycle('BOUNDED_IDENTITY_OBSERVATION_COMPLETE', { final_target_elapsed_ms: 2200 });
  await context.close();
} catch (error) {
  terminalError = error;
  report.status = 'FAIL';
  report.error = String(error?.stack || error?.message || error);
  recordLifecycle('TERMINAL_ERROR', { error: report.error });
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  persistReportSync();
  console.log(JSON.stringify({
    schema: report.schema,
    status: report.status,
    browser: browserName,
    source_head: report.source_head,
    source_head_source: report.source_head_source,
    execution_repository_sha: report.execution_repository_sha,
    exact_head_fetch_performed: report.exact_head_fetch_performed,
    route,
    reviewed_candidate: report.reviewed_candidate,
    served_candidate: report.served_candidate,
    scheduling: report.scheduling,
    samples: report.samples.map(sample => ({
      label: sample.label,
      target_elapsed_ms: sample.target_elapsed_ms,
      actual_elapsed_ms: sample.actual_elapsed_ms,
      drift_ms: sample.drift_ms,
      status: sample.status,
      failures: sample.failures,
    })),
    lifecycle: report.lifecycle,
    receipt: outPath,
    authority: report.authority
  }, null, 2));
}

if (terminalError) throw terminalError;
