import { buildContextProfile, summarizeContextProfile } from './context-profile.js';

export const RECOGNITION_FIELD_VERSION = 'phase-9';

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : 0;
const round = (value, digits = 6) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];
const lower = (value) => String(value || '').toLowerCase();
const score = (vector = {}, key) => Number.isFinite(vector?.scores?.[key]) ? vector.scores[key] : 0;

const ENTITY_RE = /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\/-]*\b|\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b|\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2}\b/g;
const STOPWORDS = new Set('the a an and or but if then with from into onto for to of in on at by as is are was were be been being this that these those it its you your we our they them he she his her their not no do does did can could should would may might will just only very also keep make made has have had'.split(/\s+/));

function tokens(text = '') {
  return lower(text).match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function contentTerms(text = '') {
  return tokens(text).filter((token) => token.length > 3 && !STOPWORDS.has(token));
}

function extractEntities(text = '') {
  return [...new Set([...String(text || '').matchAll(ENTITY_RE)].map((match) => match[0]).filter(Boolean))];
}

function shared(left = [], right = []) {
  const a = new Set(left);
  const b = new Set(right);
  return [...a].filter((item) => b.has(item));
}

function exposureDurationWeight(duration = 'single-use') {
  return { 'single-use': 0.12, 'short-thread': 0.34, recurring: 0.64, 'long-running': 0.88 }[duration] ?? 0.22;
}

function audienceWeight(size = 'private') {
  return { private: 0.12, 'small-group': 0.28, 'semi-public': 0.62, public: 0.9, 'context-default': 0.36 }[size] ?? 0.36;
}

function statusFor(scoreValue, labels = ['low', 'moderate', 'high']) {
  if (scoreValue < 0.34) return labels[0];
  if (scoreValue < 0.67) return labels[1];
  return labels[2];
}

function routeForPressure(value) {
  if (value >= 0.78) return 'hold';
  if (value >= 0.62) return 'hot';
  if (value >= 0.42) return 'caution';
  if (value >= 0.22) return 'warm';
  return 'reviewable';
}

function modeOf(options = {}, contextProfile = {}) {
  return options.intendedMode || contextProfile.intendedMode || 'neutralize';
}

export function scoreTopicLeakage({ protectedBaselineText = '', messageDraftText = '', protectedOutputText = '', contextProfile = {} } = {}) {
  const outputTerms = contentTerms(protectedOutputText);
  const baselineShared = shared(outputTerms, contentTerms(protectedBaselineText));
  const draftShared = shared(outputTerms, contentTerms(messageDraftText));
  const contextTopic = contextProfile.topicExposure?.score;
  const density = (baselineShared.length * 0.55 + draftShared.length * 0.45) / Math.max(1, Math.min(outputTerms.length || 1, contentTerms(protectedBaselineText).length + contentTerms(messageDraftText).length || 1));
  const value = clamp((Number.isFinite(contextTopic) ? contextTopic : density) * 0.65 + density * 0.35);
  return { score: round(value), sharedTerms: unique(baselineShared, draftShared).slice(0, 18), warnings: value >= 0.62 ? ['topic-leakage-elevated'] : [] };
}

export function scoreEntityLeakage({ protectedBaselineText = '', messageDraftText = '', protectedOutputText = '', protectedLiterals = [], contextProfile = {} } = {}) {
  const output = extractEntities(protectedOutputText);
  const baseline = extractEntities(protectedBaselineText);
  const draft = extractEntities(messageDraftText);
  const required = unique(protectedLiterals, draft);
  const repeated = unique(output.filter((entity) => baseline.includes(entity) || draft.includes(entity) || required.includes(entity)));
  const requiredPreserved = required.filter((entity) => protectedOutputText.includes(entity));
  const contextEntity = contextProfile.entityExposure?.score;
  const density = repeated.length / Math.max(1, required.length || output.length || 1);
  const value = clamp((Number.isFinite(contextEntity) ? contextEntity : density) * 0.55 + density * 0.45);
  return { score: round(value), preservedEntities: requiredPreserved, repeatedEntities: repeated, requiredEntities: required, optionalEntities: output.filter((entity) => !required.includes(entity)), warnings: value >= 0.62 ? ['entity-leakage-elevated'] : [] };
}

export function scoreIndexability({ protectedOutputText = '', ingestionAudit = {}, personaSummary = {}, contextProfile = {}, options = {} } = {}) {
  const outputEntities = extractEntities(protectedOutputText);
  const outputTerms = contentTerms(protectedOutputText);
  const entityDensity = clamp(outputEntities.length / Math.max(1, outputTerms.length / 10));
  const rareSurface = clamp(((protectedOutputText.match(/[#:_/]/g) || []).length / Math.max(1, protectedOutputText.length)) * 16);
  const glyphVisibility = clamp((score({ scores: { ingestionFriction: ingestionAudit.ingestionFriction } }, 'ingestionFriction') || ingestionAudit.ingestionFriction || 0) * 0.65 + ((protectedOutputText.match(/[^\u0000-\u007F]/g) || []).length / Math.max(1, protectedOutputText.length)) * 5);
  const personaHistory = clamp(((personaSummary.acceptedCount || personaSummary.entryCount || 0) / 8) * 0.75 + (personaSummary.field?.meanLinkability || 0) * 0.25);
  const publicness = contextProfile.publicness ?? audienceWeight(options.audienceSize || contextProfile.audienceSize || 'context-default');
  const topicSpecificity = clamp((new Set(outputTerms).size / Math.max(1, outputTerms.length)) * 0.35 + (contextProfile.topicExposure?.score || 0) * 0.65);
  const value = clamp(entityDensity * 0.22 + topicSpecificity * 0.22 + glyphVisibility * 0.18 + personaHistory * 0.18 + publicness * 0.20);
  return { score: round(value), components: { entityDensity: round(entityDensity), topicSpecificity: round(topicSpecificity), glyphVisibility: round(glyphVisibility), personaHistory: round(personaHistory), publicness: round(publicness) }, interpretation: statusFor(value), warnings: value >= 0.68 ? ['indexability-elevated'] : [] };
}

export function scorePersonaContinuityPressure({ escapeVector = {}, personaSummary = {}, iterationLedger = {}, options = {}, contextProfile = {} } = {}) {
  const mode = modeOf(options, contextProfile);
  const historyCount = personaSummary.acceptedCount ?? personaSummary.entryCount ?? iterationLedger.accepted?.iterationIds?.length ?? 0;
  const maskFit = score(escapeVector, 'maskFit');
  const linkability = score(escapeVector, 'maskLinkability') || personaSummary.field?.meanLinkability || 0;
  const drift = score(escapeVector, 'maskDrift') || 0;
  let value = clamp(historyCount / 8) * 0.34 + maskFit * 0.28 + linkability * 0.25 + Math.max(0, 0.45 - drift) * 0.13;
  if (mode === 'stable-pseudonym') value = clamp(value * 0.82);
  if (mode === 'rotating-mask') value = clamp(value * 1.22);
  const status = value < 0.24 ? 'underfit' : value < 0.62 ? 'usable-continuity' : value < 0.82 ? 'overfit-risk' : 'quarantine-risk';
  const warnings = [];
  if (mode === 'rotating-mask' && value >= 0.5) warnings.push('continuity-pressure-high-for-rotating-mask');
  if (status === 'overfit-risk' || status === 'quarantine-risk') warnings.push(status);
  return { score: round(value), status, warnings };
}

export function scoreMaskOverusePressure({ escapeVector = {}, personaSummary = {}, iterationLedger = {}, options = {}, contextProfile = {} } = {}) {
  const historyCount = personaSummary.acceptedCount ?? personaSummary.entryCount ?? iterationLedger.accepted?.iterationIds?.length ?? 0;
  const linkability = score(escapeVector, 'maskLinkability') || personaSummary.field?.meanLinkability || 0;
  const drift = score(escapeVector, 'maskDrift') || 0;
  const repeatedRows = (iterationLedger.rows || []).length;
  let value = clamp(linkability * 0.45 + Math.max(0, 0.5 - drift) * 0.22 + clamp(historyCount / 10) * 0.22 + clamp(repeatedRows / 14) * 0.11);
  if (modeOf(options, contextProfile) === 'stable-pseudonym') value = clamp(value * 0.92);
  if (modeOf(options, contextProfile) === 'rotating-mask') value = clamp(value * 1.18);
  const status = value < 0.25 ? 'fresh' : value < 0.48 ? 'warming' : value < 0.68 ? 'indexable' : value < 0.84 ? 'overfit-risk' : 'quarantine-risk';
  const suggestedAction = status === 'overfit-risk' || status === 'quarantine-risk' ? 'rotate' : status === 'indexable' ? 'cooldown' : 'continue';
  return { score: round(value), status, suggestedAction, warnings: value >= 0.62 ? ['mask-overuse-pressure-elevated'] : [] };
}

export function scoreContextLegibility({ escapeVector = {}, contextProfile = {}, options = {} } = {}) {
  const bwc = score(escapeVector, 'belongingWithoutCollapse');
  const registerFit = contextProfile.registerFit?.score ?? 0.5;
  const semantic = score(escapeVector, 'semanticFidelity');
  const mismatch = contextProfile.channelMismatch?.score ?? 0;
  let value = clamp(bwc * 0.36 + registerFit * 0.34 + semantic * 0.22 + (1 - mismatch) * 0.08);
  if (modeOf(options, contextProfile) === 'hostile-pipeline-compression') value = clamp(value * 0.92 + semantic * 0.08);
  const status = value < 0.32 ? 'misfit' : value < 0.62 ? 'readable' : value < 0.88 ? 'strong-fit' : 'overfit';
  const penalties = unique(contextProfile.registerFit?.penalties, contextProfile.channelMismatch?.warnings);
  return { score: round(value), status, penalties, notes: ['Context legibility is readability without authorship collapse.'] };
}

export function scoreRecognitionRecapture({ escapeVector = {}, contextProfile = {}, topicLeakage = {}, entityLeakage = {}, maskOveruse = {}, ingestionAudit = {} } = {}) {
  const source = score(escapeVector, 'sourceResidualRisk');
  const recapture = score(escapeVector, 'apertureRecaptureRisk');
  const ingestion = score(escapeVector, 'ingestionFriction') || ingestionAudit.ingestionFriction || 0;
  const mismatch = contextProfile.channelMismatch?.score || 0;
  const value = clamp(source * 0.28 + (topicLeakage.score || 0) * 0.18 + (entityLeakage.score || 0) * 0.16 + (maskOveruse.score || 0) * 0.14 + recapture * 0.14 + ingestion * 0.06 + mismatch * 0.04);
  const route = routeForPressure(value);
  const reasons = [];
  if (source >= 0.55) reasons.push('source-residual-elevated');
  if ((topicLeakage.score || 0) >= 0.62) reasons.push('topic-leakage-elevated');
  if ((entityLeakage.score || 0) >= 0.62) reasons.push('entity-leakage-elevated');
  if ((maskOveruse.score || 0) >= 0.62) reasons.push('mask-overuse-elevated');
  if (recapture >= 0.55) reasons.push('aperture-recapture-elevated');
  return { score: round(value), route, reasons };
}

export function buildRecognitionWarnings(input = {}) {
  const warnings = unique(
    input.indexability?.warnings,
    input.topicLeakage?.warnings,
    input.entityLeakage?.warnings,
    input.personaContinuity?.warnings,
    input.maskOveruse?.warnings,
    input.contextLegibility?.penalties,
    input.recapture?.reasons,
    input.contextProfile?.warnings
  );
  if (input.options?.intendedMode === 'rotating-mask' && input.personaContinuity?.score >= 0.5) warnings.push('rotate-mask-continuity-warning');
  if (input.options?.audienceSize === 'public' && input.indexability?.score >= 0.55) warnings.push('public-index-pressure');
  return unique(warnings);
}

export function buildRecognitionField(input = {}) {
  const contextProfile = input.contextProfile || buildContextProfile({ ...input, ...(input.options || {}) });
  const options = { contextType: contextProfile.contextType, intendedMode: contextProfile.intendedMode || 'neutralize', exposureDuration: contextProfile.exposureDuration || 'single-use', audienceSize: contextProfile.audienceSize || 'context-default', ...(input.options || {}) };
  const indexability = scoreIndexability({ ...input, contextProfile, options });
  const topicLeakage = scoreTopicLeakage({ ...input, contextProfile });
  const entityLeakage = scoreEntityLeakage({ ...input, contextProfile });
  const personaContinuity = scorePersonaContinuityPressure({ ...input, contextProfile, options });
  const maskOveruse = scoreMaskOverusePressure({ ...input, contextProfile, options });
  const contextLegibility = scoreContextLegibility({ ...input, contextProfile, options });
  const recapture = scoreRecognitionRecapture({ ...input, contextProfile, topicLeakage, entityLeakage, maskOveruse });
  const ingestion = score(input.escapeVector, 'ingestionFriction') || input.ingestionAudit?.ingestionFriction || 0;
  const contextMismatch = contextProfile.channelMismatch?.score || 0;
  let recognitionPressure = clamp(
    indexability.score * 0.18 +
    topicLeakage.score * 0.16 +
    entityLeakage.score * 0.14 +
    personaContinuity.score * 0.14 +
    maskOveruse.score * 0.12 +
    recapture.score * 0.12 +
    ingestion * 0.08 +
    contextMismatch * 0.06
  );
  if (options.intendedMode === 'stable-pseudonym') recognitionPressure = clamp(recognitionPressure - Math.min(0.08, personaContinuity.score * 0.08) + maskOveruse.score * 0.05);
  if (options.intendedMode === 'rotating-mask') recognitionPressure = clamp(recognitionPressure + personaContinuity.score * 0.08 + maskOveruse.score * 0.05);
  if (options.intendedMode === 'hostile-pipeline-compression') recognitionPressure = clamp(recognitionPressure - Math.min(0.05, contextLegibility.score * 0.04) + Math.max(0, 0.55 - contextLegibility.score) * 0.08);
  const warnings = buildRecognitionWarnings({ indexability, topicLeakage, entityLeakage, personaContinuity, maskOveruse, contextLegibility, recapture, contextProfile, options });
  const route = routeForPressure(Math.max(recognitionPressure, recapture.score));
  const recommendedControllerHints = [];
  if (maskOveruse.suggestedAction === 'rotate') recommendedControllerHints.push({ code: 'rotate-persona', reason: 'mask overuse pressure elevated for intended mode' });
  if (entityLeakage.score >= 0.65 && ['public-comment', 'forum-post', 'protected-tip-form'].includes(contextProfile.contextType)) recommendedControllerHints.push({ code: 'review-entity-density', reason: 'entity leakage elevated in higher-exposure context' });
  if (contextLegibility.score < 0.38) recommendedControllerHints.push({ code: 'restore-context-legibility', reason: 'context legibility low under selected field' });
  if (topicLeakage.score >= 0.65) recommendedControllerHints.push({ code: 'review-topic-leakage', reason: 'topic overlap may create context pressure' });
  return {
    version: RECOGNITION_FIELD_VERSION,
    contextType: contextProfile.contextType,
    intendedMode: options.intendedMode,
    exposureDuration: options.exposureDuration,
    summary: {
      recognitionPressure: round(recognitionPressure),
      contextLegibility: contextLegibility.score,
      indexability: indexability.score,
      topicLeakage: topicLeakage.score,
      entityLeakage: entityLeakage.score,
      personaContinuityPressure: personaContinuity.score,
      maskOverusePressure: maskOveruse.score,
      recapturePressure: recapture.score
    },
    classifications: {
      route,
      continuityMode: personaContinuity.status,
      contextFit: contextLegibility.status,
      exposurePosture: route === 'hold' || route === 'hot' ? 'public-index-risk' : options.exposureDuration === 'single-use' ? 'single-use' : 'thread-risk'
    },
    components: { indexability, topicLeakage, entityLeakage, personaContinuity, maskOveruse, contextLegibility, recapture, contextProfile: summarizeContextProfile(contextProfile) },
    warnings,
    limitations: [
      'Recognition Field simulation does not claim access to hidden platform classifiers.',
      'Recognition Field simulation does not predict platform outcome.',
      'Recognition Field is advisory pressure, not evidentiary permission.'
    ],
    recommendedControllerHints
  };
}

export function summarizeRecognitionField(field = {}) {
  return {
    version: field.version || RECOGNITION_FIELD_VERSION,
    contextType: field.contextType || '',
    intendedMode: field.intendedMode || '',
    recognitionPressure: field.summary?.recognitionPressure ?? null,
    contextLegibility: field.summary?.contextLegibility ?? null,
    indexability: field.summary?.indexability ?? null,
    topicLeakage: field.summary?.topicLeakage ?? null,
    entityLeakage: field.summary?.entityLeakage ?? null,
    personaContinuityPressure: field.summary?.personaContinuityPressure ?? null,
    maskOverusePressure: field.summary?.maskOverusePressure ?? null,
    recapturePressure: field.summary?.recapturePressure ?? null,
    route: field.classifications?.route || '',
    warnings: asArray(field.warnings),
    limitations: asArray(field.limitations)
  };
}
