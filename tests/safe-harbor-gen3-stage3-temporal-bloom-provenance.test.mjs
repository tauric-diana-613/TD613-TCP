import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildAuthorityChronology,
  buildProvenanceSvgMetadata,
  buildTemporalBloomState,
  countersignStage3Packet,
  deriveAuthorityPresentation,
  qualitativeBloomState,
  renderProvenanceSvg,
  validateStage3ShiSurfaces
} from '../app/safe-harbor/app/safe-harbor-temporal-bloom.js';

const SYNTHETIC_SHI = 'TD613-SH-9B07D8B-A1B2C3D4';
const HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';

function makeWords(prefix, count) {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`).join(' ');
}

function packetFixture(outcome = 'SUPPORTED') {
  return {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_id: 'STAGE3-SYNTHETIC-PACKET',
    created_at: '2026-07-22T20:00:00Z',
    packet_hash_sha256: `sha256:${'a'.repeat(64)}`,
    canon: {
      principal: 'tauric.diana.613',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]',
      shi_number: SYNTHETIC_SHI
    },
    intake: { ts_utc: '2026-07-22T19:00:00Z' },
    issuance: {
      badge_number: SYNTHETIC_SHI,
      assigned_at: '2026-07-22T20:00:00Z',
      stylometric_fingerprint: `sha256:${'b'.repeat(64)}`
    },
    authorship_evidence: {
      schema_version: 'td613.safe-harbor.authorship-evidence/v1',
      stability_receipt: {
        stability_digest: `sha256:${'c'.repeat(64)}`
      },
      blind_custody_challenge: {
        precommitment: { precommitment_digest: `sha256:${'d'.repeat(64)}` },
        results: {
          challenge_result: outcome,
          genuine_holdout_rank: 1,
          separation_margin: 0.113,
          imitation_collision: outcome === 'IMITATION-COLLISION'
        },
        result_digest: `sha256:${'e'.repeat(64)}`
      },
      perturbation_invariance: {
        restoration_receipt: {
          restoration_receipt_digest: `sha256:${'f'.repeat(64)}`
        }
      }
    },
    binding_provenance: {
      binding_event: { recorded_ts_utc: '2025-08-11T03:58:39Z' },
      entrant_authorship_binding: {
        schema_version: 'td613.safe-harbor.entrant-authorship-binding/v1',
        entrant_credential: {
          shi_number: SYNTHETIC_SHI,
          packet_hash_sha256: `sha256:${'a'.repeat(64)}`,
          stylometric_fingerprint: `sha256:${'b'.repeat(64)}`,
          stability_digest: `sha256:${'c'.repeat(64)}`,
          blind_challenge_precommitment_digest: `sha256:${'d'.repeat(64)}`,
          blind_challenge_result_digest: `sha256:${'e'.repeat(64)}`,
          restoration_receipt_digest: `sha256:${'f'.repeat(64)}`
        },
        custody_assertion: {
          claimant_role: 'entrant',
          claim: 'custody of packet-derived stylometric evidence',
          state: 'pending-countersignature'
        },
        countersignature: {
          status: 'unsigned',
          signed_at_utc: null,
          signature_type: null,
          signature_digest: null,
          signed_scope: [
            'shi_number',
            'packet_hash_sha256',
            'stylometric_fingerprint',
            'stability_digest',
            'blind_challenge_precommitment_digest',
            'blind_challenge_result_digest',
            'restoration_receipt_digest',
            'authorship_and_custody_assertion'
          ]
        }
      }
    },
    temporal_lineage: {
      root_binding_authority: { recorded_ts_utc: '2025-08-11T03:58:39Z' },
      badge_protocol_history: {
        recorded_date: '2025-10-17',
        historical_example: HISTORICAL_EXAMPLE
      },
      entrant_credential_authority: { recorded_ts_utc: '2026-07-22T19:00:00Z' },
      entrant_countersignature_authority: { recorded_ts_utc: null }
    },
    bridge: {
      export_gate: { ready: true, state: 'harbor-eligible', blockers: [] }
    }
  };
}

assert.equal(qualitativeBloomState(0).state, 'unopened');
assert.equal(qualitativeBloomState(39).ready_to_continue, false);
assert.equal(qualitativeBloomState(40).state, 'rooted');
assert.equal(qualitativeBloomState(119).state, 'rooted');
assert.equal(qualitativeBloomState(120).state, 'forming');
assert.equal(qualitativeBloomState(239).state, 'forming');
assert.equal(qualitativeBloomState(240).state, 'deepening');
assert.equal(qualitativeBloomState(359).state, 'deepening');
assert.equal(qualitativeBloomState(360).state, 'mature');

const bloom = buildTemporalBloomState({
  future_self: makeWords('future', 360),
  past_self: makeWords('past', 120),
  higher_self: makeWords('higher', 40)
});
assert.equal(bloom.schema_version, 'td613.safe-harbor.temporal-bloom/v1');
assert.equal(bloom.public_counts_visible, false);
assert.equal(bloom.raw_counts_exported_to_ui, false);
assert.equal(bloom.lanes.future_self.public_state, 'mature');
assert.equal(bloom.lanes.past_self.public_state, 'forming');
assert.equal(bloom.lanes.higher_self.public_state, 'rooted');
assert.equal(bloom.triad_state, 'triad-rooted');

const supported = packetFixture('SUPPORTED');
const exact = validateStage3ShiSurfaces(supported, { domShi: SYNTHETIC_SHI, svgShi: SYNTHETIC_SHI });
assert.equal(exact.status, 'pass');
assert.equal(deriveAuthorityPresentation(supported).authority_reduced, false);
assert.equal(deriveAuthorityPresentation(supported).countersignature_state, 'unsigned');

const collision = packetFixture('IMITATION-COLLISION');
const reduced = deriveAuthorityPresentation(collision);
assert.equal(reduced.imitation_collision, true);
assert.equal(reduced.authority_reduced, true);
assert.equal(reduced.authority_label, 'AUTHORITY CLAIM REDUCED');

const metadata = buildProvenanceSvgMetadata(supported);
assert.equal(metadata.schema_version, 'td613.safe-harbor.pua-provenance-attestation-svg/v1');
assert.equal(metadata.shi_number, SYNTHETIC_SHI);
assert.equal(metadata.raw_text_included, false);
assert.equal(metadata.authority_chronology[0].timestamp, '2025-08-11T03:58:39Z');
assert.equal(metadata.authority_chronology[1].timestamp, '2025-10-17');
assert.equal(metadata.authority_chronology[3].timestamp, null);

const svgA = renderProvenanceSvg(supported, { domShi: SYNTHETIC_SHI });
const svgB = renderProvenanceSvg(supported, { domShi: SYNTHETIC_SHI });
assert.equal(svgA, svgB, 'SVG output must be deterministic');
assert.ok(svgA.includes(`data-td613-shi="${SYNTHETIC_SHI}"`));
assert.ok(svgA.includes('PACKET-SCOPED AUTHORITY'));
assert.ok(svgA.includes('INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED'));
assert.ok(svgA.includes('td613.safe-harbor.pua-provenance-attestation-svg/v1'));
assert.equal(svgA.includes('raw_text'), true, 'metadata must explicitly attest raw_text_included=false');

const reducedSvg = renderProvenanceSvg(collision, { domShi: SYNTHETIC_SHI });
assert.ok(reducedSvg.includes('AI IMITATION COLLISION: PRESENT'));
assert.ok(reducedSvg.includes('AUTHORITY CLAIM REDUCED'));

assert.throws(
  () => renderProvenanceSvg(supported, { domShi: 'TD613-SH-9B07D8B-FFFFFFFF' }),
  (error) => error.code === 'TD613_STAGE3_SHI_HOLD' && error.details.reason === 'shi-mismatch'
);

const signedA = await countersignStage3Packet(supported, {
  domShi: SYNTHETIC_SHI,
  svgShi: SYNTHETIC_SHI,
  signatureType: 'synthetic-local-digest',
  signedAtUtc: '2026-07-22T21:00:00Z'
});
const signedB = await countersignStage3Packet(supported, {
  domShi: SYNTHETIC_SHI,
  svgShi: SYNTHETIC_SHI,
  signatureType: 'synthetic-local-digest',
  signedAtUtc: '2026-07-22T21:00:00Z'
});
assert.equal(signedA.status, 'countersigned');
assert.equal(signedA.packet.binding_provenance.entrant_authorship_binding.countersignature.status, 'countersigned');
assert.equal(
  signedA.packet.binding_provenance.entrant_authorship_binding.countersignature.signature_digest,
  signedB.packet.binding_provenance.entrant_authorship_binding.countersignature.signature_digest,
  'fixed countersignature inputs must produce a deterministic digest'
);
assert.equal(signedA.packet.temporal_lineage.root_binding_authority.recorded_ts_utc, '2025-08-11T03:58:39Z');
assert.equal(signedA.packet.temporal_lineage.badge_protocol_history.historical_example, HISTORICAL_EXAMPLE);
assert.equal(signedA.packet.temporal_lineage.entrant_countersignature_authority.recorded_ts_utc, '2026-07-22T21:00:00Z');

const held = await countersignStage3Packet(supported, {
  domShi: 'TD613-SH-9B07D8B-FFFFFFFF',
  svgShi: SYNTHETIC_SHI,
  signedAtUtc: '2026-07-22T21:00:00Z'
});
assert.equal(held.status, 'hold');
assert.equal(held.reason, 'shi-mismatch');

const chronology = buildAuthorityChronology(signedA.packet);
assert.deepEqual(chronology.map((entry) => entry.authority_class), [
  'root namespace and covenant binding authority',
  'first preserved operational badge-protocol specimen',
  'packet-specific credential authority',
  'packet-scoped custody and authorship-assertion authority',
  'presentation and integrity-attestation authority'
]);

const moduleSource = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-temporal-bloom.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-temporal-bloom.css', import.meta.url), 'utf8');
assert.ok(moduleSource.includes("new MutationObserver(refresh)"));
assert.ok(moduleSource.includes("window.dispatchEvent(new CustomEvent('td613:safe-harbor:stage3-ready'"));
assert.ok(moduleSource.includes("window.dispatchEvent(new CustomEvent('td613:safe-harbor:stage3-countersigned'"));
assert.ok(cssSource.includes('@media (prefers-reduced-motion: reduce)'));
assert.ok(cssSource.includes('@media (max-width: 760px)'));
assert.ok(cssSource.includes('.temporal-bloom-public #ingressStepMeta'));
assert.ok(cssSource.includes('#ingressContinue[hidden]'));

const governed = [moduleSource, cssSource, readFileSync(new URL('./safe-harbor-gen3-stage3-temporal-bloom-provenance.test.mjs', import.meta.url), 'utf8')].join('\n');
const concreteShis = governed.match(/TD613-SH-9B07D8B-[0-9A-F]{8}/gu) || [];
assert.ok(concreteShis.every((value) => value === SYNTHETIC_SHI), `unexpected concrete SHI fixture: ${concreteShis.join(', ')}`);
assert.equal(/keystroke|pause[_ -]?timing|personality|trauma diagnosis|intelligence score/iu.test(moduleSource), false);

console.log('safe-harbor-gen3-stage3-temporal-bloom-provenance: ok');
