import { GivingApiClient } from './giving-api.js';
import { normalizeName } from './giving-model.js';

const api = new GivingApiClient({ timeoutMs: 22000 });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function exactNameKey(value) {
  const normalized = normalizeName(value);
  return `${normalized.canonical}|${normalized.suffix || ''}`;
}

function personDisplay(person) {
  if (typeof person?.name === 'string') return person.name.trim();
  if (person?.name && typeof person.name === 'object') {
    return [person.name.givenName, person.name.middleName, person.name.familyName, person.name.suffix].filter(Boolean).join(' ').trim();
  }
  return String(person?.displayName || person?.fullName || person?.nameDisplay || '').trim();
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount) : '—';
}

function status(message, kind = 'info') {
  const node = $('#campaignToolsStatus');
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
}

function setBusy(busy) {
  for (const button of $$('#campaignDirectorySearchButton, #bulkExactContactsButton, [data-integrate-committee], [data-opensecrets-summary]')) {
    button.disabled = Boolean(busy);
  }
}

function committeeButton(committee, candidateId = '') {
  if (!committee?.committee_id || !committee?.name) return '';
  return `<button type="button" class="campaign-committee-result" data-integrate-committee
    data-committee-id="${escapeHtml(committee.committee_id)}"
    data-committee-name="${escapeHtml(committee.name)}"
    data-candidate-id="${escapeHtml(candidateId)}"
    data-committee-type="${escapeHtml(committee.committee_type_full || committee.committee_type || '')}"
    data-designation="${escapeHtml(committee.designation_full || committee.designation || '')}">
      <strong>${escapeHtml(committee.name)}</strong>
      <small>${escapeHtml(committee.committee_id)}${committee.committee_type_full || committee.committee_type ? ` · ${escapeHtml(committee.committee_type_full || committee.committee_type)}` : ''}${committee.designation_full || committee.designation ? ` · ${escapeHtml(committee.designation_full || committee.designation)}` : ''}</small>
      <span>Integrate committee → Campaign Deputy</span>
    </button>`;
}

function renderDirectory(data) {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  const committees = Array.isArray(data?.committees) ? data.committees : [];
  const openSecrets = data?.opensecrets || {};
  const candidateHtml = candidates.length ? candidates.map((candidate) => `<article class="campaign-directory-card">
    <div><strong>${escapeHtml(candidate.name)}</strong><small>${escapeHtml([candidate.candidate_id, candidate.office, candidate.state, candidate.district, candidate.party].filter(Boolean).join(' · '))}</small></div>
    <div class="campaign-committee-results">${(candidate.principal_committees || []).map((committee) => committeeButton(committee, candidate.candidate_id)).join('') || '<span class="muted">No principal committee returned in this OpenFEC result.</span>'}</div>
  </article>`).join('') : '<span class="muted">No candidate matches returned.</span>';
  const committeeHtml = committees.length ? committees.map((committee) => committeeButton(committee)).join('') : '<span class="muted">No committee / PC matches returned.</span>';
  const openSecretsHtml = openSecrets.configured
    ? openSecrets.status === 'READY'
      ? (openSecrets.organizations || []).length
        ? openSecrets.organizations.map((org) => `<button type="button" class="opensecrets-result" data-opensecrets-summary data-org-id="${escapeHtml(org.org_id)}"><strong>${escapeHtml(org.name)}</strong><small>${escapeHtml(org.org_id)} · aggregate organization context</small></button>`).join('')
        : '<span class="muted">No OpenSecrets organization matches returned.</span>'
      : `<span class="muted">OpenSecrets held: ${escapeHtml(openSecrets.reason || 'upstream unavailable')}</span>`
    : '<span class="muted">OpenSecrets available after OPENSECRETS_API_KEY is configured in production.</span>';

  $('#campaignDirectoryCandidates').innerHTML = candidateHtml;
  $('#campaignDirectoryCommittees').innerHTML = committeeHtml;
  $('#campaignDirectoryOpenSecrets').innerHTML = openSecretsHtml;
  bindDynamicActions();
  status(`${candidates.length} candidates · ${committees.length} committees/PCs · ${(openSecrets.organizations || []).length} OpenSecrets organizations.`);
}

async function searchDirectory(event) {
  event?.preventDefault();
  const query = String($('#campaignDirectoryQuery')?.value || '').trim();
  if (query.length < 2) return status('Enter at least two characters to search candidates, campaigns, and PCs.', 'error');
  setBusy(true);
  status('Searching OpenFEC and OpenSecrets…');
  try {
    const result = await api.call('campaign-directory.search', { query }, { mutation: false, purpose: 'search reviewed campaign and committee identities' });
    renderDirectory(result?.data || result);
  } catch (error) {
    status(error?.message || 'Campaign / PC lookup did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

async function integrateCommittee(button) {
  const payload = {
    confirmed: true,
    committee_id: button.dataset.committeeId,
    committee_name: button.dataset.committeeName,
    candidate_id: button.dataset.candidateId || null,
    committee_type: button.dataset.committeeType || null,
    designation: button.dataset.designation || null
  };
  setBusy(true);
  status(`Integrating ${payload.committee_name} into Campaign Deputy…`);
  try {
    await api.status();
    const result = await api.call('campaign-deputy.ensure-committee', payload, {
      mutation: true,
      purpose: `explicitly create or reuse Campaign Deputy committee list for ${payload.committee_id}`
    });
    const data = result?.data || result;
    const receipt = data?.receipt || result?.receipt;
    status(`${payload.committee_name}: ${receipt?.action === 'COMMITTEE_LIST_CREATED' ? 'Campaign Deputy committee list created' : 'existing Campaign Deputy committee list reused'} · ${payload.committee_id}.`, 'success');
  } catch (error) {
    status(error?.message || 'Campaign Deputy committee integration did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

async function showOpenSecretsSummary(button) {
  setBusy(true);
  status(`Loading OpenSecrets aggregate summary for ${button.textContent.trim()}…`);
  try {
    const result = await api.call('campaign-directory.opensecrets-summary', { org_id: button.dataset.orgId }, { mutation: false, purpose: 'inspect OpenSecrets aggregate organization summary' });
    const item = result?.data || result;
    $('#campaignDirectoryOpenSecretsSummary').innerHTML = `<article class="opensecrets-summary">
      <strong>${escapeHtml(item.name || item.org_id)}</strong>
      <small>${escapeHtml(item.org_id)} · cycle ${escapeHtml(item.cycle || '—')}</small>
      <div><span>Total ${money(item.total)}</span><span>Individuals ${money(item.individuals)}</span><span>PACs ${money(item.pacs)}</span><span>Lobbying ${money(item.lobbying)}</span><span>Outside ${money(item.outside)}</span><span>To candidates ${money(item.gave_to_candidates)}</span></div>
      <p>Aggregate OpenSecrets organization context; not an individual donor transaction.</p>
    </article>`;
    status(`OpenSecrets summary loaded for ${item.name || item.org_id}.`);
  } catch (error) {
    status(error?.message || 'OpenSecrets summary did not complete.', 'error');
  } finally {
    setBusy(false);
  }
}

function waitFor(condition, { timeoutMs = 18000, intervalMs = 80 } = {}) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      try {
        const value = condition();
        if (value) return resolve(value);
      } catch {}
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
  return pages;
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
  status('Loading the complete Campaign Deputy people index for exact-name resolution…');
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
      if (!committees.length) {
        held.push(`${target.name}: no confirmed committees`);
        continue;
      }
      const matches = exactPersonCandidates(target.name);
      if (matches.length !== 1) {
        held.push(`${target.name}: ${matches.length ? 'ambiguous exact Campaign Deputy name' : 'no exact Campaign Deputy person'}`);
        continue;
      }
      for (const committee of committees) {
        await linkCommitteeForCurrentTarget(matches[0].radio.value, committee);
        relationships += 1;
      }
      syncedTargets += 1;
    }
    if (originalTarget && [...targetSelect.options].some((option) => option.value === originalTarget)) await selectTarget(originalTarget);
    const holdText = held.length ? ` · ${held.length} held (${held.slice(0, 3).join('; ')}${held.length > 3 ? '; …' : ''})` : '';
    status(`${syncedTargets} contacts synced across ${relationships} reviewed committee relationships${holdText}.`, held.length ? 'warning' : 'success');
  } catch (error) {
    status(`${syncedTargets} contacts / ${relationships} relationships completed before bulk sync held: ${error?.message || error}`, 'error');
  } finally {
    bulkButton.textContent = 'Sync all exact-match contacts';
    setBusy(false);
  }
}

function bindDynamicActions() {
  $$('[data-integrate-committee]').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => integrateCommittee(button));
  });
  $$('[data-opensecrets-summary]').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => showOpenSecretsSummary(button));
  });
}

function install() {
  const campaign = $('#view-campaign');
  const targetPanel = campaign?.querySelector('.campaign-target-panel');
  if (!campaign || !targetPanel || $('#campaignDirectoryPanel')) return;
  const panel = document.createElement('section');
  panel.id = 'campaignDirectoryPanel';
  panel.className = 'campaign-directory-panel';
  panel.innerHTML = `
    <div class="campaign-directory-heading">
      <div><p class="eyebrow">CAMPAIGN / PC IDENTITY</p><h3>Candidate & committee lookup</h3></div>
      <span>OpenFEC + OpenSecrets</span>
    </div>
    <form id="campaignDirectoryForm" class="campaign-directory-form">
      <label class="field grow"><span>Candidate, campaign, PAC or political committee</span><input id="campaignDirectoryQuery" type="search" autocomplete="off" placeholder="Search federal candidate or committee"></label>
      <button class="button primary" id="campaignDirectorySearchButton" type="submit">Search</button>
    </form>
    <p class="fine-print">OpenFEC provides exact federal candidate / committee identities. OpenSecrets adds aggregate organization context when its API key is configured; aggregate OpenSecrets results never become donor transactions.</p>
    <div class="campaign-directory-columns">
      <section><h4>Candidates + principal committees</h4><div id="campaignDirectoryCandidates" class="campaign-directory-results"><span class="muted">Search to begin.</span></div></section>
      <section><h4>Committees / campaigns / PCs</h4><div id="campaignDirectoryCommittees" class="campaign-directory-results"><span class="muted">Search to begin.</span></div></section>
      <section><h4>OpenSecrets organizations</h4><div id="campaignDirectoryOpenSecrets" class="campaign-directory-results"><span class="muted">Search to begin.</span></div><div id="campaignDirectoryOpenSecretsSummary"></div></section>
    </div>
    <div id="campaignToolsStatus" class="campaign-tools-status" role="status">Ready for campaign / PC lookup.</div>`;
  targetPanel.insertAdjacentElement('afterend', panel);

  const syncButton = $('#syncTargetButton');
  if (syncButton && !$('#bulkExactContactsButton')) {
    const bulk = document.createElement('button');
    bulk.id = 'bulkExactContactsButton';
    bulk.type = 'button';
    bulk.className = 'button wide bulk-exact-contacts-button';
    bulk.textContent = 'Sync all exact-match contacts';
    bulk.title = 'Load the complete Campaign Deputy people index, resolve each Giving target only when exactly one Campaign Deputy person has the same normalized name, and sync that target’s confirmed committee relationships. Missing or ambiguous targets are held.';
    syncButton.insertAdjacentElement('afterend', bulk);
    bulk.addEventListener('click', bulkSyncExactContacts);
  }

  $('#campaignDirectoryForm').addEventListener('submit', searchDirectory);

  const style = document.createElement('style');
  style.id = 'givingCampaignToolsStyle';
  style.textContent = `
    .campaign-directory-panel{margin:14px 0;padding:14px;border:1px solid rgba(118,234,212,.18);background:rgba(2,18,13,.52)}
    .campaign-directory-heading{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.campaign-directory-heading h3{margin:2px 0 0}.campaign-directory-heading>span{font:700 9px/1.2 var(--mono);color:var(--muted)}
    .campaign-directory-form{display:flex;gap:8px;align-items:flex-end;margin:12px 0}.campaign-directory-form .grow{flex:1}
    .campaign-directory-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.campaign-directory-columns>section{min-width:0}.campaign-directory-columns h4{margin:0 0 7px;font-size:11px}
    .campaign-directory-results{display:grid;gap:6px}.campaign-directory-card{display:grid;gap:7px;padding:8px;border:1px solid rgba(255,255,255,.08)}.campaign-directory-card small,.campaign-committee-result small,.opensecrets-result small{display:block;color:var(--muted);margin-top:2px}
    .campaign-committee-results{display:grid;gap:5px}.campaign-committee-result,.opensecrets-result{width:100%;text-align:left;border:1px solid rgba(118,234,212,.14);background:rgba(4,24,18,.72);color:var(--text);padding:8px;cursor:pointer}.campaign-committee-result:hover,.campaign-committee-result:focus-visible,.opensecrets-result:hover,.opensecrets-result:focus-visible{border-color:rgba(118,234,212,.45);outline:none}.campaign-committee-result>span{display:block;margin-top:5px;color:var(--bright);font:700 9px/1.2 var(--mono);text-transform:uppercase}
    .opensecrets-summary{margin-top:8px;padding:9px;border:1px solid rgba(255,255,255,.09)}.opensecrets-summary>div{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}.opensecrets-summary>div span{padding:3px 5px;background:rgba(255,255,255,.04);font:700 9px/1.2 var(--mono)}.opensecrets-summary p{margin:7px 0 0;color:var(--muted);font-size:9px}
    .campaign-tools-status{margin-top:10px;padding:7px 8px;border-left:2px solid rgba(118,234,212,.4);color:var(--muted);font:700 9px/1.4 var(--mono)}.campaign-tools-status[data-kind="error"]{border-color:var(--danger,#ff8f86);color:var(--danger,#ffaaa2)}.campaign-tools-status[data-kind="success"]{color:var(--bright)}.campaign-tools-status[data-kind="warning"]{color:#f0cf8a}
    .bulk-exact-contacts-button{margin-top:7px}
    @media(max-width:1080px){.campaign-directory-columns{grid-template-columns:1fr 1fr}.campaign-directory-columns>section:last-child{grid-column:1/-1}}
    @media(max-width:760px){.campaign-directory-form{align-items:stretch;flex-direction:column}.campaign-directory-columns{grid-template-columns:1fr}.campaign-directory-columns>section:last-child{grid-column:auto}}
  `;
  document.head.append(style);
}

install();
