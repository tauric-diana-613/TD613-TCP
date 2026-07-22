import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

export const GEN3_REPORT_SCHEMA = 'td613.safe-harbor.forensic-authorship-report/v1';
export const GEN3_INTERPRETATION_SCHEMA = 'td613.safe-harbor.interpretation-provenance/v1';
export const GEN3_REPORT_SECTION_ORDER = Object.freeze([
  'evidentiary_posture',
  'authorship_signature',
  'temporal_lane_portraits',
  'within_lane_invariants',
  'cross_lane_invariants',
  'productive_contradictions',
  'blind_return',
  'deformation_and_recovery',
  'evidentiary_fractures',
  'interpretive_salience',
  'claim_ceiling'
]);

const GENERIC_TERMS = Object.freeze([
  'complex',
  'reflective',
  'nuanced',
  'sophisticated',
  'authentic',
  'distinctive',
  'conversational',
  'abstract',
  'direct',
  'emotionally resonant',
  'resilient',
  'adaptive'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getPath(value, path) {
  return String(path || '').split('.').reduce((node, key) => (
    node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined
  ), value);
}

function link(id, path, role, status = 'available') {
  return Object.freeze({ id, path, role, status });
}

export function buildStage1EvidenceLinks(packet = {}) {
  const evidence = packet.authorship_evidence || {};
  const links = {
    'AE-SUFFICIENCY-TRIAD': link(
      'AE-SUFFICIENCY-TRIAD',
      'authorship_evidence.sampling_sufficiency',
      'sample sufficiency and checkpoint coverage',
      evidence.sampling_sufficiency ? 'available' : 'missing'
    ),
    'AE-ELICITATION-CONTEXT': link(
      'AE-ELICITATION-CONTEXT',
      'authorship_evidence.elicitation_context',
      'declared prompt, interface, accessibility, and telemetry conditions',
      evidence.elicitation_context ? 'available' : 'missing'
    ),
    'AE-WITHIN-LANE-INVARIANTS': link(
      'AE-WITHIN-LANE-INVARIANTS',
      'authorship_evidence.within_lane_invariants',
      'within-lane recurrence evidence',
      isObject(evidence.within_lane_invariants) && Object.keys(evidence.within_lane_invariants).length ? 'available' : 'awaiting-stage2'
    ),
    'AE-CROSS-LANE-INVARIANTS': link(
      'AE-CROSS-LANE-INVARIANTS',
      'authorship_evidence.cross_lane_invariants',
      'cross-lane recurrence evidence',
      isObject(evidence.cross_lane_invariants) && Object.keys(evidence.cross_lane_invariants).length ? 'available' : 'awaiting-stage2'
    ),
    'AE-PROMPT-CONDITIONING': link(
      'AE-PROMPT-CONDITIONING',
      'authorship_evidence.prompt_conditioned_features',
      'prompt-conditioned feature separation',
      isObject(evidence.prompt_conditioned_features) && Object.keys(evidence.prompt_conditioned_features).length ? 'available' : 'awaiting-stage2'
    ),
    'AE-STABILITY-RECEIPT': link(
      'AE-STABILITY-RECEIPT',
      'authorship_evidence.stability_receipt',
      'deterministic stability and maturity receipt',
      getPath(evidence, 'stability_receipt.status') || 'missing'
    ),
    'AE-SHI-EXACT-MATCH': link(
      'AE-SHI-EXACT-MATCH',
      'gen3_evidence_contract.shi_exact_match',
      'entrant SHI exact-match gate',
      getPath(packet, 'gen3_evidence_contract.shi_exact_match.status') || 'missing'
    ),
    'AE-HISTORICAL-PROVENANCE': link(
      'AE-HISTORICAL-PROVENANCE',
      'temporal_lineage.badge_protocol_history.historical_example',
      'exact preserved operational badge-protocol specimen',
      getPath(packet, 'temporal_lineage.badge_protocol_history.historical_example') ? 'available' : 'missing'
    ),
    'AE-BLIND-CUSTODY': link(
      'AE-BLIND-CUSTODY',
      'authorship_evidence.blind_custody_challenge',
      'blind holdout challenge and adverse-result registry',
      evidence.blind_custody_challenge ? 'available' : 'research-gated'
    ),
    'AE-PERTURBATION-INVARIANCE': link(
      'AE-PERTURBATION-INVARIANCE',
      'authorship_evidence.perturbation_invariance',
      'verified displacement and recovery evidence',
      evidence.perturbation_invariance ? 'available' : 'research-gated'
    )
  };
  return Object.freeze(links);
}

function section(id, status, evidenceRefs, content = {}) {
  return Object.freeze({ id, status, evidence_refs: evidenceRefs.slice(), content: clone(content) });
}

function lanePortraitsStatus(evidence = {}) {
  const within = isObject(evidence.within_lane_invariants) ? evidence.within_lane_invariants : {};
  return Object.keys(within).length ? 'measured' : 'awaiting-stage2-recurrence';
}

function blindStatus(evidence = {}) {
  return evidence.blind_custody_challenge ? 'measured' : 'research-gated-not-run';
}

function perturbationStatus(evidence = {}) {
  return evidence.perturbation_invariance ? 'measured' : 'research-gated-not-run';
}

export function auditGenericReportLanguage(report = {}) {
  const serialized = stableCanonicalJson(report).toLowerCase();
  const findings = [];
  for (const term of GENERIC_TERMS) {
    const occurrences = serialized.split(term).length - 1;
    if (!occurrences) continue;
    findings.push({
      term,
      occurrences,
      status: 'review-required',
      rule: 'Generic salience language requires quantified or evidence-linked support.'
    });
  }
  return Object.freeze({
    schema_version: 'td613.safe-harbor.anti-flattery-audit/v1',
    reviewed_terms: GENERIC_TERMS.slice(),
    findings,
    status: findings.length ? 'review-required' : 'pass'
  });
}

export function validateReportEvidenceLinks(report = {}) {
  const links = isObject(report.evidence_links) ? report.evidence_links : {};
  const missing = [];
  const unlinkedSubstantiveSections = [];
  for (const sectionId of GEN3_REPORT_SECTION_ORDER) {
    const current = report.sections && report.sections[sectionId];
    if (!current) {
      missing.push(sectionId);
      continue;
    }
    const refs = Array.isArray(current.evidence_refs) ? current.evidence_refs : [];
    if (sectionId !== 'claim_ceiling' && refs.length === 0) unlinkedSubstantiveSections.push(sectionId);
    for (const ref of refs) if (!links[ref]) missing.push(`${sectionId}:${ref}`);
  }
  return Object.freeze({
    status: missing.length || unlinkedSubstantiveSections.length ? 'fail' : 'pass',
    missing,
    unlinked_substantive_sections: unlinkedSubstantiveSections
  });
}

export function buildGen3ReportContract(packet = {}, options = {}) {
  const evidence = isObject(packet.authorship_evidence) ? packet.authorship_evidence : {};
  const evidenceLinks = buildStage1EvidenceLinks(packet);
  const sufficiency = getPath(evidence, 'sampling_sufficiency.triad_state') || 'unavailable';
  const stabilityStatus = getPath(evidence, 'stability_receipt.status') || 'unavailable';
  const countersignatureStatus = getPath(packet, 'binding_provenance.entrant_authorship_binding.countersignature.status') || 'unsigned';
  const exactMatch = getPath(packet, 'gen3_evidence_contract.shi_exact_match.status') || 'unavailable';
  const sections = {
    evidentiary_posture: section('evidentiary_posture', 'constituted', [
      'AE-SUFFICIENCY-TRIAD',
      'AE-STABILITY-RECEIPT',
      'AE-SHI-EXACT-MATCH',
      'AE-HISTORICAL-PROVENANCE'
    ], {
      packet_validity: packet.packet_hash_sha256 ? 'packet-hash-present' : 'packet-hash-unavailable',
      sample_sufficiency: sufficiency,
      evidence_maturity: stabilityStatus,
      countersignature_state: countersignatureStatus,
      shi_exact_match: exactMatch,
      identity_or_ownership_adjudication: 'not performed'
    }),
    authorship_signature: section('authorship_signature', 'awaiting-stage2-recurrence', [
      'AE-WITHIN-LANE-INVARIANTS',
      'AE-CROSS-LANE-INVARIANTS',
      'AE-PROMPT-CONDITIONING'
    ], {
      statement: null,
      reason: 'Stage 1 constitutes the evidence-linked section. Stage 2 must supply recurrent, prompt-separated measurements before interpretive language is permitted.'
    }),
    temporal_lane_portraits: section('temporal_lane_portraits', lanePortraitsStatus(evidence), [
      'AE-WITHIN-LANE-INVARIANTS',
      'AE-PROMPT-CONDITIONING',
      'AE-ELICITATION-CONTEXT'
    ], {
      future_self: null,
      past_self: null,
      higher_self: null
    }),
    within_lane_invariants: section('within_lane_invariants', lanePortraitsStatus(evidence), [
      'AE-WITHIN-LANE-INVARIANTS'
    ], clone(evidence.within_lane_invariants || {})),
    cross_lane_invariants: section('cross_lane_invariants', Object.keys(evidence.cross_lane_invariants || {}).length ? 'measured' : 'awaiting-stage2-recurrence', [
      'AE-CROSS-LANE-INVARIANTS',
      'AE-PROMPT-CONDITIONING'
    ], clone(evidence.cross_lane_invariants || {})),
    productive_contradictions: section('productive_contradictions', 'awaiting-stage2-recurrence', [
      'AE-WITHIN-LANE-INVARIANTS',
      'AE-CROSS-LANE-INVARIANTS'
    ], { findings: [] }),
    blind_return: section('blind_return', blindStatus(evidence), [
      'AE-BLIND-CUSTODY'
    ], evidence.blind_custody_challenge ? clone(evidence.blind_custody_challenge.results || {}) : { result: null }),
    deformation_and_recovery: section('deformation_and_recovery', perturbationStatus(evidence), [
      'AE-PERTURBATION-INVARIANCE'
    ], evidence.perturbation_invariance ? clone(evidence.perturbation_invariance.restoration_receipt || {}) : { result: null }),
    evidentiary_fractures: section('evidentiary_fractures', 'constituted', [
      'AE-SUFFICIENCY-TRIAD',
      'AE-PROMPT-CONDITIONING',
      'AE-STABILITY-RECEIPT',
      'AE-BLIND-CUSTODY',
      'AE-PERTURBATION-INVARIANCE'
    ], {
      fractures: [
        stabilityStatus === 'pending-stage2-measurement' ? 'Stage 2 recurrence measurements unavailable.' : null,
        evidence.blind_custody_challenge ? null : 'Blind Custody Challenge not run; research-gated.',
        evidence.perturbation_invariance ? null : 'Perturbation Invariance Mapping not run; research-gated.'
      ].filter(Boolean)
    }),
    interpretive_salience: section('interpretive_salience', 'constituted-with-null-findings', [
      'AE-WITHIN-LANE-INVARIANTS',
      'AE-CROSS-LANE-INVARIANTS',
      'AE-PROMPT-CONDITIONING',
      'AE-BLIND-CUSTODY',
      'AE-PERTURBATION-INVARIANCE'
    ], {
      strongest_invariant: null,
      widest_lane_divergence: null,
      most_recurrent_surface_marker: null,
      strongest_productive_contradiction: null,
      strongest_blind_return: null,
      strongest_recovery_pattern: null,
      largest_uncertainty: 'Stage 2 recurrence evidence has not yet populated the Stage 1 report constitution.',
      unsupported_inference_blocked: 'Identity, ownership, personality, demographic, trauma, intelligence, resilience, and mental-state inferences remain outside the claim ceiling.'
    }),
    claim_ceiling: section('claim_ceiling', 'active', [], {
      supported_claim: 'The packet records versioned, packet-internal stylometric evidence and its declared provenance under the available measurement state.',
      prohibited_claims: [
        'civil or legal identity proof',
        'exclusive ownership proof',
        'universal authorship attribution',
        'third-party text adjudication',
        'psychological or demographic inference'
      ]
    })
  };
  const report = {
    schema_version: GEN3_REPORT_SCHEMA,
    report_version: options.reportVersion || 'stage1-constitution/v1',
    evidence_links: evidenceLinks,
    section_order: GEN3_REPORT_SECTION_ORDER.slice(),
    sections,
    interpretation_provenance: {
      schema_version: GEN3_INTERPRETATION_SCHEMA,
      interpreter_class: options.interpreterClass || 'bounded-deterministic-report-assembler',
      interpretation_version: options.interpretationVersion || 'stage1-constitution/v1',
      generated_from_hash_covered_evidence: true,
      revisable_without_native_packet_hash_migration: true,
      raw_text_consumed: false,
      external_identity_data_consumed: false,
      claim_ceiling_enforced: true
    }
  };
  report.evidence_link_audit = validateReportEvidenceLinks(report);
  report.anti_flattery_audit = auditGenericReportLanguage({
    sections: report.sections,
    interpretation_provenance: report.interpretation_provenance
  });
  return Object.freeze(report);
}

export function attachGen3ReportContract(packet = {}, options = {}) {
  if (!isObject(packet) || packet.schema_version !== 'td613.safe-harbor.packet/v1') return packet;
  const out = clone(packet);
  out.forensic_authorship = isObject(out.forensic_authorship) ? out.forensic_authorship : {};
  out.forensic_authorship.schema_version = out.forensic_authorship.schema_version || 'td613.safe-harbor.forensic-authorship/v1';
  out.forensic_authorship.gen3_report_contract = buildGen3ReportContract(out, options);
  return out;
}
