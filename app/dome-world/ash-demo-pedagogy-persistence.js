export const ASH_DEMO_PEDAGOGY_PERSISTENCE_VERSION = 'td613.ash.demo-pedagogy-persistence/v0.1-main-surface-portal';

const host = globalThis.window;
const doc = globalThis.document;
let queued = false;
let retryTimer = 0;

function dockLedger() {
  clearTimeout(retryTimer);
  const main = doc?.querySelector?.('body > main');
  const ledger = doc?.getElementById?.('ashDemoPedagogyLedger');
  if (!main || !ledger) {
    retryTimer = host?.setTimeout?.(schedule, 60) || 0;
    return false;
  }

  if (ledger.parentElement !== main || ledger !== main.firstElementChild) main.prepend(ledger);
  ledger.dataset.persistent = 'true';
  ledger.dataset.fixed = 'false';
  ledger.style.setProperty('position', 'relative', 'important');
  ledger.style.setProperty('inset', 'auto', 'important');
  ledger.style.setProperty('z-index', '1', 'important');
  doc.documentElement.dataset.ashDemoPedagogyPersistent = ASH_DEMO_PEDAGOGY_PERSISTENCE_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:demo-pedagogy-persistent', {
    detail:{
      version:ASH_DEMO_PEDAGOGY_PERSISTENCE_VERSION,
      profile:ledger.dataset.profile || null,
      parent:'body > main',
      fixed:false
    }
  }));
  return true;
}

function schedule() {
  if (queued) return;
  queued = true;
  host.setTimeout(() => {
    queued = false;
    dockLedger();
  }, 0);
}

export function installAshDemoPedagogyPersistence() {
  if (!host || !doc?.body || host.__td613AshDemoPedagogyPersistence) return false;
  for (const type of [
    'profile-demo-hydrated',
    'demo-pedagogy-hydrated',
    'demo-pedagogy-routebar-ready',
    'premium-ready',
    'ux-workspace-opened',
    'case-opened'
  ]) host.addEventListener(`td613:ash:${type}`, schedule);
  host.__td613AshDemoPedagogyPersistence = Object.freeze({
    version:ASH_DEMO_PEDAGOGY_PERSISTENCE_VERSION,
    refresh:dockLedger,
    current:() => Object.freeze({
      persistent:doc.getElementById('ashDemoPedagogyLedger')?.parentElement === doc.querySelector('body > main'),
      fixed:false,
      profile:doc.getElementById('ashDemoPedagogyLedger')?.dataset.profile || null
    })
  });
  schedule();
  return true;
}

if (host && doc) installAshDemoPedagogyPersistence();
