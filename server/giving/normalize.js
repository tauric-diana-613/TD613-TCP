import { GIVING_RECORD_SCHEMA } from './constants.js';
import {
  amountToCents,
  canonicalJson,
  cleanText,
  isoDate,
  pick,
  sha256
} from './util.js';

const SUFFIXES = new Set(['JR', 'SR', 'II', 'III', 'IV', 'V']);
const ORGANIZATION_MARKERS = /\b(LLC|INC|CORP|CORPORATION|ASSOCIATION|PAC|COMMITTEE|UNION|FOUNDATION|PARTNERS|PARTNERSHIP|TRUST|COMPANY|CO\.?|BANK|CLUB)\b/i;

export function parseContributorName(rawValue) {
  const raw = cleanText(rawValue, 300);
  if (!raw) return { kind: 'UNKNOWN', display: null, given: null, middle: null, family: null, suffix: null };
  if (ORGANIZATION_MARKERS.test(raw)) {
    return { kind: 'ORGANIZATION', display: raw, organization: raw, given: null, middle: null, family: null, suffix: null };
  }
  let given = null;
  let middle = null;
  let family = null;
  let suffix = null;
  if (raw.includes(',')) {
    const [familyPart, givenPart = ''] = raw.split(',', 2).map((part) => part.trim());
    family = familyPart;
    const tokens = givenPart.split(/\s+/).filter(Boolean);
    if (SUFFIXES.has(String(tokens.at(-1) || '').replace(/\./g, '').toUpperCase())) suffix = tokens.pop();
    given = tokens.shift() || null;
    middle = tokens.join(' ') || null;
  } else {
    const tokens = raw.split(/\s+/).filter(Boolean);
    if (SUFFIXES.has(String(tokens.at(-1) || '').replace(/\./g, '').toUpperCase())) suffix = tokens.pop();
    given = tokens.shift() || null;
    family = tokens.pop() || null;
    middle = tokens.join(' ') || null;
  }
  return { kind: 'PERSON', display: raw, given, middle, family, suffix };
}

function baseRecord({ source, queryDigest, retrievedAt, raw, nativeIds = {}, fields = {}, lineage = {} }) {
  const rawCanonical = canonicalJson(raw);
  const localDigest = sha256({ source: source.id, query_digest: queryDigest, raw: rawCanonical });
  const amountCents = amountToCents(fields.amount);
  const rawName = cleanText(fields.contributorName, 300);
  const parsedName = parseContributorName(rawName);
  const provisional = Boolean(fields.provisional || lineage.provisional || amountCents === null);
  return {
    schema: GIVING_RECORD_SCHEMA,
    local_digest: localDigest,
    source_native_ids: nativeIds,
    source_family: source.family,
    source_instance_id: source.id,
    custodian: source.custodian,
    jurisdiction: source.jurisdiction,
    retrieved_at: retrievedAt,
    query_digest: queryDigest,
    source_locator: source.locator,
    committee: cleanText(fields.committee, 500),
    candidate: cleanText(fields.candidate, 500),
    office: cleanText(fields.office, 500),
    election: cleanText(fields.election, 250),
    cycle: Number.isFinite(Number(fields.cycle)) ? Number(fields.cycle) : null,
    reporting_context: cleanText(fields.reportingContext, 500),
    contributor_name_raw: rawName,
    contributor_name_parsed: parsedName,
    address: cleanText(fields.address, 500),
    city: cleanText(fields.city, 160),
    state: cleanText(fields.state, 80),
    zip: cleanText(fields.zip, 24),
    employer: cleanText(fields.employer, 300),
    occupation: cleanText(fields.occupation, 300),
    contribution_date: isoDate(fields.date),
    contribution_type: cleanText(fields.type, 180),
    amendment_status: cleanText(fields.amendmentStatus, 80),
    amount_cents: amountCents,
    raw_source_row: raw,
    evidence_status: 'OBSERVED',
    identity_status: 'UNREVIEWED',
    lineage: {
      ...lineage,
      analytical_total_status: provisional ? 'PROVISIONAL' : 'DETERMINISTIC_WITHIN_SOURCE_SEMANTICS'
    }
  };
}

export function normalizeFecRow(row, context) {
  const transactionId = cleanText(row.transaction_id, 200);
  const amendment = cleanText(row.amendment_indicator, 20);
  return baseRecord({
    ...context,
    raw: row,
    nativeIds: {
      sub_id: cleanText(row.sub_id, 200),
      transaction_id: transactionId,
      back_reference_transaction_id: cleanText(row.back_reference_transaction_id, 200),
      filing_id: row.filing_id ?? null,
      image_number: cleanText(row.image_number, 200)
    },
    fields: {
      committee: row.committee?.name || row.committee_name || row.committee_id,
      candidate: Array.isArray(row.committee?.candidate_ids) ? row.committee.candidate_ids.join(', ') : null,
      election: row.report_type,
      cycle: row.two_year_transaction_period || row.cycle,
      reportingContext: row.line_number_label || row.form_type,
      contributorName: row.contributor_name,
      address: [row.contributor_street_1, row.contributor_street_2].filter(Boolean).join(', '),
      city: row.contributor_city,
      state: row.contributor_state,
      zip: row.contributor_zip,
      employer: row.contributor_employer,
      occupation: row.contributor_occupation,
      date: row.contribution_receipt_date,
      type: row.line_number_label || row.entity_type,
      amendmentStatus: amendment,
      amount: row.contribution_receipt_amount,
      provisional: !transactionId || !amendment
    },
    lineage: {
      source_methodology: 'FEC_SCHEDULE_A_TRANSACTION_AND_AMENDMENT_LINEAGE_PRESERVED',
      transaction_id: transactionId,
      back_reference_transaction_id: cleanText(row.back_reference_transaction_id, 200),
      amendment_indicator: amendment,
      memoed_subtotal: Boolean(row.memoed_subtotal),
      memo_text: cleanText(row.memo_text, 500),
      provisional: !transactionId || !amendment,
      supersession_applied: false
    }
  });
}

export function normalizeFloridaRow(row, context) {
  const amendment = pick(row, ['Amendment', 'Amendment Indicator', 'Amd']);
  return baseRecord({
    ...context,
    raw: row,
    nativeIds: {
      sequence_number: cleanText(pick(row, ['Sequence', 'Sequence Number', 'Seq No']), 120),
      filing_id: cleanText(pick(row, ['Filing Id', 'Report Id', 'Record Id']), 120)
    },
    fields: {
      committee: pick(row, ['Committee', 'Committee Name', 'Candidate Committee']),
      candidate: pick(row, ['Candidate', 'Candidate Name']),
      office: pick(row, ['Office', 'Office Sought']),
      election: pick(row, ['Election', 'Election Year']),
      cycle: pick(row, ['Election Year', 'Cycle']),
      reportingContext: pick(row, ['Report', 'Report Type', 'Period']),
      contributorName: pick(row, ['Contributor Name', 'Contributor', 'Name', 'Last Name']),
      address: pick(row, ['Address', 'Street Address', 'Address 1']),
      city: pick(row, ['City']),
      state: pick(row, ['State']),
      zip: pick(row, ['Zip', 'Zip Code', 'Postal Code']),
      employer: pick(row, ['Employer']),
      occupation: pick(row, ['Occupation']),
      date: pick(row, ['Date', 'Contribution Date', 'Receipt Date']),
      type: pick(row, ['Contribution Type', 'Type', 'Contributor Type']),
      amendmentStatus: amendment,
      amount: pick(row, ['Amount', 'Contribution Amount']),
      provisional: !amendment
    },
    lineage: {
      source_methodology: 'FLORIDA_DIVISION_OF_ELECTIONS_TSV_ROW',
      amendment_marker: cleanText(amendment, 80),
      provisional: !amendment,
      supersession_applied: false
    }
  });
}

export function normalizeVoterFocusRow(row, context) {
  const amendment = pick(row, ['Amendment', 'Amended', 'Amendment Marker']);
  return baseRecord({
    ...context,
    raw: row,
    nativeIds: {
      candidate_or_committee_id: cleanText(pick(row, ['Candidate/Committee ID', 'Candidate ID', 'ID#']), 120),
      report_id: cleanText(pick(row, ['Report ID', 'Report']), 120)
    },
    fields: {
      committee: pick(row, ['Candidate/Committee', 'Committee Name', 'Candidate/Committee Name']),
      candidate: pick(row, ['Candidate Name', 'Candidate']),
      office: pick(row, ['Office', 'Office Sought']),
      election: pick(row, ['Election', 'Election/Committees', 'Reporting Group']),
      cycle: pick(row, ['Election Year', 'Cycle']),
      reportingContext: pick(row, ['Report', 'Report Type']),
      contributorName: pick(row, ['Contributor/Vendor Name', 'Contributor Name', 'Name', 'Last Name/Company Name']),
      address: pick(row, ['Address', 'Street Address']),
      city: pick(row, ['City']),
      state: pick(row, ['State']),
      zip: pick(row, ['Zip', 'Zip Code']),
      employer: pick(row, ['Employer']),
      occupation: pick(row, ['Occupation', 'Contributor Occupation']),
      date: pick(row, ['Date', 'Item Date', 'Contribution Date']),
      type: pick(row, ['Contribution Type', 'Transaction Type', 'Type']),
      amendmentStatus: amendment,
      amount: pick(row, ['Amount', 'Contribution Amount']),
      provisional: !amendment
    },
    lineage: {
      source_methodology: 'VOTERFOCUS_17_COLUMN_CSV_ROW',
      column_count: Object.keys(row).length,
      amendment_marker: cleanText(amendment, 80),
      provisional: !amendment,
      supersession_applied: false
    }
  });
}

export function normalizeEasyVoteRow(row, context) {
  const amendment = pick(row, ['Amendment', 'IsAmended', 'Amended']);
  return baseRecord({
    ...context,
    raw: row,
    nativeIds: {
      contribution_id: cleanText(pick(row, ['ContributionId', 'Id', 'RecordId']), 120),
      report_id: cleanText(pick(row, ['ReportId', 'Report ID']), 120)
    },
    fields: {
      committee: pick(row, ['CandidateCommitteeName', 'Candidate/Committee', 'CommitteeName']),
      candidate: pick(row, ['CandidateName', 'Candidate']),
      office: pick(row, ['OfficeName', 'Office']),
      election: pick(row, ['ElectionName', 'Election']),
      cycle: pick(row, ['ElectionYear', 'Cycle']),
      reportingContext: pick(row, ['ReportName', 'ReportType']),
      contributorName: pick(row, ['ContributorName', 'Contributor', 'Name']),
      address: pick(row, ['ContributorAddress', 'Address', 'Address1']),
      city: pick(row, ['ContributorCity', 'City']),
      state: pick(row, ['ContributorState', 'State']),
      zip: pick(row, ['ContributorZip', 'Zip', 'ZipCode']),
      employer: pick(row, ['Employer']),
      occupation: pick(row, ['Occupation']),
      date: pick(row, ['ContributionDate', 'Date', 'TransactionDate']),
      type: pick(row, ['ContributionType', 'Type']),
      amendmentStatus: amendment,
      amount: pick(row, ['Amount', 'ContributionAmount']),
      provisional: !amendment
    },
    lineage: {
      source_methodology: 'EASYVOTE_ANONYMOUS_JSON_ROW',
      amendment_marker: cleanText(amendment, 80),
      provisional: !amendment,
      supersession_applied: false
    }
  });
}
