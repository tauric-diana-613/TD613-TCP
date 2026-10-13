import assert from 'node:assert/strict';

import {
  TEMPORAL_BLOOM_SCHEMA,
  TEMPORAL_MATURE_WORDS,
  buildTemporalBloomPresentation,
  temporalBloomLaneState
} from '../app/safe-harbor/app/safe-harbor-gen3-presentation-core.js';

const boundaries = [
  ['future_self', 119, 'grey', 'This page is waiting with you.', false],
  ['future_self', 120, 'magenta', 'A Future Has Noticed You', false],
  ['future_self', 239, 'magenta', 'A Future Has Noticed You', false],
  ['future_self', 240, 'yellow', 'The Message Is Carrying', false],
  ['future_self', 359, 'yellow', 'The Message Is Carrying', false],
  ['future_self', 360, 'cyan', 'The Next Self Can Hear You', true],
  ['past_self', 119, 'grey', 'This page is listening behind you.', false],
  ['past_self', 120, 'magenta', 'Memory Has Turned Toward You', false],
  ['past_self', 240, 'yellow', 'The Message Is Finding Its Way Back', false],
  ['past_self', 360, 'cyan', 'The Past Can Receive You', true],
  ['higher_self', 119, 'grey', 'This page is holding the open field.', false],
  ['higher_self', 120, 'magenta', 'A Witness Has Gathered', false],
  ['higher_self', 240, 'yellow', 'The Pattern Is Holding', false],
  ['higher_self', 360, 'cyan', 'The Higher Self Can Receive You', true]
];

for (const [lane, count, color, copy, mature] of boundaries) {
  const state = temporalBloomLaneState(lane, count);
  assert.equal(state.schema_version, TEMPORAL_BLOOM_SCHEMA);
  assert.equal(state.color_token, color);
  assert.equal(state.recognition_copy, copy);
  assert.equal(state.mature, mature);
  assert.equal(state.counts_publicly_visible, false);
  assert.equal(state.progress_bar_semantics, false);
  assert.equal(state.motion_required_for_state, false);
  assert.doesNotMatch(state.recognition_copy, /\d/u, 'public recognition copy must not expose counts');
}

assert.equal(TEMPORAL_MATURE_WORDS, 360);

const presentation = buildTemporalBloomPresentation({
  current_lane: 'past_self',
  public_mode: true,
  lane_counts: { future_self: 360, past_self: 240, higher_self: 0 }
});
assert.equal(presentation.current_lane, 'past_self');
assert.equal(presentation.current.recognition_copy, 'The Message Is Finding Its Way Back');
assert.equal(presentation.lanes.future_self.mature, true);
assert.equal(presentation.lanes.past_self.mature, false);
assert.equal(presentation.raw_counts_exposed_in_public_presentation, false);
assert.equal(presentation.independent_tokenization_performed, false);
assert.equal(presentation.telemetry_collected, false);
assert.equal(presentation.mature_threshold_source, 'safe-harbor-main-counted-state');
assert.equal(Object.prototype.hasOwnProperty.call(presentation.current, 'observed_words'), false);

assert.throws(() => temporalBloomLaneState('unknown_lane', 360), /Unknown Temporal Bloom lane/u);

console.log('safe-harbor-gen3-stage3-temporal-bloom: ok');
