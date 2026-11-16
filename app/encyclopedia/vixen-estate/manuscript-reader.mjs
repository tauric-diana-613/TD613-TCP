/**
 * Vixen Experiment-A manuscript reader: full text, accessible typography, safe MathML.
 * Source is displayed without HTML interpretation. Native UTF-8 custody remains in
 * corpus-experiment-a.mjs, which verifies every body before this presentation layer.
 * No telemetry, mutations, auto-Podium execution, or external math CDN.
 */
const INLINE_TOKENS = /(\\\([\s\S]+?\\\)|(?<!\\)\$(?!\$)[^\n$]+?(?<!\\)\$|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\x60[^\x60\n]+\x60)/g;
const SECTION = /^#{1,6}\s+(.+)$/;
const FENCE = /^\s*(`{3,}|~{3,})(.*)$/;

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

function appendInline(doc, parent, raw) {
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

function flushParagraph(doc, frag, lines) {
  if (!lines.length) return;
  const p = doc.createElement('p');
  p.className = 'vix-reader-paragraph';
  // Manuscript source is immutable. Ordinary single newlines are soft prose wraps
  // (especially PDF derivatives); only explicit Markdown hard breaks become <br>.
  // The exact original bytes remain available through the raw-source disclosure.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hardBreak = /(?: {2,}|\\)$/.test(line);
    appendInline(doc, p, hardBreak ? line.replace(/(?: {2,}|\\)$/, '') : line);
    if (i < lines.length - 1) {
      p.append(hardBreak ? doc.createElement('br') : doc.createTextNode(' '));
    }
  }
  frag.append(p);
  lines.length = 0;
}

export function mountVixenManuscript(target, manuscript, {sourceId = '', showRaw = true} = {}) {
  if (!target || typeof target.replaceChildren !== 'function') throw new TypeError('VIXEN_READER_TARGET_REQUIRED');
  const doc = target.ownerDocument;
  const raw = String(manuscript ?? '');
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const fragment = doc.createDocumentFragment();
  const paragraph = [];
  let list = null;
  let fence = null;
  let display = null;
  const flush = () => flushParagraph(doc, fragment, paragraph);
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
  for (const line of lines) {
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
      appendInline(doc, h, heading[2]);
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
      appendInline(doc, li, (numbered || bullet)[1]);
      list.append(li);
      continue;
    }
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flush(); closeList();
      const q = doc.createElement('blockquote');
      q.className = 'vix-reader-quote';
      appendInline(doc, q, quote[1]);
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
    displayed_complete: true,
    rendered_math_elements: target.querySelectorAll('[data-math-rendered="mathml"]').length,
    fallback_math_elements: target.querySelectorAll('[data-math-rendered="source-fallback"]').length
  });
}
