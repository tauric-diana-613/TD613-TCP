import { clone } from './aperture-v31-core.js';
import { requireDigest } from './hush-intervention-common.js';
import {
  HUSH_READER_CLASSES,
  assertHushVocabularyValue
} from './hush-intervention-vocabulary.js';

export function normalizeHushTrials(values = [], ensemble, candidateDigest) {
  return values.map((trial, index) => ({
    trial_id: String(trial?.trialId || `hush_trial_${index + 1}`),
    reader_class: assertHushVocabularyValue(
      trial?.readerClass,
      HUSH_READER_CLASSES,
      'Hush Reader class'
    ),
    reader_digest: requireDigest(trial?.readerDigest, 'Reader digest'),
    source_text_digest: requireDigest(trial?.sourceTextDigest, 'Trial source digest'),
    candidate_digest: requireDigest(trial?.candidateDigest, 'Trial candidate digest'),
    state: String(trial?.state || 'OBSERVED').toUpperCase(),
    benign_control: trial?.benignControl === true,
    held_out: trial?.heldOut === true,
    matched_reader_set: trial?.matchedReaderSet === true,
    componentwise_reconstruction: clone(trial?.componentwiseReconstruction || {}),
    source_matches_ensemble: trial?.sourceTextDigest === ensemble?.source_text_digest,
    candidate_matches_receipt: trial?.candidateDigest === candidateDigest
  }));
}

export function evaluateHushTrials(trials = [], ensemble, transformationHistory = []) {
  const observed = trials.filter(trial => trial.state === 'OBSERVED');
  const readerClasses = new Set(observed.map(trial => trial.reader_class));
  const readerSetHeld = observed.some(trial =>
    !trial.matched_reader_set
    || !trial.source_matches_ensemble
    || !trial.candidate_matches_receipt
  );
  const enoughData = Boolean(
    observed.length >= Number(ensemble?.trial_plan?.minimum_observed_trials || 2)
    && readerClasses.size >= 2
    && trials.some(trial => trial.benign_control)
    && trials.some(trial => trial.held_out)
    && transformationHistory.length
  );
  return Object.freeze({ observedCount: observed.length, readerSetHeld, enoughData });
}
