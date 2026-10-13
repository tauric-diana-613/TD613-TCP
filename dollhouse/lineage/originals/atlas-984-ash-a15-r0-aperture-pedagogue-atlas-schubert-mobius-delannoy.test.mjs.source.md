import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_MOBIUS_DELANNOY_CERTIFICATE as cert,
  ATLAS_SCHUBERT_MOBIUS_DELANNOY_PARENT_RECEIPT,
  atlasSchubertMobiusDelannoyClosedPolynomial,
  atlasSchubertMobiusDelannoyCoefficient,
  atlasSchubertMobiusDelannoyDecode,
  atlasSchubertMobiusDelannoyEncode,
  atlasSchubertMobiusDelannoyPathEndpoint,
  atlasSchubertMobiusDelannoyRecursivePolynomial,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-mobius-delannoy.js';

assert.equal(ATLAS_SCHUBERT_MOBIUS_DELANNOY_PARENT_RECEIPT,'776c6ef78011157d3458daf924bbb7cda7566785');
assert.equal(cert.parent_exact,true);
assert.equal(cert.formal_cells,42);
assert.equal(cert.lower_pivot_words,1715);
assert.equal(cert.path_instances,9912);
assert.equal(cert.round_trip_failures,0);
assert.equal(cert.endpoint_failures,0);
assert.equal(cert.rank_gap_failures,0);
assert.equal(cert.mobius_sign_failures,0);
assert.equal(cert.duplicate_interval_failures,0);
assert.equal(cert.comparable_membership_checks,113828);
assert.equal(cert.support_membership_failures,0);
assert.equal(cert.coefficient_checks,112);
assert.equal(cert.coefficient_failures,0);
assert.equal(cert.recurrence_cells,30);
assert.equal(cert.recurrence_coefficient_checks,100);
assert.equal(cert.recurrence_failures,0);
assert.equal(cert.specialization_failures,0);
assert.equal(cert.transpose_checks,36);
assert.equal(cert.transpose_failures,0);
assert.equal(cert.direct_cancellation_failures,0);

assert.deepEqual(cert.aggregate_polynomial,[1715,3829,3101,1099,161,7]);
assert.equal(cert.aggregate_polynomial.reduce((a,b)=>a+b,0),9912);
assert.equal(cert.aggregate_polynomial[0],1715);
assert.equal(cert.aggregate_polynomial[1],3829);
assert.equal(cert.aggregate_polynomial.slice(2).reduce((a,b)=>a+b,0),4368);

assert.deepEqual(atlasSchubertMobiusDelannoyClosedPolynomial(7,3),[84,168,105,20]);
assert.deepEqual(atlasSchubertMobiusDelannoyRecursivePolynomial(7,3),[84,168,105,20]);
assert.equal(atlasSchubertMobiusDelannoyCoefficient(7,3,0),84);
assert.equal(atlasSchubertMobiusDelannoyCoefficient(7,3,1),168);
assert.equal(atlasSchubertMobiusDelannoyCoefficient(7,3,2),105);
assert.equal(atlasSchubertMobiusDelannoyCoefficient(7,3,3),20);
assert.equal(atlasSchubertMobiusDelannoyCoefficient(7,3,4),0);

const markedPath=atlasSchubertMobiusDelannoyEncode([1,0,1,0],[0,2]);
assert.deepEqual(markedPath,['D','D']);
assert.deepEqual(atlasSchubertMobiusDelannoyPathEndpoint(markedPath),{x:2,y:2,diagonal:2});
assert.deepEqual(atlasSchubertMobiusDelannoyDecode(markedPath),{lower:[1,0,1,0],upper:[0,1,0,1],marks:[0,2]});
assert.deepEqual(atlasSchubertMobiusDelannoyEncode([1,0],[]),['N','E']);
assert.deepEqual(atlasSchubertMobiusDelannoyEncode([1,0],[0]),['D']);

assert.equal(cert.anchor.d,7);
assert.equal(cert.anchor.k,3);
assert.deepEqual(cert.anchor.polynomial,[84,168,105,20]);
assert.equal(cert.anchor.labels,84);
assert.equal(cert.anchor.comparable,2520);
assert.equal(cert.anchor.nonzero,377);
assert.equal(cert.anchor.positive,189);
assert.equal(cert.anchor.negative,188);
assert.equal(cert.anchor.signed,1);
assert.equal(cert.anchor.passed,true);

for(const [name,value] of Object.entries(cert.hostile_controls))assert.equal(value,true,`hostile control failed: ${name}`);

for(const membrane of [
  'MOBIUS_SUPPORT != ENTIRE_CLOSURE_RELATION',
  'DELANNOY_PATH != PHYSICAL_TRAJECTORY',
  'DIAGONAL_STEP != CAUSAL_JUMP',
  'SIGNED_CANCELLATION != DELETION_OF_EVIDENCE',
  'COEFFICIENT_ONE_EQUALS_COVER_COUNT != MOBIUS_SUPPORT_EQUALS_HASSE_DIAGRAM',
  'RECTANGLE_TRANSPOSE_SYMMETRY != ATLAS_PHYSICAL_DUALITY',
  'FORMAL_PARAMETER_SYMMETRY != FUNCTORIAL_EQUIVALENCE',
  'SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY',
])assert.equal(cert.membranes.includes(membrane),true);

assert.equal(cert.laws.physical_trajectory_claimed,false);
assert.equal(cert.laws.causal_jump_claimed,false);
assert.equal(cert.laws.probability_claimed,false);
assert.equal(cert.laws.basis_free_canonical_geometry_claimed,false);
assert.equal(cert.passed,true);
console.log('Ash A15-R0 Atlas Schubert Möbius-Delannoy canonical tests passed.');
