import fs from 'node:fs';
import path from 'node:path';
import { createHash, webcrypto } from 'node:crypto';
import { compileOriginManifest } from '../app/engine/ash-stretch12-origin-integrity.js';

const root = process.cwd();
const outputDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-stretch12-origin';
const commit = process.env.GITHUB_SHA || process.env.TD613_COMMIT || 'LOCAL_UNBOUND';
const files = process.argv.slice(2).length ? process.argv.slice(2) : [
  'app/engine/ash-stretch12-origin-integrity.js',
  'app/engine/ash-stretch12-live-state-crypto.js',
  'app/engine/ash-stretch12-portable-anisotropy.js',
  'app/dome-world/ash-stretch12-operator.js',
  'app/dome-world/ash-stretch12-operator.css',
  'app/dome-world/ash-portable-anisotropy.html',
  'app/dome-world/ash-portable-anisotropy.js',
  'app/dome-world/ash-portable-anisotropy.css',
  'package-lock.json'
];
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const assets = files.map(file => {
  const bytes = fs.readFileSync(path.join(root, file));
  return { path: file, digest: digest(bytes), executable: /\.(?:js|mjs|html)$/.test(file) };
});
const lock = assets.find(asset => asset.path === 'package-lock.json');
const manifest = await compileOriginManifest({
  repository: 'tauric-diana-613/TD613-TCP',
  commit,
  releaseVersion: 'stretch12-portable-anisotropy-candidate',
  assets,
  dependencyLockDigest: lock.digest,
  buildCommand: 'static application / no generated bundle',
  runtimeVersions: [`node-${process.version}`],
  reproducibilityPosture: commit === 'LOCAL_UNBOUND' ? 'LOCAL_CANDIDATE' : 'CI_CANDIDATE',
  knownExceptions: ['Production release signature remains an explicit pre-seal gate.']
}, { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder });
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'origin-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ manifest_digest: manifest.manifest_digest, merkle_root: manifest.merkle_root, assets: manifest.assets.length }));
