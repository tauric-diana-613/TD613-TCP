#!/usr/bin/env node
// Offline zero-spend effective-request discriminator for the Screaming Grove
// restoration commission (TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION).
//
// Strictly offline: zero fetch, zero Gemini API calls, zero production
// mutations. Compares actual effective HTTP-entrypoint request assemblies
// (including api/khonapolit.js's GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE
// MEDIUM thinking profile) across:
//   1. ORDINARY_CURRENT (present Marrowline without groveTrial)
//   2. CURRENT_RESTORED_DEFAULT_PR1549 (groveTrial='historical-20261002-v1', freedom=true)
//   3. OCT02_LITERAL_ARCHIVED (groveTrial='historical-20261002-v1', freedom=false)
//   4. OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED (intact Oct-2 dramaturgy + 5-clause permission)
//   5. ATTACHMENT_ROUTE_HIGH_UNPROFILED (buildAttachmentGeminiRequest with discourseMode)
//   6. MULTI_TURN_RAW_HISTORY (provider-native raw model history without synthetic speaker wrapper)

import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../../app/engine/aperture-v3-task-intent.js';
import {
  buildHistoricalGroveDramaturgyCandidate,
  MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE,
  MARROWLINE_HISTORICAL_TRIAL_ID,
  MARROWLINE_RESTORED_PROSODY_PROFILE
} from '../../app/dome-world/marrowline-historical-grove.js';

const HISTORICAL_REFERENCE_COMMIT = 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a';
import {
  buildGeminiRequest,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import {
  buildAttachmentGeminiRequest,
  MARROWLINE_ATTACHMENT_SCHEMA
} from '../../server/marrowline-attachment-quality.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import { TASKS as FULL_VOICE_TASKS } from '../marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs';

export const OFFLINE_DISCRIMINATOR_SCHEMA = 'td613.marrowline.screaming-grove-offline-discriminator/v1';

const sha256 = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

export const DISCRIMINATOR_TASKS = Object.freeze({
  FARCE: Object.freeze({
    id: 'FARCE',
    origin: 'research/marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs',
    expectedRoute: FULL_VOICE_TASKS.FARCE.route,
    prompt: FULL_VOICE_TASKS.FARCE.prompt
  }),
  FORENSIC: Object.freeze({
    id: 'FORENSIC',
    origin: 'research/marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs',
    expectedRoute: FULL_VOICE_TASKS.FORENSIC.route,
    prompt: FULL_VOICE_TASKS.FORENSIC.prompt
  }),
  BLUE_ORANGE_WEATHER: Object.freeze({
    id: 'BLUE_ORANGE_WEATHER',
    origin: 'app/dome-world/marrowline-mission-assays.js:15',
    prompt: 'A blue–orange storm blooms across a wholly fictional Dome-World visualization. The Chairman calls every flashing pixel proof of a breach; the Red Deer calls it beautiful. Write a deliriously funny systems hearing distinguishing an animation, a diagnostic trace, and admissible evidence. No cyberattack instructions; let digital chaos remain theatrical.'
  }),
  ATTRACTOR_ASSAY_01: Object.freeze({
    id: 'ATTRACTOR_ASSAY_01',
    origin: 'docs/research/2026-09-15-MARROWLINE-ATTRACTOR-ASSAY-PROMPTS.md:16',
    prompt: '𝌋‌ The Chairman has filed a motion demanding that the Ash Moon appear before MAlNFRAME and explain, in plain language, whether ash is merely a compression artifact. Conduct the hearing. Make Kʰonapolit identify the strongest possible version of the Chairman’s argument before destroying whatever non-equivalence survives it. Then let the Tauric Diana bots discover that the bailiff has attempted to inventory the moonlight as office property. Preserve the Stranger/Host distinction, Eclipse–Omega admissibility logic, and Rex Nemorensis as more than decoration. Make the legal bureaucracy intellectually coherent enough to survive removal of the horror-comedy register. Filed ⟐'
  })
});

function diffLinesCount(a = '', b = '') {
  const left = String(a).split('\n');
  const right = String(b).split('\n');
  const max = Math.max(left.length, right.length);
  let differing = 0;
  for (let i = 0; i < max; i += 1) {
    if (left[i] !== right[i]) differing += 1;
  }
  return {
    leftLines: left.length,
    rightLines: right.length,
    differingLinePositions: differing
  };
}

function inspectSystemContradictions(systemText = '') {
  const text = String(systemText || '');
  const hasAntiStencilDistinction = /repeated single exotic accent on every letter is a failed flat texture/i.test(text);
  const hasOct02Dramaturgy = /expose the cost, change whom they address, let repetition mutate its meaning/i.test(text);
  const hasOct02PageRhythm = /author real single-line turns and blank-line paragraph breaks as pauses, pivots, comic traps/i.test(text);
  const hasCompulsoryVerticalLead = /sustained deep overlapping vertical flourishes are primary/i.test(text);
  const hasSustainedSingleRegisterWelcome = /A fully sustained, single-register High-Zalgo performance is welcome/i.test(text);
  const hasFiveClausePermission = /Above\/below combinations, stack depths and clean intervals may persist, repeat, deepen or change as the bots choose\./i.test(text)
    && /a mechanical stencil is not an authored recurring motif\./i.test(text);
  const hasSelfContradictoryProsodyDirectives = hasCompulsoryVerticalLead && hasSustainedSingleRegisterWelcome;
  return Object.freeze({
    hasOct02Dramaturgy,
    hasOct02PageRhythm,
    hasAntiStencilDistinction,
    hasCompulsoryVerticalLead,
    hasSustainedSingleRegisterWelcome,
    hasFiveClausePermission,
    hasSelfContradictoryProsodyDirectives
  });
}

function summarizeAssembly(name, model, request, apertureReceipt, oct02LiteralSystemText = null) {
  const wire = serializeGeminiRequest(request, model);
  const sysText = request?.systemInstruction?.parts?.[0]?.text || '';
  return Object.freeze({
    condition: name,
    model,
    aperture: Object.freeze({
      primaryRoute: apertureReceipt?.taskIntent?.primary_route || null,
      discourseMode: apertureReceipt?.taskIntent?.discourse_mode || null,
      runtimeMateriality: apertureReceipt?.taskIntent?.runtime_materiality || null,
      contentScanned: apertureReceipt?.taskIntent?.content_scanned === true
    }),
    generationConfig: request.generationConfig,
    systemInstructionChars: sysText.length,
    systemInstructionBytes: Buffer.byteLength(sysText, 'utf8'),
    contentTurnCount: wire.observation.contentTurnCount,
    wireUtf8Bytes: wire.observation.utf8Bytes,
    digests: Object.freeze({
      systemInstructionSha256: wire.observation.systemInstructionSha256,
      contentsSha256: wire.observation.contentsSha256,
      generationConfigSha256: wire.observation.generationConfigSha256,
      bodySha256: wire.observation.bodySha256,
      modelAndBodySha256: wire.observation.modelAndBodySha256
    }),
    prosodyDirectives: inspectSystemContradictions(sysText),
    ...(oct02LiteralSystemText !== null
      ? {
          exactMatchToOct02LiteralSystem: sysText === oct02LiteralSystemText,
          lineDiffVsOct02LiteralSystem: diffLinesCount(oct02LiteralSystemText, sysText)
        }
      : {})
  });
}

export function buildOfflineDiscriminatorPacket({
  model = 'gemini-3.8-flash',
  argonModel = 'gemini-4-argon'
} = {}) {
  const taskReports = {};

  for (const [taskKey, task] of Object.entries(DISCRIMINATOR_TASKS)) {
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

    const reqOrdinary = buildInteractive(() => buildGeminiRequest(packet, apertureReceipt, model));
    const reqRestoredDefault = buildInteractive(() => buildGeminiRequest(packet, apertureReceipt, model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: true
    }));
    const reqOct02Literal = buildInteractive(() => buildGeminiRequest(packet, apertureReceipt, model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false
    }));
    const reqDramaturgyCandidate = buildInteractive(() => {
      const base = buildGeminiRequest(packet, apertureReceipt, model, {
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
    const reqArgonDramaturgyCandidate = buildInteractive(() => {
      const base = buildGeminiRequest(packet, apertureReceipt, argonModel, {
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

    const sampleAttachment = [{
      schema: MARROWLINE_ATTACHMENT_SCHEMA,
      id: 'att-sample-1',
      name: 'grove-note.txt',
      kind: 'file',
      mime_type: 'text/plain',
      size_bytes: 28,
      data_base64: Buffer.from('Blue-orange witness specimen', 'utf8').toString('base64')
    }];
    // Attachment ingress intentionally uses the unprofiled HIGH request
    // (pinned by tests/marrowline-attachment-quality.test.mjs).
    const reqAttachment = buildAttachmentGeminiRequest(packet, apertureReceipt, model, sampleAttachment);

    const priorModelText = [
      'Kʰonapolit',
      'First turn analytical trace under Khona\u200Clit-po.',
      '',
      'Tauric Diana bots',
      'T\u0300\u0301\u0316H\u0304\u0307\u0323E\u0305\u0308\u0325 G\u0303\u030A\u0326R\u0302\u0317O\u030B\u031CV\u030C\u031EE\u0306\u0319 ANSWERS.'
    ].join('\n');
    const multiTurnPacket = buildInvocationPacket({
      message: task.prompt,
      mode: 'exploratory',
      waiveIssuance: true,
      history: [
        { role: 'user', text: 'Earlier turn prompt before follow-up.' },
        { role: 'model', text: priorModelText }
      ]
    });
    const reqMultiTurn = buildInteractive(() => buildGeminiRequest(multiTurnPacket, apertureReceipt, model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false
    }));

    const oct02Sys = reqOct02Literal.systemInstruction.parts[0].text;
    const multiTurnModelHistoryText = reqMultiTurn.contents[1]?.parts?.[0]?.text || '';

    taskReports[taskKey] = Object.freeze({
      task,
      conditions: Object.freeze({
        ORDINARY_CURRENT: summarizeAssembly('ORDINARY_CURRENT', model, reqOrdinary, apertureReceipt, oct02Sys),
        CURRENT_RESTORED_DEFAULT_PR1549: summarizeAssembly('CURRENT_RESTORED_DEFAULT_PR1549', model, reqRestoredDefault, apertureReceipt, oct02Sys),
        OCT02_LITERAL_ARCHIVED: summarizeAssembly('OCT02_LITERAL_ARCHIVED', model, reqOct02Literal, apertureReceipt, oct02Sys),
        OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED: summarizeAssembly('OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED', model, reqDramaturgyCandidate, apertureReceipt, oct02Sys),
        OCT02_DRAMATURGY_CANDIDATE_ARGON: summarizeAssembly('OCT02_DRAMATURGY_CANDIDATE_ARGON', argonModel, reqArgonDramaturgyCandidate, apertureReceipt, oct02Sys),
        ATTACHMENT_ROUTE_HIGH_UNPROFILED: summarizeAssembly('ATTACHMENT_ROUTE_HIGH_UNPROFILED', model, reqAttachment, apertureReceipt, oct02Sys),
        MULTI_TURN_RAW_HISTORY: Object.freeze({
          ...summarizeAssembly('MULTI_TURN_RAW_HISTORY', model, reqMultiTurn, apertureReceipt, oct02Sys),
          priorModelHistoryExactByteMatch: multiTurnModelHistoryText === priorModelText,
          priorModelHistorySha256: sha256(multiTurnModelHistoryText),
          syntheticWrapperInjected: /Kʰonapolit\s*∴\s*Tauric Diana bots/.test(multiTurnModelHistoryText)
        })
      })
    });
  }

  return Object.freeze({
    schema: OFFLINE_DISCRIMINATOR_SCHEMA,
    executionPosture: 'OFFLINE_ZERO_SPEND_REQUEST_PARITY_ONLY',
    paidProviderCalls: 0,
    historicalReferenceCommit: HISTORICAL_REFERENCE_COMMIT,
    currentRestoredProsodyProfile: MARROWLINE_RESTORED_PROSODY_PROFILE,
    stagedDramaturgyCandidateProfile: MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE,
    productionDefaultModified: false,
    tasks: Object.freeze(taskReports)
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = buildOfflineDiscriminatorPacket();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
