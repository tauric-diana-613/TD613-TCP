import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const REFERENDUM = 'Krusty Krab Parking Expansion Referendum Committee';
const FISHOCRATIC = 'Fishocratic Executive Committee';
const AQUAMAN = 'Friends of Aquaman PC';
const PUFF = 'Puff for Bikini Bottom School District #67';
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');
const words = (value) => folded(value).split(/[^a-z0-9]+/).filter((token) => token.length >= 3);

const KRABS_CLUSTER_IDENTITIES = Object.freeze({
  'Eugene H. Krabs': {
    kind: 'PERSON', aliases: ['Eugene Krabs'], address: '1 Krusty Krab Plaza · FICTIONAL RESTAURANT',
    employer: 'Krusty Krab · FICTIONAL', occupation: 'Owner / Restaurateur · FICTIONAL', cluster: 'eugene-krabs'
  },
  'Pearl Krabs': {
    kind: 'PERSON', aliases: [], address: '17 Whale Tail Lane · FICTIONAL ANCHOR HOUSE',
    employer: 'Krusty Krab Family Holdings · FICTIONAL', occupation: 'Student / Heiress · FICTIONAL', cluster: 'pearl-krabs'
  },
  'Krusty Krab LLC': {
    kind: 'ORGANIZATION', aliases: ['Krusty Krab, LLC'], address: '1 Krusty Krab Plaza · FICTIONAL RESTAURANT',
    employer: 'SELF-ORGANIZATION · FICTIONAL', occupation: 'Restaurant company · FICTIONAL', cluster: 'krusty-krab-llc'
  }
});

// New gifts only. Existing practice gifts remain untouched.
// Eugene's ordinary recurring history peaks around $10k and Pearl's ordinary
// practice history remains much smaller/broader. These episodic clusters are
// intentionally conspicuous magnitude spikes against those otherwise divergent profiles.
const TEMPORAL_CLUSTER_TX = Object.freeze([
  { committee: REFERENDUM, committee_kind: 'ISSUE_REFERENDUM', date: '2022-12-03', temporal_cluster: 'BBV-REF-2022-12-03', gifts: {
    'Eugene H. Krabs': 7500000,
    'Pearl Krabs': 10000000,
    'Krusty Krab LLC': 30000000
  } },
  { committee: REFERENDUM, committee_kind: 'ISSUE_REFERENDUM', date: '2024-09-14', temporal_cluster: 'BBV-REF-2024-09-14', gifts: {
    'Eugene H. Krabs': 10000000,
    'Pearl Krabs': 15000000,
    'Krusty Krab LLC': 45000000
  } },
  { committee: REFERENDUM, committee_kind: 'ISSUE_REFERENDUM', date: '2026-04-25', temporal_cluster: 'BBV-REF-2026-04-25', gifts: {
    'Eugene H. Krabs': 15000000,
    'Pearl Krabs': 22500000,
    'Krusty Krab LLC': 60000000
  } },
  { committee: FISHOCRATIC, committee_kind: 'PARTY_EXECUTIVE_COMMITTEE', date: '2021-10-02', temporal_cluster: 'BBV-FEC-2021-10-02', gifts: {
    'Eugene H. Krabs': 5000000,
    'Pearl Krabs': 7500000,
    'Krusty Krab LLC': 20000000
  } },
  { committee: AQUAMAN, committee_kind: 'POLITICAL_COMMITTEE', date: '2023-06-17', temporal_cluster: 'BBV-AQUA-2023-06-17', gifts: {
    'Eugene H. Krabs': 6000000,
    'Pearl Krabs': 9000000,
    'Krusty Krab LLC': 24000000
  } },
  { committee: PUFF, committee_kind: 'CANDIDATE_COMMITTEE', date: '2025-03-22', temporal_cluster: 'BBV-PUFF-2025-03-22', gifts: {
    'Eugene H. Krabs': 4000000,
    'Pearl Krabs': 6500000,
    'Krusty Krab LLC': 18000000
  } }
]);

function aliasesFor(name) {
  const person = KRABS_CLUSTER_IDENTITIES[name];
  return [name, ...(person?.aliases || [])];
}

function queryTerms(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(compact).filter(Boolean);
}

function exactMatchesIdentity(name, term) {
  return aliasesFor(name).some((candidate) => skeleton(candidate) === skeleton(term));
}

function broadMatchesIdentity(name, term) {
  if (exactMatchesIdentity(name, term)) return true;
  const candidateWords = new Set(aliasesFor(name).flatMap(words));
  return words(term).some((word) => candidateWords.has(word));
}

function matchedClusterIdentities(query = {}) {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const exact = Boolean(query.exact_match);
  return Object.keys(KRABS_CLUSTER_IDENTITIES).filter((name) => terms.some((term) => exact ? exactMatchesIdentity(name, term) : broadMatchesIdentity(name, term)));
}

function parsedName(name, kind) {
  if (kind === 'ORGANIZATION') return { display: name, given: null, middle: null, family: null, suffix: null };
  const pieces = compact(name).split(/\s+/);
  return { display: name, given: pieces[0] || null, middle: pieces.length > 2 ? pieces.slice(1, -1).join(' ') : null, family: pieces.at(-1) || null, suffix: null };
}

function recordFor(name, cluster) {
  const person = KRABS_CLUSTER_IDENTITIES[name];
  const amountCents = cluster.gifts[name];
  const token = `temporal-cluster-${skeleton(name)}-${cluster.date}-${skeleton(cluster.committee)}`;
  const referendum = cluster.committee === REFERENDUM;
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: parsedName(name, person.kind),
    contributor_kind: person.kind,
    address: person.address,
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: person.employer, occupation: person.occupation,
    committee: cluster.committee,
    committee_name: cluster.committee,
    committee_kind: cluster.committee_kind,
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    office: referendum ? 'Issue / referendum · FICTIONAL' : null,
    cycle: cluster.date.slice(0, 4), election: `${cluster.date.slice(0, 4)} fictional cycle`, contribution_date: cluster.date,
    contribution_type: referendum ? 'FICTIONAL LARGE-DOLLAR REFERENDUM CONTRIBUTION' : 'FICTIONAL LARGE-DOLLAR CONTRIBUTION',
    amount_cents: amountCents,
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: PRACTICE_SOURCE_ID, custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(),
    source_native_ids: { practice_record_id: token, practice_temporal_cluster: cluster.temporal_cluster },
    practice_data_class: 'CO_TEMPORAL_CONTRIBUTION_CLUSTER',
    practice_identity_cluster: person.cluster,
    practice_temporal_cluster: cluster.temporal_cluster,
    pedagogy_note: 'Separate fictional donors with otherwise divergent giving profiles gave unusually large amounts to the same political object on the same filing date. Repeated co-temporality and magnitude spikes are investigatory patterns, not proof of common identity, control, or coordination.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      discovery_graph: true,
      data_class: 'CO_TEMPORAL_CONTRIBUTION_CLUSTER',
      temporal_cluster: cluster.temporal_cluster,
      committee_kind: cluster.committee_kind,
      identity_cluster: person.cluster,
      magnitude_spike: true,
      longitudinal_profiles_remain_distinct: true,
      evidence_authority: false,
      consequence_authority: false,
      external_retrieval: false,
      source_projection: 'BikiniBottomVotes',
      coordination_inference_forbidden: true,
      identity_collapse_forbidden: true
    }
  };
}

function recordsForIdentity(name) {
  return TEMPORAL_CLUSTER_TX.flatMap((cluster) => Number.isSafeInteger(cluster.gifts[name]) ? [recordFor(name, cluster)] : []);
}

function dateMatches(record, query = {}) {
  const date = String(record?.contribution_date || '');
  if (query.date_from && date < query.date_from) return false;
  if (query.date_to && date > query.date_to) return false;
  return true;
}

function recordsForQuery(query = {}) {
  return matchedClusterIdentities(query).flatMap(recordsForIdentity).filter((record) => dateMatches(record, query));
}

function allTemporalClusterRows() {
  return Object.keys(KRABS_CLUSTER_IDENTITIES).flatMap((name) => recordsForIdentity(name));
}

function contributorsForCommittee(committeeName) {
  const target = compact(committeeName);
  const byName = new Map();
  for (const record of allTemporalClusterRows()) {
    if (compact(record.committee_name) !== target) continue;
    const entry = byName.get(record.contributor_name) || { name: record.contributor_name, record_count: 0, total_cents: 0, data_classes: new Set() };
    entry.record_count += 1;
    entry.total_cents += record.amount_cents;
    entry.data_classes.add(record.practice_data_class);
    byName.set(record.contributor_name, entry);
  }
  return [...byName.values()].map((entry) => ({ ...entry, data_classes: [...entry.data_classes] }));
}

function totalsByCommittee() {
  const totals = new Map();
  for (const record of allTemporalClusterRows()) totals.set(record.committee_name, (totals.get(record.committee_name) || 0) + record.amount_cents);
  return Object.fromEntries(totals);
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

  const additions = recordsForQuery(query);
  if (!additions.length) return result;
  const seen = new Set();
  const records = [];
  for (const record of [...page.records, ...additions]) {
    const key = String(record.digest || record.source_native_ids?.practice_record_id || '');
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    records.push(record);
  }

  const totals = totalsByCommittee();
  return responseFrom(result, {
    ...body,
    data: {
      ...body.data,
      page: {
        ...page,
        records,
        practice_temporal_cluster_present: true,
        practice_temporal_cluster_committee_count: Object.keys(totals).length,
        practice_referendum_cluster_total_cents: totals[REFERENDUM] || 0,
        practice_temporal_cluster_totals_cents: totals,
        practice_coordination_inference_forbidden: true
      }
    },
    receipt: {
      ...(body.receipt || {}),
      practice_temporal_cluster_present: true,
      practice_temporal_cluster_committee_count: Object.keys(totals).length,
      record_count: records.length,
      coordination_inference_forbidden: true
    }
  });
};

export const _givingPracticeReferendumCluster = Object.freeze({
  REFERENDUM,
  FISHOCRATIC,
  AQUAMAN,
  PUFF,
  KRABS_CLUSTER_IDENTITIES,
  TEMPORAL_CLUSTER_TX,
  matchedClusterIdentities,
  recordsForQuery,
  allTemporalClusterRows,
  contributorsForCommittee,
  totalsByCommittee
});