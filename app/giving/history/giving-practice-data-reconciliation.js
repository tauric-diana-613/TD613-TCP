import { _givingPracticeHydration } from './giving-practice-hydration.js';
import { _givingPracticeSearchNoise } from './giving-practice-search-noise.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const TREEDOME = '1 Treedome Way · FICTIONAL AIR DOME';
const KRABS_HOME = '17 Whale Tail Lane · FICTIONAL ANCHOR HOUSE';
const KRABS_BUSINESS = '1 Krusty Krab Plaza · FICTIONAL RESTAURANT';
const SQUIDWARD_HOME = '122 Conch Street · FICTIONAL MOAI';
const PATRICK_HOME = '120 Conch Street · FICTIONAL ROCK';
const SPONGEBOB_HOME = '124 Conch Street · FICTIONAL PINEAPPLE';

const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const folded = (value) => compact(value).toLocaleLowerCase('en-US');
const skeleton = (value) => folded(value).replace(/[^a-z0-9]+/g, '');

function normalizeCommitteeName(value) {
  return value === 'Mrs. Puff for Bikini Bottom School District #67'
    ? 'Puff for Bikini Bottom School District #67'
    : value;
}

function sameQueryName(query, ...names) {
  const terms = [query?.name, ...(Array.isArray(query?.aliases) ? query.aliases : [])].map(skeleton).filter(Boolean);
  return names.some((name) => terms.includes(skeleton(name)));
}

function lineage(record, patch) {
  return { ...(record.lineage || {}), ...patch };
}

function reconcileRecord(record) {
  const next = { ...record };
  const name = compact(next.contributor_name_raw || next.contributor_name || next.contributor_name_parsed?.display);
  next.committee = normalizeCommitteeName(next.committee_name || next.committee);
  next.committee_name = next.committee;
  next.city = 'Bikini Bottom';
  next.state = 'Oceania';
  next.zip = 'X';

  if (name === 'Sandra Cheeks') {
    next.address = TREEDOME;
    next.employer = 'Treedome Research Lab · FICTIONAL';
    next.occupation = 'Scientist · FICTIONAL';
    next.practice_data_class = 'DECLARED_ALIAS';
    next.practice_identity_cluster = 'sandy-cheeks';
    next.lineage = lineage(next, { data_class: 'DECLARED_ALIAS', identity_cluster: 'sandy-cheeks', same_practice_identity_as: 'Sandy Cheeks' });
  }

  if (/^Sandy Cheecks$/i.test(name)) {
    next.address = TREEDOME;
    next.employer = 'Treedome Research Lab · FICTIONAL';
    next.occupation = 'Scientist · FICTIONAL';
    next.lineage = lineage(next, { dirty_field: 'contributor_name', intended_practice_identity: 'Sandy Cheeks' });
  }

  if (/^Eugene(?: H\.)? Krabs$/i.test(name)) {
    const year = Number(String(next.contribution_date || '').slice(0, 4));
    const atHome = Number.isFinite(year) && year % 2 === 1;
    next.address = atHome ? KRABS_HOME : KRABS_BUSINESS;
    next.practice_address_quality = atHome ? 'HOME_ADDRESS' : 'BUSINESS_ADDRESS';
    next.lineage = lineage(next, { address_context: atHome ? 'HOME' : 'BUSINESS', identity_continuity_expected: true });
  }

  if (/^Squidward (?:Tennisballs|Tentpoles|Tortellini)$/i.test(name)) {
    next.address = SQUIDWARD_HOME;
    next.employer = 'Krusty Krab · FICTIONAL';
    next.occupation = 'Cashier / Clarinetist · FICTIONAL';
    next.lineage = lineage(next, { dirty_field: 'contributor_name', intended_practice_identity: 'Squidward Q. Tentacles' });
  }

  if (/^(?:Rick Star|Patrick Staar)$/i.test(name)) {
    next.address = PATRICK_HOME;
    next.employer = 'Self · FICTIONAL';
    next.occupation = 'Professional Lounger · FICTIONAL';
    next.lineage = lineage(next, { dirty_field: 'contributor_name', intended_practice_identity: 'Patrick Star' });
  }

  if (/^(?:Sponge Bob Squarepants|Spongebob Square Pants)$/i.test(name)) {
    next.address = SPONGEBOB_HOME;
    next.employer = 'Krusty Krab · FICTIONAL';
    next.occupation = 'Fry Cook · FICTIONAL';
    next.lineage = lineage(next, { dirty_field: 'contributor_name', intended_practice_identity: 'SpongeBob SquarePants' });
  }

  // One deliberately ugly filing row: same Barnacle Boy, same physical address,
  // but source formatting drifts and employer/occupation columns are swapped.
  if (name === 'Barnacle Boy' && next.contribution_date === '2023-11-11') {
    next.address = '42 Shady Shoals Ln. · FICTIONAL RETIREMENT HOME';
    const employer = next.employer;
    next.employer = next.occupation;
    next.occupation = employer;
    next.practice_data_class = 'FIELD_PLACEMENT_CORRUPTION';
    next.lineage = lineage(next, {
      data_class: 'FIELD_PLACEMENT_CORRUPTION',
      address_format_variant: true,
      employer_occupation_swapped: true,
      intended_practice_identity: 'Barnacle Boy'
    });
  }

  if (!next.address) next.address = '0 Missing Address Reef · FICTIONAL REPAIR SENTINEL';
  return next;
}

function dedupeKey(record) {
  return [
    skeleton(record.contributor_name_raw || record.contributor_name),
    record.contribution_date,
    skeleton(record.committee_name || record.committee),
    record.amount_cents,
    record.source_native_ids?.practice_transaction_group || ''
  ].join('|');
}

function canonicalSandyRecords() {
  return _givingPracticeSearchNoise.canonicalRecordsFor('Sandy Cheeks').map((record) => ({
    ...reconcileRecord(record),
    practice_data_class: record.practice_data_class || 'DECLARED_ALIAS_CLUSTER_CANONICAL',
    practice_identity_cluster: 'sandy-cheeks',
    lineage: lineage(record, { identity_cluster: 'sandy-cheeks', declared_alias: 'Sandra Cheeks' })
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

  const records = page.records.map(reconcileRecord);
  if (query.exact_match && sameQueryName(query, 'Sandra Cheeks')) records.push(...canonicalSandyRecords());

  const seen = new Set();
  const reconciled = [];
  for (const record of records) {
    const key = dedupeKey(record);
    if (seen.has(key)) continue;
    seen.add(key);
    reconciled.push(record);
  }

  const missingAddressCount = reconciled.filter((record) => !compact(record.address)).length;
  const nextBody = {
    ...body,
    data: {
      ...body.data,
      page: {
        ...page,
        records: reconciled,
        practice_reconciliation: {
          all_records_addressed: missingAddressCount === 0,
          missing_address_count: missingAddressCount,
          sandy_sandra_declared_alias: true,
          krabs_dual_address_context: true,
          dirty_name_address_fidelity: true,
          field_placement_corruption_present: reconciled.some((record) => record.practice_data_class === 'FIELD_PLACEMENT_CORRUPTION')
        }
      }
    },
    receipt: {
      ...(body.receipt || {}),
      practice_reconciliation: true,
      all_records_addressed: missingAddressCount === 0,
      record_count: reconciled.length
    }
  };
  return responseFrom(result, nextBody);
};

export const _givingPracticeDataReconciliation = Object.freeze({
  TREEDOME,
  KRABS_HOME,
  KRABS_BUSINESS,
  SQUIDWARD_HOME,
  PATRICK_HOME,
  SPONGEBOB_HOME,
  reconcileRecord,
  canonicalSandyRecords
});