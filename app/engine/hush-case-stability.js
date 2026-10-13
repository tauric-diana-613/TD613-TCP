export const HUSH_CASE_STABILITY_VERSION = 'phase-24';

const textOf = (value) => String(value ?? '');
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(list(value))];

function escaped(value = '') {
  return textOf(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function literalPattern(literal = '') {
  return new RegExp(escaped(literal), 'gi');
}

export function repairProtectedLiteralCase(input = {}) {
  const original = textOf(input.outputText);
  const protectedLiterals = uniq(input.protectedLiterals || []);
  const operations = [];
  const warnings = [];
  const repaired = [];
  let text = original;

  for (const literal of protectedLiterals) {
    if (!literal || literal.length < 2) continue;
    const matches = text.match(literalPattern(literal)) || [];
    for (const match of matches) {
      if (match === literal) continue;
      text = text.replace(match, literal);
      operations.push('repair-literal-case');
      repaired.push({ from: match, to: literal });
    }
  }

  const missing = protectedLiterals.filter((literal) => literal && original.toLowerCase().includes(literal.toLowerCase()) && !text.includes(literal));
  if (missing.length) warnings.push('case-repair-missing-literal');

  return { version: HUSH_CASE_STABILITY_VERSION, text, changed: text !== original, operations: uniq(operations), warnings: uniq(warnings), repaired, missingLiterals: missing, failed: missing.length > 0 };
}

export function detectProtectedLiteralCaseDrift(input = {}) {
  const outputText = textOf(input.outputText);
  const protectedLiterals = uniq(input.protectedLiterals || []);
  const drift = [];
  for (const literal of protectedLiterals) {
    const matches = outputText.match(literalPattern(literal)) || [];
    for (const match of matches) if (match !== literal) drift.push({ expected: literal, found: match });
  }
  return { version: HUSH_CASE_STABILITY_VERSION, passed: drift.length === 0, drift };
}

export function summarizeCaseStability(result = {}) {
  return { version: result.version || HUSH_CASE_STABILITY_VERSION, changed: Boolean(result.changed), failed: Boolean(result.failed), repairedCount: list(result.repaired).length, missingLiteralCount: list(result.missingLiterals).length, warnings: list(result.warnings) };
}
