const VERSION = 'hush-edit-corpus-rescue/v1';
const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';
const DISCOURSE_MODES = [
  ['explanatory', 'explanatory'],
  ['argumentative', 'argumentative'],
  ['narrative', 'narrative'],
  ['procedural', 'procedural'],
  ['reflective-affective', 'reflective-affective'],
  ['legal-forensic', 'legal-forensic'],
  ['casual-conversational', 'casual-conversational'],
  ['technical-operational', 'technical-operational'],
  ['poetic-symbolic', 'poetic-symbolic'],
  ['corrective-repair', 'corrective-repair'],
  ['compressed-summary', 'compressed-summary']
];
const RETRIEVAL_TRIGGERS = [
  ['baseline-voice', 'baseline-voice'],
  ['high-pressure', 'high-pressure'],
  ['failure-recovery', 'failure-recovery'],
  ['correction-request', 'correction-request'],
  ['disagreement-pushback', 'disagreement-pushback'],
  ['implementation-handoff', 'implementation-handoff'],
  ['evidence-framing', 'evidence-framing'],
  ['boundary-refusal', 'boundary-refusal'],
  ['uncertainty-caveat', 'uncertainty-caveat'],
  ['deep-explanation', 'deep-explanation'],
  ['compression-summary', 'compression-summary'],
  ['affective-repair', 'affective-repair'],
  ['ritual-symbolic', 'ritual-symbolic'],
  ['public-facing', 'public-facing'],
  ['private-diagnostic', 'private-diagnostic']
];

const escapeHtml = (value = '') => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const valueOrFirst = (value = '', options = []) => {
  const values = options.map(([entry]) => entry);
  return values.includes(String(value || '').trim()) ? String(value || '').trim() : values[0];
};
const optionsHtml = (options = [], selected = '') => {
  const current = valueOrFirst(selected, options);
  return options.map(([value, label]) => `<option value="${value}"${value === current ? ' selected' : ''}>${label}</option>`).join('');
};

function readSamples() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const raw = Array.isArray(parsed.samples) ? parsed.samples : [];
    return raw.map((sample) => {
      const text = String(typeof sample === 'string' ? sample : sample?.text || '').trim();
      if (!text) return null;
      const discourseMode = valueOrFirst(sample?.discourseMode || sample?.promptCategory, DISCOURSE_MODES);
      const retrievalTrigger = valueOrFirst(sample?.retrievalTrigger || sample?.contextLabel, RETRIEVAL_TRIGGERS);
      return {
        text,
        promptCategory: discourseMode,
        discourseMode,
        contextLabel: retrievalTrigger,
        retrievalTrigger
      };
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function writeSamples(samples = []) {
  const clean = samples.map((sample) => ({
    text: String(sample?.text || '').trim(),
    promptCategory: valueOrFirst(sample?.promptCategory || sample?.discourseMode, DISCOURSE_MODES),
    discourseMode: valueOrFirst(sample?.promptCategory || sample?.discourseMode, DISCOURSE_MODES),
    contextLabel: valueOrFirst(sample?.contextLabel || sample?.retrievalTrigger, RETRIEVAL_TRIGGERS),
    retrievalTrigger: valueOrFirst(sample?.contextLabel || sample?.retrievalTrigger, RETRIEVAL_TRIGGERS)
  })).filter((sample) => sample.text);
  if (!clean.length) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 'phase31-logged-samples/v2-ontology-fields', updatedAt: new Date().toISOString(), samples: clean }));
  return clean;
}

function installStyle() {
  if (document.getElementById('hushEditCorpusRescueStyle')) return;
  const style = document.createElement('style');
  style.id = 'hushEditCorpusRescueStyle';
  style.textContent = `
    #hushPhase31SaveCorpusEdits[data-save-state="saved"] {
      border-color: rgba(49,255,138,.72) !important;
      background: linear-gradient(135deg, rgba(202,255,223,.96), rgba(49,255,138,.82)) !important;
      color: #031009 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.62), 0 0 22px rgba(49,255,138,.28) !important;
    }
    #hushPhase31SaveCorpusEdits[data-save-state="saving"] { opacity: .72 !important; }
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
    #hushPhase31EditCorpusModal .hush-phase31-edit-card {
      display: grid !important;
      grid-template-rows: auto auto minmax(0,1fr) auto auto !important;
      overflow: hidden !important;
    }
    #hushPhase31EditCorpusModal .hush-phase31-edit-list {
      min-height: 0 !important;
      max-height: min(28rem, calc(100dvh - 14rem)) !important;
      overflow: auto !important;
      overscroll-behavior: contain !important;
    }
  `;
  document.head.appendChild(style);
}

function ensureModal() {
  let modal = document.getElementById('hushPhase31EditCorpusModal');
  if (modal) return modal;
  document.body.insertAdjacentHTML('beforeend', `<div id="hushPhase31EditCorpusModal" class="hush-phase31-modal hush-phase31-edit-modal" hidden role="dialog" aria-modal="true" aria-labelledby="hushPhase31EditCorpusTitle">
    <div class="hush-phase31-modal-card hush-phase31-edit-card"><h3 id="hushPhase31EditCorpusTitle">Edit Customizer Corpus</h3>
      <p class="hush-phase31-edit-note">Samples appear in logged order. Remove entries with the coral x, then Save to rebuild the custom corpus.</p>
      <div id="hushPhase31EditCorpusList" class="hush-phase31-edit-list"></div>
      <div class="hush-phase31-modal-actions"><button id="hushPhase31SaveCorpusEdits" type="button" class="primary-cta">Save</button><button id="hushPhase31CloseCorpusEdit" type="button" class="ghost">Close</button></div>
      <div id="hushPhase31EditCorpusStatus" class="hush-phase31-modal-status"></div>
    </div>
  </div>`);
  return document.getElementById('hushPhase31EditCorpusModal');
}

function renderRows() {
  const list = document.getElementById('hushPhase31EditCorpusList');
  if (!list) return;
  const samples = readSamples();
  list.innerHTML = samples.length ? samples.map((sample, index) => `<section class="hush-phase31-edit-sample" data-index="${index}">
    <button type="button" class="hush-phase31-edit-remove" aria-label="Remove sample ${index + 1}">×</button>
    <label>Writing sample<textarea class="hush-phase31-edit-text">${escapeHtml(sample.text)}</textarea></label>
    <label>Discourse Mode<select class="hush-phase31-edit-category">${optionsHtml(DISCOURSE_MODES, sample.discourseMode || sample.promptCategory)}</select></label>
    <label>Retrieval Trigger<select class="hush-phase31-edit-context">${optionsHtml(RETRIEVAL_TRIGGERS, sample.retrievalTrigger || sample.contextLabel)}</select></label>
  </section>`).join('') : '<p class="hush-phase31-edit-empty">No logged customizer samples yet.</p>';
}

function openModal() {
  installStyle();
  const modal = ensureModal();
  renderRows();
  if (modal) modal.hidden = false;
}

function closeModal() {
  const modal = document.getElementById('hushPhase31EditCorpusModal');
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
    return saved.text === sample.text && saved.promptCategory === sample.promptCategory && saved.contextLabel === sample.contextLabel;
  });
}

function saveModal() {
  const button = document.getElementById('hushPhase31SaveCorpusEdits');
  const status = document.getElementById('hushPhase31EditCorpusStatus');
  const next = rowsToSamples();
  if (button) button.dataset.saveState = 'saving';
  writeSamples(next);
  const saved = verifySaved(next);
  if (!saved) {
    if (button) button.dataset.saveState = 'error';
    if (status) status.textContent = 'Save did not verify. Corpus was not changed.';
    return;
  }
  if (status) status.textContent = `Saved ${next.length} corpus samples.`;
  if (button) {
    button.dataset.saveState = 'saved';
    button.textContent = 'Saved';
  }
  window.setTimeout(() => {
    closeModal();
    if (button) {
      button.dataset.saveState = '';
      button.textContent = 'Save';
    }
    window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__?.restoreCustomizerCockpit?.();
  }, 520);
}

function bind() {
  installStyle();
  if (document.documentElement.dataset.td613EditCorpusRescueBound === 'true') return;
  document.documentElement.dataset.td613EditCorpusRescueBound = 'true';
  document.addEventListener('click', (event) => {
    const edit = event.target?.closest?.('#hushPhase31EditCorpus');
    if (edit) {
      window.setTimeout(() => {
        const modal = document.getElementById('hushPhase31EditCorpusModal');
        if (!modal || modal.hidden) openModal();
      }, 80);
      return;
    }
    if (event.target?.closest?.('#hushPhase31CloseCorpusEdit')) {
      closeModal();
      return;
    }
    const remove = event.target?.closest?.('.hush-phase31-edit-remove');
    if (remove) {
      remove.closest('.hush-phase31-edit-sample')?.remove();
      return;
    }
    if (event.target?.closest?.('#hushPhase31SaveCorpusEdits')) {
      window.setTimeout(() => {
        const modal = document.getElementById('hushPhase31EditCorpusModal');
        const button = document.getElementById('hushPhase31SaveCorpusEdits');
        if (modal && !modal.hidden && button?.dataset.saveState !== 'saved') saveModal();
      }, 30);
    }
  }, true);
}

function boot() { bind(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('td613:hush:core-ready', boot, { once: true });
window.__TD613_HUSH_EDIT_CORPUS_RESCUE__ = { version: VERSION, openModal, closeModal, renderRows, saveModal };
