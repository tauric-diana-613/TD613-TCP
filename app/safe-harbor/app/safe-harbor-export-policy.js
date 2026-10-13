import { PUBLIC_DEFAULT_ROOT, RELEASE_CLASSES, buildClaimLimits, findForbiddenPublicStrings, containsZwnjSensitiveFlattening } from './safe-harbor-policy-constants.js';
import { inspectRawTextExposure, releaseFacingArtifactsFromPacket } from './safe-harbor-raw-text-policy.js';
import { compactSafeHarborApertureContext, safeHarborTauricIntakeContext } from './safe-harbor-aperture-context.js';

export const EXPORT_SURFACES = Object.freeze({
  PACKET_JSON: 'packet-json',
  PACKET_TXT_PREVIEW: 'packet-txt-preview',
  PACKET_PREVIEW_COPY: 'packet-preview-copy',
  FORENSIC_SCHEMA_COPY: 'forensic-schema-copy',
  PROBE_OUTPUT_COPY: 'probe-output-copy',
  CANONICAL_FOOTER_COPY: 'canonical-footer-copy',
  SVG_ATTESTATION_COPY: 'svg-attestation-copy',
  SIGNATURE_OVERLAY_COPY: 'signature-overlay-copy',
  OPERATOR_RECEIPT_COPY: 'operator-receipt-copy',
  PUBLIC_SUMMARY_COPY: 'public-summary-copy',
  VERIFICATION_SUMMARY_COPY: 'verification-summary-copy',
  OFFLINE_CAPSULE_EXPORT: 'offline-capsule-export'
});

export const EXPORT_CLASS = Object.freeze({
  PUBLIC_READABLE: 'public-readable',
  VERIFICATION_READY: 'verification-ready',
  OPERATOR_ONLY: 'operator-only',
  SEALED_PRIVATE: 'sealed-private',
  BLOCKED: 'blocked'
});

function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function releaseClass(packet) { return getPath(packet, 'phase9_release_discipline.release_class') || RELEASE_CLASSES.OPERATOR_ONLY; }
function phase8Status(packet) { return getPath(packet, 'phase8_public_default_gate.status') || 'unavailable'; }
function publicDisplay(packet) { return getPath(packet, 'phase8_public_default_gate.public_default_after') || getPath(packet, 'public_default_policy.public_default_mode') || 'v2-only'; }
function rawTextClean(packet) { return inspectRawTextExposure(releaseFacingArtifactsFromPacket(packet)).status !== 'fail'; }
function claimLimitsAttached(packet) { return Boolean(getPath(packet, 'phase9_release_discipline.claim_limits') || getPath(packet, 'phase9_release_receipt.claim_limits_attached')); }
function packetBlocked(packet) {
  if (!packet) return true;
  if (getPath(packet, 'phase5_replay_hardening.status') === 'quarantine' || getPath(packet, 'phase5_replay_hardening.status') === 'fail') return true;
  if (phase8Status(packet) === 'blocked') return true;
  if (releaseClass(packet) === RELEASE_CLASSES.BLOCKED) return true;
  return !rawTextClean(packet);
}

export function classifyExportSurface(surfaceId, packet) {
  if (packetBlocked(packet)) return EXPORT_CLASS.BLOCKED;
  const release = releaseClass(packet);
  if ([EXPORT_SURFACES.PUBLIC_SUMMARY_COPY, EXPORT_SURFACES.VERIFICATION_SUMMARY_COPY].includes(surfaceId)) return release === RELEASE_CLASSES.PUBLIC_READABLE ? EXPORT_CLASS.PUBLIC_READABLE : EXPORT_CLASS.VERIFICATION_READY;
  if ([EXPORT_SURFACES.CANONICAL_FOOTER_COPY, EXPORT_SURFACES.PROBE_OUTPUT_COPY].includes(surfaceId)) return EXPORT_CLASS.VERIFICATION_READY;
  if ([EXPORT_SURFACES.SVG_ATTESTATION_COPY, EXPORT_SURFACES.OFFLINE_CAPSULE_EXPORT].includes(surfaceId)) return release === RELEASE_CLASSES.PUBLIC_READABLE ? EXPORT_CLASS.PUBLIC_READABLE : EXPORT_CLASS.VERIFICATION_READY;
  if (release === RELEASE_CLASSES.PUBLIC_READABLE) return EXPORT_CLASS.PUBLIC_READABLE;
  if (release === RELEASE_CLASSES.VERIFICATION_READY) return EXPORT_CLASS.VERIFICATION_READY;
  return EXPORT_CLASS.OPERATOR_ONLY;
}

export function assertExportAllowed(surfaceId, packet) {
  const export_class = classifyExportSurface(surfaceId, packet);
  const refusal_reasons = [];
  if (export_class === EXPORT_CLASS.BLOCKED) refusal_reasons.push('release discipline or gate blocks this export');
  if (!rawTextClean(packet)) refusal_reasons.push('raw-text exposure risk detected');
  if (!claimLimitsAttached(packet) && [EXPORT_CLASS.PUBLIC_READABLE, EXPORT_CLASS.VERIFICATION_READY].includes(export_class)) refusal_reasons.push('claim limits missing from public or verification export');
  return Object.freeze({ schema_version: 'td613.safe-harbor.export-policy/v1', status: refusal_reasons.length ? 'blocked' : 'pass', surface_id: surfaceId, export_class, refusal_reasons: [...new Set(refusal_reasons)] });
}

export function publicSafeEnvelope(surfaceId, packet, body) {
  return Object.freeze({
    schema_version: 'td613.safe-harbor.public-safe-envelope/v1',
    surface_id: surfaceId,
    public_root: PUBLIC_DEFAULT_ROOT,
    public_display_mode: publicDisplay(packet),
    release_class: releaseClass(packet),
    aperture_context: compactSafeHarborApertureContext(packet?.aperture_context || packet?.bridge?.aperture_context || {}),
    tauric_intake_context: packet?.tauric_intake_context || packet?.intake?.tauric_intake_context || safeHarborTauricIntakeContext(packet),
    claim_limits: buildClaimLimits(),
    raw_text_exported: false,
    body
  });
}

export function buildExportPayload(surfaceId, packet, options = {}) {
  const gate = assertExportAllowed(surfaceId, packet);
  if (gate.status === 'blocked') return Object.freeze({ schema_version: 'td613.safe-harbor.export-refusal/v1', surface_id: surfaceId, status: 'blocked', refusal_reasons: gate.refusal_reasons, public_root: PUBLIC_DEFAULT_ROOT, raw_text_exported: false });
  if ([EXPORT_SURFACES.PUBLIC_SUMMARY_COPY, EXPORT_SURFACES.VERIFICATION_SUMMARY_COPY].includes(surfaceId)) return publicSafeEnvelope(surfaceId, packet, getPath(packet, 'phase9_release_discipline.public_summary') || 'TD613 Safe Harbor packet summary unavailable.');
  if (surfaceId === EXPORT_SURFACES.OPERATOR_RECEIPT_COPY && !options.publicSafe) return Object.freeze({ schema_version: 'td613.safe-harbor.operator-export/v1', surface_id: surfaceId, export_class: gate.export_class, operator_only: true, packet_hash_sha256: packet.packet_hash_sha256 || null, phase9_release_receipt: getPath(packet, 'phase9_release_receipt') || null, raw_text_exported: false });
  return packet;
}

export function verifyExportPayload(surfaceId, payload) {
  const body = JSON.stringify(payload || {});
  const refusal_reasons = [];
  const forbidden_hits = findForbiddenPublicStrings(body);
  const flattened_terms = containsZwnjSensitiveFlattening(body);
  const raw = inspectRawTextExposure(payload);
  if (forbidden_hits.length) refusal_reasons.push(...forbidden_hits.map((hit) => `forbidden public string: ${hit}`));
  if (flattened_terms.length) refusal_reasons.push(...flattened_terms.map((hit) => `ZWNJ-sensitive term flattened: ${hit}`));
  if (raw.status === 'fail') refusal_reasons.push(...raw.refusal_reasons);
  if (payload && payload.public_default_policy && payload.public_default_policy.default_public_credential && payload.public_default_policy.default_public_credential !== PUBLIC_DEFAULT_ROOT) refusal_reasons.push('public default changed away from v2');
  return Object.freeze({ schema_version: 'td613.safe-harbor.export-verification/v1', status: refusal_reasons.length ? 'blocked' : 'pass', surface_id: surfaceId, refusal_reasons: [...new Set(refusal_reasons)] });
}

export function buildExportReceipt(surfaceId, packet, payload, options = {}) {
  return Object.freeze({
    schema_version: 'td613.safe-harbor.export-receipt/v1',
    surface_id: surfaceId,
    export_class: classifyExportSurface(surfaceId, packet),
    phase8_gate_status: phase8Status(packet),
    phase9_release_class: releaseClass(packet),
    public_display_mode: publicDisplay(packet),
    public_default: PUBLIC_DEFAULT_ROOT,
    aperture_context: compactSafeHarborApertureContext(packet?.aperture_context || packet?.bridge?.aperture_context || {}),
    tauric_intake_context: packet?.tauric_intake_context || packet?.intake?.tauric_intake_context || safeHarborTauricIntakeContext(packet),
    raw_text_exported: false,
    claim_limits_attached: claimLimitsAttached(packet) || Boolean(payload && payload.claim_limits),
    clipboard: Boolean(options.clipboard),
    created_at: new Date().toISOString()
  });
}

if (typeof window !== 'undefined') window.TD613_SAFE_HARBOR_EXPORT_POLICY = Object.freeze({ EXPORT_SURFACES, EXPORT_CLASS, classifyExportSurface, buildExportPayload, verifyExportPayload, assertExportAllowed, buildExportReceipt, publicSafeEnvelope });
