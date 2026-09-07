import assert from 'node:assert/strict';
import fs from 'node:fs';

const inherited = fs.readFileSync('scripts/ash-a2-a5-browser-probe.mjs', 'utf8');
const positiveParent = fs.readFileSync('scripts/ash-a2-a5-pretrace-replacement-reacquisition-browser-witness.mjs', 'utf8');
const witness = fs.readFileSync('scripts/ash-a2-a5-preactivation-retry-class-discrimination-browser-witness.mjs', 'utf8');
const a15Wrapper = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const preregistration = fs.readFileSync(
  'docs/pedagogue/experiments/A2_A5_PREACTIVATION_RETRY_CLASS_DISCRIMINATION_V0_1_PREREGISTRATION_20260906.md',
  'utf8'
);

// The earned #1067 positive anchor remains the disconnected-owner retry class.
assert.match(positiveParent, /PRETRACE_CONTROL_DISCONNECTED/);
assert.match(positiveParent, /activation\.attempt_count !== 2/);
assert.match(positiveParent, /attempt_2/);
assert.match(positiveParent, /native_keydown_observed/);
assert.match(positiveParent, /native_click_observed/);

// Inherited attempt and timing ceilings stay fixed.
assert.match(inherited, /const maxRouteActivationAttempts = 4/);
assert.match(inherited, /timeout:4_000/);
assert.match(inherited, /const handle = await canonicalButton\.elementHandle\(\)/);
assert.match(inherited, /await handle\.focus\(\)/);
assert.match(inherited, /await handle\.press\('Enter'\)/);

// Exactly two connected negative classes are exercised on CUSTODIAL.
assert.match(witness, /const FORCED_ROUTE = 'CUSTODIAL'/);
assert.match(witness, /CONNECTED_SEMANTIC_DRIFT/);
assert.match(witness, /CONNECTED_NATIVE_OWNER_LOSS/);
assert.match(witness, /expected_stale_route:'AUDIT'/);
assert.match(witness, /expected_direct_onclick:false/);
assert.match(witness, /TD613_A2_A5_RETRY_CLASS_CASE/);
assert.match(witness, /activationAttempt === 1/);

// Both hostile controls preserve a connected stale node and install one visible native owner.
assert.match(witness, /oldControl\.insertAdjacentElement\('afterend', replacement\)/);
assert.match(witness, /oldControl\.hidden = true/);
assert.match(witness, /old_connected_after:oldControl\.isConnected === true/);
assert.match(witness, /replacement_connected:replacement\.isConnected === true/);
assert.match(witness, /replacement_has_native_onclick:typeof replacement\.onclick === 'function'/);
assert.match(witness, /canonical_visible_count:afterVisible\.length/);
assert.match(witness, /canonical_is_replacement:afterVisible\.length === 1 && afterVisible\[0\] === replacement/);
assert.match(witness, /same_dom_instance:false/);

// N1 changes only semantic identity; N2 changes only stale native ownership.
assert.match(witness, /oldControl\.dataset\.aiaRoute = 'AUDIT'/);
assert.match(witness, /oldControl\.onclick = null/);
assert.match(witness, /preactivationState\.route !== route/);
assert.match(witness, /acquired route control changed semantic identity before focus/);
assert.match(witness, /preactivationState\.direct_onclick !== true/);
assert.match(witness, /connected route control lost native action authority before focus/);

// Disconnected-owner retry remains a separate branch and connected negatives do not enter it.
assert.match(witness, /preactivationState\.connected !== true/);
assert.match(witness, /retry_reason:'PRETRACE_CONTROL_DISCONNECTED'/);
assert.match(witness, /retry_classification_observed:false/);
assert.match(witness, /second_attempt_observed:false/);
assert.match(witness, /classifier_rejection_precedes_focus:true/);
assert.match(witness, /classifier_rejection_precedes_trace:true/);
assert.match(witness, /classifier_rejection_precedes_native_activation:true/);

// The outer assay accepts only the exact preregistered classifier failures.
assert.match(witness, /caught\.message !== negative\.expected_error/);
assert.match(witness, /report\.error\?\.message !== negative\.expected_error/);
assert.match(witness, /unexpectedly completed without the preregistered hard rejection/);
assert.match(witness, /converted an expected negative control into product PASS/);
assert.match(witness, /report\.observations\?\.semantic_route_activation\?\.\[FORCED_ROUTE\]/);
assert.match(witness, /unexpectedly settled \$\{FORCED_ROUTE\} before classifier rejection/);

// No direct/private route setter or authority widening is admitted.
const inheritedSetterOccurrences = inherited.match(/__td613AshLiveAIA\.setRoute\(/g) || [];
assert.equal(inheritedSetterOccurrences.length, 1);
assert.match(witness, /INHERITED_FAIL_CLOSED_GUARD/);
assert.match(witness, /hostileForbiddenSetterOccurrences !== 1/);
assert.match(witness, /inherited_observer_bytes_mutated:false/);
assert.match(witness, /product_runtime_mutation:false/);
assert.match(witness, /max_attempts_changed:false/);
assert.match(witness, /timeout_budget_widened:false/);
assert.match(witness, /release_authority:false/);
assert.match(witness, /provider_call_performed:false/);
assert.match(witness, /production_mutation:false/);
assert.match(witness, /counts_as_exogenous_witness:false/);
assert.match(witness, /golden_egg_credit:0/);

// Browser authority must execute after the already-earned #1067 positive witness.
assert.match(a15Wrapper, /ash-a2-a5-pretrace-replacement-reacquisition-browser-witness\.mjs/);
assert.match(a15Wrapper, /ash-a2-a5-preactivation-retry-class-discrimination-browser-witness\.mjs/);
assert.ok(
  a15Wrapper.indexOf('pretraceReplacementReacquisitionWitnessPath')
    < a15Wrapper.indexOf('preactivationRetryClassDiscriminationWitnessPath'),
  '#1071 witness path must be declared after #1067 witness path'
);
assert.ok(
  a15Wrapper.indexOf('td613_a2_a5_pretrace_replacement_reacquisition')
    < a15Wrapper.indexOf('td613_a2_a5_preactivation_retry_class_discrimination'),
  '#1071 negative-control episode must execute after #1067 positive authority'
);

// Preregistered theorem, claim ceiling, and terminal stop law remain executable.
assert.match(preregistration, /DISCONNECTED_STALE_OWNER != CONNECTED_INVALID_OWNER/);
assert.match(preregistration, /RETRYABLE_OWNERSHIP_LOSS != CONNECTED_SEMANTIC_DRIFT/);
assert.match(preregistration, /RETRYABLE_OWNERSHIP_LOSS != CONNECTED_NATIVE_AUTHORITY_LOSS/);
assert.match(preregistration, /PREACTIVATION_RETRY != ARBITRARY_EXCEPTION_SWALLOWING/);
assert.match(preregistration, /STOP THE CURRENT PREACTIVATION SUBLINE/);
assert.match(preregistration, /NO 𝄐 YET/);
assert.match(preregistration, /Western Horizon remains at official empirical-shore research rest/);

console.log('A2-A5 preactivation retry-class discrimination hostile contract: PASS');
