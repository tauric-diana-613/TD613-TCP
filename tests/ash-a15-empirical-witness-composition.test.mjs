import assert from 'node:assert/strict';
import fs from 'node:fs';

const wrapper = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs', 'utf8');
const core = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe-core.mjs', 'utf8');
const composed = `${wrapper}\n${core}`;

for (const token of [
  'td613:ash:demo-registry-hydrated',
  '__td613A15HydrationWitness',
  "capture.receipt?.status === 'HYDRATED'",
  'capture.receipt?.automatic_ash_action === false',
  'profile_hydration_completion_boundary:HYDRATION_EVENT',
  'profile_hydration_receipt_required:true',
  'browser_process_isolation_per_profile:true',
  'incremental_profile_checkpoints:true',
  'A15_PROFILE_BEGIN',
  'A15_PROFILE_PASS',
  'const browser = await browserType.launch({ headless:true });',
  'await browser.close().catch(() => {})',
  'profile_entry_convergence_gated:true',
  '__td613AshDemoEntryConvergence?.version',
  '__td613AshDemoEntryConvergence?.current?.()',
  "convergence?.posture === 'READY'",
  "convergence?.phase === 'VISIBLE'",
  'ashDemoEntryReady',
  'ashDemoEntryHydrating',
  'ashDemoEntryHold',
  'matrix_cells:120'
]) assert.ok(composed.includes(token), `A15 composed witness omitted ${token}`);

assert.match(core, /await armHydrationReceiptCapture\(page, profile\)[\s\S]{0,1800}capture\.receipt\?\.status === 'HYDRATED'[\s\S]{0,600}capture\.receipt\?\.automatic_ash_action === false/);
assert.match(wrapper, /capture\.receipt\?\.automatic_ash_action === false[\s\S]{0,1800}convergence\?\.posture === 'READY'[\s\S]{0,500}convergence\?\.phase === 'VISIBLE'/);
assert.match(core, /for \(const \[mode, options\] of modes\)[\s\S]{0,420}for \(const profile of PROFILES\)[\s\S]{0,500}inspectProfile\(options, profile, mode\)[\s\S]{0,500}writeCheckpoint/);
assert.match(core, /async function inspectProfile[\s\S]{0,900}const browser = await browserType\.launch\(\{ headless:true \}\)[\s\S]*?finally[\s\S]{0,500}await browser\.close\(\)\.catch\(\(\) => \{\}\)/);
assert.doesNotMatch(composed, /automatic_ash_action:true|promotion_authority:true|production_mutation:true/);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a15-empirical-witness-composition/v0.1',
  registered_hydration_receipt:true,
  strict_automatic_action_false:true,
  canonical_entry_convergence_after_hydration:true,
  browser_process_isolation_per_profile:true,
  incremental_profile_checkpoints:true,
  matrix_cells:120,
  authority_changed:false,
  production_mutation:false,
  human_closure_required:true
}, null, 2));
