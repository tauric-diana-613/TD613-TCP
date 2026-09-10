import assert from 'node:assert/strict';

import {
  applyPathGenerator,
  composeTypedArrows,
  evaluatePathWord,
  generateBoundedPathWords,
  pathObjectProjection,
  runFirstBoundedPathGrammarGauntlet,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-first-bounded-path-grammar.js';
import { deriveRecurrenceHistoryUniverse } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-temporal-recurrence-phase-aliasing.js';

const result = runFirstBoundedPathGrammarGauntlet();

assert.equal(result.passed, true, 'The preregistered first bounded path-object / path-grammar gauntlet must pass before classification.');
assert.equal(result.status, 'FIRST_BOUNDED_PATH_OBJECT_GRAMMAR_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'FINITE_NONVACUOUS_DIRECTED_PATH_OBJECT_GRAMMAR_OVER_K_PERIOD4_WITH_TYPED_COMPOSITION_ROUTE_SENSITIVITY_AND_NO_NONEMPTY_DEPTH_FOUR_CLOSURE',
);

const recurrence = deriveRecurrenceHistoryUniverse();
const byId = new Map(recurrence.histories.map((history) => [history.id, history]));
const R_AB_S0 = byId.get('R_AB_S0');
const R_AB_DUP_S0 = byId.get('R_AB_DUP_S0');
assert.ok(R_AB_S0 && R_AB_DUP_S0, 'The non-vacuous receipt-distinct anchor fiber must derive from #715 custody.');
assert.notEqual(R_AB_S0.receipt_variant, R_AB_DUP_S0.receipt_variant);
assert.deepEqual(pathObjectProjection(R_AB_S0), pathObjectProjection(R_AB_DUP_S0));
assert.equal(result.anchor_receipt_distinct, true);
assert.equal(result.anchor_state_equal, true);
assert.deepEqual([...result.anchor_object.member_ids].sort(), ['R_AB_DUP_S0', 'R_AB_S0']);

const words = generateBoundedPathWords(4);
assert.equal(words.length, 30, 'The bounded grammar must enumerate all 30 nonempty binary words through depth four.');
assert.equal(words.filter((word) => word.length === 1).length, 2);
assert.equal(words.filter((word) => word.length === 2).length, 4);
assert.equal(words.filter((word) => word.length === 3).length, 8);
assert.equal(words.filter((word) => word.length === 4).length, 16);
assert.equal(result.bounded_words.length, 30);

assert.equal(result.all_words_representative_independent, true);
assert.equal(result.representative_independence.all_words_representative_independent, true);
assert.equal(result.representative_independence.all_state_sequences_representative_independent, true);
assert.equal(result.representative_independence.all_receipt_distinctions_preserved, true);
assert.equal(result.representative_independence.all_arrows_typed, true);
assert.equal(result.word_evaluations.length, 30);
for (const evaluation of result.word_evaluations) {
  assert.equal(evaluation.representative_independent, true, `${evaluation.word_label} must be representative-independent across the receipt-distinct anchor fiber.`);
  assert.equal(evaluation.state_sequence_independent, true, `${evaluation.word_label} must preserve the same typed state sequence across representatives.`);
  assert.equal(evaluation.receipt_distinction_preserved, true, `${evaluation.word_label} must retain receipt-level distinction.`);
  assert.equal(evaluation.all_arrows_typed, true, `${evaluation.word_label} must remain source/target typed at every step.`);
  assert.equal(evaluation.abstentions.length, 0, `${evaluation.word_label} must be lawful under the declared grammar.`);
}

const tFromAnchor = evaluatePathWord(R_AB_S0, ['T']);
const qFromAnchor = evaluatePathWord(R_AB_S0, ['Q']);
const mistyped = composeTypedArrows(tFromAnchor.arrows[0], qFromAnchor.arrows[0]);
assert.equal(mistyped.status, 'PATH_TYPE_MISMATCH_ABSTAINS');
assert.equal(mistyped.disposition, 'ABSTAIN_BEFORE_TYPED_PATH_COMPOSITION');
assert.equal(result.typed_composition_control.mistyped.status, 'PATH_TYPE_MISMATCH_ABSTAINS');

const tq = evaluatePathWord(R_AB_S0, ['T', 'Q']);
assert.equal(tq.status, 'BOUNDED_PATH_WORD_EVALUATED');
assert.equal(tq.typed, true);
assert.equal(tq.arrows[0].target_key, tq.arrows[1].source_key);
const lawfulComposition = composeTypedArrows(tq.arrows[0], tq.arrows[1]);
assert.equal(lawfulComposition.status, 'TYPED_PATH_COMPOSITION_ADMITTED');
assert.equal(result.typed_composition_control.lawful_t_then_q.status, 'TYPED_PATH_COMPOSITION_ADMITTED');

assert.equal(result.direct_bridges_agree, true);
assert.equal(result.direct_bridge_controls.length, 6);
for (const bridge of result.direct_bridge_controls) {
  assert.equal(bridge.equal, true, `T^${bridge.ticks} path evaluation must agree with its independently authored #715 direct operator for ${bridge.history_id}.`);
}

const tqAnchor = evaluatePathWord(R_AB_S0, ['T', 'Q']);
const qtAnchor = evaluatePathWord(R_AB_S0, ['Q', 'T']);
assert.deepEqual(tqAnchor.target_state.endpoint, [[4, 2], [1, 4]]);
assert.equal(tqAnchor.target_state.forcing_season, 'S1');
assert.equal(tqAnchor.target_state.clock_phase, 'P1');
assert.equal(tqAnchor.target_state.last_action, 'Q_PHASE_PULSE');
assert.deepEqual(tqAnchor.target_state.operational_lineage, ['A', 'B', 'Q_PHASE_PULSE']);
assert.deepEqual(qtAnchor.target_state.endpoint, [[4, 2], [1, 5]]);
assert.equal(qtAnchor.target_state.forcing_season, 'S1');
assert.equal(qtAnchor.target_state.clock_phase, 'P1');
assert.equal(qtAnchor.target_state.last_action, 'Q_PHASE_PULSE');
assert.deepEqual(qtAnchor.target_state.operational_lineage, ['A', 'B', 'Q_PHASE_PULSE']);
assert.notEqual(tqAnchor.target_key, qtAnchor.target_key);
assert.equal(result.route_order_control.tq_representative_independent, true);
assert.equal(result.route_order_control.qt_representative_independent, true);
assert.equal(result.route_order_control.target_objects_equal, false);
assert.equal(result.route_order_control.classification, 'DIRECTED_PATH_WORD_ORDER_IS_OPERATIONALLY_OBSERVABLE');

const t4 = evaluatePathWord(R_AB_S0, ['T', 'T', 'T', 'T']);
assert.deepEqual(t4.source_state.endpoint, [[3, 1], [1, 4]]);
assert.deepEqual(t4.target_state.endpoint, [[3, 4], [1, 7]]);
assert.equal(t4.source_state.clock_phase, 'P0');
assert.equal(t4.target_state.clock_phase, 'P0');
assert.equal(t4.source_state.forcing_season, 'S0');
assert.equal(t4.target_state.forcing_season, 'S0');
assert.equal(t4.closed, false);
assert.equal(result.recurrence_closure_control.clock_phase_recurs, true);
assert.equal(result.recurrence_closure_control.forcing_season_recurs, true);
assert.equal(result.recurrence_closure_control.endpoint_recurs, false);
assert.equal(result.recurrence_closure_control.path_object_closes, false);
assert.equal(result.recurrence_closure_control.classification, 'PARAMETER_RECURRENCE_WITHOUT_PATH_OBJECT_CLOSURE');
assert.deepEqual(result.closed_nonempty_anchor_paths, []);

const unknown = applyPathGenerator(R_AB_S0, 'X');
assert.equal(unknown.status, 'UNDECLARED_PATH_GENERATOR_ABSTAINS');
assert.equal(unknown.disposition, 'ABSTAIN_BEFORE_PATH_EVALUATION');
assert.equal(result.abstention_controls.unknown_generator.status, 'UNDECLARED_PATH_GENERATOR_ABSTAINS');

assert.equal(result.parent_custody_unchanged, true, 'The path assay may derive from #715 but must not mutate the parent witness.');
assert.match(result.bounded_claim, /^IN_THE_AUTHORED_FINITE_FIXTURE_/);
assert.equal(result.claim_ceiling.formal_category, false);
assert.equal(result.claim_ceiling.free_category, false);
assert.equal(result.claim_ceiling.groupoid, false);
assert.equal(result.claim_ceiling.inverse_morphisms, false);
assert.equal(result.claim_ceiling.transport_or_connection, false);
assert.equal(result.claim_ceiling.loop_endomorphism_or_holonomy, false);
assert.equal(result.claim_ceiling.curvature, false);
assert.equal(result.claim_ceiling.proto_loom, false);
assert.equal(result.claim_ceiling.a16, false);
assert.equal(result.claim_ceiling.merge, false);
assert.equal(result.claim_ceiling.production, false);
assert.equal(result.claim_ceiling.vercel, false);
assert.equal(
  result.stop,
  'HUMAN_𝄐_QUALIFIED_FOR_FINITE_PATH_CATEGORY_AUDITION_BUT_CATEGORY_PROMOTION_NOT_YET_GRANTED_BY_THIS_CHAMBER',
);

console.log('Ash A15-R0 Aperture × Pedagogue first bounded path-object / directed path-grammar tests passed.');
