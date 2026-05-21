import assert from 'assert';
import { createHushSignalBus, writeHushSignal, snapshotHushSignalBus } from '../app/engine/hush-signal-bus.js';

let bus = createHushSignalBus();
assert.equal(bus.version, 'phase-30');
assert.equal(Object.keys(bus.registers).length, 10);

bus = writeHushSignal(bus, 'route', { registers: { routeState: 'receipt-ready' } });
const snap = snapshotHushSignalBus(bus);
assert.equal(snap.tick, 1);
assert.equal(snap.registers.routeState, 'receipt-ready');
console.log('hush-signal-bus tests passed');
