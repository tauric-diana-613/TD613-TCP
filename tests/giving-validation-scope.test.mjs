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
  'vercel.json',
  '.github/workflows/td613-ci.yml',
  '.github/workflows/vercel-operator-release.yml',
  'docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md',
  'tests/vercel-operator-release-gate.test.mjs',
  'tests/workflow-estate.test.mjs',
  'package.json'
]).scope, 'giving');

assert.equal(classifyValidationScope([
  'app/giving/history/giving-ux-resilience-shell.js',
  'app/engine/pedagogue-design-gate.js',
  'app/engine/aia-cistern-law.js',
  'docs/PEDAGOGUE_DESIGN_GATE.md',
  'scripts/run-pedagogue-design-gate.mjs',
  'tests/fixtures/pedagogue/giving-vault-design.json',
  'tests/fixtures/pedagogue/giving-research-dossier-design.json',
  'tests/giving-ux-resilience.test.mjs',
  'tests/pedagogue-design-gate.test.mjs',
  'tests/giving-vercel-route.test.mjs'
]).scope, 'giving', 'narrow additive Giving design/security witnesses must stay inside the Giving release lane');

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

assert.equal(classifyValidationScope(['.github/workflows/td613-ci.yml']).scope, 'full', 'workflow-only changes cannot self-select the Giving lane');
assert.equal(classifyValidationScope(['app/engine/pedagogue-design-gate.js']).scope, 'full', 'shared design helpers alone cannot self-select the Giving lane');
assert.equal(classifyValidationScope([]).scope, 'full', 'an empty diff fails closed to full validation');

console.log('giving-validation-scope.test.mjs passed');

// These imported contracts are intentionally chained through this existing CI/release
// membrane so additive Giving design/security witnesses do not create a fifth workflow.
await import('./giving-vercel-route.test.mjs');
await import('./giving-ux-resilience.test.mjs');
await import('./pedagogue-design-gate.test.mjs');