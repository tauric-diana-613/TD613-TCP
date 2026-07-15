import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ASH_CASE_STATES,
  ASH_RUNTIME_PERMISSIONS,
  authorizeAuthorityAction,
  STALE_AUTHORITY_TARGETS,
  compileAuthorityContext,
  compileCaseStateTransition,
  compileCompatibilityAudit,
  compileCompositionManifest,
  compileDeletionPlan,
  compileDeletionReceipt,
  compileInvalidationReceipt,
  deriveCaseState,
  verifyAuthorityContext
} from '../app/engine/ash-constitutional-convergence.js';

test('runtime permissions require a current Authority Context at the declared lifecycle rank', () => {
  const context = {
    current: true,
    case_id: 'case_demo',
    case_map_digest: 'sha256:map',
    lifecycle_rank: 'REBUILD_ELIGIBLE',
    receipt_id: 'ash_authority_demo',
    authority_context_digest: 'sha256:authority'
  };
  assert.equal(ASH_RUNTIME_PERMISSIONS.HUSH_CANDIDATE, 'REBUILD_ELIGIBLE');
  assert.equal(authorizeAuthorityAction(context, 'HUSH_CANDIDATE').authorized, true);
  assert.equal(authorizeAuthorityAction({ ...context, lifecycle_rank: 'CASE_BOUND' }, 'HUSH_CANDIDATE').authorized, false);
  assert.equal(authorizeAuthorityAction({ ...context, current: false }, 'APERTURE_REBUILD').authorized, false);
});

test('constitutional composition preserves the canonical organ order', async () => {
  const manifest = await compileCompositionManifest({ composedAt: '2026-07-15T00:00:00.000Z' });
  assert.deepEqual(manifest.layers.map(layer => layer.layer_id), [
    'dome-threshold', 'quick-scan', 'custody-root', 'keep-core', 'lifecycle', 'custody-workspace-bridges',
    'controls-mobile', 'flowcore-adapter', 'aperture-adapter', 'hush-adapter', 'observer'
  ]);
  assert.equal(manifest.transport_enabled, false);
  assert.equal(manifest.automatic_cinder_enabled, false);
  assert.match(manifest.manifest_digest, /^sha256:/);
});

test('case state derivation keeps selection, closure, deletion, and saving distinct', async () => {
  assert.equal(deriveCaseState({}), ASH_CASE_STATES.EPHEMERAL_CURRENT);
  assert.equal(deriveCaseState({ currentCaseId: 'c1', persisted: true }), ASH_CASE_STATES.CURRENT_UNSAVED);
  assert.equal(deriveCaseState({ currentCaseId: 'c1', persisted: true, saved: true }), ASH_CASE_STATES.CURRENT_SAVED);
  assert.equal(deriveCaseState({ currentCaseId: 'c1', persisted: true, closed: true }), ASH_CASE_STATES.CLOSED_CURRENT_UNSAVED);
  assert.equal(deriveCaseState({ currentCaseId: 'c1', persisted: true, saved: true, closed: true }), ASH_CASE_STATES.CLOSED_SAVED);
  assert.equal(deriveCaseState({ currentCaseId: 'c1', selectedCaseId: 'c2' }), ASH_CASE_STATES.SELECTED_NOT_OPEN);
  assert.equal(deriveCaseState({ deletionPending: true }), ASH_CASE_STATES.DELETION_PENDING);
  assert.equal(deriveCaseState({ deleted: true }), ASH_CASE_STATES.DELETED_LOCAL);
  assert.equal(deriveCaseState({ deletePartial: true }), ASH_CASE_STATES.DELETE_PARTIAL_HOLD);
  const transition = await compileCaseStateTransition({ caseId: 'c1', nextState: ASH_CASE_STATES.CURRENT_SAVED, reason: 'test', observedAt: '2026-07-15T00:00:00.000Z' });
  assert.match(transition.transition_digest, /^sha256:/);
});

test('Authority Context is rank-conditioned and verifies against current local digests', async () => {
  const context = await compileAuthorityContext({
    lifecycleRank: 'CONTINUITY_SEALED',
    readinessReceiptReference: 'ready_1',
    custodyRootReceiptReference: 'custody_1',
    caseId: 'case_1',
    caseMapDigest: 'sha256:map',
    routeMemoryDigest: 'sha256:route',
    rebuildReceiptReference: 'test_1',
    currentReviewReference: 'review_1',
    currentReleaseReference: 'release_1',
    currentContinuityReference: 'save_1',
    compiledAt: '2026-07-15T00:00:00.000Z'
  });
  assert.equal(await verifyAuthorityContext(context, { caseId: 'case_1', caseMapDigest: 'sha256:map', routeMemoryDigest: 'sha256:route' }), true);
  assert.equal(await verifyAuthorityContext(context, { caseId: 'case_1', caseMapDigest: 'sha256:changed' }), false);
  const readiness = await compileAuthorityContext({ lifecycleRank: 'READINESS_OBSERVED', readinessReceiptReference: 'ready_1', compiledAt: '2026-07-15T00:00:00.000Z' });
  assert.equal(readiness.case_id, null);
  assert.equal(readiness.custody_root_receipt_reference, null);
  assert.equal(readiness.rebuild_receipt_reference, null);
});

test('map mutation invalidates every downstream authority surface without deleting history', async () => {
  const receipt = await compileInvalidationReceipt({
    caseId: 'case_1',
    previousAuthorityContextReference: 'authority_old',
    successorAuthorityContextReference: 'authority_new',
    previousCaseMapDigest: 'sha256:old',
    successorCaseMapDigest: 'sha256:new',
    changedDimensions: ['CASE_MAP'],
    invalidatedAt: '2026-07-15T00:00:00.000Z'
  });
  assert.deepEqual(receipt.invalidated_targets, [...STALE_AUTHORITY_TARGETS]);
  assert.equal(receipt.stale_records_preserved, true);
});

test('deletion receipts preserve local scope and partial recovery', async () => {
  const plan = await compileDeletionPlan({
    caseId: 'case_1',
    caseTitle: 'Synthetic case',
    inventory: { cases: ['case_1'], drafts: ['draft_1'] },
    capsuleReminderPresented: true,
    plannedAt: '2026-07-15T00:00:00.000Z'
  });
  const partial = await compileDeletionReceipt({ plan, status: 'DELETE_PARTIAL_HOLD', remainingOrphans: [{ store: 'drafts', reference: 'draft_1' }], completedAt: '2026-07-15T00:01:00.000Z' });
  assert.equal(partial.recovery_available, true);
  assert.equal(partial.external_erasure_performed, false);
  const complete = await compileDeletionReceipt({ plan, status: 'DELETED_LOCAL', deletedCount: 2, completedAt: '2026-07-15T00:02:00.000Z' });
  assert.equal(complete.recovery_available, false);
});

test('compatibility audit reports without migration or mutation', async () => {
  const audit = await compileCompatibilityAudit({
    caseMaps: [{ case_id: 'case_1', nodes: [{ custody_reference: 'a' }, { custody_reference: 'b' }] }],
    drafts: [],
    reviews: [{ review_id: 'review_orphan', draft_id: 'missing' }],
    releases: [],
    savePoints: [{ save_point_id: 'save_bad', case_id: 'case_1' }],
    savedCases: [{ case_id: 'case_missing', fingerprint_current: false }],
    lifecycleCaseIds: [],
    deletedPointers: ['case_deleted'],
    observedAt: '2026-07-15T00:00:00.000Z'
  });
  assert.deepEqual(new Set(audit.findings.map(item => item.code)), new Set(['MALFORMED_SAVE_POINT', 'DUPLICATE_CUSTODY_ROOT', 'ORPHAN_REVIEW', 'STALE_SAVED_FINGERPRINT', 'MISSING_LIFECYCLE_ROW', 'DELETED_CASE_POINTER']));
  assert.equal(audit.mutation_performed, false);
  assert.equal(audit.migration_performed, false);
});
