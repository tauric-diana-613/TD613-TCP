import assert from 'assert';
import {
  HUSH_MASK_LIFECYCLE_VERSION,
  MASK_STATES,
  buildMaskLifecycle,
  updateMaskLifecycle,
  summarizeMaskLifecycle
} from '../app/engine/hush-mask-lifecycle.js';

assert.equal(HUSH_MASK_LIFECYCLE_VERSION, 'phase-12');
assert(MASK_STATES.includes('fresh'));
assert(MASK_STATES.includes('quarantined'));

const fresh = buildMaskLifecycle({ maskId: 'plain-witness', label: 'Plain Witness' });
assert.equal(fresh.state, 'fresh');
assert.equal(fresh.rotationRecommendation, 'continue-carefully');

const warming = buildMaskLifecycle({ exposureCount: 1 });
assert.equal(warming.state, 'warming');

const stable = buildMaskLifecycle({ exposureCount: 3 });
assert.equal(stable.state, 'stable');
assert.equal(stable.rotationRecommendation, 'monitor-continuity');

const overused = buildMaskLifecycle({ exposureCount: 6 });
assert.equal(overused.state, 'overused');
assert(overused.warnings.includes('mask-overuse-pressure'));

const burned = buildMaskLifecycle({ exposureCount: 12 });
assert.equal(burned.state, 'burned');
assert.equal(burned.rotationRecommendation, 'rotate-mask');

const quarantined = buildMaskLifecycle({ recaptureRisk: 0.9 });
assert.equal(quarantined.state, 'quarantined');
assert(quarantined.warnings.includes('mask-quarantine-required'));

const updated = updateMaskLifecycle(fresh, { contextType: 'group-chat', recaptureRisk: 0.2 });
assert.equal(updated.exposureCount, 1);
assert.equal(updated.contextSpread, 1);

const summary = summarizeMaskLifecycle(updated);
assert.equal(summary.version, 'phase-12');
assert.equal(summary.state, 'warming');
assert.equal(summary.exposureCount, 1);

console.log('hush-mask-lifecycle tests passed');
