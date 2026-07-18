export const ASH_KEEP_DELIVERY_TRANSFORM_VERSION = 'td613.ash-keep.delivery-transform/v1.0-event-driven-map';

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
  state.frame = scheduleFrame(frame);
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

export function stabilizeAshKeepSource(source = '') {
  let code = String(source || '');
  if (!code) throw new Error('ash-keep-delivery-source-empty');

  const perpetualCount = code.split(PERPETUAL_SCHEDULER).length - 1;
  if (perpetualCount === 1) code = code.replace(PERPETUAL_SCHEDULER, EVENT_DRIVEN_SCHEDULER);
  else if (perpetualCount > 1) throw new Error(`ash-keep-perpetual-scheduler-ambiguous:${perpetualCount}`);
  else if (!code.includes('function requestMapDraw()') || code.includes('state.frame = scheduleFrame(frame);')) {
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

  if ((code.match(/requestAnimationFrame\(/g) || []).length !== 1) throw new Error('ash-keep-scheduler-count-not-one');
  if (code.includes('state.frame = scheduleFrame(frame);')) throw new Error('ash-keep-perpetual-recursion-survived');
  for (const marker of [
    "version: 'td613.ash-keep.browser-core/v1.2-event-driven-map'",
    "mode: 'EVENT_DRIVEN_COALESCED'",
    'frame_pending: Boolean(state.frame)',
    'function requestMapDraw()'
  ]) if (!code.includes(marker)) throw new Error(`ash-keep-event-driven-marker-missing:${marker}`);

  return code;
}
