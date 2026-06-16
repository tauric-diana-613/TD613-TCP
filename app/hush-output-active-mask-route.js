const VERSION = 'hush-output-active-mask-route/v1-output-chamber-receipt';
const $ = (id, doc = document) => doc.getElementById(id);

function text(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function displayMaskLabel(doc = document) {
  const select = $('maskFieldSelect', doc);
  const option = select?.selectedOptions?.[0];
  const raw = text(option?.textContent || select?.value || 'Selected mask');
  return raw.replace(/\s+-\s+/g, ' — ');
}

function installStyle(doc = document) {
  if ($('hushOutputActiveMaskRouteStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushOutputActiveMaskRouteStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute {
      display: grid;
      grid-template-columns: minmax(0, auto) minmax(0, 1fr);
      align-items: center;
      gap: .7rem;
      margin: -.08rem 0 .74rem;
      padding: .58rem .72rem;
      border: 1px solid rgba(139,233,253,.24);
      border-left: 3px solid rgba(115,255,186,.76);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(3,9,20,.82), rgba(7,18,24,.64));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 0 22px rgba(115,255,186,.06);
      color: rgba(242,238,252,.88);
      min-width: 0;
      overflow: hidden;
    }
    body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute span {
      color: rgba(202,255,223,.66);
      font-size: .58rem;
      letter-spacing: .08em;
      text-transform: none;
      white-space: nowrap;
    }
    body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute strong {
      justify-self: end;
      min-width: 0;
      max-width: 100%;
      color: #f2eefc;
      font-size: .62rem;
      font-weight: 900;
      line-height: 1.18;
      text-align: right;
      overflow-wrap: anywhere;
    }
    @media (max-width: 760px) {
      body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute {
        grid-template-columns: minmax(0, 1fr);
        gap: .24rem;
        margin: -.02rem 0 .62rem;
        padding: .62rem .66rem;
        border-radius: 15px;
      }
      body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute span {
        font-size: .56rem;
        letter-spacing: .07em;
      }
      body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute strong {
        justify-self: start;
        text-align: left;
        font-size: .72rem;
      }
    }
  `;
  doc.head.appendChild(style);
}

function ensureRouteReceipt(doc = document) {
  installStyle(doc);
  let receipt = $('hushOutputActiveMaskRoute', doc);
  if (receipt) return receipt;
  receipt = doc.createElement('div');
  receipt.id = 'hushOutputActiveMaskRoute';
  receipt.setAttribute('aria-label', 'Active mask route');
  receipt.innerHTML = '<span>Active mask</span><strong>Selected mask</strong>';
  const statusBand = $('hushOutputStatusBand', doc);
  const outputField = $('protectedOutputInput', doc)?.closest?.('.hush-field-shell');
  if (statusBand) statusBand.insertAdjacentElement('afterend', receipt);
  else if (outputField) outputField.insertAdjacentElement('beforebegin', receipt);
  return receipt;
}

function updateRouteReceipt(doc = document) {
  const receipt = ensureRouteReceipt(doc);
  const label = displayMaskLabel(doc);
  const value = receipt?.querySelector?.('strong');
  if (value) value.textContent = label || 'Selected mask';
}

function hideStandaloneMaskSideReadout(doc = document) {
  const panel = $('hushBuiltInMaskPanel', doc) || doc.querySelector('.hush-mask-panel');
  if (!panel) return;
  Array.from(panel.children || []).forEach((child) => {
    if (child.id === 'hushOutputActiveMaskRoute') return;
    if (child.dataset.outputRouteReceiptHidden === 'true') return;
    const copy = text(child.textContent || '');
    if (/^Active mask\b/i.test(copy) && copy.length < 180) {
      child.dataset.outputRouteReceiptHidden = 'true';
      child.hidden = true;
      child.style.display = 'none';
    }
  });
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushOutputActiveMaskRoute === VERSION) return;
  doc.body.dataset.hushOutputActiveMaskRoute = VERSION;
  updateRouteReceipt(doc);
  hideStandaloneMaskSideReadout(doc);
  const select = $('maskFieldSelect', doc);
  if (select) select.addEventListener('change', () => {
    window.setTimeout(() => updateRouteReceipt(doc), 0);
    window.setTimeout(() => hideStandaloneMaskSideReadout(doc), 80);
  });
  window.addEventListener('td613:hush:provider-output', () => updateRouteReceipt(doc));
  window.addEventListener('td613:hush:lab-synced', () => updateRouteReceipt(doc));
  [180, 760, 1600].forEach((delay) => window.setTimeout(() => { updateRouteReceipt(doc); hideStandaloneMaskSideReadout(doc); }, delay));
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [320, 900, 1800, 3200].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_OUTPUT_ACTIVE_MASK_ROUTE__ = { version: VERSION, updateRouteReceipt };
