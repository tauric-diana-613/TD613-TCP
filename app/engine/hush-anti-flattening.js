export const HUSH_ANTI_FLATTENING_VERSION = 'phase-24';

const textOf = (value) => String(value ?? '').toLowerCase();
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(list(value))];

const CUE_GROUPS = [
  { key: 'copy-footer', cues: ['copy', 'footer'] },
  { key: 'same-minute', cues: ['same minute', 'export'] },
  { key: 'before-later', cues: ['before', 'later'] },
  { key: 'changed-note', cues: ['changed', 'note'] },
  { key: 'version-hold', cues: ['version', 'resend'] },
  { key: 'actor-finance', cues: ['jordan', 'finance'] },
  { key: 'open-closed', cues: ['open', 'closed'] }
];

const GENERIC_ONLY = ['record anchor', 'note anchor', 'point is preservation', 'not expansion', 'keep this narrow'];

function sourceGroups(sourceText = '') {
  const source = textOf(sourceText);
  return CUE_GROUPS.filter((group) => group.cues.every((cue) => source.includes(cue))).map((group) => group.key);
}

function groupPresent(outputText = '', key = '') {
  const output = textOf(outputText);
  const group = CUE_GROUPS.find((item) => item.key === key);
  if (!group) return true;
  return group.cues.some((cue) => output.includes(cue));
}

function genericAnchorOnly(outputText = '', requiredGroups = []) {
  const output = textOf(outputText);
  if (!requiredGroups.length) return false;
  const hasGeneric = GENERIC_ONLY.some((cue) => output.includes(cue));
  const hasConcrete = requiredGroups.some((key) => groupPresent(outputText, key));
  return hasGeneric && !hasConcrete;
}

export function detectHushFlattening(input = {}) {
  const requiredGroups = sourceGroups(input.sourceText || '');
  const missingGroups = requiredGroups.filter((key) => !groupPresent(input.outputText || '', key));
  const genericOnly = genericAnchorOnly(input.outputText || '', requiredGroups);
  const hardFailures = [];
  const reviewWarnings = [];
  if (genericOnly) hardFailures.push('generic-anchor-only-output');
  if (missingGroups.length && requiredGroups.length >= 1) reviewWarnings.push('concrete-cues-dropped');
  if (missingGroups.length >= 2) hardFailures.push('concrete-event-flattened');
  const retained = requiredGroups.length ? (requiredGroups.length - missingGroups.length) / requiredGroups.length : 1;
  return { version: HUSH_ANTI_FLATTENING_VERSION, passed: hardFailures.length === 0, flatteningScore: Number(retained.toFixed(4)), hardFailures: uniq(hardFailures), reviewWarnings: uniq(reviewWarnings), requiredGroups, missingGroups, genericAnchorOnly: genericOnly };
}

export function summarizeFlattening(result = {}) {
  return { version: result.version || HUSH_ANTI_FLATTENING_VERSION, passed: result.passed !== false, flatteningScore: result.flatteningScore ?? null, hardFailures: list(result.hardFailures), reviewWarnings: list(result.reviewWarnings), requiredGroups: list(result.requiredGroups), missingGroups: list(result.missingGroups), genericAnchorOnly: Boolean(result.genericAnchorOnly) };
}
