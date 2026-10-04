/**
 * TD613 Dollhouse Closure Auditor
 * Enforces empirical grounding and prevents narrative overclaim/inflation.
 * 
 * Laws:
 *   DEPLOYED != COMPLETE
 *   SMOKE WITNESS != ROUTE WITNESS
 *   ROUTE CONTRACT != LIVE ROUTE
 *   PROVIDER CAPABILITY != LIVE PROVIDER OBSERVATION
 *   STRONG PARTIAL EVIDENCE != CLOSURE
 *   CONTINUATION_2_STAGED != CONTINUATION_2_COMPLETED
 *   SCREENSHOT_OF_RESPONSE_SURFACE != NETWORK_RESPONSE
 *   C1_RECEIPT_EXISTS != C2_PREDECESSOR_VERIFIED
 *   RETURN_URL_HASH != RETURN_WORKSPACE_ADMITTED
 *   #return-review != journeyState:return
 *   builderVisible != returnWorkspaceVisible
 *   HISTORICAL FINDING != SAME_EPISODE OBSERVATION
 */

export const CLOSURE_AUDIT_SCHEMA = 'td613.dollhouse.closure-audit/v1.0';

export function auditDollhouseClosure({
  closureReport,
  episodeObservatory,
  disagreementLedger,
  currentSourceMetrics = { farCarrierOpacity: 0.20, governorEarlyCatchCleaned: true }
}) {
  const infractions = [];

  if (!closureReport || typeof closureReport !== 'object') {
    throw new TypeError('closureReport object required');
  }

  // 1. Continuation #2 Network Response Check
  const c2Stage = closureReport.stages?.find(s => s.name === '06_continuation2_dispatch');
  const c2Status = c2Stage?.summary?.status;
  const c2HasNetwork = c2Status && c2Status !== 'NO_NETWORK_RESPONSE';

  if (!c2HasNetwork && closureReport.verdict === 'COMPLETED') {
    infractions.push({
      code: 'ERR_C2_NO_NETWORK_OVERCLAIM',
      message: 'Verdict cannot be COMPLETED when Continuation #2 has NO_NETWORK_RESPONSE.',
      evidence: { c2Status, declaredVerdict: closureReport.verdict }
    });
  }

  // 2. Predecessor Binding Verification Check
  const predecessorVerified = Boolean(closureReport.predecessor_proof?.predecessor_binding_verified);
  if (!predecessorVerified && closureReport.verdict === 'COMPLETED') {
    infractions.push({
      code: 'ERR_PREDECESSOR_UNVERIFIED_OVERCLAIM',
      message: 'Verdict cannot be COMPLETED when predecessor binding is unverified.',
      evidence: { predecessorVerified, declaredVerdict: closureReport.verdict }
    });
  }

  // 3. Return Workspace Admittance Check
  const returnStage = closureReport.stages?.find(s => s.name === '07_loom_return');
  const returnWorkspaceVisible = Boolean(returnStage?.summary?.returnWorkspaceVisible);
  const journeyState = returnStage?.summary?.journeyState;

  if (!returnWorkspaceVisible && closureReport.verdict === 'COMPLETED') {
    infractions.push({
      code: 'ERR_RETURN_WORKSPACE_NOT_ADMITTED',
      message: 'Return workspace was not visible in empirical observation; route did not admit Return.',
      evidence: { returnWorkspaceVisible, journeyState, declaredVerdict: closureReport.verdict }
    });
  }

  if (journeyState !== 'return' && closureReport.verdict === 'COMPLETED') {
    infractions.push({
      code: 'ERR_JOURNEY_STATE_NOT_RETURN',
      message: `Return scene reached URL hash without journeyState='return' (actual: '${journeyState}').`,
      evidence: { journeyState, declaredVerdict: closureReport.verdict }
    });
  }

  // 4. Provider Classification Completeness Check
  const providerClass = closureReport.provider_classification;
  if (!providerClass && closureReport.verdict === 'COMPLETED') {
    infractions.push({
      code: 'ERR_PROVIDER_CLASSIFICATION_NULL',
      message: 'Provider classification is null; empirical provider status must be explicitly classified.',
      evidence: { provider_classification: providerClass }
    });
  }

  // 5. Same-Episode Observatory Grounding Checks
  if (episodeObservatory && episodeObservatory.observers) {
    // Atlas check
    const atlasPhase2 = episodeObservatory.observers.ATLAS?.observations?.phase2_marrowline;
    if (atlasPhase2?.status === 'PASS' && !c2HasNetwork) {
      infractions.push({
        code: 'ERR_OBSERVATORY_CONTRADICTS_EPISODE_ATLAS',
        message: 'Episode Observatory claims Atlas Phase 2 PASS, but episode payload recorded NO_NETWORK_RESPONSE.',
        evidence: { declaredStatus: atlasPhase2.status, actualC2Status: c2Status }
      });
    }

    // Historical Fact Contamination: Carrier Opacity
    const apertureObs = JSON.stringify(episodeObservatory.observers.APERTURE || {});
    if (apertureObs.includes('0.035') && currentSourceMetrics.farCarrierOpacity === 0.20) {
      infractions.push({
        code: 'ERR_HISTORICAL_OPACITY_CONTAMINATION',
        message: 'Episode Observatory reports far carrier opacity as 0.035, which is a pre-#1428 historical finding. Current deployed source is 0.20.',
        evidence: { reportedOpacity: '0.035', currentSource: currentSourceMetrics.farCarrierOpacity }
      });
    }
  }

  // 6. Historical Defect Contamination: Governor Leak
  if (disagreementLedger && disagreementLedger.disagreements) {
    const govItem = disagreementLedger.disagreements.find(d => d.coordinate === 'governor_lifecycle_leak_in_error_branch');
    if (govItem && govItem.orchestrator_decision !== 'HISTORICAL_DEFECT_RESOLVED' && currentSourceMetrics.governorEarlyCatchCleaned) {
      infractions.push({
        code: 'ERR_HISTORICAL_GOVERNOR_CONTAMINATION',
        message: 'Disagreement Ledger reports server governor leak as an active defect requiring repair, but defect was already repaired in #1428 with binding?.governor?.close().',
        evidence: { reportedDecision: govItem.orchestrator_decision }
      });
    }
  }

  // 7. Witness Timeout Ceiling Check (ASSAY_TIMEOUT != PRODUCT_TIMEOUT)
  const witnessTimeout = closureReport.environment?.witness_timeout_ms;
  const productClientTimeout = closureReport.environment?.product_client_timeout_ms || 225000;
  if (typeof witnessTimeout === 'number' && witnessTimeout < productClientTimeout) {
    infractions.push({
      code: 'ERR_WITNESS_TIMEOUT_BELOW_PRODUCT_TIMEOUT',
      message: `Witness timeout (${witnessTimeout}ms) is less than product client timeout (${productClientTimeout}ms). ASSAY_TIMEOUT != PRODUCT_TIMEOUT.`,
      evidence: { witnessTimeout, productClientTimeout }
    });
  }

  // 8. Observer Return Mutation Check (OBSERVER MUTATION != OBSERVED PRODUCT EVENT)
  const returnSummary = returnStage?.summary;
  if (returnSummary?.observer_mutated_hash === true) {
    infractions.push({
      code: 'ERR_OBSERVER_MUTATED_RETURN_STATE',
      message: 'Observer deliberately mutated URL hash to manufacture Return state. OBSERVER MUTATION != OBSERVED PRODUCT EVENT.',
      evidence: { observer_mutated_hash: true }
    });
  }

  // 9. Predecessor Digest Derivation Check (REQUEST_DIGEST != STAGE_RECEIPT_DIGEST)
  const predProof = closureReport.predecessor_proof;
  if (predProof?.c1_receipt_digest_source === 'request_digest' || predProof?.algorithm === 'request_digest') {
    infractions.push({
      code: 'ERR_PREDECESSOR_DIGEST_AIMED_AT_REQUEST_DIGEST',
      message: 'Predecessor verifier derived C1 digest from request_digest instead of stage receipt digest. REQUEST_DIGEST != STAGE_RECEIPT_DIGEST.',
      evidence: { algorithm: predProof.algorithm || predProof.c1_receipt_digest_source }
    });
  }

  // 10. Content Predecessor Contradiction Check (RECEIPT_ANCESTRY != CONTENT_ANCESTRY)
  if (predProof?.content_predecessor_verified === true) {
    const expectedContent = predProof?.expected_content_predecessor_digest;
    const actualContent = predProof?.actual_content_predecessor_digest;
    if (!actualContent || actualContent !== expectedContent) {
      infractions.push({
        code: 'ERR_CONTENT_PREDECESSOR_CONTRADICTION',
        message: 'Report claims content_predecessor_verified=true, but actual_content_predecessor_digest is null or does not match expected_content_predecessor_digest. RECEIPT_ANCESTRY != CONTENT_ANCESTRY.',
        evidence: { expectedContent, actualContent }
      });
    }
  }

  const passed = infractions.length === 0;
  const auditVerdict = passed
    ? (closureReport.verdict === 'COMPLETED' ? 'CLOSURE_ADMITTED' : 'EVIDENCE_ALIGNED_HELD')
    : 'CLOSURE_REJECTED';

  const isCompleted = closureReport.verdict === 'COMPLETED';
  const layeredClosureScope = {
    transport_route_closure: isCompleted && returnWorkspaceVisible && journeyState === 'return'
      ? 'PROVEN_LIVE_PRODUCTION'
      : (returnStage?.summary ? 'HELD' : 'UNMEASURED'),
    receipt_ancestry_closure: predecessorVerified
      ? 'PROVEN_LIVE_PRODUCTION'
      : 'HELD',
    content_ancestry_closure: predProof?.content_predecessor_verified === true
      ? 'PROVEN_LIVE_PRODUCTION'
      : 'NOT_APPLICABLE_UNDER_MODEL_A',
    return_review_closure: isCompleted && returnWorkspaceVisible && journeyState === 'return'
      ? 'PROVEN_LIVE_PRODUCTION'
      : 'HELD',
    local_custody_admission: 'HELD',
    receipt_signature_verification: 'UNVERIFIED',
    physical_device_evidence: 'UNMEASURED',
    human_comprehension: 'UNMEASURED'
  };

  return {
    schema: CLOSURE_AUDIT_SCHEMA,
    audited_at: new Date().toISOString(),
    verdict: auditVerdict,
    passed,
    infraction_count: infractions.length,
    infractions,
    layered_closure_scope: layeredClosureScope
  };
}
