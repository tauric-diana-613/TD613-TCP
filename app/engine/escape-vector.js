import { buildIngestionFrictionAudit } from './ingestion-friction.js';
import { buildSourceResidue, scoreSourceResidue } from './hush-source-residue.js';
import {
  buildSemanticAuditBundle,
  compareTexts,
  extractCadenceProfile,
  segmentTextToIR
} from './stylometry.js';

export const DEFAULT_ESCAPE_VECTOR_THRESHOLDS = Object.freeze({
  minWords: 40,
  strongSourceRisk: 0.62,
  acceptableSourceRisk: 0.42,
  strongMaskFit: 0.62,
  usefulMaskDelta: 0.15,
  strongMaskDelta: 0.30,
  semanticFidelityFloor: 0.82,
  linkabilityHigh: 0.72,
  linkabilityLow: 0.25
});

export const PROHIBITED_ESCAPE_VECTOR_CLAIMS = Object.freeze([
  'anonymous',
  'untraceable',
  'platform-proof',
  'same author',
  'not same author',
  'guaranteed safe'
]);

const HIDDEN_MARK_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
const TOKEN_RE = /[\p{L}\p{N}'’-]+/gu;
const NUMBER_RE = /\b\d+(?:[.,:/-]\d+)*\b/g;
const CAPITALIZED_ANCHOR_RE = /\b[A-Z][A-Za-z0-9_.-]{2,}(?:\s+[A-Z][A-Za-z0-9_.-]{2,}){0,3}\b/g;

const clip = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
const round = (value, digits = 6) => Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
const inverseDistance = (value) => Number.isFinite(value) ? 1 - clip(value) : null;
const countWords = (text = '') => (String(text || '').match(TOKEN_RE) || []).length;
const normalizeText = (text = '') => String(text || '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
const stripHiddenMarks = (text = '') => String(text || '').replace(HIDDEN_MARK_RE, '');

function weightedMean(items) {
  let total = 0;
  let weight = 0;
  for (const item of items) {
    if (!item || !Number.isFinite(item.value) || !Number.isFinite(item.weight) || item.weight <= 0) continue;
    total += item.value * item.weight;
    weight += item.weight;
  }
  return weight > 0 ? clip(total / weight) : null;
}

function uniqueWarnings(...groups) {
  return [...new Set(groups.flat().filter(Boolean))];
}

function profileFor(text, suppliedProfile) {
  if (suppliedProfile && typeof suppliedProfile === 'object') return suppliedProfile;
  if (!text || !String(text).trim()) return null;
  try {
    return extractCadenceProfile(String(text));
  } catch {
    return null;
  }
}

function comparePair(textA, textB, profileA = null, profileB = null) {
  if (!textA || !textB) return null;
  try {
    return compareTexts(String(textA), String(textB), {
      ...(profileA ? { profileA } : {}),
      ...(profileB ? { profileB } : {})
    });
  } catch {
    try {
      return compareTexts(String(textA), String(textB));
    } catch {
      return null;
    }
  }
}

function comparisonCloseness(compare) {
  if (!compare || typeof compare !== 'object') return null;
  return weightedMean([
    { value: clip(compare.similarity), weight: 0.18 },
    { value: clip(compare.traceability), weight: 0.24 },
    { value: clip(compare.styleCoherence ?? compare.stylometricCoherence ?? compare.C_style), weight: 0.10 },
    { value: inverseDistance(compare.functionWordDistance), weight: 0.16 },
    { value: inverseDistance(compare.charGramDistance), weight: 0.14 },
    { value: inverseDistance(compare.punctShapeDistance ?? compare.punctuationDistance), weight: 0.10 },
    { value: inverseDistance(compare.wordLengthDistance), weight: 0.08 },
    { value: inverseDistance(compare.spreadDistance), weight: 0.05 },
    { value: inverseDistance(compare.recurrenceDistance), weight: 0.05 }
  ]);
}

function scorePair(textA, textB, profileA = null, profileB = null) {
  const compare = comparePair(textA, textB, profileA, profileB);
  return { compare, score: comparisonCloseness(compare) };
}

function semanticAuditScore(audit = {}) {
  if (!audit || typeof audit !== 'object') return null;
  const direct = audit.semanticFidelity ?? audit.fidelity ?? audit.score ?? audit.overall;
  if (Number.isFinite(direct)) return clip(direct);
  const nested = audit.semanticAudit && typeof audit.semanticAudit === 'object' ? audit.semanticAudit : audit;
  const fields = [
    nested.propositionCoverage,
    nested.actorCoverage,
    nested.actionCoverage,
    nested.objectCoverage,
    nested.literalCoverage,
    nested.anchorCoverage
  ].filter(Number.isFinite);
  return fields.length ? clip(fields.reduce((sum, value) => sum + value, 0) / fields.length) : null;
}

function extractAnchors(text = '') {
  const anchors = new Set();
  for (const match of String(text || '').matchAll(NUMBER_RE)) anchors.add(match[0]);
  for (const match of String(text || '').matchAll(CAPITALIZED_ANCHOR_RE)) {
    const value = match[0].trim();
    if (!['The', 'This', 'That', 'And', 'But', 'Because'].includes(value)) anchors.add(value);
  }
  return [...anchors].filter(Boolean);
}

function preservationScore(anchors = [], outputText = '') {
  const filtered = anchors.map((anchor) => String(anchor || '').trim()).filter(Boolean);
  if (!filtered.length) return null;
  const output = String(outputText || '').toLowerCase();
  return filtered.filter((anchor) => output.includes(anchor.toLowerCase())).length / filtered.length;
}

function literalWarningsAndScore(input) {
  const literalScore = preservationScore(input.protectedLiterals, input.outputText);
  const anchorScore = preservationScore(extractAnchors(input.draftText), input.outputText);
  const warnings = [];
  if (literalScore !== null && literalScore < 1) warnings.push('protected-literal-missing');
  if (anchorScore !== null && anchorScore < 1) warnings.push('anchor-drift');
  const guardScore = weightedMean([
    { value: literalScore, weight: 0.60 },
    { value: anchorScore, weight: 0.40 }
  ]);
  return { guardScore, warnings };
}

function hasSuppliedAudit(audit) {
  return Boolean(audit && typeof audit === 'object' && Object.keys(audit).length > 0);
}

function resolveIngestionAudit(input) {
  if (hasSuppliedAudit(input.ingestionAudit)) {
    return { audit: input.ingestionAudit, status: 'provided' };
  }
  if (!input.outputText) {
    return { audit: null, status: 'unavailable' };
  }
  const audit = buildIngestionFrictionAudit({
    text: input.outputText,
    protectedLiterals: input.protectedLiterals,
    canonicalTokens: input.options?.canonicalTokens
  });
  return { audit, status: 'measured' };
}

export function normalizeEscapeVectorInput(input = {}) {
  const options = input.options || {};
  const thresholds = { ...DEFAULT_ESCAPE_VECTOR_THRESHOLDS, ...(options.thresholds || {}) };
  const protectedBaselineText = input.protectedBaselineText ?? input.sourceText ?? input.baselineText ?? '';
  const maskText = input.maskText ?? input.personaText ?? input.referenceText ?? '';
  const draftText = input.draftText ?? input.messageDraftText ?? '';
  const outputText = input.outputText ?? input.protectedOutputText ?? input.candidateText ?? '';
  return {
    ...input,
    options,
    thresholds,
    mode: options.mode || input.mode || 'neutralize',
    protectedBaselineText: String(protectedBaselineText || ''),
    maskText: String(maskText || ''),
    draftText: String(draftText || ''),
    outputText: String(outputText || ''),
    protectedBaselineProfile: profileFor(protectedBaselineText, input.protectedBaselineProfile ?? input.sourceProfile ?? input.baselineProfile),
    maskProfile: profileFor(maskText, input.maskProfile ?? input.personaProfile ?? input.referenceProfile),
    draftProfile: profileFor(draftText, input.draftProfile),
    outputProfile: profileFor(outputText, input.outputProfile ?? input.protectedOutputProfile ?? input.candidateProfile),
    maskHistory: Array.isArray(input.maskHistory) ? input.maskHistory : [],
    protectedLiterals: Array.isArray(input.protectedLiterals) ? input.protectedLiterals : []
  };
}

function calibratedCloseness(rawScore = null, bodyScore = null) {
  if (!Number.isFinite(rawScore)) return null;
  if (!Number.isFinite(bodyScore)) return clip(rawScore);
  return weightedMean([
    { value: bodyScore, weight: 0.72 },
    { value: rawScore, weight: 0.28 }
  ]);
}

export function computeSourceRiskEnvelope(views = {}) {
  const primary = ['body', 'raw', 'normalized', 'visible', 'glyph']
    .map((key) => views[key])
    .filter(Number.isFinite);
  if (primary.length) return clip(Math.max(...primary));
  const fallback = ['semantic'].map((key) => views[key]).filter(Number.isFinite);
  return fallback.length ? clip(Math.max(...fallback)) : null;
}

export function computeMaskDelta(args = {}) {
  const sourceRisk = args.sourceRisk || args.sourceRiskViews || {};
  const maskFit = args.maskFit || args.maskFitViews || {};
  const delta = { raw: null, normalized: null, visible: null, semantic: null };
  for (const key of Object.keys(delta)) {
    if (Number.isFinite(maskFit[key]) && Number.isFinite(sourceRisk[key])) {
      delta[key] = clip(maskFit[key] - sourceRisk[key], -1, 1);
    }
  }
  const available = Object.values(delta).filter(Number.isFinite);
  return { ...delta, safe: available.length ? Math.min(...available) : null };
}

export function computeSourceResidualRisk(args = {}) {
  const input = normalizeEscapeVectorInput(args);
  const warnings = [];
  const views = { raw: null, normalized: null, visible: null, semantic: null, glyph: null, body: null };
  let body = null;
  if (!input.protectedBaselineText) warnings.push('missing-protected-baseline');
  if (!input.outputText) warnings.push('missing-output');
  if (input.protectedBaselineText && input.outputText) {
    body = buildSourceResidue({ sourceText: input.protectedBaselineText, outputText: input.outputText, protectedLiterals: input.protectedLiterals });
    const bodyScore = scoreSourceResidue(body).sourceResidueRisk;
    views.body = clip(bodyScore);
    const raw = scorePair(input.outputText, input.protectedBaselineText, input.outputProfile, input.protectedBaselineProfile).score;
    const normalized = scorePair(normalizeText(input.outputText), normalizeText(input.protectedBaselineText)).score;
    const visible = scorePair(stripHiddenMarks(input.outputText), stripHiddenMarks(input.protectedBaselineText)).score;
    views.raw = calibratedCloseness(raw, views.body);
    views.normalized = calibratedCloseness(normalized, views.body);
    views.visible = calibratedCloseness(visible, views.body);
  }
  const suppliedSemantic = input.semanticAudit?.sourceRiskSemantic ?? input.views?.sourceRisk?.semantic;
  const suppliedGlyph = input.ingestionAudit?.sourceRiskGlyph ?? input.views?.sourceRisk?.glyph;
  if (Number.isFinite(suppliedSemantic)) views.semantic = calibratedCloseness(clip(suppliedSemantic), views.body);
  if (Number.isFinite(suppliedGlyph)) views.glyph = clip(suppliedGlyph);
  if (input.views?.sourceRisk) {
    for (const key of Object.keys(views)) {
      if (key === 'body') continue;
      if (Number.isFinite(input.views.sourceRisk[key])) views[key] = key === 'glyph' ? clip(input.views.sourceRisk[key]) : calibratedCloseness(clip(input.views.sourceRisk[key]), views.body);
    }
  }
  return { views, envelope: computeSourceRiskEnvelope(views), warnings, body };
}

export function computeMaskFit(args = {}) {
  const input = normalizeEscapeVectorInput(args);
  const warnings = [];
  const views = { raw: null, normalized: null, visible: null, semantic: null };
  if (!input.maskText && !input.maskProfile) warnings.push('missing-mask');
  if (!input.outputText) warnings.push('missing-output');
  if (input.maskText && input.outputText) {
    views.raw = scorePair(input.outputText, input.maskText, input.outputProfile, input.maskProfile).score;
    views.normalized = scorePair(normalizeText(input.outputText), normalizeText(input.maskText)).score;
    views.visible = scorePair(stripHiddenMarks(input.outputText), stripHiddenMarks(input.maskText)).score;
  }
  const suppliedSemantic = input.semanticAudit?.maskFitSemantic ?? input.views?.maskFit?.semantic;
  if (Number.isFinite(suppliedSemantic)) views.semantic = clip(suppliedSemantic);
  if (input.views?.maskFit) {
    for (const key of Object.keys(views)) if (Number.isFinite(input.views.maskFit[key])) views[key] = clip(input.views.maskFit[key]);
  }
  return { views, raw: views.raw, warnings };
}

export function computeSemanticFidelity(args = {}) {
  const input = normalizeEscapeVectorInput(args);
  const warnings = [];
  let score = semanticAuditScore(input.semanticAudit || {});
  let status = Number.isFinite(score) ? 'measured' : 'unavailable';
  if (!Number.isFinite(score) && input.draftText && input.outputText) {
    try {
      const ir = segmentTextToIR(input.draftText, { literals: input.protectedLiterals });
      const bundle = buildSemanticAuditBundle(ir, input.outputText, { literals: input.protectedLiterals });
      score = semanticAuditScore(bundle);
      status = Number.isFinite(score) ? 'measured' : 'unavailable';
    } catch {
      status = 'unavailable';
    }
  }
  if (!input.draftText || !input.outputText) {
    return { score: null, status: 'unavailable', warnings: ['semantic-fidelity-unavailable'] };
  }
  const literalGuard = literalWarningsAndScore(input);
  warnings.push(...literalGuard.warnings);
  if (!Number.isFinite(score)) {
    const contentScore = scorePair(input.draftText, input.outputText, input.draftProfile, input.outputProfile).compare?.similarity;
    score = weightedMean([
      { value: literalGuard.guardScore, weight: 0.62 },
      { value: clip(contentScore), weight: 0.38 }
    ]);
    status = score === null ? 'unavailable' : 'heuristic';
  } else if (Number.isFinite(literalGuard.guardScore)) {
    score = Math.min(score, literalGuard.guardScore);
  }
  if (score === null) warnings.push('semantic-fidelity-unavailable');
  return { score: round(score), status: score === null ? 'unavailable' : status, warnings: uniqueWarnings(warnings) };
}

export function computeMaskLinkability(args = {}) {
  const input = normalizeEscapeVectorInput(args);
  const warnings = [];
  if (!input.maskHistory.length) return { score: null, max: null, status: 'no-history', warnings };
  if (input.maskHistory.length < 3) warnings.push('mask-history-underfit');
  const values = input.maskHistory.map((item) => {
    const text = typeof item === 'string' ? item : item?.text ?? item?.outputText ?? item?.content ?? item?.protectedOutputText ?? '';
    return text ? scorePair(input.outputText, text, input.outputProfile, item?.profile ?? item?.outputProfile ?? null).score : null;
  }).filter(Number.isFinite);
  if (!values.length) return { score: null, max: null, status: 'unavailable', warnings };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return { score: round(mean), max: round(Math.max(...values)), status: 'measured', warnings };
}

export function computeMaskDrift(args = {}) {
  const link = computeMaskLinkability(args);
  return Number.isFinite(link.score)
    ? { score: round(1 - link.score), status: 'measured', warnings: [...link.warnings] }
    : { score: null, status: link.status, warnings: [...link.warnings] };
}

function simpleContextLegibility(profile = null) {
  if (!profile) return null;
  const lengthFit = Number.isFinite(profile.avgSentenceLength) ? 1 - Math.min(1, Math.abs(profile.avgSentenceLength - 18) / 28) : null;
  const puncFit = Number.isFinite(profile.punctuationDensity) ? 1 - Math.min(1, Math.max(0, profile.punctuationDensity - 0.42) / 0.58) : null;
  const lineFit = Number.isFinite(profile.lineBreakDensity) ? 1 - Math.min(1, Math.max(0, profile.lineBreakDensity - 1.1) / 1.5) : null;
  return weightedMean([{ value: lengthFit, weight: 0.4 }, { value: puncFit, weight: 0.3 }, { value: lineFit, weight: 0.3 }]);
}

export function computeBelongingWithoutCollapse(args = {}) {
  const input = normalizeEscapeVectorInput(args);
  const sourceRisk = args.sourceResidualRisk ?? args.sourceRisk ?? null;
  const semanticFidelity = args.semanticFidelity ?? null;
  const linkability = args.maskLinkability ?? null;
  const warnings = input.options.targetContext ? [] : ['bwc-context-unavailable'];
  const contextLegibility = input.options.targetContext ? simpleContextLegibility(input.outputProfile) : null;
  const mode = input.mode;
  const maskIntentFit = Number.isFinite(linkability)
    ? (mode === 'rotating-mask' ? 1 - linkability : mode === 'stable-pseudonym' ? 1 - Math.abs(linkability - 0.58) : 0.5 + 0.5 * (1 - linkability))
    : null;
  const score = weightedMean([
    { value: semanticFidelity, weight: 0.32 },
    { value: Number.isFinite(sourceRisk) ? 1 - sourceRisk : null, weight: 0.28 },
    { value: contextLegibility, weight: 0.20 },
    { value: maskIntentFit, weight: 0.20 }
  ]);
  return { score: round(score), status: score === null ? 'unavailable' : 'provisional', warnings };
}

function sampleSufficiency(input) {
  const counts = { source: countWords(input.protectedBaselineText), mask: countWords(input.maskText), output: countWords(input.outputText) };
  const warnings = [];
  if (!input.protectedBaselineText) warnings.push('missing-protected-baseline');
  if (!input.maskText && !input.maskProfile) warnings.push('missing-mask');
  if (!input.outputText) warnings.push('missing-output');
  if (input.protectedBaselineText && counts.source < input.thresholds.minWords) warnings.push('source-sample-too-short');
  if (input.maskText && counts.mask < input.thresholds.minWords) warnings.push('mask-sample-too-short');
  if (input.outputText && counts.output < input.thresholds.minWords) warnings.push('output-sample-too-short');
  return {
    counts,
    warnings,
    status: warnings.some((warning) => warning.startsWith('missing-')) ? 'unavailable' : warnings.some((warning) => warning.endsWith('too-short')) ? 'weak' : 'sufficient'
  };
}

export function deriveClaimLadder(vector = {}) {
  const scores = vector.scores || {};
  const diagnostics = vector.diagnostics || {};
  const warnings = diagnostics.warnings || [];
  const thresholds = vector.thresholds || DEFAULT_ESCAPE_VECTOR_THRESHOLDS;
  const source = scores.sourceResidualRisk;
  const maskFit = scores.maskFit;
  const delta = scores.maskDeltaSafe ?? scores.maskDeltaRaw;
  const semantic = scores.semanticFidelity;
  const linkability = scores.maskLinkability;
  let ladderLevel = 0;
  let label = 'No reliable signal';
  if (warnings.some((warning) => ['missing-protected-baseline', 'missing-mask', 'missing-output'].includes(warning)) || diagnostics.sampleSufficiency === 'unavailable') {
    ladderLevel = 0;
  } else if (diagnostics.sampleSufficiency === 'weak') {
    ladderLevel = 1;
    label = 'Surface resemblance';
  } else if (Number.isFinite(maskFit) || Number.isFinite(source)) {
    ladderLevel = 2;
    label = 'Style contact';
  }
  if (Number.isFinite(maskFit) && maskFit >= 0.45 && Number.isFinite(delta)) {
    ladderLevel = Math.max(ladderLevel, 3);
    label = 'Traceable style contact';
  }
  if (Number.isFinite(maskFit) && maskFit >= thresholds.strongMaskFit && Number.isFinite(delta)) {
    ladderLevel = Math.max(ladderLevel, 5);
    label = 'Mask-fit candidate';
  }
  if (Number.isFinite(source) && source <= thresholds.acceptableSourceRisk && Number.isFinite(delta) && delta >= thresholds.usefulMaskDelta && Number.isFinite(semantic) && semantic >= thresholds.semanticFidelityFloor && !warnings.includes('source-residual-high')) {
    ladderLevel = Math.max(ladderLevel, 6);
    label = 'Reduced source-linkage candidate';
  }
  if (vector.mode === 'stable-pseudonym' && ladderLevel >= 6 && Number.isFinite(linkability) && linkability >= thresholds.linkabilityLow && linkability <= thresholds.linkabilityHigh && diagnostics.historyStatus === 'measured') {
    ladderLevel = 7;
    label = 'Stable pseudonymous continuity candidate';
  }
  if (warnings.includes('semantic-fidelity-low') && ladderLevel > 4) {
    ladderLevel = 4;
    label = 'Traceable style contact';
  }
  return { ladderLevel, label, ceiling: label, requiresExternalCorroboration: ladderLevel >= 6, prohibitedClaims: [...PROHIBITED_ESCAPE_VECTOR_CLAIMS] };
}

export function buildEscapeVector(input = {}) {
  const normalized = normalizeEscapeVectorInput(input);
  const ingestionResolution = resolveIngestionAudit(normalized);
  const active = { ...normalized, ingestionAudit: ingestionResolution.audit || undefined };
  const sufficiency = sampleSufficiency(active);
  const source = computeSourceResidualRisk(active);
  const mask = computeMaskFit(active);
  const delta = computeMaskDelta({ sourceRisk: source.views, maskFit: mask.views });
  const semantic = computeSemanticFidelity(active);
  const link = computeMaskLinkability(active);
  const drift = computeMaskDrift(active);
  const bwc = computeBelongingWithoutCollapse({ ...active, sourceResidualRisk: source.envelope, semanticFidelity: semantic.score, maskLinkability: link.score });
  const ingestionFriction = Number.isFinite(active.ingestionAudit?.ingestionFriction) ? clip(active.ingestionAudit.ingestionFriction) : null;
  const apertureRecaptureRisk = Number.isFinite(active.apertureAudit?.recaptureRisk) ? clip(active.apertureAudit.recaptureRisk) : null;
  const warnings = uniqueWarnings(sufficiency.warnings, source.warnings, mask.warnings, semantic.warnings, link.warnings, drift.warnings, bwc.warnings, active.ingestionAudit?.warnings || [], active.apertureAudit?.warnings || []);
  if (delta.safe !== null && Object.values(delta).filter(Number.isFinite).length === 1) warnings.push('safe-delta-limited-to-raw');
  if (source.envelope !== null && source.envelope >= active.thresholds.strongSourceRisk) warnings.push('source-residual-high');
  if (mask.raw !== null && countWords(active.maskText) < active.thresholds.minWords) warnings.push('mask-underfit');
  if (semantic.score === null) warnings.push('semantic-fidelity-unavailable');
  if (Number.isFinite(semantic.score) && semantic.score < active.thresholds.semanticFidelityFloor) warnings.push('semantic-fidelity-low');
  if (ingestionFriction === null) warnings.push('ingestion-friction-unavailable');
  if (apertureRecaptureRisk === null) warnings.push('aperture-audit-unavailable');
  const vector = {
    version: 'phase-2.1-calibrated-source-residual',
    mode: active.mode,
    thresholds: { ...active.thresholds },
    scores: {
      sourceResidualRisk: round(source.envelope),
      maskFit: round(mask.raw),
      maskDeltaRaw: round(delta.raw),
      maskDeltaNormalized: round(delta.normalized),
      maskDeltaVisible: round(delta.visible),
      maskDeltaSemantic: round(delta.semantic),
      maskDeltaSafe: round(delta.safe),
      semanticFidelity: round(semantic.score),
      maskLinkability: round(link.score),
      maskLinkabilityMax: round(link.max),
      maskDrift: round(drift.score),
      belongingWithoutCollapse: round(bwc.score),
      ingestionFriction: round(ingestionFriction),
      apertureRecaptureRisk: round(apertureRecaptureRisk)
    },
    views: {
      sourceRisk: { raw: round(source.views.raw), normalized: round(source.views.normalized), visible: round(source.views.visible), semantic: round(source.views.semantic), glyph: round(source.views.glyph), body: round(source.views.body), envelope: round(source.envelope) },
      maskFit: { raw: round(mask.views.raw), normalized: round(mask.views.normalized), visible: round(mask.views.visible), semantic: round(mask.views.semantic) },
      maskDelta: { raw: round(delta.raw), normalized: round(delta.normalized), visible: round(delta.visible), semantic: round(delta.semantic), safe: round(delta.safe) },
      viewsUsed: ['body', 'raw', 'normalized', 'visible'].filter((view) => Number.isFinite(source.views[view]) || Number.isFinite(mask.views[view]))
    },
    ingestionAudit: active.ingestionAudit || null,
    diagnostics: {
      sampleSufficiency: sufficiency.status,
      wordCounts: sufficiency.counts,
      sourceResidueBody: source.body || null,
      semanticStatus: semantic.status,
      historyStatus: link.status,
      ingestionStatus: ingestionResolution.status,
      apertureStatus: apertureRecaptureRisk === null ? 'unavailable' : 'provided',
      bwcStatus: bwc.status,
      warnings: uniqueWarnings(warnings)
    },
    controllerPreview: { state: 'score-only', suggestedNext: [] }
  };
  vector.claim = deriveClaimLadder(vector);
  if (vector.claim.ladderLevel <= 2 && !vector.diagnostics.warnings.includes('claim-ceiling-lowered')) vector.diagnostics.warnings.push('claim-ceiling-lowered');
  return vector;
}
