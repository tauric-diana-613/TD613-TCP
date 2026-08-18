const $ = (selector) => document.querySelector(selector);
const PREPARED_ID = 'givingPreparedContributorHandoff';

function cleanName(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function humanizeRoute(value) {
  return cleanName(value)
    .replace(/^practice-/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\bgiving\b/i, 'Giving')
    .replace(/\bcandidate committee lookup\b/i, 'Candidate / committee lookup')
    .replace(/\bcampaign activity\b/i, 'Campaign activity');
}

function preparedRibbon() {
  let ribbon = $(`#${PREPARED_ID}`);
  if (ribbon) return ribbon;
  const input = $('#searchName');
  const panel = input?.closest('.search-control') || $('#searchForm')?.closest('.search-control') || $('#searchForm');
  if (!panel) return null;
  ribbon = document.createElement('div');
  ribbon.id = PREPARED_ID;
  ribbon.className = 'giving-prepared-handoff';
  ribbon.hidden = true;
  ribbon.innerHTML = '<span class="giving-prepared-handoff-kicker">PREPARED ROUTE</span><span class="giving-prepared-handoff-copy"></span>';
  const form = $('#searchForm');
  if (form?.parentNode === panel) panel.insertBefore(ribbon, form);
  else panel.prepend(ribbon);
  return ribbon;
}

function renderPreparedRoute({ contributor, from, through, originLabel = null, searched = false }) {
  const ribbon = preparedRibbon();
  if (!ribbon) return;
  const origin = cleanName(originLabel) || humanizeRoute(from) || 'Giving discovery';
  ribbon.hidden = false;
  ribbon.dataset.preparedContributor = contributor;
  ribbon.dataset.handoffFrom = from;
  ribbon.dataset.handoffThrough = through;
  ribbon.dataset.searchStarted = searched ? 'true' : 'false';
  const copy = ribbon.querySelector('.giving-prepared-handoff-copy');
  if (copy) {
    copy.textContent = searched
      ? `${contributor} · followed from ${origin} · SEARCH started by explicit operator gesture.`
      : `${contributor} · followed from ${origin} · nothing searched by this handoff.`;
  }
}

function clearPreparedRoute() {
  const ribbon = $(`#${PREPARED_ID}`);
  if (!ribbon) return;
  ribbon.hidden = true;
  ribbon.removeAttribute('data-prepared-contributor');
  ribbon.removeAttribute('data-handoff-from');
  ribbon.removeAttribute('data-handoff-through');
  ribbon.removeAttribute('data-search-started');
}

export function prepareContributorSearch(name, {
  from = 'giving',
  through = 'contributor-breadcrumb',
  statusSelector = '#campaignToolsStatus',
  originLabel = null
} = {}) {
  const contributor = cleanName(name);
  const input = $('#searchName');
  if (!contributor || !input) return false;

  input.value = contributor;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  renderPreparedRoute({ contributor, from, through, originLabel, searched: false });
  const panel = input.closest('.search-control') || $('#searchForm');
  panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  try { input.focus({ preventScroll: true }); } catch { input.focus(); }

  const status = $(statusSelector);
  if (status) {
    status.dataset.kind = 'info';
    status.textContent = `${contributor} is prepared in Individual Contributor. Press SEARCH to continue; no retrieval ran from this handoff.`;
  }

  document.dispatchEvent(new CustomEvent('td613:giving-contributor-handoff', {
    detail: Object.freeze({
      from,
      through,
      origin_label: cleanName(originLabel) || null,
      prepared_contributor: contributor,
      exact_match_changed: false,
      retrieval_started: false
    })
  }));
  return true;
}

function handleContributorHandoff(event) {
  const button = event.target?.closest?.('[data-prepare-contributor]');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  prepareContributorSearch(button.dataset.prepareContributor || button.textContent || '', {
    from: button.dataset.handoffFrom || 'giving',
    through: button.dataset.handoffThrough || 'contributor-breadcrumb',
    statusSelector: button.dataset.handoffStatus || '#campaignToolsStatus',
    originLabel: button.dataset.handoffOrigin || null
  });
}

$('#searchName')?.addEventListener('input', (event) => {
  const ribbon = $(`#${PREPARED_ID}`);
  if (!ribbon || ribbon.hidden) return;
  const prepared = cleanName(ribbon.dataset.preparedContributor);
  const current = cleanName(event.currentTarget?.value);
  if (prepared && current !== prepared) clearPreparedRoute();
});

$('#searchForm')?.addEventListener('submit', () => {
  const ribbon = $(`#${PREPARED_ID}`);
  if (!ribbon || ribbon.hidden) return;
  renderPreparedRoute({
    contributor: cleanName(ribbon.dataset.preparedContributor),
    from: ribbon.dataset.handoffFrom || 'giving',
    through: ribbon.dataset.handoffThrough || 'contributor-breadcrumb',
    originLabel: null,
    searched: true
  });
}, true);

document.addEventListener('click', handleContributorHandoff);

export const _givingContributorHandoff = Object.freeze({
  prepareContributorSearch,
  cleanName,
  humanizeRoute,
  renderPreparedRoute,
  clearPreparedRoute
});