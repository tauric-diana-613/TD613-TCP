export const HUSH_SYNTAX_PLAN_VERSION = 'phase-19';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values))];

function sentences(text = '') {
  const value = safeText(text).replace(/\s+/g, ' ').trim();
  if (!value) return [];
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [value];
}

function words(text = '') {
  return safeText(text).match(/[A-Za-z0-9][A-Za-z0-9'\-]*/g) || [];
}

function punctuationSkeleton(text = '') {
  return (safeText(text).match(/[,.!?;:—-]/g) || []).join('');
}

function functionFrame(text = '') {
  const f = new Set(['i','you','we','they','he','she','it','the','a','an','and','but','or','because','with','without','to','from','in','on','for','of','that','this','is','was','were','be','been','do','did','not']);
  return words(text).map((word) => word.toLowerCase()).filter((word) => f.has(word)).slice(0, 28);
}

function clauseOrder(text = '') {
  return safeText(text).split(/[,;:]|\b(?:because|but|and|so|while|although|when|after|before)\b/i).map((part) => {
    const lower = part.toLowerCase();
    if (/\b(?:exhibit|doc|case|id|ref|file|record|note|packet|attachment)\b/.test(lower)) return 'evidence';
    if (/\b\d{1,4}[/-]\d{1,2}|\d{4}-\d{2}-\d{2}\b/.test(lower)) return 'date';
    if (/\b(?:not|cannot|can't|did not|do not|never|without)\b/.test(lower)) return 'negation';
    if (/\b(?:may|might|appears|seems|cannot confirm)\b/.test(lower)) return 'caveat';
    if (/\b(?:please|keep|preserve|make sure|i need)\b/.test(lower)) return 'request';
    if (/\b(?:because|so that|since)\b/.test(lower)) return 'reason';
    return 'claim';
  }).filter(Boolean).slice(0, 12);
}

export function detectSourceSyntaxSkeleton(input = {}) {
  const text = safeText(input.sourceText ?? input.text);
  const sentenceList = sentences(text);
  return {
    sentenceCount: sentenceList.length,
    clauseCount: Math.max(1, safeText(text).split(/[,;:]|\b(?:because|but|and|so|while|although|when|after|before)\b/i).filter(Boolean).length),
    openingShape: words(sentenceList[0] || '').slice(0, 4).join(' ').toLowerCase(),
    closingShape: words(sentenceList[sentenceList.length - 1] || '').slice(-5).join(' ').toLowerCase(),
    punctuationSkeleton: punctuationSkeleton(text),
    avgSentenceLength: sentenceList.length ? words(text).length / sentenceList.length : 0,
    functionWordFrame: functionFrame(text),
    clauseOrder: clauseOrder(text),
    literalPositions: asArray(input.protectedLiterals).map((literal) => ({ literal, index: text.indexOf(literal) })).filter((item) => item.index >= 0)
  };
}

export function proposeSyntaxOperations(input = {}) {
  const skeleton = input.sourceSkeleton || detectSourceSyntaxSkeleton(input);
  const roleMap = input.claimRoleMap || {};
  const traits = input.realizationPlan?.traits || input.mask?.writingTraits || {};
  const operations = [];
  const hasEvidence = asArray(roleMap.units).some((unit) => unit.subroles?.includes('evidence-anchor'));
  const hasCaveat = asArray(roleMap.units).some((unit) => unit.subroles?.includes('caveat') || unit.subroles?.includes('uncertainty'));
  const hasRequest = asArray(roleMap.units).some((unit) => unit.subroles?.includes('request'));
  if (hasEvidence) operations.push({ code: 'front-load-evidence', priority: 90, appliesTo: ['evidence'], reason: 'Move evidence anchor earlier to break the source opening while preserving custody.' });
  if (hasCaveat) operations.push({ code: 'move-caveat-earlier', priority: 84, appliesTo: ['caveat'], reason: 'Move uncertainty forward so it survives recomposition.' });
  if (hasRequest) operations.push({ code: 'convert-request-to-note', priority: 74, appliesTo: ['request'], reason: 'Change request posture without changing intent.' });
  if (skeleton.avgSentenceLength > 18 || skeleton.clauseCount > 2) operations.push({ code: 'split-long-clause-chain', priority: 80, appliesTo: ['claim'], reason: 'Break long source sentence chains.' });
  if (skeleton.sentenceCount > 2 && traits.sentenceLength !== 'short') operations.push({ code: 'merge-short-pileup', priority: 65, appliesTo: ['claim'], reason: 'Change sentence count and paragraph shape.' });
  operations.push({ code: 'replace-opening-frame', priority: 70, appliesTo: ['opening'], reason: 'Prevent source opening retention.' });
  operations.push({ code: 'replace-closing-frame', priority: 62, appliesTo: ['closing'], reason: 'Prevent source closing retention.' });
  operations.push({ code: 'change-punctuation-skeleton', priority: 58, appliesTo: ['punctuation'], reason: 'Shift punctuation skeleton.' });
  return operations.sort((a, b) => b.priority - a.priority).slice(0, 8);
}

export function buildSyntaxPlan(input = {}) {
  const sourceSkeleton = detectSourceSyntaxSkeleton(input);
  const operations = proposeSyntaxOperations({ ...input, sourceSkeleton });
  const traits = input.realizationPlan?.traits || input.mask?.writingTraits || {};
  return {
    version: HUSH_SYNTAX_PLAN_VERSION,
    sourceSkeleton,
    targetSyntax: {
      sentenceCount: traits.sentenceLength === 'short' ? Math.max(2, sourceSkeleton.sentenceCount + 1) : Math.max(1, sourceSkeleton.sentenceCount === 1 ? 2 : sourceSkeleton.sentenceCount - 1),
      clauseOrder: sourceSkeleton.clauseOrder.slice().reverse(),
      openingStrategy: operations.some((op) => op.code === 'front-load-evidence') ? 'evidence-first' : 'frame-replacement',
      closingStrategy: 'non-source-closing',
      punctuationStrategy: traits.punctuationStyle || 'minimal',
      paragraphShape: traits.paragraphShape || 'compact-paragraphs',
      literalPlacementStrategy: 'in-unit'
    },
    operations,
    forbiddenOperations: ['separate-negation-from-action', 'separate-date-from-event', 'separate-doc-id-from-noun', 'turn-uncertainty-into-certainty', 'drop-protected-literal', 'tail-stuff-literal', 'preserve-source-opening', 'preserve-source-closing'],
    warnings: operations.length < 3 ? ['syntax-operation-pool-thin'] : []
  };
}

export function summarizeSyntaxPlan(plan = {}) {
  return {
    version: plan.version || HUSH_SYNTAX_PLAN_VERSION,
    operationCount: asArray(plan.operations).length,
    forbiddenCount: asArray(plan.forbiddenOperations).length,
    openingStrategy: plan.targetSyntax?.openingStrategy || '',
    sourceSentenceCount: plan.sourceSkeleton?.sentenceCount ?? 0,
    targetSentenceCount: plan.targetSyntax?.sentenceCount ?? 0,
    warnings: asArray(plan.warnings)
  };
}
