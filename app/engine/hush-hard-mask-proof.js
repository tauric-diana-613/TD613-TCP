export const HUSH_HARD_MASK_PROOF_VERSION = 'phase-25';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const round = (value) => Number.isFinite(value) ? Number(value.toFixed(4)) : 0;

export function assessHardMaskReadiness(mask = {}, options = {}) {
  const minSamples = options.minSamples ?? 16;
  const minWords = options.minWords ?? 700;
  const minPunctuation = options.minPunctuation ?? 0.07;
  const minRecurrence = options.minRecurrence ?? 0.12;
  const summary = mask.profileSummary || {};
  const failures = [];
  const sampleCount = mask.sampleCount ?? list(mask.samples).length ?? 0;
  const wordCount = summary.wordCount ?? mask.profile?.wordCount ?? 0;
  const punctuationDensity = summary.punctuationDensity ?? mask.profile?.punctuationDensity ?? 0;
  const recurrencePressure = summary.recurrencePressure ?? mask.profile?.recurrencePressure ?? 0;
  const profileStatus = mask.profileStatus || 'empty';

  if (sampleCount < minSamples) failures.push('hard-mask-samplecount-too-low');
  if (wordCount < minWords) failures.push('hard-mask-wordcount-too-low');
  if (profileStatus !== 'strong') failures.push('hard-mask-profile-not-strong');
  if (punctuationDensity < minPunctuation) failures.push('hard-mask-punctuation-too-low');
  if (recurrencePressure < minRecurrence) failures.push('hard-mask-recurrence-too-low');

  const score = round(Math.min(1, (Math.min(sampleCount / minSamples, 1) * 0.25) + (Math.min(wordCount / minWords, 1) * 0.35) + ((profileStatus === 'strong' ? 1 : 0.45) * 0.2) + (Math.min(punctuationDensity / minPunctuation, 1) * 0.1) + (Math.min(recurrencePressure / minRecurrence, 1) * 0.1)));
  return { version: HUSH_HARD_MASK_PROOF_VERSION, passed: failures.length === 0, score, failures, profileStatus, sampleCount, wordCount, punctuationDensity, recurrencePressure, thresholds: { minSamples, minWords, minPunctuation, minRecurrence } };
}

export function summarizeHardMaskReadiness(result = {}) {
  return { version: result.version || HUSH_HARD_MASK_PROOF_VERSION, passed: result.passed === true, score: result.score ?? null, failures: list(result.failures), profileStatus: result.profileStatus || '', sampleCount: result.sampleCount ?? null, wordCount: result.wordCount ?? null, punctuationDensity: result.punctuationDensity ?? null, recurrencePressure: result.recurrencePressure ?? null };
}
