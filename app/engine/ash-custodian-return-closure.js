import { canonicalDigest, verifyReceiptDigests } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId, text } from './aperture-v31-core.js';
import { verifyAuthorityContext } from './ash-constitutional-convergence.js';
import { verifyCaseMap, verifyRebuildTest, verifyRoomRules, verifyRouteMemory } from './ash-keep-core.js';
import { verifyAshDraft, verifyDraftReview, verifyReleaseReceipt } from './ash-keep-drafts.js';
import { verifySavePoint } from './ash-keep-continuity.js';

export const RETURN_READY_BUNDLE_SCHEMA = 'td613.ash.return-ready-bundle/v0.1';
export const RETURN_HOLD_SCHEMA = 'td613.ash.custodian-return-hold/v0.1';
export const RETURN_REPLAY_SCHEMA = 'td613.ash.custodian-return-replay/v0.1';
export const RETURN_PRODUCTION_OBSERVATION_SCHEMA = 'td613.ash.custodian-return-production-observation/v0.1';

const DOMAINS = Object.freeze({
  bundle: 'TD613:ASH:RETURN-READY-BUNDLE:v1',
  hold: 'TD613:ASH:CUSTODIAN-RETURN-HOLD:v1',
  replay: 'TD613:ASH:CUSTODIAN-RETURN-REPLAY:v1',
  production: 'TD613:ASH:CUSTODIAN-RETURN-PRODUCTION:v1',
  readiness: 'TD613:ASH:READINESS:v1',
  lifecycle: 'TD613:ASH:LIFECYCLE:v1'
});

const FAILURE_CLASSES = Object.freeze([
  'WRONG_PASSPHRASE',
  'TAMPER_HOLD',
  'PARTIAL_CAPSULE_HOLD',
  'STALE_RECEIPT_HOLD',
  'INTERRUPTED_IMPORT_HOLD',
  'REPLAY_HOLD',
  'UNKNOWN_HOLD'
]);

function without(value, ...fields) {
  const output = clone(value);
  for (const field of fields) delete output[field];
  return output;
}

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function arrays(value) {
  return Array.isArray(value) ? clone(value) : [];
}

async function seal(record, field, domain, options = {}) {
  record[field] = await canonicalDigest(domain, without(record, field), options);
  return freeze(record);
}

async function verifyReadinessReceipt(value, options = {}) {
  if (!value || value.schema !== 'td613.ash.readiness-receipt/v0.1') return false;
  return value.readiness_digest === await canonicalDigest(DOMAINS.readiness, without(value, 'readiness_digest', 'receipt_id'), options);
}

async function verifyLifecycleReceipt(value, options = {}) {
  if (!value || value.schema !== 'td613.ash.lifecycle-receipt/v0.1') return false;
  return value.lifecycle_digest === await canonicalDigest(DOMAINS.lifecycle, without(value, 'lifecycle_digest', 'receipt_id'), options);
}

async function verifyCustodyReceipt(value, options = {}) {
  try {
    return Boolean((await verifyReceiptDigests(value, options)).valid);
  } catch {
    return false;
  }
}

function byReference(values, fields, reference) {
  if (!reference) return null;
  return (values || []).find(value => fields.some(field => value?.[field] === reference)) || null;
}

function selectedRecord(bundle, kind) {
  const history = bundle.history || {};
  const selected = bundle.selected || {};
  if (kind === 'rebuild') return byReference(history.rebuild_tests, ['test_id'], selected.rebuild_test_reference);
  if (kind === 'draft') return byReference(history.drafts, ['draft_id'], selected.draft_reference);
  if (kind === 'review') return byReference(history.reviews, ['review_id'], selected.review_reference);
  if (kind === 'release') return byReference(history.releases, ['receipt_id'], selected.release_reference);
  if (kind === 'save') return byReference(history.save_points, ['save_point_id'], selected.save_point_reference);
  return null;
}

export async function compileReturnReadyBundle(input = {}, options = {}) {
  const authorityContext = clone(input.authorityContext);
  const record = {
    schema: RETURN_READY_BUNDLE_SCHEMA,
    bundle_id: input.bundleId || randomId('return_bundle_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId || input.caseMap?.case_id, 'Case ID'),
    created_at: input.createdAt || new Date().toISOString(),
    readiness_receipt: clone(input.readinessReceipt),
    custody_receipt: clone(input.custodyReceipt),
    authority_context: authorityContext,
    lifecycle_receipt: clone(input.lifecycleReceipt),
    case_map: clone(input.caseMap),
    room_rules: clone(input.roomRules),
    route_memory: clone(input.routeMemory),
    history: {
      rebuild_tests: arrays(input.rebuildTests),
      drafts: arrays(input.drafts),
      reviews: arrays(input.reviews),
      releases: arrays(input.releases),
      save_points: arrays(input.savePoints)
    },
    selected: {
      rebuild_test_reference: input.selected?.rebuildTestReference || authorityContext?.rebuild_receipt_reference || null,
      draft_reference: input.selected?.draftReference || null,
      review_reference: input.selected?.reviewReference || authorityContext?.current_review_reference || null,
      release_reference: input.selected?.releaseReference || authorityContext?.current_release_reference || null,
      save_point_reference: input.selected?.savePointReference || authorityContext?.current_continuity_reference || null
    },
    continuity_posture: {
      lifecycle_rank: authorityContext?.lifecycle_rank || null,
      readiness_reference: authorityContext?.readiness_receipt_reference || null,
      custody_root_reference: authorityContext?.custody_root_receipt_reference || null,
      case_map_digest: input.caseMap?.case_map_digest || null,
      route_memory_digest: input.routeMemory?.route_memory_digest || null
    },
    live_case_mutation_allowed: false,
    provider_execution_allowed: false,
    recipient_transport_allowed: false,
    automatic_cinder_allowed: false,
    bundle_digest: null
  };
  return seal(record, 'bundle_digest', DOMAINS.bundle, options);
}

export async function verifyReturnReadyBundle(bundle, options = {}) {
  const checks = {};
  const history = bundle?.history || {};
  const selected = bundle?.selected || {};
  const authority = bundle?.authority_context || null;
  const caseMap = bundle?.case_map || null;
  const routeMemory = bundle?.route_memory || null;
  const rebuild = selectedRecord(bundle || {}, 'rebuild');
  const draft = selectedRecord(bundle || {}, 'draft');
  const review = selectedRecord(bundle || {}, 'review');
  const release = selectedRecord(bundle || {}, 'release');
  const save = selectedRecord(bundle || {}, 'save');

  checks.schema = bundle?.schema === RETURN_READY_BUNDLE_SCHEMA;
  checks.bundle_digest = checks.schema && bundle.bundle_digest === await canonicalDigest(DOMAINS.bundle, without(bundle, 'bundle_digest'), options);
  checks.case_map = await verifyCaseMap(caseMap, options);
  checks.room_rules = await verifyRoomRules(bundle?.room_rules, options);
  checks.route_memory = await verifyRouteMemory(routeMemory, options);
  checks.readiness = await verifyReadinessReceipt(bundle?.readiness_receipt, options);
  checks.custody = await verifyCustodyReceipt(bundle?.custody_receipt, options);
  checks.lifecycle = await verifyLifecycleReceipt(bundle?.lifecycle_receipt, options);
  checks.authority = await verifyAuthorityContext(authority, {
    caseId: bundle?.case_id,
    caseMapDigest: caseMap?.case_map_digest,
    routeMemoryDigest: routeMemory?.route_memory_digest
  }, options);
  checks.case_binding = Boolean(caseMap && routeMemory && bundle?.case_id === caseMap.case_id && bundle.case_id === routeMemory.case_id);
  checks.readiness_binding = Boolean(authority?.readiness_receipt_reference && authority.readiness_receipt_reference === bundle?.readiness_receipt?.receipt_id);
  checks.custody_binding = Boolean(authority?.custody_root_receipt_reference && [bundle?.custody_receipt?.receipt_id, bundle?.custody_receipt?.receipt_digest].includes(authority.custody_root_receipt_reference));
  checks.lifecycle_binding = Boolean(bundle?.lifecycle_receipt?.lifecycle?.state === authority?.lifecycle_rank && authority?.lifecycle_rank === 'CONTINUITY_SEALED');
  checks.rebuild = Boolean(rebuild && await verifyRebuildTest(rebuild, options) && rebuild.case_id === bundle.case_id && rebuild.case_map_digest === caseMap?.case_map_digest && rebuild.test_id === authority?.rebuild_receipt_reference);
  checks.draft = Boolean(draft && await verifyAshDraft(draft, options) && draft.case_id === bundle.case_id && draft.case_map_digest === caseMap?.case_map_digest);
  checks.review = Boolean(review && await verifyDraftReview(review, options) && review.review_id === authority?.current_review_reference && review.draft_id === draft?.draft_id && review.case_map_digest === caseMap?.case_map_digest);
  checks.release = Boolean(release && await verifyReleaseReceipt(release, options) && release.receipt_id === authority?.current_release_reference && release.draft_id === draft?.draft_id && release.review_reference === review?.review_id && release.case_map_digest === caseMap?.case_map_digest);
  checks.save_point = Boolean(save && await verifySavePoint(save, options) && save.save_point_id === authority?.current_continuity_reference && save.case_map_digest === caseMap?.case_map_digest && save.route_memory_digest === routeMemory?.route_memory_digest && save.release_receipt_reference === release?.receipt_id && save.release_receipt_digest === release?.receipt_digest);
  checks.selected_references = Boolean(selected.rebuild_test_reference && selected.draft_reference && selected.review_reference && selected.release_reference && selected.save_point_reference);
  checks.history_integrity = Boolean(
    (await Promise.all(arrays(history.rebuild_tests).map(value => verifyRebuildTest(value, options)))).every(Boolean) &&
    (await Promise.all(arrays(history.drafts).map(value => verifyAshDraft(value, options)))).every(Boolean) &&
    (await Promise.all(arrays(history.reviews).map(value => verifyDraftReview(value, options)))).every(Boolean) &&
    (await Promise.all(arrays(history.releases).map(value => verifyReleaseReceipt(value, options)))).every(Boolean) &&
    (await Promise.all(arrays(history.save_points).map(value => verifySavePoint(value, options)))).every(Boolean)
  );
  checks.boundaries = bundle?.live_case_mutation_allowed === false && bundle?.provider_execution_allowed === false && bundle?.recipient_transport_allowed === false && bundle?.automatic_cinder_allowed === false;

  const holds = Object.entries(checks).filter(([, value]) => value !== true).map(([key]) => key);
  let state = 'VERIFIED';
  if (!checks.schema || !bundle?.case_map || !bundle?.authority_context || !bundle?.lifecycle_receipt) state = 'PARTIAL_CAPSULE_HOLD';
  else if (!checks.bundle_digest || !checks.case_map || !checks.room_rules || !checks.route_memory || !checks.readiness || !checks.custody || !checks.lifecycle || !checks.history_integrity) state = 'TAMPER_HOLD';
  else if (!checks.authority || !checks.case_binding || !checks.readiness_binding || !checks.custody_binding || !checks.lifecycle_binding || !checks.rebuild || !checks.draft || !checks.review || !checks.release || !checks.save_point || !checks.selected_references) state = 'STALE_RECEIPT_HOLD';

  return freeze({ valid: holds.length === 0, state, checks, holds });
}

export async function compileReturnHoldReceipt(input = {}, options = {}) {
  const failureClass = FAILURE_CLASSES.includes(String(input.failureClass || '').toUpperCase()) ? String(input.failureClass).toUpperCase() : 'UNKNOWN_HOLD';
  const record = {
    schema: RETURN_HOLD_SCHEMA,
    hold_id: input.holdId || randomId('return_hold_', options.cryptoImpl || globalThis.crypto),
    case_id: input.caseId || null,
    created_at: input.createdAt || new Date().toISOString(),
    failure_class: failureClass,
    capsule_digest: input.capsuleDigest || null,
    bundle_digest: input.bundleDigest || null,
    failed_checks: unique(input.failedChecks || []),
    observations: unique(input.observations || []),
    sandbox_only: true,
    live_case_mutated: false,
    provider_executed: false,
    recipient_transport_performed: false,
    automatic_cinder_performed: false,
    hold_digest: null
  };
  return seal(record, 'hold_digest', DOMAINS.hold, options);
}

export async function verifyReturnHoldReceipt(value, options = {}) {
  return Boolean(value?.schema === RETURN_HOLD_SCHEMA && value.hold_digest === await canonicalDigest(DOMAINS.hold, without(value, 'hold_digest'), options));
}

export async function compileReturnReplayReceipt(input = {}, options = {}) {
  const record = {
    schema: RETURN_REPLAY_SCHEMA,
    replay_id: input.replayId || randomId('return_replay_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: input.createdAt || new Date().toISOString(),
    return_receipt_reference: text(input.returnReceiptReference, 'Return Receipt reference'),
    return_receipt_digest: text(input.returnReceiptDigest, 'Return Receipt digest'),
    anisotropy_receipt_reference: text(input.anisotropyReceiptReference, 'Anisotropy Receipt reference'),
    anisotropy_receipt_digest: text(input.anisotropyReceiptDigest, 'Anisotropy Receipt digest'),
    return_ready_bundle_digest: text(input.returnReadyBundleDigest, 'Return-ready bundle digest'),
    verification_state: String(input.verificationState || 'REPLAY_VERIFIED').toUpperCase(),
    sandbox_record_found: input.sandboxRecordFound === true,
    live_case_mutated: false,
    reconstruction_reexecuted: false,
    observations: unique(input.observations || []),
    replay_digest: null
  };
  return seal(record, 'replay_digest', DOMAINS.replay, options);
}

export async function verifyReturnReplayReceipt(value, options = {}) {
  return Boolean(value?.schema === RETURN_REPLAY_SCHEMA && value.replay_digest === await canonicalDigest(DOMAINS.replay, without(value, 'replay_digest'), options));
}

export async function compileReturnProductionObservation(input = {}, options = {}) {
  const record = {
    schema: RETURN_PRODUCTION_OBSERVATION_SCHEMA,
    observation_id: input.observationId || randomId('return_observation_', options.cryptoImpl || globalThis.crypto),
    observed_at: input.observedAt || new Date().toISOString(),
    observed_base_url: text(input.observedBaseUrl, 'Observed base URL'),
    observed_commit: input.observedCommit || null,
    fixture_class: 'SYNTHETIC_RETURN_READY_CAPSULE',
    matrix: clone(input.matrix || {}),
    responsive_surfaces: clone(input.responsiveSurfaces || {}),
    accessibility: clone(input.accessibility || {}),
    provider_requests: arrays(input.providerRequests),
    recipient_transport_requests: arrays(input.recipientTransportRequests),
    live_case_mutations: arrays(input.liveCaseMutations),
    cinder_actions: arrays(input.cinderActions),
    promotion_authorized: false,
    operator_closure_required: true,
    observations: unique(input.observations || []),
    observation_digest: null
  };
  return seal(record, 'observation_digest', DOMAINS.production, options);
}

export async function verifyReturnProductionObservation(value, options = {}) {
  return Boolean(value?.schema === RETURN_PRODUCTION_OBSERVATION_SCHEMA && value.observation_digest === await canonicalDigest(DOMAINS.production, without(value, 'observation_digest'), options));
}
