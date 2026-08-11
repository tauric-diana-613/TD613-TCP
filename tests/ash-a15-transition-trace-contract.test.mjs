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

assert.match(inheritedRouteProbe, /await button\.focus\(\)/);
assert.match(inheritedRouteProbe, /await page\.keyboard\.press\('Enter'\)/);
assert.match(inheritedRouteProbe, /control === document\.activeElement/);
assert.match(inheritedRouteProbe, /typeof control\.onclick === 'function'/);
assert.match(inheritedRouteProbe, /__td613A2A5SemanticRouteTrace/);
assert.match(inheritedRouteProbe, /'KEYDOWN_CAPTURE'/);
assert.match(inheritedRouteProbe, /'KEYDOWN_BUBBLE'/);
assert.match(inheritedRouteProbe, /'KEYUP_CAPTURE'/);
assert.match(inheritedRouteProbe, /'KEYUP_BUBBLE'/);
assert.match(inheritedRouteProbe, /'CLICK_CAPTURE'/);
assert.match(inheritedRouteProbe, /'CLICK_BUBBLE'/);
assert.match(inheritedRouteProbe, /after_dispatch_route/);
assert.match(inheritedRouteProbe, /report\.observations\.semantic_route_activation\[route\] = activationAfterDispatch/);
assert.match(
  inheritedRouteProbe,
  /if \(source\.includes\('__td613AshLiveAIA\.setRoute\('\)\) \{/,
  'Inherited semantic route witness must actively reject private Live-AIA route API shortcuts.'
);
assert.match(inheritedRouteProbe, /route witness may not bypass the native route control owner/);

const runtimeMarker = '- name: Start one bounded Ash and Dome-World runtime';
const calibrationMarker = '- name: Calibrate A15-R0 and transition ordering across every engine';
const riskMarker = '- name: Aggregate changed-risk A8 and A12 entry witnesses across every engine';
const lifecycleMarker = '- name: Run changed-risk lifecycle closure preflight';
const inheritedMarker = '- name: Run the complete Ash witness through each installed engine';
const flowcoreMarker = '- name: Run complete Flow-Core runtime evidence through the same browser installation';
const runtimeStart = workflow.indexOf(runtimeMarker);
const calibrationStart = workflow.indexOf(calibrationMarker);
const riskStart = workflow.indexOf(riskMarker);
const lifecycleStart = workflow.indexOf(lifecycleMarker);
const inheritedStart = workflow.indexOf(inheritedMarker);
const flowcoreStart = workflow.indexOf(flowcoreMarker);
assert.ok(runtimeStart >= 0, 'Bounded runtime must remain present.');
assert.ok(calibrationStart > runtimeStart, 'A15 calibration may depend on runtime readiness only.');
assert.ok(riskStart > calibrationStart, 'A8/A12 promotion preflight must not erase A15-R0 measurement.');
assert.ok(lifecycleStart > calibrationStart, 'Lifecycle promotion preflight must not erase A15-R0 measurement.');
assert.ok(inheritedStart > calibrationStart, 'Inherited Ash witness must follow the independent calibration prepass.');
assert.ok(flowcoreStart > inheritedStart, 'The inherited Ash browser chamber must have a bounded end marker.');

const calibrationChamber = workflow.slice(calibrationStart, Math.min(riskStart, lifecycleStart, inheritedStart));
const inheritedChamber = workflow.slice(inheritedStart, flowcoreStart);
const lifecycleChamber = workflow.slice(lifecycleStart, inheritedStart);
assert.doesNotMatch(calibrationChamber, /timeout\s+--foreground\b/,
  'A15-R0 calibration Playwright probes must keep browser descendants in the timeout process group.');
assert.match(calibrationChamber, /timeout --signal=INT --kill-after=15s 360s node scripts\/ash-a15-r0-preview-probe\.mjs/,
  'A15-R0 preview keeps its 360-second budget while using process-group timeout containment.');
assert.match(calibrationChamber, /timeout --signal=INT --kill-after=15s 420s node scripts\/ash-a15-transition-trace-browser-probe\.mjs/,
  'A15 transition trace keeps its 420-second budget while using process-group timeout containment.');
assert.doesNotMatch(inheritedChamber, /timeout\s+--foreground\b/,
  'Canonical inherited Ash Playwright probes must keep browser descendants in the timeout process group.');
assert.match(inheritedChamber, /timeout --signal=INT --kill-after=15s 420s node scripts\/ash-a12-browser-probe\.mjs/,
  'Canonical A12 retains its 420-second budget while using process-group timeout containment.');
assert.match(lifecycleChamber, /timeout --foreground --signal=INT --kill-after=15s 420s node scripts\/run-ash-keep-a1-production-probe\.mjs/,
  'Lifecycle closure preflight retains its constitutionally declared foreground timeout law.');

const r0Index = calibrationChamber.indexOf('node scripts/ash-a15-r0-preview-probe.mjs');
const traceIndex = calibrationChamber.indexOf('node scripts/ash-a15-transition-trace-browser-probe.mjs');
const a15Index = inheritedChamber.indexOf('node scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs');
assert.ok(r0Index >= 0, 'A15-R0 browser witness must be present in the independent calibration prepass.');
assert.ok(traceIndex >= 0, 'A15 transition-trace witness must be present in the independent calibration prepass.');
assert.ok(a15Index >= 0, 'Inherited A15 browser witness must remain present as a later promotion gate.');
assert.ok(r0Index < traceIndex, 'A15-R0 preview evidence must precede transition calibration within each engine.');
assert.equal(inheritedChamber.includes('node scripts/ash-a15-r0-preview-probe.mjs'), false, 'Inherited witness must not own A15-R0 evidence acquisition.');
assert.equal(inheritedChamber.includes('node scripts/ash-a15-transition-trace-browser-probe.mjs'), false, 'Inherited witness must not own transition-trace evidence acquisition.');
assert.match(calibrationChamber, /all_engines_observed:true/);
assert.match(calibrationChamber, /ok:failures\.length === 0/);
assert.match(calibrationChamber, /fail_fast:false/);
assert.match(calibrationChamber, /independent_from_inherited_a15:true/);
assert.match(calibrationChamber, /independent_from_prior_ash_promotion_gates:true/);
assert.match(calibrationChamber, /promotion_authority:false/);

console.log(JSON.stringify({
  contract:'td613.ash.a15-transition-trace-contract/v0.13-scoped-process-group-containment',
  a15_r0_evidence_independent_of_inherited_a15:true,
  transition_trace_independent_of_inherited_a15:true,
  a15_r0_evidence_independent_of_prior_ash_promotion_gates:true,
  profile_hydration_boundary:'td613:ash:demo-registry-hydrated',
  profile_hydration_completion_required:true,
  hydration_authority_must_remain_closed:true,
  route_side_effects_bounded_after_before_route_marker:true,
  route_control_owner_observed_at_click:true,
  route_click_capture_and_bubble_instrumented:true,
  route_click_phase_claim_derived_from_trace_records:true,
  pointer_delivery_hold_classification_requires_owned_control_and_absent_dom_click:true,
  pointer_delivery_holds_are_promotion_veto:false,
  transition_probe_nonzero_reserved_for_fatal_observer_failures:true,
  inherited_profile_hydration_receipt_required:true,
  inherited_browser_process_isolation_per_profile:true,
  inherited_incremental_profile_checkpoints:true,
  inherited_semantic_route_witness_uses_native_keyboard_button_activation:true,
  inherited_semantic_keyboard_keydown_keyup_and_click_diagnostic:true,
  inherited_semantic_keyboard_diagnostic_persisted_before_route_wait:true,
  inherited_semantic_route_witness_private_api_bypass_guard:true,
  a15_calibration_timeout_process_group_containment:true,
  inherited_ash_timeout_process_group_containment:true,
  lifecycle_closure_foreground_law_preserved:true,
  canonical_a12_timeout_budget_seconds:420,
  workspace_normalization_applied:false,
  failure_diagnostics_preserved:true,
  all_engines_observed_separate_from_all_seams_ok:true,
  inherited_a15_retains_promotion_veto:true,
  execution_order_is_not_epistemic_authority:true,
  measurement_dependencies_are_runtime_dependencies_only:true,
  observation_window_is_quiescence_proof:false,
  timing_patch_authorized:false
}, null, 2));