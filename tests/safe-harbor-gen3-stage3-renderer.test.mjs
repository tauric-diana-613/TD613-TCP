import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js', import.meta.url), 'utf8');

for (const marker of [
  '@version      7.2.1',
  'TD613 PUA Badge Provenance Attestation Renderer v7.2.1',
  "GEN3_EXTENSION = 'stage3-temporal-bloom-provenance/v1'",
  "ATTESTATION_SCHEMA = 'td613.safe-harbor.pua-provenance-attestation/v1'",
  'validateAttestationInputs',
  'buildGen3AttestationMetadata',
  'makeBadgeSvg',
  'binding_authority',
  'badge_protocol_history',
  'entrant_credential_authority',
  'entrant_countersignature_authority',
  'presentation_authority',
  'stability_digest',
  'blind_challenge_precommitment_digest',
  'blind_challenge_result_digest',
  'restoration_receipt_digest',
  'genuine_holdout_rank',
  'nearest_impostor_margin',
  'imitation_collision_state',
  'countersignature_status',
  'countersignature_digest',
  'authority_claim_reduced',
  'AI IMITATION COLLISION: PRESENT',
  'AUTHORITY CLAIM REDUCED',
  "reason: 'shi-mismatch'",
  "reason: 'missing-shi'",
  "reason: 'invalid-countersignature'",
  "emit('badge-svg-export-held'",
  'build_attestation_svg: makeBadgeSvg',
  'validate_attestation_inputs: validateAttestationInputs'
]) assert.ok(source.includes(marker), `Stage 3 renderer marker missing: ${marker}`);

assert.ok(source.includes("stage3Node ? 'gen3' : 'legacy'"), 'renderer must preserve legacy non-Safe-Harbor badge behavior while enforcing Gen3 packet inputs');
assert.ok(source.includes('historical_example: HISTORICAL_EXAMPLE'));
assert.ok(source.includes("binding_timestamp: s3.td613BindingTimestamp || '2025-08-11T03:58:39Z'"), 'renderer must read declared Stage 3 binding authority and retain the canonical root fallback');
assert.ok(source.includes("historical_date: s3.td613HistoricalDate || '2025-10-17'"), 'renderer must read declared Stage 3 badge-protocol history and retain the canonical historical fallback');
assert.doesNotMatch(source, /TD613-SH-9B07D8B-(?!A1B2C3D4)[0-9A-F]{8}/gu, 'renderer must not contain a live entrant SHI');
assert.doesNotMatch(source, /"(?:raw_text|entrant_text|window_text)"\s*:/iu, 'renderer metadata must not carry raw entrant text fields');

console.log('safe-harbor-gen3-stage3-renderer: ok');
