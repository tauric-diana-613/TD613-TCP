import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const OBSERVATION_CUSTODY_SCHEMA = 'td613.pedagogue.observation-custody/v0.1';
export const OBSERVATION_FIXTURE_VERSION = 'td613.pedagogue.observation-custody-control/v0.1';
export const OBSERVATION_INSTRUMENT_VERSION = 'pedagogue-observation-custody/v0.1';
export const CANONICALIZATION_SCHEMA = 'td613.sorted-json/v1';
export const CONTROL_CLASSIFICATION = 'SYNTHETIC_CONTROL_OBSERVATION_MATCH';
export const CONTROL_MISMATCH_CLASSIFICATION = 'SYNTHETIC_CONTROL_OBSERVATION_MISMATCH';
export const CLAIM_CEILING = [
  'Bounded synthetic same-process observation-custody control only.',
  'No external source truth, source origin, TLS mechanism, institutional independence, universal provenance, production, or release authority.',
  'Candidate remains ATTACK_ONLY_NOT_PROMOTED.'
].join(' ');

const REQUIRED_RAW_FIELDS = Object.freeze([
  'control_name',
  'observation_present',
  'support_fields_complete',
  'observed_token',
  'expected_token',
  'sample_count'
]);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function canonicalize(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Non-finite numbers are not canonical observation data');
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      const child = value[key];
      if (child === undefined || typeof child === 'function' || typeof child === 'symbol') {
        throw new TypeError(`Unsupported canonical observation field: ${key}`);
      }
      out[key] = canonicalize(child);
    }
    return out;
  }
  throw new TypeError(`Unsupported canonical observation value: ${typeof value}`);
}

export function stableCanonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256Canonical(value) {
  return createHash('sha256').update(stableCanonicalJson(value)).digest('hex');
}

export function defaultSyntheticRawObservation() {
  return {
    control_name: 'O1_SAME_RUN_CUSTODY_CONTROL',
    observation_present: true,
    support_fields_complete: true,
    observed_token: 'WITNESS_SURVIVES',
    expected_token: 'WITNESS_SURVIVES',
    sample_count: 1
  };
}

export function classifyRawObservation(raw) {
  if (!isPlainObject(raw)) return CONTROL_MISMATCH_CLASSIFICATION;
  const match = raw.control_name === 'O1_SAME_RUN_CUSTODY_CONTROL'
    && raw.observation_present === true
    && raw.support_fields_complete === true
    && raw.observed_token === raw.expected_token
    && Number.isInteger(raw.sample_count)
    && raw.sample_count === 1;
  return match ? CONTROL_CLASSIFICATION : CONTROL_MISMATCH_CLASSIFICATION;
}

function cleanNullableString(value) {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

function requireScienceHead(value) {
  const head = String(value || '');
  if (!/^[0-9a-f]{40}$/i.test(head)) throw new TypeError('science_head must be an exact 40-character Git SHA');
  return head.toLowerCase();
}

function normalizeTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  if (Number.isNaN(date.getTime())) throw new TypeError('observed_at_runner must be a valid timestamp');
  return date.toISOString();
}

export function sealObservationPayload(payload) {
  if (!isPlainObject(payload)) throw new TypeError('Observation payload must be an object');
  const cleanPayload = structuredClone(payload);
  delete cleanPayload.custody;
  return {
    ...cleanPayload,
    custody: {
      canonicalization: CANONICALIZATION_SCHEMA,
      payload_sha256: sha256Canonical(cleanPayload)
    }
  };
}

export function buildObservation({
  scienceHead,
  workflowRunId = null,
  workflowRunAttempt = null,
  workflowName = null,
  jobName = null,
  fixtureId = 'O1-CONTROL-01',
  fixtureVersion = OBSERVATION_FIXTURE_VERSION,
  instrumentId = 'pedagogue-observation-custody',
  instrumentVersion = OBSERVATION_INSTRUMENT_VERSION,
  observedAtRunner = null,
  raw = defaultSyntheticRawObservation(),
  claimCeiling = CLAIM_CEILING,
  externalRequestCount = 0,
  secondObservationPerformed = false
} = {}) {
  const boundedRaw = structuredClone(raw);
  const payload = {
    schema: OBSERVATION_CUSTODY_SCHEMA,
    science_head: requireScienceHead(scienceHead),
    execution: {
      workflow_run_id: cleanNullableString(workflowRunId),
      workflow_run_attempt: cleanNullableString(workflowRunAttempt),
      workflow_name: cleanNullableString(workflowName),
      job_name: cleanNullableString(jobName)
    },
    fixture: {
      id: String(fixtureId),
      version: String(fixtureVersion)
    },
    instrument: {
      id: String(instrumentId),
      version: String(instrumentVersion)
    },
    observed_at_runner: normalizeTimestamp(observedAtRunner),
    runtime_classification: classifyRawObservation(boundedRaw),
    raw: boundedRaw,
    claim_ceiling: String(claimCeiling),
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    external_request_count: Number(externalRequestCount),
    second_observation_performed: Boolean(secondObservationPerformed),
    promotion_authority: false,
    production_authority: false,
    release_authority: false
  };
  return sealObservationPayload(payload);
}

function bindingComplete(observation, postRunBinding = null) {
  const runId = observation?.execution?.workflow_run_id || postRunBinding?.workflow_run_id || null;
  const scienceHead = observation?.science_head || postRunBinding?.science_head || null;
  return Boolean(
    /^[0-9a-f]{40}$/i.test(String(scienceHead || ''))
    && cleanNullableString(runId)
    && observation?.fixture?.id
    && observation?.fixture?.version
    && observation?.instrument?.id
    && observation?.instrument?.version
  );
}

export function verifyObservationObject(observation, { postRunBinding = null } = {}) {
  if (!isPlainObject(observation)) {
    return { ok: false, disposition: 'FAIL_OBSERVATION_NOT_DURABLY_CUSTODIED' };
  }
  if (observation.second_observation_performed === true || Number(observation.external_request_count) > 0) {
    return { ok: false, disposition: 'REJECT_REPLACEMENT_OBSERVATION_AS_ORIGINAL_WITNESS' };
  }
  if (!isPlainObject(observation.raw) || REQUIRED_RAW_FIELDS.some((field) => !(field in observation.raw))) {
    return { ok: false, disposition: 'FAIL_VERDICT_ONLY_ARTIFACT_NOT_REPLAYABLE' };
  }
  if (!bindingComplete(observation, postRunBinding)) {
    return { ok: false, disposition: 'ABSTAIN_ARTIFACT_EXECUTION_BINDING_INCOMPLETE' };
  }
  if (observation.schema !== OBSERVATION_CUSTODY_SCHEMA
      || observation.custody?.canonicalization !== CANONICALIZATION_SCHEMA
      || typeof observation.custody?.payload_sha256 !== 'string') {
    return { ok: false, disposition: 'INFRASTRUCTURE_SUCCESS_SCIENTIFIC_WITNESS_MISSING' };
  }
  const payload = structuredClone(observation);
  delete payload.custody;
  const recomputedDigest = sha256Canonical(payload);
  if (recomputedDigest !== observation.custody.payload_sha256) {
    return {
      ok: false,
      disposition: 'REJECT_MUTABLE_OBSERVATION_CUSTODY',
      expected_payload_sha256: observation.custody.payload_sha256,
      recomputed_payload_sha256: recomputedDigest
    };
  }
  const recomputedClassification = classifyRawObservation(observation.raw);
  if (recomputedClassification !== observation.runtime_classification) {
    return {
      ok: false,
      disposition: 'FAIL_REPLAY_CLASSIFICATION_MISMATCH',
      stored_classification: observation.runtime_classification,
      recomputed_classification: recomputedClassification
    };
  }
  return {
    ok: true,
    disposition: 'SAME_RUN_OBSERVATION_CUSTODY_REPLAYABLE',
    runtime_classification: recomputedClassification,
    payload_sha256: recomputedDigest,
    external_request_count: observation.external_request_count,
    second_observation_performed: observation.second_observation_performed,
    claim_ceiling: observation.claim_ceiling
  };
}

export function assessObservationClosure({ workflowSuccess, artifact, postRunBinding = null } = {}) {
  const verification = verifyObservationObject(artifact, { postRunBinding });
  if (workflowSuccess === true && !verification.ok) {
    return {
      ok: false,
      disposition: 'INFRASTRUCTURE_SUCCESS_SCIENTIFIC_WITNESS_MISSING',
      underlying_disposition: verification.disposition
    };
  }
  if (!verification.ok) return verification;
  return {
    ...verification,
    workflow_success: Boolean(workflowSuccess),
    observation_custody_survived: true
  };
}

export function summarizeCustodyCopies(observations) {
  const copies = Array.isArray(observations) ? observations : [];
  const identities = copies
    .map((item) => item?.custody?.payload_sha256)
    .filter((value) => typeof value === 'string' && value.length > 0);
  const unique = [...new Set(identities)];
  return {
    copy_count: copies.length,
    identified_copy_count: identities.length,
    unique_observation_count: unique.length,
    duplicate_custody_copies_create_new_observation: false,
    confidence_aggregation_performed: false,
    observation_identities: unique
  };
}

export async function writeObservationFile(filePath, observation) {
  const target = resolve(filePath);
  await mkdir(dirname(target), { recursive: true });
  const temp = `${target}.tmp-${process.pid}`;
  await writeFile(temp, `${stableCanonicalJson(observation)}\n`, { encoding: 'utf8', flag: 'wx' });
  await rename(temp, target);
  return target;
}

export async function readObservationFile(filePath) {
  return JSON.parse(await readFile(resolve(filePath), 'utf8'));
}

function observationFromEnvironment() {
  return buildObservation({
    scienceHead: process.env.TD613_SCIENCE_HEAD || process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA,
    workflowRunId: process.env.TD613_WORKFLOW_RUN_ID || process.env.GITHUB_RUN_ID || null,
    workflowRunAttempt: process.env.TD613_WORKFLOW_RUN_ATTEMPT || process.env.GITHUB_RUN_ATTEMPT || null,
    workflowName: process.env.TD613_WORKFLOW_NAME || process.env.GITHUB_WORKFLOW || null,
    jobName: process.env.TD613_WORKFLOW_JOB || process.env.GITHUB_JOB || null
  });
}

function postRunBindingFromEnvironment() {
  return {
    science_head: process.env.TD613_SCIENCE_HEAD || process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA || null,
    workflow_run_id: process.env.TD613_WORKFLOW_RUN_ID || process.env.GITHUB_RUN_ID || null
  };
}

async function cli(argv) {
  const [mode, filePath] = argv;
  if (!['success', 'failure-control', 'verify'].includes(mode) || !filePath) {
    console.error('usage: pedagogue-observation-custody.mjs <success|failure-control|verify> <path>');
    return 64;
  }
  if (mode === 'verify') {
    const observation = await readObservationFile(filePath);
    const result = verifyObservationObject(observation, { postRunBinding: postRunBindingFromEnvironment() });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return result.ok ? 0 : 1;
  }
  const observation = observationFromEnvironment();
  await writeObservationFile(filePath, observation);
  const result = verifyObservationObject(observation, { postRunBinding: postRunBindingFromEnvironment() });
  process.stdout.write(`${JSON.stringify({ ...result, written: filePath })}\n`);
  if (!result.ok) return 1;
  return mode === 'failure-control' ? 17 : 0;
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
