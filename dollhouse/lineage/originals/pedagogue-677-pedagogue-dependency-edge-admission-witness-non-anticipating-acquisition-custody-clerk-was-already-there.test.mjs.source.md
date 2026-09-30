import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA,
  runPedagogueClerkWasAlreadyThereGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-dependency-edge-admission-witness-non-anticipating-acquisition-custody-clerk-was-already-there.js';

const receipt = runPedagogueClerkWasAlreadyThereGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA);
assert.equal(
  receipt.inherited_e6_verdict,
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_PERMIT_PRINTER'
);
assert.ok([
  'E6_WITNESS_ACQUISITION_ORDER_INSUFFICIENCY_ESTABLISHED',
  'E6_WITNESS_ACQUISITION_ORDER_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_e6_witness_acquisition_order_verdict));
assert.equal(receipt.inherited_e6_e5_e4_semantics_preserved, true);
assert.equal(receipt.candidate, 'E7_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CLERK_WAS_ALREADY_THERE',
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CLERK_WAS_ALREADY_THERE'
].includes(receipt.candidate_verdict));
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'ca01','ca02','ca03','ca04','ca05','ca06','ca07','ca08','ca09','ca10','ca11','ca12'
]);

assert.equal(receipt.non_anticipation_relative_to_internal_proposal_only, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.external_physical_acquisition_time_claim, false);
assert.equal(receipt.source_honesty_claim, false);
assert.equal(receipt.unbiased_sampling_claim, false);
assert.equal(receipt.institutional_independence_claim, false);
assert.equal(receipt.real_world_chronology_claim, false);
assert.equal(receipt.universal_graph_semantics, false);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);

if (receipt.candidate_verdict === 'DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CLERK_WAS_ALREADY_THERE') {
  assert.deepEqual(receipt.defeat_conditions, []);
  assert.equal(receipt.inherited_e6_witness_acquisition_order_verdict, 'E6_WITNESS_ACQUISITION_ORDER_INSUFFICIENCY_ESTABLISHED');

  const { ca01, ca02, ca03, ca04, ca05, ca06, ca07, ca08, ca09, ca10, ca11, ca12 } = receipt.rooms;

  assert.equal(ca01.inherited_e6_insufficiency_established, true);
  assert.equal(ca01.postRawE6.witnessed_permit_count, 1);
  assert.equal(ca01.postRawE6.e5_filtered.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(ca01.preResult.status, 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(ca01.preResult.admitted, true);
  assert.equal(ca01.postResult.status, 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(ca01.postResult.admitted, false);
  assert.equal(ca01.postResult.filtered_e6_result.e5_filtered.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ca02.visible_fields_equal, true);
  assert.equal(ca02.directE6.witnessed_permit_count, 1);
  assert.equal(ca02.result.status, 'REFUSE_UNRECOGNIZED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE');

  assert.equal(ca03.mutation.status, 'SEALED_DEPENDENCY_EDGE_ADMISSION_WITNESS_ACQUISITION_EPISODE_IMMUTABLE');
  assert.equal(ca03.mutation.mutated, false);
  assert.equal(ca03.episode_still_frozen, true);
  assert.equal(ca03.ledger_still_frozen, true);

  assert.equal(ca04.current_state_equal, true);
  assert.equal(ca04.status_equal, true);
  assert.equal(ca04.result.proposal_id_authority, false);

  assert.equal(ca05.material_edge_equal, true);
  assert.equal(ca05.current_state_equal, true);
  assert.equal(ca05.status_equal, true);
  assert.equal(ca05.a.witness_identifier_is_authority, false);
  assert.equal(ca05.a.admission_identifier_is_authority, false);

  assert.equal(ca06.current_state_equal, true);
  assert.equal(ca06.status_equal, true);
  assert.equal(ca06.reverse.serialization_order_is_authority, false);

  assert.equal(ca07.result.status, 'NO_DEPENDENCY_EDGE_NO_TRANSITIVE_CONSEQUENCE');
  assert.equal(ca07.result.filtered_e6_result.e5_filtered.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ca08.result.status, 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(ca08.result.filtered_e6_result.admission_evaluations[0].status, 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS');

  assert.equal(ca09.result.status, 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(ca09.result.filtered_e6_result.admission_evaluations[0].status, 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS');

  assert.equal(ca10.result.status, 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(ca10.real_status, 'ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION');
  assert.equal(ca10.fake_status, 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION');
  assert.equal(ca10.result.filtered_e6_result.e5_filtered.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.ok(ca10.result.episode_evaluations.some(item => item.status === 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS'));

  assert.equal(ca11.current_state_equal, true);
  assert.equal(ca11.status_equal, true);
  assert.equal(ca11.far_distance_greater, true);
  assert.equal(ca11.far.sequence_distance_is_confidence, false);

  assert.equal(ca12.mutation.status, 'SEALED_DEPENDENCY_EDGE_ADMISSION_PROPOSAL_IMMUTABLE');
  assert.equal(ca12.mutation.mutated, false);
  assert.equal(ca12.proposal_still_frozen, true);
  assert.equal(ca12.current_state_equal, true);
  assert.equal(ca12.result.status, 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS');
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_CLERK_WAS_ALREADY_THERE_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Clerk Was Already There/i);
assert.match(spec, /E7_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY/);
assert.match(spec, /matching witness-ledger record\s*!= non-anticipating acquisition/i);
assert.match(spec, /protocol acquisition before protocol proposal\s*!= external physical acquisition time/i);
assert.match(spec, /acquisition-source\/origin provenance/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-clerk-was-already-there-dependency-edge-admission-witness-non-anticipating-acquisition-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E7_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY');
assert.equal(fixture.parent_e6_receipt, '99a080f75973c00dc7633c42b62609b7cb391168');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.strong_falsifier.raw_e6_required_to_admit_post_proposal_material, true);
assert.equal(fixture.strong_falsifier.e7_required_pre_status, 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS');
assert.equal(fixture.strong_falsifier.e7_required_post_status, 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS');
assert.equal(fixture.required_protocol.visible_field_clone_is_authority, false);
assert.equal(fixture.required_protocol.sequence_distance_is_confidence, false);
assert.equal(fixture.next_learning_action_if_survives, 'ATTACK_ACQUISITION_SOURCE_ORIGIN_PROVENANCE_BEFORE_LARGER_GRAPH_FORMALISM');
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e6_verdict: receipt.inherited_e6_verdict,
  inherited_e6_witness_acquisition_order_verdict: receipt.inherited_e6_witness_acquisition_order_verdict,
  e7_verdict: receipt.candidate_verdict,
  e7_defeat_conditions: receipt.defeat_conditions,
  CA01_raw_e6_W2: receipt.rooms.ca01.postRawE6.e5_filtered.e4_result.warrant_results.W2?.status ?? null,
  CA01_pre_status: receipt.rooms.ca01.preResult.status,
  CA01_post_status: receipt.rooms.ca01.postResult.status,
  CA02_status: receipt.rooms.ca02.result.status,
  CA03_status: receipt.rooms.ca03.mutation.status,
  CA04_invariant: receipt.rooms.ca04.current_state_equal && receipt.rooms.ca04.status_equal,
  CA05_invariant: receipt.rooms.ca05.current_state_equal && receipt.rooms.ca05.status_equal,
  CA06_order_invariant: receipt.rooms.ca06.current_state_equal && receipt.rooms.ca06.status_equal,
  CA07_status: receipt.rooms.ca07.result.status,
  CA08_status: receipt.rooms.ca08.result.status,
  CA09_status: receipt.rooms.ca09.result.status,
  CA10_W2: receipt.rooms.ca10.result.filtered_e6_result.e5_filtered.e4_result.warrant_results.W2?.status ?? null,
  CA11_distance_is_confidence: receipt.rooms.ca11.far.sequence_distance_is_confidence,
  CA12_status: receipt.rooms.ca12.result.status,
  next_learning_action_if_survives: receipt.next_learning_action_if_survives,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
