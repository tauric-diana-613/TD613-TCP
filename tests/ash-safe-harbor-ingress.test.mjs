import assert from 'node:assert/strict';
import { compileAuthorityContext } from '../app/engine/ash-constitutional-convergence.js';
import {
  compileSafeHarborIngressEnvelope,
  compileSafeHarborCustodyBinding,
  verifySafeHarborIngressEnvelope,
  verifySafeHarborCustodyBinding
} from '../app/engine/ash-safe-harbor-ingress.js';

const digest = letter => `sha256:${letter.repeat(64)}`;
const packet = {
  schema_version: 'td613.safe-harbor.packet/v2',
  packet_id: 'packet-stretch9-synthetic',
  packet_hash_sha256: digest('a'),
  source_status: 'OPERATOR_STAGED',
  binding_provenance: {
    canonical_declaration_sha256: digest('b'),
    legacy_root_sha256: digest('c'),
    binding_receipt_sha256: digest('d')
  },
  signature: {
    status: 'sealed',
    sig: '-----BEGIN PGP SIGNATURE-----\nsynthetic\n-----END PGP SIGNATURE-----',
    operator_signature_claimed: true
  },
  ingress: {
    future_self: 'THIS RAW BODY MUST NEVER ENTER THE ENVELOPE',
    past_self: 'NOR THIS BODY',
    higher_self: 'NOR THIS BODY'
  },
  case_map: { secret: 'must remain excluded' },
  route_memory: { secret: 'must remain excluded' }
};

const envelopeInput = {
  envelopeId: 'harboringress_synthetic_fixture',
  token: 'ash_ingress_synthetic_token_123456',
  createdAt: '2026-07-16T23:00:00.000Z',
  origin: 'https://td613.com',
  ttlMs: 900000,
  elapsedMs: 1000,
  packetHashVerified: true,
  authoritySurfaceStatus: 'export-hardened',
  sourceStatus: 'OPERATOR_STAGED',
  operatorIntent: 'CONSIDER_SAFE_HARBOR_REFERENCE_IN_ASH',
  rawBodyIncluded: false
};

const envelope = await compileSafeHarborIngressEnvelope(packet, envelopeInput);
assert.equal(envelope.state, 'INGRESS_ENVELOPE_ELIGIBLE');
assert.equal(envelope.ingress_eligible, true);
assert.equal(await verifySafeHarborIngressEnvelope(envelope), true);
assert.equal(envelope.raw_body_included, false);
assert.equal(envelope.raw_corpus_included, false);
assert.equal(envelope.complete_case_map_included, false);
assert.equal(envelope.complete_route_memory_included, false);
assert.equal(envelope.room_keys_included, false);
assert.equal(envelope.capsule_plaintext_included, false);
assert.equal(envelope.private_aliases_included, false);
assert.equal(envelope.local_filesystem_paths_included, false);
assert.equal(envelope.universal_join_key, null);
assert.equal(envelope.signature_lane.signature_verified_by_adapter, false);
assert.equal(envelope.selected_provenance_references.length, 4);
assert.doesNotMatch(JSON.stringify(envelope), /THIS RAW BODY|NOR THIS BODY|must remain excluded/);
assert.equal(envelope.server_custody_created, false);
assert.equal(envelope.provider_called, false);
assert.equal(envelope.destination_transport_authorized, false);
assert.equal(envelope.release_authorized, false);
assert.equal(envelope.suppression_authorized, false);
assert.equal(envelope.cinder_action_authorized, false);
assert.equal(envelope.automatic_case_creation, false);
assert.equal(envelope.automatic_relation_creation, false);
assert.equal(envelope.automatic_custody_root_creation, false);

const l0 = await compileSafeHarborCustodyBinding(envelope, {
  bindingId: 'harborbinding_l0_synthetic',
  createdAt: '2026-07-16T23:01:00.000Z',
  bindingLevel: 'L0',
  operatorGesture: 'BIND_SAFE_HARBOR_REFERENCE'
});
assert.equal(l0.state, 'CUSTODY_REFERENCE_BOUND');
assert.equal(l0.custody_reference_bound, true);
assert.equal(l0.binding_scope, 'REFERENCE_ONLY_NO_CASE_REQUIRED');
assert.equal(l0.custody_root_created, false);
assert.equal(l0.case_created, false);
assert.equal(l0.relation_created, false);
assert.equal(l0.authenticity_concluded, false);
assert.equal(l0.identity_concluded, false);
assert.equal(l0.authorship_concluded, false);
assert.equal(l0.truth_concluded, false);
assert.equal(await verifySafeHarborCustodyBinding(l0), true);

const authorityContext = await compileAuthorityContext({
  caseId: 'case-stretch9',
  caseMapDigest: digest('e'),
  routeMemoryDigest: digest('f'),
  lifecycleRank: 'REBUILD_ELIGIBLE',
  current: true,
  closureStatus: 'OPEN'
});
const l1 = await compileSafeHarborCustodyBinding(envelope, {
  bindingId: 'harborbinding_l1_synthetic',
  createdAt: '2026-07-16T23:02:00.000Z',
  bindingLevel: 'L1',
  operatorGesture: 'BIND_SAFE_HARBOR_REFERENCE',
  authorityContext,
  caseMap: { case_id: 'case-stretch9', case_map_digest: digest('e') },
  routeMemory: { route_memory_digest: digest('f') }
});
assert.equal(l1.state, 'CUSTODY_REFERENCE_BOUND');
assert.equal(l1.binding_scope, 'VERIFIED_PROVENANCE_REFERENCE_WITH_CURRENT_CASE');
assert.equal(l1.case_id, 'case-stretch9');
assert.equal(l1.custody_root_created, false);
assert.equal(await verifySafeHarborCustodyBinding(l1), true);

const missingHash = await compileSafeHarborIngressEnvelope({ ...packet, packet_hash_sha256: null }, envelopeInput);
assert.equal(missingHash.state, 'TAMPER_HOLD');

const replay = await compileSafeHarborIngressEnvelope(packet, { ...envelopeInput, replayDetected: true });
assert.equal(replay.state, 'REPLAY_HOLD');

const duplicate = await compileSafeHarborIngressEnvelope(packet, { ...envelopeInput, duplicateDetected: true, duplicateReviewed: false });
assert.equal(duplicate.state, 'DUPLICATE_REVIEW_HOLD');

const expired = await compileSafeHarborIngressEnvelope(packet, { ...envelopeInput, elapsedMs: 900001 });
assert.equal(expired.state, 'EXPIRED_LOCAL_POSTURE_HOLD');
assert.equal(expired.local_expiry_posture.trusted_external_time_used, false);

const rawBody = await compileSafeHarborIngressEnvelope(packet, { ...envelopeInput, rawBodyIncluded: true });
assert.equal(rawBody.state, 'MALFORMED_PACKET_HOLD');

const l1Stale = await compileSafeHarborCustodyBinding(envelope, {
  bindingLevel: 'L1',
  operatorGesture: 'BIND_SAFE_HARBOR_REFERENCE',
  authorityContext: { ...authorityContext, current: false },
  caseMap: { case_id: 'case-stretch9', case_map_digest: digest('e') },
  routeMemory: { route_memory_digest: digest('f') }
});
assert.equal(l1Stale.state, 'STALE_CASE_HOLD');

const cancelled = await compileSafeHarborCustodyBinding(envelope, {
  bindingLevel: 'L0',
  operatorGesture: 'BIND_SAFE_HARBOR_REFERENCE',
  cancelled: true
});
assert.equal(cancelled.state, 'CANCELLED_HOLD');

console.log('ash-safe-harbor-ingress.test.mjs passed');
