import assert from 'node:assert/strict';
import {
  ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_SCHEMA,
  ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_PARENT_RECEIPT,
  atlasMinimalAdditiveReceiverRankCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-minimal-additive-receiver-rank.js';

const c=atlasMinimalAdditiveReceiverRankCertificate();
assert.equal(ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_SCHEMA,'td613.dome-world.atlas-minimal-additive-receiver-rank/v0.1');
assert.equal(ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_PARENT_RECEIPT,'c880a89346fd18a11a8c9476529e77816e12d14a');
assert.equal(c.parent_exact,true);
assert.equal(c.transform_failures,0);
assert.deepEqual(Object.fromEntries(Object.entries(c.profiles).map(([k,v])=>[k,{dimension:v.dimension,capacity_channels:v.capacity_channels,pair_channels:v.pair_channels,high_channels:v.high_channels,determinant:v.determinant}])),{
  1:{dimension:1,capacity_channels:1,pair_channels:0,high_channels:0,determinant:1},
  2:{dimension:3,capacity_channels:2,pair_channels:1,high_channels:0,determinant:1},
  3:{dimension:7,capacity_channels:3,pair_channels:3,high_channels:1,determinant:1},
  4:{dimension:15,capacity_channels:4,pair_channels:6,high_channels:5,determinant:1},
  5:{dimension:31,capacity_channels:5,pair_channels:10,high_channels:16,determinant:1},
});
for(const p of Object.values(c.profiles))assert.equal(p.unit_upper_triangular,true);
assert.equal(c.hostile_generated_matrices,42);
assert.equal(c.hostile_collision_failures,0);
assert.equal(c.coordinate_deletion_controls,7);
assert.equal(c.coordinate_deletion_failures,0);
assert.deepEqual(c.nonlinear_scalar_control,{boolean_states:128,unique_codes:128,injective_on_boolean_cube:true});
assert.equal(c.laws.support_dimension_formula,'d_n = 2^n - 1');
assert.equal(c.laws.full_receiver_is_unimodular_change_of_integer_basis,true);
assert.equal(c.laws.additive_integer_receiver_below_dimension_has_kernel_collision,true);
assert.equal(c.laws.minimal_additive_scalar_rank_formula,'r_add(n) = 2^n - 1');
assert.equal(c.laws.minimal_bit_length_claimed,false);
assert.equal(c.laws.shannon_lower_bound_claimed,false);
assert.equal(c.laws.arbitrary_nonlinear_coordinate_lower_bound_claimed,false);
assert.equal(c.laws.nonlinear_one_scalar_injection_control_present,true);
assert.equal(c.laws.physical_sensor_minimality_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas minimal additive receiver rank canonical tests passed.');