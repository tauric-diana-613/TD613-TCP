import assert from 'node:assert/strict';
import { buildPhase9Audit, DANGEROUS_PAIRS, EXPECTED_MASK_LABELS, TEST_PACKET_BANK } from '../scripts/run-hush-phase9-audit.mjs';

const audit = await buildPhase9Audit();

assert.equal(audit.schema, 'td613.hush.phase9.cross-mask-collision-audit/v1');
assert.equal(audit.mask_count, EXPECTED_MASK_LABELS.length);
assert.equal(audit.packet_count, TEST_PACKET_BANK.length);
assert.equal(audit.dangerous_pair_count, DANGEROUS_PAIRS.length);
assert.equal(audit.full_collision_cell_count, EXPECTED_MASK_LABELS.length * EXPECTED_MASK_LABELS.length);

for (const cell of audit.dangerous_pair_matrix) {
  assert.ok(cell.mask_a);
  assert.ok(cell.mask_b);
  assert.ok(cell.packet_id.startsWith('P9-'));
  assert.ok(cell.severity >= 0 && cell.severity <= 3);
  assert.ok(cell.metrics.mandatory_anchor_retention >= 1, `${cell.packet_id} dropped a mandatory anchor`);
  assert.ok(['clean distinctness', 'cosmetic overlap', 'repair required', 'hard blocker'].includes(cell.collision_risk));
}

for (const cell of audit.full_collision_matrix) {
  assert.ok(EXPECTED_MASK_LABELS.includes(cell.mask_a));
  assert.ok(EXPECTED_MASK_LABELS.includes(cell.mask_b));
  assert.ok(cell.severity >= 0 && cell.severity <= 3);
}

console.log('hush-phase9-cross-mask-collision: ok');
