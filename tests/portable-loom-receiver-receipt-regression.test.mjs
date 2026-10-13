import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, verifyPortableLoomReceiverTurnReceipt } from '../app/engine/portable-loom-session.js';
import { portableLoomFooterText } from '../app/engine/portable-loom-output.js';

const captured = JSON.parse(readFileSync(new URL('./fixtures/portable-loom-receiver-receipts-20261010.json', import.meta.url)));
const environment = { crypto: webcrypto };
async function sessionFixture() {
  const input = { task: 'Inspect supplied declarations without admitting them.', documents: [], rules: ['Receiver declarations require independent Check and explicit Admit.'] };
  input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 0 }, environment);
  return createPortableLoomSession(createPortableLoomAiPacket(input), { session_id: 'receipt_regression', source_revision: 'c3eff42b966685cc107148d15d654dbf33a4bbf9', created_at: 1000 }, environment);
}
for (const example of captured.cases.slice(0, 2)) {
  test(`captured ${example.trial.trial_id} scalar/null missing information is rejected without custody advancement`, async () => {
    const session = await sessionFixture();
    await assert.rejects(() => verifyPortableLoomReceiverTurnReceipt(session, example.receipt, {}, environment), /receiver turn missing_information must be a dense bounded array/);
    assert.equal(session.continuity.work_unit_count, 0);
    assert.equal(session.continuity.current_admitted_result_ref, null);
  });
}
test('a well-shaped captured receipt from another root remains held and cannot authenticate itself', async () => {
  const session = await sessionFixture(), example = captured.cases[2];
  const report = await verifyPortableLoomReceiverTurnReceipt(session, example.receipt, { expected_task: example.receipt.operator_task, allowed_document_ids: example.receipt.used_document_ids }, environment);
  assert.equal(report.status, 'HOLD');
  assert.equal(report.reference_match.session_root, false);
  assert.equal(report.receiver_declaration_promoted_to_observed_fact, false);
  assert.equal(report.local_ledger_advanced, false);
  assert.equal(session.continuity.current_admitted_result_ref, null);
});
test('unknown route stays unknown and footer labels cannot carry a digest or multiline payload', () => {
  assert.match(portableLoomFooterText(), /UNKNOWN\/UNKNOWN/);
  const footer = portableLoomFooterText({ sessionLabel: 'a'.repeat(64), routeLabel: 'route\nprivate payload', holdStatus: 'NONE', receiptStatus: 'UNVERIFIED' });
  assert.equal(footer.includes('private payload'), false);
  assert.equal(footer.includes('a'.repeat(64)), false);
  assert.match(footer, /Receipt: UNVERIFIED/);
  assert.match(footer, /HOLD: NONE/);
  assert.ok(footer.endsWith('米 Check Loom Gate ⟐'));
});
