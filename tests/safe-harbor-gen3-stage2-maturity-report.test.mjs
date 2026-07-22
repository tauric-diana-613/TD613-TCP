import assert from 'node:assert/strict';

import {
  applyAuthorshipMaturityEvidence,
  buildAuthorshipMaturityEvidence
} from '../app/safe-harbor/app/safe-harbor-gen3-maturity-engine.js';
import {
  attachMaturityReport,
  buildMaturityReport,
  GEN3_MATURITY_REPORT_VERSION
} from '../app/safe-harbor/app/safe-harbor-gen3-maturity-report.js';

function sentence(prefix, index, marker) {
  return `${marker} ${prefix} passage ${index} carries source relations through a bounded route, and the passage returns with qualification, contrast, evidence order, measured uncertainty, and closure.`;
}

function lane(prefix, marker) {
  return Array.from({ length: 32 }, (_, index) => sentence(prefix, index + 1, marker)).join(' ');
}

const segments = {
  future_self: lane('future', 'however'),
  past_self: lane('past', 'although'),
  higher_self: lane('higher', 'therefore')
};
const maturity = await buildAuthorshipMaturityEvidence(segments, {
  promptTexts: {
    future_self: 'Write toward a future passage.',
    past_self: 'Write toward a past passage.',
    higher_self: 'Write toward a higher passage.'
  }
});

const basePacket = {
  schema_version: 'td613.safe-harbor.packet/v1',
  packet_hash_sha256: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  issuance: {
    badge_number: 'TD613-SH-9B07D8B-A1B2C3D4',
    stylometric_fingerprint: 'synthetic-stage2-fingerprint'
  },
  canon: {
    shi_number: 'TD613-SH-9B07D8B-A1B2C3D4'
  },
  binding_provenance: {
    entrant_authorship_binding: {
      entrant_credential: {
        shi_number: 'TD613-SH-9B07D8B-A1B2C3D4'
      },
      countersignature: { status: 'unsigned' }
    }
  },
  temporal_lineage: {
    badge_protocol_history: {
      historical_example: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐'
    }
  },
  gen3_evidence_contract: {
    shi_exact_match: { status: 'pass' }
  },
  authorship_evidence: {
    schema_version: 'td613.safe-harbor.authorship-evidence/v1',
    sampling_sufficiency: {
      triad_state: 'stability-eligible'
    },
    checkpoint_snapshots: {},
    within_lane_invariants: {},
    cross_lane_invariants: {},
    prompt_conditioned_features: {},
    elicitation_context: {
      schema_version: 'td613.safe-harbor.elicitation-context/v1',
      raw_text_exported: false,
      keystroke_telemetry_collected: false
    },
    stability_receipt: {
      schema_version: 'td613.safe-harbor.stability-receipt/v1',
      status: 'pending-stage2-measurement',
      stability_digest: null,
      raw_text_included: false,
      identity_probability: null
    },
    blind_custody_challenge: null,
    perturbation_invariance: null,
    evidence_contract: {
      schema_version: 'td613.safe-harbor.gen3-stage1/v1',
      claim_ceiling: 'Synthetic fixture.',
      historical_example: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐'
    }
  },
  forensic_authorship: {
    schema_version: 'td613.safe-harbor.forensic-authorship/v1'
  }
};

const measuredPacket = applyAuthorshipMaturityEvidence(basePacket, maturity);
const report = buildMaturityReport(measuredPacket);

assert.equal(report.schema_version, 'td613.safe-harbor.forensic-authorship-report/v1');
assert.equal(report.report_version, 'stage2-authorship-maturity/v1');
assert.equal(report.interpretation_provenance.interpretation_version, GEN3_MATURITY_REPORT_VERSION);
assert.equal(report.interpretation_provenance.prompt_vocabulary_ablation, true);
assert.equal(report.interpretation_provenance.model_dependent, false);
assert.equal(report.interpretation_provenance.report_language_traceable_to_evidence_ids, true);
assert.equal(report.sections.evidentiary_posture.status, 'measured-stage2');
assert.equal(report.sections.evidentiary_posture.content.stability_digest, maturity.stability_receipt.stability_digest);
assert.ok(report.sections.authorship_signature.content.measurement_evidence_ids.length >= 9);
assert.equal(report.sections.authorship_signature.content.universal_authorship_claim, null);
assert.equal(report.sections.authorship_signature.content.identity_claim, null);
assert.equal(report.sections.temporal_lane_portraits.status, 'measured-with-claim-ceiling');
assert.equal(report.sections.within_lane_invariants.status, 'measured');
assert.equal(report.sections.cross_lane_invariants.status, 'measured');
assert.equal(report.sections.evidentiary_fractures.status, 'measured');
assert.equal(report.sections.interpretive_salience.status, 'measured-with-uncertainty');
assert.equal(report.sections.claim_ceiling.content.packet_scoped, true);
assert.ok(report.sections.claim_ceiling.content.prohibited_claims.includes('universal authorship attribution'));
assert.equal(report.evidence_link_audit.status, 'pass');
assert.equal(report.anti_flattery_audit.status, 'pass');
assert.equal(report.stage2_report_audit.status, 'pass');
assert.equal(report.stage2_report_audit.raw_text_consumed, false);
assert.equal(report.stage2_report_audit.claim_ceiling_active, true);
assert.ok(report.stage2_report_audit.evidence_id_count >= 9);

const allIds = report.sections.authorship_signature.content.measurement_evidence_ids;
assert.equal(new Set(allIds).size, allIds.length, 'report evidence IDs must be unique');
for (const id of allIds) assert.match(id, /^AE-[A-Z0-9_-]+-[0-9A-F]{12}$/u);

const attached = attachMaturityReport(measuredPacket);
assert.equal(attached.forensic_authorship.gen3_report_contract.stage2_report_audit.status, 'pass');
assert.equal(measuredPacket.forensic_authorship.gen3_report_contract, undefined, 'report attachment must not mutate the source packet');

const insufficientMaturity = await buildAuthorshipMaturityEvidence({
  future_self: 'brief future sentence.',
  past_self: 'brief past sentence.',
  higher_self: 'brief higher sentence.'
});
const insufficientPacket = applyAuthorshipMaturityEvidence(basePacket, insufficientMaturity);
const insufficientReport = buildMaturityReport(insufficientPacket);
assert.equal(insufficientReport.sections.authorship_signature.status, 'insufficient-or-unstable');
assert.ok(insufficientReport.sections.authorship_signature.content.supported_measurement.includes('No feature family'));
assert.ok(insufficientReport.sections.evidentiary_fractures.content.fractures.some((entry) => entry.includes('Maturity blocker')));
assert.equal(insufficientReport.sections.claim_ceiling.content.packet_scoped, true);

const serialized = JSON.stringify(report);
assert.equal(serialized.includes(segments.future_self.slice(0, 80)), false);
assert.equal(serialized.includes('identity_probability'), false);
assert.equal(serialized.includes('civil identity proof established'), false);

console.log('safe-harbor-gen3-stage2-maturity-report: ok');
