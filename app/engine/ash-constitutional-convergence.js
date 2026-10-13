import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const ASH_CONVERGENCE_VERSION = 'td613.ash.constitutional-convergence/v0.1';
export const ASH_COMPOSITION_SCHEMA = 'td613.ash.constitutional-composition/v0.1';
export const ASH_AUTHORITY_CONTEXT_SCHEMA = 'td613.ash.authority-context/v0.1';
export const ASH_CASE_STATE_SCHEMA = 'td613.ash.case-state-transition/v0.1';
export const ASH_INVALIDATION_SCHEMA = 'td613.ash.stale-invalidation/v0.1';
export const ASH_DELETION_PLAN_SCHEMA = 'td613.ash.deletion-plan/v0.1';
export const ASH_DELETION_RECEIPT_SCHEMA = 'td613.ash.deletion-receipt/v0.1';
export const ASH_COMPATIBILITY_AUDIT_SCHEMA = 'td613.ash.compatibility-audit/v0.1';

export const ASH_CASE_STATES = Object.freeze({
  EPHEMERAL_CURRENT: 'EPHEMERAL_CURRENT',
  CURRENT_UNSAVED: 'CURRENT_UNSAVED',
  CURRENT_SAVED: 'CURRENT_SAVED',
  CLOSED_SAVED: 'CLOSED_SAVED',
  CLOSED_CURRENT_UNSAVED: 'CLOSED_CURRENT_UNSAVED',
  SELECTED_NOT_OPEN: 'SELECTED_NOT_OPEN',
  DELETION_PENDING: 'DELETION_PENDING',
  DELETED_LOCAL: 'DELETED_LOCAL',
  DELETE_PARTIAL_HOLD: 'DELETE_PARTIAL_HOLD'
});

export const ASH_LIFECYCLE_RANK = Object.freeze({
  ARRIVAL_UNPERSISTED: 0,
  READINESS_OBSERVED: 1,
  CUSTODY_ROOT_PROVISIONAL: 2,
  CUSTODY_ROOT_VERIFIED: 3,
  CASE_BOUND: 4,
  REBUILD_ELIGIBLE: 5,
  RELEASE_ELIGIBLE: 6,
  CONTINUITY_SEALED: 7,
  HELD: -1
});

export const STALE_AUTHORITY_TARGETS = Object.freeze([
  'FLOWCORE_CONTEXT',
  'APERTURE_AUDIT',
  'CHOIR_CALIBRATION',
  'HUSH_DERIVATIVE',
  'ASH_DRAFT',
  'ASH_REVIEW',
  'ASH_RELEASE',
  'ASH_SAVE_POINT',
  'ASH_CONTINUITY'
]);

export const ASH_RUNTIME_PERMISSIONS = Object.freeze({
  APERTURE_REBUILD: 'CASE_BOUND',
  FLOWCORE_CONTEXT: 'CASE_BOUND',
  ROUTE_MEMORY_WRITE: 'CASE_BOUND',
  HUSH_CANDIDATE: 'REBUILD_ELIGIBLE',
  KEEP_DRAFT: 'REBUILD_ELIGIBLE',
  REVIEW_DRAFT: 'REBUILD_ELIGIBLE',
  KEEP_RELEASE: 'REBUILD_ELIGIBLE',
  SEAL_CONTINUITY: 'RELEASE_ELIGIBLE',
  EXPORT_CAPSULE: 'RELEASE_ELIGIBLE'
});

const DIGEST_DOMAINS = Object.freeze({
  composition: 'TD613:ASH:CONSTITUTIONAL-COMPOSITION:v1',
  authority: 'TD613:ASH:AUTHORITY-CONTEXT:v1',
  state: 'TD613:ASH:CASE-STATE:v1',
  invalidation: 'TD613:ASH:STALE-INVALIDATION:v1',
  deletionPlan: 'TD613:ASH:DELETION-PLAN:v1',
  deletionReceipt: 'TD613:ASH:DELETION-RECEIPT:v1',
  compatibility: 'TD613:ASH:COMPATIBILITY-AUDIT:v1'
});

const COMPOSITION_LAYERS = Object.freeze([
  ['dome-threshold', 'td613.ash.threshold/v0.1', ['observe-arrival'], [], 'continue-to-threshold'],
  ['quick-scan', 'td613.ash.readiness-receipt/v0.1', ['compile-readiness'], [], 'hold-readiness'],
  ['custody-root', 'td613.ash.custody-receipt/v0.8', ['verify-custody', 'bind-root'], ['custody'], 'hold-custody'],
  ['keep-core', 'td613.ash-keep/v1.0-alpha', ['case-map', 'rooms', 'route-memory'], ['case-map', 'room-rules', 'route-memory'], 'hold-case'],
  ['lifecycle', 'td613.ash.lifecycle/v0.1', ['derive-rank', 'gate-actions'], ['lifecycle'], 'hold-action'],
  ['custody-workspace-bridges', 'td613.ash.custody-workspace-bridge/v0.1', ['bind-current-root'], ['case-map'], 'open-custody'],
  ['controls-mobile', 'td613.ash-keep.case-controls/v1.2', ['save', 'open', 'close', 'select', 'delete'], ['case-state', 'saved-case'], 'hold-command'],
  ['flowcore-adapter', 'td613.flowcore.context-series/v0.2', ['contextualize', 'abstain'], ['context-reference'], 'hold-context'],
  ['aperture-adapter', 'td613.aperture.v31/v0.2', ['observe', 'audit', 'route', 'hold'], ['audit-reference'], 'hold-audit'],
  ['hush-adapter', 'td613.hush.outgoing-contract/v0.1', ['produce-candidate'], ['candidate-reference'], 'hold-candidate'],
  ['observer', 'td613.ash.constitutional-observer/v0.1', ['observe-references'], [], 'report-only']
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function cleanReference(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function digestSuffix(value) {
  return String(value || '').replace(/[^a-z0-9]/gi, '').slice(-20).toLowerCase();
}

async function seal(record, field, domain, prefix, options = {}) {
  const subject = clone(record);
  delete subject[field];
  const digest = await canonicalDigest(domain, subject, options);
  record[field] = digest;
  record.receipt_id ||= `${prefix}_${digestSuffix(digest)}`;
  return Object.freeze(record);
}

export async function compileCompositionManifest(input = {}, options = {}) {
  const layers = COMPOSITION_LAYERS.map(([id, prerequisite, capabilities, mutationSurface, failurePosture], index) => ({
    index: index + 1,
    layer_id: id,
    prerequisite_version: prerequisite,
    capabilities,
    mutation_surface: mutationSurface,
    runtime_permissions: capabilities,
    idempotence_marker: `${id}:${prerequisite}`,
    failure_posture: failurePosture
  }));
  return seal({
    schema: ASH_COMPOSITION_SCHEMA,
    convergence_version: ASH_CONVERGENCE_VERSION,
    composed_at: input.composedAt || new Date().toISOString(),
    layers,
    transport_enabled: false,
    automatic_cinder_enabled: false,
    manifest_digest: null
  }, 'manifest_digest', DIGEST_DOMAINS.composition, 'ash_composition', options);
}

export function deriveCaseState(input = {}) {
  if (input.deletePartial === true) return ASH_CASE_STATES.DELETE_PARTIAL_HOLD;
  if (input.deleted === true) return ASH_CASE_STATES.DELETED_LOCAL;
  if (input.deletionPending === true) return ASH_CASE_STATES.DELETION_PENDING;
  if (input.selectedCaseId && input.selectedCaseId !== input.currentCaseId) return ASH_CASE_STATES.SELECTED_NOT_OPEN;
  if (!input.currentCaseId || input.persisted !== true) return ASH_CASE_STATES.EPHEMERAL_CURRENT;
  if (input.closed === true) return input.saved === true
    ? ASH_CASE_STATES.CLOSED_SAVED
    : ASH_CASE_STATES.CLOSED_CURRENT_UNSAVED;
  return input.saved === true ? ASH_CASE_STATES.CURRENT_SAVED : ASH_CASE_STATES.CURRENT_UNSAVED;
}

export async function compileCaseStateTransition(input = {}, options = {}) {
  const nextState = input.nextState || deriveCaseState(input);
  if (!Object.values(ASH_CASE_STATES).includes(nextState)) throw new Error(`Unknown Ash case state: ${nextState}`);
  return seal({
    schema: ASH_CASE_STATE_SCHEMA,
    case_id: cleanReference(input.caseId),
    previous_state: input.previousState || null,
    next_state: nextState,
    reason: String(input.reason || 'case-state-reconciled'),
    operation_id: cleanReference(input.operationId),
    observed_at: input.observedAt || new Date().toISOString(),
    local_only: true,
    transition_digest: null
  }, 'transition_digest', DIGEST_DOMAINS.state, 'ash_state', options);
}

function rankAtLeast(state, required) {
  return (ASH_LIFECYCLE_RANK[state] ?? -1) >= ASH_LIFECYCLE_RANK[required];
}

export function authorizeAuthorityAction(context, action) {
  const requiredRank = ASH_RUNTIME_PERMISSIONS[action];
  if (!requiredRank) throw new Error(`Unknown Ash runtime permission: ${action}`);
  const actualRank = context?.lifecycle_rank || 'HELD';
  const authorized = Boolean(
    context?.current === true
    && context?.case_id
    && context?.case_map_digest
    && rankAtLeast(actualRank, requiredRank)
  );
  return Object.freeze({
    action,
    authorized,
    required_rank: requiredRank,
    actual_rank: actualRank,
    authority_context_reference: authorized ? context.receipt_id : null,
    authority_context_digest: authorized ? context.authority_context_digest : null
  });
}

export async function compileAuthorityContext(input = {}, options = {}) {
  const lifecycleRank = String(input.lifecycleRank || 'ARRIVAL_UNPERSISTED');
  if (!Object.hasOwn(ASH_LIFECYCLE_RANK, lifecycleRank)) throw new Error(`Unknown lifecycle rank: ${lifecycleRank}`);
  const caseId = rankAtLeast(lifecycleRank, 'CASE_BOUND') ? cleanReference(input.caseId) : null;
  const caseMapDigest = rankAtLeast(lifecycleRank, 'CASE_BOUND') ? cleanReference(input.caseMapDigest) : null;
  if (rankAtLeast(lifecycleRank, 'CASE_BOUND') && (!caseId || !caseMapDigest)) throw new Error('CASE_BOUND Authority Context requires the current case and Case Map digest.');
  return seal({
    schema: ASH_AUTHORITY_CONTEXT_SCHEMA,
    case_id: caseId,
    lifecycle_rank: lifecycleRank,
    readiness_receipt_reference: rankAtLeast(lifecycleRank, 'READINESS_OBSERVED') ? cleanReference(input.readinessReceiptReference) : null,
    custody_root_receipt_reference: rankAtLeast(lifecycleRank, 'CUSTODY_ROOT_VERIFIED') ? cleanReference(input.custodyRootReceiptReference) : null,
    case_map_digest: caseMapDigest,
    route_memory_digest: rankAtLeast(lifecycleRank, 'CASE_BOUND') ? cleanReference(input.routeMemoryDigest) : null,
    rebuild_receipt_reference: rankAtLeast(lifecycleRank, 'REBUILD_ELIGIBLE') ? cleanReference(input.rebuildReceiptReference) : null,
    current_review_reference: rankAtLeast(lifecycleRank, 'REBUILD_ELIGIBLE') ? cleanReference(input.currentReviewReference) : null,
    current_release_reference: rankAtLeast(lifecycleRank, 'RELEASE_ELIGIBLE') ? cleanReference(input.currentReleaseReference) : null,
    current_continuity_reference: rankAtLeast(lifecycleRank, 'CONTINUITY_SEALED') ? cleanReference(input.currentContinuityReference) : null,
    source_status: String(input.sourceStatus || 'DERIVED_FROM_VERIFIED_LOCAL_REFERENCES'),
    evidence_basis: [...new Set((input.evidenceBasis || []).map(String).filter(Boolean))],
    missingness: [...new Set((input.missingness || []).map(String).filter(Boolean))],
    alternatives: [...new Set((input.alternatives || []).map(String).filter(Boolean))],
    open_questions: [...new Set((input.openQuestions || []).map(String).filter(Boolean))],
    operator_notes: [...new Set((input.operatorNotes || []).map(String).filter(Boolean))],
    closure: { status: String(input.closureStatus || 'OPEN') },
    current: input.current !== false,
    compiled_at: input.compiledAt || new Date().toISOString(),
    authority_context_digest: null
  }, 'authority_context_digest', DIGEST_DOMAINS.authority, 'ash_authority', options);
}

export async function verifyAuthorityContext(context, current = {}, options = {}) {
  if (!context || context.schema !== ASH_AUTHORITY_CONTEXT_SCHEMA) return false;
  const subject = clone(context);
  const expected = subject.authority_context_digest;
  delete subject.authority_context_digest;
  delete subject.receipt_id;
  const actual = await canonicalDigest(DIGEST_DOMAINS.authority, subject, options);
  if (actual !== expected || context.current !== true) return false;
  if (current.caseId && context.case_id !== current.caseId) return false;
  if (current.caseMapDigest && context.case_map_digest !== current.caseMapDigest) return false;
  if (current.routeMemoryDigest && context.route_memory_digest !== current.routeMemoryDigest) return false;
  return true;
}

export async function compileInvalidationReceipt(input = {}, options = {}) {
  const changes = [...new Set((input.changedDimensions || []).map(String).filter(Boolean))];
  if (!input.caseId || !changes.length) throw new Error('Invalidation requires a case and at least one changed authority dimension.');
  return seal({
    schema: ASH_INVALIDATION_SCHEMA,
    case_id: String(input.caseId),
    previous_authority_context_reference: cleanReference(input.previousAuthorityContextReference),
    successor_authority_context_reference: cleanReference(input.successorAuthorityContextReference),
    previous_case_map_digest: cleanReference(input.previousCaseMapDigest),
    successor_case_map_digest: cleanReference(input.successorCaseMapDigest),
    previous_route_memory_digest: cleanReference(input.previousRouteMemoryDigest),
    successor_route_memory_digest: cleanReference(input.successorRouteMemoryDigest),
    changed_dimensions: changes,
    invalidated_targets: [...STALE_AUTHORITY_TARGETS],
    stale_records_preserved: true,
    invalidated_at: input.invalidatedAt || new Date().toISOString(),
    invalidation_digest: null
  }, 'invalidation_digest', DIGEST_DOMAINS.invalidation, 'ash_invalidation', options);
}

export async function compileDeletionPlan(input = {}, options = {}) {
  if (!input.caseId) throw new Error('Deletion planning requires a case.');
  const inventory = Object.fromEntries(Object.entries(input.inventory || {}).sort(([a], [b]) => a.localeCompare(b)).map(([store, ids]) => [store, [...new Set((ids || []).map(String))].sort()]));
  return seal({
    schema: ASH_DELETION_PLAN_SCHEMA,
    case_id: String(input.caseId),
    case_title: String(input.caseTitle || 'Untitled case'),
    inventory,
    inventory_count: Object.values(inventory).reduce((sum, ids) => sum + ids.length, 0),
    capsule_reminder_presented: input.capsuleReminderPresented === true,
    local_scope_only: true,
    external_erasure_performed: false,
    planned_at: input.plannedAt || new Date().toISOString(),
    plan_digest: null
  }, 'plan_digest', DIGEST_DOMAINS.deletionPlan, 'ash_delete_plan', options);
}

export async function compileDeletionReceipt(input = {}, options = {}) {
  if (!input.plan?.plan_digest) throw new Error('A verified deletion plan is required.');
  const status = String(input.status || 'DELETE_PARTIAL_HOLD');
  if (!['DELETED_LOCAL', 'DELETE_PARTIAL_HOLD'].includes(status)) throw new Error(`Unsupported deletion result: ${status}`);
  return seal({
    schema: ASH_DELETION_RECEIPT_SCHEMA,
    case_id: input.plan.case_id,
    deletion_plan_reference: input.plan.receipt_id,
    deletion_plan_digest: input.plan.plan_digest,
    status,
    deleted_count: Number(input.deletedCount || 0),
    remaining_orphans: clone(input.remainingOrphans || []),
    failure: input.failure ? String(input.failure) : null,
    recovery_available: status === 'DELETE_PARTIAL_HOLD',
    local_scope_only: true,
    external_erasure_performed: false,
    completed_at: input.completedAt || new Date().toISOString(),
    deletion_receipt_digest: null
  }, 'deletion_receipt_digest', DIGEST_DOMAINS.deletionReceipt, 'ash_delete', options);
}

export async function compileCompatibilityAudit(input = {}, options = {}) {
  const findings = [];
  for (const point of input.savePoints || []) {
    if (!point?.save_point_id || !point?.case_id || !point?.case_map_digest || !point?.route_memory_digest) findings.push({ code: 'MALFORMED_SAVE_POINT', reference: point?.save_point_id || null });
  }
  for (const caseMap of input.caseMaps || []) {
    const roots = (caseMap?.nodes || []).filter(node => node?.custody_reference);
    if (new Set(roots.map(node => node.custody_reference)).size > 1) findings.push({ code: 'DUPLICATE_CUSTODY_ROOT', reference: caseMap.case_id });
  }
  const drafts = new Set((input.drafts || []).map(value => value?.draft_id).filter(Boolean));
  const reviews = new Set((input.reviews || []).map(value => value?.review_id).filter(Boolean));
  for (const review of input.reviews || []) if (!drafts.has(review?.draft_id)) findings.push({ code: 'ORPHAN_REVIEW', reference: review?.review_id || null });
  for (const release of input.releases || []) if (!drafts.has(release?.draft_id) || (release?.review_reference && !reviews.has(release.review_reference))) findings.push({ code: 'ORPHAN_RELEASE', reference: release?.receipt_id || null });
  const caseIds = new Set((input.caseMaps || []).map(value => value?.case_id).filter(Boolean));
  for (const saved of input.savedCases || []) if (!caseIds.has(saved?.case_id) || saved?.fingerprint_current === false) findings.push({ code: 'STALE_SAVED_FINGERPRINT', reference: saved?.case_id || null });
  for (const caseId of caseIds) if (!(input.lifecycleCaseIds || []).includes(caseId)) findings.push({ code: 'MISSING_LIFECYCLE_ROW', reference: caseId });
  for (const pointer of input.deletedPointers || []) findings.push({ code: 'DELETED_CASE_POINTER', reference: pointer });
  return seal({
    schema: ASH_COMPATIBILITY_AUDIT_SCHEMA,
    mode: 'DRY_AUDIT_ONLY',
    observed_at: input.observedAt || new Date().toISOString(),
    findings,
    mutation_performed: false,
    migration_performed: false,
    audit_digest: null
  }, 'audit_digest', DIGEST_DOMAINS.compatibility, 'ash_compat', options);
}
