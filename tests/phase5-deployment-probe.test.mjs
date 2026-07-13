import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inspectPhase5RelationLab } from '../scripts/phase5-relation-browser-probe.mjs';
import { probePhase5Deployment } from '../scripts/phase5-relation-deployment-probe.mjs';

const html = fs.readFileSync('app/dome-world/relation-envelope.html', 'utf8');
const browser = inspectPhase5RelationLab(html);
assert.equal(browser.outcome, 'PHASE5_BROWSER_CONTRACT_VERIFIED');
assert.equal(browser.production_demonstrated, false);
assert.equal(browser.checks.intact_replay_present, true);

const fakeFetch = async () => ({
  ok: true,
  status: 200,
  headers: { get: name => name.toLowerCase() === 'content-type' ? 'text/html; charset=utf-8' : null },
  text: async () => html
});
const deployment = await probePhase5Deployment('https://example.invalid', { fetchImpl: fakeFetch });
assert.equal(deployment.outcome, 'PHASE5_DEPLOYMENT_SURFACE_VERIFIED');
assert.equal(deployment.production_demonstrated, false);
assert.equal(deployment.browser.outcome, 'PHASE5_BROWSER_CONTRACT_VERIFIED');

const broken = inspectPhase5RelationLab('<!doctype html><title>broken</title>');
assert.equal(broken.outcome, 'HOLD_PHASE5_BROWSER_CONTRACT');
assert.ok(broken.failed.includes('explicit_confirmation_present'));

console.log('phase5-deployment-probe.test.mjs passed');
