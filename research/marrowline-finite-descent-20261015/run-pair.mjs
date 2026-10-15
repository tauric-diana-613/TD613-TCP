// TD613 Marrowline finite descent. A deliberate operator-run instrument; never run from CI.
// No provider call without BOTH --execute and --ack-paid; no retries or model failover.
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../../server/khonapolit-quality.js';
import { withGeminiGenerationProfile, GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE } from '../../server/gemini-generation-envelope.js';
import { parseRelayEnvelope } from '../../app/dome-world/khonapolit-relay.js';
import { geminiStreamGenerateContentUrl, geminiRequestHeaders } from '../../server/gemini-provider-transport.js';

const sha = value => createHash('sha256').update(value).digest('hex');
const truth = value => value === true;
const MODELS = Object.freeze(['gemini-3.8-flash', 'gemini-3.6-flash']);
const MAX_CALLS = 2;
const MAX_OUTPUT_TOKENS_PER_CALL = 12288;
const MAX_DURATION_MS_PER_CALL = 90000;
// Standard-tier pricing verified 2026-10-15. Not an absolute billing guarantee.
const MAX_REQUEST_BODY_UTF8_BYTES = 85000;
const OCT_2026_INPUT_USD_PER_MILLION = 0.75;
const OCT_2026_OUTPUT_USD_PER_MILLION = 3.75;
const REVIEWED_PUBLISHED_RATE_CEILING_USD = 0.25;
const conservativeUpperUsd = (
  MAX_CALLS * MAX_REQUEST_BODY_UTF8_BYTES * OCT_2026_INPUT_USD_PER_MILLION
  + MAX_CALLS * MAX_OUTPUT_TOKENS_PER_CALL * OCT_2026_OUTPUT_USD_PER_MILLION
) / 1e6;
if (conservativeUpperUsd >= REVIEWED_PUBLISHED_RATE_CEILING_USD) {
  throw new Error('PRICE_ENVELOPE_OVER_USD_0_25');
}
const FROZEN_MESSAGE = 'In a fictional town, a committee counts only returned forms and concludes that every silent resident is content. Locate the denominator error, pursue its consequence, and complete the connected Kʰonapolit and Tauric Diana bots movements. Let the voices author their own prose and native typography.';

function createBody(model, packet) {
  const body = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(packet, {}, model)
  );
  // Intervention: model identity. Everything in the provider request body is held fixed.
  // This overrides the normal distinct 3.8-MEDIUM versus 3.6-LOW interactive defaults.
  body.generationConfig = {
    ...body.generationConfig,
    maxOutputTokens: MAX_OUTPUT_TOKENS_PER_CALL,
    thinkingConfig: { thinkingLevel: 'medium' }
  };
  return body;
}

function decodeSse(raw) {
  const events = [];
  for (const block of raw.split(/\r?\n\r?\n/)) {
    const data = block.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!data || data === '[DONE]') continue;
    events.push(JSON.parse(data));
  }
  if (!events.length) throw new Error('No Gemini SSE data frames were observed');
  return events;
}

function observe(events, model) {
  let text = '', finishReason = null, servedModelVersion = null, usage = null;
  for (const event of events) {
    for (const part of event?.candidates?.[0]?.content?.parts || []) {
      if (typeof part?.text === 'string' && part.thought !== true) text += part.text;
    }
    finishReason = event?.candidates?.[0]?.finishReason ?? finishReason;
    servedModelVersion = event?.modelVersion ?? servedModelVersion;
    usage = event?.usageMetadata ?? usage;
  }
  const relay = parseRelayEnvelope(text, { model });
  return {
    requestedModel: model,
    servedModelVersion,
    finishReason,
    usage,
    providerTextSha256: sha(text),
    visibleProviderText: text,
    relayStatus: relay.signal?.state ?? 'UNKNOWN',
    relayAdmission: relay.admission,
    highZalgo: relay.highZalgo,
    originalEvents: events
  };
}

async function main() {
  const packet = buildInvocationPacket({
    message: FROZEN_MESSAGE,
    history: [],
    mode: 'issued-conjunction',
    shi: '',
    waiveIssuance: true
  });
  if (!truth(packet.canInvoke)) throw new Error('Invocation packet was not admitted');
  const requests = MODELS.map(model => ({ model, body: createBody(model, packet) }));
  const fingerprints = requests.map(({ model, body }) => ({
    requestedModel: model,
    systemSha256: sha(JSON.stringify(body.systemInstruction)),
    contentsSha256: sha(JSON.stringify(body.contents)),
    generationConfigSha256: sha(JSON.stringify(body.generationConfig)),
    requestSha256: sha(JSON.stringify(body)),
    requestBodyUtf8Bytes: Buffer.byteLength(JSON.stringify(body), 'utf8')
  }));
  for (const fingerprint of fingerprints) {
    if (fingerprint.requestBodyUtf8Bytes > MAX_REQUEST_BODY_UTF8_BYTES) throw new Error('PROMPT_UTF8_BUDGET_EXCEEDED');
  }
  for (const field of ['systemSha256', 'contentsSha256', 'generationConfigSha256']) {
    if (fingerprints[0][field] !== fingerprints[1][field]) throw new Error('PRE-FLIGHT-CONFOUND:' + field);
  }
  const execute = process.argv.includes('--execute');
  const ackPaid = process.argv.includes('--ack-paid');
  const plan = {
    schema: 'td613.marrowline.finite-provider-pair/v1',
    sourceOnly: !execute,
    intervention: 'requested-provider-model-only',
    expectedProviderCalls: MAX_CALLS,
    automaticRetries: 0,
    maxOutputTokensPerCall: MAX_OUTPUT_TOKENS_PER_CALL,
    maxDurationMsPerCall: MAX_DURATION_MS_PER_CALL,
    frozenMessageSha256: sha(FROZEN_MESSAGE),
    requestFingerprints: fingerprints,
    servedModelIdentity: 'PROVIDER_RETURN_REQUIRED',
    pricingBasis: '2026-10-15 GOOGLE STANDARD TIER - NOT A BILLING GUARANTEE',
    publishedRateUpperEstimateUsd: conservativeUpperUsd,
    priceUsd: 'BILLED COST UNKNOWN UNTIL PROVIDER RECEIPT',
    hardUsdCapGuaranteed: false,
    caveat: 'Two model calls are a bounded case study, not a frequency estimate.'
  };
  if (!execute) {
    process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
    return;
  }
  if (!ackPaid) throw new Error('PAID_EXPERIMENT_NOT_ACKNOWLEDGED: use --ack-paid');
  if (process.env.TD613_FINITE_DESCENT_MAX_USD !== '0.25') {
    throw new Error('REVIEWED_SPENDING_BOUND_REQUIRED: TD613_FINITE_DESCENT_MAX_USD=0.25');
  }
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY_REQUIRED');
  if (!process.env.TD613_FINITE_DESCENT_OUT) throw new Error('TD613_FINITE_DESCENT_OUT_REQUIRED');
  const outDir = resolve(process.env.TD613_FINITE_DESCENT_OUT);
  await mkdir(outDir, { recursive: true });
  const log = { ...plan, sourceOnly: false, observed: [], startedAt: new Date().toISOString() };
  await writeFile(resolve(outDir, 'manifest.json'), JSON.stringify(log, null, 2));
  for (const { model, body } of requests.slice(0, MAX_CALLS)) {
    const attempt = { requestedModel: model, startedAt: new Date().toISOString(), request: body };
    let rawWire = '';
    try {
      const res = await fetch(geminiStreamGenerateContentUrl(model), {
        method: 'POST',
        headers: geminiRequestHeaders(process.env.GEMINI_API_KEY),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(MAX_DURATION_MS_PER_CALL)
      });
      attempt.httpStatus = res.status;
      rawWire = await res.text();
      attempt.rawSseSha256 = sha(rawWire);
      if (res.ok) {
        const events = decodeSse(rawWire);
        Object.assign(attempt, observe(events, model));
      } else {
        attempt.errorClass = 'PROVIDER_NON_200';
        // Preserve raw error bytes in the local private episode only; do not echo secrets.
      }
    } catch (error) {
      attempt.errorClass = error?.name || 'TRANSPORT_ERROR';
      attempt.errorMessage = String(error?.message || '').slice(0, 240);
    }
    attempt.endedAt = new Date().toISOString();
    const index = log.observed.length + 1;
    // Retain full original streamed wire separately from parsed events, plus the submitted request.
    await writeFile(resolve(outDir, 'attempt-' + index + '.sse.txt'), rawWire);
    await writeFile(resolve(outDir, 'attempt-' + index + '.json'), JSON.stringify(attempt, null, 2));
    log.observed.push({
      requestedModel: model,
      httpStatus: attempt.httpStatus ?? null,
      servedModelVersion: attempt.servedModelVersion ?? null,
      finishReason: attempt.finishReason ?? null,
      providerTextSha256: attempt.providerTextSha256 ?? null,
      morphology: attempt.highZalgo ?? null,
      errorClass: attempt.errorClass ?? null
    });
    await writeFile(resolve(outDir, 'manifest.json'), JSON.stringify(log, null, 2));
    if (attempt.errorClass) break; // fail closed: do not spend a second call after first failure
  }
  log.endedAt = new Date().toISOString();
  await writeFile(resolve(outDir, 'manifest.json'), JSON.stringify(log, null, 2));
  process.stdout.write(JSON.stringify({
    outputDirectory: outDir,
    providerCallsAttempted: log.observed.length,
    observed: log.observed.map(({ morphology, ...rest }) => ({
      ...rest,
      combiningMarkCount: morphology?.combiningMarkCount ?? null,
      verticalOrnamentMarkCount: morphology?.verticalOrnamentMarkCount ?? null,
      combiningCodePointDiversity: morphology?.combiningCodePointDiversity ?? null,
      maxVerticalOrnamentStackDepth: morphology?.maxVerticalOrnamentStackDepth ?? null
    }))
  }, null, 2) + '\n');
}
main().catch(error => { process.stderr.write(String(error?.message || error) + '\n'); process.exitCode = 1; });
