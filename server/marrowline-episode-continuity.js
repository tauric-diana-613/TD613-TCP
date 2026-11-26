import crypto from 'node:crypto';

export const MARROWLINE_EPISODE_CONTINUITY_VERSION = 'td613.marrowline.episode-continuity/v1';
export const MARROWLINE_EPISODE_CLAIM_SCHEMA = 'td613.marrowline.episode-claim/v1';
export const MARROWLINE_EPISODE_STREAM_SCHEMA = 'td613.marrowline.episode-stream/v1';
export const MARROWLINE_EPISODE_STREAM_CONTENT_TYPE = 'application/x-ndjson; charset=utf-8';
export const MARROWLINE_EPISODE_LEASE_MS = 240_000;
export const MARROWLINE_EPISODE_HARD_TTL_MS = 900_000;
export const MARROWLINE_EPISODE_HEARTBEAT_MS = 5_000;
export const MARROWLINE_EPISODE_MAX_ACTIVE_PER_IP = 2;
export const MARROWLINE_EPISODE_MAX_CIPHERTEXT_CHARS = 2_400_000;
export const MARROWLINE_EPISODE_MAX_MEMORY_RECORDS = 256;

export const MARROWLINE_CONTINUITY_NEON_ENV = 'TD613_MARROWLINE_CONTINUITY_DATABASE_URL';
export const MARROWLINE_CONTINUITY_REDIS_URL_ENV = 'TD613_MARROWLINE_REDIS_REST_URL';
export const MARROWLINE_CONTINUITY_REDIS_TOKEN_ENV = 'TD613_MARROWLINE_REDIS_REST_TOKEN';
const NEON_TABLE = 'td613_marrowline_ephemeral_episodes';

const EPISODE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{11,95}$/;
const B64URL_32_RE = /^[A-Za-z0-9_-]{42,44}$/;
const HEX_64_RE = /^[a-f0-9]{64}$/;

const safe = (value = '') => String(value ?? '').trim();
const sha256Hex = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sha256Base64Url = (value) => crypto.createHash('sha256').update(value).digest('base64url');

function headerValue(headers = {}, name = '') {
  const target = String(name || '').toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (String(key).toLowerCase() === target) {
      return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
    }
  }
  return '';
}

function clientAddress(req = {}) {
  return headerValue(req.headers, 'x-forwarded-for').split(',')[0].trim()
    || headerValue(req.headers, 'x-real-ip').trim()
    || req.socket?.remoteAddress
    || 'unknown';
}

function parseJsonBody(req = {}) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
    try { return JSON.parse(String(req.body)); } catch { return {}; }
  }
  return {};
}

function canonicalBodyString(req = {}) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  return '';
}

function applyNoStoreHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Episode-Continuity', MARROWLINE_EPISODE_CONTINUITY_VERSION);
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  if (res.writableEnded || res.destroyed) return null;
  res.statusCode = statusCode;
  applyNoStoreHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [key, value] of Object.entries(extraHeaders)) res.setHeader(key, value);
  return res.end(JSON.stringify(payload));
}

export function assertEpisodeSameOrigin(req = {}, { requireOriginHeader = false } = {}) {
  const secFetchSite = safe(headerValue(req.headers, 'sec-fetch-site')).toLowerCase();
  if (secFetchSite === 'cross-site') {
    return { allowed: false, reason: 'cross-site-fetch-forbidden' };
  }
  const originHeader = safe(headerValue(req.headers, 'origin'));
  const hostHeader = safe(headerValue(req.headers, 'host'));
  if (!originHeader) {
    return requireOriginHeader && secFetchSite !== 'same-origin' && hostHeader
      ? { allowed: true, reason: 'origin-absent-non-cross-site' }
      : { allowed: true, reason: 'origin-not-supplied' };
  }
  try {
    const parsed = new URL(originHeader);
    if (!['https:', 'http:'].includes(parsed.protocol)) return { allowed: false, reason: 'invalid-origin-protocol' };
    if (hostHeader && parsed.host.toLowerCase() !== hostHeader.toLowerCase()) {
      return { allowed: false, reason: 'origin-host-mismatch' };
    }
    return { allowed: true, reason: 'same-origin-verified' };
  } catch {
    return { allowed: false, reason: 'malformed-origin-header' };
  }
}

export function deriveEpisodeCapabilityFromRoot(rootSecretB64Url = '', episodeId = '') {
  if (!B64URL_32_RE.test(rootSecretB64Url) || !EPISODE_ID_RE.test(episodeId)) {
    throw new TypeError('invalid-episode-root-capability-inputs');
  }
  return Object.freeze({
    episodeId,
    claimAuthToken: sha256Base64Url(`td613.marrowline.episode-auth/v1:${rootSecretB64Url}:${episodeId}`),
    envelopeKey: sha256Base64Url(`td613.marrowline.episode-aes256gcm/v1:${rootSecretB64Url}:${episodeId}`)
  });
}

export function buildEpisodeAad(episodeId = '', requestBodySha256 = '', hardExpiresAt = 0) {
  return `td613.marrowline.episode/v1:${episodeId}:${String(requestBodySha256).toLowerCase()}:${Number(hardExpiresAt)}`;
}

export function sealEpisodeEnvelope({
  payloadObject,
  envelopeKeyB64Url,
  episodeId,
  requestBodySha256,
  hardExpiresAt
} = {}) {
  if (!B64URL_32_RE.test(String(envelopeKeyB64Url || ''))) {
    throw new TypeError('invalid-episode-envelope-key');
  }
  const keyBuffer = Buffer.from(String(envelopeKeyB64Url), 'base64url');
  try {
    if (keyBuffer.length !== 32) throw new TypeError('invalid-episode-envelope-key-length');
    const iv = crypto.randomBytes(12);
    const aad = Buffer.from(buildEpisodeAad(episodeId, requestBodySha256, hardExpiresAt), 'utf8');
    const plaintext = Buffer.from(JSON.stringify(payloadObject), 'utf8');
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
    cipher.setAAD(aad);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    const ciphertext_b64 = encrypted.toString('base64');
    if (ciphertext_b64.length > MARROWLINE_EPISODE_MAX_CIPHERTEXT_CHARS) {
      throw new RangeError('episode-ciphertext-exceeds-cap');
    }
    return Object.freeze({
      algorithm: 'AES-256-GCM',
      ciphertext_b64,
      iv_b64: iv.toString('base64'),
      tag_b64: tag.toString('base64'),
      hard_expires_at: Number(hardExpiresAt)
    });
  } finally {
    keyBuffer.fill(0);
  }
}

export function openEpisodeEnvelopeNode({
  envelope,
  envelopeKeyB64Url,
  episodeId,
  requestBodySha256
} = {}) {
  const keyBuffer = Buffer.from(String(envelopeKeyB64Url || ''), 'base64url');
  try {
    if (keyBuffer.length !== 32) throw new TypeError('invalid-episode-envelope-key-length');
    const iv = Buffer.from(String(envelope?.iv_b64 || ''), 'base64');
    const tag = Buffer.from(String(envelope?.tag_b64 || ''), 'base64');
    const ciphertext = Buffer.from(String(envelope?.ciphertext_b64 || ''), 'base64');
    const aad = Buffer.from(buildEpisodeAad(episodeId, requestBodySha256, envelope?.hard_expires_at), 'utf8');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAAD(aad);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } finally {
    keyBuffer.fill(0);
  }
}

export function timingSafeEqualHex(leftHex = '', rightHex = '') {
  if (!HEX_64_RE.test(leftHex) || !HEX_64_RE.test(rightHex)) return false;
  return crypto.timingSafeEqual(Buffer.from(leftHex, 'hex'), Buffer.from(rightHex, 'hex'));
}

export function registerVercelWaitUntil(promise, customWaitUntil = null) {
  const safePromise = Promise.resolve(promise).catch(() => {});
  if (typeof customWaitUntil === 'function') {
    customWaitUntil(safePromise);
    return { registered: true, mechanism: 'injected-wait-until' };
  }
  try {
    const ctxSymbol = Symbol.for('@vercel/request-context');
    const ctx = globalThis[ctxSymbol]?.get?.();
    if (typeof ctx?.waitUntil === 'function') {
      ctx.waitUntil(safePromise);
      return { registered: true, mechanism: 'vercel-request-context-wait-until' };
    }
  } catch {}
  return { registered: false, mechanism: 'unregistered-background-promise' };
}

function sameDatabaseUrl(leftRaw = '', rightRaw = '') {
  if (!leftRaw || !rightRaw) return false;
  try {
    const left = new URL(leftRaw);
    const right = new URL(rightRaw);
    return left.hostname.toLowerCase() === right.hostname.toLowerCase()
      && left.pathname.replace(/\/+$/, '') === right.pathname.replace(/\/+$/, '');
  } catch {
    return false;
  }
}

function createEphemeralMemoryEpisodeStore({
  clock = () => Date.now(),
  leaseMs = MARROWLINE_EPISODE_LEASE_MS,
  hardTtlMs = MARROWLINE_EPISODE_HARD_TTL_MS,
  maxActivePerIp = MARROWLINE_EPISODE_MAX_ACTIVE_PER_IP,
  maxRecords = MARROWLINE_EPISODE_MAX_MEMORY_RECORDS,
  runtimeCache = null
} = {}) {
  const records = new Map();
  const timers = new Map();

  const descriptor = Object.freeze({
    backend: runtimeCache ? 'vercel-runtime-cache-plus-fluid-memory' : 'vercel-fluid-ephemeral-memory',
    cross_instance_durable: Boolean(runtimeCache),
    cross_region_durable: false,
    atomic_cas: !runtimeCache ? 'single-instance-strict' : 'best-effort-regional-cache',
    at_rest_encryption: 'AES-256-GCM',
    server_plaintext_retained: false,
    hard_ttl_seconds: Math.floor(hardTtlMs / 1000),
    physical_eviction_policy: 'immediate-on-consume-or-cancel-plus-900s-unref-timer-and-api-cutoff'
  });

  const clearTimer = (episodeId) => {
    const timer = timers.get(episodeId);
    if (timer) {
      clearTimeout(timer);
      timers.delete(episodeId);
    }
  };

  const physicalDelete = async (episodeId) => {
    clearTimer(episodeId);
    const existed = records.delete(episodeId);
    if (runtimeCache) {
      try { await runtimeCache.delete(`marrowline-ep:${episodeId}`); } catch {}
    }
    return existed;
  };

  const purgeExpired = (now) => {
    for (const [id, entry] of records.entries()) {
      if (now >= entry.hardExpiresAt) {
        clearTimer(id);
        records.delete(id);
      }
    }
  };

  const readRaw = async (episodeId) => {
    if (runtimeCache) {
      try {
        const cached = await runtimeCache.get(`marrowline-ep:${episodeId}`);
        if (cached && typeof cached === 'object') return cached;
        clearTimer(episodeId);
        records.delete(episodeId);
        return null;
      } catch {
        // Fall back to local Fluid memory only if Runtime Cache throws
      }
    }
    return records.get(episodeId) || null;
  };

  const writeRaw = async (entry, now) => {
    records.set(entry.episodeId, entry);
    if (records.size > maxRecords) {
      const oldestKey = records.keys().next().value;
      if (oldestKey && oldestKey !== entry.episodeId) {
        clearTimer(oldestKey);
        records.delete(oldestKey);
      }
    }
    if (runtimeCache) {
      const ttlSeconds = Math.max(1, Math.ceil((entry.hardExpiresAt - now) / 1000));
      try {
        await runtimeCache.set(`marrowline-ep:${entry.episodeId}`, entry, { ttl: ttlSeconds });
      } catch {}
    }
  };

  const scheduleExpiryTimer = (episodeId, hardExpiresAt, now) => {
    clearTimer(episodeId);
    const delay = Math.max(1, hardExpiresAt - now);
    const timer = setTimeout(() => {
      timers.delete(episodeId);
      records.delete(episodeId);
    }, delay);
    timer?.unref?.();
    timers.set(episodeId, timer);
  };

  return Object.freeze({
    descriptor,
    size: () => records.size,
    inspectRawForTest: (episodeId) => {
      const item = records.get(episodeId);
      return item ? JSON.parse(JSON.stringify(item)) : null;
    },
    clearAllForTest: () => {
      for (const id of timers.keys()) clearTimer(id);
      records.clear();
    },

    async registerOrAttach({ episodeId, authSha256, requestBodySha256, ipHash }) {
      const now = clock();
      purgeExpired(now);
      const existing = await readRaw(episodeId);
      if (existing) {
        if (now >= existing.hardExpiresAt) {
          await physicalDelete(episodeId);
          return { status: 'EXPIRED' };
        }
        if (!timingSafeEqualHex(existing.authSha256, authSha256)) {
          return { status: 'AUTH_MISMATCH' };
        }
        if (existing.requestBodySha256 !== requestBodySha256) {
          return { status: 'BODY_CONFLICT' };
        }
        if (existing.state === 'RUNNING' && now >= existing.leaseExpiresAt) {
          const reconciled = Object.freeze({
            ...existing,
            state: 'OUTCOME_UNKNOWN',
            reason: 'episode-lease-expired',
            updatedAt: now
          });
          await writeRaw(reconciled, now);
          return { status: 'ATTACHED', record: reconciled };
        }
        return { status: 'ATTACHED', record: existing };
      }

      let activeForIp = 0;
      for (const candidate of records.values()) {
        if (candidate.ipHash === ipHash && candidate.state === 'RUNNING' && now < candidate.leaseExpiresAt && now < candidate.hardExpiresAt) {
          activeForIp += 1;
        }
      }
      if (activeForIp >= maxActivePerIp) {
        return { status: 'CONCURRENCY_LIMIT_EXCEEDED', limit: maxActivePerIp };
      }

      const created = Object.freeze({
        episodeId,
        authSha256,
        requestBodySha256,
        ipHash,
        state: 'RUNNING',
        reason: null,
        createdAt: now,
        updatedAt: now,
        leaseExpiresAt: now + leaseMs,
        hardExpiresAt: now + hardTtlMs,
        envelope: null
      });
      await writeRaw(created, now);
      scheduleExpiryTimer(episodeId, created.hardExpiresAt, now);
      return { status: 'CREATED', record: created };
    },

    async sealTerminal({ episodeId, nextState, reason = null, envelope }) {
      const now = clock();
      purgeExpired(now);
      const existing = await readRaw(episodeId);
      if (!existing || now >= existing.hardExpiresAt) {
        await physicalDelete(episodeId);
        return { committed: false, reason: 'expired-or-missing' };
      }
      if (existing.state !== 'RUNNING') {
        return { committed: false, reason: `state-already-${existing.state}` };
      }
      const updated = Object.freeze({
        ...existing,
        state: nextState === 'FAILED' ? 'FAILED' : 'COMPLETED',
        reason,
        updatedAt: now,
        // Preserve immutable original hardExpiresAt (never extend 15m TTL)
        hardExpiresAt: existing.hardExpiresAt,
        envelope: Object.freeze({ ...envelope, hard_expires_at: existing.hardExpiresAt })
      });
      await writeRaw(updated, now);
      return { committed: true, record: updated };
    },

    async getClaim({ episodeId, authSha256 }) {
      const now = clock();
      const existing = await readRaw(episodeId);
      if (!existing) {
        return { status: 'NOT_FOUND' };
      }
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) {
        return { status: 'AUTH_MISMATCH' };
      }
      if (now >= existing.hardExpiresAt) {
        await physicalDelete(episodeId);
        return { status: 'EXPIRED' };
      }
      if (existing.state === 'RUNNING' && now >= existing.leaseExpiresAt) {
        const reconciled = Object.freeze({
          ...existing,
          state: 'OUTCOME_UNKNOWN',
          reason: 'episode-lease-expired',
          updatedAt: now,
          envelope: null
        });
        await writeRaw(reconciled, now);
        return { status: 'OK', record: reconciled };
      }
      return { status: 'OK', record: existing };
    },

    async cancel({ episodeId, authSha256 }) {
      const now = clock();
      const existing = await readRaw(episodeId);
      if (!existing) return { status: 'NOT_FOUND' };
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      if (now >= existing.hardExpiresAt) {
        await physicalDelete(episodeId);
        return { status: 'EXPIRED' };
      }
      const cancelled = Object.freeze({
        ...existing,
        state: 'CANCELLED',
        reason: 'operator-cancelled',
        updatedAt: now,
        envelope: null
      });
      await writeRaw(cancelled, now);
      return { status: 'CANCELLED', record: cancelled };
    },

    async consume({ episodeId, authSha256 }) {
      const now = clock();
      const existing = await readRaw(episodeId);
      if (!existing) {
        return { status: 'ALREADY_DELETED' };
      }
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) {
        return { status: 'AUTH_MISMATCH' };
      }
      if (now >= existing.hardExpiresAt) {
        await physicalDelete(episodeId);
        return { status: 'EXPIRED' };
      }
      await physicalDelete(episodeId);
      return { status: 'DELETED' };
    }
  });
}

function createNeonPostgresEpisodeStore({
  connectionString,
  environment = process.env,
  fetchImpl = fetch,
  clock = () => Date.now(),
  leaseMs = MARROWLINE_EPISODE_LEASE_MS,
  hardTtlMs = MARROWLINE_EPISODE_HARD_TTL_MS,
  maxActivePerIp = MARROWLINE_EPISODE_MAX_ACTIVE_PER_IP
} = {}) {
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !/\.neon\.tech$/i.test(parsed.hostname)) {
    throw new Error('MARROWLINE_CONTINUITY_HOST_OUTSIDE_NEON_BOUNDARY');
  }
  if (sameDatabaseUrl(connectionString, environment.TD613_GIVING_NEON_DATABASE_URL)
    || sameDatabaseUrl(connectionString, environment.TD613_LOOM_DEMO_NEON_DATABASE_URL)) {
    throw new Error('MARROWLINE_CONTINUITY_DATABASE_MUST_BE_DEDICATED');
  }
  const endpoint = `https://${parsed.hostname}/sql`;
  let tableReady = false;

  const descriptor = Object.freeze({
    backend: 'neon-postgres-ephemeral',
    cross_instance_durable: true,
    cross_region_durable: true,
    atomic_cas: 'postgres-row-cas',
    at_rest_encryption: 'AES-256-GCM',
    server_plaintext_retained: false,
    hard_ttl_seconds: Math.floor(hardTtlMs / 1000),
    physical_eviction_policy: 'immediate-delete-on-consume-zero-lag-900s-api-cutoff-plus-scheduled-reaper-required-for-idle-tuples'
  });

  const rowsFromNeon = (body) => {
    if (Array.isArray(body?.rows) && body.rows.every((r) => !Array.isArray(r))) return body.rows;
    if (Array.isArray(body?.rows) && Array.isArray(body?.fields)) {
      const names = body.fields.map((f) => f.name);
      return body.rows.map((r) => Object.fromEntries(names.map((n, i) => [n, r[i]])));
    }
    return [];
  };

  const sql = async (query, params = []) => {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(8_000),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Neon-Connection-String': connectionString,
        'Neon-Raw-Text-Output': 'true',
        'Neon-Array-Mode': 'true'
      },
      body: JSON.stringify({ query, params })
    });
    if (!response.ok) throw new Error(`MARROWLINE_CONTINUITY_NEON_HTTP_${response.status}`);
    return rowsFromNeon(await response.json());
  };

  const ensureSchema = async () => {
    if (tableReady) return;
    await sql(`CREATE TABLE IF NOT EXISTS ${NEON_TABLE} (
      episode_id text PRIMARY KEY,
      auth_sha256 text NOT NULL,
      request_body_sha256 text NOT NULL,
      ip_hash text NOT NULL,
      state text NOT NULL,
      reason text,
      created_at_ms bigint NOT NULL,
      updated_at_ms bigint NOT NULL,
      lease_expires_at_ms bigint NOT NULL,
      hard_expires_at_ms bigint NOT NULL,
      envelope_json jsonb
    )`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_${NEON_TABLE}_expiry ON ${NEON_TABLE} (hard_expires_at_ms)`);
    tableReady = true;
  };

  const mapRow = (row) => row ? Object.freeze({
    episodeId: row.episode_id,
    authSha256: row.auth_sha256,
    requestBodySha256: row.request_body_sha256,
    ipHash: row.ip_hash,
    state: row.state,
    reason: row.reason || null,
    createdAt: Number(row.created_at_ms),
    updatedAt: Number(row.updated_at_ms),
    leaseExpiresAt: Number(row.lease_expires_at_ms),
    hardExpiresAt: Number(row.hard_expires_at_ms),
    envelope: typeof row.envelope_json === 'string' ? JSON.parse(row.envelope_json) : (row.envelope_json || null)
  }) : null;

  return Object.freeze({
    descriptor,
    async registerOrAttach({ episodeId, authSha256, requestBodySha256, ipHash }) {
      await ensureSchema();
      const now = clock();
      await sql(`DELETE FROM ${NEON_TABLE} WHERE hard_expires_at_ms <= $1`, [now]);
      const activeRows = await sql(
        `SELECT count(*)::int AS cnt FROM ${NEON_TABLE} WHERE ip_hash = $1 AND state = 'RUNNING' AND lease_expires_at_ms > $2 AND hard_expires_at_ms > $2`,
        [ipHash, now]
      );
      const inserted = Number(activeRows[0]?.cnt || 0) < maxActivePerIp
        ? await sql(
            `INSERT INTO ${NEON_TABLE} (episode_id, auth_sha256, request_body_sha256, ip_hash, state, reason, created_at_ms, updated_at_ms, lease_expires_at_ms, hard_expires_at_ms, envelope_json)
             VALUES ($1,$2,$3,$4,'RUNNING',NULL,$5,$5,$6,$7,NULL)
             ON CONFLICT (episode_id) DO NOTHING
             RETURNING *`,
            [episodeId, authSha256, requestBodySha256, ipHash, now, now + leaseMs, now + hardTtlMs]
          )
        : [];
      if (inserted.length) return { status: 'CREATED', record: mapRow(inserted[0]) };

      const existingRows = await sql(`SELECT * FROM ${NEON_TABLE} WHERE episode_id = $1 LIMIT 1`, [episodeId]);
      if (!existingRows.length) {
        return { status: 'CONCURRENCY_LIMIT_EXCEEDED', limit: maxActivePerIp };
      }
      const existing = mapRow(existingRows[0]);
      if (now >= existing.hardExpiresAt) {
        await sql(`DELETE FROM ${NEON_TABLE} WHERE episode_id = $1`, [episodeId]);
        return { status: 'EXPIRED' };
      }
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      if (existing.requestBodySha256 !== requestBodySha256) return { status: 'BODY_CONFLICT' };
      if (existing.state === 'RUNNING' && now >= existing.leaseExpiresAt) {
        const updated = await sql(
          `UPDATE ${NEON_TABLE} SET state = 'OUTCOME_UNKNOWN', reason = 'episode-lease-expired', updated_at_ms = $2, envelope_json = NULL
           WHERE episode_id = $1 AND state = 'RUNNING' RETURNING *`,
          [episodeId, now]
        );
        return { status: 'ATTACHED', record: mapRow(updated[0]) || existing };
      }
      return { status: 'ATTACHED', record: existing };
    },

    async sealTerminal({ episodeId, nextState, reason = null, envelope }) {
      await ensureSchema();
      const now = clock();
      const targetState = nextState === 'FAILED' ? 'FAILED' : 'COMPLETED';
      const rows = await sql(
        `UPDATE ${NEON_TABLE}
         SET state = $2, reason = $3, updated_at_ms = $4, envelope_json = $5::jsonb
         WHERE episode_id = $1 AND state = 'RUNNING' AND hard_expires_at_ms > $4
         RETURNING *`,
        [episodeId, targetState, reason, now, JSON.stringify(envelope)]
      );
      return rows.length
        ? { committed: true, record: mapRow(rows[0]) }
        : { committed: false, reason: 'cas-not-matched' };
    },

    async getClaim({ episodeId, authSha256 }) {
      await ensureSchema();
      const now = clock();
      const rows = await sql(`SELECT * FROM ${NEON_TABLE} WHERE episode_id = $1 LIMIT 1`, [episodeId]);
      if (!rows.length) return { status: 'NOT_FOUND' };
      const existing = mapRow(rows[0]);
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      if (now >= existing.hardExpiresAt) {
        await sql(`DELETE FROM ${NEON_TABLE} WHERE episode_id = $1`, [episodeId]);
        return { status: 'EXPIRED' };
      }
      if (existing.state === 'RUNNING' && now >= existing.leaseExpiresAt) {
        const updated = await sql(
          `UPDATE ${NEON_TABLE} SET state = 'OUTCOME_UNKNOWN', reason = 'episode-lease-expired', updated_at_ms = $2, envelope_json = NULL
           WHERE episode_id = $1 AND state = 'RUNNING' RETURNING *`,
          [episodeId, now]
        );
        return { status: 'OK', record: mapRow(updated[0]) || existing };
      }
      return { status: 'OK', record: existing };
    },

    async cancel({ episodeId, authSha256 }) {
      await ensureSchema();
      const now = clock();
      const rows = await sql(`SELECT * FROM ${NEON_TABLE} WHERE episode_id = $1 LIMIT 1`, [episodeId]);
      if (!rows.length) return { status: 'NOT_FOUND' };
      const existing = mapRow(rows[0]);
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      if (now >= existing.hardExpiresAt) {
        await sql(`DELETE FROM ${NEON_TABLE} WHERE episode_id = $1`, [episodeId]);
        return { status: 'EXPIRED' };
      }
      const updated = await sql(
        `UPDATE ${NEON_TABLE} SET state = 'CANCELLED', reason = 'operator-cancelled', updated_at_ms = $2, envelope_json = NULL
         WHERE episode_id = $1 RETURNING *`,
        [episodeId, now]
      );
      return { status: 'CANCELLED', record: mapRow(updated[0]) || existing };
    },

    async consume({ episodeId, authSha256 }) {
      await ensureSchema();
      const now = clock();
      const rows = await sql(`SELECT * FROM ${NEON_TABLE} WHERE episode_id = $1 LIMIT 1`, [episodeId]);
      if (!rows.length) return { status: 'ALREADY_DELETED' };
      const existing = mapRow(rows[0]);
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      await sql(`DELETE FROM ${NEON_TABLE} WHERE episode_id = $1`, [episodeId]);
      if (now >= existing.hardExpiresAt) return { status: 'EXPIRED' };
      return { status: 'DELETED' };
    }
  });
}

function createUpstashRedisEpisodeStore({
  restUrl,
  restToken,
  fetchImpl = fetch,
  clock = () => Date.now(),
  leaseMs = MARROWLINE_EPISODE_LEASE_MS,
  hardTtlMs = MARROWLINE_EPISODE_HARD_TTL_MS,
  maxActivePerIp = MARROWLINE_EPISODE_MAX_ACTIVE_PER_IP
} = {}) {
  const parsed = new URL(restUrl);
  if (parsed.protocol !== 'https:') {
    throw new Error('MARROWLINE_CONTINUITY_REDIS_HTTPS_REQUIRED');
  }
  if (!safe(restToken)) {
    throw new Error('MARROWLINE_CONTINUITY_REDIS_TOKEN_REQUIRED');
  }
  const baseEndpoint = restUrl.replace(/\/+$/, '');
  const epKey = (episodeId) => `td613:marrowline:ep:${episodeId}`;
  const ipKey = (ipHash) => `td613:marrowline:ip:${ipHash}`;

  const descriptor = Object.freeze({
    backend: 'upstash-redis-rest-ephemeral',
    cross_instance_durable: true,
    cross_region_durable: true,
    atomic_cas: 'redis-lua-eval-keepttl',
    at_rest_encryption: 'AES-256-GCM',
    server_plaintext_retained: false,
    hard_ttl_seconds: Math.floor(hardTtlMs / 1000),
    physical_eviction_policy: 'immediate-del-on-consume-or-cancel-plus-900s-native-px-ttl-and-zero-lag-api-cutoff'
  });

  const redisCmd = async (commandArray) => {
    const response = await fetchImpl(baseEndpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(8_000),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${restToken}`
      },
      body: JSON.stringify(commandArray)
    });
    if (!response.ok) throw new Error(`MARROWLINE_CONTINUITY_REDIS_HTTP_${response.status}`);
    const payload = await response.json();
    if (payload?.error) throw new Error(`MARROWLINE_CONTINUITY_REDIS_ERR_${String(payload.error).slice(0, 64)}`);
    return payload?.result ?? null;
  };

  const REGISTER_LUA = `
local raw = redis.call('GET', KEYS[1])
local now = tonumber(ARGV[1])
if raw then
  local rec = cjson.decode(raw)
  if now >= tonumber(rec.hardExpiresAt) then
    redis.call('DEL', KEYS[1])
    redis.call('ZREM', KEYS[2], ARGV[4])
    return cjson.encode({ status = 'EXPIRED' })
  end
  return cjson.encode({ status = 'EXISTING', record = rec })
end
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', now)
local active = redis.call('ZCARD', KEYS[2])
if active >= tonumber(ARGV[2]) then
  return cjson.encode({ status = 'CONCURRENCY_LIMIT_EXCEEDED' })
end
redis.call('SET', KEYS[1], ARGV[3], 'PX', tonumber(ARGV[5]), 'NX')
redis.call('ZADD', KEYS[2], tonumber(ARGV[6]), ARGV[4])
redis.call('PEXPIRE', KEYS[2], tonumber(ARGV[5]))
return cjson.encode({ status = 'CREATED', record = cjson.decode(ARGV[3]) })
`;

  const SEAL_LUA = `
local raw = redis.call('GET', KEYS[1])
local now = tonumber(ARGV[1])
if not raw then
  return cjson.encode({ committed = false, reason = 'expired-or-missing' })
end
local rec = cjson.decode(raw)
if now >= tonumber(rec.hardExpiresAt) then
  redis.call('DEL', KEYS[1])
  redis.call('ZREM', KEYS[2], ARGV[5])
  return cjson.encode({ committed = false, reason = 'expired-or-missing' })
end
if rec.state ~= 'RUNNING' then
  return cjson.encode({ committed = false, reason = 'state-already-' .. tostring(rec.state) })
end
rec.state = ARGV[2]
if ARGV[3] == '' then rec.reason = cjson.null else rec.reason = ARGV[3] end
rec.updatedAt = now
rec.envelope = cjson.decode(ARGV[4])
rec.envelope.hard_expires_at = rec.hardExpiresAt
redis.call('SET', KEYS[1], cjson.encode(rec), 'KEEPTTL')
redis.call('ZREM', KEYS[2], ARGV[5])
return cjson.encode({ committed = true, record = rec })
`;

  const RECONCILE_OR_CANCEL_LUA = `
local raw = redis.call('GET', KEYS[1])
local now = tonumber(ARGV[1])
if not raw then return cjson.encode({ status = 'NOT_FOUND' }) end
local rec = cjson.decode(raw)
if now >= tonumber(rec.hardExpiresAt) then
  redis.call('DEL', KEYS[1])
  redis.call('ZREM', KEYS[2], ARGV[4])
  return cjson.encode({ status = 'EXPIRED' })
end
if ARGV[2] == 'RECONCILE_LEASE' and rec.state ~= 'RUNNING' then
  return cjson.encode({ status = 'UNCHANGED', record = rec })
end
rec.state = ARGV[3]
rec.reason = ARGV[5]
rec.updatedAt = now
rec.envelope = cjson.null
redis.call('SET', KEYS[1], cjson.encode(rec), 'KEEPTTL')
redis.call('ZREM', KEYS[2], ARGV[4])
return cjson.encode({ status = 'UPDATED', record = rec })
`;

  const normalizeRecord = (rec) => rec ? Object.freeze({
    episodeId: rec.episodeId,
    authSha256: rec.authSha256,
    requestBodySha256: rec.requestBodySha256,
    ipHash: rec.ipHash,
    state: rec.state,
    reason: rec.reason || null,
    createdAt: Number(rec.createdAt),
    updatedAt: Number(rec.updatedAt),
    leaseExpiresAt: Number(rec.leaseExpiresAt),
    hardExpiresAt: Number(rec.hardExpiresAt),
    envelope: rec.envelope || null
  }) : null;

  return Object.freeze({
    descriptor,
    async registerOrAttach({ episodeId, authSha256, requestBodySha256, ipHash }) {
      const now = clock();
      const candidate = {
        episodeId,
        authSha256,
        requestBodySha256,
        ipHash,
        state: 'RUNNING',
        reason: null,
        createdAt: now,
        updatedAt: now,
        leaseExpiresAt: now + leaseMs,
        hardExpiresAt: now + hardTtlMs,
        envelope: null
      };
      const rawOut = await redisCmd([
        'EVAL',
        REGISTER_LUA,
        '2',
        epKey(episodeId),
        ipKey(ipHash),
        String(now),
        String(maxActivePerIp),
        JSON.stringify(candidate),
        episodeId,
        String(hardTtlMs),
        String(candidate.leaseExpiresAt)
      ]);
      const parsedOut = typeof rawOut === 'string' ? JSON.parse(rawOut) : rawOut;
      if (parsedOut.status === 'EXPIRED') return { status: 'EXPIRED' };
      if (parsedOut.status === 'CONCURRENCY_LIMIT_EXCEEDED') {
        return { status: 'CONCURRENCY_LIMIT_EXCEEDED', limit: maxActivePerIp };
      }
      if (parsedOut.status === 'CREATED') {
        return { status: 'CREATED', record: normalizeRecord(parsedOut.record) };
      }
      const existing = normalizeRecord(parsedOut.record);
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      if (existing.requestBodySha256 !== requestBodySha256) return { status: 'BODY_CONFLICT' };
      if (existing.state === 'RUNNING' && now >= existing.leaseExpiresAt) {
        const recOut = JSON.parse(await redisCmd([
          'EVAL',
          RECONCILE_OR_CANCEL_LUA,
          '2',
          epKey(episodeId),
          ipKey(existing.ipHash),
          String(now),
          'RECONCILE_LEASE',
          'OUTCOME_UNKNOWN',
          episodeId,
          'episode-lease-expired'
        ]));
        return { status: 'ATTACHED', record: normalizeRecord(recOut.record) || existing };
      }
      return { status: 'ATTACHED', record: existing };
    },

    async sealTerminal({ episodeId, nextState, reason = null, envelope }) {
      const now = clock();
      const existingRaw = await redisCmd(['GET', epKey(episodeId)]);
      if (!existingRaw) return { committed: false, reason: 'expired-or-missing' };
      const existing = JSON.parse(existingRaw);
      const targetState = nextState === 'FAILED' ? 'FAILED' : 'COMPLETED';
      const out = JSON.parse(await redisCmd([
        'EVAL',
        SEAL_LUA,
        '2',
        epKey(episodeId),
        ipKey(existing.ipHash || 'unknown'),
        String(now),
        targetState,
        reason ? String(reason) : '',
        JSON.stringify(envelope),
        episodeId
      ]));
      return out.committed
        ? { committed: true, record: normalizeRecord(out.record) }
        : { committed: false, reason: out.reason || 'cas-not-matched' };
    },

    async getClaim({ episodeId, authSha256 }) {
      const now = clock();
      const raw = await redisCmd(['GET', epKey(episodeId)]);
      if (!raw) return { status: 'NOT_FOUND' };
      const existing = normalizeRecord(JSON.parse(raw));
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      if (now >= existing.hardExpiresAt) {
        await redisCmd(['DEL', epKey(episodeId)]);
        return { status: 'EXPIRED' };
      }
      if (existing.state === 'RUNNING' && now >= existing.leaseExpiresAt) {
        const recOut = JSON.parse(await redisCmd([
          'EVAL',
          RECONCILE_OR_CANCEL_LUA,
          '2',
          epKey(episodeId),
          ipKey(existing.ipHash),
          String(now),
          'RECONCILE_LEASE',
          'OUTCOME_UNKNOWN',
          episodeId,
          'episode-lease-expired'
        ]));
        if (recOut.status === 'EXPIRED') return { status: 'EXPIRED' };
        return { status: 'OK', record: normalizeRecord(recOut.record) || existing };
      }
      return { status: 'OK', record: existing };
    },

    async cancel({ episodeId, authSha256 }) {
      const now = clock();
      const raw = await redisCmd(['GET', epKey(episodeId)]);
      if (!raw) return { status: 'NOT_FOUND' };
      const existing = normalizeRecord(JSON.parse(raw));
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      if (now >= existing.hardExpiresAt) {
        await redisCmd(['DEL', epKey(episodeId)]);
        return { status: 'EXPIRED' };
      }
      const out = JSON.parse(await redisCmd([
        'EVAL',
        RECONCILE_OR_CANCEL_LUA,
        '2',
        epKey(episodeId),
        ipKey(existing.ipHash),
        String(now),
        'FORCE_CANCEL',
        'CANCELLED',
        episodeId,
        'operator-cancelled'
      ]));
      if (out.status === 'EXPIRED') return { status: 'EXPIRED' };
      return { status: 'CANCELLED', record: normalizeRecord(out.record) || existing };
    },

    async consume({ episodeId, authSha256 }) {
      const now = clock();
      const raw = await redisCmd(['GET', epKey(episodeId)]);
      if (!raw) return { status: 'ALREADY_DELETED' };
      const existing = normalizeRecord(JSON.parse(raw));
      if (!timingSafeEqualHex(existing.authSha256, authSha256)) return { status: 'AUTH_MISMATCH' };
      await redisCmd(['DEL', epKey(episodeId)]);
      await redisCmd(['ZREM', ipKey(existing.ipHash), episodeId]);
      if (now >= existing.hardExpiresAt) return { status: 'EXPIRED' };
      return { status: 'DELETED' };
    }
  });
}

export function createMarrowlineEpisodeStore({
  environment = process.env,
  fetchImpl = fetch,
  clock = () => Date.now(),
  leaseMs = MARROWLINE_EPISODE_LEASE_MS,
  hardTtlMs = MARROWLINE_EPISODE_HARD_TTL_MS,
  maxActivePerIp = MARROWLINE_EPISODE_MAX_ACTIVE_PER_IP,
  runtimeCache = null
} = {}) {
  const redisUrl = safe(environment?.[MARROWLINE_CONTINUITY_REDIS_URL_ENV]);
  const redisToken = safe(environment?.[MARROWLINE_CONTINUITY_REDIS_TOKEN_ENV]);
  if (redisUrl) {
    return createUpstashRedisEpisodeStore({
      restUrl: redisUrl,
      restToken: redisToken,
      fetchImpl,
      clock,
      leaseMs,
      hardTtlMs,
      maxActivePerIp
    });
  }
  const neonUrl = safe(environment?.[MARROWLINE_CONTINUITY_NEON_ENV]);
  if (neonUrl) {
    return createNeonPostgresEpisodeStore({
      connectionString: neonUrl,
      environment,
      fetchImpl,
      clock,
      leaseMs,
      hardTtlMs,
      maxActivePerIp
    });
  }
  const detectedCache = runtimeCache || (() => {
    try {
      return globalThis[Symbol.for('@vercel/request-context')]?.get?.()?.cache || null;
    } catch {
      return null;
    }
  })();
  return createEphemeralMemoryEpisodeStore({
    clock,
    leaseMs,
    hardTtlMs,
    maxActivePerIp,
    runtimeCache: detectedCache
  });
}

export const defaultMarrowlineEpisodeStore = createMarrowlineEpisodeStore();
const activeEpisodeControllers = new Map();

function claimPayload(record, storeDescriptor, extra = {}) {
  return {
    schema: MARROWLINE_EPISODE_CLAIM_SCHEMA,
    ok: true,
    episode_id: record.episodeId,
    state: record.state,
    reason: record.reason || null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    lease_expires_at: record.leaseExpiresAt,
    hard_expires_at: record.hardExpiresAt,
    ...(record.envelope && (record.state === 'COMPLETED' || record.state === 'FAILED')
      ? { envelope: record.envelope }
      : {}),
    continuity: storeDescriptor,
    ...extra
  };
}

export async function episodeClaimHandler(req, res, { store = defaultMarrowlineEpisodeStore } = {}) {
  if (req.method && req.method !== 'GET') {
    return sendJson(res, 405, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'method-not-allowed' }, { Allow: 'GET' });
  }
  const originCheck = assertEpisodeSameOrigin(req);
  if (!originCheck.allowed) {
    return sendJson(res, 403, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'same-origin-required', reason: originCheck.reason });
  }
  let episodeId = safe(req?.query?.request_id);
  if (!episodeId) {
    try {
      episodeId = safe(new URL(req?.url || '/api/khonapolit', 'https://td613.invalid').searchParams.get('request_id'));
    } catch {}
  }
  const authToken = safe(headerValue(req.headers, 'x-td613-episode-auth'));
  if (!EPISODE_ID_RE.test(episodeId) || !B64URL_32_RE.test(authToken)) {
    return sendJson(res, 400, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'invalid-episode-claim-credentials' });
  }
  const authSha256 = sha256Hex(authToken);
  const lookup = await store.getClaim({ episodeId, authSha256 });
  if (lookup.status === 'AUTH_MISMATCH') {
    return sendJson(res, 403, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'episode-auth-mismatch' });
  }
  if (lookup.status === 'EXPIRED') {
    return sendJson(res, 410, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, state: 'EXPIRED', error: 'episode-expired', continuity: store.descriptor });
  }
  if (lookup.status === 'NOT_FOUND') {
    return sendJson(res, 404, {
      schema: MARROWLINE_EPISODE_CLAIM_SCHEMA,
      ok: false,
      state: 'UNOBSERVED',
      error: 'episode-not-found',
      continuity: store.descriptor
    });
  }
  return sendJson(res, 200, claimPayload(lookup.record, store.descriptor));
}

export async function episodeConsumeHandler(req, res, { store = defaultMarrowlineEpisodeStore } = {}) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'method-not-allowed' }, { Allow: 'POST' });
  }
  const originCheck = assertEpisodeSameOrigin(req, { requireOriginHeader: true });
  if (!originCheck.allowed) {
    return sendJson(res, 403, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'same-origin-required', reason: originCheck.reason });
  }
  const body = parseJsonBody(req);
  const episodeId = safe(body.request_id || headerValue(req.headers, 'x-td613-episode-id'));
  const authToken = safe(headerValue(req.headers, 'x-td613-episode-auth'));
  if (!EPISODE_ID_RE.test(episodeId) || !B64URL_32_RE.test(authToken)) {
    return sendJson(res, 400, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'invalid-episode-consume-credentials' });
  }
  const authSha256 = sha256Hex(authToken);
  const outcome = await store.consume({ episodeId, authSha256 });
  if (outcome.status === 'AUTH_MISMATCH') {
    return sendJson(res, 403, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'episode-auth-mismatch' });
  }
  if (outcome.status === 'EXPIRED') {
    return sendJson(res, 410, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, state: 'EXPIRED', error: 'episode-expired', continuity: store.descriptor });
  }
  return sendJson(res, 200, {
    schema: MARROWLINE_EPISODE_CLAIM_SCHEMA,
    ok: true,
    episode_id: episodeId,
    consumed: true,
    already_deleted: outcome.status === 'ALREADY_DELETED',
    continuity: store.descriptor
  });
}

export async function episodeCancelHandler(req, res, { store = defaultMarrowlineEpisodeStore, controllers = activeEpisodeControllers } = {}) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'method-not-allowed' }, { Allow: 'POST' });
  }
  const originCheck = assertEpisodeSameOrigin(req, { requireOriginHeader: true });
  if (!originCheck.allowed) {
    return sendJson(res, 403, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'same-origin-required', reason: originCheck.reason });
  }
  const body = parseJsonBody(req);
  const episodeId = safe(body.request_id || headerValue(req.headers, 'x-td613-episode-id'));
  const authToken = safe(headerValue(req.headers, 'x-td613-episode-auth'));
  if (!EPISODE_ID_RE.test(episodeId) || !B64URL_32_RE.test(authToken)) {
    return sendJson(res, 400, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'invalid-episode-cancel-credentials' });
  }
  const authSha256 = sha256Hex(authToken);
  const outcome = await store.cancel({ episodeId, authSha256 });
  if (outcome.status === 'AUTH_MISMATCH') {
    return sendJson(res, 403, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, error: 'episode-auth-mismatch' });
  }
  if (outcome.status === 'EXPIRED') {
    return sendJson(res, 410, { schema: MARROWLINE_EPISODE_CLAIM_SCHEMA, ok: false, state: 'EXPIRED', error: 'episode-expired' });
  }
  const live = controllers.get(episodeId);
  if (live && timingSafeEqualHex(live.authSha256, authSha256)) {
    live.controller.abort();
  }
  return sendJson(res, 200, {
    schema: MARROWLINE_EPISODE_CLAIM_SCHEMA,
    ok: true,
    episode_id: episodeId,
    state: 'CANCELLED',
    upstream_abort_signaled: Boolean(live),
    ciphertext_purged: true,
    continuity: store.descriptor
  });
}

export async function runWithMarrowlineEpisodeContinuity(
  req,
  res,
  executeHandler,
  {
    store = defaultMarrowlineEpisodeStore,
    waitUntil = null,
    heartbeatMs = MARROWLINE_EPISODE_HEARTBEAT_MS,
    clock = () => Date.now(),
    controllers = activeEpisodeControllers
  } = {}
) {
  const episodeId = safe(headerValue(req?.headers, 'x-td613-episode-id'));
  const releaseCanary = headerValue(req?.headers, 'x-td613-release-canary') === '1';
  if (!episodeId || releaseCanary || req?.method !== 'POST' || req?.episodeAbortSignal) {
    return executeHandler(req, res);
  }

  const originCheck = assertEpisodeSameOrigin(req, { requireOriginHeader: true });
  if (!originCheck.allowed) {
    return sendJson(res, 403, { ok: false, error: 'same-origin-required', reason: originCheck.reason });
  }

  const authToken = safe(headerValue(req?.headers, 'x-td613-episode-auth'));
  const envelopeKey = safe(headerValue(req?.headers, 'x-td613-episode-key'));
  if (!EPISODE_ID_RE.test(episodeId) || !B64URL_32_RE.test(authToken) || !B64URL_32_RE.test(envelopeKey)) {
    return sendJson(res, 400, { ok: false, error: 'invalid-episode-continuity-headers' });
  }

  // Never permit secrets in query parameters
  if (/[?&](?:token|key|secret|auth)=/i.test(String(req?.url || ''))) {
    return sendJson(res, 400, { ok: false, error: 'query-secret-forbidden' });
  }

  const authSha256 = sha256Hex(authToken);
  const requestBodySha256 = sha256Hex(Buffer.from(canonicalBodyString(req), 'utf8'));
  const ipHash = sha256Hex(`td613-ep-ip:${clientAddress(req)}`);

  const registration = await store.registerOrAttach({
    episodeId,
    authSha256,
    requestBodySha256,
    ipHash
  });

  if (registration.status === 'AUTH_MISMATCH') {
    return sendJson(res, 403, { ok: false, error: 'episode-auth-mismatch' });
  }
  if (registration.status === 'BODY_CONFLICT') {
    return sendJson(res, 409, { ok: false, error: 'episode-identity-conflict' });
  }
  if (registration.status === 'EXPIRED') {
    return sendJson(res, 410, { ok: false, error: 'episode-expired' });
  }
  if (registration.status === 'CONCURRENCY_LIMIT_EXCEEDED') {
    return sendJson(res, 429, {
      ok: false,
      error: 'episode-concurrency-limit',
      diagnostic: { max_active_episodes_per_ip: registration.limit }
    });
  }

  // Idempotent duplicate POST attachment: NEVER dispatch a second Gemini generation!
  if (registration.status === 'ATTACHED') {
    return sendJson(res, 200, claimPayload(registration.record, store.descriptor, { attached_idempotent: true }));
  }

  const record = registration.record;
  const episodeController = new AbortController();
  controllers.set(episodeId, { controller: episodeController, authSha256 });

  const virtualHeaders = {};
  let virtualStatus = 200;
  let rawCapturedBody = '';
  const virtualRes = {
    get statusCode() { return virtualStatus; },
    set statusCode(code) { virtualStatus = Number(code) || 200; },
    setHeader(name, value) { virtualHeaders[String(name)] = String(value); },
    getHeader(name) {
      const match = Object.entries(virtualHeaders).find(([k]) => k.toLowerCase() === String(name).toLowerCase());
      return match ? match[1] : undefined;
    },
    end(chunk = '') {
      rawCapturedBody = typeof chunk === 'string' ? chunk : Buffer.from(chunk || '').toString('utf8');
      return rawCapturedBody;
    }
  };

  const episodeReq = Object.create(req);
  episodeReq.episodeAbortSignal = episodeController.signal;
  episodeReq.episodeId = episodeId;

  const wantsHeartbeatStream = safe(headerValue(req?.headers, 'x-td613-transport-stream')).toLowerCase() === 'heartbeat-v1'
    && typeof res.write === 'function';

  let waitUntilReceipt = { registered: false, mechanism: 'pending' };

  const backgroundLifecyclePromise = (async () => {
    try {
      await executeHandler(episodeReq, virtualRes);
      let parsedBody = {};
      try { parsedBody = rawCapturedBody ? JSON.parse(rawCapturedBody) : {}; } catch {}

      if (episodeController.signal.aborted) {
        return { state: 'CANCELLED', httpStatus: 499, headers: virtualHeaders, body: { ok: false, error: 'operator-cancelled' } };
      }

      // Attach transparent continuity provenance and truthful ephemeral ciphertext disclosure
      // without altering provider-authored text bytes or claiming permanent server storage.
      if (parsedBody && typeof parsedBody === 'object' && parsedBody.receipt && typeof parsedBody.receipt === 'object') {
        parsedBody = {
          ...parsedBody,
          receipt: {
            ...parsedBody.receipt,
            ...(parsedBody.receipt.storage && typeof parsedBody.receipt.storage === 'object'
              ? {
                  storage: {
                    ...parsedBody.receipt.storage,
                    serverConversationStorage: false,
                    ephemeralEpisodeCiphertext: {
                      active: true,
                      encryption: 'AES-256-GCM',
                      keyCustody: 'browser-held-root-capability-never-persisted-at-rest',
                      maxAccessWindowSeconds: store.descriptor.hard_ttl_seconds,
                      deletionOnConsumeOrCancel: 'immediate',
                      backend: store.descriptor.backend,
                      physicalEvictionPolicy: store.descriptor.physical_eviction_policy
                    }
                  }
                }
              : {}),
            episodeContinuity: {
              schema: MARROWLINE_EPISODE_CONTINUITY_VERSION,
              episodeId,
              waitUntilMechanism: waitUntilReceipt.mechanism,
              store: store.descriptor
            }
          }
        };
      }

      const terminalState = virtualStatus >= 200 && virtualStatus < 300 ? 'COMPLETED' : 'FAILED';
      const envelope = sealEpisodeEnvelope({
        payloadObject: {
          httpStatus: virtualStatus,
          headers: virtualHeaders,
          body: parsedBody
        },
        envelopeKeyB64Url: envelopeKey,
        episodeId,
        requestBodySha256,
        hardExpiresAt: record.hardExpiresAt
      });

      await store.sealTerminal({
        episodeId,
        nextState: terminalState,
        reason: terminalState === 'FAILED' ? safe(parsedBody?.error || `http-${virtualStatus}`) : null,
        envelope
      });

      return { state: terminalState, httpStatus: virtualStatus, headers: virtualHeaders, body: parsedBody };
    } catch (error) {
      const fallbackBody = {
        ok: false,
        status: 'HELD',
        error: episodeController.signal.aborted ? 'operator-cancelled' : 'episode-execution-failed',
        diagnostic: { code: safe(error?.name || 'EXECUTION_ERROR').slice(0, 64) }
      };
      if (!episodeController.signal.aborted) {
        try {
          const envelope = sealEpisodeEnvelope({
            payloadObject: { httpStatus: 502, headers: virtualHeaders, body: fallbackBody },
            envelopeKeyB64Url: envelopeKey,
            episodeId,
            requestBodySha256,
            hardExpiresAt: record.hardExpiresAt
          });
          await store.sealTerminal({
            episodeId,
            nextState: 'FAILED',
            reason: 'episode-execution-failed',
            envelope
          });
        } catch {}
      }
      return { state: episodeController.signal.aborted ? 'CANCELLED' : 'FAILED', httpStatus: 502, headers: virtualHeaders, body: fallbackBody };
    } finally {
      controllers.delete(episodeId);
    }
  })();

  waitUntilReceipt = registerVercelWaitUntil(backgroundLifecyclePromise, waitUntil);

  if (wantsHeartbeatStream) {
    const startedAt = clock();
    try {
      res.statusCode = 200;
      applyNoStoreHeaders(res);
      res.setHeader('Content-Type', MARROWLINE_EPISODE_STREAM_CONTENT_TYPE);
      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('X-TD613-Episode-Id', episodeId);
      res.write(`${JSON.stringify({
        schema: MARROWLINE_EPISODE_STREAM_SCHEMA,
        type: 'accepted',
        episode_id: episodeId,
        state: 'RUNNING',
        lease_expires_at: record.leaseExpiresAt,
        hard_expires_at: record.hardExpiresAt,
        continuity: store.descriptor
      })}\n`);
    } catch {}

    const safeWriteLine = (frame) => {
      try {
        if (!res.writableEnded && !res.destroyed) {
          res.write(`${JSON.stringify(frame)}\n`);
        }
      } catch {}
    };

    const intervalMs = Math.max(25, Number(heartbeatMs) || MARROWLINE_EPISODE_HEARTBEAT_MS);
    const heartbeatTimer = setInterval(() => {
      if (res.writableEnded || res.destroyed) return;
      safeWriteLine({
        schema: MARROWLINE_EPISODE_STREAM_SCHEMA,
        type: 'heartbeat',
        episode_id: episodeId,
        state: 'RUNNING',
        elapsed_ms: Math.max(0, clock() - startedAt)
      });
    }, intervalMs);
    heartbeatTimer?.unref?.();

    try {
      const outcome = await backgroundLifecyclePromise;
      clearInterval(heartbeatTimer);
      if (!res.writableEnded && !res.destroyed) {
        safeWriteLine({
          schema: MARROWLINE_EPISODE_STREAM_SCHEMA,
          type: 'result',
          episode_id: episodeId,
          state: outcome.state,
          http_status: outcome.httpStatus,
          headers: outcome.headers,
          body: outcome.body
        });
        res.end();
      }
      return;
    } finally {
      clearInterval(heartbeatTimer);
    }
  }

  const outcome = await backgroundLifecyclePromise;
  if (!res.writableEnded && !res.destroyed) {
    res.statusCode = outcome.httpStatus;
    applyNoStoreHeaders(res);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-TD613-Episode-Id', episodeId);
    for (const [key, value] of Object.entries(outcome.headers || {})) {
      res.setHeader(key, value);
    }
    res.end(JSON.stringify(outcome.body));
  }
}
