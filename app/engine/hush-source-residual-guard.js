export const HUSH_SOURCE_RESIDUAL_GUARD_VERSION = 'hush-source-residual-guard/v1';

const STOP = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'into', 'when', 'then', 'there', 'their', 'about', 'again', 'because', 'should', 'would', 'could', 'still', 'have', 'has', 'had', 'were', 'was', 'are', 'is', 'for', 'you', 'your', 'not', 'but', 'all']);
const safe = (value = '') => String(value ?? '').replace(/\r\n?/g, '\n');
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;

function words(value = '') {
  return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
}
function contentWords(value = '') {
  return words(value).filter((word) => word.length > 3 && !STOP.has(word));
}
function grams(tokens = [], n = 2) {
  const out = [];
  for (let i = 0; i <= tokens.length - n; i += 1) out.push(tokens.slice(i, i + n).join(' '));
  return out;
}
function ratioOverlap(a = [], b = []) {
  if (!a.length || !b.length) return 0;
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item)).length / Math.max(1, a.length);
}
function sentenceHeads(value = '') {
  return (safe(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
    .map((sentence) => contentWords(sentence).slice(0, 3).join(' '))
    .filter(Boolean);
}
function firstPhrase(value = '') { return contentWords(value).slice(0, 5).join(' '); }
function lineShape(value = '') { return safe(value).split('\n').map((line) => line.trim()).filter(Boolean).map((line) => Math.min(12, words(line).length)).join('|'); }

export function evaluateSourceResidual(source = '', candidate = '') {
  const srcWords = contentWords(source);
  const candWords = contentWords(candidate);
  const lexicalCarryover = ratioOverlap(candWords, srcWords);
  const bigramCarryover = ratioOverlap(grams(candWords, 2), grams(srcWords, 2));
  const trigramCarryover = ratioOverlap(grams(candWords, 3), grams(srcWords, 3));
  const sourceHeads = sentenceHeads(source);
  const candidateHeads = sentenceHeads(candidate);
  const sentenceOrderEcho = ratioOverlap(candidateHeads, sourceHeads);
  const openingEcho = firstPhrase(source) && firstPhrase(source) === firstPhrase(candidate) ? 1 : ratioOverlap(contentWords(candidate).slice(0, 5), contentWords(source).slice(0, 5));
  const lineShapeEcho = lineShape(source) && lineShape(source) === lineShape(candidate) && words(candidate).length > 20 ? 1 : 0;
  const sourceResidualScore = round4(Math.min(1, (lexicalCarryover * 0.22) + (bigramCarryover * 0.25) + (trigramCarryover * 0.22) + (sentenceOrderEcho * 0.13) + (openingEcho * 0.1) + (lineShapeEcho * 0.08)));
  const warnings = [];
  if (sourceResidualScore >= 0.42) warnings.push('source-residual-high');
  if (bigramCarryover >= 0.34) warnings.push('source-bigram-carryover-high');
  if (trigramCarryover >= 0.22) warnings.push('source-trigram-carryover-high');
  if (openingEcho >= 0.8) warnings.push('source-opening-echo-high');
  if (lineShapeEcho > 0) warnings.push('source-line-shape-echo');
  return Object.freeze({
    schema: 'td613-hush-source-residual-guard/v1',
    version: HUSH_SOURCE_RESIDUAL_GUARD_VERSION,
    sourceResidualScore,
    sourceResidualPercent: Math.round(sourceResidualScore * 100),
    lexicalCarryover: round4(lexicalCarryover),
    bigramCarryover: round4(bigramCarryover),
    trigramCarryover: round4(trigramCarryover),
    sentenceOrderEcho: round4(sentenceOrderEcho),
    openingEcho: round4(openingEcho),
    lineShapeEcho,
    warnings,
    hardHigh: sourceResidualScore >= 0.58 || trigramCarryover >= 0.34 || (bigramCarryover >= 0.42 && openingEcho >= 0.6)
  });
}
