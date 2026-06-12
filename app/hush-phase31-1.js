import { createCustomMask, addCustomMaskSample, rebuildCustomMaskProfile, exportCustomMaskJson, importCustomMaskJson, HUSH_CUSTOM_MASK_CORPUS_POLICY } from './engine/hush-custom-mask.js';

const VERSION = 'phase-31.1-corpus-import-export-reset-customizer';
const MIN_SAMPLE_WORDS = HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample;
const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const slug = (value = 'custom-mask') => text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-mask';
const asArray = (value) => Array.isArray(value) ? value : [];

let dotTimer = null;
let loaderArmed = false;
let samples = [];
let activeMask = null;

function installLoading(doc = document) {
  if (!doc.body || loaderArmed) return;
  let overlay = byId('td613HushLoading', doc);
  if (!overlay) {
    overlay = doc.createElement('div');
    overlay.id = 'td613HushLoading';
    overlay.innerHTML = '<div class="td613-hush-loading-core"><div class="td613-hush-loading-mark">TD613 / Hush</div><div class="td613-hush-loading-text">TD613 Hush is loading<span id="td613HushLoadingDots" class="td613-hush-loading-dots">.</span></div></div>';
    doc.body.prepend(overlay);
  }
  loaderArmed = true;
  const dots = byId('td613HushLoadingDots', doc);
  let n = 0;
  if (dotTimer) clearInterval(dotTimer);
  dotTimer = setInterval(() => { if (dots) dots.textContent = ['.', '..', '...'][n++ % 3]; }, 360);
  const hide = () => window.setTimeout(() => { overlay.hidden = true; clearInterval(dotTimer); }, 450);
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide, { once: true });
  window.setTimeout(hide, 3800);
}

function sampleText(entry) {
  return typeof entry === 'string' ? entry : text(entry?.text || '');
}

function sampleCategory(entry) {
  return typeof entry === 'string' ? 'uncategorized' : text(entry?.promptCategory || entry?.contextLabel || 'uncategorized');
}

function sampleTexts() {
  return samples.map(sampleText).filter(Boolean);
}

function displayMaskName(mask = activeMask) {
  const label = text(mask?.label || mask?.name || '');
  return label && !/^unsaved custom mask$/i.test(label) ? label : 'Custom Mask Empty';
}

function updateCapsule(doc = document) {
  const node = byId('hushCustomMaskCapsuleName', doc);
  if (node) node.textContent = displayMaskName();
  if (typeof window !== 'undefined') window.__TD613_HUSH_PHASE32__?.renderCustomMaskCapsule?.(doc);
  if (typeof window !== 'undefined') window.__TD613_HUSH_HOUSEKEEPING__?.ensureCustomMaskCapsule?.();
}

function shellHtml() {
  return `<section id="hushPhase31CustomizerPanel" class="hush-phase31-customizer" hidden>
    <div class="hush-phase31-head">
      <div>
        <p class="hush-phase31-title">Voice reference corpus</p>
        <p class="hush-phase31-note">Log one reference sample at a time. Each sample needs at least ${MIN_SAMPLE_WORDS} words. Hush builds a custom mask as a corpus: 12 samples for provisional, 24 for operational, 40 for rigorous.</p>
      </div>
      <span id="hushPhase31ProfileStatus" class="hush-phase31-status">empty</span>
    </div>
    <div class="hush-phase31-corpus-meter" aria-label="Custom mask corpus readiness">
      <div class="hush-phase31-meter-top"><span id="hushPhase31CorpusStatus" class="hush-phase31-corpus-status">CORPUS EMPTY</span><span id="hushPhase31CorpusWords" class="hush-phase31-meter-small">0 / 3000 words</span></div>
      <div class="hush-phase31-meter-track"><span id="hushPhase31CorpusFill" class="hush-phase31-meter-fill"></span></div>
      <div class="hush-phase31-tier-row"><span id="hushPhase31TierProvisional">12 provisional</span><span id="hushPhase31TierOperational">24 operational</span><span id="hushPhase31TierRigorous">40 rigorous</span></div>
      <div class="hush-phase31-stat-grid">
        <span><strong id="hushPhase31SampleCount">0</strong><em>samples</em></span>
        <span><strong id="hushPhase31AcceptedCount">0</strong><em>accepted</em></span>
        <span><strong id="hushPhase31WordCount">0</strong><em>words</em></span>
        <span><strong id="hushPhase31CategoryCount">0</strong><em>contexts</em></span>
      </div>
    </div>
    <div class="hush-phase31-sample-tools">
      <label class="hush-phase31-label" for="hushPhase31SampleCategory"><span>Sample category</span><select id="hushPhase31SampleCategory"><option value="explanatory">explanatory</option><option value="argumentative">argumentative</option><option value="narrative">narrative</option><option value="procedural">procedural</option><option value="reflective">reflective / affective</option><option value="legal-forensic">legal / forensic</option><option value="casual">casual / conversational</option><option value="technical">technical / operational</option><option value="poetic-symbolic">poetic / symbolic</option><option value="repair">repair / correction</option></select></label>
      <label class="hush-phase31-label" for="hushPhase31ContextLabel"><span>Context label</span><input id="hushPhase31ContextLabel" autocomplete="off" placeholder="optional scene / pressure / prompt note"></label>
    </div>
    <div class="hush-phase31-ledger-head">
      <label class="hush-phase31-label" for="hushVoiceReferenceSamplesSaved"><span>Reference sample ledger</span><span>Paste a fresh sample, choose its category, then log it. Operational masks require 24 accepted samples and 1,800 words; rigorous masks require 40 and 3,000.</span></label>
      <span id="hushPhase31WordFloorCounter" class="hush-phase31-word-floor">0/${MIN_SAMPLE_WORDS}</span>
    </div>
    <textarea id="hushVoiceReferenceSamplesSaved" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Paste one 75+ word voice reference sample, then tap Log Sample. The ledger updates after each accepted sample."></textarea>
    <div class="hush-phase31-actions"><button id="hushPhase31LogSampleBtn" type="button" class="secondary">Log Sample</button><button id="hushPhase31SaveMaskBtn" type="button" class="secondary">Save Mask</button><button id="hushPhase31Undo" type="button" class="hush-phase31-mini hush-phase31-link" aria-disabled="true">undo last</button></div>
    <div id="hushPhase31SampleStatus" class="persona-memory-summary">Corpus empty. Add 75+ word samples to begin.</div>
    <button id="hushPhase31ResetCustomizer" type="button" class="hush-phase31-reset-customizer">reset customizer</button>
  </section>`;
}

function modalHtml() {
  return `<div id="hushPhase31SaveModal" class="hush-phase31-modal" hidden role="dialog" aria-modal="true" aria-labelledby="hushPhase31ModalTitle">
    <div class="hush-phase31-modal-card"><h3 id="hushPhase31ModalTitle">Save Custom Mask</h3>
      <div class="hush-phase31-modal-grid">
        <label>Name<input id="hushPhase31MaskName" autocomplete="off" placeholder="Glitching Cassandra"></label>
        <label>Family<input id="hushPhase31MaskFamily" autocomplete="off" placeholder="custom field mask"></label>
        <label class="wide">Persona Story<textarea id="hushPhase31MaskDescription" placeholder="A short scene or context for this voice."></textarea></label>
        <label class="wide">Use When<textarea id="hushPhase31MaskIntendedUse" placeholder="Where this mask should be used."></textarea></label>
        <label class="wide">Risk Tell<textarea id="hushPhase31MaskRiskTell" placeholder="What becomes identifying or unstable."></textarea></label>
        <label>Sentence Shape<input id="hushPhase31MaskSentence" placeholder="short / mid / long / jagged"></label>
        <label>Surface Texture<input id="hushPhase31MaskOrnament" placeholder="low / medium / high"></label>
        <label>Warmth<input id="hushPhase31MaskWarmth" placeholder="low / medium / high"></label>
        <label>Custody<input id="hushPhase31MaskCustody" placeholder="medium / high / very-high"></label>
        <label class="wide">Pressure Warnings<textarea id="hushPhase31MaskWarnings" placeholder="Comma or line separated warnings."></textarea></label>
      </div>
      <div class="hush-phase31-modal-actions"><button id="hushPhase31CancelSave" type="button" class="ghost">Cancel</button><button id="hushPhase31AddToStudio" type="button" class="primary-cta">Add to Mask Studio</button></div>
      <div id="hushPhase31ModalStatus" class="hush-phase31-modal-status"></div>
    </div>
  </div>`;
}

function formatStatus(status = 'empty') {
  return status.replace(/-/g, ' ').toUpperCase();
}

function setTierState(id, passed, doc = document) {
  const el = byId(id, doc);
  if (el) el.dataset.state = passed ? 'passed' : 'pending';
}

function currentDraft(area) {
  const value = text(area?.value || '');
  return value.replace(/--- sample \d+[\s\S]*?(?=(?:\n\n)?--- sample \d+|$)/g, '').trim() || value;
}

function updateWordCounter(doc = document) {
  const counter = byId('hushPhase31WordFloorCounter', doc);
  const area = byId('hushVoiceReferenceSamplesSaved', doc);
  if (!counter) return;
  const count = words(currentDraft(area));
  counter.textContent = `${count}/${MIN_SAMPLE_WORDS}`;
  counter.dataset.state = count >= MIN_SAMPLE_WORDS ? 'ready' : 'building';
}

function renderLedger(doc = document) {
  const area = byId('hushVoiceReferenceSamplesSaved', doc);
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
  const readiness = activeMask?.corpusReadiness || { status: 'empty', acceptedSampleCount: 0, acceptedWords: 0, promptCategoryCount: 0, readinessScore: 0 };
  if (count) count.textContent = String(samples.length);
  if (accepted) accepted.textContent = String(readiness.acceptedSampleCount || 0);
  if (wordsNode) wordsNode.textContent = String(readiness.acceptedWords || 0);
  if (catNode) catNode.textContent = String(readiness.promptCategoryCount || 0);
  if (undo) undo.setAttribute('aria-disabled', samples.length ? 'false' : 'true');
  if (area && samples.length) area.value = samples.map((entry, index) => {
    const sample = sampleText(entry);
    return `--- sample ${index + 1} / ${sampleCategory(entry)} / ${sample.length} chars / ${words(sample)} words ---\n${sample}`;
  }).join('\n\n');
  if (fill) fill.style.width = `${Math.round((readiness.readinessScore || 0) * 100)}%`;
  if (corpusStatus) corpusStatus.textContent = formatStatus(readiness.status || 'empty');
  if (corpusWords) corpusWords.textContent = `${readiness.acceptedWords || 0} / ${HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousWords} words`;
  setTierState('hushPhase31TierProvisional', (readiness.acceptedSampleCount || 0) >= HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalSamples && (readiness.acceptedWords || 0) >= HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalWords, doc);
  setTierState('hushPhase31TierOperational', (readiness.acceptedSampleCount || 0) >= HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalSamples && (readiness.acceptedWords || 0) >= HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalWords, doc);
  setTierState('hushPhase31TierRigorous', readiness.status === 'rigorous', doc);
  if (status) {
    if (!samples.length) status.textContent = 'Corpus empty. Add 75+ word samples to begin.';
    else if (readiness.status === 'corpus-building') status.textContent = `Corpus building: ${readiness.acceptedSampleCount}/${HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalSamples} accepted samples · ${readiness.acceptedWords}/${HUSH_CUSTOM_MASK_CORPUS_POLICY.provisionalWords} words to provisional.`;
    else if (readiness.status === 'provisional') status.textContent = `Provisional mask: useful for preview only. Operational requires ${HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalSamples} samples and ${HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalWords} words.`;
    else if (readiness.status === 'operational') status.textContent = `Operational mask: generation allowed with corpus limitations. Rigorous requires ${HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousSamples} samples, ${HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousWords} words, and 5 contexts.`;
    else status.textContent = `Rigorous mask candidate: ${readiness.acceptedSampleCount} samples · ${readiness.acceptedWords} words · ${readiness.promptCategoryCount} contexts.`;
  }
  if (profile) profile.textContent = activeMask ? `${formatStatus(activeMask.profileStatus)} · ${activeMask.acceptedWords || 0} words` : 'empty';
  updateWordCounter(doc);
  updateCapsule(doc);
}

function syncBench(mask, doc = document) {
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const state = bench.benchState || {};
  if (!mask || !state) return;
  state.activeCustomMask = mask;
  state.selectedHushMask = mask;
  state.selectedHushMaskId = mask.id;
  const ref = byId('maskReferenceInput', doc);
  if (ref) ref.value = sampleTexts().join('\n\n') || mask.sampleSeed || '';
  if (typeof bench.renderHushMaskProfile === 'function') bench.renderHushMaskProfile();
  if (typeof bench.renderHushProfileMatch === 'function') bench.renderHushProfileMatch(null);
  updateCapsule(doc);
}

function logSample(doc = document) {
  const area = byId('hushVoiceReferenceSamplesSaved', doc);
  const status = byId('hushPhase31SampleStatus', doc);
  const raw = currentDraft(area);
  const sampleWords = words(raw);
  if (sampleWords < MIN_SAMPLE_WORDS) {
    if (status) status.textContent = `Sample too short: ${sampleWords}/${MIN_SAMPLE_WORDS} words. Hush logs samples only after they have enough architecture to measure.`;
    updateWordCounter(doc);
    return null;
  }
  const promptCategory = text(byId('hushPhase31SampleCategory', doc)?.value) || 'uncategorized';
  const contextLabel = text(byId('hushPhase31ContextLabel', doc)?.value) || promptCategory;
  const entry = { text: raw, promptCategory, contextLabel };
  samples.push(entry);
  activeMask = activeMask || createCustomMask({ label: 'Unsaved Custom Mask', id: 'custom-unsaved-phase31-1' });
  activeMask = addCustomMaskSample(activeMask, raw, { includePrivateText: true, promptCategory, contextLabel });
  syncBench(activeMask, doc);
  renderLedger(doc);
  return activeMask;
}

function undoSample(doc = document) {
  if (!samples.length) return;
  samples.pop();
  activeMask = createCustomMask({ label: 'Unsaved Custom Mask', id: 'custom-unsaved-phase31-1' });
  for (const entry of samples) activeMask = addCustomMaskSample(activeMask, sampleText(entry), { includePrivateText: true, promptCategory: sampleCategory(entry), contextLabel: entry.contextLabel || sampleCategory(entry) });
  if (!samples.length) activeMask = null;
  syncBench(activeMask, doc);
  renderLedger(doc);
}

function resetCustomizer(doc = document) {
  samples = [];
  activeMask = null;
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const state = bench.benchState || {};
  const savedMasks = Array.isArray(state.customMasks) ? state.customMasks : [];
  state.activeCustomMask = null;
  state.hushOutboundPacket = null;
  if (state.selectedHushMask?.id === 'custom-unsaved-phase31-1' || state.selectedHushMask?.source === 'custom-imported-unsaved') {
    const fallback = (state.hushMasks || [])[0] || savedMasks[0] || null;
    if (fallback) {
      state.selectedHushMask = fallback;
      state.selectedHushMaskId = fallback.id;
      const select = byId('maskFieldSelect', doc);
      if (select) select.value = fallback.id;
    }
  }
  ['hushVoiceReferenceSamplesSaved', 'hushPhase31ContextLabel', 'maskReferenceInput'].forEach((id) => { const el = byId(id, doc); if (el) el.value = ''; });
  ['hushPhase31MaskName', 'hushPhase31MaskDescription', 'hushPhase31MaskIntendedUse', 'hushPhase31MaskRiskTell', 'hushPhase31MaskSentence', 'hushPhase31MaskOrnament', 'hushPhase31MaskWarmth', 'hushPhase31MaskCustody', 'hushPhase31MaskWarnings'].forEach((id) => { const el = byId(id, doc); if (el) el.value = ''; });
  const family = byId('hushPhase31MaskFamily', doc);
  if (family) family.value = 'custom field mask';
  try {
    ['td613-hush-customizer-cache', 'td613-hush-customizer-draft', 'td613:hush-customizer-cache', 'td613:hush-customizer-draft'].forEach((key) => localStorage.removeItem(key));
  } catch (error) {}
  const status = byId('hushPhase31SampleStatus', doc);
  if (status) status.textContent = 'Customizer reset. Saved masks were left alone.';
  if (typeof bench.renderHushMaskOptions === 'function') bench.renderHushMaskOptions();
  renderLedger(doc);
  updateCapsule(doc);
  window.__TD613_HUSH_HOUSEKEEPING__?.ensureCustomMaskCapsule?.();
}

function readModal(doc = document) {
  const warnings = text(byId('hushPhase31MaskWarnings', doc)?.value).split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  return {
    label: text(byId('hushPhase31MaskName', doc)?.value),
    family: text(byId('hushPhase31MaskFamily', doc)?.value) || 'custom field mask',
    description: text(byId('hushPhase31MaskDescription', doc)?.value),
    intendedUse: text(byId('hushPhase31MaskIntendedUse', doc)?.value),
    riskTell: text(byId('hushPhase31MaskRiskTell', doc)?.value),
    transformHints: {
      sentence: text(byId('hushPhase31MaskSentence', doc)?.value),
      ornament: text(byId('hushPhase31MaskOrnament', doc)?.value),
      warmth: text(byId('hushPhase31MaskWarmth', doc)?.value),
      custody: text(byId('hushPhase31MaskCustody', doc)?.value)
    },
    pressureWarnings: warnings
  };
}

function hydrateModalFromMask(mask = activeMask, doc = document, { preserveTyped = true } = {}) {
  if (!mask) return;
  const hints = mask.transformHints || {};
  const assign = (id, value) => {
    const el = byId(id, doc);
    if (!el) return;
    if (preserveTyped && text(el.value)) return;
    el.value = text(value || '');
  };
  assign('hushPhase31MaskName', displayMaskName(mask) === 'Custom Mask Empty' ? '' : displayMaskName(mask));
  assign('hushPhase31MaskFamily', mask.family || 'custom field mask');
  assign('hushPhase31MaskDescription', mask.description || '');
  assign('hushPhase31MaskIntendedUse', mask.intendedUse || '');
  assign('hushPhase31MaskRiskTell', mask.riskTell || '');
  assign('hushPhase31MaskSentence', hints.sentence || hints.sentenceShape || mask.writingTraits?.sentenceLength || '');
  assign('hushPhase31MaskOrnament', hints.ornament || hints.ornamentation || mask.writingTraits?.ornament || '');
  assign('hushPhase31MaskWarmth', hints.warmth || mask.writingTraits?.emotionalTemperature || '');
  assign('hushPhase31MaskCustody', hints.custody || mask.writingTraits?.custody || '');
  assign('hushPhase31MaskWarnings', asArray(mask.pressureWarnings || mask.warnings).join('\n'));
}

function openSaveModal(doc = document) {
  hydrateModalFromMask(activeMask, doc, { preserveTyped: true });
  const modal = byId('hushPhase31SaveModal', doc);
  if (modal) modal.hidden = false;
}

function prepareMaskForExchange(doc = document) {
  const fields = readModal(doc);
  const label = fields.label || displayMaskName(activeMask);
  const base = activeMask || createCustomMask({ label, id: `custom-${slug(label)}` });
  const rebuilt = rebuildCustomMaskProfile({ ...base, label, ...fields, source: 'custom', sampleSeed: sampleTexts().join('\n\n') || base.sampleSeed || '' }, { includePrivateText: true });
  return Object.assign(rebuilt, fields, { label, source: 'custom', sampleSeed: sampleTexts().join('\n\n') || rebuilt.sampleSeed || '', profile: rebuilt.compositeProfile });
}

function exportMask(doc = document) {
  const status = byId('hushPhase31SampleStatus', doc);
  if (!activeMask && !samples.length) { if (status) status.textContent = 'Nothing to export yet. Log or import a custom mask first.'; return; }
  const prepared = prepareMaskForExchange(doc);
  const payload = JSON.parse(exportCustomMaskJson(prepared, { includePrivateText: true }));
  Object.assign(payload, readModal(doc), {
    family: prepared.family || 'custom field mask',
    description: prepared.description || '',
    intendedUse: prepared.intendedUse || '',
    riskTell: prepared.riskTell || '',
    transformHints: prepared.transformHints || {},
    pressureWarnings: prepared.pressureWarnings || [],
    sampleSeed: prepared.sampleSeed || '',
    customMaskCard: {
      family: prepared.family || 'custom field mask',
      description: prepared.description || '',
      intendedUse: prepared.intendedUse || '',
      riskTell: prepared.riskTell || '',
      transformHints: prepared.transformHints || {},
      pressureWarnings: prepared.pressureWarnings || []
    }
  });
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = url;
  link.download = `${slug(payload.label || 'custom-mask')}.hush-mask.json`;
  doc.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  if (status) status.textContent = `Exported ${payload.label || 'custom mask'} with corpus and save-card fields.`;
}

function normalizeImportedSamples(parsed = {}, imported = {}) {
  const sourceSamples = asArray(parsed.samples).length ? parsed.samples : asArray(imported.samples);
  const fromSamples = sourceSamples.map((sample) => ({
    text: text(sample?.text || ''),
    promptCategory: text(sample?.promptCategory || sample?.contextLabel || 'imported'),
    contextLabel: text(sample?.contextLabel || sample?.promptCategory || 'imported')
  })).filter((sample) => sample.text);
  if (fromSamples.length) return fromSamples;
  const seed = text(parsed.sampleSeed || imported.sampleSeed || '');
  return seed ? [{ text: seed, promptCategory: 'imported', contextLabel: 'imported' }] : [];
}

async function importMaskFromFile(file, doc = document) {
  const status = byId('hushPhase31SampleStatus', doc);
  if (!file) return;
  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const importedBase = importCustomMaskJson(parsed);
    const importedSamples = normalizeImportedSamples(parsed, importedBase);
    samples = importedSamples;
    let next = createCustomMask({ id: importedBase.id || `custom-${slug(importedBase.label || 'imported-mask')}`, label: importedBase.label || parsed.label || 'Imported Custom Mask' });
    for (const entry of samples) next = addCustomMaskSample(next, entry.text, { includePrivateText: true, promptCategory: entry.promptCategory, contextLabel: entry.contextLabel });
    activeMask = Object.assign(next, importedBase, parsed, {
      samples: next.samples,
      compositeProfile: next.compositeProfile,
      profile: next.compositeProfile,
      corpusReadiness: next.corpusReadiness,
      profileStatus: next.profileStatus,
      acceptedWords: next.acceptedWords,
      acceptedSampleCount: next.acceptedSampleCount,
      source: parsed.source || 'custom-imported-unsaved',
      sampleSeed: samples.map((entry) => entry.text).join('\n\n') || parsed.sampleSeed || importedBase.sampleSeed || ''
    });
    hydrateModalFromMask(activeMask, doc, { preserveTyped: false });
    syncBench(activeMask, doc);
    renderLedger(doc);
    if (status) status.textContent = `Imported ${displayMaskName(activeMask)}. Save Mask will add it to the studio carousel.`;
  } catch (error) {
    if (status) status.textContent = `Import failed: ${error?.message || error}`;
  }
}

function ensureImportInput(doc = document) {
  let input = byId('hushPhase31ImportMaskInput', doc);
  if (!input) {
    input = doc.createElement('input');
    input.id = 'hushPhase31ImportMaskInput';
    input.type = 'file';
    input.accept = 'application/json,.json,.hush-mask';
    input.hidden = true;
    doc.body.appendChild(input);
  }
  if (input.dataset.bound !== 'true') {
    input.dataset.bound = 'true';
    input.addEventListener('change', () => {
      const [file] = input.files || [];
      importMaskFromFile(file, doc).finally(() => { input.value = ''; });
    });
  }
  return input;
}

function wireCapsuleIO(doc = document) {
  const input = ensureImportInput(doc);
  const importLink = byId('hushPhase31ImportMaskLink', doc);
  const exportLink = byId('hushPhase31ExportMaskLink', doc);
  if (importLink && importLink.dataset.bound !== 'true') {
    importLink.dataset.bound = 'true';
    importLink.addEventListener('click', () => input.click());
  }
  if (exportLink && exportLink.dataset.bound !== 'true') {
    exportLink.dataset.bound = 'true';
    exportLink.addEventListener('click', () => exportMask(doc));
  }
}

function addToStudio(doc = document) {
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const state = bench.benchState || {};
  const modalStatus = byId('hushPhase31ModalStatus', doc);
  const readiness = activeMask?.corpusReadiness || {};
  if (!activeMask || !samples.length) { if (modalStatus) modalStatus.textContent = 'Log or import a corpus before saving. Minimum accepted sample: 75 words.'; return null; }
  if (!readiness.generationAllowed) { if (modalStatus) modalStatus.textContent = `Not operational yet: ${readiness.acceptedSampleCount || 0}/${HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalSamples} accepted samples · ${readiness.acceptedWords || 0}/${HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalWords} words.`; return null; }
  const fields = readModal(doc);
  const missing = ['label', 'description', 'intendedUse', 'riskTell'].filter((key) => !fields[key]);
  if (missing.length) { if (modalStatus) modalStatus.textContent = `Missing: ${missing.join(', ')}`; return null; }
  const saved = rebuildCustomMaskProfile({ ...activeMask, id: `custom-${slug(fields.label)}-${Date.now().toString(36)}`, label: fields.label }, { includePrivateText: true });
  Object.assign(saved, fields, { source: 'custom', sampleSeed: sampleTexts().join('\n\n'), profile: saved.compositeProfile });
  activeMask = saved;
  state.customMasks = [saved, ...(state.customMasks || []).filter((mask) => mask.id !== saved.id)];
  state.activeCustomMask = saved;
  state.selectedHushMask = saved;
  state.selectedHushMaskId = saved.id;
  if (typeof bench.renderHushMaskOptions === 'function') bench.renderHushMaskOptions();
  const select = byId('maskFieldSelect', doc);
  if (select && !select.querySelector(`option[value="${saved.id}"]`)) select.insertAdjacentHTML('afterbegin', `<option value="${saved.id}">${saved.label} — ${saved.family}</option>`);
  if (select) { select.value = saved.id; const option = select.querySelector(`option[value="${saved.id}"]`); if (option) select.prepend(option); }
  if (typeof bench.selectHushMask === 'function') bench.selectHushMask(saved.id);
  byId('hushPhase31SaveModal', doc).hidden = true;
  renderLedger(doc);
  updateCapsule(doc);
  return saved;
}

function orderCustomizer(doc = document) {
  const warnings = byId('hushSwapWarningsPanel', doc);
  const match = byId('hushProfileMatchPanel', doc);
  if (!warnings || !match || !warnings.parentElement) return null;
  const parent = warnings.parentElement;
  if (warnings.compareDocumentPosition(match) & Node.DOCUMENT_POSITION_PRECEDING) parent.insertBefore(warnings, match);
  let panel = byId('hushPhase31CustomizerPanel', doc);
  if (!panel) {
    const wrap = doc.createElement('div');
    wrap.innerHTML = shellHtml();
    panel = wrap.firstElementChild;
  }
  parent.insertBefore(panel, match);
  if (!byId('hushPhase31SaveModal', doc)) doc.body.insertAdjacentHTML('beforeend', modalHtml());
  return panel;
}

function setCustomizerVisible(doc = document) {
  const panel = byId('hushPhase31CustomizerPanel', doc);
  const active = byId('hushCustomizeTabBtn', doc)?.getAttribute('aria-pressed') === 'true';
  if (panel) panel.hidden = !active;
}

export function initHushPhase311(doc = document) {
  document.title = 'TD613 Hush';
  installLoading(doc);
  const panel = orderCustomizer(doc);
  if (!panel) return { version: VERSION, installed: false };
  setCustomizerVisible(doc);
  byId('hushCustomizeTabBtn', doc)?.addEventListener('click', () => setTimeout(() => setCustomizerVisible(doc), 0));
  byId('hushBuiltInTabBtn', doc)?.addEventListener('click', () => setTimeout(() => setCustomizerVisible(doc), 0));
  byId('hushPhase31LogSampleBtn', doc)?.addEventListener('click', () => logSample(doc));
  byId('hushPhase31Undo', doc)?.addEventListener('click', () => undoSample(doc));
  byId('hushPhase31SaveMaskBtn', doc)?.addEventListener('click', () => openSaveModal(doc));
  byId('hushPhase31CancelSave', doc)?.addEventListener('click', () => { const modal = byId('hushPhase31SaveModal', doc); if (modal) modal.hidden = true; });
  byId('hushPhase31AddToStudio', doc)?.addEventListener('click', () => addToStudio(doc));
  byId('hushPhase31ResetCustomizer', doc)?.addEventListener('click', () => resetCustomizer(doc));
  byId('hushVoiceReferenceSamplesSaved', doc)?.addEventListener('input', () => updateWordCounter(doc));
  wireCapsuleIO(doc);
  renderLedger(doc);
  window.setTimeout(() => wireCapsuleIO(doc), 140);
  window.setTimeout(() => wireCapsuleIO(doc), 520);
  if (typeof window !== 'undefined') window.__TD613_HUSH_PHASE31_CUSTOMIZER__ = { version: VERSION, resetCustomizer };
  return { version: VERSION, installed: true, corpusPolicy: HUSH_CUSTOM_MASK_CORPUS_POLICY };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  installLoading(document);
  const boot = () => initHushPhase311(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 80);
  window.setTimeout(boot, 360);
}
