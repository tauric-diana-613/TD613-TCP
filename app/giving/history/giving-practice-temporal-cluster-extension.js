import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const COMMITTEE = 'Every Villain Is Lemons PAC';
const CLUSTER = 'BBV-EVIL-2025-10-11';
const DATE = '2025-10-11';
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');

const IDENTITIES = Object.freeze({
  'Eugene H. Krabs': {
    aliases: ['Eugene Krabs'], kind: 'PERSON', cluster: 'eugene-krabs',
    address: '1 Krusty Krab Plaza · FICTIONAL RESTAURANT', employer: 'Krusty Krab · FICTIONAL', occupation: 'Owner / Restaurateur · FICTIONAL', amount_cents: 8000000
  },
  'Pearl Krabs': {
    aliases: [], kind: 'PERSON', cluster: 'pearl-krabs',
    address: '17 Whale Tail Lane · FICTIONAL ANCHOR HOUSE', employer: 'Krusty Krab Family Holdings · FICTIONAL', occupation: 'Student / Heiress · FICTIONAL', amount_cents: 12000000
  },
  'Krusty Krab LLC': {
    aliases: ['Krusty Krab, LLC'], kind: 'ORGANIZATION', cluster: 'krusty-krab-llc',
    address: '1 Krusty Krab Plaza · FICTIONAL RESTAURANT', employer: 'SELF-ORGANIZATION · FICTIONAL', occupation: 'Restaurant company · FICTIONAL', amount_cents: 32000000
  }
});

function queryTerms(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(skeleton).filter(Boolean);
}

function matchedNames(query = {}) {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const exact = Boolean(query.exact_match);
  return Object.entries(IDENTITIES).filter(([name, info]) => {
    const aliases = [name, ...info.aliases].map(skeleton);
    if (exact) return terms.some((term) => aliases.includes(term));
    return terms.some((term) => aliases.some((alias) => alias.includes(term) || term.includes(alias) || alias.split(/(?=[A-Z])/).includes(term)));
  }).map(([name]) => name);
}

function parsedName(name, kind) {
  if (kind === 'ORGANIZATION') return { display: name, given: null, middle: null, family: null, suffix: null };
  const pieces = compact(name).split(/\s+/);
  return { display: name, given: pieces[0] || null, middle: pieces.length > 2 ? pieces.slice(1, -1).join(' ') : null, family: pieces.at(-1) || null, suffix: null };
}

function recordFor(name) {
  const info = IDENTITIES[name];
  const token = `temporal-extension-${skeleton(name)}-${DATE}`;
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: parsedName(name, info.kind),
    contributor_kind: info.kind,
    address: info.address,
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: info.employer, occupation: info.occupation,
    committee: COMMITTEE, committee_name: COMMITTEE, committee_kind: 'PAC',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL', office: null,
    cycle: '2025', election: '2025 fictional cycle', contribution_date: DATE,
    contribution_type: 'FICTIONAL LARGE-DOLLAR CONTRIBUTION', amount_cents: info.amount_cents,
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: PRACTICE_SOURCE_ID, custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(),
    source_native_ids: { practice_record_id: token, practice_temporal_cluster: CLUSTER },
    practice_data_class: 'CO_TEMPORAL_CONTRIBUTION_CLUSTER',
    practice_identity_cluster: info.cluster,
    practice_temporal_cluster: CLUSTER,
    pedagogy_note: 'This large same-day PAC cluster repeats a pattern already visible elsewhere while the contributors retain different longitudinal profiles. Repetition strengthens salience, not proof of coordination.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      discovery_graph: true,
      data_class: 'CO_TEMPORAL_CONTRIBUTION_CLUSTER',
      temporal_cluster: CLUSTER,
      committee_kind: 'PAC',
      identity_cluster: info.cluster,
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

function recordsForQuery(query = {}) {
  if (query.date_from && DATE < query.date_from) return [];
  if (query.date_to && DATE > query.date_to) return [];
  return matchedNames(query).map(recordFor);
}

function allRows() {
  return Object.keys(IDENTITIES).map(recordFor);
}

function contributorsForCommittee(committeeName) {
  if (compact(committeeName) !== COMMITTEE) return [];
  return allRows().map((record) => ({
    name: record.contributor_name,
    record_count: 1,
    total_cents: record.amount_cents,
    data_classes: [record.practice_data_class]
  }));
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
  return responseFrom(result, {
    ...body,
    data: { ...body.data, page: { ...page, records, practice_temporal_extension_present: true } },
    receipt: { ...(body.receipt || {}), practice_temporal_extension_present: true, record_count: records.length }
  });
};

export const _givingPracticeTemporalClusterExtension = Object.freeze({
  COMMITTEE,
  CLUSTER,
  DATE,
  IDENTITIES,
  recordsForQuery,
  allRows,
  contributorsForCommittee
});