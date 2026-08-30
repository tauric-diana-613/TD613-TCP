import assert from 'node:assert/strict';
import { finitePrimeDualFixedPointRestNormalizerCertificate as certificate } from '../app/dome-world/previews/a15-r0/finite-prime-dual-fixed-point-rest-normalizer.js';

const c=certificate();
assert.equal(c.parent_receipt,'961d6eae8491ca1c72da23c5f23c2b573dc8e8ce');
assert.equal(c.parent_exact,true);
assert.equal(c.inherited,'1111111110');

const expected={
  specialization_comparability:{witnesses:20,families:1048576,minTrue:22,minObstruction:3,transport:3145728,hasse:10485760,zeta:10485760,cnf:3145728},
  principal_open_identity:{witnesses:5,families:32,minTrue:4,minObstruction:2,transport:96,hasse:80,zeta:80,cnf:64},
  principal_open_size:{witnesses:5,families:32,minTrue:4,minObstruction:2,transport:96,hasse:80,zeta:80,cnf:64},
  cut_orientation:{witnesses:10,families:1024,minTrue:16,minObstruction:2,transport:3072,hasse:5120,zeta:5120,cnf:2048},
};

for(const [name,e] of Object.entries(expected)){
  const row=c.classes[name];
  assert.equal(row.witness_count,e.witnesses,name);
  assert.equal(row.family_count,e.families,name);
  assert.equal(row.first_minimal_true_count,e.minTrue,name);
  assert.equal(row.first_minimal_obstruction_count,e.minObstruction,name);
  assert.equal(row.second_minimal_true_count,e.minTrue,name);
  assert.equal(row.second_minimal_obstruction_count,e.minObstruction,name);
  assert.equal(row.transport_truth_intersection_checks,e.transport,name);
  assert.equal(row.first_hasse_edge_checks,e.hasse,name);
  assert.equal(row.success_dnf_subset_zeta_updates,e.zeta,name);
  assert.equal(row.obstruction_cnf_intersection_checks,e.cnf,name);
  assert.equal(row.second_hasse_edge_checks,e.hasse,name);
  assert.equal(row.first_minimal_true_vs_parent_blocker_mismatches,0,name);
  assert.equal(row.first_minimal_obstruction_vs_parent_clutter_mismatches,0,name);
  assert.equal(row.dnf_reconstruction_vs_transport_truth_mismatches,0,name);
  assert.equal(row.cnf_reconstruction_vs_transport_truth_mismatches,0,name);
  assert.equal(row.dnf_vs_cnf_truth_mismatches,0,name);
  assert.equal(row.second_minimal_true_vs_first_mismatches,0,name);
  assert.equal(row.second_minimal_obstruction_vs_first_mismatches,0,name);
  assert.equal(row.prime_dual_normalization_fixed_point,true,name);
  assert.equal(row.closure_parent_consistent,true,name);
  assert.equal(row.passed,true,name);
}

assert.equal(c.ledger.selected_family_count,1049664);
assert.equal(c.ledger.transport_truth_intersection_checks,3148992);
assert.equal(c.ledger.first_hasse_edge_checks,10491040);
assert.equal(c.ledger.success_dnf_subset_zeta_updates,10491040);
assert.equal(c.ledger.obstruction_cnf_intersection_checks,3147904);
assert.equal(c.ledger.second_hasse_edge_checks,10491040);
assert.equal(c.ledger.fixed_work_units,37770016);
assert.equal(c.ledger.minimal_true_count,46);
assert.equal(c.ledger.minimal_obstruction_count,9);
assert.equal(c.ledger.first_minimal_true_vs_parent_blocker_mismatches,0);
assert.equal(c.ledger.first_minimal_obstruction_vs_parent_clutter_mismatches,0);
assert.equal(c.ledger.dnf_reconstruction_vs_transport_truth_mismatches,0);
assert.equal(c.ledger.cnf_reconstruction_vs_transport_truth_mismatches,0);
assert.equal(c.ledger.dnf_vs_cnf_truth_mismatches,0);
assert.equal(c.ledger.second_minimal_true_vs_first_mismatches,0);
assert.equal(c.ledger.second_minimal_obstruction_vs_first_mismatches,0);
assert.equal(c.fixed_point_certificate.reconstruction_after_normalization_equals_original_truth,true);
assert.equal(c.fixed_point_certificate.normalization_after_reconstruction_equals_original_prime_pair,true);
assert.equal(c.fixed_point_certificate.repeated_same_tuple_normalization_can_create_new_prime_terms_or_clauses,false);
assert.ok(c.laws.includes('R_COMPOSE_N_EQUALS_ID_ON_THE_DECLARED_FINITE_ORIGIN_IDENTIFICATION_TRUTH_SURFACE'));
assert.ok(c.laws.includes('N_COMPOSE_R_COMPOSE_N_EQUALS_N_ON_THE_DECLARED_FINITE_PRIME_DUAL_CERTIFICATE'));
assert.ok(c.laws.includes('THE_PRIME_DUAL_PAIR_IS_CANONICALLY_DETERMINED_BY_THE_DECLARED_TRUTH_SURFACE'));
assert.ok(c.membranes.includes('FIXED_POINT_OF_DESCRIPTION != FIXED_POINT_OF_DYNAMICS'));
assert.equal(c.passed,true);

console.log(JSON.stringify({
  schema:c.schema,
  ledger:c.ledger,
  fixed_point_certificate:c.fixed_point_certificate,
  classes:Object.fromEntries(Object.entries(c.classes).map(([name,row])=>[name,{
    witness_count:row.witness_count,
    family_count:row.family_count,
    first_minimal_true_count:row.first_minimal_true_count,
    first_minimal_obstruction_count:row.first_minimal_obstruction_count,
    second_minimal_true_count:row.second_minimal_true_count,
    second_minimal_obstruction_count:row.second_minimal_obstruction_count,
    fixed_point:row.prime_dual_normalization_fixed_point,
  }])),
},null,2));
