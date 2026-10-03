import { buildLoomAiRequest } from './ai-intake.js';
import { createLoomAiGovernance, createLoomAiTaskGovernor } from './ai-handoff.js';

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
