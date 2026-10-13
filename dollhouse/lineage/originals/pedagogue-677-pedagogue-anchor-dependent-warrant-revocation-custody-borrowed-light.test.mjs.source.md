import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_SCHEMA,
  evaluateAnchorDependentWarrantRevocationCustody,
  makeSyntheticWarrantSupportLineage,
  runPedagogueBorrowedLightGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-anchor-dependent-warrant-revocation-custody-borrowed-light.js';

const receipt = runPedagogueBorrowedLightGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_e1_verdict,
  'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW');
assert.equal(receipt.inherited_e2_verdict,
  'EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_MOVING_SASH');
assert.equal(receipt.inherited_e1_e2_jurisdiction_preserved, true);
assert.equal(receipt.direct_dependency_scope_only, true);
assert.equal(receipt.candidate, 'E3_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_BORROWED_LIGHT',
  'ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_BORROWED_LIGHT'
].includes(receipt.candidate_verdict));
assert.equal(receipt.synthetic_exogenous_fixture, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.real_world_external_provenance_claim, false);
assert.equal(receipt.multi_hop_dependency_closure, false);
assert.equal(receipt.semantic_replacement_bridge_law, 'HELD_NOT_OPENED_HERE');
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
  'bl01','bl02','bl03','bl04','bl05','bl06','bl07','bl08','bl09','bl10','bl11','bl12'
]);

if (receipt.candidate_verdict === 'ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_BORROWED_LIGHT') {
  assert.deepEqual(receipt.defeat_conditions, []);
  const { bl01, bl02, bl03, bl04, bl05, bl06, bl07, bl08, bl09, bl10, bl11, bl12 } = receipt.rooms;

  assert.equal(bl01.before.status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.equal(bl01.after.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(bl01.after.current_support_count, 0);
  assert.equal(bl01.after.historical_support_count, 1);

  assert.equal(bl02.after.status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.deepEqual(bl02.after.current_support_kinds, ['INDEPENDENT_DECLARED_SUPPORT']);

  assert.equal(bl03.current_e2_value, 'PRE_ENTRY');
  assert.equal(bl03.old_anchor_current, false);
  assert.equal(bl03.replacement_anchor_current, true);
  assert.equal(bl03.result.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(bl04.result.status, 'ABSTAIN_WARRANT_SUPPORT_CONFLICT');
  assert.equal(bl04.result.conflict_count, 1);

  for (const mismatch of [bl05.wrongTarget, bl05.wrongField, bl05.wrongValue]) {
    assert.equal(mismatch.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
    assert.equal(mismatch.current_support_count, 0);
  }

  assert.equal(bl06.authority_equal, true);
  assert.equal(bl06.semantic_support_count_equal, true);
  assert.equal(bl06.support_fingerprint_equal, true);
  assert.equal(bl06.duplicate.duplicate_lineage_count, 1);
  assert.equal(bl06.duplicate.duplicate_lineage_is_confidence, false);

  assert.equal(bl07.authority_equal, true);
  assert.equal(bl07.current_support_fingerprint_equal, true);
  assert.equal(bl07.support_semantic_fingerprint_equal, true);
  assert.equal(bl07.mutated.lineage_identifier_is_authority, false);
  assert.equal(bl07.mutated.serialization_order_is_authority, false);

  assert.equal(bl08.historical_support_preserved, true);

  assert.equal(bl09.result.status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.equal(bl09.result.current_support_count, 1);
  assert.equal(bl09.surviving_semantic_key_current, true);
  assert.equal(bl09.withdrawn_semantic_key_current, false);

  assert.equal(bl10.result.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(bl10.result.value_only_snapshot_observed, true);
  assert.equal(bl10.result.value_only_snapshot_has_dependency_authority, false);

  assert.equal(bl11.status, 'SEALED_WARRANT_DEPENDENCY_LEDGER_IMMUTABLE');

  assert.equal(bl12.result.status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.equal(bl12.current_e2_status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(bl12.current_e2_value, 'PRE_ENTRY');
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const malformed = evaluateAnchorDependentWarrantRevocationCustody({
  warrant_key: 'W_ALPHA',
  requested_target: 'TARGET:ALPHA',
  requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
  current_epoch: 1,
  revisions: [],
  support_lineages: [makeSyntheticWarrantSupportLineage({
    lineage_id: 'BAD',
    warrant_key: 'W_BETA',
    support_kind: 'EXOGENOUS_ANCHOR',
    semantic_anchor_key: 'K_OLD',
    target_fingerprint: 'TARGET:ALPHA',
    observed_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    required_value: 'PRE_ENTRY'
  })]
});
assert.equal(malformed.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
assert.equal(malformed.rejected_lineages[0].status, 'REFUSE_WARRANT_SUPPORT_LINEAGE_WRONG_WARRANT');

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_BORROWED_LIGHT_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Borrowed Light/i);
assert.match(spec, /E3_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY/);
assert.match(spec, /same observed value != same support lineage/i);
assert.match(spec, /support disappearance != historical erasure/i);
assert.match(spec, /E3 is limited to \*\*direct declared warrant dependencies\*\*/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-borrowed-light-anchor-dependent-warrant-revocation-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E3_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.inherited_e1_e2_jurisdiction_preserved, true);
assert.equal(fixture.direct_dependency_scope_only, true);
assert.equal(fixture.strong_falsifier.observed_value_equal, true);
assert.equal(fixture.strong_falsifier.declared_bridge, false);
assert.equal(fixture.strong_falsifier.old_lineage_must_not_transfer, true);
assert.equal(fixture.multi_hop_dependency_closure, false);
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e1_verdict: receipt.inherited_e1_verdict,
  inherited_e2_verdict: receipt.inherited_e2_verdict,
  e3_verdict: receipt.candidate_verdict,
  e3_defeat_conditions: receipt.defeat_conditions,
  BL01_before_status: receipt.rooms.bl01.before.status,
  BL01_after_status: receipt.rooms.bl01.after.status,
  BL01_after_historical_support_count: receipt.rooms.bl01.after.historical_support_count,
  BL02_after_support_kinds: receipt.rooms.bl02.after.current_support_kinds,
  BL03_current_e2_value: receipt.rooms.bl03.current_e2_value,
  BL03_status: receipt.rooms.bl03.result.status,
  BL04_status: receipt.rooms.bl04.result.status,
  BL06_support_fingerprint_equal: receipt.rooms.bl06.support_fingerprint_equal,
  BL08_historical_support_preserved: receipt.rooms.bl08.historical_support_preserved,
  BL09_current_support_count: receipt.rooms.bl09.result.current_support_count,
  BL10_status: receipt.rooms.bl10.result.status,
  BL11_status: receipt.rooms.bl11.status,
  BL12_current_e2_status: receipt.rooms.bl12.current_e2_status,
  synthetic_exogenous_fixture: receipt.synthetic_exogenous_fixture,
  live_external_source_adapter: receipt.live_external_source_adapter,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
