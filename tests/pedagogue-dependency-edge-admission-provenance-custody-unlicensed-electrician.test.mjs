import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_SCHEMA,
  evaluateDependencyEdgeAdmissionProvenanceCustody,
  makeSyntheticDependencyEdgeAdmissionRecord,
  makeSyntheticDependencyEdgeCandidate,
  materialDependencyEdgeFingerprint,
  runPedagogueUnlicensedElectricianGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-dependency-edge-admission-provenance-custody-unlicensed-electrician.js';

const receipt = runPedagogueUnlicensedElectricianGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_e4_verdict,
  'TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RELAY_LANTERN');
assert.ok([
  'E4_DECLARED_DEPENDENCY_EDGE_ADMISSION_INSUFFICIENCY_ESTABLISHED',
  'E4_DECLARED_DEPENDENCY_EDGE_ADMISSION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_e4_declared_edge_admission_verdict));
assert.equal(receipt.inherited_e4_propagation_semantics_preserved, true);
assert.equal(receipt.candidate, 'E5_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_UNLICENSED_ELECTRICIAN',
  'DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_UNLICENSED_ELECTRICIAN'
].includes(receipt.candidate_verdict));
assert.equal(receipt.synthetic_exogenous_fixture, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.real_world_external_provenance_claim, false);
assert.equal(receipt.real_world_authorization_claim, false);
assert.equal(receipt.admission_ledger_provenance, 'HELD_FOR_NEXT_ATTACK');
assert.equal(receipt.universal_graph_semantics, false);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.promotion_authority, false);
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'ue01','ue02','ue03','ue04','ue05','ue06','ue07','ue08','ue09','ue10','ue11','ue12','ue13'
]);

if (receipt.candidate_verdict === 'DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_UNLICENSED_ELECTRICIAN') {
  assert.deepEqual(receipt.defeat_conditions, []);
  assert.equal(receipt.inherited_e4_declared_edge_admission_verdict,
    'E4_DECLARED_DEPENDENCY_EDGE_ADMISSION_INSUFFICIENCY_ESTABLISHED');
  const { ue01, ue02, ue03, ue04, ue05, ue06, ue07, ue08, ue09, ue10, ue11, ue12, ue13 } = receipt.rooms;

  assert.equal(ue01.e4.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(ue01.e5.edge_evaluations[0].status, 'REFUSE_UNADMITTED_DEPENDENCY_EDGE');
  assert.equal(ue01.e5.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(ue01.e4_declared_edge_insufficiency_established, true);

  assert.equal(ue02.result.edge_evaluations[0].status, 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE');
  assert.equal(ue02.result.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');

  assert.notEqual(ue03.original_material_fingerprint, ue03.replacement_material_fingerprint);
  assert.equal(ue03.e4.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(ue03.e5.edge_evaluations[0].status, 'REFUSE_STALE_DEPENDENCY_EDGE_ADMISSION_BINDING');
  assert.equal(ue03.e5.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ue04.material_fingerprint_equal, true);
  assert.equal(ue04.current_state_equal, true);
  assert.equal(ue04.a.edge_evaluations[0].status, 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE');
  assert.equal(ue04.b.edge_evaluations[0].status, 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE');
  assert.equal(ue04.a.edge_identifier_is_authority, false);
  assert.equal(ue04.a.admission_identifier_is_authority, false);

  assert.equal(ue05.current_state_equal, true);
  assert.equal(ue05.admission_state_equal, true);
  assert.equal(ue05.reverse.serialization_order_is_authority, false);

  assert.equal(ue06.current_state_equal, true);
  assert.equal(ue06.one.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(ue06.duplicate.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(ue06.duplicate.admission_multiplicity_is_confidence, false);
  assert.equal(ue06.one.edge_evaluations[0].matching_admission_count, 1);
  assert.equal(ue06.duplicate.edge_evaluations[0].matching_admission_count, 2);

  assert.equal(ue07.result.edge_evaluations[0].status, 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION');
  assert.equal(ue07.result.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ue08.result.edge_evaluations[0].status, 'REFUSE_STALE_DEPENDENCY_EDGE_ADMISSION_BINDING');
  assert.equal(ue08.result.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ue09.result.edge_evaluations[0].status, 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE');
  assert.equal(ue09.result.edge_evaluations[1].status, 'REFUSE_UNADMITTED_DEPENDENCY_EDGE');
  assert.equal(ue09.result.e4_result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');

  assert.equal(ue10.result.endpoint_status_snapshots_observed, true);
  assert.equal(ue10.result.endpoint_status_snapshots_have_edge_admission_authority, false);
  assert.equal(ue10.result.edge_evaluations[0].status, 'REFUSE_UNADMITTED_DEPENDENCY_EDGE');
  assert.equal(ue10.result.e4_result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(ue11.result.edge_evaluations[0].status, 'REFUSE_DUPLICATE_DEPENDENCY_EDGE_ADMISSION_ID');
  assert.deepEqual(ue11.result.conflicted_admission_ids, ['DUPLICATE']);
  assert.equal(ue11.result.admission_identifier_is_authority, false);

  assert.equal(ue12.status, 'SEALED_DEPENDENCY_EDGE_ADMISSION_RECORD_IMMUTABLE');
  assert.equal(ue12.mutated, false);

  assert.equal(ue13.e4.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(ue13.e5.e4_result.warrant_results.W2.status, ue13.e4.warrant_results.W2.status);
  assert.equal(ue13.propagation_equal, true);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const materialA = makeSyntheticDependencyEdgeCandidate({
  edge_id: 'A', from_warrant_key: 'W1', to_warrant_key: 'W2', active: true,
  dependency_kind: 'WARRANT_SUPPORT_DEPENDENCY', scope_fingerprint: 'SCOPE:ALPHA'
});
const materialB = makeSyntheticDependencyEdgeCandidate({
  edge_id: 'B', from_warrant_key: 'W1', to_warrant_key: 'W2', active: false,
  dependency_kind: 'WARRANT_SUPPORT_DEPENDENCY', scope_fingerprint: 'SCOPE:ALPHA'
});
assert.equal(materialDependencyEdgeFingerprint(materialA), materialDependencyEdgeFingerprint(materialB));

const orphan = evaluateDependencyEdgeAdmissionProvenanceCustody({
  warrants: [{ warrant_key: 'W1' }, { warrant_key: 'W2' }],
  dependency_edges: [makeSyntheticDependencyEdgeCandidate({
    edge_id: 'ORPHAN', from_warrant_key: 'W1', to_warrant_key: 'W2', admission_record_ids: ['MISSING']
  })],
  admission_ledger: [makeSyntheticDependencyEdgeAdmissionRecord({
    admission_id: 'OTHER', material_edge_fingerprint: materialDependencyEdgeFingerprint(materialA)
  })]
});
assert.equal(orphan.edge_evaluations[0].status, 'REFUSE_UNADMITTED_DEPENDENCY_EDGE');

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_UNLICENSED_ELECTRICIAN_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Unlicensed Electrician/i);
assert.match(spec, /E5_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY/);
assert.match(spec, /declared dependency edge\s*!= admitted dependency authority/i);
assert.match(spec, /edge identifier continuity\s*!= semantic authorization continuity/i);
assert.match(spec, /admission ledger's own provenance \/ bootstrap authority/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-unlicensed-electrician-dependency-edge-admission-provenance-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E5_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.strong_falsifiers.unlicensed_wire.edge_admission_record_present, false);
assert.equal(fixture.strong_falsifiers.unlicensed_wire.required_e5_edge_status, 'REFUSE_UNADMITTED_DEPENDENCY_EDGE');
assert.equal(fixture.strong_falsifiers.stale_semantic_replacement.edge_id_preserved, true);
assert.equal(fixture.strong_falsifiers.stale_semantic_replacement.endpoints_preserved, true);
assert.equal(fixture.edge_active_state_is_semantic_identity, false);
assert.equal(fixture.required_admission_kind, 'DEPENDENCY_EDGE_ADMISSION');
assert.equal(fixture.admission_ledger_provenance, 'HELD_FOR_NEXT_ATTACK');
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e4_verdict: receipt.inherited_e4_verdict,
  inherited_e4_declared_edge_admission_verdict: receipt.inherited_e4_declared_edge_admission_verdict,
  e5_verdict: receipt.candidate_verdict,
  e5_defeat_conditions: receipt.defeat_conditions,
  UE01_e4_W2: receipt.rooms.ue01.e4.warrant_results.W2.status,
  UE01_e5_edge: receipt.rooms.ue01.e5.edge_evaluations[0].status,
  UE01_e5_W2: receipt.rooms.ue01.e5.e4_result.warrant_results.W2.status,
  UE03_e4_W2: receipt.rooms.ue03.e4.warrant_results.W2.status,
  UE03_e5_edge: receipt.rooms.ue03.e5.edge_evaluations[0].status,
  UE04_identifier_invariant: receipt.rooms.ue04.current_state_equal,
  UE05_order_invariant: receipt.rooms.ue05.current_state_equal && receipt.rooms.ue05.admission_state_equal,
  UE06_duplicate_confidence: receipt.rooms.ue06.duplicate.admission_multiplicity_is_confidence,
  UE07_status: receipt.rooms.ue07.result.edge_evaluations[0].status,
  UE08_status: receipt.rooms.ue08.result.edge_evaluations[0].status,
  UE09_W2: receipt.rooms.ue09.result.e4_result.warrant_results.W2.status,
  UE10_snapshot_authority: receipt.rooms.ue10.result.endpoint_status_snapshots_have_edge_admission_authority,
  UE11_conflicted_ids: receipt.rooms.ue11.result.conflicted_admission_ids,
  UE12_status: receipt.rooms.ue12.status,
  UE13_propagation_equal: receipt.rooms.ue13.propagation_equal,
  next_learning_action_if_survives: receipt.next_learning_action_if_survives,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
