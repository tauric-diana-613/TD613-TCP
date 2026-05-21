export const HUSH_GARBLE_GATE_VERSION = 'phase-25';

const textOf = (value) => String(value ?? '');
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(list(value))];

const BAD_TAILS = ['not no.', 'not no', 'on after.', 'after on.', 'with.', 'on.', 'not.'];
const BAD_PHRASES = ['keep with ', 'record anchor. not', 'note anchor. not', 'anchor. not no', ' .', '..'];

function findFragments(text = '') {
  const value = textOf(text).trim().toLowerCase();
  const fragments = [];
  for (const tail of BAD_TAILS) if (value.endsWith(tail)) fragments.push(`tail:${tail}`);
  for (const phrase of BAD_PHRASES) if (value.includes(phrase)) fragments.push(`phrase:${phrase}`);
  if (/\b(at|on|with|after|before)\s+(at|on|with|after|before)\b/i.test(text)) fragments.push('preposition-chain');
  if (/\b(record|note) anchor\b/i.test(text) && /\bnot\s+no\b/i.test(text)) fragments.push('anchor-plus-negation');
  return uniq(fragments);
}

export function detectHushGarble(input = {}) {
  const outputText = textOf(input.outputText);
  const fragments = findFragments(outputText);
  const hardFailures = [];
  const reviewWarnings = [];
  if (fragments.some((item) => item.startsWith('tail:'))) hardFailures.push('fragment-tail');
  if (fragments.some((item) => item.includes('keep with'))) hardFailures.push('broken-keep-with-fragment');
  if (fragments.includes('preposition-chain')) hardFailures.push('broken-preposition-chain');
  if (fragments.includes('anchor-plus-negation')) hardFailures.push('literal-plus-nonsense');
  if (fragments.some((item) => item.includes('not no'))) hardFailures.push('dangling-negation');
  if (!outputText.trim()) hardFailures.push('empty-output');
  if (outputText.length > 0 && outputText.length < 18) reviewWarnings.push('very-short-output');
  const garbleScore = Math.max(0, Number((1 - (hardFailures.length * 0.35) - (reviewWarnings.length * 0.1)).toFixed(4)));
  return { version: HUSH_GARBLE_GATE_VERSION, passed: hardFailures.length === 0, garbleScore, hardFailures: uniq(hardFailures), reviewWarnings: uniq(reviewWarnings), fragments };
}

export function summarizeHushGarble(result = {}) {
  return { version: result.version || HUSH_GARBLE_GATE_VERSION, passed: result.passed !== false, garbleScore: result.garbleScore ?? null, hardFailures: list(result.hardFailures), reviewWarnings: list(result.reviewWarnings), fragments: list(result.fragments) };
}
