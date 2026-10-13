import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  compileApertureCompositionReceipt,
  replayApertureCompositionReceipt
} from '../../app/engine/aperture-composition.js';

const options = { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder };
const receipt = await compileApertureCompositionReceipt({
  frame_id: 'td613ApertureTool',
  created_at: '2026-07-16T00:00:00.000Z',
  ...options
});
assert.match(receipt.receipt_id, /^apcomp_[0-9a-f]{20}$/);
assert.match(receipt.manifest_digest, /^sha256:[0-9a-f]{64}$/);
assert.match(receipt.receipt_digest, /^sha256:[0-9a-f]{64}$/);
assert.equal(receipt.boundaries.network_called, false);
assert.equal(receipt.boundaries.storage_mutated, false);
assert.equal(receipt.boundaries.release_authority, false);
assert.equal(receipt.boundaries.recipient_transport, false);
assert.equal(receipt.boundaries.cinder_action, false);

const replay = await replayApertureCompositionReceipt(receipt, options);
assert.equal(replay.status, 'COMPOSITION_REPLAY_VERIFIED');
assert.equal(replay.manifest_reloaded, false);
assert.equal(replay.modules_reexecuted, false);
assert.equal(replay.frame_reloaded, false);
assert.equal(replay.network_called, false);
assert.equal(replay.storage_mutated, false);
assert.equal(replay.release_authority, false);

const tampered = structuredClone(receipt);
tampered.installed_components = [...tampered.installed_components, 'undeclared-choir-ui'];
const held = await replayApertureCompositionReceipt(tampered, options);
assert.equal(held.status, 'COMPOSITION_REPLAY_HOLD');
assert.notEqual(held.expected_receipt_digest, tampered.receipt_digest);

await assert.rejects(
  () => replayApertureCompositionReceipt({ ...receipt, schema: 'td613.aperture.composition-receipt/v9' }, options),
  /Unsupported/
);

console.log('aperture-composition/replay.test.mjs passed');
