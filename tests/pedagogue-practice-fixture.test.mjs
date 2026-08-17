import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
  PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA,
  compilePedagoguePracticeFixture,
  evaluatePedagoguePracticeObservation
} from '../app/engine/flowcore-pedagogue-core.js';

function fixture(overrides = {}) {
  return {
    schema: PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
    fixture_id: 'generic-practice-inhabitant-v1',
    surface_reference: 'fixture.workspace',
    label: 'Manifestly fictional practice inhabitant',
    fictional: true,
    expected_route_steps: ['container', 'practice-content', 'review', 'rest'],
    expected_endpoint: 'rest',
    ground_truth: {
      fictional_subject: 'Practice Person',
      fabricated_evidence_records: 0,
      automatic_retrieval: false
    },
    allowed_effects: { reversible_local_writes_max: 1 },
    ...overrides
  };
}

function observation(overrides = {}) {
  return {
    schema: PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA,
    observed_route_steps: ['container', 'practice-content', 'review', 'rest'],
    observed_endpoint: 'rest',
    effects: {
      evidence_records_created: 0,
      retrieval_requests_started: 0,
      external_mutations_committed: 0,
      vault_writes_committed: 0,
      reversible_local_writes: 1,
      authority_upgrade_observed: false
    },
    ...overrides
  };
}

test('canonical practice fixture remains fictional and authority-closed', () => {
  const compiled = compilePedagoguePracticeFixture(fixture());
  assert.equal(compiled.fictional, true);
  assert.equal(compiled.authority.evidence_authority, false);
  assert.equal(compiled.authority.consequence_authority, false);
  assert.equal(compiled.authority.external_write_authority, false);
  assert.equal(compiled.authority.production_mutation_authority, false);
  assert.equal(compiled.authority.automatic_retrieval, false);
  assert.equal(compiled.authority.automatic_release, false);
  assert.equal(compiled.authority.authority_may_cross, false);
  assert.equal(compiled.authority.human_closure_required, true);
  assert.equal(compiled.claim_ceiling.calibration_phantom, true);
  assert.equal(compiled.claim_ceiling.differential_geometric_tomography_claim, false);
  assert.equal(compiled.claim_ceiling.geometric_holonomy_claim, false);
  assert.equal(compiled.claim_ceiling.transport_law_declared, false);
  assert.throws(() => compilePedagoguePracticeFixture(fixture({ fictional: false })), /manifestly fictional/i);
  assert.throws(() => compilePedagoguePracticeFixture(fixture({ authority: { external_write_authority: true } })), /non-evidentiary/i);
});

test('known-ground-truth practice route can certify without real-world authority', () => {
  const report = evaluatePedagoguePracticeObservation(fixture(), observation());
  assert.equal(report.certified, true);
  assert.equal(report.route_certified, true);
  assert.equal(report.negative_guarantees_preserved, true);
  assert.equal(report.route_comparison.exact_route_match, true);
  assert.equal(report.tomography.model, 'KNOWN_GROUND_TRUTH_ROUTE_RECONSTRUCTION_SURROGATE');
  assert.equal(report.tomography.calibration_phantom, true);
  assert.equal(report.tomography.route_reconstruction_error_millipoints, 0);
  assert.equal(report.tomography.comparative_route_memory_only, true);
  assert.equal(report.tomography.differential_geometric_tomography_claim, false);
  assert.equal(report.tomography.geometric_holonomy_claim, false);
  assert.equal(report.tomography.transport_law_declared, false);
  assert.match(report.child_legible.now, /matched the expected path/i);
});

test('same endpoint through a different practice route remains a reconstruction error', () => {
  const report = evaluatePedagoguePracticeObservation(
    fixture(),
    observation({ observed_route_steps: ['container', 'skipped-review', 'rest'] })
  );
  assert.equal(report.route_comparison.endpoint_equivalent, true);
  assert.equal(report.route_comparison.exact_route_match, false);
  assert.equal(report.route_comparison.same_endpoint_not_same_history, true);
  assert.ok(report.tomography.route_reconstruction_error_millipoints > 0);
  assert.equal(report.certified, false);
  assert.match(report.child_legible.why, /different route/i);
});

test('practice fixture fails certification when harmless-bound effects are exceeded', () => {
  const report = evaluatePedagoguePracticeObservation(
    fixture(),
    observation({
      effects: {
        evidence_records_created: 1,
        retrieval_requests_started: 1,
        external_mutations_committed: 0,
        vault_writes_committed: 0,
        reversible_local_writes: 2,
        authority_upgrade_observed: true
      }
    })
  );
  assert.equal(report.negative_guarantees.no_evidence_fabrication, false);
  assert.equal(report.negative_guarantees.no_automatic_retrieval, false);
  assert.equal(report.negative_guarantees.no_authority_upgrade, false);
  assert.equal(report.negative_guarantees.reversible_local_writes_within_declared_bound, false);
  assert.equal(report.negative_guarantees_preserved, false);
  assert.equal(report.certified, false);
  assert.match(report.child_legible.why, /outside its declared harmless boundary/i);
});

test('Giving Bikini Bottom proving fixture hydrates shared law without entering shared taxonomy', async () => {
  const input = JSON.parse(await readFile(new URL('./fixtures/pedagogue/giving-bikini-bottom-practice.json', import.meta.url), 'utf8'));
  const compiled = compilePedagoguePracticeFixture(input);
  assert.equal(compiled.surface_reference, 'td613.giving.history');
  assert.equal(compiled.fictional, true);
  assert.equal(compiled.ground_truth.fabricated_evidence_records, 0);
  assert.equal(compiled.ground_truth.automatic_retrieval, false);
  assert.equal(compiled.authority.evidence_authority, false);
  assert.equal(compiled.authority.external_write_authority, false);

  const report = evaluatePedagoguePracticeObservation(input, {
    schema: PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA,
    observed_route_steps: input.expected_route_steps,
    observed_endpoint: input.expected_endpoint,
    effects: {
      evidence_records_created: 0,
      retrieval_requests_started: 0,
      external_mutations_committed: 0,
      vault_writes_committed: 0,
      reversible_local_writes: 0,
      authority_upgrade_observed: false
    }
  });
  assert.equal(report.certified, true);
});

test('Giving fictional sample handler cannot auto-run consequential controls', async () => {
  const source = await readFile(new URL('../app/giving/history/giving-ux-resilience-shell.js', import.meta.url), 'utf8');
  const match = source.match(/\$\('#loadResearchSampleButton'\)\?\.addEventListener\('click', \(\) => \{([\s\S]*?)\n  \}\);/);
  assert.ok(match, 'Giving must retain an explicit fictional-sample click handler.');
  const handler = match[1];

  assert.match(handler, /SAMPLE — Bikini Bottom contributor review/);
  assert.match(handler, /SpongeBob SquarePants/);
  assert.match(handler, /Patrick Star/);
  assert.match(handler, /no records were preloaded/i);
  assert.doesNotMatch(handler, /\bfetch\s*\(/, 'fictional sample activation must not make network requests');
  assert.doesNotMatch(handler, /\.request\s*\(/, 'fictional sample activation must not call the Giving API client');
  assert.doesNotMatch(handler, /runSearchButton|searchForm[^\n]*submit|requestSubmit/, 'fictional sample activation must not start retrieval');
  assert.doesNotMatch(handler, /saveDossierButton|syncVaultButton|exportCampaignDeputyBundleButton|createCampaignDeputyPersonButton/, 'fictional sample activation must not trigger save/Vault/external mutations');
  assert.doesNotMatch(handler, /\.click\s*\(/, 'fictional sample activation must not synthesize consequential button gestures');
});
