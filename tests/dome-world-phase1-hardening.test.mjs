import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const rewrites = new Map(vercel.rewrites.map(({ source, destination }) => [source, destination]));

assert.equal(
  rewrites.get('/api/dome-world-engine'),
  '/api/dome-world-engine-guard',
);
assert.equal(
  rewrites.get('/api/ash-local-commitment'),
  '/api/ash-local-commitment-guard',
);
assert.equal(
  rewrites.get('/api/dome-world/ash-custody-register'),
  '/api/ash-local-commitment-guard',
);
assert.equal(
  rewrites.get('/api/dome-world/ash-custody-replay'),
  '/api/ash-local-commitment-guard',
);
assert.equal(
  rewrites.has('/dome-world/ash/local-commitment.js'),
  false,
  'the stable Ash kernel route must resolve through the canonical static fallback',
);
assert.equal(
  rewrites.has('/app/dome-world/ash/local-commitment.js'),
  false,
  'the canonical repository path must not be shadowed by a versioned rewrite',
);

const aliasSource = readFileSync(
  'app/dome-world/ash/local-commitment-v071.js',
  'utf8',
);
assert.match(
  aliasSource,
  /export \* from "\.\/local-commitment\.js";/,
  'the retained v0.7.1 URL must re-export the canonical kernel rather than fork it',
);

const {
  generateLocalCommitment,
  invalidateLocalCommitmentSelection,
} = await import('../app/dome-world/ash/local-commitment.js');

const fileLike = (bytes, options = {}) => ({
  size: bytes.byteLength,
  type: options.type || 'application/octet-stream',
  lastModified: options.lastModified ?? 613,
  arrayBuffer: options.arrayBuffer || (async () =>
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)),
});

// An older, slower hash must resolve to the newest active selection rather than
// overwriting current state with stale bytes.
const slowBytes = new TextEncoder().encode('old-selection');
const newBytes = new TextEncoder().encode('new-selection');
let releaseSlow;
const slowFile = fileLike(slowBytes, {
  arrayBuffer: () => new Promise((resolve) => {
    releaseSlow = () => resolve(
      slowBytes.buffer.slice(
        slowBytes.byteOffset,
        slowBytes.byteOffset + slowBytes.byteLength,
      ),
    );
  }),
});

const oldPromise = generateLocalCommitment(slowFile, { cryptoImpl: webcrypto });
const newPromise = generateLocalCommitment(fileLike(newBytes), { cryptoImpl: webcrypto });
const newest = await newPromise;
releaseSlow();
const oldResolved = await oldPromise;

assert.equal(oldResolved.artifact_digest, newest.artifact_digest);
assert.equal(oldResolved.byte_length, newest.byte_length);
assert.equal(newest.network_operation_performed_by_module, false);
assert.equal(newest.raw_bytes_persisted_by_module, false);

// Clearing/invalidation with no replacement must abort an in-flight result.
let releaseInvalidated;
const invalidatedBytes = new TextEncoder().encode('invalidated-selection');
const invalidatedPromise = generateLocalCommitment(
  fileLike(invalidatedBytes, {
    arrayBuffer: () => new Promise((resolve) => {
      releaseInvalidated = () => resolve(
        invalidatedBytes.buffer.slice(
          invalidatedBytes.byteOffset,
          invalidatedBytes.byteOffset + invalidatedBytes.byteLength,
        ),
      );
    }),
  }),
  { cryptoImpl: webcrypto },
);
invalidateLocalCommitmentSelection();
releaseInvalidated();
await assert.rejects(invalidatedPromise, (error) => error?.name === 'AbortError');

console.log('Ash Phase 1 guarded routing + generation binding: PASS');
