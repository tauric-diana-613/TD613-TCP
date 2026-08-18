import { _givingPracticeHydration } from './giving-practice-hydration.js';

const PRACTICE_SOURCE_ID = _givingPracticeHydration.PRACTICE_SOURCE_ID;
const FISHOCRATIC = 'Fishocratic Executive Committee';

// Ordinary solo gifts only. These deliberately tiny amounts create a visible
// longitudinal baseline against Eugene's later six-figure co-temporal spikes
// with Pearl and Krusty Krab LLC. The anomaly works because the baseline stays tiny.
const CHEAPSKATE_CENTS_BY_DATE = Object.freeze({
  '2020-01-31': 100,
  '2021-01-31': 250,
  '2022-01-31': 99,
  '2023-01-31': 500,
  '2024-01-31': 125,
  '2025-01-31': 1000,
  '2026-01-31': 613
});

function compact(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function isOrdinaryEugeneRecord(record = {}) {
  const name = compact(record.contributor_name_raw || record.contributor_name || record.contributor_name_parsed?.display);
  const committee = compact(record.committee_name || record.committee);
  const date = String(record.contribution_date || '');
  if (!['Eugene H. Krabs', 'Eugene Krabs'].includes(name)) return false;
  if (committee !== FISHOCRATIC) return false;
  if (!(date in CHEAPSKATE_CENTS_BY_DATE)) return false;
  if (record.practice_data_class === 'CO_TEMPORAL_CONTRIBUTION_CLUSTER') return false;
  if (record.practice_temporal_cluster || record.lineage?.temporal_cluster) return false;
  return true;
}

export function normalizeKrabsOrdinaryRecord(record) {
  if (!isOrdinaryEugeneRecord(record)) return record;
  const date = String(record.contribution_date || '');
  const amount = CHEAPSKATE_CENTS_BY_DATE[date];
  return {
    ...record,
    amount_cents: amount,
    contribution_type: 'FICTIONAL CHEAPSKATE MICRO-DONATION',
    practice_data_class: record.practice_data_class || 'CHEAPSKATE_BASELINE',
    practice_magnitude_profile: 'ABSURDLY_LOW_ORDINARY_BASELINE',
    pedagogy_note: 'Eugene’s ordinary solo giving is deliberately tiny. The later unusually large same-day gifts with Pearl and Krusty Krab LLC should therefore read as episodic magnitude anomalies against a cheapskate baseline.',
    lineage: {
      ...(record.lineage || {}),
      data_class: record.lineage?.data_class || 'CHEAPSKATE_BASELINE',
      ordinary_baseline: true,
      magnitude_profile: 'ABSURDLY_LOW',
      later_temporal_cluster_should_remain_distinct: true
    }
  };
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
        practice_krabs_cheapskate_baseline: true
      }
    },
    receipt: {
      ...(body.receipt || {}),
      practice_krabs_cheapskate_baseline: true,
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
  if (envelope?.operation !== 'search.page' || envelope?.payload?.source_instance_id !== PRACTICE_SOURCE_ID) return result;
  const body = await result.clone().json().catch(() => null);
  const page = body?.data?.page;
  if (!page || !Array.isArray(page.records)) return result;
  const records = page.records.map(normalizeKrabsOrdinaryRecord);
  return responseFrom(result, body, records);
};

export const _givingPracticeKrabsCheapskate = Object.freeze({
  FISHOCRATIC,
  CHEAPSKATE_CENTS_BY_DATE,
  isOrdinaryEugeneRecord,
  normalizeKrabsOrdinaryRecord
});