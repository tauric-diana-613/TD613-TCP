import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const probe = read('scripts/ash-keep-production-probe.mjs');
const runner = read('scripts/run-ash-keep-production-probe.mjs');
const publisher = read('scripts/publish-ash-keep-observer-status.mjs');
const postureVerifier = read('scripts/assert-ash-keep-release-posture.mjs');
const receipt = read('app/dome-world/docs/ASH_KEEP_V1_PRODUCTION_DEMO_RECEIPT.md');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const release = JSON.parse(read('app/aperture/release.json'));

for (const token of [
  'td613.ash-keep.production-closure-observation/v0.1',
  'promotion_authorized: false',
  "const DB_NAME = 'td613-ash-keep'",
  'indexeddb_record_count',
  'non_read_requests',
  'recipient_transport_requests',
  'case_map_digest',
  'WHAT_ACTUALLY_LEFT',
  'REPLAY_VERIFIED',
  'stale_version_matches',
  'stale_route_matches',
  'provider_called: false',
  'wrong_passphrase_hold',
  'tamper_hold',
  'compile_and_verify_ms',
  'horizontal_overflow',
  'clipped_controls',
  'mobile_portrait',
  'mobile_landscape',
  'rotation_return',
  'reduced_motion',
  'evidence-manifest.json'
]) {
  assert.ok(probe.includes(token), `Production probe omitted required contract token: ${token}`);
}

assert.match(probe, /real_surveillance_probability === null/);
assert.match(probe, /automatic_hold === false/);
assert.match(probe, /transmission_performed === false/);
assert.match(probe, /requests\.filter\(request => request\.method !== 'GET'/);
assert.doesNotMatch(probe, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.doesNotMatch(probe, /productionStatus\s*=/);

for (const token of [
  'td613.ash-keep.production-probe-fixture-manifest/v0.1',
  'SYNTHETIC_OPERATOR_SELECTED_EXCERPT',
  'selected_excerpt_sha256',
  'source_probe_sha256',
  'runtime_probe_sha256',
  'source_mutated: false',
  'runtime_copy_ephemeral: true',
  'runtime_transformations',
  'DECLARE_SELECTED_EXCERPT_AFTER_UNKEPT_DRAFT_RELOAD',
  'CLASSIFY_INTENTIONAL_HORIZONTAL_SCROLL_LANES_SEPARATELY_FROM_CLIPPING',
  'scroll_lane_controls',
  'replaceExactlyOnce',
  'promotion_authorized: false'
]) {
  assert.ok(runner.includes(token), `Fixture runner omitted required provenance token: ${token}`);
}
assert.match(runner, /TD613_SELECTED_EXCERPT/);
assert.match(runner, /#draftBody/);
assert.match(runner, /overflowX/);
assert.match(runner, /scrollWidth > parent\.clientWidth/);
assert.doesNotMatch(runner, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

for (const token of [
  "new Set(['pending', 'success', 'failure', 'error'])",
  "const CONTEXT = 'Ash Keep Deployed Observation'",
  "required('GITHUB_TOKEN')",
  "required('TD613_OBSERVED_COMMIT')",
  "required('TD613_OBSERVER_RUN_URL')",
  'TD613_OBSERVER_STATUS_RECEIPT_PATH',
  'statuses/${sha}',
  "method: 'POST'",
  'description.length > 140',
  'td613.ash-keep.observer-status-publication/v0.2',
  'status_id: result.id',
  'receipt_sha256',
  'path.resolve(receiptPath)',
  'Observer status receipt path must remain inside artifacts/',
  'promotion_authorized: false'
]) {
  assert.ok(publisher.includes(token), `Observer status publisher omitted required token: ${token}`);
}
assert.match(publisher, /\^\[0-9a-f\]\{40\}\$/i);
assert.match(publisher, /https:\\\/\\\/github\\\.com/);
assert.doesNotMatch(publisher, /release\.json|productionStatus|IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

for (const token of [
  'td613.ash-keep.release-posture-verification/v0.1',
  "ash.status === 'IMPLEMENTATION_IN_PROGRESS' && ash.productionStatus === 'PREVIEW_PENDING'",
  "ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED' && ash.productionStatus === 'PRODUCTION_DEMONSTRATED'",
  "receiptText.includes('NOT_YET_EARNED')",
  "receiptText.includes('Operator closure: `PRODUCTION_DEMONSTRATED`')",
  'Unrecognized or incoherent Ash Keep release posture',
  'ash.transport === false',
  'ash.automaticCinder === false',
  'posture_preserved: true',
  'promotion_authorized: false',
  'TD613_RELEASE_POSTURE_RECEIPT_PATH'
]) {
  assert.ok(postureVerifier.includes(token), `Release posture verifier omitted required token: ${token}`);
}

for (const token of [
  'runtime commit SHA',
  'upstream deployment workflow-run ID',
  'deployed observer workflow-run ID',
  'evidence artifact ID',
  'evidence artifact SHA-256',
  'desktop screenshot SHA-256',
  'mobile portrait screenshot SHA-256',
  'mobile landscape screenshot SHA-256',
  'Ash Keep Deployed Observation',
  'commit status',
  'status-publication receipt',
  'promotion_authorized = false'
]) {
  assert.ok(receipt.includes(token), `Production receipt omitted required gate language: ${token}`);
}

const previewPosture = release.ash.status === 'IMPLEMENTATION_IN_PROGRESS'
  && release.ash.productionStatus === 'PREVIEW_PENDING'
  && receipt.includes('NOT_YET_EARNED')
  && receipt.includes('PROMOTION_WITHHELD');
const productionPosture = release.ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED'
  && release.ash.productionStatus === 'PRODUCTION_DEMONSTRATED'
  && !receipt.includes('NOT_YET_EARNED')
  && receipt.includes('Operator closure: `PRODUCTION_DEMONSTRATED`');
assert.equal(previewPosture || productionPosture, true, 'Ash Keep release posture is neither coherent preview nor coherent production.');
assert.equal(release.ash.version, 'v1.0-alpha');
assert.equal(release.ash.phase, 'ASH_KEEP_CASE_MAP_RUNTIME');
assert.equal(release.ash.transport, false);
assert.equal(release.ash.automaticCinder, false);

for (const token of [
  'Ash Keep Production Closure',
  'workflow_dispatch',
  'workflow_run',
  'workflows: ["Test and deploy static app"]',
  "github.event.workflow_run.conclusion == 'success'",
  "github.event.workflow_run.head_branch == 'main'",
  "github.event_name != 'workflow_run'",
  'statuses: write',
  'https://td613.com',
  'TD613_OBSERVED_COMMIT',
  'TD613_UPSTREAM_WORKFLOW_RUN_ID',
  'TD613_OBSERVER_RUN_URL',
  'TD613_OBSERVER_STATUS_CONTEXT',
  'td613.ash-keep.deployment-observer-context/v0.1',
  'observed_runtime_commit',
  'upstream_deployment_workflow_run_id',
  'observer_workflow_run_id',
  'observer_run_url',
  'observer_status_context',
  'source_status: \'DEPLOYED_OBSERVATION\'',
  'TD613_OBSERVER_STATUS_RECEIPT_PATH',
  'observer-status-pending.json',
  'observer-status-success.json',
  'observer-status-failure.json',
  'release-posture-verification.json',
  'Verify checked-out release posture',
  'Preserve deployed observation and status receipts',
  'Reconcile terminal failure status',
  'TD613_RELEASE_POSTURE_RECEIPT_PATH',
  'Publish observer pending status',
  'Publish observer success status',
  'Publish observer failure status',
  'TD613_OBSERVER_STATUS_STATE: pending',
  'TD613_OBSERVER_STATUS_STATE: success',
  'TD613_OBSERVER_STATUS_STATE: failure',
  'Wait for deployed Ash Keep route',
  'Validate deployed observation class',
  'report.source_status !== \'DEPLOYED_OBSERVATION\'',
  'report.promotion_authorized !== false',
  'tests/ash-keep-production-closure-contract.test.mjs',
  'tests/ash-keep-production-promotion-gate.test.mjs',
  'npx playwright install --with-deps chromium',
  'scripts/ash-keep-production-probe.mjs',
  'scripts/run-ash-keep-production-probe.mjs',
  'scripts/publish-ash-keep-observer-status.mjs',
  'scripts/assert-ash-keep-release-posture.mjs',
  'TD613_PROBE_RUNTIME_DIR',
  'upload-artifact@v4',
  'ash-keep-production-closure-evidence',
  'ash-keep-deployed-observation-evidence'
]) {
  assert.ok(workflow.includes(token), `Closure workflow omitted required token: ${token}`);
}

assert.doesNotMatch(workflow, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

console.log('ash-keep-production-closure-contract.test.mjs passed');
