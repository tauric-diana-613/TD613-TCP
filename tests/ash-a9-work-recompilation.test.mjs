import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a9-work-recompilation.js', import.meta.url), 'utf8');
const probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/td613-ci.yml', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A9_IMPLEMENTATION_RECEIPT_V0_1.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const RELEASE_EPOCH = '20260724-a12-release-v1';

for (const marker of [
  'Do now','Prepare','Waiting / held','Completed / receipted','Purpose','Action','Expected world answer',
  'Held prerequisites','Receipt / return posture',
  'Original → transformation purpose → protected obligations → changed register → side-by-side comparison → Human approval',
  'Human approval','parallel task engine','separately gated destination crossing remains closed',
  'Queue placement grants no truth or release authority'
]) assert.ok(source.includes(marker), `A9 source missing ${marker}`);
for (const family of ['preserve','review','draft','compare','route','verify','save','prepare handoff']) assert.ok(source.includes(`family:'${family}'`));
for (const workspace of ['capsule','draft','choir','routes','test','save']) assert.ok(source.includes(`workspace:'${workspace}'`));
for (const token of ['const ACTION_FAMILIES = Object.freeze','function readiness(snapshot, action)','function actionCard(snapshot, action)','function priorityItems(snapshot)','function completedItems(snapshot)','function heldItems(snapshot)','data-ash-a9-action','data-route-workspace','stage:\'A9\'','authority_changed:false','source_bytes_moved:false','human_closure_required:true']) assert.ok(source.includes(token), `A9 source missing ${token}`);
for (const pattern of [/indexedDB\.(?:open|deleteDatabase)/,/localStorage\.(?:setItem|removeItem|clear)/,/sessionStorage\.(?:setItem|removeItem|clear)/,/fetch\s*\(/,/XMLHttpRequest/,/new\s+(?:Worker|SharedWorker)/,/\.click\(\)/,/approveRelease/,/askHush/,/keepDraft/,/recordRoute/,/makeSave/]) assert.doesNotMatch(source, pattern);

assert.match(core, new RegExp(`ash-a9-work-recompilation\\.js\\?v=${RELEASE_EPOCH}`));
for (const token of ['__td613AshA9ModulePromise','td613:ash:a9-load-held','td613:ash:ux-workspace-opened','__td613AshA9WorkspaceOwner','await loadA9Module()','UX_WORKSPACE_OPENED']) assert.ok(core.includes(token));
assert.doesNotMatch(core, /MutationObserver|ash_epoch/);
assert.match(probe, /if \(stage === 'A9'\)/);
assert.match(probe, /ashA9WorkRecompilation/);
for (const marker of ['Do now','Prepare','Waiting / held','Completed / receipted','Human approval']) assert.ok(probe.includes(`'${marker}'`));
for (const token of ['async function commitA8Gesture(page, fields, buttonId)','control.dispatchEvent(new Event(\'input\', { bubbles:true }))','button.click()','await commitA8Gesture(page, {']) assert.ok(probe.includes(token), `A8 browser witness omitted atomic gesture token ${token}`);
for (const pattern of [/locator\('#ashA8ObjectName'\)\.fill/,/locator\('#ashA8RelationFrom'\)\.selectOption/,/locator\('#ashA8CommitObject'\)\.click/,/locator\('#ashA8CommitRelation'\)\.click/]) assert.doesNotMatch(probe, pattern, 'A8 browser witness must not split one deliberate gesture across a recompilable DOM');
for (const marker of ['node tests/ash-a9-work-recompilation.test.mjs','TD613_ASH_STAGES=\'A7,A8,A9,A10,A11\'','scripts/ash-a7-a11-browser-probe.mjs','One exact-head Chromium Firefox WebKit witness']) assert.ok(workflow.includes(marker), `Consolidated A9 witness missing ${marker}`);
assert.match(workflow, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(workflow, /github\.event_name == 'pull_request' && github\.event\.action == 'ready_for_review'/);
for (const marker of ['Work recompilation','human intention','Do now','Prepare','Waiting / held','Completed / receipted','Hush integration','human closure required: true']) assert.ok(receipt.includes(marker));
assert.equal(vercel.git?.deploymentEnabled, false);
console.log(JSON.stringify({ok:true,schema:'td613.ash.a9-work-contract/v0.1',action_families:8,parallel_task_engine:false,raw_content_transport:false,authority_changed:false,source_bytes_moved:false,human_closure_required:true,vercel_gate:'CLOSED'}, null, 2));
