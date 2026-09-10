import assert from 'node:assert/strict';

import {
  ROUTE_CONDITIONED_SEAM_SCHEMA_SLACK_PARENT_RECEIPT,
  auditSharedConditionalSeamAlphabet,
  decodeFactorizedRouteConditionalSeam,
  encodeFactorizedRouteConditionalSeam,
  materializeRectangularSchema,
  routeConditionedSchemaProfile,
  routeProjectionProfile,
  runRouteConditionedSeamSchemaSlackChamber,
  seamProjectionZeroFiber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-route-conditioned-seam-schema-slack.js';
import {
  enumerateFixedC1JointFiber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-fixed-c1-joint-route-seam-fiber.js';

assert.equal(
  ROUTE_CONDITIONED_SEAM_SCHEMA_SLACK_PARENT_RECEIPT,
  '97ca8a8606c045cdb20c37b4a0ec7ba6a98a6ba4',
);

const inherited = routeConditionedSchemaProfile(3, 1, 1, 3);
assert.equal(inherited.status, 'EXACT_ROUTE_CONDITIONED_SEAM_SCHEMA_PROFILE_DERIVED');
assert.deepEqual(inherited.route_conditional_seam_cardinalities, [4, 1]);
assert.equal(inherited.route_count, 2);
assert.equal(inherited.shared_conditional_seam_alphabet_min, 4);
assert.equal(inherited.joint_count, 5);
assert.equal(inherited.rectangular_capacity, 8);
assert.equal(inherited.rectangular_slack, 3);
assert.equal(inherited.monolithic_joint_bits, 3);
assert.equal(inherited.split_total_bits, 3);
assert.equal(inherited.fixed_width_bit_tax, 0);

const inheritedZero = seamProjectionZeroFiber(3, 1, 1, 3);
assert.equal(inheritedZero.status, 'EXACT_FULL_SEAM_PROJECTION_ZERO_FIBER_DERIVED');
assert.deepEqual(inheritedZero.zero_seam_vector, [0, 0]);
assert.equal(inheritedZero.route_count, 2);
assert.equal(inheritedZero.zero_fiber_cardinality, 2);
assert.equal(inheritedZero.distinct_route_count, 2);
assert.equal(inheritedZero.exact_route_recovery_from_full_seam_vector_for_all_states, false);

const inheritedRoute = routeProjectionProfile(3, 1, 1, 3);
assert.equal(inheritedRoute.status, 'EXACT_ROUTE_PROJECTION_FIBER_PROFILE_DERIVED');
assert.deepEqual(inheritedRoute.route_fibers.map((row) => row.fiber_cardinality), [4, 1]);
assert.equal(inheritedRoute.exact_joint_recovery_from_route_alone_for_all_states, false);

const inheritedRectangle = materializeRectangularSchema(3, 1, 1, 3);
assert.equal(inheritedRectangle.status, 'EXACT_RECTANGULAR_SCHEMA_WITH_VISIBLE_PADDING_DERIVED');
assert.equal(inheritedRectangle.capacity, 8);
assert.equal(inheritedRectangle.lawful_cells, 5);
assert.equal(inheritedRectangle.padding_cells, 3);
assert.equal(inheritedRectangle.cells.filter((cell) => !cell.lawful).length, 3);
assert.ok(inheritedRectangle.cells.filter((cell) => !cell.lawful).every((cell) => (
  cell.classification === 'UNUSED_RECTANGULAR_CELL_IS_SCHEMA_PADDING_NOT_A_LAWFUL_HISTORY'
)));

const padding = decodeFactorizedRouteConditionalSeam(3, 1, 1, 3, 1, 1);
assert.equal(padding.status, 'FACTORIZED_ROUTE_CONDITIONAL_SEAM_DECODER_PADDING_CELL_ABSTAINS');
assert.equal(padding.classification, 'UNUSED_RECTANGULAR_CELL_IS_SCHEMA_PADDING_NOT_A_LAWFUL_HISTORY');

const strict = routeConditionedSchemaProfile(3, 1, 2, 4);
assert.equal(strict.status, 'EXACT_ROUTE_CONDITIONED_SEAM_SCHEMA_PROFILE_DERIVED');
assert.deepEqual(strict.route_conditional_seam_cardinalities, [6, 2]);
assert.equal(strict.route_count, 2);
assert.equal(strict.shared_conditional_seam_alphabet_min, 6);
assert.equal(strict.joint_count, 8);
assert.equal(strict.rectangular_capacity, 12);
assert.equal(strict.rectangular_slack, 4);
assert.equal(strict.monolithic_joint_bits, 3);
assert.equal(strict.split_route_bits, 1);
assert.equal(strict.split_conditional_seam_bits, 3);
assert.equal(strict.split_total_bits, 4);
assert.equal(strict.fixed_width_bit_tax, 1);

const strictRectangle = materializeRectangularSchema(3, 1, 2, 4);
assert.equal(strictRectangle.status, 'EXACT_RECTANGULAR_SCHEMA_WITH_VISIBLE_PADDING_DERIVED');
assert.equal(strictRectangle.lawful_cells, 8);
assert.equal(strictRectangle.padding_cells, 4);

const undersized = auditSharedConditionalSeamAlphabet(3, 1, 2, 4, 5);
assert.equal(undersized.status, 'SHARED_CONDITIONAL_SEAM_ALPHABET_AUDITED');
assert.equal(undersized.undersized, true);
assert.equal(undersized.exact_capacity_possible_with_exact_route, false);

const exactAlphabet = auditSharedConditionalSeamAlphabet(3, 1, 2, 4, 6);
assert.equal(exactAlphabet.undersized, false);
assert.equal(exactAlphabet.exact_capacity_possible_with_exact_route, true);

for (const args of [[3, 1, 1, 3], [3, 1, 2, 4], [2, 2, 3, 5]]) {
  const fiber = enumerateFixedC1JointFiber(...args);
  assert.equal(fiber.status, 'FIXED_C1_JOINT_FIBER_ENUMERATED');
  for (const row of fiber.rows) {
    const encoded = encodeFactorizedRouteConditionalSeam(...args, row.blocks, row.seams);
    assert.equal(encoded.status, 'EXACT_FACTORIZED_ROUTE_CONDITIONAL_SEAM_STATE_ENCODED');
    const decoded = decodeFactorizedRouteConditionalSeam(...args, encoded.route_label, encoded.seam_label);
    assert.equal(decoded.status, 'EXACT_FACTORIZED_ROUTE_CONDITIONAL_SEAM_STATE_DECODED');
    assert.deepEqual(decoded.blocks, row.blocks);
    assert.deepEqual(decoded.seams, row.seams);
  }
}

for (const args of [
  [0, 3, 0, 0],
  [1, 2, 3, 3],
  [2, 1, 2, 4],
  [3, 1, 1, 3],
  [3, 1, 2, 4],
  [3, 2, 2, 6],
  [4, 2, 2, 6],
]) {
  const zero = seamProjectionZeroFiber(...args);
  assert.equal(zero.status, 'EXACT_FULL_SEAM_PROJECTION_ZERO_FIBER_DERIVED');
  assert.equal(zero.zero_fiber_cardinality, zero.route_count);
}

const t0 = routeConditionedSchemaProfile(0, 7, 0, 0);
assert.equal(t0.status, 'EXACT_ROUTE_CONDITIONED_SEAM_SCHEMA_PROFILE_DERIVED');
assert.equal(t0.route_count, 1);
assert.deepEqual(t0.route_conditional_seam_cardinalities, [1]);
assert.equal(t0.joint_count, 1);
assert.equal(t0.rectangular_slack, 0);
assert.equal(t0.split_total_bits, 0);

const t1 = routeConditionedSchemaProfile(1, 4, 3, 3);
assert.equal(t1.status, 'EXACT_ROUTE_CONDITIONED_SEAM_SCHEMA_PROFILE_DERIVED');
assert.equal(t1.route_count, 1);
assert.deepEqual(t1.route_conditional_seam_cardinalities, [1]);
assert.equal(t1.joint_count, 1);
assert.equal(t1.rectangular_slack, 0);
assert.equal(t1.split_total_bits, 0);

const chamber = runRouteConditionedSeamSchemaSlackChamber();
assert.equal(chamber.status, 'ROUTE_CONDITIONED_SEAM_SCHEMA_SLACK_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
assert.ok(Object.values(chamber.certificates).every((certificate) => certificate.passed));
assert.equal(
  chamber.architectural_candidate,
  'FACTORIZING_EXACT_JOINT_CUSTODY_INTO_SEPARATE_FIXED_ROUTE_AND_ROUTE_CONDITIONAL_SEAM_FIELDS_CREATES_EXACT_RECTANGULAR_SCHEMA_SLACK_WHEN_CONDITIONAL_SEAM_BURDENS_ARE_NONUNIFORM_AND_CAN_REQUIRE_STRICTLY_MORE_FIXED_WIDTH_BITS_THAN_MONOLITHIC_JOINT_RANK',
);

console.log('Ash A15-R0 route-conditioned seam schema slack tests passed.');
