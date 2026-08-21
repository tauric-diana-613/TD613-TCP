import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_PRECEDENCE_ADMISSION_GENEALOGY_SCHEMA,
  evaluatePrecedenceAdmissionGenealogy,
  sealEdgeAdmissionRecord,
  requestSealedEdgeAdmissionMutation,
  runPedagogueBlueprintMarginsGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-precedence-admission-genealogy-blueprint-margins.js';

const receipt = runPedagogueBlueprintMarginsGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_PRECEDENCE_ADMISSION_GENEALOGY_SCHEMA);
assert.equal(receipt.inherited_c5_relation_revision_result_preserved, true);
assert.ok([
  'WEAVE_REVISION_LEDGER_C5_FALSIFIED_AS_PRECEDENCE_ADMISSION_PROVENANCE_SUFFICIENT_FORM',
  'C5_PRECEDENCE_ADMISSION_PROVENANCE_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c5_admission_provenance_verdict));
assert.equal(receipt.candidate, 'C6_PRECEDENCE_ADMISSION_GENEALOGY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_SURVIVES_BOUNDED_BLUEPRINT_MARGINS',
  'PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_FALSIFIED_IN_BOUNDED_BLUEPRINT_MARGINS'
].includes(receipt.candidate_verdict));
assert.equal(receipt.promotion_authority, false);
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
  'bm01','bm02','bm03','bm04','bm05','bm06','bm07','bm08','bm09','bm10','bm11','bm12'
]);

if (receipt.candidate_verdict === 'PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_SURVIVES_BOUNDED_BLUEPRINT_MARGINS') {
  assert.equal(
    receipt.inherited_c5_admission_provenance_verdict,
    'WEAVE_REVISION_LEDGER_C5_FALSIFIED_AS_PRECEDENCE_ADMISSION_PROVENANCE_SUFFICIENT_FORM'
  );
  assert.deepEqual(receipt.defeat_conditions, []);

  const { bm01, bm02, bm03, bm04, bm05, bm06, bm07, bm08, bm09, bm10, bm11, bm12 } = receipt.rooms;

  assert.equal(bm01.semantic_relation_equal, true);
  assert.equal(bm01.current_weave_posture_equal, true);
  assert.equal(bm01.admission_genealogy_equal, false);

  assert.equal(bm02.result.relation_accepted, true);
  assert.equal(bm02.result.admitted_edges.length, 1);
  assert.equal(bm02.result.active_lawful_support_count, 2);
  assert.equal(bm02.result.edge_support_receipts[0].semantic_lineage_count, 2);

  const bm03First = bm03.timeline.episodes[0].result;
  const bm03Second = bm03.timeline.episodes[1].result;
  assert.equal(bm03First.active_lawful_support_count, 2);
  assert.equal(bm03Second.active_lawful_support_count, 1);
  assert.equal(bm03Second.admitted_edges.length, 1);
  assert.equal(bm03First.semantic_relation_fingerprint, bm03Second.semantic_relation_fingerprint);
  assert.notEqual(bm03First.semantic_admission_genealogy_fingerprint, bm03Second.semantic_admission_genealogy_fingerprint);
  assert.equal(bm03.timeline.historical_support_genealogy_preserved, true);
  assert.equal(bm03.timeline.latest_relation_only_history_authority, false);

  assert.equal(bm04.timeline.current.active_lawful_support_count, 0);
  assert.equal(bm04.timeline.current.admitted_edges.length, 0);

  assert.equal(bm05.result.admitted_edges.length, 0);
  assert.ok(bm05.result.rejected_supports.some(item => item.status === 'REFUSE_UNWITNESSED_EDGE_ADMISSION'));

  assert.equal(bm06.semantic_relation_invariant, true);
  assert.equal(bm06.semantic_genealogy_invariant, true);
  assert.equal(bm06.weave_posture_invariant, true);

  assert.equal(bm07.result.admitted_edges.length, 1);
  assert.equal(bm07.result.active_lawful_support_count, 1);
  assert.ok(bm07.result.rejected_supports.some(item => item.admission_id === 'AAA_INVALID'));
  assert.ok(bm07.result.lawful_active_supports.some(item => item.admission_id === 'ZZZ_VALID'));
  assert.equal(bm07.result.support_identifier_authority, false);
  assert.equal(bm07.result.support_serialization_authority, false);

  assert.equal(bm08.result.relation_accepted, false);
  assert.equal(bm08.result.weave.status, 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE');
  assert.equal(bm08.result.active_lawful_support_count, 2);
  assert.equal(bm08.result.admitted_edges.length, 2);

  assert.equal(bm09.mutation.status, 'SEALED_EDGE_ADMISSION_RECORD_IMMUTABLE');
  assert.equal(bm09.mutation.mutated, false);
  assert.equal(bm09.sealed_edge_unchanged, true);

  assert.equal(bm10.semantic_relation_equal, true);
  assert.equal(bm10.weave_posture_equal, true);
  assert.equal(bm10.relation_only_admission_genealogy_authority, false);

  assert.equal(bm11.semantic_admission_lineage_changed, false);
  assert.equal(bm11.record_custody_changed, true);

  assert.equal(bm12.one_remaining.current.admitted_edges.length, 1);
  assert.equal(bm12.none_remaining.current.admitted_edges.length, 0);
  assert.equal(bm12.none_remaining.current.inactive_historical_support_count, 1);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const sealed = sealEdgeAdmissionRecord({
  admission_id: 'DIRECT_SEAL',
  edge: ['A','B'],
  semantic_support_kind: 'DIRECT',
  predeclared: true,
  admissible: true,
  witnessed: false,
  witness_payload: null,
  active: true
});
assert.equal(Object.isFrozen(sealed), true);
assert.equal(Object.isFrozen(sealed.edge), true);
const mutation = requestSealedEdgeAdmissionMutation(sealed, { edge: ['B','A'] });
assert.equal(mutation.status, 'SEALED_EDGE_ADMISSION_RECORD_IMMUTABLE');
assert.equal(mutation.mutated, false);

assert.throws(() => evaluatePrecedenceAdmissionGenealogy(), /base_specimen required/);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_BLUEPRINT_MARGINS_PRECEDENCE_ADMISSION_GENEALOGY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Blueprint Margins/i);
assert.match(spec, /C6_PRECEDENCE_ADMISSION_GENEALOGY/);
assert.match(spec, /same admitted semantic relation != same admission provenance/i);
assert.match(spec, /edge persistence != support-genealogy persistence/i);
assert.match(spec, /declared witnessed != witnessed relation/i);
assert.match(spec, /REFUSE_UNWITNESSED_EDGE_ADMISSION/);
assert.match(spec, /SEALED_EDGE_ADMISSION_RECORD_IMMUTABLE/);
assert.match(spec, /WEAVE_REVISION_LEDGER_C5_FALSIFIED_AS_PRECEDENCE_ADMISSION_PROVENANCE_SUFFICIENT_FORM/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-blueprint-margins-precedence-admission-genealogy-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.status, 'PREREGISTERED_PRE_EXECUTION');
assert.equal(fixture.inherited_candidate.id, 'C5_WEAVE_REVISION_LEDGER');
assert.equal(fixture.inherited_candidate.relation_revision_jurisdiction_preserved, true);
assert.equal(fixture.candidate.id, 'C6_PRECEDENCE_ADMISSION_GENEALOGY');
assert.equal(fixture.candidate.promotion_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(fixture.candidate.presumption_of_survival, false);
assert.equal(fixture.frozen_scope.event_set_fixed, true);
assert.equal(fixture.frozen_scope.only_edge_admission_support_posture_varies, true);
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
  inherited_c5_admission_provenance_verdict: receipt.inherited_c5_admission_provenance_verdict,
  c6_verdict: receipt.candidate_verdict,
  c6_defeat_conditions: receipt.defeat_conditions,
  BM01_semantic_relation_equal: receipt.rooms.bm01.semantic_relation_equal,
  BM01_admission_genealogy_equal: receipt.rooms.bm01.admission_genealogy_equal,
  BM03_support_count_trace: receipt.rooms.bm03.timeline.support_count_trace,
  BM04_current_edge_count: receipt.rooms.bm04.timeline.current.admitted_edges.length,
  BM05_rejected_statuses: receipt.rooms.bm05.result.rejected_supports.map(item => item.status),
  BM08_relation_status: receipt.rooms.bm08.result.weave.status,
  BM09_mutation_status: receipt.rooms.bm09.mutation.status,
  BM11_semantic_lineage_changed: receipt.rooms.bm11.semantic_admission_lineage_changed,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
