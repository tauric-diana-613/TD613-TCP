import assert from 'node:assert/strict';

import {
  FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_GATE_ISSUE,
  FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_PARENT_RECEIPT,
  constructRouteForLift,
  firstMomentLiftSpectrum,
  firstMomentRecoverability,
  liftSpectrumParameters,
  routeRealizableBase,
  runFirstMomentLiftSpectrumIrreversibilityAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-first-moment-lift-spectrum-irreversibility.js';
import {
  firstMomentCoordinate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-first-moment-weaker-transport-quotient.js';

assert.equal(
  FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_PARENT_RECEIPT,
  'ae6c66113954fc9083815eef8dbc7b06b54180f7',
  'The chamber must remain pinned to the #738 receipt head.',
);
assert.equal(FIRST_MOMENT_LIFT_SPECTRUM_IRREVERSIBILITY_GATE_ISSUE, 737);

assert.equal(routeRealizableBase({ t: 0, E: 7, O: 0 }), true);
assert.equal(routeRealizableBase({ t: 0, E: 7, O: 1 }), false);
assert.equal(routeRealizableBase({ t: 1, E: 7, O: 20 }), true);

assert.deepEqual(firstMomentLiftSpectrum({ t: 0, E: 7, O: 0 }).values, [0]);
assert.deepEqual(firstMomentLiftSpectrum({ t: 1, E: 4, O: 3 }).values, [3]);
assert.deepEqual(firstMomentLiftSpectrum({ t: 2, E: 1, O: 0 }).values, [0, 2]);
assert.deepEqual(firstMomentLiftSpectrum({ t: 2, E: 0, O: 3 }).values, [3]);
assert.deepEqual(firstMomentLiftSpectrum({ t: 3, E: 1, O: 1 }).values, [1, 3, 5]);
assert.deepEqual(firstMomentLiftSpectrum({ t: 4, E: 2, O: 1 }).values, [1, 3, 5, 7, 9, 11]);

const p411 = liftSpectrumParameters({ t: 4, E: 2, O: 1 });
assert.equal(p411.a, 2);
assert.equal(p411.b, 1);
assert.equal(p411.min, 1);
assert.equal(p411.max, 11);
assert.equal(p411.cardinality, 6);
assert.equal(p411.parity, 1);

for (const [base, values] of [
  [{ t: 2, E: 1, O: 0 }, [0, 2]],
  [{ t: 3, E: 1, O: 1 }, [1, 3, 5]],
  [{ t: 4, E: 2, O: 1 }, [1, 3, 5, 7, 9, 11]],
  [{ t: 5, E: 3, O: 2 }, firstMomentLiftSpectrum({ t: 5, E: 3, O: 2 }).values],
]) {
  for (const P of values) {
    const witness = constructRouteForLift(base, P);
    assert.equal(witness.status, 'FIRST_MOMENT_LIFT_ROUTE_CONSTRUCTED', JSON.stringify({ base, P, witness }, null, 2));
    const coordinate = firstMomentCoordinate(witness.word);
    assert.equal(coordinate.t, base.t);
    assert.equal(coordinate.E, base.E);
    assert.equal(coordinate.O, base.O);
    assert.equal(coordinate.P, P);
  }
}

assert.equal(
  constructRouteForLift({ t: 3, E: 1, O: 1 }, 2).status,
  'FIRST_MOMENT_LIFT_NOT_IN_PREDICTED_SPECTRUM',
  'A wrong-parity interior integer must not be promoted to a lawful lift.',
);
assert.equal(
  constructRouteForLift({ t: 3, E: 1, O: 1 }, 7).status,
  'FIRST_MOMENT_LIFT_NOT_IN_PREDICTED_SPECTRUM',
  'A parity-compatible but out-of-bound integer must not be promoted to a lawful lift.',
);

const minEven = constructRouteForLift({ t: 4, E: 2, O: 1 }, 1);
assert.deepEqual(minEven.word, ['Q', 'Q', 'T', 'Q', 'T', 'T', 'T']);
const maxEven = constructRouteForLift({ t: 4, E: 2, O: 1 }, 11);
assert.deepEqual(maxEven.word, ['T', 'T', 'T', 'Q', 'T', 'Q', 'Q']);

const minOdd = constructRouteForLift({ t: 5, E: 2, O: 1 }, 1);
assert.deepEqual(minOdd.word, ['Q', 'Q', 'T', 'Q', 'T', 'T', 'T', 'T']);
const maxOddParams = liftSpectrumParameters({ t: 5, E: 2, O: 1 });
const maxOdd = constructRouteForLift({ t: 5, E: 2, O: 1 }, maxOddParams.max);
assert.deepEqual(maxOdd.word, ['T', 'T', 'T', 'T', 'Q', 'Q', 'T', 'Q']);

assert.equal(firstMomentRecoverability({ t: 0, E: 9, O: 0 }).recoverable, true);
assert.equal(firstMomentRecoverability({ t: 1, E: 9, O: 9 }).recoverable, true);
assert.equal(firstMomentRecoverability({ t: 2, E: 0, O: 9 }).recoverable, true);
assert.equal(firstMomentRecoverability({ t: 2, E: 1, O: 0 }).quotient_loss_irreversible, true);
assert.equal(firstMomentRecoverability({ t: 3, E: 0, O: 1 }).quotient_loss_irreversible, true);
assert.equal(firstMomentRecoverability({ t: 7, E: 1, O: 0 }).quotient_loss_irreversible, true);
assert.equal(firstMomentRecoverability({ t: 7, E: 0, O: 0 }).recoverable, true);

const qtt = firstMomentCoordinate(['Q', 'T', 'T']);
const ttq = firstMomentCoordinate(['T', 'T', 'Q']);
assert.deepEqual(
  { t: qtt.t, E: qtt.E, O: qtt.O },
  { t: ttq.t, E: ttq.E, O: ttq.O },
  'QTT and TTQ must retain the same quotient base.',
);
assert.equal(qtt.P, 0);
assert.equal(ttq.P, 2);
assert.notEqual(qtt.P, ttq.P, 'The base-only decoder hostile requires two distinct pre-projection first-moment classes.');

const sameC1Left = firstMomentCoordinate(['T', 'Q', 'T', 'Q', 'T']);
const sameC1Right = firstMomentCoordinate(['Q', 'T', 'T', 'T', 'Q']);
assert.deepEqual(
  { t: sameC1Left.t, E: sameC1Left.E, O: sameC1Left.O, P: sameC1Left.P },
  { t: sameC1Right.t, E: sameC1Right.E, O: sameC1Right.O, P: sameC1Right.P },
  'The lift spectrum must remain quarantined from complete-route reconstruction.',
);

const assay = runFirstMomentLiftSpectrumIrreversibilityAssay();
assert.equal(assay.passed, true, JSON.stringify(assay, null, 2));
assert.equal(
  assay.canonical_classification,
  'ROUTE_REALIZABLE_FIRST_MOMENT_LIFTS_FORM_EXACT_PARITY_INTERVAL_WITH_CLOSED_FORM_CARDINALITY_AND_SHARP_BASE_RECOVERABILITY_BOUNDARY',
);
assert.equal(
  assay.consequential_classification,
  'FIRST_MOMENT_QUOTIENT_LOSS_IS_EXACTLY_LOCALIZED_BY_LIFT_MULTIPLICITY_AND_FORBIDS_UNIVERSAL_BASE_ONLY_RECOVERY_ON_THE_IRREVERSIBILITY_LOCUS',
);
assert.equal(
  assay.secondary_classification,
  'AMBIENT_INTEGER_COCYCLE_EXTENSION_FIBER_STRICTLY_EXCEEDS_ROUTE_REALIZABLE_FIRST_MOMENT_SPECTRUM_IN_GENERAL',
);
assert.equal(assay.symbolic_spectrum.passed, true);
assert.equal(assay.required_hostiles.passed, true);
assert.equal(assay.bounded_coordinate_grid.passed, true);
assert.equal(assay.decoder_impossibility.passed, true);
assert.equal(assay.ambient_extension_quarantine.passed, true);
assert.equal(assay.incomplete_route_ledger_quarantine.passed, true);
assert.equal(assay.landing_ethic.passed, true);
assert.equal(assay.landing_ethic.good_through, '󐘓 U+10D613');
assert.equal(assay.landing_ethic.no_mirror_recovery, true);

assert.ok(assay.claim_ceiling.includes('NO_COMPLETE_ROUTE_RECONSTRUCTION_FROM_FIRST_MOMENT'));
assert.ok(assay.claim_ceiling.includes('NO_ASYMPTOTIC_OR_HIGHER_MOMENT_HIERARCHY'));
assert.ok(assay.claim_ceiling.includes('NO_CONNECTION_HOLONOMY_CURVATURE_OR_BERRY_PROMOTION'));

console.log('A15-R0 first-moment lift spectrum and quotient irreversibility tests passed.');
