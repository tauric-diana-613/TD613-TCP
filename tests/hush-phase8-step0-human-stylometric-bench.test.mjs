import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import { buildPerMaskStylometricCalibration, buildHumanImperfectionLedger, PHASE8_CALIBRATION_PROMPT_CLASSES } from '../app/engine/hush-mask-stylometric-calibration.js';
import { runMaskAntiSlopAudit } from '../app/engine/hush-anti-slop-audit.js';
import { getPhase8ReadyMaskQueue } from '../app/engine/hush-per-mask-packet.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const queue = getPhase8ReadyMaskQueue(handoff);
assert.equal(queue.one_mask_per_pr_required, true);
assert.equal(queue.raw_sample_text_included, false);
assert.equal(queue.public_release_permission_included, false);
assert.equal(queue.ready_count, 13);
assert.equal(queue.masks.length, 13);
assert.ok(queue.masks.every((mask) => mask.phase8_ready));
assert.ok(queue.masks.every((mask) => mask.registry_record_hash_sha256.startsWith('sha256:')));

const blockedQueue = getPhase8ReadyMaskQueue({ ...handoff, raw_sample_text_included: true });
assert.ok(blockedQueue.queue_blockers.some((reason) => reason.includes('raw sample text')));
assert.equal(blockedQueue.ready_count, 0);

const publicQueue = getPhase8ReadyMaskQueue({ ...handoff, public_release_permission_included: true });
assert.ok(publicQueue.queue_blockers.some((reason) => reason.includes('public release')));
assert.equal(publicQueue.ready_count, 0);

const collisionQueue = getPhase8ReadyMaskQueue({
  ...handoff,
  masks: [{ ...handoff.masks[0], collision_status: 'needs_collision_review', collision_refs: [] }]
});
assert.equal(collisionQueue.masks[0].phase8_ready, false);
assert.ok(collisionQueue.masks[0].queue_blockers.some((reason) => reason.includes('collision refs')));

const record = registry.records.find((item) => item.mask_id === handoff.masks[0].mask_id && item.source_file === handoff.masks[0].source_file);
const calibration = await buildPerMaskStylometricCalibration(record);
assert.equal(calibration.schema, 'td613.hush.phase8.stylometric-calibration/v1');
assert.equal(calibration.calibration_status, 'passed');
assert.equal(calibration.prompt_bench.length, PHASE8_CALIBRATION_PROMPT_CLASSES.length);
assert.equal(calibration.acceptance_bounds.raw_sample_text_allowed, false);
assert.equal(calibration.acceptance_bounds.public_default_allowed, false);
assert.ok(calibration.feature_profile_hash_sha256.startsWith('sha256:'));

const ledger = await buildHumanImperfectionLedger(record, calibration);
assert.equal(ledger.schema, 'td613.hush.phase8.human-imperfection-ledger/v1');
assert.equal(ledger.imperfection_status, 'passed');
assert.ok(ledger.allowed_asymmetries.includes('uneven sentence length'));
assert.ok(ledger.forbidden_noise.includes('sample-seed phrase reuse'));
assert.ok(ledger.ledger_hash_sha256.startsWith('sha256:'));

const cleanAudit = await runMaskAntiSlopAudit('The file stays tied to the date. Keep the hedge visible and do not polish away the mismatch.', calibration, record);
assert.equal(cleanAudit.candidate_material_only, true);
assert.equal(cleanAudit.candidate_text_included, false);
assert.ok(cleanAudit.candidate_hash_sha256.startsWith('sha256:'));
assert.notEqual(cleanAudit.status, 'blocked');

const slopAudit = await runMaskAntiSlopAudit('Certainly, here is a polished and professional tone. Furthermore, this highlights a clear and concise narrative.', calibration, record);
assert.equal(slopAudit.status, 'blocked');
assert.ok(slopAudit.flags.includes('generic_helper_voice'));
assert.equal(slopAudit.candidate_text_included, false);

console.log('hush-phase8-step0-human-stylometric-bench: ok');
