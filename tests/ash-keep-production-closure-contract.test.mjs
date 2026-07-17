import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const probe = read('scripts/ash-keep-production-probe.mjs');
const runner = read('scripts/run-ash-keep-production-probe.mjs');
const lifecycleRunner = read('scripts/ash-lifecycle-production-probe.mjs');
const lifecycleBase = read('scripts/ash-lifecycle-production-probe-base.mjs');
const convergenceProbe = read('scripts/ash-constitutional-convergence-probe.mjs');
const convergenceRunner = read('scripts/run-ash-constitutional-convergence-probe.mjs');
const lifecycleProbe = `${lifecycleRunner}\n${lifecycleBase}`;
const publisher = read('scripts/publish-ash-keep-observer-status.mjs');
const postureVerifier = read('scripts/assert-ash-keep-release-posture.mjs');
const receipt = read('app/dome-world/docs/ASH_KEEP_V1_PRODUCTION_DEMO_RECEIPT.md');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const release = JSON.parse(read('app/aperture/release.json'));
const premium = read('app/dome-world/ash-premium-ui.js');
const premiumCss = read('app/dome-world/ash-premium-ui.css');
const premiumCompatibility = read('app/dome-world/ash-premium-compatibility.js');
const premiumFlight = read('scripts/ash-premium-ui-browser-probe.mjs');

for (const token of [
  'td613.ash-keep.production-closure-observation/v0.1', 'promotion_authorized: false', "const DB_NAME = 'td613-ash-keep'",
  'indexeddb_record_count', 'recipient_transport_requests', 'case_map_digest', 'WHAT_ACTUALLY_LEFT', 'REPLAY_VERIFIED',
  'wrong_passphrase_hold', 'tamper_hold', 'mobile_portrait', 'mobile_landscape', 'evidence-manifest.json'
]) assert.ok(probe.includes(token), `Core production probe omitted ${token}`);
assert.match(probe, /real_surveillance_probability === null/);
assert.match(probe, /automatic_hold === false/);
assert.match(probe, /transmission_performed === false/);
assert.doesNotMatch(probe, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

for (const token of [
  'td613.ash-keep.production-probe-fixture-manifest/v0.1', 'SYNTHETIC_OPERATOR_SELECTED_EXCERPT',
  'runtime_copy_ephemeral: true', 'CLASSIFY_INTENTIONAL_HORIZONTAL_SCROLL_LANES_SEPARATELY_FROM_CLIPPING', 'promotion_authorized: false'
]) assert.ok(runner.includes(token), `Core fixture runner omitted ${token}`);

for (const token of [
  'ash-constitutional-convergence-probe.runtime.mjs', 'expected one case-selection seam',
  "select.dispatchEvent(new Event('change', { bubbles: true }))", 'remove?.disabled !== false'
]) assert.ok(convergenceRunner.includes(token), `Convergence runner omitted ${token}`);
assert.match(convergenceRunner, /pathToFileURL/);

for (const token of [
  "new Set(['pending', 'success', 'failure', 'error'])", "required('GITHUB_TOKEN')", "required('TD613_OBSERVED_COMMIT')",
  'TD613_OBSERVER_STATUS_RECEIPT_PATH', 'status_id: result.id', 'receipt_sha256', 'promotion_authorized: false',
  'Ash Choir Calibration Validation'
]) assert.ok(publisher.includes(token), `Observer publisher omitted ${token}`);
assert.doesNotMatch(publisher, /release\.json|productionStatus|IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

for (const token of [
  'td613.ash-keep.release-posture-verification/v0.1',
  "ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED' && ash.productionStatus === 'PRODUCTION_DEMONSTRATED'",
  'ash.transport === false', 'ash.automaticCinder === false', 'posture_preserved: true', 'promotion_authorized: false'
]) assert.ok(postureVerifier.includes(token), `Posture verifier omitted ${token}`);

const productionPosture = release.ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED'
  && release.ash.productionStatus === 'PRODUCTION_DEMONSTRATED'
  && receipt.includes('Operator closure: `PRODUCTION_DEMONSTRATED`');
assert.equal(productionPosture, true, 'Ash Keep production posture is incoherent.');
assert.equal(release.ash.transport, false);
assert.equal(release.ash.automaticCinder, false);

for (const token of [
  'td613.ash.premium-ui/v0.1-command-instrument',
  "['home', 'Home'", "['map', 'Map'", "['work', 'Work'", "['choir', 'Choir'", "['capsule', 'Capsule'",
  'runDeterministicMoireAssay', 'verifyMoireRebuildAssay', 'replayMoireRebuildAssay', 'verifyMoireRebuildReplay',
  'Pairwise residue ≠ intent', 'automatic_ash_action: false', 'transport_authorized: false',
  '/safe-harbor/index.html', '/dome-world/ash-destination-handoff.html'
]) assert.ok(premium.includes(token), `Premium command instrument omitted ${token}`);
assert.match(premiumCss, /grid-template-columns:repeat\(5,1fr\)/);
assert.match(premiumCss, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(premiumCompatibility, /display:none!important/);
assert.match(premiumCompatibility, /Exact chambers/);
for (const token of [
  'td613.ash.premium-ui-browser-flight/v0.1', 'orientationMs < 10_000',
  'real_surveillance_probability', 'MOIRE_REPLAY_VERIFIED', 'horizontal_overflow',
  'clipped_controls', 'item.height >= 48', 'production_promotion_authorized: false'
]) assert.ok(premiumFlight.includes(token), `Premium browser closure omitted ${token}`);
assert.doesNotMatch(premium, /recipient_transport\s*:\s*true|automatic_ash_action\s*:\s*true/);
assert.doesNotMatch(premiumFlight, /production_promotion_authorized:\s*true|transport_authorized:\s*true|cinder_authorized:\s*true/);

const localJob = workflow.split('  local-closure-validation:')[1]?.split('  deployed-observation:')[0] || '';
const deployedJob = workflow.split('  deployed-observation:')[1] || '';
for (const token of [
  'Ash Keep Production Closure', 'workflow_dispatch', 'workflow_run', 'workflows: ["Test and deploy static app"]', 'statuses: write',
  'tests/ash-keep-production-closure-contract.test.mjs', 'tests/ash-keep-production-promotion-gate.test.mjs',
  'scripts/ash-keep-production-probe.mjs', 'scripts/run-ash-keep-production-probe.mjs',
  'scripts/run-ash-constitutional-convergence-probe.mjs', 'ash-keep-production-closure-evidence'
]) assert.ok(workflow.includes(token), `Closure workflow omitted ${token}`);
for (const token of [
  'td613.ash.constitutional-convergence-observation/v0.1', 'promotion_authorized: false',
  'APERTURE_REBUILD', 'HUSH_CANDIDATE', 'DELETE_PARTIAL_HOLD', 'DRY_AUDIT_ONLY',
  'provider_recipient_cinder_transport_requests'
]) assert.ok(convergenceProbe.includes(token), `Convergence probe omitted ${token}`);
assert.match(localJob, /Run bounded local core closure observation/);
assert.match(localJob, /run-ash-keep-production-probe\.mjs/);
assert.match(localJob, /Run constitutional convergence preview/);
assert.match(localJob, /run-ash-constitutional-convergence-probe\.mjs/);
assert.match(deployedJob, /Ash Lifecycle Deployed Observation/);
assert.match(deployedJob, /ash-lifecycle-production-probe\.mjs/);
assert.match(deployedJob, /Observe deployed constitutional convergence without promotion/);
assert.match(deployedJob, /run-ash-constitutional-convergence-probe\.mjs/);
assert.doesNotMatch(deployedJob, /run-ash-keep-production-probe\.mjs/);
assert.match(lifecycleRunner, /ash-lifecycle-production-probe-base\.mjs/);
assert.match(lifecycleRunner, /SYNTHETIC_DRAFT/);
assert.match(lifecycleProbe, /td613\.ash\.lifecycle-production-observation\/v0\.1/);
assert.match(lifecycleProbe, /draft_body_sha256/);
assert.doesNotMatch(workflow, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

console.log('ash-keep-production-closure-contract.test.mjs passed');
