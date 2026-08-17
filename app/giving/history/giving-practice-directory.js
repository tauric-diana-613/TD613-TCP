const PRACTICE_OBJECTS = Object.freeze([
  { id: 'BBV-C001', name: 'King Neptune for King', kind: 'Candidate committee', candidate: 'King Neptune', office: 'King of Bikini Bottom', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C002', name: 'Puff for Bikini Bottom School District #67', kind: 'Candidate committee', candidate: 'Mrs. Puff', office: 'Bikini Bottom School District #67', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C003', name: 'Every Villain Is Lemons PAC', kind: 'PAC', candidate: '', office: '', committee_kind: 'PAC' },
  { id: 'BBV-C004', name: 'Sheldon Plankton for Bikini Bottom Campaign', kind: 'Candidate committee', candidate: 'Sheldon Plankton', office: 'Bikini Bottom campaign', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C005', name: 'Larry Lobster for Mayor of Bikini Bottom', kind: 'Candidate committee', candidate: 'Larry Lobster', office: 'Mayor of Bikini Bottom', committee_kind: 'CANDIDATE_COMMITTEE' },
  { id: 'BBV-C006', name: 'Fishocratic Executive Committee', kind: 'Executive committee', candidate: '', office: '', committee_kind: 'PARTY_EXECUTIVE_COMMITTEE' },
  { id: 'BBV-C007', name: 'Friends of Aquaman PC', kind: 'Political committee', candidate: '', office: '', committee_kind: 'POLITICAL_COMMITTEE' },
  { id: 'BBV-C008', name: 'Krusty Krab Parking Expansion Referendum Committee', kind: 'Issue / referendum committee', candidate: '', office: 'Parking expansion referendum', committee_kind: 'ISSUE_REFERENDUM' }
]);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
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

function matchingObjects(query) {
  const needle = normalize(query);
  if (!needle || needle === 'bikini bottom' || needle === 'sample' || needle === 'fictional sample') return [...PRACTICE_OBJECTS];
  return PRACTICE_OBJECTS.filter((item) => normalize([item.name, item.kind, item.candidate, item.office, item.committee_kind].join(' ')).includes(needle));
}

function candidatesFrom(objects) {
  const seen = new Set();
  return objects.filter((item) => item.candidate && !seen.has(item.candidate) && seen.add(item.candidate));
}

function practiceChip() {
  return '<span class="fictional-sample-chip">FICTIONAL SAMPLE</span>';
}

function objectCard(item) {
  return `<article class="practice-directory-card" data-practice-object="${escapeHtml(item.id)}">
    <div>${practiceChip()}<strong>${escapeHtml(item.name)}</strong></div>
    <small>${escapeHtml(item.id)} · ${escapeHtml(item.kind)} · Bikini Bottom, Oceania</small>
    ${item.candidate ? `<span>Candidate: ${escapeHtml(item.candidate)}${item.office ? ` · ${escapeHtml(item.office)}` : ''}</span>` : `<span>${escapeHtml(item.office || item.committee_kind.replaceAll('_', ' '))}</span>`}
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
  const candidateNode = $('#campaignDirectoryCandidates');
  const committeeNode = $('#campaignDirectoryCommittees');
  const openSecretsNode = $('#campaignDirectoryOpenSecrets');
  const openSecretsSummary = $('#campaignDirectoryOpenSecretsSummary');
  const workspaceSummary = $('#committeeSearchWorkspaceSummary');
  const workspaceList = $('#committeeSearchWorkspaceList');
  const activity = $('#campaignActivitySection');
  const status = $('#campaignToolsStatus');

  if (candidateNode) candidateNode.innerHTML = candidates.length ? candidates.map(candidateCard).join('') : '<span class="muted">No fictional candidate matches.</span>';
  if (committeeNode) committeeNode.innerHTML = objects.length ? objects.map(objectCard).join('') : '<span class="muted">No fictional committee matches.</span>';
  if (openSecretsNode) openSecretsNode.innerHTML = '<span class="muted">OpenSecrets sleeps during fictional practice.</span>';
  if (openSecretsSummary) openSecretsSummary.innerHTML = '';
  if (workspaceSummary) workspaceSummary.textContent = `${objects.length} fictional political object${objects.length === 1 ? '' : 's'} · BikiniBottomVotes only`;
  if (workspaceList) workspaceList.innerHTML = objects.length ? objects.map(objectCard).join('') : '<span class="muted">No fictional political object matched this query.</span>';
  if (activity) activity.hidden = true;
  if (status) {
    status.dataset.kind = objects.length ? 'success' : 'info';
    status.textContent = objects.length
      ? `${objects.length} fictional candidate / committee result${objects.length === 1 ? '' : 's'} from BikiniBottomVotes. Real filing jurisdictions remain asleep.`
      : 'No Bikini Bottom practice object matched. Try “Bikini Bottom” to see all eight fictional political objects.';
  }
}

function interceptPracticeDirectory(event) {
  if (!practiceActive()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  renderPracticeDirectory($('#campaignDirectoryQuery')?.value || '');
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
  if (!event.target?.closest?.('.practice-geo-asleep')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

syncPracticeDirectorySurface();

export const _givingPracticeDirectory = Object.freeze({
  PRACTICE_OBJECTS,
  matchingObjects,
  renderPracticeDirectory,
  sleepGeography,
  wakeGeography
});