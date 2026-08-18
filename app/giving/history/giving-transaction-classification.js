const CLASS_LOAN = 'LOAN';
const CLASS_IN_KIND = 'IN-KIND';
const SEARCH_OPERATION = 'search.page';
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const normalizedHeader = (value) => String(value ?? '').toLocaleLowerCase('en-US').replace(/[^a-z0-9]/g, '');

function classifyText(value) {
  const text = compact(value).toLocaleUpperCase('en-US');
  if (!text) return null;
  if (/\b(?:IN[-\s]?KIND|INKIND)\b/.test(text)) return CLASS_IN_KIND;
  if (/\bLOAN\b/.test(text) && !/\b(?:NO|NOT|NON)[-\s]?LOAN\b/.test(text)) return CLASS_LOAN;
  return null;
}

function rawTypeCandidates(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const values = [];
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined || typeof value === 'object') continue;
    const header = normalizedHeader(key);
    const meaningfulHeader =
      header.includes('loantype') ||
      header.includes('loanindicator') ||
      header.includes('inkind') ||
      header.includes('contributiontype') ||
      header.includes('transactiontype') ||
      header.includes('receipttype') ||
      header.includes('typeofcontribution') ||
      header.includes('natureofcontribution') ||
      header === 'type' ||
      header.includes('linenumberlabel');
    if (meaningfulHeader) values.push(value);
  }
  return values;
}

export function deriveTransactionClass(record = {}) {
  const explicit = [
    record.transaction_class,
    record.loan_type,
    record.contribution_type,
    record.transaction_type,
    record.type,
    record.line_number_label,
    record.raw_source_transaction_class,
    ...rawTypeCandidates(record.raw_source_row)
  ];
  for (const value of explicit) {
    const classification = classifyText(value);
    if (classification) return classification;
  }
  return null;
}

export function promoteTransactionClass(record = {}) {
  const transactionClass = deriveTransactionClass(record);
  if (!transactionClass) return record;
  const originalType = compact(record.contribution_type);
  return {
    ...record,
    transaction_class: transactionClass,
    source_contribution_type: record.source_contribution_type || originalType || null,
    contribution_type: transactionClass,
    lineage: {
      ...(record.lineage || {}),
      transaction_class_promoted: transactionClass,
      generic_source_type_preserved: Boolean(originalType && originalType !== transactionClass)
    }
  };
}

function responseWithRecords(original, body, records) {
  const headers = new Headers(original.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify({
    ...body,
    data: {
      ...body.data,
      page: {
        ...body.data.page,
        records
      }
    }
  }), { status: original.status, statusText: original.statusText, headers });
}

const priorFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init = {}) => {
  const result = await priorFetch(input, init);
  let envelope = null;
  try { envelope = typeof init?.body === 'string' ? JSON.parse(init.body) : null; } catch { envelope = null; }
  if (envelope?.operation !== SEARCH_OPERATION) return result;

  const body = await result.clone().json().catch(() => null);
  const records = body?.data?.page?.records;
  if (!Array.isArray(records) || !records.length) return result;
  const promoted = records.map(promoteTransactionClass);
  const changed = promoted.some((record, index) => record !== records[index]);
  return changed ? responseWithRecords(result, body, promoted) : result;
};

function badgeLabel(value) {
  const classification = classifyText(value);
  return classification || null;
}

function decorateTransactionBadges() {
  for (const card of document.querySelectorAll('#recordList .record-card')) {
    const amount = card.querySelector('.record-amount');
    const detail = amount?.querySelector('small');
    if (!amount || !detail) continue;
    const classification = badgeLabel(detail.textContent);
    const existing = amount.querySelector('.giving-transaction-class-badge');
    if (!classification) {
      existing?.remove();
      continue;
    }
    if (existing) {
      // This decorator is driven by a childList MutationObserver. Rewriting an
      // already-correct badge text would itself create another child mutation,
      // recursively scheduling the decorator and starving the browser main thread.
      if (existing.textContent !== classification) existing.textContent = classification;
      if (existing.dataset.transactionClass !== classification) existing.dataset.transactionClass = classification;
      continue;
    }
    const badge = document.createElement('span');
    badge.className = 'giving-transaction-class-badge';
    badge.dataset.transactionClass = classification;
    badge.textContent = classification;
    badge.setAttribute('aria-label', `${classification} transaction`);
    amount.appendChild(badge);
  }
}

const recordList = document.querySelector('#recordList');
if (recordList) {
  new MutationObserver(() => queueMicrotask(decorateTransactionBadges))
    .observe(recordList, { childList: true, subtree: true });
}
queueMicrotask(decorateTransactionBadges);

export const _givingTransactionClassification = Object.freeze({
  CLASS_LOAN,
  CLASS_IN_KIND,
  classifyText,
  deriveTransactionClass,
  promoteTransactionClass,
  decorateTransactionBadges
});