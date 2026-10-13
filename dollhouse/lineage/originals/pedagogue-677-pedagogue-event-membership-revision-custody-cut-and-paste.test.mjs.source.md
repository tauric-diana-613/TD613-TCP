import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_EVENT_MEMBERSHIP_REVISION_CUSTODY_SCHEMA,
  evaluateEventMembershipLedger,
  evaluateEventMembershipRevisionCustody,
  sealEventMembershipLedger,
  requestSealedEventMembershipLedgerMutation,
  runPedagogueCutAndPasteGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-event-membership-revision-custody-cut-and-paste.js';

const receipt = runPedagogueCutAndPasteGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_EVENT_MEMBERSHIP_REVISION_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c7_fixed_event_set_result_preserved, true);
assert.ok([
  'ADMISSION_WITNESS_REPLAY_CUSTODY_C7_FALSIFIED_AS_EVENT_MEMBERSHIP_REVISION_SUFFICIENT_FORM',
  'C7_EVENT_MEMBERSHIP_REVISION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c7_event_membership_revision_verdict));
assert.equal(receipt.candidate, 'C8_EVENT_MEMBERSHIP_REVISION_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CUT_AND_PASTE',
  'EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CUT_AND_PASTE'
].includes(receipt.candidate_verdict));
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.product_mutation, false);
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
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'cpx01','cpx02','cpx03','cpx04','cpx05','cpx06','cpx07','cpx08','cpx09','cpx10','cpx11','cpx12'
]);

if (receipt.candidate_verdict === 'EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CUT_AND_PASTE') {
  assert.equal(
    receipt.inherited_c7_event_membership_revision_verdict,
    'ADMISSION_WITNESS_REPLAY_CUSTODY_C7_FALSIFIED_AS_EVENT_MEMBERSHIP_REVISION_SUFFICIENT_FORM'
  );
  assert.deepEqual(receipt.defeat_conditions, []);

  const { cpx01, cpx02, cpx03, cpx04, cpx05, cpx06, cpx07, cpx08, cpx09, cpx10, cpx11, cpx12 } = receipt.rooms;

  assert.equal(cpx01.c7_replay_still_internally_valid, true);
  assert.equal(cpx01.c7_current_edge_before_membership_gate, true);
  assert.equal(cpx01.c8_current_edge_after_withdrawal, 0);
  assert.equal(cpx01.c8_refusal_observed, true);
  assert.equal(cpx01.historical_witness_custody_preserved, true);

  assert.equal(cpx02.result.current_admitted_semantic_edges.length, 0);
  assert.ok(cpx02.result.membership_ledger.current_semantic_events.includes('UNRELATED_BLUE_REPLACEMENT'));
  assert.ok(!cpx02.result.membership_ledger.current_semantic_events.includes('ADD_REPLACEMENT_LINEAGE'));

  assert.equal(cpx03.blue_episode_count, 1);
  assert.equal(cpx03.current_edge_preserved, true);

  assert.equal(cpx04.blue_episode_count, 2);
  assert.equal(cpx04.current_edge_restored, true);

  assert.equal(cpx05.current_event_set_equal, true);
  assert.equal(cpx05.membership_history_equal, false);

  assert.equal(cpx06.result.current_admitted_semantic_edges.length, 0);
  assert.ok(cpx06.result.membership_ledger.current_semantic_events.includes('BLUE_SPLIT_A'));
  assert.ok(cpx06.result.membership_ledger.current_semantic_events.includes('BLUE_SPLIT_B'));

  assert.equal(cpx07.result.current_admitted_semantic_edges.length, 0);
  assert.ok(cpx07.result.membership_ledger.current_semantic_events.includes('MERGED_PINK_BLUE'));

  assert.ok(cpx08.result.membership_ledger.rejected_records.some(item => item.record?.membership_id === 'AAA_BAD'));
  assert.equal(cpx08.result.current_admitted_semantic_edges.length, 1);

  assert.equal(cpx09.result.status, 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP');
  assert.equal(cpx09.result.current_admitted_semantic_edges.length, 0);
  assert.ok(cpx09.result.membership_ledger.conflicts.length > 0);

  assert.equal(cpx10.current_event_set_equal, true);
  assert.equal(cpx10.membership_history_equal, false);
  assert.equal(cpx10.compact_history_authority, false);

  assert.equal(cpx11.mutation.status, 'SEALED_EVENT_MEMBERSHIP_LEDGER_IMMUTABLE');
  assert.equal(cpx11.mutation.mutated, false);
  assert.equal(cpx11.sealed_still_frozen, true);

  assert.equal(cpx12.c7_replay_valid, true);
  assert.equal(cpx12.historical_witness_preserved, true);
  assert.equal(cpx12.current_edge_admitted, false);
}
else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const sealed = sealEventMembershipLedger([]);
assert.equal(Object.isFrozen(sealed), true);
const mutation = requestSealedEventMembershipLedgerMutation(sealed, []);
assert.equal(mutation.status, 'SEALED_EVENT_MEMBERSHIP_LEDGER_IMMUTABLE');
assert.equal(mutation.mutated, false);

const emptyLedger = evaluateEventMembershipLedger({ membership_records: [] });
assert.equal(emptyLedger.current_semantic_events.length, 0);
assert.equal(emptyLedger.raw_identifier_authority, false);
assert.equal(emptyLedger.serialization_order_authority, false);

assert.throws(() => evaluateEventMembershipRevisionCustody({ witness_result: null }), /witness_result required/);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_CUT_AND_PASTE_EVENT_MEMBERSHIP_REVISION_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Cut-and-Paste/i);
assert.match(spec, /C8_EVENT_MEMBERSHIP_REVISION_CUSTODY/);
assert.match(spec, /replayable witness in prior event universe/i);
assert.match(spec, /must not erase historical witness custody merely because an event leaves the current universe/i);
assert.match(spec, /Reintroduction after a membership gap creates a new current membership episode/i);
assert.match(spec, /REFUSE_CURRENT_EDGE_EVENT_MEMBERSHIP_INCOMPLETE/);
assert.match(spec, /ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP/);
assert.match(spec, /SEALED_EVENT_MEMBERSHIP_LEDGER_IMMUTABLE/);
assert.match(spec, /ADMISSION_WITNESS_REPLAY_CUSTODY_C7_FALSIFIED_AS_EVENT_MEMBERSHIP_REVISION_SUFFICIENT_FORM/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-cut-and-paste-event-membership-revision-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.status, 'PREREGISTERED_PRE_EXECUTION');
assert.equal(fixture.inherited_candidate.id, 'C7_ADMISSION_WITNESS_REPLAY_CUSTODY');
assert.equal(fixture.inherited_candidate.fixed_event_set_jurisdiction_preserved, true);
assert.equal(fixture.candidate.id, 'C8_EVENT_MEMBERSHIP_REVISION_CUSTODY');
assert.equal(fixture.candidate.promotion_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(fixture.candidate.presumption_of_survival, false);
assert.equal(fixture.frozen_scope.base_witness_replay_derivation_grammar_fixed, true);
assert.equal(fixture.frozen_scope.c7_replay_validation_semantics_fixed, true);
assert.equal(fixture.frozen_scope.event_membership_state_variable, true);
assert.equal(fixture.frozen_scope.event_membership_history_variable, true);
assert.equal(fixture.frozen_scope.sampling_allowed, false);
assert.equal(fixture.frozen_scope.scalar_aggregation_allowed, false);
assert.equal(fixture.hostile_rooms.length, 12);
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
  inherited_c7_event_membership_revision_verdict: receipt.inherited_c7_event_membership_revision_verdict,
  c8_verdict: receipt.candidate_verdict,
  c8_defeat_conditions: receipt.defeat_conditions,
  CPX01_c7_replay_valid: receipt.rooms.cpx01.c7_replay_still_internally_valid,
  CPX01_current_edge_after_withdrawal: receipt.rooms.cpx01.c8_current_edge_after_withdrawal,
  CPX03_continuous_episode_count: receipt.rooms.cpx03.blue_episode_count,
  CPX04_reintroduced_episode_count: receipt.rooms.cpx04.blue_episode_count,
  CPX05_current_set_equal: receipt.rooms.cpx05.current_event_set_equal,
  CPX05_history_equal: receipt.rooms.cpx05.membership_history_equal,
  CPX09_status: receipt.rooms.cpx09.result.status,
  CPX11_mutation_status: receipt.rooms.cpx11.mutation.status,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
