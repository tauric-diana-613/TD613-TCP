import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a10-choir-recompilation.js', import.meta.url), 'utf8');
const premium = fs.readFileSync(new URL('../app/dome-world/ash-premium-ui.js', import.meta.url), 'utf8');
const probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/td613-ci.yml', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A10_IMPLEMENTATION_RECEIPT_V0_1.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const RELEASE_EPOCH = '20260724-a12-release-v1';

for (const marker of [
  'Choir compares bounded readings to show what appears only in combination, what remains disagreement, and what no Reader can establish.',
  'Choose two Readers or declared routes','What each receives alone','Run the pair','Shared','Pair-emergent','Contradictory',
  'Missing','Unresolved','Human interpretation','Rest or test another pair','Can a Reader reconstruct what should remain hidden?',
  'Residue remains an observed relation, not a verdict','Existing Ash owners retain every consequential action.'
]) assert.ok(source.includes(marker), `A10 source missing ${marker}`);
for (const residueClass of ['Shared','Pair-emergent','Contradictory','Missing','Unresolved']) assert.ok(source.includes(`name:'${residueClass}'`));
for (const token of ['const RESIDUE_CLASSES = Object.freeze','const ACTIVE_RECOMPILATION_EVENTS = Object.freeze','async function restoreActiveRecompilation(source)','function installActiveRecompilationOwner()','__td613AshA9A10ActiveRecompilationOwner','ambient_subtree_observer:false','recurring_timer:false','automatic_consequential_action:false','function singletonRows(snapshot)','function readiness(snapshot)','function ensureOrientation()','ashA10ChoirOrientation','ashA10ResidueClass','ashA10HumanInterpretation','data-route-workspace="test"',"stage:'A10'",'automatic_assay:false','automatic_rebuild_test:false','human_interpretation_required:true','authority_changed:false','source_bytes_moved:false','human_closure_required:true']) assert.ok(source.includes(token), `A10 source missing ${token}`);
for (const pattern of [/MutationObserver/,/setInterval\s*\(/,/setTimeout\s*\(/,/indexedDB\.(?:open|deleteDatabase)/,/localStorage\.(?:setItem|removeItem|clear)/,/sessionStorage\.(?:setItem|removeItem|clear)/,/fetch\s*\(/,/XMLHttpRequest/,/new\s+(?:Worker|SharedWorker)/,/\.click\(\)/,/runDeterministicMoireAssay/,/compileReaderProfile/,/replayMoireRebuildAssay/,/makeSave/,/approveRelease/]) assert.doesNotMatch(source, pattern);
for (const marker of ['runDeterministicMoireAssay','compileReaderProfile','verifyMoireRebuildAssay','replayMoireRebuildAssay','verifyMoireRebuildReplay','Pairwise residue ≠ intent','if (entries.length < 2)','storage was not mutated']) assert.ok(premium.includes(marker));
assert.match(core, new RegExp(`ash-a10-choir-recompilation\\.js\\?v=${RELEASE_EPOCH}`));
for (const token of ['__td613AshA10ModulePromise','td613:ash:a10-load-held','__td613AshA10WorkspaceOwner','await loadA10Module()','UX_WORKSPACE_OPENED','native_choir_preserved:true','automatic_assay:false','automatic_rebuild_test:false']) assert.ok(core.includes(token));
assert.doesNotMatch(core, /MutationObserver|ash_epoch/);
assert.match(probe, /if \(stage === 'A10'\)/);
assert.match(probe, /#ashA10ChoirOrientation/);
for (const marker of ['what appears only in combination','Shared','Pair-emergent','Contradictory','Missing','Unresolved','Can a Reader reconstruct what should remain hidden?']) assert.ok(probe.includes(`'${marker}'`));
for (const marker of ['node tests/ash-a10-choir-recompilation.test.mjs','TD613_ASH_STAGES=\'A7,A8,A9,A10,A11\'','scripts/ash-a7-a11-browser-probe.mjs','Full-product exact-head Chromium Firefox WebKit witness']) assert.ok(workflow.includes(marker), `Consolidated A10 witness missing ${marker}`);
assert.match(workflow, /github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
assert.match(workflow, /github\.event_name == 'pull_request' && github\.event\.action == 'ready_for_review'/);
for (const marker of ['Choir and Rebuild Test recompilation','singleton-first','Shared','Pair-emergent','Contradictory','Missing','Unresolved','human interpretation required: true','human closure required: true']) assert.ok(receipt.includes(marker));
assert.equal(vercel.git?.deploymentEnabled, false);
console.log(JSON.stringify({ok:true,schema:'td613.ash.a10-choir-contract/v0.1',residue_classes:5,native_choir_preserved:true,automatic_assay:false,automatic_rebuild_test:false,human_interpretation_required:true,raw_content_transport:false,authority_changed:false,source_bytes_moved:false,human_closure_required:true,vercel_gate:'CLOSED'}, null, 2));
