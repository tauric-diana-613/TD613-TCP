import https from 'node:https';
import { createHash } from 'node:crypto';
import { PEDAGOGUE_POST_OFFICE_WINDOW_TARGET } from './pedagogue-live-external-https-observation-custody-post-office-window.js';

export const PEDAGOGUE_BADGE_SCANNER_SCHEMA = 'td613.pedagogue.e9-m1-tls-measurement-semantics-diagnostic/v0.1';

const TARGET_URL = PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url;
const REQUEST_TIMEOUT_MS = 8000;
const RESPONSE_BODY_LIMIT_BYTES = 1048576;

function ownOrInheritedProperty(object, property) {
  if (!object) return false;
  return property in Object(object);
}

function booleanOrNull(value) {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

function boundedTlsShape(socket) {
  if (!socket) {
    return Object.freeze({
      present: false,
      constructor_name: null,
      encrypted: false,
      authorized_property_present: false,
      authorized_value: null,
      authorization_error_present: false,
      peer_certificate_present: false,
      peer_certificate_fingerprint256_present: false,
      tls_protocol_present: false,
      cipher_name_present: false
    });
  }

  let peerCertificate = null;
  try {
    peerCertificate = typeof socket.getPeerCertificate === 'function'
      ? socket.getPeerCertificate()
      : null;
  } catch {
    peerCertificate = null;
  }

  let protocol = null;
  try {
    protocol = typeof socket.getProtocol === 'function' ? socket.getProtocol() : null;
  } catch {
    protocol = null;
  }

  let cipher = null;
  try {
    cipher = typeof socket.getCipher === 'function' ? socket.getCipher() : null;
  } catch {
    cipher = null;
  }

  const authorizedPropertyPresent = ownOrInheritedProperty(socket, 'authorized');

  return Object.freeze({
    present: true,
    constructor_name: socket.constructor?.name ?? null,
    encrypted: socket.encrypted === true,
    authorized_property_present: authorizedPropertyPresent,
    authorized_value: authorizedPropertyPresent ? booleanOrNull(socket.authorized) : null,
    authorization_error_present: socket.authorizationError != null,
    peer_certificate_present: Boolean(peerCertificate && Object.keys(peerCertificate).length > 0),
    peer_certificate_fingerprint256_present: Boolean(peerCertificate?.fingerprint256),
    tls_protocol_present: Boolean(protocol),
    cipher_name_present: Boolean(cipher?.name)
  });
}

function classifyTlsMeasurement(observation) {
  const classes = [];
  const secure = observation.secure_connect_socket;
  const response = observation.response_socket;

  if (!observation.response_available) {
    classes.push('TLS_RESPONSE_UNAVAILABLE');
  }

  if (!observation.secure_connect_observed) {
    classes.push('TLS_SECURECONNECT_NOT_OBSERVED');
  }

  const propertyAvailable = Boolean(
    secure?.authorized_property_present || response?.authorized_property_present
  );
  if (!propertyAvailable) {
    classes.push('TLS_AUTHORIZED_PROPERTY_UNAVAILABLE');
  }

  const values = [secure?.authorized_value, response?.authorized_value].filter(value => value !== null && value !== undefined);
  if (values.length > 0 && values.every(value => value === true)) {
    classes.push('TLS_AUTHORIZED_TRUE_STABLE');
  }

  const falseObserved = values.some(value => value === false);
  if (falseObserved) {
    const errorPresent = Boolean(
      secure?.authorization_error_present || response?.authorization_error_present
    );
    classes.push(
      errorPresent
        ? 'TLS_AUTHORIZED_FALSE_WITH_AUTHORIZATION_ERROR'
        : 'TLS_AUTHORIZED_FALSE_WITHOUT_AUTHORIZATION_ERROR'
    );
  }

  if (
    observation.secure_connect_observed &&
    secure?.authorized_value !== null &&
    response?.authorized_value !== null &&
    secure?.authorized_value !== response?.authorized_value
  ) {
    classes.push('TLS_AUTHORIZATION_STATE_CHANGED_BETWEEN_SECURECONNECT_AND_RESPONSE');
  }

  if (
    observation.request_socket_present &&
    observation.response_socket_present &&
    !observation.request_and_response_socket_same_object
  ) {
    classes.push('TLS_SOCKET_IDENTITY_MISMATCH');
  }

  if (classes.length === 0) {
    classes.push('TLS_MEASUREMENT_UNDERDETERMINED');
  }

  return Object.freeze([...new Set(classes)].sort());
}

async function observeExplicitTlsMeasurement() {
  const url = new URL(TARGET_URL);
  let requestSocket = null;
  let secureConnectObserved = false;
  let secureConnectSocket = null;
  let secureConnectSnapshot = null;
  let responseSocket = null;

  return await new Promise(resolve => {
    let settled = false;
    const settle = value => {
      if (settled) return;
      settled = true;
      resolve(Object.freeze(value));
    };

    const request = https.get({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      rejectUnauthorized: true,
      servername: url.hostname,
      headers: {
        'user-agent': 'TD613-Pedagogue-Badge-Scanner/0.1',
        'accept': 'text/html,application/xhtml+xml'
      }
    }, response => {
      responseSocket = response.socket ?? null;
      const responseSnapshot = boundedTlsShape(responseSocket);
      const chunks = [];
      let bodyBytes = 0;
      let exceededLimit = false;

      response.on('data', chunk => {
        if (exceededLimit) return;
        bodyBytes += chunk.length;
        if (bodyBytes > RESPONSE_BODY_LIMIT_BYTES) {
          exceededLimit = true;
          response.destroy();
          return;
        }
        chunks.push(chunk);
      });

      response.on('end', () => {
        const body = Buffer.concat(chunks);
        settle({
          request_completed: true,
          response_available: true,
          response_status: response.statusCode ?? null,
          redirected: Boolean(response.statusCode && response.statusCode >= 300 && response.statusCode < 400),
          response_body_limit_exceeded: exceededLimit,
          body_sha256: exceededLimit ? null : createHash('sha256').update(body).digest('hex'),
          body_bytes: exceededLimit ? null : body.length,
          explicit_reject_unauthorized_true: true,
          request_socket_present: Boolean(requestSocket),
          response_socket_present: Boolean(responseSocket),
          request_and_response_socket_same_object: Boolean(requestSocket && responseSocket && requestSocket === responseSocket),
          request_socket: boundedTlsShape(requestSocket),
          secure_connect_observed: secureConnectObserved,
          secure_connect_socket: secureConnectSnapshot ?? boundedTlsShape(secureConnectSocket),
          response_socket: responseSnapshot,
          request_error_observed: false
        });
      });

      response.on('error', () => {
        settle({
          request_completed: false,
          response_available: true,
          response_status: response.statusCode ?? null,
          redirected: false,
          response_body_limit_exceeded: exceededLimit,
          body_sha256: null,
          body_bytes: null,
          explicit_reject_unauthorized_true: true,
          request_socket_present: Boolean(requestSocket),
          response_socket_present: Boolean(responseSocket),
          request_and_response_socket_same_object: Boolean(requestSocket && responseSocket && requestSocket === responseSocket),
          request_socket: boundedTlsShape(requestSocket),
          secure_connect_observed: secureConnectObserved,
          secure_connect_socket: secureConnectSnapshot ?? boundedTlsShape(secureConnectSocket),
          response_socket: responseSnapshot,
          request_error_observed: true
        });
      });
    });

    request.once('socket', socket => {
      requestSocket = socket;
      if (socket && typeof socket.once === 'function') {
        socket.once('secureConnect', () => {
          secureConnectObserved = true;
          secureConnectSocket = socket;
          secureConnectSnapshot = boundedTlsShape(socket);
        });
      }
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error('BADGE_SCANNER_TIMEOUT'));
    });

    request.on('error', () => {
      settle({
        request_completed: false,
        response_available: false,
        response_status: null,
        redirected: false,
        response_body_limit_exceeded: false,
        body_sha256: null,
        body_bytes: null,
        explicit_reject_unauthorized_true: true,
        request_socket_present: Boolean(requestSocket),
        response_socket_present: false,
        request_and_response_socket_same_object: false,
        request_socket: boundedTlsShape(requestSocket),
        secure_connect_observed: secureConnectObserved,
        secure_connect_socket: secureConnectSnapshot ?? boundedTlsShape(secureConnectSocket),
        response_socket: boundedTlsShape(null),
        request_error_observed: true
      });
    });
  });
}

export async function runPedagogueBadgeScannerDiagnostic() {
  const observation = await observeExplicitTlsMeasurement();
  const classifications = classifyTlsMeasurement(observation);

  return Object.freeze({
    ok: true,
    schema: PEDAGOGUE_BADGE_SCANNER_SCHEMA,
    assay: 'Badge Scanner',
    candidate: 'E9_M1_TLS_MEASUREMENT_SEMANTICS_DIAGNOSTIC',
    candidate_status: 'DIAGNOSTIC_ONLY_NOT_PROMOTED',
    parent_e9_receipt: 'a91aba633a719e7d1e8a9f89b2a86098b5024a1a',
    e9_verdict_preserved: 'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW',
    target_url: TARGET_URL,
    observation,
    diagnostic_classifications: classifications,
    missing_property_collapse_hypothesis_falsified: Boolean(
      observation.response_socket.authorized_property_present &&
      observation.response_socket.authorized_value === false
    ),
    e9_rescue_authority: false,
    tls_contract_weakening_authority: false,
    source_honesty_identified: false,
    institutional_authority_identified: false,
    physical_origin_identified: false,
    proxy_or_cdn_absence_identified: false,
    universal_web_pki_semantics_claim: false,
    scalar_aggregation_used: false,
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true,
    human_closure_required: true
  });
}
