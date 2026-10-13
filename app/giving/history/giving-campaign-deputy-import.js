import { compactText, recordDigest, safeFilename } from './giving-model.js';
import { buildStoredZip } from './giving-xlsx.js';

export const CAMPAIGN_DEPUTY_GIVING_HISTORY_HEADERS = Object.freeze([
  'First Name',
  'Last Name',
  'Organization Name',
  'Address Line 1',
  'Address City',
  'Address State',
  'Address Zip',
  'Occupation',
  'Employer',
  'Transaction Date',
  'Transaction Amount',
  'Transaction Type'
]);

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function displayName(record) {
  return compactText(
    record.contributor_name_raw ||
    record.contributor_name ||
    record.raw_contributor_name ||
    record.contributor_name_parsed?.display ||
    record.organization_name ||
    ''
  );
}

function contributorColumns(record) {
  const parsed = record.contributor_name_parsed || {};
  const raw = displayName(record);
  const explicitOrganization = compactText(record.organization_name || record.contributor_organization_name || '');
  if (parsed.kind === 'ORGANIZATION' || explicitOrganization) {
    return { firstName: '', lastName: '', organizationName: explicitOrganization || compactText(parsed.organization || raw) };
  }

  let firstName = compactText(parsed.given || record.first_name || record.name_first || '');
  let lastName = compactText(parsed.family || record.last_name || record.name_last || '');
  if ((!firstName || !lastName) && raw.includes(',')) {
    const [family, given = ''] = raw.split(',', 2).map((part) => compactText(part));
    lastName ||= family;
    firstName ||= compactText(given.split(/\s+/)[0]);
  }
  if (!firstName || !lastName) {
    const tokens = raw.split(/\s+/).filter(Boolean);
    firstName ||= tokens[0] || '';
    lastName ||= tokens.length > 1 ? tokens.at(-1) : '';
  }
  if (!firstName || !lastName) throw new Error('Campaign Deputy Giving History export requires a split person name or an organization name.');
  return { firstName, lastName, organizationName: '' };
}

function campaignDeputyDate(value) {
  const match = compactText(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error('Campaign Deputy Giving History export requires ISO contribution dates.');
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (date.getUTCFullYear() !== Number(match[1]) || date.getUTCMonth() !== Number(match[2]) - 1 || date.getUTCDate() !== Number(match[3])) {
    throw new Error('Campaign Deputy Giving History export found an invalid contribution date.');
  }
  return `${match[2]}/${match[3]}/${match[1]}`;
}

function transactionType(record) {
  const sourceType = compactText(record.contribution_type || record.transaction_type || '');
  if (record.amount_cents < 0 || /refund|chargeback|returned|reversal/i.test(sourceType)) return 'Refund';
  return 'Contribution';
}

export function campaignDeputyGivingHistoryRow(record) {
  if (!record || typeof record !== 'object') throw new Error('Campaign Deputy Giving History export requires record objects.');
  if (!Number.isSafeInteger(record.amount_cents) || record.amount_cents === 0) {
    throw new Error('Campaign Deputy Giving History export requires non-zero cent amounts.');
  }
  const contributor = contributorColumns(record);
  return [
    contributor.firstName,
    contributor.lastName,
    contributor.organizationName,
    compactText(record.address || record.address_line_1 || record.street_address || ''),
    compactText(record.city || record.address_city || ''),
    compactText(record.state || record.address_state || ''),
    compactText(record.zip || record.postal_code || record.address_zip || ''),
    compactText(record.occupation || ''),
    compactText(record.employer || ''),
    campaignDeputyDate(record.contribution_date),
    (record.amount_cents / 100).toFixed(2),
    transactionType(record)
  ];
}

export function campaignDeputyGivingHistoryCsv(records) {
  if (!Array.isArray(records) || records.length === 0) throw new Error('No confirmed Giving History records are available for this export.');
  const rows = [CAMPAIGN_DEPUTY_GIVING_HISTORY_HEADERS, ...records.map(campaignDeputyGivingHistoryRow)];
  return `\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

function committeeIdentity(record) {
  const name = compactText(record.committee || record.committee_name || record.candidate || record.candidate_name || '');
  if (!name) throw new Error('Campaign Deputy Giving History export requires a committee name for every record.');
  const sourceIds = record.source_native_ids || {};
  const regulatoryId = compactText(record.committee_id || record.fec_committee_id || record.raw_source_row?.committee_id || record.candidate_or_committee_id || sourceIds.committee_id || sourceIds.candidate_or_committee_id || '');
  const cycle = compactText(record.cycle || record.election || new Date().getFullYear());
  const electionSource = compactText(record.election || '');
  const electionType = /primary/i.test(electionSource) ? 'Primary'
    : /general/i.test(electionSource) ? 'General'
      : /special/i.test(electionSource) ? 'Special' : '';
  const officeSought = compactText(record.office || '');
  const jurisdiction = compactText(record.jurisdiction || '');
  const sourceNamespace = compactText(record.source_instance_id || record.source_family || '');
  return {
    name,
    regulatory_id: regulatoryId || null,
    cycle,
    election_type: electionType || null,
    office_sought: officeSought || null,
    jurisdiction: jurisdiction || null,
    source_namespace: sourceNamespace || null
  };
}

function committeeKey(committee) {
  return [
    committee.regulatory_id || `name:${committee.name.toLocaleLowerCase()}`,
    committee.regulatory_id ? '' : committee.jurisdiction,
    committee.regulatory_id ? '' : committee.source_namespace,
    committee.cycle,
    committee.election_type,
    committee.office_sought
  ].join('\u241f');
}

function sourceTransactionKey(record) {
  const nativeIds = Object.entries(record.source_native_ids || {})
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim())
    .sort(([left], [right]) => left.localeCompare(right));
  return nativeIds.length
    ? JSON.stringify([record.source_instance_id || record.source_family || '', nativeIds])
    : recordDigest(record);
}

export function partitionCampaignDeputyGivingHistory(records) {
  if (!Array.isArray(records) || records.length === 0) throw new Error('No confirmed Giving History records are available for this export.');
  const groups = new Map();
  const seenTransactions = new Set();
  for (const record of records) {
    const transactionKey = sourceTransactionKey(record);
    if (seenTransactions.has(transactionKey)) continue;
    seenTransactions.add(transactionKey);
    const committee = committeeIdentity(record);
    const key = committeeKey(committee);
    const current = groups.get(key) || { key, committee, records: [], amount_cents: 0 };
    current.records.push(record);
    current.amount_cents += record.amount_cents;
    groups.set(key, current);
  }
  return [...groups.values()].sort((left, right) =>
    left.committee.name.localeCompare(right.committee.name) || left.committee.cycle.localeCompare(right.committee.cycle)
  );
}

function bundleReadme() {
  return [
    'Campaign Deputy Giving History import bundle',
    '',
    'Each CSV exactly follows Campaign Deputy\'s official 12-column Giving History template.',
    'Campaign Deputy requires one Giving History committee to be selected per import, so this bundle contains one CSV per committee/cycle.',
    '',
    'Before importing:',
    '1. Ask Campaign Deputy to enable Giving History for this account if the feature is not visible.',
    '2. In Account Settings, create or confirm the Giving History committee described in the manifest.',
    '3. Upload that committee\'s CSV, turn on Giving History Import, and select the same committee.',
    '4. After import, match the imported Giving History entity to the exact person record where required.',
    '',
    'Important: Campaign Deputy\'s Giving History mapping does not expose Person ID. Person matching is a separate post-import step.',
    'Do not use Campaign Deputy Contributions for these files.'
  ].join('\r\n');
}

export function buildCampaignDeputyGivingHistoryBundle({ records, title = 'giving-history', preparedBatch = null, targetMode = 'DOSSIER_CONFIRMED_RECORDS' } = {}) {
  const partitions = partitionCampaignDeputyGivingHistory(records);
  const fileNames = new Set();
  const files = partitions.map((partition, index) => {
    const identitySuffix = partition.committee.regulatory_id || partition.committee.cycle || String(index + 1);
    let fileName = `${String(index + 1).padStart(3, '0')}-${safeFilename(partition.committee.name)}-${safeFilename(identitySuffix)}.csv`;
    if (fileNames.has(fileName)) fileName = `${String(index + 1).padStart(3, '0')}-${safeFilename(partition.committee.name)}-${index + 1}.csv`;
    fileNames.add(fileName);
    return { name: fileName, data: campaignDeputyGivingHistoryCsv(partition.records), partition };
  });
  const manifest = {
    schema: 'td613.giving.campaign-deputy-giving-history-import-bundle/v1',
    status: 'READY_FOR_OPERATOR_IMPORT_AFTER_CAMPAIGN_DEPUTY_GIVING_HISTORY_ENABLEMENT',
    generated_at: new Date().toISOString(),
    target_mode: targetMode,
    campaign_deputy_template: {
      columns: CAMPAIGN_DEPUTY_GIVING_HISTORY_HEADERS,
      one_committee_per_import: true,
      person_id_available_in_giving_history_mapping: false,
      post_import_person_match_required: true
    },
    held_api_batch: preparedBatch ? {
      batch_id: preparedBatch.batch_id,
      status: preparedBatch.status,
      records_digest: preparedBatch.records_digest,
      targets: preparedBatch.targets || (preparedBatch.person_id ? [{ person_id: preparedBatch.person_id }] : [])
    } : null,
    files: files.map(({ name, partition }) => ({
      file_name: name,
      committee: partition.committee,
      record_count: partition.records.length,
      amount_cents: partition.amount_cents,
      record_digests: partition.records.map(recordDigest)
    })),
    external_mutation: false
  };
  const zip = buildStoredZip([
    { name: 'README.txt', data: bundleReadme() },
    { name: 'campaign-deputy-giving-history-manifest.json', data: JSON.stringify(manifest, null, 2) },
    ...(preparedBatch ? [{ name: 'held-api-batch.json', data: JSON.stringify(preparedBatch, null, 2) }] : []),
    ...files.map(({ name, data }) => ({ name, data }))
  ]);
  return {
    filename: `${safeFilename(title)}-campaign-deputy-giving-history.zip`,
    bytes: zip,
    manifest,
    partitions
  };
}

export const _campaignDeputyImportInternals = Object.freeze({ contributorColumns, campaignDeputyDate, transactionType, committeeIdentity, committeeKey, sourceTransactionKey });
