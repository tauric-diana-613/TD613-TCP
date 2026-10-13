import { _givingPracticeHydration } from './giving-practice-hydration.js';
import { _givingPracticeSearchNoise } from './giving-practice-search-noise.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const COMMITTEES = _givingPracticeSearchNoise.COMMITTEES;
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');
const words = (value) => folded(value).split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
const safeToken = (value) => folded(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const KRABS_HOME = '17 Whale Tail Lane · FICTIONAL ANCHOR HOUSE';
const KRABS_BUSINESS = '1 Krusty Krab Plaza · FICTIONAL RESTAURANT';
const TREEDOME = '1 Treedome Way · FICTIONAL AIR DOME';
const SHADY_SHOALS = '42 Shady Shoals Lane · FICTIONAL RETIREMENT HOME';

const DISCOVERY_PEOPLE = Object.freeze({
  'Sandra Cheeks': { address: TREEDOME, employer: 'Treedome Research Lab · FICTIONAL', occupation: 'Scientist · FICTIONAL', kind: 'PERSON', data_class: 'DECLARED_ALIAS', cluster: 'sandy-cheeks' },
  'Fred Fish': { address: '88 Coral Commons · FICTIONAL APARTMENT', employer: 'Bikini Bottom Transit · FICTIONAL', occupation: 'Bus Driver · FICTIONAL', kind: 'PERSON', data_class: 'DECLARED_ALIAS', cluster: 'fred-fish' },
  'Frederick Fish': { address: '88 Coral Commons · FICTIONAL APARTMENT', employer: 'Bikini Bottom Transit · FICTIONAL', occupation: 'Bus Driver · FICTIONAL', kind: 'PERSON', data_class: 'DECLARED_ALIAS', cluster: 'fred-fish' },
  'Larry Lobster': { address: '7 Muscle Beach Walk · FICTIONAL GYM FLAT', employer: 'Goo Lagoon Fitness Club · FICTIONAL', occupation: 'Lifeguard / Trainer · FICTIONAL', kind: 'PERSON', data_class: 'ROLE_COLLISION_ALIAS', cluster: 'larry-lobster' },
  'Lawrence Lobster': { address: '7 Muscle Beach Walk · FICTIONAL GYM FLAT', employer: 'Goo Lagoon Fitness Club · FICTIONAL', occupation: 'Lifeguard / Trainer · FICTIONAL', kind: 'PERSON', data_class: 'ROLE_COLLISION_ALIAS', cluster: 'larry-lobster' },
  'Krusty Krab LLC': { address: KRABS_BUSINESS, employer: 'SELF-ORGANIZATION · FICTIONAL', occupation: 'Restaurant company · FICTIONAL', kind: 'ORGANIZATION', data_class: 'ENTITY_VARIANT', cluster: 'krusty-krab-llc' },
  'Krusty Krab, LLC': { address: KRABS_BUSINESS, employer: 'SELF-ORGANIZATION · FICTIONAL', occupation: 'Restaurant company · FICTIONAL', kind: 'ORGANIZATION', data_class: 'ENTITY_VARIANT', cluster: 'krusty-krab-llc' },
  'Chum Bucket Corp': { address: '2 Chum Bucket Way · FICTIONAL LAB', employer: 'SELF-ORGANIZATION · FICTIONAL', occupation: 'Restaurant / laboratory corporation · FICTIONAL', kind: 'ORGANIZATION', data_class: 'UNRELATED_ENTITY', cluster: 'chum-bucket-corp' },
  'Oceanic Association of Fry Cooks': { address: 'PO Box 613 · FICTIONAL ASSOCIATION', employer: 'SELF-ORGANIZATION · FICTIONAL', occupation: 'Trade association · FICTIONAL', kind: 'ORGANIZATION', data_class: 'UNRELATED_ENTITY', cluster: 'oceanic-fry-cooks' },
  'Barnacle Boy': { address: SHADY_SHOALS, employer: 'Mermaid Man Partnership · FICTIONAL', occupation: 'Retired superhero · FICTIONAL', kind: 'PERSON', data_class: 'SHARED_ADDRESS_COLLISION', cluster: 'barnacle-boy' },
  'Mermaid Man': { address: SHADY_SHOALS, employer: 'Mermaid Man Partnership · FICTIONAL', occupation: 'Retired superhero · FICTIONAL', kind: 'PERSON', data_class: 'SHARED_ADDRESS_COLLISION', cluster: 'mermaid-man' },
  'Bubble Bass': { address: '9 Pickles Court · FICTIONAL APARTMENT', employer: 'Self · FICTIONAL', occupation: 'Food critic · FICTIONAL', kind: 'PERSON', data_class: 'AMENDMENT_CHAIN', cluster: 'bubble-bass' },
  'Old Man Jenkins': { address: '13 Kelp Road · FICTIONAL PORCH', employer: 'Retired · FICTIONAL', occupation: 'Retired · FICTIONAL', kind: 'PERSON', data_class: 'NAME_ORDER_VARIANT', cluster: 'old-man-jenkins' },
  'Jenkins, Old Man': { address: '13 Kelp Road · FICTIONAL PORCH', employer: 'Retired · FICTIONAL', occupation: 'Retired · FICTIONAL', kind: 'PERSON', data_class: 'NAME_ORDER_VARIANT', cluster: 'old-man-jenkins' }
});

const DISCOVERY_TX = Object.freeze({
  'Sandra Cheeks': [
    ['2021-05-09', 2600, COMMITTEES[0]], ['2022-07-16', 3600, COMMITTEES[2]], ['2023-09-16', 4600, COMMITTEES[3]],
    ['2024-12-14', 5600, COMMITTEES[5]], ['2025-02-22', 6600, COMMITTEES[6]], ['2026-05-30', 8600, COMMITTEES[7]]
  ],
  'Fred Fish': [
    ['2020-08-08', 1500, COMMITTEES[1]], ['2021-08-08', 2500, COMMITTEES[4]], ['2022-08-08', 3500, COMMITTEES[6]], ['2023-08-08', 4500, COMMITTEES[2]]
  ],
  'Frederick Fish': [
    ['2024-08-08', 5500, COMMITTEES[7]], ['2025-08-08', 6500, COMMITTEES[0]], ['2026-08-08', 7500, COMMITTEES[5]]
  ],
  'Larry Lobster': [
    ['2020-06-21', 5000, COMMITTEES[0]], ['2021-06-21', 7500, COMMITTEES[5]], ['2022-06-21', 10000, COMMITTEES[6]], ['2023-06-21', 12500, COMMITTEES[7]]
  ],
  'Lawrence Lobster': [
    ['2024-06-21', 15000, COMMITTEES[1]], ['2025-06-21', 17500, COMMITTEES[2]], ['2026-06-21', 20000, COMMITTEES[3]]
  ],
  'Krusty Krab LLC': [
    ['2020-01-15', 100000, COMMITTEES[5]], ['2021-07-01', 125000, COMMITTEES[7]], ['2022-10-15', 150000, COMMITTEES[1]], ['2023-05-20', 175000, COMMITTEES[4]]
  ],
  'Krusty Krab, LLC': [
    ['2024-03-02', 200000, COMMITTEES[6]], ['2025-09-13', 250000, COMMITTEES[0]], ['2026-04-18', 300000, COMMITTEES[2]]
  ],
  'Chum Bucket Corp': [
    ['2020-02-01', 50000, COMMITTEES[3]], ['2021-02-01', 75000, COMMITTEES[2]], ['2022-02-01', 90000, COMMITTEES[5]], ['2023-02-01', 110000, COMMITTEES[7]],
    ['2024-02-01', 130000, COMMITTEES[3]], ['2025-02-01', 150000, COMMITTEES[2]], ['2026-02-01', 175000, COMMITTEES[3]]
  ],
  'Oceanic Association of Fry Cooks': [
    ['2020-05-01', 15000, COMMITTEES[1]], ['2021-05-01', 20000, COMMITTEES[6]], ['2022-05-01', 25000, COMMITTEES[4]], ['2023-05-01', 30000, COMMITTEES[0]],
    ['2024-05-01', 35000, COMMITTEES[5]], ['2025-05-01', 40000, COMMITTEES[7]], ['2026-05-01', 45000, COMMITTEES[6]]
  ],
  'Barnacle Boy': [
    ['2020-11-11', 1100, COMMITTEES[0]], ['2021-11-11', 2200, COMMITTEES[1]], ['2022-11-11', 3300, COMMITTEES[2]], ['2023-11-11', 4400, COMMITTEES[4]],
    ['2024-11-11', 5500, COMMITTEES[6]], ['2025-11-11', 6600, COMMITTEES[7]], ['2026-07-07', 7700, COMMITTEES[5]]
  ],
  'Mermaid Man': [
    ['2020-10-10', 2100, COMMITTEES[1]], ['2022-10-10', 4100, COMMITTEES[3]], ['2024-10-10', 6100, COMMITTEES[5]], ['2026-06-10', 8100, COMMITTEES[7]]
  ],
  'Bubble Bass': [
    ['2020-03-03', 2500, COMMITTEES[4], { transaction_group: 'BBV-BASS-2020-001', revision: 'ORIGINAL', revision_rank: 1 }],
    ['2020-03-03', 3500, COMMITTEES[4], { transaction_group: 'BBV-BASS-2020-001', revision: 'AMENDED', revision_rank: 2 }],
    ['2022-09-09', 5000, COMMITTEES[2]], ['2024-09-09', 7500, COMMITTEES[6]], ['2026-03-03', 10000, COMMITTEES[0]]
  ],
  'Old Man Jenkins': [
    ['2020-12-12', 1200, COMMITTEES[5]], ['2022-12-12', 3200, COMMITTEES[1]], ['2024-12-12', 5200, COMMITTEES[7]]
  ],
  'Jenkins, Old Man': [
    ['2021-12-12', 2200, COMMITTEES[6]], ['2023-12-12', 4200, COMMITTEES[3]], ['2025-12-12', 6200, COMMITTEES[0]]
  ]
});

const ALIAS_CLUSTERS = Object.freeze({
  'sandy-cheeks': ['Sandy Cheeks', 'Sandra Cheeks'],
  'fred-fish': ['Fred Fish', 'Frederick Fish'],
  'larry-lobster': ['Larry Lobster', 'Lawrence Lobster'],
  'krusty-krab-llc': ['Krusty Krab LLC', 'Krusty Krab, LLC'],
  'old-man-jenkins': ['Old Man Jenkins', 'Jenkins, Old Man']
});

function normalizeCommitteeName(name) {
  return name === 'Mrs. Puff for Bikini Bottom School District #67' ? 'Puff for Bikini Bottom School District #67' : name;
}

function nameParts(name, kind) {
  if (kind === 'ORGANIZATION') return { display: name, given: null, middle: null, family: null, suffix: null };
  if (name === 'Jenkins, Old Man') return { display: name, given: 'Old Man', middle: null, family: 'Jenkins', suffix: null };
  const pieces = compact(name).split(/\s+/);
  return { display: name, given: pieces[0] || null, middle: pieces.length > 2 ? pieces.slice(1, -1).join(' ') : null, family: pieces.at(-1) || null, suffix: null };
}

function recordFor(name, row, index) {
  const [date, amountCents, rawCommittee, extra = {}] = row;
  const person = DISCOVERY_PEOPLE[name];
  const committee = normalizeCommitteeName(rawCommittee);
  const referendum = committee === COMMITTEES[7];
  const token = `discovery-${safeToken(name)}-${date}-${index + 1}-${safeToken(extra.revision || 'filed')}`;
  const transactionGroup = extra.transaction_group || null;
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: nameParts(name, person.kind),
    contributor_kind: person.kind,
    address: person.address,
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: person.employer, occupation: person.occupation,
    committee, committee_name: committee,
    committee_kind: referendum ? 'ISSUE_REFERENDUM' : 'CANDIDATE_OR_POLITICAL_COMMITTEE',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    office: referendum ? 'Issue / referendum · FICTIONAL' : null,
    cycle: date.slice(0, 4), election: `${date.slice(0, 4)} fictional cycle`, contribution_date: date,
    contribution_type: amountCents <= 2500 ? 'FICTIONAL SMALL-DOLLAR' : 'FICTIONAL CONTRIBUTION', amount_cents: amountCents,
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: PRACTICE_SOURCE_ID, custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(),
    source_native_ids: { practice_record_id: token, ...(transactionGroup ? { practice_transaction_group: transactionGroup } : {}) },
    practice_data_class: person.data_class,
    practice_identity_cluster: person.cluster,
    practice_filing_revision: extra.revision || null,
    practice_revision_rank: extra.revision_rank || null,
    pedagogy_note: person.data_class === 'SHARED_ADDRESS_COLLISION'
      ? 'Two different fictional donors share one address. Address equality supports investigation but cannot close identity.'
      : person.data_class === 'AMENDMENT_CHAIN'
        ? 'Two fictional filing rows share one transaction group. Revision history must remain visible before totals or duplicate closure.'
        : person.data_class === 'NAME_ORDER_VARIANT'
          ? 'One fictional identity appears in different source name order. Normalize serialization without treating the route history as disposable.'
          : person.data_class === 'ROLE_COLLISION_ALIAS'
            ? 'This fictional donor shares a name with a political object. Donor role and committee/candidate role remain non-equivalent.'
            : person.data_class === 'ENTITY_VARIANT'
              ? 'Punctuation and legal suffix drift can describe one fictional organization; organization matching remains distinct from person matching.'
              : person.data_class === 'DECLARED_ALIAS'
                ? 'Declared fictional alias continuity: the formal and familiar name belong to one practice identity cluster.'
                : 'Unrelated fictional contributor: discovery may surface it, but similarity to a target is not implied.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1', practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true, practice_record: true, discovery_graph: true, data_class: person.data_class,
      identity_cluster: person.cluster, evidence_authority: false, consequence_authority: false, external_retrieval: false,
      source_projection: 'BikiniBottomVotes', ...(transactionGroup ? { transaction_group: transactionGroup, filing_revision: extra.revision } : {})
    }
  };
}

function discoveryRecordsFor(name) {
  return (DISCOVERY_TX[name] || []).map((row, index) => recordFor(name, row, index));
}

function clusterForName(name) {
  const foldedName = folded(name);
  return Object.entries(ALIAS_CLUSTERS).find(([, names]) => names.some((candidate) => folded(candidate) === foldedName))?.[0] || null;
}

function exactDiscoveryMatch(candidate, term) {
  if (skeleton(candidate) === skeleton(term)) return true;
  const candidateCluster = clusterForName(candidate);
  const termCluster = clusterForName(term);
  return Boolean(candidateCluster && termCluster && candidateCluster === termCluster);
}

function broadDiscoveryMatch(candidate, term) {
  if (exactDiscoveryMatch(candidate, term)) return true;
  const candidateFolded = folded(candidate);
  const termFolded = folded(term);
  if (candidateFolded.includes(termFolded) || termFolded.includes(candidateFolded)) return true;
  const candidateWords = new Set(words(candidate));
  return words(term).some((word) => candidateWords.has(word));
}

function termsFromQuery(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(compact).filter(Boolean);
}

function matchedDiscoveryNames(query = {}) {
  const terms = termsFromQuery(query);
  if (!terms.length) return [];
  const exact = Boolean(query.exact_match);
  return Object.keys(DISCOVERY_PEOPLE).filter((candidate) => terms.some((term) => exact ? exactDiscoveryMatch(candidate, term) : broadDiscoveryMatch(candidate, term)));
}

function dateMatches(record, query = {}) {
  const date = String(record?.contribution_date || '');
  if (query.date_from && date < query.date_from) return false;
  if (query.date_to && date > query.date_to) return false;
  return true;
}

function dedupeKey(record) {
  return [skeleton(record.contributor_name_raw || record.contributor_name), record.contribution_date, normalizeCommitteeName(record.committee_name || record.committee), record.amount_cents].join('|');
}

function normalizeExistingRecord(record) {
  let next = { ...record };
  const contributor = compact(next.contributor_name_raw || next.contributor_name);
  const committee = normalizeCommitteeName(next.committee_name || next.committee);
  next.committee = committee;
  next.committee_name = committee;

  if (contributor === 'Sandra Cheeks') {
    next.address = TREEDOME;
    next.employer = 'Treedome Research Lab · FICTIONAL';
    next.occupation = 'Scientist · FICTIONAL';
    next.practice_data_class = 'DECLARED_ALIAS';
    next.practice_identity_cluster = 'sandy-cheeks';
    next.lineage = { ...(next.lineage || {}), data_class: 'DECLARED_ALIAS', identity_cluster: 'sandy-cheeks' };
  }

  if (/^Eugene(?: H\.)? Krabs$/i.test(contributor)) {
    const year = Number(String(next.contribution_date || '').slice(0, 4));
    const home = Number.isFinite(year) && year % 2 === 1;
    next.address = home ? KRABS_HOME : KRABS_BUSINESS;
    next.practice_address_quality = home ? 'HOME_ADDRESS' : 'BUSINESS_ADDRESS';
    next.lineage = { ...(next.lineage || {}), address_context: home ? 'HOME' : 'BUSINESS' };
  }

  return next;
}

function recordsForQuery(query = {}) {
  return matchedDiscoveryNames(query).flatMap((name) => discoveryRecordsFor(name)).filter((record) => dateMatches(record, query));
}

function allCommitteeRows() {
  const rows = [];
  for (const name of _givingPracticeSearchNoise.CANONICAL_NAMES) {
    for (const record of _givingPracticeSearchNoise.canonicalRecordsFor(name)) {
      rows.push({ name: compact(record.contributor_name_raw || record.contributor_name || name), committee: normalizeCommitteeName(record.committee_name || record.committee), amount_cents: record.amount_cents, data_class: record.practice_name_quality || 'CANONICAL' });
    }
  }
  for (const [name, transactions] of Object.entries(_givingPracticeSearchNoise.NOISE_TX)) {
    for (const [date, amountCents, committee] of transactions) rows.push({ name, committee: normalizeCommitteeName(committee), amount_cents: amountCents, data_class: _givingPracticeSearchNoise.NOISE_PEOPLE[name]?.quality || 'AMBIGUITY', date });
  }
  for (const [name, transactions] of Object.entries(DISCOVERY_TX)) {
    for (const [date, amountCents, committee] of transactions) rows.push({ name, committee: normalizeCommitteeName(committee), amount_cents: amountCents, data_class: DISCOVERY_PEOPLE[name].data_class, date });
  }
  return rows;
}

function contributorsForCommittee(committeeName) {
  const target = normalizeCommitteeName(committeeName);
  const byName = new Map();
  for (const row of allCommitteeRows()) {
    if (row.committee !== target) continue;
    const entry = byName.get(row.name) || { name: row.name, record_count: 0, total_cents: 0, data_classes: new Set() };
    entry.record_count += 1;
    entry.total_cents += Number(row.amount_cents) || 0;
    entry.data_classes.add(row.data_class);
    byName.set(row.name, entry);
  }
  return [...byName.values()]
    .map((entry) => ({ ...entry, data_classes: [...entry.data_classes] }))
    .sort((a, b) => b.record_count - a.record_count || b.total_cents - a.total_cents || a.name.localeCompare(b.name));
}

function responseFrom(original, body) {
  const headers = new Headers(original.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(body), { status: original.status, statusText: original.statusText, headers });
}

const priorFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init = {}) => {
  const result = await priorFetch(input, init);
  if (!_givingPracticeHydration.active()) return result;

  let envelope = null;
  try { envelope = typeof init?.body === 'string' ? JSON.parse(init.body) : null; } catch { envelope = null; }
  const query = envelope?.payload?.query;
  if (envelope?.operation !== 'search.page' || envelope?.payload?.source_instance_id !== PRACTICE_SOURCE_ID || !query) return result;

  const body = await result.clone().json().catch(() => null);
  const page = body?.data?.page;
  if (!page || !Array.isArray(page.records)) return result;

  const existing = page.records.map(normalizeExistingRecord);
  const additions = recordsForQuery(query);
  const seen = new Set();
  const records = [];
  for (const record of [...existing, ...additions]) {
    const key = dedupeKey(record);
    if (seen.has(key)) continue;
    seen.add(key);
    records.push(record);
  }

  const classes = [...new Set(records.map((record) => record.practice_data_class || record.practice_name_quality || record.lineage?.data_class).filter(Boolean))];
  const nextBody = {
    ...body,
    data: {
      ...body.data,
      page: {
        ...page,
        records,
        practice_discovery_graph: true,
        practice_data_classes: classes,
        practice_discovery_record_count: records.filter((record) => record.lineage?.discovery_graph === true).length
      }
    },
    receipt: {
      ...(body.receipt || {}),
      practice_discovery_graph: true,
      practice_data_classes: classes,
      record_count: records.length
    }
  };
  return responseFrom(result, nextBody);
};

export const _givingPracticeDiscoveryGraph = Object.freeze({
  DISCOVERY_PEOPLE,
  DISCOVERY_TX,
  ALIAS_CLUSTERS,
  KRABS_HOME,
  KRABS_BUSINESS,
  TREEDOME,
  SHADY_SHOALS,
  exactDiscoveryMatch,
  broadDiscoveryMatch,
  matchedDiscoveryNames,
  recordsForQuery,
  contributorsForCommittee,
  normalizeExistingRecord
});