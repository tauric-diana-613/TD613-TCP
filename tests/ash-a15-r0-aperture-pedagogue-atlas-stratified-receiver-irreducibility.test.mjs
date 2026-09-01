import assert from 'node:assert/strict';
import {
  ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_SCHEMA,
  ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_PARENT_RECEIPT,
  atlasStratifiedReceiverIrreducibilityCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-stratified-receiver-irreducibility.js';

const c=atlasStratifiedReceiverIrreducibilityCertificate();
assert.equal(ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_SCHEMA,'td613.dome-world.atlas-stratified-receiver-irreducibility/v0.1');
assert.equal(ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_PARENT_RECEIPT,'d96a694cafa86d439a47073a581cad1bcc71a8c2');
assert.equal(c.parent_exact,true);
assert.equal(c.determinant,1);
assert.equal(c.left_inverse_exact,true);
assert.equal(c.right_inverse_exact,true);
assert.equal(c.boolean_state_count,128);
assert.equal(c.inverse_failures,0);
assert.deepEqual(c.receiver_census,{
  NONE:{classes:1,max_fiber:128,fiber_frequency:{128:1}},
  C:{classes:59,max_fiber:8,fiber_frequency:{1:32,2:12,4:6,5:8,8:1}},
  W:{classes:15,max_fiber:16,fiber_frequency:{8:14,16:1}},
  H:{classes:2,max_fiber:64,fiber_frequency:{64:2}},
  CW:{classes:127,max_fiber:2,fiber_frequency:{1:126,2:1}},
  CH:{classes:80,max_fiber:4,fiber_frequency:{1:52,2:12,3:12,4:4}},
  WH:{classes:16,max_fiber:8,fiber_frequency:{8:16}},
  CWH:{classes:128,max_fiber:1,fiber_frequency:{1:128}},
});
assert.deepEqual(c.omission_controls,{
  capacity_removed_collision:true,
  pair_weight_removed_collision:true,
  high_support_removed_collision:true,
  cw_unique_non_singleton_fiber_count:1,
  cw_unique_collision_exact:true,
});
assert.equal(c.laws.full_receiver_unimodular,true);
assert.equal(c.laws.full_receiver_injective_on_boolean_cube,true);
assert.equal(c.laws.each_single_stratum_deletion_noninjective,true);
assert.equal(c.laws.each_stratum_indispensable_for_universal_exact_reconstruction,true);
assert.equal(c.laws.bitwise_minimal_encoding_claimed,false);
assert.equal(c.laws.shannon_lower_bound_claimed,false);
assert.equal(c.laws.universal_optimal_compression_claimed,false);
assert.equal(c.laws.physical_sensor_necessity_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas stratified receiver irreducibility canonical tests passed.');