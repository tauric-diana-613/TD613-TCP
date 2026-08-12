const EXACT_MATCH_STORAGE_KEY = 'td613.giving.exact-match';
const BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';

function compactComparable(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function comparableKeys(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return new Set();
  const keys = new Set([compactComparable(raw)]);
  const comma = raw.match(/^\s*([^,]+),\s*(.+)$/);
  if (comma) keys.add(compactComparable(`${comma[2]} ${comma[1]}`));
  return new Set([...keys].filter(Boolean));
}

function recordSearchNames(record = {}) {
  return [
    record.contributor_name_raw,
    record.contributor_name,
    record.raw_contributor_name,
    record.contributor_name_parsed?.display,
    record.name,
    record.entity_name,
    record.organization_name,
    record.company_name,
    record.company,
    record.candidate,
    record.candidate_name,
    record.recipient,
    record.recipient_name,
    record.recipient_committee,
    record.recipient_committee_name,
    record.committee,
    record.committee_name
  ].filter((value) => value !== null && value !== undefined && String(value).trim());
}

function recordMatchesExact(record, queryName) {
  const queryKeys = comparableKeys(queryName);
  if (!queryKeys.size) return true;
  return recordSearchNames(record).some((value) => {
    const valueKeys = comparableKeys(value);
    return [...valueKeys].some((key) => queryKeys.has(key));
  });
}

function exactMatchEnabled() {
  if (!BROWSER) return false;
  const control = document.getElementById('exactMatchToggle');
  if (control) return control.checked;
  try {
    return sessionStorage.getItem(EXACT_MATCH_STORAGE_KEY) === '1';
  } catch (error) {
    return false;
  }
}

function filterSearchResponse(body, queryName) {
  if (!body || typeof body !== 'object') return { body, changed: false, before: 0, after: 0 };
  let changed = false;
  let before = 0;
  let after = 0;
  const visited = new Set();

  const walk = (value, depth = 0) => {
    if (!value || typeof value !== 'object' || depth > 8 || visited.has(value)) return;
    visited.add(value);
    if (!Array.isArray(value) && Array.isArray(value.records)) {
      const original = value.records;
      const filtered = original.filter((record) => recordMatchesExact(record, queryName));
      before += original.length;
      after += filtered.length;
      if (filtered.length !== original.length) {
        value.records = filtered;
        changed = true;
      }
      if (typeof value.returned === 'number') value.returned = filtered.length;
      if (typeof value.returned_count === 'number') value.returned_count = filtered.length;
      if (typeof value.record_count === 'number') value.record_count = filtered.length;
      value.client_exact_match = {
        enabled: true,
        observed_records: original.length,
        retained_records: filtered.length
      };
    }
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth + 1));
      return;
    }
    Object.values(value).forEach((item) => walk(item, depth + 1));
  };

  walk(body);
  return { body, changed, before, after };
}

function installExactMatchFetch() {
  if (!BROWSER || typeof globalThis.fetch !== 'function' || globalThis.__td613GivingExactFetchPatched) return;
  const nativeFetch = globalThis.fetch.bind(globalThis);
  globalThis.__td613GivingExactFetchPatched = true;

  globalThis.fetch = async (input, init = {}) => {
    const response = await nativeFetch(input, init);
    if (!exactMatchEnabled()) return response;
    if (typeof init?.body !== 'string' || !init.body.includes('"operation":"search.page"')) return response;

    let envelope;
    try {
      envelope = JSON.parse(init.body);
    } catch (error) {
      return response;
    }
    if (envelope?.operation !== 'search.page') return response;
    const queryName = envelope?.payload?.query?.name;
    if (!String(queryName ?? '').trim()) return response;

    let body;
    try {
      body = await response.clone().json();
    } catch (error) {
      return response;
    }

    const filtered = filterSearchResponse(body, queryName);
    if (!filtered.changed) return response;

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.set('content-type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify(filtered.body), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
}

function installStyles() {
  if (document.getElementById('givingUiFixesStyles')) return;
  const style = document.createElement('style');
  style.id = 'givingUiFixesStyles';
  style.textContent = `
    #newDossierButton,
    #saveDossierButton {
      min-height: 30px;
      padding: 5px 10px;
      line-height: 1.05;
    }

    .giving-exact-match {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 9px;
      margin: -2px 0 12px;
      padding: 8px 10px;
      border: 1px solid rgba(200, 235, 213, .12);
      background: rgba(1, 11, 8, .46);
      cursor: pointer;
    }
    .giving-exact-match input {
      flex: 0 0 auto;
      width: auto;
      min-height: 0;
      margin: 0;
      accent-color: var(--cyan);
    }
    .giving-exact-match span { display: grid; gap: 1px; min-width: 0; }
    .giving-exact-match strong {
      color: var(--bright);
      font-size: 10px;
      letter-spacing: .045em;
      text-transform: uppercase;
    }
    .giving-exact-match small { color: var(--dim); font-size: 9px; line-height: 1.35; }

    .review-sort-header {
      display: grid;
      grid-template-columns: minmax(150px, .82fr) minmax(210px, 1.25fr) minmax(115px, .5fr) auto;
      gap: 12px;
      align-items: center;
      margin: 0 0 7px;
      padding: 0 13px;
    }
    .review-sort-button {
      min-width: 0;
      padding: 6px 0;
      border: 0;
      border-bottom: 1px solid rgba(200, 235, 213, .12);
      cursor: pointer;
      color: var(--dim);
      background: transparent;
      font: 700 9px/1.2 var(--mono);
      letter-spacing: .06em;
      text-align: left;
      text-transform: uppercase;
    }
    .review-sort-button[data-key="amount"] { text-align: right; }
    .review-sort-button:hover,
    .review-sort-button[data-active="true"] {
      color: var(--cyan);
      border-bottom-color: rgba(118, 234, 212, .42);
    }
    .review-sort-button:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }

    @media (max-width: 1080px) {
      .review-sort-header { grid-template-columns: 1fr 1fr; }
      .review-sort-button[data-key="amount"] { text-align: left; }
    }

    @media (max-width: 760px) {
      .ledger-tabs {
        display: flex !important;
        width: 100%;
        max-width: 100%;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        overscroll-behavior-x: contain;
        scroll-snap-type: x proximity;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
      }
      .ledger-tabs .tab {
        flex: 0 0 auto !important;
        width: auto !important;
        min-width: max-content !important;
        min-height: 38px !important;
        padding: 8px 11px !important;
        line-height: 1.15;
        white-space: nowrap;
        scroll-snap-align: start;
      }
      .ledger-tabs .tab::before { display: none !important; }
      .review-sort-header {
        grid-template-columns: 1fr 1fr;
        gap: 5px 10px;
        padding: 0;
      }
      .review-sort-button { padding: 7px 4px; }
    }

    @media (max-width: 420px) {
      .ledger-tabs .tab {
        min-height: 36px !important;
        padding: 7px 10px !important;
      }
    }
  `;
  document.head.append(style);
}

function installExactMatchToggle() {
  if (document.getElementById('exactMatchToggle')) return;
  const nameInput = document.getElementById('searchName');
  const field = nameInput?.closest('.field');
  if (!field) return;

  const label = document.createElement('label');
  label.className = 'giving-exact-match';
  label.htmlFor = 'exactMatchToggle';
  label.innerHTML = `
    <input id="exactMatchToggle" type="checkbox">
    <span>
      <strong>Exact Match</strong>
      <small>Keep only source records whose searchable name equals the submitted name.</small>
    </span>
  `;
  field.insertAdjacentElement('afterend', label);

  const toggle = label.querySelector('input');
  try {
    toggle.checked = sessionStorage.getItem(EXACT_MATCH_STORAGE_KEY) === '1';
  } catch (error) {}
  toggle.addEventListener('change', () => {
    try {
      sessionStorage.setItem(EXACT_MATCH_STORAGE_KEY, toggle.checked ? '1' : '0');
    } catch (error) {}
  });
}

function textValue(card, selector) {
  return card.querySelector(selector)?.textContent?.trim() || '';
}

function numericAmount(card) {
  const raw = textValue(card, '.record-amount strong');
  if (!raw || /missing/i.test(raw)) return null;
  const value = Number(raw.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(value) ? value : null;
}

function installReviewSorting() {
  const list = document.getElementById('recordList');
  const clusterNotice = document.getElementById('clusterNotice');
  if (!list || !clusterNotice || document.getElementById('reviewSortHeader')) return;

  const header = document.createElement('div');
  header.id = 'reviewSortHeader';
  header.className = 'review-sort-header';
  header.setAttribute('aria-label', 'Identity review sorting');
  header.innerHTML = [
    ['contributor', 'Contributor'],
    ['committee', 'Committee'],
    ['amount', 'Amount'],
    ['status', 'Status / action']
  ].map(([key, label]) => `<button class="review-sort-button" type="button" data-key="${key}" data-label="${label}" data-active="false">${label}</button>`).join('');
  clusterNotice.insertAdjacentElement('afterend', header);

  const sortState = { key: null, direction: 'asc' };
  let observer;

  const updateButtons = () => {
    header.querySelectorAll('.review-sort-button').forEach((button) => {
      const active = button.dataset.key === sortState.key;
      button.dataset.active = active ? 'true' : 'false';
      const indicator = active ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : '';
      button.textContent = `${button.dataset.label}${indicator}`;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute('aria-label', active
        ? `${button.dataset.label}, ${sortState.direction === 'asc' ? 'ascending' : 'descending'}. Activate to reverse.`
        : `Sort by ${button.dataset.label} ascending.`);
    });
  };

  const compareText = (left, right) => left.localeCompare(right, undefined, { sensitivity: 'base', numeric: true });

  const applySort = () => {
    if (!sortState.key) return;
    const cards = [...list.querySelectorAll(':scope > .record-card')];
    if (cards.length < 2) return;
    const tail = list.querySelector(':scope > .coverage-warning');
    const decorated = cards.map((card, index) => ({ card, index }));

    decorated.sort((a, b) => {
      let result = 0;
      if (sortState.key === 'amount') {
        const left = numericAmount(a.card);
        const right = numericAmount(b.card);
        if (left === null && right === null) result = 0;
        else if (left === null) return 1;
        else if (right === null) return -1;
        else result = left - right;
      } else {
        const selectors = {
          contributor: '.record-person strong',
          committee: '.record-committee strong',
          status: '.identity-state'
        };
        result = compareText(textValue(a.card, selectors[sortState.key]), textValue(b.card, selectors[sortState.key]));
      }
      if (result === 0) result = a.index - b.index;
      return sortState.direction === 'desc' ? -result : result;
    });

    observer?.disconnect();
    decorated.forEach(({ card }) => list.insertBefore(card, tail));
    observer?.observe(list, { childList: true });
  };

  observer = new MutationObserver(() => {
    if (!sortState.key) return;
    queueMicrotask(applySort);
  });
  observer.observe(list, { childList: true });

  header.querySelectorAll('.review-sort-button').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      if (sortState.key === key) sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
      else {
        sortState.key = key;
        sortState.direction = 'asc';
      }
      updateButtons();
      applySort();
    });
  });
  updateButtons();
}

function installUiFixes() {
  installStyles();
  installExactMatchToggle();
  installReviewSorting();
}

if (BROWSER) {
  installExactMatchFetch();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installUiFixes, { once: true });
  else queueMicrotask(installUiFixes);
}

export {
  comparableKeys,
  filterSearchResponse,
  recordMatchesExact
};
