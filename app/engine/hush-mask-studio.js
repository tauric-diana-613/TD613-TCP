import hushMasks from '../data/hush-masks.js';
import phase22HushMasks from '../data/hush-phase22-masks.js';
import phase24HushMasks from '../data/hush-phase24-masks.js';
import phase27HushMasks from '../data/hush-phase27-masks.js';
import phase28HushMasks from '../data/hush-phase28-masks.js';
import { enrichHushMask } from '../data/hush-mask-traits.js';
import { extractCadenceProfile } from './stylometry.js';
import { applyAuthorshipProtectionToMask, buildAuthorshipProtectionPolicy } from './hush-authorship-protection.js';
import { applyStyleDiversity } from './hush-style-diversity.js';

export const HUSH_MASK_STUDIO_VERSION = 'phase-16-pr149-style-diversity';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
const DISTRIBUTION_KEYS = ['avgSentenceLength', 'punctuationDensity', 'contractionDensity', 'recurrencePressure', 'lexicalDensity', 'modifierDensity', 'lineBreakDensity', 'lexicalEntropy'];
const BUILT_IN_MASKS = [...hushMasks, ...phase22HushMasks, ...phase24HushMasks, ...phase27HushMasks, ...phase28HushMasks];

function wordCount(text = '') { return (safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
function profileStatus(profile = {}, text = '') { const words = profile.wordCount ?? wordCount(text); if (!words) return 'empty'; if (words < 35) return 'thin'; if (words < 90) return 'usable'; return 'strong'; }
function summarizeProfile(profile = {}) { return { wordCount: profile.wordCount ?? null, avgSentenceLength: Number.isFinite(profile.avgSentenceLength) ? round(profile.avgSentenceLength, 3) : null, punctuationDensity: Number.isFinite(profile.punctuationDensity) ? round(profile.punctuationDensity, 4) : null, contractionDensity: Number.isFinite(profile.contractionDensity) ? round(profile.contractionDensity, 4) : null, recurrencePressure: Number.isFinite(profile.recurrencePressure) ? round(profile.recurrencePressure, 4) : null, abstractionPosture: Number.isFinite(profile.lexicalDensity) ? round(profile.lexicalDensity, 4) : null, modifierDensity: Number.isFinite(profile.modifierDensity) ? round(profile.modifierDensity, 4) : null, lineBreakDensity: Number.isFinite(profile.lineBreakDensity) ? round(profile.lineBreakDensity, 4) : null, lexicalEntropy: Number.isFinite(profile.lexicalEntropy) ? round(profile.lexicalEntropy, 4) : null }; }
function detectWeakProfile(profile = {}, seed = '') { const warnings = []; const words = profile.wordCount ?? wordCount(seed); if (!words) warnings.push('mask-reference-empty'); if (words > 0 && words < 35) warnings.push('mask-reference-short'); if (!profile || profile.empty) warnings.push('profile-missing'); if (words < 90) warnings.push('profile-low-evidence'); return warnings; }
function toleranceFor(key, value) { const base = { avgSentenceLength: 4, punctuationDensity: 0.08, contractionDensity: 0.025, recurrencePressure: 0.12, lexicalDensity: 0.18, modifierDensity: 0.06, lineBreakDensity: 0.06, lexicalEntropy: 0.7 }[key] ?? 0.1; return round(Math.max(base, Math.abs(Number(value) || 0) * 0.18)); }

export function buildMaskDistribution(profile = {}, options = {}) {
  const centroid = {}; const variance = {}; const toleranceBands = {}; const targetFeatureWeights = {};
  for (const key of DISTRIBUTION_KEYS) if (Number.isFinite(profile[key])) { centroid[key] = round(profile[key]); variance[key] = round(Math.max(toleranceFor(key, profile[key]) / 2, 0.0001)); toleranceBands[key] = { min: round(profile[key] - toleranceFor(key, profile[key])), max: round(profile[key] + toleranceFor(key, profile[key])) }; targetFeatureWeights[key] = ['avgSentenceLength', 'punctuationDensity', 'recurrencePressure', 'lexicalDensity', 'lexicalEntropy'].includes(key) ? 1 : 0.7; }
  return { version: HUSH_MASK_STUDIO_VERSION, centroid, variance, toleranceBands, targetFeatureWeights, minEvidence: { samples: options.sampleCount || 1, words: profile.wordCount || 0 }, limitations: ['Single-seed built-in masks expose starting distributions; custom masks should add samples for stronger variance.'] };
}

function normalizeProfileTargets(profileTargets = {}, distribution = {}) {
  if (!profileTargets || !Object.keys(profileTargets).length) return distribution;
  if (profileTargets.centroid && profileTargets.toleranceBands) return profileTargets;
  const centroid = { ...(distribution.centroid || {}) };
  const toleranceBands = { ...(distribution.toleranceBands || {}) };
  const targetFeatureWeights = { ...(distribution.targetFeatureWeights || {}) };
  for (const key of DISTRIBUTION_KEYS) {
    const value = Number(profileTargets[key]);
    if (!Number.isFinite(value)) continue;
    centroid[key] = round(value);
    toleranceBands[key] = { min: round(value - toleranceFor(key, value)), max: round(value + toleranceFor(key, value)) };
    targetFeatureWeights[key] = 1;
  }
  return { ...distribution, centroid, toleranceBands, targetFeatureWeights, diversityAxisTargets: profileTargets, limitations: [...asArray(distribution.limitations), 'Diversity profile targets were normalized into the mask distribution schema for Mask Studio compatibility.'] };
}

export function listHushMasks(input = {}) { const masks = asArray(input.masks).length ? input.masks : BUILT_IN_MASKS; return masks.map((mask) => hydrateHushMask(enrichHushMask(mask))); }
export function getHushMask(maskId = '', input = {}) { const id = safeText(maskId); return listHushMasks(input).find((mask) => mask.id === id) || listHushMasks(input)[0] || null; }
export function hydrateHushMask(mask = {}) { const diverseMask = applyStyleDiversity(mask); const protectedMask = applyAuthorshipProtectionToMask(diverseMask); const enriched = enrichHushMask(protectedMask); const sampleSeed = safeText(enriched.sampleSeed); const profile = enriched.profile || extractCadenceProfile(sampleSeed); const distribution = enriched.distribution || buildMaskDistribution(profile); const profileTargets = normalizeProfileTargets(enriched.profileTargets, distribution); const warnings = detectHushMaskWarnings({ ...enriched, profile }); return { version: HUSH_MASK_STUDIO_VERSION, source: 'built-in', ...enriched, sampleSeed, profile, distribution, profileTargets, profileStatus: profileStatus(profile, sampleSeed), profileSummary: summarizeProfile(profile), warnings }; }
export function buildHushMaskProfile(mask = {}, options = {}) { const hydrated = hydrateHushMask(mask); const policy = hydrated.authorshipProtection || buildAuthorshipProtectionPolicy({ mask: hydrated }); return { version: HUSH_MASK_STUDIO_VERSION, maskId: hydrated.id || '', label: hydrated.label || '', source: hydrated.source || 'built-in', family: hydrated.family || '', description: hydrated.description || '', intendedUse: hydrated.intendedUse || '', riskTell: hydrated.riskTell || '', authorshipClass: hydrated.authorshipClass || policy.authorshipClass, syntheticAllowed: Boolean(hydrated.syntheticAllowed || policy.syntheticAllowed), authorshipProtection: policy, profileStatus: hydrated.profileStatus, profile: options.includeFullProfile === false ? {} : hydrated.profile, profileSummary: hydrated.profileSummary, distribution: hydrated.distribution, profileTargets: hydrated.profileTargets, writingTraits: hydrated.writingTraits || {}, transitionBank: asArray(hydrated.transitionBank), dictionHints: asArray(hydrated.dictionHints), avoidList: asArray(hydrated.avoidList), exampleTransformPairs: asArray(hydrated.exampleTransformPairs), diversity: hydrated.diversity || {}, modeAffinity: asArray(hydrated.modeAffinity), intendedContexts: asArray(hydrated.intendedContexts), transformHints: hydrated.transformHints || {}, pressureWarnings: asArray(hydrated.pressureWarnings), warnings: [...asArray(hydrated.warnings), 'built-in-profile-derived-from-seed'], limitations: ['Hush mask profiles are local stylometric targets, not external recognition outcomes.', 'Built-in masks are starting surfaces; review match and pressure before use.', 'Protected authorship policy does not certify unassisted authorship; it preserves provenance and source safety boundaries.'] }; }
export function summarizeHushMask(mask = {}) { const hydrated = mask.profileSummary ? mask : hydrateHushMask(mask); const policy = hydrated.authorshipProtection || buildAuthorshipProtectionPolicy({ mask: hydrated }); return { id: hydrated.id || hydrated.maskId || '', label: hydrated.label || '', family: hydrated.family || '', authorshipClass: hydrated.authorshipClass || policy.authorshipClass, syntheticAllowed: Boolean(hydrated.syntheticAllowed || policy.syntheticAllowed), profileStatus: hydrated.profileStatus || 'empty', profileSummary: hydrated.profileSummary || summarizeProfile(hydrated.profile || {}), distribution: hydrated.distribution || buildMaskDistribution(hydrated.profile || {}), profileTargets: hydrated.profileTargets || normalizeProfileTargets({}, hydrated.distribution || buildMaskDistribution(hydrated.profile || {})), writingTraits: hydrated.writingTraits || {}, diversity: hydrated.diversity || {}, warnings: asArray(hydrated.warnings), riskTell: hydrated.riskTell || '' }; }
export function exportHushMaskJson(mask = {}, options = {}) { const payload = buildHushMaskProfile(mask, options); if (!options.includePrivateText) delete payload.sampleSeed; return JSON.stringify(payload, null, options.pretty === false ? 0 : 2); }
export function detectHushMaskWarnings(mask = {}) { const profile = mask.profile || extractCadenceProfile(mask.sampleSeed || ''); const warnings = detectWeakProfile(profile, mask.sampleSeed || ''); if (!mask.id) warnings.push('mask-id-missing'); if (!mask.label) warnings.push('mask-label-missing'); if (!mask.intendedUse) warnings.push('mask-intendedUse-missing'); if (!mask.riskTell) warnings.push('mask-risk-tell-missing'); if (!mask.writingTraits) warnings.push('mask-writing-traits-derived'); if (!mask.authorshipProtection) warnings.push('authorship-protection-derived'); if (!mask.diversity?.version) warnings.push('style-diversity-policy-derived'); return [...new Set(warnings)]; }
export function localProfileSummary(profile = {}) { return summarizeProfile(profile); }
export function localProfileStatus(profile = {}, text = '') { return profileStatus(profile, text); }
export function profileEvidenceScore(profile = {}, text = '') { const words = profile.wordCount ?? wordCount(text); return clamp(words / 160); }
