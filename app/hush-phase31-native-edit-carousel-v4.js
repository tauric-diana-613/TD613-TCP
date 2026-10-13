const VERSION = 'phase-31.1-edit-modal/dropdown-snap-carousel-v7-owner';
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
let activeIndex = 0;

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
  const discourseMode = typeof entry === 'string'
    ? DISCOURSE_MODES[0]
    : modeValue(entry?.discourseMode || entry?.promptCategory || DISCOURSE_MODES[0]);
  const retrievalTrigger = typeof entry === 'string'
    ? RETRIEVAL_TRIGGERS[0]
    : triggerValue(entry?.retrievalTrigger || entry?.contextLabel || RETRIEVAL_TRIGGERS[0]);
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

function signature(samples = []) {
  return JSON.stringify(asArray(samples).map(normalizeSampleEntry).filter(Boolean).map((sample) => ({
    text: sample.text,
    promptCategory: sample.promptCategory,
    contextLabel: sample.contextLabel,
    discourseMode: sample.discourseMode,
    retrievalTrigger: sample.retrievalTrigger
  })));
}

function signaturesMatch(expected = []) {
  return signature(readStoredSamples()) === signature(expected);
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
  if (byId('hushPhase31DropdownCarouselStyle', doc)) return;
  byId('hushPhase31DropdownPagedStyle', doc)?.remove();
  const style = doc.createElement('style');
  style.id = 'hushPhase31DropdownCarouselStyle';
  style.textContent = `
    #hushPhase31EditCorpusModal[hidden]{display:none!important}
    .hush-phase31-edit-card{grid-template-rows:auto auto auto minmax(0,1fr) auto auto!important}
    .hush-phase31-carousel-meta{display:flex;align-items:center;justify-content:flex-end;gap:.34rem;margin:.12rem 0 .56rem}
    .hush-phase31-carousel-count{margin:0;color:rgba(202,255,223,.72);font-family:var(--font-mono,ui-monospace,monospace);font-size:.58rem;letter-spacing:.11em;text-align:right;text-transform:uppercase}
    .hush-phase31-carousel-arrow{display:none!important;appearance:none!important;-webkit-appearance:none!important;align-items:center!important;justify-content:center!important;width:1.34rem!important;height:1.12rem!important;min-width:0!important;min-height:0!important;padding:0!important;border:1px solid rgba(137,255,240,.22)!important;border-radius:8px!important;background:rgba(0,0,0,.18)!important;color:rgba(202,255,223,.82)!important;font:700 .62rem/1 var(--font-mono,ui-monospace,monospace)!important;letter-spacing:0!important;text-transform:none!important;box-shadow:none!important;cursor:pointer!important}
    .hush-phase31-carousel-arrow:hover,.hush-phase31-carousel-arrow:focus-visible{color:#31ff8a!important;border-color:rgba(49,255,138,.48)!important;outline:none!important}
    .hush-phase31-carousel-arrow[disabled]{opacity:.28!important;cursor:not-allowed!important}
    @media (min-width:821px){.hush-phase31-carousel-arrow{display:inline-flex!important}}
    #hushPhase31EditCorpusList{display:flex!important;gap:.68rem!important;min-height:0!important;max-height:min(29rem,calc(100dvh - 14rem))!important;overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-x:contain!important;-webkit-overflow-scrolling:touch!important;scroll-snap-type:x mandatory!important;touch-action:pan-x pan-y!important;padding:.06rem .08rem .74rem!important;scrollbar-width:thin!important}
    .hush-phase31-edit-sample{position:relative;flex:0 0 min(100%,32rem)!important;scroll-snap-align:start!important;scroll-snap-stop:always!important;contain:layout paint!important;padding:.74rem .62rem;margin:0;border:1px solid rgba(202,255,223,.18);border-radius:1rem;background:rgba(4,18,12,.38)}
    .hush-phase31-edit-sample label{display:grid;gap:.35rem;margin:.58rem 0;color:rgba(202,255,223,.86);font-family:var(--font-mono,ui-monospace,monospace);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase}
    .hush-phase31-edit-sample textarea{min-height:10rem!important;resize:vertical!important}
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
    modal.innerHTML = '<div class="hush-phase31-modal-card hush-phase31-edit-card"><h3 id="hushPhase31EditCorpusTitle">Edit Customizer Corpus</h3><p class="hush-phase31-edit-note">Swipe through logged samples. Save writes the full edited corpus back after verification.</p><div class="hush-phase31-carousel-meta"><button id="hushPhase31CarouselPrev" type="button" class="hush-phase31-carousel-arrow" aria-label="Previous sample">&lt;</button><div id="hushPhase31CarouselCount" class="hush-phase31-carousel-count">Sample 0 / 0</div><button id="hushPhase31CarouselNext" type="button" class="hush-phase31-carousel-arrow" aria-label="Next sample">&gt;</button></div><div id="hushPhase31EditCorpusList" class="hush-phase31-edit-list" aria-label="Swipeable corpus sample editor"></div><div class="hush-phase31-modal-actions"><button id="hushPhase31SaveCorpusEdits" type="button" class="primary-cta">Save</button><button id="hushPhase31CloseCorpusEdit" type="button" class="ghost">Close</button></div><div id="hushPhase31EditCorpusStatus" class="hush-phase31-modal-status"></div></div>';
    doc.body.appendChild(modal);
  }
  const list = byId('hushPhase31EditCorpusList', doc);
  if (list) {
    list.dataset.td613CarouselOwned = 'true';
    doc.querySelector('.hush-phase31-carousel-bar')?.remove();
    doc.querySelector('.hush-phase31-paged-nav')?.remove();
    if (!byId('hushPhase31CarouselCount', doc)) {
      list.insertAdjacentHTML('beforebegin', '<div class="hush-phase31-carousel-meta"><button id="hushPhase31CarouselPrev" type="button" class="hush-phase31-carousel-arrow" aria-label="Previous sample">&lt;</button><div id="hushPhase31CarouselCount" class="hush-phase31-carousel-count">Sample 0 / 0</div><button id="hushPhase31CarouselNext" type="button" class="hush-phase31-carousel-arrow" aria-label="Next sample">&gt;</button></div>');
    }
    bindEditModalControls(doc);
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

function rowToSample(row) {
  if (!row) return null;
  return normalizeSampleEntry({
    text: row.querySelector('.hush-phase31-edit-text')?.value || '',
    discourseMode: row.querySelector('.hush-phase31-edit-category')?.value || '',
    promptCategory: row.querySelector('.hush-phase31-edit-category')?.value || '',
    retrievalTrigger: row.querySelector('.hush-phase31-edit-context')?.value || '',
    contextLabel: row.querySelector('.hush-phase31-edit-context')?.value || ''
  });
}

function slideRows(doc = document) {
  return Array.from(doc.querySelectorAll('#hushPhase31EditCorpusList .hush-phase31-edit-sample'));
}

function activeRow(doc = document) {
  const rows = slideRows(doc);
  return rows[Math.max(0, Math.min(activeIndex, rows.length - 1))] || rows[0] || null;
}

function pullRowIntoWorkingSamples(row) {
  const index = Number(row?.dataset?.index);
  if (!Number.isFinite(index) || index < 0) return null;
  const updated = rowToSample(row);
  workingSamples[index] = updated;
  return updated;
}

function pullAllEditCorpusSamples(doc = document) {
  slideRows(doc).forEach(pullRowIntoWorkingSamples);
  return workingSamples.map(normalizeSampleEntry).filter(Boolean);
}

export function pullActiveEditCorpusSample(doc = document) {
  if (!workingSamples.length) return null;
  const updated = pullRowIntoWorkingSamples(activeRow(doc));
  activeIndex = Math.max(0, Math.min(activeIndex, Math.max(0, workingSamples.length - 1)));
  return updated;
}

function setCarouselCount(doc = document) {
  const count = byId('hushPhase31CarouselCount', doc);
  const total = workingSamples.length;
  activeIndex = Math.max(0, Math.min(activeIndex, Math.max(0, total - 1)));
  if (count) count.textContent = total ? `Sample ${activeIndex + 1} / ${total} - swipe samples` : 'Sample 0 / 0';
  const prev = byId('hushPhase31CarouselPrev', doc);
  const next = byId('hushPhase31CarouselNext', doc);
  if (prev) prev.disabled = activeIndex <= 0;
  if (next) next.disabled = !total || activeIndex >= total - 1;
}

function syncCarouselPosition(doc = document) {
  const list = byId('hushPhase31EditCorpusList', doc);
  const rows = slideRows(doc);
  if (!list || !rows.length) {
    activeIndex = 0;
    setCarouselCount(doc);
    return;
  }
  const listRect = list.getBoundingClientRect();
  const targetX = listRect.left + listRect.width / 2;
  let nextIndex = 0;
  let bestDistance = Infinity;
  rows.forEach((row, index) => {
    const rect = row.getBoundingClientRect();
    const distance = Math.abs((rect.left + rect.width / 2) - targetX);
    if (distance < bestDistance) {
      bestDistance = distance;
      nextIndex = index;
    }
  });
  activeIndex = nextIndex;
  setCarouselCount(doc);
}

function buildSampleSlide(doc, sample, index) {
  const row = doc.createElement('section');
  row.className = 'hush-phase31-edit-sample';
  row.dataset.index = String(index);
  row.setAttribute('aria-label', `Corpus sample ${index + 1} of ${workingSamples.length}`);

  const remove = doc.createElement('button');
  remove.type = 'button';
  remove.className = 'hush-phase31-edit-remove';
  remove.setAttribute('aria-label', `Remove sample ${index + 1}`);
  remove.textContent = 'x';

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
  return row;
}

export function renderActiveEditCorpusSample(doc = document) {
  const list = byId('hushPhase31EditCorpusList', doc);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  if (!list) return;
  list.dataset.td613CarouselOwned = 'true';
  list.textContent = '';
  setSaveState(doc, '');
  activeIndex = Math.max(0, Math.min(activeIndex, Math.max(0, workingSamples.length - 1)));
  setCarouselCount(doc);
  if (status) status.textContent = workingSamples.length ? 'Swipe the carousel. Edits stay in the corpus draft until Save.' : 'No logged customizer samples yet.';

  if (!workingSamples.length) {
    const empty = doc.createElement('p');
    empty.className = 'hush-phase31-edit-empty';
    empty.textContent = 'No logged customizer samples yet.';
    list.appendChild(empty);
    return;
  }

  workingSamples.forEach((sample, index) => {
    list.appendChild(buildSampleSlide(doc, sample, index));
  });

  list.scrollLeft = 0;
  bindEditModalControls(doc);
  const raf = doc.defaultView?.requestAnimationFrame || ((fn) => doc.defaultView?.setTimeout ? doc.defaultView.setTimeout(fn, 0) : setTimeout(fn, 0));
  raf(() => syncCarouselPosition(doc));
}

export function openEditCorpusModal(doc = document) {
  upgradeCustomizerFields(doc);
  const modal = ensureModal(doc);
  bindEditModalControls(doc);
  workingSamples = readStoredSamples();
  activeIndex = 0;
  modal.hidden = false;
  const raf = doc.defaultView?.requestAnimationFrame || ((fn) => doc.defaultView?.setTimeout ? doc.defaultView.setTimeout(fn, 0) : setTimeout(fn, 0));
  raf(() => renderActiveEditCorpusSample(doc));
}

export function closeEditCorpusModal(doc = document) {
  const modal = byId('hushPhase31EditCorpusModal', doc);
  if (modal) modal.hidden = true;
}

export function moveEditCorpus(delta, doc = document) {
  pullActiveEditCorpusSample(doc);
  activeIndex = Math.max(0, Math.min(activeIndex + delta, Math.max(0, workingSamples.length - 1)));
  const row = slideRows(doc)[activeIndex];
  if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  setCarouselCount(doc);
}

function removeSampleAt(index, doc = document) {
  pullAllEditCorpusSamples(doc);
  workingSamples.splice(Math.max(0, Math.min(index, Math.max(0, workingSamples.length - 1))), 1);
  activeIndex = Math.max(0, Math.min(activeIndex, Math.max(0, workingSamples.length - 1)));
  renderActiveEditCorpusSample(doc);
}

export function saveEditCorpusModal(doc = document) {
  const before = localStorage.getItem(STORAGE_KEY);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  const expected = pullAllEditCorpusSamples(doc);
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
  window.__TD613_HUSH_PHASE31_CUSTOMIZER__?.refreshFromStoredSamples?.(doc);
  window.setTimeout(() => closeEditCorpusModal(doc), 520);
}

function intercept(event, fn) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  fn();
}

function bindControl(node, key, listener) {
  if (!node || node.dataset?.[key] === 'true') return;
  if (node.dataset) node.dataset[key] = 'true';
  node.addEventListener('click', listener);
}

function bindEditModalControls(doc = document) {
  bindControl(byId('hushPhase31CarouselPrev', doc), 'td613CarouselPrevBound', (event) => intercept(event, () => moveEditCorpus(-1, doc)));
  bindControl(byId('hushPhase31CarouselNext', doc), 'td613CarouselNextBound', (event) => intercept(event, () => moveEditCorpus(1, doc)));
  bindControl(byId('hushPhase31SaveCorpusEdits', doc), 'td613CarouselSaveBound', (event) => intercept(event, () => saveEditCorpusModal(doc)));
  bindControl(byId('hushPhase31CloseCorpusEdit', doc), 'td613CarouselCloseBound', (event) => intercept(event, () => closeEditCorpusModal(doc)));
  bindControl(byId('hushPhase31EditCorpus', doc), 'td613CarouselOpenBound', (event) => intercept(event, () => openEditCorpusModal(doc)));
  const list = byId('hushPhase31EditCorpusList', doc);
  if (!list) return;

  bindControl(list, 'td613CarouselRemoveBound', (event) => {
    const remove = event.target?.closest?.('.hush-phase31-edit-remove');
    if (!remove) return;
    const row = remove.closest('.hush-phase31-edit-sample');
    const index = Number(row?.dataset?.index || activeIndex);
    intercept(event, () => removeSampleAt(index, doc));
  });

  if (list.dataset.td613CarouselInputBound !== 'true') {
    list.dataset.td613CarouselInputBound = 'true';
    const syncRow = (event) => {
      const row = event.target?.closest?.('.hush-phase31-edit-sample');
      if (row) pullRowIntoWorkingSamples(row);
    };
    list.addEventListener('input', syncRow, { passive: true });
    list.addEventListener('change', syncRow);
  }

  if (list.dataset.td613CarouselScrollBound !== 'true') {
    list.dataset.td613CarouselScrollBound = 'true';
    let scheduled = false;
    list.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      const raf = doc.defaultView?.requestAnimationFrame || ((fn) => doc.defaultView?.setTimeout ? doc.defaultView.setTimeout(fn, 0) : setTimeout(fn, 0));
      raf(() => {
        scheduled = false;
        syncCarouselPosition(doc);
      });
    }, { passive: true });
  }
}

export function installNativeCorpusCarousel(doc = document) {
  upgradeCustomizerFields(doc);
  ensureStyle(doc);
  bindEditModalControls(doc);
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
