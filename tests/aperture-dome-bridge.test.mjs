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
assert.equal(first.weather.modeled, true);
assert.equal(first.operationalState, 'interface_context');
assert.equal(first.claimAuthority, 'design_signal');
assert.equal(writes.length, 0, 'pure compilation has no storage side effect');

const emitted = context.window.emitDomeWorldBridgeReceipt(snapshot);
assert.equal(writes.length, 1);
assert.equal(writes[0][0], 'td613.gateway.aperture-handoff');
assert.equal(events.length, 1);
assert.equal(emitted.receiptType, 'dome-world-route-weather');

console.log('aperture-dome-bridge.test.mjs passed');
