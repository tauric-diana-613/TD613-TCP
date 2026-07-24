import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const releaseWorkflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const consolidatedWorkflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const browserProbe = fs.readFileSync('scripts/flowcore-runtime-browser-probe.mjs', 'utf8');
const contentProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
const stationEngine = fs.readFileSync('app/engine/flowcore-station-propagation.js', 'utf8');
const workflowDirectory = fs.readdirSync('.github/workflows');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

test('Flow-Core cross-browser evidence lives in one explicit exact-head dispatch', () => {
  assert.match(consolidatedWorkflow, /mode:\s*[\s\S]*full-browser/);
  assert.match(consolidatedWorkflow, /if: github\.event_name == 'workflow_dispatch' && inputs\.mode == 'full-browser'/);
  assert.match(consolidatedWorkflow, /playwright install --with-deps chromium firefox webkit/);
  assert.match(consolidatedWorkflow, /flowcore-runtime-browser-probe\.mjs/);
  assert.match(consolidatedWorkflow, /TD613_BROWSERS: chromium,firefox,webkit/);
  assert.match(consolidatedWorkflow, /TD613_PRODUCTION_OBSERVATION: 'false'/);
  assert.match(consolidatedWorkflow, /td613-exact-head-browser-receipts/);
  assert.doesNotMatch(consolidatedWorkflow, /if: github\.event_name == 'pull_request' \|\|/);
  assert.equal(workflowDirectory.includes('flowcore-production-observation.yml'), false,
    'Flow-Core production observation must not regain an independent workflow.');
  assert.equal(workflowDirectory.some(name => /repair-once|one-use|receipt-diagnostic/i.test(name)), false);
});

test('production release verifies source and bounded live consequence without replaying the matrix', () => {
  assert.match(releaseWorkflow, /^\s{2}issue_comment:\s*$/m);
  assert.doesNotMatch(releaseWorkflow, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
  assert.match(releaseWorkflow, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
  assert.match(releaseWorkflow, /source_packet_commit = \$\{\{ steps\.authorize\.outputs\.selected_sha \}\}/);
  assert.match(releaseWorkflow, /TD613_CANONICAL_PRODUCTION_URL: https:\/\/td613\.com/);
  assert.match(releaseWorkflow, /flowcore-release-content-probe\.mjs/);
  assert.match(releaseWorkflow, /playwright install --with-deps chromium/);
  assert.match(releaseWorkflow, /ash-a13-demo-registry-browser-probe\.mjs/);
  assert.match(releaseWorkflow, /ash-lifecycle-production-probe\.mjs/);
  assert.match(releaseWorkflow, /premerge_chromium_firefox_webkit = REQUIRED_AND_PASSED_BEFORE_MERGE/);
  assert.doesNotMatch(releaseWorkflow, /flowcore-runtime-browser-probe\.mjs/);
  assert.doesNotMatch(releaseWorkflow, /TD613_BROWSERS: chromium,firefox,webkit/);
});

test('production probes preserve empirical and promotion separation', () => {
  assert.match(browserProbe, /counts_as_human_evidence:\s*false/);
  assert.match(browserProbe, /authorizes_public_route_promotion:\s*false/);
  assert.match(browserProbe, /closes_program:\s*false/);
  assert.match(contentProbe, /counts_as_human_evidence:\s*false/);
  assert.match(contentProbe, /authorizes_public_route_promotion:\s*false/);
  assert.match(contentProbe, /closes_program:\s*false/);
});

test('exact-source observation follows executable assets rather than navigation destinations', () => {
  assert.match(contentProbe, /discoverRuntimeClosure/);
  assert.match(contentProbe, /referencesFor/);
  assert.match(contentProbe, /collect\(\/\\bsrc\\s\*=\\s\*/);
  assert.match(contentProbe, /<link\b/);
  assert.doesNotMatch(contentProbe, /\(\?:src\|href\)/);
  assert.match(contentProbe, /Runtime dependency closure followed a navigational HTML document/);
  assert.match(contentProbe, /navigation_links_excluded:\s*true/);
  assert.match(contentProbe, /station-propagation-observatory\.js/);
  assert.match(contentProbe, /flowcore-station-propagation\.js/);
  assert.match(contentProbe, /cross-station-propagation\.json/);
  assert.match(contentProbe, /dependency_closure_verified:\s*true/);
  assert.match(contentProbe, /local\.length < 20/);
});

test('exact static Vercel rewrites compare against their declared local destination', () => {
  const ashRewrite = vercel.rewrites.find(item => item.source === '/dome-world/ash-custody.html');
  assert.equal(ashRewrite?.destination, '/app/dome-world/ash-custody-v08.html');
  assert.match(contentProbe, /function exactStaticRewrite/);
  assert.match(contentProbe, /vercelConfig\.rewrites/);
  assert.match(contentProbe, /expected_local_path/);
  assert.match(contentProbe, /declared_static_rewrites_resolved:\s*true/);
  assert.match(contentProbe, /after declared rewrite to/);
});

test('independent station packages compile concurrently without changing fixture order', () => {
  assert.match(stationEngine, /const packages = await Promise\.all\(fixtures\.map\(fixture => compileStationPropagationScene\(fixture, options\)\)\);/);
  assert.doesNotMatch(stationEngine, /for \(const fixture of fixtures\) packages\.push\(await compileStationPropagationScene/);
});
