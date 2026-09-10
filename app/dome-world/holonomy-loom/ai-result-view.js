/**
 * Readable projection of already-admitted AI result fields.
 * This module neither validates a provider response nor converts model prose into
 * certified findings. Text, headings and source names never enter innerHTML.
 */
// Deliberately small presentation grammar. Unrecognized Markdown, links and HTML
// remain literal text. The exact provider answer is separately retained below.
function displayAnswerText(answer) {
  // Some provider strings contain visible \\n paragraph separators after JSON
  // decoding. Interpret only prose paragraph/list boundaries, never arbitrary
  // escapes. Backtick code, fenced code and quoted strings remain verbatim.
  const protectedSpans = /(`{1,}|~{3,})([\s\S]*?)\1|"(?:\\.|[^"\\])*"/g;
  const normalize = text => text
    .replace(/(?<!\\)(?:\\r)?\\n(?:(?:\\r)?\\n)+/g, match => '\n'.repeat((match.match(/\\n/g) || []).length))
    .replace(/(?<!\\)(?:\\r)?\\n(?=[ \t]*(?:#{1,6}[ \t]|[-+*][ \t]|[0-9]{1,6}[.)][ \t]))/g, '\n');
  let display = '', start = 0;
  for (const match of answer.matchAll(protectedSpans)) {
    display += normalize(answer.slice(start, match.index)) + match[0];
    start = match.index + match[0].length;
  }
  return display + normalize(answer.slice(start));
}

function answerBlocks(answer) {
  const blocks = [];
  const lines = answer.replace(/\r\n?/g, '\n').split('\n');
  let paragraph = [], listBoundary = true;
  const flush = () => { if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join('\n') }); paragraph = []; };
  for (const line of lines) {
    if (!line.trim()) { flush(); listBoundary = true; continue; }
    const heading = /^ {0,3}#{1,6}[ \t]+(\S.*)$/.exec(line);
    const item = /^( *)(?:([-+*])|([0-9]{1,6})[.)])[ \t]+(\S.*)$/.exec(line);
    if (heading) { flush(); blocks.push({ type: 'heading', text: heading[1] }); }
    else if (item) {
      flush();
      const entry = { indent: item[1].length, ordered: Boolean(item[3]), value: item[3] ? Number(item[3]) : null, text: item[4] };
      if (listBoundary || blocks.at(-1)?.type !== 'list') blocks.push({ type: 'list', items: [] });
      listBoundary = false;
      blocks.at(-1).items.push(entry);
    } else paragraph.push(line);
  }
  flush();
  // The observed provider also emits a short uppercase title without Markdown.
  // Recognize that typography only at the beginning and only with content after
  // it; retain sentence-like warnings and all original text in the inspector.
  const first = blocks[0];
  if (blocks.length > 1 && first.type === 'paragraph' && first.text.length <= 120 &&
      /^[A-Z][A-Z0-9 &:/()–—-]+$/.test(first.text) && first.text.split(/\s+/).length >= 3) first.type = 'heading';
  return blocks;
}

export function renderLoomAiResult(container, response, { documentNames = {} } = {}) {
  if (!container?.ownerDocument) throw new TypeError('A result container is required.');
  if (!response || typeof response.answer !== 'string' ||
      !Array.isArray(response.missing_information) || response.missing_information.some(v => typeof v !== 'string') ||
      !Array.isArray(response.used_document_ids) || response.used_document_ids.some(v => typeof v !== 'string') ||
      typeof response.suggested_next_step !== 'string') {
    throw new TypeError('Render an admitted structured AI result.');
  }
  const doc = container.ownerDocument;
  const el = (tag, text, className) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const heading = text => el('h3', text);
  const displayAnswer = displayAnswerText(response.answer);
  const paragraphs = displayAnswer.split(/\r?\n[\t ]*\r?\n/).map(value => value.trim()).filter(Boolean);
  const blocks = answerBlocks(displayAnswer);
  const inline = (node, text) => {
    // Bold and inline-code delimiters become safe text-bearing elements only.
    const tokens = /\*\*([^*\n]+)\*\*|`([^`\n]+)`/g;
    let start = 0;
    for (const match of text.matchAll(tokens)) {
      node.append(doc.createTextNode(text.slice(start, match.index)));
      node.append(el(match[1] === undefined ? 'code' : 'strong', match[1] ?? match[2]));
      start = match.index + match[0].length;
    }
    node.append(doc.createTextNode(text.slice(start)));
    return node;
  };
  const renderBlock = block => {
    if (block.type !== 'list') return inline(el(block.type === 'heading' ? 'h4' : 'p'), block.text);
    const wrapper = el('div', undefined, 'ai-result-list');
    const stack = [];
    for (const item of block.items) {
      while (stack.length && item.indent < stack.at(-1).indent) stack.pop();
      if (stack.length && item.indent === stack.at(-1).indent && item.ordered !== stack.at(-1).ordered) stack.pop();
      if (!stack.length || item.indent > stack.at(-1).indent) {
        const list = el(item.ordered ? 'ol' : 'ul');
        if (item.ordered) list.start = item.value;
        const parent = stack.at(-1)?.lastItem ?? wrapper;
        parent.append(list);
        stack.push({ list, indent: item.indent, ordered: item.ordered, lastItem: null });
      }
      const li = inline(el('li'), item.text);
      if (item.ordered) li.value = item.value;
      stack.at(-1).list.append(li);
      stack.at(-1).lastItem = li;
    }
    return wrapper;
  };
  const fragment = doc.createDocumentFragment();
  const analysis = el('section', undefined, 'ai-result-analysis');
  analysis.setAttribute('aria-label', 'AI analysis');
  analysis.append(heading('The AI’s assessment'));
  // A provider may lead with one or several standalone headings. Keep going
  // until actual prose or a list appears; headings alone cannot be the preview.
  const firstSubstantive = blocks.findIndex(block => block.type !== 'heading');
  const previewCount = firstSubstantive < 0 ? blocks.length : firstSubstantive + 1;
  const lead = el('div', undefined, 'ai-result-lead');
  for (const block of blocks.slice(0, previewCount)) lead.append(renderBlock(block));
  if (firstSubstantive < 0) lead.append(el('p', 'The AI returned headings without a substantive assessment.'));
  analysis.append(lead);
  if (previewCount < blocks.length) {
    const full = el('details', undefined, 'ai-result-full');
    full.append(el('summary', 'Read the rest of the analysis'));
    for (const block of blocks.slice(previewCount)) full.append(renderBlock(block));
    analysis.append(full);
  }
  fragment.append(analysis);

  const next = el('section', undefined, 'ai-result-next');
  next.setAttribute('aria-label', 'Suggested next step');
  next.append(heading('Suggested next step'), el('p', response.suggested_next_step || 'The AI supplied no next step.'));
  fragment.append(next);

  const unknowns = el('details', undefined, 'ai-result-unknowns');
  const count = response.missing_information.length;
  unknowns.append(el('summary', count ? `${count} open ${count === 1 ? 'question' : 'questions'} reported by the AI` : 'The AI reported no open questions'));
  if (count) {
    const list = el('ul');
    for (const item of response.missing_information) list.append(el('li', item));
    unknowns.append(list);
  } else {
    unknowns.append(el('p', 'An empty missing-information list records the model’s response; it does not establish complete evidence.'));
  }
  fragment.append(unknowns);

  const sources = el('details', undefined, 'ai-result-sources');
  sources.append(el('summary', 'Inspect the source references'));
  sources.append(el('p', 'These are the sources the AI says it used. The quoted document IDs remain attached to its analysis; this list does not independently verify each conclusion.', 'ai-muted'));
  if (response.used_document_ids.length) {
    const list = el('ul');
    for (const id of response.used_document_ids) {
      const name = documentNames instanceof Map ? documentNames.get(id) :
        Object.prototype.hasOwnProperty.call(documentNames, id) ? documentNames[id] : undefined;
      const item = el('li');
      item.append(el('code', id));
      if (typeof name === 'string' && name !== id) item.append(doc.createTextNode(` · ${name}`));
      list.append(item);
    }
    sources.append(list);
  } else sources.append(el('p', 'The AI supplied no document references.'));
  const original = el('details', undefined, 'ai-result-original');
  original.append(el('summary', 'Original answer · exact text'), el('pre', response.answer));
  sources.append(original);
  fragment.append(sources);
  container.replaceChildren(fragment);
  return {
    setView(auditor) { sources.open = Boolean(auditor); },
    inspect() { return { paragraphCount: paragraphs.length, blockCount: blocks.length, missingCount: count, sourceCount: response.used_document_ids.length }; }
  };
}
