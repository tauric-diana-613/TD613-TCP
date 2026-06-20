import {
  HUSH_STYLOMETRY_AUDIT_SCHEMA,
  HUSH_STYLOMETRY_AUDIT_VERSION,
  HUSH_STYLOMETRY_AUDIT_CLASS,
  HUSH_STYLOMETRY_AUDIT_CLAIM_LIMITS,
  buildStylometryAuditHashTopology,
  stylometryAuditPacketHashPreimage,
  isStylometryAuditPacketId,
  containsShi
} from './hush-stylometry-audit-packet.js';
import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

const PAIR_ID = /^TD613-HUSH-PAIR-\d{8}-[A-F0-9]{8}$/u;
const PROFILE_ID = /^TD613-HUSH-STYLO-PROFILE-\d{8}-[A-F0-9]{8}$/u;
const RELEASE_CLASSES = Object.freeze(['release-safe', 'operator-review', 'revise-before-release', 'block-release', 'insufficient-evidence']);
const HIGH_RISKS = new Set(['high', 'severe']);
const FORBIDDEN_PROOF = /identity\s+(?:confirmed|proven|proof)|authorship\s+(?:confirmed|proven|proof)|legal\s+authorship\s+(?:confirmed|proven|proof)|civil\s+identity\s+(?:confirmed|proven|proof)|output\s+quality\s+(?:confirmed|proven|proof)|whistleblower\s+truth\s+(?:confirmed|proven|proof)|stylometric\s+authenticity\s+(?:confirmed|proven|proof)|voice\s+authentic|unforgeable\s+voice|perfect\s+match/iu;

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function body(value) { return JSON.stringify(value || {}); }
function hasRawValue(value) { return value === true || (typeof value === 'string' && value.trim().length > 0) || (Array.isArray(value) && value.length > 0) || (isObject(value) && Object.keys(value).length > 0); }
function overclaimSurface(packet = {}) {
  return {
    cadence: packet.cadence_alignment?.interpretation,
    pressure_notes: packet.pressure_preservation?.notes,
    flattening_patterns: packet.flattening_detection?.detected_patterns,
    constraint_notes: packet.constraint_preservation?.notes,
    release_reasons: packet.release_recommendation?.reasons
  };
}

export function isStylometryAuditPacket(value) {
  return Boolean(value && value.schema_version === HUSH_STYLOMETRY_AUDIT_SCHEMA && value.packet_class === HUSH_STYLOMETRY_AUDIT_CLASS);
}

export function classifyStylometryAuditPacket(packet = {}) {
  const families = [];
  if (isStylometryAuditPacket(packet)) families.push('stylometry-audit-v1');
  if (isSha256(packet.packet_hash_sha256)) families.push('packet-hash-bearing');
  if (packet.linked_pair) families.push('linked-pair-bearing');
  if (packet.linked_customizer_profile) families.push('linked-profile-bearing');
  if (packet.audit_input_profile) families.push('audit-input-bearing');
  if (packet.metric_profile) families.push('metric-profile-bearing');
  if (packet.cadence_alignment) families.push('cadence-alignment-bearing');
  if (packet.risk_profile) families.push('risk-profile-bearing');
  if (packet.release_recommendation) families.push('release-recommendation-bearing');
  return unique(families);
}

function inspectHashFormats(packet = {}) {
  const reasons = [];
  if (!isSha256(packet.packet_hash_sha256)) reasons.push('packet_hash_sha256 is not sha256:<64_hex>');
  const topology = packet.hash_topology || {};
  ['linked_pair_hash_sha256', 'linked_profile_hash_sha256', 'audit_input_profile_hash_sha256', 'metric_profile_hash_sha256', 'cadence_alignment_hash_sha256', 'pressure_preservation_hash_sha256', 'flattening_detection_hash_sha256', 'constraint_preservation_hash_sha256', 'risk_profile_hash_sha256', 'release_recommendation_hash_sha256', 'policy_hash_sha256', 'packet_hash_sha256'].forEach((key) => {
    if (!isSha256(topology[key])) reasons.push(`hash_topology.${key} is not sha256:<64_hex>`);
  });
  return reasons;
}

function inspectRawText(value, path = 'packet') {
  const reasons = [];
  if (!isObject(value) && !Array.isArray(value)) return reasons;
  for (const [key, nested] of Object.entries(value || {})) {
    const childPath = `${path}.${key}`;
    if (/^(raw_text|rawText|responseTextLocal|response_text_local|raw_response|raw_response_text|raw_sample|raw_samples|sample_text|sampleText|raw_customizer_samples|raw_mask_material)$/u.test(key) && hasRawValue(nested)) reasons.push(`${childPath} must not contain raw text`);
    if (/^(raw_text_stored_in_packet|raw_response_exported|raw_samples_printed|sample_matches_printed)$/u.test(key) && nested === true) reasons.push(`${childPath} indicates raw text exposure`);
    if (isObject(nested) || Array.isArray(nested)) reasons.push(...inspectRawText(nested, childPath));
  }
  return reasons;
}

function inspectRequiredSurfaces(packet = {}, options = {}) {
  const reasons = [];
  const warnings = [];
  if (!packet.stylometry_audit_packet_id) reasons.push('stylometry_audit_packet_id is required');
  if (containsShi(packet.stylometry_audit_packet_id)) reasons.push('stylometry_audit_packet_id must not use SHI');
  if (packet.stylometry_audit_packet_id && !isStylometryAuditPacketId(packet.stylometry_audit_packet_id)) reasons.push('stylometry_audit_packet_id must match TD613-HUSH-STYLO-YYYYMMDD-XXXXXXXX');

  if (!packet.linked_pair) reasons.push('linked_pair is required');
  const pairId = getPath(packet, 'linked_pair.pair_packet_id');
  if (!pairId) reasons.push('linked_pair.pair_packet_id is required');
  if (containsShi(pairId)) reasons.push('linked_pair.pair_packet_id must not use SHI');
  if (pairId && !PAIR_ID.test(String(pairId).toUpperCase())) reasons.push('linked_pair.pair_packet_id is malformed');
  if (!isSha256(getPath(packet, 'linked_pair.pair_packet_hash_sha256'))) reasons.push('linked_pair.pair_packet_hash_sha256 is not sha256:<64_hex>');
  if (getPath(packet, 'linked_pair.pair_validation_status') !== 'pass' && getPath(packet, 'release_recommendation.release_class') !== 'block-release') reasons.push('linked pair validation must pass unless audit blocks release');

  if (!packet.linked_customizer_profile) reasons.push('linked_customizer_profile is required');
  const profileId = getPath(packet, 'linked_customizer_profile.stylometry_profile_id');
  if (profileId && containsShi(profileId)) reasons.push('linked_customizer_profile.stylometry_profile_id must not use SHI');
  if (profileId && !PROFILE_ID.test(String(profileId).toUpperCase())) warnings.push('stylometry profile id is noncanonical');
  if (!isSha256(getPath(packet, 'linked_customizer_profile.profile_hash_sha256'))) reasons.push('linked_customizer_profile.profile_hash_sha256 is not sha256:<64_hex>');

  ['audit_input_profile', 'metric_profile', 'cadence_alignment', 'pressure_preservation', 'flattening_detection', 'constraint_preservation', 'risk_profile', 'release_recommendation', 'claim_limits'].forEach((surface) => { if (!packet[surface]) reasons.push(`${surface} is required`); });
  if (packet.claim_limits) for (const [key, value] of Object.entries(HUSH_STYLOMETRY_AUDIT_CLAIM_LIMITS)) if (packet.claim_limits[key] !== value) reasons.push(`claim limit missing or false: ${key}`);
  const releaseClass = getPath(packet, 'release_recommendation.release_class');
  if (!RELEASE_CLASSES.includes(releaseClass)) reasons.push('release_recommendation.release_class is invalid');

  if (getPath(packet, 'release_recommendation.public_release_allowed') === true) {
    const identifiability = getPath(packet, 'risk_profile.unsafe_identifiability_risk');
    const overfit = getPath(packet, 'risk_profile.overfit_risk');
    if (HIGH_RISKS.has(identifiability)) reasons.push('public release cannot be allowed with high identifiability risk');
    if (HIGH_RISKS.has(overfit)) reasons.push('public release cannot be allowed with high overfit risk');
  }
  if (getPath(packet, 'audit_input_profile.audit_mode') === 'local-private-raw' && getPath(packet, 'release_recommendation.public_release_allowed') === true) reasons.push('local-private-raw audits cannot be public-release by default');

  reasons.push(...inspectRawText(packet));
  if (FORBIDDEN_PROOF.test(body(overclaimSurface(packet)))) reasons.push('stylometry audit cannot claim identity, authorship, legal, output-quality, whistleblower-truth, or voice-authenticity proof');
  if (getPath(packet, 'cadence_alignment.confidence') === 'insufficient') warnings.push('stylometry confidence is insufficient');
  if (getPath(packet, 'flattening_detection.release_impact') === 'review') warnings.push('flattening detection routes review');
  if (getPath(packet, 'risk_profile.operator_review_required') === true) warnings.push('operator review required by risk profile');
  return { reasons, warnings };
}

export function validateStylometryAuditShape(packet = {}, options = {}) {
  const refusal_reasons = [];
  const warnings = [];
  if (!isObject(packet)) refusal_reasons.push('packet is not an object');
  if (packet.schema_version !== HUSH_STYLOMETRY_AUDIT_SCHEMA) refusal_reasons.push(`schema_version must be ${HUSH_STYLOMETRY_AUDIT_SCHEMA}`);
  if (packet.packet_version !== HUSH_STYLOMETRY_AUDIT_VERSION) warnings.push('packet_version differs from current stylometry audit version');
  if (packet.packet_class !== HUSH_STYLOMETRY_AUDIT_CLASS) refusal_reasons.push(`packet_class must be ${HUSH_STYLOMETRY_AUDIT_CLASS}`);
  refusal_reasons.push(...inspectHashFormats(packet));
  const families = classifyStylometryAuditPacket(packet);
  if (families.includes('packet-hash-bearing') && families.length === 1) refusal_reasons.push('hash-only stylometry audit is not enough to audit or release');
  const surfaces = inspectRequiredSurfaces(packet, options);
  refusal_reasons.push(...surfaces.reasons);
  warnings.push(...surfaces.warnings);
  return Object.freeze({ schema_version: 'td613.hush.stylometry-audit-validation/v1', validator_mode: 'shape-only', status: refusal_reasons.length ? 'blocked' : 'pass', packet_schema: HUSH_STYLOMETRY_AUDIT_SCHEMA, stylometry_audit_packet_id: packet.stylometry_audit_packet_id || null, release_class: getPath(packet, 'release_recommendation.release_class') || 'unknown', authority_families: families, claim_limits: HUSH_STYLOMETRY_AUDIT_CLAIM_LIMITS, refusal_reasons: unique(refusal_reasons), warnings: unique(warnings) });
}

export async function recomputeStylometryAuditHashes(packet = {}) {
  const preimage = stylometryAuditPacketHashPreimage(packet);
  const expectedTopology = await buildStylometryAuditHashTopology(preimage);
  const expectedPacketHash = await sha256Text(stableStringify({ ...preimage, hash_topology: expectedTopology }));
  const declared = {
    linked_pair_hash_sha256: getPath(packet, 'hash_topology.linked_pair_hash_sha256'),
    linked_profile_hash_sha256: getPath(packet, 'hash_topology.linked_profile_hash_sha256'),
    audit_input_profile_hash_sha256: getPath(packet, 'hash_topology.audit_input_profile_hash_sha256'),
    metric_profile_hash_sha256: getPath(packet, 'hash_topology.metric_profile_hash_sha256'),
    cadence_alignment_hash_sha256: getPath(packet, 'hash_topology.cadence_alignment_hash_sha256'),
    pressure_preservation_hash_sha256: getPath(packet, 'hash_topology.pressure_preservation_hash_sha256'),
    flattening_detection_hash_sha256: getPath(packet, 'hash_topology.flattening_detection_hash_sha256'),
    constraint_preservation_hash_sha256: getPath(packet, 'hash_topology.constraint_preservation_hash_sha256'),
    risk_profile_hash_sha256: getPath(packet, 'hash_topology.risk_profile_hash_sha256'),
    release_recommendation_hash_sha256: getPath(packet, 'hash_topology.release_recommendation_hash_sha256'),
    policy_hash_sha256: getPath(packet, 'hash_topology.policy_hash_sha256'),
    top_level_packet_hash_sha256: packet.packet_hash_sha256,
    topology_packet_hash_sha256: getPath(packet, 'hash_topology.packet_hash_sha256')
  };
  const pairs = [
    ['linked_pair_hash_sha256', expectedTopology.linked_pair_hash_sha256, 'linked pair hash mismatch'],
    ['linked_profile_hash_sha256', expectedTopology.linked_profile_hash_sha256, 'linked profile hash mismatch'],
    ['audit_input_profile_hash_sha256', expectedTopology.audit_input_profile_hash_sha256, 'audit input profile hash mismatch'],
    ['metric_profile_hash_sha256', expectedTopology.metric_profile_hash_sha256, 'metric profile hash mismatch'],
    ['cadence_alignment_hash_sha256', expectedTopology.cadence_alignment_hash_sha256, 'cadence alignment hash mismatch'],
    ['pressure_preservation_hash_sha256', expectedTopology.pressure_preservation_hash_sha256, 'pressure preservation hash mismatch'],
    ['flattening_detection_hash_sha256', expectedTopology.flattening_detection_hash_sha256, 'flattening detection hash mismatch'],
    ['constraint_preservation_hash_sha256', expectedTopology.constraint_preservation_hash_sha256, 'constraint preservation hash mismatch'],
    ['risk_profile_hash_sha256', expectedTopology.risk_profile_hash_sha256, 'risk profile hash mismatch'],
    ['release_recommendation_hash_sha256', expectedTopology.release_recommendation_hash_sha256, 'release recommendation hash mismatch'],
    ['policy_hash_sha256', expectedTopology.policy_hash_sha256, 'policy hash mismatch']
  ];
  const refusal_reasons = [];
  for (const [key, expected, message] of pairs) if (declared[key] !== expected) refusal_reasons.push(message);
  if (declared.top_level_packet_hash_sha256 !== expectedPacketHash) refusal_reasons.push('packet hash replay mismatch');
  if (declared.topology_packet_hash_sha256 !== expectedPacketHash) refusal_reasons.push('topology packet hash replay mismatch');
  if (declared.top_level_packet_hash_sha256 && declared.topology_packet_hash_sha256 && declared.top_level_packet_hash_sha256 !== declared.topology_packet_hash_sha256) refusal_reasons.push('packet hash locations disagree');
  return Object.freeze({ schema_version: 'td613.hush.stylometry-audit-hash-replay/v1', status: refusal_reasons.length ? 'blocked' : 'pass', matches: refusal_reasons.length === 0, declared, expected: { ...expectedTopology, packet_hash_sha256: expectedPacketHash }, refusal_reasons });
}

export async function validateStylometryAudit(packet = {}, options = {}) {
  const base = validateStylometryAuditShape(packet, options);
  if (base.status === 'blocked') return base;
  let replay;
  try { replay = await recomputeStylometryAuditHashes(packet); }
  catch (error) {
    return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: 'blocked', hash_replay: { status: 'blocked', error: String(error && error.message ? error.message : error) }, refusal_reasons: unique([...base.refusal_reasons, 'could not recompute stylometry audit hashes']) });
  }
  const refusal_reasons = unique([...base.refusal_reasons, ...replay.refusal_reasons]);
  return Object.freeze({ ...base, validator_mode: 'shape-plus-replay', status: refusal_reasons.length ? 'blocked' : 'pass', hash_replay: replay, refusal_reasons });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_STYLOMETRY_AUDIT_VALIDATOR = Object.freeze({ isSha256, isStylometryAuditPacket, classifyStylometryAuditPacket, validateStylometryAuditShape, recomputeStylometryAuditHashes, validateStylometryAudit });
}
