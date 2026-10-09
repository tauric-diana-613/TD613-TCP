import { validateAssayPolicy, validateTrial, requireTrialFamily, outputLimit, reservationNanos, exactFields, requireThat, sha256, canonicalJson } from '../../../server/loom-assay-contract.js';

// No payload bodies, no automatic run provisioning, no refunds or replay.
// Each operation uses its own transaction and locks the run before admission.
export async function withAssayRun(pool, input, action) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const rows = await client.query('SELECT * FROM td613_assay_runs WHERE run_id=$1 FOR UPDATE', [input.run_id]);
    const row = rows.rows[0];
    requireThat(row && row.credential_sha256 === input.credential_sha256 && row.status === 'ACTIVE', 'ASSAY_RUN_UNAVAILABLE');
    const p = validateAssayPolicy(row.policy);
    requireThat(row.policy_sha256 === sha256(canonicalJson(p)), 'ASSAY_POLICY_COMMITMENT_MISMATCH');
    requireThat(p.run_id === input.run_id, 'ASSAY_RUN_POLICY_MISMATCH');
    const result = await action(client, row, p);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}
export async function inspectRun(pool, input) {
  exactFields(input, ['run_id', 'credential_sha256']);
  return withAssayRun(pool, input, async (_client, row, p) => ({ policy: p,
    calls_reserved: Number(row.calls_reserved), reserved_cost_nanos: String(row.reserved_cost_nanos) }));
}
export async function reserveCall(pool, input) {
  exactFields(input, ['run_id', 'credential_sha256', 'protocol_commit', 'artifact_sha256', 'trial',
    'request_sha256', 'output_limit', 'prior_assistant_sha256', ...(Object.hasOwn(input, 'input_token_bound') ? ['input_token_bound'] : [])]);
  const key = validateTrial(input.trial);
  requireThat(/^[a-f0-9]{64}$/.test(input.request_sha256) && Array.isArray(input.prior_assistant_sha256)
    && input.prior_assistant_sha256.every(x => /^[a-f0-9]{64}$/.test(x)), 'ASSAY_RESERVATION_SHAPE');
  return withAssayRun(pool, input, async (client, row, p) => {
    requireTrialFamily(p, input.trial);
    requireThat(p.protocol_commit === input.protocol_commit && p.artifact_sha256 === input.artifact_sha256
      && input.output_limit === outputLimit(p, input.trial), 'ASSAY_RESERVATION_BINDING');
    requireThat(input.trial.role !== 'RECEIVER' || input.trial.trial_id.startsWith('FIRST_CONFIGURED_RECEIVER-'), 'ASSAY_SECOND_PROVIDER_UNBOUND');
    const prior = await client.query('SELECT call_key,status,answer_sha256 FROM td613_assay_calls WHERE run_id=$1 AND trial_id=$2 AND role=$3 ORDER BY turn_index',
      [p.run_id, input.trial.trial_id, input.trial.role]);
    requireThat(!prior.rows.some(x => x.call_key === key), 'ASSAY_CALL_ALREADY_RESERVED');
    requireThat(prior.rows.length === input.trial.turn_index && input.prior_assistant_sha256.length === prior.rows.length
      && prior.rows.every((x, i) => x.status === 'CAPTURED_NOT_ADMITTED' && x.answer_sha256 === input.prior_assistant_sha256[i]), 'ASSAY_PREDECESSOR_MISMATCH');
    requireThat(Boolean(p.program) === Object.hasOwn(input, 'input_token_bound'), 'ASSAY_INPUT_RESERVATION_BOUND');
    requireThat(!p.program || Number.isSafeInteger(input.input_token_bound) && input.input_token_bound >= 8192
      && input.input_token_bound <= p.binding.limits.max_input_tokens_per_call, 'ASSAY_INPUT_RESERVATION_BOUND');
    const cost = BigInt(reservationNanos(p, input.output_limit, input.input_token_bound));
    const ceiling = BigInt(Math.floor(p.binding.limits.max_cost_usd * 1000000000));
    requireThat(Number(row.calls_reserved) < p.binding.limits.max_calls
      && BigInt(row.reserved_cost_nanos) + cost <= ceiling, 'ASSAY_BUDGET_EXHAUSTED');
    if (p.program) {
      // Serialize all child runs under one transaction-scoped program lock.
      // Legacy failed reservations remain charged in this sum forever.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`td613-assay:${p.program.id}`]);
      const totals = await client.query('SELECT COALESCE(SUM(calls_reserved),0) AS calls,COALESCE(SUM(reserved_cost_nanos),0)::text AS cost FROM td613_assay_runs WHERE run_id=ANY($1::text[])', [p.program.run_ids]);
      requireThat(Number(totals.rows[0].calls) < p.program.max_calls
        && BigInt(totals.rows[0].cost) + cost <= BigInt(Math.floor(p.program.max_cost_usd * 1000000000)), 'ASSAY_PROGRAM_BUDGET_EXHAUSTED');
    }
    await client.query('INSERT INTO td613_assay_calls (run_id,call_key,trial_id,role,turn_index,request_sha256,reserved_cost_nanos,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [p.run_id, key, input.trial.trial_id, input.trial.role, input.trial.turn_index, input.request_sha256, String(cost), 'RESERVED']);
    await client.query('UPDATE td613_assay_runs SET calls_reserved=calls_reserved+1,reserved_cost_nanos=reserved_cost_nanos+$2 WHERE run_id=$1', [p.run_id, String(cost)]);
    return { call_key: key, request_sha256: input.request_sha256, reserved_cost_nanos: String(cost), durable_reservation: true,
      ...(p.program ? { input_token_bound: input.input_token_bound } : {}) };
  });
}
export async function completeCall(pool, input) {
  exactFields(input, ['run_id', 'credential_sha256', 'call_key', 'request_sha256', 'response_sha256', 'answer_sha256', 'status']);
  requireThat(['CAPTURED_NOT_ADMITTED', 'HELD_EVIDENCE_GAP'].includes(input.status)
    && typeof input.call_key === 'string' && input.call_key.length <= 160 && /^[a-f0-9]{64}$/.test(input.request_sha256)
    && /^[a-f0-9]{64}$/.test(input.response_sha256)
    && (input.status === 'HELD_EVIDENCE_GAP' ? input.answer_sha256 === null : /^[a-f0-9]{64}$/.test(input.answer_sha256)), 'ASSAY_COMPLETION_SHAPE');
  return withAssayRun(pool, input, async (client, _row, p) => {
    const changed = await client.query('UPDATE td613_assay_calls SET status=$4,response_sha256=$5,answer_sha256=$6,completed_at=now() WHERE run_id=$1 AND call_key=$2 AND request_sha256=$3 AND status=$7 RETURNING call_key',
      [p.run_id, input.call_key, input.request_sha256, input.status, input.response_sha256, input.answer_sha256, 'RESERVED']);
    requireThat(changed.rows.length === 1, 'ASSAY_COMPLETION_CONFLICT');
    if (input.status === 'HELD_EVIDENCE_GAP') await client.query('UPDATE td613_assay_runs SET status=$2 WHERE run_id=$1', [p.run_id, 'HELD']);
    return { retained: true, call_key: input.call_key, status: input.status };
  });
}
