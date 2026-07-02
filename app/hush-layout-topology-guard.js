const VERSION = 'hush-layout-topology-guard/v1';

function norm(value = '') { return String(value ?? '').replace(/\r\n?/g, '\n'); }
function topology(value = '') {
  const body = norm(value);
  const lines = body.split('\n');
  const paras = (body.match(/\n\s*\n/g) || []).length;
  return {
    schema_version: 'td613.hush.layout-topology/v1',
    line_count: lines.length,
    non_empty_line_count: lines.filter((line) => line.trim()).length,
    paragraph_break_count: paras,
    has_paragraph_breaks: paras > 0,
    has_single_line_breaks: /[^\n]\n(?!\s*\n)/u.test(body),
    has_numbered_lines: /^\s*\d+[.)]\s+/mu.test(body),
    has_bullet_lines: /^\s*[-*•]\s+/mu.test(body),
    exact_linebreak_pattern_exported: false,
    raw_line_text_exported: false
  };
}
function mode(packet = {}) {
  const label = String(packet.mask_label || packet.maskLabel || packet.mask_context?.mask_label || packet.mask_context?.maskId || '').toLowerCase();
  const family = String(packet.mask_family || packet.maskFamily || packet.mask_style_vector?.family || '').toLowerCase();
  const joined = `${label} ${family}`;
  if (/luz|clipboard|index|custodial/.test(joined)) return 'indexed-anchor-blocks';
  if (/cryo|cristiano|handoff|quick/.test(joined)) return 'short-handoff-paragraphs';
  if (/rex|fractura|jagged/.test(joined)) return 'bounded-fracture-lines';
  return 'natural-mask-pacing';
}
function source(packet = {}) { return packet.source_text || packet.sourceText || packet.input_text || packet.inputText || packet.message || packet.user_message || packet.userMessage || packet.source_manifest?.source_text || ''; }
function law(m) { return `Keep paragraph and line-unit topology visible as structure. Do not flatten paragraph-sensitive input into one block. Do not export exact source layout pattern. Output breaks follow the selected mask layout mode (${m}).`; }
function patchPacket(packet = {}) {
  if (!packet || typeof packet !== 'object') return packet;
  const m = mode(packet);
  const topo = packet.source_layout_topology || packet.source_manifest?.source_layout_topology || topology(source(packet));
  const instruction = law(m);
  packet.source_layout_topology = topo;
  packet.source_layout_policy = { version: VERSION, source_layout_topology_required: true, preserve_source_paragraph_units: true, preserve_source_line_unit_boundaries: true, exact_source_linebreak_pattern_exported: false, mask_layout_rules_drive_output: true, instruction };
  packet.mask_layout_policy = { version: VERSION, mode: m, preserve_mask_native_breaks: true, instruction };
  if (packet.source_manifest) {
    packet.source_manifest.source_layout_constraint = 'topology-only';
    packet.source_manifest.source_layout_topology = topo;
    packet.source_manifest.exact_source_linebreak_pattern_exported = false;
  }
  const engine = packet.stylometry_engine || (packet.stylometry_engine = {});
  engine.layout_cadence_instruction = instruction;
  engine.generator_constraints = { ...(engine.generator_constraints || {}), preserve_layout_topology: true, preserve_source_paragraph_units: true, do_not_flatten_paragraph_sensitive_source: true, preserve_source_layout_cadence: false, preserve_mask_layout_cadence: true, output_layout_mode: m };
  packet.generator_constraints = { ...(packet.generator_constraints || {}), preserve_layout_topology: true, preserve_source_paragraph_units: true, do_not_flatten_paragraph_sensitive_source: true, preserve_source_layout_cadence: false, preserve_mask_layout_cadence: true, output_layout_mode: m };
  return packet;
}
function patchContract(contract = {}) {
  if (!contract || typeof contract !== 'object') return contract;
  const packet = contract.flightPacket || contract.flight_packet || null;
  const m = mode(packet || contract);
  const instruction = law(m);
  contract.sourceLayoutPolicy = { version: VERSION, source_layout_topology_required: true, preserve_source_paragraph_units: true, exact_source_linebreak_pattern_exported: false, mask_layout_rules_drive_output: true, instruction };
  contract.rules = Array.isArray(contract.rules) ? contract.rules.filter((rule) => !/reading context only|do not copy or preserve source line breaks/i.test(String(rule || ''))).concat(instruction) : [instruction];
  if (packet) patchPacket(packet);
  return contract;
}
function normalizeOutboundPacket(outboundPacket = {}) {
  if (!outboundPacket || typeof outboundPacket !== 'object') return outboundPacket;
  if (outboundPacket.contract) patchContract(outboundPacket.contract);
  if (outboundPacket.flightPacket) patchPacket(outboundPacket.flightPacket);
  if (outboundPacket.flight_packet) patchPacket(outboundPacket.flight_packet);
  return outboundPacket;
}
function handle(event = {}) {
  const packet = event.detail?.outboundPacket || window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET || null;
  normalizeOutboundPacket(packet);
  window.setTimeout(() => normalizeOutboundPacket(packet), 0);
  window.setTimeout(() => normalizeOutboundPacket(packet), 80);
}
if (typeof window !== 'undefined') {
  const prior = window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ || {};
  window.__TD613_HUSH_LAYOUT_TOPOLOGY_GUARD__ = Object.freeze({ version: VERSION, topology, patchPacket, patchContract, normalizeOutboundPacket, mode });
  window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ = { ...prior, version: VERSION, captureLayoutTopology: topology, normalizePacket: patchPacket, normalizeContract: patchContract, normalizeOutboundPacket };
  window.addEventListener('td613:hush:outbound-packet', handle);
  if (window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET) normalizeOutboundPacket(window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET);
}
