import assert from 'node:assert/strict';
import {
  validateCaptureReconciliation,
  validateSept16Scar
} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-capture-contract.mjs';

assert.deepEqual(
  validateCaptureReconciliation({ observedCount: 3, persistedCount: 3, explicitFailureCount: 0 }),
  {
    state: 'RECONCILED_FULL_PER_CARD_CUSTODY',
    observed_count: 3,
    persisted_count: 3,
    explicit_failure_count: 0,
    unexplained_remainder: 0
  }
);

assert.deepEqual(
  validateCaptureReconciliation({ observedCount: 3, persistedCount: 2, explicitFailureCount: 1 }),
  {
    state: 'RECONCILED_WITH_EXPLICIT_CAPTURE_DEBT',
    observed_count: 3,
    persisted_count: 2,
    explicit_failure_count: 1,
    unexplained_remainder: 0
  }
);

assert.throws(
  () => validateCaptureReconciliation({ observedCount: 3, persistedCount: 2, explicitFailureCount: 0 }),
  /FAILED_CAPTURE_RECONCILIATION.*unexplained=1/,
  'A sync may not hide an observed card simply because the source object failed to hydrate.'
);

assert.throws(
  () => validateCaptureReconciliation({ observedCount: 25, persistedCount: 0, explicitFailureCount: 14 }),
  /FAILED_CAPTURE_RECONCILIATION.*unexplained=11/,
  'Text-card counts alone may not launder media/unhydrated cards out of custody.'
);

const scar = validateSept16Scar();
assert.equal(scar.state, 'RECONCILED_WITH_EXPLICIT_CAPTURE_DEBT');
assert.equal(scar.observed_count, 25);
assert.equal(scar.persisted_count, 0);
assert.equal(scar.explicit_failure_count, 25);
assert.equal(scar.unexplained_remainder, 0);

console.log('Wendbine observed-card capture reconciliation and Sept16 archival-debt scar passed.');
