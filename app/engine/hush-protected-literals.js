const safe = (value = '') => String(value ?? '').trim();
const list = (value) => Array.isArray(value) ? value.map(safe).filter(Boolean) : [];

const PROTECTED_LITERAL_PATTERNS = Object.freeze([
  /\b(?:EXHIBIT|DOC|CASE|ID|REF|INV|PO|HR|PAY|FILE|TICKET|REQ|FORM|TD613|SHI|SAC|HUSH)(?:[-:#/._][A-Z0-9]+)+\b/gi,
  /\b\d{4}-\d{2}-\d{2}\b/g,
  /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,
  /\b\d{1,2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?\b/g,
  /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g,
  /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g
]);

export function buildProtectedLiteralList(sourceText = '') {
  const source = safe(sourceText);
  const literals = [];
  for (const pattern of PROTECTED_LITERAL_PATTERNS) {
    for (const match of source.matchAll(pattern)) literals.push(match[0]);
  }
  return [...new Set(literals)].slice(0, 48);
}

export function checkProtectedLiteralIntegrity(outputText = '', protectedLiterals = []) {
  const output = String(outputText ?? '');
  const required = [...new Set(list(protectedLiterals))];
  const missing = required.filter((literal) => !output.includes(literal));
  return {
    passed: missing.length === 0,
    required,
    missing,
    preservationScore: required.length ? (required.length - missing.length) / required.length : 1
  };
}

export { PROTECTED_LITERAL_PATTERNS };
