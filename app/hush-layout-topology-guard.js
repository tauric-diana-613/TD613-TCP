const VERSION = 'hush-layout-topology-guard/v3-underdistributed-output';

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
  engine.generator_constraints = { ...(engine.generator_constraints || {}), preserve_layout_topology: true, preserve_source_paragraph_units: true, do_not_flatten_paragraph_sensitive_source: true, preserve_source_layout_cadence: false, preserve_mask_layout_cadence: true, output_layout_mode: m, avoid_underdistributed_single_break_output: true };
  packet.generator_constraints = { ...(packet.generator_constraints || {}), preserve_layout_topology: true, preserve_source_paragraph_units: true, do_not_flatten_paragraph_sensitive_source: true, preserve_source_layout_cadence: false, preserve_mask_layout_cadence: true, output_layout_mode: m, avoid_underdistributed_single_break_output: true };
  return packet;
}
function patchContract(contract = {}) {
  if (!contract || typeof contract !== 'object') return contract;
  const packet = contract.flightPacket || contract.flight_packet || null;
  const m = mode(packet || contract);
  const instruction = `${law(m)} Avoid outputs with one short opening paragraph followed by one long slab; redistribute paragraph breaks across the full output when the candidate is multi-unit.`;
  contract.sourceLayoutPolicy = { version: VERSION, source_layout_topology_required: true, preserve_source_paragraph_units: true, exact_source_linebreak_pattern_exported: false, mask_layout_rules_drive_output: true, avoid_underdistributed_single_break_output: true, instruction };
  contract.rules = Array.isArray(contract.rules) ? contract.rules.filter((rule) => !/reading context only|do not copy or preserve source line breaks|Avoid outputs with one short opening paragraph/i.test(String(rule || ''))).concat(instruction) : [instruction];
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
function wordCount(value = '') { return (String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
function paragraphBlocks(value = '') { return norm(value).split(/\n\s*\n/u).map((part) => part.trim()).filter(Boolean); }
function targetGroupCount(units = [], sourceTopo = {}, outputMode = 'natural-mask-pacing') {
  if (outputMode === 'indexed-anchor-blocks' || outputMode === 'bounded-fracture-lines') return units.length;
  if (outputMode === 'short-handoff-paragraphs') return Math.min(2, Math.max(1, units.length));
  if (sourceTopo.has_paragraph_breaks) return Math.min(sourceTopo.paragraph_break_count + 1, units.length);
  if (units.length >= 9) return 4;
  if (units.length >= 5) return 3;
  if (units.length >= 3) return 2;
  return 1;
}
function hasUnderdistributedBreaks(value = '', sourceText = '', outputMode = 'natural-mask-pacing') {
  const clean = norm(value).trim();
  if (!clean.includes('\n')) return true;
  const units = splitUnits(clean);
  if (units.length <= 2) return false;
  const blocks = paragraphBlocks(clean);
  const sourceTopo = topology(sourceText);
  const target = targetGroupCount(units, sourceTopo, outputMode);
  const maxWords = Math.max(...blocks.map(wordCount), 0);
  const minWords = Math.min(...blocks.map(wordCount), Infinity);
  if (outputMode === 'indexed-anchor-blocks' || outputMode === 'bounded-fracture-lines') return topology(clean).non_empty_line_count < Math.min(units.length, 3);
  if (blocks.length < target) return true;
  if (blocks.length <= 2 && units.length >= 5 && maxWords >= 85) return true;
  if (blocks.length === 2 && minWords <= 18 && maxWords >= 60) return true;
  return false;
}
function regroupUnits(units = [], sourceTopo = {}, outputMode = 'natural-mask-pacing') {
  if (outputMode === 'indexed-anchor-blocks' || outputMode === 'bounded-fracture-lines') return units.join('\n');
  if (outputMode === 'short-handoff-paragraphs') return units.length <= 2 ? units.join('\n\n') : `${units.slice(0, 2).join(' ')}\n\n${units.slice(2).join(' ')}`;
  const target = targetGroupCount(units, sourceTopo, outputMode);
  if (target <= 1) return units.join(' ');
  const groups = [];
  const base = Math.floor(units.length / target);
  const rem = units.length % target;
  let cursor = 0;
  for (let i = 0; i < target; i += 1) {
    const size = base + (i < rem ? 1 : 0);
    groups.push(units.slice(cursor, cursor + size).join(' '));
    cursor += size;
  }
  return groups.filter(Boolean).join('\n\n');
}
function repairOutputLayout(output = '', sourceText = '', outputMode = 'natural-mask-pacing') {
  const clean = norm(output).trim();
  if (!clean) return clean;
  const topo = topology(sourceText);
  const units = splitUnits(clean);
  const needsLayout = topo.has_paragraph_breaks || topo.has_single_line_breaks || outputMode !== 'natural-mask-pacing' || hasUnderdistributedBreaks(clean, sourceText, outputMode);
  if (!needsLayout || units.length <= 1) return clean;
  if (!hasUnderdistributedBreaks(clean, sourceText, outputMode) && clean.includes('\n')) return clean;
  return regroupUnits(units, topo, outputMode);
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
  window.__TD613_HUSH_LAYOUT_TOPOLOGY_GUARD__ = Object.freeze({ version: VERSION, topology, patchPacket, patchContract, normalizeOutboundPacket, mode, repairOutputLayout, repairLiveOutput, hasUnderdistributedBreaks });
  window.__TD613_HUSH_SOURCE_LAYOUT_POLICY__ = { ...prior, version: VERSION, captureLayoutTopology: topology, normalizePacket: patchPacket, normalizeContract: patchContract, normalizeOutboundPacket };
  window.addEventListener('td613:hush:outbound-packet', handle);
  window.addEventListener('td613:hush:patch38-result', scheduleLiveRepair);
  window.addEventListener('td613:hush:provider-log', scheduleLiveRepair);
  window.addEventListener('click', (event) => { if (event.target?.id === 'generateMaskedOutputBtn' || event.target?.closest?.('#generateMaskedOutputBtn')) scheduleLiveRepair(); }, true);
  if (window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET) normalizeOutboundPacket(window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleLiveRepair, { once: true });
  else scheduleLiveRepair();
}
