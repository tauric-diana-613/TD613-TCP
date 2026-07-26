export const ASH_A8_MAP_RETURN_HANDSHAKE_VERSION = 'td613.ash.a8-map-return-handshake/v0.2-prehold-shadow';

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const CONTROL_IDS = Object.freeze([
  'ashA8ObjectName','ashA8ObjectType','ashA8ObjectRoom','ashA8ObjectKnown','ashA8ObjectUncertain','ashA8ObjectEvidence','ashA8ObjectSource','ashA8ObjectNotes',
  'ashA8RelationFrom','ashA8RelationTo','ashA8RelationType','ashA8RelationEvidence','ashA8RelationUncertain','ashA8RelationNotes'
]);
const HELD_ACTIONS = new Set(['addObject','addRelationship']);
const draft = new Map();
let held = false;
let mapReturnObserved = false;
let refreshSerial = 0;

function ensureStyles() {
  if (!doc?.head || byId('td613-ash-a8-map-return-handshake-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-a8-map-return-handshake-css';
  style.textContent = `html[data-ash-a8-map-return-handshake="MAP_RETURN_SETTLING"] #ashA8RelationWorkshop,
html[data-ash-a8-map-return-handshake="MAP_RETURN_RESTORE_HELD"] #ashA8RelationWorkshop{visibility:hidden!important;pointer-events:none!important}`;
  doc.head.append(style);
}

function captureAll() {
  let captured = false;
  for (const id of CONTROL_IDS) {
    const control = byId(id);
    if (!control?.isConnected) continue;
    draft.set(id, Object.freeze({
      value:String(control.value ?? ''),
      checked:'checked' in control ? Boolean(control.checked) : null
    }));
    captured = true;
  }
  if (captured) mark('PREHOLD_DRAFT_CAPTURED');
  return captured;
}

function restoreAll() {
  let restored = false;
  for (const [id, saved] of draft) {
    const control = byId(id);
    if (!control?.isConnected) continue;
    if (control.tagName === 'SELECT' && ![...control.options].some(option => option.value === saved.value)) continue;
    control.value = saved.value;
    if (saved.checked !== null && 'checked' in control) control.checked = saved.checked;
    restored = true;
  }
  return restored;
}

function canonicalMapIsOpen() {
  const workspace = byId('workspace-map');
  return doc?.documentElement?.dataset?.ashPremiumWorkspace === 'map'
    && workspace?.classList?.contains('active') === true;
}

function mark(posture) {
  if (doc?.documentElement) doc.documentElement.dataset.ashA8MapReturnHandshake = posture;
}

function clear() {
  draft.clear();
  held = false;
  mapReturnObserved = false;
  refreshSerial += 1;
  mark('CLEARED');
}

function arm(event) {
  if (!HELD_ACTIONS.has(event.detail?.action_id)) return;
  held = draft.size > 0;
  mapReturnObserved = false;
  refreshSerial += 1;
  mark(held ? 'HELD_WITH_PREHOLD_DRAFT' : 'HELD_WITHOUT_PREHOLD_DRAFT');
}

function captureDelegatedForm(event) {
  if (!event.target?.closest?.('#ashA8ObjectForm,#ashA8RelationForm')) return;
  if (held) return;
  captureAll();
}

function requestConfirmedMapRefresh(event) {
  if (!held || event.detail?.workspace !== 'map') return;
  mapReturnObserved = true;
  const serial = ++refreshSerial;
  mark('MAP_RETURN_SETTLING');
  queueMicrotask(() => {
    if (!held || !mapReturnObserved || serial !== refreshSerial) return;
    Promise.resolve(host?.__td613AshA8?.refresh?.('A8_CANONICAL_MAP_RETURN_HANDSHAKE')).catch(() => {
      if (serial === refreshSerial) mark('MAP_RETURN_RESTORE_HELD');
    });
  });
}

function settleAfterA8Recompile() {
  if (!held || !mapReturnObserved || !canonicalMapIsOpen()) return false;
  const restored = restoreAll();
  if (!restored) {
    mark('MAP_RETURN_RESTORE_HELD');
    return false;
  }
  held = false;
  mapReturnObserved = false;
  mark('RESTORED_AFTER_CANONICAL_MAP_RETURN');
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a8-map-return-restored', {
    detail:Object.freeze({
      schema:'td613.ash.a8-map-return-receipt/v0.2',
      restored_controls:draft.size,
      source_posture:'PREHOLD_FORM_CAPTURE',
      workshop_visible_after_restore:true,
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      human_closure_required:true
    })
  }));
  return true;
}

export function installAshA8MapReturnHandshake() {
  if (!host || !doc?.body || host.__td613AshA8MapReturnHandshake) return false;
  ensureStyles();
  doc.addEventListener('input', captureDelegatedForm, true);
  doc.addEventListener('change', captureDelegatedForm, true);
  doc.addEventListener('td613:ash-keep:action-held', arm);
  host.addEventListener('td613:ash:ux-workspace-opened', requestConfirmedMapRefresh);
  host.addEventListener('td613:ash:a8-recompiled', settleAfterA8Recompile);
  host.addEventListener('td613:ash:case-created', clear);
  host.addEventListener('td613:ash:case-closed', clear);
  const api = Object.freeze({
    version:ASH_A8_MAP_RETURN_HANDSHAKE_VERSION,
    capture:captureAll,
    restore:restoreAll,
    current:() => Object.freeze({ held, map_return_observed:mapReturnObserved, draft_controls:draft.size, posture:doc?.documentElement?.dataset?.ashA8MapReturnHandshake || null }),
    authority:Object.freeze({ authority_changed:false, source_bytes_moved:false, custody_changed:false, release_posture_changed:false, human_closure_required:true })
  });
  host.__td613AshA8MapReturnHandshake = api;
  mark('READY');
  return true;
}

if (host && doc) installAshA8MapReturnHandshake();
