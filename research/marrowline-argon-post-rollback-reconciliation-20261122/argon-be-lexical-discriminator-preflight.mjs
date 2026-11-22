// TD613 · Marrowline / Screaming Grove — Argon Successor Commission Preflight
// Commission: TD613-MARROWLINE-ARGON-REDPEN-CLOSURE-20261122
// Covenant: Khona‌lit-po · Seal: ⟐SAC[X6ZNK5NO51]
// Paid Gemini calls authorized or executed by this module: 0 (fail-closed)

import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
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
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
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
    worstCaseSlotPromptTokens: 8000,
    guaranteedAggregatePromptCeiling: 16000,
    guaranteedAggregateOutputAndThoughtCeiling: 32768,
    guaranteedAggregateTotalTokenCeiling: 48768,
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
    worstCaseSlotPromptTokens: 8000,
    guaranteedAggregatePromptCeiling: 32000,
    guaranteedAggregateOutputAndThoughtCeiling: 40000,
    guaranteedAggregateTotalTokenCeiling: 72000,
    slotOrder: Object.freeze([
      Object.freeze({ slot: 'S01', arm: 'ARM_B_LITERAL_OCT02', task: 'T1_BLUE_ORANGE_WEATHER' }),
      Object.freeze({ slot: 'S02', arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B', task: 'T1_BLUE_ORANGE_WEATHER' }),
      Object.freeze({ slot: 'S03', arm: 'ARM_E_LEXICAL_DEPRIMED_FROM_B', task: 'T2_FORENSIC' }),
      Object.freeze({ slot: 'S04', arm: 'ARM_B_LITERAL_OCT02', task: 'T2_FORENSIC' })
    ])
  })
});

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

// RP-05: Executable pre-call budget & termination gate for the held Argon
// discriminator experiment. Prevents any slot dispatch when remaining aggregate
// token ceiling cannot guarantee the next slot's worst-case prompt + output/thought cap.
export function enforceArgonExperimentBudget({
  profile = ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
  completedSlots = [],
  nextSlotRequest = null
} = {}) {
  const {
    stageId,
    model: expectedModel,
    maxCalls,
    perSlotMaxOutputTokens,
    worstCaseSlotPromptTokens,
    guaranteedAggregatePromptCeiling,
    guaranteedAggregateOutputAndThoughtCeiling,
    guaranteedAggregateTotalTokenCeiling
  } = profile;

  if (!Number.isInteger(perSlotMaxOutputTokens) || perSlotMaxOutputTokens <= 0) {
    throw new Error('INVALID_PER_SLOT_MAX_OUTPUT_TOKENS');
  }
  if (maxCalls * perSlotMaxOutputTokens > guaranteedAggregateOutputAndThoughtCeiling) {
    throw new Error('UNENFORCEABLE_AGGREGATE_OUTPUT_THOUGHT_CEILING');
  }
  if (maxCalls * worstCaseSlotPromptTokens > guaranteedAggregatePromptCeiling) {
    throw new Error('UNENFORCEABLE_AGGREGATE_PROMPT_CEILING');
  }

  let consumedPromptTokens = 0;
  let consumedOutputAndThoughtTokens = 0;
  let policyTerminatedSlot = null;
  let transportFailedSlot = null;

  for (const slot of completedSlots) {
    if (slot.policyTerminated) {
      policyTerminatedSlot = slot.slot || 'unknown-slot';
    }
    if (slot.transportFailed) {
      transportFailedSlot = slot.slot || 'unknown-slot';
    }
    const promptTokens = Number.isInteger(slot?.usage?.promptTokenCount) && slot.usage.promptTokenCount > 0
      ? Math.max(slot.usage.promptTokenCount, worstCaseSlotPromptTokens)
      : worstCaseSlotPromptTokens;
    const observedOutAndThought =
      (Number.isInteger(slot?.usage?.candidatesTokenCount) ? slot.usage.candidatesTokenCount : 0)
      + (Number.isInteger(slot?.usage?.thoughtsTokenCount) ? slot.usage.thoughtsTokenCount : 0);
    // Conservative accounting: if usage metadata is missing or zero on a completed
    // call, charge the full per-slot maxOutputTokens cap against the running budget.
    const outputAndThoughtTokens = observedOutAndThought > 0
      ? Math.min(perSlotMaxOutputTokens, observedOutAndThought)
      : perSlotMaxOutputTokens;

    consumedPromptTokens += promptTokens;
    consumedOutputAndThoughtTokens += outputAndThoughtTokens;
  }

  const consumedTotalTokens = consumedPromptTokens + consumedOutputAndThoughtTokens;

  if (policyTerminatedSlot) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_POLICY_TERMINATION',
      triggerSlot: policyTerminatedSlot,
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      consumedOutputAndThoughtTokens,
      consumedTotalTokens
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
      consumedTotalTokens
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
      consumedTotalTokens
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
      consumedTotalTokens
    });
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
        consumedTotalTokens
      });
    }
  }

  const projectedWorstCasePromptTokens = consumedPromptTokens + worstCaseSlotPromptTokens;
  const projectedWorstCaseOutputAndThoughtTokens = consumedOutputAndThoughtTokens + perSlotMaxOutputTokens;
  const projectedWorstCaseTotalTokens = projectedWorstCasePromptTokens + projectedWorstCaseOutputAndThoughtTokens;

  if (projectedWorstCasePromptTokens > guaranteedAggregatePromptCeiling) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'PRECALL_PROMPT_BUDGET_CEILING_EXCEEDED',
      stageId,
      completedCalls: completedSlots.length,
      consumedPromptTokens,
      projectedWorstCasePromptTokens,
      guaranteedAggregatePromptCeiling
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
      guaranteedAggregateOutputAndThoughtCeiling
    });
  }

  if (projectedWorstCaseTotalTokens > guaranteedAggregateTotalTokenCeiling) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'PRECALL_TOTAL_TOKEN_BUDGET_CEILING_EXCEEDED',
      stageId,
      completedCalls: completedSlots.length,
      consumedTotalTokens,
      projectedWorstCaseTotalTokens,
      guaranteedAggregateTotalTokenCeiling
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
    consumedPromptTokens,
    consumedOutputAndThoughtTokens,
    consumedTotalTokens,
    projectedWorstCasePromptTokens,
    projectedWorstCaseOutputAndThoughtTokens,
    projectedWorstCaseTotalTokens,
    guaranteedAggregatePromptCeiling,
    guaranteedAggregateOutputAndThoughtCeiling,
    guaranteedAggregateTotalTokenCeiling
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
    schema: 'td613.marrowline.held-argon-two-call-discriminator/v1',
    executionPosture: 'HELD_ZERO_PAID_CALLS_EXECUTED',
    commission: 'TD613-MARROWLINE-ARGON-REDPEN-CLOSURE-20261122',
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

export function assertLiveExperimentAuthorized({ authorizeLiveCalls = false, operatorAuthorizationToken = '' } = {}) {
  if (!authorizeLiveCalls || !operatorAuthorizationToken) {
    throw new Error('LIVE_PROVIDER_CALLS_HELD_BY_COMMISSION_BOUNDARY');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const defaultParity = buildCandidateBvsEParityReceipts({ model: 'gemini-4-argon' });
  const heldTwoCallPlan = buildHeldArgonTwoCallExperimentPlan();
  console.log(JSON.stringify({
    defaultParity,
    heldTwoCallPlan
  }, null, 2));
}
