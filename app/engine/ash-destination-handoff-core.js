import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';

export const DESTINATION_HANDOFF_PLAN_SCHEMA = 'td613.ash.destination-handoff/v0.1';
export const DESTINATION_HANDOFF_AUTHORIZATION_SCHEMA = 'td613.ash.destination-handoff-authorization/v0.1';
export const DESTINATION_HANDOFF_ATTEMPT_SCHEMA = 'td613.ash.destination-handoff-attempt/v0.1';
export const DESTINATION_HANDOFF_RECIPIENT_RECEIPT_SCHEMA = 'td613.ash.destination-handoff-recipient-receipt/v0.1';
export const DESTINATION_HANDOFF_ROLLBACK_SCHEMA = 'td613.ash.destination-handoff-rollback/v0.1';
export const DESTINATION_HANDOFF_CUSTODY_ACCOUNTING_SCHEMA = 'td613.ash.destination-handoff-custody-accounting/v0.1';
export const DESTINATION_HANDOFF_REPLAY_SCHEMA = 'td613.ash.destination-handoff-replay/v0.1';

export const DESTINATION_HANDOFF_DOMAINS = freeze({
  plan: 'TD613:ASH:DESTINATION-HANDOFF-PLAN:v1',
  authorization: 'TD613:ASH:DESTINATION-HANDOFF-AUTHORIZATION:v1',
  attempt: 'TD613:ASH:DESTINATION-HANDOFF-ATTEMPT:v1',
  recipientReceipt: 'TD613:ASH:DESTINATION-HANDOFF-RECIPIENT-RECEIPT:v1',
  rollback: 'TD613:ASH:DESTINATION-HANDOFF-ROLLBACK:v1',
  custodyAccounting: 'TD613:ASH:DESTINATION-HANDOFF-CUSTODY-ACCOUNTING:v1',
  replay: 'TD613:ASH:DESTINATION-HANDOFF-REPLAY:v1'
});

export const SHA256 = /^sha256:[0-9a-f]{64}$/;
export const SUPPORTED_ROUTE = 'SAME_ORIGIN_MESSAGE_CHANNEL';
const ALLOWED_REFERENCE_CLASSES = new Set([
  'ARTIFACT_DIGEST', 'MANIFEST_DIGEST', 'RECEIPT_DIGEST', 'SIGNATURE_LANE_STATEMENT',
  'REPOSITORY_REFERENCE', 'PROVIDER_RESPONSE_REFERENCE', 'CUSTODY_ROOT_REFERENCE',
  'CASE_RELATION_REFERENCE', 'OPERATOR_DECLARATION', 'EXTERNAL_TIME_CLAIM',
  'RECIPIENT_DESTINATION_DECLARATION'
]);
export const ATTEMPT_OUTCOMES = new Set(['DELIVERED', 'REFUSED', 'TIMEOUT', 'PARTIAL', 'CANCELLED']);
export const RECEIPT_POSTURES = new Set(['ACCEPTED', 'REFUSED']);

const without = (value, field) => { const output = clone(value); delete output[field]; return output; };
export const strings = values => [...new Set((values || []).map(value => String(value).trim()).filter(Boolean))].sort();
export const upper = value => String(value || '').trim().toUpperCase();
export const text = value => String(value || '').trim();
const safeInt = (value, fallback = 0) => Number.isSafeInteger(value) ? value : fallback;
const digestOrNull = value => SHA256.test(String(value || '')) ? String(value) : null;
export const seal = (domain, value, field, options) => canonicalDigest(domain, without(value, field), options);
export const exactArray = values => strings(values);
export const sameArray = (left, right) => JSON.stringify(exactArray(left)) === JSON.stringify(exactArray(right));

export function baseCeiling() {
  return {
    raw_body_present: false,
    raw_corpus_present: false,
    universal_join_key: null,
    universal_trust_score: null,
    identity_inferred: false,
    authorship_inferred: false,
    permission_inferred: false,
    authenticity_inferred: false,
    truth_inferred: false,
    relation_inferred: false,
    custody_inferred: false,
    causation_inferred: false,
    trusted_external_time_used: false,
    recipient_behavior_inferred: false,
    broadcast_authorized: false,
    universal_transport_authorized: false,
    reuse_authorized: false,
    external_deletion_proven: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    recommendation_not_command: true
  };
}

function planState(failures) {
  if (failures.includes('cancelled-operator-action')) return 'CANCELLED_HOLD';
  if (failures.some(value => /tamper|digest-mismatch|malformed-digest/.test(value))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('wrong-domain'))) return 'WRONG_DOMAIN_HOLD';
  if (failures.some(value => value.includes('missing-destination') || value.includes('unsupported-route'))) return 'DESTINATION_HOLD';
  if (failures.some(value => value.includes('missing-recipient'))) return 'RECIPIENT_HOLD';
  if (failures.some(value => value.includes('recipient-mismatch'))) return 'RECIPIENT_MISMATCH_HOLD';
  if (failures.some(value => /scope|raw-body|raw-corpus|unsupported-reference/.test(value))) return 'SCOPE_HOLD';
  if (failures.some(value => /provenance|custody|stale|revoked|collision/.test(value))) return 'PROVENANCE_HOLD';
  if (failures.some(value => /expiry|expired/.test(value))) return 'EXPIRY_HOLD';
  return 'DESTINATION_HANDOFF_PLAN_ELIGIBLE';
}

export function authorizationState(failures) {
  const plan = planState(failures);
  if (plan !== 'DESTINATION_HANDOFF_PLAN_ELIGIBLE') return plan;
  if (failures.some(value => value.includes('recipient-refusal'))) return 'REFUSAL_HOLD';
  if (failures.some(value => value.includes('missing-operator-authorization'))) return 'CANCELLED_HOLD';
  return 'DESTINATION_HANDOFF_AUTHORIZED';
}

export function attemptState(failures, outcome) {
  const authorization = authorizationState(failures);
  if (authorization !== 'DESTINATION_HANDOFF_AUTHORIZED') return authorization;
  if (failures.some(value => value.includes('duplicate-attempt'))) return 'DUPLICATE_HOLD';
  if (outcome === 'REFUSED') return 'REFUSAL_HOLD';
  if (outcome === 'TIMEOUT') return 'TIMEOUT_HOLD';
  if (outcome === 'PARTIAL') return 'PARTIAL_DELIVERY_HOLD';
  if (outcome === 'CANCELLED') return 'CANCELLED_HOLD';
  return 'DELIVERY_EXECUTED_AWAITING_RECEIPT';
}

export function receiptState(failures, posture) {
  if (failures.includes('cancelled-operator-action')) return 'CANCELLED_HOLD';
  if (failures.some(value => /tamper|digest-mismatch|malformed-digest/.test(value))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('wrong-domain'))) return 'WRONG_DOMAIN_HOLD';
  if (failures.some(value => value.includes('recipient-mismatch'))) return 'RECIPIENT_MISMATCH_HOLD';
  if (failures.some(value => /scope|reference/.test(value))) return 'RECEIPT_HOLD';
  if (posture === 'REFUSED') return 'REFUSAL_HOLD';
  return 'RECIPIENT_RECEIPT_VERIFIED';
}

export function rollbackState(failures) {
  if (failures.includes('cancelled-operator-action')) return 'CANCELLED_HOLD';
  if (failures.some(value => /tamper|digest-mismatch/.test(value))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('rollback-failure'))) return 'ROLLBACK_HOLD';
  return 'ROLLBACK_COMPLETE';
}

export function accountingState(failures, completed) {
  if (failures.some(value => /tamper|digest-mismatch/.test(value))) return 'TAMPER_HOLD';
  if (failures.some(value => /receipt/.test(value))) return 'RECEIPT_HOLD';
  if (failures.some(value => /rollback/.test(value))) return 'ROLLBACK_HOLD';
  return completed ? 'DESTINATION_HANDOFF_COMPLETE' : 'DESTINATION_HANDOFF_HELD_ACCOUNTED';
}

function normalizeReference(reference = {}) {
  return {
    reference_id: text(reference.referenceId || reference.reference_id),
    evidence_class: upper(reference.evidenceClass || reference.evidence_class),
    source_id: text(reference.sourceId || reference.source_id),
    source_local_reference: text(reference.sourceLocalReference || reference.source_local_reference),
    verification_reference: text(reference.verificationReference || reference.verification_reference),
    verification_digest: digestOrNull(reference.verificationDigest || reference.verification_digest)
  };
}

function referenceFailures(references) {
  const failures = [];
  if (!references.length) failures.push('scope-missing-reference-manifest');
  const ids = references.map(value => value.reference_id);
  if (new Set(ids).size !== ids.length) failures.push('scope-duplicate-reference');
  for (const reference of references) {
    if (!reference.reference_id) failures.push('scope-missing-reference-id');
    if (!ALLOWED_REFERENCE_CLASSES.has(reference.evidence_class)) failures.push(`unsupported-reference-class:${reference.evidence_class || '(empty)'}`);
    if (!reference.source_id) failures.push('provenance-missing-source-id');
    if (!reference.source_local_reference) failures.push('provenance-missing-source-local-reference');
    if (!reference.verification_reference) failures.push('provenance-missing-verification-reference');
    if (!reference.verification_digest) failures.push('malformed-digest:verification');
  }
  return failures;
}

export async function verifyRecord(domain, value, field, schema, options = {}) {
  return Boolean(value && value.schema === schema && SHA256.test(String(value[field] || '')) && value[field] === await seal(domain, value, field, options));
}

export async function compileDestinationHandoffPlan(input = {}, options = {}) {
  const failures = [];
  const destinationId = text(input.destinationId);
  const destinationClass = text(input.destinationClass || 'SAME_ORIGIN_STATIC_RECIPIENT');
  const destinationRoute = upper(input.destinationRoute || SUPPORTED_ROUTE);
  const destinationOrigin = text(input.destinationOrigin || 'SAME_ORIGIN');
  const recipientId = text(input.recipientId);
  const expectedRecipientId = text(input.expectedRecipientId || recipientId);
  const recipientClass = text(input.recipientClass || 'NAMED_SYNTHETIC_CUSTODY_RECIPIENT');
  const recipientPosture = upper(input.recipientPosture || 'READY');
  const references = (input.references || []).map(normalizeReference).sort((a, b) => a.reference_id.localeCompare(b.reference_id));
  const referenceIds = references.map(value => value.reference_id);
  const custodyRootDigest = digestOrNull(input.custodyRootDigest);
  const custodyRootReference = text(input.custodyRootReference);
  const issuedAt = text(input.issuedAt || input.createdAt || new Date().toISOString());
  const expiresAt = text(input.expiresAt);
  const elapsedMs = safeInt(input.elapsedMs, 0);
  const expiryLimitMs = safeInt(input.expiryLimitMs, 300000);

  if (!destinationId) failures.push('missing-destination');
  if (destinationRoute !== SUPPORTED_ROUTE) failures.push(`unsupported-route:${destinationRoute || '(empty)'}`);
  if (!recipientId) failures.push('missing-recipient');
  if (recipientId && expectedRecipientId && recipientId !== expectedRecipientId) failures.push('recipient-mismatch');
  if (recipientPosture === 'REFUSED') failures.push('recipient-refusal');
  if (input.rawBodyIncluded === true) failures.push('scope-raw-body-present');
  if (input.rawCorpusIncluded === true) failures.push('scope-raw-corpus-present');
  failures.push(...referenceFailures(references));
  if (!custodyRootReference) failures.push('custody-missing-root-reference');
  if (!input.custodyRootDigest) failures.push('custody-missing-root-digest');
  else if (!custodyRootDigest) failures.push('malformed-digest:custody-root');
  if (input.provenanceCurrent !== true) failures.push('provenance-not-current');
  if (safeInt(input.staleReferenceCount, 0) > 0) failures.push('stale-provenance-reference');
  if (safeInt(input.revokedReferenceCount, 0) > 0) failures.push('revoked-provenance-reference');
  if (safeInt(input.collisionCount, 0) > 0) failures.push('collision-provenance-reference');
  if (input.revoked === true) failures.push('revoked-handoff');
  if (elapsedMs > expiryLimitMs) failures.push('expired-handoff-posture');
  if (input.cancelled === true) failures.push('cancelled-operator-action');
  if (input.declaredDigestDomain && input.declaredDigestDomain !== DESTINATION_HANDOFF_DOMAINS.plan) failures.push('wrong-domain:plan');

  const failedChecks = strings(failures);
  const state = planState(failedChecks);
  const record = {
    schema: DESTINATION_HANDOFF_PLAN_SCHEMA,
    version: 'v0.1',
    handoff_id: input.handoffId || randomId('ashhandoff_', options.cryptoImpl || globalThis.crypto),
    created_at: text(input.createdAt || new Date().toISOString()),
    destination: {
      destination_id: destinationId || null,
      destination_class: destinationClass,
      destination_route: destinationRoute || null,
      destination_origin: destinationOrigin,
      destination_declaration_reference: text(input.destinationDeclarationReference) || null,
      destination_declaration_digest: digestOrNull(input.destinationDeclarationDigest)
    },
    recipient: {
      recipient_id: recipientId || null,
      expected_recipient_id: expectedRecipientId || null,
      recipient_class: recipientClass,
      recipient_match_basis: text(input.recipientMatchBasis || 'EXACT_DECLARED_RECIPIENT_ID'),
      recipient_posture: recipientPosture,
      recipient_declaration_reference: text(input.recipientDeclarationReference) || null,
      recipient_declaration_digest: digestOrNull(input.recipientDeclarationDigest)
    },
    scope: {
      manifest_id: text(input.manifestId || 'manifest:destination-handoff') || null,
      purpose: text(input.purpose || 'BOUNDED_DESTINATION_HANDOFF'),
      version: text(input.scopeVersion || '1'),
      references,
      reference_ids: referenceIds,
      reference_count: references.length,
      maximum_reference_count: safeInt(input.maximumReferenceCount, 16),
      declared_byte_ceiling: safeInt(input.declaredByteCeiling, 16384),
      raw_body_present: false,
      raw_corpus_present: false
    },
    prerequisites: {
      custody_root_reference: custodyRootReference || null,
      custody_root_digest: custodyRootDigest,
      provenance_current: input.provenanceCurrent === true,
      provenance_verification_digests: exactArray(references.map(value => value.verification_digest)),
      stale_reference_count: safeInt(input.staleReferenceCount, 0),
      revoked_reference_count: safeInt(input.revokedReferenceCount, 0),
      collision_count: safeInt(input.collisionCount, 0)
    },
    expiry: {
      issued_at: issuedAt,
      expires_at: expiresAt || null,
      elapsed_ms: elapsedMs,
      expiry_limit_ms: expiryLimitMs,
      expired: elapsedMs > expiryLimitMs,
      revoked: input.revoked === true,
      revocation_reference: text(input.revocationReference) || null,
      trusted_external_time_used: false
    },
    checks: {
      destination_named: Boolean(destinationId),
      route_supported: destinationRoute === SUPPORTED_ROUTE,
      recipient_named: Boolean(recipientId),
      recipient_exact_match: Boolean(recipientId && expectedRecipientId && recipientId === expectedRecipientId),
      scope_nonempty: references.length > 0,
      raw_body_absent: input.rawBodyIncluded !== true,
      raw_corpus_absent: input.rawCorpusIncluded !== true,
      custody_root_current: Boolean(custodyRootReference && custodyRootDigest),
      provenance_current: input.provenanceCurrent === true,
      expiry_open: elapsedMs <= expiryLimitMs && input.revoked !== true
    },
    state,
    plan_eligible: state === 'DESTINATION_HANDOFF_PLAN_ELIGIBLE',
    failed_checks: failedChecks,
    missingness: strings(input.missingness || failedChecks.filter(value => value.includes('missing'))),
    operator_notes: strings(input.operatorNotes),
    closure: { required: true, status: text(input.closureStatus || 'OPEN') },
    transport_capability_class: 'NAMED_SAME_ORIGIN_MESSAGE_CHANNEL_ONLY',
    ...baseCeiling(),
    destination_transport_authorized: false,
    release_authorized: false,
    plan_digest: null
  };
  record.plan_digest = await seal(DESTINATION_HANDOFF_DOMAINS.plan, record, 'plan_digest', options);
  return freeze(record);
}

export const verifyDestinationHandoffPlan = (value, options = {}) => verifyRecord(DESTINATION_HANDOFF_DOMAINS.plan, value, 'plan_digest', DESTINATION_HANDOFF_PLAN_SCHEMA, options);
