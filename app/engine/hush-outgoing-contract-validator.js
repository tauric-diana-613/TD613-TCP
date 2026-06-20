import {
  HUSH_OUTGOING_CONTRACT_SCHEMA,
  HUSH_OUTGOING_CONTRACT_VERSION,
  HUSH_OUTGOING_CONTRACT_CLASS,
  HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS,
  buildOutgoingContractPacket,
  buildOutgoingContractHashTopology,
  packetHashPreimage,
  isContractPacketId,
  containsShi
} from './hush-outgoing-contract-packet.js';
import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

const PROVIDER_CLASSES = Object.freeze(['openai', 'anthropic', 'local', 'browser', 'unknown']);
const ENDPOINT_CLASSES = Object.freeze(['chat', 'completion', 'responses', 'local-runtime', 'unknown']);
const RELEASE_CLASSES = Object.freeze(['draft-contract', 'local-contract', 'provider-ready', 'operator-review', 'blocked']);
const PUBLIC_BLOCKED_PATTERNS = Object.freeze([
  /identity\s*proof/iu,
  /authorship\s*ownership/iu,
  /third[-\s]*party\s*consent/iu,
  /impersonation\s*authorization/iu,
  /public\s*law\s*approval/iu,
  /legal\s*identity/iu,
  /civil\s*identity/iu
]);

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function body(value) { return JSON.stringify(value || {}); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }

export { isSha256, buildOutgoingContractPacket };

export function classifyOutgoingContractPacket(packet = {}) {
  const families = [];
  if (packet.schema_version === HUSH_OUTGOING_CONTRACT_SCHEMA && packet.packet_class === HUSH_OUTGOING_CONTRACT_CLASS) families.push('outgoing-contract-v1');
  if (isSha256(packet.packet_hash_sha256)) families.push('packet-hash-bearing');
  if (packet.request_context) families.push('request-context-bearing');
  if (packet.provider_target) families.push('provider-target-bearing');
  if (packet.mask_context) families.push('mask-context-bearing');
  if (packet.instruction_contract) families.push('instruction-contract-bearing');
  if (packet.private_text_policy) families.push('private-text-policy-bearing');
  if (packet.refusal_policy) families.push('refusal-policy-bearing');
  if (packet.release_discipline) families.push('release-discipline-bearing');
  return unique(families);
}

function inspectHashFormats(packet = {}) {
  const reasons = [];
  if (!isSha256(packet.packet_hash_sha256)) reasons.push('packet_hash_sha256 is not sha256:<64_hex>');
  const topology = packet.hash_topology || {};
  ['request_context_hash_sha256', 'provider_target_hash_sha256', 'mask_context_hash_sha256', 'instruction_contract_hash_sha256', 'policy_hash_sha256', 'packet_hash_sha256'].forEach((key) => {
    if (!isSha256(topology[key])) reasons.push(`hash_topology.${key} is not sha256:<64_hex>`);
  });
  return reasons;
}

function inspectRequiredSurfaces(packet = {}, options = {}) {
  const reasons = [];
  const warnings = [];
  const releaseClass = getPath(packet, 'release_discipline.release_class') || 'unknown';
  const providerReady = releaseClass === 'provider-ready';
  if (!packet.request_context) reasons.push('request_context is required');
  if (!getPath(packet, 'request_context.request_kind')) reasons.push('request_context.request_kind is required');
  if (!getPath(packet, 'request_context.surface')) reasons.push('request_context.surface is required');
  if (!getPath(packet, 'request_context.source_event')) reasons.push('request_context.source_event is required');
  if (getPath(packet, 'request_context.user_visible') === false && providerReady && !getPath(packet, 'request_context.operator_note')) reasons.push('user_visible false requires operator_note before provider dispatch');

  if (!packet.provider_target) reasons.push('provider_target is required');
  const providerClass = getPath(packet, 'provider_target.provider_class');
  const endpointClass = getPath(packet, 'provider_target.endpoint_class');
  if (!PROVIDER_CLASSES.includes(providerClass)) reasons.push('provider_target.provider_class is invalid');
  if (!ENDPOINT_CLASSES.includes(endpointClass)) reasons.push('provider_target.endpoint_class is invalid');
  if (providerReady && providerClass === 'unknown') reasons.push('provider_class unknown in provider-ready contract');
  if (providerReady && endpointClass === 'unknown') reasons.push('endpoint_class unknown in provider-ready contract');
  if (typeof getPath(packet, 'provider_target.network_dispatch_expected') !== 'boolean') reasons.push('provider_target.network_dispatch_expected must be boolean');

  if (!packet.mask_context) reasons.push('mask_context is required');
  const maskSource = getPath(packet, 'mask_context.mask_source');
  if (!maskSource) reasons.push('mask_context.mask_source is required');
  if (maskSource !== 'no-mask' && !getPath(packet, 'mask_context.mask_id')) reasons.push('mask_context.mask_id is required unless no-mask');
  if (containsShi(getPath(packet, 'mask_context.mask_id'))) reasons.push('mask_context.mask_id must not use SHI');
  if (!getPath(packet, 'mask_context.discourse_mode')) reasons.push('mask_context.discourse_mode is required');
  if (!getPath(packet, 'mask_context.retrieval_trigger')) reasons.push('mask_context.retrieval_trigger is required');
  if (providerReady && getPath(packet, 'mask_context.raw_mask_material_exported')) reasons.push('raw mask material cannot be provider-ready');

  const customizerId = getPath(packet, 'customizer_packet_ref.customizer_packet_id');
  if (customizerId && !/^TD613-HUSH-CUSTOMIZER-\d{8}-[A-F0-9]{8}$/u.test(String(customizerId).toUpperCase())) reasons.push('customizer_packet_ref.customizer_packet_id is malformed');
  const customizerHash = getPath(packet, 'customizer_packet_ref.customizer_packet_hash_sha256');
  if (customizerHash && !isSha256(customizerHash)) reasons.push('customizer_packet_ref.customizer_packet_hash_sha256 is not sha256:<64_hex>');
  if (getPath(packet, 'customizer_packet_ref.sample_text_exported')) reasons.push('customizer packet ref must not export sample text');
  if (!customizerId) warnings.push('customizer packet ref absent');

  if (!packet.instruction_contract) reasons.push('instruction_contract is required');
  if (!getPath(packet, 'instruction_contract.expected_output_class')) reasons.push('instruction_contract.expected_output_class is required');
  if (getPath(packet, 'instruction_contract.raw_prompt_exported') && providerReady) reasons.push('raw prompt cannot be exported in provider-ready contract');

  if (!packet.private_text_policy) reasons.push('private_text_policy is required');
  if (providerReady && getPath(packet, 'private_text_policy.raw_customizer_samples_exported')) reasons.push('raw Customizer samples cannot be provider-ready');
  if (providerReady && getPath(packet, 'private_text_policy.raw_mask_material_exported')) reasons.push('raw mask material cannot be provider-ready');
  if (providerReady && getPath(packet, 'private_text_policy.provider_payload_contains_private_text')) reasons.push('provider-ready contract cannot contain unlabeled private text');

  if (!packet.refusal_policy) reasons.push('refusal_policy is required');
  const refuses = asArray(getPath(packet, 'refusal_policy.must_refuse_if'));
  if (!refuses.length) reasons.push('refusal_policy.must_refuse_if is required');
  if (!packet.claim_limits) reasons.push('claim_limits are required');
  for (const [key, value] of Object.entries(HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS)) if (packet.claim_limits && packet.claim_limits[key] !== value) reasons.push(`claim limit missing or false: ${key}`);
  if (!packet.release_discipline) reasons.push('release_discipline is required');
  if (!RELEASE_CLASSES.includes(releaseClass)) reasons.push('release_discipline.release_class is invalid');
  if (releaseClass === 'blocked' && options.allowBlocked !== true) reasons.push('blocked contract cannot be dispatched or imported as valid');

  if (!packet.stylometry_constraints) warnings.push('stylometry constraints absent');
  if (!packet.adversarial_constraints || getPath(packet, 'adversarial_constraints.enabled') === false) warnings.push('adversarial audit disabled');
  if (!packet.eo_rfd_route_state) warnings.push('EO-RFD interface state absent');
  if (getPath(packet, 'eo_rfd_route_state.firmware_status') === 'firmware-attached' && options.eoRfdAdapterVerified !== true) reasons.push('EO-RFD firmware-attached claim requires verified adapter proof');
  const eoText = body(packet.eo_rfd_route_state);
  if (/executive[-\s]*order|legal authority|public law/iu.test(eoText)) reasons.push('EO-RFD route state must not claim legal or executive-order authority');
  for (const pattern of PUBLIC_BLOCKED_PATTERNS) if (pattern.test(body(packet.instruction_contract)) || pattern.test(body(packet.claim_limits)) || pattern.test(body(packet.release_discipline))) reasons.push('contract contains forbidden public authority overclaim');
  return { reasons, warnings };
}

export function validateOutgoingContractShape(packet = {}, options = {}) {
  const refusal_reasons = [];
  const warnings = [];
  if (!isObject(packet)) refusal_reasons.push('packet is not an object');
  if (packet.schema_version !== HUSH_OUTGOING_CONTRACT_SCHEMA) refusal_reasons.push(`schema_version must be ${HUSH_OUTGOING_CONTRACT_SCHEMA}`);
  if (packet.packet_version !== HUSH_OUTGOING_CONTRACT_VERSION) warnings.push('packet_version differs from current outgoing contract version');
  if (packet.packet_class !== HUSH_OUTGOING_CONTRACT_CLASS) refusal_reasons.push(`packet_class must be ${HUSH_OUTGOING_CONTRACT_CLASS}`);
  if (!packet.contract_packet_id) refusal_reasons.push('contract_packet_id is required');
  if (containsShi(packet.contract_packet_id)) refusal_reasons.push('contract_packet_id must not use SHI');
  if (packet.contract_packet_id && !isContractPacketId(packet.contract_packet_id)) refusal_reasons.push('contract_packet_id must match TD613-HUSH-CONTRACT-YYYYMMDD-XXXXXXXX');
  refusal_reasons.push(...inspectHashFormats(packet));
  const families = classifyOutgoingContractPacket(packet);
  if (families.includes('packet-hash-bearing') && families.length === 1) refusal_reasons.push('hash-only outgoing contract is not enough to dispatch or restore');
  const surfaces = inspectRequiredSurfaces(packet, options);
  refusal_reasons.push(...surfaces.reasons);
  warnings.push(...surfaces.warnings);
  return Object.freeze({
    schema_version: 'td613.hush.outgoing-contract-validation/v1',
    validator_mode: 'shape-only',
    status: refusal_reasons.length ? 'blocked' : 'pass',
    packet_schema: HUSH_OUTGOING_CONTRACT_SCHEMA,
    contract_packet_id: packet.contract_packet_id || null,
    release_class: getPath(packet, 'release_discipline.release_class') || 'unknown',
    authority_families: families,
    claim_limits: HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS,
    refusal_reasons: unique(refusal_reasons),
    warnings: unique(warnings)
  });
}

export async function recomputeOutgoingContractHashes(packet = {}) {
  const preimage = packetHashPreimage(packet);
  const expectedTopology = await buildOutgoingContractHashTopology(preimage);
  const expectedPacketHash = await sha256Text(stableStringify({ ...preimage, hash_topology: expectedTopology }));
  const declared = {
    request_context_hash_sha256: getPath(packet, 'hash_topology.request_context_hash_sha256'),
    provider_target_hash_sha256: getPath(packet, 'hash_topology.provider_target_hash_sha256'),
    mask_context_hash_sha256: getPath(packet, 'hash_topology.mask_context_hash_sha256'),
    instruction_contract_hash_sha256: getPath(packet, 'hash_topology.instruction_contract_hash_sha256'),
    policy_hash_sha256: getPath(packet, 'hash_topology.policy_hash_sha256'),
    packet_hash_sha256: packet.packet_hash_sha256 || getPath(packet, 'hash_topology.packet_hash_sha256')
  };
  const refusal_reasons = [];
  for (const key of Object.keys(declared)) {
    const expected = key === 'packet_hash_sha256' ? expectedPacketHash : expectedTopology[key];
    if (declared[key] !== expected) refusal_reasons.push(key === 'packet_hash_sha256' ? 'packet hash replay mismatch' : `${key.replace(/_sha256$/, '').replace(/_/g, ' ')} mismatch`);
  }
  return Object.freeze({ schema_version: 'td613.hush.outgoing-contract-hash-replay/v1', status: refusal_reasons.length ? 'blocked' : 'pass', matches: refusal_reasons.length === 0, declared, expected: { ...expectedTopology, packet_hash_sha256: expectedPacketHash }, refusal_reasons });
}

export async function validateOutgoingContract(packet = {}, options = {}) {
  const base = validateOutgoingContractShape(packet, options);
  if (base.status === 'blocked') return base;
  let replay;
  try { replay = await recomputeOutgoingContractHashes(packet); }
  catch (error) {
    return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: 'blocked', hash_replay: { status: 'blocked', error: String(error && error.message ? error.message : error) }, refusal_reasons: unique([...base.refusal_reasons, 'could not recompute outgoing contract hashes']) });
  }
  const refusal_reasons = unique([...base.refusal_reasons, ...replay.refusal_reasons]);
  return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: refusal_reasons.length ? 'blocked' : 'pass', hash_replay: replay, refusal_reasons });
}

export async function buildProviderDispatchEnvelope(contractPacket = {}, options = {}) {
  const validation = await validateOutgoingContract(contractPacket, options);
  const releaseClass = getPath(contractPacket, 'release_discipline.release_class');
  const override = options.operatorOverride === true;
  const dispatchAllowed = validation.status === 'pass' && (releaseClass === 'provider-ready' || override);
  return Object.freeze({
    schema_version: 'td613.hush.provider-dispatch-envelope/v1',
    contract_packet_id: contractPacket.contract_packet_id || null,
    provider_target: contractPacket.provider_target || null,
    dispatch_allowed: dispatchAllowed,
    dispatch_payload: dispatchAllowed ? {
      instruction_summary: getPath(contractPacket, 'instruction_contract.redacted_prompt_summary') || null,
      expected_output_class: getPath(contractPacket, 'instruction_contract.expected_output_class') || null,
      discourse_mode: getPath(contractPacket, 'mask_context.discourse_mode') || null,
      retrieval_trigger: getPath(contractPacket, 'mask_context.retrieval_trigger') || null,
      refusal_policy: contractPacket.refusal_policy || null,
      claim_limits: contractPacket.claim_limits || HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS
    } : null,
    redaction_notice: { raw_samples_included: false, raw_mask_material_included: false, raw_prompt_included: false, provider_compliance_not_yet_proven: true },
    claim_limits: contractPacket.claim_limits || HUSH_OUTGOING_CONTRACT_CLAIM_LIMITS,
    refusal_policy: contractPacket.refusal_policy || null,
    contract_hash: contractPacket.packet_hash_sha256 || null,
    validation
  });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_OUTGOING_CONTRACT_VALIDATOR = Object.freeze({ isSha256, buildOutgoingContractPacket, classifyOutgoingContractPacket, validateOutgoingContractShape, recomputeOutgoingContractHashes, validateOutgoingContract, buildProviderDispatchEnvelope });
}
