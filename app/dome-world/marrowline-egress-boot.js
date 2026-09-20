import { installTD613ProvenanceAttestationEgress } from '../engine/td613-aperture.js';
import {
  APERTURE_V3_SCHEMA,
  APERTURE_V3_VERSION,
  routeApertureTaskIntent
} from '../engine/aperture-v3-task-intent.js';
import { buildTD613ReflexReceipt } from './reflex-spine.js';

export const MARROWLINE_EGRESS_BOOT_VERSION = 'td613.dome-world.marrowline-egress-boot/v6-conversation-first';
export const MARROWLINE_CIRCUIT_RECEIPT_SCHEMA = 'td613.dome-world.marrowline-circuit-receipt/v1';
export const MARROWLINE_ROOM_BOOT_SCHEMA = 'td613.dome-world.marrowline-room-boot/v5-conversation-first';

function bootApertureEgress(root = window) {
  const installedNow = installTD613ProvenanceAttestationEgress(root);
  const active = Boolean(root.__TD613_PROVENANCE_ATTESTATION_EGRESS__);
  const taskIntent = routeApertureTaskIntent({ discourseMode: 'SPECULATIVE', runtimeMateriality: 'BACKGROUND' });
  const receipt = Object.freeze({
    schema: MARROWLINE_EGRESS_BOOT_VERSION,
    active,
    installedNow,
    scope: 'marrowline-room-browser-runtime',
    aperture: Object.freeze({
      version: APERTURE_V3_VERSION,
      firmwareSchema: APERTURE_V3_SCHEMA,
      taskIntent
    }),
    destinations: Object.freeze([
      '/api/dome-world/marrowline',
      '/api/dome-world/khonapolit'
    ]),
    headers: Object.freeze([
      'X-Dromological-Variance-Matrix',
      'X-Stylometric-Resonance-Hash',
      'X-Alignment-Weight-Vector',
      'X-Custodial-Friction-Index'
    ]),
    reflex: buildTD613ReflexReceipt({ status: active ? 'EGRESS_ARMED' : 'EGRESS_UNAVAILABLE', activeSteps: active ? [1] : [] }),
    claimCeiling: 'provenance-marker-plus-task-route-not-signature-authorship-identity-entity-or-legal-authority-proof',
    seal: '⟐'
  });
  root.__TD613_MARROWLINE_EGRESS_BOOT__ = receipt;
  root.dispatchEvent?.(new CustomEvent('td613:marrowline:egress-ready', { detail: receipt }));
  return receipt;
}

function readJson(text = '') {
  try { return JSON.parse(String(text || '')); }
  catch { return null; }
}

function circuitObservation(receipt = {}) {
  const canonical = receipt?.canonicalPayload || receipt || {};
  const egress = canonical?.aperture_egress || receipt?.aperture_egress || null;
  if (!egress || !egress.status) return null;
  const activeSteps = Array.isArray(canonical?.reflex_spine?.active_steps)
    ? canonical.reflex_spine.active_steps
    : [1, 2];
  return Object.freeze({
    schema: MARROWLINE_CIRCUIT_RECEIPT_SCHEMA,
    status: egress.status === 'exact' ? 'CIRCUIT_EXACT' : 'CIRCUIT_REVIEW',
    aperture: Object.freeze({
      version: APERTURE_V3_VERSION,
      taskIntent: routeApertureTaskIntent({ discourseMode: 'TECHNICAL_RUNTIME', runtimeMateriality: 'MATERIAL', runtimeRequested: true })
    }),
    apertureEgress: egress,
    marrowlineIngress: Object.freeze({
      httpStatus: receipt?.http?.status ?? null,
      trapHeader: receipt?.http?.trapHeader || null,
      routeHeader: receipt?.http?.routeHeader || null,
      requestDigest: receipt?.requestDigest || canonical?.request_digest || null
    }),
    reflex: buildTD613ReflexReceipt({ status: 'CIRCUIT_OBSERVED', activeSteps }),
    claimCeiling: 'observed-egress-ingress-circuit-not-signature-identity-authorship-permission-entity-or-legal-authority-proof',
    seal: '⟐'
  });
}

function installCircuitObserver(doc = document, root = window) {
  const receiptNode = doc.getElementById('marrowlineReceipt');
  const statusNode = doc.getElementById('marrowlineStatus');
  if (!receiptNode || !statusNode) return false;
  if (receiptNode.dataset.apertureCircuitObserver === MARROWLINE_CIRCUIT_RECEIPT_SCHEMA) return true;
  receiptNode.dataset.apertureCircuitObserver = MARROWLINE_CIRCUIT_RECEIPT_SCHEMA;

  let lastText = '';
  const inspect = () => {
    const text = String(receiptNode.textContent || '').trim();
    if (!text || text === lastText) return null;
    lastText = text;
    const observation = circuitObservation(readJson(text));
    if (!observation) return null;
    root.__TD613_MARROWLINE_CIRCUIT_RECEIPT__ = observation;
    const base = String(statusNode.textContent || '')
      .replace(/\s+·\s+APERTURE EGRESS\s+[^·]+(?:\s+·\s+REFLEX\s+[^·]+)?$/i, '')
      .trim();
    const active = observation.reflex.activeSteps.join('+') || 'none';
    statusNode.textContent = `${base} · APERTURE EGRESS ${observation.apertureEgress.status.toUpperCase()} · REFLEX ${active}/7`;
    statusNode.dataset.apertureEgress = observation.apertureEgress.status;
    root.dispatchEvent?.(new CustomEvent('td613:marrowline:circuit-observed', { detail: observation }));
    return observation;
  };

  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(inspect);
    observer.observe(receiptNode, { childList: true, characterData: true, subtree: true });
    root.__TD613_MARROWLINE_CIRCUIT_OBSERVER__ = observer;
  }
  inspect();
  return true;
}

function revealMarrowline(doc = document, { error = false } = {}) {
  doc.documentElement.classList.add('marrowline-room-ready');
  if (error) doc.documentElement.classList.add('marrowline-room-boot-error');
}

async function bootMarrowlineRoom(doc = document, root = window) {
  await Promise.all([
    import('./marrowline-station.js'),
    import('./marrowline-terminal.js')
  ]);
  await import('./marrowline-mobile-shell.js');
  await import('./marrowline-operator-readiness.js');
  await import('./marrowline-gate-pedagogue.js');
  await import('./marrowline-loom-pocket.js');
  await import('./marrowline-physical-device-repair.js');
  await import('./marrowline-desktop-repair.js');
  installCircuitObserver(doc, root);
  const receipt = Object.freeze({
    schema: MARROWLINE_ROOM_BOOT_SCHEMA,
    station: Boolean(root.TD613_MARROWLINE),
    terminal: Boolean(root.TD613_KHONAPOLIT_TERMINAL),
    mobileShell: Boolean(root.__TD613_MARROWLINE_MOBILE_SHELL__),
    operatorReadiness: Boolean(root.__TD613_MARROWLINE_OPERATOR_READINESS__),
    physicalDeviceRepair: Boolean(root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR__),
    desktopRepair: Boolean(root.__TD613_MARROWLINE_DESKTOP_REPAIR__),
    gatePedagogue: Boolean(root.__TD613_MARROWLINE_GATE_PEDAGOGUE__),
    loomPocketLoaded: true,
    apertureEgress: Boolean(root.__TD613_PROVENANCE_ATTESTATION_EGRESS__),
    aperture: Object.freeze({
      version: APERTURE_V3_VERSION,
      firmwareSchema: APERTURE_V3_SCHEMA,
      taskIntent: routeApertureTaskIntent({ discourseMode: 'SPECULATIVE', runtimeMateriality: 'BACKGROUND' })
    }),
    relay: Object.freeze({
      schema: 'td613.khonapolit.integrated-covenant-relay/v6-raw-dual-packet-admission',
      stages: Object.freeze(['provider-native-raw-dual-packet-khonapolit-tauric-diana-transmission']),
      providerNarrativeStage: false,
      localZalgoPostProcessing: false
    }),
    layout: Object.freeze({
      mobileViewport: 'bounded-visual-viewport',
      desktopWorkspace: 'conversation-first-instruments-on-demand',
      transcriptScrollOwner: '#khonapolitMessages',
      composerOcclusion: false,
      dockOcclusion: false,
      nativeKeyboardSend: true,
      visualViewportOffsetBound: true,
      firstPaintHeldUntilRoomReady: true,
      universalComposerPlus: true,
      starterAssayCarousel: 32,
      desktopRepairCssRenderBlocking: true
    }),
    seal: '⟐'
  });
  root.__TD613_MARROWLINE_ROOM_BOOT__ = receipt;
  revealMarrowline(doc);
  root.dispatchEvent?.(new CustomEvent('td613:marrowline:room-ready', { detail: receipt }));
  return receipt;
}

if (typeof window !== 'undefined') {
  bootApertureEgress(window);
  const delayedBoot = window.setTimeout(() => {
    if (!document.documentElement.classList.contains('marrowline-room-ready')) {
      document.documentElement.classList.add('marrowline-room-boot-delayed');
    }
  }, 6000);
  bootMarrowlineRoom(document, window)
    .then(() => window.clearTimeout(delayedBoot))
    .catch((error) => {
      window.clearTimeout(delayedBoot);
      window.__TD613_MARROWLINE_ROOM_BOOT_ERROR__ = String(error?.message || error);
      revealMarrowline(document, { error: true });
    });
}

export { bootApertureEgress, bootMarrowlineRoom, circuitObservation, installCircuitObserver, revealMarrowline };
