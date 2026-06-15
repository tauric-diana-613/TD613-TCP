const VERSION = 'hush-edit-corpus-open-fallback/v3-nonblocking-modal';
const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';
const DISCOURSE_MODES = ['explanatory','argumentative','narrative','procedural','reflective-affective','legal-forensic','casual-conversational','technical-operational','poetic-symbolic','corrective-repair','compressed-summary'];
const RETRIEVAL_TRIGGERS = ['baseline-voice','high-pressure','failure-recovery','correction-request','disagreement-pushback','implementation-handoff','evidence-framing','boundary-refusal','uncertainty-caveat','deep-explanation','compression-summary','affective-repair','ritual-symbolic','public-facing','private-diagnostic'];

const valueOrFirst = (value = '', options = []) => options.includes(String(value || '').trim()) ? String(value || '').trim() : options[0];
let renderToken = 0;

function installStyle() {
  if (document.getElementById('hushEditCorpusOpenFallbackStyle')) return;
  const style = document.createElement('style');
  style.id = 'hushEditCorpusOpenFallbackStyle';
  style.textContent = `
    #hushPhase31EditCorpusModal[hidden] { display: none !important; }
    #hushPhase31EditCorpusModal .hush-phase31-edit-card {
      display: grid !important;
      grid-template-rows: auto auto minmax(0,1fr) auto auto !important;
      overflow: hidden !important;
      max-height: min(42rem, calc(100dvh - 2.4rem)) !important;
    }
    #hushPhase31EditCorpusModal .hush-phase31-edit-list {
      min-height: 0 !important;
      max-height: min(28rem, calc(100dvh - 14rem)) !important;
      overflow: auto !important;
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch !important;
    }
    #hushPhase31EditCorpusModal .hush-phase31-edit-remove.hush-phase31-edit-remove {
      appearance: none !important;
      -webkit-appearance: none !important;
      position: absolute !important;
      display: inline-grid !important;
      place-items: center !important;
      min-width: 0 !important;
      min-height: 0 !important;
      width: 1rem !important;
      height: 1rem !important;
      padding: 0 !important;
      margin: 0 !important;
      border: 0 !important;
      border-radius: 999px !important;
      background: transparent !important;
      box-shadow: none !important;
      top: .42rem !important;
      right: .48rem !important;
      color: rgba(255,118,104,.94) !important;
      font: 700 .62rem/1 var(--font-mono, ui-monospace, monospace) !important;
      letter-spacing: 0 !important;
      text-transform: none !important;
      transform: none !important;
      cursor: pointer !important;
    }
    #hushPhase31EditCorpusModal .hush-phase31-edit-loading,
    #hushPhase31EditCorpusModal .hush-phase31-edit-empty {
      margin: .4rem 0;
      color: rgba(202,255,223,.78);
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: .62rem;
      letter-spacing: .03em;
    }
    #hushPhase31SaveCorpusEdits[data-save-state="saved"] {
      border-color: rgba(49,255,138,.72) !important;
      background: linear-gradient(135deg, rgba(202,255,223,.96), rgba(49,255,138,.82)) !important;
      color: #031009 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.62), 0 0 22px rgba(49,255,138,.28) !important;
    }
    #hushPhase31SaveCorpusEdits[data-save-state="saving"] { opacity: .72 !important; }
    #hushPhase31SaveCorpusEdits[data-save-state="error"] { color: rgba(255,118,104,.98) !important; }
  `;
  document.head.appendChild(style);
}

function readSamples() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const raw = Array.isArray(parsed.samples) ? parsed.samples : [];
    return raw.map((sample) => {
      const text = String(typeof sample === 'string' ? sample : sample?.text || '').trim();
      if (!text) return null;
      const discourseMode = valueOrFirst(sample?.discourseMode || sample?.promptCategory, DISCOURSE_MODES);
      const retrievalTrigger = valueOrFirst(sample?.retrievalTrigger || sample?.contextLabel, RETRIEVAL_TRIGGERS);
      return { text, promptCategory: discourseMode, discourseMode, contextLabel: retrievalTrigger, retrievalTrigger };
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function writeSamples(samples = []) {
  const clean = samples.map((sample) => {
    const discourseMode = valueOrFirst(sample.discourseMode || sample.promptCategory, DISCOURSE_MODES);
    const retrievalTrigger = valueOrFirst(sample.retrievalTrigger || sample.contextLabel, RETRIEVAL_TRIGGERS);
    return {
      text: String(sample.text || '').trim(),
      promptCategory: discourseMode,
      discourseMode,
      contextLabel: retrievalTrigger,
      retrievalTrigger
    };
  }).filter((sample) => sample.text);
  if (!clean.length) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 'phase31-logged-samples/v2-ontology-fields', updatedAt: new Date().toISOString(), samples: clean }));
  return clean;
}

function optionNode(value, selected) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  option.selected = value === selected;
  return option;
}

function selectNode(className, values, selected) {
  const select = document.createElement('select');
  select.className = className;
  const current = valueOrFirst(selected, values);
  values.forEach((value) => select.appendChild(optionNode(value, current)));
  return select;
}

function labelWithText(labelText, control) {
  const label = document.createElement('label');
  label.append(document.createTextNode(labelText));
  label.appendChild(control);
  return label;
}

function sampleRow(sample, index) {
  const row = document.createElement('section');
  row.className = 'hush-phase31-edit-sample';
  row.dataset.index = String(index);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'hush-phase31-edit-remove';
  remove.setAttribute('aria-label', `Remove sample ${index + 1}`);
  remove.textContent = '×';

  const textArea = document.createElement('textarea');
  textArea.className = 'hush-phase31-edit-text';
  textArea.value = sample.text || '';

  row.appendChild(remove);
  row.appendChild(labelWithText('Writing sample', textArea));
  row.appendChild(labelWithText('Discourse Mode', selectNode('hush-phase31-edit-category', DISCOURSE_MODES, sample.discourseMode || sample.promptCategory)));
  row.appendChild(labelWithText('Retrieval Trigger', selectNode('hush-phase31-edit-context', RETRIEVAL_TRIGGERS, sample.retrievalTrigger || sample.contextLabel)));
  return row;
}

function ensureModal() {
  let modal = document.getElementById('hushPhase31EditCorpusModal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'hushPhase31EditCorpusModal';
  modal.className = 'hush-phase31-modal hush-phase31-edit-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'hushPhase31EditCorpusTitle');
  modal.innerHTML = '<div class="hush-phase31-modal-card hush-phase31-edit-card"><h3 id="hushPhase31EditCorpusTitle">Edit Customizer Corpus</h3><p class="hush-phase31-edit-note">Samples appear in logged order. Remove entries with the coral x, then Save to rebuild the custom corpus.</p><div id="hushPhase31EditCorpusList" class="hush-phase31-edit-list"></div><div class="hush-phase31-modal-actions"><button id="hushPhase31SaveCorpusEdits" type="button" class="primary-cta">Save</button><button id="hushPhase31CloseCorpusEdit" type="button" class="ghost">Close</button></div><div id="hushPhase31EditCorpusStatus" class="hush-phase31-modal-status"></div></div>';
  document.body.appendChild(modal);
  return modal;
}

function renderRowsNonblocking() {
  const token = ++renderToken;
  const modal = ensureModal();
  const list = modal.querySelector('#hushPhase31EditCorpusList');
  const status = modal.querySelector('#hushPhase31EditCorpusStatus');
  const save = modal.querySelector('#hushPhase31SaveCorpusEdits');
  const samples = readSamples();
  if (!list) return;

  list.textContent = '';
  if (save) save.disabled = true;
  if (status) status.textContent = samples.length ? `Loading ${samples.length} corpus samples…` : '';

  if (!samples.length) {
    const empty = document.createElement('p');
    empty.className = 'hush-phase31-edit-empty';
    empty.textContent = 'No logged customizer samples yet.';
    list.appendChild(empty);
    if (save) save.disabled = false;
    return;
  }

  const loading = document.createElement('p');
  loading.className = 'hush-phase31-edit-loading';
  loading.textContent = 'Opening corpus editor…';
  list.appendChild(loading);

  let index = 0;
  const batchSize = 2;
  const step = () => {
    if (token !== renderToken) return;
    const fragment = document.createDocumentFragment();
    let added = 0;
    while (index < samples.length && added < batchSize) {
      fragment.appendChild(sampleRow(samples[index], index));
      index += 1;
      added += 1;
    }
    if (loading.isConnected) loading.remove();
    list.appendChild(fragment);
    if (status) status.textContent = index < samples.length ? `Loaded ${index}/${samples.length} corpus samples…` : `Loaded ${samples.length} corpus samples.`;
    if (index < samples.length) window.setTimeout(step, 0);
    else if (save) save.disabled = false;
  };
  window.requestAnimationFrame(step);
}

function openModalFallback() {
  installStyle();
  const modal = ensureModal();
  modal.hidden = false;
  window.requestAnimationFrame(renderRowsNonblocking);
}

function closeModal() {
  const modal = document.getElementById('hushPhase31EditCorpusModal');
  renderToken += 1;
  if (modal) modal.hidden = true;
}

function rowsToSamples() {
  return Array.from(document.querySelectorAll('#hushPhase31EditCorpusList .hush-phase31-edit-sample')).map((row) => {
    const discourseMode = valueOrFirst(row.querySelector('.hush-phase31-edit-category')?.value, DISCOURSE_MODES);
    const retrievalTrigger = valueOrFirst(row.querySelector('.hush-phase31-edit-context')?.value, RETRIEVAL_TRIGGERS);
    return {
      text: String(row.querySelector('.hush-phase31-edit-text')?.value || '').trim(),
      promptCategory: discourseMode,
      discourseMode,
      contextLabel: retrievalTrigger,
      retrievalTrigger
    };
  }).filter((sample) => sample.text);
}

function verifySaved(expected = []) {
  const stored = readSamples();
  return stored.length === expected.length && expected.every((sample, index) => {
    const saved = stored[index] || {};
    return saved.text === sample.text
      && saved.promptCategory === sample.promptCategory
      && saved.contextLabel === sample.contextLabel;
  });
}

function saveModal() {
  const save = document.getElementById('hushPhase31SaveCorpusEdits');
  const status = document.getElementById('hushPhase31EditCorpusStatus');
  const expected = rowsToSamples();
  if (save?.disabled) return;
  if (save) save.dataset.saveState = 'saving';
  writeSamples(expected);
  if (!verifySaved(expected)) {
    if (save) save.dataset.saveState = 'error';
    if (status) status.textContent = 'Save did not verify. Corpus was not changed.';
    return;
  }
  if (status) status.textContent = `Saved ${expected.length} corpus samples.`;
  if (save) {
    save.dataset.saveState = 'saved';
    save.textContent = 'Saved';
  }
  window.setTimeout(() => {
    closeModal();
    if (save) {
      save.dataset.saveState = '';
      save.textContent = 'Save';
      save.disabled = false;
    }
    location.reload();
  }, 520);
}

function boot() {
  installStyle();
  if (document.documentElement.dataset.td613EditCorpusAssertiveBound === 'true') return;
  document.documentElement.dataset.td613EditCorpusAssertiveBound = 'true';
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#hushPhase31EditCorpus')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openModalFallback();
      return;
    }
    if (event.target?.closest?.('.hush-phase31-edit-remove')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.target.closest('.hush-phase31-edit-sample')?.remove();
      return;
    }
    if (event.target?.closest?.('#hushPhase31CloseCorpusEdit')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeModal();
      return;
    }
    if (event.target?.closest?.('#hushPhase31SaveCorpusEdits')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveModal();
    }
  }, true);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.__TD613_HUSH_EDIT_CORPUS_OPEN_FALLBACK__ = { version: VERSION, openModalFallback, readSamples, writeSamples, saveModal, renderRowsNonblocking };