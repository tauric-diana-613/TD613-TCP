export const HUSH_COHERENCE_VERSION = 'phase-23';

const textOf = (value) => String(value ?? '');
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const uniq = (value) => [...new Set(list(value))];
const round = (value) => Number.isFinite(value) ? Number(value.toFixed(4)) : 0;

function words(text = '') {
  return textOf(text).toLowerCase().split(/[^a-z0-9'-]+/).filter((word) => word.length > 2);
}

function scoreOverlap(source = '', output = '') {
  const src = [...new Set(words(source))];
  const out = new Set(words(output));
  if (!src.length) return 1;
  return round(src.filter((word) => out.has(word)).length / src.length);
}

function scoreCues(source = '', output = '', cues = []) {
  const src = textOf(source).toLowerCase();
  const out = textOf(output).toLowerCase();
  const needed = cues.filter((cue) => src.includes(cue));
  if (!needed.length) return 1;
  return round(needed.filter((cue) => out.includes(cue)).length / needed.length);
}

function startsRoughly(text = '') {
  const value = textOf(text).trim().toLowerCase();
  return value.startsWith('might keeping') || value.startsWith('maybe keeping') || value.startsWith('and ') || value.startsWith('but ');
}

function hasRoughJoin(text = '') {
  const value = textOf(text).toLowerCase();
  return value.includes('. and ') || value.includes('. but ') || value.endsWith(' not.') || value.endsWith(' on.') || value.endsWith(' with.');
}

function isThin(output = '', literals = []) {
  if (!list(literals).length) return false;
  const literalWords = new Set(list(literals).flatMap((literal) => words(literal)));
  const bodyWords = words(output).filter((word) => !literalWords.has(word));
  return bodyWords.length < 7;
}

export function buildHushCoherence(input = {}) {
  const sourceText = textOf(input.sourceText);
  const outputText = textOf(input.outputText);
  const protectedLiterals = list(input.protectedLiterals);
  const notes = [];
  const stops = [];

  const opening = startsRoughly(outputText) ? 0.25 : 1;
  const join = hasRoughJoin(outputText) ? 0.35 : 1;
  const body = isThin(outputText, protectedLiterals) ? 0.35 : 0.9;
  const semantic = scoreOverlap(sourceText, outputText);
  const sequence = scoreCues(sourceText, outputText, ['before', 'after', 'later', 'changed', 'open', 'closed', 'version', 'copy', 'footer', 'note']);
  const actor = scoreCues(sourceText, outputText, ['jordan', 'resend', 'finance', 'version', 'vendor', 'called', 'logged']);
  const scale = outputText.length > 0 && outputText.length < Math.max(360, sourceText.length * 3) ? 0.86 : 0.62;

  if (opening < 0.6) stops.push('rough-opening');
  if (join < 0.6) stops.push('rough-join');
  if (body < 0.5) notes.push('thin-body');
  if (sequence < 0.45) notes.push('sequence-cues-low');
  if (actor < 0.6) notes.push('actor-cues-low');

  const score = round((opening * 0.2) + (join * 0.16) + (body * 0.16) + (semantic * 0.18) + (sequence * 0.12) + (actor * 0.12) + (scale * 0.06));
  return { version: HUSH_COHERENCE_VERSION, passed: stops.length === 0, score, stops: uniq(stops), notes: uniq(notes), metrics: { opening, join, body, semantic, sequence, actor, scale } };
}

export function summarizeHushCoherence(coherence = {}) {
  return { version: coherence.version || HUSH_COHERENCE_VERSION, passed: coherence.passed !== false, score: coherence.score ?? null, stops: list(coherence.stops), notes: list(coherence.notes), metrics: coherence.metrics || {} };
}
