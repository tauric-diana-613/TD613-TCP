import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_SCHEMA,
  evaluateTransitiveWarrantDependencyCustody,
  makeSyntheticWarrantDependencyEdge,
  runPedagogueRelayLanternGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-transitive-warrant-dependency-custody-relay-lantern.js';

const receipt = runPedagogueRelayLanternGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_e3_verdict,
  'ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_BORROWED_LIGHT');
assert.equal(receipt.inherited_e3_direct_semantics_preserved, true);
assert.equal(receipt.candidate, 'E4_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RELAY_LANTERN',
  'TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_RELAY_LANTERN'
].includes(receipt.candidate_verdict));
assert.equal(receipt.synthetic_exogenous_fixture, true);
assert.equal(receipt.live_external_source_adapter, false);
assert.equal(receipt.real_world_external_provenance_claim, false);
assert.equal(receipt.semantic_replacement_bridge_law, 'HELD_NOT_OPENED_HERE');
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
  'rl01','rl02','rl03','rl04','rl05','rl06','rl07','rl08','rl09','rl10','rl11','rl12'
]);

if (receipt.candidate_verdict === 'TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RELAY_LANTERN') {
  assert.deepEqual(receipt.defeat_conditions, []);
  const { rl01, rl02, rl03, rl04, rl05, rl06, rl07, rl08, rl09, rl10, rl11, rl12 } = receipt.rooms;

  assert.equal(rl01.before.warrant_results.W1.status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.equal(rl01.before.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');
  assert.equal(rl01.after.warrant_results.W1.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(rl01.after.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(rl01.historical_path_preserved, true);
  assert.ok(rl01.after.historical_reachable_warrant_keys.includes('W1'));
  assert.ok(rl01.after.historical_reachable_warrant_keys.includes('W2'));

  assert.equal(rl02.result.cycle_present, true);
  assert.equal(rl02.result.cycle_bootstrap_used, false);
  assert.equal(rl02.cycle_does_not_self_sustain, true);
  assert.equal(rl02.result.warrant_results.W1.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(rl02.result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');

  assert.equal(rl03.result.cycle_present, true);
  assert.equal(rl03.result.warrant_results.W1.status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.equal(rl03.result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT');

  assert.equal(rl04.result.warrant_results.W1.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(rl04.result.warrant_results.W2.status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.equal(rl04.result.warrant_results.W2.authority_origin, 'DIRECT_E3');

  assert.equal(rl05.result.warrant_results.W1.status, 'ABSTAIN_WARRANT_SUPPORT_CONFLICT');
  assert.equal(rl05.result.warrant_results.W2.status, 'ABSTAIN_TRANSITIVE_WARRANT_SUPPORT_CONFLICT');
  assert.equal(rl05.result.warrant_results.W2.current_reachable_from_lawful_foundation, false);

  assert.equal(rl06.result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(rl06.result.rejected_edges[0].status, 'REFUSE_TRANSITIVE_WARRANT_DEPENDENCY_UNKNOWN_SOURCE');
  assert.equal(rl06.result.endpoint_status_snapshots_observed, true);
  assert.equal(rl06.result.endpoint_status_snapshots_have_transitive_authority, false);

  assert.equal(rl07.authority_equal, true);
  assert.equal(rl07.graph_fingerprint_equal, true);
  assert.equal(rl07.duplicate.semantic_edge_count, 1);
  assert.equal(rl07.duplicate.duplicate_edge_count, 1);
  assert.equal(rl07.duplicate.duplicate_edge_is_confidence, false);

  assert.equal(rl08.authority_equal, true);
  assert.equal(rl08.graph_fingerprint_equal, true);
  assert.equal(rl08.shuffled.edge_identifier_is_authority, false);
  assert.equal(rl08.shuffled.serialization_order_is_authority, false);

  assert.equal(rl09.historical_transitive_path_preserved, true);
  assert.equal(rl09.result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(rl09.result.warrant_results.W2.historical_reachable_from_lawful_foundation, true);

  assert.equal(rl10.result.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
  assert.equal(rl10.result.endpoint_status_snapshots_observed, true);
  assert.equal(rl10.result.endpoint_status_snapshots_have_transitive_authority, false);

  assert.equal(rl11.status, 'SEALED_TRANSITIVE_WARRANT_DEPENDENCY_GRAPH_IMMUTABLE');
  assert.equal(rl11.mutated, false);

  assert.equal(rl12.direct_status, 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT');
  assert.equal(rl12.e4_status, rl12.direct_status);
  assert.equal(rl12.result.warrant_results.W1.authority_origin, 'DIRECT_E3');
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const malformed = evaluateTransitiveWarrantDependencyCustody({
  warrants: [{ warrant_key: 'W2' }],
  dependency_edges: [makeSyntheticWarrantDependencyEdge({
    edge_id: 'BAD',
    from_warrant_key: 'W9',
    to_warrant_key: 'W2',
    active: true
  })]
});
assert.equal(malformed.warrant_results.W2.status, 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT');
assert.equal(malformed.rejected_edges[0].status, 'REFUSE_TRANSITIVE_WARRANT_DEPENDENCY_UNKNOWN_SOURCE');

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_RELAY_LANTERN_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Relay Lantern/i);
assert.match(spec, /E4_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY/);
assert.match(spec, /E3 direct dependency custody != E4 transitive dependency custody/);
assert.match(spec, /closed warrant cycle with no current lawful foundation must not bootstrap itself into authority/i);
assert.match(spec, /historical evidence that W2 was once reachable through W1 remains reconstructable/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-relay-lantern-transitive-warrant-dependency-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E4_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.inherited_e3_direct_semantics_preserved, true);
assert.equal(fixture.transitive_dependency_scope_only, true);
assert.equal(fixture.strong_falsifiers.chain_revocation.foundation_withdrawn, true);
assert.equal(fixture.strong_falsifiers.chain_revocation.historical_path_must_remain, true);
assert.equal(fixture.strong_falsifiers.unsupported_cycle.current_lawful_foundation, false);
assert.equal(fixture.strong_falsifiers.unsupported_cycle.cycle_must_not_self_sustain, true);
assert.equal(fixture.edge_identifier_is_authority, false);
assert.equal(fixture.duplicate_edge_is_confidence, false);
assert.equal(fixture.serialization_order_is_authority, false);
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e3_verdict: receipt.inherited_e3_verdict,
  e4_verdict: receipt.candidate_verdict,
  e4_defeat_conditions: receipt.defeat_conditions,
  RL01_before_W2: receipt.rooms.rl01.before.warrant_results.W2.status,
  RL01_after_W2: receipt.rooms.rl01.after.warrant_results.W2.status,
  RL01_historical_path_preserved: receipt.rooms.rl01.historical_path_preserved,
  RL02_cycle_present: receipt.rooms.rl02.result.cycle_present,
  RL02_cycle_does_not_self_sustain: receipt.rooms.rl02.cycle_does_not_self_sustain,
  RL03_W2: receipt.rooms.rl03.result.warrant_results.W2.status,
  RL04_W2: receipt.rooms.rl04.result.warrant_results.W2.status,
  RL05_W2: receipt.rooms.rl05.result.warrant_results.W2.status,
  RL06_rejection: receipt.rooms.rl06.result.rejected_edges[0]?.status ?? null,
  RL07_graph_fingerprint_equal: receipt.rooms.rl07.graph_fingerprint_equal,
  RL08_authority_equal: receipt.rooms.rl08.authority_equal,
  RL09_historical_transitive_path_preserved: receipt.rooms.rl09.historical_transitive_path_preserved,
  RL10_snapshot_authority: receipt.rooms.rl10.result.endpoint_status_snapshots_have_transitive_authority,
  RL11_status: receipt.rooms.rl11.status,
  RL12_direct_preserved: receipt.rooms.rl12.e4_status === receipt.rooms.rl12.direct_status,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
