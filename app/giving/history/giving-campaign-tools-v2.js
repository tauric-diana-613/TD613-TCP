import { GivingApiClient } from './giving-api.js';
import { normalizeName } from './giving-model.js';

const api = new GivingApiClient({ timeoutMs: 22000 });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let loadedContext = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function exactNameKey(value) {
  const normalized = normalizeName(value);
  return `${normalized.canonical}|${normalized.suffix || ''}`;
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount) : '—';
}

function lookupStatus(message, kind = 'info') {
  const node = $('#campaignToolsStatus');
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
}

function deputyStatus(message, kind = 'info') {
  const node = $('#campaignDeputyToolsStatus');
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
}

function setBusy(busy) {
  for (const button of $$('#campaignDirectorySearchButton, #syncLoadedCommitteeButton, #bulkExactContactsButton, [data-load-campaign], [data-opensecrets-summary]')) {
    button.disabled = Boolean(busy) || (button.id === 'syncLoadedCommitteeButton' && !loadedContext?.committee_id);
  }
}

function committeeLoadButton(committee, candidate = {}) {
  if (!committee?.committee_id || !committee?.name) return '';
  return `<button type="button" class="campaign-committee-result" data-load-campaign
    data-kind="committee"
    data-committee-id="${escapeHtml(committee.committee_id)}"
    data-committee-name="${escapeHtml(committee.name)}"
    data-candidate-id="${escapeHtml(candidate.candidate_id || '')}"
    data-candidate-name="${escapeHtml(candidate.name || '')}"
    data-committee-type="${escapeHtml(committee.committee_type_full || committee.committee_type || '')}"
    data-designation="${escapeHtml(committee.designation_full || committee.designation || '')}">
      <strong>${escapeHtml(committee.name)}</strong>
      <small>${escapeHtml(committee.committee_id)}${committee.committee_type_full || committee.committee_type ? ` · ${escapeHtml(committee.committee_type_full || committee.committee_type)}` : ''}</small>
      <span>Load committee → Contributions</span>
    </button>`;
}

function candidateLoadButton(candidate) {
  return `<button type="button" class="campaign-candidate-load" data-load-campaign
    data-kind="candidate"
    data-candidate-id="${escapeHtml(candidate.candidate_id || '')}"
    data-candidate-name="${escapeHtml(candidate.name || '')}">
      Load candidate → Contributions
    </button>`;
}

function renderDirectory(data) {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  const committees = Array.isArray(data?.committees) ? data.committees : [];
  const openSecrets = data?.opensecrets || {};

  $('#campaignDirectoryCandidates').innerHTML = candidates.length ? candidates.map((candidate) => `<article class="campaign-directory-card">
    <div><strong>${escapeHtml(candidate.name)}</strong><small>${escapeHtml([candidate.candidate_id, candidate.office, candidate.state, candidate.district, candidate.party].filter(Boolean).join(' · '))}</small></div>
    ${candidateLoadButton(candidate)}
    <div class="campaign-committee-results">${(candidate.principal_committees || []).map((committee) => committeeLoadButton(committee, candidate)).join('') || '<span class="muted">No principal committee returned in this OpenFEC result.</span>'}</div>
  </article>`).join('') : '<span class="muted">No candidate matches returned.</span>';

  $('#campaignDirectoryCommittees').innerHTML = committees.length
    ? committees.map((committee) => committeeLoadButton(committee)).join('')
    : '<span class="muted">No committee / PC matches returned.</span>';

  $('#campaignDirectoryOpenSecrets').innerHTML = openSecrets.configured
    ? openSecrets.status === 'READY'
      ? (openSecrets.organizations || []).length
        ? openSecrets.organizations.map((org) => `<button type="button" class="opensecrets-result" data-opensecrets-summary data-org-id="${escapeHtml(org.org_id)}"><strong>${escapeHtml(org.name)}</strong><small>${escapeHtml(org.org_id)} · aggregate organization context</small></button>`).join('')
        : '<span class="muted">No OpenSecrets organization matches returned.</span>'
      : `<span class="muted">OpenSecrets held: ${escapeHtml(openSecrets.reason || 'upstream unavailable')}</span>`
    : '<span class="muted">OpenSecrets available after OPENSECRETS_API_KEY is configured in production.</span>';

  bindDynamicActions();
  lookupStatus(`${candidates.length} candidates · ${committees.length} committees/PCs · ${(openSecrets.organizations || []).length} OpenSecrets organizations.`);
}

async function searchDirectory(event) {
  event?.preventDefault();
  const query = String($('#campaignDirectoryQuery')?.value || '').trim();
  if (query.length < 2) return lookupStatus('Enter at least two characters to search candidates, campaigns, and PCs.', 'error');
  setBusy(true);
  lookupStatus('Searching OpenFEC and OpenSecrets…');
  try {
    const result = await api.call('campaign-directory.search', { query }, { mutation: false, purpose: 'search reviewed campaign and committee identities' });
    renderDirectory(result?.data || result);
  } catch (error) {
    lookupStatus(error?.message || 'Campaign / PC lookup did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

function loadCampaignContext(button) {
  loadedContext = {
    kind: button.dataset.kind || 'committee',
    candidate_id: button.dataset.candidateId || null,
    candidate_name: button.dataset.candidateName || null,
    committee_id: button.dataset.committeeId || null,
    committee_name: button.dataset.committeeName || null,
    committee_type: button.dataset.committeeType || null,
    designation: button.dataset.designation || null
  };
  renderLoadedContext();
  lookupStatus(`${loadedContext.committee_name || loadedContext.candidate_name} loaded into Contributions.`, 'success');
  document.querySelector('[data-view="review"]')?.click();
}

function renderLoadedContext() {
  const contributionNode = $('#loadedCampaignContext');
  const deputyNode = $('#campaignDeputyLoadedContext');
  const syncButton = $('#syncLoadedCommitteeButton');
  if (!loadedContext) {
    contributionNode?.setAttribute('data-loaded', 'false');
    if (contributionNode) contributionNode.innerHTML = '<span class="eyebrow">LOADED CAMPAIGN / COMMITTEE</span><strong>No candidate or committee loaded.</strong><small>Use Candidate & committee lookup in the left rail to place a reviewed campaign identity here.</small>';
    if (deputyNode) deputyNode.textContent = 'Load a candidate or committee from the left rail first.';
    if (syncButton) syncButton.disabled = true;
    return;
  }
  const title = loadedContext.committee_name || loadedContext.candidate_name || 'Loaded campaign identity';
  const metadata = [loadedContext.candidate_name && loadedContext.committee_name ? loadedContext.candidate_name : null, loadedContext.candidate_id, loadedContext.committee_id, loadedContext.committee_type, loadedContext.designation].filter(Boolean).join(' · ');
  if (contributionNode) {
    contributionNode.dataset.loaded = 'true';
    contributionNode.innerHTML = `<span class="eyebrow">LOADED CAMPAIGN / COMMITTEE</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(metadata || 'Reviewed OpenFEC identity')}</small>`;
  }
  if (deputyNode) deputyNode.textContent = loadedContext.committee_id
    ? `${title} · ${loadedContext.committee_id} is ready for one-touch committee sync.`
    : `${title} is loaded as candidate context. Choose one of its principal committees in the left rail before committee sync.`;
  if (syncButton) syncButton.disabled = !loadedContext.committee_id;
}

async function syncLoadedCommittee() {
  if (!loadedContext?.committee_id || !loadedContext?.committee_name) return;
  setBusy(true);
  deputyStatus(`Syncing ${loadedContext.committee_name} to Campaign Deputy…`);
  try {
    await api.status();
    const result = await api.call('campaign-deputy.ensure-committee', {
      confirmed: true,
      committee_id: loadedContext.committee_id,
      committee_name: loadedContext.committee_name,
      candidate_id: loadedContext.candidate_id,
      committee_type: loadedContext.committee_type,
      designation: loadedContext.designation
    }, { mutation: true, purpose: `explicitly create or reuse Campaign Deputy committee list for ${loadedContext.committee_id}` });
    const data = result?.data || result;
    const receipt = data?.receipt || result?.receipt;
    deputyStatus(`${loadedContext.committee_name}: ${receipt?.action === 'COMMITTEE_LIST_CREATED' ? 'committee list created' : 'existing committee list reused'} · ${loadedContext.committee_id}.`, 'success');
  } catch (error) {
    deputyStatus(error?.message || 'Campaign Deputy committee sync did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

async function showOpenSecretsSummary(button) {
  setBusy(true);
  lookupStatus(`Loading OpenSecrets aggregate summary for ${button.textContent.trim()}…`);
  try {
    const result = await api.call('campaign-directory.opensecrets-summary', { org_id: button.dataset.orgId }, { mutation: false, purpose: 'inspect OpenSecrets aggregate organization summary' });
    const item = result?.data || result;
    $('#campaignDirectoryOpenSecretsSummary').innerHTML = `<article class="opensecrets-summary"><strong>${escapeHtml(item.name || item.org_id)}</strong><small>${escapeHtml(item.org_id)} · cycle ${escapeHtml(item.cycle || '—')}</small><div><span>Total ${money(item.total)}</span><span>Individuals ${money(item.individuals)}</span><span>PACs ${money(item.pacs)}</span><span>Lobbying ${money(item.lobbying)}</span><span>Outside ${money(item.outside)}</span><span>To candidates ${money(item.gave_to_candidates)}</span></div><p>Aggregate OpenSecrets organization context; not an individual donor transaction.</p></article>`;
    lookupStatus(`OpenSecrets summary loaded for ${item.name || item.org_id}.`);
  } catch (error) {
    lookupStatus(error?.message || 'OpenSecrets summary did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

function waitFor(condition, { timeoutMs = 18000, intervalMs = 80 } = {}) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      try { const value = condition(); if (value) return resolve(value); } catch {}
      if (Date.now() - started >= timeoutMs) return reject(new Error('Timed out while waiting for Campaign Deputy UI state.'));
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

function peopleSignature() {
  return `${$$('#peopleIndex input[type="radio"]').length}|${$('#morePeopleButton')?.hidden ? 'end' : 'more'}|${$('#peopleIndex')?.textContent?.length || 0}`;
}

async function clickAndWait(button) {
  const before = peopleSignature();
  button.click();
  await waitFor(() => peopleSignature() !== before, { timeoutMs: 20000 });
}

async function loadAllCampaignDeputyPeople() {
  const load = $('#loadPeopleButton');
  const more = $('#morePeopleButton');
  if (!load || !more) throw new Error('Campaign Deputy people controls are unavailable.');
  await clickAndWait(load);
  let pages = 1;
  while (!more.hidden) {
    if (pages >= 80) throw new Error('Campaign Deputy people index exceeded the bounded 80-page bulk-match ceiling.');
    await clickAndWait(more);
    pages += 1;
  }
}

function targetNameFromOption(option) {
  return String(option?.textContent || '').split(' · ')[0].trim();
}

function exactPersonCandidates(name) {
  const key = exactNameKey(name);
  return $$('#peopleIndex .person-option').map((label) => {
    const radio = label.querySelector('input[type="radio"]');
    const display = label.querySelector('strong')?.textContent?.trim() || '';
    return { radio, display };
  }).filter((item) => item.radio && exactNameKey(item.display) === key);
}

async function selectTarget(targetId) {
  const select = $('#campaignTargetSelect');
  if (!select) throw new Error('Campaign target selector is unavailable.');
  select.value = targetId;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await waitFor(() => $('#campaignTargetSelect')?.value === targetId && $('#committeeSelect'));
}

async function linkCommitteeForCurrentTarget(personId, committee) {
  const radio = $(`#peopleIndex input[type="radio"][value="${CSS.escape(personId)}"]`);
  if (!radio) throw new Error('Exact Campaign Deputy person disappeared from the loaded index.');
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
  const committeeSelect = $('#committeeSelect');
  committeeSelect.value = committee;
  committeeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  const button = $('#linkExistingButton');
  if (!button || button.disabled) throw new Error('Campaign Deputy link action remained unavailable.');
  const before = $$('#campaignReceipts .receipt-card').length;
  button.click();
  await waitFor(() => $$('#campaignReceipts .receipt-card').length > before, { timeoutMs: 20000 });
}

async function bulkSyncExactContacts() {
  const bulkButton = $('#bulkExactContactsButton');
  const targetSelect = $('#campaignTargetSelect');
  if (!bulkButton || !targetSelect) return;
  const originalTarget = targetSelect.value;
  setBusy(true);
  bulkButton.textContent = 'Loading Campaign Deputy people…';
  deputyStatus('Loading the complete Campaign Deputy people index for exact-name resolution…');
  let syncedTargets = 0;
  let relationships = 0;
  const held = [];
  try {
    await loadAllCampaignDeputyPeople();
    const targets = [...targetSelect.options].filter((option) => option.value).map((option) => ({ id: option.value, name: targetNameFromOption(option) }));
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      bulkButton.textContent = `Syncing ${index + 1}/${targets.length}…`;
      await selectTarget(target.id);
      const committees = [...$('#committeeSelect').options].map((option) => option.value).filter(Boolean);
      if (!committees.length) { held.push(`${target.name}: no confirmed committees`); continue; }
      const matches = exactPersonCandidates(target.name);
      if (matches.length !== 1) { held.push(`${target.name}: ${matches.length ? 'ambiguous exact Campaign Deputy name' : 'no exact Campaign Deputy person'}`); continue; }
      for (const committee of committees) {
        await linkCommitteeForCurrentTarget(matches[0].radio.value, committee);
        relationships += 1;
      }
      syncedTargets += 1;
    }
    if (originalTarget && [...targetSelect.options].some((option) => option.value === originalTarget)) await selectTarget(originalTarget);
    const holdText = held.length ? ` · ${held.length} held (${held.slice(0, 3).join('; ')}${held.length > 3 ? '; …' : ''})` : '';
    deputyStatus(`${syncedTargets} contacts synced across ${relationships} reviewed committee relationships${holdText}.`, held.length ? 'warning' : 'success');
  } catch (error) {
    deputyStatus(`${syncedTargets} contacts / ${relationships} relationships completed before bulk sync held: ${error?.message || error}`, 'error');
  } finally {
    bulkButton.textContent = 'Sync all exact-match contacts';
    setBusy(false);
  }
}

function bindDynamicActions() {
  $$('[data-load-campaign]').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => loadCampaignContext(button));
  });
  $$('[data-opensecrets-summary]').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => showOpenSecretsSummary(button));
  });
}

function install() {
  $('#campaignDirectoryForm')?.addEventListener('submit', searchDirectory);
  $('#syncLoadedCommitteeButton')?.addEventListener('click', syncLoadedCommittee);
  $('#bulkExactContactsButton')?.addEventListener('click', bulkSyncExactContacts);
  renderLoadedContext();
}

install();
