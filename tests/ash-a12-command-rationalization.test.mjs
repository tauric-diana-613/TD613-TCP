import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSource = fs.readFileSync('app/dome-world/ash-a12-command-rationalization.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const shell = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const index = fs.readFileSync('app/dome-world/docs/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md', 'utf8');
const amendment = fs.readFileSync('app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

for (const phrase of ['Custody','Rooms','Routes','Rebuild Test','Draft & Hush','Save Points','Destination Handoff','Receipts','Cases & Profiles','Safe Harbor','What changed—and what did not']) {
  assert.ok(moduleSource.includes(phrase), `Missing ${phrase}`);
}
assert.match(moduleSource, /inert_controls/);
assert.match(moduleSource, /empty_drawers/);
assert.match(moduleSource, /authority_changed:false/);
assert.match(moduleSource, /source_bytes_moved:false/);
assert.match(moduleSource, /human_closure_required:true/);
assert.match(moduleSource, /data-command-action="profile"/);
assert.match(moduleSource, /Save and close the current case session/);
assert.match(moduleSource, /async function openCasesAndProfiles\(\)/);
assert.match(moduleSource, /__td613AshCaseCloseRepair\?\.close/);
assert.match(moduleSource, /await closeCase\(\)/);
assert.match(moduleSource, /CASE_CLOSED_SELECTOR_OPENED/);
assert.match(moduleSource, /case_data_preserved:true/);
assert.match(moduleSource, /profile_inferred:false/);
assert.match(moduleSource, /function focusProfileSelector\(profile\)/);
assert.match(moduleSource, /requestAnimationFrame/);
assert.match(moduleSource, /ashA12ProfileSelector/);
assert.doesNotMatch(moduleSource, /localStorage\.(?:removeItem|clear)/);
assert.doesNotMatch(moduleSource, /indexedDB\.(?:open|deleteDatabase)/);
assert.doesNotMatch(moduleSource, /setInterval\s*\(/);
assert.doesNotMatch(moduleSource, /MutationObserver/);
assert.match(bridge, /ash-a12-command-rationalization\.js\?v=20260724-a12-release-v1/);
assert.match(shell, /ASH_LIFECYCLE_ASSET_EPOCH = '20260724-a12-release-v1'/);
assert.match(shell, /ASH_MASS_EVICTION_EPOCH = 'td613\.ash\.cache-flush\/2026-07-24-a11-postclosure-v1'/);
assert.doesNotMatch(shell, /a12.*cache-preflight/i);
assert.match(index, /A12 · Command-menu rationalization and dead-control repair/);
assert.match(amendment, /mass eviction.*A15 postclosure/is);
assert.equal(vercel.git.deploymentEnabled, false);
console.log('Ash A12 command rationalization contract passed.');
