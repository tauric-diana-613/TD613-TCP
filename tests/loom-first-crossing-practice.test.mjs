import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { FIRST_CROSSING_PRACTICE, bindFirstCrossingPractice, checkFirstCrossingPrivacy, createFirstCrossingReturnProof } from '../app/dome-world/holonomy-loom/first-crossing-practice.js';
import { portableLoomDigest } from '../app/engine/portable-loom-session.js';
import { buildLoomAiRequest } from '../app/dome-world/holonomy-loom/ai-intake.js';
import { createLoomAiGovernance, createLoomAiTaskGovernor } from '../app/dome-world/holonomy-loom/ai-handoff.js';

const environment = { crypto: webcrypto };

test('tutorial privacy and return proofs exercise local guards without exposing the private key',async()=>{
  const check=checkFirstCrossingPrivacy();
  assert.equal(check.blocked_private_egress_attempts,1);
  assert.equal(check.selected_documents,2);assert.equal(check.excluded_documents,1);
  assert.equal(check.whole_conversation_leakage_fraction,null);
  const binding=await bindFirstCrossingPractice(['brief','source'],environment);
  const proof=await createFirstCrossingReturnProof(binding,environment);
  assert.equal(proof.receipt.request_digest,binding.input_digest);
  assert.equal(proof.receipt.answer_digest,await portableLoomDigest(proof.answer,environment));
  assert.equal(proof.receipt_digest,await portableLoomDigest(proof.receipt,environment));
  assert.notEqual(proof.receipt.answer_digest,await portableLoomDigest(proof.answer+' changed',environment));
  assert.equal(proof.receipt.provider_called,false);
  assert.equal(proof.receipt.custody_admitted,false);
  assert.equal(JSON.stringify({check,proof}).includes(FIRST_CROSSING_PRACTICE.protectedTerms[0]),false);
  await assert.rejects(createFirstCrossingReturnProof(null,environment),/checked tutorial request/);
});

test('fictional selected material earns local readiness through installed AIA/FADT while staying unsent', async () => {
  const inaccessible = new Proxy(environment, {
    get(target, key) {
      if (key !== 'crypto') throw new Error(`Practice attempted an external capability: ${String(key)}`);
      return target[key];
    }
  });
  const binding = await bindFirstCrossingPractice(['source', 'brief'], inaccessible);
  assert.equal(FIRST_CROSSING_PRACTICE.fictional, true);
  assert.ok(Object.isFrozen(FIRST_CROSSING_PRACTICE.documents[2]));
  assert.equal(binding.input_class, 'CANONICAL_FICTIONAL_PRACTICE');
  assert.equal(binding.binding_verified, true);
  assert.deepEqual(binding.selected_document_ids, ['brief', 'source']);
  assert.deepEqual(binding.local_receipt.shared_document_ids, ['brief', 'source']);
  assert.deepEqual(binding.local_receipt.withheld_document_ids, ['private']);
  assert.equal(binding.local_receipt.protected_terms_sent, false);
  assert.equal(binding.aia.projection_family_verified.all_invariants_preserved, true);
  assert.equal(binding.aia.fadt_admission, true);
  assert.equal(binding.fadt.all_fibres_exact, true);
  assert.match(binding.input_digest, /^[a-f0-9]{64}$/);
  assert.equal(binding.governor_state, 'CLOSED');
  assert.equal(binding.outbound_submitted, false);
  assert.equal(binding.response_received, false);
  assert.equal(binding.provider_called, false);
  assert.equal(binding.custody_mutated, false);
  assert.equal(binding.live_custody_capability, false);
  assert.equal(binding.authority_transferred, false);
  assert.ok(Object.isFrozen(binding.fadt.fibres[0]));
  assert.equal(JSON.stringify(binding).includes(FIRST_CROSSING_PRACTICE.protectedTerms[0]), false);
  assert.equal(JSON.stringify(binding).includes(FIRST_CROSSING_PRACTICE.documents[0].text), false);
});

test('wrong or incomplete selection remains held before acquiring even a digest capability', async () => {
  const unavailable = new Proxy({}, { get() { throw new Error('Crypto must remain unused for invalid selection.'); } });
  for (const selection of [[], ['brief'], ['brief', 'private'], ['brief', 'source', 'private'],
    ['brief', 'brief'], new Array(2), 'brief,source', ['source', 'unknown']]) {
    await assert.rejects(bindFirstCrossingPractice(selection, unavailable), /FIRST_CROSSING_SELECTION_HELD/);
  }
});

test('the actual intake rejects the fictional private term if its body or label enters the selected envelope', () => {
  const fixture = FIRST_CROSSING_PRACTICE;
  const input = {
    task: fixture.task, rules: [...fixture.rules], protectedTerms: [...fixture.protectedTerms],
    documents: fixture.documents.map(document => ({ ...document }))
  };
  assert.doesNotThrow(() => buildLoomAiRequest(input, 'practice-control'));
  input.documents[2].text = `Fictional private body containing ${fixture.protectedTerms[0]}.`;
  input.documents[2].share = true;
  assert.throws(() => buildLoomAiRequest(input, 'practice-private-body'), error =>
    error.code === 'PROTECTED_EGRESS' && error.locations.includes('documents[2].text')
      && !error.message.includes(fixture.protectedTerms[0]));
  input.documents[2].share = false;
  input.documents[2].text = fixture.documents[2].text;
  input.documents[0].name = fixture.protectedTerms[0];
  assert.throws(() => buildLoomAiRequest(input, 'practice-private-name'), error =>
    error.code === 'PROTECTED_EGRESS' && error.locations.includes('documents[0].name'));
});

test('the installed governor refuses changed practice inputs and cannot authorize again after close', async () => {
  const fixture = FIRST_CROSSING_PRACTICE;
  const prepared = buildLoomAiRequest({
    task: fixture.task, rules: fixture.rules, documents: fixture.documents, protectedTerms: fixture.protectedTerms
  }, 'practice-governor-control');
  const shared = { task: prepared.request.task, documents: prepared.request.documents, rules: prepared.request.rules };
  shared.governance = await createLoomAiGovernance(shared, { withheldDocumentCount: 1 }, environment);
  const governor = await createLoomAiTaskGovernor(shared, environment);
  try {
    assert.equal((await governor.authorize(shared)).allowed, true);
    const changed = await governor.authorize({ ...shared, documents: shared.documents.map((document, index) =>
      index === 1 ? { ...document, text: 'A different fictional source.' } : document) });
    assert.equal(changed.allowed, false);
    assert.equal(changed.fadt.all_fibres_exact, false);
    assert.equal(changed.fadt.fibres[0].gap_size, 2);
  } finally {
    governor.close();
  }
  assert.equal((await governor.authorize(shared)).reason, 'SESSION_CLOSED');
});
