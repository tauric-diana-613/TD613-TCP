import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import {
  extractApertureMetadata,
  normalizeApertureForRepo,
} from '../scripts/lib/aperture-sync-lane.mjs';
import {
  APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE,
  remainingWaitMs,
} from '../scripts/lib/aperture-v32-identity-witness-clock.mjs';

const PRODUCT_PATH = 'app/aperture/tool.html';
const NORMALIZER_PATH = 'scripts/lib/aperture-sync-lane.mjs';
const CLOCK_PATH = 'scripts/lib/aperture-v32-identity-witness-clock.mjs';
const artifactDir = 'artifacts/aperture-v32-identity-singularity-candidate';

function gitBlobSha1(text) {
  const body = Buffer.from(text, 'utf8');
  return createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex');
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function gitCommitAvailable(head) {
  try {
    execFileSync('git', ['cat-file', '-e', `${head}^{commit}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function resolveExactHeadTool() {
  const eventName = String(process.env.GITHUB_EVENT_NAME || '');
  const executionSha = process.env.GITHUB_SHA || null;
  if (eventName !== 'pull_request') {
    return {
      text: fs.readFileSync(PRODUCT_PATH, 'utf8'),
      repositoryHead: process.env.TD613_EXACT_HEAD || executionSha || 'LOCAL_UNBOUND',
      headSource: process.env.TD613_EXACT_HEAD ? 'TD613_EXACT_HEAD' : executionSha ? 'GITHUB_SHA' : 'LOCAL_WORKSPACE',
      executionSha,
      exactHeadFetchPerformed: false,
    };
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  assert.ok(eventPath, 'Exact-head Aperture identity review requires GITHUB_EVENT_PATH on pull_request runs.');
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const repositoryHead = String(event?.pull_request?.head?.sha || '').toLowerCase();
  assert.match(repositoryHead, /^[a-f0-9]{40}$/, 'Exact-head Aperture identity review requires pull_request.head.sha.');

  let exactHeadFetchPerformed = false;
  if (!gitCommitAvailable(repositoryHead)) {
    execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', repositoryHead], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    exactHeadFetchPerformed = true;
  }
  assert.equal(gitCommitAvailable(repositoryHead), true, `Exact PR head ${repositoryHead} must be available after bounded fetch.`);

  for (const filePath of [NORMALIZER_PATH, CLOCK_PATH]) {
    const exactBlob = execFileSync('git', ['rev-parse', `${repositoryHead}:${filePath}`], { encoding: 'utf8' }).trim();
    const workspaceBlob = execFileSync('git', ['hash-object', filePath], { encoding: 'utf8' }).trim();
    assert.equal(
      workspaceBlob,
      exactBlob,
      `Executed ${filePath} bytes must equal the exact PR-head blob.`,
    );
  }

  return {
    text: execFileSync('git', ['show', `${repositoryHead}:${PRODUCT_PATH}`], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    }),
    repositoryHead,
    headSource: 'GITHUB_EVENT.pull_request.head.sha',
    executionSha,
    exactHeadFetchPerformed,
  };
}

const exact = resolveExactHeadTool();
const tool = exact.text;
const probe = fs.readFileSync('scripts/aperture-v32-identity-singularity-browser-witness.mjs', 'utf8');
const wrapper = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const prereg = fs.readFileSync('docs/aperture/v3.2-alpha/APERTURE_V32_IDENTITY_SINGULARITY_WITNESS_V0_1_PREREGISTRATION_20260907.md', 'utf8');

assert.match(tool, /<meta(?=[^>]*\bname=["']aperture-version["'])(?=[^>]*\bcontent=["']v3\.2-alpha["'])[^>]*>/i);
assert.match(tool, /<body(?=[^>]*\bdata-aperture-version=["']v3\.2-alpha["'])[^>]*>/i);
assert.match(tool, /id=["']mFirmwareVer["'][^>]*>\s*v3\.2-alpha\s*</i);
assert.match(tool, /apertureV31AdmissibilityTomographyContract/);
assert.match(tool, /td613\.aperture\.v31-admissibility-tomography-contract\/v0\.1/);

// Classify stale current-identity writes. Guard/read comparisons against historical
// labels are not writers and therefore do not constitute current-identity drift.
const checks = [
  ['STALE_CURRENT_TITLE_V31', /(?:document\.title\s*=|\.textContent\s*=)\s*["']TD613 Aperture v3\.1-alpha["']/],
  ['STALE_BODY_VERSION_V31_V30', /document\.body(?:\?\.)?\.setAttribute\(\s*["']data-aperture-version["']\s*,\s*["']v3\.[01]-alpha["']\s*\)/],
  ['STALE_ROOT_VERSION_V31_V30', /document\.documentElement(?:\?\.)?(?:\.setAttribute\(\s*["']data-aperture-version["']\s*,\s*["']v3\.[01]-alpha["']\s*\)|\.dataset\.apertureVersion\s*=\s*["']v3\.[01]-alpha["'])/],
  ['STALE_VISIBLE_FIRMWARE_V31_V30', /(?:setText\(\s*["']mFirmwareVer["']\s*,\s*["']v3\.[01]-alpha["']|(?:mFirmwareVer|firmwareEl|firmwareVer|fw)\.textContent\s*=\s*["']v3\.[01]-alpha["'])/],
  ['STALE_VISIBLE_SCHEMA_V31_V30', /(?:setText\(\s*["']schemaVersionReadout["']\s*,\s*["']td613-aperture\/v3\.[01]-alpha["']|(?:schemaEl|schemaRead)\.textContent\s*=\s*["']td613-aperture\/v3\.[01]-alpha["'])/],
  ['STALE_META_VERSION_V31_V30', /(?:setMeta|ensureMeta)\(\s*["']aperture-version["']\s*,\s*["']v3\.[01]-alpha["']\s*\)/],
  ['STALE_WINDOW_APERTURE_VERSION_V31_V30', /window\.APERTURE_VERSION\s*=\s*["']v3\.[01]-alpha["']/],
  ['STALE_WINDOW_APERTURE_SCHEMA_V31_V30', /window\.APERTURE_SCHEMA_VERSION\s*=\s*["']td613-aperture\/v3\.[01]-alpha["']/],
  ['STALE_FIRMWARE_CURRENT_VERSION_V31_V30', /window\.FIRMWARE\.VERSION\s*=\s*["']v3\.[01]-alpha["']/],
  ['STALE_FIRMWARE_CURRENT_SCHEMA_V31_V30', /window\.FIRMWARE\.SCHEMA_VERSION\s*=\s*["']td613-aperture\/v3\.[01]-alpha["']/],
];

function hostileClasses(text) {
  return checks.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
}

const sourceHostile = hostileClasses(tool);
const metadata = extractApertureMetadata(tool, PRODUCT_PATH);
const normalizedCandidate = normalizeApertureForRepo(tool, metadata);
const candidateHostile = hostileClasses(normalizedCandidate);

assert.match(normalizedCandidate, /apertureV31AdmissibilityTomographyContract/,
  'Identity normalization must preserve the v3.1 tomography lineage contract.');
assert.match(normalizedCandidate, /td613\.aperture\.v31-admissibility-tomography-contract\/v0\.1/,
  'Identity normalization must preserve historical v3.1 contract schema text.');
assert.ok(normalizedCandidate.includes('v3.0-alpha'),
  'Identity normalization must preserve historical v3.0 lineage/receipt text outside current-identity writers.');

fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(`${artifactDir}/tool.normalized.html`, normalizedCandidate, 'utf8');
fs.writeFileSync(`${artifactDir}/candidate-receipt.json`, `${JSON.stringify({
  schema: 'td613.aperture.v32-identity-singularity-repair-candidate/v0.1',
  status: candidateHostile.length ? 'HELD' : 'CANDIDATE',
  review_evidence_class: 'MACHINE_GENERATED_APERTURE_REPAIR_CANDIDATE',
  source_repository_head: exact.repositoryHead,
  source_head_source: exact.headSource,
  execution_repository_sha: exact.executionSha,
  exact_head_fetch_performed: exact.exactHeadFetchPerformed,
  source_tool_git_blob_sha1: gitBlobSha1(tool),
  source_tool_sha256: sha256(tool),
  candidate_tool_git_blob_sha1: gitBlobSha1(normalizedCandidate),
  candidate_tool_sha256: sha256(normalizedCandidate),
  source_hostile_classes: sourceHostile,
  candidate_hostile_classes: candidateHostile,
  historical_v31_contract_preserved: normalizedCandidate.includes('td613.aperture.v31-admissibility-tomography-contract/v0.1'),
  historical_v30_lineage_preserved: normalizedCandidate.includes('v3.0-alpha'),
  canonical_product_mutated: false,
  counts_as_human_evidence: false,
  production_observation: false,
  release_authority: false,
  merge_authority: false,
  vercel_authority: false,
  provider_call_performed: false,
  human_closure_required: true,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0,
}, null, 2)}\n`, 'utf8');

assert.deepEqual(
  candidateHostile,
  [],
  `Normalized Aperture repair candidate still contains stale current-identity writers: ${candidateHostile.join(', ')}`,
);

assert.deepEqual(sourceHostile, [], `Current v3.2 identity writer hostility detected: ${sourceHostile.join(', ')}`);

assert.deepEqual(
  APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE.map(({ label, targetElapsedMs }) => [label, targetElapsedMs]),
  [
    ['T0_DOM_READY', 0],
    ['T1_350MS', 350],
    ['T2_1000MS', 1000],
    ['T3_2200MS', 2200],
  ],
  'Executable identity schedule must preserve the preregistered T0/T1/T2/T3 absolute deadlines.',
);
assert.equal(remainingWaitMs(350, 510), 0,
  'Measurement overhead may not compound the 350 ms deadline.');
assert.equal(remainingWaitMs(1000, 512), 488,
  'T2 must wait only the remaining interval to 1000 ms.');
assert.equal(remainingWaitMs(2200, 1517), 683,
  'T3 must wait only the remaining interval to 2200 ms.');

for (const token of [
  'document_title',
  'html_data_aperture_version',
  'body_data_aperture_version',
  'meta_aperture_version',
  'visible_firmware_readout',
  'visible_schema_readout',
  'window_APERTURE_VERSION',
  'window_APERTURE_SCHEMA_VERSION',
  'window_FIRMWARE_VERSION',
  'window_FIRMWARE_SCHEMA_VERSION',
  'GITHUB_EVENT_PATH',
  'GITHUB_EVENT.pull_request.head.sha',
  'execution_repository_sha',
  'exact_head_fetch_performed',
  'reviewed_candidate',
  'served_candidate',
  'Browser-served Aperture bytes must equal the exact PR-head Git blob.',
  'ABSOLUTE_POST_DOMCONTENTLOADED_DEADLINES',
  'waitUntilAbsoluteDeadline',
  'target_elapsed_ms',
  'actual_elapsed_ms',
  'drift_ms',
  'All four preregistered identity samples are mandatory.',
  'counts_as_human_evidence: false',
  'production_observation: false',
  'release_authority: false',
  'merge_authority: false',
  'vercel_authority: false',
  'provider_call_performed: false',
  'human_closure_required: true',
  'exogenous_witness_credit: 0',
  'golden_egg_credit: 0',
]) assert.ok(probe.includes(token), `Identity witness omitted ${token}`);

assert.match(probe, /event\?\.pull_request\?\.head\?\.sha/,
  'Browser witness must resolve exact pull-request head from the GitHub event payload.');
assert.match(probe, /workspaceProductBlob === exactProductBlob/,
  'Browser witness must bind workspace product bytes to the exact PR-head product blob.');
assert.match(probe, /servedGitBlob === custody\.exactProductBlob/,
  'Browser witness must bind browser-served product bytes to the exact PR-head product blob.');
assert.match(probe, /CLOCK_PATH/,
  'Browser witness must bind its executable absolute-clock module to exact-head custody.');
assert.match(probe, /\/aperture\/tool\.html/);
assert.match(probe, /chromium, firefox, webkit/);
assert.match(probe, /waitUntilAbsoluteDeadline\(page, targetElapsedMs\)/,
  'Browser witness must schedule samples against absolute post-DOMContentLoaded deadlines.');
assert.doesNotMatch(probe, /await page\.waitForTimeout\((?:350|650|1200)\)/,
  'Browser witness must not compound measurement overhead through the retired fixed-delay sequence.');
assert.doesNotMatch(probe, /page\.(?:click|fill|type|press|selectOption)\(/);
assert.doesNotMatch(probe, /fetch\([^)]*method\s*:\s*["'](?:POST|PUT|PATCH|DELETE)/i);

assert.match(wrapper, /const apertureIdentityWitnessPath = path\.join\(scriptsDir, ['"]aperture-v32-identity-singularity-browser-witness\.mjs['"]\)/,
  'Three-engine transition wrapper must resolve the delayed Aperture identity witness explicitly.');
assert.match(wrapper, /execFileSync\(process\.execPath, \[apertureIdentityWitnessPath\], \{[\s\S]*env: process\.env,[\s\S]*stdio: ['"]inherit['"][\s\S]*\}\)/,
  'Aperture identity witness must execute in a fresh Node process while preserving the exact engine and custody environment.');
assert.doesNotMatch(wrapper, /await import\(['"]\.\/aperture-v32-identity-singularity-browser-witness\.mjs['"]\)/,
  'Aperture identity witness must not regress to the shared in-process browser-observer chain.');

assert.match(prereg, /ATTACHMENT_DIVERGENCE != REPOSITORY_REGRESSION/);
assert.match(prereg, /DOM_READY_GREEN != DELAYED_IDENTITY_CONVERGENCE/);
assert.match(prereg, /Chromium \+ Firefox \+ WebKit delayed identity witness/);
assert.match(prereg, /exogenous_witness_credit = 0/);
assert.match(prereg, /golden_egg_credit = 0/);

console.log('aperture-v32-identity-singularity.test.mjs passed');