import assert from 'node:assert/strict';
import { finitePrimeDualWitnessLogicDeclaredApertureClosureCertificate as certificate } from '../app/dome-world/previews/a15-r0/finite-prime-dual-witness-logic-declared-aperture-closure.js';

const c=certificate();
assert.equal(c.parent_receipt,'5e1c459bccd58ba89e6a218198e69d8d1518424e');
assert.equal(c.parent_exact,true);
assert.equal(c.inherited,'1111111110');

const expected={
  specialization_comparability:{witnesses:20,families:1048576,success:981696,failure:66880,terms:22,zeta:10485760},
  principal_open_identity:{witnesses:5,families:32,success:27,failure:5,terms:4,zeta:80},
  principal_open_size:{witnesses:5,families:32,success:18,failure:14,terms:4,zeta:80},
  cut_orientation:{witnesses:10,families:1024,success:765,failure:259,terms:16,zeta:5120},
};

for(const [name,e] of Object.entries(expected)){
  const row=c.classes[name];
  assert.equal(row.witness_count,e.witnesses,name);
  assert.equal(row.family_count,e.families,name);
  assert.equal(row.success_count,e.success,name);
  assert.equal(row.failure_count,e.failure,name);
  assert.equal(row.minimal_success_dnf_term_count,e.terms,name);
  assert.ok(row.minimal_obstruction_cnf_clause_count>=1&&row.minimal_obstruction_cnf_clause_count<=3,name);
  assert.equal(row.subset_zeta_propagation_updates,e.zeta,name);
  assert.equal(row.origin_truth_vs_success_dnf_mismatches,0,name);
  assert.equal(row.origin_truth_vs_obstruction_cnf_mismatches,0,name);
  assert.equal(row.success_dnf_vs_obstruction_cnf_mismatches,0,name);
  assert.equal(row.success_count_vs_parent_depth1_mismatch,0,name);
  assert.equal(row.dnf_irredundancy_witness_count,e.terms,name);
  assert.equal(row.dnf_irredundancy_failures,0,name);
  assert.ok(row.dnf_irredundancy_witnesses.every(w=>w.changes_truth),name);
  assert.equal(row.cnf_irredundancy_witness_count,row.minimal_obstruction_cnf_clause_count,name);
  assert.equal(row.cnf_irredundancy_failures,0,name);
  assert.ok(row.cnf_irredundancy_witnesses.every(w=>w.changes_truth),name);
  assert.equal(row.complete_declared_origin_truth_surface_determined_by_either_prime_antichain,true,name);
  assert.equal(row.passed,true,name);
}

assert.equal(c.ledger.selected_family_count,1049664);
assert.equal(c.ledger.success_family_count,982506);
assert.equal(c.ledger.failure_family_count,67158);
assert.equal(c.ledger.minimal_success_dnf_term_count,46);
assert.ok(c.ledger.minimal_obstruction_cnf_clause_count>=4&&c.ledger.minimal_obstruction_cnf_clause_count<=12);
assert.equal(c.ledger.subset_zeta_propagation_updates,10491040);
assert.equal(c.ledger.origin_truth_vs_success_dnf_mismatches,0);
assert.equal(c.ledger.origin_truth_vs_obstruction_cnf_mismatches,0);
assert.equal(c.ledger.success_dnf_vs_obstruction_cnf_mismatches,0);
assert.equal(c.ledger.success_count_vs_parent_depth1_mismatches,0);
assert.equal(c.ledger.dnf_irredundancy_witness_count,46);
assert.equal(c.ledger.dnf_irredundancy_failures,0);
assert.equal(c.ledger.cnf_irredundancy_witness_count,c.ledger.minimal_obstruction_cnf_clause_count);
assert.equal(c.ledger.cnf_irredundancy_failures,0);
assert.equal(c.declared_aperture_origin_identification_truth_closed,true);
assert.equal(c.rest_certificate.further_same_aperture_subfamily_enumeration_can_add_new_origin_identification_truth_values,false);
assert.ok(c.laws.includes('EITHER_PRIME_ANTICHAIN_DETERMINES_THE_COMPLETE_DECLARED_ORIGIN_IDENTIFICATION_TRUTH_SURFACE'));
assert.ok(c.laws.includes('FURTHER_SUBFAMILY_ENUMERATION_OF_THE_SAME_DECLARED_APERTURE_CANNOT_ADD_NEW_ORIGIN_IDENTIFICATION_TRUTH_VALUES'));
assert.ok(c.membranes.includes('FINITE_DECLARED_APERTURE_CLOSURE != UNIVERSAL_SCIENTIFIC_COMPLETENESS'));
assert.ok(c.membranes.includes('UNPOINTED_EQUIVARIANT_SECTION_OBSTRUCTION != POINTED_WITNESS_SEPARATION_OBSTRUCTION'));
assert.equal(c.passed,true);

console.log(JSON.stringify({
  schema:c.schema,
  ledger:c.ledger,
  rest_certificate:c.rest_certificate,
  classes:Object.fromEntries(Object.entries(c.classes).map(([name,row])=>[name,{
    family_count:row.family_count,
    success_count:row.success_count,
    failure_count:row.failure_count,
    minimal_success_dnf_term_count:row.minimal_success_dnf_term_count,
    minimal_obstruction_cnf_clause_count:row.minimal_obstruction_cnf_clause_count,
    dnf_irredundancy_failures:row.dnf_irredundancy_failures,
    cnf_irredundancy_failures:row.cnf_irredundancy_failures,
  }])),
},null,2));
