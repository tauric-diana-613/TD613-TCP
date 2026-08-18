import { _givingPracticeCommitteeGraph } from './giving-practice-committee-graph.js';
import { prepareContributorSearch } from './giving-contributor-handoff.js';

const PRACTICE_OBJECTS = Object.freeze([
  { id: 'BBV-C001', name: 'King Neptune for King', kind: 'Candidate committee', candidate: 'King Neptune', office: 'King of Bikini Bottom', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C002', name: 'Puff for Bikini Bottom School District #67', kind: 'Candidate committee', candidate: 'Mrs. Puff', office: 'Bikini Bottom School District #67', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C003', name: 'Every Villain Is Lemons PAC', kind: 'PAC', candidate: '', office: '', committee_kind: 'PAC' },
  { id: 'BBV-C004', name: 'Sheldon Plankton for Bikini Bottom Campaign', kind: 'Candidate committee', candidate: 'Sheldon Plankton', office: 'Mayor of Bikini Bottom', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C005', name: 'Larry Lobster for Mayor of Bikini Bottom', kind: 'Candidate committee', candidate: 'Larry Lobster', office: 'Mayor of Bikini Bottom', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C006', name: 'Fishocratic Executive Committee', kind: 'Executive committee', candidate: '', office: '', committee_kind: 'PARTY_EXECUTIVE_COMMITTEE' },
  { id: 'BBV-C007', name: 'Friends of Aquaman PC', kind: 'Political committee', candidate: '', office: '', committee_kind: 'POLITICAL_COMMITTEE' },
  { id: 'BBV-C008', name: 'Krusty Krab Parking Expansion Referendum Committee', kind: 'Issue / referendum committee', candidate: '', office: 'Parking expansion referendum', committee_kind: 'ISSUE_REFERENDUM' }
]);

const DISCOVERY_OBJECTS = Object.freeze([
  { id: 'BBV-C009', name: 'Larry Lobster for Bikini Bottom Board of Public Health, Soil & Water District 2', kind: 'Candidate committee', candidate: 'Larry Lobster', office: 'Bikini Bottom Board of Public Health, Soil & Water District 2', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C010', name: 'Aquaman for Bikini Bottom County Sheriff', kind: 'Candidate committee', candidate: 'Aquaman', office: 'Bikini Bottom County Sheriff', committee_kind: 'CANDIDATE_COMMITTEE' }
]);

const ALL_OBJECTS = Object.freeze([...PRACTICE_OBJECTS, ...DISCOVERY_OBJECTS]);
const GENERIC_QUERY_TOKENS = new Set(['campaign', 'committee', 'candidate', 'political', 'pac', 'pc', 'for', 'of', 'the']);
const $ = (selector) => document.querySelector(selector);
const GEO_SELECTORS = Object.freeze(['#givingStateFilter', '#campaignDirectoryState', '#campaignDirectoryMunicipal', '#campaignDirectoryJurisdiction']);

function practiceActive() {
  return document.documentElement.dataset.givingPractice === 'true';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('en-US').replace(/\s+/g, ' ').trim();
}

function objectSearchText(item) {
  return normalize([item.id, item.name, item.kind, item.candidate, item.office, item.committee_kind].join(' '));
}

function significantQueryTokens(value) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !GENERIC_QUERY_TOKENS.has(token));
}

function matchingObjects(query) {
  const needle = normalize(query);
  if (!needle || needle === 'bikini bottom' || needle === 'sample' || needle === 'fictional sample') return [...PRACTICE_OBJECTS];

  const exact = ALL_OBJECTS.filter((item) => [item.id, item.name, item.candidate]
    .some((value) => normalize(value) === needle));
  if (exact.length) return exact;

  const contiguous = ALL_OBJECTS.filter((item) => objectSearchText(item).includes(needle));
  if (contiguous.length) return contiguous;

  const tokens = significantQueryTokens(needle);
  if (!tokens.length) return [];
  return ALL_OBJECTS.filter((item) => {
    const haystack = objectSearchText(item);
    return tokens.every((token) => haystack.includes(token));
  });
}

function candidatesFrom(objects) {
  const seen = new Set();
  return objects.filter((item) => item.candidate && !seen.has(item.candidate) && seen.add(item.candidate));
}

function practiceChip() {
  return '<span class="fictional-sample-chip">FICTIONAL SAMPLE</span>';
}

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format((Number(cents) || 0) / 100);
}

function contributorTrail(item, { expanded = false } = {}) {
  const contributors = _givingPracticeCommitteeGraph.contributorsForCommittee(item.name);
  if (!contributors.length) return '';
  const visible = expanded ? contributors : contributors.slice(0, 4);
  const remainder = contributors.length - visible.length;
  return `<div class="practice-contributor-trail" data-practice-committee-trail="${escapeHtml(item.id)}">
    <small>Practice contributor trail · click a name to prepare Individual Contributor</small>
    <div class="practice-contributor-trail-list">
      ${visible.map((entry) => {
        const classes = [...entry.transaction_classes, ...entry.data_classes].filter(Boolean).join(' · ');
        const anomaly = entry.compliance_anomaly_count ? ` · ${entry.compliance_anomaly_count} compliance anomaly` : '';
        return `<button type="button" class="practice-contributor-breadcrumb" data-practice-contributor="${escapeHtml(entry.name)}" data-practice-origin="${escapeHtml(item.name)}" title="${escapeHtml(`${entry.record_count} fictional contribution${entry.record_count === 1 ? '' : 's'} · ${money(entry.total_cents)}${classes ? ` · ${classes}` : ''}${anomaly}`)}">${escapeHtml(entry.name)} <em>${entry.record_count}</em></button>`;
      }).join('')}
      ${remainder > 0 ? `<span class="practice-contributor-more">+${remainder} more · search this committee to open the full trail</span>` : ''}
    </div>
  </div>`;
}

function objectCard(item, options = {}) {
  const totals = _givingPracticeCommitteeGraph.totalsForCommittee(item.name);
  const classNote = totals.transaction_classes.length ? ` · ${totals.transaction_classes.join(' / ')}` : '';
  const anomalyNote = totals.compliance_anomaly_count ? ` · ${totals.compliance_anomaly_count} review anomaly` : '';
  return `<article class="practice-directory-card" data-practice-object="${escapeHtml(item.id)}">
    <div>${practiceChip()}<strong>${escapeHtml(item.name)}</strong></div>
    <small>${escapeHtml(item.id)} · ${escapeHtml(item.kind)} · Bikini Bottom, Oceania</small>
    ${item.candidate ? `<span>Candidate: ${escapeHtml(item.candidate)}${item.office ? ` · ${escapeHtml(item.office)}` : ''}</span>` : `<span>${escapeHtml(item.office || item.committee_kind.replaceAll('_', ' '))}</span>`}
    <span class="practice-directory-ledger-summary">${totals.record_count} fictional record${totals.record_count === 1 ? '' : 's'} · ${totals.contributor_count} contributor${totals.contributor_count === 1 ? '' : 's'} · ${money(totals.total_cents)}${escapeHtml(classNote)}${escapeHtml(anomalyNote)}</span>
    ${contributorTrail(item, options)}
  </article>`;
}

function candidateCard(item) {
  return `<article class="practice-directory-card practice-directory-candidate" data-practice-candidate="${escapeHtml(item.candidate)}">
    <div>${practiceChip()}<strong>${escapeHtml(item.candidate)}</strong></div>
    <small>${escapeHtml(item.office || 'Bikini Bottom candidate')} · linked practice committee ${escapeHtml(item.id)}</small>
  </article>`;
}

function renderPracticeDirectory(query) {
  const objects = matchingObjects(query);
  const candidates = candidatesFrom(objects);
  const expanded = objects.length === 1;
  const candidateNode = $('#campaignDirectoryCandidates');
  const committeeNode = $('#campaignDirectoryCommittees');
  const openSecretsNode = $('#campaignDirectoryOpenSecrets');
  const openSecretsSummary = $('#campaignDirectoryOpenSecretsSummary');
  const workspaceSummary = $('#committeeSearchWorkspaceSummary');
  const workspaceList = $('#committeeSearchWorkspaceList');
  const activity = $('#campaignActivitySection');
  const status = $('#campaignToolsStatus');

  if (candidateNode) candidateNode.innerHTML = candidates.length ? candidates.map(candidateCard).join('') : '<span class="muted">No fictional candidate matches.</span>';
  if (committeeNode) committeeNode.innerHTML = objects.length ? objects.map((item) => objectCard(item, { expanded })).join('') : '<span class="muted">No fictional committee matches.</span>';
  if (openSecretsNode) openSecretsNode.innerHTML = '<span class="muted">OpenSecrets sleeps during fictional practice.</span>';
  if (openSecretsSummary) openSecretsSummary.innerHTML = '';
  if (workspaceSummary) workspaceSummary.textContent = `${objects.length} fictional political object${objects.length === 1 ? '' : 's'} · BikiniBottomVotes only`;
  if (workspaceList) workspaceList.innerHTML = objects.length ? objects.map((item) => objectCard(item, { expanded })).join('') : '<span class="muted">No fictional political object matched this query.</span>';
  if (activity) activity.hidden = true;
  if (status) {
    status.dataset.kind = objects.length ? 'success' : 'info';
    status.textContent = objects.length
      ? `${objects.length} fictional candidate / committee result${objects.length === 1 ? '' : 's'} from BikiniBottomVotes. Contributor trails preserve the route into Individual Contributor; real filing jurisdictions remain asleep.`
      : 'No Bikini Bottom practice object matched. Try “Bikini Bottom” for the starter eight, or search a candidate/office name to discover additional fictional race history.';
  }
}

function revealCommitteeSearchWorkspace() {
  const ledgerTab = $('.tab[data-view="ledger"]');
  const ledgerPanel = $('#view-ledger');
  const workspace = $('#committeeSearchWorkspace');
  if (!ledgerTab || !ledgerPanel || !workspace) return false;
  ledgerTab.click();
  return ledgerPanel.hidden === false;
}

function interceptPracticeDirectory(event) {
  if (!practiceActive()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  renderPracticeDirectory($('#campaignDirectoryQuery')?.value || '');
  queueMicrotask(revealCommitteeSearchWorkspace);
}

function prepareContributorFromTrail(name, originLabel = null) {
  const prepared = prepareContributorSearch(name, {
    from: 'practice-candidate-committee-lookup',
    through: 'practice-contributor-breadcrumb',
    statusSelector: '#campaignToolsStatus',
    originLabel
  });
  if (!prepared) return false;
  document.dispatchEvent(new CustomEvent('td613:giving-practice-discovery-route', {
    detail: {
      from: 'candidate-committee-lookup',
      through: 'contributor-breadcrumb',
      origin_label: originLabel,
      prepared_contributor: name,
      retrieval_started: false
    }
  }));
  return true;
}

function rememberDisabled(input) {
  if (input.dataset.practiceDisabledBefore !== undefined) return;
  input.dataset.practiceDisabledBefore = input.disabled ? 'true' : 'false';
}

function sleepGeography() {
  for (const selector of GEO_SELECTORS) {
    const node = $(selector);
    if (!node) continue;
    node.classList.add('practice-geo-asleep');
    node.setAttribute('aria-disabled', 'true');
    if (node.tagName === 'DETAILS') node.open = false;
    for (const input of node.querySelectorAll('input, button, select')) {
      rememberDisabled(input);
      input.disabled = true;
    }
  }
}

function wakeGeography() {
  for (const selector of GEO_SELECTORS) {
    const node = $(selector);
    if (!node) continue;
    node.classList.remove('practice-geo-asleep');
    node.removeAttribute('aria-disabled');
    for (const input of node.querySelectorAll('input, button, select')) {
      if (input.dataset.practiceDisabledBefore === undefined) continue;
      input.disabled = input.dataset.practiceDisabledBefore === 'true';
      delete input.dataset.practiceDisabledBefore;
    }
  }
}

function syncPracticeDirectorySurface() {
  if (practiceActive()) sleepGeography();
  else wakeGeography();
}

$('#campaignDirectoryForm')?.addEventListener('submit', interceptPracticeDirectory, true);

document.addEventListener('td613:giving-practice-source-registry', (event) => {
  if (event.detail?.action === 'register') {
    queueMicrotask(() => {
      sleepGeography();
      const status = $('#campaignToolsStatus');
      if (status) status.textContent = 'FICTIONAL PRACTICE · Candidate & committee lookup is live against BikiniBottomVotes. Real State, Municipal, and jurisdiction controls are asleep.';
    });
  } else if (event.detail?.action === 'remove') {
    wakeGeography();
  }
});

document.addEventListener('click', (event) => {
  if (!practiceActive()) return;
  const contributor = event.target?.closest?.('[data-practice-contributor]');
  if (contributor) {
    event.preventDefault();
    event.stopImmediatePropagation();
    prepareContributorFromTrail(
      contributor.dataset.practiceContributor || '',
      contributor.dataset.practiceOrigin || null
    );
    return;
  }
  if (!event.target?.closest?.('.practice-geo-asleep')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

syncPracticeDirectorySurface();

export const _givingPracticeDirectory = Object.freeze({
  PRACTICE_OBJECTS,
  DISCOVERY_OBJECTS,
  ALL_OBJECTS,
  matchingObjects,
  significantQueryTokens,
  renderPracticeDirectory,
  revealCommitteeSearchWorkspace,
  prepareContributorFromTrail,
  sleepGeography,
  wakeGeography
});
