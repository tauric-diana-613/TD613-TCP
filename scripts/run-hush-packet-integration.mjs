import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const HUSH_PHASE12_RECEIPT_SCHEMA = 'td613.hush.phase12.integration-gate-receipt/v1';
export const HUSH_PHASE12_MANIFEST_PATH = path.join('scripts', 'hush-packet-integration-suite.txt');
export const HUSH_PHASE12_REQUIRED_PHASES = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

const REQUIRED_PACKAGE_SCRIPTS = Object.freeze([
  'test:hush:outgoing-contract',
  'test:hush:provider-log',
  'test:hush:contract-log-pair',
  'test:hush:stylometry-audit',
  'test:hush:phase5',
  'test:hush:phase6',
  'test:hush:phase7',
  'test:hush:phase8',
  'test:hush:phase9',
  'test:hush:phase10',
  'test:hush:phase11',
  'test:hush:phase12',
  'test:hush:packets',
  'test:hush:packets:check'
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function readHushPhase12Manifest(manifestPath = HUSH_PHASE12_MANIFEST_PATH) {
  const rows = fs.readFileSync(manifestPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim());

  const tests = [];
  const phaseComments = [];
  for (const row of rows) {
    if (!row) continue;
    if (row.startsWith('#')) {
      const match = row.match(/^#\s*Phase\s+(\d+)/i);
      if (match) phaseComments.push(Number(match[1]));
      continue;
    }
    tests.push(row);
  }
  return Object.freeze({ tests: Object.freeze(tests), phase_comments: Object.freeze(phaseComments) });
}

export function validateHushPhase12Manifest(options = {}) {
  const manifestPath = options.manifestPath || HUSH_PHASE12_MANIFEST_PATH;
  const { tests, phase_comments } = readHushPhase12Manifest(manifestPath);
  const errors = [];
  const seen = new Set();

  if (tests.length === 0) errors.push('packet integration manifest is empty');

  for (const testFile of tests) {
    if (seen.has(testFile)) errors.push(`duplicate test in packet integration manifest: ${testFile}`);
    seen.add(testFile);
    if (!fs.existsSync(path.join('tests', testFile))) errors.push(`packet integration manifest test missing: ${testFile}`);
  }

  for (let index = 1; index < phase_comments.length; index += 1) {
    if (phase_comments[index] < phase_comments[index - 1]) errors.push('packet integration manifest phase order is not monotonic');
  }

  const phaseSet = new Set(phase_comments);
  for (const requiredPhase of HUSH_PHASE12_REQUIRED_PHASES) {
    if (!phaseSet.has(requiredPhase)) errors.push(`packet integration manifest missing Phase ${requiredPhase}`);
  }
  for (const phase of phaseSet) {
    if (!HUSH_PHASE12_REQUIRED_PHASES.includes(phase)) errors.push(`packet integration manifest includes out-of-scope Phase ${phase}`);
  }

  const packageJson = readJson('package.json');
  for (const scriptName of REQUIRED_PACKAGE_SCRIPTS) {
    if (!packageJson.scripts?.[scriptName]) errors.push(`package script missing: ${scriptName}`);
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    test_count: tests.length,
    phases: Object.freeze([...new Set(phase_comments)])
  });
}

export function buildHushPhase12Receipt(status, extra = {}) {
  return Object.freeze({
    schema: HUSH_PHASE12_RECEIPT_SCHEMA,
    created_at: extra.created_at || new Date().toISOString(),
    gate: 'hush-packet-integration',
    status,
    manifest_path: extra.manifest_path || HUSH_PHASE12_MANIFEST_PATH,
    phase_count: extra.phase_count ?? 12,
    test_count: extra.test_count ?? 0,
    live_provider_required: false,
    runtime_deploy_required: false,
    public_export_permitted: false,
    sealed_status_created: false,
    claim_limits: Object.freeze([
      'identity not proven',
      'authorship not proven',
      'release approval not granted',
      'Safe Harbor eligibility not granted by this gate',
      'Aperture approval not granted by this gate',
      'EO-RFD firmware proof not granted by this gate',
      'provider compliance proof not granted beyond local fixture evidence'
    ]),
    ...(extra.failed_test ? { failed_test: extra.failed_test } : {}),
    ...(extra.failure_family ? { failure_family: extra.failure_family } : {})
  });
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const manifest = readHushPhase12Manifest();
  const validation = validateHushPhase12Manifest();

  if (!validation.ok) {
    for (const error of validation.errors) console.error(error);
    console.log(JSON.stringify(buildHushPhase12Receipt('fail', {
      test_count: manifest.tests.length,
      failure_family: 'manifest-integrity'
    }), null, 2));
    process.exit(1);
  }

  if (checkOnly) {
    console.log(JSON.stringify(buildHushPhase12Receipt('pass', {
      test_count: manifest.tests.length,
      phase_count: validation.phases.length
    }), null, 2));
    process.exit(0);
  }

  for (const testFile of manifest.tests) {
    try {
      execFileSync(process.execPath, [path.join('tests', testFile)], { stdio: 'inherit' });
    } catch (error) {
      console.log(JSON.stringify(buildHushPhase12Receipt('fail', {
        test_count: manifest.tests.length,
        phase_count: validation.phases.length,
        failed_test: testFile,
        failure_family: 'subtest-failure'
      }), null, 2));
      process.exit(error.status || 1);
    }
  }

  console.log(JSON.stringify(buildHushPhase12Receipt('pass', {
    test_count: manifest.tests.length,
    phase_count: validation.phases.length
  }), null, 2));
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
  main();
}
