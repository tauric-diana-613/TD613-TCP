// A bounded diagnostic projection. It carries neither a candidate answer nor
// an admission capability; the original reply remains separate held evidence.
const explanations = Object.freeze({
  RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION: 'Backup retention permission was promoted to an observed or configured persistence claim.',
  RETENTION_CONFIGURATION_ASSERTED_WITHOUT_WITNESS: 'Missing configuration evidence was promoted to a claim that no retention duration is configured.',
  FINITE_PILOT_PROMOTED_TO_HARD_BOUND: 'A finite pilot was promoted to a hard throughput limit.',
  PILOT_CONDITIONS_ASSERTED_WITHOUT_WITNESS: 'Pilot conditions were invented. Use the reported 9 GB, 26 minutes and two retries; label projection assumptions.',
  DELETION_VIOLATION_ASSERTED_WITHOUT_WITNESS: 'A contractual retention gap was promoted to an actual deletion violation. Request an amendment and dated deletion evidence.',
  INCIDENT_EFFECT_ASSERTED_WITHOUT_WITNESS: 'Duplicate downstream work was asserted without an independent effect witness.',
  UNSUPPORTED_PRIVACY_GUARANTEE: 'Privacy was guaranteed beyond the observed boundary.'
});
const text = (value,max) => typeof value === 'string' ? value.slice(0,max) : '';
export function projectLoomEvidenceReview(value) {
  if (value?.schema !== 'td613.loom.evidence-review/v0.1' || value.status !== 'REVIEW_REQUIRED' || value.blocks_reuse !== true || !Array.isArray(value.conflicts)) return null;
  const conflicts = value.conflicts.slice(0,8).filter(item => item && Object.hasOwn(explanations,item.code)).map(item => ({
    code:item.code, excerpt:text(item.excerpt,600), explanation:explanations[item.code],
    ...(item.inspection_profile === 'nfkd-mark-format-inspection/v1' && typeof item.inspection_excerpt === 'string'
      ? {inspection_profile:item.inspection_profile,inspection_excerpt:text(item.inspection_excerpt,600)} : {})
  }));
  if (!conflicts.length) return null;
  return {schema:value.schema,status:'REVIEW_REQUIRED',blocks_reuse:true,
    semantic_correctness_verified:false,scope:'Listed claim patterns only; absence of a match does not validate an answer.',conflicts};
}
export function isLoomEvidenceHold(value) {
  return value?.error === 'ANSWER_EVIDENCE_CONFLICT' || value?.diagnostic?.code === 'ANSWER_EVIDENCE_CONFLICT';
}
export function loomEvidenceHoldSummary(value) {
  if (!isLoomEvidenceHold(value)) return null;
  const review = projectLoomEvidenceReview(value.evidence_review);
  const provider = value.native_reply?.receipt?.provider || value.receipt?.provider;
  const completed = value.provider_completed === true || provider?.completion?.complete === true;
  const attempts = Array.isArray(provider?.attempts) ? provider.attempts.slice(0,6) : [];
  const elapsed = value.native_reply?.receipt?.elapsedMs ?? value.receipt?.elapsedMs;
  return {
    title:completed ? 'Reply received · Loom admission held' : 'Loom answer held for evidence review',
    explanation:review?.conflicts[0]?.explanation || 'A listed evidence claim needs review. The earlier bound result remains current.',
    review,completed,attempts:attempts.length,
    ...(Number.isFinite(elapsed)&&elapsed>=0 ? {elapsedSeconds:Math.round(elapsed/100)/10} : {})
  };
}
