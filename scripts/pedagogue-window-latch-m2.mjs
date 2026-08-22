import https from 'node:https';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const WINDOW_LATCH_CUSTODY_SCHEMA = 'td613.pedagogue.e9-m2-window-latch-custody/v0.1';
export const WINDOW_LATCH_FIXTURE_VERSION = 'td613.pedagogue.window-latch-e9-m2/v0.1';
export const WINDOW_LATCH_INSTRUMENT_VERSION = 'pedagogue-window-latch-m2/o1-custody-v0.1';
export const WINDOW_LATCH_CANONICALIZATION = 'td613.sorted-json/v1';
export const WINDOW_LATCH_TARGET = Object.freeze({
  request_url: 'https://www.iana.org/domains/reserved',
  expected_hostname: 'www.iana.org',
  method: 'GET',
  attempts: 1,
  redirect_policy: 'refuse',
  reject_unauthorized: true,
  agent: 'NODE_DEFAULT_HTTPS_GLOBAL_AGENT_PATH',
  request_timeout_ms: 8000,
  response_body_limit_bytes: 1048576
});
export const WINDOW_LATCH_CLAIM_CEILING = [
  'One exact live HTTPS lifecycle observation in one GitHub Actions execution.',
  'Bounded Node response-socket observability only; no IANA honesty, physical origin, institutional authority, universal Node/Web-PKI semantics, proxy/CDN absence, external chronology, E9 rescue, production, or release authority.',
  'Historical run 1932 remains unresolved; this is a new witness.',
  'Candidate remains DIAGNOSTIC_ONLY_NOT_PROMOTED.'
].join(' ');

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function canonicalize(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Non-finite number in Window Latch custody payload');
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainObject(value)) throw new TypeError(`Unsupported Window Latch custody value: ${typeof value}`);
  const out = {};
  for (const key of Object.keys(value).sort()) {
    const child = value[key];
    if (child === undefined || typeof child === 'function' || typeof child === 'symbol') {
      throw new TypeError(`Unsupported Window Latch custody field: ${key}`);
    }
    out[key] = canonicalize(child);
  }
  return out;
}

export function stableWindowLatchJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function digestWindowLatchPayload(value) {
  return createHash('sha256').update(stableWindowLatchJson(value)).digest('hex');
}

function propertyPresent(object, property) {
  return Boolean(object) && property in Object(object);
}

function booleanOrNull(value) {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

export function windowLatchSocketShape(socket) {
  if (!socket) {
    return Object.freeze({
      present: false,
      constructor_name: null,
      encrypted: false,
      authorized_property_present: false,
      authorized_value: null,
      authorization_error_present: false,
      destroyed: null
    });
  }
  const hasAuthorized = propertyPresent(socket, 'authorized');
  return Object.freeze({
    present: true,
    constructor_name: socket.constructor?.name ?? null,
    encrypted: socket.encrypted === true,
    authorized_property_present: hasAuthorized,
    authorized_value: hasAuthorized ? booleanOrNull(socket.authorized) : null,
    authorization_error_present: socket.authorizationError != null,
    destroyed: socket.destroyed === true
  });
}

export function classifyWindowLatchLifecycle(observation) {
  const classes = [];
  const callback = observation?.callback_response_socket ?? windowLatchSocketShape(null);
  const endResponse = observation?.end_response_socket ?? windowLatchSocketShape(null);
  const retained = observation?.retained_callback_socket_at_end ?? windowLatchSocketShape(null);

  if (observation?.request_reused_socket === true) {
    classes.push(observation?.secure_connect_observed === true
      ? 'REUSED_SOCKET_WITH_SECURECONNECT_OBSERVED'
      : 'REUSED_SOCKET_WITHOUT_SECURECONNECT');
  } else {
    classes.push(observation?.secure_connect_observed === true
      ? 'FRESH_SOCKET_WITH_SECURECONNECT_OBSERVED'
      : 'FRESH_SOCKET_WITHOUT_SECURECONNECT_OBSERVED');
  }

  if (callback.authorized_value === false) classes.push('CALLBACK_AUTH_FALSE');

  if (callback.authorized_value === true && !endResponse.present && retained.authorized_value === true) {
    classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_UNAVAILABLE_RETAINED_AUTH_TRUE');
  }
  if (
    callback.authorized_value === true &&
    endResponse.present &&
    endResponse.authorized_property_present &&
    endResponse.authorized_value === true
  ) classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_TRUE');

  if (
    callback.authorized_value === true &&
    endResponse.present &&
    endResponse.authorized_property_present &&
    endResponse.authorized_value === false
  ) classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_FALSE');

  if (
    callback.authorized_value !== null &&
    retained.authorized_value !== null &&
    callback.authorized_value !== retained.authorized_value
  ) classes.push('RETAINED_SOCKET_AUTHORIZATION_CHANGED');

  if (
    endResponse.present &&
    observation?.callback_response_socket_present === true &&
    observation?.end_response_socket_same_as_callback_socket === false
  ) classes.push('END_RESPONSE_SOCKET_IDENTITY_CHANGED');

  if (!endResponse.present || !endResponse.authorized_property_present) {
    classes.push('END_RESPONSE_SOCKET_PROPERTY_UNAVAILABLE');
  }

  if (classes.length === 0) classes.push('LIFECYCLE_MEASUREMENT_UNDERDETERMINED');
  return Object.freeze([...new Set(classes)].sort());
}

export function classifyLatePropertyLookup(observation) {
  const callback = observation?.callback_response_socket ?? windowLatchSocketShape(null);
  const endResponse = observation?.end_response_socket ?? windowLatchSocketShape(null);
  const retained = observation?.retained_callback_socket_at_end ?? windowLatchSocketShape(null);
  const supported = Boolean(
    callback.authorized_value === true &&
    retained.authorized_value === true &&
    (!endResponse.present || !endResponse.authorized_property_present)
  );
  const falsified = Boolean(
    callback.authorized_value === true &&
    endResponse.present &&
    endResponse.authorized_property_present &&
    endResponse.authorized_value === true
  );
  return Object.freeze({ supported, falsified });
}

function requireValue(value, name) {
  const text = String(value ?? '').trim();
  if (!text) throw new TypeError(`${name} is required for Window Latch same-run binding`);
  return text;
}

async function exactScienceHeadFromEnvironment(env = process.env) {
  if (env.TD613_SCIENCE_HEAD) return requireValue(env.TD613_SCIENCE_HEAD, 'science_head');
  if (env.GITHUB_EVENT_PATH) {
    try {
      const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, 'utf8'));
      const exact = event?.pull_request?.head?.sha;
      if (/^[0-9a-f]{40}$/i.test(String(exact ?? ''))) return String(exact).toLowerCase();
    } catch {
      // Fall through to explicit runner values. Missing/unreadable event data is not fabricated.
    }
  }
  return requireValue(env.GITHUB_HEAD_SHA || env.GITHUB_SHA, 'science_head');
}

function executionFromEnvironment(env = process.env) {
  return {
    workflow_run_id: requireValue(env.TD613_WORKFLOW_RUN_ID || env.GITHUB_RUN_ID, 'workflow_run_id'),
    workflow_run_number: requireValue(env.TD613_WORKFLOW_RUN_NUMBER || env.GITHUB_RUN_NUMBER, 'workflow_run_number'),
    workflow_run_attempt: requireValue(env.TD613_WORKFLOW_RUN_ATTEMPT || env.GITHUB_RUN_ATTEMPT, 'workflow_run_attempt'),
    workflow_name: requireValue(env.TD613_WORKFLOW_NAME || env.GITHUB_WORKFLOW, 'workflow_name'),
    job_name: requireValue(env.TD613_WORKFLOW_JOB || env.GITHUB_JOB, 'job_name')
  };
}

function finishedObservation(overrides = {}) {
  return Object.freeze({
    request_completed: false,
    response_available: false,
    response_status: null,
    redirected: false,
    response_body_limit_exceeded: false,
    body_sha256: null,
    body_bytes: null,
    explicit_reject_unauthorized_true: true,
    request_reused_socket: false,
    request_socket_present: false,
    secure_connect_observed: false,
    callback_response_socket_present: false,
    callback_response_socket: windowLatchSocketShape(null),
    retained_callback_socket_same_as_request_socket: false,
    end_response_socket_present: false,
    end_response_socket_same_as_callback_socket: false,
    end_response_socket: windowLatchSocketShape(null),
    retained_callback_socket_at_end: windowLatchSocketShape(null),
    request_error_observed: false,
    request_error_code: null,
    ...overrides
  });
}

function sanitizedErrorCode(error) {
  return String(error?.code || error?.message || 'WINDOW_LATCH_REQUEST_FAILED')
    .replace(/[^A-Za-z0-9_.:-]+/g, '_')
    .slice(0, 160);
}

export async function observeWindowLatchOnce() {
  const url = new URL(WINDOW_LATCH_TARGET.request_url);
  return await new Promise((resolveObservation) => {
    let settled = false;
    let requestSocket = null;
    let secureConnectObserved = false;
    let callbackSocket = null;
    let callbackShape = windowLatchSocketShape(null);

    const settle = (value) => {
      if (settled) return;
      settled = true;
      resolveObservation(Object.freeze(value));
    };

    const request = https.get({
      protocol: url.protocol,
      hostname: url.hostname,
      port: 443,
      path: `${url.pathname}${url.search}`,
      method: WINDOW_LATCH_TARGET.method,
      rejectUnauthorized: true,
      servername: WINDOW_LATCH_TARGET.expected_hostname,
      headers: {
        'user-agent': 'TD613-Pedagogue-Window-Latch-O1/0.1',
        accept: 'text/html,application/xhtml+xml'
      }
    }, (response) => {
      callbackSocket = response.socket ?? null;
      callbackShape = windowLatchSocketShape(callbackSocket);
      const callbackReusedSocket = request.reusedSocket === true;
      const chunks = [];
      let bodyBytes = 0;
      let exceededLimit = false;

      response.on('data', (chunk) => {
        if (exceededLimit) return;
        bodyBytes += chunk.length;
        if (bodyBytes > WINDOW_LATCH_TARGET.response_body_limit_bytes) {
          exceededLimit = true;
          response.destroy(Object.assign(new Error('WINDOW_LATCH_BODY_LIMIT_EXCEEDED'), {
            code: 'WINDOW_LATCH_BODY_LIMIT_EXCEEDED'
          }));
          return;
        }
        chunks.push(chunk);
      });

      response.on('end', () => {
        const endResponseSocket = response.socket ?? null;
        const body = Buffer.concat(chunks);
        settle(finishedObservation({
          request_completed: !exceededLimit,
          response_available: true,
          response_status: response.statusCode ?? null,
          redirected: Boolean(response.statusCode && response.statusCode >= 300 && response.statusCode < 400),
          response_body_limit_exceeded: exceededLimit,
          body_sha256: exceededLimit ? null : createHash('sha256').update(body).digest('hex'),
          body_bytes: exceededLimit ? null : body.length,
          request_reused_socket: callbackReusedSocket,
          request_socket_present: Boolean(requestSocket),
          secure_connect_observed: secureConnectObserved,
          callback_response_socket_present: Boolean(callbackSocket),
          callback_response_socket: callbackShape,
          retained_callback_socket_same_as_request_socket: Boolean(callbackSocket && requestSocket && callbackSocket === requestSocket),
          end_response_socket_present: Boolean(endResponseSocket),
          end_response_socket_same_as_callback_socket: Boolean(endResponseSocket && callbackSocket && endResponseSocket === callbackSocket),
          end_response_socket: windowLatchSocketShape(endResponseSocket),
          retained_callback_socket_at_end: windowLatchSocketShape(callbackSocket),
          request_error_observed: false,
          request_error_code: null
        }));
      });

      response.on('error', (error) => {
        const endResponseSocket = response.socket ?? null;
        settle(finishedObservation({
          response_available: true,
          response_status: response.statusCode ?? null,
          response_body_limit_exceeded: exceededLimit,
          request_reused_socket: request.reusedSocket === true,
          request_socket_present: Boolean(requestSocket),
          secure_connect_observed: secureConnectObserved,
          callback_response_socket_present: Boolean(callbackSocket),
          callback_response_socket: callbackShape,
          retained_callback_socket_same_as_request_socket: Boolean(callbackSocket && requestSocket && callbackSocket === requestSocket),
          end_response_socket_present: Boolean(endResponseSocket),
          end_response_socket_same_as_callback_socket: Boolean(endResponseSocket && callbackSocket && endResponseSocket === callbackSocket),
          end_response_socket: windowLatchSocketShape(endResponseSocket),
          retained_callback_socket_at_end: windowLatchSocketShape(callbackSocket),
          request_error_observed: true,
          request_error_code: sanitizedErrorCode(error)
        }));
      });
    });

    request.once('socket', (socket) => {
      requestSocket = socket;
      if (socket && typeof socket.once === 'function') {
        socket.once('secureConnect', () => {
          secureConnectObserved = true;
        });
      }
    });

    request.setTimeout(WINDOW_LATCH_TARGET.request_timeout_ms, () => {
      request.destroy(Object.assign(new Error('WINDOW_LATCH_TIMEOUT'), { code: 'WINDOW_LATCH_TIMEOUT' }));
    });

    request.on('error', (error) => {
      settle(finishedObservation({
        request_reused_socket: request.reusedSocket === true,
        request_socket_present: Boolean(requestSocket),
        secure_connect_observed: secureConnectObserved,
        callback_response_socket_present: Boolean(callbackSocket),
        callback_response_socket: callbackShape,
        retained_callback_socket_same_as_request_socket: Boolean(callbackSocket && requestSocket && callbackSocket === requestSocket),
        retained_callback_socket_at_end: windowLatchSocketShape(callbackSocket),
        request_error_observed: true,
        request_error_code: sanitizedErrorCode(error)
      }));
    });
  });
}

export function sealWindowLatchCustodyPayload(payload) {
  const clean = structuredClone(payload);
  delete clean.custody;
  return Object.freeze({
    ...clean,
    custody: Object.freeze({
      canonicalization: WINDOW_LATCH_CANONICALIZATION,
      payload_sha256: digestWindowLatchPayload(clean)
    })
  });
}

export async function buildWindowLatchCustodyObservation(observation, env = process.env, observedAtRunner = new Date()) {
  const scienceHead = await exactScienceHeadFromEnvironment(env);
  if (!/^[0-9a-f]{40}$/i.test(scienceHead)) throw new TypeError('science_head must be an exact 40-character Git SHA');
  const execution = executionFromEnvironment(env);
  const classifications = classifyWindowLatchLifecycle(observation);
  const mechanism = classifyLatePropertyLookup(observation);

  return sealWindowLatchCustodyPayload({
    schema: WINDOW_LATCH_CUSTODY_SCHEMA,
    assay: 'Window Latch',
    candidate: 'E9_M2_RESPONSE_SOCKET_LIFECYCLE_APERTURE_DIAGNOSTIC',
    candidate_status: 'DIAGNOSTIC_ONLY_NOT_PROMOTED',
    parent_e9_receipt: 'a91aba633a719e7d1e8a9f89b2a86098b5024a1a',
    parent_m1_receipt: '2533c3a390b5c3b7bf2e11593881ecb596b540db',
    historical_run_1932_status: 'UNRESOLVED_NOT_RECONSTRUCTED',
    science_head: scienceHead.toLowerCase(),
    execution,
    fixture: {
      id: 'WINDOW_LATCH_E9_M2',
      version: WINDOW_LATCH_FIXTURE_VERSION
    },
    instrument: {
      id: 'pedagogue-window-latch-m2',
      version: WINDOW_LATCH_INSTRUMENT_VERSION
    },
    observed_at_runner: (observedAtRunner instanceof Date ? observedAtRunner : new Date(observedAtRunner)).toISOString(),
    target: { ...WINDOW_LATCH_TARGET },
    runtime_classification: [...classifications],
    raw: structuredClone(observation),
    late_property_lookup_hypothesis_supported: mechanism.supported,
    late_property_lookup_hypothesis_falsified: mechanism.falsified,
    external_request_count: 1,
    second_observation_performed: false,
    source_status: 'LIVE_EXTERNAL_HTTPS',
    claim_ceiling: WINDOW_LATCH_CLAIM_CEILING,
    e9_rescue_authority: false,
    tls_contract_weakening_authority: false,
    promotion_authority: false,
    product_mutation: false,
    browser_execution: false,
    production_authority: false,
    release_authority: false,
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED'
  });
}

export async function writeWindowLatchCustodyArtifact(filePath, env = process.env) {
  const observation = await observeWindowLatchOnce();
  const custody = await buildWindowLatchCustodyObservation(observation, env);
  const target = resolve(filePath);
  await mkdir(dirname(target), { recursive: true });
  const temp = `${target}.tmp-${process.pid}`;
  await writeFile(temp, `${stableWindowLatchJson(custody)}\n`, { encoding: 'utf8', flag: 'wx' });
  await rename(temp, target);
  return custody;
}

async function cli(argv) {
  const [filePath] = argv;
  if (!filePath) {
    console.error('usage: pedagogue-window-latch-m2.mjs <artifact-json-path>');
    return 64;
  }
  const custody = await writeWindowLatchCustodyArtifact(filePath);
  process.stdout.write(`${JSON.stringify({
    written: filePath,
    science_head: custody.science_head,
    workflow_run_id: custody.execution.workflow_run_id,
    workflow_run_number: custody.execution.workflow_run_number,
    payload_sha256: custody.custody.payload_sha256,
    external_request_count: custody.external_request_count
  })}\n`);
  return 0;
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
