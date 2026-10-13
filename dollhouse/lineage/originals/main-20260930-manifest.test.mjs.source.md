import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_COMPOSITION_MANIFEST,
  APERTURE_COMPOSITION_MANIFEST_SCHEMA,
  validateApertureCompositionManifest
} from '../../app/engine/aperture-composition.js';

const json = JSON.parse(fs.readFileSync(new URL('../../app/aperture/composition.json', import.meta.url), 'utf8'));
const schema = JSON.parse(fs.readFileSync(new URL('../../app/aperture/composition.schema.json', import.meta.url), 'utf8'));

assert.deepEqual(json, APERTURE_COMPOSITION_MANIFEST);
assert.equal(validateApertureCompositionManifest(json), true);
assert.equal(Object.isFrozen(APERTURE_COMPOSITION_MANIFEST), true);
assert.equal(Object.isFrozen(APERTURE_COMPOSITION_MANIFEST.components), true);
assert.equal(schema.$id, APERTURE_COMPOSITION_MANIFEST_SCHEMA);
assert.equal(schema.properties.canonical_body.properties.source.const, './tool.html');
assert.equal(schema.properties.boundaries.properties.release_authority.const, false);
assert.equal(schema.properties.boundaries.properties.cinder_action.const, false);

const componentIds = json.components.map(component => component.id);
assert.deepEqual(componentIds, [
  'release-manifest',
  'task-intent',
  'v31-compatibility',
  'phase4-reciprocal-bridge'
]);
assert.deepEqual(json.components.map(component => component.order), [10, 20, 30, 40]);
assert.equal(json.components.filter(component => component.compatibility_alias).length, 1);
assert.equal(json.components.find(component => component.compatibility_alias).namespace, 'TD613_PHASE4_RECIPROCAL_BRIDGE');

const authorityInflation = structuredClone(json);
authorityInflation.boundaries.release_authority = true;
assert.throws(() => validateApertureCompositionManifest(authorityInflation), /release_authority/);

const bodyRewrite = structuredClone(json);
bodyRewrite.canonical_body.mutated_by_composer = true;
assert.throws(() => validateApertureCompositionManifest(bodyRewrite), /rewrite/);

const badOrder = structuredClone(json);
badOrder.components[2].order = 15;
assert.throws(() => validateApertureCompositionManifest(badOrder), /strictly increasing/);

const missingDependency = structuredClone(json);
missingDependency.components[1].depends_on = ['unavailable-wrapper'];
assert.throws(() => validateApertureCompositionManifest(missingDependency), /unavailable component/);

console.log('aperture-composition/manifest.test.mjs passed');
