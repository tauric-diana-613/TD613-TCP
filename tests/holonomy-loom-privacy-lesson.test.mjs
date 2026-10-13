import test from 'node:test';
import assert from 'node:assert/strict';
import { compileLoomPrivacyLesson } from '../app/dome-world/holonomy-loom/privacy-lesson.js';
import { LOOM_DEMO_SCENES, getLoomDemoInput, compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';
import { analyzeHolonomyLoomMessage, makeHolonomyLoomSaferCopy } from '../app/dome-world/holonomy-loom/engine.js';
import { HOLONOMY_LOOM_MOTION_DESCRIPTORS } from '../app/dome-world/holonomy-loom/flowcore-aia-motion.js';

test('every lesson displays exact engine input and output without changing canonical scene meaning', () => {
  assert.equal(LOOM_DEMO_SCENES.length, 8);
  for (const scene of LOOM_DEMO_SCENES) {
    const input = getLoomDemoInput(scene.index), packet = compileLoomDemoScene(scene.index);
    const lesson = compileLoomPrivacyLesson(scene.index), safer = makeHolonomyLoomSaferCopy(input);
    assert.equal(lesson.before.text, input.text);
    assert.equal(lesson.after.text, safer.text);
    assert.equal(lesson.after.status, analyzeHolonomyLoomMessage({ text: safer.text, journeyMarkers: input.journeyMarkers }).status);
    for (const view of [lesson.before, lesson.after]) assert.equal(view.segments.map(part => part.text).join(''), view.text);
    assert.equal(lesson.disclosure.current_scene_gate_blocked, !packet.analysis.release_boundary.raw_release_allowed);
    assert.equal(lesson.after.replaces_current_scene, scene.id === 'recovery');
    assert.equal(lesson.sent, false);
    assert.equal(lesson.contains_user_data, false);
    assert.ok(Object.isFrozen(lesson.relations[0]));
    for (const relation of lesson.relations) assert.equal(relation.semantic_relation, HOLONOMY_LOOM_MOTION_DESCRIPTORS[relation.key].semantic_relation);
  }
});

test('Protect shows the removed words but the preview cannot unblock the original', () => {
  const lesson = compileLoomPrivacyLesson(2);
  assert.equal(lesson.before.segments.find(part => part.changed).text, 'glass seed');
  assert.equal(lesson.after.text, 'The [protected thing removed] stays in our practice box.');
  assert.equal(lesson.disclosure.matches[0].appears_in_candidate, false);
  assert.equal(lesson.after.preview_only, true);
  assert.equal(lesson.relations.find(item => item.key === 'release').state, 'BLOCKED');
  const recovery = compileLoomPrivacyLesson(6);
  assert.equal(recovery.after.preview_only, false);
  assert.equal(recovery.relations.find(item => item.key === 'release').state, 'CHECKED_ONLY');
});

test('warnings and missing links remain distinct from measured privacy or recovered geometry', () => {
  const warning = compileLoomPrivacyLesson(4), missing = compileLoomPrivacyLesson(5);
  assert.equal(warning.geometry.driver, 'MODELED_DEMO');
  assert.equal(warning.disclosure.changed, false);
  assert.equal(missing.disclosure.current_scene_gate_blocked, true);
  assert.match(warning.claim_ceiling.empirical_geometry, /No physical tomography/);
  assert.equal(compileLoomPrivacyLesson(7).relations.find(item => item.key === 'structural_rest').state, 'ACTIVE');
});

test('the lesson cannot accept an arbitrary message or an added scene', () => {
  for (const value of [{ text: 'private message' }, '2', -1, 8, 1.5]) assert.throws(() => compileLoomPrivacyLesson(value), RangeError);
});
