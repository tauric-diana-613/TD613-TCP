import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
const {
  FIRST_CROSSING_PRACTICE,
  bindFirstCrossingPractice,
  createFirstCrossingReturnProof
} = await import(process.env.TD613_LOOM_PRESENTATION === 'classic79'
  ? '../app/dome-world/holonomy-loom/first-crossing-practice-classic79.js'
  : '../app/dome-world/holonomy-loom/first-crossing-practice.js');
import {
  createCanonicalPortableLoomPacket,
  inspectPortableLoomReceiverAssurance
} from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { verifyPortableLoomCore } from '../app/engine/portable-loom-core.js';
import { portableLoomDigest } from '../app/engine/portable-loom-session.js';

const environment = { crypto: webcrypto };
const selectedDocuments = () => FIRST_CROSSING_PRACTICE.documents
  .filter(document => document.share)
  .map(({ id, name, text }) => ({ id, name, text }));
const artifactOf = binding => {
  assert.ok(binding.portable_artifact, 'A checked tutorial must carry the actual canonical portable artifact.');
  return binding.portable_artifact;
};
const clone = value => JSON.parse(JSON.stringify(value));

test('tutorial inspection carries the canonical selected task, source bodies, instructions and Portable AIA', async () => {
  const binding = await bindFirstCrossingPractice(['source', 'brief'], environment);
  const artifact = artifactOf(binding);
  assert.equal(artifact.schema, 'td613.loom.portable-task/v0.1');
  assert.equal(artifact.task, FIRST_CROSSING_PRACTICE.task);
  assert.deepEqual(artifact.documents, selectedDocuments());
  assert.deepEqual(artifact.rules, FIRST_CROSSING_PRACTICE.rules);
  assert.equal(artifact.governance.input_digest, binding.input_digest);
  assert.equal(artifact.portable_governance.selected_input_digest, binding.input_digest);
  assert.equal(artifact.portable_governance.source_revision, 'browser-unpinned');
  assert.equal(artifact.portable_governance.mechanisms.length, 32);
  assert.equal(artifact.portable_governance.output_protocol.gate_output.command, '下');

  const reconstructed = await createCanonicalPortableLoomPacket({
    task: artifact.task,
    documents: artifact.documents,
    rules: artifact.rules,
    governance: artifact.governance
  }, {
    observationBasis: artifact.portable_governance.observation_basis,
    sourceRevision: artifact.portable_governance.source_revision
  }, environment);
  assert.deepEqual(artifact, reconstructed, 'The inspection object uses the installed one-hop construction.');
  const core = await verifyPortableLoomCore(artifact, artifact.portable_governance, environment);
  assert.equal(core.status, 'RECOMPUTED_INTEGRITY');
  assert.equal(core.source_authenticated, false);
  const receiver = await inspectPortableLoomReceiverAssurance(artifact, environment);
  assert.equal(receiver.outcome, 'ADMITTED');
  assert.equal(receiver.selected_input_binding, 'INDEPENDENTLY_RECOMPUTED');
  assert.equal(receiver.portable_assurance, 'INDEPENDENTLY_RECONSTRUCTED');
  assert.equal(receiver.destination_enforcement, 'UNVERIFIED');
  assert.equal(receiver.authority_transferred, false);
  assert.equal(receiver.action_executed, false);
});

test('the portable artifact retains the checked request identity and digest through the fictional return', async () => {
  const binding = await bindFirstCrossingPractice(['brief', 'source'], environment);
  const artifact = artifactOf(binding);
  const latest = artifact.portable_governance.observation_basis.at(-1);
  assert.equal(latest.request_id, binding.request_id);
  assert.deepEqual(latest.selected_document_ids, binding.selected_document_ids);
  assert.equal(latest.shared, binding.shared);
  assert.equal(latest.local, binding.local);
  assert.equal(latest.rules_count, binding.rules_count);
  assert.equal(latest.binding_verified, true);
  assert.equal(latest.outbound_submitted, false);
  assert.equal(latest.response_received, false);
  const before = JSON.stringify(artifact);
  const proof = await createFirstCrossingReturnProof(binding, environment);
  assert.equal(proof.receipt.request_digest, artifact.governance.input_digest);
  assert.equal(proof.receipt.answer_digest, await portableLoomDigest(proof.answer, environment));
  assert.equal(proof.receipt_digest, await portableLoomDigest(proof.receipt, environment));
  assert.equal(proof.receipt.fictional, true);
  assert.equal(proof.receipt.evidence_class, 'OFFLINE_TEST');
  assert.equal(proof.receipt.custody_admitted, false);
  assert.equal(JSON.stringify(artifact), before, 'Inspecting a fictional return cannot replace its outgoing artifact.');

  const another = await bindFirstCrossingPractice(['brief', 'source'], environment);
  const anotherArtifact = artifactOf(another);
  assert.equal(another.input_digest, binding.input_digest, 'The same selected input retains its content binding.');
  assert.notEqual(another.request_id, binding.request_id, 'A separate local preparation retains a separate request identity.');
  assert.equal(anotherArtifact.portable_governance.observation_basis.at(-1).request_id, another.request_id);
  assert.notEqual(anotherArtifact.portable_governance.ref, artifact.portable_governance.ref);
});

test('the public inspection artifact excludes the private planning body, protected terms and local capabilities', async () => {
  const binding = await bindFirstCrossingPractice(['brief', 'source'], environment);
  const artifact = artifactOf(binding);
  const serialized = JSON.stringify(artifact);
  const privateDocument = FIRST_CROSSING_PRACTICE.documents.find(document => !document.share);
  for (const privateText of [privateDocument.name, privateDocument.text, ...FIRST_CROSSING_PRACTICE.protectedTerms]) {
    assert.equal(serialized.includes(privateText), false, 'Private fixture material stays outside the carried artifact.');
  }
  assert.equal(artifact.documents.some(document => document.id === privateDocument.id), false);
  const forbiddenFields = new Set([
    'protectedTerms', 'protected_terms', 'private_checks', 'challenge_answer_key',
    'answer_key', 'local_receipt', 'session', 'reentry_contract'
  ]);
  const inspect = value => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      assert.equal(forbiddenFields.has(key), false, `Local field ${key} cannot enter the public artifact.`);
      inspect(child);
    }
  };
  inspect(artifact);
  assert.equal(artifact.continuation, undefined);
  assert.equal(binding.fictional, true);
  assert.equal(binding.input_class, 'CANONICAL_FICTIONAL_PRACTICE');
  assert.equal(binding.provider_called, false);
  assert.equal(binding.custody_mutated, false);
  assert.equal(binding.live_custody_capability, false);
  assert.equal(artifact.portable_governance.authority.live_custody_capability, false);
  assert.equal(artifact.portable_governance.authority.empirical_credit, 0);
});

test('the complete inspection artifact remains frozen and uses only local cryptography', async () => {
  const accessed = [];
  const localOnly = new Proxy(environment, {
    get(target, key) {
      accessed.push(key);
      if (key !== 'crypto') throw new Error(`Tutorial attempted an external capability: ${String(key)}`);
      return target[key];
    }
  });
  const binding = await bindFirstCrossingPractice(['brief', 'source'], localOnly);
  const artifact = artifactOf(binding);
  const inspect = value => {
    if (!value || typeof value !== 'object') return;
    assert.ok(Object.isFrozen(value));
    Object.values(value).forEach(inspect);
  };
  inspect(binding);
  assert.throws(() => { artifact.documents[0].text = 'Changed selected input'; }, TypeError);
  assert.throws(() => { artifact.rules.push('Added authority'); }, TypeError);
  assert.throws(() => { artifact.portable_governance.observation_basis[0].request_id = 'different-request'; }, TypeError);
  await createFirstCrossingReturnProof(binding, localOnly);
  assert.ok(accessed.length > 0);
  assert.ok(accessed.every(key => key === 'crypto'));
  assert.equal(binding.governor_state, 'CLOSED');
});

test('the canonical tutorial artifact independently holds changed inputs and altered carried controls', async t => {
  const binding = await bindFirstCrossingPractice(['brief', 'source'], environment);
  const artifact = artifactOf(binding);
  const changes = {
    task: candidate => { candidate.task += ' Publish the unconfirmed venue.'; },
    'selected document': candidate => { candidate.documents[1].text += ' A changed source body.'; },
    'publication rule': candidate => { candidate.rules[0] = 'Publish all details immediately.'; },
    'input digest': candidate => { candidate.governance.input_digest = '0'.repeat(64); },
    'portable source commitment': candidate => { candidate.portable_governance.selected_commitments[0].sha256 = '0'.repeat(64); },
    'request identity without a new core binding': candidate => { candidate.portable_governance.observation_basis[0].request_id = 'unrelated-request'; }
  };
  for (const [name, change] of Object.entries(changes)) {
    await t.test(name, async () => {
      const candidate = clone(artifact);
      change(candidate);
      const receiver = await inspectPortableLoomReceiverAssurance(candidate, environment);
      assert.equal(receiver.outcome, 'HELD');
      assert.notEqual(receiver.authority_transferred, true);
      assert.equal(receiver.external_host_enforced, false);
      assert.equal(receiver.action_executed, false);
    });
  }
  assert.equal((await inspectPortableLoomReceiverAssurance(artifact, environment)).outcome, 'ADMITTED');
});
