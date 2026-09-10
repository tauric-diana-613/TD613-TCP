import assert from 'node:assert/strict';
import {
  CECH_NERVE_DESCENT_SCHEMA,
  PARENT_792_RECEIPT,
  FADT_752_RECEIPT,
  BENCH_790_RECEIPT,
  cechNerve,
  fadtFiberProfile,
  buildPrivateMarkerFamily,
  buildConstantFamily,
  pairedNerveNonidentifiabilityCertificate,
  LOOM_792_PRIVATE_SUPPORTS,
  LOOM_792_CONSTANT_CONTROL,
  loom792CechBlindnessCertificate,
} from '../app/dome-world/previews/a15-r0/cech-nerve-descent-nonidentifiability.js';

function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i += 1) {
    result = (result * (n - (k - i))) / i;
  }
  return result;
}

assert.equal(CECH_NERVE_DESCENT_SCHEMA, 'td613.a15-r0.cech-nerve-descent-nonidentifiability/v0.1');
assert.equal(PARENT_792_RECEIPT, 'e15d6737f2d43e01835a643790b1c5f51a1dc711');
assert.equal(FADT_752_RECEIPT, '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1');
assert.equal(BENCH_790_RECEIPT, 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb');

// Generic paired construction: same maximal nerve, opposite exact-descent verdicts.
for (let n = 2; n <= 8; n += 1) {
  const certificate = pairedNerveNonidentifiabilityCertificate(n);
  assert.equal(certificate.same_abstract_nerve, true, `n=${n}: paired nerves must be identical`);
  assert.equal(certificate.opposite_fadt_verdicts, true, `n=${n}: FADT verdicts must differ`);
  assert.equal(certificate.full_simplex_pair, true, `n=${n}: both nerves must be full simplices`);
  assert.equal(certificate.private_nerve.simplex_count, (2 ** n) - 1, `n=${n}: full simplex count`);
  assert.equal(certificate.constant_nerve.simplex_count, (2 ** n) - 1, `n=${n}: constant full simplex count`);
  assert.deepEqual(
    certificate.private_nerve.f_vector,
    Array.from({ length: n }, (_, dimension) => binomial(n, dimension + 1)),
    `n=${n}: private-family full-simplex f-vector`,
  );
  assert.deepEqual(certificate.private_nerve.f_vector, certificate.constant_nerve.f_vector);
  assert.equal(certificate.private_nerve.euler_characteristic, 1);
  assert.equal(certificate.constant_nerve.euler_characteristic, 1);
  assert.equal(certificate.private_fadt.intersection.includes('LOCAL_RESULT'), true);
  assert.equal(certificate.private_fadt.gap_cardinality, n, `n=${n}: one private gap token per antecedent`);
  assert.equal(certificate.private_fadt.exact_descent_authorized, false);
  assert.equal(certificate.private_fadt.status, 'HELD_BY_FADT_IRREDUCIBLE_GAP');
  assert.equal(certificate.constant_fadt.gap_cardinality, 0);
  assert.equal(certificate.constant_fadt.exact_descent_authorized, true);
  assert.equal(certificate.constant_fadt.status, 'EXACT_FADT_DESCENT_AUTHORIZED');
  assert.equal(certificate.abstract_nerve_identifies_exact_descent, false);
  assert.equal(
    certificate.classification,
    'EXACT_FADT_DESCENT_IS_NOT_IDENTIFIABLE_FROM_THE_ABSTRACT_CECH_NERVE_OF_SUPPORT_OVERLAPS_ALONE',
  );
  assert.equal(certificate.authority_widening, false);
}

// Exact #792 four-stratum instantiation.
const loom = loom792CechBlindnessCertificate();
assert.equal(loom.fixture, 'FADT_HOLONOMY_LOOM_792_FOUR_STRATUM_PAIR');
assert.equal(loom.same_abstract_nerve, true);
assert.equal(loom.opposite_fadt_verdicts, true);
assert.equal(loom.theorem_holds, true);
assert.deepEqual(loom.private_nerve.f_vector, [4, 6, 4, 1]);
assert.deepEqual(loom.constant_nerve.f_vector, [4, 6, 4, 1]);
assert.equal(loom.private_nerve.simplex_count, 15);
assert.equal(loom.constant_nerve.simplex_count, 15);
assert.equal(loom.private_nerve.full_simplex, true);
assert.equal(loom.constant_nerve.full_simplex, true);
assert.equal(loom.private_nerve.euler_characteristic, 1);
assert.equal(loom.constant_nerve.euler_characteristic, 1);
assert.deepEqual(loom.private_fadt.intersection, ['LOCAL_RESULT']);
assert.deepEqual(loom.private_fadt.union, [
  'FACE_HOLONOMY',
  'LOCAL_RESULT',
  'OBSERVABILITY_ECOLOGY',
  'ROUTE_HISTORY',
  'TEMPORAL_ORDER',
]);
assert.deepEqual(loom.private_fadt.irreducible_gap, [
  'FACE_HOLONOMY',
  'OBSERVABILITY_ECOLOGY',
  'ROUTE_HISTORY',
  'TEMPORAL_ORDER',
]);
assert.equal(loom.private_fadt.gap_cardinality, 4);
assert.equal(loom.private_fadt.exact_descent_authorized, false);
assert.deepEqual(loom.constant_fadt.intersection, ['LOCAL_RESULT']);
assert.deepEqual(loom.constant_fadt.union, ['LOCAL_RESULT']);
assert.deepEqual(loom.constant_fadt.irreducible_gap, []);
assert.equal(loom.constant_fadt.exact_descent_authorized, true);
assert.equal(loom.authority_widening, false);

// Hostile: same nerve must NOT be promoted to same FADT verdict.
const privateNerve = cechNerve(LOOM_792_PRIVATE_SUPPORTS);
const constantNerve = cechNerve(LOOM_792_CONSTANT_CONTROL);
const privateFadt = fadtFiberProfile(LOOM_792_PRIVATE_SUPPORTS);
const constantFadt = fadtFiberProfile(LOOM_792_CONSTANT_CONTROL);
assert.equal(privateNerve.signature, constantNerve.signature);
assert.notEqual(privateFadt.exact_descent_authorized, constantFadt.exact_descent_authorized);

// Hostile: full simplex / Euler characteristic one / total common intersection do not imply exact descent.
assert.equal(privateNerve.full_simplex, true);
assert.equal(privateNerve.euler_characteristic, 1);
assert.equal(privateFadt.intersection.length > 0, true);
assert.equal(privateFadt.exact_descent_authorized, false);
assert.equal(privateFadt.gap_cardinality > 0, true);

// Hostile: even every pairwise intersection being nonempty remains insufficient.
for (let i = 0; i < LOOM_792_PRIVATE_SUPPORTS.length; i += 1) {
  for (let j = i + 1; j < LOOM_792_PRIVATE_SUPPORTS.length; j += 1) {
    const pairNerve = cechNerve([LOOM_792_PRIVATE_SUPPORTS[i], LOOM_792_PRIVATE_SUPPORTS[j]]);
    assert.equal(pairNerve.full_simplex, true);
  }
}
assert.equal(privateFadt.exact_descent_authorized, false);

// Hostile: the nerve has forgotten claim labels. Same signature, different unions and gaps.
assert.equal(privateNerve.signature, constantNerve.signature);
assert.notDeepEqual(privateFadt.union, constantFadt.union);
assert.notDeepEqual(privateFadt.irreducible_gap, constantFadt.irreducible_gap);

// Domain guards: the paired theorem requires n>=2 and a nonempty common core.
assert.throws(() => buildPrivateMarkerFamily(1), /n must be an integer >= 2/);
assert.throws(() => buildConstantFamily(1), /n must be an integer >= 2/);
assert.throws(() => buildPrivateMarkerFamily(2, { commonCore: [] }), /commonCore must be nonempty/);
assert.throws(() => buildConstantFamily(2, { commonCore: [] }), /commonCore must be nonempty/);
assert.throws(() => cechNerve([]), /supports must be a nonempty array/);
assert.throws(() => fadtFiberProfile([]), /supports must be a nonempty occupied fiber/);

// Authority ceilings remain explicit and exhaustive enough to catch illicit promotion vocabulary.
for (const forbidden of [
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
]) {
  assert.equal(loom.forbidden_promotions.includes(forbidden), true, `missing forbidden promotion ${forbidden}`);
}

for (const scar of [
  'CONTRACTIBLE_OVERLAP_NERVE != EXACT_DESCENT_AUTHORITY',
  'TRIVIAL_REDUCED_NERVE_HOMOLOGY != FADT_GAP_ZERO',
  'MAXIMAL_FINITE_INTERSECTION_PATTERN != FIBERWISE_SUPPORT_CONSTANCY',
  'LOCAL_OVERLAP_COHERENCE != GLOBAL_EXACT_ADMISSIBILITY_DESCENT',
]) {
  assert.equal(loom.scars.includes(scar), true, `missing scar ${scar}`);
}

console.log('Ash A15-R0 Cech-nerve descent nonidentifiability hostile tests passed.');
