export const ASH_DESTINATION_POSTURE_VERSION = 'td613.ash.destination-posture/v0.1';

const installedHosts = new WeakSet();
const ROUTE_POSTURE_ID = 'ashCourtRoutePosture';
const ROUTE_STATUS_ID = 'ashCourtRouteStatus';
const EXCERPT_ATTESTATION_ID = 'ashCourtExcerptAttestation';
const ORIGINAL_ATTESTATION_ID = 'ashCourtOriginalAttestation';
const GATE_STATUS_ID = 'ashCourtGateStatus';
const MAX_COMPOSITION_ATTEMPTS = 8;

const byId = (doc, id) => doc.getElementById(id);

function ensureStyles(doc) {
  if (byId(doc, 'td613-ash-destination-posture-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-destination-posture-css';
  style.textContent = `
    .ash-court-route-field{display:grid;gap:6px;margin:4px 0 10px}
    .ash-court-route-field label{color:#ffd2d9;font:700 .59rem var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em}
    .ash-court-route-field select{width:100%;min-height:42px;border:1px solid rgba(255,139,157,.28);border-radius:0;background:#020806;padding:9px;color:var(--premium-ivory,#fff8da);font:.68rem var(--sans,system-ui,sans-serif)}
    .ash-court-route-field select:focus{border-color:var(--premium-brass,#c8a95a);outline:1px solid rgba(200,169,90,.2)}
    .ash-court-route-status{min-height:2.8em;margin:0;color:#aebfb7;font:.61rem/1.5 var(--sans,system-ui,sans-serif)}
    .ash-court-route-status[data-posture="managed-adverse"]{color:#ffb7c3}
    .ash-court-route-status[data-posture="offline-local"]{color:#e4c66c}
    .ash-court-route-status[data-posture="consumer-cloud"]{color:#9fe8d8}
    .guided-anisotropic-law{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
    .guided-anisotropic-law article{position:relative;padding:11px;border:1px solid rgba(118,234,212,.13);border-radius:10px;background:linear-gradient(115deg,rgba(118,234,212,.055),rgba(2,8,6,.5) 42%)}
    .guided-anisotropic-law b,.guided-anisotropic-law span{display:block}
    .guided-anisotropic-law b{color:var(--premium-mint,#76ead4);font:.64rem var(--sans,system-ui,sans-serif)}
    .guided-anisotropic-law span{margin-top:5px;color:#9fb1aa;font:.61rem/1.48 var(--sans,system-ui,sans-serif)}
    .guided-anisotropic-law article:last-child b{color:var(--premium-brass,#c8a95a)}
    @media(max-width:760px){.guided-anisotropic-law{grid-template-columns:1fr}}
  `;
  doc.head.append(style);
}

function ensureAnisotropicLaw(doc) {
  const court = byId(doc, 'ashTrustBoundaryCourt');
  if (!court || byId(doc, 'ashAnisotropicLaw')) return false;
  const law = doc.createElement('div');
  law.id = 'ashAnisotropicLaw';
  law.className = 'guided-anisotropic-law';
  law.setAttribute('aria-label', 'Portable anisotropic custody distinctions');
  law.innerHTML = `
    <article><b>Capsule ≠ provider packet</b><span>A Capsule is authenticated encrypted continuity. Never feed the encrypted case copy to an AI. A provider packet is a minimized plaintext excerpt that deliberately leaves the Keep.</span></article>
    <article><b>Flow-Core route weather ≠ custody</b><span>The heterostratigraphic lane may teach narrowing from dense local structure to a bounded projection. Flow-Core receives vector summaries and receipt references only; Ash Court holds the executable crossing.</span></article>`;
  const proof = court.querySelector('.guided-proof-boundary');
  if (proof) proof.before(law);
  else court.append(law);
  return true;
}

function postureValue(doc) {
  return String(byId(doc, ROUTE_POSTURE_ID)?.value || '');
}

function attestationsReady(doc) {
  return Boolean(byId(doc, EXCERPT_ATTESTATION_ID)?.checked && byId(doc, ORIGINAL_ATTESTATION_ID)?.checked);
}

function postureMessage(posture, ready) {
  if (posture === 'managed-adverse') {
    return 'HARD HOLD · Employer or public-sector managed AI may expose the packet through administrators, DLP, retention, e-discovery, monitoring, or institutional correlation. This provider action stays blocked.';
  }
  if (posture === 'offline-local') {
    return 'ROUTE MISMATCH · Draft with Hush calls a configured external provider. A fully offline model requires a separate network-isolated workflow. This provider action stays blocked.';
  }
  if (posture === 'consumer-cloud') {
    return ready
      ? 'External consumer-provider route declared. The separate exact-text approval and local screen still control the crossing.'
      : 'Consumer cloud route declared. Complete both bounded-packet declarations before provider use.';
  }
  return 'Held at Ash Court until the destination environment is classified.';
}

function renderPostureState(doc) {
  const posture = postureValue(doc);
  const ready = attestationsReady(doc);
  const allowed = posture === 'consumer-cloud' && ready;
  const ask = byId(doc, 'askHush');
  const status = byId(doc, ROUTE_STATUS_ID);
  const gateStatus = byId(doc, GATE_STATUS_ID);
  if (ask) {
    ask.dataset.ashDestinationPosture = posture || 'unclassified';
    ask.dataset.ashCourtReady = String(allowed);
    const describedBy = new Set(String(ask.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    describedBy.add(ROUTE_STATUS_ID);
    ask.setAttribute('aria-describedby', [...describedBy].join(' '));
  }
  if (status) {
    status.dataset.posture = posture || 'unclassified';
    status.textContent = postureMessage(posture, ready);
  }
  if (gateStatus && !allowed) gateStatus.textContent = postureMessage(posture, ready);
  return allowed;
}

function resetPosture(doc, message = '') {
  const select = byId(doc, ROUTE_POSTURE_ID);
  if (select) select.value = '';
  renderPostureState(doc);
  const status = byId(doc, ROUTE_STATUS_ID);
  if (status && message) status.textContent = message;
}

function ensureRouteField(doc) {
  const gate = byId(doc, 'ashCourtProviderGate');
  if (!gate || byId(doc, ROUTE_POSTURE_ID)) return false;
  const field = doc.createElement('div');
  field.className = 'ash-court-route-field';
  field.innerHTML = `
    <label for="${ROUTE_POSTURE_ID}">Where will this exact packet execute?</label>
    <select id="${ROUTE_POSTURE_ID}">
      <option value="">Classify the destination environment…</option>
      <option value="consumer-cloud">Consumer cloud AI or local-looking provider client</option>
      <option value="managed-adverse">Employer or public-sector managed AI</option>
      <option value="offline-local">Fully offline network-isolated model</option>
    </select>
    <p class="ash-court-route-status" id="${ROUTE_STATUS_ID}" role="status" aria-live="polite"></p>`;
  const legend = gate.querySelector('legend');
  if (legend) legend.after(field);
  else gate.prepend(field);
  byId(doc, ROUTE_POSTURE_ID)?.addEventListener('change', () => renderPostureState(doc));
  for (const id of [EXCERPT_ATTESTATION_ID, ORIGINAL_ATTESTATION_ID]) {
    byId(doc, id)?.addEventListener('change', () => renderPostureState(doc));
  }
  const draft = byId(doc, 'draftBody');
  if (draft && !draft.dataset.ashDestinationResetBound) {
    draft.dataset.ashDestinationResetBound = 'true';
    draft.addEventListener('input', () => resetPosture(doc, 'Draft changed. Reclassify the destination for the successor packet.'));
  }
  const file = byId(doc, 'localTextFile');
  if (file && !file.dataset.ashDestinationResetBound) {
    file.dataset.ashDestinationResetBound = 'true';
    file.addEventListener('change', () => resetPosture(doc, 'A local file was opened. Nothing was sent; destination classification returned to hold.'));
  }
  renderPostureState(doc);
  return true;
}

function enhance(doc) {
  ensureStyles(doc);
  ensureAnisotropicLaw(doc);
  ensureRouteField(doc);
  doc.documentElement.setAttribute('data-ash-destination-posture', ASH_DESTINATION_POSTURE_VERSION);
}

function providerAttemptHandler(doc, host) {
  return event => {
    const target = event.target instanceof host.Element ? event.target.closest('#askHush') : null;
    if (!target) return;
    if (!renderPostureState(doc)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      byId(doc, ROUTE_STATUS_ID)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    host.setTimeout(() => resetPosture(doc, 'Destination declaration consumed. Reclassify any successor packet.'), 0);
  };
}

export function installAshDestinationPosture(doc = globalThis.document, host = globalThis.window) {
  if (!doc?.body || !host || installedHosts.has(host)) return false;
  let scheduled = false;
  let compositionAttempts = 0;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    host.setTimeout(() => {
      scheduled = false;
      enhance(doc);
      if (!byId(doc, ROUTE_POSTURE_ID) && compositionAttempts < MAX_COMPOSITION_ATTEMPTS) {
        compositionAttempts += 1;
        schedule();
      } else {
        compositionAttempts = 0;
      }
    }, 40);
  };
  host.addEventListener('click', providerAttemptHandler(doc, host), true);
  for (const type of ['core-ready', 'case-opened', 'case-created', 'profile-demo-hydrated', 'draft-kept', 'review-kept', 'release-kept', 'capsule-opened']) {
    host.addEventListener(`td613:ash:${type}`, schedule);
  }
  if (typeof host.MutationObserver === 'function') {
    new host.MutationObserver(schedule).observe(doc.body, { childList: true, subtree: true });
  }
  installedHosts.add(host);
  schedule();
  host.__td613AshDestinationPosture = Object.freeze({ version: ASH_DESTINATION_POSTURE_VERSION, refresh: schedule });
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshDestinationPosture(document, window);
}
