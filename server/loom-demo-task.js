import { createHash } from 'node:crypto';
import {
  bindLoomDemoRequest,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import { loomDemoReceiptDigest } from './loom-demo-signing.js';
import {
  LOOM_DEMO_CUSTODY_URL,
  commitLoomDemoCustodyStage,
  loomDemoCustodyReadiness,
  readLoomDemoVercelOidcToken,
  releaseLoomDemoCustodyStage,
  reserveLoomDemoCustodyStage
} from './loom-demo-custody-client.js';
import { createLoomMarrowlineTaskHandler } from './loom-marrowline-task.js';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// Production custody is split across two systems without placing a Loom secret
// in Vercel:
// 1) Vercel binds the browser-carried activation/files and executes the provider;
// 2) Vercel presents its built-in OIDC workload identity to Neon;
// 3) Neon authenticates the predecessor, owns the signer, reserves the durable
//    current head, signs the admitted result and commits the next head.
//
// A completed result is not released to the browser until the remote durable
// commit has succeeded. No prompt/file/result body is stored in the custody DB.
export function createLoomDemoTaskHandler({
  taskHandler = createLoomMarrowlineTaskHandler(),
  environment = globalThis,
  custodyEnvironment = process.env,
  custodyFetch = (...args) => fetch(...args),
  custodyUrl = LOOM_DEMO_CUSTODY_URL,
  clock = () => Date.now()
} = {}) {
  return async (req, res) => {
    let custodyOptions = { environment:custodyEnvironment, fetchImpl:custodyFetch, url:custodyUrl };
    let binding;
    let parsed;
    let reservation = null;
    let reservationReleased = false;
    let nativeReply = null;

    const fail = (code, status = 400) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.end(JSON.stringify({
        schema: 'td613.loom.ai-task-result/v0.1',
        request_id: parsed?.request_id ?? req.body?.request_id ?? null,
        status: 'held',
        answer: '',
        error: code,
        ...(nativeReply ? { native_reply: nativeReply } : {})
      }));
    };

    const releaseReservation = async () => {
      if (!reservation || reservationReleased) return false;
      reservationReleased = true;
      try {
        await releaseLoomDemoCustodyStage({
          activation_digest: reservation.activation_digest,
          request_digest: reservation.request_digest,
          phase: reservation.phase
        }, custodyOptions);
        return true;
      } catch {
        // A failed release never upgrades a held request. Neon leases remain
        // bounded; preserving an uncertain reservation is safer than claiming
        // the head became free.
        return false;
      }
    };

    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return fail('method-not-allowed', 405); }
    const headers = Object.fromEntries(Object.entries(req.headers || {}).map(([key,value]) => [key.toLowerCase(),value]));
    try {
      const origin = new URL(headers.origin);
      if (headers['sec-fetch-site'] === 'cross-site' ||
          origin.origin !== headers.origin ||
          origin.host !== headers.host ||
          !['https:', 'http:'].includes(origin.protocol) ||
          (origin.protocol === 'http:' && !['localhost','127.0.0.1','[::1]'].includes(origin.hostname))) {
        return fail('same-origin-required',403);
      }
    } catch { return fail('same-origin-required',403); }
    if (!/^application\/json(?:\s*;|$)/i.test(headers['content-type'] || '')) return fail('json-required',415);

    const oidcToken=readLoomDemoVercelOidcToken({environment:custodyEnvironment,requestHeaders:headers});
    custodyOptions = { ...custodyOptions, requestHeaders:headers, oidcToken };
    const readiness = loomDemoCustodyReadiness({environment:custodyEnvironment,requestHeaders:headers,oidcToken,url:custodyUrl});
    if (!readiness.admitted) return fail('loom-demo-release-not-admitted',503);

    let requestDigest;
    let predecessorReceiptDigest = null;
    try {
      const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw, 'utf8') > 240000) return fail('task-too-large',413);
      parsed = JSON.parse(raw);

      binding = await bindLoomDemoRequest(parsed, environment);
      requestDigest = digest(parsed);
      predecessorReceiptDigest = parsed.phase === 'CONTINUE'
        ? loomDemoReceiptDigest(parsed.predecessor)
        : null;

      const reserved = await reserveLoomDemoCustodyStage({
        activation_digest: parsed.activation.activation_digest,
        phase: parsed.phase,
        request_digest: requestDigest,
        predecessor: parsed.phase === 'CONTINUE' ? parsed.predecessor : null,
        predecessor_receipt_digest: predecessorReceiptDigest,
        expires_at: parsed.activation.expires_at
      }, custodyOptions);

      reservation = reserved.reservation ?? {
        activation_digest: parsed.activation.activation_digest,
        phase: parsed.phase,
        request_digest: requestDigest
      };
    } catch (error) {
      binding?.governor?.close();
      return fail(error?.code || error?.message || 'loom-demo-binding-held', error?.status || 400);
    }

    const proxy = Object.create(req);
    proxy.body = binding.input;
    proxy.marrowline = binding.marrowline;
    proxy.loomPriorResult = binding.priorResult;
    const response = Object.create(res);
    let responseCompletion = null;
    response.setHeader = (...args) => res.setHeader(...args);

    response.end = raw => {
      responseCompletion = (async () => {
        try {
          const output = JSON.parse(String(raw));
          nativeReply = output.native_reply ?? null;
          if (output.status === 'completed') {
            if (clock() >= parsed.activation.expires_at) {
              binding.governor.close();
              await releaseReservation();
              return fail('loom-demo-expired-before-admission',409);
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

            const committed = await commitLoomDemoCustodyStage({
              stage_body: stageBody
            }, custodyOptions);
            reservationReleased = true;

            const stageReceipt = committed.stage_receipt;
            const head = committed.head;
            if (!stageReceipt || loomDemoReceiptDigest(stageReceipt) !== head?.receipt_digest) {
              binding.governor.close();
              return fail('LOOM_DEMO_CUSTODY_COMMIT_MISMATCH',409);
            }

            res.statusCode = response.statusCode;
            binding.governor.close();
            return res.end(JSON.stringify({
              ...output,
              loom_demo_binding: binding.receipt,
              loom_demo_stage_receipt: stageReceipt,
              loom_demo_head: {
                schema:'td613.loom.demo-head/v0.1',
                receipt_digest:head.receipt_digest,
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

export function loomDemoProductionReadiness(environment=process.env,requestHeaders={}){
  return loomDemoCustodyReadiness({environment,requestHeaders,url:LOOM_DEMO_CUSTODY_URL});
}

const productionHandler = createLoomDemoTaskHandler();

// Production remains fail-closed unless Vercel supplies its workload OIDC token
// and the immutable Neon custody endpoint has been admitted in source. Neither a
// database password nor a Loom signing secret is required in Vercel.
export default async function loomDemoProductionHandler(req,res){
  const readiness=loomDemoProductionReadiness(process.env,req?.headers||{});
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
        vercel_oidc:readiness.vercel_oidc,
        neon_custody_endpoint:readiness.neon_custody_endpoint
      }
    }));
  }
  return productionHandler(req,res);
}
