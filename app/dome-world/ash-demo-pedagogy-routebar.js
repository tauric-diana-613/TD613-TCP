export const ASH_DEMO_PEDAGOGY_ROUTEBAR_VERSION = 'td613.ash.demo-pedagogy-routebar/v0.1-persistent-four-step-route';

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
let retryTimer = 0;
let lastSignature = '';

function ensureStyles() {
  if (byId('td613-ash-demo-pedagogy-routebar-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-demo-pedagogy-routebar-css';
  style.textContent = `
    #ashDemoPedagogyRouteBar{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:100%;margin-top:8px;padding-top:8px;border-top:1px solid rgba(118,234,212,.14)}
    #ashDemoPedagogyRouteBar button{min-width:0;min-height:44px;padding:7px 9px;border:1px solid rgba(118,234,212,.18);background:rgba(1,9,7,.72);color:var(--muted);text-align:left;font:700 .56rem/1.3 var(--mono);text-transform:uppercase;cursor:pointer}
    #ashDemoPedagogyRouteBar button span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #ashDemoPedagogyRouteBar button small{display:block;margin-top:3px;color:var(--cyan);font:700 .5rem/1.2 var(--mono)}
    #ashDemoPedagogyRouteBar button[aria-current="step"]{border-color:var(--gold);color:var(--paper);background:rgba(228,198,108,.08)}
    #ashDemoPedagogyRouteBar button:hover,#ashDemoPedagogyRouteBar button:focus-visible{border-color:var(--cyan);color:var(--paper)}
    @media(max-width:620px){#ashDemoPedagogyRouteBar{grid-template-columns:repeat(2,minmax(0,1fr))}#ashDemoPedagogyRouteBar button{min-height:48px}}
  `;
  doc.head.append(style);
}

function currentState() {
  return host?.__td613AshDemoPedagogy?.current?.() || null;
}

function render() {
  clearTimeout(retryTimer);
  const context = byId('premiumContextBar');
  const state = currentState();
  if (!context || !state?.manifest?.task_spine) {
    retryTimer = host.setTimeout(render, 60);
    return false;
  }
  ensureStyles();
  let nav = byId('ashDemoPedagogyRouteBar');
  if (!nav) {
    nav = doc.createElement('nav');
    nav.id = 'ashDemoPedagogyRouteBar';
    nav.setAttribute('aria-label', 'Current demo task route');
    context.append(nav);
  }
  const active = doc.documentElement.dataset.ashPremiumWorkspace || null;
  const signature = `${state.profile}|${active}|${state.manifest.task_spine.map(item => `${item.workspace}:${item.label}`).join('|')}`;
  if (lastSignature !== signature || nav.dataset.renderSignature !== signature) {
    nav.dataset.profile = state.profile;
    nav.dataset.renderSignature = signature;
    nav.innerHTML = state.manifest.task_spine.map((item, index) => `<button type="button" data-demo-pedagogy-workspace="${item.workspace}" aria-current="${active === item.workspace ? 'step' : 'false'}" title="${item.detail}"><span>${index + 1} · ${item.label}</span><small>${item.workspace}</small></button>`).join('');
    lastSignature = signature;
  }
  doc.documentElement.dataset.ashDemoPedagogyRoutebar = ASH_DEMO_PEDAGOGY_ROUTEBAR_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:demo-pedagogy-routebar-ready', { detail:{ profile:state.profile, active, version:ASH_DEMO_PEDAGOGY_ROUTEBAR_VERSION } }));
  return true;
}

export function installAshDemoPedagogyRoutebar() {
  if (!host || !doc?.body || host.__td613AshDemoPedagogyRoutebar) return false;
  for (const type of ['premium-ready','profile-demo-hydrated','demo-pedagogy-hydrated','ux-workspace-opened','case-opened']) host.addEventListener(`td613:ash:${type}`, render);
  host.__td613AshDemoPedagogyRoutebar = Object.freeze({ version:ASH_DEMO_PEDAGOGY_ROUTEBAR_VERSION, refresh:render, current:() => Object.freeze({ profile:currentState()?.profile || null, active:doc.documentElement.dataset.ashPremiumWorkspace || null, visible:Boolean(byId('ashDemoPedagogyRouteBar')) }) });
  render();
  return true;
}

if (host && doc) installAshDemoPedagogyRoutebar();
