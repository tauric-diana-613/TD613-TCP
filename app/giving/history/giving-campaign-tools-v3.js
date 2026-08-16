import { GivingApiClient } from './giving-api.js';
import { normalizeName } from './giving-model.js';

const api = new GivingApiClient({ timeoutMs: 22000 });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let campaignRegistry = null;
let loadedContext = null;
let committeeHold = false;
let committeeSearchSnapshots = [];
const selectedCampaignStates = new Set(['FL']);
const selectedMunicipalSourceIds = new Set();

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
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
    : '—';
}

function activityType() {
  return $('[name="campaign-directory-activity"]:checked')?.value || 'CONTRIBUTIONS';
}

function activityLabel(value = activityType()) {
  return value === 'EXPENDITURES' ? 'expenditure receipts' : 'contribution receipts';
}

function checkedJurisdictions() {
  return new Set($$('[name="campaign-directory-jurisdiction"]:checked').map((input) => input.value));
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
    if (button.id === 'syncLoadedCommitteeButton') button.disabled = Boolean(busy) || !loadedContext?.committee_id;
    else button.disabled = Boolean(busy);
  }
}

function stateRows() {
  return window.TD613_GIVING_STATES || [['FL', 'Florida']];
}

function stateSummary() {
  if (!selectedCampaignStates.size) return '';
  if (selectedCampaignStates.size === stateRows().length) return 'All states';
  if (selectedCampaignStates.size === 1) return [...selectedCampaignStates][0];
  return `${selectedCampaignStates.size} states`;
}

function updateStateSummary() {
  const count = $('#campaignDirectoryStateCount');
  if (!count) return;
  count.textContent = stateSummary();
  count.hidden = !selectedCampaignStates.size;
}

function renderCampaignStateMenu() {
  const menu = $('#campaignDirectoryStateMenu');
  if (!menu) return;
  menu.innerHTML = stateRows().map(([code, name]) => `<label><input type="checkbox" value="${escapeHtml(code)}" ${selectedCampaignStates.has(code) ? 'checked' : ''}><span>${escapeHtml(code)}</span><small>${escapeHtml(name)}</small></label>`).join('');
  updateStateSummary();
}

function municipalSources() {
  return (campaignRegistry?.instances || []).filter((source) => ['VOTERFOCUS', 'EASYVOTE'].includes(source.family) && source.state !== 'UNAVAILABLE');
}

function municipalLabel(source) {
  if (!source) return '';
  if (source.family === 'VOTERFOCUS') {
    const jurisdiction = String(source.jurisdiction || '').replace(/\s+County.*$/i, '').trim();
    return `${jurisdiction || source.custodian || source.id} County`;
  }
  return String(source.custodian || source.jurisdiction || source.id)
    .replace(/^City of\s+/i, '')
    .replace(/,\s*[^,]+\s+County$/i, '')
    .trim();
}

function municipalSummary() {
  const all = municipalSources();
  if (!selectedMunicipalSourceIds.size) return '';
  if (all.length && selectedMunicipalSourceIds.size === all.length) return 'All';
  if (selectedMunicipalSourceIds.size === 1) {
    return municipalLabel(all.find((source) => selectedMunicipalSourceIds.has(source.id))) || '1 selected';
  }
  return `${selectedMunicipalSourceIds.size} selected`;
}

function updateMunicipalSummary() {
  const count = $('#campaignDirectoryMunicipalCount');
  if (!count) return;
  count.textContent = municipalSummary();
  count.hidden = !selectedMunicipalSourceIds.size;
}

function renderMunicipalMenu() {
  const menu = $('#campaignDirectoryMunicipalMenu');
  if (!menu) return;
  const sources = municipalSources();
  menu.innerHTML = sources.length
    ? sources.map((source) => `<label><input type="checkbox" value="${escapeHtml(source.id)}" ${selectedMunicipalSourceIds.has(source.id) ? 'checked' : ''}><span>${escapeHtml(source.family === 'VOTERFOCUS' ? 'CO' : 'CITY')}</span><small>${escapeHtml(municipalLabel(source))}</small></label>`).join('')
    : '<span class="muted">No wired municipal source is registered.</span>';
  updateMunicipalSummary();
}

function stateCodeForSource(source) {
  const explicit = String(source?.state_code || '').toUpperCase();
  if (/^[A-Z]{2}$/.test(explicit)) return explicit;
  const hay = `${source?.jurisdiction || ''} ${source?.custodian || ''}`;
  if (/Florida/i.test(hay)) return 'FL';
  return null;
}

function stateSources(code) {
  return (campaignRegistry?.instances || []).filter((source) => source.family === 'FLORIDA' && source.state !== 'UNAVAILABLE' && stateCodeForSource(source) === code);
}

async function hydrateCampaignRegistry() {
  if (campaignRegistry) return campaignRegistry;
  const result = await api.call('registry.read', {}, { mutation: false, purpose: 'load campaign lookup jurisdiction registry' });
  campaignRegistry = result?.data || result;
  renderMunicipalMenu();
  return campaignRegistry;
}

function committeeSnapshotKey(value, fallback = '') {
  const text = String(value || fallback || '').trim();
  return text ? exactNameKey(text) : '';
}

function committeeWorkspaceData() {
  const identities = new Map();
  for (const snapshot of committeeSearchSnapshots) {
    for (const candidate of Array.isArray(snapshot.data?.candidates) ? snapshot.data.candidates : []) {
      const key = `candidate:${candidate.candidate_id || committeeSnapshotKey(candidate.name)}`;
      identities.set(key, {
        kind: 'Candidate', name: candidate.name,
        meta: [candidate.candidate_id, candidate.office, candidate.state, candidate.party].filter(Boolean).join(' · '),
        candidate
      });
      for (const committee of candidate.principal_committees || []) {
        const committeeKey = `committee:${committee.committee_id || committeeSnapshotKey(committee.name)}`;
        identities.set(committeeKey, {
          kind: 'Committee', name: committee.name,
          meta: [committee.committee_id, committee.committee_type_full || committee.committee_type].filter(Boolean).join(' · '),
          committee, candidate, source_id: 'fec-schedule-a'
        });
      }
    }
    for (const committee of Array.isArray(snapshot.data?.committees) ? snapshot.data.committees : []) {
      const key = `committee:${committee.committee_id || committeeSnapshotKey(committee.name)}`;
      const existing = identities.get(key);
      const candidate = existing?.candidate && Object.keys(existing.candidate).length ? existing.candidate : {};
      identities.set(key, {
        kind: 'Committee', name: committee.name,
        meta: [committee.committee_id, committee.committee_type_full || committee.committee_type].filter(Boolean).join(' · '),
        committee, candidate, source_id: 'fec-schedule-a'
      });
    }
    for (const organization of snapshot.data?.opensecrets?.organizations || []) {
      const key = `organization:${organization.org_id || committeeSnapshotKey(organization.name)}`;
      identities.set(key, { kind: 'Organization', name: organization.name, meta: organization.org_id || 'OpenSecrets', organization });
    }
    for (const record of Array.isArray(snapshot.data?.records) ? snapshot.data.records : []) {
      const sourceId = record.source_instance_id || snapshot.data?.source_instance_id || '';
      const filerKey = `filer:${sourceId}:${committeeSnapshotKey(record.filer, sourceId)}`;
      if (record.filer && !identities.has(filerKey)) {
        identities.set(filerKey, {
          kind: 'Filer', name: record.filer,
          meta: [record.jurisdiction, sourceId].filter(Boolean).join(' · '),
          committee: { name: record.filer }, candidate: {}, source_id: sourceId
        });
      }
    }
  }
  return { identities: [...identities.values()] };
}

function renderCommitteeHoldState() {
  const button = $('#holdCommitteeButton');
  if (!button) return;
  button.dataset.held = committeeHold ? 'true' : 'false';
  button.setAttribute('aria-pressed', String(committeeHold));
  button.title = committeeHold ? 'Later committee searches append to this list.' : 'The next committee search replaces this list.';
}

function committeeLoadButton(committee, candidate = {}) {
  if (!committee?.committee_id || !committee?.name) return '';
  return `<button type="button" class="campaign-committee-result" data-load-campaign data-kind="committee" data-committee-id="${escapeHtml(committee.committee_id)}" data-committee-name="${escapeHtml(committee.name)}" data-candidate-id="${escapeHtml(candidate.candidate_id || '')}" data-candidate-name="${escapeHtml(candidate.name || '')}" data-committee-type="${escapeHtml(committee.committee_type_full || committee.committee_type || '')}" data-designation="${escapeHtml(committee.designation_full || committee.designation || '')}"><strong>${escapeHtml(committee.name)}</strong><small>${escapeHtml(committee.committee_id)}${committee.committee_type_full || committee.committee_type ? ` · ${escapeHtml(committee.committee_type_full || committee.committee_type)}` : ''}</small><span>Load committee → Contributions</span></button>`;
}

function candidateLoadButton(candidate) {
  return `<button type="button" class="campaign-candidate-load" data-load-campaign data-kind="candidate" data-candidate-id="${escapeHtml(candidate.candidate_id || '')}" data-candidate-name="${escapeHtml(candidate.name || '')}">Load candidate → Contributions</button>`;
}

function activityInspectButton(committee, candidate = {}, sourceId = 'fec-schedule-a') {
  if (!committee?.committee_id && !committee?.name) return '';
  return `<button type="button" class="campaign-activity-inspect" data-inspect-activity data-source-id="${escapeHtml(sourceId)}" data-committee-id="${escapeHtml(committee.committee_id || '')}" data-committee-name="${escapeHtml(committee.name || '')}" data-candidate-name="${escapeHtml(candidate.name || '')}">Inspect ${escapeHtml(activityLabel())}</button>`;
}

function renderCommitteeWorkspace() {
  const summary = $('#committeeSearchWorkspaceSummary');
  const list = $('#committeeSearchWorkspaceList');
  if (!summary || !list) return;
  const { identities } = committeeWorkspaceData();
  const latest = committeeSearchSnapshots.at(-1)?.data;
  const heldCount = (latest?.source_results || []).filter((item) => item.status === 'HELD').length;
  summary.textContent = committeeSearchSnapshots.length
    ? `${identities.length} campaign/committee identit${identities.length === 1 ? 'y' : 'ies'} · ${committeeSearchSnapshots.length} logical search${committeeSearchSnapshots.length === 1 ? '' : 'es'}${heldCount ? ` · ${heldCount} held source/facet${heldCount === 1 ? '' : 's'}` : ''}`
    : 'No committee search loaded.';
  const markup = identities.map((identity) => {
    let actions = '';
    if (identity.kind === 'Filer') {
      actions = `<button type="button" class="campaign-committee-result" data-load-campaign data-kind="local" data-committee-name="${escapeHtml(identity.name)}" data-source-id="${escapeHtml(identity.source_id || '')}"><strong>${escapeHtml(identity.name)}</strong><span>Load context → Contributions</span></button>${activityInspectButton(identity.committee, identity.candidate, identity.source_id)}`;
    } else if (identity.committee) actions = `${committeeLoadButton(identity.committee, identity.candidate)}${activityInspectButton(identity.committee, identity.candidate, identity.source_id)}`;
    else if (identity.candidate) actions = candidateLoadButton(identity.candidate);
    else if (identity.organization) actions = `<button type="button" class="opensecrets-result" data-opensecrets-summary data-org-id="${escapeHtml(identity.organization.org_id || '')}"><strong>${escapeHtml(identity.organization.name || 'Organization')}</strong><small>${escapeHtml(identity.organization.org_id || 'OpenSecrets')}</small></button>`;
    return `<article class="committee-workspace-row" data-kind="identity"><div><strong>${escapeHtml(identity.name || 'Identity not stated')}</strong><span>${escapeHtml(identity.kind)}</span><small>${escapeHtml(identity.meta || '')}</small></div><div class="committee-workspace-actions">${actions}</div></article>`;
  }).join('');
  const held = (latest?.source_results || []).filter((item) => item.status === 'HELD').map((item) => `<article class="committee-workspace-row held" data-kind="held"><div><strong>${escapeHtml(item.label || item.source_id || item.lane)}</strong><span>HELD</span><small>${escapeHtml(item.error || 'This route did not complete; successful routes remain visible.')}</small></div></article>`).join('');
  list.innerHTML = markup + held || '<span class="muted">No campaign or committee identities were observed in the loaded search.</span>';
  bindDynamicActions();
}

function captureCommitteeSearch(data, kind = 'MULTI') {
  if (!committeeHold) committeeSearchSnapshots = [];
  committeeSearchSnapshots.push({ kind, data, captured_at: new Date().toISOString() });
  renderCommitteeWorkspace();
}

function clearCommitteeWorkspace() {
  committeeSearchSnapshots = [];
  renderCommitteeWorkspace();
  $('#campaignDirectoryCandidates').innerHTML = '<span class="muted">Search to begin.</span>';
  $('#campaignDirectoryCommittees').innerHTML = '<span class="muted">Search to begin.</span>';
  $('#campaignDirectoryOpenSecrets').innerHTML = '<span class="muted">Search to begin.</span>';
  $('#campaignDirectoryOpenSecretsSummary').innerHTML = '';
  $('#campaignActivityResults').innerHTML = '';
  $('#campaignActivitySection').hidden = true;
  lookupStatus('Committee list cleared.');
}

function pendingCommitteeWorkspace(taskCount) {
  const summary = $('#committeeSearchWorkspaceSummary');
  const list = $('#committeeSearchWorkspaceList');
  if (summary) summary.textContent = `${taskCount} bounded route${taskCount === 1 ? '' : 's'} pending…`;
  if (list) list.innerHTML = '<span class="muted">Committee lookup is running. Contributions remain untouched.</span>';
}

function normalizeTaskResult(task, settled) {
  if (settled.status === 'rejected') {
    return {
      ...task,
      status: 'HELD',
      error: settled.reason?.message || String(settled.reason || 'Source route held'),
      data: null
    };
  }
  const data = settled.value?.data || settled.value;
  if (data?.held === true) return { ...task, status: 'HELD', error: data.reason || 'No wired source for this selected route.', data: null };
  const status = ['PARTIAL', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(data?.source_status) ? 'HELD' : 'READY';
  return { ...task, status, error: status === 'HELD' ? data?.source_error || data?.coverage_warning || 'Source returned partial or held coverage.' : null, data };
}

function dedupeBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key && !map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

function mergeLogicalLookup(taskResults) {
  const candidates = [];
  const committees = [];
  const organizations = [];
  const records = [];
  let openSecrets = { configured: false, status: 'HELD', reason: 'OpenSecrets not requested by the completed Federal route.', organizations: [] };
  for (const result of taskResults) {
    if (!result.data) continue;
    if (result.kind === 'FEDERAL') {
      candidates.push(...(result.data.candidates || []));
      committees.push(...(result.data.committees || []));
      if (result.data.opensecrets) {
        openSecrets = result.data.opensecrets;
        organizations.push(...(result.data.opensecrets.organizations || []));
      }
    } else {
      records.push(...(result.data.records || []));
    }
  }
  openSecrets = { ...openSecrets, organizations: dedupeBy(organizations, (item) => item.org_id || exactNameKey(item.name)) };
  return {
    schema: 'td613.giving.campaign-directory-logical-search/v1',
    candidates: dedupeBy(candidates, (item) => item.candidate_id || exactNameKey(item.name)),
    committees: dedupeBy(committees, (item) => item.committee_id || exactNameKey(item.name)),
    opensecrets: openSecrets,
    records: dedupeBy(records, (record) => record.record_digest || `${record.source_instance_id || ''}|${exactNameKey(record.filer || '')}|${record.date || ''}|${record.amount_cents ?? ''}`),
    source_results: taskResults.map((result) => ({
      lane: result.lane,
      kind: result.kind,
      state: result.state || null,
      source_id: result.sourceId || result.data?.source_instance_id || null,
      facet: result.facet || null,
      label: result.label || result.sourceId || result.state || result.lane,
      status: result.status,
      error: result.error,
      record_count: Array.isArray(result.data?.records) ? result.data.records.length : null,
      source_status: result.data?.source_status || null,
      results_may_be_incomplete: Boolean(result.data?.results_may_be_incomplete)
    }))
  };
}

function renderActivity(data) {
  const records = Array.isArray(data?.records) ? data.records : [];
  const section = $('#campaignActivitySection');
  section.hidden = false;
  $('#campaignActivityHeading').textContent = `${activityType() === 'EXPENDITURES' ? 'Expenditure' : 'Contribution'} receipts · separate committee activity lane`;
  const partial = (data?.source_results || []).some((item) => item.status === 'HELD' || item.results_may_be_incomplete);
  const warning = partial ? '<div class="campaign-activity-coverage-warning"><strong>Some selected source routes were held or partial.</strong><span>Successful source receipts remain visible. This is not a completeness or zero-activity claim.</span></div>' : '';
  const rows = records.length ? records.map((record) => `<article class="campaign-activity-row"><strong>${escapeHtml(record.filer || 'Filer not stated')}</strong><strong>${record.amount_cents == null ? 'amount unavailable' : escapeHtml(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(record.amount_cents / 100))}</strong><span>${escapeHtml(record.counterparty || 'Counterparty not stated')}</span><small>${escapeHtml([record.date, record.purpose, record.jurisdiction, record.source_instance_id].filter(Boolean).join(' · '))}${record.source_locator ? ` · <a href="${escapeHtml(record.source_locator)}" target="_blank" rel="noreferrer">source</a>` : ''}</small></article>`).join('') : '<span class="muted">No matching filer identity or activity row returned from the completed selected routes. Held routes remain explicit above; this is not a universal zero-activity claim.</span>';
  $('#campaignActivityResults').innerHTML = warning + rows;
}

function renderDirectory(data) {
  const candidates = data?.candidates || [];
  const committees = data?.committees || [];
  const openSecrets = data?.opensecrets || {};
  $('#campaignDirectoryCandidates').innerHTML = candidates.length ? candidates.map((candidate) => `<article class="campaign-directory-card"><div><strong>${escapeHtml(candidate.name)}</strong><small>${escapeHtml([candidate.candidate_id, candidate.office, candidate.state, candidate.district, candidate.party].filter(Boolean).join(' · '))}</small></div>${candidateLoadButton(candidate)}<div class="campaign-committee-results">${(candidate.principal_committees || []).map((committee) => `${committeeLoadButton(committee, candidate)}${activityInspectButton(committee, candidate)}`).join('') || '<span class="muted">No principal committee returned in this OpenFEC result.</span>'}</div></article>`).join('') : '<span class="muted">No matching Federal candidate identity returned from the completed routes.</span>';
  $('#campaignDirectoryCommittees').innerHTML = committees.length ? committees.map((committee) => `${committeeLoadButton(committee)}${activityInspectButton(committee)}`).join('') : '<span class="muted">No matching Federal committee / PC identity returned from the completed routes.</span>';
  $('#campaignDirectoryOpenSecrets').innerHTML = openSecrets.configured
    ? openSecrets.status === 'READY'
      ? (openSecrets.organizations || []).length
        ? openSecrets.organizations.map((org) => `<button type="button" class="opensecrets-result" data-opensecrets-summary data-org-id="${escapeHtml(org.org_id)}"><strong>${escapeHtml(org.name)}</strong><small>${escapeHtml(org.org_id)} · aggregate organization context</small></button>`).join('')
        : '<span class="muted">No OpenSecrets organization matches returned.</span>'
      : `<span class="muted">OpenSecrets held: ${escapeHtml(openSecrets.reason || 'upstream unavailable')}</span>`
    : '<span class="muted">OpenSecrets available after OPENSECRETS_API_KEY is configured in production.</span>';
  $('#campaignDirectoryOpenSecretsSummary').innerHTML = '';
  renderActivity(data);
  bindDynamicActions();
  captureCommitteeSearch(data);
  const held = (data.source_results || []).filter((item) => item.status === 'HELD');
  const ready = (data.source_results || []).length - held.length;
  lookupStatus(`${ready} route${ready === 1 ? '' : 's'} completed · ${held.length} held · ${candidates.length} candidate identities · ${committees.length} committees/PCs · ${(openSecrets.organizations || []).length} OpenSecrets organizations.`, held.length ? 'warning' : 'success');
}

function localTask(source, facet, query, lane) {
  return {
    kind: 'LOCAL', lane, sourceId: source.id, facet,
    label: `${source.id} · ${facet.toLowerCase()}`,
    run: () => api.call('committee-activity.search', {
      source_instance_id: source.id,
      activity_type: activityType(),
      query: {
        start_date: $('#dateFrom')?.value || '2020-01-01',
        end_date: $('#dateTo')?.value || new Date().toISOString().slice(0, 10),
        page_size: 100,
        ...(facet === 'CANDIDATE' ? { candidate: query } : { committee: query })
      }
    }, { mutation: false, purpose: `search ${lane.toLowerCase()} ${facet.toLowerCase()} activity projection` })
  };
}

function buildLookupTasks(query) {
  const lanes = checkedJurisdictions();
  const tasks = [];
  if (lanes.has('FEDERAL')) {
    const states = selectedCampaignStates.size ? [...selectedCampaignStates] : [null];
    states.forEach((state, index) => tasks.push({
      kind: 'FEDERAL', lane: 'FEDERAL', state,
      label: state ? `Federal · ${state}` : 'Federal · all states',
      run: () => api.call('campaign-directory.search', {
        query,
        ...(state ? { state } : {}),
        include_opensecrets: index === 0
      }, { mutation: false, purpose: `search reviewed federal candidate and committee identities${state ? ` in ${state}` : ''}` })
    }));
  }
  if (lanes.has('STATE')) {
    for (const code of selectedCampaignStates) {
      const sources = stateSources(code);
      if (!sources.length) {
        tasks.push({ kind: 'LOCAL', lane: 'STATE', state: code, label: `State · ${code}`, run: async () => ({ held: true, reason: `No wired state contribution custodian is registered for ${code}.` }) });
        continue;
      }
      for (const source of sources) {
        tasks.push(localTask(source, 'CANDIDATE', query, 'STATE'));
        tasks.push(localTask(source, 'COMMITTEE', query, 'STATE'));
      }
    }
  }
  if (lanes.has('MUNICIPAL')) {
    for (const sourceId of selectedMunicipalSourceIds) {
      const source = municipalSources().find((item) => item.id === sourceId);
      if (!source) {
        tasks.push({ kind: 'LOCAL', lane: 'MUNICIPAL', sourceId, label: sourceId, run: async () => ({ held: true, reason: 'Selected municipal source is no longer available in the current registry.' }) });
        continue;
      }
      tasks.push(localTask(source, 'CANDIDATE', query, 'MUNICIPAL'));
      tasks.push(localTask(source, 'COMMITTEE', query, 'MUNICIPAL'));
    }
  }
  return tasks;
}

async function searchDirectory(event) {
  event?.preventDefault();
  event?.stopImmediatePropagation?.();
  const query = String($('#campaignDirectoryQuery')?.value || '').trim();
  if (query.length < 2) return lookupStatus('Enter at least two characters to search candidates, campaigns, and PCs.', 'error');
  await hydrateCampaignRegistry();
  const lanes = checkedJurisdictions();
  if (!lanes.size) return lookupStatus('Choose at least one filing jurisdiction.', 'error');
  if (lanes.has('STATE') && !selectedCampaignStates.size) return lookupStatus('Choose at least one state, or use All in the State picker.', 'error');
  if (lanes.has('MUNICIPAL') && !selectedMunicipalSourceIds.size) return lookupStatus('Choose at least one municipal source, or use All in the Municipal picker.', 'error');

  document.querySelector('[data-view="ledger"]')?.click();
  const tasks = buildLookupTasks(query);
  if (!tasks.length) return lookupStatus('No bounded lookup route was selected.', 'error');
  pendingCommitteeWorkspace(tasks.length);
  setBusy(true);
  lookupStatus(`Running ${tasks.length} bounded candidate / committee route${tasks.length === 1 ? '' : 's'}…`);
  try {
    const settled = await Promise.allSettled(tasks.map((task) => task.run()));
    const taskResults = settled.map((result, index) => normalizeTaskResult(tasks[index], result));
    renderDirectory(mergeLogicalLookup(taskResults));
  } catch (error) {
    lookupStatus(error?.message || 'Campaign / PC lookup did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

async function inspectCommitteeActivity(button) {
  setBusy(true);
  const type = activityType();
  const sourceId = button.dataset.sourceId || 'fec-schedule-a';
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
    renderActivity({ ...data, source_results: [{ status: ['PARTIAL', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(data?.source_status) ? 'HELD' : 'READY', source_id: sourceId }] });
    lookupStatus(`${data.record_count || 0} ${activityLabel(type)} returned from ${sourceId}.`, data?.source_status === 'PARTIAL' ? 'warning' : 'success');
  } catch (error) {
    lookupStatus(error?.message || 'Committee activity lookup did not complete.', 'error');
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
    designation: button.dataset.designation || null,
    source_id: button.dataset.sourceId || null
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
  const metadata = [loadedContext.candidate_name && loadedContext.committee_name ? loadedContext.candidate_name : null, loadedContext.candidate_id, loadedContext.committee_id, loadedContext.committee_type, loadedContext.designation, loadedContext.source_id].filter(Boolean).join(' · ');
  if (contributionNode) {
    contributionNode.dataset.loaded = 'true';
    contributionNode.innerHTML = `<span class="eyebrow">LOADED CAMPAIGN / COMMITTEE</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(metadata || 'Reviewed filing identity')}</small>`;
  }
  if (deputyNode) deputyNode.textContent = loadedContext.committee_id
    ? `${title} · ${loadedContext.committee_id} is ready for one-touch committee sync.`
    : `${title} is loaded as local/candidate context. Campaign Deputy committee sync requires an exact reviewed FEC committee ID.`;
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

function installSelectionControls() {
  renderCampaignStateMenu();
  $('#campaignDirectoryStateMenu')?.addEventListener('change', (event) => {
    const input = event.target.closest?.('input[type="checkbox"]');
    if (!input) return;
    if (input.checked) selectedCampaignStates.add(input.value);
    else selectedCampaignStates.delete(input.value);
    updateStateSummary();
  });
  $('#campaignDirectoryStateAll')?.addEventListener('click', () => {
    selectedCampaignStates.clear();
    for (const [code] of stateRows()) selectedCampaignStates.add(code);
    renderCampaignStateMenu();
  });
  $('#campaignDirectoryStateClear')?.addEventListener('click', () => {
    selectedCampaignStates.clear();
    renderCampaignStateMenu();
  });
  $('#campaignDirectoryMunicipalMenu')?.addEventListener('change', (event) => {
    const input = event.target.closest?.('input[type="checkbox"]');
    if (!input) return;
    if (input.checked) selectedMunicipalSourceIds.add(input.value);
    else selectedMunicipalSourceIds.delete(input.value);
    updateMunicipalSummary();
  });
  $('#campaignDirectoryMunicipalAll')?.addEventListener('click', () => {
    selectedMunicipalSourceIds.clear();
    for (const source of municipalSources()) selectedMunicipalSourceIds.add(source.id);
    renderMunicipalMenu();
  });
  $('#campaignDirectoryMunicipalClear')?.addEventListener('click', () => {
    selectedMunicipalSourceIds.clear();
    renderMunicipalMenu();
  });
}

function install() {
  renderCommitteeHoldState();
  renderCommitteeWorkspace();
  installSelectionControls();
  $('#campaignDirectoryForm')?.addEventListener('submit', searchDirectory, { capture: true });
  $$('[name="campaign-directory-jurisdiction"], [name="campaign-directory-activity"]').forEach((input) => input.addEventListener('change', () => {
    $('#campaignActivitySection').hidden = true;
    renderCommitteeWorkspace();
    lookupStatus(`${activityLabel()} selected. Only checked jurisdiction lanes will run; expenditures remain separate from donor Giving History.`);
  }));
  $('#syncLoadedCommitteeButton')?.addEventListener('click', syncLoadedCommittee);
  $('#bulkExactContactsButton')?.addEventListener('click', bulkSyncExactContacts);
  $('#bulkGivingHistoryButton')?.addEventListener('click', prepareBulkGivingHistoryExactContacts);
  $('#holdCommitteeButton')?.addEventListener('click', () => {
    committeeHold = !committeeHold;
    renderCommitteeHoldState();
    lookupStatus(committeeHold ? 'Committee list held. Later logical searches append.' : 'Committee hold released. The next logical committee search replaces the list.');
  });
  $('#clearCommitteeListButton')?.addEventListener('click', () => {
    if (!window.confirm('Clear List?')) return;
    clearCommitteeWorkspace();
  });
  renderLoadedContext();
  const openRegistry = () => {
    if (document.documentElement.dataset.session === 'open') hydrateCampaignRegistry().catch(() => {});
  };
  const observer = new MutationObserver(openRegistry);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-session'] });
  openRegistry();
}

install();
