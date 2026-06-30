import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

export const HUSH_PROVIDER_LOG_SCHEMA = 'td613.hush.provider-log/v1';
export const HUSH_PROVIDER_LOG_VERSION = 'hush-provider-log/v1-contract-derived';
export const HUSH_PROVIDER_LOG_CLASS = 'model-provider-boundary-receipt';

export const HUSH_PROVIDER_LOG_CLAIM_LIMITS = Object.freeze({
  schema_version: 'td613.hush.provider-log-claim-limits/v1',
  not_provider_compliance_proof: true,
  not_output_quality_proof: true,
  not_identity_proof: true,
  not_authorship_ownership_proof: true,
  not_third_party_consent: true,
  not_impersonation_authorization: true,
  not_raw_corpus_export_clearance: true,
  comparison_required_for_compliance_claim: true,
  stylometry_required_for_voice_claim: true
});

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function bool(value, fallback = false) { return typeof value === 'boolean' ? value : fallback; }
function asArray(value) { return Array.isArray(value) ? value : []; }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }
async function hashText(value = '') { return sha256Text(String(value || '')); }

export function isProviderLogPacketId(value) {
  return /^TD613-HUSH-PROVIDER-\d{8}-[A-F0-9]{8}$/u.test(String(value || '').trim().toUpperCase());
}

export function containsShi(value) {
  return /TD613-SH-|SHI#:/iu.test(String(value || ''));
}

function linkedContract(input = {}) {
  const linked = input.linked_contract || input.linkedContract || {};
  const contract = input.outgoing_contract_packet || input.outgoingContractPacket || input.contract_packet || input.contractPacket || {};
  const dispatch = input.dispatch_envelope || input.dispatchEnvelope || {};
  return Object.freeze({
    schema_version: 'td613.hush.linked-contract/v1',
    contract_packet_id: linked.contract_packet_id || linked.contractPacketId || contract.contract_packet_id || null,
    contract_packet_hash_sha256: linked.contract_packet_hash_sha256 || linked.contractPacketHashSha256 || contract.packet_hash_sha256 || null,
    contract_schema_version: linked.contract_schema_version || linked.contractSchemaVersion || contract.schema_version || 'td613.hush.outgoing-contract/v1',
    contract_release_class: linked.contract_release_class || linked.contractReleaseClass || contract.release_discipline?.release_class || 'unknown',
    dispatch_envelope_hash_sha256: linked.dispatch_envelope_hash_sha256 || linked.dispatchEnvelopeHashSha256 || dispatch.dispatch_envelope_hash_sha256 || null,
    contract_claim_limits_carried: bool(linked.contract_claim_limits_carried ?? linked.contractClaimLimitsCarried, Boolean(contract.claim_limits || dispatch.claim_limits))
  });
}

function providerTargetObserved(input = {}) {
  const observed = input.provider_target_observed || input.providerTargetObserved || {};
  const contract = input.outgoing_contract_packet || input.outgoingContractPacket || input.contract_packet || input.contractPacket || {};
  const target = observed.provider_target || observed.providerTarget || contract.provider_target || {};
  return Object.freeze({
    schema_version: 'td613.hush.provider-target-observed/v1',
    provider_class: observed.provider_class || observed.providerClass || target.provider_class || 'unknown',
    provider_name: observed.provider_name || observed.providerName || target.provider_name || null,
    model_name: observed.model_name || observed.modelName || target.model_name || null,
    endpoint_class: observed.endpoint_class || observed.endpointClass || target.endpoint_class || 'unknown',
    api_surface: observed.api_surface || observed.apiSurface || input.apiSurface || 'unknown',
    network_dispatch_observed: bool(observed.network_dispatch_observed ?? observed.networkDispatchObserved, true),
    provider_request_id: observed.provider_request_id || observed.providerRequestId || null,
    provider_response_id: observed.provider_response_id || observed.providerResponseId || null
  });
}

function dispatchObservation(input = {}) {
  const observed = input.dispatch_observation || input.dispatchObservation || {};
  const envelope = input.dispatch_envelope || input.dispatchEnvelope || {};
  const started = observed.dispatch_started_at || observed.dispatchStartedAt || input.dispatchStartedAt || input.created_at || input.createdAt || null;
  const finished = observed.dispatch_finished_at || observed.dispatchFinishedAt || input.dispatchFinishedAt || started;
  return Object.freeze({
    schema_version: 'td613.hush.dispatch-observation/v1',
    dispatch_attempted: bool(observed.dispatch_attempted ?? observed.dispatchAttempted, true),
    dispatch_allowed_by_contract: bool(observed.dispatch_allowed_by_contract ?? observed.dispatchAllowedByContract, Boolean(envelope.dispatch_allowed)),
    operator_override_used: bool(observed.operator_override_used ?? observed.operatorOverrideUsed, false),
    dispatch_started_at: started,
    dispatch_finished_at: finished,
    dispatch_status: observed.dispatch_status || observed.dispatchStatus || (envelope.dispatch_allowed === false ? 'blocked-before-send' : 'sent'),
    transport_error: observed.transport_error || observed.transportError || null
  });
}

async function requestPayloadObservation(input = {}) {
  const observed = input.request_payload_observation || input.requestPayloadObservation || {};
  const envelope = input.dispatch_envelope || input.dispatchEnvelope || {};
  const payload = observed.dispatch_payload || observed.dispatchPayload || envelope.dispatch_payload || {};
  const summary = observed.redacted_payload_summary || observed.redactedPayloadSummary || payload.instruction_summary || 'Redacted provider dispatch payload observation.';
  return Object.freeze({
    schema_version: 'td613.hush.request-payload-observation/v1',
    payload_class: observed.payload_class || observed.payloadClass || 'redacted-dispatch-envelope',
    dispatch_payload_hash_sha256: observed.dispatch_payload_hash_sha256 || observed.dispatchPayloadHashSha256 || await hashObject(payload),
    instruction_summary_hash_sha256: observed.instruction_summary_hash_sha256 || observed.instructionSummaryHashSha256 || await hashText(summary),
    raw_prompt_sent: bool(observed.raw_prompt_sent ?? observed.rawPromptSent, false),
    raw_customizer_samples_sent: bool(observed.raw_customizer_samples_sent ?? observed.rawCustomizerSamplesSent, false),
    raw_mask_material_sent: bool(observed.raw_mask_material_sent ?? observed.rawMaskMaterialSent, false),
    private_text_sent: bool(observed.private_text_sent ?? observed.privateTextSent, false),
    claim_limits_sent: bool(observed.claim_limits_sent ?? observed.claimLimitsSent, Boolean(payload.claim_limits || envelope.claim_limits)),
    refusal_policy_sent: bool(observed.refusal_policy_sent ?? observed.refusalPolicySent, Boolean(payload.refusal_policy || envelope.refusal_policy)),
    discourse_mode_sent: bool(observed.discourse_mode_sent ?? observed.discourseModeSent, Boolean(payload.discourse_mode)),
    retrieval_trigger_sent: bool(observed.retrieval_trigger_sent ?? observed.retrievalTriggerSent, Boolean(payload.retrieval_trigger)),
    redacted_payload_summary: summary
  });
}

async function responseObservation(input = {}) {
  const observed = input.response_observation || input.responseObservation || {};
  const rawText = observed.raw_response_text || observed.rawResponseText || input.raw_response_text || input.rawResponseText || '';
  const responseJson = observed.response_json || observed.responseJson || input.responseJson || null;
  const summary = observed.redacted_response_summary || observed.redactedResponseSummary || input.redactedResponseSummary || (rawText ? rawText.slice(0, 180) : 'Provider response not exported as raw text.');
  return Object.freeze({
    schema_version: 'td613.hush.response-observation/v1',
    response_received: bool(observed.response_received ?? observed.responseReceived, true),
    response_class: observed.response_class || observed.responseClass || (observed.refusal_detected ? 'refusal' : 'text'),
    response_text_hash_sha256: observed.response_text_hash_sha256 || observed.responseTextHashSha256 || await hashText(rawText || summary),
    response_json_hash_sha256: observed.response_json_hash_sha256 || observed.responseJsonHashSha256 || (responseJson ? await hashObject(responseJson) : null),
    redacted_response_summary: summary,
    finish_reason: observed.finish_reason || observed.finishReason || 'unknown',
    provider_reported_status: observed.provider_reported_status || observed.providerReportedStatus || 'success',
    raw_response_exported: bool(observed.raw_response_exported ?? observed.rawResponseExported, false),
    contains_provider_refusal_language: bool(observed.contains_provider_refusal_language ?? observed.containsProviderRefusalLanguage, false),
    contains_safety_filter_language: bool(observed.contains_safety_filter_language ?? observed.containsSafetyFilterLanguage, false),
    contains_private_text_echo: bool(observed.contains_private_text_echo ?? observed.containsPrivateTextEcho, false)
  });
}

async function refusalObservation(input = {}) {
  const observed = input.refusal_observation || input.refusalObservation || {};
  const summary = observed.refusal_reason_summary || observed.refusalReasonSummary || null;
  return Object.freeze({
    schema_version: 'td613.hush.refusal-observation/v1',
    refusal_detected: bool(observed.refusal_detected ?? observed.refusalDetected, false),
    refusal_source: observed.refusal_source || observed.refusalSource || 'none',
    refusal_reason_summary: summary,
    refusal_hash_sha256: observed.refusal_hash_sha256 || observed.refusalHashSha256 || (summary ? await hashText(summary) : null),
    matches_contract_refusal_policy: observed.matches_contract_refusal_policy || observed.matchesContractRefusalPolicy || 'unknown',
    unexpected_refusal_possible: bool(observed.unexpected_refusal_possible ?? observed.unexpectedRefusalPossible, false)
  });
}

function latencyProfile(input = {}) {
  const observed = input.latency_profile || input.latencyProfile || {};
  return Object.freeze({
    schema_version: 'td613.hush.latency-profile/v1',
    dispatch_duration_ms: Number(observed.dispatch_duration_ms ?? observed.dispatchDurationMs ?? 0),
    provider_reported_latency_ms: observed.provider_reported_latency_ms ?? observed.providerReportedLatencyMs ?? null,
    client_observed_latency_ms: Number(observed.client_observed_latency_ms ?? observed.clientObservedLatencyMs ?? observed.dispatch_duration_ms ?? 0),
    timeout_threshold_ms: observed.timeout_threshold_ms ?? observed.timeoutThresholdMs ?? null,
    timing_confidence: observed.timing_confidence || observed.timingConfidence || 'observed'
  });
}

function tokenProfile(input = {}) {
  const observed = input.token_profile || input.tokenProfile || {};
  return Object.freeze({
    schema_version: 'td613.hush.token-profile/v1',
    input_tokens: observed.input_tokens ?? observed.inputTokens ?? null,
    output_tokens: observed.output_tokens ?? observed.outputTokens ?? null,
    total_tokens: observed.total_tokens ?? observed.totalTokens ?? null,
    provider_reported: bool(observed.provider_reported ?? observed.providerReported, false),
    token_estimate_used: bool(observed.token_estimate_used ?? observed.tokenEstimateUsed, false),
    token_estimate_method: observed.token_estimate_method || observed.tokenEstimateMethod || null
  });
}

function redactionProfile(input = {}, request = {}, response = {}) {
  const observed = input.redaction_profile || input.redactionProfile || {};
  return Object.freeze({
    schema_version: 'td613.hush.provider-log-redaction/v1',
    raw_request_stored_locally: bool(observed.raw_request_stored_locally ?? observed.rawRequestStoredLocally, false),
    raw_response_stored_locally: bool(observed.raw_response_stored_locally ?? observed.rawResponseStoredLocally, false),
    raw_request_exported: bool(observed.raw_request_exported ?? observed.rawRequestExported, false),
    raw_response_exported: bool(observed.raw_response_exported ?? observed.rawResponseExported, response.raw_response_exported),
    private_text_detected: bool(observed.private_text_detected ?? observed.privateTextDetected, request.private_text_sent),
    private_text_echo_detected: bool(observed.private_text_echo_detected ?? observed.privateTextEchoDetected, response.contains_private_text_echo),
    redaction_method: observed.redaction_method || observed.redactionMethod || 'hash-and-summary',
    redaction_warnings: asArray(observed.redaction_warnings || observed.redactionWarnings)
  });
}

function safetyEventProfile(input = {}) {
  const observed = input.safety_event_profile || input.safetyEventProfile || {};
  return Object.freeze({
    schema_version: 'td613.hush.safety-event-profile/v1',
    safety_event_detected: bool(observed.safety_event_detected ?? observed.safetyEventDetected, false),
    provider_safety_category: observed.provider_safety_category || observed.providerSafetyCategory || null,
    content_filter_triggered: bool(observed.content_filter_triggered ?? observed.contentFilterTriggered, false),
    policy_refusal_triggered: bool(observed.policy_refusal_triggered ?? observed.policyRefusalTriggered, false),
    provider_warning_present: bool(observed.provider_warning_present ?? observed.providerWarningPresent, false),
    safety_summary: observed.safety_summary || observed.safetySummary || null
  });
}

async function stylometryObservationSeed(input = {}, response = {}) {
  const observed = input.stylometry_observation_seed || input.stylometryObservationSeed || {};
  const summaryHash = observed.redacted_response_summary_hash_sha256 || observed.redactedResponseSummaryHashSha256 || await hashText(response.redacted_response_summary || '');
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-observation-seed/v1',
    stylometry_audit_required: bool(observed.stylometry_audit_required ?? observed.stylometryAuditRequired, true),
    target_profile_ref: clone(observed.target_profile_ref || observed.targetProfileRef || {}),
    response_text_hash_sha256: observed.response_text_hash_sha256 || observed.responseTextHashSha256 || response.response_text_hash_sha256,
    redacted_response_summary_hash_sha256: summaryHash,
    observed_output_class: observed.observed_output_class || observed.observedOutputClass || response.response_class || 'unknown',
    candidate_drift_flags: asArray(observed.candidate_drift_flags || observed.candidateDriftFlags)
  });
}

function adversarialObservationSeed(input = {}) {
  const observed = input.adversarial_observation_seed || input.adversarialObservationSeed || {};
  return Object.freeze({
    schema_version: 'td613.hush.adversarial-observation-seed/v1',
    adversarial_audit_required: bool(observed.adversarial_audit_required ?? observed.adversarialAuditRequired, true),
    attack_surfaces: asArray(observed.attack_surfaces || observed.attackSurfaces).length ? asArray(observed.attack_surfaces || observed.attackSurfaces) : ['overfit', 'style-laundering', 'third-party-mimicry', 'catchphrase-infection', 'raw-corpus-reconstruction', 'provider-overcompliance'],
    provider_behavior_notes: asArray(observed.provider_behavior_notes || observed.providerBehaviorNotes),
    raw_corpus_reconstruction_suspected: observed.raw_corpus_reconstruction_suspected || observed.rawCorpusReconstructionSuspected || 'unknown'
  });
}

function eoRfdRouteObservation(input = {}) {
  const observed = input.eo_rfd_route_observation || input.eoRfdRouteObservation || {};
  const contract = input.outgoing_contract_packet || input.outgoingContractPacket || input.contract_packet || input.contractPacket || {};
  const aperture = observed.aperture_context || observed.apertureContext || contract.eo_rfd_route_state?.aperture_context || input.aperture_context || input.apertureContext || {};
  return Object.freeze({
    schema_version: 'td613.hush.eo-rfd-route-observation/v1',
    firmware_status: observed.firmware_status || observed.firmwareStatus || 'interface-only',
    operational_state: observed.operational_state || observed.operationalState || 'interface_context',
    claim_authority: observed.claim_authority || observed.claimAuthority || 'design_signal',
    target_operational_state: observed.target_operational_state || observed.targetOperationalState || 'verified-runtime-installation',
    aperture_context: Object.freeze({
      aperture_version: aperture.aperture_version || aperture.apertureVersion || 'v2.9.4',
      aperture_schema: aperture.aperture_schema || aperture.apertureSchema || 'td613-aperture/v2.9.4',
      aperture_feature_version: aperture.aperture_feature_version || aperture.apertureFeatureVersion || 'v2.9.4-sigma-dynamical-instrument',
      doctrine_kernel: aperture.doctrine_kernel || aperture.doctrineKernel || 'present',
      geometric_addendum: aperture.geometric_addendum || aperture.geometricAddendum || 'present',
      authority: aperture.authority || 'design-signal',
      dome_world_receipt: aperture.dome_world_receipt || aperture.domeWorldReceipt || null,
      claim_limit: aperture.claim_limit || aperture.claimLimit || 'Current EO-RFD state is interface context with design-signal authority; later runtime promotion requires explicit verification.'
    }),
    dome_world_context: Object.freeze({
      version: 'v0.4.3',
      schema: 'td613.dome-world.receipt-ref/v0.4.3',
      receipt_reference_only: true,
      raw_exact_coordinates_allowed: false,
      training_history_allowed: false,
      sensitive_text_allowed: false
    }),
    route_conscience_hook_observed: observed.route_conscience_hook_observed || observed.routeConscienceHookObserved || 'required',
    provider_contract_hook_present: bool(observed.provider_contract_hook_present ?? observed.providerContractHookPresent, true),
    stylometry_drift_hook_present: bool(observed.stylometry_drift_hook_present ?? observed.stylometryDriftHookPresent, true),
    refusal_reason_hook_present: bool(observed.refusal_reason_hook_present ?? observed.refusalReasonHookPresent, true),
    route_state_label: observed.route_state_label || observed.routeStateLabel || 'provider-boundary-observed',
    firmware_adapter_verified: bool(observed.firmware_adapter_verified ?? observed.firmwareAdapterVerified, false),
    operator_note: observed.operator_note || observed.operatorNote || 'EO-RFD interface_context/design_signal state observed; no runtime activation inferred.'
  });
}

function releaseDiscipline(input = {}, dispatch = {}, request = {}, response = {}, redaction = {}, eo = {}, options = {}) {
  const explicit = input.provider_log_release_discipline || input.providerLogReleaseDiscipline || input.release_discipline || input.releaseDiscipline || {};
  const warnings = asArray(explicit.warnings);
  let releaseClass = explicit.release_class || explicit.releaseClass || 'audit-ready';
  if (dispatch.dispatch_status && !['sent', 'unknown'].includes(dispatch.dispatch_status)) releaseClass = releaseClass === 'audit-ready' ? 'provider-error-log' : releaseClass;
  if (request.raw_prompt_sent || request.raw_customizer_samples_sent || request.raw_mask_material_sent || request.private_text_sent || response.contains_private_text_echo || redaction.private_text_detected || redaction.private_text_echo_detected || redaction.raw_request_exported || redaction.raw_response_exported) {
    warnings.push('private-or-raw-provider-log-surface');
    releaseClass = releaseClass === 'audit-ready' ? 'private-text-review' : releaseClass;
  }
  if (eo.firmware_status === 'firmware-attached' && !eo.firmware_adapter_verified) releaseClass = 'blocked';
  if (options.blocked) releaseClass = 'blocked';
  return Object.freeze({
    schema_version: 'td613.hush.provider-log-release/v1',
    release_class: releaseClass,
    audit_ready: Boolean(releaseClass === 'audit-ready'),
    operator_next_action: explicit.operator_next_action || explicit.operatorNextAction || (releaseClass === 'audit-ready' ? 'run-contract-log-comparator' : 'review-provider-log'),
    warnings: [...new Set(warnings)]
  });
}

export function providerLogPacketHashPreimage(packet = {}) {
  const material = clone(packet || {});
  delete material.packet_hash_sha256;
  if (material.hash_topology) delete material.hash_topology.packet_hash_sha256;
  return material;
}

export async function buildProviderLogHashTopology(packetWithoutHash = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.provider-log-hash-topology/v1',
    linked_contract_hash_sha256: await hashObject(packetWithoutHash.linked_contract || {}),
    provider_target_observed_hash_sha256: await hashObject(packetWithoutHash.provider_target_observed || {}),
    dispatch_observation_hash_sha256: await hashObject(packetWithoutHash.dispatch_observation || {}),
    request_payload_observation_hash_sha256: await hashObject(packetWithoutHash.request_payload_observation || {}),
    response_observation_hash_sha256: await hashObject(packetWithoutHash.response_observation || {}),
    redaction_profile_hash_sha256: await hashObject(packetWithoutHash.redaction_profile || {}),
    policy_hash_sha256: await hashObject({ claim_limits: packetWithoutHash.claim_limits || {}, release_discipline: packetWithoutHash.provider_log_release_discipline || {}, eo_rfd_route_observation: packetWithoutHash.eo_rfd_route_observation || {} })
  });
}

export async function buildProviderLogPacket(input = {}, options = {}) {
  const created = options.createdAt || input.created_at || input.createdAt || new Date().toISOString();
  const updated = options.updatedAt || input.updated_at || input.updatedAt || created;
  const linked = linkedContract(input);
  const provider = providerTargetObserved(input);
  const dispatch = dispatchObservation({ ...input, created_at: created });
  const request = await requestPayloadObservation(input);
  const response = await responseObservation(input);
  const refusal = await refusalObservation(input);
  const latency = latencyProfile(input);
  const tokens = tokenProfile(input);
  const redaction = redactionProfile(input, request, response);
  const safety = safetyEventProfile(input);
  const stylometry = await stylometryObservationSeed(input, response);
  const adversarial = adversarialObservationSeed(input);
  const eo = eoRfdRouteObservation(input);
  const release = releaseDiscipline(input, dispatch, request, response, redaction, eo, options);
  const idSeed = stableStringify({ created: options.stableId ? 'stable' : created, linked, provider, dispatch, request, response });
  const idHash = await sha256Text(idSeed);
  const providerLogId = input.provider_log_packet_id || input.providerLogPacketId || `TD613-HUSH-PROVIDER-${created.slice(0, 10).replace(/-/g, '')}-${idHash.slice(7, 15).toUpperCase()}`;
  const packetBase = {
    schema_version: HUSH_PROVIDER_LOG_SCHEMA,
    packet_version: HUSH_PROVIDER_LOG_VERSION,
    packet_class: HUSH_PROVIDER_LOG_CLASS,
    provider_log_packet_id: providerLogId,
    created_at: created,
    updated_at: updated,
    linked_contract: linked,
    provider_target_observed: provider,
    dispatch_observation: dispatch,
    request_payload_observation: request,
    response_observation: response,
    refusal_observation: refusal,
    latency_profile: latency,
    token_profile: tokens,
    redaction_profile: redaction,
    safety_event_profile: safety,
    stylometry_observation_seed: stylometry,
    adversarial_observation_seed: adversarial,
    eo_rfd_route_observation: eo,
    provider_log_release_discipline: release,
    claim_limits: HUSH_PROVIDER_LOG_CLAIM_LIMITS
  };
  const topology = await buildProviderLogHashTopology(packetBase);
  const withTopology = { ...packetBase, hash_topology: topology };
  const packetHash = await sha256Text(stableStringify(withTopology));
  return Object.freeze({ ...withTopology, hash_topology: Object.freeze({ ...topology, packet_hash_sha256: packetHash }), packet_hash_sha256: packetHash });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_PROVIDER_LOG_PACKET = Object.freeze({ HUSH_PROVIDER_LOG_SCHEMA, HUSH_PROVIDER_LOG_VERSION, HUSH_PROVIDER_LOG_CLASS, HUSH_PROVIDER_LOG_CLAIM_LIMITS, isSha256, isProviderLogPacketId, containsShi, providerLogPacketHashPreimage, buildProviderLogHashTopology, buildProviderLogPacket });
}
