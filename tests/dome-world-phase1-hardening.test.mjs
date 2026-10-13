import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const rewrites = new Map(vercel.rewrites.map(({ source, destination }) => [source, destination]));
assert.equal(rewrites.get('/api/dome-world-engine'), '/api/dome-world-engine-guard');
assert.equal(rewrites.get('/api/ash-local-commitment'), '/api/ash-local-commitment-guard');
assert.equal(rewrites.get('/api/dome-world/ash-custody-register'), '/api/ash-local-commitment-guard');
assert.equal(rewrites.get('/api/dome-world/ash-custody-replay'), '/api/ash-local-commitment-guard');
assert.equal(rewrites.has('/dome-world/ash/local-commitment.js'), false);
assert.equal(rewrites.has('/app/dome-world/ash/local-commitment.js'), false);

const aliasSource = readFileSync('app/dome-world/ash/local-commitment-v071.js', 'utf8');
assert.match(aliasSource, /export \* from "\.\/local-commitment\.js";/);

const { createLatestCommitmentCoordinator } = await import('../app/dome-world/ash/local-commitment.js');
const fileLike = (value) => ({
  size: 1,
  type: 'application/octet-stream',
  lastModified: 613,
  async arrayBuffer() { return new Uint8Array([value]).buffer; },
});
const pending = new Map();
const fakeGenerate = (file) => new Promise((resolve) => pending.set(file, resolve));
const coordinator = createLatestCommitmentCoordinator(fakeGenerate);
const first = fileLike(1);
const second = fileLike(2);
const oldPromise = coordinator.commit(first, { cryptoImpl: webcrypto });
const newPromise = coordinator.commit(second, { cryptoImpl: webcrypto });
pending.get(second)({ artifact_digest: 'sha256:' + '2'.repeat(64), network_operation_performed_by_module: false, raw_bytes_persisted_by_module: false });
const newest = await newPromise;
assert.equal(newest.status, 'CURRENT');
pending.get(first)({ artifact_digest: 'sha256:' + '1'.repeat(64) });
const old = await oldPromise;
assert.equal(old.status, 'STALE');
assert.equal(old.commitment, null);
coordinator.invalidate();
assert.equal(coordinator.isCurrent(second, newest.token), false);

console.log('Ash Phase 1 guarded routing + generation binding: PASS');
