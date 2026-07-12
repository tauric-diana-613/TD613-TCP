import { installTD613ProvenanceAttestationEgress } from '../engine/td613-aperture.js';
import { buildTD613ReflexReceipt } from './reflex-spine.js';

export const MARROWLINE_EGRESS_BOOT_VERSION = 'td613.dome-world.marrowline-egress-boot/v1';

function bootApertureEgress(root = window) {
  const installedNow = installTD613ProvenanceAttestationEgress(root);
  const active = Boolean(root.__TD613_PROVENANCE_ATTESTATION_EGRESS__);
  const receipt = Object.freeze({
    schema: MARROWLINE_EGRESS_BOOT_VERSION,
    active,
    installedNow,
    scope: 'marrowline-room-browser-runtime',
    destination: '/api/dome-world/marrowline',
    headers: Object.freeze([
      'X-Dromological-Variance-Matrix',
      'X-Stylometric-Resonance-Hash',
      'X-Alignment-Weight-Vector',
      'X-Custodial-Friction-Index'
    ]),
    reflex: buildTD613ReflexReceipt({ status: active ? 'EGRESS_ARMED' : 'EGRESS_UNAVAILABLE', activeSteps: active ? [1] : [] }),
    claimCeiling: 'provenance-marker-installation-not-signature-authorship-identity-or-legal-authority-proof',
    seal: '⟐'
  });
  root.__TD613_MARROWLINE_EGRESS_BOOT__ = receipt;
  root.dispatchEvent?.(new CustomEvent('td613:marrowline:egress-ready', { detail: receipt }));
  return receipt;
}

if (typeof window !== 'undefined') {
  bootApertureEgress(window);
  import('./marrowline-station.js');
}

export { bootApertureEgress };
