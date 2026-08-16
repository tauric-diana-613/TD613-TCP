import { GivingError, cleanText, sha256 } from './util.js';

const PACKAGE_SCHEMA = 'td613.giving.campaign-deputy-giving-history-batch/v1';
const MAX_BATCH_RECORDS = 2_000;
const MAX_BATCH_TARGETS = 250;

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

function boundedLineage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0, 30).flatMap(([key, item]) => {
    const safeKey = cleanText(key, 80);
    if (!safeKey || item === undefined) return [];
    if (item === null || typeof item === 'boolean') return [[safeKey, item]];
    if (typeof item === 'number' && Number.isFinite(item)) return [[safeKey, item]];
    const safeValue = typeof item === 'object'
      ? cleanText(JSON.stringify(item), 1_000)
      : cleanText(item, 1_000);
    return safeValue ? [[safeKey, safeValue]] : [];
  }));
}

function contributorIdentity(value = {}) {
  const contributor = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const organizationName = cleanText(contributor.organization_name, 300);
  const firstName = cleanText(contributor.first_name, 160);
  const lastName = cleanText(contributor.last_name, 160);
  if (!organizationName && (!firstName || !lastName)) {
    throw new GivingError('invalid-giving-history-field', 'Each record requires either organization_name or split first_name and last_name', 400, { field: 'contributor' });
  }
  return {
    kind: organizationName ? 'ORGANIZATION' : 'PERSON',
    first_name: organizationName ? null : firstName,
    last_name: organizationName ? null : lastName,
    organization_name: organizationName || null,
    address_line_1: cleanText(contributor.address_line_1, 300),
    address_city: cleanText(contributor.address_city, 160),
    address_state: cleanText(contributor.address_state, 80),
    address_zip: cleanText(contributor.address_zip, 24),
    occupation: cleanText(contributor.occupation, 300),
    employer: cleanText(contributor.employer, 300)
  };
}

function normalizedRecord(value, { dossierId, personId, targetId }) {
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
  const nativeIds = sourceNativeIds(value.source_native_ids);
  const sourceInstanceId = cleanText(value.source_instance_id, 160);
  const normalized = {
    record_digest: recordDigest,
    person_id: personId,
    dossier_target_id: targetId,
    contributor: contributorIdentity(value.contributor),
    committee: {
      name: committeeName,
      regulatory_id: committeeId,
      identity_status: committeeId ? 'STABLE_REGULATORY_ID_PRESENT' : 'NAME_ONLY_REQUIRES_CAMPAIGN_DEPUTY_MATCH',
      cycle: cleanText(value.cycle, 40),
      election_type: cleanText(value.election_type || value.election, 80),
      office_sought: cleanText(value.office_sought || value.office, 160)
    },
    contribution_date: contributionDate,
    amount_cents: value.amount_cents,
    cycle: cleanText(value.cycle, 40),
    election: cleanText(value.election, 160),
    office: cleanText(value.office, 160),
    jurisdiction: cleanText(value.jurisdiction, 160),
    provenance: {
      source_instance_id: sourceInstanceId,
      source_native_ids: nativeIds,
      source_locator: sourceLocator(value.source_locator),
      retrieved_at: cleanText(value.retrieved_at, 40),
      query_digest: cleanText(value.query_digest, 180),
      amendment_status: cleanText(value.amendment_status, 80),
      lineage: boundedLineage(value.lineage)
    },
    source_transaction_identity: Object.keys(nativeIds).length
      ? sha256({ source_instance_id: sourceInstanceId, source_native_ids: nativeIds })
      : recordDigest
  };
  normalized.idempotency_key = sha256({
    dossier_id: dossierId,
    person_id: personId,
    source_transaction_identity: normalized.source_transaction_identity
  });
  return normalized;
}

function normalizedTargets(payload, dossierId) {
  const supplied = Array.isArray(payload.targets) ? payload.targets : [{
    person_id: payload.person_id,
    dossier_target_id: payload.dossier_target_id || payload.person_id,
    exact_match: true,
    records: payload.records
  }];
  if (!supplied.length) throw new GivingError('giving-history-targets-required', 'At least one exact Campaign Deputy person target is required', 400);
  if (supplied.length > MAX_BATCH_TARGETS) {
    throw new GivingError('giving-history-target-batch-oversized', `Giving History preparation accepts at most ${MAX_BATCH_TARGETS} exact person targets`, 413, { max_targets: MAX_BATCH_TARGETS });
  }
  const seenPeople = new Set();
  return supplied.map((target, index) => {
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
      throw new GivingError('invalid-giving-history-target', 'Each Giving History target must be an object', 400, { index });
    }
    if (target.exact_match !== true) {
      throw new GivingError('giving-history-person-match-unconfirmed', 'Every multi-contact target must be an exact confirmed Campaign Deputy person match', 409, { index });
    }
    const personId = boundedId(target.person_id, `targets[${index}].person_id`);
    if (seenPeople.has(personId)) throw new GivingError('duplicate-giving-history-target', 'Campaign Deputy person targets must be unique within a batch', 409, { person_id: personId });
    seenPeople.add(personId);
    const targetId = boundedId(target.dossier_target_id || personId, `targets[${index}].dossier_target_id`);
    if (!Array.isArray(target.records) || target.records.length === 0) {
      throw new GivingError('giving-history-records-required', 'Every exact Campaign Deputy person target requires at least one confirmed Giving record', 400, { person_id: personId });
    }
    return {
      person_id: personId,
      dossier_target_id: targetId,
      records: target.records.map((record) => normalizedRecord(record, { dossierId, personId, targetId }))
    };
  });
}

export function prepareGivingHistoryBatch(payload = {}) {
  if (payload.confirmed !== true) {
    throw new GivingError('giving-history-preparation-confirmation-required', 'Preparing a Giving History batch requires an explicit operator gesture', 409);
  }
  const dossierId = boundedId(payload.dossier_id, 'dossier_id');
  const targets = normalizedTargets(payload, dossierId);
  const suppliedRecordCount = targets.reduce((sum, target) => sum + target.records.length, 0);
  if (suppliedRecordCount > MAX_BATCH_RECORDS) {
    throw new GivingError('giving-history-batch-oversized', `Giving History preparation accepts at most ${MAX_BATCH_RECORDS} records per batch`, 413, { max_records: MAX_BATCH_RECORDS });
  }

  const inputRecords = targets.flatMap((target) => target.records);
  const uniqueRecords = [...new Map(inputRecords.map((record) => [record.idempotency_key, record])).values()];
  const committeeMap = new Map();
  for (const record of uniqueRecords) {
    const key = [
      record.committee.regulatory_id || `name:${record.committee.name.toLocaleLowerCase()}`,
      record.committee.regulatory_id ? '' : record.jurisdiction || '',
      record.committee.regulatory_id ? '' : record.provenance.source_instance_id || '',
      record.committee.cycle || '',
      record.committee.election_type || '',
      record.committee.office_sought || ''
    ].join('\u241f');
    const current = committeeMap.get(key) || { ...record.committee, record_count: 0, amount_cents: 0, target_person_ids: [] };
    current.record_count += 1;
    current.amount_cents += record.amount_cents;
    if (!current.target_person_ids.includes(record.person_id)) current.target_person_ids.push(record.person_id);
    committeeMap.set(key, current);
  }
  const recordsDigest = sha256(uniqueRecords.map((record) => record.idempotency_key).sort());

  return {
    schema: PACKAGE_SCHEMA,
    status: 'HELD_AWAITING_CAMPAIGN_DEPUTY_GIVING_HISTORY_CONTRACT',
    batch_id: `cdgh_${recordsDigest.slice(0, 24)}`,
    prepared_at: new Date().toISOString(),
    dossier_id: dossierId,
    person_id: targets.length === 1 ? targets[0].person_id : null,
    target_count: targets.length,
    targets: targets.map((target) => ({
      person_id: target.person_id,
      dossier_target_id: target.dossier_target_id,
      exact_match: true,
      record_count: uniqueRecords.filter((record) => record.person_id === target.person_id).length,
      post_import_entity_match: 'REQUIRED_AND_HELD_FOR_SUPPORTED_API'
    })),
    record_count: uniqueRecords.length,
    duplicate_input_count: inputRecords.length - uniqueRecords.length,
    records_digest: recordsDigest,
    records: uniqueRecords,
    committees: [...committeeMap.values()],
    external_mutation: false,
    campaign_deputy_contribution_endpoint_used: false,
    campaign_deputy_list_membership_written: false,
    contract_gate: {
      giving_history_feature_enabled: 'ACCOUNT_PLAN_ENABLEMENT_REQUIRED',
      giving_history_write_endpoint: 'NOT_DOCUMENTED',
      giving_history_write_scope: 'NOT_DOCUMENTED',
      release_allowed: false,
      required_before_release: [
        'Campaign Deputy enables Giving History and a sufficient committee quota for the account',
        'Campaign Deputy supplies an approved Giving History write API or bulk-import contract for one or many exact person targets',
        'Campaign Deputy exposes supported API-key operations to list/create Giving History committees',
        'Campaign Deputy exposes supported API-key entity-to-person matching after import, because Giving History mapping does not accept Person ID',
        'A sandbox proves idempotent retries and partial-failure receipts'
      ]
    },
    observed_product_contract: {
      giving_history_is_not_contribution_history: true,
      account_plan_gated: true,
      one_committee_selected_per_import: true,
      official_import_columns: [
        'First Name', 'Last Name', 'Organization Name', 'Address Line 1', 'Address City', 'Address State',
        'Address Zip', 'Occupation', 'Employer', 'Transaction Date', 'Transaction Amount', 'Transaction Type'
      ],
      person_id_available_in_giving_history_mapping: false,
      post_import_entity_to_person_match_required: true,
      public_api_equivalents_documented: false
    },
    requested_contract_shape: {
      target_modes: ['SINGLE_EXACT_PERSON', 'MULTI_CONTACT_EXACT_MATCH_BATCH'],
      preferred_flow: 'ONE_TOUCH_TRANSACTIONAL_BATCH',
      acceptable_flow: 'PREFLIGHT_COMMITTEE_UPSERT_THEN_BATCH_IMPORT_THEN_EXACT_PERSON_MATCH',
      fallback_flow: 'OFFICIAL_COMMITTEE_PARTITIONED_CSV_IMPORT_PLUS_SUPPORTED_ENTITY_MATCH',
      committee_behavior: 'MATCH_STABLE_ID_OR_CREATE_BEFORE_COMMITTEE_PARTITION_IMPORT',
      result_granularity: ['PERSON', 'GIVING_HISTORY_ENTITY', 'COMMITTEE', 'GIVING_HISTORY_RECORD'],
      ambiguous_person_behavior: 'HOLD_WITHOUT_CREATE_OR_MERGE'
    },
    semantics: {
      giving_history: 'OUTSIDE_POLITICAL_GIVING_HISTORY',
      contribution: 'FORBIDDEN_DESTINATION_FOR_THIS_PACKAGE',
      list: 'OPTIONAL_SEGMENTATION_ONLY_NOT_A_GIVING_HISTORY_RECORD'
    }
  };
}

export const _givingHistoryPackageInternals = Object.freeze({ exactIsoDate, sourceNativeIds, normalizedRecord, normalizedTargets, contributorIdentity, MAX_BATCH_RECORDS, MAX_BATCH_TARGETS });
