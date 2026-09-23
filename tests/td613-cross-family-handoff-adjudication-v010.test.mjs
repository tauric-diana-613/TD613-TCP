import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  compileRelationProposal,
  validateFlowCoreContextReceipt,
  validateRoundTripReceipt
} from '../app/engine/phase5-relation-contract.js';
import { R0_RECEIPT_REFERENCES_ONLY } from '../app/engine/phase5-relation-crypto.js';
import { sourceSet } from './helpers/phase5-fixtures.mjs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-15-cross-family-handoff-adjudication-v010.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-15-CROSS-FAMILY-HANDOFF-ADJUDICATION-V0_10.md';
const assay = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

const source = await sourceSet({ assurance: 'L0_METADATA_ONLY' });

async function collapsedHandoff(flowcoreReceipt, roundTripReceipt) {
  try {
    await compileRelationProposal({
      ashReceipt: source.ash,
      flowcoreReceipt,
      roundTripReceipt,
      assuranceClass: R0_RECEIPT_REFERENCES_ONLY,
      routeScope: 'v010-hostile-control'
    });
    return 'PROCEED';
  } catch {
    return 'HOLD';
  }
}

async function roleTypedAdjudication(flowcoreReceipt, roundTripReceipt) {
  try {
    validateFlowCoreContextReceipt(flowcoreReceipt);
  } catch {
    return 'FLOWCORE_AUTHORITY_CONTRACT';
  }
  try {
    await validateRoundTripReceipt(roundTripReceipt, flowcoreReceipt);
  } catch (error) {
    return /does not reference the selected Flow-Core receipt/i.test(String(error?.message || ''))
      ? 'FLOWCORE_TO_APERTURE_REFERENCE_JOIN'
      : 'APERTURE_ROUNDTRIP_JURISDICTION';
  }
  return 'VALID_HANDOFF';
}

// Baseline: independently valid Flow-Core + round-trip pair composes into a bounded
// Phase-5 proposal while preserving separate provenance references.
validateFlowCoreContextReceipt(source.flow);
const validRoundTrip = await validateRoundTripReceipt(source.roundTrip, source.flow);
assert.match(validRoundTrip.replay.status, /^ROUND_TRIP_VERIFIED/);
const validProposal = await compileRelationProposal({
  ashReceipt: source.ash,
  flowcoreReceipt: source.flow,
  roundTripReceipt: source.roundTrip,
  assuranceClass: R0_RECEIPT_REFERENCES_ONLY,
  routeScope: 'v010-valid-control'
});
assert.equal(validProposal.envelope.state, 'PROPOSED');
assert.equal(validProposal.envelope.references.ash_custody_receipt_id, source.ash.receipt_id);
assert.equal(validProposal.envelope.references.flowcore_context_receipt_id, source.flow.receipt_id);
assert.equal(validProposal.envelope.references.aperture_round_trip_receipt_id, source.roundTrip.receipt_id);
assert.equal(validProposal.envelope.automatic_relation_creation, false);
assert.equal(validProposal.envelope.automatic_confirmation, false);
assert.equal(validProposal.envelope.automatic_ash_action, false);
assert.equal(validProposal.envelope.prediction_authorized, false);
assert.equal(validProposal.envelope.relation_is_identity, false);
assert.equal(validProposal.envelope.relation_is_causation, false);
assert.equal(validProposal.envelope.does_not_establish.includes('truth'), true);

// Hostile world A: Flow-Core widens authority. The collapsed handoff says HOLD;
// the role-typed boundary localizes the defect to Flow-Core itself.
const flowAuthority = structuredClone(source.flow);
flowAuthority.automatic_ash_action = true;
assert.equal(await collapsedHandoff(flowAuthority, source.roundTrip), 'HOLD');
assert.equal(await roleTypedAdjudication(flowAuthority, source.roundTrip), 'FLOWCORE_AUTHORITY_CONTRACT');
assert.throws(() => validateFlowCoreContextReceipt(flowAuthority), /authority boundary mismatch/i);

// Hostile world B: Flow-Core remains individually admissible but its identity no
// longer matches the Flow-Core receipt bound inside Aperture's round trip. The
// defect exists only at the cross-family join.
const referenceMismatch = structuredClone(source.flow);
referenceMismatch.receipt_id = 'flowctx_crossfamily_mismatch_v010';
assert.doesNotThrow(() => validateFlowCoreContextReceipt(referenceMismatch));
assert.equal(await collapsedHandoff(referenceMismatch, source.roundTrip), 'HOLD');
assert.equal(await roleTypedAdjudication(referenceMismatch, source.roundTrip), 'FLOWCORE_TO_APERTURE_REFERENCE_JOIN');
await assert.rejects(
  validateRoundTripReceipt(source.roundTrip, referenceMismatch),
  /does not reference the selected Flow-Core receipt/i
);

// Hostile world C: Flow-Core remains admissible and the cross-reference ID still
// matches, but Aperture's round-trip jurisdiction illegally widens reciprocal authority.
const apertureJurisdiction = structuredClone(source.roundTrip);
apertureJurisdiction.jurisdiction.reciprocal_authority = true;
assert.doesNotThrow(() => validateFlowCoreContextReceipt(source.flow));
assert.equal(apertureJurisdiction.context.receipt.receipt_id, source.flow.receipt_id);
assert.equal(await collapsedHandoff(source.flow, apertureJurisdiction), 'HOLD');
assert.equal(await roleTypedAdjudication(source.flow, apertureJurisdiction), 'APERTURE_ROUNDTRIP_JURISDICTION');
await assert.rejects(
  validateRoundTripReceipt(apertureJurisdiction, source.flow),
  /authority boundary mismatch/i
);

const hostileWorlds = [
  [flowAuthority, source.roundTrip],
  [referenceMismatch, source.roundTrip],
  [source.flow, apertureJurisdiction]
];
assert.deepEqual(
  await Promise.all(hostileWorlds.map(([flow, roundTrip]) => collapsedHandoff(flow, roundTrip))),
  ['HOLD', 'HOLD', 'HOLD'],
  'Collapsed terminal disposition must be deliberately non-localizing across all hostile worlds.'
);
assert.deepEqual(
  await Promise.all(hostileWorlds.map(([flow, roundTrip]) => roleTypedAdjudication(flow, roundTrip))),
  [
    'FLOWCORE_AUTHORITY_CONTRACT',
    'FLOWCORE_TO_APERTURE_REFERENCE_JOIN',
    'APERTURE_ROUNDTRIP_JURISDICTION'
  ],
  'Role-typed stage-local adjudication must recover all three hostile causes.'
);

assert.equal(assay.schema, 'td613.cross-family-handoff-adjudication/v0.10');
assert.equal(assay.collapsed_classifier.distinct_hostile_worlds, 3);
assert.equal(assay.collapsed_classifier.distinct_terminal_outcomes, 1);
assert.equal(assay.collapsed_classifier.terminal_outcome, 'HOLD');
assert.equal(assay.collapsed_classifier.localization_accuracy_from_terminal_only, 0);
assert.equal(assay.role_typed_boundaries.length, 4);
assert.ok(assay.role_typed_boundaries.every(row => row.scientific_epistemic_operator === false));
assert.equal(assay.valid_handoff.proposal_state, 'PROPOSED');
assert.deepEqual(assay.valid_handoff.separate_reference_families, ['ASH','FLOWCORE','APERTURE_ROUND_TRIP']);

for (const law of [
  'GENERIC_HANDOFF_HOLD != UNIQUE_FAILURE_CAUSE',
  'CROSS_FAMILY_JOIN != COMPONENT_VALIDITY',
  'FLOWCORE_VALID + ROUNDTRIP_STRUCTURALLY_PRESENT != CROSS_FAMILY_REFERENCE_CONSISTENT',
  'DECISION_EQUIVALENCE != ADJUDICATION_EQUIVALENCE',
  'MULTI_RECEIPT_PROVENANCE != MULTI_SOURCE_EMPIRICAL_CONFIRMATION',
  'REFERENCE_CONSISTENCY != TRUTH',
  'CROSS_FAMILY_ADJUDICATION_VALUE != SCIENTIFIC_OPERATOR_PROMOTION'
]) assert.ok(assay.laws.includes(law), `Receipt must preserve law: ${law}`);

assert.equal(assay.authority.scientific_promotion, false);
assert.equal(assay.authority.deployed_llm_architecture_inference, false);
assert.equal(assay.authority.externality_inference, false);
assert.equal(assay.authority.deployment, false);
assert.equal(assay.authority.vercel, false);
assert.match(operation, /DECISION_EQUIVALENCE != ADJUDICATION_EQUIVALENCE/);
assert.match(operation, /REFERENCE_CONSISTENCY != TRUTH/);
assert.match(operation, /role-typed adjudication graph/i);

console.log('TD613 cross-family handoff adjudication assay v0.10 passed.');
