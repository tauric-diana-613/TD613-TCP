const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const DEFAULT_DATE_FROM = '2020-01-01';
const today = () => new Date().toISOString().slice(0, 10);
let initialDefaultSettled = false;

function emitInput(element) {
  element?.dispatchEvent(new Event('input', { bubbles: true }));
}

function setDateWindow(start) {
  const from = $('#dateFrom');
  const to = $('#dateTo');
  if (!from || !to) return;
  from.value = start;
  to.value = today();
  emitInput(from);
  emitInput(to);
}

function ensureDefaultDate() {
  const from = $('#dateFrom');
  const to = $('#dateTo');
  if (from && (!from.value || from.value === '2000-01-01')) {
    from.value = DEFAULT_DATE_FROM;
    emitInput(from);
  }
  if (to && !to.value) {
    to.value = today();
    emitInput(to);
  }
}

function settleInitialDefaultAfterHydration(frame = 0) {
  if (initialDefaultSettled) return;
  if (document.documentElement.dataset.session !== 'open') return;
  const registryReady = $('#sourceRegistry')?.children.length > 0;
  if (registryReady || frame >= 45) {
    ensureDefaultDate();
    initialDefaultSettled = true;
    return;
  }
  requestAnimationFrame(() => settleInitialDefaultAfterHydration(frame + 1));
}

function watchSessionHydration() {
  const startIfOpen = () => {
    if (document.documentElement.dataset.session === 'open' && !initialDefaultSettled) {
      requestAnimationFrame(() => settleInitialDefaultAfterHydration());
    }
  };
  const observer = new MutationObserver(startIfOpen);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-session'] });
  startIfOpen();
}

function installDatePresets() {
  const split = $('#dateFrom')?.closest('.split-fields');
  if (!split || $('#givingDatePresets')) return;
  const currentYear = new Date().getFullYear();
  const wrap = document.createElement('div');
  wrap.id = 'givingDatePresets';
  wrap.className = 'giving-date-presets';
  wrap.setAttribute('aria-label', 'Quick beginning date presets');
  wrap.innerHTML = `
    <span>Quick start</span>
    <button type="button" data-start-year="2020">2020</button>
    <button type="button" data-start-year="2022">2022</button>
    <button type="button" data-start-year="2024">2024</button>
    <button type="button" data-start-year="${currentYear}">${currentYear}</button>
  `;
  split.insertAdjacentElement('afterend', wrap);
  $$('[data-start-year]').forEach((button) => button.addEventListener('click', () => {
    setDateWindow(`${button.dataset.startYear}-01-01`);
  }));
}

function installClearSearch() {
  const run = $('#runSearchButton');
  const cancel = $('#cancelSearchButton');
  const row = run?.closest('.button-row');
  if (!run || !cancel || !row || $('#clearSearchButton')) return;

  const clear = document.createElement('button');
  clear.id = 'clearSearchButton';
  clear.type = 'button';
  clear.className = 'button';
  clear.textContent = 'Clear search';
  row.append(clear);

  const syncDisabled = () => { clear.disabled = !cancel.disabled; };
  const observer = new MutationObserver(syncDisabled);
  observer.observe(cancel, { attributes: true, attributeFilter: ['disabled'] });
  syncDisabled();

  clear.addEventListener('click', () => {
    if (!cancel.disabled) return;
    const title = $('#dossierTitle')?.value || '';
    const custody = $('#custodyMode')?.value || 'LOCAL';

    // The app's New action is the authoritative in-memory reset for records,
    // source states, identity decisions, targets, and Campaign Deputy selection.
    // Preserve dossier-facing title/custody so this behaves like Clear Search.
    $('#newDossierButton')?.click();
    if ($('#dossierTitle')) {
      $('#dossierTitle').value = title;
      emitInput($('#dossierTitle'));
    }
    if ($('#custodyMode')) {
      $('#custodyMode').value = custody;
      $('#custodyMode').dispatchEvent(new Event('change', { bubbles: true }));
    }

    if ($('#searchName')) { $('#searchName').value = ''; emitInput($('#searchName')); }
    if ($('#searchAliases')) { $('#searchAliases').value = ''; emitInput($('#searchAliases')); }
    if ($('#searchHints')) { $('#searchHints').value = ''; emitInput($('#searchHints')); }
    if ($('#exactMatchToggle')) {
      $('#exactMatchToggle').checked = false;
      $('#exactMatchToggle').dispatchEvent(new Event('change', { bubbles: true }));
    }
    setDateWindow(DEFAULT_DATE_FROM);
    document.dispatchEvent(new CustomEvent('td613:giving-clear-all'));
    $('#searchName')?.focus();
  });
}

function installNewDossierDefault() {
  const button = $('#newDossierButton');
  if (!button || button.dataset.searchDefaultBound === 'true') return;
  button.dataset.searchDefaultBound = 'true';
  button.addEventListener('click', () => queueMicrotask(ensureDefaultDate));
}

function installStyles() {
  if ($('#givingSearchEnhancementStyle')) return;
  const style = document.createElement('style');
  style.id = 'givingSearchEnhancementStyle';
  style.textContent = `
    .giving-date-presets {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin: -2px 0 12px;
      font: 700 9px/1.2 var(--mono);
      color: var(--muted);
    }
    .giving-date-presets > span { margin-right: 2px; text-transform: uppercase; letter-spacing: .08em; }
    .giving-date-presets button {
      min-height: 26px;
      padding: 4px 8px;
      border: 1px solid rgba(200, 235, 213, .17);
      background: rgba(4, 24, 18, .66);
      color: var(--text);
      font: inherit;
      cursor: pointer;
    }
    .giving-date-presets button:hover,
    .giving-date-presets button:focus-visible {
      color: var(--bright);
      border-color: rgba(118, 234, 212, .42);
      outline: none;
    }
    .contact-queue-message {
      margin: 7px 0 0;
      color: var(--muted);
      font: 600 9px/1.45 var(--mono);
    }
    .contact-queue-message[data-kind="error"] { color: var(--danger, #ffaaa2); }
  `;
  document.head.append(style);
}

installDatePresets();
installClearSearch();
installNewDossierDefault();
installStyles();
watchSessionHydration();
