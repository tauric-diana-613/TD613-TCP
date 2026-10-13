const HUSH_SOURCE_LAYOUT_POLICY_VERSION = 'source-layout-policy/v2-mask-only+native-customizer-corpus+status-tune+log-metal+corpus-export-edit+ontology-fields';
const HUSH_PHASE31_STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';
const HUSH_DISCOURSE_MODES = Object.freeze([
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
]);
const HUSH_RETRIEVAL_TRIGGERS = Object.freeze([
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
]);

function normalizeInstructionText() {
  return 'Source/input line breaks are reading context only, not output constraints. Do not copy or preserve source line breaks for their own sake. Visible line/paragraph pacing should come from the selected mask/custom-mask corpus when mask layout cadence is active; otherwise choose natural pacing for the transformed message.';
}

function normalizeContract(contract = {}) {
  if (!contract || typeof contract !== 'object') return contract;
  const law = normalizeInstructionText();
  contract.sourceLayoutPolicy = {
    version: HUSH_SOURCE_LAYOUT_POLICY_VERSION,
    source_line_breaks_are_constraints: false,
    mask_line_breaks_may_guide_pacing: true,
    instruction: law
  };
  if (Array.isArray(contract.rules)) {
    contract.rules = contract.rules
      .filter((rule) => !/paragraph-sensitive source|copy source line breaks|source line breaks exactly|source or custom mask into one undifferentiated block/i.test(String(rule || '')))
      .concat(law);
  }
  const packet = contract.flightPacket || contract.flight_packet || null;
  if (packet) normalizePacket(packet, law);
  return contract;
}

function normalizePacket(packet = {}, law = normalizeInstructionText()) {
  if (!packet || typeof packet !== 'object') return packet;
  packet.source_layout_policy = {
    version: HUSH_SOURCE_LAYOUT_POLICY_VERSION,
    source_line_breaks_are_constraints: false,
    source_line_breaks_are_reading_context: true,
    mask_line_breaks_may_guide_output_pacing: true,
    instruction: law
  };
  if (packet.source_manifest) {
    packet.source_manifest.source_layout_constraint = false;
    if (packet.source_manifest.source_layout_cadence) {
      packet.source_manifest.source_layout_cadence.constraint = false;
      packet.source_manifest.source_layout_cadence.instruction = 'Diagnostic only: source line breaks help read propositions but must not constrain output layout.';
    }
  }
  const maskCadence = packet.mask_style_vector?.layout_cadence || null;
  const maskTendency = maskCadence?.line_breaks?.tendency || maskCadence?.lineBreaks?.tendency || '';
  const maskLayoutActive = ['line-broken', 'paragraph-sensitive', 'long-paragraph-sensitive'].includes(maskTendency);
  if (packet.stylometry_engine) {
    packet.stylometry_engine.layout_cadence_instruction = law;
    packet.stylometry_engine.source_layout_constraint = false;
    packet.stylometry_engine.mask_layout_constraint = maskLayoutActive;
    const constraints = packet.stylometry_engine.generator_constraints || {};
    packet.stylometry_engine.generator_constraints = {
      ...constraints,
      preserve_layout_cadence: maskLayoutActive,
      preserve_source_layout_cadence: false,
      do_not_flatten_paragraph_sensitive_source: false,
      source_line_breaks_are_constraints: false,
      preserve_mask_layout_cadence: maskLayoutActive,
      custom_mask_line_break_behavior_active: maskLayoutActive
    };
    const audit = packet.stylometry_engine.audit || {};
    packet.stylometry_engine.audit = {
      ...audit,
      warnings: (audit.warnings || []).filter((warning) => warning !== 'source-layout-sensitive')
    };
  }
  if (packet.generator_constraints) {
    packet.generator_constraints.source_line_breaks_are_constraints = false;
    packet.generator_constraints.preserve_source_layout_cadence = false;
    packet.generator_constraints.do_not_flatten_paragraph_sensitive_source = false;
  }
  return packet;
}

function normalizeOutboundPacket(outboundPacket = {}) {
  if (!outboundPacket || typeof outboundPacket !== 'object') return outboundPacket;
  if (outboundPacket.contract) normalizeContract(outboundPacket.contract);
  if (outboundPacket.flightPacket) normalizePacket(outboundPacket.flightPacket);
  return outboundPacket;
}

function handleOutboundPacket(event = {}) {
  normalizeOutboundPacket(event.detail?.outboundPacket || window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET || null);
}

function optionMarkup(options = [], selected = '') {
  const values = options.map(([value]) => value);
  const current = values.includes(String(selected || '').trim()) ? String(selected || '').trim() : values[0];
  return options.map(([value, label]) => `<option value="${value}"${value === current ? ' selected' : ''}>${label}</option>`).join('');
}

function valueOrFirst(value = '', options = []) {
  const values = options.map(([entry]) => entry);
  return values.includes(String(value || '').trim()) ? String(value || '').trim() : values[0];
}

function setLabelName(control, name) {
  const label = control?.closest?.('label') || (control?.id ? document.querySelector(`label[for="${control.id}"]`) : null);
  if (!label) return;
  const span = label.querySelector('span:first-child');
  if (span) span.textContent = name;
  else if (label.firstChild?.nodeType === Node.TEXT_NODE) label.firstChild.textContent = name;
}

function replaceWithSelect(control, options, className, id = '') {
  if (!control) return null;
  const selected = valueOrFirst(control.value, options);
  if (control.tagName === 'SELECT') {
    control.innerHTML = optionMarkup(options, selected);
    control.value = selected;
    if (className) control.className = className;
    return control;
  }
  const select = document.createElement('select');
  if (id || control.id) select.id = id || control.id;
  if (className || control.className) select.className = className || control.className;
  select.autocomplete = 'off';
  select.innerHTML = optionMarkup(options, selected);
  select.value = selected;
  control.replaceWith(select);
  return select;
}

function installOntologyFieldCss() {
  if (document.getElementById('hushPhase31OntologyFieldsStyle')) return;
  const style = document.createElement('style');
  style.id = 'hushPhase31OntologyFieldsStyle';
  style.textContent = `
    #hushPhase31SaveCorpusEdits[data-save-state="saved"] {
      border-color: rgba(49,255,138,.72) !important;
      background: linear-gradient(135deg, rgba(202,255,223,.96), rgba(49,255,138,.82)) !important;
      color: #031009 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.62), 0 0 22px rgba(49,255,138,.28) !important;
    }
    #hushPhase31SaveCorpusEdits[data-save-state="saving"] {
      opacity: .72 !important;
    }
    #hushPhase31EditCorpusList select.hush-phase31-edit-context,
    #hushPhase31EditCorpusList select.hush-phase31-edit-category,
    #hushPhase31ContextLabel,
    #hushPhase31SampleCategory {
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);
}

function ensureOntologyFields() {
  const discourse = document.getElementById('hushPhase31SampleCategory');
  if (discourse) {
    setLabelName(discourse, 'Discourse Mode');
    discourse.innerHTML = optionMarkup(HUSH_DISCOURSE_MODES, discourse.value);
    discourse.value = valueOrFirst(discourse.value, HUSH_DISCOURSE_MODES);
  }
  const trigger = replaceWithSelect(document.getElementById('hushPhase31ContextLabel'), HUSH_RETRIEVAL_TRIGGERS, '', 'hushPhase31ContextLabel');
  if (trigger) setLabelName(trigger, 'Retrieval Trigger');
  const contextsLabel = document.querySelector('#hushPhase31CategoryCount')?.nextElementSibling;
  if (contextsLabel) contextsLabel.textContent = 'routes';
}

function ensureEditRows() {
  const list = document.getElementById('hushPhase31EditCorpusList');
  if (!list) return false;
  if (list.dataset.td613CarouselOwned === 'true' || window.__TD613_HUSH_PHASE31_NATIVE_EDIT_CAROUSEL__?.version?.includes('snap-carousel')) {
    return true;
  }
  list.querySelectorAll('.hush-phase31-edit-sample').forEach((row) => {
    const category = row.querySelector('.hush-phase31-edit-category');
    if (category) {
      setLabelName(category, 'Discourse Mode');
      category.innerHTML = optionMarkup(HUSH_DISCOURSE_MODES, category.value);
      category.value = valueOrFirst(category.value, HUSH_DISCOURSE_MODES);
    }
    const trigger = replaceWithSelect(row.querySelector('.hush-phase31-edit-context'), HUSH_RETRIEVAL_TRIGGERS, 'hush-phase31-edit-context');
    if (trigger) setLabelName(trigger, 'Retrieval Trigger');
  });
  if (list.dataset.td613OntologyObserved !== 'true') {
    list.dataset.td613OntologyObserved = 'true';
    new MutationObserver(() => ensureEditRows()).observe(list, { childList: true, subtree: true });
  }
  return true;
}

function samplesFromEditRows() {
  return Array.from(document.querySelectorAll('#hushPhase31EditCorpusList .hush-phase31-edit-sample')).map((row) => ({
    text: String(row.querySelector('.hush-phase31-edit-text')?.value || '').trim(),
    promptCategory: valueOrFirst(row.querySelector('.hush-phase31-edit-category')?.value, HUSH_DISCOURSE_MODES),
    discourseMode: valueOrFirst(row.querySelector('.hush-phase31-edit-category')?.value, HUSH_DISCOURSE_MODES),
    contextLabel: valueOrFirst(row.querySelector('.hush-phase31-edit-context')?.value, HUSH_RETRIEVAL_TRIGGERS),
    retrievalTrigger: valueOrFirst(row.querySelector('.hush-phase31-edit-context')?.value, HUSH_RETRIEVAL_TRIGGERS)
  })).filter((sample) => sample.text);
}

function bindOntologySaveState() {
  return false;
}

function installCustomizerVisibilityCss() {
  if (document.getElementById('hushPhase31VisibilityGuardStyle')) return;
  const style = document.createElement('style');
  style.id = 'hushPhase31VisibilityGuardStyle';
  style.textContent = `
    #hushPhase31CustomizerPanel[hidden],
    #hushPhase31CustomizerPanel[data-td613-mode="masks"] {
      display: none !important;
      visibility: hidden !important;
      min-height: 0 !important;
      height: 0 !important;
      max-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) {
      overflow: visible !important;
      min-height: 28rem !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-corpus-meter,
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-sample-tools,
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-ledger-head,
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-actions,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31SampleStatus,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31ResetCustomizer,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31EditCorpus {
      visibility: visible !important;
      opacity: 1 !important;
      transform: none !important;
      max-height: none !important;
      pointer-events: auto !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-corpus-meter,
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-sample-tools,
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-ledger-head {
      display: grid !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-ledger-head .hush-phase31-label {
      min-width: 0 !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31DraftUtility,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31ClearDraft {
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-actions {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
      gap: .62rem !important;
      align-items: stretch !important;
      margin-top: .72rem !important;
      width: 100% !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31LogSampleBtn,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31SaveMaskBtn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 3.15rem !important;
      margin: 0 !important;
      border-radius: 999px !important;
      font-size: .76rem !important;
      letter-spacing: .13em !important;
      line-height: 1 !important;
      white-space: nowrap !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31LogSampleBtn {
      border: 1px solid rgba(202,255,223,.72) !important;
      background: linear-gradient(135deg, rgba(202,255,223,.96) 0%, rgba(137,255,240,.76) 35%, rgba(49,255,138,.78) 66%, rgba(189,147,249,.32) 100%) !important;
      color: #04120a !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.72), inset 0 -10px 18px rgba(4,24,14,.18), 0 0 22px rgba(49,255,138,.28), 0 14px 30px rgba(49,255,138,.14) !important;
      text-shadow: 0 1px 0 rgba(255,255,255,.45) !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31LogSampleBtn:hover,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31LogSampleBtn:focus-visible {
      background: linear-gradient(135deg, rgba(236,255,244,.98) 0%, rgba(137,255,240,.82) 34%, rgba(49,255,138,.86) 68%, rgba(189,147,249,.38) 100%) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.78), inset 0 -10px 18px rgba(4,24,14,.16), 0 0 28px rgba(49,255,138,.34), 0 16px 34px rgba(49,255,138,.16) !important;
    }
    #hushPhase31CorpusExportLink {
      appearance: none !important;
      -webkit-appearance: none !important;
      position: absolute !important;
      top: 4.46rem !important;
      right: 2.04rem !important;
      z-index: 6 !important;
      display: inline !important;
      min-width: 0 !important;
      min-height: 0 !important;
      width: auto !important;
      height: auto !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      color: rgba(236,255,244,.96) !important;
      font-family: var(--font-mono, ui-monospace, monospace) !important;
      font-size: .42rem !important;
      font-weight: 500 !important;
      line-height: 1 !important;
      letter-spacing: .055em !important;
      text-transform: lowercase !important;
      text-decoration: none !important;
      cursor: pointer !important;
      text-shadow: 0 0 8px rgba(49,255,138,.42) !important;
    }
    #hushPhase31CorpusExportLink:hover,
    #hushPhase31CorpusExportLink:focus-visible {
      color: rgba(202,255,223,1) !important;
      text-decoration: underline !important;
      text-underline-offset: 2px !important;
      outline: none !important;
      text-shadow: 0 0 12px rgba(49,255,138,.48) !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31Undo {
      grid-column: 1 / -1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      min-height: 2.55rem !important;
      margin: .16rem 0 0 !important;
      border-radius: 999px !important;
      letter-spacing: .14em !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushVoiceReferenceSamplesSaved {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      min-height: 7.2rem !important;
      max-height: 14rem !important;
      pointer-events: auto !important;
      resize: vertical !important;
      margin-top: .18rem !important;
      margin-bottom: .18rem !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31SampleStatus {
      display: block !important;
      margin: .72rem 0 .28rem !important;
      padding: 0 !important;
      min-height: 1.4rem !important;
      line-height: 1.28 !important;
      color: rgba(230,243,255,.92) !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31ResetCustomizer {
      display: block !important;
      width: max-content !important;
      visibility: visible !important;
      opacity: 1 !important;
      margin: .72rem auto 0 !important;
      pointer-events: auto !important;
    }
    .hush-phase31-status {
      min-width: 4.85rem !important;
      max-width: 5.45rem !important;
      min-height: 3.05rem !important;
      padding: .34rem .42rem !important;
      font-size: .44rem !important;
      line-height: 1.34 !important;
      letter-spacing: .095em !important;
      text-align: center !important;
      white-space: normal !important;
    }
  `;
  document.head.appendChild(style);
}

function isCustomizeActive() {
  return document.getElementById('hushCustomizeTabBtn')?.getAttribute('aria-pressed') === 'true';
}

function hideCustomizerCockpit() {
  const panel = document.getElementById('hushPhase31CustomizerPanel');
  if (!panel) return false;
  panel.hidden = true;
  panel.dataset.td613Mode = 'masks';
  panel.setAttribute('aria-hidden', 'true');
  panel.style.setProperty('display', 'none', 'important');
  return true;
}

function sampleWordCount(value = '') {
  return (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
}

function readDraftSample() {
  const area = document.getElementById('hushVoiceReferenceSamplesSaved');
  if (!area) return '';
  const value = String(area.value || '').trim();
  return value.replace(/--- sample \d+[\s\S]*?(?=(?:\n\n)?--- sample \d+|$)/g, '').trim() || value;
}

function readStoredSamples() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HUSH_PHASE31_STORAGE_KEY) || '{}');
    return Array.isArray(parsed.samples) ? parsed.samples.filter((sample) => String(sample?.text || '').trim()) : [];
  } catch (error) {
    return [];
  }
}

function writeStoredSamples(nextSamples = []) {
  const clean = nextSamples
    .map((sample) => {
      const promptCategory = valueOrFirst(sample?.discourseMode || sample?.promptCategory || sample?.contextLabel, HUSH_DISCOURSE_MODES);
      const contextLabel = valueOrFirst(sample?.retrievalTrigger || sample?.contextLabel, HUSH_RETRIEVAL_TRIGGERS);
      return {
        text: String(sample?.text || '').trim(),
        promptCategory,
        discourseMode: promptCategory,
        contextLabel,
        retrievalTrigger: contextLabel
      };
    })
    .filter((sample) => sample.text);
  try {
    if (!clean.length) localStorage.removeItem(HUSH_PHASE31_STORAGE_KEY);
    else localStorage.setItem(HUSH_PHASE31_STORAGE_KEY, JSON.stringify({ version: 'phase31-logged-samples/v2-ontology-fields', updatedAt: new Date().toISOString(), samples: clean }));
  } catch (error) {}
  return clean;
}

function appendStoredSample(sample) {
  if (!sample?.text || sampleWordCount(sample.text) < 75) return;
  const current = readStoredSamples();
  const promptCategory = valueOrFirst(sample?.promptCategory || sample?.discourseMode, HUSH_DISCOURSE_MODES);
  const contextLabel = valueOrFirst(sample?.contextLabel || sample?.retrievalTrigger, HUSH_RETRIEVAL_TRIGGERS);
  const nextSample = { ...sample, promptCategory, discourseMode: promptCategory, contextLabel, retrievalTrigger: contextLabel };
  const duplicate = current.some((entry) => entry.text === nextSample.text && entry.promptCategory === nextSample.promptCategory && entry.contextLabel === nextSample.contextLabel);
  if (!duplicate) writeStoredSamples(current.concat(nextSample));
}

function corpusExportDocument() {
  const clean = readStoredSamples().map((sample) => ({
    text: String(sample?.text || '').trim(),
    promptCategory: valueOrFirst(sample?.discourseMode || sample?.promptCategory, HUSH_DISCOURSE_MODES),
    contextLabel: valueOrFirst(sample?.retrievalTrigger || sample?.contextLabel, HUSH_RETRIEVAL_TRIGGERS)
  })).filter((sample) => sample.text);
  const totalWords = clean.reduce((sum, sample) => sum + sampleWordCount(sample.text), 0);
  const contexts = new Set(clean.map((sample) => sample.contextLabel || sample.promptCategory)).size;
  const header = [
    'TD613 Hush Customizer Mask Corpus',
    `Exported: ${new Date().toISOString()}`,
    `Samples: ${clean.length}`,
    `Words: ${totalWords}`,
    `Routes: ${contexts}`,
    ''
  ].join('\n');
  const body = clean.length
    ? clean.map((sample, index) => [
        `--- sample ${index + 1} ---`,
        `discourse_mode: ${sample.promptCategory}`,
        `retrieval_trigger: ${sample.contextLabel}`,
        `words: ${sampleWordCount(sample.text)}`,
        '',
        sample.text
      ].join('\n')).join('\n\n')
    : 'No logged customizer samples were found in this browser.';
  return `${header}\n${body}\n`;
}

function exportCorpusDocument() {
  const status = document.getElementById('hushPhase31SampleStatus');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const blob = new Blob([corpusExportDocument()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `td613-hush-customizer-corpus-${stamp}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  if (status) {
    const clean = readStoredSamples();
    const wordTotal = clean.reduce((sum, sample) => sum + sampleWordCount(sample?.text || ''), 0);
    status.textContent = `Exported customizer corpus: ${clean.length} samples · ${wordTotal} words.`;
  }
}

function ensureCorpusExportControl() {
  const panel = document.getElementById('hushPhase31CustomizerPanel');
  if (!panel) return false;
  let link = document.getElementById('hushPhase31CorpusExportLink');
  if (!link) {
    link = document.createElement('button');
    link.id = 'hushPhase31CorpusExportLink';
    link.type = 'button';
    link.textContent = 'export';
    link.setAttribute('aria-label', 'Export the full customizer mask corpus in logged order');
    panel.appendChild(link);
  }
  if (link.dataset.td613CorpusExportBound !== 'true') {
    link.dataset.td613CorpusExportBound = 'true';
    link.addEventListener('click', exportCorpusDocument);
  }
  return true;
}

function bindSamplePersistence() {
  const logButton = document.getElementById('hushPhase31LogSampleBtn');
  const undoButton = document.getElementById('hushPhase31Undo');
  const resetButton = document.getElementById('hushPhase31ResetCustomizer');
  if (logButton && logButton.dataset.td613PersistBound !== 'true') {
    logButton.dataset.td613PersistBound = 'true';
    logButton.addEventListener('click', () => {
      if (window.__TD613_HUSH_PHASE31_REHYDRATING__) return;
      const text = readDraftSample();
      const promptCategory = valueOrFirst(document.getElementById('hushPhase31SampleCategory')?.value, HUSH_DISCOURSE_MODES);
      const contextLabel = valueOrFirst(document.getElementById('hushPhase31ContextLabel')?.value, HUSH_RETRIEVAL_TRIGGERS);
      window.setTimeout(() => appendStoredSample({ text, promptCategory, discourseMode: promptCategory, contextLabel, retrievalTrigger: contextLabel }), 0);
    }, true);
  }
  if (undoButton && undoButton.dataset.td613PersistBound !== 'true') {
    undoButton.dataset.td613PersistBound = 'true';
    undoButton.addEventListener('click', () => {
      if (window.__TD613_HUSH_PHASE31_REHYDRATING__) return;
      window.setTimeout(() => {
        const current = readStoredSamples();
        current.pop();
        writeStoredSamples(current);
      }, 0);
    }, true);
  }
  if (resetButton && resetButton.dataset.td613PersistBound !== 'true') {
    resetButton.dataset.td613PersistBound = 'true';
    resetButton.addEventListener('click', () => {
      window.setTimeout(() => writeStoredSamples([]), 0);
    }, true);
  }
}

function rehydrateStoredSamples() {
  return Boolean(window.__TD613_HUSH_PHASE31_CUSTOMIZER__?.rehydrateStoredSamples?.());
}

function ensureClearDraftControl() {
  const area = document.getElementById('hushVoiceReferenceSamplesSaved');
  const clear = document.getElementById('hushPhase31ClearDraft');
  if (!area || !clear) return false;
  if (clear.dataset.td613ClearDraftBound !== 'true') {
    clear.dataset.td613ClearDraftBound = 'true';
    clear.addEventListener('click', () => {
      area.value = '';
      area.dispatchEvent(new Event('input', { bubbles: true }));
      area.focus({ preventScroll: true });
    });
  }
  return true;
}

function restoreCustomizerCockpit() {
  installCustomizerVisibilityCss();
  installOntologyFieldCss();
  ensureClearDraftControl();
  ensureCorpusExportControl();
  ensureOntologyFields();
  ensureEditRows();
  bindOntologySaveState();
  const panel = document.getElementById('hushPhase31CustomizerPanel');
  if (!panel) return false;
  if (!isCustomizeActive()) return hideCustomizerCockpit();
  panel.hidden = false;
  panel.dataset.td613Mode = 'customize';
  panel.removeAttribute('aria-hidden');
  panel.style.removeProperty('display');
  panel.style.removeProperty('height');
  panel.style.removeProperty('max-height');
  panel.style.removeProperty('margin');
  panel.style.removeProperty('padding');
  ['hushPhase31CorpusFill', 'hushPhase31SampleCategory', 'hushPhase31ContextLabel', 'hushVoiceReferenceSamplesSaved', 'hushPhase31LogSampleBtn', 'hushPhase31SaveMaskBtn', 'hushPhase31Undo', 'hushPhase31ResetCustomizer', 'hushPhase31SampleStatus', 'hushPhase31DraftUtility', 'hushPhase31ClearDraft', 'hushPhase31CorpusExportLink', 'hushPhase31EditCorpus'].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.hidden = false;
    node.removeAttribute('aria-hidden');
    node.style.removeProperty('display');
    node.style.removeProperty('visibility');
    node.style.removeProperty('opacity');
  });
  return true;
}

function scheduleCustomizerRestore() {
  restoreCustomizerCockpit();
  window.setTimeout(restoreCustomizerCockpit, 180);
  window.setTimeout(restoreCustomizerCockpit, 520);
}

if (typeof window !== 'undefined') {
  window.addEventListener('td613:hush:outbound-packet', handleOutboundPacket);
  window.addEventListener('click', (event) => {
    if (event.target?.id === 'hushCustomizeTabBtn' || event.target?.closest?.('#hushCustomizeTabBtn') || event.target?.id === 'hushBuiltInTabBtn' || event.target?.closest?.('#hushBuiltInTabBtn') || event.target?.id === 'hushPhase31EditCorpus' || event.target?.closest?.('#hushPhase31EditCorpus')) scheduleCustomizerRestore();
  }, true);
  window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ = { version: HUSH_SOURCE_LAYOUT_POLICY_VERSION, normalizeContract, normalizePacket, normalizeOutboundPacket, restoreCustomizerCockpit, hideCustomizerCockpit, ensureClearDraftControl, ensureCorpusExportControl, ensureOntologyFields, ensureEditRows, corpusExportDocument, exportCorpusDocument, readStoredSamples, writeStoredSamples, rehydrateStoredSamples };
  if (window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET) normalizeOutboundPacket(window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleCustomizerRestore, { once: true });
  else scheduleCustomizerRestore();
  window.addEventListener('td613:hush:core-ready', scheduleCustomizerRestore, { once: true });
}
