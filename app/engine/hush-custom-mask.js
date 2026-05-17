import { extractCadenceProfile } from './stylometry.js';
import { localProfileStatus, localProfileSummary } from './hush-mask-studio.js';

export const HUSH_CUSTOM_MASK_VERSION = 'phase-11';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];

function slug(value = 'custom-mask') {
  return safeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-mask';
}

function wordCount(text = '') {
  return (safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
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

function buildSample(text = '', index = 0, options = {}) {
  const value = safeText(text).trim();
  return {
    id: sampleId(value, index),
    textHash: hashText(value),
    textIncluded: Boolean(options.includePrivateText),
    text: options.includePrivateText ? value : null,
    wordCount: wordCount(value),
    profile: extractCadenceProfile(value)
  };
}

function statusFor(totalWords = 0, sampleCount = 0) {
  if (!sampleCount || !totalWords) return 'empty';
  if (totalWords < 70 || sampleCount < 2) return 'thin';
  if (totalWords < 220) return 'usable';
  return 'strong';
}

function warningsFor(mask = {}) {
  const warnings = [];
  if (!mask.sampleCount) warnings.push('no-samples');
  if (asArray(mask.samples).some((sample) => sample.wordCount > 0 && sample.wordCount < 35)) warnings.push('short-sample');
  if (mask.profileStatus === 'thin') warnings.push('thin-mask');
  if (mask.sampleCount === 1) warnings.push('single-context-mask');
  if (mask.sampleCount > 0 && mask.totalWords < 160) warnings.push('profile-overfit-risk');
  warnings.push('private-text-excluded');
  warnings.push('custom-mask-local-only');
  return [...new Set(warnings)];
}

export function createCustomMask(input = {}) {
  const label = safeText(input.label || input.name || 'Custom Mask').trim() || 'Custom Mask';
  const mask = {
    version: HUSH_CUSTOM_MASK_VERSION,
    id: input.id || `custom-${slug(label)}`,
    label,
    source: 'custom',
    samples: [],
    compositeProfile: extractCadenceProfile(''),
    profileSummary: localProfileSummary(extractCadenceProfile('')),
    sampleCount: 0,
    totalWords: 0,
    profileStatus: 'empty',
    warnings: ['no-samples', 'private-text-excluded', 'custom-mask-local-only'],
    limitations: ['Custom masks are local profile targets built from operator-supplied samples.']
  };
  return mask;
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
  const profileStatus = statusFor(totalWords, samples.length);
  const next = {
    ...createCustomMask(mask),
    ...mask,
    samples: samples.map((sample) => ({ ...sample, textIncluded: Boolean(sample.text), text: options.includePrivateText ? sample.text : null })),
    compositeProfile,
    profileSummary: localProfileSummary(compositeProfile),
    sampleCount: samples.length,
    totalWords,
    profileStatus
  };
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
    totalWords: rebuilt.totalWords,
    profileStatus: rebuilt.profileStatus,
    profileSummary: rebuilt.profileSummary,
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
      profile: sample.profile
    })),
    compositeProfile: rebuilt.compositeProfile,
    profileSummary: rebuilt.profileSummary,
    sampleCount: rebuilt.sampleCount,
    totalWords: rebuilt.totalWords,
    profileStatus: rebuilt.profileStatus,
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
