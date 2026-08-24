import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import {
  FIRST_MOMENT_WEAKER_TRANSPORT_PARENT_RECEIPT,
  FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_SCHEMA,
  firstMomentCoordinate,
  multiplyFirstMomentCoordinates,
  runFirstMomentWeakerTransportQuotientAssay,
  sameFirstMomentCoordinate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-first-moment-weaker-transport-quotient.js';

assert.equal(FIRST_MOMENT_WEAKER_TRANSPORT_PARENT_RECEIPT, '38259af04ed12568cb5fde330a2032fd0d8817df');
execFileSync('git', ['cat-file', '-e', `${FIRST_MOMENT_WEAKER_TRANSPORT_PARENT_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', FIRST_MOMENT_WEAKER_TRANSPORT_PARENT_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const result = runFirstMomentWeakerTransportQuotientAssay();
assert.equal(result.schema, FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_SCHEMA);
assert.equal(result.passed, true, 'The preregistered first-moment weaker transport quotient obligations must pass or fail loudly.');
assert.equal(result.status, 'FIRST_MOMENT_WEAKER_TRANSPORT_QUOTIENT_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'SOURCE_RELATIVE_FIRST_BLOCK_MOMENT_FORMS_STRICT_INTERMEDIATE_WEAKER_TRANSPORT_QUOTIENT_WITH_ASSOCIATIVE_COMPOSITION',
);

assert.equal(result.symbolic_equivalence.passed, true);
assert.equal(
  result.symbolic_equivalence.classification,
  'ALL_FINITE_SOURCE_RELATIVE_WEAKER_TRANSPORT_EQUALITY_IFF_FIRST_MOMENT_COORDINATE_EQUALITY',
);
assert.match(result.symbolic_equivalence.coefficient_identity.prefix_sum_identity, /t\*q_total - P/);
assert.match(result.symbolic_equivalence.proof_scope, /All finite authored T\/Q words/);

assert.equal(result.associativity.passed, true);
assert.deepEqual(result.associativity.monomials_left, result.associativity.monomials_right);
assert.match(result.associativity.parent_associativity, /#729/);

const identity = { t: 0, E: 0, O: 0, P: 0 };
const a = { t: 1, E: 2, O: 3, P: 5 };
assert.equal(sameFirstMomentCoordinate(multiplyFirstMomentCoordinates(identity, a), a), true);
assert.equal(sameFirstMomentCoordinate(multiplyFirstMomentCoordinates(a, identity), a), true);

const direct = firstMomentCoordinate(['T', 'Q', 'T', 'Q', 'T', 'Q']);
const left = firstMomentCoordinate(['T', 'Q']);
const right = firstMomentCoordinate(['T', 'Q', 'T', 'Q']);
const product = multiplyFirstMomentCoordinates(left, right);
assert.equal(sameFirstMomentCoordinate(direct, product), true, 'First-moment product must equal direct concatenation coordinate.');

assert.equal(result.concatenation.passed, true);
assert.equal(result.concrete_controls.passed, true);
assert.equal(result.concrete_controls.rows.length, 40);
assert.equal(result.strict_refinement.passed, true);

const finer = result.strict_refinement.finer_than_parent_target;
assert.deepEqual(finer.parent_coordinate, { t: 4, E: 1, O: 0 });
assert.equal(finer.P_u, 4);
assert.equal(finer.P_v, 0);
assert.equal(finer.rows.length, 4);
for (const row of finer.rows) {
  assert.equal(row.same_parent_target, true, `${row.season}: target quotient hostile must stay in one #729 target class.`);
  assert.equal(row.weak_distinct, true, `${row.season}: first moment must refine the target class.`);
  assert.equal(row.tick_scalar_sum_distinct, true);
}

const coarser = result.strict_refinement.coarser_than_exact_route;
assert.deepEqual(coarser.coordinate, { t: 3, E: 1, O: 1, P: 3 });
assert.notDeepEqual(coarser.u_blocks, coarser.v_blocks, 'Nontrivial weak quotient must identify distinct route schedules.');
assert.equal(coarser.rows.length, 4);
for (const row of coarser.rows) {
  assert.equal(row.weak_equal, true, `${row.season}: equal C1 routes must have equal weaker observables.`);
  assert.equal(row.exact_lean_distinct, true, `${row.season}: #732 exact transport must still distinguish the routes.`);
}

assert.equal(result.receipt_externality.passed, true);
assert.equal(result.receipt_externality.weaker_observable_equal, true);
assert.equal(result.receipt_externality.receipt_distinction_preserved, true);
assert.equal(result.no_h8_farming, true);

for (const forbidden of [
  'exact_transport_compression',
  'transport_increment_cocycle',
  'cocycle_1_or_2',
  'cohomology',
  'connection',
  'inverse_transport',
  'groupoid',
  'closed_nonidentity_loop',
  'loop_endomorphism',
  'holonomy',
  'curvature',
  'berry_or_quantum',
  'higher_moment_completeness',
  'proto_loom',
  'a16',
  'live_ash_mutation',
  'merge',
  'production',
  'vercel',
]) {
  assert.equal(result.claim_ceiling[forbidden], false, `${forbidden} must remain outside #733 authority.`);
}

assert.equal(
  result.human_stop,
  'HUMAN_𝄐_REQUIRED_BEFORE_ANY_AFFINE_TRANSPORT_INCREMENT_COCYCLE_OR_HIGHER_MOMENT_HIERARCHY_AUDITION',
);

console.log('A15-R0 first-moment weaker transport quotient summary:', JSON.stringify({
  classification: result.canonical_classification,
  concrete_controls: result.concrete_controls.rows.length,
  finer_than_target: result.strict_refinement.finer_than_parent_target.rows.every((row) => row.weak_distinct),
  coarser_than_exact: result.strict_refinement.coarser_than_exact_route.rows.every((row) => row.weak_equal && row.exact_lean_distinct),
}));
console.log('Ash A15-R0 first-moment weaker transport quotient tests passed.');
