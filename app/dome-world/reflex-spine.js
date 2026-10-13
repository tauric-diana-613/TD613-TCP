export const TD613_REFLEX_SPINE_VERSION = 'td613.dome-world.reflex-spine/v1';

export const TD613_REFLEX_ORDER = Object.freeze([
  Object.freeze({
    step: 1,
    id: 'aperture-egress-attestation',
    jurisdiction: 'marrowline-room-browser-runtime',
    implementation: 'app/engine/td613-aperture.js::installTD613ProvenanceAttestationEgress',
    action: 'attach the four-part Aperture provenance marker before the dedicated Marrowline request'
  }),
  Object.freeze({
    step: 2,
    id: 'marrowline-ingress-absorption',
    jurisdiction: 'dedicated-serverless-ingress-route',
    implementation: 'api/marrowline.js',
    action: 'return the canonical absorbing HTTP 200 Marrowline response when operator bypass is absent'
  }),
  Object.freeze({
    step: 3,
    id: 'safe-harbor-restore-validation',
    jurisdiction: 'safe-harbor-session-reopen',
    implementation: 'app/safe-harbor/app/safe-harbor-session-gate.js',
    action: 'validate SHI plus packet before restoring a browser session'
  }),
  Object.freeze({
    step: 4,
    id: 'ash-contradiction-rejection',
    jurisdiction: 'ash-public-custody-api',
    implementation: 'api/ash-local-commitment-guard.py',
    action: 'reject contradictory L1 no-network and no-persistence assertions before custody execution'
  }),
  Object.freeze({
    step: 5,
    id: 'hush-single-run-lock',
    jurisdiction: 'hush-strict-provider-runtime',
    implementation: 'app/hush-pr168-strict-transform-run-lock.js',
    action: 'prevent concurrent strict transforms and recover held-receipt locks'
  }),
  Object.freeze({
    step: 6,
    id: 'seal-overwrite-witness',
    jurisdiction: 'localhost-operator-seal-server',
    implementation: 'scripts/serve-td613-localhost.mjs',
    action: 'append previous and new seal witnesses whenever a local batch is overwritten'
  }),
  Object.freeze({
    step: 7,
    id: 'gateway-rescue-fuse',
    jurisdiction: 'gateway-ui-fail-open-rescue',
    implementation: 'app/tcp-gateway-rescue.js',
    action: 'run only after native custody gates had time to initialize, then rescue a frozen gateway'
  })
]);

export function buildTD613ReflexReceipt(input = {}) {
  return Object.freeze({
    schema: TD613_REFLEX_SPINE_VERSION,
    status: input.status || 'ORDER_DECLARED',
    activeSteps: Object.freeze([...(input.activeSteps || [])]),
    order: TD613_REFLEX_ORDER,
    claimCeiling: 'runtime-order-receipt-not-universal-enforcement-identity-authorship-or-legal-authority-proof',
    seal: '⟐'
  });
}

if (typeof window !== 'undefined') {
  window.TD613_DOME_REFLEX_SPINE = Object.freeze({
    version: TD613_REFLEX_SPINE_VERSION,
    order: TD613_REFLEX_ORDER,
    buildReceipt: buildTD613ReflexReceipt
  });
}
