import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import {
  DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_SCHEMA,
  DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_PARENT_RECEIPT,
  RAW_HOLONOMY_COORDINATES,
  RAW_HOLONOMY_H00,
  RAW_HOLONOMY_H11,
  RAW_HOLONOMY_H12,
  deriveHolonomyRepairClassDifferenceSupports,
  classifyRawHolonomyRepairAperture,
  dromologicalHolonomyRawApertureCutCertificate,
  compileDromologicalHolonomyRawApertureCutProjection,
  rejectDromologicalHolonomyRawApertureCutOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-raw-aperture-cut-anisotropic-redundancy.js';

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const key = coordinate => `${coordinate[0]},${coordinate[1]}`;
const includes = (aperture, coordinate) => aperture.some(candidate => same(candidate, coordinate));
const value = (matrix, coordinate) => matrix[coordinate[0]][coordinate[1]];
const project = (matrix, aperture) => aperture.map(coordinate => value(matrix, coordinate));
const distinct = rows => new Set(rows.map(row => JSON.stringify(row))).size;

assert.equal(
  DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_PARENT_RECEIPT,
  '7693b0823968d5e20dca8fdc9145452934377fc0',
);
assert.equal(dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate().passed, true);
assert.deepEqual(RAW_HOLONOMY_COORDINATES, [
  [0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],
]);

const classes = deriveDromologicalTerminalHolonomyClasses();
assert.equal(classes.length, 4);
const expectedMatrices = [
  [[2,-1,-1],[-1,1,0],[0,0,1]],
  [[1,-1,-1],[-1,2,0],[0,0,1]],
  [[1,-1,-1],[-1,2,1],[0,0,1]],
  [[2,-1,-2],[-1,1,1],[0,0,1]],
];
assert.deepEqual(classes.map(row => row.terminal_formal_holonomy), expectedMatrices);
assert.deepEqual(classes.map(row => row.schedule_ids), [
  ['P-H-I','P-I-H'],
  ['H-P-I'],
  ['H-I-P','I-H-P'],
  ['I-P-H'],
]);

// Independently derive every unordered class-pair difference support.
const independentSupports = [];
for (let left = 0; left < classes.length; left += 1) {
  for (let right = left + 1; right < classes.length; right += 1) {
    const support = RAW_HOLONOMY_COORDINATES.filter(coordinate => (
      value(classes[left].terminal_formal_holonomy, coordinate)
      !== value(classes[right].terminal_formal_holonomy, coordinate)
    ));
    independentSupports.push({ left, right, support });
  }
}
assert.deepEqual(independentSupports, [
  { left:0, right:1, support:[[0,0],[1,1]] },
  { left:0, right:2, support:[[0,0],[1,1],[1,2]] },
  { left:0, right:3, support:[[0,2],[1,2]] },
  { left:1, right:2, support:[[1,2]] },
  { left:1, right:3, support:[[0,0],[0,2],[1,1],[1,2]] },
  { left:2, right:3, support:[[0,0],[0,2],[1,1]] },
]);

const implementationSupports = deriveHolonomyRepairClassDifferenceSupports();
assert.equal(implementationSupports.length, 6);
assert.deepEqual(
  implementationSupports.map(row => row.difference_support),
  independentSupports.map(row => row.support),
);

// Exhaust all 2^9 raw-coordinate apertures independently.
const independentRows = [];
for (let mask = 0; mask < (1 << RAW_HOLONOMY_COORDINATES.length); mask += 1) {
  const aperture = RAW_HOLONOMY_COORDINATES.filter((_, index) => (mask & (1 << index)) !== 0);
  const projections = classes.map(row => project(row.terminal_formal_holonomy, aperture));
  const actual = distinct(projections) === 4;
  const predicted = includes(aperture, RAW_HOLONOMY_H12)
    && (includes(aperture, RAW_HOLONOMY_H00) || includes(aperture, RAW_HOLONOMY_H11));
  independentRows.push({ aperture, actual, predicted, distinct: distinct(projections) });
  assert.equal(actual, predicted, `cut predicate mismatch for ${aperture.map(key).join('|')}`);

  const implementation = classifyRawHolonomyRepairAperture(aperture);
  assert.equal(implementation.actual_exact_repair_router, actual);
  assert.equal(implementation.logical_cut_predicate_predicts_router, predicted);
  assert.equal(implementation.distinct_projected_class_count, distinct(projections));
}
assert.equal(independentRows.length, 512);

const independentRouters = independentRows.filter(row => row.actual);
assert.equal(independentRouters.length, 192);
assert.equal(independentRows.length - independentRouters.length, 320);
assert.equal(independentRouters.every(row => includes(row.aperture, RAW_HOLONOMY_H12)), true);
assert.equal(independentRouters.every(row => (
  includes(row.aperture, RAW_HOLONOMY_H00) || includes(row.aperture, RAW_HOLONOMY_H11)
)), true);

const countsByCardinality = Array.from({ length: 10 }, () => 0);
independentRouters.forEach(row => { countsByCardinality[row.aperture.length] += 1; });
assert.deepEqual(countsByCardinality, [0,0,2,13,36,55,50,27,8,1]);

const minimalRouters = independentRouters
  .filter(row => row.aperture.length === 2)
  .map(row => row.aperture);
assert.deepEqual(minimalRouters, [
  [[0,0],[1,2]],
  [[1,1],[1,2]],
]);

const bothHBackups = independentRouters.filter(row => (
  includes(row.aperture, RAW_HOLONOMY_H00) && includes(row.aperture, RAW_HOLONOMY_H11)
));
const exactlyOneHBackup = independentRouters.filter(row => (
  includes(row.aperture, RAW_HOLONOMY_H00) !== includes(row.aperture, RAW_HOLONOMY_H11)
));
assert.equal(bothHBackups.length, 64);
assert.equal(exactlyOneHBackup.length, 128);

// Independent erasure hostile on the full raw matrix.
const full = [...RAW_HOLONOMY_COORDINATES];
assert.equal(classifyRawHolonomyRepairAperture(full).actual_exact_repair_router, true);
let fullTolerated = 0;
const fullFailed = [];
for (let index = 0; index < full.length; index += 1) {
  const surviving = full.filter((_, candidate) => candidate !== index);
  const routes = distinct(classes.map(row => project(row.terminal_formal_holonomy, surviving))) === 4;
  if (routes) fullTolerated += 1;
  else fullFailed.push(full[index]);
}
assert.equal(fullTolerated, 8);
assert.deepEqual(fullFailed, [[1,2]]);

// The smallest explicit raw redundancy aperture protects the H-bit alternatives but never H12.
const triple = [[0,0],[1,1],[1,2]];
const tripleDeletionResults = triple.map((coordinate, index) => {
  const surviving = triple.filter((_, candidate) => candidate !== index);
  return {
    erased: coordinate,
    routes: distinct(classes.map(row => project(row.terminal_formal_holonomy, surviving))) === 4,
  };
});
assert.deepEqual(tripleDeletionResults, [
  { erased:[0,0], routes:true },
  { erased:[1,1], routes:true },
  { erased:[1,2], routes:false },
]);

// No exact router can survive deletion of H12: H-only and mixed matrices are equal everywhere else.
for (const row of independentRouters) {
  const surviving = row.aperture.filter(coordinate => !same(coordinate, RAW_HOLONOMY_H12));
  const routes = distinct(classes.map(holonomyClass => project(
    holonomyClass.terminal_formal_holonomy,
    surviving,
  ))) === 4;
  assert.equal(routes, false);
}

assert.throws(
  () => classifyRawHolonomyRepairAperture([[9,9]]),
  /undeclared raw holonomy coordinate/,
);
assert.throws(
  () => classifyRawHolonomyRepairAperture([[0,0],[0,0]]),
  /duplicate coordinates/,
);

const certificate = dromologicalHolonomyRawApertureCutCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_PARENT_RECEIPT);
assert.equal(certificate.support_certificate.exact, true);
assert.equal(certificate.support_certificate.pairwise_support_count, 6);
assert.deepEqual(certificate.support_certificate.empty_vs_h_only_support, [[0,0],[1,1]]);
assert.deepEqual(certificate.support_certificate.h_only_vs_mixed_support, [[1,2]]);
assert.equal(certificate.support_certificate.h12_is_forced_by_singleton_difference_support, true);
assert.equal(certificate.support_certificate.h00_or_h11_is_forced_by_two_coordinate_difference_support, true);
assert.equal(certificate.powerset_certificate.exact, true);
assert.equal(certificate.powerset_certificate.audited_aperture_count, 512);
assert.equal(certificate.powerset_certificate.exact_repair_router_count, 192);
assert.equal(certificate.powerset_certificate.nonrouter_count, 320);
assert.deepEqual(certificate.powerset_certificate.routing_counts_by_cardinality, [0,0,2,13,36,55,50,27,8,1]);
assert.equal(certificate.powerset_certificate.routers_with_both_h_backups, 64);
assert.equal(certificate.powerset_certificate.routers_with_exactly_one_h_backup, 128);
assert.deepEqual(certificate.powerset_certificate.cardinality_two_routers, minimalRouters);
assert.equal(certificate.erasure_certificate.exact, true);
assert.equal(certificate.erasure_certificate.full_matrix_tolerated_erasures, 8);
assert.equal(certificate.erasure_certificate.full_matrix_h12_erasure_fails, true);
assert.equal(certificate.erasure_certificate.three_entry_tolerated_erasures, 2);
assert.equal(certificate.erasure_certificate.three_entry_h12_erasure_fails, true);
assert.equal(certificate.erasure_certificate.no_exact_raw_router_survives_h12_erasure, true);
assert.equal(certificate.erasure_certificate.no_raw_aperture_is_universally_one_erasure_robust, true);
assert.equal(certificate.passed, true);
assert.equal(
  certificate.all_aperture_classification,
  'EXACT_REPAIR_ROUTING_BY_RAW_TERMINAL_FORMAL_HOLONOMY_COORDINATES_OCCURS_IFF_H12_IS_RETAINED_AND_AT_LEAST_ONE_OF_H00_OR_H11_IS_RETAINED_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.anisotropic_redundancy_classification,
  'THE_FIXED_S3_RAW_HOLONOMY_REPAIR_ROUTING_APERTURE_HAS_AN_ANISOTROPIC_REDUNDANCY_PROFILE_IN_WHICH_H00_AND_H11_ARE_SUBSTITUTABLE_WHILE_H12_IS_AN_IRREPLACEABLE_SINGLE_COORDINATE_CUT',
);
assert.equal(
  certificate.architectural_law,
  'SELECTIVE_AIA_LEGIBILITY_CAN_HAVE_COORDINATE_SPECIFIC_REDUNDANCY_AND_COORDINATE_SPECIFIC_FRAGILITY_WHILE_CUSTODY_AND_RECEIVER_AUTHORITY_REMAIN_INVARIANT',
);

// AIA membrane.
const ash = compileDromologicalHolonomyRawApertureCutProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyRawApertureCutProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'SOME_CLUES_HAVE_A_BACKUP_HERE',
  'ONE_IMPORTANT_CLUE_HAS_NO_RAW_BACKUP_HERE',
  'KEEPING_MORE_DETAILS_IS_NOT_THE_SAME_AS_BACKING_UP_EVERY_IMPORTANT_DETAIL',
  'LOSING_THE_UNIQUE_CLUE_BREAKS_THE_REPAIR_CHOICE_BUT_DOES_NOT_CHANGE_WHERE_THE_RECORD_CAME_FROM',
]);
for (const field of [
  'matrices_exposed','coordinate_locations_exposed','subset_masks_exposed',
  'repair_vectors_exposed','decoder_formulas_exposed','latent_state_exposed',
]) assert.equal(ash.payload[field], false);
assert.equal(loom.payload.powerset_summary.audited_aperture_count, 512);
assert.equal(loom.payload.powerset_summary.exact_repair_router_count, 192);
assert.deepEqual(loom.payload.powerset_summary.routing_counts_by_cardinality, [0,0,2,13,36,55,50,27,8,1]);
assert.equal(rejectDromologicalHolonomyRawApertureCutOverreach(ash).accepted, true);
assert.equal(rejectDromologicalHolonomyRawApertureCutOverreach(loom).accepted, true);
for (const forbidden of [
  'information_theoretic_redundancy','coding_theorem','universal_feature_minimality',
  'complete_schedule_reconstruction','operational_sensor_failure_model','physical_holonomy',
  'physical_anisotropic_medium','physical_quasicrystal','continuum_tomography',
  'semantic_equivalence','operational_inverse_route',
]) {
  const bad = { ...loom, claim_ceiling: { ...loom.claim_ceiling, [forbidden]: true } };
  assert.equal(rejectDromologicalHolonomyRawApertureCutOverreach(bad).accepted, false);
}
assert.equal(rejectDromologicalHolonomyRawApertureCutOverreach({
  ...loom,
  authority: { ...loom.authority, production: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRawApertureCutOverreach({
  ...ash,
  payload: { ...ash.payload, coordinate_locations_exposed: true },
}).accepted, false);
assert.throws(
  () => compileDromologicalHolonomyRawApertureCutProjection('UNDECLARED'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'RAW_COORDINATE_REDUNDANCY != INFORMATION_THEORETIC_REDUNDANCY',
  'RAW_COORDINATE_CUT != PHYSICAL_SINGLE_POINT_OF_FAILURE',
  'FULL_MATRIX_VISIBILITY != ONE_ERASURE_ROBUST_REPAIR_ROUTING',
  'EXTRA_COORDINATE != REDUNDANT_REPAIR_COORDINATE',
  'H12_ESSENTIAL_IN_THIS_FIXTURE != UNIVERSAL_HOLONOMY_OBSERVABLE',
  'ANISOTROPIC_REDUNDANCY != PHYSICAL_ANISOTROPIC_MEDIUM',
  'ERASURE_OF_RAW_ENTRY != PHYSICAL_SENSOR_FAILURE',
  'REPAIR_ROUTING_FAILURE != CUSTODY_FAILURE',
  'REPAIR_ROUTING_APERTURE != COMPLETE_SCHEDULE_RECONSTRUCTION',
  'FINITE_POWERSET_CLASSIFICATION != UNIVERSAL_CODING_THEOREM',
]);

console.log('Ash A15-R0 holonomy raw-aperture cut / anisotropic redundancy hostile tests passed.');
