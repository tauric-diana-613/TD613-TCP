/**
 * Vixen Experiment-A manuscript reader: full text, accessible typography, safe MathML.
 * Source is displayed without HTML interpretation. Native UTF-8 custody remains in
 * corpus-experiment-a.mjs, which verifies every body before this presentation layer.
 * No telemetry, mutations, auto-Podium execution, or external math CDN.
 */
const INLINE_TOKENS = /(\\\([\s\S]+?\\\)|(?<!\\)\$(?!\$)[^\n$]+?(?<!\\)\$|!\[[^\]]*\]\[[^\]]+\]|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\x60[^\x60\n]+\x60)/g;
const SECTION = /^#{1,6}\s+(.+)$/;
const FENCE = /^\s*(`{3,}|~{3,})(.*)$/;
const DATA_IMAGE_DEF = /^\s*\[([^\]]+)\]:\s*<?(data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=\s]+)>?\s*$/i;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)+\|?\s*$/;

function splitPipeRow(line) {
  const trimmed = String(line || '').trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

function mathNode(doc, expression, display) {
  const holder = doc.createElement(display ? 'div' : 'span');
  holder.className = display ? 'vix-math vix-math-display' : 'vix-math vix-math-inline';
  holder.dataset.latex = expression;
  if (display) holder.dataset.display = 'true';
  holder.setAttribute('role', 'math');
  holder.setAttribute('aria-label', expression);
  const katex = doc.defaultView?.katex || globalThis.window?.katex;
  if (katex?.render) {
    try {
      katex.render(expression, holder, {
        output: 'mathml', displayMode: display, throwOnError: false,
        strict: 'ignore', trust: false, maxExpand: 1000, maxSize: 10
      });
      holder.dataset.mathRendered = 'mathml';
      return holder;
    } catch (_) {}
  }
  holder.textContent = display ? '\\[' + expression + '\\]' : '\\(' + expression + '\\)';
  holder.dataset.mathRendered = 'source-fallback';
  return holder;
}

function appendInline(doc, parent, raw, imageRefs = null) {
  const value = String(raw ?? '');
  INLINE_TOKENS.lastIndex = 0;
  let offset = 0;
  for (const match of value.matchAll(INLINE_TOKENS)) {
    const at = match.index ?? 0;
    if (at > offset) parent.append(doc.createTextNode(value.slice(offset, at)));
    const token = match[0];
    if (token.startsWith('\\(') && token.endsWith('\\)')) {
      parent.append(mathNode(doc, token.slice(2, -2), false));
    } else if (token.startsWith('$') && token.endsWith('$')) {
      parent.append(mathNode(doc, token.slice(1, -1), false));
    } else if (token.startsWith('![')) {
      const m = token.match(/^!\[([^\]]*)\]\[([^\]]+)\]$/);
      const refSrc = m && imageRefs ? imageRefs.get(m[2].trim()) : null;
      if (refSrc) {
        const img = doc.createElement('img');
        img.className = 'vix-reader-inline-img';
        img.src = refSrc;
        img.alt = m[1] || 'Source equation or diagram';
        img.decoding = 'async';
        parent.append(img);
      } else {
        const span = doc.createElement('span');
        span.className = 'vix-reader-image-ref';
        span.textContent = `[Figure/Equation ${m ? m[2] : token}]`;
        parent.append(span);
      }
    } else if (token.startsWith('**')) {
      const strong = doc.createElement('strong');
      strong.textContent = token.slice(2, -2);
      parent.append(strong);
    } else if (token.startsWith('*')) {
      const italic = doc.createElement('em');
      italic.textContent = token.slice(1, -1);
      parent.append(italic);
    } else {
      const code = doc.createElement('code');
      code.textContent = token.slice(1, -1);
      parent.append(code);
    }
    offset = at + token.length;
  }
  if (offset < value.length) parent.append(doc.createTextNode(value.slice(offset)));
}

function flushParagraph(doc, frag, lines, imageRefs = null, paraCounter = null) {
  if (!lines.length) return;
  const p = doc.createElement('p');
  p.className = 'vix-reader-paragraph';
  if (paraCounter && typeof paraCounter.n === 'number') {
    paraCounter.n += 1;
    p.dataset.displayPara = String(paraCounter.n);
  }
  // Manuscript source is immutable. Ordinary single newlines are soft prose wraps
  // (especially PDF derivatives); only explicit Markdown hard breaks become <br>.
  // The exact original bytes remain available through the raw-source disclosure.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hardBreak = /(?: {2,}|\\)$/.test(line);
    appendInline(doc, p, hardBreak ? line.replace(/(?: {2,}|\\)$/, '') : line, imageRefs);
    if (i < lines.length - 1) {
      p.append(hardBreak ? doc.createElement('br') : doc.createTextNode(' '));
    }
  }
  frag.append(p);
  lines.length = 0;
}

/**
 * Presentation-only repair for OCR/PDF derivatives whose blank-line spacing
 * produced one- or two-word HTML paragraphs. A run needs >= 7 neighboring,
 * short, unpunctuated fragments; headings, lists and quotations are excluded.
 * Neither raw manuscript bytes nor source hashes are changed. Full exact text
 * remains visible in the disclosure following the editorial projection.
 */
/**
 * A PDF text derivative can contain thousands of artificial blank lines
 * between individual words. The old lowercase-majority micro-paragraph rule
 * skipped title-case headings and punctuation-bound runs, producing a
 * one-word-per-paragraph reading column.
 *
 * PDF-only reflow is a PRESENTATION PROJECTION. Its output may regroup
 * whitespace into readable sentences and paragraphs, but the original,
 * custody-verified text stays byte-identical and available in the raw view.
 * No words, research propositions, citations, or source identities are
 * generated or substituted. Native Markdown retains its own structure.
 */
function reflowExtractedPdf(source, documentTitle = '') {
  const raw = String(source ?? '').replace(/\r\n?/g, '\n');
  const blocks = raw.split(/\n[ \t]*\n+/);
  const micro = blocks.filter(block => {
    const line = block.trim();
    return line.length > 0 && line.length <= 64 &&
      !line.includes('\n') && line.split(/\s+/).length <= 4;
  }).length;
  // Normal readable PDFs, code, and already-structured manuscripts never
  // enter this destructive-to-whitespace (but not content) projection.
  if (blocks.length < 60 || micro / blocks.length < 0.72) return null;

  let prose = raw.replace(/\s+/gu, ' ').trim();
  let displayTitle = '';
  const words = String(documentTitle || '').trim().split(/\s+/).filter(Boolean);
  if (words.length >= 3 && words.length <= 40) {
    const normal = value => String(value).normalize('NFKC')
      .replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
    const leading = [...prose.matchAll(/\S+/g)].slice(0, words.length);
    if (leading.length === words.length &&
        leading.every((match, i) => normal(match[0]) === normal(words[i]))) {
      const final = leading[leading.length - 1];
      const consumed = final.index + final[0].length;
      displayTitle = prose.slice(0, consumed);
      prose = prose.slice(consumed).trimStart();
    }
  }

  // Group extracted sentences into literary paragraphs. Long runs without
  // reliable full stops are broken only at spaces, never inside source words.
  const sentences = prose.split(/(?<=[.!?…])\s+(?=(?:["“'‘(\[])?\p{Lu})/u);
  const paragraphs = [];
  let paragraph = '';
  const flush = () => {
    if (paragraph.trim()) paragraphs.push(paragraph.trim());
    paragraph = '';
  };
  for (const sentence of sentences) {
    const words = String(sentence).trim().split(/\s+/).filter(Boolean);
    if (paragraph.length > 420 && paragraph.length + sentence.length > 820) flush();
    for (const word of words) {
      if (paragraph.length > 540 && paragraph.length + word.length > 890) flush();
      paragraph += (paragraph ? ' ' : '') + word;
    }
    if (paragraph.length >= 615) flush();
  }
  flush();

  // A structural invariant: remove only whitespace and editorial block
  // boundaries. The text's complete nonwhitespace character sequence must
  // remain unchanged, including citations, accents, symbols and punctuation.
  const flatten = value => String(value).replace(/\s+/gu, '');
  if (flatten(displayTitle + paragraphs.join('')) !== flatten(raw)) {
    throw new Error('VIXEN_PDF_REFLOW_NONWHITESPACE_INVARIANT');
  }
  return Object.freeze({
    text: paragraphs.join('\n\n'),
    projection_title: displayTitle,
    collapsed_micro_paragraphs: Math.max(0, blocks.length - paragraphs.length - (displayTitle ? 1 : 0)),
    pdf_derivative_reflow: true
  });
}

export function projectManuscriptLineation(source, {sourceFormat = '', documentTitle = ''} = {}) {
  const raw = String(source ?? '').replace(/\r\n?/g, '\n');
  if (String(sourceFormat).toLowerCase().includes('pdf')) {
    const pdfEdition = reflowExtractedPdf(raw, documentTitle);
    if (pdfEdition) return pdfEdition;
  }
  const blocks = raw.split(/\n[ \t]*\n+/);
  const isMicro = (value) => {
    const line = value.trim();
    return line.length > 0 && line.length <= 58 &&
      !line.includes('\n') && line.split(/\s+/).length <= 4 &&
      !/^(?:#{1,6}\s|>|[-*+]\s|\d+[.)]\s|`{3}|~{3}|\$\$|\\\[)/.test(line) &&
      !/[.!?…:;]$/.test(line);
  };
  const result = [];
  let collapsed = 0;
  for (let i = 0; i < blocks.length;) {
    let next = i;
    while (next < blocks.length && isMicro(blocks[next])) next++;
    const run = blocks.slice(i, next);
    const average = run.reduce((sum, part) => sum + part.trim().split(/\s+/).length, 0) / Math.max(1, run.length);
    const lowercaseFragments = run.filter(part => /^[a-z]/.test(part.trim())).length;
    if (run.length >= 7 && average <= 2.7 && lowercaseFragments >= Math.ceil(run.length * .55)) {
      result.push(run.map(part => part.trim()).join(' '));
      collapsed += run.length - 1;
      i = next;
    } else {
      result.push(blocks[i]);
      i++;
    }
  }
  return Object.freeze({
    text: result.join('\n\n'),
    projection_title: '',
    collapsed_micro_paragraphs: collapsed,
    pdf_derivative_reflow: false
  });
}

export function mountVixenManuscript(target, manuscript, {sourceId = '', sourceFormat = '', documentTitle = '', showRaw = true} = {}) {
  if (!target || typeof target.replaceChildren !== 'function') throw new TypeError('VIXEN_READER_TARGET_REQUIRED');
  const doc = target.ownerDocument;
  const raw = String(manuscript ?? '');
  const projected = projectManuscriptLineation(raw, {sourceFormat, documentTitle});
  const imageRefs = new Map();
  const filteredLines = [];
  for (const line of projected.text.split('\n')) {
    const imgDef = !projected.pdf_derivative_reflow ? line.match(DATA_IMAGE_DEF) : null;
    if (imgDef) {
      imageRefs.set(imgDef[1].trim(), imgDef[2].replace(/\s+/g, ''));
      continue;
    }
    filteredLines.push(line);
  }
  const lines = filteredLines;
  const fragment = doc.createDocumentFragment();
  if (projected.projection_title) {
    const title = doc.createElement('h3');
    title.className = 'vix-reader-heading vix-pdf-source-title';
    title.textContent = projected.projection_title;
    fragment.append(title);
  }
  const paragraph = [];
  const paraCounter = {n: 0};
  let list = null;
  let fence = null;
  let display = null;
  const flush = () => flushParagraph(doc, fragment, paragraph, imageRefs, paraCounter);
  const closeList = () => { list = null; };
  const closeFence = () => {
    if (!fence) return;
    const content = fence.lines.join('\n');
    if (fence.math) fragment.append(mathNode(doc, content, true));
    else {
      const code = doc.createElement('pre');
      code.className = 'vix-reader-code';
      code.textContent = content;
      fragment.append(code);
    }
    fence = null;
  };
  const closeDisplay = () => {
    if (display === null) return;
    fragment.append(mathNode(doc, display.join('\n'), true));
    display = null;
  };
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (fence) {
      if (/^\s*(?:`{3,}|~{3,})\s*$/.test(line)) { closeFence(); }
      else fence.lines.push(line);
      continue;
    }
    if (display !== null) {
      if (line.includes(display.delimiter)) {
        const index = line.indexOf(display.delimiter);
        display.push(line.slice(0, index));
        closeDisplay();
        if (line.slice(index + 2).trim()) paragraph.push(line.slice(index + 2));
      } else display.push(line);
      continue;
    }
    const f = line.match(FENCE);
    if (f) {
      flush(); closeList();
      fence = {math: /^(?:math|latex|tex)$/i.test(f[2].trim()), lines: []};
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) { flush(); closeList(); continue; }
    // GFM pipe table support
    if (trimmed.includes('|') && idx + 1 < lines.length && TABLE_SEP.test(lines[idx + 1])) {
      flush(); closeList();
      const wrap = doc.createElement('div');
      wrap.className = 'vix-reader-table-wrap';
      const table = doc.createElement('table');
      table.className = 'vix-reader-table';
      const thead = doc.createElement('thead');
      const hRow = doc.createElement('tr');
      for (const cellText of splitPipeRow(trimmed)) {
        const th = doc.createElement('th');
        appendInline(doc, th, cellText, imageRefs);
        hRow.append(th);
      }
      thead.append(hRow);
      table.append(thead);
      const tbody = doc.createElement('tbody');
      idx += 2;
      while (idx < lines.length && lines[idx].trim() && lines[idx].includes('|')) {
        const tr = doc.createElement('tr');
        for (const cellText of splitPipeRow(lines[idx])) {
          const td = doc.createElement('td');
          appendInline(doc, td, cellText, imageRefs);
          tr.append(td);
        }
        tbody.append(tr);
        idx++;
      }
      idx--;
      table.append(tbody);
      wrap.append(table);
      fragment.append(wrap);
      continue;
    }
    const displayMatch = trimmed.match(/^(\$\$|\\\[)(.*)$/);
    if (displayMatch) {
      flush(); closeList();
      const endToken = displayMatch[1] === '$$' ? '$$' : '\\]';
      const expression = displayMatch[2];
      if (expression.endsWith(endToken)) fragment.append(mathNode(doc, expression.slice(0, -endToken.length).trim(), true));
      else {
        display = [];
        display.delimiter = endToken;
        if (expression) display.push(expression);
      }
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush(); closeList();
      const headingLevel = Math.min(6, heading[1].length + 2);
      const h = doc.createElement('h' + headingLevel);
      h.className = 'vix-reader-heading';
      appendInline(doc, h, heading[2], imageRefs);
      fragment.append(h);
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush(); closeList(); fragment.append(doc.createElement('hr')); continue;
    }
    const bullet = line.match(/^\s*[-+*]\s+(.+)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flush();
      const kind = numbered ? 'ol' : 'ul';
      if (!list || list.tagName.toLowerCase() !== kind) {
        list = doc.createElement(kind);
        list.className = 'vix-reader-list';
        fragment.append(list);
      }
      const li = doc.createElement('li');
      appendInline(doc, li, (numbered || bullet)[1], imageRefs);
      list.append(li);
      continue;
    }
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flush(); closeList();
      const q = doc.createElement('blockquote');
      q.className = 'vix-reader-quote';
      appendInline(doc, q, quote[1], imageRefs);
      fragment.append(q);
      continue;
    }
    closeList();
    paragraph.push(line);
  }
  flush(); closeFence(); closeDisplay();
  target.classList.add('vix-manuscript');
  target.replaceChildren(fragment);
  target.dataset.sourceId = sourceId;
  target.dataset.presentation = 'full-manuscript-mathml';
  target.dataset.lineation = projected.pdf_derivative_reflow
    ? 'pdf-source-wordflow-reconstructed'
    : projected.collapsed_micro_paragraphs ? 'micro-paragraph-reflow' : 'source-paragraphs';
  if (showRaw) {
    const rawDetails = doc.createElement('details');
    rawDetails.className = 'vix-reader-raw';
    const summary = doc.createElement('summary');
    summary.textContent = 'Inspect exact source text and TeX';
    const pre = doc.createElement('pre');
    pre.textContent = raw;
    rawDetails.append(summary, pre);
    target.append(rawDetails);
  }
  return Object.freeze({
    source_id: sourceId,
    source_characters: raw.length,
    display_lineation_collapses: projected.collapsed_micro_paragraphs,
    derivative_reflow_applied: projected.pdf_derivative_reflow,
    displayed_complete: true,
    rendered_math_elements: target.querySelectorAll('[data-math-rendered="mathml"]').length,
    fallback_math_elements: target.querySelectorAll('[data-math-rendered="source-fallback"]').length
  });
}
