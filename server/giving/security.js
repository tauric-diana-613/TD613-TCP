import {
  MAX_REQUEST_BYTES,
  OPERATIONS,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS
} from './constants.js';
import {
  GivingError,
  constantTimeEqual,
  headerValue,
  hmacSha256,
  randomId,
  safeJsonParse,
  sha256
} from './util.js';

export const SESSION_ROLES = Object.freeze({
  OWNER: 'OWNER',
  COLLABORATOR: 'COLLABORATOR'
});

function configuredSecrets() {
  const access = String(process.env.TD613_GIVING_ACCESS_SECRET || '');
  const signing = String(process.env.TD613_GIVING_SESSION_SECRET || '');
  const owner = String(process.env.TD613_GIVING_OWNER_SECRET || '');
  const accessReady = access.length >= 24;
  const signingReady = signing.length >= 32;
  const ownerLengthReady = owner.length >= 32;
  const ownerSeparate = ownerLengthReady
    && accessReady
    && signingReady
    && !constantTimeEqual(owner, access)
    && !constantTimeEqual(owner, signing);
  return {
    access,
    signing,
    owner,
    access_ready: accessReady,
    signing_ready: signingReady,
    owner_ready: ownerSeparate,
    owner_length_ready: ownerLengthReady,
    owner_separate: ownerSeparate
  };
}

export function sessionConfiguration() {
  const secrets = configuredSecrets();
  return {
    access_secret_configured: secrets.access_ready,
    session_secret_configured: secrets.signing_ready,
    separate_authorities: secrets.access_ready && secrets.signing_ready && !constantTimeEqual(secrets.access, secrets.signing),
    owner_secret_configured: secrets.owner_length_ready,
    owner_secret_separate: secrets.owner_separate,
    collaborator_eviction_authority_ready: secrets.owner_ready
  };
}

function assertSessionConfiguration() {
  const secrets = configuredSecrets();
  if (!secrets.access_ready || !secrets.signing_ready || constantTimeEqual(secrets.access, secrets.signing)) {
    throw new GivingError('session-boundary-unavailable', 'Giving operator session boundary is not configured', 503);
  }
  return secrets;
}

export function classifySessionSecret(accessSecret) {
  const secrets = assertSessionConfiguration();
  const supplied = String(accessSecret || '');
  if (secrets.owner_ready && constantTimeEqual(supplied, secrets.owner)) return SESSION_ROLES.OWNER;
  if (constantTimeEqual(supplied, secrets.access)) return SESSION_ROLES.COLLABORATOR;
  throw new GivingError('access-denied', 'Operator access secret was not accepted', 401);
}

export function assertOwnerSecret(ownerSecret) {
  const secrets = assertSessionConfiguration();
  if (!secrets.owner_ready) {
    throw new GivingError('owner-authority-unavailable', 'Giving owner revocation authority is not configured', 503);
  }
  if (!constantTimeEqual(String(ownerSecret || ''), secrets.owner)) {
    throw new GivingError('owner-authority-withheld', 'Giving owner authority was not accepted', 403);
  }
  return true;
}

export function expectedOrigin(req) {
  const host = headerValue(req, 'x-forwarded-host') || headerValue(req, 'host');
  const forwarded = headerValue(req, 'x-forwarded-proto').split(',')[0].trim();
  let protocol = forwarded || 'https';
  if (!forwarded && /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) {
    try {
      const supplied = new URL(headerValue(req, 'origin'));
      if (supplied.host === host && supplied.protocol === 'http:') protocol = 'http';
    } catch {
      // No origin to admit; the same-origin gate will withhold the request.
    }
  }
  if (!host || !['https', 'http'].includes(protocol)) return null;
  return `${protocol}://${host.split(',')[0].trim()}`;
}

export function assertSameOrigin(req) {
  const supplied = headerValue(req, 'origin');
  const expected = expectedOrigin(req);
  if (!supplied || !expected || supplied !== expected) {
    throw new GivingError('cross-origin-withheld', 'Giving accepts same-origin operator requests only', 403);
  }
  return expected;
}

function cookies(req) {
  return Object.fromEntries(headerValue(req, 'cookie').split(';').map((part) => {
    const index = part.indexOf('=');
    if (index < 0) return ['', ''];
    return [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }).filter(([key]) => key));
}

function encodeSession(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${hmacSha256(secret, encoded)}`;
}

function sessionCookie(payload, secret, maxAge) {
  return `${SESSION_COOKIE}=${encodeSession(payload, secret)}; Path=/; Max-Age=${Math.max(1, Math.floor(maxAge))}; Secure; HttpOnly; SameSite=Strict`;
}

function decodeSession(token, secret) {
  const [encoded, signature, extra] = String(token || '').split('.');
  if (!encoded || !signature || extra || !constantTimeEqual(signature, hmacSha256(secret, encoded))) {
    throw new GivingError('invalid-session', 'Operator session is not valid', 401);
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    throw new GivingError('invalid-session', 'Operator session is not valid', 401);
  }
  const now = Math.floor(Date.now() / 1000);
  const explicitRoleValid = payload?.role === undefined || Object.values(SESSION_ROLES).includes(payload.role);
  if (payload?.v !== 1 || !payload?.sid || !payload?.nonce || !Number.isFinite(payload?.exp) || payload.exp <= now || !explicitRoleValid) {
    throw new GivingError(payload?.exp <= now ? 'session-expired' : 'invalid-session', 'Operator session has expired or is not valid', 401);
  }
  return payload;
}

export function createSession(accessSecret, audience = null) {
  const secrets = assertSessionConfiguration();
  const role = classifySessionSecret(accessSecret);
  const nowMs = Date.now();
  const now = Math.floor(nowMs / 1000);
  const payload = {
    v: 1,
    sid: randomId('session'),
    nonce: randomId('intent'),
    aud: audience ? sha256(String(audience)) : null,
    role,
    iat: now,
    iat_ms: nowMs,
    exp: now + SESSION_TTL_SECONDS
  };
  return {
    payload,
    token: encodeSession(payload, secrets.signing),
    cookie: sessionCookie(payload, secrets.signing, SESSION_TTL_SECONDS)
  };
}

export function rotateSessionIntent(session) {
  const secrets = assertSessionConfiguration();
  const now = Math.floor(Date.now() / 1000);
  if (!session?.sid || !session?.aud || !Number.isFinite(session?.exp) || session.exp <= now) {
    throw new GivingError('invalid-session', 'Operator session is not valid for intent rotation', 401);
  }
  const payload = {
    ...session,
    nonce: randomId('intent')
  };
  return {
    payload,
    token: encodeSession(payload, secrets.signing),
    cookie: sessionCookie(payload, secrets.signing, session.exp - now)
  };
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict`;
}

export function requireSession(req) {
  const secrets = assertSessionConfiguration();
  const session = decodeSession(cookies(req)[SESSION_COOKIE], secrets.signing);
  const audience = expectedOrigin(req);
  if (!audience || !session.aud || !constantTimeEqual(session.aud, sha256(audience))) {
    throw new GivingError('invalid-session-audience', 'Operator session is bound to a different origin', 401);
  }
  return session;
}

export function requireIntentNonce(envelope, session) {
  const supplied = envelope?.intent?.nonce;
  if (!supplied || !constantTimeEqual(supplied, session.nonce)) {
    throw new GivingError('intent-nonce-withheld', 'Mutation requires the current session-bound intent nonce', 403);
  }
}

function bodyChunk(value) {
  if (Buffer.isBuffer(value)) return value;
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return Buffer.from(String(value));
}

async function streamBody(stream, req) {
  const chunks = [];
  let total = 0;
  const append = (value) => {
    const chunk = bodyChunk(value);
    total += chunk.byteLength;
    if (total > MAX_REQUEST_BYTES) {
      req.destroy?.();
      throw new GivingError('request-too-large', 'Giving request exceeded the bounded request body', 413);
    }
    chunks.push(chunk);
  };
  try {
    if (typeof stream?.getReader === 'function') {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          append(value);
        }
      } finally {
        reader.releaseLock?.();
      }
    } else if (typeof stream?.[Symbol.asyncIterator] === 'function') {
      for await (const value of stream) append(value);
    } else if (typeof stream?.on === 'function') {
      await new Promise((resolve, reject) => {
        stream.on('data', (value) => {
          try { append(value); } catch (error) { reject(error); }
        });
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    } else {
      throw new GivingError('invalid-json', 'Expected a valid JSON object', 400);
    }
  } catch (error) {
    if (error instanceof GivingError) throw error;
    throw new GivingError('invalid-json', 'Expected a valid JSON object', 400);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function rawBody(req) {
  const supplied = req.body;
  if (supplied !== undefined && supplied !== null) {
    if (typeof supplied === 'string') return supplied;
    if (Buffer.isBuffer(supplied) || ArrayBuffer.isView(supplied) || supplied instanceof ArrayBuffer) {
      return bodyChunk(supplied).toString('utf8');
    }
    if (typeof supplied?.getReader === 'function' || typeof supplied?.[Symbol.asyncIterator] === 'function' || typeof supplied?.on === 'function') {
      return streamBody(supplied, req);
    }
    try {
      const serialized = JSON.stringify(supplied);
      if (typeof serialized !== 'string') throw new Error('body is not JSON-serializable');
      return serialized;
    } catch {
      throw new GivingError('invalid-json', 'Expected a valid JSON object', 400);
    }
  }
  return streamBody(req, req);
}

export async function parseEnvelope(req) {
  const declared = Number(headerValue(req, 'content-length') || 0);
  if (declared > MAX_REQUEST_BYTES) throw new GivingError('request-too-large', 'Giving request exceeded the bounded request body', 413);
  const raw = await rawBody(req);
  if (Buffer.byteLength(raw) > MAX_REQUEST_BYTES) throw new GivingError('request-too-large', 'Giving request exceeded the bounded request body', 413);
  const body = safeJsonParse(raw);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GivingError('invalid-envelope', 'Giving request envelope must be an object');
  const allowed = new Set(['schema', 'request_id', 'operation', 'intent', 'payload']);
  const unknown = Object.keys(body).filter((key) => !allowed.has(key));
  if (unknown.length) throw new GivingError('invalid-envelope', 'Giving request envelope contains unrecognized fields', 400, { fields: unknown });
  if (body.schema !== 'td613.giving.request/v1') throw new GivingError('invalid-envelope-schema', 'Unsupported Giving request schema', 400);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]{7,127}$/.test(String(body.request_id || ''))) {
    throw new GivingError('invalid-request-id', 'request_id must be a bounded opaque identifier', 400);
  }
  if (!OPERATIONS.includes(body.operation)) throw new GivingError('operation-withheld', 'Requested Giving operation is not admitted', 400);
  if (body.intent !== undefined && (typeof body.intent !== 'object' || Array.isArray(body.intent))) {
    throw new GivingError('invalid-intent', 'intent must be an object', 400);
  }
  if (body.payload !== undefined && (typeof body.payload !== 'object' || Array.isArray(body.payload))) {
    throw new GivingError('invalid-payload', 'payload must be an object', 400);
  }
  return {
    schema: body.schema,
    request_id: body.request_id,
    operation: body.operation,
    intent: body.intent || {},
    payload: body.payload || {},
    request_digest: sha256({ schema: body.schema, request_id: body.request_id, operation: body.operation })
  };
}

export function publicSessionView(session) {
  return {
    authenticated: true,
    role: Object.values(SESSION_ROLES).includes(session?.role) ? session.role : SESSION_ROLES.COLLABORATOR,
    intent_nonce: session.nonce,
    expires_at: new Date(session.exp * 1000).toISOString(),
    session_id_digest: sha256(session.sid)
  };
}

export const _sessionInternals = Object.freeze({ encodeSession, decodeSession, sessionCookie, configuredSecrets });