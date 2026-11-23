// TD613 · Marrowline R2 · Pure Offline Verification & Preview Plan CLI
// Commission: TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// OFFLINE ONLY: Zero env credential reads, zero network dispatch, zero nonce claims,
// zero writes to R1 custody, and zero invented empirical provider outputs.

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  R2_U_CALIBRATED_CONTROLS,
  evaluateLiteralCopyFidelity,
  evaluateUnicodeMorphology
} from './r2-unicode-evaluator.mjs';
import {
  R2_U_PINNED_COPY_SPECIMEN,
  buildR2UCounterbalancePlan,
  buildR2URequests,
  buildR2UWireManifest
} from './r2-u-preflight.mjs';
import {
  buildR2WBlindPacket,
  buildR2WRequests,
  buildR2WWireManifest,
  evaluateR2WQualitativeRubric
} from './r2-w-preflight.mjs';
import { evaluateR2DromologicalGate } from './r2-dromological-gate.mjs';

export const R2_OFFLINE_VERIFICATION_SCHEMA = 'td613.marrowline.r2-offline-verification/v1';

const FORBIDDEN_LIVE_FLAGS = Object.freeze([
  '--execute',
  '--paid',
  '--live',
  '--deploy',
  '--sign',
  '--mint-grant'
]);

export function sha256Hex(value = '') {
  return crypto.createHash('sha256').update(Buffer.from(String(value ?? ''), 'utf8')).digest('hex');
}

export function buildR2OfflinePreviewPlan() {
  const uRequests = buildR2URequests();
  const uManifest = buildR2UWireManifest();
  const uPlanC1 = buildR2UCounterbalancePlan('U_C1_RULES_VS_CONTRAST_EXAMPLES', 2);

  const wRequests = buildR2WRequests();
  const wManifest = buildR2WWireManifest();

  // Calibrated reference checks (synthetic typography fixtures ONLY, never provider returns)
  const plainRef = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.PLAIN_BASELINE_REF.sample);
  const stencilRef = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.ONE_MARK_STENCIL_REF.sample);
  const nearUniformRef = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.NEAR_UNIFORM_DEPTH3_STENCIL_REF.sample);
  const planarRef = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.PLANAR_BAR_COUNTERFEIT_REF.sample);
  const enclosingRef = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.ENCLOSING_TRICK_REF.sample);
  const multiRef = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample);
  const altRef = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.ALTERNATE_NOTATION_GRAMMAR_REF.sample);
  const copyExactRef = evaluateLiteralCopyFidelity(R2_U_PINNED_COPY_SPECIMEN, R2_U_PINNED_COPY_SPECIMEN);
  const copyNfcRef = evaluateLiteralCopyFidelity(R2_U_PINNED_COPY_SPECIMEN, R2_U_PINNED_COPY_SPECIMEN.normalize('NFC'));

  assert.equal(plainRef.combiningMarkCount, 0);
  assert.equal(stencilRef.maxVerticalDepth, 1);
  assert.equal(stencilRef.stencilRisk.isStencil, true);
  assert.equal(nearUniformRef.stencilRisk.nearUniformDominantDepthStencil, true);
  assert.equal(nearUniformRef.genuineMultistackObserved, false);
  assert.equal(planarRef.stencilRisk.planarBarAxisCollapse, true);
  assert.equal(planarRef.verticalAboveCount + planarRef.verticalBelowCount, 0);
  assert.equal(enclosingRef.stencilRisk.enclosingOrnamentCollapse, true);
  assert.equal(multiRef.genuineMultistackObserved, true);
  assert.equal(multiRef.toweringHighZalgoObserved, true);
  assert.ok(multiRef.maxVerticalDepth >= 8);
  assert.equal(altRef.combiningMarkCount, 0);
  assert.ok(altRef.alternateNotationBracketTokens >= 3);
  assert.equal(copyExactRef.rawByteExact, true);
  assert.equal(copyNfcRef.rawByteExact, false);
  assert.equal(copyNfcRef.silentNormalizationDetected, true);

  // Synthetic non-secret preview blind packet & rubric template (explicitly labeled SYNTHETIC_FIXTURE)
  const syntheticPreviewWorks = [
    {
      conditionId: 'W_FULL_PRODUCTION_FRAME',
      authoredText:
        'Kʰonapolit\n' +
        'Synthetic offline calibration fixture: tracing denominator erasure along the winter tribunal.\n\n' +
        'Tauric Diana bots\n' +
        `${R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample}\n\n⟐`
    },
    {
      conditionId: 'W_CONDENSED_WHOLE_FRAME',
      authoredText:
        'Kʰonapolit\n' +
        'Synthetic offline calibration fixture: compact framing baseline.\n\n' +
        'Tauric Diana bots\n' +
        `${R2_U_CALIBRATED_CONTROLS.ONE_MARK_STENCIL_REF.sample}\n\n⟐`
    }
  ];
  const blindPreview = buildR2WBlindPacket({
    episodeId: 1,
    seed: 'r2-offline-synthetic-preview',
    works: syntheticPreviewWorks
  });
  const rubricTemplatePreview = evaluateR2WQualitativeRubric({
    authoredText: syntheticPreviewWorks[0].authoredText,
    outputMetadata: { finishReason: 'STOP', streamed: true, parseErrors: 0 },
    humanJudgment: {
      verdict: 'ARTISTIC_REJECTED',
      criteria: {
        expressiveSufficiency: false,
        distinctVoicesAndAgency: false
      },
      notes: 'Synthetic offline fixture rejection example proving technical pass does not force artistic acceptance.'
    }
  });
  assert.equal(rubricTemplatePreview.technicalGatePassed, true);
  assert.equal(rubricTemplatePreview.humanArtisticVerdict, 'ARTISTIC_REJECTED');

  // Gate verification across staged offline state + R1-style stopped metadata failure fixture
  const gateOfflineStage = evaluateR2DromologicalGate({
    sourceStaged: true,
    authority: { signatureValid: false },
    replayProtection: { nonceClaimed: false }
  });
  const gatePrematureSuccessTest = evaluateR2DromologicalGate({
    sourceStaged: true,
    authority: { signatureValid: true },
    replayProtection: { nonceClaimed: true },
    providerMetadata: { checked: true, ok: false, expectedOutputTokenLimit: 65536 },
    processExitedZero: true,
    claimedEmpiricalSuccessWithoutModelOutput: true
  });
  assert.equal(gateOfflineStage.overallDisposition, 'SOURCE_STAGED');
  assert.equal(gatePrematureSuccessTest.held, true);
  assert.equal(gatePrematureSuccessTest.overallDisposition, 'HELD');
  assert.equal(gatePrematureSuccessTest.lifecycleCapabilities.EMPIRICALLY_QUALIFIED, false);

  return Object.freeze({
    schema: R2_OFFLINE_VERIFICATION_SCHEMA,
    commission: 'TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123',
    status: 'R2_OFFLINE_QUALIFIED_HELD_FOR_HUMAN_DESIGN_REVIEW',
    empiricalProviderReturnsIncluded: false,
    paidProviderCallsExecuted: 0,
    credentialsAccessed: false,
    nonceClaimsWritten: 0,
    r1CustodyTouched: false,
    estates: Object.freeze({
      r2U: Object.freeze({
        experimentId: uManifest.experimentId,
        armCount: Object.keys(uRequests).length,
        generationConfigSha256: uManifest.sharedInvariants.generationConfigSha256,
        plannedContrastIds: uManifest.plannedPairwiseContrasts.map((c) => c.contrastId),
        counterbalancePreview: uPlanC1,
        armBodySha256: Object.fromEntries(uManifest.arms.map((a) => [a.armId, a.observation.bodySha256]))
      }),
      r2W: Object.freeze({
        experimentId: wManifest.experimentId,
        conditionCount: Object.keys(wRequests).length,
        generationConfigSha256: wManifest.sharedInvariants.generationConfigSha256,
        provenanceDiffSummary: Object.freeze({
          fullUtf8Bytes: wManifest.provenanceDiff.fullUtf8Bytes,
          condensedUtf8Bytes: wManifest.provenanceDiff.condensedUtf8Bytes,
          byteDelta: wManifest.provenanceDiff.byteDelta,
          protectedAnchorsAllPreserved: wManifest.provenanceDiff.protectedAnchorPreservation.every((a) => a.inFull && a.inCondensed)
        }),
        conditionBodySha256: Object.fromEntries(wManifest.conditions.map((c) => [c.conditionId, c.observation.bodySha256]))
      })
    }),
    calibratedControlChecks: Object.freeze({
      plainCombiningMarks: plainRef.combiningMarkCount,
      stencilMaxVerticalDepth: stencilRef.maxVerticalDepth,
      stencilDetected: stencilRef.stencilRisk.isStencil,
      nearUniformDepth3Rejected: !nearUniformRef.genuineMultistackObserved && nearUniformRef.stencilRisk.nearUniformDominantDepthStencil,
      planarBarsExcludedFromVertical: planarRef.verticalAboveCount === 0 && planarRef.verticalBelowCount === 0 && planarRef.stencilRisk.planarBarAxisCollapse,
      enclosingRejected: enclosingRef.stencilRisk.enclosingOrnamentCollapse,
      toweringHighZalgoMaxVerticalDepth: multiRef.maxVerticalDepth,
      toweringHighZalgoObserved: multiRef.toweringHighZalgoObserved,
      altNotationTokens: altRef.alternateNotationBracketTokens,
      copyExactOk: copyExactRef.rawByteExact,
      copyNfcMutationCaught: copyNfcRef.silentNormalizationDetected
    }),
    syntheticBlindPreviewPacket: blindPreview.publicPacket,
    syntheticRubricVetoDemo: Object.freeze({
      note: 'SYNTHETIC_OFFLINE_FIXTURE_ONLY_NOT_PROVIDER_DATA',
      technicalGatePassed: rubricTemplatePreview.technicalGatePassed,
      humanArtisticVerdict: rubricTemplatePreview.humanArtisticVerdict
    }),
    gateChecks: Object.freeze({
      stagedDisposition: gateOfflineStage.overallDisposition,
      prematureSuccessRejected: gatePrematureSuccessTest.held && gatePrematureSuccessTest.overallDisposition === 'HELD'
    })
  });
}

export function runVerifyR2OfflineCli(argv = []) {
  for (const flag of FORBIDDEN_LIVE_FLAGS) {
    if (argv.includes(flag)) {
      throw new Error(`R2_OFFLINE_COMMISSION_ONLY_NO_LIVE_EXECUTION:${flag}`);
    }
  }
  const previewPlan = buildR2OfflinePreviewPlan();
  const uManifest = buildR2UWireManifest();
  const wManifest = buildR2WWireManifest();

  if (argv.includes('--write-artifacts')) {
    const outDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
    fs.writeFileSync(path.join(outDir, 'R2_U_WIRE_MANIFEST.json'), `${JSON.stringify(uManifest, null, 2)}\n`, 'utf8');
    fs.writeFileSync(path.join(outDir, 'R2_W_WIRE_MANIFEST.json'), `${JSON.stringify(wManifest, null, 2)}\n`, 'utf8');
    fs.writeFileSync(path.join(outDir, 'R2_PREVIEW_PLAN.json'), `${JSON.stringify(previewPlan, null, 2)}\n`, 'utf8');
  }
  return previewPlan;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = runVerifyR2OfflineCli(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
