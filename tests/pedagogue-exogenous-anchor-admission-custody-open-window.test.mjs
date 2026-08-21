import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_SCHEMA,
  evaluateExogenousAnchorAdmissionCustody,
  makeSyntheticExogenousAnchor,
  runPedagogueOpenWindowGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-exogenous-anchor-admission-custody-open-window.js';

const receipt = runPedagogueOpenWindowGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c14_verdict,
  'INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SURVIVES_BOUNDED_NO_WINDOW');
assert.equal(receipt.inherited_c14_survived, true);
assert.equal(receipt.c14_scope_preserved, true);
assert.equal(receipt.candidate, 'E1_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW',
  'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_OPEN_WINDOW'
].includes(receipt.candidate_verdict));
assert.equal(receipt.synthetic_exogenous_fixture, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.real_world_external_provenance_claim, false);
assert.equal(receipt.global_external_provenance_identified, false);
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
  'ow01','ow02','ow03','ow04','ow05','ow06','ow07','ow08','ow09','ow10','ow11','ow12'
]);

if (receipt.candidate_verdict === 'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW') {
  assert.deepEqual(receipt.defeat_conditions, []);
  const { ow01, ow02, ow03, ow04, ow05, ow06, ow07, ow08, ow09, ow10, ow11, ow12 } = receipt.rooms;

  assert.equal(ow01.result.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(ow01.result.observed_value, 'PRE_ENTRY');
  assert.equal(ow01.result.scoped_external_observation_identified, true);
  assert.equal(ow01.result.global_external_provenance_identified, false);
  assert.equal(ow01.result.external_source_authenticated, false);

  assert.equal(ow02.result.status, 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE');
  assert.equal(ow02.result.scoped_external_observation_identified, false);

  assert.equal(ow03.result.status, 'REFUSE_EXOGENOUS_ANCHOR_TARGET_MISMATCH');
  assert.equal(ow03.result.scoped_external_observation_identified, false);

  assert.equal(ow04.result.status, 'ABSTAIN_NO_CURRENT_EXOGENOUS_ANCHOR_STALE');
  assert.equal(ow04.result.scoped_external_observation_identified, false);

  assert.equal(ow05.result.status, 'ABSTAIN_CONFLICTING_EXOGENOUS_ANCHORS');
  assert.equal(ow05.result.distinct_observed_value_count, 2);
  assert.equal(ow05.result.scoped_external_observation_identified, false);

  assert.equal(ow06.semantic_authority_equal, true);
  assert.equal(ow06.original.anchor_identifier_is_authority, false);
  assert.equal(ow06.original.anchor_serialization_is_authority, false);

  assert.equal(ow07.semantic_support_count_equal, true);
  assert.equal(ow07.result_equal, true);
  assert.equal(ow07.duplicate.anchor_count_is_confidence, false);
  assert.equal(ow07.duplicate.scalar_aggregation_used, false);

  assert.equal(ow08.result.status, 'ABSTAIN_EXOGENOUS_ANCHOR_SCOPE_MISMATCH');
  assert.equal(ow08.result.source_honesty_identified, false);

  assert.equal(ow09.result.status, 'ABSTAIN_NO_CURRENT_EXOGENOUS_ANCHOR_INACTIVE');
  assert.equal(ow09.result.scoped_external_observation_identified, false);

  assert.equal(ow10.result.status, 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR');
  assert.equal(ow10.result.scoped_external_observation_identified, false);

  assert.equal(ow11.existence.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(ow11.origin.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(ow11.global.status, 'ABSTAIN_EXOGENOUS_ANCHOR_SCOPE_MISMATCH');
  assert.equal(ow11.global.global_external_provenance_identified, false);

  assert.equal(ow12.result.status, 'ABSTAIN_EXOGENOUS_ANCHOR_SCOPE_MISMATCH');
  assert.equal(ow12.result.textual_scope_label_is_authority, false);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const direct = evaluateExogenousAnchorAdmissionCustody({
  requested_target: 'TARGET:ALPHA',
  requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
  current_epoch: 10,
  anchors: [makeSyntheticExogenousAnchor({
    anchor_id: 'DIRECT',
    target_fingerprint: 'TARGET:ALPHA',
    observations: [{ field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }],
    valid_from_epoch: 1,
    valid_through_epoch: 20
  })]
});
assert.equal(direct.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
assert.equal(direct.global_external_provenance_identified, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_OPEN_WINDOW_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Open Window/i);
assert.match(spec, /E1_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY/);
assert.match(spec, /There is no automatic `C15`/i);
assert.match(spec, /Under-use failure/i);
assert.match(spec, /Overclaim failure/i);
assert.match(spec, /synthetic exogenous/i);
assert.match(spec, /anchor presence != global provenance authority/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-open-window-exogenous-anchor-admission-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E1_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.namespace_break.c14_terminal_internal_sequence, true);
assert.equal(fixture.namespace_break.automatic_c15, false);
assert.equal(fixture.namespace_break.e1_new_evidence_jurisdiction, true);
assert.equal(fixture.synthetic_anchor_covenant.live_external_source_adapter, false);
assert.equal(fixture.claim_ceiling.global_external_provenance_identified, false);
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c14_verdict: receipt.inherited_c14_verdict,
  e1_verdict: receipt.candidate_verdict,
  e1_defeat_conditions: receipt.defeat_conditions,
  OW01_status: receipt.rooms.ow01.result.status,
  OW01_value: receipt.rooms.ow01.result.observed_value,
  OW01_global_provenance: receipt.rooms.ow01.result.global_external_provenance_identified,
  OW02_status: receipt.rooms.ow02.result.status,
  OW05_status: receipt.rooms.ow05.result.status,
  OW08_status: receipt.rooms.ow08.result.status,
  OW10_status: receipt.rooms.ow10.result.status,
  OW11_global_status: receipt.rooms.ow11.global.status,
  synthetic_exogenous_fixture: receipt.synthetic_exogenous_fixture,
  live_external_source_adapter: receipt.live_external_source_adapter,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
