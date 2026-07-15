export const ASH_MAP_LABELS_VERSION = 'td613.ash-keep.map-labels/v1.0';

const CANVAS_ID = 'caseCanvas';
const TOOLTIP_ID = 'ashMapNodeLabel';
const PATCH_MARK = Symbol.for('td613.ash-map-labels.patched');
const contextState = new WeakMap();

function stateFor(context) {
  if (!contextState.has(context)) {
    contextState.set(context, {
      records: [],
      nodeIndex: 0,
      lastNode: null,
      selected: null,
      hovered: null,
      renderQueued: false,
      renderKey: ''
    });
  }
  return contextState.get(context);
}

function isCaseContext(context) {
  return context?.canvas?.id === CANVAS_ID;
}

function isNodeRadius(radius) {
  return Math.abs(radius - 6) < 0.01 || Math.abs(radius - 9) < 0.01;
}

function isNodeLabel(context) {
  return /^11px\s+IBM Plex Mono/i.test(String(context.font || ''));
}

function canvasPointToStage(record, canvas) {
  const stage = canvas.closest('.map-stage');
  if (!stage) return null;
  const matrix = record.transform;
  const deviceX = matrix.a * record.x + matrix.c * record.y + matrix.e;
  const deviceY = matrix.b * record.x + matrix.d * record.y + matrix.f;
  const canvasRect = canvas.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  return {
    x: canvasRect.left - stageRect.left + deviceX * canvasRect.width / Math.max(1, canvas.width),
    y: canvasRect.top - stageRect.top + deviceY * canvasRect.height / Math.max(1, canvas.height),
    stage
  };
}

function ensureTooltip(canvas) {
  const stage = canvas.closest('.map-stage');
  if (!stage) return null;
  let tooltip = document.getElementById(TOOLTIP_ID);
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = TOOLTIP_ID;
    tooltip.className = 'ash-map-node-label';
    tooltip.setAttribute('role', 'status');
    tooltip.setAttribute('aria-live', 'polite');
    tooltip.hidden = true;
    stage.append(tooltip);
  }
  return tooltip;
}

function renderOverlay(context) {
  const state = stateFor(context);
  state.renderQueued = false;
  const canvas = context.canvas;
  const tooltip = ensureTooltip(canvas);
  if (!tooltip) return;
  const record = state.hovered || state.selected;
  if (!record) {
    tooltip.hidden = true;
    state.renderKey = 'hidden';
    return;
  }
  const point = canvasPointToStage(record, canvas);
  if (!point) return;
  tooltip.hidden = false;
  tooltip.textContent = `${record.index} · ${record.label}`;
  const stageWidth = point.stage.clientWidth;
  const stageHeight = point.stage.clientHeight;
  const preferLeft = point.x > stageWidth * 0.66;
  const left = preferLeft ? point.x - tooltip.offsetWidth - 16 : point.x + 16;
  const top = Math.max(8, Math.min(stageHeight - tooltip.offsetHeight - 8, point.y - tooltip.offsetHeight / 2));
  const clampedLeft = Math.max(8, Math.min(stageWidth - tooltip.offsetWidth - 8, left));
  const key = `${record.index}:${Math.round(clampedLeft)}:${Math.round(top)}:${record.label}`;
  if (key === state.renderKey) return;
  state.renderKey = key;
  tooltip.style.transform = `translate(${Math.round(clampedLeft)}px,${Math.round(top)}px)`;
}

function queueOverlay(context) {
  const state = stateFor(context);
  if (state.renderQueued) return;
  state.renderQueued = true;
  queueMicrotask(() => renderOverlay(context));
}

function callNativeFillText(nativeFillText, context, text, x, y, maxWidth) {
  return maxWidth === undefined
    ? nativeFillText.call(context, text, x, y)
    : nativeFillText.call(context, text, x, y, maxWidth);
}

function patchCanvasText() {
  const prototype = CanvasRenderingContext2D.prototype;
  if (prototype[PATCH_MARK]) return;
  prototype[PATCH_MARK] = true;

  const original = {
    clearRect: prototype.clearRect,
    arc: prototype.arc,
    stroke: prototype.stroke,
    fillText: prototype.fillText
  };

  prototype.clearRect = function (...args) {
    if (isCaseContext(this)) {
      const state = stateFor(this);
      state.records = [];
      state.nodeIndex = 0;
      state.lastNode = null;
      state.selected = null;
    }
    return original.clearRect.apply(this, args);
  };

  prototype.arc = function (x, y, radius, ...rest) {
    if (isCaseContext(this) && isNodeRadius(radius)) {
      const state = stateFor(this);
      state.nodeIndex += 1;
      state.lastNode = {
        x,
        y,
        radius,
        index: state.nodeIndex,
        transform: this.getTransform()
      };
    }
    return original.arc.call(this, x, y, radius, ...rest);
  };

  prototype.stroke = function (...args) {
    const result = original.stroke.apply(this, args);
    if (isCaseContext(this)) {
      const state = stateFor(this);
      const node = state.lastNode;
      if (node) {
        this.save();
        this.font = '700 7px IBM Plex Mono, monospace';
        this.textAlign = 'center';
        this.textBaseline = 'middle';
        this.fillStyle = '#020806';
        original.fillText.call(this, String(node.index), node.x, node.y + 0.5);
        this.restore();
      }
    }
    return result;
  };

  prototype.fillText = function (text, x, y, maxWidth) {
    if (isCaseContext(this) && isNodeLabel(this)) {
      const state = stateFor(this);
      const node = state.lastNode;
      if (node) {
        const record = {
          ...node,
          label: String(text),
          x: node.x,
          y: node.y
        };
        state.records.push(record);
        if (node.radius >= 8.5) state.selected = record;
        state.lastNode = null;
        queueOverlay(this);
        return undefined;
      }
    }
    return callNativeFillText(original.fillText, this, text, x, y, maxWidth);
  };
}

function nearestRecord(context, clientX, clientY) {
  const state = stateFor(context);
  const canvas = context.canvas;
  let nearest = null;
  let distance = 26;
  for (const record of state.records) {
    const point = canvasPointToStage(record, canvas);
    if (!point) continue;
    const stageRect = point.stage.getBoundingClientRect();
    const current = Math.hypot(stageRect.left + point.x - clientX, stageRect.top + point.y - clientY);
    if (current < distance) {
      distance = current;
      nearest = record;
    }
  }
  return nearest;
}

function bindPointerLayer(canvas) {
  const context = canvas.getContext('2d');
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || event.buttons !== 0) return;
    event.stopImmediatePropagation();
    const state = stateFor(context);
    state.hovered = nearestRecord(context, event.clientX, event.clientY);
    queueOverlay(context);
  }, true);
  canvas.addEventListener('pointerdown', () => {
    const state = stateFor(context);
    state.hovered = null;
    queueOverlay(context);
  }, true);
  canvas.addEventListener('pointerleave', () => {
    const state = stateFor(context);
    state.hovered = null;
    queueOverlay(context);
  }, true);
}

function numberAccessibleTable() {
  const table = document.querySelector('#accessibleTable table');
  const body = document.getElementById('objectRows');
  if (!table || !body) return;
  const headerRow = table.tHead?.rows?.[0];
  if (headerRow && !headerRow.querySelector('[data-ash-node-number]')) {
    const header = document.createElement('th');
    header.dataset.ashNodeNumber = 'true';
    header.scope = 'col';
    header.textContent = 'No.';
    headerRow.prepend(header);
  }
  const applyNumbers = () => {
    [...body.rows].forEach((row, index) => {
      let cell = row.querySelector('[data-ash-node-number]');
      if (!cell) {
        cell = document.createElement('td');
        cell.dataset.ashNodeNumber = 'true';
        row.prepend(cell);
      }
      cell.textContent = String(index + 1);
    });
  };
  applyNumbers();
  new MutationObserver(applyNumbers).observe(body, { childList: true });
}

function annotateLegend() {
  const legend = document.querySelector('.map-legend');
  if (!legend || legend.querySelector('.ash-node-label-rule')) return;
  const row = document.createElement('div');
  row.className = 'legend-row ash-node-label-rule';
  row.textContent = '1–n · hover or tap for label';
  legend.append(row);
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .ash-map-node-label{position:absolute;inset:0 auto auto 0;z-index:8;max-width:min(320px,calc(100% - 16px));padding:7px 9px;border:1px solid rgba(228,198,108,.55);background:rgba(2,8,6,.95);color:var(--paper);font:700 .66rem/1.35 var(--mono);box-shadow:0 8px 24px rgba(0,0,0,.32);pointer-events:none;white-space:normal;overflow-wrap:anywhere}
    .ash-map-node-label[hidden]{display:none}
    .ash-node-label-rule{margin-top:3px;color:var(--gold)}
    #accessibleTable [data-ash-node-number]{width:3.5rem;text-align:center;color:var(--gold);font-family:var(--mono)}
  `;
  document.head.append(style);
}

function bootMapLabels() {
  document.documentElement.dataset.ashMapLabels = ASH_MAP_LABELS_VERSION;
  patchCanvasText();
  injectStyles();
  const canvas = document.getElementById(CANVAS_ID);
  if (!canvas) return;
  bindPointerLayer(canvas);
  numberAccessibleTable();
  annotateLegend();
  document.getElementById('resetView')?.click();
}

bootMapLabels();
