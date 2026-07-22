import {
  auditGenericReportLanguage,
  buildGen3ReportContract,
  validateReportEvidenceLinks
} from './safe-harbor-gen3-report-contract.js';

export const GEN3_MATURITY_REPORT_VERSION = 'td613.safe-harbor.maturity-report-adapter/v1';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function entriesByScore(value, scoreKey) {
  return Object.entries(value || {}).sort((left, right) => {
    const rightScore = Number(right[1]?.[scoreKey] ?? -1);
    const leftScore = Number(left[1]?.[scoreKey] ?? -1);
    return rightScore - leftScore || left[0].localeCompare(right[0]);
  });
}

function checkpointEvidenceIds(evidence = {}) {
  const ids = [];
  for (const lane of ['future_self', 'past_self', 'higher_self']) {
    for (const target of ['120', '240', '360']) {
      const id = evidence?.checkpoint_snapshots?.[lane]?.[target]?.evidence_id;
      if (id) ids.push(id);
    }
  }
  return ids;
}

function localEvidenceIds(evidence = {}) {
  const index = evidence?.authorship_maturity?.local_window_evidence_index || {};
  return Object.values(index).flatMap((items) => Array.isArray(items) ? items.map((item) => item.evidence_id).filter(Boolean) : []);
}

function lanePortrait(lane, evidence = {}) {
  const familyEntries = entriesByScore(evidence?.within_lane_invariants?.[lane], 'local_window_similarity');
  const measured = familyEntries.filter(([, value]) => Number.isFinite(value?.local_window_similarity));
  const strongest = measured[0] || null;
  return {
    lane,
    status: strongest ? 'measured' : 'insufficient-evidence',
    strongest_recurrent_family: strongest ? strongest[0] : null,
    strongest_recurrence: strongest ? strongest[1].local_window_similarity : null,
    sufficiency_state: evidence?.authorship_maturity?.lane_sufficiency?.[lane] || null,
    interpretation: strongest
      ? `The ${lane} lane carried its strongest measured local recurrence in the ${strongest[0]} feature family.`
      : 'Available local windows cannot support a lane portrait.'
  };
}

function familyFindings(evidence = {}) {
  return entriesByScore(evidence.cross_lane_invariants, 'cross_lane_similarity').map(([family, value]) => ({
    family,
    status: value.status,
    within_lane_similarity: value.within_lane_similarity,
    cross_lane_similarity: value.cross_lane_similarity,
    prompt_sensitivity: value.prompt_sensitivity
  }));
}

function fractureList(evidence = {}) {
  const receipt = evidence.stability_receipt || {};
  const fractures = Array.isArray(receipt.blockers) ? receipt.blockers.map((blocker) => `Maturity blocker: ${blocker}.`) : [];
  const chronology = evidence?.authorship_maturity?.null_models?.chronology_destruction || {};
  for (const [lane, result] of Object.entries(chronology)) {
    if (result?.authority === 'chronology-non-diagnostic') fractures.push(`Chronology destruction remained non-diagnostic in ${lane}; dynamic-signature authority is reduced.`);
  }
  if (evidence?.authorship_maturity?.anti_sameness_audit?.status === 'review-required') {
    fractures.push('Cross-lane sameness exceeded the calibration threshold; recurrence authority is reduced rather than elevated.');
  }
  if (!fractures.length) fractures.push('No Stage 2 blocker was registered; uncertainty and claim ceilings remain active.');
  return fractures;
}

function strongestByStatus(findings, statuses) {
  return findings.find((finding) => statuses.includes(finding.status)) || null;
}

export function buildMaturityReport(packet = {}) {
  const evidence = isObject(packet.authorship_evidence) ? packet.authorship_evidence : {};
  const maturity = evidence.authorship_maturity;
  const base = clone(buildGen3ReportContract(packet, {
    reportVersion: 'stage2-authorship-maturity/v1',
    interpretationVersion: GEN3_MATURITY_REPORT_VERSION
  }));
  if (!isObject(maturity)) return base;
  const receipt = evidence.stability_receipt || {};
  const findings = familyFindings(evidence);
  const recurrent = findings.filter((finding) => finding.status === 'recurrent-stable');
  const responsive = findings.filter((finding) => finding.status === 'context-responsive');
  const unstable = findings.filter((finding) => finding.status === 'unstable');
  const promptDependent = findings.filter((finding) => finding.status === 'prompt-dependent');
  const measurementIds = [...checkpointEvidenceIds(evidence), ...localEvidenceIds(evidence)];
  const strongest = strongestByStatus(findings, ['recurrent-stable', 'context-responsive', 'unstable', 'prompt-dependent']);
  const weakest = findings.slice().sort((left, right) => (
    Number(left.cross_lane_similarity ?? 2) - Number(right.cross_lane_similarity ?? 2)
    || left.family.localeCompare(right.family)
  ))[0] || null;

  base.sections.evidentiary_posture.status = 'measured-stage2';
  base.sections.evidentiary_posture.content = {
    ...base.sections.evidentiary_posture.content,
    maturity_state: receipt.maturity_state || 'unavailable',
    stability_digest: receipt.stability_digest || null,
    blockers: clone(receipt.blockers || []),
    measurement_authority: 'observable-textual-organization-under-declared-elicitation'
  };

  base.sections.authorship_signature.status = recurrent.length || responsive.length ? 'bounded-measurement' : 'insufficient-or-unstable';
  base.sections.authorship_signature.content = {
    supported_measurement: recurrent.length || responsive.length
      ? `Repeated organization was measured in ${[...recurrent, ...responsive].map((item) => item.family).join(', ')} under the declared window and prompt-ablation policy.`
      : 'No feature family met the Stage 2 recurrence threshold under the declared controls.',
    recurrent_families: recurrent.map((item) => item.family),
    context_responsive_families: responsive.map((item) => item.family),
    unstable_families: unstable.map((item) => item.family),
    prompt_dependent_families: promptDependent.map((item) => item.family),
    measurement_evidence_ids: measurementIds,
    universal_authorship_claim: null,
    identity_claim: null
  };

  base.sections.temporal_lane_portraits.status = 'measured-with-claim-ceiling';
  base.sections.temporal_lane_portraits.content = {
    future_self: lanePortrait('future_self', evidence),
    past_self: lanePortrait('past_self', evidence),
    higher_self: lanePortrait('higher_self', evidence),
    measurement_evidence_ids: measurementIds
  };

  base.sections.within_lane_invariants.status = 'measured';
  base.sections.within_lane_invariants.content = {
    lane_measurements: clone(evidence.within_lane_invariants || {}),
    local_window_evidence_index: clone(maturity.local_window_evidence_index || {}),
    interpretation: 'Local recurrence is reported by feature family and lane; a single appearance receives no invariant status.'
  };

  base.sections.cross_lane_invariants.status = 'measured';
  base.sections.cross_lane_invariants.content = {
    feature_families: findings,
    strongest_cross_lane_family: strongest ? strongest.family : null,
    measurement_evidence_ids: checkpointEvidenceIds(evidence)
  };

  base.sections.productive_contradictions.status = responsive.length ? 'measured' : 'none-elevated';
  base.sections.productive_contradictions.content = {
    context_responsive_families: responsive,
    interpretation: responsive.length
      ? 'These families recurred while changing across temporal lanes; variation remains part of the evidence rather than a defect to smooth away.'
      : 'No family met the bounded context-responsive classification.',
    sameness_audit: clone(maturity.anti_sameness_audit || {})
  };

  base.sections.evidentiary_fractures.status = 'measured';
  base.sections.evidentiary_fractures.content = {
    fractures: fractureList(evidence),
    null_models: clone(maturity.null_models || {}),
    forbidden_inference_audit: clone(maturity.forbidden_inference_audit || {})
  };

  base.sections.interpretive_salience.status = 'measured-with-uncertainty';
  base.sections.interpretive_salience.content = {
    strongest_recurrent_family: strongest ? strongest.family : null,
    strongest_cross_lane_similarity: strongest ? strongest.cross_lane_similarity : null,
    largest_instability: weakest ? weakest.family : null,
    largest_instability_similarity: weakest ? weakest.cross_lane_similarity : null,
    prompt_overlap_rate: evidence?.prompt_conditioned_features?.mean_prompt_overlap_rate ?? null,
    maturity_state: receipt.maturity_state || null,
    largest_uncertainty: receipt.blockers?.length
      ? `The active maturity blockers are: ${receipt.blockers.join(', ')}.`
      : 'The protocol remains packet-scoped and cannot establish identity, ownership, or universal authorship.',
    unsupported_inference_blocked: 'Psychological, demographic, cognitive, diagnostic, identity, ownership, and universal-attribution claims remain outside authority.',
    measurement_evidence_ids: measurementIds
  };

  base.sections.claim_ceiling.content = {
    supported_claim: 'Observable textual structures repeatedly recovered, varied, or failed to recover across declared temporal lanes under the versioned Stage 2 protocol.',
    prohibited_claims: [
      'civil or legal identity proof',
      'exclusive ownership proof',
      'universal authorship attribution',
      'third-party text adjudication',
      'psychological, demographic, cognitive, or diagnostic inference'
    ],
    packet_scoped: true
  };

  base.interpretation_provenance = {
    ...base.interpretation_provenance,
    interpretation_version: GEN3_MATURITY_REPORT_VERSION,
    stability_digest: receipt.stability_digest || null,
    evidence_digest: maturity.evidence_digest || null,
    prompt_vocabulary_ablation: true,
    model_dependent: false,
    report_language_traceable_to_evidence_ids: true
  };
  base.evidence_link_audit = validateReportEvidenceLinks(base);
  base.anti_flattery_audit = auditGenericReportLanguage({
    sections: base.sections,
    interpretation_provenance: base.interpretation_provenance
  });
  base.stage2_report_audit = {
    schema_version: 'td613.safe-harbor.stage2-report-audit/v1',
    status: base.evidence_link_audit.status === 'pass' && base.anti_flattery_audit.status === 'pass'
      ? 'pass'
      : 'review-required',
    evidence_id_count: measurementIds.length,
    claim_ceiling_active: true,
    raw_text_consumed: false
  };
  return base;
}

export function attachMaturityReport(packet = {}) {
  if (!packet || typeof packet !== 'object') return packet;
  const out = clone(packet);
  if (!isObject(out.authorship_evidence?.authorship_maturity)) return out;
  out.forensic_authorship = isObject(out.forensic_authorship) ? out.forensic_authorship : {};
  out.forensic_authorship.gen3_report_contract = buildMaturityReport(out);
  return out;
}
