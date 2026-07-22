import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DEFAULT_ASSET_ATTEMPTS,
  DEFAULT_ASSET_DELAY_MS,
  WAVE_A_ASSETS
} from '../scripts/safe-harbor-gen3-wave-a-production-assets.mjs';

assert.ok(DEFAULT_ASSET_ATTEMPTS >= 12, 'production propagation retry must permit a meaningful bounded observation window');
assert.ok(DEFAULT_ASSET_DELAY_MS >= 1000, 'production propagation retry must not busy-loop');
assert.ok(DEFAULT_ASSET_ATTEMPTS * DEFAULT_ASSET_DELAY_MS >= 60000, 'default propagation window must cover at least one minute');

const paths = new Set();
for (const asset of WAVE_A_ASSETS) {
  assert.ok(asset.path.startsWith('/safe-harbor/'), `unexpected public asset path: ${asset.path}`);
  assert.ok(!paths.has(asset.path), `duplicate public asset path: ${asset.path}`);
  paths.add(asset.path);
  const source = readFileSync(new URL(`../${asset.source_file}`, import.meta.url), 'utf8');
  for (const marker of asset.markers) {
    assert.ok(source.includes(marker), `${asset.source_file} does not contain declared production marker: ${marker}`);
  }
}

const finalizer = WAVE_A_ASSETS.find((asset) => asset.source_file.endsWith('safe-harbor-native-finalizer.js'));
assert.ok(finalizer, 'native finalizer production contract is required');
assert.deepEqual(Array.from(finalizer.markers), [
  'applyGen3Stage1Prehash',
  'applyControlledGen3Stage2Prehash',
  'includeGen3Stage2'
]);
assert.equal(Array.from(finalizer.markers).includes('authorship_evidence'), false, 'observer may not require a marker absent from the native finalizer source');

const probe = readFileSync(new URL('../scripts/safe-harbor-gen3-wave-a-production-probe.mjs', import.meta.url), 'utf8');
assert.ok(probe.includes('fetchReadyAsset'));
assert.ok(probe.includes('TD613_SAFE_HARBOR_ASSET_ATTEMPTS'));
assert.ok(probe.includes('TD613_SAFE_HARBOR_ASSET_DELAY_MS'));
assert.ok(probe.includes('propagation_attempts'));
assert.ok(probe.includes('authorizes_research_track_r_promotion: false'));
assert.ok(probe.includes('authorizes_wave_b: false'));

const governed = [
  probe,
  readFileSync(new URL('../scripts/safe-harbor-gen3-wave-a-production-assets.mjs', import.meta.url), 'utf8'),
  readFileSync(new URL('./safe-harbor-gen3-wave-a-production-probe-contract.test.mjs', import.meta.url), 'utf8')
].join('\n');
const concreteShis = governed.match(/TD613-SH-9B07D8B-[0-9A-F]{8}/gu) || [];
assert.ok(concreteShis.every((value) => value === 'TD613-SH-9B07D8B-A1B2C3D4'), `unexpected concrete SHI in observer contract: ${concreteShis.join(', ')}`);

console.log('safe-harbor-gen3-wave-a-production-probe-contract: ok');
