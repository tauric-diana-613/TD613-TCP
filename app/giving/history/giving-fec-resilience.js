const FEC_SOURCE_ID = 'fec-schedule-a';
const FEC_BOUNDARY_PAGE_SIZE = 100;
const MAX_BOUNDARY_PAGES = 1;
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

// FEC used to be the only Giving source that silently replayed continuation
// tokens inside one browser fetch, coalescing as many as three 100-row OpenFEC
// boundaries before the dossier could settle. Besides multiplying main-thread
// normalization work, three sequential upstream windows could outlive the outer
// Giving request timer. Preserve one provider-friendly page per explicit gesture;
// deeper evidence remains fully reachable through the ordinary Continue button.
globalThis.fetch = async (input, init = {}) => {
  const envelope = parseEnvelope(init);
  const fecSearch = envelope?.operation === 'search.page' && envelope?.payload?.source_instance_id === FEC_SOURCE_ID;
  const response = await priorFetch(input, init);
  if (!fecSearch || !response.ok) return response;

  const body = await responseJson(response);
  const page = pageFromBody(body);
  if (!page) return response;

  return syntheticResponse(response, replacePage(body, {
    ...page,
    client_fec_paging: {
      boundary_pages: 1,
      boundary_page_size: FEC_BOUNDARY_PAGE_SIZE,
      automatic_continuation: false,
      continuation_exposed: Boolean(page.continuation),
      retained_raw_records: page.records.length
    }
  }));
};

export const _givingFecResilience = Object.freeze({
  FEC_SOURCE_ID,
  FEC_BOUNDARY_PAGE_SIZE,
  MAX_BOUNDARY_PAGES,
  automaticContinuation: false
});
