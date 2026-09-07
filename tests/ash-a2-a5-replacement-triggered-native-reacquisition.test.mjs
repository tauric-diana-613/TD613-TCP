import assert from 'node:assert/strict';
import fs from 'node:fs';

const inherited = fs.readFileSync('scripts/ash-a2-a5-browser-probe.mjs', 'utf8');
const witness = fs.readFileSync('scripts/ash-a2-a5-replacement-triggered-native-reacquisition-browser-witness.mjs', 'utf8');
const a15Wrapper = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const preregistration = fs.readFileSync(
  'docs/pedagogue/experiments/A2_A5_REPLACEMENT_TRIGGERED_NATIVE_REACQUISITION_V0_1_PREREGISTRATION_20260906.md',
  'utf8'
);

// The successor must exercise the already-earned #1046 retry mechanism, not replace it.
for (const marker of [
  'const maxRouteActivationAttempts = 4',
  'const handle = await canonicalButton.elementHandle()',
  "await handle.press('Enter')",
  'replacement_retry_observed:routeActivationAttempts.length > 1',
  'canonical_control_same_instance_after',
  'traced_control_connected_after',
  'native_enter_required:true',
  'direct_route_api_bypass:false'
]) assert.match(inherited, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.doesNotMatch(inherited, /__td613AshLiveAIA\.setRoute\(/);

// Hostile injection is temporary-observer-only and frozen to one CUSTODIAL replacement.
assert.match(witness, /const FORCED_ROUTE = 'CUSTODIAL'/);
assert.match(witness, /TD613_A2_A5_FORCE_REPLACEMENT/);
assert.match(witness, /TD613_A2_A5_FORCE_REPLACEMENT_ROUTE/);
assert.match(witness, /tracedControl\.cloneNode\(true\)/);
assert.match(witness, /replacement\.onclick = nativeOnclick/);
assert.match(witness, /tracedControl\.onclick = null/);
assert.match(witness, /tracedControl\.replaceWith\(replacement\)/);
assert.match(witness, /canonical_visible_count:canonicalVisible\.length/);
assert.match(witness, /canonical_is_replacement:canonicalVisible\.length === 1 && canonicalVisible\[0\] === replacement/);
assert.match(witness, /same_dom_instance:false/);
assert.match(witness, /direct_route_api_bypass:false/);
assert.doesNotMatch(witness, /__td613AshLiveAIA\.setRoute\(/);

// Attempt 1 must remain visible as the stale owner; attempt 2 alone may earn recovery.
assert.match(witness, /activation\.attempt_count !== 2/);
assert.match(witness, /activation\.replacement_retry_observed !== true/);
assert.match(witness, /first\.traced_control_connected_after !== false/);
assert.match(witness, /first\.canonical_control_same_instance_after !== false/);
assert.match(witness, /first\.after_dispatch_route === FORCED_ROUTE/);
assert.match(witness, /second\.attempt !== 2/);
assert.match(witness, /second\.traced_control_connected_after !== true/);
assert.match(witness, /second\.canonical_control_same_instance_after !== true/);
assert.match(witness, /second\.events\.some\(event => event\.type === 'keydown'\)/);
assert.match(witness, /second\.events\.some\(event => event\.type === 'click'\)/);
assert.match(witness, /second\.after_dispatch_route !== FORCED_ROUTE/);

// The successor must prove the earned observer bytes remained unchanged after execution.
assert.match(witness, /baseAdapterSha256 = sha256Utf8\(baseAdapterSource\)/);
assert.match(witness, /sha256Utf8\(baseAdapterAfter\) !== baseAdapterSha256/);
assert.match(witness, /inherited_observer_bytes_mutated:false/);
assert.match(witness, /product_runtime_mutation:false/);
assert.match(witness, /timeout_budget_widened:false/);
assert.match(witness, /counts_as_exogenous_witness:false/);
assert.match(witness, /golden_egg_credit:0/);

// Non-injected routes remain ordinary one-attempt controls.
assert.match(witness, /if \(route === FORCED_ROUTE\) continue/);
assert.match(witness, /routeActivation\.replacement_retry_observed !== false/);
assert.match(witness, /routeActivation\.attempt_count !== 1/);

// Browser authority must be wired through the already-authoritative A15 calibration wrapper.
assert.match(a15Wrapper, /ash-a2-a5-replacement-triggered-native-reacquisition-browser-witness\.mjs/);
assert.match(a15Wrapper, /td613_a2_a5_replacement_triggered_native_reacquisition/);

// Frozen claim ceiling and finite stop law remain part of the executable descendant contract.
assert.match(preregistration, /RECOVERY_BRANCH_PRESENT != RECOVERY_BRANCH_EXERCISED/);
assert.match(preregistration, /ATTEMPT_2_RECOVERY != ENTITLEMENT_TO_ATTEMPT_3_ENUMERATION/);
assert.match(preregistration, /NO 𝄐 YET/);
assert.match(preregistration, /Western Horizon remains at official empirical-shore research rest/);

console.log('A2-A5 replacement-triggered native reacquisition hostile contract: PASS');
