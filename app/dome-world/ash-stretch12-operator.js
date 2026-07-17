export const ASH_STRETCH12_OPERATOR_VERSION = 'td613.ash.stretch12-operator/v0.1';
const installed = new WeakSet();

function ensureStyles(doc) {
  if (doc.getElementById('td613-ash-stretch12-operator-css')) return;
  const link = doc.createElement('link');
  link.id = 'td613-ash-stretch12-operator-css';
  link.rel = 'stylesheet';
  link.href = '/dome-world/ash-stretch12-operator.css?v=20260717-stretch12-v1';
  doc.head.append(link);
}

function compose(doc) {
  const guide = doc.getElementById('investigationAiShareGuide');
  if (!guide || doc.getElementById('ashStretch12PortableAnisotropy')) return false;
  const section = doc.createElement('section');
  section.id = 'ashStretch12PortableAnisotropy';
  section.className = 'ash-stretch12-card';
  section.innerHTML = `
    <div class="ash-stretch12-head">
      <div><p>Stretch 12 · portable anisotropy</p><h3>Classify the endpoint. Test semantic reconstruction. Keep continuity richer than disclosure.</h3></div>
      <span>LOCAL PREFLIGHT</span>
    </div>
    <div class="ash-stretch12-laws">
      <b>Capsule ≠ provider packet</b>
      <b>Flow-Core route weather ≠ custody</b>
      <b>Local-looking terminal ≠ local model</b>
      <b>Low tested recovery ≠ universal secrecy</b>
    </div>
    <p>The laboratory preserves the quantum-derived method—controlled source, declared projections, Reader ensemble, coverage, signed directional residue, marginal checks, and Phason susceptibility—without claiming quantum operation or hidden-provider access.</p>
    <ol>
      <li><b>Device Court</b><span>Managed, shared, public-sector, and unresolved endpoints hold.</span></li>
      <li><b>Route Court</b><span>Cloud, managed, remote, and offline execution remain separate classes.</span></li>
      <li><b>Packet Court</b><span>Inspect identities, chronology, relationships, source-style linkage, rare conjunctions, hypotheses, and next actions componentwise.</span></li>
      <li><b>Reader Court</b><span>Unknown Readers remain unmeasured rather than converted into a pass.</span></li>
      <li><b>Seal Court</b><span>Return to Keep, revise and retest, or authorize one exact bounded route.</span></li>
    </ol>
    <div class="ash-stretch12-actions"><a class="premium-action primary" href="/dome-world/ash-portable-anisotropy.html">Open Portable Anisotropy Lab</a></div>
    <small>Origin witness ≠ uncompromised operating system. Anisotropy ≠ impermeability. Receipt ≠ provider deletion.</small>`;
  guide.insertAdjacentElement('afterend', section);
  doc.documentElement.setAttribute('data-ash-stretch12-operator', ASH_STRETCH12_OPERATOR_VERSION);
  return true;
}

export function installAshStretch12Operator(doc = globalThis.document, host = globalThis.window) {
  if (!doc?.body || !host || installed.has(host)) return false;
  installed.add(host);
  ensureStyles(doc);
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    host.setTimeout(() => { scheduled = false; compose(doc); }, 40);
  };
  for (const type of ['core-ready', 'case-opened', 'profile-demo-hydrated', 'core-mutated']) host.addEventListener(`td613:ash:${type}`, schedule);
  if (typeof host.MutationObserver === 'function') new host.MutationObserver(schedule).observe(doc.body, { childList: true, subtree: true });
  schedule();
  host.__td613AshStretch12Operator = Object.freeze({ version: ASH_STRETCH12_OPERATOR_VERSION, refresh: schedule });
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') installAshStretch12Operator(document, window);
