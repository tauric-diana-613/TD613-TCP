import {
  firstMomentLiftSpectrum,
  liftSpectrumParameters,
} from './aperture-pedagogue-first-moment-lift-spectrum-irreversibility.js';
import {
  auditCustodyScheme,
  decodeFirstMomentRank,
  encodeFirstMomentRank,
  minimumCustodyRequirement,
} from './aperture-pedagogue-minimum-first-moment-custody-bound.js';
import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';

export const FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_SCHEMA = 'td613.a15-r0.aperture-pedagogue-fixed-width-custody-admissibility-frontier/v0.1';
export const FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_PARENT_RECEIPT = '76e3726ba58f7b4b5594c0a41557e26d58e4b62a';
export const FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const plainBase = (base) => freeze({ t: base.t, E: base.E, O: base.O });
const keyOf = (value) => JSON.stringify(value);

function validFixedWidthBits(bits) {
  return Number.isSafeInteger(bits) && bits >= 0 && bits <= 52;
}

export function fixedWidthCapacity(bits) {
  if (!validFixedWidthBits(bits)) return null;
  const capacity = 2 ** bits;
  return Number.isSafeInteger(capacity) ? capacity : null;
}

export function fixedWidthCustodyAdmissibility(base, bits) {
  const capacity = fixedWidthCapacity(bits);
  const requirement = minimumCustodyRequirement(base);
  const params = liftSpectrumParameters(base);
  if (capacity === null) {
    return freeze({ status: 'FIXED_WIDTH_CUSTODY_BITS_OUTSIDE_SAFE_IMPLEMENTATION_DOMAIN' });
  }
  if (requirement.status !== 'MINIMUM_FIRST_MOMENT_CUSTODY_REQUIREMENT_DERIVED'
      || params.status !== 'FIRST_MOMENT_LIFT_SPECTRUM_PARAMETERS_DERIVED') {
    return freeze({ status: requirement.status });
  }
  const required = requirement.minimum_alphabet_cardinality;
  const admissible = required <= capacity;
  const M = required - 1;
  const frontierLimit = capacity - 1;
  return freeze({
    status: 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED',
    base: plainBase(base),
    bits,
    label_capacity: capacity,
    lift_cardinality: required,
    M,
    frontier_limit: frontierLimit,
    admissible,
    classification: admissible
      ? 'FIXED_WIDTH_EXACT_FIRST_MOMENT_CUSTODY_ADMISSIBLE_AT_BASE'
      : 'FIXED_WIDTH_EXACT_FIRST_MOMENT_CUSTODY_FORBIDDEN_AT_BASE',
    symbolic_condition: base.t === 0
      ? 'ROUTE_REALIZABLE_t0_HAS_SINGLETON_LIFT_SPECTRUM'
      : 'floor(t/2)E+floor((t-1)/2)O <= 2^b-1',
  });
}

function encodeBinaryRank(rank, bits) {
  const capacity = fixedWidthCapacity(bits);
  if (capacity === null || !Number.isSafeInteger(rank) || rank < 0 || rank >= capacity) return null;
  if (bits === 0) return rank === 0 ? '' : null;
  return rank.toString(2).padStart(bits, '0');
}

function decodeBinaryRank(label, bits) {
  const capacity = fixedWidthCapacity(bits);
  if (capacity === null || typeof label !== 'string' || label.length !== bits || !/^[01]*$/.test(label)) return null;
  const rank = bits === 0 ? 0 : Number.parseInt(label, 2);
  if (!Number.isSafeInteger(rank) || rank < 0 || rank >= capacity) return null;
  return rank;
}

export function encodeFirstMomentFixedWidth(base, P, bits) {
  const admissibility = fixedWidthCustodyAdmissibility(base, bits);
  if (admissibility.status !== 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED') {
    return freeze({ status: admissibility.status });
  }
  if (!admissibility.admissible) {
    return freeze({
      status: 'FIXED_WIDTH_EXACT_FIRST_MOMENT_ENCODING_FORBIDDEN_OUTSIDE_ADMISSIBILITY_DOMAIN',
      base: admissibility.base,
      bits,
    });
  }
  const rank = encodeFirstMomentRank(base, P);
  if (rank.status !== 'FIRST_MOMENT_RANK_ENCODED') {
    return freeze({ status: rank.status });
  }
  const label = encodeBinaryRank(rank.R, bits);
  if (label === null) {
    return freeze({ status: 'FIXED_WIDTH_FIRST_MOMENT_ENCODER_INTERNAL_MISMATCH' });
  }
  return freeze({
    status: 'FIXED_WIDTH_FIRST_MOMENT_ENCODED',
    base: admissibility.base,
    bits,
    P,
    R: rank.R,
    label,
  });
}

export function decodeFirstMomentFixedWidth(base, label, bits) {
  const admissibility = fixedWidthCustodyAdmissibility(base, bits);
  if (admissibility.status !== 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED') {
    return freeze({ status: admissibility.status });
  }
  if (!admissibility.admissible) {
    return freeze({
      status: 'FIXED_WIDTH_EXACT_FIRST_MOMENT_DECODING_FORBIDDEN_OUTSIDE_ADMISSIBILITY_DOMAIN',
      base: admissibility.base,
      bits,
    });
  }
  const R = decodeBinaryRank(label, bits);
  if (R === null) return freeze({ status: 'FIXED_WIDTH_FIRST_MOMENT_DECODER_LABEL_INVALID' });
  const decoded = decodeFirstMomentRank(base, R);
  if (decoded.status === 'FIRST_MOMENT_RANK_DECODER_LABEL_OUTSIDE_LAWFUL_ALPHABET') {
    return freeze({
      status: 'FIXED_WIDTH_LABEL_UNUSED_FOR_THIS_BASE_ABSTAINS',
      base: admissibility.base,
      bits,
      label,
      R,
    });
  }
  if (decoded.status !== 'FIRST_MOMENT_RANK_DECODED') return freeze({ status: decoded.status });
  return freeze({
    status: 'FIXED_WIDTH_FIRST_MOMENT_DECODED',
    base: admissibility.base,
    bits,
    label,
    R,
    P: decoded.P,
  });
}

export function fixedWidthRoundTripCertificate(base, bits) {
  const admissibility = fixedWidthCustodyAdmissibility(base, bits);
  if (admissibility.status !== 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED') {
    return freeze({ status: admissibility.status });
  }
  const spectrum = firstMomentLiftSpectrum(base);
  if (spectrum.status !== 'EXACT_ROUTE_REALIZABLE_FIRST_MOMENT_LIFT_SPECTRUM_DERIVED') {
    return freeze({ status: spectrum.status });
  }
  if (!admissibility.admissible) {
    return freeze({
      status: 'FIXED_WIDTH_ROUND_TRIP_NOT_APPLICABLE_OUTSIDE_ADMISSIBILITY_DOMAIN',
      base: admissibility.base,
      bits,
      admissibility,
    });
  }
  const rows = spectrum.values.map((P) => {
    const encoded = encodeFirstMomentFixedWidth(base, P, bits);
    const decoded = encoded.status === 'FIXED_WIDTH_FIRST_MOMENT_ENCODED'
      ? decodeFirstMomentFixedWidth(base, encoded.label, bits)
      : freeze({ status: 'FIXED_WIDTH_ROUND_TRIP_ENCODING_FAILED' });
    return freeze({
      P,
      encoded,
      decoded,
      passed: encoded.status === 'FIXED_WIDTH_FIRST_MOMENT_ENCODED'
        && decoded.status === 'FIXED_WIDTH_FIRST_MOMENT_DECODED'
        && decoded.P === P,
    });
  });
  const labels = rows.map((row) => row.encoded.label);
  const injective = new Set(labels).size === labels.length;
  return freeze({
    status: rows.every((row) => row.passed) && injective
      ? 'FIXED_WIDTH_EXACT_FIRST_MOMENT_ROUND_TRIP_WITNESSED'
      : 'FIXED_WIDTH_FIRST_MOMENT_ROUND_TRIP_INTERNAL_MISMATCH',
    base: admissibility.base,
    bits,
    rows: freeze(rows),
    injective,
    unused_label_count: admissibility.label_capacity - spectrum.cardinality,
  });
}

export function universalFixedWidthCounterexample(bits) {
  const capacity = fixedWidthCapacity(bits);
  if (capacity === null) return freeze({ status: 'FIXED_WIDTH_COUNTEREXAMPLE_BITS_OUTSIDE_SAFE_IMPLEMENTATION_DOMAIN' });
  const base = freeze({ t: 2, E: capacity, O: 0 });
  const admissibility = fixedWidthCustodyAdmissibility(base, bits);
  const expectedCardinality = capacity + 1;
  const passed = admissibility.status === 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED'
    && admissibility.M === capacity
    && admissibility.lift_cardinality === expectedCardinality
    && !admissibility.admissible;
  return freeze({
    status: passed
      ? 'FINITE_FIXED_WIDTH_UNIVERSALITY_COUNTEREXAMPLE_DERIVED'
      : 'FIXED_WIDTH_UNIVERSALITY_COUNTEREXAMPLE_INTERNAL_MISMATCH',
    bits,
    base,
    label_capacity: capacity,
    required_lift_cardinality: expectedCardinality,
    admissibility,
  });
}

function symbolicFrontierCertificate() {
  return freeze({
    passed: true,
    parent_lower_bound: '#740 gives exact b-bit custody iff 2^b >= N_x, provided an injective witnessed encoder/decoder.',
    spectrum_substitution: '#739 gives N_x=M_x+1 for t>=1, with M_x=floor(t/2)E+floor((t-1)/2)O.',
    exact_frontier: '2^b>=M_x+1 iff M_x<=2^b-1.',
    sufficiency: 'Inside the frontier, R=(P-O)/2 lies in {0,...,M_x} subset {0,...,2^b-1}; fixed-width binary rank encoding is injective and decodes P=O+2R.',
    necessity: 'Outside the frontier, N_x>=2^b+1 while the b-bit label set has 2^b elements; injectivity is impossible.',
    t0: 'For route-realizable t=0, O=0 and F_x={0}; every b>=0 is admissible.',
    authority: 'ALL_ROUTE_REALIZABLE_BASES_BY_#739_EXACT_SPECTRUM_PLUS_#740_FINITE_INJECTIVITY_THEOREM',
  });
}

function symbolicUniversalImpossibilityCertificate() {
  return freeze({
    passed: true,
    witness_family: 'For every finite b>=0, x_b=(2,2^b,0).',
    evaluation: 'M_xb=floor(2/2)2^b+floor(1/2)0=2^b, hence N_xb=2^b+1.',
    contradiction: 'A b-bit field has exactly 2^b labels, so no injective exact encoder exists at x_b.',
    conclusion: 'No finite globally fixed binary custody width universally preserves exact first-moment custody over the full route-realizable base domain.',
    proof_scope: 'ALL_FINITE_b_BY_EXPLICIT_FINITE_COUNTEREXAMPLE_FAMILY_NOT_HORIZON_ENUMERATION',
  });
}

function finiteFrontierGridCorroboration() {
  const rows = [];
  for (let bits = 0; bits <= 5; bits += 1) {
    for (let t = 0; t <= 5; t += 1) {
      for (let E = 0; E <= 6; E += 1) {
        for (let O = 0; O <= 6; O += 1) {
          const base = freeze({ t, E, O });
          const admissibility = fixedWidthCustodyAdmissibility(base, bits);
          if (admissibility.status !== 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED') continue;
          const capacity = 2 ** bits;
          const expected = admissibility.lift_cardinality <= capacity;
          const roundTrip = admissibility.admissible ? fixedWidthRoundTripCertificate(base, bits) : null;
          rows.push(freeze({
            base,
            bits,
            expected_match: admissibility.admissible === expected,
            round_trip_match: !admissibility.admissible
              || roundTrip.status === 'FIXED_WIDTH_EXACT_FIRST_MOMENT_ROUND_TRIP_WITNESSED',
          }));
        }
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.expected_match && row.round_trip_match),
    rows: freeze(rows),
    authority: 'FINITE_IMPLEMENTATION_CORROBORATION_ONLY_NOT_UNIVERSAL_PROOF',
  });
}

function sharpBoundaryHostile() {
  const rows = [];
  for (let bits = 0; bits <= 6; bits += 1) {
    const capacity = 2 ** bits;
    const insideBase = freeze({ t: 2, E: capacity - 1, O: 0 });
    const outsideBase = freeze({ t: 2, E: capacity, O: 0 });
    const inside = fixedWidthCustodyAdmissibility(insideBase, bits);
    const outside = fixedWidthCustodyAdmissibility(outsideBase, bits);
    rows.push(freeze({
      bits,
      inside,
      outside,
      passed: inside.admissible
        && inside.M === capacity - 1
        && inside.lift_cardinality === capacity
        && !outside.admissible
        && outside.M === capacity
        && outside.lift_cardinality === capacity + 1,
    }));
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function mixedBoundaryHostile() {
  const bits = 2;
  const insideBase = freeze({ t: 3, E: 1, O: 2 });
  const outsideBase = freeze({ t: 3, E: 2, O: 2 });
  const inside = fixedWidthCustodyAdmissibility(insideBase, bits);
  const outside = fixedWidthCustodyAdmissibility(outsideBase, bits);
  const roundTrip = fixedWidthRoundTripCertificate(insideBase, bits);
  return freeze({
    passed: inside.M === 3
      && inside.lift_cardinality === 4
      && inside.admissible
      && roundTrip.status === 'FIXED_WIDTH_EXACT_FIRST_MOMENT_ROUND_TRIP_WITNESSED'
      && outside.M === 4
      && outside.lift_cardinality === 5
      && !outside.admissible,
    bits,
    inside,
    outside,
    round_trip: roundTrip,
  });
}

function offByOneFrontierHostile() {
  const rows = [];
  for (let bits = 0; bits <= 8; bits += 1) {
    const counterexample = universalFixedWidthCounterexample(bits);
    rows.push(freeze({
      bits,
      counterexample,
      passed: counterexample.status === 'FINITE_FIXED_WIDTH_UNIVERSALITY_COUNTEREXAMPLE_DERIVED'
        && counterexample.admissibility.M === 2 ** bits
        && !counterexample.admissibility.admissible,
    }));
  }
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function unusedLabelHostile() {
  const base = freeze({ t: 2, E: 1, O: 0 });
  const bits = 2;
  const admissibility = fixedWidthCustodyAdmissibility(base, bits);
  const lawful0 = decodeFirstMomentFixedWidth(base, '00', bits);
  const lawful1 = decodeFirstMomentFixedWidth(base, '01', bits);
  const unused2 = decodeFirstMomentFixedWidth(base, '10', bits);
  const unused3 = decodeFirstMomentFixedWidth(base, '11', bits);
  return freeze({
    passed: admissibility.admissible
      && admissibility.lift_cardinality === 2
      && lawful0.status === 'FIXED_WIDTH_FIRST_MOMENT_DECODED'
      && lawful0.P === 0
      && lawful1.status === 'FIXED_WIDTH_FIRST_MOMENT_DECODED'
      && lawful1.P === 2
      && unused2.status === 'FIXED_WIDTH_LABEL_UNUSED_FOR_THIS_BASE_ABSTAINS'
      && unused3.status === 'FIXED_WIDTH_LABEL_UNUSED_FOR_THIS_BASE_ABSTAINS',
    base,
    bits,
    admissibility,
    lawful0,
    lawful1,
    unused2,
    unused3,
  });
}

function collisionLaunderingHostile() {
  const base = freeze({ t: 2, E: 3, O: 0 });
  const bits = 2;
  const admissibility = fixedWidthCustodyAdmissibility(base, bits);
  const rows = freeze([
    freeze({ P: 0, label: '00' }),
    freeze({ P: 2, label: '01' }),
    freeze({ P: 4, label: '01' }),
    freeze({ P: 6, label: '11' }),
  ]);
  const audit = auditCustodyScheme(base, rows, 2 ** bits);
  return freeze({
    passed: admissibility.admissible
      && admissibility.lift_cardinality === 4
      && !audit.undersized
      && audit.collisions.length === 1
      && !audit.exact,
    base,
    bits,
    admissibility,
    audit,
  });
}

function tZeroRouteRealizabilityHostile() {
  const lawful = fixedWidthCustodyAdmissibility(freeze({ t: 0, E: 17, O: 0 }), 0);
  const unlawful = fixedWidthCustodyAdmissibility(freeze({ t: 0, E: 17, O: 1 }), 4);
  const roundTrip = fixedWidthRoundTripCertificate(freeze({ t: 0, E: 17, O: 0 }), 0);
  return freeze({
    passed: lawful.status === 'FIXED_WIDTH_FIRST_MOMENT_CUSTODY_ADMISSIBILITY_CLASSIFIED'
      && lawful.admissible
      && lawful.lift_cardinality === 1
      && roundTrip.status === 'FIXED_WIDTH_EXACT_FIRST_MOMENT_ROUND_TRIP_WITNESSED'
      && unlawful.status === 'FIRST_MOMENT_LIFT_SPECTRUM_BASE_NOT_ROUTE_REALIZABLE',
    lawful,
    unlawful,
    round_trip: roundTrip,
  });
}

function completeRouteImpersonationHostile() {
  const leftWord = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const rightWord = freeze(['Q', 'T', 'T', 'T', 'Q']);
  const left = firstMomentCoordinate(leftWord);
  const right = firstMomentCoordinate(rightWord);
  const sameC1 = left?.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
    && right?.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
    && left.t === right.t && left.E === right.E && left.O === right.O && left.P === right.P;
  const differentRoutes = keyOf(leftWord) !== keyOf(rightWord);
  const base = freeze({ t: left.t, E: left.E, O: left.O });
  const requirement = minimumCustodyRequirement(base);
  const bits = requirement.minimum_fixed_width_binary_bits;
  const encodedLeft = encodeFirstMomentFixedWidth(base, left.P, bits);
  const encodedRight = encodeFirstMomentFixedWidth(base, right.P, bits);
  return freeze({
    passed: sameC1
      && differentRoutes
      && encodedLeft.status === 'FIXED_WIDTH_FIRST_MOMENT_ENCODED'
      && encodedRight.status === 'FIXED_WIDTH_FIRST_MOMENT_ENCODED'
      && encodedLeft.label === encodedRight.label,
    left_word: leftWord,
    right_word: rightWord,
    left_coordinate: left,
    right_coordinate: right,
    encoded_left: encodedLeft,
    encoded_right: encodedRight,
  });
}

export function runFixedWidthCustodyAdmissibilityFrontierChamber() {
  const symbolicFrontier = symbolicFrontierCertificate();
  const symbolicUniversal = symbolicUniversalImpossibilityCertificate();
  const grid = finiteFrontierGridCorroboration();
  const sharpBoundary = sharpBoundaryHostile();
  const mixedBoundary = mixedBoundaryHostile();
  const offByOne = offByOneFrontierHostile();
  const unusedLabels = unusedLabelHostile();
  const collision = collisionLaunderingHostile();
  const tZero = tZeroRouteRealizabilityHostile();
  const routeImpersonation = completeRouteImpersonationHostile();

  const passed = [
    symbolicFrontier,
    symbolicUniversal,
    grid,
    sharpBoundary,
    mixedBoundary,
    offByOne,
    unusedLabels,
    collision,
    tZero,
    routeImpersonation,
  ].every((certificate) => certificate.passed);

  return freeze({
    schema: FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_SCHEMA,
    parent_receipt: FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_PARENT_RECEIPT,
    gate_issue: FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_GATE_ISSUE,
    status: passed
      ? 'FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_CHAMBER_PASSED'
      : 'FIXED_WIDTH_CUSTODY_ADMISSIBILITY_FRONTIER_CHAMBER_FAILED',
    passed,
    certificates: freeze({
      symbolic_frontier: symbolicFrontier,
      symbolic_universal_impossibility: symbolicUniversal,
      finite_grid_corroboration: grid,
      sharp_boundary_hostile: sharpBoundary,
      mixed_boundary_hostile: mixedBoundary,
      off_by_one_frontier_hostile: offByOne,
      unused_label_hostile: unusedLabels,
      collision_laundering_hostile: collision,
      t_zero_route_realizability_hostile: tZero,
      complete_route_impersonation_hostile: routeImpersonation,
    }),
    candidate_classification: passed
      ? 'FIXED_b_BIT_FIRST_MOMENT_CUSTODY_IS_EXACTLY_ADMISSIBLE_ON_THE_SHARP_DOMAIN_N_x_LE_2_POW_b'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'NO_FINITE_GLOBALLY_FIXED_BINARY_CUSTODY_WIDTH_CAN_UNIVERSALLY_PRESERVE_EXACT_FIRST_MOMENT_HISTORY_OVER_ALL_ROUTE_REALIZABLE_BASES'
      : 'UNCLASSIFIED',
    landing: freeze({
      schema_width_is_claim_authority: true,
      insufficient_width_requires_visible_abstention: true,
      unused_labels_are_not_histories: true,
      exact_first_moment_custody_is_not_complete_route_provenance: true,
    }),
  });
}

export default runFixedWidthCustodyAdmissibilityFrontierChamber;
