import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync(new URL('../.github/workflows/ash-a8-production-observation-closure.yml', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A8_PRODUCTION_OBSERVATION_HOLD_V0_1.md', import.meta.url), 'utf8');

assert.match(workflow, /permissions:\n  contents: read/);
assert.doesNotMatch(workflow, /contents: write/);
assert.doesNotMatch(workflow, /git push|vercel deploy|deploymentEnabled\s*=\s*true|add_comment|gh api/i);
assert.match(workflow, /TD613_BASE_URL: https:\/\/td613\.com/);
assert.match(workflow, /TD613_SOURCE_PACKET_COMMIT: 226873430e06a8fcb7425e8f7ada673b90d20d23/);
assert.match(workflow, /ref: c7050677d49e38a2b9d67efb4a8bd43e7bd9f9fe/);
assert.match(workflow, /ash-a8-case-map-recompilation\.js/);
assert.match(workflow, /matrix:\n        browser: \[chromium, firefox, webkit\]/);
assert.match(workflow, /TD613_ASH_STAGES: A7,A8/);
assert.match(workflow, /run-ash-constitutional-convergence-handshake\.mjs/);
assert.match(workflow, /promotion_authorized !== false/);
assert.match(receipt, /close unmerged/);
assert.match(receipt, /DEPLOYMENT GATE CLOSED/);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a8.production-observation-closure-contract/v0.1',
  read_only:true,
  deployment_authorized:false,
  exact_source_packet:'226873430e06a8fcb7425e8f7ada673b90d20d23',
  relock_commit:'c7050677d49e38a2b9d67efb4a8bd43e7bd9f9fe',
  browsers:['chromium','firefox','webkit'],
  human_closure_required:true
}, null, 2));
