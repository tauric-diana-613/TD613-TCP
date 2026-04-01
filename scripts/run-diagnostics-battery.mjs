import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as engine from '../app/engine/stylometry.js';
import personas from '../app/data/personas.js';
import {
  DIAGNOSTIC_BATTERY,
  DIAGNOSTIC_CORPUS,
  DIAGNOSTIC_CORPUS_BY_ID,
  DIAGNOSTIC_SAMPLE_LIBRARY
} from '../app/data/diagnostics.js';
import {
  buildCadenceLockRecord,
  buildMaskTransformationResult,
  resolvePersonaCatalog
} from '../app/toys/persona-gallery/model.js';
import { buildCorpusExtraction } from '../app/toys/persona-trainer/extractor.js';
import { validateCandidateAgainstFingerprint } from '../app/toys/persona-trainer/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reportsDir = path.join(repoRoot, 'reports', 'diagnostics');
const latestJsonPath = path.join(reportsDir, 'latest.json');
const latestMdPath = path.join(reportsDir, 'latest.md');

const FAILURE_BUCKETS = Object.freeze([
  'punctuation_only_shift',
  'surface_close_under_large_gap',
  'semantic_drift',
  'anchor_break',
  'one_sided_swap',
  'both_rejected_swap',
  'trainer_retrieval_fail',
  'mask_near_home_hold',
  'false_neighbor_convergence',
  'over_flattened_output',
  'register_miss',
  'sentence_span_miss'
]);

const PERSONA_LIBRARY = resolvePersonaCatalog(engine, personas, DIAGNOSTIC_SAMPLE_LIBRARY);
const PERSONA_BY_ID = Object.freeze(Object.fromEntries(PERSONA_LIBRARY.map((persona) => [persona.id, persona])));

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function round(value, digits = 4) {
  return Number(Number(value || 0).toFixed(digits));
}

function sortUnique(values = []) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function donorDistance(value, donorProfile) {
  const profile = typeof value === 'string' ? engine.extractCadenceProfile(value) : value;
  const fit = engine.compareTexts('', '', {
    profileA: profile,
    profileB: donorProfile
  });
  return round(
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    (fit.registerDistance || 0),
    3
  );
}

function hasSentenceDimension(changedDimensions = []) {
  return changedDimensions.some((dimension) => /^sentence-/.test(dimension));
}

function hasRegisterDimension(changedDimensions = []) {
  return changedDimensions.some((dimension) =>
    dimension === 'lexical-register' ||
    dimension === 'content-word-complexity' ||
    dimension === 'modifier-density' ||
    dimension === 'directness' ||
    dimension === 'abstraction-posture'
  );
}

function semanticSummary(result = {}) {
  return {
    propositionCoverage: round(result.semanticAudit?.propositionCoverage ?? 1),
    actorCoverage: round(result.semanticAudit?.actorCoverage ?? 1),
    actionCoverage: round(result.semanticAudit?.actionCoverage ?? 1),
    objectCoverage: round(result.semanticAudit?.objectCoverage ?? 1),
    polarityMismatches: result.semanticAudit?.polarityMismatches ?? 0,
    tenseMismatches: result.semanticAudit?.tenseMismatches ?? 0
  };
}

function protectedAnchorIntegrity(result = {}) {
  return round(result.protectedAnchorAudit?.protectedAnchorIntegrity ?? 1);
}

function visibleMovement(changedDimensions = [], lexemeSwaps = []) {
  if (!changedDimensions.length && !lexemeSwaps.length) {
    return false;
  }
  if (changedDimensions.every((dimension) => dimension === 'punctuation-shape') && !lexemeSwaps.length) {
    return false;
  }
  return true;
}

function bucketIf(condition, bucket, collection) {
  if (condition) {
    collection.push(bucket);
  }
}

function buildCaseNote(buckets = [], fallback) {
  return buckets.length ? `Buckets: ${buckets.join(', ')}.` : fallback;
}

function evaluateSwapCase(caseSpec, report) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const donorSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.donorId];
  const lane = report.laneA;
  const donorProfile = engine.extractCadenceProfile(donorSample.text);
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const outputProfile = engine.extractCadenceProfile(lane.text);
  const sourceDistance = donorDistance(sourceProfile, donorProfile);
  const outputDistance = donorDistance(outputProfile, donorProfile);
  const buckets = [];

  bucketIf(
    lane.changedDimensions.length > 0 &&
      lane.changedDimensions.every((dimension) => dimension === 'punctuation-shape') &&
      lane.lexemeSwapFamilies.length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    caseSpec.expectedPressure === 'same-fact-high' &&
      lane.nonTrivialShift === false &&
      Math.abs((sourceProfile.avgSentenceLength || 0) - (donorProfile.avgSentenceLength || 0)) >= 6,
    'surface_close_under_large_gap',
    buckets
  );
  bucketIf(
    lane.propositionCoverage < 0.85 ||
      lane.actorCoverage < 0.75 ||
      lane.actionCoverage < 0.75 ||
      lane.objectCoverage < 0.65 ||
      lane.polarityMismatches > 0,
    'semantic_drift',
    buckets
  );
  bucketIf(lane.protectedAnchorIntegrity < 1, 'anchor_break', buckets);
  bucketIf(report.pairAudit.oneSided, 'one_sided_swap', buckets);
  bucketIf(report.pairAudit.bothRejected, 'both_rejected_swap', buckets);
  bucketIf(caseSpec.mode === 'false-neighbor' && lane.transferClass === 'structural', 'false_neighbor_convergence', buckets);
  bucketIf(!visibleMovement(lane.changedDimensions, lane.lexemeSwapFamilies), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (donorProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(lane.changedDimensions),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== donorProfile.registerMode &&
      !hasRegisterDimension(lane.changedDimensions) &&
      lane.lexemeSwapFamilies.length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: sourceSample.familyId,
    sourceId: caseSpec.sourceId,
    donorId: caseSpec.donorId,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: lane.transferClass,
    realizationTier: lane.realizationTier,
    changedDimensions: lane.changedDimensions,
    visibleShift: lane.visibleShift,
    nonTrivialShift: lane.nonTrivialShift,
    donorDistance: {
      source: sourceDistance,
      output: outputDistance,
      improved: outputDistance < sourceDistance
    },
    semanticAudit: semanticSummary({
      semanticAudit: {
        propositionCoverage: lane.propositionCoverage,
        actorCoverage: lane.actorCoverage,
        actionCoverage: lane.actionCoverage,
        objectCoverage: lane.objectCoverage,
        polarityMismatches: lane.polarityMismatches,
        tenseMismatches: lane.tenseMismatches
      }
    }),
    protectedAnchorIntegrity: lane.protectedAnchorIntegrity,
    pairClassification: report.pairAudit.classification,
    changedDimensionsLabel: lane.changedDimensions.join(', '),
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), caseSpec.notes)
  };
}

function selectTrainerCandidate(sourceText, extraction, personaName) {
  const shell = {
    mode: 'persona',
    label: personaName,
    profile: { ...extraction.targetProfile },
    mod: engine.cadenceModFromProfile(extraction.targetProfile),
    strength: 0.84,
    source: 'trainer'
  };
  const strengths = [0.84, 0.72, 0.6];
  const candidates = [];

  for (const strength of strengths) {
    const transfer = engine.buildCadenceTransfer(sourceText, shell, { retrieval: true, strength });
    const validation = validateCandidateAgainstFingerprint(engine, transfer.text, extraction, {
      personaName,
      sampleLibrary: DIAGNOSTIC_SAMPLE_LIBRARY
    });
    candidates.push({
      text: transfer.text,
      transfer,
      validation,
      score:
        (validation.pass ? 1000 : 0) +
        (validation.retrievalContract.retrievalPass ? 400 : 0) +
        ((validation.scalarSummary.aggregate || 0) * 100) +
        (transfer.nonTrivialShift ? 20 : transfer.visibleShift ? 8 : 0) +
        ((transfer.changedDimensions || []).length * 2)
    });
  }

  candidates.sort((left, right) => right.score - left.score);
  return candidates[0];
}

function evaluateMaskCase(caseSpec) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const lockText = caseSpec.lockIds.map((id) => DIAGNOSTIC_CORPUS_BY_ID[id].text).join('\n\n');
  const persona = PERSONA_BY_ID[caseSpec.personaId];
  const lock = buildCadenceLockRecord(engine, {
    name: `${caseSpec.id} lock`,
    corpusText: lockText
  });
  const result = buildMaskTransformationResult(engine, {
    comparisonText: sourceSample.text,
    lock,
    persona
  });
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const lockProfile = lock.profile;
  const buckets = [];

  bucketIf(
    (result.transfer.changedDimensions || []).length > 0 &&
      (result.transfer.changedDimensions || []).every((dimension) => dimension === 'punctuation-shape') &&
      (result.transfer.lexemeSwaps || []).length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    result.contactSummary.fieldEffect === 'neither',
    'mask_near_home_hold',
    buckets
  );
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (lockProfile.avgSentenceLength || 0)) >= 6 &&
      result.contactSummary.fieldEffect === 'neither',
    'surface_close_under_large_gap',
    buckets
  );
  bucketIf(
    (result.transfer.semanticAudit?.propositionCoverage ?? 1) < 0.85 ||
      (result.transfer.semanticAudit?.actionCoverage ?? 1) < 0.75 ||
      (result.transfer.semanticAudit?.polarityMismatches ?? 0) > 0,
    'semantic_drift',
    buckets
  );
  bucketIf(protectedAnchorIntegrity(result.transfer) < 1, 'anchor_break', buckets);
  bucketIf(!visibleMovement(result.transfer.changedDimensions || [], result.transfer.lexemeSwaps || []), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (lockProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(result.transfer.changedDimensions || []),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== persona.profile.registerMode &&
      !hasRegisterDimension(result.transfer.changedDimensions || []) &&
      (result.transfer.lexemeSwaps || []).length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: caseSpec.sourceFamilyId,
    sourceId: caseSpec.sourceId,
    lockIds: caseSpec.lockIds,
    personaId: caseSpec.personaId,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: result.transfer.transferClass,
    realizationTier: result.transfer.realizationTier,
    changedDimensions: result.transfer.changedDimensions || [],
    visibleShift: Boolean(result.transfer.visibleShift),
    nonTrivialShift: Boolean(result.transfer.nonTrivialShift),
    donorDistance: {
      source: round(result.rawToLock?.meanTraceability || 0),
      output: round(result.maskedToLock?.meanTraceability || 0),
      improved: (result.deltaToLock?.traceability || 0) > 0
    },
    semanticAudit: semanticSummary(result.transfer),
    protectedAnchorIntegrity: protectedAnchorIntegrity(result.transfer),
    trainerValidation: null,
    pairClassification: result.contactSummary.contactClass,
    whatMoved: result.whatMovedSummary,
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), result.contactSummary.line)
  };
}

function evaluateTrainerCase(caseSpec) {
  const extractionText = caseSpec.extractionIds.map((id) => DIAGNOSTIC_CORPUS_BY_ID[id].text).join('\n\n');
  const extraction = buildCorpusExtraction(engine, extractionText);
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const chosen = selectTrainerCandidate(sourceSample.text, extraction, caseSpec.id);
  const transfer = chosen.transfer;
  const validation = chosen.validation;
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const targetProfile = extraction.targetProfile;
  const buckets = [];

  bucketIf(!validation.retrievalContract.retrievalPass, 'trainer_retrieval_fail', buckets);
  bucketIf(
    (transfer.changedDimensions || []).length > 0 &&
      (transfer.changedDimensions || []).every((dimension) => dimension === 'punctuation-shape') &&
      (transfer.lexemeSwaps || []).length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    caseSpec.expectedPressure === 'trainer-false-neighbor' &&
      validation.retrievalContract.retrievalPass &&
      (validation.scalarSummary.aggregate || 0) >= 0.72,
    'false_neighbor_convergence',
    buckets
  );
  bucketIf(
    (validation.semanticAuditSummary?.propositionCoverageMin ?? 1) < 0.85 ||
      (validation.semanticAuditSummary?.actionCoverageMin ?? 1) < 0.75,
    'semantic_drift',
    buckets
  );
  bucketIf((validation.protectedAnchorSummary?.integrityMin ?? 1) < 1, 'anchor_break', buckets);
  bucketIf(!visibleMovement(transfer.changedDimensions || [], transfer.lexemeSwaps || []), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(transfer.changedDimensions || []),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== targetProfile.registerMode &&
      !hasRegisterDimension(transfer.changedDimensions || []) &&
      (transfer.lexemeSwaps || []).length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: caseSpec.familyId,
    sourceId: caseSpec.sourceId,
    donorId: '',
    lockIds: caseSpec.extractionIds,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: transfer.transferClass,
    realizationTier: transfer.realizationTier,
    changedDimensions: transfer.changedDimensions || [],
    visibleShift: Boolean(transfer.visibleShift),
    nonTrivialShift: Boolean(transfer.nonTrivialShift),
    donorDistance: {
      source: donorDistance(sourceProfile, targetProfile),
      output: donorDistance(chosen.text, targetProfile),
      improved: donorDistance(chosen.text, targetProfile) < donorDistance(sourceProfile, targetProfile)
    },
    semanticAudit: semanticSummary(transfer),
    protectedAnchorIntegrity: protectedAnchorIntegrity(transfer),
    trainerValidation: {
      pass: Boolean(validation.pass),
      retrievalPass: Boolean(validation.retrievalContract.retrievalPass),
      scalarAggregate: round(validation.scalarSummary.aggregate || 0),
      meanAgreement: round(validation.retrievalContract.meanAgreement || 0),
      status: validation.status
    },
    pairClassification: '',
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), caseSpec.notes)
  };
}

function evaluateRetrievalCase(caseSpec) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const donorSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.donorId];
  const result = engine.buildCadenceTransfer(sourceSample.text, {
    mode: 'borrowed',
    profile: engine.extractCadenceProfile(donorSample.text),
    strength: Number(caseSpec.strength || 0.88)
  }, { retrieval: true });
  const donorProfile = engine.extractCadenceProfile(donorSample.text);
  const sourceProfile = engine.extractCadenceProfile(sourceSample.text);
  const outputProfile = engine.extractCadenceProfile(result.text);
  const buckets = [];

  bucketIf(
    (result.changedDimensions || []).length > 0 &&
      (result.changedDimensions || []).every((dimension) => dimension === 'punctuation-shape') &&
      (result.lexemeSwaps || []).length === 0,
    'punctuation_only_shift',
    buckets
  );
  bucketIf(
    (result.semanticAudit?.propositionCoverage ?? 1) < 0.85 ||
      (result.semanticAudit?.actionCoverage ?? 1) < 0.75 ||
      (result.semanticAudit?.polarityMismatches ?? 0) > 0,
    'semantic_drift',
    buckets
  );
  bucketIf(protectedAnchorIntegrity(result) < 1, 'anchor_break', buckets);
  bucketIf(!visibleMovement(result.changedDimensions || [], result.lexemeSwaps || []), 'over_flattened_output', buckets);
  bucketIf(
    Math.abs((sourceProfile.avgSentenceLength || 0) - (donorProfile.avgSentenceLength || 0)) >= 6 &&
      !hasSentenceDimension(result.changedDimensions || []),
    'sentence_span_miss',
    buckets
  );
  bucketIf(
    sourceProfile.registerMode !== donorProfile.registerMode &&
      !hasRegisterDimension(result.changedDimensions || []) &&
      (result.lexemeSwaps || []).length === 0,
    'register_miss',
    buckets
  );

  return {
    id: caseSpec.id,
    familyId: caseSpec.familyId,
    sourceId: caseSpec.sourceId,
    donorId: caseSpec.donorId,
    mode: caseSpec.mode,
    expectedPressure: caseSpec.expectedPressure,
    transferClass: result.transferClass,
    realizationTier: result.realizationTier,
    changedDimensions: result.changedDimensions || [],
    visibleShift: Boolean(result.visibleShift),
    nonTrivialShift: Boolean(result.nonTrivialShift),
    donorDistance: {
      source: donorDistance(sourceProfile, donorProfile),
      output: donorDistance(outputProfile, donorProfile),
      improved: donorDistance(outputProfile, donorProfile) < donorDistance(sourceProfile, donorProfile)
    },
    semanticAudit: semanticSummary(result),
    protectedAnchorIntegrity: protectedAnchorIntegrity(result),
    trainerValidation: null,
    pairClassification: '',
    failureBuckets: sortUnique(buckets),
    notes: buildCaseNote(sortUnique(buckets), caseSpec.notes)
  };
}

function summarize(sectionResults = {}) {
  const allCases = Object.values(sectionResults).flat();
  const failureBucketCounts = allCases.reduce((acc, item) => {
    for (const bucket of item.failureBuckets || []) {
      acc[bucket] = (acc[bucket] || 0) + 1;
    }
    return acc;
  }, {});
  FAILURE_BUCKETS.forEach((bucket) => {
    failureBucketCounts[bucket] = failureBucketCounts[bucket] || 0;
  });
  const familyPressure = allCases.reduce((acc, item) => {
    const familyId = item.familyId || 'shared';
    acc[familyId] = (acc[familyId] || 0) + (item.failureBuckets?.length || 0);
    return acc;
  }, {});
  const worstFamilies = Object.entries(familyPressure)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([familyId, score]) => ({ familyId, score }));
  const worstCases = [...allCases]
    .sort((left, right) => (right.failureBuckets?.length || 0) - (left.failureBuckets?.length || 0))
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      familyId: item.familyId || 'shared',
      failureBuckets: item.failureBuckets,
      notes: item.notes
    }));

  return {
    corpusVersion: DIAGNOSTIC_CORPUS.version,
    familyCount: DIAGNOSTIC_CORPUS.families.length,
    sampleCount: DIAGNOSTIC_CORPUS.samples.length,
    promotedDeckCount: DIAGNOSTIC_CORPUS.promotedSampleIds.length,
    totalCases: allCases.length,
    failureBucketCounts,
    worstFamilies,
    worstCases
  };
}

function buildMarkdownReport(report) {
  const lines = [
    '# Diagnostics Battery',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Corpus: ${report.summary.sampleCount} samples across ${report.summary.familyCount} families`,
    `Promoted deck subset: ${report.summary.promotedDeckCount} samples`,
    `Total diagnostics cases: ${report.summary.totalCases}`,
    '',
    '## Failure Buckets',
    ''
  ];

  Object.entries(report.summary.failureBucketCounts)
    .sort((left, right) => right[1] - left[1])
    .forEach(([bucket, count]) => {
      lines.push(`- ${bucket}: ${count}`);
    });

  lines.push('', '## Worst Families', '');
  report.summary.worstFamilies.forEach((entry) => {
    lines.push(`- ${entry.familyId}: ${entry.score}`);
  });

  lines.push('', '## Worst Cases', '');
  report.summary.worstCases.forEach((entry) => {
    lines.push(`- ${entry.id}: ${entry.failureBuckets.join(', ') || 'none'} // ${entry.notes}`);
  });

  return `${lines.join('\n')}\n`;
}

const swapMatrix = engine.buildSwapCadenceMatrix(DIAGNOSTIC_SAMPLE_LIBRARY, {
  orderedPairs: DIAGNOSTIC_BATTERY.swapPairs,
  flagshipPairs: engine.SWAP_CADENCE_FLAGSHIP_PAIRS,
  strength: 0.82
});
const swapReportById = Object.fromEntries(swapMatrix.fullMatrix.map((report) => [report.id, report]));

const sectionResults = {
  swapPairs: DIAGNOSTIC_BATTERY.swapPairs.map((caseSpec) =>
    evaluateSwapCase(caseSpec, swapReportById[`${caseSpec.sourceId}__${caseSpec.donorId}`])
  ),
  maskCases: DIAGNOSTIC_BATTERY.maskCases.map(evaluateMaskCase),
  trainerCases: DIAGNOSTIC_BATTERY.trainerCases.map(evaluateTrainerCase),
  retrievalCases: DIAGNOSTIC_BATTERY.retrievalCases.map(evaluateRetrievalCase),
  falseNeighborCases: DIAGNOSTIC_BATTERY.falseNeighborCases.map((caseSpec) =>
    evaluateSwapCase(caseSpec, swapReportById[`${caseSpec.sourceId}__${caseSpec.donorId}`])
  )
};

const report = {
  generatedAt: new Date().toISOString(),
  summary: summarize(sectionResults),
  sections: sectionResults
};

ensureDir(reportsDir);
fs.writeFileSync(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(latestMdPath, buildMarkdownReport(report), 'utf8');

console.log(`diagnostics battery complete (${report.summary.totalCases} cases)`);
console.log(`worst buckets: ${JSON.stringify(report.summary.failureBucketCounts)}`);
