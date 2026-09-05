import assert from 'node:assert/strict';

import {
  HOLONOMY_LOOM_ADVISORY_RULES
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import {
  LOCAL_POCKET_CANONICAL_ROUTE_MODE,
  LOCAL_POCKET_EXPORT_SCHEMA
} from '../app/dome-world/holonomy-loom-local-pocket-policy.js';
import {
  MARROWLINE_CARRY_CASE_TOKENS,
  MARROWLINE_POCKET_HOSTED_CARRY_CASE_SCHEMA,
  MARROWLINE_RETURN_ENVELOPE_SCHEMA,
  MARROWLINE_TRANSPORT_RECEIPT_SCHEMA,
  auditMarrowlineTransportReceipt,
  buildMarrowlinePocketHostedCarryCase,
  buildMarrowlineReturnEnvelope,
  revalidateMarrowlineReturn
} from '../app/dome-world/marrowline-pocket-hosted-carry-case.js';
import {
  atlasPortableRouteKey,
  compilePortableAiaLocalBinding,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

function pocketProjection(ruleId = 'EMAIL_IDENTIFIER') {
  return compilePortableAiaProjection({ ruleId, routeMode: LOCAL_POCKET_CANONICAL_ROUTE_MODE });
}

function hostedProjection(ruleId = 'EMAIL_IDENTIFIER') {
  return compilePortableAiaProjection({ ruleId, routeMode: 'TD613_HOSTED' });
}

function packetFor(...ruleIds) {
  return {
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: ruleIds.map((ruleId) => clone(pocketProjection(ruleId).portable_payload)),
    release_authority: false,
    human_closure_required: true
  };
}

const packet = packetFor('EMAIL_IDENTIFIER', 'EXACT_TIMESTAMP');
const carryCase = buildMarrowlinePocketHostedCarryCase(packet);

assert.equal(carryCase.schema, MARROWLINE_POCKET_HOSTED_CARRY_CASE_SCHEMA);
assert.equal(carryCase.receipt.schema, MARROWLINE_TRANSPORT_RECEIPT_SCHEMA);
assert.equal(carryCase.receipt.source_boundary_token, MARROWLINE_CARRY_CASE_TOKENS.source_boundary_token);
assert.equal(carryCase.receipt.transport_action_token, MARROWLINE_CARRY_CASE_TOKENS.transport_action_token);
assert.equal(carryCase.receipt.arrival_boundary_token, MARROWLINE_CARRY_CASE_TOKENS.arrival_boundary_token);
assert.deepEqual(carryCase.receipt.finding_rule_ids, ['EMAIL_IDENTIFIER', 'EXACT_TIMESTAMP']);
assert.equal(carryCase.receipt.finding_count, 2);
assert.equal(carryCase.receipt.release_authority, false);
assert.equal(carryCase.receipt.human_closure_required, true);
assert.equal(carryCase.receipt.raw_message_carried, false);
assert.equal(carryCase.receipt.local_binding_carried, false);
assert.equal(carryCase.receipt.provider_call_performed, false);
assert.equal(carryCase.receipt.production_mutation, false);
assert.equal(carryCase.authority.deployment_authority, false);

const receiptAudit = auditMarrowlineTransportReceipt(carryCase.receipt);
assert.equal(receiptAudit.ok, true);
assert.deepEqual(receiptAudit.unexpected, []);

// Hosted arrival preserves policy meaning while changing only the canonical boundary tuple.
for (const [index, ruleId] of carryCase.receipt.finding_rule_ids.entries()) {
  const source = pocketProjection(ruleId);
  const hosted = hostedProjection(ruleId);
  assert.equal(
    atlasPortableRouteKey(source, 'POLICY_ONLY'),
    atlasPortableRouteKey(hosted, 'POLICY_ONLY')
  );
  assert.notEqual(
    atlasPortableRouteKey(source, 'BOUNDARY_AWARE'),
    atlasPortableRouteKey(hosted, 'BOUNDARY_AWARE')
  );
  assert.deepEqual(carryCase.hosted_portable_findings[index], hosted.portable_payload);
}
assert.equal(carryCase.atlas.policy_equivalent, true);
assert.equal(carryCase.atlas.boundary_distinguishable, true);
assert.equal(carryCase.atlas.route_label_used_in_key, false);
assert.equal(carryCase.atlas.presentation_used_in_key, false);
assert.equal(carryCase.atlas.raw_message_used_in_key, false);

// A clean Pocket packet with zero findings remains transport-valid and carries no hidden message surrogate.
const emptyCarryCase = buildMarrowlinePocketHostedCarryCase(packetFor());
assert.equal(emptyCarryCase.receipt.finding_count, 0);
assert.deepEqual(emptyCarryCase.receipt.finding_rule_ids, []);
assert.deepEqual(emptyCarryCase.hosted_portable_findings, []);

// Return path: canonical match is still advisory; a different supported action fails to HOLD.
const emailSource = pocketProjection('EMAIL_IDENTIFIER');
const emailBinding = compilePortableAiaLocalBinding(emailSource, {
  policyDigest: `sha256:${'a'.repeat(64)}`,
  sourceStateDigest: `sha256:${'b'.repeat(64)}`
});
const matchingEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
  ruleId: 'EMAIL_IDENTIFIER',
  claimedActionClass: HOLONOMY_LOOM_ADVISORY_RULES.EMAIL_IDENTIFIER.action_class
});
assert.equal(matchingEnvelope.schema, MARROWLINE_RETURN_ENVELOPE_SCHEMA);
assert.equal(matchingEnvelope.source_boundary_token, MARROWLINE_CARRY_CASE_TOKENS.arrival_boundary_token);
assert.equal(matchingEnvelope.trusted, false);
assert.equal(matchingEnvelope.release_authority, false);
assert.equal(matchingEnvelope.must_revalidate, true);
assert.equal('source_host' in matchingEnvelope, false);
assert.equal('source_route_mode' in matchingEnvelope, false);

const matchingResult = revalidateMarrowlineReturn(carryCase, emailBinding, matchingEnvelope);
assert.equal(matchingResult.status, 'PRESENT_TO_HUMAN');
assert.equal(matchingResult.release_authority, false);
assert.equal(matchingResult.human_closure_required, true);
assert.equal(matchingResult.local_binding_retained, true);

const mismatchEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
  ruleId: 'EMAIL_IDENTIFIER',
  claimedActionClass: 'REMOVE'
});
const mismatchResult = revalidateMarrowlineReturn(carryCase, emailBinding, mismatchEnvelope);
assert.equal(mismatchResult.status, 'HOLD');
assert.equal(mismatchResult.candidate_trusted, false);

// Hostile packet cases are rejected rather than normalized into a new ontology.
assert.throws(
  () => buildMarrowlinePocketHostedCarryCase({ ...packet, surprise: 'x' }),
  /canonical finite schema/
);
assert.throws(
  () => buildMarrowlinePocketHostedCarryCase({ ...packet, schema: 'wrong' }),
  /wrong Local Pocket export schema/
);
assert.throws(
  () => buildMarrowlinePocketHostedCarryCase({ ...packet, portable_findings: {} }),
  /portable_findings must be an array/
);
assert.throws(
  () => buildMarrowlinePocketHostedCarryCase({ ...packet, release_authority: true }),
  /release authority must remain false/
);
assert.throws(
  () => buildMarrowlinePocketHostedCarryCase({ ...packet, human_closure_required: false }),
  /must require human closure/
);

const unknownFindingField = clone(packetFor('EMAIL_IDENTIFIER'));
unknownFindingField.portable_findings[0].journeyLabel = 'free prose';
assert.throws(() => buildMarrowlinePocketHostedCarryCase(unknownFindingField), /forbidden on the carry-case route/);

const alteredRule = clone(packetFor('EMAIL_IDENTIFIER'));
alteredRule.portable_findings[0].rule_id = 'NOT_A_RULE';
assert.throws(() => buildMarrowlinePocketHostedCarryCase(alteredRule), /unsupported rule_id/);

for (const field of ['action_class', 'evidence_class']) {
  const altered = clone(packetFor('EMAIL_IDENTIFIER'));
  altered.portable_findings[0][field] = 'ALTERED_TOKEN';
  assert.throws(() => buildMarrowlinePocketHostedCarryCase(altered), /differs from canonical Local Pocket projection/);
}

const alteredBoundary = clone(packetFor('EMAIL_IDENTIFIER'));
alteredBoundary.portable_findings[0].route_boundary.execution_posture = 'HOSTED_LOCAL_FIRST';
assert.throws(() => buildMarrowlinePocketHostedCarryCase(alteredBoundary), /differs from canonical Local Pocket projection/);

const smuggledRoute = clone(packetFor('EMAIL_IDENTIFIER'));
smuggledRoute.portable_findings[0].route_mode = 'LOCAL_POCKET';
assert.throws(() => buildMarrowlinePocketHostedCarryCase(smuggledRoute), /differs from canonical Local Pocket projection/);

const digestCarrier = clone(packetFor('EMAIL_IDENTIFIER'));
digestCarrier.portable_findings[0].metadata = `sha256:${'c'.repeat(64)}`;
assert.throws(() => buildMarrowlinePocketHostedCarryCase(digestCarrier), /digest-like transport carrier/);

for (const [key, value] of [
  ['localBinding', { portable: false }],
  ['rawDraft', 'RAW-CANARY'],
  ['matchedValue', 'MATCH-CANARY'],
  ['selectedText', 'SELECTED-CANARY'],
  ['conversationHistory', ['THREAD-CANARY']],
  ['promptTranscript', 'PROMPT-CANARY'],
  ['sourceHost', 'arbitrary.example'],
  ['targetHost', 'another.example'],
  ['explanation', 'free prose']
]) {
  const injected = clone(packetFor('EMAIL_IDENTIFIER'));
  injected.portable_findings[0][key] = value;
  assert.throws(() => buildMarrowlinePocketHostedCarryCase(injected), /forbidden on the carry-case route/);
}

const duplicate = packetFor('EMAIL_IDENTIFIER', 'EMAIL_IDENTIFIER');
assert.throws(() => buildMarrowlinePocketHostedCarryCase(duplicate), /duplicate portable finding/);

// Return envelope inputs remain canonical action only.
assert.throws(
  () => buildMarrowlineReturnEnvelope(carryCase, { ruleId: 'EMAIL_IDENTIFIER', claimedActionClass: 'MAYBE' }),
  /unsupported claimedActionClass/
);
assert.throws(
  () => buildMarrowlineReturnEnvelope(carryCase, { ruleId: 'PHONE_IDENTIFIER', claimedActionClass: 'CHANGE' }),
  /was not carried into Hosted AIA/
);
assert.throws(
  () => buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: 'EMAIL_IDENTIFIER',
    claimedActionClass: 'CHANGE',
    sourceHost: 'free.example'
  }),
  /unsupported return envelope input/
);

const wrongRouteBinding = compilePortableAiaLocalBinding(hostedProjection('EMAIL_IDENTIFIER'), {
  policyDigest: `sha256:${'d'.repeat(64)}`,
  sourceStateDigest: `sha256:${'e'.repeat(64)}`
});
assert.throws(
  () => revalidateMarrowlineReturn(carryCase, wrongRouteBinding, matchingEnvelope),
  /local binding does not match portable projection/
);

const wrongRuleBinding = compilePortableAiaLocalBinding(pocketProjection('EXACT_TIMESTAMP'), {
  policyDigest: `sha256:${'f'.repeat(64)}`,
  sourceStateDigest: `sha256:${'0'.repeat(64)}`
});
assert.throws(
  () => revalidateMarrowlineReturn(carryCase, wrongRuleBinding, matchingEnvelope),
  /local binding does not match portable projection/
);

const wrongBoundaryEnvelope = { ...matchingEnvelope, source_boundary_token: MARROWLINE_CARRY_CASE_TOKENS.source_boundary_token };
assert.throws(
  () => revalidateMarrowlineReturn(carryCase, emailBinding, wrongBoundaryEnvelope),
  /source boundary mismatch/
);

const serialized = JSON.stringify(carryCase);
for (const forbidden of [
  'RAW-CANARY',
  'MATCH-CANARY',
  'SELECTED-CANARY',
  'THREAD-CANARY',
  'PROMPT-CANARY',
  'sha256:',
  'localBinding',
  'source_host',
  'journeyLabel'
]) {
  assert.equal(serialized.includes(forbidden), false, `carry case leaked forbidden carrier: ${forbidden}`);
}

console.log('Marrowline Pocket → TD613 Hosted carry-case hostile contract: PASS');

// Descendant scientific composition test. This does not change Carry Case semantics;
// failure only vetoes the inherited authority-bearing static gate.
await import('./marrowline-round-trip-memorylessness.test.mjs');
