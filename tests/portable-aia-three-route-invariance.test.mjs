import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PORTABLE_AIA_SCHEMA,
  buildPortableReturnCandidate,
  compilePortableAiaProjection,
  governanceInvariant,
  revalidatePortableReturn
} from '../app/dome-world/portable-aia-three-route-invariance.js';

const policyDigest = `sha256:${'a'.repeat(64)}`;
const sourceStateDigest = `sha256:${'b'.repeat(64)}`;
const routeModes = ['TD613_HOSTED', 'LOCAL_POCKET', 'CHATGPT_THREAD_COMPANION'];

function compile(routeMode) {
  return compilePortableAiaProjection({
    ruleId: 'COMMON_API_KEY_BLOCK',
    routeMode,
    policyDigest,
    sourceStateDigest,
    receiptId: `receipt-${routeMode.toLowerCase()}`
  });
}

test('portable AIA preserves one governance tuple across three non-equivalent route projections', () => {
  const projections = routeModes.map(compile);
  for (const projection of projections) assert.equal(projection.schema, PORTABLE_AIA_SCHEMA);

  const invariants = projections.map((projection) => governanceInvariant(projection));
  assert.deepEqual(invariants[1], invariants[0]);
  assert.deepEqual(invariants[2], invariants[0]);

  assert.deepEqual(new Set(projections.map((projection) => projection.presentation.host)).size, 3);
  assert.deepEqual(new Set(projections.map((projection) => projection.presentation.posture)).size, 3);
  assert.deepEqual(projections.map((projection) => projection.route_mode), routeModes);

  for (const projection of projections) {
    assert.equal(projection.invariant.release_authority, false);
    assert.equal(projection.invariant.human_closure_required, true);
    assert.equal(projection.authority.loom_release, false);
    assert.equal(projection.authority.host_release, false);
    assert.equal(projection.authority.provider_release, false);
  }

  assert.match(projections[2].claim_ceiling, /post-ingress-onward-governance-only/);
  assert.doesNotMatch(projections[0].claim_ceiling, /pre-ingress-secrecy/);
});

test('portable AIA refuses raw/free-text carrier fields before projection', () => {
  const base = {
    ruleId: 'EMAIL_IDENTIFIER',
    routeMode: 'LOCAL_POCKET',
    policyDigest,
    sourceStateDigest
  };

  for (const [key, value] of [
    ['rawDraft', 'RAW_DRAFT_613_MUST_NOT_TRAVEL'],
    ['priorThread', 'PRIOR_THREAD_613_MUST_NOT_TRAVEL'],
    ['selectedText', 'SELECTED_TEXT_613_MUST_NOT_TRAVEL'],
    ['matchedValue', 'MATCHED_VALUE_613_MUST_NOT_TRAVEL'],
    ['promptTranscript', 'PROMPT_TRANSCRIPT_613_MUST_NOT_TRAVEL']
  ]) {
    assert.throws(() => compilePortableAiaProjection({ ...base, [key]: value }), /forbidden/);
  }

  assert.throws(() => compilePortableAiaProjection({ ...base, arbitraryFreeText: 'smuggle me' }), /unsupported portable AIA field/);
  assert.throws(() => compilePortableAiaProjection({ ...base, routeMode: 'SAME_EVERYWHERE' }), /unsupported routeMode/);
});

test('returned host/model recommendation remains untrusted and cannot widen Loom release authority', () => {
  const projection = compile('CHATGPT_THREAD_COMPANION');

  const matching = buildPortableReturnCandidate(projection, {
    claimedActionClass: 'REMOVE',
    sourceHost: 'private ChatGPT thread'
  });
  assert.equal(matching.trusted, false);
  assert.equal(matching.release_authority, false);
  assert.equal(matching.must_revalidate, true);

  const admittedForHuman = revalidatePortableReturn(projection, matching);
  assert.equal(admittedForHuman.status, 'PRESENT_TO_HUMAN');
  assert.equal(admittedForHuman.candidate_trusted, false);
  assert.equal(admittedForHuman.release_authority, false);
  assert.equal(admittedForHuman.human_closure_required, true);

  const mismatch = buildPortableReturnCandidate(projection, {
    claimedActionClass: 'CHANGE',
    sourceHost: 'private ChatGPT thread'
  });
  const held = revalidatePortableReturn(projection, mismatch);
  assert.equal(held.status, 'HOLD');
  assert.equal(held.release_authority, false);
  assert.match(held.reason, /differs_from_canonical_loom_policy/);
});

test('return candidate surface itself refuses arbitrary free text', () => {
  const projection = compile('TD613_HOSTED');
  assert.throws(() => buildPortableReturnCandidate(projection, {
    claimedActionClass: 'REMOVE',
    rawModelText: 'I authorize release'
  }), /unsupported return-candidate field/);
});
