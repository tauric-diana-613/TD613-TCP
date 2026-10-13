// Offline declaration inspection only. Callers supply origin evidence separately;
// receiver prose cannot register a source, authenticate itself, or admit work.
import { portableLoomReceiverAssemblyChecks } from './portable-loom-receiver-output-contract.js';
const ASSEMBLY = portableLoomReceiverAssemblyChecks();
export const LOOM_DECLARED_RECEIPT_STATUS = ASSEMBLY.receipt_status;
export const LOOM_UNREGISTERED_SOURCE_MARKER = ASSEMBLY.source.missing_marker;
const SCHEMA = ASSEMBLY.receipt_schema;
const FIELDS = ASSEMBLY.receipt_fields;
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
const QUALIFICATION = /\b(?:UNVERIFIED|UNADMITTED|NOT[ -]+(?:INDEPENDENTLY[ -]+)?(?:VERIFIED|ADMITTED|AUTHENTICATED)|(?:HAS|HAVE|WAS|WERE)[ -]+(?:NOT[ -]+|NEVER[ -]+)?(?:BEEN[ -]+)?(?:INDEPENDENTLY[ -]+)?(?:VERIFIED|ADMITTED|AUTHENTICATED)|PENDING[ -]+(?:REVALIDATION|VERIFICATION))\b/gi;
const qualified = text => new RegExp(QUALIFICATION.source, 'i').test(text.replaceAll('_', ' '));
function claimsVerified(text) {
  const remaining = text.replaceAll('_', ' ').replace(QUALIFICATION, '');
  return /\b(?:VERIFIED|ADMITTED|AUTHENTICATED)\b/i.test(remaining);
}
const stable = value => Array.isArray(value) ? '[' + value.map(stable).join(',') + ']'
  : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}' : JSON.stringify(value);
function parseCapturedJson(wire) {
  const parsed = JSON.parse(wire), stack = [];
  // JSON.parse alone silently keeps the last duplicate key. Refuse that
  // ambiguity before comparing the captured declaration with a sidecar.
  const tokens = wire.match(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\]:,]/g) || [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '{') stack.push(new Set());
    else if (token === '[') stack.push(null);
    else if (token === '}' || token === ']') stack.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ':') {
      const key = JSON.parse(token), keys = stack.at(-1);
      if (keys.has(key)) throw new TypeError('Captured JSON contains a duplicate key.');
      keys.add(key);
    }
  }
  return parsed;
}
function capturedReceipt(answer, presentationFormat) {
  const candidates = [], malformed = [];
  let receiptStart = null, receiptEndLine = null;
  const collect = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    if (Object.hasOwn(value, 'loom_session_receipt')) candidates.push(value.loom_session_receipt);
    else if (Object.hasOwn(value, 'receiver_declaration') || value.schema === SCHEMA) candidates.push(value);
  };
  let presentation = answer;
  if (presentationFormat === 'STRICT_JSON_TASK_RESULT') {
    const outer = parseCapturedJson(answer);
    if (!outer || typeof outer !== 'object' || Array.isArray(outer) || !nonempty(outer.answer, 180000)) throw new TypeError('Strict JSON task result requires an answer string.');
    collect(outer); presentation = outer.answer;
  } else if (presentationFormat !== 'PROSE') throw new TypeError('Unsupported answer presentation format.');
  for (const match of presentation.matchAll(/```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n```/g)) {
    try { const before = candidates.length; collect(parseCapturedJson(match[1])); if (candidates.length > before) { receiptStart = match.index; receiptEndLine = presentation.slice(0, match.index + match[0].length).split(/\r?\n/).length - 1; } }
    catch { if (/"(?:loom_session_receipt|receiver_declaration)"/.test(match[1])) malformed.push('MALFORMED_CAPTURED_RECEIPT'); }
  }
  return { presentation, receipt_start: receiptStart, receipt_end_line: receiptEndLine, count: candidates.length, malformed: malformed.length,
    receipt: candidates.length === 1 ? snapshot(candidates[0]) : null };
}
function receiptBodyQualification(body) {
  // A bounded textual check, not semantic adjudication: preserve words inside
  // inline code, and require the qualification to concern a receipt sentence.
  const prose = body.replace(/```[\s\S]*?```/g, '').replaceAll('`', '').replaceAll('_', ' ');
  const allSentences = prose.split(/[.!?\n]/).map(sentence => sentence.trim()).filter(Boolean);
  const receiptIndex = allSentences.map((sentence, index) => /\b(?:receipts?|receiver declarations?)\b/i.test(sentence) ? index : -1).filter(index => index >= 0);
  const scopedIndices = new Set(receiptIndex);
  for (const index of receiptIndex) {
    if (/^(?:it|this|that)\b/i.test(allSentences[index + 1] ?? '')) scopedIndices.add(index + 1);
  }
  const sentences = [...scopedIndices].map(index => allSentences[index]);
  if (!sentences.length || sentences.some(sentence => {
    const directClaim = /\b(?:receipt|receiver declaration)\b[^.!?;\n]{0,140}?\b(?:is|are|was|were|has been|have been)\s+(?:independently\s+)?(?:verified|authenticated|admitted)\b/i;
    const adversativeClaim = /\b(?:but|however|yet)\b[^.!?\n]*\b(?:verified|authenticated|admitted)\b/i;
    const anaphoricClaim = /^(?:it|this|that)\s+(?:is|was|has been|have been)\s+(?:independently\s+)?(?:verified|authenticated|admitted)\b/i;
    return directClaim.test(sentence) || adversativeClaim.test(sentence) || anaphoricClaim.test(sentence);
  })) return false;
  return sentences.some(qualified);
}

function presentationSections(presentation) {
  const lines = presentation.trimEnd().split(/\r?\n/), prose = [], footers = [];
  let fence = null;
  const outside = lines.map(line => {
    const marker = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      return false;
    }
    if (marker) { fence = marker[1]; return false; }
    return true;
  });
  const start = /^\s*(?:Phase:|𝌋 Loom(?:[ ·]|$))/;
  const continuation = /^\s*(?:[|·]\s*)?(?:Session:|Route:|Posture:|Auth:|Receipt:|HOLD:|Gate:|Scope:|米 Check Loom Gate ⟐)/;
  const sealed = text => /米 Check Loom Gate ⟐\s*$/.test(text);
  for (let i = 0; i < lines.length; i++) {
    if (!outside[i]) continue;
    if (!start.test(lines[i])) { prose.push(lines[i]); continue; }
    const first = i;
    if (!sealed(lines[i]) && outside[i + 1] && continuation.test(lines[i + 1])) i++;
    footers.push({ text: lines.slice(first, i + 1).join('\n'), start: first, end: i + 1, complete: sealed(lines[i]) });
  }
  // Footer labels never qualify the body, even when misplaced or duplicated.
  // Keep adjacent prose in order so removing a footer cannot erase a claim or
  // break an anaphoric contradiction into an unrelated sentence.
  const terminal = footers.find(footer => footer.end === lines.length);
  return { body: prose.join('\n'), footer: terminal?.text ?? '', footer_count: footers.length,
    footer_start_line: terminal?.start ?? null,
    displaced: footers.some(footer => footer.complete) && !terminal?.complete };
}

function inspectAssembly({ body, footer, footer_count, footer_after_receipt }, receiptLabel, sourceContext, presentationFormat) {
  const prose = body.replace(/```[\s\S]*?```/g, '').replaceAll('`', '');
  // These are bounded signals, with semantic review explicitly left separate.
  // Recognize both noun-phrase requests and the independently retained n02
  // wording: "the origin is requested to register this source".
  const requestSentences = prose.split(/[.!?\n]/).filter(s => !/\b(?:not|never|no need|without)\b/i.test(s));
  const registrationRequest = requestSentences.some(s =>
    /\b(?:request(?:ed|s)?|ask(?:ed)?|please|must|needs? to)\b[^.!?\n]{0,180}\b(?:origin[^.!?\n]{0,70}regist(?:er|ration)|regist(?:er|ration)[^.!?\n]{0,70}(?:origin|source))\b/i.test(s)
    || /\borigin\b[^.!?\n]{0,70}\b(?:request(?:ed|s)?|ask(?:ed)?|please|must|needs? to)\b[^.!?\n]{0,70}\bregister\b[^.!?\n]{0,50}\bsource\b/i.test(s));
  // Normalize the existing compact renderer's first four positional fields.
  const labeled = footer.replace(/^𝌋 Loom · ([^·]+) · ([^·/]+)\/([^·]+) · ([^·]+) · /, 'Phase: $1 | Session: $2 | Route: $3 | Posture: $4 | ')
    .replace(/Gate:\s*([^|·\n(]+)\s*\((?!Scope:)([^)]+)\)/, 'Gate: $1 (Scope: $2)');
  const positions = ASSEMBLY.footer.fields.map(field => [...labeled.matchAll(new RegExp(`(?:^|[|·\\n(])\\s*${field}:\\s*([^|·\\n)]+)`, 'g'))]);
  const unknown = sourceContext?.unidentified_source_count > 0;
  return {
    receipt_status_literal: receiptLabel === ASSEMBLY.receipt_status,
    separate_pending_qualification: prose.includes(ASSEMBLY.receipt_status) && /independent verification/i.test(prose) && /custody admission/i.test(prose) && /\bpending\b/i.test(prose),
    prose_registration_missingness: !unknown || /\b(?:missing|unregistered|lacks?|without)\b[^.!?\n]{0,100}\b(?:registration|registered|source)\b|\bregistration\b[^.!?\n]{0,100}\b(?:missing|absent|pending)\b/i.test(prose),
    prose_origin_registration_request: !unknown || registrationRequest,
    one_terminal_footer: footer_count === ASSEMBLY.footer.count && footer.endsWith(`${ASSEMBLY.footer.gate_action} ${ASSEMBLY.footer.seal}`),
    footer_line_limit: !!footer && footer.split(/\r?\n/).length <= ASSEMBLY.footer.max_logical_lines,
    footer_after_receipt: presentationFormat === 'STRICT_JSON_TASK_RESULT' || footer_after_receipt,
    footer_coordinates_in_order: positions.every((matches, i) => matches.length === 1 && (i === 0 || matches[0].index > positions[i - 1][0]?.index)),
    source_hold_preserved: !unknown || new RegExp(`HOLD:\\s*${ASSEMBLY.source.missing_marker}(?=\\s*(?:[|·\\n]|$))`).test(footer)
  };
}

export function inspectPortableLoomReceiverConformance(input) {
  const { answer, receipt: sidecar = null, expected, source_context = null, receipt_required = true, review_body_required = true, presentation_format = 'PROSE', output_contract_version = null } = snapshot(input);
  if (output_contract_version !== null && output_contract_version !== ASSEMBLY.schema) throw new TypeError('Unsupported receiver output assembly contract.');
  if (!nonempty(answer, 180000) || typeof receipt_required !== 'boolean' || typeof review_body_required !== 'boolean') throw new TypeError('Bounded answer and Boolean inspection flags required.');
  if (!expected || !digest(expected.session_root_ref) || !digest(expected.policy_commitment)
    || !(expected.anchor_work_unit_ref === null || digest(expected.anchor_work_unit_ref))
    || !(expected.operator_task === null || nonempty(expected.operator_task, 12000))) throw new TypeError('Explicit origin root, policy, anchor and task observation required.');
  const findings = [], checks = {};
  const fail = code => findings.push(code);
  const captured = capturedReceipt(answer, presentation_format), receipt = captured.receipt;
  const inspectReceipt = receipt_required || sidecar !== null || captured.count > 0 || captured.malformed > 0;
  checks.captured_receipt_count = captured.count;
  checks.receipt_bound_to_answer = captured.count === 1 && captured.malformed === 0;
  checks.sidecar_matches_captured_receipt = sidecar === null ? null : checks.receipt_bound_to_answer && stable(sidecar) === stable(receipt);
  if (inspectReceipt) {
    if (!checks.receipt_bound_to_answer) fail(captured.count > 1 ? 'CAPTURED_RECEIPT_AMBIGUOUS' : captured.malformed ? 'CAPTURED_RECEIPT_MALFORMED' : 'CAPTURED_RECEIPT_MISSING');
    if (sidecar !== null && !checks.sidecar_matches_captured_receipt) fail('SIDECAR_RECEIPT_DIFFERS_FROM_CAPTURE');
  }
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
  const sections = presentationSections(captured.presentation);
  const { body, footer, displaced } = sections;
  const labels = [...footer.matchAll(/(?:^|[|·\n])\s*Receipt:\s*([^|·\n]+)/gi)].map(match => match[1].trim());
  const receiptLabel = labels.length === 1 ? labels[0] : null;
  checks.footer_receipt_qualified = receiptLabel !== null && qualified(receiptLabel) && !claimsVerified(receiptLabel)
    && /米 Check Loom Gate ⟐$/.test(footer);
  checks.review_body_qualified = review_body_required ? receiptBodyQualification(body) : null;
  if (inspectReceipt) {
    if (!checks.receipt_shape) fail('RECEIPT_SHAPE_INVALID');
    else if (!checks.reference_match) fail('RECEIPT_ORIGIN_REFERENCE_MISMATCH');
    if (!checks.task_binding_observed) fail('ORIGIN_TASK_BINDING_UNOBSERVED');
    if (!checks.footer_receipt_qualified) fail('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED');
    if (displaced) fail('RECEIPT_FOOTER_NOT_TERMINAL');
    if (review_body_required && !checks.review_body_qualified) fail('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING');
  }
  let sourceStatus = 'NOT_APPLICABLE', unresolvedSourceMarkerPresent = null;
  if (inspectReceipt) {
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
  // Explicitly opt into the new assembly contract. Historical inspection keeps
  // its original v0.1 behavior and frozen empirical scores are never rewritten.
  if (output_contract_version !== null && inspectReceipt) {
    const assemblySections = { ...sections, footer_after_receipt: captured.receipt_end_line !== null && sections.footer_start_line !== null && captured.receipt_end_line < sections.footer_start_line, body: captured.receipt_start === null ? sections.body : captured.presentation.slice(0, captured.receipt_start) };
    // Remove any misplaced footer from the separate prose before checking it.
    assemblySections.body = presentationSections(assemblySections.body).body;
    checks.output_assembly = inspectAssembly(assemblySections, receiptLabel, source_context, presentation_format);
    for (const [key, pass] of Object.entries(checks.output_assembly)) if (!pass) fail(`OUTPUT_ASSEMBLY_${key.toUpperCase()}`);
  }
  return freeze({ schema: 'td613.loom.receiver-conformance-inspection/v0.1',
    status: findings.length ? 'HOLD' : !inspectReceipt ? 'NO_TASK_RECEIPT_REQUIRED' : review_body_required ? 'QUALIFIED_DECLARATION' : 'PARTIAL_DECLARATION_INSPECTION',
    checks, findings, ...(output_contract_version === null ? {} : { output_contract_version }), receipt_label: receiptLabel, unresolved_source_marker_present: unresolvedSourceMarkerPresent,
    receipt_signatures_verified: false, receiver_enforcement_observed: false,
    admission_authority: false, local_ledger_advanced: false, provider_requests: 0,
    claim_ceiling: 'Captured receipt parsing, bounded textual qualification signals and origin-supplied accounting comparisons only; no semantic truth, hidden source-use, authentication or admission proof.' });
}
