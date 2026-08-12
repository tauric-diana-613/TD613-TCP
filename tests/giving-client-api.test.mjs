import assert from 'node:assert/strict';
import { GivingApiClient } from '../app/giving/history/giving-api.js';

const calls = [];
const fetchImpl = async (_url, options) => {
  const envelope = JSON.parse(options.body);
  calls.push({ envelope, options });
  const data = envelope.operation === 'session.create'
    ? { authenticated: true, intent_nonce: 'intent-offline-test' }
    : { accepted: true };
  return new Response(JSON.stringify({ ok: true, data, receipt: { operation: envelope.operation }, error: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

const unbound = new GivingApiClient({ fetchImpl });
await assert.rejects(() => unbound.call('campaign-deputy.withhold', { dossier_id: 'dossier-test' }), /Refresh the signed operator session/);

const client = new GivingApiClient({ fetchImpl });
await client.createSession('not-a-real-secret');
await client.call('campaign-deputy.withhold', { dossier_id: 'dossier-test' });

assert.equal(calls.length, 2);
assert.equal(calls[0].envelope.schema, 'td613.giving.request/v1');
assert.equal(calls[0].envelope.operation, 'session.create');
assert.equal(calls[0].envelope.intent.nonce, null);
assert.equal(calls[0].options.redirect, 'error', 'secret-bearing requests must refuse redirects');
assert.equal(calls[1].envelope.operation, 'campaign-deputy.withhold');
assert.equal(calls[1].envelope.intent.nonce, 'intent-offline-test');
assert.match(calls[1].envelope.request_id, /^[A-Za-z0-9]/);

const internalFailureClient = new GivingApiClient({
  fetchImpl: async () => new Response(JSON.stringify({
    ok: false,
    data: null,
    receipt: { refusal_code: 'internal-error' },
    error: { code: 'internal-error', message: 'Giving operation did not complete' }
  }), { status: 500, headers: { 'Content-Type': 'application/json' } })
});
await assert.rejects(
  () => internalFailureClient.createSession('not-a-real-secret'),
  (error) => error.code === 'internal-error' && error.status === 500 && error.message === 'Giving operation did not complete',
  'server refusal JSON must not be flattened into boundary-unavailable'
);

console.log('giving-client-api.test.mjs passed');
