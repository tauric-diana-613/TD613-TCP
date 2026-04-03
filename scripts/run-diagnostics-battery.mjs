import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as engine from '../app/engine/stylometry.js';
import personas from '../app/data/personas.js';
import {
  DECK_RANDOMIZER_SAMPLE_LIBRARY,
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
const PRIVATE_EORFD_REPRESENTATIVE_ANCHORS = Object.freeze([
  'building-access-rushed-mobile',
  'customer-support-formal-record',
  'overwork-debrief-formal-record',
  'school-coordination-tangled-followup'
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

function profileKey(profile = {}) {
  return JSON.stringify(profile || {});
}

function profileDistance(fit = {}) {
  return round(
    (fit.sentenceDistance || 0) +
    (fit.spreadDistance || 0) +
    (fit.punctDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.recurrenceDistance || 0) +
    (fit.directnessDistance || 0) +
    (fit.abstractionDistance || 0) +
    (fit.registerDistance || 0),
    4
  );
}

function axisDistance(profileA = {}, profileB = {}) {
  const axesA = engine.cadenceAxisVector(profileA);
  const axesB = engine.cadenceAxisVector(profileB);
  return round(axesA.reduce((sum, axis, index) =>
    sum + Math.abs(Number(axis.normalized || 0) - Number(axesB[index]?.normalized || 0)),
  0), 4);
}

function heatmapDistance(textA = '', textB = '') {
  const matrixA = engine.cadenceHeatmap(textA).matrix || [];
  const matrixB = engine.cadenceHeatmap(textB).matrix || [];
  let total = 0;
  for (let rowIndex = 0; rowIndex < Math.max(matrixA.length, matrixB.length); rowIndex += 1) {
    const rowA = Array.isArray(matrixA[rowIndex]) ? matrixA[rowIndex] : [];
    const rowB = Array.isArray(matrixB[rowIndex]) ? matrixB[rowIndex] : [];
    for (let colIndex = 0; colIndex < Math.max(rowA.length, rowB.length); colIndex += 1) {
      total += Math.abs(Number(rowA[colIndex] || 0) - Number(rowB[colIndex] || 0));
    }
  }
  return round(total, 4);
}

function buildClosestProfilePairs(
  items = [],
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || '',
  limit = 6
) {
  const pairs = [];
  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const left = items[leftIndex];
      const right = items[rightIndex];
      const leftProfile = getProfile(left);
      const rightProfile = getProfile(right);
      if (!leftProfile || !rightProfile) {
        continue;
      }
      const fit = engine.compareTexts('', '', {
        profileA: leftProfile,
        profileB: rightProfile
      });
      const profileDistanceValue = profileDistance(fit);
      const axisDistanceValue = axisDistance(leftProfile, rightProfile);
      const heatmapDistanceValue = heatmapDistance(getText(left), getText(right));
      pairs.push({
        leftId: left.id,
        leftName: left.name || left.id,
        rightId: right.id,
        rightName: right.name || right.id,
        distance: round(profileDistanceValue + axisDistanceValue + heatmapDistanceValue, 4),
        profileDistance: profileDistanceValue,
        axisDistance: axisDistanceValue,
        heatmapDistance: heatmapDistanceValue,
        similarity: round(fit.similarity || 0, 4),
        traceability: round(fit.traceability || 0, 4),
        sameFamily: left.familyId ? left.familyId === right.familyId : false,
        sameVariant: left.variant ? left.variant === right.variant : false
      });
    }
  }
  return pairs
    .sort((left, right) =>
      left.distance - right.distance ||
      left.heatmapDistance - right.heatmapDistance ||
      right.similarity - left.similarity ||
      left.leftId.localeCompare(right.leftId) ||
      left.rightId.localeCompare(right.rightId)
    )
    .slice(0, limit);
}

function buildNearestFieldSummary(
  items = [],
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || ''
) {
  if (items.length <= 1) {
    return {
      averageNearestFieldDistance: 0,
      minNearestFieldDistance: 0
    };
  }
  const nearestDistances = items.map((left, leftIndex) => {
    const leftProfile = getProfile(left);
    const leftText = getText(left);
    let nearest = Infinity;
    for (let rightIndex = 0; rightIndex < items.length; rightIndex += 1) {
      if (leftIndex === rightIndex) {
        continue;
      }
      const right = items[rightIndex];
      nearest = Math.min(
        nearest,
        round(
          profileDistance(engine.compareTexts('', '', {
            profileA: leftProfile,
            profileB: getProfile(right)
          })) +
            axisDistance(leftProfile, getProfile(right)) +
            heatmapDistance(leftText, getText(right)),
          4
        )
      );
    }
    return nearest;
  });
  return {
    averageNearestFieldDistance: round(
      nearestDistances.reduce((sum, value) => sum + value, 0) / nearestDistances.length,
      4
    ),
    minNearestFieldDistance: round(Math.min(...nearestDistances), 4)
  };
}

function fieldDistanceBetweenItems(
  left,
  right,
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || ''
) {
  return round(
    profileDistance(engine.compareTexts('', '', {
      profileA: getProfile(left),
      profileB: getProfile(right)
    })) +
      axisDistance(getProfile(left), getProfile(right)) +
      heatmapDistance(getText(left), getText(right)),
    4
  );
}

function buildWideFieldSubset(
  items = [],
  limit = 16,
  getProfile = (item) => item.profile,
  getText = (item) => item.text || item.diagnosticSpecimen?.text || ''
) {
  if (items.length <= limit) {
    return items;
  }

  const working = [...items];
  const seed = working
    .map((item) => ({
      item,
      meanDistance:
        working
          .filter((other) => other !== item)
          .reduce((sum, other) => sum + fieldDistanceBetweenItems(item, other, getProfile, getText), 0) /
        Math.max(1, working.length - 1)
    }))
    .sort((left, right) =>
      right.meanDistance - left.meanDistance ||
      String(left.item.id || '').localeCompare(String(right.item.id || ''))
    )[0]?.item;

  const chosen = seed ? [seed] : [working[0]];
  const remaining = working.filter((item) => item !== chosen[0]);

  while (chosen.length < limit && remaining.length) {
    remaining.sort((left, right) => {
      const leftMin = Math.min(...chosen.map((picked) => fieldDistanceBetweenItems(left, picked, getProfile, getText)));
      const rightMin = Math.min(...chosen.map((picked) => fieldDistanceBetweenItems(right, picked, getProfile, getText)));
      const leftMean =
        chosen.reduce((sum, picked) => sum + fieldDistanceBetweenItems(left, picked, getProfile, getText), 0) /
        Math.max(1, chosen.length);
      const rightMean =
        chosen.reduce((sum, picked) => sum + fieldDistanceBetweenItems(right, picked, getProfile, getText), 0) /
        Math.max(1, chosen.length);
      return (
        rightMin - leftMin ||
        rightMean - leftMean ||
        String(left.id || '').localeCompare(String(right.id || ''))
      );
    });
    chosen.push(remaining.shift());
  }

  return chosen;
}

function buildExactProfileCollisions(items = [], getProfile = (item) => item.profile) {
  const groups = new Map();
  items.forEach((item) => {
    const key = profileKey(getProfile(item));
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push({
      id: item.id,
      name: item.name || item.id
    });
  });
  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      ids: group.map((entry) => entry.id),
      names: group.map((entry) => entry.name)
    }));
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

function buildBorrowedShellFromProfile(profile, fromSlot = 'B') {
  return {
    mode: 'borrowed',
    label: `borrowed ${fromSlot} cadence`,
    mod: engine.cadenceModFromProfile(profile),
    profile: { ...profile },
    source: 'swapped',
    fromSlot,
    strength: 0.82
  };
}

function swapCadenceScoreLane(result = {}, sourceText = '') {
  let score = 0;
  const changed = result.text !== sourceText;

  if (result.transferClass === 'structural') {
    score += 5;
  } else if (result.transferClass === 'weak' && changed) {
    score += 3;
  } else if (result.transferClass === 'rejected') {
    score -= 4;
  }

  if (changed) {
    score += 2;
  }
  if (result.realizationTier === 'lexical-structural') {
    score += 2;
  }
  if ((result.semanticAudit?.propositionCoverage ?? 1) >= 0.85) {
    score += 1;
  }
  if ((result.semanticAudit?.polarityMismatches ?? 0) > 0) {
    score -= 2;
  }

  return score;
}

function evaluateSwapCadencePairing(referenceText = '', probeText = '') {
  if (!referenceText.trim() || !probeText.trim()) {
    return {
      score: 0,
      bilateralVisible: false,
      bilateralNonTrivial: false,
      engagedLaneCount: 0,
      rejectedLaneCount: 0,
      laneOutcomes: [],
      laneTransferClasses: [],
      minProtectedAnchorIntegrity: 1,
      minPropositionCoverage: 1
    };
  }

  const referenceProfile = engine.extractCadenceProfile(referenceText);
  const probeProfile = engine.extractCadenceProfile(probeText);
  const laneA = engine.buildCadenceTransfer(
    referenceText,
    buildBorrowedShellFromProfile(probeProfile, 'B'),
    { retrieval: true }
  );
  const laneB = engine.buildCadenceTransfer(
    probeText,
    buildBorrowedShellFromProfile(referenceProfile, 'A'),
    { retrieval: true }
  );
  const laneOutcomes = [
    laneA.borrowedShellOutcome || laneA.transferClass,
    laneB.borrowedShellOutcome || laneB.transferClass
  ];
  const engagedLaneCount = laneOutcomes.filter((outcome) => ['structural', 'partial'].includes(outcome)).length;
  const rejectedLaneCount = laneOutcomes.filter((outcome) => outcome === 'rejected').length;
  const bilateralVisible = Boolean(laneA.visibleShift) && Boolean(laneB.visibleShift);
  const bilateralNonTrivial = Boolean(laneA.nonTrivialShift) && Boolean(laneB.nonTrivialShift);
  let score = swapCadenceScoreLane(laneA, referenceText) + swapCadenceScoreLane(laneB, probeText);

  if (bilateralVisible) {
    score += 4;
  }
  if (bilateralNonTrivial) {
    score += 6;
  }
  score += engagedLaneCount * 3;
  score -= rejectedLaneCount * 4;

  return {
    score,
    bilateralVisible,
    bilateralNonTrivial,
    engagedLaneCount,
    rejectedLaneCount,
    laneOutcomes,
    laneTransferClasses: [laneA.transferClass, laneB.transferClass],
    minProtectedAnchorIntegrity: round(Math.min(protectedAnchorIntegrity(laneA), protectedAnchorIntegrity(laneB))),
    minPropositionCoverage: round(Math.min(
      laneA.semanticAudit?.propositionCoverage ?? 1,
      laneB.semanticAudit?.propositionCoverage ?? 1
    ))
  };
}

function compareSwapCadencePairings(left = {}, right = {}) {
  return (
    Number(Boolean(right.bilateralNonTrivial)) - Number(Boolean(left.bilateralNonTrivial)) ||
    Number(Boolean(right.bilateralVisible)) - Number(Boolean(left.bilateralVisible)) ||
    Number(right.engagedLaneCount || 0) - Number(left.engagedLaneCount || 0) ||
    Number(left.rejectedLaneCount || 0) - Number(right.rejectedLaneCount || 0) ||
    Number(right.score || 0) - Number(left.score || 0) ||
    Number(right.minProtectedAnchorIntegrity ?? 1) - Number(left.minProtectedAnchorIntegrity ?? 1) ||
    Number(right.minPropositionCoverage ?? 1) - Number(left.minPropositionCoverage ?? 1)
  );
}

function evaluateRepresentativeSwapPair(sourceSample, donorSample) {
  const evaluation = evaluateSwapCadencePairing(sourceSample.text, donorSample.text);

  return {
    anchorId: sourceSample.id,
    candidateId: donorSample.id,
    ...evaluation
  };
}

function buildRepresentativeSwapSelections(sampleLibrary = DECK_RANDOMIZER_SAMPLE_LIBRARY, anchorIds = PRIVATE_EORFD_REPRESENTATIVE_ANCHORS) {
  const sampleById = Object.fromEntries(sampleLibrary.map((sample) => [sample.id, sample]));

  return anchorIds.map((anchorId) => {
    const anchor = sampleById[anchorId];
    if (!anchor) {
      return null;
    }

    let best = null;
    for (const candidate of sampleLibrary) {
      if (candidate.id === anchor.id) {
        continue;
      }
      const evaluation = evaluateRepresentativeSwapPair(anchor, candidate);
      if (
        !best ||
        compareSwapCadencePairings(evaluation, best) < 0 ||
        (compareSwapCadencePairings(evaluation, best) === 0 && candidate.id.localeCompare(best.candidateId) < 0)
      ) {
        best = evaluation;
      }
    }
    return best;
  }).filter(Boolean);
}

function summarizeRepresentativeSwapSelections(selections = []) {
  const count = selections.length;
  const bilateralVisibleCount = selections.filter((entry) => entry.bilateralVisible).length;
  const bilateralNonTrivialCount = selections.filter((entry) => entry.bilateralNonTrivial).length;

  return {
    count,
    bilateralVisibleCount,
    bilateralNonTrivialCount,
    bilateralVisibleRate: count ? round(bilateralVisibleCount / count) : 0,
    bilateralNonTrivialRate: count ? round(bilateralNonTrivialCount / count) : 0,
    averageScore: count ? round(selections.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / count, 2) : 0,
    minProtectedAnchorIntegrity: count ? round(Math.min(...selections.map((entry) => entry.minProtectedAnchorIntegrity ?? 1))) : 1,
    minPropositionCoverage: count ? round(Math.min(...selections.map((entry) => entry.minPropositionCoverage ?? 1))) : 1,
    selections
  };
}

function buildPrivateWorkingDoctrine(summary, swapMatrix, representativePairs) {
  const bucketCounts = summary.failureBucketCounts || {};
  const topWitnessBuckets = {
    semantic_drift: bucketCounts.semantic_drift || 0,
    over_flattened_output: bucketCounts.over_flattened_output || 0,
    one_sided_swap: bucketCounts.one_sided_swap || 0
  };
  const witnessBurdenCount = Object.values(topWitnessBuckets).reduce((sum, value) => sum + value, 0);
  const witnessBurdenRatio = round(witnessBurdenCount / Math.max(summary.totalCases || 1, 1));
  const swapSummary = swapMatrix.summary || {};
  const oneSidedRate = round((swapSummary.oneSided || 0) / Math.max(swapSummary.caseCount || 1, 1));
  const donorPressureReal = (swapSummary.bilateralEngaged || 0) >= 24 || (representativePairs.averageScore || 0) >= 12;
  const witnessPressureRising =
    witnessBurdenRatio >= 0.5 ||
    (bucketCounts.register_miss || 0) >= 18 ||
    (bucketCounts.sentence_span_miss || 0) >= 18;
  const realizedPassageWeak =
    !swapSummary.flagshipAllPassed ||
    oneSidedRate >= 0.3 ||
    witnessBurdenRatio >= 0.65;
  const provenanceMaintained =
    (bucketCounts.anchor_break || 0) === 0 &&
    (representativePairs.minProtectedAnchorIntegrity || 1) >= 1;

  let state = 'playable';
  if (donorPressureReal && (!swapSummary.flagshipAllPassed || oneSidedRate >= 0.18 || witnessBurdenRatio >= 0.4)) {
    state = 'warning';
  }
  if (donorPressureReal && witnessPressureRising && realizedPassageWeak && provenanceMaintained) {
    state = 'buffered';
  }
  if (state === 'buffered' && (representativePairs.bilateralNonTrivialRate || 0) < 0.5) {
    state = 'harbor-eligible';
  }

  const blockedGenerativePassage = state === 'buffered' || state === 'harbor-eligible';
  const guidance = blockedGenerativePassage
    ? [
        'prioritize buildCadenceTransfer(...) and pairing logic before new witness/law surface work',
        'defer explanatory or aftermath expansions unless a debugging need is explicit',
        'require before/after comparison on representative pairs, swap flight, and diagnostics buckets'
      ]
    : [
        'maintain retrieval safety floors while tracking whether vitality remains stable'
      ];

  return {
    state,
    blockedGenerativePassage,
    actionBias: blockedGenerativePassage ? 'loosen-exploration-first' : 'hold-current-boundary',
    donorPressure: {
      status: donorPressureReal ? 'real' : 'latent',
      bilateralEngaged: swapSummary.bilateralEngaged || 0,
      representativeAverageScore: representativePairs.averageScore || 0
    },
    witnessPressure: {
      status: witnessPressureRising ? 'rising' : 'contained',
      witnessBurdenCount,
      witnessBurdenRatio,
      topWitnessBuckets
    },
    realizedPassage: {
      status: realizedPassageWeak ? 'weak' : 'landing',
      oneSidedRate,
      flagshipAllPassed: Boolean(swapSummary.flagshipAllPassed)
    },
    provenanceFloor: {
      status: provenanceMaintained ? 'maintained' : 'degraded',
      anchorBreakCount: bucketCounts.anchor_break || 0,
      minProtectedAnchorIntegrity: representativePairs.minProtectedAnchorIntegrity || 1
    },
    swapMatrix: {
      caseCount: swapSummary.caseCount || 0,
      bilateralEngaged: swapSummary.bilateralEngaged || 0,
      oneSided: swapSummary.oneSided || 0,
      bothRejected: swapSummary.bothRejected || 0,
      flagshipPassCount: swapSummary.flagshipPassCount || 0,
      flagshipCaseCount: swapSummary.flagshipCaseCount || 0,
      flagshipAllPassed: Boolean(swapSummary.flagshipAllPassed)
    },
    representativePairs,
    guidance
  };
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

function buildSampleAudit(sampleLibrary = DIAGNOSTIC_SAMPLE_LIBRARY) {
  const resolvedSamples = sampleLibrary.map((sample) => ({
    ...sample,
    profile: engine.extractCadenceProfile(sample.text)
  }));
  const resolvedDeckSamples = DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => ({
    ...sample,
    profile: engine.extractCadenceProfile(sample.text)
  }));
  const pairedFamilyCount = [...DECK_RANDOMIZER_SAMPLE_LIBRARY.reduce((acc, sample) => {
    const variants = acc.get(sample.familyId) || new Set();
    variants.add(sample.variant);
    acc.set(sample.familyId, variants);
    return acc;
  }, new Map()).values()].filter((variants) => variants.size >= 2).length;
  const fullDeckFieldSummary = buildNearestFieldSummary(
    resolvedDeckSamples,
    (sample) => sample.profile,
    (sample) => sample.text
  );
  const deckWideSubset = buildWideFieldSubset(
    resolvedDeckSamples,
    Math.min(16, resolvedDeckSamples.length),
    (sample) => sample.profile,
    (sample) => sample.text
  );
  return {
    randomizerCorpusSize: sampleLibrary.length,
    uniqueResolvedProfileCount: new Set(resolvedSamples.map((sample) => profileKey(sample.profile))).size,
    closestPairs: buildClosestProfilePairs(resolvedSamples, (sample) => sample.profile, (sample) => sample.text),
    exactProfileCollisions: buildExactProfileCollisions(resolvedSamples, (sample) => sample.profile),
    deckRandomizerSize: DECK_RANDOMIZER_SAMPLE_LIBRARY.length,
    deckRandomizerFamilyCount: new Set(DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => sample.familyId)).size,
    deckRandomizerPairedFamilyCount: pairedFamilyCount,
    deckRandomizerWideSubsetSize: deckWideSubset.length,
    deckRandomizerWideSubsetIds: deckWideSubset.map((sample) => sample.id),
    deckRandomizerLibraryAverageNearestFieldDistance: fullDeckFieldSummary.averageNearestFieldDistance,
    deckRandomizerLibraryMinNearestFieldDistance: fullDeckFieldSummary.minNearestFieldDistance,
    ...buildNearestFieldSummary(deckWideSubset, (sample) => sample.profile, (sample) => sample.text)
  };
}

function buildPersonaAudit(personaLibrary = PERSONA_LIBRARY) {
  const resolvedPersonas = personaLibrary.filter((persona) => persona.profile);
  const comparisonSampleId = 'customer-support-formal-record';
  const comparisonText = DIAGNOSTIC_CORPUS_BY_ID[comparisonSampleId]?.text || DIAGNOSTIC_SAMPLE_LIBRARY[0]?.text || '';
  const lock = buildCadenceLockRecord(engine, {
    name: 'persona-audit-lock',
    corpusText: [
      DIAGNOSTIC_CORPUS_BY_ID['overwork-debrief-professional-message']?.text || '',
      DIAGNOSTIC_CORPUS_BY_ID['package-handoff-formal-record']?.text || ''
    ].join('\n\n').trim()
  });
  const renderedOutputs = resolvedPersonas.map((persona) => buildMaskTransformationResult(engine, {
    comparisonText,
    lock,
    persona
  }).maskedText);
  const distinctOutputCount = new Set(renderedOutputs).size;
  const missingRecipeSampleIds = personaLibrary.flatMap((persona) =>
    (persona.recipeResolution?.missingSampleIds || []).map((sampleId) => ({
      personaId: persona.id,
      sampleId
    }))
  );

  return {
    resolvedPersonaCount: personaLibrary.length,
    uniqueResolvedProfileCount: new Set(resolvedPersonas.map((persona) => profileKey(persona.profile))).size,
    missingRecipeSampleIds,
    closestPairs: buildClosestProfilePairs(
      resolvedPersonas,
      (persona) => persona.profile,
      (persona) => persona.diagnosticSpecimen?.text || ''
    ),
    ...buildNearestFieldSummary(
      resolvedPersonas,
      (persona) => persona.profile,
      (persona) => persona.diagnosticSpecimen?.text || ''
    ),
    distinctOutputCheck: {
      comparisonSampleId,
      resolvedPersonaCount: resolvedPersonas.length,
      distinctOutputCount,
      allDistinct: distinctOutputCount === resolvedPersonas.length
    }
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

  if (report.sampleAudit) {
    lines.push('', '## Sample Audit', '');
    lines.push(`- randomizer_corpus_size: ${report.sampleAudit.randomizerCorpusSize}`);
    lines.push(`- unique_resolved_sample_profile_count: ${report.sampleAudit.uniqueResolvedProfileCount}`);
    lines.push(`- deck_randomizer_size: ${report.sampleAudit.deckRandomizerSize}`);
    lines.push(`- deck_randomizer_family_count: ${report.sampleAudit.deckRandomizerFamilyCount}`);
    lines.push(`- deck_randomizer_paired_family_count: ${report.sampleAudit.deckRandomizerPairedFamilyCount}`);
    lines.push(`- deck_randomizer_wide_subset_size: ${report.sampleAudit.deckRandomizerWideSubsetSize}`);
    lines.push(`- average_nearest_field_distance: ${report.sampleAudit.averageNearestFieldDistance}`);
    lines.push(`- min_nearest_field_distance: ${report.sampleAudit.minNearestFieldDistance}`);
    lines.push(`- deck_randomizer_library_average_nearest_field_distance: ${report.sampleAudit.deckRandomizerLibraryAverageNearestFieldDistance}`);
    lines.push(`- deck_randomizer_library_min_nearest_field_distance: ${report.sampleAudit.deckRandomizerLibraryMinNearestFieldDistance}`);
    lines.push(`- exact_profile_collisions: ${report.sampleAudit.exactProfileCollisions.length ? report.sampleAudit.exactProfileCollisions.map((entry) => entry.ids.join(', ')).join(' | ') : 'none'}`);
    lines.push('', '### Closest Sample Pairs', '');
    report.sampleAudit.closestPairs.forEach((entry) => {
      lines.push(`- ${entry.leftId} <-> ${entry.rightId}: field distance ${entry.distance}, profile ${entry.profileDistance}, heatmap ${entry.heatmapDistance}, traceability ${entry.traceability}`);
    });
  }

  if (report.personaAudit) {
    lines.push('', '## Persona Audit', '');
    lines.push(`- resolved_persona_count: ${report.personaAudit.resolvedPersonaCount}`);
    lines.push(`- unique_resolved_persona_profile_count: ${report.personaAudit.uniqueResolvedProfileCount}`);
    lines.push(`- average_nearest_field_distance: ${report.personaAudit.averageNearestFieldDistance}`);
    lines.push(`- min_nearest_field_distance: ${report.personaAudit.minNearestFieldDistance}`);
    lines.push(`- missing_recipe_sample_ids: ${report.personaAudit.missingRecipeSampleIds.length ? report.personaAudit.missingRecipeSampleIds.map((entry) => `${entry.personaId}:${entry.sampleId}`).join(', ') : 'none'}`);
    lines.push(`- distinct_output_check: ${report.personaAudit.distinctOutputCheck.distinctOutputCount}/${report.personaAudit.distinctOutputCheck.resolvedPersonaCount} distinct on ${report.personaAudit.distinctOutputCheck.comparisonSampleId}`);
    lines.push('', '### Closest Persona Pairs', '');
    report.personaAudit.closestPairs.forEach((entry) => {
      lines.push(`- ${entry.leftId} <-> ${entry.rightId}: field distance ${entry.distance}, profile ${entry.profileDistance}, heatmap ${entry.heatmapDistance}, traceability ${entry.traceability}`);
    });
  }

  if (report.workingDoctrine) {
    const doctrine = report.workingDoctrine;
    lines.push('', '## Private EO-RFD Working State', '');
    lines.push(`- state: ${doctrine.state}`);
    lines.push(`- blocked_generative_passage: ${doctrine.blockedGenerativePassage ? 'yes' : 'no'}`);
    lines.push(`- donor_pressure: ${doctrine.donorPressure?.status || 'unknown'}`);
    lines.push(`- witness_pressure: ${doctrine.witnessPressure?.status || 'unknown'}`);
    lines.push(`- realized_passage: ${doctrine.realizedPassage?.status || 'unknown'}`);
    lines.push(`- provenance_floor: ${doctrine.provenanceFloor?.status || 'unknown'}`);
    lines.push(`- swap_matrix: bilateral ${doctrine.swapMatrix?.bilateralEngaged || 0}/${doctrine.swapMatrix?.caseCount || 0}, one-sided ${doctrine.swapMatrix?.oneSided || 0}/${doctrine.swapMatrix?.caseCount || 0}, flagship ${doctrine.swapMatrix?.flagshipPassCount || 0}/${doctrine.swapMatrix?.flagshipCaseCount || 0}`);
    lines.push(`- representative_pairs: bilateral visible ${doctrine.representativePairs?.bilateralVisibleCount || 0}/${doctrine.representativePairs?.count || 0}, bilateral non-trivial ${doctrine.representativePairs?.bilateralNonTrivialCount || 0}/${doctrine.representativePairs?.count || 0}, average score ${doctrine.representativePairs?.averageScore || 0}`);
    lines.push('', '## Private EO-RFD Representative Pairs', '');
    (doctrine.representativePairs?.selections || []).forEach((entry) => {
      lines.push(`- ${entry.anchorId} -> ${entry.candidateId}: score ${entry.score}, outcomes ${entry.laneOutcomes.join(' / ')}, bilateral visible ${entry.bilateralVisible ? 'yes' : 'no'}, bilateral non-trivial ${entry.bilateralNonTrivial ? 'yes' : 'no'}`);
    });
  }

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
const representativePairs = summarizeRepresentativeSwapSelections(buildRepresentativeSwapSelections());

const report = {
  generatedAt: new Date().toISOString(),
  summary: summarize(sectionResults),
  sections: sectionResults,
  sampleAudit: buildSampleAudit(DIAGNOSTIC_SAMPLE_LIBRARY),
  personaAudit: buildPersonaAudit(PERSONA_LIBRARY),
  workingDoctrine: null
};
report.workingDoctrine = buildPrivateWorkingDoctrine(report.summary, swapMatrix, representativePairs);

ensureDir(reportsDir);
fs.writeFileSync(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(latestMdPath, buildMarkdownReport(report), 'utf8');

console.log(`diagnostics battery complete (${report.summary.totalCases} cases)`);
console.log(`worst buckets: ${JSON.stringify(report.summary.failureBucketCounts)}`);
