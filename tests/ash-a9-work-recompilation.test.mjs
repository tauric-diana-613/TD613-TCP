import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a9-work-recompilation.js', import.meta.url), 'utf8');
const probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/ash-flowcore-live-field.yml', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A9_IMPLEMENTATION_RECEIPT_V0_1.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

for (const marker of [
  'Do now',
  'Prepare',
  'Waiting / held',
  'Completed / receipted',
  'Purpose',
  'Action',
  'Expected world answer',
  'Held prerequisites',
  'Receipt / return posture',
  'Original → transformation purpose → protected obligations → changed register → side-by-side comparison → Human approval',
  'Human approval',
  'parallel task engine',
  'separately gated destination crossing remains closed',
  'Queue placement grants no truth or release authority'
]) assert.ok(source.includes(marker), `A9 source missing ${marker}`);

for (const family of ['preserve','review','draft','compare','route','verify','save','prepare handoff']) {
  assert.ok(source.includes(`family:'${family}'`), `A9 missing ${family} action family`);
}

for (const workspace of ['capsule','draft','choir','routes','test','save']) {
  assert.ok(source.includes(`workspace:'${workspace}'`), `A9 missing route to existing ${workspace} owner`);
}

assert.match(source, /const ACTION_FAMILIES = Object\.freeze/);
assert.match(source, /function readiness\(snapshot, action\)/);
assert.match(source, /function actionCard\(snapshot, action\)/);
assert.match(source, /function priorityItems\(snapshot\)/);
assert.match(source, /function completedItems\(snapshot\)/);
assert.match(source, /function heldItems\(snapshot\)/);
assert.match(source, /data-ash-a9-action/);
assert.match(source, /data-route-workspace/);
assert.match(source, /installAshStage\(\{/);
assert.match(source, /stage:'A9'/);
assert.match(source, /authority_changed:false/);
assert.match(source, /source_bytes_moved:false/);
assert.match(source, /human_closure_required:true/);
assert.doesNotMatch(source, /indexedDB\.(?:open|deleteDatabase)/);
assert.doesNotMatch(source, /localStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(source, /sessionStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(source, /fetch\s*\(/);
assert.doesNotMatch(source, /XMLHttpRequest/);
assert.doesNotMatch(source, /new\s+(?:Worker|SharedWorker)/);
assert.doesNotMatch(source, /\.click\(\)/);
assert.doesNotMatch(source, /approveRelease/);
assert.doesNotMatch(source, /askHush/);
assert.doesNotMatch(source, /keepDraft/);
assert.doesNotMatch(source, /recordRoute/);
assert.doesNotMatch(source, /makeSave/);

assert.match(core, /ash-a9-work-recompilation\.js\?v=20260723-a9-v1/);
assert.match(core, /__td613AshA9ModulePromise/);
assert.match(core, /td613:ash:a9-load-held/);
assert.match(core, /td613:ash:ux-workspace-opened/);
assert.match(core, /__td613AshA9WorkspaceOwner/);
assert.match(core, /await loadA9Module\(\)/);
assert.match(core, /await host\.__td613AshA9\?\.refresh\?\.\('UX_WORKSPACE_OPENED'\)/);
assert.doesNotMatch(core, /MutationObserver/);
assert.doesNotMatch(core, /ash_epoch/);

assert.match(probe, /if \(stage === 'A9'\)/);
assert.match(probe, /ashA9WorkRecompilation/);
assert.match(probe, /'Do now','Prepare','Waiting \/ held','Completed \/ receipted','Human approval'/);

for (const marker of [
  "'app/dome-world/ash-a9-work-recompilation.js'",
  "'app/dome-world/docs/ASH_KEEP_A9_IMPLEMENTATION_RECEIPT_V0_1.md'",
  "'tests/ash-a9-work-recompilation.test.mjs'",
  'node --check app/dome-world/ash-a9-work-recompilation.js',
  'node tests/ash-a9-work-recompilation.test.mjs',
  'TD613_ASH_STAGES: A7,A8,A9'
]) assert.ok(workflow.includes(marker), `A9 workflow missing ${marker}`);

for (const marker of ['Work recompilation','human intention','Do now','Prepare','Waiting / held','Completed / receipted','Hush integration','human closure required: true']) {
  assert.ok(receipt.includes(marker), `A9 receipt missing ${marker}`);
}

assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a9-work-contract/v0.1',
  human_intention_queues:true,
  action_families:8,
  native_owner_routing:true,
  settled_workspace_ownership:true,
  settled_loader_admission:true,
  exact_browser_witness_identity:true,
  mutation_observer_added:false,
  hush_generation_automatic:false,
  consequential_action_automatic:false,
  parallel_task_engine:false,
  raw_content_transport:false,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
