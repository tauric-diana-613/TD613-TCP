export const CONTEXT_PROFILE_VERSION = 'phase-9';

export const CONTEXT_TYPES = Object.freeze([
  {
    id: 'group-chat',
    label: 'Group Chat',
    description: 'Small trusted group, conversational cadence, high social readability requirement.',
    expectedRegister: 'warm-practical',
    publicness: 0.18,
    riskBias: { overPolish: 0.75, overLegal: 0.70, theatricality: 0.45, entityRepeat: 0.55, topicRepeat: 0.50 }
  },
  {
    id: 'forum-post',
    label: 'Forum Post',
    description: 'Pseudonymous public or semi-public writing with community style expectations.',
    expectedRegister: 'situated-public',
    publicness: 0.62,
    riskBias: { overPolish: 0.55, overLegal: 0.60, theatricality: 0.55, entityRepeat: 0.65, topicRepeat: 0.70 }
  },
  {
    id: 'public-comment',
    label: 'Public Comment',
    description: 'Civic or institutional comment space with public indexing risk.',
    expectedRegister: 'plain-civic',
    publicness: 0.88,
    riskBias: { overPolish: 0.45, overLegal: 0.45, theatricality: 0.75, entityRepeat: 0.80, topicRepeat: 0.75 }
  },
  {
    id: 'legal-intake',
    label: 'Legal Intake',
    description: 'Evidence-sensitive intake field where facts, dates, and literals matter more than warmth.',
    expectedRegister: 'hostile-pipeline-compression',
    publicness: 0.28,
    riskBias: { overPolish: 0.25, overLegal: 0.25, theatricality: 0.85, entityRepeat: 0.45, topicRepeat: 0.45 }
  },
  {
    id: 'hr-compliance',
    label: 'HR / Compliance Portal',
    description: 'Hostile or semi-hostile bureaucratic ingestion surface.',
    expectedRegister: 'hostile-pipeline-compression',
    publicness: 0.36,
    riskBias: { overPolish: 0.30, overLegal: 0.30, theatricality: 0.85, entityRepeat: 0.50, topicRepeat: 0.55 }
  },
  {
    id: 'protected-tip-form',
    label: 'Protected Tip Form',
    description: 'High-risk reporting surface where private text and metadata deserve extreme caution.',
    expectedRegister: 'document-safe-local',
    publicness: 0.74,
    riskBias: { overPolish: 0.35, overLegal: 0.40, theatricality: 0.90, entityRepeat: 0.70, topicRepeat: 0.80 }
  },
  {
    id: 'internal-workspace',
    label: 'Internal Workspace',
    description: 'Team-channel environment with strong local social priors.',
    expectedRegister: 'warm-practical',
    publicness: 0.42,
    riskBias: { overPolish: 0.70, overLegal: 0.75, theatricality: 0.60, entityRepeat: 0.65, topicRepeat: 0.65 }
  },
  {
    id: 'document-handoff',
    label: 'Document Handoff',
    description: 'Brief chain-of-custody note where semantic preservation and literals dominate.',
    expectedRegister: 'concise-custody',
    publicness: 0.26,
    riskBias: { overPolish: 0.30, overLegal: 0.25, theatricality: 0.80, entityRepeat: 0.35, topicRepeat: 0.35 }
  }
]);

const STOPWORDS = new Set('the a an and or but if then with from into onto for to of in on at by as is are was were be been being this that these those it its you your we our they them he she his her their not no do does did can could should would may might will just only very also keep make made has have had'.split(/\s+/));
const ENTITY_RE = /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\/-]*\b|\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b|\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2}\b/g;

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : 0;
const round = (value, digits = 6) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
const lower = (value) => String(value || '').toLowerCase();

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function tokenize(text = '') {
  return lower(text).match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function contentTerms(text = '') {
  return tokenize(text).filter((token) => token.length > 3 && !STOPWORDS.has(token));
}

function extractEntities(text = '') {
  return unique([...String(text || '').matchAll(ENTITY_RE)].map((match) => match[0]).filter((item) => item.length > 1));
}

function overlap(a = [], b = []) {
  const left = new Set(a);
  const right = new Set(b);
  const shared = [...left].filter((item) => right.has(item));
  const denom = Math.max(1, Math.min(left.size || 1, right.size || 1));
  return { shared, score: clamp(shared.length / denom) };
}

function textStats(text = '') {
  const value = String(text || '');
  const words = tokenize(value);
  const sentences = value.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean);
  const avgSentenceLength = words.length / Math.max(1, sentences.length);
  const punctuationDensity = (value.match(/[,:;!?—-]/g) || []).length / Math.max(1, words.length);
  const glyphLoad = (value.match(/[^\u0000-\u007F]/g) || []).length / Math.max(1, value.length);
  const legalTerms = (value.match(/\b(?:whereas|pursuant|compliance|statutory|liability|jurisdiction|exhibit|custody|hereby|therefore|aforementioned)\b/gi) || []).length;
  const warmTerms = (value.match(/\b(?:hey|team|please|thanks|quick|warm|context|thread|note)\b/gi) || []).length;
  const imageTerms = (value.match(/\b(?:archive|wound|bruise|ghost|ritual|cathedral|ache|heat|blood|mirror|glyph|covenant)\b/gi) || []).length;
  return { words: words.length, sentences: sentences.length, avgSentenceLength, punctuationDensity, glyphLoad, legalTerms, warmTerms, imageTerms };
}

function exposureMultiplier(duration = 'single-use') {
  return { 'single-use': 0.12, 'short-thread': 0.32, recurring: 0.62, 'long-running': 0.86 }[duration] ?? 0.25;
}

function audienceMultiplier(size = '') {
  return { private: 0.12, 'small-group': 0.28, 'semi-public': 0.64, public: 0.9 }[size] ?? null;
}

export function normalizeContextType(type = 'general') {
  const id = lower(type).replaceAll('_', '-').trim();
  return CONTEXT_TYPES.find((context) => context.id === id) || CONTEXT_TYPES.find((context) => context.id === 'group-chat');
}

export function scoreEntityExposure({ protectedBaselineText = '', messageDraftText = '', protectedOutputText = '', protectedLiterals = [] } = {}) {
  const baselineEntities = extractEntities(protectedBaselineText);
  const draftEntities = extractEntities(messageDraftText);
  const outputEntities = extractEntities(protectedOutputText);
  const requiredEntities = unique([...asArray(protectedLiterals), ...draftEntities]);
  const repeatedEntities = unique(outputEntities.filter((entity) => baselineEntities.includes(entity) || draftEntities.includes(entity) || requiredEntities.includes(entity)));
  const preservedEntities = unique(requiredEntities.filter((entity) => protectedOutputText.includes(entity)));
  const entityDensity = outputEntities.length / Math.max(1, tokenize(protectedOutputText).length / 12);
  const score = clamp((repeatedEntities.length / Math.max(1, requiredEntities.length || outputEntities.length || 1)) * 0.65 + Math.min(1, entityDensity) * 0.35);
  return { score: round(score), preservedEntities, repeatedEntities, requiredEntities, optionalEntities: outputEntities.filter((entity) => !requiredEntities.includes(entity)), warnings: repeatedEntities.length >= 4 ? ['entity-density-elevated'] : [] };
}

export function scoreTopicExposure({ protectedBaselineText = '', maskReferenceText = '', messageDraftText = '', protectedOutputText = '' } = {}) {
  const baselineTerms = contentTerms(protectedBaselineText);
  const draftTerms = contentTerms(messageDraftText);
  const maskTerms = contentTerms(maskReferenceText);
  const outputTerms = contentTerms(protectedOutputText);
  const baselineOverlap = overlap(outputTerms, baselineTerms);
  const draftOverlap = overlap(outputTerms, draftTerms);
  const maskOverlap = overlap(outputTerms, maskTerms);
  const score = clamp(baselineOverlap.score * 0.45 + draftOverlap.score * 0.35 + Math.max(0, maskOverlap.score - 0.25) * 0.2);
  return { score: round(score), sharedTerms: unique([...baselineOverlap.shared, ...draftOverlap.shared]).slice(0, 18), baselineOverlap: round(baselineOverlap.score), draftOverlap: round(draftOverlap.score), warnings: score >= 0.62 ? ['topic-leakage-elevated'] : [] };
}

export function scoreTemporalExposure({ exposureDuration = 'single-use', audienceSize = '', contextType = 'group-chat' } = {}) {
  const context = normalizeContextType(contextType);
  const duration = exposureMultiplier(exposureDuration);
  const audience = audienceMultiplier(audienceSize) ?? context.publicness;
  const score = clamp(duration * 0.55 + audience * 0.45);
  return { score: round(score), duration: exposureDuration, audienceSize: audienceSize || 'context-default', publicness: round(audience), warnings: score >= 0.65 ? ['temporal-exposure-elevated'] : [] };
}

export function scoreChannelMismatch({ contextType = 'group-chat', protectedOutputText = '', intendedMode = 'neutralize' } = {}) {
  const context = normalizeContextType(contextType);
  const stats = textStats(protectedOutputText);
  const words = Math.max(1, stats.words);
  const overLegal = clamp((stats.legalTerms / words) * 18);
  const overPolish = clamp((stats.avgSentenceLength > 24 ? 0.45 : 0) + (stats.punctuationDensity < 0.04 && words > 25 ? 0.25 : 0) + (overLegal * 0.3));
  const theatricality = clamp((stats.imageTerms / words) * 18 + stats.glyphLoad * 3);
  const hostileAllowed = ['legal-intake', 'hr-compliance', 'document-handoff', 'protected-tip-form'].includes(context.id) || intendedMode === 'hostile-pipeline-compression';
  const mismatch = clamp(overPolish * context.riskBias.overPolish + overLegal * context.riskBias.overLegal + theatricality * context.riskBias.theatricality);
  const adjusted = hostileAllowed ? clamp(mismatch * 0.65 + theatricality * 0.35) : mismatch;
  return { score: round(adjusted), overPolish: round(overPolish), overLegal: round(overLegal), theatricality: round(theatricality), expectedRegister: context.expectedRegister, warnings: adjusted >= 0.62 ? ['context-register-mismatch'] : [] };
}

export function scoreContextRegisterFit(input = {}) {
  const mismatch = scoreChannelMismatch(input);
  const context = normalizeContextType(input.contextType);
  const stats = textStats(input.protectedOutputText || '');
  const warmPracticalBonus = context.expectedRegister === 'warm-practical' ? clamp((stats.warmTerms / Math.max(1, stats.words)) * 10) * 0.18 : 0;
  const fit = clamp(1 - mismatch.score + warmPracticalBonus);
  return { score: round(fit), status: fit < 0.35 ? 'misfit' : fit < 0.65 ? 'readable' : fit < 0.88 ? 'strong-fit' : 'overfit', penalties: mismatch.warnings, notes: [`expected-register:${context.expectedRegister}`], mismatch };
}

export function buildContextProfile(input = {}) {
  const context = normalizeContextType(input.contextType || input.options?.contextType || 'group-chat');
  const intendedMode = input.intendedMode || input.options?.intendedMode || 'neutralize';
  const exposureDuration = input.exposureDuration || input.options?.exposureDuration || 'single-use';
  const audienceSize = input.audienceSize || input.options?.audienceSize || '';
  const entityExposure = scoreEntityExposure(input);
  const topicExposure = scoreTopicExposure(input);
  const temporalExposure = scoreTemporalExposure({ exposureDuration, audienceSize, contextType: context.id });
  const channelMismatch = scoreChannelMismatch({ ...input, contextType: context.id, intendedMode });
  const registerFit = scoreContextRegisterFit({ ...input, contextType: context.id, intendedMode });
  const limitations = [
    'Context Profile uses local text and mode heuristics only.',
    'Context Profile does not know hidden platform classifiers.',
    'Context Profile does not predict platform outcomes.'
  ];
  return {
    version: CONTEXT_PROFILE_VERSION,
    contextType: context.id,
    label: context.label,
    expectedRegister: context.expectedRegister,
    description: context.description,
    intendedMode,
    exposureDuration,
    audienceSize: audienceSize || 'context-default',
    publicness: round(audienceMultiplier(audienceSize) ?? context.publicness),
    riskBias: { ...context.riskBias },
    entityExposure,
    topicExposure,
    temporalExposure,
    channelMismatch,
    registerFit,
    limitations,
    warnings: unique(entityExposure.warnings, topicExposure.warnings, temporalExposure.warnings, channelMismatch.warnings)
  };
}

export function summarizeContextProfile(profile = {}) {
  return {
    version: profile.version || CONTEXT_PROFILE_VERSION,
    contextType: profile.contextType || 'group-chat',
    label: profile.label || normalizeContextType(profile.contextType).label,
    intendedMode: profile.intendedMode || 'neutralize',
    exposureDuration: profile.exposureDuration || 'single-use',
    contextLegibility: profile.registerFit?.score ?? null,
    topicExposure: profile.topicExposure?.score ?? null,
    entityExposure: profile.entityExposure?.score ?? null,
    temporalExposure: profile.temporalExposure?.score ?? null,
    channelMismatch: profile.channelMismatch?.score ?? null,
    warnings: asArray(profile.warnings),
    limitations: asArray(profile.limitations)
  };
}
