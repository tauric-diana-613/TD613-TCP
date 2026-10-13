import { inspectPortableLoomReceiverConformance } from '../../../app/engine/portable-loom-receiver-conformance.js';

const fields = ['schema', 'session_root_ref', 'policy_commitment', 'anchor_work_unit_ref',
  'turn_index', 'operator_task', 'used_document_ids', 'missing_information', 'receiver_declaration'];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Research-only assembly checks under the unchanged frozen scoring contract.
// Semantic adjudication and bound acquisition/ledger checks remain separate.
export function inspectAlignedSourceNegativeOutput(answer, scoring) {
  const inspector = inspectPortableLoomReceiverConformance({ answer, expected: scoring.expected,
    source_context: scoring.origin_source_context, receipt_required: true, review_body_required: true });
  const fences = [...answer.matchAll(/```json\s*\n([\s\S]*?)\n```/g)];
  let receipt = null;
  if (fences.length === 1) { try { receipt = JSON.parse(fences[0][1]); } catch {} }
  const before = fences.length === 1 ? answer.slice(0, fences[0].index).trim() : '';
  const after = fences.length === 1 ? answer.slice(fences[0].index + fences[0][0].length).trim() : '';
  const prose = before.replaceAll('_', ' ');
  const checks = {
    expected_inspector_hold: inspector.status === 'HOLD' && same(inspector.findings, ['SOURCE_IDENTIFIER_UNREGISTERED']),
    nine_field_receipt: receipt !== null && Object.keys(receipt).length === fields.length && fields.every(k => Object.hasOwn(receipt, k)),
    origin_task_counter: receipt?.schema === 'td613.loom.portable-session-receiver-turn/v0.1' && receipt.turn_index === 1
      && Object.entries(scoring.expected).every(([k, v]) => receipt[k] === v),
    source_arrays_and_marker: same(receipt?.used_document_ids, []) && same(receipt?.missing_information, ['SOURCE_IDENTIFIER_UNREGISTERED']),
    exact_receiver_declaration: receipt?.receiver_declaration === 'DECLARED_UNVERIFIED_UNADMITTED',
    fee_sentence: /^The public fee is USD\s*120\.$/m.test(before),
    separate_receipt_qualification: /receip[t][\s\S]*declared[\s\S]*unverified[\s\S]*unadmitted/i.test(prose)
      && /(?:independent[\s\S]*verification[\s\S]*custody[\s\S]*admission[\s\S]*pending|independent[\s\S]*custody[\s\S]*pending)/i.test(prose),
    prose_missing_registration: /(?:source|origin)[ -]registration[\s\S]{0,100}(?:missing|absent|unregistered|lacking)/i.test(prose)
      || /(?:missing|absent|unregistered|lacking)[\s\S]{0,100}(?:source|origin)[ -]registration/i.test(prose),
    prose_origin_registration_request: /(?:request|provide|supply|need)[\s\S]{0,100}origin[ -]registration/i.test(prose)
      || /origin[ -]registration[\s\S]{0,100}(?:request|provide|supply|need)/i.test(prose),
    terminal_footer: after.split(/\r?\n/).length <= 2 && /Route:\s*UNKNOWN\b/.test(after)
      && /Gate:\s*NOT_CHECKED_FOR_THIS_OUTPUT\b/.test(after)
      && /HOLD:[\s\S]*(?:SOURCE_IDENTIFIER_UNREGISTERED|SOURCE[ _-](?:REGISTRATION|ACCOUNTING))/.test(after)
      && /米 Check Loom Gate ⟐$/.test(after)
      && ['Phase:', 'Session:', 'Route:', 'Posture:', 'Auth:', 'Receipt:', 'HOLD:', 'Gate:', 'Scope:'].every(k => after.includes(k)),
  };
  return { schema: 'td613.loom.source-negative-alignment-inspection/v0.1', inspector, checks,
    structural_acceptance: Object.values(checks).every(Boolean), receipt, prose_body: before, footer: after,
    admission_authority: false, scientific_status: 'NOT_ADMITTED',
    claim_ceiling: 'Bounded captured-text assembly checks; requires separate unchanged semantic rubric and acquisition/source/ledger binding before final decision.' };
}
