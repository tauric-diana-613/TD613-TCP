import hushMasks from '../data/hush-masks.js';
import { extractCadenceProfile } from './stylometry.js';

export const HUSH_MASK_STUDIO_VERSION = 'phase-11';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

function wordCount(text = '') {
  return (safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
}

function profileStatus(profile = {}, text = '') {
  const words = profile.wordCount ?? wordCount(text);
  if (!words) return 'empty';
  if (words < 35) return 'thin';
  if (words < 90) return 'usable';
  return 'strong';
}

function summarizeProfile(profile = {}) {
  return {
    wordCount: profile.wordCount ?? null,
    avgSentenceLength: Number.isFinite(profile.avgSentenceLength) ? round(profile.avgSentenceLength, 3) : null,
    punctuationDensity: Number.isFinite(profile.punctuationDensity) ? round(profile.punctuationDensity, 4) : null,
    contractionDensity: Number.isFinite(profile.contractionDensity) ? round(profile.contractionDensity, 4) : null,
    recurrencePressure: Number.isFinite(profile.recurrencePressure) ? round(profile.recurrencePressure, 4) : null,
    abstractionPosture: Number.isFinite(profile.lexicalDensity) ? round(profile.lexicalDensity, 4) : null,
    modifierDensity: Number.isFinite(profile.modifierDensity) ? round(profile.modifierDensity, 4) : null,
    lineBreakDensity: Number.isFinite(profile.lineBreakDensity) ? round(profile.lineBreakDensity, 4) : null,
    lexicalEntropy: Number.isFinite(profile.lexicalEntropy) ? round(profile.lexicalEntropy, 4) : null
  };
}

function detectWeakProfile(profile = {}, seed = '') {
  const warnings = [];
  const words = profile.wordCount ?? wordCount(seed);
  if (!words) warnings.push('mask-reference-empty');
  if (words > 0 && words < 35) warnings.push('mask-reference-short');
  if (!profile || profile.empty) warnings.push('profile-missing');
  if (words < 90) warnings.push('profile-low-evidence');
  return warnings;
}

export function listHushMasks(input = {}) {
  const masks = asArray(input.masks).length ? input.masks : hushMasks;
  return masks.map((mask) => hydrateHushMask(mask));
}

export function getHushMask(maskId = '', input = {}) {
  const id = safeText(maskId);
  return listHushMasks(input).find((mask) => mask.id === id) || listHushMasks(input)[0] || null;
}

export function hydrateHushMask(mask = {}) {
  const sampleSeed = safeText(mask.sampleSeed);
  const profile = mask.profile || extractCadenceProfile(sampleSeed);
  const warnings = detectHushMaskWarnings({ ...mask, profile });
  return {
    version: HUSH_MASK_STUDIO_VERSION,
    source: 'built-in',
    ...mask,
    sampleSeed,
    profile,
    profileStatus: profileStatus(profile, sampleSeed),
    profileSummary: summarizeProfile(profile),
    warnings
  };
}

export function buildHushMaskProfile(mask = {}, options = {}) {
  const hydrated = hydrateHushMask(mask);
  return {
    version: HUSH_MASK_STUDIO_VERSION,
    maskId: hydrated.id || '',
    label: hydrated.label || '',
    source: hydrated.source || 'built-in',
    family: hydrated.family || '',
    description: hydrated.description || '',
    intendedUse: hydrated.intendedUse || '',
    riskTell: hydrated.riskTell || '',
    profileStatus: hydrated.profileStatus,
    profile: options.includeFullProfile === false ? {} : hydrated.profile,
    profileSummary: hydrated.profileSummary,
    modeAffinity: asArray(hydrated.modeAffinity),
    intendedContexts: asArray(hydrated.intendedContexts),
    transformHints: hydrated.transformHints || {},
    pressureWarnings: asArray(hydrated.pressureWarnings),
    warnings: [...asArray(hydrated.warnings), 'built-in-profile-derived-from-seed'],
    limitations: [
      'Hush mask profiles are local stylometric targets, not external recognition outcomes.',
      'Built-in masks are starting surfaces; review match and pressure before use.'
    ]
  };
}

export function summarizeHushMask(mask = {}) {
  const hydrated = mask.profileSummary ? mask : hydrateHushMask(mask);
  return {
    id: hydrated.id || hydrated.maskId || '',
    label: hydrated.label || '',
    family: hydrated.family || '',
    profileStatus: hydrated.profileStatus || 'empty',
    profileSummary: hydrated.profileSummary || summarizeProfile(hydrated.profile || {}),
    warnings: asArray(hydrated.warnings),
    riskTell: hydrated.riskTell || ''
  };
}

export function exportHushMaskJson(mask = {}, options = {}) {
  const payload = buildHushMaskProfile(mask, options);
  if (!options.includePrivateText) {
    delete payload.sampleSeed;
  }
  return JSON.stringify(payload, null, options.pretty === false ? 0 : 2);
}

export function detectHushMaskWarnings(mask = {}) {
  const profile = mask.profile || extractCadenceProfile(mask.sampleSeed || '');
  const warnings = detectWeakProfile(profile, mask.sampleSeed || '');
  if (!mask.id) warnings.push('mask-id-missing');
  if (!mask.label) warnings.push('mask-label-missing');
  if (!mask.intendedUse) warnings.push('mask-intended-use-missing');
  if (!mask.riskTell) warnings.push('mask-risk-tell-missing');
  return [...new Set(warnings)];
}

export function localProfileSummary(profile = {}) {
  return summarizeProfile(profile);
}

export function localProfileStatus(profile = {}, text = '') {
  return profileStatus(profile, text);
}

export function profileEvidenceScore(profile = {}, text = '') {
  const words = profile.wordCount ?? wordCount(text);
  return clamp(words / 160);
}
