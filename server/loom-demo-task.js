import { createHash } from 'node:crypto';
import {
  bindLoomDemoRequest,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import {
  assertLoomDemoSigningSecret,
  loomDemoReceiptDigest,
  signLoomDemoStageReceipt,
  verifyLoomDemoStageReceiptAuthentication
} from './loom-demo-signing.js';
import { createLoomTaskHandler } from './loom-task.js';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// This adapter uses the existing Loom provider route and adds independent
// server-side AIA/file-binding checks plus a Loom-scoped authenticated stage
// receipt. The signed predecessor can be verified across server instances.
//
// This remains a stateless ancestry proof. It does not establish a globally
// unique latest head and cannot exclude replay/fork of an otherwise authentic
// ancestor without a separately reviewed durable-state contract.
export function createLoomDemoTaskHandler({
  taskHandler = createLoomTaskHandler(),
  environment = globalThis,
  signingSecret = process.env.TD613_LOOM_DEMO_SIGNING_SECRET,
  signingEnvironment = process.env,
  clock = () => Date.now()
} = {}) {
  const signerOptions = { secret: signingSecret, environment: signingEnvironment };

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
      assertLoomDemoSigningSecret(signingSecret, signingEnvironment);
    } catch (error) {
      return fail(error?.message || 'LOOM_DEMO_SIGNING_SECRET_NOT_CONFIGURED', 503);
    }

    try {
      const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw, 'utf8') > 240000) return fail('task-too-large',413);
      parsed = JSON.parse(raw);

      if (parsed?.phase === 'CONTINUE') {
        verifyLoomDemoStageReceiptAuthentication(parsed.predecessor, signerOptions);
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
          if (clock() >= parsed.activation.expires_at) {
            binding.governor.close();
            return fail('loom-demo-expired-before-admission', 409);
          }

          const admission = binding.admit(output);
          if (!admission.allowed) {
            binding.governor.close();
            return fail('loom-demo-response-held',422);
          }

          const admitted = binding.getAdmittedResult();
          const stageBody = {
            schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA,
            activation_digest: parsed.activation.activation_digest,
            phase: parsed.phase,
            request_id: parsed.request_id,
            request_digest: digest(parsed),
            current_input_digest: binding.governance.input_digest,
            prior_result_digest: binding.receipt.prior_result_digest,
            result_digest: digest(admitted),
            predecessor_receipt_digest: parsed.phase === 'CONTINUE' ? loomDemoReceiptDigest(parsed.predecessor) : null,
            expires_at: parsed.activation.expires_at,
            admission_state: 'ADMITTED',
            stage_policy: parsed.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND',
            authority_transferred: false
          };
          const stageReceipt = signLoomDemoStageReceipt(stageBody, signerOptions);
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

// Release barrier remains explicit. Cross-instance predecessor authentication is
// necessary but insufficient for production admission: no shared durable head
// currently excludes replay/fork, and exact live browser/provider/release-law
// closure remains separately required.
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
