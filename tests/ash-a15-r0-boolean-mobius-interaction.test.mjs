import assert from 'node:assert/strict';
import { runBooleanMobiusInteractionAssay, secondMixedBooleanDifference } from '../app/dome-world/previews/a15-r0/boolean-mobius-interaction.js';

assert.equal(secondMixedBooleanDifference([0, 0, 0, 0]), 0);
assert.equal(secondMixedBooleanDifference([0, 1, 1, 0]), -2); // XOR
assert.equal(secondMixedBooleanDifference([1, 0, 0, 1]), 2);  // XNOR
assert.equal(secondMixedBooleanDifference([0, 0, 0, 1]), 1);  // AND
assert.throws(() => secondMixedBooleanDifference([0, 1, 1]), TypeError);
assert.throws(() => secondMixedBooleanDifference([0, 1, 1, Number.NaN]), TypeError);

const assay = runBooleanMobiusInteractionAssay();
assert.equal(assay.function_count, 16);
assert.equal(assay.magnitude_groups.length, 3);
assert.deepEqual(
  assay.magnitude_groups.map(group => [group.absolute_mobius_interaction, group.joining_synergy_levels_bits]),
  [[0, [0]], [1, [0.188722]], [2, [1]]]
);
assert.equal(assay.exact_synergy_level_by_absolute_mobius_magnitude, true);
assert.equal(assay.strictly_monotone_synergy_across_mobius_magnitude_levels, true);
assert.equal(assay.zero_mobius_magnitude_iff_zero_joining_excess_in_declared_family, true);
assert.equal(assay.xor_xnor_absolute_mobius_magnitude, 2);
assert.equal(assay.xor_xnor_share_maximum_magnitude, true);
assert.equal(assay.discrete_mixed_derivative_declared, true);
assert.equal(assay.discrete_hessian_interpretation_available, true);
assert.equal(assay.riemannian_metric_declared, false);
assert.equal(assay.affine_connection_declared, false);
assert.equal(assay.curvature_tensor_declared, false);
assert.equal(assay.intrinsic_geometric_curvature_claim, false);
assert.equal(assay.synergy_equals_mobius_coefficient_claim, false);
assert.equal(assay.generalization_beyond_declared_boolean_family, false);

for (const fn of assay.functions) {
  assert.equal(Object.isFrozen(fn), true);
  assert.equal(Object.isFrozen(fn.truth_table_00_01_10_11), true);
}

console.log(JSON.stringify({
  contract:'td613.ash.a15-r0.boolean-mobius-interaction/v0.1',
  function_count:assay.function_count,
  magnitude_levels:assay.magnitude_groups.map(group => group.absolute_mobius_interaction),
  synergy_levels_bits:assay.magnitude_groups.map(group => group.joining_synergy_levels_bits[0]),
  exact_level_correspondence:assay.exact_synergy_level_by_absolute_mobius_magnitude,
  geometric_curvature_claim:false
}, null, 2));
