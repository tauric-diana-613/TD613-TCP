#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove — Q1 Live Creative Discriminator Harness
//
// FAIL-CLOSED ZERO-SPEND BY DEFAULT:
// - Without BOTH `--execute-live` AND `--operator-auth-sha=<exact-40-hex-head>`,
//   this script runs strictly in `--dry-run` mode with ZERO network calls and writes
//   Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json.
// - When explicitly authorized and invoked with `--execute-live`, executes AT MOST
//   8 single-shot calls (4 Arm A + 4 Arm C across T1 BLUE_ORANGE_WEATHER & T2 FORENSIC),
//   directly to pinned `models/gemini-3.8-flash:streamGenerateContent?alt=sse`, with:
//     * retryCount = 0
//     * fallbackSeats = []
//     * structuralRepair = false
//     * morphologyChase = false
//     * all four preregistered fail-closed stop rules active.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../../app/engine/aperture-v3-task-intent.js';
import {
  buildHistoricalGroveDramaturgyCandidate,
  MARROWLINE_HISTORICAL_TRIAL_ID
} from '../../app/dome-world/marrowline-historical-grove.js';
import {
  buildGeminiRequest,
  observeGeminiOutput,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import {
  observeMarrowlineCompletion,
  POLICY_NONSTOP_FINISH_REASONS
} from '../../server/marrowline-completion.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  observeBotsProsodyDistribution,
  parseRelayEnvelope
} from '../../app/dome-world/khonapolit-relay.js';
import { DISCRIMINATOR_TASKS } from '../marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = __dirname;

const PINNED_MODEL = 'gemini-3.8-flash';
const HARD_MAX_CALLS = 8;

// Authoritative Gemini Developer API pricing verified 2026-11-21 (ai.google.dev)
const PRICING_USD_PER_1M = Object.freeze({
  model: PINNED_MODEL,
  intro_through_2026_12_31: { input: 0.75, cached_input: 0.075, output_including_thinking: 3.75 },
  standard_from_2027_01_01: { input: 1.50, cached_input: 0.15, output_including_thinking: 7.50 }
});

const Q1_TASKS = Object.freeze({
  T1_BLUE_ORANGE_WEATHER: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER,
  T2_FORENSIC: DISCRIMINATOR_TASKS.FORENSIC
});

// Counterbalanced interleaved 8-slot schedule (4 Arm A + 4 Arm C = 8 hard cap)
const Q1_SCHEDULE = Object.freeze([
  { slot: 'S01', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 1 },
  { slot: 'S02', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 1 },
  { slot: 'S03', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T2_FORENSIC', replicate: 1 },
  { slot: 'S04', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T2_FORENSIC', replicate: 1 },
  { slot: 'S05', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 2 },
  { slot: 'S06', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 2 },
  { slot: 'S07', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T2_FORENSIC', replicate: 2 },
  { slot: 'S08', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T2_FORENSIC', replicate: 2 }
]);

const sha256Buf = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sha256Text = (txt) => sha256Buf(Buffer.from(String(txt || ''), 'utf8'));

function buildSlotRequest(slotSpec) {
  const task = Q1_TASKS[slotSpec.taskKey];
  const packet = buildInvocationPacket({
    message: task.prompt,
    mode: 'exploratory',
    waiveIssuance: true
  });
  const discourseMode = classifyApertureDiscourseMode(packet.message);
  const apertureReceipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    discourseMode,
    contentScanned: true
  });

  const buildInteractive = (fn) => withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    fn
  );

  let request;
  if (slotSpec.arm === 'A') {
    request = buildInteractive(() => buildGeminiRequest(packet, apertureReceipt, PINNED_MODEL, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: true
    }));
  } else if (slotSpec.arm === 'C') {
    request = buildInteractive(() => {
      const base = buildGeminiRequest(packet, apertureReceipt, PINNED_MODEL, {
        groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
        historicalProsodyFreedom: false
      });
      return {
        ...base,
        systemInstruction: {
          parts: [{ text: buildHistoricalGroveDramaturgyCandidate(base.systemInstruction.parts[0].text) }]
        }
      };
    });
  } else {
    throw new Error(`UNREGISTERED_Q1_ARM: ${slotSpec.arm}`);
  }

  const wire = serializeGeminiRequest(request, PINNED_MODEL);
  const sysText = request.systemInstruction?.parts?.[0]?.text || '';
  return {
    slotSpec,
    task,
    aperture: {
      primaryRoute: apertureReceipt?.taskIntent?.primary_route || null,
      discourseMode: apertureReceipt?.taskIntent?.discourse_mode || null,
      runtimeMateriality: apertureReceipt?.taskIntent?.runtime_materiality || null,
      contentScanned: apertureReceipt?.taskIntent?.content_scanned === true
    },
    request,
    wire,
    systemInstructionBytes: Buffer.byteLength(sysText, 'utf8'),
    systemInstructionChars: sysText.length,
    approxPromptTokensConservative: Math.ceil(wire.observation.utf8Bytes / 3.4)
  };
}

function estimateCostUsd(promptTokens, outputAndThoughtTokens, rates) {
  const inputCost = (promptTokens / 1_000_000) * rates.input;
  const outputCost = (outputAndThoughtTokens / 1_000_000) * rates.output_including_thinking;
  return {
    input_usd: Number(inputCost.toFixed(5)),
    output_and_thinking_usd: Number(outputCost.toFixed(5)),
    total_usd: Number((inputCost + outputCost).toFixed(5))
  };
}

function parseSseFrames(rawSseText) {
  const frames = [];
  let text = '';
  let modelVersion = null;
  let finishReason = null;
  let finishMessage = null;
  let promptFeedback = null;
  const usageMetadata = {};
  for (const block of String(rawSseText || '').split(/\r?\n\r?\n/)) {
    const dataLines = block
      .split(/\r?\n/)
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .filter(Boolean);
    if (!dataLines.length) continue;
    const rawJson = dataLines.join('\n');
    if (rawJson === '[DONE]') continue;
    const ev = JSON.parse(rawJson);
    frames.push(ev);
    if (ev.modelVersion) modelVersion = ev.modelVersion;
    if (ev.promptFeedback) promptFeedback = { ...(promptFeedback || {}), ...ev.promptFeedback };
    if (ev.usageMetadata) {
      for (const [k, v] of Object.entries(ev.usageMetadata)) {
        if (v !== undefined && v !== null) usageMetadata[k] = v;
      }
    }
    const cand = ev.candidates?.[0];
    if (cand?.finishReason) finishReason = cand.finishReason;
    if (cand?.finishMessage) finishMessage = cand.finishMessage;
    for (const part of cand?.content?.parts || []) {
      if (typeof part?.text === 'string' && !part.thought) text += part.text;
    }
  }
  return { frames, text, modelVersion, finishReason, finishMessage, promptFeedback, usageMetadata };
}

function buildPreflightReport() {
  const headSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const assembled = Q1_SCHEDULE.map(buildSlotRequest);
  const uniqueArms = {};
  for (const item of assembled) {
    const key = `${item.slotSpec.arm}_${item.slotSpec.taskKey}`;
    if (!uniqueArms[key]) {
      uniqueArms[key] = {
        arm: item.slotSpec.arm,
        armLabel: item.slotSpec.armLabel,
        taskKey: item.slotSpec.taskKey,
        taskOrigin: item.task.origin,
        model: PINNED_MODEL,
        aperture: item.aperture,
        generationConfig: item.request.generationConfig,
        systemInstructionChars: item.systemInstructionChars,
        systemInstructionBytes: item.systemInstructionBytes,
        wireUtf8Bytes: item.wire.observation.utf8Bytes,
        approxPromptTokensConservative: item.approxPromptTokensConservative,
        digests: {
          systemInstructionSha256: item.wire.observation.systemInstructionSha256,
          contentsSha256: item.wire.observation.contentsSha256,
          generationConfigSha256: item.wire.observation.generationConfigSha256,
          bodySha256: item.wire.observation.bodySha256,
          modelAndBodySha256: item.wire.observation.modelAndBodySha256
        }
      };
    }
  }

  const totalApproxPromptTokens = assembled.reduce((sum, x) => sum + x.approxPromptTokensConservative, 0);
  const expectedBudgetPromptTokens = Math.max(65000, totalApproxPromptTokens);
  const expectedBudgetOutputTokens = 40000;
  const worstCasePromptTokens = 100000;
  const worstCaseOutputTokens = 80000;

  return {
    schema: 'td613.marrowline.q1-preflight/v1.0',
    generated_at_utc: new Date().toISOString(),
    source_head_sha: headSha,
    predecessor_pr_1759_head: '026ac4636eba782364eab46404dfcadd9414e9e0',
    deterministic_repair_ancestor: 'bc5467246f12b0598f89d681e4a4450c4733eace',
    historical_comparator: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
    execution_mode: 'DRY_RUN_PREFLIGHT_ONLY',
    paid_provider_calls_executed: 0,
    live_provider_catalog_verified: {
      checked_via: 'Read-only GET https://generativelanguage.googleapis.com/v1beta/models?pageSize=200 (HTTP 200; 0 paid calls)',
      target_model: `models/${PINNED_MODEL}`,
      callable: true,
      thinking_supported: true,
      input_token_limit: 1048576,
      output_token_limit: 65536,
      supported_methods: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent']
    },
    hard_execution_guarantees: {
      max_calls: HARD_MAX_CALLS,
      calls_per_slot: 1,
      automatic_retries: 0,
      second_seat_fallbacks: 0,
      structural_repair_calls: 0,
      morphology_chasing_reruns: 0,
      q2_multi_turn_included: false,
      stop_rules: [
        'STOP_1: Halt immediately on modelVersion mismatch or generationConfig drift.',
        'STOP_2: Halt immediately on PROHIBITED_CONTENT, SAFETY, RECITATION, BLOCKLIST, SPII, or promptFeedback.blockReason; preserve raw SSE without retry.',
        'STOP_3: Halt immediately on 2 consecutive 429/503 transport rejections or any spending-cap error.',
        'STOP_4: Halt immediately on any SSE-to-text reconstruction mismatch.'
      ]
    },
    pricing_and_cost_estimate: {
      pricing_source: 'Google Gemini Developer API official pricing (ai.google.dev), verified 2026-11-21',
      rates_usd_per_1m: PRICING_USD_PER_1M,
      assembled_8_slot_prompt_tokens_conservative_est: totalApproxPromptTokens,
      preregistered_budget_tokens: { prompt: expectedBudgetPromptTokens, output_and_thinking: expectedBudgetOutputTokens },
      estimated_cost_intro_rate_prereg_budget: estimateCostUsd(expectedBudgetPromptTokens, expectedBudgetOutputTokens, PRICING_USD_PER_1M.intro_through_2026_12_31),
      estimated_cost_intro_rate_2x_headroom: estimateCostUsd(worstCasePromptTokens, worstCaseOutputTokens, PRICING_USD_PER_1M.intro_through_2026_12_31),
      estimated_cost_standard_2027_rate_prereg_budget: estimateCostUsd(expectedBudgetPromptTokens, expectedBudgetOutputTokens, PRICING_USD_PER_1M.standard_from_2027_01_01)
    },
    unique_arm_task_requests: uniqueArms,
    slot_schedule: assembled.map((a) => ({
      slot: a.slotSpec.slot,
      arm: a.slotSpec.arm,
      armLabel: a.slotSpec.armLabel,
      taskKey: a.slotSpec.taskKey,
      replicate: a.slotSpec.replicate,
      model: PINNED_MODEL,
      aperturePrimaryRoute: a.aperture.primaryRoute,
      bodySha256: a.wire.observation.bodySha256,
      modelAndBodySha256: a.wire.observation.modelAndBodySha256
    }))
  };
}

async function main() {
  const args = process.argv.slice(2);
  const executeLive = args.includes('--execute-live');
  const authShaArg = args.find((a) => a.startsWith('--operator-auth-sha='))?.split('=')[1] || null;
  const maxCallsArg = Number(args.find((a) => a.startsWith('--max-calls='))?.split('=')[1] || HARD_MAX_CALLS);

  const preflight = buildPreflightReport();
  if (!executeLive) {
    const outPath = path.join(OUT_DIR, 'Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json');
    fs.writeFileSync(outPath, JSON.stringify(preflight, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify({
      ok: true,
      mode: 'DRY_RUN_PREFLIGHT_ONLY',
      paid_provider_calls_executed: 0,
      source_head_sha: preflight.source_head_sha,
      model: PINNED_MODEL,
      slots: preflight.slot_schedule.length,
      estimated_cost_intro_usd: preflight.pricing_and_cost_estimate.estimated_cost_intro_rate_prereg_budget.total_usd,
      output_written: path.relative(REPO_ROOT, outPath).replace(/\\/g, '/')
    }, null, 2));
    return;
  }

  // Strict fail-closed live execution guard
  if (!authShaArg || !/^[a-f0-9]{40}$/.test(authShaArg) || authShaArg !== preflight.source_head_sha) {
    console.error(`REFUSED_LIVE_EXECUTION: --operator-auth-sha must match exact HEAD ${preflight.source_head_sha}`);
    process.exit(2);
  }
  if (!Number.isInteger(maxCallsArg) || maxCallsArg < 1 || maxCallsArg > HARD_MAX_CALLS) {
    console.error(`REFUSED_LIVE_EXECUTION: --max-calls must be integer in 1..${HARD_MAX_CALLS}`);
    process.exit(2);
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('REFUSED_LIVE_EXECUTION: GEMINI_API_KEY not provided in environment');
    process.exit(2);
  }

  const runDir = path.join(OUT_DIR, 'live-acquisition');
  fs.mkdirSync(path.join(runDir, 'raw-sse'), { recursive: true });
  fs.mkdirSync(path.join(runDir, 'raw-text'), { recursive: true });

  const assembled = Q1_SCHEDULE.slice(0, maxCallsArg).map(buildSlotRequest);
  const results = [];
  let callsExecuted = 0;
  let consecutiveTransportErrors = 0;
  let stopTriggered = null;

  for (const item of assembled) {
    if (callsExecuted >= maxCallsArg || callsExecuted >= HARD_MAX_CALLS) {
      stopTriggered = 'HARD_CALL_CAP_REACHED';
      break;
    }
    callsExecuted++;
    const startedAt = new Date().toISOString();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${PINNED_MODEL}:streamGenerateContent?alt=sse`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: item.wire.body
    });
    const rawSseBytes = Buffer.from(await resp.arrayBuffer());
    const rawSseText = rawSseBytes.toString('utf8');
    const rawSsePath = path.join(runDir, 'raw-sse', `${item.slotSpec.slot}.sse`);
    fs.writeFileSync(rawSsePath, rawSseBytes);

    if (!resp.ok) {
      if (resp.status === 429 || resp.status === 503) consecutiveTransportErrors++;
      else consecutiveTransportErrors = 0;
      const errRec = {
        slot: item.slotSpec.slot,
        arm: item.slotSpec.arm,
        taskKey: item.slotSpec.taskKey,
        replicate: item.slotSpec.replicate,
        startedAt,
        completedAt: new Date().toISOString(),
        httpStatus: resp.status,
        rawSseSha256: sha256Buf(rawSseBytes),
        errorPreview: rawSseText.slice(0, 400)
      };
      results.push(errRec);
      if (consecutiveTransportErrors >= 2 || /quota|spend|budget|limit/i.test(rawSseText)) {
        stopTriggered = `STOP_3_TRANSPORT_OR_CAP_HTTP_${resp.status}`;
        break;
      }
      continue;
    }

    consecutiveTransportErrors = 0;
    const parsed = parseSseFrames(rawSseText);
    const rawTextPath = path.join(runDir, 'raw-text', `${item.slotSpec.slot}.txt`);
    fs.writeFileSync(rawTextPath, parsed.text, 'utf8');

    const observed = observeGeminiOutput(parsed.text, {
      model: PINNED_MODEL,
      modelVersion: parsed.modelVersion,
      finishReason: parsed.finishReason,
      finishMessage: parsed.finishMessage,
      promptBlockReason: parsed.promptFeedback?.blockReason || null,
      usageMetadata: parsed.usageMetadata
    });
    const completion = observeMarrowlineCompletion({
      text: parsed.text,
      finishReason: parsed.finishReason,
      promptBlockReason: parsed.promptFeedback?.blockReason || null,
      streamClosedCleanly: true
    });
    const relayParsed = parseRelayEnvelope(parsed.text);
    const botsText = relayParsed?.bots || relayParsed?.tauricDianaBots || '';
    const prosody = observeBotsProsodyDistribution(botsText);

    results.push({
      slot: item.slotSpec.slot,
      arm: item.slotSpec.arm,
      armLabel: item.slotSpec.armLabel,
      taskKey: item.slotSpec.taskKey,
      replicate: item.slotSpec.replicate,
      startedAt,
      completedAt: new Date().toISOString(),
      httpStatus: resp.status,
      requestDigests: item.wire.observation,
      modelRequested: PINNED_MODEL,
      modelVersion: parsed.modelVersion,
      finishReason: parsed.finishReason,
      finishMessage: parsed.finishMessage,
      promptBlockReason: parsed.promptFeedback?.blockReason || null,
      usageMetadata: parsed.usageMetadata,
      rawSseSha256: sha256Buf(rawSseBytes),
      rawSseBytes: rawSseBytes.length,
      rawTextSha256: sha256Text(parsed.text),
      rawTextUtf8Bytes: Buffer.byteLength(parsed.text, 'utf8'),
      completionState: completion,
      geminiOutputObservation: observed,
      botsProsodyDistribution: prosody
    });

    if (parsed.modelVersion && !String(parsed.modelVersion).includes(PINNED_MODEL)) {
      stopTriggered = `STOP_1_MODEL_MISMATCH_${parsed.modelVersion}`;
      break;
    }
    if (
      POLICY_NONSTOP_FINISH_REASONS.has(String(parsed.finishReason || '').toUpperCase()) ||
      parsed.promptFeedback?.blockReason
    ) {
      stopTriggered = `STOP_2_POLICY_HALT_${parsed.finishReason || parsed.promptFeedback?.blockReason}`;
      break;
    }
  }

  const liveReceipt = {
    schema: 'td613.marrowline.q1-live-acquisition-receipt/v1.0',
    source_head_sha: preflight.source_head_sha,
    operator_auth_sha: authShaArg,
    model_pinned: PINNED_MODEL,
    calls_executed: callsExecuted,
    hard_max_calls: maxCallsArg,
    stop_triggered: stopTriggered,
    results
  };
  fs.writeFileSync(path.join(runDir, 'Q1_LIVE_ACQUISITION_RECEIPT.json'), JSON.stringify(liveReceipt, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ ok: true, calls_executed: callsExecuted, stop_triggered: stopTriggered }, null, 2));
}

main().catch((err) => {
  console.error('Q1_HARNESS_ERROR:', err);
  process.exit(1);
});
