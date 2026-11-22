#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove — Q1 Live Creative Discriminator Harness (Hardened v2)
//
// FAIL-CLOSED ZERO-SPEND BY DEFAULT:
// - Without BOTH `--execute-live` AND `--operator-auth-sha=<exact-40-hex-head>`,
//   this script runs strictly in `--dry-run` mode with ZERO network calls and writes
//   Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json.
// - When explicitly authorized against its exact committed source HEAD SHA and invoked
//   with `--execute-live`, executes AT MOST 8 registered single-shot Q1 observations
//   (4 Arm A + 4 Arm C across T1 BLUE_ORANGE_WEATHER & T2 FORENSIC), directly to pinned
//   `models/gemini-3.8-flash:streamGenerateContent?alt=sse`, with:
//     * sampling contract: 8 registered Q1 slots, 1 first-return call per slot
//     * retryCount = 0, fallbackSeats = [], structuralRepair = false, morphologyChase = false
//     * NO arbitrary dollar spending ceiling and NO aggregate token-budget ceiling
//       (per Operator Review #6007792790; maxOutputTokens: 65536 is the matched profile)
//     * independent dual-parser SSE integrity verification (production readGeminiSse vs
//       independent strict WHATWG EventSource state-machine parser) with fail-closed STOP_4
//     * strict 7-class finish-state and specimen-eligibility classification
//     * strict modelVersion & generationConfig equivalence enforcement (STOP_1)
//     * crash-safe raw-SSE-first persistence and atomic per-slot partial receipt survival.

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
  extractGeminiText,
  observeGeminiOutput,
  observeMarrowlineAuthorship,
  readGeminiSse,
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

export const PINNED_MODEL = 'gemini-3.8-flash';
export const EXPECTED_THINKING_LEVEL = 'medium';
export const EXPECTED_MAX_OUTPUT_TOKENS = 65536;
export const EXPECTED_GENERATION_CONFIG_SHA256 = '4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34';
export const HARD_MAX_CALLS = 8;

// Exact preregistered effective request digests (verified against PR #1759 @ 026ac4636 and PR #1764 @ 67339318d)
export const EXPECTED_ARM_TASK_DIGESTS = Object.freeze({
  A_T1_BLUE_ORANGE_WEATHER: Object.freeze({
    aperturePrimaryRoute: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
    apertureDiscourseMode: 'CREATIVE',
    systemInstructionSha256: '90421826b7c0d5528d6de710fd1aa89a602138b173304c91ba08b0722424d4b8',
    contentsSha256: 'ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: 'a3601b7bf598502b70e593491720751d5946c1c162b71cea8a31eb9d3f9b0293',
    modelAndBodySha256: '68abd7fc57ef87d431fe0133cb036eb8ac7cc57d1531391b8453660ce80cdeab'
  }),
  C_T1_BLUE_ORANGE_WEATHER: Object.freeze({
    aperturePrimaryRoute: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
    apertureDiscourseMode: 'CREATIVE',
    systemInstructionSha256: '6de6ae0c7ce2485b48bd11576f8a398354c7bbaa0af63dc79f0522c52f5cc43b',
    contentsSha256: 'ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: 'cab2f10ed20ba154d9548ca96e70ebc0ad7e92204efe7cf00cfd9995a8cc64ae',
    modelAndBodySha256: '83232498a73cb2af1f592603b7194d9de21e0709a5ab089c154c5c8f395841b0'
  }),
  A_T2_FORENSIC: Object.freeze({
    aperturePrimaryRoute: 'REQUESTED_SYNTHESIS',
    apertureDiscourseMode: 'GENERAL',
    systemInstructionSha256: '4590ac8c73a65d628a325e28aa5d92a7d1e5a06127f8a6d96e2a3e0907752ac3',
    contentsSha256: '23be3dd96f5801163d9ae13e356475dbdb1bdc186491fb4a9c09f658edca7a8c',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: '8c56a603c5820075138d8fb3dc4ce7f14e3198d47562cb5dc89e9b2f0dcab6a1',
    modelAndBodySha256: '73fff3479de2740caa5e14ce630e5dbb519191d85f442d13d7ff930b7e563ca6'
  }),
  C_T2_FORENSIC: Object.freeze({
    aperturePrimaryRoute: 'REQUESTED_SYNTHESIS',
    apertureDiscourseMode: 'GENERAL',
    systemInstructionSha256: '745300c932a4658965eb9176fb53c0c5c31abb6e7e4a568fb53c329e5a482fff',
    contentsSha256: '23be3dd96f5801163d9ae13e356475dbdb1bdc186491fb4a9c09f658edca7a8c',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: 'dcab78f7758d663259804f211c3c693bd2dd09f0562f7c8372ad85f67c38e091',
    modelAndBodySha256: '7224bbe8b5039585e1623c98ed3bab80dfda477d19877236a23380cc02e8d3fc'
  })
});

// Descriptive reference pricing only (verified 2026-11-21 from ai.google.dev).
// Per Operator Review #6007792790: NO runtime dollar ceiling and NO aggregate token-budget ceiling.
export const DESCRIPTIVE_PRICING_USD_PER_1M = Object.freeze({
  model: PINNED_MODEL,
  enforcement: 'DESCRIPTIVE_REFERENCE_ONLY_NO_RUNTIME_SPENDING_CAP',
  operator_authority_reference: 'GitHub Review #6007792790 (superseding financial cap portion of #6007790469)',
  intro_through_2026_12_31: Object.freeze({ input: 0.75, cached_input: 0.075, output_including_thinking: 3.75 }),
  standard_from_2027_01_01: Object.freeze({ input: 1.50, cached_input: 0.15, output_including_thinking: 7.50 })
});

export const Q1_TASKS = Object.freeze({
  T1_BLUE_ORANGE_WEATHER: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER,
  T2_FORENSIC: DISCRIMINATOR_TASKS.FORENSIC
});

// Counterbalanced interleaved 8-slot experimental design (4 Arm A + 4 Arm C = 8 registered slots)
export const Q1_SCHEDULE = Object.freeze([
  Object.freeze({ slot: 'S01', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 1 }),
  Object.freeze({ slot: 'S02', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 1 }),
  Object.freeze({ slot: 'S03', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T2_FORENSIC', replicate: 1 }),
  Object.freeze({ slot: 'S04', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T2_FORENSIC', replicate: 1 }),
  Object.freeze({ slot: 'S05', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 2 }),
  Object.freeze({ slot: 'S06', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T1_BLUE_ORANGE_WEATHER', replicate: 2 }),
  Object.freeze({ slot: 'S07', arm: 'C', armLabel: 'OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', taskKey: 'T2_FORENSIC', replicate: 2 }),
  Object.freeze({ slot: 'S08', arm: 'A', armLabel: 'CURRENT_RESTORED_DEFAULT_PR1549', taskKey: 'T2_FORENSIC', replicate: 2 })
]);

export const OUTCOME_CLASSES = Object.freeze({
  COMPLETED_STOP: 'COMPLETED_STOP',
  POLICY_TERMINATED: 'POLICY_TERMINATED',
  INCOMPLETE_NONSTOP: 'INCOMPLETE_NONSTOP',
  UNWITNESSED_COMPLETION: 'UNWITNESSED_COMPLETION',
  TRANSPORT_FAILURE: 'TRANSPORT_FAILURE',
  MALFORMED_OR_UNRECONSTRUCTABLE_SSE: 'MALFORMED_OR_UNRECONSTRUCTABLE_SSE',
  MODEL_IDENTITY_MISMATCH: 'MODEL_IDENTITY_MISMATCH'
});

const sha256Buf = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sha256Text = (txt) => sha256Buf(Buffer.from(String(txt || ''), 'utf8'));

function writeJsonAtomic(filePath, value) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, filePath);
}

export function buildSlotRequest(slotSpec) {
  const task = Q1_TASKS[slotSpec.taskKey];
  if (!task) throw new Error(`UNREGISTERED_Q1_TASK: ${slotSpec.taskKey}`);
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

export function isExpectedPinnedModelVersion(modelVersion, pinnedModel = PINNED_MODEL) {
  if (typeof modelVersion !== 'string' || !modelVersion.trim()) {
    return Object.freeze({ ok: false, reason: 'MISSING_MODEL_VERSION', normalized: null });
  }
  const normalized = modelVersion.trim().replace(/^models\//, '');
  const expected = String(pinnedModel || PINNED_MODEL).trim().replace(/^models\//, '');
  const exactOrVersioned = normalized === expected || normalized.startsWith(`${expected}-`);
  return Object.freeze({
    ok: exactOrVersioned,
    reason: exactOrVersioned ? 'MATCHED_PINNED_MODEL' : 'UNEXPECTED_MODEL_VERSION',
    normalized
  });
}

export function assertQ1RequestEquivalence(assembledSlots, { checkExpectedDigests = true } = {}) {
  const violations = [];
  const byTask = new Map();

  for (const item of assembledSlots) {
    const slot = item?.slotSpec?.slot || 'UNKNOWN_SLOT';
    const gc = item?.request?.generationConfig;
    const obs = item?.wire?.observation;

    if (obs?.model !== PINNED_MODEL) {
      violations.push(`${slot}: model=${obs?.model} !== ${PINNED_MODEL}`);
    }
    if (gc?.maxOutputTokens !== EXPECTED_MAX_OUTPUT_TOKENS) {
      violations.push(`${slot}: maxOutputTokens=${gc?.maxOutputTokens} !== ${EXPECTED_MAX_OUTPUT_TOKENS}`);
    }
    if (gc?.thinkingConfig?.thinkingLevel !== EXPECTED_THINKING_LEVEL) {
      violations.push(`${slot}: thinkingLevel=${gc?.thinkingConfig?.thinkingLevel} !== ${EXPECTED_THINKING_LEVEL}`);
    }
    if (gc?.thinkingConfig?.thinkingBudget !== undefined) {
      violations.push(`${slot}: deprecated thinkingBudget present (${gc.thinkingConfig.thinkingBudget})`);
    }
    if (obs?.generationConfigSha256 !== EXPECTED_GENERATION_CONFIG_SHA256) {
      violations.push(`${slot}: generationConfigSha256=${obs?.generationConfigSha256} !== ${EXPECTED_GENERATION_CONFIG_SHA256}`);
    }

    const key = `${item.slotSpec.arm}_${item.slotSpec.taskKey}`;
    if (checkExpectedDigests && EXPECTED_ARM_TASK_DIGESTS[key]) {
      const exp = EXPECTED_ARM_TASK_DIGESTS[key];
      if (item.aperture.primaryRoute !== exp.aperturePrimaryRoute) {
        violations.push(`${slot}: aperturePrimaryRoute=${item.aperture.primaryRoute} !== ${exp.aperturePrimaryRoute}`);
      }
      if (item.aperture.discourseMode !== exp.apertureDiscourseMode) {
        violations.push(`${slot}: apertureDiscourseMode=${item.aperture.discourseMode} !== ${exp.apertureDiscourseMode}`);
      }
      if (obs.contentsSha256 !== exp.contentsSha256) {
        violations.push(`${slot}: contentsSha256 drift (${obs.contentsSha256} !== ${exp.contentsSha256})`);
      }
      if (obs.systemInstructionSha256 !== exp.systemInstructionSha256) {
        violations.push(`${slot}: systemInstructionSha256 drift (${obs.systemInstructionSha256} !== ${exp.systemInstructionSha256})`);
      }
      if (obs.bodySha256 !== exp.bodySha256) {
        violations.push(`${slot}: bodySha256 drift (${obs.bodySha256} !== ${exp.bodySha256})`);
      }
      if (exp.modelAndBodySha256 && obs.modelAndBodySha256 !== exp.modelAndBodySha256) {
        violations.push(`${slot}: modelAndBodySha256 drift (${obs.modelAndBodySha256} !== ${exp.modelAndBodySha256})`);
      }
    }

    if (!byTask.has(item.slotSpec.taskKey)) byTask.set(item.slotSpec.taskKey, new Map());
    byTask.get(item.slotSpec.taskKey).set(item.slotSpec.arm, item);
  }

  for (const [taskKey, armMap] of byTask.entries()) {
    const armA = armMap.get('A');
    const armC = armMap.get('C');
    if (armA && armC) {
      if (armA.wire.observation.contentsSha256 !== armC.wire.observation.contentsSha256) {
        violations.push(`${taskKey}: Arm A and Arm C contentsSha256 differ`);
      }
      if (armA.wire.observation.generationConfigSha256 !== armC.wire.observation.generationConfigSha256) {
        violations.push(`${taskKey}: Arm A and Arm C generationConfigSha256 differ`);
      }
      if (armA.aperture.primaryRoute !== armC.aperture.primaryRoute || armA.aperture.discourseMode !== armC.aperture.discourseMode) {
        violations.push(`${taskKey}: Arm A and Arm C Aperture routing differ`);
      }
      if (armA.wire.observation.systemInstructionSha256 === armC.wire.observation.systemInstructionSha256) {
        violations.push(`${taskKey}: Arm A and Arm C systemInstructionSha256 are unexpectedly identical`);
      }
    }
  }

  return Object.freeze({
    ok: violations.length === 0,
    checkedSlots: assembledSlots.length,
    violations: Object.freeze(violations)
  });
}

// Independent strict WHATWG EventSource line-by-line state-machine parser.
// Intentionally shares ZERO code with server/khonapolit-quality.js::readGeminiSse.
export function parseSseIndependently(rawSseBytes) {
  const bytes = Buffer.isBuffer(rawSseBytes) ? rawSseBytes : Buffer.from(rawSseBytes || '');
  let decodedText;
  try {
    decodedText = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (err) {
    return Object.freeze({
      utf8Valid: false,
      bomPresent: false,
      frameCount: 0,
      commentLineCount: 0,
      sawDoneSentinel: false,
      trailingEventWithoutBlankLine: false,
      visibleText: '',
      thoughtText: '',
      modelVersion: null,
      modelVersionsSeen: Object.freeze([]),
      finishReason: null,
      finishReasonsSeen: Object.freeze([]),
      finishMessage: null,
      promptFeedback: null,
      usageMetadata: Object.freeze({}),
      multiCandidateFrameCount: 0,
      parseErrors: Object.freeze([`INVALID_UTF8_SEQUENCE: ${err.message}`]),
      framingErrors: Object.freeze([]),
      streamProtocolErrors: Object.freeze([])
    });
  }

  let bomPresent = false;
  if (decodedText.startsWith('\uFEFF')) {
    bomPresent = true;
    decodedText = decodedText.slice(1);
  }

  // Split lines strictly per WHATWG EventSource spec: CRLF, LF, or CR
  const lines = [];
  let cursor = 0;
  for (let i = 0; i < decodedText.length; i++) {
    const ch = decodedText.charCodeAt(i);
    if (ch === 13) {
      lines.push(decodedText.slice(cursor, i));
      if (i + 1 < decodedText.length && decodedText.charCodeAt(i + 1) === 10) i++;
      cursor = i + 1;
    } else if (ch === 10) {
      lines.push(decodedText.slice(cursor, i));
      cursor = i + 1;
    }
  }
  if (cursor <= decodedText.length) {
    lines.push(decodedText.slice(cursor));
  }

  const frames = [];
  const parseErrors = [];
  const framingErrors = [];
  const streamProtocolErrors = [];
  const modelVersionsSeen = [];
  const finishReasonsSeen = [];
  let commentLineCount = 0;
  let sawDoneSentinel = false;
  let trailingEventWithoutBlankLine = false;
  let multiCandidateFrameCount = 0;
  let visibleText = '';
  let thoughtText = '';
  let modelVersion = null;
  let finishReason = null;
  let finishMessage = null;
  let promptFeedback = null;
  const usageMetadata = {};

  let dataLines = [];
  const dispatchEvent = (atEof = false) => {
    if (dataLines.length === 0) return;
    if (atEof) trailingEventWithoutBlankLine = true;
    const rawPayload = dataLines.join('\n');
    dataLines = [];
    if (!rawPayload.trim()) return;
    if (rawPayload.trim() === '[DONE]') {
      sawDoneSentinel = true;
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(rawPayload);
    } catch (err) {
      parseErrors.push(`JSON_PARSE_ERROR_AT_FRAME_${frames.length + 1}: ${err.message}`);
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      parseErrors.push(`NON_OBJECT_JSON_AT_FRAME_${frames.length + 1}`);
      return;
    }
    if (parsed.error && typeof parsed.error === 'object') {
      const code = parsed.error.code ?? 'UNKNOWN';
      const status = parsed.error.status ?? 'UNKNOWN';
      streamProtocolErrors.push(`STREAM_ERROR_OBJECT_AT_FRAME_${frames.length + 1}: code=${code} status=${status}`);
    }
    frames.push(parsed);

    if (typeof parsed.modelVersion === 'string' && parsed.modelVersion.trim()) {
      modelVersion = parsed.modelVersion.trim();
      if (!modelVersionsSeen.includes(modelVersion)) modelVersionsSeen.push(modelVersion);
    }
    if (parsed.promptFeedback && typeof parsed.promptFeedback === 'object') {
      promptFeedback = { ...(promptFeedback || {}), ...parsed.promptFeedback };
    }
    if (parsed.usageMetadata && typeof parsed.usageMetadata === 'object') {
      for (const [k, v] of Object.entries(parsed.usageMetadata)) {
        if (v !== undefined && v !== null) usageMetadata[k] = v;
      }
    }
    if (Array.isArray(parsed.candidates)) {
      if (parsed.candidates.length > 1) multiCandidateFrameCount++;
      const cand = parsed.candidates[0];
      if (cand && typeof cand === 'object') {
        if (typeof cand.finishReason === 'string' && cand.finishReason) {
          finishReason = cand.finishReason;
          if (!finishReasonsSeen.includes(finishReason)) finishReasonsSeen.push(finishReason);
        }
        if (typeof cand.finishMessage === 'string' && cand.finishMessage.trim()) {
          finishMessage = cand.finishMessage.trim().slice(0, 400);
        }
        for (const part of cand.content?.parts || []) {
          if (typeof part?.text === 'string') {
            if (part.thought === true) thoughtText += part.text;
            else visibleText += part.text;
          }
        }
      }
    }
  };

  const VALID_SSE_FIELDS = new Set(['data', 'event', 'id', 'retry']);
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line === '') {
      dispatchEvent(false);
      continue;
    }
    if (line.startsWith(':')) {
      commentLineCount++;
      continue;
    }
    const colon = line.indexOf(':');
    if (colon === -1) {
      framingErrors.push(`UNRECOGNIZED_SSE_LINE_${idx + 1}_NO_COLON`);
      continue;
    }
    const field = line.slice(0, colon);
    if (!VALID_SSE_FIELDS.has(field)) {
      framingErrors.push(`UNRECOGNIZED_SSE_FIELD_${idx + 1}:${field.slice(0, 32)}`);
      continue;
    }
    let value = line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'data') {
      dataLines.push(value);
    }
  }
  dispatchEvent(true);

  return Object.freeze({
    utf8Valid: true,
    bomPresent,
    frameCount: frames.length,
    commentLineCount,
    sawDoneSentinel,
    trailingEventWithoutBlankLine,
    visibleText,
    thoughtText,
    modelVersion,
    modelVersionsSeen: Object.freeze(modelVersionsSeen),
    finishReason,
    finishReasonsSeen: Object.freeze(finishReasonsSeen),
    finishMessage,
    promptFeedback: promptFeedback ? Object.freeze(promptFeedback) : null,
    usageMetadata: Object.freeze(usageMetadata),
    multiCandidateFrameCount,
    parseErrors: Object.freeze(parseErrors),
    framingErrors: Object.freeze(framingErrors),
    streamProtocolErrors: Object.freeze(streamProtocolErrors)
  });
}

// Dual-parser independent SSE integrity witness:
// Parser A: Production TD613 `readGeminiSse` + `extractGeminiText`
// Parser B: Independent strict WHATWG state-machine parser `parseSseIndependently`
export async function verifySseIntegrity(rawSseBytes, options = {}) {
  const bytes = Buffer.isBuffer(rawSseBytes) ? rawSseBytes : Buffer.from(rawSseBytes || '');
  const rawSseSha256 = sha256Buf(bytes);

  const runIndependent = options.independentParser || parseSseIndependently;
  const independent = await runIndependent(bytes);

  let canonicalMerged = null;
  let canonicalText = '';
  let canonicalEventCount = 0;
  let canonicalParseErrors = 0;
  let canonicalNativeEvidence = null;
  let canonicalException = null;

  try {
    if (options.canonicalParser) {
      const custom = await options.canonicalParser(bytes);
      canonicalMerged = custom.mergedPayload;
      canonicalText = String(custom.text ?? '');
      canonicalEventCount = Number(custom.eventCount ?? 0);
      canonicalParseErrors = Number(custom.parseErrors ?? 0);
      canonicalNativeEvidence = custom.nativeSseEvidence ?? null;
    } else {
      const progress = {
        startedAt: Date.now(),
        chunkCount: 0,
        authoredTextChunkCount: 0,
        firstChunkMs: null,
        byteCount: 0,
        parseErrors: 0,
        streamGraceMs: 0
      };
      const replayResponse = new Response(bytes, {
        status: 200,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' }
      });
      canonicalMerged = await readGeminiSse(replayResponse, progress, null, true);
      canonicalText = extractGeminiText(canonicalMerged || {});
      canonicalEventCount = progress.chunkCount;
      canonicalParseErrors = progress.parseErrors;
      canonicalNativeEvidence = progress.nativeSseEvidence || null;
    }
  } catch (err) {
    canonicalException = err?.message || String(err);
  }

  const canonicalTextBuf = Buffer.from(canonicalText, 'utf8');
  const independentTextBuf = Buffer.from(independent.visibleText || '', 'utf8');
  const canonicalTextSha256 = sha256Buf(canonicalTextBuf);
  const independentTextSha256 = sha256Buf(independentTextBuf);

  const canonicalFinishReason = canonicalMerged?.candidates?.[0]?.finishReason || null;
  const canonicalModelVersion = canonicalMerged?.modelVersion || null;
  const canonicalPromptBlockReason = canonicalMerged?.promptFeedback?.blockReason || null;
  const independentPromptBlockReason = independent.promptFeedback?.blockReason || null;

  const textEquivalent = canonicalText === independent.visibleText
    && canonicalTextSha256 === independentTextSha256
    && canonicalTextBuf.equals(independentTextBuf);
  const eventCountMatch = canonicalEventCount === independent.frameCount;
  const finishReasonEquivalent = canonicalFinishReason === (independent.finishReason || null);
  const modelVersionEquivalent = canonicalModelVersion === (independent.modelVersion || null);
  const promptBlockEquivalent = canonicalPromptBlockReason === independentPromptBlockReason;
  const canonicalSelfTextEquivalent = canonicalNativeEvidence ? canonicalNativeEvidence.textEquivalent === true : true;

  const malformedReasons = [];
  const mismatchReasons = [];

  if (!independent.utf8Valid) malformedReasons.push('INVALID_UTF8_BYTES');
  if (canonicalException) malformedReasons.push(`CANONICAL_PARSER_EXCEPTION: ${canonicalException}`);
  if (canonicalParseErrors > 0) malformedReasons.push(`CANONICAL_PARSE_ERRORS:${canonicalParseErrors}`);
  if (independent.parseErrors.length > 0) malformedReasons.push(...independent.parseErrors);
  if (independent.framingErrors.length > 0) malformedReasons.push(...independent.framingErrors);
  if (independent.streamProtocolErrors.length > 0) malformedReasons.push(...independent.streamProtocolErrors);
  if (independent.frameCount === 0 && canonicalEventCount === 0) malformedReasons.push('ZERO_SSE_JSON_FRAMES');

  if (!textEquivalent) mismatchReasons.push('CANONICAL_VS_INDEPENDENT_TEXT_MISMATCH');
  if (!canonicalSelfTextEquivalent) mismatchReasons.push('CANONICAL_NATIVE_SELF_EQUIVALENCE_MISMATCH');
  if (!eventCountMatch) mismatchReasons.push(`EVENT_COUNT_MISMATCH:canonical=${canonicalEventCount},independent=${independent.frameCount}`);
  if (!finishReasonEquivalent) mismatchReasons.push(`FINISH_REASON_MISMATCH:canonical=${canonicalFinishReason},independent=${independent.finishReason}`);
  if (!modelVersionEquivalent) mismatchReasons.push(`MODEL_VERSION_MISMATCH:canonical=${canonicalModelVersion},independent=${independent.modelVersion}`);
  if (!promptBlockEquivalent) mismatchReasons.push(`PROMPT_BLOCK_MISMATCH:canonical=${canonicalPromptBlockReason},independent=${independentPromptBlockReason}`);

  let failureCode = null;
  if (mismatchReasons.length > 0 && malformedReasons.length === 0) {
    failureCode = 'STOP_4_SSE_RECONSTRUCTION_MISMATCH';
  } else if (malformedReasons.length > 0) {
    failureCode = 'STOP_4_MALFORMED_SSE';
  }

  return Object.freeze({
    ok: failureCode === null,
    failureCode,
    rawSseSha256,
    rawSseBytes: bytes.length,
    utf8Valid: independent.utf8Valid,
    textEquivalent,
    canonicalSelfTextEquivalent,
    eventCountMatch,
    finishReasonEquivalent,
    modelVersionEquivalent,
    promptBlockEquivalent,
    canonicalEventCount,
    independentEventCount: independent.frameCount,
    canonicalParseErrors,
    independentParseErrors: independent.parseErrors.length,
    independentFramingErrors: independent.framingErrors.length,
    independentStreamProtocolErrors: independent.streamProtocolErrors.length,
    canonicalTextSha256,
    independentTextSha256,
    malformedReasons: Object.freeze(malformedReasons),
    mismatchReasons: Object.freeze(mismatchReasons),
    canonicalMergedPayload: canonicalMerged,
    canonicalText,
    independentSummary: Object.freeze({
      bomPresent: independent.bomPresent,
      commentLineCount: independent.commentLineCount,
      sawDoneSentinel: independent.sawDoneSentinel,
      trailingEventWithoutBlankLine: independent.trailingEventWithoutBlankLine,
      multiCandidateFrameCount: independent.multiCandidateFrameCount,
      thoughtChars: independent.thoughtText.length,
      modelVersionsSeen: independent.modelVersionsSeen,
      finishReasonsSeen: independent.finishReasonsSeen
    })
  });
}

export function classifySlotOutcome({
  httpStatus,
  transportError = null,
  streamInterrupted = false,
  sseIntegrity = null,
  observedOutput = null,
  completionState = null,
  pinnedModel = PINNED_MODEL
}) {
  if (transportError || streamInterrupted || (typeof httpStatus === 'number' && (httpStatus < 200 || httpStatus >= 300))) {
    return Object.freeze({
      outcomeClass: OUTCOME_CLASSES.TRANSPORT_FAILURE,
      eligibleArtisticSpecimen: false,
      stopCode: null,
      reason: transportError || (streamInterrupted ? 'STREAM_INTERRUPTED' : `HTTP_${httpStatus}`)
    });
  }

  if (!sseIntegrity || !sseIntegrity.ok) {
    return Object.freeze({
      outcomeClass: OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE,
      eligibleArtisticSpecimen: false,
      stopCode: sseIntegrity?.failureCode || 'STOP_4_MALFORMED_SSE',
      reason: [...(sseIntegrity?.malformedReasons || []), ...(sseIntegrity?.mismatchReasons || [])].join('; ') || 'UNRECONSTRUCTABLE_SSE'
    });
  }

  const finishReason = observedOutput?.finishReason || null;
  const promptBlockReason = observedOutput?.promptBlockReason || null;
  const isPolicyTerminated = Boolean(
    promptBlockReason || (finishReason && POLICY_NONSTOP_FINISH_REASONS.has(String(finishReason).toUpperCase()))
  );

  // Check model identity BEFORE promoting any 200 SSE response.
  // Note: If promptFeedback blocked the prompt before generation, Gemini may omit modelVersion on pure prompt-block frames;
  // in that case POLICY_TERMINATED takes precedence unless an unexpected wrong modelVersion was explicitly returned.
  const modelCheck = isExpectedPinnedModelVersion(observedOutput?.modelVersion, pinnedModel);
  if (isPolicyTerminated && (!observedOutput?.modelVersion || modelCheck.ok)) {
    return Object.freeze({
      outcomeClass: OUTCOME_CLASSES.POLICY_TERMINATED,
      eligibleArtisticSpecimen: false,
      stopCode: `STOP_2_POLICY_HALT_${finishReason || promptBlockReason}`,
      reason: promptBlockReason ? `promptBlockReason=${promptBlockReason}` : `finishReason=${finishReason}`
    });
  }

  if (!modelCheck.ok) {
    return Object.freeze({
      outcomeClass: OUTCOME_CLASSES.MODEL_IDENTITY_MISMATCH,
      eligibleArtisticSpecimen: false,
      stopCode: `STOP_1_MODEL_IDENTITY_HOLD_${modelCheck.reason}_${modelCheck.normalized || 'NONE'}`,
      reason: `${modelCheck.reason}: received=${observedOutput?.modelVersion ?? 'null'} expected=${pinnedModel}`
    });
  }

  if (finishReason && finishReason !== 'STOP') {
    return Object.freeze({
      outcomeClass: OUTCOME_CLASSES.INCOMPLETE_NONSTOP,
      eligibleArtisticSpecimen: false,
      stopCode: null,
      reason: `non-STOP finishReason=${finishReason}`
    });
  }

  if (!finishReason || !completionState?.complete) {
    return Object.freeze({
      outcomeClass: OUTCOME_CLASSES.UNWITNESSED_COMPLETION,
      eligibleArtisticSpecimen: false,
      stopCode: null,
      reason: completionState?.reason || 'MISSING_FINISH_REASON'
    });
  }

  return Object.freeze({
    outcomeClass: OUTCOME_CLASSES.COMPLETED_STOP,
    eligibleArtisticSpecimen: true,
    stopCode: null,
    reason: 'provider-stop-observed-and-verified'
  });
}

async function readResponseBytesResiliently(response) {
  const reader = response?.body?.getReader?.();
  if (!reader) {
    const ab = await response.arrayBuffer();
    return { bytes: Buffer.from(ab), streamInterrupted: false, streamError: null };
  }
  const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value && value.byteLength) chunks.push(Buffer.from(value));
    }
    return { bytes: Buffer.concat(chunks), streamInterrupted: false, streamError: null };
  } catch (err) {
    return {
      bytes: Buffer.concat(chunks),
      streamInterrupted: true,
      streamError: err?.message || String(err)
    };
  }
}

function estimateCostUsdDescriptive(promptTokens, outputAndThoughtTokens, rates) {
  const inputCost = (promptTokens / 1_000_000) * rates.input;
  const outputCost = (outputAndThoughtTokens / 1_000_000) * rates.output_including_thinking;
  return {
    input_usd: Number(inputCost.toFixed(5)),
    output_and_thinking_usd: Number(outputCost.toFixed(5)),
    total_usd: Number((inputCost + outputCost).toFixed(5))
  };
}

export function buildPreflightReport({ headSha = null } = {}) {
  const resolvedHeadSha = headSha || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const assembled = Q1_SCHEDULE.map(buildSlotRequest);
  const equivalence = assertQ1RequestEquivalence(assembled);
  if (!equivalence.ok) {
    throw new Error(`Q1_PREFLIGHT_REQUEST_EQUIVALENCE_FAILED: ${equivalence.violations.join(' | ')}`);
  }

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
  const expectedPromptTokens = Math.max(65000, totalApproxPromptTokens);
  const expectedOutputTokens = 40000;
  const highHeadroomPromptTokens = 100000;
  const highHeadroomOutputTokens = 80000;
  const fullCeilingOutputTokens = HARD_MAX_CALLS * EXPECTED_MAX_OUTPUT_TOKENS;

  return {
    schema: 'td613.marrowline.q1-preflight/v2.0',
    generated_at_utc: new Date().toISOString(),
    source_head_sha: resolvedHeadSha,
    predecessor_pr_1764_preflight_head: '67339318d5a430541a572c19833817271d69c5f3',
    predecessor_pr_1759_head: '026ac4636eba782364eab46404dfcadd9414e9e0',
    deterministic_repair_ancestor: 'bc5467246f12b0598f89d681e4a4450c4733eace',
    historical_comparator: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
    execution_mode: 'DRY_RUN_PREFLIGHT_ONLY',
    paid_provider_calls_executed: 0,
    request_equivalence_verified: equivalence,
    live_provider_catalog_verified: {
      checked_via: 'Read-only GET https://generativelanguage.googleapis.com/v1beta/models?pageSize=200 (HTTP 200; 0 paid calls)',
      target_model: `models/${PINNED_MODEL}`,
      callable: true,
      thinking_supported: true,
      input_token_limit: 1048576,
      output_token_limit: EXPECTED_MAX_OUTPUT_TOKENS,
      supported_methods: ['generateContent', 'countTokens', 'createCachedContent', 'batchGenerateContent']
    },
    financial_and_token_policy: {
      dollar_spending_ceiling: 'NONE_PER_OPERATOR_REVIEW_6007792790',
      aggregate_token_budget_ceiling: 'NONE_PER_OPERATOR_REVIEW_6007792790',
      per_call_max_output_tokens: EXPECTED_MAX_OUTPUT_TOKENS,
      per_call_max_output_tokens_role: 'MATCHED_PROVIDER_GENERATION_PROFILE_NOT_ECONOMY_CAP',
      operator_correction_reference: 'GitHub Review #6007792790 (supersedes dollar-cap portion of Review #6007790469)'
    },
    experimental_design_guards: {
      registered_q1_slots: HARD_MAX_CALLS,
      rationale: 'SCIENTIFIC_SAMPLING_AND_FIRST_RETURN_INTEGRITY_CONTRACT_NOT_COST_CAP',
      calls_per_slot: 1,
      automatic_retries: 0,
      second_seat_fallbacks: 0,
      structural_repair_calls: 0,
      morphology_chasing_reruns: 0,
      q2_multi_turn_included: false,
      independent_sse_verification: 'DUAL_PARSER_PRODUCTION_READGEMINISSE_VS_STRICT_WHATWG_STATE_MACHINE',
      outcome_classes: Object.values(OUTCOME_CLASSES),
      stop_rules: [
        'STOP_1: Halt immediately on missing/unexpected modelVersion or generationConfig/request-digest drift.',
        'STOP_2: Halt immediately on PROHIBITED_CONTENT, SAFETY, RECITATION, BLOCKLIST, SPII, or promptFeedback.blockReason; preserve raw SSE without retry.',
        'STOP_3: Halt immediately on 2 consecutive 429/503 transport rejections or unrecoverable provider rejection (401/402/403/404); no arbitrary dollar-cap halt.',
        'STOP_4: Halt immediately on malformed SSE, invalid UTF-8, parser exception, or canonical-vs-independent SSE reconstruction mismatch; preserve raw SSE bytes and terminal failure receipt.'
      ]
    },
    descriptive_pricing_reference_only: {
      note: 'Descriptive estimates only; NOT enforced as a runtime spending or token cap per Operator Review #6007792790.',
      pricing_source: 'Google Gemini Developer API official pricing (ai.google.dev), verified 2026-11-21',
      rates_usd_per_1m: DESCRIPTIVE_PRICING_USD_PER_1M,
      assembled_8_slot_prompt_tokens_conservative_est: totalApproxPromptTokens,
      descriptive_typical_estimate_intro_rate: estimateCostUsdDescriptive(expectedPromptTokens, expectedOutputTokens, DESCRIPTIVE_PRICING_USD_PER_1M.intro_through_2026_12_31),
      descriptive_2x_headroom_intro_rate: estimateCostUsdDescriptive(highHeadroomPromptTokens, highHeadroomOutputTokens, DESCRIPTIVE_PRICING_USD_PER_1M.intro_through_2026_12_31),
      descriptive_full_8x65536_theoretical_output_max_intro_rate: estimateCostUsdDescriptive(expectedPromptTokens, fullCeilingOutputTokens, DESCRIPTIVE_PRICING_USD_PER_1M.intro_through_2026_12_31),
      descriptive_standard_2027_rate_reference: estimateCostUsdDescriptive(expectedPromptTokens, expectedOutputTokens, DESCRIPTIVE_PRICING_USD_PER_1M.standard_from_2027_01_01)
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

function summarizeResults(results) {
  const byOutcomeClass = {};
  for (const cls of Object.values(OUTCOME_CLASSES)) byOutcomeClass[cls] = 0;
  let eligibleCompletedSpecimens = 0;
  let totalPromptTokens = 0;
  let totalCandidatesTokens = 0;
  let totalThoughtsTokens = 0;
  for (const r of results) {
    if (r.outcomeClass && byOutcomeClass[r.outcomeClass] !== undefined) byOutcomeClass[r.outcomeClass]++;
    if (r.eligibleArtisticSpecimen === true) eligibleCompletedSpecimens++;
    const u = r.usageMetadata || {};
    if (Number.isFinite(u.promptTokenCount)) totalPromptTokens += u.promptTokenCount;
    if (Number.isFinite(u.candidatesTokenCount)) totalCandidatesTokens += u.candidatesTokenCount;
    if (Number.isFinite(u.thoughtsTokenCount)) totalThoughtsTokens += u.thoughtsTokenCount;
  }
  return {
    slots_recorded: results.length,
    eligible_completed_specimens: eligibleCompletedSpecimens,
    ineligible_or_failed_observations: results.length - eligibleCompletedSpecimens,
    by_outcome_class: byOutcomeClass,
    measured_tokens_descriptive_only: {
      promptTokenCount: totalPromptTokens,
      candidatesTokenCount: totalCandidatesTokens,
      thoughtsTokenCount: totalThoughtsTokens
    }
  };
}

export async function executeQ1Run({
  sourceHeadSha,
  operatorAuthSha,
  apiKey,
  maxCalls = HARD_MAX_CALLS,
  runDir = path.join(OUT_DIR, 'live-acquisition'),
  fetchImpl = globalThis.fetch,
  schedule = Q1_SCHEDULE,
  slotBuilder = buildSlotRequest,
  checkExpectedDigests = true,
  sseVerifyOptions = {},
  postSlotHook = null
}) {
  if (!operatorAuthSha || !/^[a-f0-9]{40}$/.test(operatorAuthSha) || operatorAuthSha !== sourceHeadSha) {
    const err = new Error(`REFUSED_LIVE_EXECUTION: --operator-auth-sha must match exact HEAD ${sourceHeadSha}`);
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }
  if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > HARD_MAX_CALLS) {
    const err = new Error(`REFUSED_LIVE_EXECUTION: --max-calls must be integer in 1..${HARD_MAX_CALLS}`);
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }
  if (!apiKey) {
    const err = new Error('REFUSED_LIVE_EXECUTION: GEMINI_API_KEY not provided in environment');
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }

  fs.mkdirSync(path.join(runDir, 'raw-sse'), { recursive: true });
  fs.mkdirSync(path.join(runDir, 'raw-text'), { recursive: true });
  const receiptPath = path.join(runDir, 'Q1_LIVE_ACQUISITION_RECEIPT.json');

  const results = [];
  let callsExecuted = 0;
  let consecutiveTransportErrors = 0;
  let stopTriggered = null;
  let terminalError = null;
  let status = 'IN_PROGRESS';

  const buildReceiptSnapshot = () => ({
    schema: 'td613.marrowline.q1-live-acquisition-receipt/v2.0',
    updated_at_utc: new Date().toISOString(),
    status,
    source_head_sha: sourceHeadSha,
    operator_auth_sha: operatorAuthSha,
    model_pinned: PINNED_MODEL,
    matched_generation_profile: {
      thinkingLevel: EXPECTED_THINKING_LEVEL,
      maxOutputTokens: EXPECTED_MAX_OUTPUT_TOKENS,
      generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256
    },
    financial_policy: 'NO_DOLLAR_OR_AGGREGATE_TOKEN_CEILING_PER_OPERATOR_REVIEW_6007792790',
    registered_slot_limit: maxCalls,
    calls_executed: callsExecuted,
    automatic_retries_executed: 0,
    fallback_seats_executed: 0,
    structural_repair_calls_executed: 0,
    stop_triggered: stopTriggered,
    terminal_error: terminalError,
    summary: summarizeResults(results),
    results
  });

  const persistReceipt = () => writeJsonAtomic(receiptPath, buildReceiptSnapshot());

  try {
    const assembled = schedule.slice(0, maxCalls).map(slotBuilder);
    const equivalence = assertQ1RequestEquivalence(assembled, { checkExpectedDigests });
    if (!equivalence.ok) {
      stopTriggered = 'STOP_1_GENERATION_CONFIG_OR_REQUEST_DRIFT';
      terminalError = equivalence.violations.join(' | ');
      status = 'HALTED_BEFORE_ACQUISITION';
      persistReceipt();
      return buildReceiptSnapshot();
    }

    for (const item of assembled) {
      if (callsExecuted >= maxCalls || callsExecuted >= HARD_MAX_CALLS) {
        stopTriggered = 'REGISTERED_SLOT_LIMIT_REACHED';
        break;
      }

      const startedAt = new Date().toISOString();
      const rawSseRel = `raw-sse/${item.slotSpec.slot}.sse`;
      const rawSsePath = path.join(runDir, rawSseRel);
      const rawTextRel = `raw-text/${item.slotSpec.slot}.txt`;
      const rawTextPath = path.join(runDir, rawTextRel);

      callsExecuted++;
      let resp;
      let rawSseBytes = Buffer.alloc(0);
      let streamInterrupted = false;
      let streamError = null;

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${PINNED_MODEL}:streamGenerateContent?alt=sse`;
        resp = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
          body: item.wire.body
        });
        const readRes = await readResponseBytesResiliently(resp);
        rawSseBytes = readRes.bytes;
        streamInterrupted = readRes.streamInterrupted;
        streamError = readRes.streamError;
      } catch (fetchErr) {
        consecutiveTransportErrors++;
        const transportRec = {
          slot: item.slotSpec.slot,
          arm: item.slotSpec.arm,
          armLabel: item.slotSpec.armLabel,
          taskKey: item.slotSpec.taskKey,
          replicate: item.slotSpec.replicate,
          startedAt,
          completedAt: new Date().toISOString(),
          httpStatus: null,
          requestDigests: item.wire.observation,
          modelRequested: PINNED_MODEL,
          outcomeClass: OUTCOME_CLASSES.TRANSPORT_FAILURE,
          eligibleArtisticSpecimen: false,
          classificationReason: `FETCH_EXCEPTION: ${fetchErr?.message || String(fetchErr)}`,
          rawSsePath: null,
          rawSseSha256: null,
          rawSseBytes: 0,
          rawTextPath: null,
          rawTextSha256: null
        };
        results.push(transportRec);
        if (consecutiveTransportErrors >= 2) {
          stopTriggered = 'STOP_3_CONSECUTIVE_TRANSPORT_FAILURES';
          persistReceipt();
          break;
        }
        persistReceipt();
        continue;
      }

      // CRITICAL CUSTODY LAW: Persist original raw SSE bytes BEFORE any parsing or validation.
      fs.writeFileSync(rawSsePath, rawSseBytes);
      const rawSseSha256 = sha256Buf(rawSseBytes);

      if (!resp.ok || streamInterrupted) {
        if (resp.status === 429 || resp.status === 503 || streamInterrupted) consecutiveTransportErrors++;
        else consecutiveTransportErrors = 0;

        const outcome = classifySlotOutcome({
          httpStatus: resp.status,
          transportError: !resp.ok ? `HTTP_${resp.status}` : null,
          streamInterrupted,
          pinnedModel: PINNED_MODEL
        });

        const errRec = {
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
          outcomeClass: outcome.outcomeClass,
          eligibleArtisticSpecimen: false,
          classificationReason: streamError ? `STREAM_INTERRUPTED: ${streamError}` : outcome.reason,
          rawSsePath: rawSseRel,
          rawSseSha256,
          rawSseBytes: rawSseBytes.length,
          rawTextPath: null,
          rawTextSha256: null,
          errorPreview: rawSseBytes.toString('utf8').slice(0, 400)
        };
        results.push(errRec);
        const unrecoverableAuthOrBilling = [401, 402, 403, 404].includes(resp.status);
        if (consecutiveTransportErrors >= 2 || unrecoverableAuthOrBilling) {
          stopTriggered = unrecoverableAuthOrBilling
            ? `STOP_3_UNRECOVERABLE_HTTP_${resp.status}`
            : `STOP_3_CONSECUTIVE_TRANSPORT_FAILURES_HTTP_${resp.status}`;
          persistReceipt();
          break;
        }
        persistReceipt();
        continue;
      }

      consecutiveTransportErrors = 0;

      // Wrap parsing and observation so raw first-return acquisition and terminal failure receipt
      // ALWAYS survive even an unexpected parser/observer exception.
      try {
        const sseIntegrity = await verifySseIntegrity(rawSseBytes, sseVerifyOptions);
        const canonicalPayload = sseIntegrity.canonicalMergedPayload || {};
        const canonicalText = sseIntegrity.canonicalText || '';

        // Preserve any recovered text on disk (even for incomplete/policy/mismatched returns)
        // while keeping outcomeClass and eligibleArtisticSpecimen strictly unpromoted.
        fs.writeFileSync(rawTextPath, canonicalText, 'utf8');
        const rawTextSha256 = sha256Text(canonicalText);

        const observed = observeGeminiOutput(canonicalPayload, PINNED_MODEL, {
          fallback: false,
          submittedGenerationConfig: item.request.generationConfig,
          submittedRequestObservation: item.wire.observation
        });
        const totalParseErrors = sseIntegrity.canonicalParseErrors
          + sseIntegrity.independentParseErrors
          + sseIntegrity.independentFramingErrors
          + sseIntegrity.independentStreamProtocolErrors;
        const completion = observeMarrowlineCompletion(canonicalText, observed, {
          streamed: true,
          parseErrors: totalParseErrors,
          creative: item.aperture.discourseMode === 'CREATIVE'
        });
        const outcome = classifySlotOutcome({
          httpStatus: resp.status,
          sseIntegrity,
          observedOutput: observed,
          completionState: completion,
          pinnedModel: PINNED_MODEL
        });

        const relayParsed = canonicalText ? parseRelayEnvelope(canonicalText) : null;
        const botsText = relayParsed?.bots || relayParsed?.tauricDianaBots || '';
        const prosody = observeBotsProsodyDistribution(botsText);
        const authorship = observeMarrowlineAuthorship(canonicalText, 'first-provider-return');

        const slotRecord = {
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
          modelVersion: observed.modelVersion || null,
          finishReason: observed.finishReason || null,
          finishMessage: observed.finishMessage || null,
          promptBlockReason: observed.promptBlockReason || null,
          usageMetadata: observed.usage,
          outcomeClass: outcome.outcomeClass,
          eligibleArtisticSpecimen: outcome.eligibleArtisticSpecimen,
          classificationReason: outcome.reason,
          rawSsePath: rawSseRel,
          rawSseSha256,
          rawSseBytes: rawSseBytes.length,
          rawTextPath: rawTextRel,
          rawTextSha256,
          rawTextUtf8Bytes: Buffer.byteLength(canonicalText, 'utf8'),
          sseIntegrity: {
            ok: sseIntegrity.ok,
            failureCode: sseIntegrity.failureCode,
            utf8Valid: sseIntegrity.utf8Valid,
            textEquivalent: sseIntegrity.textEquivalent,
            canonicalSelfTextEquivalent: sseIntegrity.canonicalSelfTextEquivalent,
            eventCountMatch: sseIntegrity.eventCountMatch,
            finishReasonEquivalent: sseIntegrity.finishReasonEquivalent,
            modelVersionEquivalent: sseIntegrity.modelVersionEquivalent,
            promptBlockEquivalent: sseIntegrity.promptBlockEquivalent,
            canonicalEventCount: sseIntegrity.canonicalEventCount,
            independentEventCount: sseIntegrity.independentEventCount,
            canonicalParseErrors: sseIntegrity.canonicalParseErrors,
            independentParseErrors: sseIntegrity.independentParseErrors,
            independentFramingErrors: sseIntegrity.independentFramingErrors,
            independentStreamProtocolErrors: sseIntegrity.independentStreamProtocolErrors,
            canonicalTextSha256: sseIntegrity.canonicalTextSha256,
            independentTextSha256: sseIntegrity.independentTextSha256,
            malformedReasons: sseIntegrity.malformedReasons,
            mismatchReasons: sseIntegrity.mismatchReasons,
            independentSummary: sseIntegrity.independentSummary
          },
          completionState: completion,
          geminiOutputObservation: observed,
          authorshipObservation: authorship,
          botsProsodyDistribution: prosody
        };
        results.push(slotRecord);

        if (postSlotHook) await postSlotHook(slotRecord, item);

        if (outcome.stopCode) {
          stopTriggered = outcome.stopCode;
          persistReceipt();
          break;
        }
        persistReceipt();
      } catch (parseOrObserveErr) {
        const failureRecord = {
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
          outcomeClass: OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE,
          eligibleArtisticSpecimen: false,
          classificationReason: `TERMINAL_PARSER_OR_OBSERVER_EXCEPTION: ${parseOrObserveErr?.message || String(parseOrObserveErr)}`,
          rawSsePath: rawSseRel,
          rawSseSha256,
          rawSseBytes: rawSseBytes.length,
          rawTextPath: fs.existsSync(rawTextPath) ? rawTextRel : null,
          rawTextSha256: fs.existsSync(rawTextPath) ? sha256Buf(fs.readFileSync(rawTextPath)) : null
        };
        results.push(failureRecord);
        stopTriggered = 'STOP_4_TERMINAL_PARSER_EXCEPTION';
        terminalError = parseOrObserveErr?.message || String(parseOrObserveErr);
        persistReceipt();
        break;
      }
    }

    status = stopTriggered ? 'HALTED_BY_STOP_RULE' : 'COMPLETED_REGISTERED_SLOTS';
  } catch (fatalErr) {
    terminalError = fatalErr?.message || String(fatalErr);
    if (!stopTriggered) stopTriggered = 'FATAL_HARNESS_EXCEPTION';
    status = 'FAILED_WITH_TERMINAL_ERROR';
    throw fatalErr;
  } finally {
    persistReceipt();
  }

  return buildReceiptSnapshot();
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
      request_equivalence_ok: preflight.request_equivalence_verified.ok,
      financial_ceiling: preflight.financial_and_token_policy.dollar_spending_ceiling,
      descriptive_typical_estimate_intro_usd: preflight.descriptive_pricing_reference_only.descriptive_typical_estimate_intro_rate.total_usd,
      output_written: path.relative(REPO_ROOT, outPath).replace(/\\/g, '/')
    }, null, 2));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  try {
    const liveReceipt = await executeQ1Run({
      sourceHeadSha: preflight.source_head_sha,
      operatorAuthSha: authShaArg,
      apiKey,
      maxCalls: maxCallsArg
    });
    console.log(JSON.stringify({
      ok: liveReceipt.status === 'COMPLETED_REGISTERED_SLOTS',
      status: liveReceipt.status,
      calls_executed: liveReceipt.calls_executed,
      stop_triggered: liveReceipt.stop_triggered,
      summary: liveReceipt.summary
    }, null, 2));
    if (liveReceipt.status !== 'COMPLETED_REGISTERED_SLOTS') process.exit(3);
  } catch (err) {
    if (err?.code === 'REFUSED_LIVE_EXECUTION') {
      console.error(err.message);
      process.exit(2);
    }
    throw err;
  }
}

const isCliEntry = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isCliEntry) {
  main().catch((err) => {
    console.error('Q1_HARNESS_ERROR:', err);
    process.exit(1);
  });
}
