import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';
import { validateOutgoingContract } from './hush-outgoing-contract-validator.js';
import { validateProviderLog } from './hush-provider-log-validator.js';
import {
  compareProviderTarget,
  compareDispatch,
  comparePayload,
  comparePrivacy,
  compareRefusal,
  compareSafety,
  compareRelease,
  routeStylometryAudit,
  routeAdversarialAudit,
  compareEoRfdRoute,
  aggregateContractLogComparison
} from './hush-contract-log-comparator.js';

export const HUSH_CONTRACT_LOG_PAIR_SCHEMA = 'td613.hush.contract-log-pair/v1';
export const HUSH_CONTRACT_LOG_PAIR_VERSION = 'hush-contract-log-pair/v1-provider-boundary-comparison';
export const HUSH_CONTRACT_LOG_PAIR_CLASS = 'contract-provider-event-comparison';

export const HUSH_CONTRACT_LOG_PAIR_CLAIM_LIMITS = Object.freeze({
  schema_version: 'td613.hush.contract-log-pair-claim-limits/v1',
  not_identity_proof: true,
  not_authorship_ownership_proof: true,
  not_third_party_consent: true,
  not_impersonation_authorization: true,
  not_output_quality_proof: true,
  not_stylometric_authenticity_proof: true,
  not_provider_intent_proof: true,
  not_raw_corpus_export_clearance: true,
  comparison_not_final_audit: true,
  stylometry_required_for_voice_claim: true,
  adversarial_required_for_counterfeit_claim: true
});

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }
function datePart(value) { return String(value || new Date().toISOString()).slice(0, 10).replace(/-/g, ''); }

export function containsShi(value) { return /TD613-SH-|SHI#:/iu.test(String(value || '')); }
export function isContractLogPairPacketId(value) { return /^TD613-HUSH-PAIR-\d{8}-[A-F0-9]{8}$/u.test(String(value || '').trim().toUpperCase()); }

export function contractLogPairPacketHashPreimage(packet = {}) {
  const material = clone(packet || {});
  delete material.packet_hash_sha256;
  if (material.hash_topology) delete material.hash_topology.packet_hash_sha256;
  return material;
}

function linkedContract(contract = {}, validation = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.pair-linked-contract/v1',
    contract_packet_id: contract.contract_packet_id || null,
    contract_packet_hash_sha256: contract.packet_hash_sha256 || null,
    contract_schema_version: contract.schema_version || null,
    contract_release_class: getPath(contract, 'release_discipline.release_class') || null,
    contract_validation_status: validation.status || 'unavailable'
  });
}

function linkedProviderLog(providerLog = {}, validation = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.pair-linked-provider-log/v1',
    provider_log_packet_id: providerLog.provider_log_packet_id || null,
    provider_log_packet_hash_sha256: providerLog.packet_hash_sha256 || null,
    provider_log_schema_version: providerLog.schema_version || null,
    provider_log_release_class: getPath(providerLog, 'provider_log_release_discipline.release_class') || null,
    provider_log_validation_status: validation.status || 'unavailable'
  });
}

function contractSnapshot(contract = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.contract-comparison-snapshot/v1',
    provider_target: clone(contract.provider_target || {}),
    mask_context: clone(contract.mask_context || {}),
    instruction_contract: Object.freeze({
      expected_output_class: getPath(contract, 'instruction_contract.expected_output_class') || null,
      raw_prompt_exported: getPath(contract, 'instruction_contract.raw_prompt_exported') === true,
      forbidden_transformations: asArray(getPath(contract, 'instruction_contract.forbidden_transformations'))
    }),
    private_text_policy: clone(contract.private_text_policy || {}),
    refusal_policy: clone(contract.refusal_policy || {}),
    claim_limits: clone(contract.claim_limits || {}),
    release_discipline: clone(contract.release_discipline || {}),
    stylometry_constraints: clone(contract.stylometry_constraints || {}),
    adversarial_constraints: clone(contract.adversarial_constraints || {}),
    eo_rfd_route_state: clone(contract.eo_rfd_route_state || {})
  });
}

function providerLogSnapshot(providerLog = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.provider-log-comparison-snapshot/v1',
    provider_target_observed: clone(providerLog.provider_target_observed || {}),
    dispatch_observation: clone(providerLog.dispatch_observation || {}),
    request_payload_observation: clone(providerLog.request_payload_observation || {}),
    response_observation: clone(providerLog.response_observation || {}),
    refusal_observation: clone(providerLog.refusal_observation || {}),
    redaction_profile: clone(providerLog.redaction_profile || {}),
    safety_event_profile: clone(providerLog.safety_event_profile || {}),
    stylometry_observation_seed: clone(providerLog.stylometry_observation_seed || {}),
    adversarial_observation_seed: clone(providerLog.adversarial_observation_seed || {}),
    eo_rfd_route_observation: clone(providerLog.eo_rfd_route_observation || {}),
    provider_log_release_discipline: clone(providerLog.provider_log_release_discipline || {}),
    claim_limits: clone(providerLog.claim_limits || {})
  });
}

function buildComparisons(contract = {}, providerLog = {}) {
  const providerTarget = compareProviderTarget(contract, providerLog);
  const dispatch = compareDispatch(contract, providerLog);
  const payload = comparePayload(contract, providerLog);
  const privacy = comparePrivacy(contract, providerLog);
  const refusal = compareRefusal(contract, providerLog);
  const safety = compareSafety(contract, providerLog);
  const stylometry = routeStylometryAudit(contract, providerLog);
  const adversarial = routeAdversarialAudit(contract, providerLog);
  const eo = compareEoRfdRoute(contract, providerLog);
  const release = compareRelease(contract, providerLog, [providerTarget.status, dispatch.status, payload.status, privacy.status, refusal.status, safety.status, eo.status]);
  const surfaces = { provider_target_comparison: providerTarget, dispatch_comparison: dispatch, payload_comparison: payload, privacy_comparison: privacy, refusal_comparison: refusal, safety_comparison: safety, release_comparison: release, stylometry_audit_routing: stylometry, adversarial_audit_routing: adversarial, eo_rfd_route_comparison: eo };
  return Object.freeze({ ...surfaces, comparison_result: aggregateContractLogComparison(surfaces) });
}

function pairReleaseDiscipline(comparisonResult = {}, comparisons = {}, options = {}) {
  let releaseClass = 'audit-route-ready';
  if (comparisonResult.status === 'breach-detected') releaseClass = 'breach-review';
  else if (comparisonResult.status === 'blocked') releaseClass = 'blocked';
  else if (comparisonResult.status === 'not-comparable' || comparisonResult.status === 'review-required' || comparisonResult.status === 'drift-detected') releaseClass = 'pair-review';
  if (options.localOnly) releaseClass = 'pair-local';
  if (options.blocked) releaseClass = 'blocked';
  const auditRoutes = asArray(comparisonResult.audit_routes);
  const operator_next_action = releaseClass === 'blocked' ? 'block' : releaseClass === 'breach-review' ? 'review-privacy' : auditRoutes.includes('stylometry') ? 'run-stylometry-audit' : auditRoutes.includes('adversarial') ? 'run-adversarial-audit' : releaseClass === 'pair-review' ? 'review-provider-drift' : 'archive';
  return Object.freeze({ schema_version: 'td613.hush.contract-log-pair-release/v1', release_class: releaseClass, operator_next_action, warnings: [...new Set([...(asArray(comparisonResult.review_reasons)), ...(asArray(comparisonResult.blocking_reasons))])] });
}

export async function buildContractLogPairHashTopology(packetWithoutHash = {}) {
  const comparisonSurfaces = {
    provider_target_comparison: packetWithoutHash.provider_target_comparison || {},
    dispatch_comparison: packetWithoutHash.dispatch_comparison || {},
    payload_comparison: packetWithoutHash.payload_comparison || {},
    privacy_comparison: packetWithoutHash.privacy_comparison || {},
    refusal_comparison: packetWithoutHash.refusal_comparison || {},
    safety_comparison: packetWithoutHash.safety_comparison || {},
    release_comparison: packetWithoutHash.release_comparison || {},
    stylometry_audit_routing: packetWithoutHash.stylometry_audit_routing || {},
    adversarial_audit_routing: packetWithoutHash.adversarial_audit_routing || {},
    eo_rfd_route_comparison: packetWithoutHash.eo_rfd_route_comparison || {}
  };
  return Object.freeze({
    schema_version: 'td613.hush.contract-log-pair-hash-topology/v1',
    linked_contract_hash_sha256: await hashObject(packetWithoutHash.linked_contract || {}),
    linked_provider_log_hash_sha256: await hashObject(packetWithoutHash.linked_provider_log || {}),
    contract_snapshot_hash_sha256: await hashObject(packetWithoutHash.contract_snapshot || {}),
    provider_log_snapshot_hash_sha256: await hashObject(packetWithoutHash.provider_log_snapshot || {}),
    comparison_surfaces_hash_sha256: await hashObject(comparisonSurfaces),
    comparison_result_hash_sha256: await hashObject(packetWithoutHash.comparison_result || {}),
    policy_hash_sha256: await hashObject({ claim_limits: packetWithoutHash.claim_limits || {}, pair_release_discipline: packetWithoutHash.pair_release_discipline || {} })
  });
}

export async function buildContractLogPairPacket(input = {}, options = {}) {
  const contract = input.outgoing_contract_packet || input.outgoingContractPacket || input.contract_packet || input.contractPacket || {};
  const providerLog = input.provider_log_packet || input.providerLogPacket || input.log_packet || input.logPacket || {};
  const contractValidation = input.contract_validation || input.contractValidation || await validateOutgoingContract(contract, options.contractValidationOptions || {});
  const providerLogValidation = input.provider_log_validation || input.providerLogValidation || await validateProviderLog(providerLog, options.providerLogValidationOptions || {});
  const created = options.createdAt || input.created_at || input.createdAt || new Date().toISOString();
  const updated = options.updatedAt || input.updated_at || input.updatedAt || created;
  const comparisons = buildComparisons(contract, providerLog);
  const release = pairReleaseDiscipline(comparisons.comparison_result, comparisons, options);
  const idSeed = stableStringify({ created: options.stableId ? 'stable' : created, contract: contract.contract_packet_id, providerLog: providerLog.provider_log_packet_id, result: comparisons.comparison_result.status });
  const idHash = await sha256Text(idSeed);
  const pairId = input.pair_packet_id || input.pairPacketId || `TD613-HUSH-PAIR-${datePart(created)}-${idHash.slice(7, 15).toUpperCase()}`;
  const packetBase = {
    schema_version: HUSH_CONTRACT_LOG_PAIR_SCHEMA,
    packet_version: HUSH_CONTRACT_LOG_PAIR_VERSION,
    packet_class: HUSH_CONTRACT_LOG_PAIR_CLASS,
    pair_packet_id: pairId,
    created_at: created,
    updated_at: updated,
    linked_contract: linkedContract(contract, contractValidation),
    linked_provider_log: linkedProviderLog(providerLog, providerLogValidation),
    contract_snapshot: contractSnapshot(contract),
    provider_log_snapshot: providerLogSnapshot(providerLog),
    provider_target_comparison: comparisons.provider_target_comparison,
    dispatch_comparison: comparisons.dispatch_comparison,
    payload_comparison: comparisons.payload_comparison,
    privacy_comparison: comparisons.privacy_comparison,
    refusal_comparison: comparisons.refusal_comparison,
    safety_comparison: comparisons.safety_comparison,
    release_comparison: comparisons.release_comparison,
    stylometry_audit_routing: comparisons.stylometry_audit_routing,
    adversarial_audit_routing: comparisons.adversarial_audit_routing,
    eo_rfd_route_comparison: comparisons.eo_rfd_route_comparison,
    comparison_result: comparisons.comparison_result,
    claim_limits: HUSH_CONTRACT_LOG_PAIR_CLAIM_LIMITS,
    pair_release_discipline: release
  };
  const topology = await buildContractLogPairHashTopology(packetBase);
  const withTopology = { ...packetBase, hash_topology: topology };
  const packetHash = await sha256Text(stableStringify(withTopology));
  return Object.freeze({ ...withTopology, hash_topology: Object.freeze({ ...topology, packet_hash_sha256: packetHash }), packet_hash_sha256: packetHash });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_CONTRACT_LOG_PAIR_PACKET = Object.freeze({ HUSH_CONTRACT_LOG_PAIR_SCHEMA, HUSH_CONTRACT_LOG_PAIR_VERSION, HUSH_CONTRACT_LOG_PAIR_CLASS, HUSH_CONTRACT_LOG_PAIR_CLAIM_LIMITS, isSha256, containsShi, isContractLogPairPacketId, contractLogPairPacketHashPreimage, buildContractLogPairHashTopology, buildContractLogPairPacket });
}
