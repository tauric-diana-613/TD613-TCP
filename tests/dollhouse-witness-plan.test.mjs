import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  auditDollhouseWitnessPlan,
  DOLLHOUSE_WITNESS_PLAN_SCHEMA,
  DOLLHOUSE_WITNESS_EVIDENCE_CLASSES
} from '../app/engine/dollhouse-witness-plan.js';

const clone = value => JSON.parse(JSON.stringify(value));
const scope = (description, objects) => ({ description, objects, bounded: true });
const instrument = (id, description) => ({ id, description });
const plan = claims => ({ schema: DOLLHOUSE_WITNESS_PLAN_SCHEMA, source_revision: 'fixture-revision', execution: false, claims });

// Two independent proving contexts: route continuity and an archive projection.
const chainClaim = {
  id: 'chain-parent-binding', claim_class: 'SIGNED_PREDECESSOR_CONTINUITY',
  statement: 'The declared child record carries a verifiable parent binding within the selected episode.',
  extent: 'DECLARED_SCOPE_ONLY',
  observation_scope: scope('A single synthetic revision chain', ['parent-A', 'child-B']),
  instrument: instrument('offline-signature-harness', 'Verify the signature and exact parent digest in the finite fixture.'),
  evidence_class: 'OFFLINE_TEST',
  positive_witness: { description: 'Matching parent digest reaches the admitted fixture branch.', artifact_refs: ['fixture:parent-match'] },
  hostile_counterexample: { description: 'Altered digest and sibling parent are held by the fixture.', artifact_refs: ['fixture:wrong-parent'] },
  unresolved_alternatives: ['the same admitted child can be replayed within its time window'],
  required_next_observation: {
    description: 'Compare the declared branch under two explicit repeat submissions.',
    observation_scope: scope('The selected episode repeat path', ['child-B-repeat-1', 'child-B-repeat-2']),
    instrument: instrument('repeat-path-harness', 'Observe the scoped response and custody record for the two repeat submissions.'),
    evidence_class: 'OFFLINE_TEST',
    distinguishes: ['the same admitted child can be replayed within its time window'],
    execution: false, authority: 'HUMAN_APPROVAL_REQUIRED'
  }
};

const archiveClaim = {
  id: 'archive-exclusion', claim_class: 'FINITE_LITERAL_EXCLUSION',
  statement: 'The three declared private literals remain absent from the bounded public projection.',
  extent: 'DECLARED_SCOPE_ONLY',
  observation_scope: scope('One synthetic archive projection', ['projection-1', 'literal-bank-1']),
  instrument: instrument('projection-byte-check', 'Compare emitted bytes with the declared finite literal bank.'),
  evidence_class: 'OFFLINE_TEST',
  positive_witness: { description: 'Exported bytes omit the three fixture literals.', artifact_refs: ['fixture:literal-check'] },
  hostile_counterexample: { description: 'Injecting each declared literal causes the bounded check to fail.', artifact_refs: ['fixture:literal-injection'] },
  unresolved_alternatives: [], required_next_observation: null
};

test('signed predecessor plan proposes a bounded falsifier without claiming global latest or replay control', () => {
  const result = auditDollhouseWitnessPlan(plan([chainClaim]));
  assert.equal(result.disposition, 'PROPOSE');
  assert.deepEqual(result.claims[0].unresolved_beyond_claim_scope, [
    'GLOBAL_LATEST_STATE_UNRESOLVED', 'REPLAY_RESISTANCE_UNRESOLVED', 'SIGNER_AND_SOURCE_AUTHENTICITY_UNVERIFIED'
  ]);
  assert.equal(result.claims[0].authority.execution, false);
  assert.equal(result.claims[0].artifact_references_authenticated, false);
  assert.equal(result.claims[0].claim_verified, false);
  assert.equal(result.source_revision_authenticated, false);
  assert.equal(result.installed_aperture_identity_changed, false);
});

test('finite archive exclusion finishes only its declared plan; universal secrecy stays unresolved', () => {
  const result = auditDollhouseWitnessPlan(plan([archiveClaim]));
  assert.equal(result.disposition, 'ASK_NOTHING');
  assert.ok(result.claims[0].basis.includes('PLAN_COMPLETENESS_IS_NOT_CLAIM_VERIFICATION'));
  assert.ok(result.claims[0].unresolved_beyond_claim_scope.includes('UNIVERSAL_SECRECY_UNRESOLVED'));
  assert.equal(result.claim_verified, false);
  assert.equal(result.claims[0].observation_performed, false);
});

test('sparse witnesses and unresolved alternatives lacking a next observation abstain rather than manufacture a question', () => {
  for (const changed of [
    { ...clone(archiveClaim), positive_witness: { description: 'A planned observation only.', artifact_refs: [] } },
    { ...clone(chainClaim), required_next_observation: null }
  ]) {
    const result = auditDollhouseWitnessPlan(plan([changed]));
    assert.equal(result.disposition, 'ABSTAIN');
    assert.equal(result.claims[0].authority.automatic_observation, false);
  }
});

test('evidence classes remain separately labelled and none is authenticated or promoted by audit', () => {
  const receipts = DOLLHOUSE_WITNESS_EVIDENCE_CLASSES.map(evidence_class => {
    const claim = { ...clone(archiveClaim), evidence_class };
    const result = auditDollhouseWitnessPlan(plan([claim]));
    assert.equal(result.claims[0].evidence_class, evidence_class);
    assert.equal(result.claims[0].artifact_references_authenticated, false);
    assert.equal(result.claim_verified, false);
    assert.equal(result.claims[0].authority.promotion_authority, false);
    return result.claims[0].evidence_ceiling;
  });
  assert.equal(new Set(receipts).size, DOLLHOUSE_WITNESS_EVIDENCE_CLASSES.length);
  assert.match(receipts.at(-1), /authenticates none/);
});

test('malformed, unsupported, unbounded and authority-widening declarations reject without output evidence', () => {
  const mutations = [
    input => { input.schema = 'unreviewed/v9'; },
    input => { input.claims = []; },
    input => { delete input.claims[0].instrument; },
    input => { input.claims[0].claim_class = 'HIDDEN_STATE_DETECTION'; },
    input => { input.claims[0].evidence_class = 'CI_PROVES_EMPIRICAL_ORIGIN'; },
    input => { input.claims[0].extent = 'UNIVERSAL_SECRECY'; },
    input => { input.claims[0].observation_scope.bounded = false; },
    input => { input.execution = true; },
    input => { input.release_authority = true; },
    input => { input.claims[0].required_next_observation.execution = true; },
    input => { input.claims[0].required_next_observation.authority = 'AUTO_EXECUTE'; },
    input => { input.claims[0].required_next_observation.distinguishes = ['an undeclared alternative']; },
    input => { input.claims.push(clone(input.claims[0])); }
  ];
  for (const mutate of mutations) {
    const input = plan([clone(chainClaim)]);
    mutate(input);
    const result = auditDollhouseWitnessPlan(input);
    assert.equal(result.disposition, 'REJECT');
    assert.deepEqual(result.claims, []);
    assert.equal(result.authority.release_authority, false);
  }
});

test('accessors, hidden fields, sparse arrays, symbols and custom prototypes stay outside the declaration boundary', () => {
  let reads = 0;
  const getter = plan([clone(archiveClaim)]);
  Object.defineProperty(getter.claims[0], 'statement', { enumerable: true, get() { reads += 1; return 'executed'; } });
  const hidden = plan([clone(archiveClaim)]);
  Object.defineProperty(hidden, 'authority', { enumerable: false, value: true });
  const sparse = plan([clone(archiveClaim)]);
  delete sparse.claims[0];
  const symbolic = plan([clone(archiveClaim)]);
  symbolic[Symbol('authority')] = true;
  const prototype = plan([clone(archiveClaim)]);
  Object.setPrototypeOf(prototype.claims[0], { inherited_authority: true });
  for (const input of [getter, hidden, sparse, symbolic, prototype, undefined]) {
    assert.equal(auditDollhouseWitnessPlan(input).disposition, 'REJECT');
  }
  assert.equal(reads, 0);
});

test('deterministic immutable output preserves disagreement without voting or mutating input', () => {
  const unresolved = { ...clone(chainClaim), required_next_observation: null };
  const input = plan([clone(archiveClaim), unresolved]);
  const original = clone(input);
  const result = auditDollhouseWitnessPlan(input);
  assert.deepEqual(result, auditDollhouseWitnessPlan(clone(input)));
  assert.deepEqual(input, original);
  assert.equal(result.disposition, 'ABSTAIN');
  assert.deepEqual(result.claims.map(claim => claim.disposition), ['ASK_NOTHING', 'ABSTAIN']);
  assert.equal(Object.hasOwn(result, 'score'), false);
  assert.equal(Object.isFrozen(result.claims[0].declaration), true);
  assert.equal(Object.isFrozen(result.claims[1].unresolved_beyond_claim_scope), true);
});
