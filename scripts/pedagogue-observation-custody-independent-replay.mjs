import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SCHEMA = 'td613.pedagogue.observation-custody/v0.1';
const CANONICALIZATION = 'td613.sorted-json/v1';
const FIXTURE_VERSION = 'td613.pedagogue.observation-custody-control/v0.1';
const INSTRUMENT_VERSION = 'pedagogue-observation-custody/v0.1';
const MATCH = 'SYNTHETIC_CONTROL_OBSERVATION_MATCH';

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function canonicalize(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('non-finite number in observation');
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!plainObject(value)) throw new TypeError(`unsupported observation value: ${typeof value}`);
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key]);
  return out;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function digest(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function classify(raw) {
  return raw?.control_name === 'O1_SAME_RUN_CUSTODY_CONTROL'
    && raw?.observation_present === true
    && raw?.support_fields_complete === true
    && raw?.observed_token === raw?.expected_token
    && Number.isInteger(raw?.sample_count)
    && raw.sample_count === 1
    ? MATCH
    : 'SYNTHETIC_CONTROL_OBSERVATION_MISMATCH';
}

function requireEqual(actual, expected, field, failures) {
  if (String(actual ?? '') !== String(expected ?? '')) failures.push(`${field}_MISMATCH`);
}

export function independentlyReplayObservation(observation, expected = {}) {
  const failures = [];
  if (!plainObject(observation)) {
    return { ok: false, disposition: 'FAIL_OBSERVATION_NOT_DURABLY_CUSTODIED', failures: ['OBJECT_MISSING'] };
  }

  requireEqual(observation.schema, SCHEMA, 'schema', failures);
  requireEqual(observation.science_head, expected.scienceHead, 'science_head', failures);
  requireEqual(observation.execution?.workflow_run_id, expected.workflowRunId, 'workflow_run_id', failures);
  requireEqual(observation.execution?.workflow_run_number, expected.workflowRunNumber, 'workflow_run_number', failures);
  if (expected.workflowRunAttempt !== undefined) {
    requireEqual(observation.execution?.workflow_run_attempt, expected.workflowRunAttempt, 'workflow_run_attempt', failures);
  }
  requireEqual(observation.fixture?.version, FIXTURE_VERSION, 'fixture_version', failures);
  requireEqual(observation.instrument?.version, INSTRUMENT_VERSION, 'instrument_version', failures);
  requireEqual(observation.custody?.canonicalization, CANONICALIZATION, 'canonicalization', failures);

  if (Number(observation.external_request_count) !== 0) failures.push('EXTERNAL_REQUEST_COUNT_NONZERO');
  if (observation.second_observation_performed !== false) failures.push('SECOND_OBSERVATION_PERFORMED');

  const payload = structuredClone(observation);
  delete payload.custody;
  const recomputedDigest = digest(payload);
  if (recomputedDigest !== observation.custody?.payload_sha256) failures.push('CUSTODY_DIGEST_MISMATCH');

  const replayedClassification = classify(observation.raw);
  if (replayedClassification !== observation.runtime_classification) failures.push('RUNTIME_CLASSIFICATION_REPLAY_MISMATCH');
  if (replayedClassification !== MATCH) failures.push('SYNTHETIC_CONTROL_DID_NOT_MATCH');

  const reversed = Object.fromEntries(Object.entries(observation).reverse());
  const semanticResultInvariant = canonicalJson(reversed) === canonicalJson(observation);
  if (!semanticResultInvariant) failures.push('SERIALIZATION_ORDER_DEPENDENCE');

  const duplicateDigests = [observation, structuredClone(observation)].map((item) => item.custody?.payload_sha256);
  const uniqueObservationCount = new Set(duplicateDigests).size;
  if (uniqueObservationCount !== 1) failures.push('DUPLICATE_COPY_AMPLIFICATION');

  return {
    ok: failures.length === 0,
    disposition: failures.length === 0
      ? 'INDEPENDENT_EXACT_RUN_REPLAY_SURVIVES'
      : 'INDEPENDENT_EXACT_RUN_REPLAY_FAILED',
    failures,
    science_head: observation.science_head,
    workflow_run_id: observation.execution?.workflow_run_id ?? null,
    workflow_run_number: observation.execution?.workflow_run_number ?? null,
    workflow_run_attempt: observation.execution?.workflow_run_attempt ?? null,
    fixture_version: observation.fixture?.version ?? null,
    instrument_version: observation.instrument?.version ?? null,
    stored_classification: observation.runtime_classification ?? null,
    replayed_classification: replayedClassification,
    payload_sha256: observation.custody?.payload_sha256 ?? null,
    recomputed_payload_sha256: recomputedDigest,
    external_request_count: observation.external_request_count,
    second_observation_performed: observation.second_observation_performed,
    semantic_result_invariant: semanticResultInvariant,
    duplicate_copy_unique_observation_count: uniqueObservationCount,
    duplicate_copy_adds_authority: false,
    claim_ceiling: observation.claim_ceiling ?? null
  };
}

async function cli(argv) {
  const [filePath, scienceHead, workflowRunId, workflowRunNumber, workflowRunAttempt] = argv;
  if (!filePath || !scienceHead || !workflowRunId || !workflowRunNumber) {
    console.error('usage: pedagogue-observation-custody-independent-replay.mjs <artifact-json> <science-head> <run-id> <run-number> [run-attempt]');
    return 64;
  }
  const observation = JSON.parse(await readFile(resolve(filePath), 'utf8'));
  const result = independentlyReplayObservation(observation, {
    scienceHead,
    workflowRunId,
    workflowRunNumber,
    workflowRunAttempt
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result.ok ? 0 : 1;
}

const invokedAs = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedAs === import.meta.url) {
  cli(process.argv.slice(2))
    .then((code) => { process.exitCode = code; })
    .catch((error) => {
      console.error(error?.stack || error);
      process.exitCode = 1;
    });
}
