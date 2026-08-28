import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  normalizeBar2Chain,
  addBar2Chains,
  scaleBar2Chain,
  boundaryOfBar3Chain,
  barH2Period,
} from './aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  boundaryOfBar2Chain,
  relationBarCycle,
  T_COORDINATE,
  Q_COORDINATE,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  rawBar2InteriorValue,
  pairNormalizedOneCochainWithBar1Boundary,
  cohomologousPresentation,
  defaultOpenCellPhi,
  associativityPasting,
} from './aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.js';

export const BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_SCHEMA = 'td613.a15-r0.boundary-framed-relative-bar-2-pairing/v0.1';
export const BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_PARENT_RECEIPT = 'cbc4c68a345f7989f967cf35bd87678bd4ecb1b2';
export const BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const UNIT = freeze({ t: 0, E: 0, O: 0 });
const canonicalInteger = (value) => (value === 0 ? 0 : value);

function validBase(x) {
  return x && [x.t, x.E, x.O].every((n) => Number.isInteger(n) && n >= 0);
}

function sameBase(a, b) {
  return validBase(a) && validBase(b)
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

function normalizedOneCochain(cochain) {
  if (typeof cochain !== 'function') return false;
  const unitValue = cochain(UNIT);
  return Number.isInteger(unitValue) && unitValue === 0;
}

function zeroOneCochain(base) {
  return validBase(base) ? 0 : null;
}

function addOneCochains(left, right) {
  if (!normalizedOneCochain(left) || !normalizedOneCochain(right)) return null;
  return (base) => {
    if (!validBase(base)) return null;
    const a = left(base);
    const b = right(base);
    if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
    return canonicalInteger(a + b);
  };
}

function subtractOneCochains(left, right) {
  if (!normalizedOneCochain(left) || !normalizedOneCochain(right)) return null;
  return (base) => {
    if (!validBase(base)) return null;
    const a = left(base);
    const b = right(base);
    if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
    return canonicalInteger(a - b);
  };
}

function scaleOneCochain(cochain, scalar) {
  if (!normalizedOneCochain(cochain) || !Number.isInteger(scalar)) return null;
  return (base) => {
    if (!validBase(base)) return null;
    const value = cochain(base);
    if (!Number.isInteger(value)) return null;
    return canonicalInteger(scalar * value);
  };
}

function markerFraming(marked) {
  if (!validBase(marked) || sameBase(marked, UNIT)) return null;
  return (base) => {
    if (!validBase(base)) return null;
    return sameBase(base, marked) ? 1 : 0;
  };
}

function oneTerm(left, right, coefficient = 1, label = null) {
  return freeze([freeze({ coefficient, left, right, label })]);
}

export function boundaryFramedRelativeBar2Pairing(
  chain,
  lambda,
  cochain = transportIncrementCocycle,
) {
  if (!Array.isArray(chain) || !normalizedOneCochain(lambda) || typeof cochain !== 'function') {
    return freeze({ status: 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_ABSTAINS' });
  }

  const normalized = normalizeBar2Chain(chain);
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') {
    return freeze({ status: 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_ABSTAINS' });
  }

  const boundary = boundaryOfBar2Chain(normalized.chain);
  if (boundary.status !== 'NORMALIZED_BAR_2_BOUNDARY_DERIVED') {
    return freeze({ status: 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_ABSTAINS' });
  }

  const interior = rawBar2InteriorValue(normalized.chain, cochain);
  const boundaryPairing = pairNormalizedOneCochainWithBar1Boundary(lambda, boundary);
  if (interior.status !== 'RAW_BAR_2_INTERIOR_VALUE_DERIVED'
      || boundaryPairing.status !== 'BAR_1_COCHAIN_BOUNDARY_PAIRING_DERIVED') {
    return freeze({ status: 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_ABSTAINS' });
  }

  return freeze({
    status: 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED',
    chain: normalized.chain,
    boundary,
    is_closed: boundary.is_cycle,
    interior,
    boundary_pairing: boundaryPairing,
    value: canonicalInteger(interior.value - boundaryPairing.value),
    identity: 'R_(omega,lambda)(c)=<omega,c>-<lambda,∂c>.',
    connection_gauge_authority: false,
    two_holonomy_authority: false,
  });
}

export function relativeBar2Rezeroing(
  chain,
  lambda,
  phi,
  psi = phi,
  cochain = transportIncrementCocycle,
) {
  if (!normalizedOneCochain(lambda)
      || !normalizedOneCochain(phi)
      || !normalizedOneCochain(psi)
      || typeof cochain !== 'function') {
    return freeze({ status: 'RELATIVE_BAR_2_REZEROING_ABSTAINS' });
  }

  const original = boundaryFramedRelativeBar2Pairing(chain, lambda, cochain);
  if (original.status !== 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED') {
    return freeze({ status: 'RELATIVE_BAR_2_REZEROING_ABSTAINS' });
  }

  const changedCochain = cohomologousPresentation(cochain, phi);
  const changedLambda = addOneCochains(lambda, psi);
  const residualCochain = subtractOneCochains(phi, psi);
  if (!changedCochain || !changedLambda || !residualCochain) {
    return freeze({ status: 'RELATIVE_BAR_2_REZEROING_ABSTAINS' });
  }

  const transformed = boundaryFramedRelativeBar2Pairing(chain, changedLambda, changedCochain);
  const predictedResidual = pairNormalizedOneCochainWithBar1Boundary(
    residualCochain,
    original.boundary,
  );
  if (transformed.status !== 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      || predictedResidual.status !== 'BAR_1_COCHAIN_BOUNDARY_PAIRING_DERIVED') {
    return freeze({ status: 'RELATIVE_BAR_2_REZEROING_ABSTAINS' });
  }

  const delta = canonicalInteger(transformed.value - original.value);
  return freeze({
    status: 'RELATIVE_BAR_2_REZEROING_DERIVED',
    original,
    transformed,
    delta,
    predicted_residual: predictedResidual,
    exact_mismatch_law_passed: delta === predictedResidual.value,
    simultaneous_rezeroing: phi === psi,
    identity: 'Delta R=<phi-psi,∂c>; in particular psi=phi gives Delta R=0.',
  });
}

function explicitOpenSimplexCertificate() {
  const chain = oneTerm(T_COORDINATE, Q_COORDINATE, 1, '[T|Q]');
  const paired = relativeBar2Rezeroing(chain, zeroOneCochain, defaultOpenCellPhi);
  const interiorOnly = relativeBar2Rezeroing(
    chain,
    zeroOneCochain,
    defaultOpenCellPhi,
    zeroOneCochain,
  );
  const boundaryOnly = relativeBar2Rezeroing(
    chain,
    zeroOneCochain,
    zeroOneCochain,
    defaultOpenCellPhi,
  );
  const twicePhi = scaleOneCochain(defaultOpenCellPhi, 2);
  const mismatch = relativeBar2Rezeroing(
    chain,
    zeroOneCochain,
    defaultOpenCellPhi,
    twicePhi,
  );

  return freeze({
    passed: paired.status === 'RELATIVE_BAR_2_REZEROING_DERIVED'
      && paired.original.interior.value === 1
      && paired.transformed.interior.value === 0
      && paired.original.value === 1
      && paired.transformed.value === 1
      && paired.delta === 0
      && paired.predicted_residual.value === 0
      && interiorOnly.delta === -1
      && interiorOnly.predicted_residual.value === -1
      && boundaryOnly.delta === 1
      && boundaryOnly.predicted_residual.value === 1
      && mismatch.delta === 1
      && mismatch.predicted_residual.value === 1,
    chain,
    paired,
    interior_only: interiorOnly,
    boundary_only: boundaryOnly,
    mismatched_psi_equals_2phi: mismatch,
  });
}

function closedCycleReductionCertificate() {
  const z = relationBarCycle();
  const lambda = defaultOpenCellPhi;
  const original = boundaryFramedRelativeBar2Pairing(z.chain, lambda);
  const paired = relativeBar2Rezeroing(z.chain, lambda, defaultOpenCellPhi);
  const inherited = barH2Period(z.chain);
  return freeze({
    passed: z.passed
      && original.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && original.is_closed
      && original.boundary_pairing.value === 0
      && original.value === 2
      && inherited.status === 'BAR_H2_PERIOD_DERIVED'
      && inherited.period === 2
      && paired.delta === 0
      && paired.transformed.value === 2,
    original,
    paired,
    inherited_period: inherited,
  });
}

function lawfulPastingAdditivityCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') {
    return freeze({ passed: false, paste });
  }
  const lambda = markerFraming(paste.internal_seam);
  if (!lambda) return freeze({ passed: false, paste });

  const faceA = oneTerm(paste.x, paste.y, 1, '[x|y]');
  const faceB = oneTerm(paste.xy, paste.z, 1, '[x★y|z]');
  const a = boundaryFramedRelativeBar2Pairing(faceA, lambda);
  const b = boundaryFramedRelativeBar2Pairing(faceB, lambda);
  const whole = boundaryFramedRelativeBar2Pairing(paste.left_chain, lambda);

  return freeze({
    passed: a.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && b.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && whole.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && a.boundary_pairing.value === -1
      && b.boundary_pairing.value === 1
      && whole.boundary_pairing.value === 0
      && whole.value === a.value + b.value,
    paste,
    face_a: a,
    face_b: b,
    whole,
    lesson: 'One common seam framing contributes with opposite orientations on the lawful faces and cancels in the pasted boundary.',
  });
}

function wrongOrientationCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') {
    return freeze({ passed: false, paste });
  }
  const lambda = markerFraming(paste.internal_seam);
  if (!lambda) return freeze({ passed: false, paste });
  const fake = freeze([
    freeze({ coefficient: 1, left: paste.x, right: paste.y, label: '[x|y]' }),
    freeze({ coefficient: -1, left: paste.xy, right: paste.z, label: '-[x★y|z]' }),
  ]);
  const result = boundaryFramedRelativeBar2Pairing(fake, lambda);
  return freeze({
    passed: result.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && result.boundary_pairing.value === -2
      && result.value === result.interior.value + 2,
    fake,
    result,
    lesson: 'Repeated seam coordinate with the wrong orientation remains visible with coefficient -2.',
  });
}

function orientationReversalCertificate() {
  const chain = oneTerm(T_COORDINATE, Q_COORDINATE, 1, '[T|Q]');
  const reversed = scaleBar2Chain(chain, -1);
  const lambda = defaultOpenCellPhi;
  const original = boundaryFramedRelativeBar2Pairing(chain, lambda);
  const negative = boundaryFramedRelativeBar2Pairing(reversed.chain, lambda);
  return freeze({
    passed: original.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && negative.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && negative.interior.value === -original.interior.value
      && negative.boundary_pairing.value === -original.boundary_pairing.value
      && negative.value === -original.value,
    original,
    reversed: negative,
  });
}

function fixedBoundaryRepresentativeCertificate() {
  const chain = oneTerm(T_COORDINATE, Q_COORDINATE, 1, '[T|Q]');
  const b3 = boundaryOfBar3Chain(freeze([
    freeze({ coefficient: 1, x: T_COORDINATE, y: Q_COORDINATE, z: T_COORDINATE }),
  ]));
  if (b3.status !== 'NORMALIZED_BAR_3_BOUNDARY_DERIVED') {
    return freeze({ passed: false, b3 });
  }
  const shifted = addBar2Chains(chain, b3.chain);
  if (shifted.status !== 'BAR_2_CHAIN_NORMALIZED') {
    return freeze({ passed: false, b3, shifted });
  }
  const lambda = defaultOpenCellPhi;
  const original = boundaryFramedRelativeBar2Pairing(chain, lambda);
  const changed = boundaryFramedRelativeBar2Pairing(shifted.chain, lambda);
  return freeze({
    passed: original.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && changed.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && JSON.stringify(original.boundary.terms) === JSON.stringify(changed.boundary.terms)
      && original.interior.value === changed.interior.value
      && original.boundary_pairing.value === changed.boundary_pairing.value
      && original.value === changed.value,
    original,
    added_bar3_boundary: b3,
    shifted,
    changed,
  });
}

function invalidFramingCertificate() {
  const chain = oneTerm(T_COORDINATE, Q_COORDINATE, 1, '[T|Q]');
  const nonnormalized = (base) => (validBase(base) ? 1 : null);
  const nonintegerOnQ = (base) => {
    if (!validBase(base)) return null;
    if (sameBase(base, Q_COORDINATE)) return 0.5;
    return 0;
  };
  const a = boundaryFramedRelativeBar2Pairing(chain, nonnormalized);
  const b = boundaryFramedRelativeBar2Pairing(chain, nonintegerOnQ);
  return freeze({
    passed: a.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_ABSTAINS'
      && b.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_ABSTAINS',
    nonnormalized: a,
    noninteger_boundary_value: b,
  });
}

function receiptExternalityCertificate() {
  const chain = oneTerm(T_COORDINATE, Q_COORDINATE, 1, '[T|Q]');
  const a = freeze({ receipt: 'RELATIVE_A', chain });
  const b = freeze({ receipt: 'RELATIVE_B', chain });
  const ra = boundaryFramedRelativeBar2Pairing(a.chain, zeroOneCochain);
  const rb = boundaryFramedRelativeBar2Pairing(b.chain, zeroOneCochain);
  return freeze({
    passed: a.receipt !== b.receipt
      && ra.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && rb.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && ra.value === rb.value,
    receipt_a: a.receipt,
    receipt_b: b.receipt,
    relative_value: ra.value,
  });
}

export function boundaryFramedRelativeBar2PairingCertificate() {
  const open = explicitOpenSimplexCertificate();
  const closed = closedCycleReductionCertificate();
  const pasted = lawfulPastingAdditivityCertificate();
  const wrong = wrongOrientationCertificate();
  const orientation = orientationReversalCertificate();
  const representative = fixedBoundaryRepresentativeCertificate();
  const invalid = invalidFramingCertificate();
  const receipt = receiptExternalityCertificate();

  const canonicalClassifications = freeze([
    'BOUNDARY_FRAMED_RELATIVE_BAR_TWO_PAIRING_IS_INVARIANT_UNDER_SIMULTANEOUS_COHOMOLOGOUS_INTERIOR_AND_BOUNDARY_REZEROING',
    'MISMATCHED_INTERIOR_AND_BOUNDARY_REZEROING_LEAVES_THE_EXACT_RESIDUAL_PAIRING_OF_THE_DIFFERENCE_ONE_COCHAIN_WITH_THE_BAR_ONE_BOUNDARY',
    'THE_BOUNDARY_FRAMED_RELATIVE_PAIRING_REDUCES_TO_THE_INHERITED_CLOSED_BAR_H2_PERIOD_ON_CYCLES_AND_IS_ADDITIVE_AND_ORIENTED_ON_FINITE_BAR_TWO_CHAINS_UNDER_ONE_COMMON_FRAMING',
  ]);

  const quarantines = freeze([
    'RELATIVE_BAR_2_REZEROING_INVARIANCE_NOT_CONNECTION_GAUGE_INVARIANCE',
    'BOUNDARY_FRAMING_NOT_2_CONNECTION',
    'FORMAL_BAR_2_CHAIN_NOT_OPERATIONAL_OR_GEOMETRIC_SURFACE',
    'RELATIVE_BAR_2_PAIRING_NOT_CURVATURE_INTEGRAL',
    'RELATIVE_BAR_2_PAIRING_NOT_2_HOLONOMY',
    'COMMON_FRAMING_ADDITIVITY_NOT_SEPARATELY_FRAMED_SURFACE_GLuing_LAW',
    'NO_GERBE_BERRY_QUANTUM_PROTO_LOOM_A16_MERGE_PRODUCTION_OR_VERCEL_AUTHORITY',
  ]);

  const passed = [open, closed, pasted, wrong, orientation, representative, invalid, receipt]
    .every((item) => item.passed);

  return freeze({
    status: passed
      ? 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_CERTIFICATE_PASSED'
      : 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_CERTIFICATE_FAILED',
    passed,
    open_simplex: open,
    closed_cycle_reduction: closed,
    lawful_pasting_additivity: pasted,
    wrong_orientation: wrong,
    orientation_reversal: orientation,
    fixed_boundary_representative_shift: representative,
    invalid_framing_abstention: invalid,
    receipt_externality: receipt,
    canonical_classifications: canonicalClassifications,
    quarantines,
    relative_2_transport_candidate_bearing_only: true,
    two_holonomy_promoted: false,
    connection_promoted: false,
  });
}
