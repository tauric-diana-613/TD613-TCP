const holdButton = document.querySelector('#holdReviewButton');
const toastStack = document.querySelector('#toastStack');

function normalizedHoldTitle() {
  if (!holdButton) return '';
  return holdButton.dataset.held === 'true'
    ? 'Held: later searches append to Contributions. Activate to release.'
    : 'Keep Contributions in place and append results from later searches.';
}

function normalizeHoldCopy() {
  if (!holdButton) return;
  const title = normalizedHoldTitle();
  if (holdButton.title !== title) holdButton.title = title;
}

function normalizeToastCopy(node) {
  if (!(node instanceof HTMLElement)) return;
  if (node.textContent?.includes('Identity Review')) {
    node.textContent = node.textContent.replaceAll('Identity Review', 'Contributions');
  }
}

if (holdButton) {
  normalizeHoldCopy();
  new MutationObserver(normalizeHoldCopy).observe(holdButton, {
    attributes: true,
    attributeFilter: ['data-held', 'title']
  });
}

if (toastStack) {
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) normalizeToastCopy(node);
    }
  }).observe(toastStack, { childList: true });
}
