import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_SCHEMA,
  runPedagogueReturnAddressGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-dependency-edge-admission-witness-source-origin-custody-return-address.js';

const receipt = runPedagogueReturnAddressGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_SCHEMA);
assert.equal(
  receipt.inherited_e7_verdict,
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CLERK_WAS_ALREADY_THERE'
);
assert.ok([
  'E7_SOURCE_ORIGIN_INSUFFICIENCY_ESTABLISHED',
  'E7_SOURCE_ORIGIN_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_e7_source_origin_verdict));
assert.equal(receipt.inherited_e7_e6_e5_e4_semantics_preserved, true);
assert.equal(receipt.candidate, 'E8_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RETURN_ADDRESS',
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_RETURN_ADDRESS'
].includes(receipt.candidate_verdict));
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'ra01','ra02','ra03','ra04','ra05','ra06','ra07','ra08','ra09','ra10','ra11','ra12'
]);

assert.equal(receipt.synthetic_source_origin_lane_terminal_if_survives, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.source_authenticated, false);
assert.equal(receipt.source_honesty_identified, false);
assert.equal(receipt.physical_origin_identified, false);
assert.equal(receipt.institutional_independence_identified, false);
assert.equal(receipt.external_chronology_identified, false);
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

if (receipt.candidate_verdict === 'DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RETURN_ADDRESS') {
  assert.deepEqual(receipt.defeat_conditions, []);
  assert.equal(receipt.inherited_e7_source_origin_verdict, 'E7_SOURCE_ORIGIN_INSUFFICIENCY_ESTABLISHED');

  const { ra01, ra02, ra03, ra04, ra05, ra06, ra07, ra08, ra09, ra10, ra11, ra12 } = receipt.rooms;

  assert.equal(ra01.inherited_e7_source_origin_insufficiency_established, true);
  assert.equal(ra01.result.e7_result.status, 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(ra01.result.status, 'REFUSE_SOURCE_ORIGIN_UNIDENTIFIED');
  assert.equal(ra01.result.admitted, false);
  assert.equal(ra01.result.effective_e6_result.e5_filtered.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ra02.result.status, 'ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS');
  assert.equal(ra02.result.admitted, true);
  assert.equal(ra02.result.origin_result.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(ra02.result.origin_result.observed_value, 'ADMITTED_EXTERNAL_ORIGIN');
  assert.equal(ra02.result.effective_e6_result.e5_filtered.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(ra02.result.source_authenticated, false);

  assert.equal(ra03.result.status, 'REFUSE_SOURCE_ORIGIN_INTERNAL_SELF_ATTESTATION');
  assert.equal(ra03.result.origin_result.status, 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE');

  assert.equal(ra04.result.status, 'REFUSE_SOURCE_ORIGIN_TARGET_MISMATCH');
  assert.equal(ra04.result.origin_result.status, 'REFUSE_EXOGENOUS_ANCHOR_TARGET_MISMATCH');

  assert.equal(ra05.result.status, 'ABSTAIN_SOURCE_ORIGIN_ANCHOR_STALE');
  assert.equal(ra05.result.origin_result.status, 'ABSTAIN_NO_CURRENT_EXOGENOUS_ANCHOR_STALE');

  assert.equal(ra06.result.status, 'ABSTAIN_CONFLICTING_SOURCE_ORIGIN_ANCHORS');
  assert.equal(ra06.result.origin_result.status, 'ABSTAIN_CONFLICTING_EXOGENOUS_ANCHORS');

  assert.equal(ra07.current_state_equal, true);
  assert.equal(ra07.status_equal, true);
  assert.equal(ra07.origin_value_equal, true);
  assert.equal(ra07.semantic_support_equal, true);
  assert.equal(ra07.mutated.origin_anchor_identifier_is_authority, false);
  assert.equal(ra07.mutated.origin_anchor_serialization_is_authority, false);

  assert.equal(ra08.current_state_equal, true);
  assert.equal(ra08.status_equal, true);
  assert.equal(ra08.semantic_support_count_equal, true);
  assert.equal(ra08.duplicate.origin_anchor_count_is_confidence, false);

  assert.equal(ra09.result.status, 'REFUSE_SOURCE_ORIGIN_INTERNAL_SELF_ATTESTATION');
  assert.equal(ra09.result.textual_scope_label_is_authority, false);

  assert.equal(ra10.result.status, 'REFUSE_E7_NON_ANTICIPATING_ACQUISITION_INVALID');
  assert.equal(ra10.result.e7_result.status, 'REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(ra10.result.effective_e6_result.e5_filtered.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ra11.result.origin_result.status, 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION');
  assert.equal(ra11.result.origin_result.observed_value, 'INTERNAL_ORIGIN');
  assert.equal(ra11.result.status, 'REFUSE_UNACCEPTED_SOURCE_ORIGIN_CLASS');

  assert.equal(ra12.anchor_frozen, true);
  assert.equal(ra12.observations_frozen, true);
  assert.equal(ra12.current_state_equal, true);
  assert.equal(ra12.result.status, 'ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS');
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_RETURN_ADDRESS_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Return Address/i);
assert.match(spec, /E8_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY/);
assert.match(spec, /pre-proposal acquisition\s*!= independently admitted source origin/i);
assert.match(spec, /admitted synthetic source-origin anchor\s*!= authenticated live source/i);
assert.match(spec, /new explicit human gesture/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-return-address-dependency-edge-admission-witness-source-origin-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E8_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY');
assert.equal(fixture.parent_e7_receipt, '6200e9b86844e23692fe125cd3d10df47b14ffab');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.required_origin_field, 'SOURCE_ORIGIN_CLASS');
assert.equal(fixture.required_origin_value, 'ADMITTED_EXTERNAL_ORIGIN');
assert.equal(fixture.strong_falsifier.e7_required_status, 'ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS');
assert.equal(fixture.strong_falsifier.missing_origin_required_e8_status, 'REFUSE_SOURCE_ORIGIN_UNIDENTIFIED');
assert.equal(fixture.strong_falsifier.matching_origin_required_e8_status, 'ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS');
assert.equal(fixture.live_external_source_adapter, false);
assert.equal(fixture.source_authenticated, false);
assert.equal(fixture.next_learning_action_if_survives, 'STOP_SYNTHETIC_SOURCE_ORIGIN_LANE_AND_REQUIRE_NEW_HUMAN_GESTURE_FOR_LIVE_EXTERNAL_SOURCE_OBSERVABILITY');
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e7_verdict: receipt.inherited_e7_verdict,
  inherited_e7_source_origin_verdict: receipt.inherited_e7_source_origin_verdict,
  e8_verdict: receipt.candidate_verdict,
  e8_defeat_conditions: receipt.defeat_conditions,
  RA01_e7_status: receipt.rooms.ra01.result.e7_result.status,
  RA01_e8_status: receipt.rooms.ra01.result.status,
  RA01_W2: receipt.rooms.ra01.result.effective_e6_result.e5_filtered.e4_result.warrant_results.W2?.status ?? null,
  RA02_status: receipt.rooms.ra02.result.status,
  RA02_W2: receipt.rooms.ra02.result.effective_e6_result.e5_filtered.e4_result.warrant_results.W2?.status ?? null,
  RA03_status: receipt.rooms.ra03.result.status,
  RA04_status: receipt.rooms.ra04.result.status,
  RA05_status: receipt.rooms.ra05.result.status,
  RA06_status: receipt.rooms.ra06.result.status,
  RA07_invariant: receipt.rooms.ra07.current_state_equal && receipt.rooms.ra07.status_equal && receipt.rooms.ra07.semantic_support_equal,
  RA08_duplicate_amplification: receipt.rooms.ra08.duplicate.origin_anchor_count_is_confidence,
  RA09_status: receipt.rooms.ra09.result.status,
  RA10_status: receipt.rooms.ra10.result.status,
  RA11_status: receipt.rooms.ra11.result.status,
  RA12_status: receipt.rooms.ra12.result.status,
  next_learning_action_if_survives: receipt.next_learning_action_if_survives,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
