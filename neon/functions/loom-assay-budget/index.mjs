import { verifyVercelOidc } from './vercel-identity.mjs';
import { inspectRun, reserveCall, completeCall } from './ledger.mjs';

const response = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});
export function createAssayBudgetFunction({ pool, verifyWorkload = verifyVercelOidc } = {}) {
  return { async fetch(request) {
    if (request.method !== 'POST') return response(405, { status: 'HELD', error: 'ASSAY_METHOD' });
    try {
      const token = request.headers.get('authorization');
      if (!token?.startsWith('Bearer ')) throw new Error('OIDC_MISSING');
      await verifyWorkload(token.slice(7)); // Before parsing a body or touching Postgres.
    } catch { return response(401, { status: 'HELD', error: 'ASSAY_WORKLOAD_UNAUTHORIZED' }); }
    try {
      const text = await request.text();
      if (Buffer.byteLength(text) > 16000) throw new Error('ASSAY_LEDGER_BODY_LIMIT');
      const body = JSON.parse(text);
      if (body.schema !== 'td613.loom.assay-budget-request/v0.1') throw new Error('ASSAY_LEDGER_SCHEMA');
      const operation = { inspect: inspectRun, reserve: reserveCall, complete: completeCall }[body.operation];
      if (!operation || Object.keys(body).length !== 3) throw new Error('ASSAY_LEDGER_OPERATION');
      const result = await operation(pool, body.input);
      return response(200, { schema: 'td613.loom.assay-budget-response/v0.1', status: 'ok', result });
    } catch { return response(409, { schema: 'td613.loom.assay-budget-response/v0.1', status: 'HELD', error: 'ASSAY_BUDGET_OR_BINDING_HELD' }); }
  } };
}
let deployed;
export default { async fetch(request) {
  // Missing runtime configuration fails closed; importing for structural tests does not open a database.
  if (!process.env.DATABASE_URL) return response(503, { status: 'HELD', error: 'ASSAY_DATABASE_UNCONFIGURED' });
  if (!deployed) {
    const { Pool } = await import('pg');
    const { attachDatabasePool } = await import('@neon/functions');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
    attachDatabasePool(pool);
    deployed = createAssayBudgetFunction({ pool });
  }
  return deployed.fetch(request);
} };
