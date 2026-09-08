import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { extractApertureMetadata } from '../scripts/lib/aperture-sync-lane.mjs';
import {
  APERTURE_V32_T0_REPAIR,
  inspectEorfdT0CurrentFirmwareOwnership,
  repairEorfdT0CurrentFirmwareOwnership,
} from '../scripts/lib/aperture-v32-identity-singularity-t0.mjs';

const PRODUCT_PATH = 'app/aperture/tool.html';
const HELPER_PATH = 'scripts/lib/aperture-v32-identity-singularity-t0.mjs';
const ARTIFACT_DIR = 'artifacts/aperture-v32-identity-singularity-t0-candidate';

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
  assert.ok(eventPath, 'Exact-head T0 identity repair requires GITHUB_EVENT_PATH on pull_request runs.');
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const repositoryHead = String(event?.pull_request?.head?.sha || '').toLowerCase();
  assert.match(repositoryHead, /^[a-f0-9]{40}$/, 'Exact-head T0 identity repair requires pull_request.head.sha.');

  let exactHeadFetchPerformed = false;
  if (!gitCommitAvailable(repositoryHead)) {
    execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', repositoryHead], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
    exactHeadFetchPerformed = true;
  }
  assert.equal(gitCommitAvailable(repositoryHead), true, `Exact PR head ${repositoryHead} must be available after bounded fetch.`);

  const exactHelperBlob = execFileSync('git', ['rev-parse', `${repositoryHead}:${HELPER_PATH}`], { encoding: 'utf8' }).trim();
  const workspaceHelperBlob = execFileSync('git', ['hash-object', HELPER_PATH], { encoding: 'utf8' }).trim();
  assert.equal(workspaceHelperBlob, exactHelperBlob, 'Executed T0 repair helper must equal exact PR-head helper bytes.');

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
const source = exact.text;
const metadata = extractApertureMetadata(source, PRODUCT_PATH);
assert.equal(metadata.version, 'v3.2-alpha', 'T0 repair must bind to current v3.2 identity.');
assert.equal(metadata.schema, 'td613-aperture/v3.2-alpha', 'T0 repair must bind to current v3.2 schema.');

const sourceInspection = inspectEorfdT0CurrentFirmwareOwnership(source);
const candidate = repairEorfdT0CurrentFirmwareOwnership(source, {
  version: metadata.version,
  schema: metadata.schema,
});
const candidateInspection = inspectEorfdT0CurrentFirmwareOwnership(candidate);

assert.match(candidate, /const APERTURE_VERSION\s*=\s*['"]v2\.9\.4-eorfd-deep-static-audit['"]\s*;/,
  'T0 repair must preserve the historical EORFD deep-static-audit version constant.');
assert.match(candidate, /const APERTURE_SCHEMA\s*=\s*['"]td613-aperture\/v3\.0-alpha['"]\s*;/,
  'T0 repair must preserve the historical EORFD schema constant.');
assert.match(candidate, /eorfdDeepStaticAuditVersion:\s*APERTURE_VERSION/,
  'T0 repair must preserve the EORFD lineage receipt binding.');
assert.deepEqual(candidateInspection.hostile_classes, [],
  `T0 repair candidate still permits historical EORFD constants to own current firmware identity: ${candidateInspection.hostile_classes.join(', ')}`);

const sourceLines = source.split('\n');
const candidateLines = candidate.split('\n');
assert.equal(candidateLines.length, sourceLines.length, 'Bounded T0 repair must preserve line count.');
const changedLines = [];
for (let index = 0; index < sourceLines.length; index += 1) {
  if (sourceLines[index] !== candidateLines[index]) changedLines.push(index + 1);
}
assert.equal(changedLines.length, 2, `Bounded T0 repair must change exactly two lines; changed ${changedLines.length}.`);

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.writeFileSync(`${ARTIFACT_DIR}/tool.normalized.html`, candidate, 'utf8');
fs.writeFileSync(`${ARTIFACT_DIR}/candidate-receipt.json`, `${JSON.stringify({
  schema: 'td613.aperture.v32-identity-singularity-t0-repair-candidate/v0.1',
  status: candidateInspection.hostile_classes.length ? 'HELD' : 'CANDIDATE',
  review_evidence_class: 'MACHINE_GENERATED_APERTURE_T0_REPAIR_CANDIDATE',
  predecessor_ready_run: 2843,
  predecessor_ready_red: 'T0_DOM_READY_WINDOW_FIRMWARE_HISTORICAL_OWNERSHIP',
  source_repository_head: exact.repositoryHead,
  source_head_source: exact.headSource,
  execution_repository_sha: exact.executionSha,
  exact_head_fetch_performed: exact.exactHeadFetchPerformed,
  source_tool_git_blob_sha1: gitBlobSha1(source),
  source_tool_sha256: sha256(source),
  candidate_tool_git_blob_sha1: gitBlobSha1(candidate),
  candidate_tool_sha256: sha256(candidate),
  source_hostile_classes: sourceInspection.hostile_classes,
  candidate_hostile_classes: candidateInspection.hostile_classes,
  changed_line_count: changedLines.length,
  historical_eorfd_version_preserved: candidate.includes("const APERTURE_VERSION = 'v2.9.4-eorfd-deep-static-audit';"),
  historical_eorfd_schema_preserved: candidate.includes("const APERTURE_SCHEMA = 'td613-aperture/v3.0-alpha';"),
  current_firmware_target_version: metadata.version,
  current_firmware_target_schema: metadata.schema,
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
  repair_contract: APERTURE_V32_T0_REPAIR,
}, null, 2)}\n`, 'utf8');

assert.deepEqual(
  sourceInspection.hostile_classes,
  [],
  `Current product still permits historical EORFD constants to own window.FIRMWARE at T0: ${sourceInspection.hostile_classes.join(', ')}`,
);

console.log('aperture-v32-identity-singularity-t0.test.mjs passed');
