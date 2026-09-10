import {
  firstMomentCoordinate,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';
import {
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';

export const FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_SCHEMA = 'td613.a15-r0.aperture-pedagogue-first-moment-lift-spectrum-irreversibility/v0.1';
export const FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_PARENT_RECEIPT = 'ae6c66113954fc9083815eef8dbc7b06b54180f7';
export const FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);

function validBase(base) {
  return base && [base.t, base.E, base.O].every((n) => Number.isInteger(n) && n >= 0);
}

function plainBase(base) {
  return freeze({ t: base.t, E: base.E, O: base.O });
}

function sameBase(left, right) {
  return validBase(left) && validBase(right)
    && left.t === right.t && left.E === right.E && left.O === right.O;
}

function sameC1(left, right) {
  return left?.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
    && right?.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
    && left.t === right.t && left.E === right.E && left.O === right.O && left.P === right.P;
}

export function routeRealizableBase(base) {
  if (!validBase(base)) return false;
  if (base.t === 0) return base.O === 0;
  return true;
}

export function liftSpectrumParameters(base) {
  if (!routeRealizableBase(base)) {
    return freeze({ status: 'FIRST_MOMENT_LIFT_SPECTRUM_BASE_NOT_ROUTE_REALIZABLE' });
  }
  if (base.t === 0) {
    return freeze({
      status: 'FIRST_MOMENT_LIFT_SPECTRUM_PARAMETERS_DERIVED',
      base: plainBase(base),
      a: 0,
      b: 0,
      min: 0,
      max: 0,
      parity: 0,
      cardinality: 1,
    });
  }
  const a = Math.floor(base.t / 2);
  const b = Math.floor((base.t - 1) / 2);
  const span = a * base.E + b * base.O;
  return freeze({
    status: 'FIRST_MOMENT_LIFT_SPECTRUM_PARAMETERS_DERIVED',
    base: plainBase(base),
    a,
    b,
    min: base.O,
    max: base.O + 2 * span,
    parity: base.O % 2,
    cardinality: span + 1,
  });
}

export function firstMomentLiftSpectrum(base) {
  const params = liftSpectrumParameters(base);
  if (params.status !== 'FIRST_MOMENT_LIFT_SPECTRUM_PARAMETERS_DERIVED') {
    return freeze({ status: params.status, values: freeze([]) });
  }
  const values = [];
  for (let p = params.min; p <= params.max; p += 2) values.push(p);
  return freeze({
    status: 'EXACT_ROUTE_REALIZABLE_FIRST_MOMENT_LIFT_SPECTRUM_DERIVED',
    base: params.base,
    values: freeze(values),
    cardinality: values.length,
    min: params.min,
    max: params.max,
    parity: params.parity,
  });
}

export function firstMomentRecoverability(base) {
  const params = liftSpectrumParameters(base);
  if (params.status !== 'FIRST_MOMENT_LIFT_SPECTRUM_PARAMETERS_DERIVED') {
    return freeze({ status: params.status });
  }
  const recoverable = params.cardinality === 1;
  return freeze({
    status: 'FIRST_MOMENT_BASE_RECOVERABILITY_CLASSIFIED',
    base: params.base,
    cardinality: params.cardinality,
    recoverable,
    quotient_loss_irreversible: !recoverable,
    classification: recoverable
      ? 'FIRST_MOMENT_UNIQUELY_RECOVERABLE_FROM_BASE_AT_THIS_COORDINATE'
      : 'FIRST_MOMENT_QUOTIENT_LOSS_IRREVERSIBLE_AT_THIS_BASE_COORDINATE',
  });
}

function repeated(symbol, count) {
  return Array.from({ length: count }, () => symbol);
}

function wordFromBlocks(blocks) {
  const word = [];
  blocks.forEach((qCount, index) => {
    if (index > 0) word.push('T');
    word.push(...repeated('Q', qCount));
  });
  return freeze(word);
}

function distributeWeightedOccupancy(totalCount, maxWeight, targetWeight) {
  if (![totalCount, maxWeight, targetWeight].every((n) => Number.isInteger(n) && n >= 0)) return null;
  if (targetWeight > maxWeight * totalCount) return null;
  const counts = Array(maxWeight + 1).fill(0);
  if (maxWeight === 0) {
    if (targetWeight !== 0) return null;
    counts[0] = totalCount;
    return counts;
  }
  const full = Math.floor(targetWeight / maxWeight);
  const remainder = targetWeight % maxWeight;
  if (full > totalCount || (full === totalCount && remainder !== 0)) return null;
  counts[maxWeight] += full;
  let used = full;
  if (remainder > 0) {
    counts[remainder] += 1;
    used += 1;
  }
  counts[0] += totalCount - used;
  return counts;
}

export function constructRouteForLift(base, P) {
  if (!routeRealizableBase(base) || !Number.isInteger(P) || P < 0) {
    return freeze({ status: 'FIRST_MOMENT_LIFT_CONSTRUCTION_ABSTAINS' });
  }
  const params = liftSpectrumParameters(base);
  if (base.t === 0) {
    if (P !== 0) return freeze({ status: 'FIRST_MOMENT_LIFT_NOT_IN_PREDICTED_SPECTRUM' });
    const word = freeze(repeated('Q', base.E));
    return freeze({
      status: 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED',
      base: plainBase(base),
      P,
      blocks: freeze([base.E]),
      word,
      coordinate: firstMomentCoordinate(word),
    });
  }
  if (P < params.min || P > params.max || (P - base.O) % 2 !== 0) {
    return freeze({ status: 'FIRST_MOMENT_LIFT_NOT_IN_PREDICTED_SPECTRUM' });
  }
  const R = (P - base.O) / 2;
  const evenCapacity = params.a * base.E;
  const oddCapacity = params.b * base.O;
  const evenR = Math.min(R, evenCapacity);
  const oddR = R - evenR;
  if (oddR > oddCapacity) return freeze({ status: 'FIRST_MOMENT_LIFT_CONSTRUCTION_ABSTAINS' });

  const evenOccupancy = distributeWeightedOccupancy(base.E, params.a, evenR);
  const oddOccupancy = distributeWeightedOccupancy(base.O, params.b, oddR);
  if (!evenOccupancy || !oddOccupancy) return freeze({ status: 'FIRST_MOMENT_LIFT_CONSTRUCTION_ABSTAINS' });

  const blocks = Array(base.t + 1).fill(0);
  evenOccupancy.forEach((count, r) => { blocks[2 * r] = count; });
  oddOccupancy.forEach((count, r) => { blocks[2 * r + 1] = count; });
  const word = wordFromBlocks(blocks);
  const coordinate = firstMomentCoordinate(word);
  const quotient = quotientCoordinate(word);
  const passed = coordinate?.status === 'FIRST_MOMENT_WEAKER_TRANSPORT_COORDINATE_DERIVED'
    && coordinate.P === P
    && coordinate.t === base.t && coordinate.E === base.E && coordinate.O === base.O
    && quotient?.status === 'TARGET_EQUIVALENCE_QUOTIENT_COORDINATE_DERIVED'
    && quotient.t === base.t && quotient.E === base.E && quotient.O === base.O;
  return freeze({
    status: passed ? 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED' : 'FIRST_MOMENT_LIFT_CONSTRUCTION_INTERNAL_MISMATCH',
    base: plainBase(base),
    P,
    R,
    even_R: evenR,
    odd_R: oddR,
    blocks: freeze(blocks),
    word,
    coordinate,
  });
}

function symbolicSpectrumCertificate() {
  return freeze({
    passed: true,
    decomposition: 'P=Σ_i i q_i = O + 2R, where R=Σ_even(i=2r) r q_i + Σ_odd(i=2r+1) r q_i.',
    even_interval: 'With E total Q occupancy across even block weights r=0,...,a, the weighted sum realizes every integer 0,...,aE.',
    odd_interval: 'With O total Q occupancy across odd block weights r=0,...,b, the residual weighted sum realizes every integer 0,...,bO.',
    constructive_lemma: 'For 0<=s<=AN, write s=kA+r. Use k occupants at weight A, one at weight r when r>0, and the rest at weight 0. If k=N then r=0.',
    interval_sum: '[0,aE]+[0,bO]=[0,aE+bO], hence F_(t,E,O)={O+2r:0<=r<=aE+bO}.',
    proof_scope: 'ALL_ROUTE_REALIZABLE_BASE_COORDINATES_WITHOUT_HORIZON_ENUMERATION',
  });
}

function routeRealizabilityCertificate() {
  const cases = freeze([
    freeze({ base: freeze({ t: 0, E: 4, O: 0 }), expected: true }),
    freeze({ base: freeze({ t: 0, E: 4, O: 1 }), expected: false }),
    freeze({ base: freeze({ t: 1, E: 4, O: 7 }), expected: true }),
    freeze({ base: freeze({ t: 5, E: 0, O: 0 }), expected: true }),
  ]);
  const rows = cases.map(({ base, expected }) => freeze({ base, expected, actual: routeRealizableBase(base), passed: routeRealizableBase(base) === expected }));
  return freeze({
    passed: rows.every((row) => row.passed),
    rows: freeze(rows),
    symbolic: 'At t=0 only q0 exists, so O=0. For t>=1, q0=E,q1=O and all other qi=0 realizes every E,O.',
  });
}

function extremalWitnessCertificate() {
  const controls = freeze([
    freeze({ t: 1, E: 3, O: 2 }),
    freeze({ t: 2, E: 3, O: 2 }),
    freeze({ t: 3, E: 3, O: 2 }),
    freeze({ t: 4, E: 3, O: 2 }),
    freeze({ t: 5, E: 3, O: 2 }),
  ]);
  const rows = controls.map((base) => {
    const params = liftSpectrumParameters(base);
    const minRoute = constructRouteForLift(base, params.min);
    const maxRoute = constructRouteForLift(base, params.max);
    const closedMax = base.t % 2 === 0
      ? base.t * base.E + (base.t - 1) * base.O
      : (base.t - 1) * base.E + base.t * base.O;
    return freeze({
      base,
      min: params.min,
      max: params.max,
      closed_max: closedMax,
      min_route: minRoute.word,
      max_route: maxRoute.word,
      passed: minRoute.status === 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED'
        && maxRoute.status === 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED'
        && params.min === base.O
        && params.max === closedMax,
    });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

function weakCompositions(total, slots) {
  if (slots === 1) return [[total]];
  const out = [];
  for (let first = 0; first <= total; first += 1) {
    for (const rest of weakCompositions(total - first, slots - 1)) out.push([first, ...rest]);
  }
  return out;
}

function exactSpectrumByBlockEnumeration(base) {
  if (!routeRealizableBase(base)) return [];
  if (base.t === 0) return [0];
  const evenIndexes = Array.from({ length: Math.floor(base.t / 2) + 1 }, (_, r) => 2 * r);
  const oddIndexes = Array.from({ length: Math.floor((base.t - 1) / 2) + 1 }, (_, r) => 2 * r + 1);
  const values = new Set();
  for (const evens of weakCompositions(base.E, evenIndexes.length)) {
    for (const odds of weakCompositions(base.O, oddIndexes.length)) {
      const blocks = Array(base.t + 1).fill(0);
      evenIndexes.forEach((index, j) => { blocks[index] = evens[j]; });
      oddIndexes.forEach((index, j) => { blocks[index] = odds[j]; });
      const P = blocks.reduce((sum, count, i) => sum + i * count, 0);
      values.add(P);
    }
  }
  return [...values].sort((a, b) => a - b);
}

function boundedCoordinateGridHostile() {
  const rows = [];
  for (let t = 0; t <= 5; t += 1) {
    for (let E = 0; E <= 3; E += 1) {
      for (let O = 0; O <= 3; O += 1) {
        const base = freeze({ t, E, O });
        if (!routeRealizableBase(base)) continue;
        const predicted = firstMomentLiftSpectrum(base).values;
        const enumerated = exactSpectrumByBlockEnumeration(base);
        rows.push(freeze({ base, predicted, enumerated: freeze(enumerated), equal: keyOf(predicted) === keyOf(enumerated) }));
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    authority: 'BOUNDED_COORDINATE_GRID_IMPLEMENTATION_HOSTILE_ONLY_NOT_THE_UNIVERSAL_PROOF',
  });
}

function requiredSpotHostiles() {
  const cases = freeze([
    freeze({ base: freeze({ t: 0, E: 7, O: 0 }), expected: freeze([0]) }),
    freeze({ base: freeze({ t: 1, E: 4, O: 3 }), expected: freeze([3]) }),
    freeze({ base: freeze({ t: 2, E: 1, O: 0 }), expected: freeze([0, 2]) }),
    freeze({ base: freeze({ t: 2, E: 0, O: 3 }), expected: freeze([3]) }),
    freeze({ base: freeze({ t: 3, E: 1, O: 1 }), expected: freeze([1, 3, 5]) }),
    freeze({ base: freeze({ t: 4, E: 2, O: 1 }), expected: freeze([1, 3, 5, 7, 9, 11]) }),
  ]);
  const rows = cases.map(({ base, expected }) => {
    const actual = firstMomentLiftSpectrum(base);
    const witnesses = actual.values.map((P) => constructRouteForLift(base, P));
    return freeze({
      base,
      expected,
      actual: actual.values,
      witness_count: witnesses.length,
      passed: keyOf(actual.values) === keyOf(expected)
        && witnesses.every((witness) => witness.status === 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED'),
    });
  });
  const parityBase = freeze({ t: 3, E: 1, O: 1 });
  const wrongParity = constructRouteForLift(parityBase, 2);
  const outOfBounds = constructRouteForLift(parityBase, 7);
  const impossibleT0 = firstMomentLiftSpectrum(freeze({ t: 0, E: 2, O: 1 }));
  return freeze({
    passed: rows.every((row) => row.passed)
      && wrongParity.status === 'FIRST_MOMENT_LIFT_NOT_IN_PREDICTED_SPECTRUM'
      && outOfBounds.status === 'FIRST_MOMENT_LIFT_NOT_IN_PREDICTED_SPECTRUM'
      && impossibleT0.status === 'FIRST_MOMENT_LIFT_SPECTRUM_BASE_NOT_ROUTE_REALIZABLE',
    rows: freeze(rows),
    wrong_parity: wrongParity.status,
    out_of_bounds: outOfBounds.status,
    t0_odd_load_rejection: impossibleT0.status,
  });
}

function recoverabilityLocusCertificate() {
  const symbolic = freeze({
    t0: 'For route-realizable t=0, cardinality=1.',
    t1: 'a=b=0, so cardinality=1 for all E,O.',
    t2: 'a=1,b=0, so cardinality=E+1; unique iff E=0.',
    t_ge_3: 'a>=1 and b>=1, so cardinality=aE+bO+1; unique iff E=O=0.',
  });
  const controls = freeze([
    freeze({ base: freeze({ t: 0, E: 9, O: 0 }), irreversible: false }),
    freeze({ base: freeze({ t: 1, E: 9, O: 9 }), irreversible: false }),
    freeze({ base: freeze({ t: 2, E: 0, O: 9 }), irreversible: false }),
    freeze({ base: freeze({ t: 2, E: 1, O: 0 }), irreversible: true }),
    freeze({ base: freeze({ t: 3, E: 0, O: 1 }), irreversible: true }),
    freeze({ base: freeze({ t: 7, E: 1, O: 0 }), irreversible: true }),
    freeze({ base: freeze({ t: 7, E: 0, O: 0 }), irreversible: false }),
  ]);
  const rows = controls.map(({ base, irreversible }) => {
    const actual = firstMomentRecoverability(base);
    return freeze({ base, expected_irreversible: irreversible, actual, passed: actual.quotient_loss_irreversible === irreversible });
  });
  return freeze({ passed: rows.every((row) => row.passed), symbolic, rows: freeze(rows) });
}

function decoderImpossibilityCertificate() {
  const base = freeze({ t: 2, E: 1, O: 0 });
  const low = constructRouteForLift(base, 0);
  const high = constructRouteForLift(base, 2);
  const cLow = firstMomentCoordinate(low.word);
  const cHigh = firstMomentCoordinate(high.word);
  return freeze({
    passed: low.status === 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED'
      && high.status === 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED'
      && cLow.P !== cHigh.P
      && cLow.t === cHigh.t && cLow.E === cHigh.E && cLow.O === cHigh.O,
    base,
    first_lift: freeze({ P: cLow.P, word: low.word }),
    second_lift: freeze({ P: cHigh.P, word: high.word }),
    theorem: 'Because two distinct C1_real coordinates project to the same B coordinate, no D:B->C1_real can satisfy D(r(c))=c for every route-realizable first-moment coordinate c.',
    anti_equivalence: 'A set-theoretic section that chooses one lift is not recovery of the pre-projection lift.',
  });
}

function ambientExtensionQuarantine() {
  const base = freeze({ t: 2, E: 1, O: 0 });
  const spectrum = firstMomentLiftSpectrum(base);
  return freeze({
    passed: keyOf(spectrum.values) === keyOf([0, 2]) && !spectrum.values.includes(-1) && !spectrum.values.includes(1) && !spectrum.values.includes(3),
    base,
    route_realizable_fibers: spectrum.values,
    ambient_extension_examples_not_route_realizable: freeze([-1, 1, 3, 100]),
    lesson: 'The ambient integer cocycle-extension fiber Z is not the route-realizable first-moment spectrum over a base.',
  });
}

function incompleteRouteLedgerQuarantine() {
  const left = freeze(['T', 'Q', 'T', 'Q', 'T']);
  const right = freeze(['Q', 'T', 'T', 'T', 'Q']);
  const cLeft = firstMomentCoordinate(left);
  const cRight = firstMomentCoordinate(right);
  return freeze({
    passed: keyOf(left) !== keyOf(right) && sameC1(cLeft, cRight),
    left,
    right,
    shared_C1: freeze({ t: cLeft.t, E: cLeft.E, O: cLeft.O, P: cLeft.P }),
    lesson: 'Distinct route spellings may share the same first-moment lift; lift spectrum is not complete route provenance.',
  });
}

function landingEthicCertificate() {
  const ambiguous = firstMomentRecoverability(freeze({ t: 3, E: 1, O: 1 }));
  const unique = firstMomentRecoverability(freeze({ t: 1, E: 4, O: 3 }));
  return freeze({
    passed: ambiguous.quotient_loss_irreversible === true
      && unique.recoverable === true,
    child_legible_rule: 'If more than one lawful first-moment lift survives above the operational base, display ambiguity; do not fabricate a unique erased past.',
    good_through: '󐘓 U+10D613',
    no_mirror_recovery: true,
  });
}

export function runFirstMomentLiftSpectrumIrreversibilityAssay() {
  const symbolic = symbolicSpectrumCertificate();
  const realizability = routeRealizabilityCertificate();
  const spots = requiredSpotHostiles();
  const grid = boundedCoordinateGridHostile();
  const extremals = extremalWitnessCertificate();
  const locus = recoverabilityLocusCertificate();
  const decoder = decoderImpossibilityCertificate();
  const ambient = ambientExtensionQuarantine();
  const incomplete = incompleteRouteLedgerQuarantine();
  const landing = landingEthicCertificate();
  const passed = [symbolic, realizability, spots, grid, extremals, locus, decoder, ambient, incomplete, landing]
    .every((certificate) => certificate.passed);
  return freeze({
    schema: FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_SCHEMA,
    status: passed ? 'FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_ASSAY_PASSED' : 'FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_ASSAY_FAILED',
    passed,
    symbolic_spectrum: symbolic,
    route_realizability: realizability,
    required_hostiles: spots,
    bounded_coordinate_grid: grid,
    extremal_witnesses: extremals,
    recoverability_locus: locus,
    decoder_impossibility: decoder,
    ambient_extension_quarantine: ambient,
    incomplete_route_ledger_quarantine: incomplete,
    landing_ethic: landing,
    canonical_classification: passed
      ? 'ROUTE_REALIZABLE_FIRST_MOMENT_LIFTS_FORM_EXACT_PARITY_INTERVAL_WITH_CLOSED_FORM_CARDINALITY_AND_SHARP_BASE_RECOVERABILITY_BOUNDARY'
      : 'FIRST_MOMENT_LIFT_SPECTRUM_THEOREM_NOT_EARNED',
    consequential_classification: passed
      ? 'FIRST_MOMENT_QUOTIENT_LOSS_IS_EXACTLY_LOCALIZED_BY_LIFT_MULTIPLICITY_AND_FORBIDS_UNIVERSAL_BASE_ONLY_RECOVERY_ON_THE_IRREVERSIBILITY_LOCUS'
      : 'FIRST_MOMENT_QUOTIENT_LOSS_IRREVERSIBILITY_NOT_EARNED',
    secondary_classification: passed
      ? 'AMBIENT_INTEGER_COCYCLE_EXTENSION_FIBER_STRICTLY_EXCEEDS_ROUTE_REALIZABLE_FIRST_MOMENT_SPECTRUM_IN_GENERAL'
      : 'AMBIENT_EXTENSION_ROUTE_REALIZABILITY_SEPARATION_NOT_EARNED',
    claim_ceiling: freeze([
      'NO_COMPLETE_ROUTE_RECONSTRUCTION_FROM_FIRST_MOMENT',
      'NO_ROUTE_COUNT_FORMULA_INSIDE_EACH_LIFT',
      'NO_ENTROPY_OR_INFORMATION_THEORY_NUMERICAL_PROMOTION',
      'NO_ASYMPTOTIC_OR_HIGHER_MOMENT_HIERARCHY',
      'NO_FULL_EXTENSION_CLASSIFICATION',
      'NO_GROUP_COMPLETION_OR_GROUP_COHOMOLOGY',
      'NO_INVERSES_GROUPOID_OR_OPERATIONAL_LOOP',
      'NO_CONNECTION_HOLONOMY_CURVATURE_OR_BERRY_PROMOTION',
      'NO_PROTO_LOOM_A16_LIVE_ASH_MERGE_PUBLICATION_PRODUCTION_OR_VERCEL_AUTHORITY',
    ]),
  });
}
