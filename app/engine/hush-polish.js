export const HUSH_POLISH_VERSION = 'phase-23';

const textOf = (value) => String(value ?? '');
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(list(value))];

function keepLiterals(next, original, literals) {
  return list(literals).every((literal) => !literal || !original.includes(literal) || next.includes(literal));
}

export function polishHushOutput(input = {}) {
  const original = textOf(input.text).split(/\s+/).join(' ').trim();
  const literals = list(input.protectedLiterals);
  const operations = [];
  const warnings = [];
  if (!original) return { version: HUSH_POLISH_VERSION, text: '', changed: false, operations, warnings: ['empty-output'] };

  let next = original;
  const openings = [
    ['might Keeping this organized:', 'Keeping this organized:', 'trim-modal-before-organizer'],
    ['maybe Keeping this organized:', 'Keeping this organized:', 'trim-modal-before-organizer'],
    ['might For the record:', 'For the record:', 'trim-modal-before-record-frame'],
    ['maybe For the record:', 'For the record:', 'trim-modal-before-record-frame'],
    ['might Record note:', 'Record note:', 'trim-modal-before-record-note'],
    ['maybe Record note:', 'Record note:', 'trim-modal-before-record-note']
  ];
  for (const [from, to, op] of openings) {
    if (next.startsWith(from)) {
      next = to + next.slice(from.length);
      operations.push(op);
    }
  }
  if (next.startsWith('and ')) {
    next = next.slice(4);
    operations.push('trim-leading-conjunction');
  }
  if (next.startsWith('but ')) {
    next = next.slice(4);
    operations.push('trim-leading-conjunction');
  }
  while (next.includes('. and ')) {
    next = next.replace('. and ', ', and ');
    operations.push('repair-period-and-joint');
  }
  while (next.includes('. but ')) {
    next = next.replace('. but ', ', but ');
    operations.push('repair-period-but-joint');
  }
  next = next.trim();
  if (next && !'.!?'.includes(next[next.length - 1])) {
    next += '.';
    operations.push('add-terminal-punctuation');
  }

  if (!keepLiterals(next, original, literals)) {
    warnings.push('polish-reverted-for-literal-safety');
    return { version: HUSH_POLISH_VERSION, text: original, changed: false, operations: uniq([...operations, 'literal-safety-revert']), warnings, missingLiterals: literals.filter((literal) => literal && !next.includes(literal)) };
  }

  return { version: HUSH_POLISH_VERSION, text: next, changed: next !== original, operations: uniq(operations), warnings: uniq(warnings), missingLiterals: [] };
}

export function summarizeOutputPolish(polish = {}) {
  return { version: polish.version || HUSH_POLISH_VERSION, changed: Boolean(polish.changed), operations: list(polish.operations), warnings: list(polish.warnings), missingLiteralCount: list(polish.missingLiterals).length };
}
