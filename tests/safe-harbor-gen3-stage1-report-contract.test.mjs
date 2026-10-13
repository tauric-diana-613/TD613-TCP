import assert from 'node:assert/strict';

import {
  attachGen3ReportContract,
  auditGenericReportLanguage,
  buildGen3ReportContract,
  GEN3_REPORT_SECTION_ORDER,
  validateReportEvidenceLinks
} from '../app/safe-harbor/app/safe-harbor-gen3-report-contract.js';

const packet = {
  schema_version: 'td613.safe-harbor.packet/v1',
  packet_id: 'GEN3-REPORT-CONTRACT-SYNTHETIC',
  packet_hash_sha256: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  authorship_evidence: {
    schema_version: 'td613.safe-harbor.authorship-evidence/v1',
    sampling_sufficiency: {
      triad_state: 'stability-eligible',
      lanes: {
        future_self: { observed_words: 360 },
        past_self: { observed_words: 360 },
        higher_self: { observed_words: 360 }
      }
    },
    elicitation_context: {
      schema_version: 'td613.safe-harbor.elicitation-context/v1',
      raw_text_exported: false,
      keystroke_telemetry_collected: false
    },
    within_lane_invariants: {},
    cross_lane_invariants: {},
    prompt_conditioned_features: {},
    stability_receipt: {
      schema_version: 'td613.safe-harbor.stability-receipt/v1',
      status: 'pending-stage2-measurement',
      stability_digest: null,
      raw_text_included: false,
      identity_probability: null
    },
    blind_custody_challenge: null,
    perturbation_invariance: null
  },
  temporal_lineage: {
    badge_protocol_history: {
      historical_example: 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐'
    }
  },
  binding_provenance: {
    entrant_authorship_binding: {
      countersignature: { status: 'unsigned' }
    }
  },
  gen3_evidence_contract: {
    shi_exact_match: { status: 'pass' }
  },
  forensic_authorship: {
    schema_version: 'td613.safe-harbor.forensic-authorship/v1',
    compatibility_note: 'Synthetic pre-existing aggregate report surface.'
  }
};

const report = buildGen3ReportContract(packet);
assert.equal(report.schema_version, 'td613.safe-harbor.forensic-authorship-report/v1');
assert.deepEqual(report.section_order, GEN3_REPORT_SECTION_ORDER);
assert.equal(validateReportEvidenceLinks(report).status, 'pass');
assert.equal(report.evidence_link_audit.status, 'pass');
assert.equal(report.sections.evidentiary_posture.content.sample_sufficiency, 'stability-eligible');
assert.equal(report.sections.evidentiary_posture.content.evidence_maturity, 'pending-stage2-measurement');
assert.equal(report.sections.evidentiary_posture.content.countersignature_state, 'unsigned');
assert.equal(report.sections.authorship_signature.status, 'awaiting-stage2-recurrence');
assert.equal(report.sections.blind_return.status, 'research-gated-not-run');
assert.equal(report.sections.deformation_and_recovery.status, 'research-gated-not-run');
assert.ok(report.sections.evidentiary_fractures.content.fractures.includes('Blind Custody Challenge not run; research-gated.'));
assert.ok(report.sections.interpretive_salience.content.unsupported_inference_blocked.includes('Identity'));
assert.equal(report.sections.claim_ceiling.content.prohibited_claims.includes('civil or legal identity proof'), true);
assert.equal(report.interpretation_provenance.raw_text_consumed, false);
assert.equal(report.interpretation_provenance.external_identity_data_consumed, false);
assert.equal(report.interpretation_provenance.revisable_without_native_packet_hash_migration, true);

for (const [sectionId, section] of Object.entries(report.sections)) {
  if (sectionId === 'claim_ceiling') continue;
  assert.ok(section.evidence_refs.length > 0, `${sectionId} must carry at least one evidence reference`);
  for (const ref of section.evidence_refs) assert.ok(report.evidence_links[ref], `${sectionId} cites unknown evidence ref ${ref}`);
}

const attached = attachGen3ReportContract(packet);
assert.equal(attached.forensic_authorship.compatibility_note, packet.forensic_authorship.compatibility_note);
assert.equal(attached.forensic_authorship.gen3_report_contract.evidence_link_audit.status, 'pass');
assert.equal(packet.forensic_authorship.gen3_report_contract, undefined, 'attachment must not mutate the source packet');

const broken = JSON.parse(JSON.stringify(report));
delete broken.evidence_links['AE-STABILITY-RECEIPT'];
assert.equal(validateReportEvidenceLinks(broken).status, 'fail');
assert.ok(validateReportEvidenceLinks(broken).missing.some((entry) => entry.includes('AE-STABILITY-RECEIPT')));

const flattering = auditGenericReportLanguage({ claim: 'A sophisticated and authentic authorial surface.' });
assert.equal(flattering.status, 'review-required');
assert.ok(flattering.findings.some((finding) => finding.term === 'sophisticated'));
assert.ok(flattering.findings.some((finding) => finding.term === 'authentic'));

assert.equal(report.anti_flattery_audit.status, 'pass');
assert.equal(JSON.stringify(report).includes('civil identity adjudication performed'), false);
assert.equal(JSON.stringify(report).includes('identity_probability'), false);

console.log('safe-harbor-gen3-stage1-report-contract: ok');
