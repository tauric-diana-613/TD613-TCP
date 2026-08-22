import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  assessObservationClosure,
  buildObservation,
  sealObservationPayload,
  stableCanonicalJson,
  summarizeCustodyCopies,
  verifyObservationObject
} from '../scripts/pedagogue-observation-custody.mjs';

const scienceHead = 'a'.repeat(40);
const fixed = {
  scienceHead,
  workflowRunId: '613',
  workflowRunAttempt: '1',
  workflowName: 'TD613 Consolidated Validation',
  jobName: 'contracts',
  observedAtRunner: '2026-08-22T06:13:00.000Z'
};

function validObservation(overrides = {}) {
  return buildObservation({ ...fixed, ...overrides });
}

function resealAfter(observation, mutate) {
  const payload = structuredClone(observation);
  delete payload.custody;
  mutate(payload);
  return sealObservationPayload(payload);
}

test('OC01 console-only success fails when no structured object survives', () => {
  assert.deepEqual(verifyObservationObject(null), {
    ok: false,
    disposition: 'FAIL_OBSERVATION_NOT_DURABLY_CUSTODIED'
  });
});

test('OC02 verdict-only artifact fails replayability', () => {
  const artifact = resealAfter(validObservation(), (payload) => { delete payload.raw; });
  assert.equal(verifyObservationObject(artifact).disposition, 'FAIL_VERDICT_ONLY_ARTIFACT_NOT_REPLAYABLE');
});

test('OC03 detached artifact abstains until deterministic run binding exists', () => {
  const artifact = validObservation({ workflowRunId: null });
  const detached = verifyObservationObject(artifact);
  assert.equal(detached.disposition, 'ABSTAIN_ARTIFACT_EXECUTION_BINDING_INCOMPLETE');
  const rebound = verifyObservationObject(artifact, {
    postRunBinding: { science_head: scienceHead, workflow_run_id: '613' }
  });
  assert.equal(rebound.ok, true);
});

test('OC04 replacement-observation laundering is rejected', () => {
  const artifact = resealAfter(validObservation(), (payload) => {
    payload.second_observation_performed = true;
    payload.external_request_count = 1;
  });
  assert.equal(verifyObservationObject(artifact).disposition, 'REJECT_REPLACEMENT_OBSERVATION_AS_ORIGINAL_WITNESS');
});

test('OC05 green-badge laundering cannot replace a missing scientific artifact', () => {
  const result = assessObservationClosure({ workflowSuccess: true, artifact: null });
  assert.equal(result.disposition, 'INFRASTRUCTURE_SUCCESS_SCIENTIFIC_WITNESS_MISSING');
  assert.equal(result.underlying_disposition, 'FAIL_OBSERVATION_NOT_DURABLY_CUSTODIED');
});

test('OC06 mutation after capture changes custody identity and is rejected', () => {
  const artifact = validObservation();
  const mutated = structuredClone(artifact);
  mutated.raw.observed_token = 'REWRITTEN_AFTER_CAPTURE';
  const result = verifyObservationObject(mutated);
  assert.equal(result.disposition, 'REJECT_MUTABLE_OBSERVATION_CUSTODY');
  assert.notEqual(result.expected_payload_sha256, result.recomputed_payload_sha256);
});

test('OC07 semantic result is invariant to JSON object-key serialization order', () => {
  const artifact = validObservation();
  const reordered = JSON.parse(JSON.stringify({
    custody: artifact.custody,
    raw: artifact.raw,
    schema: artifact.schema,
    instrument: artifact.instrument,
    fixture: artifact.fixture,
    execution: artifact.execution,
    science_head: artifact.science_head,
    runtime_classification: artifact.runtime_classification,
    observed_at_runner: artifact.observed_at_runner,
    claim_ceiling: artifact.claim_ceiling,
    source_status: artifact.source_status,
    authority_class: artifact.authority_class,
    external_request_count: artifact.external_request_count,
    second_observation_performed: artifact.second_observation_performed,
    promotion_authority: artifact.promotion_authority,
    production_authority: artifact.production_authority,
    release_authority: artifact.release_authority
  }));
  const first = verifyObservationObject(artifact);
  const second = verifyObservationObject(reordered);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.runtime_classification, second.runtime_classification);
  assert.equal(first.payload_sha256, second.payload_sha256);
  assert.equal(stableCanonicalJson(artifact), stableCanonicalJson(reordered));
});

test('OC08 duplicate custody copies do not amplify one observation', () => {
  const artifact = validObservation();
  const summary = summarizeCustodyCopies([artifact, structuredClone(artifact)]);
  assert.equal(summary.copy_count, 2);
  assert.equal(summary.unique_observation_count, 1);
  assert.equal(summary.duplicate_custody_copies_create_new_observation, false);
  assert.equal(summary.confidence_aggregation_performed, false);
});

test('OC09 failure-path positive control writes replayable evidence before nonzero exit', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'td613-o1-failure-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const target = join(dir, 'failure-observation.json');
  const script = fileURLToPath(new URL('../scripts/pedagogue-observation-custody.mjs', import.meta.url));
  const proc = spawnSync(process.execPath, [script, 'failure-control', target], {
    encoding: 'utf8',
    env: {
      ...process.env,
      TD613_SCIENCE_HEAD: scienceHead,
      TD613_WORKFLOW_RUN_ID: '613',
      TD613_WORKFLOW_RUN_ATTEMPT: '1',
      TD613_WORKFLOW_NAME: 'TD613 Consolidated Validation',
      TD613_WORKFLOW_JOB: 'contracts'
    }
  });
  assert.equal(proc.status, 17, proc.stderr || proc.stdout);
  const artifact = JSON.parse(await readFile(target, 'utf8'));
  const result = verifyObservationObject(artifact);
  assert.equal(result.ok, true);
  assert.equal(artifact.external_request_count, 0);
  assert.equal(artifact.second_observation_performed, false);
});

test('OC10 success-path control writes the same replayable evidence class', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'td613-o1-success-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const target = join(dir, 'success-observation.json');
  const script = fileURLToPath(new URL('../scripts/pedagogue-observation-custody.mjs', import.meta.url));
  const proc = spawnSync(process.execPath, [script, 'success', target], {
    encoding: 'utf8',
    env: {
      ...process.env,
      TD613_SCIENCE_HEAD: scienceHead,
      TD613_WORKFLOW_RUN_ID: '613',
      TD613_WORKFLOW_RUN_ATTEMPT: '1',
      TD613_WORKFLOW_NAME: 'TD613 Consolidated Validation',
      TD613_WORKFLOW_JOB: 'contracts'
    }
  });
  assert.equal(proc.status, 0, proc.stderr || proc.stdout);
  const artifact = JSON.parse(await readFile(target, 'utf8'));
  const result = assessObservationClosure({ workflowSuccess: true, artifact });
  assert.equal(result.ok, true);
  assert.equal(result.observation_custody_survived, true);
  assert.equal(artifact.external_request_count, 0);
  assert.equal(artifact.second_observation_performed, false);
});
