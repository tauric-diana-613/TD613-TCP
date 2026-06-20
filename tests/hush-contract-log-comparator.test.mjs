import assert from 'node:assert/strict';
import {
  compareProviderTarget,
  compareDispatch,
  comparePayload,
  comparePrivacy,
  compareRefusal,
  compareSafety,
  compareRelease,
  routeStylometryAudit,
  routeAdversarialAudit,
  compareEoRfdRoute,
  aggregateContractLogComparison
} from '../app/engine/hush-contract-log-comparator.js';

function contract(overrides = {}) {
  return {
    provider_target: { provider_class: 'openai', model_name: 'gpt-test', endpoint_class: 'responses' },
    mask_context: { discourse_mode: 'legal-forensic', retrieval_trigger: 'baseline-voice' },
    release_discipline: { provider_dispatch_allowed: true, release_class: 'provider-ready' },
    claim_limits: { not_identity_proof: true },
    refusal_policy: { must_refuse_if: ['asks-for-identity-proof'] },
    private_text_policy: { raw_user_text_exported: false, raw_customizer_samples_exported: false, raw_mask_material_exported: false, provider_payload_contains_private_text: false },
    instruction_contract: { raw_prompt_exported: false },
    stylometry_constraints: { stylometry_engine: 'tcp-stylometry' },
    adversarial_constraints: { enabled: true },
    eo_rfd_route_state: { firmware_status: 'interface-only', route_conscience_hook: 'required' },
    ...overrides
  };
}
function log(overrides = {}) {
  return {
    provider_target_observed: { provider_class: 'openai', model_name: 'gpt-test', endpoint_class: 'responses' },
    dispatch_observation: { dispatch_attempted: true, dispatch_status: 'sent', operator_override_used: false },
    request_payload_observation: { claim_limits_sent: true, refusal_policy_sent: true, discourse_mode_sent: true, retrieval_trigger_sent: true, raw_prompt_sent: false, raw_customizer_samples_sent: false, raw_mask_material_sent: false, private_text_sent: false },
    response_observation: { contains_provider_refusal_language: false, contains_private_text_echo: false },
    refusal_observation: { refusal_detected: false, refusal_source: 'none', refusal_reason_summary: null, unexpected_refusal_possible: false },
    redaction_profile: { private_text_echo_detected: false },
    safety_event_profile: { safety_event_detected: false, content_filter_triggered: false, policy_refusal_triggered: false, provider_warning_present: false },
    provider_log_release_discipline: { release_class: 'audit-ready' },
    stylometry_observation_seed: { candidate_drift_flags: [] },
    adversarial_observation_seed: { attack_surfaces: ['overfit'] },
    eo_rfd_route_observation: { firmware_status: 'interface-only', route_conscience_hook_observed: 'required', firmware_adapter_verified: false, operator_note: 'interface only' },
    ...overrides
  };
}

assert.equal(compareProviderTarget(contract(), log()).status, 'aligned');
assert.equal(compareProviderTarget(contract(), log({ provider_target_observed: { provider_class: 'gemini', model_name: 'gpt-test', endpoint_class: 'responses' } })).status, 'provider-target-drift');
assert.equal(compareProviderTarget(contract(), log({ provider_target_observed: { provider_class: 'openai', model_name: 'gpt-other', endpoint_class: 'responses' } })).status, 'model-drift');
assert.equal(compareProviderTarget(contract(), log({ provider_target_observed: { provider_class: 'openai', model_name: 'gpt-test', endpoint_class: 'chat' } })).status, 'endpoint-drift');

assert.equal(compareDispatch(contract(), log()).status, 'aligned');
assert.equal(compareDispatch(contract({ release_discipline: { provider_dispatch_allowed: false, release_class: 'local-contract' } }), log()).status, 'unauthorized-dispatch');
assert.equal(compareDispatch(contract(), log({ dispatch_observation: { dispatch_attempted: false, dispatch_status: 'blocked-before-send' } })).status, 'blocked-before-send');
assert.equal(compareDispatch(contract(), log({ dispatch_observation: { dispatch_attempted: true, dispatch_status: 'timeout' } })).status, 'timeout');

assert.equal(comparePayload(contract(), log()).status, 'aligned');
assert.equal(comparePayload(contract(), log({ request_payload_observation: { claim_limits_sent: false, refusal_policy_sent: true, discourse_mode_sent: true, retrieval_trigger_sent: true } })).status, 'missing-claim-limits');
assert.equal(comparePayload(contract(), log({ request_payload_observation: { claim_limits_sent: true, refusal_policy_sent: false, discourse_mode_sent: true, retrieval_trigger_sent: true } })).status, 'missing-refusal-policy');
assert.equal(comparePayload(contract(), log({ request_payload_observation: { claim_limits_sent: true, refusal_policy_sent: true, discourse_mode_sent: false, retrieval_trigger_sent: true } })).status, 'missing-mode-or-trigger');

assert.equal(comparePrivacy(contract(), log()).status, 'aligned');
assert.equal(comparePrivacy(contract(), log({ request_payload_observation: { ...log().request_payload_observation, raw_prompt_sent: true } })).status, 'raw-prompt-breach');
assert.equal(comparePrivacy(contract(), log({ request_payload_observation: { ...log().request_payload_observation, raw_customizer_samples_sent: true } })).status, 'raw-corpus-breach');
assert.equal(comparePrivacy(contract(), log({ request_payload_observation: { ...log().request_payload_observation, raw_mask_material_sent: true } })).status, 'raw-corpus-breach');
assert.equal(comparePrivacy(contract(), log({ request_payload_observation: { ...log().request_payload_observation, private_text_sent: true } })).status, 'private-text-review');
assert.equal(comparePrivacy(contract(), log({ response_observation: { contains_private_text_echo: true }, redaction_profile: { private_text_echo_detected: true } })).status, 'private-echo-breach');

assert.equal(compareRefusal(contract(), log()).status, 'no-refusal');
assert.equal(compareRefusal(contract(), log({ refusal_observation: { refusal_detected: true, refusal_source: 'provider', refusal_reason_summary: 'safety', unexpected_refusal_possible: false } })).status, 'expected-refusal-possible');
assert.equal(compareRefusal(contract(), log({ refusal_observation: { refusal_detected: true, refusal_source: 'provider', refusal_reason_summary: 'unexpected', unexpected_refusal_possible: true } })).status, 'unexpected-refusal-review');
assert.equal(compareRefusal({ ...contract(), refusal_policy: null }, log()).status, 'refusal-policy-missing');

assert.equal(compareSafety(contract(), log()).status, 'no-safety-event');
assert.equal(compareSafety(contract(), log({ safety_event_profile: { safety_event_detected: true, content_filter_triggered: false, policy_refusal_triggered: false, provider_warning_present: false } })).status, 'safety-review');
assert.equal(compareSafety(contract(), log({ safety_event_profile: { safety_event_detected: true, content_filter_triggered: true, policy_refusal_triggered: false, provider_warning_present: false } })).status, 'filtered');
assert.equal(compareSafety(contract(), log({ safety_event_profile: { safety_event_detected: false, content_filter_triggered: false, policy_refusal_triggered: false, provider_warning_present: true } })).status, 'provider-warning');

assert.equal(compareRelease(contract(), log(), ['aligned']).status, 'ready-for-audit');
assert.equal(compareRelease(contract({ release_discipline: { provider_dispatch_allowed: true, release_class: 'operator-review' } }), log(), ['aligned']).status, 'review-required');
assert.equal(compareRelease(contract(), log({ provider_log_release_discipline: { release_class: 'blocked' } }), ['aligned']).status, 'blocked');

assert.equal(routeStylometryAudit(contract(), log()).status, 'audit-required');
assert.equal(routeAdversarialAudit(contract(), log()).status, 'audit-required');
assert.equal(routeStylometryAudit(contract(), log({ stylometry_observation_seed: null })).status, 'missing-seed-review');
assert.equal(routeAdversarialAudit(contract(), log({ adversarial_observation_seed: null })).status, 'missing-seed-review');

assert.equal(compareEoRfdRoute(contract(), log()).status, 'aligned-interface');
assert.equal(compareEoRfdRoute(contract(), log({ eo_rfd_route_observation: { firmware_status: 'firmware-attached', route_conscience_hook_observed: 'required', firmware_adapter_verified: false } })).status, 'firmware-claim-blocked');
assert.equal(compareEoRfdRoute(contract(), log({ eo_rfd_route_observation: { firmware_status: 'interface-only', route_conscience_hook_observed: 'optional', firmware_adapter_verified: false } })).status, 'route-review');

const aligned = aggregateContractLogComparison({ provider_target_comparison: compareProviderTarget(contract(), log()), dispatch_comparison: compareDispatch(contract(), log()), payload_comparison: comparePayload(contract(), log()), privacy_comparison: comparePrivacy(contract(), log()), refusal_comparison: compareRefusal(contract(), log()), safety_comparison: compareSafety(contract(), log()), eo_rfd_route_comparison: compareEoRfdRoute(contract(), log()), stylometry_audit_routing: routeStylometryAudit(contract(), log()), adversarial_audit_routing: routeAdversarialAudit(contract(), log()) });
assert.equal(aligned.status, 'aligned');
assert.ok(aligned.audit_routes.includes('stylometry'));
assert.ok(aligned.audit_routes.includes('adversarial'));

assert.equal(aggregateContractLogComparison({ provider_target_comparison: compareProviderTarget(contract(), log({ provider_target_observed: { provider_class: 'gemini', model_name: 'gpt-test', endpoint_class: 'responses' } })) }).status, 'drift-detected');
assert.equal(aggregateContractLogComparison({ privacy_comparison: comparePrivacy(contract(), log({ request_payload_observation: { ...log().request_payload_observation, raw_prompt_sent: true } })) }).status, 'breach-detected');
assert.equal(aggregateContractLogComparison({ safety_comparison: compareSafety(contract(), log({ safety_event_profile: { safety_event_detected: true, content_filter_triggered: false, policy_refusal_triggered: false, provider_warning_present: false } })) }).status, 'review-required');

console.log('hush-contract-log-comparator: ok');
