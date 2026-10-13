import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SCHEMA = 'td613.pedagogue.e9-m2-window-latch-custody/v0.1';
const CANONICALIZATION = 'td613.sorted-json/v1';
const FIXTURE_VERSION = 'td613.pedagogue.window-latch-e9-m2/v0.1';
const INSTRUMENT_VERSION = 'pedagogue-window-latch-m2/o1-custody-v0.1';
const TARGET = {
  request_url: 'https://www.iana.org/domains/reserved',
  expected_hostname: 'www.iana.org',
  method: 'GET',
  attempts: 1,
  redirect_policy: 'refuse',
  reject_unauthorized: true,
  agent: 'NODE_DEFAULT_HTTPS_GLOBAL_AGENT_PATH',
  request_timeout_ms: 8000,
  response_body_limit_bytes: 1048576
};

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function canonicalize(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('non-finite number in M2 observation');
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!plainObject(value)) throw new TypeError(`unsupported M2 observation value: ${typeof value}`);
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

function nullSocket() {
  return {
    present: false,
    constructor_name: null,
    encrypted: false,
    authorized_property_present: false,
    authorized_value: null,
    authorization_error_present: false,
    destroyed: null
  };
}

export function independentlyClassifyWindowLatch(raw) {
  const callback = raw?.callback_response_socket ?? nullSocket();
  const endResponse = raw?.end_response_socket ?? nullSocket();
  const retained = raw?.retained_callback_socket_at_end ?? nullSocket();
  const classes = [];

  if (raw?.request_reused_socket === true) {
    classes.push(raw?.secure_connect_observed === true
      ? 'REUSED_SOCKET_WITH_SECURECONNECT_OBSERVED'
      : 'REUSED_SOCKET_WITHOUT_SECURECONNECT');
  } else {
    classes.push(raw?.secure_connect_observed === true
      ? 'FRESH_SOCKET_WITH_SECURECONNECT_OBSERVED'
      : 'FRESH_SOCKET_WITHOUT_SECURECONNECT_OBSERVED');
  }
  if (callback.authorized_value === false) classes.push('CALLBACK_AUTH_FALSE');
  if (callback.authorized_value === true && !endResponse.present && retained.authorized_value === true) {
    classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_UNAVAILABLE_RETAINED_AUTH_TRUE');
  }
  if (
    callback.authorized_value === true &&
    endResponse.present === true &&
    endResponse.authorized_property_present === true &&
    endResponse.authorized_value === true
  ) classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_TRUE');
  if (
    callback.authorized_value === true &&
    endResponse.present === true &&
    endResponse.authorized_property_present === true &&
    endResponse.authorized_value === false
  ) classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_FALSE');
  if (
    callback.authorized_value !== null &&
    retained.authorized_value !== null &&
    callback.authorized_value !== retained.authorized_value
  ) classes.push('RETAINED_SOCKET_AUTHORIZATION_CHANGED');
  if (
    endResponse.present === true &&
    raw?.callback_response_socket_present === true &&
    raw?.end_response_socket_same_as_callback_socket === false
  ) classes.push('END_RESPONSE_SOCKET_IDENTITY_CHANGED');
  if (endResponse.present !== true || endResponse.authorized_property_present !== true) {
    classes.push('END_RESPONSE_SOCKET_PROPERTY_UNAVAILABLE');
  }
  if (classes.length === 0) classes.push('LIFECYCLE_MEASUREMENT_UNDERDETERMINED');
  return [...new Set(classes)].sort();
}

export function independentlyClassifyLatePropertyLookup(raw) {
  const callback = raw?.callback_response_socket ?? nullSocket();
  const endResponse = raw?.end_response_socket ?? nullSocket();
  const retained = raw?.retained_callback_socket_at_end ?? nullSocket();
  const supported = (
    callback.authorized_value === true &&
    retained.authorized_value === true &&
    (endResponse.present !== true || endResponse.authorized_property_present !== true)
  );
  const falsified = (
    callback.authorized_value === true &&
    endResponse.present === true &&
    endResponse.authorized_property_present === true &&
    endResponse.authorized_value === true
  );
  return { supported, falsified };
}

function requireEqual(actual, expected, field, failures) {
  if (String(actual ?? '') !== String(expected ?? '')) failures.push(`${field}_MISMATCH`);
}

function arraysEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b)
    && a.length === b.length
    && a.every((value, index) => value === b[index]);
}

export function independentlyReplayWindowLatch(observation, expected = {}) {
  const failures = [];
  if (!plainObject(observation)) {
    return { ok: false, disposition: 'M2_OBSERVATION_OBJECT_MISSING', failures: ['OBJECT_MISSING'] };
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

  if (canonicalJson(observation.target) !== canonicalJson(TARGET)) failures.push('TARGET_CONTRACT_MISMATCH');
  if (Number(observation.external_request_count) !== 1) failures.push('EXTERNAL_REQUEST_COUNT_NOT_ONE');
  if (observation.second_observation_performed !== false) failures.push('SECOND_OBSERVATION_PERFORMED');
  if (observation.historical_run_1932_status !== 'UNRESOLVED_NOT_RECONSTRUCTED') {
    failures.push('RUN_1932_ANTI_RETROACTIVITY_BROKEN');
  }

  const payload = structuredClone(observation);
  delete payload.custody;
  const recomputedDigest = digest(payload);
  if (recomputedDigest !== observation.custody?.payload_sha256) failures.push('CUSTODY_DIGEST_MISMATCH');

  const replayedClassification = independentlyClassifyWindowLatch(observation.raw);
  const storedClassification = Array.isArray(observation.runtime_classification)
    ? [...observation.runtime_classification]
    : [];
  if (!arraysEqual(replayedClassification, storedClassification)) {
    failures.push('RUNTIME_CLASSIFICATION_REPLAY_MISMATCH');
  }

  const mechanism = independentlyClassifyLatePropertyLookup(observation.raw);
  if (mechanism.supported !== observation.late_property_lookup_hypothesis_supported) {
    failures.push('LATE_PROPERTY_SUPPORT_REPLAY_MISMATCH');
  }
  if (mechanism.falsified !== observation.late_property_lookup_hypothesis_falsified) {
    failures.push('LATE_PROPERTY_FALSIFIER_REPLAY_MISMATCH');
  }
  if (mechanism.supported && mechanism.falsified) failures.push('MECHANISM_SIMULTANEOUSLY_SUPPORTED_AND_FALSIFIED');

  const reversed = Object.fromEntries(Object.entries(observation).reverse());
  const semanticResultInvariant = canonicalJson(reversed) === canonicalJson(observation);
  if (!semanticResultInvariant) failures.push('SERIALIZATION_ORDER_DEPENDENCE');

  const duplicateDigests = [observation, structuredClone(observation)].map((item) => item.custody?.payload_sha256);
  const uniqueObservationCount = new Set(duplicateDigests).size;
  if (uniqueObservationCount !== 1) failures.push('DUPLICATE_COPY_AMPLIFICATION');

  const mechanismDisposition = mechanism.supported && !mechanism.falsified
    ? 'LATE_PROPERTY_LOOKUP_APERTURE_SUPPORTED_IN_EXACT_RUN'
    : mechanism.falsified && !mechanism.supported
      ? 'LATE_PROPERTY_LOOKUP_APERTURE_FALSIFIED_IN_EXACT_RUN'
      : 'LATE_PROPERTY_LOOKUP_APERTURE_UNRESOLVED_IN_EXACT_RUN';

  return {
    ok: failures.length === 0,
    disposition: failures.length === 0
      ? 'INDEPENDENT_M2_EXACT_RUN_REPLAY_SURVIVES'
      : 'INDEPENDENT_M2_EXACT_RUN_REPLAY_FAILED',
    failures,
    mechanism_disposition: mechanismDisposition,
    science_head: observation.science_head,
    workflow_run_id: observation.execution?.workflow_run_id ?? null,
    workflow_run_number: observation.execution?.workflow_run_number ?? null,
    workflow_run_attempt: observation.execution?.workflow_run_attempt ?? null,
    fixture_version: observation.fixture?.version ?? null,
    instrument_version: observation.instrument?.version ?? null,
    stored_classification: storedClassification,
    replayed_classification: replayedClassification,
    late_property_lookup_hypothesis_supported: mechanism.supported,
    late_property_lookup_hypothesis_falsified: mechanism.falsified,
    payload_sha256: observation.custody?.payload_sha256 ?? null,
    recomputed_payload_sha256: recomputedDigest,
    external_request_count: observation.external_request_count,
    second_observation_performed: observation.second_observation_performed,
    request_completed: observation.raw?.request_completed ?? null,
    response_status: observation.raw?.response_status ?? null,
    request_reused_socket: observation.raw?.request_reused_socket ?? null,
    secure_connect_observed: observation.raw?.secure_connect_observed ?? null,
    callback_response_socket: observation.raw?.callback_response_socket ?? null,
    end_response_socket: observation.raw?.end_response_socket ?? null,
    retained_callback_socket_at_end: observation.raw?.retained_callback_socket_at_end ?? null,
    end_response_socket_same_as_callback_socket: observation.raw?.end_response_socket_same_as_callback_socket ?? null,
    semantic_result_invariant: semanticResultInvariant,
    duplicate_copy_unique_observation_count: uniqueObservationCount,
    duplicate_copy_adds_authority: false,
    claim_ceiling: observation.claim_ceiling ?? null
  };
}

async function cli(argv) {
  const [filePath, scienceHead, workflowRunId, workflowRunNumber, workflowRunAttempt] = argv;
  if (!filePath || !scienceHead || !workflowRunId || !workflowRunNumber) {
    console.error('usage: pedagogue-window-latch-m2-independent-replay.mjs <artifact-json> <science-head> <run-id> <run-number> [run-attempt]');
    return 64;
  }
  const observation = JSON.parse(await readFile(resolve(filePath), 'utf8'));
  const result = independentlyReplayWindowLatch(observation, {
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
