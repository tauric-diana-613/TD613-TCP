const DATE_RE = /\b\d{4}-\d{2}-\d{2}\b/;
let contributionDirection = null;
let ledgerDirection = 'desc';
let applying = false;
let queued = false;

function extractDate(text) {
  return String(text || '').match(DATE_RE)?.[0] || '';
}

function compareDateValues(left, right, direction) {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  const result = left.localeCompare(right);
  return direction === 'desc' ? -result : result;
}

function sameNodeOrder(current, desired) {
  return current.length === desired.length && current.every((node, index) => node === desired[index]);
}

function decorateContributionCards() {
  const list = document.getElementById('recordList');
  if (!list) return;
  for (const card of list.querySelectorAll(':scope > .record-card')) {
    const main = card.querySelector('.record-main');
    if (!main || main.querySelector('.record-date')) continue;
    const committeeMeta = main.querySelector('.record-committee small');
    const date = extractDate(committeeMeta?.textContent);
    if (committeeMeta && date) {
      committeeMeta.textContent = committeeMeta.textContent
        .split(' · ')
        .filter((part) => part.trim() !== date)
        .join(' · ');
    }
    const cell = document.createElement('div');
    cell.className = 'record-date';
    const strong = document.createElement('strong');
    strong.textContent = date || 'date missing';
    const small = document.createElement('small');
    small.textContent = 'contribution date';
    cell.append(strong, small);
    main.insertBefore(cell, main.querySelector('.record-amount'));
  }
}

function renderContributionButton() {
  const button = document.querySelector('[data-review-sort="date"]');
  if (!button) return;
  button.dataset.active = contributionDirection ? 'true' : 'false';
  button.setAttribute('aria-pressed', String(Boolean(contributionDirection)));
  button.textContent = `Date${contributionDirection ? (contributionDirection === 'asc' ? ' ↑' : ' ↓') : ''}`;
}

function sortContributionCards() {
  const list = document.getElementById('recordList');
  if (!list) return;
  decorateContributionCards();
  renderContributionButton();
  if (!contributionDirection) return;
  const cards = [...list.querySelectorAll(':scope > .record-card')];
  const trailer = list.querySelector(':scope > .coverage-warning');
  const sorted = [...cards].sort((left, right) => compareDateValues(
    extractDate(left.querySelector('.record-date strong')?.textContent),
    extractDate(right.querySelector('.record-date strong')?.textContent),
    contributionDirection
  ));
  // recordList is MutationObserver-driven. Moving nodes that are already in the
  // desired order creates a new childList mutation and recursively requeues this
  // sorter, so DOM movement is legal only when the order actually changes.
  if (!sameNodeOrder(cards, sorted)) {
    for (const card of sorted) list.insertBefore(card, trailer || null);
  }
}

function committeeCardDate(card) {
  const dates = [...String(card.querySelector('.committee-records')?.textContent || '').matchAll(DATE_RE)].map((match) => match[0]);
  if (!dates.length) return '';
  dates.sort();
  return ledgerDirection === 'desc' ? dates.at(-1) : dates[0];
}

function sortCommitteeCards() {
  const list = document.getElementById('committeeLedger');
  const button = document.getElementById('ledgerDateSortButton');
  if (!list || !button) return;
  const cards = [...list.querySelectorAll(':scope > .committee-card')];
  const sorted = [...cards].sort((left, right) => compareDateValues(committeeCardDate(left), committeeCardDate(right), ledgerDirection));
  // committeeLedger is also observed. Re-appending an already-sorted card set
  // would make the observer trigger itself forever after the first real ledger
  // render. Preserve identity and move nodes only when ordering changed.
  if (!sameNodeOrder(cards, sorted)) {
    for (const card of sorted) list.appendChild(card);
  }
  button.dataset.direction = ledgerDirection;
  button.setAttribute('aria-pressed', 'true');
  button.textContent = `Date ${ledgerDirection === 'asc' ? '↑' : '↓'}`;
}

function apply() {
  if (applying) return;
  applying = true;
  try {
    decorateContributionCards();
    if (contributionDirection) sortContributionCards();
    sortCommitteeCards();
  } finally {
    applying = false;
  }
}

function queueApply() {
  if (queued || applying) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    apply();
  });
}

document.addEventListener('click', (event) => {
  if (event.target.closest?.('[data-review-sort="date"]')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    contributionDirection = contributionDirection === 'asc' ? 'desc' : 'asc';
    sortContributionCards();
    return;
  }
  if (event.target.closest?.('[data-review-sort]')) {
    contributionDirection = null;
    queueMicrotask(renderContributionButton);
    return;
  }
  if (event.target.closest?.('#ledgerDateSortButton')) {
    event.preventDefault();
    ledgerDirection = ledgerDirection === 'asc' ? 'desc' : 'asc';
    sortCommitteeCards();
  }
}, true);

for (const id of ['recordList', 'committeeLedger']) {
  const node = document.getElementById(id);
  if (node) new MutationObserver(queueApply).observe(node, { childList: true, subtree: true });
}

apply();
