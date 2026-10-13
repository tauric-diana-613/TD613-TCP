import assert from 'node:assert/strict';
import { consumeGivingMutationIntent } from '../server/giving/intent-ledger.js';
import { assertGivingCisternRoute } from '../server/giving/cistern.js';

const priorNeon = process.env.TD613_GIVING_NEON_DATABASE_URL;
process.env.TD613_GIVING_NEON_DATABASE_URL = 'postgresql://operator:test@ep-cistern-test.neon.tech/td613?sslmode=require';

const spent = new Set();
const queries = [];
const fakeNeon = async (url, init = {}) => {
  assert.equal(url, 'https://ep-cistern-test.neon.tech/sql');
  assert.equal(init.redirect, 'error');
  assert.equal(init.headers['Neon-Connection-String'], process.env.TD613_GIVING_NEON_DATABASE_URL);
  const { query, params = [] } = JSON.parse(init.body || '{}');
  queries.push({ query, params });
  if (/INSERT INTO td613_giving_spent_intents/i.test(query)) {
    const key = `${params[0]}:${params[1]}`;
    const duplicate = spent.has(key);
    if (!duplicate) spent.add(key);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          fields: [{ name: 'intent_digest' }],
          rows: duplicate ? [] : [[params[1]]]
        };
      }
    };
  }
  return {
    ok: true,
    status: 200,
    async json() { return { fields: [], rows: [] }; }
  };
};

const session = {
  sid: 'session-cistern-test-1234',
  nonce: 'intent-cistern-test-1234',
  exp: Math.floor(Date.now() / 1000) + 900
};
const envelope = {
  operation: 'campaign-deputy.create-confirmed',
  request_digest: 'request-digest-cistern-test',
  intent: { nonce: session.nonce },
  payload: {
    confirmed: true,
    duplicate_reviewed: true,
    create_new_confirmed: true
  }
};

const first = await consumeGivingMutationIntent({ envelope, session, fetchImpl: fakeNeon });
assert.equal(first.durable, true);
assert.equal(first.payload_logged, false);
assert.match(first.intent_digest, /^[a-f0-9]{64}$/);
assert.ok(queries.some(({ query }) => /CREATE TABLE IF NOT EXISTS td613_giving_spent_intents/i.test(query)));
assert.ok(queries.some(({ query }) => /ON CONFLICT \(session_digest, intent_digest\) DO NOTHING/i.test(query)));

await assert.rejects(
  () => consumeGivingMutationIntent({ envelope, session, fetchImpl: fakeNeon }),
  (error) => error?.code === 'intent-replay-withheld' && error?.status === 409
);

spent.clear();
const preflight = await assertGivingCisternRoute(envelope, session, { fetchImpl: fakeNeon });
assert.equal(preflight.outcome, 'RELEASED');
assert.equal(preflight.durable_tombstone, true);
assert.equal(preflight.replay_posture, 'DURABLE_SPENT_INTENT_TOMBSTONE_RECORDED');
assert.equal(preflight.route.exact_route_match, true);
assert.equal(preflight.route.same_endpoint_not_same_history, true);

const idempotentSession = { ...session, nonce: 'intent-link-existing-5678' };
const linkReceipt = await assertGivingCisternRoute({
  operation: 'campaign-deputy.link-existing',
  request_digest: 'request-link-existing',
  intent: { nonce: idempotentSession.nonce },
  payload: { confirmed: true, person_id: 'person-1234' }
}, idempotentSession, {
  fetchImpl: async () => { throw new Error('idempotent membership path must not require the replay ledger'); }
});
assert.equal(linkReceipt.durable_tombstone, false);
assert.equal(linkReceipt.outcome, 'RELEASED');

if (priorNeon === undefined) delete process.env.TD613_GIVING_NEON_DATABASE_URL;
else process.env.TD613_GIVING_NEON_DATABASE_URL = priorNeon;

console.log('giving-cistern-replay.test.mjs passed');
