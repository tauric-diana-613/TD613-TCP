import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  CARRIER_COUNT,
  NEAR_CARRIER_COUNT,
  MID_CARRIER_COUNT,
  FAR_CARRIER_COUNT,
  CSS_OPACITY_NEAR,
  CSS_OPACITY_MID,
  CSS_OPACITY_FAR,
  MOTION_DEPTH_GAIN_NEAR,
  MOTION_DEPTH_GAIN_MID,
  MOTION_DEPTH_GAIN_FAR,
  FONT_SIZE_NEAR_PRIMARY,
  FONT_SIZE_NEAR_SECONDARY,
  FONT_SIZE_MID,
  FONT_SIZE_FAR,
  CLAIM_CEILING_MOTION_BRIDGE,
  PROPOSED_AESTHETIC_BINDINGS,
  classifyCarrier,
  getCarrierRoster,
  resolveCanonicalRelation,
  buildMotionPresentationDescriptor,
  evaluateCarrier,
  evaluateAllCarriers,
  renderDomeArt,
  generateSvgSnapshot
} from '../app/engine/flowcore-semantic-motion-bridge.js';

import {
  FLOWCORE_GLYPH_REGISTRY
} from '../app/dome-world/data/flowcore-glyph-semantics-v01.js';

test('1. exactly 39 carriers in total', () => {
  const roster = getCarrierRoster();
  assert.equal(roster.length, 39);
  assert.equal(CARRIER_COUNT, 39);
  for (let i = 0; i < 39; i++) {
    const c = classifyCarrier(i);
    assert.equal(c.index, i);
    assert.equal(c.count, 39);
  }
});

test('2. exact 6 near / 13 mid / 20 far depth allocation', () => {
  const roster = getCarrierRoster();
  const nearCarriers = roster.filter(c => c.near);
  const midCarriers = roster.filter(c => c.mid);
  const farCarriers = roster.filter(c => c.far);

  assert.equal(nearCarriers.length, 6, 'near plane must contain exactly 6 carriers');
  assert.equal(midCarriers.length, 13, 'mid plane must contain exactly 13 carriers');
  assert.equal(farCarriers.length, 20, 'far plane must contain exactly 20 carriers');
  assert.equal(nearCarriers.length + midCarriers.length + farCarriers.length, 39);

  // Verify the exact classification rule
  // near: i % 13 === 0 || i % 11 === 0
  const expectedNearIndices = [0, 11, 13, 22, 26, 33];
  assert.deepEqual(nearCarriers.map(c => c.index), expectedNearIndices);
});

test('3. distinct coordinates: CARRIER_COUNT != CSS_OPACITY != MOTION_DEPTH_GAIN != RENDERED_SCALE', () => {
  // Counts: 6, 13, 20
  assert.equal(NEAR_CARRIER_COUNT, 6);
  assert.equal(MID_CARRIER_COUNT, 13);
  assert.equal(FAR_CARRIER_COUNT, 20);

  // CSS Opacities: .38, .24, .20
  assert.equal(CSS_OPACITY_NEAR, 0.38);
  assert.equal(CSS_OPACITY_MID, 0.24);
  assert.equal(CSS_OPACITY_FAR, 0.20);

  // Motion depth gains: 1.35, .82, .46
  assert.equal(MOTION_DEPTH_GAIN_NEAR, 1.35);
  assert.equal(MOTION_DEPTH_GAIN_MID, 0.82);
  assert.equal(MOTION_DEPTH_GAIN_FAR, 0.46);

  // Rendered font sizes: 184/132, 56, 26
  const c0 = classifyCarrier(0); // i % 13 === 0 -> 184
  const c11 = classifyCarrier(11); // i % 11 === 0 -> 132
  const c4 = classifyCarrier(4); // mid -> 56
  const c1 = classifyCarrier(1); // far -> 26

  assert.equal(c0.font_size, FONT_SIZE_NEAR_PRIMARY);
  assert.equal(c11.font_size, FONT_SIZE_NEAR_SECONDARY);
  assert.equal(c4.font_size, FONT_SIZE_MID);
  assert.equal(c1.font_size, FONT_SIZE_FAR);

  // None of these four dimensions are equal
  assert.notEqual(NEAR_CARRIER_COUNT, CSS_OPACITY_NEAR);
  assert.notEqual(CSS_OPACITY_NEAR, MOTION_DEPTH_GAIN_NEAR);
  assert.notEqual(MOTION_DEPTH_GAIN_NEAR, FONT_SIZE_NEAR_PRIMARY);
});

test('4. canonical eight-relation registry unchanged', () => {
  const expectedKeys = [
    'recurrence',
    'gathering',
    'release',
    'created_potential',
    'released_tendency',
    'protected_continuity',
    'bounded_emergence',
    'structural_rest'
  ];
  const registryKeys = Object.keys(FLOWCORE_GLYPH_REGISTRY.entries);
  assert.deepEqual(registryKeys.sort(), expectedKeys.sort());

  const expectedGlyphs = {
    recurrence: '米',
    gathering: 'à',
    release: '出',
    created_potential: '上',
    released_tendency: '下',
    protected_continuity: 'cōl',
    bounded_emergence: 'hõt',
    structural_rest: '𝄐'
  };

  for (const [key, glyph] of Object.entries(expectedGlyphs)) {
    const canonical = resolveCanonicalRelation(key);
    assert.equal(canonical.entry.glyph, glyph);
  }
});

test('5. single animation owner: no loop duplication and hidden views draw zero', () => {
  // Check source code: must NOT contain requestAnimationFrame or setInterval
  const source = fs.readFileSync('app/engine/flowcore-semantic-motion-bridge.js', 'utf8');
  assert.equal(source.includes('requestAnimationFrame'), false, 'bridge must not instantiate a second rAF crown');
  assert.equal(source.includes('setInterval'), false, 'bridge must not instantiate rogue setInterval loops');

  // Active view renders
  const activeSnapshot = { activeViewId: 'field', relationState: { relation_key: 'gathering' } };
  const activeFrame = renderDomeArt('field', activeSnapshot, { width: 1000, height: 520 }, 1000);
  assert.equal(activeFrame.active, true);
  assert.equal(activeFrame.draw, true);
  assert.equal(activeFrame.carriers.length, 39);
  assert.equal(activeFrame.scheduler.coordinator, 'renderDomeArt');
  assert.equal(activeFrame.scheduler.owns_animation_loop, false);
  assert.equal(activeFrame.scheduler.hidden_views_draw_zero, true);

  // Hidden/inactive view performs strictly zero drawing
  const hiddenSnapshot = { activeViewId: 'cockpit-lab', relationState: { relation_key: 'gathering' } };
  const hiddenFrame = renderDomeArt('field', hiddenSnapshot, { width: 1000, height: 520 }, 1000);
  assert.equal(hiddenFrame.active, false);
  assert.equal(hiddenFrame.draw, false);
  assert.equal(hiddenFrame.carriers.length, 0);
  assert.equal(hiddenFrame.draw_commands.length, 0);
  assert.equal(hiddenFrame.hidden_view_reason, 'INACTIVE_DOME_VIEW');
});

test('6. deterministic presentation under fixed state/time/seed', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'release', progress: 0.5 }
  };
  const viewport = { width: 1000, height: 520, dpr: 1 };
  const time = 2400;

  const frame1 = renderDomeArt('field', snapshot, viewport, time);
  const frame2 = renderDomeArt('field', snapshot, viewport, time);

  assert.deepEqual(frame1.carriers, frame2.carriers);
  assert.equal(generateSvgSnapshot(frame1), generateSvgSnapshot(frame2));
});

test('7. consequence before naming: materially different relation classes produce distinguishable motion vectors', () => {
  const snapshot = (key) => ({
    activeViewId: 'field',
    relationState: { relation_key: key, progress: 0.5 }
  });
  const viewport = { width: 1000, height: 520 };
  const time = 3000;

  const fGathering = renderDomeArt('field', snapshot('gathering'), viewport, time);
  const fRelease = renderDomeArt('field', snapshot('release'), viewport, time);
  const fPotential = renderDomeArt('field', snapshot('created_potential'), viewport, time);
  const fTendency = renderDomeArt('field', snapshot('released_tendency'), viewport, time);
  const fContinuity = renderDomeArt('field', snapshot('protected_continuity'), viewport, time);
  const fRest = renderDomeArt('field', snapshot('structural_rest'), viewport, time);

  // Simulated discrimination test label:
  // SIMULATED_DISCRIMINATION != HUMAN_COMPREHENSION
  assert.notEqual(
    fGathering.descriptor.discriminability.vector_class,
    fRelease.descriptor.discriminability.vector_class,
    'gathering (inward) must differ from release (outward)'
  );
  assert.notEqual(
    fPotential.descriptor.discriminability.directional_axis,
    fRelease.descriptor.discriminability.directional_axis,
    'vertical potential must differ from horizontal shear release'
  );
  assert.notEqual(
    fPotential.descriptor.discriminability.vector_class,
    fTendency.descriptor.discriminability.vector_class,
    'upward ascent must differ from downward grounding'
  );

  // Position deltas across relations: carriers must not sit in the exact same positions
  const posGathering = fGathering.carriers.map(c => [c.x, c.y]);
  const posRelease = fRelease.carriers.map(c => [c.x, c.y]);
  const posPotential = fPotential.carriers.map(c => [c.x, c.y]);

  assert.notDeepEqual(posGathering, posRelease);
  assert.notDeepEqual(posGathering, posPotential);
  assert.notDeepEqual(posRelease, posPotential);
});

test('8. structural rest stops new impulses and settles rather than erasing', () => {
  const restSnapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'structural_rest', progress: 1.0 }
  };
  const viewport = { width: 1000, height: 520 };

  const frameT1 = renderDomeArt('field', restSnapshot, viewport, 2000);
  const frameT2 = renderDomeArt('field', restSnapshot, viewport, 5000);

  // In rest: new pulses stopped; settles to equilibrium
  assert.equal(frameT1.descriptor.settling_behavior.new_pulses_stopped, true);
  assert.equal(frameT1.descriptor.settling_behavior.final_state_inspectable, true);

  // All 39 carriers remain rendered and inspectable (not deleted or made 0-opacity)
  assert.equal(frameT1.carriers.length, 39);
  assert.ok(frameT1.carriers.every(c => c.opacity > 0.1), 'carriers must remain visible in rest');
  assert.ok(frameT1.carriers.every(c => c.glyph === '𝄐'), 'all carriers carry rest glyph');

  // Once settled (progress = 1.0), stationary equilibrium is preserved
  assert.deepEqual(frameT1.carriers.map(c => [c.x, c.y]), frameT2.carriers.map(c => [c.x, c.y]));
});

test('9. reduced motion is first-class: static frame retains all 39 carriers and full meaning', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'gathering', progress: 0.5 },
    reducedMotion: true
  };
  const viewport = { width: 1000, height: 520 };

  const frameT0 = renderDomeArt('field', snapshot, viewport, 0);
  const frameT10 = renderDomeArt('field', snapshot, viewport, 10000);

  // REDUCED_MOTION != REDUCED_MEANING
  assert.equal(frameT0.reduced_motion, true);
  assert.equal(frameT0.carriers.length, 39);

  // Depth distribution intact
  const nearCount = frameT0.carriers.filter(c => c.carrier.near).length;
  const midCount = frameT0.carriers.filter(c => c.carrier.mid).length;
  const farCount = frameT0.carriers.filter(c => c.carrier.far).length;
  assert.equal(nearCount, 6);
  assert.equal(midCount, 13);
  assert.equal(farCount, 20);

  // Static: zero movement across arbitrary time
  assert.deepEqual(frameT0.carriers, frameT10.carriers);
});

test('10. mobile (390px) preserves all three depth planes and all 39 carriers', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'release', progress: 0.5 }
  };
  const mobileViewport = { width: 390, height: 844, dpr: 3 };

  const mobileFrame = renderDomeArt('field', snapshot, mobileViewport, 1500);

  assert.equal(mobileFrame.viewport.compact, true);
  assert.equal(mobileFrame.viewport.is_portrait_mobile, true);
  assert.equal(mobileFrame.viewport.viewBox, '200 -220 600 1120');

  // Full 39 carriers preserved
  assert.equal(mobileFrame.carriers.length, 39);

  // All 3 depth planes preserved
  const near = mobileFrame.carriers.filter(c => c.carrier.near);
  const mid = mobileFrame.carriers.filter(c => c.carrier.mid);
  const far = mobileFrame.carriers.filter(c => c.carrier.far);

  assert.equal(near.length, 6, 'mobile must not delete near carriers');
  assert.equal(mid.length, 13, 'mobile must not delete mid carriers');
  assert.equal(far.length, 20, 'mobile must not delete far carriers');

  // None of the carriers have display:none or 0-scale
  assert.ok(mobileFrame.carriers.every(c => c.scale > 0 && c.opacity > 0));
});

test('11. ambient choreography cannot mutate event history, authority, or canonical semantics', () => {
  const snapshot = {
    activeViewId: 'field',
    relationState: { relation_key: 'recurrence' }
  };
  const frame = renderDomeArt('field', snapshot, { width: 1000, height: 520 }, 2000);

  // Authority strictly closed
  assert.equal(frame.authority.commands_station, false);
  assert.equal(frame.authority.automatic_ash_action, false);
  assert.equal(frame.authority.release_authorized, false);
  assert.equal(frame.authority.human_closure_required, true);

  // Claim ceiling bound
  assert.equal(frame.claim_ceiling.ambient_motion, 'AMBIENT_MOTION_NOT_EVENT_HISTORY');
  assert.equal(frame.claim_ceiling.aesthetic_binding, 'AESTHETIC_BINDING_NOT_EMPIRICAL_VALIDATION');
  assert.equal(frame.claim_ceiling.visual_relation, 'VISUAL_RELATION_NOT_EXTERNAL_REALITY');

  // Proposed aesthetic bindings remain unpromoted
  assert.equal(PROPOSED_AESTHETIC_BINDINGS.recurrence.binding_status, 'PROPOSED_AESTHETIC_BINDING');
  assert.equal(PROPOSED_AESTHETIC_BINDINGS.gathering.binding_status, 'PROPOSED_AESTHETIC_BINDING');
});
