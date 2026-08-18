import { _givingPracticeHydration } from './giving-practice-hydration.js';

const SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const FIXTURE_ID = _givingPracticeHydration.PRACTICE_FIXTURE_ID;
const LOCAL_LIMIT_CENTS = 100000;

export const LARRY_MAYOR = 'Larry Lobster for Mayor of Bikini Bottom';
export const LARRY_BOARD = 'Larry Lobster for Bikini Bottom Board of Public Health, Soil & Water District 2';
export const PLANKTON = 'Sheldon Plankton for Bikini Bottom Campaign';
export const PUFF = 'Puff for Bikini Bottom School District #67';
export const NEPTUNE = 'King Neptune for King';
export const AQUAMAN_PC = 'Friends of Aquaman PC';
export const AQUAMAN_SHERIFF = 'Aquaman for Bikini Bottom County Sheriff';

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');
const words = (value) => folded(value).split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
const safeToken = (value) => folded(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const PROFILES = Object.freeze({
  'Sandra Grouper': ['717 Grouper Gardens · FICTIONAL REEF', 'Bikini Bottom Aquatic Survey · FICTIONAL', 'Field Biologist · FICTIONAL', 'sandra-grouper', 'NEARBY_NAME_COLLISION'],
  'Karen Plankton': ['2 Chum Bucket Way · FICTIONAL LAB', 'Chum Bucket Systems · FICTIONAL', 'Computer / Laboratory Administrator · FICTIONAL', 'karen-plankton', 'RECURRING_CYCLE_MAXOUT'],
  'SpongeBob SquarePants': ['124 Conch Street · FICTIONAL PINEAPPLE', 'Krusty Krab · FICTIONAL', 'Fry Cook · FICTIONAL', 'spongebob-squarepants', 'RECURRING_MONTHLY'],
  'Patrick Star': ['120 Conch Street · FICTIONAL ROCK', 'Self · FICTIONAL', 'Professional Lounger · FICTIONAL', 'patrick-star', 'RECURRING_MONTHLY'],
  'Sandy Cheeks': ['1 Treedome Way · FICTIONAL AIR DOME', 'Treedome Research Lab · FICTIONAL', 'Scientist · FICTIONAL', 'sandy-cheeks', 'RETURNING_RACE_DONOR'],
  'Squidward Q. Tentacles': ['122 Conch Street · FICTIONAL MOAI', 'Krusty Krab · FICTIONAL', 'Cashier / Clarinetist · FICTIONAL', 'squidward-tentacles', 'RETURNING_RACE_DONOR'],
  'Fred Fish': ['88 Coral Commons · FICTIONAL APARTMENT', 'Bikini Bottom Transit · FICTIONAL', 'Bus Driver · FICTIONAL', 'fred-fish', 'RETURNING_RACE_DONOR'],
  'Frederick Fish': ['88 Coral Commons · FICTIONAL APARTMENT', 'Bikini Bottom Transit · FICTIONAL', 'Bus Driver · FICTIONAL', 'fred-fish', 'RETURNING_RACE_DONOR'],
  'Barnacle Boy': ['42 Shady Shoals Lane · FICTIONAL RETIREMENT HOME', 'Mermaid Man Partnership · FICTIONAL', 'Retired superhero · FICTIONAL', 'barnacle-boy', 'CROSS_OBJECT_DONOR'],
  'Barnacle Boy Strategies LLC': ['42 Shady Shoals Lane, Suite B · FICTIONAL OFFICE', 'SELF-ORGANIZATION · FICTIONAL', 'Political strategy company · FICTIONAL', 'barnacle-boy-strategies', 'CROSS_OBJECT_ENTITY'],
  'Mermaid Man': ['42 Shady Shoals Lane · FICTIONAL RETIREMENT HOME', 'Mermaid Man Partnership · FICTIONAL', 'Retired superhero · FICTIONAL', 'mermaid-man', 'RETURNING_RACE_DONOR'],
  'Bubble Bass': ['9 Pickles Court · FICTIONAL APARTMENT', 'Self · FICTIONAL', 'Food critic · FICTIONAL', 'bubble-bass', 'MAYORAL_NEW_DONOR'],
  'Old Man Jenkins': ['13 Kelp Road · FICTIONAL PORCH', 'Retired · FICTIONAL', 'Retired · FICTIONAL', 'old-man-jenkins', 'MAYORAL_NEW_DONOR'],
  'Nat Peterson': ['61 Anchor Avenue · FICTIONAL DUPLEX', 'Bikini Bottom Hardware · FICTIONAL', 'Clerk · FICTIONAL', 'nat-peterson', 'MAYORAL_NEW_DONOR'],
  'Nancy Suzy Fish': ['62 Kelp Crescent · FICTIONAL CONDO', 'Bikini Bottom Library · FICTIONAL', 'Archivist · FICTIONAL', 'nancy-suzy-fish', 'MAYORAL_NEW_DONOR'],
  'Tom Fish': ['63 Reef Route · FICTIONAL FLAT', 'Goo Lagoon Services · FICTIONAL', 'Beach attendant · FICTIONAL', 'tom-fish', 'MAYORAL_NEW_DONOR'],
  'Man, Aqua': ['1 Hall of Justice Pier · FICTIONAL RESIDENCE', 'Atlantis Civic Service · FICTIONAL', 'Candidate / Ocean hero · FICTIONAL', 'aquaman', 'SOURCE_NAME_SERIALIZATION']
});

const CANDIDATE_HISTORY = Object.freeze({
  'King Neptune': { continuity_key: 'king-neptune', cycles: ['2020', '2022', '2024', '2026'], current_committee: NEPTUNE },
  'Mrs. Puff': { continuity_key: 'mrs-puff', cycles: ['2020', '2022', '2024', '2026'], current_committee: PUFF },
  'Sheldon Plankton': { continuity_key: 'sheldon-plankton', cycles: ['2022', '2024', '2026'], current_committee: PLANKTON },
  'Larry Lobster': { continuity_key: 'larry-lobster-candidate', prior_committee: LARRY_BOARD, current_committee: LARRY_MAYOR, board_cycles: ['2020', '2022', '2024'], first_mayoral_cycle: '2026' },
  'Aquaman': { continuity_key: 'aquaman', cycles: ['2026'], current_committee: AQUAMAN_SHERIFF, related_pc: AQUAMAN_PC, source_contributor_serialization: 'Man, Aqua' }
});

const SANDRA_GROUPER_TX = Object.freeze([
  ['2020-09-12', 3700, 'Fishocratic Executive Committee'],
  ['2021-11-20', 6200, NEPTUNE],
  ['2022-06-04', 8800, AQUAMAN_PC],
  ['2023-10-28', 11100, PUFF],
  ['2024-07-13', 14400, 'Krusty Krab Parking Expansion Referendum Committee'],
  ['2025-11-22', 20200, PLANKTON],
  ['2026-04-11', 23300, 'Every Villain Is Lemons PAC']
]);

const KAREN_TX = Object.freeze([
  ['2021-11-06', 40400, PLANKTON], ['2022-02-12', 40400, PLANKTON], ['2022-06-18', 19200, PLANKTON],
  ['2023-11-04', 40400, PLANKTON], ['2024-02-10', 40400, PLANKTON], ['2024-06-15', 19200, PLANKTON],
  ['2025-11-08', 40400, PLANKTON], ['2026-02-14', 40400, PLANKTON], ['2026-06-13', 19200, PLANKTON]
]);

const LARRY_MAYOR_TX = Object.freeze({
  'SpongeBob SquarePants': [['2025-10-18', 3500, LARRY_MAYOR]],
  'Patrick Star': [['2025-11-01', 1200, LARRY_MAYOR]],
  'Sandy Cheeks': [['2025-11-15', 75000, LARRY_MAYOR]],
  'Squidward Q. Tentacles': [['2025-12-06', 25000, LARRY_MAYOR]],
  'Fred Fish': [['2025-10-25', 5000, LARRY_MAYOR]],
  'Frederick Fish': [['2026-01-10', 7500, LARRY_MAYOR]],
  'Barnacle Boy': [['2025-11-29', 10000, LARRY_MAYOR]],
  'Mermaid Man': [['2026-02-21', 12500, LARRY_MAYOR]],
  'Bubble Bass': [['2026-03-07', 20000, LARRY_MAYOR]],
  'Old Man Jenkins': [['2025-12-13', 2500, LARRY_MAYOR]],
  'Nat Peterson': [['2025-10-11', 4500, LARRY_MAYOR]],
  'Nancy Suzy Fish': [['2026-01-24', 8000, LARRY_MAYOR]],
  'Tom Fish': [['2026-04-04', 6000, LARRY_MAYOR]]
});

const MONTHS = Object.freeze(['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04']);
const monthly = (name, committee, day, amountCents) => MONTHS.map((month) => [`${month}-${String(day).padStart(2, '0')}`, amountCents, committee]);

const AQUAMAN_TX = Object.freeze({
  'Man, Aqua': Object.freeze([
    ['2025-11-03', 2500000, AQUAMAN_SHERIFF, 'LOAN'],
    ['2026-02-02', 4000000, AQUAMAN_SHERIFF, 'LOAN'],
    ['2026-04-20', 6000000, AQUAMAN_SHERIFF, 'LOAN'],
    ['2025-10-15', 1250000, AQUAMAN_PC],
    ['2026-01-21', 2000000, AQUAMAN_PC],
    ['2026-04-20', 3000000, AQUAMAN_PC]
  ]),
  'Barnacle Boy': Object.freeze([
    ['2026-02-12', 100000, AQUAMAN_SHERIFF], ['2026-04-16', 100000, AQUAMAN_SHERIFF],
    ['2025-09-30', 61300, AQUAMAN_PC], ['2026-02-12', 77700, AQUAMAN_PC], ['2026-03-29', 88800, AQUAMAN_PC], ['2026-04-23', 73100, AQUAMAN_PC]
  ]),
  'Barnacle Boy Strategies LLC': Object.freeze([
    ['2026-02-14', 100000, AQUAMAN_SHERIFF], ['2026-04-18', 100000, AQUAMAN_SHERIFF],
    ['2025-11-17', 94100, AQUAMAN_PC], ['2026-02-14', 66700, AQUAMAN_PC], ['2026-04-18', 90900, AQUAMAN_PC], ['2026-05-02', 55500, AQUAMAN_PC]
  ]),
  'SpongeBob SquarePants': Object.freeze([
    ...monthly('SpongeBob SquarePants', AQUAMAN_SHERIFF, 5, 1750),
    ...monthly('SpongeBob SquarePants', AQUAMAN_PC, 19, 875)
  ]),
  'Patrick Star': Object.freeze([
    ...monthly('Patrick Star', AQUAMAN_SHERIFF, 11, 999),
    ...monthly('Patrick Star', AQUAMAN_PC, 26, 425)
  ]),
  'Sandy Cheeks': Object.freeze([
    ['2025-09-05', 22500, AQUAMAN_PC], ['2026-01-17', 32500, AQUAMAN_SHERIFF]
  ]),
  'Frederick Fish': Object.freeze([
    ['2026-05-09', 45000, AQUAMAN_PC], ['2026-05-28', 60000, AQUAMAN_SHERIFF]
  ])
});

function parsedName(name) {
  if (name === 'Man, Aqua') return { display: name, given: 'Aqua', middle: null, family: 'Man', suffix: null };
  const pieces = compact(name).split(/\s+/);
  return { display: name, given: pieces[0] || null, middle: pieces.length > 2 ? pieces.slice(1, -1).join(' ') : null, family: pieces.at(-1) || null, suffix: null };
}

function isLocalCandidate(committee) {
  return [PUFF, PLANKTON, LARRY_MAYOR, LARRY_BOARD, AQUAMAN_SHERIFF].includes(committee);
}

function cycleFor(committee, date) {
  const year = Number(String(date || '').slice(0, 4));
  if (!Number.isFinite(year)) return null;
  if (committee === PLANKTON) return year <= 2022 ? '2022' : year <= 2024 ? '2024' : '2026';
  if (committee === LARRY_MAYOR || committee === AQUAMAN_SHERIFF) return '2026';
  if (committee === LARRY_BOARD) return String(Math.min(2024, year % 2 === 0 ? year : year + 1));
  if (committee === PUFF || committee === NEPTUNE) return String(Math.min(2026, year % 2 === 0 ? year : year + 1));
  return null;
}

function raceMeta(committee) {
  if (committee === PLANKTON) return ['Sheldon Plankton', 'sheldon-plankton', 'MAYOR'];
  if (committee === LARRY_MAYOR) return ['Larry Lobster', 'larry-lobster-candidate', 'MAYOR_FIRST_RUN'];
  if (committee === LARRY_BOARD) return ['Larry Lobster', 'larry-lobster-candidate', 'PUBLIC_HEALTH_SOIL_WATER_D2'];
  if (committee === AQUAMAN_SHERIFF) return ['Aquaman', 'aquaman', 'COUNTY_SHERIFF'];
  if (committee === PUFF) return ['Mrs. Puff', 'mrs-puff', 'SCHOOL_DISTRICT_67'];
  if (committee === NEPTUNE) return ['King Neptune', 'king-neptune', 'KING_OF_BIKINI_BOTTOM'];
  return null;
}

function normalizePracticeRecord(record = {}) {
  const next = { ...record };
  let committee = compact(next.committee_name || next.committee);
  if (committee === 'Mrs. Puff for Bikini Bottom School District #67') committee = PUFF;
  let date = String(next.contribution_date || next.date || '');
  const originalCommittee = committee;
  const originalDate = date;
  const contributor = compact(next.contributor_name_raw || next.contributor_name || next.contributor_name_parsed?.display);
  const loan = next.candidate_self_financing === true || next.practice_candidate_loan === true || /CANDIDATE LOAN|\bLOAN\b/i.test(String(next.contribution_type || next.transaction_class || ''));

  if (committee === LARRY_MAYOR && date === '2024-08-24') {
    date = '2025-11-08';
  } else if (committee === LARRY_MAYOR && loan) {
    const map = { '2021-01-09': '2025-10-04', '2022-08-27': '2025-12-06', '2024-02-10': '2026-02-14', '2026-01-17': '2026-06-13' };
    date = map[date] || date;
  } else if (committee === LARRY_MAYOR && date && date < '2025-01-01') {
    committee = LARRY_BOARD;
  }

  if (committee === PLANKTON && contributor === 'Chum Bucket Corp' && date === '2020-02-01') date = '2021-11-01';

  const cycle = cycleFor(committee, date);
  const race = raceMeta(committee);
  next.committee = committee;
  next.committee_name = committee;
  if (date) {
    next.contribution_date = date;
    if ('date' in next) next.date = date;
  }
  if (race && cycle) {
    next.cycle = cycle;
    next.election = `${cycle} fictional cycle`;
    next.practice_campaign_cycle = cycle;
    next.practice_candidate = race[0];
    next.practice_candidate_continuity_key = race[1];
    next.practice_race_context = race[2];
    next.committee_kind = 'CANDIDATE_COMMITTEE';
  }
  if (isLocalCandidate(committee)) {
    next.practice_local_limit_cents = LOCAL_LIMIT_CENTS;
    if (loan) {
      next.transaction_class = 'LOAN';
      next.candidate_self_financing = true;
      next.practice_candidate_loan = true;
      next.practice_local_campaign_rule = 'CANDIDATE_SELF_FINANCING_SEPARATE_FROM_ORDINARY_LIMIT';
    } else if ((Number(next.amount_cents) || 0) > LOCAL_LIMIT_CENTS) {
      next.practice_compliance_review_required = true;
      next.practice_over_limit_anomaly = true;
      next.practice_local_campaign_rule = 'PRESERVE_OBSERVED_VALUE_AND_FLAG_LIMIT_REVIEW';
    } else {
      next.practice_local_campaign_rule = next.practice_local_campaign_rule || 'ORDINARY_CONTRIBUTION_LIMIT';
    }
  }
  next.lineage = {
    ...(next.lineage || {}),
    ...(race && cycle ? {
      campaign_calendar: true,
      campaign_cycle: cycle,
      candidate_continuity_key: race[1],
      race_context: race[2],
      race_episode_preserved: true,
      candidate_identity_does_not_collapse_race: true,
      temporal_coincidence_does_not_grant_causation: true
    } : {}),
    ...(originalCommittee !== committee ? { practice_original_committee: originalCommittee, committee_reauthored_for_campaign_calendar: true } : {}),
    ...(originalDate && originalDate !== date ? { practice_original_contribution_date: originalDate, date_reauthored_for_campaign_calendar: true } : {})
  };
  return next;
}

function recordFor(name, row, index, sourceClass) {
  const [date, amountCents, committee, transactionClass = null] = row;
  const profile = PROFILES[name];
  const token = `campaign-history-${safeToken(name)}-${date}-${index + 1}-${safeToken(committee)}`;
  const organization = /LLC$|Strategies LLC$/.test(name);
  const record = {
    digest: `practice:${FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: organization ? { display: name, given: null, middle: null, family: null, suffix: null } : parsedName(name),
    contributor_kind: organization ? 'ORGANIZATION' : 'PERSON',
    address: profile[0], city: 'Bikini Bottom', state: 'Oceania', zip: 'X', employer: profile[1], occupation: profile[2],
    committee, committee_name: committee,
    committee_kind: committee === AQUAMAN_PC ? 'POLITICAL_COMMITTEE' : 'CANDIDATE_OR_POLITICAL_COMMITTEE',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    contribution_date: date,
    contribution_type: transactionClass === 'LOAN' ? 'FICTIONAL CANDIDATE LOAN' : amountCents <= 2500 ? 'FICTIONAL SMALL-DOLLAR' : 'FICTIONAL CONTRIBUTION',
    ...(transactionClass ? { transaction_class: transactionClass } : {}),
    amount_cents: amountCents,
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: SOURCE_ID, custodian: 'BikiniBottomVotes', evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(),
    source_native_ids: { practice_record_id: token },
    practice_data_class: sourceClass || profile[4], practice_identity_cluster: profile[3],
    pedagogy_note: sourceClass === 'AQUAMAN_PAIRED_OBJECT_GRAPH'
      ? 'Same actor and cycle can span a candidate committee and political committee with some coincident dates and some separated dates. Temporal overlap is a review cue, not proof of coordination or transfer.'
      : sourceClass === 'LARRY_MULTI_RACE'
        ? 'Larry appears across a prior board race and a later first mayoral race. Candidate continuity does not collapse race, office, committee, cycle, or donor motive.'
        : profile[4] === 'RECURRING_CYCLE_MAXOUT'
          ? 'Karen repeats a fictional $404 + $404 + $192 pattern that totals the $1,000 local ordinary limit in each of three Plankton mayoral cycles.'
          : profile[4] === 'NEARBY_NAME_COLLISION'
            ? 'Sandra Grouper is a separate fictional person from Sandy Cheeks and the declared alias Sandra Cheeks. Name overlap must not close identity.'
            : 'Recurring fictional campaign-finance pattern for practice review.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1', practice_fixture_id: FIXTURE_ID, manifestly_fictional: true, practice_record: true,
      campaign_history_graph: true, evidence_authority: false, consequence_authority: false, external_retrieval: false, source_projection: 'BikiniBottomVotes',
      identity_cluster: profile[3], data_class: sourceClass || profile[4], source_name_serialization_preserved: name === 'Man, Aqua'
    }
  };
  if (name === 'Man, Aqua') {
    record.practice_candidate_identity = 'Aquaman';
    record.practice_source_name_serialization = 'Man, Aqua';
  }
  return normalizePracticeRecord(record);
}

function buildRows() {
  const rows = [];
  SANDRA_GROUPER_TX.forEach((row, index) => rows.push(recordFor('Sandra Grouper', row, index)));
  KAREN_TX.forEach((row, index) => rows.push(recordFor('Karen Plankton', row, index)));
  for (const [name, tx] of Object.entries(LARRY_MAYOR_TX)) tx.forEach((row, index) => rows.push(recordFor(name, row, index, 'LARRY_MULTI_RACE')));
  for (const [name, tx] of Object.entries(AQUAMAN_TX)) tx.forEach((row, index) => rows.push(recordFor(name, row, index, 'AQUAMAN_PAIRED_OBJECT_GRAPH')));
  return Object.freeze(rows);
}

const EXTRA_ROWS = buildRows();

function queryTerms(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(compact).filter(Boolean);
}

function queryMatches(name, query = {}) {
  const terms = queryTerms(query);
  if (!terms.length) return false;
  if (query.exact_match) return terms.some((term) => skeleton(term) === skeleton(name));
  const candidateWords = new Set(words(name));
  if (['sandy', 'sandra'].includes(skeleton(query.name)) && ['Sandra Grouper', 'Sandy Cheeks', 'Sandra Cheeks'].includes(name)) return true;
  return terms.some((term) => {
    const left = folded(name); const right = folded(term);
    if (left.includes(right) || right.includes(left)) return true;
    return words(term).some((word) => candidateWords.has(word));
  });
}

function dateMatches(date, query = {}) {
  if (query.date_from && date < query.date_from) return false;
  if (query.date_to && date > query.date_to) return false;
  return true;
}

function recordsForQuery(query = {}) {
  return EXTRA_ROWS.filter((record) => queryMatches(record.contributor_name_raw, query) && dateMatches(record.contribution_date, query));
}

function augmentQuery(query = {}) {
  const name = skeleton(query.name);
  const aliases = [...new Set(Array.isArray(query.aliases) ? query.aliases : [])];
  if (query.exact_match && name === 'sandycheeks' && !aliases.includes('Sandra Cheeks')) aliases.push('Sandra Cheeks');
  if (!query.exact_match && name === 'sandy' && !aliases.includes('Sandra Cheeks')) aliases.push('Sandra Cheeks');
  if (!query.exact_match && name === 'sandra' && !aliases.includes('Sandy Cheeks')) aliases.push('Sandy Cheeks');
  return aliases.length === (query.aliases?.length || 0) ? query : { ...query, aliases };
}

function responseFrom(original, body) {
  const headers = new Headers(original.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(body), { status: original.status, statusText: original.statusText, headers });
}

function parseEnvelope(init) {
  try { return typeof init?.body === 'string' ? JSON.parse(init.body) : null; } catch { return null; }
}

const priorFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init = {}) => {
  const envelope = parseEnvelope(init);
  const query = envelope?.payload?.query;
  const practiceSearch = envelope?.operation === 'search.page' && envelope?.payload?.source_instance_id === SOURCE_ID && query;
  let nextInit = init;
  let effectiveQuery = query;
  if (practiceSearch) {
    effectiveQuery = augmentQuery(query);
    if (effectiveQuery !== query) nextInit = { ...init, body: JSON.stringify({ ...envelope, payload: { ...envelope.payload, query: effectiveQuery } }) };
  }
  const result = await priorFetch(input, nextInit);
  if (!practiceSearch) return result;
  const body = await result.clone().json().catch(() => null);
  const page = body?.data?.page;
  if (!page || !Array.isArray(page.records)) return result;

  const normalized = page.records.map(normalizePracticeRecord);
  const additions = recordsForQuery(effectiveQuery);
  const seen = new Set();
  const records = [];
  for (const record of [...normalized, ...additions]) {
    const key = String(record.digest || record.source_native_ids?.practice_record_id || [record.contributor_name_raw, record.contribution_date, record.committee_name, record.amount_cents].join('|'));
    if (seen.has(key)) continue;
    seen.add(key);
    records.push(record);
  }
  return responseFrom(result, {
    ...body,
    data: { ...body.data, page: { ...page, records, practice_campaign_history: true, practice_race_episode_preserved: true } },
    receipt: { ...(body.receipt || {}), practice_campaign_history: true, race_episode_preserved: true, record_count: records.length }
  });
};

function prepareCommitteeSearch() {
  const input = document.querySelector('#campaignDirectoryQuery');
  if (!input) return;
  input.value = LARRY_MAYOR;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

if (globalThis.document) {
  document.addEventListener('td613:giving-practice-source-registry', (event) => {
    if (event.detail?.action === 'register') queueMicrotask(prepareCommitteeSearch);
  });
}

export const _givingPracticeCampaignHistory = Object.freeze({
  SOURCE_ID, FIXTURE_ID, LOCAL_LIMIT_CENTS,
  LARRY_MAYOR, LARRY_BOARD, PLANKTON, PUFF, NEPTUNE, AQUAMAN_PC, AQUAMAN_SHERIFF,
  CANDIDATE_HISTORY, SANDRA_GROUPER_TX, KAREN_TX, LARRY_MAYOR_TX, AQUAMAN_TX,
  allRows: () => [...EXTRA_ROWS], recordsForQuery, normalizePracticeRecord, augmentQuery, prepareCommitteeSearch, cycleFor
});
