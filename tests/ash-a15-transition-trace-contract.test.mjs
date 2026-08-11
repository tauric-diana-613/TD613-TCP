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

const r0Index = workflow.indexOf('node scripts/ash-a15-r0-preview-probe.mjs');
const traceIndex = workflow.indexOf('node scripts/ash-a15-transition-trace-browser-probe.mjs');
const a15Index = workflow.indexOf('node scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs');
assert.ok(r0Index >= 0, 'A15-R0 browser witness must be present in consolidated CI.');
assert.ok(traceIndex >= 0, 'A15 transition-trace witness must be present in consolidated CI.');
assert.ok(a15Index >= 0, 'Inherited A15 browser witness must remain present in consolidated CI.');
assert.ok(r0Index < traceIndex, 'A15-R0 must earn its own browser evidence before inherited A15 transition calibration.');
assert.ok(traceIndex < a15Index, 'Transition calibration must run before inherited A15 can block the loop.');

console.log(JSON.stringify({
  contract:'td613.ash.a15-transition-trace-contract/v0.1',
  a15_r0_witness_precedes_inherited_a15:true,
  transition_trace_precedes_inherited_a15:true,
  observation_window_is_quiescence_proof:false,
  timing_patch_authorized:false
}, null, 2));
