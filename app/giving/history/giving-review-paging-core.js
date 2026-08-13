const PAGE_SIZE = 300;
const nativeSlice = Array.prototype.slice;
let currentPage = 1;
let currentTotal = 0;
let dateDirection = null;
let rerenderQueued = false;

function looksLikeGivingRecords(value) {
  if (!Array.isArray(value) || !value.length) return false;
  const sample = value.find((item) => item && typeof item === 'object');
  if (!sample) return false;
  return Boolean(
    sample.source_instance_id ||
    sample.source_instance ||
    sample.source_family ||
    sample.contribution_date ||
    Number.isSafeInteger(sample.amount_cents)
  );
}

function dateValue(record) {
  const parsed = Date.parse(record?.contribution_date || '');
  return Number.isFinite(parsed) ? parsed : null;
}

function sortedForDate(records) {
  if (!dateDirection) return records;
  const copy = nativeSlice.call(records);
  copy.sort((left, right) => {
    const a = dateValue(left);
    const b = dateValue(right);
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return dateDirection === 'desc' ? b - a : a - b;
  });
  return copy;
}

// The legacy Giving renderer owns ledger state and identity actions. Intercept
// only its exact review-page slice so that renderer continues to create every
// card/action itself while pages after 300 become reachable.
Array.prototype.slice = function patchedGivingReviewSlice(start, end) {
  if (start === 0 && end === PAGE_SIZE && looksLikeGivingRecords(this)) {
    currentTotal = this.length;
    const totalPages = Math.max(1, Math.ceil(currentTotal / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const offset = (currentPage - 1) * PAGE_SIZE;
    const source = sortedForDate(this);
    return nativeSlice.call(source, offset, offset + PAGE_SIZE);
  }
  return nativeSlice.call(this, start, end);
};

function pageNumbers(totalPages, page) {
  const set = new Set([1, totalPages]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const value = page + offset;
    if (value >= 1 && value <= totalPages) set.add(value);
  }
  return [...set].sort((a, b) => a - b);
}

function paginationMarkup() {
  const totalPages = Math.max(1, Math.ceil(currentTotal / PAGE_SIZE));
  if (totalPages <= 1) return '';
  let previous = 0;
  const numbers = pageNumbers(totalPages, currentPage).map((page) => {
    const gap = previous && page - previous > 1 ? '<span class="review-page-gap">…</span>' : '';
    previous = page;
    return `${gap}<button class="review-page-number" type="button" data-review-page="${page}" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</button>`;
  }).join('');
  return `<nav class="review-pagination" aria-label="Contribution pages">
    <button class="review-page-arrow" type="button" data-review-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous contribution page">‹</button>
    ${numbers}
    <button class="review-page-arrow" type="button" data-review-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next contribution page">›</button>
  </nav>`;
}

function renderDateButton() {
  const button = document.querySelector('[data-review-sort="date"]');
  if (!button) return;
  button.dataset.active = dateDirection ? 'true' : 'false';
  button.setAttribute('aria-pressed', String(Boolean(dateDirection)));
  button.textContent = `Date${dateDirection ? (dateDirection === 'asc' ? ' ↑' : ' ↓') : ''}`;
}

function decoratePaging() {
  const list = document.getElementById('recordList');
  if (!list) return;
  list.querySelector(':scope > .coverage-warning')?.remove();
  list.querySelector(':scope > .review-pagination')?.remove();
  const markup = paginationMarkup();
  if (markup) list.insertAdjacentHTML('beforeend', markup);
  renderDateButton();
}

function queueDecorate() {
  if (rerenderQueued) return;
  rerenderQueued = true;
  queueMicrotask(() => {
    rerenderQueued = false;
    decoratePaging();
  });
}

function requestReviewRender() {
  const field = document.getElementById('reviewSearch');
  if (field) field.dispatchEvent(new Event('input', { bubbles: true }));
}

function resetPage() {
  currentPage = 1;
}

document.addEventListener('click', (event) => {
  const pageButton = event.target.closest?.('[data-review-page]');
  if (pageButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const totalPages = Math.max(1, Math.ceil(currentTotal / PAGE_SIZE));
    const page = Number(pageButton.dataset.reviewPage);
    if (Number.isInteger(page) && page >= 1 && page <= totalPages && page !== currentPage) {
      currentPage = page;
      requestReviewRender();
      document.getElementById('view-review')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    return;
  }

  if (event.target.closest?.('[data-review-sort="date"]')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    dateDirection = dateDirection === 'asc' ? 'desc' : 'asc';
    currentPage = 1;
    requestReviewRender();
    return;
  }

  if (event.target.closest?.('[data-review-sort]')) {
    dateDirection = null;
    currentPage = 1;
    queueMicrotask(renderDateButton);
  }
}, true);

for (const [id, eventName] of [
  ['reviewFilter', 'change'],
  ['reviewTargetFilter', 'change'],
  ['reviewSearch', 'input'],
  ['searchForm', 'submit']
]) {
  document.getElementById(id)?.addEventListener(eventName, resetPage, true);
}

const list = document.getElementById('recordList');
if (list) new MutationObserver(queueDecorate).observe(list, { childList: true });

queueDecorate();

export const _givingReviewPaging = Object.freeze({
  PAGE_SIZE,
  page: () => currentPage,
  total: () => currentTotal,
  dateDirection: () => dateDirection
});
