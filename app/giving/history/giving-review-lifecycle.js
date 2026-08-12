const BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';

function holdEnabled() {
  return globalThis.__td613GivingHoldReview === true;
}

function resetVisibleReview() {
  const recordList = document.getElementById('recordList');
  const reviewCount = document.getElementById('reviewCount');
  const clusterNotice = document.getElementById('clusterNotice');
  const ledgerCount = document.getElementById('ledgerCount');
  const confirmedTotal = document.getElementById('confirmedTotal');
  const confirmedRecordCount = document.getElementById('confirmedRecordCount');
  const committeeLedger = document.getElementById('committeeLedger');

  if (reviewCount) reviewCount.textContent = '0';
  if (clusterNotice) clusterNotice.textContent = 'No candidate clusters have been proposed.';
  if (recordList) {
    recordList.innerHTML = '<div class="empty-state"><strong>No records yet.</strong><span>The new search will populate this review unless Hold is active.</span></div>';
  }
  if (ledgerCount) ledgerCount.textContent = '0';
  if (confirmedTotal) confirmedTotal.textContent = '$0.00';
  if (confirmedRecordCount) confirmedRecordCount.textContent = '0 confirmed records';
  if (committeeLedger) {
    committeeLedger.innerHTML = '<div class="empty-state"><strong>No confirmed giving.</strong><span>Committee totals will rebuild from the new review population.</span></div>';
  }
}

function installHoldControl() {
  if (document.getElementById('holdReviewButton')) return;
  const toolbar = document.querySelector('#view-review .review-toolbar');
  if (!toolbar) return;

  const button = document.createElement('button');
  button.id = 'holdReviewButton';
  button.className = 'button review-hold-button';
  button.type = 'button';
  button.textContent = 'Hold';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Hold the current Identity Review across new searches');
  button.title = 'Preserve the current Identity Review when another search runs.';
  toolbar.append(button);

  button.addEventListener('click', () => {
    const next = !holdEnabled();
    globalThis.__td613GivingHoldReview = next;
    button.setAttribute('aria-pressed', String(next));
    button.dataset.held = next ? 'true' : 'false';
  });
}

function installSearchResetBoundary() {
  const form = document.getElementById('searchForm');
  if (!form || form.dataset.reviewResetBound === 'true') return;
  form.dataset.reviewResetBound = 'true';

  form.addEventListener('submit', () => {
    const held = holdEnabled();
    globalThis.__td613GivingResetReviewPending = !held;
    if (!held) resetVisibleReview();
  }, { capture: true });
}

function installPendingResetGuard() {
  const recordList = document.getElementById('recordList');
  const committeeLedger = document.getElementById('committeeLedger');
  if (!recordList || !committeeLedger || globalThis.__td613GivingResetGuardInstalled) return;
  globalThis.__td613GivingResetGuardInstalled = true;

  let guarding = false;
  const enforce = () => {
    if (guarding || globalThis.__td613GivingResetReviewPending !== true || holdEnabled()) return;
    guarding = true;
    resetVisibleReview();
    guarding = false;
  };

  const observer = new MutationObserver(enforce);
  observer.observe(recordList, { childList: true });
  observer.observe(committeeLedger, { childList: true });
}

function installStyles() {
  if (document.getElementById('givingReviewLifecycleStyles')) return;
  const style = document.createElement('style');
  style.id = 'givingReviewLifecycleStyles';
  style.textContent = `
    .review-hold-button {
      align-self: end;
      flex: 0 0 auto;
      min-height: 42px;
      padding-inline: 14px;
      white-space: nowrap;
    }
    .review-hold-button[data-held="true"] {
      border-color: rgba(228, 198, 108, .5);
      color: #f0dda0;
      background: rgba(228, 198, 108, .09);
      box-shadow: inset 2px 0 var(--gold);
    }
    @media (max-width: 760px) {
      .review-hold-button {
        width: 100%;
        min-height: 38px;
      }
    }
  `;
  document.head.append(style);
}

function install() {
  installStyles();
  installHoldControl();
  installSearchResetBoundary();
  installPendingResetGuard();
}

if (BROWSER) {
  globalThis.__td613GivingHoldReview = false;
  globalThis.__td613GivingResetReviewPending = false;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else queueMicrotask(install);
}

export { holdEnabled };
