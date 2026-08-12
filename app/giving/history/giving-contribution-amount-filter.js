const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function parseBound(input) {
  const raw = String(input?.value ?? '').trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function parseRenderedAmount(card) {
  const text = card.querySelector('.record-amount strong')?.textContent || '';
  const normalized = text.replace(/[^0-9.\-]/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function validateRange() {
  const minInput = $('#amountMin');
  const maxInput = $('#amountMax');
  const min = parseBound(minInput);
  const max = parseBound(maxInput);
  const invalid = min !== null && max !== null && min > max;
  maxInput?.setCustomValidity(invalid ? 'Maximum contribution must be greater than or equal to minimum contribution.' : '');
  return !invalid;
}

function applyAmountFilter() {
  if (!validateRange()) return;
  const min = parseBound($('#amountMin'));
  const max = parseBound($('#amountMax'));
  let visible = 0;
  const cards = $$('#recordList .record-card');
  for (const card of cards) {
    const amount = parseRenderedAmount(card);
    const keep = amount !== null && (min === null || amount >= min) && (max === null || amount <= max);
    card.hidden = !keep;
    card.dataset.amountFiltered = keep ? 'false' : 'true';
    if (keep) visible += 1;
  }
  const count = $('#reviewCount');
  if (count && cards.length && (min !== null || max !== null)) count.textContent = String(visible);
}

function clearAmountFilter() {
  if ($('#amountMin')) $('#amountMin').value = '';
  if ($('#amountMax')) $('#amountMax').value = '';
  validateRange();
  applyAmountFilter();
}

function install() {
  const minInput = $('#amountMin');
  const maxInput = $('#amountMax');
  const recordList = $('#recordList');
  if (!minInput || !maxInput || !recordList) return;

  minInput.addEventListener('input', applyAmountFilter);
  maxInput.addEventListener('input', applyAmountFilter);
  minInput.addEventListener('change', applyAmountFilter);
  maxInput.addEventListener('change', applyAmountFilter);
  $('#searchForm')?.addEventListener('submit', (event) => {
    if (!validateRange()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      maxInput.reportValidity();
    }
  }, true);

  new MutationObserver(applyAmountFilter).observe(recordList, { childList: true });
  document.addEventListener('td613:giving-clear-all', clearAmountFilter);
  applyAmountFilter();
}

install();
