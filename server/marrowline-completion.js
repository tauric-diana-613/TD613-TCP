// Observable provider completion and provider-authored recovery boundaries.
// Character count, mark count and section count cannot establish literary merit.
// Provider transport completion is deliberately distinct from Marrowline's
// structural/artistic admission: local punctuation or heading heuristics may
// diagnose a response, but they cannot rewrite a witnessed provider STOP into
// a transport truncation.
export const MARROWLINE_COMPLETION_SCHEMA = 'td613.marrowline.provider-completion/v2';

const hasHeading = (text, heading) => new RegExp(
  '(?:^|\\n)[ \\t]*(?:#{1,6}[ \\t]*)?' + heading + '[ \\t]*:?[ \\t]*(?=\\r?\\n|$)', 'iu'
).test(String(text || ''));

export function observeMarrowlineCompletion(text = '', output = {}, {
  streamed = false, parseErrors = 0, creative = false
} = {}) {
  const original = String(text || '');
  const finishReason = typeof output.finishReason === 'string' ? output.finishReason : null;
  const firstHeadingPresent = hasHeading(original, 'Kʰonapolit');
  const terminalHeadingPresent = hasHeading(original, 'Tauric Diana bots');
  const hasPlainClosingGlyph = original.trimEnd().endsWith('⟐');
  const trimmed = original.trimEnd().replace(/\p{M}+$/gu, '');
  // Surface diagnostics only. A prose response may validly end without one of
  // these characters, and heading presence belongs to relay admission rather
  // than provider-transport completion.
  const closedChars = new Set(['.', '!', '?', '…', '⟐', '”', '"', "'", '’', ')', '}', ']', '—']);
  const openTail = Boolean(trimmed) && !closedChars.has(trimmed.at(-1));
  const structuralObservations = Object.freeze([
    ...(openTail ? ['surface-tail-open'] : []),
    ...(!firstHeadingPresent ? ['khonapolit-heading-missing'] : []),
    ...(!terminalHeadingPresent ? ['terminal-voice-missing'] : [])
  ]);

  let reason = 'provider-stop-observed';
  if (!original.trim()) reason = 'provider-return-empty';
  else if (finishReason === 'MAX_TOKENS') reason = 'provider-output-token-limit';
  else if (streamed && finishReason !== 'STOP') reason = 'provider-stream-finish-unwitnessed';
  else if (finishReason && finishReason !== 'STOP') reason = 'provider-finish-nonstop';
  else if (parseErrors > 0) reason = 'provider-stream-parse-error';
  // A non-streamed legacy payload can lack finishReason. Preserve the old
  // conservative posture there, but never let text shape override an explicit
  // provider STOP.
  else if (!finishReason) reason = 'provider-finish-unwitnessed';

  const complete = reason === 'provider-stop-observed';
  return Object.freeze({
    schema: MARROWLINE_COMPLETION_SCHEMA, complete, reason, finishReason,
    streamed: Boolean(streamed), parseErrors: Math.max(0, Number(parseErrors) || 0),
    firstHeadingPresent, terminalHeadingPresent, hasPlainClosingGlyph,
    openTail, structuralObservations, creative: Boolean(creative),
    completionAuthority: 'provider-transport-only',
    structuralAdmissionAuthority: 'relay-parser-separate',
    literaryQuality: 'NOT_ESTABLISHED_BY_STRUCTURAL_COMPLETION'
  });
}

export function assembleMarrowlineProviderTail(original = '', continuation = '') {
  const heldText = String(original);
  const suffix = String(continuation);
  if (!heldText.trim() || !suffix.trim()) return null;
  if (hasHeading(suffix, 'Kʰonapolit')) return null;
  if (hasHeading(heldText, 'Tauric Diana bots') && hasHeading(suffix, 'Tauric Diana bots')) return null;
  // Existing bytes survive verbatim; the only local addition can be a space.
  const terminalBegins = /^\s*(?:#{1,6}\s*)?Tauric Diana bots\s*:?\s*(?:\r?\n|$)/iu.test(suffix);
  const separator = terminalBegins ? (heldText.endsWith('\n') ? '\n' : '\n\n')
    : /\s$/u.test(heldText) || /^[\s,.;:!?…)}\]]/u.test(suffix) ? '' : ' ';
  return Object.freeze({ text: heldText + separator + suffix, separator,
    originalPreserved: true, continuationProviderAuthored: true });
}
