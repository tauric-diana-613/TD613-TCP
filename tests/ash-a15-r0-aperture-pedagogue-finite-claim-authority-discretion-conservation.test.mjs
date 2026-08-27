import assert from 'node:assert/strict';
import {
  auditFiniteDiscretionPresentation,
  minimumZeroFalseClaimPresentation,
  runFiniteDiscretionConservationChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-finite-claim-authority-discretion-conservation.js';

const chamber = runFiniteDiscretionConservationChamber();
assert.equal(chamber.status, 'FINITE_DISCRETION_CONSERVATION_CHAMBER_PASSED');
assert.equal(chamber.passed, true);

const rows = [
  { antecedent: 'a', quotient: 'y', support: [0, 1] },
  { antecedent: 'b', quotient: 'y', support: [0, 2] },
];
const ambient = [0, 1, 2, 3];

const frontier20 = auditFiniteDiscretionPresentation(rows, 'y', ambient, [
  { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 1, decision: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 2, decision: 'UNIVERSALLY_INADMISSIBLE' },
  { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
]);
const frontier11 = auditFiniteDiscretionPresentation(rows, 'y', ambient, [
  { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 1, decision: 'ABSTAIN' },
  { value: 2, decision: 'UNIVERSALLY_INADMISSIBLE' },
  { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
]);
const frontier02 = auditFiniteDiscretionPresentation(rows, 'y', ambient, [
  { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 1, decision: 'ABSTAIN' },
  { value: 2, decision: 'ABSTAIN' },
  { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
]);

for (const audit of [frontier20, frontier11, frontier02]) {
  assert.equal(audit.status, 'FINITE_DISCRETION_CONSERVATION_AUDITED');
  assert.equal(audit.irreducible_gap_cardinality, 2);
  assert.equal(audit.total_epistemic_burden, 2);
  assert.equal(audit.tight, true);
  assert.equal(audit.exact_identity_witnessed, true);
}
assert.deepEqual(
  [
    [frontier20.false_universal_claims, frontier20.abstentions],
    [frontier11.false_universal_claims, frontier11.abstentions],
    [frontier02.false_universal_claims, frontier02.abstentions],
  ],
  [[2, 0], [1, 1], [0, 2]],
);

const minimum = minimumZeroFalseClaimPresentation(rows, 'y', ambient);
assert.equal(minimum.status, 'MINIMUM_ZERO_FALSE_CLAIM_PRESENTATION_DERIVED');
assert.equal(minimum.audit.false_universal_claims, 0);
assert.equal(minimum.audit.abstentions, 2);
assert.equal(minimum.audit.irreducible_gap_cardinality, 2);

const settledAbstention = auditFiniteDiscretionPresentation(rows, 'y', ambient, [
  { value: 0, decision: 'ABSTAIN' },
  { value: 1, decision: 'ABSTAIN' },
  { value: 2, decision: 'ABSTAIN' },
  { value: 3, decision: 'UNIVERSALLY_INADMISSIBLE' },
]);
assert.equal(settledAbstention.total_epistemic_burden, 3);
assert.equal(settledAbstention.settled_misclassification_count, 1);
assert.equal(settledAbstention.tight, false);

const gapFree = auditFiniteDiscretionPresentation([
  { antecedent: 'a', quotient: 'y', support: [0] },
  { antecedent: 'b', quotient: 'y', support: [0] },
], 'y', [0, 1], [
  { value: 0, decision: 'UNIVERSALLY_ADMISSIBLE' },
  { value: 1, decision: 'UNIVERSALLY_INADMISSIBLE' },
]);
assert.equal(gapFree.irreducible_gap_cardinality, 0);
assert.equal(gapFree.total_epistemic_burden, 0);

console.log('Ash A15-R0 finite claim-authority discretion conservation tests passed.');