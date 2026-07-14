import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  compileAshDraft,
  compileDraftReview,
  compileReleaseReceipt,
  releaseStillMatches,
  verifyAshDraft,
  verifyDraftReview,
  verifyReleaseReceipt
} from '../app/engine/ash-keep-drafts.js';
import {
  MIN_PBKDF2_ITERATIONS,
  compileSavePoint,
  decryptAshCapsule,
  encryptAshCapsule,
  verifySavePoint
} from '../app/engine/ash-keep-continuity.js';

const options = { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder, TextDecoderImpl: TextDecoder };
const DIGEST_A = `sha256:${'a'.repeat(64)}`;
const DIGEST_B = `sha256:${'b'.repeat(64)}`;
const draft = await compileAshDraft({
  draftId: 'draft_glasshouse',
  caseId: 'case_glasshouse',
  body: 'Please provide the public index for the synthetic archive.',
  version: '1',
  selectedRoute: 'route_public',
  recipientClass: 'public records office',
  purpose: 'request public index',
  disclosedOpaqueReferences: ['node_archive']
}, options);
assert.equal(await verifyAshDraft(draft, options), true);
assert.equal(draft.recipient_transmission_approved, false);

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
}, options);
assert.equal(review.status, 'READY_FOR_LOCAL_RELEASE_APPROVAL');
assert.equal(review.recipient_transmission_approved, false);
assert.equal(await verifyDraftReview(review, options), true);

const releaseInput = {
  draft,
  review,
  receiptId: 'release_glasshouse',
  route: 'route_public',
  recipientClass: 'public records office',
  purpose: 'request public index',
  version: '1',
  nonce: 'nonce_glasshouse',
  operatorGesture: 'operator pressed Keep Release Receipt'
};
const release = await compileReleaseReceipt(releaseInput, options);
assert.equal(await verifyReleaseReceipt(release, options), true);
assert.equal(release.transmission_performed, false);
assert.equal(releaseStillMatches(release, {
  draftDigest: draft.draft_digest,
  route: 'route_public',
  recipientClass: 'public records office',
  purpose: 'request public index',
  version: '1'
}), true);
assert.equal(releaseStillMatches(release, { draftDigest: draft.draft_digest, route: 'route_other', recipientClass: 'public records office', purpose: 'request public index', version: '1' }), false);
await assert.rejects(compileReleaseReceipt({ ...releaseInput, usedNonces: ['nonce_glasshouse'] }, options), /already been used/);

const savePoint = await compileSavePoint({
  savePointId: 'save_glasshouse',
  caseId: 'case_glasshouse',
  caseMapDigest: DIGEST_A,
  routeMemoryDigest: DIGEST_B,
  evidenceInventory: ['synthetic archive index'],
  unansweredQuestions: ['which revision introduced the difference?'],
  nextStepPosture: ['request public index']
}, options);
assert.equal(await verifySavePoint(savePoint, options), true);

const capsule = await encryptAshCapsule({
  caseId: 'case_glasshouse',
  passphrase: 'correct horse battery staple',
  iterations: MIN_PBKDF2_ITERATIONS,
  savePoint,
  caseBundle: { case_map_digest: DIGEST_A, route_memory_digest: DIGEST_B }
}, options);
assert.equal(capsule.cipher, 'AES-256-GCM');
assert.equal(capsule.iv_bytes, 12);
assert.equal(capsule.salt_bytes, 16);
assert.equal(capsule.recipient_transport, 'DEFERRED');
assert.equal(Object.hasOwn(capsule, 'passphrase'), false);
const opened = await decryptAshCapsule(capsule, 'correct horse battery staple', options);
assert.equal(opened.case_id, 'case_glasshouse');
assert.equal(opened.save_point.save_point_digest, savePoint.save_point_digest);
await assert.rejects(decryptAshCapsule(capsule, 'incorrect passphrase', options), /nothing was imported/);
const tamperedCapsule = structuredClone(capsule);
tamperedCapsule.ciphertext = `${tamperedCapsule.ciphertext.slice(0, -2)}AA`;
await assert.rejects(decryptAshCapsule(tamperedCapsule, 'correct horse battery staple', options), /verification failed/);

console.log('ash-keep-continuity.test.mjs passed');
