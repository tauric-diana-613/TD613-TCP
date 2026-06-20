const freeze = (value) => Object.freeze(value);

export const PUBLIC_DEFAULT_ROOT = 'v2';

export const PUBLIC_DISPLAY_MODES = freeze({
  V2_ONLY: 'v2-only',
  V2_PRIMARY_V3_VISIBLE: 'v2-primary-v3-visible',
  DUAL_V2_V3: 'dual-v2-v3',
  BLOCKED: 'blocked'
});

export const V3_PUBLIC_ROLES = freeze({
  HIDDEN: 'hidden',
  FORENSIC_SECONDARY_VISIBLE: 'forensic-secondary-visible',
  DUAL_VERIFICATION_COMPANION: 'dual-verification-companion',
  BLOCKED: 'blocked'
});

export const RELEASE_CLASSES = freeze({
  OPERATOR_ONLY: 'operator-only',
  VERIFICATION_READY: 'verification-ready',
  PUBLIC_READABLE: 'public-readable',
  BLOCKED: 'blocked'
});

export const OPERATOR_ACTIONS = freeze({
  EXPORT: 'export',
  VERIFY: 'verify',
  COUNTERSIGN: 'countersign',
  CHALLENGE: 'challenge',
  REFUSE: 'refuse',
  QUARANTINE: 'quarantine',
  BLOCK: 'block'
});

export const PHASE_STATUSES = freeze({
  PASS: 'pass',
  REVIEW: 'review',
  FAIL: 'fail',
  QUARANTINE: 'quarantine',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
  ALIGNED: 'aligned',
  PARTIAL: 'partial'
});

export const CLAIM_LIMITS = freeze({
  not_civil_identity_proof: true,
  not_legal_identity_proof: true,
  not_public_law_approval: true,
  not_authorship_ownership_adjudication: true,
  not_state_recognition: true,
  not_v3_supremacy: true
});

export const FORBIDDEN_PUBLIC_STRINGS = freeze([
  'v3 public default',
  'SH3 replaces SHI',
  'Blood Rite 613 public credential',
  'verified legal identity',
  'civil identity verified',
  'state-recognized identity',
  'authorship legally proven',
  'public law approved',
  'court-ready identity proof',
  'heritage legally adjudicated',
  'identity verified',
  'authorship proven',
  'legal proof'
]);

export const ALLOWED_PUBLIC_STRINGS = freeze([
  'Public Credential: v2',
  'Public Credential: v2 primary + v3 forensic companion',
  'Public Credential: dual v2/v3 verification-ready',
  'Public Display: v2-only',
  'Public Display: v2 + v3 visible',
  'Public Display: blocked by replay gate',
  'Native Spine: native-born',
  'Native Spine: export-hardened',
  'Native Spine: legacy v2',
  'Witnesses: aligned',
  'Witnesses: partial',
  'Witnesses: blocked',
  'Release Class: public-readable',
  'Release Class: verification-ready',
  'Release Class: operator-only',
  'Release Class: blocked',
  'Replay verified',
  'Custody verified',
  'Raw text: sealed'
]);

export const COVENANT_TERMS = freeze([
  'TD613',
  'Tauric Diana',
  'Khona‌lit-po',
  'Blood Rite 613',
  'Safe Harbor',
  'U+10D613'
]);

export const ZWNJ_SENSITIVE_TERMS = freeze(['Khona‌lit-po']);
export const ZWNJ_FLATTENED_TERMS = freeze(['Khonalit-po']);

export const RAW_TEXT_FIELD_KEYS = freeze(['raw_text', 'future_self_raw_text', 'past_self_raw_text', 'higher_self_raw_text']);
export const RAW_TEXT_PHRASE_GUARDS = freeze([
  'Future self will carry',
  'Past self remembers',
  'Higher self names',
  'future self will carry route',
  'past self remembers residue',
  'higher self names pattern'
]);

export const SAFE_HARBOR_RUNTIME_MARKERS = freeze({
  phase6_native_callsite: true,
  phase6_compose_purity: true,
  phase7_outside_witness_alignment: true,
  phase8_public_default_gate: true,
  phase9_release_discipline: true,
  phase9_1_maintenance_seal: true
});

export const SAFE_HARBOR_PHASE_EVENTS = freeze({
  nativeFinalizerReady: 'td613:safe-harbor:native-finalizer-ready',
  outsideWitnessReady: 'td613:safe-harbor:outside-witness-ready',
  publicDefaultGateReady: 'td613:safe-harbor:public-default-gate-ready',
  releaseDisciplineReady: 'td613:safe-harbor:release-discipline-ready',
  maintenanceSealReady: 'td613:safe-harbor:maintenance-seal-ready',
  packet: 'td613:safe-harbor-packet',
  eoRoute: 'td613:eo-route'
});

export const SAFE_HARBOR_SCHEMA_IDS = freeze({
  releaseDiscipline: 'td613.safe-harbor.release-discipline/v1',
  releaseChecklist: 'td613.safe-harbor.release-checklist/v1',
  exportReceipt: 'td613.safe-harbor.export-receipt/v1',
  clipboardReceipt: 'td613.safe-harbor.clipboard-receipt/v1',
  surfaceRegistry: 'td613.safe-harbor.surface-registry/v1',
  maintenanceSeal: 'td613.safe-harbor.phase9-1-maintenance-seal/v1'
});

export function buildClaimLimits() {
  return freeze({ ...CLAIM_LIMITS });
}

export function isPublicDefaultRoot(value) {
  return (value || PUBLIC_DEFAULT_ROOT) === PUBLIC_DEFAULT_ROOT;
}

export function isAllowedPublicDisplayMode(value) {
  return Object.values(PUBLIC_DISPLAY_MODES).includes(value);
}

export function findForbiddenPublicStrings(text) {
  const body = String(text || '').toLowerCase();
  return FORBIDDEN_PUBLIC_STRINGS.filter((item) => body.includes(item.toLowerCase()));
}

export function isForbiddenPublicString(text) {
  return findForbiddenPublicStrings(text).length > 0;
}

export function containsZwnjSensitiveFlattening(text) {
  const body = String(text || '');
  return ZWNJ_FLATTENED_TERMS.filter((term) => body.includes(term));
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_POLICY_CONSTANTS = freeze({
    PUBLIC_DEFAULT_ROOT,
    PUBLIC_DISPLAY_MODES,
    V3_PUBLIC_ROLES,
    RELEASE_CLASSES,
    OPERATOR_ACTIONS,
    PHASE_STATUSES,
    CLAIM_LIMITS,
    FORBIDDEN_PUBLIC_STRINGS,
    ALLOWED_PUBLIC_STRINGS,
    COVENANT_TERMS,
    ZWNJ_SENSITIVE_TERMS,
    RAW_TEXT_FIELD_KEYS,
    RAW_TEXT_PHRASE_GUARDS,
    SAFE_HARBOR_RUNTIME_MARKERS,
    SAFE_HARBOR_PHASE_EVENTS,
    SAFE_HARBOR_SCHEMA_IDS,
    buildClaimLimits,
    isPublicDefaultRoot,
    isAllowedPublicDisplayMode,
    findForbiddenPublicStrings,
    isForbiddenPublicString,
    containsZwnjSensitiveFlattening
  });
}
