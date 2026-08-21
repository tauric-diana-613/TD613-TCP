import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_ADMISSION_WITNESS_REPLAY_CUSTODY_SCHEMA,
  evaluateAdmissionWitnessReplayCustody,
  sealAdmissionWitnessProvenance,
  requestSealedAdmissionWitnessProvenanceMutation,
  runPedagogueCarbonPaperGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-admission-witness-replay-custody-carbon-paper.js';

const receipt = runPedagogueCarbonPaperGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_ADMISSION_WITNESS_REPLAY_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c6_edge_admission_genealogy_result_preserved, true);
assert.ok([
  'PRECEDENCE_ADMISSION_GENEALOGY_C6_FALSIFIED_AS_WITNESS_PROVENANCE_SUFFICIENT_FORM',
  'C6_WITNESS_PROVENANCE_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c6_witness_provenance_verdict));
assert.equal(receipt.candidate, 'C7_ADMISSION_WITNESS_REPLAY_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'ADMISSION_WITNESS_REPLAY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CARBON_PAPER',
  'ADMISSION_WITNESS_REPLAY_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CARBON_PAPER'
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
  'cp01','cp02','cp03','cp04','cp05','cp06','cp07','cp08','cp09','cp10','cp11','cp12'
]);

if (receipt.candidate_verdict === 'ADMISSION_WITNESS_REPLAY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CARBON_PAPER') {
  assert.equal(
    receipt.inherited_c6_witness_provenance_verdict,
    'PRECEDENCE_ADMISSION_GENEALOGY_C6_FALSIFIED_AS_WITNESS_PROVENANCE_SUFFICIENT_FORM'
  );
  assert.deepEqual(receipt.defeat_conditions, []);

  const { cp01, cp02, cp03, cp04, cp05, cp06, cp07, cp08, cp09, cp10, cp11, cp12 } = receipt.rooms;

  assert.equal(cp01.visible_witness_payload_equal, true);
  assert.equal(cp01.c6_accepts_both_payloads, true);
  assert.equal(cp01.c7_genuine_lawful, true);
  assert.equal(cp01.c7_copy_rejected, true);
  assert.equal(cp01.c6.active_lawful_support_count, 2);
  assert.equal(cp01.c7.active_lawful_witness_support_count, 1);
  assert.ok(cp01.c7.rejected_witness_supports.some(item =>
    item.admission_id === 'CARBON_COPY' && item.status === 'REFUSE_UNREPLAYED_EDGE_ADMISSION_WITNESS'
  ));

  assert.ok(cp02.result.rejected_witness_supports.some(item =>
    item.status === 'REFUSE_UNREPLAYED_EDGE_ADMISSION_WITNESS'
  ));
  assert.ok(cp03.result.rejected_witness_supports.some(item =>
    item.status === 'REFUSE_WITNESS_REPLAY_MISMATCH'
  ));

  assert.equal(cp04.result.admitted_edges.length, 1);
  assert.equal(cp04.result.active_lawful_witness_support_count, 2);
  assert.equal(cp04.result.edge_witness_receipts[0].semantic_witness_lineage_count, 2);

  assert.equal(cp05.edge_persists, true);
  assert.equal(cp05.relation_equal, true);
  assert.equal(cp05.witness_genealogy_changed, true);

  assert.equal(cp06.result.admitted_edges.length, 0);
  assert.equal(cp06.result.active_lawful_witness_support_count, 0);

  assert.equal(cp07.semantic_witness_genealogy_invariant, true);
  assert.equal(cp07.relation_invariant, true);
  assert.equal(cp08.semantic_witness_genealogy_changed, true);
  assert.equal(cp08.relation_equal, true);

  assert.equal(cp09.result.admitted_edges.length, 1);
  assert.equal(cp09.result.active_lawful_witness_support_count, 1);
  assert.ok(cp09.result.rejected_witness_supports.some(item => item.admission_id === 'AAA_BAD'));
  assert.ok(cp09.result.lawful_active_witness_supports.some(item => item.admission_id === 'ZZZ_GOOD'));

  assert.equal(cp10.result.relation.relation_accepted, false);
  assert.equal(cp10.result.relation.weave.status, 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE');
  assert.equal(cp10.result.active_lawful_witness_support_count, 2);

  assert.equal(cp11.visible_payload_equal, true);
  assert.equal(cp11.relation_equal, true);
  assert.equal(cp11.payload_only_provenance_authority, false);

  assert.equal(cp12.mutation.status, 'SEALED_ADMISSION_WITNESS_PROVENANCE_IMMUTABLE');
  assert.equal(cp12.mutation.mutated, false);
  assert.equal(cp12.sealed_still_frozen, true);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const sealed = sealAdmissionWitnessProvenance({
  evidence: [{ evidence_id: 'DIRECT', warrants: ['SOURCE:DIRECT'] }],
  rules: []
});
assert.equal(Object.isFrozen(sealed), true);
assert.equal(Object.isFrozen(sealed.evidence), true);
const mutation = requestSealedAdmissionWitnessProvenanceMutation(sealed, { evidence: [], rules: [] });
assert.equal(mutation.status, 'SEALED_ADMISSION_WITNESS_PROVENANCE_IMMUTABLE');
assert.equal(mutation.mutated, false);

const empty = evaluateAdmissionWitnessReplayCustody({ admission_records: [] });
assert.equal(empty.candidate, 'C7_ADMISSION_WITNESS_REPLAY_CUSTODY');
assert.equal(empty.active_lawful_witness_support_count, 0);
assert.equal(empty.promotion_authority, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_CARBON_PAPER_ADMISSION_WITNESS_REPLAY_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Carbon Paper/i);
assert.match(spec, /C7_ADMISSION_WITNESS_REPLAY_CUSTODY/);
assert.match(spec, /matching edge-admission witness payload is not itself provenance/i);
assert.match(spec, /REFUSE_UNREPLAYED_EDGE_ADMISSION_WITNESS/);
assert.match(spec, /REFUSE_WITNESS_REPLAY_MISMATCH/);
assert.match(spec, /SEALED_ADMISSION_WITNESS_PROVENANCE_IMMUTABLE/);
assert.match(spec, /PRECEDENCE_ADMISSION_GENEALOGY_C6_FALSIFIED_AS_WITNESS_PROVENANCE_SUFFICIENT_FORM/);
assert.match(spec, /event-set revision remains closed/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-carbon-paper-admission-witness-replay-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.status, 'PREREGISTERED_PRE_EXECUTION');
assert.equal(fixture.inherited_candidate.id, 'C6_PRECEDENCE_ADMISSION_GENEALOGY');
assert.equal(fixture.inherited_candidate.edge_admission_genealogy_jurisdiction_preserved, true);
assert.equal(fixture.candidate.id, 'C7_ADMISSION_WITNESS_REPLAY_CUSTODY');
assert.equal(fixture.candidate.promotion_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(fixture.candidate.presumption_of_survival, false);
assert.equal(fixture.frozen_scope.event_set_fixed, true);
assert.equal(fixture.frozen_scope.event_set_revision_opened, false);
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
  inherited_c6_witness_provenance_verdict: receipt.inherited_c6_witness_provenance_verdict,
  c7_verdict: receipt.candidate_verdict,
  c7_defeat_conditions: receipt.defeat_conditions,
  CP01_visible_payload_equal: receipt.rooms.cp01.visible_witness_payload_equal,
  CP01_c6_accepts_both: receipt.rooms.cp01.c6_accepts_both_payloads,
  CP01_c7_copy_rejected: receipt.rooms.cp01.c7_copy_rejected,
  CP04_witness_lineage_count: receipt.rooms.cp04.result.edge_witness_receipts[0]?.semantic_witness_lineage_count ?? null,
  CP05_edge_persists: receipt.rooms.cp05.edge_persists,
  CP06_current_edge_count: receipt.rooms.cp06.result.admitted_edges.length,
  CP10_relation_status: receipt.rooms.cp10.result.relation.weave.status,
  CP12_mutation_status: receipt.rooms.cp12.mutation.status,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
