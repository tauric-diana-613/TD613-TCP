import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CYCLIC_LOCAL_BLOCKS,
  FANO_BLOCKS
} from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-i.js';
import {
  chamberIMeasurementMatrix,
  chamberISingularValues,
  compileChamberIOperatorGeometryReceipt,
  computeChamberIOperatorGeometry
} from '../app/dome-world/previews/a15-r0/structured-probe-design-chamber-i-geometry.js';

const scienceHead = 'b'.repeat(40);
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} !~= ${expected}`);

test('raw cyclic and Fano operators are both full-rank but have different spectral geometry', () => {
  const cyclic = computeChamberIOperatorGeometry(CYCLIC_LOCAL_BLOCKS);
  const fano = computeChamberIOperatorGeometry(FANO_BLOCKS);
  assert.equal(cyclic.rank, 7);
  assert.equal(fano.rank, 7);
  near(cyclic.sigma_min, 0.554958132087371, 1e-9);
  near(fano.sigma_min, Math.SQRT2, 1e-9);
  near(cyclic.kappa_2, 5.405813207414514, 1e-8);
  near(fano.kappa_2, 3 / Math.SQRT2, 1e-9);
  assert.ok(fano.kappa_2 < cyclic.kappa_2);
  assert.ok(fano.perturbation_amplification_bound < cyclic.perturbation_amplification_bound);
});

test('Fano singular spectrum is computed from the authored matrix rather than hard-coded as a verdict', () => {
  const values = chamberISingularValues(chamberIMeasurementMatrix(FANO_BLOCKS));
  near(values[0], 3, 1e-10);
  for (const value of values.slice(1)) near(value, Math.SQRT2, 1e-9);
});

test('frozen perturbation family applies fourteen equal-budget observation perturbations to each invertible arm', () => {
  const cyclic = computeChamberIOperatorGeometry(CYCLIC_LOCAL_BLOCKS);
  const fano = computeChamberIOperatorGeometry(FANO_BLOCKS);
  assert.equal(cyclic.perturbation_family.family.length, 14);
  assert.equal(fano.perturbation_family.family.length, 14);
  assert.equal(cyclic.perturbation_family.family.every((item) => Math.abs(item.perturbation_l2 - 0.05) < 1e-12), true);
  assert.equal(fano.perturbation_family.family.every((item) => Math.abs(item.perturbation_l2 - 0.05) < 1e-12), true);
  assert.ok(fano.perturbation_family.max_error_l2 < cyclic.perturbation_family.max_error_l2);
  near(cyclic.perturbation_family.max_error_l2, 0.060092521257734, 1e-10);
  near(fano.perturbation_family.max_error_l2, 1 / 30, 1e-10);
});

test('centered Fano preserves block coverage while losing the global-offset direction', () => {
  const centered = computeChamberIOperatorGeometry(FANO_BLOCKS, { centered: true });
  assert.equal(centered.rank, 6);
  assert.equal(centered.nullity, 1);
  assert.equal(centered.global_offset_annihilated, true);
  assert.deepEqual(centered.global_offset_residual, [0, 0, 0, 0, 0, 0, 0]);
  assert.equal(centered.nullspace_witnesses.length, 1);
  const expected = 1 / Math.sqrt(7);
  for (const value of centered.nullspace_witnesses[0]) near(Math.abs(value), expected, 1e-10);
  assert.equal(centered.perturbation_family, null);
  assert.equal(centered.heldout_sum_reconstruction, 'ABSTAIN_UNIDENTIFIABLE_GLOBAL_OFFSET');
});

test('Chamber-I receipt preserves the hostile contradiction and refuses a scalar crown', () => {
  const receipt = compileChamberIOperatorGeometryReceipt({ scienceHead });
  assert.equal(receipt.bounded_relations.structured_pair_coverage_improves_conditioning_in_authored_matched_fixture, true);
  assert.equal(receipt.bounded_relations.combinatorial_coverage_does_not_guarantee_epistemically_relevant_operator_coverage, true);
  assert.equal(receipt.bounded_relations.coverage_receipt_equals_geometry_receipt, false);
  assert.equal(receipt.scientific_verdict, 'CHAMBER_I_BOUNDED_OPERATOR_GEOMETRY_SURVIVES_WITH_HOSTILE_NULLSPACE');
  assert.equal(receipt.scalar_winner, null);
  assert.equal(receipt.universal_optimality_claim, false);
  assert.equal(receipt.physical_tomography_claim, false);
  assert.equal(receipt.production_mutated, false);
  assert.equal(receipt.vercel_authority, false);
});
