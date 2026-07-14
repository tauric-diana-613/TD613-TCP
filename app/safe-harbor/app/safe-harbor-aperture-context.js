export const SAFE_HARBOR_APERTURE_CONTEXT = Object.freeze({
  apertureVersion: 'v3.1-alpha',
  apertureSchema: 'td613-aperture/v3.1-alpha',
  apertureFeatureVersion: 'v3.1-alpha-admissibility-tomography-registry-dynamics-runtime',
  observedRegime: 'PRCS-A',
  doctrineKernel: 'present',
  geometricAddendum: 'present',
  eorfdOperationalState: 'interface_context',
  eorfdClaimAuthority: 'design_signal',
  eorfdTargetState: 'verified-runtime-installation',
  eorfdAuthority: 'design-signal',
  domeWorld: Object.freeze({
    version: 'v0.4.3',
    receiptReferenceOnly: true,
    rawExactCoordinatesExported: false,
    trainingHistoryExported: false,
    sensitiveTextExported: false
  }),
  claimLimit: 'Aperture/EO-RFD context observes route posture; runtime promotion requires explicit verification and never creates packet authority.'
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
