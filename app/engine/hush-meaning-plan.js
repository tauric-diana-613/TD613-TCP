export const HUSH_MEANING_PLAN_VERSION = 'phase-16';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

function hashText(text = '') {
  let hash = 2166136261;
  for (const ch of safeText(text)) {
    hash ^= ch.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return `hmp-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function extractMeaningProtectedLiterals(text = '') {
  const value = safeText(text);
  const patterns = [
    /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\/-]*\b/g,
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{2,}(?:[\-/:.]\d+)*\b/g,
    /["“][^"”]{2,120}["”]/g,
    /'[^']{2,120}'/g
  ];
  return [...new Set(patterns.flatMap((pattern) => value.match(pattern) || []))].slice(0, 64);
}

function splitSentences(text = '') {
  const value = safeText(text).replace(/\s+/g, ' ').trim();
  if (!value) return [];
  const matches = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [value];
  return matches.map((item) => item.trim()).filter(Boolean);
}

function detectKind(text = '') {
  const lower = safeText(text).toLowerCase();
  if (/\b(please|can you|could you|request|asking)\b/.test(lower)) return 'request';
  if (/\b(exhibit|attached|file|document|record|saved|date|label)\b/.test(lower)) return 'evidence';
  if (/\b(however|but|although|unless|except|while)\b/.test(lower)) return 'caveat';
  if (/\b(because|so that|therefore|then|after|before|when)\b/.test(lower)) return 'context';
  if (/["“'][^"”']+["”']/.test(text)) return 'quote';
  return 'claim';
}

export function protectMeaningUnits(input = {}) {
  const sourceText = safeText(input.sourceText ?? input.text);
  const manual = asArray(input.protectedLiterals);
  const protectedLiterals = [...new Set([...manual, ...extractMeaningProtectedLiterals(sourceText)])];
  const sentences = splitSentences(sourceText);
  return sentences.map((sentence, index) => {
    const protectedFragments = protectedLiterals.filter((literal) => sentence.includes(literal));
    const hasNegation = /\b(no|not|never|none|without|cannot|can't|do not|don't|did not|didn't|isn't|wasn't|won't)\b/i.test(sentence);
    const hasNumber = /\d/.test(sentence);
    const hasQuote = /["“'][^"”']+["”']/.test(sentence);
    const rewriteFreedom = protectedFragments.length || hasNegation || hasNumber || hasQuote ? 'low' : sentence.length > 120 ? 'medium' : 'high';
    return {
      id: `unit-${index + 1}`,
      text: sentence,
      kind: detectKind(sentence),
      protectedFragments,
      hasNegation,
      hasNumber,
      hasQuote,
      rewriteFreedom
    };
  });
}

export function buildMeaningPlan(input = {}) {
  const sourceText = safeText(input.sourceText ?? input.text);
  const protectedLiterals = [...new Set([...asArray(input.protectedLiterals), ...extractMeaningProtectedLiterals(sourceText)])];
  const units = protectMeaningUnits({ sourceText, protectedLiterals });
  const warnings = [];
  if (!sourceText.trim()) warnings.push('empty-source-text');
  if (sourceText.trim() && sourceText.trim().split(/\s+/).length < 5) warnings.push('short-source-text');
  if (units.some((unit) => unit.hasNegation)) warnings.push('negation-present-review-before-rewrite');
  if (protectedLiterals.length) warnings.push('protected-literals-present');
  return {
    version: HUSH_MEANING_PLAN_VERSION,
    sourceHash: hashText(sourceText),
    units,
    protectedLiterals,
    warnings: [...new Set(warnings)],
    limitations: ['Meaning plans are local rewrite scaffolds; human review remains required.']
  };
}

export function summarizeMeaningPlan(plan = {}) {
  const units = asArray(plan.units);
  return {
    version: plan.version || HUSH_MEANING_PLAN_VERSION,
    unitCount: units.length,
    protectedLiteralCount: asArray(plan.protectedLiterals).length,
    lowFreedomCount: units.filter((unit) => unit.rewriteFreedom === 'low').length,
    kinds: [...new Set(units.map((unit) => unit.kind).filter(Boolean))],
    warnings: asArray(plan.warnings)
  };
}
