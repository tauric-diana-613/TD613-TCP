const PAGE_SIZE = 300;
const FEC_SOURCE_ID = 'fec-schedule-a';
const FEC_BOUNDARY_PAGE_SIZE = 100;
const priorFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input, init = {}) => {
  let nextInit = init;
  try {
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : null;
    if (body?.operation === 'search.page' && body?.payload?.query) {
      const requested = Number(body.payload.query.page_size);
      const sourceCeiling = body.payload.source_instance_id === FEC_SOURCE_ID
        ? FEC_BOUNDARY_PAGE_SIZE
        : PAGE_SIZE;
      const pageSize = Number.isFinite(requested) && requested > 0
        ? Math.min(sourceCeiling, Math.floor(requested))
        : sourceCeiling;
      nextInit = {
        ...init,
        body: JSON.stringify({
          ...body,
          payload: {
            ...body.payload,
            query: { ...body.payload.query, page_size: pageSize }
          }
        })
      };
    }
  } catch {
    // Preserve non-Giving and non-JSON requests unchanged.
  }
  return priorFetch(input, nextInit);
};

export const GIVING_PAGE_SIZE = PAGE_SIZE;
export const GIVING_FEC_BOUNDARY_PAGE_SIZE = FEC_BOUNDARY_PAGE_SIZE;
