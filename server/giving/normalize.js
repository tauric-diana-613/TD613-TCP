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

function contributorKindHint(value) {
  const cleaned = cleanText(value, 120);
  if (!cleaned) return null;
  const type = cleaned.toUpperCase();
  if (/\b(IND|INDIVIDUAL|PERSON|PERSONAL|HUMAN)\b/.test(type)) return 'PERSON';
  if (/\b(ORG|ORGANIZATION|BUSINESS|CORP|CORPORATION|COMPANY|COMMITTEE|PAC|PARTY|ASSOCIATION|UNION|ENTITY|TRUST|FOUNDATION)\b/.test(type)) return 'ORGANIZATION';
  return null;
}

export function parseContributorName(rawValue, kindValue = null) {
  const raw = cleanText(rawValue, 300);
  const hint = contributorKindHint(kindValue);
  if (!raw) return { kind: 'UNKNOWN', display: null, given: null, middle: null, family: null, suffix: null };
  if (hint === 'ORGANIZATION' || (!hint && ORGANIZATION_MARKERS.test(raw))) {
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

function personDisplayAdmitted(parsedName, sourceRawName, kindValue = null) {
  const raw = cleanText(sourceRawName, 300);
  const hint = contributorKindHint(kindValue);
  return Boolean(parsedName?.kind === 'PERSON' && parsedName.family && parsedName.given && (hint === 'PERSON' || raw.includes(',')));
}

export function contributorDisplayName(parsedName, sourceRawName, kindValue = null) {
  const raw = cleanText(sourceRawName, 300);
  if (!personDisplayAdmitted(parsedName, raw, kindValue)) return raw;
  const givenSide = [parsedName.given, parsedName.middle, parsedName.suffix].filter(Boolean).join(' ');
  return cleanText(`${parsedName.family}, ${givenSide}`, 300).toLocaleUpperCase('en-US');
}

function normalizedHeader(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function firstNonEmpty(row, aliases) {
  const value = pick(row, aliases);
  return cleanText(value, 300);
}

function voterFocusFirstName(row) {
  return firstNonEmpty(row, [
    'Contributor First Name',
    'Contributor/Vendor First Name',
    'Contributor/Vendor First',
    'First Name',
    'First'
  ]);
}

function voterFocusContributorKind(row) {
  const explicit = firstNonEmpty(row, [
    'Contributor Type',
    'Contributor/Vendor Type',
    'Contributor Entity Type',
    'Entity Type'
  ]);
  if (contributorKindHint(explicit)) return explicit;
  return voterFocusFirstName(row) ? 'PERSON' : null;
}

function voterFocusContributorName(row) {
  // VoterFocus county exports can expose a generic “Contributor Name” column that
  // contains only the given name while the family/company name lives in a
  // separate column. Split name evidence therefore has precedence whenever a
  // family/company field exists; the generic combined field remains the fallback
  // for counties that genuinely export a full contributor name in one column.
  const first = voterFocusFirstName(row);
  const middle = firstNonEmpty(row, [
    'Contributor Middle Name',
    'Contributor/Vendor Middle Name',
    'Contributor/Vendor Middle',
    'Middle Name',
    'Middle',
    'MI'
  ]);
  const lastOrCompany = firstNonEmpty(row, [
    'Contributor Last Name',
    'Contributor/Vendor Last Name',
    'Contributor Last Name/Company Name',
    'Contributor/Vendor Last Name/Company Name',
    'Last Name',
    'Last Name/Company Name',
    'Last Name/Company',
    'Last/Company Name',
    'Last Name or Company Name',
    'Company/Last Name',
    'Company Name',
    'Organization Name'
  ]);

  if (lastOrCompany && (first || middle)) {
    return `${lastOrCompany}, ${[first, middle].filter(Boolean).join(' ')}`;
  }
  if (lastOrCompany) return lastOrCompany;

  const combined = firstNonEmpty(row, [
    'Contributor/Vendor Name',
    'Contributor Full Name',
    'Contributor Name',
    'Contributor/Vendor',
    'Contributor',
    'Vendor Name',
    'Payor Name'
  ]);
  if (combined) return combined;
  if (first || middle) return [first, middle].filter(Boolean).join(' ');

  for (const [key, value] of Object.entries(row || {})) {
    const header = normalizedHeader(key);
    if (!value || header.includes('candidate') || header.includes('committee')) continue;
    const contributorish = header.includes('contributor') || header.includes('vendor') || header.includes('donor') || header.includes('payor');
    const nameish = header.includes('name') || header === 'contributorvendor' || header === 'contributor';
    if (contributorish && nameish) {
      const inferred = cleanText(value, 300);
      if (inferred) return inferred;
    }
  }
  return null;
}

function baseRecord({ source, queryDigest, retrievedAt, raw, nativeIds = {}, fields = {}, lineage = {} }) {
  const rawCanonical = canonicalJson(raw);
  const localDigest = sha256({ source: source.id, query_digest: queryDigest, raw: rawCanonical });
  const amountCents = amountToCents(fields.amount);
  const sourceRawName = cleanText(fields.contributorName, 300);
  const kindHint = contributorKindHint(fields.contributorKind);
  const parsedName = parseContributorName(sourceRawName, kindHint);
  const displayName = contributorDisplayName(parsedName, sourceRawName, kindHint);
  const normalizedPersonDisplay = personDisplayAdmitted(parsedName, sourceRawName, kindHint);
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
    source_contributor_name_raw: sourceRawName,
    contributor_name_raw: displayName,
    contributor_name_display: displayName,
    contributor_name_parsed: { ...parsedName, display: displayName, source_display: sourceRawName },
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
      contributor_kind_hint: kindHint,
      source_contributor_name_raw: sourceRawName,
      contributor_display_policy: normalizedPersonDisplay
        ? 'LAST_COMMA_FIRST_MIDDLE_SUFFIX_UPPER'
        : parsedName.kind === 'ORGANIZATION'
          ? 'SOURCE_PRESERVED_ORGANIZATION'
          : 'SOURCE_PRESERVED_UNCERTAIN_PERSON_ORDER',
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
      contributorKind: row.entity_type,
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
      contributorKind: pick(row, ['Contributor Type', 'Contributor Entity Type', 'Entity Type']),
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
      contributorName: voterFocusContributorName(row),
      contributorKind: voterFocusContributorKind(row),
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
      contributor_name_derivation: voterFocusContributorName(row) ? 'VOTERFOCUS_HEADER_RESOLUTION' : 'MISSING_FROM_SOURCE_ROW',
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
      contributorKind: pick(row, ['ContributorType', 'Contributor Type', 'ContributorEntityType', 'Contributor Entity Type', 'EntityType', 'Entity Type']),
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
