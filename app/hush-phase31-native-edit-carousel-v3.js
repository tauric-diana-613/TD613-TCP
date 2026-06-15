import {
  closeEditCorpusModal,
  exposeNativeCorpusCarousel as exposeBaseCarousel,
  installNativeCorpusCarousel as installBaseCarousel,
  moveEditCorpus,
  openEditCorpusModal,
  pullActiveEditCorpusSample,
  readStoredSamples,
  renderActiveEditCorpusSample,
  saveEditCorpusModal,
  writeStoredSamples
} from './hush-phase31-native-edit-carousel.js';

const VERSION = 'phase-31.1-native-edit-carousel/v3-schema-safe';
const DISCOURSE_MODES = ['explanatory','argumentative','narrative','procedural','reflective-affective','legal-forensic','casual-conversational','technical-operational','poetic-symbolic','corrective-repair','compressed-summary'];
const RETRIEVAL_TRIGGERS = ['baseline-voice','high-pressure','failure-recovery','correction-request','disagreement-pushback','implementation-handoff','evidence-framing','boundary-refusal','uncertainty-caveat','deep-explanation','compression-summary','affective-repair','ritual-symbolic','public-facing','private-diagnostic'];
const MODE_ALIASES = new Map([
  ['reflective', 'reflective-affective'],
  ['casual', 'casual-conversational'],
  ['technical', 'technical-operational'],
  ['repair', 'corrective-repair']
]);

function byId(id, doc = document) {
  return doc.getElementById(id);
}

function normalizeValue(value, options, aliases = new Map()) {
  const raw = String(value || '').trim();
  const mapped = aliases.get(raw) || raw;
  return options.includes(mapped) ? mapped : options[0];
}

function setOptions(select, options, selected) {
  const value = normalizeValue(selected || select.value, options, MODE_ALIASES);
  select.textContent = '';
  options.forEach((optionValue) => {
    const option = select.ownerDocument.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    option.selected = optionValue === value;
    select.appendChild(option);
  });
}

function labelSpanFor(control) {
  const id = control?.id;
  if (!id) return null;
  const label = control.ownerDocument.querySelector(`label[for="${id}"]`);
  return label?.querySelector('span') || null;
}

export function upgradeCustomizerFields(doc = document) {
  const mode = byId('hushPhase31SampleCategory', doc);
  if (mode?.tagName === 'SELECT') {
    setOptions(mode, DISCOURSE_MODES, mode.value);
    mode.dataset.td613SchemaField = 'discourseMode';
    const label = labelSpanFor(mode);
    if (label) label.textContent = 'Discourse Mode';
  }

  const triggerControl = byId('hushPhase31ContextLabel', doc);
  if (triggerControl) {
    const selected = normalizeValue(triggerControl.value, RETRIEVAL_TRIGGERS);
    let trigger = triggerControl;
    if (triggerControl.tagName !== 'SELECT') {
      trigger = doc.createElement('select');
      trigger.id = 'hushPhase31ContextLabel';
      trigger.className = triggerControl.className || '';
      trigger.autocomplete = 'off';
      triggerControl.replaceWith(trigger);
    }
    setOptions(trigger, RETRIEVAL_TRIGGERS, selected);
    trigger.dataset.td613SchemaField = 'retrievalTrigger';
    const label = labelSpanFor(trigger);
    if (label) label.textContent = 'Retrieval Trigger';
  }
}

function installEmergencyCapture(doc = document) {
  if (doc.documentElement?.dataset.td613EditCaptureV3 === 'true') return;
  if (doc.documentElement) doc.documentElement.dataset.td613EditCaptureV3 = 'true';
  doc.addEventListener('click', (event) => {
    const target = event.target;
    if (target?.closest?.('#hushPhase31EditCorpus')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      upgradeCustomizerFields(doc);
      openEditCorpusModal(doc);
      return;
    }
    if (target?.closest?.('#hushPhase31PrevSample')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      moveEditCorpus(-1, doc);
      return;
    }
    if (target?.closest?.('#hushPhase31NextSample')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      moveEditCorpus(1, doc);
      return;
    }
    if (target?.closest?.('#hushPhase31SaveCorpusEdits')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      saveEditCorpusModal(doc);
      return;
    }
    if (target?.closest?.('#hushPhase31CloseCorpusEdit')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      closeEditCorpusModal(doc);
    }
  }, true);
}

export function installNativeCorpusCarousel(doc = document) {
  installEmergencyCapture(doc);
  upgradeCustomizerFields(doc);
  installBaseCarousel(doc);
  window.setTimeout(() => upgradeCustomizerFields(doc), 0);
  window.setTimeout(() => upgradeCustomizerFields(doc), 320);
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
  installEmergencyCapture(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installNativeCorpusCarousel(document), { once: true });
  else installNativeCorpusCarousel(document);
}

export {
  closeEditCorpusModal,
  moveEditCorpus,
  openEditCorpusModal,
  pullActiveEditCorpusSample,
  readStoredSamples,
  renderActiveEditCorpusSample,
  saveEditCorpusModal,
  writeStoredSamples
};
