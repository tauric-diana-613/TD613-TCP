import {
  HUSH_CONTRACT_LOG_PAIR_SCHEMA,
  HUSH_CONTRACT_LOG_PAIR_VERSION,
  HUSH_CONTRACT_LOG_PAIR_CLASS,
  HUSH_CONTRACT_LOG_PAIR_CLAIM_LIMITS,
  buildContractLogPairHashTopology,
  contractLogPairPacketHashPreimage,
  isContractLogPairPacketId,
  containsShi
} from './hush-contract-log-pair-packet.js';
import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

const CONTRACT_ID = /^TD613-HUSH-CONTRACT-\d{8}-[A-F0-9]{8}$/u;
const PROVIDER_ID = /^TD613-HUSH-PROVIDER-\d{8}-[A-F0-9]{8}$/u;
const RELEASE_CLASSES = Object.freeze(['pair-local', 'pair-review', 'audit-route-ready', 'breach-review', 'blocked']);
const FORBIDDEN_PROOF = /voice\s+authentic|stylometric\s+authenticity\s+(?:confirmed|proven|proof)|mask\s+alive|output\s+quality\s+(?:confirmed|proven|proof)|provider\s+intent\s+(?:confirmed|proven|proof)|authorship\s+ownership\s+(?:confirmed|proven|proof)|identity\s+(?:confirmed|proven|proof)|adversarial\s+counterfeit\s+(?:confirmed|proven|proof)|(?:EO-RFD\s+)?firmware\s+(?:confirmed|proven|proof)/iu;

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function body(value) { return JSON.stringify(value || {}); }
function hasRawValue(value) { return value === true || (typeof value === 'string' && value.trim().length > 0) || (Array.isArray(value) && value.length > 0) || (isObject(value) && Object.keys(value).length > 0); }
function overclaimSurface(packet = {}) {
  return {
    comparison_result: packet.comparison_result,
    comparison_notes: [
      packet.provider_target_comparison?.notes,
      packet.dispatch_comparison?.notes,
      packet.payload_comparison?.notes,
      packet.privacy_comparison?.notes,
      packet.refusal_comparison?.notes,
      packet.safety_comparison?.notes,
      packet.release_comparison?.notes,
      packet.pair_release_discipline?.warnings
    ]
  };
}

export function isContractLogPairPacket(value) {
  return Boolean(value && value.schema_version === HUSH_CONTRACT_LOG_PAIR_SCHEMA && value.packet_class === HUSH_CONTRACT_LOG_PAIR_CLASS);
}

export function classifyContractLogPairPacket(packet = {}) {
  const families = [];
  if (isContractLogPairPacket(packet)) families.push('contract-log-pair-v1');
  if (isSha256(packet.packet_hash_sha256)) families.push('packet-hash-bearing');
  if (packet.linked_contract) families.push('linked-contract-bearing');
  if (packet.linked_provider_log) families.push('linked-provider-log-bearing');
  if (packet.contract_snapshot) families.push('contract-snapshot-bearing');
  if (packet.provider_log_snapshot) families.push('provider-log-snapshot-bearing');
  if (packet.comparison_result) families.push('comparison-result-bearing');
  if (packet.pair_release_discipline) families.push('release-discipline-bearing');
  return unique(families);
}

function inspectHashFormats(packet = {}) {
  const reasons = [];
  if (!isSha256(packet.packet_hash_sha256)) reasons.push('packet_hash_sha256 is not sha256:<64_hex>');
  const topology = packet.hash_topology || {};
  ['linked_contract_hash_sha256', 'linked_provider_log_hash_sha256', 'contract_snapshot_hash_sha256', 'provider_log_snapshot_hash_sha256', 'comparison_surfaces_hash_sha256', 'comparison_result_hash_sha256', 'policy_hash_sha256', 'packet_hash_sha256'].forEach((key) => {
    if (!isSha256(topology[key])) reasons.push(`hash_topology.${key} is not sha256:<64_hex>`);
  });
  return reasons;
}

function inspectRawSnapshot(value, path = 'snapshot') {
  const reasons = [];
  if (!isObject(value) && !Array.isArray(value)) return reasons;
  for (const [key, nested] of Object.entries(value || {})) {
    const childPath = `${path}.${key}`;
    if (/^(raw_prompt|raw_prompt_text|raw_user_text|raw_response|raw_response_text|raw_customizer_samples|raw_mask_material|raw_sample|raw_samples|raw_text)$/iu.test(key) && hasRawValue(nested)) {
      const rawLabel = key.replace(/_/g, ' ');
      reasons.push(`${childPath} must not contain raw text (${rawLabel})`);
    }
    if (/^(raw_prompt_exported|raw_response_exported|raw_customizer_samples_sent|raw_mask_material_sent|raw_request_exported|raw_response_exported)$/iu.test(key) && nested === true) reasons.push(`${childPath} indicates raw material in pair snapshot`);
    if (isObject(nested) || Array.isArray(nested)) reasons.push(...inspectRawSnapshot(nested, childPath));
  }
  return reasons;
}

function inspectRequiredSurfaces(packet = {}, options = {}) {
  const reasons = [];
  const warnings = [];
  if (!packet.pair_packet_id) reasons.push('pair_packet_id is required');
  if (containsShi(packet.pair_packet_id)) reasons.push('pair_packet_id must not use SHI');
  if (packet.pair_packet_id && !isContractLogPairPacketId(packet.pair_packet_id)) reasons.push('pair_packet_id must match TD613-HUSH-PAIR-YYYYMMDD-XXXXXXXX');

  if (!packet.linked_contract) reasons.push('linked_contract is required');
  const contractId = getPath(packet, 'linked_contract.contract_packet_id');
  const contractHash = getPath(packet, 'linked_contract.contract_packet_hash_sha256');
  if (!contractId) reasons.push('linked_contract.contract_packet_id is required');
  if (containsShi(contractId)) reasons.push('linked_contract.contract_packet_id must not use SHI');
  if (contractId && !CONTRACT_ID.test(String(contractId).toUpperCase())) reasons.push('linked_contract.contract_packet_id is malformed');
  if (!isSha256(contractHash)) reasons.push('linked_contract.contract_packet_hash_sha256 is not sha256:<64_hex>');
  if (getPath(packet, 'linked_contract.contract_validation_status') !== 'pass' && getPath(packet, 'pair_release_discipline.release_class') !== 'blocked') warnings.push('linked contract validation did not pass');

  if (!packet.linked_provider_log) reasons.push('linked_provider_log is required');
  const providerId = getPath(packet, 'linked_provider_log.provider_log_packet_id');
  const providerLogLinkedContractId = getPath(packet, 'linked_provider_log.provider_log_linked_contract_packet_id');
  const providerLogLinkedContractHash = getPath(packet, 'linked_provider_log.provider_log_linked_contract_hash_sha256');
  if (!providerId) reasons.push('linked_provider_log.provider_log_packet_id is required');
  if (containsShi(providerId)) reasons.push('linked_provider_log.provider_log_packet_id must not use SHI');
  if (providerId && !PROVIDER_ID.test(String(providerId).toUpperCase())) reasons.push('linked_provider_log.provider_log_packet_id is malformed');
  if (!isSha256(getPath(packet, 'linked_provider_log.provider_log_packet_hash_sha256'))) reasons.push('linked_provider_log.provider_log_packet_hash_sha256 is not sha256:<64_hex>');
  if (providerLogLinkedContractId && contractId && providerLogLinkedContractId !== contractId) reasons.push('linked provider log contract id does not match linked contract');
  if (providerLogLinkedContractHash && contractHash && providerLogLinkedContractHash !== contractHash) reasons.push('linked provider log contract hash does not match linked contract');
  if (getPath(packet, 'linked_provider_log.provider_log_validation_status') !== 'pass' && getPath(packet, 'pair_release_discipline.release_class') !== 'blocked') warnings.push('linked provider log validation did not pass');

  if (!packet.contract_snapshot) reasons.push('contract_snapshot is required');
  if (!packet.provider_log_snapshot) reasons.push('provider_log_snapshot is required');
  if (!packet.comparison_result) reasons.push('comparison_result is required');
  if (!packet.claim_limits) reasons.push('claim_limits are required');
  for (const [key, value] of Object.entries(HUSH_CONTRACT_LOG_PAIR_CLAIM_LIMITS)) if (packet.claim_limits && packet.claim_limits[key] !== value) reasons.push(`claim limit missing or false: ${key}`);
  if (!packet.pair_release_discipline) reasons.push('pair_release_discipline is required');
  const releaseClass = getPath(packet, 'pair_release_discipline.release_class');
  if (!RELEASE_CLASSES.includes(releaseClass)) reasons.push('pair_release_discipline.release_class is invalid');
  if (releaseClass === 'blocked' && options.allowBlocked !== true) reasons.push('blocked pair packet cannot be imported as valid');

  reasons.push(...inspectRawSnapshot(packet.contract_snapshot || {}, 'contract_snapshot'));
  reasons.push(...inspectRawSnapshot(packet.provider_log_snapshot || {}, 'provider_log_snapshot'));
  if (FORBIDDEN_PROOF.test(body(overclaimSurface(packet)))) reasons.push('pair packet cannot claim final proof of identity, output quality, stylometric authenticity, provider intent, counterfeit status, or EO-RFD firmware');
  if (getPath(packet, 'eo_rfd_route_comparison.status') === 'firmware-claim-blocked') warnings.push('EO-RFD route comparison blocked firmware claim');
  if (getPath(packet, 'provider_target_comparison.status') && getPath(packet, 'provider_target_comparison.status') !== 'aligned') warnings.push('provider target comparison requires review');
  if (getPath(packet, 'comparison_result.status') === 'not-comparable') warnings.push('comparison has not-comparable surfaces');
  if (getPath(packet, 'stylometry_audit_routing.status') === 'audit-required') warnings.push('stylometry audit required');
  if (getPath(packet, 'adversarial_audit_routing.status') === 'audit-required') warnings.push('adversarial audit required');
  return { reasons, warnings };
}

export function validateContractLogPairShape(packet = {}, options = {}) {
  const refusal_reasons = [];
  const warnings = [];
  if (!isObject(packet)) refusal_reasons.push('packet is not an object');
  if (packet.schema_version !== HUSH_CONTRACT_LOG_PAIR_SCHEMA) refusal_reasons.push(`schema_version must be ${HUSH_CONTRACT_LOG_PAIR_SCHEMA}`);
  if (packet.packet_version !== HUSH_CONTRACT_LOG_PAIR_VERSION) warnings.push('packet_version differs from current contract-log pair version');
  if (packet.packet_class !== HUSH_CONTRACT_LOG_PAIR_CLASS) refusal_reasons.push(`packet_class must be ${HUSH_CONTRACT_LOG_PAIR_CLASS}`);
  refusal_reasons.push(...inspectHashFormats(packet));
  const families = classifyContractLogPairPacket(packet);
  if (families.includes('packet-hash-bearing') && families.length === 1) refusal_reasons.push('hash-only contract-log pair is not enough to compare or route');
  const surfaces = inspectRequiredSurfaces(packet, options);
  refusal_reasons.push(...surfaces.reasons);
  warnings.push(...surfaces.warnings);
  return Object.freeze({ schema_version: 'td613.hush.contract-log-pair-validation/v1', validator_mode: 'shape-only', status: refusal_reasons.length ? 'blocked' : 'pass', packet_schema: HUSH_CONTRACT_LOG_PAIR_SCHEMA, pair_packet_id: packet.pair_packet_id || null, release_class: getPath(packet, 'pair_release_discipline.release_class') || 'unknown', authority_families: families, claim_limits: HUSH_CONTRACT_LOG_PAIR_CLAIM_LIMITS, refusal_reasons: unique(refusal_reasons), warnings: unique(warnings) });
}

export async function recomputeContractLogPairHashes(packet = {}) {
  const preimage = contractLogPairPacketHashPreimage(packet);
  const expectedTopology = await buildContractLogPairHashTopology(preimage);
  const expectedPacketHash = await sha256Text(stableStringify({ ...preimage, hash_topology: expectedTopology }));
  const declared = {
    linked_contract_hash_sha256: getPath(packet, 'hash_topology.linked_contract_hash_sha256'),
    linked_provider_log_hash_sha256: getPath(packet, 'hash_topology.linked_provider_log_hash_sha256'),
    contract_snapshot_hash_sha256: getPath(packet, 'hash_topology.contract_snapshot_hash_sha256'),
    provider_log_snapshot_hash_sha256: getPath(packet, 'hash_topology.provider_log_snapshot_hash_sha256'),
    comparison_surfaces_hash_sha256: getPath(packet, 'hash_topology.comparison_surfaces_hash_sha256'),
    comparison_result_hash_sha256: getPath(packet, 'hash_topology.comparison_result_hash_sha256'),
    policy_hash_sha256: getPath(packet, 'hash_topology.policy_hash_sha256'),
    top_level_packet_hash_sha256: packet.packet_hash_sha256,
    topology_packet_hash_sha256: getPath(packet, 'hash_topology.packet_hash_sha256')
  };
  const pairs = [
    ['linked_contract_hash_sha256', expectedTopology.linked_contract_hash_sha256, 'linked contract hash mismatch'],
    ['linked_provider_log_hash_sha256', expectedTopology.linked_provider_log_hash_sha256, 'linked provider log hash mismatch'],
    ['contract_snapshot_hash_sha256', expectedTopology.contract_snapshot_hash_sha256, 'contract snapshot hash mismatch'],
    ['provider_log_snapshot_hash_sha256', expectedTopology.provider_log_snapshot_hash_sha256, 'provider log snapshot hash mismatch'],
    ['comparison_surfaces_hash_sha256', expectedTopology.comparison_surfaces_hash_sha256, 'comparison surfaces hash mismatch'],
    ['comparison_result_hash_sha256', expectedTopology.comparison_result_hash_sha256, 'comparison result hash mismatch'],
    ['policy_hash_sha256', expectedTopology.policy_hash_sha256, 'policy hash mismatch']
  ];
  const refusal_reasons = [];
  for (const [key, expected, message] of pairs) if (declared[key] !== expected) refusal_reasons.push(message);
  if (declared.top_level_packet_hash_sha256 !== expectedPacketHash) refusal_reasons.push('packet hash replay mismatch');
  if (declared.topology_packet_hash_sha256 !== expectedPacketHash) refusal_reasons.push('topology packet hash replay mismatch');
  if (declared.top_level_packet_hash_sha256 && declared.topology_packet_hash_sha256 && declared.top_level_packet_hash_sha256 !== declared.topology_packet_hash_sha256) refusal_reasons.push('packet hash locations disagree');
  return Object.freeze({ schema_version: 'td613.hush.contract-log-pair-hash-replay/v1', status: refusal_reasons.length ? 'blocked' : 'pass', matches: refusal_reasons.length === 0, declared, expected: { ...expectedTopology, packet_hash_sha256: expectedPacketHash }, refusal_reasons });
}

export async function validateContractLogPair(packet = {}, options = {}) {
  const base = validateContractLogPairShape(packet, options);
  if (base.status === 'blocked') return base;
  let replay;
  try { replay = await recomputeContractLogPairHashes(packet); }
  catch (error) {
    return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: 'blocked', hash_replay: { status: 'blocked', error: String(error && error.message ? error.message : error) }, refusal_reasons: unique([...base.refusal_reasons, 'could not recompute contract-log pair hashes']) });
  }
  const refusal_reasons = unique([...base.refusal_reasons, ...replay.refusal_reasons]);
  return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: refusal_reasons.length ? 'blocked' : 'pass', hash_replay: replay, refusal_reasons });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_CONTRACT_LOG_PAIR_VALIDATOR = Object.freeze({ isSha256, isContractLogPairPacket, classifyContractLogPairPacket, validateContractLogPairShape, recomputeContractLogPairHashes, validateContractLogPair });
}
