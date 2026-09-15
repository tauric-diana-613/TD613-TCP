import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const preregPath = path.join(root, '01-MANIFESTS/2026-09-15-independent-handoff-recovery-witness-acquisition-spec-v01-preregistration.json');
const parentReceiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-dome-world-open-residual-tomography-v01.json');
const specPath = path.join(root, '01-MANIFESTS/2026-09-15-independent-handoff-recovery-witness-acquisition-spec-v01.json');
const enginePath = path.join(root, '99-ADMIN/independent-handoff-recovery-witness-acquisition-spec-v01.mjs');
const receiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-independent-handoff-recovery-witness-acquisition-spec-v01.json');
const operationPath = path.join(root, '05-OPERATIONS/2026-09-15-INDEPENDENT-HANDOFF-RECOVERY-WITNESS-ACQUISITION-SPEC-V0_1.md');

assert.equal(fs.existsSync(preregPath), true, 'witness-acquisition specification must be preregistered before implementation');
const prereg = JSON.parse(fs.readFileSync(preregPath, 'utf8'));
assert.equal(prereg.schema, 'td613.independent-handoff-recovery-witness-acquisition-spec-preregistration/v0.1');
assert.equal(prereg.parent_tomography.sealed_head, 'cf6232fe74c2adf319f009ab78942b3aa396f428');
assert.equal(prereg.parent_tomography.result, 'BOUNDED_FORMAL_OPEN_RESIDUAL_TOMOGRAPHY_SUPPORTED');
assert.equal(prereg.scope, 'SPECIFICATION_ONLY');
assert.equal(prereg.maximum_green, 'BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED');
assert.equal(prereg.witness_acquisition_authority, false);
assert.equal(prereg.right_of_resignation_promotion_authority, false);
assert.equal(prereg.recovery_promotion_authority, false);
assert.equal(prereg.return_promotion_authority, false);
assert.equal(prereg.empirical_exteriority_authority, false);
assert.ok(prereg.claim_ceiling.includes('ACQUISITION_SPECIFICATION != WITNESS_ACQUISITION'));
assert.ok(prereg.claim_ceiling.includes('REPAIR_PATH != RECOVERY != RETURN'));
assert.deepEqual(prereg.future_episode_states, ['NOT_ACQUIRED','HELD','FAILED','CANDIDATE']);

const deficits = [];
for (const [label, target] of [
  ['WITNESS_ACQUISITION_SPEC_MISSING', specPath],
  ['WITNESS_ACQUISITION_VALIDATOR_MISSING', enginePath],
  ['WITNESS_ACQUISITION_RECEIPT_MISSING', receiptPath],
  ['WITNESS_ACQUISITION_OPERATION_MISSING', operationPath]
]) {
  if (!fs.existsSync(target)) deficits.push(label);
}
if (deficits.length) throw new Error(`INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_PREREGISTERED_RED\n${deficits.join('\n')}`);

const parentReceipt = JSON.parse(fs.readFileSync(parentReceiptPath, 'utf8'));
assert.equal(parentReceipt.maximum_green, 'BOUNDED_FORMAL_OPEN_RESIDUAL_TOMOGRAPHY_SUPPORTED');
assert.equal(parentReceipt.right_of_resignation, 'OPEN');
assert.equal(parentReceipt.safe_return_recovery, 'NON_EQUIVALENT');
assert.equal(parentReceipt.return_promotion_authority, false);

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const { validateWitnessAcquisitionSpecification } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/independent-handoff-recovery-witness-acquisition-spec-v01.mjs');

const result = validateWitnessAcquisitionSpecification({ prereg, parentReceipt, spec });
assert.equal(result.schema, 'td613.independent-handoff-recovery-witness-acquisition-spec-result/v0.1');
assert.equal(result.outcome, 'BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED');
assert.equal(result.scope, 'SPECIFICATION_ONLY');
assert.equal(result.lanes.length, 2);
assert.equal(result.witness_acquired, false);
assert.equal(result.right_of_resignation_promoted, false);
assert.equal(result.recovery_promoted, false);
assert.equal(result.return_promoted, false);
assert.equal(result.empirical_exteriority_promoted, false);
assert.equal(result.future_episode_initial_state, 'NOT_ACQUIRED');

const resignation = result.lanes.find(lane => lane.id === 'right_of_resignation');
const recovery = result.lanes.find(lane => lane.id === 'safe_return_recovery');
assert.equal(resignation.parent_state, 'OPEN');
assert.equal(recovery.parent_state, 'NON_EQUIVALENT');
assert.equal(resignation.required_witness_families.length, 4);
assert.equal(recovery.required_witness_families.length, 4);
assert.notDeepEqual(resignation.required_witness_families, recovery.required_witness_families);
assert.ok(resignation.required_witness_families.includes('INDEPENDENT_CONTINUATION_WITHOUT_CUSTODIAN_AUTHORITY'));
assert.ok(recovery.required_witness_families.includes('VALIDATED_POST_RECOVERY_STATE'));
assert.ok(resignation.defeat_conditions.includes('CUSTODIAN_NARRATION_REQUIRED_AFTER_EXIT'));
assert.ok(recovery.defeat_conditions.includes('REPAIR_PATH_SUBSTITUTED_FOR_RECOVERY'));
assert.ok(result.invariants.includes('CUSTODIAN_NARRATION_IS_NOT_INDEPENDENT_WITNESS'));
assert.ok(result.invariants.includes('FAILED_OR_HELD_EPISODES_REMAIN_RETAINED'));
assert.ok(result.findings.includes('SPECIFICATION_COMPLETENESS_DOES_NOT_ACQUIRE_A_WITNESS'));
assert.ok(result.findings.includes('RIGHT_OF_RESIGNATION_AND_RECOVERY_REQUIRE_DISTINCT_WITNESS_FAMILIES'));

const contaminatedNarration = structuredClone(spec);
contaminatedNarration.allowed_witness_source_classes.push('CUSTODIAN_NARRATION');
assert.throws(() => validateWitnessAcquisitionSpecification({ prereg, parentReceipt, spec: contaminatedNarration }), /FORBIDDEN_WITNESS_SOURCE_CLASS:CUSTODIAN_NARRATION/);

const collapsedRecovery = structuredClone(spec);
collapsedRecovery.lanes.safe_return_recovery.required_witness_families = ['PRESERVE_ORIGIN_AND_HOLD'];
assert.throws(() => validateWitnessAcquisitionSpecification({ prereg, parentReceipt, spec: collapsedRecovery }), /RECOVERY_WITNESS_FAMILY_MISMATCH/);

const genericRevocation = structuredClone(spec);
genericRevocation.lanes.right_of_resignation.required_witness_families = ['GENERIC_REVOCATION'];
assert.throws(() => validateWitnessAcquisitionSpecification({ prereg, parentReceipt, spec: genericRevocation }), /RESIGNATION_WITNESS_FAMILY_MISMATCH/);

const prematureCandidate = structuredClone(spec);
prematureCandidate.initial_episode_state = 'CANDIDATE';
assert.throws(() => validateWitnessAcquisitionSpecification({ prereg, parentReceipt, spec: prematureCandidate }), /INITIAL_EPISODE_STATE_MUST_BE_NOT_ACQUIRED/);

const promotedReturn = structuredClone(spec);
promotedReturn.claims.return_established = true;
assert.throws(() => validateWitnessAcquisitionSpecification({ prereg, parentReceipt, spec: promotedReturn }), /FORBIDDEN_CLAIM_PROMOTION:RETURN/);

const widenedParent = structuredClone(parentReceipt);
widenedParent.right_of_resignation = 'RESOLVED';
assert.throws(() => validateWitnessAcquisitionSpecification({ prereg, parentReceipt: widenedParent, spec }), /PARENT_RESIDUAL_STATE_CHANGED:RIGHT_OF_RESIGNATION/);

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
assert.equal(receipt.maximum_green, 'BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED');
assert.equal(receipt.witness_acquired, false);
assert.equal(receipt.right_of_resignation, 'OPEN');
assert.equal(receipt.safe_return_recovery, 'NON_EQUIVALENT');
assert.equal(receipt.return_promotion_authority, false);
assert.ok(receipt.claim_ceiling.includes('ACQUISITION_SPECIFICATION != WITNESS_ACQUISITION'));
assert.ok(receipt.claim_ceiling.includes('CANDIDATE != RETURN'));

console.log('Independent handoff/recovery witness-acquisition specification v0.1 passed.');
