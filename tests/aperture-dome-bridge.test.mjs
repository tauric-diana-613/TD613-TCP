import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('app/aperture/tool.html', 'utf8');
const source = html.match(/<script id="apertureDomeWorldBridgeCompiler">([\s\S]*?)<\/script>/)?.[1];
assert.ok(source, 'Aperture includes the Dome-World bridge compiler');
assert.doesNotMatch(source, /\bfetch\s*\(/, 'bridge compiler performs no network transmission');

const writes = [];
const events = [];
const context = {
  window: {
    dispatchEvent(event) { events.push(event); }
  },
  document: {
    readyState: 'complete',
    getElementById() { return null; },
    querySelectorAll() { return []; },
    documentElement: { setAttribute() {} }
  },
  localStorage: {
    setItem(key, value) { writes.push([key, value]); }
  },
  CustomEvent: class CustomEvent {
    constructor(type, options) {
      this.type = type;
      this.detail = options?.detail;
    }
  },
  Date
};
context.window.localStorage = context.localStorage;
context.window.CustomEvent = context.CustomEvent;
context.window.document = context.document;
vm.runInNewContext(source, context);

const snapshot = {
  omissionPressure: 0.2,
  coherence: 0.75,
  divergence: 0.3,
  namingSensitivity: 0.4,
  rupturePressure: 0.1
};
const first = context.window.compileDomeWorldBridge(snapshot);
const second = context.window.compileDomeWorldBridge(snapshot);
assert.deepEqual(first, second, 'pure compilation is deterministic');
assert.equal(first.produced.context_request.modeled, true);
assert.equal(first.source_status, 'DERIVED');
assert.equal(first.authority_class, 'A2_DERIVATIONAL');
assert.equal(first.artifact_reference, null);
assert.equal(writes.length, 0, 'pure compilation has no storage side effect');

const emitted = context.window.emitDomeWorldBridgeReceipt(snapshot);
assert.equal(writes.length, 1);
assert.equal(writes[0][0], 'td613.gateway.aperture-handoff');
assert.equal(events.length, 1);
assert.equal(emitted.schema, 'td613.aperture.diagnostic-receipt/v3.0-alpha');
assert.match(emitted.receipt_id, /^apdiag_/);

const returned = {
  schema: 'td613.flowcore.context-receipt/vNext',
  source_status: 'DERIVED',
  sensor_id: 'derived-formula',
  source_metrics: { omission: 0.2, coherence: 0.75, divergence: 0.3 },
  modeled_weather: { humidity: 0.2, visibility: 0.75, routePressure: 0.1875, modeled: true },
  artifact_reference: null,
  transformation_history: ['bounded Flow-Core translation'],
  missingness: ['external sensor validation'],
  uncertainty: { class: 'model-and-input-bounded', value: null }
};
const audit = context.window.auditFlowCoreContextReceipt(returned);
assert.equal(audit.recommendation, 'CONTEXT_RECEIPT_ADMISSIBLE_FOR_BOUNDED_REVIEW');
assert.equal(audit.recommendation_not_command, true);
assert.equal(audit.authority_class, 'A2_DERIVATIONAL');
assert.equal(events.at(-1).type, 'td613:aperture-flowcore-return-audited');
assert.equal(writes.length, 1, 'returned-context audit does not transmit or mutate storage');

const rejected = context.window.auditFlowCoreContextReceipt({ ...returned, artifact_reference: 'sha256:stable' });
assert.ok(rejected.rejected.includes('artifact_reference_must_remain_null'));
assert.equal(rejected.recommendation, 'HOLD_FOR_REPAIR');

assert.equal(context.window.APERTURE_DOME_WORLD_BRIDGE_COMPILER.reciprocalReceipts, true);
assert.equal(context.window.APERTURE_DOME_WORLD_BRIDGE_COMPILER.reciprocalAuthority, false);
assert.equal(context.window.APERTURE_DOME_WORLD_BRIDGE_COMPILER.automaticAshAction, false);

console.log('aperture-dome-bridge.test.mjs passed');
