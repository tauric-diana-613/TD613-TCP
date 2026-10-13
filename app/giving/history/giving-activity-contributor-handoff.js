const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function contributionsSelected() {
  return ($('[name="campaign-directory-activity"]:checked')?.value || 'CONTRIBUTIONS') === 'CONTRIBUTIONS';
}

function decorateContributionCounterparties() {
  const root = $('#campaignActivityResults');
  if (!root) return;
  const enabled = contributionsSelected();
  for (const row of $$('#campaignActivityResults .campaign-activity-row')) {
    const counterparty = row.querySelector('span');
    if (!counterparty) continue;
    if (!enabled) {
      counterparty.querySelector('[data-prepare-contributor]')?.replaceWith(document.createTextNode(counterparty.textContent || ''));
      continue;
    }
    if (counterparty.querySelector('[data-prepare-contributor]')) continue;
    const name = String(counterparty.textContent || '').trim();
    if (!name || /not stated$/i.test(name)) continue;
    counterparty.textContent = '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'giving-contributor-breadcrumb';
    button.dataset.prepareContributor = name;
    button.dataset.handoffFrom = 'committee-contribution-receipt';
    button.dataset.handoffThrough = 'activity-counterparty';
    button.dataset.handoffStatus = '#campaignToolsStatus';
    button.innerHTML = `<span>${name.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])}</span><small>Prepare Individual Contributor</small>`;
    counterparty.appendChild(button);
  }
}

const root = $('#campaignActivityResults');
if (root) new MutationObserver(decorateContributionCounterparties).observe(root, { childList: true, subtree: true });
$$('[name="campaign-directory-activity"]').forEach((input) => input.addEventListener('change', () => queueMicrotask(decorateContributionCounterparties)));
decorateContributionCounterparties();

export const _givingActivityContributorHandoff = Object.freeze({
  contributionsSelected,
  decorateContributionCounterparties
});