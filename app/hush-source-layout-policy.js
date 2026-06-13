const HUSH_SOURCE_LAYOUT_POLICY_VERSION = 'source-layout-policy/v1-mask-only+customizer-visibility-guard';

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
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-ledger-head {
      display: grid !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-sample-tools {
      display: grid !important;
    }
    #hushPhase31CustomizerPanel:not([hidden]) .hush-phase31-actions {
      display: flex !important;
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
    }
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31LogSampleBtn,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31SaveMaskBtn,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31Undo,
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31ResetCustomizer {
      display: inline-flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);
}

function restoreCustomizerCockpit() {
  installCustomizerVisibilityCss();
  const panel = document.getElementById('hushPhase31CustomizerPanel');
  const customizeTab = document.getElementById('hushCustomizeTabBtn');
  const customizerActive = customizeTab?.getAttribute('aria-pressed') === 'true';
  if (!panel || !customizerActive) return false;
  panel.hidden = false;
  panel.style.removeProperty('display');
  ['hushPhase31CorpusFill', 'hushPhase31SampleCategory', 'hushPhase31ContextLabel', 'hushVoiceReferenceSamplesSaved', 'hushPhase31LogSampleBtn', 'hushPhase31SaveMaskBtn', 'hushPhase31Undo', 'hushPhase31ResetCustomizer', 'hushPhase31SampleStatus'].forEach((id) => {
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
    if (event.target?.id === 'hushCustomizeTabBtn' || event.target?.closest?.('#hushCustomizeTabBtn')) scheduleCustomizerRestore();
  }, true);
  window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ = { version: HUSH_SOURCE_LAYOUT_POLICY_VERSION, normalizeContract, normalizePacket, normalizeOutboundPacket, restoreCustomizerCockpit };
  if (window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET) normalizeOutboundPacket(window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleCustomizerRestore, { once: true });
  else scheduleCustomizerRestore();
  window.addEventListener('load', scheduleCustomizerRestore, { once: true });
}
