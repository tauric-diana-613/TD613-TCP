import {
  BASE_RESPONSE_HEADERS,
  GIVING_ENVIRONMENT,
  GIVING_API_VERSION,
  GIVING_RECEIPT_SCHEMA,
  MAX_RESPONSE_BYTES,
  MUTATION_OPERATIONS,
  PUBLIC_OPERATIONS
} from './constants.js';
import { searchSourcePage } from './adapters/index.js';
import {
  campaignDeputyReadiness,
  createConfirmed,
  linkExisting,
  peoplePage,
  withhold
} from './campaign-deputy.js';
import { publicRegistry } from './registry.js';
import {
  assertSameOrigin,
  clearSessionCookie,
  createSession,
  expectedOrigin,
  parseEnvelope,
  publicSessionView,
  requireIntentNonce,
  requireSession,
  sessionConfiguration
} from './security.js';
import { GivingError, headerValue, sha256 } from './util.js';
import {
  vaultList,
  vaultRead,
  vaultReadiness,
  vaultResolveConflict,
  vaultWrite
} from './vault.js';

function setHeaders(res, headers = {}) {
  for (const [key, value] of Object.entries({ ...BASE_RESPONSE_HEADERS, ...headers })) res.setHeader(key, value);
}

function custodyForOperation(operation) {
  if (operation.startsWith('vault.')) return 'HOSTED_CIPHERTEXT_ONLY';
  if (operation.startsWith('campaign-deputy.')) return 'CAMPAIGN_DEPUTY_REVIEWED_WRITE_BOUNDARY';
  if (operation === 'search.page') return 'TRANSIENT_SERVER_RESPONSE_CLIENT_SELECTED_DOSSIER_CUSTODY';
  if (operation === 'registry.read') return 'PUBLIC_SOURCE_REGISTRY_NO_DONOR_DATA';
  return 'SIGNED_OPERATOR_SESSION';
}

function responseReceipt(envelope, session, extra = {}) {
  return {
    schema: GIVING_RECEIPT_SCHEMA,
    request_id: envelope?.request_id || null,
    operation: envelope?.operation || null,
    request_digest: envelope?.request_digest || null,
    session_id_digest: session?.sid ? sha256(session.sid) : null,
    custody: custodyForOperation(envelope?.operation || ''),
    donor_inputs_logged: false,
    completed_at: new Date().toISOString(),
    ...extra
  };
}

function send(res, status, body, headers = {}) {
  setHeaders(res, headers);
  res.statusCode = status;
  res.end(status === 204 ? '' : JSON.stringify(body));
}

function ok(res, envelope, session, data, receiptExtra = {}, headers = {}) {
  const body = {
    ok: true,
    data,
    receipt: responseReceipt(envelope, session, receiptExtra),
    error: null
  };
  if (Buffer.byteLength(JSON.stringify(body)) > MAX_RESPONSE_BYTES) {
    return fail(res, new GivingError(
      'response-page-oversized',
      'This source page exceeds the Giving response boundary; narrow the search or lower the page size',
      413,
      { limit_bytes: MAX_RESPONSE_BYTES }
    ), envelope, session, headers);
  }
  return send(res, 200, body, headers);
}

function fail(res, error, envelope = null, session = null, headers = {}) {
  const known = error instanceof GivingError;
  return send(res, known ? error.status : 500, {
    ok: false,
    data: null,
    receipt: responseReceipt(envelope, session, {
      outcome: 'WITHHELD',
      refusal_code: known ? error.code : 'internal-error'
    }),
    error: {
      code: known ? error.code : 'internal-error',
      message: known ? error.message : 'Giving operation did not complete',
      ...(known && error.details !== undefined ? { details: error.details } : {})
    }
  }, headers);
}

async function dispatch(envelope, session, context) {
  switch (envelope.operation) {
    case 'session.status': return publicSessionView(session);
    case 'registry.read': return publicRegistry();
    case 'search.page': return searchSourcePage(envelope.payload, context);
    case 'vault.list': return vaultList(envelope.payload, session, context);
    case 'vault.read': return vaultRead(envelope.payload, session, context);
    case 'vault.write': return vaultWrite(envelope.payload, session, context);
    case 'vault.resolve-conflict': return vaultResolveConflict(envelope.payload, session, context);
    case 'campaign-deputy.people-page': return peoplePage(envelope.payload, context);
    case 'campaign-deputy.link-existing': return linkExisting(envelope.payload, context);
    case 'campaign-deputy.create-confirmed': return createConfirmed(envelope.payload, context);
    case 'campaign-deputy.withhold': return withhold(envelope.payload);
    case 'readiness': {
      const registry = publicRegistry();
      return {
        version: GIVING_API_VERSION,
        ready: sessionConfiguration().separate_authorities,
        session: sessionConfiguration(),
        source_registry: {
          instances: registry.source_instance_count,
          municipalities: registry.municipalities.unique_count,
          family_counts: registry.family_counts
        },
        campaign_deputy: campaignDeputyReadiness(),
        vault: vaultReadiness(),
        required_environment: GIVING_ENVIRONMENT,
        retrieval_dependency: 'DETERMINISTIC_NO_OPENAI_OR_GEMINI_REQUIRED',
        paper_pdf_policy: 'NO_MACHINE_SEARCHABLE_ELECTRONIC_SOURCE'
      };
    }
    default: throw new GivingError('operation-withheld', 'Requested Giving operation is not admitted', 400);
  }
}

export async function givingHandler(req, res, context = {}) {
  let envelope = null;
  let session = null;
  try {
    const method = String(req.method || '').toUpperCase();
    if (method === 'OPTIONS') {
      const origin = assertSameOrigin(req);
      return send(res, 204, {}, {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '300',
        Vary: 'Origin'
      });
    }
    if (method !== 'POST') {
      throw new GivingError('method-not-allowed', 'Giving accepts POST request envelopes only', 405, { allowed: ['POST', 'OPTIONS'] });
    }
    const origin = assertSameOrigin(req);
    const contentType = headerValue(req, 'content-type').toLowerCase();
    if (contentType && !contentType.startsWith('application/json')) {
      throw new GivingError('content-type-withheld', 'Giving request envelopes must use application/json', 415);
    }
    envelope = await parseEnvelope(req);
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin'
    };
    if (envelope.operation === 'session.create') {
      const created = createSession(envelope.payload.access_secret, origin);
      return ok(res, envelope, created.payload, publicSessionView(created.payload), {}, {
        ...cors,
        'Set-Cookie': created.cookie
      });
    }
    if (PUBLIC_OPERATIONS.has(envelope.operation)) throw new GivingError('operation-withheld', 'Public operation route was not resolved', 400);
    session = requireSession(req);
    if (MUTATION_OPERATIONS.has(envelope.operation)) requireIntentNonce(envelope, session);
    if (envelope.operation === 'session.close') {
      return ok(res, envelope, session, { authenticated: false, closed: true }, {}, {
        ...cors,
        'Set-Cookie': clearSessionCookie()
      });
    }
    const data = await dispatch(envelope, session, context);
    return ok(res, envelope, session, data,
      envelope.operation === 'search.page' ? { source: data.receipt } : {}, cors);
  } catch (error) {
    const origin = expectedOrigin(req);
    const supplied = headerValue(req, 'origin');
    const cors = origin && supplied === origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin'
    } : {};
    return fail(res, error, envelope, session, cors);
  }
}

export default givingHandler;

export const _dispatcherInternals = Object.freeze({ dispatch, responseReceipt, custodyForOperation });
