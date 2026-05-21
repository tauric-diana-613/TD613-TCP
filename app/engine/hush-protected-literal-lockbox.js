export const HUSH_PROTECTED_LITERAL_LOCKBOX_VERSION = 'phase-12';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

const PATTERNS = Object.freeze([
  ['exhibit', /\b(?:EXHIBIT|DOC|CASE|ID|REF|INV|PO|HR|PAY|FILE|TICKET|REQ|FORM|W2|W-?2|W-?4|I-?9|SSN|EIN|TIN|ACCT|ACCOUNT|VENDOR|INVOICE|PAYROLL|BENEFIT|TD613|SHI|SAC)[A-Z0-9:_#\[\]\/-]*\b/g],
  ['date', /\b(?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{4}-\d{2}-\d{2})\b/g],
  ['timestamp', /\b\d{1,2}:\d{2}(?:\s?[AP]M)?\b/gi],
  ['file-name', /\b[\w.-]+\.(?:pdf|docx?|xlsx?|csv|txt|json|html?|png|jpe?g|zip)\b/gi],
  ['quoted-string', /["“][^"”]{3,120}["”]/g],
  ['glyph-boundary', /(?:𝌋|⟐|Khona\u200Clit-po|Khona‌lit-po|\u200c)/g]
]);

function hashText(text = '') {
  let hash = 2166136261;
  for (const char of safeText(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `h${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function makeLiteral(value = '', type = 'manual', source = 'auto') {
  const literal = safeText(value).trim();
  return { id: `lit-${hashText(`${type}:${literal}`).slice(1, 9)}`, type, literal, literalHash: hashText(literal), locked: true, source, length: literal.length };
}

export function detectProtectedLiterals(text = '', options = {}) {
  const found = [];
  const sourceText = safeText(text);
  for (const [type, pattern] of PATTERNS) {
    for (const match of sourceText.matchAll(pattern)) {
      const literal = safeText(match[0]).trim();
      if (literal) found.push(makeLiteral(literal, type, 'auto'));
    }
  }
  for (const literal of asArray(options.manualLiterals)) if (literal) found.push(makeLiteral(literal, 'manual', 'operator'));
  const seen = new Set();
  return found.filter((entry) => {
    const key = `${entry.type}:${entry.literal}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, Number(options.maxLiterals || 64));
}

export function buildProtectedLiteralLockbox(input = {}) {
  const sources = [input.sourceText, input.baselineText].map(safeText).filter(Boolean);
  if (input.includeMaskReferenceLiterals === true) sources.push(safeText(input.maskReferenceText));
  const sourceText = sources.join('\n');
  const literals = detectProtectedLiterals(sourceText, { manualLiterals: input.manualLiterals, maxLiterals: input.maxLiterals });
  const byType = literals.reduce((acc, item) => { acc[item.type] = (acc[item.type] || 0) + 1; return acc; }, {});
  return {
    version: HUSH_PROTECTED_LITERAL_LOCKBOX_VERSION,
    status: literals.length ? 'locked' : 'empty',
    literals,
    byType,
    lockedCount: literals.length,
    warnings: [...(literals.length ? [] : ['no-protected-literals-detected']), ...(literals.length > 40 ? ['large-lockbox-review-needed'] : []), ...(input.maskReferenceText && input.includeMaskReferenceLiterals !== true ? ['mask-reference-literals-not-locked'] : [])],
    limitations: ['The lockbox preserves detected literal strings; it cannot decide which facts are sufficient.', 'Mask reference examples are not locked by default because mask text is style evidence, not required output content.']
  };
}

export function verifyProtectedLiteralLockbox(lockbox = {}, outputText = '') {
  const text = safeText(outputText);
  const literals = asArray(lockbox.literals);
  const checks = literals.map((item) => ({ id: item.id, type: item.type, literalHash: item.literalHash, literal: item.literal, preserved: text.includes(item.literal) }));
  const missing = checks.filter((item) => !item.preserved);
  const preservedCount = checks.length - missing.length;
  const preservationScore = checks.length ? preservedCount / checks.length : 1;
  return {
    version: HUSH_PROTECTED_LITERAL_LOCKBOX_VERSION,
    status: missing.length ? 'missing-protected-literals' : checks.length ? 'preserved' : 'none-required',
    preservationScore: round(clamp(preservationScore)),
    totalCount: checks.length,
    preservedCount,
    missingCount: missing.length,
    checks,
    missing,
    warnings: missing.length ? ['protected-literal-drop'] : []
  };
}

export function summarizeProtectedLiteralLockbox(lockbox = {}, verification = null) {
  return {
    version: lockbox.version || HUSH_PROTECTED_LITERAL_LOCKBOX_VERSION,
    status: verification?.status || lockbox.status || 'empty',
    lockedCount: lockbox.lockedCount ?? asArray(lockbox.literals).length,
    byType: lockbox.byType || {},
    preservationScore: verification?.preservationScore ?? null,
    missingCount: verification?.missingCount ?? 0,
    warnings: [...asArray(lockbox.warnings), ...asArray(verification?.warnings)]
  };
}

export function exportProtectedLiteralLockbox(lockbox = {}, options = {}) {
  const payload = {
    version: lockbox.version || HUSH_PROTECTED_LITERAL_LOCKBOX_VERSION,
    status: lockbox.status || 'empty',
    lockedCount: lockbox.lockedCount ?? asArray(lockbox.literals).length,
    byType: lockbox.byType || {},
    literals: asArray(lockbox.literals).map((item) => ({ id: item.id, type: item.type, literalHash: item.literalHash, literal: options.includePrivateText ? item.literal : null, locked: item.locked, source: item.source })),
    warnings: asArray(lockbox.warnings),
    reproducibility: { privateTextIncluded: Boolean(options.includePrivateText) }
  };
  return JSON.stringify(payload, null, options.pretty === false ? 0 : 2);
}
