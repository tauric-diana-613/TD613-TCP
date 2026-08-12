import { GivingApiClient } from './giving-api.js';

const $ = (selector) => document.querySelector(selector);
let activeBounds = { minCents: null, maxCents: null };

function parseDollars(input) {
  const raw = String(input?.value ?? '').trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function boundsFromForm() {
  const min = parseDollars($('#amountMin'));
  const max = parseDollars($('#amountMax'));
  return {
    minCents: min === null ? null : Math.round(min * 100),
    maxCents: max === null ? null : Math.round(max * 100)
  };
}

function validateRange() {
  const minInput = $('#amountMin');
  const maxInput = $('#amountMax');
  const min = parseDollars(minInput);
  const max = parseDollars(maxInput);
  const invalid = min !== null && max !== null && min > max;
  maxInput?.setCustomValidity(invalid ? 'Maximum contribution must be greater than or equal to minimum contribution.' : '');
  return !invalid;
}

function boundsActive(bounds = activeBounds) {
  return bounds.minCents !== null || bounds.maxCents !== null;
}

function amountMatches(record, bounds = activeBounds) {
  if (!boundsActive(bounds)) return true;
  if (!Number.isSafeInteger(record?.amount_cents)) return false;
  if (bounds.minCents !== null && record.amount_cents < bounds.minCents) return false;
  if (bounds.maxCents !== null && record.amount_cents > bounds.maxCents) return false;
  return true;
}

function filteredPage(page, bounds = activeBounds) {
  if (!page || !Array.isArray(page.records) || !boundsActive(bounds)) return page;
  const observed = page.records.length;
  const records = page.records.filter((record) => amountMatches(record, bounds));
  return {
    ...page,
    records,
    client_amount_filter: {
      enabled: true,
      min_cents: bounds.minCents,
      max_cents: bounds.maxCents,
      observed_records: observed,
      retained_records: records.length
    }
  };
}

function filteredSearchResponse(result, bounds = activeBounds) {
  if (!boundsActive(bounds) || !result || typeof result !== 'object') return result;
  if (result?.data?.page?.records) {
    return { ...result, data: { ...result.data, page: filteredPage(result.data.page, bounds) } };
  }
  if (result?.data?.records) {
    return { ...result, data: filteredPage(result.data, bounds) };
  }
  if (result?.page?.records) {
    return { ...result, page: filteredPage(result.page, bounds) };
  }
  if (result?.records) return filteredPage(result, bounds);
  return result;
}

function installApiBoundaryFilter() {
  if (GivingApiClient.prototype.__td613AmountFilterInstalled) return;
  const originalCall = GivingApiClient.prototype.call;
  Object.defineProperty(GivingApiClient.prototype, '__td613AmountFilterInstalled', { value: true });
  GivingApiClient.prototype.call = async function filteredGivingCall(operation, payload = {}, options = {}) {
    const result = await originalCall.call(this, operation, payload, options);
    return operation === 'search.page' ? filteredSearchResponse(result, activeBounds) : result;
  };
}

function clearAmountFilter() {
  if ($('#amountMin')) $('#amountMin').value = '';
  if ($('#amountMax')) $('#amountMax').value = '';
  activeBounds = { minCents: null, maxCents: null };
  validateRange();
}

function installFormBoundary() {
  const minInput = $('#amountMin');
  const maxInput = $('#amountMax');
  const form = $('#searchForm');
  if (!minInput || !maxInput || !form) return;

  for (const input of [minInput, maxInput]) {
    input.addEventListener('input', validateRange);
    input.addEventListener('change', validateRange);
  }

  form.addEventListener('submit', (event) => {
    if (!validateRange()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      maxInput.reportValidity();
      return;
    }
    activeBounds = boundsFromForm();
  }, true);

  document.addEventListener('td613:giving-clear-all', clearAmountFilter);
}

installApiBoundaryFilter();
installFormBoundary();
