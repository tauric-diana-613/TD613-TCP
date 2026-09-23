// Observable provider completion and provider-authored recovery boundaries.
// Never infer literary merit from character count or combining-mark totals;
// this module distinguishes transport/structural incompletion from the human
// editorial judgment that a formally complete answer can still be poor.
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
  const trimmed = original.trimEnd().replace(/\\p{M}+$/gu, '');
  // This tests an unfinished textual edge, not the number of words or marks.
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
  // For an open-field scene, the terminal-heading obligation also protects the
  // decisive narrative event from being replaced by atmospheric preamble.
  // Whether an otherwise complete scene actually earns its drama is human review.
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
  // A continuation cannot silently replace or restate the original return.
  // If the first voice was already authored, the second return must not restart it.
  if (hasHeading(suffix, 'Kʰonapolit')) return null;
  if (hasHeading(heldText, 'Tauric Diana bots') && hasHeading(suffix, 'Tauric Diana bots')) return null;
  // Prefer provider-authored boundary whitespace. When neither chunk has it,
  // use an ordinary space, not a synthetic textual or typographic flourish.
  const separator = /\\s$/u.test(heldText) || /^[\\s,.;:!?…)}\\]]/u.test(suffix) ? '' : ' ';
  return Object.freeze({ text: heldText + separator + suffix, separator,
    originalPreserved: true, continuationProviderAuthored: true });
}
