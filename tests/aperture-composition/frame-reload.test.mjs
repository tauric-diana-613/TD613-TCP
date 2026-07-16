import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { installApertureCompositionForFrame } from '../../app/engine/aperture-composition-frame.js';

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

function target() {
  return {
    events: [],
    dispatchEvent(event) {
      this.events.push(event);
      return true;
    }
  };
}

function frame() {
  return {
    id: 'td613ApertureTool',
    dataset: {},
    contentWindow: target()
  };
}

const root = {
  ...target(),
  crypto: webcrypto,
  TextEncoder,
  CustomEvent: FakeCustomEvent
};
const modules = {
  release: Object.freeze({ version: 'v3.1-alpha', apertureSchema: 'td613-aperture/v3.1-alpha' }),
  taskIntent: Object.freeze({ schema: 'td613.aperture.task-intent-route/v3.0-alpha' }),
  compatibility: Object.freeze({ schema: 'td613.aperture.v31-v30-bridge-compatibility/v0.1' }),
  reciprocalBridge: Object.freeze({ schema: 'td613.phase4.reciprocal-bridge/v0.1' })
};

const firstFrame = frame();
const first = await installApertureCompositionForFrame({
  root,
  frame: firstFrame,
  modules,
  CustomEventImpl: FakeCustomEvent,
  cryptoImpl: webcrypto,
  TextEncoderImpl: TextEncoder,
  created_at: '2026-07-16T00:00:00.000Z'
});
const hostRegistry = root.TD613_APERTURE_COMPOSITION;
assert.equal(first.status, 'COMPOSITION_VALIDATED');
assert.equal(first.idempotent_reuse, false);

const reloadedFrame = frame();
const reinstalled = await installApertureCompositionForFrame({
  root,
  frame: reloadedFrame,
  modules,
  CustomEventImpl: FakeCustomEvent,
  cryptoImpl: webcrypto,
  TextEncoderImpl: TextEncoder,
  created_at: '2026-07-16T00:01:00.000Z'
});
assert.equal(reinstalled.status, 'COMPOSITION_VALIDATED');
assert.equal(reinstalled.idempotent_reuse, false);
assert.equal(root.TD613_APERTURE_COMPOSITION, hostRegistry);
assert.equal(reloadedFrame.contentWindow.TD613_APERTURE_COMPOSITION.schema, 'td613.aperture.composition-runtime/v0.1');
assert.equal(reloadedFrame.contentWindow.TD613_PHASE4_RECIPROCAL_BRIDGE, modules.reciprocalBridge);
assert.deepEqual(reloadedFrame.contentWindow.events.map(event => event.type), [
  'td613:phase4-reciprocal-bridge-ready',
  'td613:aperture-composition-ready'
]);

const mismatchedRoot = {
  ...root,
  TD613_PHASE4_RECIPROCAL_BRIDGE: Object.freeze({ schema: 'tampered' })
};
await assert.rejects(
  () => installApertureCompositionForFrame({
    root: mismatchedRoot,
    frame: frame(),
    modules,
    CustomEventImpl: FakeCustomEvent,
    cryptoImpl: webcrypto,
    TextEncoderImpl: TextEncoder
  }),
  /compatibility projection/
);

console.log('aperture-composition/frame-reload.test.mjs passed');
