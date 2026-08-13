const PAGE_SIZE = 300;
const priorFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input, init = {}) => {
  let nextInit = init;
  try {
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : null;
    if (body?.operation === 'search.page' && body?.payload?.query) {
      nextInit = {
        ...init,
        body: JSON.stringify({
          ...body,
          payload: {
            ...body.payload,
            query: { ...body.payload.query, page_size: PAGE_SIZE }
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
