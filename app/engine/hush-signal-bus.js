export const HUSH_SIGNAL_BUS_VERSION = 'phase-30';

export const HUSH_SIGNAL_REGISTERS = [
  'sourceHash',
  'outputHash',
  'maskId',
  'mode',
  'releaseState',
  'registerState',
  'targetRegisterState',
  'exportState',
  'ledgerRow',
  'routeState'
];

const copy = (value) => JSON.parse(JSON.stringify(value ?? null));

export function createHushSignalBus(input = {}) {
  const registers = Object.fromEntries(HUSH_SIGNAL_REGISTERS.map((name) => [name, input.registers?.[name] ?? 'pending']));
  const events = Array.isArray(input.events) ? input.events.map(copy) : [];
  return { version: HUSH_SIGNAL_BUS_VERSION, tick: Number.isFinite(input.tick) ? input.tick : events.length, registers, events };
}

export function writeHushSignal(bus = createHushSignalBus(), eventType = 'event', payload = {}) {
  const next = createHushSignalBus(bus);
  next.tick += 1;
  for (const [key, value] of Object.entries(payload.registers || {})) if (key in next.registers) next.registers[key] = value;
  next.events.push({ tick: next.tick, eventType, payload: copy(payload), timestamp: payload.timestamp || new Date().toISOString() });
  return next;
}

export function snapshotHushSignalBus(bus = {}) {
  const current = createHushSignalBus(bus);
  return { version: HUSH_SIGNAL_BUS_VERSION, tick: current.tick, registerCount: HUSH_SIGNAL_REGISTERS.length, eventCount: current.events.length, registers: copy(current.registers), events: copy(current.events) };
}

export function summarizeHushSignalBus(bus = {}) {
  const snapshot = snapshotHushSignalBus(bus);
  return { version: HUSH_SIGNAL_BUS_VERSION, tick: snapshot.tick, registerCount: snapshot.registerCount, eventCount: snapshot.eventCount, routeState: snapshot.registers.routeState, exportState: snapshot.registers.exportState };
}
