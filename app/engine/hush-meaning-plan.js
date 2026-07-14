export const HUSH_MEANING_PLAN_VERSION = 'phase-21';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values).filter(Boolean))];

function hashText(text = '') {
  let hash = 2166136261;
  for (const ch of safeText(text)) {
    hash ^= ch.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return `hmp-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function collectMatches(value = '', patterns = []) {
  return patterns.flatMap((pattern) => value.match(pattern) || []);
}

const BARE_OPERATIONAL_LABELS = new Set([
  'EXHIBIT', 'DOC', 'CASE', 'ID', 'REF', 'INV', 'PO', 'HR', 'PAY', 'FILE',
  'TICKET', 'REQ', 'FORM', 'SSN', 'EIN', 'TIN', 'ACCT', 'ACCOUNT', 'VENDOR',
  'INVOICE', 'PAYROLL', 'BENEFIT'
]);

export function extractOperationalIdentifiers(text = '') {
  const value = safeText(text);
  const patterns = [
    /\b(?:EXHIBIT|DOC|CASE|ID|REF|INV|PO|HR|PAY|FILE|TICKET|REQ|FORM|W2|W-?2|W-?4|I-?9|SSN|EIN|TIN|ACCT|ACCOUNT|VENDOR|INVOICE|PAYROLL|BENEFIT)[A-Z0-9:_#\[\]\/-]*\b/g,
    /\b1099(?:-[A-Z]{2,4})?\b/g,
    /\b[A-Z]{2,12}-\d{1,8}[A-Z]?\b/g,
    /\bSAC\[[^\]\s]{3,80}\]/g,
    /\bSHI#?:[A-Z0-9:_#\/-]+\b/g,
    /\bTD613(?:-[A-Z0-9:_#\/-]+)?\b/g
  ];
  return unique(collectMatches(value, patterns))
    .filter((match) => !BARE_OPERATIONAL_LABELS.has(match.toUpperCase()))
    .slice(0, 96);
}

export function extractTimeAnchors(text = '') {
  const value = safeText(text);
  const patterns = [
    /\b\d{1,2}:\d{2}(?:\s?[AP]M)?\b/gi,
    /\b(?:[01]?\d|2[0-3])[:.]\d{2}\b/g,
    /\b(?:before|after|around|by)\s+(?:noon|midnight|lunch|morning|afternoon|evening|\d{1,2}(?::\d{2})?(?:\s?[AP]M)?)\b/gi,
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g
  ];
  return unique(collectMatches(value, patterns)).slice(0, 96);
}

function isFragmentOfProtectedLiteral(numberLike = '', protectedValues = []) {
  const numberText = safeText(numberLike);
  if (!numberText) return true;
  return protectedValues.some((literal) => {
    const value = safeText(literal);
    if (value === numberText) return false;
    return value.includes(numberText) && /[-/:.]/.test(value);
  });
}

export function extractPayloadProtectedLiterals(text = '') {
  const value = safeText(text);
  const quotePatterns = [/['\"“][^'\"”]{2,120}['\"”]/g];
  const paired = value.match(/\b(?:EXHIBIT|DOC|CASE|ID|REF|INV|PO|HR|PAY|FILE|TICKET|REQ|FORM)[A-Z0-9:_#\/-]*\s*\+\s*\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g) || [];
  const operational = extractOperationalIdentifiers(value);
  const timeAnchors = extractTimeAnchors(value);
  const quotes = collectMatches(value, quotePatterns);
  const pairParts = paired.flatMap((pair) => pair.split(/\s*\+\s*/));
  const anchors = unique([...operational, ...timeAnchors, ...quotes, ...pairParts]);
  const rawNumbers = collectMatches(value, [/\b\d{2,}(?:[\-/:.]\d+)*\b/g])
    .filter((item) => !isFragmentOfProtectedLiteral(item, anchors));
  return unique([...anchors, ...rawNumbers]).slice(0, 128);
}

export function extractMeaningProtectedLiterals(text = '') {
  return extractPayloadProtectedLiterals(text);
}

function splitSentences(text = '') {
  const value = safeText(text).replace(/\s+/g, ' ').trim();
  if (!value) return [];
  const matches = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [value];
  return matches.map((item) => item.trim()).filter(Boolean);
}

function detectKind(text = '') {
  const lower = safeText(text).toLowerCase();
  if (/\b(please|pls|can you|could you|request|asking|keep|preserve|do not separate|do not resend|hold)\b/.test(lower)) return 'request';
  if (/\b(exhibit|attached|file|document|record|saved|date|label|invoice|vendor|spreadsheet|version|logged)\b/.test(lower)) return 'evidence';
  if (/\b(however|but|although|unless|except|while|cannot confirm|may|might|appears|seems)\b/.test(lower)) return 'caveat';
  if (/\b(because|bc|so that|therefore|then|after|before|when|until|the whole point)\b/.test(lower)) return 'context';
  if (/[\"“'][^\"”']+[\"”']/.test(text)) return 'quote';
  return 'claim';
}

export function protectMeaningUnits(input = {}) {
  const sourceText = safeText(input.sourceText ?? input.text);
  const manual = asArray(input.protectedLiterals);
  const protectedLiterals = unique([...manual, ...extractPayloadProtectedLiterals(sourceText)]);
  const sentences = splitSentences(sourceText);
  return sentences.map((sentence, index) => {
    const protectedFragments = protectedLiterals.filter((literal) => sentence.includes(literal));
    const hasNegation = /\b(no|not|never|none|without|cannot|can't|do not|don't|did not|didn't|isn't|wasn't|won't)\b/i.test(sentence);
    const hasNumber = /\d/.test(sentence);
    const hasQuote = /[\"“'][^\"”']+[\"”']/.test(sentence);
    const hasPayload = /\b[A-Z][a-z]{2,}\b|\b(vendor|finance|spreadsheet|version|staffing note|file|called|logged|saved|told|kept|resend)\b/i.test(sentence);
    const rewriteFreedom = protectedFragments.length || hasNegation || hasNumber || hasQuote || hasPayload ? 'low' : sentence.length > 120 ? 'medium' : 'high';
    return { id: `unit-${index + 1}`, text: sentence, kind: detectKind(sentence), protectedFragments, hasNegation, hasNumber, hasQuote, hasPayload, rewriteFreedom };
  });
}

export function buildMeaningPlan(input = {}) {
  const sourceText = safeText(input.sourceText ?? input.text);
  const protectedLiterals = unique([...asArray(input.protectedLiterals), ...extractPayloadProtectedLiterals(sourceText)]);
  const units = protectMeaningUnits({ sourceText, protectedLiterals });
  const warnings = [];
  if (!sourceText.trim()) warnings.push('empty-source-text');
  if (sourceText.trim() && sourceText.trim().split(/\s+/).length < 5) warnings.push('short-source-text');
  if (units.some((unit) => unit.hasNegation)) warnings.push('negation-present-review-before-rewrite');
  if (protectedLiterals.length) warnings.push('protected-literals-present');
  if (units.some((unit) => unit.hasPayload)) warnings.push('payload-present-review-before-rewrite');
  return { version: HUSH_MEANING_PLAN_VERSION, sourceHash: hashText(sourceText), units, protectedLiterals, warnings: unique(warnings), limitations: ['Meaning plans are local rewrite scaffolds; human review remains required.'] };
}

export function summarizeMeaningPlan(plan = {}) {
  const units = asArray(plan.units);
  return { version: plan.version || HUSH_MEANING_PLAN_VERSION, unitCount: units.length, protectedLiteralCount: asArray(plan.protectedLiterals).length, lowFreedomCount: units.filter((unit) => unit.rewriteFreedom === 'low').length, kinds: unique(units.map((unit) => unit.kind).filter(Boolean)), warnings: asArray(plan.warnings) };
}
