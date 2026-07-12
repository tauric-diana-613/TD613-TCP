import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TD613_REFLEX_ORDER,
  TD613_REFLEX_SPINE_VERSION,
  buildTD613ReflexReceipt
} from '../app/dome-world/reflex-spine.js';

const manifest = JSON.parse(fs.readFileSync('app/dome-world/reflex-spine.manifest.json', 'utf8'));
const expectedIds = [
  'aperture-egress-attestation',
  'marrowline-ingress-absorption',
  'safe-harbor-restore-validation',
  'ash-contradiction-rejection',
  'hush-single-run-lock',
  'seal-overwrite-witness',
  'gateway-rescue-fuse'
];

assert.equal(TD613_REFLEX_SPINE_VERSION, 'td613.dome-world.reflex-spine/v1');
assert.equal(manifest.schema, TD613_REFLEX_SPINE_VERSION);
assert.deepEqual(TD613_REFLEX_ORDER.map((entry) => entry.id), expectedIds);
assert.deepEqual(manifest.order.map((entry) => entry.id), expectedIds);
assert.deepEqual(TD613_REFLEX_ORDER.map((entry) => entry.step), [1, 2, 3, 4, 5, 6, 7]);
assert.deepEqual(manifest.order.map((entry) => entry.step), [1, 2, 3, 4, 5, 6, 7]);
assert.equal(manifest.order.at(-1).mustRunLast, true);

const receipt = buildTD613ReflexReceipt({ status: 'TEST', activeSteps: [1, 2] });
assert.equal(receipt.status, 'TEST');
assert.deepEqual(receipt.activeSteps, [1, 2]);
assert.equal(receipt.order.length, 7);
assert.equal(receipt.order.at(-1).id, 'gateway-rescue-fuse');

const sources = {
  aperture: fs.readFileSync('app/engine/td613-aperture.js', 'utf8'),
  marrowline: fs.readFileSync('api/marrowline.js', 'utf8'),
  harbor: fs.readFileSync('app/safe-harbor/app/safe-harbor-session-gate.js', 'utf8'),
  ash: fs.readFileSync('api/ash-local-commitment-guard.py', 'utf8'),
  hush: fs.readFileSync('app/hush-pr168-strict-transform-run-lock.js', 'utf8'),
  seal: fs.readFileSync('scripts/serve-td613-localhost.mjs', 'utf8'),
  rescue: fs.readFileSync('app/tcp-gateway-rescue.js', 'utf8')
};

assert.match(sources.aperture, /installTD613ProvenanceAttestationEgress/);
assert.match(sources.aperture, /X-Dromological-Variance-Matrix/);
assert.match(sources.marrowline, /_serveMarrowlineTrap/);
assert.match(sources.marrowline, /observeTD613ApertureEgress/);
assert.match(sources.harbor, /validate.*ReopenPacket/s);
assert.match(sources.harbor, /session restore blocked/i);
assert.match(sources.ash, /validate_l1_boundary_flags/);
assert.match(sources.ash, /network_operation_performed_by_module=false/);
assert.match(sources.hush, /__TD613_HUSH_STRICT_TRANSFORM_RUNNING/);
assert.match(sources.hush, /recoverHeldReceiptLock/);
assert.match(sources.seal, /\.seal-log\.jsonl/);
assert.match(sources.seal, /prev_received_body_sha256/);
assert.match(sources.rescue, /installIngressFallback/);
assert.match(sources.rescue, /setTimeout\(installIngressFallback,\s*1100\)/);

console.log('td613 reflex spine order: all seven actions present and ordered');
