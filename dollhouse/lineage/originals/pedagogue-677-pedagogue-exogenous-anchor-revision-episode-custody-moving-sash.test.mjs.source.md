import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_SCHEMA,
  evaluateExogenousAnchorRevisionEpisodeCustody,
  makeSyntheticExogenousAnchorRevision,
  runPedagogueMovingSashGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-exogenous-anchor-revision-episode-custody-moving-sash.js';

const receipt = runPedagogueMovingSashGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_e1_verdict,
  'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW');
assert.equal(receipt.inherited_e1_jurisdiction_preserved, true);
assert.equal(receipt.e1_revision_custody_overclaim_asserted, false);
assert.equal(receipt.candidate, 'E2_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_MOVING_SASH',
  'EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_MOVING_SASH'
].includes(receipt.candidate_verdict));
assert.equal(receipt.synthetic_exogenous_fixture, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.real_world_external_provenance_claim, false);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.promotion_authority, false);
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'ms01','ms02','ms03','ms04','ms05','ms06','ms07','ms08','ms09','ms10','ms11','ms12'
]);

if (receipt.candidate_verdict === 'EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_MOVING_SASH') {
  assert.deepEqual(receipt.defeat_conditions, []);
  const { ms01, ms02, ms03, ms04, ms05, ms06, ms07, ms08, ms09, ms10, ms11, ms12 } = receipt.rooms;

  assert.equal(ms01.current_e1_observation_equal, true);
  assert.equal(ms01.history_equal, false);
  assert.equal(ms01.continuous_episode_count, 1);
  assert.equal(ms01.interrupted_episode_count, 2);

  assert.equal(ms02.old_current, false);
  assert.equal(ms02.new_current, true);

  assert.equal(ms03.episode_count, 1);
  assert.equal(ms04.episode_count, 2);

  assert.equal(ms05.result.status, 'ABSTAIN_CONFLICTING_SAME_EPOCH_EXOGENOUS_ANCHOR_REVISION');
  assert.equal(ms05.result.latest_conflict_count, 1);
  assert.equal(ms05.result.revision_identifier_is_authority, false);

  assert.equal(ms06.current_authority_equal, true);
  assert.equal(ms06.episode_count_equal, true);
  assert.equal(ms06.history_fingerprint_equal, true);

  assert.equal(ms07.current_equal, true);
  assert.equal(ms07.episode_count_equal, true);
  assert.equal(ms07.history_fingerprint_equal, true);
  assert.equal(ms07.duplicate.duplicate_revision_is_confidence, false);

  assert.equal(ms08.result.current_e1_result.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(ms08.result.current_e1_result.observed_value, 'PRE_ENTRY');

  assert.equal(ms09.before.current_e1_result.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(ms09.after.current_e1_result.status, 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR');
  assert.equal(ms09.historical_event_count_after, 2);

  assert.equal(ms10.current_equal, true);
  assert.equal(ms10.compact_revision_history_authority, false);
  assert.equal(ms10.full.current_snapshot_has_revision_history_authority, false);

  assert.equal(ms11.status, 'SEALED_EXOGENOUS_ANCHOR_REVISION_LEDGER_IMMUTABLE');
  assert.equal(ms12.current_semantics_equal, true);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const directConflict = evaluateExogenousAnchorRevisionEpisodeCustody({
  requested_target: 'TARGET:ALPHA',
  requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
  current_epoch: 2,
  revisions: [
    makeSyntheticExogenousAnchorRevision({
      revision_id: 'A',
      semantic_anchor_key: 'K',
      epoch: 2,
      revision_kind: 'ADMIT',
      active: true,
      raw_anchor_id: 'ANCHOR',
      target_fingerprint: 'TARGET:ALPHA',
      observations: [{ field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }]
    }),
    makeSyntheticExogenousAnchorRevision({
      revision_id: 'Z',
      semantic_anchor_key: 'K',
      epoch: 2,
      revision_kind: 'WITHDRAW',
      active: false,
      raw_anchor_id: 'ANCHOR',
      target_fingerprint: 'TARGET:ALPHA',
      observations: [{ field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }]
    })
  ]
});
assert.equal(directConflict.status, 'ABSTAIN_CONFLICTING_SAME_EPOCH_EXOGENOUS_ANCHOR_REVISION');
assert.equal(directConflict.revision_identifier_is_authority, false);
assert.equal(directConflict.serialization_order_is_authority, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_MOVING_SASH_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Moving Sash/i);
assert.match(spec, /E2_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY/);
assert.match(spec, /Current equality is not historical equality|Same current observation does not imply same historical custody/i);
assert.match(spec, /Same-semantic same-epoch records are evaluated as an epoch bundle/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-moving-sash-exogenous-anchor-revision-episode-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E2_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.inherited_e1_jurisdiction_preserved, true);
assert.equal(fixture.e1_revision_custody_overclaim_asserted, false);
assert.equal(fixture.strong_falsifier.same_current_e1_observation, true);
assert.equal(fixture.strong_falsifier.continuous_episode_count, 1);
assert.equal(fixture.strong_falsifier.interrupted_episode_count, 2);
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e1_verdict: receipt.inherited_e1_verdict,
  e1_jurisdiction_preserved: receipt.inherited_e1_jurisdiction_preserved,
  e2_verdict: receipt.candidate_verdict,
  e2_defeat_conditions: receipt.defeat_conditions,
  MS01_current_e1_observation_equal: receipt.rooms.ms01.current_e1_observation_equal,
  MS01_history_equal: receipt.rooms.ms01.history_equal,
  MS01_episode_counts: [receipt.rooms.ms01.continuous_episode_count, receipt.rooms.ms01.interrupted_episode_count],
  MS05_status: receipt.rooms.ms05.result.status,
  MS06_history_fingerprint_equal: receipt.rooms.ms06.history_fingerprint_equal,
  MS09_after_status: receipt.rooms.ms09.after.current_e1_result.status,
  MS11_status: receipt.rooms.ms11.status,
  MS12_current_semantics_equal: receipt.rooms.ms12.current_semantics_equal,
  synthetic_exogenous_fixture: receipt.synthetic_exogenous_fixture,
  live_external_source_adapter: receipt.live_external_source_adapter,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));