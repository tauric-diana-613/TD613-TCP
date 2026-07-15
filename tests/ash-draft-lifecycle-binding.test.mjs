import assert from 'node:assert/strict';
import test from 'node:test';

import {
  compileAshDraft,
  compileDraftReview,
  compileReleaseReceipt,
  releaseStillMatches
} from '../app/engine/ash-keep-drafts.js';

const mapA = `sha256:${'a'.repeat(64)}`;
const mapB = `sha256:${'b'.repeat(64)}`;
const reviewInput = {
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
};

test('draft, review, and release carry one Case Map digest', async () => {
  const draft = await compileAshDraft({
    caseId: 'case_binding',
    caseMapDigest: mapA,
    body: 'Purpose-shaped derivative.',
    selectedRoute: 'route_public_request',
    recipientClass: 'public-records-office',
    purpose: 'request-public-index',
    version: '1'
  });
  const review = await compileDraftReview({ draft, ...reviewInput });
  const release = await compileReleaseReceipt({
    draft,
    review,
    route: 'route_public_request',
    recipientClass: 'public-records-office',
    purpose: 'request-public-index',
    version: '1',
    operatorGesture: 'button:Keep Release Receipt'
  });

  assert.equal(draft.case_map_digest, mapA);
  assert.equal(review.case_map_digest, mapA);
  assert.equal(release.case_map_digest, mapA);
  assert.equal(releaseStillMatches(release, {
    caseMapDigest: mapA,
    draftDigest: draft.draft_digest,
    route: release.route,
    recipientClass: release.recipient_class,
    purpose: release.purpose,
    version: release.version
  }), true);
  assert.equal(releaseStillMatches(release, {
    caseMapDigest: mapB,
    draftDigest: draft.draft_digest,
    route: release.route,
    recipientClass: release.recipient_class,
    purpose: release.purpose,
    version: release.version
  }), false);
});

test('a review from the old Case Map cannot approve a successor draft with identical text', async () => {
  const oldDraft = await compileAshDraft({ caseId: 'case_binding', caseMapDigest: mapA, body: 'Same text.' });
  const successorDraft = await compileAshDraft({ caseId: 'case_binding', caseMapDigest: mapB, body: 'Same text.' });
  const oldReview = await compileDraftReview({ draft: oldDraft, ...reviewInput });

  assert.equal(oldDraft.draft_digest, successorDraft.draft_digest, 'content digests should match for identical text');
  await assert.rejects(() => compileReleaseReceipt({
    draft: successorDraft,
    review: oldReview,
    route: 'route_public_request',
    recipientClass: 'public-records-office',
    purpose: 'request-public-index',
    version: '1',
    operatorGesture: 'button:Keep Release Receipt'
  }), /different Case Map/);
});
