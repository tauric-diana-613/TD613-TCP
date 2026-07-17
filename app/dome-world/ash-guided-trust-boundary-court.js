export const ASH_TRUST_BOUNDARY_COURT_VERSION = 'td613.ash.trust-boundary-court/v0.1';

const installedHosts = new WeakSet();
const EXCERPT_ATTESTATION_ID = 'ashCourtExcerptAttestation';
const ORIGINAL_ATTESTATION_ID = 'ashCourtOriginalAttestation';
const GATE_STATUS_ID = 'ashCourtGateStatus';

const byId = (doc, id) => doc.getElementById(id);

function ensureStyles(doc) {
  if (byId(doc, 'td613-ash-trust-boundary-court-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-trust-boundary-court-css';
  style.textContent = `
    .guided-boundary-court{position:relative;margin:16px 0 4px;padding:16px;border:1px solid rgba(255,139,157,.26);border-radius:15px;background:radial-gradient(circle at 50% -20%,rgba(255,139,157,.11),transparent 18rem),linear-gradient(145deg,rgba(14,24,20,.92),rgba(3,12,9,.9));overflow:hidden}
    .guided-boundary-court::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(118,234,212,.035),transparent);transform:translateX(-110%);animation:ash-court-crossing 8s ease-in-out infinite}
    .guided-boundary-court h4{margin:3px 0 7px;color:var(--premium-ivory,#fff8da);font:500 clamp(1.15rem,2.4vw,1.7rem)/1.05 var(--serif,Georgia,serif);letter-spacing:-.025em}
    .guided-boundary-court>p{position:relative;margin:0;color:#b8c8c1;font:.72rem/1.55 var(--sans,system-ui,sans-serif)}
    .guided-boundary-track{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:13px}
    .guided-boundary-track::before{content:"";position:absolute;left:8%;right:8%;top:26px;height:1px;background:linear-gradient(90deg,var(--premium-mint,#76ead4),var(--premium-brass,#c8a95a),var(--premium-rose,#ff8b9d),var(--premium-violet,#d9a1ff));opacity:.55}
    .guided-boundary-node{position:relative;z-index:1;min-height:112px;padding:11px;border:1px solid rgba(231,222,188,.11);border-radius:11px;background:rgba(2,8,6,.78)}
    .guided-boundary-node::before{content:attr(data-step);display:grid;place-items:center;width:30px;height:30px;margin-bottom:9px;border:1px solid currentColor;border-radius:50%;background:#020806;color:var(--premium-mint,#76ead4);font:700 .58rem var(--mono,monospace);box-shadow:0 0 0 5px rgba(2,8,6,.9)}
    .guided-boundary-node:nth-child(2)::before{color:var(--premium-brass,#c8a95a)}
    .guided-boundary-node:nth-child(3)::before{color:var(--premium-rose,#ff8b9d)}
    .guided-boundary-node:nth-child(4)::before{color:var(--premium-violet,#d9a1ff)}
    .guided-boundary-node b,.guided-boundary-node span{display:block}
    .guided-boundary-node b{color:var(--premium-ivory,#fff8da);font:.68rem var(--sans,system-ui,sans-serif)}
    .guided-boundary-node span{margin-top:5px;color:#99ada4;font:.61rem/1.42 var(--sans,system-ui,sans-serif)}
    .guided-terminal-posture{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px}
    .guided-terminal-posture article{padding:11px;border:1px solid rgba(231,222,188,.09);border-radius:10px;background:rgba(2,8,6,.5)}
    .guided-terminal-posture b,.guided-terminal-posture span{display:block}
    .guided-terminal-posture b{color:var(--premium-brass,#c8a95a);font:.65rem var(--sans,system-ui,sans-serif)}
    .guided-terminal-posture span{margin-top:5px;color:#9db0a8;font:.61rem/1.45 var(--sans,system-ui,sans-serif)}
    .guided-hard-stop{position:relative;margin-top:12px;padding:12px;border-left:3px solid var(--premium-rose,#ff8b9d);background:rgba(66,13,24,.2)}
    .guided-hard-stop strong{display:block;color:#ffd2d9;font:.72rem/1.4 var(--sans,system-ui,sans-serif)}
    .guided-hard-stop ul{margin:8px 0 0;padding-left:18px;color:#b8c8c1;font:.63rem/1.5 var(--sans,system-ui,sans-serif)}
    .guided-proof-boundary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
    .guided-proof-boundary div{padding:10px;border:1px solid rgba(217,161,255,.14);border-radius:10px;background:rgba(2,8,6,.45)}
    .guided-proof-boundary b,.guided-proof-boundary span{display:block}
    .guided-proof-boundary b{color:var(--premium-violet,#d9a1ff);font:.63rem var(--sans,system-ui,sans-serif)}
    .guided-proof-boundary span{margin-top:5px;color:#9fb1aa;font:.61rem/1.45 var(--sans,system-ui,sans-serif)}
    .ash-court-provider-gate{margin:10px 0 0;padding:12px;border:1px solid rgba(255,139,157,.2);border-radius:11px;background:rgba(34,9,16,.2)}
    .ash-court-provider-gate legend{padding:0 6px;color:#ffd2d9;font:700 .59rem var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em}
    .ash-court-provider-gate .check{margin-top:7px;background:rgba(2,8,6,.35)}
    .ash-court-provider-gate small{display:block;margin-top:9px;color:#9db0a8;font:.61rem/1.45 var(--sans,system-ui,sans-serif)}
    .ash-court-gate-status{min-height:1.4em;margin:8px 0 0;color:var(--premium-rose,#ff8b9d);font:700 .59rem/1.45 var(--mono,monospace)}
    #askHush[data-ash-court-ready="false"]{border-color:rgba(255,139,157,.42);box-shadow:inset 0 0 0 1px rgba(255,139,157,.08)}
    @keyframes ash-court-crossing{0%,18%{transform:translateX(-110%);opacity:0}38%,62%{opacity:1}82%,100%{transform:translateX(110%);opacity:0}}
    @media(max-width:760px){.guided-boundary-track{grid-template-columns:1fr 1fr}.guided-boundary-track::before{display:none}.guided-terminal-posture{grid-template-columns:1fr}.guided-proof-boundary{grid-template-columns:1fr}.guided-boundary-node{min-height:0}}
    @media(prefers-reduced-motion:reduce){.guided-boundary-court::before{animation:none!important;display:none}}
  `;
  doc.head.append(style);
}

function boundaryCourtMarkup() {
  return `
    <div class="guided-section-head"><div><p class="guided-kicker">Ash Court crossing</p><h4 id="ashTrustBoundaryTitle">A local app cannot make a cloud upload local.</h4></div><span>Trust boundary</span></div>
    <p>Local custody ends when the exact packet leaves the device. Ash can make that crossing smaller, deliberate, reviewable, and receipted. It cannot turn an external provider into the Keep.</p>
    <div class="guided-boundary-track" aria-label="Ash trust boundary sequence">
      <article class="guided-boundary-node" data-step="01"><b>Keep · private case</b><span>Full evidence, source identities, joining keys, handwriting, chronology, and working notes remain in browser custody.</span></article>
      <article class="guided-boundary-node" data-step="02"><b>Court · bounded packet</b><span>Only a purpose-shaped text excerpt, declared task, and reviewed surrogates become eligible to cross.</span></article>
      <article class="guided-boundary-node" data-step="03"><b>Provider · outside custody</b><span>The exact packet leaves the device. Provider/platform retention, governance, logging, and operator access govern this zone.</span></article>
      <article class="guided-boundary-node" data-step="04"><b>Return · unkept Reader</b><span>The response returns as untrusted Reader output. Re-test, review, and keep it locally before any later release.</span></article>
    </div>
    <div class="guided-terminal-posture" aria-label="Terminal environment distinctions">
      <article><b>Consumer cloud AI</b><span>Treat the route as external. A desktop app, browser, or local terminal shell can still submit the packet to provider infrastructure.</span></article>
      <article><b>Employer or public-sector managed AI</b><span>Treat organizational administration, compliance logging, DLP, retention, and lawful-access pathways as part of the recipient class.</span></article>
      <article><b>Fully offline local model</b><span>No cloud crossing occurs only when model, storage, telemetry, and retrieval remain network-isolated. Device compromise and local human access remain separate risks.</span></article>
    </div>
    <div class="guided-hard-stop">
      <strong>Never upload a full case because a receipt cannot un-send it.</strong>
      <ul>
        <li>Keep original scans or photographs of handwriting, complete chronologies, identity tables, stable cross-route IDs, and source-linking metadata local.</li>
        <li>Use transcription, structural surrogates, and the smallest excerpt that can answer the declared question.</li>
        <li>Rebuild measures named Readers and declared routes. Unknown, elite-access, or future Readers remain unmeasured.</li>
      </ul>
    </div>
    <div class="guided-proof-boundary">
      <div><b>What the receipt can prove</b><span>Which exact local draft, task, route class, digest, nonce, and operator gesture Ash approved at the crossing.</span></div>
      <div><b>What the receipt cannot prove</b><span>Provider confidentiality, deletion, anonymity, absence of DLP or administrator access, immunity from reconstruction, or resistance to every Reader.</span></div>
    </div>`;
}

function ensureBoundaryCourt(doc) {
  const guide = byId(doc, 'investigationAiShareGuide');
  if (!guide || byId(doc, 'ashTrustBoundaryCourt')) return false;
  const court = doc.createElement('section');
  court.id = 'ashTrustBoundaryCourt';
  court.className = 'guided-boundary-court';
  court.setAttribute('aria-labelledby', 'ashTrustBoundaryTitle');
  court.innerHTML = boundaryCourtMarkup();
  const actionRow = guide.querySelector('.guided-action-row');
  if (actionRow) actionRow.before(court);
  else guide.append(court);
  return true;
}

function gateReady(doc) {
  return Boolean(byId(doc, EXCERPT_ATTESTATION_ID)?.checked && byId(doc, ORIGINAL_ATTESTATION_ID)?.checked);
}

function renderGateState(doc, message = '') {
  const ask = byId(doc, 'askHush');
  const status = byId(doc, GATE_STATUS_ID);
  const ready = gateReady(doc);
  if (ask) {
    ask.dataset.ashCourtReady = String(ready);
    ask.setAttribute('aria-describedby', GATE_STATUS_ID);
  }
  if (status) status.textContent = message || (ready
    ? 'Crossing declaration complete. The separate exact-text provider approval still controls the send.'
    : 'Held at Ash Court until both bounded-packet declarations are checked.');
  return ready;
}

function resetProviderGate(doc, message = '') {
  const excerpt = byId(doc, EXCERPT_ATTESTATION_ID);
  const original = byId(doc, ORIGINAL_ATTESTATION_ID);
  if (excerpt) excerpt.checked = false;
  if (original) original.checked = false;
  renderGateState(doc, message);
}

function ensureProviderGate(doc) {
  const approval = byId(doc, 'providerApproval');
  const section = approval?.closest('.tool-section');
  if (!section || byId(doc, 'ashCourtProviderGate')) return false;
  const gate = doc.createElement('fieldset');
  gate.id = 'ashCourtProviderGate';
  gate.className = 'ash-court-provider-gate';
  gate.innerHTML = `
    <legend>Ash Court crossing declaration</legend>
    <label class="check"><input id="${EXCERPT_ATTESTATION_ID}" type="checkbox"> This exact body is a minimized purpose-shaped excerpt, not the full investigation.</label>
    <label class="check"><input id="${ORIGINAL_ATTESTATION_ID}" type="checkbox"> No original scan, photograph, handwriting image, attachment, complete chronology, identity table, or stable cross-route key is included.</label>
    <small>Opening a file locally and sending a provider packet are different acts. This declaration holds the provider crossing; it cannot certify provider deletion, confidentiality, or non-reconstruction.</small>
    <p class="ash-court-gate-status" id="${GATE_STATUS_ID}" role="status" aria-live="polite"></p>`;
  const fieldGrid = section.querySelector('.field-grid');
  if (fieldGrid) fieldGrid.after(gate);
  else section.prepend(gate);
  for (const id of [EXCERPT_ATTESTATION_ID, ORIGINAL_ATTESTATION_ID]) {
    byId(doc, id)?.addEventListener('change', () => renderGateState(doc));
  }
  const draft = byId(doc, 'draftBody');
  if (draft && !draft.dataset.ashCourtResetBound) {
    draft.dataset.ashCourtResetBound = 'true';
    draft.addEventListener('input', () => resetProviderGate(doc, 'Draft changed. Re-declare the exact bounded packet before provider use.'));
  }
  const file = byId(doc, 'localTextFile');
  if (file && !file.dataset.ashCourtResetBound) {
    file.dataset.ashCourtResetBound = 'true';
    file.addEventListener('change', () => resetProviderGate(doc, 'A local file was opened. Nothing was sent; review and minimize the exact text before crossing.'));
  }
  renderGateState(doc);
  return true;
}

function enhance(doc) {
  ensureStyles(doc);
  ensureBoundaryCourt(doc);
  ensureProviderGate(doc);
  doc.documentElement.setAttribute('data-ash-trust-boundary-court', ASH_TRUST_BOUNDARY_COURT_VERSION);
}

function providerAttemptHandler(doc, host) {
  return event => {
    const target = event.target instanceof host.Element ? event.target.closest('#askHush') : null;
    if (!target) return;
    if (!renderGateState(doc)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      byId(doc, GATE_STATUS_ID)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    host.setTimeout(() => resetProviderGate(doc, 'Crossing declaration consumed. Re-declare any successor packet.'), 0);
  };
}

export function installAshTrustBoundaryCourt(doc = globalThis.document, host = globalThis.window) {
  if (!doc?.body || !host || installedHosts.has(host)) return false;
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    host.setTimeout(() => {
      scheduled = false;
      enhance(doc);
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
  host.__td613AshTrustBoundaryCourt = Object.freeze({ version: ASH_TRUST_BOUNDARY_COURT_VERSION, refresh: schedule });
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshTrustBoundaryCourt(document, window);
}
