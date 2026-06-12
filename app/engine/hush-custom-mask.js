import { extractCadenceProfile } from './stylometry.js';
import { localProfileStatus, localProfileSummary, buildMaskDistribution } from './hush-mask-studio.js';

export const HUSH_CUSTOM_MASK_VERSION = 'phase-13-corpus';

export const HUSH_CUSTOM_MASK_CORPUS_POLICY = Object.freeze({
  minWordsPerSample: 75,
  provisionalSamples: 12,
  operationalSamples: 24,
  rigorousSamples: 40,
  provisionalWords: 900,
  operationalWords: 1800,
  rigorousWords: 3000,
  holdoutRatio: 0.2,
  rigorousPromptCategories: 5
});

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];

function slug(value = 'custom-mask') {
  return safeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-mask';
}

function wordCount(text = '') {
  return (safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
}

function charCount(text = '') {
  return safeText(text).trim().length;
}

function sentenceCount(text = '') {
  return (safeText(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((item) => item.trim()).filter(Boolean).length;
}

function lineUnitCount(text = '') {
  return safeText(text).split(/\n+/).map((line) => line.trim()).filter(Boolean).length;
}

function normalizeCategory(value = '') {
  return safeText(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'uncategorized';
}

function hashText(text = '') {
  let hash = 2166136261;
  for (const char of safeText(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `h${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function sampleId(text = '', index = 0) {
  return `sample-${index + 1}-${hashText(text).slice(1, 7)}`;
}

function buildSampleWarnings(value = '', metrics = {}) {
  const warnings = [];
  if (metrics.wordCount < HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample) warnings.push('below-75-word-floor');
  if (metrics.sentenceCount < 2 && metrics.lineUnitCount < 3) warnings.push('low-structure-sample');
  if (metrics.wordCount > 0 && metrics.wordCount < 100) warnings.push('minimum-floor-sample');
  if (/^(?:[\s"'“”‘’.,;:!?-]|\d)+$/.test(value)) warnings.push('non-linguistic-sample');
  return warnings;
}

function sampleEligibility(metrics = {}) {
  if (metrics.wordCount < HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample) return 'rejected-too-short';
  if (metrics.sentenceCount < 2 && metrics.lineUnitCount < 3) return 'accepted-low-structure';
  return 'accepted';
}

function buildSample(text = '', index = 0, options = {}) {
  const value = safeText(text).trim();
  const metrics = {
    wordCount: wordCount(value),
    charCount: charCount(value),
    sentenceCount: sentenceCount(value),
    lineUnitCount: lineUnitCount(value)
  };
  const category = normalizeCategory(options.promptCategory || options.contextLabel || options.category || 'uncategorized');
  return {
    id: sampleId(value, index),
    textHash: hashText(value),
    textIncluded: Boolean(options.includePrivateText),
    text: options.includePrivateText ? value : null,
    ...metrics,
    promptCategory: category,
    contextLabel: safeText(options.contextLabel || options.promptCategory || category).trim() || category,
    createdAt: options.createdAt || new Date().toISOString(),
    eligibility: sampleEligibility(metrics),
    warnings: buildSampleWarnings(value, metrics),
    profile: extractCadenceProfile(value)
  };
}

function acceptedSamples(samples = []) {
  return samples.filter((sample) => (sample.wordCount || 0) >= HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample && sample.eligibility !== 'rejected-too-short');
}

function promptCategorySummary(samples = []) {
  const summary = {};
  for (const sample of samples) {
    const key = normalizeCategory(sample.promptCategory || sample.contextLabel || 'uncategorized');
    summary[key] = (summary[key] || 0) + 1;
  }
  return summary;
}

function corpusStatus(readiness = {}) {
  if (!readiness.acceptedSampleCount || !readiness.acceptedWords) return 'empty';
  if (readiness.acceptedSampleCount >= HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousSamples && readiness.acceptedWords >= HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousWords && readiness.promptCategoryCount >= HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousPromptCategories) return 'rigorous';
  if (readiness.acceptedSampleCount >= HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalSamples && readiness.acceptedWords >= HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalWords) return 'operational';
  if (readiness.acceptedSampleCount >= HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalSamples && readiness.acceptedWords >= HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalWords) return 'provisional';
  return 'corpus-building';
}

function buildCorpusReadiness(samples = []) {
  const cleanSamples = asArray(samples);
  const accepted = acceptedSamples(cleanSamples);
  const categoryCounts = promptCategorySummary(accepted);
  const promptCategories = Object.keys(categoryCounts).sort();
  const acceptedWords = accepted.reduce((sum, sample) => sum + (sample.wordCount || 0), 0);
  const totalWords = cleanSamples.reduce((sum, sample) => sum + (sample.wordCount || 0), 0);
  const acceptedSampleCount = accepted.length;
  const readiness = {
    policyVersion: HUSH_CUSTOM_MASK_VERSION,
    status: 'empty',
    sampleCount: cleanSamples.length,
    acceptedSampleCount,
    rejectedSampleCount: cleanSamples.length - acceptedSampleCount,
    totalWords,
    acceptedWords,
    totalChars: cleanSamples.reduce((sum, sample) => sum + (sample.charCount || 0), 0),
    promptCategoryCount: promptCategories.length,
    promptCategories,
    promptCategorySummary: categoryCounts,
    heldoutSampleCount: acceptedSampleCount >= HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalSamples ? Math.max(1, Math.floor(acceptedSampleCount * HUSH_CUSTOM_MASK_CORPUS_POLICY.holdoutRatio)) : 0,
    buildSampleCount: acceptedSampleCount,
    readinessScore: 0,
    generationAllowed: false,
    rigorousEligible: false
  };
  readiness.status = corpusStatus(readiness);
  readiness.generationAllowed = readiness.status === 'operational' || readiness.status === 'rigorous';
  readiness.rigorousEligible = readiness.status === 'rigorous';
  readiness.readinessScore = Number(Math.min(1, Math.max(
    acceptedSampleCount / HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousSamples,
    acceptedWords / HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousWords
  )).toFixed(3));
  return readiness;
}

function buildHoldoutValidation(samples = [], readiness = {}) {
  const accepted = acceptedSamples(samples);
  const heldoutSampleCount = readiness.heldoutSampleCount || 0;
  const heldout = heldoutSampleCount ? accepted.slice(-heldoutSampleCount) : [];
  return {
    required: readiness.acceptedSampleCount >= HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalSamples,
    ratio: HUSH_CUSTOM_MASK_CORPUS_POLICY.holdoutRatio,
    heldoutSampleCount,
    heldoutSampleIds: heldout.map((sample) => sample.id),
    status: readiness.rigorousEligible ? 'pass-required' : (heldoutSampleCount ? 'pending' : 'not-ready'),
    checks: ['profile-reconstruction-distance', 'volatility-dimensions', 'overfit-dimensions', 'catchphrase-infection', 'compression-drift', 'sample-phrase-reuse']
  };
}

function statusFor(totalWords = 0, sampleCount = 0) {
  return corpusStatus({ acceptedWords: totalWords, acceptedSampleCount: sampleCount, promptCategoryCount: 0 });
}

function corpusWarningsFor(mask = {}) {
  const warnings = [];
  const readiness = mask.corpusReadiness || buildCorpusReadiness(mask.samples || []);
  if (!readiness.acceptedSampleCount) warnings.push('no-accepted-samples');
  if (readiness.status === 'corpus-building') warnings.push('mask-not-ready-corpus-building');
  if (readiness.status === 'provisional') warnings.push('provisional-mask-corpus');
  if (readiness.status === 'operational') warnings.push('operational-not-rigorous');
  if (readiness.promptCategoryCount > 0 && readiness.promptCategoryCount < 5) warnings.push('low-context-diversity');
  if (readiness.acceptedSampleCount > 0 && readiness.acceptedWords < HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousWords) warnings.push('under-rigorous-word-floor');
  return warnings;
}

function warningsFor(mask = {}) {
  const warnings = [];
  const samples = asArray(mask.samples);
  const readiness = mask.corpusReadiness || buildCorpusReadiness(samples);
  if (!mask.sampleCount) warnings.push('no-samples');
  if (samples.some((sample) => sample.eligibility === 'rejected-too-short' || (sample.wordCount > 0 && sample.wordCount < HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample))) warnings.push('short-sample');
  if (readiness.status === 'empty' || readiness.status === 'corpus-building') warnings.push('thin-mask');
  if (readiness.acceptedSampleCount === 1) warnings.push('single-context-mask');
  if (readiness.acceptedSampleCount > 0 && readiness.acceptedWords < HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalWords) warnings.push('profile-overfit-risk');
  warnings.push(...corpusWarningsFor(mask));
  warnings.push('private-text-excluded');
  warnings.push('custom-mask-local-only');
  return [...new Set(warnings)];
}

function sampleVariance(samples = [], compositeProfile = {}) {
  const keys = ['avgSentenceLength', 'punctuationDensity', 'contractionDensity', 'recurrencePressure', 'lexicalDensity', 'modifierDensity', 'lineBreakDensity', 'lexicalEntropy'];
  const variance = {};
  const stableDimensions = [];
  const volatileDimensions = [];
  for (const key of keys) {
    const values = samples.map((sample) => Number(sample.profile?.[key])).filter(Number.isFinite);
    if (!values.length) continue;
    const mean = Number(compositeProfile[key] ?? (values.reduce((sum, value) => sum + value, 0) / values.length));
    const varValue = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    variance[key] = Number(varValue.toFixed(6));
    if (varValue <= 0.01) stableDimensions.push(key);
    if (varValue > 0.12) volatileDimensions.push(key);
  }
  return { variance, stableDimensions, volatileDimensions, overfitDimensions: samples.length < 12 ? keys.slice(0, 3) : [] };
}

export function createCustomMask(input = {}) {
  const label = safeText(input.label || input.name || 'Custom Mask').trim() || 'Custom Mask';
  const emptyProfile = extractCadenceProfile('');
  const corpusReadiness = buildCorpusReadiness([]);
  return {
    version: HUSH_CUSTOM_MASK_VERSION,
    id: input.id || `custom-${slug(label)}`,
    label,
    source: 'custom',
    samples: [],
    compositeProfile: emptyProfile,
    profile: emptyProfile,
    distribution: buildMaskDistribution(emptyProfile, { sampleCount: 0 }),
    profileTargets: buildMaskDistribution(emptyProfile, { sampleCount: 0 }),
    profileSummary: localProfileSummary(emptyProfile),
    sampleCount: 0,
    acceptedSampleCount: 0,
    totalWords: 0,
    acceptedWords: 0,
    profileStatus: 'empty',
    corpusPolicy: HUSH_CUSTOM_MASK_CORPUS_POLICY,
    corpusReadiness,
    corpusWarnings: ['no-accepted-samples'],
    promptCategorySummary: {},
    holdoutValidation: buildHoldoutValidation([], corpusReadiness),
    sampleEligibilityLedger: [],
    warnings: ['no-samples', 'private-text-excluded', 'custom-mask-local-only'],
    limitations: ['Custom masks are local profile targets built from operator-supplied samples.']
  };
}

export function addCustomMaskSample(mask = {}, sampleText = '', options = {}) {
  const base = mask.version ? { ...mask, samples: asArray(mask.samples) } : createCustomMask(mask);
  const value = safeText(sampleText).trim();
  if (!value) {
    const next = rebuildCustomMaskProfile(base, options);
    next.warnings = [...new Set([...next.warnings, 'empty-sample'])];
    return next;
  }
  const sample = buildSample(value, base.samples.length, options);
  return rebuildCustomMaskProfile({ ...base, samples: [...base.samples, sample] }, options);
}

export function removeCustomMaskSample(mask = {}, sampleId = '') {
  const samples = asArray(mask.samples).filter((sample) => sample.id !== sampleId);
  return rebuildCustomMaskProfile({ ...mask, samples });
}

export function rebuildCustomMaskProfile(mask = {}, options = {}) {
  const samples = asArray(mask.samples);
  const totalWords = samples.reduce((sum, sample) => sum + (sample.wordCount || 0), 0);
  const compositeText = samples.map((sample) => sample.text || '').filter(Boolean).join('\n\n');
  const compositeProfile = compositeText ? extractCadenceProfile(compositeText) : averageProfiles(samples.map((sample) => sample.profile));
  const distribution = buildMaskDistribution(compositeProfile, { sampleCount: samples.length });
  const varianceSummary = sampleVariance(samples, compositeProfile);
  const corpusReadiness = buildCorpusReadiness(samples);
  const holdoutValidation = buildHoldoutValidation(samples, corpusReadiness);
  const promptSummary = promptCategorySummary(acceptedSamples(samples));
  const next = {
    ...createCustomMask(mask),
    ...mask,
    version: HUSH_CUSTOM_MASK_VERSION,
    samples: samples.map((sample) => ({ ...sample, textIncluded: Boolean(sample.text), text: options.includePrivateText ? sample.text : null })),
    compositeProfile,
    profile: compositeProfile,
    distribution: { ...distribution, ...varianceSummary },
    profileTargets: { ...distribution, ...varianceSummary },
    profileSummary: localProfileSummary(compositeProfile),
    sampleCount: samples.length,
    acceptedSampleCount: corpusReadiness.acceptedSampleCount,
    totalWords,
    acceptedWords: corpusReadiness.acceptedWords,
    profileStatus: corpusReadiness.status,
    corpusPolicy: HUSH_CUSTOM_MASK_CORPUS_POLICY,
    corpusReadiness,
    corpusWarnings: [],
    promptCategorySummary: promptSummary,
    holdoutValidation,
    sampleEligibilityLedger: samples.map((sample) => ({
      id: sample.id,
      textHash: sample.textHash,
      wordCount: sample.wordCount,
      charCount: sample.charCount || 0,
      sentenceCount: sample.sentenceCount || 0,
      lineUnitCount: sample.lineUnitCount || 0,
      promptCategory: sample.promptCategory || 'uncategorized',
      eligibility: sample.eligibility || ((sample.wordCount || 0) >= HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample ? 'accepted' : 'rejected-too-short'),
      warnings: asArray(sample.warnings)
    }))
  };
  next.corpusWarnings = corpusWarningsFor(next);
  next.warnings = warningsFor(next);
  return next;
}

function averageProfiles(profiles = []) {
  const clean = profiles.filter(Boolean);
  if (!clean.length) return extractCadenceProfile('');
  const keys = ['wordCount', 'avgSentenceLength', 'punctuationDensity', 'contractionDensity', 'recurrencePressure', 'lexicalDensity', 'modifierDensity', 'lineBreakDensity', 'lexicalEntropy'];
  const profile = { ...clean[0] };
  for (const key of keys) {
    const values = clean.map((item) => Number(item[key])).filter(Number.isFinite);
    if (values.length) profile[key] = values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  profile.wordCount = clean.reduce((sum, item) => sum + (item.wordCount || 0), 0);
  return profile;
}

export function summarizeCustomMask(mask = {}) {
  const rebuilt = rebuildCustomMaskProfile(mask);
  return {
    id: rebuilt.id,
    label: rebuilt.label,
    sampleCount: rebuilt.sampleCount,
    acceptedSampleCount: rebuilt.acceptedSampleCount,
    totalWords: rebuilt.totalWords,
    acceptedWords: rebuilt.acceptedWords,
    profileStatus: rebuilt.profileStatus,
    corpusReadiness: rebuilt.corpusReadiness,
    profileSummary: rebuilt.profileSummary,
    distribution: rebuilt.distribution,
    warnings: rebuilt.warnings
  };
}

export function exportCustomMaskJson(mask = {}, options = {}) {
  const rebuilt = rebuildCustomMaskProfile(mask, options);
  const payload = {
    version: HUSH_CUSTOM_MASK_VERSION,
    id: rebuilt.id,
    label: rebuilt.label,
    source: 'custom',
    samples: rebuilt.samples.map((sample) => ({
      id: sample.id,
      textHash: sample.textHash,
      textIncluded: Boolean(options.includePrivateText),
      text: options.includePrivateText ? sample.text : null,
      wordCount: sample.wordCount,
      charCount: sample.charCount || 0,
      sentenceCount: sample.sentenceCount || 0,
      lineUnitCount: sample.lineUnitCount || 0,
      promptCategory: sample.promptCategory || 'uncategorized',
      contextLabel: sample.contextLabel || sample.promptCategory || 'uncategorized',
      eligibility: sample.eligibility || 'accepted',
      warnings: asArray(sample.warnings),
      profile: sample.profile
    })),
    compositeProfile: rebuilt.compositeProfile,
    profile: rebuilt.profile,
    distribution: rebuilt.distribution,
    profileTargets: rebuilt.profileTargets,
    profileSummary: rebuilt.profileSummary,
    sampleCount: rebuilt.sampleCount,
    acceptedSampleCount: rebuilt.acceptedSampleCount,
    totalWords: rebuilt.totalWords,
    acceptedWords: rebuilt.acceptedWords,
    profileStatus: rebuilt.profileStatus,
    corpusPolicy: rebuilt.corpusPolicy,
    corpusReadiness: rebuilt.corpusReadiness,
    corpusWarnings: rebuilt.corpusWarnings,
    promptCategorySummary: rebuilt.promptCategorySummary,
    holdoutValidation: rebuilt.holdoutValidation,
    sampleEligibilityLedger: rebuilt.sampleEligibilityLedger,
    warnings: rebuilt.warnings,
    limitations: rebuilt.limitations,
    reproducibility: { privateTextIncluded: Boolean(options.includePrivateText) }
  };
  return JSON.stringify(payload, null, options.pretty === false ? 0 : 2);
}

export function importCustomMaskJson(json = '') {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
  return rebuildCustomMaskProfile({ ...createCustomMask(parsed), ...parsed });
}

export function validateCustomMask(mask = {}) {
  const failures = [];
  if (!mask.id) failures.push('missing-id');
  if (!mask.label) failures.push('missing-label');
  if (!asArray(mask.samples).length) failures.push('missing-samples');
  if (!mask.compositeProfile || mask.compositeProfile.empty) failures.push('missing-profile');
  return { valid: failures.length === 0, failures, status: failures.length ? 'fail' : 'pass' };
}
