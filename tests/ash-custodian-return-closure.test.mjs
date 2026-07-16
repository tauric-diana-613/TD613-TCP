import assert from 'node:assert/strict';

import {
  computeManifestDigest,
  computeReceiptDigest
} from '../app/dome-world/ash/canonical-json.js';
import {
  compileAuthorityContext
} from '../app/engine/ash-constitutional-convergence.js';
import {
  compileReturnHoldReceipt,
  compileReturnProductionObservation,
  compileReturnReadyBundle,
  compileReturnReplayReceipt,
  verifyReturnHoldReceipt,
  verifyReturnProductionObservation,
  verifyReturnReadyBundle,
  verifyReturnReplayReceipt
} from '../app/engine/ash-custodian-return-closure.js';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRebuildTest,
  compileRoomRules,
  compileRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  compileAshDraft,
  compileDraftReview,
  compileReleaseReceipt
} from '../app/engine/ash-keep-drafts.js';
import {
  compileSavePoint,
  decryptAshCapsule,
  encryptAshCapsule
} from '../app/engine/ash-keep-continuity.js';
import {
  compileLifecycleReceipt,
  compileReadinessReceipt,
  deriveAshLifecycle
} from '../app/engine/ash-lifecycle.js';

const digest = character => `sha256:${character.repeat(64)}`;

async function custodyReceipt() {
  const manifest = {
    schema: 'td613.ash.custody-manifest/v0.8',
    source_environment: 'synthetic-fixture',
    source_locator: { label: 'Synthetic return root', path_or_ref: null },
    artifact_metadata: { media_type: 'application/json', byte_length: 613, artifact_digest: digest('a') },
    manifest_digest: null
  };
  manifest.manifest_digest = await computeManifestDigest(manifest);
  const receipt = {
    schema: 'td613.ash.custody-receipt/v0.8',
    receipt_id: 'custody_fixture',
    manifest,
    manifest_digest: manifest.manifest_digest,
    receipt_digest: null
  };
  receipt.receipt_digest = await computeReceiptDigest(receipt);
  return receipt;
}

const custody = await custodyReceipt();
const readiness = await compileReadinessReceipt({
  sourceSurface: 'synthetic-return-fixture',
  artifactClass: 'archive-fragment',
  mediaType: 'application/json',
  byteLength: 613,
  arrivalAcknowledged: true,
  boundaryAcknowledged: true,
  custodyAcknowledged: true
});
const caseMap = await compileCaseMap({
  profile: 'archive',
  caseId: 'case_fixture',
  title: 'Synthetic return fixture',
  custodyReference: custody.receipt_id,
  rooms: [{ id: 'room_primary', label: 'Primary', color: '#76ead4' }, { id: 'room_context', label: 'Context', color: '#e4c66c' }],
  nodes: [
    { id: 'node_root', type: 'artifact', label: 'Custody root', room_id: 'room_primary', custody_reference: custody.receipt_id, source_status: 'OBSERVED' },
    { id: 'node_claim', type: 'claim', label: 'Claim', room_id: 'room_primary', source_status: 'SUPPLIED' },
    { id: 'node_hypothesis', type: 'hypothesis', label: 'Hypothesis', room_id: 'room_context', source_status: 'INFERRED' },
    { id: 'node_action', type: 'intended-action', label: 'Next action', room_id: 'room_context', source_status: 'SUPPLIED' }
  ],
  relationships: [
    { id: 'edge_support', from: 'node_claim', to: 'node_hypothesis', type: 'supports', source_status: 'SUPPLIED' },
    { id: 'edge_route', from: 'node_hypothesis', to: 'node_action', type: 'routes', source_status: 'DERIVED' }
  ],
  privateChronology: ['root', 'claim', 'hypothesis', 'action'],
  intendedActions: ['review return route'],
  evidenceBasis: ['synthetic fixture']
});
const roomRules = await compileRoomRules({ caseId: caseMap.case_id, rules: [] });
const routeMemory = await compileRouteMemory({
  caseId: caseMap.case_id,
  entries: [{
    draft_digest: digest('b'),
    route_id: 'route_public_request',
    purpose: 'synthetic projection',
    recipient_class: 'synthetic-reader',
    disclosed_opaque_references: ['node_claim'],
    recall_state: 'NOT_RECALLED'
  }]
});
const reader = await compileReaderProfile({ readerClass: 'deterministic-baseline', label: 'Synthetic local Reader', seeded: true });
const rebuild = await compileRebuildTest({
  caseMap,
  routeMemory,
  reader,
  trials: [{
    trial_id: 'trial_fixture',
    seed: 613,
    state: 'OBSERVED',
    before: { node_ids: ['node_claim'], relationship_ids: [] },
    after: { node_ids: ['node_claim', 'node_hypothesis'], relationship_ids: ['edge_support'], chronology: 500, source_style_linkage: 250 }
  }]
});
const draft = await compileAshDraft({
  caseId: caseMap.case_id,
  caseMapDigest: caseMap.case_map_digest,
  body: 'Purpose-shaped synthetic draft.',
  selectedRoute: 'route_public_request',
  recipientClass: 'synthetic-reader',
  purpose: 'synthetic projection',
  disclosedOpaqueReferences: ['node_claim']
});
const review = await compileDraftReview({
  draft,
  validCustody: true,
  sufficientTestCoverage: true,
  unresolvedTamper: false,
  explicitReview: true,
  protectedIdentityReviewed: true,
  confidentialPassagesReviewed: true,
  metadataReviewed: true,
  sourceReferencesReviewed: true,
  promptInjectionReviewed: true,
  routeHistoryReviewed: true,
  roomBridgesReviewed: true,
  chronologyReviewed: true,
  hushLinkCheckReviewed: true,
  approvalScope: 'LOCAL_EXPORT'
});
const release = await compileReleaseReceipt({
  draft,
  review,
  route: 'route_public_request',
  recipientClass: 'synthetic-reader',
  purpose: 'synthetic projection',
  version: '1',
  operatorGesture: 'synthetic:Keep Release Receipt'
});
const save = await compileSavePoint({
  caseId: caseMap.case_id,
  caseMapDigest: caseMap.case_map_digest,
  routeMemoryDigest: routeMemory.route_memory_digest,
  releaseReceiptReference: release.receipt_id,
  releaseReceiptDigest: release.receipt_digest,
  releaseCreatedAt: release.created_at,
  evidenceInventory: ['node_root'],
  nextStepPosture: ['return through isolated sandbox'],
  tamperState: 'CLEAR'
});
const lifecycle = deriveAshLifecycle({
  readinessReceipt: readiness,
  custodyReceipt: custody,
  custodyVerified: true,
  caseMap,
  latestTest: rebuild,
  latestDraft: draft,
  latestReview: review,
  latestRelease: release,
  latestSavePoint: save
});
assert.equal(lifecycle.state, 'CONTINUITY_SEALED');
const lifecycleReceipt = await compileLifecycleReceipt(lifecycle);
const authority = await compileAuthorityContext({
  lifecycleRank: lifecycle.state,
  readinessReceiptReference: readiness.receipt_id,
  custodyRootReceiptReference: custody.receipt_id,
  caseId: caseMap.case_id,
  caseMapDigest: caseMap.case_map_digest,
  routeMemoryDigest: routeMemory.route_memory_digest,
  rebuildReceiptReference: rebuild.test_id,
  currentReviewReference: review.review_id,
  currentReleaseReference: release.receipt_id,
  currentContinuityReference: save.save_point_id,
  evidenceBasis: ['synthetic current records']
});

const bundle = await compileReturnReadyBundle({
  caseId: caseMap.case_id,
  readinessReceipt: readiness,
  custodyReceipt: custody,
  authorityContext: authority,
  lifecycleReceipt,
  caseMap,
  roomRules,
  routeMemory,
  rebuildTests: [rebuild],
  drafts: [draft],
  reviews: [review],
  releases: [release],
  savePoints: [save],
  selected: {
    rebuildTestReference: rebuild.test_id,
    draftReference: draft.draft_id,
    reviewReference: review.review_id,
    releaseReference: release.receipt_id,
    savePointReference: save.save_point_id
  }
});

const verified = await verifyReturnReadyBundle(bundle);
assert.equal(verified.valid, true, verified.holds.join(', '));
assert.equal(verified.state, 'VERIFIED');

const tampered = { ...bundle, case_map: { ...bundle.case_map, title: 'Tampered title' } };
const tamperResult = await verifyReturnReadyBundle(tampered);
assert.equal(tamperResult.valid, false);
assert.equal(tamperResult.state, 'TAMPER_HOLD');

const stale = await compileReturnReadyBundle({
  caseId: caseMap.case_id,
  readinessReceipt: readiness,
  custodyReceipt: custody,
  authorityContext: authority,
  lifecycleReceipt,
  caseMap,
  roomRules,
  routeMemory,
  rebuildTests: [rebuild],
  drafts: [draft],
  reviews: [review],
  releases: [release],
  savePoints: [save],
  selected: {
    rebuildTestReference: rebuild.test_id,
    draftReference: draft.draft_id,
    reviewReference: review.review_id,
    releaseReference: 'release_stale',
    savePointReference: save.save_point_id
  }
});
const staleResult = await verifyReturnReadyBundle(stale);
assert.equal(staleResult.valid, false);
assert.equal(staleResult.state, 'STALE_RECEIPT_HOLD');

const partial = await compileReturnReadyBundle({ caseId: caseMap.case_id, caseMap, roomRules, routeMemory });
const partialResult = await verifyReturnReadyBundle(partial);
assert.equal(partialResult.valid, false);
assert.equal(partialResult.state, 'PARTIAL_CAPSULE_HOLD');

const hold = await compileReturnHoldReceipt({
  caseId: caseMap.case_id,
  failureClass: 'INTERRUPTED_IMPORT_HOLD',
  capsuleDigest: digest('c'),
  bundleDigest: bundle.bundle_digest,
  failedChecks: ['sandbox_import'],
  observations: ['synthetic interruption']
});
assert.equal(await verifyReturnHoldReceipt(hold), true);
assert.equal(hold.live_case_mutated, false);

const replay = await compileReturnReplayReceipt({
  caseId: caseMap.case_id,
  returnReceiptReference: 'return_fixture',
  returnReceiptDigest: digest('d'),
  anisotropyReceiptReference: 'anis_fixture',
  anisotropyReceiptDigest: digest('e'),
  returnReadyBundleDigest: bundle.bundle_digest,
  sandboxRecordFound: true
});
assert.equal(await verifyReturnReplayReceipt(replay), true);
assert.equal(replay.reconstruction_reexecuted, false);

const observation = await compileReturnProductionObservation({
  observedBaseUrl: 'http://127.0.0.1:6130',
  observedCommit: 'synthetic',
  matrix: {
    valid_return: 'PASS',
    wrong_passphrase: 'PASS',
    tamper: 'PASS',
    partial_capsule: 'PASS',
    stale_receipt: 'PASS',
    interrupted_import: 'PASS',
    replay: 'PASS'
  },
  responsiveSurfaces: { desktop: 'PASS', mobile: 'PASS', reduced_motion: 'PASS' },
  accessibility: { live_status: true, labelled_panel: true }
});
assert.equal(await verifyReturnProductionObservation(observation), true);
assert.equal(observation.promotion_authorized, false);

const passphrase = 'synthetic-return-passphrase';
const capsule = await encryptAshCapsule({
  passphrase,
  caseId: caseMap.case_id,
  savePoint: save,
  caseBundle: { caseMap, roomRules, routeMemory, returnReadyBundle: bundle }
});
await assert.rejects(() => decryptAshCapsule(capsule, 'wrong-passphrase'), /authentication failed/i);
const payload = await decryptAshCapsule(capsule, passphrase);
assert.equal((await verifyReturnReadyBundle(payload.case_bundle.returnReadyBundle)).valid, true);

console.log('Ash Custodian Return production-closure contracts: PASS');
