import assert from 'node:assert/strict';
import genericAiBaselineFixtures from '../app/data/hush-phase8-fixtures/generic-ai-baseline-fixtures.js';
import { buildGenericAIBaseline, extractMaskFeatureVector } from '../app/engine/hush-stylometric-feature-vector.js';

assert.ok(genericAiBaselineFixtures.length >= 10);
const classes = new Set(genericAiBaselineFixtures.map((fixture) => fixture.fixture_class));
for (const required of ['generic_helper_voice', 'corporate_polish', 'fake_casual', 'fake_chatspeak', 'register_overlay', 'over_explained_clarity', 'transition_heavy', 'summary_cadence', 'over_symmetrical_paragraph', 'closure_laminated']) {
  assert.ok(classes.has(required), `missing ${required}`);
}

const baseline = await buildGenericAIBaseline();
assert.equal(baseline.schema, 'td613.hush.phase8.generic-ai-baseline/v1');
assert.equal(baseline.baseline_version, 'generic-ai-baseline-fixture-bank/v1');
assert.equal(baseline.baseline_fixture_count, genericAiBaselineFixtures.length);
assert.ok(baseline.baseline_classes.includes('fake_casual'));
assert.ok(baseline.baseline_classes.includes('corporate_polish'));
assert.ok(baseline.baseline_hash_sha256.startsWith('sha256:'));

const fakeCasual = genericAiBaselineFixtures.find((fixture) => fixture.fixture_class === 'fake_casual');
const vector = await extractMaskFeatureVector(fakeCasual.text);
assert.ok(vector.feature_vector.generic_helper_voice_score > 0.05);
assert.ok(vector.feature_vector.api_sheen_score >= 0.1);

console.log('hush-phase8-generic-ai-baseline-fixture-bank: ok');
