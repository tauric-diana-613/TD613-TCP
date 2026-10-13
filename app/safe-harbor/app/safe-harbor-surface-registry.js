import { EXPORT_SURFACES } from './safe-harbor-export-policy.js';
import { compactSafeHarborApertureContext } from './safe-harbor-aperture-context.js';

export const SAFE_HARBOR_SURFACES = Object.freeze({
  covenantCanon: { id: 'covenant-canon', label: 'Covenant Canon', class: 'public-readable', copyPolicy: 'footer-only', claimLimit: true, controls: ['copyCanonicalFooter'] },
  publicDoctrine: { id: 'public-doctrine', label: 'Public doctrine fold', class: 'public-readable', copyPolicy: 'claim-limited', claimLimit: true, controls: [] },
  publicReferences: { id: 'public-references', label: 'Public References', class: 'public-readable', copyPolicy: 'reference-link', claimLimit: true, controls: ['TD613_verify', 'TD613_offline_capsule'] },
  witnessSurface: { id: 'witness-surface', label: 'Witness Surface', class: 'verification-ready', copyPolicy: 'release-gated', claimLimit: true, controls: [] },
  mintedIssuance: { id: 'minted-issuance', label: 'Minted Issuance', class: 'verification-ready', copyPolicy: 'release-gated', claimLimit: true, controls: [] },
  packetVault: { id: 'packet-vault', label: 'Packet Vault', class: 'operator-only', copyPolicy: 'release-gated', claimLimit: true, controls: ['exportPacketPreview', 'copyPacketPreview', 'copyForensicSchemaPreview', 'openPacketTxtPreview', 'copyProbeOutput'] },
  intakeCanon: { id: 'intake-canon', label: 'Intake Canon', class: 'operator-only', copyPolicy: 'sealed-private', claimLimit: true, controls: [] },
  svgAttestation: { id: 'svg-attestation', label: 'SVG Attestation', class: 'verification-ready', copyPolicy: 'renderer-svg-gated', claimLimit: true, controls: [] },
  tauricIntake: { id: 'tauric-intake', label: 'Tauric Intake', class: 'operator-only', copyPolicy: 'sealed-private', claimLimit: true, controls: [] },
  operatorHandshake: { id: 'operator-handshake', label: 'Operator Handshake', class: 'operator-only', copyPolicy: 'operator-only', claimLimit: true, controls: [] },
  packetMirror: { id: 'packet-mirror', label: 'Packet Mirror', class: 'operator-only', copyPolicy: 'release-gated', claimLimit: true, controls: [] },
  operatorReceipt: { id: 'operator-receipt', label: 'Operator receipt mount', class: 'operator-only', copyPolicy: 'operator-only', claimLimit: true, controls: [] },
  sealedRecall: { id: 'sealed-recall', label: 'Reopen Safe Harbor', class: 'operator-only', copyPolicy: 'no-copy', claimLimit: true, controls: ['bypassIngress', 'bypassSealedPacketFile'] },
  td613FlightHandoff: { id: 'td613-flight-handoff', label: 'TD613 Flight handoff', class: 'verification-ready', copyPolicy: 'handoff-gated', claimLimit: true, controls: ['td613-flight'] },
  gatewayHandoff: { id: 'gateway-handoff', label: 'Gateway handoff', class: 'verification-ready', copyPolicy: 'handoff-gated', claimLimit: true, controls: ['gateway'] }
});

export const COPY_EXPORT_CONTROL_MAP = Object.freeze({
  exportPacketPreview: EXPORT_SURFACES.PACKET_JSON,
  copyPacketPreview: EXPORT_SURFACES.PACKET_PREVIEW_COPY,
  copyForensicSchemaPreview: EXPORT_SURFACES.FORENSIC_SCHEMA_COPY,
  openPacketTxtPreview: EXPORT_SURFACES.PACKET_TXT_PREVIEW,
  copyProbeOutput: EXPORT_SURFACES.PROBE_OUTPUT_COPY,
  copyCanonicalFooter: EXPORT_SURFACES.CANONICAL_FOOTER_COPY,
  copyPublicSummary: EXPORT_SURFACES.PUBLIC_SUMMARY_COPY,
  copyVerificationSummary: EXPORT_SURFACES.VERIFICATION_SUMMARY_COPY
});

export function getSurfaceByControl(controlId) {
  return Object.values(SAFE_HARBOR_SURFACES).find((surface) => surface.controls.includes(controlId)) || null;
}

export function listUnregisteredControls(controlIds = []) {
  return controlIds.filter((id) => !Object.prototype.hasOwnProperty.call(COPY_EXPORT_CONTROL_MAP, id) && !getSurfaceByControl(id));
}

export function buildSurfacePolicySummary() {
  return Object.freeze({
    schema_version: 'td613.safe-harbor.surface-registry/v1',
    surfaces: SAFE_HARBOR_SURFACES,
    copy_export_control_map: COPY_EXPORT_CONTROL_MAP,
    aperture_context: compactSafeHarborApertureContext(),
    claim_limits_required: true,
    raw_text_public_export: false,
    eo_shorthand: 'EO-RFD route conscience / context lane (interface_context; design_signal)'
  });
}

if (typeof window !== 'undefined') window.TD613_SAFE_HARBOR_SURFACE_REGISTRY = Object.freeze({ SAFE_HARBOR_SURFACES, COPY_EXPORT_CONTROL_MAP, getSurfaceByControl, listUnregisteredControls, buildSurfacePolicySummary });
