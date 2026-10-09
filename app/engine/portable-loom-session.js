import {
  normalizeLoomAiTask,
  createLoomAiGovernance,
  verifyLoomAiGovernance
} from '../dome-world/holonomy-loom/ai-handoff-base.js';
import { inspectLoomAiResponse } from '../dome-world/holonomy-loom/ai-intake.js';
import { verifyPortableLoomCore } from './portable-loom-core.js';

export const PORTABLE_LOOM_SESSION_SCHEMA = 'td613.loom.portable-session/v0.1';
export const PORTABLE_LOOM_WORK_UNIT_SCHEMA = 'td613.loom.portable-session-work-unit/v0.1';
export const PORTABLE_LOOM_SESSION_EVENT_SCHEMA = 'td613.loom.portable-session-event/v0.1';
export const PORTABLE_LOOM_SESSION_EXPORT_SCHEMA = 'td613.loom.portable-session-export/v0.1';
export const PORTABLE_LOOM_RECEIVER_TURN_SCHEMA = 'td613.loom.portable-session-receiver-turn/v0.1';
export const PORTABLE_LOOM_RECEIVER_TURN_FIELDS = Object.freeze([
  'schema', 'session_root_ref', 'policy_commitment', 'anchor_work_unit_ref',
  'turn_index', 'operator_task', 'used_document_ids', 'missing_information', 'receiver_declaration'
]);

const encoder = new TextEncoder();
const HEX64 = /^[a-f0-9]{64}$/;
const ID = /^[a-zA-Z0-9_-]{1,100}$/;
// Process-local custody provenance. Parsed exports never acquire this mark.
const liveSessions = new WeakSet();
function sealSession(value) { const result = freeze(value); liveSessions.add(result); return result; }
export function isLivePortableLoomSession(value) { return liveSessions.has(value); }

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function plain(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  return value;
}

function exact(value, keys, label) {
  plain(value, label);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new TypeError(`${label} requires exactly its declared fields.`);
  }
  return value;
}

function text(value, label, max = 4000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new TypeError(`${label} must be bounded non-empty text.`);
  }
  return value;
}

function identifier(value, label) {
  if (typeof value !== 'string' || !ID.test(value)) throw new TypeError(`${label} is invalid.`);
  return value;
}

function denseStrings(value, label, max = 32) {
  if (!Array.isArray(value) || value.length > max || Reflect.ownKeys(value).length !== value.length + 1) {
    throw new TypeError(`${label} must be a dense bounded array.`);
  }
  const result = value.map((item, index) => text(item, `${label}[${index}]`, 1000));
  if (new Set(result).size !== result.length) throw new TypeError(`${label} contains duplicates.`);
  return result;
}

function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

export async function portableLoomDigest(value, environment = globalThis) {
  if (!environment?.crypto?.subtle) throw new Error('Secure digest unavailable.');
  const bytes = encoder.encode(stable(value));
  const hash = await environment.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function documentCommitments(documents, environment) {
  return Promise.all(documents.map(async document => freeze({
    id: document.id,
    name: document.name,
    sha256: await portableLoomDigest(document.text, environment)
  })));
}

function sessionAuthority() {
  return freeze({
    policy_inheritance: 'INHERIT_BY_DEFAULT',
    policy_weakening: 'FRESH_SESSION_REQUIRED_V0_1',
    source_inheritance: 'EXPLICIT_PER_WORK_UNIT',
    content_authority_inheritance: false,
    receiver_authority_transferred: false,
    hidden_host_introspection: false,
    human_closure_required: true
  });
}

function sessionClaimCeiling() {
  return freeze([
    'session continuity proves only the references and digests actually verified by Loom',
    'policy inheritance does not imply inheritance of every prior source body',
    'receiver acknowledgement is not receiver enforcement proof',
    'captured output is not hidden-host state, training, retention, or unobserved retransmission',
    'a clean bounded challenge episode is not universal secrecy or noninterference',
    'no Golden Egg, empirical exteriority, release, merge, deployment, or provider authority'
  ]);
}

function portablePayload(packet) {
  if (!packet || packet.schema !== 'td613.loom.portable-task/v0.1') {
    throw new TypeError('Portable Loom Session requires td613.loom.portable-task/v0.1.');
  }
  return normalizeLoomAiTask({
    task: packet.task,
    documents: packet.documents,
    rules: packet.rules,
    governance: packet.governance
  });
}

export async function createPortableLoomSession(packet, options = {}, environment = globalThis) {
  const payload = portablePayload(packet);
  await verifyLoomAiGovernance(payload, environment);
  if (packet.portable_governance !== undefined) await verifyPortableLoomCore(payload, packet.portable_governance, environment);
  const sessionId = identifier(options.session_id || environment.crypto?.randomUUID?.() || '', 'session_id');
  const sourceRevision = text(options.source_revision, 'source_revision', 80);
  const createdAt = Number(options.created_at ?? Date.now());
  if (!Number.isSafeInteger(createdAt) || createdAt < 0) throw new TypeError('created_at must be a non-negative safe integer.');
  const rootPacketDigest = await portableLoomDigest(packet, environment);
  const policyCommitment = await portableLoomDigest(payload.rules, environment);
  const selectedCommitments = await documentCommitments(payload.documents, environment);
  const rootRef = await portableLoomDigest({
    session_id: sessionId,
    source_revision: sourceRevision,
    root_packet_digest: rootPacketDigest,
    policy_commitment: policyCommitment,
    selected_commitments: selectedCommitments
  }, environment);
  return sealSession({
    schema: PORTABLE_LOOM_SESSION_SCHEMA,
    session_id: sessionId,
    source_revision: sourceRevision,
    created_at: createdAt,
    root: {
      ref: rootRef,
      packet_digest: rootPacketDigest,
      original_task_digest: await portableLoomDigest(payload.task, environment),
      policy_commitment: policyCommitment,
      root_rules: [...payload.rules],
      selected_commitments: selectedCommitments,
      withheld_document_count: payload.governance.withheld_document_count
    },
    continuity: {
      work_unit_count: 0,
      current_work_unit_ref: null,
      current_admitted_result_ref: packet.continuation?.prior_result
        ? await portableLoomDigest(packet.continuation.prior_result, environment)
        : null
    },
    authority: sessionAuthority(),
    claim_ceiling: sessionClaimCeiling(),
    work_units: []
  });
}

function validateSession(session) {
  exact(session, [
    'schema', 'session_id', 'source_revision', 'created_at', 'root',
    'continuity', 'authority', 'claim_ceiling', 'work_units'
  ], 'session');
  if (session.schema !== PORTABLE_LOOM_SESSION_SCHEMA) throw new TypeError('Unsupported Portable Loom Session schema.');
  identifier(session.session_id, 'session.session_id');
  text(session.source_revision, 'session.source_revision', 80);
  if (!Number.isSafeInteger(session.created_at) || session.created_at < 0) throw new TypeError('session.created_at is invalid.');
  exact(session.root, [
    'ref', 'packet_digest', 'original_task_digest', 'policy_commitment',
    'root_rules', 'selected_commitments', 'withheld_document_count'
  ], 'session.root');
  for (const key of ['ref', 'packet_digest', 'original_task_digest', 'policy_commitment']) {
    if (!HEX64.test(session.root[key])) throw new TypeError(`session.root.${key} is invalid.`);
  }
  denseStrings(session.root.root_rules, 'session.root.root_rules');
  if (!Array.isArray(session.root.selected_commitments) || session.root.selected_commitments.length > 8) {
    throw new TypeError('session.root.selected_commitments is invalid.');
  }
  for (const item of session.root.selected_commitments) {
    exact(item, ['id', 'name', 'sha256'], 'session.root.selected_commitment');
    identifier(item.id, 'selected commitment id');
    text(item.name, 'selected commitment name', 240);
    if (!HEX64.test(item.sha256)) throw new TypeError('selected commitment digest is invalid.');
  }
  if (!Number.isInteger(session.root.withheld_document_count) || session.root.withheld_document_count < 0 || session.root.withheld_document_count > 8) {
    throw new TypeError('session.root.withheld_document_count is invalid.');
  }
  exact(session.continuity, ['work_unit_count', 'current_work_unit_ref', 'current_admitted_result_ref'], 'session.continuity');
  if (!Number.isInteger(session.continuity.work_unit_count) || session.continuity.work_unit_count < 0) throw new TypeError('session work-unit count is invalid.');
  for (const key of ['current_work_unit_ref', 'current_admitted_result_ref']) {
    if (session.continuity[key] !== null && !HEX64.test(session.continuity[key])) throw new TypeError(`session.continuity.${key} is invalid.`);
  }
  denseStrings(session.claim_ceiling, 'session.claim_ceiling', 16);
  if (!Array.isArray(session.work_units) || session.work_units.length !== session.continuity.work_unit_count) throw new TypeError('session work-unit ledger is inconsistent.');
  return session;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function createPortableLoomWorkUnit(sessionInput, input, environment = globalThis) {
  const session = validateSession(sessionInput);
  exact(input, ['work_unit_id', 'request_id', 'task', 'documents', 'add_rules', 'withheld_document_count'], 'work-unit input');
  const workUnitId = identifier(input.work_unit_id, 'work_unit_id');
  const requestId = identifier(input.request_id, 'request_id');
  if (session.work_units.some(unit => unit.work_unit_id === workUnitId || unit.request_id === requestId)) {
    throw new TypeError('Work-unit or request identity is already present in this session.');
  }
  const addRules = denseStrings(input.add_rules, 'add_rules');
  const inheritedRules = [...session.root.root_rules];
  const effectiveRules = [...inheritedRules, ...addRules.filter(rule => !inheritedRules.includes(rule))];
  const selected = normalizeLoomAiTask({ task: input.task, documents: input.documents, rules: effectiveRules });
  const withheld = input.withheld_document_count;
  if (!Number.isInteger(withheld) || withheld < 0 || withheld > 8) throw new TypeError('withheld_document_count is invalid.');
  selected.governance = await createLoomAiGovernance(selected, { withheldDocumentCount: withheld }, environment);
  await verifyLoomAiGovernance(selected, environment);
  const selectedCommitments = await documentCommitments(selected.documents, environment);
  const policyCommitment = await portableLoomDigest(effectiveRules, environment);
  const predecessorWorkUnitRef = session.continuity.current_work_unit_ref;
  const contentPredecessorRef = session.continuity.current_admitted_result_ref;
  const unitBody = {
    session_root_ref: session.root.ref,
    work_unit_id: workUnitId,
    request_id: requestId,
    sequence: session.continuity.work_unit_count + 1,
    predecessor_work_unit_ref: predecessorWorkUnitRef,
    content_predecessor_ref: contentPredecessorRef,
    task: selected.task,
    selected_commitments: selectedCommitments,
    withheld_document_count: withheld,
    policy: {
      root_policy_commitment: session.root.policy_commitment,
      inherited_rules: inheritedRules,
      added_rules: addRules,
      effective_rules: effectiveRules,
      effective_policy_commitment: policyCommitment,
      weakening_permitted: false
    },
    governance: selected.governance
  };
  const workUnitRef = await portableLoomDigest(unitBody, environment);
  const unit = freeze({
    schema: PORTABLE_LOOM_WORK_UNIT_SCHEMA,
    ...unitBody,
    ref: workUnitRef,
    status: 'PREPARED',
    admitted_result: null,
    admitted_result_ref: null,
    claim_ceiling: [
      'this work unit inherits the session policy root and may add constraints',
      'selected source bodies are explicit per work unit and are not inherited by implication',
      'prepared does not mean sent, admitted, or enforced by a foreign receiver',
      'content predecessor and work-unit predecessor remain distinct coordinates'
    ]
  });
  const next = clone(session);
  next.work_units.push(unit);
  next.continuity.work_unit_count += 1;
  next.continuity.current_work_unit_ref = workUnitRef;
  return freeze({ session: isLivePortableLoomSession(session) ? sealSession(next) : freeze(next), work_unit: unit, task: selected });
}

function validateWorkUnit(unit, session) {
  if (!unit || unit.schema !== PORTABLE_LOOM_WORK_UNIT_SCHEMA) throw new TypeError('Portable Loom work unit required.');
  if (unit.session_root_ref !== session.root.ref) throw new Error('Work unit belongs to a different session root.');
  if (!HEX64.test(unit.ref)) throw new TypeError('Work-unit reference is invalid.');
  return unit;
}

export async function admitPortableLoomWorkUnitResult(sessionInput, workUnitInput, response, environment = globalThis) {
  const session = validateSession(sessionInput);
  const unit = validateWorkUnit(workUnitInput, session);
  if (unit.status !== 'PREPARED' || unit.admitted_result_ref !== null) throw new Error('Work unit is not awaiting its first admitted result.');
  if (session.continuity.current_work_unit_ref !== unit.ref) throw new Error('Only the current prepared work unit may admit a result.');
  const inspection = inspectLoomAiResponse(response, {
    request_id: unit.request_id,
    shared_document_ids: unit.selected_commitments.map(item => item.id)
  });
  if (!inspection.allowed) return freeze({
    schema: PORTABLE_LOOM_SESSION_EVENT_SCHEMA,
    status: 'HELD',
    session_root_ref: session.root.ref,
    work_unit_ref: unit.ref,
    result_ref: null,
    inspection,
    session
  });
  const result = {
    schema: response.schema,
    request_id: response.request_id,
    status: response.status,
    answer: response.answer,
    missing_information: [...response.missing_information],
    used_document_ids: [...response.used_document_ids],
    suggested_next_step: response.suggested_next_step
  };
  const resultRef = await portableLoomDigest(result, environment);
  const next = clone(session);
  const index = next.work_units.findIndex(item => item.ref === unit.ref);
  if (index < 0) throw new Error('Session ledger no longer contains the current work unit.');
  next.work_units[index] = {
    ...next.work_units[index],
    status: 'ADMITTED',
    admitted_result: result,
    admitted_result_ref: resultRef
  };
  next.continuity.current_admitted_result_ref = resultRef;
  return freeze({
    schema: PORTABLE_LOOM_SESSION_EVENT_SCHEMA,
    status: 'ADMITTED',
    session_root_ref: session.root.ref,
    work_unit_ref: unit.ref,
    result_ref: resultRef,
    inspection,
    session: isLivePortableLoomSession(session) ? sealSession(next) : freeze(next)
  });
}

export async function createPortableLoomSessionExport(sessionInput, packet, environment = globalThis) {
  const session = validateSession(sessionInput);
  const payload = portablePayload(packet);
  await verifyLoomAiGovernance(payload, environment);
  const packetDigest = await portableLoomDigest(packet, environment);
  if (packetDigest !== session.root.packet_digest) throw new Error('Portable task does not match this session root.');
  return freeze({
    schema: PORTABLE_LOOM_SESSION_EXPORT_SCHEMA,
    session,
    portable_task: clone(packet),
    continuation_protocol: {
      inheritance: 'INHERIT_BY_DEFAULT',
      policy_weakening: 'FRESH_SESSION_REQUIRED_V0_1',
      proceeding_task_rule: 'Every proceeding task inherits the root portable rules unless a new Loom session is explicitly created.',
      source_rule: 'New source bodies are explicit per work unit; prior source bodies are not silently inherited merely because governance persists.',
      predecessor_rule: 'Work-unit ancestry and admitted-content ancestry remain separate and must both stay inspectable.',
      receiver_rule: 'Receiver acknowledgements are declarations; Loom verification is required before they become evidence.'
    },
    receiver_turn_contract: {
      schema: PORTABLE_LOOM_RECEIVER_TURN_SCHEMA,
      session_root_ref: session.root.ref,
      effective_policy_commitment: session.work_units.at(-1)?.policy?.effective_policy_commitment || session.root.policy_commitment,
      current_work_unit_ref: session.continuity.current_work_unit_ref,
      required_echo_fields: [
        'session_root_ref',
        'policy_commitment',
        'anchor_work_unit_ref',
        'operator_task',
        'used_document_ids',
        'missing_information'
      ],
      receipt_fields: [...PORTABLE_LOOM_RECEIVER_TURN_FIELDS],
      receipt_schema: PORTABLE_LOOM_RECEIVER_TURN_SCHEMA,
      turn_index_rule: 'Positive declaration counter: 1 for the first proceeding-task answer, then increment for subsequent proceeding-task answers. Activation, Gate explanation and Rest views do not invent task receipts or verified ancestry.',
      receiver_declaration_rule: 'A nonempty string describing the receiver declaration and its limits; it is not independently verified enforcement.',
      persistence_rule: 'Proceeding tasks inherit the session root rules unless the human explicitly starts a fresh Loom session.',
      source_rule: 'Only source bodies explicitly supplied or selected for the proceeding task may be treated as newly admitted task sources.',
      receipt_rule: 'Return a separate loom_session_receipt object containing exactly receipt_fields with every proceeding-task answer. Activation before task/source selection has no task receipt. anchor_work_unit_ref names the last Loom-verified work unit, and the receipt is a receiver declaration until Loom revalidates it.',
      weakening_rule: 'Do not omit, relax, replace, or reinterpret a root rule inside the same v0.1 session.'
    },
    challenge_protocol: {
      available: true,
      public_private_split: true,
      public_challenge_contains_ground_truth: false,
      local_verifier_required: true,
      receiver_self_report_is_proof: false
    },
    claim_ceiling: [
      ...session.claim_ceiling,
      'this export carries a persistent governance protocol; it does not install hidden middleware inside a foreign host',
      'foreign-thread continuation remains claim-limited until returned work units or challenges are brought back through Loom verification'
    ]
  });
}

export function createPortableLoomSessionPrompt(sessionExport) {
  if (!sessionExport || sessionExport.schema !== PORTABLE_LOOM_SESSION_EXPORT_SCHEMA) throw new TypeError('Portable Loom Session export required.');
  const conversationGate = sessionExport.portable_task?.portable_governance?.output_protocol?.gate_action?.surface === 'RECEIVING_CONVERSATION';
  const completeReceipt = Array.isArray(sessionExport.receiver_turn_contract?.receipt_fields);
  return [
    'You are receiving a TD613 Portable Loom Session.',
    'Treat the session root and portable rules as persistent governance for every proceeding task in this thread.',
    'A new user task changes the work objective; it does not erase the root rules.',
    ...(sessionExport.portable_task?.portable_governance?.output_protocol ? [conversationGate
      ? 'The root-bound output_protocol persists through proceeding tasks and Rest. Use one compact footer paragraph of at most two logical lines with all declared fields and the plain-text command 米 Check Loom Gate. A lone 米 requests a review of available evidence here; that request needs no separate review approval. Report the actual review scope, missing telemetry and any actual verifier results separately. Verification remains NOT_RUN without an executed verifier result. Do not hyperlink the primary command or replace the report with a website redirect. The optional manual verifier has no automatic access to this conversation; material transfer requires a separate explicit choice. A missing footer is a protocol omission. Preserve strict JSON by putting its footer inside answer before hashing, or in a separate host presentation surface.'
      : 'The root-bound output_protocol is persistent across this session, every proceeding task and Rest. Show its full compact footer on every output: phase, minimized public session/explicit route label, posture, authorization, receipt availability, HOLD, Gate status and checked scope, and 米 Check Loom Gate. Unknown coordinates stay UNKNOWN; never infer fresh authorization from prior sending. Recognize a lone 米 as Gate review; without a local verifier provide the capture instructions and link, and keep NOT_RUN. A review acknowledgment never clears findings or admits work. A missing footer is a protocol omission. Preserve strict JSON by putting its footer inside answer before hashing, or in a separate host presentation surface.'] : []),
    ...(conversationGate ? ['For activation before a task and sources are selected, ask only for that task and its explicit source selection (including an explicit choice of no source documents). Keep the route UNKNOWN and offer its technical catalogue on request. Keep the footer compact; do not fabricate a task receipt or print root hashes during this setup. Task HOLD does not prevent reviewing supplied evidence on 米.'] : []),
    'Do not silently inherit source bodies from an earlier task unless they are explicitly supplied or named as continuing inputs.',
    'Keep work-unit ancestry separate from content-predecessor ancestry.',
    completeReceipt
      ? 'For every proceeding-task answer after task/source selection, append a separate loom_session_receipt object containing exactly receiver_turn_contract.receipt_fields: schema, session_root_ref, policy_commitment, anchor_work_unit_ref, turn_index, operator_task, used_document_ids, missing_information and receiver_declaration. Use receipt_schema, the carried root/policy/last verified anchor, a positive proceeding-task declaration counter and a nonempty declaration string. Activation has no task receipt; Gate review never fabricates one. This counter does not authenticate off-platform ancestry.'
      : 'For every proceeding-task answer, append a separate loom_session_receipt object matching receiver_turn_contract. Echo the session root, effective policy commitment, anchor work-unit reference, operator task, explicitly used document IDs, and missing information.',
    'That receipt is a declaration for Loom to revalidate; do not describe the receipt itself as proof of enforcement.',
    'Do not claim that your own acknowledgement proves enforcement, secrecy, retention, training behavior, or hidden memory state.',
    'When a Challenge Receiver packet appears, answer only its declared probes and preserve its exact session/work-unit/policy references.',
    ...(sessionExport.portable_task?.portable_governance?.output_protocol ? [conversationGate
      ? 'Gate outputs retain the regular footer plus the actual evidence sources, review scope, observed disclosures versus inferred risks, missing observations, receipt references, verification status, claim ceiling and How do I know? 下. A lone 下 requests the actual methods and full carried expert nomenclature. Review visible evidence even when executable verification is unavailable; mark that verification NOT_RUN and give actionable capture instructions. An optional manual-verification link is separate from this in-conversation review.'
      : 'Gate outputs retain the regular footer plus evidence basis, checked scope and How do I know? 下. A lone 下 requests actual methods and the full carried expert nomenclature. Without a verifier capability, report NOT_RUN and provide the link and capture instructions.'] : []),
    '',
    JSON.stringify(sessionExport, null, 2)
  ].join('\n');
}

export async function verifyPortableLoomReceiverTurnReceipt(sessionInput, receiptInput, options = {}, environment = globalThis) {
  const session = validateSession(sessionInput);
  exact(receiptInput, PORTABLE_LOOM_RECEIVER_TURN_FIELDS, 'receiver turn receipt');
  if (receiptInput.schema !== PORTABLE_LOOM_RECEIVER_TURN_SCHEMA) throw new TypeError('Unsupported Portable Loom receiver-turn receipt schema.');
  if (!Number.isInteger(receiptInput.turn_index) || receiptInput.turn_index < 1) throw new TypeError('receiver turn index must be a positive integer.');
  text(receiptInput.operator_task, 'receiver turn operator_task', 12000);
  const used = denseStrings(receiptInput.used_document_ids, 'receiver turn used_document_ids', 8);
  const missing = denseStrings(receiptInput.missing_information, 'receiver turn missing_information', 16);
  text(receiptInput.receiver_declaration, 'receiver turn receiver_declaration', 2000);
  const currentUnit = session.work_units.at(-1) || null;
  const effectivePolicy = currentUnit?.policy?.effective_policy_commitment || session.root.policy_commitment;
  const expectedTask = options.expected_task == null ? null : text(options.expected_task, 'expected_task', 12000);
  const allowedIds = options.allowed_document_ids == null
    ? new Set(currentUnit?.selected_commitments?.map(item => item.id) || [])
    : new Set(denseStrings(options.allowed_document_ids, 'allowed_document_ids', 8));
  const reference_match = {
    session_root: receiptInput.session_root_ref === session.root.ref,
    policy: receiptInput.policy_commitment === effectivePolicy,
    anchor_work_unit: receiptInput.anchor_work_unit_ref === session.continuity.current_work_unit_ref,
    operator_task: expectedTask === null ? true : receiptInput.operator_task === expectedTask
  };
  const undeclaredIds = used.filter(id => !allowedIds.has(id));
  const status = Object.values(reference_match).every(Boolean) && undeclaredIds.length === 0
    ? 'DECLARED_TURN_MATCH'
    : 'HOLD';
  const result = {
    schema: 'td613.loom.portable-session-receiver-turn-verification/v0.1',
    status,
    session_root_ref: session.root.ref,
    anchor_work_unit_ref: session.continuity.current_work_unit_ref,
    effective_policy_commitment: effectivePolicy,
    turn_index: receiptInput.turn_index,
    reference_match,
    used_document_ids: used,
    undeclared_document_ids: undeclaredIds,
    missing_information: missing,
    receiver_declaration: receiptInput.receiver_declaration,
    receiver_declaration_promoted_to_observed_fact: false,
    local_ledger_advanced: false,
    claim_ceiling: [
      'matching receipt references establish declared consistency only',
      'a receiver-turn receipt does not prove execution, policy enforcement, secrecy, hidden retention, training behavior, or unobserved retransmission',
      'anchor_work_unit_ref is the last Loom-verified anchor; off-platform turns do not become authenticated Loom ancestry until revalidated',
      'local Loom work-unit ancestry is not advanced by receipt verification alone'
    ]
  };
  return freeze({ ...result, ref: await portableLoomDigest(result, environment) });
}

export function inspectPortableLoomSession(sessionInput) {
  const session = validateSession(sessionInput);
  const current = session.work_units.at(-1) || null;
  return freeze({
    schema: 'td613.loom.portable-session-inspection/v0.1',
    session_id: session.session_id,
    root_ref: session.root.ref,
    work_unit_count: session.continuity.work_unit_count,
    current_work_unit_ref: session.continuity.current_work_unit_ref,
    current_admitted_result_ref: session.continuity.current_admitted_result_ref,
    root_policy_commitment: session.root.policy_commitment,
    current_effective_policy_commitment: current?.policy?.effective_policy_commitment || session.root.policy_commitment,
    policy_inheritance: session.authority.policy_inheritance,
    policy_weakening: session.authority.policy_weakening,
    selected_sources_inherited_implicitly: false,
    receiver_authority_transferred: false,
    hidden_host_introspection: false,
    claim_ceiling: [...session.claim_ceiling]
  });
}
