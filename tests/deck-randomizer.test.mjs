import assert from 'assert';

import {
  DECK_RANDOMIZER_SAMPLE_LIBRARY,
  DIAGNOSTIC_CORPUS,
  PROMOTED_SAMPLE_LIBRARY
} from '../app/data/diagnostics.js';
import {
  cadenceAxisVector,
  cadenceHeatmap,
  compareTexts,
  extractCadenceProfile
} from '../app/engine/stylometry.js';

function profileDistance(profileA = null, profileB = null) {
  if (!profileA || !profileB) {
    return 0;
  }
  const fit = compareTexts('', '', { profileA, profileB });
  return Number((
    (fit.sentenceDistance || 0) +
    (fit.spreadDistance || 0) +
    (fit.punctDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.recurrenceDistance || 0) +
    (fit.directnessDistance || 0) +
    (fit.abstractionDistance || 0) +
    (fit.registerDistance || 0)
  ).toFixed(4));
}

function averageNearestDistance(samples = []) {
  const profiled = samples.map((sample) => ({
    ...sample,
    profile: extractCadenceProfile(sample.text),
    heatmap: cadenceHeatmap(sample.text)
  }));

  const axisDistance = (profileA = {}, profileB = {}) => {
    const vectorA = cadenceAxisVector(profileA).map((axis) => axis.normalized);
    const vectorB = cadenceAxisVector(profileB).map((axis) => axis.normalized);
    return Number(vectorA.reduce((sum, value, index) => sum + Math.abs(value - Number(vectorB[index] || 0)), 0).toFixed(4));
  };

  const heatmapDistance = (heatmapA = null, heatmapB = null) => {
    let total = 0;
    const matrixA = Array.isArray(heatmapA?.matrix) ? heatmapA.matrix : [];
    const matrixB = Array.isArray(heatmapB?.matrix) ? heatmapB.matrix : [];
    for (let rowIndex = 0; rowIndex < Math.max(matrixA.length, matrixB.length); rowIndex += 1) {
      const rowA = Array.isArray(matrixA[rowIndex]) ? matrixA[rowIndex] : [];
      const rowB = Array.isArray(matrixB[rowIndex]) ? matrixB[rowIndex] : [];
      for (let colIndex = 0; colIndex < Math.max(rowA.length, rowB.length); colIndex += 1) {
        total += Math.abs(Number(rowA[colIndex] || 0) - Number(rowB[colIndex] || 0));
      }
    }
    return Number(total.toFixed(4));
  };

  const distances = profiled.map((left) => {
    let nearest = Infinity;
    for (const right of profiled) {
      if (left.id === right.id) {
        continue;
      }
      nearest = Math.min(
        nearest,
        Number((
          profileDistance(left.profile, right.profile) +
          axisDistance(left.profile, right.profile) +
          heatmapDistance(left.heatmap, right.heatmap)
        ).toFixed(4))
      );
    }
    return nearest;
  });

  return Number((distances.reduce((sum, value) => sum + value, 0) / distances.length).toFixed(4));
}

function fieldDistance(left, right) {
  const leftProfile = left.profile || extractCadenceProfile(left.text);
  const rightProfile = right.profile || extractCadenceProfile(right.text);
  const leftHeatmap = left.heatmap || cadenceHeatmap(left.text);
  const rightHeatmap = right.heatmap || cadenceHeatmap(right.text);
  return Number((
    profileDistance(leftProfile, rightProfile) +
    (() => {
      const vectorA = cadenceAxisVector(leftProfile).map((axis) => axis.normalized);
      const vectorB = cadenceAxisVector(rightProfile).map((axis) => axis.normalized);
      return Number(vectorA.reduce((sum, value, index) => sum + Math.abs(value - Number(vectorB[index] || 0)), 0).toFixed(4));
    })() +
    (() => {
      let total = 0;
      const matrixA = Array.isArray(leftHeatmap?.matrix) ? leftHeatmap.matrix : [];
      const matrixB = Array.isArray(rightHeatmap?.matrix) ? rightHeatmap.matrix : [];
      for (let rowIndex = 0; rowIndex < Math.max(matrixA.length, matrixB.length); rowIndex += 1) {
        const rowA = Array.isArray(matrixA[rowIndex]) ? matrixA[rowIndex] : [];
        const rowB = Array.isArray(matrixB[rowIndex]) ? matrixB[rowIndex] : [];
        for (let colIndex = 0; colIndex < Math.max(rowA.length, rowB.length); colIndex += 1) {
          total += Math.abs(Number(rowA[colIndex] || 0) - Number(rowB[colIndex] || 0));
        }
      }
      return Number(total.toFixed(4));
    })()
  ).toFixed(4));
}

function greedyWideSubset(samples = [], limit = 16) {
  const profiled = samples.map((sample) => ({
    ...sample,
    profile: extractCadenceProfile(sample.text),
    heatmap: cadenceHeatmap(sample.text)
  }));
  if (profiled.length <= limit) {
    return profiled;
  }
  const seed = [...profiled]
    .map((sample) => ({
      sample,
      meanDistance:
        profiled
          .filter((other) => other.id !== sample.id)
          .reduce((sum, other) => sum + fieldDistance(sample, other), 0) /
        Math.max(1, profiled.length - 1)
    }))
    .sort((left, right) => right.meanDistance - left.meanDistance || left.sample.id.localeCompare(right.sample.id))[0].sample;
  const chosen = [seed];
  const remaining = profiled.filter((sample) => sample.id !== seed.id);
  while (chosen.length < limit && remaining.length) {
    remaining.sort((left, right) => {
      const leftMin = Math.min(...chosen.map((sample) => fieldDistance(left, sample)));
      const rightMin = Math.min(...chosen.map((sample) => fieldDistance(right, sample)));
      const leftMean = chosen.reduce((sum, sample) => sum + fieldDistance(left, sample), 0) / Math.max(1, chosen.length);
      const rightMean = chosen.reduce((sum, sample) => sum + fieldDistance(right, sample), 0) / Math.max(1, chosen.length);
      return rightMin - leftMin || rightMean - leftMean || left.id.localeCompare(right.id);
    });
    chosen.push(remaining.shift());
  }
  return chosen;
}

assert(DECK_RANDOMIZER_SAMPLE_LIBRARY.length >= 24, 'deck randomizer library exposes at least 24 samples');
assert(
  DECK_RANDOMIZER_SAMPLE_LIBRARY.every((sample) => DIAGNOSTIC_CORPUS.deckRandomizerSampleIds.includes(sample.id)),
  'deck randomizer library resolves from declared diagnostics ids'
);

const familyCount = new Set(DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => sample.familyId)).size;
const variantSet = new Set(DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => sample.variant));
const pairedFamilyCount = [...DECK_RANDOMIZER_SAMPLE_LIBRARY.reduce((acc, sample) => {
  const set = acc.get(sample.familyId) || new Set();
  set.add(sample.variant);
  acc.set(sample.familyId, set);
  return acc;
}, new Map()).entries()].filter(([, variants]) => variants.size >= 2).length;
assert(familyCount >= 12, 'deck randomizer library keeps at least 12 distinct families');
assert(pairedFamilyCount >= 10, 'deck randomizer library keeps at least 10 same-family contrast pairs for live Shell Duel casts');
assert.deepEqual(
  [...variantSet].sort(),
  ['formal-record', 'professional-message', 'rushed-mobile', 'tangled-followup'],
  'deck randomizer library keeps all four diagnostics cadence variants in play'
);

const promotedNearest = averageNearestDistance(PROMOTED_SAMPLE_LIBRARY);
const wideSubset = greedyWideSubset(DECK_RANDOMIZER_SAMPLE_LIBRARY, 16);
const deckNearest = averageNearestDistance(wideSubset);
assert(
  deckNearest >= promotedNearest + 0.25,
  `deck randomizer library should widen total field spread beyond the promoted subset while preserving duel-ready pairs (${deckNearest} vs ${promotedNearest})`
);

console.log('deck-randomizer.test.mjs passed');
