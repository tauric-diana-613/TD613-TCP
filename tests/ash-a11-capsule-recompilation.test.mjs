import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app/dome-world/ash-a11-capsule-recompilation.js', import.meta.url), 'utf8');
const premium = fs.readFileSync(new URL('../app/dome-world/ash-premium-ui.js', import.meta.url), 'utf8');
const destination = fs.readFileSync(new URL('../app/dome-world/ash-destination-handoff.js', import.meta.url), 'utf8');
const probe = fs.readFileSync(new URL('../scripts/ash-a7-a11-browser-probe.mjs', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/td613-ci.yml', import.meta.url), 'utf8');
const receipt = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A11_IMPLEMENTATION_RECEIPT_V0_1.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const RELEASE_EPOCH = '20260724-a12-release-v1';

for (const marker of [
  'What is preserved','What remains outside','Who may open it','What closes it','Where it may go','Which receipt follows it',
  'How it may return','What sealing does not prove','Save Points · continuity snapshots',
  'A Save Point preserves a return address; it does not rewind the present','Destination handoff · separate authority',
  'Preparation belongs in Capsule; actual handoff remains outside the seal',
  'Preservation, sealing, transport preparation, crossing, receipt, return, and closure remain distinct',
  'Native owners retain every consequential action.'
]) assert.ok(source.includes(marker), `A11 source missing ${marker}`);
for (const question of ['What is preserved','What remains outside','Who may open it','What closes it','Where it may go','Which receipt follows it','How it may return','What sealing does not prove']) assert.ok(source.includes(`question:'${question}'`));
for (const token of ['const CAPSULE_QUESTIONS = Object.freeze','function continuityPosture(snapshot)','function ensureCapsuleRoot()','ashA11CapsuleRecompilation','function focusNativeCapsule()','data-route-workspace="save"','href="/app/dome-world/ash-destination-handoff.html"',"stage:'A11'",'actual_destination_handoff_separate:true','automatic_save:false','automatic_export:false','automatic_import:false','automatic_handoff:false','authority_changed:false','source_bytes_moved:false','human_closure_required:true']) assert.ok(source.includes(token), `A11 source missing ${token}`);
for (const pattern of [/indexedDB\.(?:open|deleteDatabase)/,/localStorage\.(?:setItem|removeItem|clear)/,/sessionStorage\.(?:setItem|removeItem|clear)/,/fetch\s*\(/,/XMLHttpRequest/,/new\s+(?:Worker|SharedWorker)/,/\.click\(\)/,/\.prepare\s*\(/,/\.send\s*\(/,/compileDestinationHandoff/,/makeSave/,/exportCapsule/,/importCapsule/]) assert.doesNotMatch(source, pattern);
for (const marker of ['premiumCapsuleBody','premiumSealSave','premiumExportCapsule','premiumImportCapsule','premiumInspectSave','makeSave','exportCapsule','importCapsule']) assert.ok(premium.includes(marker));
for (const marker of ['compileDestinationHandoffPlan','compileDestinationHandoffAuthorization','compileDestinationHandoffAttempt','compileDestinationHandoffRecipientReceipt','compileDestinationHandoffCustodyAccounting','replayDestinationHandoff','AUTHORIZE_EXACT_DESTINATION_HANDOFF']) assert.ok(destination.includes(marker));
assert.match(core, /td613\.ash\.a7-a11-recompiler-core\/v0\.3/);
assert.match(core, new RegExp(`ash-a11-capsule-recompilation\\.js\\?v=${RELEASE_EPOCH}`));
for (const token of ['__td613AshA11ModulePromise','td613:ash:a11-load-held','__td613AshA11WorkspaceOwner','await loadA11Module()','UX_WORKSPACE_OPENED','native_capsule_preserved:true','save_point_owner_preserved:true','destination_handoff_separate:true','automatic_handoff:false']) assert.ok(core.includes(token));
assert.doesNotMatch(core, /MutationObserver|setInterval|ash_epoch/);
assert.match(probe, /if \(stage === 'A11'\)/);
assert.match(probe, /#ashA11CapsuleRecompilation/);
for (const marker of ['What is preserved','What remains outside','Who may open it','What closes it','Where it may go','What sealing does not prove','Destination handoff']) assert.ok(probe.includes(`'${marker}'`));
for (const marker of ['node tests/ash-a11-capsule-recompilation.test.mjs','TD613_ASH_STAGES=\'A7,A8,A9,A10,A11\'','scripts/ash-a7-a11-browser-probe.mjs','One-install Chromium Firefox WebKit witness']) assert.ok(workflow.includes(marker), `Consolidated A11 witness missing ${marker}`);
for (const marker of ['Capsule, Save Point, and Destination-Handoff Recompilation','Eight custody questions','Save Point recompilation','Destination handoff relation','Cache and deployment posture','human closure required: true']) assert.ok(receipt.includes(marker));
assert.equal(vercel.git?.deploymentEnabled, false);
console.log(JSON.stringify({ok:true,schema:'td613.ash.a11-capsule-contract/v0.1',custody_questions:8,destination_handoff_separate:true,automatic_save:false,automatic_export:false,automatic_import:false,automatic_handoff:false,raw_content_transport:false,authority_changed:false,source_bytes_moved:false,human_closure_required:true,vercel_gate:'CLOSED'}, null, 2));
