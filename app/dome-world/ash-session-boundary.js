export const ASH_SESSION_BOUNDARY_VERSION = 'td613.ash.session-boundary/v0.3-pointer-governs-case-explicit-recovery-stays-open';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_EPOCH_KEY = 'td613.ash.session.epoch';
let installed = false;
let originalCore = null;
let recoveryObserver = null;

function pointer() {
  try { return host.localStorage.getItem(POINTER_KEY); }
  catch { return null; }
}

function closedCurrent() {
  return Object.freeze({ case_id:null, case_map_digest:null, route_memory_digest:null });
}

function governedCurrent() {
  const activePointer = pointer();
  if (!activePointer) return closedCurrent();
  const current = originalCore?.current?.() || {};
  if (current.case_id === activePointer) return current;
  return Object.freeze({ case_id:activePointer, case_map_digest:null, route_memory_digest:null });
}

function visible(node) {
  if (!node || node.hidden) return false;
  const style = host.getComputedStyle?.(node);
  return style?.display !== 'none'
    && style?.visibility !== 'hidden'
    && Number(style?.opacity ?? 1) > 0;
}

function capsuleRecoveryOpen() {
  if (pointer()) return false;
  const workspace = doc.getElementById('workspace-save');
  const panel = doc.getElementById('ashReturnPanel');
  const run = doc.getElementById('runCustodianReturn');
  const file = doc.getElementById('returnCapsuleFile');
  const returnBar = workspace?.querySelector('.capsule-recovery-navigation');
  const explicitRecovery = Boolean(file?.files?.length)
    || visible(returnBar)
    || doc.body.dataset.ashCapsuleRecoveryMode === 'true';
  return Boolean(
    workspace?.classList.contains('active')
      && panel
      && run
      && !run.disabled
      && visible(run)
      && explicitRecovery
  );
}

function exactWork(caseOpen, recoveryOpen) {
  const main = doc.querySelector('body > main');
  const rail = doc.querySelector('body > .workspace-rail');
  if (!main || !rail) return;
  const interactive = caseOpen || recoveryOpen;
  if (interactive) {
    main.removeAttribute('inert');
    main.removeAttribute('aria-hidden');
    rail.removeAttribute('inert');
    rail.removeAttribute('aria-hidden');
    return;
  }
  main.setAttribute('inert','');
  main.setAttribute('aria-hidden','true');
  rail.setAttribute('inert','');
  rail.setAttribute('aria-hidden','true');
}

function reconcile(reason = 'OBSERVED') {
  const activePointer = pointer();
  const open = Boolean(activePointer);
  const recoveryOpen = capsuleRecoveryOpen();
  doc.documentElement.dataset.ashSessionOpen = String(open);
  doc.documentElement.dataset.ashCapsuleRecoveryOpen = String(recoveryOpen);
  doc.body.dataset.ashAiaCaseOpen = String(open);
  doc.body.dataset.ashCapsuleRecoveryOpen = String(recoveryOpen);
  if (open) {
    doc.documentElement.classList.add('ash-has-current-case');
  } else {
    doc.documentElement.classList.remove('ash-has-current-case');
    try { host.localStorage.removeItem(SESSION_EPOCH_KEY); } catch {}
    if (!recoveryOpen) {
      const launch = doc.getElementById('launch');
      launch?.classList.remove('hidden');
      launch?.scrollTo?.({ top:0, behavior:'auto' });
      doc.querySelector('#launch .launch-panel')?.scrollTo?.({ top:0, behavior:'auto' });
    }
  }
  exactWork(open, recoveryOpen);
  host.__td613AshAIAIngress?.refresh?.();
  host.__td613AshAia3Composition?.refresh?.();
  host.__td613AshFlowcoreField?.refresh?.();
  doc.documentElement.dataset.ashSessionBoundaryReason = reason;
  host.dispatchEvent(new CustomEvent('td613:ash:session-boundary-reconciled', {
    detail:{ version:ASH_SESSION_BOUNDARY_VERSION, open, capsule_recovery_open:recoveryOpen, case_id:activePointer, reason }
  }));
  return Object.freeze({ open, capsule_recovery_open:recoveryOpen, case_id:activePointer, reason });
}

function installFacade(core) {
  if (!core || installed) return false;
  originalCore = core;
  const facade = Object.freeze({
    ...core,
    version:`${core.version}+session-boundary`,
    current:governedCurrent,
    sessionBoundary:() => reconcile('EXPLICIT_CORE_API')
  });
  host.__td613AshKeep = facade;
  installed = true;
  doc.documentElement.dataset.ashSessionBoundary = ASH_SESSION_BOUNDARY_VERSION;
  host.__td613AshSessionBoundary = Object.freeze({
    version:ASH_SESSION_BOUNDARY_VERSION,
    current:governedCurrent,
    reconcile,
    pointer,
    capsuleRecoveryOpen,
    originalCore:() => originalCore
  });
  reconcile('INSTALL');
  return true;
}

function installRecoveryObserver() {
  const workspace = doc.getElementById('workspace-save');
  if (!workspace || recoveryObserver) return;
  recoveryObserver = new MutationObserver(records => {
    if (!records.some(record => record.type === 'childList' || record.attributeName === 'class' || record.attributeName === 'hidden')) return;
    queueMicrotask(() => reconcile('RECOVERY_WORKSPACE_POSTURE_CHANGED'));
  });
  recoveryObserver.observe(workspace, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['class','hidden']
  });
  doc.getElementById('returnCapsuleFile')?.addEventListener('change', () => queueMicrotask(() => reconcile('RECOVERY_FILE_CHANGED')));
}

async function boot() {
  if (!host || !doc?.body) return;
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (host.__td613AshKeep?.current) {
      installFacade(host.__td613AshKeep);
      break;
    }
    await new Promise(resolve => host.setTimeout(resolve, 25));
  }
  if (!installed) {
    console.error('Ash session boundary held: canonical core unavailable.');
    return;
  }
  installRecoveryObserver();
  for (const type of ['case-opened','case-created','profile-demo-hydrated']) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => reconcile(type.toUpperCase())));
  }
  host.addEventListener('td613:ash:capsule-opened', () => {
    queueMicrotask(() => reconcile('CAPSULE_OPENED'));
    host.setTimeout(() => reconcile('CAPSULE_OPENED_SETTLED'), 80);
  });
  host.addEventListener('td613:ash:custodian-return', () => queueMicrotask(() => reconcile('CUSTODIAN_RETURN')));
  host.addEventListener('td613:ash:case-closed', () => {
    queueMicrotask(() => reconcile('CASE_CLOSED'));
    host.setTimeout(() => reconcile('CASE_CLOSED_SETTLED'), 80);
  });
  host.addEventListener('storage', event => {
    if (event.key === POINTER_KEY) reconcile('CROSS_TAB_POINTER_CHANGE');
  });
}

boot();
