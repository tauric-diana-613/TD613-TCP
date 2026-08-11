import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const probe = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');

assert.match(probe, /observation_window_is_quiescence_proof:false/);
assert.match(probe, /universal_settlement_claim:false/);
assert.match(probe, /timing_patch_authorized:false/);
assert.match(probe, /route_state_settled_equals_workspace_state_settled:false/);
assert.match(probe, /ROOT_ATTRIBUTE_MUTATION/);
assert.match(probe, /td613:ash:navigation-receipt/);
assert.match(probe, /td613:ash:ux-workspace-opened/);
assert.match(probe, /LATE_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON/);
assert.match(probe, /COUPLED_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON/);

const calibrationMarker = '- name: Calibrate A15-R0 and transition ordering across every engine';
const inheritedMarker = '- name: Run the inherited complete Ash witness through each installed engine';
const calibrationStart = workflow.indexOf(calibrationMarker);
const inheritedStart = workflow.indexOf(inheritedMarker);
assert.ok(calibrationStart >= 0, 'Independent A15 calibration prepass must remain present.');
assert.ok(inheritedStart > calibrationStart, 'Inherited Ash witness must follow the independent calibration prepass.');

const calibrationChamber = workflow.slice(calibrationStart, inheritedStart);
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
assert.match(calibrationChamber, /independent_from_inherited_a15:true/);
assert.match(calibrationChamber, /promotion_authority:false/);

console.log(JSON.stringify({
  contract:'td613.ash.a15-transition-trace-contract/v0.2-witness-dag',
  a15_r0_evidence_independent_of_inherited_a15:true,
  transition_trace_independent_of_inherited_a15:true,
  inherited_a15_retains_promotion_veto:true,
  execution_order_is_not_epistemic_authority:true,
  observation_window_is_quiescence_proof:false,
  timing_patch_authorized:false
}, null, 2));
