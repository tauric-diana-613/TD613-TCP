import assert from 'node:assert/strict';
import fs from 'node:fs';

const probe = fs.readFileSync('scripts/ash-a13-demo-registry-browser-probe.mjs', 'utf8');

assert.match(probe, /captureConvergenceState\(page, checkpoint\)/,
  'A13 observer must preserve coordinate-level post-click diagnostics.');
assert.match(probe, /BEFORE_INVESTIGATION_ACTIVATION/);
assert.match(probe, /IMMEDIATELY_AFTER_INVESTIGATION_ACTIVATION/);
assert.match(probe, /POST_CLICK_CONVERGENCE_TIMEOUT/);
assert.match(probe, /POST_CLICK_CONVERGENCE_PASS/);
assert.match(probe, /active_case:current\?\.case_id \|\| null/);
assert.match(probe, /selected_profile:root\.dataset\.ashDemoRegistryProfile \|\| null/);
assert.match(probe, /premium_workspace:root\.dataset\.ashPremiumWorkspace \|\| null/);
assert.match(probe, /registry_state:root\.dataset\.ashDemoRegistryState \|\| null/);
assert.match(probe, /registry_owner:root\.dataset\.ashDemoControlOwner \|\| null/);
assert.match(probe, /start_demo_state:button\?\.dataset\.ashMethodDemoState \|\| null/);
assert.match(probe, /start_demo_disabled:button\?\.disabled \?\? null/);
assert.match(probe, /a13-convergence-diagnostic\.json/,
  'timeout diagnostics must be persisted as an artifact.');
assert.match(probe, /a13-convergence-timeout\.png/,
  'timeout state must retain a visual witness when Chromium remains screenshot-capable.');

const unchangedConjunction = /Boolean\(window\.__td613AshKeep\?\.current\?\.\(\)\?\.case_id\)[\s\S]*ashDemoRegistryProfile === 'investigation'[\s\S]*ashPremiumWorkspace === 'home'[\s\S]*timeout:120_000/;
assert.match(probe, unchangedConjunction,
  'diagnostic instrumentation may not weaken, skip, or substitute the canonical A13 post-click convergence law.');

assert.doesNotMatch(probe, /TD613_PRODUCTION_OBSERVATION[^\n]*=[^=]/,
  'observer telemetry may not create production mutation authority.');
assert.doesNotMatch(probe, /fetch\([^\n]*(POST|PUT|PATCH|DELETE)|git push|vercel@latest deploy/,
  'A13 observer must remain read-only.');

console.log('ash-a13-production-diagnostic-contract.test.mjs passed: A13 convergence law preserved with coordinate telemetry and no mutation authority');
