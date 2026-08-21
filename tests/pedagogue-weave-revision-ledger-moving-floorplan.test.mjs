import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_WEAVE_REVISION_CUSTODY_SCHEMA,
  evaluateWeaveRevisionLedger,
  sealPrecedenceEpochDeclaration,
  requestSealedPrecedenceEpochMutation,
  runPedagogueMovingFloorplanGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-weave-revision-ledger-moving-floorplan.js';

const receipt = runPedagogueMovingFloorplanGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_WEAVE_REVISION_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c4_one_relation_result_preserved, true);
assert.ok([
  'WARRANT_WEAVE_C4_FALSIFIED_AS_PRECEDENCE_REVISION_CUSTODY_SUFFICIENT_FORM',
  'C4_PRECEDENCE_REVISION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c4_revision_custody_verdict));
assert.equal(receipt.candidate, 'C5_WEAVE_REVISION_LEDGER');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'WEAVE_REVISION_LEDGER_CANDIDATE_SURVIVES_BOUNDED_MOVING_FLOORPLAN',
  'WEAVE_REVISION_LEDGER_CANDIDATE_FALSIFIED_IN_BOUNDED_MOVING_FLOORPLAN'
].includes(receipt.candidate_verdict));
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');

const roomNames = Object.keys(receipt.rooms).sort();
assert.deepEqual(roomNames, ['mf01','mf02','mf03','mf04','mf05','mf06','mf07','mf08','mf09','mf10']);

if (receipt.candidate_verdict === 'WEAVE_REVISION_LEDGER_CANDIDATE_SURVIVES_BOUNDED_MOVING_FLOORPLAN') {
  assert.equal(receipt.inherited_c4_revision_custody_verdict, 'WARRANT_WEAVE_C4_FALSIFIED_AS_PRECEDENCE_REVISION_CUSTODY_SUFFICIENT_FORM');
  assert.deepEqual(receipt.defeat_conditions, []);

  const { mf01, mf02, mf03, mf04, mf05, mf06, mf07, mf08, mf09, mf10 } = receipt.rooms;

  assert.equal(mf01.current_relation_equal, true);
  assert.equal(mf01.current_posture_equal, true);
  assert.equal(mf01.revision_history_equal, false);
  assert.deepEqual(
    mf01.full.accepted_posture_trace.map(item => item.transient_support_continuity),
    [
      'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER',
      'IDENTIFIED_SUPPORT_INTERRUPTION',
      'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER'
    ]
  );
  assert.equal(mf01.full.accepted_epochs[2].current_relation_matches_prior_relation, true);
  assert.deepEqual(mf01.full.accepted_epochs[2].relation_matches_prior_epoch_ids, ['K0_OPEN_LANDING']);
  assert.equal(mf01.full.precedence_revision_history_preserved, true);
  assert.equal(mf01.full.historical_posture_compacted_into_current, false);
  assert.equal(mf01.full.latest_state_only_history_authority, false);

  assert.deepEqual(
    mf02.receipt.accepted_posture_trace.map(item => item.transient_support_continuity),
    [
      'ABSTAIN_TRANSIENT_HISTORY_NOT_IDENTIFIED_BY_PARTIAL_ORDER',
      'IDENTIFIED_CONTINUOUS_SUPPORT',
      'IDENTIFIED_SUPPORT_INTERRUPTION'
    ]
  );

  assert.equal(mf03.semantic_posture_trace_invariant, true);
  assert.equal(mf03.semantic_relation_trace_invariant, true);
  assert.equal(mf03.semantic_revision_history_invariant, true);

  assert.equal(mf04.relation_equivalent, true);
  assert.equal(mf04.posture_equivalent, true);

  assert.ok(mf05.receipt.rejected_epochs.some(item =>
    item.status === 'REJECT_EPOCH_IDENTIFIER_REUSE_WITH_DIFFERENT_RELATION'
  ));
  assert.equal(mf05.receipt.current_epoch_id, 'SAME_FOLDER');

  assert.ok(mf06.receipt.rejected_epochs.some(item =>
    item.status === 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE'
  ));
  assert.equal(mf06.receipt.current_epoch_id, 'VALID_FIRST');

  assert.equal(mf07.current_relation_equal, true);
  assert.equal(mf07.current_posture_equal, true);
  assert.equal(mf07.revision_history_equal, false);
  assert.equal(mf07.compacted_prior_posture_authority, false);

  assert.equal(mf08.receipt.accepted_epoch_count, 2);
  assert.equal(mf08.receipt.accepted_epochs[1].semantic_relation_changed_from_previous_accepted, false);
  assert.equal(mf08.receipt.accepted_epochs[1].posture_changed_from_previous_accepted, false);

  assert.equal(mf09.mutation.status, 'SEALED_PRECEDENCE_EPOCH_IMMUTABLE');
  assert.equal(mf09.mutation.mutated, false);
  assert.equal(mf09.sealed_still_empty, true);

  assert.equal(mf10.current_relation_equivalent, true);
  assert.equal(mf10.current_posture_equivalent, true);
  assert.equal(mf10.revision_history_equivalent, false);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const sealed = sealPrecedenceEpochDeclaration({
  epoch_id: 'DIRECT_SEAL',
  precedence_edges: [['A','B']]
});
assert.equal(Object.isFrozen(sealed), true);
assert.equal(Object.isFrozen(sealed.precedence_edges), true);
const mutation = requestSealedPrecedenceEpochMutation(sealed, []);
assert.equal(mutation.status, 'SEALED_PRECEDENCE_EPOCH_IMMUTABLE');
assert.equal(mutation.mutated, false);

assert.throws(() => evaluateWeaveRevisionLedger(), /base_specimen required/);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_MOVING_FLOORPLAN_WEAVE_REVISION_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Moving Floorplan/i);
assert.match(spec, /C5_WEAVE_REVISION_LEDGER/);
assert.match(spec, /current weave state = precedence-history custody/i);
assert.match(spec, /same current relation != same precedence-revision history/i);
assert.match(spec, /raw edge-list difference != semantic relation difference/i);
assert.match(spec, /REJECT_EPOCH_IDENTIFIER_REUSE_WITH_DIFFERENT_RELATION/);
assert.match(spec, /SEALED_PRECEDENCE_EPOCH_IMMUTABLE/);
assert.match(spec, /WARRANT_WEAVE_C4_FALSIFIED_AS_PRECEDENCE_REVISION_CUSTODY_SUFFICIENT_FORM/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-moving-floorplan-weave-revision-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.status, 'PREREGISTERED_PRE_EXECUTION');
assert.equal(fixture.inherited_candidate.id, 'C4_WARRANT_WEAVE');
assert.equal(fixture.inherited_candidate.one_relation_jurisdiction_preserved, true);
assert.equal(fixture.candidate.id, 'C5_WEAVE_REVISION_LEDGER');
assert.equal(fixture.candidate.promotion_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(fixture.candidate.presumption_of_survival, false);
assert.equal(fixture.frozen_scope.event_set_fixed_across_epochs, true);
assert.equal(fixture.frozen_scope.only_precedence_relation_changes, true);
assert.equal(fixture.frozen_scope.sampling_allowed, false);
assert.equal(fixture.frozen_scope.scalar_aggregation_allowed, false);
assert.equal(fixture.hostile_rooms.length, 10);
assert.equal(fixture.authority.product_mutation, false);
assert.equal(fixture.authority.shared_pedagogue_engine_mutation, false);
assert.equal(fixture.authority.workflow_mutation, false);
assert.equal(fixture.authority.browser_execution, false);
assert.equal(fixture.authority.deployment_authority, false);
assert.equal(fixture.authority.release_authority, false);
assert.equal(fixture.authority.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(fixture.authority.promotion_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c4_revision_custody_verdict: receipt.inherited_c4_revision_custody_verdict,
  c5_verdict: receipt.candidate_verdict,
  c5_defeat_conditions: receipt.defeat_conditions,
  MF01_posture_trace: receipt.rooms.mf01.full.accepted_posture_trace.map(item => item.transient_support_continuity),
  MF01_current_relation_equal_to_compacted: receipt.rooms.mf01.current_relation_equal,
  MF01_revision_history_equal_to_compacted: receipt.rooms.mf01.revision_history_equal,
  MF03_epoch_id_rename_invariant: receipt.rooms.mf03.semantic_revision_history_invariant,
  MF04_redundant_edge_relation_equivalent: receipt.rooms.mf04.relation_equivalent,
  MF06_current_epoch_after_invalid_update: receipt.rooms.mf06.receipt.current_epoch_id,
  MF09_mutation_status: receipt.rooms.mf09.mutation.status,
  MF10_revision_history_equivalent: receipt.rooms.mf10.revision_history_equivalent,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
