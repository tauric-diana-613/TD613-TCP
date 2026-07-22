import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const modulePath = path.join(root, 'app/dome-world/ash-demo-pedagogy-rehydration.js');
const entryPath = path.join(root, 'app/dome-world/ash-demo-entry-convergence.js');
const routebarPath = path.join(root, 'app/dome-world/ash-demo-pedagogy-routebar.js');
const wrapperPath = path.join(root, 'app/dome-world/ash-profile-demo-hydration.js');
const premiumReadinessPath = path.join(root, 'app/dome-world/ash-premium-readiness-bridge.js');
const compositionCompatibilityPath = path.join(root, 'app/dome-world/ash-composition-receipt-compatibility.js');
const workspaceBridgePath = path.join(root, 'app/dome-world/ash-workspace-bridge.js');
const moduleSource = fs.readFileSync(modulePath, 'utf8');
const entrySource = fs.readFileSync(entryPath, 'utf8');
const routebarSource = fs.readFileSync(routebarPath, 'utf8');
const wrapperSource = fs.readFileSync(wrapperPath, 'utf8');
const premiumReadinessSource = fs.readFileSync(premiumReadinessPath, 'utf8');
const compositionCompatibilitySource = fs.readFileSync(compositionCompatibilityPath, 'utf8');
const workspaceBridgeSource = fs.readFileSync(workspaceBridgePath, 'utf8');
const { ASH_DEMO_PEDAGOGY_VERSION, ASH_DEMO_PEDAGOGY_MANIFESTS } = await import(pathToFileURL(modulePath));

assert.equal(ASH_DEMO_PEDAGOGY_VERSION, 'td613.ash.demo-pedagogy/v0.2-event-driven-idle-stable');
assert.deepEqual(Object.keys(ASH_DEMO_PEDAGOGY_MANIFESTS).sort(), ['fundraiser','investigation','political_campaign','research']);

const expected = {
  investigation:['Preserve source','Map contradictions','Test alternatives','Human-review finding'],
  political_campaign:['Confirm mandate','Split public and private','Route launch work','Human-review claim'],
  fundraiser:['State the gap','Protect relationship joins','Route asks + stewardship','Human-review ask'],
  research:['Frame the question','Inspect method + provenance','Test + reproduce','Human-review publication']
};

const taskSignatures = new Set();
for (const [profile, manifest] of Object.entries(ASH_DEMO_PEDAGOGY_MANIFESTS)) {
  assert.equal(manifest.profile, profile);
  assert.equal(manifest.task_spine.length, 4, `${profile} needs four child-legible steps.`);
  assert.deepEqual(manifest.task_spine.map(item => item.label), expected[profile]);
  assert.equal(new Set(manifest.task_spine.map(item => item.workspace)).size, 4, `${profile} must exercise four distinct workspaces.`);
  assert(manifest.active_workspaces.includes(manifest.entry_workspace));
  assert.match(manifest.stress_question, /\?$/);
  assert(manifest.keep_quiet.length > 60);
  assert(manifest.claim_ceiling.length > 25);
  for (const destination of ['home','map','work','choir','capsule']) assert(manifest.destination_copy[destination]);
  taskSignatures.add(manifest.task_spine.map(item => `${item.label}:${item.workspace}`).join('|'));
}
assert.equal(taskSignatures.size, 4, 'The four profiles must not collapse into recolored copies.');

assert.match(moduleSource, /Hydration ledger · what should work, wait, stay quiet, or remain separate/);
assert.match(moduleSource, /GESTURE_READY/);
assert.match(moduleSource, /LIFECYCLE_HELD/);
assert.match(moduleSource, /INTENTIONALLY_DORMANT/);
assert.match(moduleSource, /SEPARATE_BOUNDARY/);
assert.match(moduleSource, /td613:ash:demo-pedagogy-hydrated/);
assert.match(moduleSource, /data-demo-pedagogy-workspace/);
assert.match(moduleSource, /updateMotionLabels/);
assert.match(moduleSource, /decorateDestinations/);
assert.match(moduleSource, /renderSignature/);
assert.match(moduleSource, /lastRenderSignature/);
assert.match(moduleSource, /premium-ready/);
assert.doesNotMatch(moduleSource, /new MutationObserver/);
assert.match(moduleSource, /if \('checked' in node\) return node\.checked \? 'DRIFT' : 'DORMANT_OK'/);
assert.match(moduleSource, /node\.tagName === 'A' \? 'SEPARATE' : 'DRIFT'/);
assert.match(moduleSource, /providerApproval/);
assert.match(moduleSource, /approveRelease/);
assert.match(moduleSource, /capsulePassphrase/);
assert.doesNotMatch(moduleSource, /transport_authorized:\s*true|child_study_authorized:\s*true|automatic_ash_action:\s*true/);
assert.match(wrapperSource, /ash-demo-pedagogy-rehydration\.js\?v=20260721-legal-demo-ux-v1/);

assert.match(entrySource, /td613\.ash\.demo-entry-convergence\/v0\.5-premium-instrument-visible-release/);
assert.match(entrySource, /data-ash-demo-entry-hydrating/);
assert.match(entrySource, /function structuralReady/);
assert.match(entrySource, /function visibleReady/);
assert.match(entrySource, /premiumContextBar/);
assert.match(entrySource, /premiumPrimaryDock/);
assert.match(entrySource, /dataset\.ashPremiumReady === 'true'/);
assert.doesNotMatch(entrySource, /body > \.workspace-rail/);
assert.match(entrySource, /phase === 'STRUCTURAL'/);
assert.match(entrySource, /phase === 'VISIBLE'/);
assert.match(entrySource, /nextStable >= 2/);
assert.match(entrySource, /delete doc\.documentElement\.dataset\.ashDemoEntryHydrating/);
assert.match(entrySource, /publish\(caseId, profile, workspace, 'REVEALING', 'VISIBLE', 0\)/);
assert.match(entrySource, /td613:ash:demo-entry-ready/);
assert.match(entrySource, /WORKSPACE_NOT_VISIBLE/);
assert.match(entrySource, /wrongWorkspace/);
assert.match(entrySource, /if \(wrongWorkspace\) openWorkspace\(workspace\)/);
assert.match(entrySource, /currentCaseId/);
assert.match(entrySource, /state\.case_id === caseId/);
assert.match(entrySource, /\['OPENING','REVEALING','READY'\]\.includes\(state\.posture\)/);
assert.match(entrySource, /dataset\.ashDemoEntryCase = caseId/);
assert.match(entrySource, /boxReady\(main, \{ opacity:true, pointer:true \}\)/);
assert.match(entrySource, /boxReady\(context, \{ opacity:true, pointer:true \}\)/);
assert.match(entrySource, /boxReady\(dock, \{ opacity:true, pointer:true \}\)/);
assert.doesNotMatch(entrySource, /if \(!ready\) openWorkspace\(workspace\)/);
assert.doesNotMatch(entrySource, /new MutationObserver/);

assert.match(routebarSource, /td613\.ash\.demo-pedagogy-routebar\/v0\.2-event-driven-persistent-route/);
assert.match(routebarSource, /premiumContextBar/);
assert.match(routebarSource, /ashDemoPedagogyRouteBar/);
assert.match(routebarSource, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(routebarSource, /@media\(max-width:620px\)[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(routebarSource, /data-demo-pedagogy-workspace/);
assert.match(routebarSource, /aria-current/);
assert.match(routebarSource, /premium-ready/);
assert.match(routebarSource, /demo-entry-ready/);
assert.match(routebarSource, /demo-pedagogy-hydrated/);
assert.match(routebarSource, /ux-workspace-opened/);
assert.match(routebarSource, /lastSignature/);
assert.doesNotMatch(routebarSource, /setTimeout\(render, 60\)/);
assert.doesNotMatch(routebarSource, /new MutationObserver/);

assert.match(premiumReadinessSource, /td613\.ash\.premium-readiness\/v0\.1-exact-instrument-graph/);
for (const marker of ['premiumPrimaryDock','premiumContextBar','workspace-home','workspace-work']) assert.match(premiumReadinessSource, new RegExp(marker));
assert.match(premiumReadinessSource, /dataset\.ashPremiumReady = String\(state\.ready\)/);
assert.match(premiumReadinessSource, /td613:ash:premium-ready/);
assert.match(premiumReadinessSource, /api && dock && context && home && work/);
assert.match(compositionCompatibilitySource, /td613\.ash\.composition-receipt-compatibility\/v0\.1-capability-alias/);
assert.match(compositionCompatibilitySource, /stable-navigation-motion/);
assert.match(compositionCompatibilitySource, /td613:ash:composition-stable/);
assert.match(compositionCompatibilitySource, /dataset\.ashCompositionRelease/);
assert.match(workspaceBridgeSource, /ash-premium-ui\.js\?v=20260721-legal-demo-ux-v1[\s\S]*ash-premium-readiness-bridge\.js\?v=20260721-legal-demo-ux-v1[\s\S]*ash-ui-ux-rescue\.js\?v=20260721-legal-demo-ux-v1[\s\S]*ash-composition-receipt-compatibility\.js\?v=20260721-legal-demo-ux-v1[\s\S]*ash-demo-entry-convergence\.js\?v=20260721-legal-demo-ux-v1[\s\S]*ash-demo-pedagogy-routebar\.js\?v=20260721-legal-demo-ux-v1/);
assert.doesNotMatch(workspaceBridgeSource, /ash-demo-pedagogy-persistence/);
assert.equal(fs.existsSync(path.join(root, 'app/dome-world/ash-demo-pedagogy-persistence.js')), false, 'The obstructive all-workspace ledger portal must remain removed.');

console.log('ash-four-profile-pedagogy.test.mjs passed');
