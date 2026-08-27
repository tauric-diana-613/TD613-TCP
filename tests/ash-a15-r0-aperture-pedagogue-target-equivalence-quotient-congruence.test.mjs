import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import {
  TARGET_EQUIVALENCE_QUOTIENT_CONGRUENCE_SCHEMA,
  TARGET_EQUIVALENCE_QUOTIENT_PARENT_RECEIPT,
  canonicalWordFromCoordinate,
  composeTypedQuotientArrows,
  evaluateQuotientCoordinateFromSource,
  multiplyQuotientCoordinates,
  parityTwistPair,
  quotientArrow,
  quotientCoordinate,
  runTargetEquivalenceQuotientCongruenceAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-target-equivalence-quotient-congruence.js';

assert.equal(TARGET_EQUIVALENCE_QUOTIENT_PARENT_RECEIPT, 'b08fab1ca7786a3f70c5e1816f41c1bc9f856723');
execFileSync('git', ['cat-file', '-e', `${TARGET_EQUIVALENCE_QUOTIENT_PARENT_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', TARGET_EQUIVALENCE_QUOTIENT_PARENT_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const result = runTargetEquivalenceQuotientCongruenceAssay();
assert.equal(result.schema, TARGET_EQUIVALENCE_QUOTIENT_CONGRUENCE_SCHEMA);
assert.equal(result.passed, true, 'The preregistered quotient/congruence obligations must pass or fail loudly.');
assert.equal(result.status, 'TARGET_EQUIVALENCE_QUOTIENT_CONGRUENCE_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'SOURCE_RELATIVE_TARGET_EQUIVALENCE_DESCENDS_TO_ASSOCIATIVE_PARITY_TWISTED_CANONICAL_ROUTE_QUOTIENT_WITH_TYPED_COMPOSITION_AND_CUSTODY_EXTERNALITY',
);

assert.equal(result.algebra.passed, true);
assert.equal(result.algebra.parity_action.passed, true);
assert.equal(result.algebra.classification, 'ASSOCIATIVE_PARITY_TWISTED_N_SEMIDIRECT_N2_COORDINATE_LAW');
assert.deepEqual(result.algebra.identity, { t: 0, E: 0, O: 0 });

const odd = multiplyQuotientCoordinates(
  { t: 1, E: 2, O: 3 },
  { t: 4, E: 5, O: 7 },
);
assert.deepEqual({ t: odd.t, E: odd.E, O: odd.O }, { t: 5, E: 9, O: 8 });
assert.deepEqual(parityTwistPair(1, 5, 7), [7, 5]);
assert.deepEqual(parityTwistPair(2, 5, 7), [5, 7]);

const even = multiplyQuotientCoordinates(
  { t: 2, E: 2, O: 3 },
  { t: 4, E: 5, O: 7 },
);
assert.deepEqual({ t: even.t, E: even.E, O: even.O }, { t: 6, E: 7, O: 10 });

const sample = quotientCoordinate(['Q', 'Q', 'T', 'Q', 'T', 'Q', 'Q']);
assert.deepEqual({ t: sample.t, E: sample.E, O: sample.O }, { t: 2, E: 4, O: 1 });
const canonical = canonicalWordFromCoordinate(sample);
assert.deepEqual(canonical.word, ['Q', 'Q', 'Q', 'Q', 'T', 'Q', 'T']);
assert.deepEqual(
  { t: quotientCoordinate(canonical.word).t, E: quotientCoordinate(canonical.word).E, O: quotientCoordinate(canonical.word).O },
  { t: sample.t, E: sample.E, O: sample.O },
);

assert.equal(result.concatenation.passed, true);
assert.match(result.concatenation.universal_proof, /global block t\(u\)\+j/);
assert.equal(result.transition_locality.passed, true);
assert.equal(result.congruence.passed, true);
assert.match(result.congruence.right_congruence_symbolic, /c\(u\)=c\(v\)/);

const hostile = result.hostile;
assert.equal(hostile.passed, true);
assert.deepEqual(
  { t: hostile.odd_parity_swap_required.direct.t, E: hostile.odd_parity_swap_required.direct.E, O: hostile.odd_parity_swap_required.direct.O },
  { t: 1, E: 0, O: 1 },
);
assert.notDeepEqual(
  hostile.odd_parity_swap_required.naive_no_swap,
  hostile.odd_parity_swap_required.direct,
);
assert.equal(hostile.total_q_collapse_rejected.q_totals_equal, true);
assert.equal(hostile.total_q_collapse_rejected.coordinates_distinct, true);
assert.equal(hostile.custody_externality.same_quotient_class, true);
assert.equal(hostile.custody_externality.ledger_entries.length, 2);
assert.notDeepEqual(
  hostile.custody_externality.ledger_entries[0].word,
  hostile.custody_externality.ledger_entries[1].word,
);
assert.equal(hostile.source_retention.distinct_targets, true);
assert.equal(hostile.wrong_typed_middle_abstains.status, 'QUOTIENT_PATH_TYPE_MISMATCH_ABSTAINS');

const source = {
  endpoint: [[1, 2], [3, 4]],
  last_action: 'Q_PHASE_PULSE',
  operational_lineage: ['Q_PHASE_PULSE'],
  clock_phase: 'P0',
  forcing_season: 'S0',
};
const first = quotientArrow(source, quotientCoordinate(['T']));
assert.equal(first.status, 'TYPED_QUOTIENT_ARROW_DERIVED');
const second = quotientArrow(first.target_state, quotientCoordinate(['Q']));
assert.equal(second.status, 'TYPED_QUOTIENT_ARROW_DERIVED');
const composed = composeTypedQuotientArrows(first, second);
assert.equal(composed.status, 'TYPED_QUOTIENT_COMPOSITION_DERIVED');
assert.equal(composed.passed, true);
const directTarget = evaluateQuotientCoordinateFromSource(source, quotientCoordinate(['T', 'Q']));
assert.equal(composed.target_key, JSON.stringify(directTarget));

for (const forbidden of [
  'transport_assignment',
  'connection',
  'loop_endomorphism',
  'inverse_morphisms',
  'groupoid',
  'holonomy',
  'curvature',
  'source_erasure',
  'custody_deletion',
  'proto_loom',
  'a16',
  'production',
  'vercel',
]) {
  assert.equal(result.claim_ceiling[forbidden], false, `${forbidden} must remain outside #729 authority.`);
}
assert.equal(result.human_stop, 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_TRANSPORT_ASSIGNMENT_OR_PATH_DEPENDENT_TRANSPORT_AUDITION');

console.log('A15-R0 target-equivalence quotient/congruence summary:', JSON.stringify({
  classification: result.canonical_classification,
  quotient_object: result.quotient_object,
  algebra: result.algebra.classification,
  custody_externality: hostile.custody_externality.same_quotient_class,
  source_retention: hostile.source_retention.distinct_targets,
}));
console.log('Ash A15-R0 target-equivalence quotient and compositional congruence tests passed.');
