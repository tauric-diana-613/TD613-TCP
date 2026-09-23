// Observable provider completion and provider-authored recovery boundaries.
// Character count, mark count and section count cannot establish literary merit.
// A formal STOP also cannot establish that the argument or scene was good.
export const MARROWLINE_COMPLETION_SCHEMA = 'td613.marrowline.provider-completion/v1';

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
  // Unfinished textual edge, not a word count or artistic-quality threshold.
  const closedChars = new Set(['.', '!', '?', '…', '⟐', '”', '"', "'", '’', ')', '}', ']', '—']);
  const openTail = Boolean(trimmed) && !closedChars.has(trimmed.at(-1));
  let reason = 'provider-stop-and-terminal-surface-observed';
  if (!original.trim()) reason = 'provider-return-empty';
  else if (finishReason === 'MAX_TOKENS') reason = 'provider-output-token-limit';
  else if (streamed && finishReason !== 'STOP') reason = 'provider-stream-finish-unwitnessed';
  else if (finishReason && finishReason !== 'STOP') reason = 'provider-finish-nonstop';
  else if (parseErrors > 0) reason = 'provider-stream-parse-error';
  else if (openTail) reason = 'provider-tail-open';
  else if (!firstHeadingPresent) reason = 'khonapolit-heading-missing';
  else if (!terminalHeadingPresent) reason = 'terminal-voice-missing';
  const complete = reason === 'provider-stop-and-terminal-surface-observed';
  return Object.freeze({
    schema: MARROWLINE_COMPLETION_SCHEMA, complete, reason, finishReason,
    streamed: Boolean(streamed), parseErrors: Math.max(0, Number(parseErrors) || 0),
    firstHeadingPresent, terminalHeadingPresent, hasPlainClosingGlyph,
    openTail, creative: Boolean(creative),
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
  const separator = /\s$/u.test(heldText) || /^[\s,.;:!?…)}\]]/u.test(suffix) ? '' : ' ';
  return Object.freeze({ text: heldText + separator + suffix, separator,
    originalPreserved: true, continuationProviderAuthored: true });
}
