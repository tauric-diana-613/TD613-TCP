import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';

const fixtureUrl = new URL('./fixtures/pedagogue/holonomy-loom-dlp-preflight-design.json', import.meta.url);

async function loadFixture() {
  return JSON.parse(await readFile(fixtureUrl, 'utf8'));
}

test('Holonomy Loom hosted-first DLP proposal passes Pedagogue without product or provider authority', async () => {
  const fixture = await loadFixture();
  const review = await compilePedagogueDesignReview(fixture);

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
  assert.equal(review.aia_surface_binding.route_inference_forbidden, true);
  assert.equal(review.aia_surface_binding.fabricated_decoys, false);
  assert.equal(review.aia_surface_binding.authority.authority_may_cross, false);
  assert.equal(review.aia_surface_binding.authority.automatic_release, false);
  assert.equal(review.scene.authority.release_authorized, false);
  assert.equal(review.scene.authority.station_mutation_authorized, false);
});

test('Holonomy Loom fixture keeps deterministic policy, Gemini suggestion, provenance, and portability non-equivalent', async () => {
  const fixture = await loadFixture();
  const relation = fixture.name.non_equivalence;
  const forbidden = fixture.scene_input.claim_ceiling.forbidden_claims;
  const expectedFailures = fixture.scene_input.research_frame.expected_failure_modes;
  const abstention = fixture.scene_input.research_frame.abstention_conditions;

  assert.ok(relation.includes('deterministic block is not model suggestion'));
  assert.ok(relation.includes('provider suggestion is not release authority'));
  assert.ok(relation.includes('visible resemblance is not provenance'));
  assert.ok(relation.includes('hosted proof is not portability proof'));
  assert.ok(forbidden.includes('Gemini can prove privacy or provenance'));
  assert.ok(forbidden.includes('green means zero privacy risk'));
  assert.ok(forbidden.includes('the hosted design is already portable'));
  assert.ok(expectedFailures.includes('raw draft is transmitted to Gemini by the default deterministic check route'));
  assert.ok(expectedFailures.includes('a Gemini result silently upgrades a suggestion into deterministic policy or release authority'));
  assert.ok(abstention.includes('cross-journey origin is not identifiable from admitted custody/context'));
  assert.ok(abstention.includes('the operator declines the separately disclosed Gemini/provider route'));
});

test('Holonomy Loom hosted-first fixture keeps portability downstream of hosted proof', async () => {
  const fixture = await loadFixture();
  assert.match(fixture.transfer_context.context.surface, /portable Loom/i);
  assert.ok(fixture.transfer_context.abstention_conditions.includes('the hosted version has not yet earned production observation'));
  assert.ok(fixture.scene_input.missingness.includes('portable packaging is not yet earned'));
  assert.equal(fixture.scene_input.observation_status, 'UNRESOLVED');
});
