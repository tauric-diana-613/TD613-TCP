import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const guard = readFileSync(join(root, 'app/hush-layout-topology-guard.js'), 'utf8');
const compare = readFileSync(join(root, 'app/hush-compare-layout-custody.js'), 'utf8');
const bench = readFileSync(join(root, 'app/adversarial-bench.html'), 'utf8');

assert.match(compare, /hush-layout-topology-guard\.js\?v=202607020735/);
assert.match(bench, /hush-compare-layout-custody\.js/);
assert.match(guard, /preserve_source_paragraph_units/);
assert.match(guard, /preserve_source_line_unit_boundaries/);
assert.match(guard, /do_not_flatten_paragraph_sensitive_source/);
assert.match(guard, /preserve_mask_layout_cadence/);
assert.match(guard, /exact_linebreak_pattern_exported:\s*false/);
assert.match(guard, /repairOutputLayout/);
assert.match(guard, /repairLiveOutput/);

const timers = [];
const listeners = {};
const context = {
  Event: class Event { constructor(type, init = {}) { this.type = type; this.bubbles = Boolean(init.bubbles); } },
  document: { readyState: 'complete', addEventListener() {}, getElementById() { return null; } },
  window: {
    __TD613_HUSH_SOURCE_LAYOUT_POLICY__: {},
    __TD613_HUSH_PATCH38_LAST_RESULT: { selectedOutput: '' },
    addEventListener(type, handler) { listeners[type] = handler; },
    setTimeout(fn) { timers.push(fn); return timers.length; }
  }
};
vm.runInNewContext(guard, context);
const api = context.window.__TD613_HUSH_LAYOUT_TOPOLOGY_GUARD__;
assert.ok(api);

const outbound = {
  flightPacket: {
    mask_label: 'Luz of the Index',
    sourceText: 'Bundle:\n1. FILE-72 / WJCT\n2. footer mismatch\n\nCare note?\nkeep together',
    source_manifest: {},
    stylometry_engine: { generator_constraints: {} },
    generator_constraints: {}
  },
  contract: { rules: ['old layout rule'] }
};
outbound.contract.flightPacket = outbound.flightPacket;
api.normalizeOutboundPacket(outbound);
for (const fn of timers.splice(0)) fn();

assert.equal(outbound.flightPacket.source_layout_topology.paragraph_break_count, 1);
assert.equal(outbound.flightPacket.source_layout_topology.has_numbered_lines, true);
assert.equal(outbound.flightPacket.source_layout_topology.has_single_line_breaks, true);
assert.equal(outbound.flightPacket.source_layout_topology.exact_linebreak_pattern_exported, false);
assert.equal(outbound.flightPacket.source_layout_policy.preserve_source_paragraph_units, true);
assert.equal(outbound.flightPacket.source_layout_policy.preserve_source_line_unit_boundaries, true);
assert.equal(outbound.flightPacket.mask_layout_policy.mode, 'indexed-anchor-blocks');
assert.equal(outbound.flightPacket.stylometry_engine.generator_constraints.do_not_flatten_paragraph_sensitive_source, true);
assert.equal(outbound.flightPacket.stylometry_engine.generator_constraints.preserve_mask_layout_cadence, true);
assert.ok(outbound.contract.rules.some((rule) => /Output breaks follow/.test(rule)));

const repairedLuz = api.repairOutputLayout(
  'Bundle: FILE-72 stays with WJCT. The footer mismatch stays attached. Keep the care note with the grouping.',
  outbound.flightPacket.sourceText,
  'indexed-anchor-blocks'
);
assert.ok(repairedLuz.includes('\n'));
assert.equal(repairedLuz.includes('\n\n\n'), false);

const repairedCryo = api.repairOutputLayout(
  'Got it. FILE-72 and WJCT stay together. Footer mismatch is still attached.',
  'first line\n\nsecond line',
  'short-handoff-paragraphs'
);
assert.ok(repairedCryo.includes('\n\n'));

const nodes = {
  messageDraftInput: { value: outbound.flightPacket.sourceText },
  protectedOutputInput: { value: 'Bundle: FILE-72 stays with WJCT. The footer mismatch stays attached. Keep the care note with the grouping.', dataset: {}, dispatchEvent(event) { this.lastEvent = event.type; } },
  maskFieldSelect: { value: 'clipboard', selectedOptions: [{ textContent: 'Luz of the Index' }] }
};
const doc = { getElementById(id) { return nodes[id] || null; } };
assert.equal(api.repairLiveOutput(doc), true);
assert.ok(nodes.protectedOutputInput.value.includes('\n'));
assert.equal(nodes.protectedOutputInput.dataset.hushLayoutRepaired, 'hush-layout-topology-guard/v2-live-output');
assert.equal(nodes.protectedOutputInput.lastEvent, 'input');

console.log('Hush layout topology guard: PASS');
