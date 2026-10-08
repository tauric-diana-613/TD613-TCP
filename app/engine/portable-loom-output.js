export const LOOM_GATE_LABEL = '米 Check Loom Gate';
export const LOOM_GATE_HREF = 'https://td613.com/dome-world/holonomy-loom.html#loomGate';
export const PORTABLE_LOOM_OUTPUT_RULE = 'During an active Loom session, every assistant output carries a compact Loom footer: phase, minimized session/explicit route label, governance posture, authorization state, receipt availability, HOLD status, Gate status and checked scope, and 米 Check Loom Gate. Unknown coordinates stay UNKNOWN; an earlier send never grants fresh authorization. Use only a shortened public session identifier and an explicitly selected route label, never hashes, secrets or payloads. A lone 米 requests Gate review. Gate outputs also show their evidence basis and How do I know? 下; a lone 下 requests the actual methods and full expert nomenclature. Preserve unresolved alerts until separately resolved; opening either review does not clear a finding, run a check, or admit work. Never invent conversation coverage or foreign enforcement. A missing footer is an observable protocol omission, not successful governance.';

// Receiver-neutral governance; presentation bindings never imply enforcement.
export const PORTABLE_LOOM_OUTPUT_PROTOCOL = Object.freeze({
  schema: 'td613.loom.output-footer/v0.2', rule: PORTABLE_LOOM_OUTPUT_RULE,
  lifetime: 'ACTIVE_SESSION_INCLUDING_CONTINUATIONS_AND_REST',
  fields: Object.freeze(['session_phase', 'session_label', 'route_label', 'governance_posture', 'authorization_state', 'receipt_status', 'hold_status', 'gate_status', 'checked_scope', 'gate_action']),
  missing_footer: 'PROTOCOL_OMISSION_OBSERVED; ENFORCEMENT_UNKNOWN',
  unknown_coordinates: 'UNKNOWN; NEVER_INFER_AUTHORIZATION_OR_RECEIPTS_FROM_PRESENTATION',
  gate_action: Object.freeze({ label: LOOM_GATE_LABEL, command: '米', command_match: 'TRIMMED_WHOLE_USER_MESSAGE', href: LOOM_GATE_HREF }),
  default_gate_status: 'NOT_CHECKED_FOR_THIS_OUTPUT',
  gate_output: Object.freeze({ footer: 'REGULAR_LOOM_FOOTER_PLUS_CHECKED_SCOPE_EVIDENCE_BASIS_AND_METHOD_DISCLOSURE', explanation_label: 'How do I know? 下', command: '下', command_match: 'TRIMMED_WHOLE_USER_MESSAGE_DURING_ACTIVE_LOOM', behavior: 'Explain the actual verifier, capture scope, evidence class, references, missingness and expert nomenclature. Disclosure does not run a new check or clear findings.' }),
  alerts: 'RETAIN_UNRESOLVED_FINDINGS_WITH_REGISTERED_SCOPE; REVIEW_ACKNOWLEDGMENT_IS_PRESENTATION_ONLY',
  prose: 'Append a concise footer ending in ⟐. Display reference details on request, not in every footer.',
  structured_return: 'Preserve the exact return schema. Put the plain-text footer inside the existing answer string before computing its answer digest; do not append bytes outside the JSON. A host-rendered footer may instead sit outside the custody source.',
  command_behavior: 'Open an available Gate review without a model request. Without a local Gate capability, explain how to collect declared captures and follow the Gate link. Report NOT_RUN until a verifier actually supplies a result.',
  receiver_scope: 'ANY_LLM; INSTRUCTION_ONLY_UNTIL_OBSERVED',
  first_receiver_binding: Object.freeze({ receiver: 'ChatGPT', surface: 'PLAIN_TEXT_OR_MARKDOWN', action: 'LINK_AND_USER_COMMAND', observation_status: 'FORMAT_CONTRACT_ONLY; MODEL_COMPLIANCE_NOT_OBSERVED' }),
  marrowline_binding: Object.freeze({ surface: 'LOOM_DEMO_ONLY', action: 'LOCAL_GATE_TAB', attention: 'PULSE_UNTIL_REVIEW_OPENED; STATIC_GLOW_WITH_REDUCED_MOTION', source_bytes_rewritten: false })
});

export function portableLoomFooterText({ phase = 'ACTIVE', sessionLabel = 'UNKNOWN', routeLabel = 'UNSELECTED', governancePosture = 'INSTRUCTION_ONLY', authorizationState = 'UNKNOWN', receiptStatus = 'UNKNOWN', holdStatus = 'UNKNOWN', gateStatus = 'NOT_CHECKED_FOR_THIS_OUTPUT', checkedScope = 'this output' } = {}) {
  // These are presentation labels, never authentication or capabilities. Refuse
  // arbitrary payloads/digests rather than truncating secret content into a label.
  const label = (value, max = 40) => typeof value === 'string' && value.length <= max && /^[A-Za-z0-9_ /-]+$/.test(value) && !/[a-f0-9]{32}/i.test(value) ? value : 'UNKNOWN';
  return `𝌋 Loom · ${label(phase)} · ${label(sessionLabel, 12)}/${label(routeLabel)} · ${label(governancePosture)} · Auth: ${label(authorizationState)} · Receipt: ${label(receiptStatus)} · HOLD: ${label(holdStatus)} · Gate: ${label(gateStatus)} (${label(checkedScope, 80)}) · ${LOOM_GATE_LABEL} ⟐`;
}
