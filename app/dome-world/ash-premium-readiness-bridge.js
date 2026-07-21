export const ASH_PREMIUM_READINESS_BRIDGE_VERSION = 'td613.ash.premium-readiness/v0.1-exact-instrument-graph';

const host = globalThis.window;
const doc = globalThis.document;
let observer = null;
let timer = 0;
let published = false;

function exactState() {
  const api = Boolean(host?.__td613AshPremiumUI);
  const dock = Boolean(doc?.getElementById('premiumPrimaryDock'));
  const context = Boolean(doc?.getElementById('premiumContextBar'));
  const home = Boolean(doc?.getElementById('workspace-home'));
  const work = Boolean(doc?.getElementById('workspace-work'));
  return Object.freeze({ api, dock, context, home, work, ready:api && dock && context && home && work });
}

function publish() {
  if (!host || !doc?.documentElement) return false;
  const state = exactState();
  doc.documentElement.dataset.ashPremiumReady = String(state.ready);
  if (!state.ready) {
    clearTimeout(timer);
    timer = host.setTimeout(publish, 50);
    return false;
  }
  if (published) return true;
  published = true;
  doc.documentElement.dataset.ashPremiumReadiness = ASH_PREMIUM_READINESS_BRIDGE_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:premium-ready', {
    detail:{ version:ASH_PREMIUM_READINESS_BRIDGE_VERSION, ...state }
  }));
  observer?.disconnect();
  clearTimeout(timer);
  return true;
}

export function installAshPremiumReadinessBridge() {
  if (!host || !doc?.body || host.__td613AshPremiumReadiness) return false;
  observer = new MutationObserver(publish);
  observer.observe(doc.body, { childList:true, subtree:true });
  for (const type of ['core-ready','case-opened','case-created','profile-demo-hydrated']) {
    host.addEventListener(`td613:ash:${type}`, publish);
  }
  host.__td613AshPremiumReadiness = Object.freeze({
    version:ASH_PREMIUM_READINESS_BRIDGE_VERSION,
    refresh:publish,
    current:exactState
  });
  publish();
  return true;
}

if (host && doc) installAshPremiumReadinessBridge();
