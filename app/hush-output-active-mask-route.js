const VERSION = 'hush-output-active-mask-route/v5-title-bump-selected-box-hide';
const $ = (id, doc = document) => doc.getElementById(id);
let hideObserver = null;

function text(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function normalizeLabel(value) {
  return text(value).replace(/\s+[—-]\s+/g, ' ').toLowerCase();
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
    body[data-page-kind="adversarial-bench"] [data-output-chamber-kicker-bumped="true"] {
      display: block !important;
      transform: translateX(.64rem) !important;
      max-width: calc(100% - 1.28rem) !important;
    }
    body[data-page-kind="adversarial-bench"] [data-output-chamber-heading-bumped="true"] {
      display: block !important;
      transform: translateX(.46rem) !important;
      max-width: calc(100% - .92rem) !important;
    }
    body[data-page-kind="adversarial-bench"] .hush-output-chamber .hush-output-status-band {
      width: 90%;
      max-width: 90%;
      margin-left: auto;
      margin-right: auto;
    }
    body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute {
      display: grid;
      grid-template-columns: minmax(0, auto) minmax(0, 1fr);
      align-items: center;
      gap: .7rem;
      width: 90%;
      max-width: 90%;
      margin: -.08rem auto .74rem;
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
    body[data-page-kind="adversarial-bench"] #hushJumpReceiptsBtn {
      min-width: 0 !important;
      width: auto !important;
      justify-self: stretch;
      border: 1px solid rgba(139,233,253,.24) !important;
      border-radius: 999px !important;
      background: rgba(5,9,20,.66) !important;
      color: rgba(242,238,252,.88) !important;
      padding: .5rem .72rem !important;
      font-size: .62rem !important;
      font-weight: 900 !important;
      letter-spacing: .14em !important;
      text-transform: uppercase !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 0 18px rgba(139,233,253,.06) !important;
    }
    body[data-page-kind="adversarial-bench"] #hushJumpReceiptsBtn:disabled,
    body[data-page-kind="adversarial-bench"] #hushJumpReceiptsBtn[aria-disabled="true"] {
      opacity: .36 !important;
      filter: grayscale(.35) !important;
      cursor: not-allowed !important;
    }
    body[data-page-kind="adversarial-bench"] #hushJumpReceiptsBtn:not(:disabled) {
      border-color: rgba(115,255,186,.36) !important;
      color: #caffdf !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 0 22px rgba(115,255,186,.10) !important;
    }
    body[data-page-kind="adversarial-bench"] [data-output-route-receipt-hidden="true"] {
      display: none !important;
    }
    @media (max-width: 760px) {
      body[data-page-kind="adversarial-bench"] [data-output-chamber-kicker-bumped="true"] {
        transform: translateX(.86rem) !important;
        max-width: calc(100% - 1.72rem) !important;
      }
      body[data-page-kind="adversarial-bench"] [data-output-chamber-heading-bumped="true"] {
        transform: translateX(.62rem) !important;
        max-width: calc(100% - 1.24rem) !important;
      }
      body[data-page-kind="adversarial-bench"] .hush-output-chamber .hush-output-status-band {
        width: 90% !important;
        max-width: 90% !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
      body[data-page-kind="adversarial-bench"] #hushOutputActiveMaskRoute {
        grid-template-columns: minmax(0, 1fr);
        gap: .24rem;
        width: 90%;
        max-width: 90%;
        margin: -.02rem auto .62rem;
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
      body[data-page-kind="adversarial-bench"] #hushJumpReceiptsBtn {
        font-size: .58rem !important;
        padding: .46rem .62rem !important;
        min-height: 2.08rem !important;
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

function outputReadyForReceipts(doc = document) {
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (!output) return false;
  const status = text($('hushOutputStatusText', doc)?.textContent || '').toLowerCase();
  const providerStatus = text(($('hushStrictProviderStatus', doc) || $('hushGeneratorStatus', doc))?.textContent || '').toLowerCase();
  const last = window.__TD613_HUSH_PR123_LAST;
  const held = window.__TD613_HUSH_NO_FALLBACK_RECEIPT;
  if (/held|error|failed|request_failed|no local fallback/i.test(providerStatus)) return false;
  if (held && !output) return false;
  if (/provider|received|ready|output/i.test(status) || /provider output received/i.test(providerStatus)) return true;
  return Boolean(last && output && !held);
}

function updateReceiptsButton(doc = document) {
  const button = $('hushJumpReceiptsBtn', doc);
  if (!button) return;
  const ready = outputReadyForReceipts(doc);
  button.disabled = !ready;
  button.setAttribute('aria-disabled', ready ? 'false' : 'true');
  button.title = ready ? 'Jump to Private Text Custody receipts' : 'Receipts unlock after a successful Transform output';
}

function jumpToReceipts(doc = document) {
  if (!outputReadyForReceipts(doc)) return false;
  const panel = $('hushHousekeepingPanel', doc) || doc.querySelector('[aria-label="Private text custody controls"]');
  if (!panel) return false;
  if ('open' in panel) panel.open = true;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function ensureReceiptsButton(doc = document) {
  installStyle(doc);
  let button = $('hushJumpReceiptsBtn', doc);
  if (button) return button;
  button = doc.createElement('button');
  button.id = 'hushJumpReceiptsBtn';
  button.type = 'button';
  button.textContent = 'Receipts';
  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');
  const reset = $('resetBenchBtn', doc);
  const review = $('openHushReviewBtn', doc);
  const row = reset?.closest?.('.hush-action-row') || review?.closest?.('.hush-action-row') || $('generateMaskedOutputBtn', doc)?.closest?.('.hush-action-row');
  if (reset?.parentElement === row) reset.insertAdjacentElement('afterend', button);
  else if (review?.parentElement === row) review.insertAdjacentElement('afterend', button);
  else if (row) row.appendChild(button);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (!jumpToReceipts(doc)) updateReceiptsButton(doc);
  });
  updateReceiptsButton(doc);
  return button;
}

function outputCard(doc = document) {
  const output = $('protectedOutputInput', doc);
  return output?.closest?.('.hush-output-card') || output?.closest?.('section') || output?.closest?.('article') || null;
}

function bumpOutputChamberTitles(doc = document) {
  const card = outputCard(doc);
  if (!card) return;
  const textNodes = Array.from(card.querySelectorAll('span,div,p,strong,small,h1,h2,h3')).filter((el) => el && !el.children.length);
  const kicker = textNodes.find((el) => text(el.textContent || '').toUpperCase() === 'OUTPUT CHAMBER');
  if (kicker) {
    kicker.dataset.outputChamberKickerBumped = 'true';
    kicker.style.setProperty('display', 'block', 'important');
    kicker.style.setProperty('transform', 'translateX(.86rem)', 'important');
    kicker.style.setProperty('max-width', 'calc(100% - 1.72rem)', 'important');
  }
  const heading = textNodes.find((el) => text(el.textContent || '').toUpperCase() === 'TRANSFORMED MESSAGE');
  if (heading) {
    heading.dataset.outputChamberHeadingBumped = 'true';
    heading.style.setProperty('display', 'block', 'important');
    heading.style.setProperty('transform', 'translateX(.62rem)', 'important');
    heading.style.setProperty('max-width', 'calc(100% - 1.24rem)', 'important');
  }
}

function hideOriginalActiveMaskReadout(doc = document) {
  const chamber = doc.querySelector('.hush-mask-chamber');
  const panel = $('hushBuiltInMaskPanel', doc) || doc.querySelector('.hush-mask-panel');
  const root = panel || chamber;
  if (!root) return;
  const selected = normalizeLabel(displayMaskLabel(doc));
  const candidates = Array.from(root.querySelectorAll('*')).filter((el) => {
    if (!el || el.id === 'hushOutputActiveMaskRoute' || el.closest('#hushOutputActiveMaskRoute')) return false;
    if (['SELECT', 'OPTION', 'BUTTON', 'TEXTAREA', 'INPUT', 'LABEL'].includes(el.tagName)) return false;
    if (el.querySelector('select,option,button,textarea,input,label')) return false;
    const copy = text(el.textContent || '');
    if (!copy || copy.length > 260) return false;
    const normalized = normalizeLabel(copy);
    const activeMaskBox = /^active mask\b/i.test(copy) && normalized.includes('active mask');
    const selectedOnlyBox = selected && (normalized === selected || (copy.length < 120 && normalized.includes(selected)));
    return activeMaskBox || selectedOnlyBox;
  });
  candidates
    .sort((a, b) => text(a.textContent || '').length - text(b.textContent || '').length)
    .slice(0, 4)
    .forEach((el) => {
      el.dataset.outputRouteReceiptHidden = 'true';
      el.hidden = true;
      el.style.setProperty('display', 'none', 'important');
    });
}

function watchMaskPanel(doc = document) {
  const root = $('hushBuiltInMaskPanel', doc) || doc.querySelector('.hush-mask-chamber');
  if (!root || hideObserver) return;
  hideObserver = new MutationObserver(() => {
    window.setTimeout(() => hideOriginalActiveMaskReadout(doc), 0);
  });
  hideObserver.observe(root, { childList: true, subtree: true });
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushOutputActiveMaskRoute === VERSION) return;
  doc.body.dataset.hushOutputActiveMaskRoute = VERSION;
  updateRouteReceipt(doc);
  hideOriginalActiveMaskReadout(doc);
  bumpOutputChamberTitles(doc);
  ensureReceiptsButton(doc);
  watchMaskPanel(doc);
  const select = $('maskFieldSelect', doc);
  if (select) select.addEventListener('change', () => {
    window.setTimeout(() => updateRouteReceipt(doc), 0);
    window.setTimeout(() => hideOriginalActiveMaskReadout(doc), 80);
    window.setTimeout(() => hideOriginalActiveMaskReadout(doc), 260);
  });
  const output = $('protectedOutputInput', doc);
  if (output) output.addEventListener('input', () => window.setTimeout(() => updateReceiptsButton(doc), 0));
  ['generateMaskedOutputBtn', 'resetBenchBtn'].forEach((id) => $(id, doc)?.addEventListener('click', () => window.setTimeout(() => updateReceiptsButton(doc), 260), true));
  window.addEventListener('td613:hush:provider-output', () => { updateRouteReceipt(doc); updateReceiptsButton(doc); });
  window.addEventListener('td613:hush:lab-synced', () => { updateRouteReceipt(doc); updateReceiptsButton(doc); });
  window.addEventListener('td613:hush:no-fallback-receipt', () => updateReceiptsButton(doc));
  [180, 760, 1600, 2600].forEach((delay) => window.setTimeout(() => {
    updateRouteReceipt(doc);
    hideOriginalActiveMaskReadout(doc);
    bumpOutputChamberTitles(doc);
    ensureReceiptsButton(doc);
    updateReceiptsButton(doc);
  }, delay));
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [320, 900, 1800, 3200].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_OUTPUT_ACTIVE_MASK_ROUTE__ = { version: VERSION, updateRouteReceipt, hideOriginalActiveMaskReadout, updateReceiptsButton, jumpToReceipts, bumpOutputChamberTitles };
