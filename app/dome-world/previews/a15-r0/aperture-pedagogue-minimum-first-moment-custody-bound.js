import {
  firstMomentLiftSpectrum,
  liftSpectrumParameters,
} from './aperture-pedagogue-first-moment-lift-spectrum-irreversibility.js';
import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';

export const MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_SCHEMA = 'td613.a15-r0.aperture-pedagogue-minimum-first-moment-custody-bound/v0.1';
export const MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_PARENT_RECEIPT = 'ffa5756d63f10fa6dc211e4cb07f38fbdc4bee0a';
export const MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const plainBase = (base) => freeze({ t: base.t, E: base.E, O: base.O });
const keyOf = (value) => JSON.stringify(value);

function minimumBinaryBitsForCardinality(cardinality) {
  if (!Number.isSafeInteger(cardinality) || cardinality < 1) return null;
  if (cardinality === 1) return 0;
  return Math.ceil(Math.log2(cardinality));
}

export function minimumCustodyRequirement(base) {
  const params = liftSpectrumParameters(base);
  if (params.status !== 'FIRST_MOMENT_LIFT_SPECTRUM_PARAMETERS_DERIVED') {
    return freeze({ status: params.status });
  }
  const cardinality = params.cardinality;
  if (!Number.isSafeInteger(cardinality) || cardinality < 1) {
    return freeze({ status: 'MINIMUM_FIRST_MOMENT_CUSTODY_NUMERIC_DOMAIN_ABSTAINS' });
  }
  const fixedWidthBinaryBits = minimumBinaryBitsForCardinality(cardinality);
  return freeze({
    status: 'MINIMUM_FIRST_MOMENT_CUSTODY_REQUIREMENT_DERIVED',
    base: params.base,
    lift_cardinality: cardinality,
    minimum_alphabet_cardinality: cardinality,
    minimum_fixed_width_binary_bits: fixedWidthBinaryBits,
    zero_additional_binary_payload: fixedWidthBinaryBits === 0,
    symbolic_basis: 'EXACT_DECODER_FORCES_INJECTIVE_ENCODER_THEN_FINITE_PIGEONHOLE_BOUND',
  });
}

export function encodeFirstMomentRank(base, P) {
  if (!Number.isSafeInteger(P) || P < 0) {
    return freeze({ status: 'FIRST_MOMENT_RANK_ENCODER_ABSTAINS' });
  }
  const spectrum = firstMomentLiftSpectrum(base);
  if (spectrum.status !== 'EXACT_ROUTE_REALIZABLE_FIRST_MOMENT_LIFT_SPECTRUM_DERIVED') {
    return freeze({ status: spectrum.status });
  }
  const index = spectrum.values.indexOf(P);
  if (index < 0) return freeze({ status: 'FIRST_MOMENT_RANK_ENCODER_LIFT_NOT_LAWFUL' });
  const R = base.t === 0 ? 0 : (P - base.O) / 2;
  const passed = Number.isSafeInteger(R) && R === index;
  return freeze({
    status: passed ? 'FIRST_MOMENT_RANK_ENCODED' : 'FIRST_MOMENT_RANK_ENCODER_INTERNAL_MISMATCH',
    base: plainBase(base),
    P,
    R,
    spectrum_index: index,
  });
}

export function decodeFirstMomentRank(base, R) {
  if (!Number.isSafeInteger(R) || R < 0) {
    return freeze({ status: 'FIRST_MOMENT_RANK_DECODER_ABSTAINS' });
  }
  const spectrum = firstMomentLiftSpectrum(base);
  if (spectrum.status !== 'EXACT_ROUTE_REALIZABLE_FIRST_MOMENT_LIFT_SPECTRUM_DERIVED') {
    return freeze({ status: spectrum.status });
  }
  if (R >= spectrum.cardinality) {
    return freeze({ status: 'FIRST_MOMENT_RANK_DECODER_LABEL_OUTSIDE_LAWFUL_ALPHABET' });
  }
  const P = base.t === 0 ? 0 : base.O + 2 * R;
  const passed = spectrum.values[R] === P;
  return freeze({
    status: passed ? 'FIRST_MOMENT_RANK_DECODED' : 'FIRST_MOMENT_RANK_DECODER_INTERNAL_MISMATCH',
    base: plainBase(base),
    R,
    P,
  });
}

export function rankCustodyScheme(base) {
  const spectrum = firstMomentLiftSpectrum(base);
  const requirement = minimumCustodyRequirement(base);
  if (spectrum.status !== 'EXACT_ROUTE_REALIZABLE_FIRST_MOMENT_LIFT_SPECTRUM_DERIVED'
      || requirement.status !== 'MINIMUM_FIRST_MOMENT_CUSTODY_REQUIREMENT_DERIVED') {
    return freeze({ status: 'FIRST_MOMENT_RANK_CUSTODY_SCHEME_ABSTAINS' });
  }
  const rows = spectrum.values.map((P) => {
    const encoded = encodeFirstMomentRank(base, P);
    const decoded = decodeFirstMomentRank(base, encoded.R);
    return freeze({
      P,
      label: encoded.R,
      encoded,
      decoded,
      round_trip: encoded.status === 'FIRST_MOMENT_RANK_ENCODED'
        && decoded.status === 'FIRST_MOMENT_RANK_DECODED'
        && decoded.P === P,
    });
  });
  return freeze({
    status: rows.every((row) => row.round_trip)
      ? 'TIGHT_FIRST_MOMENT_RANK_CUSTODY_SCHEME_DERIVED'
      : 'FIRST_MOMENT_RANK_CUSTODY_SCHEME_INTERNAL_MISMATCH',
    base: plainBase(base),
    declared_alphabet_size: requirement.minimum_alphabet_cardinality,
    fixed_width_binary_bits: requirement.minimum_fixed_width_binary_bits,
    rows: freeze(rows),
  });
}

export function auditCustodyScheme(base, rows, declaredAlphabetSize) {
  const spectrum = firstMomentLiftSpectrum(base);
  const requirement = minimumCustodyRequirement(base);
  if (spectrum.status !== 'EXACT_ROUTE_REALIZABLE_FIRST_MOMENT_LIFT_SPECTRUM_DERIVED'
      || requirement.status !== 'MINIMUM_FIRST_MOMENT_CUSTODY_REQUIREMENT_DERIVED'
      || !Array.isArray(rows)
      || !Number.isSafeInteger(declaredAlphabetSize)
      || declaredAlphabetSize < 1) {
    return freeze({ status: 'FIRST_MOMENT_CUSTODY_SCHEME_AUDIT_ABSTAINS' });
  }

  const lawful = new Set(spectrum.values);
  const rowByP = new Map();
  const labelToP = new Map();
  const duplicateP = [];
  const collisions = [];
  const unlawfulP = [];

  rows.forEach((row) => {
    if (!row || !Number.isSafeInteger(row.P) || !Object.prototype.hasOwnProperty.call(row, 'label')) {
      unlawfulP.push(row?.P ?? null);
      return;
    }
    if (!lawful.has(row.P)) unlawfulP.push(row.P);
    if (rowByP.has(row.P)) duplicateP.push(row.P);
    rowByP.set(row.P, row.label);
    const labelKey = keyOf(row.label);
    if (labelToP.has(labelKey) && labelToP.get(labelKey) !== row.P) {
      collisions.push(freeze({ label: row.label, left_P: labelToP.get(labelKey), right_P: row.P }));
    } else {
      labelToP.set(labelKey, row.P);
    }
  });

  const missingP = spectrum.values.filter((P) => !rowByP.has(P));
  const undersized = declaredAlphabetSize < requirement.minimum_alphabet_cardinality;
  const alphabetOverrun = labelToP.size > declaredAlphabetSize;
  const exact = !undersized
    && !alphabetOverrun
    && collisions.length === 0
    && duplicateP.length === 0
    && unlawfulP.length === 0
    && missingP.length === 0
    && rowByP.size === spectrum.cardinality;

  return freeze({
    status: 'FIRST_MOMENT_CUSTODY_SCHEME_AUDITED',
    base: plainBase(base),
    required_alphabet_size: requirement.minimum_alphabet_cardinality,
    declared_alphabet_size: declaredAlphabetSize,
    distinct_labels_used: labelToP.size,
    undersized,
    alphabet_overrun: alphabetOverrun,
    collisions: freeze(collisions),
    duplicate_P: freeze(duplicateP),
    unlawful_P: freeze(unlawfulP),
    missing_P: freeze(missingP),
    exact,
    classification: exact
      ? 'EXACT_FIRST_MOMENT_CUSTODY_SCHEME_WITNESSED'
      : undersized
        ? 'EXACT_FIRST_MOMENT_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND'
        : 'FIRST_MOMENT_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
  });
}

function symbolicLowerBoundCertificate() {
  return freeze({
    passed: true,
    premise: 'For fixed x, exactness dec_x(enc_x(P))=P for all P in F_x.',
    injectivity: 'If enc_x(P1)=enc_x(P2), applying dec_x gives P1=P2; therefore enc_x is injective.',
    finite_bound: 'An injective map F_x->A_x requires |A_x|>=|F_x|=N_x.',
    tightness: '#739 gives F_x={O+2r:0<=r<=M_x}; R=(P-O)/2 is a bijection to {0,...,M_x}.',
    binary: 'A fixed-width b-bit alphabet has at most 2^b labels, so exactness requires 2^b>=N_x and b>=ceil(log2 N_x).',
    authority: 'ALL_ROUTE_REALIZABLE_BASES_BY_FINITE_INJECTIVITY_PLUS_#739_EXACT_SPECTRUM',
  });
}

function finiteGridCorroboration() {
  const rows = [];
  for (let t = 0; t <= 6; t += 1) {
    for (let E = 0; E <= 4; E += 1) {
      for (let O = 0; O <= 4; O += 1) {
        const base = freeze({ t, E, O });
        const requirement = minimumCustodyRequirement(base);
        if (requirement.status !== 'MINIMUM_FIRST_MOMENT_CUSTODY_REQUIREMENT_DERIVED') continue;
        const spectrum = firstMomentLiftSpectrum(base);
        const scheme = rankCustodyScheme(base);
        rows.push(freeze({
          base,
          cardinality_match: requirement.minimum_alphabet_cardinality === spectrum.cardinality,
          bit_bound_match: requirement.minimum_fixed_width_binary_bits === minimumBinaryBitsForCardinality(spectrum.cardinality),
          rank_round_trip: scheme.status === 'TIGHT_FIRST_MOMENT_RANK_CUSTODY_SCHEME_DERIVED',
        }));
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.cardinality_match && row.bit_bound_match && row.rank_round_trip),
    rows: freeze(rows),
    authority: 'FINITE_IMPLEMENTATION_CORROBORATION_ONLY_NOT_UNIVERSAL_PROOF',
  });
}

function pigeonholeCollisionHostile() {
  const base = freeze({ t: 2, E: 2, O: 0 });
  const spectrum = firstMomentLiftSpectrum(base);
  const rows = freeze([
    freeze({ P: 0, label: 0 }),
    freeze({ P: 2, label: 1 }),
    freeze({ P: 4, label: 0 }),
  ]);
  const audit = auditCustodyScheme(base, rows, 2);
  return freeze({
    passed: spectrum.cardinality === 3
      && audit.undersized
      && audit.collisions.length >= 1
      && !audit.exact
      && audit.classification === 'EXACT_FIRST_MOMENT_RECOVERY_FORBIDDEN_BY_FINITE_CUSTODY_LOWER_BOUND',
    base,
    spectrum,
    audit,
  });
}

function offByOneBitHostile() {
  const base = freeze({ t: 2, E: 2, O: 0 });
  const requirement = minimumCustodyRequirement(base);
  const floorBits = Math.floor(Math.log2(requirement.lift_cardinality));
  const floorCapacity = 2 ** floorBits;
  const ceilBits = requirement.minimum_fixed_width_binary_bits;
  const ceilCapacity = 2 ** ceilBits;
  return freeze({
    passed: requirement.lift_cardinality === 3
      && floorBits === 1
      && floorCapacity === 2
      && floorCapacity < requirement.lift_cardinality
      && ceilBits === 2
      && ceilCapacity >= requirement.lift_cardinality,
    base,
    requirement,
    floor_bits: floorBits,
    floor_capacity: floorCapacity,
    ceil_bits: ceilBits,
    ceil_capacity: ceilCapacity,
  });
}

function capacityNotInjectivityHostile() {
  const base = freeze({ t: 2, E: 2, O: 0 });
  const rows = freeze([
    freeze({ P: 0, label: 'A' }),
    freeze({ P: 2, label: 'A' }),
    freeze({ P: 4, label: 'C' }),
  ]);
  const audit = auditCustodyScheme(base, rows, 3);
  return freeze({
    passed: !audit.undersized
      && audit.declared_alphabet_size === audit.required_alphabet_size
      && audit.collisions.length === 1
      && !audit.exact
      && audit.classification === 'FIRST_MOMENT_CUSTODY_CAPACITY_OR_MAPPING_INSUFFICIENT_FOR_EXACT_RECOVERY',
    audit,
  });
}

function rankTightnessHostile() {
  const bases = freeze([
    freeze({ t: 2, E: 3, O: 1 }),
    freeze({ t: 3, E: 2, O: 2 }),
    freeze({ t: 5, E: 2, O: 3 }),
  ]);
  const rows = bases.map((base) => {
    const scheme = rankCustodyScheme(base);
    const auditRows = scheme.rows.map((row) => freeze({ P: row.P, label: row.label }));
    const audit = auditCustodyScheme(base, auditRows, scheme.declared_alphabet_size);
    return freeze({ base, scheme, audit, passed: scheme.status === 'TIGHT_FIRST_MOMENT_RANK_CUSTODY_SCHEME_DERIVED' && audit.exact });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function zeroBitLocusHostile() {
  const bases = freeze([
    freeze({ t: 0, E: 8, O: 0 }),
    freeze({ t: 1, E: 4, O: 7 }),
    freeze({ t: 2, E: 0, O: 9 }),
    freeze({ t: 4, E: 0, O: 0 }),
  ]);
  const rows = bases.map((base) => {
    const requirement = minimumCustodyRequirement(base);
    const spectrum = firstMomentLiftSpectrum(base);
    return freeze({
      base,
      requirement,
      spectrum,
      passed: spectrum.cardinality === 1
        && requirement.minimum_alphabet_cardinality === 1
        && requirement.minimum_fixed_width_binary_bits === 0,
    });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
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
  return freeze({
    passed: sameC1 && differentRoutes,
    left_word: leftWord,
    right_word: rightWord,
    left_coordinate: left,
    right_coordinate: right,
    anti_equivalence: 'EXACT_FIRST_MOMENT_RECOVERY_DOES_NOT_IMPLY_EXACT_ROUTE_RECOVERY',
  });
}

function rawPControl() {
  const base = freeze({ t: 3, E: 2, O: 1 });
  const spectrum = firstMomentLiftSpectrum(base);
  const rows = freeze(spectrum.values.map((P) => freeze({ P, label: P })));
  const audit = auditCustodyScheme(base, rows, spectrum.cardinality);
  return freeze({
    passed: audit.exact && audit.distinct_labels_used === spectrum.cardinality,
    base,
    audit,
    interpretation: 'Raw P labels can be exact but do not beat the N_x-label lower bound; rank supplies an explicit tight canonical indexing witness.',
  });
}

function receiptExternalityHostile() {
  const base = freeze({ t: 4, E: 2, O: 3 });
  const before = minimumCustodyRequirement(base);
  const labels = freeze(['RECEIPT_A', 'RECEIPT_A_DUPLICATE_NAME_ONLY']);
  const after = minimumCustodyRequirement(base);
  return freeze({
    passed: keyOf(before) === keyOf(after) && labels[0] !== labels[1],
    base,
    before,
    after,
    labels,
  });
}

export function runMinimumFirstMomentCustodyBoundAssay() {
  const symbolic = symbolicLowerBoundCertificate();
  const finite = finiteGridCorroboration();
  const pigeonhole = pigeonholeCollisionHostile();
  const bits = offByOneBitHostile();
  const capacity = capacityNotInjectivityHostile();
  const rank = rankTightnessHostile();
  const zero = zeroBitLocusHostile();
  const route = completeRouteImpersonationHostile();
  const rawP = rawPControl();
  const receipt = receiptExternalityHostile();

  const passed = [symbolic, finite, pigeonhole, bits, capacity, rank, zero, route, rawP, receipt]
    .every((certificate) => certificate.passed);

  return freeze({
    schema: MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_SCHEMA,
    parent_receipt: MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_PARENT_RECEIPT,
    gate_issue: MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_GATE_ISSUE,
    status: passed
      ? 'MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_ASSAY_PASSED'
      : 'MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_ASSAY_FAILED',
    passed,
    symbolic_lower_bound: symbolic,
    finite_grid_corroboration: finite,
    pigeonhole_collision_hostile: pigeonhole,
    off_by_one_bit_hostile: bits,
    capacity_not_injectivity_hostile: capacity,
    rank_tightness_hostile: rank,
    zero_bit_locus_hostile: zero,
    complete_route_impersonation_hostile: route,
    raw_P_control: rawP,
    receipt_externality_hostile: receipt,
    canonical_candidate: passed
      ? 'EXACT_FIRST_MOMENT_RECOVERY_OVER_FIXED_BASE_REQUIRES_AND_ADMITS_A_MINIMUM_CUSTODY_ALPHABET_EQUAL_TO_THE_ROUTE_REALIZABLE_LIFT_MULTIPLICITY'
      : 'NO_CLASSIFICATION_EARNED',
    consequential_candidate: passed
      ? 'UNDERSIZED_CUSTODY_CHANNELS_ARE_FINITE_CERTIFICATES_OF_NONRECOVERABILITY_WHILE_THE_RANK_COORDINATE_GIVES_A_TIGHT_DATA_MINIMIZING_RECOVERY_SCHEME'
      : 'NO_CLASSIFICATION_EARNED',
    claim_ceiling: freeze([
      'NO_SHANNON_ENTROPY_OR_PROBABILISTIC_INFORMATION_THEORY_CLAIM',
      'NO_AVERAGE_OR_VARIABLE_LENGTH_CODING_OPTIMALITY_CLAIM',
      'NO_NOISY_CHANNEL_OR_ERROR_CORRECTION_CLAIM',
      'NO_COMPLETE_ROUTE_CUSTODY_OR_RECONSTRUCTION_CLAIM',
      'NO_ROUTE_COUNTS_INSIDE_ONE_FIRST_MOMENT_LIFT',
      'NO_HIGHER_MOMENT_OR_ASYMPTOTIC_HIERARCHY',
      'NO_FULL_EXTENSION_CLASSIFICATION',
      'NO_GROUP_COMPLETION_COHOMOLOGY_INVERSE_GROUPOID_OR_LOOP_PROMOTION',
      'NO_CONNECTION_HOLONOMY_CURVATURE_BERRY_OR_QUANTUM_ANALOGY',
      'NO_PROTO_LOOM_A16_LIVE_ASH_MERGE_PUBLICATION_PRODUCTION_OR_VERCEL_AUTHORITY',
    ]),
    landing_law: 'PRESERVE_ENOUGH_TO_TELL_THE_TRUTH_UNDERSIZED_CUSTODY_REQUIRES_ABSTENTION_ADEQUATE_WITNESSED_CUSTODY_RECOVERS_ONLY_THE_COORDINATE_ACTUALLY_PRESERVED',
  });
}
