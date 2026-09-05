import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const probe = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const inheritedProbe = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs', 'utf8');
const inheritedRouteProbe = fs.readFileSync('scripts/ash-a2-a5-browser-probe.mjs', 'utf8');

assert.match(probe, /observation_window_is_quiescence_proof:false/);
assert.match(probe, /universal_settlement_claim:false/);
assert.match(probe, /timing_patch_authorized:false/);
assert.match(probe, /route_state_settled_equals_workspace_state_settled:false/);
assert.match(probe, /ROOT_ATTRIBUTE_MUTATION/);
assert.match(probe, /td613:ash:navigation-receipt/);
assert.match(probe, /td613:ash:ux-workspace-opened/);
assert.match(probe, /td613:ash:demo-registry-hydrated/);
assert.match(probe, /profile_hydration_completion_required:true/);
assert.match(probe, /route_side_effects_bounded_after_before_route_marker:true/);
assert.match(probe, /record\.sequence > \(beforeRoute\?\.sequence \|\| 0\)/);
assert.match(probe, /route_control_owner_observed_at_click:true/);
assert.match(probe, /route_click_capture_and_bubble_instrumented:true/);
assert.match(probe, /function observedClickPhases\(cell\)/);
assert.match(probe, /records\.some\(record => record\.kind === 'ROUTE_CLICK_CAPTURE'\)/);
assert.match(probe, /records\.some\(record => record\.kind === 'ROUTE_CLICK_BUBBLE'\)/);
assert.match(probe, /routeClickCaptureAndBubbleObserved = cells\.length > 0 && cells\.every\(observedClickPhases\)/);
assert.match(probe, /route_click_capture_and_bubble_observed:routeClickCaptureAndBubbleObserved/);
assert.doesNotMatch(probe, /route_click_capture_and_bubble_observed:pointerDeliveryHolds\.length === 0/,
  'Route click phase claims must be derived from trace records, not from the absence of pointer holds.');
assert.match(probe, /live_aia_direct_onclick:typeof node\.onclick === 'function'/);
assert.match(probe, /ROUTE_CONTROL_BEFORE_CLICK/);
assert.match(probe, /ROUTE_CLICK_\$\{phase\}/);
assert.match(probe, /routeClick\('CAPTURE'\)/);
assert.match(probe, /routeClick\('BUBBLE'\)/);
assert.match(probe, /AFTER_ROUTE_CLICK_DISPATCH/);
assert.match(probe, /lacks the Live-AIA direct owner/);
assert.match(probe, /POINTER_DELIVERY_UNREGISTERED/);
assert.match(probe, /classifyObserverFailure/);
assert.match(probe, /beforeClick\?\.detail\?\.connected === true/);
assert.match(probe, /beforeClick\?\.detail\?\.live_aia_direct_onclick === true/);
assert.match(probe, /afterDispatch/);
assert.match(probe, /!capture/);
assert.match(probe, /!bubble/);
assert.match(probe, /pointer_delivery_holds_are_promotion_veto:false/);
assert.match(probe, /measurement_complete:cells\.length \+ pointerDeliveryHolds\.length \+ failures\.length === expectedCellCount/);
assert.match(probe, /promotion_authority:false/);
assert.match(probe, /if \(failures\.length > 0\) process\.exitCode = 1/);
assert.doesNotMatch(probe, /if \(pointerDeliveryHolds\.length > 0\) process\.exitCode = 1/,
  'Pointer-delivery observer holds must remain preserved evidence without becoming a promotion veto.');
assert.match(probe, /LATE_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON/);
assert.match(probe, /COUPLED_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON/);
assert.match(probe, /workspace_normalization_applied:false/);
assert.match(probe, /observed_pre_route_workspace/);
assert.doesNotMatch(probe, /ensureHome\s*\(/, 'Transition calibration must not normalize workspace before measuring route effects.');
assert.match(probe, /td613Diagnostic/);
assert.match(probe, /trace_records/);

assert.match(inheritedProbe, /td613:ash:demo-registry-hydrated/);
assert.match(inheritedProbe, /__td613A15HydrationWitness/);
assert.match(inheritedProbe, /capture\.receipt\?\.automatic_ash_action === false/,
  'Canonical A15 must reject hydration receipts that widen automatic Ash authority.');
assert.match(inheritedProbe, /profile_hydration_completion_boundary:HYDRATION_EVENT/);
assert.match(inheritedProbe, /profile_hydration_receipt_required:true/);
assert.match(inheritedProbe, /browser_process_isolation_per_profile:true/);
assert.match(inheritedProbe, /incremental_profile_checkpoints:true/);
assert.match(inheritedProbe, /A15_PROFILE_BEGIN/);
assert.match(inheritedProbe, /A15_PROFILE_PASS/);
assert.match(inheritedProbe, /const browser = await browserType\.launch\(\{ headless:true \}\);/);
assert.match(inheritedProbe, /await browser\.close\(\)\.catch\(\(\) => \{\}\)/);
assert.doesNotMatch(
  inheritedProbe,
  /return \(Boolean\(current\?\.case_id\) && document\.documentElement\.dataset\.ashDemoProfile === selected\)/,
  'Canonical A15 must not infer profile hydration completion from case/profile visibility alone.'
);

assert.match(inheritedRouteProbe, /#ashAiaMembrane \[data-aia-route=/,
  'Inherited semantic route witness must target the canonical visible AIA route control.');
assert.match(inheritedRouteProbe, /const maxRouteActivationAttempts = 4/,
  'Replaceable route controls must use a bounded reacquisition budget.');
assert.match(inheritedRouteProbe, /await canonicalButton\.waitFor\(\{ state:'visible', timeout:20_000 \}\)/);
assert.match(inheritedRouteProbe, /const handle = await canonicalButton\.elementHandle\(\)/,
  'One concrete control instance must own focus, trace binding, and native activation per attempt.');
assert.match(inheritedRouteProbe, /await handle\.focus\(\)/);
assert.match(inheritedRouteProbe, /await handle\.evaluate\(\(control, payload\) => \{/);
assert.match(inheritedRouteProbe, /await handle\.press\('Enter'\)/,
  'Inherited semantic route witness must dispatch native Enter through the exact traced canonical control instance.');
assert.doesNotMatch(
  inheritedRouteProbe,
  /await page\.keyboard\.press\('Enter'\)/,
  'Inherited semantic route witness may not depend on global page focus surviving a separate round-trip.'
);
assert.match(inheritedRouteProbe, /control\?\.dataset\?\.aiaRoute !== expected/);
assert.match(inheritedRouteProbe, /!control\.isConnected/);
assert.match(inheritedRouteProbe, /control === document\.activeElement/);
assert.match(inheritedRouteProbe, /typeof control\.onclick === 'function'/);
assert.match(inheritedRouteProbe, /__td613A2A5SemanticRouteTrace/);
assert.match(inheritedRouteProbe, /__td613A2A5SemanticRouteControl/);
assert.match(inheritedRouteProbe, /canonical_control_same_instance_after/,
  'The witness must record whether the traced node survived as the canonical visible route control.');
assert.match(inheritedRouteProbe, /traced_control_connected_after/);
assert.match(inheritedRouteProbe, /replacement_retry_observed:routeActivationAttempts\.length > 1/);
assert.match(inheritedRouteProbe, /attempt_count:routeActivationAttempts\.length/);
assert.match(inheritedRouteProbe, /native_enter_required:true/);
assert.match(inheritedRouteProbe, /direct_route_api_bypass:false/);
assert.match(inheritedRouteProbe, /'KEYDOWN_CAPTURE'/);
assert.match(inheritedRouteProbe, /'KEYDOWN_BUBBLE'/);
assert.match(inheritedRouteProbe, /'KEYUP_CAPTURE'/);
assert.match(inheritedRouteProbe, /'KEYUP_BUBBLE'/);
assert.match(inheritedRouteProbe, /'CLICK_CAPTURE'/);
assert.match(inheritedRouteProbe, /'CLICK_BUBBLE'/);
assert.match(inheritedRouteProbe, /after_dispatch_route/);
assert.match(inheritedRouteProbe, /window\.__td613AshLiveAIA\?\.current\?\.\(\)\?\.route === expected/,
  'Inherited semantic route witness must still verify canonical Live-AIA settlement after native activation.');
assert.match(inheritedRouteProbe, /report\.observations\.semantic_route_activation\[route\] = \{/);
assert.match(
  inheritedRouteProbe,
  /if \(source\.includes\('__td613AshLiveAIA\.setRoute\('\)\) \{/,
  'Inherited semantic route witness must actively reject private Live-AIA route API shortcuts.'
);
assert.match(inheritedRouteProbe, /route witness may not bypass the native route control owner/);
assert.match(inheritedRouteProbe, /bounded native route activation failed after replaceable-control retries/,
  'Exhausting the bounded canonical-control retry budget must fail closed.');

const runtimeMarker = '- name: Start isolated core extended and Flow-Core runtimes';
const calibrationMarker = '- name: Calibrate A15-R0 and transition ordering for this engine';
const riskMarker = '- name: Run front-line A8 A12 and lifecycle preflight for this engine';
const inheritedMarker = '- name: Run core extended and Flow-Core lanes in parallel';
const stopMarker = '- name: Stop isolated runtimes';
const runtimeStart = workflow.indexOf(runtimeMarker);
const calibrationStart = workflow.indexOf(calibrationMarker);
const riskStart = workflow.indexOf(riskMarker);
const inheritedStart = workflow.indexOf(inheritedMarker);
const stopStart = workflow.indexOf(stopMarker);

assert.ok(runtimeStart >= 0, 'Bounded sharded runtimes must remain present.');
assert.ok(inheritedStart > runtimeStart, 'The expensive inherited Ash witness must begin immediately after runtime readiness for early failure discovery.');
assert.ok(calibrationStart > inheritedStart, 'Independent A15 calibration must follow the front-loaded expensive witness without becoming its prerequisite.');
assert.ok(riskStart > calibrationStart, 'A8/lifecycle/A12 promotion preflight must remain downstream of independent calibration.');
assert.ok(stopStart > riskStart, 'The full browser shard must have a bounded end marker after all witness and gating chambers.');
assert.match(workflow, /browser: \[chromium, firefox, webkit\]/, 'Chromium, Firefox, and WebKit must remain explicit independent shards.');
assert.match(workflow, /max-parallel: 3/, 'All three engine shards must remain independently runnable.');

const runtimeChamber = workflow.slice(runtimeStart, inheritedStart);
const inheritedChamber = workflow.slice(inheritedStart, calibrationStart);
const calibrationChamber = workflow.slice(calibrationStart, riskStart);
const riskChamber = workflow.slice(riskStart, stopStart);

assert.match(runtimeChamber, /for spec in core:6130 extended:6131 flowcore:6132; do/,
  'Each engine shard must start the declared isolated runtime set.');
assert.match(runtimeChamber, /node scripts\/ash-keep-local-closure-server\.mjs "\$port"/,
  'The bounded Ash runtime launcher must remain executable in every engine shard.');
assert.match(runtimeChamber, /__ash_keep_closure\/readiness/,
  'Expensive witness execution may begin only after the bounded runtime readiness endpoint settles.');
assert.match(runtimeChamber, /if \[\[ "\$ready" -ne 1 \]\]; then/,
  'Missing runtime readiness must remain a fatal prerequisite failure.');

assert.doesNotMatch(calibrationChamber, /timeout\s+--foreground\b/,
  'A15-R0 calibration Playwright probes must keep browser descendants in the timeout process group.');
assert.match(calibrationChamber, /TD613_BASE_URL='http:\/\/127\.0\.0\.1:6130'/,
  'A15-R0 calibration must observe the already-readied core runtime.');
assert.match(calibrationChamber, /browser='\$\{\{ matrix\.browser \}\}'/,
  'A15-R0 calibration must inherit the exact engine shard being witnessed.');
assert.match(calibrationChamber, /timeout --signal=INT --kill-after=15s 360s node scripts\/ash-a15-r0-preview-probe\.mjs/,
  'A15-R0 preview keeps its 360-second budget while using process-group timeout containment.');
assert.match(calibrationChamber, /timeout --signal=INT --kill-after=15s 420s node scripts\/ash-a15-transition-trace-browser-probe\.mjs/,
  'A15 transition trace keeps its 420-second budget while using process-group timeout containment.');
assert.match(calibrationChamber, /measurement_before_gating:true/);
assert.match(calibrationChamber, /per_engine_observed:true/);
assert.match(calibrationChamber, /ok:failures\.length === 0/);
assert.match(calibrationChamber, /fail_fast:false/);
assert.match(calibrationChamber, /independent_from_inherited_a15:true/);
assert.match(calibrationChamber, /promotion_authority:false/);
assert.match(calibrationChamber, /production_mutation:false/);

assert.match(riskChamber, /TD613_ASH_STAGES='A8'/);
assert.match(riskChamber, /TD613_A12_ENTRY_PREFLIGHT='true'/);
assert.match(riskChamber, /timeout --foreground --signal=INT --kill-after=15s 420s node scripts\/run-ash-keep-a1-production-probe\.mjs/,
  'Lifecycle closure preflight retains its constitutionally declared foreground timeout law.');

for (const probeName of [
  'ash-a2-a5-browser-probe.mjs',
  'ash-a7-a11-browser-probe.mjs',
  'ash-a12-browser-probe.mjs',
  'ash-research-ux-browser-probe.mjs',
  'ash-reviewability-browser-probe.mjs',
  'ash-ingress-polish-browser-probe.mjs',
  'ash-a15-empirical-profile-journeys-browser-probe.mjs',
  'ash-a13-demo-registry-browser-probe.mjs',
  'ash-a14-archive-browser-probe.mjs',
  'run-ash-flowcore-live-field-browser-probe.mjs'
]) {
  const commandLine = inheritedChamber.split('\n').find(line => line.includes('node scripts/' + probeName)) || '';
  assert.ok(commandLine, `${probeName} must remain present in the canonical sharded Ash lane.`);
  assert.match(commandLine, /timeout --signal=INT --kill-after=/,
    `${probeName} must remain in a timeout-owned process group.`);
  assert.doesNotMatch(commandLine, /--foreground/,
    `${probeName} may not restore foreground timeout semantics.`);
}
assert.match(inheritedChamber, /timeout --foreground --signal=INT --kill-after=20s 1500s node scripts\/flowcore-runtime-browser-probe\.mjs/,
  'Flow-Core runtime retains its separately governed foreground timeout contract.');
assert.match(inheritedChamber, /timeout --signal=INT --kill-after=15s 420s node scripts\/ash-a12-browser-probe\.mjs/,
  'Canonical A12 retains its 420-second budget while using process-group timeout containment.');

const r0Index = calibrationChamber.indexOf('node scripts/ash-a15-r0-preview-probe.mjs');
const traceIndex = calibrationChamber.indexOf('node scripts/ash-a15-transition-trace-browser-probe.mjs');
const a15Index = inheritedChamber.indexOf('node scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs');
assert.ok(r0Index >= 0, 'A15-R0 browser witness must be present in the independent per-engine calibration chamber.');
assert.ok(traceIndex >= 0, 'A15 transition-trace witness must be present in the independent per-engine calibration chamber.');
assert.ok(a15Index >= 0, 'Inherited A15 browser witness must remain present in the front-loaded expensive lane.');

// Descendant Holonomy Loom contracts execute from this already-authoritative static gate.
// Their placement cannot widen A15 authority; any failure simply vetoes the enclosing contract job.
await import('./holonomy-loom-local-pocket-policy-binding.test.mjs');
await import('./marrowline-pocket-hosted-carry-case.test.mjs');
