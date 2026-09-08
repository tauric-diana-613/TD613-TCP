import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  analyzeHolonomyLoomMessage
} from '../app/dome-world/holonomy-loom/engine.js';
import {
  HOLONOMY_LOOM_AIA_MOTION_SCHEMA,
  HOLONOMY_LOOM_AIA_ROUTE,
  HOLONOMY_LOOM_MOTION_KEYS,
  HOLONOMY_LOOM_MOTION_DESCRIPTORS,
  compileHolonomyLoomAiaMotionProjection
} from '../app/dome-world/holonomy-loom/flowcore-aia-motion.js';
import {
  FLOWCORE_GLYPH_REGISTRY
} from '../app/dome-world/data/flowcore-glyph-semantics-v01.js';

assert.equal(HOLONOMY_LOOM_AIA_MOTION_SCHEMA, 'td613.holonomy-loom.flowcore-aia-motion/v0.1');
assert.equal(HOLONOMY_LOOM_AIA_ROUTE, 'EXPERIENTIAL');
assert.deepEqual(HOLONOMY_LOOM_MOTION_KEYS, [
  'gathering',
  'recurrence',
  'bounded_emergence',
  'release',
  'protected_continuity',
  'structural_rest'
]);
assert.deepEqual(
  HOLONOMY_LOOM_MOTION_KEYS.map(key => HOLONOMY_LOOM_MOTION_DESCRIPTORS[key].glyph),
  ['à', '米', 'hõt', '出', 'cōl', '𝄐']
);
assert.equal(FLOWCORE_GLYPH_REGISTRY.schema, 'td613.flowcore.glyph-semantics/v0.1');
assert.equal(Object.isFrozen(FLOWCORE_GLYPH_REGISTRY), true);
assert.equal(Object.isFrozen(FLOWCORE_GLYPH_REGISTRY.entries.release), true);

const transitionWrapper = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const glyphWitnessSource = fs.readFileSync('scripts/holonomy-loom-flowcore-aia-glyph-control-browser-witness.mjs', 'utf8');
assert.match(
  transitionWrapper,
  /holonomy-loom-flowcore-aia-glyph-control-browser-witness\.mjs/,
  'Step 8 must invoke the dedicated glyph-control browser witness.'
);
assert.match(glyphWitnessSource, /chromium, firefox, webkit/, 'Glyph-control witness must remain three-engine capable.');
assert.match(glyphWitnessSource, /successful clipboard completion is required before outward 出 motion/, 'Glyph-control witness must bind outward release motion to observed clipboard success.');
assert.match(glyphWitnessSource, /reduced-motion invokes no animation API for semantic replay/, 'Glyph-control witness must preserve reduced-motion static truth.');
assert.match(glyphWitnessSource, /protectionRules\.locator\('summary'\)\.click\(\)/, 'Hostile RED setup must explicitly open Protection rules before editing its hidden textarea.');
assert.match(glyphWitnessSource, /RED fixture opens Protection rules explicitly before editing protected terms/, 'The observer must record the disclosure choreography it exercised.');
assert.ok(!glyphWitnessSource.includes("await page.locator('#protected').fill('');"), 'Reduced-motion replay must not attempt an unnecessary hidden-field fill after reload.');
assert.match(glyphWitnessSource, /Ready run 2828 Chromium \+ Firefox/, 'The first glyph witness observer RED must remain preserved in lineage.');
assert.match(glyphWitnessSource, /Ready run 2828 WebKit/, 'The independent WebKit Step-7 RED must remain distinguished in lineage.');

for (const key of HOLONOMY_LOOM_MOTION_KEYS) {
  const descriptor = HOLONOMY_LOOM_MOTION_DESCRIPTORS[key];
  assert.ok(descriptor.motion_grammar.length >= 1, `${key} must retain canonical motion grammar.`);
  assert.ok(descriptor.static_equivalent.length >= 1, `${key} must retain a static equivalent.`);
  assert.ok(descriptor.motion_recipe.duration_ms > 0 && descriptor.motion_recipe.duration_ms <= 1000, `${key} motion must be finite and bounded.`);
  assert.ok(descriptor.motion_recipe.keyframes.length >= 2, `${key} motion must declare a finite transition.`);
}

const protectedToken = 'PRIVATE_FLOWCORE_AIA_GLYPH_CONTROL_613';
const red = analyzeHolonomyLoomMessage({
  text: `ordinary ${protectedToken}`,
  protectedTerms: [{ value: protectedToken, label: 'protected fixture' }],
  journeyMarkers: []
});
assert.equal(red.status, 'RED');

assert.throws(
  () => compileHolonomyLoomAiaMotionProjection(red),
  /explicit EXPERIENTIAL route selection/,
  'The adapter may not infer an AIA route.'
);
assert.throws(
  () => compileHolonomyLoomAiaMotionProjection(red, { routeSelection: 'AUDIT' }),
  /explicit EXPERIENTIAL route selection/,
  'The product-specific child path may not silently switch AIA routes.'
);

const redProjection = compileHolonomyLoomAiaMotionProjection(red, { routeSelection: 'EXPERIENTIAL' });
assert.equal(redProjection.route_selection_observed, 'EXPERIENTIAL');
assert.equal(redProjection.route_inference_performed, false);
assert.equal(redProjection.raw_message_included, false);
assert.equal(redProjection.provider_call_required, false);
assert.equal(redProjection.external_network_required, false);
assert.equal(redProjection.generic_flowcore_taxonomy_mutated, false);
assert.equal(redProjection.projection.route, 'EXPERIENTIAL');
assert.equal(redProjection.projection.authority.authority_may_cross, false);
assert.equal(redProjection.projection.authority.automatic_release, false);
assert.equal(redProjection.projection.authority.automatic_redesign, false);
assert.equal(redProjection.projection.authority.station_mutation_authorized, false);
assert.equal(redProjection.projection.authority.human_closure_required, true);
assert.equal(redProjection.projection.rest.available, true);
assert.equal(redProjection.projection.rest.penalty, false);
assert.equal(redProjection.projection.exit.available, true);
assert.equal(redProjection.projection.exit.penalty, false);
assert.equal(redProjection.exogenous_witness_credit, 0);
assert.equal(redProjection.golden_egg_credit, 0);
assert.equal(redProjection.authority.merge_authority, false);
assert.equal(redProjection.authority.vercel_authority, false);
assert.equal(redProjection.authority.production_release_authority, false);
assert.equal(redProjection.authority.provider_release_authority, false);
assert.ok(!JSON.stringify(redProjection).includes(protectedToken), 'AIA motion projection must not retain raw protected content.');

const redStates = Object.fromEntries(redProjection.projection.surface.glyph_path.map(item => [item.key, item.state]));
assert.equal(redStates.gathering, 'COMPLETE');
assert.equal(redStates.recurrence, 'COMPLETE');
assert.equal(redStates.bounded_emergence, 'AVAILABLE');
assert.equal(redStates.release, 'BLOCKED');
assert.equal(redStates.protected_continuity, 'AVAILABLE');
assert.equal(redStates.structural_rest, 'AVAILABLE');

const green = analyzeHolonomyLoomMessage({ text: 'ordinary bounded message', protectedTerms: [], journeyMarkers: [] });
const greenProjection = compileHolonomyLoomAiaMotionProjection(green, { routeSelection: 'EXPERIENTIAL' });
const greenStates = Object.fromEntries(greenProjection.projection.surface.glyph_path.map(item => [item.key, item.state]));
assert.equal(green.status, 'GREEN');
assert.equal(greenStates.bounded_emergence, 'NOT_NEEDED');
assert.equal(greenStates.release, 'AVAILABLE');
assert.ok(!JSON.stringify(greenProjection).includes('ordinary bounded message'), 'AIA motion projection must not retain ordinary raw message content either.');

console.log(JSON.stringify({
  schema: 'td613.holonomy-loom.flowcore-aia-glyph-control-static/v0.1',
  status: 'PASS',
  canonical_glyph_registry_consumed: true,
  step8_browser_witness_bound: true,
  observer_disclosure_choreography_bound: true,
  preserved_red_lineage_bound: true,
  route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
  route_inference_performed: false,
  raw_message_included: false,
  provider_call_required: false,
  external_network_required: false,
  generic_flowcore_taxonomy_mutated: false,
  red_release_state: redStates.release,
  green_release_state: greenStates.release,
  reduced_motion_static_equivalent_required: true,
  human_comprehension_observed: false,
  production_release_authority: false,
  provider_release_authority: false,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0
}, null, 2));