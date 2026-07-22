import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';
import {
  blindCustodyContainsRawText,
  runBlindCustodyChallenge
} from './safe-harbor-gen3-blind-custody.js';
import {
  restorativeContainsRawText,
  runRestorativeStylodynamics
} from './safe-harbor-gen3-restorative-stylodynamics.js';

export const RESEARCH_TRACK_R_SCHEMA = 'td613.safe-harbor.research-track-r/v1';
export const RESEARCH_TRACK_R_POLICY = 'td613.safe-harbor.research-track-r-policy/v1';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

async function sha256Hex(value) {
  const source = String(value || '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}

async function taggedDigest(value) {
  return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`;
}

function requiredPromotionBlockers(blind, restorative, options) {
  const blockers = [];
  if (options.researchMode !== true || options.explicitConsent !== true) blockers.push('research-gate-closed');
  const calibrationTriadCount = Number(options.calibrationTriadCount || 0);
  if (calibrationTriadCount < 12) blockers.push('calibration-triads-below-12');
  if (blind?.results?.outcome === 'CONTAMINATED') blockers.push('blind-custody-contaminated');
  if (blind?.results?.outcome === 'PROMPT-DOMINATED') blockers.push('blind-custody-prompt-dominated');
  if (blind?.results?.outcome === 'IMITATION-COLLISION') blockers.push('blind-custody-imitation-collision');
  if (restorative?.promotion_gate?.blockers?.length) {
    for (const blocker of restorative.promotion_gate.blockers) blockers.push(`restorative:${blocker}`);
  }
  if (blindCustodyContainsRawText(blind) || restorativeContainsRawText(restorative)) blockers.push('raw-text-boundary-failure');
  return Array.from(new Set(blockers));
}

export async function runResearchTrackR(input = {}, options = {}) {
  const shared = {
    researchMode: options.researchMode === true,
    explicitConsent: options.explicitConsent === true,
    calibrationTriadCount: Number(options.calibrationTriadCount || 0),
    createdAtUtc: options.createdAtUtc || null
  };
  const blind = await runBlindCustodyChallenge(input.blind_custody || {}, {
    ...shared,
    ...(options.blindCustody || {}),
    packetHash: options.packetHash || options.blindCustody?.packetHash || '',
    selectionNonce: options.selectionNonce || options.blindCustody?.selectionNonce || ''
  });
  const restorative = await runRestorativeStylodynamics(input.restorative_stylodynamics || {}, {
    ...shared,
    ...(options.restorativeStylodynamics || {})
  });
  const blockers = requiredPromotionBlockers(blind, restorative, options);
  const core = {
    schema_version: RESEARCH_TRACK_R_SCHEMA,
    policy_version: RESEARCH_TRACK_R_POLICY,
    protocol_state: {
      code_complete: true,
      research_mode: shared.researchMode,
      explicit_consent_recorded: shared.explicitConsent,
      baseline_intake_mandatory: false,
      separately_invoked: true,
      baseline_pipeline_integration: false,
      feature_gate_required: true,
      production_deployment_authorized: false,
      promotion_pr_required: true,
      serverless_functions_added: 0,
      raw_text_exported: false,
      keystroke_telemetry_collected: false,
      pause_timing_collected: false,
      covert_behavioral_biometrics_collected: false,
      private_vulnerability_targeting: false,
      adaptive_emotional_pressure: false,
      external_identity_data_consumed: false
    },
    blind_custody_challenge: blind,
    restorative_stylodynamics: restorative,
    adverse_result_registry: {
      blind_outcome: blind.results.outcome,
      blind_failures: clone(blind.failure_registry || []),
      restorative_failures: clone(restorative.failure_registry || []),
      blind_imitation_collision: blind.results.imitation_collision === true,
      restorative_mimicry_collision: restorative.mimicry_under_deformation?.imitation_collision === true,
      renderer_may_suppress_adverse_results: false,
      raw_text_included: false
    },
    calibration_gate: {
      observed_triads: shared.calibrationTriadCount,
      required_triads: 12,
      blockers,
      state: blockers.length ? 'CODE-COMPLETE-UNPROMOTED' : 'PROMOTION-ELIGIBLE-FOR-SEPARATE-PR',
      promotion_decision: blockers.length ? 'WITHHELD' : 'NOT-YET-REQUESTED',
      production_deployment_authorized: false,
      baseline_intake_promotion_authorized: false,
      separate_promotion_pr_required: true
    },
    claim_ceiling: {
      supported: 'Packet-scoped blinded holdout and response-trajectory evidence under declared research controls.',
      prohibited: [
        'civil or legal identity proof',
        'exclusive ownership proof',
        'universal authorship attribution',
        'third-party text adjudication',
        'direct access to cognition',
        'personality, trauma, intelligence, resilience, demographic, diagnostic, or mental-state inference',
        'unforgeable authorship or response signature'
      ]
    },
    raw_text_included: false
  };
  return { ...core, research_track_digest: await taggedDigest(core) };
}

export function attachResearchTrackR(packet = {}, researchResult = {}, options = {}) {
  if (!isObject(packet) || packet.schema_version !== 'td613.safe-harbor.packet/v1') return packet;
  if (options.researchMode !== true || options.explicitConsent !== true) {
    const held = clone(packet);
    held.bridge = isObject(held.bridge) ? held.bridge : {};
    held.bridge.export_gate = isObject(held.bridge.export_gate) ? held.bridge.export_gate : {};
    held.bridge.export_gate.ready = false;
    held.bridge.export_gate.state = 'research-gate-held';
    held.bridge.export_gate.blockers = Array.from(new Set([
      ...(held.bridge.export_gate.blockers || []),
      'research-mode-and-explicit-consent-required'
    ]));
    return held;
  }
  const out = clone(packet);
  out.authorship_evidence = isObject(out.authorship_evidence) ? out.authorship_evidence : {};
  out.authorship_evidence.blind_custody_challenge = clone(researchResult.blind_custody_challenge || null);
  out.authorship_evidence.perturbation_invariance = clone(researchResult.restorative_stylodynamics || null);
  out.authorship_evidence.research_track_r = {
    schema_version: researchResult.schema_version || RESEARCH_TRACK_R_SCHEMA,
    policy_version: researchResult.policy_version || RESEARCH_TRACK_R_POLICY,
    research_track_digest: researchResult.research_track_digest || null,
    protocol_state: clone(researchResult.protocol_state || {}),
    adverse_result_registry: clone(researchResult.adverse_result_registry || {}),
    calibration_gate: clone(researchResult.calibration_gate || {}),
    claim_ceiling: clone(researchResult.claim_ceiling || {}),
    raw_text_included: false
  };
  return out;
}

export function researchTrackRContainsRawText(value = {}) {
  return /"(?:raw_text|source_text|entrant_text|window_text|prompt_text|text)"\s*:/u.test(stableCanonicalJson(value));
}
