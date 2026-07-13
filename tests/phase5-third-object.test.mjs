import assert from 'node:assert/strict';
import {
  NonceRegistry, R0_RECEIPT_REFERENCES_ONLY, R1_ROUTE_SCOPED_ARTIFACT_REFERENCE,
  createRouteScopedReference, generateContextNonce, generateRelationKey
} from '../app/engine/phase5-relation-crypto.js';
import {
  compileRelationProposal, confirmRelation, createRelationStateSnapshot,
  exportRelationBundle, reviseRelation, supersedeRelation, withdrawRelation
} from '../app/engine/phase5-relation-envelope.js';
import {
  auditRelationProposal, computeRelationAuditDigest
} from '../app/engine/aperture-v3-relation-audit.js';
import {
  appendPhasonRelationEvent, createPhasonRelationChain, detectPhasonFork,
  mergePhasonBranches, replayPhasonRelationChain, validateRelationTransition
} from '../app/engine/phase5-phason-relation-ledger.js';
import { replayRelationEnvelope } from '../app/engine/phase5-relation-replay.js';
import {
  createMarrowlineRelationCarrier, inspectMarrowlineRelationCarrier,
  sealMarrowlineRelationCarrier
} from '../app/dome-world/marrowline-relation-carrier.js';
import { ARTIFACT_DIGEST, sourceSet } from './helpers/phase5-fixtures.mjs';

const key = await generateRelationKey();
assert.equal(key.extractable, false);
assert.deepEqual(key.usages, ['sign', 'verify']);
const nonceA = generateContextNonce();
const nonceB = generateContextNonce();
assert.notEqual(nonceA, nonceB);
await assert.rejects(
  createRouteScopedReference({ assuranceClass: R0_RECEIPT_REFERENCES_ONLY, contextNonce: 'not-a-valid-nonce', routeScope: 'local' }),
  /Context nonce/
);
const refA = await createRouteScopedReference({ assuranceClass: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE, ashAssuranceClass: 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST', artifactDigest: ARTIFACT_DIGEST, contextNonce: nonceA, routeScope: 'local-research-review', key });
const refB = await createRouteScopedReference({ assuranceClass: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE, ashAssuranceClass: 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST', artifactDigest: ARTIFACT_DIGEST, contextNonce: nonceB, routeScope: 'local-research-review', key });
const refRoute = await createRouteScopedReference({ assuranceClass: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE, ashAssuranceClass: 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST', artifactDigest: ARTIFACT_DIGEST, contextNonce: nonceA, routeScope: 'legal-reference-review', key });
assert.match(refA.ash_reference, /^hmac-sha256:[0-9a-f]{64}$/);
assert.notEqual(refA.ash_reference, refB.ash_reference);
assert.notEqual(refA.ash_reference, refRoute.ash_reference);

const registry = new NonceRegistry();
assert.equal(await registry.claim(nonceA, { relationId: 'rel_0123456789abcdef0123' }), true);
assert.equal(await registry.claim(nonceA, { relationId: 'rel_ffffffffffffffffffff' }), false);
assert.equal('artifact_digest' in registry.snapshot()[0], false);

const l0 = await sourceSet({ assurance: 'L0_METADATA_ONLY' });
const r0 = await compileRelationProposal({ ashReceipt: l0.ash, flowcoreReceipt: l0.flow, roundTripReceipt: l0.roundTrip, assuranceClass: R0_RECEIPT_REFERENCES_ONLY });
assert.equal(r0.envelope.state, 'PROPOSED');
assert.equal(r0.envelope.ash_reference, null);
assert.equal(r0.side_effects.network_called, false);
assert.equal(r0.source_validation.ash, 'DIGEST_VERIFIED');

const source = await sourceSet();
const proposalRegistry = new NonceRegistry();
const proposal = await compileRelationProposal({
  ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip,
  assuranceClass: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE, artifactDigest: ARTIFACT_DIGEST
}, { nonceRegistry: proposalRegistry });
assert.equal(proposal.source_validation.ash, 'DIGEST_VERIFIED_AND_ARTIFACT_COMMITMENT_MATCHED');
assert.equal(JSON.stringify(proposal.envelope).includes(ARTIFACT_DIGEST), false);
assert.equal(proposal.envelope.hmac.key_extractable, false);
await assert.rejects(
  compileRelationProposal({
    ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip,
    assuranceClass: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE,
    artifactDigest: `sha256:${'b'.repeat(64)}`
  }),
  /does not match the Ash custody commitment/
);
const audit = await auditRelationProposal(proposal, {
  ashReceipt: source.ash, flowcoreReceipt: source.flow,
  roundTripReceipt: source.roundTrip, artifactDigest: ARTIFACT_DIGEST,
  nonceRegistry: proposalRegistry
});
assert.equal(audit.outcome, 'RELATION_PROPOSAL_ADMISSIBLE');
assert.ok(audit.accepted.includes('relation_digest_verified'));
assert.ok(audit.accepted.includes('r1_route_scoped_reference_verified'));
await assert.rejects(confirmRelation(proposal, audit, { explicitOperatorAction: false }), /Explicit operator confirmation/);

const tamperedProposal = structuredClone(proposal.envelope);
tamperedProposal.route.binding_purpose = 'tampered-before-confirmation';
const tamperedProposalAudit = await auditRelationProposal({ envelope: tamperedProposal, key: proposal.key }, {
  ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip,
  artifactDigest: ARTIFACT_DIGEST
});
assert.equal(tamperedProposalAudit.outcome, 'HOLD_REFERENCE_MISMATCH');
await assert.rejects(
  confirmRelation({ envelope: tamperedProposal, key: proposal.key }, audit, { explicitOperatorAction: true }),
  /proposal digest verification failed/
);
const tamperedAudit = structuredClone(audit); tamperedAudit.warnings.push('uncommitted-change');
await assert.rejects(confirmRelation(proposal, tamperedAudit, { explicitOperatorAction: true }), /audit digest verification failed/);
const mismatchedAudit = structuredClone(audit);
mismatchedAudit.relation_digest = `sha256:${'f'.repeat(64)}`;
delete mismatchedAudit.audit_digest;
mismatchedAudit.audit_digest = await computeRelationAuditDigest(mismatchedAudit);
await assert.rejects(confirmRelation(proposal, mismatchedAudit, { explicitOperatorAction: true }), /references do not match/);

const confirmed = await confirmRelation(proposal, audit, { explicitOperatorAction: true, nonceRegistry: proposalRegistry });
assert.equal(confirmed.envelope.state, 'CONFIRMED');
assert.equal(proposal.envelope.state, 'PROPOSED');
assert.equal(confirmed.confirmation_receipt.explicit_operator_action, true);

const exported = exportRelationBundle({ envelope: confirmed.envelope, confirmationReceipt: confirmed.confirmation_receipt, audit });
assert.equal(exported.key_exported, false);
assert.equal(exported.artifact_digest_exported, false);
assert.equal(JSON.stringify(exported).includes(ARTIFACT_DIGEST), false);

const leak = structuredClone(proposal.envelope); leak.artifact_digest = ARTIFACT_DIGEST;
assert.equal((await auditRelationProposal({ envelope: leak, key: proposal.key }, { ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip, artifactDigest: ARTIFACT_DIGEST })).outcome, 'REJECT_ARTIFACT_DISCLOSURE');
const identity = structuredClone(proposal.envelope); identity.relation_is_identity = true;
assert.equal((await auditRelationProposal({ envelope: identity, key: proposal.key }, { ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip, artifactDigest: ARTIFACT_DIGEST })).outcome, 'REJECT_AUTHORITY_OR_IDENTITY_CLAIM');
const wrongFlow = structuredClone(source.flow); wrongFlow.receipt_id = 'flowctx_ffffffffffffffffffff';
assert.equal((await auditRelationProposal(proposal, { ashReceipt: source.ash, flowcoreReceipt: wrongFlow, roundTripReceipt: source.roundTrip, artifactDigest: ARTIFACT_DIGEST })).outcome, 'HOLD_REFERENCE_MISMATCH');
await assert.rejects(compileRelationProposal({ ashReceipt: l0.ash, flowcoreReceipt: l0.flow, roundTripReceipt: l0.roundTrip, assuranceClass: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE, artifactDigest: ARTIFACT_DIGEST }), /R1 requires an L1 Ash receipt/);
await assert.rejects(createRelationStateSnapshot(proposal.envelope, 'SUPERSEDED'), /HOLD_LIFECYCLE_CONTRADICTION/);
await assert.rejects(createRelationStateSnapshot(proposal.envelope, 'CONFIRMED'), /Explicit operator confirmation/);

let chain = await createPhasonRelationChain(proposal.envelope);
chain = await appendPhasonRelationEvent(chain, confirmed.envelope, 'CONFIRMED');
assert.equal(chain.events[1].previous_event_digest, chain.events[0].event_digest);
assert.equal((await replayPhasonRelationChain(chain)).outcome, 'RELATION_REPLAY_VERIFIED');
assert.equal(validateRelationTransition('PROPOSED', 'SUPERSEDED').valid, false);

const r0Audit = await auditRelationProposal(r0, { ashReceipt: l0.ash, flowcoreReceipt: l0.flow, roundTripReceipt: l0.roundTrip });
const r0Confirmed = await confirmRelation(r0, r0Audit, { explicitOperatorAction: true });
await assert.rejects(
  confirmRelation(r0, r0Audit, { explicitOperatorAction: true }),
  /HOLD_NONCE_REUSE/
);
const base = await createPhasonRelationChain(r0.envelope);
const confirmedBranch = await appendPhasonRelationEvent(base, r0Confirmed.envelope, 'CONFIRMED');
const withdrawnBranch = await appendPhasonRelationEvent(base, await withdrawRelation(r0.envelope), 'WITHDRAWN');
const forked = await mergePhasonBranches(r0.envelope.relation_id, [confirmedBranch, withdrawnBranch]);
assert.equal(forked.fork_detected, true);
assert.equal(detectPhasonFork(forked.events).length, 1);
assert.equal((await replayPhasonRelationChain(forked)).outcome, 'RELATION_REPLAY_HELD_PHASON_FORK');

const replay = await replayRelationEnvelope({ envelope: confirmed.envelope, confirmationReceipt: confirmed.confirmation_receipt, audit, phasonChain: chain }, { key: proposal.key, artifactDigest: ARTIFACT_DIGEST, ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip });
assert.equal(replay.outcome, 'RELATION_REPLAY_VERIFIED');
assert.equal(replay.network_called, false);
assert.equal((await replayRelationEnvelope({ envelope: confirmed.envelope, confirmationReceipt: confirmed.confirmation_receipt, audit, phasonChain: chain })).outcome, 'RELATION_REPLAY_HELD_KEY_UNAVAILABLE');
const tampered = structuredClone(confirmed.envelope); tampered.route.binding_purpose = 'tampered';
assert.equal((await replayRelationEnvelope({ envelope: tampered, confirmationReceipt: confirmed.confirmation_receipt, audit, phasonChain: chain }, { key: proposal.key, artifactDigest: ARTIFACT_DIGEST })).outcome, 'RELATION_REPLAY_HELD_TAMPER');
const crossBoundAudit = structuredClone(audit);
crossBoundAudit.relation_digest = `sha256:${'e'.repeat(64)}`;
delete crossBoundAudit.audit_digest;
crossBoundAudit.audit_digest = await computeRelationAuditDigest(crossBoundAudit);
assert.equal((await replayRelationEnvelope({ envelope: confirmed.envelope, confirmationReceipt: confirmed.confirmation_receipt, audit: crossBoundAudit, phasonChain: chain }, { key: proposal.key, artifactDigest: ARTIFACT_DIGEST })).outcome, 'RELATION_REPLAY_HELD_REFERENCE_MISMATCH');

const revised = await reviseRelation(confirmed, { ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip, assuranceClass: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE, artifactDigest: ARTIFACT_DIGEST, routeScope: 'revised-local-review', key: confirmed.key, contextNonce: confirmed.envelope.context_nonce });
assert.equal(revised.predecessor.state, 'REVISED');
assert.notEqual(revised.successor.envelope.relation_id, confirmed.envelope.relation_id);
assert.notEqual(revised.successor.envelope.context_nonce, confirmed.envelope.context_nonce);
assert.notEqual(revised.successor.key, confirmed.key);
const successorAudit = await auditRelationProposal(revised.successor, { ashReceipt: source.ash, flowcoreReceipt: source.flow, roundTripReceipt: source.roundTrip, artifactDigest: ARTIFACT_DIGEST });
const successor = await confirmRelation(revised.successor, successorAudit, { explicitOperatorAction: true });
assert.equal((await supersedeRelation(revised.predecessor, successor)).state, 'SUPERSEDED');
assert.equal((await withdrawRelation(confirmed.envelope)).state, 'WITHDRAWN');

const unsealedPacket = createMarrowlineRelationCarrier(proposal.envelope);
assert.equal((await inspectMarrowlineRelationCarrier(unsealedPacket)).outcome, 'HOLD_CARRIER_MUTATION');
const packet = await sealMarrowlineRelationCarrier(unsealedPacket);
assert.equal((await inspectMarrowlineRelationCarrier(packet)).outcome, 'CARRIER_INTEGRITY_PRESERVED');
const mutatedPacket = structuredClone(packet); mutatedPacket.envelope.route.binding_purpose = 'carrier-rewrite';
assert.equal((await inspectMarrowlineRelationCarrier(mutatedPacket)).outcome, 'HOLD_CARRIER_MUTATION');
const authorityPacket = structuredClone(packet); authorityPacket.marrowline_confirmed_relation = true;
assert.equal((await inspectMarrowlineRelationCarrier(authorityPacket)).outcome, 'HOLD_CARRIER_MUTATION');

console.log('phase5-third-object.test.mjs passed');
