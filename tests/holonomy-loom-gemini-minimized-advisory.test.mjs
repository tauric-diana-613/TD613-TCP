import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixture = JSON.parse(
  fs.readFileSync('tests/fixtures/pedagogue/holonomy-loom-gemini-minimized-advisory.json', 'utf8')
);

assert.equal(fixture.schema, 'td613.holonomy-loom.gemini-minimized-advisory/v0.1');
assert.equal(fixture.issue, 1038);
assert.equal(fixture.parent_pr, 1040);
assert.equal(fixture.status, 'DESIGN_GATE_ONLY');

const provider = fixture.provider_boundary;
assert.equal(provider.provider, 'GEMINI');
assert.equal(provider.key_reference, 'process.env.GEMINI_API_KEY');
assert.equal(provider.real_key_committed_in_repository, false);
assert.equal(provider.client_receives_key, false);
assert.equal(provider.default_deterministic_check_invokes_provider, false);
assert.equal(provider.provider_disclosure_before_transmission, true);
assert.equal(provider.explicit_human_action_required, true);
assert.equal(provider.provider_result_has_release_authority, false);
assert.equal(provider.provider_result_can_override_deterministic_rule, false);

const hazard = fixture.repository_integration_hazard;
assert.equal(hazard.observed_source_path, 'server/khonapolit-quality.js');
assert.deepEqual(hazard.observed_conversational_builder_fields, ['packet.history', 'packet.message']);
assert.equal(hazard.direct_conversational_payload_reuse_for_explain_finding, false);
const khonapolitSource = fs.readFileSync(hazard.observed_source_path, 'utf8');
assert(
  khonapolitSource.includes('packet.history.map'),
  'repository-observed Kʰonapolit history assembly moved; re-adjudicate Loom integration hazard'
);
assert(
  khonapolitSource.includes("parts: [{ text: packet.message }]") ||
    khonapolitSource.includes("parts: [{ text: packet.message }]"),
  'repository-observed Kʰonapolit message assembly moved; re-adjudicate Loom integration hazard'
);
assert(
  hazard.required_future_boundary.includes('action-specific server-side validator/projector')
);

const projection = fixture.explain_finding_projection;
assert.equal(projection.action, 'EXPLAIN_FINDING');
assert.equal(projection.raw_draft_sent, false);
assert.equal(projection.raw_match_sent, false);
assert.equal(projection.conversation_history_sent, false);
assert.equal(projection.selected_text_sent, false);
assert.equal(projection.span_coordinates_sent, false);

const forbidden = new Set(projection.forbidden_payload_fields);
for (const field of ['raw_draft', 'raw_match', 'matched_value', 'selected_text', 'conversation_history', 'raw_thread', 'span_start', 'span_end']) {
  assert(forbidden.has(field), `missing forbidden EXPLAIN_FINDING field: ${field}`);
}

function projectExplainFinding({ finding, routeMode }) {
  return Object.freeze({
    schema: 'td613.holonomy-loom.provider-advisory-request/v0.1',
    action: 'EXPLAIN_FINDING',
    rule_id: finding.rule_id,
    evidence_class: finding.evidence_class,
    action_class: finding.action_class,
    minimized_context: Object.freeze({
      finding_category: finding.finding_category,
      why_class: finding.why_class,
      route_mode: routeMode
    }),
    claim_ceiling: 'Provider explanation is advisory only and cannot alter deterministic Loom release policy.'
  });
}

const syntheticFinding = Object.freeze({
  rule_id: 'COMMON_API_KEY_BLOCK',
  evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
  action_class: 'REMOVE',
  finding_category: 'credential-like token',
  why_class: 'credential_access_risk',
  raw_draft: `hello ${fixture.hostile_projection_canary.raw_draft_canary}`,
  matched_value: fixture.hostile_projection_canary.raw_match_canary,
  conversation_history: ['prior raw turn'],
  span_start: 6,
  span_end: 52
});

const projected = projectExplainFinding({
  finding: syntheticFinding,
  routeMode: 'TD613_HOSTED'
});

assert.deepEqual(Object.keys(projected), projection.allowed_payload_fields);
assert.deepEqual(
  Object.keys(projected.minimized_context),
  projection.minimized_context_allowed_fields
);

const serialized = JSON.stringify(projected);
assert.equal(serialized.includes(fixture.hostile_projection_canary.raw_draft_canary), false);
assert.equal(serialized.includes(fixture.hostile_projection_canary.raw_match_canary), false);
assert.equal(serialized.includes('prior raw turn'), false);
assert.equal(serialized.includes('span_start'), false);
assert.equal(serialized.includes('span_end'), false);
assert.equal(fixture.hostile_projection_canary.expected_in_projected_payload, false);

for (const key of Object.keys(projected)) {
  assert(
    projection.allowed_payload_fields.includes(key),
    `projected EXPLAIN_FINDING packet widened unexpectedly with ${key}`
  );
}

const rewrite = fixture.other_provider_actions.REWRITE_SELECTED_TEXT;
assert.equal(rewrite.admitted_in_this_chamber, false);
assert.equal(rewrite.requires_explicit_human_action, true);
assert.equal(rewrite.requires_pre_transmission_disclosure, true);
assert.equal(rewrite.may_include_only_user_selected_or_already_minimized_text, true);
assert.equal(rewrite.raw_thread_history_default, false);

const semantic = fixture.other_provider_actions.SEMANTIC_SECOND_LOOK;
assert.equal(semantic.admitted_in_this_chamber, false);
assert.equal(semantic.requires_explicit_human_action, true);
assert.equal(semantic.requires_pre_transmission_disclosure, true);
assert.equal(semantic.raw_thread_history_default, false);
assert.equal(semantic.deterministic_release_authority, false);

const chatgpt = fixture.chatgpt_thread_companion_boundary;
assert.equal(chatgpt.mode, 'CHATGPT_THREAD_COMPANION');
assert.equal(chatgpt.host_platform_has_received_already_sent_thread_content, true);
assert.equal(chatgpt.pre_ingress_secrecy_claim_allowed, false);
assert.equal(chatgpt.onward_release_control, true);
assert.equal(chatgpt.external_provider_call_must_be_disclosed, true);
assert.equal(chatgpt.raw_prior_thread_content_portable_by_default, false);
assert.equal(chatgpt.portable_policy_profile_may_travel_without_raw_thread, true);

assert.equal(
  fixture.portable_policy_profile.raw_conversation_content_included_by_default,
  false
);
assert(!fixture.portable_policy_profile.default_fields.includes('raw_conversation'));
assert(!fixture.portable_policy_profile.default_fields.includes('raw_thread'));

assert(fixture.claim_ceiling.includes('no Gemini network call performed'));
assert(fixture.claim_ceiling.includes('no ChatGPT app or plugin implemented'));
assert(fixture.claim_ceiling.includes('no pre-ingress ChatGPT secrecy claim'));

console.log('Holonomy Loom minimized Gemini advisory design gate: PASS');
