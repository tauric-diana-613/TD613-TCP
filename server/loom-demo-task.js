import { createHash } from 'node:crypto';
import {
  bindLoomDemoRequest,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import {
  assertLoomDemoSigningSecret,
  loomDemoReceiptDigest,
  loomDemoSigningConfiguration,
  signLoomDemoStageReceipt,
  verifyLoomDemoStageReceiptAuthentication
} from './loom-demo-signing.js';
import {
  commitLoomDemoStage,
  loomDemoHeadStoreReadiness,
  readLoomDemoHead,
  releaseLoomDemoStageReservation,
  reserveLoomDemoStage
} from './loom-demo-head-store.js';
import { createLoomTaskHandler } from './loom-task.js';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// The production-grade Loom demo adapter separates three authorities:
// 1) browser-carried typed activation and file commitments,
// 2) Loom-only authenticated stage receipts,
// 3) Loom-only durable current-head custody.
//
// Durable reservation happens before provider invocation. Durable head commit
// happens after output admission and receipt signing, before a completed result
// is released to the browser. No prompt/file/result bodies enter the head store.
export function createLoomDemoTaskHandler({
  taskHandler = createLoomTaskHandler(),
  environment = globalThis,
  signingSecret = process.env.TD613_LOOM_DEMO_SIGNING_SECRET,
  signingEnvironment = process.env,
  headStoreEnvironment = process.env,
  headStoreFetch = (...args) => fetch(...args),
  clock = () => Date.now()
} = {}) {
  const signerOptions = { secret: signingSecret, environment: signingEnvironment };

  return async (req, res) => {
    let binding;
    let parsed;
    let reservation = null;
    let reservationReleased = false;
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
    const releaseReservation = async () => {
      if (!reservation || reservationReleased) return false;
      reservationReleased = true;
      try {
        return await releaseLoomDemoStageReservation({
          activationDigest: reservation.activation_digest,
          requestDigest: reservation.request_digest,
          phase: reservation.phase,
          fetchImpl: headStoreFetch,
          environment: headStoreEnvironment
        });
      } catch {
        // Release failure never upgrades a held/failed request. The lease remains
        // bounded and later expires; preserving the reservation is safer than
        // claiming the head became free.
        return false;
      }
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
      const store = loomDemoHeadStoreReadiness(headStoreEnvironment);
      if (!store.configured) throw Object.assign(new Error(store.error || 'LOOM_DEMO_HEAD_STORE_NOT_CONFIGURED'), { status: 503 });
    } catch (error) {
      return fail(error?.message || 'loom-demo-custody-not-configured', error?.status || 503);
    }

    let requestDigest;
    let predecessorReceiptDigest = null;
    try {
      const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw, 'utf8') > 240000) return fail('task-too-large',413);
      parsed = JSON.parse(raw);

      if (parsed?.phase === 'CONTINUE') {
        verifyLoomDemoStageReceiptAuthentication(parsed.predecessor, signerOptions);
        predecessorReceiptDigest = loomDemoReceiptDigest(parsed.predecessor);
      }

      binding = await bindLoomDemoRequest(parsed, environment);
      requestDigest = digest(parsed);
      reservation = await reserveLoomDemoStage({
        activationDigest: parsed.activation.activation_digest,
        phase: parsed.phase,
        requestDigest,
        predecessorReceiptDigest,
        expiresAt: parsed.activation.expires_at,
        fetchImpl: headStoreFetch,
        environment: headStoreEnvironment,
        now: clock()
      });
    } catch (error) {
      return fail(error?.code || error?.message || 'loom-demo-binding-held', error?.status || 400);
    }

    const proxy = Object.create(req);
    proxy.body = binding.input;
    const response = Object.create(res);
    let responseCompletion = null;
    response.setHeader = (...args) => res.setHeader(...args);
    response.end = raw => {
      responseCompletion = (async () => {
      try {
        const output = JSON.parse(String(raw));
        if (output.status === 'completed') {
          if (clock() >= parsed.activation.expires_at) {
            binding.governor.close();
            await releaseReservation();
            return fail('loom-demo-expired-before-admission', 409);
          }

          const admission = binding.admit(output);
          if (!admission.allowed) {
            binding.governor.close();
            await releaseReservation();
            return fail('loom-demo-response-held',422);
          }

          const admitted = binding.getAdmittedResult();
          const stageBody = {
            schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA,
            activation_digest: parsed.activation.activation_digest,
            phase: parsed.phase,
            request_id: parsed.request_id,
            request_digest: requestDigest,
            current_input_digest: binding.governance.input_digest,
            prior_result_digest: binding.receipt.prior_result_digest,
            result_digest: digest(admitted),
            predecessor_receipt_digest: predecessorReceiptDigest,
            expires_at: parsed.activation.expires_at,
            admission_state: 'ADMITTED',
            stage_policy: parsed.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND',
            authority_transferred: false
          };
          const stageReceipt = signLoomDemoStageReceipt(stageBody, signerOptions);
          const receiptDigest = loomDemoReceiptDigest(stageReceipt);
          try {
            await commitLoomDemoStage({
              activationDigest: parsed.activation.activation_digest,
              phase: parsed.phase,
              requestId: parsed.request_id,
              requestDigest,
              receiptDigest,
              fetchImpl: headStoreFetch,
              environment: headStoreEnvironment
            });
            reservationReleased = true;
          } catch (error) {
            let reconciled = false;
            try {
              const durable = await readLoomDemoHead({
                activationDigest: parsed.activation.activation_digest,
                fetchImpl: headStoreFetch,
                environment: headStoreEnvironment
              });
              reconciled = durable?.head_receipt_digest === receiptDigest &&
                durable?.head_request_id === parsed.request_id &&
                durable?.head_phase === parsed.phase;
            } catch {
              reconciled = false;
            }
            if (!reconciled) {
              binding.governor.close();
              return fail(error?.code || error?.message || 'LOOM_DEMO_HEAD_COMMIT_HELD', error?.status || 409);
            }
            reservationReleased = true;
          }

          res.statusCode = response.statusCode;
          binding.governor.close();
          return res.end(JSON.stringify({
            ...output,
            loom_demo_binding: binding.receipt,
            loom_demo_stage_receipt: stageReceipt,
            loom_demo_head: {
              schema:'td613.loom.demo-head/v0.1',
              receipt_digest:receiptDigest,
              durable:true,
              payload_logged:false
            }
          }));
        }

        binding.governor.close();
        await releaseReservation();
        res.statusCode = response.statusCode;
        return res.end(JSON.stringify({ ...output, loom_demo_binding: binding.receipt }));
      } catch (error) {
        binding?.governor?.close();
        await releaseReservation();
        return fail(error?.code || error?.message || 'loom-demo-response-held', error?.status || 422);
      }
      })();
      return responseCompletion;
    };

    try {
      await taskHandler(proxy,response);
      if (responseCompletion) await responseCompletion;
    } catch (error) {
      await releaseReservation();
      return fail(error?.code || error?.message || 'loom-demo-provider-held', error?.status || 502);
    } finally {
      binding.governor.close();
    }
  };
}

export function loomDemoProductionReadiness(environment=process.env) {
  const signer=loomDemoSigningConfiguration({
    secret:environment.TD613_LOOM_DEMO_SIGNING_SECRET,
    environment
  });
  const head=loomDemoHeadStoreReadiness(environment);
  return Object.freeze({
    admitted:Boolean(signer.configured && head.configured),
    signer,
    head_store:head,
    cross_instance_predecessor_authentication:Boolean(signer.configured),
    durable_single_head:Boolean(head.configured),
    replay_exclusion:Boolean(head.configured),
    fork_exclusion:Boolean(head.configured),
    provider_and_browser_witness_required:true
  });
}

const productionHandler = createLoomDemoTaskHandler();

// Production entrypoint is configuration-gated rather than unconditionally dead.
// Source admission does not provision either secret/store variable. When either
// Loom-only authority is absent or invalid, production remains 503 HELD.
export default async function loomDemoProductionHandler(req,res) {
  const readiness=loomDemoProductionReadiness(process.env);
  if(!readiness.admitted){
    res.statusCode=503;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('Cache-Control','no-store, max-age=0');
    return res.end(JSON.stringify({
      schema:'td613.loom.ai-task-result/v0.1',
      request_id:req.body?.request_id??null,
      status:'held',
      answer:'',
      error:'loom-demo-release-not-admitted',
      readiness:{
        signer_configured:readiness.signer.configured,
        head_store_configured:readiness.head_store.configured
      }
    }));
  }
  return productionHandler(req,res);
}
