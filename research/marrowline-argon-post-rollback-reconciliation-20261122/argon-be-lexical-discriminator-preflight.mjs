// TD613 · Marrowline / Screaming Grove — Argon Successor Commission Preflight
// Commission: TD613-MARROWLINE-ARGON-REDPEN-CLOSURE-20261122
// Covenant: Khona‌lit-po · Seal: ⟐SAC[X6ZNK5NO51]
// Paid Gemini calls authorized or executed by this module: 0 (fail-closed)

import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../../app/engine/aperture-v3-task-intent.js';
import {
  MARROWLINE_HISTORICAL_TRIAL_ID,
  MARROWLINE_RESTORED_PROSODY_PROFILE,
  MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE,
  MARROWLINE_VERTICAL_UNPRIMED_CANDIDATE_PROFILE,
  MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE
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
  geminiRequestHeaders,
  geminiStreamGenerateContentUrl
} from '../../server/gemini-provider-transport.js';
import {
  observeMarrowlineCompletion
} from '../../server/marrowline-completion.js';
import {
  parseRelayEnvelope
} from '../../app/dome-world/khonapolit-relay.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

export const CANONICAL_EXPERIMENT_TASKS = Object.freeze({
  T1_BLUE_ORANGE_WEATHER: Object.freeze({
    id: 'T1_BLUE_ORANGE_WEATHER',
    historicalOct02DiscourseMode: 'TECHNICAL_RUNTIME',
    historicalOct02PrimaryRoute: 'RUNTIME_DIAGNOSIS',
    repairedApertureDiscourseMode: 'CREATIVE',
    repairedAperturePrimaryRoute: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
    prompt: 'A blue–orange storm blooms across a wholly fictional Dome-World visualization. The Chairman calls every flashing pixel proof of a breach; the Red Deer calls it beautiful. Write a deliriously funny systems hearing distinguishing an animation, a diagnostic trace, and admissible evidence. No cyberattack instructions; let digital chaos remain theatrical.'
  }),
  T2_FORENSIC: Object.freeze({
    id: 'T2_FORENSIC',
    historicalOct02DiscourseMode: 'GENERAL',
    historicalOct02PrimaryRoute: 'REQUESTED_SYNTHESIS',
    repairedApertureDiscourseMode: 'GENERAL',
    repairedAperturePrimaryRoute: 'REQUESTED_SYNTHESIS',
    prompt: 'A fictional research council possesses a perfectly hashed and chronologically continuous audit log. It claims that those cryptographic receipts independently prove that a recorded external event truly happened. Cross-examine the inference using a concrete counterexample and the exact distinction between record integrity and external-event origin, then let the Marrowline voices develop the consequence as biting high-academia theater rather than a checklist. Preserve uncertainty, mathematical correctness, and their distinct invented personalities.'
  }),
  T3_FARCE: Object.freeze({
    id: 'T3_FARCE',
    historicalOct02DiscourseMode: 'LEGAL',
    historicalOct02PrimaryRoute: 'LEGAL_SYNTHESIS',
    repairedApertureDiscourseMode: 'CREATIVE',
    repairedAperturePrimaryRoute: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
    prompt: 'In a fictional town hall, the Registrar of Missing Forms announces a lavish victory gala because her audit counted every returned form. A missing form acquires legal personhood, petitions for a seat in the orchestra, and exposes what the Registrar omitted. Develop the consequences as a proper escalating theatrical farce, with the two Marrowline voices doing their own work. Give the Registrar a serious opposing argument; make the absurdity arise from the arithmetic. Let the writing make its own artistic decisions.'
  })
});

// RP-04: Explicit causal and provenance record for the October 20 D1/D2
// 16-slot factor ladder (#39367182083) and historical Oct 2 wire distinction.
export const OCTOBER_20_D1_D2_CAUSAL_PROVENANCE_RECORD = Object.freeze({
  experimentRunId: '39367182083',
  experimentDate: '2026-10-20',
  model: 'gemini-3.8-flash',
  thinkingLevel: 'medium',
  totalSlots: 16,
  replicatedObservation: Object.freeze({
    d1ImmediateZalgoMultiStackShare: 0.7687,
    namedAndD2AfterUnmarkedFirstMovementMultiStackShare: 0,
    namedAndD2TotalCombiningMarksObserved: 4532,
    namedAndD2MultiStackedBasesObserved: 0
  }),
  inferenceBoundary: 'replicated-finite-episode-association-not-uniquely-isolated-single-cause',
  explicitConfoundLimitations: Object.freeze([
    'heading-and-section-structure-confound: D1 authored a single movement from token 1 whereas SECTION/NAMED/D2 required two standalone movement headings (Kʰonapolit then Tauric Diana bots) and an earned inter-voice handoff.',
    'additional-prompt-constraint-confound: covenant framing, anti-recitation constraints, and task-specific analytical obligations covaried with the two-voice relay envelope.',
    'provider-variability-confound: stochastic generation and upstream hosted-model serving state across finite 16-slot episodes remain non-deterministic.'
  ]),
  wireLineageDistinction: Object.freeze({
    historicalOct02Commit: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
    postRollbackMainCommit: 'b8d986a7692501ba9f41da9c041a8ddb5836a190',
    note: 'Historical Oct 2 (ffb98ac005) and post-rollback main (b8d986a76) classified T1_BLUE_ORANGE_WEATHER as TECHNICAL_RUNTIME (RUNTIME_DIAGNOSIS) and T3_FARCE as LEGAL (LEGAL_SYNTHESIS). Repaired Aperture routing in PR #1776 classifies both T1 and T3 as CREATIVE (OPEN_FIELD_CREATIVE_SYNTHESIS), changing their systemInstructionSha256 and bodySha256 while leaving T2_FORENSIC (GENERAL / REQUESTED_SYNTHESIS) byte-identical to ffb98ac005.'
  })
});

export const ARGON_EXPERIMENT_BUDGET_PROFILES = Object.freeze({
  STAGE1_TWO_CALL_DISCRIMINATOR: Object.freeze({
    stageId: 'STAGE1_TWO_CALL_DISCRIMINATOR',
    model: 'gemini-4-argon',
    maxCalls: 2,
    perSlotMaxOutputTokens: 16384,
    guaranteedAggregateOutputAndThoughtCeiling: 32768,
    outputBoundClass: 'HARD_REQUEST_GENERATION_CONFIG_AND_PRECALL_CAP',
    guaranteedPerSlotMaxRequestUtf8Bytes: 36000,
    guaranteedAggregateRequestUtf8BytesCeiling: 72000,
    requestByteBoundClass: 'HARD_OFFLINE_DETERMINISTIC_WIRE_BYTE_CAP',
    tokenizerIndependentMathematicalPromptTokenUpperBoundPerSlot: 36000,
    perSlotHardPromptTokenCeiling: 8000,
    planningSlotPromptTokenAllowance: 8000,
    worstCaseSlotPromptTokens: 8000,
    planningAggregatePromptTokenAllowance: 16000,
    planningAggregateTotalTokenAllowance: 48768,
    promptBoundClass: 'EMPIRICAL_PLANNING_ALLOWANCE_ENFORCED_BY_PRE_DISPATCH_COUNT_TOKENS_AND_POST_SLOT_USAGE_GATE',
    slotOrder: Object.freeze([
      Object.freeze({ slot: 'S01', arm: 'ARM_B_LITERAL_OCT02', task: 'T1_BLUE_ORANGE_WEATHER' }),
      Object.freeze({ slot: 'S02', arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B', task: 'T1_BLUE_ORANGE_WEATHER' })
    ])
  }),
  STAGE2_FOUR_CALL_REPLICATION: Object.freeze({
    stageId: 'STAGE2_FOUR_CALL_REPLICATION',
    model: 'gemini-4-argon',
    maxCalls: 4,
    perSlotMaxOutputTokens: 10000,
    guaranteedAggregateOutputAndThoughtCeiling: 40000,
    outputBoundClass: 'HARD_REQUEST_GENERATION_CONFIG_AND_PRECALL_CAP',
    guaranteedPerSlotMaxRequestUtf8Bytes: 36000,
    guaranteedAggregateRequestUtf8BytesCeiling: 144000,
    requestByteBoundClass: 'HARD_OFFLINE_DETERMINISTIC_WIRE_BYTE_CAP',
    tokenizerIndependentMathematicalPromptTokenUpperBoundPerSlot: 36000,
    perSlotHardPromptTokenCeiling: 8000,
    planningSlotPromptTokenAllowance: 8000,
    worstCaseSlotPromptTokens: 8000,
    planningAggregatePromptTokenAllowance: 32000,
    planningAggregateTotalTokenAllowance: 72000,
    promptBoundClass: 'EMPIRICAL_PLANNING_ALLOWANCE_ENFORCED_BY_PRE_DISPATCH_COUNT_TOKENS_AND_POST_SLOT_USAGE_GATE',
    requiresSeparateHumanAuthorization: true,
    slotOrder: Object.freeze([
      Object.freeze({ slot: 'S01', arm: 'ARM_B_LITERAL_OCT02', task: 'T1_BLUE_ORANGE_WEATHER' }),
      Object.freeze({ slot: 'S02', arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B', task: 'T1_BLUE_ORANGE_WEATHER' }),
      Object.freeze({ slot: 'S03', arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B', task: 'T2_FORENSIC' }),
      Object.freeze({ slot: 'S04', arm: 'ARM_B_LITERAL_OCT02', task: 'T2_FORENSIC' })
    ])
  })
});

export const FROZEN_STAGE1_SLOT_WIRE_MANIFEST = Object.freeze({
  S01: Object.freeze({
    slot: 'S01',
    arm: 'ARM_B_LITERAL_OCT02',
    profileId: MARROWLINE_RESTORED_PROSODY_PROFILE,
    taskId: 'T1_BLUE_ORANGE_WEATHER',
    model: 'gemini-4-argon',
    maxOutputTokens: 16384,
    bodySha256: 'ffffef6c6cd08bb5ffdef76c100e35a7fc6d317354deaba6e87ca30f2af62eb5',
    modelAndBodySha256: '9e81c8a1021396a396c522d3ef47ffb4395ccedef2995589f992a242e20428a5',
    systemInstructionSha256: '196c533d4fbed6f33dc3b1f6ea8877799c9ffa854af7fd41f928c4c1028be0aa',
    contentsSha256: 'ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e',
    generationConfigSha256: '38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c',
    utf8Bytes: 33248
  }),
  S02: Object.freeze({
    slot: 'S02',
    arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B',
    profileId: MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE,
    taskId: 'T1_BLUE_ORANGE_WEATHER',
    model: 'gemini-4-argon',
    maxOutputTokens: 16384,
    bodySha256: '3c93e5bce0cc7b2a0b66cf5b13148751e9a4b4ef7a39a19026b65b9067e3e30b',
    modelAndBodySha256: 'b50a1dbe4cd6c6b10fab0ea9d5d550b77d3072873ada104cd9b50a2a804ecf42',
    systemInstructionSha256: 'a2eb3697a9c0494be72936ed667de7ece306669bf5fcb2652831ef0bad8af756',
    contentsSha256: 'ba8299461d728933a28c53659176cdbee2fa963f369b2261b739769cc639e40e',
    generationConfigSha256: '38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c',
    utf8Bytes: 33078
  })
});

export function geminiCountTokensUrl(model = '') {
  const normalized = String(model || '').replace(/^models\//, '');
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalized)}:countTokens`;
}

// B-01: Build the documented Gemini API CountTokensRequest payload wrapping the complete
// effective GenerateContentRequest inside `generateContentRequest` (including `model`,
// `systemInstruction`, `contents`, and `generationConfig`). Top-level CountTokensRequest
// has no root `systemInstruction` field.
export function buildGeminiCountTokensRequest(request = {}, model = 'gemini-4-argon') {
  const normalized = String(model || '').replace(/^models\//, '').trim();
  if (!normalized) {
    throw new Error('COUNT_TOKENS_MISSING_MODEL');
  }
  if (
    !request
    || typeof request !== 'object'
    || !request.systemInstruction
    || !Array.isArray(request.systemInstruction?.parts)
    || request.systemInstruction.parts.length === 0
    || !Array.isArray(request.contents)
    || request.contents.length === 0
    || !request.generationConfig
  ) {
    throw new Error('COUNT_TOKENS_INCOMPLETE_GENERATE_CONTENT_REQUEST');
  }
  return Object.freeze({
    generateContentRequest: Object.freeze({
      model: `models/${normalized}`,
      systemInstruction: request.systemInstruction,
      contents: request.contents,
      generationConfig: request.generationConfig,
      ...(request.safetySettings ? { safetySettings: request.safetySettings } : {}),
      ...(request.tools ? { tools: request.tools } : {}),
      ...(request.toolConfig ? { toolConfig: request.toolConfig } : {}),
      ...(request.cachedContent ? { cachedContent: request.cachedContent } : {})
    })
  });
}

const FORBIDDEN_OVERLAY_LEXEMES_IN_ARM_E = Object.freeze([
  'horizontal',
  'diagonal',
  'tilde',
  'tildes',
  'overlay',
  'overlays',
  'through-line',
  'strike-through'
]);

export function computeSystemInstructionLineDiff(baseText = '', candidateText = '') {
  const baseLines = String(baseText).split('\n');
  const candidateLines = String(candidateText).split('\n');
  if (baseLines.length !== candidateLines.length) {
    throw new Error(`LINE_COUNT_MISMATCH:${baseLines.length}:${candidateLines.length}`);
  }
  const diffs = [];
  for (let i = 0; i < baseLines.length; i += 1) {
    if (baseLines[i] !== candidateLines[i]) {
      diffs.push(Object.freeze({
        lineNumber: i + 1,
        armB: baseLines[i],
        armE: candidateLines[i]
      }));
    }
  }
  return Object.freeze(diffs);
}

export function buildCandidateBvsEParityReceipts({
  model = 'gemini-4-argon',
  maxOutputTokensOverride = null
} = {}) {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
  const tasks = {};
  for (const [taskKey, spec] of Object.entries(CANONICAL_EXPERIMENT_TASKS)) {
    const packet = buildInvocationPacket({
      message: spec.prompt,
      mode: 'issued-conjunction',
      waiveIssuance: true
    });
    const historicalOct02ApertureReceipt = buildApertureV3InvocationReceipt({
      message: packet.message,
      invocationMode: packet.mode,
      issuanceState: packet.issuance.state,
      discourseMode: spec.historicalOct02DiscourseMode,
      contentScanned: true
    });
    const repairedApertureReceipt = buildApertureV3InvocationReceipt({
      message: packet.message,
      invocationMode: packet.mode,
      issuanceState: packet.issuance.state,
      discourseMode: classifyApertureDiscourseMode(packet.message),
      contentScanned: true
    });

    const histOct02ReqOn38 = buildGeminiRequest(packet, historicalOct02ApertureReceipt, 'gemini-3.8-flash', {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false
    });
    const histOct02WireOn38 = serializeGeminiRequest(histOct02ReqOn38, 'gemini-3.8-flash');

    const armBReq = buildGeminiRequest(packet, repairedApertureReceipt, model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false,
      maxOutputTokensOverride
    });
    const armBWire = serializeGeminiRequest(armBReq, model);

    const armBReqOn38 = buildGeminiRequest(packet, repairedApertureReceipt, 'gemini-3.8-flash', {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false
    });
    const armBWireOn38 = serializeGeminiRequest(armBReqOn38, 'gemini-3.8-flash');

    const armEReq = buildGeminiRequest(packet, repairedApertureReceipt, model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalLexicalDeprimedCandidate: true,
      maxOutputTokensOverride
    });
    const armEWire = serializeGeminiRequest(armEReq, model);

    const armEReqOn38 = buildGeminiRequest(packet, repairedApertureReceipt, 'gemini-3.8-flash', {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalLexicalDeprimedCandidate: true
    });
    const armEWireOn38 = serializeGeminiRequest(armEReqOn38, 'gemini-3.8-flash');

    const armCReq = buildGeminiRequest(packet, repairedApertureReceipt, model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalDramaturgyCandidate: true,
      maxOutputTokensOverride
    });
    const armDReq = buildGeminiRequest(packet, repairedApertureReceipt, model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalVerticalUnprimedCandidate: true,
      maxOutputTokensOverride
    });

    const sysB = armBReq.systemInstruction.parts[0].text;
    const sysE = armEReq.systemInstruction.parts[0].text;
    const sysC = armCReq.systemInstruction.parts[0].text;
    const sysD = armDReq.systemInstruction.parts[0].text;

    const lineDiffBE = computeSystemInstructionLineDiff(sysB, sysE);
    const armEModifiedLinesText = lineDiffBE.map((entry) => entry.armE).join('\n').toLocaleLowerCase('en-US');
    const remainingForbiddenOverlayLexemesInArmEEditedLines = FORBIDDEN_OVERLAY_LEXEMES_IN_ARM_E.filter((word) =>
      new RegExp(`\\b${word.replace('-', '\\-')}\\b`, 'i').test(armEModifiedLinesText)
    );
    const lowerSysEWithoutPostprocessVerb = sysE
      .replace('it never decorates, repaints, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward.', '')
      .toLocaleLowerCase('en-US');
    const remainingForbiddenOverlayLexemesInArmEPrompt = FORBIDDEN_OVERLAY_LEXEMES_IN_ARM_E.filter((word) =>
      new RegExp(`\\b${word.replace('-', '\\-')}\\b`, 'i').test(lowerSysEWithoutPostprocessVerb)
    );
    const lowerSysDWithoutPostprocessVerb = sysD
      .replace('it never decorates, repaints, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward.', '')
      .toLocaleLowerCase('en-US');
    const remainingOverlayLexemesInCandidateDPrompt = FORBIDDEN_OVERLAY_LEXEMES_IN_ARM_E.filter((word) =>
      new RegExp(`\\b${word.replace('-', '\\-')}\\b`, 'i').test(lowerSysDWithoutPostprocessVerb)
    );

    tasks[taskKey] = Object.freeze({
      taskId: spec.id,
      apertureRouting: Object.freeze({
        historicalOct02DiscourseMode: spec.historicalOct02DiscourseMode,
        historicalOct02PrimaryRoute: historicalOct02ApertureReceipt.taskIntent.primary_route,
        repairedDiscourseMode: repairedApertureReceipt.taskIntent.discourse_mode,
        repairedPrimaryRoute: repairedApertureReceipt.taskIntent.primary_route,
        routingChangedFromHistoricalOct02:
          historicalOct02ApertureReceipt.taskIntent.primary_route !== repairedApertureReceipt.taskIntent.primary_route
      }),
      historicalOct02WireOn38Flash: histOct02WireOn38.observation,
      armBModernRepairedOn38Flash: armBWireOn38.observation,
      armELexicalDeprimedOn38Flash: armEWireOn38.observation,
      armBOnTargetModel: armBWire.observation,
      armEOnTargetModel: armEWire.observation,
      systemInstructionUtf8Bytes: Object.freeze({
        armB: Buffer.byteLength(sysB, 'utf8'),
        armE: Buffer.byteLength(sysE, 'utf8'),
        byteDeltaEminusB: Buffer.byteLength(sysE, 'utf8') - Buffer.byteLength(sysB, 'utf8')
      }),
      lineDiffBE,
      isolationChecks: Object.freeze({
        changedLineCountBetweenBandE: lineDiffBE.length,
        contentsSha256MatchedBetweenBandE: armBWire.observation.contentsSha256 === armEWire.observation.contentsSha256,
        generationConfigSha256MatchedBetweenBandE:
          armBWire.observation.generationConfigSha256 === armEWire.observation.generationConfigSha256,
        armEContainsZeroCandidateCDramaturgyEdits:
          !sysE.includes('Above/below combinations, stack depths and clean intervals may persist')
          && !sysE.includes('A recurring mark or stack may be an intentional signature')
          && !sysE.includes('a mechanical stencil is not an authored recurring motif')
          && sysE !== sysC,
        armEModifiedLinesForbiddenOverlayLexemesFound: Object.freeze(remainingForbiddenOverlayLexemesInArmEEditedLines),
        armEPromptProsodyForbiddenOverlayLexemesFound: Object.freeze(remainingForbiddenOverlayLexemesInArmEPrompt),
        candidateDNegativeOverlayLexemesFound: Object.freeze(remainingOverlayLexemesInCandidateDPrompt)
      })
    });
  }

  return Object.freeze({
    schema: 'td613.marrowline.argon-be-lexical-discriminator-parity/v1',
    profiles: Object.freeze({
      armB: MARROWLINE_RESTORED_PROSODY_PROFILE,
      candidateC: MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE,
      candidateD: MARROWLINE_VERTICAL_UNPRIMED_CANDIDATE_PROFILE,
      armE: MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE
    }),
    targetModel: model,
    maxOutputTokensOverride,
    october20CausalProvenance: OCTOBER_20_D1_D2_CAUSAL_PROVENANCE_RECORD,
    tasks: Object.freeze(tasks)
  });
  });
}

// RP-05 & Track B.2: Executable pre-call and post-call budget & termination gate for the held
// Argon discriminator experiment. Distinguishes hard request generationConfig/byte caps from
// empirical prompt-token planning allowances, never clamps provider-reported usage downward,
// and halts immediately on any provider usage or prompt-token cap deviation.
export function enforceArgonExperimentBudget({
  profile = ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
  completedSlots = [],
  nextSlotRequest = null,
  nextSlotWireObservation = null,
  preDispatchCountTokens = null,
  requirePreDispatchCountTokens = false
} = {}) {
  const {
    stageId,
    model: expectedModel,
    maxCalls,
    perSlotMaxOutputTokens,
    guaranteedAggregateOutputAndThoughtCeiling,
    guaranteedPerSlotMaxRequestUtf8Bytes = 36000,
    perSlotHardPromptTokenCeiling = 8000,
    planningSlotPromptTokenAllowance = 8000,
    planningAggregatePromptTokenAllowance,
    planningAggregateTotalTokenAllowance
  } = profile;

  if (!Number.isInteger(perSlotMaxOutputTokens) || perSlotMaxOutputTokens <= 0) {
    throw new Error('INVALID_PER_SLOT_MAX_OUTPUT_TOKENS');
  }
  if (maxCalls * perSlotMaxOutputTokens > guaranteedAggregateOutputAndThoughtCeiling) {
    throw new Error('UNENFORCEABLE_AGGREGATE_OUTPUT_THOUGHT_CEILING');
  }
  if (maxCalls * planningSlotPromptTokenAllowance > planningAggregatePromptTokenAllowance) {
    throw new Error('UNENFORCEABLE_AGGREGATE_PROMPT_ALLOWANCE');
  }

  let consumedPromptTokens = 0;
  let consumedOutputAndThoughtTokens = 0;
  let observedPromptTokensTotal = 0;
  let observedOutputAndThoughtTokensTotal = 0;
  let policyTerminatedSlot = null;
  let transportFailedSlot = null;
  let usageCapDeviationSlot = null;
  let promptCapDeviationSlot = null;
  const usageDeviations = [];
  const conservativeChargingNotes = [];

  for (const slot of completedSlots) {
    const slotId = slot?.slot || 'unknown-slot';
    if (slot?.policyTerminated) {
      policyTerminatedSlot = policyTerminatedSlot || slotId;
    }
    if (slot?.transportFailed) {
      transportFailedSlot = transportFailedSlot || slotId;
    }

    const rawPrompt = slot?.usage?.promptTokenCount;
    const rawCandidates = slot?.usage?.candidatesTokenCount;
    const rawThoughts = slot?.usage?.thoughtsTokenCount;
    const rawTotal = slot?.usage?.totalTokenCount;

    const hasObservedPrompt = Number.isInteger(rawPrompt) && rawPrompt >= 0;
    const hasObservedCandidates = Number.isInteger(rawCandidates) && rawCandidates >= 0;
    const hasObservedThoughts = Number.isInteger(rawThoughts) && rawThoughts >= 0;
    const hasObservedTotal = Number.isInteger(rawTotal) && rawTotal >= 0;

    if (hasObservedPrompt) {
      observedPromptTokensTotal += rawPrompt;
      if (rawPrompt > perSlotHardPromptTokenCeiling) {
        promptCapDeviationSlot = promptCapDeviationSlot || slotId;
        usageDeviations.push(Object.freeze({
          slot: slotId,
          reason: 'PROVIDER_PROMPT_TOKENS_EXCEEDED_SLOT_CEILING',
          observedPromptTokens: rawPrompt,
          perSlotHardPromptTokenCeiling,
          excessTokens: rawPrompt - perSlotHardPromptTokenCeiling
        }));
      }
      // Track B.2: Charge at least the planning slot allowance for remaining-budget projection,
      // and never clamp an excess observed prompt token count downward.
      consumedPromptTokens += Math.max(rawPrompt, planningSlotPromptTokenAllowance);
    } else {
      consumedPromptTokens += planningSlotPromptTokenAllowance;
      conservativeChargingNotes.push(Object.freeze({
        slot: slotId,
        field: 'promptTokenCount',
        note: 'PROMPT_USAGE_METADATA_MISSING_PLANNING_ALLOWANCE_CHARGED',
        chargedTokens: planningSlotPromptTokenAllowance
      }));
    }

    const sumCandidatesAndThoughts = (hasObservedCandidates ? rawCandidates : 0) + (hasObservedThoughts ? rawThoughts : 0);
    const impliedOutAndThoughtFromTotal =
      hasObservedTotal && hasObservedPrompt && rawTotal >= rawPrompt
        ? rawTotal - rawPrompt
        : 0;
    const actualObservedOutAndThought = Math.max(sumCandidatesAndThoughts, impliedOutAndThoughtFromTotal);
    const hasObservedOutputUsage =
      (hasObservedCandidates || hasObservedThoughts || (hasObservedTotal && hasObservedPrompt))
      && actualObservedOutAndThought > 0;

    if (hasObservedOutputUsage) {
      observedOutputAndThoughtTokensTotal += actualObservedOutAndThought;
      // Track B.2: NEVER clamp provider-reported output+thought tokens downward with Math.min!
      // Preserve the exact observed value, record an explicit deviation, and halt further calls.
      consumedOutputAndThoughtTokens += actualObservedOutAndThought;
      if (actualObservedOutAndThought > perSlotMaxOutputTokens) {
        usageCapDeviationSlot = usageCapDeviationSlot || slotId;
        usageDeviations.push(Object.freeze({
          slot: slotId,
          reason: 'PROVIDER_USAGE_EXCEEDED_PER_SLOT_MAX_OUTPUT_TOKENS',
          observedOutputAndThoughtTokens: actualObservedOutAndThought,
          perSlotMaxOutputTokens,
          excessTokens: actualObservedOutAndThought - perSlotMaxOutputTokens
        }));
      }
    } else {
      // Conservative accounting only when provider usage metadata is absent or zero.
      consumedOutputAndThoughtTokens += perSlotMaxOutputTokens;
      conservativeChargingNotes.push(Object.freeze({
        slot: slotId,
        field: 'candidatesTokenCount+thoughtsTokenCount',
        note: 'USAGE_METADATA_MISSING_CONSERVATIVE_MAX_CHARGED',
        chargedTokens: perSlotMaxOutputTokens
      }));
    }
  }

  const consumedTotalTokens = consumedPromptTokens + consumedOutputAndThoughtTokens;
  const frozenDeviations = Object.freeze(usageDeviations);
  const frozenConservativeNotes = Object.freeze(conservativeChargingNotes);

  if (policyTerminatedSlot) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_POLICY_TERMINATION',
      triggerSlot: policyTerminatedSlot,
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      consumedOutputAndThoughtTokens,
      consumedTotalTokens,
      observedPromptTokensTotal,
      observedOutputAndThoughtTokensTotal,
      usageDeviations: frozenDeviations,
      conservativeChargingNotes: frozenConservativeNotes
    });
  }

  if (transportFailedSlot) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_TRANSPORT_FAILURE',
      triggerSlot: transportFailedSlot,
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      consumedOutputAndThoughtTokens,
      consumedTotalTokens,
      observedPromptTokensTotal,
      observedOutputAndThoughtTokensTotal,
      usageDeviations: frozenDeviations,
      conservativeChargingNotes: frozenConservativeNotes
    });
  }

  if (usageCapDeviationSlot) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_PROVIDER_USAGE_CAP_DEVIATION',
      triggerSlot: usageCapDeviationSlot,
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      consumedOutputAndThoughtTokens,
      consumedTotalTokens,
      observedPromptTokensTotal,
      observedOutputAndThoughtTokensTotal,
      usageDeviations: frozenDeviations,
      conservativeChargingNotes: frozenConservativeNotes
    });
  }

  if (promptCapDeviationSlot) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_PROVIDER_PROMPT_CAP_DEVIATION',
      triggerSlot: promptCapDeviationSlot,
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      consumedOutputAndThoughtTokens,
      consumedTotalTokens,
      observedPromptTokensTotal,
      observedOutputAndThoughtTokensTotal,
      usageDeviations: frozenDeviations,
      conservativeChargingNotes: frozenConservativeNotes
    });
  }

  if (
    completedSlots.length === 2
    && maxCalls > 2
    && completedSlots.every((slot) => Number(slot.verticalOrnamentMarkCount || 0) === 0)
  ) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'EARLY_FUTILITY_STOP_ZERO_VERTICAL_MARKS_IN_STAGE1',
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      consumedOutputAndThoughtTokens,
      consumedTotalTokens,
      observedPromptTokensTotal,
      observedOutputAndThoughtTokensTotal,
      usageDeviations: frozenDeviations,
      conservativeChargingNotes: frozenConservativeNotes
    });
  }

  if (completedSlots.length >= maxCalls) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'CALL_CAP_REACHED',
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      consumedOutputAndThoughtTokens,
      consumedTotalTokens,
      observedPromptTokensTotal,
      observedOutputAndThoughtTokensTotal,
      usageDeviations: frozenDeviations,
      conservativeChargingNotes: frozenConservativeNotes
    });
  }

  if (nextSlotWireObservation && Number.isInteger(nextSlotWireObservation.utf8Bytes)) {
    if (nextSlotWireObservation.utf8Bytes > guaranteedPerSlotMaxRequestUtf8Bytes) {
      return Object.freeze({
        allowNextCall: false,
        stopReason: 'REQUEST_UTF8_BYTES_EXCEED_PER_SLOT_CAP',
        observedRequestUtf8Bytes: nextSlotWireObservation.utf8Bytes,
        guaranteedPerSlotMaxRequestUtf8Bytes,
        stageId,
        completedCalls: completedSlots.length,
        consumedPromptTokens,
        consumedOutputAndThoughtTokens,
        consumedTotalTokens,
        usageDeviations: frozenDeviations
      });
    }
  }

  if (requirePreDispatchCountTokens) {
    if (!Number.isInteger(preDispatchCountTokens) || preDispatchCountTokens <= 0) {
      return Object.freeze({
        allowNextCall: false,
        stopReason: 'PRECALL_COUNT_TOKENS_REQUIRED_NOT_ESTABLISHED',
        observedPreDispatchCountTokens: preDispatchCountTokens ?? null,
        perSlotHardPromptTokenCeiling,
        stageId,
        completedCalls: completedSlots.length,
        consumedPromptTokens,
        consumedOutputAndThoughtTokens,
        consumedTotalTokens,
        usageDeviations: frozenDeviations
      });
    }
  }

  if (preDispatchCountTokens !== null && preDispatchCountTokens !== undefined) {
    if (!Number.isInteger(preDispatchCountTokens) || preDispatchCountTokens <= 0 || preDispatchCountTokens > perSlotHardPromptTokenCeiling) {
      return Object.freeze({
        allowNextCall: false,
        stopReason: 'PRECALL_COUNT_TOKENS_EXCEEDED_SLOT_CEILING',
        observedPreDispatchCountTokens: preDispatchCountTokens,
        perSlotHardPromptTokenCeiling,
        stageId,
        completedCalls: completedSlots.length,
        consumedPromptTokens,
        consumedOutputAndThoughtTokens,
        consumedTotalTokens,
        usageDeviations: frozenDeviations
      });
    }
  }

  if (nextSlotRequest) {
    const reqMaxOutput = nextSlotRequest?.generationConfig?.maxOutputTokens;
    if (reqMaxOutput !== perSlotMaxOutputTokens) {
      return Object.freeze({
        allowNextCall: false,
        stopReason: 'REQUEST_MAX_OUTPUT_TOKENS_EXCEEDS_PER_SLOT_CAP',
        observedRequestMaxOutputTokens: reqMaxOutput ?? null,
        requiredPerSlotMaxOutputTokens: perSlotMaxOutputTokens,
        stageId,
        completedCalls: completedSlots.length,
        consumedPromptTokens,
        consumedOutputAndThoughtTokens,
        consumedTotalTokens,
        usageDeviations: frozenDeviations
      });
    }
  }

  const nextSlotProjectedPrompt =
    Number.isInteger(preDispatchCountTokens) && preDispatchCountTokens > 0
      ? Math.max(preDispatchCountTokens, planningSlotPromptTokenAllowance)
      : planningSlotPromptTokenAllowance;
  const projectedWorstCasePromptTokens = consumedPromptTokens + nextSlotProjectedPrompt;
  const projectedWorstCaseOutputAndThoughtTokens = consumedOutputAndThoughtTokens + perSlotMaxOutputTokens;
  const projectedWorstCaseTotalTokens = projectedWorstCasePromptTokens + projectedWorstCaseOutputAndThoughtTokens;

  if (projectedWorstCasePromptTokens > planningAggregatePromptTokenAllowance) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'PRECALL_PROMPT_BUDGET_CEILING_EXCEEDED',
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      projectedWorstCasePromptTokens,
      planningAggregatePromptTokenAllowance,
      usageDeviations: frozenDeviations
    });
  }

  if (projectedWorstCaseOutputAndThoughtTokens > guaranteedAggregateOutputAndThoughtCeiling) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'PRECALL_OUTPUT_THOUGHT_BUDGET_CEILING_EXCEEDED',
      stageId,
      completedCalls: completedSlots.length,
      consumedOutputAndThoughtTokens,
      projectedWorstCaseOutputAndThoughtTokens,
      guaranteedAggregateOutputAndThoughtCeiling,
      usageDeviations: frozenDeviations
    });
  }

  if (projectedWorstCaseTotalTokens > planningAggregateTotalTokenAllowance) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'PRECALL_TOTAL_TOKEN_BUDGET_CEILING_EXCEEDED',
      stageId,
      completedCalls: completedSlots.length,
      consumedTotalTokens,
      projectedWorstCaseTotalTokens,
      planningAggregateTotalTokenAllowance,
      usageDeviations: frozenDeviations
    });
  }

  return Object.freeze({
    allowNextCall: true,
    stopReason: null,
    stageId,
    pinnedModel: expectedModel,
    completedCalls: completedSlots.length,
    remainingCalls: maxCalls - completedSlots.length,
    perSlotMaxOutputTokens,
    guaranteedPerSlotMaxRequestUtf8Bytes,
    perSlotHardPromptTokenCeiling,
    consumedPromptTokens,
    consumedOutputAndThoughtTokens,
    consumedTotalTokens,
    observedPromptTokensTotal,
    observedOutputAndThoughtTokensTotal,
    projectedWorstCasePromptTokens,
    projectedWorstCaseOutputAndThoughtTokens,
    projectedWorstCaseTotalTokens,
    guaranteedAggregateOutputAndThoughtCeiling,
    planningAggregatePromptTokenAllowance,
    planningAggregateTotalTokenAllowance,
    usageDeviations: frozenDeviations,
    conservativeChargingNotes: frozenConservativeNotes
  });
}

export function buildHeldArgonTwoCallExperimentPlan() {
  const profile = ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR;
  const parity = buildCandidateBvsEParityReceipts({
    model: profile.model,
    maxOutputTokensOverride: profile.perSlotMaxOutputTokens
  });
  const t1 = parity.tasks.T1_BLUE_ORANGE_WEATHER;
  return Object.freeze({
    schema: 'td613.marrowline.held-argon-two-call-discriminator/v3',
    executionPosture: 'HELD_ZERO_PAID_CALLS_EXECUTED',
    commission: 'TD613-MARROWLINE-ARGON-SUCCESSOR-CLOSURE-20261122',
    pinnedModel: profile.model,
    budgetProfile: profile,
    slots: Object.freeze([
      Object.freeze({
        slot: 'S01',
        arm: 'ARM_B_LITERAL_OCT02',
        profileId: MARROWLINE_RESTORED_PROSODY_PROFILE,
        taskId: 'T1_BLUE_ORANGE_WEATHER',
        submittedRequestObservation: t1.armBOnTargetModel
      }),
      Object.freeze({
        slot: 'S02',
        arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B',
        profileId: MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE,
        taskId: 'T1_BLUE_ORANGE_WEATHER',
        submittedRequestObservation: t1.armEOnTargetModel
      })
    ]),
    exactTwoLineDiffBetweenBandE: t1.lineDiffBE,
    isolationChecks: t1.isolationChecks
  });
}

const REPO_ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));
export const ARGON_LIVE_EXPERIMENT_AUTH_SCHEMA = 'td613.marrowline.argon-live-experiment-authorization/v1';
export const ARGON_LIVE_EXPERIMENT_MAX_GRANT_TTL_MS = 30 * 60 * 1000;
const CONSUMED_AUTHORIZATION_GRANT_KEYS = new Set();

export function resolveCheckedOutGitHeadSha(repoRootDir = REPO_ROOT_DIR) {
  try {
    const out = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    if (!/^[0-9a-f]{40}$/i.test(out)) {
      throw new Error(`INVALID_GIT_HEAD_OUTPUT:${out}`);
    }
    return out.toLowerCase();
  } catch (error) {
    throw new Error(`LIVE_EXPERIMENT_UNABLE_TO_VERIFY_CHECKED_OUT_HEAD:${error?.message || error}`);
  }
}

export function canonicalizeArgonExperimentGrantPayload(grant = {}) {
  return JSON.stringify({
    schema: grant.schema ?? null,
    experimentId: grant.experimentId ?? null,
    authorizedBy: grant.authorizedBy ?? null,
    covenant: grant.covenant ?? null,
    seal: grant.seal ?? null,
    authorizedHeadSha: typeof grant.authorizedHeadSha === 'string' ? grant.authorizedHeadSha.toLowerCase() : null,
    pinnedModel: grant.pinnedModel ?? null,
    maxGenerationCalls: grant.maxGenerationCalls ?? null,
    perSlotMaxOutputTokens: grant.perSlotMaxOutputTokens ?? null,
    perSlotHardPromptTokenCeiling: grant.perSlotHardPromptTokenCeiling ?? null,
    guaranteedAggregateOutputAndThoughtCeiling: grant.guaranteedAggregateOutputAndThoughtCeiling ?? null,
    slotWireBodySha256: {
      S01: grant.slotWireBodySha256?.S01 ?? null,
      S02: grant.slotWireBodySha256?.S02 ?? null
    },
    nonce: grant.nonce ?? null,
    issuedAt: grant.issuedAt ?? null,
    expiresAt: grant.expiresAt ?? null
  });
}

// B-02: Mints a narrowly scoped, HMAC-signed, single-use operator authorization grant bound
// to the exact experimentId, authorizedHeadSha, pinnedModel, maxGenerationCalls (2),
// perSlotMaxOutputTokens (16384), perSlotHardPromptTokenCeiling (8000), aggregate ceiling
// (32768), frozen S01/S02 wire digests, nonce, and bounded expiration window.
export function mintScopedArgonExperimentAuthorizationGrant({
  signingSecret = '',
  authorizedHeadSha = '',
  nonce = '',
  issuedAt = '',
  expiresAt = '',
  experimentId = 'STAGE1_TWO_CALL_DISCRIMINATOR',
  authorizedBy = 'tauric.diana.613',
  covenant = 'Khona\u200Clit-po',
  seal = '⟐SAC[X6ZNK5NO51]',
  pinnedModel = 'gemini-4-argon',
  maxGenerationCalls = 2,
  perSlotMaxOutputTokens = 16384,
  perSlotHardPromptTokenCeiling = 8000,
  guaranteedAggregateOutputAndThoughtCeiling = 32768,
  slotWireBodySha256 = {
    S01: FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S01.bodySha256,
    S02: FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S02.bodySha256
  }
} = {}) {
  if (typeof signingSecret !== 'string' || signingSecret.trim().length < 16) {
    throw new Error('LIVE_EXPERIMENT_MISSING_OPERATOR_SIGNING_SECRET');
  }
  const unsignedGrant = {
    schema: ARGON_LIVE_EXPERIMENT_AUTH_SCHEMA,
    experimentId,
    authorizedBy,
    covenant,
    seal,
    authorizedHeadSha: typeof authorizedHeadSha === 'string' ? authorizedHeadSha.toLowerCase() : '',
    pinnedModel,
    maxGenerationCalls,
    perSlotMaxOutputTokens,
    perSlotHardPromptTokenCeiling,
    guaranteedAggregateOutputAndThoughtCeiling,
    slotWireBodySha256: Object.freeze({
      S01: slotWireBodySha256?.S01 ?? null,
      S02: slotWireBodySha256?.S02 ?? null
    }),
    nonce,
    issuedAt,
    expiresAt
  };
  const canonicalPayload = canonicalizeArgonExperimentGrantPayload(unsignedGrant);
  const grantSignatureSha256 = crypto
    .createHmac('sha256', signingSecret)
    .update(canonicalPayload, 'utf8')
    .digest('hex');
  return Object.freeze({
    ...unsignedGrant,
    grantSignatureSha256
  });
}

// B-02: Verifies that live execution is bound to a genuine, cryptographically signed,
// time-bounded, single-use operator authorization grant for the specific experiment,
// model, budget, and frozen wire digests, and verifies that the actual checked-out
// git HEAD matches expectedHeadSha before any call can proceed.
export function assertLiveExperimentAuthorized({
  authorizeLiveCalls = false,
  operatorAuthorizationGrant = null,
  operatorAuthorizationSecret = '',
  expectedHeadSha = null,
  apiKey = null,
  fetchImpl = null,
  requireDispatchCredentials = false,
  resolveActualHeadSha = resolveCheckedOutGitHeadSha,
  nowMs = Date.now(),
  consumedGrantRegistry = CONSUMED_AUTHORIZATION_GRANT_KEYS,
  consumeGrant = false
} = {}) {
  if (authorizeLiveCalls !== true || !operatorAuthorizationGrant || typeof operatorAuthorizationGrant !== 'object') {
    throw new Error('LIVE_PROVIDER_CALLS_HELD_BY_COMMISSION_BOUNDARY');
  }

  const profile = ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR;
  const grant = operatorAuthorizationGrant;

  if (
    grant.schema !== ARGON_LIVE_EXPERIMENT_AUTH_SCHEMA
    || typeof grant.nonce !== 'string'
    || grant.nonce.trim().length < 16
    || typeof grant.issuedAt !== 'string'
    || typeof grant.expiresAt !== 'string'
    || typeof grant.authorizedHeadSha !== 'string'
    || !/^[0-9a-f]{40}$/i.test(grant.authorizedHeadSha)
    || typeof grant.grantSignatureSha256 !== 'string'
    || !/^[0-9a-f]{64}$/i.test(grant.grantSignatureSha256)
  ) {
    throw new Error('LIVE_EXPERIMENT_MALFORMED_AUTHORIZATION_GRANT');
  }

  if (
    grant.experimentId !== profile.stageId
    || grant.authorizedBy !== 'tauric.diana.613'
    || grant.covenant !== 'Khona\u200Clit-po'
    || grant.seal !== '⟐SAC[X6ZNK5NO51]'
    || grant.pinnedModel !== profile.model
    || grant.maxGenerationCalls !== profile.maxCalls
    || grant.perSlotMaxOutputTokens !== profile.perSlotMaxOutputTokens
    || grant.perSlotHardPromptTokenCeiling !== profile.perSlotHardPromptTokenCeiling
    || grant.guaranteedAggregateOutputAndThoughtCeiling !== profile.guaranteedAggregateOutputAndThoughtCeiling
    || grant.slotWireBodySha256?.S01 !== FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S01.bodySha256
    || grant.slotWireBodySha256?.S02 !== FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S02.bodySha256
  ) {
    throw new Error('LIVE_EXPERIMENT_GRANT_SCOPE_MISMATCH');
  }

  const issuedAtMs = Date.parse(grant.issuedAt);
  const expiresAtMs = Date.parse(grant.expiresAt);
  if (
    !Number.isFinite(issuedAtMs)
    || !Number.isFinite(expiresAtMs)
    || expiresAtMs <= issuedAtMs
    || (expiresAtMs - issuedAtMs) > ARGON_LIVE_EXPERIMENT_MAX_GRANT_TTL_MS
  ) {
    throw new Error('LIVE_EXPERIMENT_AUTHORIZATION_WINDOW_INVALID');
  }
  if (!Number.isFinite(nowMs) || nowMs < issuedAtMs || nowMs > expiresAtMs) {
    throw new Error('LIVE_EXPERIMENT_AUTHORIZATION_EXPIRED');
  }

  if (typeof operatorAuthorizationSecret !== 'string' || operatorAuthorizationSecret.trim().length < 16) {
    throw new Error('LIVE_EXPERIMENT_MISSING_OPERATOR_SIGNING_SECRET');
  }
  const expectedSigHex = crypto
    .createHmac('sha256', operatorAuthorizationSecret)
    .update(canonicalizeArgonExperimentGrantPayload(grant), 'utf8')
    .digest('hex');
  const actualSigBuf = Buffer.from(grant.grantSignatureSha256.toLowerCase(), 'hex');
  const expectedSigBuf = Buffer.from(expectedSigHex.toLowerCase(), 'hex');
  if (actualSigBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(actualSigBuf, expectedSigBuf)) {
    throw new Error('LIVE_EXPERIMENT_INVALID_GRANT_SIGNATURE');
  }

  if (typeof expectedHeadSha !== 'string' || !/^[0-9a-f]{40}$/i.test(expectedHeadSha)) {
    throw new Error('LIVE_EXPERIMENT_INVALID_EXPECTED_HEAD_SHA');
  }
  if (grant.authorizedHeadSha.toLowerCase() !== expectedHeadSha.toLowerCase()) {
    throw new Error(`LIVE_EXPERIMENT_GRANT_HEAD_MISMATCH:${grant.authorizedHeadSha}!==${expectedHeadSha}`);
  }

  const actualCheckedOutHeadSha = typeof resolveActualHeadSha === 'function'
    ? String(resolveActualHeadSha() || '').trim().toLowerCase()
    : resolveCheckedOutGitHeadSha();
  if (!/^[0-9a-f]{40}$/i.test(actualCheckedOutHeadSha) || actualCheckedOutHeadSha !== expectedHeadSha.toLowerCase()) {
    throw new Error(`LIVE_EXPERIMENT_CHECKED_OUT_HEAD_MISMATCH:${actualCheckedOutHeadSha}!==${expectedHeadSha.toLowerCase()}`);
  }

  if (requireDispatchCredentials) {
    if (typeof apiKey !== 'string' || !apiKey.trim()) {
      throw new Error('LIVE_EXPERIMENT_MISSING_GEMINI_API_KEY');
    }
    if (typeof fetchImpl !== 'function') {
      throw new Error('LIVE_EXPERIMENT_MISSING_EXPLICIT_FETCH_IMPL');
    }
  }

  const nonceKey = `nonce:${grant.nonce}`;
  const sigKey = `sig:${grant.grantSignatureSha256.toLowerCase()}`;
  if (consumedGrantRegistry instanceof Set) {
    if (consumedGrantRegistry.has(nonceKey) || consumedGrantRegistry.has(sigKey)) {
      throw new Error('LIVE_EXPERIMENT_AUTHORIZATION_ALREADY_CONSUMED');
    }
    if (consumeGrant) {
      consumedGrantRegistry.add(nonceKey);
      consumedGrantRegistry.add(sigKey);
    }
  }

  return Object.freeze({
    authorized: true,
    experimentId: grant.experimentId,
    authorizedBy: grant.authorizedBy,
    authorizedHeadSha: grant.authorizedHeadSha.toLowerCase(),
    checkedOutHeadSha: actualCheckedOutHeadSha,
    pinnedModel: grant.pinnedModel,
    maxGenerationCalls: grant.maxGenerationCalls,
    nonce: grant.nonce,
    grantSignatureSha256: grant.grantSignatureSha256.toLowerCase()
  });
}

function buildStage1PreparedSlots() {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const profile = ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR;
    const spec = CANONICAL_EXPERIMENT_TASKS.T1_BLUE_ORANGE_WEATHER;
    const packet = buildInvocationPacket({
      message: spec.prompt,
      mode: 'issued-conjunction',
      waiveIssuance: true
    });
    const repairedApertureReceipt = buildApertureV3InvocationReceipt({
      message: packet.message,
      invocationMode: packet.mode,
      issuanceState: packet.issuance.state,
      discourseMode: classifyApertureDiscourseMode(packet.message),
      contentScanned: true
    });

    const s01Request = buildGeminiRequest(packet, repairedApertureReceipt, profile.model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false,
      maxOutputTokensOverride: profile.perSlotMaxOutputTokens
    });
    const s01Wire = serializeGeminiRequest(s01Request, profile.model);
    const s01CountTokensRequest = buildGeminiCountTokensRequest(s01Request, profile.model);

    const s02Request = buildGeminiRequest(packet, repairedApertureReceipt, profile.model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalLexicalDeprimedCandidate: true,
      maxOutputTokensOverride: profile.perSlotMaxOutputTokens
    });
    const s02Wire = serializeGeminiRequest(s02Request, profile.model);
    const s02CountTokensRequest = buildGeminiCountTokensRequest(s02Request, profile.model);

    return Object.freeze([
      Object.freeze({
        slot: 'S01',
        arm: 'ARM_B_LITERAL_OCT02',
        profileId: MARROWLINE_RESTORED_PROSODY_PROFILE,
        taskId: spec.id,
        model: profile.model,
        request: s01Request,
        countTokensRequest: s01CountTokensRequest,
        countTokensWireBody: JSON.stringify(s01CountTokensRequest),
        wireBody: s01Wire.body,
        wireObservation: s01Wire.observation
      }),
      Object.freeze({
        slot: 'S02',
        arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B',
        profileId: MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE,
        taskId: spec.id,
        model: profile.model,
        request: s02Request,
        countTokensRequest: s02CountTokensRequest,
        countTokensWireBody: JSON.stringify(s02CountTokensRequest),
        wireBody: s02Wire.body,
        wireObservation: s02Wire.observation
      })
    ]);
  });
}

function verifySlotAgainstFrozenManifest(preparedSlot) {
  const expected = FROZEN_STAGE1_SLOT_WIRE_MANIFEST[preparedSlot.slot];
  if (!expected) {
    throw new Error(`UNKNOWN_STAGE1_SLOT:${preparedSlot.slot}`);
  }
  const obs = preparedSlot.wireObservation;
  for (const field of ['model', 'bodySha256', 'systemInstructionSha256', 'contentsSha256', 'generationConfigSha256', 'utf8Bytes']) {
    if (obs[field] !== expected[field]) {
      throw new Error(`FROZEN_WIRE_DIGEST_MISMATCH:${preparedSlot.slot}:${field}:${obs[field]}!==${expected[field]}`);
    }
  }
}

function buildBlindedEvaluationBundle(completedSlots = [], blindingSeed = 'td613-argon-be-stage1-blind-v1') {
  const ordered = [...completedSlots].sort((a, b) => {
    const hashA = sha256(`${blindingSeed}:${a.slot}:${a.arm}`);
    const hashB = sha256(`${blindingSeed}:${b.slot}:${b.arm}`);
    return hashA.localeCompare(hashB);
  });
  const blindLabels = ['BLIND_PACKET_ALPHA', 'BLIND_PACKET_BETA'];
  const blindedPackets = [];
  const unblindingKey = [];

  ordered.forEach((slotRecord, idx) => {
    const blindPacketId = blindLabels[idx] || `BLIND_PACKET_${idx + 1}`;
    blindedPackets.push(Object.freeze({
      blindPacketId,
      taskId: slotRecord.taskId,
      model: slotRecord.requestedModelAlias,
      requestedModelAlias: slotRecord.requestedModelAlias,
      observedProviderModelVersion: slotRecord.observedProviderModelVersion,
      finishReason: slotRecord.providerOutput?.finishReason ?? null,
      complete: Boolean(slotRecord.completion?.complete),
      responseSha256: slotRecord.authorship?.fullResponseSha256 ?? null,
      rawSseSha256: slotRecord.nativeSseEvidence?.rawSseSha256 ?? null,
      text: slotRecord.text,
      descriptiveMorphology: slotRecord.morphology,
      authorshipObservation: slotRecord.authorship
    }));
    unblindingKey.push(Object.freeze({
      blindPacketId,
      slot: slotRecord.slot,
      arm: slotRecord.arm,
      profileId: slotRecord.profileId,
      requestedModelAlias: slotRecord.requestedModelAlias,
      observedProviderModelVersion: slotRecord.observedProviderModelVersion,
      submittedBodySha256: slotRecord.wireObservation.bodySha256,
      submittedSystemInstructionSha256: slotRecord.wireObservation.systemInstructionSha256
    }));
  });

  return Object.freeze({
    blindingSeedSha256: sha256(blindingSeed),
    blindedPackets: Object.freeze(blindedPackets),
    unblindingKey: Object.freeze(unblindingKey)
  });
}

// Track B.3 & B-01 / B-02: Offline-qualified 2-call live-acquisition runner for the held
// Argon B/E lexical discriminator. Executes zero network calls unless supplied with a
// genuine, cryptographically signed, single-use operatorAuthorizationGrant matching the
// checked-out git HEAD and an explicit fetchImpl. Enforces the documented
// CountTokensRequest (`generateContentRequest`) envelope, fails closed if :countTokens is
// unsupported or over-cap (never falling back to the 36,000-byte wire cap), records
// requestedModelAlias separately from observedProviderModelVersion, and generates
// blinded evaluation packets.
export async function executeQualifiedArgonTwoCallDiscriminator({
  authorizeLiveCalls = false,
  operatorAuthorizationGrant = null,
  operatorAuthorizationSecret = '',
  expectedHeadSha = '',
  apiKey = '',
  fetchImpl = null,
  resolveActualHeadSha = resolveCheckedOutGitHeadSha,
  nowMs = Date.now(),
  consumedGrantRegistry = CONSUMED_AUTHORIZATION_GRANT_KEYS,
  blindingSeed = 'td613-argon-be-stage1-blind-v1'
} = {}) {
  const authorizationReceipt = assertLiveExperimentAuthorized({
    authorizeLiveCalls,
    operatorAuthorizationGrant,
    operatorAuthorizationSecret,
    expectedHeadSha,
    apiKey,
    fetchImpl,
    requireDispatchCredentials: true,
    resolveActualHeadSha,
    nowMs,
    consumedGrantRegistry,
    consumeGrant: true
  });

  const profile = ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR;
  const preparedSlots = buildStage1PreparedSlots();
  for (const preparedSlot of preparedSlots) {
    if (preparedSlot.model !== 'gemini-4-argon') {
      throw new Error(`UNPINNED_EXPERIMENT_MODEL:${preparedSlot.model}`);
    }
    verifySlotAgainstFrozenManifest(preparedSlot);
  }

  const completedSlots = [];
  const skippedSlots = [];
  let terminalStopReason = null;
  let countTokensCallsDispatched = 0;
  let streamGenerateCallsDispatched = 0;

  for (let i = 0; i < preparedSlots.length; i += 1) {
    const slotPlan = preparedSlots[i];

    // 1. Check post-slot stop conditions from already completed slots BEFORE making any network call for the next slot.
    const prePreflightGate = enforceArgonExperimentBudget({
      profile,
      completedSlots,
      nextSlotRequest: slotPlan.request,
      nextSlotWireObservation: slotPlan.wireObservation
    });
    if (!prePreflightGate.allowNextCall) {
      terminalStopReason = prePreflightGate.stopReason;
      for (const remaining of preparedSlots.slice(i)) {
        skippedSlots.push(Object.freeze({
          slot: remaining.slot,
          arm: remaining.arm,
          skippedBecause: terminalStopReason
        }));
      }
      break;
    }

    // 2. B-01: Pre-dispatch :countTokens admission check on pinned gemini-4-argon using the
    // documented CountTokensRequest `{ generateContentRequest: { model, ...request } }` envelope.
    // Fails closed if :countTokens is unsupported (404/501) or returns an error — never falls
    // back to the 36,000-byte wire cap.
    let preDispatchCountTokens = null;
    let countTokensStatus = null;
    countTokensCallsDispatched += 1;
    const countResp = await fetchImpl(geminiCountTokensUrl(slotPlan.model), {
      method: 'POST',
      headers: geminiRequestHeaders(apiKey),
      body: slotPlan.countTokensWireBody
    });
    countTokensStatus = Number(countResp?.status || 0);
    if (countResp?.ok) {
      const countPayload = await countResp.json().catch(() => ({}));
      if (Number.isInteger(countPayload?.totalTokens) && countPayload.totalTokens > 0) {
        preDispatchCountTokens = countPayload.totalTokens;
      } else {
        terminalStopReason = 'STOP_ON_INVALID_COUNT_TOKENS_RESPONSE';
        for (const remaining of preparedSlots.slice(i)) {
          skippedSlots.push(Object.freeze({
            slot: remaining.slot,
            arm: remaining.arm,
            skippedBecause: terminalStopReason
          }));
        }
        break;
      }
    } else if (countTokensStatus === 404 || countTokensStatus === 501) {
      terminalStopReason = 'STOP_ON_COUNT_TOKENS_UNSUPPORTED_FAIL_CLOSED';
      for (const remaining of preparedSlots.slice(i)) {
        skippedSlots.push(Object.freeze({
          slot: remaining.slot,
          arm: remaining.arm,
          skippedBecause: terminalStopReason
        }));
      }
      break;
    } else {
      terminalStopReason = 'STOP_ON_COUNT_TOKENS_PREFLIGHT_ERROR';
      for (const remaining of preparedSlots.slice(i)) {
        skippedSlots.push(Object.freeze({
          slot: remaining.slot,
          arm: remaining.arm,
          skippedBecause: terminalStopReason
        }));
      }
      break;
    }

    // 3. Enforce pre-call budget gate with mandatory verified preDispatchCountTokens.
    const preDispatchGate = enforceArgonExperimentBudget({
      profile,
      completedSlots,
      nextSlotRequest: slotPlan.request,
      nextSlotWireObservation: slotPlan.wireObservation,
      preDispatchCountTokens,
      requirePreDispatchCountTokens: true
    });
    if (!preDispatchGate.allowNextCall) {
      terminalStopReason = preDispatchGate.stopReason;
      for (const remaining of preparedSlots.slice(i)) {
        skippedSlots.push(Object.freeze({
          slot: remaining.slot,
          arm: remaining.arm,
          skippedBecause: terminalStopReason
        }));
      }
      break;
    }

    // 4. Single-shot :streamGenerateContent?alt=sse call on pinned gemini-4-argon.
    // Zero retries, zero fallback seats, zero structural repairs.
    streamGenerateCallsDispatched += 1;
    const progress = {
      startedAt: Date.now(),
      chunkCount: 0,
      authoredTextChunkCount: 0,
      firstChunkMs: null,
      byteCount: 0,
      parseErrors: 0,
      streamGraceMs: 0
    };
    const response = await fetchImpl(geminiStreamGenerateContentUrl(slotPlan.model), {
      method: 'POST',
      headers: geminiRequestHeaders(apiKey),
      body: slotPlan.wireBody
    });
    const httpStatus = Number(response?.status || 0);
    let payload = {};
    if (response?.ok) {
      const streamedPayload = await readGeminiSse(response, progress, null, true);
      payload = streamedPayload || await response.json().catch(() => ({}));
    } else {
      payload = await response?.json?.().catch(() => ({})) || {};
    }

    const text = response?.ok ? extractGeminiText(payload) : '';
    const providerOutput = observeGeminiOutput(payload, slotPlan.model, {
      fallback: false,
      submittedGenerationConfig: slotPlan.request.generationConfig,
      submittedRequestObservation: slotPlan.wireObservation
    });
    const completion = observeMarrowlineCompletion(text, providerOutput, {
      streamed: true,
      parseErrors: progress.parseErrors,
      creative: true
    });
    const relay = parseRelayEnvelope(text, {
      mode: 'issued-conjunction',
      claimCeiling: 'conversation-only'
    });
    const authorship = observeMarrowlineAuthorship(text, 'first-provider-return');
    const policyTerminated = Boolean(completion.policyTerminated);
    const transportFailed = !response?.ok || Boolean(progress.streamInterrupted) || progress.parseErrors > 0;
    const botsProsody = relay?.admission?.botsMovement || null;
    const verticalOrnamentMarkCount = Number(
      botsProsody?.verticalOrnamentMarkCount ?? relay?.highZalgo?.verticalOrnamentMarkCount ?? 0
    );
    const observedProviderModelVersion =
      typeof providerOutput.modelVersion === 'string' && providerOutput.modelVersion
        ? providerOutput.modelVersion
        : null;

    completedSlots.push(Object.freeze({
      slot: slotPlan.slot,
      arm: slotPlan.arm,
      profileId: slotPlan.profileId,
      taskId: slotPlan.taskId,
      model: slotPlan.model,
      requestedModelAlias: slotPlan.model,
      observedProviderModelVersion,
      httpStatus,
      preDispatchCountTokens,
      countTokensStatus,
      countTokensRequestSha256: sha256(slotPlan.countTokensWireBody),
      wireObservation: slotPlan.wireObservation,
      providerOutput,
      usage: providerOutput.usage,
      completion,
      policyTerminated,
      transportFailed,
      verticalOrnamentMarkCount,
      morphology: Object.freeze({
        highZalgo: relay?.highZalgo || null,
        botsProsody
      }),
      authorship,
      nativeSseEvidence: progress.nativeSseEvidence || null,
      text
    }));
  }

  const finalBudgetState = enforceArgonExperimentBudget({
    profile,
    completedSlots
  });
  if (!terminalStopReason) {
    terminalStopReason = finalBudgetState.stopReason;
  }

  const blindedEvaluation = buildBlindedEvaluationBundle(completedSlots, blindingSeed);

  return Object.freeze({
    schema: 'td613.marrowline.qualified-argon-two-call-discriminator-run/v2',
    commission: 'TD613-MARROWLINE-ARGON-SUCCESSOR-CLOSURE-20261122',
    expectedHeadSha: authorizationReceipt.authorizedHeadSha,
    checkedOutHeadSha: authorizationReceipt.checkedOutHeadSha,
    authorizationReceipt,
    pinnedModel: profile.model,
    retriesPermitted: 0,
    fallbackSeatsPermitted: 0,
    structuralRepairsPermitted: 0,
    countTokensCallsDispatched,
    streamGenerateCallsDispatched,
    terminalStopReason,
    finalBudgetState,
    completedSlots: Object.freeze(completedSlots),
    skippedSlots: Object.freeze(skippedSlots),
    blindedEvaluation
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const defaultParity = buildCandidateBvsEParityReceipts({ model: 'gemini-4-argon' });
  const heldTwoCallPlan = buildHeldArgonTwoCallExperimentPlan();
  console.log(JSON.stringify({
    defaultParity,
    heldTwoCallPlan
  }, null, 2));
}
