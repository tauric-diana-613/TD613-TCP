import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const LOCAL_LIMIT_CENTS = 100000;
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();

// SpongeBob is the practice in-kind lane: food/catering value moves across
// several political-object types while ordinary local-candidate entries remain
// beneath the fictional $1,000 ceiling. Larry's separate self-financing lane
// teaches candidate loans, so the two transaction classes remain visually and
// semantically distinct.
const IN_KIND_TX = Object.freeze([
  {
    date: '2021-09-18', amount_cents: 175000,
    committee: 'Friends of Aquaman PC', committee_kind: 'POLITICAL_COMMITTEE',
    description: 'Krusty Krab volunteer-night catering and boxed Krabby Patty meals · FICTIONAL'
  },
  {
    date: '2022-05-14', amount_cents: 225000,
    committee: 'Fishocratic Executive Committee', committee_kind: 'PARTY_EXECUTIVE_COMMITTEE',
    description: 'Convention food-service station, grill labor, and meal trays · FICTIONAL'
  },
  {
    date: '2023-08-12', amount_cents: 65000,
    committee: 'Puff for Bikini Bottom School District #67', committee_kind: 'CANDIDATE_COMMITTEE',
    description: 'Krusty Krab catering and Krabby Patty trays for a school-district event · FICTIONAL'
  },
  {
    date: '2024-03-30', amount_cents: 90000,
    committee: 'Sheldon Plankton for Bikini Bottom Campaign', committee_kind: 'CANDIDATE_COMMITTEE',
    description: 'Debate-night food service, beverages, and cleanup labor · FICTIONAL'
  },
  {
    date: '2025-06-07', amount_cents: 75000,
    committee: 'Larry Lobster for Mayor of Bikini Bottom', committee_kind: 'CANDIDATE_COMMITTEE',
    description: 'Goo Lagoon campaign-picnic catering and boxed lunches · FICTIONAL'
  },
  {
    date: '2025-11-15', amount_cents: 300000,
    committee: 'Every Villain Is Lemons PAC', committee_kind: 'PAC',
    description: 'Fundraiser buffet, grill service, and late-night snack trays · FICTIONAL'
  },
  {
    date: '2026-05-23', amount_cents: 425000,
    committee: 'Krusty Krab Parking Expansion Referendum Committee', committee_kind: 'ISSUE_REFERENDUM',
    description: 'Referendum canvass-launch catering, volunteer meals, and mobile grill service · FICTIONAL'
  }
]);

function clean(value) {
  return compact(value);
}

function queryMatches(query = {}) {
  const terms = [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])]
    .map((value) => clean(value).toLocaleLowerCase('en-US'))
    .filter(Boolean);
  return terms.some((term) => term === 'spongebob squarepants' || (!query.exact_match && (
    term.includes('spongebob') || term.includes('squarepants') || term.includes('sponge bob') || term.includes('square pants')
  )));
}

function dateMatches(date, query = {}) {
  if (query.date_from && date < query.date_from) return false;
  if (query.date_to && date > query.date_to) return false;
  return true;
}

function recordFor(tx, index) {
  const token = `in-kind-spongebob-${tx.date}-${index + 1}`;
  const localCandidate = tx.committee_kind === 'CANDIDATE_COMMITTEE';
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: 'SpongeBob SquarePants',
    contributor_name: 'SpongeBob SquarePants',
    contributor_name_parsed: { display: 'SpongeBob SquarePants', given: 'SpongeBob', middle: null, family: 'SquarePants', suffix: null },
    contributor_kind: 'PERSON',
    address: '124 Conch Street · FICTIONAL PINEAPPLE',
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: 'Krusty Krab · FICTIONAL', occupation: 'Fry Cook · FICTIONAL',
    committee: tx.committee, committee_name: tx.committee, committee_kind: tx.committee_kind,
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    office: tx.committee.includes('School District')
      ? 'Bikini Bottom School District #67 · FICTIONAL'
      : tx.committee.includes('Mayor')
        ? 'Mayor of Bikini Bottom · FICTIONAL'
        : tx.committee_kind === 'ISSUE_REFERENDUM'
          ? 'Issue / referendum · FICTIONAL'
          : null,
    cycle: tx.date.slice(0, 4), election: `${tx.date.slice(0, 4)} fictional cycle`, contribution_date: tx.date,
    contribution_type: 'IN-KIND', transaction_class: 'IN-KIND', amount_cents: tx.amount_cents,
    in_kind_description: tx.description,
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: PRACTICE_SOURCE_ID, custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(),
    raw_source_row: {
      'Contributor Name': 'SpongeBob SquarePants',
      'Contribution Type': 'IN-KIND',
      'In-Kind Description': tx.description,
      'Committee Name': tx.committee,
      Amount: (tx.amount_cents / 100).toFixed(2)
    },
    source_native_ids: { practice_record_id: token },
    practice_data_class: 'IN_KIND_TRANSACTION_CLASS',
    pedagogy_note: 'An in-kind contribution carries reportable value without arriving as an ordinary cash payment. The transaction class remains visible on the contribution card while local-candidate amounts still obey the fictional ordinary contribution ceiling.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      discovery_graph: true,
      data_class: 'IN_KIND_TRANSACTION_CLASS',
      transaction_class: 'IN-KIND',
      in_kind_description: tx.description,
      local_candidate_committee: localCandidate,
      ...(localCandidate ? { ordinary_contribution_limit_cents: LOCAL_LIMIT_CENTS } : {}),
      evidence_authority: false,
      consequence_authority: false,
      external_retrieval: false,
      source_projection: 'BikiniBottomVotes'
    }
  };
}

function allRows() {
  return IN_KIND_TX.map(recordFor);
}

function recordsForQuery(query = {}) {
  if (!queryMatches(query)) return [];
  return allRows().filter((record) => dateMatches(record.contribution_date, query));
}

function contributorsForCommittee(committeeName) {
  const target = compact(committeeName);
  const rows = allRows().filter((record) => compact(record.committee_name) === target);
  if (!rows.length) return [];
  return [{
    name: 'SpongeBob SquarePants',
    record_count: rows.length,
    total_cents: rows.reduce((sum, row) => sum + row.amount_cents, 0),
    data_classes: ['IN_KIND_TRANSACTION_CLASS']
  }];
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
        practice_in_kind_present: true,
        practice_in_kind_record_count: records.filter((record) => record.transaction_class === 'IN-KIND').length
      }
    },
    receipt: { ...(body.receipt || {}), practice_in_kind_present: true, record_count: records.length }
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
  const additions = recordsForQuery(query);
  if (!additions.length) return result;
  const body = await result.clone().json().catch(() => null);
  const page = body?.data?.page;
  if (!page || !Array.isArray(page.records)) return result;
  const seen = new Set(page.records.map((item) => String(item.digest || item.source_native_ids?.practice_record_id || '')));
  const records = [...page.records];
  for (const addition of additions) {
    const key = String(addition.digest || addition.source_native_ids?.practice_record_id || '');
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    records.push(addition);
  }
  return responseFrom(result, body, records);
};

export const _givingPracticeInKind = Object.freeze({
  LOCAL_LIMIT_CENTS,
  IN_KIND_TX,
  allRows,
  recordsForQuery,
  contributorsForCommittee,
  recordFor
});