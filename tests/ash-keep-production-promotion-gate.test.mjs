import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const releaseJson = JSON.parse(read('app/aperture/release.json'));
const releaseJs = read('app/aperture/release.js');
const fixture = JSON.parse(read('tests/fixtures/aperture-release.json'));
const receipt = read('app/dome-world/docs/ASH_KEEP_V1_PRODUCTION_DEMO_RECEIPT.md');

const ash = releaseJson.ash;
const promoted = ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED'
  || ash.productionStatus === 'PRODUCTION_DEMONSTRATED';
const receiptEarned = !receipt.includes('NOT_YET_EARNED')
  && receipt.includes('IMPLEMENTED_PRODUCTION_DEMONSTRATED')
  && receipt.includes('PRODUCTION_DEMONSTRATED');

assert.equal(
  promoted,
  receiptEarned,
  'Ash Keep release promotion and durable production receipt must move together.'
);

assert.ok(
  releaseJs.includes(`"status": "${ash.status}"`),
  'Generated Aperture release JS drifted from release.json Ash status.'
);
assert.ok(
  releaseJs.includes(`"productionStatus": "${ash.productionStatus}"`),
  'Generated Aperture release JS drifted from release.json Ash production status.'
);
assert.deepEqual(
  fixture.ash,
  ash,
  'Aperture release fixture drifted from release.json Ash posture.'
);

if (promoted) {
  for (const pattern of [
    /runtime commit(?: SHA)?:\s*`?[0-9a-f]{40}`?/i,
    /workflow run(?: ID)?:\s*`?\d+`?/i,
    /evidence artifact(?: ID)?:\s*`?\d+`?/i,
    /evidence artifact SHA-256:\s*`?sha256:[0-9a-f]{64}`?/i,
    /production observation JSON SHA-256:\s*`?sha256:[0-9a-f]{64}`?/i,
    /desktop screenshot SHA-256:\s*`?sha256:[0-9a-f]{64}`?/i,
    /mobile portrait screenshot SHA-256:\s*`?sha256:[0-9a-f]{64}`?/i,
    /mobile landscape screenshot SHA-256:\s*`?sha256:[0-9a-f]{64}`?/i,
    /probe outcome:\s*`?PASS`?/i,
    /operator closure:\s*`?PRODUCTION_DEMONSTRATED`?/i
  ]) {
    assert.match(receipt, pattern, `Promoted Ash Keep receipt omitted immutable evidence matching ${pattern}`);
  }
  assert.equal(ash.transport, false, 'Production demonstration cannot silently activate transport.');
  assert.equal(ash.automaticCinder, false, 'Production demonstration cannot silently activate Cinder.');
} else {
  assert.equal(ash.status, 'IMPLEMENTATION_IN_PROGRESS');
  assert.equal(ash.productionStatus, 'PREVIEW_PENDING');
  assert.match(receipt, /PROMOTION_WITHHELD/);
  assert.match(receipt, /promotion_authorized = false/);
}

console.log('ash-keep-production-promotion-gate.test.mjs passed');
