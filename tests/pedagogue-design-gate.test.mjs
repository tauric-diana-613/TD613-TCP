import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';

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
    assert.equal(review.design_gate.route_burden_non_worsening, true);
    assert.equal(review.design_gate.user_level_score_forbidden, true);
    assert.equal(review.design_gate.automatic_redesign_forbidden, true);
    assert.equal(review.design_gate.human_closure_required, true);
    assert.equal(review.scene.authority.station_mutation_authorized, false);
    assert.equal(review.scene.authority.automatic_ash_action, false);
    assert.equal(review.transfer.authority.automatic_ash_action, false);
  });
}
