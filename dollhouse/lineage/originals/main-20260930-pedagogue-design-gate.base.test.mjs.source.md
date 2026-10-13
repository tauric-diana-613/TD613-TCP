import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';
import { compileAiaSurfaceBinding } from '../app/engine/flowcore-aia-surface-binding.js';
import {
  compilePedagogueRouteMemory,
  comparePedagogueRouteMemory
} from '../app/engine/flowcore-pedagogue-core.js';
import {
  PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
  compileCanonicalPracticeFixture,
  compilePedagoguePracticeReview,
  verifyPracticeFixtureLoad,
  comparePracticeFixtureTraversal
} from '../app/engine/pedagogue-practice-fixture.js';

async function fixture(name) {
  return JSON.parse(await readFile(new URL(`./fixtures/pedagogue/${name}`, import.meta.url), 'utf8'));
}

for (const name of ['giving-vault-design.json', 'giving-research-dossier-design.json', 'cistern-boundary-design.json']) {
  test(`${name} passes the generic Pedagogue design gate without product authority`, async () => {
    const input = await fixture(name);
    const review = await compilePedagogueDesignReview(input);
    assert.equal(review.scene_host, 'Dome-World');
    assert.deepEqual(review.phases, ['NOTICE', 'ACT', 'WORLD_ANSWERS', 'NAME', 'REST']);
    assert.equal(review.design_gate.consequence_before_ontology, true);
    assert.equal(review.design_gate.rest_and_exit_preserved, true);
    assert.equal(review.design_gate.aia_invariants_preserved, true);
    assert.equal(review.design_gate.aia_surface_bound, true);
    assert.equal(review.design_gate.route_history_explicit, true);
    assert.equal(review.design_gate.route_burden_non_worsening, true);
    assert.equal(review.design_gate.user_level_score_forbidden, true);
    assert.equal(review.design_gate.automatic_redesign_forbidden, true);
    assert.equal(review.design_gate.human_closure_required, true);
    assert.equal(review.aia_surface_binding.surface_reference, input.surface_reference);
    assert.equal(review.aia_surface_binding.host_station, 'Dome-World');
    assert.equal(review.aia_surface_binding.governance_context, 'TD613');
    assert.equal(review.aia_surface_binding.nested_surface, true);
    assert.equal(review.aia_surface_binding.route_inference_forbidden, true);
    assert.equal(review.aia_surface_binding.fabricated_decoys, false);
    assert.equal(review.aia_surface_binding.authority.authority_may_cross, false);
    assert.equal(review.aia_surface_projections.length, 4);
    assert.equal(new Set(review.aia_surface_projections.map((projection) => projection.route)).size, 4);
    assert.equal(new Set(review.aia_surface_projections.map((projection) => projection.governed_reference)).size, 1);
    assert.equal(review.aia_surface_family_report.pair_count, 6);
    assert.equal(review.aia_surface_family_report.all_invariants_preserved, true);
    assert.equal(review.aia_surface_family_report.all_surfaces_non_equivalent, true);
    assert.equal(review.aia_surface_family_report.authority_transferred, false);
    assert.equal(review.aia_surface_family_report.human_closure_required, true);
    assert.equal(review.scene.authority.station_mutation_authorized, false);
    assert.equal(review.scene.authority.automatic_ash_action, false);
    assert.equal(review.transfer.authority.automatic_ash_action, false);
  });
}

test('AIA surface binding fails closed on inferred authority or fabricated decoys', () => {
  assert.throws(() => compileAiaSurfaceBinding({
    surface_reference: 'fixture/authority-crossing',
    authority: { authority_may_cross: true }
  }), /widen authority/i);
  assert.throws(() => compileAiaSurfaceBinding({
    surface_reference: 'fixture/fabricated-decoy',
    fabricated_decoys: true
  }), /does not fabricate decoys/i);
});

test('Pedagogue route memory preserves path difference even when endpoints match', () => {
  const expected = ['notice', 'witness', 'confirm', 'receipt'];
  const observed = ['notice', 'stale-intent', 'confirm', 'receipt'];

  const memory = compilePedagogueRouteMemory(expected, { endpoint: 'governed-consequence' });
  assert.equal(memory.endpoint, 'governed-consequence');
  assert.equal(memory.user_level_score, null);
  assert.equal(memory.diagnostic_claim, null);
  assert.equal(memory.authority.endpoint_equivalence_grants_authority, false);
  assert.equal(memory.authority.automatic_redesign, false);
  assert.equal(memory.authority.automatic_release, false);
  assert.equal(memory.authority.human_closure_required, true);

  const exact = comparePedagogueRouteMemory(expected, expected, {
    expectedEndpoint: 'governed-consequence',
    observedEndpoint: 'governed-consequence'
  });
  assert.equal(exact.exact_route_match, true);
  assert.equal(exact.endpoint_equivalent, true);
  assert.equal(exact.same_endpoint_not_same_history, false);
  assert.equal(exact.edit_distance_steps, 0);
  assert.equal(exact.route_divergence_millipoints, 0);
  assert.equal(exact.endpoint_holonomy_residue_millipoints, 0);

  const diverged = comparePedagogueRouteMemory(expected, observed, {
    expectedEndpoint: 'governed-consequence',
    observedEndpoint: 'governed-consequence'
  });
  assert.equal(diverged.exact_route_match, false);
  assert.equal(diverged.endpoint_equivalent, true);
  assert.equal(diverged.same_endpoint_not_same_history, true);
  assert.equal(diverged.first_divergence_index, 1);
  assert.equal(diverged.edit_distance_steps, 1);
  assert.equal(diverged.route_divergence_millipoints, 250);
  assert.equal(diverged.retained_boundary_millipoints, 750);
  assert.equal(diverged.endpoint_holonomy_residue_millipoints, 250);
  assert.equal(diverged.math.model, 'DISCRETE_ROUTE_DIVERGENCE_SURROGATE');
  assert.equal(diverged.math.geometric_holonomy_claim, false);
  assert.equal(diverged.math.comparative_structural_measure_only, true);
  assert.equal(diverged.child_legible.why, 'The destination matches, but the path still matters.');
  assert.match(diverged.child_legible.exact, /Route divergence: 250\/1000/);
  assert.equal(diverged.authority.same_endpoint_grants_authority, false);
  assert.equal(diverged.authority.route_history_may_be_discarded, false);
  assert.equal(diverged.authority.automatic_redesign, false);
  assert.equal(diverged.authority.automatic_release, false);
  assert.equal(diverged.authority.human_closure_required, true);
});

for (const name of ['giving-bikini-bottom-practice.json', 'ash-tomography-calibration-phantom-v01.json']) {
  test(`${name} compiles as a canonical practice fixture without evidence or geometric authority`, async () => {
    const input = await fixture(name);
    assert.equal(input.schema, PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA);
    const review = compilePedagoguePracticeReview(input);
    assert.equal(Object.values(review.practice_gate).every(Boolean), true);
    assert.equal(review.practice_gate.route_memory_explicit, true);
    assert.ok(review.fixture.expected_route_memory.steps.length > 0);
    assert.equal(review.fixture.expected_route_memory.authority.endpoint_equivalence_grants_authority, false);
    assert.equal(review.fixture.manifestly_fictional, true);
    assert.equal(review.fixture.load_contract.fictional_content_may_not_become_evidence, true);
    assert.equal(review.fixture.traversal_contract.same_runtime_route_required, true);
    assert.equal(review.fixture.traversal_contract.separate_demo_route_forbidden, true);
    assert.equal(review.fixture.authority.evidence_claim_authority, false);
    assert.equal(review.fixture.authority.consequence_authority, false);
    assert.equal(review.fixture.authority.domain_mutation_authority, false);
    assert.equal(review.fixture.authority.automatic_retrieval, false);
    assert.equal(review.fixture.aia_binding.fabricated_decoys, false);
    assert.equal(review.fixture.aia_binding.authority.authority_may_cross, false);
    assert.equal(review.fixture.research_claim_ceiling.geometric_holonomy_claim, false);
    assert.equal(review.fixture.research_claim_ceiling.transport_law_claim, false);
  });
}

test('practice fixture load is a zero-effect label hydration, not an evidence event', async () => {
  const input = await fixture('giving-bikini-bottom-practice.json');
  const practice = compileCanonicalPracticeFixture(input);
  const baseline = {
    evidence_records: 0,
    retrieval_requests: 0,
    retrieval_receipts: 0,
    practice_custody_writes: 1,
    domain_mutations: 0,
    authority_grants: 0
  };
  const report = verifyPracticeFixtureLoad(practice, { before: baseline, after: { ...baseline } });
  assert.equal(report.no_effects, true);
  assert.deepEqual(report.deltas, {
    evidence_records: 0,
    retrieval_requests: 0,
    retrieval_receipts: 0,
    practice_custody_writes: 0,
    domain_mutations: 0,
    authority_grants: 0
  });
  assert.throws(() => verifyPracticeFixtureLoad(practice, {
    before: baseline,
    after: { ...baseline, evidence_records: 1 }
  }), /forbidden effects/i);
});

test('practice traversal may exercise explicit read-only retrieval and practice custody while domain authority stays closed', async () => {
  const input = await fixture('giving-bikini-bottom-practice.json');
  const practice = compileCanonicalPracticeFixture(input);
  const report = comparePracticeFixtureTraversal(practice, input.expected_route_steps, {
    observedEndpoint: input.expected_endpoint,
    explicitOperatorGesture: true,
    observedEffects: {
      retrieval_requests: 2,
      practice_custody_writes: 2,
      domain_mutations: 0,
      evidence_claims: 0,
      authority_grants: 0
    },
    observedAuthority: {
      operator_read_only_retrieval_allowed: true,
      practice_custody_write_authority: true,
      explicit_operator_gesture_required: true,
      human_closure_required: true
    }
  });
  assert.equal(report.exact_route_reconstruction, true);
  assert.equal(report.route_reconstruction_error_millipoints, 0);
  assert.equal(report.authority_closed, true);
  assert.equal(report.research_claim_ceiling.geometric_holonomy_claim, false);

  assert.throws(() => comparePracticeFixtureTraversal(practice, input.expected_route_steps, {
    explicitOperatorGesture: true,
    observedEffects: { domain_mutations: 1 }
  }), /domain mutations/i);
});

test('practice traversal rejects observed authority not admitted by the fixture', async () => {
  const input = await fixture('ash-tomography-calibration-phantom-v01.json');
  const practice = compileCanonicalPracticeFixture(input);

  assert.equal(practice.authority.operator_read_only_retrieval_allowed, false);
  assert.equal(practice.authority.practice_custody_write_authority, false);

  assert.throws(() => comparePracticeFixtureTraversal(practice, input.expected_route_steps, {
    observedEndpoint: input.expected_endpoint,
    observedAuthority: { operator_read_only_retrieval_allowed: true }
  }), /widen authority/i);

  assert.throws(() => comparePracticeFixtureTraversal(practice, input.expected_route_steps, {
    observedEndpoint: input.expected_endpoint,
    observedAuthority: { practice_custody_write_authority: true }
  }), /widen authority/i);

  assert.throws(() => comparePracticeFixtureTraversal(practice, input.expected_route_steps, {
    observedEndpoint: input.expected_endpoint,
    observedAuthority: { human_closure_required: false }
  }), /widen authority/i);
});

test('calibration phantom detects same-endpoint route divergence without promoting the surrogate to holonomy', async () => {
  const input = await fixture('ash-tomography-calibration-phantom-v01.json');
  const practice = compileCanonicalPracticeFixture(input);
  const observed = [...input.expected_route_steps];
  observed[2] = 'projection-bypass';
  const report = comparePracticeFixtureTraversal(practice, observed, {
    observedEndpoint: input.expected_endpoint,
    explicitOperatorGesture: false,
    observedEffects: {}
  });
  assert.equal(report.exact_route_reconstruction, false);
  assert.equal(report.endpoint_equivalent, true);
  assert.equal(report.route_memory_comparison.same_endpoint_not_same_history, true);
  assert.ok(report.route_reconstruction_error_millipoints > 0);
  assert.equal(report.research_claim_ceiling.geometric_holonomy_claim, false);
  assert.equal(report.research_claim_ceiling.affine_connection_claim, false);
  assert.equal(report.research_claim_ceiling.transport_law_claim, false);
  assert.equal(report.tomography_posture, 'CALIBRATION_ROUTE_DIVERGED');
});
