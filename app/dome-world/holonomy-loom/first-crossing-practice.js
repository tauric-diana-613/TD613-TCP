import { buildLoomAiRequest, inspectLoomAiResponse } from './ai-intake.js';
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
  id: 'loom-first-crossing-v4-private-conversation',
  input_class: 'CANONICAL_FICTIONAL_PRACTICE',
  fictional: true,
  task: 'I'm considering taking a job in another city. Help me weigh the choice using only the context I've shared. Give me two useful ways to think about it and one question to consider.',
  rules: [
    'Use only the question and context I've shared. Suggest two practical ways to weigh the decision and one question to ask myself. Don't invent details about my life or refer to anything outside this request.'
  ],
  documents: [
    { id: 'brief', name: 'Approved question', text: 'Fictional question: I'm thinking about taking a job in another city and I'm not sure whether to go.', share: true },
    { id: 'source', name: 'Approved context', text: 'Fictional context: I have good friends where I live now. The new job could help me grow. I have a month before I need to decide.', share: true },
    { id: 'private', name: 'Private conversation', text: 'Fictional private conversation: My sister and I argued about the move last night. That conversation isn't part of the request.', share: false }
  ],
  protectedTerms: ['My sister and I argued about the move last night']
});

function selectedPracticeIds(selectedIds) {
  if (!Array.isArray(selectedIds) || selectedIds.length !== 2
    || !Object.hasOwn(selectedIds, 0) || !Object.hasOwn(selectedIds, 1)
    || selectedIds.some(id => !['brief', 'source'].includes(id))
    || new Set(selectedIds).size !== 2) {
    throw new TypeError('FIRST_CROSSING_SELECTION_HELD: select the approved question and context; leave the private exchange out of this local handoff.');
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
  const answer = 'You could write down what you'd gain by moving and what you'd miss about staying. You could also talk to someone who has made a similar change. With a month to decide, you have time to explore both. One question: what matters most to you about where you live?';
  const response_check = inspectLoomAiResponse({
    schema:'td613.loom.ai-task-result/v0.1', request_id:binding.request_id, status:'completed',
    answer, missing_information:[], suggested_next_step:'Review before sharing.', used_document_ids:[...binding.selected_document_ids]
  }, {request_id:binding.request_id, shared_document_ids:binding.selected_document_ids, protectedTerms:FIRST_CROSSING_PRACTICE.protectedTerms});
  if(!response_check.allowed)throw new Error('The fictional reply failed its local checks.');
  const receipt = { schema: 'td613.loom.tutorial-return/v0.1', evidence_class: 'OFFLINE_TEST', fictional: true,
    request_digest: binding.input_digest, answer_digest: await portableLoomDigest(answer, environment),
    used_document_ids: [...binding.selected_document_ids], response_check, provider_called: false, custody_admitted: false };
  return freeze({ answer, receipt, receipt_digest: await portableLoomDigest(receipt, environment) });
}
