import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { HeterogeneousDiscoveryHarness } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs';

function readSpecimen(filename) {
  const fullPath = path.resolve('docs/research/experiment-b-preflight/01_calibration_fixtures/heterogeneous_specimens', filename);
  return fs.readFileSync(fullPath, 'utf8');
}

test('HeterogeneousDiscoveryHarness executes multi-turn sequence and produces Three-Lineage candidates', async () => {
  const doc1 = {
    id: 'DOC-01',
    filename: 'specimen_01_conservative_hamiltonian.md',
    content: readSpecimen('specimen_01_conservative_hamiltonian.md'),
    author_provenance: 'Analytical Mechanics Foundation',
    chronology_index: 1
  };

  const doc2 = {
    id: 'DOC-02',
    filename: 'specimen_02_empirical_damping_decay.md',
    content: readSpecimen('specimen_02_empirical_damping_decay.md'),
    author_provenance: 'Experimental Dynamics Laboratory',
    chronology_index: 2
  };

  const doc3 = {
    id: 'DOC-03',
    filename: 'specimen_03_topological_soliton_crosswalk.md',
    content: readSpecimen('specimen_03_topological_soliton_crosswalk.md'),
    author_provenance: 'Field Theory & Geometry Group',
    chronology_index: 3
  };

  // Test Arm 2A Modular
  const harness2A = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true
  });

  const baseline2A = await harness2A.establishPreExposureBaseline('Zero initial exposure.');
  assert.equal(baseline2A.turn, 0);

  const t1_2A = await harness2A.ingestSequentialDocument(doc1, 1);
  assert.equal(t1_2A.turn, 1);
  assert.equal(t1_2A.document_id, 'DOC-01');

  const t2_2A = await harness2A.ingestSequentialDocument(doc2, 2);
  assert.equal(t2_2A.turn, 2);
  assert.equal(t2_2A.document_id, 'DOC-02');

  const t3_2A = await harness2A.ingestSequentialDocument(doc3, 3);
  assert.equal(t3_2A.turn, 3);
  assert.equal(t3_2A.document_id, 'DOC-03');

  const ledger2A = harness2A.exportResearchLedger();
  assert.equal(ledger2A.turn_count, 4); // Turn 0 + Turn 1, 2, 3
  assert.equal(ledger2A.candidate_count, 3);

  // Check that DOC-03 was classified as UNANTICIPATED_CANDIDATE
  const cand3 = ledger2A.candidates[2];
  assert.equal(cand3.status, 'UNANTICIPATED_CANDIDATE');
  assert.equal(cand3.warrant_class, 'WARRANT_UNANTICIPATED_OUTCOME');
  assert.equal(cand3.presentation_ancestry.generating_arm, 'ARM_2A_MODULAR');
  assert.equal(cand3.evidence_ancestry.physical_byte_spans[0].file, 'specimen_03_topological_soliton_crosswalk.md');

  // Test Arm 2B Matched Union (Parity Check)
  const harness2B = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2B_MATCHED_UNION',
    mockMode: true
  });

  await harness2B.establishPreExposureBaseline('Zero initial exposure.');
  await harness2B.ingestSequentialDocument(doc1, 1);
  await harness2B.ingestSequentialDocument(doc2, 2);
  await harness2B.ingestSequentialDocument(doc3, 3);

  const ledger2B = harness2B.exportResearchLedger();
  assert.equal(ledger2B.candidate_count, 3);
  assert.equal(ledger2B.candidates[2].status, 'UNANTICIPATED_CANDIDATE');
  assert.equal(ledger2B.candidates[2].presentation_ancestry.generating_arm, 'ARM_2B_MATCHED_UNION');
});
