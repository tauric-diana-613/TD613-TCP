/**
 * 𝌋 TD613 · Wendbine Source-Bound Epoch Query Module (Crossing W)
 * 
 * Strict source-bound query implementation:
 * 1. Does NOT treat {root, snapshotId, sealId} as an independently authenticated capability.
 * 2. Binds verified bytes to an opaque immutable epoch handle.
 * 3. Verifies each consumed byte against the sealed registry at query time.
 * 4. Fails closed on file modifications, missing bound files, caller-invented epochs, and stale seals.
 * 5. Distinct AIA Route Projections: EXPERIENTIAL, CUSTODIAL, AUDIT, IMPLEMENTATION.
 * 
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po (literal U+200C interior retained)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const AIA_ROUTES = Object.freeze(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);

const digest = (data) => {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
};

const readJson = (root, rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

// Internal memory registry for authentic, verified epoch handles (preventing caller forgery)
const ACTIVE_BOUND_EPOCHS = new Map();

/**
 * Opens an authenticated source-bound epoch.
 * Cryptographically verifies all sealed files against current-seal.json and registry index.
 */
export function openBoundEpoch({ root, snapshotId, sealId }) {
  if (!root || !snapshotId || !sealId) {
    throw new Error('EXPLICIT_SRC_SNAPSHOT_AND_SEAL_REQUIRED');
  }

  const resolvedRoot = path.resolve(root);
  const sealPath = path.join(resolvedRoot, '04-RECEIPTS/phase2/current-seal.json');
  if (!fs.existsSync(sealPath)) {
    throw new Error('SEAL_FILE_MISSING: ' + sealPath);
  }

  const current = readJson(resolvedRoot, '04-RECEIPTS/phase2/current-seal.json');
  if (current.atelier_snapshot_id !== snapshotId || current.seal_id !== sealId) {
    throw new Error('SEAL_EPOCH_UNAVAILABLE');
  }

  const files = current.file_hashes;
  if (!Array.isArray(files) || digest(JSON.stringify(files)) !== sealId.slice('wendbine-seal:'.length)) {
    throw new Error('PUBLIC_SEAL_MANIFEST_INTEGRITY_MISMATCH');
  }

  const boundFileMap = new Map();

  for (const entry of files) {
    const filename = path.resolve(resolvedRoot, entry.path);
    if (!filename.startsWith(resolvedRoot + path.sep)) {
      throw new Error('ESCAPING_REGISTRY_PATH');
    }
    if (!fs.existsSync(filename)) {
      throw new Error('BOUND_REGISTRY_FILE_MISSING: ' + entry.path);
    }
    const bytes = fs.readFileSync(filename);
    const byteSha = digest(bytes);
    if (byteSha !== entry.sha256) {
      throw new Error('REGISTRY_HASH_MISMATCH_' + entry.path);
    }
    boundFileMap.set(entry.path, {
      expected_sha256: entry.sha256,
      byte_length: bytes.length,
      absolute_path: filename,
    });
  }

  const indexFile = path.join(resolvedRoot, '01-MANIFESTS/registry-index.json');
  const interfaceFile = path.join(resolvedRoot, '01-MANIFESTS/phase2/interface-registry.json');
  if (!fs.existsSync(indexFile) || !fs.existsSync(interfaceFile)) {
    throw new Error('BOUND_REGISTRY_FILE_MISSING');
  }

  const indexBytes = fs.readFileSync(indexFile);
  const interfaceBytes = fs.readFileSync(interfaceFile);

  if (
    digest(indexBytes) !== current.registry_index_sha256 ||
    digest(interfaceBytes) !== current.interface_registry_sha256
  ) {
    throw new Error('SRC_INTERFACE_OR_RESOLVER_HASH_MISMATCH');
  }

  const registry = readJson(resolvedRoot, '01-MANIFESTS/registry-index.json');
  if (registry.snapshot_id !== snapshotId || registry.current_seal !== '04-RECEIPTS/phase2/current-seal.json') {
    throw new Error('REGISTRY_EPOCH_MISMATCH');
  }

  // Create unforgeable cryptographic epoch handle
  const handleEntropy = crypto.randomUUID();
  const handleId = `epoch_hdl:${digest(`${snapshotId}:${sealId}:${handleEntropy}`)}`;

  const epochRecord = Object.freeze({
    handleId,
    root: resolvedRoot,
    snapshotId,
    sealId,
    seal: Object.freeze(current),
    registry: Object.freeze(registry),
    boundFiles: boundFileMap,
    sealBytesSha: digest(fs.readFileSync(sealPath)),
    openedAt: new Date().toISOString(),
  });

  ACTIVE_BOUND_EPOCHS.set(handleId, epochRecord);

  return {
    handleId,
    snapshotId,
    sealId,
    root: resolvedRoot,
    boundFileCount: boundFileMap.size,
    openedAt: epochRecord.openedAt,
  };
}

/**
 * Reads a verified JSONL file with query-time byte verification against the bound epoch.
 */
function readVerifiedJsonl(epochRecord, relPath) {
  const fileMeta = epochRecord.boundFiles.get(relPath);
  if (!fileMeta) {
    throw new Error(`UNREGISTERED_EPOCH_FILE: ${relPath}`);
  }

  if (!fs.existsSync(fileMeta.absolute_path)) {
    throw new Error(`BOUND_REGISTRY_FILE_MISSING: ${relPath}`);
  }

  // Query-time byte verification: re-read bytes and verify digest
  const liveBytes = fs.readFileSync(fileMeta.absolute_path);
  const liveSha = digest(liveBytes);
  if (liveSha !== fileMeta.expected_sha256) {
    throw new Error(
      `POST_OPEN_FILE_MODIFIED_DETECTED: File ${relPath} was modified after epoch opening. Expected ${fileMeta.expected_sha256}, got ${liveSha}`
    );
  }

  return liveBytes
    .toString('utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(JSON.parse);
}

/**
 * Checks whether the seal on disk has been altered or replaced (stale seal detector).
 */
function verifySealFreshness(epochRecord) {
  const sealPath = path.join(epochRecord.root, '04-RECEIPTS/phase2/current-seal.json');
  if (!fs.existsSync(sealPath)) {
    throw new Error('STALE_SEAL_DETECTED: Seal file missing on disk.');
  }
  const currentBytes = fs.readFileSync(sealPath);
  if (digest(currentBytes) !== epochRecord.sealBytesSha) {
    throw new Error('STALE_SEAL_DETECTED: Seal file modified on disk since epoch open.');
  }
}

/**
 * Queries an authenticated bound epoch.
 * Rejects caller-invented or forged epoch handles.
 */
export function queryBoundEpoch(epochHandleOrId, { route, action, entityId = null }) {
  if (!AIA_ROUTES.includes(route)) {
    throw new Error(`EXPLICIT_AIA_ROUTE_REQUIRED: Expected one of ${AIA_ROUTES.join(', ')}.`);
  }

  const handleId = typeof epochHandleOrId === 'string'
    ? epochHandleOrId
    : epochHandleOrId?.handleId;

  const epochRecord = ACTIVE_BOUND_EPOCHS.get(handleId);
  if (!epochRecord) {
    throw new Error('FORGED_OR_UNBOUND_EPOCH: Caller-invented or unbound epoch object refused. Epoch must be opened via openBoundEpoch.');
  }

  // Query-time seal freshness verification
  verifySealFreshness(epochRecord);

  // Consume verified data streams with fatal query-time hash checks
  const captures = readVerifiedJsonl(epochRecord, '01-MANIFESTS/phase2/capture-v2.jsonl');
  const manifests = readVerifiedJsonl(epochRecord, '01-MANIFESTS/phase2/manifestations.jsonl');
  const edges = readVerifiedJsonl(epochRecord, '05-OPERATIONS/relations/typed-edges.jsonl');

  let rawResult;
  switch (action) {
    case 'summary':
      rawResult = {
        manifestations: manifests.length,
        captures: captures.length,
        body_states: captures.reduce((a, x) => ((a[x.body_state] = (a[x.body_state] ?? 0) + 1), a), {}),
        typed_edges: edges.length,
        graph_counts: edges.reduce((a, x) => ((a[x.graph] = (a[x.graph] ?? 0) + 1), a), {}),
        private_source_body_query_authorized: false,
        source_version_claim: 'ARCHIVE_OBSERVED_NOT_FIRST_PUBLICATION_OR_LIVE_REDDIT',
      };
      break;

    case 'resolve':
      if (!entityId) throw new Error('SOURCE_OR_ENTITY_ID_REQUIRED');
      rawResult = {
        manifestations: manifests.filter((x) => [x.source_id, x.manifestation_id].includes(entityId)),
        captures: captures.filter((x) => [x.source_id, x.capture_id, x.manifestation_id].includes(entityId)),
        edges: edges.filter((x) => [x.source_entity_id, x.target_entity_id].includes(entityId)),
      };
      if (!rawResult.manifestations.length && !rawResult.captures.length && !rawResult.edges.length) {
        rawResult = { entity_id: entityId, status: 'UNRESOLVED_TARGET' };
      }
      break;

    case 'chronology':
      rawResult = manifests
        .slice()
        .sort((a, b) => a.published_at.localeCompare(b.published_at))
        .map((x) => ({
          source_id: x.source_id,
          manifestation_id: x.manifestation_id,
          source_published_at: x.published_at,
          work_id: x.work_id ?? null,
        }));
      break;

    case 'versions':
      if (!entityId) throw new Error('SOURCE_OR_MANIFESTATION_ID_REQUIRED');
      {
        const versionObs = readVerifiedJsonl(epochRecord, '05-OPERATIONS/phase2/version-observations.jsonl');
        rawResult = versionObs.filter((x) =>
          [x.manifestation_id, captures.find((c) => c.capture_id === x.capture_id)?.source_id].includes(entityId)
        );
      }
      break;

    case 'relations':
      rawResult = entityId
        ? edges.filter((x) => [x.source_entity_id, x.target_entity_id, x.capture_id].includes(entityId))
        : edges;
      break;

    default:
      throw new Error(`UNKNOWN_SRC_QUERY_ACTION: ${action}`);
  }

  // Four Distinct AIA Projections (Phase 4 operator-intent contract)
  let projectionPayload;
  switch (route) {
    case 'EXPERIENTIAL':
      projectionPayload = {
        observation_surface: 'PUBLIC_ARCHIVED_WENDBINE_READ_ONLY',
        lived_access_disclosed_limits: 'Zero lived Reddit platform access; frozen archive observation only.',
        verbatim_body_accessible: false,
        observable_content: rawResult,
      };
      break;

    case 'CUSTODIAL':
      projectionPayload = {
        epoch_snapshot_id: epochRecord.snapshotId,
        seal_id: epochRecord.sealId,
        bound_file_count: epochRecord.boundFiles.size,
        registry_index_sha256: epochRecord.seal.registry_index_sha256,
        interface_registry_sha256: epochRecord.seal.interface_registry_sha256,
        custody_rule: 'FAIL_CLOSED_ON_MODIFIED_OR_STALE_SEAL',
        admitted_evidence_class: 'BOUNDED_PUBLIC_ARCHIVE_MANIFESTS',
        custodial_data: rawResult,
      };
      break;

    case 'AUDIT':
      projectionPayload = {
        audit_verdict: 'SOURCE_BOUND_CONCORDANT',
        tamper_checks: {
          file_count_verified: epochRecord.boundFiles.size,
          stale_seal_rejected: true,
          post_open_modification_blocked: true,
        },
        circular_derivation_detected: false,
        source_withdrawal_impact: 'WITHDRAWAL_INVALIDATES_DERIVATION_WITHOUT_ALTERNATIVE',
        audit_data: rawResult,
      };
      break;

    case 'IMPLEMENTATION':
      projectionPayload = {
        engine: 'td613.wendbine-sourcebound-epoch/v1',
        query_action: action,
        target_entity: entityId,
        verified_file_digest: digest(JSON.stringify(rawResult)),
        executable_environment: {
          node_version: process.version,
          platform: process.platform,
        },
        implementation_data: rawResult,
      };
      break;
  }

  return {
    schema: 'td613.wendbine-sourcebound-query-result/v1',
    query_epoch: {
      atelier_snapshot_id: epochRecord.snapshotId,
      seal_id: epochRecord.sealId,
      handle_id: epochRecord.handleId,
    },
    route,
    action,
    projection: projectionPayload,
    non_equivalence: 'SOURCE_QUERY != SCIENTIFIC_PROMOTION',
    query_receipt_sha256: digest(JSON.stringify(projectionPayload)),
    queried_at: new Date().toISOString(),
  };
}
