export const PARENT_792_RECEIPT = 'e15d6737f2d43e01835a643790b1c5f51a1dc711';
export const FADT_752_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';
export const BENCH_790_RECEIPT = 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb';

export const CECH_NERVE_DESCENT_SCHEMA = 'td613.a15-r0.cech-nerve-descent-nonidentifiability/v0.1';

function requireIntegerAtLeast(value, minimum, label) {
  if (!Number.isInteger(value) || value < minimum) {
    throw new TypeError(`${label} must be an integer >= ${minimum}`);
  }
}

function canonicalSet(values) {
  return [...new Set(values)].sort();
}

function setIntersection(sets) {
  if (sets.length === 0) return [];
  let current = new Set(sets[0]);
  for (const values of sets.slice(1)) {
    const next = new Set(values);
    current = new Set([...current].filter(value => next.has(value)));
  }
  return [...current].sort();
}

function setUnion(sets) {
  return canonicalSet(sets.flat());
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return left.filter(value => !rightSet.has(value)).sort();
}

function nonemptyIndexSubsets(n) {
  requireIntegerAtLeast(n, 1, 'n');
  const subsets = [];
  const current = [];

  function visit(index) {
    if (index === n) {
      if (current.length > 0) subsets.push([...current]);
      return;
    }
    visit(index + 1);
    current.push(index);
    visit(index + 1);
    current.pop();
  }

  visit(0);
  return subsets;
}

export function cechNerve(supports) {
  if (!Array.isArray(supports) || supports.length === 0) {
    throw new TypeError('supports must be a nonempty array');
  }
  const normalized = supports.map((support, index) => {
    if (!Array.isArray(support)) throw new TypeError(`support ${index} must be an array`);
    return canonicalSet(support);
  });

  const simplices = [];
  for (const vertices of nonemptyIndexSubsets(normalized.length)) {
    const intersection = setIntersection(vertices.map(index => normalized[index]));
    if (intersection.length > 0) {
      simplices.push({
        vertices,
        dimension: vertices.length - 1,
        intersection,
      });
    }
  }

  const fVector = [];
  for (const simplex of simplices) {
    fVector[simplex.dimension] = (fVector[simplex.dimension] ?? 0) + 1;
  }

  const signature = simplices
    .map(simplex => simplex.vertices.join(','))
    .sort()
    .join('|');

  return {
    vertex_count: normalized.length,
    simplices,
    simplex_count: simplices.length,
    f_vector: fVector,
    signature,
    full_simplex: simplices.length === (2 ** normalized.length) - 1,
    euler_characteristic: fVector.reduce(
      (sum, count = 0, dimension) => sum + ((dimension % 2 === 0 ? 1 : -1) * count),
      0,
    ),
  };
}

export function fadtFiberProfile(supports) {
  if (!Array.isArray(supports) || supports.length === 0) {
    throw new TypeError('supports must be a nonempty occupied fiber');
  }
  const normalized = supports.map(support => canonicalSet(support));
  const union = setUnion(normalized);
  const intersection = setIntersection(normalized);
  const gap = setDifference(union, intersection);
  const firstKey = JSON.stringify(normalized[0]);
  const constant = normalized.every(support => JSON.stringify(support) === firstKey);
  return {
    supports: normalized,
    union,
    intersection,
    irreducible_gap: gap,
    gap_cardinality: gap.length,
    fiberwise_support_constant: constant,
    exact_descent_authorized: constant && gap.length === 0,
    status: constant && gap.length === 0
      ? 'EXACT_FADT_DESCENT_AUTHORIZED'
      : 'HELD_BY_FADT_IRREDUCIBLE_GAP',
  };
}

export function buildPrivateMarkerFamily(n, {
  commonCore = ['LOCAL_RESULT'],
  privatePrefix = 'PRIVATE',
} = {}) {
  requireIntegerAtLeast(n, 2, 'n');
  const core = canonicalSet(commonCore);
  if (core.length === 0) throw new TypeError('commonCore must be nonempty');
  return Array.from({ length: n }, (_, index) => canonicalSet([
    ...core,
    `${privatePrefix}_${index + 1}`,
  ]));
}

export function buildConstantFamily(n, { commonCore = ['LOCAL_RESULT'] } = {}) {
  requireIntegerAtLeast(n, 2, 'n');
  const core = canonicalSet(commonCore);
  if (core.length === 0) throw new TypeError('commonCore must be nonempty');
  return Array.from({ length: n }, () => [...core]);
}

export function pairedNerveNonidentifiabilityCertificate(n, options = {}) {
  requireIntegerAtLeast(n, 2, 'n');
  const privateFamily = buildPrivateMarkerFamily(n, options);
  const constantFamily = buildConstantFamily(n, options);
  const privateNerve = cechNerve(privateFamily);
  const constantNerve = cechNerve(constantFamily);
  const privateFadt = fadtFiberProfile(privateFamily);
  const constantFadt = fadtFiberProfile(constantFamily);

  const sameNerve = privateNerve.signature === constantNerve.signature;
  const oppositeVerdicts = privateFadt.exact_descent_authorized !== constantFadt.exact_descent_authorized;
  const expectedSimplexCount = (2 ** n) - 1;

  return {
    schema: CECH_NERVE_DESCENT_SCHEMA,
    receipts: {
      parent_792: PARENT_792_RECEIPT,
      fadt_752: FADT_752_RECEIPT,
      bench_790: BENCH_790_RECEIPT,
    },
    n,
    private_family: privateFamily,
    constant_family: constantFamily,
    private_nerve: privateNerve,
    constant_nerve: constantNerve,
    private_fadt: privateFadt,
    constant_fadt: constantFadt,
    same_abstract_nerve: sameNerve,
    opposite_fadt_verdicts: oppositeVerdicts,
    full_simplex_pair: privateNerve.full_simplex && constantNerve.full_simplex,
    expected_full_simplex_count: expectedSimplexCount,
    abstract_nerve_identifies_exact_descent: !(sameNerve && oppositeVerdicts),
    classification: sameNerve && oppositeVerdicts
      ? 'EXACT_FADT_DESCENT_IS_NOT_IDENTIFIABLE_FROM_THE_ABSTRACT_CECH_NERVE_OF_SUPPORT_OVERLAPS_ALONE'
      : 'CERTIFICATE_FAILED',
    claim_ceiling: 'FINITE_SUPPORT_OVERLAP_NERVE_BLINDNESS_ONLY',
    authority_widening: false,
  };
}

export const LOOM_792_PRIVATE_SUPPORTS = Object.freeze([
  Object.freeze(['LOCAL_RESULT', 'ROUTE_HISTORY']),
  Object.freeze(['LOCAL_RESULT', 'TEMPORAL_ORDER']),
  Object.freeze(['LOCAL_RESULT', 'FACE_HOLONOMY']),
  Object.freeze(['LOCAL_RESULT', 'OBSERVABILITY_ECOLOGY']),
]);

export const LOOM_792_CONSTANT_CONTROL = Object.freeze([
  Object.freeze(['LOCAL_RESULT']),
  Object.freeze(['LOCAL_RESULT']),
  Object.freeze(['LOCAL_RESULT']),
  Object.freeze(['LOCAL_RESULT']),
]);

export function loom792CechBlindnessCertificate() {
  const privateNerve = cechNerve(LOOM_792_PRIVATE_SUPPORTS);
  const constantNerve = cechNerve(LOOM_792_CONSTANT_CONTROL);
  const privateFadt = fadtFiberProfile(LOOM_792_PRIVATE_SUPPORTS);
  const constantFadt = fadtFiberProfile(LOOM_792_CONSTANT_CONTROL);
  const sameNerve = privateNerve.signature === constantNerve.signature;
  const oppositeVerdicts = privateFadt.exact_descent_authorized !== constantFadt.exact_descent_authorized;

  return {
    schema: CECH_NERVE_DESCENT_SCHEMA,
    fixture: 'FADT_HOLONOMY_LOOM_792_FOUR_STRATUM_PAIR',
    private_nerve: privateNerve,
    constant_nerve: constantNerve,
    private_fadt: privateFadt,
    constant_fadt: constantFadt,
    expected_f_vector: [4, 6, 4, 1],
    same_abstract_nerve: sameNerve,
    opposite_fadt_verdicts: oppositeVerdicts,
    theorem_holds: sameNerve
      && oppositeVerdicts
      && privateNerve.full_simplex
      && privateNerve.euler_characteristic === 1
      && privateFadt.gap_cardinality === 4
      && constantFadt.gap_cardinality === 0,
    scars: [
      'CONTRACTIBLE_OVERLAP_NERVE != EXACT_DESCENT_AUTHORITY',
      'TRIVIAL_REDUCED_NERVE_HOMOLOGY != FADT_GAP_ZERO',
      'MAXIMAL_FINITE_INTERSECTION_PATTERN != FIBERWISE_SUPPORT_CONSTANCY',
      'LOCAL_OVERLAP_COHERENCE != GLOBAL_EXACT_ADMISSIBILITY_DESCENT',
    ],
    forbidden_promotions: [
      '#788_SCIENTIFIC_BRIDGE_PROMOTION',
      'SHEAF_OR_STACK_DESCENT_AUTHORITY',
      'SEMANTIC_EQUIVALENCE',
      'CROSS_STRATUM_ENCODER_EXISTENCE',
      'LIVE_HOLONOMY_LOOM_RUNTIME',
      'LIVE_ASH_TOMOGRAPHY',
      'PROTO_LOOM_A16',
      'PHYSICAL_TOPOLOGY_OR_HOLONOMY',
      'CONTINUUM_TOMOGRAPHY',
      'MERGE_PUBLICATION_PRODUCTION_VERCEL',
    ],
    authority_widening: false,
  };
}
