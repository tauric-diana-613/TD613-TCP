import assert from 'node:assert/strict';
import fs from 'node:fs';

const inherited = fs.readFileSync('scripts/ash-a2-a5-browser-probe.mjs', 'utf8');
const parentWitness = fs.readFileSync('scripts/ash-a2-a5-replacement-triggered-native-reacquisition-browser-witness.mjs', 'utf8');
const witness = fs.readFileSync('scripts/ash-a2-a5-pretrace-replacement-reacquisition-browser-witness.mjs', 'utf8');
const a15Wrapper = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const preregistration = fs.readFileSync(
  'docs/pedagogue/experiments/A2_A5_PRETRACE_REPLACEMENT_REACQUISITION_V0_1_PREREGISTRATION_20260906.md',
  'utf8'
);

// #1067 inherits the finite #1046/#1066 retry architecture rather than minting a new loop.
for (const marker of [
  'const maxRouteActivationAttempts = 4',
  'const handle = await canonicalButton.elementHandle()',
  'await handle.focus()',
  "await handle.press('Enter')",
  'replacement_retry_observed:routeActivationAttempts.length > 1',
  'canonical_control_same_instance_after',
  'native_enter_required:true',
  'direct_route_api_bypass:false'
]) assert.match(inherited, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

// The parent hostile coordinate remains visibly distinct: #1066 replaces after trace binding.
assert.match(parentWitness, /forcedReplacementReceipt/);
assert.match(parentWitness, /let pressError = null/);
assert.match(parentWitness, /traced_control_connected_after/);
assert.doesNotMatch(parentWitness, /PRETRACE_CONTROL_DISCONNECTED/);

// #1067 injects one CUSTODIAL replacement only after handle acquisition and before focus/trace.
assert.match(witness, /const FORCED_ROUTE = 'CUSTODIAL'/);
assert.match(witness, /TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT/);
assert.match(witness, /TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT_ROUTE/);
assert.match(witness, /const pretraceMarker = \[/);
assert.match(witness, /'        await handle\.focus\(\);'/);
assert.match(witness, /activationAttempt === 1/);
assert.match(witness, /oldControl\.cloneNode\(true\)/);
assert.match(witness, /replacement\.onclick = nativeOnclick/);
assert.match(witness, /oldControl\.onclick = null/);
assert.match(witness, /oldControl\.replaceWith\(replacement\)/);
assert.match(witness, /canonical_visible_count:afterVisible\.length/);
assert.match(witness, /canonical_is_replacement:afterVisible\.length === 1 && afterVisible\[0\] === replacement/);
assert.match(witness, /same_dom_instance:false/);
assert.match(witness, /direct_route_api_bypass:false/);

// Retry classification is narrow: disconnected preactivation owner only.
assert.match(witness, /const preactivationState = await handle\.evaluate/);
assert.match(witness, /preactivationState\.route !== route/);
assert.match(witness, /acquired route control changed semantic identity before focus/);
assert.match(witness, /preactivationState\.connected !== true/);
assert.match(witness, /retry_reason:'PRETRACE_CONTROL_DISCONNECTED'/);
assert.match(witness, /preactivation_stage:'BEFORE_FOCUS'/);
assert.match(witness, /preactivationState\.direct_onclick !== true/);
assert.match(witness, /connected route control lost native action authority before focus/);
assert.match(witness, /continue;/);

// Attempt 1 must be pre-trace, eventless, and non-settling; attempt 2 alone may settle.
assert.match(witness, /activation\.attempt_count !== 2/);
assert.match(witness, /activation\.replacement_retry_observed !== true/);
assert.match(witness, /first\.preactivation_stage !== 'BEFORE_FOCUS'/);
assert.match(witness, /first\.retry_reason !== 'PRETRACE_CONTROL_DISCONNECTED'/);
assert.match(witness, /first\.events\.length !== 0/);
assert.match(witness, /first\.after_dispatch_route === FORCED_ROUTE/);
assert.match(witness, /second\.attempt !== 2/);
assert.match(witness, /second\.traced_control_connected_after !== true/);
assert.match(witness, /second\.canonical_control_same_instance_after !== true/);
assert.match(witness, /second\.events\.some\(event => event\.type === 'keydown'\)/);
assert.match(witness, /second\.events\.some\(event => event\.type === 'click'\)/);
assert.match(witness, /second\.after_dispatch_route !== FORCED_ROUTE/);

// The earned #1066 observer itself remains byte-checked and untouched by the hostile wrapper.
assert.match(witness, /baseAdapterSha256 = sha256Utf8\(baseAdapterSource\)/);
assert.match(witness, /sha256Utf8\(baseAdapterAfter\) !== baseAdapterSha256/);
assert.match(witness, /inherited_observer_bytes_mutated:false/);
assert.match(witness, /observer_repair_scope:'WITNESS_ONLY_TEMPORARY_DESCENDANT_ADAPTER'/);
assert.match(witness, /product_runtime_mutation:false/);
assert.match(witness, /max_attempts_changed:false/);
assert.match(witness, /timeout_budget_widened:false/);
assert.match(witness, /counts_as_exogenous_witness:false/);
assert.match(witness, /golden_egg_credit:0/);

// Direct/private route setters stay forbidden except for the inherited fail-closed guard literal.
const inheritedSetterOccurrences = inherited.match(/__td613AshLiveAIA\.setRoute\(/g) || [];
assert.equal(inheritedSetterOccurrences.length, 1);
assert.match(witness, /INHERITED_FAIL_CLOSED_GUARD/);
assert.match(witness, /hostileForbiddenSetterOccurrences !== 1/);

// Every non-injected route remains the one-attempt control under the same hostile episode.
assert.match(witness, /if \(route === FORCED_ROUTE\) continue/);
assert.match(witness, /routeActivation\.replacement_retry_observed !== false/);
assert.match(witness, /routeActivation\.attempt_count !== 1/);
assert.match(witness, /routeActivation\.canonical_route_settled !== true/);

// Browser authority must be chained after #1066 in the already-authoritative A15 wrapper.
assert.match(a15Wrapper, /ash-a2-a5-replacement-triggered-native-reacquisition-browser-witness\.mjs/);
assert.match(a15Wrapper, /ash-a2-a5-pretrace-replacement-reacquisition-browser-witness\.mjs/);
assert.ok(
  a15Wrapper.indexOf('replacementTriggeredReacquisitionWitnessPath')
    < a15Wrapper.indexOf('pretraceReplacementReacquisitionWitnessPath'),
  '#1067 witness path must be declared after #1066 witness path'
);
assert.ok(
  a15Wrapper.indexOf('td613_a2_a5_replacement_triggered_native_reacquisition')
    < a15Wrapper.indexOf('td613_a2_a5_pretrace_replacement_reacquisition'),
  '#1067 browser episode must execute after #1066'
);

// Frozen temporal distinction, fail-closed repair rule, and finite stop law stay executable.
assert.match(preregistration, /POST_TRACE_STALE_HANDLE_RECOVERY != PRE_TRACE_STALE_HANDLE_RECOVERY/);
assert.match(preregistration, /CAUGHT_PRESS_FAILURE != CAUGHT_PREACTIVATION_FAILURE/);
assert.match(preregistration, /retryable \*\*only when the acquired handle can be independently classified as disconnected/);
assert.match(preregistration, /NEW_CATCH_BOUNDARY != ATTEMPT_COUNT_LADDER/);
assert.match(preregistration, /NO 𝄐 YET/);
assert.match(preregistration, /Western Horizon remains at official empirical-shore research rest/);

console.log('A2-A5 pre-trace replacement reacquisition hostile contract: PASS');
