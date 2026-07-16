import { computeManifestDigest, computeReceiptDigest } from '../app/dome-world/ash/canonical-json.js';
import { compileAuthorityContext } from '../app/engine/ash-constitutional-convergence.js';
import { compileReturnReadyBundle } from '../app/engine/ash-custodian-return-closure.js';
import { compileCaseMap, compileReaderProfile, compileRebuildTest, compileRoomRules, compileRouteMemory } from '../app/engine/ash-keep-core.js';
import { compileAshDraft, compileDraftReview, compileReleaseReceipt } from '../app/engine/ash-keep-drafts.js';
import { compileSavePoint, encryptAshCapsule } from '../app/engine/ash-keep-continuity.js';
import { compileLifecycleReceipt, compileReadinessReceipt, deriveAshLifecycle } from '../app/engine/ash-lifecycle.js';

const CREATED = '2026-07-16T06:13:00.000Z';
const digest = character => `sha256:${character.repeat(64)}`;

async function compileCustodyReceipt() {
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

export async function buildSyntheticReturnFixtures() {
  const passphrase = 'td613-synthetic-return-passphrase';
  const custody = await compileCustodyReceipt();
  const readiness = await compileReadinessReceipt({
    observedAt: CREATED,
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
    caseId: 'case_synthetic_return',
    title: 'Synthetic Custodian Return',
    createdAt: CREATED,
    updatedAt: CREATED,
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
    evidenceBasis: ['synthetic production fixture']
  });
  const roomRules = await compileRoomRules({ caseId: caseMap.case_id, createdAt: CREATED, rules: [] });
  const routeMemory = await compileRouteMemory({
    caseId: caseMap.case_id,
    createdAt: CREATED,
    entries: [{
      entry_id: 'route_entry_fixture',
      draft_digest: digest('b'),
      route_id: 'route_public_request',
      purpose: 'synthetic projection',
      recipient_class: 'synthetic-reader',
      recorded_at: CREATED,
      disclosed_opaque_references: ['node_claim'],
      recall_state: 'NOT_RECALLED'
    }]
  });
  const reader = await compileReaderProfile({
    readerId: 'reader_synthetic_return',
    readerClass: 'deterministic-baseline',
    label: 'Synthetic local Reader',
    seeded: true,
    createdAt: CREATED
  });
  const rebuild = await compileRebuildTest({
    testId: 'rebuild_synthetic_return',
    createdAt: CREATED,
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
    draftId: 'draft_synthetic_return',
    createdAt: CREATED,
    caseId: caseMap.case_id,
    caseMapDigest: caseMap.case_map_digest,
    body: 'Purpose-shaped synthetic draft.',
    selectedRoute: 'route_public_request',
    recipientClass: 'synthetic-reader',
    purpose: 'synthetic projection',
    disclosedOpaqueReferences: ['node_claim']
  });
  const review = await compileDraftReview({
    reviewId: 'review_synthetic_return',
    createdAt: CREATED,
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
    receiptId: 'release_synthetic_return',
    nonce: 'nonce_synthetic_return',
    createdAt: CREATED,
    draft,
    review,
    route: 'route_public_request',
    recipientClass: 'synthetic-reader',
    purpose: 'synthetic projection',
    version: '1',
    operatorGesture: 'synthetic:Keep Release Receipt'
  });
  const save = await compileSavePoint({
    savePointId: 'save_synthetic_return',
    createdAt: CREATED,
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
  const lifecycleReceipt = await compileLifecycleReceipt(lifecycle, { observedAt: CREATED });
  const authority = await compileAuthorityContext({
    compiledAt: CREATED,
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
  const bundleInput = {
    createdAt: CREATED,
    bundleId: 'return_bundle_synthetic',
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
  };
  const validBundle = await compileReturnReadyBundle(bundleInput);
  const staleBundle = await compileReturnReadyBundle({
    ...bundleInput,
    bundleId: 'return_bundle_stale',
    selected: { ...bundleInput.selected, releaseReference: 'release_stale_reference' }
  });
  const tamperedBundle = { ...validBundle, case_map: { ...validBundle.case_map, title: 'Tampered after sealing' } };

  const validCapsule = await encryptAshCapsule({
    passphrase,
    createdAt: CREATED,
    caseId: caseMap.case_id,
    savePoint: save,
    caseBundle: { caseMap, roomRules, routeMemory, returnReadyBundle: validBundle }
  });
  const staleCapsule = await encryptAshCapsule({
    passphrase,
    createdAt: CREATED,
    caseId: caseMap.case_id,
    savePoint: save,
    caseBundle: { caseMap, roomRules, routeMemory, returnReadyBundle: staleBundle }
  });
  const tamperedCapsule = await encryptAshCapsule({
    passphrase,
    createdAt: CREATED,
    caseId: caseMap.case_id,
    savePoint: save,
    caseBundle: { caseMap, roomRules, routeMemory, returnReadyBundle: tamperedBundle }
  });
  const partialCapsule = await encryptAshCapsule({
    passphrase,
    createdAt: CREATED,
    caseId: caseMap.case_id,
    savePoint: save,
    caseBundle: { caseMap, roomRules, routeMemory }
  });

  return Object.freeze({
    passphrase,
    caseId: caseMap.case_id,
    permittedReferences: ['node_claim', 'node_hypothesis'],
    validCapsule,
    staleCapsule,
    tamperedCapsule,
    partialCapsule,
    validBundle
  });
}
