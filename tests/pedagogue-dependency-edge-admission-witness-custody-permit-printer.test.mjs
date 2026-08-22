import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_SCHEMA,
  runPedagoguePermitPrinterGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-dependency-edge-admission-witness-custody-permit-printer.js';

const receipt = runPedagoguePermitPrinterGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_SCHEMA);
assert.equal(
  receipt.inherited_e5_verdict,
  'DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_UNLICENSED_ELECTRICIAN'
);
assert.ok([
  'E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_ESTABLISHED',
  'E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_e5_admission_ledger_provenance_verdict));
assert.equal(receipt.inherited_e5_and_e4_semantics_preserved, true);
assert.equal(receipt.candidate, 'E6_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_PERMIT_PRINTER',
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_PERMIT_PRINTER'
].includes(receipt.candidate_verdict));
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'pp01','pp02','pp03','pp04','pp05','pp06','pp07','pp08','pp09','pp10','pp11','pp12','pp13','pp14'
]);

assert.equal(receipt.synthetic_exogenous_fixture, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.real_world_external_provenance_claim, false);
assert.equal(receipt.real_world_authorization_claim, false);
assert.equal(receipt.witness_acquisition_provenance, 'HELD_FOR_NEXT_ATTACK');
assert.equal(receipt.pre_admission_witness_protocol, 'HELD_FOR_NEXT_ATTACK');
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

if (receipt.candidate_verdict === 'DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_PERMIT_PRINTER') {
  assert.deepEqual(receipt.defeat_conditions, []);
  assert.equal(
    receipt.inherited_e5_admission_ledger_provenance_verdict,
    'E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_ESTABLISHED'
  );

  const { pp01, pp02, pp03, pp04, pp05, pp06, pp07, pp08, pp09, pp10, pp11, pp12, pp13, pp14 } = receipt.rooms;

  assert.equal(pp01.insufficiency_established, true);
  assert.equal(pp01.result.e5_baseline.edge_evaluations[0].status, 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE');
  assert.equal(pp01.result.e5_baseline.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(pp01.result.admission_evaluations[0].status, 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION');
  assert.equal(pp01.result.e5_filtered.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(pp02.result.admission_evaluations[0].status, 'ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION');
  assert.equal(pp02.result.e5_filtered.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');

  assert.equal(pp03.result.admission_evaluations[0].status, 'REFUSE_MISSING_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(pp04.result.admission_evaluations[0].status, 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(pp05.result.admission_evaluations[0].status, 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS');

  assert.equal(pp06.result.admission_evaluations[0].status, 'REFUSE_DUPLICATE_DEPENDENCY_EDGE_ADMISSION_WITNESS_ID');
  assert.deepEqual(pp06.result.conflicted_witness_ids, ['DUP_BADGE']);
  assert.equal(pp06.result.witness_identifier_is_authority, false);

  assert.equal(pp07.current_state_equal, true);
  assert.equal(pp07.permit_status_equal, true);
  assert.equal(pp07.a.witness_identifier_is_authority, false);
  assert.equal(pp07.a.admission_identifier_is_authority, false);

  assert.equal(pp08.current_state_equal, true);
  assert.equal(pp08.witness_state_equal, true);
  assert.equal(pp08.reverse.serialization_order_is_authority, false);

  const pp09Real = pp09.result.admission_evaluations.find(item => item.admission_id === 'REAL_MIXED');
  const pp09Fake = pp09.result.admission_evaluations.find(item => item.admission_id === 'FAKE_MIXED');
  assert.equal(pp09Real?.status, 'ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION');
  assert.equal(pp09Fake?.status, 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION');
  assert.equal(pp09.result.e5_filtered.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');

  assert.equal(pp10.result.e5_baseline.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(pp10.result.admission_evaluations[0].status, 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS');
  assert.equal(pp10.result.e5_filtered.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(pp11.current_state_equal, true);
  assert.equal(pp11.many.witness_multiplicity_is_confidence, false);
  assert.equal(pp11.many.admission_evaluations[0].matching_witness_count, 2);

  assert.equal(pp12.claimed_witnessed, true);
  assert.equal(pp12.result.self_declared_witnessed_flag_is_authority, false);
  assert.equal(pp12.result.admission_evaluations[0].status, 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION');

  assert.equal(pp13.status, 'SEALED_DEPENDENCY_EDGE_ADMISSION_WITNESS_RECORD_IMMUTABLE');
  assert.equal(pp13.mutated, false);

  assert.equal(pp14.current_state_equal, true);
  assert.equal(pp14.e5.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(pp14.e6.e5_filtered.e4_result.warrant_results.W2.status, pp14.e5.e4_result.warrant_results.W2.status);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_PERMIT_PRINTER_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Permit Printer/i);
assert.match(spec, /E6_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY/);
assert.match(spec, /permit record present\s*!= permit issuance witnessed/i);
assert.match(spec, /materially correct permit\s*!= independent admission provenance/i);
assert.match(spec, /matching witness-ledger record\s*!= non-anticipating acquisition/i);
assert.match(spec, /witness acquisition provenance \/ pre-admission protocol custody/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-permit-printer-dependency-edge-admission-witness-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E6_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.parent_e5_receipt, 'aad36619a0e8720644754c5772fff0a5c092f8f6');
assert.equal(fixture.strong_falsifier.independent_matching_witness_present, false);
assert.equal(fixture.strong_falsifier.required_e5_edge_status, 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE');
assert.equal(fixture.strong_falsifier.required_e6_admission_status, 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION');
assert.equal(fixture.required_witness_kind, 'DEPENDENCY_EDGE_ADMISSION_OBSERVED');
assert.equal(fixture.self_declared_witnessed_flag_is_authority, false);
assert.equal(fixture.witness_multiplicity_is_confidence, false);
assert.equal(fixture.witness_acquisition_provenance, 'HELD_FOR_NEXT_ATTACK');
assert.equal(fixture.pre_admission_witness_protocol, 'HELD_FOR_NEXT_ATTACK');
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e5_verdict: receipt.inherited_e5_verdict,
  inherited_e5_admission_ledger_provenance_verdict: receipt.inherited_e5_admission_ledger_provenance_verdict,
  e6_verdict: receipt.candidate_verdict,
  e6_defeat_conditions: receipt.defeat_conditions,
  PP01_e5_edge: receipt.rooms.pp01.result.e5_baseline.edge_evaluations[0]?.status ?? null,
  PP01_e5_W2: receipt.rooms.pp01.result.e5_baseline.e4_result.warrant_results.W2?.status ?? null,
  PP01_e6_permit: receipt.rooms.pp01.result.admission_evaluations[0]?.status ?? null,
  PP01_e6_W2: receipt.rooms.pp01.result.e5_filtered.e4_result.warrant_results.W2?.status ?? null,
  PP02_status: receipt.rooms.pp02.result.admission_evaluations[0]?.status ?? null,
  PP03_status: receipt.rooms.pp03.result.admission_evaluations[0]?.status ?? null,
  PP04_status: receipt.rooms.pp04.result.admission_evaluations[0]?.status ?? null,
  PP05_status: receipt.rooms.pp05.result.admission_evaluations[0]?.status ?? null,
  PP06_conflicted_ids: receipt.rooms.pp06.result.conflicted_witness_ids,
  PP07_identifier_invariant: receipt.rooms.pp07.current_state_equal && receipt.rooms.pp07.permit_status_equal,
  PP08_order_invariant: receipt.rooms.pp08.current_state_equal && receipt.rooms.pp08.witness_state_equal,
  PP09_W2: receipt.rooms.pp09.result.e5_filtered.e4_result.warrant_results.W2?.status ?? null,
  PP10_status: receipt.rooms.pp10.result.admission_evaluations[0]?.status ?? null,
  PP11_multiplicity_is_confidence: receipt.rooms.pp11.many.witness_multiplicity_is_confidence,
  PP12_status: receipt.rooms.pp12.result.admission_evaluations[0]?.status ?? null,
  PP13_status: receipt.rooms.pp13.status,
  PP14_current_state_equal: receipt.rooms.pp14.current_state_equal,
  next_learning_action_if_survives: receipt.next_learning_action_if_survives,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
