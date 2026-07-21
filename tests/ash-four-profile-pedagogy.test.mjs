import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const modulePath = path.join(root, 'app/dome-world/ash-demo-pedagogy-rehydration.js');
const wrapperPath = path.join(root, 'app/dome-world/ash-profile-demo-hydration.js');
const moduleSource = fs.readFileSync(modulePath, 'utf8');
const wrapperSource = fs.readFileSync(wrapperPath, 'utf8');
const { ASH_DEMO_PEDAGOGY_VERSION, ASH_DEMO_PEDAGOGY_MANIFESTS } = await import(pathToFileURL(modulePath));

assert.equal(ASH_DEMO_PEDAGOGY_VERSION, 'td613.ash.demo-pedagogy/v0.1-four-profile-rehydration');
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
assert.match(moduleSource, /providerApproval/);
assert.match(moduleSource, /approveRelease/);
assert.match(moduleSource, /capsulePassphrase/);
assert.doesNotMatch(moduleSource, /transport_authorized:\s*true|child_study_authorized:\s*true|automatic_ash_action:\s*true/);
assert.match(wrapperSource, /ash-demo-pedagogy-rehydration\.js\?v=20260721-legal-demo-ux-v1/);

console.log('ash-four-profile-pedagogy.test.mjs passed');
