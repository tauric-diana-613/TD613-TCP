import { GivingError, sha256 } from './util.js';
import {
  SESSION_ROLES,
  assertOwnerSecret,
  sessionConfiguration
} from './security.js';

const TABLE = 'td613_giving_shared_access';
const ROW_ID = 'global';
const readinessByFetch = new WeakMap();

function databaseConfiguration() {
  const connectionString = String(process.env.TD613_GIVING_NEON_DATABASE_URL || '');
  if (!connectionString) return null;
  let parsed;
  try {
    parsed = new URL(connectionString);
  } catch {
    return null;
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !/\.neon\.tech$/i.test(parsed.hostname)) return null;
  return { connectionString, endpoint: `https://${parsed.hostname}/sql` };
}

function controlConfigured() {
  const session = sessionConfiguration();
  return Boolean(session.collaborator_eviction_authority_ready && databaseConfiguration());
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
  const config = databaseConfiguration();
  if (!config) {
    throw new GivingError(
      'shared-access-ledger-unavailable',
      'Durable shared-access control requires the admitted Giving Neon boundary',
      503
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetchImpl(config.endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Neon-Connection-String': config.connectionString,
        'Neon-Raw-Text-Output': 'true',
        'Neon-Array-Mode': 'true'
      },
      body: JSON.stringify({ query, params })
    });
    if (!response.ok) throw new GivingError('shared-access-ledger-upstream-error', `Giving shared-access ledger returned HTTP ${response.status}`, 502);
    return rowsFromNeon(await response.json());
  } catch (error) {
    if (error instanceof GivingError) throw error;
    if (error?.name === 'AbortError') throw new GivingError('shared-access-ledger-timeout', 'Giving shared-access ledger did not answer inside its bounded window', 504);
    throw new GivingError('shared-access-ledger-unavailable', 'Giving shared-access ledger request failed', 502);
  } finally {
    clearTimeout(timer);
  }
}

async function ensureTable(fetchImpl = fetch) {
  if (typeof fetchImpl !== 'function') throw new GivingError('shared-access-ledger-unavailable', 'A fetch implementation is required for shared-access control', 503);
  let ready = readinessByFetch.get(fetchImpl);
  if (!ready) {
    ready = (async () => {
      await neonSql(`CREATE TABLE IF NOT EXISTS ${TABLE} (
        id text PRIMARY KEY,
        shared_enabled boolean NOT NULL DEFAULT true,
        revoked_before_ms bigint NOT NULL DEFAULT 0,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`, [], fetchImpl);
      await neonSql(`INSERT INTO ${TABLE} (id, shared_enabled, revoked_before_ms)
        VALUES ($1, true, 0)
        ON CONFLICT (id) DO NOTHING`, [ROW_ID], fetchImpl);
      return true;
    })().catch((error) => {
      readinessByFetch.delete(fetchImpl);
      throw error;
    });
    readinessByFetch.set(fetchImpl, ready);
  }
  return ready;
}

function normalizeState(row = null) {
  const enabled = row?.shared_enabled === true || row?.shared_enabled === 'true' || row?.shared_enabled === 1 || row?.shared_enabled === '1';
  const revoked = Number(row?.revoked_before_ms || 0);
  return Object.freeze({
    shared_enabled: enabled,
    revoked_before_ms: Number.isFinite(revoked) && revoked > 0 ? revoked : 0
  });
}

async function readState(fetchImpl = fetch) {
  await ensureTable(fetchImpl);
  const rows = await neonSql(`SELECT shared_enabled, revoked_before_ms FROM ${TABLE} WHERE id = $1 LIMIT 1`, [ROW_ID], fetchImpl);
  return normalizeState(rows[0]);
}

export function sharedAccessControlReadiness() {
  const session = sessionConfiguration();
  const database = databaseConfiguration();
  return Object.freeze({
    configured: Boolean(session.collaborator_eviction_authority_ready && database),
    owner_authority_configured: Boolean(session.collaborator_eviction_authority_ready),
    durable_ledger_configured: Boolean(database),
    host_digest: database ? sha256(database.endpoint) : null,
    payload_logged: false,
    collaborator_secret_rotated: false
  });
}

export async function assertSharedLoginAllowed(role, { fetchImpl = fetch } = {}) {
  if (role === SESSION_ROLES.OWNER || !controlConfigured()) return null;
  const state = await readState(fetchImpl);
  if (!state.shared_enabled) {
    throw new GivingError('shared-access-locked', 'Shared Giving access has been locked by the owner', 401);
  }
  return state;
}

export async function assertSharedSessionAdmitted(session, { fetchImpl = fetch } = {}) {
  const role = session?.role === SESSION_ROLES.OWNER ? SESSION_ROLES.OWNER : SESSION_ROLES.COLLABORATOR;
  if (role === SESSION_ROLES.OWNER || !controlConfigured()) return null;
  const state = await readState(fetchImpl);
  if (!state.shared_enabled) {
    throw new GivingError('shared-access-locked', 'This shared Giving session has been evicted by the owner', 401);
  }
  const issuedMs = Number.isFinite(session?.iat_ms) ? Number(session.iat_ms) : Number(session?.iat || 0) * 1000;
  if (state.revoked_before_ms && (!issuedMs || issuedMs <= state.revoked_before_ms)) {
    throw new GivingError('session-revoked', 'This shared Giving session predates the owner revocation boundary', 401);
  }
  return state;
}

export async function setSharedAccess({ enabled, ownerSecret, session, fetchImpl = fetch } = {}) {
  if (!controlConfigured()) {
    throw new GivingError(
      'shared-access-control-unavailable',
      'Configure a separate Giving owner secret and the admitted Neon boundary before using collaborator eviction',
      503
    );
  }
  if (!session?.sid) throw new GivingError('invalid-session', 'A signed Giving session is required for shared-access control', 401);
  if (session?.role !== SESSION_ROLES.OWNER) {
    throw new GivingError('owner-session-required', 'Changing shared Giving access requires a signed owner session', 403);
  }
  assertOwnerSecret(ownerSecret);
  await ensureTable(fetchImpl);
  const cutoff = Date.now();
  const rows = await neonSql(`UPDATE ${TABLE}
    SET shared_enabled = $1,
        revoked_before_ms = CASE WHEN $1::boolean = false THEN $2::bigint ELSE revoked_before_ms END,
        updated_at = now()
    WHERE id = $3
    RETURNING shared_enabled, revoked_before_ms`, [Boolean(enabled), cutoff, ROW_ID], fetchImpl);
  const state = normalizeState(rows[0]);
  return Object.freeze({
    schema: 'td613.giving.shared-access-state/v1',
    shared_access: state.shared_enabled ? 'OPEN' : 'LOCKED',
    sessions_issued_before_last_lock_rejected: state.revoked_before_ms > 0,
    owner_session_required_to_reopen: true,
    shared_secret_changed: false,
    payload_logged: false
  });
}

export async function publicSharedAccessState(session, { fetchImpl = fetch } = {}) {
  const readiness = sharedAccessControlReadiness();
  if (!readiness.configured) {
    return Object.freeze({
      schema: 'td613.giving.shared-access-state/v1',
      configured: false,
      role: session?.role === SESSION_ROLES.OWNER ? SESSION_ROLES.OWNER : SESSION_ROLES.COLLABORATOR,
      shared_access: 'UNMANAGED',
      owner_session: session?.role === SESSION_ROLES.OWNER
    });
  }
  const state = await readState(fetchImpl);
  return Object.freeze({
    schema: 'td613.giving.shared-access-state/v1',
    configured: true,
    role: session?.role === SESSION_ROLES.OWNER ? SESSION_ROLES.OWNER : SESSION_ROLES.COLLABORATOR,
    shared_access: state.shared_enabled ? 'OPEN' : 'LOCKED',
    owner_session: session?.role === SESSION_ROLES.OWNER,
    sessions_issued_before_last_lock_rejected: state.revoked_before_ms > 0
  });
}

export const _sharedAccessInternals = Object.freeze({
  databaseConfiguration,
  controlConfigured,
  rowsFromNeon,
  normalizeState,
  readState
});
