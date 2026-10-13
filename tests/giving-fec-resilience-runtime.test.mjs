import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;
let upstreamCalls = 0;
const records = Array.from({ length: 100 }, (_, index) => ({ digest: `fec-${index + 1}` }));

globalThis.fetch = async (_input, init = {}) => {
  upstreamCalls += 1;
  const envelope = JSON.parse(init.body || '{}');
  assert.equal(envelope.operation, 'search.page');
  assert.equal(envelope.payload.source_instance_id, 'fec-schedule-a');
  return new Response(JSON.stringify({
    ok: true,
    data: {
      page: {
        records,
        continuation: { last_index: 'cursor-100', last_contribution_receipt_date: '2026-01-01' },
        source_status: 'READY'
      }
    },
    receipt: { source_instance_id: 'fec-schedule-a', state: 'READY' }
  }), { status: 200, headers: { 'content-type': 'application/json' } });
};

try {
  const moduleUrl = new URL('../app/giving/history/giving-fec-resilience.js', import.meta.url);
  moduleUrl.searchParams.set('runtime-test', String(Date.now()));
  const runtime = await import(moduleUrl.href);
  assert.equal(runtime._givingFecResilience.MAX_BOUNDARY_PAGES, 1);
  assert.equal(runtime._givingFecResilience.automaticContinuation, false);

  const response = await globalThis.fetch('/api/td613-ledger', {
    method: 'POST',
    body: JSON.stringify({
      operation: 'search.page',
      payload: {
        source_instance_id: 'fec-schedule-a',
        query: { name: 'Example Contributor', page_size: 100 }
      }
    })
  });
  const body = await response.json();
  const page = body.data.page;

  assert.equal(upstreamCalls, 1, 'one explicit Giving gesture must produce exactly one FEC browser boundary request');
  assert.equal(page.records.length, 100, 'the first FEC provider page must remain intact');
  assert.deepEqual(page.continuation, { last_index: 'cursor-100', last_contribution_receipt_date: '2026-01-01' }, 'continuation must survive for the explicit Continue gesture');
  assert.deepEqual(page.client_fec_paging, {
    boundary_pages: 1,
    boundary_page_size: 100,
    automatic_continuation: false,
    continuation_exposed: true,
    retained_raw_records: 100
  });
} finally {
  globalThis.fetch = originalFetch;
}

console.log('giving-fec-resilience-runtime.test.mjs passed');
