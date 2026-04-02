import assert from 'assert';

import {
  DECK_RANDOMIZER_SAMPLE_LIBRARY,
  DIAGNOSTIC_CORPUS,
  PROMOTED_SAMPLE_LIBRARY
} from '../app/data/diagnostics.js';
import { compareTexts, extractCadenceProfile } from '../app/engine/stylometry.js';

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
    profile: extractCadenceProfile(sample.text)
  }));

  const distances = profiled.map((left) => {
    let nearest = Infinity;
    for (const right of profiled) {
      if (left.id === right.id) {
        continue;
      }
      nearest = Math.min(nearest, profileDistance(left.profile, right.profile));
    }
    return nearest;
  });

  return Number((distances.reduce((sum, value) => sum + value, 0) / distances.length).toFixed(4));
}

assert.equal(DECK_RANDOMIZER_SAMPLE_LIBRARY.length, 16, 'deck randomizer library exposes 16 samples');
assert(
  DECK_RANDOMIZER_SAMPLE_LIBRARY.every((sample) => DIAGNOSTIC_CORPUS.deckRandomizerSampleIds.includes(sample.id)),
  'deck randomizer library resolves from declared diagnostics ids'
);

const familyCount = new Set(DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => sample.familyId)).size;
const variantSet = new Set(DECK_RANDOMIZER_SAMPLE_LIBRARY.map((sample) => sample.variant));
assert(familyCount >= 10, 'deck randomizer library keeps at least 10 distinct families');
assert.deepEqual(
  [...variantSet].sort(),
  ['formal-record', 'professional-message', 'rushed-mobile', 'tangled-followup'],
  'deck randomizer library keeps all four diagnostics cadence variants in play'
);

const promotedNearest = averageNearestDistance(PROMOTED_SAMPLE_LIBRARY);
const deckNearest = averageNearestDistance(DECK_RANDOMIZER_SAMPLE_LIBRARY);
assert(
  deckNearest >= promotedNearest + 0.3,
  `deck randomizer library should materially widen nearest-neighbor spread (${deckNearest} vs ${promotedNearest})`
);

console.log('deck-randomizer.test.mjs passed');
