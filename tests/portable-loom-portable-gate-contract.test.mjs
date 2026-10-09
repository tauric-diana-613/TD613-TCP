import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createCanonicalPortableLoomPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { STANDARD_PORTABLE_LOOM_TASK, STANDARD_PORTABLE_LOOM_RULES } from '../app/engine/portable-loom-policy.js';
import { createPortableLoomSession, createPortableLoomSessionExport, createPortableLoomSessionPrompt, verifyPortableLoomReceiverTurnReceipt } from '../app/engine/portable-loom-session.js';
import { portableLoomFooterText } from '../app/engine/portable-loom-output.js';

const environment = { crypto: webcrypto, TextEncoder };
async function freshExport() {
  const input = { task: STANDARD_PORTABLE_LOOM_TASK, rules: [...STANDARD_PORTABLE_LOOM_RULES], documents: [] };
  input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 0 }, environment);
  const packet = await createCanonicalPortableLoomPacket(input, {}, environment);
  const session = await createPortableLoomSession(packet, { source_revision: 'LOCAL_STRUCTURAL_TEST', session_id: 'portable_gate_contract_fixture' }, environment);
  return createPortableLoomSessionExport(session, packet, environment);
}

test('portable Gate primary action stays in the receiving conversation; manual destination grants no access or transfer', async () => {
  const exported = await freshExport();
  const core = exported.portable_task.portable_governance, protocol = core.output_protocol;
  assert.equal(protocol.schema, 'td613.loom.output-footer/v0.3');
  assert.equal(protocol.gate_action.surface, 'RECEIVING_CONVERSATION');
  assert.equal(Object.hasOwn(protocol.gate_action, 'href'), false);
  assert.equal(core.loom_gate.primary_surface, 'RECEIVING_CONVERSATION');
  assert.equal(Object.hasOwn(core.loom_gate, 'href'), false);
  assert.equal(protocol.manual_verification.automatic_conversation_access, false);
  assert.equal(protocol.manual_verification.automatic_material_transfer, false);
  assert.equal(protocol.manual_verification.transfer_requires_explicit_choice, true);
  assert.equal(protocol.manual_verification.link_is_verification_result, false);
  assert.equal(protocol.gate_output.verification_status_without_verifier, 'NOT_RUN');
  assert.equal(protocol.activation_presentation.held_task_does_not_block_gate_review, true);
  assert.match(createPortableLoomSessionPrompt(exported), /Do not hyperlink the primary command/);
  assert.doesNotMatch(createPortableLoomSessionPrompt(exported), /Open an available Gate review without a model request/);
  const footer = portableLoomFooterText();
  assert.doesNotMatch(footer, /https?:|\]\(/);
  assert.match(footer, /Gate: NOT_CHECKED_FOR_THIS_OUTPUT \(NONE\)/);
});

test('the complete carried receipt shape is accepted by the installed verifier without granting custody', async () => {
  const exported = await freshExport(), contract = exported.receiver_turn_contract;
  const receipt = {
    schema: contract.receipt_schema,
    session_root_ref: contract.session_root_ref,
    policy_commitment: contract.effective_policy_commitment,
    anchor_work_unit_ref: contract.current_work_unit_ref,
    turn_index: 1,
    operator_task: 'Summarize the explicitly selected task without source documents.',
    used_document_ids: [],
    missing_information: [],
    receiver_declaration: 'Receiver declaration only; verification and external enforcement are unestablished.'
  };
  assert.deepEqual(Object.keys(receipt).sort(), [...contract.receipt_fields].sort());
  const verified = await verifyPortableLoomReceiverTurnReceipt(exported.session, receipt, { expected_task: receipt.operator_task, allowed_document_ids: [] }, environment);
  assert.equal(verified.status, 'DECLARED_TURN_MATCH');
  assert.equal(verified.local_ledger_advanced, false);
  assert.equal(verified.receiver_declaration_promoted_to_observed_fact, false);
  const incomplete = { ...receipt }; delete incomplete.schema; delete incomplete.turn_index; delete incomplete.receiver_declaration;
  await assert.rejects(verifyPortableLoomReceiverTurnReceipt(exported.session, incomplete, {}, environment), /requires exactly its declared fields/);
});

test('activation asks for task/source selection and defers catalogue and receipts; prior frozen prompt remains compatible', async () => {
  const exported = await freshExport(), protocol = exported.portable_task.portable_governance.output_protocol;
  assert.equal(protocol.activation_presentation.receipt, 'NOT_CREATED_FOR_ACTIVATION; CREATE_FOR_PROCEEDING_TASK_ANSWERS');
  assert.equal(protocol.activation_presentation.route_catalogue, 'ON_REQUEST; KEEP_UNKNOWN_UNTIL_SELECTED');
  const prompt = createPortableLoomSessionPrompt(exported);
  assert.match(prompt, /Activation has no task receipt/);
  assert.match(prompt, /schema, session_root_ref, policy_commitment, anchor_work_unit_ref, turn_index/);
  const prior = JSON.parse(readFileSync(new URL('../research/portable-loom-export-carriage-repair-20261009/artifact/portable-loom-standard.json', import.meta.url)));
  const oldPrompt = createPortableLoomSessionPrompt(prior);
  assert.match(oldPrompt, /without a local verifier provide the capture instructions and link/);
  assert.doesNotMatch(oldPrompt, /Do not hyperlink the primary command/);
});
