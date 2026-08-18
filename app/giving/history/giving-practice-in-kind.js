import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const DATE = '2023-08-12';
const COMMITTEE = 'Puff for Bikini Bottom School District #67';
const AMOUNT_CENTS = 65000;

function clean(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function queryMatches(query = {}) {
  const terms = [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])]
    .map((value) => clean(value).toLocaleLowerCase('en-US'))
    .filter(Boolean);
  return terms.some((term) => term === 'spongebob squarepants' || (!query.exact_match && (term.includes('spongebob') || term.includes('squarepants'))));
}

function dateMatches(query = {}) {
  if (query.date_from && DATE < query.date_from) return false;
  if (query.date_to && DATE > query.date_to) return false;
  return true;
}

function record() {
  const token = 'in-kind-spongebob-puff-2023-08-12';
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: 'SpongeBob SquarePants',
    contributor_name: 'SpongeBob SquarePants',
    contributor_name_parsed: { display: 'SpongeBob SquarePants', given: 'SpongeBob', middle: null, family: 'SquarePants', suffix: null },
    contributor_kind: 'PERSON',
    address: '124 Conch Street · FICTIONAL PINEAPPLE',
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: 'Krusty Krab · FICTIONAL', occupation: 'Fry Cook · FICTIONAL',
    committee: COMMITTEE, committee_name: COMMITTEE, committee_kind: 'CANDIDATE_COMMITTEE',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL', office: 'Bikini Bottom School District #67 · FICTIONAL',
    cycle: '2023', election: '2023 fictional cycle', contribution_date: DATE,
    contribution_type: 'IN-KIND', transaction_class: 'IN-KIND', amount_cents: AMOUNT_CENTS,
    in_kind_description: 'Krusty Krab catering and Krabby Patty trays · FICTIONAL',
    source_family: 'FICTIONAL_PRACTICE', source_instance_id: PRACTICE_SOURCE_ID, custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE', retrieved_at: new Date().toISOString(),
    raw_source_row: {
      'Contributor Name': 'SpongeBob SquarePants',
      'Contribution Type': 'IN-KIND',
      'In-Kind Description': 'Krusty Krab catering and Krabby Patty trays · FICTIONAL',
      Amount: '650.00'
    },
    source_native_ids: { practice_record_id: token },
    practice_data_class: 'IN_KIND_TRANSACTION_CLASS',
    pedagogy_note: 'An in-kind contribution carries value without arriving as an ordinary cash payment. The transaction class remains visible on the contribution card while the amount still participates in the local practice limit.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      discovery_graph: true,
      data_class: 'IN_KIND_TRANSACTION_CLASS',
      transaction_class: 'IN-KIND',
      local_candidate_committee: true,
      ordinary_contribution_limit_cents: 100000,
      evidence_authority: false,
      consequence_authority: false,
      external_retrieval: false,
      source_projection: 'BikiniBottomVotes'
    }
  };
}

function responseFrom(original, body, records) {
  const headers = new Headers(original.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify({
    ...body,
    data: { ...body.data, page: { ...body.data.page, records, practice_in_kind_present: true } },
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
  if (envelope?.operation !== 'search.page' || envelope?.payload?.source_instance_id !== PRACTICE_SOURCE_ID || !query || !queryMatches(query) || !dateMatches(query)) return result;
  const body = await result.clone().json().catch(() => null);
  const page = body?.data?.page;
  if (!page || !Array.isArray(page.records)) return result;
  const addition = record();
  if (page.records.some((item) => item.digest === addition.digest)) return result;
  return responseFrom(result, body, [...page.records, addition]);
};

export const _givingPracticeInKind = Object.freeze({ DATE, COMMITTEE, AMOUNT_CENTS, record });