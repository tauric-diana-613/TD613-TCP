export const MARROWLINE_GATE_ASSAY_SCHEMA = 'td613.dome-world.marrowline-gate-assay/v1';
export const MARROWLINE_GATE_ASSAY_CLAIM_CEILING = 'human-operated-adversarial-boundary-assay-for-the-declared-marrowline-endpoint-with-local-control-public-absorption-and-server-token-bypass-control; establishes-observed-route-response-egress-and-bypass-outcome-for-the-tested-fire-only; does-not-generalize-to-external-identity-authorship-or-unrelated-network-behavior';

export const MARROWLINE_GATE_MODES = Object.freeze({
  LOCAL_CONTROL: 'LOCAL_CONTROL',
  PUBLIC_ABSORPTION: 'PUBLIC_ABSORPTION',
  OPERATOR_BYPASS_CONTROL: 'OPERATOR_BYPASS_CONTROL',
  OPERATOR_REJECTED_PUBLIC_ABSORPTION: 'OPERATOR_REJECTED_PUBLIC_ABSORPTION',
  UNOBSERVED: 'UNOBSERVED'
});

function upper(value = '') { return String(value || '').trim().toUpperCase(); }

export function classifyMarrowlineGateReceipt(receipt = {}) {
  const status = upper(receipt?.status);
  const operator = receipt?.operator || {};
  const networkObserved = receipt?.networkResponseObserved === true || receipt?.sourceStatus === 'SERVER_RESPONSE_OBSERVED';
  const routeHeader = receipt?.http?.routeHeader || receipt?.canonicalPayload?.route || null;
  const egress = receipt?.canonicalPayload?.aperture_egress?.status || receipt?.aperture_egress?.status || null;

  if (status === 'LOCAL_FALLBACK' || receipt?.networkResponseObserved === false) {
    return Object.freeze({
      schema: MARROWLINE_GATE_ASSAY_SCHEMA,
      mode: MARROWLINE_GATE_MODES.LOCAL_CONTROL,
      networkObserved: false,
      routeHeader: null,
      apertureEgress: null,
      headline: 'Local control · no network crossing',
      plainLanguage: 'Marrowline built the deterministic reference locally. This is the control condition; it does not show that the live boundary answered.',
      comparisonUse: 'Compare this local matrix with a later public or operator fire without treating local construction as network evidence.',
      claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING
    });
  }

  if (operator?.requested === true && operator?.authorized === true) {
    return Object.freeze({
      schema: MARROWLINE_GATE_ASSAY_SCHEMA,
      mode: MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL,
      networkObserved: true,
      routeHeader: routeHeader || 'operator-bypass',
      apertureEgress: egress,
      headline: 'Operator control admitted · same live boundary, bypass route',
      plainLanguage: 'The request crossed the live Marrowline endpoint and the server admitted the one-fire operator token. This is the authorized control condition against public absorption.',
      comparisonUse: 'Compare this result with a blank-token public fire to test whether the same endpoint distinguishes the authorized bypass from canonical absorption.',
      claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING
    });
  }

  if (operator?.requested === true && operator?.authorized !== true) {
    return Object.freeze({
      schema: MARROWLINE_GATE_ASSAY_SCHEMA,
      mode: MARROWLINE_GATE_MODES.OPERATOR_REJECTED_PUBLIC_ABSORPTION,
      networkObserved,
      routeHeader: routeHeader || 'live-marrowline-ingress',
      apertureEgress: egress,
      headline: 'Operator control not admitted · public absorption answered',
      plainLanguage: 'A token was offered, but the server did not admit the operator bypass. The observed response therefore belongs to the public absorbing route, not to operator authorization.',
      comparisonUse: 'Treat this as a failed bypass attempt plus a live public-route observation; do not relabel it as operator success.',
      claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING
    });
  }

  if (networkObserved || status.startsWith('LIVE_') || status === 'LIVE_RESPONSE') {
    return Object.freeze({
      schema: MARROWLINE_GATE_ASSAY_SCHEMA,
      mode: MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION,
      networkObserved: true,
      routeHeader: routeHeader || 'live-marrowline-ingress',
      apertureEgress: egress,
      headline: 'Public fire observed · Marrowline absorption answered',
      plainLanguage: 'The request crossed the declared live Marrowline boundary without an admitted operator bypass. The returned route, egress observation, digest and matrix are evidence from that fire.',
      comparisonUse: 'Pair this with the operator control when available to adversarially compare two outcomes on the same endpoint.',
      claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING
    });
  }

  return Object.freeze({
    schema: MARROWLINE_GATE_ASSAY_SCHEMA,
    mode: MARROWLINE_GATE_MODES.UNOBSERVED,
    networkObserved: false,
    routeHeader,
    apertureEgress: egress,
    headline: 'No Gate result observed yet',
    plainLanguage: 'Choose a control and fire it. The Gate will explain what crossed and which route answered after a receipt exists.',
    comparisonUse: 'Nothing has been compared yet.',
    claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING
  });
}

export function buildMarrowlineGateAssayReceipt(receipt = {}) {
  const classification = classifyMarrowlineGateReceipt(receipt);
  return Object.freeze({
    schema: MARROWLINE_GATE_ASSAY_SCHEMA,
    observedReceiptStatus: receipt?.status || null,
    classification,
    adversarialUse: Object.freeze({
      localControl: 'deterministic-local-reference',
      publicTreatment: 'live-http-200-marrowline-absorption',
      operatorControl: 'same-endpoint-server-token-bypass-when-admitted',
      comparisonQuestion: 'does-the-declared-boundary-distinguish-public-absorption-from-authorized-operator-bypass-while-preserving-egress-and-route-evidence'
    }),
    falsifiers: Object.freeze([
      'local-control-claims-network-response',
      'public-fire-claims-operator-authorization-without-server-admission',
      'operator-token-persists-in-receipt',
      'same-endpoint-public-and-authorized-routes-become-indistinguishable',
      'egress-status-is-invented-when-unobserved'
    ]),
    claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING,
    seal: '⟐'
  });
}
