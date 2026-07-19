import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  AIA_POSTURES, AIA_ROUTE_IDS, compileAIAView, compareAIAViews, verifyAIAInvariants
} from '../app/engine/flowcore-pedagogue-aia.js';

const scene = Object.freeze({
  schema: 'td613.flowcore.pedagogical-scene/v0.1',
  scene_id: 'flowped_scene_0123456789abcdef01234567',
  scene_kind: 'GLUING_OBSTRUCTION',
  station_owner: 'Dome-World',
  source_status: 'E2',
  observation_status: 'OBSERVED',
  provenance: {
    source_references: ['spec#gluing', 'U+10D613'],
    evidence_basis: ['declared fixture'],
    transformations: ['restrict sections', 'compare overlap'],
    station_owners: ['Dome-World', 'Aperture']
  },
  visible_condition: { plain_language: 'Two rooms agree here and pull apart there.', seam_visible: true },
  available_affordances: [{ action_id: 'adjust_weight', purpose: 'Change reception.', authorized_by_station: 'Dome-World', reversible: true }],
  route_topology: { left: 'Loom', overlap: 'seam', right: 'Cistern', same_endpoint_not_same_history: true },
  causal_structure: { input: 'weight', operator: 'restriction', observable: 'seam', equations: ['mismatch=|rL-rC|'] },
  research_frame: {
    question: 'Can the seam remain legible without global blame?',
    hypothesis: 'Consequence-first ordering preserves bounded interpretation.',
    observable_behavior: ['operator identifies the changed seam'],
    alternative_explanations: ['metric choice'],
    expected_failure_modes: ['technical term appears before consequence'],
    falsifier: ['static and animated explanations diverge'],
    abstention_conditions: ['missing overlap'],
    claim_ceiling_reference: 'scene.claim_ceiling'
  },
  missingness: ['third room'],
  contradictions: ['local agreement and overlap mismatch coexist'],
  claim_ceiling: { allowed_claims: ['declared mismatch changed'], forbidden_claims: ['intent', 'identity'] },
  technical_terms_withheld: ['gluing obstruction'],
  anisotropic_legibility: {
    available_routes: ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION'],
    route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
    route_registry_schema: 'td613.flowcore.aia-route-registry/v0.1',
    route_inference_forbidden: true
  },
  rest: { available: true, penalty: false, continuity_preserved: true, new_demands_withheld: true },
  exit: { available: true, penalty: false },
  authority: {
    flowcore_commands_station: false,
    automatic_ash_action: false,
    release_authorized: false,
    station_mutation_authorized: false,
    human_closure_required: true
  },
  closure: { required: true, status: 'OPEN', closed_by: null }
});

const transition = Object.freeze({
  schema: 'td613.flowcore.pedagogical-transition/v0.1',
  transition_id: 'flowped_tx_89abcdef0123456789abcdef',
  scene_reference: scene.scene_id,
  phase: 'NAME',
  selected_action: { action_id: 'adjust_weight', purpose: 'Change reception.', authorized_by_station: 'Dome-World', reversible: true },
  world_delta: { before: 620, after: 410 },
  causal_trace: [{ step: 'weight changed' }, { step: 'seam reduced' }],
  name: { plain_language: 'The rooms still fit differently.', glyph_relation: 'recurrence-and-authored-structure', technical_term: 'gluing obstruction', non_equivalence: ['mismatch is not falsehood'] },
  losses: [],
  missingness: ['third room'],
  contradictions: ['local coherence persisted'],
  unresolved_relations: ['different metric may reverse class'],
  station_owner: 'Dome-World',
  authorized_actions: ['Dome-World:adjust_weight'],
  static_equivalent: {
    summary: 'The seam changed and remains inspectable.',
    steps: ['show before', 'show action', 'show after'],
    claim_ceiling_visible: true,
    missingness_visible: true,
    contradictions_visible: true,
    station_ownership_visible: true,
    rest_visible: true,
    exit_visible: true
  },
  rest_available: true,
  exit_available: true,
  authority: {
    automatic_ash_action: false,
    station_mutation_authorized: false,
    human_closure_required: true
  },
  closure: { status: 'OPEN', closed_by: null }
});

const options = {
  frozenClock: '2026-07-19T22:00:00Z',
  idSeed: 'td613-p2-aia-test',
  cryptoImpl: webcrypto
};

test('canonical posture aliases and routes remain explicit', () => {
  assert.deepEqual(AIA_POSTURES, ['child', 'custodian', 'auditor', 'technical']);
  assert.deepEqual(AIA_ROUTE_IDS, ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
});

test('four non-equivalent views preserve governed invariants', async () => {
  const views = [];
  for (const posture of AIA_POSTURES) views.push(await compileAIAView(scene, transition, posture, options));
  assert.equal(new Set(views.map(v => v.route)).size, 4);
  assert.equal(new Set(views.map(v => JSON.stringify(v.surface))).size, 4);
  const report = verifyAIAInvariants(scene, views);
  assert.equal(report.pair_count, 6);
  assert.equal(report.all_invariants_preserved, true);
  assert.equal(report.authority_transferred, false);
  assert.equal(report.closure.status, 'OPEN');
});

test('experiential route lowers terminology density without deleting missingness', async () => {
  const view = await compileAIAView(scene, transition, 'child', options);
  assert.equal(view.route, 'EXPERIENTIAL');
  assert.equal(view.surface.terminology.density, 'LOW');
  assert.deepEqual(view.invariants.missingness, ['third room']);
  assert.deepEqual(view.claim_ceiling, scene.claim_ceiling);
  assert.equal(view.exit.available, true);
});

test('technical route exposes bounded references without source content', async () => {
  const view = await compileAIAView(scene, transition, 'technical', options);
  assert.equal(view.surface.bounded_json.source_content_included, false);
  assert.match(view.surface.bounded_json.canonical_projection, /scene_reference/);
  assert.equal('raw_artifact_content' in view.surface.bounded_json, false);
});

test('pair comparison preserves authority and surfaces difference', async () => {
  const left = await compileAIAView(scene, transition, 'custodian', options);
  const right = await compileAIAView(scene, transition, 'auditor', options);
  const comparison = compareAIAViews(left, right);
  assert.equal(comparison.invariants_preserved, true);
  assert.equal(comparison.surfaces_non_equivalent, true);
  assert.equal(comparison.authority_equal_and_bounded, true);
});

test('route inference and scene mismatch reject', async () => {
  await assert.rejects(() => compileAIAView(scene, transition, 'fast-reader-on-mobile', options), /explicitly selected/);
  const wrong = { ...transition, scene_reference: 'flowped_scene_deadbeefdeadbeefdeadbeef' };
  await assert.rejects(() => compileAIAView(scene, wrong, 'child', options), /does not belong/);
});

test('same governed input yields deterministic AIA identity', async () => {
  const a = await compileAIAView(scene, transition, 'audit', options);
  const b = await compileAIAView(scene, transition, 'AUDIT', options);
  assert.equal(a.view_id, b.view_id);
  assert.deepEqual(a, b);
});
