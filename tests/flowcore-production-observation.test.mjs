import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const browserProbe = fs.readFileSync('scripts/flowcore-runtime-browser-probe.mjs', 'utf8');
const contentProbe = fs.readFileSync('scripts/flowcore-release-content-probe.mjs', 'utf8');
const stationEngine = fs.readFileSync('app/engine/flowcore-station-propagation.js', 'utf8');
const workflowDirectory = fs.readdirSync('.github/workflows');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

test('Flow-Core production observation is retained inside the one explicit release conduit', () => {
  assert.match(workflow, /^\s{2}issue_comment:\s*$/m);
  assert.doesNotMatch(workflow, /^\s{2}(push|pull_request|workflow_dispatch):\s*$/m);
  assert.match(workflow, /startsWith\(github\.event\.comment\.body, '\/td613-vercel-release '\)/);
  assert.match(workflow, /source_packet_commit = \$\{\{ steps\.authorize\.outputs\.selected_sha \}\}/);
  assert.match(workflow, /TD613_CANONICAL_PRODUCTION_URL: https:\/\/td613\.com/);
  assert.match(workflow, /flowcore-release-content-probe\.mjs/);
  assert.match(workflow, /flowcore-runtime-browser-probe\.mjs/);
  assert.match(workflow, /TD613_BROWSERS: chromium,firefox,webkit/);
  assert.match(workflow, /TD613_PRODUCTION_OBSERVATION: 'true'/);
  assert.match(workflow, /flowcore-and-ash-aia3-production-release-evidence/);
  assert.equal(workflowDirectory.includes('flowcore-production-observation.yml'), false,
    'Flow-Core production observation must not regain an independent commit-triggered workflow.');
  assert.equal(workflowDirectory.some(name => /repair-once|one-use|receipt-diagnostic/i.test(name)), false);
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
  assert.match(contentProbe, /\\bsrc\\s\*=/);
  assert.match(contentProbe, /<link\\b/);
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
