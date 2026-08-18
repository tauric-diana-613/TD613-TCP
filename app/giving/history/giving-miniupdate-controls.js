const $ = (selector) => document.querySelector(selector);

function centerPrimarySearchActions() {
  const row = $('#runSearchButton')?.closest('.button-row');
  if (!row) return;
  row.classList.add('giving-primary-search-actions');
  row.setAttribute('aria-label', 'Primary search controls');
}

function arrangeContactQueueControls() {
  const panel = $('#contactQueuePanel');
  const topRow = panel?.querySelector('.contact-queue-actions');
  const list = $('#contactQueueList');
  const add = $('#addContactQueueButton');
  const run = $('#runContactQueueButton');
  const stop = $('#stopContactQueueButton');
  const clear = $('#clearContactQueueButton');
  if (!panel || !topRow || !list || !add || !run || !stop || !clear) return;

  topRow.classList.add('contact-queue-top-actions');
  topRow.append(add, clear);

  let runRow = $('#contactQueueRunActions');
  if (!runRow) {
    runRow = document.createElement('div');
    runRow.id = 'contactQueueRunActions';
    runRow.className = 'button-row contact-queue-run-actions';
    list.insertAdjacentElement('afterend', runRow);
  }
  runRow.append(run, stop);
  panel.dataset.queueControlLayout = 'post-scroll-run';
}

function parseRenderedAddress(value) {
  const parts = String(value || '').split(/\s+·\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  if (parts.length >= 4) {
    const zip = parts.at(-1);
    const state = parts.at(-2);
    const city = parts.at(-3);
    const street = parts.slice(0, -3).join(' ').trim();
    if (!street || !city) return null;
    return { street, locality: [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '') };
  }

  const street = parts[0];
  const locality = parts.slice(1).join(', ');
  return street && locality ? { street, locality } : null;
}

function normalizeContributionAddressNodes() {
  const list = $('#recordList');
  if (!list) return;
  for (const node of list.querySelectorAll('.record-person > small')) {
    if (node.classList.contains('record-address-normalized')) continue;
    const parsed = parseRenderedAddress(node.textContent);
    if (!parsed) continue;
    const street = document.createElement('span');
    street.className = 'record-address-line1';
    street.textContent = parsed.street;
    const locality = document.createElement('span');
    locality.className = 'record-address-locality';
    locality.textContent = parsed.locality;
    node.replaceChildren(street, locality);
    node.classList.add('record-address-normalized');
  }
}

function installContributionAddressObserver() {
  const list = $('#recordList');
  if (!list || list.dataset.addressNormalizerBound === 'true') return;
  list.dataset.addressNormalizerBound = 'true';
  let queued = false;
  const apply = () => {
    queued = false;
    normalizeContributionAddressNodes();
  };
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(apply);
  }).observe(list, { childList: true, subtree: true });
  normalizeContributionAddressNodes();
}

centerPrimarySearchActions();
arrangeContactQueueControls();
installContributionAddressObserver();

export const _givingMiniupdateControls = Object.freeze({
  centerPrimarySearchActions,
  arrangeContactQueueControls,
  parseRenderedAddress,
  normalizeContributionAddressNodes,
  installContributionAddressObserver
});
