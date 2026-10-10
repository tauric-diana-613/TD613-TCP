import './loom-assay-a17-activation.test.mjs';
import './loom-assay-a16-activation.test.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { generateKeyPairSync, sign } from 'node:crypto';
import { reserveCall, completeCall, inspectRun } from '../neon/functions/loom-assay-budget/ledger.mjs';
import { verifyVercelOidc } from '../neon/functions/loom-assay-budget/vercel-identity.mjs';
import { sha256, canonicalJson, ASSAY_RECOVERY_POLICY_SCHEMA, ASSAY_RECOVERY_PROGRAM, ASSAY_RECOVERY_RUN_IDS } from '../server/loom-assay-contract.js';
const require = createRequire(new URL('../neon/functions/loom-assay-budget/package.json', import.meta.url));
const { PGlite } = require('@electric-sql/pglite');
const digest = 'a'.repeat(64), head = 'b'.repeat(40);
function policy() {
  const binding = JSON.parse(readFileSync(new URL('../research/portable-loom-server-transport-20261009/POLICY.template.json', import.meta.url))).binding;
  binding.protocol_commit = head; binding.limits.max_cost_usd = 10;
  binding.pricing = { input_usd_per_million: 1, output_usd_per_million: 2, source: 'synthetic local-engine pricing', verified_at: '2026-10-01T00:00:00Z' };
  return { schema: 'td613.loom.server-assay-policy/v0.2', run_id: 'fixture', protocol_commit: head, artifact_sha256: digest,
    expires_at: '2099-01-01T00:00:00Z', binding, receiver_output_tokens: 8192 };
}
async function setup(p = policy()) {
  const db = new PGlite();
  await db.exec(readFileSync(new URL('../neon/migrations/20261009_loom_assay_budget.sql', import.meta.url), 'utf8'));
  await db.query('INSERT INTO td613_assay_runs(run_id,credential_sha256,policy,status,policy_sha256) VALUES ($1,$2,$3,$4,$5)', [p.run_id, digest, p, 'ACTIVE', sha256(canonicalJson(p))]);
  // PGlite has one connection. Serialize its transactions explicitly; this is
  // SQL/rollback/replay evidence, not a multi-isolate PostgreSQL lock witness.
  let tail = Promise.resolve();
  const pool = { async connect() {
    const prior = tail; let release; tail = new Promise(r => { release = r; }); await prior;
    return { query: (sql, params) => db.query(sql, params), release };
  } };
  return { db, pool };
}
function input(trialId = 'FIRST_CONFIGURED_RECEIVER-R02-1', turn = 0, prior = []) {
  return { run_id: 'fixture', credential_sha256: digest, protocol_commit: head, artifact_sha256: digest,
    trial: { trial_id: trialId, case_id: 'R02', role: 'RECEIVER', turn_index: turn },
    request_sha256: 'c'.repeat(64), output_limit: 8192, prior_assistant_sha256: prior };
}
function complete(reserved, status = 'CAPTURED_NOT_ADMITTED') {
  return { run_id: 'fixture', credential_sha256: digest, call_key: reserved.call_key, request_sha256: reserved.request_sha256,
    response_sha256: 'd'.repeat(64), answer_sha256: status === 'CAPTURED_NOT_ADMITTED' ? 'e'.repeat(64) : null, status };
}
test('real local PostgreSQL accepts the migration and retains reservation and completion metadata', async () => {
  const { db, pool } = await setup();
  try {
    const r = await reserveCall(pool, input()); assert.equal(r.durable_reservation, true);
    await completeCall(pool, complete(r));
    const state = await inspectRun(pool, { run_id: 'fixture', credential_sha256: digest });
    assert.equal(state.calls_reserved, 1); assert.equal(state.reserved_cost_nanos, '216384000');
    const saved = (await db.query('SELECT * FROM td613_assay_calls')).rows[0];
    assert.equal(saved.status, 'CAPTURED_NOT_ADMITTED'); assert.equal(saved.answer_sha256, 'e'.repeat(64));
    assert.equal(Object.keys(saved).some(x => /prompt|payload|answer_body|key_material/.test(x)), false);
  } finally { await db.close(); }
});
test('the SQL reservation rejects comparative trials under first-receiver authority without spending', async () => {
  const { db, pool } = await setup();
  try {
    const attempt = input('COMPARE-K01-1'); attempt.trial = { trial_id: 'COMPARE-K01-1', case_id: 'K01', role: 'MONOLITH', turn_index: 0 };
    await assert.rejects(reserveCall(pool, attempt), /TRIAL_FAMILY_UNAUTHORIZED/);
    const row = (await db.query('SELECT calls_reserved,reserved_cost_nanos FROM td613_assay_runs')).rows[0];
    assert.equal(row.calls_reserved, 0); assert.equal(String(row.reserved_cost_nanos), '0');
  } finally { await db.close(); }
});
test('duplicate reservations queued against the local engine commit exactly once', async () => {
  const { db, pool } = await setup();
  try {
    const r = await Promise.allSettled([reserveCall(pool, input()), reserveCall(pool, input())]);
    assert.equal(r.filter(x => x.status === 'fulfilled').length, 1);
    assert.equal((await db.query('SELECT calls_reserved FROM td613_assay_runs')).rows[0].calls_reserved, 1);
    assert.equal((await db.query('SELECT count(*) AS n FROM td613_assay_calls')).rows[0].n, 1);
  } finally { await db.close(); }
});
test('financial ceiling and call ceiling rollback without refunds or partial insertion', async () => {
  for (const limit of ['cost', 'calls']) {
    const p = policy(); if (limit === 'cost') p.binding.limits.max_cost_usd = 0.3; else p.binding.limits.max_calls = 1;
    const { db, pool } = await setup(p);
    try {
      await reserveCall(pool, input());
      await assert.rejects(reserveCall(pool, input('FIRST_CONFIGURED_RECEIVER-R02-2')), /BUDGET_EXHAUSTED/);
      const row = (await db.query('SELECT * FROM td613_assay_runs')).rows[0];
      assert.equal(row.calls_reserved, 1); assert.equal(String(row.reserved_cost_nanos), '216384000');
      assert.equal((await db.query('SELECT count(*) AS n FROM td613_assay_calls')).rows[0].n, 1);
    } finally { await db.close(); }
  }
});
test('missing, wrong and failed predecessors cannot authorize a continuation', async () => {
  const { db, pool } = await setup();
  try {
    await assert.rejects(reserveCall(pool, input('FIRST_CONFIGURED_RECEIVER-R02-1', 1, ['e'.repeat(64)])), /PREDECESSOR_MISMATCH/);
    const r = await reserveCall(pool, input());
    await assert.rejects(reserveCall(pool, input('FIRST_CONFIGURED_RECEIVER-R02-1', 1, ['e'.repeat(64)])), /PREDECESSOR_MISMATCH/);
    await completeCall(pool, complete(r));
    await assert.rejects(reserveCall(pool, input('FIRST_CONFIGURED_RECEIVER-R02-1', 1, ['f'.repeat(64)])), /PREDECESSOR_MISMATCH/);
    const next = await reserveCall(pool, input('FIRST_CONFIGURED_RECEIVER-R02-1', 1, ['e'.repeat(64)]));
    assert.equal(next.call_key, 'FIRST_CONFIGURED_RECEIVER-R02-1:RECEIVER:1');
  } finally { await db.close(); }
});
test('completion is single-use and failed transport closes the run to further calls', async () => {
  const { db, pool } = await setup();
  try {
    const r = await reserveCall(pool, input()); await completeCall(pool, complete(r, 'HELD_EVIDENCE_GAP'));
    await assert.rejects(reserveCall(pool, input('FIRST_CONFIGURED_RECEIVER-R02-2')), /RUN_UNAVAILABLE/);
    assert.equal((await db.query('SELECT status FROM td613_assay_runs')).rows[0].status, 'HELD');
    assert.equal(String((await db.query('SELECT reserved_cost_nanos FROM td613_assay_runs')).rows[0].reserved_cost_nanos), '216384000');
  } finally { await db.close(); }
  const second = await setup();
  try {
    const r = await reserveCall(second.pool, input()); await completeCall(second.pool, complete(r));
    await assert.rejects(completeCall(second.pool, complete(r)), /COMPLETION_CONFLICT/);
  } finally { await second.db.close(); }
});
test('wrong capability, changed artifact, second-provider slot and inflated output cap preserve zero spend', async () => {
  const { db, pool } = await setup();
  try {
    for (const modify of [i => i.credential_sha256 = 'f'.repeat(64), i => i.artifact_sha256 = 'f'.repeat(64),
      i => i.output_limit = 8193, i => i.trial.trial_id = 'SECOND_PROVIDER-R02-1']) {
      const i = input(); modify(i); await assert.rejects(reserveCall(pool, i));
    }
    assert.equal((await db.query('SELECT calls_reserved FROM td613_assay_runs')).rows[0].calls_reserved, 0);
  } finally { await db.close(); }
});
test('workload authentication verifies RSA signature and exact owner/project/environment/time', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const at = Date.now(), now = Math.floor(at / 1000);
  const claims = { iss: 'https://oidc.vercel.com/tauric-diana-s-projects', aud: 'https://vercel.com/tauric-diana-s-projects',
    sub: 'owner:tauric-diana-s-projects:project:td-613-tcp:environment:production', owner: 'tauric-diana-s-projects',
    owner_id: 'team_pX5L7AFivMzMU1lH28Y6RIhX', project: 'td-613-tcp', environment: 'production', exp: now + 60 };
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'fixture' };
  const mint = body => {
    const h = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'fixture' })).toString('base64url');
    const p = Buffer.from(JSON.stringify(body)).toString('base64url');
    return `${h}.${p}.${sign('RSA-SHA256', Buffer.from(`${h}.${p}`), privateKey).toString('base64url')}`;
  };
  const fetchImpl = async () => new Response(JSON.stringify({ keys: [jwk] }));
  assert.equal((await verifyVercelOidc(mint(claims), { fetchImpl, at })).project, 'td-613-tcp');
  for (const change of [{ environment: 'preview' }, { owner_id: 'wrong' }, { exp: now }, { nbf: now + 1 }])
    await assert.rejects(verifyVercelOidc(mint({ ...claims, ...change }), { fetchImpl, at }));
  const altered = mint(claims).split('.'); altered[1] = Buffer.from(JSON.stringify({ ...claims, exp: now + 600 })).toString('base64url');
  await assert.rejects(verifyVercelOidc(altered.join('.'), { fetchImpl, at }), /SIGNATURE/);
});
test('a mutated policy cannot silently reuse the old run commitment', async () => {
  const { db, pool } = await setup();
  try {
    const p = policy(); p.binding.limits.max_cost_usd = 100;
    await db.query('UPDATE td613_assay_runs SET policy=$1', [p]);
    await assert.rejects(inspectRun(pool, { run_id: 'fixture', credential_sha256: digest }), /POLICY_COMMITMENT_MISMATCH/);
    assert.equal((await db.query('SELECT calls_reserved FROM td613_assay_runs')).rows[0].calls_reserved, 0);
  } finally { await db.close(); }
});
test('the bounded longer deadline preserves permanent HOLD and reservation accounting', async () => {
  const p = policy(); p.binding.limits.timeout_ms = 240000;
  const { db, pool } = await setup(p);
  try {
    const reserved = await reserveCall(pool, input());
    await completeCall(pool, complete(reserved, 'HELD_EVIDENCE_GAP'));
    await assert.rejects(inspectRun(pool, { run_id: 'fixture', credential_sha256: digest }), /RUN_UNAVAILABLE/);
    await assert.rejects(reserveCall(pool, input('FIRST_CONFIGURED_RECEIVER-R02-2')), /RUN_UNAVAILABLE/);
    const row = (await db.query('SELECT status,calls_reserved,reserved_cost_nanos FROM td613_assay_runs')).rows[0];
    assert.equal(row.status, 'HELD'); assert.equal(row.calls_reserved, 1);
    assert.equal(String(row.reserved_cost_nanos), reserved.reserved_cost_nanos);
  } finally { await db.close(); }
});
function recoveryPolicy(runId = ASSAY_RECOVERY_RUN_IDS[0]) {
  const p = policy(); p.schema = ASSAY_RECOVERY_POLICY_SCHEMA; p.run_id = runId;
  p.program = structuredClone(ASSAY_RECOVERY_PROGRAM); p.binding.limits.timeout_ms = 240000;
  p.binding.pricing.input_usd_per_million = 0.75; p.binding.pricing.output_usd_per_million = 3.75;
  return p;
}
async function insertRun(db, p, { status = 'ACTIVE', calls = 0, cost = '0' } = {}) {
  await db.query('INSERT INTO td613_assay_runs(run_id,credential_sha256,policy,status,policy_sha256,calls_reserved,reserved_cost_nanos) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [p.run_id, digest, p, status, sha256(canonicalJson(p)), calls, cost]);
}
function recoveryInput(runId = ASSAY_RECOVERY_RUN_IDS[0]) { return { ...input(), run_id: runId, input_token_bound: 100000 }; }
test('request-bound recovery reservations are durable and invalid bounds spend nothing', async () => {
  const p = recoveryPolicy(), { db, pool } = await setup(p);
  try {
    for (const bound of [0, 8191, 200001, 1.5]) await assert.rejects(reserveCall(pool, { ...recoveryInput(), input_token_bound: bound }), /INPUT_RESERVATION_BOUND/);
    assert.equal((await db.query('SELECT calls_reserved FROM td613_assay_runs')).rows[0].calls_reserved, 0);
    const r = await reserveCall(pool, recoveryInput()); assert.equal(r.input_token_bound, 100000);
    assert.equal(r.reserved_cost_nanos, '105720000');
    assert.equal(String((await db.query('SELECT reserved_cost_nanos FROM td613_assay_runs')).rows[0].reserved_cost_nanos), '105720000');
  } finally { await db.close(); }
});
test('different recovery runs share one financial cap including failed legacy reservations', async () => {
  const p = recoveryPolicy(), { db, pool } = await setup(p);
  try {
    const q = recoveryPolicy(ASSAY_RECOVERY_RUN_IDS[1]); await insertRun(db, q);
    const legacy = policy(); legacy.run_id = ASSAY_RECOVERY_PROGRAM.run_ids[1];
    await insertRun(db, legacy, { status: 'HELD', calls: 3, cost: '9850000000' });
    const result = await Promise.allSettled([reserveCall(pool, recoveryInput(p.run_id)), reserveCall(pool, recoveryInput(q.run_id))]);
    assert.equal(result.filter(x => x.status === 'fulfilled').length, 1);
    assert.match(result.find(x => x.status === 'rejected').reason.message, /PROGRAM_BUDGET_EXHAUSTED/);
    const rows = (await db.query('SELECT COALESCE(SUM(reserved_cost_nanos),0)::text AS total,SUM(calls_reserved) AS calls FROM td613_assay_runs')).rows[0];
    assert.equal(rows.total, '9955720000'); assert.equal(Number(rows.calls), 4);
    assert.equal((await db.query('SELECT count(*) AS n FROM td613_assay_calls')).rows[0].n, 1);
  } finally { await db.close(); }
});
test('the program call cap applies across distinct runs independently of the financial cap', async () => {
  const p = recoveryPolicy(), { db, pool } = await setup(p);
  try {
    const first = policy(); first.run_id = ASSAY_RECOVERY_PROGRAM.run_ids[1]; await insertRun(db, first, { status: 'HELD', calls: 40, cost: '0' });
    const second = policy(); second.run_id = ASSAY_RECOVERY_PROGRAM.run_ids[2]; await insertRun(db, second, { status: 'HELD', calls: 39, cost: '0' });
    await reserveCall(pool, recoveryInput());
    const q = recoveryPolicy(ASSAY_RECOVERY_RUN_IDS[1]); await insertRun(db, q);
    await assert.rejects(reserveCall(pool, recoveryInput(q.run_id)), /PROGRAM_BUDGET_EXHAUSTED/);
    assert.equal(Number((await db.query('SELECT SUM(calls_reserved) AS n FROM td613_assay_runs')).rows[0].n), 80);
  } finally { await db.close(); }
});


