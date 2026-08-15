import { GivingApiClient } from './giving-api.js';
import { normalizeName } from './giving-model.js';

const api = new GivingApiClient({ timeoutMs: 22000 });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let loadedContext = null;
let campaignRegistry = null;
let selectedCampaignState = 'FL';
let selectedLocalSourceId = null;

function campaignActivityType() {
  return $('#campaignDirectoryActivity')?.value || 'CONTRIBUTIONS';
}

function campaignJurisdiction() {
  return $('#campaignDirectoryJurisdiction')?.value || 'FEDERAL';
}

function activityLabel(value = campaignActivityType()) {
  return value === 'EXPENDITURES' ? 'expenditure receipts' : 'contribution receipts';
}

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
  for (const button of $$('#campaignDirectorySearchButton, #syncLoadedCommitteeButton, #bulkExactContactsButton, #bulkGivingHistoryButton, [data-load-campaign], [data-opensecrets-summary], [data-inspect-activity]')) {
    button.disabled = Boolean(busy) || (button.id === 'syncLoadedCommitteeButton' && !loadedContext?.committee_id);
  }
}

function localSources(kind = campaignJurisdiction()) {
  const instances = campaignRegistry?.instances || [];
  if (kind === 'COUNTY') return instances.filter((source) => source.family === 'VOTERFOCUS');
  if (kind === 'CITY') return instances.filter((source) => source.family === 'EASYVOTE');
  return [];
}

function localSourceLabel(source, kind) {
  if (kind === 'CITY') return String(source.jurisdiction || source.custodian || source.id).split(',')[0];
  return String(source.jurisdiction || source.custodian || source.id).replace(/ County.*$/i, '');
}

function renderCampaignStateMenu() {
  const menu = $('#campaignDirectoryStateMenu');
  if (!menu) return;
  const states = window.TD613_GIVING_STATES || [['FL', 'Florida']];
  menu.innerHTML = states.map(([code, name]) => `<label><input type="radio" name="campaign-directory-state" value="${escapeHtml(code)}" ${code === selectedCampaignState ? 'checked' : ''}><span>${escapeHtml(code)}</span><small>${escapeHtml(name)}</small></label>`).join('');
  menu.addEventListener('change', (event) => {
    const input = event.target.closest?.('input[type="radio"]');
    if (!input) return;
    selectedCampaignState = input.value;
    $('#campaignDirectoryStateCount').textContent = input.value;
    $('#campaignDirectoryState').open = false;
  });
}

function renderLocalSourceMenu() {
  const kind = campaignJurisdiction();
  const details = $('#campaignDirectoryLocal');
  const menu = $('#campaignDirectoryLocalMenu');
  const label = $('#campaignDirectoryLocalLabel');
  const count = $('#campaignDirectoryLocalCount');
  if (!details || !menu || !label || !count) return;
  const sources = localSources(kind);
  details.hidden = !['COUNTY', 'CITY'].includes(kind);
  if (details.hidden) return;
  label.textContent = kind === 'CITY' ? 'City' : 'County';
  if (!sources.some((source) => source.id === selectedLocalSourceId)) selectedLocalSourceId = sources[0]?.id || null;
  menu.innerHTML = sources.map((source) => `<label><input type="radio" name="campaign-directory-local" value="${escapeHtml(source.id)}" ${source.id === selectedLocalSourceId ? 'checked' : ''}><span>${kind === 'CITY' ? 'CITY' : 'CO'}</span><small>${escapeHtml(localSourceLabel(source, kind))}</small></label>`).join('') || '<span class="muted">No wired source is registered for this scope.</span>';
  count.textContent = localSourceLabel(sources.find((source) => source.id === selectedLocalSourceId), kind) || '';
}

function syncCampaignScopeControls() {
  const kind = campaignJurisdiction();
  if (kind !== 'FEDERAL') selectedCampaignState = 'FL';
  $('#campaignDirectoryStateCount').textContent = selectedCampaignState;
  const stateInputs = $$('#campaignDirectoryStateMenu input');
  stateInputs.forEach((input) => {
    input.checked = input.value === selectedCampaignState;
    input.disabled = kind !== 'FEDERAL' && input.value !== 'FL';
  });
  renderLocalSourceMenu();
}

async function hydrateCampaignRegistry() {
  if (campaignRegistry) return campaignRegistry;
  const result = await api.call('registry.read', {}, { mutation: false, purpose: 'load the bounded campaign lookup jurisdiction menu' });
  campaignRegistry = result?.data || result;
  renderLocalSourceMenu();
  return campaignRegistry;
}

function selectedSourceId() {
  const kind = campaignJurisdiction();
  if (kind === 'FLORIDA_STATE') return 'florida-state-contributions';
  if (kind === 'COUNTY' || kind === 'CITY') return selectedLocalSourceId;
  return 'fec-schedule-a';
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

function activityInspectButton(committee, candidate = {}, sourceId = 'fec-schedule-a') {
  if (!committee?.committee_id && !committee?.name) return '';
  return `<button type="button" class="campaign-activity-inspect" data-inspect-activity
    data-source-id="${escapeHtml(sourceId)}"
    data-committee-id="${escapeHtml(committee.committee_id || '')}"
    data-committee-name="${escapeHtml(committee.name || '')}"
    data-candidate-name="${escapeHtml(candidate.name || '')}">Inspect ${escapeHtml(activityLabel())}</button>`;
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
    <div class="campaign-committee-results">${(candidate.principal_committees || []).map((committee) => `${committeeLoadButton(committee, candidate)}${activityInspectButton(committee, candidate)}`).join('') || '<span class="muted">No principal committee returned in this OpenFEC result.</span>'}</div>
  </article>`).join('') : '<span class="muted">No candidate matches returned.</span>';

  $('#campaignDirectoryCommittees').innerHTML = committees.length
    ? committees.map((committee) => `${committeeLoadButton(committee)}${activityInspectButton(committee)}`).join('')
    : '<span class="muted">No committee / PC matches returned.</span>';

  $('#campaignDirectoryOpenSecrets').innerHTML = openSecrets.configured
    ? openSecrets.status === 'READY'
      ? (openSecrets.organizations || []).length
        ? openSecrets.organizations.map((org) => `<button type="button" class="opensecrets-result" data-opensecrets-summary data-org-id="${escapeHtml(org.org_id)}"><strong>${escapeHtml(org.name)}</strong><small>${escapeHtml(org.org_id)} · aggregate organization context</small></button>`).join('')
        : '<span class="muted">No OpenSecrets organization matches returned.</span>'
      : `<span class="muted">OpenSecrets held: ${escapeHtml(openSecrets.reason || 'upstream unavailable')}</span>`
    : '<span class="muted">OpenSecrets available after OPENSECRETS_API_KEY is configured in production.</span>';

  bindDynamicActions();
  lookupStatus(`${candidates.length} candidates · ${committees.length} committees/PCs · ${(openSecrets.organizations || []).length} OpenSecrets organizations. Select a committee to inspect ${activityLabel()}.`);
}

function renderActivity(data) {
  const records = Array.isArray(data?.records) ? data.records : [];
  const section = $('#campaignActivitySection');
  section.hidden = false;
  $('#campaignActivityHeading').textContent = `${data?.activity_type === 'EXPENDITURES' ? 'Expenditure' : 'Contribution'} receipts · separate committee activity lane`;
  $('#campaignActivityResults').innerHTML = records.length ? records.map((record) => `<article class="campaign-activity-row">
    <strong>${escapeHtml(record.filer || 'Filer not stated')}</strong>
    <strong>${record.amount_cents === null || record.amount_cents === undefined ? 'amount unavailable' : escapeHtml(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(record.amount_cents / 100))}</strong>
    <span>${escapeHtml(record.counterparty || 'Counterparty not stated')}</span>
    <small>${escapeHtml([record.date, record.purpose, record.jurisdiction].filter(Boolean).join(' · '))}${record.source_locator ? ` · <a href="${escapeHtml(record.source_locator)}" target="_blank" rel="noreferrer">source</a>` : ''}</small>
  </article>`).join('') : '<span class="muted">No activity rows were observed within this exact source, query, and requested date window. This is not a universal zero-activity claim.</span>';
}

function mergeActivityResults(results, { queryFacets = [] } = {}) {
  const admitted = results.filter(Boolean);
  const records = [];
  const seen = new Set();
  for (const result of admitted) {
    for (const record of Array.isArray(result?.records) ? result.records : []) {
      const key = record.record_digest || JSON.stringify(record);
      if (seen.has(key)) continue;
      seen.add(key);
      records.push(record);
    }
  }
  return {
    ...(admitted[0] || {}),
    records,
    record_count: records.length,
    query_facets: queryFacets,
    bounded_request_count: admitted.length,
    retrieved_at: admitted.map((result) => result.retrieved_at).filter(Boolean).sort().at(-1) || new Date().toISOString()
  };
}

function renderLocalDirectory(data) {
  const records = Array.isArray(data?.records) ? data.records : [];
  const names = [...new Set(records.map((record) => String(record.filer || '').trim()).filter(Boolean))].slice(0, 50);
  const sourceId = data?.source_instance_id || selectedSourceId();
  $('#campaignDirectoryCandidates').innerHTML = '<span class="muted">State/local identities are transaction-derived from the selected filing custodian; candidate and committee legal identity are not inferred beyond the returned filer label.</span>';
  $('#campaignDirectoryCommittees').innerHTML = names.length ? names.map((name) => `<button type="button" class="campaign-committee-result" data-load-campaign data-kind="local" data-committee-name="${escapeHtml(name)}" data-source-id="${escapeHtml(sourceId)}"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(sourceId)} · transaction-derived local filer identity</small><span>Load context → Contributions</span></button>`).join('') : '<span class="muted">No local filer identities were observed in the selected lane.</span>';
  $('#campaignDirectoryOpenSecrets').innerHTML = '<span class="muted">OpenSecrets aggregate context is limited to the Federal lookup lane.</span>';
  $('#campaignDirectoryOpenSecretsSummary').innerHTML = '';
  renderActivity(data);
  bindDynamicActions();
  const requestNote = data?.bounded_request_count > 1 ? ` · ${data.bounded_request_count} bounded candidate/committee projections` : '';
  lookupStatus(`${records.length} ${activityLabel(data?.activity_type)} returned from exactly one selected source${requestNote} · ${names.length} transaction-derived filer identit${names.length === 1 ? 'y' : 'ies'}.`, 'success');
}

async function inspectCommitteeActivity(button) {
  setBusy(true);
  const type = campaignActivityType();
  const sourceId = button.dataset.sourceId || selectedSourceId();
  const committeeId = button.dataset.committeeId || '';
  const committeeName = button.dataset.committeeName || '';
  lookupStatus(`Inspecting ${activityLabel(type)} for ${committeeName || committeeId}…`);
  try {
    const result = await api.call('committee-activity.search', {
      source_instance_id: sourceId,
      activity_type: type,
      query: {
        committee: sourceId === 'fec-schedule-a' ? committeeId : committeeName,
        candidate: button.dataset.candidateName || '',
        start_date: $('#dateFrom')?.value || '2020-01-01',
        end_date: $('#dateTo')?.value || new Date().toISOString().slice(0, 10),
        page_size: 100
      }
    }, { mutation: false, purpose: `inspect separate ${type.toLowerCase()} committee activity` });
    const data = result?.data || result;
    renderActivity(data);
    lookupStatus(`${data.record_count || 0} ${activityLabel(type)} returned from ${sourceId}.`, 'success');
  } catch (error) {
    lookupStatus(error?.message || 'Committee activity lookup did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

async function searchDirectory(event) {
  event?.preventDefault();
  const query = String($('#campaignDirectoryQuery')?.value || '').trim();
  if (query.length < 2) return lookupStatus('Enter at least two characters to search candidates, campaigns, and PCs.', 'error');
  setBusy(true);
  try {
    await hydrateCampaignRegistry();
    const jurisdiction = campaignJurisdiction();
    $('#campaignActivitySection').hidden = true;
    if (jurisdiction === 'FEDERAL') {
      lookupStatus(`Searching OpenFEC and OpenSecrets in ${selectedCampaignState}…`);
      const result = await api.call('campaign-directory.search', { query, state: selectedCampaignState }, { mutation: false, purpose: 'search reviewed federal campaign and committee identities' });
      renderDirectory(result?.data || result);
    } else {
      const sourceId = selectedSourceId();
      if (!sourceId) throw new Error(`Choose one ${jurisdiction === 'CITY' ? 'city' : 'county'} source before searching.`);
      const basePayload = {
        source_instance_id: sourceId,
        activity_type: campaignActivityType()
      };
      const dateWindow = {
        start_date: $('#dateFrom')?.value || '2020-01-01',
        end_date: $('#dateTo')?.value || new Date().toISOString().slice(0, 10),
        page_size: 100
      };
      if (jurisdiction === 'FLORIDA_STATE') {
        lookupStatus(`Searching Florida's one selected source for candidate and committee ${activityLabel()}…`);
        const [candidateResult, committeeResult] = await Promise.all([
          api.call('committee-activity.search', { ...basePayload, query: { ...dateWindow, candidate: query } }, { mutation: false, purpose: 'search one Florida source candidate activity projection' }),
          api.call('committee-activity.search', { ...basePayload, query: { ...dateWindow, committee: query } }, { mutation: false, purpose: 'search one Florida source committee activity projection' })
        ]);
        renderLocalDirectory(mergeActivityResults(
          [candidateResult?.data || candidateResult, committeeResult?.data || committeeResult],
          { queryFacets: ['CANDIDATE', 'COMMITTEE'] }
        ));
      } else {
        lookupStatus(`Searching exactly one selected source (${sourceId}) for ${activityLabel()}…`);
        const result = await api.call('committee-activity.search', {
          ...basePayload,
          query: { ...dateWindow, committee: query }
        }, { mutation: false, purpose: 'search one jurisdiction-scoped committee activity lane' });
        renderLocalDirectory(result?.data || result);
      }
    }
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

async function prepareBulkGivingHistoryExactContacts() {
  const button = $('#bulkGivingHistoryButton');
  const targetSelect = $('#campaignTargetSelect');
  if (!button || !targetSelect) return;
  const originalTarget = targetSelect.value;
  const exactTargets = [];
  const held = [];
  setBusy(true);
  button.textContent = 'Resolving exact contacts…';
  deputyStatus('Loading the complete Campaign Deputy people index for exact Giving History targets…');
  try {
    await loadAllCampaignDeputyPeople();
    const targets = [...targetSelect.options].filter((option) => option.value).map((option) => ({ id: option.value, name: targetNameFromOption(option) }));
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      button.textContent = `Resolving ${index + 1}/${targets.length}…`;
      const matches = exactPersonCandidates(target.name);
      if (matches.length !== 1) {
        held.push(`${target.name}: ${matches.length ? 'ambiguous exact Campaign Deputy name' : 'no exact Campaign Deputy person'}`);
        continue;
      }
      exactTargets.push({ dossier_target_id: target.id, person_id: matches[0].radio.value, display_name: target.name });
    }
    if (originalTarget && [...targetSelect.options].some((option) => option.value === originalTarget)) await selectTarget(originalTarget);
    if (!exactTargets.length) throw new Error('No unique exact Campaign Deputy person matches were found.');
    window.dispatchEvent(new CustomEvent('td613:prepare-campaign-deputy-giving-history', { detail: { targets: exactTargets, held } }));
    const holdText = held.length ? ` · ${held.length} ambiguous or missing contact${held.length === 1 ? '' : 's'} held` : '';
    deputyStatus(`${exactTargets.length} exact Giving History contact target${exactTargets.length === 1 ? '' : 's'} resolved${holdText}.`, held.length ? 'warning' : 'success');
  } catch (error) {
    deputyStatus(`Multi-contact Giving History preparation held: ${error?.message || error}`, 'error');
  } finally {
    button.textContent = 'Prepare all exact-match contacts';
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
  $$('[data-inspect-activity]').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => inspectCommitteeActivity(button));
  });
}

function install() {
  renderCampaignStateMenu();
  syncCampaignScopeControls();
  $('#campaignDirectoryForm')?.addEventListener('submit', searchDirectory);
  $('#campaignDirectoryJurisdiction')?.addEventListener('change', () => {
    syncCampaignScopeControls();
    lookupStatus('Jurisdiction changed. The next search will query only the selected lane.');
  });
  $('#campaignDirectoryActivity')?.addEventListener('change', () => {
    $('#campaignActivitySection').hidden = true;
    lookupStatus(`${activityLabel()} selected. Expenditures remain separate from donor Giving History.`);
  });
  $('#campaignDirectoryLocalMenu')?.addEventListener('change', (event) => {
    const input = event.target.closest?.('input[type="radio"]');
    if (!input) return;
    selectedLocalSourceId = input.value;
    const source = localSources().find((item) => item.id === selectedLocalSourceId);
    $('#campaignDirectoryLocalCount').textContent = localSourceLabel(source, campaignJurisdiction());
    $('#campaignDirectoryLocal').open = false;
  });
  $('#syncLoadedCommitteeButton')?.addEventListener('click', syncLoadedCommittee);
  $('#bulkExactContactsButton')?.addEventListener('click', bulkSyncExactContacts);
  $('#bulkGivingHistoryButton')?.addEventListener('click', prepareBulkGivingHistoryExactContacts);
  renderLoadedContext();
  const sessionObserver = new MutationObserver(() => {
    if (document.documentElement.dataset.session === 'open') hydrateCampaignRegistry().then(syncCampaignScopeControls).catch(() => {});
  });
  sessionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-session'] });
}

install();

