import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_SCHEMA,
  admitPrecedenceWitnessState,
  submitPrecedenceBridgePacket,
  evaluatePreAdmittedPrecedenceWitnessCustody,
  evaluateCoSubmittedPrecedenceWitness,
  requestSealedPreAdmissionStateMutation,
  runPedagogueWitnessArrivedWithDefendantGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-precedence-witness-pre-admission-protocol-custody-witness-arrived-with-defendant.js';

const receipt = runPedagogueWitnessArrivedWithDefendantGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c11_self_inking_stamp_verdict,
  'REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_SELF_INKING_STAMP');
assert.ok([
  'REVISION_PRECEDENCE_WITNESS_LEDGER_C11_FALSIFIED_AS_PRE_ADMISSION_PROTOCOL_SUFFICIENT_FORM',
  'C11_CO_SUBMISSION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c11_pre_admission_verdict));
assert.equal(receipt.candidate, 'C12_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT',
  'PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT'
].includes(receipt.candidate_verdict));
assert.equal(receipt.protocol_order_claim_only, true);
assert.equal(receipt.external_chronology_claim, false);
assert.equal(receipt.source_honesty_claim, false);
assert.equal(receipt.institutional_independence_claim, false);
assert.equal(receipt.runtime_capability_is_durable_provenance_claim, false);
assert.equal(receipt.bridge_id_authority, false);
assert.equal(receipt.membership_id_authority, false);
assert.equal(receipt.witness_id_lexical_authority, false);
assert.equal(receipt.input_order_authority, false);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'wd01','wd02','wd03','wd04','wd05','wd06','wd07','wd08','wd09','wd10','wd11','wd12'
]);

if (receipt.candidate_verdict ===
  'PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT') {
  assert.equal(receipt.inherited_c11_pre_admission_verdict,
    'REVISION_PRECEDENCE_WITNESS_LEDGER_C11_FALSIFIED_AS_PRE_ADMISSION_PROTOCOL_SUFFICIENT_FORM');
  assert.equal(receipt.c11_co_submission_insufficiency_established, true);
  assert.deepEqual(receipt.defeat_conditions, []);

  const { wd01, wd02, wd03, wd04, wd05, wd06, wd07, wd08, wd09, wd10, wd11, wd12 } = receipt.rooms;

  assert.equal(wd01.c11_co_submitted_bridge_admitted, true);
  assert.equal(wd01.c12_co_submitted_bridge_admitted, false);
  assert.equal(wd01.coSubmitted.status, 'REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS');
  assert.equal(wd01.c12_pre_admitted_bridge_admitted, true);
  assert.equal(wd01.preAdmitted.status, 'ADMIT_PRE_ADMITTED_PRECEDENCE_WITNESS');
  assert.ok(wd01.preAdmitted.admission_sequence < wd01.preAdmitted.submission_sequence);
  assert.equal(wd01.blue.status, 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE');
  assert.equal(wd01.blue.current_active, true);

  assert.equal(wd02.visible_fields_equal, true);
  assert.equal(wd02.result.status, 'REFUSE_UNRECOGNIZED_PRE_ADMISSION_STATE');
  assert.equal(wd02.result.admitted, false);

  assert.equal(wd03.mutation.status, 'SEALED_PRE_ADMISSION_STATE_IMMUTABLE');
  assert.equal(wd03.mutation.mutated, false);
  assert.equal(wd03.state_still_frozen, true);
  assert.equal(wd03.ledger_still_frozen, true);

  for (const room of [wd04, wd05, wd06, wd07]) {
    assert.equal(room.result.status, 'ADMIT_PRE_ADMITTED_PRECEDENCE_WITNESS');
    assert.equal(room.result.admitted, true);
    assert.equal(room.current_set_equal, true);
  }

  assert.equal(wd08.result.status, 'REFUSE_LATE_PRECEDENCE_WITNESS_ADMISSION');
  assert.equal(wd08.result.admitted, false);
  assert.ok(wd08.result.admission_sequence > wd08.result.submission_sequence);

  assert.equal(wd09.result.status, 'REFUSE_MISBOUND_PRECEDENCE_WITNESS_RECORD');
  assert.equal(wd09.result.admitted, false);

  assert.equal(wd10.blue.status, 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE');
  assert.equal(wd10.blue.current_active, null);

  assert.equal(wd11.visible_fields_equal, true);
  assert.equal(wd11.result.status, 'REFUSE_UNRECOGNIZED_PRE_ADMISSION_STATE');
  assert.equal(wd11.result.admitted, false);

  assert.equal(wd12.result.status, 'NO_BRIDGE_NO_PRECEDENCE_CONSEQUENCE');
  assert.equal(wd12.result.admitted, false);
  assert.equal(wd12.admitted_bridge_count, 0);
} else {
  assert.ok(receipt.defeat_conditions.length > 0 ||
    receipt.inherited_c11_pre_admission_verdict === 'C11_CO_SUBMISSION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN');
}

const counterfeit = Object.freeze({
  schema: `${PEDAGOGUE_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_SCHEMA}/admitted-state`,
  admission_sequence: -100,
  witness_ledger: [],
  state_label: 'CALLER_DECLARED_EARLY'
});
const submission = submitPrecedenceBridgePacket({ membership_records: [], precedence_bridges: [] });
const counterfeitResult = evaluatePreAdmittedPrecedenceWitnessCustody({
  bridge_submission: submission,
  pre_admitted_witness_state: counterfeit
});
assert.equal(counterfeitResult.status, 'REFUSE_UNRECOGNIZED_PRE_ADMISSION_STATE');

const state = admitPrecedenceWitnessState({ witness_ledger: [] });
assert.equal(Object.isFrozen(state), true);
const mutation = requestSealedPreAdmissionStateMutation(state, { witness_ledger: [{ witness_id: 'LATE' }] });
assert.equal(mutation.status, 'SEALED_PRE_ADMISSION_STATE_IMMUTABLE');
assert.equal(mutation.mutated, false);

const coSubmittedEmpty = evaluateCoSubmittedPrecedenceWitness({
  membership_records: [], precedence_bridges: [], witness_ledger: []
});
assert.equal(coSubmittedEmpty.status, 'REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS');
assert.equal(coSubmittedEmpty.admitted, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_WITNESS_ARRIVED_WITH_DEFENDANT_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Witness Arrived With the Defendant/i);
assert.match(spec, /C12_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY/);
assert.match(spec, /separate argument != pre-admitted custody/i);
assert.match(spec, /co-submitted witness != pre-admitted witness/i);
assert.match(spec, /pre-admitted in protocol != externally independent/i);
assert.match(spec, /ADMIT_PRE_ADMITTED_PRECEDENCE_WITNESS/);
assert.match(spec, /REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS/);
assert.match(spec, /PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-witness-arrived-with-defendant-precedence-witness-pre-admission-protocol-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate_descendant, 'C12_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.claim_ceiling.protocol_pre_admission_only, true);
assert.equal(fixture.claim_ceiling.external_chronology, false);
assert.equal(fixture.strong_falsifier.c12_co_submitted_expected,
  'REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS');
assert.equal(fixture.promotion_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c11_pre_admission_verdict: receipt.inherited_c11_pre_admission_verdict,
  c11_co_submission_insufficiency_established: receipt.c11_co_submission_insufficiency_established,
  c12_verdict: receipt.candidate_verdict,
  c12_defeat_conditions: receipt.defeat_conditions,
  WD01_c11_co_submitted_bridge_admitted: receipt.rooms.wd01.c11_co_submitted_bridge_admitted,
  WD01_c12_co_submitted_status: receipt.rooms.wd01.coSubmitted.status,
  WD01_c12_pre_admitted_status: receipt.rooms.wd01.preAdmitted.status,
  WD02_status: receipt.rooms.wd02.result.status,
  WD08_status: receipt.rooms.wd08.result.status,
  WD09_status: receipt.rooms.wd09.result.status,
  WD10_status: receipt.rooms.wd10.blue?.status ?? null,
  WD11_status: receipt.rooms.wd11.result.status,
  protocol_order_claim_only: receipt.protocol_order_claim_only,
  runtime_capability_is_durable_provenance_claim: receipt.runtime_capability_is_durable_provenance_claim,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
