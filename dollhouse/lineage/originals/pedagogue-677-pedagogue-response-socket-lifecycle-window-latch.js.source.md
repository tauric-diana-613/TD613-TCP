import https from 'node:https';
import { createHash } from 'node:crypto';
import { PEDAGOGUE_POST_OFFICE_WINDOW_TARGET } from './pedagogue-live-external-https-observation-custody-post-office-window.js';

export const PEDAGOGUE_WINDOW_LATCH_SCHEMA =
  'td613.pedagogue.e9-m2-response-socket-lifecycle-aperture-diagnostic/v0.1';

const TARGET = PEDAGOGUE_POST_OFFICE_WINDOW_TARGET;

function propertyPresent(object, property) {
  return Boolean(object) && property in Object(object);
}

function booleanOrNull(value) {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

function socketShape(socket) {
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

function classifyLifecycle(observation) {
  const classes = [];
  const callback = observation.callback_response_socket;
  const endResponse = observation.end_response_socket;
  const retained = observation.retained_callback_socket_at_end;

  if (observation.request_reused_socket) {
    classes.push(
      observation.secure_connect_observed
        ? 'REUSED_SOCKET_WITH_SECURECONNECT_OBSERVED'
        : 'REUSED_SOCKET_WITHOUT_SECURECONNECT'
    );
  } else {
    classes.push(
      observation.secure_connect_observed
        ? 'FRESH_SOCKET_WITH_SECURECONNECT_OBSERVED'
        : 'FRESH_SOCKET_WITHOUT_SECURECONNECT_OBSERVED'
    );
  }

  if (callback.authorized_value === false) {
    classes.push('CALLBACK_AUTH_FALSE');
  }

  if (
    callback.authorized_value === true &&
    !endResponse.present &&
    retained.authorized_value === true
  ) {
    classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_UNAVAILABLE_RETAINED_AUTH_TRUE');
  }

  if (
    callback.authorized_value === true &&
    endResponse.present &&
    endResponse.authorized_property_present &&
    endResponse.authorized_value === true
  ) {
    classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_TRUE');
  }

  if (
    callback.authorized_value === true &&
    endResponse.present &&
    endResponse.authorized_property_present &&
    endResponse.authorized_value === false
  ) {
    classes.push('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_FALSE');
  }

  if (
    callback.authorized_value !== null &&
    retained.authorized_value !== null &&
    callback.authorized_value !== retained.authorized_value
  ) {
    classes.push('RETAINED_SOCKET_AUTHORIZATION_CHANGED');
  }

  if (
    endResponse.present &&
    observation.callback_response_socket_present &&
    !observation.end_response_socket_same_as_callback_socket
  ) {
    classes.push('END_RESPONSE_SOCKET_IDENTITY_CHANGED');
  }

  if (!endResponse.present || !endResponse.authorized_property_present) {
    classes.push('END_RESPONSE_SOCKET_PROPERTY_UNAVAILABLE');
  }

  if (classes.length === 0) classes.push('LIFECYCLE_MEASUREMENT_UNDERDETERMINED');
  return Object.freeze([...new Set(classes)].sort());
}

async function observeWindowLatch() {
  const url = new URL(TARGET.request_url);

  return await new Promise(resolve => {
    let settled = false;
    let requestSocket = null;
    let secureConnectObserved = false;
    let callbackSocket = null;
    let callbackShape = socketShape(null);

    const settle = value => {
      if (settled) return;
      settled = true;
      resolve(Object.freeze(value));
    };

    const request = https.get({
      protocol: url.protocol,
      hostname: url.hostname,
      port: 443,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      rejectUnauthorized: true,
      servername: TARGET.expected_hostname,
      headers: {
        'user-agent': 'TD613-Pedagogue-Window-Latch/0.1',
        'accept': 'text/html,application/xhtml+xml'
      }
    }, response => {
      callbackSocket = response.socket ?? null;
      callbackShape = socketShape(callbackSocket);
      const callbackReusedSocket = request.reusedSocket === true;
      const chunks = [];
      let bodyBytes = 0;
      let exceededLimit = false;

      response.on('data', chunk => {
        if (exceededLimit) return;
        bodyBytes += chunk.length;
        if (bodyBytes > TARGET.response_body_limit_bytes) {
          exceededLimit = true;
          response.destroy();
          return;
        }
        chunks.push(chunk);
      });

      response.on('end', () => {
        const endResponseSocket = response.socket ?? null;
        const endResponseShape = socketShape(endResponseSocket);
        const retainedEndShape = socketShape(callbackSocket);
        const body = Buffer.concat(chunks);

        settle({
          request_completed: !exceededLimit,
          response_available: true,
          response_status: response.statusCode ?? null,
          redirected: Boolean(response.statusCode && response.statusCode >= 300 && response.statusCode < 400),
          response_body_limit_exceeded: exceededLimit,
          body_sha256: exceededLimit ? null : createHash('sha256').update(body).digest('hex'),
          body_bytes: exceededLimit ? null : body.length,
          explicit_reject_unauthorized_true: true,
          request_reused_socket: callbackReusedSocket,
          request_socket_present: Boolean(requestSocket),
          secure_connect_observed: secureConnectObserved,
          callback_response_socket_present: Boolean(callbackSocket),
          callback_response_socket: callbackShape,
          retained_callback_socket_same_as_request_socket: Boolean(callbackSocket && requestSocket && callbackSocket === requestSocket),
          end_response_socket_present: Boolean(endResponseSocket),
          end_response_socket_same_as_callback_socket: Boolean(endResponseSocket && callbackSocket && endResponseSocket === callbackSocket),
          end_response_socket: endResponseShape,
          retained_callback_socket_at_end: retainedEndShape,
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
          request_reused_socket: request.reusedSocket === true,
          request_socket_present: Boolean(requestSocket),
          secure_connect_observed: secureConnectObserved,
          callback_response_socket_present: Boolean(callbackSocket),
          callback_response_socket: callbackShape,
          retained_callback_socket_same_as_request_socket: Boolean(callbackSocket && requestSocket && callbackSocket === requestSocket),
          end_response_socket_present: Boolean(response.socket),
          end_response_socket_same_as_callback_socket: Boolean(response.socket && callbackSocket && response.socket === callbackSocket),
          end_response_socket: socketShape(response.socket ?? null),
          retained_callback_socket_at_end: socketShape(callbackSocket),
          request_error_observed: true
        });
      });
    });

    request.once('socket', socket => {
      requestSocket = socket;
      if (socket && typeof socket.once === 'function') {
        socket.once('secureConnect', () => {
          secureConnectObserved = true;
        });
      }
    });

    request.setTimeout(TARGET.request_timeout_ms, () => {
      request.destroy(new Error('WINDOW_LATCH_TIMEOUT'));
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
        request_reused_socket: request.reusedSocket === true,
        request_socket_present: Boolean(requestSocket),
        secure_connect_observed: secureConnectObserved,
        callback_response_socket_present: Boolean(callbackSocket),
        callback_response_socket: callbackShape,
        retained_callback_socket_same_as_request_socket: Boolean(callbackSocket && requestSocket && callbackSocket === requestSocket),
        end_response_socket_present: false,
        end_response_socket_same_as_callback_socket: false,
        end_response_socket: socketShape(null),
        retained_callback_socket_at_end: socketShape(callbackSocket),
        request_error_observed: true
      });
    });
  });
}

export async function runPedagogueWindowLatchDiagnostic() {
  const observation = await observeWindowLatch();
  const diagnosticClassifications = classifyLifecycle(observation);

  const latePropertyLookupHypothesisSupported = Boolean(
    observation.callback_response_socket.authorized_value === true &&
    observation.retained_callback_socket_at_end.authorized_value === true &&
    (!observation.end_response_socket.present || !observation.end_response_socket.authorized_property_present)
  );

  const latePropertyLookupHypothesisFalsified = Boolean(
    observation.callback_response_socket.authorized_value === true &&
    observation.end_response_socket.present &&
    observation.end_response_socket.authorized_property_present &&
    observation.end_response_socket.authorized_value === true
  );

  return Object.freeze({
    ok: true,
    schema: PEDAGOGUE_WINDOW_LATCH_SCHEMA,
    assay: 'Window Latch',
    candidate: 'E9_M2_RESPONSE_SOCKET_LIFECYCLE_APERTURE_DIAGNOSTIC',
    candidate_status: 'DIAGNOSTIC_ONLY_NOT_PROMOTED',
    parent_e9_receipt: 'a91aba633a719e7d1e8a9f89b2a86098b5024a1a',
    parent_m1_receipt: '2533c3a390b5c3b7bf2e11593881ecb596b540db',
    e9_verdict_preserved: 'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW',
    target_url: TARGET.request_url,
    observation,
    diagnostic_classifications: diagnosticClassifications,
    late_property_lookup_hypothesis_supported: latePropertyLookupHypothesisSupported,
    late_property_lookup_hypothesis_falsified: latePropertyLookupHypothesisFalsified,
    e9_rescue_authority: false,
    m1_rewrite_authority: false,
    tls_contract_weakening_authority: false,
    new_external_endpoint_authority: false,
    additional_request_authority: false,
    source_honesty_identified: false,
    institutional_authority_identified: false,
    physical_origin_identified: false,
    proxy_or_cdn_absence_identified: false,
    universal_node_semantics_claim: false,
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
