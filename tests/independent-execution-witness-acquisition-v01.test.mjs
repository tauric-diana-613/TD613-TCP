import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE';
const preregPath = `${root}/01-MANIFESTS/2026-09-15-independent-execution-witness-acquisition-v01-preregistration.json`;
const parentReceiptPath = `${root}/04-RECEIPTS/assays/2026-09-15-independent-handoff-recovery-witness-acquisition-spec-v01.json`;
const enginePath = `${root}/99-ADMIN/independent-execution-witness-acquisition-v01.mjs`;
const receiptPath = `${root}/04-RECEIPTS/assays/2026-09-15-independent-execution-witness-acquisition-v01.json`;
const operationPath = `${root}/05-OPERATIONS/2026-09-15-INDEPENDENT-EXECUTION-WITNESS-ACQUISITION-V0_1.md`;

assert.equal(fs.existsSync(preregPath), true, 'execution witness acquisition must be preregistered before implementation');
const prereg = JSON.parse(fs.readFileSync(preregPath, 'utf8'));
assert.equal(prereg.schema, 'td613.independent-execution-witness-acquisition-preregistration/v0.1');
assert.equal(prereg.parent_spec.sealed_head, 'c99ed65fe21350d48f6c3785f048d0b8c788de8a');
assert.equal(prereg.parent_spec.result, 'BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED');
assert.equal(prereg.scope, 'EXISTING_SUBSTRATE_EXECUTION_ONLY');
assert.equal(prereg.product_mutation_allowed, false);
assert.equal(prereg.maximum_green, 'BOUNDED_LOCAL_MACHINE_EXECUTION_WITNESSES_ACQUIRED');
assert.equal(prereg.episode_state_before_execution, 'NOT_ACQUIRED');
assert.equal(prereg.human_replication_authority, false);
assert.equal(prereg.external_host_enforcement_authority, false);
assert.equal(prereg.universal_revocation_authority, false);
assert.equal(prereg.safe_return_promotion_authority, false);
assert.equal(prereg.return_promotion_authority, false);
assert.equal(prereg.empirical_exteriority_authority, false);
assert.ok(prereg.claim_ceiling.includes('LOCAL_SESSION_CLOSE != UNIVERSAL_REVOCATION'));
assert.ok(prereg.claim_ceiling.includes('RECOVERY_CANDIDATE != RETURN'));

const deficits = [];
for (const [label, target] of [
  ['EXECUTION_WITNESS_ENGINE_MISSING', enginePath],
  ['EXECUTION_WITNESS_RECEIPT_MISSING', receiptPath],
  ['EXECUTION_WITNESS_OPERATION_MISSING', operationPath]
]) if (!fs.existsSync(target)) deficits.push(label);
if (deficits.length) throw new Error(`INDEPENDENT_EXECUTION_WITNESS_ACQUISITION_PREREGISTERED_RED\n${deficits.join('\n')}`);

const parentReceipt = JSON.parse(fs.readFileSync(parentReceiptPath, 'utf8'));
assert.equal(parentReceipt.maximum_green, 'BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED');
assert.equal(parentReceipt.witness_acquired, false);
assert.equal(parentReceipt.right_of_resignation, 'OPEN');
assert.equal(parentReceipt.safe_return_recovery, 'NON_EQUIVALENT');
assert.equal(parentReceipt.return_promotion_authority, false);

const { createLoomPortableGovernor } = await import('../app/engine/loom-portable-governor.js');
const { compileLoomDemoScene } = await import('../app/dome-world/holonomy-loom/semantic-field.js');
const { compileDollhousePortableProjection, operateDollhousePortableProjection } = await import('../app/engine/dollhouse-portable-aia-roundtrip.js');
const { runIndependentExecutionWitnessAcquisition } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/independent-execution-witness-acquisition-v01.mjs');

const result = runIndependentExecutionWitnessAcquisition({
  prereg,
  parentReceipt,
  createLoomPortableGovernor,
  compileLoomDemoScene,
  compileDollhousePortableProjection,
  operateDollhousePortableProjection
});

assert.equal(result.schema, 'td613.independent-execution-witness-acquisition-result/v0.1');
assert.equal(result.outcome, 'BOUNDED_LOCAL_MACHINE_EXECUTION_WITNESSES_ACQUIRED');
assert.equal(result.scope, 'EXISTING_SUBSTRATE_EXECUTION_ONLY');
assert.equal(result.product_mutated, false);
assert.equal(result.episode_state_after_execution, 'CANDIDATE');
assert.equal(result.witness_acquired, true);
assert.equal(result.right_of_resignation_candidate, true);
assert.equal(result.safe_return_recovery_candidate, true);
assert.equal(result.right_of_resignation_established, false);
assert.equal(result.safe_return_established, false);
assert.equal(result.return_promoted, false);
assert.equal(result.human_replication_promoted, false);
assert.equal(result.external_host_enforcement_promoted, false);
assert.equal(result.empirical_exteriority_promoted, false);

const resignation = result.episodes.right_of_resignation;
assert.equal(resignation.prior_participation.outcome, 'ADMITTED');
assert.equal(resignation.exit_receipt.kind, 'CLOSE');
assert.equal(resignation.exit_receipt.outcome, 'CLOSED');
assert.equal(resignation.closed_session_probe.outcome, 'HELD');
assert.ok(resignation.closed_session_probe.reasons.includes('SESSION_CLOSED'));
assert.equal(resignation.independent_continuation.outcome, 'ADMITTED');
assert.equal(resignation.independent_receiver_is_new_instance, true);
assert.equal(resignation.post_exit_route_useful, true);
assert.equal(resignation.origin_control_preserved_across_receivers, true);

const recovery = result.episodes.safe_return_recovery;
assert.equal(recovery.seeded_drift.outcome, 'HELD');
assert.equal(recovery.recovery_receipt.outcome, 'ADMITTED');
assert.equal(recovery.recovery_receipt.recovered, true);
assert.equal(recovery.post_recovery_state.status, 'ACTIVE');
assert.equal(recovery.origin_control_preserved_while_held, true);
assert.equal(recovery.origin_control_preserved_after_recovery, true);
assert.equal(recovery.defeat_probe.outcome, 'HELD');
assert.equal(recovery.post_defeat_state.status, 'HELD');
assert.equal(recovery.origin_control_preserved_after_defeat_probe, true);

assert.ok(result.findings.includes('EXISTING_GOVERNOR_CLOSE_PRODUCES_EXECUTED_LOCAL_EXIT_RECEIPT'));
assert.ok(result.findings.includes('SEPARATE_GOVERNOR_CONTINUES_FROM_FROZEN_ORIGIN_AFTER_FIRST_SESSION_CLOSE'));
assert.ok(result.findings.includes('HELD_TO_ADMITTED_TRANSITION_PRODUCES_RECOVERED_TRUE_RECEIPT'));
assert.ok(result.findings.includes('LOCAL_MACHINE_WITNESSES_REACH_CANDIDATE_NOT_RETURN'));

const sameInstanceFactory = packet => {
  if (!globalThis.__td613_same_governor) globalThis.__td613_same_governor = createLoomPortableGovernor(packet);
  return globalThis.__td613_same_governor;
};
assert.throws(() => runIndependentExecutionWitnessAcquisition({
  prereg,
  parentReceipt,
  createLoomPortableGovernor: sameInstanceFactory,
  compileLoomDemoScene,
  compileDollhousePortableProjection,
  operateDollhousePortableProjection
}), /SECOND_RECEIVER_NOT_INDEPENDENT_INSTANCE/);
delete globalThis.__td613_same_governor;

const widenedParent = structuredClone(parentReceipt);
widenedParent.return_promotion_authority = true;
assert.throws(() => runIndependentExecutionWitnessAcquisition({
  prereg,
  parentReceipt: widenedParent,
  createLoomPortableGovernor,
  compileLoomDemoScene,
  compileDollhousePortableProjection,
  operateDollhousePortableProjection
}), /PARENT_RETURN_AUTHORITY_WIDENED/);

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
assert.equal(receipt.maximum_green, 'BOUNDED_LOCAL_MACHINE_EXECUTION_WITNESSES_ACQUIRED');
assert.equal(receipt.episode_state, 'CANDIDATE');
assert.equal(receipt.witness_acquired, true);
assert.equal(receipt.right_of_resignation_candidate, true);
assert.equal(receipt.safe_return_recovery_candidate, true);
assert.equal(receipt.right_of_resignation_established, false);
assert.equal(receipt.safe_return_established, false);
assert.equal(receipt.return_promotion_authority, false);
assert.ok(receipt.claim_ceiling.includes('SEPARATE_LOCAL_MACHINE_RECEIVER != INDEPENDENT_HUMAN_RECEIVER'));
assert.ok(receipt.claim_ceiling.includes('CANDIDATE != CUSTODIAN_INDEPENDENT_RETURN'));

console.log('Independent execution witness acquisition v0.1 passed.');
