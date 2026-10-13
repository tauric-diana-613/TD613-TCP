import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import {
  FLOWCORE_VISUAL_CHANNELS,
  renderPedagogueScene,
  renderPedagogueStaticFrame,
  compileVisualReceipt,
  createPedagogueCoordinatorAdapter
} from '../app/dome-world/flowcore-pedagogue-visual.js';

const scene = Object.freeze({
  scene_id: 'flowped_scene_0123456789abcdef01234567',
  station_owner: 'Dome-World',
  visible_condition: { plain_language: 'Two rooms pull apart at a visible seam.' },
  available_affordances: [{ action_id: 'adjust_weight', purpose: 'Change reception.', authorized_by_station: 'Dome-World' }],
  route_topology: { left: 'Loom', seam: 'overlap', right: 'Cistern' },
  causal_structure: { operator: 'restriction into overlap' },
  missingness: ['third room'],
  contradictions: ['local agreement and overlap mismatch coexist'],
  claim_ceiling: { allowed_claims: ['declared mismatch changed'], forbidden_claims: ['intent', 'identity'] },
  authority: { automatic_ash_action: false, human_closure_required: true },
  closure: { status: 'OPEN', closed_by: null }
});

const transition = Object.freeze({
  transition_id: 'flowped_tx_89abcdef0123456789abcdef',
  scene_reference: scene.scene_id,
  selected_action: { action_id: 'adjust_weight' },
  causal_trace: [{ step: 'weight changed' }, { step: 'seam reduced' }],
  glyph_candidates: ['recurrence-and-authored-structure'],
  name: {
    plain_language: 'The rooms still fit differently.',
    glyph_relation: 'recurrence-and-authored-structure',
    technical_term: 'gluing obstruction'
  },
  static_equivalent: {
    summary: 'A before-and-after seam remains visible.',
    steps: ['show condition', 'show action', 'show changed seam', 'show residual']
  },
  missingness: ['third room'],
  contradictions: ['local coherence persisted'],
  unresolved_relations: ['another metric may classify the seam differently'],
  authorized_actions: ['Dome-World:adjust_weight'],
  authority: { automatic_ash_action: false, human_closure_required: true },
  closure: { status: 'OPEN', closed_by: null }
});

test('visual module owns no animation crown', () => {
  const source = fs.readFileSync('app/dome-world/flowcore-pedagogue-visual.js', 'utf8');
  assert.equal(source.includes('requestAnimationFrame'), false);
  const frame = renderPedagogueScene('rooms', scene, transition, { width: 800, height: 600 }, 16, { activeViewId: 'rooms' });
  assert.equal(frame.scheduler.owns_animation_loop, false);
  assert.equal(frame.scheduler.coordinator, 'renderDomeArt');
});

test('hidden views perform zero draws', () => {
  const frame = renderPedagogueScene('rooms', scene, transition, { width: 800, height: 600 }, 16, { activeViewId: 'lab' });
  assert.equal(frame.active, false);
  assert.equal(frame.draw, false);
  assert.deepEqual(frame.draw_commands, []);
  assert.equal(frame.hidden_view_draw_count, 0);
});

test('all five channels agree on one transition', () => {
  const frame = renderPedagogueScene('rooms', scene, transition, { width: 800, height: 600 }, 32, { activeViewId: 'rooms' });
  assert.deepEqual(Object.keys(frame.channels), FLOWCORE_VISUAL_CHANNELS);
  assert.equal(frame.channels.inspection.transition_reference, transition.transition_id);
  assert.equal(frame.channels.glyph.appears_after_world_answer, true);
  assert.equal(frame.channels.language.technical_term_after_consequence, true);
  assert.equal(frame.channels.shape.color_is_sole_signal, false);
});

test('reduced motion renders complete simultaneous causal frame', () => {
  const frame = renderPedagogueStaticFrame('rooms', scene, transition, { width: 390, height: 720 }, { activeViewId: 'rooms' });
  assert.equal(frame.reduced_motion, true);
  assert.equal(frame.channels.motion.mode, 'SIMULTANEOUS_CAUSAL_FRAME');
  assert.equal(frame.channels.motion.start_visible, true);
  assert.equal(frame.channels.motion.route_visible, true);
  assert.equal(frame.channels.motion.end_visible, true);
  assert.equal(frame.channels.motion.autoplay, false);
  assert.equal(frame.viewport.layout, 'SINGLE_COLUMN_390');
  assert.equal(frame.viewport.horizontal_overflow_allowed, false);
  assert.equal(frame.viewport.minimum_touch_target_css_px, 44);
});

test('visual receipt is deterministic and exposes operators and ceiling', async () => {
  const frame = renderPedagogueScene('rooms', scene, transition, { width: 800, height: 600 }, 48, { activeViewId: 'rooms' });
  const options = {
    frozenClock: '2026-07-19T23:00:00Z',
    idSeed: 'td613-p3-visual',
    cryptoImpl: webcrypto,
    worldRevision: 'world-17',
    inputDigest: 'sha256:declared'
  };
  const left = await compileVisualReceipt(scene, transition, frame, options);
  const right = await compileVisualReceipt(scene, transition, frame, options);
  assert.deepEqual(left, right);
  assert.ok(left.operators.length);
  assert.deepEqual(left.claim_ceiling, scene.claim_ceiling);
  assert.equal(left.modeled, true);
  assert.equal(left.authority.commands_station, false);
  assert.equal(left.closure.status, 'OPEN');
});

test('coordinator adapter only registers into the existing scheduler', () => {
  let registration = null;
  const adapter = createPedagogueCoordinatorAdapter((viewId, renderer) => {
    registration = { viewId, renderer };
    return 'registered';
  });
  const result = adapter.register('rooms', scene, transition, { activeViewId: 'rooms' });
  assert.equal(result, 'registered');
  assert.equal(adapter.owns_animation_loop, false);
  assert.equal(registration.viewId, 'rooms');
  const frame = registration.renderer({ activeViewId: 'rooms' }, { width: 600, height: 400 }, 64);
  assert.equal(frame.draw, true);
});
