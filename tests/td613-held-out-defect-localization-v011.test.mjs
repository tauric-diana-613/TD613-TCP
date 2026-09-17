import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  compileRelationProposal,
  validateAshCustodyReceiptIntegrity,
  validateFlowCoreContextReceipt,
  validateRoundTripReceipt
} from '../app/engine/phase5-relation-contract.js';
import { R0_RECEIPT_REFERENCES_ONLY } from '../app/engine/phase5-relation-crypto.js';
import { sourceSet } from './helpers/phase5-fixtures.mjs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-15-held-out-defect-localization-v011.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-15-HELD-OUT-DEFECT-LOCALIZATION-V0_11.md';
const assay = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');
const source = await sourceSet({ assurance: 'L0_METADATA_ONLY' });

const cases = [];

cases.push({
  id: 'VALID_CONTROL',
  ash: source.ash,
  flow: source.flow,
  roundTrip: source.roundTrip,
  routeScope: 'v011-valid-control',
  options: {},
  expectedTerminal: 'PROCEED',
  expectedLocalization: 'VALID_HANDOFF'
});

const ashTamper = structuredClone(source.ash);
ashTamper.manifest.artifact_id = 'artifact_phase5_fixture_tampered_v011';
cases.push({
  id: 'ASH_DIGEST_TAMPER',
  ash: ashTamper,
  flow: source.flow,
  roundTrip: source.roundTrip,
  routeScope: 'v011-ash-digest-tamper',
  options: {},
  expectedTerminal: 'HOLD',
  expectedLocalization: 'ASH_CUSTODY_INTEGRITY'
});

const flowArtifactLeak = structuredClone(source.flow);
flowArtifactLeak.artifact_reference = 'ashc_forbidden_held_out_reference';
cases.push({
  id: 'FLOWCORE_ARTIFACT_BLINDNESS_BREACH',
  ash: source.ash,
  flow: flowArtifactLeak,
  roundTrip: source.roundTrip,
  routeScope: 'v011-flowcore-artifact-blindness',
  options: {},
  expectedTerminal: 'HOLD',
  expectedLocalization: 'FLOWCORE_CONTEXT_ADMISSIBILITY'
});

const apertureSchema = structuredClone(source.roundTrip);
apertureSchema.schema = 'td613.aperture.round-trip-receipt/unsupported-v011';
cases.push({
  id: 'APERTURE_SCHEMA_BREACH',
  ash: source.ash,
  flow: source.flow,
  roundTrip: apertureSchema,
  routeScope: 'v011-aperture-schema',
  options: {},
  expectedTerminal: 'HOLD',
  expectedLocalization: 'APERTURE_ROUNDTRIP_SCHEMA'
});

const apertureReplayTamper = structuredClone(source.roundTrip);
apertureReplayTamper.context.receipt.missingness = [
  ...(apertureReplayTamper.context.receipt.missingness || []),
  'tampered-after-round-trip-digest-v011'
];
cases.push({
  id: 'APERTURE_REPLAY_FAILURE',
  ash: source.ash,
  flow: source.flow,
  roundTrip: apertureReplayTamper,
  routeScope: 'v011-aperture-replay',
  options: {},
  expectedTerminal: 'HOLD',
  expectedLocalization: 'APERTURE_ROUNDTRIP_REPLAY'
});

cases.push({
  id: 'PHASE5_ROUTE_CONTRACT_FAILURE',
  ash: source.ash,
  flow: source.flow,
  roundTrip: source.roundTrip,
  routeScope: '',
  options: {},
  expectedTerminal: 'HOLD',
  expectedLocalization: 'PHASE5_RELATION_COMPOSITION'
});

async function collapsedTerminal(row) {
  try {
    await compileRelationProposal({
      ashReceipt: row.ash,
      flowcoreReceipt: row.flow,
      roundTripReceipt: row.roundTrip,
      assuranceClass: R0_RECEIPT_REFERENCES_ONLY,
      routeScope: row.routeScope
    }, row.options);
    return 'PROCEED';
  } catch {
    return 'HOLD';
  }
}

async function roleTypedLocalization(row) {
  try {
    await validateAshCustodyReceiptIntegrity(row.ash);
  } catch {
    return 'ASH_CUSTODY_INTEGRITY';
  }

  try {
    validateFlowCoreContextReceipt(row.flow);
  } catch {
    return 'FLOWCORE_CONTEXT_ADMISSIBILITY';
  }

  try {
    await validateRoundTripReceipt(row.roundTrip, row.flow, row.options);
  } catch (error) {
    const message = String(error?.message || '');
    if (/unsupported aperture round-trip schema/i.test(message)) return 'APERTURE_ROUNDTRIP_SCHEMA';
    if (/failed independent replay/i.test(message)) return 'APERTURE_ROUNDTRIP_REPLAY';
    return 'APERTURE_ROUNDTRIP_OTHER';
  }

  try {
    await compileRelationProposal({
      ashReceipt: row.ash,
      flowcoreReceipt: row.flow,
      roundTripReceipt: row.roundTrip,
      assuranceClass: R0_RECEIPT_REFERENCES_ONLY,
      routeScope: row.routeScope
    }, row.options);
    return 'VALID_HANDOFF';
  } catch {
    return 'PHASE5_RELATION_COMPOSITION';
  }
}

const results = [];
for (const row of cases) {
  const terminal = await collapsedTerminal(row);
  const localization = await roleTypedLocalization(row);
  const roleTerminal = localization === 'VALID_HANDOFF' ? 'PROCEED' : 'HOLD';
  results.push({ ...row, terminal, localization, roleTerminal });
  assert.equal(terminal, row.expectedTerminal, `${row.id}: collapsed terminal disposition drifted.`);
  assert.equal(roleTerminal, row.expectedTerminal, `${row.id}: role-typed binary disposition drifted.`);
  assert.equal(localization, row.expectedLocalization, `${row.id}: role-typed localization drifted.`);
}

const defectRows = results.filter(row => row.expectedTerminal === 'HOLD');
const collapsedBinaryAccuracy = results.filter(row => row.terminal === row.expectedTerminal).length / results.length;
const roleBinaryAccuracy = results.filter(row => row.roleTerminal === row.expectedTerminal).length / results.length;
const collapsedLocalizationAccuracy = defectRows.filter(row => row.terminal === row.expectedLocalization).length / defectRows.length;
const roleLocalizationAccuracy = defectRows.filter(row => row.localization === row.expectedLocalization).length / defectRows.length;

assert.equal(collapsedBinaryAccuracy, 1);
assert.equal(roleBinaryAccuracy, 1);
assert.equal(collapsedLocalizationAccuracy, 0);
assert.equal(roleLocalizationAccuracy, 1);

assert.equal(assay.schema, 'td613.held-out-defect-localization/v0.11');
assert.deepEqual(assay.training_worlds_excluded, [
  'FLOWCORE_AUTHORITY_BREACH',
  'CROSS_FAMILY_REFERENCE_MISMATCH',
  'APERTURE_JURISDICTION_BREACH'
]);
assert.equal(assay.scores.case_count, results.length);
assert.equal(assay.scores.defect_case_count, defectRows.length);
assert.equal(assay.scores.collapsed_terminal_accept_reject_accuracy, collapsedBinaryAccuracy);
assert.equal(assay.scores.role_typed_accept_reject_accuracy, roleBinaryAccuracy);
assert.equal(assay.scores.collapsed_defect_localization_accuracy, collapsedLocalizationAccuracy);
assert.equal(assay.scores.role_typed_defect_localization_accuracy, roleLocalizationAccuracy);
assert.equal(assay.scores.accept_reject_accuracy_delta, 0);
assert.equal(assay.scores.defect_localization_accuracy_delta, 1);

for (const law of [
  'ACCEPT_REJECT_ACCURACY != DEFECT_LOCALIZATION_ACCURACY',
  'SAME_BINARY_DECISION != SAME_ADJUDICATION_RESOLUTION',
  'HELD_OUT_AUTHORED_MATRIX != EXTERNAL_EMPIRICAL_VALIDATION',
  'LOCALIZATION_GAIN != TRUTH_GAIN',
  'LOCALIZATION_GAIN != SCIENTIFIC_OPERATOR_PROMOTION',
  'INTEGRITY_DEFECT != AUTHORITY_DEFECT',
  'SCHEMA_DEFECT != REPLAY_DEFECT',
  'COMPONENT_VALIDITY != COMPOSITION_VALIDITY'
]) assert.ok(assay.laws.includes(law), `Receipt must preserve law: ${law}`);

assert.equal(assay.authority.scientific_promotion, false);
assert.equal(assay.authority.empirical_generalization, false);
assert.equal(assay.authority.deployment, false);
assert.equal(assay.authority.vercel, false);
assert.match(operation, /ACCEPT_REJECT_ACCURACY != DEFECT_LOCALIZATION_ACCURACY/);
assert.match(operation, /HELD_OUT_AUTHORED_MATRIX != EXTERNAL_EMPIRICAL_VALIDATION/);
assert.match(operation, /Blind defect labels before adjudication/i);

console.log('TD613 held-out defect localization assay v0.11 passed.');
