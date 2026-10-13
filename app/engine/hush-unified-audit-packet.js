import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

export const HUSH_UNIFIED_AUDIT_SCHEMA = 'td613.hush.unified-audit-packet/v1';
export const HUSH_UNIFIED_AUDIT_PHASE = 'PHASE_6_UNIFIED_AUDIT_PACKET';
export const HUSH_UNIFIED_AUDIT_VERSION = 'hush-unified-audit/v1-contract-log-stylometry-phase5';

export const HUSH_UNIFIED_AUDIT_CLAIM_LIMITS = Object.freeze({
  not_identity_proof: true,
  not_authorship_proof: true,
  not_legal_authority: true,
  not_semantic_truth_proof: true,
  not_consciousness_proof: true,
  not_release_permission: true,
  not_validator_override: true,
  not_safe_harbor_override: true,
  not_hush_override: true,
  not_aperture_override: true
});

const STATUSES = Object.freeze(['clean', 'warned', 'blocked', 'repair_required', 'unresolved_witness', 'quarantine']);
const PROOFISH = /\b(identity|authorship|legal|semantic truth|consciousness|release|validator|safe harbor|hush|aperture|eo-rfd|residual|topology|acedit)\b[^.\n]{0,90}\b(proof|prove|proves|authority|override|permission|authorized|verified truth|verdict)\b|\b(proves?|authorizes?|overrides?|publishes?)\b[^.\n]{0,90}\b(identity|authorship|legal|truth|release|safe harbor|hush|aperture)\b/iu;
const CLAIM_BOUNDARY_KEYS = /^(forbidden_claims|forbiddenClaims|required_claim_ceiling|requiredClaimCeiling|claim_ceiling|claimCeiling|claim_limits|claimLimits|required_limits|requiredLimits|prohibited_claims|prohibitedClaims|blocked_effects|blockedEffects|disallowed_transformations|disallowedTransformations|allowed_effects|allowedEffects|non_goals|nonGoals|guardrails|authority_ceiling|authorityCeiling)$/u;
const NEGATED_PROOFISH = /\b(no|not|never|cannot|can't|must not|may not|does not|is not|without|forbidden|blocked|excluded|not_[a-z_]*proof|not-[a-z-]*proof)\b[^.\n]{0,90}\b(identity|authorship|legal|truth|proof|authority|override|permission|release|verdict)\b|\b(identity|authorship|legal|truth|proof|authority|override|permission|release|verdict)\b[^.\n]{0,90}\b(not|false|forbidden|blocked|excluded)\b/iu;
const RAW_KEYS = /^(raw_text|rawText|raw_private_text|rawPrivateText|raw_response|rawResponse|raw_response_text|rawResponseText|raw_training_text|rawTrainingText|raw_sample|raw_samples|rawSamples|sample_text|sampleText|private_codename|privateCodename)$/u;

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function nowIso(context = {}) { return context.created_at || context.createdAt || new Date().toISOString(); }
function datePart(value) { return String(value || new Date().toISOString()).slice(0, 10).replace(/-/g, ''); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function maybeHash(value) { return isSha256(value) ? value : null; }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }

function hasRawLeak(value, path = 'packet') {
  const leaks = [];
  if (!isObject(value) && !Array.isArray(value)) return leaks;
  for (const [key, child] of Object.entries(value || {})) {
    const childPath = `${path}.${key}`;
    if (RAW_KEYS.test(key) && child !== false && child !== null && child !== undefined && child !== '') leaks.push(childPath);
    if (/raw_.*included|raw.*Included|raw_.*exported|raw.*Exported/u.test(key) && child === true) leaks.push(childPath);
    if (isObject(child) || Array.isArray(child)) leaks.push(...hasRawLeak(child, childPath));
  }
  return leaks;
}

function inspectClaimSurface(value, path = 'packet') {
  const violations = [];
  if (typeof value === 'string') {
    const body = value.trim();
    if (body && PROOFISH.test(body) && !NEGATED_PROOFISH.test(body)) violations.push(`${path}: forbidden proof or authority language detected`);
    return violations;
  }
  if (!isObject(value) && !Array.isArray(value)) return violations;
  for (const [key, child] of Object.entries(value || {})) {
    if (CLAIM_BOUNDARY_KEYS.test(key)) continue;
    if (key === 'safe_harbor_handoff' || key === 'decision') continue;
    violations.push(...inspectClaimSurface(child, `${path}.${key}`));
  }
  return violations;
}

export function unifiedAuditPacketHashPreimage(packet = {}) {
  const material = clone(packet || {});
  delete material.packet_hash_sha256;
  delete material.safe_harbor_handoff;
  if (material.hash_replay) {
    material.hash_replay.packet_hash_sha256 = null;
    material.hash_replay.hash_topology_packet_hash_sha256 = null;
    material.hash_replay.packet_hashes_agree = false;
    material.hash_replay.recomputed_packet_hash_matches = false;
    material.hash_replay.status = 'not_run';
  }
  return material;
}

export function compareOutboundContractToProviderLog(contract = {}, log = {}) {
  const missing = [];
  const forbidden = [];
  const privacy = [];
  const release = [];
  const style = [];
  const format = [];
  const expectedSections = asArray(contract.expected_sections || contract.expectedSections);
  const observedSections = asArray(log.observed_sections || log.observedSections || log.response_sections || log.responseSections);
  for (const section of expectedSections) if (observedSections.length && !observedSections.includes(section)) missing.push(section);
  for (const claim of asArray(log.unauthorized_claims || log.unauthorizedClaims)) forbidden.push(claim);
  for (const risk of asArray(log.privacy_risks || log.privacyRisks)) privacy.push(risk);
  if (contract.release_status === 'private' && log.release_language_detected === true) release.push('release boundary changed');
  if (asArray(log.formatting_losses || log.formattingLosses).length) format.push(...asArray(log.formatting_losses || log.formattingLosses));
  if (asArray(log.style_drift || log.styleDrift).length) style.push(...asArray(log.style_drift || log.styleDrift));
  const rawLeak = log.raw_response_included === true || log.rawResponseIncluded === true;
  if (rawLeak) privacy.push('raw response included');
  let status = 'match';
  let severity = 'none';
  if (forbidden.length || rawLeak) { status = 'mismatch'; severity = 'high'; }
  else if (missing.length || privacy.length || release.length || style.length || format.length) { status = 'partial'; severity = missing.length || privacy.length ? 'medium' : 'low'; }
  if (!contract.contract_id && !contract.contract_packet_id) { status = 'unresolved'; severity = 'medium'; }
  return Object.freeze({
    schema: 'td613.hush.phase6.relational-comparison/v1',
    contract_log_match_status: status,
    missing_required_sections: missing,
    unexpected_sections: asArray(log.unexpected_sections || log.unexpectedSections),
    forbidden_claims_detected: forbidden,
    privacy_boundary_changes: unique(privacy),
    release_boundary_changes: unique(release),
    style_boundary_changes: unique(style),
    semantic_boundary_changes: asArray(log.semantic_boundary_changes || log.semanticBoundaryChanges),
    refusal_boundary_changes: asArray(log.refusal_boundary_changes || log.refusalBoundaryChanges),
    format_boundary_changes: unique(format),
    severity,
    repair_recommended: status !== 'match',
    repair_notes: status === 'match' ? [] : ['review contract/log comparison before registry or release routing']
  });
}

export function normalizeOutboundContract(contract = {}) {
  return Object.freeze({
    schema: 'td613.hush.phase6.outbound-contract/v1',
    contract_id: contract.contract_id || contract.contract_packet_id || contract.packet_id || null,
    contract_hash_sha256: maybeHash(contract.contract_hash_sha256 || contract.packet_hash_sha256 || contract.hash_sha256),
    task: contract.task || contract.request_kind || getPath(contract, 'request_context.request_kind') || 'unspecified',
    intended_output_type: contract.intended_output_type || getPath(contract, 'instruction_contract.expected_output_class') || 'unspecified',
    declared_mask: contract.declared_mask || getPath(contract, 'mask_context.mask_id') || null,
    declared_style_constraints: asArray(contract.declared_style_constraints || contract.declaredStyleConstraints),
    privacy_constraints: asArray(contract.privacy_constraints || contract.privacyConstraints || getPath(contract, 'private_text_policy.must_preserve')),
    forbidden_claims: asArray(contract.forbidden_claims || contract.forbiddenClaims || getPath(contract, 'instruction_contract.forbidden_transformations')),
    required_claim_ceiling: asArray(contract.required_claim_ceiling || contract.requiredClaimCeiling),
    release_status: contract.release_status || getPath(contract, 'release_discipline.release_class') || 'review',
    expected_sections: asArray(contract.expected_sections || contract.expectedSections),
    allowed_transformations: asArray(contract.allowed_transformations || contract.allowedTransformations),
    disallowed_transformations: asArray(contract.disallowed_transformations || contract.disallowedTransformations),
    user_intent_summary: contract.user_intent_summary || getPath(contract, 'instruction_contract.redacted_prompt_summary') || null
  });
}

export function normalizeProviderLog(log = {}) {
  return Object.freeze({
    schema: 'td613.hush.phase6.provider-log/v1',
    provider_log_id: log.provider_log_id || log.provider_log_packet_id || log.packet_id || null,
    provider_log_hash_sha256: maybeHash(log.provider_log_hash_sha256 || log.packet_hash_sha256 || log.hash_sha256),
    provider: log.provider || getPath(log, 'provider_target_observed.provider_name') || getPath(log, 'provider_target_observed.provider_class') || null,
    model: log.model || getPath(log, 'provider_target_observed.model_name') || null,
    request_id: log.request_id || getPath(log, 'provider_target_observed.provider_request_id') || null,
    response_id: log.response_id || getPath(log, 'provider_target_observed.provider_response_id') || null,
    response_timestamp: log.response_timestamp || log.created_at || null,
    response_ref: log.response_ref || getPath(log, 'response_observation.response_text_hash_sha256') || log.packet_hash_sha256 || null,
    raw_response_included: log.raw_response_included === true || log.rawResponseIncluded === true || getPath(log, 'response_observation.raw_response_exported') === true,
    response_summary: log.response_summary || getPath(log, 'response_observation.redacted_response_summary') || null,
    observed_deviations: asArray(log.observed_deviations || log.observedDeviations),
    refusal_markers: asArray(log.refusal_markers || log.refusalMarkers),
    omission_markers: asArray(log.omission_markers || log.omissionMarkers),
    substitution_markers: asArray(log.substitution_markers || log.substitutionMarkers),
    unauthorized_claims: asArray(log.unauthorized_claims || log.unauthorizedClaims),
    formatting_losses: asArray(log.formatting_losses || log.formattingLosses),
    privacy_risks: asArray(log.privacy_risks || log.privacyRisks)
  });
}

export function normalizeStylometryAudit(audit = {}) {
  const releaseClass = getPath(audit, 'release_recommendation.release_class') || audit.release_class || 'unresolved';
  const risk = audit.risk_profile || {};
  const cadence = audit.cadence_alignment || {};
  const blocked = releaseClass === 'block-release' || getPath(audit, 'claim_limits.not_identity_proof') === false || getPath(audit, 'claim_limits.not_authorship_ownership_proof') === false;
  const resultStatus = blocked ? 'block' : releaseClass === 'release-safe' ? 'pass' : releaseClass === 'operator-review' || releaseClass === 'revise-before-release' ? 'warn' : 'unresolved';
  return Object.freeze({
    schema: 'td613.hush.phase6.stylometry-audit/v1',
    stylometry_audit_id: audit.stylometry_audit_id || audit.stylometry_audit_packet_id || audit.packet_id || null,
    audit_hash_sha256: maybeHash(audit.audit_hash_sha256 || audit.packet_hash_sha256 || audit.hash_sha256),
    audit_mode: getPath(audit, 'audit_input_profile.audit_mode') || audit.audit_mode || 'unresolved',
    target_mask_ref: audit.target_mask_ref || getPath(audit, 'linked_customizer_profile.stylometry_profile_id') || null,
    comparison_refs: asArray(audit.comparison_refs || audit.comparisonRefs),
    features_used: asArray(audit.features_used || audit.featuresUsed || getPath(audit, 'metric_profile.metric_families')),
    raw_training_text_included: audit.raw_training_text_included === true || getPath(audit, 'audit_input_profile.raw_text_stored_in_packet') === true,
    result: Object.freeze({
      status: resultStatus,
      fidelity_score: cadence.overall_alignment_score ?? null,
      drift_score: audit.drift_score ?? null,
      flattening_risk: getPath(audit, 'flattening_detection.flattening_band') || 'unresolved',
      mimicry_risk: audit.mimicry_risk || 'unresolved',
      overfit_risk: risk.overfit_risk || 'unresolved',
      mask_leakage_risk: risk.private_cadence_exposure_risk || 'unresolved'
    }),
    claim_ceiling: Object.freeze({
      not_identity_proof: true,
      not_authorship_proof: true,
      not_legal_proof: true,
      not_release_permission: true
    }),
    notes: asArray(audit.notes)
  });
}

export function normalizePhase5InterfaceResult(result = {}) {
  if (!result || Object.keys(result).length === 0) return Object.freeze({
    schema: 'td613.hush.phase6.phase5-interface-record/v1',
    phase5_result_id: null,
    phase5_validation_status: 'not_present',
    source_family: 'none',
    signal_class: 'none',
    foundation_lane: 'none',
    recent_receipt_class: 'none',
    constants_bridge_status: 'not_applicable',
    register_translation_status: 'not_applicable',
    receipt_status: { deterministic_receipt_present: false, sealed_signal_receipt_present: false, hash_replay_status: 'unavailable', section_replay_status: 'unavailable' },
    allowed_effects: [],
    blocked_effects: [],
    refusal_receipt_ref: null,
    authority_ceiling_held: true
  });
  return Object.freeze({
    schema: 'td613.hush.phase6.phase5-interface-record/v1',
    phase5_result_id: result.phase5_result_id || result.id || null,
    phase5_validation_status: result.status || result.phase5_validation_status || 'warn',
    source_family: result.source_family || 'UNKNOWN',
    signal_class: result.signal_class || 'unknown',
    foundation_lane: result.foundation_lane || 'unresolved',
    recent_receipt_class: result.recent_receipt_class || 'unresolved',
    constants_bridge_status: getPath(result, 'constants_bridge.translation_status') || result.constants_bridge_status || 'not_applicable',
    register_translation_status: getPath(result, 'register_layer_translation.translation_confidence') || result.register_translation_status || 'not_applicable',
    receipt_status: result.receipt_status || { deterministic_receipt_present: false, sealed_signal_receipt_present: false, hash_replay_status: 'unavailable', section_replay_status: 'unavailable' },
    allowed_effects: asArray(result.allowed_effects),
    blocked_effects: asArray(result.blocked_effects),
    refusal_receipt_ref: result.refusal_receipt_ref || null,
    authority_ceiling_held: result.authority_ceiling_held !== false
  });
}

export function buildClaimCeiling(lanes = {}) {
  const violations = [];
  for (const [key, expected] of Object.entries(HUSH_UNIFIED_AUDIT_CLAIM_LIMITS)) if (lanes.claim_ceiling?.required_limits && lanes.claim_ceiling.required_limits[key] !== undefined && lanes.claim_ceiling.required_limits[key] !== expected) violations.push(key);
  violations.push(...inspectClaimSurface(lanes));
  return Object.freeze({
    schema: 'td613.hush.phase6.claim-ceiling/v1',
    active: true,
    violations: unique(violations),
    required_limits: HUSH_UNIFIED_AUDIT_CLAIM_LIMITS,
    status: violations.length ? 'broken' : 'held'
  });
}

export function decideUnifiedAuditPacketStatus(packet = {}) {
  const reasons = [];
  let packetStatus = 'clean';
  const hashStatus = getPath(packet, 'hash_replay.status');
  if (hashStatus === 'failed') { packetStatus = 'blocked'; reasons.push('hash replay failed'); }
  if (getPath(packet, 'claim_ceiling.status') === 'broken') { packetStatus = 'blocked'; reasons.push('claim ceiling broken'); }
  const rawLeaks = hasRawLeak(packet);
  if (rawLeaks.length && getPath(packet, 'custody.raw_private_text_policy') !== 'included_by_explicit_custody') { packetStatus = 'quarantine'; reasons.push('raw private text leakage without custody'); }
  if (getPath(packet, 'phase5_interface.phase5_validation_status') === 'block' && asArray(getPath(packet, 'phase5_interface.allowed_effects')).length) { packetStatus = 'blocked'; reasons.push('blocked Phase 5 signal attempted as authority'); }
  if (getPath(packet, 'relational_comparison.severity') === 'critical') { packetStatus = 'blocked'; reasons.push('critical contract/log mismatch'); }
  else if (packetStatus === 'clean' && ['high', 'medium'].includes(getPath(packet, 'relational_comparison.severity'))) { packetStatus = 'repair_required'; reasons.push('contract/log comparison requires repair'); }
  const stylo = getPath(packet, 'stylometry_audit.result') || {};
  if (packetStatus === 'clean' && stylo.status === 'block') { packetStatus = 'repair_required'; reasons.push('stylometry audit blocks release posture'); }
  if (packetStatus === 'clean' && ['high', 'severe'].includes(stylo.overfit_risk)) { packetStatus = 'repair_required'; reasons.push('stylometry high-risk route'); }
  if (packetStatus === 'clean' && getPath(packet, 'phase5_interface.phase5_validation_status') === 'warn') { packetStatus = 'unresolved_witness'; reasons.push('Phase 5 witness unresolved'); }
  if (packetStatus === 'clean' && (getPath(packet, 'relational_comparison.contract_log_match_status') === 'partial' || stylo.status === 'warn')) { packetStatus = 'warned'; reasons.push('bounded warning present'); }
  const custodyHandoffAllowed = ['clean', 'warned', 'repair_required', 'unresolved_witness', 'blocked', 'quarantine'].includes(packetStatus);
  return Object.freeze({
    schema: 'td613.hush.phase6.decision/v1',
    packet_status: STATUSES.includes(packetStatus) ? packetStatus : 'blocked',
    release_allowed: false,
    safe_harbor_custody_handoff_allowed: custodyHandoffAllowed,
    safe_harbor_handoff_allowed: custodyHandoffAllowed,
    mask_gallery_update_allowed: packetStatus === 'clean' || packetStatus === 'warned',
    repair_required: packetStatus === 'repair_required',
    quarantine_required: packetStatus === 'quarantine',
    operator_review_required: packetStatus !== 'clean',
    reasons: unique(reasons),
    next_phase_hint: 'Phase 7 may consume clean/warned audit status for mask registry only.'
  });
}

async function sectionHashes(packet = {}) {
  return Object.freeze({
    custody_hash_sha256: await hashObject(packet.custody || {}),
    outbound_contract_hash_sha256: await hashObject(packet.outbound_contract || {}),
    provider_log_hash_sha256: await hashObject(packet.provider_log || {}),
    stylometry_audit_hash_sha256: await hashObject(packet.stylometry_audit || {}),
    phase5_interface_hash_sha256: await hashObject(packet.phase5_interface || {}),
    relational_comparison_hash_sha256: await hashObject(packet.relational_comparison || {}),
    claim_ceiling_hash_sha256: await hashObject(packet.claim_ceiling || {}),
    decision_hash_sha256: await hashObject(packet.decision || {})
  });
}

export async function buildHashReplay(packetWithoutHashReplay = {}, legacyMode = false) {
  const sections = await sectionHashes(packetWithoutHashReplay);
  return Object.freeze({
    schema: 'td613.hush.phase6.hash-replay/v1',
    packet_hash_sha256: null,
    hash_topology_packet_hash_sha256: null,
    packet_hashes_agree: false,
    recomputed_packet_hash_matches: false,
    section_hashes: sections,
    section_replay_status: 'passed',
    hash_only_packet: false,
    hash_only_packet_blocked: true,
    legacy_reopen_mode: legacyMode,
    status: 'not_run'
  });
}

export async function buildHushUnifiedAuditPacket({ outboundContract = {}, providerLog = {}, stylometryAudit = {}, phase5InterfaceResult = {}, context = {} } = {}) {
  const created = nowIso(context);
  const outbound = normalizeOutboundContract(outboundContract);
  const provider = normalizeProviderLog(providerLog);
  const stylo = normalizeStylometryAudit(stylometryAudit);
  const phase5 = normalizePhase5InterfaceResult(phase5InterfaceResult);
  const custody = Object.freeze({
    schema: 'td613.hush.phase6.custody/v1',
    hush_packet_id: context.hush_packet_id || context.hushPacketId || null,
    td613_safe_harbor_id: context.td613_safe_harbor_id || null,
    source_packet_refs: asArray(context.source_packet_refs || context.sourcePacketRefs),
    legacy_packet_refs: asArray(context.legacy_packet_refs || context.legacyPacketRefs),
    created_by: context.created_by || 'system',
    sealed: false,
    public_default_allowed: false,
    raw_private_text_included: false,
    raw_private_text_policy: context.raw_private_text_policy || 'excluded',
    authority_ceiling_active: true
  });
  const relational = compareOutboundContractToProviderLog(outbound, provider);
  const claimCeiling = buildClaimCeiling({ custody, outbound_contract: outbound, provider_log: provider, stylometry_audit: stylo, phase5_interface: phase5, relational_comparison: relational });
  const idSeed = stableStringify({ created: context.stableId ? 'stable' : created, outbound: outbound.contract_id, provider: provider.provider_log_id, stylo: stylo.stylometry_audit_id, phase5: phase5.phase5_result_id });
  const idHash = await sha256Text(idSeed);
  const packetId = context.packet_id || context.packetId || `hush-audit-${datePart(created)}-${idHash.slice(7, 15)}`;
  const base = {
    schema: HUSH_UNIFIED_AUDIT_SCHEMA,
    phase: HUSH_UNIFIED_AUDIT_PHASE,
    packet_version: HUSH_UNIFIED_AUDIT_VERSION,
    packet_id: packetId,
    created_at: created,
    packet_status: 'clean',
    custody: { ...custody, hush_packet_id: packetId },
    outbound_contract: outbound,
    provider_log: provider,
    stylometry_audit: stylo,
    phase5_interface: phase5,
    relational_comparison: relational,
    claim_ceiling: claimCeiling,
    safe_harbor_handoff: null,
    operator_notes: Object.freeze({ notes: asArray(context.operator_notes || context.operatorNotes) }),
    decision: null
  };
  const provisionalDecision = decideUnifiedAuditPacketStatus({ ...base, hash_replay: { status: 'passed' }, decision: null });
  const withDecision = { ...base, packet_status: provisionalDecision.packet_status, decision: provisionalDecision };
  const hashReplay = await buildHashReplay(withDecision, Boolean(context.legacy_reopen_mode));
  const hashPreimage = { ...withDecision, hash_replay: hashReplay };
  const packetHash = await sha256Text(stableStringify(unifiedAuditPacketHashPreimage(hashPreimage)));
  const finalHashReplay = Object.freeze({ ...hashReplay, packet_hash_sha256: packetHash, hash_topology_packet_hash_sha256: packetHash, packet_hashes_agree: true, recomputed_packet_hash_matches: true, status: 'passed' });
  const safeHarbor = buildPhase6SafeHarborHandoff({ ...withDecision, hash_replay: finalHashReplay, packet_hash_sha256: packetHash });
  return Object.freeze({ ...withDecision, safe_harbor_handoff: safeHarbor, hash_replay: finalHashReplay, packet_hash_sha256: packetHash });
}

export async function replayUnifiedAuditPacketHashes(packet = {}) {
  const refusal_reasons = [];
  const preimage = unifiedAuditPacketHashPreimage(packet);
  const expectedSectionHashes = await sectionHashes(preimage);
  const declaredSections = getPath(packet, 'hash_replay.section_hashes') || {};
  for (const [key, expected] of Object.entries(expectedSectionHashes)) if (declaredSections[key] !== expected) refusal_reasons.push(`${key} mismatch`);
  const expectedPacketHash = await sha256Text(stableStringify(preimage));
  const top = packet.packet_hash_sha256 || null;
  const replayTop = getPath(packet, 'hash_replay.packet_hash_sha256') || null;
  const replayTopology = getPath(packet, 'hash_replay.hash_topology_packet_hash_sha256') || null;
  if (!isSha256(top)) refusal_reasons.push('packet_hash_sha256 malformed');
  if (!isSha256(replayTop)) refusal_reasons.push('hash_replay.packet_hash_sha256 malformed');
  if (!isSha256(replayTopology)) refusal_reasons.push('hash_replay.hash_topology_packet_hash_sha256 malformed');
  if (top !== expectedPacketHash) refusal_reasons.push('top-level packet hash mismatch');
  if (replayTop !== expectedPacketHash) refusal_reasons.push('hash replay packet hash mismatch');
  if (replayTopology !== expectedPacketHash) refusal_reasons.push('hash topology packet hash mismatch');
  if (top && replayTop && top !== replayTop) refusal_reasons.push('packet hash locations disagree');
  const families = [packet.schema, packet.outbound_contract && 'outbound', packet.provider_log && 'provider', packet.stylometry_audit && 'stylometry', packet.phase5_interface && 'phase5', packet.decision && 'decision'].filter(Boolean);
  if (isSha256(top) && families.length <= 1) refusal_reasons.push('hash-only unified audit packet blocked');
  return Object.freeze({
    schema: 'td613.hush.phase6.hash-replay-result/v1',
    status: refusal_reasons.length ? 'failed' : 'passed',
    refusal_reasons: unique(refusal_reasons),
    expected_packet_hash_sha256: expectedPacketHash,
    expected_section_hashes: expectedSectionHashes,
    packet_hashes_agree: top === replayTop && replayTop === replayTopology,
    hash_only_packet_blocked: true
  });
}

export function buildPhase6SafeHarborHandoff(packet = {}) {
  return Object.freeze({
    schema: 'td613.safeharbor.phase6-custody-handoff/v1',
    hush_unified_audit_packet_id: packet.packet_id || null,
    packet_hash_sha256: maybeHash(packet.packet_hash_sha256),
    packet_status: packet.packet_status || getPath(packet, 'decision.packet_status') || 'blocked',
    claim_ceiling_status: getPath(packet, 'claim_ceiling.status') || 'broken',
    hash_replay_status: getPath(packet, 'hash_replay.status') || 'not_run',
    release_allowed: false,
    raw_private_text_included: getPath(packet, 'custody.raw_private_text_included') === true,
    custody_facts_only: true,
    forbidden_claims_excluded: true
  });
}

export function buildPhase7MaskRegistryAuditSummary(packet = {}) {
  const status = packet.packet_status || getPath(packet, 'decision.packet_status') || 'blocked';
  return Object.freeze({
    schema: 'td613.hush.phase7.mask-registry-audit-summary/v1',
    hush_unified_audit_packet_id: packet.packet_id || null,
    packet_hash_sha256: maybeHash(packet.packet_hash_sha256),
    packet_status: status,
    stylometry_status: getPath(packet, 'stylometry_audit.result.status') || 'unresolved',
    mask_drift: getPath(packet, 'stylometry_audit.result.drift_score'),
    leakage_risk: getPath(packet, 'stylometry_audit.result.mask_leakage_risk') || 'unresolved',
    quarantine_status: status === 'quarantine' ? 'required' : 'not-required',
    repair_recommended: getPath(packet, 'decision.repair_required') === true,
    gallery_update_allowed: status === 'clean' || status === 'warned',
    raw_phase5_signal_authority_included: false
  });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_UNIFIED_AUDIT_PACKET = Object.freeze({ HUSH_UNIFIED_AUDIT_SCHEMA, HUSH_UNIFIED_AUDIT_PHASE, HUSH_UNIFIED_AUDIT_VERSION, HUSH_UNIFIED_AUDIT_CLAIM_LIMITS, buildHushUnifiedAuditPacket, compareOutboundContractToProviderLog, normalizeOutboundContract, normalizeProviderLog, normalizeStylometryAudit, normalizePhase5InterfaceResult, decideUnifiedAuditPacketStatus, replayUnifiedAuditPacketHashes, buildPhase6SafeHarborHandoff, buildPhase7MaskRegistryAuditSummary });
}
