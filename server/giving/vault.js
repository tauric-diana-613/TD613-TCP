import { GivingError, canonicalJson, cleanText, sha256 } from './util.js';

const TABLE = 'td613_giving_vault_versions';
const MAX_CIPHERTEXT_CHARS = 2_600_000;

function neonConfiguration() {
  const connectionString = String(process.env.TD613_GIVING_NEON_DATABASE_URL || '');
  if (!connectionString) throw new GivingError('vault-unavailable', 'Hosted encrypted custody is not configured', 503);
  let parsed;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new GivingError('vault-unavailable', 'Hosted encrypted custody configuration is invalid', 503);
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !/\.neon\.tech$/i.test(parsed.hostname)) {
    throw new GivingError('vault-host-withheld', 'Hosted custody host is outside the admitted Neon boundary', 503);
  }
  return {
    connectionString,
    endpoint: `https://${parsed.hostname}/sql`
  };
}

function rowsFromNeon(body) {
  if (Array.isArray(body?.rows) && body.rows.every((row) => !Array.isArray(row))) return body.rows;
  if (Array.isArray(body?.rows) && Array.isArray(body?.fields)) {
    const names = body.fields.map((field) => field.name);
    return body.rows.map((row) => Object.fromEntries(names.map((name, index) => [name, row[index]])));
  }
  if (Array.isArray(body) && body[0]?.rows) return rowsFromNeon(body[0]);
  return [];
}

async function neonSql(query, params = [], fetchImpl = fetch) {
  const configuration = neonConfiguration();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetchImpl(configuration.endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Neon-Connection-String': configuration.connectionString,
        'Neon-Raw-Text-Output': 'true',
        'Neon-Array-Mode': 'true'
      },
      body: JSON.stringify({ query, params })
    });
    if (!response.ok) throw new GivingError('vault-upstream-error', `Encrypted vault returned HTTP ${response.status}`, 502);
    return rowsFromNeon(await response.json());
  } catch (error) {
    if (error instanceof GivingError) throw error;
    if (error?.name === 'AbortError') throw new GivingError('vault-timeout', 'Encrypted vault did not complete within its bounded window', 504);
    throw new GivingError('vault-unavailable', 'Encrypted vault request failed', 502);
  } finally {
    clearTimeout(timer);
  }
}

async function ensureTable(fetchImpl) {
  await neonSql(`CREATE TABLE IF NOT EXISTS ${TABLE} (
    owner_hash text NOT NULL,
    dossier_id text NOT NULL,
    version_id text NOT NULL,
    parent_version_id text,
    merge_parent_version_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    ciphertext text NOT NULL,
    wrapped_key jsonb NOT NULL,
    crypto_meta jsonb NOT NULL,
    content_digest text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (owner_hash, dossier_id, version_id)
  )`, [], fetchImpl);
  await neonSql(`CREATE INDEX IF NOT EXISTS td613_giving_vault_owner_dossier_idx
    ON ${TABLE} (owner_hash, dossier_id, created_at DESC)`, [], fetchImpl);
}

function validateIdentifier(value, field) {
  const text = cleanText(value, 180);
  if (!text || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{2,179}$/.test(text)) {
    throw new GivingError('invalid-vault-field', `${field} must be a bounded opaque identifier`, 400, { field });
  }
  return text;
}

function validateCiphertextEnvelope(payload, { resolving = false } = {}) {
  const allowed = new Set([
    'dossier_id', 'version_id', 'parent_version_id', 'merge_parent_version_ids',
    'ciphertext', 'wrapped_key', 'crypto', 'content_digest', 'custody_mode'
  ]);
  const unknown = Object.keys(payload || {}).filter((key) => !allowed.has(key));
  if (unknown.length) {
    throw new GivingError('vault-plaintext-withheld', 'Hosted vault accepts ciphertext envelopes only', 400, { fields: unknown });
  }
  const dossierId = validateIdentifier(payload.dossier_id, 'dossier_id');
  const versionId = validateIdentifier(payload.version_id, 'version_id');
  const parentVersionId = payload.parent_version_id ? validateIdentifier(payload.parent_version_id, 'parent_version_id') : null;
  const mergeParents = Array.isArray(payload.merge_parent_version_ids)
    ? payload.merge_parent_version_ids.map((value) => validateIdentifier(value, 'merge_parent_version_ids'))
    : [];
  if (resolving && mergeParents.length < 2) {
    throw new GivingError('vault-resolution-incomplete', 'Conflict resolution must name at least two parent versions', 400);
  }
  const ciphertext = String(payload.ciphertext || '');
  if (!ciphertext || ciphertext.length > MAX_CIPHERTEXT_CHARS || !/^[A-Za-z0-9+/_=-]+$/.test(ciphertext)) {
    throw new GivingError('invalid-ciphertext', 'ciphertext must be a bounded base64/base64url envelope', 400);
  }
  if (!payload.wrapped_key || typeof payload.wrapped_key !== 'object' || Array.isArray(payload.wrapped_key)) {
    throw new GivingError('invalid-wrapped-key', 'wrapped_key metadata is required', 400);
  }
  if (!payload.crypto || typeof payload.crypto !== 'object' || Array.isArray(payload.crypto)) {
    throw new GivingError('invalid-crypto-metadata', 'crypto metadata is required', 400);
  }
  const iv = cleanText(payload.crypto.iv, 200);
  if (!iv || !cleanText(payload.crypto.algorithm, 80) || !cleanText(payload.crypto.schema, 120)) {
    throw new GivingError('invalid-crypto-metadata', 'crypto must declare algorithm, iv, and authenticated schema', 400);
  }
  const digest = cleanText(payload.content_digest, 128);
  if (!digest || !/^[a-f0-9]{64}$/i.test(digest)) throw new GivingError('invalid-content-digest', 'content_digest must be SHA-256 hex', 400);
  return {
    dossierId, versionId, parentVersionId, mergeParents, ciphertext,
    wrappedKey: payload.wrapped_key,
    crypto: payload.crypto,
    contentDigest: digest.toLowerCase(),
    custodyMode: cleanText(payload.custody_mode, 20) || 'HOSTED'
  };
}

function ownerHash(session) {
  if (!session?.sid) throw new GivingError('invalid-session', 'Operator session is required for hosted custody', 401);
  return sha256(`td613-giving-vault:${String(process.env.TD613_GIVING_ACCESS_SECRET || '')}`);
}

async function currentHeads(owner, dossierId, fetchImpl) {
  return await neonSql(`SELECT v.version_id, v.parent_version_id, v.merge_parent_version_ids, v.content_digest, v.created_at
    FROM ${TABLE} v
    WHERE v.owner_hash = $1 AND v.dossier_id = $2
      AND NOT EXISTS (
        SELECT 1 FROM ${TABLE} child
        WHERE child.owner_hash = v.owner_hash AND child.dossier_id = v.dossier_id
          AND (child.parent_version_id = v.version_id OR child.merge_parent_version_ids ? v.version_id)
      )
    ORDER BY v.created_at DESC`, [owner, dossierId], fetchImpl);
}

export async function vaultList(payload, session, context = {}) {
  await ensureTable(context.fetchImpl);
  const owner = ownerHash(session);
  const dossierId = payload?.dossier_id ? validateIdentifier(payload.dossier_id, 'dossier_id') : null;
  const rows = await neonSql(`SELECT dossier_id, version_id, parent_version_id, merge_parent_version_ids,
      content_digest, crypto_meta, created_at
    FROM ${TABLE}
    WHERE owner_hash = $1 AND ($2::text IS NULL OR dossier_id = $2)
    ORDER BY created_at DESC LIMIT 500`, [owner, dossierId], context.fetchImpl);
  return {
    custody: 'HOSTED_ENCRYPTED',
    versions: rows,
    server_plaintext_access: false
  };
}

export async function vaultRead(payload, session, context = {}) {
  await ensureTable(context.fetchImpl);
  const owner = ownerHash(session);
  const dossierId = validateIdentifier(payload.dossier_id, 'dossier_id');
  const versionId = validateIdentifier(payload.version_id, 'version_id');
  const rows = await neonSql(`SELECT dossier_id, version_id, parent_version_id, merge_parent_version_ids,
      ciphertext, wrapped_key, crypto_meta AS crypto, content_digest, created_at
    FROM ${TABLE} WHERE owner_hash = $1 AND dossier_id = $2 AND version_id = $3 LIMIT 1`,
  [owner, dossierId, versionId], context.fetchImpl);
  if (!rows[0]) throw new GivingError('vault-version-not-found', 'Encrypted dossier version was not found', 404);
  return { custody: 'HOSTED_ENCRYPTED', envelope: rows[0], server_plaintext_access: false };
}

async function insertVersion(payload, session, context, resolving) {
  await ensureTable(context.fetchImpl);
  const envelope = validateCiphertextEnvelope(payload, { resolving });
  const owner = ownerHash(session);
  const existing = await neonSql(`SELECT content_digest FROM ${TABLE}
    WHERE owner_hash = $1 AND dossier_id = $2 AND version_id = $3 LIMIT 1`,
  [owner, envelope.dossierId, envelope.versionId], context.fetchImpl);
  if (existing.length) {
    if (existing[0].content_digest === envelope.contentDigest) {
      const heads = await currentHeads(owner, envelope.dossierId, context.fetchImpl);
      return {
        custody: envelope.custodyMode === 'HYBRID' ? 'HYBRID_ENCRYPTED' : 'HOSTED_ENCRYPTED',
        dossier_id: envelope.dossierId,
        version_id: envelope.versionId,
        head_version_ids: heads.map((row) => row.version_id),
        conflict: heads.length > 1,
        idempotent_replay: true,
        server_plaintext_access: false
      };
    }
    throw new GivingError('vault-version-exists', 'Encrypted dossier version IDs are immutable', 409);
  }
  const ivReuse = await neonSql(`SELECT version_id FROM ${TABLE}
    WHERE owner_hash = $1 AND crypto_meta->>'iv' = $2 LIMIT 1`, [owner, envelope.crypto.iv], context.fetchImpl);
  if (ivReuse.length) throw new GivingError('vault-iv-reuse-withheld', 'Every encrypted dossier version requires a unique IV', 409);
  const before = await currentHeads(owner, envelope.dossierId, context.fetchImpl);
  try {
    await neonSql(`INSERT INTO ${TABLE}
      (owner_hash, dossier_id, version_id, parent_version_id, merge_parent_version_ids,
       ciphertext, wrapped_key, crypto_meta, content_digest)
      VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8::jsonb,$9)`, [
      owner, envelope.dossierId, envelope.versionId, envelope.parentVersionId,
      canonicalJson(envelope.mergeParents), envelope.ciphertext, canonicalJson(envelope.wrappedKey),
      canonicalJson(envelope.crypto), envelope.contentDigest
    ], context.fetchImpl);
  } catch (error) {
    if (/duplicate|unique/i.test(String(error?.message))) throw new GivingError('vault-version-exists', 'Encrypted dossier version already exists; immutable versions cannot be overwritten', 409);
    throw error;
  }
  const after = await currentHeads(owner, envelope.dossierId, context.fetchImpl);
  return {
    custody: envelope.custodyMode === 'HYBRID' ? 'HYBRID_ENCRYPTED' : 'HOSTED_ENCRYPTED',
    dossier_id: envelope.dossierId,
    version_id: envelope.versionId,
    head_version_ids: after.map((row) => row.version_id),
    conflict: after.length > 1,
    parallel_version_created: before.length > 0 && !envelope.parentVersionId,
    server_plaintext_access: false
  };
}

export async function vaultWrite(payload, session, context = {}) {
  return insertVersion(payload, session, context, false);
}

export async function vaultResolveConflict(payload, session, context = {}) {
  return insertVersion(payload, session, context, true);
}

export function vaultReadiness() {
  try {
    const configuration = neonConfiguration();
    return { configured: true, host_digest: sha256(configuration.endpoint), ciphertext_only: true };
  } catch {
    return { configured: false, host_digest: null, ciphertext_only: true };
  }
}

export const _vaultInternals = Object.freeze({ validateCiphertextEnvelope, rowsFromNeon });
