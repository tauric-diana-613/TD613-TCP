#!/usr/bin/env node
import { inspectPhase5RelationLab } from './phase5-relation-browser-probe.mjs';

export async function probePhase5Deployment(baseUrl, {
  fetchImpl = globalThis.fetch,
  route = '/dome-world/relation-envelope.html'
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('Fetch is unavailable.');
  const base = new URL(baseUrl);
  const url = new URL(route, base);
  const response = await fetchImpl(url, { method: 'GET', redirect: 'follow', cache: 'no-store' });
  const html = await response.text();
  const browser = inspectPhase5RelationLab(html);
  const contentType = response.headers?.get?.('content-type') || '';
  const checks = Object.freeze({
    http_ok: response.ok,
    html_content_type: /text\/html/i.test(contentType),
    browser_contract: browser.outcome === 'PHASE5_BROWSER_CONTRACT_VERIFIED'
  });
  const failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
  return Object.freeze({
    schema: 'td613.phase5.deployment-probe/v0.1',
    base_url: base.origin,
    route,
    status: response.status,
    outcome: failed.length ? 'HOLD_PHASE5_DEPLOYMENT' : 'PHASE5_DEPLOYMENT_SURFACE_VERIFIED',
    checks,
    failed: Object.freeze(failed),
    browser,
    production_demonstrated: false,
    note: 'Surface verification alone does not earn production-demonstrated status.',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.argv[2] || process.env.PHASE5_BASE_URL;
  if (!baseUrl) {
    process.stderr.write('Usage: node scripts/phase5-relation-deployment-probe.mjs <base-url>\n');
    process.exit(2);
  }
  const result = await probePhase5Deployment(baseUrl);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.failed.length) process.exitCode = 1;
}
