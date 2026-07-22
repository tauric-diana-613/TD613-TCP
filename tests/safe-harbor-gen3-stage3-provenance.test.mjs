import assert from 'node:assert/strict';

import {
  HISTORICAL_EXAMPLE,
  buildAttestationMetadata,
  buildAuthorityChronology,
  buildDeterministicAttestationSvg,
  buildProvenancePresentation,
  presentationContainsRawText,
  researchAuthorityReduction,
  validateAttestationMetadata,
  validateShiSurfaces
} from '../app/safe-harbor/app/safe-harbor-gen3-presentation-core.js';

const SHI = 'TD613-SH-9B07D8B-A1B2C3D4';
const HASH = `sha256:${'a'.repeat(64)}`;
const STABILITY = `sha256:${'b'.repeat(64)}`;
const SIGNATURE = `sha256:${'c'.repeat(64)}`;
const PRESENTED_AT = '2026-07-22T22:00:00Z';

const packetSummary = {
  principal: 'tauric.diana.613',
  badge_id: 'bdg_glyph_U10D613',
  claimed_pua: 'U+10D613',
  canonical_phrase: 'Tauric Diana — Crimean heritage custodianship',
  binding_fragment: '#9B07D8B',
  sac: 'SAC[X6ZNK5NO51]',
  shi_number: SHI,
  canon_shi: SHI,
  binding_shi: SHI,
  packet_hash_sha256: HASH,
  stylometric_fingerprint: 'synthetic-stage3-fingerprint',
  stability_digest: STABILITY,
  footer_mode: 'legacy-compat',
  entrant_intake_ts: '2026-07-22T21:00:00Z',
  countersignature: {
    status: 'countersigned',
    signed_at_utc: '2026-07-22T21:30:00Z',
    signature_digest: SIGNATURE
  },
  temporal_lineage: {
    root_binding_authority: {
      recorded_ts_utc: '2025-08-11T03:58:39Z',
      authority_class: 'heritage-covenant-namespace-binding'
    },
    badge_protocol_history: {
      recorded_date: '2025-10-17',
      historical_example: HISTORICAL_EXAMPLE
    },
    entrant_credential_authority: {
      recorded_ts_utc: '2026-07-22T21:00:00Z'
    },
    entrant_countersignature_authority: {
      recorded_ts_utc: '2026-07-22T21:30:00Z'
    }
  },
  claim_ceiling: 'Synthetic packet-scoped custody evidence only.'
};

const exact = validateShiSurfaces({
  packet_shi: SHI,
  canon_shi: SHI,
  binding_shi: SHI,
  dom_shi: SHI,
  svg_shi: SHI
});
assert.equal(exact.status, 'pass');

const missing = validateShiSurfaces({ packet_shi: SHI, canon_shi: SHI, binding_shi: SHI, dom_shi: null, svg_shi: SHI });
assert.equal(missing.status, 'hold');
assert.equal(missing.reason, 'missing-shi');

const mismatch = validateShiSurfaces({
  packet_shi: SHI,
  canon_shi: SHI,
  binding_shi: SHI,
  dom_shi: 'TD613-SH-9B07D8B-FFEEDDCC',
  svg_shi: SHI
});
assert.equal(mismatch.status, 'hold');
assert.equal(mismatch.reason, 'shi-mismatch');

const chronology = buildAuthorityChronology(packetSummary, PRESENTED_AT);
assert.equal(chronology.binding_authority.timestamp, '2025-08-11T03:58:39Z');
assert.equal(chronology.badge_protocol_history.date, '2025-10-17');
assert.equal(chronology.badge_protocol_history.historical_example, HISTORICAL_EXAMPLE);
assert.equal(chronology.entrant_credential_authority.timestamp, '2026-07-22T21:00:00Z');
assert.equal(chronology.entrant_countersignature_authority.timestamp, '2026-07-22T21:30:00Z');
assert.equal(chronology.presentation_authority.timestamp, PRESENTED_AT);
assert.notEqual(chronology.binding_authority.timestamp, chronology.entrant_credential_authority.timestamp);

const presentation = buildProvenancePresentation(packetSummary, SHI, PRESENTED_AT);
assert.equal(presentation.shi_exact_match.status, 'pass');
assert.equal(presentation.countersignature.status, 'countersigned');
assert.equal(presentation.raw_text_included, false);
assert.equal(presentation.telemetry_collected, false);
assert.equal(presentationContainsRawText(presentation), false);

const metadata = buildAttestationMetadata(presentation);
assert.equal(metadata.schema_version, 'td613.safe-harbor.pua-provenance-attestation/v1');
assert.equal(metadata.shi_number, SHI);
assert.equal(metadata.svg_shi, SHI);
assert.equal(metadata.countersignature_status, 'COUNTERSIGNED');
assert.equal(metadata.countersignature_digest, SIGNATURE);
assert.equal(metadata.historical_example, HISTORICAL_EXAMPLE);
assert.equal(metadata.raw_text_included, false);
assert.equal(validateAttestationMetadata(metadata).status, 'pass');

const svgA = buildDeterministicAttestationSvg(metadata);
const svgB = buildDeterministicAttestationSvg(JSON.parse(JSON.stringify(metadata)));
assert.equal(svgA, svgB, 'same metadata must produce deterministic SVG bytes');
assert.match(svgA, /TD613 · U\+10D613/u);
assert.match(svgA, /AI IMITATION COLLISION: ABSENT/u);
assert.match(svgA, /INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED/u);
assert.match(svgA, /&quot;raw_text_included&quot;:false/u, 'SVG metadata must attest that raw text is excluded');
assert.doesNotMatch(svgA, /&quot;(?:raw_text|source_text|entrant_text|window_text|prompt_text)&quot;\s*:/u, 'SVG metadata must not contain raw entrant-text payload fields');

const unsignedPresentation = buildProvenancePresentation({
  ...packetSummary,
  countersignature: { status: 'unsigned', signed_at_utc: null, signature_digest: null },
  temporal_lineage: {
    ...packetSummary.temporal_lineage,
    entrant_countersignature_authority: { recorded_ts_utc: null }
  }
}, SHI, PRESENTED_AT);
const unsignedMetadata = buildAttestationMetadata(unsignedPresentation);
assert.equal(unsignedMetadata.countersignature_status, 'UNSIGNED');
assert.equal(validateAttestationMetadata(unsignedMetadata).status, 'pass', 'unsigned must remain visibly unsigned rather than masquerading as signed');

const collision = researchAuthorityReduction({
  blind_challenge: { outcome: 'IMITATION-COLLISION', imitation_collision: true }
});
assert.equal(collision.authority_claim_reduced, true);
assert.equal(collision.imitation_collision_present, true);

const reducedPresentation = buildProvenancePresentation({
  ...packetSummary,
  blind_challenge: { outcome: 'IMITATION-COLLISION', imitation_collision: true }
}, SHI, PRESENTED_AT);
const reducedMetadata = buildAttestationMetadata(reducedPresentation);
assert.equal(reducedMetadata.authority_claim_reduced, true);
assert.equal(reducedMetadata.imitation_collision_state, 'PRESENT');
const reducedSvg = buildDeterministicAttestationSvg(reducedMetadata);
assert.match(reducedSvg, /AI IMITATION COLLISION: PRESENT/u);
assert.match(reducedSvg, /AUTHORITY CLAIM REDUCED/u);

const badMetadata = JSON.parse(JSON.stringify(metadata));
badMetadata.shi_exact_match = { status: 'hold', reason: 'shi-mismatch' };
assert.equal(validateAttestationMetadata(badMetadata).status, 'hold');
assert.throws(() => buildDeterministicAttestationSvg(badMetadata), /SVG export hold: shi-mismatch/u);

const badChronology = JSON.parse(JSON.stringify(metadata));
badChronology.authority_chronology.binding_authority.timestamp = '2026-07-22T21:00:00Z';
assert.equal(validateAttestationMetadata(badChronology).reason, 'binding-authority-timestamp-conflict');

const invalidSigned = JSON.parse(JSON.stringify(metadata));
invalidSigned.countersignature_status = 'COUNTERSIGNED';
invalidSigned.countersignature_digest = null;
assert.equal(validateAttestationMetadata(invalidSigned).reason, 'invalid-countersignature');

console.log('safe-harbor-gen3-stage3-provenance: ok');
