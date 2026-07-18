export const ASH_POST_CONTROLS_HANDOFF_VERSION = 'td613.ash.post-controls-handoff/v1.0';
export const ASH_POST_CONTROLS_HANDOFF_TAG = '<script type="module" src="/dome-world/ash-post-controls-handoff.js?v=20260718-canonical-membrane-v6"></script>';

const CASE_CONTROLS_TAG = '<script type="module" src="/dome-world/ash-case-controls.js"></script>';

export function injectAshPostControlsHandoff(source = '') {
  const html = String(source || '');
  if (!html) throw new Error('ash-post-controls-source-empty');
  if (html.includes(ASH_POST_CONTROLS_HANDOFF_TAG)) return html;
  const count = html.split(CASE_CONTROLS_TAG).length - 1;
  if (count !== 1) throw new Error(`ash-case-controls-tag-count:${count}`);
  return html.replace(CASE_CONTROLS_TAG, `${CASE_CONTROLS_TAG}\n  ${ASH_POST_CONTROLS_HANDOFF_TAG}`);
}

export function completeAshPostControlsHandoff(doc = globalThis.document, host = globalThis.window) {
  if (!doc || !host || doc.documentElement.dataset.ashPostControlsHandoff === ASH_POST_CONTROLS_HANDOFF_VERSION) return false;
  if (!doc.documentElement.dataset.ashCaseControls) return false;
  const navigation = host.__td613AshWorkspaceNavigation;
  if (typeof navigation?.refresh !== 'function') return false;
  navigation.refresh();
  doc.documentElement.dataset.ashPostControlsHandoff = ASH_POST_CONTROLS_HANDOFF_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:launch-actions-composed', {
    detail: {
      version: ASH_POST_CONTROLS_HANDOFF_VERSION,
      recovery_entry_present: Boolean(doc.getElementById('openCapsuleRecovery')),
      observer_used: false
    }
  }));
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (!completeAshPostControlsHandoff(document, window)) {
    window.requestAnimationFrame(() => completeAshPostControlsHandoff(document, window));
  }
}
