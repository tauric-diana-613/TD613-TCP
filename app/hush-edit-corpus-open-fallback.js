const VERSION = 'hush-edit-corpus-open-fallback/v1';
const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';
const DISCOURSE_MODES = ['explanatory','argumentative','narrative','procedural','reflective-affective','legal-forensic','casual-conversational','technical-operational','poetic-symbolic','corrective-repair','compressed-summary'];
const RETRIEVAL_TRIGGERS = ['baseline-voice','high-pressure','failure-recovery','correction-request','disagreement-pushback','implementation-handoff','evidence-framing','boundary-refusal','uncertainty-caveat','deep-explanation','compression-summary','affective-repair','ritual-symbolic','public-facing','private-diagnostic'];

const escapeHtml = (value = '') => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const valueOrFirst = (value = '', options = []) => options.includes(String(value || '').trim()) ? String(value || '').trim() : options[0];
const wordCount = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;

function readSamples() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Array.isArray(parsed.samples) ? parsed.samples.filter((sample) => String(sample?.text || '').trim()) : [];
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

function optionsHtml(values, selected = '') {
  const current = valueOrFirst(selected, values);
  return values.map((value) => `<option value="${value}"${value === current ? ' selected' : ''}>${value}</option>`).join('');
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
  modal.innerHTML = `<div class="hush-phase31-modal-card hush-phase31-edit-card"><h3 id="hushPhase31EditCorpusTitle">Edit Customizer Corpus</h3><p class="hush-phase31-edit-note">Samples appear in logged order. Remove entries with the coral x, then Save to rebuild the custom corpus.</p><div id="hushPhase31EditCorpusList" class="hush-phase31-edit-list"></div><div class="hush-phase31-modal-actions"><button id="hushPhase31SaveCorpusEdits" type="button" class="primary-cta">Save</button><button id="hushPhase31CloseCorpusEdit" type="button" class="ghost">Close</button></div><div id="hushPhase31EditCorpusStatus" class="hush-phase31-modal-status"></div></div>`;
  document.body.appendChild(modal);
  return modal;
}

function setLabelText(control, text) {
  const label = control?.closest?.('label');
  if (!label) return;
  const first = label.firstChild;
  if (first?.nodeType === Node.TEXT_NODE) first.textContent = text;
}

function renderRows() {
  const modal = ensureModal();
  const list = modal.querySelector('#hushPhase31EditCorpusList');
  const samples = readSamples();
  list.innerHTML = samples.length ? samples.map((sample, index) => {
    const discourseMode = valueOrFirst(sample.discourseMode || sample.promptCategory, DISCOURSE_MODES);
    const retrievalTrigger = valueOrFirst(sample.retrievalTrigger || sample.contextLabel, RETRIEVAL_TRIGGERS);
    return `<section class="hush-phase31-edit-sample" data-index="${index}"><button type="button" class="hush-phase31-edit-remove" aria-label="Remove sample ${index + 1}">×</button><label>Writing sample<textarea class="hush-phase31-edit-text">${escapeHtml(sample.text || '')}</textarea></label><label>Discourse Mode<select class="hush-phase31-edit-category">${optionsHtml(DISCOURSE_MODES, discourseMode)}</select></label><label>Retrieval Trigger<select class="hush-phase31-edit-context">${optionsHtml(RETRIEVAL_TRIGGERS, retrievalTrigger)}</select></label></section>`;
  }).join('') : '<p class="hush-phase31-edit-empty">No logged customizer samples yet.</p>';
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

function normalizeVisibleRows() {
  document.querySelectorAll('#hushPhase31EditCorpusList .hush-phase31-edit-category').forEach((select) => {
    const current = valueOrFirst(select.value, DISCOURSE_MODES);
    select.innerHTML = optionsHtml(DISCOURSE_MODES, current);
    setLabelText(select, 'Discourse Mode');
  });
  document.querySelectorAll('#hushPhase31EditCorpusList .hush-phase31-edit-context').forEach((control) => {
    if (control.tagName === 'SELECT') {
      const current = valueOrFirst(control.value, RETRIEVAL_TRIGGERS);
      control.innerHTML = optionsHtml(RETRIEVAL_TRIGGERS, current);
      setLabelText(control, 'Retrieval Trigger');
      return;
    }
    const select = document.createElement('select');
    select.className = 'hush-phase31-edit-context';
    select.innerHTML = optionsHtml(RETRIEVAL_TRIGGERS, control.value);
    control.replaceWith(select);
    setLabelText(select, 'Retrieval Trigger');
  });
}

function openModalFallback() {
  const modal = ensureModal();
  const list = modal.querySelector('#hushPhase31EditCorpusList');
  if (modal.hidden || !list?.querySelector('.hush-phase31-edit-sample')) renderRows();
  normalizeVisibleRows();
  modal.hidden = false;
}

function flashSaved(button) {
  if (!button) return;
  button.dataset.saveState = 'saved';
  button.textContent = 'Saved';
  window.setTimeout(() => {
    const modal = document.getElementById('hushPhase31EditCorpusModal');
    if (modal) modal.hidden = true;
    button.dataset.saveState = '';
    button.textContent = 'Save';
    location.reload();
  }, 520);
}

function verifySaved(expected = []) {
  const stored = readSamples();
  return stored.length === expected.length && expected.every((sample, index) => {
    const saved = stored[index] || {};
    return saved.text === sample.text
      && valueOrFirst(saved.discourseMode || saved.promptCategory, DISCOURSE_MODES) === sample.discourseMode
      && valueOrFirst(saved.retrievalTrigger || saved.contextLabel, RETRIEVAL_TRIGGERS) === sample.retrievalTrigger;
  });
}

function boot() {
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#hushPhase31EditCorpus')) {
      window.setTimeout(() => {
        const modal = document.getElementById('hushPhase31EditCorpusModal');
        if (!modal || modal.hidden) openModalFallback();
        else normalizeVisibleRows();
      }, 40);
      window.setTimeout(normalizeVisibleRows, 140);
      return;
    }
    if (event.target?.closest?.('.hush-phase31-edit-remove')) {
      event.target.closest('.hush-phase31-edit-sample')?.remove();
      return;
    }
    if (event.target?.closest?.('#hushPhase31CloseCorpusEdit')) {
      const modal = document.getElementById('hushPhase31EditCorpusModal');
      if (modal) modal.hidden = true;
      return;
    }
    const save = event.target?.closest?.('#hushPhase31SaveCorpusEdits');
    if (save) {
      const expected = rowsToSamples();
      save.dataset.saveState = 'saving';
      window.setTimeout(() => {
        if (!verifySaved(expected)) writeSamples(expected);
        if (verifySaved(expected)) flashSaved(save);
        else save.dataset.saveState = 'error';
      }, 40);
    }
  }, true);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.__TD613_HUSH_EDIT_CORPUS_OPEN_FALLBACK__ = { version: VERSION, openModalFallback, readSamples, writeSamples };
