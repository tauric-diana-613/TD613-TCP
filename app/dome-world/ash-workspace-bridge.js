export const ASH_WORKSPACE_BRIDGE_VERSION = 'td613.ash-keep.workspace-bridge/v0.1';

const installedDocuments = new WeakSet();

export function installAshWorkspaceBridge(doc = globalThis.document, host = globalThis.window) {
  if (!doc || !host || installedDocuments.has(doc)) return false;

  doc.addEventListener('click', event => {
    const tab = event.target?.closest?.('.work-tab[data-workspace="custody"]');
    if (!tab) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const openWorkspace = host.__td613OpenAshWorkspace;
    if (typeof openWorkspace !== 'function') {
      doc.dispatchEvent(new host.CustomEvent('td613:ash-keep:workspace-bridge-held', {
        detail: {
          workspace: 'custody',
          reason: 'BASE_WORKSPACE_CAPABILITY_UNAVAILABLE',
          bridge: ASH_WORKSPACE_BRIDGE_VERSION
        }
      }));
      return;
    }

    openWorkspace('custody');
  }, true);

  installedDocuments.add(doc);
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshWorkspaceBridge(document, window);
}
