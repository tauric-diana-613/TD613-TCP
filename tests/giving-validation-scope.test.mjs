import assert from 'node:assert/strict';
import { classifyValidationScope } from '../scripts/classify-validation-scope.mjs';

assert.equal(classifyValidationScope([
  'app/giving/history/giving-app.js',
  'server/giving/campaign-deputy-giving-history.js',
  'tests/giving-campaign-deputy-import.test.mjs',
  'scripts/giving-production-readiness.mjs',
  'tests/giving-production-readiness.test.mjs',
  'tests/giving-client-preview-server.mjs',
  'docs/GIVING_HISTORY_ENGINE.md',
  'docs/CAMPAIGN_DEPUTY_GIVING_HISTORY_RELEASE_ENVELOPE.md',
  'vercel.json',
  '.github/workflows/td613-ci.yml',
  '.github/workflows/vercel-operator-release.yml',
  '.github/workflows/vercel-relock-safety.yml',
  'docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md',
  'tests/release-plumbing.test.mjs',
  'tests/vercel-operator-release-gate.test.mjs',
  'tests/workflow-estate.test.mjs',
  'package.json'
]).scope, 'giving', 'release/relock plumbing remains scope-neutral when a Giving release envelope is the product-scoped change');

assert.equal(classifyValidationScope([
  'app/giving/history/giving-ux-resilience-shell.js',
  'app/engine/pedagogue-design-gate.js',
  'app/engine/aia-cistern-law.js',
  'docs/PEDAGOGUE_DESIGN_GATE.md',
  'scripts/run-pedagogue-design-gate.mjs',
  'tests/fixtures/pedagogue/giving-vault-design.json',
  'tests/fixtures/pedagogue/giving-research-dossier-design.json',
  'tests/fixtures/pedagogue/cistern-boundary-design.json',
  'tests/giving-ux-resilience.test.mjs',
  'tests/pedagogue-design-gate.test.mjs',
  'tests/giving-vercel-route.test.mjs'
]).scope, 'giving', 'narrow additive Giving design/security witnesses must stay inside the Giving release lane');

const twelveStepPedagogueAudit = classifyValidationScope([
  'app/giving/history/giving-12-step-bundle.js',
  'app/engine/pedagogue-interface-diagnosis.js',
  'tests/fixtures/pedagogue/giving-12-step-evidence-workflow.json',
  'docs/pedagogue/GIVING_12_STEP_REPO_TRANSFER_AUDIT.md',
  'tests/giving-post640-polish.test.mjs'
]);
assert.equal(twelveStepPedagogueAudit.scope, 'giving', 'inert Pedagogue audit artifacts and the shared diagnosis helper must not widen an executable Giving change to the full browser estate');
assert.deepEqual(twelveStepPedagogueAudit.full_scope_files, []);
assert.equal(twelveStepPedagogueAudit.practice_fixture_changed, false, 'interface-diagnosis specimens do not mutate the canonical practice fixture');

const practiceOnly = classifyValidationScope([
  'app/engine/pedagogue-practice-fixture.js',
  'app/engine/flowcore-observation-aperture.js',
  'docs/CANONICAL_PRACTICE_FIXTURE.md',
  'AGENTS.md',
  'PEDAGOGUE.md',
  'app/dome-world/docs/ash/experiments/tomography/ASH_KEEP_LOOM_TOMOGRAPHY_CALIBRATION_PHANTOM_V0_1.md',
  'tests/fixtures/pedagogue/giving-bikini-bottom-practice.json',
  'tests/fixtures/pedagogue/giving-discovery-handoff-design.json',
  'tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json',
  'tests/flowcore-observation-aperture.test.mjs',
  'scripts/giving-practice-fixture-browser-assay.mjs',
  'scripts/giving-browser-probe.mjs',
  'scripts/giving-release-content-probe.mjs',
  'scripts/giving-production-readiness.mjs',
  'scripts/flowcore-release-content-probe.mjs',
  'scripts/run-pedagogue-design-gate.mjs',
  'scripts/configure-git-hooks.mjs',
  'tests/pedagogue-practice-fixture.test.mjs',
  'tests/pedagogue-design-gate.test.mjs',
  'tests/giving-release-content-probe.test.mjs',
  'tests/giving-vercel-settlement.test.mjs',
  'tests/giving-post640-polish.test.mjs',
  'docs/PEDAGOGUE_DESIGN_GATE.md',
  '.github/workflows/td613-ci.yml',
  '.github/workflows/vercel-relock-safety.yml',
  'scripts/classify-validation-scope.mjs',
  'tests/giving-validation-scope.test.mjs'
]);
assert.equal(practiceOnly.scope, 'practice');
assert.equal(practiceOnly.practice_fixture_changed, true);
assert.ok(practiceOnly.practice_file_count >= 4, 'practice lane should explicitly include the shared aperture helper and its two cross-system fixture witnesses');
assert.deepEqual(practiceOnly.full_scope_files, []);

const ciInstallerOnly = classifyValidationScope([
  'app/engine/pedagogue-practice-fixture.js',
  'scripts/configure-git-hooks.mjs'
]);
assert.equal(ciInstallerOnly.scope, 'practice', 'runner-local Giving browser install hardening must remain scope-neutral beside a practice change');
assert.deepEqual(ciInstallerOnly.full_scope_files, []);

const observationApertureOnly = classifyValidationScope([
  'app/engine/flowcore-observation-aperture.js',
  'tests/flowcore-observation-aperture.test.mjs'
]);
assert.equal(observationApertureOnly.scope, 'practice', 'the additive qualified-absence helper uses bounded practice qualification rather than full inherited Ash runtime');
assert.deepEqual(observationApertureOnly.full_scope_files, []);

const releaseSmokeOnly = classifyValidationScope(['tests/pedagogue-practice-fixture.test.mjs']);
assert.equal(releaseSmokeOnly.scope, 'practice', 'the first-class practice release smoke contract must preserve practice release classification');
assert.equal(releaseSmokeOnly.practice_fixture_changed, true);
assert.deepEqual(releaseSmokeOnly.full_scope_files, []);

const relockWithPractice = classifyValidationScope([
  'scripts/giving-practice-fixture-browser-assay.mjs',
  '.github/workflows/vercel-relock-safety.yml',
  'tests/release-plumbing.test.mjs'
]);
assert.equal(relockWithPractice.scope, 'practice', 'zero-deploy relock/confirmation plumbing must not widen a practice witness repair to full-product validation');
assert.deepEqual(relockWithPractice.full_scope_files, []);

const mixedPracticeAndAsh = classifyValidationScope([
  'app/engine/pedagogue-practice-fixture.js',
  'app/dome-world/ash-demo-entry-convergence.js'
]);
assert.equal(mixedPracticeAndAsh.scope, 'full', 'practice + live Ash runtime must widen to full browser qualification');
assert.equal(mixedPracticeAndAsh.practice_fixture_changed, true);
assert.deepEqual(mixedPracticeAndAsh.full_scope_files, ['app/dome-world/ash-demo-entry-convergence.js']);

for (const unsafePath of [
  'app/dome-world/ash-keep.js',
  'scripts/ash-a12-browser-probe.mjs',
  'tests/ash-a14-archive-accession.test.mjs',
  'packages/dome_world_exact/engine.py',
  'app/engine/stylometry.js',
  'README.md'
]) {
  const result = classifyValidationScope(['app/giving/history/giving-app.js', unsafePath]);
  assert.equal(result.scope, 'full', `${unsafePath} must require the full product witness`);
  assert.deepEqual(result.full_scope_files, [unsafePath]);
}

assert.equal(classifyValidationScope(['.github/workflows/td613-ci.yml']).scope, 'full', 'workflow-only changes cannot self-select the Giving or practice lane');
assert.equal(classifyValidationScope(['.github/workflows/vercel-relock-safety.yml']).scope, 'full', 'scope-neutral relock workflow alone still fails closed rather than self-selecting a product lane');
assert.equal(classifyValidationScope(['tests/release-plumbing.test.mjs']).scope, 'full', 'scope-neutral release plumbing alone still fails closed rather than self-selecting a product lane');
assert.equal(classifyValidationScope(['app/engine/pedagogue-design-gate.js']).scope, 'full', 'pre-existing shared design helpers alone cannot self-select the practice lane');
assert.equal(classifyValidationScope([]).scope, 'full', 'an empty diff fails closed to full validation');

console.log('giving-validation-scope.test.mjs passed');

// These imported contracts are intentionally chained through this existing CI/release
// membrane so additive Giving design/security witnesses do not create a fifth workflow.
await import('./giving-vercel-route.test.mjs');
await import('./giving-ux-resilience.test.mjs');
await import('./giving-release-content-probe.test.mjs');
await import('./giving-vercel-settlement.test.mjs');
await import('./giving-vercel-release-receipt.test.mjs');
await import('./flowcore-observation-aperture.test.mjs');
await import('./pedagogue-design-gate.test.mjs');