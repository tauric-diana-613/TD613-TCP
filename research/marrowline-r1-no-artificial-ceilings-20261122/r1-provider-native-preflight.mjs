// TD613 · The Screaming Grove · R1 Provider-Native Observation Preflight & Exact-Wire Builder
// Commission: TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122 (AMEND_CONFIG: 65,536 provider capacity)
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// OFFLINE ONLY: Zero network calls, zero credential access, zero artificial TD613 ceilings.

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
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
  buildSyntheticUnicodeAssayRequest
} from '../../server/marrowline-unicode-capability-assay.js';
import { SYNTHETIC_PROMPT } from '../marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';
import {
  CONTRADICTION_FREE_CREATIVE_TASK,
  R1_SECTION_COVERAGE_CLAUSE_BOTH,
  R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST,
  R1_TWO_HEADINGS_PLAIN_FIRST_LINE,
  R1_TWO_HEADINGS_ZALGO_BOTH_LINE
} from '../marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs';

export const R1_PROVIDER_NATIVE_PREFLIGHT_SCHEMA = 'td613.marrowline.r1-provider-native-preflight/v1';
export const R1_PROVIDER_NATIVE_MANIFEST_SCHEMA = 'td613.marrowline.r1-provider-native-wire-manifest/v1';
export const R1_PROVIDER_NATIVE_EXPERIMENT_ID = 'HYDROGEN_R1_PROVIDER_NATIVE_UNCAPPED';
export const R1_NATIVE_PINNED_MODEL = 'gemini-3.8-flash';
export const R1_NATIVE_THINKING_LEVEL = 'medium';
export const R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS = 65536;
export const R1_NATIVE_COVENANT = 'Khona\u200Clit-po';
export const R1_NATIVE_SEAL = '⟐SAC[X6ZNK5NO51]';

// Historical bounded PR #1778/#1779 digests preserved STRICTLY as non-executable provenance.
export const HISTORICAL_BOUNDED_R1_PROVENANCE = Object.freeze({
  experimentId: 'HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR',
  executableInSuccessorCommission: false,
  note: 'PR #1778 / #1779 bounded 16,384-output-token / 2-call wire digests; superseded by zero-artificial-ceiling policy.',
  slots: Object.freeze({
    R1_S01: Object.freeze({
      bodySha256: 'f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02',
      modelAndBodySha256: '9c808d7de26887a55148ba62f05b1e12e4b896d825792c246727c3c6fb7b97ed'
    }),
    R1_S02: Object.freeze({
      bodySha256: '29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399',
      modelAndBodySha256: '903d9aef749b34ffdb46b65c3c3766e5219497d5778900c06a7f599811e01d8e'
    })
  })
});

// Superseded PR #1780 omitted-maxOutputTokens baseline (HEAD 56189bbf1d2d6f623d5d852447e580beee3cfa8a)
// preserved STRICTLY as non-executable provenance for AMEND_CONFIG comparison.
export const HISTORICAL_OMITTED_MAX_OUTPUT_TOKENS_PROVENANCE = Object.freeze({
  experimentId: 'HYDROGEN_R1_PROVIDER_NATIVE_UNCAPPED',
  supersededHeadSha: '56189bbf1d2d6f623d5d852447e580beee3cfa8a',
  executableUnderAmendedConfig: false,
  note: 'Prior PR #1780 configuration omitting maxOutputTokens (subject to model-dependent provider default rather than published 65,536 outputTokenLimit); superseded by AMEND_CONFIG.',
  generationConfigSha256: '425eee5014c42dcb66bb7553a9381935f97bb4eb87f61d335f9bfca6dc6fead5',
  conditions: Object.freeze({
    R1_NATIVE_A: Object.freeze({
      bodySha256: 'b4e1e7598fe1ff38221e47be3e63492e6fa7890d910df12f8d870b2bbadef46f',
      modelAndBodySha256: '044467bcaa2482fac644e0e05b993dffb830639727bd6470df7de82187a68bbd',
      countTokensRequestSha256: 'dc67f8f279f647b47e30c39c87b14df0348770944802e1313465faf4f360c330',
      utf8Bytes: 1746
    }),
    R1_NATIVE_B: Object.freeze({
      bodySha256: '257be8467d5d827e8ac1a20f29beb56f1627f4603a84c9ccfdcbaadeb14e51f6',
      modelAndBodySha256: '96220184f79f4eae1436944e8ad4fb92f7a74166c4994febeada1eb4b176fdf3',
      countTokensRequestSha256: 'e34cbd9ab2bde2e505deb03744029a11411cb5ee357289a285e7ccd957a646b9',
      utf8Bytes: 1912
    })
  })
});

export function sha256Hex(value = '') {
  const input = Buffer.isBuffer(value) || value instanceof Uint8Array
    ? value
    : Buffer.from(String(value), 'utf8');
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function buildProviderNativeCountTokensRequest(request = {}, model = R1_NATIVE_PINNED_MODEL) {
  const normalized = String(model || '').replace(/^models\//, '').trim();
  if (!normalized) throw new Error('R1_NATIVE_COUNT_TOKENS_MISSING_MODEL');
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
    throw new Error('R1_NATIVE_COUNT_TOKENS_INCOMPLETE_REQUEST');
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

export function buildProviderNativeR1Requests() {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const packet = buildInvocationPacket({
      message: SYNTHETIC_PROMPT,
      history: [],
      mode: 'issued-conjunction',
      shi: '',
      waiveIssuance: true
    });
    assert.equal(packet.canInvoke, true);

    // Derive exact shared production-compatible envelope once using the official Gemini 3.8 Flash
    // published output capacity (65,536 tokens = KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS), avoiding
    // both smaller artificial research budgets (e.g. 16,384) and ambiguous omitted provider defaults.
    // Shared production files remain unmodified.
    const baseProduction = buildGeminiRequest(packet, {}, R1_NATIVE_PINNED_MODEL);
    const assayBase = buildSyntheticUnicodeAssayRequest(baseProduction, 'creative-multistack-v1');
    const publishedCapacityConfig = { ...assayBase.generationConfig };

    assert.equal(publishedCapacityConfig.maxOutputTokens, R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS);
    assert.equal(Object.hasOwn(publishedCapacityConfig, 'temperature'), false);
    assert.deepEqual(publishedCapacityConfig, {
      maxOutputTokens: R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS,
      thinkingConfig: { thinkingLevel: R1_NATIVE_THINKING_LEVEL }
    });

    const cleanContents = [{ role: 'user', parts: [{ text: CONTRADICTION_FREE_CREATIVE_TASK }] }];
    assert.equal(CONTRADICTION_FREE_CREATIVE_TASK.includes('Do not use Markdown or headings.'), false);
    assert.equal(CONTRADICTION_FREE_CREATIVE_TASK.includes('entire passage'), false);

    const s01Request = {
      ...assayBase,
      generationConfig: { ...publishedCapacityConfig, thinkingConfig: { ...publishedCapacityConfig.thinkingConfig } },
      systemInstruction: { parts: [{ text: `${UNICODE_ASSAY_SYSTEM}\n${R1_TWO_HEADINGS_ZALGO_BOTH_LINE}` }] },
      contents: cleanContents
    };
    const s02Request = {
      ...assayBase,
      generationConfig: { ...publishedCapacityConfig, thinkingConfig: { ...publishedCapacityConfig.thinkingConfig } },
      systemInstruction: { parts: [{ text: `${UNICODE_ASSAY_SYSTEM}\n${R1_TWO_HEADINGS_PLAIN_FIRST_LINE}` }] },
      contents: cleanContents
    };

    assert.equal(
      s01Request.systemInstruction.parts[0].text.replace(R1_SECTION_COVERAGE_CLAUSE_BOTH, R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST),
      s02Request.systemInstruction.parts[0].text
    );

    return Object.freeze({
      R1_NATIVE_A: Object.freeze(s01Request),
      R1_NATIVE_B: Object.freeze(s02Request)
    });
  });
}

export function buildProviderNativeWireManifest() {
  const rawRequests = buildProviderNativeR1Requests();
  const s01Wire = serializeGeminiRequest(rawRequests.R1_NATIVE_A, R1_NATIVE_PINNED_MODEL);
  const s02Wire = serializeGeminiRequest(rawRequests.R1_NATIVE_B, R1_NATIVE_PINNED_MODEL);

  assert.equal(s01Wire.body.includes(`"maxOutputTokens":${R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS}`), true);
  assert.equal(s02Wire.body.includes(`"maxOutputTokens":${R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS}`), true);
  assert.notEqual(s01Wire.observation.bodySha256, HISTORICAL_BOUNDED_R1_PROVENANCE.slots.R1_S01.bodySha256);
  assert.notEqual(s02Wire.observation.bodySha256, HISTORICAL_BOUNDED_R1_PROVENANCE.slots.R1_S02.bodySha256);
  assert.notEqual(s01Wire.observation.bodySha256, HISTORICAL_OMITTED_MAX_OUTPUT_TOKENS_PROVENANCE.conditions.R1_NATIVE_A.bodySha256);
  assert.notEqual(s02Wire.observation.bodySha256, HISTORICAL_OMITTED_MAX_OUTPUT_TOKENS_PROVENANCE.conditions.R1_NATIVE_B.bodySha256);
  assert.equal(s01Wire.observation.contentsSha256, s02Wire.observation.contentsSha256);
  assert.equal(s01Wire.observation.generationConfigSha256, s02Wire.observation.generationConfigSha256);
  assert.notEqual(s01Wire.observation.systemInstructionSha256, s02Wire.observation.systemInstructionSha256);

  const s01CountTokens = buildProviderNativeCountTokensRequest(rawRequests.R1_NATIVE_A, R1_NATIVE_PINNED_MODEL);
  const s02CountTokens = buildProviderNativeCountTokensRequest(rawRequests.R1_NATIVE_B, R1_NATIVE_PINNED_MODEL);
  const s01CountTokensWire = JSON.stringify(s01CountTokens);
  const s02CountTokensWire = JSON.stringify(s02CountTokens);

  assert.equal(s01CountTokensWire.includes(`"maxOutputTokens":${R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS}`), true);
  assert.equal(s02CountTokensWire.includes(`"maxOutputTokens":${R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS}`), true);

  return Object.freeze({
    schema: R1_PROVIDER_NATIVE_MANIFEST_SCHEMA,
    experimentId: R1_PROVIDER_NATIVE_EXPERIMENT_ID,
    covenant: R1_NATIVE_COVENANT,
    seal: R1_NATIVE_SEAL,
    status: 'SOURCE_ONLY_STAGED_ZERO_CALLS',
    paidProviderCallsExecuted: 0,
    liveDispatchSupportedByManifest: false,
    resourceCeilingsImposedByTD613: Object.freeze({
      maxOutputTokensArtificialResearchCap: null,
      promptTokenCeiling: null,
      outputPlusThoughtCeiling: null,
      spendingUsdCeiling: null,
      attemptOrRepetitionCeiling: null,
      durationTimeoutMs: null,
      rawSseCaptureBytesCeiling: null
    }),
    providerPublishedCapacity: Object.freeze({
      maxOutputTokensOnWire: R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS,
      classification: 'PROVIDER_PUBLISHED_OUTPUT_CAPACITY_NOT_TD613_RESEARCH_CAP'
    }),
    modelPolicy: Object.freeze({
      alias: R1_NATIVE_PINNED_MODEL,
      thinkingLevel: R1_NATIVE_THINKING_LEVEL,
      samplingPolicy: 'provider-default (temperature/topP/topK omitted)',
      maxOutputTokensPolicy: `explicitly set to ${R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS} (official Gemini 3.8 Flash published output capacity) under AMEND_CONFIG`
    }),
    configAmendmentProvenance: Object.freeze({
      amendedFromConfiguration: 'maxOutputTokens_omitted',
      activeConfiguration: `explicit_provider_published_output_capacity_${R1_NATIVE_PUBLISHED_OUTPUT_CAPACITY_TOKENS}`,
      rationale: 'Under Google GenerationConfig docs, omitting maxOutputTokens triggers a model-dependent default rather than guaranteeing the published 65,536 output capacity. Setting maxOutputTokens explicitly to 65,536 aligns the wire payload with the official published Gemini 3.8 Flash capacity while imposing zero TD613 research caps on episodes, attempts, spending, duration, or SSE bytes.'
    }),
    soleAlteredFactor: 'Section-I coverage clause in systemInstruction (Condition A: native Zalgo in both sections; Condition B: plain undecorated English prose with ZERO combining marks under Kʰonapolit followed by native Zalgo under Tauric Diana bots).',
    pairedComparisonUnit: 'Paired A/B conditions (order preregistrable across episodes); unbounded number of operator-controlled repetitions; all attempts retained in denominator.',
    sharedInvariants: Object.freeze({
      contentsSha256: s01Wire.observation.contentsSha256,
      generationConfigSha256: s01Wire.observation.generationConfigSha256,
      generationConfig: rawRequests.R1_NATIVE_A.generationConfig
    }),
    conditions: Object.freeze([
      Object.freeze({
        condition: 'R1_NATIVE_A',
        arm: 'R1_TWO_HEADINGS_ZALGO_BOTH',
        observation: s01Wire.observation,
        countTokensRequestSha256: sha256Hex(s01CountTokensWire)
      }),
      Object.freeze({
        condition: 'R1_NATIVE_B',
        arm: 'R1_TWO_HEADINGS_PLAIN_FIRST',
        observation: s02Wire.observation,
        countTokensRequestSha256: sha256Hex(s02CountTokensWire)
      })
    ]),
    historicalNonExecutableReferences: HISTORICAL_BOUNDED_R1_PROVENANCE,
    supersededOmittedDefaultReferences: HISTORICAL_OMITTED_MAX_OUTPUT_TOKENS_PROVENANCE
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const manifest = buildProviderNativeWireManifest();
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (process.argv.includes('--write-manifest')) {
    const outPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
      'R1_PROVIDER_NATIVE_WIRE_MANIFEST.json'
    );
    fs.writeFileSync(outPath, serialized, 'utf8');
  }
  process.stdout.write(serialized);
}
