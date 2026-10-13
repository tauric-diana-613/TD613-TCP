import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_SCHEMA,
  evaluateRevisionPrecedenceWitnessLedgerCustody,
  sealPrecedenceWitnessRecord,
  requestSealedPrecedenceWitnessRecordMutation,
  runPedagogueSelfInkingStampGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-revision-precedence-witness-ledger-custody-self-inking-stamp.js';

const receipt = runPedagogueSelfInkingStampGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c10_notary_ribbon_verdict,
  'REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_NOTARY_RIBBON');
assert.ok([
  'REVISION_PRECEDENCE_BRIDGE_C10_FALSIFIED_AS_INDEPENDENT_WITNESS_CUSTODY_SUFFICIENT_FORM',
  'C10_SELF_ATTESTATION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c10_independent_witness_custody_verdict));
assert.equal(receipt.candidate, 'C11_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_SELF_INKING_STAMP',
  'REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_SELF_INKING_STAMP'
].includes(receipt.candidate_verdict));
assert.equal(receipt.external_witness_ledger_is_real_world_trust_root, false);
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
  'si01','si02','si03','si04','si05','si06','si07','si08','si09','si10','si11','si12'
]);

if (receipt.candidate_verdict ===
  'REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_SELF_INKING_STAMP') {
  assert.equal(receipt.inherited_c10_independent_witness_custody_verdict,
    'REVISION_PRECEDENCE_BRIDGE_C10_FALSIFIED_AS_INDEPENDENT_WITNESS_CUSTODY_SUFFICIENT_FORM');
  assert.equal(receipt.c10_self_attestation_insufficiency_established, true);
  assert.deepEqual(receipt.defeat_conditions, []);

  const { si01, si02, si03, si04, si05, si06, si07, si08, si09, si10, si11, si12 } = receipt.rooms;

  assert.equal(si01.c10_valid_admitted, true);
  assert.equal(si01.c10_fake_admitted, true);
  assert.equal(si01.validCustody.status, 'ADMIT_LEDGER_WITNESSED_REVISION_PRECEDENCE_BRIDGE');
  assert.equal(si01.validCustody.admitted, true);
  assert.equal(si01.fakeCustody.status, 'REFUSE_SELF_ATTESTED_REVISION_PRECEDENCE_BRIDGE');
  assert.equal(si01.fakeCustody.admitted, false);
  assert.equal(si01.blue.status, 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE');
  assert.equal(si01.blue.current_active, true);

  assert.equal(si02.admitted, true);
  assert.equal(si02.blue.current_active, true);

  assert.equal(si03.material_fingerprints_equal, true);
  assert.equal(si03.blue.current_active, true);

  assert.equal(si04.status_equal, true);
  assert.equal(si04.current_set_equal, true);

  assert.equal(si05.custody.status, 'REFUSE_MISSING_PRECEDENCE_WITNESS_RECORD');
  assert.equal(si05.custody.admitted, false);

  assert.equal(si06.custody.status, 'REFUSE_MISBOUND_PRECEDENCE_WITNESS_RECORD');
  assert.equal(si06.custody.admitted, false);

  assert.equal(si07.custody.status, 'REFUSE_REVOKED_PRECEDENCE_WITNESS_RECORD');
  assert.equal(si07.custody.admitted, false);

  assert.equal(si08.custody.status, 'REFUSE_DUPLICATE_PRECEDENCE_WITNESS_ID');
  assert.equal(si08.custody.admitted, false);

  assert.equal(si09.validCustody.admitted, true);
  assert.equal(si09.fakeCustody.admitted, false);
  assert.equal(si09.blue.current_active, true);

  assert.equal(si10.reverseCustody.admitted, true);
  assert.equal(si10.blue.status, 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE');
  assert.equal(si10.blue.current_active, null);

  assert.equal(si11.witness_ids_equal, true);
  assert.equal(si11.provenance_equal, false);
  assert.equal(si11.compact_ledger_authority, false);

  assert.equal(si12.mutation.status, 'SEALED_PRECEDENCE_WITNESS_RECORD_IMMUTABLE');
  assert.equal(si12.mutation.mutated, false);
  assert.equal(si12.sealed_still_frozen, true);
} else {
  assert.ok(receipt.defeat_conditions.length > 0 ||
    receipt.inherited_c10_independent_witness_custody_verdict ===
      'C10_SELF_ATTESTATION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN');
}

const empty = evaluateRevisionPrecedenceWitnessLedgerCustody({
  membership_records: [], precedence_bridges: [], witness_ledger: []
});
assert.deepEqual(empty.current_semantic_events, []);
assert.equal(empty.witness_id_lexical_authority, false);
assert.equal(empty.bridge_id_authority, false);
assert.equal(empty.membership_id_authority, false);
assert.equal(empty.input_order_authority, false);
assert.equal(empty.scalar_aggregation_used, false);

const sealed = sealPrecedenceWitnessRecord({ witness_id: 'CONTROL', revoked: false });
assert.equal(Object.isFrozen(sealed), true);
const mutation = requestSealedPrecedenceWitnessRecordMutation(sealed, { revoked: true });
assert.equal(mutation.status, 'SEALED_PRECEDENCE_WITNESS_RECORD_IMMUTABLE');
assert.equal(mutation.mutated, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_SELF_INKING_STAMP_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Self-Inking Stamp/i);
assert.match(spec, /C11_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY/);
assert.match(spec, /checksum consistency != independent witness custody/i);
assert.match(spec, /bridge describes a witness chain != bridge owns an independent witness chain/i);
assert.match(spec, /ADMIT_LEDGER_WITNESSED_REVISION_PRECEDENCE_BRIDGE/);
assert.match(spec, /REFUSE_SELF_ATTESTED_REVISION_PRECEDENCE_BRIDGE/);
assert.match(spec, /REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_SELF_INKING_STAMP/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-self-inking-stamp-revision-precedence-witness-ledger-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate_descendant, 'C11_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.strong_falsifier.c10_expected, 'ADMIT_BOTH_SELF_CONSISTENT_BRIDGES');
assert.equal(fixture.strong_falsifier.c11_fake_bridge_expected,
  'REFUSE_SELF_ATTESTED_REVISION_PRECEDENCE_BRIDGE');
assert.equal(fixture.promotion_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c10_independent_witness_custody_verdict:
    receipt.inherited_c10_independent_witness_custody_verdict,
  c10_self_attestation_insufficiency_established: receipt.c10_self_attestation_insufficiency_established,
  c11_verdict: receipt.candidate_verdict,
  c11_defeat_conditions: receipt.defeat_conditions,
  SI01_c10_valid_admitted: receipt.rooms.si01.c10_valid_admitted,
  SI01_c10_fake_admitted: receipt.rooms.si01.c10_fake_admitted,
  SI01_valid_c11_status: receipt.rooms.si01.validCustody.status,
  SI01_fake_c11_status: receipt.rooms.si01.fakeCustody.status,
  SI01_current_active: receipt.rooms.si01.blue?.current_active ?? null,
  SI05_status: receipt.rooms.si05.custody.status,
  SI06_status: receipt.rooms.si06.custody.status,
  SI07_status: receipt.rooms.si07.custody.status,
  SI08_status: receipt.rooms.si08.custody.status,
  SI10_status: receipt.rooms.si10.blue?.status ?? null,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));