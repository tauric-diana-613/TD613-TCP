export * from './ash-workspace-bridge-core.js?v=20260723-a2-a5-v1';
import './ash-flicker-hardening.js?v=20260723-a2-a5-v1';
// Initial ingress may preserve one validated readiness receipt; operator Close Case waits for the active save and case-list refresh to quiesce before clearing the selector and Ash session.
import './ash-case-close-repair.js?v=20260723-a2-a5-v1';
// The persisted case pointer, not a stale in-memory case object, governs whether a session remains open.
import './ash-session-boundary.js?v=20260723-a2-a5-v1';

/* Canonical composition ordering retained under one release epoch:
import './ash-keep-mobile-composition.js';
import './ash-mobile-constitutional-closure.js';
import './ash-premium-ui.js';
import './ash-workspace-navigation.js';
import './ash-custodian-return.js';
import './ash-custodian-return-closure.js';
*/
import './ash-keep-mobile-composition.js?v=20260723-a2-a5-v1';
import './ash-mobile-constitutional-closure.js?v=20260723-a2-a5-v1';
import './ash-operation-coordinator.js?v=20260723-a2-a5-v1';
import './ash-case-feedback.js?v=20260723-a2-a5-v1';
import './ash-profile-demo-hydration.js?v=20260723-a2-a5-v1';
import './ash-investigation-demo-hydration.js?v=20260723-a2-a5-v1';
import './ash-research-demo-hydration.js?v=20260723-a2-a5-v1';
import './ash-research-demo-control-state.js?v=20260723-a2-a5-v1';
import './ash-legal-demo-control-state.js?v=20260723-a2-a5-v1';
import './ash-premium-ui.js?v=20260723-a2-a5-v1';
import './ash-premium-readiness-bridge.js?v=20260723-a2-a5-v1';
import './ash-guided-operator-ui.js?v=20260723-a2-a5-v1';
import './ash-premium-compatibility.js?v=20260723-a2-a5-v1';
import './ash-workspace-navigation.js?v=20260723-a2-a5-v1';
// Keep title, Capsule recovery guidance, and primary ingress explanation in separate readable lanes.
import './ash-ingress-copy-spacing.js?v=20260723-a2-a5-v1';
import './ash-ui-ux-rescue.js?v=20260723-a2-a5-v1';
// Live Flow-Core interprets the existing explicit lesson clock; it owns no Ash action or ambient scheduler.
import './ash-flowcore-pedagogy-field.js?v=20260723-a2-a5-v1';
// AIA receives one visible Flow-Core field; explicit legacy rollback bypasses the portal entirely.
import './ash-flowcore-ingress-portal-loader.js?v=20260723-a2-a5-v1';
// Canonical field only: quarantine the proxy and move ingress copy below the diagram.
import './ash-post-ingress-motion-restoration.js?v=20260723-a2-a5-v1';
// A2-A5 recompiles the existing field, explicit routes, and semantic navigation without creating another field or clock.
import './ash-whole-instrument-pedagogy.js?v=20260723-a2-a5-v1';
// One launch-scoped observer plus one delegated boundary preserve explicit profile and saved-case choices across remounts and late option commits without polling.
import './ash-profile-prompt-canonical.js?v=20260723-a2-a5-v1';
import './ash-composition-receipt-compatibility.js?v=20260723-a2-a5-v1';
import './ash-demo-entry-convergence.js?v=20260723-a2-a5-v1';
import './ash-demo-pedagogy-routebar.js?v=20260723-a2-a5-v1';
import './ash-return-ready-bundle.js?v=20260723-a2-a5-v1';
import './ash-custodian-return.js?v=20260723-a2-a5-v1';
import './ash-custodian-return-closure.js?v=20260723-a2-a5-v1';
import './ash-emergency-stability-contract.js?v=20260723-a2-a5-v1';
// Final presentation authority: manual scroll wins, setup remains actionable, and descenders remain visible.
import './ash-reviewability-repair.js?v=20260723-a2-a5-v1';

const ashBridgeHost = globalThis.window;
const ashBridgeDocument = globalThis.document;
let canonicalFieldRecompilationQueued = false;

function reconcileCanonicalConsequenceFieldOwner() {
  const stage = ashBridgeDocument?.querySelector?.('#ashAiaMembrane [data-aia-stage], #ashAiaMembrane .ash-aia__stage');
  const canonical = stage?.querySelector?.(':scope > .ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])')
    || ashBridgeDocument?.querySelector?.('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])');
  if (!canonical) return false;

  const firstField = stage?.querySelector?.(':scope > .ash-flowcore-field');
  const canonicalInStage = canonical.parentElement === stage;
  const reordered = Boolean(canonicalInStage && firstField && firstField !== canonical);
  if (reordered) stage.insertBefore(canonical, firstField);

  canonical.querySelectorAll('[data-flowcore-ingress-play]').forEach(control => control.remove());
  const play = ashBridgeDocument.querySelector('[data-aia-play]');
  if (play) {
    play.textContent = '▶ Play Consequence Field';
    play.classList.add('ash-whole-instrument-play');
    play.setAttribute('aria-describedby', 'ashWholeInstrumentStaticTruth');
    if (play.parentElement !== canonical) canonical.append(play);
  }

  ashBridgeDocument.documentElement.dataset.ashConsequenceFieldOwner = 'CANONICAL_VISIBLE_FIELD';
  ashBridgeDocument.documentElement.dataset.ashConsequenceFieldHost = canonical.dataset.flowcoreHost || canonical.parentElement?.id || 'UNKNOWN';
  ashBridgeDocument.documentElement.dataset.ashConsequencePlayCount = String(canonical.querySelectorAll('[data-aia-play]').length);
  if (reordered && !canonicalFieldRecompilationQueued) {
    canonicalFieldRecompilationQueued = true;
    queueMicrotask(() => {
      try {
        ashBridgeHost?.__td613AshWholeInstrument?.refresh?.('CANONICAL_FIELD_OWNER_RECONCILED');
      } finally {
        canonicalFieldRecompilationQueued = false;
      }
    });
  }
  return true;
}

function navigationTarget(control) {
  if (!control) return null;
  if (control.matches('[data-premium-workspace]')) return { workspace:control.dataset.premiumWorkspace, anchor:null };
  if (control.matches('[data-route-workspace]')) return { workspace:control.dataset.routeWorkspace, anchor:null };
  if (control.matches('[data-command-workspace]')) return { workspace:control.dataset.commandWorkspace, anchor:null };
  if (control.id === 'premiumReturnHome') return { workspace:'home', anchor:null };
  if (control.id === 'premiumContinuityButton') return { workspace:'capsule', anchor:null };
  if (control.dataset.commandAction === 'receipts') return { workspace:'work', anchor:'premiumReceiptInventory' };
  return null;
}

function captureSemanticNavigation(event) {
  const control = event.target?.closest?.(
    '[data-premium-workspace],[data-route-workspace],[data-command-workspace],#premiumReturnHome,#premiumContinuityButton,[data-command-action="receipts"]'
  );
  const destination = navigationTarget(control);
  const navigate = ashBridgeHost?.__td613AshWholeInstrument?.navigate;
  if (!control || !destination || typeof navigate !== 'function') return;

  event.preventDefault();
  event.stopImmediatePropagation();
  ashBridgeDocument.getElementById('premiumCommandSheet')?.close?.();
  navigate(destination.workspace, {
    source_control:control.id
      || control.dataset.premiumWorkspace
      || control.dataset.routeWorkspace
      || control.dataset.commandWorkspace
      || control.dataset.commandAction
      || 'canonical-navigation-control',
    anchor:destination.anchor,
    open:true,
    return_path:ashBridgeDocument.documentElement.dataset.ashPremiumWorkspace || 'home'
  });
}

ashBridgeHost?.addEventListener?.('click', captureSemanticNavigation, true);
ashBridgeHost?.addEventListener?.('td613:ash:whole-instrument-refreshed', reconcileCanonicalConsequenceFieldOwner);
for (const type of ['flowcore-portal-synced','case-opened','case-created','case-closed']) {
  ashBridgeHost?.addEventListener?.(`td613:ash:${type}`, () => queueMicrotask(reconcileCanonicalConsequenceFieldOwner));
}
queueMicrotask(reconcileCanonicalConsequenceFieldOwner);
