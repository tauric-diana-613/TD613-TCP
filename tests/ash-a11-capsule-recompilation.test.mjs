import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a11-capsule-recompilation.js', import.meta.url), 'utf8');
const premium = fs.readFileSync(new URL('../app/dome-world/ash-premium-ui.js', import.meta.url), 'utf8');
const destination = fs.readFileSync(new URL('../app/dome-world/ash-destination-handoff.js', import.meta.url), 'utf8');
const probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/ash-flowcore-live-field.yml', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A11_IMPLEMENTATION_RECEIPT_V0_1.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

for (const marker of [
  'What is preserved',
  'What remains outside',
  'Who may open it',
  'What closes it',
  'Where it may go',
  'Which receipt follows it',
  'How it may return',
  'What sealing does not prove',
  'Save Points · continuity snapshots',
  'A Save Point preserves a return address; it does not rewind the present',
  'Destination handoff · separate authority',
  'Preparation belongs in Capsule; actual handoff remains outside the seal',
  'Preservation, sealing, transport preparation, crossing, receipt, return, and closure remain distinct',
  'Native owners retain every consequential action.'
]) assert.ok(source.includes(marker), `A11 source missing ${marker}`);

for (const question of [
  'What is preserved',
  'What remains outside',
  'Who may open it',
  'What closes it',
  'Where it may go',
  'Which receipt follows it',
  'How it may return',
  'What sealing does not prove'
]) assert.ok(source.includes(`question:'${question}'`), `A11 custody question missing ${question}`);

assert.match(source, /const CAPSULE_QUESTIONS = Object\.freeze/);
assert.match(source, /function continuityPosture\(snapshot\)/);
assert.match(source, /function ensureCapsuleRoot\(\)/);
assert.match(source, /id = 'ashA11CapsuleRecompilation'/);
assert.match(source, /function focusNativeCapsule\(\)/);
assert.match(source, /data-route-workspace="save"/);
assert.match(source, /href="\/app\/dome-world\/ash-destination-handoff\.html"/);
assert.match(source, /installAshStage\(\{/);
assert.match(source, /stage:'A11'/);
assert.match(source, /actual_destination_handoff_separate:true/);
assert.match(source, /automatic_save:false/);
assert.match(source, /automatic_export:false/);
assert.match(source, /automatic_import:false/);
assert.match(source, /automatic_handoff:false/);
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
assert.doesNotMatch(source, /\.prepare\s*\(/);
assert.doesNotMatch(source, /\.send\s*\(/);
assert.doesNotMatch(source, /compileDestinationHandoff/);
assert.doesNotMatch(source, /makeSave/);
assert.doesNotMatch(source, /exportCapsule/);
assert.doesNotMatch(source, /importCapsule/);

for (const marker of ['premiumCapsuleBody','premiumSealSave','premiumExportCapsule','premiumImportCapsule','premiumInspectSave','makeSave','exportCapsule','importCapsule']) {
  assert.ok(premium.includes(marker), `Native Capsule owner missing ${marker}`);
}
for (const marker of ['compileDestinationHandoffPlan','compileDestinationHandoffAuthorization','compileDestinationHandoffAttempt','compileDestinationHandoffRecipientReceipt','compileDestinationHandoffCustodyAccounting','replayDestinationHandoff','AUTHORIZE_EXACT_DESTINATION_HANDOFF']) {
  assert.ok(destination.includes(marker), `Separate Destination handoff owner missing ${marker}`);
}

assert.match(core, /td613\.ash\.a7-a11-recompiler-core\/v0\.3/);
assert.match(core, /ash-a11-capsule-recompilation\.js\?v=20260724-a11-v1/);
assert.match(core, /__td613AshA11ModulePromise/);
assert.match(core, /td613:ash:a11-load-held/);
assert.match(core, /__td613AshA11WorkspaceOwner/);
assert.match(core, /await loadA11Module\(\)/);
assert.match(core, /await host\.__td613AshA11\?\.refresh\?\.\('UX_WORKSPACE_OPENED'\)/);
assert.match(core, /native_capsule_preserved:true/);
assert.match(core, /save_point_owner_preserved:true/);
assert.match(core, /destination_handoff_separate:true/);
assert.match(core, /automatic_handoff:false/);
assert.doesNotMatch(core, /MutationObserver/);
assert.doesNotMatch(core, /setInterval/);
assert.doesNotMatch(core, /ash_epoch/);

assert.match(probe, /if \(stage === 'A11'\)/);
assert.match(probe, /#ashA11CapsuleRecompilation/);
for (const marker of ['What is preserved','What remains outside','Who may open it','What closes it','Where it may go','What sealing does not prove','Destination handoff']) {
  assert.ok(probe.includes(`'${marker}'`), `A11 browser witness missing ${marker}`);
}

for (const marker of [
  "'app/dome-world/ash-a11-capsule-recompilation.js'",
  "'app/dome-world/docs/ASH_KEEP_A11_IMPLEMENTATION_RECEIPT_V0_1.md'",
  "'tests/ash-a11-capsule-recompilation.test.mjs'",
  'node --check app/dome-world/ash-a11-capsule-recompilation.js',
  'node tests/ash-a11-capsule-recompilation.test.mjs',
  'TD613_ASH_STAGES: A7,A8,A9,A10,A11'
]) assert.ok(workflow.includes(marker), `A11 workflow missing ${marker}`);

for (const marker of ['Capsule, Save Point, and Destination-Handoff Recompilation','Eight custody questions','Save Point recompilation','Destination handoff relation','Cache and deployment posture','human closure required: true']) {
  assert.ok(receipt.includes(marker), `A11 receipt missing ${marker}`);
}

assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a11-capsule-contract/v0.1',
  custody_questions:8,
  native_capsule_preserved:true,
  native_save_point_preserved:true,
  destination_handoff_separate:true,
  save_points_as_continuity_snapshots:true,
  preparation_collapsed_into_crossing:false,
  automatic_save:false,
  automatic_export:false,
  automatic_import:false,
  automatic_handoff:false,
  raw_content_transport:false,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  vercel_gate:'CLOSED'
}, null, 2));
