import { requireThat } from './loom-assay-contract.js';

export function createAssayBudgetClient({ environment = process.env, fetchImpl = fetch } = {}) {
  return async (operation, input) => {
    const url = new URL(environment.TD613_LOOM_ASSAY_BUDGET_URL || 'https://invalid.invalid');
    const token = environment.VERCEL_OIDC_TOKEN;
    requireThat(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash
      && /\.compute\.[a-z0-9.-]+\.aws\.neon\.tech$/.test(url.hostname)
      && typeof token === 'string' && token.length > 0, 'ASSAY_BUDGET_WORKLOAD_UNCONFIGURED');
    const response = await fetchImpl(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ schema: 'td613.loom.assay-budget-request/v0.1', operation, input }) });
    const raw = Buffer.from(await response.arrayBuffer());
    requireThat(raw.length <= 32000, 'ASSAY_BUDGET_RESPONSE_LIMIT');
    const body = JSON.parse(raw.toString('utf8'));
    requireThat(response.ok && body.schema === 'td613.loom.assay-budget-response/v0.1' && body.status === 'ok', 'ASSAY_DURABLE_BUDGET_HELD');
    return body.result;
  };
}
