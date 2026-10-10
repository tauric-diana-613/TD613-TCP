// Offline declaration inspection only. Callers supply origin evidence separately;
// receiver prose cannot register a source, authenticate itself, or admit work.
export const LOOM_DECLARED_RECEIPT_STATUS = 'DECLARED_UNVERIFIED_UNADMITTED';
export const LOOM_UNREGISTERED_SOURCE_MARKER = 'SOURCE_IDENTIFIER_UNREGISTERED';
const SCHEMA = 'td613.loom.portable-session-receiver-turn/v0.1';
const FIELDS = ['schema', 'session_root_ref', 'policy_commitment', 'anchor_work_unit_ref',
  'turn_index', 'operator_task', 'used_document_ids', 'missing_information', 'receiver_declaration'];
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
function snapshot(value, depth = 0, budget = { nodes: 0, characters: 0 }, ancestors = new Set()) {
  if (++budget.nodes > 1000 || depth > 8) throw new TypeError('Conformance input exceeds its structural bound.');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    budget.characters += value.length;
    if (budget.characters > 200000) throw new TypeError('Conformance input exceeds its text bound.');
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object' || ancestors.has(value)) throw new TypeError('Conformance input requires lossless JSON.');
  const array = Array.isArray(value), keys = Reflect.ownKeys(value);
  if (array ? Object.getPrototypeOf(value) !== Array.prototype || keys.length !== value.length + 1 || keys.slice(0, -1).some((k, i) => k !== String(i))
    : ![Object.prototype, null].includes(Object.getPrototypeOf(value)) || keys.some(k => typeof k !== 'string')) throw new TypeError('Conformance input requires plain objects and dense arrays.');
  const result = array ? [] : Object.create(null), branch = new Set(ancestors).add(value);
  for (const key of keys) {
    if (array && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) throw new TypeError('Conformance input forbids accessors and hidden fields.');
    result[key] = snapshot(descriptor.value, depth + 1, budget, branch);
  }
  return result;
}
const strings = (value, max) => Array.isArray(value) && value.length <= max
  && value.every(x => typeof x === 'string' && x.trim() && x.length <= 1000)
  && new Set(value).size === value.length;
const nonempty = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const equalSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const QUALIFICATION = /\b(?:UNVERIFIED|UNADMITTED|NOT[ -]+(?:INDEPENDENTLY[ -]+)?(?:VERIFIED|ADMITTED)|PENDING[ -]+(?:REVALIDATION|VERIFICATION))\b/gi;
const qualified = text => new RegExp(QUALIFICATION.source, 'i').test(text.replaceAll('_', ' '));
function claimsVerified(text) {
  const remaining = text.replaceAll('_', ' ').replace(QUALIFICATION, '');
  return /\b(?:VERIFIED|ADMITTED|AUTHENTICATED)\b/i.test(remaining);
}

export function inspectPortableLoomReceiverConformance(input) {
  const { answer, receipt = null, expected, source_context = null, receipt_required = true, review_body_required = false } = snapshot(input);
  if (!nonempty(answer, 180000) || typeof receipt_required !== 'boolean' || typeof review_body_required !== 'boolean') throw new TypeError('Bounded answer and Boolean inspection flags required.');
  if (!expected || !digest(expected.session_root_ref) || !digest(expected.policy_commitment)
    || !(expected.anchor_work_unit_ref === null || digest(expected.anchor_work_unit_ref))
    || !(expected.operator_task === null || nonempty(expected.operator_task, 12000))) throw new TypeError('Explicit origin root, policy, anchor and task observation required.');
  const findings = [], checks = {};
  const fail = code => findings.push(code);
  checks.receipt_shape = receipt !== null && !Array.isArray(receipt)
    && equalSet(Object.keys(receipt), FIELDS) && receipt.schema === SCHEMA
    && digest(receipt.session_root_ref) && digest(receipt.policy_commitment)
    && (receipt.anchor_work_unit_ref === null || digest(receipt.anchor_work_unit_ref))
    && Number.isSafeInteger(receipt.turn_index) && receipt.turn_index > 0
    && nonempty(receipt.operator_task, 12000) && strings(receipt.used_document_ids, 8)
    && strings(receipt.missing_information, 16) && nonempty(receipt.receiver_declaration, 2000);
  checks.task_binding_observed = expected.operator_task !== null;
  checks.reference_match = checks.receipt_shape && ['session_root_ref', 'policy_commitment', 'anchor_work_unit_ref'].every(k => receipt[k] === expected[k])
    && (expected.operator_task === null || receipt.operator_task === expected.operator_task);
  const lastLines = answer.trimEnd().split(/\r?\n/).slice(-2).join('\n');
  const receiptLabel = /(?:^|[|·\n])\s*Receipt:\s*([^|·\n]+)/i.exec(lastLines)?.[1]?.trim() ?? null;
  checks.footer_receipt_qualified = receiptLabel !== null && qualified(receiptLabel) && !claimsVerified(receiptLabel)
    && /米 Check Loom Gate ⟐$/.test(answer.trimEnd());
  checks.review_body_qualified = !review_body_required || qualified(answer.slice(0, Math.max(0, answer.length - lastLines.length)));
  if (receipt_required || receipt !== null) {
    if (!checks.receipt_shape) fail('RECEIPT_SHAPE_INVALID');
    else if (!checks.reference_match) fail('RECEIPT_ORIGIN_REFERENCE_MISMATCH');
    if (!checks.task_binding_observed) fail('ORIGIN_TASK_BINDING_UNOBSERVED');
    if (!checks.footer_receipt_qualified) fail('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED');
    if (!checks.review_body_qualified) fail('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING');
  }
  let sourceStatus = 'NOT_APPLICABLE', unresolvedSourceMarkerPresent = null;
  if (receipt_required || receipt !== null) {
    sourceStatus = 'UNOBSERVED';
    if (source_context === null) fail('ORIGIN_SOURCE_ACCOUNTING_UNOBSERVED');
    else {
      const { registered_document_ids: registered, observed_used_document_ids: observed, unidentified_source_count: unknown } = source_context;
      if (!equalSet(Object.keys(source_context), ['registered_document_ids', 'observed_used_document_ids', 'unidentified_source_count'])
        || !strings(registered, 8) || !strings(observed, 8) || !Number.isSafeInteger(unknown) || unknown < 0 || unknown > 8
        || registered.some(id => !/^[a-zA-Z0-9_-]{1,100}$/.test(id))) throw new TypeError('Origin source accounting requires registered IDs, observed IDs and an explicit unidentified count.');
      sourceStatus = 'ORIGIN_DECLARED_SOURCE_MATCH';
      if (observed.some(id => !registered.includes(id))) { sourceStatus = 'HOLD'; fail('OBSERVED_SOURCE_NOT_REGISTERED'); }
      if (checks.receipt_shape) {
        if (receipt.used_document_ids.some(id => !registered.includes(id))) { sourceStatus = 'HOLD'; fail('RECEIPT_SOURCE_NOT_REGISTERED'); }
        if (!equalSet(receipt.used_document_ids, observed)) { sourceStatus = 'HOLD'; fail('RECEIPT_OBSERVED_SOURCE_MISMATCH'); }
        if (unknown > 0) {
          unresolvedSourceMarkerPresent = receipt.missing_information.includes(LOOM_UNREGISTERED_SOURCE_MARKER);
          if (!unresolvedSourceMarkerPresent) fail('UNREGISTERED_SOURCE_MISSING_INFORMATION_OMITTED');
        }
      }
      if (unknown > 0) { sourceStatus = 'HOLD'; fail('SOURCE_IDENTIFIER_UNREGISTERED'); }
    }
  }
  checks.source_accounting = sourceStatus;
  return freeze({ schema: 'td613.loom.receiver-conformance-inspection/v0.1',
    status: findings.length ? 'HOLD' : receipt === null ? 'NO_TASK_RECEIPT_REQUIRED' : 'QUALIFIED_DECLARATION',
    checks, findings, receipt_label: receiptLabel, unresolved_source_marker_present: unresolvedSourceMarkerPresent,
    receipt_signatures_verified: false, receiver_enforcement_observed: false,
    admission_authority: false, local_ledger_advanced: false, provider_requests: 0,
    claim_ceiling: 'Deterministic declaration and origin-supplied accounting comparisons only; no semantic truth, hidden source-use, authentication or admission proof.' });
}
