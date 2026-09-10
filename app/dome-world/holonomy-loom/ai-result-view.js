/**
 * Readable projection of already-admitted AI result fields.
 * This module neither validates a provider response nor converts model prose into
 * certified findings. Text, headings and source names never enter innerHTML.
 */
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
  const paragraphs = response.answer.split(/\r?\n[\t ]*\r?\n/).map(value => value.trim()).filter(Boolean);
  const fragment = doc.createDocumentFragment();
  const analysis = el('section', undefined, 'ai-result-analysis');
  analysis.setAttribute('aria-label', 'AI analysis');
  analysis.append(heading('The AI’s assessment'));
  if (paragraphs.length) analysis.append(el('p', paragraphs[0], 'ai-result-lead'));
  if (paragraphs.length > 1) {
    const full = el('details', undefined, 'ai-result-full');
    full.append(el('summary', `Read the full analysis · ${paragraphs.length - 1} more ${paragraphs.length === 2 ? 'paragraph' : 'paragraphs'}`));
    for (const paragraph of paragraphs.slice(1)) full.append(el('p', paragraph));
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
  fragment.append(sources);
  container.replaceChildren(fragment);
  return {
    setView(auditor) { sources.open = Boolean(auditor); },
    inspect() { return { paragraphCount: paragraphs.length, missingCount: count, sourceCount: response.used_document_ids.length }; }
  };
}
