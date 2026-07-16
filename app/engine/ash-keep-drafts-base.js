import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId, text } from './aperture-v31-core.js';

export const ASH_DRAFT_SCHEMA = 'td613.ash.ash-draft/v0.1';
export const DRAFT_REVIEW_SCHEMA = 'td613.ash.draft-review/v0.1';
export const RELEASE_RECEIPT_SCHEMA = 'td613.ash.release-receipt/v0.1';

const DOMAINS = Object.freeze({
  draft: 'TD613:ASH-KEEP:DRAFT:v1',
  review: 'TD613:ASH-KEEP:DRAFT-REVIEW:v1',
  release: 'TD613:ASH-KEEP:RELEASE:v1',
  content: 'TD613:ASH-KEEP:DRAFT-CONTENT:v1'
});
const SHA256 = /^sha256:[0-9a-f]{64}$/;

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function now(value) {
  return value || new Date().toISOString();
}

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

async function seal(domain, value, field, options) {
  value[field] = await canonicalDigest(domain, without(value, field), options);
  return freeze(value);
}

async function verify(domain, value, field, schema, options) {
  if (!value || value.schema !== schema || !SHA256.test(String(value[field] || ''))) return false;
  return value[field] === await canonicalDigest(domain, without(value, field), options);
}

function optionalDigest(value, label) {
  if (value == null || value === '') return null;
  const digest = String(value);
  if (!SHA256.test(digest)) throw new Error(`${label} must be a SHA-256 digest.`);
  return digest;
}

export async function compileAshDraft(input = {}, options = {}) {
  const body = text(input.body, 'Draft body');
  const contentDigest = await canonicalDigest(DOMAINS.content, { body }, options);
  const record = {
    schema: ASH_DRAFT_SCHEMA,
    draft_id: input.draftId || randomId('draft_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    case_map_digest: optionalDigest(input.caseMapDigest, 'Case Map digest'),
    created_at: now(input.createdAt),
    version: String(input.version || '1'),
    body,
    draft_digest: contentDigest,
    selected_route: input.selectedRoute ? String(input.selectedRoute) : null,
    recipient_class: input.recipientClass ? String(input.recipientClass) : null,
    purpose: input.purpose ? String(input.purpose) : null,
    disclosed_opaque_references: unique(input.disclosedOpaqueReferences || []),
    room_ids: unique(input.roomIds || []),
    transformations: unique(input.transformations || []),
    available_actions: ['REDACT', 'PARAPHRASE', 'GENERALIZE', 'OMIT', 'SEPARATE_ROOMS', 'STRUCTURAL_SURROGATE', 'KEEP_LOCAL'],
    provider_generation_approved: false,
    local_export_approved: false,
    recipient_transmission_approved: false,
    source_status: 'SUPPLIED',
    evidence_basis: unique(input.evidenceBasis || []),
    observations: clone(input.observations || []),
    missingness: unique(input.missingness || []),
    alternatives: unique(input.alternatives || []),
    open_questions: unique(input.openQuestions || []),
    operator_notes: unique(input.operatorNotes || []),
    closure: { required: true, status: 'OPEN' },
    record_digest: null
  };
  return seal(DOMAINS.draft, record, 'record_digest', options);
}

export const verifyAshDraft = (value, options = {}) => verify(DOMAINS.draft, value, 'record_digest', ASH_DRAFT_SCHEMA, options);

export async function compileDraftReview(input = {}, options = {}) {
  if (!input.draft || !(await verifyAshDraft(input.draft, options))) throw new Error('Draft review requires an untampered Ash Draft.');
  const checks = {
    valid_custody: Boolean(input.validCustody),
    sufficient_test_coverage: Boolean(input.sufficientTestCoverage),
    unresolved_tamper: Boolean(input.unresolvedTamper),
    explicit_review: Boolean(input.explicitReview),
    protected_identity_reviewed: Boolean(input.protectedIdentityReviewed),
    confidential_passages_reviewed: Boolean(input.confidentialPassagesReviewed),
    metadata_reviewed: Boolean(input.metadataReviewed),
    source_references_reviewed: Boolean(input.sourceReferencesReviewed),
    prompt_injection_reviewed: Boolean(input.promptInjectionReviewed),
    route_history_reviewed: Boolean(input.routeHistoryReviewed),
    room_bridges_reviewed: Boolean(input.roomBridgesReviewed),
    chronology_reviewed: Boolean(input.chronologyReviewed),
    hush_link_check_reviewed: Boolean(input.hushLinkCheckReviewed)
  };
  const required = Object.entries(checks).filter(([key]) => key !== 'unresolved_tamper');
  const ready = required.every(([, value]) => value) && checks.unresolved_tamper === false;
  const record = {
    schema: DRAFT_REVIEW_SCHEMA,
    review_id: input.reviewId || randomId('review_', options.cryptoImpl || globalThis.crypto),
    draft_id: input.draft.draft_id,
    draft_digest: input.draft.draft_digest,
    case_map_digest: input.draft.case_map_digest || null,
    created_at: now(input.createdAt),
    checks,
    status: ready ? 'READY_FOR_LOCAL_RELEASE_APPROVAL' : 'REVIEW_HELD',
    protective_actions: unique(input.protectiveActions || []),
    affected_room_ids: unique(input.affectedRoomIds || []),
    route_recommendation: input.routeRecommendation ? String(input.routeRecommendation) : null,
    approval_scope: ready ? String(input.approvalScope || 'LOCAL_EXPORT') : 'NONE',
    provider_generation_approved: ready && input.approvalScope === 'PROVIDER_GENERATION',
    local_export_approved: ready && input.approvalScope !== 'PROVIDER_GENERATION',
    recipient_transmission_approved: false,
    observations: clone(input.observations || []),
    missingness: required.filter(([, value]) => !value).map(([key]) => key),
    alternatives: unique(input.alternatives || []),
    open_questions: unique(input.openQuestions || []),
    operator_notes: unique(input.operatorNotes || []),
    closure: { required: true, status: ready ? 'REVIEWED' : 'OPEN' },
    review_digest: null
  };
  return seal(DOMAINS.review, record, 'review_digest', options);
}

export const verifyDraftReview = (value, options = {}) => verify(DOMAINS.review, value, 'review_digest', DRAFT_REVIEW_SCHEMA, options);

export async function compileReleaseReceipt(input = {}, options = {}) {
  if (!input.draft || !(await verifyAshDraft(input.draft, options))) throw new Error('Release Receipt requires an untampered Ash Draft.');
  if (!input.review || !(await verifyDraftReview(input.review, options))) throw new Error('Release Receipt requires an untampered review.');
  if (input.review.status !== 'READY_FOR_LOCAL_RELEASE_APPROVAL' || !input.review.local_export_approved) throw new Error('Review has not approved local export.');
  if (input.review.draft_digest !== input.draft.draft_digest) throw new Error('Review is bound to a different draft.');
  if (input.review.case_map_digest !== input.draft.case_map_digest) throw new Error('Review is bound to a different Case Map.');
  const route = text(input.route, 'Release route');
  const recipientClass = text(input.recipientClass, 'Recipient class');
  const purpose = text(input.purpose, 'Release purpose');
  const version = text(input.version || input.draft.version, 'Draft version');
  const nonce = input.nonce || randomId('nonce_', options.cryptoImpl || globalThis.crypto);
  if ((input.usedNonces || []).includes(nonce)) throw new Error('Release nonce has already been used.');
  const record = {
    schema: RELEASE_RECEIPT_SCHEMA,
    receipt_id: input.receiptId || randomId('release_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    case_id: input.draft.case_id,
    case_map_digest: input.draft.case_map_digest || null,
    draft_id: input.draft.draft_id,
    draft_digest: input.draft.draft_digest,
    review_reference: input.review.review_id,
    route,
    recipient_class: recipientClass,
    purpose,
    version,
    nonce,
    operator_gesture: text(input.operatorGesture, 'Operator gesture'),
    approval_scope: 'LOCAL_EXPORT',
    recipient_transport: 'DEFERRED',
    transmission_performed: false,
    immutable_successor_required_on_change: true,
    observations: ['Exact draft, Case Map, route, recipient class, purpose, version, nonce, and operator gesture are bound.'],
    missingness: [],
    alternatives: [],
    open_questions: [],
    operator_notes: unique(input.operatorNotes || []),
    closure: { required: true, status: 'APPROVED_FOR_LOCAL_EXPORT' },
    receipt_digest: null
  };
  return seal(DOMAINS.release, record, 'receipt_digest', options);
}

export const verifyReleaseReceipt = (value, options = {}) => verify(DOMAINS.release, value, 'receipt_digest', RELEASE_RECEIPT_SCHEMA, options);

export function releaseStillMatches(receipt, { caseMapDigest, draftDigest, route, recipientClass, purpose, version } = {}) {
  return Boolean(receipt &&
    (caseMapDigest == null || receipt.case_map_digest === caseMapDigest) &&
    receipt.draft_digest === draftDigest &&
    receipt.route === route &&
    receipt.recipient_class === recipientClass &&
    receipt.purpose === purpose &&
    receipt.version === version);
}
