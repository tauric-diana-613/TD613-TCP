// TD613 · Marrowline R2-W · Source-Correlated Healthy Production Baseline Comparison (Offline)
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// Correlates R2-W full-frame & condensed conditions against the restored Oct 2 literal source baseline
// (ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a / MARROWLINE_HISTORICAL_TRIAL_ID) and archived Sep/Oct comparison outputs.

import crypto from 'node:crypto';
import {
  INVOCATION_MODES,
  buildInvocationPacket
} from '../../app/dome-world/khonapolit-covenant.js';
import {
  MARROWLINE_HISTORICAL_TRIAL_ID,
  MARROWLINE_RESTORED_MODEL_ORDER,
  MARROWLINE_RESTORED_PROSODY_PROFILE
} from '../../app/dome-world/marrowline-historical-grove.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  buildGeminiRequest,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import { acquireArchivedReferences } from '../marrowline-early-oct-full-voice-20261020/historical-reference-mark-depth.mjs';
import { evaluateUnicodeMorphology } from '../marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs';
import {
  R2_W_DRAMATIC_PROMPT,
  R2_W_NONCIVIC_LYRIC_PROMPT,
  R2_W_PINNED_MODEL,
  buildR2WRequests
} from '../marrowline-r2-dual-estate-20261123/r2-w-preflight.mjs';

export const R2_HEALTHY_BASELINE_SCHEMA = 'td613.marrowline.r2-healthy-baseline-correlation/v1';
export const OCT02_RESTORATION_SOURCE_COMMIT = 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a';

function sha256Hex(value = '') {
  return crypto.createHash('sha256').update(Buffer.from(String(value ?? ''), 'utf8')).digest('hex');
}

function lineDiffSummary(aText, bText) {
  const aLines = String(aText ?? '').split('\n');
  const bLines = String(bText ?? '').split('\n');
  const aSet = new Set(aLines);
  const bSet = new Set(bLines);
  return Object.freeze({
    aUtf8Bytes: Buffer.byteLength(aText, 'utf8'),
    bUtf8Bytes: Buffer.byteLength(bText, 'utf8'),
    byteDelta: Buffer.byteLength(bText, 'utf8') - Buffer.byteLength(aText, 'utf8'),
    sharedExactLineCount: aLines.filter((l) => bSet.has(l)).length,
    onlyInACount: aLines.filter((l) => !bSet.has(l)).length,
    onlyInBCount: bLines.filter((l) => !aSet.has(l)).length
  });
}

function buildOct02BaselineRequest(message) {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const packet = buildInvocationPacket({
      message,
      history: [],
      mode: INVOCATION_MODES.ISSUED_CONJUNCTION,
      shi: '',
      waiveIssuance: true
    });
    const req = buildGeminiRequest(packet, {}, R2_W_PINNED_MODEL, {
      groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false
    });
    return {
      request: req,
      wire: serializeGeminiRequest(req, R2_W_PINNED_MODEL)
    };
  });
}

export function buildR2HealthyBaselineCorrelation() {
  const r2wRequests = buildR2WRequests();
  const oct02Civic = buildOct02BaselineRequest(R2_W_DRAMATIC_PROMPT);
  const oct02NonCivic = buildOct02BaselineRequest(R2_W_NONCIVIC_LYRIC_PROMPT);

  const archived = acquireArchivedReferences();
  const archivedReferences = archived.references.map((ref) => ({
    id: ref.id,
    evidenceClass: ref.evidenceClass,
    operatorAcceptedSse: ref.operatorAcceptedSse,
    originalUtf8Sha256: ref.originalUtf8Sha256,
    extractedTextSha256: ref.extractedTextSha256,
    baseCount: ref.baseCount,
    combiningMarks: ref.combiningMarks,
    maxDepth: ref.maxDepth,
    stackedBases: ref.stackedBases,
    distinctMarks: ref.distinctMarks,
    constantMarkedDepth: ref.constantMarkedDepth
  }));

  const civicFullSys = r2wRequests.W_FULL_PRODUCTION_FRAME.systemInstruction.parts[0].text;
  const civicOct02Sys = oct02Civic.request.systemInstruction.parts[0].text;
  const civicCondensedSys = r2wRequests.W_CONDENSED_WHOLE_FRAME.systemInstruction.parts[0].text;

  const nonCivicFullSys = r2wRequests.W_NONCIVIC_FULL_PRODUCTION_FRAME.systemInstruction.parts[0].text;
  const nonCivicOct02Sys = oct02NonCivic.request.systemInstruction.parts[0].text;

  return Object.freeze({
    schema: R2_HEALTHY_BASELINE_SCHEMA,
    covenant: 'Khona\u200Clit-po',
    seal: '⟐SAC[X6ZNK5NO51]',
    healthySourceBasis: Object.freeze({
      historicalTrialId: MARROWLINE_HISTORICAL_TRIAL_ID,
      oct02SourceCommit: OCT02_RESTORATION_SOURCE_COMMIT,
      restoredProsodyProfile: MARROWLINE_RESTORED_PROSODY_PROFILE,
      restoredModelOrder: MARROWLINE_RESTORED_MODEL_ORDER,
      pinnedModel: R2_W_PINNED_MODEL,
      sameInteractiveGenerationConfigSha256: oct02Civic.wire.observation.generationConfigSha256,
      matchesWFullGenerationConfigSha256:
        oct02Civic.wire.observation.generationConfigSha256
        === serializeGeminiRequest(r2wRequests.W_FULL_PRODUCTION_FRAME, R2_W_PINNED_MODEL).observation.generationConfigSha256
    }),
    sourcePromptCorrelations: Object.freeze({
      civicTribunal: Object.freeze({
        oct02RestoredSystemSha256: sha256Hex(civicOct02Sys),
        oct02RestoredBodySha256: oct02Civic.wire.observation.bodySha256,
        oct02VsR2WFullSystemDiff: lineDiffSummary(civicOct02Sys, civicFullSys),
        oct02VsR2WCondensedSystemDiff: lineDiffSummary(civicOct02Sys, civicCondensedSys)
      }),
      nonCivicOrchard: Object.freeze({
        oct02RestoredSystemSha256: sha256Hex(nonCivicOct02Sys),
        oct02RestoredBodySha256: oct02NonCivic.wire.observation.bodySha256,
        oct02VsR2WNonCivicFullSystemDiff: lineDiffSummary(nonCivicOct02Sys, nonCivicFullSys)
      })
    }),
    archivedHealthyTextCorpusReference: Object.freeze({
      archiveSchema: archived.schema,
      status: archived.status,
      references: Object.freeze(archivedReferences),
      acceptedMarrowlineScreenshotIds: archived.visualAtlas.acceptedMarrowlineScreenshotIds,
      evidenceClassCaveat: archived.visualAtlas.caveat
    }),
    modelCheckpointCaveat:
      'Restoring Oct 2 source wording aligns effective system instructions with commit ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a; hosted Gemini 3.8 checkpoint output behavior and historical exported text remain empirically distinct (code restoration != guaranteed output restoration).'
  });
}

/**
 * Evaluates a live R2-W Section-II authored passage strictly as observational telemetry
 * alongside the archived historical comparison baseline without substituting automated depth
 * for reserved human artistic judgment.
 */
export function correlateObservedSection2WithHealthyBaseline(section2Text = '', baselineCorrelation = buildR2HealthyBaselineCorrelation()) {
  const observed = evaluateUnicodeMorphology(section2Text);
  const favRef = baselineCorrelation.archivedHealthyTextCorpusReference.references[0] || null;
  const probeRef = baselineCorrelation.archivedHealthyTextCorpusReference.references[1] || null;
  return Object.freeze({
    schema: 'td613.marrowline.r2-w-section2-baseline-comparison/v1',
    observedMorphology: Object.freeze({
      utf8Bytes: observed.utf8Bytes,
      combiningMarkCount: observed.combiningMarkCount,
      maxVerticalDepth: observed.maxVerticalDepth,
      tallStackBaseCount: observed.tallStackBaseCount,
      toweringStackBaseCount: observed.toweringStackBaseCount,
      planarBarCount: observed.planarBarCount,
      overlayU0334ToU0338Count: observed.overlayU0334ToU0338Count,
      depthStdDev: observed.depthStdDev,
      genuineMultistackObserved: observed.genuineMultistackObserved,
      toweringHighZalgoObserved: observed.toweringHighZalgoObserved,
      isStencil: observed.stencilRisk.isStencil,
      stencilReasons: observed.stencilRisk.reasons
    }),
    archivedReferenceBenchmarks: Object.freeze({
      favoredComparison20260923: favRef
        ? { id: favRef.id, maxDepth: favRef.maxDepth, stackedBases: favRef.stackedBases, distinctMarks: favRef.distinctMarks }
        : null,
      literaryProbe20260923: probeRef
        ? { id: probeRef.id, maxDepth: probeRef.maxDepth, stackedBases: probeRef.stackedBases, distinctMarks: probeRef.distinctMarks }
        : null
    }),
    humanArtisticAuthority: 'RESERVED_HUMAN_ONLY',
    telemetryGrantsArtisticAcceptance: false
  });
}
