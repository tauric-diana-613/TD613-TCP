const $ = (selector) => document.querySelector(selector);

function cleanName(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function prepareContributorSearch(name, {
  from = 'giving',
  through = 'contributor-breadcrumb',
  statusSelector = '#campaignToolsStatus'
} = {}) {
  const contributor = cleanName(name);
  const input = $('#searchName');
  if (!contributor || !input) return false;

  input.value = contributor;
  input.dispatchEvent(new Event('input', { bubbles: true }));
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
    statusSelector: button.dataset.handoffStatus || '#campaignToolsStatus'
  });
}

document.addEventListener('click', handleContributorHandoff);

export const _givingContributorHandoff = Object.freeze({
  prepareContributorSearch,
  cleanName
});