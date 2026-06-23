import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';

export const PHASE5_SIGNAL_SCHEMA = 'td613.phase5.eorfd-interface-signal/v1';
export const PHASE5_VALIDATION_SCHEMA = 'td613.hush.phase5.validation-result/v1';
export const PHASE5_REFUSAL_RECEIPT_SCHEMA = 'td613.hush.phase5.refusal-receipt/v1';
export const PHASE5_SAFE_HARBOR_HANDOFF_SCHEMA = 'td613.safe-harbor.phase5.custody-handoff/v1';
export const PHASE5_COMPATIBILITY_SCHEMA = 'td613.hush.phase5.compatibility-reopen/v1';

export const PHASE5_SOURCE_FAMILIES = Object.freeze(['EO-RFD', 'ACEDIT', 'KIRA', 'VECTOR_RESIDUAL', 'TOPOLOGY', 'UNKNOWN']);
export const PHASE5_SIGNAL_CLASSES = Object.freeze(['rupture', 'layer', 'encoding', 'substrate', 'residual', 'topology', 'unknown']);
export const PHASE5_FOUNDATION_LANES = Object.freeze(['admissibility', 'projection', 'capacity', 'naming', 'rupture', 'temporal', 'geometry', 'residual', 'route', 'witness', 'harbor', 'packet', 'unresolved']);
export const PHASE5_RECEIPT_CLASSES = Object.freeze(['adapter', 'witness', 'receipt', 'extension', 'unresolved']);
export const PHASE5_ALLOWED_EFFECTS = Object.freeze(['warn', 'route_pressure', 'witness_note', 'adapter_preflight', 'audit_priority']);
export const PHASE5_FORBIDDEN_EFFECTS = Object.freeze(['release', 'validate', 'prove', 'identify', 'authorize', 'override', 'publish']);

export const PHASE5_CLAIM_CEILING = Object.freeze({
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

export const APERTURE_CANONICAL_CONSTANTS = Object.freeze({
  Z_C: 'sqrt(3)/2',
  fold_A: [0, 0],
  fold_B: [1, 0],
  fold_C: ['1/2', 'sqrt(3)/2'],
  theta: 'pi/3'
});

const AUTHORITY_OVERCLAIM = /\b(identity|authorship|legal|semantic truth|consciousness|release|validator|safe harbor|hush|aperture)\b[^.\n]{0,80}\b(proof|prove|proves|authority|override|permission|authorized|validates|sovereign)\b|\b(proves?|validates?|authorizes?|overrides?|publishes?)\b[^.\n]{0,80}\b(identity|authorship|legal|truth|consciousness|release|safe harbor|hush|aperture)\b/iu;
const RESIDUAL_OVERCLAIM = /residual[^.\n]{0,80}\b(proves?|proof|understanding|truth|soul|semantic truth)\b/iu;
const TOPOLOGY_OVERCLAIM = /topolog(?:y|ical)[^.\n]{0,80}\b(identity|author|authorship|consent|legal verdict|verdict)\b/iu;
const PRIVATE_CODENAME = /private[_\s-]*codename|codename[_\s-]*private|secret[_\s-]*codename|acedit[_\s-]*codename/iu;

function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function asArray(value) { return Array.isArray(value) ? value : []; }
function nowIso(context = {}) { return context.created_at || context.createdAt || new Date().toISOString(); }
function textOf(value) { return JSON.stringify(value || {}); }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function inspectNarrativeSurface(signal = {}) {
  return textOf({
    source_name: signal.source_name,
    operator_note: signal.operator_note,
    signal_note: signal.signal_note,
    payload_summary: signal.payload_summary,
    claims: signal.claims,
    assertions: signal.assertions,
    notes: signal.notes,
    warnings: signal.warnings,
    payload_preview: signal.payload_preview,
    private_codename: signal.private_codename,
    codename: signal.codename
  });
}

export function buildPhase5ConstantsBridge(signal = {}) {
  const constants = signal.constants_namespace || {};
  const source = signal.source_constants || {};
  const zcMeaning = constants.zc_meaning || source.Z_C || null;
  const declared = constants.declared === true;
  const usesZc = Boolean(zcMeaning || source.Z_C || /\bZ_C\b/u.test(inspectNarrativeSurface(signal)));
  const ambiguousZc = usesZc && !['sqrt3-over-2', 'aperture-canonical', 'firmware-local'].includes(String(zcMeaning || '').trim());
  const translationStatus = ambiguousZc || declared === false ? 'failed' : constants.requires_translation ? 'pending' : 'passed';
  return Object.freeze({
    schema: 'td613.phase5.constants-bridge/v1',
    aperture_canonical: APERTURE_CANONICAL_CONSTANTS,
    source_constants: Object.freeze({
      Z_C: source.Z_C || constants.Z_C || zcMeaning || null,
      TAU: source.TAU || constants.TAU || constants.tau_meaning || null,
      GAP: source.GAP || constants.GAP || constants.gap_meaning || null,
      layer_base: source.layer_base || constants.layer_base || null,
      register_offset: source.register_offset || constants.register_offset || null
    }),
    translation_status: translationStatus,
    symbol_collision_detected: ambiguousZc,
    hard_stop_on_ambiguity: true
  });
}

export function buildPhase5RegisterLayerTranslation(signal = {}) {
  const translation = signal.register_translation || {};
  const target = translation.target_layer || translation.target_td613_lane || signal.foundation_lane || 'unresolved';
  const confidence = translation.status === 'blocked' ? 'blocked' : translation.status === 'translated' ? 'bounded' : translation.translation_confidence || (PHASE5_FOUNDATION_LANES.includes(target) && target !== 'unresolved' ? 'bounded' : 'unresolved');
  const mayRoute = confidence !== 'blocked' && confidence !== 'unresolved' && PHASE5_FOUNDATION_LANES.includes(target) && target !== 'unresolved';
  return Object.freeze({
    schema: 'td613.phase5.register-layer-translation/v1',
    source_family: signal.source_family || 'UNKNOWN',
    source_layer_label: translation.source_layer || translation.source_layer_label || null,
    source_register_label: translation.source_register_label || translation.source_register || null,
    target_td613_lane: PHASE5_FOUNDATION_LANES.includes(target) ? target : 'unresolved',
    translation_confidence: confidence,
    translation_notes: asArray(translation.translation_notes || translation.notes),
    may_route: mayRoute
  });
}

function inspectClaimCeiling(signal = {}) {
  const reasons = [];
  const ceiling = signal.claim_ceiling || {};
  for (const [key, expected] of Object.entries(PHASE5_CLAIM_CEILING)) if (ceiling[key] !== expected) reasons.push(`claim ceiling missing or false: ${key}`);
  return reasons;
}

function inspectEffects(signal = {}) {
  const reasons = [];
  const warnings = [];
  for (const effect of asArray(signal.allowed_effects)) {
    if (!PHASE5_ALLOWED_EFFECTS.includes(effect)) warnings.push(`unrecognized allowed effect ignored: ${effect}`);
    if (PHASE5_FORBIDDEN_EFFECTS.includes(effect)) reasons.push(`forbidden effect requested as allowed: ${effect}`);
  }
  for (const effect of asArray(signal.forbidden_effects)) if (!PHASE5_FORBIDDEN_EFFECTS.includes(effect)) warnings.push(`unrecognized forbidden effect: ${effect}`);
  return { reasons, warnings };
}

function inspectReceipt(signal = {}) {
  const reasons = [];
  const warnings = [];
  const receipt = signal.receipt || {};
  if (receipt.hash_replay_status === 'failed') reasons.push('hash replay failed');
  if (receipt.section_replay_status === 'failed') reasons.push('section replay failed');
  if (!['passed', 'failed', 'not-run', 'unavailable'].includes(receipt.hash_replay_status)) warnings.push('hash replay status unavailable or malformed');
  if (!['passed', 'failed', 'not-run', 'unavailable'].includes(receipt.section_replay_status)) warnings.push('section replay status unavailable or malformed');
  if (receipt.hash_replay_status !== 'passed') warnings.push('hash replay not passed; routing limited');
  if (receipt.deterministic_receipt_present !== true && receipt.sealed_signal_receipt_present !== true) warnings.push('deterministic or sealed signal receipt missing');
  return { reasons, warnings };
}

export function validatePhase5EorfdInterfaceSignal(signal = {}, context = {}) {
  const reasons = [];
  const warnings = [];
  if (!isObject(signal)) reasons.push('signal is not an object');
  if (signal.schema !== PHASE5_SIGNAL_SCHEMA) reasons.push(`schema must be ${PHASE5_SIGNAL_SCHEMA}`);
  if (signal.phase !== 'PHASE_5_EO_RFD_INTERFACE_LAYER') reasons.push('phase must be PHASE_5_EO_RFD_INTERFACE_LAYER');
  if (!PHASE5_SOURCE_FAMILIES.includes(signal.source_family)) reasons.push('source_family is missing or unsupported');
  if (!PHASE5_SIGNAL_CLASSES.includes(signal.signal_class)) reasons.push('signal_class is missing or unsupported');
  if (!PHASE5_FOUNDATION_LANES.includes(signal.foundation_lane) || signal.foundation_lane === 'unresolved') warnings.push('foundation lane is missing or unresolved');
  if (!PHASE5_RECEIPT_CLASSES.includes(signal.recent_receipt_class)) warnings.push('recent_receipt_class is missing or unresolved');
  if (signal.authority_boundary !== 'signal-source-only') reasons.push('authority_boundary must be signal-source-only');
  if (signal.runtime_loaded !== false) reasons.push('runtime_loaded must be false');
  if (signal.runtime_executed !== false) reasons.push('runtime_executed must be false');
  if (signal.runtime_import_attempted === true || signal.eorfd_runtime_imported === true || signal.acedit_runtime_imported === true || signal.kira_runtime_imported === true) reasons.push('runtime import attempts are blocked in Phase 5');
  if (signal.raw_payload_included === true) reasons.push('raw_payload_included must be false');
  if (!signal.payload_ref) warnings.push('payload_ref missing; witness-only storage recommended');

  reasons.push(...inspectClaimCeiling(signal));
  const effects = inspectEffects(signal);
  reasons.push(...effects.reasons);
  warnings.push(...effects.warnings);
  const receipt = inspectReceipt(signal);
  reasons.push(...receipt.reasons);
  warnings.push(...receipt.warnings);

  const constantsBridge = buildPhase5ConstantsBridge(signal);
  if (constantsBridge.translation_status === 'failed' || constantsBridge.symbol_collision_detected) reasons.push('constants namespace unresolved or ambiguous');

  const registerLayerTranslation = buildPhase5RegisterLayerTranslation(signal);
  if (registerLayerTranslation.translation_confidence === 'blocked') reasons.push('register/layer translation is blocked');
  if (registerLayerTranslation.translation_confidence === 'unresolved') warnings.push('register/layer translation unresolved; routing disabled');

  const narrative = inspectNarrativeSurface(signal);
  if (AUTHORITY_OVERCLAIM.test(narrative)) reasons.push('signal claims authority, proof, release permission, or override');
  if (signal.signal_class === 'residual' && RESIDUAL_OVERCLAIM.test(narrative)) reasons.push('residual signal cannot prove understanding or truth');
  if (signal.signal_class === 'topology' && TOPOLOGY_OVERCLAIM.test(narrative)) reasons.push('topology signal cannot produce identity, consent, legal, or authorship verdicts');
  if (signal.source_family === 'ACEDIT' && PRIVATE_CODENAME.test(narrative)) reasons.push('ACEDIT private codename cannot enter public Phase 5 signal surface');

  const status = reasons.length ? 'block' : warnings.some((warning) => /foundation lane|receipt|replay not passed|unresolved|missing/iu.test(warning)) ? 'warn' : 'pass';
  const allowed = status === 'pass' ? asArray(signal.allowed_effects).filter((effect) => PHASE5_ALLOWED_EFFECTS.includes(effect)) : status === 'warn' ? ['witness_note'] : [];
  const blocked = [...PHASE5_FORBIDDEN_EFFECTS, ...(status === 'block' ? PHASE5_ALLOWED_EFFECTS : [])];
  return Object.freeze({
    schema: PHASE5_VALIDATION_SCHEMA,
    status,
    reasons: unique(reasons),
    warnings: unique(warnings),
    allowed_effects: unique(allowed),
    blocked_effects: unique(blocked),
    foundation_lane: PHASE5_FOUNDATION_LANES.includes(signal.foundation_lane) ? signal.foundation_lane : 'unresolved',
    signal_class: PHASE5_SIGNAL_CLASSES.includes(signal.signal_class) ? signal.signal_class : 'unknown',
    source_family: PHASE5_SOURCE_FAMILIES.includes(signal.source_family) ? signal.source_family : 'UNKNOWN',
    constants_bridge: constantsBridge,
    register_layer_translation: registerLayerTranslation,
    hash_replay_required: true,
    safe_harbor_handoff_allowed: status !== 'pass' ? false : true,
    release_allowed: false,
    authority_boundary: 'signal-source-only'
  });
}

export async function buildPhase5RefusalReceipt(signal = {}, reasons = [], context = {}) {
  const payloadRef = signal && signal.payload_ref ? String(signal.payload_ref) : '';
  return Object.freeze({
    schema: PHASE5_REFUSAL_RECEIPT_SCHEMA,
    created_at: nowIso(context),
    source_family: signal.source_family || 'UNKNOWN',
    signal_class: signal.signal_class || 'unknown',
    foundation_lane: signal.foundation_lane || 'unresolved',
    refusal_reasons: unique(reasons),
    payload_ref_hash_sha256: payloadRef ? await sha256Text(payloadRef) : null,
    raw_private_text_included: false,
    authority_ceiling_confirmed: true,
    release_allowed: false,
    runtime_loaded: false,
    runtime_executed: false
  });
}

export async function attachPhase5Signal(packet = {}, signal = {}, validationResult = null, context = {}) {
  const validation = validationResult || validatePhase5EorfdInterfaceSignal(signal, context);
  const originalHash = packet.packet_hash_sha256 || packet.hash_sha256 || packet.packet_hash || null;
  const sidecar = {
    schema: 'td613.hush.phase5.signal-attachment-sidecar/v1',
    created_at: nowIso(context),
    mode: 'sidecar-no-sealed-body-mutation',
    original_packet_id: packet.packet_id || packet.contract_packet_id || packet.provider_log_packet_id || packet.pair_packet_id || packet.stylometry_audit_packet_id || null,
    original_packet_hash_sha256: originalHash,
    validation_status: validation.status,
    release_allowed: false,
    phase5: {
      eorfdInterface: { signals: [] },
      unresolvedWitnessSignals: [],
      refusalReceipts: []
    }
  };
  if (validation.status === 'pass') sidecar.phase5.eorfdInterface.signals.push(clone(signal));
  else if (validation.status === 'warn') sidecar.phase5.unresolvedWitnessSignals.push(clone(signal));
  else sidecar.phase5.refusalReceipts.push(await buildPhase5RefusalReceipt(signal, validation.reasons, context));
  return Object.freeze({ schema: 'td613.hush.phase5.signal-attachment-result/v1', status: validation.status === 'pass' ? 'attached' : validation.status === 'warn' ? 'unresolved-witness' : 'refused', original_packet_preserved: true, packet: clone(packet), sidecar });
}

export function openPacketWithPhase5Compatibility(packet = {}, context = {}) {
  const originalHash = packet.packet_hash_sha256 || packet.hash_sha256 || packet.packet_hash || null;
  const hasPhase5 = Boolean(packet.phase5);
  return Object.freeze({
    schema: PHASE5_COMPATIBILITY_SCHEMA,
    created_at: nowIso(context),
    legacy_mode: !hasPhase5,
    phase5_fields_present: hasPhase5,
    phase5_absent_not_dirty: !hasPhase5,
    original_hash_preserved: true,
    original_packet_hash_sha256: originalHash,
    original_packet_id: packet.packet_id || packet.contract_packet_id || packet.provider_log_packet_id || packet.pair_packet_id || packet.stylometry_audit_packet_id || null,
    upgrade_wrapper_available: true,
    upgrade_requires_operator_approval: true,
    sealed_body_mutated: false,
    packet: clone(packet)
  });
}

export function buildSafeHarborPhase5CustodyHandoff(validationResult = {}, signalRef = {}) {
  const receipt = signalRef.receipt || {};
  return Object.freeze({
    schema: PHASE5_SAFE_HARBOR_HANDOFF_SCHEMA,
    custody_only: true,
    signal_received: true,
    signal_refused: validationResult.status === 'block',
    validation_status: validationResult.status || 'unavailable',
    source_family: validationResult.source_family || signalRef.source_family || 'UNKNOWN',
    signal_class: validationResult.signal_class || signalRef.signal_class || 'unknown',
    foundation_lane: validationResult.foundation_lane || signalRef.foundation_lane || 'unresolved',
    receipt_present: Boolean(receipt.deterministic_receipt_present || receipt.sealed_signal_receipt_present || signalRef.receipt_present),
    hash_replay_status: receipt.hash_replay_status || signalRef.hash_replay_status || 'unavailable',
    authority_ceiling_held: true,
    runtime_loaded: false,
    runtime_executed: false,
    release_authorized: false,
    forbidden_claims_filtered: true,
    raw_private_text_included: false,
    reasons: asArray(validationResult.reasons)
  });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_PHASE5_EORFD_INTERFACE = Object.freeze({ PHASE5_SIGNAL_SCHEMA, PHASE5_VALIDATION_SCHEMA, PHASE5_REFUSAL_RECEIPT_SCHEMA, PHASE5_SAFE_HARBOR_HANDOFF_SCHEMA, PHASE5_COMPATIBILITY_SCHEMA, PHASE5_CLAIM_CEILING, validatePhase5EorfdInterfaceSignal, buildPhase5RefusalReceipt, attachPhase5Signal, openPacketWithPhase5Compatibility, buildSafeHarborPhase5CustodyHandoff, buildPhase5ConstantsBridge, buildPhase5RegisterLayerTranslation });
}
