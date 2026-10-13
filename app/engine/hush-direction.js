export const HUSH_DIRECTION_VERSION = 'phase-24';

const textOf = (value) => String(value ?? '');

const DIRECTIONS = new Set(['coherent-to-jagged', 'jagged-to-coherent', 'mask-to-mask']);

function inferDirection(input = {}) {
  if (DIRECTIONS.has(input.direction)) return input.direction;
  const source = textOf(input.sourceText).toLowerCase();
  const maskId = textOf(input.mask?.id || input.maskId).toLowerCase();
  const jaggedCues = [' / ', 'maybe normal', 'not polished', 'quick-before', 'tiny but', 'not a grand theory'];
  const sourceLooksJagged = jaggedCues.some((cue) => source.includes(cue));
  if (sourceLooksJagged && (maskId.includes('plain') || maskId.includes('clear'))) return 'jagged-to-coherent';
  if (!sourceLooksJagged && maskId.includes('jagged')) return 'coherent-to-jagged';
  return 'mask-to-mask';
}

export function resolveHushDirection(input = {}) {
  const direction = inferDirection(input);
  const weights = direction === 'jagged-to-coherent'
    ? { phase23: 0.35, caseStability: 0.2, antiFlattening: 0.2, coherence: 0.2, movement: 0.05 }
    : direction === 'coherent-to-jagged'
      ? { phase23: 0.45, caseStability: 0.2, antiFlattening: 0.2, coherence: 0.05, movement: 0.1 }
      : { phase23: 0.4, caseStability: 0.2, antiFlattening: 0.2, coherence: 0.1, movement: 0.1 };
  return {
    version: HUSH_DIRECTION_VERSION,
    direction,
    transformGoal: direction,
    weights,
    reviewRules: direction === 'jagged-to-coherent'
      ? ['normalize-rough-joins', 'preserve-sequence', 'preserve-caveats']
      : direction === 'coherent-to-jagged'
        ? ['preserve-record-cues', 'allow-jagged-style', 'preserve-literals']
        : ['preserve-payload', 'follow-mask', 'review-output']
  };
}

export function summarizeHushDirection(direction = {}) {
  return { version: direction.version || HUSH_DIRECTION_VERSION, direction: direction.direction || 'mask-to-mask', transformGoal: direction.transformGoal || direction.direction || 'mask-to-mask', weights: direction.weights || {}, reviewRules: direction.reviewRules || [] };
}
