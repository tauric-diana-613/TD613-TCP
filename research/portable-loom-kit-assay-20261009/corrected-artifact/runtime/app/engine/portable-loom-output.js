export const LOOM_GATE_LABEL = '米 Check Loom Gate';
export const LOOM_GATE_HREF = 'https://td613.com/dome-world/holonomy-loom.html#loomGate';
export const PORTABLE_LOOM_OUTPUT_RULE = 'Every active-session output, including Rest, carries a compact footer of at most two logical lines: phase, minimized session/explicit route, posture, authorization, receipt, HOLD, Gate status/scope, and plain-text 米 Check Loom Gate. Unknowns stay UNKNOWN; earlier sending grants no fresh authority. Keep hashes, secrets and payloads out of footers. A lone 米 requests evidence review here and supplies the user choice. Distinguish facts, declarations, inferred risks and missing evidence; verification stays NOT_RUN without an actual verifier result. Never hyperlink the primary command or substitute a redirect for review. Optional manual verification has no automatic chat access; material transfer requires its own choice. Gate reports offer How do I know? 下; 下 explains actual methods and expert nomenclature. Preserve unresolved alerts; review grants no sending, admission or invented verification. Missing footers are protocol omissions; foreign enforcement remains unproved.';

// Receiver-neutral governance; presentation bindings never imply enforcement.
export const PORTABLE_LOOM_OUTPUT_PROTOCOL = Object.freeze({
  schema: 'td613.loom.output-footer/v0.3', rule: PORTABLE_LOOM_OUTPUT_RULE,
  lifetime: 'ACTIVE_SESSION_INCLUDING_CONTINUATIONS_AND_REST',
  fields: Object.freeze(['session_phase', 'session_label', 'route_label', 'governance_posture', 'authorization_state', 'receipt_status', 'hold_status', 'gate_status', 'checked_scope', 'gate_action']),
  missing_footer: 'PROTOCOL_OMISSION_OBSERVED; ENFORCEMENT_UNKNOWN',
  unknown_coordinates: 'UNKNOWN; NEVER_INFER_AUTHORIZATION_OR_RECEIPTS_FROM_PRESENTATION',
  gate_action: Object.freeze({ label: LOOM_GATE_LABEL, command: '米', command_match: 'TRIMMED_WHOLE_USER_MESSAGE', surface: 'RECEIVING_CONVERSATION', presentation: 'PLAIN_TEXT_COMMAND', invocation: 'USER_COMMAND_REQUESTS_REVIEW; NO_ADDITIONAL_REVIEW_PERMISSION' }),
  manual_verification: Object.freeze({ label: 'Optional manual verification in the originating Loom', href: LOOM_GATE_HREF, automatic_conversation_access: false, automatic_material_transfer: false, transfer_requires_explicit_choice: true, link_is_verification_result: false }),
  default_gate_status: 'NOT_CHECKED_FOR_THIS_OUTPUT',
  gate_output: Object.freeze({ footer: 'REGULAR_LOOM_FOOTER_PLUS_CHECKED_SCOPE_EVIDENCE_BASIS_AND_METHOD_DISCLOSURE', report_fields: Object.freeze(['review_status','evidence_sources','selected_material','authorized_material','observed_boundary_transmissions','destination_identity','verification_results','receipt_references','custody_and_route_continuity','observed_disclosures','inferred_reconstruction_risks','missing_evidence','observation_boundaries','claim_ceiling','next_verification_action']), verification_status_without_verifier: 'NOT_RUN', reconstruction_without_probe_evidence: 'UNMEASURED; RISK_INFERENCE_IS_NOT_AN_OBSERVED_ATTEMPT', explanation_label: 'How do I know? 下', command: '下', command_match: 'TRIMMED_WHOLE_USER_MESSAGE_DURING_ACTIVE_LOOM', behavior: 'Explain the actual review methods, any executed verifier, capture scope, evidence class, references, missingness and expert nomenclature. Disclosure does not run a new check or clear findings.' }),
  alerts: 'RETAIN_UNRESOLVED_FINDINGS_WITH_REGISTERED_SCOPE; REVIEW_ACKNOWLEDGMENT_IS_PRESENTATION_ONLY',
  prose: 'Append one compact paragraph of at most two logical lines ending in ⟐. Keep 米 Check Loom Gate as plain text. Display reference details on request, not in every footer.',
  activation_presentation: Object.freeze({ ask_for: 'CURRENT_TASK_AND_EXPLICIT_SOURCE_SELECTION', route_catalogue: 'ON_REQUEST; KEEP_UNKNOWN_UNTIL_SELECTED', receipt: 'NOT_CREATED_FOR_ACTIVATION; CREATE_FOR_PROCEEDING_TASK_ANSWERS', held_task_does_not_block_gate_review: true }),
  structured_return: 'Preserve the exact return schema. Put the plain-text footer inside the existing answer string before computing its answer digest; do not append bytes outside the JSON. A host-rendered footer may instead sit outside the custody source.',
  command_behavior: 'Respond to 米 with an evidence review in the receiving conversation using only available evidence. Distinguish that receiver-generated review from executable verification and missing provider telemetry. Preserve NOT_RUN for unavailable verification. Offer an optional, separately labelled manual verification destination and capture instructions when useful; do not redirect as the whole report, claim automatic chat access, send material or invent a receipt.',
  receiver_scope: 'ANY_LLM; INSTRUCTION_ONLY_UNTIL_OBSERVED',
  first_receiver_binding: Object.freeze({ receiver: 'ChatGPT', surface: 'PLAIN_TEXT_OR_MARKDOWN', action: 'IN_CONVERSATION_USER_COMMAND', observation_status: 'FORMAT_CONTRACT_ONLY; MODEL_COMPLIANCE_NOT_OBSERVED' }),
  marrowline_binding: Object.freeze({ surface: 'LOOM_DEMO_ONLY', action: 'LOCAL_GATE_TAB', attention: 'PULSE_UNTIL_REVIEW_OPENED; STATIC_GLOW_WITH_REDUCED_MOTION', source_bytes_rewritten: false })
});

export function portableLoomFooterText({ phase = 'ACTIVE', sessionLabel = 'UNKNOWN', routeLabel = 'UNSELECTED', governancePosture = 'INSTRUCTION_ONLY', authorizationState = 'UNKNOWN', receiptStatus = 'UNKNOWN', holdStatus = 'UNKNOWN', gateStatus = 'NOT_CHECKED_FOR_THIS_OUTPUT', checkedScope = 'NONE' } = {}) {
  // These are presentation labels, never authentication or capabilities. Refuse
  // arbitrary payloads/digests rather than truncating secret content into a label.
  const label = (value, max = 40) => typeof value === 'string' && value.length <= max && /^[A-Za-z0-9_ /-]+$/.test(value) && !/[a-f0-9]{32}/i.test(value) ? value : 'UNKNOWN';
  return `𝌋 Loom · ${label(phase)} · ${label(sessionLabel, 12)}/${label(routeLabel)} · ${label(governancePosture)} · Auth: ${label(authorizationState)} · Receipt: ${label(receiptStatus)} · HOLD: ${label(holdStatus)} · Gate: ${label(gateStatus)} (${label(checkedScope, 80)}) · ${LOOM_GATE_LABEL} ⟐`;
}
