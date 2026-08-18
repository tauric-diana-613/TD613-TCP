import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
export const LOCAL_ORDINARY_LIMIT_CENTS = 100000;
export const LOCAL_CANDIDATE_COMMITTEES = Object.freeze([
  'Puff for Bikini Bottom School District #67',
  'Sheldon Plankton for Bikini Bottom Campaign',
  'Larry Lobster for Mayor of Bikini Bottom'
]);
const LARRY_COMMITTEE = 'Larry Lobster for Mayor of Bikini Bottom';
const LARRY_HOME = '7 Muscle Beach Walk · FICTIONAL GYM FLAT';

const LARRY_SELF_LOANS = Object.freeze([
  { date: '2021-01-09', amount_cents: 7500000, loan_id: 'BBV-LARRY-LOAN-2021-01' },
  { date: '2022-08-27', amount_cents: 12500000, loan_id: 'BBV-LARRY-LOAN-2022-08' },
  { date: '2024-02-10', amount_cents: 20000000, loan_id: 'BBV-LARRY-LOAN-2024-02' },
  { date: '2026-01-17', amount_cents: 30000000, loan_id: 'BBV-LARRY-LOAN-2026-01' }
]);

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');

function normalizeCommitteeName(value) {
  return value === 'Mrs. Puff for Bikini Bottom School District #67'
    ? 'Puff for Bikini Bottom School District #67'
    : compact(value);
}

function isLocalCandidateCommittee(value) {
  const committee = normalizeCommitteeName(value);
  return LOCAL_CANDIDATE_COMMITTEES.includes(committee);
}

function isCandidateLoan(record) {
  return record?.candidate_self_financing === true || record?.practice_candidate_loan === true || /CANDIDATE LOAN/i.test(String(record?.contribution_type || ''));
}

function isPreservedComplianceAnomaly(record) {
  return Boolean(
    record?.practice_over_limit_anomaly === true &&
    String(record?.transaction_class || record?.contribution_type || '').toLocaleUpperCase('en-US').includes('IN-KIND')
  );
}

function normalizeLocalCampaignRecord(record) {
  if (!record || typeof record !== 'object') return record;
  const committee = normalizeCommitteeName(record.committee_name || record.committee);
  if (!isLocalCandidateCommittee(committee)) return { ...record, committee, committee_name: committee };

  if (isCandidateLoan(record)) {
    return {
      ...record,
      committee,
      committee_name: committee,
      transaction_class: 'LOAN',
      practice_local_campaign_rule: 'CANDIDATE_SELF_FINANCING_SEPARATE_FROM_ORDINARY_LIMIT',
      lineage: {
        ...(record.lineage || {}),
        local_candidate_committee: true,
        ordinary_contribution_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
        candidate_self_financing: true,
        ordinary_limit_applies: false
      }
    };
  }

  if (isPreservedComplianceAnomaly(record)) {
    return {
      ...record,
      committee,
      committee_name: committee,
      practice_local_campaign_rule: 'PRESERVE_OBSERVED_OVER_LIMIT_IN_KIND_FOR_REVIEW',
      practice_local_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
      practice_compliance_review_required: true,
      lineage: {
        ...(record.lineage || {}),
        local_candidate_committee: true,
        ordinary_contribution_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
        ordinary_limit_applies: true,
        preserve_observed_value: true,
        compliance_review_required: true,
        fixture_amount_normalization_forbidden: true
      }
    };
  }

  const amount = Number(record.amount_cents);
  const capped = Number.isFinite(amount) && amount > LOCAL_ORDINARY_LIMIT_CENTS;
  return {
    ...record,
    committee,
    committee_name: committee,
    amount_cents: capped ? LOCAL_ORDINARY_LIMIT_CENTS : record.amount_cents,
    practice_local_campaign_rule: 'ORDINARY_CONTRIBUTION_LIMIT',
    practice_local_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
    ...(capped ? { practice_fixture_amount_corrected: true } : {}),
    lineage: {
      ...(record.lineage || {}),
      local_candidate_committee: true,
      ordinary_contribution_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
      candidate_self_financing: false,
      ordinary_limit_applies: true,
      ...(capped ? { fixture_amount_normalized_to_limit: true } : {})
    }
  };
}

function queryTerms(query = {}) {
  return [query.name, ...(Array.isArray(query.aliases) ? query.aliases : [])].map(skeleton).filter(Boolean);
}

function queryMatchesLarry(query = {}) {
  const terms = queryTerms(query);
  return terms.some((term) => ['larrylobster', 'lawrencelobster'].includes(term));
}

function dateMatches(date, query = {}) {
  if (query.date_from && date < query.date_from) return false;
  if (query.date_to && date > query.date_to) return false;
  return true;
}

function larryLoanRecord(loan) {
  const token = `candidate-loan-larry-lobster-${loan.date}`;
  return {
    digest: `practice:${_givingPracticeHydration.PRACTICE_FIXTURE_ID}:${token}`,
    contributor_name_raw: 'Larry Lobster',
    contributor_name: 'Larry Lobster',
    contributor_name_parsed: { display: 'Larry Lobster', given: 'Larry', middle: null, family: 'Lobster', suffix: null },
    contributor_kind: 'PERSON',
    address: LARRY_HOME,
    city: 'Bikini Bottom', state: 'Oceania', zip: 'X',
    employer: 'Goo Lagoon Fitness Club · FICTIONAL',
    occupation: 'Lifeguard / Trainer / Candidate · FICTIONAL',
    committee: LARRY_COMMITTEE,
    committee_name: LARRY_COMMITTEE,
    committee_kind: 'CANDIDATE_COMMITTEE',
    jurisdiction: 'Bikini Bottom, Oceania · FICTIONAL',
    office: 'Mayor of Bikini Bottom · FICTIONAL',
    cycle: loan.date.slice(0, 4),
    election: `${loan.date.slice(0, 4)} fictional cycle`,
    contribution_date: loan.date,
    contribution_type: 'FICTIONAL CANDIDATE LOAN',
    transaction_class: 'LOAN',
    amount_cents: loan.amount_cents,
    candidate_self_financing: true,
    practice_candidate_loan: true,
    loan_outstanding_cents: loan.amount_cents,
    source_family: 'FICTIONAL_PRACTICE',
    source_instance_id: PRACTICE_SOURCE_ID,
    custodian: 'BikiniBottomVotes',
    evidence_status: 'FICTIONAL_SAMPLE',
    retrieved_at: new Date().toISOString(),
    raw_source_row: {
      'Contributor Name': 'Larry Lobster',
      'Loan Type': 'CANDIDATE LOAN',
      'Transaction Type': 'LOAN',
      Amount: (loan.amount_cents / 100).toFixed(2)
    },
    source_native_ids: { practice_record_id: token, practice_loan_id: loan.loan_id },
    practice_data_class: 'CANDIDATE_SELF_FINANCING',
    practice_identity_cluster: 'larry-lobster',
    pedagogy_note: 'Candidate self-financing is represented as a loan, not as an ordinary donor contribution. The ordinary local contribution ceiling therefore remains visible rather than being treated as a generic exception.',
    lineage: {
      schema: 'td613.giving.practice-lineage/v1',
      practice_fixture_id: _givingPracticeHydration.PRACTICE_FIXTURE_ID,
      manifestly_fictional: true,
      practice_record: true,
      discovery_graph: true,
      data_class: 'CANDIDATE_SELF_FINANCING',
      transaction_class: 'LOAN',
      identity_cluster: 'larry-lobster',
      local_candidate_committee: true,
      ordinary_contribution_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
      candidate_self_financing: true,
      ordinary_limit_applies: false,
      evidence_authority: false,
      consequence_authority: false,
      external_retrieval: false,
      source_projection: 'BikiniBottomVotes'
    }
  };
}

function larryLoansForQuery(query = {}) {
  if (!queryMatchesLarry(query)) return [];
  return LARRY_SELF_LOANS.filter((loan) => dateMatches(loan.date, query)).map(larryLoanRecord);
}

function allLarryLoanRows() {
  return LARRY_SELF_LOANS.map(larryLoanRecord);
}

function contributorsForCommittee(committeeName) {
  if (normalizeCommitteeName(committeeName) !== LARRY_COMMITTEE) return [];
  const rows = allLarryLoanRows();
  return [{
    name: 'Larry Lobster',
    record_count: rows.length,
    total_cents: rows.reduce((sum, row) => sum + row.amount_cents, 0),
    data_classes: ['CANDIDATE_SELF_FINANCING']
  }];
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

  const normalized = page.records.map(normalizeLocalCampaignRecord);
  const additions = larryLoansForQuery(query);
  const seen = new Set();
  const records = [];
  for (const record of [...normalized, ...additions]) {
    const key = String(record.digest || record.source_native_ids?.practice_record_id || '');
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    records.push(record);
  }

  return responseFrom(result, {
    ...body,
    data: {
      ...body.data,
      page: {
        ...page,
        records,
        practice_local_campaign_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
        practice_candidate_self_financing_present: records.some((record) => record.candidate_self_financing === true),
        practice_preserved_limit_anomaly_present: records.some((record) => record.practice_over_limit_anomaly === true)
      }
    },
    receipt: {
      ...(body.receipt || {}),
      practice_local_campaign_limit_cents: LOCAL_ORDINARY_LIMIT_CENTS,
      candidate_self_financing_separate: true,
      preserved_limit_anomaly: records.some((record) => record.practice_over_limit_anomaly === true),
      record_count: records.length
    }
  });
};

export const _givingPracticeLocalCampaignRules = Object.freeze({
  LOCAL_ORDINARY_LIMIT_CENTS,
  LOCAL_CANDIDATE_COMMITTEES,
  LARRY_COMMITTEE,
  LARRY_SELF_LOANS,
  normalizeLocalCampaignRecord,
  larryLoansForQuery,
  allLarryLoanRows,
  contributorsForCommittee,
  isLocalCandidateCommittee,
  isPreservedComplianceAnomaly
});