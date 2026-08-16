// One deployable Giving dispatcher. Supporting source and custody modules remain outside /api.
// Keep the route-level contract aligned with the explicit 30-second Vercel function
// override. Source adapters must settle before this wall and preserve continuation
// rather than allowing the platform to terminate the request generically.
import baseGivingHandler from '../server/giving/dispatcher.js';
import {
  BASE_RESPONSE_HEADERS,
  GIVING_RECEIPT_SCHEMA,
  MAX_REQUEST_BYTES
} from '../server/giving/constants.js';
import {
  assertGivingCisternRoute,
  finalizeGivingCisternReceipt,
  publicWriteAuthorizationReceipt
} from '../server/giving/cistern.js';
import {
  SESSION_ROLES,
  assertOwnerSecret,
  assertSameOrigin,
  classifySessionSecret,
  expectedOrigin,
  publicSessionView,
  requireIntentNonce,
  requireSession,
  rotateSessionIntent
} from '../server/giving/security.js';
import {
  assertSharedLoginAllowed,
  assertSharedSessionAdmitted,
  publicSharedAccessState,
  setSharedAccess
} from '../server/giving/session-access.js';
import { GivingError, headerValue, sha256 } from '../server/giving/util.js';

export const maxDuration = 30;
export const config = Object.freeze({ maxDuration });

const ACCESS_OPERATIONS = new Set([
  'session.shared-access.status',
  'session.shared-access.revoke',
  'session.shared-access.enable'
]);

function setHeaders(res, headers = {}) {
  for (const [key, value] of Object.entries({ ...BASE_RESPONSE_HEADERS, ...headers })) res.setHeader(key, value);
}

function corsHeaders(req) {
  const origin = expectedOrigin(req);
  const supplied = headerValue(req, 'origin');
  return origin && supplied === origin ? {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin'
  } : {};
}

function requestDigest(body) {
  return body?.request_id && body?.operation
    ? sha256({ schema: body.schema, request_id: body.request_id, operation: body.operation })
    : null;
}

function accessReceipt(body, session, outcome = 'COMPLETED', extra = {}) {
  return {
    schema: GIVING_RECEIPT_SCHEMA,
    request_id: body?.request_id || null,
    operation: body?.operation || null,
    request_digest: requestDigest(body),
    session_id_digest: session?.sid ? sha256(session.sid) : null,
    custody: 'SIGNED_OPERATOR_SESSION',
    donor_inputs_logged: false,
    outcome,
    completed_at: new Date().toISOString(),
    ...extra
  };
}

function send(res, status, body, headers = {}) {
  setHeaders(res, headers);
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function sendFailure(req, res, error, body = null, session = null, headers = {}) {
  const known = error instanceof GivingError;
  return send(res, known ? error.status : 500, {
    ok: false,
    data: null,
    receipt: accessReceipt(body, session, 'WITHHELD', {
      refusal_code: known ? error.code : 'internal-error'
    }),
    error: {
      code: known ? error.code : 'internal-error',
      message: known ? error.message : 'Giving operation did not complete',
      ...(known && error.details !== undefined ? { details: error.details } : {})
    }
  }, { ...corsHeaders(req), ...headers });
}

function bodyChunk(value) {
  if (Buffer.isBuffer(value)) return value;
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return Buffer.from(String(value));
}

async function readStream(stream, req) {
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
  return Buffer.concat(chunks).toString('utf8');
}

async function peekBody(req) {
  let supplied = req.body;
  if (supplied === undefined || supplied === null) supplied = req;
  if (supplied && typeof supplied === 'object' && !Buffer.isBuffer(supplied)
      && !ArrayBuffer.isView(supplied) && !(supplied instanceof ArrayBuffer)
      && typeof supplied.getReader !== 'function'
      && typeof supplied[Symbol.asyncIterator] !== 'function'
      && typeof supplied.on !== 'function') {
    return supplied;
  }
  let raw;
  if (typeof supplied === 'string') raw = supplied;
  else if (Buffer.isBuffer(supplied) || ArrayBuffer.isView(supplied) || supplied instanceof ArrayBuffer) raw = bodyChunk(supplied).toString('utf8');
  else raw = await readStream(supplied, req);
  if (Buffer.byteLength(raw) > MAX_REQUEST_BYTES) throw new GivingError('request-too-large', 'Giving request exceeded the bounded request body', 413);
  req.body = raw;
  try {
    const parsed = JSON.parse(raw);
    req.body = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function validateAccessEnvelope(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GivingError('invalid-envelope', 'Giving request envelope must be an object', 400);
  if (body.schema !== 'td613.giving.request/v1') throw new GivingError('invalid-envelope-schema', 'Unsupported Giving request schema', 400);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]{7,127}$/.test(String(body.request_id || ''))) {
    throw new GivingError('invalid-request-id', 'request_id must be a bounded opaque identifier', 400);
  }
  if (!ACCESS_OPERATIONS.has(body.operation)) throw new GivingError('operation-withheld', 'Requested Giving operation is not admitted', 400);
  if (body.intent !== undefined && (typeof body.intent !== 'object' || Array.isArray(body.intent))) throw new GivingError('invalid-intent', 'intent must be an object', 400);
  if (body.payload !== undefined && (typeof body.payload !== 'object' || Array.isArray(body.payload))) throw new GivingError('invalid-payload', 'payload must be an object', 400);
}

function cisternEnvelope(body) {
  return {
    schema: body.schema,
    request_id: body.request_id,
    operation: body.operation,
    intent: body.intent || {},
    payload: { owner_authority_confirmed: true },
    request_digest: requestDigest(body)
  };
}

async function handleAccessOperation(req, res, body, session, fetchImpl) {
  validateAccessEnvelope(body);
  assertSameOrigin(req);
  const cors = corsHeaders(req);
  if (body.operation === 'session.shared-access.status') {
    const data = await publicSharedAccessState(session, { fetchImpl });
    return send(res, 200, {
      ok: true,
      data,
      session: publicSessionView(session),
      receipt: accessReceipt(body, session, 'COMPLETED'),
      error: null
    }, cors);
  }

  requireIntentNonce(body, session);
  if (session?.role !== SESSION_ROLES.OWNER) {
    throw new GivingError('owner-session-required', 'Changing shared Giving access requires a signed owner session', 403);
  }
  assertOwnerSecret(body.payload?.owner_secret);

  const envelope = cisternEnvelope(body);
  const preflight = await assertGivingCisternRoute(envelope, session, { fetchImpl });
  const enabled = body.operation === 'session.shared-access.enable';
  const data = await setSharedAccess({
    enabled,
    ownerSecret: body.payload?.owner_secret,
    session,
    fetchImpl
  });
  const rotated = rotateSessionIntent(session);
  const internalWriteReceipt = finalizeGivingCisternReceipt(preflight, envelope, session, data);
  const writeAuthorization = publicWriteAuthorizationReceipt(internalWriteReceipt, rotated.payload);

  return send(res, 200, {
    ok: true,
    data,
    session: publicSessionView(rotated.payload),
    receipt: accessReceipt(body, session, 'COMPLETED', {
      collaborator_sessions_evicted: !enabled,
      shared_access_reopened: enabled,
      write_authorization: writeAuthorization
    }),
    error: null
  }, { ...cors, 'Set-Cookie': rotated.cookie });
}

export default async function givingHandler(req, res, context = {}) {
  const method = String(req.method || '').toUpperCase();
  if (method !== 'POST') return baseGivingHandler(req, res, context);

  let body;
  let session = null;
  const fetchImpl = context.fetchImpl || globalThis.fetch;
  try {
    body = await peekBody(req);
    const operation = body?.operation;
    if (!operation) return baseGivingHandler(req, res, context);

    assertSameOrigin(req);

    if (operation === 'session.create') {
      const role = classifySessionSecret(body?.payload?.access_secret);
      await assertSharedLoginAllowed(role, { fetchImpl });
      return baseGivingHandler(req, res, context);
    }

    session = requireSession(req);
    if (operation !== 'session.close') await assertSharedSessionAdmitted(session, { fetchImpl });

    if (ACCESS_OPERATIONS.has(operation)) {
      return handleAccessOperation(req, res, body, session, fetchImpl);
    }
    return baseGivingHandler(req, res, context);
  } catch (error) {
    return sendFailure(req, res, error, body, session);
  }
}

export * from '../server/giving/dispatcher.js';
