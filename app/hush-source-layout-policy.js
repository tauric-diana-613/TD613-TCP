const HUSH_SOURCE_LAYOUT_POLICY_VERSION = 'source-layout-policy/v2-mask-only+native-customizer-corpus';
const HUSH_PHASE31_STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';

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
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31ResetCustomizer {
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
    .map((sample) => ({
      text: String(sample?.text || '').trim(),
      promptCategory: String(sample?.promptCategory || sample?.contextLabel || 'uncategorized').trim() || 'uncategorized',
      contextLabel: String(sample?.contextLabel || sample?.promptCategory || 'uncategorized').trim() || 'uncategorized'
    }))
    .filter((sample) => sample.text);
  try {
    if (!clean.length) localStorage.removeItem(HUSH_PHASE31_STORAGE_KEY);
    else localStorage.setItem(HUSH_PHASE31_STORAGE_KEY, JSON.stringify({ version: 'phase31-logged-samples/v1', updatedAt: new Date().toISOString(), samples: clean }));
  } catch (error) {}
  return clean;
}

function appendStoredSample(sample) {
  if (!sample?.text || sampleWordCount(sample.text) < 75) return;
  const current = readStoredSamples();
  const duplicate = current.some((entry) => entry.text === sample.text && entry.promptCategory === sample.promptCategory && entry.contextLabel === sample.contextLabel);
  if (!duplicate) writeStoredSamples(current.concat(sample));
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
      const promptCategory = String(document.getElementById('hushPhase31SampleCategory')?.value || 'uncategorized').trim() || 'uncategorized';
      const contextLabel = String(document.getElementById('hushPhase31ContextLabel')?.value || promptCategory).trim() || promptCategory;
      window.setTimeout(() => appendStoredSample({ text, promptCategory, contextLabel }), 0);
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
  ensureClearDraftControl();
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
  ['hushPhase31CorpusFill', 'hushPhase31SampleCategory', 'hushPhase31ContextLabel', 'hushVoiceReferenceSamplesSaved', 'hushPhase31LogSampleBtn', 'hushPhase31SaveMaskBtn', 'hushPhase31Undo', 'hushPhase31ResetCustomizer', 'hushPhase31SampleStatus', 'hushPhase31DraftUtility', 'hushPhase31ClearDraft'].forEach((id) => {
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
  [0, 80, 180, 360, 720, 1200, 2200].forEach((delay) => window.setTimeout(restoreCustomizerCockpit, delay));
}

if (typeof window !== 'undefined') {
  window.addEventListener('td613:hush:outbound-packet', handleOutboundPacket);
  window.addEventListener('click', (event) => {
    if (event.target?.id === 'hushCustomizeTabBtn' || event.target?.closest?.('#hushCustomizeTabBtn') || event.target?.id === 'hushBuiltInTabBtn' || event.target?.closest?.('#hushBuiltInTabBtn')) scheduleCustomizerRestore();
  }, true);
  window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ = { version: HUSH_SOURCE_LAYOUT_POLICY_VERSION, normalizeContract, normalizePacket, normalizeOutboundPacket, restoreCustomizerCockpit, hideCustomizerCockpit, ensureClearDraftControl, readStoredSamples, writeStoredSamples, rehydrateStoredSamples };
  if (window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET) normalizeOutboundPacket(window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleCustomizerRestore, { once: true });
  else scheduleCustomizerRestore();
  window.addEventListener('load', scheduleCustomizerRestore, { once: true });
}
