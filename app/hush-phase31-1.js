import * as nativePhase311 from './hush-phase31-1-original.js';

const VERSION = 'phase-31.1-native-edit-corpus-carousel-gate';
const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';
const MIN_SAMPLE_WORDS = 75;
const RIGOROUS_WORDS = 3000;
const PROVISIONAL_SAMPLES = 12;
const OPERATIONAL_SAMPLES = 24;
const RIGOROUS_SAMPLES = 40;
const PROVISIONAL_WORDS = 900;
const OPERATIONAL_WORDS = 1800;
const RIGOROUS_PROMPT_CATEGORIES = 5;
const DISCOURSE_MODES = Object.freeze([
  'explanatory',
  'argumentative',
  'narrative',
  'procedural',
  'reflective-affective',
  'legal-forensic',
  'casual-conversational',
  'technical-operational',
  'poetic-symbolic',
  'corrective-repair',
  'compressed-summary'
]);
const RETRIEVAL_TRIGGERS = Object.freeze([
  'baseline-voice',
  'high-pressure',
  'failure-recovery',
  'correction-request',
  'disagreement-pushback',
  'implementation-handoff',
  'evidence-framing',
  'boundary-refusal',
  'uncertainty-caveat',
  'deep-explanation',
  'compression-summary',
  'affective-repair',
  'ritual-symbolic',
  'public-facing',
  'private-diagnostic'
]);
const DISCOURSE_ALIASES = Object.freeze({
  reflective: 'reflective-affective',
  casual: 'casual-conversational',
  technical: 'technical-operational',
  repair: 'corrective-repair',
  'legal / forensic': 'legal-forensic',
  'casual / conversational': 'casual-conversational',
  'technical / operational': 'technical-operational',
  'poetic / symbolic': 'poetic-symbolic',
  'repair / correction': 'corrective-repair'
});

let editCorpusWorkingSamples = [];
let editCorpusIndex = 0;

const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const asArray = (value) => Array.isArray(value) ? value : [];

function optionValue(value, options, aliases = {}) {
  const raw = text(value);
  const normalized = aliases[raw] || raw;
  return options.includes(normalized) ? normalized : options[0];
}

function discourseModeFor(entry = {}) {
  return optionValue(entry?.discourseMode || entry?.promptCategory || entry?.contextLabel, DISCOURSE_MODES, DISCOURSE_ALIASES);
}

function retrievalTriggerFor(entry = {}) {
  return optionValue(entry?.retrievalTrigger || entry?.contextLabel, RETRIEVAL_TRIGGERS);
}

function normalizeSampleEntry(entry) {
  const body = typeof entry === 'string' ? entry : String(entry?.text ?? '');
  if (!text(body)) return null;
  if (typeof entry === 'string') {
    return {
      text: body,
      promptCategory: DISCOURSE_MODES[0],
      contextLabel: RETRIEVAL_TRIGGERS[0],
      discourseMode: DISCOURSE_MODES[0],
      retrievalTrigger: RETRIEVAL_TRIGGERS[0]
    };
  }
  const discourseMode = discourseModeFor(entry);
  const retrievalTrigger = retrievalTriggerFor(entry);
  return {
    text: body,
    promptCategory: discourseMode,
    contextLabel: retrievalTrigger,
    discourseMode,
    retrievalTrigger
  };
}

function readStoredSamples() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return asArray(parsed.samples).map(normalizeSampleEntry).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function writeStoredSamples(nextSamples = []) {
  const clean = asArray(nextSamples).map(normalizeSampleEntry).filter(Boolean);
  try {
    if (!clean.length) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 'phase31-logged-samples/v1',
      updatedAt: new Date().toISOString(),
      samples: clean
    }));
  } catch (error) {}
  return clean;
}

function corpusSignature(nextSamples = []) {
  return JSON.stringify(asArray(nextSamples).map(normalizeSampleEntry).filter(Boolean).map((sample) => ({
    text: sample.text,
    promptCategory: sample.promptCategory,
    contextLabel: sample.contextLabel,
    discourseMode: sample.discourseMode,
    retrievalTrigger: sample.retrievalTrigger
  })));
}

function verifyStoredSamples(expected = []) {
  return corpusSignature(readStoredSamples()) === corpusSignature(expected);
}

function readinessFor(nextSamples = []) {
  const clean = asArray(nextSamples).map(normalizeSampleEntry).filter(Boolean);
  const acceptedWords = clean.reduce((sum, sample) => sum + words(sample.text), 0);
  const acceptedSampleCount = clean.filter((sample) => words(sample.text) >= MIN_SAMPLE_WORDS).length;
  const promptCategoryCount = new Set(clean.map((sample) => sample.discourseMode || sample.promptCategory)).size;
  const generationAllowed = acceptedSampleCount >= OPERATIONAL_SAMPLES && acceptedWords >= OPERATIONAL_WORDS;
  const status = acceptedSampleCount >= RIGOROUS_SAMPLES && acceptedWords >= RIGOROUS_WORDS && promptCategoryCount >= RIGOROUS_PROMPT_CATEGORIES
    ? 'rigorous'
    : generationAllowed
      ? 'operational'
      : acceptedSampleCount >= PROVISIONAL_SAMPLES && acceptedWords >= PROVISIONAL_WORDS
        ? 'provisional'
        : clean.length
          ? 'corpus-building'
          : 'empty';
  return {
    status,
    acceptedSampleCount,
    acceptedWords,
    promptCategoryCount,
    readinessScore: Math.min(1, Math.max(acceptedSampleCount / RIGOROUS_SAMPLES, acceptedWords / RIGOROUS_WORDS)),
    generationAllowed
  };
}

function createMask(nextSamples = []) {
  const clean = asArray(nextSamples).map(normalizeSampleEntry).filter(Boolean);
  const readiness = readinessFor(clean);
  return clean.length ? {
    version: 'phase31-light-custom-mask/v1',
    id: 'custom-unsaved-phase31-1',
    label: 'Unsaved Custom Mask',
    name: 'Unsaved Custom Mask',
    source: 'custom-unsaved-phase31-light',
    samples: clean,
    sampleCount: clean.length,
    acceptedSampleCount: readiness.acceptedSampleCount,
    acceptedWords: readiness.acceptedWords,
    profileStatus: readiness.status,
    corpusReadiness: readiness,
    sampleSeed: clean.map((sample) => sample.text).join('\n\n')
  } : null;
}

function formatStatus(status = 'empty') {
  return status.replace(/-/g, ' ').toUpperCase();
}

function setTierState(id, passed, doc = document) {
  const node = byId(id, doc);
  if (node) node.dataset.state = passed ? 'passed' : 'pending';
}

function updateCapsule(mask, doc = document) {
  const node = byId('hushCustomMaskCapsuleName', doc);
  if (node) node.textContent = mask ? 'Custom Mask Empty' : 'Custom Mask Empty';
  window.__TD613_HUSH_PHASE32__?.renderCustomMaskCapsule?.(doc);
  window.__TD613_HUSH_HOUSEKEEPING__?.ensureCustomMaskCapsule?.();
}

function syncBench(mask, nextSamples = [], doc = document) {
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const state = bench.benchState || {};
  const ref = byId('maskReferenceInput', doc);
  if (mask) {
    state.activeCustomMask = mask;
    state.selectedHushMask = mask;
    state.selectedHushMaskId = mask.id;
    if (ref) ref.value = nextSamples.map((sample) => sample.text).filter(Boolean).join('\n\n') || mask.sampleSeed || '';
  } else {
    state.activeCustomMask = null;
    if (ref) ref.value = '';
  }
  if (typeof bench.renderHushMaskProfile === 'function') bench.renderHushMaskProfile();
  if (typeof bench.renderHushProfileMatch === 'function') bench.renderHushProfileMatch(null);
  updateCapsule(mask, doc);
}

function renderLedger(nextSamples = readStoredSamples(), doc = document) {
  const mask = createMask(nextSamples);
  const readiness = mask?.corpusReadiness || { status: 'empty', acceptedSampleCount: 0, acceptedWords: 0, promptCategoryCount: 0, readinessScore: 0 };
  const count = byId('hushPhase31SampleCount', doc);
  const accepted = byId('hushPhase31AcceptedCount', doc);
  const wordsNode = byId('hushPhase31WordCount', doc);
  const catNode = byId('hushPhase31CategoryCount', doc);
  const status = byId('hushPhase31SampleStatus', doc);
  const profile = byId('hushPhase31ProfileStatus', doc);
  const corpusStatus = byId('hushPhase31CorpusStatus', doc);
  const corpusWords = byId('hushPhase31CorpusWords', doc);
  const fill = byId('hushPhase31CorpusFill', doc);
  const undo = byId('hushPhase31Undo', doc);
  if (count) count.textContent = String(nextSamples.length);
  if (accepted) accepted.textContent = String(readiness.acceptedSampleCount || 0);
  if (wordsNode) wordsNode.textContent = String(readiness.acceptedWords || 0);
  if (catNode) catNode.textContent = String(readiness.promptCategoryCount || 0);
  if (undo) undo.setAttribute('aria-disabled', nextSamples.length ? 'false' : 'true');
  if (fill) fill.style.width = `${Math.round((readiness.readinessScore || 0) * 100)}%`;
  if (corpusStatus) corpusStatus.textContent = formatStatus(readiness.status || 'empty');
  if (corpusWords) corpusWords.textContent = `${readiness.acceptedWords || 0} / ${RIGOROUS_WORDS} words`;
  setTierState('hushPhase31TierProvisional', (readiness.acceptedSampleCount || 0) >= PROVISIONAL_SAMPLES && (readiness.acceptedWords || 0) >= PROVISIONAL_WORDS, doc);
  setTierState('hushPhase31TierOperational', (readiness.acceptedSampleCount || 0) >= OPERATIONAL_SAMPLES && (readiness.acceptedWords || 0) >= OPERATIONAL_WORDS, doc);
  setTierState('hushPhase31TierRigorous', readiness.status === 'rigorous', doc);
  if (status) {
    if (!nextSamples.length) status.textContent = 'Corpus empty. Add 75+ word samples to begin.';
    else if (readiness.status === 'corpus-building') status.textContent = `Corpus building: ${readiness.acceptedSampleCount}/${PROVISIONAL_SAMPLES} accepted samples · ${readiness.acceptedWords}/${PROVISIONAL_WORDS} words to provisional.`;
    else if (readiness.status === 'provisional') status.textContent = `Provisional mask: useful for preview only. Operational requires ${OPERATIONAL_SAMPLES} samples and ${OPERATIONAL_WORDS} words.`;
    else if (readiness.status === 'operational') status.textContent = `Operational mask: generation allowed with corpus limitations. Rigorous requires ${RIGOROUS_SAMPLES} samples, ${RIGOROUS_WORDS} words, and 5 contexts.`;
    else status.textContent = `Rigorous mask candidate: ${readiness.acceptedSampleCount} samples · ${readiness.acceptedWords} words · ${readiness.promptCategoryCount} contexts.`;
  }
  if (profile) profile.textContent = mask ? `${formatStatus(mask.profileStatus)} · ${mask.acceptedWords || 0} words` : 'empty';
  updateCapsule(mask, doc);
}

function installStyle(doc = document) {
  if (byId('hushPhase31NativeCarouselStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPhase31NativeCarouselStyle';
  style.textContent = `
    .hush-phase31-carousel-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .55rem;
      margin: .48rem 0 .64rem;
    }
    .hush-phase31-carousel-count {
      flex: 1;
      text-align: center;
      color: rgba(202,255,223,.78);
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: .58rem;
      letter-spacing: .11em;
      text-transform: uppercase;
    }
    .hush-phase31-carousel-nav[disabled] {
      opacity: .38 !important;
      cursor: not-allowed !important;
      transform: none !important;
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
  doc.head.appendChild(style);
}

function optionNode(value, selected) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  option.selected = value === selected;
  return option;
}

function selectNode(className, options, selected) {
  const select = document.createElement('select');
  select.className = className;
  options.forEach((value) => select.appendChild(optionNode(value, selected)));
  return select;
}

function labeledControl(labelText, control) {
  const label = document.createElement('label');
  label.append(document.createTextNode(labelText));
  label.appendChild(control);
  return label;
}

function setEditSaveState(doc = document, state = '') {
  const button = byId('hushPhase31SaveCorpusEdits', doc);
  if (!button) return;
  button.dataset.saveState = state;
  button.disabled = state === 'saving';
  button.textContent = state === 'saved' ? 'Saved' : 'Save';
}

function ensureCarouselChrome(doc = document) {
  installStyle(doc);
  const modal = byId('hushPhase31EditCorpusModal', doc);
  const list = byId('hushPhase31EditCorpusList', doc);
  if (!modal || !list) return modal;
  if (!byId('hushPhase31CarouselCount', doc)) {
    list.insertAdjacentHTML('beforebegin', `
      <div class="hush-phase31-carousel-bar">
        <button id="hushPhase31PrevSample" type="button" class="ghost hush-phase31-carousel-nav">Previous</button>
        <span id="hushPhase31CarouselCount" class="hush-phase31-carousel-count">Sample 0 of 0</span>
        <button id="hushPhase31NextSample" type="button" class="ghost hush-phase31-carousel-nav">Next</button>
      </div>`);
  }
  return modal;
}

function renderActiveEditCorpusSample(doc = document) {
  const list = byId('hushPhase31EditCorpusList', doc);
  const count = byId('hushPhase31CarouselCount', doc);
  const prev = byId('hushPhase31PrevSample', doc);
  const next = byId('hushPhase31NextSample', doc);
  const status = byId('hushPhase31EditCorpusStatus', doc);
  if (!list) return;
  list.textContent = '';
  const total = editCorpusWorkingSamples.length;
  if (editCorpusIndex >= total) editCorpusIndex = Math.max(0, total - 1);
  if (count) count.textContent = total ? `Sample ${editCorpusIndex + 1} of ${total}` : 'Sample 0 of 0';
  if (prev) prev.disabled = editCorpusIndex <= 0;
  if (next) next.disabled = !total || editCorpusIndex >= total - 1;
  setEditSaveState(doc, '');
  if (status) status.textContent = total ? 'Edits stay in working memory until Save.' : 'No logged customizer samples yet.';
  if (!total) {
    const empty = doc.createElement('p');
    empty.className = 'hush-phase31-edit-empty';
    empty.textContent = 'No logged customizer samples yet.';
    list.appendChild(empty);
    return;
  }
  const sample = editCorpusWorkingSamples[editCorpusIndex];
  const row = doc.createElement('section');
  row.className = 'hush-phase31-edit-sample';
  row.dataset.index = String(editCorpusIndex);
  const remove = doc.createElement('button');
  remove.type = 'button';
  remove.className = 'hush-phase31-edit-remove';
  remove.setAttribute('aria-label', `Remove sample ${editCorpusIndex + 1}`);
  remove.textContent = '×';
  const area = doc.createElement('textarea');
  area.className = 'hush-phase31-edit-text';
  area.value = sample.text || '';
  row.appendChild(remove);
  row.appendChild(labeledControl('Writing sample', area));
  row.appendChild(labeledControl('Discourse Mode', selectNode('hush-phase31-edit-category', DISCOURSE_MODES, sample.discourseMode || sample.promptCategory)));
  row.appendChild(labeledControl('Retrieval Trigger', selectNode('hush-phase31-edit-context', RETRIEVAL_TRIGGERS, sample.retrievalTrigger || sample.contextLabel)));
  list.appendChild(row);
}

function openEditCorpusModal(doc = document) {
  editCorpusWorkingSamples = readStoredSamples();
  editCorpusIndex = 0;
  const modal = ensureCarouselChrome(doc);
  if (modal) modal.hidden = false;
  requestAnimationFrame(() => renderActiveEditCorpusSample(doc));
}

function closeEditCorpusModal(doc = document) {
  const modal = byId('hushPhase31EditCorpusModal', doc);
  if (modal) modal.hidden = true;
}

function pullActiveEditCorpusSample(doc = document) {
  if (!editCorpusWorkingSamples.length) return null;
  const row = doc.querySelector('#hushPhase31EditCorpusList .hush-phase31-edit-sample');
  if (!row) return null;
  const discourseMode = optionValue(row.querySelector('.hush-phase31-edit-category')?.value || '', DISCOURSE_MODES);
  const retrievalTrigger = optionValue(row.querySelector('.hush-phase31-edit-context')?.value || '', RETRIEVAL_TRIGGERS);
  const updated = normalizeSampleEntry({
    text: row.querySelector('.hush-phase31-edit-text')?.value || '',
    promptCategory: discourseMode,
    contextLabel: retrievalTrigger,
    discourseMode,
    retrievalTrigger
  });
  if (updated) editCorpusWorkingSamples[editCorpusIndex] = updated;
  else editCorpusWorkingSamples.splice(editCorpusIndex, 1);
  if (editCorpusIndex >= editCorpusWorkingSamples.length) editCorpusIndex = Math.max(0, editCorpusWorkingSamples.length - 1);
  return updated;
}

function moveEditCorpus(delta, doc = document) {
  pullActiveEditCorpusSample(doc);
  editCorpusIndex = Math.max(0, Math.min(editCorpusIndex + delta, editCorpusWorkingSamples.length - 1));
  renderActiveEditCorpusSample(doc);
}

function removeActiveEditCorpusSample(event, doc = document) {
  const button = event?.target?.closest?.('.hush-phase31-edit-remove');
  if (!button) return;
  editCorpusWorkingSamples.splice(editCorpusIndex, 1);
  if (editCorpusIndex >= editCorpusWorkingSamples.length) editCorpusIndex = Math.max(0, editCorpusWorkingSamples.length - 1);
  renderActiveEditCorpusSample(doc);
}

function saveEditCorpusModal(doc = document) {
  const status = byId('hushPhase31EditCorpusStatus', doc);
  const beforeRaw = localStorage.getItem(STORAGE_KEY);
  pullActiveEditCorpusSample(doc);
  const expected = editCorpusWorkingSamples.map(normalizeSampleEntry).filter(Boolean);
  setEditSaveState(doc, 'saving');
  writeStoredSamples(expected);
  if (!verifyStoredSamples(expected)) {
    try {
      if (beforeRaw === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, beforeRaw);
    } catch (error) {}
    setEditSaveState(doc, 'error');
    if (status) status.textContent = 'Save did not verify. Corpus was not changed.';
    return;
  }
  const saved = readStoredSamples();
  const mask = createMask(saved);
  window.__TD613_HUSH_PHASE31_CUSTOMIZER__?.rehydrateStoredSamples?.({ force: true });
  syncBench(mask, saved, doc);
  renderLedger(saved, doc);
  setEditSaveState(doc, 'saved');
  if (status) status.textContent = `Saved ${saved.length} corpus sample${saved.length === 1 ? '' : 's'}.`;
  window.setTimeout(() => closeEditCorpusModal(doc), 520);
}

function intercept(event, handler) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  handler(event);
}

function bindOnce(node, type, key, listener, options) {
  if (!node || node.dataset?.[key] === 'true') return;
  if (node.dataset) node.dataset[key] = 'true';
  node.addEventListener(type, listener, options);
}

function installNativeCorpusCarousel(doc = document) {
  ensureCarouselChrome(doc);
  bindOnce(byId('hushPhase31EditCorpus', doc), 'click', 'td613Phase31NativeCarouselEditCorpusBound', (event) => intercept(event, () => openEditCorpusModal(doc)), true);
  bindOnce(byId('hushPhase31PrevSample', doc), 'click', 'td613Phase31PrevCorpusBound', (event) => intercept(event, () => moveEditCorpus(-1, doc)), true);
  bindOnce(byId('hushPhase31NextSample', doc), 'click', 'td613Phase31NextCorpusBound', (event) => intercept(event, () => moveEditCorpus(1, doc)), true);
  bindOnce(byId('hushPhase31CloseCorpusEdit', doc), 'click', 'td613Phase31NativeCarouselCloseCorpusEditBound', (event) => intercept(event, () => closeEditCorpusModal(doc)), true);
  bindOnce(byId('hushPhase31SaveCorpusEdits', doc), 'click', 'td613Phase31NativeCarouselSaveCorpusEditBound', (event) => intercept(event, () => saveEditCorpusModal(doc)), true);
  bindOnce(byId('hushPhase31EditCorpusList', doc), 'click', 'td613Phase31NativeCarouselRemoveCorpusEditBound', (event) => intercept(event, () => removeActiveEditCorpusSample(event, doc)), true);
}

export function initHushPhase311(doc = document) {
  const result = typeof nativePhase311.initHushPhase311 === 'function'
    ? nativePhase311.initHushPhase311(doc)
    : { version: VERSION, installed: false };
  installNativeCorpusCarousel(doc);
  setTimeout(() => installNativeCorpusCarousel(doc), 0);
  setTimeout(() => installNativeCorpusCarousel(doc), 160);
  return { ...result, version: VERSION, nativeCarousel: true };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const boot = () => initHushPhase311(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('td613:hush:core-ready', boot, { once: true });
  window.setTimeout(boot, 260);
  window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__ = {
    version: VERSION,
    openEditCorpusModal,
    closeEditCorpusModal,
    renderActiveEditCorpusSample,
    moveEditCorpus,
    pullActiveEditCorpusSample,
    saveEditCorpusModal,
    readStoredSamples,
    writeStoredSamples
  };
}
