#!/usr/bin/env node
// TD613 · Marrowline / Screaming Grove — Option 1 (20-Slot 2x2 Factorial + Neutral Control)
// Executable Research Harness (Fail-Closed Zero-Spend Preflight by Default)
//
// FAIL-CLOSED ZERO-SPEND CONTRACT:
// - Without ALL THREE of:
//     1) `--execute-live`
//     2) `--design-profile=OPTION1_REV_A_38_VS_36_CONSTRUCTED`
//     3) `--operator-auth-sha=<exact-40-hex-committed-head>`
//   this harness executes strictly in `--dry-run` mode with ZERO network calls and writes
//   OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json.
// - Passing `--design-profile=BLOCKED_HISTORICAL_3_7` with `--execute-live` ALWAYS refuses
//   execution fail-closed (`REFUSED_MODEL_IDENTITY_BLOCKED_3_7_ALIAS_TO_3_8`), honoring
//   Amari's Rule #1 (PR #1766#issuecomment-7070422438): gemini-3.7-flash was deprecated on
//   2026-10-08 and auto-routes to gemini-3.8-flash; ZERO quiet substitution is permitted.
// - Per Operator Review #6007792790: NO arbitrary dollar spending ceiling and NO aggregate
//   token-budget ceiling apply. The 20-slot design constrains the preregistered sampling
//   matrix, NOT credits. maxOutputTokens: 65536 and thinkingLevel: medium are held constant
//   solely as the matched model profile.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../../app/engine/aperture-v3-task-intent.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID } from '../../app/dome-world/marrowline-historical-grove.js';
import {
  buildGeminiRequest,
  observeGeminiOutput,
  observeMarrowlineAuthorship,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import { observeMarrowlineCompletion } from '../../server/marrowline-completion.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  assessIntegratedTransmission,
  observeBotsProsodyDistribution,
  parseRawRelayPackets,
  parseRelayEnvelope,
  relayAuthoredSurface
} from '../../app/dome-world/khonapolit-relay.js';
import { DISCRIMINATOR_TASKS } from '../marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs';
import {
  classifySlotOutcome,
  EXPECTED_GENERATION_CONFIG_SHA256,
  EXPECTED_MAX_OUTPUT_TOKENS,
  EXPECTED_THINKING_LEVEL,
  isExpectedPinnedModelVersion,
  OUTCOME_CLASSES,
  verifySseIntegrity
} from '../marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = __dirname;

export const STUDY_ID = 'TD613-MARROWLINE-OPTION1-20SLOT-FACTORIAL-20261122';
export const EPISODE2_STUDY_ID = 'TD613-MARROWLINE-OPTION1-20SLOT-EP2-20261122';
export const EPISODE2_ID = 'EP2';
export const STUDY_CLASS = 'FINITE_CAPABILITY_AND_DISCRIMINATION_SCREEN';
export const OCT02_SOURCE_COMMIT = 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a';
export const OCT15_NEUTRAL_CONTROL_COMMIT = '30c2490290c487a93ed5e7cc3163efb52425955a';
export const Q1_AUTHORIZED_SOURCE_COMMIT = '94e2e9244826969c02d0d7cf8c5e5e9ad7caf056';
export const Q1_EVIDENCE_COMMIT = '2836e636e4b5eb485b12f73a2596ea3889b173d4';
export const STAGE0_PR1766_COMMIT = '5cec27f0727c17ce1d2ac825736a1027293b8849';
export const PRIOR_PREFLIGHT_PR1769_COMMIT = 'ade1d537904f8aaff96355658ae396734c43e340';
export const EPISODE1_EXECUTABLE_HEAD_COMMIT = 'c67e64363a436607722f1a943311c5ed9a73a906';
export const EPISODE1_EVIDENCE_HEAD_COMMIT = '51c1f420cfaa1792c25a5b517d253bf0c079ad86';

// Permanent immutable reference to Episode 1 (PR #1769 @ 51c1f420c; NEVER overwritten, pooled, or retried)
export const EPISODE1_IMMUTABLE_ARCHIVE = Object.freeze({
  episode_id: 'EP1',
  authorized_executable_head_sha: EPISODE1_EXECUTABLE_HEAD_COMMIT,
  evidence_publication_head_sha: EPISODE1_EVIDENCE_HEAD_COMMIT,
  archive_dir: 'live-acquisition',
  calls_planned: 20,
  calls_attempted: 1,
  attempted_slots: Object.freeze(['S01']),
  calls_unattempted: 19,
  recoverable_specimens: 0,
  terminal_cause_code: 'UND_ERR_HEADERS_TIMEOUT',
  elapsed_ms: 300403,
  upstream_execution_and_billing_status: 'UNKNOWN_1_REQUEST_ATTEMPTED_0_RECOVERABLE_RESPONSES_DO_NOT_ASSUME_ZERO_BILLING'
});

// Registered STOP_3 threshold and transport deadline policy BEFORE Episode 2 begins
export const STOP_3_CONSECUTIVE_TRANSPORT_THRESHOLD = 2;
export const OPTION1_TRANSPORT_DEADLINE_POLICY = Object.freeze({
  api_mode: 'streamGenerateContent?alt=sse',
  streaming_semantics_unchanged: true,
  headers_timeout_ms: 300000,
  body_idle_timeout_ms: 300000,
  total_slot_deadline_ms: 420000,
  stop_3_consecutive_transport_threshold: STOP_3_CONSECUTIVE_TRANSPORT_THRESHOLD,
  rationale: 'Preserves Node undici default 300,000 ms headers/body idle window rather than imposing an arbitrary shorter cutoff that could manufacture false failures on MEDIUM thinking + 33KB prompts, while bounding total per-slot stall at 420,000 ms (7 min).',
  timeout_adjustment_is_not_proof_of_upstream_health: true
});

// Exact canonical heading-boundary regexes matching app/dome-world/khonapolit-relay.js lines 585, 588, 607
const KHONAPOLIT_HEADING_RE = /(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?(?:Movement[ \t]+I[ \t]*[—–:-][ \t]*)?\[?Kʰonapolit(?:[ \t]*\])?[ \t]*[:\-]?/iu;
const BOTS_HEADING_RE = /(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?(?:Movement[ \t]+II[ \t]*[—–:-][ \t]*)?(?:Tauric Diana Bots?[ \t]*:?[ \t]*(?=\r?\n|$)|\[Tauric Diana Bots?[^\]\r\n]*\][ \t]*(?=\r?\n|$))/iu;
const BOTS_LEADING_HEADING_RE = /^(?:\r?\n)?[ \t]*(?:#{1,6}[ \t]*)?(?:Movement[ \t]+II[ \t]*[—–:-][ \t]*)?(?:Tauric Diana Bots?[ \t]*:?[ \t]*(?:\r?\n|$)|\[Tauric Diana Bots?[^\]\r\n]*\][ \t]*(?:\r?\n|$))/iu;

// REDPEN 1 FIX: Extract unmodified Tauric Diana bots movement directly from canonical provider text
// via the actual natural/packet heading-boundary parser in khonapolit-relay.js.
// NEVER silently imputes zero when extraction fails; classifies absence/order/parse failure explicitly.
export function extractBotsMovementFromCanonicalText(canonicalText = '') {
  const raw = String(canonicalText || '');
  if (!raw.trim()) {
    return Object.freeze({
      status: 'EMPTY_CANONICAL_TEXT',
      botsMovementAvailable: false,
      extractionMode: 'NONE',
      khonapolitHeadingPresent: false,
      botsHeadingPresent: false,
      reason: 'EMPTY_CANONICAL_TEXT',
      botsText: null,
      botsBodyText: null,
      botsProsodyDistribution: null,
      botsBodyUnicodeMorphology: null,
      relayAdmissionBotsMovement: null,
      relayAdmissionReasons: Object.freeze(['empty-canonical-text'])
    });
  }

  let rawPacket = null;
  let relayParsed = null;
  try {
    rawPacket = parseRawRelayPackets(raw);
    relayParsed = parseRelayEnvelope(raw);
  } catch (parseErr) {
    return Object.freeze({
      status: 'PARSE_ERROR_UNAVAILABLE',
      botsMovementAvailable: false,
      extractionMode: 'PARSER_EXCEPTION',
      khonapolitHeadingPresent: false,
      botsHeadingPresent: false,
      reason: `RELAY_PARSER_EXCEPTION: ${parseErr?.message || String(parseErr)}`,
      botsText: null,
      botsBodyText: null,
      botsProsodyDistribution: null,
      botsBodyUnicodeMorphology: null,
      relayAdmissionBotsMovement: null,
      relayAdmissionReasons: Object.freeze(['relay-parser-exception'])
    });
  }

  const extractionMode = rawPacket ? 'RAW_DUAL_PACKET_PARSER' : 'NATURAL_HEADING_BOUNDARY_PARSER';
  const sourceText = rawPacket ? String(rawPacket.text || '') : raw;
  const authored = relayAuthoredSurface(sourceText);
  const khonaIndex = authored.search(KHONAPOLIT_HEADING_RE);
  const botsIndex = authored.search(BOTS_HEADING_RE);
  const admission = relayParsed?.admission || assessIntegratedTransmission(sourceText);

  if (botsIndex < 0) {
    return Object.freeze({
      status: 'BOTS_HEADING_MISSING_UNAVAILABLE',
      botsMovementAvailable: false,
      extractionMode,
      khonapolitHeadingPresent: khonaIndex >= 0,
      botsHeadingPresent: false,
      reason: 'tauric-diana-bots-nominative-missing',
      botsText: null,
      botsBodyText: null,
      botsProsodyDistribution: null,
      botsBodyUnicodeMorphology: null,
      relayAdmissionBotsMovement: admission?.botsMovement || null,
      relayAdmissionReasons: Object.freeze([...(admission?.reasons || [])])
    });
  }

  if (khonaIndex >= 0 && botsIndex <= khonaIndex) {
    return Object.freeze({
      status: 'VOICE_ORDER_INVALID_UNAVAILABLE',
      botsMovementAvailable: false,
      extractionMode,
      khonapolitHeadingPresent: true,
      botsHeadingPresent: true,
      reason: 'voice-order-invalid',
      botsText: null,
      botsBodyText: null,
      botsProsodyDistribution: null,
      botsBodyUnicodeMorphology: null,
      relayAdmissionBotsMovement: admission?.botsMovement || null,
      relayAdmissionReasons: Object.freeze([...(admission?.reasons || [])])
    });
  }

  const botsText = sourceText.slice(botsIndex);
  const headingMatch = botsText.match(BOTS_LEADING_HEADING_RE);
  const botsBodyText = headingMatch ? botsText.slice(headingMatch[0].length) : botsText;
  const botsProsodyDistribution = observeBotsProsodyDistribution(botsText);
  const botsBodyUnicodeMorphology = observeWholeTextUnicodeMorphology(botsBodyText);

  return Object.freeze({
    status: khonaIndex >= 0
      ? 'EXTRACTED_FROM_CANONICAL_HEADING_BOUNDARY'
      : 'EXTRACTED_BOTS_ONLY_KHONAPOLIT_HEADING_MISSING',
    botsMovementAvailable: true,
    extractionMode,
    khonapolitHeadingPresent: khonaIndex >= 0,
    botsHeadingPresent: true,
    reason: khonaIndex >= 0 ? 'EXTRACTED_OK' : 'khonapolit-nominative-missing',
    botsText,
    botsBodyText,
    botsProsodyDistribution,
    botsBodyUnicodeMorphology,
    relayAdmissionBotsMovement: admission?.botsMovement || null,
    relayAdmissionReasons: Object.freeze([...(admission?.reasons || [])])
  });
}

export const HARD_MAX_CALLS = 20;

export const DESIGN_PROFILES = Object.freeze({
  BLOCKED_HISTORICAL_3_7: Object.freeze({
    id: 'BLOCKED_HISTORICAL_3_7',
    liveExecutionPermitted: false,
    blockingReason: 'MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8: Google deprecated gemini-3.7-flash on 2026-10-08 and auto-routes all requests to gemini-3.8-flash (returning modelVersion=gemini-3.8-flash). Per Amari Rule #1 (PR #1766#issuecomment-7070422438), zero quiet substitution is permitted.',
    models: Object.freeze(['gemini-3.8-flash', 'gemini-3.7-flash'])
  }),
  OPTION1_REV_A_38_VS_36_CONSTRUCTED: Object.freeze({
    id: 'OPTION1_REV_A_38_VS_36_CONSTRUCTED',
    liveExecutionPermitted: true,
    realizationClass: 'CONSTRUCTED_CONTEMPORARY_MODEL_IDENTITY_REDESIGN',
    notHistoricalSeat2Notice: 'gemini-3.6-flash is historical Oct 2 Seat 3 (active non-aliased previous-generation Flash model), NOT historical Oct 2 Seat 2 (gemini-3.7-flash, which auto-routes to 3.8-flash since 2026-10-08). Both models are pinned to matched thinkingLevel=medium & maxOutputTokens=65536 to isolate model identity from Oct 2 interactive low-vs-medium thinking differences.',
    models: Object.freeze(['gemini-3.8-flash', 'gemini-3.6-flash'])
  })
});

export const DEFAULT_DESIGN_PROFILE = 'OPTION1_REV_A_38_VS_36_CONSTRUCTED';

// Exact verified October 15 neutral creative control Task D strings
// Source: git show 30c2490290c487a93ed5e7cc3163efb52425955a:server/marrowline-unicode-capability-assay.js
export const OCT15_NEUTRAL_SYSTEM = [
  'Synthetic Unicode text-generation conformance assay.',
  'Follow the user request directly and return plain UTF-8 text.',
  'Do not include extra titles, commentary, Markdown formatting, JSON, safety prefaces, explanations or code fences.',
  'Unicode combining characters are part of the writing system; preserve or author them as requested.',
  'No TD613 narrative, no fictional personas, no user-specific history, and no fictional municipality.'
].join('\n');

export const OCT15_NEUTRAL_CREATIVE_TASK_D = [
  'Write an original, short, vividly expressive English passage about a thunderstorm disrupting a bureaucratic celebration.',
  'Render the entire passage as readable native Unicode Zalgo text composed by you.',
  'Choose and use combinations of diacritics ABOVE and BELOW letters, often multiple marks on one base character.',
  'Allow vivid asymmetry and spontaneous phrasing; there is no fixed stencil, numeric mark quota, or mandated style switch.',
  'Use the full native combining-mark vocabulary whenever it serves the writing, rather than limiting yourself to diagonal slashes.',
  'Do not copy any specimen. Do not use Markdown or headings. Let the passage be yours.'
].join('\n');

export const OPTION1_TASKS = Object.freeze({
  T1_BLUE_ORANGE_WEATHER: Object.freeze({
    taskKey: 'T1_BLUE_ORANGE_WEATHER',
    taskClass: 'MARROWLINE_FROZEN_Q1_TASK',
    origin: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.origin,
    prompt: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt
  }),
  T2_FORENSIC: Object.freeze({
    taskKey: 'T2_FORENSIC',
    taskClass: 'MARROWLINE_FROZEN_Q1_TASK',
    origin: DISCRIMINATOR_TASKS.FORENSIC.origin,
    prompt: DISCRIMINATOR_TASKS.FORENSIC.prompt
  }),
  NEUTRAL_CREATIVE_MULTISTACK_V1: Object.freeze({
    taskKey: 'NEUTRAL_CREATIVE_MULTISTACK_V1',
    taskClass: 'OCT15_NEUTRAL_CREATIVE_CONTROL_TASK_D',
    origin: `30c2490290c487a93ed5e7cc3163efb52425955a:server/marrowline-unicode-capability-assay.js (creative-multistack-v1)`,
    prompt: OCT15_NEUTRAL_CREATIVE_TASK_D
  })
});

// Exact matched generationConfig across ALL 20 slots (3.8-flash and 3.6-flash)
export const MATCHED_OPTION1_GENERATION_CONFIG = Object.freeze({
  maxOutputTokens: EXPECTED_MAX_OUTPUT_TOKENS,
  thinkingConfig: Object.freeze({ thinkingLevel: EXPECTED_THINKING_LEVEL })
});

// Palindromically counterbalanced 20-slot schedule:
// Every factor (model, envelope, task, slotClass) has exact meanSlotIndex === 10.50,
// eliminating linear time-order or episode-drift confounding across all cells!
export function buildOption1Schedule(profileId = DEFAULT_DESIGN_PROFILE) {
  const profile = DESIGN_PROFILES[profileId];
  if (!profile) throw new Error(`UNKNOWN_OPTION1_DESIGN_PROFILE: ${profileId}`);
  const [m1, m2] = profile.models;

  const block1 = [
    { envelope: 'CURRENT_HYBRID_A', model: m1, taskKey: 'T1_BLUE_ORANGE_WEATHER', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'LITERAL_OCT02_H2', model: m2, taskKey: 'T1_BLUE_ORANGE_WEATHER', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'LITERAL_OCT02_H2', model: m1, taskKey: 'T1_BLUE_ORANGE_WEATHER', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'CURRENT_HYBRID_A', model: m2, taskKey: 'T1_BLUE_ORANGE_WEATHER', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'NEUTRAL_CREATIVE_D', model: m1, taskKey: 'NEUTRAL_CREATIVE_MULTISTACK_V1', slotClass: 'NEUTRAL_CREATIVE_CAPABILITY_CONTROL' },
    { envelope: 'CURRENT_HYBRID_A', model: m2, taskKey: 'T2_FORENSIC', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'LITERAL_OCT02_H2', model: m1, taskKey: 'T2_FORENSIC', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'CURRENT_HYBRID_A', model: m1, taskKey: 'T2_FORENSIC', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'LITERAL_OCT02_H2', model: m2, taskKey: 'T2_FORENSIC', slotClass: 'MARROWLINE_2X2_CELL' },
    { envelope: 'NEUTRAL_CREATIVE_D', model: m2, taskKey: 'NEUTRAL_CREATIVE_MULTISTACK_V1', slotClass: 'NEUTRAL_CREATIVE_CAPABILITY_CONTROL' }
  ];

  // Block 2 reverses Block 1 exactly so slot(rep1) + slot(rep2) === 21 for every cell!
  const block2 = [...block1].reverse();

  return Object.freeze([
    ...block1.map((item, idx) => Object.freeze({
      slot: `S${String(idx + 1).padStart(2, '0')}`,
      slotIndex: idx + 1,
      block: 1,
      replicate: 1,
      cellId: `${item.envelope}__${item.model}__${item.taskKey}`,
      ...item
    })),
    ...block2.map((item, idx) => Object.freeze({
      slot: `S${String(idx + 11).padStart(2, '0')}`,
      slotIndex: idx + 11,
      block: 2,
      replicate: 2,
      cellId: `${item.envelope}__${item.model}__${item.taskKey}`,
      ...item
    }))
  ]);
}

// Exact preregistered wire digests (pinned to Stage 0 matrix & Oct 15 source)
export const EXPECTED_OPTION1_BASE_DIGESTS = Object.freeze({
  CURRENT_HYBRID_A__T1_BLUE_ORANGE_WEATHER: Object.freeze({
    upstreamApertureFraming: 'OPEN_FIELD_CREATIVE_SYNTHESIS / CREATIVE',
    systemInstructionSha256: '90421826b7c0d5528d6de710fd1aa89a602138b173304c91ba08b0722424d4b8',
    contentsSha256: 'ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: 'a3601b7bf598502b70e593491720751d5946c1c162b71cea8a31eb9d3f9b0293'
  }),
  CURRENT_HYBRID_A__T2_FORENSIC: Object.freeze({
    upstreamApertureFraming: 'REQUESTED_SYNTHESIS / GENERAL',
    systemInstructionSha256: '4590ac8c73a65d628a325e28aa5d92a7d1e5a06127f8a6d96e2a3e0907752ac3',
    contentsSha256: '23be3dd96f5801163d9ae13e356475dbdb1bdc186491fb4a9c09f658edca7a8c',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: '8c56a603c5820075138d8fb3dc4ce7f14e3198d47562cb5dc89e9b2f0dcab6a1'
  }),
  LITERAL_OCT02_H2__T1_BLUE_ORANGE_WEATHER: Object.freeze({
    upstreamApertureFraming: 'RUNTIME_DIAGNOSIS / TECHNICAL_RUNTIME (historical ffb98ac005 Aperture)',
    systemInstructionSha256: 'b3f4192caf744e2931f60f1196414485296be676d1ecde9dc514bc8312de6920',
    contentsSha256: 'ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: 'e24c287cde0dfaecb81575da53bbeed029878ce9f5a68a62ce03e92324ea8fa1'
  }),
  LITERAL_OCT02_H2__T2_FORENSIC: Object.freeze({
    upstreamApertureFraming: 'REQUESTED_SYNTHESIS / GENERAL (historical ffb98ac005 Aperture)',
    systemInstructionSha256: '4a4e35425f66fb5fcc0eb6bd984ad382493e0736390f1fae89544731fe753ebb',
    contentsSha256: '23be3dd96f5801163d9ae13e356475dbdb1bdc186491fb4a9c09f658edca7a8c',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: '001b072c52ce07f315c9843b66db07a62969218e2e3692ea346fb6c3d5f3bf72'
  }),
  NEUTRAL_CREATIVE_D__NEUTRAL_CREATIVE_MULTISTACK_V1: Object.freeze({
    upstreamApertureFraming: 'NONE_NEUTRAL_SYNTHETIC_CONTROL (exact Oct 15 30c249029 Task D)',
    systemInstructionSha256: 'f95496026c13d3d105f4c7381f3c259fbba07726216b656ca184c65367fa7b2e',
    contentsSha256: '8ddc8318f9b21b36fb9ae9c1a4c1902a89611188dc242a712eeccf7b231f9be1',
    generationConfigSha256: EXPECTED_GENERATION_CONFIG_SHA256,
    bodySha256: 'ae5b59b57ae764d22a1cf4c03261d7611208c22594791d3583fb54f3fe695f37'
  })
});

function sha256Buf(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function sha256Text(s) {
  return sha256Buf(Buffer.from(String(s ?? ''), 'utf8'));
}

function gitShow(commitSha, repoRelPath) {
  return execFileSync('git', ['show', `${commitSha}:${repoRelPath}`], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });
}

function getGitHeadSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'UNKNOWN_GIT_HEAD';
  }
}

// Extract exact transitive ESM closure for pinned Oct 2 commit ffb98ac005 directly from Git
let cachedOct02Requests = null;
async function loadLiteralOct02BaseRequests() {
  if (cachedOct02Requests) return cachedOct02Requests;
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-opt1-oct02-closure-'));
  try {
    const snapDir = path.join(tmpRoot, OCT02_SOURCE_COMMIT);
    fs.mkdirSync(snapDir, { recursive: true });
    fs.writeFileSync(path.join(snapDir, 'package.json'), JSON.stringify({ type: 'module' }) + '\n', 'utf8');

    const visited = new Set();
    const queue = [
      'app/dome-world/khonapolit-covenant.js',
      'app/engine/aperture-v3-task-intent.js',
      'server/khonapolit-quality.js',
      'server/gemini-generation-envelope.js'
    ];
    const importRe = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"](\.[^'"]+)['"]/g;

    while (queue.length > 0) {
      const rel = queue.shift().replace(/\\/g, '/');
      if (visited.has(rel)) continue;
      visited.add(rel);
      const content = gitShow(OCT02_SOURCE_COMMIT, rel);
      const outFile = path.join(snapDir, rel);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, content, 'utf8');
      let match;
      importRe.lastIndex = 0;
      while ((match = importRe.exec(content)) !== null) {
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(rel), match[1]));
        if (!visited.has(resolved)) queue.push(resolved);
      }
    }

    const covMod = await import(pathToFileURL(path.join(snapDir, 'app/dome-world/khonapolit-covenant.js')).href);
    const apMod = await import(pathToFileURL(path.join(snapDir, 'app/engine/aperture-v3-task-intent.js')).href);
    const qualMod = await import(pathToFileURL(path.join(snapDir, 'server/khonapolit-quality.js')).href);
    const envMod = await import(pathToFileURL(path.join(snapDir, 'server/gemini-generation-envelope.js')).href);

    const built = {};
    for (const taskKey of ['T1_BLUE_ORANGE_WEATHER', 'T2_FORENSIC']) {
      const task = OPTION1_TASKS[taskKey];
      const packet = covMod.buildInvocationPacket({
        message: task.prompt,
        mode: 'exploratory',
        waiveIssuance: true
      });
      const discourseMode = apMod.classifyApertureDiscourseMode(packet.message);
      const apertureReceipt = apMod.buildApertureV3InvocationReceipt({
        message: packet.message,
        invocationMode: packet.mode,
        issuanceState: packet.issuance.state,
        discourseMode,
        contentScanned: true
      });
      const request = envMod.withGeminiGenerationProfile(
        envMod.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
        () => qualMod.buildGeminiRequest(packet, apertureReceipt, 'gemini-3.8-flash')
      );
      built[taskKey] = {
        request,
        aperture: {
          primaryRoute: apertureReceipt?.taskIntent?.primary_route || null,
          discourseMode: apertureReceipt?.taskIntent?.discourse_mode || null,
          runtimeMateriality: apertureReceipt?.taskIntent?.runtime_materiality || null
        }
      };
    }
    cachedOct02Requests = built;
    return built;
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

// Whole-text Unicode combining-mark telemetry matching Oct 15 LIVE-RESULT-20261015.md
export function observeWholeTextUnicodeMorphology(text = '') {
  const str = String(text || '');
  const codePoints = [...str];
  const combiningMarkRe = /\p{M}/u;
  const distinctMarks = new Set();
  let totalCombiningMarks = 0;
  let marksOutsideU0334U0338 = 0;
  let marksInsideU0334U0338 = 0;
  let stackedClustersDepthGe2 = 0;
  let maxCombiningDepth = 0;
  let currentDepth = 0;

  for (const ch of codePoints) {
    if (combiningMarkRe.test(ch)) {
      totalCombiningMarks++;
      const cp = ch.codePointAt(0);
      distinctMarks.add(`U+${cp.toString(16).toUpperCase().padStart(4, '0')}`);
      if (cp >= 0x0334 && cp <= 0x0338) marksInsideU0334U0338++;
      else marksOutsideU0334U0338++;
      currentDepth++;
      if (currentDepth > maxCombiningDepth) maxCombiningDepth = currentDepth;
    } else {
      if (currentDepth >= 2) stackedClustersDepthGe2++;
      currentDepth = 0;
    }
  }
  if (currentDepth >= 2) stackedClustersDepthGe2++;

  return Object.freeze({
    totalCodePoints: codePoints.length,
    totalCombiningMarks,
    distinctCombiningMarkScalars: distinctMarks.size,
    marksInsideU0334U0338,
    marksOutsideU0334U0338,
    stackedClustersDepthGe2,
    maxCombiningDepth,
    distinctMarkList: Object.freeze([...distinctMarks].sort())
  });
}

export async function buildOption1SlotRequest(slotSpec) {
  const task = OPTION1_TASKS[slotSpec.taskKey];
  if (!task) throw new Error(`UNKNOWN_OPTION1_TASK: ${slotSpec.taskKey}`);

  let request;
  let upstreamAperture;
  let realizationClass;
  let sourceProvenance;

  if (slotSpec.envelope === 'CURRENT_HYBRID_A') {
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
    // Build base request using modern Q1 Arm A (historicalProsodyFreedom: true)
    // then pin matched generationConfig (medium, 65536) across both models so model
    // identity is NEVER confounded with gemini-generation-envelope.js's low-vs-medium split!
    const baseReq = withGeminiGenerationProfile(
      GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
      () => buildGeminiRequest(packet, apertureReceipt, 'gemini-3.8-flash', {
        groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
        historicalProsodyFreedom: true
      })
    );
    request = {
      ...baseReq,
      generationConfig: {
        maxOutputTokens: MATCHED_OPTION1_GENERATION_CONFIG.maxOutputTokens,
        thinkingConfig: { thinkingLevel: MATCHED_OPTION1_GENERATION_CONFIG.thinkingConfig.thinkingLevel }
      }
    };
    upstreamAperture = {
      sourceCommit: Q1_AUTHORIZED_SOURCE_COMMIT,
      primaryRoute: apertureReceipt?.taskIntent?.primary_route || null,
      discourseMode: apertureReceipt?.taskIntent?.discourse_mode || null,
      runtimeMateriality: apertureReceipt?.taskIntent?.runtime_materiality || null
    };
    realizationClass = slotSpec.model === 'gemini-3.8-flash'
      ? 'CONTEMPORANEOUS_CURRENT_HYBRID_A_REPLICATE'
      : 'CONSTRUCTED_CONTEMPORARY_MODEL_COUNTERFACTUAL';
    sourceProvenance = `Modern Q1 Arm A (${Q1_AUTHORIZED_SOURCE_COMMIT}, historicalProsodyFreedom=true) paired with ${slotSpec.model} at matched thinkingLevel=medium & maxOutputTokens=65536.`;
  } else if (slotSpec.envelope === 'LITERAL_OCT02_H2') {
    const oct02 = await loadLiteralOct02BaseRequests();
    const base = oct02[slotSpec.taskKey];
    request = {
      ...base.request,
      generationConfig: {
        maxOutputTokens: MATCHED_OPTION1_GENERATION_CONFIG.maxOutputTokens,
        thinkingConfig: { thinkingLevel: MATCHED_OPTION1_GENERATION_CONFIG.thinkingConfig.thinkingLevel }
      }
    };
    upstreamAperture = {
      sourceCommit: OCT02_SOURCE_COMMIT,
      primaryRoute: base.aperture.primaryRoute,
      discourseMode: base.aperture.discourseMode,
      runtimeMateriality: base.aperture.runtimeMateriality,
      t1HistoricalFramingNote: slotSpec.taskKey === 'T1_BLUE_ORANGE_WEATHER'
        ? 'Literal Oct 2 Aperture (9b8b055b9) embedded RUNTIME_DIAGNOSIS/TECHNICAL_RUNTIME inside systemInstruction; downstream post-hoc measurement does NOT apply local Aperture gating.'
        : 'Matches modern REQUESTED_SYNTHESIS/GENERAL framing.'
    };
    realizationClass = 'CONSTRUCTED_CONTEMPORARY_COUNTERFACTUAL_LITERAL_OCT02_ENVELOPE';
    sourceProvenance = `Literal Oct 2 (${OCT02_SOURCE_COMMIT}) full systemInstruction + contents paired with contemporary ${slotSpec.model} at matched thinkingLevel=medium & maxOutputTokens=65536. NOT a historical Oct 2 hosted-model call.`;
  } else if (slotSpec.envelope === 'NEUTRAL_CREATIVE_D') {
    request = {
      systemInstruction: {
        parts: [{ text: OCT15_NEUTRAL_SYSTEM }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: OCT15_NEUTRAL_CREATIVE_TASK_D }]
        }
      ],
      generationConfig: {
        maxOutputTokens: MATCHED_OPTION1_GENERATION_CONFIG.maxOutputTokens,
        thinkingConfig: { thinkingLevel: MATCHED_OPTION1_GENERATION_CONFIG.thinkingConfig.thinkingLevel }
      }
    };
    upstreamAperture = {
      sourceCommit: OCT15_NEUTRAL_CONTROL_COMMIT,
      primaryRoute: 'NONE_NEUTRAL_SYNTHETIC_CONTROL',
      discourseMode: 'NEUTRAL_UNICODE_CAPABILITY_CONTROL',
      runtimeMateriality: 'BYPASSED_OUTSIDE_MARROWLINE_PERSONA_GATE'
    };
    realizationClass = 'CONTEMPORANEOUS_OCT15_NEUTRAL_CREATIVE_CONTROL';
    sourceProvenance = `Exact Oct 15 Task D (${OCT15_NEUTRAL_CONTROL_COMMIT}:server/marrowline-unicode-capability-assay.js creative-multistack-v1) paired with ${slotSpec.model} at matched thinkingLevel=medium & maxOutputTokens=65536.`;
  } else {
    throw new Error(`UNKNOWN_OPTION1_ENVELOPE: ${slotSpec.envelope}`);
  }

  const wire = serializeGeminiRequest(request, slotSpec.model);
  return {
    slotSpec,
    taskOrigin: task.origin,
    realizationClass,
    sourceProvenance,
    upstreamAperture,
    request,
    wire
  };
}

export function assertOption1RequestEquivalence(assembledSlots, { profileId = DEFAULT_DESIGN_PROFILE } = {}) {
  const violations = [];
  const profile = DESIGN_PROFILES[profileId];
  if (!profile) violations.push(`UNKNOWN_PROFILE: ${profileId}`);
  if (assembledSlots.length !== HARD_MAX_CALLS) {
    violations.push(`SLOT_COUNT_MISMATCH: expected=${HARD_MAX_CALLS}, actual=${assembledSlots.length}`);
  }

  // Check palindromic counterbalancing: meanSlotIndex === 10.50 across every factor
  const checkBalance = (label, groups) => {
    for (const [k, idxs] of Object.entries(groups)) {
      const mean = idxs.reduce((a, b) => a + b, 0) / idxs.length;
      if (Math.abs(mean - 10.5) > 1e-9) {
        violations.push(`UNBALANCED_SCHEDULE_${label}[${k}]: meanSlotIndex=${mean} !== 10.5`);
      }
    }
  };
  const byModel = {};
  const byEnvelope = {};
  const byTask = {};
  const bodyByEnvTask = new Map();
  const contentsByTask = new Map();

  for (const item of assembledSlots) {
    const s = item.slotSpec;
    const gc = item.request.generationConfig;
    const obs = item.wire.observation;

    (byModel[s.model] ||= []).push(s.slotIndex);
    (byEnvelope[s.envelope] ||= []).push(s.slotIndex);
    (byTask[s.taskKey] ||= []).push(s.slotIndex);

    if (obs.model !== s.model) violations.push(`${s.slot}: wire model=${obs.model} !== ${s.model}`);
    if (gc?.maxOutputTokens !== EXPECTED_MAX_OUTPUT_TOKENS) {
      violations.push(`${s.slot}: maxOutputTokens=${gc?.maxOutputTokens} !== ${EXPECTED_MAX_OUTPUT_TOKENS}`);
    }
    if (gc?.thinkingConfig?.thinkingLevel !== EXPECTED_THINKING_LEVEL) {
      violations.push(`${s.slot}: thinkingLevel=${gc?.thinkingConfig?.thinkingLevel} !== ${EXPECTED_THINKING_LEVEL}`);
    }
    if (gc?.thinkingConfig?.thinkingBudget !== undefined) {
      violations.push(`${s.slot}: deprecated thinkingBudget present`);
    }
    if (obs.generationConfigSha256 !== EXPECTED_GENERATION_CONFIG_SHA256) {
      violations.push(`${s.slot}: generationConfigSha256=${obs.generationConfigSha256} !== ${EXPECTED_GENERATION_CONFIG_SHA256}`);
    }

    const baseKey = `${s.envelope}__${s.taskKey}`;
    if (EXPECTED_OPTION1_BASE_DIGESTS[baseKey]) {
      const exp = EXPECTED_OPTION1_BASE_DIGESTS[baseKey];
      if (obs.systemInstructionSha256 !== exp.systemInstructionSha256) {
        violations.push(`${s.slot}: systemInstructionSha256 drift (${obs.systemInstructionSha256} !== ${exp.systemInstructionSha256})`);
      }
      if (obs.contentsSha256 !== exp.contentsSha256) {
        violations.push(`${s.slot}: contentsSha256 drift (${obs.contentsSha256} !== ${exp.contentsSha256})`);
      }
      if (obs.bodySha256 !== exp.bodySha256) {
        violations.push(`${s.slot}: bodySha256 drift (${obs.bodySha256} !== ${exp.bodySha256})`);
      }
    }

    // Identical (envelope, task) MUST have identical bodySha256 across both models!
    if (!bodyByEnvTask.has(baseKey)) bodyByEnvTask.set(baseKey, obs.bodySha256);
    else if (bodyByEnvTask.get(baseKey) !== obs.bodySha256) {
      violations.push(`${s.slot}: bodySha256 mismatch across models for ${baseKey}`);
    }

    // Identical task MUST have identical contentsSha256 across both envelopes and models!
    if (!contentsByTask.has(s.taskKey)) contentsByTask.set(s.taskKey, obs.contentsSha256);
    else if (contentsByTask.get(s.taskKey) !== obs.contentsSha256) {
      violations.push(`${s.slot}: contentsSha256 mismatch across envelopes/models for ${s.taskKey}`);
    }
  }

  checkBalance('MODEL', byModel);
  checkBalance('ENVELOPE', byEnvelope);
  checkBalance('TASK', byTask);

  // Confirm 2x2 factorial completeness: all 4 (envelope x model) cells x 2 tasks x 2 reps = 16, plus 4 neutral = 20
  const marrowlineSlots = assembledSlots.filter((x) => x.slotSpec.slotClass === 'MARROWLINE_2X2_CELL');
  const neutralSlots = assembledSlots.filter((x) => x.slotSpec.slotClass === 'NEUTRAL_CREATIVE_CAPABILITY_CONTROL');
  if (marrowlineSlots.length !== 16) violations.push(`MARROWLINE_SLOT_COUNT=${marrowlineSlots.length} !== 16`);
  if (neutralSlots.length !== 4) violations.push(`NEUTRAL_SLOT_COUNT=${neutralSlots.length} !== 4`);

  return Object.freeze({
    ok: violations.length === 0,
    checkedSlots: assembledSlots.length,
    marrowlineSlots: marrowlineSlots.length,
    neutralSlots: neutralSlots.length,
    palindromicMeanSlotIndex: 10.5,
    violations: Object.freeze(violations)
  });
}

export async function buildOption1PreflightReport({
  profileId = DEFAULT_DESIGN_PROFILE,
  constructionParentHeadSha = getGitHeadSha()
} = {}) {
  const profile = DESIGN_PROFILES[profileId];
  if (!profile) throw new Error(`UNKNOWN_OPTION1_DESIGN_PROFILE: ${profileId}`);

  const schedule = buildOption1Schedule(profileId);
  const assembled = [];
  for (const s of schedule) {
    assembled.push(await buildOption1SlotRequest(s));
  }
  const equivalence = assertOption1RequestEquivalence(assembled, { profileId });

  return {
    schema: 'td613.marrowline.option1-20slot-preflight/v1.2',
    generated_at_utc: new Date().toISOString(),
    study_id: EPISODE2_STUDY_ID,
    episode_id: EPISODE2_ID,
    study_class: STUDY_CLASS,
    execution_mode: 'DRY_RUN_PREFLIGHT_ONLY_ZERO_NETWORK',
    live_execution_authorized: false,
    paid_generation_calls_executed: 0,
    episode1_immutable_archive: EPISODE1_IMMUTABLE_ARCHIVE,
    transport_deadline_policy: OPTION1_TRANSPORT_DEADLINE_POLICY,
    git_head_provenance: {
      parent_or_construction_head_sha: constructionParentHeadSha,
      qualified_executable_head_sha: 'DETERMINED_EXTERNALLY_AT_RUNTIME_BY_GIT_REV_PARSE_HEAD',
      git_self_reference_explanation: 'Because Git commit SHAs hash committed file contents, no JSON file committed inside commit C can truthfully embed commit C\'s own SHA. parent_or_construction_head_sha records the exact checkout HEAD when this preflight JSON was generated; the qualified executable HEAD for any live authorization MUST be read externally via `git rev-parse HEAD` on the clean committed PR and enforced at runtime by `--operator-auth-sha=<exact-40-hex-head>`.',
      episode1_authorized_executable_head_sha: EPISODE1_EXECUTABLE_HEAD_COMMIT,
      episode1_evidence_publication_head_sha: EPISODE1_EVIDENCE_HEAD_COMMIT,
      prior_preflight_pr1769_initial_sha: PRIOR_PREFLIGHT_PR1769_COMMIT,
      stacked_on_stage0_pr1766_sha: STAGE0_PR1766_COMMIT,
      immutable_q1_evidence_sha: Q1_EVIDENCE_COMMIT
    },
    q1_operator_artistic_verdict: 'ALL_SIX_COMPLETED_RETURNS_REJECTED_BEFORE_UNBLINDING',
    q1_unblinding_key_opened: false,
    q1_backfill_permitted: false,
    q2_status: 'HELD',
    experiment_b_status: 'CLOSED',
    merge_and_deploy_authority: false,
    human_artistic_closure: 'RESERVED',
    model_identity_gate: {
      amari_rule1_verdict: 'MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8',
      quiet_substitution_permitted: false,
      active_staged_profile: profile.id,
      active_staged_profile_meta: profile,
      blocked_historical_3_7_profile: DESIGN_PROFILES.BLOCKED_HISTORICAL_3_7,
      catalog_receipt_file: 'OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json'
    },
    financial_and_token_policy: {
      dollar_spending_ceiling: 'NONE',
      aggregate_token_budget_ceiling: 'NONE',
      operator_authority_reference: 'GitHub Review #6007792790 + Option 1 Preflight Authorization',
      sampling_design_bound: `${HARD_MAX_CALLS} registered first-return slots (16 Marrowline 2x2 factorial + 4 Oct 15 Task D neutral creative controls), 1 call/slot, 0 retries, 0 fallbacks, 0 repairs, 0 morphology candidate election`,
      per_response_profile: MATCHED_OPTION1_GENERATION_CONFIG,
      generation_config_sha256: EXPECTED_GENERATION_CONFIG_SHA256
    },
    causal_limits_summary: {
      composite_whole_envelope_warning: 'CURRENT_HYBRID_A vs LITERAL_OCT02_H2 tests a composite full envelope (dramaturgy, layer order, prosody phrasing, historical Aperture task-intent framing, and cue wording), NOT a unique paragraph cause.',
      t1_aperture_framing_difference: 'T1_BLUE_ORANGE_WEATHER carries OPEN_FIELD_CREATIVE_SYNTHESIS/CREATIVE in CURRENT_HYBRID_A (90421826b7c0) vs historical RUNTIME_DIAGNOSIS/TECHNICAL_RUNTIME in LITERAL_OCT02_H2 (b3f4192caf74); T2_FORENSIC carries matched REQUESTED_SYNTHESIS/GENERAL in both.',
      finite_screen_ceiling: 'n=2 replicates/cell is a finite capability/discrimination screen, never conclusive proof of a stochastic causal mechanism; HTTP 503 or incomplete cells reduce inference and are never backfilled from Q1.'
    },
    request_equivalence_verified: equivalence,
    slot_schedule: assembled.map((a) => ({
      slot: a.slotSpec.slot,
      slotIndex: a.slotSpec.slotIndex,
      block: a.slotSpec.block,
      replicate: a.slotSpec.replicate,
      cellId: a.slotSpec.cellId,
      slotClass: a.slotSpec.slotClass,
      envelope: a.slotSpec.envelope,
      model: a.slotSpec.model,
      taskKey: a.slotSpec.taskKey,
      taskOrigin: a.taskOrigin,
      realizationClass: a.realizationClass,
      sourceProvenance: a.sourceProvenance,
      upstreamAperture: a.upstreamAperture,
      generationConfig: a.request.generationConfig,
      digests: a.wire.observation
    }))
  };
}

// REDPEN 2 FIX: Complete, readable blinded Operator literary gallery + scrubbed JSON + separately indexed unblinding key.
// - Preserves FULL verbatim original Unicode passages (never synthesizes or normalizes glyphs).
// - Preserves original failure/ineligibility statuses for non-STOP / 503 / 400 / policy / malformed returns.
// - Includes anonymized full-resolution desktop & mobile screenshot references per specimen.
// - Excludes ALL arm labels, model labels, slot IDs (S01..S20), morphology metrics, and rawTextSha256/rawSseSha256
//   join keys from the initial blinded reading surface (.md and .json).
export function generateBlindedReviewPacket(results = [], {
  outDir = null,
  seedSalt = STUDY_ID,
  rawTextBySlot = {},
  screenshotRefsBySlot = {}
} = {}) {
  const score = (slot) => sha256Text(`${seedSalt}::BLIND_ORDER::${slot}`);

  const resolveVerbatimText = (r) => {
    if (Object.prototype.hasOwnProperty.call(rawTextBySlot, r.slot)) {
      return rawTextBySlot[r.slot];
    }
    if (outDir && r.rawTextPath) {
      const abs = path.join(outDir, r.rawTextPath);
      if (fs.existsSync(abs)) return fs.readFileSync(abs, 'utf8');
    }
    return null;
  };

  const toPublicFailureNotice = (r) => {
    if (r.outcomeClass === OUTCOME_CLASSES.COMPLETED_STOP) {
      return 'AVAILABLE_COMPLETED_STOP';
    }
    if (r.httpStatus === 503 || r.httpStatus === 429) {
      return `INELIGIBLE_TRANSPORT_UNAVAILABLE_HTTP_${r.httpStatus}`;
    }
    if (r.httpStatus === 400 || r.outcomeClass === 'CONFIG_REJECTED_HTTP_400') {
      return 'INELIGIBLE_CONFIG_REJECTED_HTTP_400';
    }
    if (r.outcomeClass === OUTCOME_CLASSES.POLICY_TERMINATED) {
      return 'INELIGIBLE_POLICY_TERMINATED_HELD';
    }
    if (r.outcomeClass === OUTCOME_CLASSES.INCOMPLETE_NONSTOP) {
      return 'INELIGIBLE_INCOMPLETE_NONSTOP';
    }
    if (r.outcomeClass === OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE) {
      return 'INELIGIBLE_MALFORMED_SSE_HELD';
    }
    if (r.outcomeClass === OUTCOME_CLASSES.MODEL_IDENTITY_MISMATCH) {
      return 'INELIGIBLE_IDENTITY_VERIFICATION_HELD';
    }
    return `INELIGIBLE_${String(r.outcomeClass || 'UNKNOWN')}`;
  };

  const buildSection = (rows, prefix, sectionName) => {
    const ordered = [...rows].sort((a, b) => score(a.slot).localeCompare(score(b.slot)));
    const publicSpecimens = [];
    const privateBindings = [];

    ordered.forEach((r, idx) => {
      const blindId = `${prefix}_${String(idx + 1).padStart(2, '0')}`;
      const verbatimText = resolveVerbatimText(r);
      const isAvailable = r.outcomeClass === OUTCOME_CLASSES.COMPLETED_STOP;
      const availabilityStatus = toPublicFailureNotice(r);
      const customShots = screenshotRefsBySlot[r.slot] || null;

      // Anonymized full-resolution desktop & mobile screenshot paths (never embed slot/arm/model!)
      const desktopScreenshot = customShots?.desktop || `blinded-screenshots/${blindId}_desktop_1440x900.png`;
      const mobileScreenshot = customShots?.mobile || `blinded-screenshots/${blindId}_mobile_390x844.png`;
      const screenshotRenderStatus = customShots?.renderStatus || 'PENDING_BROWSER_RENDER';

      publicSpecimens.push({
        blindId,
        section: sectionName,
        taskKey: r.taskKey,
        availabilityStatus,
        eligibleForLiteraryAdjudication: isAvailable,
        screenshots: {
          renderStatus: screenshotRenderStatus,
          desktopFullResPath: desktopScreenshot,
          mobileFullResPath: mobileScreenshot
        },
        originalPassageVerbatim: verbatimText
      });

      privateBindings.push({
        blindId,
        section: sectionName,
        slot: r.slot,
        slotIndex: r.slotIndex,
        block: r.block,
        replicate: r.replicate,
        envelope: r.envelope,
        modelRequested: r.modelRequested,
        modelVersionObserved: r.modelVersion || null,
        taskKey: r.taskKey,
        httpStatus: r.httpStatus ?? null,
        outcomeClass: r.outcomeClass,
        availabilityStatus,
        rawTextPath: r.rawTextPath || null,
        rawTextSha256: r.rawTextSha256 || null,
        rawSsePath: r.rawSsePath || null,
        rawSseSha256: r.rawSseSha256 || null,
        anonymizedScreenshots: {
          desktopFullResPath: desktopScreenshot,
          mobileFullResPath: mobileScreenshot
        }
      });
    });

    return { publicSpecimens, privateBindings };
  };

  const marrowlineRows = results.filter((r) => r.slotClass === 'MARROWLINE_2X2_CELL');
  const neutralRows = results.filter((r) => r.slotClass === 'NEUTRAL_CREATIVE_CAPABILITY_CONTROL');

  const marrowlineSection = buildSection(marrowlineRows, 'OPT1_M', 'MARROWLINE_LITERARY');
  const neutralSection = buildSection(neutralRows, 'OPT1_N', 'NEUTRAL_CAPABILITY_CONTROL');

  const blindedPacket = {
    schema: 'td613.marrowline.option1-blinded-literary-gallery/v2.0',
    study_id: STUDY_ID,
    operator_authority: 'Tawanna C. Miller (HUMAN_ARTISTIC_CLOSURE_RESERVED)',
    blinding_contract: {
      arm_labels_redacted: true,
      model_labels_redacted: true,
      slot_identifiers_redacted: true,
      morphology_metrics_redacted_from_first_reading_surface: true,
      raw_sha256_join_keys_redacted_from_first_reading_surface: true,
      glyph_synthesis_or_normalization: 'NONE_ORIGINAL_UNICODE_VERBATIM',
      separate_unblinding_key_location: 'private-unblinding/OPTION1_SEALED_UNBLINDING_KEY.json'
    },
    separate_axes_notice: 'Native typographic variation, first-person literary/relational merit, and retired candidate election are kept strictly separate. Adjudicate the unmodified original passages and full-resolution rendered images before opening the sealed key.',
    counts: {
      total_registered_specimens_included: marrowlineSection.publicSpecimens.length + neutralSection.publicSpecimens.length,
      marrowline_total: marrowlineSection.publicSpecimens.length,
      marrowline_completed_available: marrowlineSection.publicSpecimens.filter((x) => x.eligibleForLiteraryAdjudication).length,
      marrowline_failed_or_ineligible: marrowlineSection.publicSpecimens.filter((x) => !x.eligibleForLiteraryAdjudication).length,
      neutral_total: neutralSection.publicSpecimens.length,
      neutral_completed_available: neutralSection.publicSpecimens.filter((x) => x.eligibleForLiteraryAdjudication).length,
      neutral_failed_or_ineligible: neutralSection.publicSpecimens.filter((x) => !x.eligibleForLiteraryAdjudication).length
    },
    marrowline_specimens: marrowlineSection.publicSpecimens,
    neutral_control_specimens: neutralSection.publicSpecimens
  };

  // Render complete human-readable Markdown gallery for first-person Operator reading
  const renderSpecimensMd = (specimens) => specimens.map((sp) => {
    const textBlock = typeof sp.originalPassageVerbatim === 'string' && sp.originalPassageVerbatim.length > 0
      ? ['```text', sp.originalPassageVerbatim, '```'].join('\n')
      : '> *(No unmodified passage available for this specimen; original failure/ineligibility status preserved above.)*';
    return [
      `### ${sp.blindId} — \`${sp.taskKey}\``,
      `- **Status:** \`${sp.availabilityStatus}\``,
      `- **Eligible for Literary Adjudication:** \`${sp.eligibleForLiteraryAdjudication}\``,
      `- **Full-Resolution Desktop Image (\`1440×900\`):** \`${sp.screenshots.desktopFullResPath}\` (\`${sp.screenshots.renderStatus}\`)`,
      `- **Full-Resolution Mobile Image (\`390×844\`):** \`${sp.screenshots.mobileFullResPath}\` (\`${sp.screenshots.renderStatus}\`)`,
      '',
      '**Original Unmodified Unicode Passage (Verbatim):**',
      '',
      textBlock,
      ''
    ].join('\n');
  }).join('\n---\n\n');

  const galleryMarkdown = [
    '# 𝌋 TD613 · Marrowline / Screaming Grove — Option 1 Blinded Literary Reading Gallery',
    '',
    '- **Final Artistic Authority:** Tawanna C. Miller (`HUMAN_ARTISTIC_CLOSURE_RESERVED`)',
    '- **First-Reading Blinding Boundary:** Zero arm labels, zero model labels, zero slot numbers, zero morphology metrics, and zero raw SHA-256 join keys appear in this document.',
    '- **Verbatim Preservation:** Every available passage below is unmodified original Unicode text. Every failed or ineligible return is preserved with its original status.',
    '- **Sealed Unblinding Key:** Held separately at `private-unblinding/OPTION1_SEALED_UNBLINDING_KEY.json` (open only AFTER first-person Operator adjudication).',
    '',
    '---',
    '',
    `## Section A — Marrowline Literary Specimens (${marrowlineSection.publicSpecimens.length} total · ${blindedPacket.counts.marrowline_completed_available} available · ${blindedPacket.counts.marrowline_failed_or_ineligible} failed/ineligible)`,
    '',
    renderSpecimensMd(marrowlineSection.publicSpecimens),
    '---',
    '',
    `## Section B — Neutral Capability Control Specimens (${neutralSection.publicSpecimens.length} total · ${blindedPacket.counts.neutral_completed_available} available · ${blindedPacket.counts.neutral_failed_or_ineligible} failed/ineligible)`,
    '',
    renderSpecimensMd(neutralSection.publicSpecimens)
  ].join('\n');

  const unblindingKey = {
    schema: 'td613.marrowline.option1-sealed-unblinding-key/v2.0',
    study_id: STUDY_ID,
    sealed_until_operator_literary_adjudication: true,
    operator_custody_note: 'Keep this file isolated from the initial blinded reading surface; binds blindId to slot, envelope, requested/observed modelVersion, and raw SSE/text SHA-256 receipts.',
    marrowline: marrowlineSection.privateBindings,
    neutral: neutralSection.privateBindings
  };

  return {
    blindedPacket,
    galleryMarkdown,
    unblindingKey
  };
}

function writeJsonAtomic(filePath, value) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2, 8)}`;
  fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function summarizeTransportError(err) {
  const cause = err?.cause || null;
  return {
    name: err?.name || 'Error',
    message: err?.message || String(err),
    code: err?.code || null,
    causeName: cause?.name || null,
    causeCode: cause?.code || null,
    causeMessage: cause?.message || (cause ? String(cause) : null)
  };
}

function classifyPreHeadersTransportOutcome(err) {
  const info = summarizeTransportError(err);
  if (info.causeCode === 'UND_ERR_HEADERS_TIMEOUT' || /headers timeout/i.test(`${info.message} ${info.causeMessage || ''}`)) {
    return 'HEADERS_TIMEOUT_NO_RESPONSE';
  }
  if (info.name === 'TimeoutError' || info.name === 'AbortError' || info.code === 'ABORT_ERR') {
    return 'TOTAL_SLOT_DEADLINE_TIMEOUT_NO_RESPONSE';
  }
  return 'SOCKET_OR_FETCH_ERROR_NO_RESPONSE';
}

// Read response body incrementally so any genuine partial bytes received before a mid-stream
// socket error are preserved verbatim (never fabricating zero-byte SSE files if 0 bytes arrived).
async function readResponseBodyIncremental(resp) {
  if (resp?.body && typeof resp.body.getReader === 'function') {
    const reader = resp.body.getReader();
    const chunks = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          chunks.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
        }
      }
      return Buffer.concat(chunks);
    } catch (err) {
      const partialBuf = chunks.length > 0 ? Buffer.concat(chunks) : Buffer.alloc(0);
      err.partialBytes = partialBuf;
      throw err;
    }
  }
  try {
    return Buffer.from(await resp.arrayBuffer());
  } catch (err) {
    err.partialBytes = Buffer.alloc(0);
    throw err;
  }
}

// Atomic write-once episode directory reservation (Amari #issuecomment-7084243315).
// Prevents accidental duplicate execution under the same episode ID/directory from ever
// overwriting original provider responses, partial streams, receipts, or literary galleries.
export function claimEpisodeOutputDirectoryWriteOnce({
  outDir,
  episodeId,
  studyId,
  profileId,
  sourceHeadSha,
  operatorAuthSha
}) {
  if (!/^[A-Za-z0-9_-]{2,32}$/.test(String(episodeId || ''))) {
    const err = new Error(`REFUSED_LIVE_EXECUTION: invalid episodeId "${episodeId}".`);
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }
  const resolvedOutDir = path.resolve(outDir);
  const immutableEp1Dir = path.resolve(OUT_DIR, 'live-acquisition');
  if (resolvedOutDir === immutableEp1Dir || String(episodeId).toUpperCase() === 'EP1') {
    const err = new Error('REFUSED_EPISODE1_ARCHIVE_IMMUTABLE: Episode 1 archive (live-acquisition/) is permanently immutable; Episode 2 must write to a separate directory (e.g. live-acquisition-ep2/).');
    err.code = 'REFUSED_EPISODE1_ARCHIVE_IMMUTABLE';
    throw err;
  }

  fs.mkdirSync(path.dirname(resolvedOutDir), { recursive: true });

  if (fs.existsSync(resolvedOutDir)) {
    const stat = fs.statSync(resolvedOutDir);
    if (!stat.isDirectory()) {
      const err = new Error(`REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE: target path exists and is not a directory (${path.basename(resolvedOutDir)}).`);
      err.code = 'REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE';
      throw err;
    }
    const existingEntries = fs.readdirSync(resolvedOutDir);
    if (existingEntries.length > 0) {
      const err = new Error(`REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE: output directory "${path.basename(resolvedOutDir)}" already contains prior episode artifacts (${existingEntries.slice(0, 5).join(', ')}); single first-return acquisition per episode forbids overwrite, rename, or silent resume.`);
      err.code = 'REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE';
      throw err;
    }
  } else {
    try {
      // Atomic non-recursive creation on the final episode directory path
      fs.mkdirSync(resolvedOutDir);
    } catch (mkdirErr) {
      if (mkdirErr?.code === 'EEXIST') {
        const err = new Error(`REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE: concurrent atomic directory claim conflict on "${path.basename(resolvedOutDir)}".`);
        err.code = 'REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE';
        throw err;
      }
      throw mkdirErr;
    }
  }

  const claimLockPath = path.join(resolvedOutDir, 'EPISODE_CLAIM_LOCK.json');
  const claimRecord = {
    schema: 'td613.marrowline.option1-episode-write-once-claim/v1.0',
    episode_id: episodeId,
    study_id: studyId,
    design_profile: profileId,
    source_head_sha: sourceHeadSha,
    operator_auth_sha: operatorAuthSha,
    claimed_at_utc: new Date().toISOString(),
    pid: process.pid,
    write_once_contract: 'SINGLE_FIRST_RETURN_ACQUISITION_PER_EPISODE_NO_OVERWRITE_OR_SILENT_RESUME'
  };
  try {
    // OS-level O_CREAT | O_EXCL exclusive atomic claim file
    fs.writeFileSync(claimLockPath, JSON.stringify(claimRecord, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
  } catch (lockErr) {
    if (lockErr?.code === 'EEXIST') {
      const err = new Error(`REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE: EPISODE_CLAIM_LOCK.json already exists in "${path.basename(resolvedOutDir)}"; duplicate execution refused before any provider call.`);
      err.code = 'REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE';
      throw err;
    }
    throw lockErr;
  }

  return { resolvedOutDir, claimLockPath, claimRecord };
}

export async function executeOption1Run({
  profileId = DEFAULT_DESIGN_PROFILE,
  episodeId = EPISODE2_ID,
  studyId = EPISODE2_STUDY_ID,
  sourceHeadSha,
  operatorAuthSha,
  apiKey,
  fetchImpl = globalThis.fetch,
  outDir = path.join(OUT_DIR, 'live-acquisition-ep2'),
  maxCalls = HARD_MAX_CALLS,
  stop3Threshold = STOP_3_CONSECUTIVE_TRANSPORT_THRESHOLD,
  transportPolicy = OPTION1_TRANSPORT_DEADLINE_POLICY
} = {}) {
  const profile = DESIGN_PROFILES[profileId];
  if (!profile) {
    const err = new Error(`REFUSED_LIVE_EXECUTION: unknown design profile ${profileId}`);
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }
  if (!profile.liveExecutionPermitted) {
    const err = new Error(`REFUSED_MODEL_IDENTITY_BLOCKED_3_7_ALIAS_TO_3_8: ${profile.blockingReason}`);
    err.code = 'REFUSED_MODEL_IDENTITY_BLOCKED_3_7_ALIAS_TO_3_8';
    throw err;
  }
  // Never allow Episode 2 (or any subsequent run) to overwrite immutable Episode 1 archive!
  const immutableEp1Dir = path.resolve(OUT_DIR, 'live-acquisition');
  if (path.resolve(outDir) === immutableEp1Dir || String(episodeId).toUpperCase() === 'EP1') {
    const err = new Error('REFUSED_EPISODE1_ARCHIVE_IMMUTABLE: Episode 1 archive (live-acquisition/) is permanently immutable; Episode 2 must write to a separate directory (e.g. live-acquisition-ep2/).');
    err.code = 'REFUSED_EPISODE1_ARCHIVE_IMMUTABLE';
    throw err;
  }
  if (!/^[0-9a-f]{40}$/i.test(String(sourceHeadSha || '')) || !/^[0-9a-f]{40}$/i.test(String(operatorAuthSha || ''))) {
    const err = new Error('REFUSED_LIVE_EXECUTION: exact 40-hex --operator-auth-sha matching source HEAD is mandatory.');
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }
  if (String(sourceHeadSha).toLowerCase() !== String(operatorAuthSha).toLowerCase()) {
    const err = new Error(`REFUSED_LIVE_EXECUTION: --operator-auth-sha (${operatorAuthSha}) !== source HEAD (${sourceHeadSha}).`);
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }
  if (!apiKey) {
    const err = new Error('REFUSED_LIVE_EXECUTION: missing GEMINI_API_KEY / GOOGLE_API_KEY.');
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }
  if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > HARD_MAX_CALLS) {
    const err = new Error(`REFUSED_LIVE_EXECUTION: maxCalls=${maxCalls} must be integer in [1, ${HARD_MAX_CALLS}].`);
    err.code = 'REFUSED_LIVE_EXECUTION';
    throw err;
  }

  const schedule = buildOption1Schedule(profileId);
  const assembled = [];
  for (const s of schedule) {
    assembled.push(await buildOption1SlotRequest(s));
  }
  const eq = assertOption1RequestEquivalence(assembled, { profileId });
  if (!eq.ok) {
    const err = new Error(`PREFLIGHT_DRIFT_HALT: ${eq.violations.join('; ')}`);
    err.code = 'PREFLIGHT_DRIFT_HALT';
    throw err;
  }

  // Atomically reserve the write-once episode output directory BEFORE creating subdirs or calling fetchImpl
  claimEpisodeOutputDirectoryWriteOnce({
    outDir,
    episodeId,
    studyId,
    profileId,
    sourceHeadSha,
    operatorAuthSha
  });
  const rawSseDir = path.join(outDir, 'raw-sse');
  const rawTextDir = path.join(outDir, 'raw-text');
  const rawPartialDir = path.join(outDir, 'raw-partial');
  fs.mkdirSync(rawSseDir, { recursive: true });
  fs.mkdirSync(rawTextDir, { recursive: true });
  fs.mkdirSync(rawPartialDir, { recursive: true });

  const plannedCount = Math.min(maxCalls, assembled.length);
  const startedRunAt = new Date().toISOString();
  const results = [];
  let callsExecuted = 0;
  let consecutiveTransportFailures = 0;
  let stopTriggered = null;
  let terminalError = null;
  let status = 'IN_PROGRESS';
  let blindedGalleryStatus = 'PENDING_RUN_COMPLETION';

  const receiptPath = path.join(outDir, 'OPTION1_LIVE_ACQUISITION_RECEIPT.json');
  const buildUnattemptedList = () => {
    const attemptedSlots = new Set(results.map((r) => r.slot));
    const reason = stopTriggered
      ? `UNATTEMPTED_DUE_TO_${stopTriggered}`
      : (status === 'IN_PROGRESS' ? 'PENDING' : 'UNATTEMPTED');
    return assembled.slice(0, plannedCount)
      .filter((a) => !attemptedSlots.has(a.slotSpec.slot))
      .map((a) => ({
        slot: a.slotSpec.slot,
        slotIndex: a.slotSpec.slotIndex,
        block: a.slotSpec.block,
        replicate: a.slotSpec.replicate,
        slotClass: a.slotSpec.slotClass,
        envelope: a.slotSpec.envelope,
        model: a.slotSpec.model,
        taskKey: a.slotSpec.taskKey,
        bodySha256: a.wire.observation.bodySha256,
        modelAndBodySha256: a.wire.observation.modelAndBodySha256,
        status: reason
      }));
  };

  const buildSnapshot = () => {
    const unattempted = buildUnattemptedList();
    return {
      schema: 'td613.marrowline.option1-live-acquisition-receipt/v2.0',
      study_id: studyId,
      episode_id: episodeId,
      study_class: STUDY_CLASS,
      design_profile: profileId,
      source_head_sha: sourceHeadSha,
      operator_auth_sha: operatorAuthSha,
      episode1_immutable_reference: EPISODE1_IMMUTABLE_ARCHIVE,
      transport_deadline_policy: transportPolicy,
      stop_3_consecutive_transport_threshold: stop3Threshold,
      started_at_utc: startedRunAt,
      updated_at_utc: new Date().toISOString(),
      status,
      stop_triggered: stopTriggered,
      terminal_error: terminalError,
      blinded_gallery_status: blindedGalleryStatus,
      calls_planned: plannedCount,
      calls_executed: callsExecuted,
      calls_unattempted: unattempted.length,
      consecutive_transport_failures_at_exit: consecutiveTransportFailures,
      retry_count: 0,
      fallback_seats: [],
      structural_repair: false,
      morphology_chase: false,
      multi_seat_morphology_selector: false,
      q1_backfill_permitted: false,
      episode1_pooling_permitted: false,
      financial_ceiling: 'NONE',
      aggregate_token_ceiling: 'NONE',
      summary: {
        completed_stop: results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.COMPLETED_STOP).length,
        transport_failure: results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.TRANSPORT_FAILURE).length,
        headers_timeout_no_response: results.filter((r) => r.transportOutcome === 'HEADERS_TIMEOUT_NO_RESPONSE').length,
        body_read_interrupted: results.filter((r) => String(r.transportOutcome || '').startsWith('BODY_READ_')).length,
        http_503_unavailable: results.filter((r) => r.httpStatus === 503).length,
        http_400_config_rejected: results.filter((r) => r.httpStatus === 400).length,
        policy_terminated: results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.POLICY_TERMINATED).length,
        incomplete_nonstop: results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.INCOMPLETE_NONSTOP).length,
        unwitnessed_completion: results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.UNWITNESSED_COMPLETION).length,
        malformed_sse: results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE).length,
        model_identity_mismatch: results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.MODEL_IDENTITY_MISMATCH).length
      },
      attempted_registered_slots: results.map((r) => ({
        slot: r.slot,
        slotIndex: r.slotIndex,
        envelope: r.envelope,
        modelRequested: r.modelRequested,
        taskKey: r.taskKey,
        outcomeClass: r.outcomeClass,
        transportOutcome: r.transportOutcome || null
      })),
      unattempted_registered_slots: unattempted,
      slots: results
    };
  };
  const persist = () => writeJsonAtomic(receiptPath, buildSnapshot());

  try {
    for (let i = 0; i < plannedCount; i++) {
      const item = assembled[i];
      const s = item.slotSpec;
      const sendStartedMs = Date.now();
      const sendStartedAtUtc = new Date(sendStartedMs).toISOString();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(s.model)}:streamGenerateContent?alt=sse`;
      callsExecuted++;

      // REQUIREMENT 1: Atomic pre-send attempted-slot receipt BEFORE calling fetchImpl!
      // A thrown fetch can NEVER leave a misleading calls_executed=1 with slots=[].
      const slotIdx = results.length;
      results.push({
        episodeId,
        studyId,
        slot: s.slot,
        slotIndex: s.slotIndex,
        block: s.block,
        replicate: s.replicate,
        slotClass: s.slotClass,
        envelope: s.envelope,
        taskKey: s.taskKey,
        modelRequested: s.model,
        modelVersion: null,
        sourceHeadSha,
        requestDigests: item.wire.observation,
        httpStatus: null,
        outcomeClass: 'IN_FLIGHT_PRE_SEND',
        eligibleArtisticSpecimen: false,
        transportOutcome: 'PENDING_PRE_SEND',
        transportError: null,
        rawBytesCaptured: 0,
        rawSsePath: null,
        rawSseSha256: null,
        rawPartialPath: null,
        rawPartialSha256: null,
        rawTextPath: null,
        rawTextSha256: null,
        sendStartedAtUtc,
        responseHeadersReceivedAtUtc: null,
        completedAtUtc: null,
        elapsedMs: null
      });
      persist();

      // REQUIREMENT 2A: Per-slot try/catch around fetchImpl() (pre-headers socket/timeout errors)
      let resp;
      try {
        const fetchOpts = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-goog-api-key': apiKey
          },
          body: item.wire.body
        };
        if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' && Number.isFinite(transportPolicy?.total_slot_deadline_ms)) {
          fetchOpts.signal = AbortSignal.timeout(transportPolicy.total_slot_deadline_ms);
        }
        resp = await fetchImpl(url, fetchOpts);
      } catch (fetchErr) {
        const completedMs = Date.now();
        const transportOutcome = classifyPreHeadersTransportOutcome(fetchErr);
        const transportError = summarizeTransportError(fetchErr);
        results[slotIdx] = {
          ...results[slotIdx],
          outcomeClass: OUTCOME_CLASSES.TRANSPORT_FAILURE,
          eligibleArtisticSpecimen: false,
          classificationReason: `${transportOutcome}: ${transportError.causeCode || transportError.code || transportError.name}`,
          transportOutcome,
          transportError,
          rawBytesCaptured: 0,
          rawSsePath: null,
          rawSseSha256: null,
          completedAtUtc: new Date(completedMs).toISOString(),
          elapsedMs: completedMs - sendStartedMs,
          upstreamExecutionBillingNote: 'PRE_HEADERS_TRANSPORT_FAILURE_UPSTREAM_PROCESSING_AND_BILLING_UNKNOWN'
        };
        consecutiveTransportFailures++;
        if (consecutiveTransportFailures >= stop3Threshold) {
          stopTriggered = 'STOP_3_CONSECUTIVE_TRANSPORT_FAILURES';
          persist();
          break;
        }
        persist();
        continue;
      }

      const responseHeadersReceivedAtUtc = new Date().toISOString();
      results[slotIdx] = {
        ...results[slotIdx],
        httpStatus: resp.status,
        responseHeadersReceivedAtUtc,
        transportOutcome: 'HEADERS_RECEIVED_READING_BODY'
      };
      persist();

      // REQUIREMENT 2B: Per-slot try/catch around incremental streaming body read
      let rawBuf;
      try {
        rawBuf = await readResponseBodyIncremental(resp);
      } catch (bodyErr) {
        const completedMs = Date.now();
        const partialBuf = Buffer.isBuffer(bodyErr?.partialBytes) ? bodyErr.partialBytes : Buffer.alloc(0);
        const transportError = summarizeTransportError(bodyErr);
        let rawPartialRel = null;
        let rawPartialSha256 = null;
        let transportOutcome = 'BODY_READ_ERROR_ZERO_BYTES_CAPTURED';
        if (partialBuf.length > 0) {
          const partialAbs = path.join(rawPartialDir, `${s.slot}.partial.sse`);
          fs.writeFileSync(partialAbs, partialBuf);
          rawPartialRel = path.relative(outDir, partialAbs).replace(/\\/g, '/');
          rawPartialSha256 = sha256Buf(partialBuf);
          transportOutcome = 'BODY_READ_INTERRUPTED_PARTIAL_BYTES_PRESERVED';
        }
        results[slotIdx] = {
          ...results[slotIdx],
          outcomeClass: OUTCOME_CLASSES.TRANSPORT_FAILURE,
          eligibleArtisticSpecimen: false,
          classificationReason: `${transportOutcome}: ${transportError.causeCode || transportError.code || transportError.message}`,
          transportOutcome,
          transportError,
          rawBytesCaptured: partialBuf.length,
          rawSsePath: null,
          rawSseSha256: null,
          rawPartialPath: rawPartialRel,
          rawPartialSha256,
          completedAtUtc: new Date(completedMs).toISOString(),
          elapsedMs: completedMs - sendStartedMs
        };
        consecutiveTransportFailures++;
        if (consecutiveTransportFailures >= stop3Threshold) {
          stopTriggered = 'STOP_3_CONSECUTIVE_TRANSPORT_FAILURES';
          persist();
          break;
        }
        persist();
        continue;
      }

      const rawSsePath = path.join(rawSseDir, `${s.slot}.sse`);
      fs.writeFileSync(rawSsePath, rawBuf);
      const rawSseRel = path.relative(outDir, rawSsePath).replace(/\\/g, '/');
      const rawSseSha256 = sha256Buf(rawBuf);

      // Fail-closed HTTP 400 config rejection guard (hard STOP precedence, NEVER silently downgrade!)
      if (resp.status === 400) {
        const completedMs = Date.now();
        results[slotIdx] = {
          ...results[slotIdx],
          httpStatus: 400,
          outcomeClass: 'CONFIG_REJECTED_HTTP_400',
          eligibleArtisticSpecimen: false,
          classificationReason: 'HTTP_400_CONFIG_OR_THINKING_LEVEL_REJECTED_ZERO_SILENT_DOWNGRADE',
          transportOutcome: 'HTTP_400_CONFIG_REJECTED',
          rawBytesCaptured: rawBuf.length,
          rawSsePath: rawSseRel,
          rawSseSha256,
          rawSseBytes: rawBuf.length,
          completedAtUtc: new Date(completedMs).toISOString(),
          elapsedMs: completedMs - sendStartedMs
        };
        stopTriggered = 'STOP_HTTP_400_CONFIG_REJECTED';
        persist();
        break;
      }

      // Preserve non-200 transport errors (e.g. 503, 429, 502, 504) verbatim with zero retries + STOP_3 tracking
      if (!resp.ok) {
        const completedMs = Date.now();
        results[slotIdx] = {
          ...results[slotIdx],
          httpStatus: resp.status,
          outcomeClass: OUTCOME_CLASSES.TRANSPORT_FAILURE,
          eligibleArtisticSpecimen: false,
          classificationReason: `UNRETRIED_HTTP_${resp.status}`,
          transportOutcome: `HTTP_${resp.status}_TRANSPORT_UNAVAILABLE`,
          rawBytesCaptured: rawBuf.length,
          rawSsePath: rawSseRel,
          rawSseSha256,
          rawSseBytes: rawBuf.length,
          completedAtUtc: new Date(completedMs).toISOString(),
          elapsedMs: completedMs - sendStartedMs
        };
        consecutiveTransportFailures++;
        if (consecutiveTransportFailures >= stop3Threshold) {
          stopTriggered = 'STOP_3_CONSECUTIVE_TRANSPORT_FAILURES';
          persist();
          break;
        }
        persist();
        continue;
      }

      // HTTP 200 stream body successfully transported -> reset consecutive transport failure counter!
      consecutiveTransportFailures = 0;

      const sseIntegrity = await verifySseIntegrity(rawBuf);
      const canonicalPayload = sseIntegrity.canonicalMergedPayload || {};
      const canonicalText = sseIntegrity.canonicalText || '';
      const rawTextPath = path.join(rawTextDir, `${s.slot}.txt`);
      fs.writeFileSync(rawTextPath, canonicalText, 'utf8');
      const rawTextSha256 = sha256Text(canonicalText);

      const observed = observeGeminiOutput(canonicalPayload, s.model, {
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
        creative: item.upstreamAperture.discourseMode === 'CREATIVE'
      });

      const outcome = classifySlotOutcome({
        httpStatus: resp.status,
        sseIntegrity,
        observedOutput: observed,
        completionState: completion,
        pinnedModel: s.model
      });

      const wholeTextMorphology = observeWholeTextUnicodeMorphology(canonicalText);
      let marrowlineMetrics = null;
      if (s.slotClass === 'MARROWLINE_2X2_CELL') {
        const botsExtraction = extractBotsMovementFromCanonicalText(canonicalText);
        marrowlineMetrics = {
          authorshipObservation: observeMarrowlineAuthorship(canonicalText, 'first-provider-return'),
          botsExtractionStatus: botsExtraction.status,
          botsMovementAvailable: botsExtraction.botsMovementAvailable,
          botsExtractionMode: botsExtraction.extractionMode,
          khonapolitHeadingPresent: botsExtraction.khonapolitHeadingPresent,
          botsHeadingPresent: botsExtraction.botsHeadingPresent,
          botsExtractionReason: botsExtraction.reason,
          botsProsodyDistribution: botsExtraction.botsProsodyDistribution,
          botsBodyUnicodeMorphology: botsExtraction.botsBodyUnicodeMorphology,
          relayAdmissionBotsMovement: botsExtraction.relayAdmissionBotsMovement,
          relayAdmissionReasons: botsExtraction.relayAdmissionReasons
        };
      }

      const completedMs = Date.now();
      results[slotIdx] = {
        ...results[slotIdx],
        modelVersion: observed.modelVersion || null,
        modelIdentityCheck: isExpectedPinnedModelVersion(observed.modelVersion, s.model),
        httpStatus: resp.status,
        finishReason: observed.finishReason || null,
        finishMessage: observed.finishMessage || null,
        promptBlockReason: observed.promptBlockReason || null,
        usageMetadata: observed.usage,
        outcomeClass: outcome.outcomeClass,
        eligibleArtisticSpecimen: outcome.eligibleArtisticSpecimen,
        classificationReason: outcome.reason,
        transportOutcome: 'HTTP_200_STREAM_RECEIVED',
        rawBytesCaptured: rawBuf.length,
        rawSsePath: rawSseRel,
        rawSseSha256,
        rawSseBytes: rawBuf.length,
        rawTextPath: path.relative(outDir, rawTextPath).replace(/\\/g, '/'),
        rawTextSha256,
        rawTextUtf8Bytes: Buffer.byteLength(canonicalText, 'utf8'),
        sseIntegrity: {
          ok: sseIntegrity.ok,
          failureCode: sseIntegrity.failureCode,
          utf8Valid: sseIntegrity.utf8Valid,
          textEquivalent: sseIntegrity.textEquivalent,
          eventCountMatch: sseIntegrity.eventCountMatch,
          finishReasonEquivalent: sseIntegrity.finishReasonEquivalent,
          modelVersionEquivalent: sseIntegrity.modelVersionEquivalent,
          canonicalTextSha256: sseIntegrity.canonicalTextSha256,
          independentTextSha256: sseIntegrity.independentTextSha256,
          malformedReasons: sseIntegrity.malformedReasons,
          mismatchReasons: sseIntegrity.mismatchReasons
        },
        wholeTextUnicodeMorphology: wholeTextMorphology,
        marrowlineMetrics,
        completedAtUtc: new Date(completedMs).toISOString(),
        elapsedMs: completedMs - sendStartedMs
      };

      if (outcome.stopCode) {
        stopTriggered = outcome.stopCode;
        persist();
        break;
      }
      persist();
    }

    status = stopTriggered ? 'HALTED_BY_STOP_RULE' : 'COMPLETED_REGISTERED_SLOTS';
    const recoverableSpecimens = results.filter((r) => r.outcomeClass === OUTCOME_CLASSES.COMPLETED_STOP);
    if (recoverableSpecimens.length > 0) {
      const { blindedPacket, galleryMarkdown, unblindingKey } = generateBlindedReviewPacket(results, {
        outDir,
        seedSalt: studyId
      });
      const privateUnblindingDir = path.join(outDir, 'private-unblinding');
      fs.mkdirSync(privateUnblindingDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'OPTION1_BLINDED_LITERARY_GALLERY.md'), galleryMarkdown, 'utf8');
      fs.writeFileSync(path.join(outDir, 'OPTION1_BLINDED_LITERARY_GALLERY.json'), JSON.stringify(blindedPacket, null, 2) + '\n', 'utf8');
      fs.writeFileSync(path.join(privateUnblindingDir, 'OPTION1_SEALED_UNBLINDING_KEY.json'), JSON.stringify(unblindingKey, null, 2) + '\n', 'utf8');
      blindedGalleryStatus = 'GENERATED_PENDING_CHROME_VISUAL_WITNESS';
    } else {
      blindedGalleryStatus = 'NOT_GENERATED_ZERO_RECOVERABLE_SPECIMENS';
    }
  } catch (err) {
    terminalError = err?.message || String(err);
    if (!stopTriggered) stopTriggered = 'FATAL_HARNESS_EXCEPTION';
    status = 'FAILED_WITH_TERMINAL_ERROR';
    blindedGalleryStatus = 'NOT_GENERATED_FATAL_EXCEPTION';
    throw err;
  } finally {
    persist();
  }

  return buildSnapshot();
}

async function main() {
  const args = process.argv.slice(2);
  const executeLive = args.includes('--execute-live');
  const profileId = args.find((a) => a.startsWith('--design-profile='))?.split('=')[1] || DEFAULT_DESIGN_PROFILE;
  const episodeId = args.find((a) => a.startsWith('--episode-id='))?.split('=')[1] || EPISODE2_ID;
  const authSha = args.find((a) => a.startsWith('--operator-auth-sha='))?.split('=')[1] || null;
  const maxCalls = Number(args.find((a) => a.startsWith('--max-calls='))?.split('=')[1] || HARD_MAX_CALLS);

  if (!executeLive) {
    // Fail-closed zero-network lock during dry-run preflight
    globalThis.fetch = async (u) => {
      throw new Error(`ZERO_NETWORK_VIOLATION_IN_OPTION1_DRY_RUN: attempted fetch(${String(u)})`);
    };
    const report = await buildOption1PreflightReport({ profileId });
    const outPath = path.join(OUT_DIR, 'OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify({
      ok: report.request_equivalence_verified.ok,
      mode: report.execution_mode,
      profile: profileId,
      paid_generation_calls_executed: 0,
      parent_or_construction_head_sha: report.git_head_provenance.parent_or_construction_head_sha,
      qualified_executable_head_sha: report.git_head_provenance.qualified_executable_head_sha,
      slots: report.slot_schedule.length,
      marrowline_slots: report.request_equivalence_verified.marrowlineSlots,
      neutral_slots: report.request_equivalence_verified.neutralSlots,
      palindromic_mean_slot_index: report.request_equivalence_verified.palindromicMeanSlotIndex,
      model_identity_gate: report.model_identity_gate.amari_rule1_verdict,
      output_written: path.relative(REPO_ROOT, outPath).replace(/\\/g, '/')
    }, null, 2));
    if (!report.request_equivalence_verified.ok) process.exit(1);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  try {
    const receipt = await executeOption1Run({
      profileId,
      episodeId,
      studyId: episodeId === EPISODE2_ID ? EPISODE2_STUDY_ID : `${STUDY_ID}-${episodeId}`,
      sourceHeadSha: getGitHeadSha(),
      operatorAuthSha: authSha,
      apiKey,
      outDir: path.join(OUT_DIR, `live-acquisition-${String(episodeId).toLowerCase()}`),
      maxCalls
    });
    console.log(JSON.stringify({
      ok: receipt.status === 'COMPLETED_REGISTERED_SLOTS',
      episode_id: receipt.episode_id,
      status: receipt.status,
      calls_executed: receipt.calls_executed,
      calls_unattempted: receipt.calls_unattempted,
      stop_triggered: receipt.stop_triggered,
      blinded_gallery_status: receipt.blinded_gallery_status,
      summary: receipt.summary
    }, null, 2));
    if (receipt.status !== 'COMPLETED_REGISTERED_SLOTS') process.exit(3);
  } catch (err) {
    if (
      err?.code === 'REFUSED_LIVE_EXECUTION'
      || err?.code === 'REFUSED_MODEL_IDENTITY_BLOCKED_3_7_ALIAS_TO_3_8'
      || err?.code === 'REFUSED_EPISODE1_ARCHIVE_IMMUTABLE'
      || err?.code === 'REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE'
    ) {
      console.error(err.message);
      process.exit(2);
    }
    throw err;
  }
}

const isCliEntry = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isCliEntry) {
  main().catch((err) => {
    console.error('OPTION1_HARNESS_ERROR:', err);
    process.exit(1);
  });
}
