import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  normalizeBar2Chain,
  addBar2Chains,
  scaleBar2Chain,
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
  cohomologousPresentation,
  defaultOpenCellPhi,
  associativityPasting,
} from './aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.js';
import {
  boundaryFramedRelativeBar2Pairing,
} from './aperture-pedagogue-boundary-framed-relative-bar-2-pairing.js';

export const SEPARATELY_FRAMED_BAR_TWO_GLUING_SCHEMA = 'td613.a15-r0.separately-framed-bar-2-gluing-seam-defect/v0.1';
export const SEPARATELY_FRAMED_BAR_TWO_GLUING_PARENT_RECEIPT = '49b51662df935f1d625d685af37a0a3b61a0b156';
export const SEPARATELY_FRAMED_BAR_TWO_GLUING_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const UNIT = freeze({ t: 0, E: 0, O: 0 });
const canonicalInteger = (value) => (value === 0 ? 0 : value);

function validBase(base) {
  if (!base || typeof base !== 'object') return false;
  const keys = Object.keys(base).sort();
  if (JSON.stringify(keys) !== JSON.stringify(['E', 'O', 't'])) return false;
  return [base.t, base.E, base.O].every((n) => Number.isInteger(n) && n >= 0);
}

function sameBase(a, b) {
  return validBase(a) && validBase(b)
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

function baseKey(base) {
  return validBase(base) ? JSON.stringify([base.t, base.E, base.O]) : null;
}

function normalizedOneCochain(cochain) {
  if (typeof cochain !== 'function') return false;
  const unit = cochain(UNIT);
  return Number.isInteger(unit) && unit === 0;
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

export function finiteBoundaryFraming(entries = []) {
  if (!Array.isArray(entries)) return null;
  const values = new Map();
  for (const entry of entries) {
    if (!entry || !validBase(entry.coordinate) || !Number.isInteger(entry.value)) return null;
    if (sameBase(entry.coordinate, UNIT) && entry.value !== 0) return null;
    const key = baseKey(entry.coordinate);
    if (values.has(key) && values.get(key) !== entry.value) return null;
    values.set(key, entry.value);
  }
  const framing = (base) => {
    if (!validBase(base)) return null;
    if (sameBase(base, UNIT)) return 0;
    return values.get(baseKey(base)) ?? 0;
  };
  return normalizedOneCochain(framing) ? framing : null;
}

function oneTerm(left, right, coefficient = 1, label = null) {
  return freeze([freeze({ coefficient, left, right, label })]);
}

function normalizedChainCore(chain) {
  const normalized = normalizeBar2Chain(chain);
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') return null;
  return normalized.chain.map((term) => ({
    coefficient: canonicalInteger(term.coefficient),
    left: [term.left.t, term.left.E, term.left.O],
    right: [term.right.t, term.right.E, term.right.O],
  }));
}

function sameBar2Chain(left, right) {
  const a = normalizedChainCore(left);
  const b = normalizedChainCore(right);
  return a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b);
}

function boundaryCoefficient(boundary, coordinate) {
  if (boundary?.status !== 'NORMALIZED_BAR_2_BOUNDARY_DERIVED' || !validBase(coordinate)) return null;
  const term = boundary.terms.find((candidate) => sameBase(candidate.coordinate, coordinate));
  return term?.coefficient ?? 0;
}

function decoratedExternalTerms(boundary, seam, framing, face) {
  if (boundary?.status !== 'NORMALIZED_BAR_2_BOUNDARY_DERIVED'
      || !validBase(seam)
      || !normalizedOneCochain(framing)) return null;
  const terms = [];
  let total = 0;
  for (const term of boundary.terms) {
    if (sameBase(term.coordinate, seam)) continue;
    const frameValue = framing(term.coordinate);
    if (!Number.isInteger(frameValue)) return null;
    const contribution = term.coefficient * frameValue;
    total += contribution;
    terms.push(freeze({
      face,
      coordinate: term.coordinate,
      coefficient: term.coefficient,
      frame_value: frameValue,
      contribution,
    }));
  }
  return freeze({ terms: freeze(terms), value: canonicalInteger(total) });
}

export function separatelyFramedBar2Gluing({
  faceA,
  faceB,
  seam,
  lambdaA,
  lambdaB,
  declaredPaste = null,
  cochain = transportIncrementCocycle,
} = {}) {
  if (!Array.isArray(faceA)
      || !Array.isArray(faceB)
      || !validBase(seam)
      || !normalizedOneCochain(lambdaA)
      || !normalizedOneCochain(lambdaB)
      || typeof cochain !== 'function') {
    return freeze({ status: 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS' });
  }

  const normalizedA = normalizeBar2Chain(faceA);
  const normalizedB = normalizeBar2Chain(faceB);
  if (normalizedA.status !== 'BAR_2_CHAIN_NORMALIZED'
      || normalizedB.status !== 'BAR_2_CHAIN_NORMALIZED') {
    return freeze({ status: 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS' });
  }

  const boundaryA = boundaryOfBar2Chain(normalizedA.chain);
  const boundaryB = boundaryOfBar2Chain(normalizedB.chain);
  if (boundaryA.status !== 'NORMALIZED_BAR_2_BOUNDARY_DERIVED'
      || boundaryB.status !== 'NORMALIZED_BAR_2_BOUNDARY_DERIVED') {
    return freeze({ status: 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS' });
  }

  const seamCoefficientA = boundaryCoefficient(boundaryA, seam);
  const seamCoefficientB = boundaryCoefficient(boundaryB, seam);
  const lawfulOrientation = seamCoefficientA === -1 && seamCoefficientB === 1;
  if (!lawfulOrientation) {
    return freeze({
      status: 'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_UNLAWFUL_SEAM_ORIENTATION',
      seam,
      seam_coefficient_a: seamCoefficientA,
      seam_coefficient_b: seamCoefficientB,
      lawful_orientation: false,
    });
  }

  const pasted = addBar2Chains(normalizedA.chain, normalizedB.chain);
  if (pasted.status !== 'BAR_2_CHAIN_NORMALIZED') {
    return freeze({ status: 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS' });
  }
  if (declaredPaste !== null && !sameBar2Chain(pasted.chain, declaredPaste)) {
    return freeze({
      status: 'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_FALSE_DECLARED_PASTE',
      derived_paste: pasted.chain,
    });
  }

  const relativeA = boundaryFramedRelativeBar2Pairing(normalizedA.chain, lambdaA, cochain);
  const relativeB = boundaryFramedRelativeBar2Pairing(normalizedB.chain, lambdaB, cochain);
  const rawPaste = rawBar2InteriorValue(pasted.chain, cochain);
  const extA = decoratedExternalTerms(boundaryA, seam, lambdaA, 'A');
  const extB = decoratedExternalTerms(boundaryB, seam, lambdaB, 'B');
  if (relativeA.status !== 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      || relativeB.status !== 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      || rawPaste.status !== 'RAW_BAR_2_INTERIOR_VALUE_DERIVED'
      || !extA || !extB) {
    return freeze({ status: 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS' });
  }

  const leftSeamFrame = lambdaA(seam);
  const rightSeamFrame = lambdaB(seam);
  if (!Number.isInteger(leftSeamFrame) || !Number.isInteger(rightSeamFrame)) {
    return freeze({ status: 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS' });
  }

  const seamDefect = canonicalInteger(leftSeamFrame - rightSeamFrame);
  const externalFramePairing = canonicalInteger(extA.value + extB.value);
  const facewiseSum = canonicalInteger(relativeA.value + relativeB.value);
  const predicted = canonicalInteger(rawPaste.value - externalFramePairing + seamDefect);

  return freeze({
    status: 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED',
    face_a: normalizedA.chain,
    face_b: normalizedB.chain,
    paste: pasted.chain,
    seam,
    boundary_a: boundaryA,
    boundary_b: boundaryB,
    seam_coefficient_a: seamCoefficientA,
    seam_coefficient_b: seamCoefficientB,
    lawful_orientation: true,
    left_seam_frame: leftSeamFrame,
    right_seam_frame: rightSeamFrame,
    seam_defect: seamDefect,
    seam_matched: seamDefect === 0,
    external_terms: freeze([...extA.terms, ...extB.terms]),
    external_frame_pairing: externalFramePairing,
    raw_pasted_interior: rawPaste.value,
    relative_a: relativeA.value,
    relative_b: relativeB.value,
    facewise_relative_sum: facewiseSum,
    predicted_facewise_sum: predicted,
    exact_gluing_law_passed: facewiseSum === predicted,
    identity: 'R_A+R_B=<omega,c_A+c_B>-E_ext+(lambda_A(s)-lambda_B(s)).',
    geometric_surface_gluing_authority: false,
    two_holonomy_authority: false,
  });
}

export function commonRezeroingSeparatelyFramedGluing(args, phi = defaultOpenCellPhi) {
  if (!args || !normalizedOneCochain(phi)) {
    return freeze({ status: 'SEPARATELY_FRAMED_COMMON_REZEROING_ABSTAINS' });
  }
  const original = separatelyFramedBar2Gluing(args);
  if (original.status !== 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED') {
    return freeze({ status: 'SEPARATELY_FRAMED_COMMON_REZEROING_ABSTAINS', original });
  }
  const changedCochain = cohomologousPresentation(args.cochain ?? transportIncrementCocycle, phi);
  const changedA = addOneCochains(args.lambdaA, phi);
  const changedB = addOneCochains(args.lambdaB, phi);
  if (!changedCochain || !changedA || !changedB) {
    return freeze({ status: 'SEPARATELY_FRAMED_COMMON_REZEROING_ABSTAINS' });
  }
  const transformed = separatelyFramedBar2Gluing({
    ...args,
    lambdaA: changedA,
    lambdaB: changedB,
    cochain: changedCochain,
  });
  if (transformed.status !== 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED') {
    return freeze({ status: 'SEPARATELY_FRAMED_COMMON_REZEROING_ABSTAINS', original, transformed });
  }
  return freeze({
    status: 'SEPARATELY_FRAMED_COMMON_REZEROING_DERIVED',
    original,
    transformed,
    facewise_sum_invariant: original.facewise_relative_sum === transformed.facewise_relative_sum,
    seam_defect_invariant: original.seam_defect === transformed.seam_defect,
    passed: original.facewise_relative_sum === transformed.facewise_relative_sum
      && original.seam_defect === transformed.seam_defect,
  });
}

function framingWith(externalEntries, seam, seamValue) {
  return finiteBoundaryFraming([
    ...externalEntries,
    { coordinate: seam, value: seamValue },
  ]);
}

function matchedMismatchCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') return freeze({ passed: false, paste });

  const external = [
    { coordinate: paste.x, value: 1 },
    { coordinate: paste.y, value: 3 },
    { coordinate: paste.z, value: 1 },
    { coordinate: paste.xyz, value: 4 },
  ];
  const lambdaA = framingWith(external, paste.xy, 2);
  const lambdaBMatched = framingWith(external, paste.xy, 2);
  const lambdaBMismatch = framingWith(external, paste.xy, 5);
  if (!lambdaA || !lambdaBMatched || !lambdaBMismatch) return freeze({ passed: false, paste });

  const faceA = oneTerm(paste.x, paste.y, 1, '[x|y]');
  const faceB = oneTerm(paste.xy, paste.z, 1, '[x★y|z]');
  const matched = separatelyFramedBar2Gluing({
    faceA,
    faceB,
    seam: paste.xy,
    lambdaA,
    lambdaB: lambdaBMatched,
    declaredPaste: paste.left_chain,
  });
  const mismatch = separatelyFramedBar2Gluing({
    faceA,
    faceB,
    seam: paste.xy,
    lambdaA,
    lambdaB: lambdaBMismatch,
    declaredPaste: paste.left_chain,
  });

  return freeze({
    passed: matched.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED'
      && mismatch.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED'
      && matched.exact_gluing_law_passed
      && mismatch.exact_gluing_law_passed
      && matched.seam_defect === 0
      && matched.seam_matched
      && mismatch.seam_defect === -3
      && !mismatch.seam_matched
      && mismatch.facewise_relative_sum - matched.facewise_relative_sum === -3,
    paste,
    matched,
    mismatch,
  });
}

function wrongOrientationCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') return freeze({ passed: false, paste });
  const framing = framingWith([], paste.xy, 2);
  if (!framing) return freeze({ passed: false, paste });
  const faceA = oneTerm(paste.x, paste.y, 1, '[x|y]');
  const faceBWrong = oneTerm(paste.xy, paste.z, -1, '-[x★y|z]');
  const rejected = separatelyFramedBar2Gluing({
    faceA,
    faceB: faceBWrong,
    seam: paste.xy,
    lambdaA: framing,
    lambdaB: framing,
  });
  return freeze({
    passed: rejected.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_UNLAWFUL_SEAM_ORIENTATION'
      && rejected.seam_coefficient_a === -1
      && rejected.seam_coefficient_b === -1
      && !rejected.lawful_orientation,
    rejected,
  });
}

function commonRezeroingCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') return freeze({ passed: false, paste });
  const external = [
    { coordinate: paste.x, value: 2 },
    { coordinate: paste.y, value: -1 },
    { coordinate: paste.z, value: 2 },
    { coordinate: paste.xyz, value: 5 },
  ];
  const lambdaA = framingWith(external, paste.xy, 2);
  const lambdaB = framingWith(external, paste.xy, 5);
  const result = commonRezeroingSeparatelyFramedGluing({
    faceA: oneTerm(paste.x, paste.y, 1, '[x|y]'),
    faceB: oneTerm(paste.xy, paste.z, 1, '[x★y|z]'),
    seam: paste.xy,
    lambdaA,
    lambdaB,
    declaredPaste: paste.left_chain,
  });
  return freeze({
    passed: result.status === 'SEPARATELY_FRAMED_COMMON_REZEROING_DERIVED'
      && result.passed
      && result.original.seam_defect === -3
      && result.transformed.seam_defect === -3,
    result,
  });
}

function associativeDecompositionCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') return freeze({ passed: false, paste });

  const external = [
    { coordinate: paste.x, value: 2 },
    { coordinate: paste.y, value: -1 },
    { coordinate: paste.z, value: 2 },
    { coordinate: paste.xyz, value: -3 },
  ];

  const leftA = framingWith(external, paste.xy, 7);
  const leftB = framingWith(external, paste.xy, 7);
  const rightA = framingWith(external, paste.yz, -5);
  const rightB = framingWith(external, paste.yz, -5);
  if (![leftA, leftB, rightA, rightB].every(Boolean)) return freeze({ passed: false, paste });

  const left = separatelyFramedBar2Gluing({
    faceA: oneTerm(paste.x, paste.y, 1, '[x|y]'),
    faceB: oneTerm(paste.xy, paste.z, 1, '[x★y|z]'),
    seam: paste.xy,
    lambdaA: leftA,
    lambdaB: leftB,
    declaredPaste: paste.left_chain,
  });
  const right = separatelyFramedBar2Gluing({
    faceA: oneTerm(paste.y, paste.z, 1, '[y|z]'),
    faceB: oneTerm(paste.x, paste.yz, 1, '[x|y★z]'),
    seam: paste.yz,
    lambdaA: rightA,
    lambdaB: rightB,
    declaredPaste: paste.right_chain,
  });

  return freeze({
    passed: left.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED'
      && right.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED'
      && left.seam_defect === 0
      && right.seam_defect === 0
      && left.external_frame_pairing === right.external_frame_pairing
      && left.raw_pasted_interior === right.raw_pasted_interior
      && left.facewise_relative_sum === right.facewise_relative_sum,
    paste,
    left,
    right,
    left_internal_frame: 7,
    right_internal_frame: -5,
  });
}

function translation(offset) {
  if (!Number.isInteger(offset)) return null;
  return freeze({
    offset: canonicalInteger(offset),
    apply: (n) => (Number.isInteger(n) ? canonicalInteger(n + offset) : null),
  });
}

function translationCompositionCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') return freeze({ passed: false, paste });
  const framing = framingWith([
    { coordinate: paste.x, value: 1 },
    { coordinate: paste.y, value: 0 },
    { coordinate: paste.z, value: 1 },
    { coordinate: paste.xyz, value: 2 },
  ], paste.xy, 4);
  if (!framing) return freeze({ passed: false, paste });

  const glued = separatelyFramedBar2Gluing({
    faceA: oneTerm(paste.x, paste.y, 1, '[x|y]'),
    faceB: oneTerm(paste.xy, paste.z, 1, '[x★y|z]'),
    seam: paste.xy,
    lambdaA: framing,
    lambdaB: framing,
    declaredPaste: paste.left_chain,
  });
  if (glued.status !== 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED') return freeze({ passed: false, glued });

  const tauA = translation(glued.relative_a);
  const tauB = translation(glued.relative_b);
  const tauSum = translation(glued.facewise_relative_sum);
  const probe = 11;
  const composed = tauA.apply(tauB.apply(probe));
  const direct = tauSum.apply(probe);

  const reversed = scaleBar2Chain(paste.left_chain, -1);
  const wholeFraming = finiteBoundaryFraming([]);
  const whole = boundaryFramedRelativeBar2Pairing(paste.left_chain, wholeFraming);
  const reverseWhole = boundaryFramedRelativeBar2Pairing(reversed.chain, wholeFraming);
  const tauWhole = translation(whole.value);
  const tauReverse = translation(reverseWhole.value);
  const inverseProbe = tauReverse.apply(tauWhole.apply(probe));

  const zero = boundaryFramedRelativeBar2Pairing([], wholeFraming);
  const tauZero = translation(zero.value);

  const z = relationBarCycle();
  const closed = boundaryFramedRelativeBar2Pairing(z.chain, wholeFraming);
  const inherited = barH2Period(z.chain);
  const tauClosed = translation(closed.value);

  return freeze({
    passed: tauA && tauB && tauSum
      && composed === direct
      && direct === probe + glued.facewise_relative_sum
      && whole.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && reverseWhole.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && reverseWhole.value === -whole.value
      && inverseProbe === probe
      && zero.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && zero.value === 0
      && tauZero.apply(probe) === probe
      && z.passed
      && closed.status === 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED'
      && closed.value === 2
      && inherited.status === 'BAR_H2_PERIOD_DERIVED'
      && inherited.period === 2
      && tauClosed.apply(probe) === probe + 2,
    glued,
    composition_probe: { probe, composed, direct },
    orientation_inverse_probe: { probe, after_forward_and_reverse: inverseProbe },
    zero,
    closed,
    inherited,
  });
}

function declaredPasteHostileCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') return freeze({ passed: false, paste });
  const framing = finiteBoundaryFraming([]);
  const result = separatelyFramedBar2Gluing({
    faceA: oneTerm(paste.x, paste.y, 1, '[x|y]'),
    faceB: oneTerm(paste.xy, paste.z, 1, '[x★y|z]'),
    seam: paste.xy,
    lambdaA: framing,
    lambdaB: framing,
    declaredPaste: paste.right_chain,
  });
  return freeze({
    passed: result.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_FALSE_DECLARED_PASTE',
    result,
  });
}

function invalidFramingAndSeamCertificate() {
  const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
  if (paste.status !== 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED') return freeze({ passed: false, paste });
  const valid = finiteBoundaryFraming([]);
  const nonnormalized = () => 1;
  const labeledSeam = freeze({ ...paste.xy, receipt: 'not-math' });
  const absentSeam = paste.xyz;
  const faceA = oneTerm(paste.x, paste.y, 1, '[x|y]');
  const faceB = oneTerm(paste.xy, paste.z, 1, '[x★y|z]');

  const badFraming = separatelyFramedBar2Gluing({
    faceA, faceB, seam: paste.xy, lambdaA: nonnormalized, lambdaB: valid,
  });
  const badLabel = separatelyFramedBar2Gluing({
    faceA, faceB, seam: labeledSeam, lambdaA: valid, lambdaB: valid,
  });
  const missing = separatelyFramedBar2Gluing({
    faceA, faceB, seam: absentSeam, lambdaA: valid, lambdaB: valid,
  });

  return freeze({
    passed: badFraming.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS'
      && badLabel.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS'
      && missing.status === 'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_UNLAWFUL_SEAM_ORIENTATION'
      && missing.seam_coefficient_a === 0,
    bad_framing: badFraming,
    receipt_labeled_seam: badLabel,
    absent_seam: missing,
  });
}

export function separatelyFramedBar2GluingSeamDefectCertificate() {
  const matched = matchedMismatchCertificate();
  const wrong = wrongOrientationCertificate();
  const rezeroing = commonRezeroingCertificate();
  const associative = associativeDecompositionCertificate();
  const translations = translationCompositionCertificate();
  const falsePaste = declaredPasteHostileCertificate();
  const invalid = invalidFramingAndSeamCertificate();

  const canonicalClassifications = freeze([
    'SEPARATELY_FRAMED_LAWFUL_BAR_TWO_FACES_GLUE_WITH_AN_EXACT_ORIENTED_SEAM_FRAMING_DEFECT_EQUAL_TO_THE_LEFT_MINUS_RIGHT_SEAM_FRAME_VALUE',
    'MATCHED_INTERNAL_SEAM_FRAMINGS_CANCEL_EXACTLY_AND_THE_RESULTING_FRAMED_RELATIVE_VALUE_IS_INDEPENDENT_OF_THE_INHERITED_ASSOCIATIVE_BAR_TWO_DECOMPOSITION_WHEN_THE_EXTERNAL_FRAMING_IS_FIXED',
    'MATCHED_FRAMED_BAR_TWO_GLUING_INDUCES_ADDITIVE_INTEGER_TORSOR_TRANSLATION_COMPOSITION_WITH_ORIENTATION_REVERSAL_AS_INVERSE_AND_CLOSED_CYCLE_REDUCTION_TO_THE_INHERITED_TAU_2_RETURN',
  ]);
  const quarantines = freeze([
    'separately framed bar-2 gluing != geometric surface gluing',
    'common re-zeroing invariance != connection gauge invariance',
    'boundary framing != 2-connection',
    'bar-3 decomposition independence != arbitrary triangulation invariance',
    'integer torsor translation composition != transport 2-functor',
    'closed tau_2 return != geometric 2-holonomy',
    'formal bar-2 chain != operational T/Q loop or physical surface',
  ]);

  const passed = matched.passed
    && wrong.passed
    && rezeroing.passed
    && associative.passed
    && translations.passed
    && falsePaste.passed
    && invalid.passed;

  return freeze({
    status: passed
      ? 'SEPARATELY_FRAMED_BAR_2_GLUING_SEAM_DEFECT_CERTIFICATE_PASSED'
      : 'SEPARATELY_FRAMED_BAR_2_GLUING_SEAM_DEFECT_CERTIFICATE_FAILED',
    passed,
    matched_and_mismatch: matched,
    wrong_orientation: wrong,
    common_rezeroing: rezeroing,
    associative_decomposition: associative,
    translation_composition: translations,
    false_declared_paste: falsePaste,
    invalid_framing_and_seam: invalid,
    canonical_classifications: canonicalClassifications,
    quarantines,
    formal_framed_degree_two_transport_composition_candidate_bearing: true,
    transport_two_functor_promoted: false,
    two_holonomy_promoted: false,
    connection_promoted: false,
  });
}
