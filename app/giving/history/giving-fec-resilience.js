const FEC_SOURCE_ID = 'fec-schedule-a';
const TARGET_RECORDS = 300;
const MAX_BOUNDARY_PAGES = 3;
const MAX_ZERO_PROGRESS_REPLAYS = 1;
const priorFetch = globalThis.fetch.bind(globalThis);

function parseEnvelope(init) {
  try {
    return typeof init?.body === 'string' ? JSON.parse(init.body) : null;
  } catch {
    return null;
  }
}

function pageFromBody(body) {
  if (Array.isArray(body?.data?.page?.records)) return body.data.page;
  if (Array.isArray(body?.data?.records)) return body.data;
  return null;
}

function replacePage(body, page) {
  if (Array.isArray(body?.data?.page?.records)) {
    return { ...body, data: { ...body.data, page: { ...body.data.page, ...page } } };
  }
  if (body?.data && typeof body.data === 'object') return { ...body, data: { ...body.data, ...page } };
  return body;
}

function requestId() {
  return globalThis.crypto?.randomUUID?.() || `fec-page-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function responseJson(response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}

function syntheticResponse(template, body) {
  const headers = new Headers(template.headers || {});
  headers.delete('content-length');
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), {
    status: template.status,
    statusText: template.statusText,
    headers
  });
}

globalThis.fetch = async (input, init = {}) => {
  const envelope = parseEnvelope(init);
  const fecSearch = envelope?.operation === 'search.page' && envelope?.payload?.source_instance_id === FEC_SOURCE_ID;
  const requestedPageSize = Number(envelope?.payload?.query?.page_size);
  const boundaryPageSize = Number.isFinite(requestedPageSize) && requestedPageSize > 0
    ? Math.min(TARGET_RECORDS, Math.floor(requestedPageSize))
    : TARGET_RECORDS;
  const firstResponse = await priorFetch(input, init);
  if (!fecSearch || !firstResponse.ok) return firstResponse;

  const firstBody = await responseJson(firstResponse);
  const firstPage = pageFromBody(firstBody);
  if (!firstPage?.continuation || firstPage.records.length >= TARGET_RECORDS) return firstResponse;

  const records = [...firstPage.records];
  let continuation = firstPage.continuation;
  let pages = 1;
  let lastResponse = firstResponse;
  let lastBody = firstBody;
  let partialError = null;
  let zeroProgressReplays = 0;

  while (continuation && records.length < TARGET_RECORDS && pages < MAX_BOUNDARY_PAGES) {
    const followEnvelope = {
      ...envelope,
      request_id: requestId(),
      payload: {
        ...envelope.payload,
        continuation,
        // Keep every automatic continuation at the operator/client's bounded
        // evidence-page size. Explicit Continue remains the route to deeper
        // source evidence; resilience may never silently widen the request.
        query: { ...envelope.payload.query, page_size: boundaryPageSize }
      }
    };
    try {
      const response = await priorFetch(input, { ...init, body: JSON.stringify(followEnvelope) });
      const body = await responseJson(response);
      if (!response.ok || body?.ok === false) {
        partialError = {
          code: body?.error?.code || `HTTP_${response.status}`,
          message: body?.error?.message || `FEC continuation returned HTTP ${response.status}`
        };
        break;
      }
      const page = pageFromBody(body);
      if (!page) {
        partialError = { code: 'FEC_PAGE_CONTRACT_DRIFT', message: 'FEC continuation did not contain a Giving page' };
        break;
      }

      const pageRecords = Array.isArray(page.records) ? page.records : [];
      records.push(...pageRecords);
      const nextContinuation = page.continuation || null;
      pages += 1;
      lastResponse = response;
      lastBody = body;

      if (pageRecords.length === 0 && nextContinuation) {
        zeroProgressReplays += 1;
        if (zeroProgressReplays >= MAX_ZERO_PROGRESS_REPLAYS) {
          partialError = {
            code: page.retryable_error?.code || 'FEC_NO_PROGRESS',
            message: page.retryable_error?.message || 'OpenFEC made no progress across a fresh Giving boundary; continuation replay stopped.'
          };
          continuation = null;
          break;
        }
      } else {
        zeroProgressReplays = 0;
      }

      continuation = nextContinuation;
    } catch (error) {
      partialError = {
        code: 'FEC_CONTINUATION_BOUNDARY_FAILED',
        message: String(error?.message || error || 'FEC continuation boundary failed')
      };
      break;
    }
  }

  const lastPage = pageFromBody(lastBody) || firstPage;
  return syntheticResponse(lastResponse, replacePage(lastBody, {
    ...lastPage,
    records: records.slice(0, TARGET_RECORDS),
    continuation,
    source_status: partialError ? 'PARTIAL' : lastPage.source_status,
    client_fec_paging: {
      boundary_pages: pages,
      boundary_page_size: boundaryPageSize,
      requested_records: TARGET_RECORDS,
      retained_raw_records: Math.min(records.length, TARGET_RECORDS),
      zero_progress_replays: zeroProgressReplays,
      partial: Boolean(partialError),
      ...(partialError ? { error: partialError } : {})
    }
  }));
};

export const _givingFecResilience = Object.freeze({
  FEC_SOURCE_ID,
  MAX_BOUNDARY_PAGES,
  MAX_ZERO_PROGRESS_REPLAYS,
  TARGET_RECORDS
});
