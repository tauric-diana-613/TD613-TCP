import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const ASH_LIFECYCLE_SCHEMA = 'td613.ash.lifecycle/v0.1';
export const ASH_READINESS_SCHEMA = 'td613.ash.readiness-receipt/v0.1';
export const ASH_LIFECYCLE_RECEIPT_SCHEMA = 'td613.ash.lifecycle-receipt/v0.1';

export const ASH_LIFECYCLE_STATES = Object.freeze({
  ARRIVAL_UNPERSISTED: 'ARRIVAL_UNPERSISTED',
  READINESS_OBSERVED: 'READINESS_OBSERVED',
  CUSTODY_ROOT_PROVISIONAL: 'CUSTODY_ROOT_PROVISIONAL',
  CUSTODY_ROOT_VERIFIED: 'CUSTODY_ROOT_VERIFIED',
  CASE_BOUND: 'CASE_BOUND',
  REBUILD_ELIGIBLE: 'REBUILD_ELIGIBLE',
  RELEASE_ELIGIBLE: 'RELEASE_ELIGIBLE',
  CONTINUITY_SEALED: 'CONTINUITY_SEALED',
  HELD: 'HELD'
});

const DIGEST_DOMAIN_READINESS = 'TD613:ASH:READINESS:v1';
const DIGEST_DOMAIN_LIFECYCLE = 'TD613:ASH:LIFECYCLE:v1';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function rejectRawContent(input = {}) {
  const forbidden = ['body', 'text', 'content', 'raw', 'rawText', 'raw_text', 'bytes', 'buffer', 'sourceText'];
  for (const key of forbidden) {
    if (Object.hasOwn(input, key) && input[key] != null && input[key] !== '') {
      throw new Error(`Ash Readiness rejects raw content field: ${key}`);
    }
  }
}

function receiptReference(receipt) {
  return receipt?.receipt_id || receipt?.local_receipt_id || receipt?.manifest_digest || receipt?.receipt_digest || null;
}

function custodyDigest(receipt) {
  return receipt?.receipt_digest || receipt?.manifest_digest || receipt?.manifest?.manifest_digest || null;
}

function currentRebuild(caseMap, latestTest) {
  if (!caseMap || !latestTest) return false;
  return latestTest.case_id === caseMap.case_id && latestTest.case_map_digest === caseMap.case_map_digest && latestTest.review_state !== 'HELD';
}

function currentDraft(caseMap, latestDraft) {
  if (!caseMap || !latestDraft) return false;
  return latestDraft.case_id === caseMap.case_id && latestDraft.case_map_digest === caseMap.case_map_digest;
}

function currentReview(caseMap, latestDraft, latestReview) {
  if (!currentDraft(caseMap, latestDraft) || !latestReview) return false;
  return latestReview.draft_id === latestDraft.draft_id &&
    latestReview.draft_digest === latestDraft.draft_digest &&
    latestReview.case_map_digest === caseMap.case_map_digest &&
    latestReview.status === 'READY_FOR_LOCAL_RELEASE_APPROVAL' &&
    latestReview.local_export_approved === true;
}

function currentRelease(caseMap, latestDraft, latestReview, latestRelease) {
  if (!currentReview(caseMap, latestDraft, latestReview) || !latestRelease) return false;
  return latestRelease.case_id === caseMap.case_id &&
    latestRelease.case_map_digest === caseMap.case_map_digest &&
    latestRelease.draft_id === latestDraft.draft_id &&
    latestRelease.draft_digest === latestDraft.draft_digest &&
    latestRelease.review_reference === latestReview.review_id;
}

function currentSave(caseMap, latestSavePoint) {
  if (!caseMap || !latestSavePoint) return false;
  return latestSavePoint.case_id === caseMap.case_id && latestSavePoint.case_map_digest === caseMap.case_map_digest && latestSavePoint.tamper_state !== 'TAMPERED';
}

export async function compileReadinessReceipt(input = {}, options = {}) {
  rejectRawContent(input);
  const observedAt = input.observedAt || new Date().toISOString();
  const record = {
    schema: ASH_READINESS_SCHEMA,
    lifecycle_schema: ASH_LIFECYCLE_SCHEMA,
    state: ASH_LIFECYCLE_STATES.READINESS_OBSERVED,
    observed_at: observedAt,
    source_surface: String(input.sourceSurface || 'ash-threshold'),
    artifact_posture: {
      artifact_class: String(input.artifactClass || 'unclassified'),
      media_type: input.mediaType ? String(input.mediaType) : null,
      byte_length: Number.isSafeInteger(input.byteLength) && input.byteLength >= 0 ? input.byteLength : null,
      local_commitment_reference: input.localCommitmentReference ? String(input.localCommitmentReference) : null
    },
    threshold_gestures: {
      arrival_acknowledged: input.arrivalAcknowledged === true,
      boundary_acknowledged: input.boundaryAcknowledged === true,
      custody_acknowledged: input.custodyAcknowledged === true
    },
    source_status: 'OBSERVED',
    raw_content_accepted: false,
    raw_content_persisted: false,
    transport_performed: false,
    readiness_is_custody: false,
    missingness: unique(input.missingness || ['custody receipt not yet verified', 'case root not yet bound']),
    alternatives: unique(input.alternatives || ['metadata-only custody root', 'browser-local exact-byte commitment', 'continue without artifact bytes']),
    open_questions: unique(input.openQuestions || ['Which artifact or metadata object should become the custody root?']),
    claim_ceiling: 'quick-scan-readiness-not-custody-or-intake-authority',
    readiness_digest: null
  };
  const readinessSubject = { ...record };
  delete readinessSubject.readiness_digest;
  record.readiness_digest = await canonicalDigest(DIGEST_DOMAIN_READINESS, readinessSubject, options);
  record.receipt_id = `ash_readiness_${record.readiness_digest.slice(-20)}`;
  return Object.freeze(record);
}

export function buildCustodyRoot({ caseMap, custodyReceipt, readinessReceipt = null } = {}) {
  if (!caseMap?.case_id || !caseMap?.rooms?.length) throw new Error('A current Case Map is required before custody can become a case root.');
  const reference = receiptReference(custodyReceipt);
  if (!reference) throw new Error('A custody receipt reference is required.');
  const digest = custodyDigest(custodyReceipt) || reference;
  const suffix = String(digest).replace(/[^a-z0-9]/gi, '').slice(-18).toLowerCase() || 'local';
  const rootId = `node_custody_${suffix}`;
  const alreadyBound = caseMap.nodes?.find(node => node.custody_reference === reference || node.id === rootId);
  const rootNode = alreadyBound || {
    id: rootId,
    type: 'artifact',
    label: custodyReceipt?.manifest?.source_locator?.label || custodyReceipt?.manifest?.sourceLocator?.label || readinessReceipt?.artifact_posture?.artifact_class || 'Custody root',
    notes: 'Verified or declared custody root. Artifact bytes remain outside the Case Map.',
    room_id: caseMap.rooms[0].id,
    sensitivity: 'PRIVATE',
    source_status: 'OBSERVED',
    confidence_posture: 'HELD',
    custody_reference: reference,
    disclosure_state: 'LOCAL',
    chronology_index: 0
  };
  const nodes = alreadyBound
    ? caseMap.nodes.map(node => ({ ...node }))
    : [rootNode, ...(caseMap.nodes || []).map(node => ({ ...node, chronology_index: Number(node.chronology_index || 0) + 1 }))];
  return Object.freeze({
    custody_reference: reference,
    custody_digest: digest,
    root_node: clone(rootNode),
    nodes,
    evidence_basis_additions: [
      `custody receipt ${reference}`,
      readinessReceipt ? `readiness receipt ${readinessReceipt.receipt_id}` : null
    ].filter(Boolean),
    observation: {
      kind: 'ASH_CUSTODY_ROOT_BOUND',
      custody_reference: reference,
      custody_digest: digest,
      readiness_reference: readinessReceipt?.receipt_id || null,
      raw_content_imported: false
    }
  });
}

export function deriveAshLifecycle(input = {}) {
  const readinessReceipt = input.readinessReceipt || null;
  const custodyReceipt = input.custodyReceipt || null;
  const custodyVerified = input.custodyVerified === true;
  const caseMap = input.caseMap || null;
  const latestTest = input.latestTest || null;
  const latestDraft = input.latestDraft || null;
  const latestReview = input.latestReview || null;
  const latestRelease = input.latestRelease || null;
  const latestSavePoint = input.latestSavePoint || null;
  const reference = receiptReference(custodyReceipt);
  const caseBound = Boolean(caseMap && reference && caseMap.custody_reference === reference && caseMap.nodes?.some(node => node.custody_reference === reference));
  const rebuildCurrent = caseBound && currentRebuild(caseMap, latestTest);
  const draftCurrent = rebuildCurrent && currentDraft(caseMap, latestDraft);
  const reviewReady = draftCurrent && currentReview(caseMap, latestDraft, latestReview);
  const releaseCurrent = reviewReady && currentRelease(caseMap, latestDraft, latestReview, latestRelease);
  const continuityCurrent = releaseCurrent && currentSave(caseMap, latestSavePoint);

  const holds = [];
  if (!readinessReceipt) holds.push('READINESS_NOT_OBSERVED');
  if (!custodyReceipt) holds.push('CUSTODY_ROOT_ABSENT');
  else if (!custodyVerified) holds.push('CUSTODY_DIGEST_NOT_VERIFIED');
  if (custodyVerified && !caseBound) holds.push('CUSTODY_ROOT_NOT_BOUND_TO_CASE');
  if (caseBound && !rebuildCurrent) holds.push('CURRENT_REBUILD_TEST_ABSENT');
  if (rebuildCurrent && !draftCurrent) holds.push('CURRENT_CUSTODY_BOUND_DRAFT_ABSENT');
  if (draftCurrent && !reviewReady) holds.push('LOCAL_RELEASE_REVIEW_NOT_READY');
  if (reviewReady && !releaseCurrent) holds.push('RELEASE_RECEIPT_NOT_KEPT');
  if (releaseCurrent && !continuityCurrent) holds.push('CURRENT_CONTINUITY_NOT_SEALED');

  let state = ASH_LIFECYCLE_STATES.ARRIVAL_UNPERSISTED;
  if (readinessReceipt) state = ASH_LIFECYCLE_STATES.READINESS_OBSERVED;
  if (custodyReceipt) state = custodyVerified ? ASH_LIFECYCLE_STATES.CUSTODY_ROOT_VERIFIED : ASH_LIFECYCLE_STATES.CUSTODY_ROOT_PROVISIONAL;
  if (caseBound) state = ASH_LIFECYCLE_STATES.CASE_BOUND;
  if (rebuildCurrent) state = ASH_LIFECYCLE_STATES.REBUILD_ELIGIBLE;
  if (releaseCurrent) state = ASH_LIFECYCLE_STATES.RELEASE_ELIGIBLE;
  if (continuityCurrent) state = ASH_LIFECYCLE_STATES.CONTINUITY_SEALED;

  const gates = Object.freeze({
    custody: true,
    map: Boolean(caseMap),
    rooms: caseBound,
    routes: caseBound,
    test: caseBound,
    draft: rebuildCurrent,
    local_release: reviewReady,
    save: releaseCurrent
  });

  const nextAction = !readinessReceipt ? 'CLEAR_ASH_THRESHOLD'
    : !custodyReceipt ? 'REGISTER_CUSTODY_ROOT'
      : !custodyVerified ? 'VERIFY_CUSTODY_DIGEST_SPINE'
        : !caseMap ? 'CREATE_CASE'
          : !caseBound ? 'BIND_CUSTODY_ROOT_TO_CASE'
            : !rebuildCurrent ? 'RUN_CURRENT_REBUILD_TEST'
              : !draftCurrent ? 'KEEP_CUSTODY_BOUND_DRAFT'
                : !reviewReady ? 'REVIEW_EXACT_DRAFT'
                  : !releaseCurrent ? 'KEEP_RELEASE_RECEIPT'
                    : !continuityCurrent ? 'SEAL_CONTINUITY'
                      : 'TEND_CASE';

  return Object.freeze({
    schema: ASH_LIFECYCLE_SCHEMA,
    state,
    next_action: nextAction,
    gates,
    holds,
    references: {
      readiness_receipt: readinessReceipt?.receipt_id || null,
      custody_receipt: reference,
      case_id: caseMap?.case_id || null,
      case_map_digest: caseMap?.case_map_digest || null,
      rebuild_test: rebuildCurrent ? latestTest.test_id : null,
      draft: draftCurrent ? latestDraft.draft_id : null,
      release_receipt: releaseCurrent ? latestRelease.receipt_id : null,
      save_point: continuityCurrent ? latestSavePoint.save_point_id : null
    },
    non_authority: [
      'readiness is not custody',
      'custody is not authenticity',
      'case binding is not truth',
      'rebuild eligibility is not release authority',
      'continuity is not transport'
    ]
  });
}

export function workspaceGate(lifecycle, workspace) {
  if (!lifecycle?.gates) return Object.freeze({ allowed: false, reason: 'LIFECYCLE_UNAVAILABLE' });
  const normalized = workspace === 'release' ? 'local_release' : workspace;
  const allowed = lifecycle.gates[normalized] !== false;
  return Object.freeze({
    allowed,
    reason: allowed ? 'OPEN' : lifecycle.next_action,
    state: lifecycle.state
  });
}

export async function compileLifecycleReceipt(lifecycle, options = {}) {
  if (!lifecycle?.schema || lifecycle.schema !== ASH_LIFECYCLE_SCHEMA) throw new Error('A derived Ash lifecycle is required.');
  const record = {
    schema: ASH_LIFECYCLE_RECEIPT_SCHEMA,
    lifecycle: clone(lifecycle),
    observed_at: options.observedAt || new Date().toISOString(),
    implementation_posture: 'workflow-state-not-identity-or-truth-proof',
    lifecycle_digest: null
  };
  const lifecycleSubject = { ...record };
  delete lifecycleSubject.lifecycle_digest;
  record.lifecycle_digest = await canonicalDigest(DIGEST_DOMAIN_LIFECYCLE, lifecycleSubject, options);
  record.receipt_id = `ash_lifecycle_${record.lifecycle_digest.slice(-20)}`;
  return Object.freeze(record);
}
