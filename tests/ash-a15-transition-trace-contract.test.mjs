import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const probe = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const inheritedProbe = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs', 'utf8');

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
assert.match(probe, /LATE_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON/);
assert.match(probe, /COUPLED_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON/);
assert.match(probe, /workspace_normalization_applied:false/);
assert.match(probe, /observed_pre_route_workspace/);
assert.doesNotMatch(probe, /ensureHome\s*\(/, 'Transition calibration must not normalize workspace before measuring route effects.');
assert.match(probe, /td613Diagnostic/);
assert.match(probe, /trace_records/);

assert.match(inheritedProbe, /td613:ash:demo-registry-hydrated/);
assert.match(inheritedProbe, /__td613A15HydrationWitness/);
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

const runtimeMarker = '- name: Start one bounded Ash and Dome-World runtime';
const calibrationMarker = '- name: Calibrate A15-R0 and transition ordering across every engine';
const riskMarker = '- name: Aggregate changed-risk A8 and A12 entry witnesses across every engine';
const lifecycleMarker = '- name: Run changed-risk lifecycle closure preflight';
const inheritedMarker = '- name: Run the complete Ash witness through each installed engine';
const runtimeStart = workflow.indexOf(runtimeMarker);
const calibrationStart = workflow.indexOf(calibrationMarker);
const riskStart = workflow.indexOf(riskMarker);
const lifecycleStart = workflow.indexOf(lifecycleMarker);
const inheritedStart = workflow.indexOf(inheritedMarker);
assert.ok(runtimeStart >= 0, 'Bounded runtime must remain present.');
assert.ok(calibrationStart > runtimeStart, 'A15 calibration may depend on runtime readiness only.');
assert.ok(riskStart > calibrationStart, 'A8/A12 promotion preflight must not erase A15-R0 measurement.');
assert.ok(lifecycleStart > calibrationStart, 'Lifecycle promotion preflight must not erase A15-R0 measurement.');
assert.ok(inheritedStart > calibrationStart, 'Inherited Ash witness must follow the independent calibration prepass.');

const calibrationChamber = workflow.slice(calibrationStart, Math.min(riskStart, lifecycleStart, inheritedStart));
const inheritedChamber = workflow.slice(inheritedStart);
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
  contract:'td613.ash.a15-transition-trace-contract/v0.7-route-causal-classification',
  a15_r0_evidence_independent_of_inherited_a15:true,
  transition_trace_independent_of_inherited_a15:true,
  a15_r0_evidence_independent_of_prior_ash_promotion_gates:true,
  profile_hydration_boundary:'td613:ash:demo-registry-hydrated',
  profile_hydration_completion_required:true,
  route_side_effects_bounded_after_before_route_marker:true,
  inherited_profile_hydration_receipt_required:true,
  inherited_browser_process_isolation_per_profile:true,
  inherited_incremental_profile_checkpoints:true,
  workspace_normalization_applied:false,
  failure_diagnostics_preserved:true,
  all_engines_observed_separate_from_all_seams_ok:true,
  inherited_a15_retains_promotion_veto:true,
  execution_order_is_not_epistemic_authority:true,
  measurement_dependencies_are_runtime_dependencies_only:true,
  observation_window_is_quiescence_proof:false,
  timing_patch_authorized:false
}, null, 2));
