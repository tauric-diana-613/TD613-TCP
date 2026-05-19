export const HUSH_SOURCE_RESIDUE_VERSION = 'phase-18';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

const FUNCTION_WORDS = new Set('a an and are as at be because but by for from had has have he her his i if in is it its me my not of on or our she so that the their them then there they this to was we were when while with without you your'.split(' '));

function normalizeToken(token = '') {
  return safeText(token).toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
}

function tokenize(text = '') {
  return (safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'/-]*/g) || []).map(normalizeToken).filter(Boolean);
}

function protectedTokenSet(protectedLiterals = []) {
  return new Set(asArray(protectedLiterals).flatMap((literal) => tokenize(literal)));
}

function stripProtectedTokens(tokens = [], protectedTokens = new Set()) {
  return tokens.filter((token) => !protectedTokens.has(token));
}

function ngrams(tokens = [], size = 2) {
  const out = [];
  for (let i = 0; i <= tokens.length - size; i += 1) out.push(tokens.slice(i, i + size).join(' '));
  return out;
}

function jaccard(left = [], right = []) {
  const a = new Set(left);
  const b = new Set(right);
  if (!a.size && !b.size) return 1;
  const intersection = [...a].filter((item) => b.has(item)).length;
  const union = new Set([...a, ...b]).size || 1;
  return intersection / union;
}

function longestContiguousCopiedRun(sourceTokens = [], outputTokens = []) {
  let best = 0;
  const prev = Array(outputTokens.length + 1).fill(0);
  const curr = Array(outputTokens.length + 1).fill(0);
  for (let i = 1; i <= sourceTokens.length; i += 1) {
    for (let j = 1; j <= outputTokens.length; j += 1) {
      curr[j] = sourceTokens[i - 1] === outputTokens[j - 1] ? prev[j - 1] + 1 : 0;
      if (curr[j] > best) best = curr[j];
    }
    for (let j = 0; j <= outputTokens.length; j += 1) prev[j] = curr[j];
  }
  return best;
}

function lcsLength(left = [], right = []) {
  const prev = Array(right.length + 1).fill(0);
  const curr = Array(right.length + 1).fill(0);
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) curr[j] = left[i - 1] === right[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
    for (let j = 0; j <= right.length; j += 1) prev[j] = curr[j];
  }
  return prev[right.length] || 0;
}

function sentenceSkeleton(text = '') {
  return safeText(text).split(/([.!?;:,—-]+)/).map((part) => {
    if (/^[.!?;:,—-]+$/.test(part)) return part;
    const count = tokenize(part).length;
    if (!count) return '';
    return count <= 4 ? 'S' : count <= 12 ? 'M' : 'L';
  }).join('').replace(/\s+/g, '');
}

function skeletonSimilarity(sourceText = '', outputText = '') {
  const left = sentenceSkeleton(sourceText).split('');
  const right = sentenceSkeleton(outputText).split('');
  if (!left.length && !right.length) return 1;
  return lcsLength(left, right) / Math.max(left.length, right.length, 1);
}

function phraseRetention(sourceTokens = [], outputTokens = [], side = 'opening', size = 4) {
  const sourcePhrase = side === 'opening' ? sourceTokens.slice(0, size) : sourceTokens.slice(Math.max(0, sourceTokens.length - size));
  if (!sourcePhrase.length) return 0;
  return outputTokens.join(' ').includes(sourcePhrase.join(' ')) ? 1 : 0;
}

export function buildSourceResidue(input = {}) {
  const sourceText = safeText(input.sourceText);
  const outputText = safeText(input.outputText ?? input.text);
  const protectedTokens = protectedTokenSet(input.protectedLiterals || []);
  const sourceTokens = stripProtectedTokens(tokenize(sourceText), protectedTokens);
  const outputTokens = stripProtectedTokens(tokenize(outputText), protectedTokens);
  const sourceSet = new Set(sourceTokens);
  const retainedOutputTokens = outputTokens.filter((token) => sourceSet.has(token));
  const nonLiteralTokenRetention = outputTokens.length ? retainedOutputTokens.length / outputTokens.length : 0;
  const sourceCoverage = sourceTokens.length ? sourceTokens.filter((token) => outputTokens.includes(token)).length / sourceTokens.length : 0;
  const longestCopiedRun = longestContiguousCopiedRun(sourceTokens, outputTokens);
  const sourceOrderRetention = sourceTokens.length && outputTokens.length ? lcsLength(sourceTokens, outputTokens) / Math.min(sourceTokens.length, outputTokens.length) : 0;
  const sentenceSkeletonSimilarity = skeletonSimilarity(sourceText, outputText);
  const sourceFunctionFrame = sourceTokens.filter((token) => FUNCTION_WORDS.has(token));
  const outputFunctionFrame = outputTokens.filter((token) => FUNCTION_WORDS.has(token));
  const functionWordFrameOverlap = jaccard(sourceFunctionFrame, outputFunctionFrame);
  const openingPhraseRetention = phraseRetention(sourceTokens, outputTokens, 'opening');
  const closingPhraseRetention = phraseRetention(sourceTokens, outputTokens, 'closing');
  const bigramOverlap = jaccard(ngrams(sourceTokens, 2), ngrams(outputTokens, 2));
  const cadenceBodyRisk = clamp((nonLiteralTokenRetention * 0.30) + (Math.min(longestCopiedRun / 12, 1) * 0.22) + (sourceOrderRetention * 0.16) + (sentenceSkeletonSimilarity * 0.14) + (functionWordFrameOverlap * 0.08) + (bigramOverlap * 0.10));
  const warnings = [];
  if (nonLiteralTokenRetention > 0.85 || longestCopiedRun > 8 || sentenceSkeletonSimilarity > 0.88) warnings.push('source-body-attached');
  if (nonLiteralTokenRetention > 0.95 || longestCopiedRun >= 12 || cadenceBodyRisk > 0.82) warnings.push('source-body-severe');
  if (openingPhraseRetention) warnings.push('source-opening-retained');
  if (closingPhraseRetention) warnings.push('source-closing-retained');
  return {
    version: HUSH_SOURCE_RESIDUE_VERSION,
    metrics: { nonLiteralTokenRetention: round(nonLiteralTokenRetention), sourceCoverage: round(sourceCoverage), longestCopiedRun, sourceOrderRetention: round(sourceOrderRetention), sentenceSkeletonSimilarity: round(sentenceSkeletonSimilarity), functionWordFrameOverlap: round(functionWordFrameOverlap), openingPhraseRetention, closingPhraseRetention, bigramOverlap: round(bigramOverlap), cadenceBodyRisk: round(cadenceBodyRisk) },
    status: cadenceBodyRisk > 0.82 ? 'severe' : cadenceBodyRisk > 0.62 ? 'attached' : cadenceBodyRisk > 0.42 ? 'review' : 'detached',
    warnings: [...new Set(warnings)],
    limitations: ['Source residue measures non-literal source-body retention for local review; it is not an external recognition prediction.']
  };
}

export function scoreSourceResidue(input = {}) {
  const residue = input.metrics ? input : buildSourceResidue(input);
  const risk = Number(residue.metrics?.cadenceBodyRisk ?? 0);
  return { version: HUSH_SOURCE_RESIDUE_VERSION, sourceResidueRisk: round(clamp(risk)), sourceResidueScore: round(clamp(1 - risk)), status: residue.status || 'review', warnings: asArray(residue.warnings) };
}

export function summarizeSourceResidue(input = {}) {
  const residue = input.metrics ? input : buildSourceResidue(input);
  return { version: residue.version || HUSH_SOURCE_RESIDUE_VERSION, status: residue.status || 'review', nonLiteralTokenRetention: residue.metrics?.nonLiteralTokenRetention ?? null, longestCopiedRun: residue.metrics?.longestCopiedRun ?? null, sentenceSkeletonSimilarity: residue.metrics?.sentenceSkeletonSimilarity ?? null, cadenceBodyRisk: residue.metrics?.cadenceBodyRisk ?? null, warnings: asArray(residue.warnings) };
}
