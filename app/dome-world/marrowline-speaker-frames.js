/**
 * Source-preserving, presentation-only speaker frames for native Marrowline
 * returns. Match headings, not ordinary mentions of a speaker in prose.
 * Never change or generate provider text, Unicode, receipts, or clipboard data.
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
