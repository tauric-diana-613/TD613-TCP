import assert from 'node:assert/strict';
import fs from 'node:fs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-wendbine-td613-bounded-assay-v01.json';
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));

assert.equal(receipt.schema, 'wendbine-td613-bounded-assay/v0.1');
assert.equal(receipt.state, 'ADJUDICATED_WITH_HELD_CONTROLS');
assert.equal(receipt.source_freeze.snapshot_id, 'wendbine-public-reddit-48h-20260911T092700Z-v01');
assert.equal(receipt.source_freeze.pre_assay_corpus_commit, '80e3c7bad4832a3e67b2865987b82382e8bb6aac');
assert.equal(receipt.source_freeze.source_registry_git_blob, '4cc9feff9c9478eb9ae3e9ae3a4093dcda1806ce');
assert.equal(receipt.source_freeze.typed_relation_registry_git_blob, '849abbcf1b26b5f362820e8acd1acba5f0528346');
assert.equal(receipt.source_freeze.held_out_protocol_git_blob, '4ba1be413c75362c2eb9a1f468b3e51035b1a476');
assert.equal(receipt.source_freeze.independent_nomenclature_control_head, '855eaddf951396a21884bb0d6dad8228d86b0d62');

for (const [field, expected] of Object.entries({
  public_bounded_corpus_only: true,
  private_material_admitted: false,
  historical_wendbine_expansion: false,
  omega_cycling: false,
  automatic_donor_authority: false,
  automatic_novelty_promotion: false,
  merge: false,
  deployment: false,
  vercel: false,
  human_closure_required: true
})) {
  assert.equal(receipt.authority[field], expected, `assay authority mismatch: ${field}`);
}

for (const law of [
  'CONVENTIONAL_NOMENCLATURE != DONOR_PROVENANCE',
  'TERM_PROVENANCE != CONSTRUCT_NOVELTY',
  'SAME_TOKEN != SAME_OPERATOR',
  'PUBLIC_TOPOLOGY != PRIVATE_STATE',
  'SERIALIZED_CONTINUITY != SHARED_HIDDEN_MEMORY',
  'ROLE_RECONSTRUCTABILITY != ENTITY_BINDING',
  'STRUCTURAL_PREDICTABILITY != DONOR_AUTHORSHIP',
  'NEGATIVE_RESULT != FAILED_ASSAY'
]) {
  assert.ok(receipt.laws.includes(law), `assay dropped membrane: ${law}`);
}

const heldOut = receipt.held_out_reconstruction;
assert.equal(heldOut.targets.length, 5, 'v0.1 must adjudicate the five preregistered target classes');
assert.equal(heldOut.full_success_ceiling_earned, false, 'missing controls may not be laundered into full preregistered success');
assert.equal(heldOut.controls.C4_unrelated_technical_post_decoy.state, 'NOT_BOUND_NOT_EXECUTED');
assert.equal(heldOut.controls.C1_shuffled_source_order.result, 'ORDER_EFFECT_NOT_IDENTIFIED');
assert.ok(heldOut.not_earned.includes('PRIVATE_STATE_RECONSTRUCTED'));
assert.ok(heldOut.not_earned.includes('HIDDEN_MEMORY_PROVED'));
assert.ok(heldOut.not_earned.includes('TD613_SIGNALING_PROVED'));

const echoTarget = heldOut.targets.find(target => target.source_id === 'reddit:t3_1wd7mjl');
assert.ok(echoTarget, 'EchoCore correction must remain a held-out target');
assert.equal(echoTarget.immediate_neighbors, 'NOT_RECONSTRUCTED');
assert.equal(echoTarget.role, 'CORRECTION_NOT_RECONSTRUCTED');
assert.equal(echoTarget.adjudication, 'NEGATIVE_CONTROL_LIKE_RESULT');

const allowedOutcomes = new Set(['BETTER_NAME', 'BETTER_OPERATOR', 'BOTH', 'NEITHER', 'REJECTED']);
assert.equal(receipt.crosswalk.length, 14, 'bounded crosswalk row count changed without a version bump');
const ids = new Set();
for (const row of receipt.crosswalk) {
  assert.equal(ids.has(row.id), false, `duplicate crosswalk row: ${row.id}`);
  ids.add(row.id);
  assert.ok(Array.isArray(row.wendbine_source_refs) && row.wendbine_source_refs.length > 0, `${row.id} must remain source-bound`);
  assert.ok(row.wendbine_source_refs.every(ref => ref.startsWith('reddit:t3_')), `${row.id} contains a non-public-source reference`);
  assert.ok(Array.isArray(row.ordinary_terms) && row.ordinary_terms.length > 0, `${row.id} requires ordinary nomenclature`);
  assert.ok(Array.isArray(row.disciplinary_homes) && row.disciplinary_homes.length > 0, `${row.id} requires a disciplinary home`);
  assert.ok(allowedOutcomes.has(row.outcome), `${row.id} uses unknown outcome ${row.outcome}`);
  assert.equal(typeof row.mismatch_or_residual, 'string');
  assert.ok(row.mismatch_or_residual.trim().length > 0, `${row.id} requires an explicit mismatch/residual`);
}

const dependencyControl = receipt.crosswalk.find(row => row.id === 'dependency_graph_false_donor_control');
assert.equal(dependencyControl.lineage, 'PREEXISTING_TD613');
assert.equal(dependencyControl.outcome, 'NEITHER');

for (const row of receipt.crosswalk.filter(row => ['information_flow_control', 'partial_observability_state_estimation', 'source_path_provenance', 'typed_trust_revocation', 'authoritative_replicated_state', 'data_control_plane_boundary', 'system_observation_boundary', 'multiplex_identity_topology', 'causal_reconstruction_attribution', 'operational_digital_twin', 'robustness_recovery'].includes(row.id))) {
  assert.notEqual(row.lineage, 'DONOR_SPECIFIC', `${row.id} may not turn conventional vocabulary into donor provenance`);
}

assert.deepEqual(receipt.crosswalk_summary, {
  BETTER_NAME: 4,
  BETTER_OPERATOR: 1,
  BOTH: 6,
  NEITHER: 2,
  REJECTED: 1,
  answer: 'BOTH_NAME_HEAVY',
  interpretation: "The bounded donor packet mostly improves conventional naming and several local operator boundaries. It does not supply TD613's central formal or authority semantics."
});

assert.ok(receipt.td613_residuals_after_crosswalk.length >= 7, 'assay must preserve the held residual ledger');
for (const residual of receipt.td613_residuals_after_crosswalk) {
  assert.notEqual(residual.status, 'RESIDUAL_NOVELTY_CANDIDATE', `${residual.construct} was promoted without a separate literature audit`);
}

assert.equal(receipt.foreign_donor_chamber.full_C00_C01_C10_C11_completed, false);
assert.equal(receipt.foreign_donor_chamber.state, 'HELD');
assert.equal(receipt.final_adjudication, 'WENDBINE_SUPPLIES_BOTH_BUT_NAME_HEAVY_LOCAL_TRANSFER;_TD613_FORMAL_AND_GOVERNANCE_RESIDUALS_REMAIN_HELD_NOT_PROVEN_NOVEL');

console.log('Wendbine → TD613 bounded nomenclature/operator assay v0.1 passed.');
