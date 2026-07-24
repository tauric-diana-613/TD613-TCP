import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a10-choir-recompilation.js', import.meta.url), 'utf8');
const premium = fs.readFileSync(new URL('../app/dome-world/ash-premium-ui.js', import.meta.url), 'utf8');
const probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/ash-flowcore-live-field.yml', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A10_IMPLEMENTATION_RECEIPT_V0_1.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

for (const marker of [
  'Choir compares bounded readings to show what appears only in combination, what remains disagreement, and what no Reader can establish.',
  'Choose two Readers or declared routes',
  'What each receives alone',
  'Run the pair',
  'Shared',
  'Pair-emergent',
  'Contradictory',
  'Missing',
  'Unresolved',
  'Human interpretation',
  'Rest or test another pair',
  'Can a Reader reconstruct what should remain hidden?',
  'Residue remains an observed relation, not a verdict',
  'Existing Ash owners retain every consequential action.'
]) assert.ok(source.includes(marker), `A10 source missing ${marker}`);

for (const residueClass of ['Shared','Pair-emergent','Contradictory','Missing','Unresolved']) {
  assert.ok(source.includes(`name:'${residueClass}'`), `A10 missing ${residueClass} residue class`);
}

assert.match(source, /const RESIDUE_CLASSES = Object\.freeze/);
assert.match(source, /const ACTIVE_RECOMPILATION_EVENTS = Object\.freeze/);
assert.match(source, /async function restoreActiveRecompilation\(source\)/);
assert.match(source, /function installActiveRecompilationOwner\(\)/);
assert.match(source, /__td613AshA9A10ActiveRecompilationOwner/);
assert.match(source, /\['work','choir'\]\.includes\(workspace\)/);
assert.match(source, /await host\?\.__td613AshPremiumUI\?\.refresh\?\.\(\)/);
assert.match(source, /compiler\.refresh\(`ACTIVE_RENDER_OWNER_/);
assert.match(source, /ambient_subtree_observer:false/);
assert.match(source, /recurring_timer:false/);
assert.match(source, /automatic_consequential_action:false/);
assert.match(source, /function singletonRows\(snapshot\)/);
assert.match(source, /function readiness\(snapshot\)/);
assert.match(source, /function ensureOrientation\(\)/);
assert.match(source, /id = 'ashA10ChoirOrientation'/);
assert.match(source, /id="ashA10ResidueClass"/);
assert.match(source, /id="ashA10HumanInterpretation"/);
assert.match(source, /data-route-workspace="test"/);
assert.match(source, /installAshStage\(\{/);
assert.match(source, /stage:'A10'/);
assert.match(source, /automatic_assay:false/);
assert.match(source, /automatic_rebuild_test:false/);
assert.match(source, /human_interpretation_required:true/);
assert.match(source, /authority_changed:false/);
assert.match(source, /source_bytes_moved:false/);
assert.match(source, /human_closure_required:true/);

assert.doesNotMatch(source, /MutationObserver/);
assert.doesNotMatch(source, /setInterval\s*\(/);
assert.doesNotMatch(source, /setTimeout\s*\(/);
assert.doesNotMatch(source, /indexedDB\.(?:open|deleteDatabase)/);
assert.doesNotMatch(source, /localStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(source, /sessionStorage\.(?:setItem|removeItem|clear)/);
assert.doesNotMatch(source, /fetch\s*\(/);
assert.doesNotMatch(source, /XMLHttpRequest/);
assert.doesNotMatch(source, /new\s+(?:Worker|SharedWorker)/);
assert.doesNotMatch(source, /\.click\(\)/);
assert.doesNotMatch(source, /runDeterministicMoireAssay/);
assert.doesNotMatch(source, /compileReaderProfile/);
assert.doesNotMatch(source, /replayMoireRebuildAssay/);
assert.doesNotMatch(source, /makeSave/);
assert.doesNotMatch(source, /approveRelease/);

for (const marker of [
  'runDeterministicMoireAssay',
  'compileReaderProfile',
  'verifyMoireRebuildAssay',
  'replayMoireRebuildAssay',
  'verifyMoireRebuildReplay',
  'Pairwise residue ≠ intent',
  'if (entries.length < 2)',
  'storage was not mutated'
]) assert.ok(premium.includes(marker), `Native Choir owner missing ${marker}`);

assert.match(core, /ash-a10-choir-recompilation\.js\?v=20260723-a10-v1/);
assert.match(core, /__td613AshA10ModulePromise/);
assert.match(core, /td613:ash:a10-load-held/);
assert.match(core, /__td613AshA10WorkspaceOwner/);
assert.match(core, /await loadA10Module\(\)/);
assert.match(core, /await host\.__td613AshA10\?\.refresh\?\.\('UX_WORKSPACE_OPENED'\)/);
assert.match(core, /native_choir_preserved:true/);
assert.match(core, /automatic_assay:false/);
assert.match(core, /automatic_rebuild_test:false/);
assert.doesNotMatch(core, /MutationObserver/);
assert.doesNotMatch(core, /ash_epoch/);

assert.match(probe, /if \(stage === 'A10'\)/);
assert.match(probe, /#ashA10ChoirOrientation/);
for (const marker of ['what appears only in combination','Shared','Pair-emergent','Contradictory','Missing','Unresolved','Can a Reader reconstruct what should remain hidden?']) {
  assert.ok(probe.includes(`'${marker}'`), `A10 browser witness missing ${marker}`);
}

for (const marker of [
  "'app/dome-world/ash-a10-choir-recompilation.js'",
  "'app/dome-world/docs/ASH_KEEP_A10_IMPLEMENTATION_RECEIPT_V0_1.md'",
  "'tests/ash-a10-choir-recompilation.test.mjs'",
  'node --check app/dome-world/ash-a10-choir-recompilation.js',
  'node tests/ash-a10-choir-recompilation.test.mjs',
  'TD613_ASH_STAGES: A7,A8,A9,A10'
]) assert.ok(workflow.includes(marker), `A10 workflow missing ${marker}`);

for (const marker of ['Choir and Rebuild Test recompilation','singleton-first','Shared','Pair-emergent','Contradictory','Missing','Unresolved','human interpretation required: true','human closure required: true']) {
  assert.ok(receipt.includes(marker), `A10 receipt missing ${marker}`);
}

assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a10-choir-contract/v0.1',
  singleton_first:true,
  residue_classes:RESIDUE_CLASSES_COUNT(),
  native_choir_preserved:true,
  native_rebuild_owner_preserved:true,
  active_render_owner:'NAMED_EVENTS_ONLY',
  ambient_subtree_observer:false,
  recurring_timer:false,
  automatic_assay:false,
  automatic_rebuild_test:false,
  human_interpretation_required:true,
  raw_content_transport:false,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));

function RESIDUE_CLASSES_COUNT() {
  return ['Shared','Pair-emergent','Contradictory','Missing','Unresolved'].length;
}