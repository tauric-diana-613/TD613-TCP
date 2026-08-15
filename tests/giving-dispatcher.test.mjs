import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import givingHandler from '../api/giving.js';

process.env.TD613_GIVING_ACCESS_SECRET = 'operator-access-secret-that-is-long-enough';
process.env.TD613_GIVING_SESSION_SECRET = 'independent-signing-secret-that-is-even-longer';

function request(operation, payload = {}, { cookie = '', nonce = null, origin = 'https://td613.com' } = {}) {
  return {
    method: 'POST',
    url: '/api/giving',
    headers: {
      host: 'td613.com',
      origin,
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: {
      schema: 'td613.giving.request/v1',
      request_id: `request-${operation.replaceAll('.', '-')}-1234`,
      operation,
      intent: nonce ? { nonce, purpose: 'test' } : { purpose: 'test' },
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
  await givingHandler(req, res);
  return { res, body: res.body ? JSON.parse(res.body) : null };
}

const login = await call(request('session.create', { access_secret: process.env.TD613_GIVING_ACCESS_SECRET }));
assert.equal(login.res.statusCode, 200);
assert.equal(login.body.ok, true);
assert.ok(login.body.data.intent_nonce);
assert.match(login.res.headers['set-cookie'], /^__Host-td613-giving=/);
assert.equal(login.res.headers['x-robots-tag'], 'noindex, nofollow, noarchive, nosnippet');
assert.equal(login.res.headers['cache-control'], 'no-store, max-age=0');
assert.equal(login.body.receipt.donor_inputs_logged, false);

const streamedLoginRequest = request('session.create', { access_secret: process.env.TD613_GIVING_ACCESS_SECRET });
streamedLoginRequest.body = Readable.from([Buffer.from(JSON.stringify(streamedLoginRequest.body))]);
const streamedLogin = await call(streamedLoginRequest);
assert.equal(streamedLogin.res.statusCode, 200, 'production-style parsed body streams must not fall through JSON.stringify');
assert.equal(streamedLogin.body.ok, true);

const cookie = login.res.headers['set-cookie'].split(';', 1)[0];
const nonce = login.body.data.intent_nonce;
const status = await call(request('session.status', {}, { cookie }));
assert.equal(status.body.data.authenticated, true);
assert.equal(status.body.data.intent_nonce, nonce);

const registry = await call(request('registry.read', {}, { cookie }));
assert.equal(registry.body.data.source_instance_count, 23);
assert.equal(registry.body.data.municipalities.unique_count, 62);

const preparedGivingHistory = await call(request('campaign-deputy.prepare-giving-history', {
  confirmed: true,
  dossier_id: 'dossier-1',
  person_id: 'person-exact-1',
  records: [{
    record_digest: 'record:confirmed-1',
    identity_status: 'CONFIRMED',
    committee_name: 'Example Committee',
    committee_id: 'C00123456',
    contribution_date: '2026-07-15',
    amount_cents: 5000,
    source_instance_id: 'fec-schedule-a'
  }]
}, { cookie }));
assert.equal(preparedGivingHistory.res.statusCode, 200);
assert.equal(preparedGivingHistory.body.data.record_count, 1);
assert.equal(preparedGivingHistory.body.data.external_mutation, false);
assert.equal(preparedGivingHistory.body.receipt.custody, 'CAMPAIGN_DEPUTY_GIVING_HISTORY_STAGING_NO_EXTERNAL_WRITE');

const wrongNonce = await call(request('campaign-deputy.withhold', { dossier_id: 'dossier-1' }, { cookie, nonce: 'wrong' }));
assert.equal(wrongNonce.res.statusCode, 403);
assert.equal(wrongNonce.body.error.code, 'intent-nonce-withheld');

const withheld = await call(request('campaign-deputy.withhold', { dossier_id: 'dossier-1' }, { cookie, nonce }));
assert.equal(withheld.body.data.action, 'WITHHOLD');
assert.equal(withheld.body.data.external_mutation, false);

const crossOrigin = await call(request('session.status', {}, { cookie, origin: 'https://attacker.example' }));
assert.equal(crossOrigin.res.statusCode, 403);
assert.equal(crossOrigin.body.error.code, 'cross-origin-withheld');
assert.equal(crossOrigin.res.headers['access-control-allow-origin'], undefined);

const logout = await call(request('session.close', {}, { cookie, nonce }));
assert.equal(logout.body.data.closed, true);
assert.match(logout.res.headers['set-cookie'], /Max-Age=0/);

console.log('giving-dispatcher.test.mjs passed');

