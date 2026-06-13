const HUSH_SOURCE_LAYOUT_POLICY_VERSION = 'source-layout-policy/v1-mask-only';

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

if (typeof window !== 'undefined') {
  window.addEventListener('td613:hush:outbound-packet', handleOutboundPacket);
  window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ = { version: HUSH_SOURCE_LAYOUT_POLICY_VERSION, normalizeContract, normalizePacket, normalizeOutboundPacket };
  if (window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET) normalizeOutboundPacket(window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET);
}
