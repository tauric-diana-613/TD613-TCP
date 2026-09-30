import { createHash } from 'node:crypto';
import {
  bindLoomDemoRequest,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import { createLoomTaskHandler } from './loom-task.js';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// This adapter uses the existing Loom provider route and adds independent
// server-side AIA/file-binding checks. No extra Vercel function or credential.
//
// The in-memory stage ledger below proves only same-process sequence custody for
// the bounded factory. It is deliberately not presented as cross-instance
// authentication. The default production route remains HELD until a separately
// reviewed signer/receipt contract exists.
export function createLoomDemoTaskHandler({ taskHandler = createLoomTaskHandler(), environment = globalThis } = {}) {
  const sessions = new Map();

  return async (req, res) => {
    let binding;
    let parsed;
    const fail = (code, status = 400) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.end(JSON.stringify({
        schema: 'td613.loom.ai-task-result/v0.1',
        request_id: parsed?.request_id ?? req.body?.request_id ?? null,
        status: 'held',
        answer: '',
        error: code
      }));
    };

    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return fail('method-not-allowed', 405); }
    const headers = Object.fromEntries(Object.entries(req.headers || {}).map(([key,value]) => [key.toLowerCase(),value]));
    try {
      const origin = new URL(headers.origin);
      if (headers['sec-fetch-site'] === 'cross-site' || origin.origin !== headers.origin || origin.host !== headers.host || !['https:', 'http:'].includes(origin.protocol) || (origin.protocol === 'http:' && !['localhost','127.0.0.1','[::1]'].includes(origin.hostname))) return fail('same-origin-required',403);
    } catch { return fail('same-origin-required',403); }
    if (!/^application\/json(?:\s*;|$)/i.test(headers['content-type'] || '')) return fail('json-required',415);

    try {
      const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw, 'utf8') > 240000) return fail('task-too-large',413);
      parsed = JSON.parse(raw);

      const activationDigest = parsed?.activation?.activation_digest;
      const priorSession = activationDigest ? sessions.get(activationDigest) : null;
      if (priorSession && priorSession.expires_at <= Date.now()) {
        sessions.delete(activationDigest);
      }

      if (parsed?.phase === 'ACTIVATE') {
        if (activationDigest && sessions.has(activationDigest)) return fail('loom-demo-activation-already-admitted', 409);
      } else if (parsed?.phase === 'CONTINUE') {
        const session = activationDigest ? sessions.get(activationDigest) : null;
        if (!session) return fail('loom-demo-activation-required', 409);
        if (!same(parsed.predecessor, session.stage_receipt)) return fail('loom-demo-predecessor-not-admitted', 409);
      }

      binding = await bindLoomDemoRequest(parsed, environment);
    } catch (error) {
      return fail(error?.message || 'loom-demo-binding-held');
    }

    const proxy = Object.create(req);
    proxy.body = binding.input;
    const response = Object.create(res);
    response.setHeader = (...args) => res.setHeader(...args);
    response.end = raw => {
      try {
        const output = JSON.parse(String(raw));
        if (output.status === 'completed') {
          const admission = binding.admit(output);
          if (!admission.allowed) {
            binding.governor.close();
            return fail('loom-demo-response-held',422);
          }

          const admitted = binding.getAdmittedResult();
          const stageReceipt = {
            schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA,
            activation_digest: parsed.activation.activation_digest,
            phase: parsed.phase,
            request_id: parsed.request_id,
            request_digest: digest(parsed),
            current_input_digest: binding.governance.input_digest,
            prior_result_digest: binding.receipt.prior_result_digest,
            result_digest: digest(admitted),
            expires_at: parsed.activation.expires_at,
            session_bound: true,
            authority_transferred: false
          };
          sessions.set(parsed.activation.activation_digest, {
            stage_receipt: stageReceipt,
            expires_at: parsed.activation.expires_at
          });
          res.statusCode = response.statusCode;
          binding.governor.close();
          return res.end(JSON.stringify({
            ...output,
            loom_demo_binding: binding.receipt,
            loom_demo_stage_receipt: stageReceipt
          }));
        }

        res.statusCode = response.statusCode;
        binding.governor.close();
        return res.end(JSON.stringify({ ...output, loom_demo_binding: binding.receipt }));
      } catch (error) {
        binding?.governor?.close();
        return fail(error?.message || 'loom-demo-response-held', 422);
      }
    };

    try { await taskHandler(proxy,response); }
    catch (error) { return fail(error?.message || 'loom-demo-provider-held', 502); }
    finally { binding.governor.close(); }
  };
}

// Draft release barrier. The factory above is available to bounded offline
// contract tests, but is NOT an admitted production receiver. Its same-process
// stage ledger is not a cross-instance authenticated predecessor chain.
// Removing this barrier requires a separately reviewed signer/receipt contract,
// hostile tests, exact-head browser review and release-law closure.
export default function loomDemoReleaseHeld(req, res) {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.end(JSON.stringify({
    schema: 'td613.loom.ai-task-result/v0.1',
    request_id: req.body?.request_id ?? null,
    status: 'held', answer: '', error: 'loom-demo-release-not-admitted'
  }));
}
