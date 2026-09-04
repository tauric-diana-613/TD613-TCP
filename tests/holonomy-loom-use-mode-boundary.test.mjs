import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixture = JSON.parse(
  fs.readFileSync('tests/fixtures/pedagogue/holonomy-loom-use-mode-boundary.json', 'utf8')
);

assert.equal(fixture.schema, 'td613.holonomy-loom.use-mode-boundary/v0.1');
assert.equal(fixture.issue, 1038);

assert.deepEqual(
  fixture.cross_mode_invariants.mandatory_route,
  ['SEE', 'CHECK', 'UNDERSTAND', 'REST']
);
assert.equal(fixture.cross_mode_invariants.name_explanation_optional, true);
assert.equal(fixture.cross_mode_invariants.deterministic_policy_owns_loom_release, true);
assert.equal(fixture.cross_mode_invariants.remote_model_advisory_only, true);
assert.equal(fixture.cross_mode_invariants.green_means_zero_privacy_risk, false);
assert.equal(fixture.cross_mode_invariants.resemblance_proves_provenance, false);
assert.equal(fixture.cross_mode_invariants.portable_shell_implies_portable_guarantee, false);
assert.equal(fixture.cross_mode_invariants.same_policy_implies_same_trust_boundary, false);

const gemini = fixture.gemini_advisory_boundary;
assert.equal(gemini.key_reference, 'process.env.GEMINI_API_KEY');
assert.equal(gemini.real_key_committed_in_repository, false);
assert.equal(gemini.client_receives_key, false);
assert.equal(gemini.default_deterministic_check_invokes_provider, false);
assert.equal(gemini.provider_disclosure_before_transmission, true);
assert.equal(gemini.raw_draft_sent_by_default, false);
assert.equal(gemini.provider_result_has_release_authority, false);
assert.equal(gemini.rewrite_selected_text_requires_explicit_human_action, true);
assert.equal(gemini.semantic_second_look_requires_explicit_human_action, true);
assert(!gemini.explain_finding_payload.includes('raw_draft'));

const modes = new Map(fixture.modes.map((mode) => [mode.id, mode]));
assert.equal(modes.size, 5);

const local = modes.get('LOCAL_POCKET');
assert(local);
assert.equal(local.host_platform_has_received_raw_draft_before_check, false);
assert.equal(local.remote_network_required_for_default_check, false);
assert.equal(local.remote_model_required_for_default_check, false);
assert.equal(local.pre_ingress_protection_authority_for_next_remote_destination, true);
assert.equal(local.onward_release_control, true);
assert.equal(local.provider_call_default, false);
assert.equal(local.raw_conversation_content_portable_by_default, false);

const hosted = modes.get('TD613_HOSTED');
assert(hosted);
assert.equal(hosted.raw_draft_default_location, 'BROWSER_LOCAL_LAYER0');
assert.equal(hosted.host_platform_has_received_raw_draft_before_check, false);
assert.equal(hosted.remote_model_required_for_default_check, false);
assert.equal(hosted.provider_call_default, false);
assert(hosted.forbidden_claims.includes('TD613 server receives raw draft by default'));
assert(hosted.forbidden_claims.includes('Gemini owns release authority'));

const chatgpt = modes.get('CHATGPT_THREAD_COMPANION');
assert(chatgpt);
assert.equal(chatgpt.host_platform_has_received_raw_draft_before_check, true);
assert.equal(chatgpt.pre_ingress_protection_authority_for_next_remote_destination, false);
assert.equal(chatgpt.onward_release_control, true);
assert.equal(chatgpt.raw_conversation_content_portable_by_default, false);
assert(
  chatgpt.forbidden_claims.includes(
    'the AIA prevented ChatGPT from receiving a message already sent into the thread'
  )
);
assert(chatgpt.forbidden_claims.includes('private thread equals offline custody'));
assert(chatgpt.forbidden_claims.includes('in-thread control equals platform-wide privacy'));

const portable = modes.get('PORTABLE_POLICY_PROFILE');
assert(portable);
assert.equal(portable.raw_draft_default_location, 'NOT_INCLUDED');
assert.equal(portable.raw_conversation_content_portable_by_default, false);
assert(portable.portable_default_fields.includes('rule_ids'));
assert(portable.portable_default_fields.includes('claim_ceiling'));
assert(!portable.portable_default_fields.includes('raw_conversation'));
assert(
  portable.forbidden_claims.includes(
    'current Ash Capsule public envelope is admitted for real kiki storage'
  )
);

const future = modes.get('FUTURE_PRE_SEND_HOOK');
assert(future);
assert.equal(future.admitted_now, false);
assert.equal(future.host_platform_has_received_raw_draft_before_check, null);
assert.equal(future.pre_ingress_protection_authority_for_next_remote_destination, false);
assert(future.required_future_witnesses.includes('execution_before_network_ingress'));
assert(future.forbidden_claims.includes('embedded implies pre-ingress'));
assert(future.forbidden_claims.includes('pre-send UI proves pre-send execution'));

for (const mode of fixture.modes) {
  assert.equal(mode.provider_call_default, false, `${mode.id} silently invokes a provider`);
  assert.equal(
    mode.raw_conversation_content_portable_by_default,
    false,
    `${mode.id} silently makes raw conversation content portable`
  );
}

console.log('Holonomy Loom use-mode boundary design gate: PASS');
