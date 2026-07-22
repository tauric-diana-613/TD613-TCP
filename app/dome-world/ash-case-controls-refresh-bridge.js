export const ASH_CASE_CONTROLS_REFRESH_BRIDGE_VERSION = 'td613.ash.case-controls-refresh-bridge/v0.1-awaited-selector-index';

const host = globalThis.window;
const doc = globalThis.document;
let pulse = 0;

const byId = id => doc?.getElementById(id);

function waitForCaseListReady(preferredCaseId = '', timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const inspect = () => {
      const select = byId('selectCase');
      if (!select) {
        if (performance.now() - started >= timeoutMs) return reject(new Error('Saved-case selector is unavailable.'));
        return host.requestAnimationFrame(inspect);
      }
      const ready = select.dataset.caseListState === 'READY';
      const preferredReady = !preferredCaseId || [...select.options].some(option => option.value === preferredCaseId);
      if (ready && preferredReady) {
        if (preferredCaseId) select.value = preferredCaseId;
        return resolve(Object.freeze({
          state:select.dataset.caseListState,
          preferred_case_id:preferredCaseId || null,
          preferred_available:preferredReady,
          option_count:select.options.length,
          case_ids:[...select.options].map(option => option.value).filter(Boolean)
        }));
      }
      if (performance.now() - started >= timeoutMs) {
        return reject(new Error(`Saved-case selector did not reach READY${preferredCaseId ? ` with ${preferredCaseId}` : ''}.`));
      }
      host.requestAnimationFrame(inspect);
    };
    inspect();
  });
}

async function refreshCases(preferredCaseId = '') {
  const launch = byId('launch');
  const select = byId('selectCase');
  if (!launch || !select) throw new Error('Ash ingress case controls are unavailable.');

  const token = `ash-case-list-refresh-pulse-${++pulse}`;
  launch.classList.add(token);
  await new Promise(resolve => queueMicrotask(resolve));
  launch.classList.remove(token);
  const receipt = await waitForCaseListReady(preferredCaseId);
  doc.documentElement.dataset.ashCaseListRefresh = 'READY';
  host.dispatchEvent(new CustomEvent('td613:ash:case-list-refreshed', {
    detail:{ version:ASH_CASE_CONTROLS_REFRESH_BRIDGE_VERSION, ...receipt }
  }));
  return receipt;
}

export function installAshCaseControlsRefreshBridge() {
  if (!host || !doc?.body) return false;
  const prior = host.__td613AshCaseControls || {};
  if (prior.refresh_bridge_version === ASH_CASE_CONTROLS_REFRESH_BRIDGE_VERSION) return false;
  host.__td613AshCaseControls = Object.freeze({
    ...prior,
    refresh_bridge_version:ASH_CASE_CONTROLS_REFRESH_BRIDGE_VERSION,
    refreshCases,
    current:() => Object.freeze({
      state:byId('selectCase')?.dataset.caseListState || null,
      case_ids:[...(byId('selectCase')?.options || [])].map(option => option.value).filter(Boolean)
    })
  });
  doc.documentElement.dataset.ashCaseControlsRefreshBridge = ASH_CASE_CONTROLS_REFRESH_BRIDGE_VERSION;
  return true;
}

if (host && doc) installAshCaseControlsRefreshBridge();
