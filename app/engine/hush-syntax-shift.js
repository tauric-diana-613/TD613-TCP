export const HUSH_SYNTAX_SHIFT_VERSION = 'phase-19';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

function words(text = '') { return safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'\-]*/g) || []; }
function sentences(text = '') { const value = safeText(text).replace(/\s+/g, ' ').trim(); if (!value) return []; return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [value]; }
function punctuationSkeleton(text = '') { return (safeText(text).match(/[,.!?;:—-]/g) || []).join(''); }
function opening(text = '') { return words(sentences(text)[0] || '').slice(0, 4).join(' ').toLowerCase(); }
function closing(text = '') { const list = sentences(text); return words(list[list.length - 1] || '').slice(-5).join(' ').toLowerCase(); }
function clauseOrder(text = '') { return safeText(text).split(/[,;:]|\b(?:because|but|and|so|while|although|when|after|before)\b/i).map((part) => {
  const lower = part.toLowerCase();
  if (/\b(?:exhibit|doc|case|id|ref|file|record|note|packet|attachment)\b/.test(lower)) return 'evidence';
  if (/\b\d{1,4}[/-]\d{1,2}|\d{4}-\d{2}-\d{2}\b/.test(lower)) return 'date';
  if (/\b(?:not|cannot|can't|did not|do not|never|without)\b/.test(lower)) return 'negation';
  if (/\b(?:may|might|appears|seems|cannot confirm)\b/.test(lower)) return 'caveat';
  if (/\b(?:please|keep|preserve|make sure|i need)\b/.test(lower)) return 'request';
  return 'claim';
}).filter(Boolean).slice(0, 12); }
function functionFrame(text = '') { const f = new Set(['i','you','we','they','he','she','it','the','a','an','and','but','or','because','with','without','to','from','in','on','for','of','that','this','is','was','were','be','been','do','did','not']); return words(text).map((word) => word.toLowerCase()).filter((word) => f.has(word)).slice(0, 28); }
function jaccard(a = [], b = []) { const A = new Set(a); const B = new Set(b); const union = new Set([...A, ...B]); if (!union.size) return 1; return [...A].filter((item) => B.has(item)).length / union.size; }
function normalizedDelta(a = 0, b = 0, scale = 10) { return clamp(Math.abs(Number(a) - Number(b)) / scale); }
function normalizedText(text = '') { return safeText(text).toLowerCase().replace(/\s+/g, ' ').trim(); }
function detectWrapperOnly(sourceText = '', outputText = '') {
  const source = normalizedText(sourceText);
  const output = normalizedText(outputText);
  if (!source || !output) return false;
  const wrapperPrefix = /^(for reference|for clarity|note:|quick note:|just flagging|record note:|to keep this narrow)\b/i.test(safeText(outputText).trim());
  const sourceStart = source.slice(0, Math.min(72, source.length)).trim();
  const sourceBodyPresent = sourceStart.length >= 18 && output.includes(sourceStart);
  const sourceMostlyContained = source.length >= 28 && output.includes(source);
  return wrapperPrefix && (sourceBodyPresent || sourceMostlyContained);
}

export function buildSyntaxShift(input = {}) {
  const sourceText = safeText(input.sourceText);
  const outputText = safeText(input.outputText ?? input.text);
  const sourceSentences = sentences(sourceText);
  const outputSentences = sentences(outputText);
  const sourceWords = words(sourceText);
  const outputWords = words(outputText);
  const sourceClause = clauseOrder(sourceText);
  const outputClause = clauseOrder(outputText);
  const sourcePunct = punctuationSkeleton(sourceText).split('');
  const outputPunct = punctuationSkeleton(outputText).split('');
  const wrapperOnly = detectWrapperOnly(sourceText, outputText);
  const openingShapeShift = opening(sourceText) && opening(sourceText) === opening(outputText) ? 0 : 1;
  const closingShapeShift = closing(sourceText) && closing(sourceText) === closing(outputText) ? 0 : 1;
  const sentenceCountDelta = Math.abs(sourceSentences.length - outputSentences.length);
  const avgSource = sourceSentences.length ? sourceWords.length / sourceSentences.length : 0;
  const avgOutput = outputSentences.length ? outputWords.length / outputSentences.length : 0;
  const clauseOrderShift = 1 - jaccard(sourceClause.map((item, index) => `${index}:${item}`), outputClause.map((item, index) => `${index}:${item}`));
  const punctuationSkeletonShift = 1 - jaccard(sourcePunct.map((item, index) => `${index}:${item}`), outputPunct.map((item, index) => `${index}:${item}`));
  const functionFrameShift = 1 - jaccard(functionFrame(sourceText).map((item, index) => `${index}:${item}`), functionFrame(outputText).map((item, index) => `${index}:${item}`));
  const literalPlacementShift = normalizedDelta(input.sourceResidue?.metrics?.sourceOrderRetention ?? 1, 0, 1);
  const requestPostureShift = /\bplease\b/i.test(sourceText) !== /\bplease\b/i.test(outputText) ? 1 : 0;
  const metrics = {
    syntaxShiftScore: 0,
    sentenceCountDelta,
    avgSentenceLengthDelta: round(Math.abs(avgSource - avgOutput)),
    clauseOrderShift: round(clauseOrderShift),
    openingShapeShift,
    closingShapeShift,
    punctuationSkeletonShift: round(punctuationSkeletonShift),
    functionFrameShift: round(functionFrameShift),
    literalPlacementShift: round(literalPlacementShift),
    requestPostureShift
  };
  metrics.syntaxShiftScore = round(clamp(
    0.18 * metrics.clauseOrderShift +
    0.15 * metrics.openingShapeShift +
    0.12 * metrics.closingShapeShift +
    0.12 * metrics.punctuationSkeletonShift +
    0.15 * clamp(sentenceCountDelta / 2) +
    0.12 * metrics.functionFrameShift +
    0.10 * metrics.literalPlacementShift +
    0.06 * metrics.requestPostureShift
  ));
  if (wrapperOnly) metrics.syntaxShiftScore = Math.min(metrics.syntaxShiftScore, 0.34);
  const warnings = [];
  if (metrics.syntaxShiftScore < 0.35) warnings.push('syntax-shift-low');
  if (!metrics.openingShapeShift) warnings.push('source-opening-retained');
  if (!metrics.closingShapeShift) warnings.push('source-closing-retained');
  if (metrics.punctuationSkeletonShift < 0.2) warnings.push('punctuation-skeleton-retained');
  if (metrics.clauseOrderShift < 0.2) warnings.push('clause-order-retained');
  if (wrapperOnly) warnings.push('wrapper-only-transform');
  return { version: HUSH_SYNTAX_SHIFT_VERSION, metrics, warnings: [...new Set(warnings)], recommendations: warnings.includes('wrapper-only-transform') ? ['recompose-with-non-source-opening'] : [] };
}

export function scoreSyntaxShift(input = {}) {
  const shift = input.metrics ? input : buildSyntaxShift(input);
  return { version: HUSH_SYNTAX_SHIFT_VERSION, syntaxShiftScore: shift.metrics?.syntaxShiftScore ?? 0, syntaxShiftRisk: round(1 - (shift.metrics?.syntaxShiftScore ?? 0)), warnings: asArray(shift.warnings) };
}

export function summarizeSyntaxShift(input = {}) {
  const shift = input.metrics ? input : buildSyntaxShift(input);
  return { version: shift.version || HUSH_SYNTAX_SHIFT_VERSION, syntaxShiftScore: shift.metrics?.syntaxShiftScore ?? 0, status: (shift.metrics?.syntaxShiftScore ?? 0) >= 0.55 ? 'strong' : (shift.metrics?.syntaxShiftScore ?? 0) >= 0.35 ? 'usable' : 'low', warnings: asArray(shift.warnings) };
}
