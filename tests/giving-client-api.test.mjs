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
await assert.rejects(() => unbound.call('campaign-deputy.ensure-committee', { committee_id: 'C00999991' }), /Refresh the signed operator session/);

const client = new GivingApiClient({ fetchImpl });
await client.createSession('not-a-real-secret');
await client.call('campaign-deputy.withhold', { dossier_id: 'dossier-test' });
await client.call('campaign-deputy.ensure-committee', { confirmed: true, committee_id: 'C00999991', committee_name: 'Example Committee' });

assert.equal(calls.length, 3);
assert.equal(calls[0].envelope.schema, 'td613.giving.request/v1');
assert.equal(calls[0].envelope.operation, 'session.create');
assert.equal(calls[0].envelope.intent.nonce, null);
assert.equal(calls[0].options.redirect, 'error', 'secret-bearing requests must refuse redirects');
assert.equal(calls[1].envelope.operation, 'campaign-deputy.withhold');
assert.equal(calls[1].envelope.intent.nonce, 'intent-offline-test');
assert.equal(calls[2].envelope.operation, 'campaign-deputy.ensure-committee');
assert.equal(calls[2].envelope.intent.nonce, 'intent-offline-test');
assert.match(calls[2].envelope.request_id, /^[A-Za-z0-9]/);

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

// Keep the live AIA hydration witness inside the maintained Giving test lane.
await import('./giving-aia-surface.test.mjs');

if (process.env.GITHUB_ACTIONS === 'true') {
  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir('artifacts/giving-contract-markers', { recursive: true });
  await writeFile('artifacts/giving-contract-markers/client-aia.pass', 'PASS\n');
}

console.log('giving-client-api.test.mjs passed');