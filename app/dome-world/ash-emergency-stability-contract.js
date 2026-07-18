export const ASH_EMERGENCY_STABILITY_EPOCH = 'td613.ash.emergency-stability/2026-07-18-v6-canonical-membrane';

const REQUIRED_MEMBRANE_IDS = [
  'launch',
  'startDemo',
  'newCase',
  'selectCase',
  'openSelectedCase',
  'deleteSelectedCase',
  'openCapsuleRecovery',
  'guidedLaunchPromise'
];

function membraneComplete(doc = document) {
  return Boolean(doc.documentElement.dataset.ashCaseControls
    && REQUIRED_MEMBRANE_IDS.every(id => doc.getElementById(id)));
}

function reconcilePostControlsComposition(doc = document, host = window) {
  if (!doc.documentElement.dataset.ashCaseControls || doc.getElementById('openCapsuleRecovery')) return false;
  const navigation = host.__td613AshWorkspaceNavigation;
  if (typeof navigation?.refresh !== 'function') return false;
  navigation.refresh();
  doc.documentElement.dataset.ashPostControlsHandoff = 'EXPLICIT_FINAL_OWNER_REFRESH';
  host.dispatchEvent(new CustomEvent('td613:ash:launch-actions-composed', {
    detail:{
      version:ASH_EMERGENCY_STABILITY_EPOCH,
      recovery_entry_present:Boolean(doc.getElementById('openCapsuleRecovery')),
      observer_used:false
    }
  }));
  return true;
}

function revealCanonicalMembrane(doc = document, host = window, posture = 'COMPLETE') {
  doc.documentElement.dataset.ashMembraneReady = 'true';
  doc.documentElement.dataset.ashMembraneComposition = posture;
  if (doc.documentElement.dataset.ashSessionOpen !== 'true') {
    const launch = doc.getElementById('launch');
    launch?.classList.remove('hidden');
    launch?.scrollTo?.({ top:0, behavior:'auto' });
  }
  host.dispatchEvent(new CustomEvent('td613:ash:canonical-membrane-ready', {
    detail:{ version:ASH_EMERGENCY_STABILITY_EPOCH, posture }
  }));
}

function waitForCanonicalMembrane(doc = document, host = window) {
  const started = host.performance?.now?.() || Date.now();
  const deadline = started + 4000;
  let handoffAttempted = false;
  const check = () => {
    if (!handoffAttempted && doc.documentElement.dataset.ashCaseControls && !doc.getElementById('openCapsuleRecovery')) {
      handoffAttempted = reconcilePostControlsComposition(doc, host);
    }
    if (membraneComplete(doc)) {
      revealCanonicalMembrane(doc, host, 'COMPLETE');
      return;
    }
    const now = host.performance?.now?.() || Date.now();
    if (now >= deadline) {
      revealCanonicalMembrane(doc, host, 'DEGRADED_TIMEOUT');
      return;
    }
    host.requestAnimationFrame(check);
  };
  host.requestAnimationFrame(check);
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.documentElement.dataset.ashFlickerHardening = 'td613.ash.flicker-hardening/v0.1-static-compositor';
  document.documentElement.dataset.ashEmergencyStability = ASH_EMERGENCY_STABILITY_EPOCH;
  window.__td613AshEmergencyStability = Object.freeze({
    version:ASH_EMERGENCY_STABILITY_EPOCH,
    cache_epoch:'20260718-canonical-membrane-v6',
    motion_policy:'STATIC_SURFACE_NATIVE_SCROLL',
    membrane_policy:'HIDDEN_UNTIL_FINAL_COMPOSITION',
    close_policy:'SAVE_CLEAR_SESSION_RETURN_UNSELECTED_TO_MEMBRANE',
    composition_handoff:'EXPLICIT_FINAL_OWNER_REFRESH_NO_OBSERVER',
    ready:() => membraneComplete(document)
  });
  window.addEventListener('td613:ash:case-closed', () => revealCanonicalMembrane(document, window, 'SESSION_LOGOUT'));
  waitForCanonicalMembrane(document, window);
}
