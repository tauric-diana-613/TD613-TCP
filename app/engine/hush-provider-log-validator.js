import {
  HUSH_PROVIDER_LOG_SCHEMA,
  HUSH_PROVIDER_LOG_VERSION,
  HUSH_PROVIDER_LOG_CLASS,
  HUSH_PROVIDER_LOG_CLAIM_LIMITS,
  buildProviderLogPacket,
  buildProviderLogHashTopology,
  providerLogPacketHashPreimage,
  isProviderLogPacketId,
  containsShi
} from './hush-provider-log-packet.js';
import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

const PROVIDER_CLASSES = Object.freeze(['openai', 'anthropic', 'google', 'gemini', 'local', 'browser', 'unknown']);
const ENDPOINT_CLASSES = Object.freeze(['chat', 'completion', 'responses', 'local-runtime', 'browser-runtime', 'unknown']);
const RELEASE_CLASSES = Object.freeze(['log-local', 'redacted-log', 'provider-error-log', 'private-text-review', 'audit-ready', 'blocked']);
const LEGAL_AUTHORITY_PATTERN = /executive[-\s]*order|legal authority|public law/iu;

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function body(value) { return JSON.stringify(value || {}); }

export { isSha256, buildProviderLogPacket };

export function isProviderLogPacket(value) {
  return Boolean(value && value.schema_version === HUSH_PROVIDER_LOG_SCHEMA && value.packet_class === HUSH_PROVIDER_LOG_CLASS);
}

export function classifyProviderLogPacket(packet = {}) {
  const families = [];
  if (isProviderLogPacket(packet)) families.push('provider-log-v1');
  if (isSha256(packet.packet_hash_sha256)) families.push('packet-hash-bearing');
  if (packet.linked_contract) families.push('linked-contract-bearing');
  if (packet.provider_target_observed) families.push('provider-target-observed-bearing');
  if (packet.dispatch_observation) families.push('dispatch-observation-bearing');
  if (packet.request_payload_observation) families.push('request-payload-observation-bearing');
  if (packet.response_observation) families.push('response-observation-bearing');
  if (packet.redaction_profile) families.push('redaction-profile-bearing');
  if (packet.provider_log_release_discipline) families.push('release-discipline-bearing');
  return unique(families);
}

function inspectHashFormats(packet = {}) {
  const reasons = [];
  if (!isSha256(packet.packet_hash_sha256)) reasons.push('packet_hash_sha256 is not sha256:<64_hex>');
  const topology = packet.hash_topology || {};
  ['linked_contract_hash_sha256', 'provider_target_observed_hash_sha256', 'dispatch_observation_hash_sha256', 'request_payload_observation_hash_sha256', 'response_observation_hash_sha256', 'redaction_profile_hash_sha256', 'policy_hash_sha256', 'packet_hash_sha256'].forEach((key) => {
    if (!isSha256(topology[key])) reasons.push(`hash_topology.${key} is not sha256:<64_hex>`);
  });
  return reasons;
}

function inspectRequiredSurfaces(packet = {}, options = {}) {
  const reasons = [];
  const warnings = [];
  const releaseClass = getPath(packet, 'provider_log_release_discipline.release_class') || 'unknown';
  const auditReady = releaseClass === 'audit-ready' || releaseClass === 'redacted-log';

  const providerLogId = packet.provider_log_packet_id;
  if (!providerLogId) reasons.push('provider_log_packet_id is required');
  if (containsShi(providerLogId)) reasons.push('provider_log_packet_id must not use SHI');
  if (providerLogId && !isProviderLogPacketId(providerLogId)) reasons.push('provider_log_packet_id must match TD613-HUSH-PROVIDER-YYYYMMDD-XXXXXXXX');

  if (!packet.linked_contract) reasons.push('linked_contract is required');
  const contractId = getPath(packet, 'linked_contract.contract_packet_id');
  if (!contractId) reasons.push('linked_contract.contract_packet_id is required');
  if (containsShi(contractId)) reasons.push('linked_contract.contract_packet_id must not use SHI');
  if (contractId && !/^TD613-HUSH-CONTRACT-\d{8}-[A-F0-9]{8}$/u.test(String(contractId).toUpperCase())) reasons.push('linked_contract.contract_packet_id is malformed');
  if (!isSha256(getPath(packet, 'linked_contract.contract_packet_hash_sha256'))) reasons.push('linked_contract.contract_packet_hash_sha256 is not sha256:<64_hex>');
  if (getPath(packet, 'dispatch_observation.dispatch_attempted') && !isSha256(getPath(packet, 'linked_contract.dispatch_envelope_hash_sha256'))) reasons.push('linked_contract.dispatch_envelope_hash_sha256 is required when dispatch was attempted');

  if (!packet.provider_target_observed) reasons.push('provider_target_observed is required');
  const providerClass = getPath(packet, 'provider_target_observed.provider_class');
  const endpointClass = getPath(packet, 'provider_target_observed.endpoint_class');
  if (!PROVIDER_CLASSES.includes(providerClass)) reasons.push('provider_target_observed.provider_class is invalid');
  if (!ENDPOINT_CLASSES.includes(endpointClass)) reasons.push('provider_target_observed.endpoint_class is invalid');
  if (typeof getPath(packet, 'provider_target_observed.network_dispatch_observed') !== 'boolean') reasons.push('provider_target_observed.network_dispatch_observed must be boolean');
  if (!getPath(packet, 'provider_target_observed.provider_request_id')) warnings.push('provider request id absent');
  if (!getPath(packet, 'provider_target_observed.provider_response_id')) warnings.push('provider response id absent');

  if (!packet.dispatch_observation) reasons.push('dispatch_observation is required');
  if (typeof getPath(packet, 'dispatch_observation.dispatch_attempted') !== 'boolean') reasons.push('dispatch_observation.dispatch_attempted must be boolean');
  if (!getPath(packet, 'dispatch_observation.dispatch_status')) reasons.push('dispatch_observation.dispatch_status is required');

  if (!packet.request_payload_observation) reasons.push('request_payload_observation is required');
  if (!isSha256(getPath(packet, 'request_payload_observation.dispatch_payload_hash_sha256'))) reasons.push('request_payload_observation.dispatch_payload_hash_sha256 is not sha256:<64_hex>');
  if (auditReady && getPath(packet, 'request_payload_observation.raw_prompt_sent')) reasons.push('raw prompt cannot be audit-ready provider log');
  if (auditReady && getPath(packet, 'request_payload_observation.raw_customizer_samples_sent')) reasons.push('raw Customizer samples cannot be audit-ready provider log');
  if (auditReady && getPath(packet, 'request_payload_observation.raw_mask_material_sent')) reasons.push('raw mask material cannot be audit-ready provider log');
  if (auditReady && getPath(packet, 'request_payload_observation.private_text_sent')) reasons.push('private text cannot be audit-ready provider log');
  if (!getPath(packet, 'request_payload_observation.claim_limits_sent')) warnings.push('claim limits not observed in provider payload');
  if (!getPath(packet, 'request_payload_observation.refusal_policy_sent')) warnings.push('refusal policy not observed in provider payload');

  if (!packet.response_observation && !packet.refusal_observation) reasons.push('response_observation or refusal_observation is required');
  if (packet.response_observation) {
    if (!isSha256(getPath(packet, 'response_observation.response_text_hash_sha256'))) reasons.push('response_observation.response_text_hash_sha256 is not sha256:<64_hex>');
    if (auditReady && getPath(packet, 'response_observation.raw_response_exported')) reasons.push('raw response cannot be audit-ready provider log');
    if (auditReady && getPath(packet, 'response_observation.contains_private_text_echo')) reasons.push('private text echo cannot be audit-ready provider log');
  }
  if (packet.refusal_observation && getPath(packet, 'refusal_observation.matches_contract_refusal_policy') !== 'unknown') reasons.push('provider log cannot adjudicate contract refusal alignment before Phase 3');

  if (!packet.redaction_profile) reasons.push('redaction_profile is required');
  if (packet.redaction_profile && auditReady) {
    if (getPath(packet, 'redaction_profile.raw_request_exported')) reasons.push('raw request cannot be audit-ready provider log');
    if (getPath(packet, 'redaction_profile.raw_response_exported')) reasons.push('raw response cannot be audit-ready provider log');
    if (getPath(packet, 'redaction_profile.private_text_echo_detected')) reasons.push('private text echo cannot be audit-ready provider log');
  }

  if (!packet.provider_log_release_discipline) reasons.push('provider_log_release_discipline is required');
  if (!RELEASE_CLASSES.includes(releaseClass)) reasons.push('provider_log_release_discipline.release_class is invalid');
  if (releaseClass === 'blocked' && options.allowBlocked !== true) reasons.push('blocked provider log cannot be imported as valid');
  if (releaseClass === 'audit-ready' && !packet.linked_contract) reasons.push('audit-ready provider log requires linked contract');

  if (!packet.claim_limits) reasons.push('claim_limits are required');
  for (const [key, value] of Object.entries(HUSH_PROVIDER_LOG_CLAIM_LIMITS)) if (packet.claim_limits && packet.claim_limits[key] !== value) reasons.push(`claim limit missing or false: ${key}`);

  if (packet.contract_compliance || packet.compliance_status || packet.provider_compliance_claim || packet.output_quality_claim) reasons.push('provider log cannot claim compliance or output quality before Phase 3 comparison');
  if (/stylometric authenticity|voice authenticity|authentic voice/iu.test(body(packet))) reasons.push('provider log cannot claim stylometric authenticity before Phase 4 audit');
  if (!packet.stylometry_observation_seed) warnings.push('stylometry observation seed absent');
  if (!packet.adversarial_observation_seed) warnings.push('adversarial observation seed absent');

  if (!packet.eo_rfd_route_observation) warnings.push('EO-RFD route observation absent');
  if (getPath(packet, 'eo_rfd_route_observation.firmware_status') === 'firmware-attached' && getPath(packet, 'eo_rfd_route_observation.firmware_adapter_verified') !== true) reasons.push('EO-RFD firmware-attached claim requires verified adapter proof');
  if (LEGAL_AUTHORITY_PATTERN.test(body(packet.eo_rfd_route_observation))) reasons.push('EO-RFD route observation must not claim legal or executive-order authority');

  return { reasons, warnings };
}

export function validateProviderLogShape(packet = {}, options = {}) {
  const refusal_reasons = [];
  const warnings = [];
  if (!isObject(packet)) refusal_reasons.push('packet is not an object');
  if (packet.schema_version !== HUSH_PROVIDER_LOG_SCHEMA) refusal_reasons.push(`schema_version must be ${HUSH_PROVIDER_LOG_SCHEMA}`);
  if (packet.packet_version !== HUSH_PROVIDER_LOG_VERSION) warnings.push('packet_version differs from current provider log version');
  if (packet.packet_class !== HUSH_PROVIDER_LOG_CLASS) refusal_reasons.push(`packet_class must be ${HUSH_PROVIDER_LOG_CLASS}`);
  refusal_reasons.push(...inspectHashFormats(packet));
  const families = classifyProviderLogPacket(packet);
  if (families.includes('packet-hash-bearing') && families.length === 1) refusal_reasons.push('hash-only provider log is not enough to audit or attach');
  const surfaces = inspectRequiredSurfaces(packet, options);
  refusal_reasons.push(...surfaces.reasons);
  warnings.push(...surfaces.warnings);
  return Object.freeze({
    schema_version: 'td613.hush.provider-log-validation/v1',
    validator_mode: 'shape-only',
    status: refusal_reasons.length ? 'blocked' : 'pass',
    packet_schema: HUSH_PROVIDER_LOG_SCHEMA,
    provider_log_packet_id: packet.provider_log_packet_id || null,
    release_class: getPath(packet, 'provider_log_release_discipline.release_class') || 'unknown',
    authority_families: families,
    claim_limits: HUSH_PROVIDER_LOG_CLAIM_LIMITS,
    refusal_reasons: unique(refusal_reasons),
    warnings: unique(warnings)
  });
}

export async function recomputeProviderLogHashes(packet = {}) {
  const preimage = providerLogPacketHashPreimage(packet);
  const expectedTopology = await buildProviderLogHashTopology(preimage);
  const expectedPacketHash = await sha256Text(stableStringify({ ...preimage, hash_topology: expectedTopology }));
  const declared = {
    linked_contract_hash_sha256: getPath(packet, 'hash_topology.linked_contract_hash_sha256'),
    provider_target_observed_hash_sha256: getPath(packet, 'hash_topology.provider_target_observed_hash_sha256'),
    dispatch_observation_hash_sha256: getPath(packet, 'hash_topology.dispatch_observation_hash_sha256'),
    request_payload_observation_hash_sha256: getPath(packet, 'hash_topology.request_payload_observation_hash_sha256'),
    response_observation_hash_sha256: getPath(packet, 'hash_topology.response_observation_hash_sha256'),
    redaction_profile_hash_sha256: getPath(packet, 'hash_topology.redaction_profile_hash_sha256'),
    policy_hash_sha256: getPath(packet, 'hash_topology.policy_hash_sha256'),
    top_level_packet_hash_sha256: packet.packet_hash_sha256,
    topology_packet_hash_sha256: getPath(packet, 'hash_topology.packet_hash_sha256')
  };
  const refusal_reasons = [];
  const hashPairs = [
    ['linked_contract_hash_sha256', expectedTopology.linked_contract_hash_sha256, 'linked contract hash mismatch'],
    ['provider_target_observed_hash_sha256', expectedTopology.provider_target_observed_hash_sha256, 'provider target observed hash mismatch'],
    ['dispatch_observation_hash_sha256', expectedTopology.dispatch_observation_hash_sha256, 'dispatch observation hash mismatch'],
    ['request_payload_observation_hash_sha256', expectedTopology.request_payload_observation_hash_sha256, 'request payload observation hash mismatch'],
    ['response_observation_hash_sha256', expectedTopology.response_observation_hash_sha256, 'response observation hash mismatch'],
    ['redaction_profile_hash_sha256', expectedTopology.redaction_profile_hash_sha256, 'redaction profile hash mismatch'],
    ['policy_hash_sha256', expectedTopology.policy_hash_sha256, 'policy hash mismatch']
  ];
  for (const [key, expected, message] of hashPairs) if (declared[key] !== expected) refusal_reasons.push(message);
  if (declared.top_level_packet_hash_sha256 !== expectedPacketHash) refusal_reasons.push('packet hash replay mismatch');
  if (declared.topology_packet_hash_sha256 !== expectedPacketHash) refusal_reasons.push('topology packet hash replay mismatch');
  if (declared.top_level_packet_hash_sha256 && declared.topology_packet_hash_sha256 && declared.top_level_packet_hash_sha256 !== declared.topology_packet_hash_sha256) refusal_reasons.push('packet hash locations disagree');
  return Object.freeze({
    schema_version: 'td613.hush.provider-log-hash-replay/v1',
    status: refusal_reasons.length ? 'blocked' : 'pass',
    matches: refusal_reasons.length === 0,
    declared,
    expected: { ...expectedTopology, packet_hash_sha256: expectedPacketHash },
    refusal_reasons
  });
}

export async function validateProviderLog(packet = {}, options = {}) {
  const base = validateProviderLogShape(packet, options);
  if (base.status === 'blocked') return base;
  let replay;
  try { replay = await recomputeProviderLogHashes(packet); }
  catch (error) {
    return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: 'blocked', hash_replay: { status: 'blocked', error: String(error && error.message ? error.message : error) }, refusal_reasons: unique([...base.refusal_reasons, 'could not recompute provider log hashes']) });
  }
  const refusal_reasons = unique([...base.refusal_reasons, ...replay.refusal_reasons]);
  return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: refusal_reasons.length ? 'blocked' : 'pass', hash_replay: replay, refusal_reasons });
}

export async function buildContractLogAttachment(providerLogPacket = {}, outgoingContractPacket = {}, options = {}) {
  const validation = await validateProviderLog(providerLogPacket, options);
  const contractId = outgoingContractPacket.contract_packet_id || getPath(providerLogPacket, 'linked_contract.contract_packet_id') || null;
  return Object.freeze({
    schema_version: 'td613.hush.contract-log-attachment/v1',
    contract_packet_id: contractId,
    provider_log_packet_id: providerLogPacket.provider_log_packet_id || null,
    contract_hash: outgoingContractPacket.packet_hash_sha256 || getPath(providerLogPacket, 'linked_contract.contract_packet_hash_sha256') || null,
    provider_log_hash: providerLogPacket.packet_hash_sha256 || null,
    comparison_required: true,
    compliance_status: 'not-evaluated',
    validation
  });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_PROVIDER_LOG_VALIDATOR = Object.freeze({ isSha256, buildProviderLogPacket, isProviderLogPacket, classifyProviderLogPacket, validateProviderLogShape, recomputeProviderLogHashes, validateProviderLog, buildContractLogAttachment });
}
