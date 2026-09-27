/**
 * Source-preserving, presentation-only speaker frames for native Marrowline
 * returns. Match headings, not ordinary mentions of a speaker in prose.
 * Provider text, Unicode and receipts remain unchanged; clipboard has a
 * separate explicitly requested, plain-text script-heading presentation.
 */
const HEADINGS = Object.freeze([
  {
    voice: 'khonapolit',
    pattern: /^\s*(?:#{1,6}\s*)?(?:Movement\s+I\s*[—–:-]\s*)?(?:\[Kʰonapolit[^\]\r\n]*\]\s*:?\s*|Kʰonapolit\s*:\s*|Kʰonapolit\s*$)/iu
  },
  {
    voice: 'tauric-diana-bots',
    pattern: /^\s*(?:#{1,6}\s*)?(?:Movement\s+II\s*[—–:-]\s*)?(?:\[Tauric Diana Bots?[^\]\r\n]*\]\s*:?\s*|Tauric Diana Bots?\s*:\s*|Tauric Diana Bots?\s*$)/iu
  }
]);
export function findMarrowlineSpeakerHeading(line = '') {
  const source = String(line ?? '');
  for (const { voice, pattern } of HEADINGS) {
    const found = source.match(pattern);
    if (found?.[0]) return Object.freeze({ voice, heading: found[0], remainder: source.slice(found[0].length) });
  }
  return null;
}
export function renderMarrowlineSpeakerLine(span, line = '') {
  const source = String(line ?? '');
  const parsed = findMarrowlineSpeakerHeading(source);
  if (!parsed) { span.textContent = source; return null; }
  const label = span.ownerDocument.createElement('span');
  label.className = 'provider-script-label';
  label.dataset.speakerHeading = parsed.voice;
  label.textContent = parsed.heading;
  span.append(label);
  if (parsed.remainder) span.append(span.ownerDocument.createTextNode(parsed.remainder));
  return label;
}

/**
 * Copy-facing text only: show the same corner-glyph voice names in pasted
 * replies as on screen. Archived provider data, source textContent, prompts
 * and receipts remain unchanged. Never decorate ordinary prose mentions.
 */
export function formatMarrowlineReplyForCopy(text = '') {
  return String(text ?? '').split(/(\r\n|\n|\r)/u).map((fragment, index) => {
    if (index % 2) return fragment;
    const heading = findMarrowlineSpeakerHeading(fragment);
    if (!heading) return fragment;
    const frame = heading.voice === 'khonapolit'
      ? '╭─ Kʰonapolit ─╮' : '╭─ Tauric Diana bots ─╮';
    // Retain every code point following an inline native speaker heading.
    return frame + (heading.remainder ? (heading.remainder.startsWith(' ') ? '' : ' ') + heading.remainder : '');
  }).join('');
}
