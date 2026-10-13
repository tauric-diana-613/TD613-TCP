export const ASH_MAP_LABELS_VERSION = 'td613.ash-keep.map-labels/v1.0';
export const ASH_OBJECT_REGISTRY_VERSION = 'td613.ash-keep.object-registry/v1.0';

const CANVAS_ID = 'caseCanvas';
const TOOLTIP_ID = 'ashMapNodeLabel';
const FOCUS_ID = 'ashMapNodeFocus';
const REGISTRY_ID = 'ashObjectRegistry';
const REGISTRY_LIST_ID = 'ashObjectRegistryList';
const PATCH_MARK = Symbol.for('td613.ash-map-labels.patched');
const BIND_MARK = Symbol.for('td613.ash-map-labels.bound');
const contextState = new WeakMap();

function stateFor(context) {
  if (!contextState.has(context)) {
    contextState.set(context, {
      records: [],
      nodeIndex: 0,
      pendingNode: null,
      awaitingLabelRecord: null,
      selected: null,
      hovered: null,
      registryHovered: null,
      pinned: null,
      pointerStart: null,
      renderQueued: false,
      renderKey: '',
      registryKey: '',
      suppressedLabelCount: 0
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
  return Boolean(isCaseContext(context) && stateFor(context).awaitingLabelRecord);
}

function canvasPointToStage(record, canvas) {
  const stage = canvas.closest('.map-stage');
  if (!stage || !record) return null;
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

function ensureMapOverlays(canvas) {
  const stage = canvas.closest('.map-stage');
  if (!stage) return {};
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
  let focus = document.getElementById(FOCUS_ID);
  if (!focus) {
    focus = document.createElement('div');
    focus.id = FOCUS_ID;
    focus.className = 'ash-map-node-focus';
    focus.setAttribute('aria-hidden', 'true');
    focus.hidden = true;
    stage.append(focus);
  }
  return { tooltip, focus };
}

function tableMetadata() {
  const rows = [...(document.getElementById('objectRows')?.rows || [])];
  return rows.map((row, index) => {
    const cells = [...row.cells];
    const offset = cells[0]?.hasAttribute('data-ash-node-number') ? 1 : 0;
    return {
      index: index + 1,
      label: cells[offset]?.textContent?.trim() || `Object ${index + 1}`,
      type: cells[offset + 1]?.textContent?.trim() || 'object',
      room: cells[offset + 2]?.textContent?.trim() || 'unassigned',
      source: cells[offset + 3]?.textContent?.trim() || 'UNRESOLVED',
      disclosure: cells[offset + 4]?.textContent?.trim() || 'LOCAL'
    };
  });
}

function metadataFor(record, metadata = tableMetadata()) {
  const fallback = metadata[record.index - 1] || {};
  return {
    ...record,
    label: record.label || fallback.label || `Object ${record.index}`,
    type: fallback.type || 'object',
    room: fallback.room || 'unassigned',
    source: fallback.source || 'UNRESOLVED',
    disclosure: fallback.disclosure || 'LOCAL'
  };
}

function ensureRegistry() {
  let registry = document.getElementById(REGISTRY_ID);
  if (registry) return registry;
  const inspector = document.querySelector('#workspace-map .inspector');
  const notes = inspector?.querySelector('.research-notes');
  if (!inspector || !notes) return null;
  registry = document.createElement('section');
  registry.id = REGISTRY_ID;
  registry.className = 'ash-object-registry';
  registry.setAttribute('aria-labelledby', 'ashObjectRegistryTitle');
  registry.innerHTML = `
    <div class="ash-object-registry-head">
      <div><span class="ash-object-registry-kicker">米 / indexed topology</span><h4 id="ashObjectRegistryTitle">Object Registry</h4></div>
      <span class="ash-object-registry-count" id="ashObjectRegistryCount">0</span>
    </div>
    <p class="ash-object-registry-rule">Hover or tap an object to trace its node. Click a node to return here.</p>
    <div class="ash-object-registry-list" id="${REGISTRY_LIST_ID}" role="listbox" aria-label="Case Map objects"></div>
  `;
  inspector.insertBefore(registry, notes);
  return registry;
}

function registryItem(index) {
  return document.querySelector(`#${REGISTRY_LIST_ID} [data-object-index="${index}"]`);
}

function setRegistryActive(context, activeIndex) {
  const state = stateFor(context);
  document.querySelectorAll(`#${REGISTRY_LIST_ID} [data-object-index]`).forEach(item => {
    const index = Number(item.dataset.objectIndex);
    item.classList.toggle('is-active', index === activeIndex);
    item.classList.toggle('is-selected', index === state.selected?.index);
    item.setAttribute('aria-selected', String(index === activeIndex));
  });
}

function scrollRegistryTo(index) {
  const item = registryItem(index);
  if (!item) return;
  item.classList.add('is-returned');
  item.scrollIntoView({
    block: 'nearest',
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
  setTimeout(() => item.classList.remove('is-returned'), 900);
}

function renderRegistry(context) {
  const state = stateFor(context);
  const registry = ensureRegistry();
  const list = document.getElementById(REGISTRY_LIST_ID);
  if (!registry || !list) return;
  const metadata = tableMetadata();
  const records = state.records.map(record => metadataFor(record, metadata));
  const signature = records.map(record => [record.index, record.label, record.type, record.room, record.source, record.disclosure, record.color].join(':')).join('|');
  document.getElementById('ashObjectRegistryCount').textContent = String(records.length);
  registry.dataset.registryState = records.length ? 'POPULATED' : 'EMPTY';
  if (signature !== state.registryKey) {
    state.registryKey = signature;
    list.replaceChildren(...records.map(record => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'ash-object-registry-item';
      item.dataset.objectIndex = String(record.index);
      item.style.setProperty('--registry-node-color', record.color || '#76ead4');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.innerHTML = `
        <span class="ash-object-registry-index">${record.index}</span>
        <span class="ash-object-registry-copy"><strong>${escapeHtml(record.label)}</strong><small>${escapeHtml(record.type)} · ${escapeHtml(record.room)}</small></span>
        <span class="ash-object-registry-posture">${escapeHtml(record.source)}<i>${escapeHtml(record.disclosure)}</i></span>
      `;
      return item;
    }));
  }
  const active = state.hovered || state.registryHovered || state.pinned || state.selected;
  setRegistryActive(context, active?.index || null);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderOverlay(context) {
  const state = stateFor(context);
  state.renderQueued = false;
  const canvas = context.canvas;
  const { tooltip, focus } = ensureMapOverlays(canvas);
  renderRegistry(context);
  if (!tooltip || !focus) return;
  const rawRecord = state.hovered || state.registryHovered || state.pinned || state.selected;
  const record = rawRecord ? metadataFor(rawRecord) : null;
  if (!record) {
    tooltip.hidden = true;
    focus.hidden = true;
    state.renderKey = 'hidden';
    setRegistryActive(context, null);
    return;
  }
  const point = canvasPointToStage(record, canvas);
  if (!point) return;
  const stageWidth = point.stage.clientWidth;
  const stageHeight = point.stage.clientHeight;
  tooltip.hidden = false;
  tooltip.textContent = `${record.index} · ${record.label}`;
  tooltip.dataset.objectIndex = String(record.index);
  const preferLeft = point.x > stageWidth * 0.66;
  const left = preferLeft ? point.x - tooltip.offsetWidth - 18 : point.x + 18;
  const top = Math.max(8, Math.min(stageHeight - tooltip.offsetHeight - 8, point.y - tooltip.offsetHeight / 2));
  const clampedLeft = Math.max(8, Math.min(stageWidth - tooltip.offsetWidth - 8, left));
  focus.hidden = false;
  focus.style.setProperty('--ash-node-focus-color', record.color || '#76ead4');
  focus.style.transform = `translate(${Math.round(point.x)}px,${Math.round(point.y)}px)`;
  const key = `${record.index}:${Math.round(clampedLeft)}:${Math.round(top)}:${record.label}`;
  if (key !== state.renderKey) {
    state.renderKey = key;
    tooltip.style.transform = `translate(${Math.round(clampedLeft)}px,${Math.round(top)}px)`;
  }
  setRegistryActive(context, record.index);
}

function queueOverlay(context) {
  const state = stateFor(context);
  if (state.renderQueued) return;
  state.renderQueued = true;
  queueMicrotask(() => renderOverlay(context));
}

function callNativeFillText(nativeFillText, context, text, x, y, maxWidth) {
  return maxWidth === undefined ? nativeFillText.call(context, text, x, y) : nativeFillText.call(context, text, x, y, maxWidth);
}

function patchCanvasText() {
  const prototype = globalThis.CanvasRenderingContext2D?.prototype;
  if (!prototype || prototype[PATCH_MARK]) return false;
  prototype[PATCH_MARK] = true;
  const original = { clearRect: prototype.clearRect, arc: prototype.arc, stroke: prototype.stroke, fillText: prototype.fillText };
  prototype.clearRect = function (...args) {
    if (isCaseContext(this)) {
      const state = stateFor(this);
      state.records = [];
      state.nodeIndex = 0;
      state.pendingNode = null;
      state.awaitingLabelRecord = null;
      state.selected = null;
    }
    return original.clearRect.apply(this, args);
  };
  prototype.arc = function (x, y, radius, ...rest) {
    if (isCaseContext(this) && isNodeRadius(radius)) {
      const state = stateFor(this);
      state.awaitingLabelRecord = null;
      state.nodeIndex += 1;
      state.pendingNode = { x, y, radius, index: state.nodeIndex, color: String(this.fillStyle || '#76ead4'), transform: this.getTransform() };
    }
    return original.arc.call(this, x, y, radius, ...rest);
  };
  prototype.stroke = function (...args) {
    const result = original.stroke.apply(this, args);
    if (isCaseContext(this)) {
      const state = stateFor(this);
      const node = state.pendingNode;
      if (node) {
        const record = { ...node, label: '' };
        state.records.push(record);
        state.awaitingLabelRecord = record;
        if (node.radius >= 8.5) state.selected = record;
        this.save();
        this.font = '700 7px IBM Plex Mono, monospace';
        this.textAlign = 'center';
        this.textBaseline = 'middle';
        this.fillStyle = '#020806';
        original.fillText.call(this, String(node.index), node.x, node.y + 0.5);
        this.restore();
        state.pendingNode = null;
        queueOverlay(this);
      }
    }
    return result;
  };
  prototype.fillText = function (text, x, y, maxWidth) {
    if (isNodeLabel(this)) {
      const state = stateFor(this);
      const record = state.awaitingLabelRecord;
      record.label = String(text);
      state.suppressedLabelCount += 1;
      state.awaitingLabelRecord = null;
      queueOverlay(this);
      return undefined;
    }
    return callNativeFillText(original.fillText, this, text, x, y, maxWidth);
  };
  return true;
}

function nearestRecord(context, clientX, clientY) {
  const state = stateFor(context);
  const canvas = context.canvas;
  let nearest = null;
  let distance = 28;
  for (const record of state.records) {
    const point = canvasPointToStage(record, canvas);
    if (!point) continue;
    const stageRect = point.stage.getBoundingClientRect();
    const current = Math.hypot(stageRect.left + point.x - clientX, stageRect.top + point.y - clientY);
    if (current < distance) { distance = current; nearest = record; }
  }
  return nearest;
}

function bindCanvasLayer(canvas) {
  if (canvas[BIND_MARK]) return;
  canvas[BIND_MARK] = true;
  const context = canvas.getContext('2d');
  canvas.addEventListener('pointermove', event => {
    const state = stateFor(context);
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      event.stopImmediatePropagation();
      state.hovered = nearestRecord(context, event.clientX, event.clientY);
      queueOverlay(context);
    }
  }, true);
  canvas.addEventListener('pointerdown', event => {
    const state = stateFor(context);
    state.pointerStart = { x: event.clientX, y: event.clientY, index: nearestRecord(context, event.clientX, event.clientY)?.index || null };
    state.hovered = null;
    queueOverlay(context);
  }, true);
  canvas.addEventListener('pointerup', event => {
    const state = stateFor(context);
    const start = state.pointerStart;
    state.pointerStart = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7) return;
    const record = nearestRecord(context, event.clientX, event.clientY);
    if (!record) return;
    state.pinned = record;
    queueOverlay(context);
    queueMicrotask(() => scrollRegistryTo(record.index));
  }, true);
  canvas.addEventListener('pointerleave', () => {
    const state = stateFor(context);
    state.hovered = null;
    queueOverlay(context);
  }, true);
}

function bindRegistry(context) {
  const registry = ensureRegistry();
  if (!registry || registry[BIND_MARK]) return;
  registry[BIND_MARK] = true;
  registry.addEventListener('pointerover', event => {
    const item = event.target.closest?.('[data-object-index]');
    if (!item) return;
    const state = stateFor(context);
    state.registryHovered = state.records[Number(item.dataset.objectIndex) - 1] || null;
    queueOverlay(context);
  });
  registry.addEventListener('pointerout', event => {
    const item = event.target.closest?.('[data-object-index]');
    if (!item || item.contains(event.relatedTarget)) return;
    const state = stateFor(context);
    state.registryHovered = null;
    queueOverlay(context);
  });
  registry.addEventListener('focusin', event => {
    const item = event.target.closest?.('[data-object-index]');
    if (!item) return;
    const state = stateFor(context);
    state.registryHovered = state.records[Number(item.dataset.objectIndex) - 1] || null;
    queueOverlay(context);
  });
  registry.addEventListener('focusout', event => {
    const item = event.target.closest?.('[data-object-index]');
    if (!item || item.contains(event.relatedTarget)) return;
    const state = stateFor(context);
    state.registryHovered = null;
    queueOverlay(context);
  });
  registry.addEventListener('click', event => {
    const item = event.target.closest?.('[data-object-index]');
    if (!item) return;
    const state = stateFor(context);
    state.pinned = state.records[Number(item.dataset.objectIndex) - 1] || null;
    state.registryHovered = null;
    queueOverlay(context);
  });
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
    const canvas = document.getElementById(CANVAS_ID);
    const context = canvas?.getContext?.('2d');
    if (context) queueOverlay(context);
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
  if (document.getElementById('td613AshObjectRegistryStyles')) return;
  const style = document.createElement('style');
  style.id = 'td613AshObjectRegistryStyles';
  style.textContent = `
    .ash-map-node-label{position:absolute;inset:0 auto auto 0;z-index:9;max-width:min(340px,calc(100% - 16px));padding:8px 10px;border:1px solid rgba(228,198,108,.62);background:linear-gradient(135deg,rgba(3,15,12,.98),rgba(9,29,23,.95));color:var(--paper);font:700 .66rem/1.4 var(--mono);box-shadow:0 14px 36px rgba(0,0,0,.42),0 0 22px rgba(118,234,212,.08);pointer-events:none;white-space:normal;overflow-wrap:anywhere;clip-path:polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px)}
    .ash-map-node-label[hidden],.ash-map-node-focus[hidden]{display:none}
    .ash-map-node-focus{position:absolute;z-index:8;left:0;top:0;width:30px;height:30px;margin:-15px 0 0 -15px;border:1px solid var(--ash-node-focus-color,var(--gold));border-radius:50%;box-shadow:0 0 0 5px color-mix(in srgb,var(--ash-node-focus-color,var(--gold)) 16%,transparent),0 0 24px color-mix(in srgb,var(--ash-node-focus-color,var(--gold)) 50%,transparent);pointer-events:none}
    .ash-map-node-focus::after{content:"";position:absolute;inset:5px;border:1px dashed rgba(255,248,218,.7);border-radius:50%}
    .ash-node-label-rule{margin-top:3px;color:var(--gold)}
    #accessibleTable [data-ash-node-number]{width:3.5rem;text-align:center;color:var(--gold);font-family:var(--mono)}
    .ash-object-registry{position:relative;margin-top:18px;padding-top:14px;border-top:1px solid rgba(118,234,212,.2)}
    .ash-object-registry::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,var(--mint),transparent 72%);opacity:.52}
    .ash-object-registry-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:6px}
    .ash-object-registry-kicker{display:block;color:var(--mint);font:700 .54rem/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase}
    .ash-object-registry h4{margin:2px 0 0;font:500 1.18rem/1 var(--serif)}
    .ash-object-registry-count{display:grid;place-items:center;min-width:30px;height:30px;padding:0 7px;border:1px solid rgba(228,198,108,.48);color:var(--gold);font:700 .64rem var(--mono);clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)}
    .ash-object-registry-rule{margin:0 0 10px;color:var(--muted);font:600 .58rem/1.45 var(--mono)}
    .ash-object-registry-list{display:grid;gap:6px;max-height:clamp(190px,34vh,420px);padding:2px 5px 2px 2px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(118,234,212,.46) rgba(2,8,6,.4)}
    .ash-object-registry-list::-webkit-scrollbar{width:7px}.ash-object-registry-list::-webkit-scrollbar-track{background:rgba(2,8,6,.38)}.ash-object-registry-list::-webkit-scrollbar-thumb{background:rgba(118,234,212,.36);border:2px solid rgba(2,8,6,.38)}
    .ash-object-registry-item{position:relative;display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;min-height:54px;padding:8px 9px;border:1px solid rgba(118,234,212,.13);background:linear-gradient(105deg,rgba(3,15,12,.98),rgba(7,26,21,.74));color:var(--paper);text-align:left;cursor:pointer;clip-path:polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px);transition:border-color .16s ease,background .16s ease,transform .16s ease,box-shadow .16s ease}
    .ash-object-registry-item::before{content:"";position:absolute;inset:0 auto 0 0;width:2px;background:var(--registry-node-color,var(--mint));box-shadow:0 0 14px var(--registry-node-color,var(--mint))}
    .ash-object-registry-item:hover,.ash-object-registry-item:focus-visible,.ash-object-registry-item.is-active{border-color:color-mix(in srgb,var(--registry-node-color,var(--mint)) 68%,var(--gold));background:linear-gradient(105deg,rgba(8,34,27,.98),rgba(11,42,33,.82));box-shadow:0 10px 25px rgba(0,0,0,.24),inset 0 0 24px rgba(118,234,212,.035);outline:none;transform:translateX(2px)}
    .ash-object-registry-item.is-returned{animation:ashRegistryReturn .75s ease both}
    .ash-object-registry-item.is-selected .ash-object-registry-index{border-color:var(--paper);color:var(--paper)}
    .ash-object-registry-index{display:grid;place-items:center;width:29px;height:29px;border:1px solid var(--registry-node-color,var(--gold));color:var(--registry-node-color,var(--gold));font:700 .64rem var(--mono);border-radius:50%}
    .ash-object-registry-copy{min-width:0}.ash-object-registry-copy strong{display:block;overflow:hidden;color:var(--paper);font:600 .7rem/1.25 var(--sans);text-overflow:ellipsis;white-space:nowrap}.ash-object-registry-copy small{display:block;margin-top:4px;overflow:hidden;color:var(--muted);font:600 .54rem/1.3 var(--mono);text-overflow:ellipsis;white-space:nowrap}
    .ash-object-registry-posture{display:grid;justify-items:end;gap:3px;color:var(--mint);font:700 .49rem/1.1 var(--mono);text-transform:uppercase}.ash-object-registry-posture i{color:var(--gold);font-style:normal}
    @keyframes ashRegistryReturn{0%{box-shadow:0 0 0 0 rgba(228,198,108,.45)}50%{box-shadow:0 0 0 4px rgba(228,198,108,.16),0 14px 34px rgba(0,0,0,.35)}100%{box-shadow:0 0 0 0 rgba(228,198,108,0)}}
    @media(max-width:900px){.ash-object-registry-list{max-height:280px}.ash-object-registry-item{grid-template-columns:32px minmax(0,1fr) auto}}
    @media(prefers-reduced-motion:reduce){.ash-object-registry-item{transition:none}.ash-object-registry-item.is-returned{animation:none}}
  `;
  document.head.append(style);
}

export function installAshMapObjectRegistry(doc = globalThis.document, host = globalThis.window) {
  if (!doc || !host) return false;
  const canvas = doc.getElementById(CANVAS_ID);
  if (!canvas || typeof canvas.getContext !== 'function') return false;
  patchCanvasText();
  injectStyles();
  ensureRegistry();
  const context = canvas.getContext('2d');
  bindCanvasLayer(canvas);
  bindRegistry(context);
  numberAccessibleTable();
  annotateLegend();
  doc.documentElement.dataset.ashMapLabels = ASH_MAP_LABELS_VERSION;
  doc.documentElement.dataset.ashObjectRegistry = ASH_OBJECT_REGISTRY_VERSION;
  doc.documentElement.dataset.ashMapLabelMode = 'overlay-only';
  host.__td613AshMapRegistryState = () => {
    const state = stateFor(context);
    return Object.freeze({ record_count: state.records.length, selected_index: state.selected?.index || null, pinned_index: state.pinned?.index || null, suppressed_label_count: state.suppressedLabelCount, label_mode: 'overlay-only' });
  };
  doc.getElementById('resetView')?.click();
  queueMicrotask(() => doc.getElementById('resetView')?.click());
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') installAshMapObjectRegistry(document, window);
