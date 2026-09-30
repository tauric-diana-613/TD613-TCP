import assert from 'node:assert/strict';
import {
  APERTURE_V31_COMPATIBILITY_PROFILE,
  assertStrictV30RoundTripShape,
  compileV31CompatibleRoundTrip,
  compileV31DiagnosticForV30Bridge
} from '../app/engine/aperture-v31-compatibility.js';
import { replayRoundTripReceipt } from '../app/engine/aperture-v3-reciprocal-bridge.js';
import { auditRelationProposal } from '../app/engine/aperture-v3-relation-audit.js';
import { R0_RECEIPT_REFERENCES_ONLY } from '../app/engine/phase5-relation-crypto.js';
import { compileRelationProposal } from '../app/engine/phase5-relation-envelope.js';
import { ashReceipt, flowReceipt } from './helpers/phase5-fixtures.mjs';

function v31Diagnostic(route = 'REQUESTED_SYNTHESIS') {
  return {
    schema: 'td613.aperture.admissibility-tomography-receipt/v0.1',
    version: 'v3.1-alpha',
    receipt_id: 'apdiag_0123456789abcdef0123',
    taskIntent: {
      primary_route: route,
      runtime_materiality: 'BACKGROUND',
      automatic_redirect: false
    },
    source: { status: 'DERIVED', snapshot_count: 6 },
    runtime: { materiality: 'BACKGROUND', coverage: 0.8 },
    produced: {
      context_request: {
        metrics: {
          omissionPressure: 0.2,
          coherence: 0.75,
          divergence: 0.3,
          namingSensitivity: 0.4,
          rupturePressure: 0.1
        }
      }
    },
    v31_only_reconstruction: { alternatives: 2, signed_residuals: [-0.2, 0.1] }
  };
}

const projected = compileV31DiagnosticForV30Bridge(v31Diagnostic());
assert.equal(projected.schema, 'td613.aperture.diagnostic-receipt/v3.0-alpha');
assert.equal(projected.version, 'v3.0-alpha');
assert.equal(projected.firmwareSchema, 'td613-aperture/v3.0-alpha');
assert.equal(projected.compatibility.schema, APERTURE_V31_COMPATIBILITY_PROFILE);
assert.equal(projected.compatibility.producer_version, 'v3.1-alpha');
assert.equal(projected.compatibility.source_schema, 'td613.aperture.admissibility-tomography-receipt/v0.1');
assert.equal(projected.v31_only_reconstruction, undefined);

const flow = flowReceipt();
const compiled = await compileV31CompatibleRoundTrip(v31Diagnostic(), flow, {
  receiptId: 'aprt_0123456789abcdef0123',
  createdAt: '2026-07-13T00:00:00.000Z'
});
assert.equal(assertStrictV30RoundTripShape(compiled.round_trip_receipt), true);
assert.deepEqual(Object.keys(compiled.round_trip_receipt).sort(), [
  'audit', 'bridge_contract', 'context', 'created_at', 'diagnostic',
  'jurisdiction', 'receipt_id', 'round_trip_digest', 'route', 'schema', 'status'
].sort());
assert.equal(compiled.round_trip_receipt.schema, 'td613.aperture.round-trip-receipt/v3.0-alpha');
assert.equal(compiled.round_trip_receipt.jurisdiction.reciprocal_authority, false);
assert.equal(compiled.round_trip_receipt.route.open_field_promotion, false);
assert.equal((await replayRoundTripReceipt(compiled.round_trip_receipt)).status, 'ROUND_TRIP_VERIFIED');

const ash = await ashReceipt('L0_METADATA_ONLY');
const proposal = await compileRelationProposal({
  ashReceipt: ash,
  flowcoreReceipt: flow,
  roundTripReceipt: compiled.round_trip_receipt,
  assuranceClass: R0_RECEIPT_REFERENCES_ONLY,
  routeScope: 'v31-compatibility-test',
  bindingPurpose: 'phase5-regression-under-v31'
});
const relationAudit = await auditRelationProposal(proposal, {
  ashReceipt: ash,
  flowcoreReceipt: flow,
  roundTripReceipt: compiled.round_trip_receipt
});
assert.equal(relationAudit.outcome, 'RELATION_PROPOSAL_ADMISSIBLE');

assert.throws(
  () => compileV31DiagnosticForV30Bridge({
    ...v31Diagnostic(),
    source: { artifact_digest: `sha256:${'a'.repeat(64)}` }
  }),
  /artifact-blind/
);
assert.throws(
  () => compileV31DiagnosticForV30Bridge({
    ...v31Diagnostic(),
    taskIntent: { primary_route: 'REQUESTED_SYNTHESIS', runtime_materiality: 'BACKGROUND', automatic_redirect: true }
  }),
  /automatic redirect/
);
assert.throws(
  () => assertStrictV30RoundTripShape({ ...compiled.round_trip_receipt, producer_version: 'v3.1-alpha' }),
  /outside the frozen v3.0 contract/
);

const openField = await compileV31CompatibleRoundTrip(
  v31Diagnostic('OPEN_FIELD_SPECULATIVE_SYNTHESIS'),
  flowReceipt('OPEN_FIELD_SPECULATIVE_SYNTHESIS')
);
assert.equal(openField.round_trip_receipt.route.open_field_promotion, false);
assert.equal(openField.round_trip_receipt.audit.receipt.runtime_surfaced, false);

console.log('aperture-v31-compatibility.test.mjs passed');
