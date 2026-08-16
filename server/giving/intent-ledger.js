import { GivingError, sha256 } from './util.js';

const TABLE = 'td613_giving_spent_intents';
const MAX_OPERATION_CHARS = 120;

function configuration() {
  const connectionString = String(process.env.TD613_GIVING_NEON_DATABASE_URL || '');
  if (!connectionString) {
    throw new GivingError(
      'replay-ledger-unavailable',
      'This non-idempotent write requires the durable Giving replay ledger',
      503
    );
  }
  let parsed;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new GivingError('replay-ledger-unavailable', 'Giving replay-ledger configuration is invalid', 503);
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !/\.neon\.tech$/i.test(parsed.hostname)) {
    throw new GivingError('replay-ledger-host-withheld', 'Giving replay ledger is outside the admitted Neon boundary', 503);
  }
  return { connectionString, endpoint: `https://${parsed.hostname}/sql` };
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
  const config = configuration();
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
    if (!response.ok) throw new GivingError('replay-ledger-upstream-error', `Giving replay ledger returned HTTP ${response.status}`, 502);
    return rowsFromNeon(await response.json());
  } catch (error) {
    if (error instanceof GivingError) throw error;
    if (error?.name === 'AbortError') throw new GivingError('replay-ledger-timeout', 'Giving replay ledger did not answer inside its bounded window', 504);
    throw new GivingError('replay-ledger-unavailable', 'Giving replay ledger request failed', 502);
  } finally {
    clearTimeout(timer);
  }
}

async function ensureTable(fetchImpl) {
  await neonSql(`CREATE TABLE IF NOT EXISTS ${TABLE} (
    session_digest text NOT NULL,
    intent_digest text NOT NULL,
    operation text NOT NULL,
    request_digest text,
    spent_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    PRIMARY KEY (session_digest, intent_digest)
  )`, [], fetchImpl);
  await neonSql(`CREATE INDEX IF NOT EXISTS td613_giving_spent_intents_expiry_idx
    ON ${TABLE} (expires_at)`, [], fetchImpl);
}

export async function consumeGivingMutationIntent({ envelope, session, fetchImpl } = {}) {
  if (!session?.sid || !session?.nonce || !Number.isFinite(session?.exp)) {
    throw new GivingError('invalid-session', 'Signed Giving session is required for durable replay protection', 401);
  }
  const operation = String(envelope?.operation || '').trim();
  if (!operation || operation.length > MAX_OPERATION_CHARS) {
    throw new GivingError('invalid-operation', 'A bounded Giving operation is required for replay protection', 400);
  }
  await ensureTable(fetchImpl);
  const sessionDigest = sha256(`td613-giving-session:${session.sid}`);
  const intentDigest = sha256(`td613-giving-intent:${session.sid}:${session.nonce}`);
  const expiry = new Date(session.exp * 1000).toISOString();

  await neonSql(`DELETE FROM ${TABLE} WHERE expires_at < now()`, [], fetchImpl);
  const inserted = await neonSql(`INSERT INTO ${TABLE}
      (session_digest, intent_digest, operation, request_digest, expires_at)
      VALUES ($1,$2,$3,$4,$5::timestamptz)
      ON CONFLICT (session_digest, intent_digest) DO NOTHING
      RETURNING intent_digest`, [
    sessionDigest,
    intentDigest,
    operation,
    envelope?.request_digest || null,
    expiry
  ], fetchImpl);

  if (!inserted.length) {
    throw new GivingError(
      'intent-replay-withheld',
      'This consequential Giving intent was already consumed',
      409,
      { replay_detected: true }
    );
  }

  return Object.freeze({
    schema: 'td613.giving.spent-intent/v1',
    session_digest: sessionDigest,
    intent_digest: intentDigest,
    operation,
    expires_at: expiry,
    durable: true,
    payload_logged: false
  });
}

export function givingReplayLedgerReadiness() {
  try {
    const config = configuration();
    return { configured: true, host_digest: sha256(config.endpoint), payload_logged: false };
  } catch {
    return { configured: false, host_digest: null, payload_logged: false };
  }
}

export const _intentLedgerInternals = Object.freeze({ rowsFromNeon, configuration });
