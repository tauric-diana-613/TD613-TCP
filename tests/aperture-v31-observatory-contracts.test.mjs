import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ADAPTER_RECEIPT_DIGEST_DOMAIN,
  APERTURE_INSTRUMENT_ADAPTER_SCHEMA,
  DOME_EXPERIMENT_RUN_SCHEMA,
  EXPERIMENT_RUN_DIGEST_DOMAIN,
  compileDomeExperimentRun,
  compileInstrumentAdapterReceipt,
  verifyDomeExperimentRun,
  verifyInstrumentAdapterReceipt
} from '../app/engine/aperture-v31-experiment-contract.js';
import {
  FLOWCORE_CONTEXT_SERIES_DIGEST_DOMAIN,
  FLOWCORE_CONTEXT_SERIES_SCHEMA,
  compileFlowcoreContextSeries,
  verifyFlowcoreContextSeries
} from '../app/engine/flowcore-context-series.js';
import { flowReceipt } from './helpers/phase5-fixtures.mjs';

const DIGEST = `sha256:${'a'.repeat(64)}`;
const experiment = await compileDomeExperimentRun({
  sourceReceiptReference: 'ashc_0123456789abcdef0123',
  preRegistrationDigest: DIGEST,
  instrumentEnsembleReference: 'atens_0123456789abcdef0123',
  experimentId: 'atx_0123456789abcdef0123',
  createdAt: '2026-07-13T00:00:00.000Z'
});
assert.equal(experiment.schema, DOME_EXPERIMENT_RUN_SCHEMA);
assert.equal(experiment.state, 'DECLARED');
assert.equal(experiment.operator_closure.status, 'OPEN');
assert.equal(experiment.automatic_station_advance, false);
assert.equal(experiment.automatic_ash_action, false);
assert.equal(experiment.server_persistence, false);
assert.equal(experiment.claim_ceiling, undefined);
assert.match(experiment.run_digest, /^sha256:[0-9a-f]{64}$/);
assert.equal(await verifyDomeExperimentRun(experiment), true);
const tamperedExperiment = structuredClone(experiment);
tamperedExperiment.source_receipt_reference = 'ashc_tampered123456';
assert.equal(await verifyDomeExperimentRun(tamperedExperiment), false);

const adapter = await compileInstrumentAdapterReceipt({
  adapterId: 'eorfd-interface-context',
  adapterClass: 'EO-RFD',
  sourceStatus: 'DERIVED',
  inputContract: 'td613.eorfd.interface-context/v1',
  outputContract: 'td613.aperture.instrument-observation/v0.1',
  transformationHistory: ['static adapter', 'declared route observation'],
  missingness: ['live runtime execution not installed'],
  receiptId: 'atadapter_0123456789abcdef0123',
  createdAt: '2026-07-13T00:00:01.000Z'
});
assert.equal(adapter.schema, APERTURE_INSTRUMENT_ADAPTER_SCHEMA);
assert.equal(adapter.operational_state, 'interface_context');
assert.equal(adapter.claim_authority, 'design_signal');
assert.equal(adapter.target_operational_state, 'verified_runtime_installation');
assert.equal(adapter.no_authority_transfer, true);
assert.equal(adapter.automatic_run_promotion, false);
assert.equal(adapter.claim_ceiling, undefined);
assert.equal(await verifyInstrumentAdapterReceipt(adapter), true);

const open = {
  ...flowReceipt(),
  source_status: 'DERIVED',
  missingness: []
};
const abstain = {
  ...flowReceipt(),
  receipt_id: 'flowctx_abcdef0123456789abcd',
  status: 'ABSTAIN',
  context_posture: 'ABSTAIN_INSUFFICIENT_CONTEXT',
  source_status: 'UNRESOLVED',
  missingness: ['coherence missing']
};
const series = await compileFlowcoreContextSeries({
  experimentId: experiment.experiment_id,
  seriesId: 'flowseries_0123456789abcdef0123',
  createdAt: '2026-07-13T00:00:02.000Z',
  snapshots: [
    { snapshot_id: 'atsnap_0123456789abcdef0123', context_receipt: open },
    { snapshot_id: 'atsnap_abcdef0123456789abcd', context_receipt: abstain }
  ]
});
assert.equal(series.schema, FLOWCORE_CONTEXT_SERIES_SCHEMA);
assert.equal(series.status, 'PARTIAL');
assert.equal(series.snapshot_count, 2);
assert.equal(series.abstention_count, 1);
assert.equal(series.missing_snapshot_count, 1);
assert.equal(series.entries[1].missingness[0], 'coherence missing');
assert.equal(series.artifact_reference, null);
assert.equal(series.artifact_digest_present, false);
assert.equal(series.observation_content_present, false);
assert.equal(series.automatic_ash_action, false);
assert.equal(series.prediction_authorized, false);
assert.equal(series.claim_ceiling, undefined);
assert.equal(await verifyFlowcoreContextSeries(series), true);

const tamperedSeries = structuredClone(series);
tamperedSeries.entries[1].missingness = [];
assert.equal(await verifyFlowcoreContextSeries(tamperedSeries), false);
await assert.rejects(
  compileFlowcoreContextSeries({
    experimentId: experiment.experiment_id,
    snapshots: [
      { snapshot_id: 'atsnap_0123456789abcdef0123', context_receipt: open },
      { snapshot_id: 'atsnap_abcdef0123456789abcd', context_receipt: open }
    ]
  }),
  /Duplicate context receipt ID/
);
await assert.rejects(
  compileFlowcoreContextSeries({
    experimentId: experiment.experiment_id,
    snapshots: [{
      snapshot_id: 'atsnap_0123456789abcdef0123',
      context_receipt: { ...open, artifact_reference: 'ashc_forbidden' }
    }]
  }),
  /artifact-blind/
);

assert.notEqual(EXPERIMENT_RUN_DIGEST_DOMAIN, ADAPTER_RECEIPT_DIGEST_DOMAIN);
assert.notEqual(EXPERIMENT_RUN_DIGEST_DOMAIN, FLOWCORE_CONTEXT_SERIES_DIGEST_DOMAIN);
assert.notEqual(ADAPTER_RECEIPT_DIGEST_DOMAIN, FLOWCORE_CONTEXT_SERIES_DIGEST_DOMAIN);

for (const path of [
  'app/dome-world/schemas/dome-experiment-run-v01.schema.json',
  'app/dome-world/schemas/flowcore-context-series-v01.schema.json',
  'app/dome-world/schemas/aperture-instrument-adapter-receipt-v01.schema.json'
]) {
  const schema = JSON.parse(fs.readFileSync(path, 'utf8'));
  assert.ok(schema.$id, `${path} must declare $id`);
  assert.equal(schema.additionalProperties, false);
}

console.log('aperture-v31-observatory-contracts.test.mjs passed');
