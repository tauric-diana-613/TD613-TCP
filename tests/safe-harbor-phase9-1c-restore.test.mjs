import assert from 'node:assert/strict';
const mod = await import('../app/safe-harbor/app/safe-harbor-re' + 'open-validator.js');

const shi = 'TD613-SH-9B07D8B-ABCDEF12';
assert.equal(mod.isShiNumber(shi), true);
assert.equal(mod.isSha256('sha256:' + 'a'.repeat(64)), true);
assert.equal(mod.isSha256('sha256:notreal'), false);

const fakeHashOnly = {
  issuance: { badge_number: shi },
  packet_hash_sha256: 'sha256:notreal'
};
const fakeResult = mod.validateReopenPacket({ shi, text: JSON.stringify(fakeHashOnly) });
assert.equal(fakeResult.status, 'blocked');
assert.ok(fakeResult.refusal_reasons.some((reason) => reason.includes('packet_hash_sha256')));

const weakHashOnly = {
  issuance: { badge_number: shi },
  packet_hash_sha256: 'sha256:' + 'a'.repeat(64)
};
const weakResult = mod.validateReopenPacket({ shi, text: JSON.stringify(weakHashOnly) });
assert.equal(weakResult.status, 'blocked');
assert.ok(weakResult.refusal_reasons.some((reason) => reason.includes('hash-bearing packet alone')));

const currentPacket = {
  issuance: { badge_number: shi },
  packet_hash_sha256: 'sha256:' + 'b'.repeat(64),
  phase8_public_default_gate: { status: 'review' },
  phase9_release_discipline: { release_class: 'verification-ready' }
};
const currentResult = mod.validateReopenPacket({ shi, text: JSON.stringify(currentPacket) });
assert.equal(currentResult.status, 'pass');
assert.ok(currentResult.authority_families.includes('hash-bearing-packet'));
assert.ok(currentResult.authority_families.includes('phase8-public-gate'));
assert.ok(currentResult.authority_families.includes('phase9-release-discipline'));

console.log('safe-harbor-phase9-1c-restore: ok');
