const PRACTICE_FIXTURE_ID = 'giving.bikini-bottom-practice/v0.1';
const PRACTICE_SOURCE_ID = 'practice-bikini-bottom-votes';
const PRACTICE_SOURCE = Object.freeze({
  id: PRACTICE_SOURCE_ID,
  family: 'FICTIONAL PRACTICE',
  custodian: 'BikiniBottomVotes',
  jurisdiction: 'Bikini Bottom · Oceania',
  electronic_scope: 'Manifestly fictional practice contributions',
  state: 'READY'
});

const PEOPLE = Object.freeze({
  'SpongeBob SquarePants': {
    address: '124 Conch Street · FICTIONAL PINEAPPLE',
    given: 'SpongeBob', family: 'SquarePants', employer: 'Krusty Krab · FICTIONAL', occupation: 'Fry Cook · FICTIONAL'
  },
  'Patrick Star': {
    address: '120 Conch Street · FICTIONAL ROCK',
    given: 'Patrick', family: 'Star', employer: 'Self · FICTIONAL', occupation: 'Professional Lounger · FICTIONAL'
  },
  'Sandy Cheeks': {
    address: '1 Treedome Way · FICTIONAL AIR DOME',
    given: 'Sandy', family: 'Cheeks', employer: 'Treedome Research Lab · FICTIONAL', occupation: 'Scientist · FICTIONAL'
  },
  'Eugene H. Krabs': {
    address: '1 Krusty Krab Plaza · FICTIONAL RESTAURANT',
    given: 'Eugene', middle: 'H.', family: 'Krabs', employer: 'Krusty Krab · FICTIONAL', occupation: 'Restaurateur · FICTIONAL'
  },
  'Squidward Q. Tentacles': {
    address: '122 Conch Street · FICTIONAL MOAI',
    given: 'Squidward', middle: 'Q.', family: 'Tentacles', employer: 'Krusty Krab · FICTIONAL', occupation: 'Cashier / Clarinetist · FICTIONAL'
  }
});

const TX = Object.freeze({
  'SpongeBob SquarePants': [
    ['2020-03-14', 500, 'Mrs. Puff for Bikini Bottom School District #67'],
    ['2020-07-04', 1000, 'Larry Lobster for Mayor of Bikini Bottom'],
    ['2021-02-01', 500, 'Friends of Aquaman PC'],
    ['2021-08-21', 1500, 'Mrs. Puff for Bikini Bottom School District #67'],
    ['2022-01-15', 1000, 'Fishocratic Executive Committee'],
    ['2022-11-08', 2500, 'Larry Lobster for Mayor of Bikini Bottom'],
    ['2023-04-17', 1000, 'Friends of Aquaman PC'],
    ['2023-09-09', 2000, 'King Neptune for King'],
    ['2024-02-03', 2500, 'Mrs. Puff for Bikini Bottom School District #67'],
    ['2024-10-12', 1500, 'Fishocratic Executive Committee'],
    ['2025-03-15', 2500, 'Krusty Krab Parking Expansion Referendum Committee'],
    ['2025-06-01', 2500, 'Larry Lobster for Mayor of Bikini Bottom'],
    ['2026-07-04', 5000, 'Friends of Aquaman PC']
  ],
  'Patrick Star': [
    ['2020-05-02', 300, 'King Neptune for King'],
    ['2020-11-03', 500, 'Larry Lobster for Mayor of Bikini Bottom'],
    ['2021-07-18', 500, 'Fishocratic Executive Committee'],
    ['2022-04-23', 1000, 'King Neptune for King'],
    ['2023-11-07', 1500, 'Larry Lobster for Mayor of Bikini Bottom'],
    ['2024-04-01', 700, 'Krusty Krab Parking Expansion Referendum Committee'],
    ['2024-06-22', 500, 'Friends of Aquaman PC'],
    ['2025-10-31', 2000, 'Fishocratic Executive Committee'],
    ['2026-05-16', 1000, 'Larry Lobster for Mayor of Bikini Bottom']
  ],
  'Sandy Cheeks': [
    ['2020-02-29', 25000, 'Mrs. Puff for Bikini Bottom School District #67'],
    ['2020-10-10', 50000, 'Friends of Aquaman PC'],
    ['2021-04-12', 75000, 'Larry Lobster for Mayor of Bikini Bottom'],
    ['2021-12-05', 100000, 'Fishocratic Executive Committee'],
    ['2022-08-19', 50000, 'King Neptune for King'],
    ['2023-03-03', 125000, 'Friends of Aquaman PC'],
    ['2023-12-16', 75000, 'Mrs. Puff for Bikini Bottom School District #67'],
    ['2024-09-01', 150000, 'Larry Lobster for Mayor of Bikini Bottom'],
    ['2025-04-26', 100000, 'Fishocratic Executive Committee'],
    ['2026-02-14', 50000, 'Krusty Krab Parking Expansion Referendum Committee'],
    ['2026-06-13', 200000, 'King Neptune for King']
  ],
  'Eugene H. Krabs': [
    ['2020-01-31', 250000, 'Fishocratic Executive Committee'],
    ['2021-01-31', 500000, 'Fishocratic Executive Committee'],
    ['2022-01-31', 300000, 'Fishocratic Executive Committee'],
    ['2023-01-31', 750000, 'Fishocratic Executive Committee'],
    ['2024-01-31', 500000, 'Fishocratic Executive Committee'],
    ['2025-01-31', 1000000, 'Fishocratic Executive Committee'],
    ['2026-01-31', 750000, 'Fishocratic Executive Committee']
  ],
  'Squidward Q. Tentacles': [
    ['2020-09-15', 10000, 'Every Villain Is Lemons PAC'],
    ['2021-05-09', 25000, 'Sheldon Plankton for Bikini Bottom Campaign'],
    ['2022-02-20', 15000, 'Every Villain Is Lemons PAC'],
    ['2022-12-11', 10000, 'Friends of Aquaman PC'],
    ['2023-08-06', 50000, 'Sheldon Plankton for Bikini Bottom Campaign'],
    ['2023-10-31', 5000, 'Krusty Krab Parking Expansion Referendum Committee'],
    ['2024-05-19', 25000, 'Every Villain Is Lemons PAC'],
    ['2025-09-27', 50000, 'Friends of Aquaman PC'],
    ['2026-03-08', 75000, 'Sheldon Plankton for Bikini Bottom Campaign']
  ]
});

let active = false;
const practiceVault = new Map();
const originalSelections = new Set();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();

function safeToken(value) {
  return compact(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function recordFor(name, [date, amountCents, committee], index) {
  const person = PEOPLE[name];
  const token = `${safeToken(name)}-${date}-${index + 1}`;
  const referendum = /Referendum Committee$/i.test(committee);
  return {
    digest: `practice:${PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: {
      display: name,
      given: person.given,
      middle: person.middle || null,
      family: person.family,
      suffix: null
    },
    address: person.address,
    city: 'Bikini Bottom',
    state: 'Oceania',
    zip: 'X',
    employer: person.employer,
    occupation: person.occupation,
    committee,
    committee_name: committee,
    committee_kind: referendum ? 'ISSUE_REFERENDUM' : 'CANDIDATE_OR_POLITICAL_COMMITTEE',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    office: referendum ? 'Issue / referendum · FICTIONAL' : /Mayor/.test(committee) ? 'Mayor of Bikini Bottom · FICTIONAL' : /School District/.test(committee) ? 'School District #67 · FICTIONAL' : null,
    cycle: date.slice(0, 4),
    election: `${date.slice(0, 4)} fictional cycle`,
    contribution_date: date,
    contribution_type: amountCents <= 2500 ? 'FICTIONAL SMALL-DOLLAR' : 'FICTIONAL CONTRIBUTION',
    amount_cents: amountCents,
    source_family: 'FICTIONAL_PRACTICE',
    source_instance_id: PRACTICE_SOURCE_ID,
    custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE',
    retrieved_at: new Date().toISOString(),
    source_native_ids: { practice_record_id: token },
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      evidence_authority: false,
      consequence_authority: false,
      external_retrieval: false,
      source_projection: 'BikiniBottomVotes'
    }
  };
}

function recordsFor(name) {
  const canonical = compact(name).toLocaleLowerCase('en-US');
  const match = Object.keys(TX).find((candidate) => candidate.toLocaleLowerCase('en-US') === canonical);
  return match ? TX[match].map((row, index) => recordFor(match, row, index)) : [];
}

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function parseEnvelope(init) {
  try { return typeof init?.body === 'string' ? JSON.parse(init.body) : null; } catch { return null; }
}

function practiceDelay(name) {
  const override = Number(globalThis.__TD613_GIVING_PRACTICE_DELAY_MS__);
  if (Number.isFinite(override) && override >= 0 && override <= 16000) return Math.floor(override);
  let hash = 0;
  for (const character of compact(name)) hash = (Math.imul(hash, 33) + character.charCodeAt(0)) >>> 0;
  return 8000 + (hash % 8001);
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(done, ms);
    function done() {
      signal?.removeEventListener('abort', abort);
      resolve();
    }
    function abort() {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(signal.reason || new DOMException('Practice search cancelled.', 'AbortError'));
    }
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });
  });
}

function practiceReceipt(event, extra = {}) {
  return {
    schema: 'td613.giving.practice-receipt/v1',
    at: new Date().toISOString(),
    event,
    practice_fixture_id: PRACTICE_FIXTURE_ID,
    manifestly_fictional: true,
    external_mutation: false,
    evidence_authority: false,
    consequence_authority: false,
    ...extra
  };
}

function vaultRow(payload) {
  const meta = payload?.wrapped_key?.envelope_meta || {};
  return {
    dossier_id: payload.dossier_id,
    version_id: payload.version_id,
    dossier_version: meta.dossier_version,
    ciphertext: payload.ciphertext,
    wrapped_key: payload.wrapped_key,
    crypto: payload.crypto,
    content_digest: payload.content_digest,
    custody_mode: payload.custody_mode,
    created_at: meta.created_at || new Date().toISOString(),
    practice_fixture_id: PRACTICE_FIXTURE_ID,
    manifestly_fictional: true
  };
}

function practiceVaultResponse(envelope) {
  const operation = envelope.operation;
  const payload = envelope.payload || {};
  if (operation === 'vault.write' || operation === 'vault.resolve-conflict') {
    const row = vaultRow(payload);
    practiceVault.set(row.version_id, row);
    return response({
      ok: true,
      data: { version_id: row.version_id, dossier_version: row.dossier_version, created_at: row.created_at, practice: true },
      receipt: practiceReceipt('PRACTICE_VAULT_WRITE', { version_id: row.version_id, browser_encrypted: true })
    });
  }
  if (operation === 'vault.list') {
    const versions = [...practiceVault.values()]
      .filter((row) => !payload.dossier_id || row.dossier_id === payload.dossier_id)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return response({ ok: true, data: { versions }, receipt: practiceReceipt('PRACTICE_VAULT_LIST', { version_count: versions.length }) });
  }
  if (operation === 'vault.read') {
    const row = practiceVault.get(payload.version_id);
    if (!row) return response({ ok: false, error: { code: 'PRACTICE_VAULT_VERSION_MISSING', message: 'That fictional Vault version is not present in this browser practice session.' } }, 404);
    return response({ ok: true, data: row, receipt: practiceReceipt('PRACTICE_VAULT_READ', { version_id: row.version_id }) });
  }
  return null;
}

const priorFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init = {}) => {
  const envelope = parseEnvelope(init);
  if (!active || !envelope?.operation) return priorFetch(input, init);

  if (envelope.operation === 'search.page' && envelope.payload?.source_instance_id === PRACTICE_SOURCE_ID) {
    const name = compact(envelope.payload?.query?.name);
    await sleep(practiceDelay(name), init.signal);
    const records = recordsFor(name);
    const completedAt = new Date().toISOString();
    return response({
      ok: true,
      data: {
        page: {
          records,
          continuation: null,
          source_status: 'READY',
          coverage: 'FICTIONAL PRACTICE · 2020 → 2026 · BikiniBottomVotes',
          practice_projection: true
        }
      },
      receipt: practiceReceipt('PRACTICE_RETRIEVAL_COMPLETE', {
        source_instance_id: PRACTICE_SOURCE_ID,
        query_name: name,
        record_count: records.length,
        completed_at: completedAt,
        external_retrieval: false
      })
    });
  }

  if (envelope.operation.startsWith('vault.')) {
    const handled = practiceVaultResponse(envelope);
    if (handled) return handled;
  }

  if (envelope.operation.startsWith('campaign-deputy.')) {
    return response({
      ok: false,
      error: {
        code: 'PRACTICE_AUTHORITY_CLOSED',
        message: 'Campaign Deputy stays closed during the Bikini Bottom practice case. Exit the demo before any real CRM action.'
      },
      receipt: practiceReceipt('PRACTICE_DOMAIN_MUTATION_REFUSED', { operation: envelope.operation })
    }, 409);
  }

  return priorFetch(input, init);
};

function registerPracticeSource() {
  document.dispatchEvent(new CustomEvent('td613:giving-practice-source-registry', {
    detail: { action: 'register', source: PRACTICE_SOURCE }
  }));
}

function setOnlyPracticeSource() {
  originalSelections.clear();
  for (const input of $$('#sourceRegistry input[type="checkbox"]')) {
    if (input.checked && input.value !== PRACTICE_SOURCE_ID) originalSelections.add(input.value);
    input.checked = input.value === PRACTICE_SOURCE_ID;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function installExitMembrane() {
  const picker = $('.source-picker');
  if (!picker) return;
  picker.classList.add('practice-source-locked');
  if ($('#practiceExitMembrane')) return;
  const membrane = document.createElement('div');
  membrane.id = 'practiceExitMembrane';
  membrane.className = 'practice-exit-membrane';
  membrane.innerHTML = `
    <button class="practice-exit-button" id="practiceExitButton" type="button">exit demo</button>
    <div class="practice-exit-confirm" id="practiceExitConfirm" role="dialog" aria-label="Exit Sample Demo?" hidden>
      <strong>Exit Sample Demo?</strong>
      <small>The fictional working view will clear. Any local file you explicitly saved remains in Saved local files.</small>
      <div><button type="button" data-practice-exit="yes">Yes</button><button type="button" data-practice-exit="no">No</button></div>
    </div>`;
  picker.append(membrane);
  $('#practiceExitButton')?.addEventListener('click', () => {
    const confirm = $('#practiceExitConfirm');
    confirm.hidden = false;
    confirm.querySelector('[data-practice-exit="no"]')?.focus();
  });
  $('[data-practice-exit="no"]')?.addEventListener('click', () => { $('#practiceExitConfirm').hidden = true; });
  $('[data-practice-exit="yes"]')?.addEventListener('click', exitPractice);
}

function activatePractice() {
  if (active) return;
  active = true;
  document.documentElement.dataset.givingPractice = 'true';
  document.documentElement.dataset.givingPracticeLoad = 'true';
  registerPracticeSource();

  const title = $('#dossierTitle');
  const name = $('#searchName');
  const queue = $('#contactQueueInput');
  const exact = $('#exactMatchToggle');
  const from = $('#dateFrom');
  const to = $('#dateTo');
  if (title) title.value = 'SAMPLE — Bikini Bottom contributor review';
  if (name) name.value = 'SpongeBob SquarePants';
  if (queue) queue.value = ['Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles'].join('\n');
  if (exact) exact.checked = true;
  if (from) from.value = '2020-01-01';
  if (to) to.value = new Date().toISOString().slice(0, 10);
  for (const field of [title, name, queue, from, to]) field?.dispatchEvent(new Event('input', { bubbles: true }));
  exact?.dispatchEvent(new Event('change', { bubbles: true }));
  setOnlyPracticeSource();
  installExitMembrane();
  document.documentElement.dataset.givingPracticeLoad = 'false';

  const status = $('#researchFileSampleStatus');
  if (status) {
    status.hidden = false;
    status.innerHTML = '<strong>Practice case loaded.</strong> Normalized exact match is ON and real custodians are frozen. Press SEARCH to make one deliberate fictional BikiniBottomVotes retrieval. Then review → Save → Vault. Watch the committee names: the same Giving route can contain candidate, PAC/PC, party-style, and issue/referendum political objects. Nothing in this case can become real evidence or mutate Campaign Deputy.';
  }
  $('#runSearchButton')?.focus();
}

function exitPractice() {
  if (!active) return;
  active = false;
  delete document.documentElement.dataset.givingPractice;
  document.documentElement.dataset.givingPracticeLoad = 'true';
  $('.source-picker')?.classList.remove('practice-source-locked');
  $('#practiceExitMembrane')?.remove();
  document.dispatchEvent(new CustomEvent('td613:giving-practice-source-registry', { detail: { action: 'remove', source: PRACTICE_SOURCE } }));
  const newButton = $('#newDossierButton');
  newButton?.click();
  for (const input of $$('#sourceRegistry input[type="checkbox"]')) {
    input.checked = originalSelections.has(input.value);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const exact = $('#exactMatchToggle');
  if (exact) {
    exact.checked = false;
    exact.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const status = $('#researchFileSampleStatus');
  if (status) {
    status.hidden = false;
    status.textContent = 'Sample demo exited. Explicitly saved local sample files remain available; the live source field is restored.';
  }
  practiceVault.clear();
  document.documentElement.dataset.givingPracticeLoad = 'false';
}

document.addEventListener('td613:giving-practice-load-request', activatePractice);

export const _givingPracticeHydration = Object.freeze({
  PRACTICE_FIXTURE_ID,
  PRACTICE_SOURCE_ID,
  active: () => active,
  recordsFor,
  exit: exitPractice
});
