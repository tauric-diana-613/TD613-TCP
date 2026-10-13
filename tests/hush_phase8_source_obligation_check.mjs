import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';
import { extractSourceObligationSet } from '../app/engine/hush-phase8-source-obligation.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const pixie = handoff.masks.find((mask) => mask.mask_id === 'phase28-transform-to-chatspeak');
assert.ok(pixie);

const sourceText = 'FILE-72 has the same export minute, but one copy has the footer and one copy does not. The cause may be template noise, but the mismatch should remain visible before review.';
const candidate = 'idk, may be template noise. FILE-72 keeps same export minute + one copy footer/no-footer split; mismatch stays visible before review.';

const explicitSourceObligation = {
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: ['FILE-72', 'export', 'minute', 'copy', 'footer', 'mismatch', 'review'],
  optional_anchors: [],
  must_preserve_score_floor: 1
};

const packet = await buildHushPerMaskPacketWithMetricPassport(pixie, {
  stableId: true,
  createdAt: '2026-06-20T00:04:00Z',
  queue: { registry_id: handoff.registry_id, registry_hash_sha256: handoff.registry_hash_sha256 },
  sourceText,
  candidate,
  sourceObligation: explicitSourceObligation
});

assert.equal(packet.source_obligation_set.explicit_source_obligation_required, true);
assert.equal(packet.source_obligation_set.explicit_source_obligation_present, true);
assert.equal(packet.source_obligation_set.derive_source_anchors, false);
assert.equal(packet.source_obligation_set.source_obligation_mode, 'explicit-only');
assert.equal(packet.source_obligation_set.source_obligation_status, 'passed');
assert.equal(packet.numeric_decision_surface.failed_thresholds.includes('explicit_source_obligation_set'), false);
assert.equal(packet.numeric_decision_surface.failed_thresholds.includes('source_obligation_gate'), false);
assert.ok(packet.numeric_decision_surface.passed_thresholds.includes('explicit_source_obligation_set'));
assert.ok(packet.numeric_decision_surface.passed_thresholds.includes('source_obligation_gate'));
const replay = await replayHushPerMaskMetricPassportHashes(packet);
assert.equal(replay.status, 'passed');

const missingExplicit = await buildHushPerMaskPacketWithMetricPassport(pixie, {
  stableId: true,
  createdAt: '2026-06-20T00:05:00Z',
  queue: { registry_id: handoff.registry_id, registry_hash_sha256: handoff.registry_hash_sha256 },
  sourceText,
  candidate,
  sourceObligation: {
    explicit_source_obligation_required: true,
    derive_source_anchors: false,
    mandatory_anchors: [],
    optional_anchors: [],
    must_preserve_score_floor: 1
  }
});

assert.equal(missingExplicit.source_obligation_set.explicit_source_obligation_required, true);
assert.equal(missingExplicit.source_obligation_set.explicit_source_obligation_present, false);
assert.equal(missingExplicit.source_obligation_set.source_obligation_status, 'blocked');
assert.equal(missingExplicit.packet_status, 'blocked');
assert.ok(missingExplicit.numeric_decision_surface.failed_thresholds.includes('explicit_source_obligation_set'));
assert.ok(missingExplicit.numeric_decision_surface.failed_thresholds.includes('source_obligation_gate'));
const replay2 = await replayHushPerMaskMetricPassportHashes(missingExplicit);
assert.equal(replay2.status, 'passed');

const camelCaseDerived = await extractSourceObligationSet(sourceText, {
  explicitSourceObligationRequired: true,
  deriveSourceAnchors: true,
  mandatoryAnchors: ['FILE-72'],
  anchorLimit: 4
});
assert.equal(camelCaseDerived.explicit_source_obligation_required, true);
assert.equal(camelCaseDerived.explicit_source_obligation_present, true);
assert.equal(camelCaseDerived.derive_source_anchors, true);
assert.equal(camelCaseDerived.source_obligation_mode, 'explicit-plus-derived');
assert.ok(camelCaseDerived.mandatory_anchors.includes('FILE-72'));
assert.ok(camelCaseDerived.mandatory_anchors.some((anchor) => anchor !== 'FILE-72'));

console.log('hush-phase8-explicit-source-obligation-gate: ok');
