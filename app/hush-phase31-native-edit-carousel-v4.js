const VERSION = 'phase-31.1-edit-modal/simple-text-context-v4';
const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';
const DISCOURSE_MODES = ['explanatory','argumentative','narrative','procedural','reflective-affective','legal-forensic','casual-conversational','technical-operational','poetic-symbolic','corrective-repair','compressed-summary'];
const MODE_ALIASES = new Map([
  ['reflective', 'reflective-affective'],
  ['casual', 'casual-conversational'],
  ['technical', 'technical-operational'],
  ['repair', 'corrective-repair'],
  ['uncategorized', 'explanatory']
]);

let workingSamples = [];
let activeIndex = 0;

const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);
const asArray = (value) => Array.isArray(value) ? value : [];

function modeValue(value) {
  const raw = text(value);
  const mapped = MODE_ALIASES.get(raw) || raw;
  return DISCOURSE_MODES.includes(mapped) ? mapped : DISCOURSE_MODES[0];
}

function normalizeSampleEntry(entry) {
  const body = typeof entry === 'string' ? entry : String(entry?.text ?? '');
  if (!text(body)) return null;
  const discourseMode = typeof entry === 'string' ? DISCOURSE_MODES[0] : modeValue(entry?.discourseMode || entry?.promptCategory || DISCOURSE_MODES[0]);
  const retrievalTrigger = typeof entry === 'string' ? '' : text(entry?.retrievalTrigger || entry?.contextLabel || '');
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
    if (clean.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 'phase31-logged-samples/v1', updatedAt: new Date().toISOString(), samples: clean }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
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

export function upgradeCustomizerFields(doc = document) {
  const mode = byId('hushPhase31SampleCategory', doc);
  if (mode?.tagName === 'SELECT') {
    const selected = modeValue(mode.value);
    mode.textContent = '';
    DISCOURSE_MODES.forEach((value) => {
      const option = doc.createElement('option');
      option.value = value;
      option.textContent = value;
      option.selected = value === selected;
      mode.appendChild(option);
    });
    const modeLabel = doc.querySelector('label[for="hushPhase31SampleCategory"] span');
    if (modeLabel) modeLabel.textContent = 'Discourse Mode';
  }

  const existing = byId('hushPhase31ContextLabel', doc);
  if (existing && existing.tagName !== 'INPUT') {
    const input = doc.createElement('input');
    input.id = 'hushPhase31ContextLabel';
    input.autocomplete = 'off';
    input.placeholder = 'retrieval trigger / pressure note';
    input.value = text(existing.value || existing.getAttribute('value') || '');
    existing.replaceWith(input);
  }
  const triggerLabel = doc.querySelector('label[for="hushPhase31ContextLabel"] span');
  if (triggerLabel) triggerLabel.textContent = 'Retrieval Trigger';
}

function ensureStyle(doc = document) {
  if (byId('hushPhase31SimpleEditStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPhase31SimpleEditStyle';
  style.textContent = `
    #hushPhase31EditCorpusModal[hidden]{display:none!important}
    .hush-phase31-carousel-bar{display:flex;align-items:center;justify-content:space-between;gap:.55rem;margin:.48rem 0 .64rem}
    .hush-phase31-carousel-count{flex:1;text-align:center;color:rgba(202,255,223,.78);font-family:var(--font-mono,ui-monospace,monospace);font-size:.58rem;letter-spacing:.11em;text-transform:uppercase}
    .hush-phase31-carousel-nav[disabled]{opacity:.38!important;cursor:not-allowed!important;transform:none!important}
    #hushPhase31EditCorpusList{min-height:0!important;max-height:min(28rem,calc(100dvh - 15rem))!important;overflow:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}
    .hush-phase31-edit-sample{position:relative}
    .hush-phase31-edit-sample label{display:grid;gap:.35rem;margin:.62rem 0}
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
    modal.innerHTML = '<div class="hush-phase31-modal-card hush-phase31-edit-card"><h3 id="hushPhase31EditCorpusTitle">Edit Customizer Corpus</h3><p class="hush-phase31-edit-note">Simple editor mode: one sample at a time.</p><div id="hushPhase31EditCorpusList" class="hush-phase31-edit-list"></div><div class="hush-phase31-modal-actions"><button id="hushPhase31SaveCorpusEdits" type="button" class="primary-cta">Save</button><button id="hushPhase31CloseCorpusEdit" type="button" class="ghost">Close</button></div><div id="hushPhase31EditCorpusStatus" class="hush-phase31-modal-status"></div></div>';
    doc.body.appendChild(modal);
  }
  const list = byId('hushPhase31EditCorpusList', doc);
  if (list && !byId('hushPhase31CarouselCount', doc)) {
    list.insertAdjacentHTML('beforebegin', '<div class="hush-phase31-carousel-bar"><button id="hushPhase31PrevSample" type="button" class="ghost hush-phase31-carousel-nav">Previous</button><span id="hushPhase31CarouselCount" class="hush-phase31-carousel-count">Sample 0 of 0</span><button id="hushPhase31NextSample" type="button" class="ghost hush-phase31-carousel-nav">Next</button></div>');
  }
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

export function renderActiveEditCorpusSample(doc = document) {
  const list = byId('hushPhase31EditCorpusList', doc);
  const count = byId('hushPhase31CarouselCount', doc);
  const prev = byId('hushPhase31PrevSample', doc);
  const next = byId('hushPhase31NextSample', doc);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  if (!list) return;
  list.textContent = '';
  const total = workingSamples.length;
  activeIndex = Math.max(0, Math.min(activeIndex, Math.max(0, total - 1)));
  if (count) count.textContent = total ? `Sample ${activeIndex + 1} of ${total}` : 'Sample 0 of 0';
  if (prev) prev.disabled = activeIndex <= 0;
  if (next) next.disabled = !total || activeIndex >= total - 1;
  if (status) status.textContent = total ? 'Editing one sample. Save writes changes.' : 'No logged customizer samples yet.';
  setSaveState(doc, '');
  if (!total) {
    const empty = doc.createElement('p');
    empty.className = 'hush-phase31-edit-empty';
    empty.textContent = 'No logged customizer samples yet.';
    list.appendChild(empty);
    return;
  }

  const sample = workingSamples[activeIndex];
  const row = doc.createElement('section');
  row.className = 'hush-phase31-edit-sample';

  const remove = doc.createElement('button');
  remove.type = 'button';
  remove.className = 'hush-phase31-edit-remove';
  remove.setAttribute('aria-label', `Remove sample ${activeIndex + 1}`);
  remove.textContent = '×';

  const area = doc.createElement('textarea');
  area.className = 'hush-phase31-edit-text';
  area.value = sample.text || '';

  const mode = doc.createElement('select');
  mode.className = 'hush-phase31-edit-category';
  const selectedMode = modeValue(sample.discourseMode || sample.promptCategory);
  DISCOURSE_MODES.forEach((value) => mode.appendChild(optionNode(doc, value, selectedMode)));

  const retrieval = doc.createElement('input');
  retrieval.className = 'hush-phase31-edit-context';
  retrieval.autocomplete = 'off';
  retrieval.placeholder = 'retrieval trigger / pressure note';
  retrieval.value = text(sample.retrievalTrigger || sample.contextLabel || '');

  row.appendChild(remove);
  row.appendChild(label(doc, 'Writing sample', area));
  row.appendChild(label(doc, 'Discourse Mode', mode));
  row.appendChild(label(doc, 'Retrieval Trigger', retrieval));
  list.appendChild(row);
}

export function openEditCorpusModal(doc = document) {
  upgradeCustomizerFields(doc);
  const modal = ensureModal(doc);
  workingSamples = readStoredSamples();
  activeIndex = 0;
  modal.hidden = false;
  requestAnimationFrame(() => renderActiveEditCorpusSample(doc));
}

export function closeEditCorpusModal(doc = document) {
  const modal = byId('hushPhase31EditCorpusModal', doc);
  if (modal) modal.hidden = true;
}

export function pullActiveEditCorpusSample(doc = document) {
  if (!workingSamples.length) return null;
  const row = doc.querySelector('#hushPhase31EditCorpusList .hush-phase31-edit-sample');
  if (!row) return null;
  const updated = normalizeSampleEntry({
    text: row.querySelector('.hush-phase31-edit-text')?.value || '',
    discourseMode: row.querySelector('.hush-phase31-edit-category')?.value || '',
    promptCategory: row.querySelector('.hush-phase31-edit-category')?.value || '',
    retrievalTrigger: row.querySelector('.hush-phase31-edit-context')?.value || '',
    contextLabel: row.querySelector('.hush-phase31-edit-context')?.value || ''
  });
  if (updated) workingSamples[activeIndex] = updated;
  else workingSamples.splice(activeIndex, 1);
  activeIndex = Math.max(0, Math.min(activeIndex, Math.max(0, workingSamples.length - 1)));
  return updated;
}

export function moveEditCorpus(delta, doc = document) {
  pullActiveEditCorpusSample(doc);
  activeIndex = Math.max(0, Math.min(activeIndex + delta, Math.max(0, workingSamples.length - 1)));
  renderActiveEditCorpusSample(doc);
}

function removeActive(doc = document) {
  workingSamples.splice(activeIndex, 1);
  activeIndex = Math.max(0, Math.min(activeIndex, Math.max(0, workingSamples.length - 1)));
  renderActiveEditCorpusSample(doc);
}

export function saveEditCorpusModal(doc = document) {
  const before = localStorage.getItem(STORAGE_KEY);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  pullActiveEditCorpusSample(doc);
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
  fn();
}

export function installNativeCorpusCarousel(doc = document) {
  upgradeCustomizerFields(doc);
  ensureStyle(doc);
  if (doc.documentElement?.dataset.td613SimpleEditCaptureV4 === 'true') return;
  if (doc.documentElement) doc.documentElement.dataset.td613SimpleEditCaptureV4 = 'true';
  doc.addEventListener('click', (event) => {
    const target = event.target;
    if (target?.closest?.('#hushPhase31EditCorpus')) return intercept(event, () => openEditCorpusModal(doc));
    if (target?.closest?.('#hushPhase31PrevSample')) return intercept(event, () => moveEditCorpus(-1, doc));
    if (target?.closest?.('#hushPhase31NextSample')) return intercept(event, () => moveEditCorpus(1, doc));
    if (target?.closest?.('.hush-phase31-edit-remove')) return intercept(event, () => removeActive(doc));
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
