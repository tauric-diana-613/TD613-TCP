import assert from 'node:assert/strict';
import {
  ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_SCHEMA,
  ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_PARENT_RECEIPT,
  atlasCentralCommutatorDepthCollapseCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-central-commutator-depth-collapse.js';

const certificate=atlasCentralCommutatorDepthCollapseCertificate();

assert.equal(ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_SCHEMA,'td613.dome-world.atlas-central-commutator-depth-collapse/v0.1');
assert.equal(ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_PARENT_RECEIPT,'6343ced7cf274b5f3981cfcb68e3a255447ffcd6');
assert.equal(certificate.parent_exact,true);
assert.equal(certificate.group.size,8);
assert.equal(certificate.group.multiplication_checks,64);
assert.equal(certificate.group.multiplication_escapes,0);

assert.deepEqual(certificate.first_commutators,{
  checks:64,
  distinct_values:2,
  identity:40,
  nonidentity:24,
  unique_nonidentity_equals_earned_holonomy:true,
});

assert.equal(certificate.center.relation_checks,64);
assert.equal(certificate.center.size,2);
assert.equal(certificate.center.equals_derived_subgroup,true);
assert.equal(certificate.center.derived_centrality_checks,16);
assert.equal(certificate.center.derived_centrality_failures,0);

assert.deepEqual(certificate.lower_central.sizes,[8,2,1]);
assert.equal(certificate.lower_central.gamma2_by_group_checks,16);
assert.equal(certificate.lower_central.gamma2_by_group_nonidentity,0);
assert.equal(certificate.lower_central.nilpotency_class,2);

assert.deepEqual(certificate.derived_series.sizes,[8,2,1]);
assert.equal(certificate.derived_series.second_step_checks,4);
assert.equal(certificate.derived_series.second_step_nonidentity,0);
assert.equal(certificate.derived_series.derived_length,2);

assert.equal(certificate.triple_commutators.left_normed_checks,512);
assert.equal(certificate.triple_commutators.left_normed_nonidentity,0);
assert.equal(certificate.triple_commutators.right_normed_checks,512);
assert.equal(certificate.triple_commutators.right_normed_nonidentity,0);

assert.deepEqual(certificate.free_history_witnesses.first_commutator,{word:'abAB',nonempty:true,holonomy_identity:false});
assert.deepEqual(certificate.free_history_witnesses.left_triple_a,{word:'abABabaBAA',nonempty:true,holonomy_identity:true});
assert.deepEqual(certificate.free_history_witnesses.left_triple_b,{word:'abAbaBAB',nonempty:true,holonomy_identity:true});
assert.deepEqual(certificate.free_history_witnesses.independent_kernel,{word:'aa',nonempty:true,holonomy_identity:true});

assert.equal(certificate.laws.nonabelian_history_survives_first_commutator_layer,true);
assert.equal(certificate.laws.derived_subgroup_equals_center,true);
assert.equal(certificate.laws.all_third_level_commutators_collapse,true);
assert.equal(certificate.laws.exact_nilpotency_class_two,true);
assert.equal(certificate.laws.exact_derived_length_two,true);
assert.equal(certificate.laws.gamma3_free_history_maps_trivially_by_homomorphism,true);
assert.equal(certificate.laws.gamma3_kernel_equality_claimed,false);
assert.equal(certificate.passed,true);

console.log('Ash A15-R0 Atlas central commutator depth collapse canonical contract passed.');
