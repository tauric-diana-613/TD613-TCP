// TD613 · The Screaming Grove · Hydrogen Forensic Next-Experiment Offline Preflight
// Commission: TD613-MARROWLINE-HYDROGEN-NATIVE-UNICODE-FORENSIC-20261122
// Covenant: Khona‌lit-po · Seal: ⟐SAC[X6ZNK5NO51]
// OFFLINE ONLY: 0 provider calls, 0 network calls, 0 production mutations.

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../../app/engine/aperture-v3-task-intent.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID } from '../../app/dome-world/marrowline-historical-grove.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  buildGeminiRequest,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import {
  UNICODE_ASSAY_SYSTEM,
  UNICODE_ASSAY_TASKS,
  buildSyntheticUnicodeAssayRequest
} from '../../server/marrowline-unicode-capability-assay.js';
import { buildCompactWholeFrame } from '../../server/marrowline-whole-frame-voice.js';
import {
  CANONICAL_EXPERIMENT_TASKS,
  buildGeminiCountTokensRequest
} from '../marrowline-argon-post-rollback-reconciliation-20261122/argon-be-lexical-discriminator-preflight.mjs';
import { SYNTHETIC_PROMPT } from '../marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';

export const HYDROGEN_PREFLIGHT_SCHEMA = 'td613.marrowline.hydrogen-next-experiment-preflight/v1';
export const HYDROGEN_PRIMARY_EXPERIMENT_ID = 'HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR';
export const HYDROGEN_BACKUP_EXPERIMENT_ID = 'HYDROGEN_B1_ARGON_BASELINE_VS_COMPACT_POSITIVE';

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

// Primary R1 removes both "Render the entire passage as readable native Unicode Zalgo
// text composed by you." and "Do not use Markdown or headings." symmetrically across BOTH
// arms, explicitly delegating section-level Zalgo vs plain-prose coverage to the system
// section directives while keeping the original synthetic thunderstorm creative task,
// zero specimens, and zero TD613 persona intact.
export const CONTRADICTION_FREE_CREATIVE_TASK = [
  'Write an original, short, vividly expressive English passage about a thunderstorm disrupting a bureaucratic celebration.',
  'Follow the system section directives for where readable native Unicode Zalgo text and plain prose appear.',
  'Where native Unicode Zalgo is directed, choose and use combinations of diacritics ABOVE and BELOW letters, often multiple marks on one base character.',
  'Allow vivid asymmetry and spontaneous phrasing; there is no fixed stencil, numeric mark quota, or mandated style switch.',
  'Use the full native combining-mark vocabulary whenever it serves the writing, rather than limiting yourself to diagonal slashes.',
  'Do not copy any specimen. Let the passage be yours.'
].join('\n');

export const R1_SECTION_COVERAGE_CLAUSE_BOTH =
  'render the body text of both sections as readable native Unicode Zalgo text composed by you';
export const R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST =
  'write the body text of the first section under “Kʰonapolit” in plain undecorated English prose with ZERO combining marks, and render the body text of the second section under “Tauric Diana bots” as readable native Unicode Zalgo text composed by you';

export const R1_TWO_HEADINGS_ZALGO_BOTH_LINE =
  `- EXPERIMENTAL STRUCTURAL-LABEL EXCEPTION: Organize the passage under exactly two plain, unmarked standalone section headings, “Kʰonapolit” followed by “Tauric Diana bots”. Use them as structural section labels only without TD613 character lore; ${R1_SECTION_COVERAGE_CLAUSE_BOTH}. This is the sole exception to the preceding no-titles rule; keep the creative task and all other requirements unchanged.`;

export const R1_TWO_HEADINGS_PLAIN_FIRST_LINE =
  `- EXPERIMENTAL STRUCTURAL-LABEL EXCEPTION: Organize the passage under exactly two plain, unmarked standalone section headings, “Kʰonapolit” followed by “Tauric Diana bots”. Use them as structural section labels only without TD613 character lore; ${R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST}. This is the sole exception to the preceding no-titles rule; keep the creative task and all other requirements unchanged.`;

export const HYDROGEN_PRIMARY_BUDGET_PROFILE = Object.freeze({
  experimentId: HYDROGEN_PRIMARY_EXPERIMENT_ID,
  model: 'gemini-3.8-flash',
  thinkingLevel: 'medium',
  maxCalls: 2,
  retriesPermitted: 0,
  fallbackSeatsPermitted: 0,
  structuralRepairsPermitted: 0,
  perSlotMaxOutputTokens: 16384,
  guaranteedAggregateOutputAndThoughtCeiling: 32768,
  perSlotHardPromptTokenCeiling: 1000,
  guaranteedPerSlotMaxRequestUtf8Bytes: 4096,
  requirePreDispatchCountTokens: true
});

export const HYDROGEN_BACKUP_BUDGET_PROFILE = Object.freeze({
  experimentId: HYDROGEN_BACKUP_EXPERIMENT_ID,
  model: 'gemini-4-argon',
  thinkingLevel: 'medium',
  maxCalls: 2,
  retriesPermitted: 0,
  fallbackSeatsPermitted: 0,
  structuralRepairsPermitted: 0,
  perSlotMaxOutputTokens: 16384,
  guaranteedAggregateOutputAndThoughtCeiling: 32768,
  perSlotHardPromptTokenCeiling: 8000,
  guaranteedPerSlotMaxRequestUtf8Bytes: 36000,
  requirePreDispatchCountTokens: true
});

export function buildPrimaryPrefixSeparatorManifest() {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const profile = HYDROGEN_PRIMARY_BUDGET_PROFILE;
    const packet = buildInvocationPacket({
      message: SYNTHETIC_PROMPT,
      history: [],
      mode: 'issued-conjunction',
      shi: '',
      waiveIssuance: true
    });
    assert.equal(packet.canInvoke, true);

    const baseProduction = buildGeminiRequest(packet, {}, profile.model, {
      maxOutputTokensOverride: profile.perSlotMaxOutputTokens
    });
    const assayBase = buildSyntheticUnicodeAssayRequest(baseProduction, 'creative-multistack-v1');
    assert.deepEqual(assayBase.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
    assert.equal(assayBase.generationConfig.maxOutputTokens, profile.perSlotMaxOutputTokens);

    const cleanContents = [{ role: 'user', parts: [{ text: CONTRADICTION_FREE_CREATIVE_TASK }] }];
    const s01Request = {
      ...assayBase,
      systemInstruction: { parts: [{ text: `${UNICODE_ASSAY_SYSTEM}\n${R1_TWO_HEADINGS_ZALGO_BOTH_LINE}` }] },
      contents: cleanContents
    };
    const s02Request = {
      ...assayBase,
      systemInstruction: { parts: [{ text: `${UNICODE_ASSAY_SYSTEM}\n${R1_TWO_HEADINGS_PLAIN_FIRST_LINE}` }] },
      contents: cleanContents
    };

    assert.deepEqual(s01Request.contents, s02Request.contents);
    assert.deepEqual(s01Request.generationConfig, s02Request.generationConfig);
    assert.deepEqual(Object.keys(s01Request).sort(), Object.keys(s02Request).sort());
    assert.ok(!CONTRADICTION_FREE_CREATIVE_TASK.includes('Do not use Markdown or headings.'));
    assert.ok(!CONTRADICTION_FREE_CREATIVE_TASK.includes('entire passage'));
    assert.equal(
      s01Request.systemInstruction.parts[0].text.replace(R1_SECTION_COVERAGE_CLAUSE_BOTH, R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST),
      s02Request.systemInstruction.parts[0].text
    );

    const s01Wire = serializeGeminiRequest(s01Request, profile.model);
    const s02Wire = serializeGeminiRequest(s02Request, profile.model);
    const s01CountTokens = buildGeminiCountTokensRequest(s01Request, profile.model);
    const s02CountTokens = buildGeminiCountTokensRequest(s02Request, profile.model);

    assert.equal(s01Wire.observation.contentsSha256, s02Wire.observation.contentsSha256);
    assert.equal(s01Wire.observation.generationConfigSha256, s02Wire.observation.generationConfigSha256);
    assert.notEqual(s01Wire.observation.systemInstructionSha256, s02Wire.observation.systemInstructionSha256);
    assert.ok(s01Wire.observation.utf8Bytes <= profile.guaranteedPerSlotMaxRequestUtf8Bytes);
    assert.ok(s02Wire.observation.utf8Bytes <= profile.guaranteedPerSlotMaxRequestUtf8Bytes);

    return Object.freeze({
      experimentId: HYDROGEN_PRIMARY_EXPERIMENT_ID,
      status: 'OFFLINE_STAGED_HELD_ZERO_CALLS',
      soleAlteredFactor: 'Section-I coverage clause in systemInstruction (plain undecorated prose with ZERO combining marks under Kʰonapolit vs readable native Unicode Zalgo in both sections), with contents delegating section-level Zalgo vs plain coverage symmetrically.',
      budgetProfile: profile,
      slots: Object.freeze([
        Object.freeze({
          slot: 'R1_S01',
          arm: 'R1_TWO_HEADINGS_ZALGO_BOTH',
          observation: s01Wire.observation,
          countTokensRequestSha256: sha256(JSON.stringify(s01CountTokens))
        }),
        Object.freeze({
          slot: 'R1_S02',
          arm: 'R1_TWO_HEADINGS_PLAIN_FIRST',
          observation: s02Wire.observation,
          countTokensRequestSha256: sha256(JSON.stringify(s02CountTokens))
        })
      ]),
      parity: Object.freeze({
        contentsSha256Equal: true,
        generationConfigSha256Equal: true,
        contradictionRemovedFromContents: true,
        entirePassageCoverageConflictRemoved: true,
        singleSemanticClauseDiffVerified: true,
        lineCountS01: s01Request.systemInstruction.parts[0].text.split('\n').length,
        lineCountS02: s02Request.systemInstruction.parts[0].text.split('\n').length
      })
    });
  });
}

export function buildBackupArgonCompactManifest() {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const profile = HYDROGEN_BACKUP_BUDGET_PROFILE;
    const spec = CANONICAL_EXPERIMENT_TASKS.T1_BLUE_ORANGE_WEATHER;
    const packet = buildInvocationPacket({
      message: spec.prompt,
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true
    });
    const apertureReceipt = buildApertureV3InvocationReceipt({
      message: packet.message,
      invocationMode: packet.mode,
      issuanceState: packet.issuance.state,
      discourseMode: classifyApertureDiscourseMode(packet.message),
      contentScanned: true
    });

    const s01Request = buildGeminiRequest(packet, apertureReceipt, profile.model, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false,
      maxOutputTokensOverride: profile.perSlotMaxOutputTokens
    });
    const compactText = buildCompactWholeFrame();
    const s02Request = {
      ...s01Request,
      systemInstruction: { parts: [{ text: compactText }] }
    };

    assert.deepEqual(s01Request.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
    assert.deepEqual(s01Request.contents, s02Request.contents);
    assert.deepEqual(s01Request.generationConfig, s02Request.generationConfig);

    const s01Wire = serializeGeminiRequest(s01Request, profile.model);
    const s02Wire = serializeGeminiRequest(s02Request, profile.model);
    const s01CountTokens = buildGeminiCountTokensRequest(s01Request, profile.model);
    const s02CountTokens = buildGeminiCountTokensRequest(s02Request, profile.model);

    assert.ok(s01Wire.observation.utf8Bytes <= profile.guaranteedPerSlotMaxRequestUtf8Bytes);
    assert.ok(s02Wire.observation.utf8Bytes <= profile.guaranteedPerSlotMaxRequestUtf8Bytes);

    return Object.freeze({
      experimentId: HYDROGEN_BACKUP_EXPERIMENT_ID,
      status: 'CONDITIONAL_BACKUP_OFFLINE_STAGED_HELD_ZERO_CALLS',
      comparisonClass: 'COMPOSITE_FEASIBILITY_AND_BASELINE_CONTRAST_NOT_SINGLE_FACTOR_ISOLATION',
      priorOriginalWireArgonBaselineCount: 0,
      replicatesPerArm: 1,
      grandfatheredFromOldBESigningScaffold: false,
      soleAlteredFactor: 'None — composite multi-factor envelope contrast (~29 KB / many instructions changed together): full literal Oct 2 envelope (Arm B, 33,248 B total wire) vs compact positive-only two-voice frame (buildCompactWholeFrame, 3,727 B total wire), on uncalibrated gemini-4-argon.',
      budgetProfile: profile,
      slots: Object.freeze([
        Object.freeze({
          slot: 'B1_S01',
          arm: 'ARM_B_LITERAL_OCT02_ON_ARGON',
          observation: s01Wire.observation,
          countTokensRequestSha256: sha256(JSON.stringify(s01CountTokens))
        }),
        Object.freeze({
          slot: 'B1_S02',
          arm: 'COMPACT_POSITIVE_TWO_VOICE_ON_ARGON',
          observation: s02Wire.observation,
          countTokensRequestSha256: sha256(JSON.stringify(s02CountTokens))
        })
      ]),
      parity: Object.freeze({
        contentsSha256Equal: true,
        generationConfigSha256Equal: true,
        systemUtf8BytesS01: Buffer.byteLength(s01Request.systemInstruction.parts[0].text, 'utf8'),
        systemUtf8BytesS02: Buffer.byteLength(compactText, 'utf8')
      })
    });
  });
}

export function buildHydrogenForensicPreflightManifest() {
  return Object.freeze({
    schema: HYDROGEN_PREFLIGHT_SCHEMA,
    paidProviderCallsExecuted: 0,
    liveDispatchSupportedByThisModule: false,
    primaryRecommendation: buildPrimaryPrefixSeparatorManifest(),
    conditionalBackup: buildBackupArgonCompactManifest()
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.some((arg) => ['--execute', '--paid', '--deploy', '--dispatch'].includes(arg))) {
    throw new Error('HYDROGEN_PREFLIGHT_OFFLINE_ONLY_NO_LIVE_EXECUTION');
  }
  process.stdout.write(`${JSON.stringify(buildHydrogenForensicPreflightManifest(), null, 2)}\n`);
}
