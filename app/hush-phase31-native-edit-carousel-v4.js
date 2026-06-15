const VERSION = 'phase-31.1-edit-modal/dropdown-list-v4';
const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';
const DISCOURSE_MODES = ['explanatory','argumentative','narrative','procedural','reflective-affective','legal-forensic','casual-conversational','technical-operational','poetic-symbolic','corrective-repair','compressed-summary'];
const RETRIEVAL_TRIGGERS = ['baseline-voice','high-pressure','failure-recovery','correction-request','disagreement-pushback','implementation-handoff','evidence-framing','boundary-refusal','uncertainty-caveat','deep-explanation','compression-summary','affective-repair','ritual-symbolic','public-facing','private-diagnostic'];
const MODE_ALIASES = new Map([
  ['reflective', 'reflective-affective'],
  ['casual', 'casual-conversational'],
  ['technical', 'technical-operational'],
  ['repair', 'corrective-repair'],
  ['uncategorized', 'explanatory']
]);
const TRIGGER_ALIASES = new Map([
  ['uncategorized', 'baseline-voice'],
  ['', 'baseline-voice']
]);

let workingSamples = [];

const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);
const asArray = (value) => Array.isArray(value) ? value : [];

function pick(value, options, aliases = new Map()) {
  const raw = text(value);
  const mapped = aliases.get(raw) || raw;
  return options.includes(mapped) ? mapped : options[0];
}

function modeValue(value) {
  return pick(value, DISCOURSE_MODES, MODE_ALIASES);
}

function triggerValue(value) {
  return pick(value, RETRIEVAL_TRIGGERS, TRIGGER_ALIASES);
}

function normalizeSampleEntry(entry) {
  const body = typeof entry === 'string' ? entry : String(entry?.text ?? '');
  if (!text(body)) return null;
  const discourseMode = typeof entry === 'string' ? DISCOURSE_MODES[0] : modeValue(entry?.discourseMode || entry?.promptCategory || DISCOURSE_MODES[0]);
  const retrievalTrigger = typeof entry === 'string' ? RETRIEVAL_TRIGGERS[0] : triggerValue(entry?.retrievalTrigger || entry?.contextLabel || RETRIEVAL_TRIGGERS[0]);
  return {
    text: body,
    promptCategory: discourseMode,
    discourseMode,
    contextLabel: retrievalTrigger,
    retrievalTrigger
  };
}

export function readStoredSamples() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return asArray(parsed.samples).map(normalizeSampleEntry).filter(Boolean);
  } catch (error) {
    return [];
  }
}

export function writeStoredSamples(samples = []) {
  const clean = asArray(samples).map(normalizeSampleEntry).filter(Boolean);
  try {
    if (clean.length) localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 'phase31-logged-samples/v1', updatedAt: new Date().toISOString(), samples: clean }));
    else localStorage.removeItem(STORAGE_KEY);
  } catch (error) {}
  return clean;
}

function signaturesMatch(expected = []) {
  const saved = readStoredSamples();
  if (saved.length !== expected.length) return false;
  return expected.every((sample, index) => {
    const other = saved[index];
    return other && other.text === sample.text && other.promptCategory === sample.promptCategory && other.contextLabel === sample.contextLabel;
  });
}

function setOptions(select, options, selected, aliases = new Map()) {
  const value = pick(selected || select.value, options, aliases);
  select.textContent = '';
  options.forEach((optionValue) => {
    const option = select.ownerDocument.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    option.selected = optionValue === value;
    select.appendChild(option);
  });
}

export function upgradeCustomizerFields(doc = document) {
  const mode = byId('hushPhase31SampleCategory', doc);
  if (mode?.tagName === 'SELECT') {
    setOptions(mode, DISCOURSE_MODES, mode.value, MODE_ALIASES);
    const modeLabel = doc.querySelector('label[for="hushPhase31SampleCategory"] span');
    if (modeLabel) modeLabel.textContent = 'Discourse Mode';
  }

  const existing = byId('hushPhase31ContextLabel', doc);
  if (existing) {
    const selected = triggerValue(existing.value || existing.getAttribute('value') || RETRIEVAL_TRIGGERS[0]);
    let trigger = existing;
    if (existing.tagName !== 'SELECT') {
      trigger = doc.createElement('select');
      trigger.id = 'hushPhase31ContextLabel';
      trigger.className = existing.className || '';
      existing.replaceWith(trigger);
    }
    setOptions(trigger, RETRIEVAL_TRIGGERS, selected, TRIGGER_ALIASES);
    const triggerLabel = doc.querySelector('label[for="hushPhase31ContextLabel"] span');
    if (triggerLabel) triggerLabel.textContent = 'Retrieval Trigger';
  }
}

function ensureStyle(doc = document) {
  if (byId('hushPhase31EditListStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPhase31EditListStyle';
  style.textContent = `
    #hushPhase31EditCorpusModal[hidden]{display:none!important}
    #hushPhase31EditCorpusList{min-height:0!important;max-height:min(32rem,calc(100dvh - 12rem))!important;overflow:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}
    .hush-phase31-edit-sample{position:relative;padding:.74rem .62rem;margin:.62rem 0;border:1px solid rgba(202,255,223,.18);border-radius:1rem;background:rgba(4,18,12,.38)}
    .hush-phase31-edit-sample label{display:grid;gap:.35rem;margin:.58rem 0;color:rgba(202,255,223,.86);font-family:var(--font-mono,ui-monospace,monospace);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase}
    .hush-phase31-edit-sample textarea{min-height:8.4rem!important;resize:vertical!important}
    .hush-phase31-edit-remove{appearance:none!important;-webkit-appearance:none!important;position:absolute!important;display:inline-grid!important;place-items:center!important;width:1rem!important;height:1rem!important;top:.42rem!important;right:.48rem!important;border:0!important;border-radius:999px!important;background:transparent!important;color:rgba(255,118,104,.94)!important;font:700 .62rem/1 var(--font-mono,ui-monospace,monospace)!important;box-shadow:none!important;padding:0!important}
    #hushPhase31SaveCorpusEdits[data-save-state="saved"]{border-color:rgba(49,255,138,.72)!important;background:linear-gradient(135deg,rgba(202,255,223,.96),rgba(49,255,138,.82))!important;color:#031009!important}
    #hushPhase31SaveCorpusEdits[data-save-state="error"]{color:rgba(255,118,104,.98)!important}
  `;
  doc.head.appendChild(style);
}

function ensureModal(doc = document) {
  ensureStyle(doc);
  let modal = byId('hushPhase31EditCorpusModal', doc);
  if (!modal) {
    modal = doc.createElement('div');
    modal.id = 'hushPhase31EditCorpusModal';
    modal.className = 'hush-phase31-modal hush-phase31-edit-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="hush-phase31-modal-card hush-phase31-edit-card"><h3 id="hushPhase31EditCorpusTitle">Edit Customizer Corpus</h3><p class="hush-phase31-edit-note">Samples appear in logged order. Update fields, remove entries, then Save.</p><div id="hushPhase31EditCorpusList" class="hush-phase31-edit-list"></div><div class="hush-phase31-modal-actions"><button id="hushPhase31SaveCorpusEdits" type="button" class="primary-cta">Save</button><button id="hushPhase31CloseCorpusEdit" type="button" class="ghost">Close</button></div><div id="hushPhase31EditCorpusStatus" class="hush-phase31-modal-status"></div></div>';
    doc.body.appendChild(modal);
  }
  doc.querySelector('.hush-phase31-carousel-bar')?.remove();
  return modal;
}

function optionNode(doc, value, selected) {
  const option = doc.createElement('option');
  option.value = value;
  option.textContent = value;
  option.selected = value === selected;
  return option;
}

function label(doc, labelText, control) {
  const node = doc.createElement('label');
  node.append(doc.createTextNode(labelText));
  node.appendChild(control);
  return node;
}

function setSaveState(doc = document, state = '') {
  const button = byId('hushPhase31SaveCorpusEdits', doc);
  if (!button) return;
  button.dataset.saveState = state;
  button.textContent = state === 'saved' ? 'Saved' : 'Save';
  button.disabled = state === 'saving';
}

function rowToSample(row) {
  return normalizeSampleEntry({
    text: row.querySelector('.hush-phase31-edit-text')?.value || '',
    discourseMode: row.querySelector('.hush-phase31-edit-category')?.value || '',
    promptCategory: row.querySelector('.hush-phase31-edit-category')?.value || '',
    retrievalTrigger: row.querySelector('.hush-phase31-edit-context')?.value || '',
    contextLabel: row.querySelector('.hush-phase31-edit-context')?.value || ''
  });
}

function collectRows(doc = document) {
  return Array.from(doc.querySelectorAll('#hushPhase31EditCorpusList .hush-phase31-edit-sample'))
    .map(rowToSample)
    .filter(Boolean);
}

export function renderActiveEditCorpusSample(doc = document) {
  const list = byId('hushPhase31EditCorpusList', doc);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  if (!list) return;
  list.textContent = '';
  setSaveState(doc, '');
  if (status) status.textContent = workingSamples.length ? `Editing ${workingSamples.length} corpus sample${workingSamples.length === 1 ? '' : 's'}.` : 'No logged customizer samples yet.';
  if (!workingSamples.length) {
    const empty = doc.createElement('p');
    empty.className = 'hush-phase31-edit-empty';
    empty.textContent = 'No logged customizer samples yet.';
    list.appendChild(empty);
    return;
  }

  const fragment = doc.createDocumentFragment();
  workingSamples.forEach((sample, index) => {
    const row = doc.createElement('section');
    row.className = 'hush-phase31-edit-sample';
    row.dataset.index = String(index);

    const remove = doc.createElement('button');
    remove.type = 'button';
    remove.className = 'hush-phase31-edit-remove';
    remove.setAttribute('aria-label', `Remove sample ${index + 1}`);
    remove.textContent = '×';

    const area = doc.createElement('textarea');
    area.className = 'hush-phase31-edit-text';
    area.value = sample.text || '';

    const mode = doc.createElement('select');
    mode.className = 'hush-phase31-edit-category';
    const selectedMode = modeValue(sample.discourseMode || sample.promptCategory);
    DISCOURSE_MODES.forEach((value) => mode.appendChild(optionNode(doc, value, selectedMode)));

    const retrieval = doc.createElement('select');
    retrieval.className = 'hush-phase31-edit-context';
    const selectedTrigger = triggerValue(sample.retrievalTrigger || sample.contextLabel);
    RETRIEVAL_TRIGGERS.forEach((value) => retrieval.appendChild(optionNode(doc, value, selectedTrigger)));

    row.appendChild(remove);
    row.appendChild(label(doc, 'Writing sample', area));
    row.appendChild(label(doc, 'Discourse Mode', mode));
    row.appendChild(label(doc, 'Retrieval Trigger', retrieval));
    fragment.appendChild(row);
  });
  list.appendChild(fragment);
}

export function openEditCorpusModal(doc = document) {
  upgradeCustomizerFields(doc);
  const modal = ensureModal(doc);
  workingSamples = readStoredSamples();
  modal.hidden = false;
  requestAnimationFrame(() => renderActiveEditCorpusSample(doc));
}

export function closeEditCorpusModal(doc = document) {
  const modal = byId('hushPhase31EditCorpusModal', doc);
  if (modal) modal.hidden = true;
}

export function pullActiveEditCorpusSample(doc = document) {
  workingSamples = collectRows(doc);
  return workingSamples[0] || null;
}

export function moveEditCorpus(delta, doc = document) {
  pullActiveEditCorpusSample(doc);
  renderActiveEditCorpusSample(doc);
}

function removeRow(event, doc = document) {
  const row = event.target?.closest?.('.hush-phase31-edit-sample');
  if (!row) return;
  row.remove();
  workingSamples = collectRows(doc);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  if (status) status.textContent = `Editing ${workingSamples.length} corpus sample${workingSamples.length === 1 ? '' : 's'}. Save to apply.`;
}

export function saveEditCorpusModal(doc = document) {
  const before = localStorage.getItem(STORAGE_KEY);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  workingSamples = collectRows(doc);
  const expected = workingSamples.map(normalizeSampleEntry).filter(Boolean);
  setSaveState(doc, 'saving');
  writeStoredSamples(expected);
  if (!signaturesMatch(expected)) {
    try {
      if (before === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, before);
    } catch (error) {}
    setSaveState(doc, 'error');
    if (status) status.textContent = 'Save did not verify. Corpus was not changed.';
    return;
  }
  setSaveState(doc, 'saved');
  if (status) status.textContent = `Saved ${expected.length} corpus sample${expected.length === 1 ? '' : 's'}.`;
  window.setTimeout(() => closeEditCorpusModal(doc), 520);
}

function intercept(event, fn) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  fn(event);
}

export function installNativeCorpusCarousel(doc = document) {
  upgradeCustomizerFields(doc);
  ensureStyle(doc);
  if (doc.documentElement?.dataset.td613EditListCaptureV4 === 'true') return;
  if (doc.documentElement) doc.documentElement.dataset.td613EditListCaptureV4 = 'true';
  doc.addEventListener('click', (event) => {
    const target = event.target;
    if (target?.closest?.('#hushPhase31EditCorpus')) return intercept(event, () => openEditCorpusModal(doc));
    if (target?.closest?.('.hush-phase31-edit-remove')) return intercept(event, (clickEvent) => removeRow(clickEvent, doc));
    if (target?.closest?.('#hushPhase31SaveCorpusEdits')) return intercept(event, () => saveEditCorpusModal(doc));
    if (target?.closest?.('#hushPhase31CloseCorpusEdit')) return intercept(event, () => closeEditCorpusModal(doc));
  }, true);
}

export function exposeNativeCorpusCarousel(doc = document) {
  window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__ = {
    version: VERSION,
    openEditCorpusModal,
    closeEditCorpusModal,
    renderActiveEditCorpusSample,
    moveEditCorpus,
    pullActiveEditCorpusSample,
    saveEditCorpusModal,
    readStoredSamples,
    writeStoredSamples,
    installNativeCorpusCarousel,
    upgradeCustomizerFields
  };
  installNativeCorpusCarousel(doc);
}

if (typeof document !== 'undefined') {
  installNativeCorpusCarousel(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installNativeCorpusCarousel(document), { once: true });
  else window.setTimeout(() => installNativeCorpusCarousel(document), 0);
}
