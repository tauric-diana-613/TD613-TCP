export const SAFE_HARBOR_APERTURE_CONTEXT = Object.freeze({
  apertureVersion: 'v2.9.2',
  apertureSchema: 'td613-aperture/v2.9.2',
  apertureFeatureVersion: 'v2.9.2-geometric-doctrine-addendum',
  observedRegime: 'PRCS-A',
  doctrineKernel: 'present',
  geometricAddendum: 'present',
  eorfdAuthority: 'interface-only',
  claimLimit: 'Aperture/EO-RFD context observes route posture; it does not create packet authority.'
});

export function compactSafeHarborApertureContext(extra = {}) {
  return Object.freeze(Object.assign({}, SAFE_HARBOR_APERTURE_CONTEXT, extra || {}));
}

export function safeHarborTauricIntakeContext(packet = {}, extra = {}) {
  const selectedBatchId = packet?.tauric_intake_context?.selectedBatchId ||
    packet?.intake?.tauric_intake_context?.selectedBatchId ||
    packet?.intake?.selected_batch_id ||
    null;
  return Object.freeze(Object.assign({
    selectedBatchId,
    family: 'Tauric Diana intake',
    source: 'corpus/tauric-diana-intake',
    manifest: 'TD613_corpus_manifest.json',
    eorfdRouteRole: 'protected batch route context',
    apertureSchema: SAFE_HARBOR_APERTURE_CONTEXT.apertureSchema,
    rawNodeTextExported: false
  }, extra || {}));
}
