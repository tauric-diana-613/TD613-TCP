const VERSION = 'hush-layout-topology-guard/v2-live-output';

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
function domMode(doc = document) {
  const select = doc?.getElementById?.('maskFieldSelect');
  const label = `${select?.value || ''} ${select?.selectedOptions?.[0]?.textContent || ''}`.toLowerCase();
  if (/luz|clipboard|index|custodial/.test(label)) return 'indexed-anchor-blocks';
  if (/cryo|cristiano|handoff|quick/.test(label)) return 'short-handoff-paragraphs';
  if (/rex|fractura|jagged/.test(label)) return 'bounded-fracture-lines';
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
function splitUnits(value = '') {
  const body = norm(value).replace(/\s+/g, ' ').trim();
  if (!body) return [];
  const sentenceUnits = body.match(/[^.!?]+[.!?]+(?:["'”’])?|[^.!?]+$/g)?.map((unit) => unit.trim()).filter(Boolean) || [];
  if (sentenceUnits.length > 1) return sentenceUnits;
  const semiUnits = body.split(/\s*;\s*/u).map((unit) => unit.trim()).filter(Boolean);
  return semiUnits.length > 1 ? semiUnits.map((unit, index) => index < semiUnits.length - 1 ? `${unit};` : unit) : [body];
}
function repairOutputLayout(output = '', sourceText = '', outputMode = 'natural-mask-pacing') {
  const clean = norm(output).trim();
  if (!clean || clean.includes('\n')) return clean;
  const topo = topology(sourceText);
  const needsLayout = topo.has_paragraph_breaks || topo.has_single_line_breaks || outputMode !== 'natural-mask-pacing';
  if (!needsLayout) return clean;
  const units = splitUnits(clean);
  if (units.length <= 1) return clean;
  if (outputMode === 'indexed-anchor-blocks') return units.join('\n');
  if (outputMode === 'bounded-fracture-lines') return units.join('\n');
  if (outputMode === 'short-handoff-paragraphs') return units.length <= 2 ? units.join('\n\n') : `${units.slice(0, 2).join(' ')}\n\n${units.slice(2).join(' ')}`;
  if (topo.has_paragraph_breaks) {
    const target = Math.min(topo.paragraph_break_count + 1, units.length);
    const groupSize = Math.ceil(units.length / target);
    const groups = [];
    for (let i = 0; i < units.length; i += groupSize) groups.push(units.slice(i, i + groupSize).join(' '));
    return groups.join('\n\n');
  }
  return units.join('\n');
}
function repairLiveOutput(doc = document) {
  const input = doc?.getElementById?.('messageDraftInput');
  const output = doc?.getElementById?.('protectedOutputInput');
  if (!input || !output) return false;
  const before = output.value || '';
  const after = repairOutputLayout(before, input.value || '', domMode(doc));
  if (after === before) return false;
  output.value = after;
  output.dataset.hushLayoutRepaired = VERSION;
  if (window.__TD613_HUSH_PATCH38_LAST_RESULT) window.__TD613_HUSH_PATCH38_LAST_RESULT.selectedOutput = after;
  if (window.__TD613_HUSH_PATCH38_LAST_RESULT) window.__TD613_HUSH_PATCH38_LAST_RESULT.layoutRepairApplied = true;
  output.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}
function handle(event = {}) {
  const packet = event.detail?.outboundPacket || window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET || null;
  normalizeOutboundPacket(packet);
  window.setTimeout(() => normalizeOutboundPacket(packet), 0);
  window.setTimeout(() => normalizeOutboundPacket(packet), 80);
}
function scheduleLiveRepair() {
  window.setTimeout(() => repairLiveOutput(document), 0);
  window.setTimeout(() => repairLiveOutput(document), 90);
  window.setTimeout(() => repairLiveOutput(document), 360);
}
if (typeof window !== 'undefined') {
  const prior = window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ || {};
  window.__TD613_HUSH_LAYOUT_TOPOLOGY_GUARD__ = Object.freeze({ version: VERSION, topology, patchPacket, patchContract, normalizeOutboundPacket, mode, repairOutputLayout, repairLiveOutput });
  window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ = { ...prior, version: VERSION, captureLayoutTopology: topology, normalizePacket: patchPacket, normalizeContract: patchContract, normalizeOutboundPacket };
  window.addEventListener('td613:hush:outbound-packet', handle);
  window.addEventListener('td613:hush:patch38-result', scheduleLiveRepair);
  window.addEventListener('td613:hush:provider-log', scheduleLiveRepair);
  window.addEventListener('click', (event) => { if (event.target?.id === 'generateMaskedOutputBtn' || event.target?.closest?.('#generateMaskedOutputBtn')) scheduleLiveRepair(); }, true);
  if (window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET) normalizeOutboundPacket(window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleLiveRepair, { once: true });
  else scheduleLiveRepair();
}
