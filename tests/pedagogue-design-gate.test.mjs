import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';
import {
  compilePedagogueRouteMemory,
  comparePedagogueRouteMemory
} from '../app/engine/flowcore-pedagogue-core.js';

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
    assert.equal(review.design_gate.route_history_explicit, true);
    assert.equal(review.design_gate.route_burden_non_worsening, true);
    assert.equal(review.design_gate.user_level_score_forbidden, true);
    assert.equal(review.design_gate.automatic_redesign_forbidden, true);
    assert.equal(review.design_gate.human_closure_required, true);
    assert.equal(review.scene.authority.station_mutation_authorized, false);
    assert.equal(review.scene.authority.automatic_ash_action, false);
    assert.equal(review.transfer.authority.automatic_ash_action, false);
  });
}

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

  const diverged = comparePedagogueRouteMemory(expected, observed, {
    expectedEndpoint: 'governed-consequence',
    observedEndpoint: 'governed-consequence'
  });
  assert.equal(diverged.exact_route_match, false);
  assert.equal(diverged.endpoint_equivalent, true);
  assert.equal(diverged.same_endpoint_not_same_history, true);
  assert.equal(diverged.first_divergence_index, 1);
  assert.equal(diverged.edit_distance_steps, 1);
  assert.equal(diverged.child_legible.why, 'The destination matches, but the path still matters.');
  assert.equal(diverged.authority.same_endpoint_grants_authority, false);
  assert.equal(diverged.authority.route_history_may_be_discarded, false);
  assert.equal(diverged.authority.automatic_redesign, false);
  assert.equal(diverged.authority.automatic_release, false);
  assert.equal(diverged.authority.human_closure_required, true);
});
