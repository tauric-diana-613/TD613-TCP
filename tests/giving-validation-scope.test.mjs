import assert from 'node:assert/strict';
import { classifyValidationScope } from '../scripts/classify-validation-scope.mjs';

assert.equal(classifyValidationScope([
  'app/giving/history/giving-app.js',
  'server/giving/campaign-deputy-giving-history.js',
  'tests/giving-campaign-deputy-import.test.mjs',
  'tests/giving-client-preview-server.mjs',
  '.github/workflows/td613-ci.yml',
  '.github/workflows/vercel-operator-release.yml',
  'docs/STRATEGIC_VERCEL_DEPLOYMENT_LAW.md',
  'tests/vercel-operator-release-gate.test.mjs',
  'tests/workflow-estate.test.mjs',
  'package.json'
]).scope, 'giving');

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
assert.equal(classifyValidationScope([]).scope, 'full', 'an empty diff fails closed to full validation');

console.log('giving-validation-scope.test.mjs passed');
