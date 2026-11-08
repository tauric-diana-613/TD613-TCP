import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');

export function validateCaptureReconciliation({ observedCount, persistedCount, explicitFailureCount }) {
  for (const [name, value] of Object.entries({ observedCount, persistedCount, explicitFailureCount })) {
    if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a non-negative integer`);
  }
  const accounted = persistedCount + explicitFailureCount;
  if (accounted !== observedCount) {
    throw new Error(`FAILED_CAPTURE_RECONCILIATION: observed=${observedCount} persisted=${persistedCount} explicit_failures=${explicitFailureCount} unexplained=${observedCount-accounted}`);
  }
  return {
    state: explicitFailureCount > 0 ? 'RECONCILED_WITH_EXPLICIT_CAPTURE_DEBT' : 'RECONCILED_FULL_PER_CARD_CUSTODY',
    observed_count: observedCount,
    persisted_count: persistedCount,
    explicit_failure_count: explicitFailureCount,
    unexplained_remainder: 0
  };
}

export function validateSept16Scar(root = DEFAULT_ROOT) {
  const snapshotPath = path.join(root, '01-MANIFESTS/public-reddit-profile-delta-20260916-snapshot-v04.json');
  const lossPath = path.join(root, '04-RECEIPTS/2026-09-16-public-profile-card-loss-ledger-v01.json');
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const loss = JSON.parse(fs.readFileSync(lossPath, 'utf8'));

  const observed = snapshot?.coverage?.observed_post_cards;
  const text = snapshot?.coverage?.text_excerpt_cards;
  const media = snapshot?.coverage?.media_only_or_unhydrated_cards;
  if (text + media !== observed) throw new Error('Sept16 aggregate card classes do not reconcile to observed_post_cards');
  if (loss.target_snapshot_id !== snapshot.snapshot_id) throw new Error('Loss ledger targets the wrong Sept16 snapshot');
  if (loss.observed.post_cards !== observed) throw new Error('Loss ledger observed count diverges from Sept16 snapshot');
  if (loss.observed.text_excerpt_cards !== text) throw new Error('Loss ledger text-card count diverges from Sept16 snapshot');
  if (loss.observed.media_only_or_unhydrated_cards !== media) throw new Error('Loss ledger media/unhydrated count diverges from Sept16 snapshot');

  const persisted = loss.persisted_at_original_capture.per_card_records;
  const explicitFailures = loss.unresolved.observed_card_objects_without_persisted_identity;
  const result = validateCaptureReconciliation({ observedCount: observed, persistedCount: persisted, explicitFailureCount: explicitFailures });
  if (loss.git_archaeology.per_card_registry_ever_committed_in_that_capture !== false) throw new Error('Sept16 scar must preserve the capture-time loss finding');
  if (loss.fresh_recovery_attempt.target_day_reconstructed !== false) throw new Error('Sept16 scar may not claim recovery that did not occur');
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(validateSept16Scar(), null, 2)}\n`);
}
