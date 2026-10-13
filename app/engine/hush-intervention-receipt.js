import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, randomId, text } from './aperture-v31-core.js';
import { inspectHushAuthority, inspectHushRebuild } from './hush-intervention-authority.js';
import {
  HUSH_INTERVENTION_DOMAINS,
  HUSH_INTERVENTION_RECEIPT_SCHEMA,
  sealHushRecord,
  verifyHushRecord
} from './hush-intervention-common.js';
import { verifyHushInterventionEnsemble } from './hush-intervention-ensemble.js';
import {
  evaluateHushFindings,
  normalizeLiteralFindings,
  normalizePropositionFindings
} from './hush-intervention-findings.js';
import { deriveHushInterventionState } from './hush-intervention-state.js';
import { evaluateHushTrials, normalizeHushTrials } from './hush-intervention-trials.js';
import { HUSH_INTERVENTION_VOCABULARY_VERSION } from './hush-intervention-vocabulary.js';

export async function compileHushInterventionReceipt(input = {}, options = {}) {
  const ensemble = input.ensemble;
  const ensembleVerified = await verifyHushInterventionEnsemble(ensemble, options);
  const authority = ensembleVerified
    ? await inspectHushAuthority({
        ...input,
        caseId: ensemble.case_id,
        caseMapDigest: ensemble.case_map_digest,
        routeMemoryDigest: ensemble.route_memory_digest
      }, options)
    : Object.freeze({ verified: false, permission: Object.freeze({ authorized: false }) });
  const rebuild = ensembleVerified
    ? await inspectHushRebuild({
        ...input,
        caseId: ensemble.case_id,
        caseMapDigest: ensemble.case_map_digest,
        routeMemoryDigest: ensemble.route_memory_digest
      }, options)
    : Object.freeze({ verified: false, bound: false });

  const candidateBody = text(input.candidateBody, 'Hush intervention candidate');
  const candidateDigest = await canonicalDigest(
    HUSH_INTERVENTION_DOMAINS.candidate,
    { body: candidateBody },
    options
  );
  const propositionFindings = normalizePropositionFindings(input.propositionFindings || []);
  const literalFindings = normalizeLiteralFindings(input.literalFindings || []);
  const findings = evaluateHushFindings(ensemble, propositionFindings, literalFindings);
  const transformationHistory = clone(input.transformationHistory || []);
  const trials = normalizeHushTrials(input.trials || [], ensemble, candidateDigest);
  const trialEvaluation = evaluateHushTrials(trials, ensemble, transformationHistory);
  const sourceDriftState = String(input.sourceDriftState || 'SOURCE_HELD').toUpperCase();
  const promptInjectionState = String(input.promptInjectionState || 'CLEAR').toUpperCase();
  const providerDraftUsed = input.providerDraftUsed === true;
  const derived = deriveHushInterventionState({
    ensembleVerified,
    authorityVerified: authority.verified,
    authorityAuthorized: authority.permission.authorized,
    authorityReferenceMatches: input.authorityContext?.receipt_id === ensemble?.authority_context_reference,
    rebuildBound: rebuild.bound,
    rebuildDigestMatches: input.rebuildReceipt?.test_digest === ensemble?.rebuild_receipt_digest,
    propositionDrift: findings.propositionDrift,
    literalDrift: findings.literalDrift,
    sourceDriftState,
    readerSetHeld: trialEvaluation.readerSetHeld,
    enoughData: trialEvaluation.enoughData,
    promptInjectionState,
    providerDraftUsed,
    providerLogParity: input.providerLogParity === true,
    providerReceiptDigest: input.providerReceiptDigest,
    providerCandidateDigest: input.providerCandidateDigest,
    candidateDigest
  });

  return sealHushRecord(HUSH_INTERVENTION_DOMAINS.receipt, {
    schema: HUSH_INTERVENTION_RECEIPT_SCHEMA,
    receipt_id: input.receiptId || randomId('hush_intervention_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    ensemble_reference: ensemble?.ensemble_id || null,
    ensemble_digest: ensemble?.ensemble_digest || null,
    vocabulary_version: ensemble?.vocabulary_version || HUSH_INTERVENTION_VOCABULARY_VERSION,
    case_id: ensemble?.case_id || null,
    case_map_digest: ensemble?.case_map_digest || null,
    route_memory_digest: ensemble?.route_memory_digest || null,
    authority_context_reference: input.authorityContext?.receipt_id || null,
    authority_context_digest: input.authorityContext?.authority_context_digest || null,
    rebuild_receipt_reference: input.rebuildReceipt?.test_id || null,
    rebuild_receipt_digest: input.rebuildReceipt?.test_digest || null,
    intervention_id: String(input.interventionId || ensemble?.interventions?.[0]?.intervention_id || ''),
    candidate_digest: candidateDigest,
    candidate_status: 'UNKEPT_CANDIDATE',
    candidate_kept: false,
    source_drift_state: sourceDriftState,
    prompt_injection_state: promptInjectionState,
    proposition_findings: propositionFindings,
    protected_literal_findings: literalFindings,
    transformation_history: transformationHistory,
    trials,
    componentwise_comparison: clone(input.componentwiseComparison || {}),
    universal_score: null,
    provider_draft_used: providerDraftUsed,
    provider_receipt_digest: providerDraftUsed ? String(input.providerReceiptDigest || '') : null,
    provider_log_parity: derived.providerParity,
    intervention_state: derived.state,
    holds: derived.holds,
    next_required_passages: ['LOCAL_REBUILD', 'LOCAL_REVIEW', 'ASH_RELEASE_AUTHORIZATION'],
    local_rebuild_required: true,
    review_required: true,
    ash_release_authorization_required: true,
    readers_executed_by_receipt_compiler: false,
    provider_call_performed_by_receipt_compiler: false,
    network_called: false,
    storage_mutated: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    recommendation_not_command: true,
    receipt_digest: null
  }, 'receipt_digest', options);
}

export const verifyHushInterventionReceipt = (value, options = {}) => verifyHushRecord(
  HUSH_INTERVENTION_DOMAINS.receipt,
  value,
  'receipt_digest',
  HUSH_INTERVENTION_RECEIPT_SCHEMA,
  options
);
