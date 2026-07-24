export const ASH_A7_A11_RECOMPILER_CORE_VERSION = 'td613.ash.a7-a11-recompiler-core/v0.3';

const host = globalThis.window;
const doc = globalThis.document;
const installedStages = new Set();

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[character]);

export const humanize = value => String(value || '')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, letter => letter.toUpperCase());

export const reducedMotion = () => host?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
export const byId = id => doc?.getElementById(id);

export function ensureA7A11Styles() {
  if (!doc?.head || byId('td613-ash-a7-a11-recompiler-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-a7-a11-recompiler-css';
  style.textContent = `
    .ash-stage-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}
    .ash-stage-card{grid-column:span 6;min-width:0;padding:17px;border:1px solid rgba(118,234,212,.22);background:rgba(4,19,15,.72)}
    .ash-stage-card.wide{grid-column:1/-1}.ash-stage-card h3{margin:3px 0 8px;font:500 1.3rem/1.08 var(--serif,Georgia,serif)}
    .ash-stage-kicker{margin:0;color:var(--mint,#76ead4);font:700 .62rem/1.4 var(--mono,ui-monospace,monospace);text-transform:uppercase}
    .ash-stage-copy{margin:7px 0;color:var(--muted,#9ab4aa);font-size:.76rem;line-height:1.55}
    .ash-stage-list{display:grid;gap:8px;margin:10px 0 0;padding:0;list-style:none}.ash-stage-list li{padding:9px 10px;border-left:2px solid rgba(118,234,212,.45);background:rgba(118,234,212,.045);font-size:.74rem;line-height:1.5}
    .ash-stage-facts{display:grid;gap:1px;margin:10px 0 0;background:rgba(118,234,212,.16);border:1px solid rgba(118,234,212,.16)}
    .ash-stage-facts div{display:grid;grid-template-columns:minmax(120px,.45fr) minmax(0,1fr);gap:12px;padding:9px 10px;background:#06130f}
    .ash-stage-facts dt{color:var(--muted,#9ab4aa);font:700 .61rem var(--mono,ui-monospace,monospace);text-transform:uppercase}.ash-stage-facts dd{margin:0;font-size:.73rem;line-height:1.45;overflow-wrap:anywhere}
    .ash-stage-primary-action{min-height:42px;border-color:rgba(118,234,212,.68)!important;background:#0b2a21!important}
    .ash-stage-table-wrap{overflow:auto;margin-top:10px}.ash-stage-table{width:100%;border-collapse:collapse;font-size:.71rem}.ash-stage-table th,.ash-stage-table td{padding:9px;border:1px solid rgba(118,234,212,.18);text-align:left;vertical-align:top}.ash-stage-table th{color:var(--mint,#76ead4);font:700 .61rem var(--mono,ui-monospace,monospace);text-transform:uppercase}.ash-stage-table code{overflow-wrap:anywhere}
    .ash-stage-status{min-height:1.4em;margin:8px 0 0;color:var(--mint,#76ead4);font:650 .66rem/1.5 var(--mono,ui-monospace,monospace)}
    .ash-stage-hold{padding:9px 10px;border-left:2px solid rgba(228,198,108,.65);background:rgba(228,198,108,.055);color:var(--muted,#9ab4aa);font-size:.71rem;line-height:1.5}
    .ash-stage-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ash-stage-form .wide{grid-column:1/-1}.ash-stage-form label{display:grid;gap:5px;color:var(--muted,#9ab4aa);font:700 .62rem var(--mono,ui-monospace,monospace);text-transform:uppercase}.ash-stage-form input,.ash-stage-form select,.ash-stage-form textarea{width:100%;min-height:42px;padding:9px;border:1px solid rgba(118,234,212,.24);background:#010806;color:var(--paper,#fff8da)}.ash-stage-form textarea{min-height:95px;resize:vertical;line-height:1.5}
    @media(max-width:760px){.ash-stage-card{grid-column:1/-1}.ash-stage-form{grid-template-columns:1fr}.ash-stage-form .wide{grid-column:auto}.ash-stage-facts div{grid-template-columns:1fr}.ash-stage-table{min-width:720px}}
  `;
  doc.head.append(style);
}

function captureStageDrafts() {
  if (!doc) return Object.freeze({ controls:[], active:null });
  const active = doc.activeElement;
  const controls = [...doc.querySelectorAll('.ash-stage-form input[id],.ash-stage-form select[id],.ash-stage-form textarea[id]')].map(control => Object.freeze({
    id:control.id,
    value:control.value,
    checked:'checked' in control ? Boolean(control.checked) : null
  }));
  return Object.freeze({
    controls:Object.freeze(controls),
    active:active?.id && active.closest?.('.ash-stage-form') ? Object.freeze({
      id:active.id,
      selection_start:Number.isInteger(active.selectionStart) ? active.selectionStart : null,
      selection_end:Number.isInteger(active.selectionEnd) ? active.selectionEnd : null
    }) : null
  });
}

function restoreStageDrafts(draft) {
  if (!doc || !draft?.controls?.length) return false;
  let restored = false;
  for (const saved of draft.controls) {
    const control = byId(saved.id);
    if (!control?.closest?.('.ash-stage-form')) continue;
    if (control.tagName === 'SELECT' && ![...control.options].some(option => option.value === saved.value)) continue;
    control.value = saved.value;
    if (saved.checked !== null && 'checked' in control) control.checked = saved.checked;
    restored = true;
  }
  const active = draft.active ? byId(draft.active.id) : null;
  if (active?.closest?.('.ash-stage-form')) {
    active.focus?.({ preventScroll:true });
    if (draft.active.selection_start !== null && typeof active.setSelectionRange === 'function') {
      active.setSelectionRange(draft.active.selection_start, draft.active.selection_end ?? draft.active.selection_start);
    }
  }
  return restored;
}

export async function currentPremiumSnapshot() {
  const premium = host?.__td613AshPremiumUI;
  if (!premium) return null;
  await premium.refresh?.();
  return premium.snapshot?.() || null;
}

export function publishStageWorldAnswer(stage, message, detail = {}) {
  const answer = Object.freeze({
    schema:'td613.ash.stage-world-answer/v0.1',
    stage,
    message:String(message || ''),
    observed_at:new Date().toISOString(),
    authority_changed:false,
    source_bytes_moved:false,
    custody_changed:false,
    release_posture_changed:false,
    closure_changed:false,
    ...detail
  });
  const status = byId(`ash${stage}Status`) || doc?.querySelector?.('[data-aia-live]');
  if (status) status.textContent = answer.message;
  host?.dispatchEvent?.(new CustomEvent(`td613:ash:${stage.toLowerCase()}-world-answer`, { detail:answer }));
  return answer;
}

const EVENT_TYPES = Object.freeze([
  'core-ready','case-opened','case-created','case-closed','core-mutated','profile-demo-hydrated',
  'custody-bound','rebuild-kept','draft-kept','review-kept','release-kept','continuity-kept','capsule-opened',
  'whole-instrument-refreshed','a6-affordance-refreshed'
]);

export function installAshStage({ stage, sync, navigationSelectors = '' }) {
  if (!host || !doc?.body || !stage || typeof sync !== 'function' || installedStages.has(stage)) return false;
  installedStages.add(stage);
  ensureA7A11Styles();
  let serial = 0;
  const run = async source => {
    const activeStageForm = doc.activeElement?.closest?.(`[id^="ash${stage}"] .ash-stage-form`);
    if (activeStageForm) {
      host.dispatchEvent(new CustomEvent(`td613:ash:${stage.toLowerCase()}-recompile-deferred`, {
        detail:Object.freeze({
          stage,
          source,
          reason:'ACTIVE_STAGE_FORM',
          authority_changed:false,
          source_bytes_moved:false,
          human_closure_required:true
        })
      }));
      return false;
    }
    const token = ++serial;
    const draft = captureStageDrafts();
    const snapshot = await currentPremiumSnapshot();
    if (token !== serial) return false;
    const result = await sync(snapshot, source);
    const draftRestored = restoreStageDrafts(draft);
    doc.documentElement.dataset[`ash${stage}Recompiled`] = 'true';
    host.dispatchEvent(new CustomEvent(`td613:ash:${stage.toLowerCase()}-recompiled`, {
      detail:{ stage, source, rendered:Boolean(result), draft_restored:draftRestored, authority_changed:false, source_bytes_moved:false, human_closure_required:true }
    }));
    return result;
  };
  for (const type of EVENT_TYPES) host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => run(`EVENT_${type.toUpperCase()}`)));
  doc.addEventListener('click', event => {
    const control = navigationSelectors && event.target?.closest?.(navigationSelectors);
    if (control) queueMicrotask(() => run('EXPLICIT_NAVIGATION'));
  }, true);
  host.addEventListener('td613:ash:canonical-module-graph-ready', () => queueMicrotask(() => run('CANONICAL_MODULE_GRAPH_READY')));
  host[`__td613Ash${stage}`] = Object.freeze({ version:ASH_A7_A11_RECOMPILER_CORE_VERSION, refresh:run });
  queueMicrotask(() => run('INSTALL'));
  return true;
}

function publishA9LoadHold(error) {
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a9-load-held', {
    detail:Object.freeze({
      schema:'td613.ash.a9-load-hold/v0.1',
      message:String(error?.message || error),
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    })
  }));
  return null;
}

function loadA9Module() {
  if (!host) return Promise.resolve(null);
  if (!host.__td613AshA9ModulePromise) {
    host.__td613AshA9ModulePromise = import('./ash-a9-work-recompilation.js?v=20260723-a9-v1').catch(publishA9LoadHold);
  }
  return host.__td613AshA9ModulePromise;
}

if (host) {
  if (doc?.documentElement?.dataset?.ashModuleGraph === 'ready') queueMicrotask(loadA9Module);
  else host.addEventListener('td613:ash:canonical-module-graph-ready', () => queueMicrotask(loadA9Module), { once:true });
}

if (host && !host.__td613AshA9WorkspaceOwner) {
  const refreshSettledA9Work = event => {
    if (event.detail?.workspace !== 'work') return;
    const workBody = byId('premiumWorkBody');
    const staleStage = byId('ashA9WorkRecompilation');
    if (workBody && staleStage && workBody.contains(staleStage)) {
      workBody.innerHTML = '<div class="premium-skeleton" data-ash-a9-compiling="true">Compiling the current intention-shaped Work queue…</div>';
    }
    queueMicrotask(async () => {
      await host.__td613AshPremiumUI?.refresh?.();
      await loadA9Module();
      await host.__td613AshA9?.refresh?.('UX_WORKSPACE_OPENED');
    });
  };
  host.addEventListener('td613:ash:ux-workspace-opened', refreshSettledA9Work);
  host.__td613AshA9WorkspaceOwner = Object.freeze({
    version:'td613.ash.a9-workspace-owner/v0.2',
    event:'td613:ash:ux-workspace-opened',
    admission_event:'td613:ash:canonical-module-graph-ready',
    native_workspace_settled_first:true,
    stale_shell_replaced:true,
    active_stage_form_deferred:true,
    automatic_consequential_action:false,
    authority_changed:false,
    source_bytes_moved:false,
    human_closure_required:true
  });
}

function publishA10LoadHold(error) {
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a10-load-held', {
    detail:Object.freeze({
      schema:'td613.ash.a10-load-hold/v0.1',
      message:String(error?.message || error),
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    })
  }));
  return null;
}

function loadA10Module() {
  if (!host) return Promise.resolve(null);
  if (!host.__td613AshA10ModulePromise) {
    host.__td613AshA10ModulePromise = import('./ash-a10-choir-recompilation.js?v=20260723-a10-v1').catch(publishA10LoadHold);
  }
  return host.__td613AshA10ModulePromise;
}

if (host) {
  if (doc?.documentElement?.dataset?.ashModuleGraph === 'ready') queueMicrotask(loadA10Module);
  else host.addEventListener('td613:ash:canonical-module-graph-ready', () => queueMicrotask(loadA10Module), { once:true });
}

if (host && !host.__td613AshA10WorkspaceOwner) {
  const refreshSettledA10Choir = event => {
    if (event.detail?.workspace !== 'choir') return;
    queueMicrotask(async () => {
      await host.__td613AshPremiumUI?.refresh?.();
      await loadA10Module();
      await host.__td613AshA10?.refresh?.('UX_WORKSPACE_OPENED');
    });
  };
  host.addEventListener('td613:ash:ux-workspace-opened', refreshSettledA10Choir);
  host.__td613AshA10WorkspaceOwner = Object.freeze({
    version:'td613.ash.a10-workspace-owner/v0.2',
    event:'td613:ash:ux-workspace-opened',
    admission_event:'td613:ash:canonical-module-graph-ready',
    native_workspace_settled_first:true,
    native_choir_preserved:true,
    active_stage_form_deferred:true,
    automatic_assay:false,
    automatic_rebuild_test:false,
    automatic_consequential_action:false,
    authority_changed:false,
    source_bytes_moved:false,
    human_closure_required:true
  });
}

function publishA11LoadHold(error) {
  host?.dispatchEvent?.(new CustomEvent('td613:ash:a11-load-held', {
    detail:Object.freeze({
      schema:'td613.ash.a11-load-hold/v0.1',
      message:String(error?.message || error),
      authority_changed:false,
      source_bytes_moved:false,
      human_closure_required:true
    })
  }));
  return null;
}

function loadA11Module() {
  if (!host) return Promise.resolve(null);
  if (!host.__td613AshA11ModulePromise) {
    host.__td613AshA11ModulePromise = import('./ash-a11-capsule-recompilation.js?v=20260724-a11-v1').catch(publishA11LoadHold);
  }
  return host.__td613AshA11ModulePromise;
}

if (host) {
  if (doc?.documentElement?.dataset?.ashModuleGraph === 'ready') queueMicrotask(loadA11Module);
  else host.addEventListener('td613:ash:canonical-module-graph-ready', () => queueMicrotask(loadA11Module), { once:true });
}

if (host && !host.__td613AshA11WorkspaceOwner) {
  const refreshSettledA11Capsule = event => {
    if (event.detail?.workspace !== 'capsule') return;
    queueMicrotask(async () => {
      await host.__td613AshPremiumUI?.refresh?.();
      await loadA11Module();
      await host.__td613AshA11?.refresh?.('UX_WORKSPACE_OPENED');
    });
  };
  host.addEventListener('td613:ash:ux-workspace-opened', refreshSettledA11Capsule);
  host.__td613AshA11WorkspaceOwner = Object.freeze({
    version:'td613.ash.a11-workspace-owner/v0.1',
    event:'td613:ash:ux-workspace-opened',
    admission_event:'td613:ash:canonical-module-graph-ready',
    native_workspace_settled_first:true,
    native_capsule_preserved:true,
    save_point_owner_preserved:true,
    destination_handoff_separate:true,
    active_stage_form_deferred:true,
    automatic_save:false,
    automatic_export:false,
    automatic_import:false,
    automatic_handoff:false,
    automatic_consequential_action:false,
    authority_changed:false,
    source_bytes_moved:false,
    human_closure_required:true
  });
}
