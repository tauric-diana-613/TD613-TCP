import { GivingError, cleanText, sha256 } from './util.js';

const PACKAGE_SCHEMA = 'td613.giving.campaign-deputy-giving-history-batch/v1';
const MAX_BATCH_RECORDS = 2_000;

function boundedId(value, field, max = 180) {
  const id = cleanText(value, max);
  if (!id || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{1,179}$/.test(id)) {
    throw new GivingError('invalid-giving-history-field', `${field} must be a bounded identifier`, 400, { field });
  }
  return id;
}

function requiredText(value, field, max) {
  const text = cleanText(value, max);
  if (!text) throw new GivingError('invalid-giving-history-field', `${field} is required`, 400, { field });
  return text;
}

function exactIsoDate(value) {
  const text = cleanText(value, 10);
  const match = text?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? text : null;
}

function sourceNativeIds(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0, 20).flatMap(([key, item]) => {
    const safeKey = cleanText(key, 80);
    const safeValue = cleanText(item, 300);
    return safeKey && safeValue ? [[safeKey, safeValue]] : [];
  }));
}

function sourceLocator(value) {
  const text = cleanText(value, 500);
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function normalizedRecord(value, { dossierId, personId }) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GivingError('invalid-giving-history-record', 'Each Giving History record must be an object', 400);
  }
  if (value.identity_status !== 'CONFIRMED') {
    throw new GivingError('giving-history-identity-unconfirmed', 'Only explicitly confirmed Giving records may enter a Campaign Deputy Giving History package', 409);
  }
  const recordDigest = boundedId(value.record_digest, 'record_digest');
  const committeeName = requiredText(value.committee_name, 'committee_name', 300);
  const committeeId = cleanText(value.committee_id, 120);
  const contributionDate = exactIsoDate(value.contribution_date);
  if (!contributionDate) {
    throw new GivingError('invalid-giving-history-field', 'contribution_date must be a real ISO calendar date', 400, { field: 'contribution_date', record_digest: recordDigest });
  }
  if (!Number.isSafeInteger(value.amount_cents) || value.amount_cents === 0) {
    throw new GivingError('invalid-giving-history-field', 'amount_cents must be a non-zero safe integer', 400, { field: 'amount_cents', record_digest: recordDigest });
  }
  const normalized = {
    record_digest: recordDigest,
    person_id: personId,
    committee: {
      name: committeeName,
      regulatory_id: committeeId,
      identity_status: committeeId ? 'STABLE_REGULATORY_ID_PRESENT' : 'NAME_ONLY_REQUIRES_CAMPAIGN_DEPUTY_MATCH'
    },
    contribution_date: contributionDate,
    amount_cents: value.amount_cents,
    cycle: cleanText(value.cycle, 40),
    election: cleanText(value.election, 160),
    jurisdiction: cleanText(value.jurisdiction, 160),
    provenance: {
      source_instance_id: cleanText(value.source_instance_id, 160),
      source_native_ids: sourceNativeIds(value.source_native_ids),
      source_locator: sourceLocator(value.source_locator),
      retrieved_at: cleanText(value.retrieved_at, 40),
      query_digest: cleanText(value.query_digest, 180)
    }
  };
  normalized.idempotency_key = sha256({
    dossier_id: dossierId,
    person_id: personId,
    record_digest: recordDigest,
    committee_id: committeeId,
    committee_name: committeeName,
    contribution_date: contributionDate,
    amount_cents: value.amount_cents
  });
  return normalized;
}

export function prepareGivingHistoryBatch(payload = {}) {
  if (payload.confirmed !== true) {
    throw new GivingError('giving-history-preparation-confirmation-required', 'Preparing a Giving History batch requires an explicit operator gesture', 409);
  }
  const dossierId = boundedId(payload.dossier_id, 'dossier_id');
  const personId = boundedId(payload.person_id, 'person_id');
  if (!Array.isArray(payload.records) || payload.records.length === 0) {
    throw new GivingError('giving-history-records-required', 'At least one confirmed Giving record is required', 400);
  }
  if (payload.records.length > MAX_BATCH_RECORDS) {
    throw new GivingError('giving-history-batch-oversized', `Giving History preparation accepts at most ${MAX_BATCH_RECORDS} records per batch`, 413, { max_records: MAX_BATCH_RECORDS });
  }

  const inputRecords = payload.records.map((record) => normalizedRecord(record, { dossierId, personId }));
  const uniqueRecords = [...new Map(inputRecords.map((record) => [record.idempotency_key, record])).values()];
  const committeeMap = new Map();
  for (const record of uniqueRecords) {
    const key = record.committee.regulatory_id || `name:${record.committee.name.toLocaleLowerCase()}`;
    const current = committeeMap.get(key) || { ...record.committee, record_count: 0, amount_cents: 0 };
    current.record_count += 1;
    current.amount_cents += record.amount_cents;
    committeeMap.set(key, current);
  }
  const recordsDigest = sha256(uniqueRecords.map((record) => record.idempotency_key).sort());

  return {
    schema: PACKAGE_SCHEMA,
    status: 'HELD_AWAITING_CAMPAIGN_DEPUTY_GIVING_HISTORY_CONTRACT',
    batch_id: `cdgh_${recordsDigest.slice(0, 24)}`,
    prepared_at: new Date().toISOString(),
    dossier_id: dossierId,
    person_id: personId,
    record_count: uniqueRecords.length,
    duplicate_input_count: inputRecords.length - uniqueRecords.length,
    records_digest: recordsDigest,
    records: uniqueRecords,
    committees: [...committeeMap.values()],
    external_mutation: false,
    campaign_deputy_contribution_endpoint_used: false,
    campaign_deputy_list_membership_written: false,
    contract_gate: {
      giving_history_feature_enabled: 'UNVERIFIED_FOR_ACCOUNT_AND_USER',
      giving_history_write_endpoint: 'NOT_DOCUMENTED',
      giving_history_write_scope: 'NOT_DOCUMENTED',
      release_allowed: false,
      required_before_release: [
        'Campaign Deputy confirms Giving History is enabled for the account and API user',
        'Campaign Deputy supplies an approved Giving History write API or bulk-import contract for one or many exact person targets',
        'Committee matching uses a stable Campaign Deputy or regulatory identifier',
        'The same batch can resolve or upsert missing committees before attaching Giving History records',
        'A sandbox proves idempotent retries and partial-failure receipts'
      ]
    },
    requested_contract_shape: {
      target_modes: ['SINGLE_EXACT_PERSON', 'MULTI_CONTACT_EXACT_MATCH_BATCH'],
      preferred_flow: 'ONE_TOUCH_TRANSACTIONAL_BATCH',
      acceptable_flow: 'PREFLIGHT_THEN_ASYNCHRONOUS_COMMIT',
      fallback_flow: 'APPROVED_BULK_IMPORT_WITH_COMMITTEE_UPSERT',
      committee_behavior: 'MATCH_STABLE_ID_OR_CREATE_IN_SAME_JOB',
      result_granularity: ['PERSON', 'COMMITTEE', 'GIVING_HISTORY_RECORD'],
      ambiguous_person_behavior: 'HOLD_WITHOUT_CREATE_OR_MERGE'
    },
    semantics: {
      giving_history: 'OUTSIDE_POLITICAL_GIVING_HISTORY',
      contribution: 'FORBIDDEN_DESTINATION_FOR_THIS_PACKAGE',
      list: 'OPTIONAL_SEGMENTATION_ONLY_NOT_A_GIVING_HISTORY_RECORD'
    }
  };
}

export const _givingHistoryPackageInternals = Object.freeze({ exactIsoDate, sourceNativeIds, normalizedRecord, MAX_BATCH_RECORDS });

