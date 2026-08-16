import assert from 'node:assert/strict';
import givingHandler from '../api/giving.js';

const ACCESS_SECRET = 'operator-access-secret-that-is-long-enough';
const SIGNING_SECRET = 'independent-signing-secret-that-is-even-longer';
const OWNER_SECRET = 'owner-only-giving-authority-secret-that-is-distinct';
const NEON_URL = 'postgresql://operator:test@ep-giving-shared-access-test.neon.tech/td613?sslmode=require';

process.env.TD613_GIVING_ACCESS_SECRET = ACCESS_SECRET;
process.env.TD613_GIVING_SESSION_SECRET = SIGNING_SECRET;
process.env.TD613_GIVING_OWNER_SECRET = OWNER_SECRET;
process.env.TD613_GIVING_NEON_DATABASE_URL = NEON_URL;

const ledger = {
  shared_enabled: true,
  revoked_before_ms: 0
};

function neonResponse(rows = []) {
  return {
    ok: true,
    status: 200,
    async json() { return { rows }; }
  };
}

async function fakeNeon(url, options = {}) {
  assert.match(String(url), /^https:\/\/ep-giving-shared-access-test\.neon\.tech\/sql$/);
  const { query = '', params = [] } = JSON.parse(options.body || '{}');
  if (/CREATE TABLE IF NOT EXISTS td613_giving_shared_access/i.test(query)) return neonResponse();
  if (/INSERT INTO td613_giving_shared_access/i.test(query)) return neonResponse();
  if (/SELECT shared_enabled, revoked_before_ms FROM td613_giving_shared_access/i.test(query)) {
    return neonResponse([{ ...ledger }]);
  }
  if (/UPDATE td613_giving_shared_access/i.test(query)) {
    ledger.shared_enabled = Boolean(params[0]);
    if (!ledger.shared_enabled) ledger.revoked_before_ms = Number(params[1]);
    return neonResponse([{ ...ledger }]);
  }
  throw new Error(`Unexpected Giving shared-access Neon query: ${query}`);
}

function request(operation, payload = {}, { cookie = '', nonce = null } = {}) {
  return {
    method: 'POST',
    url: '/api/giving',
    headers: {
      host: 'td613.com',
      origin: 'https://td613.com',
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: {
      schema: 'td613.giving.request/v1',
      request_id: `shared-access-${operation.replaceAll('.', '-')}-${Math.random().toString(16).slice(2, 10)}`,
      operation,
      intent: {
        purpose: 'shared-access-test',
        ...(nonce ? { nonce } : {})
      },
      payload
    }
  };
}

function response() {
  return {
    headers: {}, statusCode: null, body: '',
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(value = '') { this.body = value; }
  };
}

async function call(req) {
  const res = response();
  await givingHandler(req, res, { fetchImpl: fakeNeon });
  return { res, body: res.body ? JSON.parse(res.body) : null };
}

function cookieOf(result) {
  return result.res.headers['set-cookie']?.split(';', 1)[0] || '';
}

const ownerLogin = await call(request('session.create', { access_secret: OWNER_SECRET }));
assert.equal(ownerLogin.res.statusCode, 200);
assert.equal(ownerLogin.body.data.role, 'OWNER');
assert.equal(ownerLogin.body.data.authenticated, true);
let ownerCookie = cookieOf(ownerLogin);
let ownerNonce = ownerLogin.body.data.intent_nonce;

const collaboratorLogin = await call(request('session.create', { access_secret: ACCESS_SECRET }));
assert.equal(collaboratorLogin.res.statusCode, 200);
assert.equal(collaboratorLogin.body.data.role, 'COLLABORATOR');
const collaboratorCookie = cookieOf(collaboratorLogin);
const collaboratorNonce = collaboratorLogin.body.data.intent_nonce;

const collaboratorState = await call(request('session.shared-access.status', {}, { cookie: collaboratorCookie }));
assert.equal(collaboratorState.res.statusCode, 200);
assert.equal(collaboratorState.body.data.configured, true);
assert.equal(collaboratorState.body.data.shared_access, 'OPEN');
assert.equal(collaboratorState.body.data.owner_session, false);

const collaboratorCannotRevoke = await call(request('session.shared-access.revoke', {
  owner_secret: OWNER_SECRET
}, { cookie: collaboratorCookie, nonce: collaboratorNonce }));
assert.equal(collaboratorCannotRevoke.res.statusCode, 403);
assert.equal(collaboratorCannotRevoke.body.error.code, 'owner-session-required');
assert.equal(ledger.shared_enabled, true);

const revoke = await call(request('session.shared-access.revoke', {
  owner_secret: OWNER_SECRET
}, { cookie: ownerCookie, nonce: ownerNonce }));
assert.equal(revoke.res.statusCode, 200);
assert.equal(revoke.body.data.shared_access, 'LOCKED');
assert.equal(revoke.body.data.shared_secret_changed, false);
assert.equal(revoke.body.receipt.collaborator_sessions_evicted, true);
assert.equal(revoke.body.receipt.donor_inputs_logged, false);
assert.equal(revoke.body.receipt.write_authorization.status, 'VERIFIED');
assert.equal(revoke.body.receipt.write_authorization.replay_protection, 'SIGNED_SESSION_ROTATION_ONLY');
assert.equal(revoke.body.receipt.write_authorization.next_intent_issued, true);
assert.ok(revoke.body.session.intent_nonce);
assert.notEqual(revoke.body.session.intent_nonce, ownerNonce);
assert.equal(ledger.shared_enabled, false);
assert.ok(ledger.revoked_before_ms > 0);
ownerCookie = cookieOf(revoke);
ownerNonce = revoke.body.session.intent_nonce;

const evictedCollaborator = await call(request('session.status', {}, { cookie: collaboratorCookie }));
assert.equal(evictedCollaborator.res.statusCode, 401);
assert.equal(evictedCollaborator.body.error.code, 'shared-access-locked');

const blockedSharedLogin = await call(request('session.create', { access_secret: ACCESS_SECRET }));
assert.equal(blockedSharedLogin.res.statusCode, 401);
assert.equal(blockedSharedLogin.body.error.code, 'shared-access-locked');

const ownerSurvivesLock = await call(request('session.status', {}, { cookie: ownerCookie }));
assert.equal(ownerSurvivesLock.res.statusCode, 200);
assert.equal(ownerSurvivesLock.body.data.role, 'OWNER');

const reopen = await call(request('session.shared-access.enable', {
  owner_secret: OWNER_SECRET
}, { cookie: ownerCookie, nonce: ownerNonce }));
assert.equal(reopen.res.statusCode, 200);
assert.equal(reopen.body.data.shared_access, 'OPEN');
assert.equal(reopen.body.receipt.shared_access_reopened, true);
assert.equal(reopen.body.receipt.write_authorization.status, 'VERIFIED');
assert.equal(ledger.shared_enabled, true);
ownerCookie = cookieOf(reopen);
ownerNonce = reopen.body.session.intent_nonce;

const oldCollaboratorStillRevoked = await call(request('session.status', {}, { cookie: collaboratorCookie }));
assert.equal(oldCollaboratorStillRevoked.res.statusCode, 401);
assert.equal(oldCollaboratorStillRevoked.body.error.code, 'session-revoked');

await new Promise((resolve) => setTimeout(resolve, 2));
const freshCollaborator = await call(request('session.create', { access_secret: ACCESS_SECRET }));
assert.equal(freshCollaborator.res.statusCode, 200);
assert.equal(freshCollaborator.body.data.role, 'COLLABORATOR');

const ownerState = await call(request('session.shared-access.status', {}, { cookie: ownerCookie }));
assert.equal(ownerState.res.statusCode, 200);
assert.equal(ownerState.body.data.owner_session, true);
assert.equal(ownerState.body.data.shared_access, 'OPEN');
assert.equal(ownerState.body.data.sessions_issued_before_last_lock_rejected, true);

console.log('giving-shared-access.test.mjs passed: owner-only mass eviction blocks shared login, preserves owner access, and keeps pre-lock sessions revoked after reopen.');
