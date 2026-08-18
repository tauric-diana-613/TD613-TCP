const PRACTICE_SOURCE_ID = 'practice-bikini-bottom-votes';

export const PRACTICE_POSTAL = Object.freeze({
  city: 'Bikini Bottom',
  state: 'Oceania',
  zip: '61313'
});

export function practiceStreetAddress(value) {
  return String(value ?? '')
    .replace(/\s*·\s*FICTIONAL\b.*$/i, '')
    .trim();
}

export function practiceContributionType(value, record = {}) {
  const text = String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  const transactionClass = String(record?.transaction_class ?? '').toLocaleUpperCase('en-US');
  const upper = text.toLocaleUpperCase('en-US');
  if (transactionClass === 'IN-KIND' || /\bIN[-\s]?KIND\b/.test(upper)) return 'IN-KIND';
  if (transactionClass === 'LOAN' || /\bLOAN\b/.test(upper)) return 'LOAN';
  if (/^FICTIONAL\b/.test(upper)) return 'CONTRIBUTION';
  return text;
}

export function normalizePracticeEvidenceRecord(record = {}) {
  const practice = record?.source_instance_id === PRACTICE_SOURCE_ID ||
    record?.source_family === 'FICTIONAL_PRACTICE' ||
    record?.evidence_status === 'FICTIONAL_SAMPLE' ||
    record?.lineage?.manifestly_fictional === true;
  if (!practice) return record;

  const next = {
    ...record,
    city: PRACTICE_POSTAL.city,
    state: PRACTICE_POSTAL.state,
    zip: PRACTICE_POSTAL.zip
  };
  if ('address' in next) next.address = practiceStreetAddress(next.address);
  if ('address_line_1' in next) next.address_line_1 = practiceStreetAddress(next.address_line_1);
  if ('contribution_type' in next) next.contribution_type = practiceContributionType(next.contribution_type, next);
  return next;
}

function parseEnvelope(init) {
  try { return typeof init?.body === 'string' ? JSON.parse(init.body) : null; } catch { return null; }
}

function responseFrom(original, body) {
  const headers = new Headers(original.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(body), {
    status: original.status,
    statusText: original.statusText,
    headers
  });
}

const priorFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init = {}) => {
  const envelope = parseEnvelope(init);
  const practiceSearch = envelope?.operation === 'search.page' && envelope?.payload?.source_instance_id === PRACTICE_SOURCE_ID;
  const result = await priorFetch(input, init);
  if (!practiceSearch) return result;

  const body = await result.clone().json().catch(() => null);
  const page = body?.data?.page;
  if (!page || !Array.isArray(page.records)) return result;

  const records = page.records.map(normalizePracticeEvidenceRecord);
  return responseFrom(result, {
    ...body,
    data: {
      ...body.data,
      page: {
        ...page,
        records,
        practice_postal_schema: `${PRACTICE_POSTAL.city}, ${PRACTICE_POSTAL.state} ${PRACTICE_POSTAL.zip}`,
        practice_evidence_fields_show_not_tell: true
      }
    },
    receipt: {
      ...(body.receipt || {}),
      practice_postal_normalized: true,
      practice_zip_numeric: true,
      practice_narrative_type_labels_removed: true
    }
  });
};

export const _givingPracticePostalNormalization = Object.freeze({
  PRACTICE_SOURCE_ID,
  PRACTICE_POSTAL,
  practiceStreetAddress,
  practiceContributionType,
  normalizePracticeEvidenceRecord
});
