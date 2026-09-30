import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_SCHEMA,
  evaluateMembershipEpochBundleCustody,
  sealMembershipEpochBundle,
  requestSealedMembershipEpochBundleMutation,
  runPedagogueTwoStampsSameMinuteGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-membership-epoch-bundle-custody-two-stamps-same-minute.js';

const receipt = runPedagogueTwoStampsSameMinuteGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c8_cut_and_paste_verdict,
  'EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CUT_AND_PASTE');
assert.ok([
  'EVENT_MEMBERSHIP_REVISION_CUSTODY_C8_FALSIFIED_AS_SAME_EPOCH_ARBITRATION_SUFFICIENT_FORM',
  'C8_SAME_EPOCH_ARBITRATION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c8_same_epoch_arbitration_verdict));
assert.equal(receipt.candidate, 'C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE',
  'MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAMPS_SAME_MINUTE'
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
  'tsmm01','tsmm02','tsmm03','tsmm04','tsmm05','tsmm06',
  'tsmm07','tsmm08','tsmm09','tsmm10','tsmm11','tsmm12'
]);

if (receipt.candidate_verdict ===
  'MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE') {
  assert.equal(receipt.inherited_c8_same_epoch_arbitration_verdict,
    'EVENT_MEMBERSHIP_REVISION_CUSTODY_C8_FALSIFIED_AS_SAME_EPOCH_ARBITRATION_SUFFICIENT_FORM');
  assert.equal(receipt.c8_membership_state_flipped_by_identifier_rename, true);
  assert.deepEqual(receipt.defeat_conditions, []);

  const { tsmm01, tsmm02, tsmm03, tsmm04, tsmm05, tsmm06,
    tsmm07, tsmm08, tsmm09, tsmm10, tsmm11, tsmm12 } = receipt.rooms;

  assert.equal(tsmm01.c8_blue_current, true);
  assert.equal(tsmm01.c9.status, 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP');
  assert.equal(tsmm01.c9_blue_bundle.current_active, null);

  assert.equal(tsmm02.c8_blue_current, false);
  assert.equal(tsmm02.c9.status, 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP');
  assert.equal(tsmm02.c9_blue_bundle.current_active, null);

  assert.equal(tsmm03.status_equal, true);
  assert.equal(tsmm03.current_set_equal, true);

  assert.equal(tsmm04.blue_bundle.material_disposition_status, 'UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE');
  assert.equal(tsmm04.blue_bundle.current_active, true);
  assert.equal(tsmm04.blue_bundle.record_count, 2);

  assert.equal(tsmm05.blue_bundle.material_disposition_status, 'UNIFORM_INACTIVE_MEMBERSHIP_EPOCH_BUNDLE');
  assert.equal(tsmm05.blue_bundle.current_active, false);
  assert.equal(tsmm05.blue_bundle.record_count, 2);

  assert.equal(tsmm06.c8_epoch_one_transition_count, 2);
  assert.equal(tsmm06.c9_epoch_one_bundle_count, 1);
  assert.equal(tsmm06.c9_episode_count_identified, false);

  assert.equal(tsmm07.trace.episode_count, 2);
  assert.equal(tsmm07.trace.episode_count_identified, true);

  assert.equal(tsmm08.inherited_status, 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP');
  assert.equal(tsmm08.inherited_current_edge_count, 0);

  assert.ok(tsmm09.result.rejected_records.some(item => item.record?.membership_id === 'ZZZZ_BAD'));
  assert.ok(tsmm09.result.current_semantic_events.includes('ADD_REPLACEMENT_LINEAGE'));

  assert.ok(tsmm10.result.rejected_records.some(item =>
    item.status === 'REJECT_DUPLICATE_EVENT_MEMBERSHIP_ID'));

  assert.equal(tsmm11.current_active_equal, true);
  assert.equal(tsmm11.record_custody_equal, false);
  assert.equal(tsmm11.compact_bundle_history_authority, false);

  assert.equal(tsmm12.mutation.status, 'SEALED_MEMBERSHIP_EPOCH_BUNDLE_IMMUTABLE');
  assert.equal(tsmm12.mutation.mutated, false);
  assert.equal(tsmm12.sealed_still_frozen, true);
} else {
  assert.ok(receipt.defeat_conditions.length > 0 ||
    receipt.inherited_c8_same_epoch_arbitration_verdict ===
      'C8_SAME_EPOCH_ARBITRATION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN');
}

const empty = evaluateMembershipEpochBundleCustody({ membership_records: [] });
assert.equal(empty.current_semantic_events.length, 0);
assert.equal(empty.membership_id_authority, false);
assert.equal(empty.input_order_authority, false);
assert.equal(empty.revision_kind_lexical_authority, false);

const sealed = sealMembershipEpochBundle({ records: [] });
assert.equal(Object.isFrozen(sealed), true);
const mutation = requestSealedMembershipEpochBundleMutation(sealed, []);
assert.equal(mutation.status, 'SEALED_MEMBERSHIP_EPOCH_BUNDLE_IMMUTABLE');
assert.equal(mutation.mutated, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_TWO_STAMPS_SAME_MINUTE_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Two Stamps Same Minute/i);
assert.match(spec, /C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY/);
assert.match(spec, /membership identifier ordering != revision authority/i);
assert.match(spec, /ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP/);
assert.match(spec, /epoch-bundle granularity/i);
assert.match(spec, /MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE/);
assert.match(spec, /EVENT_MEMBERSHIP_REVISION_CUSTODY_C8_FALSIFIED_AS_SAME_EPOCH_ARBITRATION_SUFFICIENT_FORM/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-two-stamps-same-minute-membership-epoch-bundle-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate_descendant, 'C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.strong_falsifier.required_c9_posture,
  'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP');
assert.equal(fixture.promotion_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c8_same_epoch_arbitration_verdict: receipt.inherited_c8_same_epoch_arbitration_verdict,
  c8_membership_state_flipped_by_identifier_rename: receipt.c8_membership_state_flipped_by_identifier_rename,
  c9_verdict: receipt.candidate_verdict,
  c9_defeat_conditions: receipt.defeat_conditions,
  TSMM01_c8_blue_current: receipt.rooms.tsmm01.c8_blue_current,
  TSMM02_c8_blue_current: receipt.rooms.tsmm02.c8_blue_current,
  TSMM01_c9_status: receipt.rooms.tsmm01.c9.status,
  TSMM02_c9_status: receipt.rooms.tsmm02.c9.status,
  TSMM04_uniform_active: receipt.rooms.tsmm04.blue_bundle.material_disposition_status,
  TSMM05_uniform_inactive: receipt.rooms.tsmm05.blue_bundle.material_disposition_status,
  TSMM06_c8_transition_count: receipt.rooms.tsmm06.c8_epoch_one_transition_count,
  TSMM06_c9_bundle_count: receipt.rooms.tsmm06.c9_epoch_one_bundle_count,
  TSMM07_episode_count: receipt.rooms.tsmm07.trace.episode_count,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
