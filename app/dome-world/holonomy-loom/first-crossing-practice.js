import { buildLoomAiRequest } from './ai-intake.js';
import { createLoomAiGovernance, createLoomAiTaskGovernor } from './ai-handoff.js';
import { portableLoomDigest } from '../../engine/portable-loom-session.js';

const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

// Fictional material traverses the installed local intake, AIA and FADT path.
// Neither loading this fixture nor binding it creates a provider request,
// Portable Loom Session, transfer, stored receipt or live custody capability.
export const FIRST_CROSSING_PRACTICE = freeze({
  id: 'loom-first-crossing-v1',
  input_class: 'CANONICAL_FICTIONAL_PRACTICE',
  fictional: true,
  task: 'Use the supporting source to answer the fictional garden-hours question.',
  rules: [
    'Use only the selected task note and supporting source. Keep the private note out of the AI handoff.'
  ],
  documents: [
    { id: 'brief', name: 'Task note', text: 'Fictional task note: What time does the garden open?', share: true },
    { id: 'source', name: 'Supporting source', text: 'Fictional supporting source: the garden opens at nine.', share: true },
    { id: 'private', name: 'Private note', text: 'Fictional private note withheld from the AI handoff.', share: false }
  ],
  protectedTerms: ['PRIVATE_GARDEN_NOTE_613']
});

function selectedPracticeIds(selectedIds) {
  if (!Array.isArray(selectedIds) || selectedIds.length !== 2
    || !Object.hasOwn(selectedIds, 0) || !Object.hasOwn(selectedIds, 1)
    || selectedIds.some(id => !['brief', 'source'].includes(id))
    || new Set(selectedIds).size !== 2) {
    throw new TypeError('FIRST_CROSSING_SELECTION_HELD: select exactly the task note and supporting source; keep the private note out of the AI handoff.');
  }
  return [...selectedIds].sort();
}

/** Return readiness facts only after a real, bounded local authorization. */
export async function bindFirstCrossingPractice(selectedIds, environment = globalThis) {
  const selection = selectedPracticeIds(selectedIds);
  const fixture = FIRST_CROSSING_PRACTICE;
  const requestId = environment.crypto.randomUUID();
  const prepared = buildLoomAiRequest({
    task: fixture.task,
    rules: fixture.rules,
    documents: fixture.documents.map(document => ({ ...document, share: selection.includes(document.id) })),
    protectedTerms: fixture.protectedTerms
  }, requestId);
  const shared = {
    task: prepared.request.task,
    documents: prepared.request.documents,
    rules: prepared.request.rules
  };
  shared.governance = await createLoomAiGovernance(shared, {
    withheldDocumentCount: prepared.localReceipt.withheld_document_ids.length
  }, environment);
  const governor = await createLoomAiTaskGovernor(shared, environment);
  let authorization;
  try {
    authorization = await governor.authorize(shared);
    if (!authorization.allowed) throw new Error('FIRST_CROSSING_BINDING_HELD: local task authorization did not succeed.');
  } finally {
    governor.close();
  }
  return freeze({
    schema: 'td613.loom.first-crossing-binding/v0.1',
    fixture_id: fixture.id,
    input_class: fixture.input_class,
    evidence_class: 'LOCAL_AUTHORIZATION_OF_FICTIONAL_SELECTED_INPUT',
    fictional: true,
    request_id: requestId,
    selected_document_ids: selection,
    shared: selection.length,
    local: prepared.localReceipt.withheld_document_ids.length,
    rules_count: fixture.rules.length,
    binding_verified: true,
    outbound_submitted: false,
    response_received: false,
    input_digest: shared.governance.input_digest,
    aia: {
      input_digest: shared.governance.input_digest,
      projection_family_verified: shared.governance.verification,
      // Existing request-state vocabulary: this is local task authorization,
      // never a returned-result or live-custody admission.
      fadt_admission: authorization.allowed
    },
    fadt: authorization.fadt,
    local_receipt: prepared.localReceipt,
    governor_state: governor.inspect().state,
    provider_called: false,
    custody_mutated: false,
    live_custody_capability: false,
    authority_transferred: false
  });
}

/** Exercise the installed egress guard, using only fictional local material. */
export function checkFirstCrossingPrivacy() {
  const fixture = FIRST_CROSSING_PRACTICE;
  const input = { task: fixture.task, rules: fixture.rules, protectedTerms: fixture.protectedTerms,
    documents: fixture.documents.map(document => ({ ...document })) };
  const selected = buildLoomAiRequest(input, 'tutorial-selected-control');
  input.documents[2] = { ...input.documents[2], share: true, text: fixture.protectedTerms[0] };
  let blocked = false;
  try { buildLoomAiRequest(input, 'tutorial-private-egress-control'); }
  catch (error) { if (error.code !== 'PROTECTED_EGRESS') throw error; blocked = true; }
  if (!blocked) throw new Error('Tutorial privacy control did not block the protected term.');
  return freeze({ schema: 'td613.loom.tutorial-privacy/v0.1', evidence_class: 'OFFLINE_TEST', fictional: true,
    scope: 'Selected outgoing packet and one planted private-term egress attempt',
    selected_documents: selected.request.documents.length, excluded_documents: selected.localReceipt.withheld_document_ids.length,
    blocked_private_egress_attempts: 1, provider_called: false, whole_conversation_leakage_fraction: null });
}

/** A real digest binds the fictional answer to the checked local request. */
export async function createFirstCrossingReturnProof(binding, environment = globalThis) {
  if (binding?.binding_verified !== true || binding.fixture_id !== FIRST_CROSSING_PRACTICE.id) throw new TypeError('A checked tutorial request is required.');
  const answer = 'Fictional answer: the garden opens at nine.';
  const receipt = { schema: 'td613.loom.tutorial-return/v0.1', evidence_class: 'OFFLINE_TEST', fictional: true,
    request_digest: binding.input_digest, answer_digest: await portableLoomDigest(answer, environment),
    used_document_ids: [...binding.selected_document_ids], provider_called: false, custody_admitted: false };
  return freeze({ answer, receipt, receipt_digest: await portableLoomDigest(receipt, environment) });
}
