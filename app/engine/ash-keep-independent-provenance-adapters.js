import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';

export const INDEPENDENT_PROVENANCE_REGISTRY_SCHEMA = 'td613.ash.independent-provenance-adapter-registry/v0.1';
export const INDEPENDENT_PROVENANCE_VERIFICATION_SCHEMA = 'td613.ash.independent-provenance-verification/v0.1';
export const INDEPENDENT_PROVENANCE_REPLAY_SCHEMA = 'td613.ash.independent-provenance-replay/v0.1';

const REGISTRY_DOMAIN = 'TD613:ASH:INDEPENDENT-PROVENANCE-ADAPTER-REGISTRY:v1';
const REPLAY_DOMAIN = 'TD613:ASH:INDEPENDENT-PROVENANCE-REPLAY:v1';
const FALLBACK_DOMAIN = 'TD613:ASH:INDEPENDENT-PROVENANCE-UNSUPPORTED-HOLD:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const SOURCE_STATUSES = new Set(['CURRENT', 'STALE', 'REVOKED', 'UNKNOWN']);

const ROWS = [
  ['ARTIFACT_DIGEST', 'artifact_digest', 'artifact-digest', 'ARTIFACT-DIGEST', 'artifact:'],
  ['MANIFEST_DIGEST', 'manifest_digest', 'manifest-digest', 'MANIFEST-DIGEST', 'manifest:'],
  ['RECEIPT_DIGEST', 'receipt_digest', 'receipt-digest', 'RECEIPT-DIGEST', 'receipt:'],
  ['SIGNATURE_LANE_STATEMENT', 'signature_lane_statement', 'signature-lane', 'SIGNATURE-LANE', 'signature-lane:'],
  ['REPOSITORY_REFERENCE', 'repository_reference', 'repository-reference', 'REPOSITORY-REFERENCE', 'repository:'],
  ['PROVIDER_RESPONSE_REFERENCE', 'provider_response_reference', 'provider-response', 'PROVIDER-RESPONSE', 'provider:'],
  ['CUSTODY_ROOT_REFERENCE', 'custody_root_reference', 'custody-root', 'CUSTODY-ROOT', 'custody-root:'],
  ['CASE_RELATION_REFERENCE', 'case_relation_reference', 'case-relation', 'CASE-RELATION', 'case-relation:'],
  ['OPERATOR_DECLARATION', 'operator_declaration', 'operator-declaration', 'OPERATOR-DECLARATION', 'operator-declaration:'],
  ['EXTERNAL_TIME_CLAIM', 'external_time_claim', 'external-time-claim', 'EXTERNAL-TIME-CLAIM', 'external-time-claim:'],
  ['RECIPIENT_DESTINATION_DECLARATION', 'recipient_destination_declaration', 'recipient-destination', 'RECIPIENT-DESTINATION', 'recipient-destination:']
];

const PROFILES = ROWS.map(([evidenceClass, adapterId, slug, domain, prefix]) => freeze({
  adapter_id: adapterId,
  evidence_class: evidenceClass,
  adapter_schema: `td613.ash.provenance.${slug}-adapter/v0.1`,
  digest_domain: `TD613:ASH:PROVENANCE:${domain}:v1`,
  reference_prefix: prefix,
  verification_mode: 'SOURCE_LOCAL_DIGEST_MATCH',
  source_local_only: true,
  raw_body_ingestion_authorized: false,
  provider_execution_authorized: false,
  reader_execution_authorized: false,
  identity_inference_authorized: false,
  authorship_inference_authorized: false,
  permission_inference_authorized: false,
  authenticity_inference_authorized: false,
  truth_inference_authorized: false,
  relation_inference_authorized: false,
  custody_inference_authorized: false,
  external_time_inference_authorized: false,
  recipient_behavior_inference_authorized: false,
  destination_transport_authorized: false
}));
const BY_CLASS = new Map(PROFILES.map(value => [value.evidence_class, value]));
const BY_ID = new Map(PROFILES.map(value => [value.adapter_id, value]));
export const INDEPENDENT_PROVENANCE_EVIDENCE_CLASSES = freeze(PROFILES.map(value => value.evidence_class));

const without = (value, field) => { const output = clone(value); delete output[field]; return output; };
const strings = values => [...new Set((values || []).map(value => String(value).trim()).filter(Boolean))].sort();
const upper = value => String(value || '').trim().toUpperCase();
const lower = value => String(value || '').trim().toLowerCase();
const digestOrNull = value => SHA256.test(String(value || '')) ? String(value) : null;
const status = value => SOURCE_STATUSES.has(upper(value || 'CURRENT')) ? upper(value || 'CURRENT') : 'UNKNOWN';
const seal = (domain, record, field, options) => canonicalDigest(domain, without(record, field), options);

function registryState(failures) {
  if (failures.some(value => value.includes('collision'))) return 'COLLISION_HOLD';
  if (failures.some(value => value.includes('unsupported'))) return 'UNSUPPORTED_DOMAIN_HOLD';
  return failures.length ? 'TAMPER_HOLD' : 'INDEPENDENT_PROVENANCE_REGISTRY_ELIGIBLE';
}

export async function compileIndependentProvenanceAdapterRegistry(input = {}, options = {}) {
  const requested = input.evidenceClasses?.length ? strings(input.evidenceClasses.map(upper)) : [...INDEPENDENT_PROVENANCE_EVIDENCE_CLASSES];
  const failures = [];
  const adapters = requested.flatMap(evidenceClass => {
    const profile = BY_CLASS.get(evidenceClass);
    if (!profile) { failures.push(`unsupported-evidence-class:${evidenceClass || '(empty)'}`); return []; }
    return [clone(profile)];
  }).sort((left, right) => left.adapter_id.localeCompare(right.adapter_id));
  const domains = adapters.map(value => value.digest_domain);
  const schemas = adapters.map(value => value.adapter_schema);
  const ids = adapters.map(value => value.adapter_id);
  if (new Set(domains).size !== domains.length) failures.push('digest-domain-collision');
  if (new Set(schemas).size !== schemas.length) failures.push('adapter-schema-collision');
  if (new Set(ids).size !== ids.length) failures.push('adapter-id-collision');
  if (!adapters.length) failures.push('unsupported-empty-adapter-set');
  const failedChecks = strings(failures);
  const state = registryState(failedChecks);
  const record = {
    schema: INDEPENDENT_PROVENANCE_REGISTRY_SCHEMA,
    version: 'v0.1',
    registry_id: input.registryId || randomId('indprovregistry_', options.cryptoImpl || globalThis.crypto),
    created_at: String(input.createdAt || new Date().toISOString()),
    adapters,
    evidence_class_count: adapters.length,
    digest_domain_count: new Set(domains).size,
    adapter_schema_count: new Set(schemas).size,
    state,
    registry_eligible: state === 'INDEPENDENT_PROVENANCE_REGISTRY_ELIGIBLE',
    failed_checks: failedChecks,
    missingness: strings(input.missingness),
    operator_notes: strings(input.operatorNotes),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    raw_body_present: false,
    raw_corpus_present: false,
    universal_join_key: null,
    provider_called: false,
    reader_executed: false,
    network_called: false,
    storage_mutated: false,
    identity_inference_authorized: false,
    authorship_inference_authorized: false,
    truth_inference_authorized: false,
    destination_transport_authorized: false,
    release_authorized: false,
    suppression_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    recommendation_not_command: true,
    registry_digest: null
  };
  record.registry_digest = await seal(REGISTRY_DOMAIN, record, 'registry_digest', options);
  return freeze(record);
}

export async function verifyIndependentProvenanceAdapterRegistry(value, options = {}) {
  return Boolean(value && value.schema === INDEPENDENT_PROVENANCE_REGISTRY_SCHEMA && SHA256.test(String(value.registry_digest || ''))
    && value.registry_digest === await seal(REGISTRY_DOMAIN, value, 'registry_digest', options));
}

function verificationState(failures) {
  if (failures.includes('cancelled-operator-action')) return 'CANCELLED_HOLD';
  if (failures.some(value => value.includes('replay-beyond-jurisdiction'))) return 'REPLAY_HOLD';
  if (failures.some(value => /tamper|digest-mismatch|malformed-digest/.test(value))) return 'TAMPER_HOLD';
  if (failures.some(value => value.includes('wrong-digest-domain'))) return 'WRONG_DOMAIN_HOLD';
  if (failures.some(value => value.includes('unsupported'))) return 'UNSUPPORTED_DOMAIN_HOLD';
  if (failures.some(value => value.includes('source-mismatch'))) return 'SOURCE_MISMATCH_HOLD';
  if (failures.some(value => value.includes('revoked'))) return 'REVOKED_REFERENCE_HOLD';
  if (failures.some(value => value.includes('stale'))) return 'STALE_REFERENCE_HOLD';
  if (failures.some(value => value.includes('collision'))) return 'COLLISION_HOLD';
  if (failures.some(value => value.includes('missing'))) return 'MISSING_REFERENCE_HOLD';
  return 'INDEPENDENT_PROVENANCE_VERIFIED';
}

const referenceMatches = (profile, value) => {
  const reference = String(value || '').trim();
  return Boolean(reference && reference.startsWith(profile.reference_prefix) && !/\s/.test(reference));
};

export async function compileIndependentProvenanceVerification(input = {}, options = {}) {
  const registry = input.registry;
  if (!await verifyIndependentProvenanceAdapterRegistry(registry, options)) throw new Error('Independent provenance verification requires a verified adapter registry.');
  const failures = [];
  const adapterId = lower(input.adapterId);
  const requestedClass = upper(input.evidenceClass);
  const registered = registry.adapters.find(value => value.adapter_id === adapterId) || null;
  const profile = registered && BY_ID.get(registered.adapter_id) || {
    adapter_id: adapterId || 'unsupported_adapter', evidence_class: requestedClass || 'UNSUPPORTED',
    adapter_schema: 'td613.ash.provenance.unsupported-adapter/v0.1', digest_domain: FALLBACK_DOMAIN,
    reference_prefix: 'unsupported:', verification_mode: 'UNSUPPORTED'
  };
  if (!registered || !BY_ID.has(adapterId)) failures.push(`unsupported-adapter:${adapterId || '(empty)'}`);
  if (!requestedClass) failures.push('missing-evidence-class');
  if (registered && requestedClass !== registered.evidence_class) failures.push(`unsupported-evidence-class:${requestedClass}`);
  if (input.rawBodyIncluded === true || input.rawCorpusIncluded === true) failures.push('unsupported-raw-body-ingestion');
  if (input.operatorGesture !== 'VERIFY_INDEPENDENT_PROVENANCE_REFERENCE') failures.push('missing-operator-gesture');

  const declaredDomain = String(input.declaredDigestDomain || '');
  if (!declaredDomain) failures.push('missing-digest-domain');
  else if (declaredDomain !== profile.digest_domain) failures.push('wrong-digest-domain');
  const sourceId = String(input.sourceId || '').trim();
  const expectedSourceId = String(input.expectedSourceId || sourceId).trim();
  if (!sourceId) failures.push('missing-source-id');
  if (sourceId && expectedSourceId && sourceId !== expectedSourceId) failures.push('source-mismatch');
  const referenceId = String(input.referenceId || '').trim();
  const sourceLocalReference = String(input.sourceLocalReference || '').trim();
  if (!referenceId) failures.push('missing-reference-id');
  if (!sourceLocalReference) failures.push('missing-source-local-reference');
  else if (registered && !referenceMatches(profile, sourceLocalReference)) failures.push('source-mismatch:reference-syntax');
  const expectedDigest = digestOrNull(input.expectedDigest);
  const observedDigest = digestOrNull(input.observedDigest);
  if (!input.expectedDigest) failures.push('missing-expected-digest'); else if (!expectedDigest) failures.push('malformed-digest:expected');
  if (!input.observedDigest) failures.push('missing-observed-digest'); else if (!observedDigest) failures.push('malformed-digest:observed');
  if (expectedDigest && observedDigest && expectedDigest !== observedDigest) failures.push('digest-mismatch-tamper');
  const sourcePosture = status(input.sourceStatus);
  if (sourcePosture === 'STALE') failures.push('stale-source-local-posture');
  if (sourcePosture === 'REVOKED') failures.push('revoked-source-local-posture');
  if (input.collisionDetected === true && input.collisionResolved !== true) failures.push('ambiguous-collision');
  if (input.cancelled === true) failures.push('cancelled-operator-action');
  if (input.replayBeyondJurisdiction === true) failures.push('replay-beyond-jurisdiction');
  const failedChecks = strings(failures);
  const state = verificationState(failedChecks);
  const record = {
    schema: INDEPENDENT_PROVENANCE_VERIFICATION_SCHEMA,
    version: 'v0.1',
    verification_id: input.verificationId || randomId('indprovverify_', options.cryptoImpl || globalThis.crypto),
    created_at: String(input.createdAt || new Date().toISOString()),
    registry_reference: registry.registry_digest,
    adapter: { adapter_id: profile.adapter_id, evidence_class: profile.evidence_class, adapter_schema: profile.adapter_schema, digest_domain: profile.digest_domain, verification_mode: profile.verification_mode },
    reference: { reference_id: referenceId || null, source_id: sourceId || null, expected_source_id: expectedSourceId || null, source_namespace: String(input.sourceNamespace || 'SOURCE_LOCAL'), source_local_reference: sourceLocalReference || null, expected_digest: expectedDigest, observed_digest: observedDigest },
    source_local_posture: { status: sourcePosture, staleness_reason: input.stalenessReason ? String(input.stalenessReason) : null, revocation_reference: input.revocationReference ? String(input.revocationReference) : null, collision_detected: Boolean(input.collisionDetected), collision_resolved: Boolean(input.collisionResolved), trusted_external_time_used: false },
    checks: {
      registry_verified: true, adapter_registered: Boolean(registered && BY_ID.has(adapterId)), evidence_class_matched: Boolean(registered && requestedClass === registered.evidence_class),
      digest_domain_matched: declaredDomain === profile.digest_domain, source_matched: Boolean(sourceId && expectedSourceId && sourceId === expectedSourceId),
      reference_syntax_matched: Boolean(registered && referenceMatches(profile, sourceLocalReference)), digest_match_observed: Boolean(expectedDigest && observedDigest && expectedDigest === observedDigest),
      source_current: sourcePosture === 'CURRENT', source_not_revoked: sourcePosture !== 'REVOKED', collision_clear: input.collisionDetected !== true || input.collisionResolved === true,
      operator_gesture_verified: input.operatorGesture === 'VERIFY_INDEPENDENT_PROVENANCE_REFERENCE', raw_body_absent: input.rawBodyIncluded !== true, raw_corpus_absent: input.rawCorpusIncluded !== true
    },
    state,
    verification_eligible: state === 'INDEPENDENT_PROVENANCE_VERIFIED',
    evidence_class_preserved: Boolean(registered && requestedClass === registered.evidence_class),
    failed_checks: failedChecks,
    missingness: strings(input.missingness || failedChecks.filter(value => value.includes('missing'))),
    operator_notes: strings(input.operatorNotes),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    raw_body_present: false, raw_corpus_present: false, universal_join_key: null, adapter_agreement_universal_trust_score: null,
    provider_called: false, reader_executed: false, network_called: false, storage_mutated: false,
    identity_inferred: false, authorship_inferred: false, permission_inferred: false, authenticity_inferred: false,
    truth_inferred: false, relation_inferred: false, custody_inferred: false, causation_inferred: false,
    external_time_inferred: false, delivery_inferred: false, recipient_behavior_inferred: false,
    destination_transport_authorized: false, release_authorized: false, suppression_authorized: false,
    cinder_action_authorized: false, automatic_hold: false, recommendation_not_command: true,
    verification_digest: null
  };
  record.verification_digest = await seal(profile.digest_domain, record, 'verification_digest', options);
  return freeze(record);
}

export async function verifyIndependentProvenanceVerification(value, registry = null, options = {}) {
  if (!value || value.schema !== INDEPENDENT_PROVENANCE_VERIFICATION_SCHEMA || !SHA256.test(String(value.verification_digest || ''))) return false;
  const profile = BY_ID.get(String(value.adapter?.adapter_id || ''));
  if (!profile || value.adapter?.evidence_class !== profile.evidence_class || value.adapter?.adapter_schema !== profile.adapter_schema || value.adapter?.digest_domain !== profile.digest_domain) return false;
  if (value.verification_digest !== await seal(profile.digest_domain, value, 'verification_digest', options)) return false;
  if (!registry) return true;
  if (!await verifyIndependentProvenanceAdapterRegistry(registry, options)) return false;
  const registered = registry.adapters.find(candidate => candidate.adapter_id === profile.adapter_id);
  return Boolean(registered && registry.registry_digest === value.registry_reference && registered.evidence_class === profile.evidence_class && registered.adapter_schema === profile.adapter_schema && registered.digest_domain === profile.digest_domain);
}

export async function replayIndependentProvenanceVerification(value, registry, input = {}, options = {}) {
  const registryVerified = await verifyIndependentProvenanceAdapterRegistry(registry, options);
  const verificationVerified = registryVerified && await verifyIndependentProvenanceVerification(value, registry, options);
  const requestedId = input.requestedAdapterId ? lower(input.requestedAdapterId) : value?.adapter?.adapter_id;
  const requestedClass = input.requestedEvidenceClass ? upper(input.requestedEvidenceClass) : value?.adapter?.evidence_class;
  const relationVerified = Boolean(verificationVerified && requestedId === value?.adapter?.adapter_id && requestedClass === value?.adapter?.evidence_class);
  const jurisdictionPreserved = ![input.restoreRawBody, input.restoreRawCorpus, input.reexecuteProvider, input.reexecuteReader, input.contactDestination].includes(true);
  const verified = registryVerified && verificationVerified && relationVerified && jurisdictionPreserved;
  const record = {
    schema: INDEPENDENT_PROVENANCE_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('indprovreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: String(input.createdAt || new Date().toISOString()),
    source_verification_id: value?.verification_id || null,
    source_verification_digest: value?.verification_digest || null,
    registry_reference: registry?.registry_digest || null,
    adapter_id: value?.adapter?.adapter_id || null,
    evidence_class: value?.adapter?.evidence_class || null,
    state: verified ? 'INDEPENDENT_PROVENANCE_REPLAY_VERIFIED' : 'REPLAY_HOLD',
    replay_verified: verified,
    registry_digest_verified: registryVerified,
    source_verification_digest_verified: verificationVerified,
    adapter_relation_verified: relationVerified,
    replay_jurisdiction_preserved: jurisdictionPreserved,
    failed_checks: strings([
      ...(!registryVerified ? ['registry-tamper-or-missing'] : []),
      ...(!verificationVerified ? ['source-verification-tamper-or-missing'] : []),
      ...(!relationVerified ? ['replay-beyond-jurisdiction:adapter-or-evidence-class'] : []),
      ...(!jurisdictionPreserved ? ['replay-beyond-jurisdiction:execution-or-raw-content'] : [])
    ]),
    raw_body_restored: false, raw_corpus_restored: false, provider_reexecuted: false, reader_reexecuted: false,
    network_called: false, storage_mutated: false, identity_inferred: false, authorship_inferred: false,
    permission_inferred: false, authenticity_inferred: false, truth_inferred: false, relation_inferred: false,
    custody_inferred: false, external_time_inferred: false, delivery_inferred: false, recipient_behavior_inferred: false,
    universal_join_key: null, destination_transport_authorized: false, release_authorized: false,
    suppression_authorized: false, cinder_action_authorized: false, automatic_hold: false,
    recommendation_not_command: true, closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    replay_digest: null
  };
  record.replay_digest = await seal(REPLAY_DOMAIN, record, 'replay_digest', options);
  return freeze(record);
}

export async function verifyIndependentProvenanceReplay(value, options = {}) {
  return Boolean(value && value.schema === INDEPENDENT_PROVENANCE_REPLAY_SCHEMA && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await seal(REPLAY_DOMAIN, value, 'replay_digest', options));
}
