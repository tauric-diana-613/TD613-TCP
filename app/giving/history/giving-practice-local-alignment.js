import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const LARRY = 'Larry Lobster for Mayor of Bikini Bottom';
const PUFF = 'Puff for Bikini Bottom School District #67';
const PLANKTON = 'Sheldon Plankton for Bikini Bottom Campaign';
const LOCAL_MAX_CENTS = 100000;

const ALIGNMENT_IDENTITIES = Object.freeze({
  'Eugene H. Krabs': {
    kind: 'PERSON', aliases: ['Eugene Krabs'], cluster: 'eugene-krabs',
    address: '1 Krusty Krab Plaza · FICTIONAL RESTAURANT', employer: 'Krusty Krab · FICTIONAL', occupation: 'Owner / Restaurateur · FICTIONAL'
  },
  'Pearl Krabs': {
    kind: 'PERSON', aliases: [], cluster: 'pearl-krabs',
    address: '17 Whale Tail Lane · FICTIONAL ANCHOR HOUSE', employer: 'Krusty Krab Family Holdings · FICTIONAL', occupation: 'Student / Heiress · FICTIONAL'
  },
  'Krusty Krab LLC': {
    kind: 'ORGANIZATION', aliases: ['Krusty Krab, LLC'], cluster: 'krusty-krab-llc',
    address: '1 Krusty Krab Plaza · FICTIONAL RESTAURANT', employer: 'SELF-ORGANIZATION · FICTIONAL', occupation: 'Restaurant company · FICTIONAL'
  }
});

const LOCAL_ALIGNMENT_TX = Object.freeze([
  {
    date: '2024-08-24',
    committee: LARRY,
    committee_kind: 'CANDIDATE_COMMITTEE',
    temporal_cluster: 'BBV-LARRY-MAXOUT-2024-08-24'
  },
  {
    date: '2025-09-06',
    committee: PUFF,
    committee_kind: 'CANDIDATE_COMMITTEE',
    temporal_cluster: 'BBV-PUFF-MAXOUT-2025-09-06'
  }
]);

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');

function aliasesFor(name) {
  const info = ALIGNMENT_IDENTITIES[name];
  return [name, ...(info?.aliases || [])];
}

function queryTerms(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(skeleton).filter(Boolean);
}

function queryMatchesIdentity(name, query = {}) {
  const aliases = aliasesFor(name).map(skeleton);
  const terms = queryTerms(query);
  if (Boolean(query.exact_match)) return terms.some((term) => aliases.includes(term));
  return terms.some((term) => aliases.some((alias) => alias.includes(term) || term.includes(alias)));
}

function parsedName(name, kind) {
  if (kind === 'ORGANIZATION') return { display: name, given: null, middle: null, family: null, suffix: null };
  const pieces = compact(name).split(/\s+/);
  return { display: name, given: pieces[0] || null, middle: pieces.length > 2 ? pieces.slice(1, -1).join(' ') : null, family: pieces.at(-1) || null, suffix: null };
}

function recordFor(name, tx) {
  const info = ALIGNMENT_IDENTITIES[name];
  const token = `local-alignment-${skeleton(name)}-${tx.date}-${skeleton(tx.committee)}`;
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: name,
    contributor_name: name,
    contributor_name_parsed: parsedName(name, info.kind),
    contributor_kind: info.kind,
    address: info.address,
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: info.employer, occupation: info.occupation,
    committee: tx.committee, committee_name: tx.committee, committee_kind: tx.committee_kind,
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    office: tx.committee === LARRY ? 'Mayor of Bikini Bottom · FICTIONAL' : 'Bikini Bottom School District #67 · FICTIONAL',
    cycle: tx.date.slice(0, 4), election: `${tx.date.slice(0, 4)} fictional cycle`, contribution_date: tx.date,
    contribution_type: 'FICTIONAL LOCAL MAXOUT CONTRIBUTION', amount_cents: LOCAL_MAX_CENTS,
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: PRACTICE_SOURCE_ID, custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(),
    source_native_ids: { practice_record_id: token, practice_temporal_cluster: tx.temporal_cluster },
    practice_data_class: 'SELECTIVE_LOCAL_ALIGNMENT',
    practice_identity_cluster: info.cluster,
    practice_temporal_cluster: tx.temporal_cluster,
    pedagogy_note: 'Three separate fictional donors each reach the local ordinary contribution ceiling on the same day. Their repeated support pattern may justify an alignment hypothesis, while the absence of observed giving to another candidate remains negative-space evidence rather than proof of opposition.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      discovery_graph: true,
      data_class: 'SELECTIVE_LOCAL_ALIGNMENT',
      identity_cluster: info.cluster,
      temporal_cluster: tx.temporal_cluster,
      local_candidate_committee: true,
      ordinary_contribution_limit_cents: LOCAL_MAX_CENTS,
      maxout_at_limit: true,
      negative_space_candidate: PLANKTON,
      opposition_inference_forbidden: true,
      coordination_inference_forbidden: true,
      evidence_authority: false,
      consequence_authority: false,
      external_retrieval: false,
      source_projection: 'BikiniBottomVotes'
    }
  };
}

function allRows() {
  return Object.keys(ALIGNMENT_IDENTITIES).flatMap((name) => LOCAL_ALIGNMENT_TX.map((tx) => recordFor(name, tx)));
}

function recordsForQuery(query = {}) {
  return Object.keys(ALIGNMENT_IDENTITIES)
    .filter((name) => queryMatchesIdentity(name, query))
    .flatMap((name) => LOCAL_ALIGNMENT_TX.map((tx) => recordFor(name, tx)))
    .filter((record) => {
      if (query.date_from && record.contribution_date < query.date_from) return false;
      if (query.date_to && record.contribution_date > query.date_to) return false;
      return true;
    });
}

function isKrabsBloc(record = {}) {
  const name = compact(record.contributor_name_raw || record.contributor_name || record.contributor_name_parsed?.display);
  return Object.keys(ALIGNMENT_IDENTITIES).some((candidate) => aliasesFor(candidate).includes(name));
}

function removePlanktonFromKrabsBloc(records = []) {
  return records.filter((record) => {
    const committee = compact(record.committee_name || record.committee);
    return !(committee === PLANKTON && isKrabsBloc(record));
  });
}

function contributorsForCommittee(committeeName) {
  const target = compact(committeeName);
  const rows = allRows().filter((record) => compact(record.committee_name) === target);
  return rows.map((record) => ({
    name: record.contributor_name,
    record_count: 1,
    total_cents: record.amount_cents,
    data_classes: ['SELECTIVE_LOCAL_ALIGNMENT']
  }));
}

function responseFrom(original, body, records) {
  const headers = new Headers(original.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify({
    ...body,
    data: {
      ...body.data,
      page: {
        ...body.data.page,
        records,
        practice_selective_alignment_present: true,
        practice_plankton_negative_space_preserved: true
      }
    },
    receipt: {
      ...(body.receipt || {}),
      practice_selective_alignment_present: true,
      plankton_negative_space_preserved: true,
      record_count: records.length
    }
  }), { status: original.status, statusText: original.statusText, headers });
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

  const filtered = removePlanktonFromKrabsBloc(page.records);
  const additions = recordsForQuery(query);
  const seen = new Set();
  const records = [];
  for (const record of [...filtered, ...additions]) {
    const key = String(record.digest || record.source_native_ids?.practice_record_id || '');
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    records.push(record);
  }
  return responseFrom(result, body, records);
};

export const _givingPracticeLocalAlignment = Object.freeze({
  LARRY,
  PUFF,
  PLANKTON,
  LOCAL_MAX_CENTS,
  ALIGNMENT_IDENTITIES,
  LOCAL_ALIGNMENT_TX,
  allRows,
  recordsForQuery,
  removePlanktonFromKrabsBloc,
  contributorsForCommittee
});