export const ASH_A8_DIRTY_DRAFT_RECOMPILE_GUARD_VERSION = 'td613.ash.a8-dirty-draft-recompile-guard/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
const FORM_SELECTOR = '#ashA8ObjectForm,#ashA8RelationForm';
const COMMIT_SELECTOR = '#ashA8CommitObject,#ashA8CommitRelation';
let dirtyDraftActive = false;

function canonicalMapWorkshopIsActive() {
  const workspace = doc?.getElementById?.('workspace-map');
  const workshop = doc?.getElementById?.('ashA8RelationWorkshop');
  return doc?.documentElement?.dataset?.ashPremiumWorkspace === 'map'
    && workspace?.classList?.contains?.('active') === true
    && workshop?.isConnected === true;
}

function custodyHoldIsActive() {
  return host?.__td613AshA8MapReturnHandshake?.current?.().held === true;
}

function publish(posture, source = null) {
  if (doc?.documentElement) doc.documentElement.dataset.ashA8DirtyDraftGuard = posture;
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a8-dirty-draft-guard', {
    detail:Object.freeze({
      schema:'td613.ash.a8-dirty-draft-guard-receipt/v0.1',
      posture,
      source,
      dirty_draft_active:dirtyDraftActive,
      map_workshop_active:canonicalMapWorkshopIsActive(),
      custody_hold_active:custodyHoldIsActive(),
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      human_closure_required:true
    })
  }));
}

function beginDirtyDraft(event) {
  if (!event.target?.closest?.(FORM_SELECTOR) || custodyHoldIsActive()) return false;
  host?.__td613AshA8MapReturnHandshake?.capture?.();
  dirtyDraftActive = true;
  publish('DIRTY_DRAFT_ACTIVE', event.type);
  return true;
}

function admitCommit(event) {
  if (!event.target?.closest?.(COMMIT_SELECTOR)) return false;
  dirtyDraftActive = false;
  publish('COMMIT_GESTURE_ADMITTED', 'VISIBLE_COMMIT_CAPTURE');
  return true;
}

function clear(source) {
  dirtyDraftActive = false;
  publish('CLEARED', source);
}

function shouldDefer(source) {
  if (!dirtyDraftActive || custodyHoldIsActive() || !canonicalMapWorkshopIsActive()) return false;
  publish('RECOMPILE_DEFERRED_DIRTY_DRAFT', source);
  return 'DIRTY_STAGE_DRAFT';
}

export function installAshA8DirtyDraftRecompileGuard() {
  if (!host || !doc?.body || host.__td613AshA8RecompileGuard) return false;
  doc.addEventListener('input', beginDirtyDraft, true);
  doc.addEventListener('change', beginDirtyDraft, true);
  doc.addEventListener('click', admitCommit, true);
  host.addEventListener('td613:ash:case-created', () => clear('CASE_CREATED'));
  host.addEventListener('td613:ash:case-closed', () => clear('CASE_CLOSED'));
  host.__td613AshA8RecompileGuard = Object.freeze({
    version:ASH_A8_DIRTY_DRAFT_RECOMPILE_GUARD_VERSION,
    shouldDefer,
    clear,
    current:() => Object.freeze({
      dirty_draft_active:dirtyDraftActive,
      map_workshop_active:canonicalMapWorkshopIsActive(),
      custody_hold_active:custodyHoldIsActive(),
      posture:doc?.documentElement?.dataset?.ashA8DirtyDraftGuard || null,
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    })
  });
  publish('READY', 'INSTALL');
  return true;
}

if (host && doc) installAshA8DirtyDraftRecompileGuard();