export const ASH_KEEP_DELIVERY_TRANSFORM_VERSION = 'td613.ash-keep.delivery-transform/v1.2-event-driven-map';
export const ASH_KEEP_DELIVERY_TRANSFORM_LINEAGE = 'td613.ash-keep.delivery-transform/v1.0-event-driven-map';

const PERPETUAL_SCHEDULER = `const scheduleFrame = callback => requestAnimationFrame(callback);

function frame(time) {
  state.frame = 0;
  if (!state.mapVisible || state.reducedMotion) return;
  drawMap(time);
  state.frame = scheduleFrame(frame);
}

function startScheduler() {
  if (state.reducedMotion) { drawMap(0); return; }
  if (!state.frame) state.frame = scheduleFrame(frame);
}

function stopScheduler() {
  if (state.frame) cancelAnimationFrame(state.frame);
  state.frame = 0;
}
`;

const EVENT_DRIVEN_SCHEDULER = `const scheduleFrame = callback => requestAnimationFrame(callback);

function frame(time) {
  state.frame = 0;
  if (!state.mapVisible) return;
  drawMap(state.reducedMotion ? 0 : time);
}

function requestMapDraw() {
  if (!state.mapVisible || state.frame) return false;
  const queuedFrame = scheduleFrame(frame);
  state.frame = queuedFrame;
  return true;
}

function startScheduler() {
  requestMapDraw();
}

function stopScheduler() {
  if (state.frame) cancelAnimationFrame(state.frame);
  state.frame = 0;
}
`;

const RECURSIVE_FRAME_PATTERN = /function frame\(time\) \{[\s\S]*?drawMap\(time\);\s*state\.frame = scheduleFrame\(frame\);[\s\S]*?\n\}/;

export function stabilizeAshKeepSource(source = '') {
  let code = String(source || '');
  if (!code) throw new Error('ash-keep-delivery-source-empty');

  const perpetualCount = code.split(PERPETUAL_SCHEDULER).length - 1;
  if (perpetualCount === 1) code = code.replace(PERPETUAL_SCHEDULER, EVENT_DRIVEN_SCHEDULER);
  else if (perpetualCount > 1) throw new Error(`ash-keep-perpetual-scheduler-ambiguous:${perpetualCount}`);
  else if (!code.includes('function requestMapDraw()') || RECURSIVE_FRAME_PATTERN.test(code)) {
    throw new Error('ash-keep-event-driven-scheduler-seam-missing');
  }

  code = code.replace(
    "version: 'td613.ash-keep.browser-core/v1.1-convergence-native',",
    "version: 'td613.ash-keep.browser-core/v1.2-event-driven-map',"
  );
  code = code.replace(
    'openWorkspace: setWorkspace\n  });',
    "openWorkspace: setWorkspace,\n    mapScheduler: () => Object.freeze({ mode: 'EVENT_DRIVEN_COALESCED', frame_pending: Boolean(state.frame), map_visible: state.mapVisible })\n  });"
  );

  const rafCalls = (code.match(/requestAnimationFrame\(/g) || []).length;
  const queueCalls = (code.match(/const queuedFrame = scheduleFrame\(frame\);/g) || []).length;
  const queueAssignments = (code.match(/state\.frame = queuedFrame;/g) || []).length;
  if (rafCalls !== 1) throw new Error(`ash-keep-scheduler-count-not-one:${rafCalls}`);
  if (queueCalls !== 1 || queueAssignments !== 1) throw new Error(`ash-keep-queue-count-not-one:${queueCalls}:${queueAssignments}`);
  if (RECURSIVE_FRAME_PATTERN.test(code)) throw new Error('ash-keep-perpetual-recursion-survived');
  for (const marker of [
    "version: 'td613.ash-keep.browser-core/v1.2-event-driven-map'",
    "mode: 'EVENT_DRIVEN_COALESCED'",
    'frame_pending: Boolean(state.frame)',
    'function requestMapDraw()',
    'const queuedFrame = scheduleFrame(frame)'
  ]) if (!code.includes(marker)) throw new Error(`ash-keep-event-driven-marker-missing:${marker}`);

  return code;
}
