import { canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';

export const FLOWCORE_PROMOTION_PACKET_SCHEMA = 'td613.flowcore.promotion-packet/v0.1';
export const FLOWCORE_ROLLBACK_PLAN_SCHEMA = 'td613.flowcore.rollback-plan/v0.1';

export const PROMOTION_STATES = Object.freeze([
  'DESIGNED',
  'IMPLEMENTED',
  'HARDENED',
  'RUNTIME_DEMONSTRATED',
  'PRODUCTION_DEMONSTRATED'
]);

export const REQUIRED_PROMOTION_ARTIFACTS = Object.freeze([
  'phase_receipts',
  'test_inventory',
  'browser_matrix',
  'mobile_evidence',
  'reduced_motion_evidence',
  'performance_evidence',
  'privacy_persistence_review',
  'station_jurisdiction_audit',
  'rollback_procedure',
  'documentation_index',
  'production_probe_receipt'
]);

const FORBIDDEN_KEYS = new Set([
  'raw_artifact_content', 'raw_bytes', 'raw_content', 'source_bytes',
  'learner_id', 'stable_learner_identity', 'user_id', 'participant_name', 'email'
]);
const EVIDENCE_STATUSES = new Set(['PASS', 'PRESENT', 'CONTRACT_ONLY', 'NOT_OBSERVED', 'HELD', 'FAIL']);

function clone(value) {
  return value === null || typeof value !== 'object'
    ? value
    : Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function rejectForbidden(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, index) => rejectForbidden(item, `${path}[${index}]`));
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`${path}.${key} is forbidden in a promotion packet.`);
    rejectForbidden(child, `${path}.${key}`);
  }
}

function requireDeterminism(options = {}) {
  const frozenClock = String(options.frozenClock || '');
  const idSeed = String(options.idSeed || '');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(frozenClock)) throw new Error('Promotion compilation requires a frozen RFC3339 clock.');
  if (!idSeed) throw new Error('Promotion compilation requires an explicit ID seed.');
  return {
    frozenClock,
    idSeed,
    cryptoImpl: options.cryptoImpl || globalThis.crypto,
    TextEncoderImpl: options.TextEncoderImpl || globalThis.TextEncoder
  };
}

function artifact(input, name) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error(`${name} evidence is required.`);
  const output = clone(input);
  output.status = String(output.status || '');
  if (!EVIDENCE_STATUSES.has(output.status)) throw new Error(`${name} has an unknown evidence status.`);
  output.references = Array.isArray(output.references) ? [...new Set(output.references.map(String))] : [];
  output.observed_at = output.observed_at ? String(output.observed_at) : null;
  output.observation_is_merge_inference = output.observation_is_merge_inference === true;
  return output;
}

function runtimeEvidencePass(evidence) {
  return evidence.browser_matrix.status === 'PASS' &&
    evidence.mobile_evidence.status === 'PASS' &&
    evidence.reduced_motion_evidence.status === 'PASS' &&
    evidence.performance_evidence.status === 'PASS';
}

function hardeningPass(evidence) {
  return evidence.phase_receipts.status === 'PASS' &&
    evidence.test_inventory.status === 'PASS' &&
    ['PASS', 'PRESENT'].includes(evidence.privacy_persistence_review.status) &&
    ['PASS', 'PRESENT'].includes(evidence.station_jurisdiction_audit.status) &&
    ['PASS', 'PRESENT'].includes(evidence.rollback_procedure.status) &&
    ['PASS', 'PRESENT'].includes(evidence.documentation_index.status);
}

function promotionState(evidence, empirical, featureGate) {
  let state = 'DESIGNED';
  if (evidence.phase_receipts.status === 'PASS' && evidence.test_inventory.status === 'PASS') state = 'IMPLEMENTED';
  if (hardeningPass(evidence) && featureGate.default_enabled === false) state = 'HARDENED';
  if (state === 'HARDENED' && runtimeEvidencePass(evidence) && empirical.empirical_exit_gate_passed === true) state = 'RUNTIME_DEMONSTRATED';
  if (state === 'RUNTIME_DEMONSTRATED' && evidence.production_probe_receipt.status === 'PASS' && evidence.production_probe_receipt.exact_main_sha_verified === true) state = 'PRODUCTION_DEMONSTRATED';
  return state;
}

function promotionHolds(evidence, empirical, featureGate, state) {
  const output = [];
  if (empirical.empirical_exit_gate_passed !== true) output.push({ code: 'EMPIRICAL_EXIT_GATE_HELD', detail: empirical.reason || 'Human adult evidence has not satisfied the P9 exit gate.' });
  if (!runtimeEvidencePass(evidence)) output.push({ code: 'RUNTIME_EVIDENCE_INCOMPLETE', detail: 'Browser, mobile, reduced-motion, and performance evidence are not all observed PASS.' });
  if (evidence.production_probe_receipt.status !== 'PASS') output.push({ code: 'PRODUCTION_PROBE_NOT_OBSERVED', detail: 'No successful exact-main production probe receipt is attached.' });
  if (featureGate.default_enabled !== false) output.push({ code: 'FEATURE_GATE_DEFAULT_NOT_OFF', detail: 'Initial promotion requires the feature gate to default off.' });
  if (state !== 'PRODUCTION_DEMONSTRATED') output.push({ code: 'PRODUCTION_PROMOTION_NOT_COMPLETE', detail: `Current state is ${state}.` });
  return output;
}

export function compileRollbackPlan(input = {}) {
  rejectForbidden(input);
  const requiredPreservation = [
    'custody_records', 'case_maps', 'receipts', 'route_memory',
    'release_state', 'local_commitments'
  ];
  const preserves = Array.isArray(input.preserves) ? [...new Set(input.preserves.map(String))] : [];
  for (const field of requiredPreservation) if (!preserves.includes(field)) throw new Error(`Rollback plan must preserve ${field}.`);
  if (input.feature_gate_path !== 'presentation-layer-only') throw new Error('Rollback feature gate must remain presentation-layer-only.');
  if (input.rollback_mutates_governed_state === true) throw new Error('Rollback cannot mutate governed state.');
  const plan = {
    schema: FLOWCORE_ROLLBACK_PLAN_SCHEMA,
    feature_gate_path: 'presentation-layer-only',
    default_enabled: false,
    rollback_action: String(input.rollback_action || 'disable Flow-Core presentation routes and restore prior navigation'),
    restores_prior_ui: true,
    preserves,
    rollback_mutates_governed_state: false,
    rollback_requires_data_migration: false,
    rollback_creates_release: false,
    rollback_creates_transport: false,
    human_authorization_required: true,
    verification_steps: Array.isArray(input.verification_steps) ? input.verification_steps.map(String) : [],
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(plan);
  return freeze(plan);
}

export async function compilePromotionPacket(input = {}, options = {}) {
  rejectForbidden(input);
  const d = requireDeterminism(options);
  const evidence = {};
  for (const key of REQUIRED_PROMOTION_ARTIFACTS) evidence[key] = artifact(input.evidence?.[key], key);
  const empirical = {
    empirical_exit_gate_passed: input.empirical_validation?.empirical_exit_gate_passed === true,
    human_adult_evidence_present: input.empirical_validation?.human_adult_evidence_present === true,
    reason: String(input.empirical_validation?.reason || 'HUMAN_VOLUNTARY_ADULT_EVIDENCE_ABSENT'),
    merge_may_satisfy_gate: false,
    deployment_may_satisfy_gate: false
  };
  const featureGate = {
    config_reference: String(input.feature_gate?.config_reference || ''),
    default_enabled: input.feature_gate?.default_enabled === true,
    presentation_layer_only: input.feature_gate?.presentation_layer_only === true,
    governed_state_mutation_allowed: input.feature_gate?.governed_state_mutation_allowed === true,
    public_route_promotion_authorized: input.feature_gate?.public_route_promotion_authorized === true
  };
  if (!featureGate.config_reference || !featureGate.presentation_layer_only || featureGate.governed_state_mutation_allowed) throw new Error('A bounded presentation-only feature gate is required.');
  const rollback = compileRollbackPlan(input.rollback);
  const state = promotionState(evidence, empirical, featureGate);
  const holds = promotionHolds(evidence, empirical, featureGate, state);
  const subject = {
    program_reference: String(input.program_reference || 'td613.flowcore.pedagogue-program/v0.1'),
    evidence,
    empirical,
    feature_gate: featureGate,
    rollback,
    state,
    holds,
    serverless_delta: 0,
    persistence_delta: 0
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:PROMOTION-PACKET:v1', { ...subject, id_seed: d.idSeed }, d);
  const packet = {
    schema: FLOWCORE_PROMOTION_PACKET_SCHEMA,
    packet_id: `flowcore_promotion_${digest.slice(-24)}`,
    packet_digest: digest,
    created_at: d.frozenClock,
    program_reference: subject.program_reference,
    current_state: state,
    state_order: clone(PROMOTION_STATES),
    evidence,
    empirical_validation: empirical,
    feature_gate: featureGate,
    rollback,
    promotion_holds: holds,
    promotion_complete: state === 'PRODUCTION_DEMONSTRATED',
    state_inferred_from_merge: false,
    state_inferred_from_deployment: false,
    serverless_delta: 0,
    persistence_delta: 0,
    authority: {
      packet_can_enable_feature: false,
      packet_can_mutate_governed_state: false,
      packet_can_authorize_release: false,
      packet_can_close_program: false,
      human_promotion_required: true,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(packet);
  return freeze(packet);
}

export function verifyPromotionPacket(packet) {
  if (!packet || packet.schema !== FLOWCORE_PROMOTION_PACKET_SCHEMA) throw new Error('Malformed promotion packet.');
  if (!PROMOTION_STATES.includes(packet.current_state)) throw new Error('Unknown promotion state.');
  for (const key of REQUIRED_PROMOTION_ARTIFACTS) if (!packet.evidence?.[key]) throw new Error(`Missing promotion artifact: ${key}`);
  if (packet.state_inferred_from_merge || packet.state_inferred_from_deployment) throw new Error('Promotion state cannot be inferred from merge or deployment.');
  if (packet.feature_gate.default_enabled !== false || packet.feature_gate.presentation_layer_only !== true || packet.feature_gate.governed_state_mutation_allowed !== false) throw new Error('Feature gate boundary widened.');
  if (packet.serverless_delta !== 0 || packet.persistence_delta !== 0) throw new Error('Promotion packet widened infrastructure.');
  if (packet.authority.packet_can_enable_feature || packet.authority.packet_can_mutate_governed_state || packet.authority.packet_can_authorize_release || packet.authority.packet_can_close_program) throw new Error('Promotion packet widened authority.');
  if (packet.closure?.status !== 'OPEN' || packet.authority.human_closure_required !== true) throw new Error('Human closure boundary failed.');
  if (packet.empirical_validation.empirical_exit_gate_passed !== true && ['RUNTIME_DEMONSTRATED', 'PRODUCTION_DEMONSTRATED'].includes(packet.current_state)) throw new Error('Promotion crossed the held empirical gate.');
  if (packet.current_state === 'PRODUCTION_DEMONSTRATED' && (packet.evidence.production_probe_receipt.status !== 'PASS' || packet.evidence.production_probe_receipt.exact_main_sha_verified !== true)) throw new Error('Production state lacks exact-main probe evidence.');
  canonicalJson(packet);
  return true;
}
