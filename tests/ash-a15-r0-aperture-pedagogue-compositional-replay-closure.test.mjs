import assert from 'node:assert/strict';
import {
  candidateReplayAbstractions,
  declaredContinuationGrammarG0,
  deriveCompositionalHistoryUniverse,
  evaluateFiniteContinuationCongruence,
  runCompositionalReplayClosureGauntlet,
  stepReceiptSensitiveHostile,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-compositional-replay-closure.js';
import { runPartialEventCustodyProjectionGauntlet } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-partial-event-custody-projection.js';
import { runTranscriptCompressionCollisionGauntlet } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transcript-compression-collision.js';

const keyOf = (value) => JSON.stringify(value);

const partialParent = runPartialEventCustodyProjectionGauntlet();
const collisionParent = runTranscriptCompressionCollisionGauntlet();
assert.equal(partialParent.passed, true);
assert.equal(collisionParent.passed, true);

const parentPartialBefore = JSON.stringify(partialParent);
const parentCollisionBefore = JSON.stringify(collisionParent.universe);

const derived = deriveCompositionalHistoryUniverse(collisionParent);
assert.equal(derived.status, 'COMPOSITIONAL_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_CUSTODY');
assert.deepEqual(derived.histories.map((history) => history.id), ['H_AB', 'H_BA', 'H_AB_DUP']);
assert.equal(Object.isFrozen(derived.histories), true);
assert.equal(Object.isFrozen(derived.histories[0]), true);
assert.equal(Object.isFrozen(derived.histories[0].custody_events), true);

const byId = new Map(derived.histories.map((history) => [history.id, history]));
const H_AB = byId.get('H_AB');
const H_BA = byId.get('H_BA');
const H_AB_DUP = byId.get('H_AB_DUP');

assert.deepEqual(H_AB.endpoint, [[3, 1], [1, 4]]);
assert.deepEqual(H_BA.endpoint, H_AB.endpoint);
assert.equal(H_AB.cumulative, 6);
assert.equal(H_BA.cumulative, 6);
assert.deepEqual(H_AB.operational_lineage, ['A', 'B']);
assert.deepEqual(H_BA.operational_lineage, ['B', 'A']);
assert.equal(H_AB.last_action, 'B');
assert.equal(H_BA.last_action, 'A');
assert.equal(H_AB.receipt_variant, 'R1');
assert.equal(H_AB_DUP.receipt_variant, 'R1_DUP');
assert.notEqual(H_AB.receipt_variant, H_AB_DUP.receipt_variant);
assert.deepEqual(H_AB.custody_events, H_AB_DUP.custody_events);

assert.equal(
  keyOf(candidateReplayAbstractions.K_endpoint(H_AB)),
  keyOf(candidateReplayAbstractions.K_endpoint(H_BA)),
  'Common endpoint must collide under K_endpoint.',
);
assert.equal(
  keyOf(candidateReplayAbstractions.K_claim(H_AB)),
  keyOf(candidateReplayAbstractions.K_claim(H_BA)),
  'Endpoint + current cumulative claim view must collide for AB/BA.',
);
assert.notEqual(
  keyOf(candidateReplayAbstractions.K_declared(H_AB)),
  keyOf(candidateReplayAbstractions.K_declared(H_BA)),
  'Declared operational abstraction must retain the operational AB/BA distinction.',
);
assert.equal(
  keyOf(candidateReplayAbstractions.K_declared(H_AB)),
  keyOf(candidateReplayAbstractions.K_declared(H_AB_DUP)),
  'Declared operational abstraction must nontrivially quotient receipt-level duplication.',
);

assert.deepEqual(
  Object.keys(declaredContinuationGrammarG0),
  ['Q_ENDPOINT_READ', 'Q_LAST_ACTION_KICK', 'Q_LINEAGE_PARITY'],
  'G0 must remain preregistered and may not silently absorb the receipt-sensitive hostile.',
);
assert.equal('Q_RECEIPT_SENSITIVE' in declaredContinuationGrammarG0, false);

const endpointEval = evaluateFiniteContinuationCongruence(
  derived.histories,
  candidateReplayAbstractions.K_endpoint,
);
assert.equal(endpointEval.continuation_congruent, false);
const endpointKick = endpointEval.violations.find((entry) => (
  entry.continuation_id === 'Q_LAST_ACTION_KICK'
  && entry.source_member_ids.includes('H_AB')
  && entry.source_member_ids.includes('H_BA')
));
assert.ok(endpointKick, 'Endpoint-only abstraction must retain an explicit last-action-kick counterexample.');
assert.equal(endpointKick.successor_variants.length >= 2, true);

const claimEval = evaluateFiniteContinuationCongruence(
  derived.histories,
  candidateReplayAbstractions.K_claim,
);
assert.equal(claimEval.continuation_congruent, false);
const claimKick = claimEval.violations.find((entry) => (
  entry.continuation_id === 'Q_LAST_ACTION_KICK'
  && entry.source_member_ids.includes('H_AB')
  && entry.source_member_ids.includes('H_BA')
));
assert.ok(claimKick, 'Current claim-sufficient abstraction must retain an explicit future-separation counterexample.');

const declaredEval = evaluateFiniteContinuationCongruence(
  derived.histories,
  candidateReplayAbstractions.K_declared,
);
assert.equal(declaredEval.continuation_congruent, true);
assert.equal(declaredEval.violations.length, 0);
assert.equal(declaredEval.transition_rows.every((row) => row.representative_independent === true), true);
const duplicateFiber = declaredEval.non_singleton_fibers.find((fiber) => (
  fiber.member_ids.length === 2
  && fiber.member_ids.includes('H_AB')
  && fiber.member_ids.includes('H_AB_DUP')
));
assert.ok(duplicateFiber, 'K_declared must pass non-vacuously with a receipt-level collision.');

const endpointReadAB = declaredContinuationGrammarG0.Q_ENDPOINT_READ(H_AB);
const endpointReadDup = declaredContinuationGrammarG0.Q_ENDPOINT_READ(H_AB_DUP);
assert.equal(
  keyOf(candidateReplayAbstractions.K_declared(endpointReadAB)),
  keyOf(candidateReplayAbstractions.K_declared(endpointReadDup)),
);
assert.equal(endpointReadAB.custody_events.at(-1).scalar_response, 7);

const kickAB = declaredContinuationGrammarG0.Q_LAST_ACTION_KICK(H_AB);
const kickBA = declaredContinuationGrammarG0.Q_LAST_ACTION_KICK(H_BA);
assert.deepEqual(kickAB.endpoint, [[3, 1], [1, 5]]);
assert.deepEqual(kickBA.endpoint, [[4, 1], [1, 4]]);
assert.notDeepEqual(kickAB.endpoint, kickBA.endpoint);
assert.equal(kickAB.custody_events.at(-1).consumed.previous_last_action, 'B');
assert.equal(kickBA.custody_events.at(-1).consumed.previous_last_action, 'A');

const hostileAB = stepReceiptSensitiveHostile(H_AB);
const hostileDup = stepReceiptSensitiveHostile(H_AB_DUP);
assert.equal(
  keyOf(candidateReplayAbstractions.K_declared(H_AB)),
  keyOf(candidateReplayAbstractions.K_declared(H_AB_DUP)),
);
assert.notEqual(
  keyOf(candidateReplayAbstractions.K_declared(hostileAB)),
  keyOf(candidateReplayAbstractions.K_declared(hostileDup)),
  'Explicit grammar widening must defeat the old quotient when receipt identity becomes operational.',
);
assert.equal(hostileAB.custody_events.at(-1).consumed.receipt_variant, 'R1');
assert.equal(hostileDup.custody_events.at(-1).consumed.receipt_variant, 'R1_DUP');

assert.equal(JSON.stringify(partialParent), parentPartialBefore);
assert.equal(JSON.stringify(collisionParent.universe), parentCollisionBefore);
assert.equal(Object.isFrozen(partialParent), true);
assert.equal(Object.isFrozen(collisionParent.universe), true);

const failedParent = deriveCompositionalHistoryUniverse({ passed: false });
assert.equal(failedParent.status, 'PARENT_COMPRESSION_COLLISION_NOT_WITNESSED_BY_EXECUTABLE');
assert.equal(failedParent.disposition, 'ABSTAIN_BEFORE_COMPOSITIONAL_HISTORY_DERIVATION');

const result = runCompositionalReplayClosureGauntlet();
assert.equal(result.passed, true);
for (const [key, value] of Object.entries(result.criteria)) {
  assert.equal(value, true, `${key} must hold`);
}

assert.equal(
  result.candidate_results.K_endpoint.classification,
  'ENDPOINT_ONLY_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE',
);
assert.equal(
  result.candidate_results.K_claim.classification,
  'CLAIM_SUFFICIENT_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE',
);
assert.equal(
  result.candidate_results.K_declared.classification,
  'DECLARED_OPERATIONAL_ABSTRACTION_PASSES_FINITE_CONTINUATION_CONGRUENCE_OVER_G0',
);
assert.equal(
  result.grammar_widening_hostile.classification,
  'COMPOSITIONAL_CLOSURE_IS_GRAMMAR_RELATIVE_IN_AUTHORED_FIXTURE',
);
assert.equal(
  result.classification,
  'FINITE_GRAMMAR_RELATIVE_COMPOSITIONAL_REPLAY_CLOSURE_WITH_PROJECTION_COUNTEREXAMPLES',
);
assert.equal(
  result.canonical_bounded_scientific_claim,
  'IN_THE_AUTHORED_FINITE_CONTINUATION_GRAMMAR_A_COMMON_ENDPOINT_OR_CURRENT_CLAIM_SUFFICIENT_PROJECTION_CAN_COLLAPSE_HISTORIES_THAT_A_DECLARED_HISTORY_SENSITIVE_CONTINUATION_LATER_SEPARATES_WHILE_A_RICHER_OPERATIONAL_ABSTRACTION_WITH_A_NONTRIVIAL_RECEIPT_LEVEL_COLLISION_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_EVERY_PREREGISTERED_G0_CONTINUATION_AND_FAILS_WHEN_THE_GRAMMAR_IS_EXPLICITLY_WIDENED_TO_A_RECEIPT_SENSITIVE_CONTINUATION',
);
assert.equal(
  result.next_learning_action,
  'STOP_FOR_HUMAN_𝄐_BEFORE_PROMOTING_ANY_VALIDATED_QUOTIENT_CLASS_TO_A_PATH_OBJECT_OR_AUTHORING_PATH_CATEGORY_GRAMMAR',
);

for (const key of [
  'generic_right_congruence_theorem_earned',
  'myhill_nerode_identification_earned',
  'minimal_automaton_theorem_earned',
  'bisimulation_theorem_earned',
  'predictive_state_representation_theorem_earned',
  'markov_state_theorem_earned',
  'minimal_sufficient_state_theorem_earned',
  'optimal_state_abstraction_theorem_earned',
  'causal_state_theorem_earned',
  'state_minimization_theorem_earned',
  'generic_history_compression_theorem_earned',
  'general_controlled_sensing_theorem_earned',
  'general_path_dependence_theorem_earned',
  'path_object_promotion_authority',
  'path_category_earned',
  'path_groupoid_earned',
  'transport_functor_earned',
  'connection_earned',
  'loop_endomorphism_earned',
  'holonomy_earned',
  'curvature_earned',
  'berry_structure_earned',
  'quantum_behavior_earned',
  'canonical_operator_tomography_promotion_authority',
  'proto_loom_earned',
  'td613_general_theorem_earned',
  'a16_reopened',
  'live_ash_mutation',
  'merge_authority',
  'production_authority',
  'vercel_authority',
]) {
  assert.equal(result[key], false, `${key} must remain false`);
}

console.log(JSON.stringify({
  schema: result.schema,
  classification: result.classification,
  endpoint_closed: result.candidate_results.K_endpoint.continuation_congruent,
  claim_closed: result.candidate_results.K_claim.continuation_congruent,
  declared_closed: result.candidate_results.K_declared.continuation_congruent,
  declared_nontrivial_fibers: result.candidate_results.K_declared.non_singleton_fibers.map((fiber) => fiber.member_ids),
  grammar_widening: result.grammar_widening_hostile.classification,
  next: result.next_learning_action,
}));
