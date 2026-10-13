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
function appendSourceDelimiter(parent, value) {
  const marker = parent.ownerDocument.createElement('span');
  marker.className = 'marrowline-md-source-delimiter';
  marker.setAttribute('aria-hidden', 'true');
  marker.textContent = value;
  parent.append(marker);
}

function appendInlineMarkdown(parent, value = '') {
  const source = String(value ?? '');
  const pattern = /(\*\*\*([^*\n]+?)\*\*\*|\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*)/gu;
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const index = Number(match.index || 0);
    if (index > cursor) parent.append(parent.ownerDocument.createTextNode(source.slice(cursor, index)));
    if (match[2] != null) {
      appendSourceDelimiter(parent, '***');
      const strong = parent.ownerDocument.createElement('strong');
      const em = parent.ownerDocument.createElement('em');
      em.textContent = match[2];
      strong.append(em);
      parent.append(strong);
      appendSourceDelimiter(parent, '***');
    } else if (match[3] != null) {
      appendSourceDelimiter(parent, '**');
      const strong = parent.ownerDocument.createElement('strong');
      strong.textContent = match[3];
      parent.append(strong);
      appendSourceDelimiter(parent, '**');
    } else {
      appendSourceDelimiter(parent, '*');
      const em = parent.ownerDocument.createElement('em');
      em.textContent = match[4];
      parent.append(em);
      appendSourceDelimiter(parent, '*');
    }
    cursor = index + match[0].length;
  }
  if (cursor < source.length) parent.append(parent.ownerDocument.createTextNode(source.slice(cursor)));
}

function appendPresentation(parent, source = '') {
  const line = String(source ?? '');
  const ordered = line.match(/^(\s*)(\d+\.)(\s+)(.*)$/u);
  if (!ordered) {
    appendInlineMarkdown(parent, line);
    return;
  }
  const row = parent.ownerDocument.createElement('span');
  row.className = 'marrowline-md-ordered-line';
  const prefix = parent.ownerDocument.createElement('span');
  prefix.className = 'marrowline-md-list-prefix';
  prefix.textContent = ordered[1] + ordered[2] + ordered[3];
  const body = parent.ownerDocument.createElement('span');
  body.className = 'marrowline-md-list-body';
  appendInlineMarkdown(body, ordered[4]);
  row.append(prefix, body);
  parent.append(row);
}

export function renderMarrowlineSpeakerLine(span, line = '') {
  const source = String(line ?? '');
  const parsed = findMarrowlineSpeakerHeading(source);
  if (!parsed) {
    appendPresentation(span, source);
    return null;
  }
  const label = span.ownerDocument.createElement('span');
  label.className = 'provider-script-label';
  label.dataset.speakerHeading = parsed.voice;
  label.textContent = parsed.heading;
  span.append(label);
  if (parsed.remainder) appendPresentation(span, parsed.remainder);
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
