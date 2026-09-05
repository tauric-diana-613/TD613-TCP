import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PORTABLE_AIA_SCHEMA,
  PORTABLE_AIA_PAYLOAD_SCHEMA,
  PORTABLE_AIA_LOCAL_BINDING_SCHEMA,
  PORTABLE_AIA_ATLAS_QUOTIENT_SCHEMA,
  atlasPortableRouteKey,
  atlasPortableRouteQuotient,
  auditPortablePayloadVocabulary,
  buildPortableReturnCandidate,
  compilePortableAiaLocalBinding,
  compilePortableAiaProjection,
  governanceInvariant,
  revalidatePortableReturn
} from '../app/dome-world/portable-aia-three-route-invariance.js';

const policyDigest = `sha256:${'a'.repeat(64)}`;
const sourceStateDigest = `sha256:${'b'.repeat(64)}`;
const routeModes = ['TD613_HOSTED', 'LOCAL_POCKET', 'CHATGPT_THREAD_COMPANION'];

function compile(routeMode, ruleId = 'COMMON_API_KEY_BLOCK') {
  return compilePortableAiaProjection({ ruleId, routeMode });
}

function bind(projection, overrides = {}) {
  return compilePortableAiaLocalBinding(projection, {
    policyDigest,
    sourceStateDigest,
    ...overrides
  });
}

test('portable AIA v0.2 preserves one governance invariant while keeping local commitments out of the portable payload', () => {
  const projections = routeModes.map((routeMode) => compile(routeMode));
  for (const projection of projections) {
    assert.equal(projection.schema, PORTABLE_AIA_SCHEMA);
    assert.equal(projection.portable_payload.schema, PORTABLE_AIA_PAYLOAD_SCHEMA);
  }

  const invariants = projections.map((projection) => governanceInvariant(projection));
  assert.deepEqual(invariants[1], invariants[0]);
  assert.deepEqual(invariants[2], invariants[0]);

  assert.equal(new Set(projections.map((projection) => projection.presentation.host)).size, 3);
  assert.equal(new Set(projections.map((projection) => projection.presentation.posture)).size, 3);
  assert.deepEqual(projections.map((projection) => projection.route_mode), routeModes);

  for (const projection of projections) {
    const localBinding = bind(projection);
    assert.equal(localBinding.schema, PORTABLE_AIA_LOCAL_BINDING_SCHEMA);
    assert.equal(localBinding.portable, false);
    assert.equal(localBinding.provider_context, false);
    assert.equal(localBinding.must_remain_local, true);
    assert.equal(localBinding.policy_digest, policyDigest);
    assert.equal(localBinding.source_state_digest, sourceStateDigest);

    const payload = JSON.stringify(projection.portable_payload);
    assert.doesNotMatch(payload, /sha256:/i);
    assert.doesNotMatch(payload, /receipt/i);
    assert.doesNotMatch(payload, /TD613\.com hosted|local pocket|private ChatGPT thread companion/);

    const audit = auditPortablePayloadVocabulary(projection);
    assert.equal(audit.ok, true);
    assert.equal(audit.finite_canonical_vocabulary, true);
    assert.deepEqual(audit.unexpected, []);
    assert.equal(audit.digest_token_present, false);
    assert.equal(audit.route_mode_present, false);
    assert.equal(audit.presentation_host_present, false);

    assert.equal(projection.invariant.release_authority, false);
    assert.equal(projection.invariant.human_closure_required, true);
    assert.equal(projection.authority.loom_release, false);
    assert.equal(projection.authority.host_release, false);
    assert.equal(projection.authority.provider_release, false);
  }

  assert.match(projections[2].claim_ceiling, /post-ingress-onward-governance-only/);
  assert.doesNotMatch(projections[0].claim_ceiling, /pre-ingress-secrecy/);
});

test('portable payload compiler rejects local-binding material, legacy receipt text, and raw/free-text carrier fields', () => {
  const base = {
    ruleId: 'EMAIL_IDENTIFIER',
    routeMode: 'LOCAL_POCKET'
  };

  for (const [key, value] of [
    ['rawDraft', 'RAW_DRAFT_613_MUST_NOT_TRAVEL'],
    ['priorThread', 'PRIOR_THREAD_613_MUST_NOT_TRAVEL'],
    ['selectedText', 'SELECTED_TEXT_613_MUST_NOT_TRAVEL'],
    ['matchedValue', 'MATCHED_VALUE_613_MUST_NOT_TRAVEL'],
    ['promptTranscript', 'PROMPT_TRANSCRIPT_613_MUST_NOT_TRAVEL'],
    ['receiptId', 'RECEIPT_TEXT_613_MUST_NOT_TRAVEL'],
    ['receipt_id', 'RECEIPT_TEXT_613_MUST_NOT_TRAVEL']
  ]) {
    assert.throws(() => compilePortableAiaProjection({ ...base, [key]: value }), /forbidden/);
  }

  assert.throws(() => compilePortableAiaProjection({ ...base, policyDigest }), /local-binding-only/);
  assert.throws(() => compilePortableAiaProjection({ ...base, sourceStateDigest }), /local-binding-only/);
  assert.throws(() => compilePortableAiaProjection({ ...base, arbitraryFreeText: 'smuggle me' }), /unsupported portable AIA field/);
  assert.throws(() => compilePortableAiaProjection({ ...base, routeMode: 'SAME_EVERYWHERE' }), /unsupported routeMode/);
  assert.throws(() => compilePortableAiaProjection({ ...base, ruleId: 'MADE_UP_RULE' }), /unsupported rule_id/);
});

test('Atlas preregistered receivers produce one policy class and three boundary classes without route-label keys', () => {
  const projections = routeModes.map((routeMode) => compile(routeMode));

  const policy = atlasPortableRouteQuotient(projections, 'POLICY_ONLY');
  assert.equal(policy.schema, PORTABLE_AIA_ATLAS_QUOTIENT_SCHEMA);
  assert.equal(policy.receiver, 'POLICY_ONLY');
  assert.equal(policy.input_count, 3);
  assert.equal(policy.class_count, 1);
  assert.equal(policy.classes[0].members.length, 3);

  const boundary = atlasPortableRouteQuotient(projections, 'BOUNDARY_AWARE');
  assert.equal(boundary.receiver, 'BOUNDARY_AWARE');
  assert.equal(boundary.input_count, 3);
  assert.equal(boundary.class_count, 3);
  assert.deepEqual(boundary.classes.map((entry) => entry.members.length), [1, 1, 1]);

  for (const receipt of [policy, boundary]) {
    assert.equal(receipt.route_label_used_in_key, false);
    assert.equal(receipt.presentation_used_in_key, false);
    assert.equal(receipt.raw_source_used_in_key, false);
    assert.equal(receipt.external_truth_claimed, false);
    assert.equal(receipt.physical_geometry_claimed, false);
    assert.equal(receipt.release_authority, false);
  }

  for (const projection of projections) {
    const policyKey = atlasPortableRouteKey(projection, 'POLICY_ONLY');
    const boundaryKey = atlasPortableRouteKey(projection, 'BOUNDARY_AWARE');
    assert.doesNotMatch(policyKey, /TD613_HOSTED|LOCAL_POCKET|CHATGPT_THREAD_COMPANION/);
    assert.doesNotMatch(boundaryKey, /TD613_HOSTED|LOCAL_POCKET|CHATGPT_THREAD_COMPANION/);
    assert.equal(boundaryKey.includes(projection.presentation.host), false);
  }

  assert.throws(() => atlasPortableRouteQuotient(projections, 'READ_THE_LABEL'), /unsupported Atlas portable receiver/);
  assert.throws(() => atlasPortableRouteQuotient([], 'POLICY_ONLY'), /non-empty portable projection array required/);
});

test('returned host/model recommendation is finite-token-only, route-derived, untrusted, and locally revalidated', () => {
  const projection = compile('CHATGPT_THREAD_COMPANION');
  const localBinding = bind(projection);

  const matching = buildPortableReturnCandidate(projection, {
    claimedActionClass: 'REMOVE'
  });
  assert.equal(matching.source_route_mode, 'CHATGPT_THREAD_COMPANION');
  assert.equal(matching.source_host, projection.presentation.host);
  assert.equal(matching.trusted, false);
  assert.equal(matching.release_authority, false);
  assert.equal(matching.must_revalidate, true);

  const admittedForHuman = revalidatePortableReturn(projection, localBinding, matching);
  assert.equal(admittedForHuman.status, 'PRESENT_TO_HUMAN');
  assert.equal(admittedForHuman.candidate_trusted, false);
  assert.equal(admittedForHuman.release_authority, false);
  assert.equal(admittedForHuman.human_closure_required, true);
  assert.equal(admittedForHuman.local_binding_retained, true);

  const mismatch = buildPortableReturnCandidate(projection, {
    claimedActionClass: 'CHANGE'
  });
  const held = revalidatePortableReturn(projection, localBinding, mismatch);
  assert.equal(held.status, 'HOLD');
  assert.equal(held.release_authority, false);
  assert.match(held.reason, /differs_from_canonical_loom_policy/);

  assert.throws(() => buildPortableReturnCandidate(projection, {
    claimedActionClass: 'REMOVE',
    sourceHost: 'private ChatGPT thread plus smuggled prose'
  }), /unsupported return-candidate field/);
  assert.throws(() => buildPortableReturnCandidate(projection, {
    claimedActionClass: 'REMOVE RAW_DRAFT_613_MUST_NOT_TRAVEL'
  }), /unsupported claimedActionClass/);
  assert.throws(() => buildPortableReturnCandidate(projection, {
    claimedActionClass: 'REMOVE',
    rawModelText: 'I authorize release'
  }), /unsupported return-candidate field/);

  const wrongRouteBinding = bind(compile('LOCAL_POCKET'));
  assert.throws(() => revalidatePortableReturn(projection, wrongRouteBinding, matching), /local binding does not match portable projection/);
});

test('local binding accepts only two digest commitments and remains outside provider context', () => {
  const projection = compile('TD613_HOSTED');
  const localBinding = bind(projection);
  assert.equal(localBinding.policy_digest, policyDigest);
  assert.equal(localBinding.source_state_digest, sourceStateDigest);
  assert.equal(localBinding.portable, false);
  assert.equal(localBinding.provider_context, false);

  assert.throws(() => compilePortableAiaLocalBinding(projection, {
    policyDigest,
    sourceStateDigest,
    receiptId: 'not local binding material'
  }), /unsupported local-binding field/);
  assert.throws(() => compilePortableAiaLocalBinding(projection, {
    policyDigest: 'sha256:not-a-digest',
    sourceStateDigest
  }), /policyDigest must be sha256/);
});
