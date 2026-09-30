import https from 'node:https';
import { createHash } from 'node:crypto';
import { runPedagogueReturnAddressGauntlet } from './pedagogue-dependency-edge-admission-witness-source-origin-custody-return-address.js';

export const PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA =
  'td613.pedagogue.live-external-https-observation-custody-hostile/v0.1';

export const PEDAGOGUE_POST_OFFICE_WINDOW_TARGET = Object.freeze({
  request_url: 'https://www.iana.org/domains/reserved',
  expected_scheme: 'https:',
  expected_hostname: 'www.iana.org',
  expected_status: 200,
  required_markers: Object.freeze(['IANA-managed Reserved Domains', 'example.com']),
  method: 'GET',
  attempts: 1,
  redirect_policy: 'refuse',
  request_timeout_ms: 8000,
  response_body_limit_bytes: 1048576
});

const liveObservations = new WeakMap();
let liveSequence = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sanitizedErrorCode(error) {
  const raw = String(error?.code || error?.message || 'LIVE_HTTPS_REQUEST_FAILED');
  return raw.replace(/[^A-Za-z0-9_.:-]+/g, '_').slice(0, 160);
}

function markerPresence(body) {
  return Object.fromEntries(
    PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.required_markers.map(marker => [marker, body.includes(marker)])
  );
}

export function classifyPreregisteredLiveHttpsTransportSnapshot(snapshot = {}) {
  const target = PEDAGOGUE_POST_OFFICE_WINDOW_TARGET;
  let parsed;
  try {
    parsed = new URL(snapshot.request_url ?? '');
  } catch {
    return 'REFUSE_LIVE_EXTERNAL_OBSERVATION_TARGET_MISMATCH';
  }

  if (
    parsed.protocol !== target.expected_scheme ||
    parsed.hostname !== target.expected_hostname ||
    snapshot.request_url !== target.request_url
  ) return 'REFUSE_LIVE_EXTERNAL_OBSERVATION_TARGET_MISMATCH';

  if (snapshot.tls_authorized !== true) {
    return 'REFUSE_LIVE_EXTERNAL_OBSERVATION_TLS_NOT_AUTHORIZED_BY_RUNNER_TRUST_STORE';
  }

  if (
    (Number(snapshot.response_status) >= 300 && Number(snapshot.response_status) < 400) ||
    Boolean(snapshot.redirect_location)
  ) return 'REFUSE_REDIRECTED_LIVE_EXTERNAL_OBSERVATION';

  if (Number(snapshot.response_status) !== target.expected_status) {
    return 'REFUSE_LIVE_EXTERNAL_OBSERVATION_UNEXPECTED_STATUS';
  }

  if (Number(snapshot.body_bytes) > target.response_body_limit_bytes) {
    return 'REFUSE_LIVE_EXTERNAL_OBSERVATION_BODY_LIMIT_EXCEEDED';
  }

  const markers = snapshot.marker_presence ?? {};
  if (!target.required_markers.every(marker => markers[marker] === true)) {
    return 'REFUSE_LIVE_EXTERNAL_OBSERVATION_REQUIRED_MARKER_MISMATCH';
  }

  return 'ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE';
}

function publicObservationFromSnapshot(snapshot) {
  return deepFreeze({
    schema: `${PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA}/live-observation`,
    observation_label: `POST_OFFICE_WINDOW_${++liveSequence}`,
    request_url: snapshot.request_url,
    request_method: snapshot.request_method,
    response_status: snapshot.response_status,
    redirect_location: snapshot.redirect_location,
    content_type: snapshot.content_type,
    body_bytes: snapshot.body_bytes,
    body_sha256: snapshot.body_sha256,
    marker_presence: clone(snapshot.marker_presence),
    tls_authorized: snapshot.tls_authorized,
    tls_authorization_error: snapshot.tls_authorization_error,
    tls_protocol: snapshot.tls_protocol,
    tls_cipher: snapshot.tls_cipher,
    peer_fingerprint256: snapshot.peer_fingerprint256,
    peer_subject_alt_name: snapshot.peer_subject_alt_name,
    response_date_header: snapshot.response_date_header,
    response_last_modified_header: snapshot.response_last_modified_header
  });
}

export async function acquirePreregisteredLiveExternalHttpsObservation() {
  const target = PEDAGOGUE_POST_OFFICE_WINDOW_TARGET;
  const requestUrl = new URL(target.request_url);

  return await new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      resolve(deepFreeze(value));
    };

    const request = https.get({
      protocol: requestUrl.protocol,
      hostname: requestUrl.hostname,
      port: 443,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      method: target.method,
      headers: {
        'User-Agent': 'TD613-Pedagogue-E9-Post-Office-Window/0.1',
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1'
      },
      rejectUnauthorized: true,
      servername: target.expected_hostname
    }, response => {
      const chunks = [];
      let bodyBytes = 0;
      let bodyLimitExceeded = false;

      response.on('data', chunk => {
        if (bodyLimitExceeded) return;
        bodyBytes += chunk.length;
        if (bodyBytes > target.response_body_limit_bytes) {
          bodyLimitExceeded = true;
          request.destroy(Object.assign(new Error('RESPONSE_BODY_LIMIT_EXCEEDED'), { code: 'RESPONSE_BODY_LIMIT_EXCEEDED' }));
          return;
        }
        chunks.push(chunk);
      });

      response.on('end', () => {
        if (bodyLimitExceeded || settled) return;
        const body = Buffer.concat(chunks).toString('utf8');
        const socket = response.socket;
        const certificate = socket?.getPeerCertificate?.() ?? {};
        const cipher = socket?.getCipher?.() ?? {};
        const snapshot = {
          request_url: target.request_url,
          request_method: target.method,
          response_status: response.statusCode ?? null,
          redirect_location: response.headers.location ?? null,
          content_type: response.headers['content-type'] ?? null,
          body_bytes: Buffer.byteLength(body),
          body_sha256: createHash('sha256').update(body).digest('hex'),
          marker_presence: markerPresence(body),
          tls_authorized: socket?.authorized === true,
          tls_authorization_error: socket?.authorizationError ?? null,
          tls_protocol: socket?.getProtocol?.() ?? null,
          tls_cipher: cipher?.name ?? null,
          peer_fingerprint256: certificate?.fingerprint256 ?? null,
          peer_subject_alt_name: certificate?.subjectaltname ?? null,
          response_date_header: response.headers.date ?? null,
          response_last_modified_header: response.headers['last-modified'] ?? null
        };
        const observation = publicObservationFromSnapshot(snapshot);
        liveObservations.set(observation, deepFreeze({ snapshot: clone(snapshot) }));
        finish({
          status: 'LIVE_HTTPS_RESPONSE_CAPTURED',
          observation,
          transport_contract_status: classifyPreregisteredLiveHttpsTransportSnapshot(snapshot)
        });
      });
    });

    request.setTimeout(target.request_timeout_ms, () => {
      request.destroy(Object.assign(new Error('LIVE_HTTPS_TIMEOUT'), { code: 'LIVE_HTTPS_TIMEOUT' }));
    });

    request.on('error', error => {
      finish({
        status: 'LIVE_EXTERNAL_OBSERVATION_UNAVAILABLE_OR_CONTRACT_MISMATCH',
        observation: null,
        transport_contract_status: 'LIVE_EXTERNAL_OBSERVATION_UNAVAILABLE_OR_CONTRACT_MISMATCH',
        error_code: sanitizedErrorCode(error)
      });
    });
  });
}

export function evaluateLiveExternalHttpsObservationCustody({
  observation = null,
  requested_url = PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url,
  proposed_contract = null
} = {}) {
  const meta = observation && liveObservations.get(observation);

  if (proposed_contract && stable(proposed_contract) !== stable(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET)) {
    return deepFreeze({
      schema: PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA,
      candidate: 'E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY',
      status: 'REFUSE_POST_HOC_TARGET_CONTRACT_REWRITE',
      admitted: false,
      recognized_live_observation_capability: Boolean(meta),
      requested_url,
      live_external_network_observed: Boolean(meta),
      source_time_headers_are_chronology_authority: false,
      certificate_serialization_is_authority: false,
      body_hash_alone_is_authority: false,
      observation_count_is_confidence: false,
      promotion_authority: false
    });
  }

  if (!meta) {
    return deepFreeze({
      schema: PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA,
      candidate: 'E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY',
      status: 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY',
      admitted: false,
      recognized_live_observation_capability: false,
      requested_url,
      live_external_network_observed: false,
      source_time_headers_are_chronology_authority: false,
      certificate_serialization_is_authority: false,
      body_hash_alone_is_authority: false,
      observation_count_is_confidence: false,
      promotion_authority: false
    });
  }

  if (requested_url !== PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url) {
    return deepFreeze({
      schema: PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA,
      candidate: 'E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY',
      status: 'REFUSE_LIVE_EXTERNAL_OBSERVATION_TARGET_MISMATCH',
      admitted: false,
      recognized_live_observation_capability: true,
      requested_url,
      live_external_network_observed: true,
      transport_snapshot: clone(meta.snapshot),
      source_time_headers_are_chronology_authority: false,
      certificate_serialization_is_authority: false,
      body_hash_alone_is_authority: false,
      observation_count_is_confidence: false,
      promotion_authority: false
    });
  }

  const status = classifyPreregisteredLiveHttpsTransportSnapshot(meta.snapshot);
  const admitted = status === 'ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE';
  return deepFreeze({
    schema: PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA,
    candidate: 'E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY',
    status,
    admitted,
    recognized_live_observation_capability: true,
    requested_url,
    live_external_network_observed: true,
    transport_snapshot: clone(meta.snapshot),
    https_transport_authorized_under_runner_trust_store: admitted && meta.snapshot.tls_authorized === true,
    source_honesty_identified: false,
    content_truth_identified: false,
    physical_origin_identified: false,
    institutional_independence_identified: false,
    external_chronology_identified: false,
    proxy_or_cdn_absence_identified: false,
    unrelated_e8_witness_provenance_identified: false,
    source_time_headers_are_chronology_authority: false,
    certificate_serialization_is_authority: false,
    body_hash_alone_is_authority: false,
    observation_count_is_confidence: false,
    promotion_authority: false,
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true
  });
}

export function requestSealedLiveExternalObservationMutation(observation, replacement) {
  if (!observation || !liveObservations.has(observation)) {
    return deepFreeze({
      status: 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY',
      mutated: false
    });
  }
  return deepFreeze({
    status: 'SEALED_LIVE_EXTERNAL_HTTPS_OBSERVATION_IMMUTABLE',
    mutated: false,
    requested_replacement: clone(replacement ?? null)
  });
}

function paintedWindow() {
  return deepFreeze({
    schema: `${PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA}/live-observation`,
    observation_label: 'PAINTED_EXTERNAL_WINDOW',
    request_url: PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url,
    request_method: 'GET',
    response_status: 200,
    redirect_location: null,
    body_bytes: 1024,
    body_sha256: '0'.repeat(64),
    marker_presence: Object.fromEntries(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.required_markers.map(marker => [marker, true])),
    tls_authorized: true,
    tls_protocol: 'TLSv1.3',
    peer_fingerprint256: 'AA:BB:CC',
    peer_subject_alt_name: 'DNS:www.iana.org'
  });
}

export async function runPedagoguePostOfficeWindowGauntlet() {
  const e8 = runPedagogueReturnAddressGauntlet();

  const pw01Object = paintedWindow();
  const pw01Result = evaluateLiveExternalHttpsObservationCustody({ observation: pw01Object });

  const liveAcquisition = await acquirePreregisteredLiveExternalHttpsObservation();
  const liveObservation = liveAcquisition.observation ?? null;
  const pw02Result = liveObservation
    ? evaluateLiveExternalHttpsObservationCustody({ observation: liveObservation })
    : deepFreeze({
        status: 'LIVE_EXTERNAL_OBSERVATION_UNAVAILABLE_OR_CONTRACT_MISMATCH',
        admitted: false,
        recognized_live_observation_capability: false,
        live_external_network_observed: false,
        acquisition_error_code: liveAcquisition.error_code ?? null,
        transport_contract_status: liveAcquisition.transport_contract_status
      });
  const pw02OutcomeStatus = pw02Result.admitted
    ? 'ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE'
    : 'LIVE_EXTERNAL_OBSERVATION_UNAVAILABLE_OR_CONTRACT_MISMATCH';

  const photocopy = liveObservation ? deepFreeze(clone(liveObservation)) : deepFreeze(clone(pw01Object));
  const pw03Result = evaluateLiveExternalHttpsObservationCustody({ observation: photocopy });

  const pw04Result = liveObservation
    ? evaluateLiveExternalHttpsObservationCustody({
        observation: liveObservation,
        requested_url: 'https://www.rfc-editor.org/info/rfc2606/'
      })
    : null;

  const postHocContract = {
    ...clone(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET),
    required_markers: ['AFTER_THE_FACT_MAGIC_MARKER']
  };
  const pw05Result = liveObservation
    ? evaluateLiveExternalHttpsObservationCustody({
        observation: liveObservation,
        proposed_contract: postHocContract
      })
    : null;

  const duplicateA = liveObservation ? evaluateLiveExternalHttpsObservationCustody({ observation: liveObservation }) : null;
  const duplicateB = liveObservation ? evaluateLiveExternalHttpsObservationCustody({ observation: liveObservation }) : null;

  const certificateCostume = deepFreeze({
    ...clone(pw01Object),
    observation_label: 'CERTIFICATE_COSTUME',
    peer_fingerprint256: liveObservation?.peer_fingerprint256 ?? pw01Object.peer_fingerprint256
  });
  const pw08Result = evaluateLiveExternalHttpsObservationCustody({ observation: certificateCostume });

  const hashOnly = deepFreeze({
    observation_label: 'HASH_WITHOUT_SOCKET',
    request_url: PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url,
    body_sha256: liveObservation?.body_sha256 ?? '0'.repeat(64)
  });
  const pw09Result = evaluateLiveExternalHttpsObservationCustody({ observation: hashOnly });

  const pw10Status = classifyPreregisteredLiveHttpsTransportSnapshot({
    request_url: PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url,
    response_status: 302,
    redirect_location: 'https://www.iana.org/help/example-domains',
    body_bytes: 0,
    marker_presence: {},
    tls_authorized: true
  });

  const pw11Mutation = liveObservation
    ? requestSealedLiveExternalObservationMutation(liveObservation, { response_status: 418 })
    : null;

  const rooms = deepFreeze({
    pw01: { case_id: 'PW01_PAINTED_WINDOW', fabricated: pw01Object, result: pw01Result },
    pw02: {
      case_id: 'PW02_OPEN_POST_OFFICE_WINDOW',
      acquisition: liveAcquisition,
      result: pw02Result,
      outcome_status: pw02OutcomeStatus
    },
    pw03: { case_id: 'PW03_PHOTOCOPIED_POSTAL_SLIP', photocopy, result: pw03Result },
    pw04: { case_id: 'PW04_WRONG_BUILDING', result: pw04Result },
    pw05: { case_id: 'PW05_SECRET_MARKER_CHANGED_AFTER_THE_FACT', proposed_contract: postHocContract, result: pw05Result },
    pw06: {
      case_id: 'PW06_DUPLICATE_WINDOW_TICKET',
      first: duplicateA,
      second: duplicateB,
      status_equal: duplicateA && duplicateB ? duplicateA.status === duplicateB.status : null,
      duplicate_observation_count_is_confidence: false
    },
    pw07: {
      case_id: 'PW07_HEADER_CLOCK',
      date_header: liveObservation?.response_date_header ?? null,
      last_modified_header: liveObservation?.response_last_modified_header ?? null,
      source_time_headers_are_chronology_authority: false
    },
    pw08: { case_id: 'PW08_CERTIFICATE_COSTUME', costume: certificateCostume, result: pw08Result },
    pw09: { case_id: 'PW09_HASH_WITHOUT_SOCKET', hash_only: hashOnly, result: pw09Result },
    pw10: { case_id: 'PW10_REDIRECTED_MAIL', classifier_status: pw10Status },
    pw11: {
      case_id: 'PW11_SEALED_OBSERVATION',
      observation_frozen: liveObservation ? Object.isFrozen(liveObservation) : null,
      marker_map_frozen: liveObservation ? Object.isFrozen(liveObservation.marker_presence) : null,
      mutation: pw11Mutation
    },
    pw12: {
      case_id: 'PW12_RETURN_ADDRESS_CONTROL',
      e8_verdict: e8.candidate_verdict,
      e8_live_external_source_adapter: e8.live_external_source_adapter,
      e8_retroactively_authenticated_by_e9: false
    }
  });

  const defeatConditions = [];

  if (rooms.pw01.result.status !== 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY') {
    defeatConditions.push('INTERNAL_VISIBLE_FIELDS_MINT_LIVE_EXTERNAL_AUTHORITY');
  }

  if (
    rooms.pw02.outcome_status !== 'ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE' ||
    rooms.pw02.result.admitted !== true
  ) defeatConditions.push('LIVE_PREREGISTERED_HTTPS_OBSERVATION_NOT_ADMITTED');

  if (rooms.pw03.result.status !== 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY') {
    defeatConditions.push('CLONED_LIVE_OBSERVATION_RETAINS_RUNTIME_CAPABILITY');
  }

  if (liveObservation && rooms.pw04.result?.status !== 'REFUSE_LIVE_EXTERNAL_OBSERVATION_TARGET_MISMATCH') {
    defeatConditions.push('LIVE_OBSERVATION_TRAVELS_TO_WRONG_TARGET');
  }

  if (liveObservation && rooms.pw05.result?.status !== 'REFUSE_POST_HOC_TARGET_CONTRACT_REWRITE') {
    defeatConditions.push('POST_HOC_TARGET_CONTRACT_REWRITES_PREREGISTRATION');
  }

  if (liveObservation && (!rooms.pw06.status_equal || rooms.pw06.duplicate_observation_count_is_confidence)) {
    defeatConditions.push('DUPLICATE_LIVE_OBSERVATION_AMPLIFIES_AUTHORITY');
  }

  if (rooms.pw07.source_time_headers_are_chronology_authority !== false) {
    defeatConditions.push('SOURCE_TIME_HEADER_GAINS_EXTERNAL_CHRONOLOGY_AUTHORITY');
  }

  if (rooms.pw08.result.status !== 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY') {
    defeatConditions.push('CERTIFICATE_SERIALIZATION_MINTS_LIVE_AUTHORITY');
  }

  if (rooms.pw09.result.status !== 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY') {
    defeatConditions.push('BODY_HASH_WITHOUT_SOCKET_MINTS_LIVE_AUTHORITY');
  }

  if (rooms.pw10.classifier_status !== 'REFUSE_REDIRECTED_LIVE_EXTERNAL_OBSERVATION') {
    defeatConditions.push('REDIRECT_SILENTLY_WIDENS_LIVE_TARGET');
  }

  if (liveObservation && (
    rooms.pw11.observation_frozen !== true ||
    rooms.pw11.marker_map_frozen !== true ||
    rooms.pw11.mutation?.status !== 'SEALED_LIVE_EXTERNAL_HTTPS_OBSERVATION_IMMUTABLE'
  )) defeatConditions.push('LIVE_OBSERVATION_MUTABILITY');

  if (
    rooms.pw12.e8_verdict !== 'DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RETURN_ADDRESS' ||
    rooms.pw12.e8_live_external_source_adapter !== false ||
    rooms.pw12.e8_retroactively_authenticated_by_e9 !== false
  ) defeatConditions.push('E9_RETROACTIVELY_UPGRADES_E8_SYNTHETIC_SOURCE_ORIGIN');

  if (liveObservation && rooms.pw02.result.admitted === true) {
    const snapshot = rooms.pw02.result.transport_snapshot;
    if (
      snapshot.tls_authorized !== true ||
      snapshot.response_status !== PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.expected_status ||
      !PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.required_markers.every(marker => snapshot.marker_presence?.[marker] === true)
    ) defeatConditions.push('LIVE_ADMISSION_VIOLATES_PREREGISTERED_TRANSPORT_CONTRACT');
  }

  const candidateVerdict = defeatConditions.length === 0
    ? 'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_POST_OFFICE_WINDOW'
    : 'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW';

  return deepFreeze({
    schema: PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA,
    inherited_e8_verdict: e8.candidate_verdict,
    inherited_e8_terminal_synthetic_seam_preserved: true,
    candidate: 'E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateVerdict,
    defeat_conditions: defeatConditions,
    rooms,
    live_external_source_adapter: true,
    live_external_source_count: 1,
    live_external_network_observed: Boolean(liveObservation),
    https_transport_authorized_under_runner_trust_store:
      rooms.pw02.result?.https_transport_authorized_under_runner_trust_store === true,
    source_honesty_identified: false,
    content_truth_identified: false,
    physical_origin_identified: false,
    institutional_independence_identified: false,
    external_chronology_identified: false,
    proxy_or_cdn_absence_identified: false,
    unrelated_e8_witness_provenance_identified: false,
    universal_external_source_authentication: false,
    scalar_aggregation_used: false,
    bind_live_observation_to_dependency_witness: candidateVerdict === 'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_POST_OFFICE_WINDOW'
      ? 'NEXT_BOUNDED_QUESTION_MAY_BIND_WITNESS_MATERIAL_DERIVED_FROM_THIS_EXACT_LIVE_OBSERVATION'
      : 'HELD_UNTIL_E9_SURVIVES',
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    promotion_authority: false,
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true
  });
}
