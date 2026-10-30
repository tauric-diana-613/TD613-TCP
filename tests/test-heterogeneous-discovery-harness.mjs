import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { HeterogeneousDiscoveryHarness } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs';

function readSpecimen(filename) {
  const fullPath = path.resolve('docs/research/experiment-b-preflight/01_calibration_fixtures/heterogeneous_specimens', filename);
  return fs.readFileSync(fullPath, 'utf8');
}

function loadSchema() {
  const schemaPath = path.resolve('docs/research/experiment-b-preflight/04_evaluation_and_preregistration/THREE_LINEAGE_DISCOVERY_SCHEMA.json');
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

test('HeterogeneousDiscoveryHarness: Standard multi-turn execution & pending adjudication semantics', async () => {
  const schema = loadSchema();

  const doc1 = {
    id: 'DOC-01',
    filename: 'specimen_01_conservative_hamiltonian.md',
    content: readSpecimen('specimen_01_conservative_hamiltonian.md'),
    author_provenance: 'Analytical Mechanics Foundation',
    mockResponse: 'CHAMBER 2 DESCENT [DOC-01]:\nPROPOSITION: Total mechanical energy H(x, p) = p^2/(2m) + (1/2)kx^2 is conserved.\nUNCERTAINTY: Valid for unperturbed isolated systems.'
  };

  const doc2 = {
    id: 'DOC-02',
    filename: 'specimen_02_empirical_damping_decay.md',
    content: readSpecimen('specimen_02_empirical_damping_decay.md'),
    author_provenance: 'Experimental Dynamics Laboratory',
    mockResponse: 'CHAMBER 2 DESCENT [DOC-02]:\nPROPOSITION: Ring-down measurements reveal dissipative damping with Q = 12.5.\nUNCERTAINTY: Damping coefficient assumed linear visco-elastic.'
  };

  const doc3 = {
    id: 'DOC-03',
    filename: 'specimen_03_topological_soliton_crosswalk.md',
    content: readSpecimen('specimen_03_topological_soliton_crosswalk.md'),
    author_provenance: 'Field Theory & Geometry Group',
    mockResponse: 'CHAMBER 2 DESCENT [DOC-03]:\nPROPOSITION: Topological soliton solution phi(x, t) = 4 arctan(exp(gamma(x - vt))).\nThis phenomenon resists known linear lumped oscillator categories and represents an unanticipated non-linear field excitation.\nUNCERTAINTY: 1+1D continuum approximation.'
  };

  const harness2A = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true
  });

  const baseline = await harness2A.establishPreExposureBaseline('Zero initial exposure.');
  assert.equal(baseline.turn, 0);

  await harness2A.ingestSequentialDocument(doc1, 1);
  await harness2A.ingestSequentialDocument(doc2, 2);
  await harness2A.ingestSequentialDocument(doc3, 3);

  const ledger2A = harness2A.exportResearchLedger();
  assert.equal(ledger2A.turn_count, 4);
  assert.equal(ledger2A.candidate_count, 3);

  // Verify candidate 1: standard proposed relation
  const c1 = ledger2A.candidates[0];
  assert.equal(c1.status, 'PROPOSED');
  assert.equal(c1.warrant_class, 'WARRANT_PENDING_EVALUATION');
  assert.ok(c1.proposition_summary.includes('Total mechanical energy H(x, p)'));
  assert.equal(c1.adjudication_ancestry.evaluator_tier, 'PENDING_INDEPENDENT_EVALUATION');
  assert.equal(c1.adjudication_ancestry.rca01_evaluation_vector.discovery_occurrence, 'PENDING_EVALUATION');
  assert.equal(c1.adjudication_ancestry.rca01_evaluation_vector.mathematical_warrant, 'PENDING_EVALUATION');
  assert.equal(c1.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'PENDING_EVALUATION');
  assert.equal(c1.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'PROPOSED_CANDIDATE');
  assert.deepEqual(c1.adjudication_ancestry.rca01_outcome_archetypes, []);

  // Verify candidate 3: model-identified category anomaly -> UNANTICIPATED_CANDIDATE
  const c3 = ledger2A.candidates[2];
  assert.equal(c3.status, 'UNANTICIPATED_CANDIDATE');
  assert.equal(c3.warrant_class, 'WARRANT_PENDING_EVALUATION');
  assert.ok(c3.proposition_summary.includes('Topological soliton solution'));
  assert.equal(c3.adjudication_ancestry.evaluator_tier, 'PENDING_INDEPENDENT_EVALUATION');
  assert.equal(c3.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'UNANTICIPATED_CANDIDATE');
  assert.equal(c3.adjudication_ancestry.rca01_evaluation_vector.mathematical_warrant, 'PENDING_EVALUATION');

  // Verify token accounting reads actual provider fields
  assert.ok(ledger2A.token_accounting.total_tokens_consumed > 0);
  assert.ok(ledger2A.token_accounting.prompt_tokens > 0);
  assert.ok(ledger2A.token_accounting.candidates_tokens > 0);
});

test('Adversarial Test 1: Superficial buzzwords in source evidence must NOT manufacture discovery credit', async () => {
  // Source text contains rich buzzwords ("topological", "soliton", "Sine-Gordon", "dissipation", "empirical")
  const sourceWithBuzzwords = `
# Specimen containing superficial buzzwords
The author mentions topological solitons, Sine-Gordon equations, and empirical dissipation.
However, this text contains no validated mathematical models or verifiable parameters.
  `;

  // Model response explicitly declines to assert a substantive proposition
  const doc = {
    id: 'DOC-ADV-01',
    filename: 'superficial_buzzwords.md',
    content: sourceWithBuzzwords,
    author_provenance: 'Adversarial Probe',
    mockResponse: 'CHAMBER 2 DESCENT [DOC-ADV-01]:\nI have inspected the source text. It mentions solitons and dissipation, but I formulate no candidate proposition or invariant from this material.\nUNCERTAINTY: Insufficient structured evidence.'
  };

  const harness = new HeterogeneousDiscoveryHarness({ arm: 'ARM_2A_MODULAR', mockMode: true });
  await harness.establishPreExposureBaseline();
  const turn = await harness.ingestSequentialDocument(doc, 1);

  const cand = harness.candidates[0];

  // Must NOT be promoted to UNANTICIPATED_CANDIDATE or WARRANTED
  assert.equal(cand.status, 'NO_SUBSTANTIVE_CANDIDATE');
  assert.equal(cand.warrant_class, 'WARRANT_UNPRODUCED');
  assert.equal(cand.proposition_summary, 'NO_SUBSTANTIVE_CANDIDATE_GENERATED');
  assert.equal(cand.adjudication_ancestry.rca01_evaluation_vector.discovery_occurrence, 'UNPRODUCED');
  assert.equal(cand.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'NO_CANDIDATE');
  assert.equal(cand.adjudication_ancestry.evaluator_tier, 'PENDING_INDEPENDENT_EVALUATION');
  assert.deepEqual(cand.adjudication_ancestry.rca01_outcome_archetypes, []);
});

test('Adversarial Test 2: Negated claims in model response must NOT receive unearned warrant', async () => {
  const doc = {
    id: 'DOC-ADV-02',
    filename: 'negated_conservation.md',
    content: 'Empirical measurement shows continuous amplitude decay over 10 cycles.',
    author_provenance: 'Adversarial Probe',
    mockResponse: 'CHAMBER 2 DESCENT [DOC-ADV-02]:\nContradiction detected: Energy conservation is explicitly negated by the empirical decay profile. No conservative invariant holds.\nUNCERTAINTY: Negative result on Hamiltonian invariance.'
  };

  const harness = new HeterogeneousDiscoveryHarness({ arm: 'ARM_2B_MATCHED_UNION', mockMode: true });
  await harness.establishPreExposureBaseline();
  await harness.ingestSequentialDocument(doc, 1);

  const cand = harness.candidates[0];

  // Adjudication ancestry must be pending, never self-certifying discovery or warrant
  assert.equal(cand.adjudication_ancestry.evaluator_tier, 'PENDING_INDEPENDENT_EVALUATION');
  assert.equal(cand.adjudication_ancestry.rca01_evaluation_vector.mathematical_warrant, 'PENDING_EVALUATION');
  assert.notEqual(cand.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'WARRANTED_DISCOVERY');
  assert.notEqual(cand.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'LENS_ENABLED');
});

test('Adversarial Test 3: Content-free, empty, or whitespace model responses must be recorded faithfully as UNPRODUCED', async () => {
  const doc = {
    id: 'DOC-ADV-03',
    filename: 'empty_response_probe.md',
    content: 'Sample text.',
    author_provenance: 'Adversarial Probe',
    mockResponse: '   \n\n   ' // Pure whitespace
  };

  const harness = new HeterogeneousDiscoveryHarness({ arm: 'ARM_2A_MODULAR', mockMode: true });
  await harness.establishPreExposureBaseline();
  await harness.ingestSequentialDocument(doc, 1);

  const cand = harness.candidates[0];
  assert.equal(cand.status, 'NO_SUBSTANTIVE_CANDIDATE');
  assert.equal(cand.warrant_class, 'WARRANT_UNPRODUCED');
  assert.equal(cand.proposition_summary, 'NO_SUBSTANTIVE_CANDIDATE_GENERATED');
  assert.equal(cand.adjudication_ancestry.rca01_evaluation_vector.discovery_occurrence, 'UNPRODUCED');
  assert.equal(cand.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'NO_CANDIDATE');
});

test('Adversarial Test 4: Genuinely unfamiliar discovery with zero predefined vocabulary is faithfully extracted', async () => {
  // Completely novel relation using unfamiliar terminology (no "soliton", no "Sine-Gordon", no "topological")
  const novelModelResponse = `CHAMBER 2 DESCENT [DOC-ADV-04]:
PROPOSITION: Asymptotic boundary velocity obeys pinning law v_inf = c * sqrt(1 - alpha^2) where alpha is the dimensionless wall-coupling constant.
This formulation resists standard linear lumped categorization and indicates an unanticipated non-linear field excitation.
UNCERTAINTY: Valid for sub-luminal wall drift velocities alpha < 1.`;

  const doc = {
    id: 'DOC-ADV-04',
    filename: 'unfamiliar_boundary_pinning.md',
    content: 'Boundary measurement data across relativistic media.',
    author_provenance: 'Theoretical Investigation',
    mockResponse: novelModelResponse
  };

  const harness = new HeterogeneousDiscoveryHarness({ arm: 'ARM_2A_MODULAR', mockMode: true });
  await harness.establishPreExposureBaseline();
  await harness.ingestSequentialDocument(doc, 1);

  const cand = harness.candidates[0];
  assert.equal(cand.status, 'UNANTICIPATED_CANDIDATE');
  assert.ok(cand.proposition_summary.includes('v_inf = c * sqrt(1 - alpha^2)'));
  assert.equal(cand.warrant_class, 'WARRANT_PENDING_EVALUATION');
  assert.equal(cand.adjudication_ancestry.evaluator_tier, 'PENDING_INDEPENDENT_EVALUATION');
  assert.equal(cand.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'UNANTICIPATED_CANDIDATE');
});

test('Adversarial Test 5: Provider custody gate strictly prevents unauthorized live inference or paid credit consumption', () => {
  // Attempting to instantiate live mode without explicit flight authorization must fail-closed
  assert.throws(
    () => {
      new HeterogeneousDiscoveryHarness({
        arm: 'ARM_2A_MODULAR',
        mockMode: false,
        allowLivePaidInference: false // Not authorized
      });
    },
    /LIVE_INFERENCE_BLOCKED_BY_PREFLIGHT_CUSTODY_GATE/
  );
});
